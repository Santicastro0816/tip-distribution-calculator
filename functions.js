// percentages
const kitchen = 0.05;
const bar = 0.02;
const support = 0.01;
const management = 0.005;

const taxRate = 0.13;

function calculateDistribution(totalTips, totalSales){
    
    const taxedSales = totalSales *(1 + taxRate);
    
    const kitchenTip = taxedSales * kitchen;

    const barTip = totalSales * bar;

    const supportTip = totalSales * support;

    const managementTip = totalSales * management;

    const distributed = kitchenTip + barTip + supportTip + managementTip;
    const serverTip = totalTips - distributed;

    return {
        salesPlusTax: taxedSales,
        k: kitchenTip,
        b: barTip,
        s: supportTip,
        m: managementTip,
        totalSalesDistributed: distributed,
        serv: serverTip
    };
}

// ===== RENDERING (append below calculateDistribution) =====
(function () {
  const form = document.getElementById("tipForm");
  const resultsDiv = document.getElementById("results");
  const $ = (id) => document.getElementById(id);
  const money = (n) => (isFinite(n) ? Number(n).toFixed(2) : "0.00");

  function render(name, date, ampm, totals, dist) {
    resultsDiv.innerHTML = `
      <div class="card">
        <h2>Results ${name ? `for ${name}` : ""} ${date ? `(${date} ${ampm})` : ""}</h2>
        <ul>
          <li>Net Sales: <strong>$${money(totals.totalSales)}</strong></li>
          <li>Sales + Tax: <strong>$${money(dist.salesPlusTax)}</strong></li>
          <li>Kitchen: <strong>$${money(dist.k)}</strong></li>
          <li>Bar: <strong>$${money(dist.b)}</strong></li>
          <li>Support: <strong>$${money(dist.s)}</strong></li>
          <li>Management: <strong>$${money(dist.m)}</strong></li>
        </ul>
        <p><strong>Total Distributed:</strong> $${money(dist.totalSalesDistributed)}</p>
        <p><strong>Servers (remaining):</strong> $${money(dist.serv)}</p>
        <button id="closeResults" class="close-btn">Close</button>
      </div>
    `;
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault(); // don't reload page

      const name = $("name").value.trim();
      const date = $("date").value;
      const ampm = $("ampm").value;
      const totalSales = parseFloat($("TotalSales").value) || 0;
      const totalTips  = parseFloat($("TotalTips").value)  || 0;

      const dist = calculateDistribution(totalTips, totalSales);
      render(name, date, ampm, { totalSales, totalTips }, dist);

      document.getElementById("closeResults").addEventListener("click", () => {
        window.location.href = "index.html"; // or your main page path
      });

      // let other scripts (e.g., Google Sheet.js) listen and save
      document.dispatchEvent(new CustomEvent("tips:calculated", {
        detail: { name, date, totalSales, totalTips, ...dist }
      }));
      const payload = {
        name,
        date,
        ampm,
        totalSales: money(totalSales),
        salesPlusTax: money(dist.salesPlusTax),
        k: money(dist.k),
        b: money(dist.b),
        s: money(dist.s),
        m: money(dist.m),
        totalSalesDistributed: money(dist.totalSalesDistributed),
        serv: money(dist.serv)
      };

      fetch("https://script.google.com/macros/s/AKfycbyr8siO01Rcm8zUiFFOJtKNyWldLd7f_pATGvr6jeH9xI5-0NMb6N_rCWma60OLJ7M4ow/exec", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(res => res.text())
      .then(msg => console.log("Saved to Google Sheets:", msg))
      .catch(err => console.error("Error saving to Google Sheets:", err));
            
    });
  }
})();


