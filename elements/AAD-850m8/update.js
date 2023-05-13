function(instance, properties) {

  const map = instance.data.map;

  // プロパティから座標とズームレベルを取得
  let lng = properties.longitude;
  let lat = properties.latitude;
  let zoom = properties.zoom;

  if (instance.data.showSearchBox) {
    if (!map.getSource('geocoder')) {
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        placeholder: 'Search for a location',
      });

      map.addControl(geocoder, 'top-left');
    }
  } else {
    if (map.getSource('geocoder')) {
      map.removeControl('geocoder');
    }
  }

  // 既存のマーカーを削除
  if (instance.data.markers) {
    instance.data.markers.forEach(marker => marker.remove());
    instance.data.markers = []; // ここでマーカー配列をリセット
  } else {
    instance.data.markers = [];
  }

  // 複数のマーカーの座標を配列に格納
  let markersData = [];
  console.log(properties.locations);
  if (properties.multiLocation) {
    markersData = [{ lng: 140.11380313795797, lat: 36.08213568665823, imgUrl: 'https://picsum.photos/200' }, { lng: 140.1138031379, lat: 36.0821663, imgUrl: 'https://picsum.photos/200' }];
  }

  // 複数のマーカーを地図に追加
  markersData.forEach(markerData => {
    const markerCoordinates = [markerData.lng, markerData.lat];

    const containerElement = document.createElement('div');
    containerElement.style.marginTop = -properties.iconHeight + 'px';

    // 画像アイコン用の要素を作成
    let iconElement = new Image(properties.iconWidth, properties.iconHeight);
    iconElement.src = markerData.imgUrl;
    iconElement.style.borderRadius = '50%';
    iconElement.style.border = '2px solid white';
    iconElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';

    // 吹き出しの三角形を表すSVG要素を作成
    const triangleElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    triangleElement.setAttribute('width', '12');
    triangleElement.setAttribute('height', '10');
    triangleElement.setAttribute('viewBox', '0 0 12 10');
    triangleElement.style.position = 'absolute';
    triangleElement.style.top = 'calc(100% - 2px)';
    triangleElement.style.left = 'calc(50% - 6px)';
    triangleElement.style.transform = 'translateY(-50%)';

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('d', 'M0,0 L6,10 L12,0 Z');
    pathElement.setAttribute('fill', 'white');

    triangleElement.appendChild(pathElement);

    // コンテナ要素にアイコンと三角形を追加
    containerElement.appendChild(iconElement);
    containerElement.appendChild(triangleElement);

    const markerHeight = parseInt(iconElement.style.height) + parseInt(triangleElement.getAttribute('height'));
    const markerOffset = [0, -markerHeight / 2];

    const marker = new mapboxgl.Marker({ element: containerElement })
      .setLngLat(markerCoordinates)
      .addTo(instance.data.map);

    instance.data.markers.push(marker);
  });


  // マップの中心マーカーを作成
  const centerMarker = document.createElement('div');
  centerMarker.id = 'center-marker';
  centerMarker.style.position = 'absolute';
  centerMarker.style.top = '50%';
  centerMarker.style.left = '50%';
  centerMarker.style.transform = 'translate(-50%, -50%)';
  centerMarker.style.width = '20px';
  centerMarker.style.height = '20px';
  centerMarker.style.backgroundColor = 'red';
  centerMarker.style.borderRadius = '50%';

  // マップのコンテナ要素と中心マーカー要素を取得
  const mapContainer = instance.canvas.find('#map');
  const centerMarkerElement = mapContainer.find('#center-marker');

  // マップのコンテナ要素に中心マーカー要素を追加
  if (centerMarkerElement.length === 0) {
    mapContainer.append(centerMarker);
  }


  // mapオブジェクトの中心座標とズームレベルを更新
  if (instance.data.map) {
    instance.data.map.setCenter([lng, lat]);
    instance.data.map.setZoom(zoom);

    instance.data.map.on('moveend', () => {
      const center = instance.data.map.getCenter();
      const latitude = center.lat;
      const longitude = center.lng;
      instance.publishState('center', '緯度経度:' + latitude, longitude);
    });

    // Initialize marker variable
    let marker;

    // Attach a click event listener to the map, but only if it hasn't been attached before
    if (!instance.data.clickEventListenerAttached) {

      instance.data.map.on('click', function (e) {
        console.log('Latitude: ' + e.lngLat.lat + ', Longitude: ' + e.lngLat.lng);

        //カスタムイベントが発火
        instance.triggerEvent('new_events', function (err) {
          if (err) {
            console.log('エラーが発生しました:', err);
          } else {
            console.log('カスタムイベントがトリガーされました');
          }
        });

        // Remove the previous marker if it exists
        if (marker) {
          marker.remove();
        }

        // Create a new marker
        marker = new mapboxgl.Marker()
          .setLngLat(e.lngLat)
          .addTo(instance.data.map);

        // Attach a click event listener to the marker
        marker.getElement().addEventListener('click', () => {
          marker.remove();
          marker = null;
        });
      });

      instance.data.clickEventListenerAttached = true;
    }
  }
}