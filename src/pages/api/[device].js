
const devices = ["poster","lifx","mesh","pc"]

export async function put({params,request}){
    const device = params.device

    if(!devices.includes(device)){
        console.error(`device : '${device}' not available`)
        return new Response(null, {
            status: 404,
            statusText: `Device ${device} not available`
          });        
    }

    const content = await request.json()
    console.log(content)

    return new Response(JSON.stringify(content), {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      });    
}
