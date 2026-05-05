const scriptURL = 'https://script.google.com/macros/s/AKfycby9yG2ivGODdSAzLLS8fHJM9U82mf4sJRnjbtg7GL_AQbNyZSoT3OgNzckAdMQZ9Qa9/exec';

// DATA MASTER RUANGAN (LOCALSTORAGE)
let rooms = JSON.parse(localStorage.getItem('elite_master_rooms')) || [
    { nama: "VIP Executive", kapasitas: 8, fasilitas: "4K TV, Minibar, AC" },
    { nama: "Ballroom Utama", kapasitas: 100, fasilitas: "Sound, LED Wall, Stage" },
    { nama: "Meeting Alpha", kapasitas: 15, fasilitas: "Projector, Glassboard" }
];

document.addEventListener('DOMContentLoaded', () => {
    updateRoomSelect();
    renderMasterRooms();
    tampilkanData();
});

// FITUR TAMBAH/KELOLA RUANGAN
const roomForm = document.getElementById('roomForm');
roomForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newRoom = {
        nama: document.getElementById('masterRuangan').value,
        kapasitas: document.getElementById('masterKapasitas').value,
        fasilitas: document.getElementById('masterFasilitas').value
    };
    rooms.push(newRoom);
    localStorage.setItem('elite_master_rooms', JSON.stringify(rooms));
    roomForm.reset();
    updateRoomSelect();
    renderMasterRooms();
    alert('Ruangan Berhasil Ditambahkan!');
});

function renderMasterRooms() {
    const list = document.getElementById('listMasterRuangan');
    list.innerHTML = rooms.map((r, i) => `
        <tr class="align-middle">
            <td class="fw-bold">${r.nama}</td>
            <td><span class="badge bg-light text-dark">${r.kapasitas} Pax</span></td>
            <td><small class="text-muted">${r.fasilitas}</small></td>
            <td><button class="btn btn-sm btn-outline-danger" onclick="hapusRoom(${i})"><i class="fas fa-trash-alt"></i></button></td>
        </tr>
    `).join('');
    document.getElementById('statRooms').innerText = rooms.length;
}

function hapusRoom(index) {
    if(confirm("Hapus ruangan ini dari database?")) {
        rooms.splice(index, 1);
        localStorage.setItem('elite_master_rooms', JSON.stringify(rooms));
        updateRoomSelect();
        renderMasterRooms();
    }
}

function updateRoomSelect() {
    const select = document.getElementById('ruangan');
    select.innerHTML = rooms.map(r => 
        `<option value="${r.nama}" data-cap="${r.kapasitas}" data-fas="${r.fasilitas}">${r.nama} (Kapasitas: ${r.kapasitas})</option>`
    ).join('');
}

// FITUR PROSES BOOKING
const bookingForm = document.getElementById('bookingForm');
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const sel = document.getElementById('ruangan');
    const opt = sel.options[sel.selectedIndex];
    const btn = e.target.querySelector('button');
    
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Syncing Database...';

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

    // Simulasi & Kirim ke Google Sheets
    fetch(scriptURL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) })
    .then(() => {
        let bookings = JSON.parse(localStorage.getItem('elite_bookings_v1')) || [];
        bookings.unshift(data);
        localStorage.setItem('elite_bookings_v1', JSON.stringify(bookings));
        bookingForm.reset();
        tampilkanData();
        alert('Booking Berhasil Terkonfirmasi!');
    })
    .finally(() => {
        btn.disabled = false;
        btn.innerHTML = 'BOOKING SEKARANG <i class="fas fa-chevron-right ms-2"></i>';
    });
});

function tampilkanData() {
    let bookings = JSON.parse(localStorage.getItem('elite_bookings_v1')) || [];
    const list = document.getElementById('daftarBooking');
    list.innerHTML = bookings.length ? '' : '<tr><td colspan="4" class="text-center py-5 text-muted">Belum ada jadwal yang terdaftar</td></tr>';

    bookings.forEach((item, index) => {
        list.innerHTML += `
            <tr class="fade-in">
                <td>
                    <div class="fw-bold">${item.nama}</div>
                    <div class="text-muted" style="font-size: 0.7rem">TRANS-ID: #RK-${index+101}</div>
                </td>
                <td>
                    <span class="room-tag d-inline-block mb-1">${item.ruangan}</span>
                    <div class="small text-muted"><i class="fas fa-users me-1"></i>${item.kapasitas} Pax | <i class="fas fa-tools me-1"></i>${item.fasilitas}</div>
                </td>
                <td>
                    <div class="fw-bold text-indigo small"><i class="far fa-calendar-alt me-1 text-primary"></i> ${item.tglMulai}</div>
                    <div class="text-muted" style="font-size: 0.75rem">${item.jamMulai} - ${item.jamSelesai} WIB</div>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-link text-danger" onclick="hapusBooking(${index})"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;
    });
    document.getElementById('statTotal').innerText = bookings.length;
    document.getElementById('badgeTotal').innerText = bookings.length;
    
    // Statistik agenda hari ini
    const today = new Date().toISOString().split('T')[0];
    const todayCount = bookings.filter(b => b.tglMulai === today).length;
    document.getElementById('statToday').innerText = todayCount;
}

function hapusBooking(index) {
    if(confirm("Batalkan reservasi ini?")) {
        let bookings = JSON.parse(localStorage.getItem('elite_bookings_v1')) || [];
        bookings.splice(index, 1);
        localStorage.setItem('elite_bookings_v1', JSON.stringify(bookings));
        tampilkanData();
    }
}

function downloadExcel() {
    let bookings = JSON.parse(localStorage.getItem('elite_bookings_v1')) || [];
    if(!bookings.length) return alert("Tidak ada data untuk diekspor!");
    
    let csv = "Nama,Ruangan,Kapasitas,Fasilitas,Tgl Mulai,Tgl Selesai,Waktu\n";
    bookings.forEach(b => csv += `"${b.nama}","${b.ruangan}","${b.kapasitas}","${b.fasilitas}","${b.tglMulai}","${b.tglSelesai}","${b.jamMulai}-${b.jamSelesai}"\n`);
    
    const link = document.createElement("a");
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    link.download = `Report_RoomMaster_${new Date().toLocaleDateString()}.csv`;
    link.click();
}