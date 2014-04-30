var util = require('util');
var emitter = require('events').EventsEmitter;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var opts = {};

var schema = new Schema({
  path: {type: String}
});

function openConnection(callback){


var connection = mongoose.createConnection('mongodb://localhost:27017/zengoose', opts, function(err){
  console.log('connection open');
  var model = connection.model('model', schema);
  console.log(util.inspect(model.tree));
  callback(connection);
});
}



function closeConnection(connection, callback){
  connection.close(function(err){
    console.log('connectino closed: ', err);
    callback();
  });
}

(function(){
  openConnection(function(conn){
    closeConnection(conn, function(){
      openConnection(function(conn){
        console.log('done');
      });
    });
  });
})();


function Zengoose(){
  this._connection = null;
  this.open = openConnection(function(connection){
    this.emit('connectionOpen');
    this._connection = connection;
  });
  
  this.close = function(){
     closeConnection(this._connection, function(){
       this.emit('connectionClosed'); 
     });
  }
}
util.inherits(Zengoose, emitter);

var zen = new Zengoose();

zen.open();

