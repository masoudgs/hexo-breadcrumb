import { Breadcrumb } from './breadcrumb';
import { LayoutData } from './global';

/**
 * Register a before_post_render filter to render the breadcrumb.
 * Ref: https://hexo.io/api/filter#before-post-render
 */
export const register = (data: LayoutData): LayoutData | void => {
  const breadcrumb = new Breadcrumb(hexo.config);
  if (data.layout !== 'post' && data.layout !== 'page') {
    return data;
  }

  data.breadcrumb = breadcrumb.render(data);

  return data;
};
