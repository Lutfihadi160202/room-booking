const scriptURL = 'https://script.google.com/macros/s/AKfycby9yG2ivGODdSAzLLS8fHJM9U82mf4sJRnjbtg7GL_AQbNyZSoT3OgNzckAdMQZ9Qa9/exec';
const ADMIN_PASSWORD = "admin123"; // Ganti password di sini

let rooms = JSON.parse(localStorage.getItem('rx_rooms_v4')) || [
    { nama: "SERVER ROOM A", kapasitas: 5, fasilitas: "Terminal" },
    { nama: "WAR ROOM", kapasitas: 15, fasilitas: "Surround Screen" }
];

document.addEventListener('DOMContentLoaded', () => {
    updateRoomSelect();
    tampilkanData();
    generateQR();
    checkLoginState();
});

// --- FITUR LOGIN ADMIN ---
function login() {
    const pass = document.getElementById('adminPass').value;
    if(pass === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdmin', 'true');
        location.reload();
    } else {
        alert("ACCESS_DENIED: Invalid Credential");
    }
}

function logout() {
    sessionStorage.removeItem('isAdmin');
    location.reload();
}

function checkLoginState() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if(isAdmin) {
        document.querySelectorAll('.admin-only').forEach(el => el.style.setProperty('display', 'block', 'important'));
        document.getElementById('loginBtn').style.display = 'none';
    }
}

// --- FITUR QR CODE ---
function generateQR() {
    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, {
        text: window.location.href, // Mengarah ke halaman ini sendiri
        width: 100,
        height: 100,
        colorDark : "#000000",
        colorLight : "#ffffff",
    });
}

// --- LOGIC DATA ---
function updateRoomSelect() {
    const select = document.getElementById('ruangan');
    select.innerHTML = rooms.map(r => `<option value="${r.nama}">${r.nama}</option>`).join('');
}

document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const data = {
        nama: document.getElementById('nama').value,
        ruangan: document.getElementById('ruangan').value,
        tglMulai: document.getElementById('tglMulai').value,
        tglSelesai: document.getElementById('tglSelesai').value,
        jamMulai: document.getElementById('jamMulai').value,
        jamSelesai: document.getElementById('jamSelesai').value,
        status: "PENDING"
    };

    let bookings = JSON.parse(localStorage.getItem('rx_bookings_v4')) || [];
    bookings.unshift(data);
    localStorage.setItem('rx_bookings_v4', JSON.stringify(bookings));
    
    fetch(scriptURL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
    this.reset();
    tampilkanData();
    alert("REQUEST_SENT: Menunggu Review Admin");
});

function tampilkanData() {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    let bookings = JSON.parse(localStorage.getItem('rx_bookings_v4')) || [];
    const list = document.getElementById('daftarBooking');
    
    list.innerHTML = bookings.map((item, idx) => `
        <tr class="align-middle border-bottom border-secondary">
            <td><div class="fw-bold">${item.nama.toUpperCase()}</div><code class="text-muted" style="font-size:0.7rem">LOG_${idx+100}</code></td>
            <td class="text-primary fw-bold">${item.ruangan}</td>
            <td>
                <div class="small">${item.tglMulai}</div>
                <div class="fw-bold" style="font-size:0.75rem">${item.jamMulai} - ${item.jamSelesai}</div>
            </td>
            <td><span class="badge-it status-${item.status.toLowerCase()}">${item.status}</span></td>
            <td class="text-end admin-only" style="display: ${isAdmin ? 'table-cell' : 'none'}">
                ${item.status === 'PENDING' ? `
                    <button class="btn btn-sm btn-outline-success" onclick="updateStatus(${idx}, 'APPROVED')">OK</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="updateStatus(${idx}, 'REJECTED')">X</button>
                ` : `<button class="btn btn-sm btn-outline-light opacity-25" onclick="hapusBooking(${idx})"><i class="fas fa-trash"></i></button>`}
            </td>
        </tr>
    `).join('');

    document.getElementById('statPending').innerText = bookings.filter(b => b.status === 'PENDING').length;
    document.getElementById('statApproved').innerText = bookings.filter(b => b.status === 'APPROVED').length;
}

function updateStatus(idx, status) {
    let bookings = JSON.parse(localStorage.getItem('rx_bookings_v4'));
    bookings[idx].status = status;
    localStorage.setItem('rx_bookings_v4', JSON.stringify(bookings));
    tampilkanData();
}

function hapusBooking(idx) {
    if(confirm("DELETE_LOG?")) {
        let bookings = JSON.parse(localStorage.getItem('rx_bookings_v4'));
        bookings.splice(idx, 1);
        localStorage.setItem('rx_bookings_v4', JSON.stringify(bookings));
        tampilkanData();
    }
}