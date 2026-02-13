async function kendaliLogin() {
    const userInput = document.getElementById('username').value.trim();
    const passInput = document.getElementById('password').value;
    const loginBtn = document.querySelector("#login-box button");
    
    if (userInput !== "" && passInput === "siswa2026") {
        loginBtn.innerText = "Memverifikasi...";
        loginBtn.disabled = true;

        try {
            // 1. Ambil data soal
            const resSoal = await fetch('soal.json');
            daftarSoal = await resSoal.json();
            const totalSoal = daftarSoal.length;

            // 2. Cek ke Google Sheets
            const resStatus = await fetch(`${URL_APPS_SCRIPT}?nama=${encodeURIComponent(userInput)}`);
            const dataServer = await resStatus.json();

            // 3. LOGIKA PENGUNCIAN !!!
            if (dataServer.jumlahDikerjakan >= totalSoal) {
                alert("🛑 AKSES DITOLAK: Nama " + userInput.toUpperCase() + " sudah menyelesaikan ujian ini sebelumnya.");
                loginBtn.innerText = "Mulai Ujian";
                loginBtn.disabled = false;
                return; // Berhenti di sini, tidak masuk ke kuis
            }

            // 4. Jika belum selesai, izinkan masuk dan lanjutkan progres
            indexSekarang = dataServer.jumlahDikerjakan;
            
            document.getElementById('login-box').style.display = 'none';
            document.getElementById('quiz-box').style.display = 'block';
            document.getElementById('user-display').innerText = "👤 " + userInput.toUpperCase();
            document.getElementById('total-soal').innerText = totalSoal;
            
            tampilkanSoal();
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan koneksi ke server.");
            loginBtn.disabled = false;
        }
    } else {
        alert("Nama atau Password salah!");
    }
}
