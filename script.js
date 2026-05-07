const scriptURL = 'https://script.google.com/macros/s/AKfycby9yG2ivGODdSAzLLS8fHJM9U82mf4sJRnjbtg7GL_AQbNyZSoT3OgNzckAdMQZ9Qa9/exec';

// DATA MASTER RUANGAN
let rooms = JSON.parse(localStorage.getItem('rx_rooms_v4')) || [
    { nama: "VIP Executive", kapasitas: 8, fasilitas: "AC, 4K TV" },
    { nama: "Alpha Meeting", kapasitas: 20, fasilitas: "Projector" }
];

let currentFilter = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
    updateRoomSelect();
    renderMasterRooms();
    tampilkanData();
});

// FITUR MASTER RUANGAN
const roomForm = document.getElementById('roomForm');
roomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    rooms.push({
        nama: document.getElementById('masterRuangan').value,
        kapasitas: document.getElementById('masterKapasitas').value,
        fasilitas: document.getElementById('masterFasilitas').value
    });
    localStorage.setItem('rx_rooms_v4', JSON.stringify(rooms));
    roomForm.reset();
    updateRoomSelect();
    renderMasterRooms();
});

function renderMasterRooms() {
    const list = document.getElementById('listMasterRuangan');
    list.innerHTML = rooms.map((r, i) => `
        <tr class="align-middle border-bottom">
            <td class="fw-bold">${r.nama}</td>
            <td><span class="badge bg-dark">${r.kapasitas} Pax</span></td>
            <td class="text-muted small">${r.fasilitas}</td>
            <td class="text-end"><button class="btn btn-sm text-danger" onclick="hapusRoom(${i})"><i class="fas fa-trash"></i></button></td>
        </tr>`).join('');
}

function hapusRoom(i) {
    rooms.splice(i, 1);
    localStorage.setItem('rx_rooms_v4', JSON.stringify(rooms));
    updateRoomSelect();
    renderMasterRooms();
}

function updateRoomSelect() {
    const select = document.getElementById('ruangan');
    select.innerHTML = rooms.map(r => `<option value="${r.nama}" data-cap="${r.kapasitas}" data-fas="${r.fasilitas}">${r.nama}</option>`).join('');
}

// FITUR BOOKING & APPROVAL
const bookingForm = document.getElementById('bookingForm');
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const sel = document.getElementById('ruangan');
    const opt = sel.options[sel.selectedIndex];
    
    const data = {
        nama: document.getElementById('nama').value,
        ruangan: sel.value,
        kapasitas: opt.getAttribute('data-cap'),
        fasilitas: opt.getAttribute('data-fas'),
        tglMulai: document.getElementById('tglMulai').value,
        jamMulai: document.getElementById('jamMulai').value,
        status: "PENDING"
    };

    let bookings = JSON.parse(localStorage.getItem('rx_bookings_v4')) || [];
    bookings.unshift(data);
    localStorage.setItem('rx_bookings_v4', JSON.stringify(bookings));
    
    // Kirim Ke Google Sheets
    fetch(scriptURL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });

    bookingForm.reset();
    tampilkanData();
    alert('Permintaan terkirim! Menunggu approval admin.');
});

function filterData(status, btn) {
    currentFilter = status;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tampilkanData();
}

function tampilkanData() {
    let bookings = JSON.parse(localStorage.getItem('rx_bookings_v4')) || [];
    const list = document.getElementById('daftarBooking');
    
    let filtered = currentFilter === 'ALL' ? bookings : bookings.filter(b => b.status === currentFilter);
    
    list.innerHTML = filtered.length ? '' : '<tr><td colspan="5" class="text-center py-5 opacity-50">Data tidak ditemukan</td></tr>';

    filtered.forEach((item, index) => {
        // Cari index asli untuk update status
        const originalIndex = bookings.findIndex(b => b === item);
        let statusClass = `bg-${item.status.toLowerCase()}`;
        
        list.innerHTML += `
            <tr class="animate__animated animate__fadeInUp border-bottom">
                <td><div class="fw-bold">${item.nama}</div><small class="text-muted">ID-${originalIndex + 101}</small></td>
                <td><div class="fw-bold">${item.ruangan}</div><small class="badge bg-light text-dark border border-dark">${item.kapasitas} Pax</small></td>
                <td><div class="fw-bold text-primary">${item.tglMulai}</div><div class="small">${item.jamMulai} WIB</div></td>
                <td><span class="status-pill ${statusClass}">${item.status}</span></td>
                <td class="text-end">
                    ${item.status === 'PENDING' ? `
                        <button class="btn btn-approve btn-sm px-2 me-1" onclick="updateStatus(${originalIndex}, 'APPROVED')"><i class="fas fa-check"></i></button>
                        <button class="btn btn-reject btn-sm px-2 me-1" onclick="updateStatus(${originalIndex}, 'REJECTED')"><i class="fas fa-times"></i></button>
                    ` : ''}
                    <button class="btn btn-link text-muted" onclick="hapusBooking(${originalIndex})"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;
    });

    // Update Dashboard Stats
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
    if(confirm("Hapus data ini secara permanen?")) {
        let bookings = JSON.parse(localStorage.getItem('rx_bookings_v4'));
        bookings.splice(idx, 1);
        localStorage.setItem('rx_bookings_v4', JSON.stringify(bookings));
        tampilkanData();
    }
}