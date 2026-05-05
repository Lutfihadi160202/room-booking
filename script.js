const bookingForm = document.getElementById('bookingForm');
const daftarTable = document.getElementById('daftarBooking');

// URL sudah diperbaiki (spasi di ujung sudah dihapus)
const scriptURL = 'https://script.google.com/macros/s/AKfycby9yG2ivGODdSAzLLS8fHJM9U82mf4sJRnjbtg7GL_AQbNyZSoT3OgNzckAdMQZ9Qa9/exec';

document.addEventListener('DOMContentLoaded', tampilkanData);

bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button');
    btn.innerHTML = 'Sedang Mengirim...';
    btn.disabled = true;

    const data = {
        nama: document.getElementById('nama').value,
        ruangan: document.getElementById('ruangan').value,
        tanggal: document.getElementById('tanggal').value
    };

    // Kirim data menggunakan format No-Cors agar tidak terhalang keamanan browser
    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', // Tambahan agar lebih lancar
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(() => {
        // Karena pakai 'no-cors', kita langsung anggap berhasil jika tidak ada error network
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.push(data);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        alert('Sukses! Data telah dikirim ke kantor (Google Sheets).');
        bookingForm.reset();
        tampilkanData();
    })
    .catch(error => {
        console.error('Error!', error.message);
        alert('Gagal! Cek koneksi atau pastikan URL Script sudah benar.');
    })
    .finally(() => {
        btn.innerHTML = 'Booking Sekarang';
        btn.disabled = false;
    });
});

function tampilkanData() {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    daftarTable.innerHTML = '';
    bookings.forEach((item, index) => {
        daftarTable.innerHTML += `
            <tr>
                <td>${item.nama}</td>
                <td>${item.ruangan}</td>
                <td>${item.tanggal}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="hapusData(${index})">Hapus</button>
                </td>
            </tr>
        `;
    });
}

function hapusData(index) {
    if (confirm("Hapus dari daftar tampilan? (Data asli di Google Sheets tetap aman)")) {
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.splice(index, 1);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        tampilkanData();
    }
}