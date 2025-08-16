import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';

export default {
  input: 'entries/unocss-core.js',
  output: {
    file: 'modules/unocss-core.bundle.js',
    format: 'es',
    inlineDynamicImports: true
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
      format: {
        comments: false,
      },
    }),
  ],
};