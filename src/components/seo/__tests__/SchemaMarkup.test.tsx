import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import SchemaMarkup, { 
  createWebApplicationSchema, 
  createSoftwareApplicationSchema,
  createItemListSchema 
} from '../SchemaMarkup'

describe('SchemaMarkup Component', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
  })

  afterEach(() => {
    document.head.innerHTML = ''
  })

  it('should create JSON-LD script tag', () => {
    const data = { name: 'Test App', description: 'Test Description' }
    render(<SchemaMarkup type="WebApplication" data={data} />)

    const script = document.querySelector('script[type="application/ld+json"]')
    expect(script).toBeTruthy()
  })

  it('should include @context and @type in schema', () => {
    const data = { name: 'Test App' }
    render(<SchemaMarkup type="SoftwareApplication" data={data} />)

    const script = document.querySelector('script[type="application/ld+json"]')
    const content = JSON.parse(script?.textContent || '{}')
    
    expect(content['@context']).toBe('https://schema.org')
    expect(content['@type']).toBe('SoftwareApplication')
    expect(content.name).toBe('Test App')
  })
})

describe('Schema Helper Functions', () => {
  it('createWebApplicationSchema should include required fields', () => {
    const schema = createWebApplicationSchema(
      'ConvertAll Hub',
      'File conversion tools',
      'https://example.com'
    )

    expect(schema.name).toBe('ConvertAll Hub')
    expect(schema.applicationCategory).toBe('UtilitiesApplication')
    expect(schema.operatingSystem).toBe('Any (Web-based)')
    expect(schema.offers.price).toBe('0')
  })

  it('createSoftwareApplicationSchema should include tool details', () => {
    const schema = createSoftwareApplicationSchema(
      'PDF Merger',
      'Merge PDF files',
      'https://example.com/tool/pdf-merger',
      'pdf',
      ['PDF'],
      ['PDF']
    )

    expect(schema.name).toBe('PDF Merger')
    expect(schema.category).toBe('pdf')
    expect(schema.featureList).toContain('Supports PDF input formats')
  })

  it('createItemListSchema should create list with positions', () => {
    const items = [
      { name: 'Tool 1', description: 'Desc 1', url: 'https://example.com/1' },
      { name: 'Tool 2', description: 'Desc 2', url: 'https://example.com/2' }
    ]
    
    const schema = createItemListSchema(items)

    expect(schema.itemListElement).toHaveLength(2)
    expect(schema.itemListElement[0].position).toBe(1)
    expect(schema.itemListElement[1].position).toBe(2)
  })
})
