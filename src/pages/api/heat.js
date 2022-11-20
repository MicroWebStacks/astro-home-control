import { logger } from '../../libs/logger.js'
import * as mqtt from '../../libs/mqtt.js'

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

export async function put({params,request}){
  logger.verbose("api/heat> put()")
  const reqj = await request.json()
  console.log(reqj)

  if((!"device" in reqj) ||(!devices_list.includes(reqj.device))){
    logger.error(`api/heat> no '${device}' device available for control`)
    return new Response({}, {
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
    });        
  }

  return new Response(JSON.stringify(devices[reqj.device]), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });    
}

export async function get(){
  logger.verbose("api/heat> get()")

  return new Response(JSON.stringify(devices), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });    
}

mqtt.Emitter.on('heat',(data)=>{
  try{
    for (const [name, value] of Object.entries(devices)) {
      if(data.topic == value.heater.topic){
        value.heater.data = JSON.parse(data.msg)
        logger.debug(`api/heat> ${name} updated heater`)
      }else if(data.topic == value.ambient.topic){
        const measures = JSON.parse(data.msg)
        if("temperature" in measures){
          value.ambient.temperature = measures.temperature
          value.ambient.humidity = measures.humidity
          logger.debug(`api/heat> ${name} updated temperature humidity`)
        }
      }else if(data.topic == value.metal.topic){
        value.metal.data = JSON.parse(data.msg)
        logger.debug(`api/heat> ${name} updated metal heat`)
      }
    }
  }catch(e){
    logger.info(`api/heat> Handling all exceptions : ${e.message}`)
  }
})

logger.info("api/heat> init")
mqtt.start()
