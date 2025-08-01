/*
 * SNAP Photo Support Page - JavaScript Functionality
 * Purpose: Handles FAQ search filtering and form validation for the support ticket form
 * Features: Real-time FAQ search, form validation, accessibility enhancements
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
        renderFAQs(faqs);
        
    } catch (error) {
        console.error('Error loading FAQs:', error);
        throw error;
    }
}

/**
 * Parse markdown FAQ content into structured data
 * @param {string} markdownText - Raw markdown content
 * @returns {Array} - Array of FAQ objects with question and answer
 */
function parseMarkdownFAQs(markdownText) {
    const faqs = [];
    const lines = markdownText.split('\n');
    let currentQuestion = '';
    let currentAnswer = '';
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
                    answer: currentAnswer.trim()
                });
            }
            
            // Start new FAQ
            currentQuestion = line.substring(3); // Remove '## '
            currentAnswer = '';
            inAnswer = true;
        } else if (inAnswer && line) {
            // Add line to current answer
            currentAnswer += line + '\n';
        }
    }
    
    // Add the last FAQ
    if (currentQuestion && currentAnswer) {
        faqs.push({
            question: currentQuestion,
            answer: currentAnswer.trim()
        });
    }
    
    return faqs;
}

/**
 * Render FAQs as Bootstrap accordion items
 * @param {Array} faqs - Array of FAQ objects
 */
function renderFAQs(faqs) {
    const accordionContainer = document.getElementById('faqAccordion');
    const loadingElement = document.getElementById('faq-loading');
    
    if (!accordionContainer) {
        console.error('FAQ accordion container not found');
        return;
    }
    
    // Remove loading element
    if (loadingElement) {
        loadingElement.remove();
    }
    
    // Create FAQ items
    faqs.forEach((faq, index) => {
        const faqItem = createFAQItem(faq, index);
        accordionContainer.appendChild(faqItem);
    });
    
    // Announce to screen readers
    announceToScreenReader(`Loaded ${faqs.length} frequently asked questions`);
}

/**
 * Create a single FAQ accordion item
 * @param {Object} faq - FAQ object with question and answer
 * @param {number} index - Index of the FAQ item
 * @returns {HTMLElement} - FAQ accordion item element
 */
function createFAQItem(faq, index) {
    const faqItem = document.createElement('div');
    faqItem.className = 'accordion-item';
    faqItem.setAttribute('data-faq-item', '');
    
    const itemId = index + 1;
    const isFirst = index === 0;
    
    faqItem.innerHTML = `
        <h3 class="accordion-header" id="faq-heading-${itemId}">
            <button class="accordion-button ${isFirst ? '' : 'collapsed'}" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#faq-collapse-${itemId}" 
                    aria-expanded="${isFirst ? 'true' : 'false'}" 
                    aria-controls="faq-collapse-${itemId}">
                ${faq.question}
            </button>
        </h3>
        <div id="faq-collapse-${itemId}" 
             class="accordion-collapse collapse ${isFirst ? 'show' : ''}" 
             data-bs-parent="#faqAccordion" 
             aria-labelledby="faq-heading-${itemId}">
            <div class="accordion-body">
                ${faq.answer}
            </div>
        </div>
    `;
    
    return faqItem;
}

/**
 * Show error message when FAQ loading fails
 */
function showFAQError() {
    const accordionContainer = document.getElementById('faqAccordion');
    const loadingElement = document.getElementById('faq-loading');
    
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
    const faqItems = document.querySelectorAll('[data-faq-item]');
    
    if (!searchInput) {
        console.warn('FAQ search input not found');
        return;
    }
    
    // Add event listener for real-time search
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        // Filter FAQ items
        faqItems.forEach(item => {
            const questionText = item.querySelector('.accordion-button').textContent.toLowerCase();
            const answerText = item.querySelector('.accordion-body').textContent.toLowerCase();
            
            const matchesSearch = questionText.includes(searchTerm) || answerText.includes(searchTerm);
            
            // Show/hide items based on search
            if (searchTerm === '' || matchesSearch) {
                item.style.display = 'block';
                
                // Highlight search terms if present
                if (searchTerm !== '') {
                    highlightSearchTerms(item, searchTerm);
                } else {
                    removeHighlights(item);
                }
            } else {
                item.style.display = 'none';
            }
        });
        
        // Update search results count
        updateSearchResultsCount(searchTerm, faqItems);
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
 * Highlight search terms in FAQ items
 * @param {HTMLElement} item - The FAQ item element
 * @param {string} searchTerm - The search term to highlight
 */
function highlightSearchTerms(item, searchTerm) {
    const questionElement = item.querySelector('.accordion-button');
    const answerElement = item.querySelector('.accordion-body');
    
    // Remove existing highlights
    removeHighlights(item);
    
    // Highlight in question
    if (questionElement.textContent.toLowerCase().includes(searchTerm)) {
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        questionElement.innerHTML = questionElement.textContent.replace(regex, '<span class="faq-highlight">$1</span>');
    }
    
    // Highlight in answer
    if (answerElement.textContent.toLowerCase().includes(searchTerm)) {
        const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
        answerElement.innerHTML = answerElement.textContent.replace(regex, '<span class="faq-highlight">$1</span>');
    }
}

/**
 * Remove highlights from FAQ items
 * @param {HTMLElement} item - The FAQ item element
 */
function removeHighlights(item) {
    const highlights = item.querySelectorAll('.faq-highlight');
    highlights.forEach(highlight => {
        highlight.outerHTML = highlight.textContent;
    });
}

/**
 * Update search results count display
 * @param {string} searchTerm - The current search term
 * @param {NodeList} faqItems - All FAQ items
 */
function updateSearchResultsCount(searchTerm, faqItems) {
    const visibleItems = Array.from(faqItems).filter(item => 
        item.style.display !== 'none'
    );
    
    // You can add a results counter element if needed
    // For now, we'll just log the count
    if (searchTerm !== '') {
        console.log(`Found ${visibleItems.length} matching FAQ items`);
    }
}

/**
 * Escape special characters for regex
 * @param {string} string - The string to escape
 * @returns {string} - Escaped string
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    announceToScreenReader
}; 