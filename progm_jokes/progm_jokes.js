// progm_jokes.js
// Configuration
const JOKES_PER_PAGE = 8;
let currentPage = 1;
let filteredJokes = [];
let jokesData = [];

// Fetch jokes data from programming-jokes.json
async function fetchJokesData() {
    try {
        const response = await fetch('./api/programming-jokes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching jokes data:', error);
        showError('Failed to load jokes. Please try again later.');
        return [];
    }
}

// Show error message
function showError(message) {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.innerHTML = `
    <div class="alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>
      ${message}
    </div>
  `;
    errorContainer.style.display = 'block';
    document.getElementById('loadingSpinner').style.display = 'none';
}

// Display jokes
function displayJokes(jokesToDisplay, page = 1) {
    const container = document.getElementById('jokesContainer');
    const startIdx = (page - 1) * JOKES_PER_PAGE;
    const paginatedJokes = jokesToDisplay.slice(startIdx, startIdx + JOKES_PER_PAGE);

    container.innerHTML = '';

    if (paginatedJokes.length === 0) {
        container.innerHTML = `
      <div class="col-12 text-center py-5">
        <h4 class="text-muted">No jokes found matching your search</h4>
      </div>
    `;
        return;
    }

    paginatedJokes.forEach(joke => {
        const jokeCard = `
      <div class="joke-card">
        <div class="joke-setup">${joke.setup}</div>
        <div class="joke-punchline">${joke.punchline}</div>
        <div class="joke-actions">
          <button class="joke-btn copy-btn" data-joke="${joke.setup} ${joke.punchline}">
            <i class="far fa-copy"></i> Copy
          </button>
        </div>
      </div>
    `;
        container.innerHTML += jokeCard;
    });

    container.style.display = 'block';
}

// Update pagination
function updatePagination(totalJokes, currentPage) {
    const totalPages = Math.ceil(totalJokes / JOKES_PER_PAGE);
    const paginationContainer = document.getElementById('paginationContainer');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');

    // Clear existing page numbers
    const existingPageItems = document.querySelectorAll('.page-item:not(#prevPage):not(#nextPage)');
    existingPageItems.forEach(item => item.remove());

    // Add page numbers
    const pageList = paginationContainer.querySelector('ul');
    const fragment = document.createDocumentFragment();

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        fragment.appendChild(pageItem);
    }

    // Insert before next button
    pageList.insertBefore(fragment, nextPageBtn);

    // Update prev/next buttons
    prevPageBtn.className = currentPage === 1 ? 'page-item disabled' : 'page-item';
    nextPageBtn.className = currentPage === totalPages ? 'page-item disabled' : 'page-item';

    // Show pagination if needed
    paginationContainer.style.display = totalPages > 1 ? 'block' : 'none';
}

// Copy joke to clipboard
function copyJokeToClipboard(joke) {
    navigator.clipboard.writeText(joke).then(() => {
        // Show copied notification
        const notification = document.createElement('div');
        notification.className = 'alert alert-success position-fixed bottom-0 end-0 m-3';
        notification.style.zIndex = '9999';
        notification.innerHTML = '<i class="fas fa-check-circle me-2"></i> Joke copied to clipboard!';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    });
}

// Initial setup
async function init() {
    // Show loading spinner and hide content
    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('jokesContainer').style.display = 'none';
    document.getElementById('paginationContainer').style.display = 'none';
    document.getElementById('errorContainer').style.display = 'none';

    try {
        // Simulate loading for better UX (optional)
        const spinnerPromise = new Promise(resolve => setTimeout(resolve, 3500));
        const dataPromise = fetchJokesData();

        // Wait for both the minimum loading time and data fetch
        const [_, jokes] = await Promise.all([spinnerPromise, dataPromise]);

        if (jokes.length === 0) {
            showError('No jokes available. Please check the data source.');
            return;
        }

        jokesData = jokes;
        filteredJokes = [...jokesData];

        // Update UI
        displayJokes(filteredJokes, currentPage);
        updatePagination(filteredJokes.length, currentPage);

    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize jokes. Please try again later.');
    } finally {
        // Hide loading spinner
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('jokesContainer').style.display = 'block';
    }
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

// Document ready handler
$(document).ready(function () {
    init();

    // Search functionality
    $('.search-input').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        filteredJokes = jokesData.filter(joke =>
            joke.setup.toLowerCase().includes(searchTerm) ||
            joke.punchline.toLowerCase().includes(searchTerm)
        );

        currentPage = 1;
        displayJokes(filteredJokes, currentPage);
        updatePagination(filteredJokes.length, currentPage);
    });

    // Pagination click handler
    $(document).on('click', '.page-link', function (e) {
        e.preventDefault();
        const text = $(this).text().trim();

        if (text === 'Previous' && currentPage > 1) {
            currentPage--;
        } else if (text === 'Next' && currentPage < Math.ceil(filteredJokes.length / JOKES_PER_PAGE)) {
            currentPage++;
        } else if (!isNaN(text)) {
            currentPage = parseInt(text);
        }

        displayJokes(filteredJokes, currentPage);
        updatePagination(filteredJokes.length, currentPage);

        // Smooth scroll to top of jokes section
        $('html, body').animate({
            scrollTop: $(".jokes-container").offset().top - 100
        }, 300);
    });

    // Copy button click handler
    $(document).on('click', '.copy-btn', function () {
        const joke = $(this).data('joke');
        copyJokeToClipboard(joke);
    });

    
});