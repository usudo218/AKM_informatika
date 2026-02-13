const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbzijUrsUOPOeku81GGVgsGFBj0pesI5uqIdY3JIt1HdzKIVIVNDAqSg8qG3Ah99Md0/exec";

async function kendaliLogin() {
    const userInput = document.getElementById('username').value.trim();
    const passInput = document.getElementById('password').value;
    const loginBtn = document.querySelector("#login-box button");
    
    if (userInput !== "" && passInput === "siswa2026") {
        loginBtn.innerText = "Memverifikasi...";
        loginBtn.disabled = true;

        try {
            // 1. Ambil data soal untuk tahu total soal
            const resSoal = await fetch('soal.json?v=' + new Date().getTime()); // Paksa refresh file json
            daftarSoal = await resSoal.json();
            const totalSoal = daftarSoal.length;

            // 2. Cek ke Google Sheets dengan parameter unik agar tidak kena cache browser
            const resStatus = await fetch(`${URL_APPS_SCRIPT}?nama=${encodeURIComponent(userInput)}&t=${new Date().getTime()}`);
            const dataServer = await resStatus.json();

            // 3. LOGIKA BLOKIR JIKA SUDAH SELESAI
            if (dataServer.jumlahDikerjakan >= totalSoal) {
                alert("🛑 LOGIN DITOLAK!\nNama: " + userInput.toUpperCase() + "\nStatus: Sudah menyelesaikan ujian ini.");
                loginBtn.innerText = "Mulai Ujian";
                loginBtn.disabled = false;
                return; 
            }

            // 4. Jika belum selesai, lanjutkan dari soal terakhir
            indexSekarang = dataServer.jumlahDikerjakan;
            
            document.getElementById('login-box').style.display = 'none';
            document.getElementById('quiz-box').style.display = 'block';
            document.getElementById('user-display').innerText = "👤 " + userInput.toUpperCase();
            document.getElementById('total-soal').innerText = totalSoal;
            
            tampilkanSoal();
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan koneksi atau server sibuk.");
            loginBtn.disabled = false;
        }
    } else {
        alert("Nama atau Password salah!");
    }
}
