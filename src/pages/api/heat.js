import { logger } from '@/libs/logger.js'
import {get_devices} from '@/libs/heat_state'
import {publish} from '@/libs/mqtt'

export async function PUT({params,request}){
  logger.verbose("api/heat> put()")
  const content = await request.json()
  const name = content.device
  const devices = get_devices()
  const devices_list = Object.keys(devices)

  if((!"device" in content) ||(!devices_list.includes(content.device))){
    logger.error(`api/heat> no '${name}' device available for control`)
    return new Response({}, {
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
    });        
  }

  //TODO publish content to MQTT
  let topic = devices[name].heater.topic+"/set"
  let payload = JSON.stringify({current_heating_setpoint:content.setpoint})
  publish(topic,payload)
  console.log(`heat.js> to set ${name} to ${content.setpoint}`)
  return new Response(JSON.stringify(devices[name]), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });    
}

//not used by app as SSE are sent
export async function GET(){
  const devices = get_devices()
  const device = params.device
  if(!Object.keys(devices).includes(device)){
      logger.error(`api/heat> device : '${device}' not available`)
      return new Response(JSON.stringify({state:"OFF"}), {
        status: 404,
        statusText: `No ${device} device available`,
        headers: {
          "Content-Type": "application/json"
        }
      });        
  }

  logger.verbose(`api/heat> get() ${device} = ${devices[device].name}`)
  return new Response(JSON.stringify({device:devices[device]}), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });    
}

logger.info("api/heat> init")

