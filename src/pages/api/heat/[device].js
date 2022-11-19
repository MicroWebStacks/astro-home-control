import {readFileSync} from 'fs'
import * as mqtt from '../../../libs/mqtt.js'
import {root_dir} from '../../../libs/utils'

const devices = {
  livingroom:{
      name:"Livingroom",
      heater:{
          topic:"lzig/living heat",
          last_seen_mn:"Not seen",
          data:{}
      },
      ambient:{
          topic:"nrf/livingroom tag",
          temperature:0
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
          topic:"nrf/bedroom tag",
          temperature:0
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
          topic:"nrf/kitchen tag",
          temperature:0
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
          topic:"nrf/bathroom tag",
          temperature:0
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
          topic:"nrf/office tag",
          temperature:0
      },
      metal:{
          topic:"lzig/office heat weather",
          data:{}
      }
  }
}

const devices_list = ["livingroom","bedroom","kitchen","bathroom","office"]

export async function put({params,request}){
  console.log(params)
    const device = params.device
    if(!devices_list.includes(device)){
        console.error(`no '${device}' device available for control`)
        return new Response(null, {
            status: 404,
            statusText: `Device ${device} not available`
          });        
    }

    const content = await request.json()
    if("state" in content){
      console.log(` => setting ${device} to ${content.state}`)
      //mqtt.publish(devices[device].control,`{"state":"${content.state}"}`)
    }

    return new Response(JSON.stringify(content), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });    
}

export async function get({params}){
  console.log(params)

  const device = params.device
  if(!Object.keys(devices).includes(device)){
      console.error(`device : '${device}' not available`)
      return new Response(JSON.stringify({state:"off"}), {
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
      });    
    }

  return new Response(JSON.stringify({state:devices[device].state}), {
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
        console.log(`${name} updated to pi_heating_demand ${value.heater.data.pi_heating_demand}`)
      }
    }
  }catch(e){
    logger.info(`Handling all exceptions : ${e.message}`)
  }
})

mqtt.start()
