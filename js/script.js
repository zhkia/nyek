const PESO_SYMBOL = '₱';

document.addEventListener('DOMContentLoaded', () => {
    setActiveNavLink();
    updateCartCountDisplay();
    loadCurrentYear();

    if (document.getElementById('featured-products-container')) {
        displayFeaturedProducts();
    }
    if (document.getElementById('all-products-container')) {
        displayAllProducts();
    }
    if (document.getElementById('cart-items-container')) {
        displayCartItems();
    }

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        populateCheckoutSummary();
        setupFormValidation(checkoutForm, () => {
            const totalAmount = getCartTotal().toFixed(2);
            alert(`Order Placed Successfully! \nTotal: ${PESO_SYMBOL}${totalAmount}`);
            localStorage.removeItem('NYEKcart');
            updateCartCountDisplay();
            displayCartItems();
            populateCheckoutSummary();
            setTimeout(() => {
                 window.location.href = 'index.html';
            }, 1500);
        });
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        setupFormValidation(contactForm, () => {
            const name = document.getElementById('contactName').value;
            showToast(`Thank you for your message, ${name}! We will get back to you soon.`, 'success');
            contactForm.reset();
            contactForm.classList.remove('was-validated');
        });
    }
});

function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const currentPath = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function loadCurrentYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        alert(message);
        return;
    }

    const toastId = 'toast-' + Date.now() + Math.random().toString(36).substring(2, 7);
    let toastBgClass = 'text-bg-primary';
    let iconClass = 'fa-info-circle';

    if (type === 'success') {
        toastBgClass = 'text-bg-success';
        iconClass = 'fa-check-circle';
    } else if (type === 'info') {
        toastBgClass = 'text-bg-info';
        iconClass = 'fa-info-circle';
    } else if (type === 'danger') {
        toastBgClass = 'text-bg-danger';
        iconClass = 'fa-exclamation-triangle';
    }

    const toastHTML = `
        <div class="toast align-items-center ${toastBgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true" id="${toastId}" data-bs-delay="3500">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas ${iconClass} me-2"></i> ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    if (toastElement) {
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
}

function createProductCardHTML(product) {
    return `
        <div class="col fade-in-element">
            <div class="card h-100 product-card">
                <div class="card-img-top-wrapper">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                </div>
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text small text-muted">${product.brand}</p>
                    <p class="product-price">${PESO_SYMBOL}${product.price.toFixed(2)}</p>
                    <button class="btn btn-primary btn-sm btn-add-to-cart" onclick="handleAddToCart(${product.id}, this)">
                        <i class="fas fa-cart-plus me-1"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

function displayFeaturedProducts() {
    const container = document.getElementById('featured-products-container');
    if (!container) return;
    const featured = allProducts.filter(p => p.featured).slice(0, 4);
    container.innerHTML = featured.map(createProductCardHTML).join('');
}

function displayAllProducts() {
    const container = document.getElementById('all-products-container');
    if (!container) return;
    container.innerHTML = allProducts.map(createProductCardHTML).join('');
}

