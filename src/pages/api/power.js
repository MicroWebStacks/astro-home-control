import {delay} from '@/libs/utils'
import {logger} from '@/libs/logger.js'
import  {get_devices} from '@/libs/power_state'
import {publish} from '@/libs/mqtt'

export async function put({request}){
  logger.info(`api/power> put()`)
  const content = await request.json()
  const device = content.name
  const devices = get_devices()
  const devices_list = Object.keys(devices)
    if(!devices_list.includes(device)){
        logger.error(`api/power> no '${device}' device available for control`)
        return new Response(JSON.stringify({state:"off"}), {
            status: 404,
            headers: {
              "Content-Type": "application/json"
            }
          });        
    }

    if("state" in content){
      if((device !="pc") || (content.state == true)){//pc only goes on not off
        logger.verbose(`api/power> => setting ${device} to ${content.state}`)
        const topic = devices[device].control
        const value = JSON.stringify({state:content.state.toUpperCase()})
        publish(topic,value)
        await delay(1000)
      }
    }

    logger.verbose(`api/power> put() ${device} = set ${content.state}/ get ${devices[device].state}`)
    return new Response(JSON.stringify({state:devices[device].state}), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });    
}

//not used by app as SSE are sent
export async function get({params}){

  const devices = get_devices()
  const device = params.device
  if(!Object.keys(devices).includes(device)){
      logger.error(`api/power> device : '${device}' not available`)
      return new Response(JSON.stringify({state:"off"}), {
        status: 404,
        statusText: `No ${device} device available`,
        headers: {
          "Content-Type": "application/json"
        }
      });        
  }

  logger.verbose(`api/power> get() ${device} = ${devices[device].state}`)
  return new Response(JSON.stringify({state:devices[device].state}), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });    
}

logger.info("api/power> init")
