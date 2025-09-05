/**
 * Denny Vaughan Website - Main JavaScript File
 * 
 * This file contains all the interactive functionality for the Denny Vaughan memorial website.
 * It includes navigation, animations, audio player system, and various UI enhancements.
 * 
 * Key Features:
 * - Mobile navigation toggle
 * - Smooth scrolling navigation
 * - Global audio player system
 * - Gallery lightbox functionality
 * - Timeline animations
 * - Vintage photo effects
 * - Typing animations
 * - Scroll progress indicator
 * 
 * @author Denny Vaughan Memorial
 * @version 1.0
 * @since 2024
 */

// ============================================================================
// MOBILE NAVIGATION SYSTEM
// ============================================================================

/**
 * Mobile Navigation Toggle
 * Handles the hamburger menu functionality for mobile devices
 * Toggles the navigation menu visibility and handles click events
 */
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        // Toggle menu when hamburger is clicked
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a navigation link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside the navigation area
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
});

// ============================================================================
// SMOOTH SCROLLING NAVIGATION
// ============================================================================

/**
 * Smooth Scrolling for Navigation Links
 * Provides smooth scrolling animation when clicking on anchor links
 * Targets all links that start with '#' (internal page links)
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================================================
// NAVBAR BACKGROUND EFFECTS
// ============================================================================

/**
 * Navbar Background Change on Scroll
 * Changes the navbar background opacity and blur effect based on scroll position
 * Creates a dynamic visual effect as users scroll down the page
 */
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        // Scrolled down - more transparent with increased blur
        navbar.style.background = 'rgba(139, 38, 53, 0.95)';
        navbar.style.backdropFilter = 'blur(15px)';
    } else {
        // At top - solid background with subtle blur
        navbar.style.background = 'linear-gradient(135deg, var(--burgundy) 0%, var(--dark-burgundy) 100%)';
        navbar.style.backdropFilter = 'blur(10px)';
    }
});

// ============================================================================
// SCROLL ANIMATIONS SYSTEM
// ============================================================================

/**
 * Intersection Observer Configuration
 * Defines how elements should be animated when they come into view
 */
const observerOptions = {
    threshold: 0.1,        // Trigger when 10% of element is visible
    rootMargin: '0px 0px -50px 0px'  // Start animation 50px before element enters viewport
};

/**
 * Intersection Observer for Scroll Animations
 * Animates elements as they come into view during scrolling
 * Provides fade-in and slide-up effects for various page elements
 */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

/**
 * Initialize Scroll Animations
 * Sets up elements to be animated when they come into view
 * Targets biography highlights, timeline items, gallery items, and legacy highlights
 */
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.bio-highlight, .timeline-item, .gallery-item, .highlight-item');
    
    animatedElements.forEach(el => {
        // Set initial state (hidden and moved down)
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        // Start observing the element
        observer.observe(el);
    });
});

// ============================================================================
// PARALLAX EFFECTS
// ============================================================================

/**
 * Parallax Effect for Hero Section
 * Creates a subtle parallax scrolling effect for the hero section content
 * Makes the hero text move at a different rate than the background
 */
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    if (hero && heroContent) {
        const rate = scrolled * -0.5;  // Negative rate creates upward movement
        heroContent.style.transform = `translateY(${rate}px)`;
    }
});

// ============================================================================
// ELEGANT BACKGROUND PATTERN
// ============================================================================

/**
 * Add Elegant Background Pattern
 * Creates a decorative background pattern for the hero section
 * Enhances the vintage aesthetic of the website
 */
function addElegantPattern() {
    const hero = document.querySelector('.hero');
    if (hero) {
        const pattern = document.createElement('div');
        pattern.className = 'elegant-pattern';
        hero.appendChild(pattern);
    }
}

// Initialize elegant pattern when page loads
document.addEventListener('DOMContentLoaded', addElegantPattern);


// ============================================================================
// GALLERY LIGHTBOX SYSTEM
// ============================================================================

/**
 * Gallery Lightbox Effect
 * Creates a full-screen lightbox for viewing gallery images
 * Includes close button, caption display, and smooth animations
 */
