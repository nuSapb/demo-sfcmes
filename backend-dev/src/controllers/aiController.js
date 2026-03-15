const axios = require('axios');
const projectQueries = require('../queries/projectQueries');
const analyticsQueries = require('../queries/analyticsQueries');

// Google Gemini AI API Configuration
const GOOGLE_AI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GOOGLE_AI_MODEL = process.env.GOOGLE_AI_MODEL || 'gemini-2.0-flash';
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

// Helper: Fetch context data for AI
const fetchContextData = async (projectId = null) => {
  try {
    // Bug 1 fix: Use getAllProjects instead of getProjectsWithProgress
    // Bug 3 fix: Call analytics queries to get production summary and health metrics
    const [projects, productionSummary, healthMetrics] = await Promise.all([
      projectQueries.getAllProjects(),
      analyticsQueries.getProductionSummary(),
      analyticsQueries.getProjectHealthMetrics(),
    ]);

    let projectDetails = null;
    if (projectId) {
      projectDetails = await projectQueries.getProjectById(projectId);
    }

    return {
      projects: projects || [],
      productionSummary: productionSummary || null,
      healthMetrics: healthMetrics || [],
      selectedProject: projectDetails || null,
    };
  } catch (error) {
    console.error('Error fetching context data:', error);
    return { projects: [], productionSummary: null, healthMetrics: [], selectedProject: null };
  }
};

// Helper: Build system prompt with context
const buildSystemPrompt = (contextData) => {
  let projectSummary = '';

  // Bug 2 fix: Use correct column names (components, progress, status)
  if (contextData.projects && contextData.projects.length > 0) {
    projectSummary += `

โครงการทั้งหมด (${contextData.projects.length} โครงการ):
${contextData.projects.map((p, i) => `${i + 1}. ${p.name} (${p.project_code || 'N/A'}) - ${p.components || 0} ชิ้น, ความคืบหน้า ${Math.round(p.progress || 0)}%, สถานะ: ${p.status}`).join('\n')}`;
  }

  // Bug 3 fix: Add production summary data
  if (contextData.productionSummary) {
    const s = contextData.productionSummary;
    projectSummary += `

ภาพรวมการผลิต (ทุกโครงการ):
- ทั้งหมด: ${s.total_components} ชิ้น
- Planning: ${s.planning}, Manufactured: ${s.manufactured}, In Transit: ${s.in_transit}
- Transported: ${s.transported}, Accepted: ${s.accepted}, Installed: ${s.installed}, Rejected: ${s.rejected}`;
  }

  // Bug 3 fix: Add health metrics per project
  if (contextData.healthMetrics && contextData.healthMetrics.length > 0) {
    projectSummary += `

Health ของแต่ละโครงการ:
${contextData.healthMetrics.map(h => `- ${h.name}: installed ${h.installed_components}/${h.total_components} ชิ้น, rejected: ${h.rejected_components}`).join('\n')}`;
  }

  // Selected project details with sections
  if (contextData.selectedProject) {
    const sp = contextData.selectedProject;
    projectSummary += `

รายละเอียดโครงการ "${sp.name}" (${sp.project_code}):`;
    if (sp.sections && sp.sections.length > 0) {
      sp.sections.forEach(sec => {
        projectSummary += `\n  Section "${sec.name}" (${sec.status}): ${sec.components ? sec.components.length : 0} ชิ้น`;
      });
    }
  }

  return `คุณเป็น AI Assistant สำหรับระบบ MES (Manufacturing Execution System) ของบริษัทก่อสร้างชิ้นงาน Precast Concrete

ระบบนี้จัดการ:
- Projects: โครงการก่อสร้าง
- Sections: ส่วนของโครงการ
- Components: ชิ้นงาน Precast พร้อมสถานะ (planning, manufactured, in_transit, transported, accepted, installed, rejected)
- Component Files: ไฟล์ยืนยัน/เอกสารของแต่ละชิ้นงาน

ข้อมูลปัจจุบัน:${projectSummary}

กฎเกณฑ์:
- ตอบภาษาเดียวกับที่ถาม (ไทยหรืออังกฤษ)
- ให้ข้อมูลที่ถูกต้องจากข้อมูลในระบบเท่านั้น
- ถ้าไม่มีข้อมูล ให้บอกชัดเจนว่า "ไม่มีข้อมูล" แทนที่จะเดา
- ตอบสั้น กระชับ แต่ครบครัน

📊 IMPORTANT - Chart Visualization (REQUIRED when appropriate):
- เมื่อผู้ใช้ถามเกี่ยวกับการเปรียบเทียบ, เทียบเท่า, กราฟ, แนวโน้ม หรือ visualization ให้:
  1) ตอบคำถามด้วยข้อความอธิบาย
  2) เพิ่ม CHART_DATA block ในตอนท้าย:
  CHART_DATA:{"type":"bar|donut|line","title":"ชื่อกราฟ","categories":["cat1","cat2",...],"series":[{"name":"ชื่อ","data":[n1,n2,...]}]}END_CHART

ตัวอย่าง chart types:
- "bar": ใช้เมื่อเปรียบเทียบจำนวนระหว่างโครงการ/status
- "donut": ใช้แสดงสัดส่วนเปอร์เซนต์ status breakdown
- "line": ใช้แสดงแนวโน้มตามเวลา

⚠️ สำคัญ: ตรวจสอบให้แน่ใจ categories และ data array มีจำนวนเท่ากัน
- ใส่ CHART_DATA block เฉพาะเมื่อ "เหมาะสม" (เมื่อมีการขอเปรียบเทียบ/กราฟ)
- อย่าวาง JSON ในเนื้อข้อความตัวหลัก เฉพาะในส่วนท้าย CHART_DATA block`;
};

