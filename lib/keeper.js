var mongoose = require('mongoose');
var events = require('events');
var util = require('util');

function Keeper(uri, connectionParams){
  events.EventEmitter.call(this);
  this._uri = uri;
  this._connectionParams = connectionParams || {};
  this._schemas = {};
  this.connection = null;
}

util.inherits(Keeper, events.EventEmitter);

/**
 * Creates new connection with provided params.
 * Compiles all registered schemas.
 * Calls back with current connection
 */
Keeper.prototype.compile = function(callback){
  //Delete reference to old connection so that it can be picked up by GC
  this.connection = null;
  var self = this;

  // Create connection with stored params and callback on open
  self.connection = mongoose.createConnection(self._uri, self._connectionParams);
  self.connection.on('open', function(err){
    callback(err, self.connection);
  });

  // Compile models and scope em to the connection
  Object.keys(self._schemas).forEach(function(name){
    if (self._schemas[name].async){
      self._schemas[name].fn.call(self._schemas[name].context, function(err, Schema){
        if (err){
          return self.emit('error', err);
        }
        self.connection.model(name, Schema);
      });
    }else{
      self.connection.model(name, self._schemas[name].Schema, self._schemas[name].collectionName);
    }
  });

  return self.connection;
};

/**
 * Removes Schema so that it will not be compiled on next compilation
 */
Keeper.prototype.destroy = function(name){
  delete this._schemas[name];
};

/**
 *
 * @param name - model name
 * @param collectionName - collectionName for schema
 * @param options - Schema or context for async resolve
 * @param fn - function that will callback with Schema
 */
Keeper.prototype.addSchema = function(name,  collectionName, options, fn){
  if (fn){
    //handle async
    this._schemas[name] ={
      async: true,
      name: name,
      collection: collectionName,
      context: options,
      fn: fn
    }
  }else{
    //sync
    this._schemas[name] ={
      name: name,
      collection: collectionName,
      Schema: options
    }
  }
};

module.exports = Keeper;