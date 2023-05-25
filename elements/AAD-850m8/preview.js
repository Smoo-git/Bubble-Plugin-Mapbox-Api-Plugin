function(instance, properties) {
  // Mapbox GL JSを読み込む
  const mapboxScript = document.createElement('script');
  mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js';
  mapboxScript.onload = () => {
    // Mapbox GL JSが読み込まれた後に処理を実行する
    let mapContainer = jQuery("<div id='map' style='width: 600px; height: 400px;'></div>");

    let lng = properties.longitude;
    let lat = properties.latitude;
    let zoom = properties.zoom;
    
    let styleUrl;
    if(properties.style) {styleUrl = 'properties.style'} else {styleUrl = 'mapbox://styles/mapbox/streets-v12'}
    mapboxgl.accessToken = 'pk.eyJ1Ijoic21vb2luYyIsImEiOiJjbGZrZzdoZjMwYWJ3M3Fxb2R1bG40djJkIn0.4CeUTM2gOPvQ7fVcVriSLQ';
    const map = new mapboxgl.Map({
      container: mapContainer[0], // container element
      style: styleUrl, // style URL
      center: [lng, lat], // starting position [lng, lat]
      zoom: zoom, // starting zoom
    });

    instance.canvas.append(mapContainer);
    instance.data.map = map;
  };

  // Mapbox GL JSのCSSを読み込む
  const mapboxCSS = document.createElement('link');
  mapboxCSS.rel = 'stylesheet';
  mapboxCSS.href = 'https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.css';

  // headタグにスクリプトとCSSを追加
  document.head.appendChild(mapboxCSS);
  document.head.appendChild(mapboxScript);

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
}