import {hostname} from 'os'
import fs from 'fs'
import mqtt  from 'mqtt'
import {logger} from './logger.js'
import events from 'events'
import {root_dir} from './utils.js'
import * as dotenv from 'dotenv'

dotenv.config()

const connect_options = {
  clientId : `astro_control_webapp#${hostname()}`,
  keepalive : 60,
  //reconnectPeriod: 30000,
  resubscribe: true     //default is true
}

const subscribe_options = {qos:2}
const publish_options = {qos:2, retain:false}

const Emitter = new events.EventEmitter()

const config_file = root_dir()+'/src/config/mqtt.json'
logger.info(`mqtt> loading config from '${config_file}'`)
const config = JSON.parse(fs.readFileSync(config_file))

let client = null;

function onConnect(connack) {
  config.mqtt.subscriptions.forEach((topic)=>{
    client.subscribe(topic,subscribe_options)
  })
  logger.info("mqtt> onConnect()");
  //console.log(connack)
}

function onConnectionLost(responseObject) {
  logger.warn("mqtt> onConnectionLost() :"+responseObject.errorMessage);
}

function onMessageArrived(topic,message) {
  //All power topics have "socket" all others are heat
  logger.verbose(`mqtt> onMessageArrived() topic:${topic} message:${message.toString()}`);
  if(topic.includes("socket")){
    Emitter.emit('power',{topic:topic,msg:message});
  }else{
    Emitter.emit('heat',{topic:topic,msg:message});
  }
}

function start(){
  if(client == null){
    logger.info(`mqtt start> connecting (${connect_options.clientId}) to ${process.env.MQTT_HOST}:${config.mqtt.port}`);
    client = mqtt.connect(`mqtt://${process.env.MQTT_HOST}:${config.mqtt.port}`,connect_options);
    client.on('connect',onConnect);
    client.onConnectionLost = onConnectionLost;
    client.on('message',onMessageArrived);
  }
  else if(!client.connected){
    logger.warn("mqtt start> client not connected");
  }
}

function publish(topic,message){
  if(!client.connected){
    logger.warn("mqtt> client not connected");
  }else{
    logger.verbose("mqtt> publish()")
    client.publish(topic,message,publish_options)
  }
}
//----------------------------------------------------------------------------------
export{
  start,
  Emitter,
  client,
  publish
}
