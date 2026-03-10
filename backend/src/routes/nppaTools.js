import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { loadMedicineData, getMedicineData, normalize, resolveGeneric } from '../utils/nppaData.js';

const router = express.Router();

// 1) Overcharge detector
// POST /api/nppa/overcharge
// body: { name: string, dosage?: string, paidPerUnit: number, quantity: number }
router.post(
  '/overcharge',
  protect,
  [
    body('name').isString().trim().notEmpty().withMessage('Medicine name is required'),
    body('paidPerUnit').isFloat({ gt: 0 }).withMessage('paidPerUnit must be > 0'),
    body('quantity').isInt({ gt: 0 }).withMessage('quantity must be > 0'),
    body('dosage').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    loadMedicineData();
    const data = getMedicineData();
    if (!data.length) {
      return res.status(500).json({
        error:
          'NPPA dataset is empty. Please configure NPPA_DPCO_CSV_PATH or add a CSV at backend/data/nppa_dpco_sample.csv.',
      });
    }

    const { name, dosage = '', paidPerUnit, quantity } = req.body;
    const q = normalize(name);
    const d = normalize(dosage);

    // Find candidates where brand or generic name matches query
    const candidates = data.filter((m) => {
      const g = normalize(m.generic_name);
      const b = normalize(m.brand_name);
      const dose = normalize(m.dosage || '');
      const nameMatch = q && (b.includes(q) || g.includes(q));
      const doseMatch = d ? dose.includes(d) : true;
      return nameMatch && doseMatch;
    });

    if (!candidates.length) {
      return res.status(404).json({
        error: 'No NPPA entry found matching this name/dosage.',
      });
    }

    // For now, pick the first candidate as reference; in future, you can return all.
    const ref = candidates[0];
    const ceilingPerUnit = ref.price;
    const officialTotal = ceilingPerUnit * quantity;
    const paidTotal = Number(paidPerUnit) * quantity;
    const diff = paidTotal - officialTotal;
    const overchargePct = officialTotal > 0 ? (diff / officialTotal) * 100 : 0;

    res.json({
      reference: {
        generic_name: ref.generic_name,
        brand_name: ref.brand_name,
        dosage: ref.dosage,
        unit_ceiling_price: ref.price,
        source: ref.source,
      },
      input: {
        paid_per_unit: paidPerUnit,
        quantity,
        paid_total: Number(paidTotal.toFixed(2)),
      },
      official_total: Number(officialTotal.toFixed(2)),
      difference: Number(diff.toFixed(2)),
      overcharge_percent: Number(overchargePct.toFixed(2)),
      status:
        diff > 0
          ? 'above_ceiling'
          : diff < 0
          ? 'below_ceiling'
          : 'at_ceiling',
    });
  }
);

// 2) Cheapest dose finder
// GET /api/nppa/cheapest?molecule=atorvastatin
router.get('/cheapest', protect, async (req, res) => {
  loadMedicineData();
  const data = getMedicineData();
  if (!data.length) {
    return res.status(500).json({
      error:
        'NPPA dataset is empty. Please configure NPPA_DPCO_CSV_PATH or add a CSV at backend/data/nppa_dpco_sample.csv.',
    });
  }

  const molecule = (req.query.molecule || '').toString();
  if (!molecule.trim()) {
    return res.status(400).json({ error: 'molecule query parameter is required' });
  }

  const gen = normalize(molecule);
  const matches = data.filter((m) => normalize(m.generic_name).includes(gen));

  if (!matches.length) {
    return res.status(404).json({
      error: 'No entries found in NPPA dataset for this molecule.',
    });
  }

  // Group by dosage/form
  const byDose = new Map();
  for (const m of matches) {
    const key = normalize(m.dosage || 'unit');
    const current = byDose.get(key) || [];
    current.push(m);
    byDose.set(key, current);
  }

  const doseSummaries = Array.from(byDose.entries()).map(([doseKey, items]) => {
    const cheapest = items.reduce((min, it) => (it.price < min.price ? it : min), items[0]);
    return {
      dosage: items[0].dosage || 'unit',
      min_price: cheapest.price,
      example_brand: cheapest.brand_name,
      example_manufacturer: cheapest.manufacturer,
      count: items.length,
    };
  });

  const globalCheapest = doseSummaries.reduce(
    (min, d) => (d.min_price < min.min_price ? d : min),
    doseSummaries[0]
  );

  res.json({
    molecule: molecule,
    generic_matched: matches[0].generic_name,
    doses: doseSummaries.sort((a, b) => a.min_price - b.min_price),
    cheapest: globalCheapest,
  });
});

// 3) Essential medicine basket estimator
// POST /api/nppa/basket
// body: { items: [{ name, dosage?, unitsPerMonth }] }
router.post(
  '/basket',
  protect,
  [
    body('items').isArray({ min: 1 }).withMessage('items array is required'),
    body('items.*.name').isString().trim().notEmpty().withMessage('Each item.name is required'),
    body('items.*.unitsPerMonth').isInt({ gt: 0 }).withMessage('Each item.unitsPerMonth must be > 0'),
    body('items.*.dosage').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    loadMedicineData();
    const data = getMedicineData();
    if (!data.length) {
      return res.status(500).json({
        error:
          'NPPA dataset is empty. Please configure NPPA_DPCO_CSV_PATH or add a CSV at backend/data/nppa_dpco_sample.csv.',
      });
    }

    const { items } = req.body;
    const results = [];
    let totalMonthly = 0;

    for (const item of items) {
      const qName = normalize(item.name);
      const qDose = normalize(item.dosage || '');
      const units = Number(item.unitsPerMonth) || 0;

      const matches = data.filter((m) => {
        const g = normalize(m.generic_name);
        const b = normalize(m.brand_name);
        const d = normalize(m.dosage || '');
        const nameMatch = qName && (g.includes(qName) || b.includes(qName));
        const doseMatch = qDose ? d.includes(qDose) : true;
        return nameMatch && doseMatch;
      });

      if (!matches.length || !units) {
        results.push({
          name: item.name,
          dosage: item.dosage || '',
          unitsPerMonth: units,
          found: false,
          message: 'No NPPA entry found for this item.',
        });
        continue;
      }

      const cheapest = matches.reduce((min, m) => (m.price < min.price ? m : min), matches[0]);
      const monthlyCost = cheapest.price * units;
      totalMonthly += monthlyCost;

      results.push({
        name: item.name,
        dosage: item.dosage || cheapest.dosage,
        unitsPerMonth: units,
        found: true,
        generic_name: cheapest.generic_name,
        brand_example: cheapest.brand_name,
        manufacturer: cheapest.manufacturer,
        unit_ceiling_price: cheapest.price,
        monthly_cost: Number(monthlyCost.toFixed(2)),
      });
    }

    res.json({
      items: results,
      total_monthly_cost: Number(totalMonthly.toFixed(2)),
      total_yearly_cost: Number((totalMonthly * 12).toFixed(2)),
    });
  }
);

export default router;

