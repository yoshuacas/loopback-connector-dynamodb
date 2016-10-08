
var debug = require('debug')('loopback:connector:dynamodb:helper');

module.exports = {  
  TypeLookup: function TypeLookup(typestring) {
    if (typestring === "string") {
      return 'S';
    } else if (typestring === "number") {
      return 'N';
    } else if (typestring === "boolean") {
      return 'N';
    } else if (typestring === "date") {
      return 'S';
    }
  },


/*
A property is a key if it has the value of id:true
A value keyType - not defined by the Loopback documentation, is used to define the keytype

  "name": {
          "type": "String",
          "required": true,
          "id": true,
          "keyType": "partition"
        }

Per the documentation from Dynamo, the keyTypes are defined as:
 1. Partition, parametrized as HASH in the AWS API
 2. Sort, parametrized as RANGE in the AWS API

TODO: Support for Global Secondary Indexes and Local Secondary Indexes is still not provided, in the future I will use the indexes array as defined in the Loopback documentation

@param {properties} The set of properties for this Model Definition.
@result {keys} Array with properties for Partition and Range Keys [HASH,RANGE]

  if NULL then there is an error with the KEYS, more than one is defined for either Type
  if length = 0, then there are no IDs defined for the table, by default we will create one and provide a UUID
  if length = 1, it has to be a Partition Key, otherwise return NULL
  if length = 2, it has both partition and range keys defined
*/
  getKeyHashAndRange: function (properties) {
    var keys = [];
    var countRangeKeys = 0;
    var countPartitionKeys = 0;

    Object.keys (properties).forEach (function (key){

      if (properties[key].id === true){
        if (properties[key].keyType=== 'partition'){
            keys[0] = properties[key];
            countPartitionKeys ++;

        } else if (properties[key].keyType=== 'sort'){
            keys[1] = properties[key];
            countRangeKeys ++;
        }
      }
    });

    if (countRangeKeys > 1 || countPartitionKeys > 1) {
      keys = null;
      debug ("ERROR Model Definition -- ", "Please make sure that your model definition complies with the Dynamo restriction of having max 2 ids in the table");
      debug ("Also: please make sure that you name the keyType property in each of your IDs, keyType needs to be either 'partition' or 'sort'");

    }

    return keys;
  }

}