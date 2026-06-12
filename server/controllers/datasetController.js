const fs = require('fs');
const path = require('path');
const Dataset = require('../models/Dataset');
const { parseCSV, parseXLSX } = require('../services/datasetService');
const { getFileExtension } = require('../utils/helpers');

/**
 * @route   POST /api/dataset/upload
 * @desc    Upload a dataset file (CSV or XLSX), parse it, and store metadata
 * @access  Private
 */
const upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a CSV or XLSX file.',
      });
    }

    const { filename, originalname, path: filePath, size, mimetype } = req.file;
    const ext = getFileExtension(originalname);

    // Parse the file to extract metadata
    let parseResult;

    try {
      if (ext === 'csv') {
        parseResult = await parseCSV(filePath);
      } else if (ext === 'xlsx') {
        parseResult = parseXLSX(filePath);
      } else {
        // Should not reach here due to multer filter, but just in case
        return res.status(400).json({
          success: false,
          message: 'Unsupported file type. Only CSV and XLSX are allowed.',
        });
      }
    } catch (parseError) {
      // If parsing fails, still create the dataset record but mark as error
      const dataset = new Dataset({
        userId: req.user._id,
        fileName: filename,
        originalName: originalname,
        filePath: filePath,
        fileSize: size,
        mimeType: mimetype,
        status: 'error',
      });
      await dataset.save();

      return res.status(207).json({
        success: true,
        message: `File uploaded but parsing failed: ${parseError.message}`,
        data: { dataset },
      });
    }

    // Create dataset record with parsed metadata
    const dataset = new Dataset({
      userId: req.user._id,
      fileName: filename,
      originalName: originalname,
      filePath: filePath,
      fileSize: size,
      mimeType: mimetype,
      rows: parseResult.rows,
      columns: parseResult.columns,
      columnNames: parseResult.columnNames,
      columnTypes: parseResult.columnTypes,
      status: 'uploaded',
    });

    await dataset.save();

    res.status(201).json({
      success: true,
      message: 'File uploaded and parsed successfully.',
      data: {
        dataset: {
          _id: dataset._id,
          fileName: dataset.fileName,
          originalName: dataset.originalName,
          fileSize: dataset.fileSize,
          mimeType: dataset.mimeType,
          rows: dataset.rows,
          columns: dataset.columns,
          columnNames: dataset.columnNames,
          columnTypes: dataset.columnTypes,
          status: dataset.status,
          uploadedAt: dataset.uploadedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dataset/list
 * @desc    List all datasets for the authenticated user
 * @access  Private
 */
const list = async (req, res, next) => {
  try {
    const datasets = await Dataset.find({ userId: req.user._id })
      .sort({ uploadedAt: -1 })
      .select('-profileData'); // Exclude heavy profileData from list view

    res.status(200).json({
      success: true,
      data: {
        count: datasets.length,
        datasets,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/dataset/:id
 * @desc    Get a single dataset by ID (with ownership check)
 * @access  Private
 */
const getById = async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found.',
      });
    }

    // Verify ownership
    if (dataset.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this dataset.',
      });
    }

    res.status(200).json({
      success: true,
      data: { dataset },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/dataset/:id
 * @desc    Delete a dataset and its file from disk
 * @access  Private
 */
const deleteDataset = async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found.',
      });
    }

    // Verify ownership
    if (dataset.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this dataset.',
      });
    }

    // Delete the file from disk
    if (dataset.filePath && fs.existsSync(dataset.filePath)) {
      try {
        fs.unlinkSync(dataset.filePath);
      } catch (fsError) {
        console.error(`Warning: Could not delete file ${dataset.filePath}: ${fsError.message}`);
      }
    }

    // Delete the document
    await Dataset.findByIdAndDelete(dataset._id);

    res.status(200).json({
      success: true,
      message: 'Dataset deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  list,
  getById,
  delete: deleteDataset,
};
