document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const cartItemsContainer = document.querySelector(".cart-items");
    const deleteAllBtn = document.querySelector('.delete-all-btn');
    const cartIcon = document.querySelector(".cart-icon");
    const closeSidebar = document.querySelector(".sidebar-close");
    const addToCartButtons = document.querySelectorAll(".add-to-cart");
    const cartTotalElement = document.querySelector(".cart-total");
    const cartCountElement = document.querySelector(".cart-icon span");
    const searchBox = document.querySelector(".search--box input");
    const menuItems = document.querySelectorAll(".menu--item");
    const cards = document.querySelectorAll(".card");
    const removeIcon = document.querySelector('.remove-icon');
    const payAmountElement = document.getElementById("payAmount");
    const taxElement = document.getElementById("tax");
    const shippingElement = document.getElementById("shipping");
    const totalElement = document.getElementById("total");
    const notification = document.getElementById('notification');
    const sidebar = document.querySelector('.sidebar');
    const burgerIcon = document.querySelector('.burger--icon');
    const burgerSidebar = document.getElementById('burger-sidebar');
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Show Notification
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Update Cart and Checkout Summary
    function updateCart() {
    cartItemsContainer.innerHTML = "";
    let subtotal = 0;
    const taxRate = 2.5;
    const shippingCost = 50;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.classList.add("individual-cart-item");
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">₱${itemTotal.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="decrease-quantity" data-index="${index}">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <span>${item.quantity}</span>
                    <button class="increase-quantity" data-index="${index}">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    // Only calculate tax and shipping if there are items in the cart
    if (cart.length > 0) {
        const tax = subtotal * taxRate / 100;
        const total = subtotal + tax + shippingCost;

        // Display tax and shipping cost
        if (taxElement) taxElement.textContent = `₱${tax.toFixed(2)}`;
        if (shippingElement) shippingElement.textContent = `₱${shippingCost.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `₱${total.toFixed(2)}`;
        if (payAmountElement) payAmountElement.textContent = `₱${total.toFixed(2)}`;
    } else {
        // Hide tax and shipping if the cart is empty
        if (taxElement) taxElement.textContent = `₱0.00`;
        if (shippingElement) shippingElement.textContent = `₱0.00`;
        if (totalElement) totalElement.textContent = `₱0.00`;
        if (payAmountElement) payAmountElement.textContent = `₱0.00`;
    }

    // Update the cart total to reflect subtotal only (no tax or shipping cost included)
    cartTotalElement.textContent = `₱${subtotal.toFixed(2)}`;

    cartCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    localStorage.setItem('cart', JSON.stringify(cart));
    updateScrollBehavior();
}

    // Handle scroll behavior for cart items
    function updateScrollBehavior() {
        if (cartItemsContainer.scrollHeight > cartItemsContainer.clientHeight) {
            cartItemsContainer.classList.add("has-scroll");
        } else {
            cartItemsContainer.classList.remove("has-scroll");
        }
    }

    // Event delegation for cart actions (increase/decrease)
    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;

        if (target.closest('.increase-quantity')) {
            const button = target.closest('.increase-quantity');
            const itemIndex = parseInt(button.getAttribute("data-index"), 10);
            if (!isNaN(itemIndex) && cart[itemIndex]) {
                cart[itemIndex].quantity++;
                updateCart();
            }
        }

        if (target.closest('.decrease-quantity')) {
            const button = target.closest('.decrease-quantity');
            const itemIndex = parseInt(button.getAttribute("data-index"), 10);
            if (!isNaN(itemIndex) && cart[itemIndex]) {
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity--;
                } else {
                    cart.splice(itemIndex, 1); // Remove item if quantity reaches 1 and user clicks -
                }
                updateCart();
            }
        }

        e.stopPropagation(); // Prevent event bubbling
    });

    // Add a predefined item to the cart
    function addPredefinedItem() {
        const predefinedItem = {
            title: "Predefined Item",
            price: 199.99,
            quantity: 1,
            image: "https://via.placeholder.com/150" // Replace with a valid image URL
        };

        cart.push();
        updateCart();
    }

    // Call this function to add the item when the page loads
    addPredefinedItem();

    // Add items to cart
    addToCartButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const card = e.target.closest(".card");
            if (!card) return;

            const title = card.querySelector(".card--title").textContent;
            const price = parseFloat(card.querySelector(".price").textContent.replace("₱", ""));
            const image = card.querySelector("img").src;

            const itemInCart = cart.find(item => item.title === title);

            if (itemInCart) {
                itemInCart.quantity++;
            } else {
                cart.push({ title, price, quantity: 1, image });
            }

            updateCart();
            showNotification('Item added to cart!');
        });
    });

    // Delete all items from cart
    deleteAllBtn.addEventListener('click', function () {
        cart = [];
        localStorage.removeItem('cart');
        updateCart();
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    });

    // Sidebar and Burger Menu
    cartIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        sidebar.classList.toggle("open");
    });

    closeSidebar.addEventListener("click", () => {
        sidebar.classList.remove("open");
    });

    burgerIcon.addEventListener('click', () => {
        burgerSidebar.classList.toggle('open');
    });

    // Search Functionality
    searchBox.addEventListener("input", () => {
        const query = searchBox.value.toLowerCase();

        menuItems.forEach(item => {
            const itemName = item.querySelector("h5").textContent.toLowerCase();
            item.style.display = itemName.includes(query) ? "block" : "none";
        });

        cards.forEach(card => {
            const cardName = card.querySelector(".card--title").textContent.toLowerCase();
            card.style.display = cardName.includes(query) ? "block" : "none";
        });

        removeIcon.style.display = searchBox.value.length > 0 ? 'block' : 'none';
    });

    removeIcon.addEventListener('click', function () {
        searchBox.value = '';
        removeIcon.style.display = 'none';
        searchBox.focus();

        menuItems.forEach(item => {
            item.style.display = "block";
        });

        cards.forEach(card => {
            card.style.display = "block";
        });
    });

    // Close Sidebar and Burger Menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !cartIcon.contains(e.target)) {
            sidebar.classList.remove('open');
        }
        if (!burgerSidebar.contains(e.target) && !burgerIcon.contains(e.target)) {
            burgerSidebar.classList.remove('open');
        }
    });

    // Initialize Cart
    updateCart();
});
