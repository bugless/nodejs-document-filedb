const TEST_KEY = "foo"
		, TEST_VAL = "bar";

var DataStore = require('data-store')
	, TestCollection = new DataStore('test');

exports["Test that collection is created"] = function(test) {
	test.ok(TestCollection, "Test Collection should initialize");
	test.done();
};

exports["Test that collection persists data to make it eventually consistent"] = function(test) {
	TestCollection[TEST_KEY] = TEST_VAL;
	var TestCollectionAgain = new DataStore('test');
	setTimeout(function() {
		test.equal(TestCollectionAgain[TEST_KEY], TEST_VAL, "Data did not persist to disk and was not eventually consistent");
		test.done();
	}, 100);
};

exports["Test that collection returned is a sugared extended object"] = function(test) {
	test.ok(typeof TestCollection.find === 'function', "collection returned has to be a sugared extended object");
	test.done();
};

exports.after = function(test) {
	TestCollection.close();
	test.done();
};