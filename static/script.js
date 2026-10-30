const tanamanData = [
    {nama: "Padi", jenis: "Padi", kc: [1.05, 1.20, 0.90]},
    {nama: "Jagung", jenis: "Palawija", kc: [0.30, 1.20, 0.60]},
    {nama: "Kedelai", jenis: "Palawija", kc: [0.40, 1.15, 0.50]},
    {nama: "Kacang tanah", jenis: "Palawija", kc: [0.40, 1.15, 0.60]},
    {nama: "Kacang hijau", jenis: "Palawija", kc: [0.40, 1.15, 0.35]},
    {nama: "Cabai", jenis: "Palawija", kc: [0.60, 1.05, 0.90]},
    {nama: "Tomat", jenis: "Palawija", kc: [0.60, 1.15, 0.80]},
    {nama: "Bawang merah", jenis: "Palawija", kc: [0.50, 1.05, 0.75]},
    {nama: "Kentang", jenis: "Palawija", kc: [0.50, 1.15, 0.75]},
    {nama: "Kubis", jenis: "Palawija", kc: [0.70, 1.05, 0.95]},
    {nama: "Semangka", jenis: "Palawija", kc: [0.40, 1.00, 0.75]},
    {nama: "Tembakau", jenis: "Palawija", kc: [0.35, 1.10, 0.90]},
    {nama: "Tebu", jenis: "Palawija", kc: [0.40, 1.25, 0.75]}
];

const format = angka =>
    Number(angka).toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

function isiPilihanTanaman() {
    const select = document.getElementById("tanaman");

    select.innerHTML = "";

    tanamanData.forEach((tanaman, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = tanaman.nama;
        select.appendChild(option);
    });

    select.value = 0;
}

function ambilInput() {
    const angka = id => {
        const nilai = Number(document.getElementById(id).value);

        if (!Number.isFinite(nilai) || nilai < 0) {
            throw new Error("Data masukan tidak boleh kosong atau negatif.");
        }

        return nilai;
    };

    const luas = angka("luas");
    const eto = angka("eto");
    const re = angka("re");
    const p = angka("p");
    const wlr = angka("wlr");
    const efisiensi = angka("efisiensi");

    if (luas <= 0 || efisiensi <= 0 || efisiensi > 100) {
        throw new Error("Luas harus lebih dari 0 dan efisiensi 1–100%.");
    }

    return {
        eto,
        re,
        p,
        wlr,
        luas,
        efisiensi: efisiensi / 100
    };
}

function hitungNFR(tanaman, fase, input) {
    const kc = tanaman.kc[fase];

    const etc = kc * input.eto;

    // P dan WLR digunakan untuk tanaman padi.
    const pPakai = tanaman.jenis === "Padi" ? input.p : 0;
    const wlrPakai = tanaman.jenis === "Padi" ? input.wlr : 0;

    const nfr = Math.max(
        0,
        etc + pPakai + wlrPakai - input.re
    );

    const dr = nfr / (8.64 * input.efisiensi);

    const debitTotal = dr * input.luas;

    const volume = nfr * 10 * input.luas;

    return {
        kc,
        etc,
        pPakai,
        wlrPakai,
        nfr,
        dr,
        debitTotal,
        volume
    };
}

function hitung() {
    try {
        const input = ambilInput();

        const index = Number(document.getElementById("tanaman").value);
        const fase = Number(document.getElementById("fase").value);

        const tanaman = tanamanData[index];

        const hasil = hitungNFR(tanaman, fase, input);

        document.getElementById("hasilNFR").textContent =
            format(hasil.nfr);

        document.getElementById("hasilKc").textContent =
            format(hasil.kc);

        document.getElementById("hasilETc").textContent =
            format(hasil.etc) + " mm/hari";

        document.getElementById("hasilP").textContent =
            format(hasil.pPakai) + " mm/hari";

        document.getElementById("hasilWLR").textContent =
            format(hasil.wlrPakai) + " mm/hari";

        document.getElementById("hasilRe").textContent =
            format(input.re) + " mm/hari";

        document.getElementById("hasilDR").textContent =
            format(hasil.dr) + " L/dt/ha";

        document.getElementById("hasilDebitTotal").textContent =
            format(hasil.debitTotal) + " L/dt";

        document.getElementById("hasilVolume").textContent =
            format(hasil.volume) + " m³/hari";

        buatTabel(input, fase, index);

    } catch (error) {
        alert(error.message);
    }
}

function buatTabel(input, fase, selectedIndex) {
    const tbody = document.getElementById("isiTabel");

    tbody.innerHTML = "";

    tanamanData.forEach((tanaman, index) => {

        const hasil = hitungNFR(tanaman, fase, input);

        const row = document.createElement("tr");

        if (index === selectedIndex) {
            row.classList.add("selected");
        }

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${tanaman.nama}</td>
            <td>${tanaman.jenis}</td>
            <td>${format(tanaman.kc[0])}</td>
            <td>${format(tanaman.kc[1])}</td>
            <td>${format(tanaman.kc[2])}</td>
            <td>${format(hasil.kc)}</td>
            <td>${format(hasil.nfr)}</td>
            <td>${format(hasil.dr)}</td>
        `;

        tbody.appendChild(row);
    });
}

function resetData() {
    document.getElementById("tanaman").value = "0";
    document.getElementById("fase").value = "1";
    document.getElementById("bulan").selectedIndex = 5;
    document.getElementById("tanah").value = "2.5";

    document.getElementById("eto").value = "4.5";
    document.getElementById("re").value = "0.5";
    document.getElementById("p").value = "2.5";
    document.getElementById("wlr").value = "3.3";
    document.getElementById("efisiensi").value = "65";
    document.getElementById("luas").value = "1";

    hitung();
}

function exportCSV() {
    const tabel = document.getElementById("tabelTanaman");

    let csv = [];

    for (const row of tabel.rows) {
        const kolom = Array.from(row.cells).map(cell =>
            `"${cell.innerText.replace(/"/g, '""')}"`
        );

        csv.push(kolom.join(";"));
    }

    const blob = new Blob(
        ["\uFEFF" + csv.join("\n")],
        {type: "text/csv;charset=utf-8;"}
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "Tabel_NFR_Debit_Rencana.csv";

    link.click();

    URL.revokeObjectURL(url);
}

// Jalankan kalkulator ketika halaman dibuka.
document.addEventListener("DOMContentLoaded", () => {
    isiPilihanTanaman();
    hitung();
});
