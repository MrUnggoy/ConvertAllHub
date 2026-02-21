from fastapi import APIRouter
from fastapi.responses import Response

router = APIRouter()

# Tool definitions - should match frontend registry
TOOLS = [
    # PDF tools
    {"id": "pdf-merger", "category": "pdf"},
    {"id": "document-to-pdf", "category": "pdf"},
    {"id": "pdf-text-extract", "category": "pdf"},
    {"id": "docx-converter", "category": "pdf"},
    {"id": "document-merger", "category": "pdf"},
    {"id": "document-splitter", "category": "pdf"},
    # Image tools
    {"id": "image-converter", "category": "image"},
    {"id": "background-remover", "category": "image"},
]

CATEGORIES = ["pdf", "image", "audio", "video", "text", "ocr", "qr"]

@router.get("/sitemap.xml")
async def get_sitemap():
    """Generate sitemap.xml for SEO"""
    from datetime import datetime
    
    base_url = "https://convertall.hub"
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    urls = [
        # Home page
        {
            "loc": base_url,
            "lastmod": current_date,
            "changefreq": "weekly",
            "priority": "1.0"
        }
    ]
    
    # Category pages
    for category in CATEGORIES:
        urls.append({
            "loc": f"{base_url}/category/{category}",
            "lastmod": current_date,
            "changefreq": "weekly",
            "priority": "0.8"
        })
    
    # Tool pages
    for tool in TOOLS:
        urls.append({
            "loc": f"{base_url}/tool/{tool['id']}",
            "lastmod": current_date,
            "changefreq": "monthly",
            "priority": "0.9"
        })
    
    sitemap_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join([f'''  <url>
    <loc>{url["loc"]}</loc>
    <lastmod>{url["lastmod"]}</lastmod>
    <changefreq>{url["changefreq"]}</changefreq>
    <priority>{url["priority"]}</priority>
  </url>''' for url in urls])}
</urlset>"""
    
    return Response(content=sitemap_xml, media_type="application/xml")

@router.get("/robots.txt")
async def get_robots():
    """Generate robots.txt for SEO"""
    base_url = "https://convertall.hub"
    
    robots_txt = f"""User-agent: *
Allow: /

# Sitemaps
Sitemap: {base_url}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1"""
    
    return Response(content=robots_txt, media_type="text/plain")