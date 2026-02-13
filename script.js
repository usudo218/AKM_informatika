let daftarSoal = [];
let indexSekarang = 0;
const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbz0JycsalbzRons5523b9vvnKVxPvptiM-kd1t78MhpdEm9qabiXUe0OZNdVNWZuw3H/exec";

// 1. Fungsi Login Sederhana
function kendaliLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    // Ganti 'admin123' dengan password yang Anda inginkan
    if (user !== "" && pass === "siswa2026") {
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('quiz-box').style.display = 'block';
        document.getElementById('user-display').innerText = "Siswa: " + user;
        muatSoal();
    } else {
        alert("Login Gagal! Periksa nama dan password.");
    }
}

// 2. Ambil Soal dari JSON
async function muatSoal() {
    const response = await fetch('soal.json');
    daftarSoal = await response.json();
    tampilkanSoal();
}

// 3. Render Soal ke HTML
function tampilkanSoal() {
    const soal = daftarSoal[indexSekarang];
    const wadah = document.getElementById('konten-soal');
    document.getElementById('current-idx').innerText = indexSekarang + 1;
    
    let htmlSoal = `<h3>${soal.pertanyaan}</h3>`;
    
    if (soal.tipe === "pilihan-ganda") {
        soal.opsi.forEach(o => {
            htmlSoal += `<label class="opsi-item"><input type="radio" name="jawaban" value="${o}"> ${o}</label>`;
        });
    } else if (soal.tipe === "pg-kompleks") {
        soal.opsi.forEach(o => {
            htmlSoal += `<label class="opsi-item"><input type="checkbox" name="jawaban" value="${o}"> ${o}</label>`;
        });
    } else if (soal.tipe === "benar-salah") {
        htmlSoal += `
            <label class="opsi-item"><input type="radio" name="jawaban" value="Benar"> Benar</label>
            <label class="opsi-item"><input type="radio" name="jawaban" value="Salah"> Salah</label>`;
    }

    wadah.innerHTML = htmlSoal;
}

// 4. Proses Jawaban & Kirim ke Spreadsheet
function prosesJawaban() {
    const nama = document.getElementById('username').value;
    const soal = daftarSoal[indexSekarang];
    let jawabanSiswa = [];
    
    const inputs = document.querySelectorAll('input[name="jawaban"]:checked');
    inputs.forEach(i => jawabanSiswa.push(i.value));
    
    if (jawabanSiswa.length === 0) return alert("Pilih jawaban dulu!");

    // Kirim data ke Spreadsheet secara Real-time
    const dataKirim = {
        nama: nama,
        id_soal: soal.id,
        jawaban: jawabanSiswa.join(", "),
        status: (JSON.stringify(jawabanSiswa) === JSON.stringify(soal.kunci)) ? "Benar" : "Salah"
    };

    fetch(URL_APPS_SCRIPT, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(dataKirim)
    });

    // Lanjut ke soal berikutnya
    indexSekarang++;
    if (indexSekarang < daftarSoal.length) {
        tampilkanSoal();
    } else {
        document.getElementById('konten-soal').innerHTML = "<h2>Ujian Selesai! Terima kasih.</h2>";
        document.getElementById('btn-next').style.display = 'none';
    }

}
