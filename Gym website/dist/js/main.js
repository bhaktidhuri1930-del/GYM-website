/**
 * IRONPULSE FITNESS — INTERACTIVE ENGINE
 * High-performance, clean vanilla JS with zero external dependencies.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. THEME TOGGLE (DARK / LIGHT MODE)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // Initialize theme from localStorage or system preference
  const savedTheme = localStorage.getItem('ironpulse_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  } else if (!systemPrefersDark) {
    htmlElement.setAttribute('data-theme', 'light');
  } else {
    htmlElement.setAttribute('data-theme', 'dark');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('ironpulse_theme', newTheme);
    });
  }

  /* ==========================================================================
     2. STICKY NAVBAR & MOBILE DRAWER NAVIGATION
     ========================================================================== */
  const header = document.getElementById('header');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  // Scroll effect for header
  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // ScrollSpy active link update
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
        mobileNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });

    // Back to top button visibility
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  // Toggle mobile drawer
  if (hamburgerBtn && mobileDrawer) {
    const toggleMenu = () => {
      const isOpen = hamburgerBtn.classList.toggle('active');
      mobileDrawer.classList.toggle('open');
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
      mobileDrawer.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    hamburgerBtn.addEventListener('click', toggleMenu);

    // Close mobile drawer upon clicking any link
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (mobileDrawer.classList.contains('open')) {
          toggleMenu();
        }
      });
    });

    // Close when clicking outside drawer
    document.addEventListener('click', (e) => {
      if (
        mobileDrawer.classList.contains('open') &&
        !mobileDrawer.contains(e.target) &&
        !hamburgerBtn.contains(e.target)
      ) {
        toggleMenu();
      }
    });
  }

  // Smooth scroll for Back-to-Top
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ==========================================================================
     3. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  /* ==========================================================================
     4. ANIMATED STATISTICS COUNTERS
     ========================================================================== */
  const counters = document.querySelectorAll('.counter');
  let countersAnimated = false;

  const animateCounters = () => {
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 1800; // ms
      const frameDuration = 1000 / 60;
      const totalFrames = Math.round(duration / frameDuration);
      let frame = 0;

      const timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        // Ease-out quad
        const currentCount = Math.round(target * (progress * (2 - progress)));

        counter.textContent = currentCount;

        if (frame === totalFrames) {
          counter.textContent = target;
          clearInterval(timer);
        }
      }, frameDuration);
    });
  };

  const statsSection = document.querySelector('.hero-stats-wrapper');
  if (statsSection && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          animateCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    statsObserver.observe(statsSection);
  } else {
    animateCounters();
  }

  /* ==========================================================================
     5. PROGRAM CARDS "LEARN MORE" MODAL
     ========================================================================== */
  const programDetails = {
    strength: {
      title: "Strength Training & Barbell Mastery",
      badge: "Heavy Iron Track",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1000&q=80",
      description: "Our flagship strength program focuses on progressive overload using powerlifting and Olympic weightlifting fundamentals. Guided by elite powerlifters, you will build absolute raw power, fortify bone mineral density, and develop unbreakable tendon resilience.",
      schedule: "4 Days / Week (Upper/Lower Split)",
      suitability: "Beginner to Advanced Lifters",
      features: [
        "Certified CSCS Coach Supervision on every heavy lift",
        "Video kinematic bar-speed analysis & biomechanic corrections",
        "Personalized percentage-based wave periodization",
        "Access to calibrated Eleiko competition discs & combo racks"
      ]
    },
    fatloss: {
      title: "Metabolic Weight Loss & Tone",
      badge: "High Burn Protocol",
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80",
      description: "A calculated blend of Excess Post-Exercise Oxygen Consumption (EPOC) circuit training, sled pushes, battle ropes, and heart-rate zone intervals. Engineered to maximize caloric burn for up to 36 hours post-workout while preserving muscle mass.",
      schedule: "3-5 Days / Week",
      suitability: "All Fitness Levels Seeking Fat Reduction",
      features: [
        "Real-time MyZone heart-rate feedback on studio screens",
        "Custom macronutrient blueprint & meal timing guide",
        "Bi-weekly InBody body-fat and visceral fat scans",
        "Low-impact alternatives available for joint preservation"
      ]
    },
    hypertrophy: {
      title: "Hypertrophy & Aesthetic Physique",
      badge: "Muscle Architecture",
      image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1000&q=80",
      description: "Sculpt a balanced, proportional, and aesthetic physique. Designed around time under tension, regional muscle activation, and progressive volume targets. Perfect for lifters wanting noticeable muscle density and definition.",
      schedule: "4-6 Days / Week (Push/Pull/Legs Split)",
      suitability: "Intermediate to Competitive Lifters",
      features: [
        "Targeted mind-muscle connection drills with isolations",
        "Comprehensive deload & stimulus recovery strategies",
        "Prime & Hammer Strength biomechanically optimized machines",
        "Posing and physique silhouette assessments"
      ]
    },
    personal: {
      title: "1-on-1 VIP Personal Coaching",
      badge: "Elite Custom Track",
      image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1000&q=80",
      description: "Work directly with our master trainers in private training corridors. We perform a 25-point orthopedic and kinetic assessment before constructing your fully bespoke regimen, complete with daily nutritional oversight and habit coaching.",
      schedule: "Custom Flexible Scheduling",
      suitability: "Anyone Wanting Rapid, Accountable Transformation",
      features: [
        "Dedicated Master Trainer exclusively at your side",
        "Comprehensive mobility, posture, and kinetic screening",
        "Weekly progress video checks and tailored workout apps",
        "Complimentary sports recovery and assisted stretching"
      ]
    },
    cardio: {
      title: "Athletic Conditioning & Endurance",
      badge: "VO2 Max Conditioning",
      image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1000&q=80",
      description: "Elevate your cardiovascular threshold, lung volume, and stamina. Using Woodway non-motorized treadmills, Concept2 rowing ergs, and SkiErgs, this program builds stamina that never quits, whether on the field, the trails, or in life.",
      schedule: "3 Days / Week",
      suitability: "Runners, Triathletes & Fitness Seekers",
      features: [
        "Lactate threshold and aerobic capacity testing",
        "Non-motorized curved treadmill sprint mechanics",
        "Rowing and ski ergometer pacing efficiency coaching",
        "Active recovery breathwork and tissue flushing"
      ]
    },
    functional: {
      title: "Functional Agility & Movement",
      badge: "All-Terrain Athleticism",
      image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1000&q=80",
      description: "Train movements, not just muscles. We combine plyometric box training, rotational kettlebell work, sandbag drags, and gymnastics rings to forge a durable, athletic body capable of handling real-world physical demands.",
      schedule: "3-4 Days / Week",
      suitability: "Sports Athletes & Functional Fitness Enthusiasts",
      features: [
        "Multi-planar functional movement patterns",
        "Kettlebell Sport hardstyle & kettlebell flow fundamentals",
        "Rotational core development and injury prevention",
        "Sprint mechanics and rapid decelerative braking drills"
      ]
    }
  };

  const programModal = document.getElementById('program-modal');
  const programModalContent = document.getElementById('program-modal-content');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const learnMoreBtns = document.querySelectorAll('.learn-more-btn');

  const openProgramModal = (programKey) => {
    const program = programDetails[programKey];
    if (!program || !programModal || !programModalContent) return;

    programModalContent.innerHTML = `
      <div class="modal-program-header">
        <span class="program-badge" style="position: static; display: inline-block; margin-bottom: 12px;">${program.badge}</span>
        <h2 style="font-family: var(--font-display); font-size: 2.2rem; margin-bottom: 12px; color: var(--text-main);">${program.title}</h2>
        <img src="${program.image}" alt="${program.title}" class="modal-program-img">
        <p style="color: var(--text-muted); font-size: 1rem; line-height: 1.7; margin-bottom: 20px;">${program.description}</p>
      </div>

      <div style="background: var(--bg-tertiary); padding: 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 0.9rem;">
          <div><strong style="color: var(--text-main);">Schedule:</strong> <span style="color: var(--text-muted);">${program.schedule}</span></div>
          <div><strong style="color: var(--text-main);">Suitability:</strong> <span style="color: var(--text-muted);">${program.suitability}</span></div>
        </div>
      </div>

      <h4 style="font-family: var(--font-accent); font-size: 1.05rem; margin-bottom: 14px; color: var(--text-main);">What You Get:</h4>
      <div class="modal-program-features">
        ${program.features.map(f => `
          <div class="modal-feat-item">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>${f}</span>
          </div>
        `).join('')}
      </div>

      <div style="margin-top: 28px; display: flex; gap: 14px; flex-wrap: wrap;">
        <a href="#contact" class="btn btn-primary modal-cta-action" style="flex: 1;">Book a Trial Workout</a>
        <button class="btn btn-outline modal-close-action" style="flex: 1;">Close</button>
      </div>
    `;

    programModal.classList.add('active');
    programModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Hook up internal buttons
    const internalClose = programModalContent.querySelector('.modal-close-action');
    if (internalClose) {
      internalClose.addEventListener('click', closeProgramModal);
    }
    const ctaAction = programModalContent.querySelector('.modal-cta-action');
    if (ctaAction) {
      ctaAction.addEventListener('click', () => {
        closeProgramModal();
      });
    }
  };

  const closeProgramModal = () => {
    if (!programModal) return;
    programModal.classList.remove('active');
    programModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  learnMoreBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      openProgramModal(target);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProgramModal);
  }

  if (programModal) {
    programModal.addEventListener('click', (e) => {
      if (e.target === programModal) {
        closeProgramModal();
      }
    });
  }

  /* ==========================================================================
     6. BMI CALCULATOR ENGINE
     ========================================================================== */
  const bmiForm = document.getElementById('bmi-form');
  const heightInput = document.getElementById('bmi-height');
  const weightInput = document.getElementById('bmi-weight');
  const heightError = document.getElementById('height-error');
  const weightError = document.getElementById('weight-error');
  const bmiPlaceholder = document.getElementById('bmi-placeholder');
  const bmiOutput = document.getElementById('bmi-output');
  const bmiScoreEl = document.getElementById('bmi-score');
  const bmiBadgeEl = document.getElementById('bmi-badge');
  const bmiFeedbackEl = document.getElementById('bmi-feedback');
  const gaugePointerEl = document.getElementById('gauge-pointer');
  const resetBmiBtn = document.getElementById('reset-bmi-btn');
  const bmiRecommendationBtn = document.getElementById('bmi-recommendation-btn');

  const validateBmiInputs = (height, weight) => {
    let isValid = true;
    heightError.textContent = '';
    weightError.textContent = '';

    if (!height || isNaN(height) || height < 50 || height > 260) {
      heightError.textContent = 'Please enter a valid height between 50 and 260 cm.';
      isValid = false;
    }

    if (!weight || isNaN(weight) || weight < 20 || weight > 300) {
      weightError.textContent = 'Please enter a valid weight between 20 and 300 kg.';
      isValid = false;
    }

    return isValid;
  };

  const calculateBMI = (e) => {
    if (e) e.preventDefault();

    const heightVal = parseFloat(heightInput.value);
    const weightVal = parseFloat(weightInput.value);

    if (!validateBmiInputs(heightVal, weightVal)) {
      return;
    }

    // Standard WHO Formula: weight (kg) / [height (m)]^2
    const heightInMeters = heightVal / 100;
    const bmi = (weightVal / (heightInMeters * heightInMeters)).toFixed(1);
    const bmiNum = parseFloat(bmi);

    bmiScoreEl.textContent = bmi;

    let category = '';
    let badgeClass = '';
    let explanation = '';
    let recommendedProgram = '';

    if (bmiNum < 18.5) {
      category = 'Underweight';
      badgeClass = 'badge-underweight';
      explanation = 'Your BMI indicates you are below standard body weight. We recommend our Hypertrophy & Muscle Building program paired with a nutrient-dense caloric surplus to build healthy lean tissue and bone mass.';
      recommendedProgram = 'Muscle Building & Hypertrophy';
    } else if (bmiNum >= 18.5 && bmiNum <= 24.9) {
      category = 'Normal Weight';
      badgeClass = 'badge-normal';
      explanation = 'Outstanding! Your BMI falls precisely within the healthy optimal range. Focus on progressive strength overload, functional agility, and metabolic conditioning to maintain peak vitality.';
      recommendedProgram = 'Strength Training & Barbell Mastery';
    } else if (bmiNum >= 25 && bmiNum <= 29.9) {
      category = 'Overweight';
      badgeClass = 'badge-overweight';
      explanation = 'Your BMI is slightly elevated. Our Metabolic Weight Loss and Functional HIIT circuits combined with targeted protein pacing will accelerate visceral fat burning while preserving athletic tone.';
      recommendedProgram = 'Metabolic Weight Loss Program';
    } else {
      category = 'Obesity Category';
      badgeClass = 'badge-obese';
      explanation = 'Your BMI indicates obesity level. We strongly advise our 1-on-1 VIP Personal Coaching track for safe, low-impact joint conditioning, cardiovascular health monitoring, and customized nutritional guidance.';
      recommendedProgram = '1-on-1 VIP Personal Coaching';
    }

    // Update UI elements
    bmiBadgeEl.textContent = category;
    bmiBadgeEl.className = `result-badge ${badgeClass}`;
    bmiFeedbackEl.textContent = explanation;
    bmiRecommendationBtn.textContent = `Recommended Program: ${recommendedProgram}`;

    // Gauge positioning: map BMI between 15 and 35 to percentage (0% to 100%)
    let gaugePercent = ((bmiNum - 15) / (38 - 15)) * 100;
    gaugePercent = Math.max(5, Math.min(95, gaugePercent));
    gaugePointerEl.style.left = `${gaugePercent}%`;

    // Switch view
    bmiPlaceholder.classList.add('hidden');
    bmiOutput.classList.remove('hidden');
  };

  if (bmiForm) {
    bmiForm.addEventListener('submit', calculateBMI);
  }

  if (resetBmiBtn) {
    resetBmiBtn.addEventListener('click', () => {
      bmiForm.reset();
      heightError.textContent = '';
      weightError.textContent = '';
      bmiOutput.classList.add('hidden');
      bmiPlaceholder.classList.remove('hidden');
    });
  }

  // Clear errors on input
  [heightInput, weightInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => {
        heightError.textContent = '';
        weightError.textContent = '';
      });
    }
  });

  /* ==========================================================================
     7. MEMBERSHIP BILLING TOGGLE & CTA SCROLLING
     ========================================================================== */
  const billingToggle = document.getElementById('billing-toggle');
  const labelMonthly = document.getElementById('label-monthly');
  const labelAnnual = document.getElementById('label-annual');
  const priceVals = document.querySelectorAll('.price-val');
  const billingNotes = document.querySelectorAll('.billing-note');
  const selectPlanBtns = document.querySelectorAll('.select-plan-btn');
  const contactMembershipSelect = document.getElementById('contact-membership');

  // Toggle Pricing
  const updatePricing = () => {
    const isAnnual = billingToggle ? billingToggle.checked : true;

    if (isAnnual) {
      labelAnnual.classList.add('active-toggle');
      labelMonthly.classList.remove('active-toggle');

      priceVals.forEach(p => {
        const val = p.getAttribute('data-annual');
        if (val) p.textContent = val;
      });

      if (billingNotes.length >= 3) {
        billingNotes[0].textContent = 'Billed annually ($348/yr)';
        billingNotes[1].textContent = 'Billed annually ($660/yr)';
        billingNotes[2].textContent = 'Billed annually ($1188/yr)';
      }
    } else {
      labelMonthly.classList.add('active-toggle');
      labelAnnual.classList.remove('active-toggle');

      priceVals.forEach(p => {
        const val = p.getAttribute('data-monthly');
        if (val) p.textContent = val;
      });

      if (billingNotes.length >= 3) {
        billingNotes[0].textContent = 'Billed monthly ($39/mo)';
        billingNotes[1].textContent = 'Billed monthly ($69/mo)';
        billingNotes[2].textContent = 'Billed monthly ($119/mo)';
      }
    }
  };

  if (billingToggle) {
    billingToggle.checked = true; // Default to Annual for best deal presentation
    billingToggle.addEventListener('change', updatePricing);
  }

  if (labelMonthly) {
    labelMonthly.addEventListener('click', () => {
      if (billingToggle) {
        billingToggle.checked = false;
        updatePricing();
      }
    });
  }

  if (labelAnnual) {
    labelAnnual.addEventListener('click', () => {
      if (billingToggle) {
        billingToggle.checked = true;
        updatePricing();
      }
    });
  }

  // Select Plan Button: Auto scrolls to Contact & selects appropriate plan
  selectPlanBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const planName = btn.getAttribute('data-plan');
      if (contactMembershipSelect && planName) {
        contactMembershipSelect.value = planName;
      }
      
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ==========================================================================
     8. TRANSFORMATION GALLERY & LIGHTBOX
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');

  let currentGalleryIndex = 0;
  let visibleGalleryItems = Array.from(galleryItems);

  // Category Filtering
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      visibleGalleryItems = [];
      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.classList.remove('hide');
          visibleGalleryItems.push(item);
        } else {
          item.classList.add('hide');
        }
      });
    });
  });

  // Lightbox functions
  const openLightbox = (index) => {
    if (visibleGalleryItems.length === 0) return;
    
    // Bounds wrap-around
    if (index < 0) index = visibleGalleryItems.length - 1;
    if (index >= visibleGalleryItems.length) index = 0;

    currentGalleryIndex = index;
    const currentItem = visibleGalleryItems[currentGalleryIndex];

    const imgSrc = currentItem.getAttribute('data-img');
    const title = currentItem.getAttribute('data-title');
    const desc = currentItem.getAttribute('data-desc');

    lightboxImg.src = imgSrc;
    lightboxImg.alt = title;
    lightboxTitle.textContent = title;
    lightboxDesc.textContent = desc;

    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const idx = visibleGalleryItems.indexOf(item);
      if (idx !== -1) {
        openLightbox(idx);
      }
    });
  });

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', () => openLightbox(currentGalleryIndex - 1));
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', () => openLightbox(currentGalleryIndex + 1));

  // Keyboard navigation for Lightbox & Modals
  window.addEventListener('keydown', (e) => {
    if (lightboxModal && lightboxModal.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') openLightbox(currentGalleryIndex - 1);
      if (e.key === 'ArrowRight') openLightbox(currentGalleryIndex + 1);
    } else if (programModal && programModal.classList.contains('active')) {
      if (e.key === 'Escape') closeProgramModal();
    }
  });

  /* ==========================================================================
     9. TESTIMONIAL CAROUSEL
     ========================================================================== */
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const prevTestimonialBtn = document.getElementById('carousel-prev-btn');
  const nextTestimonialBtn = document.getElementById('carousel-next-btn');
  const carouselDotsContainer = document.getElementById('carousel-dots');
  const dots = carouselDotsContainer ? carouselDotsContainer.querySelectorAll('.dot') : [];
  
  let currentSlide = 0;
  let carouselTimer = null;
  const slideInterval = 5500;

  const showSlide = (index) => {
    if (testimonialCards.length === 0) return;

    if (index < 0) index = testimonialCards.length - 1;
    if (index >= testimonialCards.length) index = 0;

    currentSlide = index;

    testimonialCards.forEach((card, idx) => {
      card.classList.toggle('active', idx === currentSlide);
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });
  };

  const nextSlide = () => showSlide(currentSlide + 1);
  const prevSlide = () => showSlide(currentSlide - 1);

  const startAutoSlide = () => {
    stopAutoSlide();
    carouselTimer = setInterval(nextSlide, slideInterval);
  };

  const stopAutoSlide = () => {
    if (carouselTimer) {
      clearInterval(carouselTimer);
      carouselTimer = null;
    }
  };

  if (prevTestimonialBtn) {
    prevTestimonialBtn.addEventListener('click', () => {
      prevSlide();
      startAutoSlide();
    });
  }

  if (nextTestimonialBtn) {
    nextTestimonialBtn.addEventListener('click', () => {
      nextSlide();
      startAutoSlide();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      showSlide(idx);
      startAutoSlide();
    });
  });

  // Pause on hover
  const carouselWrap = document.querySelector('.testimonial-carousel-wrapper');
  if (carouselWrap) {
    carouselWrap.addEventListener('mouseenter', stopAutoSlide);
    carouselWrap.addEventListener('mouseleave', startAutoSlide);
  }

  startAutoSlide();

  /* ==========================================================================
     10. CONTACT FORM VALIDATION & FEEDBACK
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const nameField = document.getElementById('contact-name');
  const emailField = document.getElementById('contact-email');
  const phoneField = document.getElementById('contact-phone');
  const messageField = document.getElementById('contact-message');
  const successBanner = document.getElementById('form-success-banner');
  const submitBtn = document.getElementById('contact-submit-btn');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const phoneError = document.getElementById('phone-error');
  const messageError = document.getElementById('message-error');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    // Basic phone validation accepting digits, parens, hyphens, and plus
    return /^[\d\s\+\-\(\)]{7,20}$/.test(phone);
  };

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let hasErrors = false;

      // Validate Name
      if (!nameField.value.trim() || nameField.value.trim().length < 2) {
        nameError.textContent = 'Please enter your full name (minimum 2 characters).';
        hasErrors = true;
      } else {
        nameError.textContent = '';
      }

      // Validate Email
      if (!validateEmail(emailField.value.trim())) {
        emailError.textContent = 'Please enter a valid email address.';
        hasErrors = true;
      } else {
        emailError.textContent = '';
      }

      // Validate Phone
      if (!validatePhone(phoneField.value.trim())) {
        phoneError.textContent = 'Please enter a valid telephone contact number.';
        hasErrors = true;
      } else {
        phoneError.textContent = '';
      }

      // Validate Message
      if (!messageField.value.trim() || messageField.value.trim().length < 6) {
        messageError.textContent = 'Please provide details about your fitness goals (minimum 6 characters).';
        hasErrors = true;
      } else {
        messageError.textContent = '';
      }

      if (hasErrors) return;

      // Simulate sending with loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" viewBox="0 0 50 50" width="20" height="20" style="animation: spin 1s linear infinite;">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="80" stroke-dashoffset="60"></circle>
        </svg>
        <span>Transmitting Details...</span>
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        successBanner.classList.remove('hidden');
        contactForm.reset();

        // Scroll success message into view
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Auto hide success notice after 8 seconds
        setTimeout(() => {
          successBanner.classList.add('hidden');
        }, 8000);
      }, 900);
    });

    // Clear validation error on user keystrokes
    [nameField, emailField, phoneField, messageField].forEach(field => {
      if (field) {
        field.addEventListener('input', () => {
          const errEl = document.getElementById(`${field.id.replace('contact-', '')}-error`);
          if (errEl) errEl.textContent = '';
        });
      }
    });
  }

  /* ==========================================================================
     11. FOOTER NEWSLETTER SUBSCRIPTION
     ========================================================================== */
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmail = document.getElementById('newsletter-email');
  const newsletterFeedback = document.getElementById('newsletter-feedback');

  if (newsletterForm && newsletterEmail && newsletterFeedback) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterEmail.value.trim();

      if (!validateEmail(email)) {
        newsletterFeedback.textContent = 'Please enter a valid email address.';
        newsletterFeedback.style.color = 'var(--danger)';
        return;
      }

      newsletterFeedback.textContent = '✓ Welcome! You have successfully subscribed to IronPulse briefings.';
      newsletterFeedback.style.color = 'var(--accent-primary)';
      newsletterEmail.value = '';

      setTimeout(() => {
        newsletterFeedback.textContent = '';
      }, 5000);
    });
  }

  /* ==========================================================================
     12. DYNAMIC YEAR
     ========================================================================== */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
