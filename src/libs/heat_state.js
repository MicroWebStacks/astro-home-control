import {logger} from './logger.js'
import * as mqtt from '@/libs/mqtt.js'
import events from 'events'

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

const devices_list = ["livingroom","bedroom","kitchen","bathroom","office"]

function get_devices(){
  return devices
}

function get_device(name){
  return devices[name]
}

function set_device(name,state,power){
  devices[name].state = state
  devices[name].power = power
  logger.debug(`api/power> ${name} updated to ${state} (${power} W)`)
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
    for (const [name, value] of Object.entries(devices)) {
      if(data.topic == value.topic){
        const obj = JSON.parse(data.msg)
        set_device(name,obj.state,obj.power)
      }
    }
    logger.verbose("power_state> mqtt.Emitter->SSE_Emitter 'power'")
    SSE_Emitter.emit('power',devices)//could debounce, but then adds latency
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
