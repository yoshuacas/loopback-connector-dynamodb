
var g = require('strong-globalize')();
var AWS = require('aws-sdk');
var util = require('util');
var async = require('async');
var Connector = require('loopback-connector').Connector;
var debug = require('debug')('loopback:connector:dynamodb');
var helper = require('./helper.js');

/*!
 * Generate the dynamodb URL from the options
 */
function generateDynamoDBURL(options) {
  options.hostname = (options.hostname || options.host || '127.0.0.1');
  options.port = (options.port || 8000);
  options.database = (options.database || options.db || 'test');
  var username = options.username || options.user;
  if (username && options.password) {
    return 'http://' + options.hostname + ':' + options.port + '/' + options.database;
  } else {
    return 'http://' + options.hostname + ':' + options.port + '/' + options.database;
  }
}



/**
 * Initialize the  connector against the given data source
 *
 * @param {DataSource} dataSource The loopback-datasource-juggler dataSource
 * @param {Function} [callback] The callback function
 */
exports.initialize = function initializeDataSource(dataSource, callback) {

	if (!AWS) {
		return;
	}



    var s = dataSource.settings;
    s.host = dataSource.settings.host;
    s.port = dataSource.settings.port;
    s.region = dataSource.settings.region;
    s.accessKeyId = dataSource.settings.accessKeyId;
    s.secretAccessKey = dataSource.settings.secretAccessKey;
    s.maxRetries = dataSource.settings.maxRetries;
 	s.url = s.url || generateDynamoDBURL(s);


	AWS.config.update({
          accessKeyId: s.accessKeyId,
          secretAccessKey: s.secretAccessKey,
          region: s.region,
          maxRetries : s.maxRetries
        });

	dataSource.connector = new DynamoDB(s, dataSource);

	if (callback) {
		dataSource.connector.connect(callback);
	}

};


/**
 * The constructor for DynamoDB connector
 * @param {Object} settings The settings object
 * @param {DataSource} dataSource The data source instance
 * @constructor
 */
function DynamoDB (settings, dataSource) {
	Connector.call (this, 'dynamodb', settings);

	this.debug =settings.debug || debug.enabled;

	this.dataSource = dataSource;

}

util.inherits(DynamoDB, Connector);






/**
 * Connect to DynamoDB
 * @param {Function} [callback] The callback function
 *
 * @callback callback
 * @param {Error} err The error object
 * @param {Db} db The mongo DB object
 */
DynamoDB.prototype.connect = function(callback) {
  var self = this;
  var err = null;
  if (self.db) {
    process.nextTick(function() {
      callback && callback(null, self.db);
    });
  } else if (self.dataSource.connecting) {
    self.dataSource.once('connected', function() {
      process.nextTick(function() {
        callback && callback(null, self.db);
      });
    });
  } else {
		var dynamodb = new AWS.DynamoDB({
				endpoint: new AWS.Endpoint('http://' + self.settings.host + ':' + self.settings.port)
			});

		if (dynamodb) {
			debug('DynamoDB connection is established: ' + self.settings.url);
			self.db = dynamodb;

		} else {
			g.error('{{DynamoDB}} connection is failed: %s %s', self.settings.url);
			err = "could not connect";
		};

		callback && callback(err, self.db);
  }
};


DynamoDB.prototype.getTypes = function() {
  return ['db', 'nosql', 'dynamodb'];
};


/**
 * Get collection name for a given model
 * @param {String} model Model name
 * @returns {String} collection name
 */
DynamoDB.prototype.collectionName = function(model) {
  var modelClass = this._models[model];
  if (modelClass.settings.dynamodb) {
    model = modelClass.settings.dynamodb.collection || model;
  }
  return model;
};



/**
 * Ping the database
 *
 * @param {Function} [callback] The callback function
 */
DynamoDB.prototype.ping = function(callback) {
	var self = this;
	if (self.db) {
		this.db.collection('dummy').findOne({ _id: 1 }, callback);
	} else {
		self.dataSource.once('connected', function() {
			self.ping(callback);
		});
		self.dataSource.once('error', function(err) {
			callback(err);
		});
		self.connect(function() {});
	}
};



