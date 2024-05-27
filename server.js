const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const morgan = require("morgan");

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("views"));
app.use(bodyParser.json());
app.use(morgan("combined"));

const Gejala = {
  G01: { nama: "Tubuh Kurus", "Nilai Pakar": 0.8 },
  G02: { nama: "Lemas", "Nilai Pakar": 0.6 },
  G03: { nama: "Berat Badan Turun", "Nilai Pakar": 0.7 },
  G04: { nama: "Mudah Sakit", "Nilai Pakar": 0.5 },
  G05: { nama: "Kulit Kering", "Nilai Pakar": 0.6 },
};

const Pilihan = {
  G01: {
    P01: { Pilihan: "Sangat Tidak", Nilai: 0.2 },
    P02: { Pilihan: "Tidak", Nilai: 0.4 },
    P03: { Pilihan: "Sedikit", Nilai: 0.6 },
    P04: { Pilihan: "Terlihat Kurus", Nilai: 0.8 },
    P05: { Pilihan: "Sangat Terlihat Kurus", Nilai: 1.0 },
  },
  G02: {
    P01: { Pilihan: "Berenergi", Nilai: 0.2 },
    P02: { Pilihan: "Agak Berenergi", Nilai: 0.4 },
    P03: { Pilihan: "Kurang Berenergi", Nilai: 0.6 },
    P04: { Pilihan: "Tidak Berenergi", Nilai: 0.8 },
    P05: { Pilihan: "Sangat Tidak Berenergi", Nilai: 1.0 },
  },
  G03: {
    P01: { Pilihan: "Tidak", Nilai: 0.3 },
    P02: { Pilihan: "Sedikit", Nilai: 0.5 },
    P03: { Pilihan: "Cukup", Nilai: 0.7 },
    P04: { Pilihan: "Banyak", Nilai: 0.9 },
  },
  G04: {
    P01: { Pilihan: "Jarang", Nilai: 0.3 },
    P02: { Pilihan: "Kadang", Nilai: 0.5 },
    P03: { Pilihan: "Sering", Nilai: 0.7 },
    P04: { Pilihan: "Selalu", Nilai: 0.9 },
  },
  G05: {
    P01: { Pilihan: "Tidak", Nilai: 0.4 },
    P02: { Pilihan: "Agak", Nilai: 0.6 },
    P03: { Pilihan: "Kering", Nilai: 0.8 },
    P04: { Pilihan: "Sangat Kering", Nilai: 1.0 },
  },
};

function hitung_cf(PG, G) {
  let cf_total = 0;

  let cfA = PG["PG1"] * G["G01"] + (1 - PG["PG1"]) * (1 - G["G01"]);
  let cfB = PG["PG2"] * G["G02"] + (1 - PG["PG2"]) * (1 - G["G02"]);
  let cfC = PG["PG3"] * G["G03"] + (1 - PG["PG3"]) * (1 - G["G03"]);
  let cfD = PG["PG4"] * G["G04"] + (1 - PG["PG4"]) * (1 - G["G04"]);
  let cfE = PG["PG5"] * G["G05"] + (1 - PG["PG5"]) * (1 - G["G05"]);

  let cfAB = Math.max(cfA, cfB);
  let cfBC = Math.max(cfB, cfC);
  let cfCD = Math.max(cfC, cfD);
  let cfDE = Math.max(cfD, cfE);

  cf_total = Math.min(cfAB, cfBC, cfCD, cfDE);

  console.log("Nilai cfA:", cfA);
  console.log("Nilai cfB:", cfB);
  console.log("Nilai cfC:", cfC);
  console.log("Nilai cfD:", cfD);
  console.log("Nilai cfE:", cfE);
  console.log("Nilai cfAB:", cfAB);
  console.log("Nilai cfBC:", cfBC);
  console.log("Nilai cfCD:", cfCD);
  console.log("Nilai cfDE:", cfDE);

  return cf_total;
}

const PG = {
  PG1: 0.8,
  PG2: 0.6,
  PG3: 0.8,
  PG4: 0.6,
  PG5: 1.0,
};

let G;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/result", (req, res) => {
  console.log("Data dari formulir:", req.body);
  let isDataComplete = true;
  let PilihanUser = {};
  for (let key in req.body.symptoms) {
    let selectedValue = req.body.symptoms[key];
    let [gejalaKey, pilihanKey] = selectedValue.split("_");

    if (
      gejalaKey &&
      pilihanKey &&
      Pilihan[gejalaKey] &&
      Pilihan[gejalaKey][pilihanKey]
    ) {
      PilihanUser[gejalaKey] = Pilihan[gejalaKey][pilihanKey]["Nilai"];
    } else {
      isDataComplete = false;
      break;
    }
  }

  if (isDataComplete) {
    let hasil_cf = hitung_cf(PG, PilihanUser);

    let resultText;
    if (hasil_cf >= 0.8) {
      resultText = "Memiliki penyakit Gizi Buruk";
    } else if (hasil_cf >= 0.6) {
      resultText = "Memiliki kemungkinan penyakit Gizi Buruk";
    } else if (hasil_cf >= 0.4) {
      resultText = "Memiliki kemungkinan kekurangan gizi";
    } else {
      resultText = "Kondisi gizi Anda cukup baik";
    }

    res.send({ diagnosis: resultText, cf: hasil_cf });
  } else {
    res.status(400).send("Data tidak lengkap");
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, () => {
  console.log("Server berjalan pada port 3000");
});
