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
        this.loadComponent('navbar', 'navbar.html'),
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
   * @param {string} filePath - Path to the HTML file
   */
  async loadComponent(componentName, filePath) {
    const placeholder = document.getElementById(componentName);

    if (!placeholder) {
      console.warn(`Placeholder for ${componentName} not found`);
      return;
    }

    try {
      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(`Failed to load ${filePath}: ${response.status}`);
      }

      const html = await response.text();
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
            panel.style.maxHeight = '0';
            setTimeout(() => panel.classList.add('hidden'), 300);
          } else {
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