from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Body
from typing import Optional
import time
import uuid
import asyncio
import json

from models.conversion_models import ConversionResponse, ConversionStatus
from services.text_processor import TextProcessor
from services.storage import StorageService

router = APIRouter()
text_processor = TextProcessor()
storage_service = StorageService()

@router.post("/format", response_model=ConversionResponse)
async def format_text(
    text_content: str = Body(..., embed=True),
    output_format: str = Form("txt"),
    case_transform: Optional[str] = Form("none"),  # none, upper, lower, title, sentence, camel, pascal, snake, kebab
    line_endings: Optional[str] = Form("unix"),  # unix, windows, mac
    remove_extra_spaces: Optional[bool] = Form(True),
    normalize_unicode: Optional[bool] = Form(False),
    encoding: Optional[str] = Form("utf-8")
):
    """Format and transform text content"""
    
    if not text_content or not text_content.strip():
        raise HTTPException(status_code=400, detail="Text content cannot be empty")
    
    # Validate case transform options
    valid_case_transforms = ["none", "upper", "lower", "title", "sentence", "camel", "pascal", "snake", "kebab"]
    if case_transform not in valid_case_transforms:
        raise HTTPException(status_code=400, detail=f"Invalid case transform. Valid options: {', '.join(valid_case_transforms)}")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Format text
        formatted_text, metadata = text_processor.format_text(
            text_content,
            case_transform=case_transform,
            line_endings=line_endings,
            remove_extra_spaces=remove_extra_spaces,
            normalize_unicode=normalize_unicode
        )
        
        # Encode text with specified encoding
        try:
            encoded_data = formatted_text.encode(encoding)
        except UnicodeEncodeError as e:
            raise HTTPException(status_code=400, detail=f"Cannot encode text with {encoding}: {str(e)}")
        
        # Store formatted text
        filename = f"{task_id}.{output_format}"
        result_url = await storage_service.store_file(encoded_data, filename)
        
        processing_time = time.time() - processing_start
        
        # Update metadata
        metadata.update({
            "task_id": task_id,
            "output_format": output_format,
            "encoding": encoding,
            "file_size": len(encoded_data)
        })
        
        return ConversionResponse(
            status=ConversionStatus.SUCCESS,
            result_url=result_url,
            task_id=task_id,
            metadata=metadata,
            processing_time=processing_time
        )
        
    except Exception as e:
        processing_time = time.time() - processing_start
        return ConversionResponse(
            status=ConversionStatus.ERROR,
            task_id=task_id,
            error_message=str(e),
            processing_time=processing_time
        )

@router.post("/convert-markdown", response_model=ConversionResponse)
async def convert_markdown(
    file: UploadFile = File(...),
    output_format: str = Form("html"),
    include_css: Optional[bool] = Form(True),
    theme: Optional[str] = Form("github")
):
    """Convert Markdown to HTML"""
    
    if not file.filename or not file.filename.lower().endswith(('.md', '.markdown', '.txt')):
        raise HTTPException(status_code=400, detail="File must be a Markdown or text file")
    
    # Validate output format
    if output_format.lower() not in ['html', 'htm']:
        raise HTTPException(status_code=400, detail="Only HTML output format is currently supported")
    
    # Validate theme
    valid_themes = ["github", "minimal"]
    if theme not in valid_themes:
        raise HTTPException(status_code=400, detail=f"Invalid theme. Valid options: {', '.join(valid_themes)}")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Read file data
        file_data = await file.read()
        
        # Extract text from file
        markdown_text, extraction_metadata = text_processor.extract_text_from_file(file_data, file.filename)
        
        # Convert Markdown to HTML
        html_content, conversion_metadata = text_processor.convert_markdown_to_html(
            markdown_text,
            include_css=include_css,
            theme=theme
        )
        
        # Store HTML file
        filename = f"{task_id}.{output_format}"
        html_data = html_content.encode('utf-8')
        result_url = await storage_service.store_file(html_data, filename)
        
        processing_time = time.time() - processing_start
        
        # Combine metadata
        metadata = {
            **extraction_metadata,
            **conversion_metadata,
            "input_filename": file.filename,
            "task_id": task_id,
            "output_format": output_format
        }
        
        return ConversionResponse(
            status=ConversionStatus.SUCCESS,
            result_url=result_url,
            task_id=task_id,
            metadata=metadata,
            processing_time=processing_time
        )
        
    except Exception as e:
        processing_time = time.time() - processing_start
        return ConversionResponse(
            status=ConversionStatus.ERROR,
            task_id=task_id,
            error_message=str(e),
            processing_time=processing_time
        )

