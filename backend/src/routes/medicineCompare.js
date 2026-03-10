import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { loadMedicineData, getMedicineData, normalize, resolveGeneric } from '../utils/nppaData.js';

const router = express.Router();

// @route   POST /api/medicine/compare
// @body    { query: string, location?: string }
router.post(
  '/compare',
  protect,
  [
    body('query').isString().trim().notEmpty().withMessage('Medicine query is required'),
    body('location').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { query, location = '' } = req.body;

      loadMedicineData();
      const MEDICINE_DATA = getMedicineData();
      if (!MEDICINE_DATA.length) {
        return res.status(500).json({
          error:
            'Medicine dataset is empty. Please configure NPPA_DPCO_CSV_PATH or add a CSV at backend/data/nppa_dpco_sample.csv.',
        });
      }

      const generic = resolveGeneric(query);
      if (!generic) {
        return res.status(404).json({
          error:
            'No matching generic medicine found for this query in the NPPA dataset. Try a different spelling or ensure the CSV contains this drug.',
        });
      }

      const matches = MEDICINE_DATA.filter(
        (m) => normalize(m.generic_name) === normalize(generic)
      );
      if (!matches.length) {
        return res.status(404).json({ error: 'No brands found for this generic in local dataset.' });
      }

      const brands = matches.map((m) => ({
        brand: m.brand_name,
        price: m.price,
        manufacturer: m.manufacturer,
        dosage: m.dosage,
        source: m.source,
      }));

      const cheapest = brands.reduce((min, b) => (b.price < min.price ? b : min), brands[0]);

      const avgPrice =
        brands.reduce((sum, b) => sum + (b.price || 0), 0) / Math.max(brands.length, 1);

      const response = {
        generic: generic.charAt(0).toUpperCase() + generic.slice(1),
        query: query,
        location: location || null,
        brands,
        cheapest: {
          brand: cheapest.brand,
          price: cheapest.price,
          manufacturer: cheapest.manufacturer,
          pharmacy_source: cheapest.source,
        },
        summary: {
          bestPrice: cheapest.price,
          averagePrice: Number.isFinite(avgPrice) ? Number(avgPrice.toFixed(2)) : null,
          totalBrands: brands.length,
        },
      };

      res.json(response);
    } catch (err) {
      console.error('Medicine comparator error', err);
      res.status(500).json({ error: 'Failed to generate price comparison' });
    }
  }
);

export default router;

