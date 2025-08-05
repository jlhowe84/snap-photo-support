/*
 * SNAP Photo Support Page - JavaScript Functionality
 * Purpose: Handles FAQ search filtering and form validation for the support ticket form
 * Features: Real-time FAQ search, form validation, accessibility enhancements, categorized FAQs
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all functionality
    loadFAQs().then(() => {
        initFAQSearch();
        initAccessibilityEnhancements();
        console.log('SNAP Photo Support Page initialized successfully');
    }).catch(error => {
        console.error('Failed to load FAQs:', error);
        showFAQError();
    });
});

/**
 * Load and parse FAQ markdown file
 * Fetches the markdown file and converts it to HTML accordion items
 */
async function loadFAQs() {
    try {
        const response = await fetch('faqs.md');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const markdownText = await response.text();
        const faqs = parseMarkdownFAQs(markdownText);
        renderCategoryCards(faqs);
        
    } catch (error) {
        console.error('Error loading FAQs:', error);
        throw error;
    }
}

/**
 * Parse markdown FAQ content into structured data with categories
 * @param {string} markdownText - Raw markdown content
 * @returns {Array} - Array of FAQ objects with question, answer, keywords, and category
 */
function parseMarkdownFAQs(markdownText) {
    const faqs = [];
    const lines = markdownText.split('\n');
    let currentQuestion = '';
    let currentAnswer = '';
    let currentKeywords = '';
    let currentCategory = 'General';
    let inAnswer = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines and the title
        if (!line || line.startsWith('# SNAP Photo FAQ')) {
            continue;
        }
        
        // Check if this is a question (starts with ##)
        if (line.startsWith('## ')) {
            // Save previous FAQ if exists
            if (currentQuestion && currentAnswer) {
                faqs.push({
                    question: currentQuestion,
                    answer: currentAnswer.trim(),
                    keywords: currentKeywords.trim(),
                    category: currentCategory
                });
            }
            
            // Start new FAQ
            currentQuestion = line.substring(3); // Remove '## '
            currentAnswer = '';
            currentKeywords = '';
            currentCategory = 'General'; // Default category
            inAnswer = true;
        } else if (inAnswer && line.startsWith('**Keywords:**')) {
            // Extract keywords
            currentKeywords = line.substring(11).trim(); // Remove '**Keywords:**'
        } else if (inAnswer && line.startsWith('**Category:**')) {
            // Extract category
            currentCategory = line.substring(12).trim(); // Remove '**Category:**'
        } else if (inAnswer && line) {
            // Add line to current answer
            currentAnswer += line + '\n';
        }
    }
    
    // Add the last FAQ
    if (currentQuestion && currentAnswer) {
        faqs.push({
            question: currentQuestion,
            answer: currentAnswer.trim(),
            keywords: currentKeywords.trim(),
            category: currentCategory
        });
    }
    
    return faqs;
}

/**
 * Render category cards based on FAQ data
 * @param {Array} faqs - Array of FAQ objects
 */
function renderCategoryCards(faqs) {
    const categoryCardsContainer = document.getElementById('category-cards');
    const loadingElement = document.getElementById('categories-loading');
    
    if (!categoryCardsContainer) {
        console.error('Category cards container not found');
        return;
    }
    
    // Remove loading element
    if (loadingElement) {
        loadingElement.remove();
    }
    
    // Group FAQs by category
    const categorizedFaqs = groupFAQsByCategory(faqs);
    
    // Create category cards
    Object.keys(categorizedFaqs).forEach(category => {
        if (category !== 'General' || categorizedFaqs[category].length > 0) {
            const categoryCard = createCategoryCard(category, categorizedFaqs[category]);
            categoryCardsContainer.appendChild(categoryCard);
        }
    });
    
    // Store FAQs globally for search functionality
    window.allFaqs = faqs;
    window.categorizedFaqs = categorizedFaqs;
    
    // Announce to screen readers
    announceToScreenReader(`Loaded ${Object.keys(categorizedFaqs).length} FAQ categories`);
}

/**
 * Group FAQs by category
 * @param {Array} faqs - Array of FAQ objects
 * @returns {Object} - Object with categories as keys and FAQ arrays as values
 */
function groupFAQsByCategory(faqs) {
    const categorized = {};
    
    faqs.forEach(faq => {
        const category = faq.category || 'General';
        if (!categorized[category]) {
            categorized[category] = [];
        }
        categorized[category].push(faq);
    });
    
    return categorized;
}

/**
 * Create a category card element
 * @param {string} category - Category name
 * @param {Array} faqs - Array of FAQs in this category
 * @returns {HTMLElement} - Category card element
 */
