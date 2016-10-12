"use strict";

// This test written in mocha+should.js
var should = require('./init.js');
var async = require('async');
var debug = require('debug')('loopback:connector:dynamodb:test');
var modelDefinition = require ('./model_definitions.js');

var Superhero, User, Post, PostWithStringId, db;

var Thread;

describe('DynamoDb', function() {


	before(function() {
		db = getDataSource();
		var threadModelDefinition = modelDefinition.threadModelHashAndRange;
		Thread = db.define (threadModelDefinition[0],threadModelDefinition[1],threadModelDefinition[2]);


	});
	


	it('should connect', function(done) {

		db = getDataSource();

		if (db) done();

	});



});

