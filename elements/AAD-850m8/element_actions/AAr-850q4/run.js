function(instance, properties, context) {
  const map = instance.data.map;
  let latitude = properties.location.get('latitude_number');
  let longitude = properties.location.get('longitude_number');
  let setLat = latitude + (properties.latoffset);
  let setLng = longitude + (properties.lngoffset);
  let coordinates = [setLng, setLat];

  map.flyTo({
    center: coordinates,
    essential: true,
    zoom: properties.zoom
  });
}