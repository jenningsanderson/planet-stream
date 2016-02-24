#!/usr/bin/env node

// start planet-stream
var argv = require('minimist')(process.argv.slice(2));

console.log("Starting Planet Stream at: " + (new Date()).toString())
var fs = require("fs")

var R = require('ramda');
var planetstream = require('../')({
  verbose: argv.v,
  limit: argv.limit,
  host: process.env.REDIS_PORT_6379_TCP_ADDR || process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT_6379_TCP_PORT || process.env.REDIS_PORT || 6379
});

// parse comments into hashtag list
function getHashtags (str) {
  if (!str) return [];
  var wordlist = str.split(' ');
  var hashlist = [];
  wordlist.forEach(function (word) {
    if (word.startsWith('#') && !R.contains(word, hashlist)) {
      word = word.trim();
      word = word.replace(/,\s*$/, '');
      hashlist.push(word);
    }
  });
  return hashlist;
}

// Filter out records that have no metadata
planetstream.map(JSON.parse)
.filter(function (data) {
  if (argv['hashtags']) {
    if (data.metadata && data.metadata.comment) {
      return getHashtags(data.metadata.comment).length > 0;
    }
  } else {
    return data.hasOwnProperty('metadata');
  }
})

// print out record
.onValue(function (obj) {
  var id = obj.metadata.id;
  console.log("Writing.. " + id);
  fs.writeFile('/data/changeset-'+id+'.json', JSON.stringify(obj), function(err){
    if (err) throw err;
    console.log(id + ' saved!');
  });
});
