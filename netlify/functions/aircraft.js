exports.handler = async (event) => {
  const headers = {'content-type':'application/json','cache-control':'public, max-age=10'};
  const lat=Number(event.queryStringParameters?.lat), lon=Number(event.queryStringParameters?.lon);
  if (!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180) return {statusCode:400,headers,body:JSON.stringify({error:'Invalid coordinates'})};
  try {
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),9000);
    let response;
    try {response=await fetch(`https://api.airplanes.live/v2/point/${lat.toFixed(4)}/${lon.toFixed(4)}/100`,{headers:{'user-agent':'SkyTraceAR/0.3 personal noncommercial prototype'},signal:controller.signal});}finally{clearTimeout(timeout)}
    if(!response.ok)throw Error('Aircraft service HTTP '+response.status);
    const json=await response.json();
    const aircraft=(json.ac||[]).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)).slice(0,120).map(p=>({id:String(p.hex||''),callsign:String(p.flight||'').trim(),latitude:p.lat,longitude:p.lon,altitudeFt:typeof p.alt_baro==='number'?p.alt_baro:(typeof p.alt_geom==='number'?p.alt_geom:null),speedKt:typeof p.gs==='number'?p.gs:null,track:typeof p.track==='number'?p.track:null,seen:typeof p.seen==='number'?p.seen:null}));
    return {statusCode:200,headers,body:JSON.stringify({aircraft,source:'airplanes.live',time:Date.now()})};
  } catch(e) {return {statusCode:502,headers,body:JSON.stringify({error:'Aircraft provider unavailable or rate limited'})};}
};

