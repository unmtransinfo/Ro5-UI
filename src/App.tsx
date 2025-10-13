import React from 'react';

import './App.css';


import {useState, useEffect} from "react"
import { api } from "./lib/api";
import type { Ro5Item, Ro5Summary, Hist, Box, DownloadPayload } from "./types";


//helper function for box/histogram
function MiniHist({ hist, title, unit }: { hist: Hist; title:string; unit?:string }) {
  if(!hist?.counts?.length) return null;

  //W is chart width and H is bar max height, others should make sense
  const W = 260;
  const H = 80;
  const max = Math.max(1, ...hist.counts);
  const bins = hist.bins;
  const xMin = bins[0];
  const xMax = bins[bins.length -1]
  const xMid = bins[Math.floor(bins.length / 2)];


  return (
    <div style={{ width: W, marginTop: 10 }}>
      {/* title */}
      <div style={{ fontSize: 15, color: "#c6cedbff" }}>{title}</div>

      {/* bars */}
      <div style={{display: "flex",gap: 2,alignItems: "flex-end",height: H, marginTop: 6,
        background: "#fcf8f8ff"
      }}>
        {hist.counts.map((c, i) => (
          <div key={i} title={`${format1(bins[i])} - ${format1(bins[i+1])}${unit ? " " + unit : ""}: ${c}`}
            style={{
              width: Math.max(4, (W - 2 * hist.counts.length) / hist.counts.length),
              height: `${(c / max) * H}px`,background: "#7aa6ff",borderRadius: 2
            }}
          />
        ))}
      </div>



      {/* x-axis */}
      <div style={{ position: "relative", height: 40, marginTop: 4 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1, background: "#ebe5e5ff" }}/>
        <div style={{ position: "absolute", top: 6, left: 0, fontSize: 11, color: "#c6cedbff" }}>
          {format1(xMin)}
        </div>
        <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "#c6cedbff" }}>
          {format1(xMid)}
        </div>
        <div style={{ position: "absolute", top: 6, right: 0, fontSize: 11, color: "#c6cedbff" }}>
          {format1(xMax)}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "#c6cedbff" }}>
          {unit ? `Value (${unit})` : "Value"}
        </div>
      </div>


      {/* y-axis hint (max count) */}
      <div style={{ fontSize: 11, color: "#c6cedbff", marginTop: 2 }}>max count (inside a bar): {max}</div>

    </div>


  );
}

function MiniBox({ box, title, unit }: { box: Box; title:string; unit?:string }) {
  if (box.min == null) return null;


  const W = 260;
  const H = 80;

  //scale for numbers.
  const scale = (x:number)=> ((x - (box.min as number)) / ((box.max as number)-(box.min as number))) * W;
  const q1 = scale(box.q1 as number), q3 = scale(box.q3 as number), med = scale(box.median as number);


  return (

    <div style={{ width: W, marginTop: 8 }}>

      {/* title */}
      <div style={{ fontSize: 15, color: "#c6cedbff" }}>{title}</div>



      {/* plot */}
      <div style={{ position:"relative", width: W, height: H, background:"#fcf8f8ff", borderRadius:4, marginTop:6 }}>

        {/* whisker line */}
        <div style={{ position:"absolute", left:0, top: H/2 - 1, width: W, height:2, background:"#c7d2fe" }}/>
        {/* box */}
        <div style={{position:"absolute", left:q1, top:6,width: Math.max(2, q3 - q1), height: H - 12, background:"#93c5fd", borderRadius:4}}/>
        {/* median */}
        <div style={{ position:"absolute", left:med, top:4, width:2, height:H-8, background:"#1e3a8a" }}
             title={`median: ${format1(box.median)}${unit ? " " + unit : ""}`}/>
        {/* min/max tickers */}
        <div title={`min: ${format1(box.min)}${unit ? " " + unit : ""}`} style={{
          position: "absolute", left: 0, top: H/2 - 6, width: 2, height: 12, background:"#1e3a8a"
        }}/>
        <div title={`max: ${format1(box.max)}${unit ? " " + unit : ""}`} style={{
          position: "absolute", left: W-2, top: H/2 - 6, width: 2, height: 12, background:"#1e3a8a"
        }}/>
      </div>



      {/* x-axis with labels */}
      <div style={{ position: "relative", height: 40, marginTop: 4 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1, background: "#e5e7eb" }}/>

        <div style={{ position: "absolute", top: 6, left: 0, fontSize: 11, color: "#c6cedbff" }}> 
          {format1(box.min)}{unit ? ` ${unit}` : ""}
        </div>
        <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "#c6cedbff" }}>
          {format1(box.median)}{unit ? ` ${unit}` : ""}
        </div>
        <div style={{ position: "absolute", top: 6, right: 0, fontSize: 11, color: "#c6cedbff" }}>
          {format1(box.max)}{unit ? ` ${unit}` : ""}
        </div>
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "#c6cedbff" }}>
          {unit ? `Value (${unit})` : "Value"}
        </div>


      </div>
    </div>
  );
}

