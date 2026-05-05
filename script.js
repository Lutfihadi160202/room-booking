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
        status: 'Menunggu' 
    };

    // 1. Kirim data ke Google Sheets
    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(() => {
        // 2. Simpan di LocalStorage
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.push(data);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        alert('Sukses! Data telah tersinkron dengan Google Sheets kantor.');
        bookingForm.reset();
        tampilkanData();
    })
    .catch(error => {
        console.error('Error!', error.message);
        alert('Gagal mengirim! Periksa koneksi internet Anda.');
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
                <td class="fw-bold text-dark">${item.nama}</td>
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

function hapusData(index) {
    if (confirm("Hapus dari tampilan tabel? (Data di Google Sheets tetap aman)")) {
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.splice(index, 1);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        tampilkanData();
    }
}

// FUNGSI BARU: Download Laporan ke Excel (CSV format)
function downloadExcel() {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    if (bookings.length === 0) {
        alert("Belum ada data untuk di-download.");
        return;
    }

    // Header Kolom
    let csvContent = "Nama,Ruangan,Tanggal,Status\n";

    // Isi Data
    bookings.forEach(item => {
        let row = `${item.nama},${item.ruangan},${item.tanggal},${item.status}`;
        csvContent += row + "\n";
    });

    // Proses Download
    let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    let link = document.createElement("a");
    let url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Laporan_Booking_Ruangan.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}