import {logger} from '@/libs/logger.js'
import {SSE_Emitter} from '@/libs/heat_state'

export async function get({request}){

    logger.info("heat_events> get()")
    
    //const data = `data: ${JSON.stringify({message:"First"})}\n\n`;
    const body = new ReadableStream({
        start(controller){
            const events_listener = (devices)=>{
                if(controller){
                    logger.info("heat_events> SSE_Emitter 'heat'")
                    const data = `data: ${JSON.stringify(devices)}\r\n\r\n`;
                    controller.enqueue(data)
                }else{
                    logger.warn("heat_events> no sse_controller")
                }
            }
            SSE_Emitter.off('heat',events_listener)
            SSE_Emitter.on('heat',events_listener)
        },
        cancel(){
            logger.info("heat_events> cancel() closing")
            if(sse_controller){
                sse_controller.close()
            }
        }
    })

    return new Response(body, {
        status: 200,
        headers: {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'          
        }
    });
}
