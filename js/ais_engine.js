let aisSocket = null;
const aisTargets = new Map(); // Store active vessel markers by MMSI
const AIS_STREAM_URL = 'wss://stream.aisstream.io/v0/stream'; 
const API_KEY = 'fd2351962e05075b7a38eb0edd8e332da892b870'; // Replace with AISStream API key if available

// Distinctive SVG vessel shape with directional arrow
function createVesselIcon(heading = 0) {
  const svg = `
    <svg width="24" height="24" viewBox="0 0 24 24" style="transform: rotate(${heading}deg); transform-origin: center;">
      <path d="M12 2 L19 21 L12 17 L5 21 Z" fill="#38bdf8" stroke="#0f172a" stroke-width="1.5" />
    </svg>`;
  return L.divIcon({
    html: svg,
    className: 'ais-vessel-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

function toggleAIS(enabled) {
  const statusEl = document.getElementById('ais-status');
  if (!enabled) {
    if (aisSocket) aisSocket.close();
    aisTargets.forEach(vessel => map.removeLayer(vessel.marker));
    aisTargets.clear();
    statusEl.innerText = 'AIS Inactive';
    statusEl.style.color = '#94a3b8';
    return;
  }

  statusEl.innerText = 'Connecting to AIS stream...';
  statusEl.style.color = '#eab308';

  if (API_KEY && API_KEY !== 'YOUR_AISSTREAM_API_KEY') {
    connectLiveAISStream(statusEl);
  } else {
    statusEl.innerText = 'AIS Stream Active (Firth of Clyde Simulation Mode)';
    statusEl.style.color = '#22c55e';
    startSimulatedAIS();
  }
}

function connectLiveAISStream(statusEl) {
  aisSocket = new WebSocket(AIS_STREAM_URL);

  aisSocket.onopen = () => {
    statusEl.innerText = 'AIS Live Feed Connected';
    statusEl.style.color = '#22c55e';

    // Bounding Box subscription for Firth of Clyde region
    const subscriptionMessage = {
      APIKey: API_KEY,
      BoundingBoxes: [[[55.20, -5.20], [56.00, -4.50]]]
    };
    aisSocket.send(JSON.stringify(subscriptionMessage));
  };

  aisSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.MessageType === 'PositionReport') {
      const pos = data.Message.PositionReport;
      const meta = data.MetaData;
      updateVesselTarget({
        mmsi: meta.MMSI,
        name: meta.ShipName || `MMSI: ${meta.MMSI}`,
        lat: meta.latitude,
        lng: meta.longitude,
        sog: pos.Sog,
        cog: pos.Cog,
        heading: pos.TrueHeading !== 511 ? pos.TrueHeading : pos.Cog
      });
    }
  };

  aisSocket.onerror = () => {
    statusEl.innerText = 'AIS Connection Error (Falling back to Simulation)';
    statusEl.style.color = '#ef4444';
    startSimulatedAIS();
  };
}

function updateVesselTarget(vessel) {
  if (aisTargets.has(vessel.mmsi)) {
    const existing = aisTargets.get(vessel.mmsi);
    existing.marker.setLatLng([vessel.lat, vessel.lng]);
    existing.marker.setIcon(createVesselIcon(vessel.heading));
    existing.marker.getPopup().setContent(buildAISPopup(vessel));
  } else {
    const marker = L.marker([vessel.lat, vessel.lng], {
      icon: createVesselIcon(vessel.heading)
    }).addTo(map);

    marker.bindPopup(buildAISPopup(vessel));
    aisTargets.set(vessel.mmsi, { marker, data: vessel });
  }
}

function buildAISPopup(v) {
  return `
    <div style="font-family: sans-serif; font-size: 0.85rem;">
      <strong style="color:#0284c7;">🚢 ${v.name}</strong><br>
      <b>MMSI:</b> ${v.mmsi}<br>
      <b>Speed (SOG):</b> ${v.sog} kn<br>
      <b>Course (COG):</b> ${Math.round(v.cog)}°T<br>
      <b>Position:</b> ${v.lat.toFixed(4)}°, ${v.lng.toFixed(4)}°
    </div>
  `;
}

// Local simulation fallback for testing Clyde maritime traffic
function startSimulatedAIS() {
  const simulatedTraffic = [
    { mmsi: 235001234, name: "MV CalMac Ferry", lat: 55.952, lng: -4.851, sog: 12.4, cog: 210, heading: 210 },
    { mmsi: 235098765, name: "Clyde Pilot Vessel", lat: 55.721, lng: -4.920, sog: 8.1, cog: 145, heading: 145 },
    { mmsi: 235112233, name: "Ocean Tanker", lat: 55.650, lng: -4.980, sog: 10.0, cog: 355, heading: 355 }
  ];

  simulatedTraffic.forEach(v => updateVesselTarget(v));

  // Small drift movement to simulate dynamic updates
  setInterval(() => {
    if (!document.getElementById('toggle-ais').checked) return;
    simulatedTraffic.forEach(v => {
      v.lat += (Math.random() - 0.48) * 0.002;
      v.lng += (Math.random() - 0.48) * 0.002;
      updateVesselTarget(v);
    });
  }, 3000);
}