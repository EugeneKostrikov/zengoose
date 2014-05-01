var Pool = require('./lib/pool');
var single = new Pool(60 * 60 * 1000);
var Keeper = require('./lib/keeper');

module.exports ={
  pool: single,
  Keeper: Keeper
};