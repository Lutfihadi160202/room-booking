const scriptURL = 'https://script.google.com/macros/s/AKfycby9yG2ivGODdSAzLLS8fHJM9U82mf4sJRnjbtg7GL_AQbNyZSoT3OgNzckAdMQZ9Qa9/exec';

let rooms = JSON.parse(localStorage.getItem('rx_rooms_v4')) || [
    { nama: "SERVER ROOM A", kapasitas: 5, fasilitas: "Terminal, AC" },
    { nama: "WAR ROOM", kapasitas: 15, fasilitas: "Surround Screen" }
];

let currentFilter = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
    updateRoomSelect();
    renderMasterRooms();
    tampilkanData();
});

// MASTER ROOM LOGIC
const roomForm = document.getElementById('roomForm');
if(roomForm) {
    roomForm.addEventListener('submit', (e) => {
        e.preventDefault();
        rooms.push({
            nama: document.getElementById('masterRuangan').value.toUpperCase(),
            kapasitas: document.getElementById('masterKapasitas').value,
            fasilitas: document.getElementById('masterFasilitas').value
        });
        localStorage.setItem('rx_rooms_v4', JSON.stringify(rooms));
        roomForm.reset();
        updateRoomSelect();
        renderMasterRooms();
    });
}

function renderMasterRooms() {
    const list = document.getElementById('listMasterRuangan');
    if(!list) return;
    list.innerHTML = rooms.map((r, i) => `
        <tr class="align-middle">
            <td class="fw-bold text-primary">${r.nama}</td>
            <td><span class="badge bg-secondary">${r.kapasitas} NODE</span></td>
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
    if(!select) return;
    select.innerHTML = rooms.map(r => `<option value="${r.nama}" data-cap="${r.kapasitas}" data-fas="${r.fasilitas}">${r.nama}</option>`).join('');
}

// BOOKING LOGIC
const bookingForm = document.getElementById('bookingForm');
if(bookingForm) {
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
            tglSelesai: document.getElementById('tglSelesai').value,
            jamMulai: document.getElementById('jamMulai').value,
            jamSelesai: document.getElementById('jamSelesai').value,
            status: "PENDING"
        };

        let bookings = JSON.parse(localStorage.getItem('rx_bookings_v4')) || [];
        bookings.unshift(data);
        localStorage.setItem('rx_bookings_v4', JSON.stringify(bookings));
        
        fetch(scriptURL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });

        bookingForm.reset();
        tampilkanData();
    });
}

function filterData(status, btn) {
    currentFilter = status;
    document.querySelectorAll('.btn-outline-secondary').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tampilkanData();
}

function tampilkanData() {
    let bookings = JSON.parse(localStorage.getItem('rx_bookings_v4')) || [];
    const list = document.getElementById('daftarBooking');
    if(!list) return;
    
    let filtered = currentFilter === 'ALL' ? bookings : bookings.filter(b => b.status === currentFilter);
    list.innerHTML = filtered.length ? '' : '<tr><td colspan="5" class="text-center py-5 opacity-25">NO_LOGS_FOUND</td></tr>';

    filtered.forEach((item, index) => {
        const originalIndex = bookings.findIndex(b => b === item);
        const sClass = item.status.toLowerCase();
        
        list.innerHTML += `
            <tr class="align-middle">
                <td>
                    <div class="fw-bold">${item.nama.toUpperCase()}</div>
                    <code class="small text-muted" style="font-size:0.65rem">ID::${originalIndex + 101}X</code>
                </td>
                <td><div class="text-primary fw-bold" style="font-size:0.85rem">${item.ruangan}</div></td>
                <td>
                    <div class="small fw-bold">${item.tglMulai} <i class="fas fa-arrow-right mx-1 opacity-50"></i> ${item.tglSelesai}</div>
                    <code class="text-secondary" style="font-size:0.75rem">${item.jamMulai} - ${item.jamSelesai}</code>
                </td>
                <td><span class="badge-it status-${sClass}">${item.status}</span></td>
                <td class="text-end">
                    ${item.status === 'PENDING' ? `
                        <button class="btn btn-sm btn-outline-success me-1" onclick="updateStatus(${originalIndex}, 'APPROVED')"><i class="fas fa-check"></i></button>
                        <button class="btn btn-sm btn-outline-danger me-1" onclick="updateStatus(${originalIndex}, 'REJECTED')"><i class="fas fa-times"></i></button>
                    ` : ''}
                    <button class="btn btn-sm text-muted" onclick="hapusBooking(${originalIndex})"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;
    });

    document.getElementById('statPending').innerText = bookings.filter(b => b.status === 'PENDING').length.toString().padStart(2, '0');
    document.getElementById('statApproved').innerText = bookings.filter(b => b.status === 'APPROVED').length.toString().padStart(2, '0');
}

function updateStatus(idx, status) {
    let bookings = JSON.parse(localStorage.getItem('rx_bookings_v4'));
    bookings[idx].status = status;
    localStorage.setItem('rx_bookings_v4', JSON.stringify(bookings));
    tampilkanData();
}

function hapusBooking(idx) {
    if(confirm("TERMINATE LOG DATA?")) {
        let bookings = JSON.parse(localStorage.getItem('rx_bookings_v4'));
        bookings.splice(idx, 1);
        localStorage.setItem('rx_bookings_v4', JSON.stringify(bookings));
        tampilkanData();
    }
}