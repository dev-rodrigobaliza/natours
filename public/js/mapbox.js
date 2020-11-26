/* eslint-disable */
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoicm9kcmlnb2JhbGl6YSIsImEiOiJja2h2YXQwODcxM3QxMnVwZzF6dHEyZXFnIn0.3G-BCS3Gm-spqC_uq8c6Yw';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/rodrigobaliza/ckhvc2v2b021i1ao1o1msfneh',
    scrollZoom: false,
    //   center: [-118.113491, 34.111745],
    //   zoom: 8,
    //   interative: false,
  });

  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((location) => {
    const element = document.createElement('div');
    element.className = 'marker';
    new mapboxgl.Marker({
      element: element,
      anchor: 'bottom',
    })
      .setLngLat(location.coordinates)
      .addTo(map);
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);
    bounds.extend(location.coordinates);
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
