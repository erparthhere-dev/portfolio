const slides = document.querySelectorAll(".slide");
const totalSlides = slides.length;

let currentIndex = 0;
let isAnimating = false;

function updateCounter(index) {
  const currentSlideEl = document.querySelector(".current-slide");
  if (currentSlideEl) {
    currentSlideEl.textContent = String(index + 1).padStart(2, "0");
  }

  const thumbs = document.querySelectorAll(".slide-thumb");
  thumbs.forEach((thumb) => {
    const thumbIndex = parseInt(thumb.dataset.slide, 10);
    thumb.classList.toggle("active", thumbIndex === index);
  });
}

/**
 * direction: 1 = forward (new slide enters from bottom)
 *           -1 = backward (new slide enters from top)
 * Direction is ALWAYS explicitly provided by the caller — never guessed.
 */
function goToSlide(targetIndex, direction) {
  if (isAnimating) return;
  if (targetIndex === currentIndex) return;

  isAnimating = true;

  const currentSlide = slides[currentIndex];
  const upcomingSlide = slides[targetIndex];

  gsap.timeline({
    onStart: () => {
      upcomingSlide.classList.add("slide--current");
      gsap.set(upcomingSlide, { zIndex: 2 });
      gsap.set(currentSlide, { zIndex: 1 });
    },
    onComplete: () => {
      currentSlide.classList.remove("slide--current");
      gsap.set(upcomingSlide, { clearProps: "zIndex" });
      gsap.set(currentSlide, { clearProps: "zIndex" });

      currentIndex = targetIndex;
      updateCounter(currentIndex);
      isAnimating = false;
    }
  })
  .fromTo(upcomingSlide,
    { autoAlpha: 1, scale: 0.3, yPercent: direction === 1 ? 100 : -100 },
    { duration: 0.7, ease: "expo.out", scale: 1, yPercent: 0 }
  )
  .to(currentSlide,
    { duration: 0.5, ease: "power2.out", scale: 0.95, autoAlpha: 0 },
    0.1
  );
}

function nextSlide() {
  const targetIndex = (currentIndex + 1) % totalSlides;
  goToSlide(targetIndex, 1);
}

function prevSlide() {
  const targetIndex = (currentIndex - 1 + totalSlides) % totalSlides;
  goToSlide(targetIndex, -1);
}

function goToSlideDirect(targetIndex) {
  // Used for thumbnail clicks - direction is simply based on index comparison
  // since there's no "natural" direction for an arbitrary jump
  if (targetIndex === currentIndex) return;
  const direction = targetIndex > currentIndex ? 1 : -1;
  goToSlide(targetIndex, direction);
}

// --- Input handlers ---

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown" || e.key === "ArrowRight") {
    nextSlide();
  } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
    prevSlide();
  }
});

let lastInputTime = 0;

document.addEventListener("wheel", (e) => {
  const now = Date.now();
  if (now - lastInputTime < 100) return; // ignore if touch just fired
  lastInputTime = now;

  if (e.deltaY > 0) {
    nextSlide();
  } else {
    prevSlide();
  }
});

let touchStartY = 0;

document.addEventListener("touchstart", (e) => {
  touchStartY = e.touches[0].clientY;
});

document.addEventListener("touchend", (e) => {
  lastInputTime = Date.now(); // mark that touch just fired

  const touchEndY = e.changedTouches[0].clientY;
  const diff = touchStartY - touchEndY;

  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }
});
document.querySelector(".prev-slide").addEventListener("click", prevSlide);
document.querySelector(".next-slide").addEventListener("click", nextSlide);

document.querySelectorAll(".slide-thumb").forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const targetIndex = parseInt(thumb.dataset.slide, 10);
    goToSlideDirect(targetIndex);
  });
});

// Initialize counter/thumbnail state on page load
updateCounter(currentIndex);

const aboutPhoto = document.querySelector(".about-photo");
if (aboutPhoto) {
  aboutPhoto.addEventListener("click", () => {
    aboutPhoto.classList.toggle("revealed");
  });
}