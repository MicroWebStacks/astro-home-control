
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
  async_fetch
}
