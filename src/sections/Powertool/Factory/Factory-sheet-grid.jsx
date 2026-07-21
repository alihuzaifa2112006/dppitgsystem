import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Delete, Get } from 'src/api/apibasemethods';
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
  TableSortLabel,
  Stack,
  Grid,
  Collapse,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider
} from '@mui/material';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Iconify from 'src/components/iconify';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';

function Row({ row, handleViewDetails, handleEditDetails, handleDelete, countryCodeMap }) {
  return (
    <TableRow hover sx={{ '& > *': { borderBottom: 'unset', whiteSpace: 'nowrap' } }}>
      <TableCell sx={{ color: 'text.primary', fontSize: '0.875rem', fontWeight: 500 }}>
        {row.FactoryName || '-'}
      </TableCell>
      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
        {row.LinkedSupplierName || '—'}
      </TableCell>
      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
        {row.Phone || '—'}
      </TableCell>
      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
        {row.Website || '—'}
      </TableCell>
      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
        <Chip
          label={row.IsActive ? 'Active' : 'Inactive'}
          color={row.IsActive ? 'success' : 'error'}
          size="small"
          variant="soft"
          sx={{ fontWeight: 600 }}
        />
      </TableCell>
      <TableCell
        sx={{
          textAlign: 'center',
          position: 'sticky',
          right: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
          boxShadow: (th) => `-2px 0 4px ${th.palette.divider}`,
        }}
      >
        <Tooltip title="View details" arrow>
          <IconButton
            size="small"
            onClick={() => handleViewDetails(row)}
            sx={{ color: 'text.secondary', padding: '4px' }}
          >
            <Iconify icon="solar:eye-bold" width={22} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit factory" arrow>
          <IconButton
            size="small"
            onClick={() => handleEditDetails(row.FactoryId || row.Id)}
            sx={{ color: 'primary.main', padding: '4px' }}
          >
            <Iconify icon="solar:pen-bold" width={22} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete factory" arrow>
          <IconButton
            size="small"
            onClick={() => handleDelete(row.FactoryId || row.Id)}
            sx={{ color: 'error.main', padding: '4px' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={22} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

Row.propTypes = {
  row: PropTypes.object.isRequired,
  handleViewDetails: PropTypes.func.isRequired,
  handleEditDetails: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  countryCodeMap: PropTypes.object.isRequired,
};

export default function FactorySheetGrid() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('FactoryName');

  const [filterStatus, setFilterStatus] = useState('All');
  const [deleteId, setDeleteId] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [countryOptions, setCountryOptions] = useState([]);

  // Fetch Country Options to get flags
  const fetchCountryOptions = useCallback(async () => {
    try {
      const res = await Get('Country/GetAll');
      if (res.status === 200) {
        setCountryOptions(res?.data?.Data || []);
      }
    } catch (error) {
      console.error('Error fetching country options:', error);
    }
  }, []);

  // Fetch Factories
  const fetchFactoryData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(`Factory/GetAll`);
      if (response.status === 200 && response.data?.Success) {
        const factories = response.data.Data || [];
        setReportData(factories);
      } else {
        setReportData([]);
      }
    } catch (error) {
      console.error('Error fetching factory data:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFactoryData();
    fetchCountryOptions();
  }, [fetchFactoryData, fetchCountryOptions]);

  // Build a lookup map: Country_Name -> Country_Code
  const countryCodeMap = useMemo(() => {
    const map = {};
    countryOptions.forEach((c) => {
      if (c.Country_Name && c.Country_Code) {
        map[c.Country_Name] = c.Country_Code;
      }
    });
    return map;
  }, [countryOptions]);

  // Filter Data
  const filteredData = useMemo(() => {
    let filtered = reportData;

    if (filterStatus === 'Active') {
      filtered = filtered.filter((item) => item.IsActive === true);
    } else if (filterStatus === 'Inactive') {
      filtered = filtered.filter((item) => item.IsActive === false);
    }

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some(
          (val) =>
            val &&
            (typeof val === 'string' || typeof val === 'number') &&
            val.toString().toLowerCase().includes(lowerSearch)
        )
      );
    }

    return filtered;
  }, [reportData, searchText, filterStatus]);

  // Sort Data
  const sortedData = useMemo(() => {
    if (!filteredData.length) return [];

    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';

      if (typeof aValue === 'string') {
        return order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return order === 'asc' ? aValue - bValue : bValue - aValue;
    });
    return sorted;
  }, [filteredData, order, orderBy]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, page, rowsPerPage]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditDetails = (id) => {
    navigate(paths.dashboard.Powertool.Factory.edit(id));
  };

  const handleViewDetails = (row) => {
    setViewData(row);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await Delete(`Factory/Delete?id=${deleteId}`);
      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Factory deleted successfully', { variant: 'success' });
        fetchFactoryData();
      } else {
        enqueueSnackbar('Error deleting factory', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting:', error);
      enqueueSnackbar('Error deleting factory', { variant: 'error' });
    }
    setDeleteId(null);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 0,
          borderRadius: '12px 12px 0 0',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Search factories by name, supplier, city, country..."
              variant="outlined"
              size="medium"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(0);
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  height: '48px',
                  transition: 'box-shadow 0.2s ease',
                  '&:hover fieldset': { borderColor: 'primary.main' },
                  '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' },
                  '&.Mui-focused': {
                    boxShadow: (th) => `0 0 0 3px ${th.palette.primary.main}14`,
                  },
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.95rem',
                  padding: '8px 14px',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ ml: 0.5 }}>
                    <Iconify icon="eva:search-fill" width={22} sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchText('')}
                      sx={{
                        padding: '4px',
                        color: 'text.secondary',
                        '&:hover': { color: 'text.primary', backgroundColor: 'transparent' },
                      }}
                    >
                      <Iconify icon="eva:close-fill" width={20} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {searchText && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label={`Search: "${searchText}"`}
              onDelete={() => setSearchText('')}
              deleteIcon={<Iconify icon="eva:close-fill" width={16} sx={{ color: 'white !important' }} />}
              size="small"
              color="primary"
              variant="filled"
              sx={{ fontWeight: 500, borderRadius: '6px', color: 'white' }}
            />
            <Chip
              label={`${filteredData.length} results`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 500, borderRadius: '6px' }}
            />
          </Stack>
        )}
      </Paper>

      <Paper
        elevation={0}
        sx={{
          mb: 2,
          mt: 0,
          borderRadius: '0 0 12px 12px',
          border: '1px solid',
          borderColor: 'divider',
          borderTop: 0,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={filterStatus}
          onChange={(_, val) => { setFilterStatus(val); setPage(0); }}
          sx={{
            px: 2,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTab-root': {
              minHeight: 48,
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              color: 'text.secondary',
              '&.Mui-selected': { color: 'primary.main' },
            },
          }}
        >
          <Tab
            value="All"
            label={
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Iconify icon="mdi:view-list-outline" width={18} />
                <span>All</span>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'inherit', lineHeight: 1 }}>
                  ({reportData.length})
                </Typography>
              </Stack>
            }
          />
          <Tab
            value="Active"
            label={
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Iconify icon="mdi:check-circle-outline" width={18} />
                <span>Active</span>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'inherit', lineHeight: 1 }}>
                  ({reportData.filter(r => r.IsActive).length})
                </Typography>
              </Stack>
            }
          />
          <Tab
            value="Inactive"
            label={
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Iconify icon="mdi:close-circle-outline" width={18} />
                <span>Inactive</span>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'inherit', lineHeight: 1 }}>
                  ({reportData.filter(r => !r.IsActive).length})
                </Typography>
              </Stack>
            }
          />
        </Tabs>
      </Paper>

      {/* Table */}
      <Paper
        sx={{
          width: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <TableContainer sx={{ maxHeight: 500, overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  <TableSortLabel active={orderBy === 'FactoryName'} direction={order} onClick={() => handleSort('FactoryName')} hideSortIcon>
                    FACTORY NAME
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  SUPPLIER
                </TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  PHONE
                </TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  WEBSITE
                </TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  STATUS
                </TableCell>
                <TableCell sx={{
                  backgroundColor: 'background.neutral',
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  position: 'sticky',
                  right: 0,
                  zIndex: 10,
                  boxShadow: (th) => `-2px 0 4px ${th.palette.divider}`,
                  width: 120,
                }}>
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <Row key={row.FactoryId || index} row={row} handleViewDetails={handleViewDetails} handleEditDetails={handleEditDetails} handleDelete={(id) => setDeleteId(id)} countryCodeMap={countryCodeMap} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      No Factories found.
                    </Typography>
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
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Factory"
        content="Are you sure you want to delete this factory? This action cannot be undone."
        action={
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Delete
          </Button>
        }
      />

      {/* View Details Dialog */}
      <Dialog open={!!viewData} onClose={() => setViewData(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Iconify icon="solar:buildings-3-bold" width={28} sx={{ color: 'primary.main' }} />
            <Typography variant="h6">Factory Details</Typography>
          </Stack>
          <IconButton onClick={() => setViewData(null)}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {viewData && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 2, fontWeight: 700 }}>
                  General Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Factory Name</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewData.FactoryName || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Supplier</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewData.LinkedSupplierName || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Status</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip label={viewData.IsActive ? 'Active' : 'Inactive'} color={viewData.IsActive ? 'success' : 'error'} size="small" variant="soft" />
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Phone</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewData.Phone || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Website</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewData.Website || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Created At</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewData.CreatedAt ? new Date(viewData.CreatedAt).toLocaleDateString() : '-'}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ borderStyle: 'dashed' }} />

              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 2, fontWeight: 700 }}>
                  Address & Operations
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Country</Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                      {countryCodeMap[viewData.CountryName] && <Iconify icon={`circle-flags:${countryCodeMap[viewData.CountryName].toLowerCase()}`} width={18} />}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewData.CountryName || '-'}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>City</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewData.CityName || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Products</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewData.ProductsCategories || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Capacity / Month</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{viewData.CapacityPerMonth || '-'}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {viewData.Contacts && viewData.Contacts.length > 0 && (
                <>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 2, fontWeight: 700 }}>
                      Contacts
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'background.neutral' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Cell No</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {viewData.Contacts.map((c, i) => (
                            <TableRow key={i}>
                              <TableCell>{c.ContactType || '-'}</TableCell>
                              <TableCell>{c.ContactName || '-'}</TableCell>
                              <TableCell>{c.Designation || '-'}</TableCell>
                              <TableCell>{c.CellNo || '-'}</TableCell>
                              <TableCell>{c.Email || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </>
              )}

              {viewData.SocialCertificates && viewData.SocialCertificates.length > 0 && (
                <>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 2, fontWeight: 700 }}>
                      Social Certificates
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'background.neutral' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Cert Type</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Audit Institute</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Certificate No</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Valid From</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Valid To</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Rating</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {viewData.SocialCertificates.map((sc, i) => (
                            <TableRow key={i}>
                              <TableCell>{sc.CertType || '-'}</TableCell>
                              <TableCell>{sc.AuditInstitute || '-'}</TableCell>
                              <TableCell>{sc.CertificateNo || '-'}</TableCell>
                              <TableCell>{sc.ValidFrom ? new Date(sc.ValidFrom).toLocaleDateString() : '-'}</TableCell>
                              <TableCell>{sc.ValidTo ? new Date(sc.ValidTo).toLocaleDateString() : '-'}</TableCell>
                              <TableCell>{sc.Rating || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </>
              )}

              {viewData.OekotexCertificates && viewData.OekotexCertificates.length > 0 && (
                <>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 2, fontWeight: 700 }}>
                      Oekotex Certificates
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'background.neutral' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Test Institute</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Certificate No</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Valid From</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Valid To</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Appendix</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Class Type</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {viewData.OekotexCertificates.map((oc, i) => (
                            <TableRow key={i}>
                              <TableCell>{oc.TestInstitute || '-'}</TableCell>
                              <TableCell>{oc.CertificateNo || '-'}</TableCell>
                              <TableCell>{oc.ValidFrom ? new Date(oc.ValidFrom).toLocaleDateString() : '-'}</TableCell>
                              <TableCell>{oc.ValidTo ? new Date(oc.ValidTo).toLocaleDateString() : '-'}</TableCell>
                              <TableCell>{oc.Appendix || '-'}</TableCell>
                              <TableCell>{oc.ClassType || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}