import { beforeAll, vi } from 'vitest';
import type { BreadcrumbConfig } from '../../schemas/config';

const mockHexoConfig = {
  title: 'Test Site',
  url: 'https://example.com',
};

// Mock breadcrumb config
const mockBreadcrumbConfig: BreadcrumbConfig = {
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
      tokens: ['home', 'category', 'title'],
    },
    {
      layout: 'page',
      tokens: ['home', 'title'],
    },
  ],
};

const mockHexo = {
  config: {
    ...mockHexoConfig,
    breadcrumb: mockBreadcrumbConfig,
  },
  extend: {
    filter: {
      register: vi.fn(),
    },
  },
};

const hexo = mockHexo;

beforeAll(() => {
  // @ts-expect-error type
  globalThis.hexo = hexo;
});

// Export for use in tests
export { mockBreadcrumbConfig, mockHexo, mockHexoConfig };
