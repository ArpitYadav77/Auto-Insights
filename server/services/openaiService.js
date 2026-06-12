const { OpenAI } = require('openai');
const axios = require('axios');
const config = require('../config/env');

const apiKey = config.OPENAI_API_KEY;
const isGemini = apiKey && (!apiKey.startsWith('sk-'));

const client = isGemini ? null : new OpenAI({
  apiKey: apiKey,
});

const MODEL = config.OPENAI_MODEL;

/**
 * Helper to make a chat completion call and parse the JSON response.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {Object} Parsed JSON from the model response
 */
const callOpenAI = async (systemPrompt, userPrompt) => {
  if (isGemini) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(url, {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        role: 'user',
        parts: [{ text: userPrompt }]
      }],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.7
      }
    });

    const content = response.data.candidates[0].content.parts[0].text;
    try {
      return JSON.parse(content);
    } catch (parseError) {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1].trim());
      }
      throw new Error('Failed to parse Gemini response as JSON.');
    }
  }

  // Fallback to OpenAI
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (parseError) {
    // Attempt to extract JSON from markdown code fences
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    throw new Error('Failed to parse OpenAI response as JSON.');
  }
};

/**
 * Generate business hypotheses based on dataset schema.
 * @param {Object} datasetSchema - { columnNames, columnTypes, rows, columns }
 * @returns {Object} { hypotheses: [{ hypothesis, kpi, analysis, businessQuestion }] }
 */
const generateHypotheses = async (datasetSchema) => {
  try {
    const systemPrompt =
      'You are a senior business analyst with deep expertise in data-driven decision making. Return valid JSON only.';

    const userPrompt = `Based on this dataset schema:
- Columns: ${JSON.stringify(datasetSchema.columnNames)}
- Column Types: ${JSON.stringify(datasetSchema.columnTypes)}
- Total Rows: ${datasetSchema.rows}
- Total Columns: ${datasetSchema.columns}

Generate:
1) 10 business hypotheses that could be tested with this data
2) KPIs (Key Performance Indicators) for each hypothesis
3) Recommended analyses for each hypothesis
4) Key business questions for each hypothesis

Return as JSON with structure:
{
  "hypotheses": [
    {
      "hypothesis": "string",
      "kpi": "string",
      "analysis": "string",
      "businessQuestion": "string"
    }
  ]
}`;

    const result = await callOpenAI(systemPrompt, userPrompt);
    return result;
  } catch (error) {
    console.error('OpenAI generateHypotheses error:', error.message);
    throw new Error(`Failed to generate hypotheses: ${error.message}`);
  }
};

/**
 * Generate executive insights from profile and chart data.
 * @param {Object} profileData - Dataset profiling results
 * @param {Object} chartData - Analysis/chart results (optional)
 * @returns {Object} { summary, findings, risks, opportunities, recommendations }
 */
const generateInsights = async (profileData, chartData) => {
  try {
    const systemPrompt =
      'You are a senior data analyst providing executive-level insights for business stakeholders. Return valid JSON only.';

    const userPrompt = `Based on this dataset profile:
${JSON.stringify(profileData, null, 2)}

And analysis results:
${JSON.stringify(chartData || {}, null, 2)}

Generate:
1) Executive summary (2-3 paragraphs)
2) Key findings (with titles, descriptions, type such as "positive", "negative", "neutral", and severity such as "high", "medium", "low")
3) Risks identified in the data
4) Opportunities for improvement
5) Actionable recommendations

Return as JSON:
{
  "summary": "string",
  "findings": [
    {
      "title": "string",
      "description": "string",
      "type": "string",
      "severity": "string"
    }
  ],
  "risks": ["string"],
  "opportunities": ["string"],
  "recommendations": ["string"]
}`;

    const result = await callOpenAI(systemPrompt, userPrompt);
    return result;
  } catch (error) {
    console.error('OpenAI generateInsights error:', error.message);
    throw new Error(`Failed to generate insights: ${error.message}`);
  }
};

/**
 * Generate useful SQL queries based on dataset schema.
 * @param {Object} datasetSchema - { columnNames, columnTypes, rows, columns, originalName }
 * @returns {Object} { queries: [{ title, query, description }] }
 */
const generateSQL = async (datasetSchema) => {
  try {
    const systemPrompt =
      'You are a senior database analyst and SQL expert. Return valid JSON only.';

    const tableName = (datasetSchema.originalName || 'dataset')
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .toLowerCase();

    const userPrompt = `Based on this dataset schema:
- Table Name: "${tableName}"
- Columns: ${JSON.stringify(datasetSchema.columnNames)}
- Column Types: ${JSON.stringify(datasetSchema.columnTypes)}
- Total Rows: ${datasetSchema.rows}

Generate 8-10 useful SQL queries that would provide valuable business insights from this data.
Include a mix of:
- Aggregation queries (GROUP BY, COUNT, SUM, AVG)
- Filtering queries (WHERE, HAVING)
- Sorting and ranking queries
- Date-based analysis (if date columns exist)
- Join-ready queries or subqueries for advanced analysis

Return as JSON:
{
  "queries": [
    {
      "title": "string - descriptive title",
      "query": "string - valid SQL query",
      "description": "string - what this query reveals"
    }
  ]
}`;

    const result = await callOpenAI(systemPrompt, userPrompt);
    return result;
  } catch (error) {
    console.error('OpenAI generateSQL error:', error.message);
    throw new Error(`Failed to generate SQL queries: ${error.message}`);
  }
};

/**
 * Generate executable Python/Pandas code for a business question.
 * @param {Object} datasetSchema - { columnNames, columnTypes, rows, columns }
 * @param {string} question - Business question to answer
 * @returns {Object} { title, code, explanation }
 */
const generatePythonCode = async (datasetSchema, question) => {
  try {
    const systemPrompt =
      'You are a senior data scientist expert in Python and Pandas. Return valid JSON only.';

    const userPrompt = `Based on this dataset schema:
- Columns: ${JSON.stringify(datasetSchema.columnNames)}
- Column Types: ${JSON.stringify(datasetSchema.columnTypes)}
- Total Rows: ${datasetSchema.rows}

Business Question: "${question}"

Generate executable Python code using Pandas that answers the business question.
Important rules:
- The dataframe is already loaded as a variable called 'df'
- Do NOT include any file reading code (no pd.read_csv, etc.)
- Use proper data type conversions where necessary
- Include comments explaining each step
- Print the final results using print()
- If creating visualizations, use matplotlib and save to a variable called 'fig'

Return as JSON:
{
  "title": "string - descriptive title for this analysis",
  "code": "string - complete executable Python code",
  "explanation": "string - explanation of what the code does and expected output"
}`;

    const result = await callOpenAI(systemPrompt, userPrompt);
    return result;
  } catch (error) {
    console.error('OpenAI generatePythonCode error:', error.message);
    throw new Error(`Failed to generate Python code: ${error.message}`);
  }
};

module.exports = {
  generateHypotheses,
  generateInsights,
  generateSQL,
  generatePythonCode,
};
