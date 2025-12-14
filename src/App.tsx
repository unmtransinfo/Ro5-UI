import React from 'react';

import './App.css';


import {useState} from "react"
import { api } from "./lib/api";
import type { Ro5Item, Ro5Summary, Hist, Box, DownloadPayload } from "./types";


//helper function for box/histogram
function MiniHist({ hist, title, unit }: { hist: Hist; title:string; unit?:string }) {
  if(!hist?.counts?.length) return null;

  //W is chart width and H is bar max height, others should make sense
  const W = 360;
  const H = 120;
  const max = Math.max(1, ...hist.counts);
  const bins = hist.bins;
  const xMin = bins[0];
  const xMax = bins[bins.length -1]
  const xMid = bins[Math.floor(bins.length / 2)];

  //compute how wide each bar should be. W substract the space needed for gaps(4px per bar) and whateever is left we div equally by # of bars. 
  const barWidth = Math.max(6, (W - 4 * hist.counts.length) / hist.counts.length);


  return (
    <div style={{ width: "100%", maxWidth: W, marginTop: 4 }}>

      {/* title */}
      <div style={{ fontSize: 13, fontWeight: 500, color: "#eef2ff", marginBottom: 4 }}>
        {title}
      </div>


      {/* bars ; c=counts for that bin,i=index for bin. (not sure what i did here before when starting but recheck maybe next time)*/}
      <div
        style={{
          display: "flex",
          gap: 4,
          alignItems: "flex-end",
          height: H,
          marginTop: 4,
          padding: "8px 8px 4px",
          borderRadius: 12,
          background: "linear-gradient(135deg, #eef2ff, #f9fafb)",
        }}
      >
        {hist.counts.map((c, i) => (
          <div
            key={i}
            title={`${format1(bins[i])} - ${format1(bins[i + 1])}${unit ? " " + unit : ""}: ${c}`}
            style={{
              width: barWidth, //explanatory
              height: `${(c / max) * (H - 20)}px`, //bar height scaled to its count relative to the max
              borderRadius: 999,
              background: "linear-gradient(180deg, #6366f1, #3b82f6)", //smooth blue top to bottom color

              transition: "transform 0.35s ease-out, box-shadow 0.35s ease-out",//anim(for below:)
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.15)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(37,99,235,0.1)";
            }}
          />
        ))}
      </div>

      {/* x-axis */}
      <div style={{ position: "relative", height: 32, marginTop: 6 }}>
        
        {/*a line*/}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 1,
            background: "#e5e7eb",
          }}
        />

        <div style={{ position: "absolute", top: 6,left: 0, fontSize: 11,color: "#c6cedbff" }}>
          {format1(xMin)}
        </div>
        <div style={{position: "absolute",top: 6,left: "50%",transform: "translateX(-50%)",fontSize: 11,color: "#c6cedbff",}}>
          {format1(xMid)}
        </div>
        <div style={{ position: "absolute", top: 6, right: 0, fontSize: 11,color: "#c6cedbff" }}>
          {format1(xMax)}
        </div>

        <div style={{position: "absolute", bottom: 0, left: "50%",transform: "translateX(-50%)",fontSize: 11,color: "#c6cedbff",}}>
          {unit ? `Value (${unit})` : "Value"}
        </div>

      </div>

      {/* y-axis  */}
      <div style={{ fontSize: 11, color: "#c6cedbff", marginTop: 2 }}>
        Max count (inside a bar): {max}
      </div>

    </div>
  );
}

