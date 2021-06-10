/*
 * The following section is where variables and constants should be declared
 */

var navSearchInput = document.getElementById("nav-search-input");
var navSearchButton = document.getElementById("nav-search-button");

var navHome = document.getElementById("nav-home");
var navMovies = document.getElementById("nav-movies");
var navRegister = document.getElementById("nav-register");
var navSignin = document.getElementById("nav-signin");
var activeTab = document.getElementsByClassName("active");
var navSignout = "";
var navSearchButton = document.getElementById("nav-search-button");

var favButton = document.getElementsByClassName("fav-button");
var movieURL = document.getElementsByClassName("movie-URL");

var navRegister = document.getElementById("nav-register");
var navSignin = document.getElementById("nav-signin");
var popupToggleButton = document.getElementById("popup-toggle-button");
var popupX = document.getElementById("popup-x");
var popupSubmit = document.getElementById("popup-submit");

var currentUser = "";

for (let i = 0; i<favButton.length; i++) {
  favButton[i].addEventListener ("click", function() {
    favToggle(i);
    console.log("Event listener added for favButton", i)
    });
}

/*
 * The following sections is where onBeforeUnload events and event listeners
 * should be declared
 */

window.onBeforeUnload = clearSearch();
window.onBeforeUnload = updateActiveTab();
window.onBeforeUnload = testLog();
window.onBeforeUnload = getUserData();
window.onBeforeUnload = clearSigninModal();

navSearchButton.addEventListener("click", function() {
  performSearch();
});

navRegister.addEventListener("click", function() {
  popupSetRegister();
  popupToggle();
});

navSignin.addEventListener("click", function() {
  popupSetSignin();
  popupToggle();
});

popupToggleButton.addEventListener("click", function() {
  popupTypeToggle();
});

popupX.addEventListener("click", function() {
  popupToggle();
});

popupSubmit.addEventListener("click", function() {
  if (popupToggleButton.innerText === "Create one!") {
    logIn();
  } else {
    register();
  }
});

/*
 * The following section is where functions should be declared
 */
function getUserData() {
  if (!!document.getElementById("current-user")) {
    currentUser = document.getElementById("current-user");
    var userList = require('/users.JSON');
    for (i = 0; i<userList.length; i++) {
      if (userList[i] === currentUser) {
        currentUser = userList[i];
	console.log("Succesfully logged in as\nUsername:", currentUser.username, "\nDisplay Name:", currentUser.displayName);
      }
    }
    if (!(currentUser.username && currentUser.displayName)) {
      alert("Error: You have been logged out due to an error in function \"getUserData\" in index.js or \"app.use\" in server.js.");
      currentUser = "";
    } else {
      updateDisplayLogin();
    }
  }
}
    

function testLog() {
  console.log("index.js has been included");
}

function clearSearch () {
  navSearchInput.value = "";
}

function updateActiveTab() {
  if (activeTab[0]) {
    activeTab[0].classList.remove("active");
  }
  console.log("== The current pathname is", window.location.pathname);
  if (window.location.pathname == "/") {
    navHome.classList.add("active");
  } else if (window.location.pathname.toLowerCase() == "/movies") {
    navMovies.classList.add("active");
  }
}

function createMovieCard(photoUrl, movieTitle, movieDesc){
  var templateContext = {
    photo: photoUrl,
    title: movieTitle,
    desc: movieDesc
  }
  Handlebars.templates.movieTile(templateContext)
}

function favToggle(index) {
  console.log("== Toggling favorite status for film #", index);
  reqURL = "/movies/" + movieURL[index].textContent + "/favToggle";
  button = favButton[index];
  console.log("  -- Button:", button);
  console.log("  -- URL:", reqURL);
  var req = new XMLHttpRequest();
  req.open('POST', reqURL);

  req.setRequestHeader('Content-Type', 'text/html');

  req.addEventListener('load', function(event) {
    if (event.target.status === 200) {
      if (button.firstChild.classList.contains('far')) {
        button.firstChild.classList.remove('far');
	button.firstChild.classList.add('fas');
	console.log("  -- Added to favs.");
      } else if (button.firstChild.classList.contains('fas')) {
        button.firstChild.classList.remove('fas');
	button.firstChild.classList.add('far');
	console.log("  -- Removed from favs.");
      } else {
        alert("ERR: Expected class not found for fav-button. Please contact site maintenance.");
      }
    } else {
      alert("Failed to add or remove to favorites.\n\nError:" + event.target.response);
    }
  })

  req.send();
}

performSearch() {
  var searchTerm = document.getElementById("nav-search-input").value.trim();
  var req = new XMLHttpRequest();
  req.open('GET', searchTerm);
  //finish
}


function hasher(password) {				// *slaps the roof* this bad boy can fit so many collisions in it
  console.log("== In the hasher");
  var charSum = 0;
  for (i=0; i<password.length; i++) {
    charSum += password.charCodeAt(i);
  }
  charSum = charSum % 512;
  return charSum;					//should return 371 for "password" (only allowed entry)
}

function logIn() {
  console.log("== Attempting to sign in");
  var username = document.getElementById("username-text-input").value.trim();
  var password = document.getElementById("password-input").value.trim();
  clearSigninModal();

  if (username && password) {
    password = hasher(password);				//minimizing time the raw password is stored client-side (never gets server-side)
  
    reqURL = '/loginAttempt/' + username + '/' + password;
    console.log("  -- URL:", reqURL);
    var req = new XMLHttpRequest();
    req.open('GET', reqURL);

    req.addEventListener('load', function(event) {
      if (event.target.status === 200) {
        // console.log("  -- Login Authorised\n  -- res.body:", event.target.body);
	//var body = '';
	//res.on('data', function(chunk) {
	//  body += chunk;
	//});
	//res.on('end', function() {
	  console.log("  -- Login Authorised\n  -- res.body:", event.target.responseText);
	  currentUser = event.target.responseText;
          updateDisplayLogin();
	  popupToggle();
	//})
      } else if (event.target.status === 400) {
        console.log("  -- Login Rejected");
        alert("Error: Username/Password combination not accepted");
      } else {
        console.log("  -- Login Failed\n\nError:", event.target.response);
        alert("Failed to log in due to an unexpected error!");
      }
    })

    req.send();
  } else {
    alert("Please enter both a username and a password and try again.");
  }
}

function register() {
  alert("Registration not yet implemented. Sorry!");
}

function clearSigninModal() {
  document.getElementById("username-text-input").value = "";
  document.getElementById("password-input").value = "";
}

function updateDisplayLogin() {
  navItems = document.getElementById("navbar-items");
  navSignout = '<a href="/SignOut" id="nav-sign-out">Sign Out</a>'
  navItems.removeChild(navRegister);
  navItems.removeChild(navSignin);
  navMovies.insertAdjacentHTML('afterend', navSignout);
  if (currentUser.favList) {
    //function for displaying fav status
  }
}

function popupToggle() {
  document.getElementById("PopUp").classList.toggle("active");
}

function popupSetSignin() {
  document.getElementById("popup-type").innerText = "Sign in";
  document.getElementById("popup-toggle-prompt").innerText = "Don't have an account?";
  popupToggleButton.innerText = "Create one!";
}

function popupSetRegister() {
  document.getElementById("popup-type").innerText = "Register";
  document.getElementById("popup-toggle-prompt").innerText = "Already have an account?";
  popupToggleButton.innerText = "Sign in!";
}

function popupTypeToggle() {
  if (popupToggleButton.innerText === "Create one!") {
    popupSetRegister();
  } else {
    popupSetSignin()
  }
}
