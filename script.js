// API Configuration
const API_BASE = 'https://openapi.programming-hero.com/api/peddy';

// Global state
let likedPets = [];
let currentCategory = 'cats'; // Set default category to 'cats'
let allPets = [];
let sortedByPrice = false;

// Core Functions
async function fetchPets() {
    showLoader();
    try {
        const response = await fetch(`${API_BASE}/pets`);
        const data = await response.json();
        // Ensure minimum 2 seconds loading time
        await new Promise(resolve => setTimeout(resolve, 2000));
        hideLoader();
        // API returns pets in a 'pets' array, so we need to adjust the structure
        return { data: data.pets || [] };
    } catch (error) {
        console.error('Error fetching pets:', error);
        hideLoader();
        return { data: [] }; // Return empty array on error
    }
}

async function fetchPetDetails(petId) {
    showLoader();
    try {
        const response = await fetch(`${API_BASE}/pet/${petId}`);
        const data = await response.json();
        // Ensure minimum 2 seconds loading time
        await new Promise(resolve => setTimeout(resolve, 2000));
        hideLoader();
        // API returns pet details in a different structure, adjust accordingly
        return { data: data.pet || {} };
    } catch (error) {
        console.error(`Error fetching details for pet ${petId}:`, error);
        hideLoader();
        return { data: {} }; // Return empty object on error
    }
}

async function fetchCategories() {
    showLoader();
    try {
        const response = await fetch(`${API_BASE}/categories`);
        const data = await response.json();
        // Ensure minimum 2 seconds loading time
        await new Promise(resolve => setTimeout(resolve, 2000));
        hideLoader();
        // API returns categories in a 'categories' array, so we need to adjust the structure
        return { data: data.categories || [] };
    } catch (error) {
        console.error('Error fetching categories:', error);
        hideLoader();
        return { data: [] }; // Return empty array on error
    }
}

async function fetchPetsByCategory(categoryName) {
    showLoader();
    try {
        const response = await fetch(`${API_BASE}/category/${categoryName}`);
        const data = await response.json();
        // Ensure minimum 2 seconds loading time
        await new Promise(resolve => setTimeout(resolve, 2000));
        hideLoader();
        // API returns pets by category in a 'pets' array, so we need to adjust the structure
        return { data: data.pets || [] };
    } catch (error) {
        console.error(`Error fetching pets for category ${categoryName}:`, error);
        hideLoader();
        return { data: [] }; // Return empty array on error
    }
}

// Loading spinner functions
function showLoader() {
    const loaderContainer = document.createElement('div');
    loaderContainer.id = 'loader-container';
    loaderContainer.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50';
    
    const loader = document.createElement('span');
    loader.className = 'loading loading-spinner loading-lg text-teal-600';
    
    loaderContainer.appendChild(loader);
    document.body.appendChild(loaderContainer);
}

function hideLoader() {
    const loader = document.getElementById('loader-container');
    if (loader) {
        loader.remove();
    }
}

