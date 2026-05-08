const map = L.map('map').setView([48.5286, 25.0380], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

let tempMarker = null;
let selectedLat = null;
let selectedLng = null;
let currentUser = { role: 'ROLE_GUEST', username: 'guest' };

// 1. ПЕРЕВІРКА: Хто зараз на сайті?
function checkAuth() {
    fetch('/api/auth/me')
        .then(res => res.json())
        .then(user => {
            currentUser = user;
            updateUI();
            loadIssues(); // Завантажуємо мітки після того, як дізналися роль
        });
}

// 2. ОНОВЛЕННЯ ІНТЕРФЕЙСУ (Ховаємо/показуємо кнопки)
function updateUI() {
    const authPanel = document.getElementById('authPanel');
    const problemForm = document.getElementById('problemForm');
    const guestMessage = document.getElementById('guestMessage');

    if (currentUser.role !== 'ROLE_GUEST') {
        let roleName = currentUser.role === 'ROLE_ADMIN' ? '👑 Адміністратор' : '👤 Користувач';
        authPanel.innerHTML = `
            <span style="margin-right: 15px; font-weight: bold; color: #2563eb;">${roleName} (${currentUser.username})</span>
            <button class="btn-logout" onclick="logout()">Вийти</button>
        `;
        problemForm.style.display = 'block';
        guestMessage.style.display = 'none';
    } else {
        authPanel.innerHTML = `
            <button class="btn-login" onclick="document.getElementById('loginModal').style.display='block'">Увійти</button>
            <button class="btn-register" onclick="document.getElementById('registerModal').style.display='block'">Реєстрація</button>
        `;
        problemForm.style.display = 'none';
        guestMessage.style.display = 'block';
    }
}

// 3. ЗАВАНТАЖЕННЯ МІТОК (З перевіркою адміна)
function loadIssues() {
    fetch('/api/issues')
        .then(response => response.json())
        .then(issues => {
            map.eachLayer((layer) => { if (!!layer.toGeoJSON) map.removeLayer(layer); });

            issues.forEach(issue => {
                let photoHtml = issue.photoBase64 ? `<img src="${issue.photoBase64}" style="width:100%; border-radius:5px; margin-top:10px;">` : '';

                // Кнопку видалення малюємо ТІЛЬКИ ЯКЩО ЮЗЕР АДМІН
                let deleteBtnHtml = '';
                if (currentUser.role === 'ROLE_ADMIN') {
                    deleteBtnHtml = `<button onclick="deleteIssue(${issue.id})" style="margin-top: 10px; width: 100%; background: #ef4444; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">🗑 Видалити</button>`;
                }

                const popupText = `
                    <div style="font-family: sans-serif; min-width: 200px;">
                        <span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${issue.category}</span>
                        <p style="margin: 10px 0;">${issue.description}</p>
                        ${photoHtml}
                        ${deleteBtnHtml}
                    </div>
                `;
                L.marker([issue.latitude, issue.longitude]).addTo(map).bindPopup(popupText);
            });
        });
}

// 4. ЛОГІКА АВТОРИЗАЦІЇ (Вхід, Реєстрація, Вихід)
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const data = {
        username: document.getElementById('regUsername').value,
        password: document.getElementById('regPassword').value
    };
    fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.text()).then(msg => {
        alert(msg);
        if (msg === 'Успіх') {
            closeModals();
            document.getElementById('loginModal').style.display='block';
        }
    });
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append('username', document.getElementById('loginUsername').value);
    formData.append('password', document.getElementById('loginPassword').value);

    fetch('/api/auth/login', { method: 'POST', body: formData })
        .then(res => {
            if(res.ok) { closeModals(); checkAuth(); }
            else { alert("❌ Неправильний логін або пароль!"); }
        });
});

function logout() {
    fetch('/api/auth/logout', { method: 'POST' }).then(() => checkAuth());
}

function closeModals() {
    document.getElementById('loginModal').style.display = "none";
    document.getElementById('registerModal').style.display = "none";
}

// 5. Видалення (працює тільки у Адміна)
window.deleteIssue = function(id) {
    if (confirm("Видалити мітку?")) {
        fetch('/api/issues/' + id, { method: 'DELETE' }).then(() => { map.closePopup(); loadIssues(); });
    }
};

// Базова логіка карти (кліки та геолокація)
map.on('click', function(e) {
    if (currentUser.role === 'ROLE_GUEST') return; // Гості не можуть ставити мітки
    selectedLat = e.latlng.lat; selectedLng = e.latlng.lng;
    if (tempMarker) map.removeLayer(tempMarker);
    tempMarker = L.marker([selectedLat, selectedLng]).addTo(map);
});

document.getElementById('locateBtn').addEventListener('click', function() {
    if (!navigator.geolocation) return;
    map.locate({setView: true, maxZoom: 16});
    map.once('locationfound', function(e) {
        selectedLat = e.latlng.lat; selectedLng = e.latlng.lng;
        if (tempMarker) map.removeLayer(tempMarker);
        tempMarker = L.marker(e.latlng).addTo(map).bindPopup("Ви тут!").openPopup();
    });
});

document.getElementById('problemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!selectedLat) { alert("📍 Клікніть на карту!"); return; }

    const photoInput = document.getElementById('photoInput');
    const sendData = (photoData) => {
        fetch('/api/issues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category: document.getElementById('category').value,
                description: document.getElementById('description').value,
                latitude: selectedLat, longitude: selectedLng, photoBase64: photoData
            })
        }).then(() => {
            alert("✅ Відправлено!");
            this.reset(); selectedLat = null; if (tempMarker) map.removeLayer(tempMarker); loadIssues();
        });
    };

    if (photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = e => sendData(e.target.result);
        reader.readAsDataURL(photoInput.files[0]);
    } else { sendData(null); }
});

// Запускаємо перевірку при старті сторінки
checkAuth();