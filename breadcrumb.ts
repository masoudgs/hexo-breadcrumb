import type {
  DataCategory,
  LayoutData,
  Link,
  Links,
  LinksByToken,
} from './global';
import packageJson from './package.json';
import {
  validateBreadcrumbConfig,
  type BreadcrumbConfig,
} from './schemas/config';

type HexoConfig = typeof hexo.config;
type HexoConfigWithBreadcrumb = HexoConfig & {
  breadcrumb: BreadcrumbConfig;
};

/**
 * Breadcrumb class.
 *
 * @example
 * ```ts
 * const breadcrumb = new Breadcrumb(hexo.config);
 * hexo.extend.filter.register('before_post_render', (data) => {
 *   data.breadcrumb = breadcrumb.setupBreadcrumb(data);
 *   return data;
 * });
 * ```
 */
export class Breadcrumb {
  private _hexoConfig: HexoConfig;
  private _breadcrumbConfig: BreadcrumbConfig;

  /**
   * Creates a new Breadcrumb instance and validates the configuration.
   */
  constructor(hexoConfig: HexoConfig) {
    this._hexoConfig = hexoConfig;
    this._breadcrumbConfig = validateBreadcrumbConfig(
      (hexoConfig as HexoConfigWithBreadcrumb).breadcrumb
    );
  }

  /**
   * Gets the home's page link from config or hexo config.
   */
  private getHomeLink(): Link {
    const { homepage } = this._breadcrumbConfig;
    return {
      title: homepage.title || this._hexoConfig.title,
      url: this._hexoConfig.url,
    };
  }

  /**
   * Gets the category links from data.
   */
  private getCategoryLinks(data: LayoutData): Links {
    return (data.categories.data as DataCategory).map(
      (category): Link => ({
        title: category.name,
        url: category.permalink,
      })
    );
  }

  /**
   * Gets the post or page title link from data.
   */
  private getTitleLink(data: LayoutData): Link {
    return {
      title: data.title ?? data['slug'],
      url: data.permalink,
    };
  }

  /**
   * Gets the unordered links based on the tokens.
   */
  private getLinks(data: LayoutData): LinksByToken {
    return {
      home: this.getHomeLink(),
      category: this.getCategoryLinks(data),
      title: this.getTitleLink(data),
    };
  }

  /**
   * Gets the ordered links based on the templates.
   */
  private getOrderedLinksByTemplates(
    data: LayoutData,
    links: LinksByToken
  ): Links {
    const { templates } = this._breadcrumbConfig;
    const detectedLayout = templates.find(
      (item) => item.layout === data.layout
    );

    if (!detectedLayout) {
      throw new Error(
        `Layout "${data.layout}" is not defined in breadcrumb.templates`
      );
    }

    return detectedLayout.tokens.map((token) => links[token]).flat();
  }

  /**
   * Gets the navigation ID.
   */
  private getNavigationId(): string {
    return `${packageJson.name}`;
  }

  /**
   * Gets the link class name.
   */
  private getLinkClassName(): string {
    return `${packageJson.name}-item`;
  }

  private getDelimiterStyle(): string {
    const linkClassName = this.getLinkClassName();
    const style = `.${linkClassName}:not(:last-child)::after {
        content: "${this._breadcrumbConfig.delimiter.content}";
        margin-left: ${this._breadcrumbConfig.delimiter.margin};
        ${this._breadcrumbConfig.delimiter.style}
      }`;

    return style;
  }

  private getVerticalNavigationStyle(): string {
    const linkClassName = this.getLinkClassName();
    const isDelimiterEnabled = this._breadcrumbConfig.delimiter.enable;
    const navStyle = `
      .${linkClassName}:not(:last-child) {
        margin-bottom: ${this._breadcrumbConfig.delimiter.margin};
      }
      ${isDelimiterEnabled ? this.getDelimiterStyle() : ''}
    `;

    return navStyle;
  }

  private getHorizontalNavigationStyle(): string {
    const linkClassName = this.getLinkClassName();
    const isDelimiterEnabled = this._breadcrumbConfig.delimiter.enable;
    const navStyle = `
      .${linkClassName} {
        display: inline-block;
      }
      .${linkClassName}:not(:last-child) {
        margin-right: ${this._breadcrumbConfig.delimiter.margin};
      }
      ${isDelimiterEnabled ? this.getDelimiterStyle() : ''}
    `;

    return navStyle;
  }

  /**
   * Gets the navigation style.
   */
  private getNavigationStyle(): string {
    const style =
      this._breadcrumbConfig.render.direction === 'horizontal'
        ? this.getHorizontalNavigationStyle()
        : this.getVerticalNavigationStyle();

    return `<style>${style}</style>`;
  }

  /**
   * Gets the navigation links.
   */
  private getNavigationLinks(links: Links): string {
    const linkClassName = this.getLinkClassName();
    const linksLi = links
      .map((link) => {
        const span = `<span>${link.title}</span>`;
        const a = `<a href="${link.url}">${span}</a>`;
        return `<li class="${linkClassName}">${a}</li>`;
      })
      .join('');
    const linksOl = `<ol>${linksLi}</ol>`;

    return linksOl;
  }

  /**
   * Gets the navigation aria label.
   */
  private getNavigationAriaLabel(): string {
    if (
      !this._breadcrumbConfig?.aria?.nav ||
      this._breadcrumbConfig.aria.nav === ''
    ) {
      return 'Breadcrumb';
    }

    return this._breadcrumbConfig.aria.nav;
  }

  /**
   * Renders breadcrumb
   * as HTML markup for the given page or post.
   */
  public render(data: LayoutData): string {
    const isRenderEnabled = this._breadcrumbConfig.render.enable;

    if (!isRenderEnabled) {
      return '';
    }

    const links = this.getLinks(data);
    const orderedLinks = this.getOrderedLinksByTemplates(data, links);
    const navigationStyle = this.getNavigationStyle();
    const navigationAttributes = {
      id: this.getNavigationId(),
      'aria-label': this.getNavigationAriaLabel(),
      'data-layout': data.layout,
    };
    const navigationAttributesString = Object.entries(navigationAttributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    const navigationStart = `<nav ${navigationAttributesString}>`;
    const navigationContent = this.getNavigationLinks(orderedLinks);
    const navigationEnd = `</nav>`;

    return (
      navigationStyle + navigationStart + navigationContent + navigationEnd
    );
  }
}
