import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const cacheDir = path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache"), "ip-neighbors");
const cacheFile = path.join(cacheDir, "oui.txt");
let db = new Map();
let loaded = false;

// IEEE oui.txt prefixes are written as "FC-D7-49 (hex) Vendor Name".
function parse(text) {
  const result = new Map();
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([0-9A-F]{2}(?:-[0-9A-F]{2}){2})\s+\(hex\)\s+(.+?)\s*$/i);
    if (match) result.set(match[1].replace(/-/g, "").toUpperCase(), match[2].trim());
  }
  return result;
}

export async function loadVendorDatabase() {
  if (loaded) return;
  try {
    let text;
    try {
      text = await fs.readFile(cacheFile, "utf8");
    } catch {
      // Migrate the cache created by earlier versions, if present.
      try { text = await fs.readFile(path.resolve("config/oui.txt"), "utf8"); } catch {}
    }
    if (text) db = parse(text);
    if (db.size === 0) {
      const response = await fetch("https://standards-oui.ieee.org/oui/oui.txt", {
        signal: AbortSignal.timeout(20000)
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      text = await response.text();
      db = parse(text);
      if (db.size === 0) throw new Error("Downloaded IEEE database contained no recognized OUI entries.");
      try {
        await fs.mkdir(cacheDir, { recursive: true });
        await fs.writeFile(cacheFile, text);
      } catch (error) {
        console.warn("Could not cache IEEE OUI database:", error.message);
      }
    } else {
      try {
        await fs.mkdir(cacheDir, { recursive: true });
        await fs.writeFile(cacheFile, text);
      } catch {}
    }
    console.log("Loaded " + db.size + " IEEE MAC vendor entries.");
  } catch (error) {
    console.warn("IEEE MAC vendor database unavailable:", error.message);
  }
  loaded = true;
}

export function vendorFor(mac) {
  const prefix = String(mac || "").replace(/[^0-9a-f]/gi, "").slice(0, 6).toUpperCase();
  return db.get(prefix) || "";
}