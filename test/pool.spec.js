var should = require('should');
var util = require('util');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Keeper = require('../lib/keeper');
var Pool = require('../lib/pool');

describe('Connection pool', function(){
  var pool = new Pool(0);
  var schema = new Schema({path: String});
  var keeper = new Keeper('mongodb://127.0.0.1:27017/zengoose_test');
  keeper.addSchema('test', schema);
  beforeEach(function(done){
    keeper.compile(done);
  });
  it('should keep registry of keepers', function(done){
    pool.registerKeeper('keeperId', keeper);
    pool._keepers.keeperId.should.be.an.Object;
    (pool._keepers.keeperId.id).should.equal('keeperId');
    (pool._keepers.keeperId.ts).should.be.a.Date;
    (pool._keepers.keeperId.keeper).should.be.an.instanceof(Keeper);
    done();
  });
  it('should be able to return keeper by id', function(done){
    var storedKeeper = pool.getKeeper('keeperId');
    should.exist(storedKeeper);
    should.exist(storedKeeper.connection);
    (storedKeeper.connection.models.test).should.be.a.Function;
    done();
  });
  it('should be able to return stale keepers', function(done){
    var stale = pool.staleKeepers();
    stale.should.be.an.Array;
    (stale.length).should.equal(1);
    done();
  });
  it('should be able to remove keeper from registry', function(done){
    pool.destroyKeeper('keeperId');
    should.not.exist(pool._keepers.keeperId);
    done();
  });
});
