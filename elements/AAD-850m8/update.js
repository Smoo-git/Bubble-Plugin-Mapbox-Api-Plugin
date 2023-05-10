function(instance, properties, context) {
  // プロパティから座標とズームレベルを取得
  let lng = properties.longitude;
  let lat = properties.latitude;
  let zoom = properties.zoom;

  // 複数のマーカーの座標を配列に格納
  const markersData = [];
  if (properties.multiLocation && properties.locations) {
    markersData = [properties.locations];
  } else {
    return
  }

  // 既存のマーカーを削除
  if (instance.data.markers) {
    instance.data.markers.forEach(marker => marker.remove());
    instance.data.markers = []; // ここでマーカー配列をリセット
  } else {
    instance.data.markers = [];
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

  // mapオブジェクトの中心座標とズームレベルを更新
  if (instance.data.map) {
    instance.data.map.setCenter([lng, lat]);
    instance.data.map.setZoom(zoom);
  }
}