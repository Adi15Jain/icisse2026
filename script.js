document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");

    // Add scroll listener for Navbar background
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = "running";
                entry.target.classList.add("visible"); // If needed for specific CSS control

                // Animate stats if it's the TMU section
                if (entry.target.classList.contains("tmu-content")) {
                    animateStats();
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial pause for animation elements
    const fadeElements = document.querySelectorAll(".fade-in-up");
    fadeElements.forEach((el) => {
        el.style.animationPlayState = "paused";
        observer.observe(el);
    });

    // Play hero animations immediately
    setTimeout(() => {
        const heroElements = document.querySelectorAll(
            ".hero-section .fade-in-up",
        );
        heroElements.forEach((el) => {
            el.style.animationPlayState = "running";
            observer.unobserve(el);
        });
    }, 100);

    // Stats counter animation
    let statsAnimated = false;
    function animateStats() {
        if (statsAnimated) return;

        const stats = document.querySelectorAll(".stat-value");
        stats.forEach((stat) => {
            const target = parseInt(stat.getAttribute("data-val"));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.innerText =
                        Math.ceil(current) +
                        (stat.innerText.includes("+") ? "+" : "");
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.innerText =
                        target + (stat.innerText.includes("+") ? "+" : "");
                }
            };

            updateCounter();
        });

        statsAnimated = true;
    }

    // --- Objectives Slider Logic ---
    const sliderTrack = document.getElementById("objectives-slider");
    const slides = document.querySelectorAll(".slider-card");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    const dotsContainer = document.querySelector(".slider-dots");

    if (sliderTrack && slides.length > 0) {
        let currentIndex = 0;
        const totalSlides = slides.length;

        // Setup dots
        slides.forEach((_, index) => {
            const dot = document.createElement("button");
            dot.classList.add("slider-dot");
            if (index === 0) dot.classList.add("active");
            dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
            dot.addEventListener("click", () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll(".slider-dot");

        function updateSlider() {
            // Calculate width including gap
            // Using first child width and gap of the track
            const cardWidth = slides[0].offsetWidth;
            const gap =
                parseFloat(window.getComputedStyle(sliderTrack).gap) || 32; // 2rem = 32px usually
            const moveAmount = (cardWidth + gap) * currentIndex;

            sliderTrack.style.transform = `translateX(-${moveAmount}px)`;

            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle("active", index === currentIndex);
            });

            // Update buttons state
            prevBtn.disabled = currentIndex === 0;

            // Disable next if we've reached the end of visible cards
            // Calculate how many cards can be visible at once
            const containerWidth =
                document.querySelector(".slider-container").offsetWidth;
            const visibleCards = Math.floor(containerWidth / (cardWidth + gap));
            const maxIndex = Math.max(0, totalSlides - visibleCards);

            nextBtn.disabled = currentIndex >= maxIndex;
        }

        function goToSlide(index) {
            currentIndex = index;
            updateSlider();
        }

        prevBtn.addEventListener("click", () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });

        nextBtn.addEventListener("click", () => {
            // Need to calculate max index here too in case window resized
            const cardWidth = slides[0].offsetWidth;
            const gap =
                parseFloat(window.getComputedStyle(sliderTrack).gap) || 32;
            const containerWidth =
                document.querySelector(".slider-container").offsetWidth;
            const visibleCards = Math.floor(containerWidth / (cardWidth + gap));
            const maxIndex = Math.max(0, totalSlides - visibleCards);

            if (currentIndex < maxIndex) {
                currentIndex++;
                updateSlider();
            }
        });

        // Initialize button states
        updateSlider();

        // Handle resize
        window.addEventListener("resize", () => {
            // When resize happens, ensure we're not scrolled past the new max
            const cardWidth = slides[0].offsetWidth;
            const gap =
                parseFloat(window.getComputedStyle(sliderTrack).gap) || 32;
            const containerWidth =
                document.querySelector(".slider-container").offsetWidth;
            const visibleCards = Math.floor(containerWidth / (cardWidth + gap));
            const maxIndex = Math.max(0, totalSlides - visibleCards);

            if (currentIndex > maxIndex) {
                currentIndex = maxIndex;
            }
            updateSlider();
        });
    }

    // --- Custom slider for Technical Tracks ---
    const tracksSlider = document.getElementById("tracks-slider");
    const tracksPrevBtn = document.querySelector(".tracks-prev-btn");
    const tracksNextBtn = document.querySelector(".tracks-next-btn");
    const tracksDotsContainer = document.querySelector(".tracks-slider-dots");

    if (tracksSlider && tracksPrevBtn && tracksNextBtn && tracksDotsContainer) {
        const trackCards = tracksSlider.querySelectorAll(".track-card");
        let currentTrackSlide = 0;
        const cardGap = 24; // 1.5rem

        function getVisibleCards() {
            const w = window.innerWidth;
            if (w <= 768) return 1;
            if (w <= 1024) return 2;
            return 3;
        }

        function getTotalSlides() {
            return Math.max(1, trackCards.length - getVisibleCards() + 1);
        }

        function buildDots() {
            tracksDotsContainer.innerHTML = "";
            const total = getTotalSlides();
            for (let i = 0; i < total; i++) {
                const dot = document.createElement("button");
                dot.classList.add("tracks-slider-dot");
                if (i === currentTrackSlide) dot.classList.add("active");
                dot.addEventListener("click", () => goToSlide(i));
                tracksDotsContainer.appendChild(dot);
            }
        }

        function updateSliderPosition() {
            if (!trackCards.length) return;
            const cardWidth = trackCards[0].offsetWidth;
            const offset = currentTrackSlide * (cardWidth + cardGap);
            tracksSlider.style.transform = `translateX(-${offset}px)`;

            // Update buttons
            tracksPrevBtn.disabled = currentTrackSlide === 0;
            tracksNextBtn.disabled = currentTrackSlide >= getTotalSlides() - 1;

            // Update dots
            const dots =
                tracksDotsContainer.querySelectorAll(".tracks-slider-dot");
            dots.forEach((d, i) =>
                d.classList.toggle("active", i === currentTrackSlide),
            );
        }

        function goToSlide(idx) {
            currentTrackSlide = Math.max(
                0,
                Math.min(idx, getTotalSlides() - 1),
            );
            updateSliderPosition();
        }

        tracksPrevBtn.addEventListener("click", () =>
            goToSlide(currentTrackSlide - 1),
        );
        tracksNextBtn.addEventListener("click", () =>
            goToSlide(currentTrackSlide + 1),
        );

        buildDots();
        updateSliderPosition();

        window.addEventListener("resize", () => {
            currentTrackSlide = Math.min(
                currentTrackSlide,
                getTotalSlides() - 1,
            );
            buildDots();
            updateSliderPosition();
        });
    }

    // --- Committee Modal Logic ---
    const openCommitteeBtn = document.getElementById("open-committee-btn");
    const closeCommitteeBtn = document.getElementById("close-committee-btn");
    const committeeModal = document.getElementById("committee-modal");

    if (openCommitteeBtn && closeCommitteeBtn && committeeModal) {
        openCommitteeBtn.addEventListener("click", () => {
            committeeModal.classList.add("active");
            document.body.style.overflow = "hidden"; // Prevent background scrolling
        });

        closeCommitteeBtn.addEventListener("click", () => {
            committeeModal.classList.remove("active");
            document.body.style.overflow = "auto";
        });

        // Close on outside click
        committeeModal.addEventListener("click", (e) => {
            if (e.target === committeeModal) {
                committeeModal.classList.remove("active");
                document.body.style.overflow = "auto";
            }
        });
    }

    // --- Glass Slider Logic ---
    const glassSlides = document.querySelectorAll(".glass-slide");
    const glassDots = document.querySelectorAll(".glass-dot");
    const sliderBgs = document.querySelectorAll(".slider-bg");
    let currentSlide = 0;
    let slideInterval;

    const goToSlide = (index) => {
        // Remove active class from all slides, dots, and backgrounds
        glassSlides.forEach((slide) => slide.classList.remove("active"));
        glassDots.forEach((dot) => dot.classList.remove("active"));
        sliderBgs.forEach((bg) => bg.classList.remove("active"));

        // Add active class to the current slide, dot, and background
        glassSlides[index].classList.add("active");
        glassDots[index].classList.add("active");
        if (sliderBgs[index]) sliderBgs[index].classList.add("active");
        currentSlide = index;
    };

    const nextSlide = () => {
        const nextIndex = (currentSlide + 1) % glassSlides.length;
        goToSlide(nextIndex);
    };

    // Auto play every 4 seconds
    const startSlideShow = () => {
        slideInterval = setInterval(nextSlide, 7000);
    };

    const resetSlideShow = () => {
        clearInterval(slideInterval);
        startSlideShow();
    };

    // Dot click events
    glassDots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            goToSlide(index);
            resetSlideShow(); // Reset interval so it doesn't change immediately after a click
        });
    });

    if (glassSlides.length > 0) {
        startSlideShow();
    }

    // --- TMU Slider Logic ---
    const tmuSlides = document.querySelectorAll(".tmu-slide");
    const tmuDots = document.querySelectorAll(".tmu-dot");
    let tmuCurrent = 0;
    let tmuInterval;

    const goToTmuSlide = (index) => {
        tmuSlides.forEach((s) => s.classList.remove("active"));
        tmuDots.forEach((d) => d.classList.remove("active"));
        tmuSlides[index].classList.add("active");
        tmuDots[index].classList.add("active");
        tmuCurrent = index;
    };

    const nextTmuSlide = () => {
        goToTmuSlide((tmuCurrent + 1) % tmuSlides.length);
    };

    const startTmuSlider = () => {
        tmuInterval = setInterval(nextTmuSlide, 5000);
    };

    const resetTmuSlider = () => {
        clearInterval(tmuInterval);
        startTmuSlider();
    };

    tmuDots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            goToTmuSlide(i);
            resetTmuSlider();
        });
    });

    if (tmuSlides.length > 0) {
        startTmuSlider();
    }

    // --- TMU Gallery Auto-Rotation ---
    const galleryCards = document.querySelectorAll(
        ".tmu-gallery .tmu-image-card",
    );
    const positions = ["pos-front", "pos-back-right", "pos-back-left"];
    let galleryIndex = 0;

    const rotateGallery = () => {
        galleryIndex = (galleryIndex + 1) % galleryCards.length;
        galleryCards.forEach((card, i) => {
            card.classList.remove(...positions);
            // Assign position based on offset from current front index
            const posIndex =
                (i - galleryIndex + galleryCards.length) % galleryCards.length;
            card.classList.add(positions[posIndex]);
        });
    };

    if (galleryCards.length > 0) {
        setInterval(rotateGallery, 3500);
    }
});
