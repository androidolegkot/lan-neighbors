import fs from "node:fs/promises";
import path from "node:path";
const file=path.resolve("config/oui.txt");
let db=new Map(),loaded=false;
function parse(text){const m=new Map();for(const line of text.split(/\r?\n/)){const x=line.match(/^\s*([0-9A-F]{6})\s+\(hex\)\s+(.+?)\s*$/i);if(x)m.set(x[1].toUpperCase(),x[2].trim())}return m}
export async function loadVendorDatabase(){if(loaded)return;try{db=parse(await fs.readFile(file,"utf8"))}catch{try{const r=await fetch("https://standards-oui.ieee.org/oui/oui.txt",{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error("HTTP "+r.status);const s=await r.text();await fs.writeFile(file,s);db=parse(s)}catch(e){console.warn("IEEE OUI database unavailable:",e.message)}}loaded=true}
export function vendorFor(mac){const k=String(mac||"").replace(/[^0-9a-f]/gi,"").slice(0,6).toUpperCase();return db.get(k)||""}