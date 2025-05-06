// Configuration
const QUOTES_PER_PAGE = 10;
let currentPage = 1;
let filteredQuotes = [];
let quotesData = [];

// fetch quotes data from quotes.json
async function fetchQuotesData() {
    try {
        const response = await fetch('./api/quotes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching quotes data:', error);
        showError('Failed to load quotes. Please try again later.');
        return [];
    }
}

// show error message
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

// Function to display quotes
function displayQuotes(quotesToDisplay, page = 1) {
    const container = document.getElementById('quotesContainer');
    const startIdx = (page - 1) * QUOTES_PER_PAGE;
    const paginatedQuotes = quotesToDisplay.slice(startIdx, startIdx + QUOTES_PER_PAGE);

    container.innerHTML = '';

    if (paginatedQuotes.length === 0) {
        container.innerHTML = `
      <div class="col-12 text-center py-5">
        <h4 class="text-muted">No quotes found matching your search</h4>
      </div>
    `;
        return;
    }

    paginatedQuotes.forEach(quote => {
        const quoteCard = `
      <div class="quote-card">
        <div class="quote-text">${quote.quoteText}</div>
        <div class="quote-author">${quote.quoteAuthor || 'Unknown'}</div>
        <div class="quote-actions">
          <button class="quote-btn copy-btn" data-quote="${quote.quoteText}" data-author="${quote.quoteAuthor}">
            <i class="far fa-copy"></i> Copy
          </button>
        </div>
      </div>
    `;
        container.innerHTML += quoteCard;
    });

    container.style.display = 'block';
}

// Function to update pagination
function updatePagination(totalQuotes, currentPage) {
    const totalPages = Math.ceil(totalQuotes / QUOTES_PER_PAGE);
    const paginationContainer = document.getElementById('paginationContainer');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');


    const existingPageItems = document.querySelectorAll('.page-item:not(#prevPage):not(#nextPage)');
    existingPageItems.forEach(item => item.remove());


    const pageList = paginationContainer.querySelector('ul');
    const fragment = document.createDocumentFragment();

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        fragment.appendChild(pageItem);
    }


    pageList.insertBefore(fragment, nextPageBtn);


    prevPageBtn.className = currentPage === 1 ? 'page-item disabled' : 'page-item';
    nextPageBtn.className = currentPage === totalPages ? 'page-item disabled' : 'page-item';


    paginationContainer.style.display = totalPages > 1 ? 'block' : 'none';
}

// Function to copy quote to clipboard
function copyQuoteToClipboard(quote, author) {
    const text = `"${quote}" — ${author || 'Unknown'}`;
    navigator.clipboard.writeText(text).then(() => {

        const notification = document.createElement('div');
        notification.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
        notification.style.zIndex = '9999';
        notification.innerHTML = '<i class="fas fa-check-circle me-2"></i> Quote copied to clipboard!';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    });
}

async function init() {
    // spinner and hide all content
    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('quotesContainer').style.display = 'none';
    document.getElementById('paginationContainer').style.display = 'none';
    document.getElementById('errorContainer').style.display = 'none';


    await new Promise(requestAnimationFrame);

    try {
        // Fetch data
        quotesData = await fetchQuotesData();

        if (quotesData.length === 0) {
            showError('No quotes available. Please check the data source.');
            return;
        }

        filteredQuotes = [...quotesData];


        await new Promise(resolve => setTimeout(resolve, 3000));

        // Update UI
        displayQuotes(filteredQuotes, currentPage);
        updatePagination(filteredQuotes.length, currentPage);

        // Show content then, hide spinner
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('quotesContainer').style.display = 'block';
        document.getElementById('paginationContainer').style.display = 'flex';

    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize quotes. Please try again later.');
    }
}




$(document).ready(function () {
    init();

    // Search functionality
    $('.search-input').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        filteredQuotes = quotesData.filter(quote =>
            quote.quoteText.toLowerCase().includes(searchTerm) ||
            (quote.quoteAuthor && quote.quoteAuthor.toLowerCase().includes(searchTerm))
        );

        currentPage = 1;
        displayQuotes(filteredQuotes, currentPage);
        updatePagination(filteredQuotes.length, currentPage);
    });

    // Pagination click handler
    $(document).on('click', '.page-link', function (e) {
        e.preventDefault();
        const text = $(this).text().trim();

        if (text === 'Previous' && currentPage > 1) {
            currentPage--;
        } else if (text === 'Next' && currentPage < Math.ceil(filteredQuotes.length / QUOTES_PER_PAGE)) {
            currentPage++;
        } else if (!isNaN(text)) {
            currentPage = parseInt(text);
        }

        displayQuotes(filteredQuotes, currentPage);
        updatePagination(filteredQuotes.length, currentPage);


        $('html, body').animate({
            scrollTop: $(".quotes-container").offset().top - 100
        }, 300);
    });

    // Copy button click handler
    $(document).on('click', '.copy-btn', function () {
        const quote = $(this).data('quote');
        const author = $(this).data('author');
        copyQuoteToClipboard(quote, author);
    });
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