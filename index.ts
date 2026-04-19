import { register } from './hook';

hexo.extend.filter.register('before_post_render', register);
