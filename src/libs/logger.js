import fs from 'fs'
import {transports,createLogger, format} from 'winston'
import {root_dir} from './utils'

const config = JSON.parse(fs.readFileSync(root_dir()+'/src/config/mqtt.json'))

let date = new Date().toISOString()
let date_day = date.split('T')[0]
let filename = root_dir()+config.log.logfile.replace("(date)",date_day)
let ex_filename = root_dir()+config.log.exceptions_log_file.replace("(date)",date_day)

console.log(filename)
console.log(ex_filename)

var logger = createLogger({
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

export{
  logger
}
