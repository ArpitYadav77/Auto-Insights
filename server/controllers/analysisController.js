const path = require('path');
const Dataset = require('../models/Dataset');
const openaiService = require('../services/openaiService');
const pythonService = require('../services/pythonService');

/**
 * Helper: find a dataset and verify ownership.
 */
const findUserDataset = async (datasetId, userId) => {
  const dataset = await Dataset.findById(datasetId);

  if (!dataset) {
    return { error: 'Dataset not found.', status: 404 };
  }

  if (dataset.userId.toString() !== userId.toString()) {
    return { error: 'You do not have permission to access this dataset.', status: 403 };
  }

  return { dataset };
};

/**
 * Build a schema summary object from a dataset document.
 */
const buildSchema = (dataset) => ({
  columnNames: dataset.columnNames,
  columnTypes: dataset.columnTypes,
  rows: dataset.rows,
  columns: dataset.columns,
  originalName: dataset.originalName,
});

/**
 * @route   POST /api/analysis/profile/:datasetId
 * @desc    Send dataset to Python service for profiling
 * @access  Private
 */
const profileDataset = async (req, res, next) => {
  try {
    const { datasetId } = req.params;
    const result = await findUserDataset(datasetId, req.user._id);

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    const { dataset } = result;

    // Update status to processing
    dataset.status = 'processing';
    await dataset.save();

    try {
      // Get the absolute file path
      const filePath = path.resolve(dataset.filePath);

      // Call Python profiling service
      const profileData = await pythonService.profileDataset(filePath);

      // Store profiling results
      dataset.profileData = profileData;
      dataset.status = 'profiled';
      await dataset.save();

      res.status(200).json({
        success: true,
        message: 'Dataset profiled successfully.',
        data: {
          datasetId: dataset._id,
          status: dataset.status,
          profileData,
        },
      });
    } catch (profileError) {
      // Revert status on failure
      dataset.status = 'error';
      await dataset.save();
      throw profileError;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/analysis/hypothesis/:datasetId
 * @desc    Generate business hypotheses using OpenAI
 * @access  Private
 */
const generateHypotheses = async (req, res, next) => {
  try {
    const { datasetId } = req.params;
    const result = await findUserDataset(datasetId, req.user._id);

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    const { dataset } = result;
    const schema = buildSchema(dataset);

    const hypotheses = await openaiService.generateHypotheses(schema);

    res.status(200).json({
      success: true,
      message: 'Hypotheses generated successfully.',
      data: {
        datasetId: dataset._id,
        hypotheses,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/analysis/generate-insights/:datasetId
 * @desc    Generate executive insights using OpenAI
 * @access  Private
 */
const generateInsights = async (req, res, next) => {
  try {
    const { datasetId } = req.params;
    const result = await findUserDataset(datasetId, req.user._id);

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    const { dataset } = result;

    // Use profileData if available; fall back to basic schema
    const profileData = dataset.profileData || buildSchema(dataset);
    const chartData = req.body.chartData || null;

    const insights = await openaiService.generateInsights(profileData, chartData);

    res.status(200).json({
      success: true,
      message: 'Insights generated successfully.',
      data: {
        datasetId: dataset._id,
        insights,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/analysis/generate-sql/:datasetId
 * @desc    Generate SQL queries using OpenAI
 * @access  Private
 */
const generateSQL = async (req, res, next) => {
  try {
    const { datasetId } = req.params;
    const result = await findUserDataset(datasetId, req.user._id);

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    const { dataset } = result;
    const schema = buildSchema(dataset);

    const sqlResult = await openaiService.generateSQL(schema);

    res.status(200).json({
      success: true,
      message: 'SQL queries generated successfully.',
      data: {
        datasetId: dataset._id,
        ...sqlResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/analysis/generate-code/:datasetId
 * @desc    Generate Python code for a business question using OpenAI
 * @access  Private
 */
const generateCode = async (req, res, next) => {
  try {
    const { datasetId } = req.params;
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A business question is required in the request body.',
      });
    }

    const result = await findUserDataset(datasetId, req.user._id);

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    const { dataset } = result;
    const schema = buildSchema(dataset);

    const codeResult = await openaiService.generatePythonCode(schema, question.trim());

    res.status(200).json({
      success: true,
      message: 'Python code generated successfully.',
      data: {
        datasetId: dataset._id,
        ...codeResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/analysis/execute-code
 * @desc    Execute Python code against a dataset via the Python service
 * @access  Private
 */
const executeCode = async (req, res, next) => {
  try {
    const { code, datasetId } = req.body;

    if (!code || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Code is required in the request body.',
      });
    }

    if (!datasetId) {
      return res.status(400).json({
        success: false,
        message: 'Dataset ID is required in the request body.',
      });
    }

    const result = await findUserDataset(datasetId, req.user._id);

    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    const { dataset } = result;
    const filePath = path.resolve(dataset.filePath);

    const execResult = await pythonService.executeCode(code.trim(), filePath);

    res.status(200).json({
      success: true,
      message: 'Code executed successfully.',
      data: {
        datasetId: dataset._id,
        result: execResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  profileDataset,
  generateHypotheses,
  generateInsights,
  generateSQL,
  generateCode,
  executeCode,
};
