import { products } from './js/products.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Project initialized. Current path:', window.location.pathname);
    console.log('Available products:', products);

    const path = window.location.pathname.toLowerCase();
    const isHomePage = path.endsWith('index.html') || path === '/' || path.endsWith('/') || path.endsWith('/index');
    const isProductsPage = path.includes('products.html');
    const isDetailsPage = path.includes('product-details.html');

    console.log('Page detection:', { isHomePage, isProductsPage, isDetailsPage });

    // --- Home Page Logic ---
    if (isHomePage) {
        renderFeaturedProducts();
    }

    // --- Products Catalogue Logic ---
    if (isProductsPage) {
        initCatalogue();
    }

    // --- Product Details Logic ---
    if (isDetailsPage) {
        initProductDetails();
    }

    // --- Global Logic ---
    initGlobal();
});

function initGlobal() {
    // Scroll effects for Navbar
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('nav');
        if (window.scrollY > 50) {
            nav.style.padding = '10px 0';
            nav.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        } else {
            nav.style.padding = '20px 0';
            nav.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
}

function renderFeaturedProducts() {
    const featuredGrid = document.getElementById('featured-grid');
    if (!featuredGrid) return;

    // Show first 3 products as featured
    const featured = products.slice(0, 3);

    featuredGrid.innerHTML = featured.map(product => createProductCard(product)).join('');
}

function initCatalogue() {
    const productsGrid = document.getElementById('products-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (!productsGrid) return;

    // Initial render
    const params = new URLSearchParams(window.location.search);
    const initialCat = params.get('cat') || 'All';

    renderFilteredProducts(initialCat);
    updateFilterButtons(initialCat);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.category;
            renderFilteredProducts(cat);
            updateFilterButtons(cat);

            // Update URL without reload
            const newUrl = cat === 'All' ? 'products.html' : `products.html?cat=${encodeURIComponent(cat)}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        });
    });

    function renderFilteredProducts(category) {
        const filtered = category === 'All'
            ? products
            : products.filter(p => p.category === category);

        productsGrid.innerHTML = filtered.map(product => createProductCard(product)).join('');
    }

    function updateFilterButtons(activeCat) {
        filterBtns.forEach(btn => {
            if (btn.dataset.category === activeCat) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

function createProductCard(product) {
    return `
        <div class="product-card">
            <div class="product-image" id="img-container-${product.id}">
                <img src="${product.image}" 
                     alt="${product.name}" 
                     loading="lazy"
                     onload="this.classList.add('loaded'); document.getElementById('img-container-${product.id}').classList.add('loaded')"
                     onerror="this.src='https://via.placeholder.com/400x300?text=Image+Not+Found'">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <a href="product-details.html?id=${product.id}" class="btn btn-primary" style="display: inline-block;">View Details</a>
            </div>
        </div>
    `;
}

function initProductDetails() {
    const detailsContent = document.getElementById('product-details-content');
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));

    const product = products.find(p => p.id === id);

    if (!product) {
        detailsContent.innerHTML = `<div class="container"><p style="padding: 100px 0; text-align: center;">Product not found. <a href="products.html" style="color: var(--primary);">Return to catalogue</a></p></div>`;
        return;
    }

    // Update Page Title
    document.title = `${product.name} | RenewTech`;

    detailsContent.innerHTML = `
        <div class="container">
            <div style="padding: 40px 0;">
                <a href="products.html" style="color: var(--gray); margin-bottom: 2rem; display: inline-block;">
                    <i class="fas fa-arrow-left"></i> Back to Catalogue
                </a>
                
                <div class="details-grid">
                    <div class="product-gallery product-image" id="detail-img-container">
                        <img src="${product.image}" 
                             alt="${product.name}"
                             onload="this.classList.add('loaded'); document.getElementById('detail-img-container').classList.add('loaded')"
                             onerror="this.src='https://via.placeholder.com/800x600?text=Image+Not+Found'">
                    </div>
                    <div class="product-main-info">
                        <span class="product-category">${product.category}</span>
                        <h1 style="font-size: 2.8rem; margin-bottom: 1.5rem;">${product.name}</h1>
                        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 2rem;">${product.description}</p>
                        
                        <div style="display: flex; gap: 15px;">
                            <button id="open-enquiry" class="btn btn-primary">Enquire Now</button>
                            <button class="btn btn-white" style="border: 1px solid #ddd;">
                                <i class="fas fa-download"></i> Download Brochure
                            </button>
                        </div>

                        <div style="margin-top: 3rem;">
                            <h3>Key Features</h3>
                            <ul class="features-list">
                                ${product.features.map(f => `<li>${f}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 4rem; border-top: 1px solid #eee; padding-top: 4rem;">
                    <h2 style="margin-bottom: 2rem;">Technical Specifications</h2>
                    <table class="specs-table">
                        ${Object.entries(product.specs).map(([key, value]) => `
                            <tr>
                                <td>${key}</td>
                                <td>${value}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </div>
        </div>
    `;

    // Modal Logic
    const modal = document.getElementById('enquiry-modal');
    const openBtn = document.getElementById('open-enquiry');
    const closeBtn = document.querySelector('.close-modal');
    const enquiryForm = document.getElementById('enquiry-form');

    if (openBtn && modal) {
        openBtn.onclick = () => {
            modal.style.display = 'flex';
            document.getElementById('product-name').value = product.name;
        };
        closeBtn.onclick = () => modal.style.display = 'none';
        window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

        enquiryForm.onsubmit = (e) => {
            e.preventDefault();
            alert(`Thank you! Your enquiry for ${product.name} has been sent successfully. Our team will contact you shortly.`);
            modal.style.display = 'none';
        };
    }
}
