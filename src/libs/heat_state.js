import {logger} from './logger.js'
import * as mqtt from '@/libs/mqtt.js'
import events from 'events'

import { convert_last_seen_minutes } from './utils.js'

const SSE_Emitter = new events.EventEmitter()

const devices = {
  livingroom:{
      name:"Livingroom",
      heater:{
          topic:"lzig/living heat",
          last_seen_mn:"Not seen",
          data:{}
      },
      ambient:{
          topic:"nrf/livingroom tag"
      },
      metal:{
          topic:"lzig/living heat weather",
          data:{}
      }
  },
  bedroom:{
      name:"Bedroom",
      heater:{
          topic:"lzig/bedroom heat",
          last_seen_mn:"Not seen",
          data:{}
      },
      ambient:{
          topic:"nrf/bedroom tag"
      },
      metal:{
          topic:"lzig/bedroom heat weather",
          data:{}
      }
  },
  kitchen:{
      name:"Kitchen",
      heater:{
          topic:"lzig/kitchen heat",
          last_seen_mn:"Not seen",
          data:{}
      },
      ambient:{
          topic:"nrf/kitchen tag"
      },
      metal:{
          topic:"lzig/kitchen heat weather",
          data:{}
      }
  },
  bathroom:{
      name:"Bathroom",
      heater:{
          topic:"lzig/bathroom heat",
          last_seen_mn:"Not seen",
          data:{}
      },
      ambient:{
          topic:"nrf/bathroom tag"
      },
      metal:{
          topic:"lzig/bathroom heat weather",
          data:{}
      }
  },
  office:{
      name:"Office",
      heater:{
          topic:"lzig/office heat",
          last_seen_mn:"Not seen",
          data:{}
      },
      ambient:{
          topic:"nrf/office tag"
      },
      metal:{
          topic:"lzig/office heat weather",
          data:{}
      }
  }
}

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
  logger.debug(`api/heat> ${name} updated`)
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
          if(updated_devices[name].heater.data.last_seen){
            updated_devices[name].heater.last_seen_mn = convert_last_seen_minutes(updated_devices[name].heater.data)
            //console.log(`${name} ${subdevice} last seen : ${updated_devices[name].heater.last_seen_mn}`)
          }
        }
      })
    }
    logger.info(`heat_state> mqtt.Emitter.on(heat) ${data.topic}`)
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
