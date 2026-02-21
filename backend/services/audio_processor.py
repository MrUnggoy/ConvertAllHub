import io
import tempfile
import os
from typing import Dict, Any, Optional, Tuple
from pathlib import Path
import ffmpeg
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from .progress_tracker import progress_tracker

logger = logging.getLogger(__name__)

class AudioProcessor:
    """Server-side audio processing service using FFmpeg"""
    
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    async def convert_format(
        self,
        audio_data: bytes,
        output_format: str,
        bitrate: Optional[int] = None,
        sample_rate: Optional[int] = None,
        channels: Optional[int] = None,
        task_id: Optional[str] = None,
        filename: Optional[str] = None
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Convert audio between formats using FFmpeg"""
        try:
            # Create progress tracking if task_id provided
            if task_id and filename:
                progress_tracker.create_task(
                    task_id,
                    "audio_conversion",
                    filename,
                    total_steps=100,
                    metadata={"output_format": output_format, "bitrate": bitrate}
                )
                progress_tracker.update_progress(task_id, 10, "Starting audio conversion...")
            
            # Run FFmpeg conversion in thread pool
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                self._convert_audio_sync,
                audio_data,
                output_format,
                bitrate,
                sample_rate,
                channels,
                task_id
            )
            
            if task_id:
                progress_tracker.update_progress(task_id, 100, "Audio conversion completed")
            
            return result
            
        except Exception as e:
            if task_id:
                progress_tracker.fail_task(task_id, str(e))
            logger.error(f"Audio format conversion failed: {e}")
            raise
    
    def _convert_audio_sync(
        self,
        audio_data: bytes,
        output_format: str,
        bitrate: Optional[int] = None,
        sample_rate: Optional[int] = None,
        channels: Optional[int] = None,
        task_id: Optional[str] = None
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Synchronous audio conversion using FFmpeg"""
        
        with tempfile.NamedTemporaryFile(delete=False) as input_file:
            input_file.write(audio_data)
            input_path = input_file.name
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{output_format}') as output_file:
            output_path = output_file.name
        
        try:
            if task_id:
                progress_tracker.update_progress(task_id, 20, "Analyzing audio file...")
            
            # Build FFmpeg command
            stream = ffmpeg.input(input_path)
            
            # Apply audio filters and settings
            audio_args = {}
            if bitrate:
                audio_args['audio_bitrate'] = f'{bitrate}k'
            if sample_rate:
                audio_args['ar'] = sample_rate
            if channels:
                audio_args['ac'] = channels
            
            # Set codec based on output format
            if output_format.lower() == 'mp3':
                audio_args['acodec'] = 'libmp3lame'
            elif output_format.lower() == 'wav':
                audio_args['acodec'] = 'pcm_s16le'
            elif output_format.lower() == 'flac':
                audio_args['acodec'] = 'flac'
            elif output_format.lower() == 'aac':
                audio_args['acodec'] = 'aac'
            elif output_format.lower() == 'ogg':
                audio_args['acodec'] = 'libvorbis'
            
            if task_id:
                progress_tracker.update_progress(task_id, 40, "Converting audio format...")
            
            # Run conversion
            stream = ffmpeg.output(stream, output_path, **audio_args)
            ffmpeg.run(stream, overwrite_output=True, quiet=True)
            
            if task_id:
                progress_tracker.update_progress(task_id, 80, "Finalizing conversion...")
            
            # Read converted file
            with open(output_path, 'rb') as f:
                converted_data = f.read()
            
            # Get audio info
            probe = ffmpeg.probe(output_path)
            audio_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'audio'), None)
            
            metadata = {
                'format': output_format,
                'duration': float(probe['format']['duration']),
                'size': len(converted_data),
                'bitrate': audio_stream.get('bit_rate', 'unknown') if audio_stream else 'unknown',
                'sample_rate': audio_stream.get('sample_rate', 'unknown') if audio_stream else 'unknown',
                'channels': audio_stream.get('channels', 'unknown') if audio_stream else 'unknown',
                'codec': audio_stream.get('codec_name', 'unknown') if audio_stream else 'unknown'
            }
            
            logger.info(f"Converted audio to {output_format.upper()}, duration: {metadata['duration']:.2f}s")
            return converted_data, metadata
            
        finally:
            # Clean up temporary files
            try:
                os.unlink(input_path)
                os.unlink(output_path)
            except OSError:
                pass
    
    async def extract_from_video(
        self,
        video_data: bytes,
        output_format: str = 'mp3',
        start_time: Optional[float] = None,
        duration: Optional[float] = None,
        bitrate: Optional[int] = None
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Extract audio from video file"""
        try:
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                self._extract_audio_sync,
                video_data,
                output_format,
                start_time,
                duration,
                bitrate
            )
            return result
            
        except Exception as e:
            logger.error(f"Audio extraction from video failed: {e}")
            raise
    
    def _extract_audio_sync(
        self,
        video_data: bytes,
        output_format: str,
        start_time: Optional[float] = None,
        duration: Optional[float] = None,
        bitrate: Optional[int] = None
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Synchronous audio extraction from video"""
        
        with tempfile.NamedTemporaryFile(delete=False) as input_file:
            input_file.write(video_data)
            input_path = input_file.name
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{output_format}') as output_file:
            output_path = output_file.name
        
        try:
            # Build FFmpeg command for audio extraction
            stream = ffmpeg.input(input_path)
            
            # Apply time constraints if specified
            if start_time is not None:
                stream = ffmpeg.input(input_path, ss=start_time)
            
            audio_args = {'vn': None}  # No video
            
            if duration is not None:
                audio_args['t'] = duration
            
            if bitrate:
                audio_args['audio_bitrate'] = f'{bitrate}k'
            
            # Set audio codec
            if output_format.lower() == 'mp3':
                audio_args['acodec'] = 'libmp3lame'
            elif output_format.lower() == 'wav':
                audio_args['acodec'] = 'pcm_s16le'
            elif output_format.lower() == 'flac':
                audio_args['acodec'] = 'flac'
            elif output_format.lower() == 'aac':
                audio_args['acodec'] = 'aac'
            
            stream = ffmpeg.output(stream, output_path, **audio_args)
            ffmpeg.run(stream, overwrite_output=True, quiet=True)
            
            # Read extracted audio
            with open(output_path, 'rb') as f:
                audio_data = f.read()
            
            # Get metadata
            probe = ffmpeg.probe(output_path)
            audio_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'audio'), None)
            
            metadata = {
                'format': output_format,
                'extracted_duration': float(probe['format']['duration']),
                'size': len(audio_data),
                'start_time': start_time or 0,
                'requested_duration': duration,
                'bitrate': audio_stream.get('bit_rate', 'unknown') if audio_stream else 'unknown',
                'sample_rate': audio_stream.get('sample_rate', 'unknown') if audio_stream else 'unknown',
                'channels': audio_stream.get('channels', 'unknown') if audio_stream else 'unknown'
            }
            
            logger.info(f"Extracted {metadata['extracted_duration']:.2f}s audio from video")
            return audio_data, metadata
            
        finally:
            try:
                os.unlink(input_path)
                os.unlink(output_path)
            except OSError:
                pass
    
    async def enhance_audio(
        self,
        audio_data: bytes,
        noise_reduction: bool = False,
        normalize: bool = True,
        bass_boost: int = 0,
        treble_boost: int = 0,
        volume: float = 1.0
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Enhance audio quality with various filters"""
        try:
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                self._enhance_audio_sync,
                audio_data,
                noise_reduction,
                normalize,
                bass_boost,
                treble_boost,
                volume
            )
            return result
            
        except Exception as e:
            logger.error(f"Audio enhancement failed: {e}")
            raise
    
    def _enhance_audio_sync(
        self,
        audio_data: bytes,
        noise_reduction: bool,
        normalize: bool,
        bass_boost: int,
        treble_boost: int,
        volume: float
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Synchronous audio enhancement"""
        
        with tempfile.NamedTemporaryFile(delete=False) as input_file:
            input_file.write(audio_data)
            input_path = input_file.name
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as output_file:
            output_path = output_file.name
        
        try:
            stream = ffmpeg.input(input_path)
            
            # Build audio filter chain
            filters = []
            
            # Volume adjustment
            if volume != 1.0:
                filters.append(f'volume={volume}')
            
            # Bass boost (low-pass filter)
            if bass_boost > 0:
                filters.append(f'bass=g={bass_boost}')
            elif bass_boost < 0:
                filters.append(f'bass=g={bass_boost}')
            
            # Treble boost (high-pass filter)
            if treble_boost > 0:
                filters.append(f'treble=g={treble_boost}')
            elif treble_boost < 0:
                filters.append(f'treble=g={treble_boost}')
            
            # Noise reduction (simple high-pass filter)
            if noise_reduction:
                filters.append('highpass=f=200')
            
            # Normalization
            if normalize:
                filters.append('loudnorm')
            
            # Apply filters if any
            if filters:
                filter_chain = ','.join(filters)
                stream = ffmpeg.filter(stream, 'af', filter_chain)
            
            stream = ffmpeg.output(stream, output_path, acodec='pcm_s16le')
            ffmpeg.run(stream, overwrite_output=True, quiet=True)
            
            # Read enhanced audio
            with open(output_path, 'rb') as f:
                enhanced_data = f.read()
            
            # Get metadata
            probe = ffmpeg.probe(output_path)
            audio_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'audio'), None)
            
            metadata = {
                'format': 'wav',
                'duration': float(probe['format']['duration']),
                'size': len(enhanced_data),
                'enhancements_applied': {
                    'noise_reduction': noise_reduction,
                    'normalize': normalize,
                    'bass_boost': bass_boost,
                    'treble_boost': treble_boost,
                    'volume_adjustment': volume
                },
                'sample_rate': audio_stream.get('sample_rate', 'unknown') if audio_stream else 'unknown',
                'channels': audio_stream.get('channels', 'unknown') if audio_stream else 'unknown'
            }
            
            logger.info("Enhanced audio with filters")
            return enhanced_data, metadata
            
        finally:
            try:
                os.unlink(input_path)
                os.unlink(output_path)
            except OSError:
                pass
    
    async def get_audio_info(self, audio_data: bytes) -> Dict[str, Any]:
        """Get audio file metadata and information"""
        try:
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                self._get_audio_info_sync,
                audio_data
            )
            return result
            
        except Exception as e:
            logger.error(f"Failed to get audio info: {e}")
            raise
    
    def _get_audio_info_sync(self, audio_data: bytes) -> Dict[str, Any]:
        """Synchronous audio info extraction"""
        
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(audio_data)
            temp_path = temp_file.name
        
        try:
            probe = ffmpeg.probe(temp_path)
            format_info = probe['format']
            audio_stream = next((stream for stream in probe['streams'] if stream['codec_type'] == 'audio'), None)
            
            info = {
                'format': format_info.get('format_name', 'unknown'),
                'duration': float(format_info.get('duration', 0)),
                'size': int(format_info.get('size', len(audio_data))),
                'bitrate': format_info.get('bit_rate', 'unknown'),
                'tags': format_info.get('tags', {})
            }
            
            if audio_stream:
                info.update({
                    'codec': audio_stream.get('codec_name', 'unknown'),
                    'sample_rate': audio_stream.get('sample_rate', 'unknown'),
                    'channels': audio_stream.get('channels', 'unknown'),
                    'channel_layout': audio_stream.get('channel_layout', 'unknown'),
                    'bits_per_sample': audio_stream.get('bits_per_raw_sample', 'unknown')
                })
            
            return info
            
        finally:
            try:
                os.unlink(temp_path)
            except OSError:
                pass