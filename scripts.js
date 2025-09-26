// Global Navigation Script
(function() {
  'use strict';

  // Get DOM elements
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
      mobileMenu.classList.toggle('hidden');
      document.body.classList.toggle('nav-open', !expanded);
    });

    // Close mobile menu when clicking on links
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close mobile menu on window resize (desktop)
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        closeMobileMenu();
      }
    });
  }

  // Desktop dropdown functionality
  dropdownTriggers.forEach((trigger) => {
    const parent = trigger.closest('[data-dropdown]');
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const isOpen = parent.classList.contains('is-open');
      closeAllDropdowns(isOpen ? null : parent);
      parent.classList.toggle('is-open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest('[data-dropdown]')) {
      closeAllDropdowns();
    }
  });

  // Close dropdowns and mobile menu on escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
      closeMobileMenu();
    }
  });

  // Mobile dropdown functionality
  mobileDropdowns.forEach((wrapper) => {
    const toggleButton = wrapper.querySelector('[data-mobile-dropdown-toggle]');
    const panel = wrapper.querySelector('.mobile-dropdown-panel');
    if (!toggleButton || !panel) return;

    toggleButton.addEventListener('click', () => {
      const isOpen = wrapper.classList.toggle('is-open');
      toggleButton.setAttribute('aria-expanded', String(isOpen));
    });
  });

  // Set active navigation links based on current page
  const setActiveNav = () => {
    const currentPath = window.location.pathname;
    const fileName = currentPath.split('/').pop() || 'index.html';
    
    // Remove existing active states
    document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
      link.classList.remove('is-active');
    });

    // Add active state to current page links
    document.querySelectorAll(`a[href="${fileName}"], a[href="${currentPath}"]`).forEach(link => {
      if (link.classList.contains('nav-link') || link.classList.contains('mobile-link')) {
        link.classList.add('is-active');
      }
    });

    // Handle dropdown active states for solutions pages
    const solutionPages = ['ai-contract.html', 'b2b.html', 'Integration.html'];
    if (solutionPages.includes(fileName)) {
      const solutionsDropdown = document.querySelector('[data-dropdown]');
      if (solutionsDropdown) {
        solutionsDropdown.setAttribute('data-current', 'true');
      }
    }
  };

  // Initialize active navigation on page load
  document.addEventListener('DOMContentLoaded', setActiveNav);

  // Form handling for newsletter subscriptions
  const handleFormSubmission = () => {
    const forms = document.querySelectorAll('form[autocomplete="off"]');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]');
        if (email && email.value) {
          // Here you would typically send the email to your backend
          alert('Thank you for subscribing! We\'ll keep you updated.');
          email.value = '';
        }
      });
    });
  };

  // Initialize form handling
  document.addEventListener('DOMContentLoaded', handleFormSubmission);

  // FAQ accordion functionality
  const initFAQ = () => {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (question) {
        question.addEventListener('click', () => {
          // Close other FAQ items
          faqItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('open');
            }
          });
          // Toggle current item
          item.classList.toggle('open');
        });
      }
    });
  };

  // Initialize FAQ on page load
  document.addEventListener('DOMContentLoaded', initFAQ);

})();