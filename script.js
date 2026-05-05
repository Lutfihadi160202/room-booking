const bookingForm = document.getElementById('bookingForm');
const daftarTable = document.getElementById('daftarBooking');
const scriptURL = 'https://script.google.com/macros/s/AKfycby9yG2ivGODdSAzLLS8fHJM9U82mf4sJRnjbtg7GL_AQbNyZSoT3OgNzckAdMQZ9Qa9/exec';

document.addEventListener('DOMContentLoaded', tampilkanData);

bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const sel = document.getElementById('ruangan');
    const opt = sel.options[sel.selectedIndex];
    
    const btn = e.target.querySelector('button');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Memproses...';
    btn.disabled = true;

    const data = {
        nama: document.getElementById('nama').value,
        ruangan: sel.value,
        kapasitas: opt.getAttribute('data-cap'),
        fasilitas: opt.getAttribute('data-fas'),
        tglMulai: document.getElementById('tglMulai').value,
        tglSelesai: document.getElementById('tglSelesai').value,
        jamMulai: document.getElementById('jamMulai').value,
        jamSelesai: document.getElementById('jamSelesai').value,
        status: 'Confirmed' 
    };

    fetch(scriptURL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) })
    .then(() => {
        let bookings = JSON.parse(localStorage.getItem('bookings_v4')) || [];
        bookings.unshift(data);
        localStorage.setItem('bookings_v4', JSON.stringify(bookings));
        alert('✅ Booking Berhasil Disimpan!');
        bookingForm.reset();
        tampilkanData();
    })
    .finally(() => {
        btn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Konfirmasi Booking';
        btn.disabled = false;
    });
});

function tampilkanData() {
    let bookings = JSON.parse(localStorage.getItem('bookings_v4')) || [];
    daftarTable.innerHTML = '';
    updateDashboard(bookings);

    if (bookings.length === 0) {
        daftarTable.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted small">Belum ada data reservasi</td></tr>';
        return;
    }

    bookings.forEach((item, index) => {
        daftarTable.innerHTML += `
            <tr class="border-bottom">
                <td>
                    <div class="fw-bold text-dark">${item.nama}</div>
                    <small class="text-muted">RES-ID: #${index + 101}</small>
                </td>
                <td>
                    <div class="fw-bold text-primary">${item.ruangan}</div>
                    <div class="mt-1">
                        <span class="badge-info-custom"><i class="fas fa-users me-1"></i>${item.kapasitas} Orang</span>
                        <span class="text-muted ms-1" style="font-size: 0.7rem"><i class="fas fa-tools"></i> ${item.fasilitas}</span>
                    </div>
                </td>
                <td>
                    <div class="small fw-bold"><i class="far fa-calendar-alt me-1 text-primary"></i> ${item.tglMulai} s/d ${item.tglSelesai}</div>
                    <div class="small text-secondary mt-1"><i class="far fa-clock me-1 text-primary"></i> ${item.jamMulai} - ${item.jamSelesai} WIB</div>
                </td>
                <td class="text-center">
                    <button class="btn btn-outline-danger btn-sm border-0" onclick="hapusData(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
    });
}

function updateDashboard(bookings) {
    document.getElementById('statTotal').innerText = bookings.length;
    document.getElementById('statPending').innerText = bookings.filter(b => b.status === 'Menunggu').length;
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('statToday').innerText = bookings.filter(b => b.tglMulai === today).length;
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
        let bookings = JSON.parse(localStorage.getItem('bookings_v4')) || [];
        bookings.splice(index, 1);
        localStorage.setItem('bookings_v4', JSON.stringify(bookings));
        tampilkanData();
    }
}

function downloadExcel() {
    let bookings = JSON.parse(localStorage.getItem('bookings_v4')) || [];
    if (bookings.length === 0) return alert("Data kosong");

    let csv = "Nama,Ruangan,Kapasitas,Fasilitas,Tgl Mulai,Tgl Selesai,Jam Mulai,Jam Selesai\n";
    bookings.forEach(i => {
        csv += `"${i.nama}","${i.ruangan}","${i.kapasitas}","${i.fasilitas}","${i.tglMulai}","${i.tglSelesai}","${i.jamMulai}","${i.jamSelesai}"\n`;
    });

    const link = document.createElement("a");
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    link.download = `Laporan_Reservasi_${new Date().toLocaleDateString()}.csv`;
    link.click();
}