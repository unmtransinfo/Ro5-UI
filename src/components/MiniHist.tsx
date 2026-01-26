import { format1 } from "../lib/format";
import type { Hist} from "../types";



//helper function for box/histogram
export function MiniHist({ hist, title, unit }: { hist: Hist; title:string; unit?:string }) {
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
