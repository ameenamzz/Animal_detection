let scene, camera, renderer, particles;

function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    createParticles();

    camera.position.z = 5;

    animate();
}

function createParticles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 2000 - 1000;
        const y = Math.random() * 2000 - 1000;
        const z = Math.random() * 2000 - 1000;

        vertices.push(x, y, z);

        const color = new THREE.Color();
        color.setHSL(Math.random(), 0.7, 0.5);
        colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function animate() {
    requestAnimationFrame(animate);

    particles.rotation.x += 0.0005;
    particles.rotation.y += 0.0005;

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

document.addEventListener('DOMContentLoaded', () => {
    initScene();

    const imageUpload = document.getElementById('imageUpload');
    const detectBtn = document.getElementById('detectBtn');
    const result = document.getElementById('result');
    const animalName = document.getElementById('animalName');
    const confidence = document.getElementById('confidence');
    const loading = document.getElementById('loading');
    const customModal = document.getElementById('customModal');
    const modalOkBtn = document.getElementById('modalOkBtn');

    detectBtn.addEventListener('click', async () => {
        const file = imageUpload.files[0];
        if (!file) {
            customModal.classList.remove('hidden');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        loading.classList.remove('hidden');

        try {
            const response = await fetch('/', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.error) {
                alert(data.error);
            } else {
                animalName.textContent = data.animal;
                confidence.textContent = `Confidence: ${(data.confidence * 100).toFixed(2)}%`;
                result.classList.remove('hidden');

                // Animate the result
                gsap.from(result, {
                    opacity: 0,
                    y: 20,
                    duration: 0.5,
                    ease: 'power2.out'
                });

                // Highlight detected animal in the particle system
                highlightAnimal(data.animal);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while processing the image.');
        } finally {
            loading.classList.add('hidden');
        }
    });

    modalOkBtn.addEventListener('click', () => {
        customModal.classList.add('hidden');
    });
});

function highlightAnimal(animal) {
    const geometry = particles.geometry;
    const colors = geometry.attributes.color;

    for (let i = 0; i < colors.count; i++) {
        const color = new THREE.Color();
        if (i % 5 === 0) {
            color.setHSL(0.5, 1, 0.5); // Highlight color
        } else {
            color.setHSL(Math.random(), 0.7, 0.5);
        }
        colors.setXYZ(i, color.r, color.g, color.b);
    }

    colors.needsUpdate = true;

    // Animate the particles
    gsap.to(particles.rotation, {
        x: particles.rotation.x + Math.PI * 2,
        y: particles.rotation.y + Math.PI * 2,
        duration: 2,
        ease: 'power2.inOut'
    });
}
