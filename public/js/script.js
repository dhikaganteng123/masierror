document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("diagnosisForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
      alert("Silakan pilih minimal satu gejala.");
      return;
    }

    const selectedSymptoms = Array.from(checkboxes).map((checkbox) => {
      const symptom = checkbox.name;
      const severityInput = form.querySelector(`#${symptom}_select`);
      const severity = severityInput ? severityInput.value : "";
      return `${symptom}_${severity}`;
    });

    fetch("/result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symptoms: selectedSymptoms }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Data from server:", data);
        document.getElementById(
          "diagnosisResult"
        ).innerText = `Diagnosis: ${data.diagnosis}`;
        document.getElementById("cfResult").innerText = `Nilai CF: ${data.cf}`;
      })
      .catch((error) => console.error("Error:", error));
  });
});
