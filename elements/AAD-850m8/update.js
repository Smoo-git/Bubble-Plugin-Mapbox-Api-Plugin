function(instance, properties) {
    if(instance.data.update) {
  const map = instance.data.map;
  if(properties.style) {map.setStyle(properties.style)}

  const iconDb = properties.icondbname + "_image"
  const latitudeDb = properties.latitudedbname + "_number"
  const longitudeDb = properties.longitudedbname + "_number"

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

  if (properties.currentLocation) {
    if (!instance.data.geolocate) {
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
    if (instance.data.geolocate) {
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
        let markerId = location.get('_id'); // データベースからIDを取得
        let lat = location.get(latitudeDb);
        let lng = location.get(longitudeDb);
        let imgUrl;
        if (location.get(iconDb)) {
          imgUrl = location.get(iconDb);
        } else {
          imgUrl = properties.defaultImage;
        }

        // markersData配列に新たな要素を追加
        markersData.push({
          id: markerId, // マーカーのIDを追加
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
  const geojson = {
    type: 'FeatureCollection',
    features: markersData.map(function (marker) {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [marker.lng, marker.lat]
        },
        properties: {
          image: marker.imgUrl,
          id: marker.id
        }
      };
    })
  };

  function createMarkerElement(width, height, image, id) {
    // SVGの名前空間
    const svgns = "http://www.w3.org/2000/svg";

    // SVG要素を作成
    const svgElement = document.createElementNS(svgns, 'svg');
    svgElement.setAttributeNS(null, 'width', width);
    svgElement.setAttributeNS(null, 'height', height + 10);

    // グループ要素を作成（シャドウの適用のため）
    const groupElement = document.createElementNS(svgns, 'g');

    // 円形の部分（バルーンの部分）
    const circleElement = document.createElementNS(svgns, 'circle');
    circleElement.setAttributeNS(null, 'cx', width / 2);
    circleElement.setAttributeNS(null, 'cy', height / 2);
    circleElement.setAttributeNS(null, 'r', width / 2 - 2);
    circleElement.setAttributeNS(null, 'fill', 'white');
    circleElement.setAttributeNS(null, 'filter', 'url(#marker-shadow)'); // シャドウの適用

    // 三角形の部分（吹き出しの尾部分）
    const triangleElement = document.createElementNS(svgns, 'polygon');
    triangleElement.setAttributeNS(null, 'points', `${width / 2 - 8}, ${height - 10} ${width / 2 + 8}, ${height - 10} ${width / 2}, ${height + 10}`);
    triangleElement.setAttributeNS(null, 'fill', 'white');

    // 画像を配置
    const imageElement = document.createElementNS(svgns, 'image');
    imageElement.setAttributeNS(null, 'href', `https://${image}`);
    imageElement.setAttributeNS(null, 'height', height - 8); // ボーダーの分を減らす
    imageElement.setAttributeNS(null, 'width', width - 8); // ボーダーの分を減らす
    imageElement.setAttributeNS(null, 'y', 4); // ボーダーの分をオフセットする
    imageElement.setAttributeNS(null, 'x', 4); // ボーダーの分をオフセットする
    imageElement.setAttributeNS(null, 'clip-path', 'circle(48% at 50% 50%)'); // 画像を円形に切り抜く
    imageElement.setAttributeNS(null, 'filter', 'url(#marker-shadow)'); // シャドウの適用

    // シャドウのフィルター要素を作成
    const filterElement = document.createElementNS(svgns, 'filter');
    filterElement.setAttributeNS(null, 'id', 'marker-shadow');
    filterElement.setAttributeNS(null, 'x', '-20%');
    filterElement.setAttributeNS(null, 'y', '-20%');
    filterElement.setAttributeNS(null, 'width', '140%');
    filterElement.setAttributeNS(null, 'height', '140%');

    const feDropShadowElement = document.createElementNS(svgns, 'feDropShadow');
    feDropShadowElement.setAttributeNS(null, 'dx', '0');
    feDropShadowElement.setAttributeNS(null, 'dy', '2');
    feDropShadowElement.setAttributeNS(null, 'stdDeviation', '2');
    feDropShadowElement.setAttributeNS(null, 'flood-color', 'rgba(0, 0, 0, 0.2)');

    filterElement.appendChild(feDropShadowElement);
    svgElement.appendChild(filterElement);
    groupElement.appendChild(circleElement);
    groupElement.appendChild(triangleElement);
    groupElement.appendChild(imageElement);
    svgElement.appendChild(groupElement);

    return svgElement;
  }

  for (const marker of geojson.features) {
    let newMarker;
    if (properties.imageMarker) {
      const width = properties.iconWidth;
      const height = width;
      const image = marker.properties.image;
      const id = marker.properties.id;

      const markerElement = createMarkerElement(width, height, image, id);

      newMarker = new mapboxgl.Marker(markerElement, { anchor: 'bottom' })
        .setLngLat(marker.geometry.coordinates)
        .addTo(map);
      // マーカーオブジェクトに ID を追加
      newMarker.properties = {
        ...marker.properties,
        id: id
      };
    } else {
      newMarker = new mapboxgl.Marker({ anchor: 'bottom' })
        .setLngLat(marker.geometry.coordinates)
        .addTo(map);
    }
    // 追加したマーカーをinstance.data.markersに保存
    instance.data.markers.push(newMarker);
  }

  // クリックイベントを定義
  for (const marker of instance.data.markers) {
    const markerId = marker.properties.id;
    marker.getElement().addEventListener('click', () => {
        instance.triggerEvent('mapclick', function (err) {
          if (err) {
            console.log('エラーが発生しました:', err);
          } else {
            console.log('カスタムイベントがトリガーされました');
          }
        });
      if (!marker.getElement().classList.contains('active')) {
        marker.getElement().classList.add('active');
        marker.getElement().setAttribute('width', properties.iconWidth * 1.5);
        marker.getElement().setAttribute('height', properties.iconWidth * 1.5 + 10);
        instance.publishState('markerId', markerId);
        for (const otherMarker of instance.data.markers) {
          if (otherMarker !== marker && otherMarker.getElement().classList.contains('active')) {
            otherMarker.getElement().classList.remove('active');
            otherMarker.getElement().setAttribute('width', properties.iconWidth);
            otherMarker.getElement().setAttribute('height', properties.iconWidth + 10);
          }
        }
      }
    });
  }



  // マップの中心マーカーを作成
  if (properties.centerPointer) {
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
        if(!instance.data.update) {
              instance.triggerEvent('moveend');
        }
      const center = instance.data.map.getCenter();
      const latitude = center.lat;
      const longitude = center.lng;
      instance.publishState('centerLat', '緯度:' + latitude);
      instance.publishState('centerLng', '経度:' + longitude);

      let bounds = instance.data.map.getBounds();

      let sw = bounds.getSouthWest(); // 南西の座標を取得
      let ne = bounds.getNorthEast(); // 北東の座標を取得
      let nw = new mapboxgl.LngLat(sw.lng, ne.lat); // 北西の座標を取得
      let se = new mapboxgl.LngLat(ne.lng, sw.lat); // 南東の座標を取得
      instance.publishState('southWestLat', sw.lat);
      instance.publishState('northEastLat', ne.lat);
      instance.publishState('northWestLat', nw.lat);
      instance.publishState('southEastLat', se.lat);
      instance.publishState('southWestLng', sw.lng);
      instance.publishState('northEastLng', ne.lng);
      instance.publishState('northWestLng', nw.lng);
      instance.publishState('southEastLng', se.lng);
    });

    
  }
        instance.data.update = false;
    }
}