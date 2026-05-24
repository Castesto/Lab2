async function includeComponents() {
    const headerElement = document.querySelector('header');
    if (headerElement) {
        const response = await fetch('/components/header.html');
        const headerContent = await response.text();
        headerElement.innerHTML = headerContent;

        if (typeof window.updateAuthButtons === 'function') {
            window.updateAuthButtons();
        }
    }

    const footerElement = document.querySelector('footer');
    if (footerElement) {
        const response = await fetch('/components/footer.html');
        const footerContent = await response.text();
        footerElement.innerHTML = footerContent;
    }
}


window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(function() {
            preloader.style.display = 'none';
        }, 300);
    }
});

document.addEventListener('DOMContentLoaded', includeComponents);  