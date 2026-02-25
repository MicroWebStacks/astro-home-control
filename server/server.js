import express from 'express';
import { handler as ssrHandler } from '../dist/server/entry.mjs';
import { logger } from '../src/libs/logger.js';

import * as dotenv from 'dotenv'
dotenv.config()

const app = express();
app.use(express.static('dist/client/'))
app.use(ssrHandler);

app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!")
  })

logger.info(`server> listening on http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`)

app.listen(process.env.SERVER_PORT);
