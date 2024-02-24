
import {event} from "./client_utils.js"
console.log("client:power> script()")
function dispatch_power_state(data){
    Object.keys(data).forEach((name)=>{
        const card = document.querySelector(`.card[data-name="${name}"]`)
        if(card){
            event(card,"update",data[name])
        }
    })
}
function setup_sse(){
    const evtSource = new EventSource("/api/power_events")

    evtSource.onmessage = (event) => {
        dispatch_power_state(JSON.parse(event.data))
    }
    evtSource.onerror = (err) => {
          console.error("EventSource failed:", err);
          evtSource.close();
    };	
}
setup_sse()

