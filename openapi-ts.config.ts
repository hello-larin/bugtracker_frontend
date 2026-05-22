import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: {
    path: 'docs/swagger.yaml',
  },
  output: 'src/generated',
  client: '@hey-api/client-fetch',
  plugins: [
    '@hey-api/sdk',
    '@tanstack/react-query',
  ],
});