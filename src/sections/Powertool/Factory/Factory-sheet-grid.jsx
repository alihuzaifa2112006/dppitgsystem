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
  Tab
} from '@mui/material';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Iconify from 'src/components/iconify';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';

function Row({ row, handleViewDetails, handleDelete, countryCodeMap }) {
  const [open, setOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [oekoOpen, setOekoOpen] = useState(false);
  const countryCode = countryCodeMap[row.CountryName] || '';

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset', whiteSpace: 'nowrap' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            <Iconify icon={open ? 'eva:arrow-down-fill' : 'eva:arrow-right-fill'} />
          </IconButton>
        </TableCell>
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
        <TableCell sx={{ fontSize: '0.875rem' }}>
          {row.CountryName ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {countryCode && (
                <Iconify
                  icon={`circle-flags:${countryCode.toLowerCase()}`}
                  sx={{ width: 22, height: 22, flexShrink: 0 }}
                />
              )}
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                {row.CountryName}
              </Typography>
            </Box>
          ) : (
            '—'
          )}
        </TableCell>
        <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          {row.CityName || '—'}
        </TableCell>
        <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          {row.ProductsCategories || '—'}
        </TableCell>
        <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          {row.CapacityPerMonth || '—'}
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
        <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          {row.CreatedAt ? new Date(row.CreatedAt).toLocaleDateString() : '—'}
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
          <Tooltip title="Edit factory" arrow>
            <IconButton
              size="small"
              onClick={() => handleViewDetails(row.FactoryId || row.Id)}
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

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1.5, border: '1px solid', borderColor: 'divider', overflowX: 'hidden' }}>
              <Stack spacing={2}>
                {/* Contacts */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ cursor: 'pointer', display: 'inline-flex' }} onClick={() => setContactsOpen(!contactsOpen)}>
                    <IconButton size="small">
                      <Iconify icon={contactsOpen ? 'eva:arrow-down-fill' : 'eva:arrow-right-fill'} />
                    </IconButton>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Contacts
                    </Typography>
                  </Stack>
                  <Collapse in={contactsOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 1, pl: 4 }}>
                      {row.Contacts && row.Contacts.length > 0 ? (
                        <TableContainer sx={{ maxHeight: 160, overflowY: 'auto', overflowX: 'hidden', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <Table size="small" stickyHeader sx={{ bgcolor: 'background.paper', width: '100%' }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Designation</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Cell No</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Email</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {row.Contacts.map((c, i) => (
                                <TableRow key={c.ContactId || i}>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{c.ContactType || '-'}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{c.ContactName || '-'}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{c.Designation || '-'}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{c.CellNo || '-'}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{c.Email || '-'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No contacts available.</Typography>
                      )}
                    </Box>
                  </Collapse>
                </Box>

                {/* Social Certificates */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ cursor: 'pointer', display: 'inline-flex' }} onClick={() => setSocialOpen(!socialOpen)}>
                    <IconButton size="small">
                      <Iconify icon={socialOpen ? 'eva:arrow-down-fill' : 'eva:arrow-right-fill'} />
                    </IconButton>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Social Certificates
                    </Typography>
                  </Stack>
                  <Collapse in={socialOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 1, pl: 4 }}>
                      {row.SocialCertificates && row.SocialCertificates.length > 0 ? (
                        <TableContainer sx={{ maxHeight: 160, overflowY: 'auto', overflowX: 'hidden', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <Table size="small" stickyHeader sx={{ bgcolor: 'background.paper', width: '100%' }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Cert Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Audit Institute</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Certificate No</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Valid From</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Valid To</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Rating</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {row.SocialCertificates.map((sc, i) => (
                                <TableRow key={sc.CertificateId || i}>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{sc.CertType || '-'}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{sc.AuditInstitute || '-'}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{sc.CertificateNo || '-'}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{sc.ValidFrom ? new Date(sc.ValidFrom).toLocaleDateString() : '-'}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{sc.ValidTo ? new Date(sc.ValidTo).toLocaleDateString() : '-'}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{sc.Rating || '-'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No social certificates available.</Typography>
                      )}
                    </Box>
                  </Collapse>
                </Box>

                {/* Oekotex Certificates */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ cursor: 'pointer', display: 'inline-flex' }} onClick={() => setOekoOpen(!oekoOpen)}>
                    <IconButton size="small">
                      <Iconify icon={oekoOpen ? 'eva:arrow-down-fill' : 'eva:arrow-right-fill'} />
                    </IconButton>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Oekotex Certificates
                    </Typography>
                  </Stack>
                  <Collapse in={oekoOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 1, pl: 4 }}>
                      {row.OekotexCertificates && row.OekotexCertificates.length > 0 ? (
                        <TableContainer sx={{ maxHeight: 160, overflowY: 'auto', overflowX: 'hidden', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <Table size="small" stickyHeader sx={{ bgcolor: 'background.paper', width: '100%' }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Test Institute</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Certificate No</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Valid From</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Valid To</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Appendix</TableCell>
                                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Class Type</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {row.OekotexCertificates.map((oc, i) => (
                                <TableRow key={oc.CertificateId || i}>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{oc.TestInstitute || '-'}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{oc.CertificateNo || '-'}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{oc.ValidFrom ? new Date(oc.ValidFrom).toLocaleDateString() : '-'}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{oc.ValidTo ? new Date(oc.ValidTo).toLocaleDateString() : '-'}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{oc.Appendix || '-'}</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem' }}>{oc.ClassType || '-'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No Oekotex certificates available.</Typography>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

Row.propTypes = {
  row: PropTypes.object.isRequired,
  handleViewDetails: PropTypes.func.isRequired,
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

  const handleViewDetails = (id) => {
    navigate(paths.dashboard.Powertool.Factory.edit(id));
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
          <Table stickyHeader sx={{ minWidth: 1400 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: 'background.neutral', width: 40 }} />
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
                  COUNTRY
                </TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  CITY
                </TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  PRODUCTS
                </TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  CAPACITY
                </TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  STATUS
                </TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                  CREATED AT
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
                  width: 100,
                }}>
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <Row key={row.FactoryId || index} row={row} handleViewDetails={handleViewDetails} handleDelete={(id) => setDeleteId(id)} countryCodeMap={countryCodeMap} />
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
    </Box>
  );
}