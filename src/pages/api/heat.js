import { logger } from '@/libs/logger.js'
import {get_devices} from '@/libs/heat_state'
import {publish} from '@/libs/mqtt'

export async function PUT({params,request}){
  logger.verbose("api/heat> put()")
  const content = await request.json()
  const name = content.device
  const devices = get_devices()
  const devices_list = Object.keys(devices)

  if(!("device" in content) || (!devices_list.includes(content.device))){
    logger.error(`api/heat> no '${name}' device available for control`)
    return new Response({}, {
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
    });        
  }

  let topic = devices[name].heater.topic+"/set"
  let payload = JSON.stringify({current_heating_setpoint:parseInt(content.setpoint,10)})
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
  logger.verbose("api/heat> get()")
  return new Response(JSON.stringify({devices}), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });    
}

logger.info("api/heat> init")
