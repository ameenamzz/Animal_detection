document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js scene
    initHeroParticles();
    
    // Initialize GSAP animations
    initGSAPAnimations();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Initialize particles
    initParticles();
    
    // Initialize counters
    initCounters();
});

const initHeroParticles = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true 
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('hero-particles').appendChild(renderer.domElement);

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 5000; // Increased particle count
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10; // Increased spread
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Create gradient texture for particles
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
    });

    const colors = new Float32Array(particlesCount * 3);
    const color1 = new THREE.Color('#4f46e5'); // Indigo
    const color2 = new THREE.Color('#7c3aed'); // Purple
    
    for(let i = 0; i < particlesCount * 3; i += 3) {
        const mixedColor = color1.clone().lerp(color2, Math.random());
        colors[i] = mixedColor.r;
        colors[i + 1] = mixedColor.g;
        colors[i + 2] = mixedColor.b;
    }
    
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    
    camera.position.z = 3;
    
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    const animate = () => {
        requestAnimationFrame(animate);
        
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x += 0.001;
        
        // Smooth camera movement following mouse
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
        
        renderer.render(scene, camera);
    };
    
    animate();
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

const initGSAPAnimations = () => {
    gsap.from('.animate-title', {
        duration: 1,
        y: 100,
        opacity: 0,
        ease: 'power4.out',
        delay: 0.2
    });

    gsap.from('.animate-subtitle', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power4.out',
        delay: 0.4
    });

    gsap.from('.animate-buttons', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power4.out',
        delay: 0.6
    });
};

const initScrollAnimations = () => {
    const controller = new ScrollMagic.Controller();

    document.querySelectorAll('.feature-card').forEach((card, index) => {
        new ScrollMagic.Scene({
            triggerElement: card,
            triggerHook: 0.8,
            reverse: false
        })
        .setTween(gsap.from(card, {
            duration: 0.8,
            y: 100,
            opacity: 0,
            delay: index * 0.2,
            ease: 'power4.out'
        }))
        .addTo(controller);
    });

    document.querySelectorAll('.step-card').forEach((card, index) => {
        new ScrollMagic.Scene({
            triggerElement: card,
            triggerHook: 0.8,
            reverse: false
        })
        .setTween(gsap.from(card, {
            duration: 0.8,
            x: -100,
            opacity: 0,
            delay: index * 0.2,
            ease: 'power4.out'
        }))
        .addTo(controller);
    });
};

const initParticles = () => {
    tsParticles.load("particles-js", {
        particles: {
            number: {
                value: 100,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#a855f7"
            },
            shape: {
                type: "circle"
            },
            opacity: {
                value: 0.5,
                random: true
            },
            size: {
                value: 3,
                random: true
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#a855f7",
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: true,
                    mode: "repulse"
                },
                resize: true
            }
        },
        retina_detect: true
    });
};

// Initialize counters
const initCounters = () => {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.round(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                updateCounter();
                observer.disconnect();
            }
        });

        observer.observe(counter);
    });
}; 