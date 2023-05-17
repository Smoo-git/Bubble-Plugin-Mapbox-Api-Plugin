function(instance, properties, context) {

    let listOfThings = properties.locations.get(0, properties.locations.length());

    let processOnEachItem = (element, index, array) => {
                console.log(element.get("latitude"))
    }  

    listOfThings.forEach(processOnEachItem);  
};