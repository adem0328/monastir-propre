// ===== DATA STORAGE (localStorage) =====
const STORAGE_KEYS = {
    sorties: 'monastir_propre_sorties',
    avis: 'monastir_propre_avis'
};

function getData(key) {
    const data = localStorage.getItem(STORAGE_KEYS[key]);
    return data ? JSON.parse(data) : [];
}

function saveData(key, entry) {
    const data = getData(key);
    entry.id = Date.now();
    entry.date_soumission = new Date().toLocaleString('fr-TN');
    data.push(entry);
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
    updateCounts();
    return entry;
}

function updateCounts() {
    const sortiesCount = getData('sorties').length;
    const avisCount = getData('avis').length;
    document.getElementById('countSorties').textContent = sortiesCount;
    document.getElementById('countAvis').textContent = avisCount;
}

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ===== SORTIE FORM =====
document.getElementById('sortieForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const entry = {};
    formData.forEach((value, key) => { entry[key] = value; });

    saveData('sorties', entry);
    this.reset();

    showModal(
        'Inscription Confirmee !',
        'Merci ' + entry.nom + ' ! Votre inscription pour la sortie du ' + entry.sortie + ' a ete enregistree. Vous recevrez un rappel par email.'
    );
});

// ===== AVIS FORM =====
document.getElementById('avisForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const entry = {};
    formData.forEach((value, key) => { entry[key] = value; });

    saveData('avis', entry);
    this.reset();

    showModal(
        'Avis Enregistre !',
        'Merci ' + entry.nom + ' pour votre contribution. Votre avis nous aidera a mieux orienter nos actions pour Monastir.'
    );
});

// ===== MODAL =====
function showModal(title, message) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('successModal').classList.add('active');
}

function closeModal() {
    document.getElementById('successModal').classList.remove('active');
}

// Close modal on overlay click
document.getElementById('successModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// ===== CSV EXPORT =====
function downloadCSV(type) {
    const data = getData(type);

    if (data.length === 0) {
        alert('Aucune donnee a exporter. Remplissez d\'abord le formulaire.');
        return;
    }

    let csv = '';
    const headers = Object.keys(data[0]);
    csv += headers.join(';') + '\n';

    data.forEach(row => {
        const values = headers.map(h => {
            let val = (row[h] || '').toString().replace(/"/g, '""');
            if (val.includes(';') || val.includes('\n') || val.includes('"')) {
                val = '"' + val + '"';
            }
            return val;
        });
        csv += values.join(';') + '\n';
    });

    // BOM for Excel UTF-8 compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'sorties' ? 'inscriptions_sorties_monastir.csv' : 'avis_citoyens_monastir.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ===== QR CODE =====
function generateQR() {
    const url = document.getElementById('siteUrl').value.trim();
    if (!url) {
        alert('Veuillez entrer l\'URL de votre site.');
        return;
    }

    const qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = '';

    if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, {
            text: url,
            width: 180,
            height: 180,
            colorDark: '#0d3b25',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    } else {
        // Fallback: use Google Charts API
        const img = document.createElement('img');
        img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(url) + '&color=0d3b25';
        img.alt = 'QR Code';
        img.style.borderRadius = '8px';
        qrContainer.appendChild(img);
    }
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    updateCounts();
    // Auto-generate QR with default URL
    generateQR();
});
