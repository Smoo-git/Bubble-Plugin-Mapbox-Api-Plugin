function(instance, context) {

  let mapContainer = context.jQuery("<div id='map' style='width: 100%; height: 100%;'></div>");
  instance.canvas.append(mapContainer);
  instance.data.mapContainer = mapContainer;

  let lng = 0;
  let lat = 0;
  let zoom = 0;

  mapboxgl.accessToken = context.keys.apiKey; // APIキーを参照
  const map = new mapboxgl.Map({
    container: mapContainer[0], // container element
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: [lng, lat], // starting position [lng, lat]
    zoom: zoom, // starting zoom
  });

  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  }));


  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    placeholder: 'Search for a location', // 検索バーに表示されるプレースホルダー
  });

  map.addControl(geocoder, 'top-left');

  // 検索結果を受け取った後に実行される関数
  geocoder.on('result', (e) => {
    const coordinates = e.result.geometry.coordinates;
    const popup = new mapboxgl.Popup()
      .setHTML(`<h3>${e.result.text}</h3><p>${e.result.place_name}</p>`);

    const marker = new mapboxgl.Marker()
      .setLngLat(coordinates)
      .setPopup(popup)
      .addTo(map);

    map.flyTo({
      center: coordinates,
      essential: true,
      zoom: 14
    });
  });

  instance.data.map = map;

}