import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

const builds = [
  {
    input: 'entries/unocss-core.js',
    output: {
      file: 'modules/unocss-core.bundle.js',
      format: 'es',
    },
    external: [],
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      nodeResolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs(),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
        },
      }),
    ],
  },
  {
    input: 'entries/preset-tailwind.js',
    output: {
      file: 'modules/preset-tailwind.bundle.js',
      format: 'es',
      paths: {
        '@unocss/core': '/modules/unocss-core'
      }
    },
    external: ['@unocss/core'],
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true,
      }),
      nodeResolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs(),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
        },
      }),
    ],
  },
];

export default builds;