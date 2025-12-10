/*
========================================
TELUGU DELICACIES WEBSITE JAVASCRIPT
/*
========================================
TELUGU DELICACIES WEBSITE JAVASCRIPT
========================================
Author: Telugu Delicacies
Description: Interactive functionality for responsive Telugu Delicacies website
Features: Smooth scrolling, form handling, animations, enhanced product showcase with rem-based scaling
Fonts: Montserrat (headers), Roboto (body text), Noto Sans Telugu (Telugu content)
Scaling: Responsive rem-based system with fluid typography using clamp()
Last Updated: 2024 - Updated for comprehensive font and scaling strategy
*/

import { supabase } from './lib/supabase.js';

/*
========================================
SMOOTH SCROLLING NAVIGATION
Functions for smooth page navigation
========================================
*/

/**
 * Smoothly scrolls to a specific section on the page
 * @param {string} sectionId - The ID of the section to scroll to
 */
function scrollToSection(sectionId) {
    console.log('Scrolling to section:', sectionId);
    const section = document.getElementById(sectionId);
    console.log('Section found:', section);

    if (section) {
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;

        if (sectionId === 'footer-contact') {
            section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            const targetPosition = section.offsetTop - headerHeight - 20;
            console.log('Scrolling to position:', targetPosition);

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    } else {
        console.error('Section not found:', sectionId);
    }
}

// Make scrollToSection globally accessible for inline onclick handlers
window.scrollToSection = scrollToSection;

/*
========================================
PRODUCT DESCRIPTION DISPLAY
Interactive dropdown functionality for product categories
========================================
*/

/**
 * Shows or hides product descriptions based on dropdown selection
 * @param {HTMLElement} selectElement - The dropdown select element
 * @param {string} category - The product category identifier
 */
function showProductDescription(selectElement, category) {
    // FIXED: Enhanced dropdown functionality for Telugu text support
    console.log('Dropdown selection changed:', selectElement.value);

    // Hide all descriptions for this category first
    const categoryCard = selectElement.closest('.category-card');
    const allDescriptions = categoryCard.querySelectorAll('.product-description');

    allDescriptions.forEach(desc => {
        desc.style.display = 'none';
        // Remove any existing animation classes
        desc.classList.remove('fade-in');
    });

    // Show selected description with animation
    const selectedValue = selectElement.value;
    if (selectedValue) {
        const descriptionElement = document.getElementById(`${category}-${selectedValue}`);
        if (descriptionElement) {
            descriptionElement.style.display = 'block';
            // Add fade-in animation class
            setTimeout(() => {
                descriptionElement.classList.add('fade-in');
            }, 10);

            // FIXED: Log for debugging Telugu functionality
            console.log('Showing description for:', selectedValue);
            console.log('Description element found:', descriptionElement);
        }
    }
}

/*
========================================
CONTACT FORM HANDLING
Form submission, validation, and user feedback
========================================
*/

/**
 * Handles contact form submission with validation and user feedback
 * @param {Event} event - The form submit event
 */
function handleFormSubmit(event) {
    event.preventDefault();

    // Validate form before submission
    if (!validateForm(event.target)) {
        return;
    }

    // Show loading state
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    // Get form data for Netlify
    const formData = new FormData(event.target);

    // Submit to Netlify
    fetch('/', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
    })
        .then(() => {
            // Show success message
            showSuccessMessage('Thank you for your message! We will get back to you soon.');

            // Reset form
            event.target.reset();

            // Clear any validation errors
            clearFormErrors(event.target);
        })
        .catch((error) => {
            console.error('Form submission error:', error);
            showErrorMessage('Sorry, there was an error sending your message. Please try again or contact us directly.');
        })
        .finally(() => {
            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
}

/**
 * Validates the entire contact form
 * @param {HTMLFormElement} form - The form element to validate
 * @returns {boolean} - True if form is valid, false otherwise
 */
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });

    return isValid;
}

/**
 * Shows a success message to the user
 * @param {string} message - The success message to display
 */
function showSuccessMessage(message) {
    // Create a toast notification for better UX
    showToast(message, 'success');
}

/**
 * Shows an error message to the user
 * @param {string} message - The error message to display
 */
function showErrorMessage(message) {
    // Create a toast notification for errors
    showToast(message, 'error');
}

/**
 * Creates and displays a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast ('success' or 'error')
 */
