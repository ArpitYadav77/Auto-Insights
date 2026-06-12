const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    type: { type: String },
    severity: { type: String },
  },
  { _id: false }
);

const hypothesisSchema = new mongoose.Schema(
  {
    hypothesis: { type: String },
    kpi: { type: String },
    analysis: { type: String },
  },
  { _id: false }
);

const sqlQuerySchema = new mongoose.Schema(
  {
    title: { type: String },
    query: { type: String },
    description: { type: String },
  },
  { _id: false }
);

const pythonCodeSchema = new mongoose.Schema(
  {
    title: { type: String },
    code: { type: String },
    output: { type: String },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dataset',
      required: [true, 'Dataset ID is required'],
      index: true,
    },
    title: {
      type: String,
      default: 'Untitled Report',
    },
    summary: {
      type: String,
      default: '',
    },
    insights: {
      type: [insightSchema],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
    hypotheses: {
      type: [hypothesisSchema],
      default: [],
    },
    sqlQueries: {
      type: [sqlQuerySchema],
      default: [],
    },
    pythonCode: {
      type: [pythonCodeSchema],
      default: [],
    },
    charts: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index for user-scoped report listing
reportSchema.index({ userId: 1, generatedAt: -1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
