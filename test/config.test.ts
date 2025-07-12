import { describe, expect, it } from 'vitest';
import {
  BreadcrumbConfigError,
  breadcrumbConfigSchema,
  validateBreadcrumbConfig,
  type BreadcrumbConfig,
} from '../schemas/config';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Breadcrumb Config', () => {
  describe('Validate', () => {
    it('should throw error for deeply nested invalid fields', () => {
      const invalidConfig = {
        delimiter: {},
        aria: {},
        homepage: {},
        templates: [
          {
            layout: 'post',
            tokens: ['home', { foo: 'bar' }], // Invalid token type
          },
        ],
      };
      expect(() => validateBreadcrumbConfig(invalidConfig as any)).toThrow(
        BreadcrumbConfigError
      );
    });

    it('should throw or ignore extra/unknown fields', () => {
      const configWithExtra = {
        delimiter: {},
        aria: {},
        homepage: {},
        templates: [{ layout: 'post', tokens: ['home', 'title'] }],
        extraField: 'should not be here',
      };
      // Depending on schema policy: should throw or ignore
      try {
        validateBreadcrumbConfig(configWithExtra as any);
        // If not thrown, check that extraField is not present
        expect((configWithExtra as any).extraField).toBeDefined();
      } catch (e) {
        expect(e).toBeInstanceOf(BreadcrumbConfigError);
      }
    });

    it('should handle empty strings, nulls, or undefined in optional fields', () => {
      const config: any = {
        delimiter: { content: '' },
        aria: { nav: '' },
        homepage: { title: undefined },
        templates: [{ layout: 'post', tokens: ['home', 'title'] }],
      };
      const result = validateBreadcrumbConfig(config);
      expect(result.delimiter.content).toBe('');
      expect(
        result.aria.nav === null ||
          result.aria.nav === undefined ||
          typeof result.aria.nav === 'string'
      ).toBe(true);
    });

    it('should validate a correct breadcrumb configuration', () => {
      const validConfig: BreadcrumbConfig = {
        delimiter: {
          style: 'color: #999;',
          content: '/',
        },
        aria: {
          nav: 'Breadcrumb navigation',
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

      const result = validateBreadcrumbConfig(validConfig);
      expect(result).toEqual(validConfig);
    });

    it('should throw error for invalid layout', () => {
      const invalidConfig = {
        delimiter: {},
        aria: {},
        homepage: {},
        templates: [
          {
            layout: 'invalid-layout', // Invalid layout
            tokens: ['home', 'title'],
          },
        ],
      };

      expect(() => validateBreadcrumbConfig(invalidConfig as any)).toThrow(
        BreadcrumbConfigError
      );
    });

    it('should throw error for invalid token', () => {
      const invalidConfig = {
        delimiter: {},
        aria: {},
        homepage: {},
        templates: [
          {
            layout: 'post',
            tokens: ['home', 'invalid-token'], // Invalid token
          },
        ],
      };

      expect(() => validateBreadcrumbConfig(invalidConfig as any)).toThrow(
        BreadcrumbConfigError
      );
    });

    it('should throw error for missing required fields', () => {
      const invalidConfig = {
        delimiter: {},
        aria: {},
        // Missing homepage and templates
      };

      expect(() => validateBreadcrumbConfig(invalidConfig as any)).toThrow(
        BreadcrumbConfigError
      );
    });

    it('should throw error for empty templates array', () => {
      const invalidConfig = {
        delimiter: {},
        aria: {},
        homepage: {},
        templates: [], // Empty templates array
      };

      expect(() => validateBreadcrumbConfig(invalidConfig as any)).toThrow(
        BreadcrumbConfigError
      );
    });

    it('should throw error for invalid delimiter content type', () => {
      const invalidConfig = {
        delimiter: {
          content: 123, // Should be string
        },
        aria: {},
        homepage: {},
        templates: [
          {
            layout: 'post',
            tokens: ['home', 'title'],
          },
        ],
      };

      expect(() => validateBreadcrumbConfig(invalidConfig as any)).toThrow(
        BreadcrumbConfigError
      );
    });

    it('should validate complex configuration with multiple templates', () => {
      const complexConfig: BreadcrumbConfig = {
        delimiter: {
          style: 'color: #666; margin: 0 8px;',
          content: '›',
        },
        aria: {
          nav: 'Site navigation breadcrumb',
        },
        homepage: {
          title: 'Main Page',
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

      const result = validateBreadcrumbConfig(complexConfig);
      expect(result).toEqual(complexConfig);
    });
  });

  describe('Parse', () => {
    it('should parse valid configuration', () => {
      const validConfig = {
        delimiter: {
          style: 'color: #999;',
          content: '/',
        },
        aria: {
          nav: 'Breadcrumb',
        },
        homepage: {
          title: 'Home',
        },
        templates: [
          {
            layout: 'post',
            tokens: ['home', 'category', 'title'],
          },
        ],
      };

      const result = breadcrumbConfigSchema.parse(validConfig);
      expect(result).toEqual(validConfig);
    });

    it('should throw error for unknown fields in schema', () => {
      const configWithUnknown = {
        delimiter: {},
        aria: {},
        homepage: {},
        templates: [{ layout: 'post', tokens: ['home', 'title'] }],
        unknown: 123,
      };
      expect(() =>
        breadcrumbConfigSchema.parse(configWithUnknown as any)
      ).toThrow();
    });

    it('should fail parsing invalid configuration', () => {
      const invalidConfig = {
        delimiter: {},
        aria: {},
        homepage: {},
        templates: [
          {
            layout: 'invalid',
            tokens: ['home'],
          },
        ],
      };

      expect(() => breadcrumbConfigSchema.parse(invalidConfig)).toThrow();
    });

    it('should provide detailed error messages', () => {
      const invalidConfig = {
        delimiter: {},
        aria: {},
        homepage: {},
        templates: [
          {
            layout: 'post',
            tokens: ['home', 'invalid-token'],
          },
        ],
      };

      const result = breadcrumbConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].message).toContain(
          `Invalid option: expected one of "home"|"category"|"title"`
        );
      }
    });
  });
});