function showToast(message, type = 'success') {
    // Remove any existing toasts
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add toast styles if not already added
    if (!document.querySelector('#toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .toast-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                z-index: 10000;
                max-width: 400px;
                animation: slideInRight 0.3s ease;
                border-left: 4px solid;
            }
            
            .toast-success {
                border-left-color: #228B22;
                color: #228B22;
            }
            
            .toast-error {
                border-left-color: #dc3545;
                color: #dc3545;
            }
            
            .toast-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
            }
            
            .toast-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #666;
                padding: 0.25rem;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            }
            
            .toast-close:hover {
                background-color: rgba(0,0,0,0.1);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @media (max-width: 768px) {
                .toast-notification {
                    left: 20px;
                    right: 20px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Add toast to page
    document.body.appendChild(toast);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

/*
========================================
HEADER SCROLL EFFECTS
Dynamic header styling based on scroll position
========================================
*/

/**
 * Updates header appearance based on scroll position
 */
function updateHeaderOnScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    const scrollY = window.scrollY;

    if (scrollY > 20) {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.borderBottom = '1px solid rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.9)';
        header.style.borderBottom = '1px solid rgba(0, 0, 0, 0.1)';
    }
}

/*
========================================
SCROLL ANIMATIONS
Intersection Observer for element animations on scroll
========================================
*/

/**
 * Initializes scroll-triggered animations using Intersection Observer
 * Animates elements when they come into viewport
 */
function initializeScrollAnimations() {
    // Configuration for the intersection observer
    const observerOptions = {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '0px 0px -50px 0px' // Trigger 50px before element enters viewport
    };

    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Element is in viewport - animate in
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements that should animate
    const animateElements = document.querySelectorAll('.category-card, .info-card, .product-item');
    animateElements.forEach(el => {
        // Set initial state for animation
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

        // Start observing the element
        observer.observe(el);
    });
}

/*
========================================
PRODUCT SHOWCASE CONTROLS
Interactive controls for the product ticker
========================================
*/

/**
 * Initializes hover and touch controls for the product showcase
 * Pauses animation on interaction for better user experience
 * Now works seamlessly with rem-based responsive scaling
 */
function initializeProductShowcaseControls() {
    const productScroll = document.getElementById('productScroll');
    const scrollContainer = productScroll?.parentElement;
    if (!productScroll) return;

    // Initialize showcase mode management
    initializeShowcaseMode();

    // Ensure ticker animation is running by default
    productScroll.style.animationPlayState = 'running';

    // Pause animation on mouse hover for better desktop UX
    productScroll.addEventListener('mouseenter', () => {
        productScroll.style.animationPlayState = 'paused';
    });

    // Resume animation when mouse leaves
    productScroll.addEventListener('mouseleave', () => {
        productScroll.style.animationPlayState = 'running';
    });

    // Touch interaction handling - only pause when user actively interacts
    let isUserInteracting = false;
    let interactionTimeout;

    const handleInteractionStart = () => {
        if (!isUserInteracting) {
            productScroll.style.animationPlayState = 'paused';
            isUserInteracting = true;
        }

        // Clear any existing timeout
        if (interactionTimeout) {
            clearTimeout(interactionTimeout);
        }
    };

    const handleInteractionEnd = () => {
        // Resume ticker animation after brief delay
        interactionTimeout = setTimeout(() => {
            productScroll.style.animationPlayState = 'running';
            isUserInteracting = false;
        }, 2000); // Resume ticker after 2 seconds of inactivity
    };

    // Touch events - pause ticker during active touch interaction
    scrollContainer.addEventListener('touchstart', handleInteractionStart, { passive: true });
    scrollContainer.addEventListener('touchend', handleInteractionEnd, { passive: true });
    scrollContainer.addEventListener('touchcancel', handleInteractionEnd, { passive: true });

    // Only pause ticker if user is actively scrolling (not just from ticker animation)
    let lastScrollLeft = scrollContainer.scrollLeft;
    let scrollCheckTimeout;

    scrollContainer.addEventListener('scroll', () => {
        const currentScrollLeft = scrollContainer.scrollLeft;

        // Only consider it user interaction if scroll position actually changed significantly
        if (Math.abs(currentScrollLeft - lastScrollLeft) > 5) {
            handleInteractionStart();

            // Clear previous timeout and set new one
            if (scrollCheckTimeout) {
                clearTimeout(scrollCheckTimeout);
            }

            scrollCheckTimeout = setTimeout(() => {
                handleInteractionEnd();
            }, 1000); // Resume ticker 1 second after scrolling stops
        }

        lastScrollLeft = currentScrollLeft;
    }, { passive: true });

    // Wheel events for desktop
    scrollContainer.addEventListener('wheel', (e) => {
        handleInteractionStart();

        // Allow smooth horizontal scrolling with wheel
        scrollContainer.scrollLeft += e.deltaY * 0.5;

        // Resume ticker after wheel interaction
        if (interactionTimeout) {
            clearTimeout(interactionTimeout);
        }
        interactionTimeout = setTimeout(() => {
            productScroll.style.animationPlayState = 'running';
            isUserInteracting = false;
        }, 1500);

        e.preventDefault();
    });
}

/*
========================================
SHOWCASE MODE MANAGEMENT
Intelligent automatic/manual mode switching
========================================
*/

/**
 * Initializes the intelligent showcase mode system
 * Handles automatic/manual mode transitions
 */
function initializeShowcaseMode() {
    const productScroll = document.getElementById('productScroll');
    const scrollContainer = productScroll?.parentElement;
    if (!productScroll || !scrollContainer) return;

    let isManualMode = false;
    let autoReturnTimeout;
    let hoverTimeout;

    // Configuration
    const config = {
        autoReturnDelay: 3000,
        hoverActivationDelay: 500,
        transitionDuration: 300
    };

    /**
     * Switches to manual mode
     */
    function activateManualMode() {
        if (isManualMode) return;

        isManualMode = true;
        productScroll.style.animationPlayState = 'paused';
        scrollContainer.style.cursor = 'grab';

        // Clear any existing timeout
        if (autoReturnTimeout) {
            clearTimeout(autoReturnTimeout);
        }

        console.log('Manual mode activated');
    }

    /**
     * Returns to automatic mode
     */
    function activateAutoMode() {
        if (!isManualMode) return;

        isManualMode = false;
        productScroll.style.animationPlayState = 'running';
        scrollContainer.style.cursor = '';

        console.log('Auto mode activated');
    }

    /**
     * Sets up auto-return timer
     */
    function setupAutoReturn() {
        if (autoReturnTimeout) {
            clearTimeout(autoReturnTimeout);
        }

        autoReturnTimeout = setTimeout(() => {
            activateAutoMode();
        }, config.autoReturnDelay);
    }

    // Hover intent detection (desktop)
    scrollContainer.addEventListener('mouseenter', () => {
        hoverTimeout = setTimeout(() => {
            activateManualMode();
        }, config.hoverActivationDelay);
    });

    scrollContainer.addEventListener('mouseleave', () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }
        setupAutoReturn();
    });

    // Touch intent detection (mobile)
    scrollContainer.addEventListener('touchstart', () => {
        activateManualMode();
    }, { passive: true });

    scrollContainer.addEventListener('touchend', () => {
        setupAutoReturn();
    }, { passive: true });

    // Scroll wheel intent detection
    scrollContainer.addEventListener('wheel', (e) => {
        activateManualMode();
        scrollContainer.scrollLeft += e.deltaY * 0.5;
        setupAutoReturn();
        e.preventDefault();
    });

    // Focus intent detection (accessibility)
    scrollContainer.addEventListener('focus', () => {
        activateManualMode();
    });

    scrollContainer.addEventListener('blur', () => {
        setupAutoReturn();
    });

    // Manual scrolling detection
    let lastScrollLeft = scrollContainer.scrollLeft;
    scrollContainer.addEventListener('scroll', () => {
        const currentScrollLeft = scrollContainer.scrollLeft;

        if (Math.abs(currentScrollLeft - lastScrollLeft) > 5) {
            activateManualMode();
            setupAutoReturn();
        }

        lastScrollLeft = currentScrollLeft;
    }, { passive: true });
}

