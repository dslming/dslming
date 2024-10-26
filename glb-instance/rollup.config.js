import terser from '@rollup/plugin-terser';

export default {
	input: 'src/Main.js',
	output: {
    path: './dist',
		file: 'bundle.js',
		format: 'esm'
	},
  plugins: [
    terser(),
  ],
};

