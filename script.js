const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbz0JycsalbzRons5523b9vvnKVxPvptiM-kd1t78MhpdEm9qabiXUe0OZNdVNWZuw3H/exec";
let daftarSoal = [];
let indexSekarang = 0;

async function kendaliLogin() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    const btn = document.querySelector("#login-box button");

    if (user !== "" && pass === "siswa2026") {
        btn.innerText = "Menghubungkan...";
        btn.disabled = true;

        try {
            // 1. Ambil data soal
            const resSoal = await fetch('soal.json');
            daftarSoal = await resSoal.json();

            // 2. Cek status ke server
            const resStatus = await fetch(`${URL_APPS_SCRIPT}?nama=${encodeURIComponent(user)}&t=${Date.now()}`);
            const dataServer = await resStatus.json();

            // 3. Cek apakah sudah selesai
            if (dataServer.jumlahDikerjakan >= daftarSoal.length) {
                alert("Siswa dengan nama " + user.toUpperCase() + " sudah menyelesaikan ujian.");
                btn.innerText = "Mulai Ujian";
                btn.disabled = false;
                return;
            }

            // 4. Set Progres & Masuk
            indexSekarang = dataServer.jumlahDikerjakan;
            document.getElementById('login-box').style.display = 'none';
            document.getElementById('quiz-box').style.display = 'block';
            document.getElementById('user-display').innerText = "👤 " + user.toUpperCase();
            document.getElementById('total-soal').innerText = daftarSoal.length;
            tampilkanSoal();

        } catch (err) {
            console.error(err);
            alert("Koneksi gagal! Pastikan URL Apps Script sudah benar & akses di-set ke 'Anyone'.");
            btn.disabled = false;
            btn.innerText = "Mulai Ujian";
        }
    } else {
        alert("Nama atau Password salah!");
    }
}

function tampilkanSoal() {
    const soal = daftarSoal[indexSekarang];
    const wadah = document.getElementById('konten-soal');
    document.getElementById('current-idx').innerText = indexSekarang + 1;
    document.getElementById('progress-bar').style.width = (indexSekarang / daftarSoal.length * 100) + "%";

    let html = `<h3>${soal.pertanyaan}</h3>`;
    const tipe = soal.tipe;

    if (tipe === "pilihan-ganda" || tipe === "benar-salah") {
        const opsi = soal.opsi || ["Benar", "Salah"];
        opsi.forEach(o => {
            html += `<label class="opsi-item"><input type="radio" name="jawaban" value="${o}"><span>${o}</span></label>`;
        });
    } else if (tipe === "pg-kompleks") {
        soal.opsi.forEach(o => {
            html += `<label class="opsi-item"><input type="checkbox" name="jawaban" value="${o}"><span>${o}</span></label>`;
        });
    }
    wadah.innerHTML = html;
}

async function prosesJawaban() {
    const user = document.getElementById('username').value.trim();
    const soal = daftarSoal[indexSekarang];
    let terpilih = [];
    document.querySelectorAll('input[name="jawaban"]:checked').forEach(i => terpilih.push(i.value));

    if (terpilih.length === 0) return alert("Pilih jawaban!");

    const kunci = Array.isArray(soal.kunci) ? soal.kunci.sort().join(",") : soal.kunci;
    const jawabSiswa = terpilih.sort().join(",");
    
    // Kirim Data
    fetch(URL_APPS_SCRIPT, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
            nama: user,
            id_soal: soal.id,
            jawaban: jawabSiswa,
            status: (kunci === jawabSiswa) ? "Benar" : "Salah"
        })
    });

    indexSekarang++;
    if (indexSekarang < daftarSoal.length) {
        tampilkanSoal();
    } else {
        document.getElementById('progress-bar').style.width = "100%";
        document.getElementById('konten-soal').innerHTML = "<h2 style='text-align:center; color:green;'>✔ Ujian Selesai!</h2>";
        document.getElementById('btn-next').style.display = 'none';
    }
}