/*
========================================
FORM VALIDATION SYSTEM
Real-time form validation with user feedback
========================================
*/

/**
 * Validates an individual form field
 * @param {Event} event - The field blur or input event
 * @returns {boolean} - True if field is valid, false otherwise
 */
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();

    // Remove existing error styling
    field.classList.remove('error');
    clearFieldError(field);

    // Validation rules
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }

    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }

    if (field.type === 'tel' && value && !isValidPhone(value)) {
        showFieldError(field, 'Please enter a valid phone number');
        return false;
    }

    return true;
}

/**
 * Clears field error state and message
 * @param {HTMLElement} field - The form field element
 */
function clearFieldError(field) {
    field.classList.remove('error');
    const errorMsg = field.parentNode.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

/**
 * Displays error message for a form field
 * @param {HTMLElement} field - The form field element
 * @param {string} message - The error message to display
 */
function showFieldError(field, message) {
    field.classList.add('error');

    // Remove existing error message
    clearFieldError(field);

    // Add new error message
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert'); // Accessibility

    field.parentNode.appendChild(errorElement);
}

/**
 * Clears all form errors
 * @param {HTMLFormElement} form - The form element
 */
function clearFormErrors(form) {
    const errorElements = form.querySelectorAll('.error-message');
    const errorFields = form.querySelectorAll('.error');

    errorElements.forEach(el => el.remove());
    errorFields.forEach(field => field.classList.remove('error'));
}

/**
 * Validates email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if email is valid, false otherwise
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates phone number format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if phone is valid, false otherwise
 */
function isValidPhone(phone) {
    // Allow international format, digits, spaces, hyphens, and parentheses
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

/*
========================================
PERFORMANCE OPTIMIZATION
Debouncing scroll events for better performance
========================================
*/

/**
 * Debounces a function to prevent excessive calls
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/*
========================================
IMAGE LOADING OPTIMIZATION
Lazy loading and error handling for images
========================================
*/

/**
 * Initializes image loading optimizations
 * Handles loading states and errors gracefully
 */
function initializeImageOptimizations() {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        // Set initial opacity for loading animation
        if (!img.complete) {
            img.style.opacity = '0';
        }

        // Handle successful image load
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });

        // Handle image load errors
        img.addEventListener('error', () => {
            console.warn('Image failed to load:', img.src);
            // You could set a fallback image here
            // img.src = '/images/fallback.jpg';
        });
    });
}

/*
========================================
ACCESSIBILITY ENHANCEMENTS
Keyboard navigation and screen reader support
========================================
*/

/**
 * Enhances form accessibility
 * Adds proper ARIA labels and keyboard navigation
 */
function enhanceAccessibility() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        // Add field validation event listeners
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);

        // Enhance keyboard navigation
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.type !== 'textarea') {
                e.preventDefault();
                const nextField = getNextFormField(input);
                if (nextField) {
                    nextField.focus();
                } else {
                    // Last field - focus submit button
                    const submitBtn = form.querySelector('.submit-btn');
                    if (submitBtn) submitBtn.focus();
                }
            }
        });
    });
}

/**
 * Gets the next form field for keyboard navigation
 * @param {HTMLElement} currentField - The current form field
 * @returns {HTMLElement|null} - The next form field or null
 */
function getNextFormField(currentField) {
    const form = currentField.closest('form');
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));
    const currentIndex = fields.indexOf(currentField);
    return fields[currentIndex + 1] || null;
}

/*
========================================
MOBILE MENU FUNCTIONALITY
Enhanced mobile navigation (for future use)
========================================
*/

/**
 * Initializes mobile menu functionality
 * Currently handles navigation button interactions
 */
