import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Chip,
  Alert,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Send as SendIcon, Lightbulb as LightbulbIcon } from '@mui/icons-material';
import Chart from 'react-apexcharts';
import { api } from 'src/utils/api';

const ChatContainer = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2.5),
  backgroundColor: alpha(theme.palette.background.paper, 1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1.5),
  display: 'flex',
  flexDirection: 'column',
  height: '600px',
  maxHeight: '600px',
}));

const MessagesBox = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  marginBottom: theme.spacing(2),
  paddingRight: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.primary.main, 0.05),
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: '10px',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.5),
    },
  },
}));

const UserMessage = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: theme.spacing(1),
  animation: 'slideInRight 0.3s ease-out',
}));

const UserBubble = styled(Box)(({ theme }) => ({
  maxWidth: '80%',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
  borderRadius: `${theme.spacing(1.5)} ${theme.spacing(1.5)} 0 ${theme.spacing(1.5)}`,
  wordWrap: 'break-word',
  fontSize: '0.95rem',
}));

const AiBubble = styled(Box)(({ theme }) => ({
  maxWidth: '80%',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.text.primary,
  padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
  borderRadius: `${theme.spacing(1.5)} ${theme.spacing(1.5)} ${theme.spacing(1.5)} 0`,
  wordWrap: 'break-word',
  fontSize: '0.95rem',
  border: `1px solid ${theme.palette.divider}`,
}));

// Chart Renderer Component
const AiChartRenderer = ({ chartData }) => {
  if (!chartData) return null;

  console.log('🎨 Chart Data Received:', chartData); // DEBUG

  const isBar = chartData.type === 'bar';
  const isDonut = chartData.type === 'donut';
  const isLine = chartData.type === 'line';

  // Safely get categories with fallback
  const categories = Array.isArray(chartData.categories) ? chartData.categories : [];

  // Format series based on chart type
  let series = [];
  if (isDonut) {
    // Donut charts expect array of numbers
    series = Array.isArray(chartData.series?.[0]?.data) ? chartData.series[0].data : [];
  } else if (isBar || isLine) {
    // Bar and line charts expect array of { name, data }
    if (Array.isArray(chartData.series)) {
      series = chartData.series.map(s => {
        // Ensure data is array of numbers
        let dataArray = [];
        if (Array.isArray(s.data)) {
          dataArray = s.data.map(v => typeof v === 'number' ? v : parseFloat(v) || 0);
        } else if (s.data) {
          dataArray = [typeof s.data === 'number' ? s.data : parseFloat(s.data) || 0];
        }
        return {
          name: String(s.name || 'Data'),
          data: dataArray
        };
      });
    }
  }

  console.log('📊 Raw chartData.series:', chartData.series); // DEBUG
  console.log('📊 Formatted Series:', series, 'Categories:', categories); // DEBUG
  console.log('📊 Series Detail:', JSON.stringify(series)); // DEBUG

  // Validate data before rendering
  if (series.length === 0 || categories.length === 0) {
    console.warn('⚠️ Chart data incomplete - skipping render');
    return (
      <Box sx={{ mt: 1, p: 1, backgroundColor: 'warning.light', borderRadius: 1, fontSize: '0.85rem' }}>
        (ข้อมูลกราฟไม่สมบูรณ์)
      </Box>
    );
  }

  const baseOptions = {
    chart: { toolbar: { show: false } },
    colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
    legend: { position: 'bottom', fontSize: 11 },
    plotOptions: {
      bar: { columnWidth: '55%' },
      pie: { donut: { size: '75%' } },
    },
  };

  // Build type-specific options to avoid undefined values
  const typeOptions = {};
  if (isBar || isLine) {
    typeOptions.xaxis = { categories: categories.length > 0 ? categories : [] };
  }
  if (isDonut) {
    typeOptions.labels = categories.length > 0 ? categories : [];
  }

  const options = {
    ...baseOptions,
    ...typeOptions,
    title: { text: chartData.title || 'Chart', style: { fontSize: '13px', fontWeight: 600 } },
  };

  console.log('📊 Final Options:', options); // DEBUG

  return (
    <Box sx={{ mt: 1, maxWidth: '100%', width: '100%' }}>
      <Chart
        type={chartData.type}
        options={options}
        series={series}
        height={250}
      />
    </Box>
  );
};

const AiChatPanel = ({ selectedModel = 'glm-4-plus' }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    'โครงการไหน rejection สูงสุด?',
    'ภาพรวม production ตอนนี้เป็นยังไง?',
    'วัสดุที่ต้องการสัปดาห์หน้า?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (question = null) => {
    const queryText = question || input.trim();

    if (!queryText) return;

    // Add user message
    const userMsg = { type: 'user', content: queryText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      // Call AI API
      const response = await api.post('/ai/chat', { question: queryText, model: selectedModel });

      // Add AI message with optional chartData
      const aiMsg = {
        type: 'ai',
        content: response.data.answer,
        chartData: response.data.chartData || null,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error calling AI:', err);
      const errorMsg = {
        type: 'ai',
        content: `❌ ขออภัย ไม่สามารถตอบได้ในขณะนี้: ${err.response?.data?.error || err.message}`,
      };
      setMessages(prev => [...prev, errorMsg]);
      setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการเรียก AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatContainer>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}>
        💬 AI Chat Assistant
      </Typography>

      {/* Messages */}
      <MessagesBox>
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="empty-state"
            >
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <LightbulbIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
                <Typography variant="body2" sx={{ mb: 2 }}>
                  ถามคำถามเกี่ยวกับข้อมูลโครงการของคุณ
                </Typography>
              </Box>
            </motion.div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.type === 'user' ? (
                  <UserMessage>
                    <UserBubble>{msg.content}</UserBubble>
                  </UserMessage>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 1 }}>
                    <AiBubble>{msg.content}</AiBubble>
                    {msg.chartData && (
                      <Box sx={{ width: '100%', maxWidth: '85%', mt: 1 }}>
                        <AiChartRenderer chartData={msg.chartData} />
                      </Box>
                    )}
                  </Box>
                )}
              </motion.div>
            ))
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="loading"
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1, gap: 1 }}>
                <CircularProgress size={20} sx={{ mt: 0.5 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.8 }}>
                  กำลังประมวลผล...
                </Typography>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </MessagesBox>

      {/* Error */}
      {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.85rem' }}>{error}</Alert>}

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontSize: '0.75rem', mb: 1, display: 'block', color: 'text.secondary' }}>
            คำถามแนะนำ:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {suggestedQuestions.map((question, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
                <Chip
                  label={question}
                  onClick={() => handleSendMessage(question)}
                  size="small"
                  variant="outlined"
                  sx={(theme) => ({
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                  })}
                />
              </motion.div>
            ))}
          </Box>
        </Box>
      )}

      {/* Input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="ถามคำถาม..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={loading}
          multiline
          maxRows={3}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            },
          }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={() => handleSendMessage()}
          disabled={loading || !input.trim()}
          sx={{ minWidth: '60px' }}
        >
          {loading ? <CircularProgress size={20} /> : <SendIcon />}
        </Button>
      </Box>
    </ChatContainer>
  );
};

export default AiChatPanel;
