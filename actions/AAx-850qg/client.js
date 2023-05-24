function(properties, context) {


  //Load any data 
    
if (properties.thing !== null) {
    let fieldNames = properties.thing.get(0,1)[0].listProperties();
    
    let length = fieldNames.length;
    
    
    let i, fields = "Your field names are: \n";
    
    
    for (i = 0; i < length; i++) {
        
        fields += fieldNames[i] + '\n';
        
    }
    console.log(fields)   
    window.alert(fields)

} else alert('Whoa there, Hoss! The data search you entered was empty. Feed me some data!');

  //Do the operation



}