function initializeMobileInteractions() {
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(btn => {
        // Add touch feedback
        btn.addEventListener('touchstart', () => {
            btn.style.transform = 'scale(0.95)';
        });

        btn.addEventListener('touchend', () => {
            btn.style.transform = '';
        });

        // Handle click events
        btn.addEventListener('click', () => {
            // Add ripple effect or other feedback if desired
            addClickFeedback(btn);
        });
    });
}

/**
 * Adds visual feedback for button clicks
 * @param {HTMLElement} button - The button element
 */
function addClickFeedback(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 100);
}

/**
 * Enables smooth horizontal scrolling with momentum
 * @param {HTMLElement} container - The scroll container
 */
function enableSmoothScrolling(container) {
    let isScrolling = false;
    let scrollVelocity = 0;
    let lastScrollLeft = container.scrollLeft;
    let lastTime = Date.now();

    function updateMomentum() {
        if (isScrolling) {
            const now = Date.now();
            const deltaTime = now - lastTime;
            const deltaScroll = container.scrollLeft - lastScrollLeft;

            scrollVelocity = deltaScroll / deltaTime;
            lastScrollLeft = container.scrollLeft;
            lastTime = now;

            requestAnimationFrame(updateMomentum);
        } else if (Math.abs(scrollVelocity) > 0.1) {
            // Apply momentum scrolling
            container.scrollLeft += scrollVelocity * 16; // 16ms frame time
            scrollVelocity *= 0.95; // Friction
            requestAnimationFrame(updateMomentum);
        }
    }

    container.addEventListener('touchstart', () => {
        isScrolling = true;
        scrollVelocity = 0;
        lastScrollLeft = container.scrollLeft;
        lastTime = Date.now();
        updateMomentum();
    }, { passive: true });

    container.addEventListener('touchend', () => {
        isScrolling = false;
    }, { passive: true });
}

/*
========================================
MAIN INITIALIZATION
Sets up all functionality when the page loads
========================================
*/

/*
========================================
HEADER NAVIGATION FUNCTIONALITY
Complete header navigation with WhatsApp integration
========================================
*/

// WhatsApp catalog configuration
const WHATSAPP_CATALOG_URL = "https://wa.me/c/919618519191";

/**
 * Check if user is on mobile device
 * @returns {boolean} True if mobile device detected
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

/**
 * Handle WhatsApp button click
 * Mobile: Direct to catalog, Desktop: Show QR modal
 */
function handleWhatsAppClick() {
    if (isMobileDevice()) {
        // Direct to WhatsApp catalog on mobile
        window.open(WHATSAPP_CATALOG_URL, '_blank', 'noopener,noreferrer');
    } else {
        // Show QR code modal on desktop
        showWhatsAppQR();
    }
}

/**
 * Show WhatsApp QR code modal for desktop users
 */
function showWhatsAppQR() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('whatsappQRModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'whatsappQRModal';
        modal.className = 'whatsapp-qr-modal';
        modal.innerHTML = `
            <div class="whatsapp-qr-backdrop"></div>
            <div class="whatsapp-qr-content">
                <button class="whatsapp-qr-close" onclick="closeWhatsAppQR()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="whatsapp-qr-header">
                    <i class="fab fa-whatsapp"></i>
                    <h3>Scan to Open Catalog</h3>
                    <p>Scan this QR code with your phone to view our products on WhatsApp</p>
                </div>
                <div class="whatsapp-qr-code">
                    <canvas id="qrCanvas"></canvas>
                </div>
                <div class="whatsapp-qr-footer">
                    <p>Or visit: <a href="${WHATSAPP_CATALOG_URL}" target="_blank">${WHATSAPP_CATALOG_URL}</a></p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add modal styles
        if (!document.getElementById('whatsapp-qr-styles')) {
            const styles = document.createElement('style');
            styles.id = 'whatsapp-qr-styles';
            styles.textContent = `
                .whatsapp-qr-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 1;
                    visibility: visible;
                    transition: all 0.3s ease;
                }
                .whatsapp-qr-modal.hidden {
                    opacity: 0;
                    visibility: hidden;
                }
                .whatsapp-qr-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                }
                .whatsapp-qr-content {
                    position: relative;
                    background: white;
                    border-radius: 1rem;
                    padding: 2rem;
                    max-width: 400px;
                    width: 90vw;
                    text-align: center;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }
                .whatsapp-qr-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #666;
                    transition: color 0.2s ease;
                }
                .whatsapp-qr-close:hover {
                    color: #333;
                }
                .whatsapp-qr-header i {
                    font-size: 3rem;
                    color: #25D366;
                    margin-bottom: 1rem;
                }
                .whatsapp-qr-header h3 {
                    margin: 0 0 0.5rem 0;
                    color: #333;
                }
                .whatsapp-qr-header p {
                    margin: 0 0 2rem 0;
                    color: #666;
                    font-size: 0.9rem;
                }
                .whatsapp-qr-code {
                    margin: 2rem 0;
                }
                .whatsapp-qr-code canvas {
                    max-width: 200px;
                    height: auto;
                }
                .whatsapp-qr-footer p {
                    font-size: 0.8rem;
                    color: #666;
                    margin: 0;
                }
                .whatsapp-qr-footer a {
                    color: #0077B6;
                    text-decoration: none;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Generate QR code if library is available
    if (typeof QRCode !== 'undefined') {
        const canvas = document.getElementById('qrCanvas');
        if (canvas) {
            QRCode.toCanvas(canvas, WHATSAPP_CATALOG_URL, { width: 200 }, function (error) {
                if (error) console.error('QR Code generation error:', error);
            });
        }
    } else {
        // Fallback if QR library not available
        document.querySelector('.whatsapp-qr-code').innerHTML = `
            <p style="color: #666; font-size: 0.9rem;">QR Code library not loaded.<br>
            <a href="${WHATSAPP_CATALOG_URL}" target="_blank" style="color: #25D366;">Click here to open catalog</a></p>
        `;
    }
}

