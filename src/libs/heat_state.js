import {logger} from './logger.js'
import * as mqtt from '@/libs/mqtt.js'
import events from 'events'
import heat_devices from '@/config/heat_devices.json'

import { convert_last_seen_minutes } from './utils.js'

const SSE_Emitter = new events.EventEmitter()

const devices = heat_devices

function get_devices(){
  return devices
}

function get_device(name){
  return devices[name]
}

function set_device(name,subdevice,data){
  if(subdevice == "ambient"){
    if("temperature" in data){//these messages alternate between light and temp,hum,...
      devices[name].ambient.temperature = data.temperature
      devices[name].ambient.humidity = data.humidity
    }
  }else{
    devices[name][subdevice].data = data
  }
  if(devices[name].heater.data.last_seen){
    devices[name].heater.last_seen_mn = convert_last_seen_minutes(devices[name].heater.data)
  }
  logger.info(`api/heat> ${name} updated`)
  return devices[name]
}

//just for the import to ensure running body once
function start(){
  logger.info("heat_state> start()")
}

//run once 
logger.info("heat_state> init")
mqtt.start()

mqtt.Emitter.on('heat',(data)=>{
  try{
    let updated_devices = {}
    for (const [name, device] of Object.entries(devices)) {
      ["heater","ambient","metal"].forEach((subdevice)=>{
        if(data.topic == device[subdevice].topic){
          updated_devices[name] = set_device(name,subdevice,JSON.parse(data.msg))
        }
      })
    }
    logger.verbose(`heat_state> mqtt.Emitter.on(heat) ${data.topic}`)
    SSE_Emitter.emit('heat',updated_devices)//could debounce, but then adds latency
  }catch(e){
    logger.error(`Handling all exceptions : ${e.message}`)
  }
})

export{
  get_devices,
  get_device,
  start,
  SSE_Emitter
}
