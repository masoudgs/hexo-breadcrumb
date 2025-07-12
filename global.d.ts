import type { Locals } from 'hexo';
export type AvailableTokens = 'home' | 'category' | 'title';
export type Layout = 'post' | 'page';
export type Tokens = Array<AvailableTokens>;
export type Templates = Array<{ layout: Layout; tokens: Tokens }>;
export interface Breadcrumb {
  delimiter: {
    style: string;
    content: string;
  };
  aria: {
    nav: string;
  };
  homepage: {
    title: string;
  };
  templates: Templates;
}
export type LayoutData = ((Locals.Post | Locals.Page) & { layout: Layout }) & {
  breadcrumb: string;
};
export type DataCategory = Locals.Category[];
export type Link = { url: string; title: string };
export type Links = Array<Link>;
export type LinksByToken = Record<AvailableTokens, Link | Links>;
