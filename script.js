const scriptURL = 'https://script.google.com/macros/s/AKfycby9yG2ivGODdSAzLLS8fHJM9U82mf4sJRnjbtg7GL_AQbNyZSoT3OgNzckAdMQZ9Qa9/exec';

// Inisialisasi Data Master Ruangan (Jika kosong, beri default)
let rooms = JSON.parse(localStorage.getItem('master_rooms')) || [
    { nama: "Ruang Alpha", kapasitas: 10, fasilitas: "AC, Projector" },
    { nama: "Ruang Beta", kapasitas: 25, fasilitas: "Smart TV, Sound System" }
];

document.addEventListener('DOMContentLoaded', () => {
    updateRoomSelect();
    renderMasterRooms();
    tampilkanData();
});

// FITUR MASTER RUANGAN
const roomForm = document.getElementById('roomForm');
roomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newRoom = {
        nama: document.getElementById('masterRuangan').value,
        kapasitas: document.getElementById('masterKapasitas').value,
        fasilitas: document.getElementById('masterFasilitas').value
    };
    rooms.push(newRoom);
    localStorage.setItem('master_rooms', JSON.stringify(rooms));
    roomForm.reset();
    updateRoomSelect();
    renderMasterRooms();
});

function renderMasterRooms() {
    const list = document.getElementById('listMasterRuangan');
    list.innerHTML = rooms.map((r, i) => `
        <tr>
            <td class="fw-bold">${r.nama}</td>
            <td>${r.kapasitas} Orang</td>
            <td><small>${r.fasilitas}</small></td>
            <td><button class="btn btn-sm text-danger" onclick="hapusRoom(${i})"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');
    document.getElementById('statRooms').innerText = rooms.length;
}

function hapusRoom(index) {
    rooms.splice(index, 1);
    localStorage.setItem('master_rooms', JSON.stringify(rooms));
    updateRoomSelect();
    renderMasterRooms();
}

function updateRoomSelect() {
    const select = document.getElementById('ruangan');
    select.innerHTML = rooms.map(r => 
        `<option value="${r.nama}" data-cap="${r.kapasitas}" data-fas="${r.fasilitas}">${r.nama} (Cap: ${r.kapasitas})</option>`
    ).join('');
}

// FITUR BOOKING
const bookingForm = document.getElementById('bookingForm');
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const sel = document.getElementById('ruangan');
    const opt = sel.options[sel.selectedIndex];
    const btn = e.target.querySelector('button');
    
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Syncing...';

    const data = {
        nama: document.getElementById('nama').value,
        ruangan: sel.value,
        kapasitas: opt.getAttribute('data-cap'),
        fasilitas: opt.getAttribute('data-fas'),
        tglMulai: document.getElementById('tglMulai').value,
        tglSelesai: document.getElementById('tglSelesai').value,
        jamMulai: document.getElementById('jamMulai').value,
        jamSelesai: document.getElementById('jamSelesai').value
    };

    fetch(scriptURL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) })
    .then(() => {
        let bookings = JSON.parse(localStorage.getItem('bookings_v5')) || [];
        bookings.unshift(data);
        localStorage.setItem('bookings_v5', JSON.stringify(bookings));
        bookingForm.reset();
        tampilkanData();
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = 'Konfirmasi Jadwal <i class="fas fa-arrow-right ms-2"></i>';
    });
});

function tampilkanData() {
    let bookings = JSON.parse(localStorage.getItem('bookings_v5')) || [];
    const list = document.getElementById('daftarBooking');
    list.innerHTML = bookings.length ? '' : '<tr><td colspan="4" class="text-center p-5 opacity-50">Belum ada jadwal</td></tr>';

    bookings.forEach((item, index) => {
        list.innerHTML += `
            <tr>
                <td>
                    <div class="fw-bold">${item.nama}</div>
                    <small class="text-muted">ID: #${index + 101}</small>
                </td>
                <td>
                    <div class="badge-room mb-1 d-inline-block">${item.ruangan}</div>
                    <div class="small text-muted"><i class="fas fa-users me-1"></i>${item.kapasitas} | <i class="fas fa-tools me-1"></i>${item.fasilitas}</div>
                </td>
                <td>
                    <div class="small fw-bold text-primary"><i class="far fa-calendar-alt me-1"></i>${item.tglMulai}</div>
                    <div class="small text-muted"><i class="far fa-clock me-1"></i>${item.jamMulai} - ${item.jamSelesai}</div>
                </td>
                <td class="text-center">
                    <button class="btn btn-link text-danger p-0" onclick="hapusBooking(${index})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
    document.getElementById('statTotal').innerText = bookings.length;
}

function hapusBooking(index) {
    if(confirm("Hapus jadwal?")) {
        let bookings = JSON.parse(localStorage.getItem('bookings_v5')) || [];
        bookings.splice(index, 1);
        localStorage.setItem('bookings_v5', JSON.stringify(bookings));
        tampilkanData();
    }
}

function downloadExcel() {
    let bookings = JSON.parse(localStorage.getItem('bookings_v5')) || [];
    let csv = "Nama,Ruangan,Kapasitas,Fasilitas,Mulai,Selesai,Waktu\n";
    bookings.forEach(b => csv += `"${b.nama}","${b.ruangan}","${b.kapasitas}","${b.fasilitas}","${b.tglMulai}","${b.tglSelesai}","${b.jamMulai}-${b.jamSelesai}"\n`);
    window.location.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
}