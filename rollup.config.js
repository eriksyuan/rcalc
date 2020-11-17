import ts from '@rollup/plugin-typescript';
import pkg from './package.json';
export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'lib/'+pkg.main,
      format: 'cjs',
    },
    {
      file: 'lib/'+pkg.module,
      format: 'es',
    },
  ],
  plugins: [ts()],
};
