// Movie data fetching and display script
// This script fetches movie data from a JSON file and displays it on the webpage.
const MOVIES_PER_PAGE = 8;
let currentPage = 1;
let filteredMovies = [];
let allGenres = [];
let moviesData = { movies: [], genres: [] };

// Function to fetch movie data from moviedata.json
async function fetchMovieData() {
  try {
    const response = await fetch("./api/moviesdata.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie data:", error);
    showError("Failed to load movie data. Please try again later.");
    return { movies: [], genres: [] };
  }
}

// Function to show error message
function showError(message) {
  const errorContainer = document.getElementById("errorContainer");
  errorContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          ${message}
        </div>
      `;
  errorContainer.style.display = "block";
  document.getElementById("loadingSpinner").style.display = "none";
}

function getAllGenres(movies) {
  const genres = new Set();
  movies.forEach((movie) => {
    movie.genres.forEach((genre) => genres.add(genre));
  });
  return Array.from(genres).sort();
}

function formatRuntime(minutes) {
  if (!minutes) return "N/A";
  const mins = parseInt(minutes);
  const hrs = Math.floor(mins / 60);
  const minsRemainder = mins % 60;
  return hrs > 0 ? `${hrs}h ${minsRemainder}m` : `${minsRemainder}m`;
}

function displayMovies(moviesToDisplay, page = 1) {
  const container = document.getElementById("moviesContainer");
  const startIdx = (page - 1) * MOVIES_PER_PAGE;
  const paginatedMovies = moviesToDisplay.slice(
    startIdx,
    startIdx + MOVIES_PER_PAGE
  );

  container.innerHTML = "";

  if (paginatedMovies.length === 0) {
    container.innerHTML = `
          <div class="col-12 text-center py-5">
            <h4 class="text-muted">No movies found matching your criteria</h4>
          </div>
        `;
    return;
  }

  paginatedMovies.forEach((movie) => {
    const movieCard = `
          <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="movie-card">
              <img src="${movie.posterUrl}" alt="${
      movie.title
    }" class="movie-poster" onerror="this.onerror=null; this.src='https://b.rgbimg.com/users/h/hi/hisks/600/mhYExIC.jpg';">
              <div class="movie-body">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-director">${movie.director}</p>
                
                <div class="movie-meta">
                  <span class="movie-year">${movie.year}</span>
                  <span class="movie-runtime">${formatRuntime(
                    movie.runtime
                  )}</span>
                </div>
                
                <p class="movie-plot">${movie.plot || "No plot available."}</p>
                
                <div class="movie-genres">
                  ${movie.genres
                    .map((genre) => `<span class="movie-genre">${genre}</span>`)
                    .join("")}
                </div>
                
                <div class="movie-footer">
                  <span class="movie-actors">${movie.actors
                    .split(",")
                    .slice(0, 2)
                    .join(",")}${
      movie.actors.split(",").length > 2 ? "..." : ""
    }</span>
                  <a class="btn-details">Details</a>
                </div>
              </div>
            </div>
          </div>
        `;
    container.innerHTML += movieCard;
  });
}


function updatePagination(totalMovies, currentPage) {
  const totalPages = Math.ceil(totalMovies / MOVIES_PER_PAGE);
  const paginationContainer = document.getElementById("paginationContainer");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");

  // Clear existing page numbers
  const existingPageItems = document.querySelectorAll(
    ".page-item:not(#prevPage):not(#nextPage)"
  );
  existingPageItems.forEach((item) => item.remove());

  const pageList = paginationContainer.querySelector("ul");
  const fragment = document.createDocumentFragment();

  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    fragment.appendChild(pageItem);
  }

  
  pageList.insertBefore(fragment, nextPageBtn);

  
  prevPageBtn.className =
    currentPage === 1 ? "page-item disabled" : "page-item";
  nextPageBtn.className =
    currentPage === totalPages ? "page-item disabled" : "page-item";

  
  paginationContainer.style.display = totalPages > 1 ? "block" : "none";
}


function initGenreFilters(genres) {
  const filtersContainer = document.getElementById("genreFilters");
  genres.forEach((genre) => {
    const filterBtn = document.createElement("button");
    filterBtn.className = "filter-btn";
    filterBtn.textContent = genre;
    filtersContainer.appendChild(filterBtn);
  });
}

// Initial setup
async function init() {
  document.getElementById("loadingSpinner").style.display = "flex";
  document.getElementById("moviesContainer").style.display = "none";
  document.getElementById("paginationContainer").style.display = "none";
  document.getElementById("errorContainer").style.display = "none";

  try {
    moviesData = await fetchMovieData();

    if (moviesData.movies.length === 0) {
      showError("No movie data available. Please check the data source.");
      return;
    }

    allGenres =
      moviesData.genres && moviesData.genres.length > 0
        ? moviesData.genres
        : getAllGenres(moviesData.movies);

    filteredMovies = [...moviesData.movies];

    initGenreFilters(allGenres);

    setTimeout(() => {
      displayMovies(filteredMovies, currentPage);
      updatePagination(filteredMovies.length, currentPage);

      document.getElementById("loadingSpinner").style.display = "none";
      document.getElementById("moviesContainer").style.display = "flex";
    }, 3000);
  } catch (error) {
    console.error("Initialization error:", error);
    showError("Failed to initialize movie data. Please try again later.");
  }
}

$(document).ready(function () {
  init();

  
  $(".search-input").on("input", function () {
    const searchTerm = $(this).val().toLowerCase();
    filteredMovies = moviesData.movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(searchTerm) ||
        (movie.director && movie.director.toLowerCase().includes(searchTerm)) ||
        (movie.genres &&
          movie.genres.some((genre) =>
            genre.toLowerCase().includes(searchTerm)
          )) ||
        (movie.actors && movie.actors.toLowerCase().includes(searchTerm))
    );

    currentPage = 1;
    displayMovies(filteredMovies, currentPage);
    updatePagination(filteredMovies.length, currentPage);
  });

  
  $(document).on("click", ".filter-btn", function () {
    $(".filter-btn").removeClass("active");
    $(this).addClass("active");

    const filter = $(this).text();
    if (filter === "All") {
      filteredMovies = [...moviesData.movies];
    } else {
      filteredMovies = moviesData.movies.filter(
        (movie) => movie.genres && movie.genres.includes(filter)
      );
    }

    currentPage = 1;
    displayMovies(filteredMovies, currentPage);
    updatePagination(filteredMovies.length, currentPage);
  });

  $(document).on("click", ".page-link", function (e) {
    e.preventDefault();
    const text = $(this).text().trim();

    if (text === "Previous" && currentPage > 1) {
      currentPage--;
    } else if (
      text === "Next" &&
      currentPage < Math.ceil(filteredMovies.length / MOVIES_PER_PAGE)
    ) {
      currentPage++;
    } else if (!isNaN(text)) {
      currentPage = parseInt(text);
    }

    displayMovies(filteredMovies, currentPage);
    updatePagination(filteredMovies.length, currentPage);

    $("html, body").animate(
      {
        scrollTop: $(".movies-container").offset().top - 100,
      },
      300
    );
  });

  $(".nav-link").hover(
    function () {
      $(this).css("text-shadow", "0 0 15px #ff6ec4");
    },
    function () {
      $(this).css("text-shadow", "none");
    }
  );
});

//function for copyApiUrl
function copyApiUrl() {
  const url = document.getElementById("apiUrl").textContent;
  navigator.clipboard.writeText(url);

  const toast = document.createElement("div");
  toast.className = "toast-alert";
  toast.textContent = "API endpoint copied to clipboard!";
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "1";
  }, 100);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 500);
  }, 3000);
}

const style = document.createElement("style");
style.textContent = `
            .toast-alert {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #0061ff;
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                opacity: 0;
                transition: opacity 0.5s ease;
                z-index: 1000;
            }
            `;
document.head.appendChild(style);