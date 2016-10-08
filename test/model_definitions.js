
module.exports = {
	threadModelnoId : [
		'Thread',
		{
			"name": {
		      "type": "String",
		      "required": true
		    },
		    "category": {
		      "type": "String",
		      "required": true
		    },
		    "messages": {
		      "type": "Number"
		    },
		    "threads": {
		      "type": "Number"
		    },
		    "views": {
		      "type": "Number"
		    }	
		},
		{
			"readCapacityUnits" :5,
			"writeCapacityUnits" :5,
			"idInjection": false,
			//Global Secondary indexes go here, TODO
			"indexes": {
			}
		}
	],
	threadModelHash : [
		'Thread',
		{
			"name": {
		      "type": "String",
		      "required": true,
		      "id": true,
		      "keyType": "partition"
		    },
		    "category": {
		      "type": "String",
		      "required": true
		    },
		    "messages": {
		      "type": "Number"
		    },
		    "threads": {
		      "type": "Number"
		    },
		    "views": {
		      "type": "Number"
		    }	
		},
		{
			"readCapacityUnits" :5,
			"writeCapacityUnits" :5,
			"idInjection": false,
			//Global Secondary indexes go here, TODO
			"indexes": {
			}
		}
	],
	threadModelHashAndRange : [
		'Thread',
		{
			"name": {
		      "type": "String",
		      "required": true,
		      "id": true,
		      "keyType": "partition"
		    },
		    "category": {
		      "type": "String",
		      "required": true,
		      "id": true,
		      "keyType": "sort"
		    },
		    "messages": {
		      "type": "Number"
		    },
		    "threads": {
		      "type": "Number"
		    },
		    "views": {
		      "type": "Number"
		    }	
		},
		{
			"readCapacityUnits" :5,
			"writeCapacityUnits" :5,
			"idInjection": false,
			//Global Secondary indexes go here, TODO
			"indexes": {
			}
		}
	],
	threadModelError : [
		'Thread',
		{
			"name": {
		      "type": "String",
		      "required": true,
		      "id": true,
		      "keyType": "partition"
		    },
		    "category": {
		      "type": "String",
		      "required": true,
		      "id": true
		    },
		    "messages": {
		      "type": "Number",
		      "id": true,
		      "keyType": "partition"
		    },
		    "threads": {
		      "type": "Number"
		    },
		    "views": {
		      "type": "Number"
		    }	
		},
		{
			"readCapacityUnits" :5,
			"writeCapacityUnits" :5,
			"idInjection": false,
			//Global Secondary indexes go here, TODO
			"indexes": {
			}
		}
	]
};
