import fs from 'fs'
import mqtt  from 'mqtt'
import {logger} from './logger.js'
import events from 'events'
import {root_dir} from './utils'
import * as dotenv from 'dotenv'
dotenv.config()

const Emitter = new events.EventEmitter()

const config = JSON.parse(fs.readFileSync(root_dir()+'/src/config/mqtt.json'))

var client = null;

const options = {qos:2, retain:false}

function onConnect() {
  config.mqtt.subscriptions.forEach((topic)=>{
    client.subscribe(topic)
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
  Emitter.emit('mqtt',{topic:topic,msg:message});
}

function start(){
  if(client == null){
    logger.info(`creating client connection to ${process.env.MQTT_HOST}:${config.mqtt.port}`);
    client = mqtt.connect(`mqtt://${process.env.MQTT_HOST}:${config.mqtt.port}`);//unused config.mqtt.clien_id
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
  client.publish(topic,message,options)
}
//----------------------------------------------------------------------------------
export{
  start,
  Emitter,
  publish
}