//for download
function triggerDownload(d: DownloadPayload) {
  const bytes = atob(d.content);
  const arr = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }
  const blob = new Blob([arr], { type: d.mime || "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = d.filename || "ro5_results.csv";
  a.click();
  URL.revokeObjectURL(url);
}


//help
function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{position: "fixed", top: 0,left:0,right: 0,bottom: 0,background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "white", color: "black", padding: 20, borderRadius: 8, width: 600, maxHeight: "80vh", overflowY: "auto"
      }}>
        <h2>Help & About</h2>

        <h3>Theory</h3>
        <p>
          The Lipinski Rule of Five (Ro5), proposed by Christopher A. Lipinski in 1997, is a simple guideline
          for estimating whether a compound is likely to be an orally active drug in humans. It uses four key
          molecular descriptors:
        </p>
        <ul style={{textAlign: "left"}}>
          <li><b>MWT</b> - Molecular Weight (&lt;= 500)</li>
          <li><b>LogP</b> - Predicted octanol-water partition coefficient (&lt; 5.0)</li>
          <li><b>HBD</b> - Hydrogen Bond Donors (&lt;= 5)</li>
          <li><b>HBA</b> - Hydrogen Bond Acceptors (&lt;= 10)</li>
        </ul>
        <p>
          A compound is considered "drug-like" if it violates no more than one of these rules. 
          In this app, you can adjust the allowed violations (<b>vmax</b> default = 1).
        </p>
        <p>
          It is generally understood that these criteria do not apply to biologics, nor to transporter mediated targets.
        </p>

        <h3>How to Use</h3>
        <ol style={{textAlign: "left"}}>
          <li>Enter one or more SMILES strings (comma separated).</li>
          <li>Click <b>Compute</b>.</li>
          <li>View results per compound (if dataset is small), plus overall summary statistics and plots.</li>
          <li>Download results as CSV for larger datasets.</li>
        </ol>

        <h3>Input Limits</h3>
        <ul style={{textAlign: "left"}}>
          <li>&lt; 5,000 compounds - full results + summary shown on page.</li>
          <li>5,000-9,999 compounds - summary only + CSV download.</li>
          <li>&gt; 10,000 compounds - request rejected (too large).</li>
        </ul>

        <h3>Outputs</h3>
        <ul style={{textAlign: "left"}}>
          <li>Per-compound: descriptors, violations, pass/fail flag.</li>
          <li>Summary: mean, standard deviation, pass/fail counts.</li>
          <li>Visuals: histograms and boxplots for MWT, LogP, HBD, HBA.</li>
          <li>Download: CSV with all compound-level results.</li>
        </ul>

        <h3> Developing this app: </h3>
        <p>Bat
        </p>
        <button onClick={onClose} style={{ marginTop: 20, padding: "6px 12px" }}>
          Close
        </button>
      </div>
    </div>
  );
}



