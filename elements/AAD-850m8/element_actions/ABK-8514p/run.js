function(instance, properties, context) {

const map = instance.data.map;
    
  const latitudeDb = properties.latitudedbname + "_number"
  const longitudeDb = properties.longitudedbname + "_number"
    let markersData = [];
    
    try {
    if (properties.locations && typeof properties.locations.get === 'function' && typeof properties.locations.length === 'function') {
      let locations = properties.locations.get(0, properties.locations.length());
      let processEachLocation = (location, index, array) => {
        let lat = location.get(latitudeDb);
        let lng = location.get(longitudeDb);
        markersData.push({
          lng: lng,
          lat: lat
        });
      }
      const getMarkersDataPromise = new Promise((resolve, reject) => {
        locations.forEach(processEachLocation);
        resolve();
      });
        // マーカーデータの取得が完了した後にfitBoundsを実行する
      getMarkersDataPromise.then(() => {
        if (markersData.length > 0) {
          const { lat: northwestLat, lng: northwestLng } = markersData.reduce(
            (prev, curr) => ({
              lat: Math.max(prev.lat, curr.lat),
              lng: Math.min(prev.lng, curr.lng)
            }),
            { lat: -Infinity, lng: Infinity }
          );

          const { lat: southeastLat, lng: southeastLng } = markersData.reduce(
            (prev, curr) => ({
              lat: Math.min(prev.lat, curr.lat),
              lng: Math.max(prev.lng, curr.lng)
            }),
            { lat: Infinity, lng: -Infinity }
          );

          const northwest = { lat: northwestLat, lng: northwestLng };
          const southeast = { lat: southeastLat, lng: southeastLng };
          const bbox = [[northwest.lng, northwest.lat], [southeast.lng, southeast.lat]];
          map.fitBounds(bbox, {
            padding: { top: 80, bottom: 20, left: 50, right: 50 }
          });
        } else {
          console.error('No marker data available.');
        }
      });
    }
  } catch (error) {
    console.error('Error while trying to get location data:', error);
  }

}