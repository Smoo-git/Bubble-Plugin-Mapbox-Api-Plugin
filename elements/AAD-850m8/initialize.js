function(instance, context) {

  let mapContainer = context.jQuery("<div id='map' style='width: 100%; height: 100%;'></div>");
  instance.canvas.append(mapContainer);
  instance.data.mapContainer = mapContainer;

  let lng = 0;
  let lat = 0;
  let zoom = 12;

  mapboxgl.accessToken = context.keys.apiKey;
  const map = new mapboxgl.Map({
    container: mapContainer[0],
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [lng, lat],
    zoom: zoom,
  });

  instance.data.map = map;
  instance.publishState('centerLat', null);
  instance.publishState('centerLng', null);
}