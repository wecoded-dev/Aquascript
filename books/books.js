// Books data and pagination variables
let books = [];
let currentPage = 1;
const booksPerPage = 8;

// Fetch books data
fetch("./api/books.json")
  .then((response) => response.json())
  .then((data) => {
    books = data;
    displayBooks(books);
    setupPagination(books);
  })
  .catch((error) => console.error("Error fetching books:", error));


// Function to display books
// This function displays the books in a grid format with pagination
function displayBooks(booksToDisplay, page = 1) {
  const container = document.getElementById("booksContainer");
  container.innerHTML = "";
  
  const startIndex = (page - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const paginatedBooks = booksToDisplay.slice(startIndex, endIndex);

  if (paginatedBooks.length === 0) {
    container.innerHTML = '<div class="col-12 text-center"><p>No books found matching your criteria.</p></div>';
    return;
  }

  paginatedBooks.forEach((book) => {
    const bookCard = `
      <div class="col-md-4 col-lg-3 mb-4">
        <div class="book-card">
          <img src="${book.imageLink}" alt="${book.title}" class="book-image">
          <div class="book-body">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">By ${book.author}</p>
            <div class="book-meta">
              <span>${book.country}</span>
              <span>${book.year > 0 ? book.year : Math.abs(book.year) + " BCE"}</span>
            </div>
            <div class="book-meta">
              <span>${book.pages} pages</span>
              <span>${book.language}</span>
            </div>
            <a href="${book.link.trim()}" target="_blank" class="book-link">Learn More</a>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += bookCard;
  });
  
  currentPage = page;
}


function setupPagination(booksToDisplay) {
  const paginationContainer = document.getElementById("paginationContainer");
  paginationContainer.innerHTML = "";
  
  const pageCount = Math.ceil(booksToDisplay.length / booksPerPage);
  
  if (pageCount <= 1) return;
  
  let paginationHTML = '<ul class="pagination justify-content-center">';


  paginationHTML += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" data-page="prev">Previous</a>
  </li>`;
  

  for (let i = 1; i <= pageCount; i++) {
    paginationHTML += `<li class="page-item ${i === currentPage ? 'active' : ''}">
      <a class="page-link" href="#" data-page="${i}">${i}</a>
    </li>`;
  }
  

  paginationHTML += `<li class="page-item ${currentPage === pageCount ? 'disabled' : ''}">
    <a class="page-link" href="#" data-page="next">Next</a>
  </li>`;
  
  paginationHTML += '</ul>';
  paginationContainer.innerHTML = paginationHTML;
}


function filterBooks(filter) {
  let filteredBooks = [];
  
  if (filter === "All") {
    filteredBooks = books;
  } else if (filter === "19th Century") {
    filteredBooks = books.filter(book => book.year >= 1800 && book.year < 1900);
  } else if (filter === "20th Century") {
    filteredBooks = books.filter(book => book.year >= 1900 && book.year < 2000);
  } else if (filter === "Ancient") {
    filteredBooks = books.filter(book => book.year < 0);
  } else if (filter === "European") {
    filteredBooks = books.filter(book =>
      book.country.includes("Kingdom") ||
      book.country.includes("Denmark") ||
      book.country.includes("Italy") ||
      book.country.includes("France") ||
      book.country.includes("Ireland") ||
      book.country.includes("Iceland")
    );
  } else if (filter === "Asian") {
    filteredBooks = books.filter(book =>
      book.country.includes("India") ||
      book.country.includes("Iran") ||
      book.country.includes("Iraq") ||
      book.country.includes("Tajikistan")
    );
  } else if (filter === "African") {
    filteredBooks = books.filter(book =>
      book.country.includes("Nigeria") || 
      book.country.includes("Egypt")
    );
  }
  
  return filteredBooks;
}

// Pagination click handler
$(document).on('click', '.page-link', function(e) {
  e.preventDefault();
  const pageAction = $(this).data('page');
  const activeFilter = $('.filter-btn.active').text();
  let filteredBooks = filterBooks(activeFilter);
  
  // Reapply search if there's a search term
  const searchTerm = $('.search-input').val().toLowerCase();
  if (searchTerm) {
    filteredBooks = filteredBooks.filter(book =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.country.toLowerCase().includes(searchTerm)
    );
  }
  
  if (pageAction === 'prev' && currentPage > 1) {
    currentPage--;
  } else if (pageAction === 'next' && currentPage < Math.ceil(filteredBooks.length / booksPerPage)) {
    currentPage++;
  } else if (!isNaN(pageAction)) {
    currentPage = parseInt(pageAction);
  }
  
  displayBooks(filteredBooks, currentPage);
  setupPagination(filteredBooks);
  
  
  $('html, body').animate({
    scrollTop: $(".books-list").offset().top - 50
  }, 300);
});

// Search functionality
$(".search-input").on("input", function() {
  const searchTerm = $(this).val().toLowerCase();
  const activeFilter = $(".filter-btn.active").text();
  let filteredBooks = filterBooks(activeFilter);
  
  if (searchTerm) {
    filteredBooks = filteredBooks.filter(book =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.country.toLowerCase().includes(searchTerm)
    );
  }
  
  currentPage = 1;
  displayBooks(filteredBooks);
  setupPagination(filteredBooks);
});

// Filter button functionality
$(".filter-btn").click(function() {
  $(".filter-btn").removeClass("active");
  $(this).addClass("active");

  const filter = $(this).text();
  const searchTerm = $(".search-input").val().toLowerCase();
  let filteredBooks = filterBooks(filter);
  
  if (searchTerm) {
    filteredBooks = filteredBooks.filter(book =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.country.toLowerCase().includes(searchTerm)
    );
  }
  
  currentPage = 1;
  displayBooks(filteredBooks);
  setupPagination(filteredBooks);
});

// Copy API URL function
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

// Toast style
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


$(document).ready(function() {
  $(".nav-link").hover(
    function() {
      $(this).css("text-shadow", "0 0 15px #ff6ec4");
    },
    function() {
      $(this).css("text-shadow", "none");
    }
  );
});

// Loading spinner
document.addEventListener("DOMContentLoaded", function() {
  const loadingSpinner = document.getElementById("loadingSpinner");
  const booksContainer = document.getElementById("booksContainer");

  setTimeout(() => {
    loadingSpinner.classList.add("d-none");
    booksContainer.classList.remove("d-none");
  }, 2500); 
});