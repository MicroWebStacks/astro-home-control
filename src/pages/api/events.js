import {logger} from '../../libs/logger.js'

let counter = 0

export async function get({request}){

    logger.info("api/events> get()")
    
    //const data = `data: ${JSON.stringify({message:"First"})}\n\n`;
    let timerId = undefined
    const body = new ReadableStream({
        start(controller){
            timerId = setInterval(()=>{
                //const data = new TextEncoder().encode("data: hello\r\n\r\n")
                const data = `data: ${JSON.stringify({counter:counter})}\r\n\r\n`;
                counter += 1
                console.log(`Interval> ${counter}`)
                controller.enqueue(data)
            }, 5000)
        },
        cancel(){
            if(typeof timerId === "number"){
                clearInterval(timerId)
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
