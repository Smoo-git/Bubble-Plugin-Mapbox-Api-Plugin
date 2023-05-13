function(instance, properties, context) {

    if(instance.data.map) {

        // Get the current center coordinates
        var center = instance.data.map.getCenter();

        // Log the coordinates to the console
        console.log('Latitude: ' + center.lat + ', Longitude: ' + center.lng);

        // You can also return these values if you want to use them elsewhere
        return {
            lat: center.lat,
            lng: center.lng
        };
    };
};