/*
========================================
Close WhatsApp QR Modal
========================================
*/
function closeWhatsAppQR() {
    const modal = document.getElementById('whatsappQRModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

/**
 * Toggle mobile navigation menu
 */
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const hamburgerBtn = document.getElementById('hamburgerBtn');

    if (!mobileNav || !hamburgerBtn) return;

    const isOpen = mobileNav.classList.contains('show');

    if (isOpen) {
        mobileNav.classList.remove('show');
        hamburgerBtn.classList.remove('active');
        document.body.style.overflow = '';
    } else {
        mobileNav.classList.add('show');
        hamburgerBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close mobile navigation menu
 */
function closeMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const hamburgerBtn = document.getElementById('hamburgerBtn');

    if (!mobileNav || !hamburgerBtn) return;

    mobileNav.classList.remove('show');
    hamburgerBtn.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Handle navigation button clicks
 * @param {string} target - Target section to scroll to
 */
function handleNavigation(target) {
    scrollToSection(target);
    closeMobileMenu();
}

/**
 * Initialize header navigation functionality
 * Sets up all event listeners for navigation buttons
 */
function initializeHeaderNavigation() {
    // Query all button elements
    const productsBtn = document.getElementById('productsBtn');
    const contactBtn = document.getElementById('contactBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const hamburgerBtn = document.getElementById('hamburgerBtn');

    // Desktop navigation buttons
    if (productsBtn) {
        productsBtn.addEventListener('click', () => handleNavigation('product-categories'));
    }

    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            console.log('Desktop contact button clicked');
            handleNavigation('footer-contact');
        });
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', handleWhatsAppClick);
    }

    // Hamburger menu button
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', toggleMobileMenu);
    }

    // Mobile navigation buttons
    const mobileProductsBtn = document.getElementById('mobileProductsBtn');
    const mobileContactBtn = document.getElementById('mobileContactBtn');
    const mobileWhatsappBtn = document.getElementById('mobileWhatsappBtn');

    if (mobileProductsBtn) {
        mobileProductsBtn.addEventListener('click', () => handleNavigation('product-categories'));
    }

    if (mobileContactBtn) {
        mobileContactBtn.addEventListener('click', () => {
            console.log('Mobile contact button clicked');
            handleNavigation('footer-contact');
        });
    }

    if (mobileWhatsappBtn) {
        mobileWhatsappBtn.addEventListener('click', handleWhatsAppClick);
    }

    // Click outside to close mobile menu
    document.addEventListener('click', (e) => {
        const mobileNav = document.getElementById('mobileNav');
        const hamburgerBtn = document.getElementById('hamburgerBtn');

        if (!mobileNav || !hamburgerBtn) return;

        const isMenuOpen = mobileNav.classList.contains('show');
        const isClickOnMenu = mobileNav.contains(e.target);
        const isClickOnHamburger = hamburgerBtn.contains(e.target);

        if (isMenuOpen && !isClickOnMenu && !isClickOnHamburger) {
            closeMobileMenu();
        }
    });

    // Click outside to close WhatsApp QR modal
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('whatsappQRModal');
        if (modal && e.target.classList.contains('whatsapp-qr-backdrop')) {
            closeWhatsAppQR();
        }
    });

    // ESC key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
            closeWhatsAppQR();

            // Close any open product overlays
            const openCard = document.querySelector('.master-card.show-product');
            if (openCard) {
                const category = openCard.dataset.category;
                const selectId = `select-${category}`;
                // Usage of existing closeOverlay function if available
                if (typeof window.closeOverlay === 'function') {
                    window.closeOverlay(category, selectId);
                }
            }
        }
    });
}

/*
========================================
MAIN INITIALIZATION FUNCTION
========================================
*/

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize header navigation
    initializeHeaderNavigation();

    // Initialize other functionality
    initializeScrollAnimations();
    initializeProductShowcaseControls();
    initializeMobileInteractions();
    enhanceAccessibility();
    initializeImageOptimizations();

    // Fetch site settings first, then render
    await fetchSiteSettings();

    // Fetch and render products (includes categories)
    fetchAndRenderProducts();
    fetchAndRenderTestimonials();

    // Setup form validation if contact form exists
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }

    console.log('All functionality initialized successfully');
});

// Handle page visibility changes (for performance optimization)
document.addEventListener('visibilitychange', () => {
    const productScroll = document.getElementById('productScroll');

    if (productScroll) {
        if (document.hidden) {
            // Page is hidden - pause animations to save resources
            productScroll.style.animationPlayState = 'paused';
        } else {
            // Page is visible - resume ticker animation
            productScroll.style.animationPlayState = 'running';
        }
    }
});

// Add scroll header effects
let lastScrollY = window.scrollY;
// Removed scroll effects to keep header persistent as requested

// Handle connection changes (for progressive enhancement)
if ('connection' in navigator) {
    navigator.connection.addEventListener('change', () => {
        // Could adjust image quality or disable heavy animations on slow connections
        console.log('Connection changed:', navigator.connection.effectiveType);
    });
}

