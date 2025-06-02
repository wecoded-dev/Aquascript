// Initialize FAQ
async function initFAQ() {
  const accordion = document.getElementById("faqAccordion");
  const categoryButtons = document.querySelectorAll("[data-category]");

  try {
    // Show loading state
    accordion.innerHTML =
      '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-3">Loading FAQs...</p></div>';

    // Fetch FAQ data from API
    const response = await fetch("/FAQs/faq.json");
    if (!response.ok) {
      throw new Error("Failed to load FAQs");
    }
    const faqData = await response.json();


    const overviewButton = document.querySelector(
      '[data-category="Overview"]'
    );
    if (overviewButton) {
      overviewButton.classList.add("active"); // Ensure "Overview" button is active
      const filteredFAQs = faqData.filter(
        (faq) => faq.category === "Overview"
      );
      renderFAQs(filteredFAQs);
    }

    // Add category filter event listeners
    categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Update active state
        categoryButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // Filter FAQs
        const category = button.dataset.category;
        
        // If the category is "Overview", show all FAQs
        const filteredFAQs = faqData.filter(
          (faq) => faq.category === category
        );
        renderFAQs(filteredFAQs);
        // }
      });
    });
  } catch (error) {
    console.error("Error loading FAQs:", error);
    accordion.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        Failed to load FAQs. Please try again later.
      </div>
    `;
  }
}

// Render FAQs to the page
function renderFAQs(faqs) {
  const accordion = document.getElementById("faqAccordion");
  accordion.innerHTML = "";

  if (!faqs || faqs.length === 0) {
    accordion.innerHTML = `
      <div class="text-center py-5">
        <h4 class="text-muted">No FAQs found</h4>
      </div>
    `;
    return;
  }

  // Group by subcategory
  const groupedFAQs = {};
  faqs.forEach((faq) => {
    if (!groupedFAQs[faq.subcategory]) {
      groupedFAQs[faq.subcategory] = [];
    }
    groupedFAQs[faq.subcategory].push(faq);
  });

  // Create accordion items
  Object.entries(groupedFAQs).forEach(([subcategory, faqs], index) => {
    // Subcategory header
    const subcategoryHeader = document.createElement("h3");
    subcategoryHeader.className = "text-white mt-4 mb-3";
    subcategoryHeader.style.fontSize = "1.3rem";
    subcategoryHeader.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
    subcategoryHeader.style.paddingBottom = "0.5rem";
    subcategoryHeader.textContent = subcategory;
    accordion.appendChild(subcategoryHeader);

    // FAQ items for this subcategory
    faqs.forEach((faq, faqIndex) => {
      const accordionItem = document.createElement("div");
      accordionItem.className = "accordion-item bg-dark border-0 mb-2";

      const accordionHeader = document.createElement("h2");
      accordionHeader.className = "accordion-header";
      accordionHeader.id = `heading-${index}-${faqIndex}`;

      const accordionButton = document.createElement("button");
      accordionButton.className =
        "accordion-button collapsed bg-dark text-white";
      accordionButton.type = "button";
      accordionButton.setAttribute("data-bs-toggle", "collapse");
      accordionButton.setAttribute(
        "data-bs-target",
        `#collapse-${index}-${faqIndex}`
      );
      accordionButton.setAttribute("aria-expanded", "false");
      accordionButton.setAttribute(
        "aria-controls",
        `collapse-${index}-${faqIndex}`
      );
      accordionButton.textContent = faq.question;

      accordionHeader.appendChild(accordionButton);

      const accordionCollapse = document.createElement("div");
      accordionCollapse.id = `collapse-${index}-${faqIndex}`;
      accordionCollapse.className = "accordion-collapse collapse";
      accordionCollapse.setAttribute(
        "aria-labelledby",
        `heading-${index}-${faqIndex}`
      );
      accordionCollapse.setAttribute("data-bs-parent", "#faqAccordion");

      const accordionBody = document.createElement("div");
      accordionBody.className = "accordion-body bg-light text-body-emphasis";
      accordionBody.innerHTML = faq.answer;

      accordionCollapse.appendChild(accordionBody);

      accordionItem.appendChild(accordionHeader);
      accordionItem.appendChild(accordionCollapse);

      accordion.appendChild(accordionItem);
    });
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initFAQ);