/**
 * Create a new model instance for the given data
 * @param {String} model The model name
 * @param {Object} data The model data
 * @param {Function} [callback] The callback function
 */
DynamoDB.prototype.create = function(model, data, options, callback) {

	var self = this;
	if (self.debug) {
		debug('create', model, data);
	}



	var docClient = new AWS.DynamoDB.DocumentClient();

	var params = {
		TableName: model,
		Item: data
	}; 

	if (self.debug) {
		debug('Adding the new value', params);
	}

	docClient.put (params, function (err,data){
		if (err) {
			callback (err,null);
		} else {
			callback (null, data);
		}
	});

};


DynamoDB.prototype.define = function (modelDefinition){
	
	modelDefinition.settings = modelDefinition.settings || {};
	var modelName = modelDefinition.model.modelName;
  	this._models[modelName] = modelDefinition;

  	var createTableParams = {};
  	createTableParams.AttributeDefinitions = [];
  	createTableParams.KeySchema =[];
  	createTableParams.ProvisionedThroughput=[];
	createTableParams.TableName = modelDefinition.model.modelName;


	// Preparing the table creation parameters for AWS Dynamo Create TABLE request
	var properties = modelDefinition.properties;

	Object.keys(properties).forEach (function(key){
	
		createTableParams.AttributeDefinitions.push ({
			AttributeName: key,
  			AttributeType: helper.TypeLookup (properties[key].type.name)
		});

	});

  	
  	//IF modelDefinition.idInjection is true, then we use an autogenerated UUID for each record in the table
  	//meaning the HASH will be the only primary key of the table.

  	//Otherwise, if modelDefinition.idInjection is false, we have two define the Partition and Sort Keys. or as minimum the Partition Key.

  	if (modelDefinition.idInjection) {
  		//idInjection: true is the default behaviour of Loopback. We will follow that definition by making that id the Partition Key of the table
  		createTableParams.AttributeDefinitions.push ({
  			AttributeName: 'id', /* required by Loopback*/
      		AttributeType: 'S' 
  		});
  		createTableParams.KeySchema.push ({
  			AttributeName: 'id',
      		KeyType: 'HASH'
  		});
  	} else {
  		//When developers want to define their own Partition and Range keys we allow them
  		
  		var partitionKey = helper.getKeyByKeyType (properties, "partition");

  		if (Object.keys (partitionKey).length === 0 ) {
  			//There is no partition Key defined
  			debug ('ERROR', 'You should define at least one partition index');
  		} else {
  			createTableParams.KeySchema.push (partitionKey);
			
			//search for range Key
			var rangeKey = helper.getKeyByKeyType (properties, "sort");

			if (Object.keys (rangeKey).length >0  ) {
				createTableParams.KeySchema.push (rangeKey);	
			} 
  		}

  		debug ("AttributeDefinitions",createTableParams.AttributeDefinitions);
  		debug ("keySchema",createTableParams.KeySchema);

  		

  	}

};


/*
List all the tables in a database
@param {dynamodb} The database with the tables
@param {Function} [callback] The callback function.
*/
var listTables = function (dynamodb, callback){
	var tables = [];
	dynamodb.listTables(function (err, data) {
	    if (err || !data) {
	      debug("ERROR", "-------Error while fetching tables from server--------");
	      callback(err, null);
	      return;
	    } else {
	    	debug ("Tables in database:", data);
	    	callback (null, data);
	    };
	});
};

/*
Finds it table exists in a list of tables
@param {tableName} The name of the table we are looking for
@param {tables} The list of Tables retrieved from the Datasource 
*/
var hasTable = function (tableName, tables){
	var result = false;
	for (var i=0, len = tables.length; i < len; i++){
		if (tableName.localeCompare(tables[i])==0){
			result = true;
		};
	}
	return result;
};




















































