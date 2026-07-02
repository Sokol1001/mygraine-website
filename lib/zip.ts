// Minimal, dependency-free ZIP writer (STORE method, no compression).
// Enough to bundle a handful of UTF-8 CSV/text files into one downloadable
// archive — static-export safe, no npm dependency.

function makeCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

export interface ZipEntry {
  name: string;
  /** File contents (text). Encoded as UTF-8. */
  data: string;
}

/** Build a valid ZIP archive from text entries. Uncompressed (method 0). */
export function buildZip(entries: ZipEntry[]): Blob {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = enc.encode(entry.name);
    const dataBytes = enc.encode(entry.data);
    const crc = crc32(dataBytes);
    const size = dataBytes.length;

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true); // local file header signature
    local.setUint16(4, 20, true); // version needed to extract
    local.setUint16(6, 0x0800, true); // general purpose flags: UTF-8 filename
    local.setUint16(8, 0, true); // compression method: store
    local.setUint16(10, 0, true); // mod time
    local.setUint16(12, 0, true); // mod date
    local.setUint32(14, crc, true);
    local.setUint32(18, size, true); // compressed size
    local.setUint32(22, size, true); // uncompressed size
    local.setUint16(26, nameBytes.length, true);
    local.setUint16(28, 0, true); // extra field length
    parts.push(new Uint8Array(local.buffer), nameBytes, dataBytes);

    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true); // central dir header signature
    cen.setUint16(4, 20, true); // version made by
    cen.setUint16(6, 20, true); // version needed
    cen.setUint16(8, 0x0800, true); // flags: UTF-8
    cen.setUint16(10, 0, true); // method
    cen.setUint16(12, 0, true); // time
    cen.setUint16(14, 0, true); // date
    cen.setUint32(16, crc, true);
    cen.setUint32(20, size, true);
    cen.setUint32(24, size, true);
    cen.setUint16(28, nameBytes.length, true);
    cen.setUint16(30, 0, true); // extra length
    cen.setUint16(32, 0, true); // comment length
    cen.setUint16(34, 0, true); // disk number start
    cen.setUint16(36, 0, true); // internal attrs
    cen.setUint32(38, 0, true); // external attrs
    cen.setUint32(42, offset, true); // local header offset
    central.push(new Uint8Array(cen.buffer), nameBytes);

    offset += 30 + nameBytes.length + size;
  }

  const centralSize = central.reduce((s, a) => s + a.length, 0);
  const centralOffset = offset;

  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); // end of central dir signature
  end.setUint16(4, 0, true); // disk number
  end.setUint16(6, 0, true); // disk with central dir
  end.setUint16(8, entries.length, true); // entries on this disk
  end.setUint16(10, entries.length, true); // total entries
  end.setUint32(12, centralSize, true);
  end.setUint32(16, centralOffset, true);
  end.setUint16(20, 0, true); // comment length

  const all = [...parts, ...central, new Uint8Array(end.buffer)];
  const totalLen = all.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(totalLen);
  let pos = 0;
  for (const a of all) {
    out.set(a, pos);
    pos += a.length;
  }
  return new Blob([out], { type: "application/zip" });
}