function MiniBox({ box, title, unit }: { box: Box; title:string; unit?:string }) {
  if (box.min == null) return null;


  const W = 360;
  const OUTER_W = 360;
  const PADDING_X = 10;
  //fixing issue where box can go more than box.max
  const INNER_W = OUTER_W - 2 * PADDING_X;
  const H = 90;

  //scale for numbers.
  const scale = (x:number)=> ((x - (box.min as number)) / ((box.max as number)-(box.min as number) || 1)) * INNER_W;
  const q1 = scale(box.q1 as number), q3 = scale(box.q3 as number), med = scale(box.median as number);

  

  return (

    <div style={{ width: "100%", maxWidth: W, marginTop: 12 }}>

      {/* title */}
      <div style={{ fontSize: 13, fontWeight: 500, color: "#eef2ff", marginBottom: 4 }}>{title}</div>



      {/* plot, adding 10 from the left for offset, the variables are not fixed. min and max are always on the edge because our x axis is like that.*/}
      <div style={{position: "relative",width: "100%",height: H,borderRadius: 12,background: "linear-gradient(135deg, #eff6ff, #f9fafb)",padding: "12px 0px",}}>

        {/* whisker line */}
        <div style={{position: "absolute",left: PADDING_X,right: PADDING_X,top: H / 2 - 1,height: 2,background: "#c7d2fe",}}/>
        {/* box */}
        <div style={{position: "absolute",left: PADDING_X + q1,top: 12,width: Math.max(4, q3 - q1),height: H - 24,borderRadius: 6,background: "rgba(79, 70, 229, 0.18)",border: "1px solid #4f46e5",}}/>
        {/* median */}
        <div style={{ position:"absolute", left:PADDING_X+med, top:12, width:3, height:H-22, background:"#1e3a8a", borderRadius:999 }}
             title={`median: ${format1(box.median)}${unit ? " " + unit : ""}`}/>
        {/* min/max tickers */}
        <div title={`min: ${format1(box.min)}${unit ? " " + unit : ""}`} style={{
          position: "absolute", left: PADDING_X, top: H/2 - 8, width: 2, height: 16, background:"#1e3a8a", borderRadius:999,
        }}/>
        <div title={`max: ${format1(box.max)}${unit ? " " + unit : ""}`} style={{
          position: "absolute", right: PADDING_X, top: H/2 -8, width: 2, height: 16, background:"#1e3a8a", borderRadius:999,
        }}/>
      </div>



      {/* x-axis with labels */}
      <div style={{ position: "relative", height: 32, marginTop: 6 }}>
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
          <li>Paste SMILES or <b>Upload</b> a file (.csv, .tsv, .txt, .smi, .smiles).</li>
          <li>Click <b>Options</b> to configure: <i>Delimiter</i>, <i>Header present</i>, <i>SMILES col</i>, <i>Name col</i>.</li>
          <li>Click <b>Re-parse</b> to clean the input (shows <code>"SMILES Name"</code> view).</li>
          <li>Click <b>Compute</b> to get per-compound results + summary stats/plots. Use <b>Download</b> for downloading the set.</li>
        </ol>
        <h4>Supported Formats</h4>
        <ul style={{textAlign:"left"}}>
          <li><b>CSV</b> (comma), <b>TSV</b> (tab), <b>TXT</b> (space/tab/comma), <b>SMI/SMILES</b> (one per line; optional name).</li>
          <li>Headers are auto-detected. Common SMILES headers (case-insensitive): <code>smiles</code>, <code>molSmiles</code>, <code>Kekule_SMILES</code>, <code>canonical_smiles</code>.</li>
          <li>No header? Web app assume first column = SMILES. For space-delimited lines: <code>SMILES NAME</code>.</li>
        </ul>
    

        <h3>Input Limits</h3>
        <ul style={{textAlign: "left"}}>
          <li>&lt; 1500 compounds - full results + summary shown on page + CSV download.</li>
          <li>&gt; 1500 compounds - request rejected (too large).</li>
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



//CONFIGURABLE OPTIONS
type Delim = 'auto' | 'comma' | 'tab' | 'space';
type Row = { smiles: string; name?: string };
type ParseOptions = { 
  delimiter: Delim; 
  hasHeader: boolean; 
  smilesCol: number; 
  nameCol?: number;
  startIndex: number;
  nMolecules?: number;
};

const SMILES_HEADERS = [
  'smiles','molsmiles','kekule_smiles','canonical_smiles','can_smiles','mol_smiles','kekule_smiles'
];

//helper functions
function detectDelimiter(filename?: string, text?: string): Exclude<Delim,'auto'> {
  const lower = (filename || '').toLowerCase();
  if (lower.endsWith('.tsv')) return 'tab';
  if (lower.endsWith('.csv')) return 'comma';
  if (lower.endsWith('.smi') || lower.endsWith('.smiles')) return 'space';
  if (text && /\t/.test(text)) return 'tab';
  if (text && /,/.test(text)) return 'comma';
  return 'space';
}
function splitByDelim(line: string, d: Exclude<Delim,'auto'>): string[] {
  if (d === 'tab') return line.split('\t');
  if (d === 'comma') return line.split(',');
  // space:collapse multiple spaces/tabs
  return line.trim().split(/\s+/);
}
function guessCols(header: string[]) {
  const lower = header.map(h => h.toLowerCase());
  const smilesIdx = lower.findIndex(h => SMILES_HEADERS.includes(h));
  //put in headers if gets longer
  const nameIdx = lower.findIndex(h => ['name','id','idnumber','compound','title','molecule','mol','cid'].includes(h));
  return { smilesCol: smilesIdx === -1 ? 0 : smilesIdx, nameCol: nameIdx === -1 ? undefined : nameIdx };
}
function formatRowsAsTwoCols(r: Row[], includeHeader = true, sep = '\t'): string {
  const lines = r.map(x => [x.smiles ?? '', x.name ?? ''].join(sep));
  return (includeHeader ? `SMILES${sep}Name\n` : '') + lines.join('\n');
}

function parseRawToRows(raw: string, filename: string | undefined, o: ParseOptions): { rows: Row[], header?: string[] } {
  //
  const d = o.delimiter === 'auto' ? detectDelimiter(filename, raw) : o.delimiter;
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean).filter(l => !l.startsWith('#'));


  if (lines.length === 0) return { rows: [] };


  let header: string[] | undefined;
  let smilesCol = o.smilesCol ?? 0;
  let nameCol = o.nameCol;

  if (o.hasHeader) {
    header = splitByDelim(lines[0], d);
    const g = guessCols(header);
    smilesCol = (Number.isFinite(smilesCol) ? smilesCol : g.smilesCol);
    nameCol = (nameCol !== undefined ? nameCol : g.nameCol);
  }

  const body = o.hasHeader ? lines.slice(1) : lines;


  //if no header and delimiter is space, assume "SMILES NAME".....(name = second token)
  const defaultNameColNoHeader = d === 'space' ? 1 : (nameCol ?? 1);

  const parsed: Row[] = body.map(line => {
    const cols = splitByDelim(line, d);
    const sIdx = Math.max(0, smilesCol ?? 0);
    const nIdx = (nameCol !== undefined ? nameCol : defaultNameColNoHeader);


    const smiles = (cols[sIdx] || '').trim();
    let name: string | undefined = undefined;

    if (Number.isFinite(nIdx) && nIdx! >= 0 && nIdx! < cols.length) {
      name = (cols[nIdx!] || '').trim();
    }
    return { smiles, name };
  }).filter(r => !!r.smiles);


  return { rows: parsed, header };
}


/*
//parsing for inputting file.
function parseToSmiles(raw: string, filename?: string): string[] {
  const t = raw ?? "";
  if (!t.trim()) return [];


  const isCsvExt = filename?.toLocaleLowerCase().endsWith(".csv");
  const isSmiExt = filename?.toLocaleLowerCase().endsWith(".smi");


  const maybeCsv = isCsvExt || (t.includes("\n") && t.includes(","));
  //CSV (header optional)
  if (maybeCsv) {
    const lines = t.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return [];

    const header = lines[0].split(",").map(s => s.trim().toLowerCase());
    //assumption there is smiles.
    let idx = header.indexOf("smiles");
    //idx maybe make changeable later
    if (idx === -1) idx = 0;


    //if has header dont want to skip the top
    const hasHeader = header.includes("smiles");
    const dataLines = hasHeader ? lines.slice(1) : lines;


    const values = dataLines.map(line => {
      const cols = line.split(",");
      return (cols[idx] || "").trim();
    });
    return values.filter(Boolean);
  }

  // SMI or TXT
  // .smi: "SMILES" NAME" 
  // .txt fallback to first token per line
  const lines = t.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const smiles = lines.filter(l => !l.startsWith("#")).map(l => {
      //take first token (space/tab separated)
      const first = l.split(/\s+/)[0];
      return (first || "").trim();
    }).filter(Boolean);

  //if user pasted all in one line separated by newl/commas/semicolons/space/tab,split
  //mainly txt
  if (smiles.length <= 1 && !isSmiExt) {
    return t.split(/[\n,; \t]+/).map(s => s.trim()).filter(Boolean);
  }

  return smiles;

  //newline, comma, semicolo, space, tab
  //return t.split(/[\n,; \t]+/).map(s => s.trim()).filter(Boolean);
}*/

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

  //configurable options
  const [showConfig, setShowConfig] = useState(false);
  const [opts, setOpts] = useState<ParseOptions>({ 
    delimiter: 'auto', 
    hasHeader: true, 
    smilesCol: 0, 
    nameCol: 1,
    startIndex: 0,
    nMolecules: undefined,
   });
  const [rows, setRows] = useState<Row[]>([]);
  const [rawFileText, setRawFileText] = useState<string>('');
  const [fileName, setFileName] = useState<string | undefined>(undefined);

  //choose file more nicer
  const [dragOver, setDragOver] = useState(false);

  //animation for table
  const [resultsKey, setResultsKey] = useState(0);



  //reusable func for uploading file
  async function handleFile(file: File) {
    //5MB file upload limit:
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setError(`File is too large (${sizeMb} MB). Maximum allowed is 5 MB.`);
      alert("File is too large. Maximum allowed size is 5 MB.");
      return;
    }


    const text = await file.text();

    setFileName(file.name);
    setRawFileText(text);
    setSmiles(text);
    setRows([]);
    setPage(1);
    setShowAll(false);


    //defaulting
    const d = detectDelimiter(file.name, text);
    const first = (text.split(/\r?\n/)[0] || '').trim();
    const headerTokens = splitByDelim(first, d).map(s => s.toLowerCase());
    const hasHeader = headerTokens.some(t => SMILES_HEADERS.includes(t)) || headerTokens.includes('name');

    setOpts(o => ({
      ...o,
      delimiter: 'auto', //we detect it on re-parse
      hasHeader,
      smilesCol: 0,
      nameCol: 1,

      startIndex: o.startIndex ?? 0,
      nMolecules: o.nMolecules,
    }));
  }
  function clearFile() {
    setFileName(undefined);
    setRawFileText('');
    setSmiles('');
    setRows([]);
  }







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
      const effectiveDelim = opts.delimiter === 'auto' ? detectDelimiter(fileName, rawFileText || smiles) : opts.delimiter;
      const prepared = rows.length? rows : parseRawToRows(smiles, fileName, { ...opts, delimiter: effectiveDelim }).rows;


      const smilesArray = prepared.map(r => r.smiles).filter(Boolean);
      const namesArray = prepared.map(r => r.name ?? "");

      
      //API REQUEST!!!!
      const res = await api.post("/ro5", { 
        smiles: smilesArray, 
        names: namesArray,
        vmax: 1 });


      //setting!!!!!!
      setData(res.data.items);
      setSummary(res.data.summary);
      setDownload(res.data.download ?? null);
      setNote(res.data.note ?? null);

      setPage(1);
      setShowAll(false);

      //replay animation and
      setResultsKey(k => k + 1);

    }
    catch (err: any) {

      const status = err?.response?.status;
      const data = err?.response?.data;
      let msg = 'Something went wrong.';

      if (status === 413) {
        msg = typeof data === 'string'
          ? data
          : (data?.error ?? 'Input too large.');
      }
      else if (typeof data === 'string') {
        msg = data;
      }
      else if (data?.error) {
        msg = data.error;
      }
      else if (err?.message) {
        msg = err.message;
      }

      console.error('Error details:', err);
      setError(msg);
    }
    finally {
      setLoading(false);
    }
  }


  return (
    <>
    <header style={{ padding: "16px 32px",borderBottom: "1px solid #333",marginBottom: 0 }}>

      <div style={{ maxWidth: "1400px", margin: "0 auto",display: "flex", justifyContent: "space-between",alignItems: "center" }}>
        
        <h1 style={{ margin: 0, fontSize: "42px",flex:1, textAlign:"center" }}>Lipinski Ro5 Analyzer</h1>
        
        <div style={{ display: "flex", gap: 8,marginLeft:"auto", right:"32px" }}>
          <button
            onClick={() => {
              const demoRows: Row[] = [
                { smiles: "C(C(=O)O)N", name: "mol1" },
                { smiles: "OC(=O)C(O)C(O)C(=O)[O-]", name: "mol2" },
                { smiles: "[nH+]1c(nc(c2c1nc(c(n2)C)C)N)N", name: "mol3" },
                { smiles: "C(=O)(C(CCC[NH+]=C(N)N)N)[O-]", name: "mol4" },
                { smiles: "O=C([O-])C(=O)[O-]", name: "mol5" },
                { smiles: "Brc1ccc(cc1)S(=O)(=O)NC2C(=O)SC2", name: "mol6" },
              ];
              setOpts({delimiter: 'tab', hasHeader:true, smilesCol:0, nameCol:1,startIndex: 0,nMolecules: undefined});
              setRows(demoRows);
              setSmiles(formatRowsAsTwoCols(demoRows, true, '\t'));
              setPage(1);
              setShowAll(false);
            }}
            style={{ padding: "8px 12px", borderRadius: 8 }}>
            Demo
          </button>


          <button onClick={() => setShowHelp(true)} style={{ padding: "8px 12px", borderRadius: 8 }}>
            Help
          </button>

          <button
            onClick={() => window.location.reload()}
            title="Reset">
            Reset
          </button>
        </div>
      </div>
    </header>


    <main style={{ maxWidth: "1400px",margin: "0 auto",padding: "32px"}}>
      
      


      {/* file input logic (drag logic and choose button logic) */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={async (e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) await handleFile(f);

            }}

            style={{
              border: dragOver ? "2px solid #4941e8ff" : "1px dashed #ddd",
              borderRadius: 10,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              justifyContent: "center",
              background: dragOver ? "rgba(79,70,229,0.05)" : "transparent",
              marginBottom: 16,
              maxWidth: "600px",
              margin: "0 auto 16px"
            }}
          >

            

              <span style={{ fontSize: 14, color: "#555" }}>
                Drag & drop a file here, or
              </span>

              {/*hidden input and styled label as button */}
              <input
                id="file-input"
                type="file"
                accept=".csv,.tsv,.txt,.smi,.smiles"
                style={{ display: "none" }}
                
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await handleFile(file);

                  //this allows re-selecting the same file. 
                  e.currentTarget.value = "";
                }}
              />

              <label
                htmlFor="file-input" //future note; similar like "for" in HTML but its React equivalent

                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  background: "#4f46e5",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14
                }}>
                Choose File
              </label>

              <span style={{ fontSize: 13, color: "#646464ff" }}>
                Supported: .csv, .tsv, .txt, .smi, .smiles
              </span>
            

            {/*Showing filename if there is */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {fileName && (
                <span style={{
                  fontSize: 13,
                  color: "#333",
                  background: "#f6f7fb",
                  padding: "4px 10px",
                  borderRadius: 8,
                  border: "1px solid #eee",
                  maxWidth: 200,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {fileName}
                </span>
              )}
              {fileName && (
                <button
                  type="button"
                  onClick={clearFile}

                  style={{
                    padding: "4px 8px",
                    borderRadius: 8,
                    border: "1px solid #000000ff",
                    color:"#333",
                    background: "white",
                    cursor: "pointer",
                    fontSize: 12
                  }}
                  title="Clear file">
                  x
                </button>
              )}

            </div>
          </div>
        </div>

      <form onSubmit={submit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>

        <textarea
          value={smiles}
          onChange={(e) => setSmiles(e.target.value)}
          placeholder="Enter SMILES"
          rows={5}
          style={{ flex: 1, padding: "10px 12px", fontSize:14, borderRadius: 10, border: "1px solid #ccc", resize:"both", lineHeight: 1, minHeight:"40px"}}
          required/>
        <button
          type="submit"
          disabled={!smiles || loading}
          className="btn-primary1"
          style={{ padding: "10px 16px", borderRadius: 8 }}>
          {loading ? "Computing..." : "Compute"}
        </button>
        <button type="button" onClick={() => setSmiles("")}>Clear</button>
      </form>




      {/* EXPANDABLE CONFIGURABLE OPTIONs */}
      <button onClick={() => setShowConfig(s => !s)} style={{ padding: 8, borderRadius: 24 }}>
        {showConfig ? "Hide Configurable Options" : "Configurable Options (for uploaded files)"}
      </button>

      {showConfig && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 12}}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8, alignItems: "center",justifyContent: "center" }}>
            
            <label>Delimiter: <br/>
                <select
                  value={opts.delimiter}
                  onChange={e => setOpts({ ...opts, delimiter: e.target.value as Delim })}>
                <option value="auto">Auto</option>
                <option value="comma">Comma (,)</option>
                <option value="tab">Tab (\t)</option>
                <option value="space">Space</option>
              </select>
            </label>
            
            
            <label style={{ marginLeft: 12 }}>
              <input
                type="checkbox"
                checked={opts.hasHeader}
                onChange={e => setOpts({ ...opts, hasHeader: e.target.checked })}/> 
                Header present <br/>
            </label>
          
            <label style={{ marginLeft: 12 }}>
              SMILES col (0-based):
              <input
                type="number"
                min={0}
                value={opts.smilesCol}
                onChange={e => setOpts({ ...opts, smilesCol: Number(e.target.value) })}
                style={{ width: 70 }}
              />
            </label>

            <label style={{ marginLeft: 12 }}>
              Name col (0-based, optional):
              <input
                type="number"
                min={0}
                value={opts.nameCol ?? ""}
                onChange={e => setOpts({ ...opts, nameCol: e.target.value === "" ? undefined : Number(e.target.value) })}
                style={{ width: 70 }}
              />
            </label>



            <label style={{ marginLeft: 12 }}>
              Start index (0-based):
              <input
                type="number"
                min={0}
                value={opts.startIndex}
                onChange={(e) =>
                  setOpts({
                    ...opts,
                    startIndex: Number(e.target.value) || 0,
                  })
                }
                style={{ width: 90 }}
              />
            </label>

            <label style={{ marginLeft: 12 }}>
              N. molecules (optional):
              <input
                type="number"
                min={1}
                value={opts.nMolecules ?? ""}
                onChange={(e) =>
                  setOpts({
                    ...opts,
                    nMolecules: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
                style={{ width: 90 }}
              />
            </label>

            
            <button
              onClick={() => {
                const effectiveDelim = opts.delimiter === 'auto' ? detectDelimiter(fileName, rawFileText || smiles) : opts.delimiter;
                const { rows: newRows } = parseRawToRows(rawFileText || smiles, fileName, { ...opts, delimiter: effectiveDelim });
                
                
                //Slcing(Start Index + N. Molecules): slice according to Start index + N. molecules
                const start = Math.max(0, opts.startIndex || 0);
                let end = newRows.length;
                if (opts.nMolecules && opts.nMolecules > 0) {
                  end = Math.min(newRows.length, start + opts.nMolecules);
                }
                const sliced1 = newRows.slice(start, end);
                
                
                setRows(sliced1);
                //make clean two-column view in textarea
                setSmiles(formatRowsAsTwoCols(sliced1, true, '\t')); 
                setPage(1);
                setShowAll(false);


                ///RESET slice parameters!
                setOpts(o => ({
                  ...o,
                  startIndex: 0,
                  nMolecules: undefined,
                }));

              }}
              style={{gridColumn: "1 / -1",margin: "0 auto", justifySelf: "center", padding: "8px 12px", borderRadius: 24 }}>
              Re-parse
            </button>
          
          </div>

          <small style={{ color: "#713737ff" }}>
            *Press Re-Parse button to see updated text-area* <br/>
            Re-parse always uses the original uploaded file.
            If a file is uploaded, manual edits in the textarea are ignored during re-parsing.
            <br/>
            Re-parse can be used multiple times.
            It always re-interprets the original uploaded file using the current settings.
          </small>
        </div>
      )}




      {/*If there are any errors this block will trigger */}
      {error ? <div style={{ color: "crimson" }}>{error}</div> : null}




      {/*Main Result logic */}
      {data.length > 0 ? (
        <div id="results" key={resultsKey} className="results-enter" 
            style={{ border: "1px solid #eee", borderRadius: 30, padding:25, marginTop: "30px"}}>
          <h2 style={{ marginTop: 0 }}>Results</h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Name", "SMILES","MWT","LogP","HBD","HBA","Violations","Passes","VMAX","MWT_violation","HBD_violation","HBA_violation","LOGP_violation"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #eeeeee73" }}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>

              {visible.map((item, i) => (
                <tr key={`${item.smiles}-${start1+i}`} 
                    className="tr-enter"
                    style={{ animationDelay: `${i * 35}ms` }}  //stagger
                >

                  <td style={{ padding: "10px", borderBottom: "1px solid #f4f4f4" }}>{item.name ?? ""}</td>
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", /*make as many columns as itll fit the screen. each col must be atleast320px wide but can grow to fill leftover space equally. */
            gap: 24,
          }}
        >

        {(["mwt","logp","hbd","hba"] as const).map((k) => {
          const dist = summary.distributions[k];
          const units = unit1[k];
          const label = `${units.label}${units.unit ? ` (${units.unit})` : ""}`;


          //main hist and boxplot!!!
          return (
          //make boxplot and hist inside a container
          <div
            key={k}
            style={{
              padding: 16,
              borderRadius: 12,
              //background: "#f9fafb",
              
              border: "1px solid #e5e7eb",
            }}
          >

            <div style={{ fontSize: 16, fontWeight: 600, color: "#f3f4f4ff", marginBottom: 4 }}>
              {label}
            </div>

            <div style={{ fontSize: 12, color: "#cacacaff", marginBottom: 12 }}>
              Distribution & Boxplot
            </div>



            <MiniHist
              hist={dist.hist}
              title={`Histogram`}
              unit={units.unit}
            />
            <MiniBox
              box={dist.box}
              title={`Boxplot`}
              unit={units.unit}
            />

          </div>

          );
        })}

        </div>
      </div>
    )}


    {/*Download Logic block */}
    {note && <div style={{ marginTop: 12, color: "#6b7280" }}>{note}</div>}
    {download && (
      <button onClick={() => triggerDownload(download)}
              style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8 }}>
        Download results (.csv)
      </button>
    )}



    </main>


    {/*Help button block logic */}
    {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

    </>
  );
}



export default App;