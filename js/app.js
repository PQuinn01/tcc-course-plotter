// Initialize Map
const map = L.map('map').setView([50.7, -1.3], 10);

// Base Map Layers
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(map);
L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenSeaMap' }).addTo(map);

let markers = [];
let polyline = L.polyline([], { color: '#0284c7', weight: 4, dashArray: '6, 8' }).addTo(map);

// Feature group for drawn hazard polygons
const drawnHazardsGroup = new L.FeatureGroup().addTo(map);

// Initialize Leaflet.draw Controls
const drawControl = new L.Control.Draw({
  position: 'topleft',
  draw: {
    polygon: { shapeOptions: { color: '#ef4444', fillColor: '#f87171', fillOpacity: 0.45, weight: 2 } },
    rectangle: { shapeOptions: { color: '#ef4444', fillColor: '#f87171', fillOpacity: 0.45, weight: 2 } },
    polyline: false,
    circle: false,
    circlemarker: false,
    marker: false
  },
  edit: {
    featureGroup: drawnHazardsGroup,
    remove: true
  }
});
map.addControl(drawControl);

let customHazardCount = 1;

// Handle creation of custom drawn hazards
map.on(L.Draw.Event.CREATED, function (e) {
  const layer = e.layer;
  const defaultName = `Custom Hazard #${customHazardCount++}`;
  const userHazardName = prompt("Enter a name for this custom hazard zone:", defaultName) || defaultName;
  
  layer.hazardName = userHazardName;
  layer.bindTooltip(`<b>⛔ HAZARD: ${userHazardName}</b>`, { sticky: true });
  drawnHazardsGroup.addLayer(layer);
  updateRoute();
});

map.on(L.Draw.Event.EDITED, updateRoute);
map.on(L.Draw.Event.DELETED, updateRoute);

// Render Presets
let shippingLayerGroup = L.layerGroup().addTo(map);
let presetHazardLayerGroup = L.layerGroup().addTo(map);

shippingLanesData.forEach(lane => {
  L.polygon(lane.coords, {
    color: '#a855f7',
    fillColor: '#c084fc',
    fillOpacity: 0.3,
    weight: 2,
    dashArray: '4, 4'
  }).bindTooltip(`<b>⚠️ ${lane.name}</b>`, { sticky: true }).addTo(shippingLayerGroup);
});

hazardZonesData.forEach(hz => {
  L.polygon(hz.coords, {
    color: '#ef4444',
    fillColor: '#f87171',
    fillOpacity: 0.4,
    weight: 2
  }).bindTooltip(`<b>⛔ HAZARD: ${hz.name}</b>`, { sticky: true }).addTo(presetHazardLayerGroup);
});

function toggleOverlays() {
  const showShipping = document.getElementById('toggle-shipping').checked;
  const showHazards = document.getElementById('toggle-hazards').checked;

  if (showShipping) map.addLayer(shippingLayerGroup); else map.removeLayer(shippingLayerGroup);
  if (showHazards) map.addLayer(presetHazardLayerGroup); else map.removeLayer(presetHazardLayerGroup);
}

// Evaluate leg intersections against hazard zones
function getLegWarnings(p1, p2) {
  let warnings = [];

  if (document.getElementById('toggle-shipping').checked) {
    shippingLanesData.forEach(lane => {
      if (checkSegmentIntersection(p1, p2, lane.coords)) {
        warnings.push(`Crosses ${lane.name}`);
      }
    });
  }

  if (document.getElementById('toggle-hazards').checked) {
    hazardZonesData.forEach(hz => {
      if (checkSegmentIntersection(p1, p2, hz.coords)) {
        warnings.push(`CAUTION: Enters ${hz.name}`);
      }
    });
  }

  drawnHazardsGroup.eachLayer(layer => {
    const coords = getLayerCoords(layer);
    if (coords.length >= 3 && checkSegmentIntersection(p1, p2, coords)) {
      warnings.push(`CAUTION: Enters ${layer.hazardName || 'Custom Hazard Area'}`);
    }
  });

  return warnings;
}

function addWaypoint(lat, lng) {
  const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
  marker.on('drag', updateRoute);
  markers.push(marker);
  updateRoute();
}

