import React from 'react';

import './App.css';


import {useState} from "react"
import { api } from "./lib/api";
import type { Ro5Item } from "./types";


function App() {
  
  const [smiles, setSmiles] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Ro5Item[]>([]);



  

  //!!!
  const submit = async(e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setData([]);
    setLoading(true);


    //SENDing
    try {
      //const res = await api.post<Ro5Response>("/ro5", {smiles, vmax: 1});
      const smilesArray = smiles.split(",").map(s => s.trim());
      const res = await api.post("/ro5", { smiles: smilesArray, vmax: 1 });

      setData(res.data.items);
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
            </ul>
          ))}
        </div>
      ) : null }


    </main>
  );
}



export default App;
