import io
import tempfile
import os
from typing import Dict, Any, Optional, Tuple, List
from pathlib import Path
import ffmpeg
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor
from .progress_tracker import progress_tracker

logger = logging.getLogger(__name__)

class VideoProcessor:
    """Server-side video processing service using FFmpeg"""
    
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=2)  # Video processing is CPU intensive
    
    async def convert_format(
        self,
        video_data: bytes,
        output_format: str,
        quality: str = 'medium',
        resolution: Optional[str] = None,
        fps: Optional[int] = None,
        video_codec: Optional[str] = None,
        audio_codec: Optional[str] = None,
        task_id: Optional[str] = None,
        filename: Optional[str] = None
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Convert video between formats using FFmpeg"""
        try:
            # Create progress tracking if task_id provided
            if task_id and filename:
                progress_tracker.create_task(
                    task_id,
                    "video_conversion",
                    filename,
                    total_steps=100,
                    metadata={"output_format": output_format, "quality": quality}
                )
                progress_tracker.update_progress(task_id, 5, "Starting video conversion...")
            
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                self._convert_video_sync,
                video_data,
                output_format,
                quality,
                resolution,
                fps,
                video_codec,
                audio_codec,
                task_id
            )
            
            if task_id:
                progress_tracker.update_progress(task_id, 100, "Video conversion completed")
            
            return result
            
        except Exception as e:
            if task_id:
                progress_tracker.fail_task(task_id, str(e))
            logger.error(f"Video format conversion failed: {e}")
            raise
    
    def _convert_video_sync(
        self,
        video_data: bytes,
        output_format: str,
        quality: str,
        resolution: Optional[str],
        fps: Optional[int],
        video_codec: Optional[str],
        audio_codec: Optional[str],
        task_id: Optional[str] = None
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Synchronous video conversion using FFmpeg"""
        
        with tempfile.NamedTemporaryFile(delete=False) as input_file:
            input_file.write(video_data)
            input_path = input_file.name
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{output_format}') as output_file:
            output_path = output_file.name
        
        try:
            if task_id:
                progress_tracker.update_progress(task_id, 10, "Analyzing video file...")
            
            stream = ffmpeg.input(input_path)
            
            # Video encoding settings
            video_args = {}
            audio_args = {}
            
            # Set video codec
            if not video_codec:
                if output_format.lower() in ['mp4', 'mov']:
                    video_codec = 'libx264'
                elif output_format.lower() == 'webm':
                    video_codec = 'libvpx-vp9'
                elif output_format.lower() == 'avi':
                    video_codec = 'libx264'
                else:
                    video_codec = 'libx264'
            
            video_args['vcodec'] = video_codec
            
            if task_id:
                progress_tracker.update_progress(task_id, 20, "Configuring video encoding...")
            
            # Set audio codec
            if not audio_codec:
                if output_format.lower() in ['mp4', 'mov']:
                    audio_codec = 'aac'
                elif output_format.lower() == 'webm':
                    audio_codec = 'libvorbis'
                elif output_format.lower() == 'avi':
                    audio_codec = 'mp3'
                else:
                    audio_codec = 'aac'
            
            audio_args['acodec'] = audio_codec
            
            # Quality settings
            if quality == 'low':
                video_args['crf'] = 28
                audio_args['audio_bitrate'] = '96k'
            elif quality == 'medium':
                video_args['crf'] = 23
                audio_args['audio_bitrate'] = '128k'
            elif quality == 'high':
                video_args['crf'] = 18
                audio_args['audio_bitrate'] = '192k'
            
            # Resolution scaling
            if resolution:
                video_args['vf'] = f'scale={resolution}'
            
            # Frame rate
            if fps:
                video_args['r'] = fps
            
            # Combine arguments
            output_args = {**video_args, **audio_args}
            
            if task_id:
                progress_tracker.update_progress(task_id, 30, "Starting video encoding...")
            
            stream = ffmpeg.output(stream, output_path, **output_args)
            ffmpeg.run(stream, overwrite_output=True, quiet=True)
            
            if task_id:
                progress_tracker.update_progress(task_id, 90, "Finalizing video conversion...")
            
            # Read converted video
            with open(output_path, 'rb') as f:
                converted_data = f.read()
            
            # Get video info
            probe = ffmpeg.probe(output_path)
            video_stream = next((s for s in probe['streams'] if s['codec_type'] == 'video'), None)
            audio_stream = next((s for s in probe['streams'] if s['codec_type'] == 'audio'), None)
            
            metadata = {
                'format': output_format,
                'duration': float(probe['format']['duration']),
                'size': len(converted_data),
                'quality': quality,
                'video_codec': video_stream.get('codec_name', 'unknown') if video_stream else 'none',
                'audio_codec': audio_stream.get('codec_name', 'unknown') if audio_stream else 'none',
                'resolution': f"{video_stream.get('width', 'unknown')}x{video_stream.get('height', 'unknown')}" if video_stream else 'unknown',
                'fps': video_stream.get('r_frame_rate', 'unknown') if video_stream else 'unknown',
                'bitrate': probe['format'].get('bit_rate', 'unknown')
            }
            
            logger.info(f"Converted video to {output_format.upper()}, duration: {metadata['duration']:.2f}s")
            return converted_data, metadata
            
        finally:
            try:
                os.unlink(input_path)
                os.unlink(output_path)
            except OSError:
                pass
    
    async def compress_video(
        self,
        video_data: bytes,
        compression_level: str = 'medium',
        target_size_mb: Optional[int] = None,
        max_resolution: Optional[str] = None,
        max_bitrate: Optional[str] = None
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Compress video file"""
        try:
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                self._compress_video_sync,
                video_data,
                compression_level,
                target_size_mb,
                max_resolution,
                max_bitrate
            )
            return result
            
        except Exception as e:
            logger.error(f"Video compression failed: {e}")
            raise
    
    def _compress_video_sync(
        self,
        video_data: bytes,
        compression_level: str,
        target_size_mb: Optional[int],
        max_resolution: Optional[str],
        max_bitrate: Optional[str]
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Synchronous video compression"""
        
        with tempfile.NamedTemporaryFile(delete=False) as input_file:
            input_file.write(video_data)
            input_path = input_file.name
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as output_file:
            output_path = output_file.name
        
        try:
            # Get original video info
            original_probe = ffmpeg.probe(input_path)
            original_duration = float(original_probe['format']['duration'])
            original_size = len(video_data)
            
            stream = ffmpeg.input(input_path)
            
            # Compression settings
            video_args = {'vcodec': 'libx264', 'acodec': 'aac'}
            
            # Set CRF based on compression level
            if compression_level == 'low':
                video_args['crf'] = 35
                video_args['audio_bitrate'] = '64k'
            elif compression_level == 'medium':
                video_args['crf'] = 28
                video_args['audio_bitrate'] = '96k'
            elif compression_level == 'high':
                video_args['crf'] = 32
                video_args['audio_bitrate'] = '80k'
            
            # Target size calculation (two-pass encoding)
            if target_size_mb:
                target_bitrate = int((target_size_mb * 8 * 1024) / original_duration)  # kbps
                video_args['b:v'] = f'{target_bitrate}k'
                video_args.pop('crf', None)  # Remove CRF when using target bitrate
            
            # Resolution scaling
            if max_resolution:
                video_args['vf'] = f'scale={max_resolution}:force_original_aspect_ratio=decrease'
            
            # Max bitrate
            if max_bitrate:
                video_args['maxrate'] = max_bitrate
                video_args['bufsize'] = f'{int(max_bitrate.rstrip("k")) * 2}k'
            
            stream = ffmpeg.output(stream, output_path, **video_args)
            ffmpeg.run(stream, overwrite_output=True, quiet=True)
            
            # Read compressed video
            with open(output_path, 'rb') as f:
                compressed_data = f.read()
            
            compressed_size = len(compressed_data)
            compression_ratio = ((original_size - compressed_size) / original_size) * 100
            
            # Get compressed video info
            probe = ffmpeg.probe(output_path)
            video_stream = next((s for s in probe['streams'] if s['codec_type'] == 'video'), None)
            
            metadata = {
                'original_size_mb': round(original_size / (1024 * 1024), 2),
                'compressed_size_mb': round(compressed_size / (1024 * 1024), 2),
                'compression_ratio': round(compression_ratio, 1),
                'compression_level': compression_level,
                'duration': float(probe['format']['duration']),
                'resolution': f"{video_stream.get('width', 'unknown')}x{video_stream.get('height', 'unknown')}" if video_stream else 'unknown',
                'bitrate': probe['format'].get('bit_rate', 'unknown'),
                'target_size_mb': target_size_mb,
                'max_resolution': max_resolution
            }
            
            logger.info(f"Compressed video: {compression_ratio:.1f}% reduction")
            return compressed_data, metadata
            
        finally:
            try:
                os.unlink(input_path)
                os.unlink(output_path)
            except OSError:
                pass
    
    async def generate_thumbnail(
        self,
        video_data: bytes,
        timestamp: float = 10.0,
        width: int = 320,
        height: int = 240,
        format: str = 'jpg'
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Generate thumbnail from video at specified timestamp"""
        try:
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                self._generate_thumbnail_sync,
                video_data,
                timestamp,
                width,
                height,
                format
            )
            return result
            
        except Exception as e:
            logger.error(f"Thumbnail generation failed: {e}")
            raise
    
    def _generate_thumbnail_sync(
        self,
        video_data: bytes,
        timestamp: float,
        width: int,
        height: int,
        format: str
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Synchronous thumbnail generation"""
        
        with tempfile.NamedTemporaryFile(delete=False) as input_file:
            input_file.write(video_data)
            input_path = input_file.name
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{format}') as output_file:
            output_path = output_file.name
        
        try:
            # Get video duration to validate timestamp
            probe = ffmpeg.probe(input_path)
            duration = float(probe['format']['duration'])
            
            # Adjust timestamp if it exceeds video duration
            if timestamp >= duration:
                timestamp = duration / 2  # Use middle of video
            
            stream = ffmpeg.input(input_path, ss=timestamp)
            stream = ffmpeg.output(
                stream,
                output_path,
                vframes=1,  # Extract single frame
                vf=f'scale={width}:{height}',
                format='image2'
            )
            ffmpeg.run(stream, overwrite_output=True, quiet=True)
            
            # Read thumbnail
            with open(output_path, 'rb') as f:
                thumbnail_data = f.read()
            
            metadata = {
                'timestamp': timestamp,
                'width': width,
                'height': height,
                'format': format,
                'size': len(thumbnail_data),
                'video_duration': duration
            }
            
            logger.info(f"Generated thumbnail at {timestamp}s")
            return thumbnail_data, metadata
            
        finally:
            try:
                os.unlink(input_path)
                os.unlink(output_path)
            except OSError:
                pass
    
    async def extract_frames(
        self,
        video_data: bytes,
        fps: float = 1.0,
        start_time: Optional[float] = None,
        duration: Optional[float] = None,
        format: str = 'jpg'
    ) -> Tuple[List[bytes], Dict[str, Any]]:
        """Extract frames from video at specified intervals"""
        try:
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                self._extract_frames_sync,
                video_data,
                fps,
                start_time,
                duration,
                format
            )
            return result
            
        except Exception as e:
            logger.error(f"Frame extraction failed: {e}")
            raise
    
    def _extract_frames_sync(
        self,
        video_data: bytes,
        fps: float,
        start_time: Optional[float],
        duration: Optional[float],
        format: str
    ) -> Tuple[List[bytes], Dict[str, Any]]:
        """Synchronous frame extraction"""
        
        with tempfile.NamedTemporaryFile(delete=False) as input_file:
            input_file.write(video_data)
            input_path = input_file.name
        
        with tempfile.TemporaryDirectory() as temp_dir:
            output_pattern = os.path.join(temp_dir, f'frame_%04d.{format}')
            
            try:
                stream = ffmpeg.input(input_path)
                
                # Apply time constraints
                if start_time is not None:
                    stream = ffmpeg.input(input_path, ss=start_time)
                
                output_args = {
                    'vf': f'fps={fps}',
                    'format': 'image2'
                }
                
                if duration is not None:
                    output_args['t'] = duration
                
                stream = ffmpeg.output(stream, output_pattern, **output_args)
                ffmpeg.run(stream, overwrite_output=True, quiet=True)
                
                # Read all generated frames
                frames = []
                frame_files = sorted([f for f in os.listdir(temp_dir) if f.startswith('frame_')])
                
                for frame_file in frame_files:
                    frame_path = os.path.join(temp_dir, frame_file)
                    with open(frame_path, 'rb') as f:
                        frames.append(f.read())
                
                metadata = {
                    'frame_count': len(frames),
                    'fps': fps,
                    'start_time': start_time or 0,
                    'duration': duration,
                    'format': format,
                    'total_size': sum(len(frame) for frame in frames)
                }
                
                logger.info(f"Extracted {len(frames)} frames from video")
                return frames, metadata
                
            finally:
                try:
                    os.unlink(input_path)
                except OSError:
                    pass
    
    async def get_video_info(self, video_data: bytes) -> Dict[str, Any]:
        """Get video file metadata and information"""
        try:
            result = await asyncio.get_event_loop().run_in_executor(
                self.executor,
                self._get_video_info_sync,
                video_data
            )
            return result
            
        except Exception as e:
            logger.error(f"Failed to get video info: {e}")
            raise
    
    def _get_video_info_sync(self, video_data: bytes) -> Dict[str, Any]:
        """Synchronous video info extraction"""
        
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(video_data)
            temp_path = temp_file.name
        
        try:
            probe = ffmpeg.probe(temp_path)
            format_info = probe['format']
            
            video_stream = next((s for s in probe['streams'] if s['codec_type'] == 'video'), None)
            audio_stream = next((s for s in probe['streams'] if s['codec_type'] == 'audio'), None)
            
            info = {
                'format': format_info.get('format_name', 'unknown'),
                'duration': float(format_info.get('duration', 0)),
                'size': int(format_info.get('size', len(video_data))),
                'bitrate': format_info.get('bit_rate', 'unknown'),
                'tags': format_info.get('tags', {})
            }
            
            if video_stream:
                info.update({
                    'video_codec': video_stream.get('codec_name', 'unknown'),
                    'width': video_stream.get('width', 'unknown'),
                    'height': video_stream.get('height', 'unknown'),
                    'fps': video_stream.get('r_frame_rate', 'unknown'),
                    'aspect_ratio': video_stream.get('display_aspect_ratio', 'unknown'),
                    'pixel_format': video_stream.get('pix_fmt', 'unknown')
                })
            
            if audio_stream:
                info.update({
                    'audio_codec': audio_stream.get('codec_name', 'unknown'),
                    'audio_channels': audio_stream.get('channels', 'unknown'),
                    'audio_sample_rate': audio_stream.get('sample_rate', 'unknown')
                })
            
            return info
            
        finally:
            try:
                os.unlink(temp_path)
            except OSError:
                pass