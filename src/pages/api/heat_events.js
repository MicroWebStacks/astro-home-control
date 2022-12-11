import {logger} from '@/libs/logger.js'
import {SSE_Emitter} from '@/libs/heat_state'

let sse_controller = null

export async function get({request}){

    logger.info("api/events> get()")
    
    //const data = `data: ${JSON.stringify({message:"First"})}\n\n`;
    const body = new ReadableStream({
        start(controller){
            sse_controller = controller
            SSE_Emitter.on('heat',(devices)=>{
                if(controller){
                    logger.info("heat_events> SSE_Emitter 'heat'")
                    const data = `data: ${JSON.stringify(devices)}\r\n\r\n`;
                    controller.enqueue(data)
                }else{
                    logger.warn("heat_events> no sse_controller")
                }
            })
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
