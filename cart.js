// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart if it doesn't exist
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    
    // Update cart count on page load
    updateCartCount();
    
    // Add event listeners to all "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const product = getProductDetails(this);
            addToCart(product);
            alert(`${product.name} has been added to your cart!`);
            updateCartCount();
        });
    });
    
    // Add event listeners to all "Buy Now" buttons
    document.querySelectorAll('.buy-now').forEach(button => {
        button.addEventListener('click', function() {
            const product = getProductDetails(this);
            addToCart(product);
            window.location.href = 'cart.html';
        });
    });
    
    // Display cart items if on cart page
    if (window.location.pathname.includes('cart.html')) {
        displayCart();
    }
});

function getProductDetails(button) {
    const productContainer = button.closest('.product-details');
    const productName = productContainer.querySelector('h2').textContent.trim();
    const productPrice = parseFloat(productContainer.querySelector('.price').textContent.replace('Price: $', ''));
    const productImage = button.closest('.content').querySelector('.product-image').src;
    
    return {
        id: productName.toLowerCase().replace(/\s+/g, '-'),
        name: productName,
        price: productPrice,
        image: productImage,
        quantity: 1
    };
}

function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(product);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    document.querySelectorAll('.cart-count').forEach(element => {
        element.textContent = count;
    });
}

function displayCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || []);
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummaryContainer = document.getElementById('cart-summary');
    const emptyCartMessage = document.getElementById('empty-cart');
    
    if (cart.length === 0) {
        cartItemsContainer.style.display = 'none';
        cartSummaryContainer.style.display = 'none';
        emptyCartMessage.style.display = 'block';
        return;
    } else {
        cartItemsContainer.style.display = 'block';
        cartSummaryContainer.style.display = 'block';
        emptyCartMessage.style.display = 'none';
    }
    
    // Clear previous items
    cartItemsContainer.innerHTML = '';
    
    // Add each item to the cart
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${item.id}">
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-btn" data-id="${item.id}">Remove</button>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Add event listeners for quantity controls
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const isPlus = this.classList.contains('plus');
            updateQuantity(id, isPlus);
        });
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const id = this.getAttribute('data-id');
            const newQuantity = parseInt(this.value);
            if (newQuantity > 0) {
                updateQuantity(id, null, newQuantity);
            }
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            removeFromCart(id);
        });
    });
    
    // Update summary
    updateCartSummary();
}

function updateQuantity(id, isPlus, newQuantity = null) {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const item = cart.find(item => item.id === id);
    
    if (item) {
        if (newQuantity !== null) {
            item.quantity = newQuantity;
        } else {
            item.quantity += isPlus ? 1 : -1;
        }
        
        if (item.quantity < 1) {
            removeFromCart(id);
            return;
        }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('cart'));
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
    updateCartCount();
}

function updateCartSummary() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartSummaryContainer = document.getElementById('cart-summary');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
    const total = subtotal + tax + shipping;
    
    cartSummaryContainer.innerHTML = `
        <div class="summary-row">
            <span>Subtotal</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Tax (10%)</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="summary-row">
            <span>Shipping</span>
            <span>$${shipping.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>
        <button onclick="window.location.href='checkout.html'" class="checkout-btn">Proceed to Checkout</button>
    `;
    updateCartCount();
}