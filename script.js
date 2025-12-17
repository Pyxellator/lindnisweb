// Funktion zum Laden des Warenkorbs aus dem Browser-Speicher (localStorage)
function loadCart() {
    const cartData = localStorage.getItem('lindnisCart');
    // Stelle sicher, dass wir ein Array zurückgeben
    return cartData ? JSON.parse(cartData) : [];
}

// Funktion zum Speichern des Warenkorbs im Browser-Speicher
function saveCart(cart) {
    localStorage.setItem('lindnisCart', JSON.stringify(cart));
}

// =========================================================
// WARENKORB ZÄHLER (Für Navigation auf JEDER Seite)
// =========================================================

function updateCartCount() {
    const cart = loadCart();
    // Summiert die Mengen aller Artikel im Warenkorb
    const count = cart.reduce((sum, item) => sum + item.quantity, 0); 
    const cartCountSpan = document.getElementById('cartCount');
    
    if (cartCountSpan) {
        cartCountSpan.textContent = count;
    }
}

// =========================================================
// WARENKORB LOGIK (Zum Hinzufügen von Artikeln auf shop.html)
// =========================================================

// Fügt immer genau 1 Exemplar des Artikels hinzu oder erhöht die Menge um 1
function addItemToCart(name, price) {
    let cart = loadCart();
    // Prüfen, ob der Artikel bereits existiert
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Neuen Artikel hinzufügen
        cart.push({ name: name, price: price, quantity: 1 });
    }
    
    saveCart(cart);
    updateCartCount(); // Zähler sofort aktualisieren
}

// =========================================================
// WARENKORB ANZEIGE (Nur auf warenkorb.html)
// =========================================================

function renderCartPage() {
    const cartList = document.getElementById('cartList');
    const cartTotalSpan = document.getElementById('cartTotal');
    const checkoutButton = document.getElementById('checkoutButton');
    
    if (!cartList || !cartTotalSpan) return; 

    const cart = loadCart();
    let total = 0;
    let itemsHtml = '';

    if (cart.length === 0) {
        itemsHtml = '<div style="text-align: center; padding: 40px;">Ihr Warenkorb ist leer. Die Digitalisierung wartet nicht auf leere Taschen! <a href="shop.html">Jetzt shoppen!</a></div>';
        if(checkoutButton) checkoutButton.style.display = 'none';
    } else {
        if(checkoutButton) checkoutButton.style.display = 'block';
        // Tabellenkopf
        itemsHtml += '<div class="cart-item-row header-row" style="font-weight: bold; background-color: #ddd;"><span>Artikel</span><span class="item-quantity">Menge</span><span class="item-price">Gesamt</span></div>';
        
        // Einzelne Artikel auflisten
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            itemsHtml += `
                <div class="cart-item-row">
                    <span class="item-details">
                        <h4>${item.name}</h4>
                        <small>Einzelpreis: ${item.price.toFixed(2).replace('.', ',')} €</small>
                    </span>
                    <span class="item-quantity">${item.quantity}</span>
                    <span class="item-price">${itemTotal.toFixed(2).replace('.', ',')} €</span>
                </div>
            `;
        });
    }

    cartList.innerHTML = itemsHtml;
    cartTotalSpan.textContent = total.toFixed(2).replace('.', ','); 
}

// =========================================================
// KASSE ANZEIGE & LOGIK (Zurückgesetzt auf simple Simulation)
// =========================================================

function renderCheckoutPage() {
    const checkoutContainer = document.getElementById('checkoutContainer');
    const checkoutItemsDiv = document.getElementById('checkoutItems');
    const checkoutTotalSpan = document.getElementById('checkoutTotal');
    const checkoutForm = document.getElementById('checkoutForm');
    
    if (!checkoutItemsDiv || !checkoutTotalSpan || !checkoutContainer) return; 

    const cart = loadCart();
    let total = 0;
    let itemsHtml = '';
    
    if (cart.length === 0) {
        checkoutContainer.innerHTML = '<div style="padding: 20px; background-color: #fdd; color: #c00; border-radius: 4px; text-align: center;">Der Warenkorb ist leer! Bitte <a href="shop.html">Artikel hinzufügen</a>.</div>';
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemsHtml += `<p>${item.quantity}x ${item.name} (${itemTotal.toFixed(2).replace('.', ',')} €)</p>`;
    });

    checkoutItemsDiv.innerHTML = itemsHtml;
    checkoutTotalSpan.textContent = total.toFixed(2).replace('.', ',') + ' €';

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            localStorage.removeItem('lindnisCart');
            updateCartCount();

            alert('Vielen Dank für Ihren Kauf! Ihre Bestellung wurde digital freigegeben. (Dies ist eine simulierte Transaktion.)');
            
            window.location.href = 'index.html'; 
        });
    }
}


// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    
    updateCartCount();

    if (document.title.includes('Warenkorb')) {
        renderCartPage();
    }
    if (document.title.includes('Zur Kasse')) {
        renderCheckoutPage();
    }
    
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Smooth Scroll (Funktionalität für Anker-Links #home, #programm etc.)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.classList.remove('active'); 
            
            const targetId = this.getAttribute('href').substring(1);
            if (targetId && document.getElementById(targetId)) {
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });


    // Produkt hinzufügen (Nur auf shop.html)
    document.querySelectorAll('.btn-buy').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const name = button.dataset.productName; 
            const price = parseFloat(button.dataset.productPrice); 

            addItemToCart(name, price);
        });
    });

    // Formular "Fake" Absenden (Nur auf index.html)
    const form = document.getElementById('joinForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const email = form.querySelector('input').value;
            
            if(email) {
                document.getElementById('formMessage').textContent = `Danke! Wir haben ${email} für die Freiheit registriert.`;
                document.getElementById('formMessage').style.color = '#F9EE13';
                form.reset(); 
            }
        });
    }
});
