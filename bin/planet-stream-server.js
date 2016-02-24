#!/usr/bin/env node

// start planet-stream
var argv = require('minimist')(process.argv.slice(2));

console.log("Starting Planet Stream Server at: " + (new Date()).toString())
var fs = require("fs")
var port = 7437;
var http = require('http');

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

var s = new stream.Readable();
s._read = function noop(){}; // redundant? see update below
s.push(null);


//Go within the server for now?
var server = http.createServer(function (req, res) {

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
    console.log("Pushing..." + id);
    s.push(JSON.stringify( (obj) );
    console.log("Piping..." + id);
    s.pipe(res)
  });
});
});
