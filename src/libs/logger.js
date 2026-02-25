import fs from 'fs'
import {transports,createLogger, format} from 'winston'
import {root_dir,log_file_path} from './utils.js'
import * as dotenv from 'dotenv'
dotenv.config()

const GLOBAL_LOGGER_KEY = Symbol.for('@microwebstacks/astro-home-control.logger')

let logger = globalThis[GLOBAL_LOGGER_KEY]

if(!logger){
  const config = JSON.parse(fs.readFileSync(root_dir()+'/src/config/mqtt.json'))
  const filename = log_file_path(config)
  const ex_filename = filename + ".exception.log"

  logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.printf(log => {
          return `${log.timestamp} |${log.level}\t| ${log.message}`;
        })
    ),
    transports: [
      new transports.Console({
        level:config.log.level,
        json:false
      }),
      new transports.File({
         level:config.log.level,
         filename: filename ,
         json:false
        })
    ],
    exceptionHandlers: [
      new transports.File({
        filename: ex_filename,
        level:config.log.level,
        json:false
      })
    ]
  });

  globalThis[GLOBAL_LOGGER_KEY] = logger

  logger.info(`logger> filename : ${filename}`);
  logger.error("logger> error check");
  logger.warn("logger> warn check");
  logger.info("logger> info check");
  logger.verbose("logger> verbose check");
  logger.debug("logger> debug check");
}

export{
  logger
}
