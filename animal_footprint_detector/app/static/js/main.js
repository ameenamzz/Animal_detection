document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const detectBtn = document.getElementById('detectBtn');
    const result = document.getElementById('result');
    const animalName = document.getElementById('animalName');
    const confidence = document.getElementById('confidence');
    const loading = document.getElementById('loading');
    const preloader = document.getElementById('preloader');

    // Hide initial page load preloader
    window.addEventListener('load', function() {
        preloader.style.opacity = '0';
        setTimeout(function() {
            preloader.style.display = 'none';
        }, 500);
    });

    detectBtn.addEventListener('click', async () => {
        const file = imageUpload.files[0];
        if (!file) {
            alert('Please select an image first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        
        // Show loading spinner
        loading.classList.remove('hidden');
        result.classList.add('hidden');

        try {
            const response = await fetch('/detector', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.error) {
                alert(data.error);
            } else {
                // Update the result section
                animalName.textContent = data.animal;
                confidence.textContent = `Confidence: ${(data.confidence * 100).toFixed(2)}%`;
                
                // Display the processed image
                if (data.processed_image) {
                    const processedImage = document.getElementById('processedImage');
                    processedImage.src = `data:image/png;base64,${data.processed_image}`;
                }
                
                result.classList.remove('hidden');

                // Animate the result
                gsap.from(result, {
                    opacity: 0,
                    y: 20,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while processing the image.');
        } finally {
            loading.classList.add('hidden');
        }
    });

    imageUpload.addEventListener('change', (event) => {
        const fileName = event.target.files[0]?.name;
        if (fileName) {
            const fileNameDisplay = document.createElement('p');
            fileNameDisplay.textContent = `Selected: ${fileName}`;
            fileNameDisplay.className = 'text-sm text-primary mt-2';
            const existingDisplay = imageUpload.parentElement.querySelector('p');
            if (existingDisplay) {
                existingDisplay.remove();
            }
            imageUpload.parentElement.appendChild(fileNameDisplay);
        }
    });
});

// Three.js animation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('animationCanvas'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const torusKnot = new THREE.Mesh(geometry, material);
scene.add(torusKnot);

camera.position.z = 30;

function animate() {
    requestAnimationFrame(animate);
    torusKnot.rotation.x += 0.01;
    torusKnot.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