function addManualWaypoint() {
  const latInput = document.getElementById('manual-lat');
  const lngInput = document.getElementById('manual-lng');
  const lat = parseFloat(latInput.value);
  const lng = parseFloat(lngInput.value);

  if (isNaN(lat) || lat < -90 || lat > 90) return alert('Enter valid Latitude (-90 to 90).');
  if (isNaN(lng) || lng < -180 || lng > 180) return alert('Enter valid Longitude (-180 to 180).');

  addWaypoint(lat, lng);
  map.panTo([lat, lng]);
  latInput.value = '';
  lngInput.value = '';
}

function updateRoute() {
  const coords = markers.map(m => m.getLatLng());
  polyline.setLatLngs(coords);

  const stw = parseFloat(document.getElementById('stw').value) || 6.0;
  const setDir = parseFloat(document.getElementById('set-dir').value) || 0;
  const driftSpd = parseFloat(document.getElementById('drift-spd').value) || 0;
  
  const draft = parseFloat(document.getElementById('draft').value) || 2.0;
  const chartDepth = parseFloat(document.getElementById('chart-depth').value) || 5.0;
  const tideHeight = parseFloat(document.getElementById('tide-height').value) || 0.0;
  const minSafeUkc = parseFloat(document.getElementById('min-safe-ukc').value) || 1.5;

  const totalDepth = chartDepth + tideHeight;
  const ukc = totalDepth - draft;

  document.getElementById('telemetry-depth').innerText = `${totalDepth.toFixed(2)} m`;
  
  const ukcSpan = document.getElementById('telemetry-ukc');
  ukcSpan.innerText = `${ukc.toFixed(2)} m`;
  if (ukc <= 0.5) {
    ukcSpan.style.color = '#ef4444';
  } else if (ukc < minSafeUkc) {
    ukcSpan.style.color = '#f59e0b';
  } else {
    ukcSpan.style.color = '#38bdf8';
  }

  let totalDist = 0;
  let totalTimeHours = 0;
  const listEl = document.getElementById('waypoint-list');
  listEl.innerHTML = '';

  coords.forEach((pt, i) => {
    const { ddm, latStr, lngStr } = toDDM(pt.lat, pt.lng);
    const decDeg = `${pt.lat.toFixed(5)}°, ${pt.lng.toFixed(5)}°`;

    markers[i].bindTooltip(
      `<b>WP${i + 1}</b><br>${latStr}<br>${lngStr}`,
      { permanent: true, direction: 'top', offset: [0, -10] }
    );

    let legInfo = '';
    let warningHtml = '';

    if (i > 0) {
      const prev = coords[i - 1];
      const dist = calcDistanceNM(prev.lat, prev.lng, pt.lat, pt.lng);
      const track = calcBearing(prev.lat, prev.lng, pt.lat, pt.lng);
      
      const { cts, sog } = calcCTS(track, stw, setDir, driftSpd);
      const legTime = sog > 0 ? (dist / sog) : 0;

      totalDist += dist;
      totalTimeHours += legTime;

      const warnings = getLegWarnings(prev, pt);
      
      if (ukc <= 0.5) {
        warnings.push(`CRITICAL: Grounding Risk (UKC: ${ukc.toFixed(2)}m)`);
      } else if (ukc < minSafeUkc) {
        warnings.push(`SHALLOW WATER: UKC (${ukc.toFixed(2)}m) < safe margin (${minSafeUkc}m)`);
      }

      if (warnings.length > 0) {
        warningHtml = warnings.map(w => `<div class="warning-badge">⚠️ ${w}</div>`).join('');
      }

      legInfo = `
        <div class="leg-details">
          Dist: <b>${dist.toFixed(2)} NM</b> | Track: <b>${Math.round(track)}°T</b><br>
          CTS: <span style="color:#38bdf8">${Math.round(cts)}°T</span> | SOG: <b>${sog.toFixed(1)} kn</b>
        </div>
      `;
    }

    const li = document.createElement('li');
    li.className = 'waypoint-item';
    li.innerHTML = `
      <strong>WP${i + 1}</strong>
      <div class="coord-primary">${ddm}</div>
      <div class="coord-secondary">Dec: ${decDeg}</div>
      ${legInfo}
      ${warningHtml}
      <button class="secondary" onclick="fetchLiveTide(${pt.lat}, ${pt.lng}, ${i})">Fetch Live Currents</button>
    `;
    listEl.appendChild(li);
  });

  document.getElementById('total-dist').innerText = `${totalDist.toFixed(2)} NM`;
  const h = Math.floor(totalTimeHours);
  const m = Math.round((totalTimeHours - h) * 60);
  document.getElementById('total-time').innerText = `${h}h ${m}m`;
}

