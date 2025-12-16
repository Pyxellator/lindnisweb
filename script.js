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
    
    // Zähler nur aktualisieren, wenn das Element existiert (was es in der Nav. tut)
    if (cartCountSpan) {
        cartCountSpan.textContent = count;
    }
}

// =========================================================
// WARENKORB LOGIK (Zum Hinzufügen von Artikeln auf shop.html)
// =========================================================

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
    
    // *** KEIN POP-UP WIE GEWÜNSCHT ***
}

// =========================================================
// WARENKORB ANZEIGE (Nur auf warenkorb.html)
// =========================================================

function renderCartPage() {
    const cartList = document.getElementById('cartList');
    const cartTotalSpan = document.getElementById('cartTotal');
    
    // Abbruch, wenn wir NICHT auf der Warenkorb-Seite sind
    if (!cartList || !cartTotalSpan) return; 

    const cart = loadCart();
    let total = 0;
    let itemsHtml = '';

    if (cart.length === 0) {
        itemsHtml = '<div style="text-align: center; padding: 40px;">Ihr Warenkorb ist leer. Die Digitalisierung wartet nicht auf leere Taschen! <a href="shop.html">Jetzt shoppen!</a></div>';
    } else {
        // Tabellenkopf
        itemsHtml += '<div class="cart-item-row" style="background-color: #f0f0f0; font-weight: bold;"><span>Artikel</span><span class="item-quantity">Menge</span><span class="item-price">Preis</span></div>';
        
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
    cartTotalSpan.textContent = total.toFixed(2).replace('.', ','); // Setzt den Gesamtpreis
}

// =========================================================
// KASSE ANZEIGE (Nur auf kasse.html)
// =========================================================

function renderCheckoutPage() {
    const checkoutItemsDiv = document.getElementById('checkoutItems');
    const checkoutTotalSpan = document.getElementById('checkoutTotal');
    const checkoutForm = document.getElementById('checkoutForm');
    
    // Abbruch, wenn wir NICHT auf der Kasse-Seite sind
    if (!checkoutItemsDiv || !checkoutTotalSpan) return; 

    const cart = loadCart();
    let total = 0;
    let itemsHtml = '';

    if (cart.length === 0) {
        itemsHtml = '<p style="color: red; font-weight: bold;">Der Warenkorb ist leer! Bitte gehen Sie zurück zum <a href="shop.html">Shop</a>.</p>';
        if (checkoutForm) checkoutForm.style.display = 'none'; // Formular verstecken, wenn leer
    } else {
        // Artikel für die Zusammenfassung auflisten
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            itemsHtml += `<p>${item.quantity}x ${item.name} (${itemTotal.toFixed(2).replace('.', ',')} €)</p>`;
        });
    }

    checkoutItemsDiv.innerHTML = itemsHtml;
    checkoutTotalSpan.textContent = total.toFixed(2).replace('.', ',') + ' €';

    // *** SIMULIERTER KAUFABSCHLUSS ***
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Logik: Warenkorb leeren und Zähler aktualisieren
            localStorage.removeItem('lindnisCart');
            updateCartCount();

            // Bestätigungsnachricht
            alert('Vielen Dank für Ihren Kauf! Ihre Bestellung wurde digital freigegeben. (Dies ist eine simulierte Transaktion.)');
            
            // Weiterleitung zur Startseite nach Kaufabschluss
            window.location.href = 'index.html'; 
        });
    }
}


// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Zähler auf JEDER Seite aktualisieren
    updateCartCount();

    // 2. Seiten-spezifische Render-Funktionen aufrufen
    if (document.title.includes('Warenkorb')) {
        renderCartPage();
    }
    if (document.title.includes('Zur Kasse')) {
        renderCheckoutPage();
    }
    
    // 3. Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // 4. Smooth Scroll (Funktionalität für Anker-Links #home, #programm etc.)
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


    // 5. Produkt hinzufügen (Nur auf shop.html)
    document.querySelectorAll('.btn-buy').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const name = button.dataset.productName; 
            const price = parseFloat(button.dataset.productPrice); 

            addItemToCart(name, price);
        });
    });

    // 6. Formular "Fake" Absenden (Nur auf index.html)
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