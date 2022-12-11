function event(element,event_name,data=null){
	var event = new CustomEvent(event_name, {detail:data});
	element.dispatchEvent(event);
}

function window_event(event_name,data){
	var event = new CustomEvent(event_name, {detail:data});
	window.dispatchEvent(event);
}


async function async_put(url, data) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  return await response.json()
}

async function async_fetch(url){
  const response = await fetch(url)
  return await response.json()
}


export{
  async_put,
  async_fetch,
  event,
  window_event
}
