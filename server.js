'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');
var bodyParser = require('body-parser')
var Schema = mongoose.Schema;

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.DB_URI, { 
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
});

const URLSchema = new Schema({
  url: String
})

const URL = mongoose.model('url', URLSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.json())

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl/new", function (req, res) {
  dns.lookup(req.body.url.replace(/^https?:\/\//i,''), (err, address, family) => {
  if(err)
      res.json({"error":err});
    else{
      URL.findOneAndUpdate({url: req.body.url}, {}, { new: true, upsert: true }, (err, data) => {
        res.json({
          "original_url": req.body.url,
          "short_url": data._id
        });
      })
    }
  })
});

app.get("/api/shorturl/:id", function (req, res) {
  URL.findById(req.params.id, (err, data) => {
    res.redirect(data.url);
  })
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});