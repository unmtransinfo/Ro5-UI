export function format1(num: number | undefined | null, dec = 3) {
  if (num == null || Number.isNaN(num)) return "-";

  return Number(num).toFixed(dec);
}