// Mobile menu toggle functionality
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Banner "View More" button smooth scroll
function setupViewMoreButton() {
    const viewMoreBtn = document.getElementById('view-more-btn');
    const adoptSection = document.getElementById('adopt-section');
    
    if (viewMoreBtn && adoptSection) {
        viewMoreBtn.addEventListener('click', () => {
            adoptSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup view more button
    setupViewMoreButton();
    
    // Initialize the adopt section
    initializeAdoptSection();
    
    // Load all pets data for reference
    fetchPets().then(data => {
        allPets = data.data;
        
        // Load cats data by default (cats is already set as default category in global state)
        fetchPetsByCategory(currentCategory).then(catsData => {
            renderPets(sortedByPrice ? sortPetsByPrice(catsData.data) : catsData.data);
        });
    });
});

// Initialize the adopt section with categories
async function initializeAdoptSection() {
    const adoptSection = document.getElementById('adopt-section');
    
    // Create the section structure
    adoptSection.innerHTML = `
        <div class="text-center mb-8">
            <h2 class="text-3xl font-bold mb-2">Adopt Your Best Friend</h2>
            <p class="max-w-2xl mx-auto text-gray-600">
                It is a long established fact that a reader will be distracted by the readable content of a
                page when looking at its layout. The point of using Lorem Ipsum is that it has a.
            </p>
        </div>
        
        <div class="flex flex-col lg:flex-row gap-8">
            <!-- Left side: Categories and Pet Cards -->
            <div class="lg:w-2/3">
                <!-- Categories -->
                <div id="categories-container" class="flex flex-wrap gap-4 mb-8">
                    <!-- Categories will be loaded here -->
                </div>
                
                <!-- Best Deal heading and Sort button -->
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-semibold">Best Deal For you</h3>
                    <button id="sort-by-price" class="bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md text-sm">
                        Sort by Price
                    </button>
                </div>
                
                <!-- Pet Cards Grid or No Information Available -->
                <div id="pet-cards-container" class="min-h-[300px]">
                    <!-- Content will be dynamically loaded here -->
                </div>
            </div>
            
            <!-- Right side: Liked Pets -->
            <div class="lg:w-1/3">
                <!-- Added heading for liked pets section -->
                <h3 class="text-xl font-semibold mb-4">Liked Pets</h3>
                <div id="liked-pets-container" class="grid grid-cols-2 gap-4">
                    <!-- Liked pets will be added here -->
                </div>
            </div>
        </div>
    `;
    
    // Load categories
    const categoriesData = await fetchCategories();
    renderCategories(categoriesData.data);
    
    // Setup sort by price button
    document.getElementById('sort-by-price').addEventListener('click', () => {
        sortedByPrice = !sortedByPrice;
        if (currentCategory === 'all') {
            renderPets(sortPetsByPrice(allPets));
        } else {
            fetchPetsByCategory(currentCategory).then(data => {
                renderPets(sortPetsByPrice(data.data));
            });
        }
    });
}

// Rendering functions
function renderCategories(categories) {
    const container = document.getElementById('categories-container');
    if (!container) return;
    
    // Clear the container first
    container.innerHTML = '';
    
    // Add 'Dogs' category
    const dogsCategory = categories.find(cat => cat.category.toLowerCase() === 'dogs');
    if (dogsCategory) {
        const dogsBtn = document.createElement('button');
        dogsBtn.className = `flex items-center gap-2 px-6 py-3 rounded-full ${currentCategory === 'dogs' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-700'} hover:bg-teal-100 hover:text-teal-600 transition-colors`;
        dogsBtn.innerHTML = `<img src="${dogsCategory.image}" alt="Dogs" class="w-6 h-6"> Dogs`;
        dogsBtn.addEventListener('click', () => {
            setActiveCategory('dogs');
            fetchPetsByCategory('dogs').then(data => {
                renderPets(sortedByPrice ? sortPetsByPrice(data.data) : data.data);
            });
        });
        container.appendChild(dogsBtn);
    }
    
    // Add 'Cats' category (active by default)
    const catsCategory = categories.find(cat => cat.category.toLowerCase() === 'cats');
    if (catsCategory) {
        const catsBtn = document.createElement('button');
        // Make Cats active by default
        catsBtn.className = `flex items-center gap-2 px-6 py-3 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-100 hover:text-teal-600 transition-colors`;
        catsBtn.innerHTML = `<img src="${catsCategory.image}" alt="Cats" class="w-6 h-6"> Cats`;
        catsBtn.addEventListener('click', () => {
            setActiveCategory('cats');
            fetchPetsByCategory('cats').then(data => {
                renderPets(sortedByPrice ? sortPetsByPrice(data.data) : data.data);
            });
        });
        container.appendChild(catsBtn);
    }
    
    // Add 'Rabbits' category
    const rabbitsCategory = categories.find(cat => cat.category.toLowerCase() === 'rabbits');
    if (rabbitsCategory) {
        const rabbitsBtn = document.createElement('button');
        rabbitsBtn.className = `flex items-center gap-2 px-6 py-3 rounded-full ${currentCategory === 'rabbits' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-700'} hover:bg-teal-100 hover:text-teal-600 transition-colors`;
        rabbitsBtn.innerHTML = `<img src="${rabbitsCategory.image}" alt="Rabbits" class="w-6 h-6"> Rabbits`;
        rabbitsBtn.addEventListener('click', () => {
            setActiveCategory('rabbits');
            fetchPetsByCategory('rabbits').then(data => {
                renderPets(sortedByPrice ? sortPetsByPrice(data.data) : data.data);
            });
        });
        container.appendChild(rabbitsBtn);
    }
    
    // Add 'Birds' category
    const birdsCategory = categories.find(cat => cat.category.toLowerCase() === 'birds');
    if (birdsCategory) {
        const birdsBtn = document.createElement('button');
        birdsBtn.className = `flex items-center gap-2 px-6 py-3 rounded-full ${currentCategory === 'birds' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-700'} hover:bg-teal-100 hover:text-teal-600 transition-colors`;
        birdsBtn.innerHTML = `<img src="${birdsCategory.image}" alt="Birds" class="w-6 h-6"> Birds`;
        birdsBtn.addEventListener('click', () => {
            setActiveCategory('birds');
            fetchPetsByCategory('birds').then(data => {
                renderPets(sortedByPrice ? sortPetsByPrice(data.data) : data.data);
            });
        });
        container.appendChild(birdsBtn);
    }
}

function setActiveCategory(category) {
    currentCategory = category;
    
    // Update UI to reflect active category
    const categoryButtons = document.querySelectorAll('#categories-container button');
    categoryButtons.forEach(btn => {
        if (btn.textContent.trim().toLowerCase().includes(category.toLowerCase())) {
            btn.classList.add('bg-teal-100', 'text-teal-600');
            btn.classList.remove('bg-gray-100', 'text-gray-700');
        } else {
            btn.classList.remove('bg-teal-100', 'text-teal-600');
            btn.classList.add('bg-gray-100', 'text-gray-700');
        }
    });
}

function sortPetsByPrice(pets) {
    return [...pets].sort((a, b) => {
        const priceA = a.price ? parseFloat(a.price.replace('$', '')) : 0;
        const priceB = b.price ? parseFloat(b.price.replace('$', '')) : 0;
        return priceA - priceB;
    });
}

function renderPets(petsData) {
    const container = document.getElementById('pet-cards-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Check if there are no pets to display
    if (!petsData || petsData.length === 0) {
        // Display the 'No Information Available' message
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-16 text-center">
                <div class="mb-6">
                    <img src="https://i.ibb.co/Qp1NKwM/no-data.png" alt="No Information" class="w-24 h-24 mx-auto">
                </div>
                <h3 class="text-xl font-semibold mb-2">No Information Available</h3>
                <p class="text-gray-600 max-w-md">
                    It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a.
                </p>
            </div>
        `;
        return;
    }
    
    // Create a grid for pet cards
    const petCardsGrid = document.createElement('div');
    petCardsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    container.appendChild(petCardsGrid);
    
    petsData.forEach(pet => {
        const petCard = document.createElement('div');
        petCard.className = 'bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow';
        
        // Handle null or undefined values
        const breed = pet.breed || 'Breed info not available';
        const birthDate = pet.birth_date || 'Date unknown';
        const gender = pet.gender || 'Unknown';
        const price = pet.price || 'Price not available';
        
        petCard.innerHTML = `
            <img src="${pet.image}" alt="${pet.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="font-bold text-lg mb-2">${pet.name}</h3>
                <div class="space-y-1 text-sm text-gray-600 mb-4">
                    <p class="flex items-center"><i class="fa-solid fa-paw w-5 mr-2"></i> Breed: ${breed}</p>
                    <p class="flex items-center"><i class="fa-regular fa-calendar w-5 mr-2"></i> Birth: ${birthDate}</p>
                    <p class="flex items-center"><i class="fa-solid fa-venus-mars w-5 mr-2"></i> Gender: ${gender}</p>
                    <p class="flex items-center"><i class="fa-solid fa-dollar-sign w-5 mr-2"></i> Price: ${price}</p>
                </div>
                <div class="flex justify-between items-center">
                    <button class="like-btn text-gray-500 hover:text-red-500 transition-colors text-xl" data-pet-id="${pet.id}">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                    <button class="adopt-btn px-4 py-1 text-teal-600 hover:text-teal-700 border border-teal-600 rounded-md transition-colors" data-pet-id="${pet.id}">
                        Adopt
                    </button>
                    <button class="details-btn px-4 py-1 text-teal-600 hover:text-teal-700 transition-colors" data-pet-id="${pet.id}">
                        Details
                    </button>
                </div>
            </div>
        `;
        
        petCardsGrid.appendChild(petCard);
    });
    
    // Add event listeners to buttons
    setupPetCardButtons();
}

function setupPetCardButtons() {
    // Like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const petId = btn.getAttribute('data-pet-id');
            const pet = allPets.find(p => p.id === petId);
            
            if (pet && !likedPets.some(p => p.id === petId)) {
                likedPets.push(pet);
                renderLikedPets();
                
                // Change heart icon to solid
                btn.innerHTML = '<i class="fa-solid fa-heart text-red-500"></i>';
            }
        });
    });
    
    // Adopt buttons
    document.querySelectorAll('.adopt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.currentTarget;
            let count = 3;
            
            // Disable the button during countdown
            button.disabled = true;
            button.textContent = count;
            
            // Start countdown
            const countdown = setInterval(() => {
                count--;
                if (count > 0) {
                    button.textContent = count;
                } else {
                    clearInterval(countdown);
                    button.textContent = 'Adopted';
                    button.classList.add('bg-gray-300', 'text-gray-500');
                    button.classList.remove('text-teal-600', 'border-teal-600');
                }
            }, 1000);
        });
    });
    
    // Details buttons
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const petId = btn.getAttribute('data-pet-id');
            showPetDetailsModal(petId);
        });
    });
}

function renderLikedPets() {
    const container = document.getElementById('liked-pets-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Create a grid layout for liked pets
    likedPets.forEach(pet => {
        const likedPetThumb = document.createElement('div');
        likedPetThumb.className = 'aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow';
        likedPetThumb.innerHTML = `<img src="${pet.image}" alt="${pet.name}" class="w-full h-full object-cover">`;
        container.appendChild(likedPetThumb);
    });
    
    // If no liked pets, add some placeholder images to match the design
    if (likedPets.length === 0) {
        // Add 6 placeholder images to match the design
        const placeholderImages = [
            'https://i.ibb.co/Lk3nSrN/dog1.jpg',
            'https://i.ibb.co/Qf6Hbxv/dog2.jpg',
            'https://i.ibb.co/YXVtszs/dog3.jpg',
            'https://i.ibb.co/YLvGS8c/dog4.jpg',
            'https://i.ibb.co/YXVtszs/dog3.jpg',
            'https://i.ibb.co/Qf6Hbxv/dog2.jpg'
        ];
        
        placeholderImages.forEach(imgSrc => {
            const placeholderThumb = document.createElement('div');
            placeholderThumb.className = 'aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow';
            placeholderThumb.innerHTML = `<img src="${imgSrc}" alt="Pet placeholder" class="w-full h-full object-cover">`;
            container.appendChild(placeholderThumb);
        });
    }
}

async function showPetDetailsModal(petId) {
    const petDetails = await fetchPetDetails(petId);
    const pet = petDetails.data;
    
    // Handle null or undefined values
    const breed = pet.breed || 'Breed info not available';
    const birthDate = pet.birth_date || 'Date unknown';
    const gender = pet.gender || 'Unknown';
    const price = pet.price || 'Price not available';
    const vaccinated = pet.vaccinated ? pet.vaccinated : 'Information not available';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700" id="close-modal">
                <i class="fa-solid fa-times text-xl"></i>
            </button>
            
            <div class="flex flex-col md:flex-row gap-6">
                <div class="md:w-1/2">
                    <img src="${pet.image}" alt="${pet.name}" class="w-full h-auto rounded-lg">
                </div>
                
                <div class="md:w-1/2">
                    <h2 class="text-2xl font-bold mb-4">${pet.name}</h2>
                    
                    <div class="space-y-3 text-gray-600">
                        <p class="flex items-center"><i class="fa-solid fa-paw w-5 mr-2"></i> Breed: ${breed}</p>
                        <p class="flex items-center"><i class="fa-regular fa-calendar w-5 mr-2"></i> Birth: ${birthDate}</p>
                        <p class="flex items-center"><i class="fa-solid fa-venus-mars w-5 mr-2"></i> Gender: ${gender}</p>
                        <p class="flex items-center"><i class="fa-solid fa-dollar-sign w-5 mr-2"></i> Price: ${price}</p>
                        <p class="flex items-center"><i class="fa-solid fa-syringe w-5 mr-2"></i> Vaccinated: ${vaccinated}</p>
                    </div>
                    
                    <div class="mt-6">
                        <h3 class="font-semibold mb-2">Details Information</h3>
                        <p class="text-gray-600">
                            ${pet.description || 'No additional information available for this pet.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    document.getElementById('close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}