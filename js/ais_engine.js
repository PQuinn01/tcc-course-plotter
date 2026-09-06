// ==========================================
    // AIS TARGET TRAFFIC ENGINE
    // ==========================================
    let showAIS = true;
    let aisMarkers = {};
    let aisUpdateTimer = null;

    // Realistic Clyde & West Coast Mock AIS Targets
    let aisTargets = [
      { mmsi: 235012345, name: "MV CALEDONIAN ISLES", callsign: "MAMB8", type: "Passenger", lat: 55.755, lng: -4.870, cog: 260, sog: 13.5, dest: "BRODICK", draft: 3.2 },
      { mmsi: 235089100, name: "MV ARGYLL FLYER", callsign: "2ABC3", type: "Passenger", lat: 55.950, lng: -4.890, cog: 210, sog: 11.2, dest: "DUNOON", draft: 2.1 },
      { mmsi: 235044321, name: "WESTERN FOYLE", callsign: "GXYZ9", type: "Tug", lat: 55.965, lng: -4.770, cog: 90, sog: 7.8, dest: "GREENOCK", draft: 4.5 },
      { mmsi: 211334000, name: "NORTHERN COASTER", callsign: "PE5432", type: "Cargo", lat: 55.720, lng: -4.920, cog: 175, sog: 9.0, dest: "HUNTERSTON", draft: 6.8 },
      { mmsi: 240998000, name: "CLYDE STAR", callsign: "SV8811", type: "Tanker", lat: 55.680, lng: -5.020, cog: 10, sog: 10.5, dest: "FINNART", draft: 9.2 }
    ];

    const aisLayerGroup = L.layerGroup().addTo(map);

    // Vessel Type Color Mapping (Standard MarineTraffic Schema)
    function getAisColor(type) {
      switch (type) {
        case 'Passenger': return '#0284c7'; // Blue
        case 'Cargo': return '#22c55e';     // Green
        case 'Tanker': return '#ef4444';    // Red
        case 'Tug': return '#eab308';       // Yellow
        default: return '#94a3b8';          // Grey
      }
    }

    // Generate Custom SVG Arrow Marker for AIS Targets
    function createAisIcon(type, cog) {
      const color = getAisColor(type);
      const svgHtml = `
        <div style="transform: rotate(${cog}deg); transition: transform 0.5s ease;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L19 21L12 17L5 21L12 2Z" fill="${color}" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        </div>
      `;
      return L.divIcon({
        className: '',
        html: svgHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    }

    function toggleAIS() {
      showAIS = document.getElementById('toggle-ais').checked;
      if (showAIS) {
        map.addLayer(aisLayerGroup);
        startAISSimulation();
      } else {
        map.removeLayer(aisLayerGroup);
        if (aisUpdateTimer) clearInterval(aisUpdateTimer);
      }
    }

    //function startAISSimulation() {
    //  renderAISTargets();
    //  if (aisUpdateTimer) clearInterval(aisUpdateTimer);
      // Advance AIS positions every 3 seconds
    //  aisUpdateTimer = setInterval(updateAISTargetPositions, 3000);
   // }

    function updateAISTargetPositions() {
      if (!showAIS) return;

      const userPos = shipMarker ? shipMarker.getLatLng() : null;
      let minDistance = Infinity;
      let closestTarget = null;

      aisTargets.forEach(target => {
        // Dead reckoning formula (SOG in knots converted to lat/lng movement per tick)
        const distanceDegrees = (target.sog * (3 / 3600)) / 60; // 3 second tick distance
        const rad = target.cog * Math.PI / 180;
        
        target.lat += distanceDegrees * Math.cos(rad);
        target.lng += (distanceDegrees * Math.sin(rad)) / Math.cos(target.lat * Math.PI / 180);

        // Calculate distance from user vessel if GPS active
        if (userPos) {
          const distNM = calcDistanceNM(userPos.lat, userPos.lng, target.lat, target.lng);
          if (distNM < minDistance) {
            minDistance = distNM;
            closestTarget = target;
          }
        }
      });

      // Update Proximity / Collision Risk Alert Banner (< 0.5 NM)
      const alertEl = document.getElementById('ais-collision-alert');
      if (userPos && minDistance < 0.5 && closestTarget) {
        alertEl.innerHTML = `
          <div class="warning-badge" style="margin-top:0.4rem;">
            ⚠️ CPA ALERT: ${closestTarget.name} (${minDistance.toFixed(2)} NM)
          </div>`;
      } else {
        alertEl.innerHTML = '';
      }

      renderAISTargets();
    }

    function renderAISTargets() {
      document.getElementById('ais-count').innerText = aisTargets.length;
      const listEl = document.getElementById('ais-target-list');
      const userPos = shipMarker ? shipMarker.getLatLng() : null;
      let listHtml = '';

      aisTargets.forEach(target => {
        let distBearingStr = 'GPS Off';
        if (userPos) {
          const distNM = calcDistanceNM(userPos.lat, userPos.lng, target.lat, target.lng);
          const bearing = calcBearing(userPos.lat, userPos.lng, target.lat, target.lng);
          distBearingStr = `${distNM.toFixed(1)} NM @ ${Math.round(bearing)}°T`;
        }

        listHtml += `
          <div style="padding:0.25rem 0; border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="color:${getAisColor(target.type)}">${target.name}</strong><br>
              <span style="color:#94a3b8;">${target.sog} kn | ${target.cog}°T</span>
            </div>
            <div style="text-align:right;">
              <span style="color:#38bdf8;">${distBearingStr}</span><br>
              <button class="secondary btn-sm" style="padding:0.1rem 0.3rem;" onclick="panToAIS(${target.mmsi})">Center</button>
            </div>
          </div>`;

        // Update or create map markers
        const popupContent = `
          <div style="font-size:0.85rem; line-height:1.4;">
            <strong style="font-size:0.95rem; color:${getAisColor(target.type)};">${target.name}</strong><br>
            <b>Type:</b> ${target.type} | <b>MMSI:</b> ${target.mmsi}<br>
            <b>Call Sign:</b> ${target.callsign} | <b>Draft:</b> ${target.draft}m<br>
            <b>SOG:</b> ${target.sog} kn | <b>COG:</b> ${target.cog}°T<br>
            <b>Destination:</b> ${target.dest}<br>
            ${userPos ? `<b>Range:</b> ${distBearingStr}` : ''}
          </div>
        `;

        if (aisMarkers[target.mmsi]) {
          aisMarkers[target.mmsi].setLatLng([target.lat, target.lng]);
          aisMarkers[target.mmsi].setIcon(createAisIcon(target.type, target.cog));
          aisMarkers[target.mmsi].getPopup().setContent(popupContent);
        } else {
          const marker = L.marker([target.lat, target.lng], {
            icon: createAisIcon(target.type, target.cog)
          }).bindPopup(popupContent);
          
          aisLayerGroup.addLayer(marker);
          aisMarkers[target.mmsi] = marker;
        }
      });

      listEl.innerHTML = listHtml;
    }

    function panToAIS(mmsi) {
      const target = aisTargets.find(t => t.mmsi === mmsi);
      if (target) {
        map.panTo([target.lat, target.lng]);
        if (aisMarkers[mmsi]) aisMarkers[mmsi].openPopup();
      }
    }

    // Initialize AIS engine on page load
   connectLiveAISStream('8cf3533897a873904ccc53e67cf9befe8aeb1e5b');

   function connectLiveAISStream(apiKey) {
  const socket = new WebSocket("wss://stream.aisstream.io/v0/stream");
  socket.onopen = function () {
    const subscriptionMessage = {
      Apikey: apiKey,
      BoundingBoxes: [[[55.2, -5.6], [56.1, -4.6]]] // Bounding box for Firth of Clyde
    };
    socket.send(JSON.stringify(subscriptionMessage));
  };
  socket.onmessage = function (event) {
    const aisMsg = JSON.parse(event.data);
    // Process PositionReport & ShipStaticData messages into aisTargets array
  };
}