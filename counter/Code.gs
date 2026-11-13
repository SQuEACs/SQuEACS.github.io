/**
 * SQuEACs Lab model view counter.
 * Records 3D model views from the lab website into this Google Sheet.
 *
 * Setup (once):
 *   1. In the Sheet: Extensions > Apps Script. Paste this file over the default code. Save.
 *   2. Run the "setup" function once (choose it in the toolbar, click Run, approve access).
 *   3. Deploy > New deployment > type "Web app".
 *        Execute as: Me      Who has access: Anyone
 *      Click Deploy and copy the Web app URL (ends in /exec).
 *   4. Paste that URL into COUNTER_URL in the website's script.js.
 *
 * The site sends: { event: "view" | "rotate" | "label", model: "tadpole-cns", label: "6 Optic Tectum" }
 * No IP addresses or personal data are stored.
 */

const ALLOWED_EVENTS = ["page", "view", "rotate", "label"];
const TZ = "America/Phoenix";

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let log = ss.getSheetByName("Log");
  if (!log) log = ss.insertSheet("Log");
  if (log.getLastRow() === 0) {
    log.appendRow(["Timestamp", "Month", "Event", "Model", "Label"]);
    log.setFrozenRows(1);
    log.getRange("A1:E1").setFontWeight("bold");
  }

  let sum = ss.getSheetByName("Summary");
  if (!sum) sum = ss.insertSheet("Summary", 0);
  sum.clear();
  sum.getRange("A1").setValue("Totals by model and event").setFontWeight("bold");
  sum.getRange("A2").setFormula(
    '=IFERROR(QUERY(Log!A:E,"select D, C, count(A) where C <> \'label\' and C <> \'page\' and A is not null group by D, C pivot B label D \'Model\', C \'Event\'",1),"No views yet")'
  );
  sum.getRange("H1").setValue("All-time totals").setFontWeight("bold");
  sum.getRange("H2").setFormula(
    '=IFERROR(QUERY(Log!A:E,"select D, C, count(A) where A is not null and C <> \'page\' group by D, C label D \'Model\', C \'Event\', count(A) \'Count\'",1),"No views yet")'
  );
  sum.getRange("H12").setValue("Site visits").setFontWeight("bold");
  sum.getRange("H13").setFormula('=COUNTIF(Log!C:C,"page")');

  let labels = ss.getSheetByName("Labels");
  if (!labels) labels = ss.insertSheet("Labels");
  labels.clear();
  labels.getRange("A1").setValue("Structures selected, most popular first").setFontWeight("bold");
  labels.getRange("A2").setFormula(
    '=IFERROR(QUERY(Log!A:E,"select D, E, count(A) where C = \'label\' group by D, E order by count(A) desc label D \'Model\', E \'Structure\', count(A) \'Selections\'",1),"No selections yet")'
  );

  const extra = ss.getSheetByName("Sheet1");
  if (extra && extra.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(extra);
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const event = String(data.event || "");
    if (ALLOWED_EVENTS.indexOf(event) === -1) return out("ignored");

    // Keep stored values short and plain.
    const clean = v => String(v || "").replace(/[^\w\s,().'-]/g, "").slice(0, 80);
    const now = new Date();
    const lock = LockService.getScriptLock();
    lock.waitLock(5000);
    try {
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log").appendRow([
        now,
        Utilities.formatDate(now, TZ, "yyyy-MM"),
        event,
        clean(data.model),
        clean(data.label)
      ]);
    } finally {
      lock.releaseLock();
    }
    return out("ok");
  } catch (err) {
    return out("error");
  }
}

// Visiting the web app URL in a browser shows a quick text summary.
function doGet() {
  const rows = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log").getDataRange().getValues().slice(1);
  const counts = {};
  rows.forEach(r => {
    if (r[2] === "page") return;
    const k = `${r[3]} · ${r[2]}`;
    counts[k] = (counts[k] || 0) + 1;
  });
  const visits = rows.filter(r => r[2] === "page").length;
  const lines = Object.keys(counts).sort().map(k => `${k}: ${counts[k]}`);
  return out(["SQuEACs Lab model counts", `Site visits: ${visits}`, ...lines].join("\n"));
}

function out(text) {
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
}
