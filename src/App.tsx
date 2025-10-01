import React from 'react';

import './App.css';


import {useState} from "react"
import { api } from "./lib/api";
import type { Ro5Item, Ro5Summary, Hist, Box, DownloadPayload } from "./types";


//helper function for box/histogram
function MiniHist({ hist }: { hist: Hist }) {
  const max = Math.max(1, ...hist.counts);


  return (
    <div style={{ display: "flex", gap: 2, height: 60, alignItems: "flex-end", marginTop: 8 }}>

      {hist.counts.map((c, i) => (
        <div key={i} 
            title={`${hist.bins[i]}-${hist.bins[i+1]}: ${c}`}
            //height is c/max*60 because 60 is tallest bar
            style={{ width: 6, height: `${(c/max)*60}px`, background: "#7aa6ff", borderRadius: 2 }} 
        />
      ))}

    </div>
  );
}

function MiniBox({ box }: { box: Box }) {
  if (box.min == null) return null;
  const W = 260;

  //scale for numbers.
  const scale = (x:number)=> ((x - (box.min as number)) / ((box.max as number)-(box.min as number))) * W;
  const q1 = scale(box.q1 as number), q3 = scale(box.q3 as number), med = scale(box.median as number);


  return (
    <div style={{ position:"relative", width: W, height: 28, background:"#eef2ff", borderRadius:4, marginTop:8 }}>

      {/* whiskers */}
      <div style={{ position:"absolute", left:0, top:13, width:W, height:2, background:"#c7d2fe" }}/>
      {/* box */}
      <div style={{ position:"absolute", left:q1, top:6, width: Math.max(2, q3-q1), height:16, background:"#93c5fd", borderRadius:4 }}/>
      {/* median */}
      <div style={{ position:"absolute", left:med, top:4, width:2, height:20, background:"#1e3a8a" }}/>
    
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



function App() {
  
  const [smiles, setSmiles] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Ro5Item[]>([]);
  const [summary, setSummary] = useState<Ro5Summary | null>(null);
  const [download, setDownload] = useState<DownloadPayload | null>(null);
  const [note, setNote] = useState<string | null>(null);


  

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
      const smilesArray = smiles.split(",").map(s => s.trim());
      const res = await api.post("/ro5", { smiles: smilesArray, vmax: 1 });

      //setting!!!!!!
      setData(res.data.items);
      setSummary(res.data.summary);
      setDownload(res.data.download ?? null);
      setNote(res.data.note ?? null);
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
    <main style={{ maxWidth: 760, margin: " 40px auto", padding: 16}}>
      <h1 style={{ marginBottom: 20 }}>Lipinski Rule of 5</h1>


      <form onSubmit={submit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={smiles}
          onChange={(e) => setSmiles(e.target.value)}
          placeholder="Enter SMILES (e.g., CCO)"
          style={{ flex: 1, padding: 10, borderRadius: 20, border: "1px solid #ccc" }}
          required/>
        <button
          type="submit"
          disabled={!smiles || loading}
          style={{ padding: "10px 16px", borderRadius: 8 }}>
          {loading ? "Computing..." : "Compute"}
        </button>
      </form>


      {error ? <div style={{ color: "crimson" }}>{error}</div> : null}



      
      {data.length > 0 ? (
        <div style={{ border: "1px solid #eee", borderRadius: 20, padding: 26 }}>
          <h2 style={{ marginTop: 0 }}>Results</h2>
          {data.map((item, i) => (
            <ul key={i} style={{ lineHeight: 2 }}>

              <li><b>SMILES:</b> {item.smiles}</li>
              <li><b>MWT:</b> {item.mwt}</li>
              <li><b>LogP:</b> {item.logp}</li>
              <li><b>HBD:</b> {item.hbd}</li>
              <li><b>HBA:</b> {item.hba}</li>
              <li><b>Violations:</b> {item.violations}</li>
              <li><b>Passes Ro5:</b> {item.passes_ro5 ? "Yes" : "No"}</li>
              <li><b>Vmax:</b> {item.vmax}</li>
              <li><b>MWT violation:</b> {item.mwt_violation? "Yes" : "No"}</li>
              <li><b>HBD violation:</b> {item.hbd_violation? "Yes" : "No"}</li>
              <li><b>HBA violation:</b> {item.hba_violation? "Yes" : "No"}</li>
              <li><b>LOGP violation:</b> {item.logp_violation? "Yes" : "No"}</li>

            </ul>
          ))}
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
          
          return (
            <div key={k} style={{ marginBottom: 24 }}>

              <h3 style={{ margin: "12px 0 4px" }}>{k.toUpperCase()} distribution</h3>
              <MiniHist hist={dist.hist} />
              <MiniBox box={dist.box} />

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
  );
}



export default App;
