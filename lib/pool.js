var util = require('util');

/**
 * @param staleTimeout - timeout in milliseconds
 * @constructor
 */
function Pool(staleTimeout){
  this._keepers = {};
  this._staleTimeout = staleTimeout;
}

Pool.prototype.changeTimeout = function(to){
  this._staleTimeout = to;
};


Pool.prototype.registerKeeper = function(id, keeper){
  var tmp = this._keepers[id] = {};
  tmp.id = id;
  tmp.keeper = keeper;
  tmp.ts = Date.now();
};

Pool.prototype.getKeeper = function(keeperId){
  return this._keepers[keeperId].keeper;
};

Pool.prototype.staleKeepers = function(){
  var result = [];
  var self = this;
  Object.keys(this._keepers).forEach(function eachConnection(id){
    if ((self._keepers[id].ts + self._staleTimeout) < Date.now()){
      result.push(self._keepers[id]);
    }
  });
  return result;
};

Pool.prototype.destroyKeeper = function(id){
  delete this._keepers[id];
};

module.exports = Pool;