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
                // Add result-item class and nested elements for AI Help button to use
                card.classList.add('result-item');
                
                // Add hidden span elements with species info for AI Help to extract
                const speciesName = document.createElement('span');
                speciesName.className = 'species-name hidden';
                speciesName.textContent = detection.animal;
                
                const confidenceValue = document.createElement('span');
                confidenceValue.className = 'confidence-value hidden';
                confidenceValue.textContent = (detection.confidence * 100).toFixed(1) + '%';
                
                card.appendChild(speciesName);
                card.appendChild(confidenceValue);
                
                modalDetectionsList.appendChild(card);
            });
            
            // Add AI Help button to the modal
            const aiHelpButton = document.createElement('button');
            aiHelpButton.id = 'modalAiHelpBtn';
            aiHelpButton.className = 'mt-4 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg transition-all duration-300 rounded-full shadow-lg hover:shadow-purple-500/50 hover:-translate-y-1 transform w-full';
            aiHelpButton.innerHTML = `
                <span class="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Get AI Help
                </span>
            `;
            
            // Add AI response container
            const aiResponseContainer = document.createElement('div');
            aiResponseContainer.id = 'modalAiHelpResponse';
            aiResponseContainer.className = 'mt-4 p-4 bg-purple-800/50 rounded-lg hidden';
            aiResponseContainer.innerHTML = `
                <h4 class="text-lg text-white mb-2">AI Analysis:</h4>
                <div id="modalAiResponseContent" class="text-white"></div>
            `;
            
            // Add button and response container to the modal
            document.querySelector('#modalDetectionsList').parentNode.appendChild(aiHelpButton);
            document.querySelector('#resultModal .relative').appendChild(aiResponseContainer);
            
            // Add event listener for the AI Help button
            aiHelpButton.addEventListener('click', function() {
                const detectedSpecies = [];
                
                // Collect detected species from the results
                document.querySelectorAll('#modalDetectionsList .result-item').forEach(item => {
                    const speciesName = item.querySelector('.species-name').textContent;
                    const confidence = item.querySelector('.confidence-value').textContent;
                    detectedSpecies.push({ species: speciesName, confidence: confidence });
                });
                
                // Call API to get AI help
                getModalAIHelp(detectedSpecies);
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

    // Add event listener for AI Help button
    document.getElementById('aiHelpBtn').addEventListener('click', function() {
        const detectedSpecies = [];
        
        // Collect detected species from the results
        document.querySelectorAll('#detectionResults .result-item').forEach(item => {
            const speciesName = item.querySelector('.species-name').textContent;
            const confidence = item.querySelector('.confidence-value').textContent;
            detectedSpecies.push({ species: speciesName, confidence: confidence });
        });
        
        // Call API to get AI help
        getAIHelp(detectedSpecies);
    });

    // Function to get AI help for the modal - updated to open a separate modal
    function getModalAIHelp(detectedSpecies) {
        // Show the loading indicator in the AI Analysis modal
        document.getElementById('aiAnalysisContent').innerHTML = '<div class="flex justify-center"><div class="loader"></div></div>';
        document.getElementById('aiAnalysisModal').classList.remove('hidden');
        
        // Make API call to your backend
        fetch('/get_ai_help', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ detections: detectedSpecies }),
        })
        .then(response => response.json())
        .then(data => {
            // Parse markdown and display AI response in the dedicated modal
            document.getElementById('aiAnalysisContent').innerHTML = marked.parse(data.response);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('aiAnalysisContent').innerHTML = 'Error fetching AI help. Please try again.';
        });
    }

    // Function to get AI help - updated to open a separate modal
    function getAIHelp(detectedSpecies) {
        // Show the loading indicator in the AI Analysis modal
        document.getElementById('aiAnalysisContent').innerHTML = '<div class="flex justify-center"><div class="loader"></div></div>';
        document.getElementById('aiAnalysisModal').classList.remove('hidden');
        
        // Make API call to your backend
        fetch('/get_ai_help', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ detections: detectedSpecies }),
        })
        .then(response => response.json())
        .then(data => {
            // Parse markdown and display AI response in the dedicated modal
            document.getElementById('aiAnalysisContent').innerHTML = marked.parse(data.response);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('aiAnalysisContent').innerHTML = 'Error fetching AI help. Please try again.';
        });
    }

    // Add event listeners for the new modal when the DOM is loaded
    const closeAiAnalysisModal = document.getElementById('closeAiAnalysisModal');
    const goBackButton = document.getElementById('goBackButton');
    const aiAnalysisModal = document.getElementById('aiAnalysisModal');
    
    // Close AI Analysis modal when clicking the close button
    if (closeAiAnalysisModal) {
        closeAiAnalysisModal.addEventListener('click', () => {
            aiAnalysisModal.classList.add('hidden');
        });
    }
    
    // Go back to the results modal when clicking Go Back button
    if (goBackButton) {
        goBackButton.addEventListener('click', () => {
            aiAnalysisModal.classList.add('hidden');
        });
    }
    
    // Close AI Analysis modal when clicking outside the content
    aiAnalysisModal.addEventListener('click', (e) => {
        if (e.target === aiAnalysisModal) {
            aiAnalysisModal.classList.add('hidden');
        }
    });
    
    // Close AI Analysis modal when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !aiAnalysisModal.classList.contains('hidden')) {
            aiAnalysisModal.classList.add('hidden');
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
