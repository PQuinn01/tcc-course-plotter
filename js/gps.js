// Helper to create the Boat L.divIcon with dynamic heading rotation
function createBoatIcon(headingDegrees = 0) {
  const heading = (!isNaN(headingDegrees) && headingDegrees !== null) ? headingDegrees : 0;

  return L.divIcon({
    className: 'boat-gps-marker',
    html: `
      <div class="boat-icon-wrapper" style="transform: rotate(${heading}deg);">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" style="filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.6));">
          <!-- Outer Hull -->
          <path d="M12 2C15.5 7 17.5 14 16.5 21H7.5C6.5 14 8.5 7 12 2Z" fill="#0284c7" stroke="#ffffff" stroke-width="1.8"/>
          <!-- Inner Deck -->
          <path d="M12 5C14 9 15 14 14.5 19H9.5C9 14 10 9 12 5Z" fill="#38bdf8"/>
          <!-- Cabin / Navigation Light Point -->
          <circle cx="12" cy="12" r="2" fill="#ffffff"/>

          <!-- Rear Left Red Marker (Port Stern) -->
          <circle cx="7.5" cy="20.5" r="1.8" fill="#ef4444" stroke="#ffffff" stroke-width="0.6"/>

          <!-- Rear Right Green Marker (Starboard Stern) -->
          <circle cx="16.5" cy="20.5" r="1.8" fill="#22c55e" stroke="#ffffff" stroke-width="0.6"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
}

let userLocationMarker = null;

// GPS Geolocation Handler using Boat Icon
function getGPSLocation(addAsWaypoint = false) {
  const statusEl = document.getElementById('gps-status');

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your current browser.");
    if (statusEl) statusEl.innerText = "GPS Error: Not supported";
    return;
  }

  if (statusEl) statusEl.innerText = "Acquiring satellite fix...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = Math.round(position.coords.accuracy);
      const heading = position.coords.heading; // True heading in degrees if device is moving/compass enabled

      map.setView([lat, lng], 13);

      const boatIcon = createBoatIcon(heading);

      if (userLocationMarker) {
        userLocationMarker.setLatLng([lat, lng]);
        userLocationMarker.setIcon(boatIcon);
      } else {
        userLocationMarker = L.marker([lat, lng], { icon: boatIcon })
          .addTo(map)
          .bindTooltip("<b>Vessel Position</b>", { permanent: false, direction: 'top' });
      }

      const headingText = (heading !== null && !isNaN(heading)) ? ` | Heading: ${Math.round(heading)}°T` : '';
      if (statusEl) statusEl.innerText = `Fix Acquired (±${accuracy}m)${headingText}`;

      if (addAsWaypoint) {
        addWaypoint(lat, lng);
      }
    },
    (error) => {
      let errorMsg = "Unable to fetch GPS position.";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = "GPS access denied by user/browser.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg = "GPS position unavailable.";
          break;
        case error.TIMEOUT:
          errorMsg = "GPS location request timed out.";
          break;
      }
      alert(errorMsg);
      if (statusEl) statusEl.innerText = `GPS Error: ${errorMsg}`;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}