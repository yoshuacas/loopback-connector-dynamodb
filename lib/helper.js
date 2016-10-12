
var debug = require('debug')('loopback:connector:dynamodb:helper');

module.exports = {  
  TypeLookup: function TypeLookup(typestring) {
    if (typestring === "string" || typestring === "String") {
      return 'S';
    } else if (typestring === "number" || typestring === "Number") {
      return 'N';
    } else if (typestring === "boolean" || typestring === "Boolean") {
      return 'N';
    } else if (typestring === "date" || typestring === "Date") {
      return 'S';
    }
  },



  getKeyByKeyType: function (properties, keyType){
    var hashKey ={};

    Object.keys (properties).forEach(function (key){
        if (properties[key].id === true && properties[key].keyType ===keyType){

          hashKey.AttributeName = key;
          if (keyType === 'partition' || keyType === 'HASH'){
            hashKey.KeyType = 'HASH';
          } else if (keyType === 'sort' || keyType === 'RANGE'){
            hashKey.KeyType = 'RANGE';
          }
          
        }
    });  
    return hashKey;
  }

}

