"use strict";

// This test written in mocha+should.js
var should = require('./init.js');
var async = require('async');
var debug = require('debug')('loopback:connector:dynamodb:test:helper');
var modelDefinition = require ('./model_definitions.js');
var helper = require ('./../lib/helper.js');
var db;

describe('DynamoDb Helper', function() {


	before(function() {
	});
	


	it('getHashAndRange should return empty for - threadModelnoId', function() {
		var ThreadModel = modelDefinition.threadModelnoId;
		var keys =  helper.getKeyHashAndRange(ThreadModel[1]);
		keys.should.be.instanceof(Array).and.have.lengthOf(0);
	});

	it('getHashAndRange should return Partition property for - threadModelHash', function() {
		var threadModelHash = modelDefinition.threadModelHash;
		var keys =  helper.getKeyHashAndRange(threadModelHash[1]);

		keys.should.be.instanceof(Array).and.have.lengthOf(1);
		keys[0].should.have.property('id');
		(keys[0].id).should.equal(true);
		
	});

	it('getHashAndRange should return Partition&Sort properties for - threadModelHashAndRange', function() {
		var threadModelHashAndRange = modelDefinition.threadModelHashAndRange;
		var keys =  helper.getKeyHashAndRange(threadModelHashAndRange[1]);
		keys.should.be.instanceof(Array).and.have.lengthOf(2);
		keys[0].should.have.property('id');
		(keys[0].id).should.equal(true);
		(keys[0].keyType).should.equal('partition');

		keys[1].should.have.property('id');
		(keys[1].id).should.equal(true);
		(keys[1].keyType).should.equal('sort');
	});

	it('getHashAndRange should return null for - threadModelError', function() {
		var threadModelError = modelDefinition.threadModelError;
		var keys =  helper.getKeyHashAndRange(threadModelError[1]);

		should.not.exist(keys);

	});

});

