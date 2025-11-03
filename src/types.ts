export type Ro5Item = {
  hba: number;
  hbd: number;
  logp: number;
  mwt: number;
  passes_ro5: boolean;
  smiles: string;
  name?: string //name end-to-end feature(can be optional)
  violations: number;
  vmax: number;
  mwt_violation: boolean;
  hbd_violation: boolean;
  hba_violation: boolean;
  logp_violation: boolean;
};

export type DownloadPayload = { 
  filename: string; 
  mime: string; 
  content: string 
};


export type Hist = { 
  bins: number[]; 
  counts: number[];
};
export type Box = { 
  min: number|null;
  q1: number|null;
  median: number|null;
  q3: number|null;
  max: number|null;
};
export type Dist = { 
  hist: Hist;
  box: Box;
};

export type CountPct = { 
  count: number; 
  pct: number | null; 
};
export type Ro5PassFail = { 
  n: number; 
  pass: CountPct; 
  fail: CountPct; 
};

export type Stat = { 
  n: number; 
  mean: number | null; 
  stdev: number | null; 
};
export type Ro5Summary = { 
  mwt: Stat; logp: Stat; hbd: Stat; hba: Stat; 

  pass_fail: Ro5PassFail;

  distributions: { mwt: Dist; logp: Dist; hbd: Dist; hba: Dist };
};

