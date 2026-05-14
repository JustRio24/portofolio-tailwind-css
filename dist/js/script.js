// ============================================================
// Hamburger Menu
// ============================================================
const hamburger = document.querySelector("#hamburger");
const navMenu = document.querySelector("#nav-menu");

hamburger.addEventListener("click", function () {
  hamburger.classList.toggle("hamburger-active");
  navMenu.classList.toggle("hidden");
});

// Close nav when clicking outside
window.addEventListener("click", function (e) {
  if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
    hamburger.classList.remove("hamburger-active");
    navMenu.classList.add("hidden");
  }
});

// Close nav when a nav link is clicked (mobile)
document.querySelectorAll(".nav-link").forEach(function (link) {
  link.addEventListener("click", function () {
    hamburger.classList.remove("hamburger-active");
    navMenu.classList.add("hidden");
  });
});

// ============================================================
// Navbar Fixed on Scroll + Back to Top
// ============================================================
window.addEventListener("scroll", function () {
  const header = document.querySelector("header");
  const toTop = document.querySelector("#to-top");

  if (window.scrollY > 50) {
    header.classList.add("navbar-fixed");
    toTop.classList.remove("hidden");
    toTop.classList.add("flex");
  } else {
    header.classList.remove("navbar-fixed");
    toTop.classList.add("hidden");
    toTop.classList.remove("flex");
  }
});

// ============================================================
// Dark Mode Toggle
// ============================================================
const darkToggle = document.querySelector("#dark-toggle");
const html = document.querySelector("html");

// FIX: was "prefers-colors-scheme" (typo), now correct
if (
  localStorage.theme === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  darkToggle.checked = true;
} else {
  darkToggle.checked = false;
}

darkToggle.addEventListener("click", function () {
  if (darkToggle.checked) {
    html.classList.add("dark");
    localStorage.theme = "dark";
  } else {
    html.classList.remove("dark");
    localStorage.theme = "light";
  }
});

// ============================================================
// Active Nav Link on Scroll (Intersection Observer)
// ============================================================
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

const observerOptions = {
  root: null,
  rootMargin: "-40% 0px -55% 0px",
  threshold: 0,
};

const sectionObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      navLinks.forEach(function (link) {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + entry.target.id) {
          link.classList.add("active");
        }
      });
    }
  });
}, observerOptions);

sections.forEach(function (section) {
  sectionObserver.observe(section);
});

// ============================================================
// Skill Bar Animation (Intersection Observer)
// ============================================================
const skillBars = document.querySelectorAll(".skill-bar[data-width]");

const skillObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.width = bar.getAttribute("data-width");
        skillObserver.unobserve(bar);
      }
    });
  },
  { threshold: 0.3 }
);

skillBars.forEach(function (bar) {
  skillObserver.observe(bar);
});

// ============================================================
// Project Image Carousel (per-card internal slideshow)
// ============================================================
var sliderStates = {};

function initSlider(sliderId) {
  var slider = document.getElementById(sliderId);
  if (!slider) return;
  var track = slider.querySelector(".proj-slider-track");
  if (!track) return;
  var total = track.querySelectorAll(".proj-slide").length;
  sliderStates[sliderId] = { current: 0, total: total, timer: null };
  startAutoPlay(sliderId);
  slider.addEventListener("mouseenter", function () { stopAutoPlay(sliderId); });
  slider.addEventListener("mouseleave", function () { startAutoPlay(sliderId); });
}

function updateSlider(sliderId) {
  var state = sliderStates[sliderId];
  if (!state) return;
  var slider = document.getElementById(sliderId);
  if (!slider) return;
  var track = slider.querySelector(".proj-slider-track");
  var counter = slider.querySelector(".proj-counter");
  var dotsContainer = slider.querySelector(".proj-dots");
  if (track) track.style.transform = "translateX(-" + state.current * 100 + "%)";
  if (counter) counter.textContent = state.current + 1 + " / " + state.total;
  if (dotsContainer) {
    dotsContainer.querySelectorAll(".proj-dot").forEach(function (dot, i) {
      dot.classList.toggle("active", i === state.current);
    });
  }
}

function slideProject(sliderId, dir) {
  var state = sliderStates[sliderId];
  if (!state) return;
  state.current = (state.current + dir + state.total) % state.total;
  updateSlider(sliderId);
}

function goToSlide(sliderId, index) {
  var state = sliderStates[sliderId];
  if (!state) return;
  state.current = index;
  updateSlider(sliderId);
}

function startAutoPlay(sliderId) {
  stopAutoPlay(sliderId);
  sliderStates[sliderId].timer = setInterval(function () {
    slideProject(sliderId, 1);
  }, 3000);
}

function stopAutoPlay(sliderId) {
  if (sliderStates[sliderId] && sliderStates[sliderId].timer) {
    clearInterval(sliderStates[sliderId].timer);
    sliderStates[sliderId].timer = null;
  }
}