// Make functions globally available
window.closeWhatsAppQR = closeWhatsAppQR;
window.closeMobileMenu = closeMobileMenu;

// Global settings cache
window.currentSiteSettings = {};

/**
 * Fetches site settings and applies them
 */
async function fetchSiteSettings() {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .single();

        if (error) {
            console.warn('Could not fetch site settings:', error);
            return null;
        }

        if (data) {
            window.currentSiteSettings = data; // Cache globally

            // Title
            if (data.site_title) document.title = data.site_title;

            // Logo
            if (data.logo_url) {
                const logoImgs = document.querySelectorAll('.logo');
                logoImgs.forEach(img => img.src = data.logo_url);
            }

            // Favicon
            if (data.fav_icon_url) {
                const link = document.querySelector("link[rel~='icon']");
                if (link) link.href = data.fav_icon_url;
            }

            // Hero
            if (data.hero_title) document.getElementById('hero-title').innerText = data.hero_title;
            if (data.hero_subtitle) document.getElementById('hero-subtitle').innerText = data.hero_subtitle;
            if (data.hero_telugu_subtitle) document.getElementById('hero-telugu-subtitle').innerText = data.hero_telugu_subtitle;

            // Hero Description (Replace paragraph content or container)
            if (data.hero_description) {
                const descContainer = document.getElementById('hero-description-container');
                if (descContainer) {
                    // Update the paragraph inside
                    descContainer.innerHTML = `<p class="hero-subtitle">${data.hero_description}</p>`;
                }
            }

            // Hero Background
            if (data.hero_background_url) {
                const heroSection = document.querySelector('.hero');
                if (heroSection) heroSection.style.backgroundImage = `url('${data.hero_background_url}')`;
            }

            // Contact Info
            if (data.contact_phone_primary) {
                const el = document.getElementById('contact-phone-primary');
                if (el) { el.innerText = data.contact_phone_primary; el.href = `tel:${data.contact_phone_primary.replace(/\s/g, '')}`; }
            }
            if (data.contact_phone_secondary) {
                const el = document.getElementById('contact-phone-secondary');
                if (el) { el.innerText = data.contact_phone_secondary; el.href = `tel:${data.contact_phone_secondary.replace(/\s/g, '')}`; }
            }
            if (data.contact_email) {
                const el = document.getElementById('contact-email');
                if (el) { el.innerText = data.contact_email; el.href = `mailto:${data.contact_email}`; }
            }
            if (data.fssai_number) {
                const el = document.getElementById('contact-fssai');
                if (el) el.innerText = `FSSAI License No: ${data.fssai_number}`;
            }
            if (data.address_line1 || data.address_line2) {
                const el = document.getElementById('contact-address');
                if (el) {
                    el.innerHTML = `
                        <p>${data.address_line1 || ''}</p>
                        <p>${data.address_line2 || ''}</p>
                    `;
                }
            }

            // Map
            if (data.map_embed_url) {
                const mapContainer = document.getElementById('footer-map-container');
                if (mapContainer) {
                    let mapSrc = data.map_embed_url;
                    // Extract src if user pasted full iframe tag
                    if (mapSrc.includes('<iframe')) {
                        const match = mapSrc.match(/src=["']([^"']+)["']/);
                        if (match && match[1]) {
                            mapSrc = match[1];
                        }
                    }
                    mapContainer.innerHTML = `<iframe src="${mapSrc}" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
                }
            }
        }
        return data;

    } catch (err) {
        console.error('Error in fetchSiteSettings:', err);
        return null;
    }
}

/**
 * Fetches categories from Supabase
 */
async function fetchCategories() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching categories:', err);
        return [];
    }
}

/**
 * Fetches products from Supabase and renders them to the DOM
 */
async function fetchAndRenderProducts() {
    try {
        // Parallel fetch for speed
        const [productsResp, categories] = await Promise.all([
            supabase.from('products').select('*').order('created_at', { ascending: true }),
            fetchCategories()
        ]);

        const products = productsResp.data;
        const productsError = productsResp.error;


        if (productsError) {
            console.error('Supabase Error:', productsError);
            showToast('Error loading products: ' + productsError.message, 'error');
            throw productsError;
        }

        if (!products || products.length === 0) {
            console.log('No products found in database');
            showToast('Database connected but no products found.', 'info');
        }

        renderProducts(products || [], categories);

        // Re-initialize animations and controls after rendering
        setTimeout(() => {
            initializeScrollAnimations();
            initializeProductShowcaseControls();
        }, 100);

    } catch (err) {
        console.error('Error fetching data:', err);
        showToast('System Error: ' + err.message, 'error');
    }
}

/**
 * Renders products into the dynamic category layouts
 * @param {Array} products - Array of product objects
 * @param {Array} categories - Array of category objects
 */
function renderProducts(products, categories) {
    const productScroll = document.getElementById('productScroll');
    const categoriesContainer = document.getElementById('categories-container');

    // 1. Render to Showcase Ticker
    if (productScroll) {
        productScroll.innerHTML = '';
        products.forEach(product => {
            const showcaseItem = document.createElement('div');
            showcaseItem.className = 'product-item';

            // Allow dynamic placeholder from site settings if needed, but for now specific or default
            let localImage = product.showcase_image;
            if (!localImage) {
                localImage = window.currentSiteSettings?.product_placeholder_url;
            }

            showcaseItem.innerHTML = `
                <img src="${localImage}" alt="${product.product_name}" onerror="this.src='${window.currentSiteSettings?.product_placeholder_url}'">
                <h3>${product.product_name}</h3>
                <p class="telugu-name">${product.product_name_telugu || product.product_tagline || ''}</p>
            `;
            productScroll.appendChild(showcaseItem);
        });

        // Duplicate for seamless scrolling
        if (products.length > 0) {
            const items = Array.from(productScroll.children);
            items.forEach(item => productScroll.appendChild(item.cloneNode(true)));
        }
    }

    // 2. Render Categories
    if (categoriesContainer && categories.length > 0) {
        categoriesContainer.innerHTML = '';

        categories.forEach(category => {
            // Filter products for this category
            // Normalize slug and product category string comparison
            const catProducts = products.filter(p => {
                const pCat = (p.product_category || '').toLowerCase().trim().replace(/\s+/g, '-');
                return pCat === category.slug;
            });

            // Create Category Card HTML
            const card = document.createElement('div');
            card.className = 'master-card';
            card.dataset.category = category.slug;

            const cardImage = category.image_url || `./images/categories/${category.slug}.jpg`; // Fallback to local convention if new URL empty

            card.innerHTML = `
                <div class="card-face card-front">
                    <div class="card-hero-image">
                        <img src="${cardImage}" alt="${category.title}" onerror="this.src='./images/placeholder-product-portrait.jpg'">
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${category.title}</h3>
                        <p class="telugu-subtitle">${category.telugu_title || ''}</p>
                        <p class="card-desc">${category.description || ''}</p>
                        <div class="dropdown-wrapper">
                            <select class="product-select" id="select-${category.slug}">
                                <option value="" disabled selected>Select Product</option>
                            </select>
                            <i class="fas fa-chevron-down dropdown-icon"></i>
                        </div>
                    </div>
                </div>
                <!-- Back Face (Overlay) -->
                <div class="card-face card-back" id="view-${category.slug}"></div>
            `;

            categoriesContainer.appendChild(card);

            // Populate Dropdown
            const selectEl = card.querySelector(`#select-${category.slug}`);
            const viewContainer = card.querySelector(`#view-${category.slug}`);

            if (selectEl) {
                catProducts.forEach(product => {
                    const opt = document.createElement('option');
                    opt.value = product.id;
                    const telugu = product.product_name_telugu ? ` (${product.product_name_telugu})` : '';
                    opt.textContent = `${product.product_name}${telugu}`;
                    selectEl.appendChild(opt);
                });

                // Add Change Listener
                selectEl.addEventListener('change', (e) => {
                    const selectedId = e.target.value;
                    const currentIndex = catProducts.findIndex(p => p.id === selectedId);
                    const product = catProducts[currentIndex];

                    if (product) {
                        renderOverlayProduct(product, viewContainer, selectEl, card, catProducts, currentIndex);
                    }
                });
            }
        });
    } else if (categoriesContainer) {
        categoriesContainer.innerHTML = '<p style="text-align:center; padding: 2rem;">No categories found.</p>';
    }

}