function generatePassagePlan() {
  if (markers.length === 0) return alert("Plot at least two waypoints before generating a passage plan.");

  const stw = parseFloat(document.getElementById('stw').value) || 6.0;
  const setDir = parseFloat(document.getElementById('set-dir').value) || 0;
  const driftSpd = parseFloat(document.getElementById('drift-spd').value) || 0;
  const draft = parseFloat(document.getElementById('draft').value) || 2.0;
  const chartDepth = parseFloat(document.getElementById('chart-depth').value) || 5.0;
  const tideHeight = parseFloat(document.getElementById('tide-height').value) || 0.0;
  const minSafeUkc = parseFloat(document.getElementById('min-safe-ukc').value) || 1.5;

  const totalDepth = chartDepth + tideHeight;
  const ukc = totalDepth - draft;
  const coords = markers.map(m => m.getLatLng());

  let rowsHtml = '';
  let totalDist = 0;
  let totalTimeHours = 0;

  coords.forEach((pt, i) => {
    const { ddm } = toDDM(pt.lat, pt.lng);
    let distStr = '-', trackStr = '-', ctsStr = '-', sogStr = '-', durationStr = '-', cumDistStr = '0.00 NM';
    let notesStr = '';

    if (i > 0) {
      const prev = coords[i - 1];
      const dist = calcDistanceNM(prev.lat, prev.lng, pt.lat, pt.lng);
      const track = calcBearing(prev.lat, prev.lng, pt.lat, pt.lng);
      const { cts, sog } = calcCTS(track, stw, setDir, driftSpd);
      const legTime = sog > 0 ? (dist / sog) : 0;

      totalDist += dist;
      totalTimeHours += legTime;

      const h = Math.floor(legTime);
      const m = Math.round((legTime - h) * 60);

      distStr = `${dist.toFixed(2)} NM`;
      trackStr = `${Math.round(track)}°T`;
      ctsStr = `${Math.round(cts)}°T`;
      sogStr = `${sog.toFixed(1)} kn`;
      durationStr = `${h}h ${m}m`;
      cumDistStr = `${totalDist.toFixed(2)} NM`;

      const warnings = getLegWarnings(prev, pt);
      if (ukc < minSafeUkc) {
        warnings.push(`Low UKC Clearance (${ukc.toFixed(2)}m)`);
      }

      if (warnings.length > 0) {
        notesStr = `<strong style="color:#dc2626;">⚠️ WARNING:</strong> ${warnings.join('; ')}`;
      }
    }

    rowsHtml += `
      <tr>
        <td style="text-align:center;"><strong>WP${i + 1}</strong></td>
        <td style="font-family:monospace;">${ddm}</td>
        <td style="text-align:center;">${distStr}</td>
        <td style="text-align:center;">${trackStr}</td>
        <td style="text-align:center; font-weight:bold;">${ctsStr}</td>
        <td style="text-align:center;">${sogStr}</td>
        <td style="text-align:center;">${durationStr}</td>
        <td style="text-align:center;">${cumDistStr}</td>
        <td style="width:25%;">${notesStr}</td>
      </tr>
    `;
  });

  const totH = Math.floor(totalTimeHours);
  const totM = Math.round((totalTimeHours - totH) * 60);

  const planHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>TCC Passage Plan Sheet</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #000; background: #fff; }
        h1 { font-size: 18pt; margin-bottom: 4px; border-bottom: 2px solid #000; padding-bottom: 4px; }
        .meta-box { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; border: 1px solid #000; font-size: 10pt; line-height: 1.4; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9.5pt; }
        th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
        th { background-color: #e5e7eb; font-weight: bold; text-align: center; }
        .btn-print { padding: 8px 16px; font-size: 11pt; font-weight: bold; cursor: pointer; background: #0284c7; color: #fff; border: none; border-radius: 4px; margin-bottom: 15px; }
        @media print { .btn-print { display: none; } }
      </style>
    </head>
    <body>
      <button class="btn-print" onclick="window.print()">🖨️ Print Passage Plan</button>
      <h1>TCC PASSAGE PLAN & NAVIGATIONAL LOG SHEET</h1>
      <div class="meta-box">
        <div>
          <p><strong>Date Plotted:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Assumed STW:</strong> ${stw} knots</p>
          <p><strong>Vessel Draft:</strong> ${draft} m</p>
        </div>
        <div>
          <p><strong>Tidal Stream (Set/Drift):</strong> ${setDir}°T @ ${driftSpd} knots</p>
          <p><strong>Min. Charted Depth:</strong> ${chartDepth} m</p>
          <p><strong>Tide Height (+CD):</strong> ${tideHeight} m</p>
        </div>
        <div>
          <p><strong>Total Water Depth:</strong> ${totalDepth.toFixed(2)} m</p>
          <p><strong>Calculated UKC:</strong> ${ukc.toFixed(2)} m</p>
          <p><strong>Total Distance / Est. Time:</strong> ${totalDist.toFixed(2)} NM (${totH}h ${totM}m)</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>WP</th>
            <th>Position (DD° MM.mmm')</th>
            <th>Leg Dist</th>
            <th>Track</th>
            <th>CTS</th>
            <th>SOG</th>
            <th>Leg Time</th>
            <th>Cum. Dist</th>
            <th>Visual Aids / Depth Hazards / Watch Notes</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  win.document.write(planHtml);
  win.document.close();
}

async function fetchLiveTide(lat, lng, idx) {
  try {
    const res = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=ocean_current_velocity,ocean_current_direction`);
    const data = await res.json();
    if (data && data.hourly) {
      const velKnots = ( (data.hourly.ocean_current_velocity[0] || 0) * 1.94384 ).toFixed(1);
      const dir = Math.round(data.hourly.ocean_current_direction[0] || 0);

      document.getElementById('set-dir').value = dir;
      document.getElementById('drift-spd').value = velKnots;
      updateRoute();
      alert(`Updated Tide for WP${idx + 1}:\nSet: ${dir}°T\nDrift: ${velKnots} knots`);
    }
  } catch (err) {
    alert("Unable to fetch live current data for this location.");
  }
}

function undoLast() {
  if (markers.length === 0) return;
  map.removeLayer(markers.pop());
  updateRoute();
}

function clearAll() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  updateRoute();
}

function exportGPX() {
  if (markers.length === 0) return alert("Plot waypoints before exporting.");
  let gpx = `<?xml version="1.0"?><gpx version="1.1" creator="TCC Course Plotter"><rte><name>Marine Course</name>`;
  markers.forEach((m, idx) => {
    const { lat, lng } = m.getLatLng();
    const { latStr, lngStr } = toDDM(lat, lng);
    gpx += `<rtept lat="${lat}" lon="${lng}"><name>WP${idx + 1}</name><cmt>${latStr} ${lngStr}</cmt></rtept>`;
  });
  gpx += `</rte></gpx>`;

  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([gpx], { type: 'application/gpx+xml' }));
  a.download = `tcc_marine_route.gpx`;
  a.click();
}

function importGPX(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const xmlDoc = new DOMParser().parseFromString(e.target.result, "text/xml");
    const points = xmlDoc.querySelectorAll("rtept, trkpt, wpt");
    if (!points.length) return alert("No valid points found in GPX.");
    clearAll();
    const bounds = [];
    points.forEach(pt => {
      const lat = parseFloat(pt.getAttribute("lat"));
      const lng = parseFloat(pt.getAttribute("lon"));
      if (!isNaN(lat) && !isNaN(lng)) {
        addWaypoint(lat, lng);
        bounds.push([lat, lng]);
      }
    });
    if (bounds.length) map.fitBounds(bounds, { padding: [30, 30] });
  };
  reader.readAsText(file);
}

// Map click listener for adding route waypoints
map.on('click', (e) => {
  addWaypoint(e.latlng.lat, e.latlng.lng);
});