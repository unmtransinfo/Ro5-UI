

export function HelpModal({ onClose }: { onClose: () => void }) {
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