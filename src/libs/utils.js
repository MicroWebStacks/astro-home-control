import {existsSync,copyFileSync,mkdirSync} from 'fs'
import {resolve,normalize,dirname,join,relative} from 'path'
import {hostname} from 'os'
//import config from '../../astro.config.mjs'

//resolve(reference,relative) does not work due to 'file:\'
function rel_to_abs(reference,relative){
  return join(dirname(normalize(reference)),relative).replace("file:\\","").replace("//","").replace("file:","")
}

//Note 'imp*ort.me*ta.en*v.BA*SE_URL' only works from Astro component not from remark-rel-asset plugin
function relAssetToUrl(relativepath,refdir,baseUrl){
    let newurl = relativepath
    const filepath = join(refdir,relativepath)
    if(existsSync(filepath)){
      console.log(`   * impo*rt.me*ta.ur*l = ${import.meta.url}`)

      let rootdir = rel_to_abs(import.meta.url,"../..")
      if(import.meta.env.PROD){
        rootdir = rel_to_abs(import.meta.url,"..")
      }
      console.log(`   * rootdir = '${rootdir}'`)
      const targetroot = join(rootdir,"public/raw")
      const filerootrel = relative(rootdir,refdir)
      const targetpath = resolve(targetroot,filerootrel)
      const targetfile = join(targetpath,relativepath)
      const targetdir = dirname(targetfile)
      //console.log(`copy from '${filepath}' to '${targetfile}'`)
      const newpath = join("raw/",filerootrel,relativepath)
      newurl = baseUrl+ newpath.replaceAll('\\','/')
      console.log(`  * new asset url = '${newurl}'`)
      if(!existsSync(targetdir)){
        mkdirSync(targetdir,{ recursive: true })
      }
      copyFileSync(filepath,targetfile)
    }

    return newurl
}

function uid(){
  return Date.now()+"_"+Math.floor(Math.random() * 10000)
}

function suid(){
  let date = (Date.now()).toString();
  const sub = date.substring(date.length-6,date.length-1);
  return sub+"_"+Math.floor(Math.random() * 10000)
}

function event(element,event_name,data=null){
	var event = new CustomEvent(event_name, {detail:data});
	element.dispatchEvent(event);
}

function window_event(event_name,data){
	var event = new CustomEvent(event_name, {detail:data});
	window.dispatchEvent(event);
}

function root_dir(){
	return process.cwd()
}

function log_file_path(config){
  let logfile_path = config.log.logfile.default
  if(hostname() in config.log.logfile){
    logfile_path = config.log.logfile[hostname()]
  }

  let date = new Date().toISOString()
  let date_day = date.split('T')[0]
  return root_dir()+'/'+logfile_path.replace("(date)",date_day)
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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


function convert_last_seen_minutes(sensor){
  let result = "No info"
  if("last_seen" in sensor){
    let diff = Date.now() - Date.parse(sensor["last_seen"]);
    if(diff < 0){
      diff = 0;//avoids small clocks discrepancies
    }
    let nb_min = Math.floor(diff / (60*1000));
    if(nb_min < 60){
      result = nb_min+" mn";
    }else if(nb_min > 60){
      let nb_h = Math.floor(nb_min / 60);
      result = nb_h+" h";
    }
  }
  return result
}


export{
    rel_to_abs,
    relAssetToUrl,
    uid,
    suid,
    event,
    window_event,
    root_dir,
    log_file_path,
    delay,
    async_put,
    async_fetch,
    convert_last_seen_minutes
  }
