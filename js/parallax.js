document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.querySelector('.gallery-container');
    const galleryImage = document.getElementById('galleryImage');
    
    if (!galleryContainer || !galleryImage) return;

    let ticking = false;

    function updateGalleryParallax() {
        const rect = galleryContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        let visibleRatio = (windowHeight - rect.top) / (windowHeight + rect.height);
        visibleRatio = Math.min(Math.max(visibleRatio, 0), 1);
        
        const translateY = (visibleRatio - 0.5) * 30;
        
        galleryImage.style.transform = `translateY(${translateY}px)`;
        
        if (visibleRatio > 0.1 && visibleRatio < 0.9) {
            galleryContainer.classList.add('parallax-active');
        } else {
            galleryContainer.classList.remove('parallax-active');
        }
        
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateGalleryParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onScroll);
    updateGalleryParallax(); 
});