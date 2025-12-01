window.addEventListener('DOMContentLoaded', () => {

    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const profileLogoutBtn = document.getElementById('profileLogoutBtn');
    const welcomeMsg = document.getElementById('welcomeMsg');
    const profileContainer = document.getElementById('profileContainer');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');
    const loginSubmit = document.getElementById('loginSubmit');
    const toggleForm = document.getElementById('toggleForm');
    const modalTitle = document.getElementById('modalTitle');
    const currentUser = localStorage.getItem("loggedInUser");

    let isLogin = true;
    let cart = [];

    function loadCartForUser(username) {
        cart = JSON.parse(localStorage.getItem(`cart_${username}`)) || [];
    }

    if (currentUser) loadCartForUser(currentUser);

    function updateProfileUI() {
        const user = localStorage.getItem("loggedInUser");
        if (user) {
            welcomeMsg.textContent = `Welcome, ${user}!`;
            profileBtn.textContent = "Profile";
        } else {
            welcomeMsg.textContent = "";
            profileDropdown.classList.remove('show');
            profileBtn.textContent = "Login / Register";
        }
    }


    const cartIcon = document.getElementById('cartIcon');
    const cartDropdown = document.getElementById('cartDropdown');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const buyAllBtn = document.getElementById('buyAllBtn');

    function updateCart() {
        cartItems.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.classList.add('cart-item');

            const img = document.createElement('img');
            img.src = item.image;

            const infoDiv = document.createElement('div');
            const shortName = item.name.length > 26 ? item.name.substring(0, 26) + "..." : item.name;
            infoDiv.innerHTML = `<strong>${shortName}</strong><br>₱${item.price} x ${item.quantity}`;
            infoDiv.title = item.name;

            const buyBtn = document.createElement('button');
            buyBtn.textContent = 'Buy Now';
            buyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const user = localStorage.getItem("loggedInUser");
                if (!user) loginModal.style.display = "block";
                else cartDropdown.style.display = 'none';
            });

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.addEventListener('click', () => {
                if (item.quantity > 1) item.quantity--;
                else cart.splice(index, 1);
                updateCart();
            });

            li.appendChild(img);
            li.appendChild(infoDiv);
            li.appendChild(buyBtn);
            li.appendChild(removeBtn);
            cartItems.appendChild(li);

            total += parseFloat(item.price) * item.quantity;
        });

        cartTotal.textContent = `Total: ₱${total.toFixed(2)}`;
        const user = localStorage.getItem("loggedInUser");
        if (user) localStorage.setItem(`cart_${user}`, JSON.stringify(cart));
    }

    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const user = localStorage.getItem("loggedInUser");
        if (!user) loginModal.style.display = "block";
        else profileDropdown.classList.toggle('show');
    });

    profileLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem("loggedInUser");
        cart = [];
        profileDropdown.classList.remove('show');
        updateProfileUI();
        updateCart();
    });

    closeModal.addEventListener('click', () => loginModal.style.display = 'none');

    toggleForm.addEventListener('click', () => {
        isLogin = !isLogin;
        if (isLogin) {
            modalTitle.textContent = "Login";
            loginSubmit.textContent = "Login";
            toggleForm.textContent = "Create one";
        } else {
            modalTitle.textContent = "Create Account";
            loginSubmit.textContent = "Register";
            toggleForm.textContent = "Back to login";
        }
    });

    loginSubmit.addEventListener('click', () => {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        if (!username || !password) return alert("Please enter username and password.");

        if (isLogin) {
            const storedPassword = localStorage.getItem(username);
            if (storedPassword && storedPassword === password) {
                localStorage.setItem("loggedInUser", username);
                cart = JSON.parse(localStorage.getItem(`cart_${username}`)) || [];
                loginModal.style.display = 'none';
                updateProfileUI();
                updateCart();
            } else alert("Invalid username or password.");
        } else {
            if (localStorage.getItem(username)) return alert("Username already exists.");
            localStorage.setItem(username, password);
            alert("Account created! You can now log in.");
            isLogin = true;
            modalTitle.textContent = "Login";
            loginSubmit.textContent = "Login";
            toggleForm.textContent = "Create one";
        }

        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    });


    cartIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        cartDropdown.style.display = cartDropdown.style.display === 'block' ? 'none' : 'block';
    });

    window.addEventListener('click', (e) => {
        if (!profileContainer.contains(e.target)) profileDropdown.classList.remove('show');
        if (!cartDropdown.contains(e.target) && e.target !== cartIcon) cartDropdown.style.display = 'none';
    });

    const addCartBtns = document.querySelectorAll('.add-to-cart');
    addCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const parent = e.target.closest('.product-card');
            if (!parent) return;
            const name = parent.querySelector('.product-name').textContent;
            const price = Number(parent.querySelector('.product-price').textContent.replace(/[^\d.-]/g, ''));
            const image = parent.querySelector('img').src;

            const existingItem = cart.find(item => item.name === name);
            if (existingItem) existingItem.quantity++;
            else cart.push({ name, price, image, quantity: 1 });

            updateCart();
            alert(`${name} added to cart!`);
            shakeCart();
        });
    });

    buyAllBtn.addEventListener('click', () => {
        const user = localStorage.getItem("loggedInUser");
        if (!user) loginModal.style.display = "block";
        else if (cart.length === 0) alert("Cart is empty!");
    });

    function shakeCart() {
        cartIcon.classList.add('shake');
        setTimeout(() => cartIcon.classList.remove('shake'), 500);
    }

    const filterBubble = document.getElementById('filterBubble');
    const filterPanel = document.getElementById('filterPanel');
    const allFilterCheckboxes = Array.from(document.querySelectorAll('#filterPanel input[type="checkbox"]'));
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');

    filterBubble.addEventListener('click', () => filterPanel.classList.toggle('hidden'));

    priceRange.addEventListener('input', () => {
        priceValue.textContent = priceRange.value;
        applyFilters();
    });

    allFilterCheckboxes.forEach(cb => cb.addEventListener('change', applyFilters));

    function applyFilters() {
        const productCards = document.querySelectorAll('.product-card');
        const selectedTypes = [];
        const selectedColors = [];

        allFilterCheckboxes.forEach(cb => {
            if (!cb.checked) return;
            if (['tops', 'dresses', 'bottoms'].includes(cb.value)) selectedTypes.push(cb.value);
            else selectedColors.push(cb.value);
        });

        const maxPrice = Number(priceRange.value);
        const sliderMax = Number(priceRange.max) || 500;

        if (selectedTypes.length === 0 && selectedColors.length === 0 && maxPrice === sliderMax) {
            productCards.forEach(card => card.style.display = 'block');
            return;
        }

        productCards.forEach(card => {
            const cardPrice = Number(card.dataset.price);
            const cardColors = card.dataset.colors.split(',').map(c => c.trim());
            const cardType = card.dataset.type;

            const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(cardType);
            const colorMatch = selectedColors.length === 0 || selectedColors.some(c => cardColors.includes(c));
            const priceMatch = cardPrice <= maxPrice;

            card.style.display = (typeMatch && colorMatch && priceMatch) ? 'block' : 'none';
        });
    }

    if (priceRange) priceValue.textContent = priceRange.value;

    if (currentUser) loadCartForUser(currentUser);
    updateProfileUI();
    updateCart();
});
