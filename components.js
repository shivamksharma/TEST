/**
 * Dynamic Component Loader
 * Loads navbar and footer HTML dynamically using fetch API
 * Works on static hosting without server-side includes
 */

class ComponentLoader {
  constructor() {
    this.loadedComponents = new Set();
    this.init();
  }

  /**
   * Initialize the component loader
   */
  init() {
    // Load components when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.loadComponents());
    } else {
      this.loadComponents();
    }
  }

  /**
   * Load all components (navbar and footer)
   */
  async loadComponents() {
    try {
      await Promise.all([
        this.loadComponent('navbar'), // Navbar HTML is now inline in the method
        this.loadComponent('footer', 'footer.html')
      ]);

      // Initialize navbar functionality after loading
      this.initializeNavbarScripts();

    } catch (error) {
      console.error('Error loading components:', error);
      this.handleLoadError();
    }
  }

  /**
   * Load a single component
   * @param {string} componentName - Name of the component (navbar/footer)
   * @param {string} filePath - Path to the HTML file (optional for navbar)
   */
  async loadComponent(componentName, filePath) {
    const placeholder = document.getElementById(componentName);

    if (!placeholder) {
      console.warn(`Placeholder for ${componentName} not found`);
      return;
    }

    try {
      let html;
      if (filePath) {
        const response = await fetch(filePath);

        if (!response.ok) {
          throw new Error(`Failed to load ${filePath}: ${response.status}`);
        }

        html = await response.text();
      } else {
        // Inline HTML for navbar
        html = this.getNavbarHTML();
      }
      placeholder.innerHTML = html;
      this.loadedComponents.add(componentName);

    } catch (error) {
      console.error(`Error loading ${componentName}:`, error);
      placeholder.innerHTML = this.getFallbackContent(componentName);
    }
  }

  /**
   * Initialize navbar-specific JavaScript functionality
   */
  initializeNavbarScripts() {
    if (!this.loadedComponents.has('navbar')) return;

    // Navigation functionality (extracted from scripts.js)
    this.initNavigation();
  }

  /**
   * Initialize navigation functionality
   */
  initNavigation() {
    const nav = document.getElementById('global-nav');
    const toggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const dropdowns = document.querySelectorAll('[data-dropdown]');
    const dropdownTriggers = document.querySelectorAll('[data-dropdown-trigger]');
    const mobileDropdowns = document.querySelectorAll('[data-mobile-dropdown]');

    // Set navigation sticky state based on scroll
    const setNavState = () => {
      if (!nav) return;
      nav.classList.toggle('is-sticky', window.scrollY > 12);
    };

    // Close mobile menu
    const closeMobileMenu = () => {
      if (!mobileMenu || !toggle) return;
      mobileMenu.classList.add('hidden');
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    // Close all dropdown menus
    const closeAllDropdowns = (exception) => {
      dropdowns.forEach((dropdown) => {
        if (dropdown !== exception) {
          dropdown.classList.remove('is-open');
          const trigger = dropdown.querySelector('[data-dropdown-trigger]');
          if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
          }
        }
      });
    };

    // Initialize navigation state
    setNavState();

    // Add event listeners
    window.addEventListener('scroll', setNavState);

    // Mobile menu toggle functionality
    if (toggle && mobileMenu) {
      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));

        if (expanded) {
          mobileMenu.classList.add('hidden');
          document.body.classList.remove('nav-open');
        } else {
          mobileMenu.classList.remove('hidden');
          document.body.classList.add('nav-open');
        }
      });

      // Close mobile menu when clicking on links
      mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          closeMobileMenu();
        });
      });
    }

    // Desktop dropdown functionality
    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const dropdown = trigger.closest('[data-dropdown]');
        if (!dropdown) return;

        const isOpen = dropdown.classList.contains('is-open');
        closeAllDropdowns(isOpen ? null : dropdown);

        if (!isOpen) {
          dropdown.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        } else {
          dropdown.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Mobile dropdown functionality
    mobileDropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector('[data-mobile-dropdown-toggle]');
      const panel = dropdown.querySelector('.mobile-dropdown-panel');

      if (toggle && panel) {
        toggle.addEventListener('click', () => {
          const expanded = toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', String(!expanded));

          if (expanded) {
            dropdown.classList.remove('is-open');
            panel.style.maxHeight = '0';
            setTimeout(() => panel.classList.add('hidden'), 300);
          } else {
            dropdown.classList.add('is-open');
            panel.classList.remove('hidden');
            panel.style.maxHeight = panel.scrollHeight + 'px';
          }
        });
      }
    });

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
      // Close desktop dropdowns
      if (!e.target.closest('[data-dropdown]')) {
        closeAllDropdowns();
      }

      // Close mobile menu
      if (!e.target.closest('#global-nav') && !e.target.closest('#nav-toggle')) {
        closeMobileMenu();
      }
    });

    // Close menus on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllDropdowns();
        closeMobileMenu();
      }
    });

    // Close mobile menu on window resize (desktop)
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        closeMobileMenu();
      }
    });
  }

  /**
   * Get the navbar HTML content
   * @returns {string} Navbar HTML
   */
  getNavbarHTML() {
    return `
  <nav id="global-nav" class="global-nav">
    <div class="nav-shell">
      <a href="index.html" class="nav-brand" aria-label="Voizag home">
        <img src="public/images/voizag-logo.webp" alt="Voizag" class="nav-logo-image">
      </a>
      <div class="nav-main" role="menubar">
        <a href="index.html" class="nav-link" role="menuitem">Home</a>
        <div class="nav-dropdown" data-dropdown>
          <button class="nav-link nav-link--trigger" type="button" data-dropdown-trigger aria-haspopup="true" aria-expanded="false">
            Solutions
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4.47 5.97a.75.75 0 0 1 1.06 0L8 8.44l2.47-2.47a.75.75 0 0 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06Z" fill="currentColor" />
            </svg>
          </button>
          <div class="nav-dropdown-menu" role="menu">
            <a href="ai-contract.html" role="menuitem">
              AI Services &amp; Compliance
              <span>Guided automation programs</span>
            </a>
            <a href="b2b.html" role="menuitem">
              B2B Partner Network
              <span>White-label messaging &amp; voice</span>
            </a>
            <a href="Integration.html" role="menuitem">
              Integration Hub
              <span>API, SDK, and webhook fabric</span>
            </a>
          </div>
        </div>
        <a href="products.html" class="nav-link" role="menuitem">Products</a>
        <a href="company.html" class="nav-link" role="menuitem">Company</a>
        <a href="media.html" class="nav-link" role="menuitem">Media</a>
        <a href="contact.html" class="nav-link" role="menuitem">Contact</a>
      </div>
      <div class="nav-cta">
        <a href="tel:+18001234567" class="nav-cta-link">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5.14 2.82c.32-.6.96-.92 1.61-.81l2.18.36c.65.11 1.16.61 1.25 1.26l.26 1.84a1.6 1.6 0 0 1-.48 1.36l-1.07 1.02a8.48 8.48 0 0 0 3.83 3.83l1.02-1.07c.36-.38.89-.56 1.42-.48l1.84.26c.65.09 1.15.6 1.26 1.25l.36 2.18c.11.65-.21 1.29-.81 1.61l-1.64.87c-.52.28-1.13.32-1.68.12c-1.88-.68-3.62-1.79-5.08-3.25C6.93 11.4 5.82 9.66 5.14 7.78c-.2-.55-.16-1.16.12-1.68z" fill="currentColor" />
          </svg>
          <span>Global Support</span>
        </a>
        <a href="https://voizag.com/SMS_bot/login" class="nav-cta-button">Login</a>
      </div>
      <button id="nav-toggle" class="nav-toggle" aria-expanded="false" aria-controls="mobile-menu">
        <span class="sr-only">Toggle navigation</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 6h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          <path d="M4 12h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
          <path d="M4 18h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        </svg>
      </button>
    </div>
    <div id="mobile-menu" class="mobile-menu hidden">
      <a href="index.html" class="mobile-link">Home</a>
      <div class="mobile-dropdown" data-mobile-dropdown>
        <button class="mobile-dropdown-toggle" type="button" data-mobile-dropdown-toggle aria-expanded="false">
          <span>Solutions</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4.47 5.97a.75.75 0 0 1 1.06 0L8 8.44l2.47-2.47a.75.75 0 0 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06Z" fill="currentColor" />
          </svg>
        </button>
        <div class="mobile-dropdown-panel">
          <a href="ai-contract.html" class="mobile-sublink">AI Services &amp; Compliance</a>
          <a href="b2b.html" class="mobile-sublink">B2B Partner Network</a>
          <a href="Integration.html" class="mobile-sublink">Integration Hub</a>
        </div>
      </div>
      <a href="products.html" class="mobile-link">Products</a>
      <a href="company.html" class="mobile-link">Company</a>
      <a href="media.html" class="mobile-link">Media</a>
      <a href="contact.html" class="mobile-link">Contact</a>
      <div class="mobile-cta">
        <a href="https://voizag.com/SMS_bot/login" class="nav-cta-button">Login</a>
        <a href="contact.html" class="btn-ghost">Talk to sales</a>
      </div>
    </div>
  </nav>
    `;
  }

  /**
   * Get fallback content for when component loading fails
   * @param {string} componentName - Name of the component
   * @returns {string} Fallback HTML
   */
  getFallbackContent(componentName) {
    if (componentName === 'navbar') {
      return `
        <nav class="bg-slate-900 border-b border-slate-800">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
              <div class="flex items-center">
                <a href="index.html" class="text-xl font-bold text-white">VOIZAG</a>
              </div>
              <div class="flex items-center space-x-4">
                <a href="index.html" class="text-slate-300 hover:text-white">Home</a>
                <a href="products.html" class="text-slate-300 hover:text-white">Products</a>
                <a href="company.html" class="text-slate-300 hover:text-white">Company</a>
                <a href="contact.html" class="text-slate-300 hover:text-white">Contact</a>
              </div>
            </div>
          </div>
        </nav>
      `;
    }

    if (componentName === 'footer') {
      return `
        <footer class="bg-slate-900 border-t border-slate-800">
          <div class="max-w-7xl mx-auto px-6 py-8">
            <div class="text-center text-slate-400">
              <p>&copy; 2025 Voizag Communication. All rights reserved.</p>
            </div>
          </div>
        </footer>
      `;
    }

    return '';
  }

  /**
   * Handle loading errors
   */
  handleLoadError() {
    console.warn('Some components failed to load. Using fallback content.');
  }
}

// Initialize the component loader
const componentLoader = new ComponentLoader();

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ComponentLoader;
}