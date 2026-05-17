async function includeComponents() {
    const headerElement = document.querySelector('header');
    if (headerElement) {
        const response = await fetch('/components/header.html');
        const headerContent = await response.text();
        headerElement.innerHTML = headerContent;
    }
    
    const footerElement = document.querySelector('footer');
    if (footerElement) {
        const response = await fetch('/components/footer.html');
        const footerContent = await response.text();
        footerElement.innerHTML = footerContent;
    }
}

document.addEventListener('DOMContentLoaded', includeComponents);