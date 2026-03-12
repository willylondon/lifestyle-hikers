/* ========================================
   LIFESTYLE HIKERS — Interactive Scripts
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Mobile Navigation Toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isActive = navToggle.classList.toggle('active');
            navLinks.classList.toggle('active', isActive);
            navToggle.setAttribute('aria-expanded', String(isActive));
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        // Close mobile nav when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    // --- Sticky Navbar Background on Scroll ---
    const navbar = document.getElementById('navbar');

    const handleScroll = () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // --- Scroll Reveal (IntersectionObserver) ---
    const revealElements = document.querySelectorAll('.reveal');

    if (prefersReducedMotion) {
        revealElements.forEach(el => el.classList.add('visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // --- Animated Counter (Hero Stats) ---
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsCounted = false;

    const animateCounters = () => {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            if (prefersReducedMotion) {
                stat.textContent = target;
                return;
            }
            const duration = 2000;
            const start = performance.now();

            const update = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                stat.textContent = Math.floor(target * eased);
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    stat.textContent = target;
                }
            };

            requestAnimationFrame(update);
        });
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsCounted) {
                statsCounted = true;
                animateCounters();
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) statsObserver.observe(heroStats);

    // --- Trail Filter Buttons ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const trailCards = document.querySelectorAll('.trail-card');
    const trailsEmpty = document.getElementById('trailsEmpty');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('trailSearchResults');
    let activeFilter = 'all';

    const updateTrailFilters = () => {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let visibleCount = 0;

        trailCards.forEach(card => {
            const difficulty = card.getAttribute('data-difficulty');
            const haystack = card.getAttribute('data-search') || '';
            const matchesFilter = activeFilter === 'all' || difficulty === activeFilter;
            const matchesSearch = query === '' || haystack.includes(query);
            const isVisible = matchesFilter && matchesSearch;

            card.hidden = !isVisible;

            if (isVisible) {
                visibleCount += 1;
                card.style.animation = prefersReducedMotion ? '' : 'fadeInUp 0.5s ease forwards';
            } else {
                card.style.animation = '';
            }
        });

        if (trailsEmpty) {
            trailsEmpty.hidden = visibleCount !== 0;
        }

        if (searchResults) {
            if (query) {
                searchResults.textContent = visibleCount === 1
                    ? '1 trail matches your search.'
                    : `${visibleCount} trails match your search.`;
            } else if (activeFilter !== 'all') {
                searchResults.textContent = visibleCount === 1
                    ? 'Showing 1 trail.'
                    : `Showing ${visibleCount} trails.`;
            } else {
                searchResults.textContent = '';
            }
        }
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
            activeFilter = btn.getAttribute('data-filter');
            updateTrailFilters();
        });
    });

    // --- Trail Heart (Save) Toggle ---
    document.querySelectorAll('.trail-save').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.classList.toggle('saved');
            const icon = btn.querySelector('i');
            if (btn.classList.contains('saved')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                // Quick scale animation
                btn.style.transform = 'scale(1.3)';
                setTimeout(() => btn.style.transform = 'scale(1)', 200);
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        });
    });

    // --- Search Bar (Demo Behavior) ---
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            updateTrailFilters();
            if (query) {
                document.getElementById('trails').scrollIntoView({
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            }
        });

        searchInput.addEventListener('input', updateTrailFilters);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchBtn.click();
            }
        });
    }

    updateTrailFilters();

    // --- Join Form Submission (Formspree) ---
    const joinForm = document.getElementById('joinForm');
    const submitBtn = document.getElementById('submitBtn');

    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
            submitBtn.style.pointerEvents = 'none';

            try {
                const formData = new FormData(joinForm);

                const response = await fetch(joinForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    submitBtn.classList.add('submitted');
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> <span>Welcome to the team!</span>';
                    joinForm.reset();

                    // Reset after 4 seconds
                    setTimeout(() => {
                        submitBtn.classList.remove('submitted');
                        submitBtn.innerHTML = '<span>Join the Community</span> <i class="fas fa-arrow-right"></i>';
                        submitBtn.style.pointerEvents = '';
                    }, 4000);
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Try again</span>';
                submitBtn.style.pointerEvents = '';

                setTimeout(() => {
                    submitBtn.innerHTML = '<span>Join the Community</span> <i class="fas fa-arrow-right"></i>';
                }, 3000);
            }
        });
    }

    // --- Smooth Scroll for All Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 80;
                const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            }
        });
    });

    // --- Fade-in keyframe (used by filter) ---
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);

});