// ============================================================
// Projects Infinite Marquee (JS-driven, draggable, seamless)
// ============================================================
document.addEventListener("DOMContentLoaded", function () {
  var wrapper = document.getElementById("projects-marquee-wrapper");
  var track   = document.getElementById("projects-marquee-track");
  if (!wrapper || !track) return;

  var GAP = 24; // must match CSS gap

  // --- 1. Clone all cards once for seamless loop ---
  var originalCards = Array.from(track.children);
  var cloneIdCounter = 100;
  originalCards.forEach(function (card) {
    var clone = card.cloneNode(true);
    // Give cloned sliders unique IDs
    clone.querySelectorAll(".proj-slider").forEach(function (sl) {
      var oldId = sl.id;
      var newId = "slider-c" + cloneIdCounter++;
      sl.id = newId;
      sl.querySelectorAll("button[onclick]").forEach(function (btn) {
        btn.setAttribute("onclick", btn.getAttribute("onclick").replace(oldId, newId));
      });
    });
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });

  // --- 2. Measure one full set width ---
  function getOneSetWidth() {
    var w = 0;
    for (var i = 0; i < originalCards.length; i++) {
      w += originalCards[i].offsetWidth + GAP;
    }
    return w;
  }

  var oneSetWidth = getOneSetWidth();
  window.addEventListener("resize", function () { oneSetWidth = getOneSetWidth(); });

  // --- 3. Auto-scroll state ---
  var scrollPos = 0;
  var speed = 1.5;              // px per frame
  var autoPlaying = true;
  var animId = null;

  function setTrackPos(x) {
    track.style.transform = "translateX(" + x + "px)";
  }

  function tick() {
    if (autoPlaying) {
      scrollPos += speed;
      // Seamless wrap: keep scrollPos within [-oneSetWidth, 0]
      while (scrollPos >= 0) {
        scrollPos -= oneSetWidth;
      }
      while (scrollPos < -oneSetWidth) {
        scrollPos += oneSetWidth;
      }
      setTrackPos(scrollPos);
    }
    animId = requestAnimationFrame(tick);
  }

  animId = requestAnimationFrame(tick);

  // --- 4. Drag / Swipe support ---
  var isDragging = false;
  var dragStartX = 0;
  var dragStartScroll = 0;
  var dragVelocity = 0;
  var lastDragX = 0;
  var lastDragTime = 0;

  function onDragStart(clientX) {
    isDragging = true;
    autoPlaying = false;
    dragStartX = clientX;
    dragStartScroll = scrollPos;
    dragVelocity = 0;
    lastDragX = clientX;
    lastDragTime = Date.now();
    wrapper.style.cursor = "grabbing";
  }

  function onDragMove(clientX) {
    if (!isDragging) return;
    var now = Date.now();
    var dt = now - lastDragTime || 1;
    var dx = clientX - lastDragX;
    dragVelocity = dx / dt; // px per ms

    var totalDx = clientX - dragStartX;
    scrollPos = dragStartScroll + totalDx;

    // Wrap seamlessly into [-oneSetWidth, 0]
    while (scrollPos <= -oneSetWidth) {
      scrollPos += oneSetWidth;
      dragStartScroll = scrollPos - totalDx;
    }
    while (scrollPos > 0) {
      scrollPos -= oneSetWidth;
      dragStartScroll = scrollPos - totalDx;
    }

    setTrackPos(scrollPos);
    lastDragX = clientX;
    lastDragTime = now;
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    wrapper.style.cursor = "grab";

    // Apply momentum
    var momentum = dragVelocity * 150;
    scrollPos += momentum;

    // Wrap into [-oneSetWidth, 0]
    while (scrollPos <= -oneSetWidth) scrollPos += oneSetWidth;
    while (scrollPos > 0) scrollPos -= oneSetWidth;

    setTrackPos(scrollPos);

    // Resume auto-play after short delay
    setTimeout(function () { autoPlaying = true; }, 1500);
  }

  // Mouse events
  wrapper.addEventListener("mousedown", function (e) {
    e.preventDefault();
    onDragStart(e.clientX);
  });
  window.addEventListener("mousemove", function (e) { onDragMove(e.clientX); });
  window.addEventListener("mouseup", onDragEnd);

  // Touch events
  wrapper.addEventListener("touchstart", function (e) {
    onDragStart(e.touches[0].clientX);
  }, { passive: true });
  wrapper.addEventListener("touchmove", function (e) {
    onDragMove(e.touches[0].clientX);
  }, { passive: true });
  wrapper.addEventListener("touchend", onDragEnd);

  // Pause auto-scroll on hover (without drag)
  wrapper.addEventListener("mouseenter", function () {
    if (!isDragging) autoPlaying = false;
  });
  wrapper.addEventListener("mouseleave", function () {
    if (!isDragging) autoPlaying = true;
  });

  // --- 5. Initialize all internal image carousels ---
  document.querySelectorAll(".proj-slider").forEach(function (slider) {
    if (slider.id) initSlider(slider.id);
  });
});
