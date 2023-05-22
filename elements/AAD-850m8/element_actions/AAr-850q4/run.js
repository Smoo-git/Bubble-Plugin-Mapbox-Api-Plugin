function(instance, properties, context) {
    let latitude = properties.location.get('latitude_number'); 
    let longitude = properties.location.get('longitude_number');
    let coordinates = [longitude, latitude];
    
    instance.data.map.flyTo({
      center: coordinates,
      essential: true,
      zoom: 14
    });
}