@router.post("/analyze", response_model=ConversionResponse)
async def analyze_text(
    text_content: str = Body(..., embed=True),
    language: Optional[str] = Form("en"),
    output_format: Optional[str] = Form("json")
):
    """Analyze text and provide detailed statistics"""
    
    if not text_content or not text_content.strip():
        raise HTTPException(status_code=400, detail="Text content cannot be empty")
    
    # Validate output format
    if output_format.lower() not in ['json', 'txt', 'csv']:
        raise HTTPException(status_code=400, detail="Output format must be 'json', 'txt', or 'csv'")
    
    processing_start = time.time()
    task_id = str(uuid.uuid4())
    
    try:
        # Analyze text
        analysis = text_processor.analyze_text(text_content, language=language)
        
        # Format output based on requested format
        if output_format.lower() == "json":
            output_data = json.dumps(analysis, indent=2).encode('utf-8')
        elif output_format.lower() == "txt":
            # Create human-readable text report
            lines = [
                "TEXT ANALYSIS REPORT",
                "=" * 50,
                f"Word Count: {analysis['word_count']}",
                f"Character Count: {analysis['character_count']}",
                f"Character Count (no spaces): {analysis['character_count_no_spaces']}",
                f"Sentence Count: {analysis['sentence_count']}",
                f"Paragraph Count: {analysis['paragraph_count']}",
                f"Line Count: {analysis['line_count']}",
                f"Reading Time: {analysis['reading_time_minutes']} minutes",
                "",
                "AVERAGES:",
                f"Words per sentence: {analysis['averages']['words_per_sentence']}",
                f"Characters per word: {analysis['averages']['characters_per_word']}",
                f"Words per paragraph: {analysis['averages']['words_per_paragraph']}",
                "",
                "COMPLEXITY METRICS:",
                f"Long word percentage: {analysis['complexity']['long_word_percentage']}%",
                f"Unique word ratio: {analysis['complexity']['unique_word_ratio']}%",
                f"Non-ASCII percentage: {analysis['complexity']['non_ascii_percentage']}%",
                "",
                "MOST COMMON WORDS:",
            ]
            
            for word, count in analysis['most_common_words']:
                lines.append(f"  {word}: {count}")
            
            output_data = '\n'.join(lines).encode('utf-8')
            
        elif output_format.lower() == "csv":
            # Create CSV format
            import csv
            import io as csv_io
            
            csv_buffer = csv_io.StringIO()
            writer = csv.writer(csv_buffer)
            
            # Write headers and data
            writer.writerow(['Metric', 'Value'])
            writer.writerow(['Word Count', analysis['word_count']])
            writer.writerow(['Character Count', analysis['character_count']])
            writer.writerow(['Character Count (no spaces)', analysis['character_count_no_spaces']])
            writer.writerow(['Sentence Count', analysis['sentence_count']])
            writer.writerow(['Paragraph Count', analysis['paragraph_count']])
            writer.writerow(['Line Count', analysis['line_count']])
            writer.writerow(['Reading Time (minutes)', analysis['reading_time_minutes']])
            writer.writerow(['Words per sentence', analysis['averages']['words_per_sentence']])
            writer.writerow(['Characters per word', analysis['averages']['characters_per_word']])
            writer.writerow(['Words per paragraph', analysis['averages']['words_per_paragraph']])
            
            output_data = csv_buffer.getvalue().encode('utf-8')
        
        # Store analysis file
        filename = f"{task_id}.{output_format}"
        result_url = await storage_service.store_file(output_data, filename)
        
        processing_time = time.time() - processing_start
        
        # Update analysis with task info
        analysis.update({
            "task_id": task_id,
            "output_format": output_format,
            "file_size": len(output_data)
        })
        
        return ConversionResponse(
            status=ConversionStatus.SUCCESS,
            result_url=result_url,
            task_id=task_id,
            metadata=analysis,
            processing_time=processing_time
        )
        
    except Exception as e:
        processing_time = time.time() - processing_start
        return ConversionResponse(
            status=ConversionStatus.ERROR,
            task_id=task_id,
            error_message=str(e),
            processing_time=processing_time
        )