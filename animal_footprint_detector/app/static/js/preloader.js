document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const planet = document.getElementById('planet');

    // Animate the planet along the orbit
    gsap.to(planet, {
        duration: 2,
        repeat: -1,
        ease: "linear",
        motionPath: {
            path: "#orbit",
            align: "#orbit",
            autoRotate: true,
            alignOrigin: [0.5, 0.5]
        }
    });

    // Hide preloader when the page is fully loaded
    window.addEventListener('load', () => {
        gsap.to(preloader, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                preloader.style.display = 'none';
            }
        });
    });
});