//parsing for inputting file. see more in the future?
function parseToSmiles(raw: string): string[] {
  const t = raw;
  if (!t) return [];


  const maybeCsv = t.includes("\n") && t.includes(",");
  if (maybeCsv) {
    const lines = t.split("\n").filter(Boolean);
    const header = lines[0].split(",").map(s => s.trim().toLowerCase());
    //assumption there is smiles.
    let idx = header.indexOf("smiles");
    //idx maybe make changeable later
    if (idx === -1) idx = 0;

    const values = lines.slice(1).map(line => {
      const cols = line.split(",");
      return (cols[idx] || "").trim();
    });
    return values.filter(Boolean);
  }

  //newline, comma, semicolo, space, tab
  return t.split(/[\n,; \t]+/).map(s => s.trim()).filter(Boolean);
}

//data for hist/box
const unit1 = {
  mwt:  { label: "MWT",  unit: "Da" },
  logp: { label: "LogP", unit: ""   },
  hbd:  { label: "HBD",  unit: "count" },
  hba:  { label: "HBA",  unit: "count" },
} as const;
function format1(num: number | undefined | null, dec = 3) {
  if (num == null || Number.isNaN(num)) return "-";

  return Number(num).toFixed(dec);
}









function App() {
  
  const [smiles, setSmiles] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Ro5Item[]>([]);
  const [summary, setSummary] = useState<Ro5Summary | null>(null);
  const [download, setDownload] = useState<DownloadPayload | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  //t.2
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [showAll, setShowAll] = useState(false);

  //for Returning the data in a table
  const total1 = data.length;
  const totalPages = Math.ceil(total1 / pageSize);
  const start1 = (page - 1) * pageSize;
  const end1 = start1 + pageSize;
  const visible = showAll ? data : data.slice(start1, end1);

  


  //!!!
  const submit = async(e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setData([]);
    setSummary(null);
    setLoading(true);
    setDownload(null);
    setNote(null);


    //SENDing
    try {
      //const smilesArray = smiles.split(",").map(s => s.trim());
      //newline, comma, semicolon
      const smilesArray = smiles.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);

      const res = await api.post("/ro5", { smiles: smilesArray, vmax: 1 });

      //setting!!!!!!
      setData(res.data.items);
      setSummary(res.data.summary);
      setDownload(res.data.download ?? null);
      setNote(res.data.note ?? null);

      setPage(1);
      setShowAll(false);

      

    }
    catch (err: any) {
      if(err?.response?.status === 413) {
        console.error("Input too large.");
        setError("Input too large.");
      }
      console.error("Error details:", err);
      setError(err?.response?.data || err.message);
    }
    finally {
      setLoading(false);
    }
  }


  return (
    <>
    <header style={{ maxWidth: 760, margin: "16px auto 0", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => setShowHelp(true)} style={{ padding: "8px 12px", borderRadius: 8 }}>
          Help
        </button>
      </div>
    </header>


    <main style={{ maxWidth: 760, margin: " 40px auto", padding: 16}}>
      <h1 style={{ marginBottom: 20 }}>Lipinski Rule of 5</h1>


      <form onSubmit={submit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>

        {/* testing the file input and clear!!!  */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              const parsed = parseToSmiles(text);
              setSmiles(parsed.join("\n"));
              setPage(1);
              setShowAll(false);
            }}
          />
          
        </div>


        <textarea
          value={smiles}
          onChange={(e) => setSmiles(e.target.value)}
          placeholder="Enter SMILES (need to be seperated by: comma, newline, semicolon)"
          rows={3}
          style={{ flex: 1, padding: 8, fontSize:14, borderRadius: 10, border: "1px solid #ccc", resize:"vertical", lineHeight: 1}}
          required/>
        <button
          type="submit"
          disabled={!smiles || loading}
          style={{ padding: "10px 16px", borderRadius: 8 }}>
          {loading ? "Computing..." : "Compute"}
        </button>
        <button type="button" onClick={() => setSmiles("")}>Clear</button>
      </form>


      {error ? <div style={{ color: "crimson" }}>{error}</div> : null}


      
      {data.length > 0 ? (
        <div style={{ border: "1px solid #eee", borderRadius: 30, padding:25 }}>
          <h2 style={{ marginTop: 0 }}>Results</h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["SMILES","MWT","LogP","HBD","HBA","Violations","Passes","VMAX","MWT_violation","HBD_violation","HBA_violation","LOGP_violation"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #eeeeee73" }}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>

              {visible.map((item, i) => (
                <tr key={`${item.smiles}-${start1+i}`}>

                  <td style={{ padding: "10px", borderBottom: "1px solid #f4f4f4" }}>{item.smiles}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f4f4f4" }}>{item.mwt}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f4f4f4" }}>{item.logp}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f4f4f4" }}>{item.hbd}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f4f4f4" }}>{item.hba}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f4f4f4" }}>{item.violations}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f4f4f4" }}>{item.passes_ro5 ? "Yes" : "No"}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f4f4f4" }}>{item.vmax}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f4f4f4" }}>{item.mwt_violation? "Yes" : "No"}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f4f4f4" }}>{item.hbd_violation? "Yes" : "No"}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f4f4f4" }}>{item.hba_violation? "Yes" : "No"}</td>
                  <td style={{ padding: "10px", borderBottom: "1px solid #f4f4f4" }}>{item.logp_violation? "Yes" : "No"}</td>

                </tr>
              ))}

              </tbody>
              </table>
          </div>

          {/* controls */}
          {!showAll && totalPages > 1 && (
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
              <span>Page {page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
              <button onClick={() => setShowAll(true)} style={{ marginLeft: "auto" }}>Show all</button>
            </div>
          )}
          {showAll && (
            <div style={{ marginTop: 12 }}>
              <button onClick={() => { setShowAll(false); setPage(1); }}>Show less</button>
            </div>
          )}


        </div>
      ) : null }

      
      {summary && (
        <div style={{ border: "1px solid #eee", borderRadius: 20, padding: 26, marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Summary (n={summary.mwt.n})</h2>
          <ul style={{ lineHeight: 2 }}>

            <li><b>MWT</b>: mean {summary.mwt.mean ?? "-"}, stdev {summary.mwt.stdev ?? "-"}</li>
            <li><b>LogP</b>: mean {summary.logp.mean ?? "-"}, stdev {summary.logp.stdev ?? "-"}</li>
            <li><b>HBD</b>: mean {summary.hbd.mean ?? "-"}, stdev {summary.hbd.stdev ?? "-"}</li>
            <li><b>HBA</b>: mean {summary.hba.mean ?? "-"}, stdev {summary.hba.stdev ?? "-"}</li>

          </ul>

          <h3 style={{ marginTop: 12 }}>Pass / Fail</h3>
          <ul style={{ lineHeight: 2 }}>

            <li><b>Pass:</b> {summary.pass_fail.pass.count} ({summary.pass_fail.pass.pct}%)</li>
            <li><b>Fail:</b> {summary.pass_fail.fail.count} ({summary.pass_fail.fail.pct}%)</li>

          </ul>

      </div>
    )}

    {summary && (
      <div style={{ marginTop: 16 }}>
        {(["mwt","logp","hbd","hba"] as const).map((k) => {
          const dist = summary.distributions[k];
          const units = unit1[k];
          
          return (
            <div key={k} style={{ marginBottom: 24 }}>
              <MiniHist hist={dist.hist} title={`${units.label} histogram${units.unit ? ` (${units.unit})` : ""}`} unit={units.unit}/>
              <MiniBox box={dist.box} title={`${units.label} boxplot${units.unit ? ` (${units.unit})` : ""}`} unit={units.unit}/>
            </div>
          );
        })}
      </div>
    )}


    {note && <div style={{ marginTop: 12, color: "#6b7280" }}>{note}</div>}
    {download && (
      <button onClick={() => triggerDownload(download)}
              style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8 }}>
        Download results (.csv)
      </button>
    )}



    </main>

    {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

    </>
  );
}



export default App;
