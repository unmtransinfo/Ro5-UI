import type {DownloadPayload } from "../types";


//for download
export function triggerDownload(d: DownloadPayload) {
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