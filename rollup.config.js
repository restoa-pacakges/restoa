const external = ['react'];

const plugins = [];

const DefaultConfig = [
  // CommonJs
  {
    input: 'js/index.js',
    output: {
      file: 'lib/restoa.js',
      format: 'cjs',
      exports: 'named',
    },
    external,
    plugins,
  },
  // ES
  {
    input: 'js/index.js',
    output: {
      file: 'es/restoa.js',
      format: 'es',
      exports: 'named',
    },
    external,
    plugins,
  },
  // ES for browsers
  {
    input: 'js/index.js',
    output: {
      file: 'es/restoa.mjs',
      format: 'es',
      exports: 'named',
    },
    external,
    plugins,
  },
  // UMD
  {
    input: 'js/index.js',
    output: {
      file: 'dist/restoa.js',
      format: 'umd',
      name: 'Restoa',
      exports: 'named',
      globals: {
        react: 'React',
      },
    },
    external,
    plugins,
  },
];

export default DefaultConfig;
