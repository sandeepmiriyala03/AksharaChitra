document.addEventListener("DOMContentLoaded", () => {
  // Get today's Panchangam
  const today = new Date();
  panchang.calculate(today, () => {
    const box = document.getElementById("panchangamContent");
    if (!box) return;

    box.innerHTML = `
      <div class="panchangam-card">
        <h3>${panchang.Raasi.name} రాశి • ${panchang.teluguYears} సంవత్సరం</h3>
        <p class="date-line">${today.toLocaleDateString("te-IN", {
          weekday: "long", day: "numeric", month: "long", year: "numeric"
        })}</p>
        <hr>
        <p>🌅 తిథి: ${panchang.Tithi.name}</p>
        <p>🌙 నక్షత్రం: ${panchang.Nakshatra.name}</p>
        <p>🌟 యోగం: ${panchang.Yoga.name}</p>
        <p>🕉 కరణం: ${panchang.Karna.name}</p>
        <p>📜 అయనాంశం: ${panchang.Ayanamsa.name}</p>
      </div>
    `;
  });
});
