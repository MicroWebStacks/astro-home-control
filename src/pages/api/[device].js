import {readFileSync} from 'fs'
import * as mqtt from '../../libs/mqtt.js'
import {root_dir} from '../../libs/utils'

const config = JSON.parse(readFileSync(root_dir()+'/src/config/mqtt.json'))

const devices = {
  poster:{
      topic:"lzig/poster socket",
      control:"lzig/poster socket/set",
      media_on:"/media/poster.png",
      media_off:"/media/poster-dark.png",
      state:"Init",power:0,disabled:false
  },
  lifx:{
      topic:"lzig/lifx socket",
      control:"lzig/lifx socket/set",
      media_on:"/media/lifx.png",
      media_off:"/media/lifx-dark.png",
      state:"Init",power:0,disabled:false
  },
  mesh:{
      topic:"lzig/wifi mesh socket",
      control:"lzig/wifi mesh socket/set",
      media_on:"/media/wifi-on.png",
      media_off:"/media/wifi-off.png",
      state:"Init",power:0,disabled:false
  },
  pc:{
      topic:"lzig/pc socket",
      control:"lzig/pc socket/set",
      media_on:"/media/pc.png",
      media_off:"/media/pc.png",
      state:"Init",power:0,disabled:true
  },
}

const controllable_devices = ["lifx","mesh","poster"]

export async function put({params,request}){
  console.log(params)
    const device = params.device
    if(!controllable_devices.includes(device)){
        console.error(`no '${device}' device available for control`)
        return new Response(null, {
            status: 404,
            statusText: `Device ${device} not available`
          });        
    }

    const content = await request.json()
    if("state" in content){
      console.log(` => setting ${device} to ${content.state}`)
      mqtt.publish(devices[device].control,`{"state":"${content.state}"}`)
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
      return new Response(null, {
          status: 404,
          statusText: `No ${device} device available`
        });        
  }

  return new Response(JSON.stringify({state:devices[device].state}), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });    
}

mqtt.Emitter.on('mqtt',(data)=>{
  try{
    for (const [name, value] of Object.entries(devices)) {
      if(data.topic == value.topic){
        value.state = JSON.parse(data.msg).state
        console.log(`${name} updated to ${value.state}`)
      }
    }
  }catch(e){
    logger.info(`Handling all exceptions : ${e.message}`)
  }
})

mqtt.start()
