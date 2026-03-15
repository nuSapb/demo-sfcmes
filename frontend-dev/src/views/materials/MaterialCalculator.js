import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { IconSettings } from '@tabler/icons';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import { fetchProjects, fetchComponentsByProjectId, fetchMaterialUnitPrices } from 'src/utils/api';
import FormulaDisplay from 'src/components/materials/FormulaDisplay';
import ProjectSelectionTable from 'src/components/materials/ProjectSelectionTable';
import MaterialSummaryCards from 'src/components/materials/MaterialSummaryCards';
import CostEstimationTable from 'src/components/materials/CostEstimationTable';
import UnitPriceSettings from 'src/components/materials/UnitPriceSettings';
import DashboardCard from 'src/components/shared/DashboardCard';

const BCrumb = [
  { to: '/', title: 'Home' },
  { title: 'Materials' },
  { title: 'Material Calculator' },
];

const MaterialCalculator = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [unitPrices, setUnitPrices] = useState({
    concrete: 3500,   // ฿ per m³
    steel: 25000,     // ฿ per ton
    formwork: 450,    // ฿ per m²
  });

  // Fetch projects and their component data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch unit prices from backend
        const pricesData = await fetchMaterialUnitPrices();
        if (pricesData) {
          setUnitPrices({
            concrete: pricesData.concrete || 3500,
            steel: pricesData.steel || 25000,
            formwork: pricesData.formwork || 450,
          });
        }
      } catch (err) {
        console.error('Error fetching material unit prices, using defaults:', err);
        // Use default prices if API fails
      }
    };

    const fetchProjectsData = async () => {
      try {
        const projectsData = await fetchProjects();

        // Fetch components for each project and calculate totals
        const projectsWithTotals = await Promise.all(
          projectsData.map(async (project) => {
            try {
              const components = await fetchComponentsByProjectId(project.id);

              const totals = components.reduce(
                (acc, comp) => {
                  acc.volume += comp.volume || 0;
                  acc.weight += comp.weight || 0;
                  acc.area += comp.area || 0;
                  acc.count += 1;
                  return acc;
                },
                { volume: 0, weight: 0, area: 0, count: 0 }
              );

              return {
                ...project,
                totalComponents: totals.count,
                totalVolume: totals.volume,
                totalWeight: totals.weight,
                totalArea: totals.area,
              };
            } catch (err) {
              console.error(`Error fetching components for project ${project.id}:`, err);
              return {
                ...project,
                totalComponents: 0,
                totalVolume: 0,
                totalWeight: 0,
                totalArea: 0,
              };
            }
          })
        );

        setProjects(projectsWithTotals);
      } catch (err) {
        console.error('Error fetching projects:', err);
        // Use mock data for testing
        const mockProjects = [
          {
            id: '1',
            name: 'โครงการสะพาน A',
            totalComponents: 60,
            totalVolume: 150,
            totalWeight: 4500,
            totalArea: 800,
          },
          {
            id: '2',
            name: 'โครงการอาคารชุด B',
            totalComponents: 45,
            totalVolume: 120,
            totalWeight: 3600,
            totalArea: 650,
          },
          {
            id: '3',
            name: 'โครงการถนน C',
            totalComponents: 80,
            totalVolume: 200,
            totalWeight: 6000,
            totalArea: 1000,
          },
          {
            id: '4',
            name: 'โครงการสนามไฟฟ้า D',
            totalComponents: 30,
            totalVolume: 90,
            totalWeight: 2700,
            totalArea: 500,
          },
        ];
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Fetch prices
    fetchProjectsData(); // Fetch projects
  }, []);

  // Calculate total materials from selected projects
  const calculatedMaterials = useMemo(() => {
    if (selectedProjects.length === 0) return null;

    const selectedProjectData = projects.filter((p) =>
      selectedProjects.includes(p.id)
    );

    const totals = selectedProjectData.reduce(
      (acc, project) => {
        acc.volume += project.totalVolume || 0;
        acc.weight += project.totalWeight || 0;
        acc.area += project.totalArea || 0;
        return acc;
      },
      { volume: 0, weight: 0, area: 0 }
    );

    const costs = {
      concrete: totals.volume * unitPrices.concrete,
      steel: totals.weight * unitPrices.steel,
      formwork: totals.area * unitPrices.formwork,
    };

    const grandTotal = costs.concrete + costs.steel + costs.formwork;

    return {
      quantities: totals,
      costs,
      grandTotal,
      projectCount: selectedProjects.length,
    };
  }, [selectedProjects, projects, unitPrices]);

  const handleProjectToggle = (projectId) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map((p) => p.id));
    }
  };

  const handlePricesSave = async (newPrices) => {
    try {
      // Try to save to backend
      const { updateMaterialUnitPrices } = await import('src/utils/api');
      await updateMaterialUnitPrices(newPrices);
      console.log('Unit prices saved to backend');
    } catch (err) {
      console.error('Error saving unit prices to backend, saving locally:', err);
    }
    // Always update local state
    setUnitPrices(newPrices);
    setSettingsOpen(false);
  };

  return (
    <PageContainer
      title="Material Calculator"
      description="Material calculation and purchase planning"
    >
      <Breadcrumb title="Material Calculator" items={BCrumb} />

      {loading && (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          เกิดข้อผิดพลาด: {error}
        </Alert>
      )}

      {!loading && !error && (
        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  Material Calculation & Purchase Planning
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Calculate materials needed across multiple projects
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<IconSettings size={20} />}
                onClick={() => setSettingsOpen(true)}
              >
                Unit Prices
              </Button>
            </Box>
          </Grid>

          {/* Formula Display */}
          <Grid item xs={12}>
            <FormulaDisplay />
          </Grid>

          {/* Project Selection */}
          <Grid item xs={12}>
            <DashboardCard title="Select Projects" subtitle="Choose projects for material calculation">
              <ProjectSelectionTable
                projects={projects}
                selectedProjects={selectedProjects}
                onToggleProject={handleProjectToggle}
                onSelectAll={handleSelectAll}
              />
            </DashboardCard>
          </Grid>

          {/* Material Summary and Cost Estimation */}
          {selectedProjects.length > 0 && calculatedMaterials && (
            <>
              <Grid item xs={12}>
                <MaterialSummaryCards materialData={calculatedMaterials} />
              </Grid>

              <Grid item xs={12}>
                <CostEstimationTable
                  materialData={calculatedMaterials}
                  unitPrices={unitPrices}
                />
              </Grid>
            </>
          )}

          {/* Empty State */}
          {selectedProjects.length === 0 && !loading && (
            <Grid item xs={12}>
              <Alert severity="info">
                เลือกโครงการอย่างน้อยหนึ่งโครงการเพื่อเริ่มการคำนวณวัสดุ
              </Alert>
            </Grid>
          )}
        </Grid>
      )}

      {/* Unit Price Settings Dialog */}
      <UnitPriceSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handlePricesSave}
        initialPrices={unitPrices}
      />
    </PageContainer>
  );
};

export default MaterialCalculator;
