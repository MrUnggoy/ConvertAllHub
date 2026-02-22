import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import MetaTags from '../MetaTags'

describe('MetaTags Component', () => {
  beforeEach(() => {
    // Clear head before each test
    document.head.innerHTML = ''
  })

  afterEach(() => {
    // Clean up after each test
    document.head.innerHTML = ''
  })

  it('should set document title', () => {
    render(
      <MetaTags
        title="Test Title"
        description="Test Description"
      />
    )

    expect(document.title).toBe('Test Title')
  })

  it('should create meta description tag', () => {
    render(
      <MetaTags
        title="Test Title"
        description="Test Description"
      />
    )

    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription).toBeTruthy()
    expect(metaDescription?.getAttribute('content')).toBe('Test Description')
  })

  it('should create meta keywords tag when keywords provided', () => {
    render(
      <MetaTags
        title="Test Title"
        description="Test Description"
        keywords={['keyword1', 'keyword2', 'keyword3']}
      />
    )

    const metaKeywords = document.querySelector('meta[name="keywords"]')
    expect(metaKeywords).toBeTruthy()
    expect(metaKeywords?.getAttribute('content')).toBe('keyword1, keyword2, keyword3')
  })

  it('should create Open Graph meta tags', () => {
    render(
      <MetaTags
        title="Test Title"
        description="Test Description"
      />
    )

    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDescription = document.querySelector('meta[property="og:description"]')
    const ogType = document.querySelector('meta[property="og:type"]')
    const ogSiteName = document.querySelector('meta[property="og:site_name"]')

    expect(ogTitle?.getAttribute('content')).toBe('Test Title')
    expect(ogDescription?.getAttribute('content')).toBe('Test Description')
    expect(ogType?.getAttribute('content')).toBe('website')
    expect(ogSiteName?.getAttribute('content')).toBe('ConvertAll Hub')
  })

  it('should create Twitter Card meta tags', () => {
    render(
      <MetaTags
        title="Test Title"
        description="Test Description"
      />
    )

    const twitterCard = document.querySelector('meta[name="twitter:card"]')
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')

    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image')
    expect(twitterTitle?.getAttribute('content')).toBe('Test Title')
    expect(twitterDescription?.getAttribute('content')).toBe('Test Description')
  })

  it('should create canonical URL when provided', () => {
    render(
      <MetaTags
        title="Test Title"
        description="Test Description"
        canonicalUrl="https://example.com/page"
      />
    )

    const canonical = document.querySelector('link[rel="canonical"]')
    expect(canonical).toBeTruthy()
    expect(canonical?.getAttribute('href')).toBe('https://example.com/page')

    const ogUrl = document.querySelector('meta[property="og:url"]')
    expect(ogUrl?.getAttribute('content')).toBe('https://example.com/page')
  })

  it('should create viewport meta tag', () => {
    render(
      <MetaTags
        title="Test Title"
        description="Test Description"
      />
    )

    const viewport = document.querySelector('meta[name="viewport"]')
    expect(viewport).toBeTruthy()
    expect(viewport?.getAttribute('content')).toBe('width=device-width, initial-scale=1.0')
  })

  it('should update existing meta tags on re-render', () => {
    const { rerender } = render(
      <MetaTags
        title="First Title"
        description="First Description"
      />
    )

    expect(document.title).toBe('First Title')

    rerender(
      <MetaTags
        title="Second Title"
        description="Second Description"
      />
    )

    expect(document.title).toBe('Second Title')
    const metaDescription = document.querySelector('meta[name="description"]')
    expect(metaDescription?.getAttribute('content')).toBe('Second Description')
  })
})
