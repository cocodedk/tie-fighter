import { readFile } from 'node:fs/promises';
import { defineConfig } from 'vite';
import siteMetadata from './scripts/site-meta.js';

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/tie-fighter/' : '/',
  build: { rolldownOptions: { input: ['index.html', 'fa/index.html'] } },
  plugins: [siteMetadata(), {
    name: 'publish-llms',
    async generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: await readFile('llms.txt', 'utf8') });
    },
  }],
}));