document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('click', () => {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <img src="${img.src}" alt="${img.alt}">
                <div class="lightbox-caption">${img.nextElementSibling.textContent}</div>
                <button class="lightbox-close">&times;</button>
            </div>
        `;
        
        // Style the lightbox container
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // Style the lightbox content
        lightbox.querySelector('.lightbox-content').style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
            text-align: center;
        `;
        
        // Style the image
        lightbox.querySelector('img').style.cssText = `
            max-width: 100%;
            max-height: 80vh;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;
        
        // Style the caption
        lightbox.querySelector('.lightbox-caption').style.cssText = `
            color: white;
            margin-top: 15px;
            font-size: 1.1rem;
            font-weight: 600;
        `;
        
        // Style the close button
        lightbox.querySelector('.lightbox-close').style.cssText = `
            position: absolute;
            top: -40px;
            right: 0;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            padding: 10px;
        `;
        
        document.body.appendChild(lightbox);
        
        // Fade in the lightbox
        setTimeout(() => {
            lightbox.style.opacity = '1';
        }, 10);
        
        // Handle closing the lightbox
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.className === 'lightbox-close') {
                lightbox.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(lightbox);
                }, 300);
            }
        });
    });
});

// ============================================================================
// TIMELINE ANIMATION SYSTEM
// ============================================================================

/**
 * Timeline Animation Observer
 * Creates staggered animations for timeline items as they come into view
 */
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const timelineItems = entry.target.querySelectorAll('.timeline-item');
            timelineItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                }, index * 200); // Stagger animation by 200ms per item
            });
        }
    });
}, { threshold: 0.3 });

/**
 * Initialize Timeline Animations
 * Sets up timeline items for animation when they come into view
 */
document.addEventListener('DOMContentLoaded', () => {
    const timeline = document.querySelector('.timeline-container');
    if (timeline) {
        const timelineItems = timeline.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            // Set initial state (hidden and moved left)
            item.style.opacity = '0';
            item.style.transform = 'translateX(-50px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });
        timelineObserver.observe(timeline);
    }
});

// ============================================================================
// VINTAGE PHOTO EFFECTS
// ============================================================================

/**
 * Add Vintage Photo Effect
 * Applies vintage-style hover effects to photos
 * Enhances the nostalgic aesthetic of the website
 */
function addVintageEffect() {
    const images = document.querySelectorAll('.vintage-photo');
    images.forEach(img => {
        img.addEventListener('mouseenter', () => {
            img.style.filter = 'sepia(0.5) contrast(1.2) brightness(0.9)';
        });
        
        img.addEventListener('mouseleave', () => {
            img.style.filter = 'sepia(0.3) contrast(1.1)';
        });
    });
}

document.addEventListener('DOMContentLoaded', addVintageEffect);

// ============================================================================
// TYPING ANIMATION SYSTEM
// ============================================================================

/**
 * Typewriter Effect
 * Creates a typewriter-style animation for text elements
 * @param {HTMLElement} element - The element to animate
 * @param {string} text - The text to type out
 * @param {number} speed - Speed of typing in milliseconds
 */
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

/**
 * Initialize Typing Effect
 * Applies the typewriter effect to the hero title
 */
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 150);
        }, 1000); // Start typing after 1 second
    }
});

// ============================================================================
// SCROLL PROGRESS INDICATOR
// ============================================================================

/**
 * Create Scroll Progress Bar
 * Adds a progress bar at the top of the page that shows scroll progress
 * Provides visual feedback for page navigation
 */
function createScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--deep-gold), var(--burgundy));
        z-index: 10001;
        transition: width 0.1s ease;
    `;
    
    document.body.appendChild(progressBar);
    
    // Update progress bar on scroll
    window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

document.addEventListener('DOMContentLoaded', createScrollProgress);

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

/**
 * Keyboard Navigation
 * Adds keyboard shortcuts for common actions
 * Currently supports ESC key to close lightbox
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const lightbox = document.querySelector('.lightbox');
        if (lightbox) {
            lightbox.click();
        }
    }
});

// ============================================================================
// PAGE LOADING ANIMATION
// ============================================================================

/**
 * Page Loading Animation
 * Creates a fade-in effect when the page loads
 * Provides smooth visual transition
 */
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// ============================================================================
// HOVER EFFECTS
// ============================================================================

/**
 * Add Hover Effects
 * Applies subtle scale effects to interactive elements
 * Enhances user experience with visual feedback
 */
document.addEventListener('DOMContentLoaded', () => {
    const interactiveElements = document.querySelectorAll('.nav-menu a, .hero-quote, .bio-highlight, .timeline-year, .gallery-item, .highlight-item');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.transform = element.style.transform + ' scale(1.02)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = element.style.transform.replace(' scale(1.02)', '');
        });
    });
});

// ============================================================================
// END OF SCRIPT
// ============================================================================

// Re-initialize key behaviors after PJAX content swap
document.addEventListener('pjax:load', () => {
    // Re-attach animations to new elements
    const animatedElements = document.querySelectorAll('.bio-highlight, .timeline-item, .gallery-item, .highlight-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Reinitialize timeline animations if present
    const timeline = document.querySelector('.timeline-container');
    if (timeline) {
        const timelineItems = timeline.querySelectorAll('.timeline-item');
        timelineItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-50px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });
        timelineObserver.observe(timeline);
    }

    // Re-apply vintage effect listeners
    try { addVintageEffect(); } catch (e) {}
});

// ----------------------------------------------------------------------------
// Navbar active link highlighting (works on load and after PJAX)
// ----------------------------------------------------------------------------
function updateActiveNav() {
    try {
        const links = document.querySelectorAll('.navbar .nav-menu a');
        if (!links.length) return;
        let currentPath = window.location.pathname || '/';
        if (currentPath !== '/' && currentPath.endsWith('/')) currentPath = currentPath.slice(0, -1);
        links.forEach(link => {
            const href = link.getAttribute('href') || '';
            let isActive = false;
            if (href.startsWith('#')) {
                isActive = (currentPath === '/' && (href === '#home' || href === '#'));
            } else {
                const url = new URL(href, window.location.origin);
                let linkPath = url.pathname || '/';
                if (linkPath !== '/' && linkPath.endsWith('/')) linkPath = linkPath.slice(0, -1);
                isActive = (linkPath === currentPath);
            }
            link.classList.toggle('active', isActive);
        });
    } catch (_) {}
}

document.addEventListener('DOMContentLoaded', () => { try { updateActiveNav(); } catch(_){} });
document.addEventListener('pjax:load', () => { try { setTimeout(updateActiveNav, 0); } catch(_){} });
