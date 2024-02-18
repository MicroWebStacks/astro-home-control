import {logger} from './logger.js'
import * as mqtt from '@/libs/mqtt.js'
import events from 'events'
import power_devices from '@/config/power_devices.json'

const SSE_Emitter = new events.EventEmitter()

const devices = power_devices

function get_devices(){
  return devices
}

function get_device(name){
  return devices[name]
}

function set_device(name,state,power){
  devices[name].state = state
  devices[name].power = power
  logger.info(`api/power> ${name} updated to ${state} (${power} W)`)
  return devices[name]
}

//just for the import to ensure running body once
function start(){
  logger.info("power_state> start()")
}

//run once 
logger.info("power_state> init")
mqtt.start()

mqtt.Emitter.on('power',(data)=>{
  try{
    let updated_devices = {}
    for (const [name, value] of Object.entries(devices)) {
      if(data.topic == value.topic){
        const obj = JSON.parse(data.msg)
        updated_devices[name] = set_device(name,obj.state,obj.power)
      }
    }
    logger.verbose(`power_state> mqtt.Emitter.on(power) ${data.topic}`)
    SSE_Emitter.emit('power',updated_devices)//could debounce, but then adds latency
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
