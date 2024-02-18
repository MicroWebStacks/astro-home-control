import {logger} from '@/libs/logger.js'
import {SSE_Emitter} from '@/libs/heat_state'

export async function GET({request}){

    logger.info("heat_events> get()")
    
    var heat_events_listener

    const stream = new ReadableStream({
        start(controller){
            heat_events_listener = (devices)=>{
                if(controller){
                    logger.verbose("heat_events> SSE_Emitter 'heat'")
                    const data = `data: ${JSON.stringify(devices)}\r\n\r\n`;
                    controller.enqueue(data)
                }else{
                    logger.warn("heat_events> no sse_controller")
                }
            }
            SSE_Emitter.off('heat',heat_events_listener)
            SSE_Emitter.on('heat',heat_events_listener)
        },
        cancel(){
            logger.info("heat_events> cancel() closing")
            SSE_Emitter.removeListener('heat', heat_events_listener)
        }
    })

    return new Response(stream, {
        status: 200,
        headers: {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'          
        }
    });
}
