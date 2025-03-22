document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const detectBtn = document.getElementById('detectBtn');
    const result = document.getElementById('result');
    const detectionsList = document.getElementById('detectionsList');
    const detectionCount = document.getElementById('detectionCount');
    const loading = document.getElementById('loading');
    const preloader = document.getElementById('preloader');

    // Hide initial page load preloader
    window.addEventListener('load', function() {
        preloader.style.opacity = '0';
        setTimeout(function() {
            preloader.style.display = 'none';
        }, 500);
    });

    // Generate a color for each animal type (for consistency in the UI)
    const animalColors = {};
    function getColorForAnimal(animal) {
        if (!animalColors[animal]) {
            // Generate a color based on the animal name
            const hash = animal.split('').reduce((acc, char) => {
                return char.charCodeAt(0) + ((acc << 5) - acc);
            }, 0);
            const h = Math.abs(hash) % 360;
            animalColors[animal] = `hsl(${h}, 80%, 65%)`;
        }
        return animalColors[animal];
    }

    // Create a detection card for each animal
    function createDetectionCard(detection, index) {
        const card = document.createElement('div');
        card.className = 'detection-card bg-gray-800 bg-opacity-70 rounded-lg p-3 transition-all duration-300 hover:transform hover:scale-105 border-l-4';
        card.style.borderLeftColor = getColorForAnimal(detection.animal);
        
        // Add entrance animation delay based on index
        card.style.animation = `fadeIn 0.5s ease ${index * 0.1}s both`;
        
        const detectionHTML = `
            <div class="flex justify-between items-center">
                <h4 class="text-xl font-bold text-[#06b6d4] glow-text">${detection.animal}</h4>
                <span class="confidence-badge">${(detection.confidence * 100).toFixed(1)}%</span>
            </div>
        `;
        
        card.innerHTML = detectionHTML;
        return card;
    }

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
        
        try {
            const response = await fetch('/detector', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            // Hide loading spinner
            loading.classList.add('hidden');

            if (data.error) {
                alert(data.error);
            } else {
                // Populate the modal with results
                populateResultModal(data);
                
                // Show the result modal
                document.getElementById('resultModal').classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while processing the image.');
            loading.classList.add('hidden');
        }
    });

    // Function to populate the result modal
    function populateResultModal(data) {
        const modalDetectionsList = document.getElementById('modalDetectionsList');
        const modalDetectionCount = document.getElementById('modalDetectionCount');
        const modalProcessedImage = document.getElementById('modalProcessedImage');
        
        // Clear previous results
        modalDetectionsList.innerHTML = '';
        
        // Update detection count
        const count = data.count || 0;
        modalDetectionCount.textContent = count === 0 
            ? 'No footprints detected' 
            : `${count} footprint${count === 1 ? '' : 's'} detected`;
        
        // Display the processed image
        if (data.processed_image) {
            modalProcessedImage.src = `data:image/png;base64,${data.processed_image}`;
        }
        
        // Add each detection
        if (data.detections && data.detections.length > 0) {
            data.detections.forEach((detection, index) => {
                const card = createDetectionCard(detection, index);
                modalDetectionsList.appendChild(card);
            });
        }
    }

    // Close result modal when clicking the close button
    document.getElementById('closeResultModal').addEventListener('click', () => {
        document.getElementById('resultModal').classList.add('hidden');
    });

    // Close result modal when clicking outside
    document.getElementById('resultModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('resultModal')) {
            document.getElementById('resultModal').classList.add('hidden');
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
