const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['index.ts'],
    bundle: true,
    platform: 'node',
    target: ['node22'],
    format: 'cjs',
    outfile: 'dist/index.js',
    sourcemap: true,
    minify: true,
    external: ['hexo', 'zod/v4'],
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  })
  .catch(() => process.exit(1));
