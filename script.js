let daftarSoal = [];
let indexSekarang = 0;
const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbz0JycsalbzRons5523b9vvnKVxPvptiM-kd1t78MhpdEm9qabiXUe0OZNdVNWZuw3H/exec";

async function kendaliLogin() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    const loginBtn = document.querySelector("#login-box button");
    
    if (user !== "" && pass === "siswa2026") {
        loginBtn.innerText = "Mengecek Status...";
        loginBtn.disabled = true;

        try {
            // 1. Ambil data soal terlebih dahulu
            const resSoal = await fetch('soal.json');
            daftarSoal = await resSoal.json();

            // 2. Cek status ke Google Sheets (Real-time)
            const response = await fetch(`${URL_APPS_SCRIPT}?nama=${encodeURIComponent(user)}`);
            const statusServer = await response.json();

            if (statusServer.soalTerakhir >= daftarSoal.length) {
                alert("Anda sudah menyelesaikan seluruh soal ujian ini.");
                loginBtn.innerText = "Mulai Ujian";
                loginBtn.disabled = false;
                return;
            }

            // 3. Set Progres (Melanjutkan)
            indexSekarang = statusServer.soalTerakhir;
            
            document.getElementById('login-box').style.display = 'none';
            document.getElementById('quiz-box').style.display = 'block';
            document.getElementById('user-display').innerText = "👤 " + user.toUpperCase();
            document.getElementById('total-soal').innerText = daftarSoal.length;
            
            tampilkanSoal();
        } catch (err) {
            alert("Gagal terhubung ke server. Pastikan internet stabil.");
            loginBtn.disabled = false;
        }
    } else {
        alert("Nama wajib diisi & Password salah!");
    }
}

function tampilkanSoal() {
    const soal = daftarSoal[indexSekarang];
    const wadah = document.getElementById('konten-soal');
    
    document.getElementById('current-idx').innerText = indexSekarang + 1;
    const persen = (indexSekarang / daftarSoal.length) * 100;
    document.getElementById('progress-bar').style.width = persen + "%";
    
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
    const user = document.getElementById('username').value.trim();
    const soal = daftarSoal[indexSekarang];
    let jawabanSiswa = [];
    
    const terpilih = document.querySelectorAll('input[name="jawaban"]:checked');
    terpilih.forEach(i => jawabanSiswa.push(i.value));
    
    if (jawabanSiswa.length === 0) return alert("Pilih jawaban dulu!");

    const kunci = Array.isArray(soal.kunci) ? soal.kunci.sort().join(",") : soal.kunci;
    const jawab = jawabanSiswa.sort().join(",");
    const status = (kunci === jawab) ? "Benar" : "Salah";

    const dataKirim = {
        nama: user.toUpperCase(),
        id_soal: soal.id,
        jawaban: jawab,
        status: status
    };

    // Kirim data ke Google Sheets
    fetch(URL_APPS_SCRIPT, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(dataKirim)
    });

    indexSekarang++;
    if (indexSekarang < daftarSoal.length) {
        tampilkanSoal();
    } else {
        document.getElementById('progress-bar').style.width = "100%";
        document.getElementById('konten-soal').innerHTML = `
            <div style="text-align:center; padding: 20px;">
                <h2 style="color: #22c55e;">✔ Ujian Selesai</h2>
                <p>Terima kasih <strong>${user.toUpperCase()}</strong>, data Anda sudah aman di server.</p>
            </div>`;
        document.getElementById('btn-next').style.display = 'none';
    }
}
