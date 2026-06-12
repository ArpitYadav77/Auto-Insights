const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const datasetController = require('../controllers/datasetController');

const router = express.Router();

// POST /api/dataset/upload
router.post('/upload', auth, upload.single('file'), datasetController.upload);

// GET /api/dataset/list
router.get('/list', auth, datasetController.list);

// GET /api/dataset/:id
router.get('/:id', auth, datasetController.getById);

// DELETE /api/dataset/:id
router.delete('/:id', auth, datasetController.delete);

module.exports = router;
