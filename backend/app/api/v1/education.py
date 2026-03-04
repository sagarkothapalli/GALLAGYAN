from fastapi import APIRouter, HTTPException, status
import httpx

from app.core.config import settings

router = APIRouter()

SANITY_API_BASE = "https://{project_id}.api.sanity.io/v2024-01-01/data/query/{dataset}"


@router.get("/articles")
async def get_articles(category: str | None = None, level: str | None = None):
    """Proxy to Sanity CMS to fetch education articles.

    In production, this fetches from Sanity. For development without
    a Sanity project configured, returns a structured empty response.
    """
    if not settings.SANITY_PROJECT_ID:
        return {
            "data": [],
            "message": "Sanity CMS not configured. Set SANITY_PROJECT_ID in .env.",
        }

    url = SANITY_API_BASE.format(
        project_id=settings.SANITY_PROJECT_ID,
        dataset=settings.SANITY_DATASET,
    )

    # Build GROQ query
    filters = ['_type == "article"']
    if category:
        filters.append(f'category == "{category}"')
    if level:
        filters.append(f'level == "{level}"')

    filter_str = " && ".join(filters)
    query = f"""*[{filter_str}] | order(publishedAt desc) {{
        _id, "slug": slug.current, title, excerpt, category, level, format,
        readTime, publishedAt, tags,
        "author": author->{{name, title, avatar}},
        featuredImage
    }}"""

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            params={"query": query},
            headers={"Authorization": f"Bearer {settings.SANITY_API_TOKEN}"}
            if settings.SANITY_API_TOKEN
            else {},
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch content from CMS.",
        )

    return response.json()


@router.get("/articles/{slug}")
async def get_article_by_slug(slug: str):
    """Fetch a single article by slug from Sanity CMS."""
    if not settings.SANITY_PROJECT_ID:
        return {
            "data": None,
            "message": "Sanity CMS not configured. Set SANITY_PROJECT_ID in .env.",
        }

    url = SANITY_API_BASE.format(
        project_id=settings.SANITY_PROJECT_ID,
        dataset=settings.SANITY_DATASET,
    )

    query = f"""*[_type == "article" && slug.current == "{slug}"][0] {{
        _id, "slug": slug.current, title, excerpt, body, category, level, format,
        readTime, publishedAt, updatedAt, seoTitle, seoDescription, tags,
        "author": author->{{_id, name, title, bio, avatar}},
        featuredImage,
        "relatedArticles": *[_type == "article" && slug.current != "{slug}" && category == ^.category][0...3] {{
            _id, "slug": slug.current, title, excerpt, category, readTime, featuredImage
        }}
    }}"""

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            params={"query": query},
            headers={"Authorization": f"Bearer {settings.SANITY_API_TOKEN}"}
            if settings.SANITY_API_TOKEN
            else {},
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to fetch content from CMS.",
        )

    return response.json()