function renderOverlayProduct(product, container, selectEl, cardElement, allProducts = [], currentIndex = -1) {
    const contentIngId = `content-ing-${product.id}`;
    const contentNutId = `content-nut-${product.id}`;
    const categoryName = cardElement.dataset.category;

    let localImage = product.showcase_image;
    const pName = product.product_name.toLowerCase();
    if (!localImage) {
        // Fallback to generic placeholders if no specific image is set
        localImage = window.currentSiteSettings?.product_placeholder_url;
    }

    let nutInfo = {};
    try { nutInfo = typeof product.nutrition_info === 'string' ? JSON.parse(product.nutrition_info) : product.nutrition_info; } catch (e) { nutInfo = {}; }

    let variants = [];
    try { variants = typeof product.quantity_variants === 'string' ? JSON.parse(product.quantity_variants) : product.quantity_variants; } catch (e) { variants = []; }

    // Generate quantities text
    let quantitiesText = '';
    if (variants && variants.length > 0) {
        quantitiesText = variants.map(v => v.quantity).join(', ');
    } else {
        quantitiesText = product.net_weight || 'Standard';
    }

    // Navigation Logic
    let navButtons = '';
    if (allProducts.length > 1 && currentIndex !== -1) {
        const prevIndex = (currentIndex - 1 + allProducts.length) % allProducts.length;
        const nextIndex = (currentIndex + 1) % allProducts.length;
        const prevProduct = allProducts[prevIndex];
        const nextProduct = allProducts[nextIndex];

        navButtons = `
            <div class="overlay-nav-controls">
                <button class="nav-arrow-btn prev-btn" onclick="switchProduct('${categoryName}', '${prevProduct.id}')" aria-label="Previous Product">
                    <i class="fas fa-chevron-left"></i> Prev
                </button>
                <span class="nav-label">Other Products</span>
                <button class="nav-arrow-btn next-btn" onclick="switchProduct('${categoryName}', '${nextProduct.id}')" aria-label="Next Product">
                    Next <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    // HTML Structure for BACK face
    container.innerHTML = `
        <div class="back-btn-wrapper">
             <button class="back-btn" onclick="closeOverlay('${cardElement.dataset.category}', '${selectEl.id}')">
                <i class="fas fa-arrow-left"></i> Back to ${cardElement.querySelector('.card-title').innerText}
            </button>
        </div>
        <div class="revealed-product">
            <img src="${localImage}" class="revealed-img" alt="${product.product_name}" onerror="this.src='${window.currentSiteSettings?.product_placeholder_url}'">
            <div class="revealed-info">
                <h4>${product.product_name}</h4>
                <p class="revealed-tagline">${product.product_tagline || ''}</p>
                <p class="card-desc" style="margin-bottom: 15px;">${product.product_description || ''}</p>
                
                <div class="info-toggles">
                    <button class="toggle-btn" onclick="toggleInfo('${contentIngId}', this)">View Ingredients</button>
                    ${Object.keys(nutInfo).length > 0 ? `<button class="toggle-btn" onclick="toggleInfo('${contentNutId}', this)">Nutrition Info</button>` : ''}
                </div>

                <div id="${contentIngId}" class="info-content-box" style="display: none;">
                    <strong>Ingredients:</strong><br>
                    ${product.ingredients || 'Not listed'}
                </div>

                <div id="${contentNutId}" class="info-content-box" style="display: none;">
                    <strong>Nutrition (per serving):</strong><br>
                    ${nutInfo.details ? `<em>${nutInfo.details}</em><br>` : ''}
                    ${nutInfo.calories ? `Calories: ${nutInfo.calories}<br>` : ''}
                    ${nutInfo.protein ? `Protein: ${nutInfo.protein}<br>` : ''}
                    ${nutInfo.satFat ? `Saturated Fat: ${nutInfo.satFat}<br>` : ''}
                    ${nutInfo.fat ? `Total Fat: ${nutInfo.fat}<br>` : ''}
                    ${nutInfo.carbs ? `Carbs: ${nutInfo.carbs}<br>` : ''}
                    ${nutInfo.fiber ? `Fiber: ${nutInfo.fiber}<br>` : ''}
                    ${nutInfo.sugars ? `Sugars: ${nutInfo.sugars}<br>` : ''}
                    ${nutInfo.sodium ? `Sodium: ${nutInfo.sodium}<br>` : ''}
                </div>

                <div class="variant-info" style="margin-bottom: 20px;">
                    <span style="font-weight: 600; color: var(--text-primary);">Available From: </span>
                    <span style="color: var(--text-secondary);">${quantitiesText}</span>
                </div>

                <button class="add-btn" onclick="window.open('${WHATSAPP_CATALOG_URL}', '_blank')">
                    <i class="fab fa-whatsapp"></i> Buy on WhatsApp
                </button>
            </div>
            ${navButtons}
        </div>
    `;

    // Trigger Overlay
    // Force a reflow to ensure transitions work if needed, though simple class add is usually fine
    requestAnimationFrame(() => {
        cardElement.classList.add('show-product');
    });
}

// Function to close overlay
window.closeOverlay = function (category, selectId) {
    const card = document.querySelector(`.master-card[data-category="${category}"]`);
    if (card) {
        card.classList.remove('show-product');
        // Reset dropdown
        const select = document.getElementById(selectId);
        if (select) select.value = "";
    }
};

// Global toggle function
window.toggleInfo = function (contentId, btn) {
    const box = document.getElementById(contentId);
    if (box.style.display === 'none') {
        box.style.display = 'block';
        btn.classList.add('active');
        btn.innerText = 'Hide ' + btn.innerText.replace('View ', '');
    } else {
        box.style.display = 'none';
        btn.classList.remove('active');
        btn.innerText = btn.innerText.replace('Hide ', 'View ');
    }
};

// Global switch product function
window.switchProduct = function (category, productId) {
    const selectId = `select-${category}`;
    const selectEl = document.getElementById(selectId);
    if (selectEl) {
        selectEl.value = productId;
        // Dispatch event to trigger listeners
        selectEl.dispatchEvent(new Event('change'));
    }
};

/*
========================================
TESTIMONIALS FUNCTIONALITY
========================================
*/

async function fetchAndRenderTestimonials() {
    const testimonialContainer = document.getElementById('testimonialsScroll');
    if (!testimonialContainer) return;

    try {
        console.log('Fetching testimonials...');
        const { data: testimonials, error } = await supabase
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!testimonials || testimonials.length === 0) {
            testimonialContainer.innerHTML = `
                <div class="testimonial-item">
                     <div class="testimonial-content">
                        <p style="text-align: center;">No reviews yet.</p>
                    </div>
                </div>`;
            return;
        }

        testimonialContainer.innerHTML = '';

        // Render function
        const createItem = (t) => {
            const div = document.createElement('div');
            div.className = 'testimonial-item';
            div.innerHTML = `
                <div class="testimonial-content">
                    <div class="stars">${'★'.repeat(t.rating)}</div>
                    <p>"${t.message}"</p>
                    <div class="testimonial-author">
                        <strong>${t.name}</strong>
                        <span>${t.location || ''}</span>
                    </div>
                </div>
             `;
            return div;
        };

        testimonials.forEach(t => {
            testimonialContainer.appendChild(createItem(t));
        });

        // Duplicate for infinite scroll if needed (e.g. if count is small but > 0)
        if (testimonials.length > 0) {
            const items = Array.from(testimonialContainer.children);
            items.forEach(item => testimonialContainer.appendChild(item.cloneNode(true)));
        }

    } catch (error) {
        console.error('Error fetching testimonials:', error);
        testimonialContainer.innerHTML = `
            <div class="testimonial-item">
                 <div class="testimonial-content">
                    <p style="color: red; text-align: center;">Unable to load reviews.</p>
                </div>
            </div>`;
    }
}