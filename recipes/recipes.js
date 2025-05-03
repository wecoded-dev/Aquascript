// Configuration
const RECIPES_PER_PAGE = 4;
let currentPage = 1;
let filteredRecipes = [];
let recipesData = [];
let allTags = new Set();

// Fetch recipes data from recipes.json
async function fetchRecipesData() {
    try {
        const response = await fetch('./api/recipes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Convert object to array
        return Object.values(data);
    } catch (error) {
        console.error('Error fetching recipes data:', error);
        showError('Failed to load recipes. Please try again later.');
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

// Format time
function formatTime(minutes) {
    if (!minutes || minutes === 0) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

// Display recipes
function displayRecipes(recipesToDisplay, page = 1) {
    const container = document.getElementById('recipesContainer');
    const startIdx = (page - 1) * RECIPES_PER_PAGE;
    const paginatedRecipes = recipesToDisplay.slice(startIdx, startIdx + RECIPES_PER_PAGE);

    container.innerHTML = '';

    if (paginatedRecipes.length === 0) {
        container.innerHTML = `
          <div class="col-12 text-center py-5">
            <h4 class="text-muted">No recipes found matching your search</h4>
          </div>
        `;
        return;
    }

    paginatedRecipes.forEach(recipe => {
        const recipeCard = `
          <div class="recipe-card">
            <h2 class="recipe-title">${recipe.name}</h2>
            ${recipe.source ? `<p class="recipe-source">Source: ${recipe.source}</p>` : ''}
            
            <div class="recipe-meta">
              <div class="meta-item">
                <i class="fas fa-utensils"></i>
                <span>${recipe.servings || 'N/A'} servings</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-clock"></i>
                <span>Prep: ${formatTime(recipe.preptime)}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-fire"></i>
                <span>Cook: ${formatTime(recipe.cooktime)}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-hourglass-half"></i>
                <span>Wait: ${formatTime(recipe.waittime)}</span>
              </div>
            </div>
            
            ${recipe.tags && recipe.tags.length > 0 ? `
              <div class="recipe-tags">
                ${recipe.tags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
              </div>
            ` : ''}
            
            ${recipe.comments ? `
              <div class="recipe-section">
                <h3 class="section-title"><i class="fas fa-comment"></i> Notes</h3>
                <p>${recipe.comments}</p>
              </div>
            ` : ''}
            
            <div class="recipe-section">
              <h3 class="section-title"><i class="fas fa-list-ul"></i> Ingredients</h3>
              <ul class="recipe-ingredients">
                ${recipe.ingredients.map(ingredient => `<li>${ingredient.replace('<hr>', '<hr class="my-2">')}</li>`).join('')}
              </ul>
            </div>
            
            <div class="recipe-section">
              <h3 class="section-title"><i class="fas fa-list-ol"></i> Instructions</h3>
              <p class="recipe-instructions">${recipe.instructions}</p>
            </div>
            
            ${recipe.calories ? `
              <div class="recipe-section">
                <h3 class="section-title"><i class="fas fa-chart-pie"></i> Nutrition (per serving)</h3>
                <div class="recipe-nutrition">
                  <div class="nutrition-item">
                    <div class="nutrition-value">${recipe.calories}</div>
                    <div class="nutrition-label">Calories</div>
                  </div>
                  <div class="nutrition-item">
                    <div class="nutrition-value">${recipe.fat}g</div>
                    <div class="nutrition-label">Fat</div>
                  </div>
                  <div class="nutrition-item">
                    <div class="nutrition-value">${recipe.satfat}g</div>
                    <div class="nutrition-label">Sat Fat</div>
                  </div>
                  <div class="nutrition-item">
                    <div class="nutrition-value">${recipe.carbs}g</div>
                    <div class="nutrition-label">Carbs</div>
                  </div>
                  <div class="nutrition-item">
                    <div class="nutrition-value">${recipe.fiber}g</div>
                    <div class="nutrition-label">Fiber</div>
                  </div>
                  <div class="nutrition-item">
                    <div class="nutrition-value">${recipe.sugar}g</div>
                    <div class="nutrition-label">Sugar</div>
                  </div>
                  <div class="nutrition-item">
                    <div class="nutrition-value">${recipe.protein}g</div>
                    <div class="nutrition-label">Protein</div>
                  </div>
                </div>
              </div>
            ` : ''}
            
            <div class="recipe-actions">
                <button class="recipe-btn copy-btn" onclick="copyRecipeContent(this)">
                  <i class="fas fa-copy"></i> Copy
                </button>

                <button class="recipe-btn save-btn" onclick="toggleSave(this)" id="save-recipe-btn">
                  <i class="far fa-bookmark"></i> Save
                </button>

            </div>
          </div>
        `;
        container.innerHTML += recipeCard;
    });

    container.style.display = 'block';
}

// Run this when the page loads to apply saved state if it exists
window.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('save-recipe-btn');
    const isSaved = localStorage.getItem('recipeSaved') === 'true';

    if (isSaved) {
        button.classList.add('saved');
        button.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
    }
});

function toggleSave(button) {
    const isSaved = button.classList.contains('saved');

    if (!isSaved) {
        button.classList.add('saved');
        button.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
        localStorage.setItem('recipeSaved', 'true');
    } else {
        button.classList.remove('saved');
        button.innerHTML = '<i class="far fa-bookmark"></i> Save';
        localStorage.setItem('recipeSaved', 'false');
    }
}


function copyRecipeContent(button) {
    const card = button.closest('.recipe-card');
  
    const title = card.querySelector('.recipe-title')?.innerText || '';
    const ingredients = Array.from(card.querySelectorAll('.recipe-ingredients li'))
      .map(li => `- ${li.innerText}`).join('\n');
  
    const instructions = card.querySelector('.recipe-instructions')?.innerText || '';
  
    const cleanText = `🍽️ ${title}\n\n📝 Ingredients:\n${ingredients}\n\n👨‍🍳 Instructions:\n${instructions}`;
  
    navigator.clipboard.writeText(cleanText).then(() => {
      button.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => {
        button.innerHTML = '<i class="fas fa-copy"></i> Copy';
      }, 2000);
    }).catch(err => {
      console.error('Copy failed:', err);
      alert('Couldn’t copy recipe. Try again.');
    });
}
  



// Update pagination
function updatePagination(totalRecipes, currentPage) {
    const totalPages = Math.ceil(totalRecipes / RECIPES_PER_PAGE);
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
    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('recipesContainer').style.display = 'none';
    document.getElementById('paginationContainer').style.display = 'none';
    document.getElementById('errorContainer').style.display = 'none';

    try {
        // Simulate loading for better UX (optional)
        const spinnerPromise = new Promise(resolve => setTimeout(resolve, 3500));
        const dataPromise = fetchRecipesData();

        // Wait for both the minimum loading time and data fetch
        const [_, recipes] = await Promise.all([spinnerPromise, dataPromise]);

        if (recipes.length === 0) {
            showError('No recipes available. Please check the data source.');
            return;
        }

        recipesData = recipes;
        filteredRecipes = [...recipesData];

        // Collect all unique tags
        recipes.forEach(recipe => {
            if (recipe.tags && recipe.tags.length > 0) {
                recipe.tags.forEach(tag => allTags.add(tag));
            }
        });

        // Update UI
        displayRecipes(filteredRecipes, currentPage);
        updatePagination(filteredRecipes.length, currentPage);

    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize recipes. Please try again later.');
    } finally {
        // Hide loading spinner
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('recipesContainer').style.display = 'block';
    }
}

// Document ready handler
$(document).ready(function () {
    init();

    // Search functionality
    $('.search-input').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        filteredRecipes = recipesData.filter(recipe =>
            recipe.name.toLowerCase().includes(searchTerm) ||
            (recipe.ingredients && recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm)))
        );

        currentPage = 1;
        displayRecipes(filteredRecipes, currentPage);
        updatePagination(filteredRecipes.length, currentPage);
    });

    // Tag filter functionality
    $(document).on('click', '.filter-tag', function () {
        const tag = $(this).data('tag');
        $('.filter-tag').removeClass('active');
        $(this).addClass('active');

        if (tag === 'all') {
            filteredRecipes = [...recipesData];
        } else {
            filteredRecipes = recipesData.filter(recipe =>
                recipe.tags && recipe.tags.includes(tag)
            );
        }

        currentPage = 1;
        displayRecipes(filteredRecipes, currentPage);
        updatePagination(filteredRecipes.length, currentPage);
    });

    // Pagination click handler
    $(document).on('click', '.page-link', function (e) {
        e.preventDefault();
        const text = $(this).text().trim();

        if (text === 'Previous' && currentPage > 1) {
            currentPage--;
        } else if (text === 'Next' && currentPage < Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE)) {
            currentPage++;
        } else if (!isNaN(text)) {
            currentPage = parseInt(text);
        }

        displayRecipes(filteredRecipes, currentPage);
        updatePagination(filteredRecipes.length, currentPage);

        // Smooth scroll to top of recipes section
        $('html, body').animate({
            scrollTop: $(".recipes-container").offset().top - 100
        }, 300);
    });

    // Print button click handler
    $(document).on('click', '.print-btn', function () {
        window.print();
    });

    // Save button click handler
    $(document).on('click', '.save-btn', function () {
        const recipeCard = $(this).closest('.recipe-card');
        const recipeTitle = recipeCard.find('.recipe-title').text();

        // In a real app, you would save to localStorage or a backend
        const notification = document.createElement('div');
        notification.className = 'alert alert-success position-fixed bottom-0 start-50 translate-middle-x mb-3';
        notification.style.zIndex = '9999';
        notification.innerHTML = `<i class="fas fa-check-circle me-2"></i> "${recipeTitle}" saved!`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    });
});