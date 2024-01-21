import {logger} from '@/libs/logger.js'
import {SSE_Emitter} from '@/libs/power_state'

export async function GET({request}){

    logger.info("power_events> get()")
    
    const stream = new ReadableStream({
            start(controller){
                const events_listener = (devices)=>{
                    if(controller){
                        logger.verbose("power_events> SSE_Emitter 'power'")
                        const data = `data: ${JSON.stringify(devices)}\r\n\r\n`;
                        controller.enqueue(data)
                    }else{
                        logger.warn("power_events> no sse_controller")
                    }
                }
                SSE_Emitter.removeAllListeners('power')
                SSE_Emitter.on('power',events_listener)
            },
            cancel(){
                logger.info("power_events> cancel() closing")
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
