const axios = require('axios');
const config = require('../config/env');

// Create a pre-configured axios instance for the Python service
const pythonClient = axios.create({
  baseURL: config.PYTHON_SERVICE_URL,
  timeout: 120000, // 2 minutes – profiling large files can be slow
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Send a dataset file path to the Python service for profiling.
 * @param {string} filePath - Absolute path to the dataset file
 * @returns {Object} Profiling results from the Python service
 */
const profileDataset = async (filePath) => {
  try {
    const response = await pythonClient.post('/api/profile', {
      filePath: filePath,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Python profiling service returned ${error.response.status}: ${
          error.response.data?.detail || error.response.data?.message || JSON.stringify(error.response.data)
        }`
      );
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error(
        `Python service is not running at ${config.PYTHON_SERVICE_URL}. Please start the Python service.`
      );
    }
    throw new Error(`Python profiling service error: ${error.message}`);
  }
};

/**
 * Run exploratory data analysis via the Python service.
 * @param {string} filePath - Absolute path to the dataset file
 * @returns {Object} EDA results
 */
const runEDA = async (filePath) => {
  try {
    const response = await pythonClient.post('/api/eda', {
      filePath: filePath,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Python EDA service returned ${error.response.status}: ${
          error.response.data?.detail || error.response.data?.message || JSON.stringify(error.response.data)
        }`
      );
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error(
        `Python service is not running at ${config.PYTHON_SERVICE_URL}. Please start the Python service.`
      );
    }
    throw new Error(`Python EDA service error: ${error.message}`);
  }
};

/**
 * Execute arbitrary Python code against a dataset via the Python service.
 * @param {string} code - Python code to execute
 * @param {string} filePath - Absolute path to the dataset file
 * @returns {Object} Execution results (stdout, stderr, plots, etc.)
 */
const executeCode = async (code, filePath) => {
  try {
    const response = await pythonClient.post('/api/execute', {
      code,
      filePath: filePath,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Python execution service returned ${error.response.status}: ${
          error.response.data?.detail || error.response.data?.message || JSON.stringify(error.response.data)
        }`
      );
    }
    if (error.code === 'ECONNREFUSED') {
      throw new Error(
        `Python service is not running at ${config.PYTHON_SERVICE_URL}. Please start the Python service.`
      );
    }
    throw new Error(`Python execution service error: ${error.message}`);
  }
};

module.exports = {
  profileDataset,
  runEDA,
  executeCode,
};
