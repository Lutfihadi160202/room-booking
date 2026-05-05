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

    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(() => {
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.unshift(data); // Tambah ke atas (data terbaru dulu)
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // SweetAlert bisa ditambahkan di sini untuk popup lebih keren
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
    
    if (bookings.length === 0) {
        daftarTable.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted small">Belum ada data reservasi</td></tr>';
        return;
    }

    bookings.forEach((item, index) => {
        // Format Tanggal Pro (Misal: 06 Mei 2026)
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
                    <span class="badge-status bg-warning-subtle text-warning border border-warning-subtle">
                        <i class="fas fa-clock me-1"></i> ${item.status}
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn btn-light btn-sm text-danger shadow-sm border" onclick="hapusData(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
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
    if (confirm("Apakah Anda yakin ingin menghapus data ini dari tampilan lokal?")) {
        let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        bookings.splice(index, 1);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        tampilkanData();
    }
}

function downloadExcel() {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    if (bookings.length === 0) {
        alert("Tidak ada data untuk diekspor!");
        return;
    }

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