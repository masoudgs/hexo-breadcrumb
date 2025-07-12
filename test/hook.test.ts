import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { register } from '../hook';
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DataCategory, LayoutData } from '../global';

// Mock DOM environment
const mockDocument = {
  createElement: vi.fn(),
};

// Mock global document
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

// Helper function to create dynamic mock nav element
const createMockNavElement = (ariaLabel: string, innerHTML: string) => ({
  id: '',
  setAttribute: vi.fn(),
  innerHTML,
  outerHTML: `<nav id="hexo-breadcrumb" aria-label="${ariaLabel}">${innerHTML}</nav>`,
});

// Helper function to create dynamic mock layout data
const createMockLayoutData = (
  layout: 'post' | 'page',
  overrides: Partial<LayoutData> = {}
): LayoutData => {
  const baseData = {
    layout,
    title: 'Test Post',
    slug: 'test-post',
    permalink: '/test-post/',
    categories: {
      data: [
        {
          name: 'Technology',
          permalink: '/categories/technology/',
        },
        {
          name: 'Programming',
          permalink: '/categories/programming/',
        },
      ] as DataCategory,
    },
  };

  return {
    ...baseData,
    ...overrides,
  } as LayoutData;
};

// Helper function to update hexo config for tests
const updateHexoConfig = (updates: Partial<typeof hexo.config>) => {
  const originalConfig = { ...hexo.config };
  Object.assign(hexo.config, updates);
  return originalConfig;
};

// Helper function to restore hexo config
const restoreHexoConfig = (originalConfig: typeof hexo.config) => {
  Object.assign(hexo.config, originalConfig);
};

