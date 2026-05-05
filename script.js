const bookingForm = document.getElementById('bookingForm');
const daftarTable = document.getElementById('daftarBooking');

// URL Google Apps Script Anda
const scriptURL = 'https://script.google.com/macros/s/AKfycby9yG2ivGODdSAzLLS8fHJM9U82mf4sJRnjbtg7GL_AQbNyZSoT3OgNzckAdMQZ9Qa9/exec';

document.addEventListener('DOMContentLoaded', tampilkanData);

bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button');
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Mengirim ke Kantor...';
    btn.disabled = true;

    const data = {
        nama: document.getElementById('nama').value,
        ruangan: document.getElementById('ruangan').value,
        tanggal: document.getElementById('tanggal').value,
        status: 'Menunggu' // Status default untuk admin
    };

    // 1. Kirim data ke Google Sheets
    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(() => {
        // 2. Simpan di LocalStorage agar muncul di tabel lokal
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.push(data);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        alert('Sukses! Permintaan booking sudah terkirim ke Google Sheets kantor.');
        bookingForm.reset();
        tampilkanData();
    })
    .catch(error => {
        console.error('Error!', error.message);
        alert('Gagal mengirim! Pastikan koneksi internet aktif.');
    })
    .finally(() => {
        btn.innerHTML = 'Booking Sekarang';
        btn.disabled = false;
    });
});

// Fungsi Menampilkan Data ke Tabel
function tampilkanData() {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    daftarTable.innerHTML = '';
    
    bookings.forEach((item, index) => {
        daftarTable.innerHTML += `
            <tr>
                <td class="fw-bold">${item.nama}</td>
                <td><span class="badge bg-info text-dark">${item.ruangan}</span></td>
                <td>${item.tanggal}</td>
                <td><span class="badge bg-warning text-dark">Menunggu</span></td>
                <td>
                    <button class="btn btn-outline-danger btn-sm" onclick="hapusData(${index})">Hapus</button>
                </td>
            </tr>
        `;
    });
}

// Fungsi Pencarian (Filter)
function filterData() {
    let input = document.getElementById('cariNama').value.toLowerCase();
    let rows = daftarTable.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        let nama = rows[i].getElementsByTagName('td')[0].innerText.toLowerCase();
        if (nama.includes(input)) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

// Fungsi Hapus Lokal
function hapusData(index) {
    if (confirm("Hapus tampilan booking ini? (Data di Google Sheets admin tetap tersimpan)")) {
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.splice(index, 1);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        tampilkanData();
    }
}