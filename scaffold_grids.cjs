const fs = require('fs');
const path = require('path');

const entities = [
  { name: 'Office', title: 'Offices', idField: 'OfficeId' },
  { name: 'Factory', title: 'Factories', idField: 'FactoryId' },
  { name: 'TransactionType', title: 'Transaction Types', idField: 'TransactionTypeId' },
  { name: 'PaymentTerm', title: 'Payment Terms', idField: 'PaymentTermId' },
  { name: 'PaymentMode', title: 'Payment Modes', idField: 'PaymentModeId' },
  { name: 'Incoterm', title: 'Incoterms', idField: 'IncotermId' },
  { name: 'TransportMode', title: 'Transport Modes', idField: 'TransportModeId' },
  { name: 'Composition', title: 'Composition', idField: 'CompositionId' },
  { name: 'BuyingDepartment', title: 'Buying Departments', idField: 'BuyingDepartmentId' }
];

const sectionsBase = path.join(__dirname, 'src/sections/Powertool');

entities.forEach(ent => {
  const sectionDir = path.join(sectionsBase, ent.name);
  
  // 1. Grid Component
  const gridCompCode = `import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Stack,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import { ConfirmDialog } from 'src/components/custom-dialog';

export default function ${ent.name}SheetGrid() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState(null);

  // MOCK DATA (Empty for now)
  const reportData = [];

  // Filter Data
  const filteredData = useMemo(() => {
    let filtered = reportData;
    if (filterStatus === 'Active') filtered = filtered.filter((r) => r.IsActive);
    if (filterStatus === 'Inactive') filtered = filtered.filter((r) => !r.IsActive);
    if (searchText) {
      filtered = filtered.filter((r) =>
        (r.Name || '').toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return filtered;
  }, [reportData, searchText, filterStatus]);

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleEdit = (id) => {
    navigate(paths.dashboard.Powertool.${ent.name}.edit(id));
  };

  const confirmDelete = () => {
    setDeleteId(null);
    // API Call goes here
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Search Bar */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <TextField
          placeholder="Search ${ent.title}..."
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: 1, md: 320 } }}
        />
        <Button variant="contained" onClick={() => navigate(paths.dashboard.Powertool.${ent.name}.new)}>
          + New ${ent.name}
        </Button>
      </Stack>

      {/* Tabs */}
      <Paper elevation={0} sx={{ mb: 2, borderRadius: '0 0 12px 12px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Tabs
          value={filterStatus}
          onChange={(e, val) => { setFilterStatus(val); setPage(0); }}
          sx={{
            px: 2,
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': { minHeight: 48, fontWeight: 600, fontSize: '0.875rem', textTransform: 'none' },
          }}
        >
          <Tab value="All" label={<Stack direction="row" spacing={1} alignItems="center"><Iconify icon="mdi:view-list-outline" /><span>All ({reportData.length})</span></Stack>} />
          <Tab value="Active" label={<Stack direction="row" spacing={1} alignItems="center"><Iconify icon="mdi:check-circle-outline" /><span>Active ({reportData.filter(r => r.IsActive).length})</span></Stack>} />
          <Tab value="Inactive" label={<Stack direction="row" spacing={1} alignItems="center"><Iconify icon="mdi:close-circle-outline" /><span>Inactive ({reportData.filter(r => !r.IsActive).length})</span></Stack>} />
        </Tabs>
      </Paper>

      {/* Table */}
      <Paper sx={{ width: '100%', borderRadius: 3, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>ID</TableCell>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>NAME</TableCell>
                <TableCell sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>STATUS</TableCell>
                <TableCell align="center" sx={{ bgcolor: 'background.neutral', fontWeight: 600, color: 'text.secondary' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <TableRow hover key={row.${ent.idField} || index}>
                    <TableCell>{row.${ent.idField}}</TableCell>
                    <TableCell>{row.Name}</TableCell>
                    <TableCell>
                      <Chip label={row.IsActive ? 'Active' : 'Inactive'} color={row.IsActive ? 'success' : 'error'} size="small" variant="soft" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(row.${ent.idField})} sx={{ color: 'primary.main' }}>
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => setDeleteId(row.${ent.idField})} sx={{ color: 'error.main' }}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">No ${ent.title} found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete ${ent.name}"
        content="Are you sure you want to delete this item?"
        action={<Button variant="contained" color="error" onClick={confirmDelete}>Delete</Button>}
      />
    </Box>
  );
}`;
  fs.writeFileSync(path.join(sectionDir, `${ent.name}-sheet-grid.jsx`), gridCompCode);

  // 2. Update List Component
  const listCompCode = `import React from 'react';
import { Box, Typography } from '@mui/material';
import ${ent.name}SheetGrid from './${ent.name}-sheet-grid';

export default function ${ent.name}List() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={3}>${ent.title}</Typography>
      <${ent.name}SheetGrid />
    </Box>
  );
}`;
  fs.writeFileSync(path.join(sectionDir, `${ent.name}-list.jsx`), listCompCode);

});
console.log('Grid Scaffolding complete.');
