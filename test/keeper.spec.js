var should = require('should');
var util = require("util");

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Keeper = require('../lib/keeper');

describe('Keeper base class', function(){
  var schema = new Schema({path: String});
  var keeper = new Keeper('mongodb://127.0.0.1:27017/zengoose_test');
  keeper.addSchema('test', 'test', schema);
  it('should be able to emit and listen to events', function(done){
    keeper.on('testEvent', function(arg){
      arg.should.equal('hello');
      done();
    });
    keeper.emit('testEvent', 'hello');
  });
  it('should create connection and callback on open', function(done){
    var specKeeper = new Keeper('mongodb://127.0.0.1:27017/zengoose_test');
    specKeeper.compile(function(err, connection){
      should.not.exist(err);
      connection.should.be.an.Object;
      done();
    });
  });
  it('should keep Schemas registry for future use', function(done){
    keeper.compile(function(err, connection){
      should.not.exist(err);
      (connection.models.test).should.be.a.Function;
      done();
    });
  });
  it('should be able to recompile all models under connection it is responsible for', function(done){
    keeper.addSchema('second', 'second', new Schema({path: String}));
    should.exist(keeper.connection.models.test);
    should.not.exist(keeper.connection.models.second);
    keeper.compile(function(err, connection){
      should.not.exist(err);
      should.exist(connection.models.second);
      done();
    });
  });
  it('should be able to work with asynchronous Schema definition', function(done){
    function getter(callback){
      var schema = new Schema({path: String});
      callback(null, schema);
    }
    keeper.addSchema('async', 'async', {}, getter);
    keeper.compile(function(err, connection){
      should.not.exist(err);
      var models = connection.models;
      should.exist(models.async);
      done();
    });
  });
  it('should emit error event if error happens when resolving schema', function(done){
    function getter(callback){
      callback(new Error('fake'));
    }
    keeper.on('error', function(err){
      should.exist(err);
    });
    keeper.addSchema('errored', 'errored', {}, getter);
    keeper.compile(function(err, connection){
      should.not.exist(err);
      should.exist(connection);
      done();
    });
  });
});
