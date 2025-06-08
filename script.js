let currentPage = 1;
const itemsPerPage = 1; // Mostrar una carpeta por página

let currentMediaIndex = 0;
let currentMedia = [];

// Collection of romantic love quotes in Spanish
const loveQuotes = [
    "El amor no necesita ser perfecto, solo necesita ser verdadero.",
    "Contigo, cada día es una nueva aventura llena de amor.",
    "Eres el mejor capítulo de mi historia de amor.",
    "El tiempo se detiene cuando estoy contigo.",
    "Te amo más de lo que las palabras pueden expresar.",
    "Nuestro amor es como una fotografía, se revela con el tiempo.",
    "Eres mi persona favorita en este mundo.",
    "Cada momento contigo es un tesoro para siempre.",
    "Amarte es fácil, porque lo haces todo especial.",
    "Gracias por ser parte de mi historia de amor.",
    "Mi corazón sonríe cuando pienso en ti.",
    "Tú eres mi hoy y todos mis mañanas.",
    "En tu amor encontré mi hogar."
];

document.addEventListener('DOMContentLoaded', () => {
    // Create floating hearts background
    createFloatingHearts();
    
    // Create initial heart burst effect
    createHeartBurst();
    
    // Start rotating love quotes
    startRotatingQuotes();
    
    // Load albums
    cargarSalidas();

    // Paginación
    document.getElementById('nextPage').addEventListener('click', () => {
        currentPage++;
        cargarSalidas();
    });

    document.getElementById('prevPage').addEventListener('click', () => {
        currentPage--;
        cargarSalidas();
    });

    // Add event listener for modal navigation
    const modal = document.getElementById('imageModal');
    const modalContent = document.getElementById('modalContent');
    const closeModal = modal.querySelector('.close');
    const prevButton = modal.querySelector('.prev');
    const nextButton = modal.querySelector('.next');

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        modalContent.innerHTML = ''; // Clear the content when closing
    });

    prevButton.addEventListener('click', () => {
        if (currentMediaIndex > 0) {
            currentMediaIndex--;
            updateModalContent(currentMedia[currentMediaIndex]);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentMediaIndex < currentMedia.length - 1) {
            currentMediaIndex++;
            updateModalContent(currentMedia[currentMediaIndex]);
        }
    });
    
    // Close modal when clicking outside the content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modalContent.innerHTML = '';
        }
    });
});

// Create floating hearts in the background
function createFloatingHearts() {
    const heartsContainer = document.getElementById('floating-hearts');
    const numHearts = 30;
    
    for (let i = 0; i < numHearts; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '❤️';
        heart.style.left = `${Math.random() * 100}%`;
        heart.style.opacity = Math.random() * 0.5;
        heart.style.fontSize = `${Math.random() * 20 + 10}px`;
        
        // Set different animation duration and delay for each heart
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 10;
        
        heart.style.animationDuration = `${duration}s, ${duration * 0.8}s`;
        heart.style.animationDelay = `${delay}s, ${delay}s`;
        
        heartsContainer.appendChild(heart);
    }
}

// Create heart burst effect on page load
function createHeartBurst() {
    const burstContainer = document.getElementById('heart-burst');
    
    for (let i = 0; i < 50; i++) {
        const heart = document.createElement('div');
        heart.innerHTML = '❤️';
        heart.style.position = 'absolute';
        heart.style.left = '50%';
        heart.style.top = '50%';
        heart.style.fontSize = `${Math.random() * 20 + 10}px`;
        heart.style.opacity = Math.random() * 0.8 + 0.2;
        
        // Random position and animation
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100 + 50;
        const duration = Math.random() * 2 + 1;
        const delay = Math.random() * 0.5;
        
        heart.style.animation = `burstHeart ${duration}s ease-out ${delay}s forwards`;
        heart.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
        
        const keyframes = `
            @keyframes burstHeart {
                0% { 
                    transform: translate(-50%, -50%) scale(0); 
                    opacity: 0;
                }
                20% { 
                    opacity: 0.8;
                }
                100% { 
                    transform: translate(
                        calc(-50% + ${Math.cos(angle) * distance}px), 
                        calc(-50% + ${Math.sin(angle) * distance}px)
                    ) scale(1);
                    opacity: 0;
                }
            }
        `;
        
        const style = document.createElement('style');
        style.innerHTML = keyframes;
        document.head.appendChild(style);
        
        burstContainer.appendChild(heart);
    }
}

