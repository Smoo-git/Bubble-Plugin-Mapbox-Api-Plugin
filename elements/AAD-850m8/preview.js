function(instance, properties) {
    // Mapbox GL JSを読み込む
    const mapboxScript = document.createElement('script');
    mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.3.1/mapbox-gl.js';
    mapboxScript.onload = () => {
        // Mapbox GL JSが読み込まれた後に処理を実行する
        let mapContainer = jQuery("<div id='map' style='width: 400px; height: 300px;'></div>");

        let lng = properties.longitude;
        let lat = properties.latitude;
        let zoom = properties.zoom;

        mapboxgl.accessToken = 'pk.eyJ1Ijoic21vb2luYyIsImEiOiJjbGZrZzdoZjMwYWJ3M3Fxb2R1bG40djJkIn0.4CeUTM2gOPvQ7fVcVriSLQ';
        const map = new mapboxgl.Map({
            container: mapContainer[0], // container element
            style: 'mapbox://styles/mapbox/streets-v12', // style URL
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
}