function getCart() {
    return JSON.parse(localStorage.getItem('NYEKcart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('NYEKcart', JSON.stringify(cart));
    updateCartCountDisplay();
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function handleAddToCart(productId, buttonElement) {
    let cart = getCart();
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        showToast('Error: Product not found.', 'danger');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart(cart);
    showToast(`${product.name} added to cart!`, 'success');

    if (buttonElement) {
        const originalButtonHTML = '<i class="fas fa-cart-plus me-1"></i> Add to Cart';
        buttonElement.innerHTML = '<i class="fas fa-check me-1"></i> Added';
        buttonElement.classList.remove('btn-primary');
        buttonElement.classList.add('btn-success');

        setTimeout(() => {
            buttonElement.innerHTML = originalButtonHTML;
            buttonElement.classList.remove('btn-success');
            buttonElement.classList.add('btn-primary');
        }, 800);
    }
}

function updateCartCountDisplay() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
    const checkoutCartCountElement = document.getElementById('checkout-cart-count');
    if (checkoutCartCountElement) {
        checkoutCartCountElement.textContent = totalItems;
    }
}

function displayCartItems() {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total-price');
    const emptyCartMessage = document.getElementById('cart-empty-message');
    const cartTableSection = document.getElementById('cart-table-section');

    if (!container || !totalElement || !emptyCartMessage || !cartTableSection) return;

    if (cart.length === 0) {
        container.innerHTML = '';
        totalElement.textContent = `${PESO_SYMBOL}0.00`;
        emptyCartMessage.classList.remove('d-none');
        cartTableSection.classList.add('d-none');
        return;
    }

    emptyCartMessage.classList.add('d-none');
    cartTableSection.classList.remove('d-none');

    let cartHTML = '';
    let grandTotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;
        cartHTML += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <h6 class="mb-0">${item.name}</h6>
                            <small class="text-muted">${item.brand}</small>
                        </div>
                    </div>
                </td>
                <td>${PESO_SYMBOL}${item.price.toFixed(2)}</td>
                <td>
                    <div class="input-group input-group-sm" style="width: 130px;">
                        <button class="btn btn-outline-secondary" type="button" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <input type="text" class="form-control text-center px-1" value="${item.quantity}" readonly aria-label="Quantity">
                        <button class="btn btn-outline-secondary" type="button" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </td>
                <td class="text-end fw-semibold">${PESO_SYMBOL}${itemTotal.toFixed(2)}</td>
                <td class="text-center">
                    <button class="btn btn-danger btn-sm" onclick="removeCartItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    container.innerHTML = cartHTML;
    totalElement.textContent = `${PESO_SYMBOL}${grandTotal.toFixed(2)}`;
}

function updateCartItemQuantity(productId, newQuantity) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    const product = allProducts.find(p => p.id === productId);

    if (itemIndex > -1 && product) {
        if (newQuantity <= 0) {
            cart.splice(itemIndex, 1);
            showToast(`${product.name} removed from cart.`, 'info');
        } else {
            cart[itemIndex].quantity = newQuantity;
        }
        saveCart(cart);
        displayCartItems();
        populateCheckoutSummary();
    }
}

function removeCartItem(productId) {
    let cart = getCart();
    const removedItem = cart.find(item => item.id === productId);
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    if (removedItem) {
        showToast(`${removedItem.name} removed from cart.`, 'info');
    }
    displayCartItems();
    populateCheckoutSummary();
}

function populateCheckoutSummary() {
    const cart = getCart();
    const summaryContainer = document.getElementById('checkout-order-summary-items');
    const grandTotalElement = document.getElementById('checkout-grand-total');
    const placeOrderBtn = document.querySelector('#checkout-form button[type="submit"]');

    if (!summaryContainer || !grandTotalElement) return;

    summaryContainer.innerHTML = '';
    let calculatedGrandTotal = 0;

    if (cart.length === 0) {
        summaryContainer.innerHTML = '<li class="list-group-item text-muted">Your cart is empty.</li>';
        grandTotalElement.textContent = `${PESO_SYMBOL}0.00`;
        if (placeOrderBtn) {
            placeOrderBtn.disabled = true;
            placeOrderBtn.innerHTML = '<i class="fas fa-times-circle me-2"></i> Cart is Empty';
        }
        return;
    }

    if (placeOrderBtn) {
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = '<i class="fas fa-lock me-2"></i>Place Order';
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        calculatedGrandTotal += itemTotal;
        summaryContainer.innerHTML += `
            <li class="list-group-item d-flex justify-content-between lh-sm">
                <div>
                    <h6 class="my-0">${item.name} (x${item.quantity})</h6>
                    <small class="text-muted">${item.brand}</small>
                </div>
                <span class="text-muted">${PESO_SYMBOL}${itemTotal.toFixed(2)}</span>
            </li>
        `;
    });
    grandTotalElement.textContent = `${PESO_SYMBOL}${calculatedGrandTotal.toFixed(2)}`;
}

function setupFormValidation(formElement, onSuccessCallback) {
    if (!formElement) return;

    formElement.addEventListener('submit', event => {
        if (!formElement.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            if (onSuccessCallback && typeof onSuccessCallback === 'function') {
                onSuccessCallback();
            }
        }
        formElement.classList.add('was-validated');
    }, false);
}