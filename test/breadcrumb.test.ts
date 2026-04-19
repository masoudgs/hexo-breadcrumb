/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { Breadcrumb } from '../breadcrumb';

describe('Breadcrumb ARIA Features', () => {
  const mockHexoConfig = {
    title: 'My Blog',
    url: 'https://example.com',
    breadcrumb: {
      delimiter: {
        style: 'font-weight: bold;',
        content: '/',
        margin: '0.5rem',
        enable: true,
      },
      aria: {
        nav: 'Breadcrumb Navigation',
      },
      homepage: {
        title: 'Home',
      },
      templates: [
        {
          layout: 'post',
          tokens: ['home', 'category', 'title'],
        },
        {
          layout: 'page',
          tokens: ['home', 'title'],
        },
      ],
      render: {
        enable: true,
        direction: 'horizontal',
      },
    },
  } as any;

  const createMockLayoutData = (
    layout: 'post' | 'page',
    overrides: Partial<any> = {}
  ): any => {
    const baseData = {
      layout,
      title: 'Test Article',
      slug: 'test-article',
      permalink: '/test-article/',
      categories: {
        data: [
          {
            name: 'Technology',
            permalink: '/categories/technology/',
          },
        ],
      },
    };

    return { ...baseData, ...overrides };
  };

  describe('aria-current="page" attribute', () => {
    it('should add aria-current="page" to the last breadcrumb link', () => {
      const breadcrumb = new Breadcrumb(mockHexoConfig);
      const data = createMockLayoutData('post');
      const html = breadcrumb.render(data);

      // The last link should have aria-current="page"
      expect(html).toContain('aria-current="page"');

      // Verify it's on the last link (contains the article title)
      const ariaCurrentMatch = html.match(
        /<a[^>]*aria-current="page"[^>]*>.*?Test Article.*?<\/a>/
      );
      expect(ariaCurrentMatch).toBeDefined();
    });

    it('should only apply aria-current to the last link', () => {
      const breadcrumb = new Breadcrumb(mockHexoConfig);
      const data = createMockLayoutData('post');
      const html = breadcrumb.render(data);

      // Count occurrences of aria-current="page"
      const ariaCurrentCount = (html.match(/aria-current="page"/g) || [])
        .length;
      expect(ariaCurrentCount).toBe(1);
    });

    it('should not have aria-current on non-last links', () => {
      const breadcrumb = new Breadcrumb(mockHexoConfig);
      const data = createMockLayoutData('post');
      const html = breadcrumb.render(data);

      // Extract all links
      const links = html.match(/<a href="[^"]*"[^>]*>.*?<\/a>/g) || [];
      expect(links.length).toBeGreaterThan(1);

      // All links except last should not have aria-current
      for (let i = 0; i < links.length - 1; i++) {
        expect(links[i]).not.toContain('aria-current');
      }
    });

    it('should work with page layout (single breadcrumb)', () => {
      const breadcrumb = new Breadcrumb(mockHexoConfig);
      const data = createMockLayoutData('page');
      const html = breadcrumb.render(data);

      expect(html).toContain('aria-current="page"');
    });
  });

  describe('JSON-LD Structured Data', () => {
    it('should include JSON-LD BreadcrumbList script tag', () => {
      const breadcrumb = new Breadcrumb(mockHexoConfig);
      const data = createMockLayoutData('post');
      const html = breadcrumb.render(data);

      expect(html).toContain('type="application/ld+json"');
      expect(html).toContain('BreadcrumbList');
    });

    it('should have correct schema.org context', () => {
      const breadcrumb = new Breadcrumb(mockHexoConfig);
      const data = createMockLayoutData('post');
      const html = breadcrumb.render(data);

      expect(html).toContain('@context');
      expect(html).toContain('https://schema.org');
    });

    it('should include all breadcrumb items in structured data', () => {
      const breadcrumb = new Breadcrumb(mockHexoConfig);
      const data = createMockLayoutData('post');
      const html = breadcrumb.render(data);

      // Extract JSON-LD script
      const jsonMatch = html.match(
        /<script type="application\/ld\+json">(.+?)<\/script>/
      );
      expect(jsonMatch).toBeDefined();

      if (jsonMatch && jsonMatch[1]) {
        const jsonData = JSON.parse(jsonMatch[1]);
        expect(jsonData['@type']).toBe('BreadcrumbList');
        expect(jsonData.itemListElement).toBeDefined();
        expect(Array.isArray(jsonData.itemListElement)).toBe(true);
        expect(jsonData.itemListElement.length).toBeGreaterThan(0);
      }
    });

    it('should have correct position numbering in structured data', () => {
      const breadcrumb = new Breadcrumb(mockHexoConfig);
      const data = createMockLayoutData('post');
      const html = breadcrumb.render(data);

      const jsonMatch = html.match(
        /<script type="application\/ld\+json">(.+?)<\/script>/
      );
      if (jsonMatch && jsonMatch[1]) {
        const jsonData = JSON.parse(jsonMatch[1]);
        const items = jsonData.itemListElement;

        // Verify positions are sequential starting from 1
        items.forEach((item: any, index: number) => {
          expect(item.position).toBe(index + 1);
        });
      }
    });

    it('should include name and item URL for each breadcrumb item', () => {
      const breadcrumb = new Breadcrumb(mockHexoConfig);
      const data = createMockLayoutData('post');
      const html = breadcrumb.render(data);

      const jsonMatch = html.match(
        /<script type="application\/ld\+json">(.+?)<\/script>/
      );
      if (jsonMatch && jsonMatch[1]) {
        const jsonData = JSON.parse(jsonMatch[1]);
        const items = jsonData.itemListElement;

        items.forEach((item: any) => {
          expect(item['@type']).toBe('ListItem');
          expect(item.name).toBeDefined();
          expect(typeof item.name).toBe('string');
          expect(item.item).toBeDefined();
          expect(typeof item.item).toBe('string');
        });
      }
    });

    it('should include home link in structured data', () => {
      const breadcrumb = new Breadcrumb(mockHexoConfig);
      const data = createMockLayoutData('post');
      const html = breadcrumb.render(data);

      const jsonMatch = html.match(
        /<script type="application\/ld\+json">(.+?)<\/script>/
      );
      if (jsonMatch && jsonMatch[1]) {
        const jsonData = JSON.parse(jsonMatch[1]);
        const items = jsonData.itemListElement;

        // First item should be home
        expect(items[0].name).toBe('Home');
        expect(items[0].item).toBe('https://example.com');
      }
    });

    it('should include article title in structured data', () => {
      const breadcrumb = new Breadcrumb(mockHexoConfig);
      const data = createMockLayoutData('post');
      const html = breadcrumb.render(data);

      const jsonMatch = html.match(
        /<script type="application\/ld\+json">(.+?)<\/script>/
      );
      if (jsonMatch && jsonMatch[1]) {
        const jsonData = JSON.parse(jsonMatch[1]);
        const items = jsonData.itemListElement;

        // Last item should be the article title
        const lastItem = items[items.length - 1];
        expect(lastItem.name).toBe('Test Article');
        expect(lastItem.item).toContain('/test-article/');
      }
    });

    it('should work with custom homepage title', () => {
      const customConfig = {
        ...mockHexoConfig,
        breadcrumb: {
          ...mockHexoConfig.breadcrumb,
          homepage: {
            title: 'Start',
          },
        },
      } as any;

      const breadcrumb = new Breadcrumb(customConfig);
      const data = createMockLayoutData('post');
      const html = breadcrumb.render(data);

      const jsonMatch = html.match(
        /<script type="application\/ld\+json">(.+?)<\/script>/
      );
      if (jsonMatch && jsonMatch[1]) {
        const jsonData = JSON.parse(jsonMatch[1]);
        const items = jsonData.itemListElement;

        expect(items[0].name).toBe('Start');
      }
    });
  });

  describe('Combined ARIA and Structured Data', () => {
    it('should have both aria-current and structured data in output', () => {
      const breadcrumb = new Breadcrumb(mockHexoConfig);
      const data = createMockLayoutData('post');
      const html = breadcrumb.render(data);

      expect(html).toContain('aria-current="page"');
      expect(html).toContain('BreadcrumbList');
      expect(html).toContain('type="application/ld+json"');
    });

    it('should render without errors when rendering is disabled', () => {
      const disabledConfig = {
        ...mockHexoConfig,
        breadcrumb: {
          ...mockHexoConfig.breadcrumb,
          render: {
            enable: false,
            direction: 'horizontal',
          },
        },
      };

      const breadcrumb = new Breadcrumb(disabledConfig);
      const data = createMockLayoutData('post');
      const html = breadcrumb.render(data);

      expect(html).toBe('');
    });

    it('should handle page layout without categories', () => {
      const breadcrumb = new Breadcrumb(mockHexoConfig);
      const data = createMockLayoutData('page', {
        categories: { data: [] },
      });
      const html = breadcrumb.render(data);

      expect(html).toContain('aria-current="page"');
      expect(html).toContain('BreadcrumbList');
    });

    it('should include nav aria-label in output', () => {
      const breadcrumb = new Breadcrumb(mockHexoConfig);
      const data = createMockLayoutData('post');
      const html = breadcrumb.render(data);

      expect(html).toContain('aria-label="Breadcrumb Navigation"');
    });
  });
});
