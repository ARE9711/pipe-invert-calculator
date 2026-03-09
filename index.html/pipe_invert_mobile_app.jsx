<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pipe Invert Calculator</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, Helvetica, sans-serif;
      background: #f4f7fb;
      color: #1f2937;
    }
    .wrap {
      max-width: 760px;
      margin: 0 auto;
      padding: 16px;
    }
    .title {
      font-size: 28px;
      font-weight: 700;
      margin: 8px 0 4px;
    }
    .subtitle {
      color: #4b5563;
      margin: 0 0 16px;
    }
    .card {
      background: #ffffff;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      margin-bottom: 16px;
    }
    .card h2 {
      margin: 0 0 12px;
      font-size: 20px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }
    label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      font-size: 16px;
    }
    .hint {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
    .btn-row {
      display: flex;
      gap: 10px;
      margin-top: 14px;
      flex-wrap: wrap;
    }
    button {
      border: 0;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-primary {
      background: #2563eb;
      color: white;
    }
    .btn-secondary {
      background: #e5e7eb;
      color: #111827;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }
    .summary-box {
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 12px;
    }
    .summary-label {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 6px;
    }
    .summary-value {
      font-size: 24px;
      font-weight: 700;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      padding: 10px 8px;
      border-bottom: 1px solid #e5e7eb;
      text-align: left;
    }
    th {
      background: #f8fafc;
    }
    .error {
      color: #b91c1c;
      font-weight: 600;
    }
    @media (max-width: 640px) {
      .title { font-size: 24px; }
      table { font-size: 13px; }
      th, td { padding: 8px 6px; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="title">Pipe Invert Calculator</div>
    <p class="subtitle">Enter total run, pipe length, slope percent, and starting invert. The app calculates the invert at the end of each stick.</p>

    <div class="card">
      <h2>Inputs</h2>
      <div class="grid">
        <div>
          <label for="totalRun">Total run (ft)</label>
          <input id="totalRun" type="number" step="any" value="200" />
        </div>
        <div>
          <label for="pipeLength">Pipe length per stick (ft)</label>
          <input id="pipeLength" type="number" step="any" value="20" />
        </div>
        <div>
          <label for="slopePercent">Slope (%)</label>
          <input id="slopePercent" type="number" step="any" value="0.5" />
        </div>
        <div>
          <label for="startingInvert">Starting invert (ft)</label>
          <input id="startingInvert" type="number" step="0.1" value="100.0" />
          <div class="hint">Example: 100.0 or 98.7</div>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn-primary" onclick="calculate()">Calculate</button>
        <button class="btn-secondary" onclick="resetForm()">Reset</button>
      </div>
      <p id="error" class="error"></p>
    </div>

    <div class="card">
      <h2>Summary</h2>
      <div class="summary-grid">
        <div class="summary-box">
          <div class="summary-label">Total fall</div>
          <div class="summary-value" id="totalFall">0.00 ft</div>
        </div>
        <div class="summary-box">
          <div class="summary-label">Ending invert</div>
          <div class="summary-value" id="endingInvert">0.00</div>
        </div>
        <div class="summary-box">
          <div class="summary-label">Full sticks</div>
          <div class="summary-value" id="fullSticks">0</div>
        </div>
        <div class="summary-box">
          <div class="summary-label">Last piece</div>
          <div class="summary-value" id="lastPiece">0.00 ft</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Invert by Stick</h2>
      <div style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th>Stick</th>
              <th>Length (ft)</th>
              <th>Start Invert</th>
              <th>End Invert</th>
              <th>Fall This Stick</th>
              <th>Run to End</th>
            </tr>
          </thead>
          <tbody id="resultsBody"></tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    function fmt(value, digits = 2) {
      return Number(value).toFixed(digits);
    }

    function calculate() {
      const totalRun = parseFloat(document.getElementById('totalRun').value);
      const pipeLength = parseFloat(document.getElementById('pipeLength').value);
      const slopePercent = parseFloat(document.getElementById('slopePercent').value);
      const startingInvert = parseFloat(document.getElementById('startingInvert').value);
      const error = document.getElementById('error');
      const resultsBody = document.getElementById('resultsBody');
      error.textContent = '';
      resultsBody.innerHTML = '';

      if (!(totalRun > 0) || !(pipeLength > 0) || !(slopePercent > 0) || !isFinite(startingInvert)) {
        error.textContent = 'Please enter valid values in all fields.';
        document.getElementById('totalFall').textContent = '0.00 ft';
        document.getElementById('endingInvert').textContent = '0.00';
        document.getElementById('fullSticks').textContent = '0';
        document.getElementById('lastPiece').textContent = '0.00 ft';
        return;
      }

      const fallPerFoot = slopePercent / 100;
      const totalFall = totalRun * fallPerFoot;
      const endingInvert = startingInvert - totalFall;
      const fullSticks = Math.floor(totalRun / pipeLength);
      const remainder = totalRun - fullSticks * pipeLength;

      document.getElementById('totalFall').textContent = fmt(totalFall) + ' ft';
      document.getElementById('endingInvert').textContent = fmt(endingInvert);
      document.getElementById('fullSticks').textContent = fullSticks;
      document.getElementById('lastPiece').textContent = fmt(remainder) + ' ft';

      let accumulated = 0;
      let currentStart = startingInvert;
      let stickNumber = 1;

      while (accumulated < totalRun - 1e-9) {
        const thisLength = Math.min(pipeLength, totalRun - accumulated);
        const fallThisStick = thisLength * fallPerFoot;
        const endInvert = currentStart - fallThisStick;
        accumulated += thisLength;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${stickNumber}</td>
          <td>${fmt(thisLength)}</td>
          <td>${fmt(currentStart)}</td>
          <td>${fmt(endInvert)}</td>
          <td>${fmt(fallThisStick)} ft</td>
          <td>${fmt(accumulated)} ft</td>
        `;
        resultsBody.appendChild(row);

        currentStart = endInvert;
        stickNumber += 1;
      }
    }

    function resetForm() {
      document.getElementById('totalRun').value = '200';
      document.getElementById('pipeLength').value = '20';
      document.getElementById('slopePercent').value = '0.5';
      document.getElementById('startingInvert').value = '100.0';
      calculate();
    }

    calculate();
  </script>
</body>
</html>
