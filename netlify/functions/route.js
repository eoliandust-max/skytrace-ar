// Flight route enrichment via public adsbdb.com API. Community data, not a verified flight plan.
exports.handler=async function(event){
 const callsign=String(event.queryStringParameters?.callsign||'').trim().toUpperCase();
 const headers={'Content-Type':'application/json','Cache-Control':'public, max-age=900'};
 if(!/^[A-Z0-9]{3,9}$/.test(callsign))return{statusCode:400,headers,body:JSON.stringify({error:'Invalid callsign'})};
 try{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6500);
  let response;try{response=await fetch('https://api.adsbdb.com/v0/callsign/'+encodeURIComponent(callsign),{signal:controller.signal,headers:{'Accept':'application/json','User-Agent':'SkyTraceAR/0.7'}})}finally{clearTimeout(timer)}
  if(response.status===404)return{statusCode:200,headers,body:JSON.stringify({found:false})};
  if(!response.ok)throw Error('Provider HTTP '+response.status);
  const data=await response.json();const route=data?.response?.flightroute;
  const airport=a=>{if(!a)return null;const lat=Number(a.latitude),lon=Number(a.longitude),code=String(a.iata_code||a.icao_code||'').toUpperCase();if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat>90||lat< -90||lon>180||lon< -180||!/^[A-Z]{3,4}$/.test(code))return null;return{code,city:String(a.municipality||a.name||code).slice(0,90),lat,lon}};
  const origin=airport(route?.origin),destination=airport(route?.destination);
  return{statusCode:200,headers,body:JSON.stringify(origin&&destination?{found:true,origin,destination,source:'adsbdb',note:'Community route mapping; not verified for current flight'}:{found:false})};
 }catch(e){return{statusCode:502,headers:{'Content-Type':'application/json'},body:JSON.stringify({error:'Route provider unavailable'})}}
};
