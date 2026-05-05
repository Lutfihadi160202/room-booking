const bookingForm = document.getElementById('bookingForm');
const daftarTable = document.getElementById('daftarBooking');

// URL Google Apps Script Anda
const scriptURL = 'https://script.google.com/macros/s/AKfycby9yG2ivGODdSAzLLS8fHJM9U82mf4sJRnjbtg7GL_AQbNyZSoT3OgNzckAdMQZ9Qa9/exec';

document.addEventListener('DOMContentLoaded', tampilkanData);

bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Memproses...';
    btn.disabled = true;

    const data = {
        nama: document.getElementById('nama').value,
        ruangan: document.getElementById('ruangan').value,
        tanggal: document.getElementById('tanggal').value,
        status: 'Menunggu' 
    };

    // Kirim data ke Google Sheets
    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(() => {
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.unshift(data); // Tambah ke atas
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        alert('✅ Booking Berhasil Disimpan!');
        bookingForm.reset();
        tampilkanData();
    })
    .catch(error => {
        console.error('Error!', error.message);
        alert('❌ Terjadi kesalahan koneksi.');
    })
    .finally(() => {
        btn.innerHTML = originalContent;
        btn.disabled = false;
    });
});

function tampilkanData() {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    daftarTable.innerHTML = '';
    
    // Update Dashboard Statistik
    updateDashboard(bookings);

    if (bookings.length === 0) {
        daftarTable.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted small">Belum ada data reservasi</td></tr>';
        return;
    }

    bookings.forEach((item, index) => {
        const d = new Date(item.tanggal);
        const opsi = { day: '2-digit', month: 'long', year: 'numeric' };
        const tglRapi = d.toLocaleDateString('id-ID', opsi);

        daftarTable.innerHTML += `
            <tr class="border-bottom">
                <td>
                    <div class="fw-bold text-dark">${item.nama}</div>
                    <small class="text-muted">ID: #${Math.floor(1000 + Math.random() * 9000)}</small>
                </td>
                <td>
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3">
                        ${item.ruangan}
                    </span>
                </td>
                <td class="text-secondary small">
                    <i class="far fa-calendar me-1"></i> ${tglRapi}
                </td>
                <td>
                    <span class="badge bg-warning text-dark border border-warning-subtle px-2 py-1 small rounded shadow-sm">
                        <i class="fas fa-clock me-1"></i> ${item.status}
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn btn-outline-danger btn-sm border-0" onclick="hapusData(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function updateDashboard(bookings) {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'Menunggu').length;
    
    // Hitung booking hari ini
    const today = new Date().toISOString().split('T')[0];
    const todayCount = bookings.filter(b => b.tanggal === today).length;

    document.getElementById('statTotal').innerText = total;
    document.getElementById('statPending').innerText = pending;
    document.getElementById('statToday').innerText = todayCount;
}

function filterData() {
    let input = document.getElementById('cariNama').value.toLowerCase();
    let rows = daftarTable.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        let textCell = rows[i].getElementsByTagName('td')[0];
        if(textCell) {
            let nama = textCell.innerText.toLowerCase();
            rows[i].style.display = nama.includes(input) ? "" : "none";
        }
    }
}

function hapusData(index) {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.splice(index, 1);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        tampilkanData();
    }
}

function downloadExcel() {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    if (bookings.length === 0) return alert("Data kosong");

    let csvContent = "data:text/csv;charset=utf-8,No,Nama Peminjam,Ruangan,Tanggal,Status\n";
    bookings.forEach((item, index) => {
        csvContent += `${index + 1},${item.nama},${item.ruangan},${item.tanggal},${item.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Reservasi_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}