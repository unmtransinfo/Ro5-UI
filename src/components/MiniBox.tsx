import { format1 } from "../lib/format";
import type { Box } from "../types";


export function MiniBox({ box, title, unit }: { box: Box; title:string; unit?:string }) {
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