// Rotate through love quotes
function startRotatingQuotes() {
    const quoteElement = document.getElementById('love-quote');
    let currentQuoteIndex = 0;
    
    // Update with initial quote
    quoteElement.textContent = loveQuotes[currentQuoteIndex];
    
    // Change quote every 10 seconds
    setInterval(() => {
        currentQuoteIndex = (currentQuoteIndex + 1) % loveQuotes.length;
        
        // Fade out
        quoteElement.style.opacity = 0;
        
        // Change text and fade in after a small delay
        setTimeout(() => {
            quoteElement.textContent = loveQuotes[currentQuoteIndex];
            quoteElement.style.opacity = 1;
        }, 500);
    }, 10000);
}

function updateModalContent(mediaPath) {
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = ''; // Clear previous content

    if (/\.(jpg|jpeg|png|gif)$/i.test(mediaPath)) {
        // If image
        const img = document.createElement('img');
        img.src = `/uploads/${mediaPath}`;
        img.alt = 'Foto ampliada';
        modalContent.appendChild(img);
    } else if (/\.mp4$/i.test(mediaPath)) {
        // If video
        const video = document.createElement('video');
        video.src = `/uploads/${mediaPath}`;
        video.controls = true;
        video.autoplay = true;
        modalContent.appendChild(video);
    }
}

async function cargarSalidas() {
    const contenedor = document.getElementById('contenedor-salidas');
    contenedor.innerHTML = ''; // Limpiar el contenedor antes de mostrar las nuevas salidas

    try {
        const respuesta = await fetch('/api/salidas');
        const salidas = await respuesta.json();

        const totalItems = salidas.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        // Mostrar la página actual
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const salidasPagina = salidas.slice(start, end);

        salidasPagina.forEach(salida => {
            const div = document.createElement('div');
            div.className = 'salida';

            // Extract display name from folder name
            let displayName = salida.nombre;
            let carpetaOriginal = salida.nombre; // Guardamos el nombre original
            
            if (displayName.includes('_')) {
                displayName = displayName.split('_')[1]; // Get part after the date
            }

            const titulo = document.createElement('h3');
            titulo.textContent = displayName;
            div.appendChild(titulo);

            const archivosDiv = document.createElement('div');
            archivosDiv.className = 'fotos';

            // Make sure we're handling the correct field name from the server
            const archivos = salida.archivos || salida.fotos;
            
            if (!archivos || archivos.length === 0) {
                const noImages = document.createElement('p');
                noImages.textContent = 'No hay imágenes en esta carpeta';
                archivosDiv.appendChild(noImages);
            } else {
                archivos.forEach((archivo, index) => {
                    if (/\.(jpg|jpeg|png|gif)$/i.test(archivo)) {
                        const fotoContainer = document.createElement('div');
                        fotoContainer.className = 'foto-item';
                        
                        const img = document.createElement('img');
                        img.src = `/uploads/${carpetaOriginal}/${archivo}`;
                        img.alt = 'Foto de salida';
                        img.loading = "lazy"; // Lazy loading for better performance
                        
                        img.addEventListener('click', () => {
                            currentMedia = archivos.map(arch => `/uploads/${carpetaOriginal}/${arch}`);
                            currentMediaIndex = index;
                            const modal = document.getElementById('imageModal');
                            modal.style.display = 'block';
                            updateModalContent(`${carpetaOriginal}/${archivo}`);
                        });
                        
                        fotoContainer.appendChild(img);
                        archivosDiv.appendChild(fotoContainer);
                    } else if (/\.mp4$/i.test(archivo)) {
                        const videoContainer = document.createElement('div');
                        videoContainer.className = 'foto-item';
                        
                        const video = document.createElement('video');
                        video.src = `/uploads/${carpetaOriginal}/${archivo}`;
                        video.controls = true;
                        video.preload = "metadata";
                        
                        video.addEventListener('click', () => {
                            currentMedia = archivos.map(arch => `/uploads/${carpetaOriginal}/${arch}`);
                            currentMediaIndex = index;
                            const modal = document.getElementById('imageModal');
                            modal.style.display = 'block';
                            updateModalContent(`${carpetaOriginal}/${archivo}`);
                        });
                        
                        videoContainer.appendChild(video);
                        archivosDiv.appendChild(videoContainer);
                    }
                });
            }

            div.appendChild(archivosDiv);
            contenedor.appendChild(div);
        });

        // Actualizar información de paginación
        document.getElementById('pageInfo').textContent = `Página ${currentPage} de ${totalPages}`;
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === totalPages;
    } catch (error) {
        console.error('Error al cargar las salidas:', error);
        const contenedor = document.getElementById('contenedor-salidas');
        contenedor.innerHTML = '<p class="error">Error al cargar las imágenes. Por favor, intenta de nuevo más tarde.</p>';
    }
} 