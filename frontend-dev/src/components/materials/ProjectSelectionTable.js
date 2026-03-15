import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Box,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconSearch } from '@tabler/icons';
import { useState } from 'react';

const ProjectSelectionTable = ({
  projects,
  selectedProjects,
  onToggleProject,
  onSelectAll,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const allSelected = projects.length > 0 && selectedProjects.length === projects.length;
  const someSelected = selectedProjects.length > 0 && selectedProjects.length < projects.length;

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Search Box */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Search projects..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} style={{ marginRight: 8 }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Table */}
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.03)',
              }}
            >
              <TableCell padding="checkbox" sx={{ fontWeight: 600 }}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={onSelectAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Project Name</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Components
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Volume (m³)
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Weight (tons)
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Area (m²)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  hover
                  sx={{
                    backgroundColor: selectedProjects.includes(project.id)
                      ? theme.palette.mode === 'dark'
                        ? 'rgba(33, 150, 243, 0.1)'
                        : 'rgba(33, 150, 243, 0.05)'
                      : 'inherit',
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => onToggleProject(project.id)}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {project.name}
                  </TableCell>
                  <TableCell align="right">
                    {project.totalComponents || 0}
                  </TableCell>
                  <TableCell align="right">
                    {(project.totalVolume || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {(project.totalWeight || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {(project.totalArea || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No projects found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default ProjectSelectionTable;
