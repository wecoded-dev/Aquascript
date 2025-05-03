// Configuration
const SONGS_PER_PAGE = 8;
let currentPage = 1;
let filteredSongs = [];
let songsData = [];
let allDecades = new Set();

// Fetch songs data from songs.json
async function fetchSongsData() {
  try {
    const response = await fetch("./api/songs.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Extract the songs array from the nested structure
    return data.table.songs.song;
  } catch (error) {
    console.error("Error fetching songs data:", error);
    showError("Failed to load songs. Please try again later.");
    return [];
  }
}

// Show error message
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

// Format duration (assuming duration is in seconds)
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return "N/A";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Extract decade from date
function getDecade(dateString) {
  if (!dateString) return "";
  const year = parseInt(dateString.split(" ").pop());
  if (isNaN(year)) return "";
  return `${Math.floor(year / 10) * 10}s`;
}

// Display songs
function displaySongs(songsToDisplay, page = 1) {
  const container = document.getElementById("songsContainer");
  const startIdx = (page - 1) * SONGS_PER_PAGE;
  const paginatedSongs = songsToDisplay.slice(
    startIdx,
    startIdx + SONGS_PER_PAGE
  );

  container.innerHTML = "";

  if (paginatedSongs.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <h4 class="text-white">No songs found matching your search</h4>
      </div>
    `;
    return;
  }

  paginatedSongs.forEach((song) => {
    const decade = getDecade(song.date);
    const songCard = `
      <div class="song-card">
        <h2 class="song-title">${song.title || "Unknown Title"}</h2>
        <p class="song-artist">${song.artist || "Unknown Artist"}</p>
        
        <div class="song-meta">
          <div class="meta-item">
            <i class="fas fa-calendar-alt"></i>
            <span>${song.date || "Unknown Date"}</span>
          </div>
          <div class="meta-item">
            <i class="fas fa-clock"></i>
            <span>Duration: ${formatDuration(parseInt(song.duration))}</span>
          </div>
          ${
            decade
              ? `
            <div class="meta-item">
              <i class="fas fa-music"></i>
              <span>${decade}</span>
            </div>
          `
              : ""
          }
        </div>
        
        <div class="song-actions">
          <button class="song-btn save-btn" onclick="toggleSave(this)">
            <i class="far fa-heart"></i> Favorite
          </button>
        </div>
      </div>
    `;
    container.innerHTML += songCard;
  });

  container.style.display = "block";
}

// Toggle save/favorite state
function toggleSave(button) {
  const songCard = button.closest(".song-card");
  const songTitle = songCard.querySelector(".song-title").textContent;

  button.classList.toggle("saved");
  const isSaved = button.classList.contains("saved");

  if (isSaved) {
    button.innerHTML = '<i class="fas fa-heart"></i> Favorited';
  } else {
    button.innerHTML = '<i class="far fa-heart"></i> Favorite';
  }

  // Show notification
  const notification = document.createElement("div");
  notification.className =
    "alert alert-success position-fixed bottom-0 start-50 translate-middle-x mb-3";
  notification.style.zIndex = "9999";
  notification.innerHTML = `<i class="fas fa-check-circle me-2"></i> "${songTitle}" ${
    isSaved ? "added to favorites" : "removed from favorites"
  }!`;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("fade");
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Update pagination
function updatePagination(totalSongs, currentPage) {
  const totalPages = Math.ceil(totalSongs / SONGS_PER_PAGE);
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

// Initial setup
async function init() {
  // Show loading spinner and hide content
  document.getElementById("loadingSpinner").style.display = "flex";
  document.getElementById("songsContainer").style.display = "none";
  document.getElementById("paginationContainer").style.display = "none";
  document.getElementById("errorContainer").style.display = "none";

  try {
    // Simulate loading for better UX (optional)
    const spinnerPromise = new Promise((resolve) => setTimeout(resolve, 1500));
    const dataPromise = fetchSongsData();

    // Wait for both the minimum loading time and data fetch
    const [_, songs] = await Promise.all([spinnerPromise, dataPromise]);

    if (songs.length === 0) {
      showError("No songs available. Please check the data source.");
      return;
    }

    songsData = songs;
    filteredSongs = [...songsData];

    // Collect all decades
    songs.forEach((song) => {
      const decade = getDecade(song.date);
      if (decade) {
        allDecades.add(decade);
      }
    });

    // Update UI
    displaySongs(filteredSongs, currentPage);
    updatePagination(filteredSongs.length, currentPage);
  } catch (error) {
    console.error("Initialization error:", error);
    showError("Failed to initialize songs. Please try again later.");
  } finally {
    // Hide loading spinner
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("songsContainer").style.display = "block";
  }
}

// Document ready handler
$(document).ready(function () {
  init();

  // Search functionality
  $(".search-input").on("input", function () {
    const searchTerm = $(this).val().toLowerCase();
    filteredSongs = songsData.filter(
      (song) =>
        (song.title && song.title.toLowerCase().includes(searchTerm)) ||
        (song.artist && song.artist.toLowerCase().includes(searchTerm))
    );

    currentPage = 1;
    displaySongs(filteredSongs, currentPage);
    updatePagination(filteredSongs.length, currentPage);
  });

  // Decade filter functionality
  $(document).on("click", ".filter-tag", function () {
    const tag = $(this).data("tag");
    $(".filter-tag").removeClass("active");
    $(this).addClass("active");

    if (tag === "all") {
      filteredSongs = [...songsData];
    } else {
      filteredSongs = songsData.filter((song) => {
        const decade = getDecade(song.date);
        return decade === tag;
      });
    }

    currentPage = 1;
    displaySongs(filteredSongs, currentPage);
    updatePagination(filteredSongs.length, currentPage);
  });

  // Pagination click handler
  $(document).on("click", ".page-link", function (e) {
    e.preventDefault();
    const text = $(this).text().trim();

    if (text === "Previous" && currentPage > 1) {
      currentPage--;
    } else if (
      text === "Next" &&
      currentPage < Math.ceil(filteredSongs.length / SONGS_PER_PAGE)
    ) {
      currentPage++;
    } else if (!isNaN(text)) {
      currentPage = parseInt(text);
    }

    displaySongs(filteredSongs, currentPage);
    updatePagination(filteredSongs.length, currentPage);

    // Smooth scroll to top of songs section
    $("html, body").animate(
      {
        scrollTop: $(".songs-container").offset().top - 100,
      },
      300
    );
  });

  // Play button click handler (simulated)
  $(document).on("click", ".play-btn", function () {
    const songCard = $(this).closest(".song-card");
    const songTitle = songCard.find(".song-title").text();
    const songArtist = songCard.find(".song-artist").text();

    const notification = document.createElement("div");
    notification.className =
      "alert alert-info position-fixed bottom-0 start-50 translate-middle-x mb-3";
    notification.style.zIndex = "9999";
    notification.innerHTML = `<i class="fas fa-music me-2"></i> Now playing: "${songTitle}" by ${songArtist}`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("fade");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  });
});
