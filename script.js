let daftarSoal = [];
let indexSekarang = 0;
const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbz0JycsalbzRons5523b9vvnKVxPvptiM-kd1t78MhpdEm9qabiXUe0OZNdVNWZuw3H/exec";

async function kendaliLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    if (user !== "" && pass === "siswa2026") {
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('quiz-box').style.display = 'block';
        document.getElementById('user-display').innerText = user;
        
        // Ambil data soal
        const response = await fetch('soal.json');
        daftarSoal = await response.json();
        tampilkanSoal();
    } else {
        alert("Nama wajib diisi dan password harus benar!");
    }
}

function tampilkanSoal() {
    const soal = daftarSoal[indexSekarang];
    const wadah = document.getElementById('konten-soal');
    document.getElementById('current-idx').innerText = indexSekarang + 1;
    
    let html = `<h3>${soal.pertanyaan}</h3>`;
    
    if (soal.tipe === "pilihan-ganda" || soal.tipe === "benar-salah") {
        const opsi = soal.opsi || ["Benar", "Salah"];
        opsi.forEach(o => {
            html += `<label class="opsi-item"><input type="radio" name="jawaban" value="${o}"> ${o}</label>`;
        });
    } else if (soal.tipe === "pg-kompleks") {
        soal.opsi.forEach(o => {
            html += `<label class="opsi-item"><input type="checkbox" name="jawaban" value="${o}"> ${o}</label>`;
        });
    }
    wadah.innerHTML = html;
}

function prosesJawaban() {
    const namaSiswa = document.getElementById('username').value;
    const soal = daftarSoal[indexSekarang];
    let jawabanSiswa = [];
    
    const terpilih = document.querySelectorAll('input[name="jawaban"]:checked');
    terpilih.forEach(i => jawabanSiswa.push(i.value));
    
    if (jawabanSiswa.length === 0) return alert("Pilih jawaban dahulu!");

    // Kirim ke Google Sheets
    const dataKirim = {
        nama: namaSiswa,
        id_soal: soal.id,
        jawaban: jawabanSiswa.join(", "),
        status: (JSON.stringify(jawabanSiswa.sort()) === JSON.stringify(Array.isArray(soal.kunci) ? soal.kunci.sort() : soal.kunci)) ? "Benar" : "Salah"
    };

    // Eksekusi pengiriman
    fetch(URL_APPS_SCRIPT, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(dataKirim)
    });

    // Pindah Soal
    indexSekarang++;
    if (indexSekarang < daftarSoal.length) {
        tampilkanSoal();
    } else {
        document.getElementById('quiz-box').innerHTML = "<h2>Ujian Selesai! Data sedang dikirim ke server.</h2>";
    }
}

