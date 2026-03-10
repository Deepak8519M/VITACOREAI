import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let MEDICINE_DATA = [];
let MEDICINE_DATA_LOADED = false;

export function normalize(str = '') {
  return str.toLowerCase().replace(/\s+/g, ' ').trim();
}

function parseCsvLine(line) {
  // Very lightweight CSV splitter: handles simple comma-separated values
  // without embedded commas. For production, replace with a robust CSV parser.
  return line.split(',').map((s) => s.trim());
}

export function loadMedicineData() {
  if (MEDICINE_DATA_LOADED) return;
  MEDICINE_DATA_LOADED = true;

  const csvPath =
    process.env.NPPA_DPCO_CSV_PATH ||
    path.join(__dirname, '..', 'data', 'nppa_dpco_sample.csv');

  if (!fs.existsSync(csvPath)) {
    console.warn(
      '[NPPA] CSV not found at',
      csvPath,
      '- NPPA-based tools will use an empty dataset until you add a CSV.'
    );
    MEDICINE_DATA = [];
    return;
  }

  try {
    const raw = fs.readFileSync(csvPath, 'utf8');
    const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      MEDICINE_DATA = [];
      return;
    }

    const headerColsRaw = parseCsvLine(lines[0]);
    const headerCols = headerColsRaw.map((h) => h.toLowerCase());

    // Try to detect columns both for "friendly" headers and the exact NPPA ones you have.
    let idxGeneric = headerCols.findIndex((h) => h.includes('generic'));
    if (idxGeneric === -1) {
      // Fallback: NPPA header "medicines"
      idxGeneric = headerCols.findIndex((h) => h.includes('medicines'));
    }

    let idxBrand = headerCols.findIndex((h) => h.includes('brand'));
    // It's okay if brand is missing; we'll default it to generic later.

    let idxManufacturer = headerCols.findIndex((h) => h.includes('manufacturer'));

    let idxDosage = headerCols.findIndex((h) => h.includes('dose') || h.includes('strength'));
    if (idxDosage === -1) {
      // Fallback to NPPA-style "dosage form and strength"
      idxDosage = headerCols.findIndex((h) => h.includes('dosage form'));
    }

    let idxPrice = headerCols.findIndex((h) => h.includes('price') || h.includes('mrp'));
    if (idxPrice === -1) {
      // Fallback to NPPA "ceiling price"
      idxPrice = headerCols.findIndex((h) => h.includes('ceiling'));
    }

    MEDICINE_DATA = lines
      .slice(1)
      .map((line) => {
        const cols = parseCsvLine(line);
        const get = (idx) => (idx >= 0 && idx < cols.length ? cols[idx] : '');
        const priceRaw = get(idxPrice);
        const priceNum = priceRaw ? Number(priceRaw) : NaN;

        const generic = get(idxGeneric);
        const brand = idxBrand !== -1 ? get(idxBrand) : generic;
        const manufacturer = idxManufacturer !== -1 ? get(idxManufacturer) : '';
        const dosage = get(idxDosage);

        return {
          generic_name: generic,
          brand_name: brand,
          manufacturer,
          dosage,
          price: Number.isFinite(priceNum) ? priceNum : null,
          source: 'NPPA',
        };
      })
      .filter((m) => m.generic_name && m.price != null);

    console.log('[NPPA] Loaded', MEDICINE_DATA.length, 'rows from CSV');
  } catch (err) {
    console.error('[NPPA] Failed to load CSV', err);
    MEDICINE_DATA = [];
  }
}

export function getMedicineData() {
  return MEDICINE_DATA;
}

export function resolveGeneric(query) {
  const q = normalize(query);

  if (!MEDICINE_DATA_LOADED) loadMedicineData();
  const generics = Array.from(new Set(MEDICINE_DATA.map((m) => normalize(m.generic_name))));

  for (const g of generics) {
    if (g && q.includes(g)) return g;
  }

  for (const m of MEDICINE_DATA) {
    const brand = normalize(m.brand_name);
    if (brand && q.includes(brand)) return normalize(m.generic_name);
  }

  return null;
}