function createCategoryCard(category, faqs) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-3';
    
    const card = document.createElement('div');
    card.className = 'card h-100 category-card';
    card.setAttribute('data-category', category);
    
    const icon = getCategoryIcon(category);
    
    // Clean the category value to remove any unwanted characters
    const cleanCategory = category.replace(/^\*+\s*/, '').trim();
    
    card.innerHTML = `
        <div class="card-body text-center">
            <div class="category-icon-wrapper mb-3">
                <i class="fas ${icon}"></i>
            </div>
            <h5 class="card-title">${cleanCategory}</h5>
            <p class="card-text text-muted">${faqs.length} question${faqs.length !== 1 ? 's' : ''}</p>
        </div>
    `;
    
    // Make the entire card clickable
    card.addEventListener('click', function() {
        showCategoryFAQs(category);
    });
    
    // Add keyboard accessibility
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View ${cleanCategory} questions`);
    
    card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            showCategoryFAQs(category);
        }
    });
    
    col.appendChild(card);
    return col;
}

/**
 * Get icon for category
 * @param {string} category - Category name
 * @returns {string} - Font Awesome icon class
 */
function getCategoryIcon(category) {
    if (!category) return 'fa-question-circle';
    const key = category.toLowerCase();
    if (key.includes('photo day') || key.includes('photo-day')) return 'fa-camera';
    if (key.includes('order') || key.includes('shipping')) return 'fa-truck';
    if (key.includes('payment') || key.includes('account')) return 'fa-credit-card';
    if (key.includes('return') || key.includes('support')) return 'fa-headset';
    if (key.includes('product')) return 'fa-box';
    return 'fa-question-circle';
}

/**
 * Get color for category
 * @param {string} category - Category name
 * @returns {string} - Bootstrap color class
 */
function getCategoryColor(category) {
    const colors = {
        'Order & Shipping': 'primary',
        'Account & Payment': 'success',
        'Returns & Support': 'warning',
        'Product & Services': 'info',
        'General': 'secondary'
    };
    
    return colors[category] || 'secondary';
}

/**
 * Show FAQs for a specific category
 * @param {string} category - Category name
 */
function showCategoryFAQs(category) {
    const categoryCards = document.getElementById('category-cards');
    const accordionContainer = document.getElementById('faq-accordion-container');
    const categoryTitle = document.getElementById('selected-category-title');
    const accordion = document.getElementById('faqAccordion');
    
    // Hide category cards and show accordion
    categoryCards.style.display = 'none';
    accordionContainer.style.display = 'block';
    
    // Set category title and clean it
    const cleanCategory = category.replace(/^\*+\s*/, '').trim();
    categoryTitle.textContent = cleanCategory;
    
    // Clear existing accordion items
    accordion.innerHTML = '';
    
    // Get FAQs for this category
    const categoryFaqs = window.categorizedFaqs[category] || [];
    
    // Create FAQ items
    categoryFaqs.forEach((faq, index) => {
        const faqItem = createFAQItem(faq, index);
        accordion.appendChild(faqItem);
    });
    
    // Initialize back button functionality
    initBackButton();
    
    // Scroll to the top of the FAQ section
    const faqSection = document.getElementById('faq-section');
    if (faqSection) {
        faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Announce to screen readers
    announceToScreenReader(`Showing ${categoryFaqs.length} questions in ${cleanCategory}`);
}

/**
 * Initialize back button functionality
 */
function initBackButton() {
    const backButton = document.getElementById('back-to-categories');
    const categoryCards = document.getElementById('category-cards');
    const accordionContainer = document.getElementById('faq-accordion-container');
    
    backButton.onclick = function() {
        // Show category cards container by removing inline styles and restoring Bootstrap classes
        categoryCards.removeAttribute('style');
        categoryCards.className = 'row';
        accordionContainer.style.display = 'none';
        
        // Clear search if active
        const searchInput = document.getElementById('faq-search');
        if (searchInput && searchInput.value) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
        }
        
        // Announce to screen readers
        announceToScreenReader('Returned to FAQ categories');
    };
}

/**
 * Create a single FAQ accordion item
 * @param {Object} faq - FAQ object with question, answer, keywords, and category
 * @param {number} index - Index of the FAQ item
 * @returns {HTMLElement} - FAQ accordion item element
 */
function createFAQItem(faq, index) {
    const faqItem = document.createElement('div');
    faqItem.className = 'accordion-item';
    faqItem.setAttribute('data-faq-item', '');
    faqItem.setAttribute('data-category', faq.category);
    
    // Add keywords as data attribute for search
    if (faq.keywords) {
        faqItem.setAttribute('data-keywords', faq.keywords.toLowerCase());
    }
    
    const itemId = `faq-${Date.now()}-${index}`;
    
    // Convert markdown links in the answer
    const processedAnswer = convertMarkdownLinks(faq.answer);
    
    faqItem.innerHTML = `
        <h3 class="accordion-header" id="faq-heading-${itemId}">
            <button class="accordion-button collapsed" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#faq-collapse-${itemId}" 
                    aria-expanded="false" 
                    aria-controls="faq-collapse-${itemId}">
                ${faq.question}
            </button>
        </h3>
        <div id="faq-collapse-${itemId}" 
             class="accordion-collapse collapse" 
             data-bs-parent="#faqAccordion" 
             aria-labelledby="faq-heading-${itemId}">
            <div class="accordion-body">
                ${processedAnswer}
            </div>
        </div>
    `;
    
    return faqItem;
}

/**
 * Convert markdown links to HTML
 * @param {string} text - Text containing markdown links
 * @returns {string} - Text with markdown links converted to HTML
 */
function convertMarkdownLinks(text) {
    // Convert markdown links [text](url) to HTML <a> tags
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

/**
 * Show error message when FAQ loading fails
 */
function showFAQError() {
    const categoryCardsContainer = document.getElementById('category-cards');
    const loadingElement = document.getElementById('categories-loading');
    
    if (loadingElement) {
        loadingElement.innerHTML = `
            <div class="alert alert-warning" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Unable to load frequently asked questions. Please try refreshing the page or contact support if the problem persists.
            </div>
        `;
    }
}

/**
 * FAQ Search Functionality
 * Filters FAQ items in real-time based on search input
 */
function initFAQSearch() {
    const searchInput = document.getElementById('faq-search');
    
    if (!searchInput) {
        console.warn('FAQ search input not found');
        return;
    }
    
    // Add event listener for real-time search
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            // If search is empty, show category cards
            showCategoryCards();
            return;
        }
        
        // Perform search across all FAQs
        performSearch(searchTerm);
    });
    
    // Clear search functionality
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.blur();
        }
    });
}

/**
 * Perform search across all FAQs
 * @param {string} searchTerm - Search term
 */
function performSearch(searchTerm) {
    const categoryCards = document.getElementById('category-cards');
    const accordionContainer = document.getElementById('faq-accordion-container');
    const categoryTitle = document.getElementById('selected-category-title');
    const accordion = document.getElementById('faqAccordion');
    
    // Hide category cards and show accordion
    categoryCards.style.display = 'none';
    accordionContainer.style.display = 'block';
    
    // Set search results title
    categoryTitle.textContent = `Search Results for "${searchTerm}"`;
    
    // Clear existing accordion items
    accordion.innerHTML = '';
    
    // Filter FAQs based on search term
    const searchResults = window.allFaqs.filter(faq => {
        const questionText = faq.question.toLowerCase();
        const answerText = faq.answer.toLowerCase();
        const keywords = faq.keywords.toLowerCase();
        
        return questionText.includes(searchTerm) || 
               answerText.includes(searchTerm) || 
               keywords.includes(searchTerm);
    });
    
    // Create FAQ items for search results
    searchResults.forEach((faq, index) => {
        const faqItem = createFAQItem(faq, index);
        accordion.appendChild(faqItem);
    });
    
    // Show "no results" message if needed
    if (searchResults.length === 0) {
        accordion.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-search fa-2x text-muted mb-3"></i>
                <p class="text-muted">No questions found matching "${searchTerm}"</p>
                <p class="text-muted">Try searching with different keywords or browse by category.</p>
            </div>
        `;
    }
    
    // Initialize back button functionality
    initBackButton();
    
    // Announce to screen readers
    announceToScreenReader(`Found ${searchResults.length} matching questions`);
}

