document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close mobile menu when a link is clicked
        const mobileLinks = mobileNav.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // 2. Header Scroll Effect
    const header = document.getElementById('header');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // init on load

    // 3. FAQ Accordion
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            // Close other items
            const activeHeader = document.querySelector('.accordion-header.active');
            if (activeHeader && activeHeader !== header) {
                activeHeader.classList.remove('active');
                activeHeader.nextElementSibling.style.maxHeight = null;
            }

            // Toggle current item
            header.classList.toggle('active');
            const content = header.nextElementSibling;
            
            if (header.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // 4. Scroll Reveal Animations (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);
    
    fadeElements.forEach(el => {
        appearOnScroll.observe(el);
    });

    // 5. Shopping Cart Logic
    let cart = JSON.parse(localStorage.getItem('bakery_cart')) || [];
    
    const cartOpenBtn = document.getElementById('cart-open-btn');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartBadge = document.getElementById('cart-badge');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Open/Close Cart
    function toggleCart() {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('active');
    }

    if (cartOpenBtn) cartOpenBtn.addEventListener('click', toggleCart);
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    // Add to cart buttons
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Traverse up just in case the icon was clicked
            const buttonEl = e.currentTarget;
            const id = buttonEl.getAttribute('data-id');
            const name = buttonEl.getAttribute('data-name');
            const price = parseFloat(buttonEl.getAttribute('data-price'));
            const img = buttonEl.getAttribute('data-img');
            
            addToCart({ id, name, price, img, quantity: 1 });
            
            // Show feedback
            const icon = buttonEl.querySelector('i');
            if(icon) {
                icon.classList.remove('fa-cart-plus');
                icon.classList.add('fa-check');
                setTimeout(() => {
                    icon.classList.remove('fa-check');
                    icon.classList.add('fa-cart-plus');
                }, 1000);
            }
        });
    });

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push(product);
        }
        saveCart();
        updateCartUI();
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('active');
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        updateCartUI();
    }

    function changeQuantity(id, delta) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                removeFromCart(id);
            } else {
                saveCart();
                updateCartUI();
            }
        }
    }

    function saveCart() {
        localStorage.setItem('bakery_cart', JSON.stringify(cart));
    }

    function updateCartUI() {
        // Update badge
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartBadge) cartBadge.textContent = totalItems;

        // Render items
        if (!cartItemsContainer) return;
        
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío. ¡Endulcemos el día!</div>';
        } else {
            cart.forEach(item => {
                subtotal += item.price * item.quantity;
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                        <div class="cart-item-controls">
                            <div class="quantity-control">
                                <button class="qty-btn minus" data-id="${item.id}">-</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn plus" data-id="${item.id}">+</button>
                            </div>
                            <button class="remove-item" data-id="${item.id}">Eliminar</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });

            // Re-attach events
            document.querySelectorAll('.qty-btn.minus').forEach(btn => {
                btn.addEventListener('click', (e) => changeQuantity(e.target.getAttribute('data-id'), -1));
            });
            document.querySelectorAll('.qty-btn.plus').forEach(btn => {
                btn.addEventListener('click', (e) => changeQuantity(e.target.getAttribute('data-id'), 1));
            });
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => removeFromCart(e.target.getAttribute('data-id')));
            });
        }

        // Update Subtotal
        if (cartSubtotal) {
            cartSubtotal.textContent = '$' + subtotal.toFixed(2);
        }
    }

    // Checkout Simuation
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('¡Tu carrito está vacío! Agrega algunos postres primero.');
                return;
            }
            
            checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            checkoutBtn.disabled = true;
            
            setTimeout(() => {
                alert('¡Gracias por tu compra! Tu orden ha sido procesada exitosamente.');
                cart = [];
                saveCart();
                updateCartUI();
                toggleCart();
                checkoutBtn.innerHTML = 'Proceder al Pago';
                checkoutBtn.disabled = false;
            }, 1500);
        });
    }

    // Initial render
    updateCartUI();

});
