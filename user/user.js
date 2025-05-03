// Configuration
const USERS_PER_PAGE = 6;
let currentPage = 1;
let filteredUsers = [];
let usersData = [];

// Fetch users data from users.json
async function fetchUsersData() {
  try {
    const response = await fetch('./api/randomuser.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data[0].documents; // Extract the documents array from the first model
  } catch (error) {
    console.error('Error fetching users data:', error);
    showError('Failed to load users. Please try again later.');
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

// Format date from timestamp
function formatDate(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Display users
function displayUsers(usersToDisplay, page = 1) {
  const container = document.getElementById('usersContainer');
  const startIdx = (page - 1) * USERS_PER_PAGE;
  const paginatedUsers = usersToDisplay.slice(startIdx, startIdx + USERS_PER_PAGE);

  container.innerHTML = '';

  if (paginatedUsers.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <h4 class="text-muted">No users found matching your search</h4>
      </div>
    `;
    return;
  }

  paginatedUsers.forEach(user => {
    const userCard = `
      <div class="col-md-6 col-lg-4">
        <div class="user-card ${user.gender || 'other'}">
          <img src="${user.picture?.large || 'https://via.placeholder.com/150'}" alt="${user.name.first} ${user.name.last}" class="user-avatar">
          <h3 class="user-name">${user.name.first} ${user.name.last}</h3>
          <p class="user-title">${user.name.title}</p>
          
          <div class="user-details">
            <div class="detail-row">
              <span class="detail-label">Gender:</span>
              <span class="detail-value">${user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Unknown'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${user.location?.city || 'Unknown'}, ${user.location?.state || ''}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${user.email || 'Not available'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${user.phone || 'Not available'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Registered:</span>
              <span class="detail-value">${formatDate(user.registered)}</span>
            </div>
          </div>
          
          <div class="user-actions">
            <button class="user-btn view-btn" data-user-id="${user.username}">
              <i class="fas fa-eye"></i> View
            </button>
            <button class="user-btn contact-btn">
              <i class="fas fa-envelope"></i> Contact
            </button>
          </div>
        </div>
      </div>
    `;
    container.innerHTML += userCard;
  });

  container.style.display = 'flex';
}

// Update pagination
function updatePagination(totalUsers, currentPage) {
  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
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

// Initial setup
async function init() {
  // Show loading spinner and hide content
  document.getElementById('loadingSpinner').style.display = 'flex';
  document.getElementById('usersContainer').style.display = 'none';
  document.getElementById('paginationContainer').style.display = 'none';
  document.getElementById('errorContainer').style.display = 'none';

  try {
    // Simulate loading for better UX (optional)
    const spinnerPromise = new Promise(resolve => setTimeout(resolve, 1500));
    const dataPromise = fetchUsersData();

    // Wait for both the minimum loading time and data fetch
    const [_, users] = await Promise.all([spinnerPromise, dataPromise]);

    if (users.length === 0) {
      showError('No users available. Please check the data source.');
      return;
    }

    usersData = users;
    filteredUsers = [...usersData];

    // Update UI
    displayUsers(filteredUsers, currentPage);
    updatePagination(filteredUsers.length, currentPage);

  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to initialize users. Please try again later.');
  } finally {
    // Hide loading spinner
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('usersContainer').style.display = 'flex';
  }
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
    filteredUsers = usersData.filter(user => {
      const nameMatch = `${user.name.first} ${user.name.last}`.toLowerCase().includes(searchTerm);
      const emailMatch = user.email?.toLowerCase().includes(searchTerm);
      const locationMatch =
        user.location?.city?.toLowerCase().includes(searchTerm) ||
        user.location?.state?.toLowerCase().includes(searchTerm);

      return nameMatch || emailMatch || locationMatch;
    });

    currentPage = 1;
    displayUsers(filteredUsers, currentPage);
    updatePagination(filteredUsers.length, currentPage);
  });

  // Pagination click handler
  $(document).on('click', '.page-link', function (e) {
    e.preventDefault();
    const text = $(this).text().trim();

    if (text === 'Previous' && currentPage > 1) {
      currentPage--;
    } else if (text === 'Next' && currentPage < Math.ceil(filteredUsers.length / USERS_PER_PAGE)) {
      currentPage++;
    } else if (!isNaN(text)) {
      currentPage = parseInt(text);
    }

    displayUsers(filteredUsers, currentPage);
    updatePagination(filteredUsers.length, currentPage);

    // Smooth scroll to top of users section
    $('html, body').animate({
      scrollTop: $(".users-container").offset().top - 100
    }, 300);
  });

  // View button click handler
  $(document).on('click', '.view-btn', function () {
    const userId = $(this).data('user-id');
    const user = usersData.find(u => u.username === userId);

    if (user) {
      // Create a Bootstrap toast dynamically
      const toastHtml = `
    <div class="toast align-items-center text-bg-primary border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
        Viewing profile of ${user.name.first} ${user.name.last}<br>Email: ${user.email || 'Not available'}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
    `;

      // Append the toast to the body
      const toastContainer = document.getElementById('toast-container') || (() => {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '1055';
        document.body.appendChild(container);
        return container;
      })();

      toastContainer.innerHTML += toastHtml;

      // Initialize and show the toast
      const toastElement = toastContainer.lastElementChild;
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    }
  });

  // Contact button click handler
  $(document).on('click', '.contact-btn', function () {
    const userCard = $(this).closest('.user-card');
    const userName = userCard.find('.user-name').text();
    const userEmail = userCard.find('.detail-value').eq(2).text();

    if (userEmail !== 'Not available') {
      window.location.href = `mailto:${userEmail}?subject=Contacting%20${userName}`;
    } else {
      alert(`No email available for ${userName}`);
    }
  });
});