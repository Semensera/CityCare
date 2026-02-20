const map = L.map('map').setView([48.5286, 25.0380], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

let tempMarker = null;
let selectedLat = null;
let selectedLng = null;

// Завантаження проблем з бази
function loadIssues() {
    fetch('/api/issues')
        .then(response => response.json())
        .then(issues => {
            // Очищаємо старі маркери, щоб не було дублікатів (залишаємо тільки шар карти)
            map.eachLayer((layer) => { if (!!layer.toGeoJSON) map.removeLayer(layer); });

            issues.forEach(issue => {
                // Якщо є фото, додаємо тег <img>, якщо ні - залишаємо порожньо
                let photoHtml = issue.photoBase64 ? `<img src="${issue.photoBase64}" style="width:100%; border-radius:5px; margin-top:10px;">` : '';
                
                // Додали кнопку видалення (кнопка 🗑 Видалити)
                const popupText = `
                    <div style="font-family: sans-serif; min-width: 200px;">
                        <span style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${issue.category}</span>
                        <p style="margin: 10px 0;">${issue.description}</p>
                        <small style="color: gray;">Статус: <b>${issue.status}</b></small>
                        ${photoHtml}
                        <button onclick="deleteIssue(${issue.id})" style="margin-top: 10px; width: 100%; background: #ef4444; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold;">🗑 Видалити</button>
                    </div>
                `;
                L.marker([issue.latitude, issue.longitude]).addTo(map).bindPopup(popupText);
            });
        })
        .catch(error => console.error('Помилка:', error));
}

loadIssues();

// Клік по карті
map.on('click', function(e) {
    selectedLat = e.latlng.lat;
    selectedLng = e.latlng.lng;
    if (tempMarker) map.removeLayer(tempMarker);
    tempMarker = L.marker([selectedLat, selectedLng]).addTo(map);
});

// Кнопка Знайти мене
document.getElementById('locateBtn').addEventListener('click', function() {
    if (!navigator.geolocation) { alert("Ваш браузер не підтримує геолокацію."); return; }
    const btn = document.getElementById('locateBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = "⏳ Шукаю вас...";
    map.locate({setView: true, maxZoom: 16});
    
    map.once('locationfound', function(e) {
        btn.innerHTML = originalText;
        selectedLat = e.latlng.lat;
        selectedLng = e.latlng.lng;
        if (tempMarker) map.removeLayer(tempMarker);
        tempMarker = L.marker(e.latlng).addTo(map).bindPopup("Ви тут! Заповніть форму.").openPopup();
    });
});

// Відправка форми
document.getElementById('problemForm').addEventListener('submit', function(e) {
    e.preventDefault();

    if (!selectedLat || !selectedLng) {
        alert("📍 Клікніть на карту, щоб обрати місце!");
        return;
    }

    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const photoInput = document.getElementById('photoInput');

    // Допоміжна функція для відправки даних
    const sendData = (photoBase64Data) => {
        const issueData = {
            category: category,
            description: description,
            latitude: selectedLat,
            longitude: selectedLng,
            photoBase64: photoBase64Data // Може бути null, якщо фото немає
        };

        fetch('/api/issues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(issueData)
        })
        .then(response => response.json())
        .then(() => {
            alert("✅ Заявку відправлено!");
            document.getElementById('problemForm').reset();
            selectedLat = null;
            selectedLng = null;
            if (tempMarker) map.removeLayer(tempMarker);
            loadIssues(); // Оновлюємо маркери
        });
    };

    // Читаємо фото, якщо користувач його обрав
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
            sendData(event.target.result); // Передаємо конвертоване фото
        };
        reader.readAsDataURL(photoInput.files[0]); // Перетворюємо файл у текст
    } else {
        sendData(null); // Відправляємо без фото
    }
});
// 6. Функція для видалення проблеми
window.deleteIssue = function(id) {
    if (confirm("Ви впевнені, що хочете видалити цю мітку?")) {
        fetch('/api/issues/' + id, {
            method: 'DELETE'
        })
        .then(() => {
            alert("🗑 Мітку успішно видалено!");
            map.closePopup(); // Закриваємо віконце
            loadIssues(); // Оновлюємо всі мітки на карті
        })
        .catch(error => console.error('Помилка видалення:', error));
    }
};