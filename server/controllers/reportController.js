const Dataset = require('../models/Dataset');
const Report = require('../models/Report');
const openaiService = require('../services/openaiService');

/**
 * @route   POST /api/report/generate/:datasetId
 * @desc    Generate a comprehensive report for a dataset
 * @access  Private
 */
const generate = async (req, res, next) => {
  try {
    const { datasetId } = req.params;

    // Find dataset and verify ownership
    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found.',
      });
    }

    if (dataset.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this dataset.',
      });
    }

    // Build schema info for AI calls
    const schema = {
      columnNames: dataset.columnNames,
      columnTypes: dataset.columnTypes,
      rows: dataset.rows,
      columns: dataset.columns,
      originalName: dataset.originalName,
    };

    const profileData = dataset.profileData || schema;

    // Run all AI generation in parallel for speed
    const [hypothesesResult, insightsResult, sqlResult] = await Promise.allSettled([
      openaiService.generateHypotheses(schema),
      openaiService.generateInsights(profileData, null),
      openaiService.generateSQL(schema),
    ]);

    // Extract results (use empty defaults on failure)
    const hypotheses =
      hypothesesResult.status === 'fulfilled'
        ? hypothesesResult.value.hypotheses || []
        : [];

    const insights =
      insightsResult.status === 'fulfilled' ? insightsResult.value : {};

    const sqlQueries =
      sqlResult.status === 'fulfilled'
        ? sqlResult.value.queries || []
        : [];

    // Build the report
    const report = new Report({
      userId: req.user._id,
      datasetId: dataset._id,
      title: `Analysis Report: ${dataset.originalName}`,
      summary: insights.summary || 'Report generated from dataset analysis.',
      insights: (insights.findings || []).map((f) => ({
        title: f.title,
        description: f.description,
        type: f.type || 'neutral',
        severity: f.severity || 'medium',
      })),
      recommendations: [
        ...(insights.recommendations || []),
        ...(insights.opportunities || []),
      ],
      hypotheses: hypotheses.map((h) => ({
        hypothesis: h.hypothesis,
        kpi: h.kpi,
        analysis: h.analysis,
      })),
      sqlQueries: sqlQueries.map((q) => ({
        title: q.title,
        query: q.query,
        description: q.description,
      })),
      pythonCode: [],
      charts: null,
    });

    await report.save();

    // Update dataset status
    dataset.status = 'analyzed';
    await dataset.save();

    // Collect any partial failure warnings
    const warnings = [];
    if (hypothesesResult.status === 'rejected') {
      warnings.push(`Hypotheses generation failed: ${hypothesesResult.reason.message}`);
    }
    if (insightsResult.status === 'rejected') {
      warnings.push(`Insights generation failed: ${insightsResult.reason.message}`);
    }
    if (sqlResult.status === 'rejected') {
      warnings.push(`SQL generation failed: ${sqlResult.reason.message}`);
    }

    res.status(201).json({
      success: true,
      message: 'Report generated successfully.',
      data: {
        report,
        ...(warnings.length > 0 && { warnings }),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/report/list
 * @desc    List all reports for the authenticated user
 * @access  Private
 */
const list = async (req, res, next) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .sort({ generatedAt: -1 })
      .select('title summary datasetId generatedAt')
      .populate('datasetId', 'originalName rows columns');

    res.status(200).json({
      success: true,
      data: {
        count: reports.length,
        reports,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/report/:id
 * @desc    Get a single report by ID (with ownership check)
 * @access  Private
 */
const getById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate(
      'datasetId',
      'originalName rows columns columnNames columnTypes status'
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    // Verify ownership
    if (report.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this report.',
      });
    }

    res.status(200).json({
      success: true,
      data: { report },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generate,
  list,
  getById,
};
