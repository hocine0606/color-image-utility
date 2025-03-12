// Unified and Optimized Main JavaScript
(function() {
    // Efficient UI and Interaction Management
    const UI = {
        // DOM Elements
        elements: {
            body: document.body,
            themeSwitch: document.getElementById('theme-switch'),
            menuToggle: document.querySelector('.menu-toggle'),
            mobileMenu: document.querySelector('.mobile-menu'),
            mobileMenuClose: document.querySelector('.mobile-menu-close'),
            flashMessages: document.querySelectorAll('.flash-message'),
            themeToggleIcons: {
                moon: document.querySelector('.theme-toggle .fa-moon'),
                sun: document.querySelector('.theme-toggle .fa-sun')
            }
        },

        // Initialize all event listeners
        init() {
            this.setupThemeToggle();
            this.setupMobileMenu();
            this.setupFlashMessages();
            this.setupPageLoad();
            this.lazyLoadImages();
            this.initPerformanceMonitoring();
        },

        // Theme Switching Logic
        setupThemeToggle() {
            // Check for saved theme preference
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            
            // Set initial toggle state
            this.elements.themeSwitch.checked = savedTheme === 'dark';
            this.updateThemeIcons(savedTheme);

            // Theme switch event listener
            this.elements.themeSwitch.addEventListener('change', (e) => {
                const theme = e.target.checked ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
                this.updateThemeIcons(theme);
            });
        },

        // Update theme toggle icons
        updateThemeIcons(theme) {
            const { moon, sun } = this.elements.themeToggleIcons;
            if (theme === 'dark') {
                moon.style.opacity = '0.5';
                sun.style.opacity = '1';
            } else {
                moon.style.opacity = '1';
                sun.style.opacity = '0.5';
            }
        },

        // Mobile Menu Interactions
        setupMobileMenu() {
            const { menuToggle, mobileMenu, mobileMenuClose } = this.elements;

            // Open mobile menu
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.add('open');
                menuToggle.classList.add('active');
            });

            // Close mobile menu
            mobileMenuClose.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                menuToggle.classList.remove('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenu.contains(e.target) && 
                    !menuToggle.contains(e.target) && 
                    mobileMenu.classList.contains('open')) {
                    mobileMenu.classList.remove('open');
                    menuToggle.classList.remove('active');
                }
            });
        },

        // Flash Message Handling
        setupFlashMessages() {
            const flashMessages = document.querySelectorAll('.flash-message');
            
            flashMessages.forEach(message => {
                const closeBtn = message.querySelector('.close-btn');
                
                closeBtn.addEventListener('click', () => {
                    message.style.opacity = '0';
                    setTimeout(() => {
                        message.remove();
                    }, 300);
                });

                // Auto-dismiss after 5 seconds
                setTimeout(() => {
                    if (message) {
                        message.style.opacity = '0';
                        setTimeout(() => {
                            message.remove();
                        }, 300);
                    }
                }, 5000);
            });
        },

        // Page Load Animation
        setupPageLoad() {
            // Ensure body becomes visible after initial render
            this.elements.body.classList.add('loaded');
        },

        lazyLoadImages() {
            const images = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                });
            }, { rootMargin: '50px' });

            images.forEach(img => imageObserver.observe(img));
        },

        initPerformanceMonitoring() {
            window.addEventListener('error', (event) => {
                console.error('Unhandled error:', event.error);
            });
        }
    };

    // Initialize on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => UI.init());
    } else {
        UI.init();
    }

    // Utility Functions (kept for potential future use)
    window.Utils = {
        copyToClipboard(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        },

        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    };
})();
