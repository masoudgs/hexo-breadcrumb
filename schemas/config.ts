import { z } from 'zod';

const availableTokensSchema = z.enum(['home', 'category', 'title']);
const layoutSchema = z.enum(['post', 'page']);
const tokensSchema = z.array(availableTokensSchema);
const templatesSchema = z
  .array(
    z
      .object({
        layout: layoutSchema,
        tokens: tokensSchema,
      })
      .strict()
  )
  .min(1);
const delimiterSchema = z
  .object({
    style: z.string().optional(),
    content: z.string().optional(),
  })
  .strict();
const ariaSchema = z
  .object({
    nav: z.string().default('Breadcrumb'),
  })
  .strict();
const homepageSchema = z
  .object({
    title: z.string().optional(),
  })
  .strict();
export const breadcrumbConfigSchema = z
  .object({
    delimiter: delimiterSchema,
    aria: ariaSchema,
    homepage: homepageSchema,
    templates: templatesSchema,
  })
  .strict();

export type BreadcrumbConfig = z.infer<typeof breadcrumbConfigSchema>;
export type AvailableTokens = z.infer<typeof availableTokensSchema>;
export type Layout = z.infer<typeof layoutSchema>;
export type Tokens = z.infer<typeof tokensSchema>;
export type Templates = z.infer<typeof templatesSchema>;

export class BreadcrumbConfigError extends Error {
  constructor() {
    super('Invalid breadcrumb config');
    this.name = 'BreadcrumbConfigError';
  }
}

export const validateBreadcrumbConfig = (config: BreadcrumbConfig) => {
  const parsedConfig = breadcrumbConfigSchema.safeParse(config);

  if (!parsedConfig.success) {
    console.debug(parsedConfig.error);
    throw new BreadcrumbConfigError();
  }

  return parsedConfig.data;
};
