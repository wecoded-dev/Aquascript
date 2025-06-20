// JavaScript code for the Books V2 application
// This code fetches book data, displays it in a grid format, and implements pagination and search functionality.
let books = [];
let currentPage = 1;
const booksPerPage = 8;

fetch('./api/books++.json')
    .then((response) => response.json())
    .then((data) => {
        books = data;
        displayBooks(books);
        setupPagination(books);
    })
    .catch((error) => console.error('Error fetching books:', error));

// Function to format date
function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Function to display books
function displayBooks(booksToDisplay) {
    const container = document.getElementById('booksContainer');
    container.innerHTML = '';

    booksToDisplay.forEach(book => {
        const bookCard = `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                    <div class="book-card">
                        <img src="${book.thumbnailUrl}" alt="${book.title}" class="book-image" onerror="this.onerror=null; this.src='https://clipart-library.com/img/1997880.gif';" />

                        <div class="book-body">
                            <h3 class="book-title">${book.title}</h3>
                            <p class="book-author">${book.authors.join(', ')}</p>
                            
                            <div class="book-meta">
                                <span class="book-pages">${book.pageCount || 'N/A'} pages</span>
                                <span class="book-date">${formatDate(book.publishedDate?.$date)}</span>
                            </div>
                            
                            <p class="book-description">${book.shortDescription || 'No description available.'}</p>
                            
                            ${book.categories ? `
                            <div class="book-categories">
                                ${book.categories.map(cat => `<span class="book-category">${cat}</span>`).join('')}
                            </div>
                            ` : ''}
                            
                            <div class="book-footer">
                                <span class="book-isbn">ISBN: ${book.isbn}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        container.innerHTML += bookCard;
    });
}

// Function to show spinner
function showSpinner() {
    const container = document.getElementById('booksContainer');
    container.innerHTML = '<div class="text-center my-5"><div class="spinner-border text-light" role="status"><span class="visually-hidden">Loading...</span></div></div>';
}

// Function to handle pagination
function paginateBooks(page) {
    showSpinner();
    setTimeout(() => {
        const startIndex = (page - 1) * booksPerPage;
        const endIndex = startIndex + booksPerPage;
        const booksToDisplay = books.slice(startIndex, endIndex);
        displayBooks(booksToDisplay);
        updatePagination(page);
    }, 2500);
}

// Function to update pagination
function updatePagination(page) {
    const totalPages = Math.ceil(books.length / booksPerPage);
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    const prevDisabled = page === 1 ? 'disabled' : '';
    paginationContainer.innerHTML += `
        <li class="page-item ${prevDisabled}">
            <a class="page-link" href="#" data-page="${page - 1}" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    // Always show first page
    const activeClassFirst = page === 1 ? 'active' : '';
    paginationContainer.innerHTML += `
        <li class="page-item ${activeClassFirst}">
            <a class="page-link" href="#" data-page="1">1</a>
        </li>
    `;

    // Show dynamic range around current page
    const startPage = Math.max(2, page - 1);
    const endPage = Math.min(totalPages - 1, page + 1);

    if (startPage > 2) {
        paginationContainer.innerHTML += `
            <li class="page-item disabled">
                <a class="page-link" href="#">...</a>
            </li>
        `;
    }

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = page === i ? 'active' : '';
        paginationContainer.innerHTML += `
            <li class="page-item ${activeClass}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    if (endPage < totalPages - 1) {
        paginationContainer.innerHTML += `
            <li class="page-item disabled">
                <a class="page-link" href="#">...</a>
            </li>
        `;
    }

    // Always show last page if different from first
    if (totalPages > 1) {
        const activeClassLast = page === totalPages ? 'active' : '';
        paginationContainer.innerHTML += `
            <li class="page-item ${activeClassLast}">
                <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
            </li>
        `;
    }

    const nextDisabled = page === totalPages ? 'disabled' : '';
    paginationContainer.innerHTML += `
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="#" data-page="${page + 1}" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
}

// Event listener for pagination
document.querySelector('.pagination').addEventListener('click', function (e) {
    e.preventDefault();
    const page = parseInt(e.target.getAttribute('data-page'));
    if (!isNaN(page)) {
        currentPage = page;
        paginateBooks(currentPage);
    }
});

// Initial display
paginateBooks(currentPage);

// Search functionality
$('.search-input').on('input', function () {
    const searchTerm = $(this).val().toLowerCase();
    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        (book.authors && book.authors.some(author => author.toLowerCase().includes(searchTerm))) ||
        (book.categories && book.categories.some(cat => cat.toLowerCase().includes(searchTerm))) ||
        book.isbn.toLowerCase().includes(searchTerm)
    );
    displayBooks(filteredBooks);
});

// Filter functionality
$('.filter-btn').click(function () {
    $('.filter-btn').removeClass('active');
    $(this).addClass('active');

    const filter = $(this).text();
    let filteredBooks = [];

    if (filter === 'All') {
        filteredBooks = books;
    } else {
        filteredBooks = books.filter(book =>
            book.categories && book.categories.some(cat =>
                cat.toLowerCase().includes(filter.toLowerCase())
            )
        );
    }

    displayBooks(filteredBooks);
});

$(document).ready(function () {
    $('.nav-link').hover(function () {
        $(this).css('text-shadow', '0 0 15px #ff6ec4');
    }, function () {
        $(this).css('text-shadow', 'none');
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
