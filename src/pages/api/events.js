import {logger} from '../../libs/logger.js'

let responses = []

function remove(item,array){
    const index = array.indexOf(item)
    if(index > -1){
        array.splice(index,1)
    }
}

export async function get({request}){

    logger.info("api/events> get()")
    const data = `data: ${JSON.stringify({message:"First"})}\n\n`;
    const response = new Response(data, {
        status: 200,
        headers: {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'          
        }
    });
    //request.on('close',()=>{
    //    remove(response,responses)
    //})
    //responses.push(response)
    return response;
    //keep getting error on return
}

//setInterval(()=>{
//    responses.forEach((response)=>{
//        response.write(JSON.stringify({message:"hi"}))
//    })
//},5000)
