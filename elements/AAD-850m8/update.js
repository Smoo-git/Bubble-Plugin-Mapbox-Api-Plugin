function(instance, properties) {

  const map = instance.data.map;

  if (properties.showSearchBox) {
    if (!instance.data.geocoder) {
        const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        placeholder: properties.geocoderPlaceholder
      });
      map.addControl(geocoder, 'top-left');
        
        // デフォルトで検索窓とボックスの幅を小さくする
        const geocoderBox = document.querySelector('.mapboxgl-ctrl-geocoder');
        const geocoderInput = document.querySelector('.mapboxgl-ctrl-geocoder--input');
        const searchIcon = document.querySelector('.mapboxgl-ctrl-geocoder--icon-search');
        geocoderBox.style.minWidth = '36px';
        geocoderInput.style.width = '0px';
        geocoderInput.style.padding = '0px';  // パディングを削除

        // svgアイコンにクリックイベントを追加して検索窓とボックスの幅を切り替える
        searchIcon.addEventListener('click', () => {
            const clearButton = document.querySelector('.mapboxgl-ctrl-geocoder--button');
            if (clearButton.style.display !== 'block') {
              if (geocoderBox.style.minWidth === '36px') {
                geocoderBox.style.minWidth = '200px';  // 幅を広くする
                geocoderInput.style.width = '200px';  // 幅を広くする
                geocoderInput.style.padding = '6px 17px 6px 37px';  // パディングを追加
              } else {
                geocoderBox.style.minWidth = '36px';  // 幅を小さくする
                geocoderInput.style.width = '0px';  // 幅を小さくする
                geocoderInput.style.padding = '0px';  // パディングを削除
              }
            }
        });
        
      instance.data.geocoder = geocoder; // geocoder を保存
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
    }
  } else {
    if (instance.data.geocoder) {
      map.removeControl(instance.data.geocoder);
      instance.data.geocoder = null; // geocoder を削除
    }
  }
    
    if(properties.currentLocation) {
        if(!instance.data.geolocate) {
            const geolocate = new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true,
                showUserHeading: true
            });
            map.addControl(geolocate, 'top-right');
            instance.data.geolocate = geolocate;
        }
    } else {
        if(instance.data.geolocate) {
            map.removeControl(instance.data.geolocate);
            instance.data.geolocate = null;
        }
    }

  // プロパティから座標とズームレベルを取得
  let lng = properties.longitude;
  let lat = properties.latitude;
  let zoom = properties.zoom;

  // 既存のマーカーを削除
  if (instance.data.markers) {
    instance.data.markers.forEach(marker => marker.remove());
    instance.data.markers = []; // ここでマーカー配列をリセット
  } else {
    instance.data.markers = [];
  }

  // 複数のマーカーの座標を配列に格納
  let markersData = [];
    try {
  if (properties.locations && typeof properties.locations.get === 'function' && typeof properties.locations.length === 'function') {
        let locations = properties.locations.get(0, properties.locations.length());

        let processEachLocation = (location, index, array) => {
          // データベースから取得した値を変数に代入
          let lat = location.get("latitude_number");
          let lng = location.get("longitude_number");
          let imgUrl = location.get("img_image");

          // markersData配列に新たな要素を追加
          markersData.push({
            lng: lng,
            lat: lat,
            imgUrl: imgUrl
          });
        }
        locations.forEach(processEachLocation);
      }
    } catch (error) {
      console.error('Error while trying to get location data:', error);
    }
console.log(markersData);

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
    
    if(properties.centerPointer) {
          // マップの中心マーカーを作成
          const centerMarker = document.createElement('div');
          centerMarker.id = 'center-marker';
          centerMarker.style.position = 'absolute';
          centerMarker.style.top = '50%';
          centerMarker.style.left = '50%';
          centerMarker.style.transform = 'translate(-50%, -50%)';
          centerMarker.style.width = '39px';
          centerMarker.style.height = '46px';
          centerMarker.style.marginBottom = '46px';
          centerMarker.style.background = 'url(https://meta-l.cdn.bubble.io/f1683955456343x854438000473968000/pin_ja.svg)';
			  centerMarker.style.backgroundSize = 'cover';
          centerMarker.style.borderRadius = '50%';

          // マップのコンテナ要素と中心マーカー要素を取得
          const mapContainer = instance.canvas.find('#map');
          const centerMarkerElement = mapContainer.find('#center-marker');

          // マップのコンテナ要素に中心マーカー要素を追加
          if (centerMarkerElement.length === 0) {
            mapContainer.append(centerMarker);
          }

    } else {
        // マップのコンテナ要素と中心マーカー要素を取得
        const mapContainer = instance.canvas.find('#map');
        const centerMarkerElement = mapContainer.find('#center-marker');

        // マップのコンテナ要素から中心マーカー要素を削除
        if (centerMarkerElement.length !== 0) {
            centerMarkerElement.remove();
        }
    }
    
  // mapオブジェクトの中心座標とズームレベルを更新
  if (instance.data.map) {
    instance.data.map.setCenter([lng, lat]);
    instance.data.map.setZoom(zoom);

    instance.data.map.on('moveend', () => {
      const center = instance.data.map.getCenter();
      const latitude = center.lat;
      const longitude = center.lng;
      instance.publishState('centerLat', '緯度:' + latitude);
      instance.publishState('centerLng', '経度:' + longitude);
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