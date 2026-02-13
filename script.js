let daftarSoal = [];
let indexSekarang = 0;
// GANTI URL DI BAWAH INI DENGAN URL WEB APP GOOGLE SCRIPT ANDA
const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbz0JycsalbzRons5523b9vvnKVxPvptiM-kd1t78MhpdEm9qabiXUe0OZNdVNWZuw3H/exec";

async function kendaliLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    if (user.trim() !== "" && pass === "siswa2026") {
        document.getElementById('login-box').style.display = 'none';
        document.getElementById('quiz-box').style.display = 'block';
        document.getElementById('user-display').innerText = "👤 " + user;
        
        const response = await fetch('soal.json');
        daftarSoal = await response.json();
        document.getElementById('total-soal').innerText = daftarSoal.length;
        tampilkanSoal();
    } else {
        alert("Nama harus diisi & Password salah!");
    }
}

function tampilkanSoal() {
    const soal = daftarSoal[indexSekarang];
    const wadah = document.getElementById('konten-soal');
    
    // Update Progress Bar
    const persen = ((indexSekarang) / daftarSoal.length) * 100;
    document.getElementById('progress-bar').style.width = persen + "%";
    document.getElementById('current-idx').innerText = indexSekarang + 1;
    
    let html = `<h3>${soal.pertanyaan}</h3>`;
    
    if (soal.tipe === "pilihan-ganda" || soal.tipe === "benar-salah") {
        const opsi = soal.opsi || ["Benar", "Salah"];
        opsi.forEach(o => {
            html += `<label class="opsi-item"><input type="radio" name="jawaban" value="${o}"><span>${o}</span></label>`;
        });
    } else if (soal.tipe === "pg-kompleks") {
        soal.opsi.forEach(o => {
            html += `<label class="opsi-item"><input type="checkbox" name="jawaban" value="${o}"><span>${o}</span></label>`;
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
    
    if (jawabanSiswa.length === 0) return alert("Silakan pilih jawaban terlebih dahulu!");

    // Hitung Benar/Salah (Sederhana)
    const kunci = Array.isArray(soal.kunci) ? soal.kunci.sort().join(",") : soal.kunci;
    const jawab = jawabanSiswa.sort().join(",");
    const status = (kunci === jawab) ? "Benar" : "Salah";

    // Kirim Data ke Google Sheets
    const dataKirim = {
        nama: namaSiswa,
        id_soal: soal.id,
        jawaban: jawab,
        status: status
    };

    fetch(URL_APPS_SCRIPT, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(dataKirim)
    });

    // Pindah ke soal berikutnya
    indexSekarang++;
    if (indexSekarang < daftarSoal.length) {
        tampilkanSoal();
    } else {
        document.getElementById('progress-bar').style.width = "100%";
        document.getElementById('konten-soal').innerHTML = `
            <div style="text-align:center; padding: 20px;">
                <h2 style="color: #22c55e;">✔ Ujian Selesai</h2>
                <p>Terima kasih, jawaban Anda telah tersimpan secara real-time.</p>
            </div>`;
        document.getElementById('btn-next').style.display = 'none';
    }
}
