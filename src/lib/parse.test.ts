import { describe, it, expect } from "vitest";
import { parseRawToRows } from "./parse";

describe("parseRawToRows", () => {
  it("parses CSV with header and name column", () => {
    const raw = "smiles,name\nCCO,Ethanol\nCO,Methanol\n";
    const { rows } = parseRawToRows(raw, "test.csv", {
      delimiter: "auto",
      hasHeader: true,
      smilesCol: 0,
      nameCol: 1,
      startIndex: 0,
    });
    expect(rows).toEqual([
      { smiles: "CCO", name: "Ethanol" },
      { smiles: "CO", name: "Methanol" },
    ]);
  });
});