/**
 * Show category cards (used when search is cleared)
 */
function showCategoryCards() {
    const categoryCards = document.getElementById('category-cards');
    const accordionContainer = document.getElementById('faq-accordion-container');
    
    // Show category cards container by removing inline styles and restoring Bootstrap classes
    categoryCards.removeAttribute('style');
    categoryCards.className = 'row';
    accordionContainer.style.display = 'none';
}

/**
 * Accessibility Enhancements
 * Adds keyboard navigation and screen reader support
 */
function initAccessibilityEnhancements() {
    // Add skip link for keyboard users
    addSkipLink();
    
    // Enhance accordion keyboard navigation
    enhanceAccordionAccessibility();
    
    // Add ARIA live regions for dynamic content
    addAriaLiveRegions();
}

/**
 * Add skip link for keyboard navigation
 */
function addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#faq-section';
    skipLink.className = 'sr-only sr-only-focusable position-absolute';
    skipLink.style.cssText = 'top: -40px; left: 6px; z-index: 1000; background: #000; color: #fff; padding: 8px; text-decoration: none;';
    skipLink.textContent = 'Skip to FAQ section';
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Enhance accordion accessibility
 */
function enhanceAccordionAccessibility() {
    const accordionButtons = document.querySelectorAll('.accordion-button');
    
    accordionButtons.forEach(button => {
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });
}

/**
 * Add ARIA live regions for dynamic content
 */
function addAriaLiveRegions() {
    // Add live region for search results
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'search-results-live';
    
    document.body.appendChild(liveRegion);
}

/**
 * Utility function to announce changes to screen readers
 * @param {string} message - Message to announce
 */
function announceToScreenReader(message) {
    const liveRegion = document.getElementById('search-results-live');
    if (liveRegion) {
        liveRegion.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

// Export functions for potential external use
window.SNAPSupport = {
    initFAQSearch,
    announceToScreenReader,
    showCategoryFAQs
}; 