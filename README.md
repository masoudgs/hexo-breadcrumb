# hexo-breadcrumb

[![NPM](https://img.shields.io/npm/v/hexo-breadcrumb)](https://www.npmjs.com/package/hexo-breadcrumb)
[![License](https://img.shields.io/github/license/msudgh/hexo-breadcrumb)](LICENSE)

A Hexo plugin to generate breadcrumb navigation for post and page layouts.

## Features

- Compatible with post and page layouts.
- Set custom title for the home page.
- Customize delimiter and styling.
- Accessible navigation with ARIA attributes of navigation.

## Installation

1. [**ni**](https://github.com/antfu/ni): `ni hexo-breadcrumb -D`
2. [**npm**](https://npmjs.com/): `npm i hexo-breadcrumb -D`
3. [**yarn**](https://yarnpkg.com/): `yarn add hexo-breadcrumb -D`
4. [**pnpm**](https://pnpm.io/): `pnpm add hexo-breadcrumb -D`

## Usage

### Configuration

In `_config.yml` file, specify the breadcrumb settings as following:

```yaml
breadcrumb:
  delimiter:
    # /, >, etc.
    content: "/"
    # Applied on ::after pseudo element.
    style: "font-weight: bold;"
  aria:
    nav: "Breadcrumb"
  homepage:
    # Customize the title for the homepage in the breadcrumb.
    title: Home
  templates:
    - layout: post
      tokens:
        - home
        - category
        - title
    - layout: page
      tokens:
        - home
        - title
```

### Integration with Hexo themes

Add the following snippets to a layout file in order to display the breadcrumb.

```ejs
<%- page.breadcrumb %>
```

## License

This project is licensed under the [MIT License](LICENSE).
