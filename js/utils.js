// Format coordinates to Degrees, Decimal Minutes (DDM)
function toDDM(lat, lng) {
  const latNs = lat >= 0 ? 'N' : 'S';
  const absLat = Math.abs(lat);
  const latDeg = Math.floor(absLat);
  const latMin = ((absLat - latDeg) * 60).toFixed(3);

  const lngEw = lng >= 0 ? 'E' : 'W';
  const absLng = Math.abs(lng);
  const lngDeg = Math.floor(absLng);
  const lngMin = ((absLng - lngDeg) * 60).toFixed(3);

  const latStr = `${String(latDeg).padStart(2, '0')}° ${String(latMin).padStart(6, '0')}' ${latNs}`;
  const lngStr = `${String(lngDeg).padStart(3, '0')}° ${String(lngMin).padStart(6, '0')}' ${lngEw}`;

  return { ddm: `${latStr} | ${lngStr}`, latStr, lngStr };
}

// Calculate distance between two lat/lon pairs in Nautical Miles (Great Circle / Haversine)
function calcDistanceNM(lat1, lon1, lat2, lon2) {
  const R = 3440.065;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Calculate true bearing between two lat/lon pairs
function calcBearing(lat1, lon1, lat2, lon2) {
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

// Calculate Course To Steer (CTS) and Speed Over Ground (SOG) accounting for tidal current
function calcCTS(track, stw, setDir, drift) {
  if (stw <= 0) return { cts: track, sog: 0 };
  const trackRad = track * Math.PI / 180;
  const setRad = setDir * Math.PI / 180;
  const angle = setRad - trackRad;
  const sinDriftAngle = (drift * Math.sin(angle)) / stw;

  if (Math.abs(sinDriftAngle) > 1) return { cts: track, sog: 0 };

  const driftAngle = Math.asin(sinDriftAngle);
  const cts = ((trackRad - driftAngle) * 180 / Math.PI + 360) % 360;
  const sog = stw * Math.cos(driftAngle) + drift * Math.cos(angle);

  return { cts, sog: Math.max(0, sog) };
}

// Geometry intersection test between two line segments
function linesIntersect(p1, p2, p3, p4) {
  function ccw(A, B, C) {
    return (C.lat - A.lat) * (B.lng - A.lng) > (B.lat - A.lat) * (C.lng - A.lng);
  }
  return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
}

// Check if a line segment crosses any segment of a polygon
function checkSegmentIntersection(p1, p2, polygonCoords) {
  for (let i = 0; i < polygonCoords.length; i++) {
    const p3 = { lat: polygonCoords[i][0], lng: polygonCoords[i][1] };
    const nextIdx = (i + 1) % polygonCoords.length;
    const p4 = { lat: polygonCoords[nextIdx][0], lng: polygonCoords[nextIdx][1] };

    if (linesIntersect(p1, p2, p3, p4)) return true;
  }
  return false;
}

// Extract coordinate pairs from Leaflet.draw layer
function getLayerCoords(layer) {
  let latLngs = layer.getLatLngs();
  if (Array.isArray(latLngs[0])) latLngs = latLngs[0];
  return latLngs.map(ll => [ll.lat, ll.lng]);
}