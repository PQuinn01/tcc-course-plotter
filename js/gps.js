// Variable to store the live location marker
let userLocationMarker = null;

// GPS Geolocation Handler
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

      map.setView([lat, lng], 13);

      if (userLocationMarker) {
        userLocationMarker.setLatLng([lat, lng]);
      } else {
        userLocationMarker = L.circleMarker([lat, lng], {
          radius: 9,
          fillColor: '#0ea5e9',
          color: '#ffffff',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.85
        }).addTo(map).bindTooltip("<b>Vessel GPS Position</b>", { permanent: false });
      }

      if (statusEl) statusEl.innerText = `Fix Acquired (Accuracy: ±${accuracy}m)`;

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