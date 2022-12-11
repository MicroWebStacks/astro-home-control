import {logger} from '@/libs/logger.js'
import {SSE_Emitter} from '@/libs/power_state'

let sse_controller = null

export async function get({request}){

    logger.info("api/events> get()")
    
    //const data = `data: ${JSON.stringify({message:"First"})}\n\n`;
    const body = new ReadableStream({
        start(controller){
            sse_controller = controller
            SSE_Emitter.on('power',(devices)=>{
                if(controller){
                    logger.info("power_events> SSE_Emitter 'power'")
                    const data = `data: ${JSON.stringify(devices)}\r\n\r\n`;
                    controller.enqueue(data)
                }else{
                    logger.warn("power_events> no sse_controller")
                }
            })
        },
        cancel(){
            logger.info("power_events> cancel() closing")
            sse_controller.close()
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

