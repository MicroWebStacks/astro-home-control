import fs from 'fs'
import mqtt  from 'mqtt'
import {logger} from './logger.js'
import events from 'events'
import {root_dir} from './utils'
import * as dotenv from 'dotenv'
dotenv.config()

const connect_options = {clientId : 'astro_control_'+Math.random().toString(16).substr(2, 8)}
const subscribe_options = {qos:2}
const publish_options = {qos:2, retain:false}

const Emitter = new events.EventEmitter()

const config = JSON.parse(fs.readFileSync(root_dir()+'/src/config/mqtt.json'))

var client = null;

function onConnect() {
  config.mqtt.subscriptions.forEach((topic)=>{
    client.subscribe(topic,subscribe_options)
  })
  logger.info("onConnect");
}

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    logger.warn("onConnectionLost:"+responseObject.errorMessage);
  }
}

function onMessageArrived(topic,message) {
  logger.debug(`mqtt> ${topic} : ${message}`);
  Emitter.emit('heat',{topic:topic,msg:message});
  Emitter.emit('power',{topic:topic,msg:message});
}

function start(){
  if(client == null){
    logger.info(`creating client connection to ${process.env.MQTT_HOST}:${config.mqtt.port}`);
    client = mqtt.connect(`mqtt://${process.env.MQTT_HOST}:${config.mqtt.port}`,connect_options);
    client.on('connect',onConnect);
    client.onConnectionLost = onConnectionLost;
    client.on('message',onMessageArrived);
  }
  else if(!client.connected){
    logger.info("reconnecting");
    client.reconnect()
  }
}

function publish(topic,message){
  start()
  client.publish(topic,message,publish_options)
}
//----------------------------------------------------------------------------------
export{
  start,
  Emitter,
  publish
}
