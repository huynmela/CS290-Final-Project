var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var fs = require('fs');

var app = express();
var port = process.env.PORT || 3000;

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

var pageType = {"pageType":"page"};			//This is a variable we can change to give more specific 404 error messages

var movieList = require('./public/movies.json');					//These lists will pull from a JSON file in full implementation
var userList = require('./public/users.json');

var curUser = '';

app.get('*', function(req, res, next) {
  pageType.pageType = 'page';
  next();
})

app.get('/', function(req, res) {
  var iterator = 0;
  newList = {};
  Object.keys(movieList).forEach(key => {
    if (iterator < 6) {
      newObName = movieList[key].url;
      newList[newObName] = movieList[key];
      iterator++;
    }
  })
  res.status(200).render('home', newList);
})

app.get('/movies', function(req, res) {
  res.status(200).render('movies', movieList);
})

app.get('/search/:jsonQuery', function (req, res, next) {
    console.log("== Received search request with parameter", req.params.jsonQuery);
    var Search = req.params.jsonQuery.toLowerCase().replace(/\W/g, '');
    // Go through the json to find if the search exists 
    console.log("  -- Modified search term:", Search);
    resURL = '';
    Object.keys(movieList).forEach(key => {
        if (movieList[key].title) {
            if (movieList[key].title.toLowerCase().replace(/\W/g, '').includes(Search)) {
                resURL = movieList[key].url;
            }
	}
    })
    if (resURL) {
        console.log('  -- Successful search! Returning partial URL:', resURL);
        res.status(200).send(resURL);
    } else {
        console.log('  -- Search failed. Passing to next route.');
        next();
    }
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
    if (userList[i].username === req.params.Name) {
      res.status(200).render('profile', userList[i]);
    }
  }
  pageType.pageType = 'profile';
  next();
})

app.get('/loginAttempt/:username/:passHash', function (req, res, next) {
  var attemptState = "";
  for (var i = 0; i < userList.length; i++) {
    console.log("== Checking for match in object:", userList[i]);
    if (userList[i].username === req.params.username) {
      console.log("== Username matches!\nComparing stored hash", userList[i].passHash, "with received hash", req.params.passHash);
      if (userList[i].passHash === req.params.passHash) {
        attemptState = "Success!";
        console.log("== Match found for user #" + i + ":\n\n", userList[i]);
        var clientsideProfile = JSON.parse(JSON.stringify(userList[i]));
	console.log("  -- clientsideProfile is now:\n\n", clientsideProfile);
	delete clientsideProfile.passHash;
	console.log("  -- Hash removed before sending:\n\n", clientsideProfile);
	res.setHeader('Content-Type', 'application/json');
	curUser = clientsideProfile;
	movieList.currentUser = curUser;
        res.status(200).send(JSON.stringify(clientsideProfile));
      }
      break;
    }
  }
  if (! attemptState) {
    next();
  }
})

app.post('/logout', function(req, res, next) {
  curUser = '';
  if (movieList.currentUser) {
    delete movieList.currentUser;
  }
  res.status(200).send;
})

app.use(express.static('public'));

app.get('*', function(req, res) {
  res.status(400).render('404', pageType);
})

app.post('/movies/:Title/favToggle', function (req, res, next) {
  var Title = req.params.Title
  console.log("== Received favToggle request for", Title);
  if (movieList[Title]) {
    if (movieList[Title].favorite) {
      delete movieList[Title].favorite;
      fs.writeFile(
        __dirname + '/public/movies.json',
	JSON.stringify(movieList, null, 2),
	function(err) {
	  if (err) {
	    res.status(500).send("Error writing new data. Try again.");
	  } else {
	    res.status(200).send()
	  }
	}
      )
    } else {
      movieList[Title].favorite = "true";
      fs.writeFile(
	__dirname + '/public/movies.json',
	JSON.stringify(movieList, null, 2),
	function(err) {
	  if (err) {
	    res.status(500).send("Error writing new data. Try again.");
	  } else {
	    res.status(200).send()
	  }
	}
      )
    }
  } else {
    res.status(404).send("The item you are trying to favorite/unfavorite has a bad URL.");
  }
})

app.listen(port, function() {
  console.log("== Server is listening on port", port);
})
