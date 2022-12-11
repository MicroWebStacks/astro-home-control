import { logger } from '@/libs/logger.js'
import {get_devices} from '@/libs/heat_state'

export async function put({params,request}){
  logger.verbose("api/heat> put()")
  const content = await request.json()
  const device = content.name
  const devices = get_devices()
  const devices_list = Object.keys(devices)

  if((!"device" in reqj) ||(!devices_list.includes(reqj.device))){
    logger.error(`api/heat> no '${device}' device available for control`)
    return new Response({}, {
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
    });        
  }

  //TODO publish content to MQTT

  return new Response(JSON.stringify(devices[reqj.device]), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });    
}

//not used by app as SSE are sent
export async function get(){
  const devices = get_devices()
  const device = params.device
  if(!Object.keys(devices).includes(device)){
      logger.error(`api/heat> device : '${device}' not available`)
      return new Response(JSON.stringify({state:"off"}), {
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

