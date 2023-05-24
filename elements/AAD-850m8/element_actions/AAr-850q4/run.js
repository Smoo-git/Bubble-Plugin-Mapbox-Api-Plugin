function(instance, properties, context) {
    const map = instance.data.map;
    let latitude = properties.location.get('latitude_number'); 
    let longitude = properties.location.get('longitude_number');
    let coordinates = [longitude, latitude];
    var bounds = [[139.0, 35.0], [140.0, 36.0]];
    
    map.flyTo({
      center: coordinates,
      essential: true,
      zoom: properties.zoom
    });
}