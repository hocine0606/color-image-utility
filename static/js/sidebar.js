console.log('Sidebar script loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');
    const sidebarMenuItems = document.querySelectorAll('.sidebar-menu ul li a');

    console.log('Sidebar elements:', {
        sidebarToggle,
        sidebar,
        overlay,
        sidebarMenuItems
    });

    // Sidebar toggle functionality with enhanced interaction
    function toggleSidebar() {
        console.log('Toggling sidebar');
        sidebarToggle.classList.toggle('active');
        sidebar.classList.toggle('open');
        
        // Accessibility and keyboard navigation
        if (sidebar.classList.contains('open')) {
            console.log('Sidebar opened');
            sidebarToggle.setAttribute('aria-expanded', 'true');
            sidebar.setAttribute('aria-hidden', 'false');
            // Focus first menu item when sidebar opens
            sidebarMenuItems[0]?.focus();
        } else {
            console.log('Sidebar closed');
            sidebarToggle.setAttribute('aria-expanded', 'false');
            sidebar.setAttribute('aria-hidden', 'true');
        }
    }

    // Add keyboard support for sidebar toggle
    sidebarToggle.addEventListener('click', toggleSidebar);
    sidebarToggle.setAttribute('tabindex', '0');
    sidebarToggle.setAttribute('role', 'button');
    sidebarToggle.setAttribute('aria-label', 'Toggle sidebar');
    sidebarToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSidebar();
        }
    });

    // Close sidebar when clicking overlay
    overlay.addEventListener('click', toggleSidebar);

    // Add keyboard navigation to sidebar menu items
    sidebarMenuItems.forEach((item, index) => {
        item.setAttribute('tabindex', '0');
        item.addEventListener('keydown', (e) => {
            // Arrow key navigation
            if (e.key === 'ArrowDown' && index < sidebarMenuItems.length - 1) {
                e.preventDefault();
                sidebarMenuItems[index + 1].focus();
            }
            if (e.key === 'ArrowUp' && index > 0) {
                e.preventDefault();
                sidebarMenuItems[index - 1].focus();
            }
        });
    });

    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;

    function updateTheme() {
        if (themeSwitch.checked) {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            body.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }

    // Load saved theme on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
        themeSwitch.checked = savedTheme === 'dark';
    }

    themeToggle.addEventListener('click', () => {
        themeSwitch.click();
        updateTheme();
    });

    themeSwitch.addEventListener('change', updateTheme);

    // Performance and accessibility improvements
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    function handleMediaQuery(e) {
        if (e.matches) {
            // Mobile-specific adjustments
            sidebar.classList.add('mobile');
            sidebarToggle.setAttribute('aria-label', 'Open mobile menu');
        } else {
            sidebar.classList.remove('mobile');
            sidebarToggle.setAttribute('aria-label', 'Toggle sidebar');
        }
    }

    mediaQuery.addListener(handleMediaQuery);
    handleMediaQuery(mediaQuery);
});