// POST /api/ai/chat
const chat = async (req, res) => {
  try {
    const { question, projectId, model } = req.body;

    // Validate input
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Use provided model or fall back to environment variable
    const selectedModel = model || GOOGLE_AI_MODEL;

    // Validate API configuration
    if (!GOOGLE_AI_API_KEY) {
      return res.status(500).json({
        error: 'AI service not configured. Please set GOOGLE_AI_API_KEY in environment variables.'
      });
    }

    // Fetch context data
    const contextData = await fetchContextData(projectId);

    // Build system prompt
    const systemPrompt = buildSystemPrompt(contextData);

    // Call Google Gemini API
    const response = await axios.post(
      `${GOOGLE_AI_API_BASE}/${selectedModel}:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: systemPrompt,
              },
              {
                text: question,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'ไม่สามารถได้รับคำตอบจาก AI';

    // Extract answer from response
    let answer = rawText;
    let chartData = null;

    // Parse CHART_DATA block if present
    const chartMatch = rawText.match(/CHART_DATA:([\s\S]*?)END_CHART/);
    if (chartMatch) {
      try {
        chartData = JSON.parse(chartMatch[1].trim());
        // Remove chart block from visible text
        answer = rawText.replace(/CHART_DATA:[\s\S]*?END_CHART/g, '').trim();
      } catch (e) {
        // If JSON parse fails, keep text as-is without chart
        console.warn('Failed to parse chart data:', e.message);
        chartData = null;
      }
    }

    return res.json({
      question,
      answer,
      chartData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorData = error.response?.data;
    const errorMsg = errorData?.error?.message || errorData?.message || error.message;
    console.error('AI Chat Error:', {
      status: error.response?.status,
      data: errorData,
      message: errorMsg
    });

    if (error.response?.status === 401) {
      return res.status(500).json({
        error: 'AI API authentication failed. Please check GOOGLE_AI_API_KEY.',
        details: errorMsg
      });
    }

    if (error.response?.status === 400) {
      return res.status(400).json({
        error: 'Invalid request to AI service.',
        details: errorMsg
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Too many requests to AI service. Please try again later.'
      });
    }

    return res.status(500).json({
      error: 'Error communicating with AI service: ' + (errorMsg || 'Unknown error')
    });
  }
};

module.exports = {
  chat,
};
