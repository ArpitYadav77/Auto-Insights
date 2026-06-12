const express = require('express');
const auth = require('../middleware/auth');
const analysisController = require('../controllers/analysisController');

const router = express.Router();

// POST /api/analysis/profile/:datasetId
router.post('/profile/:datasetId', auth, analysisController.profileDataset);

// POST /api/analysis/hypothesis/:datasetId
router.post('/hypothesis/:datasetId', auth, analysisController.generateHypotheses);

// POST /api/analysis/generate-insights/:datasetId
router.post('/generate-insights/:datasetId', auth, analysisController.generateInsights);

// POST /api/analysis/generate-sql/:datasetId
router.post('/generate-sql/:datasetId', auth, analysisController.generateSQL);

// POST /api/analysis/generate-code/:datasetId
router.post('/generate-code/:datasetId', auth, analysisController.generateCode);

// POST /api/analysis/execute-code
router.post('/execute-code', auth, analysisController.executeCode);

module.exports = router;
