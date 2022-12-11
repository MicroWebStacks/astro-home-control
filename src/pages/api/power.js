import * as mqtt from '../../libs/mqtt.js'
import {delay} from '../../libs/utils'
import {logger} from '../../libs/logger.js'


const devices = {
  poster:{
      topic:"lzig/poster socket",
      control:"lzig/poster socket/set",
      media_on:"/media/poster.png",
      media_off:"/media/poster-dark.png",
      state:"off",power:0,disabled:false
  },
  lifx:{
      topic:"lzig/lifx socket",
      control:"lzig/lifx socket/set",
      media_on:"/media/lifx.png",
      media_off:"/media/lifx-dark.png",
      state:"off",power:0,disabled:false
  },
  mesh:{
      topic:"lzig/wifi mesh socket",
      control:"lzig/wifi mesh socket/set",
      media_on:"/media/wifi-on.png",
      media_off:"/media/wifi-off.png",
      state:"off",power:0,disabled:false
  },
  pc:{
      topic:"lzig/pc socket",
      control:"lzig/pc socket/set",
      media_on:"/media/pc.png",
      media_off:"/media/pc.png",
      state:"off",power:0,disabled:true
  },
}

const devices_list = ["lifx","mesh","poster","pc"]

export async function put({request}){
  logger.info(`api/power> put()`)
  const content = await request.json()
  const device = content.name
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
        mqtt.publish(topic,value)
        logger.verbose(`api/power> publish '${topic}' => '${value}'`)
        logger.verbose(`api/power> client.connected = '${mqtt.client.connected}'`)
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

export async function get({params}){

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

mqtt.Emitter.on('power',(data)=>{
  try{
    for (const [name, value] of Object.entries(devices)) {
      if(data.topic == value.topic){
        value.state = JSON.parse(data.msg).state
        logger.debug(`api/power> ${name} updated to ${value.state}`)
      }
    }
  }catch(e){
    logger.info(`Handling all exceptions : ${e.message}`)
  }
})

logger.info("api/power> init")
mqtt.start()
