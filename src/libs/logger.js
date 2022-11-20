import fs from 'fs'
import {transports,createLogger, format} from 'winston'
import {root_dir,log_file_path} from './utils'
import * as dotenv from 'dotenv'
dotenv.config()

const config = JSON.parse(fs.readFileSync(root_dir()+'/src/config/mqtt.json'))

let filename = log_file_path(config)
let ex_filename = filename + ".exception.log"

const logger = createLogger({
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

logger.info(`logger> filename : ${filename}`);
logger.error("logger> error check");
logger.warn("logger> warn check");
logger.info("logger> info check");
logger.verbose("logger> verbose check");
logger.debug("logger> debug check");

export{
  logger
}
