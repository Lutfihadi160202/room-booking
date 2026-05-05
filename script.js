const bookingForm = document.getElementById('bookingForm');
const daftarTable = document.getElementById('daftarBooking');

// Menjalankan fungsi tampilkanData saat halaman pertama kali dimuat
document.addEventListener('DOMContentLoaded', tampilkanData);

// Logika saat tombol "Booking Sekarang" diklik
bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nama = document.getElementById('nama').value;
    const ruangan = document.getElementById('ruangan').value;
    const tanggal = document.getElementById('tanggal').value;

    // VALIDASI: Cek apakah tanggal yang dipilih sudah lewat dari hari ini
    const today = new Error().stack ? new Date().toISOString().split('T')[0] : ""; 
    const tglHariIni = new Date().setHours(0,0,0,0);
    const tglPilihan = new Date(tanggal).setHours(0,0,0,0);

    if (tglPilihan < tglHariIni) {
        alert("Waduh! Kamu tidak bisa memesan ruangan untuk tanggal yang sudah lewat.");
        return;
    }

    const data = {
        nama: nama,
        ruangan: ruangan,
        tanggal: tanggal
    };

    // Simpan ke LocalStorage
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings.push(data);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Reset form dan refresh tabel
    bookingForm.reset();
    tampilkanData();
});

// Fungsi untuk menampilkan daftar booking ke tabel HTML
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

// Fungsi untuk menghapus data tertentu
function hapusData(index) {
    if (confirm("Apakah kamu yakin ingin menghapus pesanan ini?")) {
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.splice(index, 1); // Menghapus data berdasarkan urutannya
        localStorage.setItem('bookings', JSON.stringify(bookings));
        tampilkanData(); // Refresh tabel
    }
}