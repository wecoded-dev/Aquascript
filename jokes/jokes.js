// Configuration
const JOKES_PER_PAGE = 8;
let currentPage = 1;
let filteredJokes = [];
let jokesData = [];

// Function to fetch jokes data
async function fetchJokesData() {
  try {
    // Show loading spinner
    document.getElementById("loadingSpinner").style.display = "flex";
    document.getElementById("jokesContainer").style.display = "none";

    // Add artificial delay to show spinner (remove in production)
    await new Promise((resolve) => setTimeout(resolve, 3500));

    const response = await fetch("/api/jokes.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching jokes data:", error);
    showError("Failed to load jokes. Please try again later.");
    return [];
  }
}

// Function to show error message
function showError(message) {
  const errorContainer = document.getElementById("errorContainer");
  errorContainer.innerHTML = message;
  errorContainer.style.display = "block";
  document.getElementById("loadingSpinner").style.display = "none";
}

// Function to display jokes
function displayJokes(jokesToDisplay, page = 1) {
  const container = document.getElementById("jokesContainer");
  const startIdx = (page - 1) * JOKES_PER_PAGE;
  const paginatedJokes = jokesToDisplay.slice(
    startIdx,
    startIdx + JOKES_PER_PAGE
  );

  container.innerHTML = "";

  if (paginatedJokes.length === 0) {
    container.innerHTML = `
  <div class="no-jokes text-center justify-content-center py-5">
    <h4>No jokes found matching your criteria 😢</h4>
  </div>
`;
    return;
  }

  paginatedJokes.forEach((joke) => {
    const jokeCard = `
  <div class="joke-card">
    <div class="joke-setup">${joke.part1}</div>
    <div class="joke-punchline">${joke.part2}</div>
    <div class="joke-meta">
      <span class="joke-author">by ${joke.author}</span>
      <span class="joke-score"><i class="fas fa-star"></i> ${joke.score}</span>
    </div>
    <div class="joke-actions">
      <a href="${joke.link}" target="_blank" class="joke-btn">
        <i class="fas fa-external-link-alt"></i> Source
      </a>
      <button class="joke-btn copy-btn" data-joke="${joke.part1} ${joke.part2}">
        <i class="far fa-copy"></i> Copy
      </button>
    </div>
  </div>
`;
    container.innerHTML += jokeCard;
  });

  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fill, minmax(400px, 1fr))";
  container.style.gap = "20px";
}

// Function to update pagination
function updatePagination(totalJokes, currentPage) {
  const totalPages = Math.ceil(totalJokes / JOKES_PER_PAGE);
  const paginationContainer = document.getElementById("paginationContainer");
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");

  // Clear existing page numbers
  const existingPageItems = document.querySelectorAll(
    ".page-item:not(#prevPage):not(#nextPage)"
  );
  existingPageItems.forEach((item) => item.remove());

  // Add page numbers
  const pageList = paginationContainer.querySelector("ul");
  const fragment = document.createDocumentFragment();

  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    fragment.appendChild(pageItem);
  }

  // Insert before next button
  pageList.insertBefore(fragment, nextPageBtn);

  // Update prev/next buttons
  prevPageBtn.className =
    currentPage === 1 ? "page-item disabled" : "page-item";
  nextPageBtn.className =
    currentPage === totalPages ? "page-item disabled" : "page-item";

  // Show pagination if needed
  paginationContainer.style.display = totalPages > 1 ? "block" : "none";
}

// Function to copy joke to clipboard
function copyJokeToClipboard(jokeText) {
  navigator.clipboard.writeText(jokeText).then(() => {
    // Show notification
    const notification = document.createElement("div");
    notification.className =
      "alert alert-success position-fixed bottom-0 end-0 m-3";
    notification.innerHTML =
      '<i class="fas fa-check-circle me-2"></i> Joke copied!';
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("fade");
      setTimeout(() => notification.remove(), 500);
    }, 2000);
  });
}

// Initial setup
async function init() {
  try {
    jokesData = await fetchJokesData();

    if (jokesData.length === 0) {
      showError("No jokes available. Please check the data source.");
      return;
    }

    filteredJokes = [...jokesData];

    // Initialize UI
    displayJokes(filteredJokes, currentPage);
    updatePagination(filteredJokes.length, currentPage);

    // Hide spinner and show content
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("jokesContainer").style.display = "grid";
    document.getElementById("paginationContainer").style.display = "block";
  } catch (error) {
    console.error("Initialization error:", error);
    showError("Failed to initialize jokes. Please try again later.");
  }
}

// Event listeners
$(document).ready(function () {
  init();

  // Filter buttons
  $(document).on("click", ".filter-btn", function () {
    $(".filter-btn").removeClass("active");
    $(this).addClass("active");

    const filter = $(this).text();
    if (filter === "All Jokes") {
      filteredJokes = [...jokesData];
    } else if (filter === "Family Friendly") {
      filteredJokes = jokesData.filter((joke) => !joke.mature);
    } else if (filter === "Mature") {
      filteredJokes = jokesData.filter((joke) => joke.mature);
    } else if (filter === "Top Rated") {
      filteredJokes = [...jokesData].sort((a, b) => b.score - a.score);
    }

    currentPage = 1;
    displayJokes(filteredJokes, currentPage);
    updatePagination(filteredJokes.length, currentPage);
  });

  // Pagination click handler
  $(document).on("click", ".page-link", function (e) {
    e.preventDefault();
    const text = $(this).text().trim();

    if (text === "Previous" && currentPage > 1) {
      currentPage--;
    } else if (
      text === "Next" &&
      currentPage < Math.ceil(filteredJokes.length / JOKES_PER_PAGE)
    ) {
      currentPage++;
    } else if (!isNaN(text)) {
      currentPage = parseInt(text);
    }

    displayJokes(filteredJokes, currentPage);
    updatePagination(filteredJokes.length, currentPage);

    $("html, body").animate(
      {
        scrollTop: $(".jokes-container").offset().top - 100,
      },
      300
    );
  });

  // Copy button click handler
  $(document).on("click", ".copy-btn", function () {
    const jokeText = $(this).data("joke");
    copyJokeToClipboard(jokeText);
  });
});

// Copy API URL
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

// Add toast style
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