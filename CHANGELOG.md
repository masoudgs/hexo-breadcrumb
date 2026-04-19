# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.1] - 2026-04-19

### Changed

- Updated dependencies to latest versions
- Fixed build script in package.json

## [1.3.0] - 2026-04-30

### Added

- **ARIA Accessibility**: Added `aria-current="page"` attribute to the current breadcrumb link, improving screen reader announcements of the current page context
- **Structured Data**: Added JSON-LD schema.org `BreadcrumbList` structured data for enhanced SEO and accessibility
- **Unit Tests**: Comprehensive test suite for ARIA features covering:
  - aria-current attribute placement and uniqueness
  - JSON-LD BreadcrumbList schema validation
  - Correct position numbering and item metadata
  - Integration with existing breadcrumb generation

### Changed

- Enhanced `render()` method to include JSON-LD structured data in output
- Updated `getNavigationLinks()` method to apply aria-current="page" to the last breadcrumb link
- Improved semantic HTML output with better accessibility support

### Tests

- Added `test/breadcrumb.test.ts` with 16 test cases covering:
  - aria-current placement (only on last link)
  - JSON-LD schema validation and structure
  - Correct handling of homepage titles and URLs
  - Combined ARIA and structured data output
  - Page and post layout variations
  - Configuration variations (disabled rendering, no categories, custom homepage)

### WCAG Compliance

- Improved WCAG 2.1 AA compliance with aria-current attribute
- Added semantic structured data for better screen reader support
- Maintained semantic HTML structure (`<nav>`, `<ol>`, `<li>`)

## [1.2.4] - 2025-12-15

### Fixed

- Dependency updates for TypeScript 5.8.3
- ESLint 9 migration with updated configuration

### Changed

- Updated development dependencies to latest stable versions

## [1.2.3] - 2025-11-01

### Added

- Support for custom ARIA navigation labels via config
- Improved error handling for malformed breadcrumb configuration

## [1.2.2] - 2025-09-10

### Fixed

- Fixed category hierarchy processing for multi-level category structures

## [1.2.1] - 2025-08-15

### Added

- Horizontal/vertical direction rendering support
- Configurable delimiter styling

## [1.2.0] - 2025-07-20

### Added

- Template-based breadcrumb rendering per layout type
- Support for post and page layouts
- Configuration validation with Zod schema

## [1.1.0] - 2025-06-01

### Added

- Initial support for category hierarchy in breadcrumbs
- Customizable homepage link configuration

## [1.0.0] - 2025-05-01

### Added

- Initial release
- Basic breadcrumb generation for Hexo static site generator
- Support for customizable delimiters
- Integration with Hexo configuration system
