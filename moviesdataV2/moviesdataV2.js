// Configuration
const MOVIES_PER_PAGE = 8;
let currentPage = 1;
let filteredMovies = [];
let allLanguages = [];
let moviesData = [];

// Function to fetch movie data from moviesdata.json
async function fetchMovieData() {
    try {
        const response = await fetch("./api/moviesdata++.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return processRawData(data);
    } catch (error) {
        console.error("Error fetching movie data:", error);
        showError("Failed to load movie data. Please try again later.");
        return [];
    }
}


function processRawData(rawData) {
    return rawData.map((item) => {
        const key = Object.keys(item)[0];
        const movie = item[key];


        const yearMatch = movie.name.match(/(19|20)\d{2}/);
        const year = yearMatch ? yearMatch[0] : "";


        const qualityMatch = movie.name.match(
            /(720p|480p|1080p|WEBRip|HDRip|BluRay)/i
        );
        const sizeMatch = movie.name.match(/(\d+MB|\d+GB)/i);

        const details = parseDetails(movie.details);

        return {
            id: key,
            fullName: movie.name,
            title: movie.name.split(" ")[0],
            year: year,
            language:
                movie.tags
                    .find((tag) => tag.includes("Movies"))
                    ?.replace(" Movies", "") || "Unknown",
            tags: movie.tags,
            image: movie.image,
            links: movie.links,
            metadata: {
                imdbRating: details.imdbRating,
                director: details.director,
                releaseDate: details.releaseDate,
                country: details.country,
                genres: details.genres,
                cast: details.cast,
                quality: qualityMatch ? qualityMatch[0] : details.quality,
                size: sizeMatch ? sizeMatch[0] : details.size,
            },
        };
    });
}


function parseDetails(detailsString) {
    if (!detailsString) return {};

    const lines = detailsString.split("\n");
    const details = {};

    lines.forEach((line) => {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length > 0) {
            const value = valueParts.join(":").trim();
            switch (key.trim()) {
                case "IMDB Ratings":
                    details.imdbRating = value;
                    break;
                case "Directed":
                    details.director = value;
                    break;
                case "Released Date":
                    details.releaseDate = value;
                    break;
                case "Genres":
                    details.genres = value.split(",").map((g) => g.trim());
                    break;
                case "Languages":
                    details.languages = value.split(",").map((l) => l.trim());
                    break;
                case "Film Stars":
                    details.cast = value.split(",").map((s) => s.trim());
                    break;
                case "Movie Quality":
                    details.quality = value;
                    break;
                case "File Size":
                    details.size = value;
                    break;
            }
        }
    });

    return details;
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


function getAllLanguages(movies) {
    const languages = new Set();
    movies.forEach((movie) => {
        languages.add(movie.language);
    });
    return Array.from(languages).sort();
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
              <img src="${movie.image}" alt="${movie.fullName
            }" class="movie-poster" onerror="this.src='https://b.rgbimg.com/users/h/hi/hisks/600/mhYExIC.jpg'">
              <div class="movie-body">
                <h3 class="movie-title">${movie.fullName}</h3>
                <p class="movie-director">${movie.metadata.director || "Director not specified"
            }</p>
                
                <div class="movie-meta">
                  <span class="movie-quality">${movie.metadata.quality || "Quality not specified"
            }</span>
                  <span class="movie-size">${movie.metadata.size || "Size not specified"
            }</span>
                </div>
                
                <p class="movie-details">
                  ${movie.metadata.genres
                ? `<strong>Genres:</strong> ${movie.metadata.genres.join(
                    ", "
                )}<br>`
                : ""
            }
                  ${movie.metadata.cast
                ? `<strong>Cast:</strong> ${movie.metadata.cast
                    .slice(0, 3)
                    .join(", ")}${movie.metadata.cast.length > 3 ? "..." : ""
                }`
                : ""
            }
                </p>
                
                <div class="movie-tags">
                  ${movie.tags
                .map((tag) => `<span class="movie-tag">${tag}</span>`)
                .join("")}
                </div>
                
                <div class="movie-footer">
                  <span class="movie-language">${movie.language}</span>
                  <span class="movie-year">${movie.year || "Year N/A"}</span>
                  <button class="btn-details download-btn" data-movie-id="${movie.id
            }">Download</button>
                </div>
              </div>
            </div>
          </div>
        `;
        container.innerHTML += movieCard;
    });
}


function showDownloadLinks(movieId) {
    const movie = moviesData.find((m) => m.id === movieId);
    if (!movie || !movie.links) return;

    const modalTitle = document.getElementById("downloadModalTitle");
    const linksContainer = document.getElementById(
        "downloadLinksContainer"
    );

    modalTitle.textContent = `Download: ${movie.fullName}`;
    linksContainer.innerHTML = "";

    movie.links.forEach((link, index) => {
        const hostname = new URL(link).hostname.replace("www.", "");
        const linkElement = document.createElement("a");
        linkElement.href = link;
        linkElement.className = "download-link";
        linkElement.target = "_blank";
        linkElement.innerHTML = `
          <i class="fas fa-download"></i>
          Download Link ${index + 1} (${hostname})
        `;
        linksContainer.appendChild(linkElement);
    });

   
    const modal = new bootstrap.Modal(
        document.getElementById("downloadModal")
    );
    modal.show();
}

// Function to update pagination
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

   
    paginationContainer.style.display = "none";
}


function initLanguageFilters(languages) {
    const filtersContainer = document.getElementById("languageFilters");
    filtersContainer.innerHTML = ""; 
    languages.forEach((language) => {
        const filterBtn = document.createElement("button");
        filterBtn.className = "filter-btn";
        filterBtn.textContent = language;
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

        if (moviesData.length === 0) {
            showError("No movie data available. Please check the data source.");
            return;
        }

        allLanguages = getAllLanguages(moviesData);
        filteredMovies = [...moviesData];

        initLanguageFilters(allLanguages);

        
        setTimeout(() => {
            displayMovies(filteredMovies, currentPage);
            updatePagination(filteredMovies.length, currentPage);

            document.getElementById("loadingSpinner").style.display = "none";
            document.getElementById("moviesContainer").style.display = "flex";

           
            const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);
            if (totalPages > 1) {
                document.getElementById("paginationContainer").style.display = "flex";
            }
        }, 4000);
    } catch (error) {
        console.error("Initialization error:", error);
        showError("Failed to initialize movie data. Please try again later.");
    }
}



$(document).ready(function () {
    init();

    
    $(".search-input").on("input", function () {
        const searchTerm = $(this).val().toLowerCase();
        filteredMovies = moviesData.filter(
            (movie) =>
                movie.fullName.toLowerCase().includes(searchTerm) ||
                (movie.language &&
                    movie.language.toLowerCase().includes(searchTerm)) ||
                (movie.metadata.quality &&
                    movie.metadata.quality.toLowerCase().includes(searchTerm)) ||
                (movie.tags &&
                    movie.tags.some((tag) =>
                        tag.toLowerCase().includes(searchTerm)
                    ))
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
            filteredMovies = [...moviesData];
        } else {
            filteredMovies = moviesData.filter(
                (movie) => movie.language === filter
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


    $(document).on("click", ".download-btn", function () {
        const movieId = $(this).data("movie-id");
        showDownloadLinks(movieId);
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