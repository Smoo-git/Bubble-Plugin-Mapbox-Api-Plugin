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
    
    instance.data.map = map;
    
}