/**
 * Smart Medicine Alternative Finder
 * Uses RxClass / RxNav API to find clinically similar drug classes.
 *
 * Docs: https://rxnav.nlm.nih.gov/REST/rxclass/class/similar.html
 */

import express from 'express';

const router = express.Router();

const RXCLASS_BASE_URL = 'https://rxnav.nlm.nih.gov/REST/rxclass/class/similar.json';

// Parse JSON structure as documented:
// rxclassdata -> similarityMember[] -> ingredientRxcui[], rankClassConcept[]
// rankClassConcept: { similarityEntityItem, drugClassConceptItem }
function parseSimilarClasses(json) {
  const root = json?.rxclassdata || json;
  const members = root?.similarityMember;

  if (!members) return [];

  const memberArray = Array.isArray(members) ? members : [members];
  const results = [];

  for (const member of memberArray) {
    const rankConcepts = member?.rankClassConcept;
    if (!rankConcepts) continue;

    const conceptsArray = Array.isArray(rankConcepts) ? rankConcepts : [rankConcepts];

    for (const rc of conceptsArray) {
      const sim = rc?.similarityEntityItem || {};
      const drugClass = rc?.drugClassConceptItem || {};
      const concept = drugClass?.rxclassMinConceptItem || {};

      results.push({
        class_id: concept.classId || null,
        class_name: concept.className || null,
        class_type: concept.classType || null,
        equivalence_score:
          sim?.equivalenceScore != null ? Number(sim.equivalenceScore) : null,
        inclusion_score:
          sim?.inclusionScore != null ? Number(sim.inclusionScore) : null,
        intersection:
          sim?.intersection != null ? Number(sim.intersection) : null,
        members_in_input_class:
          sim?.cardinality1 != null ? Number(sim.cardinality1) : null,
        members_in_result_class:
          sim?.cardinality2 != null ? Number(sim.cardinality2) : null,
        ingredient_rxcuis: Array.isArray(member?.ingredientRxcui)
          ? member.ingredientRxcui
          : member?.ingredientRxcui
            ? [member.ingredientRxcui]
            : [],
      });
    }
  }

  return results;
}

// @route   POST /api/smart-medicine/alternatives
// @desc    Find similar drug classes via RxClass
router.post('/alternatives', async (req, res) => {
  try {
    const {
      classId,
      relaSource = 'ATC',
      scoreType = 0,
      top = 5,
      rela,
      equivalenceThreshold,
      inclusionThreshold,
    } = req.body || {};

    if (!classId || typeof classId !== 'string') {
      return res.status(400).json({ error: 'classId is required and must be a string.' });
    }

    const topClamped = Math.min(Math.max(parseInt(top, 10) || 5, 1), 100);
    const score = [0, 1, 2].includes(scoreType) ? scoreType : 0;

    const url = new URL(RXCLASS_BASE_URL);
    url.searchParams.set('classId', classId);
    url.searchParams.set('relaSource', relaSource || 'ATC');
    url.searchParams.set('scoreType', String(score));
    url.searchParams.set('top', String(topClamped));
    if (rela) {
      url.searchParams.set('rela', String(rela));
    }
    if (equivalenceThreshold != null && equivalenceThreshold !== '') {
      url.searchParams.set('equivalenceThreshold', String(equivalenceThreshold));
    }
    if (inclusionThreshold != null && inclusionThreshold !== '') {
      url.searchParams.set('inclusionThreshold', String(inclusionThreshold));
    }

    console.log('[SmartMedicineAlt] Requesting RxClass:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    const text = await response.text();

    if (!response.ok) {
      console.error('[SmartMedicineAlt] RxClass error', response.status, text);
      return res.status(502).json({
        error: 'RxClass API error',
        status: response.status,
        details: text || null,
      });
    }

    let data;
    try {
      // RxClass sometimes returns numbers as strings; JSON.parse handles that fine.
      data = JSON.parse(text);
    } catch (e) {
      console.error('[SmartMedicineAlt] Failed to parse RxClass JSON', e, text);
      return res.status(502).json({ error: 'RxClass JSON parse error' });
    }

    const similar = parseSimilarClasses(data);

    if (!similar.length) {
      return res.status(404).json({
        input_class: classId,
        similar_classes: [],
        message: 'No similar classes found for the provided classId.',
      });
    }

    res.json({
      input_class: classId,
      rela_source: relaSource || 'ATC',
      score_type: score,
      top: topClamped,
      similar_classes: similar,
    });
  } catch (err) {
    console.error('[SmartMedicineAlt] Unexpected error', err);
    res.status(500).json({ error: 'Failed to fetch similar medicine classes.' });
  }
});

export default router;

