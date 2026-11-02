exports.handler = async (event) => {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=15' };
  const params = event.queryStringParameters || {};
  const lat = Number(params.lat), lon = Number(params.lon);
  if (params.lat == null || params.lon == null || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid coordinates' }) };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const url = `https://api.adsb.lol/v2/point/${lat.toFixed(4)}/${lon.toFixed(4)}/100`;
    const response = await fetch(url, { signal: controller.signal, headers: { accept: 'application/json', 'user-agent': 'SkyTraceAR/0.4 (personal hobby project)' } });
    if (!response.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: `Aircraft provider HTTP ${response.status}` }) };
    }
    const json = await response.json();
    if (!Array.isArray(json.ac)) throw new Error('Invalid provider response');
    const aircraft = json.ac.filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lon) && (p.seen_pos == null || p.seen_pos < 120)).slice(0, 200).map(p => ({
      id: String(p.hex || ''), callsign: String(p.flight || '').trim(), latitude: p.lat, longitude: p.lon,
      altitudeFt: typeof p.alt_baro === 'number' ? p.alt_baro : (typeof p.alt_geom === 'number' ? p.alt_geom : null),
      speedKt: typeof p.gs === 'number' ? p.gs : null, track: typeof p.track === 'number' ? p.track : null,
      seen: typeof p.seen_pos === 'number' ? p.seen_pos : (typeof p.seen === 'number' ? p.seen : null)
    }));
    return { statusCode: 200, headers, body: JSON.stringify({ aircraft, source: 'adsb.lol', time: Date.now() }) };
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: e.name === 'AbortError' ? 'Aircraft provider timed out' : 'Aircraft provider unavailable', detail: String(e.message || e).slice(0, 120) }) };
  } finally { clearTimeout(timeout); }
};
