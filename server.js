var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');

var app = express();
var port = process.env.PORT || 3000;

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

var pageType = {"pageType":"page"};			//This is a variable we can change to give more specific 404 error messages

var movieList = require('./public/movies.json');					//These lists will pull from a JSON file in full implementation
var userList = [];

let curUser;

app.get('*', function(req, res, next) {
  pageType.pageType = 'page';
  next();
})

app.get('/', function(req, res) {
  res.status(200).render('home', movieList);
})

app.get('/movies', function(req, res) {
  res.status(200).render('movies', movieList);
})

app.get('/movies/:Title', function (req, res, next) {
  var Title = req.params.Title
  if (movieList[Title]) {
    res.status(200).render('movieDetails', movieList[Title]);
  } else {
  pageType.pageType = 'film';
  next();
  }
})

app.get('/profile/:Name', function (req, res, next) {
  for (var i = 0; i < userList.length; i++) {
    if (userList[i].name == req.params.Name) {
      res.status(200).render('profile', userList[i]);
    }
  }
  pageType.pageType = 'profile';
  next();
})

app.use(express.static('public'));

app.get('*', function(req, res) {
  res.status(400).render('404', pageType);
})

app.listen(port, function() {
  console.log("== Server is listening on port", port);
})
