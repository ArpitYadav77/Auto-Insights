const express = require('express');
const auth = require('../middleware/auth');
const reportController = require('../controllers/reportController');

const router = express.Router();

// POST /api/report/generate/:datasetId
router.post('/generate/:datasetId', auth, reportController.generate);

// GET /api/report/list
router.get('/list', auth, reportController.list);

// GET /api/report/:id
router.get('/:id', auth, reportController.getById);

module.exports = router;
