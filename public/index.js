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

var favButton = document.getElementsByClassName("fav-button");
var movieURL = document.getElementsByClassName("movie-URL");

var movieData = [];

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

/*
 * The following section is where functions should be declared
 */

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

function titleMatchesQuery(title, search) {
  /*
   * An empty query matches all twits.
   */
  if (!search) {
    return true;
  }

  /*
   * The search query matches the twit if either the twit's text or the twit's
   * author contains the search query.
   */
  search = search.trim().toLowerCase();
  return (title).toLowerCase().indexOf(search) >= 0;
}

function updateSearch() {
  console.log('Entered updateSearch()');
  /*
   * Grab the search query from the navbar search box.
   */
  var search = document.getElementById('nav-search-input').value;
  console.log('Search: ', search);
  /*
   * Remove all twits from the DOM temporarily.
   */
  var movieHolder = document.querySelector('movie-container');
  if (movieHolder) {

    while (movieHolder.lastChild) {
      movieHolder.removeChild(movieHolder.lastChild);
    }
  }

  /*
   * Loop through the collection of all twits and add twits back into the DOM
   * if they match the current search query.
   */
  movieData.forEach(function (movie) {
    console.log('comparing movie.title and search term,');
    console.log('movie.title: ', movie.title);
    console.log('search term: ', search);
    if (titleMatchesQuery(movie.title, search)) {
      createMovieCard(movie.photo, movie.title, movie.desc);
    }
  });
}

function parser(movie) {
  var movieObj = {}
  console.log('movie in parser: ', movie)

  var moviePhoto = movie.querySelector('movie-photo');
  console.log(moviePhoto)
  movieObj.photo = moviePhoto.textContent();

  var movieDesc = movie.querySelector('movie-desc');
  movieObj.desc = movieDesc.textContent.trim();

  var movieTitle = movie.querySelector('movie-title');
  movieObj.title = movieTitle.textContent.trim();

  var favorite = movie.querySelector('fas');
  if (favorite){
    movieObj.favorite = 'true';
  }

  return movieObj;
}
/*
 * Wait until the DOM content is loaded, and then hook up UI interactions, etc.
 */
window.addEventListener('DOMContentLoaded', function () {
  console.log("DOM Content is loaded");
  var moviesOnScreen = document.getElementsByClassName('movie-listing');
  for (var i = 0; i < moviesOnScreen.length; i++) {
    movieData.push(parser(moviesOnScreen[i]));
  }
  console.log('movieData: ', movieData);
  var searchButton = document.getElementById('nav-search-button');
  if (searchButton) {
    console.log("Search button successfully located")
    searchButton.addEventListener('click', updateSearch);
  }

  var searchInput = document.getElementById('nav-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', updateSearch);
  }
});
