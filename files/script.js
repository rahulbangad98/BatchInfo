const form = document.getElementById("search-form");
const input = document.getElementById("batch-input");
const result = document.getElementById("result");

// "Batch 1", "batch-1" and "BATCH1" all match the same batch.
const normalize = (s) => s.toLowerCase().replace(/[\s\-_]/g, "");

function formatDate(iso) {
  if (!iso) return "Not available";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function render(batch) {
  const status = (batch.status || "Pending").toLowerCase();
  const expired = batch.bestBeforeDate && new Date(batch.bestBeforeDate + "T23:59:59") < new Date();

  const report = batch.labReport
    ? `<a class="report-link" href="${escapeHtml(batch.labReport)}" target="_blank" rel="noopener">View lab report</a>`
    : `<span class="muted">Not uploaded yet</span>`;

  result.innerHTML = `
    <article class="tag">
      <div class="tag-head">
        <div>
          <p class="small">Batch number</p>
          <h2>${escapeHtml(batch.batchNumber)}</h2>
        </div>
        <span class="status status-${escapeHtml(status)}">Lab test: ${escapeHtml(batch.status || "Pending")}</span>
      </div>
      <dl>
        <div><dt>Farm / source</dt><dd>${escapeHtml(batch.farm) || "Not available"}</dd></div>
        <div><dt>Harvest date</dt><dd>${formatDate(batch.harvestDate)}</dd></div>
        <div><dt>Best before</dt><dd>${formatDate(batch.bestBeforeDate)}${expired ? ' <span class="expired">Past best before date</span>' : ""}</dd></div>
        <div><dt>Lab report</dt><dd>${report}</dd></div>
      </dl>
    </article>`;
}

function renderNotFound(query) {
  result.innerHTML = `
    <div class="notfound">
      <h2>No batch found for "${escapeHtml(query)}"</h2>
      <p>Check the number on your pack. Spaces and capital letters don't matter.</p>
    </div>`;
}

function search(query) {
  const q = normalize(query);
  if (!q) return;
  const match = BATCHES.find((b) => normalize(b.batchNumber) === q);
  match ? render(match) : renderNotFound(query.trim());
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  search(input.value);
  history.replaceState(null, "", "?batch=" + encodeURIComponent(input.value.trim()));
});

// Lets you put a QR code on the pack that opens the page with the batch filled in:
// https://yourname.github.io/batch-lookup/?batch=Batch%201
const param = new URLSearchParams(location.search).get("batch");
if (param) {
  input.value = param;
  search(param);
}