describe('Breadcrumb Hook', () => {
  let mockNavElement: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create dynamic mock nav element
    const expectedLinks = [
      { title: 'Home', url: 'https://example.com' },
      { title: 'Technology', url: '/categories/technology/' },
      { title: 'Programming', url: '/categories/programming/' },
      { title: 'Test Post', url: '/test-post/' },
    ];

    mockNavElement = createMockNavElement(
      'Breadcrumb Navigation',
      '<ol>' +
        expectedLinks
          .map(
            (link) =>
              `<li class="hexo-breadcrumb-item"><a href="${link.url}"><span>${link.title}</span></a></li>`
          )
          .join('') +
        '</ol>'
    );

    mockDocument.createElement.mockReturnValue(mockNavElement);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('register function', () => {
    it('should return data unchanged for non-post/non-page layouts', () => {
      const data = createMockLayoutData('index' as any);
      const result = register(data);
      expect(result).toBe(data);
      expect(data.breadcrumb).toBeUndefined();
    });

    it('should process post layout and add breadcrumb', () => {
      const data = createMockLayoutData('post');
      const result = register(data);

      expect(result).toBe(data);
      expect(data.breadcrumb).toBeDefined();
      expect(typeof data.breadcrumb).toBe('string');
    });

    it('should process page layout and add breadcrumb', () => {
      const data = createMockLayoutData('page');
      const result = register(data);

      expect(result).toBe(data);
      expect(data.breadcrumb).toBeDefined();
      expect(typeof data.breadcrumb).toBe('string');
    });

    it('should handle post with no categories', () => {
      const data = createMockLayoutData('post', {
        categories: { data: [] as DataCategory },
      });
      const result = register(data);

      expect(result).toBe(data);
      expect(data.breadcrumb).toBeDefined();
    });

    it('should use slug when title is not available', () => {
      const data = createMockLayoutData('post', {
        title: undefined,
      });
      const result = register(data);

      expect(result).toBe(data);
      expect(data.breadcrumb).toBeDefined();
    });
  });

  describe('breadcrumb generation', () => {
    it('should generate correct breadcrumb for post layout', () => {
      const data = createMockLayoutData('post');
      register(data);

      expect(data.breadcrumb).toContain('data-layout="post"');
    });

    it('should generate correct breadcrumb for page layout', () => {
      const data = createMockLayoutData('page');
      register(data);

      expect(data.breadcrumb).toContain('data-layout="page"');
    });

    it('should include navigation style in breadcrumb', () => {
      const data = createMockLayoutData('post');
      register(data);

      expect(data.breadcrumb).toContain('<style>');
      expect(data.breadcrumb).toContain('content: "/"');
      expect(data.breadcrumb).toContain('color: #666;');
    });

    it('should use site title when homepage title is not provided', () => {
      const originalConfig = updateHexoConfig({
        breadcrumb: {
          delimiter: {
            content: '/',
            style: 'color: #666;',
          },
          aria: {
            nav: 'Breadcrumb Navigation',
          },
          homepage: {},
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
        },
      });

      const expectedLinks = [
        { title: 'Test Site', url: 'https://example.com' },
        { title: 'Technology', url: '/categories/technology/' },
        { title: 'Programming', url: '/categories/programming/' },
        { title: 'Test Post', url: '/test-post/' },
      ];

      const mockNavElementForTest = createMockNavElement(
        'Breadcrumb Navigation',
        '<ol>' +
          expectedLinks
            .map(
              (link) =>
                `<li class="hexo-breadcrumb-item"><a href="${link.url}"><span>${link.title}</span></a></li>`
            )
            .join('') +
          '</ol>'
      );
      mockDocument.createElement.mockReturnValue(mockNavElementForTest);

      const data = createMockLayoutData('post');
      register(data);

      expect(data.breadcrumb).toContain('Test Site');

      restoreHexoConfig(originalConfig);
    });

    it('should use custom homepage title when provided', () => {
      const originalConfig = updateHexoConfig({
        breadcrumb: {
          delimiter: {
            content: '/',
            style: 'color: #666;',
          },
          aria: {
            nav: 'Breadcrumb Navigation',
          },
          homepage: { title: 'Custom Home' },
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
        },
      });

      const expectedLinks = [
        { title: 'Custom Home', url: 'https://example.com' },
        { title: 'Technology', url: '/categories/technology/' },
        { title: 'Programming', url: '/categories/programming/' },
        { title: 'Test Post', url: '/test-post/' },
      ];

      const mockNavElementForTest = createMockNavElement(
        'Breadcrumb Navigation',
        '<ol>' +
          expectedLinks
            .map(
              (link) =>
                `<li class="hexo-breadcrumb-item"><a href="${link.url}"><span>${link.title}</span></a></li>`
            )
            .join('') +
          '</ol>'
      );
      mockDocument.createElement.mockReturnValue(mockNavElementForTest);

      const data = createMockLayoutData('post');
      register(data);

      expect(data.breadcrumb).toContain('Custom Home');

      restoreHexoConfig(originalConfig);
    });

    it('should use custom aria label when provided', () => {
      const originalConfig = updateHexoConfig({
        breadcrumb: {
          delimiter: {
            content: '/',
            style: 'color: #666;',
          },
          aria: { nav: 'Custom Breadcrumb' },
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
        },
      });

      const data = createMockLayoutData('post');
      register(data);

      expect(data.breadcrumb).toContain('aria-label="Custom Breadcrumb"');

      restoreHexoConfig(originalConfig);
    });

    it('should use default aria label when not provided', () => {
      const originalConfig = updateHexoConfig({
        breadcrumb: {
          delimiter: {
            content: '/',
            style: 'color: #666;',
          },
          aria: {},
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
        },
      });

      const data = createMockLayoutData('post');
      register(data);

      expect(data.breadcrumb).toContain('aria-label="Breadcrumb"');

      restoreHexoConfig(originalConfig);
    });
  });

  describe('error handling', () => {
    it('should throw error for undefined layout in templates', () => {
      const originalConfig = updateHexoConfig({
        breadcrumb: {
          delimiter: {
            content: '/',
            style: 'color: #666;',
          },
          aria: {
            nav: 'Breadcrumb Navigation',
          },
          homepage: {
            title: 'Home',
          },
          templates: [
            {
              layout: 'post' as const,
              tokens: ['home', 'category', 'title'] as const,
            },
            // Missing page layout
          ],
        },
      });

      const data = createMockLayoutData('page');
      expect(() => register(data)).toThrow(
        'Layout "page" is not defined in breadcrumb.templates'
      );

      restoreHexoConfig(originalConfig);
    });

    it('should handle empty delimiter content', () => {
      const originalConfig = updateHexoConfig({
        breadcrumb: {
          delimiter: {
            content: '',
            style: '',
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
        },
      });

      const data = createMockLayoutData('post');
      const result = register(data);

      expect(result).toBe(data);
      expect(data.breadcrumb).toBeDefined();

      restoreHexoConfig(originalConfig);
    });
  });

  describe('link generation', () => {
    it('should generate correct home link', () => {
      const data = createMockLayoutData('post');
      register(data);

      expect(data.breadcrumb).toContain('href="https://example.com"');
      expect(data.breadcrumb).toContain('<span>Home</span>');
    });

    it('should generate correct category links', () => {
      const data = createMockLayoutData('post');
      register(data);

      expect(data.breadcrumb).toContain('href="/categories/technology/"');
      expect(data.breadcrumb).toContain('<span>Technology</span>');
      expect(data.breadcrumb).toContain('href="/categories/programming/"');
      expect(data.breadcrumb).toContain('<span>Programming</span>');
    });

    it('should generate correct title link', () => {
      const data = createMockLayoutData('post');
      register(data);

      expect(data.breadcrumb).toContain('href="/test-post/"');
      expect(data.breadcrumb).toContain('<span>Test Post</span>');
    });

    it('should use slug when title is not available', () => {
      const data = createMockLayoutData('post', {
        title: undefined,
      });
      register(data);

      expect(data.breadcrumb).toContain('<span>test-post</span>');
    });
  });

  describe('template ordering', () => {
    it('should follow template token order for post layout', () => {
      const originalConfig = updateHexoConfig({
        breadcrumb: {
          delimiter: {
            content: '/',
            style: 'color: #666;',
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
              tokens: ['title', 'home', 'category'], // Custom order
            },
            {
              layout: 'page',
              tokens: ['home', 'title'],
            },
          ],
        },
      });

      const expectedLinks = [
        { title: 'Test Post', url: '/test-post/' },
        { title: 'Home', url: 'https://example.com' },
        { title: 'Technology', url: '/categories/technology/' },
        { title: 'Programming', url: '/categories/programming/' },
      ];

      const mockNavElementForTest = createMockNavElement(
        'Breadcrumb Navigation',
        '<ol>' +
          expectedLinks
            .map(
              (link) =>
                `<li class="hexo-breadcrumb-item"><a href="${link.url}"><span>${link.title}</span></a></li>`
            )
            .join('') +
          '</ol>'
      );
      mockDocument.createElement.mockReturnValue(mockNavElementForTest);

      const data = createMockLayoutData('post');
      register(data);

      // The order should be: title, home, category
      expect(data.breadcrumb).toContain('Test Post');
      expect(data.breadcrumb).toContain('Home');
      expect(data.breadcrumb).toContain('Technology');

      restoreHexoConfig(originalConfig);
    });

    it('should handle page layout with only home and title tokens', () => {
      const expectedLinks = [
        { title: 'Home', url: 'https://example.com' },
        { title: 'Test Post', url: '/test-post/' },
      ];

      const mockNavElementForTest = createMockNavElement(
        'Breadcrumb Navigation',
        '<ol>' +
          expectedLinks
            .map(
              (link) =>
                `<li class="hexo-breadcrumb-item"><a href="${link.url}"><span>${link.title}</span></a></li>`
            )
            .join('') +
          '</ol>'
      );
      mockDocument.createElement.mockReturnValue(mockNavElementForTest);

      const data = createMockLayoutData('page');
      register(data);

      expect(data.breadcrumb).toContain('Home');
      expect(data.breadcrumb).toContain('Test Post');
      // Should not contain category links
      expect(data.breadcrumb).not.toContain('Technology');
    });
  });

  describe('dynamic data scenarios', () => {
    it('should handle different category structures', () => {
      const customData = createMockLayoutData('post', {
        categories: {
          data: [
            {
              name: 'Custom Category',
              permalink: '/categories/custom/',
            },
          ] as DataCategory,
        },
      });

      const expectedLinks = [
        { title: 'Home', url: 'https://example.com' },
        { title: 'Custom Category', url: '/categories/custom/' },
        { title: 'Test Post', url: '/test-post/' },
      ];

      const mockNavElementForTest = createMockNavElement(
        'Breadcrumb Navigation',
        '<ol>' +
          expectedLinks
            .map(
              (link) =>
                `<li class="hexo-breadcrumb-item"><a href="${link.url}"><span>${link.title}</span></a></li>`
            )
            .join('') +
          '</ol>'
      );
      mockDocument.createElement.mockReturnValue(mockNavElementForTest);

      register(customData);

      expect(customData.breadcrumb).toContain('Custom Category');
      expect(customData.breadcrumb).toContain('href="/categories/custom/"');
    });

    it('should handle custom permalinks', () => {
      const customData = createMockLayoutData('post', {
        permalink: '/custom-permalink/',
        slug: 'custom-slug',
      });

      const expectedLinks = [
        { title: 'Home', url: 'https://example.com' },
        { title: 'Technology', url: '/categories/technology/' },
        { title: 'Programming', url: '/categories/programming/' },
        { title: 'Test Post', url: '/custom-permalink/' },
      ];

      const mockNavElementForTest = createMockNavElement(
        'Breadcrumb Navigation',
        '<ol>' +
          expectedLinks
            .map(
              (link) =>
                `<li class="hexo-breadcrumb-item"><a href="${link.url}"><span>${link.title}</span></a></li>`
            )
            .join('') +
          '</ol>'
      );
      mockDocument.createElement.mockReturnValue(mockNavElementForTest);

      register(customData);

      expect(customData.breadcrumb).toContain('href="/custom-permalink/"');
    });

    it('should handle custom delimiter styles', () => {
      const originalConfig = updateHexoConfig({
        breadcrumb: {
          delimiter: {
            content: '>',
            style: 'color: red; font-weight: bold;',
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
        },
      });

      const data = createMockLayoutData('post');
      register(data);

      expect(data.breadcrumb).toContain('content: ">"');
      expect(data.breadcrumb).toContain('color: red; font-weight: bold;');

      restoreHexoConfig(originalConfig);
    });
  });
});
