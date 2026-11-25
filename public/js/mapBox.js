/* eslint-disable */
export const displayMap = (locations) => {
  // creates the map, passing your access token to associate it with your Mapbox account, and setting the container, initial center, and zoom level
  const map = new mapboxgl.Map({
    accessToken: process.env.MAPBOX_ACCESS_TOKEN,
    container: 'map',
    style: 'mapbox://styles/zaza-56/cmwnpq43v008801r8e0erfo4c',
    scrollZoom: false,
    //   center: [-118.34480754771313, 34.18701659858127],
    //   zoom: 10,
    //   interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
