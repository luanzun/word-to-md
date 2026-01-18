/*
 * @Author: fusemsg fuyun365@gmail.com
 * @Date: 2026-01-16 16:39:45
 * @LastEditors: fusemsg fuyun365@gmail.com
 * @LastEditTime: 2026-01-18 12:33:09
 * @FilePath: \word-to-md\rollup.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/main.ts',
  output: {
    dir: '.',
    format: 'cjs',
    exports: 'default',
    sourcemap: true,
  },
  external: ['obsidian'],
  plugins: [
    typescript(),
    nodeResolve({ browser: true }),
    commonjs(),
  ],
};