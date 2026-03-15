import { useState } from 'react';
import { Box, Grid, Typography, Chip, Select, MenuItem, FormControl, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import PageContainer from 'src/components/container/PageContainer';
import AnalyticsDashboard from 'src/components/ai/AnalyticsDashboard';
import AiChatPanel from 'src/components/ai/AiChatPanel';

const AiAssistant = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedModel, setSelectedModel] = useState('gemini-flash-latest');

  const availableModels = [
    { value: 'gemini-flash-latest', label: 'Gemini 1.5 Flash ⭐ (Recommended)' },
    { value: 'gemini-pro', label: 'Gemini Pro' },
    { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' },
  ];

  return (
    <PageContainer title="AI Assistant" description="Ask questions about your projects and data">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                letterSpacing: '-0.5px',
              }}
            >
              🤖 AI Assistant
            </Typography>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                variant="outlined"
              >
                {availableModels.map((model) => (
                  <MenuItem key={model.value} value={model.value}>
                    {model.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            ถามคำถามเกี่ยวกับข้อมูลโครงการและสถิติของคุณ
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Left: Analytics Dashboard */}
          <Grid item xs={12} md={5}>
            <AnalyticsDashboard />
          </Grid>

          {/* Right: AI Chat Panel */}
          <Grid item xs={12} md={7}>
            <AiChatPanel selectedModel={selectedModel} />
          </Grid>
        </Grid>
      </motion.div>
    </PageContainer>
  );
};

export default AiAssistant;
