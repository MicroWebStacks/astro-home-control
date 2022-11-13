import node from '@astrojs/node'
import { defineConfig } from 'astro/config';

import * as dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  output: "server",
  server:{
    port:parseInt(process.env.SERVER_PORT),
    host:true
  },
  adapter: node({
    mode: 'standalone'
  })
});
