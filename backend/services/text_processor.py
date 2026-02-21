import re
import json
import io
from typing import Dict, Any, Optional, List, Tuple
import logging
import unicodedata
from collections import Counter

logger = logging.getLogger(__name__)

class TextProcessor:
    """Service for text transformation and analysis utilities"""
    
    @staticmethod
    def transform_case(text: str, case_type: str) -> str:
        """Transform text case"""
        if case_type == "upper":
            return text.upper()
        elif case_type == "lower":
            return text.lower()
        elif case_type == "title":
            return text.title()
        elif case_type == "sentence":
            # Capitalize first letter of each sentence
            sentences = re.split(r'([.!?]+)', text)
            result = []
            for i, sentence in enumerate(sentences):
                if i % 2 == 0 and sentence.strip():  # Text parts (not punctuation)
                    sentence = sentence.strip()
                    if sentence:
                        sentence = sentence[0].upper() + sentence[1:].lower()
                result.append(sentence)
            return ''.join(result)
        elif case_type == "camel":
            # Convert to camelCase
            words = re.findall(r'\w+', text.lower())
            if not words:
                return text
            return words[0] + ''.join(word.capitalize() for word in words[1:])
        elif case_type == "pascal":
            # Convert to PascalCase
            words = re.findall(r'\w+', text.lower())
            return ''.join(word.capitalize() for word in words)
        elif case_type == "snake":
            # Convert to snake_case
            words = re.findall(r'\w+', text.lower())
            return '_'.join(words)
        elif case_type == "kebab":
            # Convert to kebab-case
            words = re.findall(r'\w+', text.lower())
            return '-'.join(words)
        else:
            return text
    
    @staticmethod
    def normalize_line_endings(text: str, line_ending_type: str) -> str:
        """Normalize line endings"""
        # First normalize all to \n
        text = text.replace('\r\n', '\n').replace('\r', '\n')
        
        if line_ending_type == "windows":
            return text.replace('\n', '\r\n')
        elif line_ending_type == "mac":
            return text.replace('\n', '\r')
        else:  # unix
            return text
    
    @staticmethod
    def remove_extra_whitespace(text: str) -> str:
        """Remove extra whitespace and normalize spacing"""
        # Replace multiple spaces with single space
        text = re.sub(r' +', ' ', text)
        # Replace multiple newlines with double newline (paragraph break)
        text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
        # Remove trailing whitespace from lines
        text = '\n'.join(line.rstrip() for line in text.split('\n'))
        return text.strip()
    
    @staticmethod
    def format_text(
        text: str,
        case_transform: str = "none",
        line_endings: str = "unix",
        remove_extra_spaces: bool = True,
        normalize_unicode: bool = False
    ) -> Tuple[str, Dict[str, Any]]:
        """Format text with various transformations"""
        try:
            original_stats = TextProcessor.analyze_text(text)
            
            # Apply transformations
            formatted_text = text
            
            if remove_extra_spaces:
                formatted_text = TextProcessor.remove_extra_whitespace(formatted_text)
            
            if normalize_unicode:
                formatted_text = unicodedata.normalize('NFKC', formatted_text)
            
            if case_transform != "none":
                formatted_text = TextProcessor.transform_case(formatted_text, case_transform)
            
            formatted_text = TextProcessor.normalize_line_endings(formatted_text, line_endings)
            
            final_stats = TextProcessor.analyze_text(formatted_text)
            
            metadata = {
                "transformations_applied": {
                    "case_transform": case_transform,
                    "line_endings": line_endings,
                    "remove_extra_spaces": remove_extra_spaces,
                    "normalize_unicode": normalize_unicode
                },
                "original_stats": original_stats,
                "final_stats": final_stats,
                "changes": {
                    "character_count_change": final_stats["character_count"] - original_stats["character_count"],
                    "word_count_change": final_stats["word_count"] - original_stats["word_count"],
                    "line_count_change": final_stats["line_count"] - original_stats["line_count"]
                }
            }
            
            logger.info(f"Formatted text: {len(text)} -> {len(formatted_text)} characters")
            return formatted_text, metadata
            
        except Exception as e:
            logger.error(f"Text formatting failed: {e}")
            raise
    
    @staticmethod
    def analyze_text(text: str, language: str = "en") -> Dict[str, Any]:
        """Analyze text and provide detailed statistics"""
        try:
            # Basic counts
            character_count = len(text)
            character_count_no_spaces = len(text.replace(' ', '').replace('\t', '').replace('\n', ''))
            word_count = len(text.split())
            
            # Line and paragraph counts
            lines = text.split('\n')
            line_count = len(lines)
            paragraph_count = len([p for p in text.split('\n\n') if p.strip()])
            
            # Sentence count (basic approximation)
            sentence_endings = r'[.!?]+(?:\s|$)'
            sentences = re.findall(sentence_endings, text)
            sentence_count = len(sentences) if sentences else 1
            
            # Word frequency analysis
            words = re.findall(r'\b\w+\b', text.lower())
            word_frequency = Counter(words)
            most_common_words = word_frequency.most_common(10)
            
            # Character frequency
            char_frequency = Counter(text.lower())
            most_common_chars = char_frequency.most_common(10)
            
            # Reading time estimation (average 200 WPM)
            reading_time_minutes = word_count / 200 if word_count > 0 else 0
            
            # Average calculations
            avg_words_per_sentence = word_count / sentence_count if sentence_count > 0 else 0
            avg_chars_per_word = character_count_no_spaces / word_count if word_count > 0 else 0
            avg_words_per_paragraph = word_count / paragraph_count if paragraph_count > 0 else 0
            
            # Text complexity metrics
            long_words = [word for word in words if len(word) > 6]
            long_word_percentage = (len(long_words) / word_count * 100) if word_count > 0 else 0
            
            # Unique word ratio
            unique_words = len(set(words))
            unique_word_ratio = (unique_words / word_count * 100) if word_count > 0 else 0
            
            # Detect potential language/encoding issues
            non_ascii_chars = sum(1 for char in text if ord(char) > 127)
            non_ascii_percentage = (non_ascii_chars / character_count * 100) if character_count > 0 else 0
            
            analysis = {
                "character_count": character_count,
                "character_count_no_spaces": character_count_no_spaces,
                "word_count": word_count,
                "unique_word_count": unique_words,
                "sentence_count": sentence_count,
                "paragraph_count": paragraph_count,
                "line_count": line_count,
                "reading_time_minutes": round(reading_time_minutes, 1),
                "averages": {
                    "words_per_sentence": round(avg_words_per_sentence, 1),
                    "characters_per_word": round(avg_chars_per_word, 1),
                    "words_per_paragraph": round(avg_words_per_paragraph, 1)
                },
                "complexity": {
                    "long_word_percentage": round(long_word_percentage, 1),
                    "unique_word_ratio": round(unique_word_ratio, 1),
                    "non_ascii_percentage": round(non_ascii_percentage, 1)
                },
                "most_common_words": most_common_words,
                "most_common_characters": most_common_chars,
                "language": language,
                "encoding_info": {
                    "has_non_ascii": non_ascii_chars > 0,
                    "non_ascii_count": non_ascii_chars
                }
            }
            
            logger.info(f"Analyzed text: {word_count} words, {sentence_count} sentences")
            return analysis
            
        except Exception as e:
            logger.error(f"Text analysis failed: {e}")
            raise
    
    @staticmethod
    def convert_markdown_to_html(
        markdown_text: str,
        include_css: bool = True,
        theme: str = "github"
    ) -> Tuple[str, Dict[str, Any]]:
        """Convert Markdown to HTML (basic implementation)"""
        try:
            html_content = markdown_text
            
            # Basic Markdown to HTML conversion
            # Headers
            html_content = re.sub(r'^# (.*$)', r'<h1>\1</h1>', html_content, flags=re.MULTILINE)
            html_content = re.sub(r'^## (.*$)', r'<h2>\1</h2>', html_content, flags=re.MULTILINE)
            html_content = re.sub(r'^### (.*$)', r'<h3>\1</h3>', html_content, flags=re.MULTILINE)
            html_content = re.sub(r'^#### (.*$)', r'<h4>\1</h4>', html_content, flags=re.MULTILINE)
            html_content = re.sub(r'^##### (.*$)', r'<h5>\1</h5>', html_content, flags=re.MULTILINE)
            html_content = re.sub(r'^###### (.*$)', r'<h6>\1</h6>', html_content, flags=re.MULTILINE)
            
            # Bold and italic
            html_content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html_content)
            html_content = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html_content)
            html_content = re.sub(r'__(.*?)__', r'<strong>\1</strong>', html_content)
            html_content = re.sub(r'_(.*?)_', r'<em>\1</em>', html_content)
            
            # Code
            html_content = re.sub(r'`(.*?)`', r'<code>\1</code>', html_content)
            html_content = re.sub(r'^```(.*?)^```', r'<pre><code>\1</code></pre>', html_content, flags=re.MULTILINE | re.DOTALL)
            
            # Links
            html_content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', html_content)
            
            # Images
            html_content = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', r'<img src="\2" alt="\1">', html_content)
            
            # Lists (basic)
            lines = html_content.split('\n')
            in_ul = False
            in_ol = False
            result_lines = []
            
            for line in lines:
                if re.match(r'^\s*[-*+]\s+', line):
                    if not in_ul:
                        result_lines.append('<ul>')
                        in_ul = True
                    if in_ol:
                        result_lines.append('</ol>')
                        in_ol = False
                    item_text = re.sub(r'^\s*[-*+]\s+', '', line)
                    result_lines.append(f'<li>{item_text}</li>')
                elif re.match(r'^\s*\d+\.\s+', line):
                    if not in_ol:
                        result_lines.append('<ol>')
                        in_ol = True
                    if in_ul:
                        result_lines.append('</ul>')
                        in_ul = False
                    item_text = re.sub(r'^\s*\d+\.\s+', '', line)
                    result_lines.append(f'<li>{item_text}</li>')
                else:
                    if in_ul:
                        result_lines.append('</ul>')
                        in_ul = False
                    if in_ol:
                        result_lines.append('</ol>')
                        in_ol = False
                    if line.strip():
                        result_lines.append(f'<p>{line}</p>')
                    else:
                        result_lines.append('')
            
            # Close any remaining lists
            if in_ul:
                result_lines.append('</ul>')
            if in_ol:
                result_lines.append('</ol>')
            
            html_content = '\n'.join(result_lines)
            
            # Add CSS if requested
            css_styles = {
                "github": """
                <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
                h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 10px; }
                h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 8px; }
                code { background-color: #f6f8fa; padding: 2px 4px; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, monospace; }
                pre { background-color: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
                a { color: #0366d6; text-decoration: none; }
                a:hover { text-decoration: underline; }
                ul, ol { padding-left: 30px; }
                li { margin-bottom: 4px; }
                </style>
                """,
                "minimal": """
                <style>
                body { font-family: Georgia, serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
                h1, h2, h3, h4, h5, h6 { margin-top: 20px; margin-bottom: 10px; }
                code { background-color: #f0f0f0; padding: 2px 4px; font-family: monospace; }
                pre { background-color: #f0f0f0; padding: 10px; }
                </style>
                """
            }
            
            if include_css:
                css = css_styles.get(theme, css_styles["github"])
                html_content = f"<!DOCTYPE html>\n<html>\n<head>\n<meta charset='utf-8'>\n{css}\n</head>\n<body>\n{html_content}\n</body>\n</html>"
            
            # Count features used
            features_used = []
            if re.search(r'<h[1-6]>', html_content):
                features_used.append("headers")
            if re.search(r'<(strong|em)>', html_content):
                features_used.append("emphasis")
            if re.search(r'<code>', html_content):
                features_used.append("code")
            if re.search(r'<a href', html_content):
                features_used.append("links")
            if re.search(r'<img src', html_content):
                features_used.append("images")
            if re.search(r'<(ul|ol)>', html_content):
                features_used.append("lists")
            
            metadata = {
                "include_css": include_css,
                "theme": theme,
                "features_used": features_used,
                "html_size": len(html_content),
                "markdown_size": len(markdown_text),
                "conversion_ratio": round(len(html_content) / len(markdown_text), 2) if len(markdown_text) > 0 else 0
            }
            
            logger.info(f"Converted Markdown to HTML: {len(markdown_text)} -> {len(html_content)} characters")
            return html_content, metadata
            
        except Exception as e:
            logger.error(f"Markdown to HTML conversion failed: {e}")
            raise
    
    @staticmethod
    def extract_text_from_file(file_data: bytes, filename: str) -> Tuple[str, Dict[str, Any]]:
        """Extract text from various file formats"""
        try:
            file_extension = filename.lower().split('.')[-1] if '.' in filename else ''
            
            if file_extension in ['txt', 'md', 'markdown']:
                # Try different encodings
                encodings = ['utf-8', 'utf-16', 'latin-1', 'cp1252']
                text_content = None
                used_encoding = None
                
                for encoding in encodings:
                    try:
                        text_content = file_data.decode(encoding)
                        used_encoding = encoding
                        break
                    except UnicodeDecodeError:
                        continue
                
                if text_content is None:
                    raise ValueError("Could not decode file with any supported encoding")
                
                metadata = {
                    "file_type": "text",
                    "encoding": used_encoding,
                    "file_size": len(file_data),
                    "text_length": len(text_content)
                }
                
                return text_content, metadata
            
            else:
                raise ValueError(f"Unsupported file type: {file_extension}")
                
        except Exception as e:
            logger.error(f"Text extraction failed: {e}")
            raise