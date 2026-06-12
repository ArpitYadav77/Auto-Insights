const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
    },
    rows: {
      type: Number,
      default: 0,
    },
    columns: {
      type: Number,
      default: 0,
    },
    columnTypes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    columnNames: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['uploaded', 'processing', 'profiled', 'analyzed', 'error'],
        message: 'Invalid dataset status',
      },
      default: 'uploaded',
    },
    profileData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Index for efficient user-scoped queries sorted by upload date
datasetSchema.index({ userId: 1, uploadedAt: -1 });

const Dataset = mongoose.model('Dataset', datasetSchema);

module.exports = Dataset;
