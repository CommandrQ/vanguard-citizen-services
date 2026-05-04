/* VSR SMART LINK CONTROLLER */
document.addEventListener("DOMContentLoaded", function() {
    const links = document.querySelectorAll('a');

    links.forEach(link => {
        const href = link.getAttribute('href');

        // Check if link exists and is not just a fragment/anchor (#)
        if (href && href !== "#") {
            // If it starts with http, https, or //, it's an external site
            if (href.startsWith('http') || href.startsWith('//')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            } else {
                // Internal links stay in the same tab
                link.setAttribute('target', '_self');
            }
        }
    });
});
