// Detailed Firth of Clyde Shipping Lanes & Commercial Channels
    const shippingLanesData = [
      {
        name: "Clyde Deepwater Channel / TSS",
        coords: [
          [55.95, -4.85],
          [55.90, -4.90],
          [55.80, -4.95],
          [55.70, -5.00],
          [55.69, -4.96],
          [55.79, -4.91],
          [55.89, -4.86],
          [55.94, -4.81]
        ]
      },
      {
        name: "Faslane / Loch Long Submarine Approach Corridor",
        coords: [
          [56.03, -4.84],
          [55.98, -4.86],
          [55.97, -4.89],
          [55.98, -4.91],
          [56.03, -4.87]
        ]
      },
      {
        name: "Hunterston Deepwater Iron Ore / Coal Channel",
        coords: [
          [55.77, -4.89],
          [55.75, -4.88],
          [55.73, -4.89],
          [55.72, -4.93],
          [55.74, -4.94],
          [55.78, -4.91]
        ]
      }
    ];

    // Detailed Firth of Clyde Hydrographic Hazard Zones & Reefs
    const hazardZonesData = [
      {
        name: "Gantocks Reef Shallow (< 2.5m)",
        coords: [
          [55.956, -4.913],
          [55.949, -4.898],
          [55.943, -4.911],
          [55.953, -4.920]
        ]
      },
      {
        name: "Toward Point Ledges & Shoal (< 3.0m)",
        coords: [
          [55.867, -4.987],
          [55.856, -4.968],
          [55.849, -4.983],
          [55.861, -4.998]
        ]
      },
      {
        name: "Skelmorlie Bank Shoal (< 6.5m)",
        coords: [
          [55.890, -4.899],
          [55.884, -4.882],
          [55.873, -4.887],
          [55.877, -4.904]
        ]
      },
      {
        name: "Fairlie Spit Shallow Ledge (< 2.0m)",
        coords: [
          [55.762, -4.865],
          [55.757, -4.850],
          [55.748, -4.857],
          [55.755, -4.872]
        ]
      },
      {
        name: "The Eileans Rocks (Millport Harbour Entrance)",
        coords: [
          [55.748, -4.926],
          [55.743, -4.915],
          [55.739, -4.923],
          [55.744, -4.933]
        ]
      },
      {
        name: "Little Cumbrae Island Reef & Broadcar",
        coords: [
          [55.722, -4.962],
          [55.712, -4.942],
          [55.705, -4.958],
          [55.715, -4.975]
        ]
      },
      {
        name: "Bogany Point Foul Ground (Rothesay Approaches)",
        coords: [
          [55.852, -5.025],
          [55.845, -5.012],
          [55.840, -5.022],
          [55.848, -5.032]
        ]
      },
      {
        name: "The Burnt Islands Narrows (Kyles of Bute Shallow < 2.0m)",
        coords: [
          [55.878, -5.185],
          [55.874, -5.176],
          [55.870, -5.182],
          [55.875, -5.192]
        ]
      },
      {
        name: "Inchmarnock Shelf & Foul Area",
        coords: [
          [55.795, -5.165],
          [55.783, -5.148],
          [55.772, -5.162],
          [55.785, -5.180]
        ]
      },
      {
        name: "Holy Island Ledges & Clauchlands Point Ledge",
        coords: [
          [55.538, -5.068],
          [55.528, -5.050],
          [55.505, -5.055],
          [55.518, -5.080]
        ]
      },
      {
        name: "Pladda Island Reefs & Sound Shallow",
        coords: [
          [55.428, -5.128],
          [55.418, -5.110],
          [55.410, -5.122],
          [55.422, -5.138]
        ]
      },
      {
        name: "Iron Rock Ledges (South Arran)",
        coords: [
          [55.442, -5.245],
          [55.435, -5.230],
          [55.428, -5.242],
          [55.438, -5.258]
        ]
      },
      {
        name: "Lady Isle Reefs & Outlying Rocks",
        coords: [
          [55.532, -4.738],
          [55.522, -4.720],
          [55.512, -4.730],
          [55.525, -4.748]
        ]
      },
      {
        name: "Irvine Bar Shoal (< 1.5m)",
        coords: [
          [55.610, -4.712],
          [55.602, -4.700],
          [55.595, -4.710],
          [55.605, -4.722]
        ]
      },
      {
        name: "Ayr Harbour North Spit & Bar",
        coords: [
          [55.472, -4.648],
          [55.465, -4.638],
          [55.458, -4.645],
          [55.468, -4.658]
        ]
      },
      {
        name: "Turnberry Point Reef & Outlying Ledges",
        coords: [
          [55.332, -4.855],
          [55.322, -4.840],
          [55.315, -4.850],
          [55.325, -4.868]
        ]
      }
    ];

    // Detailed Firth of Clyde Hydrographic Depth Soundings
    const clydeDepthData = [
      { name: "Tail of the Bank Outer", lat: 55.968, lng: -4.755, depth: 18.0 },
      { name: "Gourock Bay Anchorage", lat: 55.960, lng: -4.815, depth: 12.0 },
      { name: "Cloch Point Deep", lat: 55.972, lng: -4.881, depth: 55.0 },
      { name: "Holy Loch Entrance", lat: 55.978, lng: -4.900, depth: 15.5 },
      { name: "Dunoon Roads", lat: 55.945, lng: -4.915, depth: 38.0 },
      { name: "Gantocks Reef (Shallow Warning)", lat: 55.952, lng: -4.905, depth: 2.2 },
      { name: "Innellan Shore Sounding", lat: 55.895, lng: -4.945, depth: 14.0 },
      { name: "Toward Point Reef", lat: 55.860, lng: -4.980, depth: 2.8 },
      { name: "Skelmorlie Bank Shoal", lat: 55.881, lng: -4.892, depth: 6.5 },
      { name: "Wemyss Bay Anchorage", lat: 55.885, lng: -4.910, depth: 22.0 },
      { name: "Rothesay Bay Approach", lat: 55.845, lng: -5.040, depth: 16.0 },
      { name: "Bogany Point Light Offing", lat: 55.848, lng: -5.020, depth: 4.1 },
      { name: "Burnt Islands Narrows", lat: 55.875, lng: -5.180, depth: 1.8 },
      { name: "Largs Channel Fairway", lat: 55.795, lng: -4.875, depth: 18.0 },
      { name: "Fairlie Spit Ledge", lat: 55.758, lng: -4.860, depth: 2.0 },
      { name: "Fairlie Roads Outer", lat: 55.755, lng: -4.855, depth: 11.5 },
      { name: "Fairlie Channel Deep", lat: 55.762, lng: -4.864, depth: 24.0 },
      { name: "Millport Bay Eileans Rocks", lat: 55.744, lng: -4.922, depth: 1.5 },
      { name: "Off Great Cumbrae West", lat: 55.765, lng: -4.930, depth: 31.0 },
      { name: "Little Cumbrae Broadcar Reef", lat: 55.715, lng: -4.955, depth: 3.5 },
      { name: "Garroch Head Offing", lat: 55.710, lng: -5.030, depth: 48.0 },
      { name: "Inchmarnock Deep Trench", lat: 55.780, lng: -5.150, depth: 82.0 },
      { name: "Tarbert Approaches (Loch Fyne)", lat: 55.880, lng: -5.380, depth: 24.0 },
      { name: "Skipness Point Channel", lat: 55.760, lng: -5.330, depth: 52.0 },
      { name: "Brodick Bay Outer Deep", lat: 55.575, lng: -5.110, depth: 42.0 },
      { name: "Lamlash Harbour North Channel", lat: 55.535, lng: -5.080, depth: 14.0 },
      { name: "Clauchlands Point Ledge", lat: 55.530, lng: -5.060, depth: 3.0 },
      { name: "Lamlash Harbour Inner", lat: 55.528, lng: -5.110, depth: 18.5 },
      { name: "Lamlash South Entrance", lat: 55.515, lng: -5.085, depth: 22.0 },
      { name: "Holy Island Ledges (Shallow)", lat: 55.510, lng: -5.060, depth: 2.2 },
      { name: "Pladda Island Reef", lat: 55.420, lng: -5.120, depth: 3.5 },
      { name: "Iron Rock Ledges", lat: 55.435, lng: -5.245, depth: 2.8 },
      { name: "Kilbrannan Sound Central Trench", lat: 55.600, lng: -5.380, depth: 110.0 },
      { name: "Kilbrannan Sound South", lat: 55.500, lng: -5.350, depth: 98.0 },
      { name: "Campbeltown Loch Approach", lat: 55.420, lng: -5.530, depth: 11.0 },
      { name: "Irvine Bar Shoal", lat: 55.602, lng: -4.710, depth: 1.5 },
      { name: "Lady Isle Outlying Rocks", lat: 55.522, lng: -4.730, depth: 2.5 },
      { name: "Troon Harbour Approach", lat: 55.545, lng: -4.685, depth: 6.8 },
      { name: "Ayr Harbour North Bar", lat: 55.465, lng: -4.645, depth: 2.0 },
      { name: "Ayr Bay Outer Roads", lat: 55.470, lng: -4.660, depth: 12.0 },
      { name: "Turnberry Point Reef", lat: 55.325, lng: -4.855, depth: 2.9 },
      { name: "Girvan Bank Shoal", lat: 55.245, lng: -4.880, depth: 4.2 },
      { name: "Ailsa Craig Trench", lat: 55.260, lng: -5.120, depth: 68.0 },
      { name: "Sanda Island Sounding", lat: 55.270, lng: -5.580, depth: 45.0 }
    ];

    let shippingLayerGroup = L.layerGroup().addTo(map);
    let presetHazardLayerGroup = L.layerGroup().addTo(map);
    let depthLayerGroup = L.layerGroup().addTo(map);

    clydeDepthData.forEach(pt => {
      const isShallow = pt.depth < 10.0;
      const depthIcon = L.divIcon({
        className: `depth-marker ${isShallow ? 'shallow' : ''}`,
        html: `${pt.depth}m`,
        iconSize: [44, 20],
        iconAnchor: [22, 10]
      });

      L.marker([pt.lat, pt.lng], { icon: depthIcon })
        .bindTooltip(`<b>Sounding: ${pt.depth} m</b><br>${pt.name}`, { sticky: true })
        .addTo(depthLayerGroup);
    });

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
      const showDepths = document.getElementById('toggle-depths').checked;

      if (showShipping) map.addLayer(shippingLayerGroup); else map.removeLayer(shippingLayerGroup);
      if (showHazards) map.addLayer(presetHazardLayerGroup); else map.removeLayer(presetHazardLayerGroup);
      if (showDepths) map.addLayer(depthLayerGroup); else map.removeLayer(depthLayerGroup);
    }