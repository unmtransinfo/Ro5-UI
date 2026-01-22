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

export function parseRawToRows(raw: string, filename: string | undefined, o: ParseOptions): { rows: Row[], header?: string[] } {
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