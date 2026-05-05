const bookingForm = document.getElementById('bookingForm');
const daftarTable = document.getElementById('daftarBooking');

document.addEventListener('DOMContentLoaded', tampilkanData);

bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const data = {
        nama: document.getElementById('nama').value,
        ruangan: document.getElementById('ruangan').value,
        tanggal: document.getElementById('tanggal').value
    };

    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings.push(data);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    bookingForm.reset();
    tampilkanData();
});

function tampilkanData() {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    daftarTable.innerHTML = '';
    bookings.forEach(item => {
        daftarTable.innerHTML += `
            <tr>
                <td>${item.nama}</td>
                <td>${item.ruangan}</td>
                <td>${item.tanggal}</td>
            </tr>
        `;
    });
}