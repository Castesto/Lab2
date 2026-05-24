document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    const slidesContainer = document.querySelector('.slides');
    const slides = document.querySelectorAll('.slides img');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const dotsContainer = document.querySelector('.slider-dots');
    
    if (slides.length === 0) return;
    
    let currentIndex = 0;
    let autoInterval;
    const autoDelay = 4000;
    
    function createDots() {
        dotsContainer.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === currentIndex) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
    }
    
    function updateSlider() {
        slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }
    
    function goToSlide(index) {
        currentIndex = (index + slides.length) % slides.length;
        updateSlider();
        resetAutoPlay();
    }
    
    function nextSlide() {
        goToSlide(currentIndex + 1);
    }
    
    function prevSlide() {
        goToSlide(currentIndex - 1);
    }
    
    function startAutoPlay() {
        autoInterval = setInterval(nextSlide, autoDelay);
    }
    
    function resetAutoPlay() {
        clearInterval(autoInterval);
        startAutoPlay();
    }
    
    slider.addEventListener('mouseenter', () => clearInterval(autoInterval));
    slider.addEventListener('mouseleave', startAutoPlay);
    
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    createDots();
    startAutoPlay();
});