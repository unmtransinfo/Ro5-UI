import React from 'react';

import './App.css';


import {useState} from "react"
import { api } from "./lib/api";
import type { Ro5Item, Ro5Summary } from "./types";


function App() {
  
  const [smiles, setSmiles] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Ro5Item[]>([]);
  const [summary, setSummary] = useState<Ro5Summary | null>(null);


  

  //!!!
  const submit = async(e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setData([]);
    setSummary(null);
    setLoading(true);


    //SENDing
    try {
      const smilesArray = smiles.split(",").map(s => s.trim());
      const res = await api.post("/ro5", { smiles: smilesArray, vmax: 1 });

      //setting
      setData(res.data.items);
      setSummary(res.data.summary);
    }
    catch (err: any) {
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

    </main>
  );
}



export default App;
