var express = require('express');
var fs = require('fs');
var app =  express.createServer();

// Initialize main server
app.use(express.bodyParser());

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('view options', {
  layout: false
});


app.get('/', function(req, res){
  res.render('index');
});

app.get('/display', function(req, res) {
  res.render('display');
});

app.get('/control', function(req, res) {
  res.render('control');
});

app.listen(80);


