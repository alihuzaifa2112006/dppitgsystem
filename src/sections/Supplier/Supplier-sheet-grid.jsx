import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get, Post } from 'src/api/apibasemethods';
import { useSettingsContext } from 'src/components/settings';
import SendInviteDialog from './SendInviteDialog';
import {
  Box,
  TextField,
  InputAdornment,
  Button,
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
  Autocomplete,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
} from '@mui/material';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';



const SupplierGrid = ({ onRefreshRef }) => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const userData = useMemo(() => {
    const localStorageData = JSON.parse(localStorage.getItem('UserData') || '{}');
    return localStorageData?.Data || {};
  }, []);

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('SupplierName');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // --- Copy Link Dialog States ---
  const [linkDetailsOpen, setLinkDetailsOpen] = useState(false);
  const [copiedLinkDetails, setCopiedLinkDetails] = useState({ url: '', otp: '' });

  // --- Edit Dialog States ---
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState({ supplierName: '', city: '', email: '', country: null });
  const [editSaving, setEditSaving] = useState(false);

  // --- Delete Dialog States ---
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleOpenEdit = (row) => {
    setEditRow(row);
    const matchedCountry = countryOptions.find(
      (c) => c.Country_Name === row.CountryName || String(c.Country_ID) === String(row.CountryID)
    ) || null;
    setEditForm({
      supplierName: row.SupplierName || '',
      city: row.City || '',
      email: row.Email || '',
      country: matchedCountry,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editRow) return;
    try {
      setEditSaving(true);
      const payload = {
        InvitationId: editRow.InvitationId,
        supplierName: editForm.supplierName,
        city: editForm.city,
        email: editForm.email,
        countryID: editForm.country ? parseInt(editForm.country.Country_ID, 10) : (editRow.CountryID || 0),
      };
      const response = await Post('Supplier/Update', payload);
      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Supplier updated successfully!', { variant: 'success' });
        setEditDialogOpen(false);
        fetchSupplierData();
      } else {
        enqueueSnackbar(response?.data?.Message || 'Update failed', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.Message || 'Error updating supplier', { variant: 'error' });
    } finally {
      setEditSaving(false);
    }
  };

  const handleOpenDelete = (row) => {
    setDeleteRow(row);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteRow) return;
    try {
      setDeleteLoading(true);
      const response = await Post('Supplier/Delete', { InvitationId: deleteRow.InvitationId });
      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Supplier deleted successfully!', { variant: 'success' });
        setDeleteDialogOpen(false);
        fetchSupplierData();
      } else {
        enqueueSnackbar(response?.data?.Message || 'Delete failed', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.Message || 'Error deleting supplier', { variant: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenInvite = (supplier) => {
    setSelectedSupplier(supplier);
    setInviteDialogOpen(true);
  };

  const handleCloseInvite = () => {
    setInviteDialogOpen(false);
    setSelectedSupplier(null);
    fetchSupplierData();
  };

  // --- SECURED: Copy Onboarding Link with Base64 Obfuscation ---
  const handleCopyLink = useCallback((row) => {
    try {
      const domain = window.location.origin;
      const companyID = userData?.company?.CompanyId || 0;
      const vendorID = row.VendorID || row.InvitationId || 0;

      // Generates a clean 6-character high-entropy alphanumeric OTP
      const generateSecureOTP = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No 0, O, I, L, 1
        const array = new Uint32Array(6);
        window.crypto.getRandomValues(array);
        return Array.from(array, (num) => chars[num % chars.length]).join('');
      };
      const secureOtp = generateSecureOTP();

      const gamblingMilliseconds = 7 * 24 * 60 * 60 * 1000;
      const expiryTimestamp = Date.now() + gamblingMilliseconds;

      // Create a plain query string or JSON payload to encode
      const rawPayload = `vendorID=${vendorID}&otp=${secureOtp}&expiry=${expiryTimestamp}&companyID=${companyID}`;

      // Base64 encoding to secure/hide values in URL
      const encodedToken = btoa(rawPayload);

      // Final dynamic secure onboarding link
      const onboardingUrl = `${domain}/supplier-onboarding?token=${encodedToken}`;

      // Clipboard logic
      navigator.clipboard.writeText(onboardingUrl);
      enqueueSnackbar('Secure onboarding link copied to clipboard!', { variant: 'success' });

      // Save configurations to state for the preview popup
      setCopiedLinkDetails({
        url: onboardingUrl,
        otp: secureOtp
      });
      setLinkDetailsOpen(true);

    } catch (error) {
      console.error('Failed to copy link:', error);
      enqueueSnackbar('Failed to generate or copy link', { variant: 'error' });
    }
  }, [enqueueSnackbar, userData]);

  // Navigate to Add Form
  const moveToAddForm = useCallback(() => {
    navigate(paths.dashboard.Onboarding.Supplier.new);
  }, [navigate]);

  // Navigate to Edit Form
  const moveToEditForm = useCallback(
    (InvitationId) => {
      navigate(paths.dashboard.Onboarding.Supplier.edit(InvitationId));
    },
    [navigate]
  );

  // Fetch Country Data
  const fetchCountryData = useCallback(async () => {
    try {
      const response = await Get('Country/GetAll');
      if (response.status === 200 && response.data?.Success) {
        const countries = response.data?.Data || [];
        setCountryOptions(countries);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  }, []);

  // Fetch Data from API - Supplier/GetAll
  const fetchSupplierData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get('Supplier/GetAll');

      if (response.status === 200 && response.data?.Success) {
        const suppliers = response.data?.Data || [];
        setReportData(suppliers);
      } else {
        setReportData([]);
        enqueueSnackbar(response.data?.Message || 'No records found', { variant: 'info' });
      }
    } catch (error) {
      console.error('Error fetching supplier data:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Failed to Load Data', { variant: 'error' });
      setReportData([]);
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchSupplierData();
    fetchCountryData();
  }, [fetchSupplierData, fetchCountryData]);

  // Expose refresh method via ref callback
  useEffect(() => {
    if (onRefreshRef) {
      onRefreshRef.current = fetchSupplierData;
    }
  }, [onRefreshRef, fetchSupplierData]);

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

  // Filter Data based on tab, search and multiple countries
  const filteredData = useMemo(() => {
    let filtered = reportData;

    // Filter by tab
    if (activeTab === 'pending') {
      filtered = filtered.filter((item) => !item.EmailSent);
    } else if (activeTab === 'emailed') {
      filtered = filtered.filter((item) => item.EmailSent === true);
    }

    // Filter by multiple countries
    if (selectedCountries.length > 0) {
      const selectedCountryNames = selectedCountries.map(c => c.Country_Name);
      filtered = filtered.filter(
        (item) => selectedCountryNames.includes(item.CountryName)
      );
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
  }, [reportData, searchText, selectedCountries, activeTab]);

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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>

      {/* Search and Filter Section */}
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
          {/* Country Filter - Multi Select */}
          <Grid item xs={12} md={3}>
            <Autocomplete
              multiple // Enable multi-select
              value={selectedCountries}
              onChange={(event, newValue) => {
                setSelectedCountries(newValue);
                setPage(0);
              }}
              options={countryOptions}
              getOptionLabel={(option) => option.Country_Name || ''}
              isOptionEqualToValue={(option, value) =>
                option.Country_ID === value?.Country_ID
              }
              renderOption={(props, option) => (
                <Box component="li" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }} {...props}>
                  {option.Country_Code && (
                    <Iconify
                      icon={`circle-flags:${option.Country_Code.toLowerCase()}`}
                      sx={{ width: 22, height: 22, flexShrink: 0 }}
                    />
                  )}
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    {option.Country_Name}
                  </Typography>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="All Countries"
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      minHeight: '48px',
                      '&:hover fieldset': { borderColor: 'primary.main' },
                      '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' },
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        {selectedCountries.length === 0 ? (
                          <InputAdornment position="start">
                            <Iconify icon="mdi:earth" width={20} sx={{ color: 'text.secondary', ml: 0.5 }} />
                          </InputAdornment>
                        ) : null}
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              clearIcon={<Iconify icon="eva:close-fill" width={18} sx={{ color: 'text.secondary' }} />}
              sx={{ width: '100%' }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.Country_ID}
                    icon={
                      option.Country_Code ? (
                        <Iconify
                          icon={`circle-flags:${option.Country_Code.toLowerCase()}`}
                          sx={{ width: 16, height: 16 }}
                        />
                      ) : undefined
                    }
                    label={option.Country_Name}
                    size="small"
                    color="primary"
                    variant="soft"
                    sx={{ fontWeight: 500, borderRadius: '6px' }}
                  />
                ))
              }
            />
          </Grid>

          {/* Search Field */}
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              placeholder="Search suppliers by name, city, email, or any field..."
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

        {/* Active Filters Display */}
        {(selectedCountries.length > 0 || searchText) && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
            {selectedCountries.map((country) => (
              <Chip
                key={country.Country_ID}
                icon={
                  country.Country_Code ? (
                    <Iconify
                      icon={`circle-flags:${country.Country_Code.toLowerCase()}`}
                      sx={{ width: 16, height: 16, ml: '8px !important' }}
                    />
                  ) : undefined
                }
                label={`Country: ${country.Country_Name}`}
                onDelete={() => {
                  setSelectedCountries(selectedCountries.filter(c => c.Country_ID !== country.Country_ID));
                }}
                deleteIcon={<Iconify icon="eva:close-fill" width={16} />}
                size="small"
                color="primary"
                variant="filled"
                sx={{ fontWeight: 500, borderRadius: '6px', color: 'white' }}
              />
            ))}
            {searchText && (
              <Chip
                label={`Search: "${searchText}"`}
                onDelete={() => setSearchText('')}
                deleteIcon={<Iconify icon="eva:close-fill" width={16} sx={{ color: 'white !important' }} />}
                size="small"
                color="primary"
                variant="filled"
                sx={{ fontWeight: 500, borderRadius: '6px', color: 'white' }}
              />
            )}
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

      {/* ── Tabs ── */}
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
          value={activeTab}
          onChange={(_, val) => { setActiveTab(val); setPage(0); }}
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
            value="all"
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
            value="pending"
            label={
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Iconify icon="mdi:clock-outline" width={18} />
                <span>Pending</span>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'inherit', lineHeight: 1 }}>
                  ({reportData.filter(r => !r.EmailSent).length})
                </Typography>
              </Stack>
            }
          />
          <Tab
            value="emailed"
            label={
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Iconify icon="mdi:email-check-outline" width={18} />
                <span>Emailed</span>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'inherit', lineHeight: 1 }}>
                  ({reportData.filter(r => r.EmailSent === true).length})
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
        <TableContainer sx={{ maxHeight: 420, overflowY: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', minWidth: 60, width: 60, fontSize: '0.875rem' }}>S.No</TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', minWidth: 180, fontSize: '0.875rem' }}>
                  <TableSortLabel active={orderBy === 'SupplierName'} direction={order} onClick={() => handleSort('SupplierName')} hideSortIcon>
                    Supplier Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', minWidth: 110, fontSize: '0.875rem' }}>Tier</TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', minWidth: 130, fontSize: '0.875rem' }}>Industry</TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', minWidth: 120, fontSize: '0.875rem' }}>City</TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', minWidth: 200, fontSize: '0.875rem' }}>Email</TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', minWidth: 150, fontSize: '0.875rem' }}>Country</TableCell>
                {/* <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', minWidth: 90, fontSize: '0.875rem', textAlign: 'center' }}>Invite Link</TableCell> */}
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', minWidth: 80, fontSize: '0.875rem', textAlign: 'center' }}>Send Invite</TableCell>
                <TableCell sx={{ backgroundColor: 'background.neutral', fontWeight: 600, color: 'text.secondary', minWidth: 100, fontSize: '0.875rem', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => {
                const serialNumber = page * rowsPerPage + index + 1;
                const countryCode = row.Country_Code || countryCodeMap[row.CountryName] || null;

                return (
                  <TableRow
                    key={row.InvitationId || index}
                    hover
                    sx={{ '&:last-child td': { borderBottom: 0 } }}
                  >
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{serialNumber}</TableCell>
                    <TableCell sx={{ color: 'text.primary', fontSize: '0.875rem', fontWeight: 500 }}>{row.SupplierName || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {row.TierName ? (
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            px: 1.2,
                            py: 0.3,
                            borderRadius: '6px',
                            bgcolor: (th) => `${th.palette.primary.main}14`,
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                          }}
                        >
                          {row.TierName}
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{row.IndustryName || '-'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{row.City || '-'}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{row.Email || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {row.CountryName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {countryCode && (
                            <Iconify icon={`circle-flags:${countryCode.toLowerCase()}`} sx={{ width: 22, height: 22, flexShrink: 0 }} />
                          )}
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>{row.CountryName}</Typography>
                        </Box>
                      ) : '-'}
                    </TableCell>

                    {/* ── Invite Link column (commented out) ──
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Tooltip title="Copy onboarding link" arrow>
                        <IconButton size="small" onClick={() => handleCopyLink(row)}
                          sx={{ color: 'success.main', padding: '4px' }}
                        >
                          <Iconify icon="mdi:link-variant" width={20} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                    */}

                    {/* ── Send Invite column ── */}
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Tooltip title={`Send invite to ${row.Email || 'supplier'}`} arrow>
                        <IconButton size="small" onClick={() => handleOpenInvite(row)}
                          sx={{ color: 'primary.main', padding: '4px' }}
                        >
                          <Iconify icon="mdi:email-arrow-right-outline" width={20} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                    {/* ── Actions: Edit + Delete ── */}
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                        <Tooltip title="Edit supplier" arrow>
                          <IconButton size="small" onClick={() => handleOpenEdit(row)}
                            sx={{ color: 'primary.main', padding: '4px' }}
                          >
                            <Iconify icon="solar:pen-bold" width={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete supplier" arrow>
                          <IconButton size="small" onClick={() => handleOpenDelete(row)}
                            sx={{ color: 'error.main', padding: '4px' }}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}

              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Iconify icon="mdi:inbox" width={48} sx={{ color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      No records found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-select': { borderRadius: 1 },
          }}
        />

        {/* Email Invite Dialog Component */}
        <SendInviteDialog
          open={inviteDialogOpen}
          onClose={handleCloseInvite}
          supplier={selectedSupplier}
        />

        {/* --- Link Generation Details Dialog Popup --- */}
        <Dialog
          open={linkDetailsOpen}
          onClose={() => setLinkDetailsOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: { borderRadius: '16px', p: 0 }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, pb: 0.5, px: 3, pt: 2.5 }}>
            <Iconify icon="mdi:shield-check-outline" width={22} sx={{ color: '#4caf50' }} />
            Invitation Link Generated
          </DialogTitle>

          <DialogContent sx={{ px: 3, pb: 1 }}>
            {/* Success message */}
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2.5 }}>
              ✓ Invitation link copied to clipboard
            </Typography>

            {/* Steps - simplified */}
            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  bgcolor: '#3366ff',
                  color: 'white',
                  borderRadius: '50%',
                  width: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>1</Box>
                <Typography variant="body2" sx={{ color: '#334155' }}>Share OTP</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  bgcolor: '#3366ff',
                  color: 'white',
                  borderRadius: '50%',
                  width: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>2</Box>
                <Typography variant="body2" sx={{ color: '#334155' }}>User enters OTP</Typography>
              </Box>
            </Box>

            {/* OTP - LARGE & CENTERED */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                One-Time Password
              </Typography>
              <Box sx={{
                fontFamily: 'monospace',
                fontSize: '3.5rem',
                fontWeight: 700,
                letterSpacing: '12px',
                color: '#0f172a',
                py: 1.5,
                my: 0.5,
                bgcolor: '#f1f5f9',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                position: 'relative'
              }}>
                {copiedLinkDetails.otp}
                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(copiedLinkDetails.otp);
                    enqueueSnackbar('OTP Copied!', { variant: 'success' });
                  }}
                  size="small"
                  sx={{
                    position: 'absolute',
                    right: 12,
                    bgcolor: 'white',
                    '&:hover': { bgcolor: '#e2e8f0' }
                  }}
                >
                  <Iconify icon="eva:copy-fill" width={18} />
                </IconButton>
              </Box>
            </Box>

            {/* Expiry */}
            <Chip
              label="Expires in 7 days"
              size="small"
              icon={<Iconify icon="eva:clock-outline" width={14} />}
              sx={{
                borderRadius: '6px',
                fontWeight: 400,
                bgcolor: '#fef3c7',
                color: '#92400e',
                '& .MuiChip-icon': { color: '#92400e' }
              }}
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
            <Button
              variant="contained"
              onClick={() => setLinkDetailsOpen(false)}
              sx={{
                bgcolor: '#3366ff',
                borderRadius: '8px',
                px: 4,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': { bgcolor: '#1e4fd9' }
              }}
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>

      {/* ── Edit Supplier Dialog ── */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 38, height: 38, borderRadius: '10px',
              bgcolor: (th) => `${th.palette.info.main}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Iconify icon="solar:pen-bold" width={20} sx={{ color: 'info.main' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>Edit Supplier</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Update supplier information below
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: '20px !important', pb: 2 }}>
          <Stack spacing={2.5}>

            {/* Supplier Name — full width */}
            <TextField
              label="Supplier Name"
              fullWidth
              value={editForm.supplierName}
              onChange={(e) => setEditForm((f) => ({ ...f, supplierName: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="mdi:domain" width={18} sx={{ color: 'text.secondary', mr: 0.5 }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* City + Country — side by side */}
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label="City"
                fullWidth
                value={editForm.city}
                onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mdi:city-variant-outline" width={18} sx={{ color: 'text.secondary', mr: 0.5 }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Autocomplete
                value={editForm.country}
                onChange={(_, newVal) => setEditForm((f) => ({ ...f, country: newVal }))}
                options={countryOptions}
                getOptionLabel={(o) => o.Country_Name || ''}
                isOptionEqualToValue={(o, v) => o.Country_ID === v?.Country_ID}
                renderOption={(props, option) => (
                  <Box component="li" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }} {...props}>
                    {option.Country_Code && (
                      <Iconify icon={`circle-flags:${option.Country_Code.toLowerCase()}`} sx={{ width: 20, height: 20, flexShrink: 0 }} />
                    )}
                    <Typography variant="body2">{option.Country_Name}</Typography>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Country"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            {editForm.country?.Country_Code ? (
                              <Iconify
                                icon={`circle-flags:${editForm.country.Country_Code.toLowerCase()}`}
                                sx={{ width: 20, height: 20, ml: 0.5 }}
                              />
                            ) : (
                              <Iconify icon="mdi:earth" width={18} sx={{ color: 'text.secondary', ml: 0.5 }} />
                            )}
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Box>

            {/* Email — full width */}
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="mdi:email-outline" width={18} sx={{ color: 'text.secondary', mr: 0.5 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, gap: 1.5 }}>
          <Button
            variant="outlined" color="inherit"
            onClick={() => setEditDialogOpen(false)}
            sx={{ borderRadius: 2, flex: 1, fontWeight: 600, py: 1.2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained" color="primary"
            onClick={handleSaveEdit}
            disabled={editSaving}
            startIcon={<Iconify icon="solar:disk-bold" width={18} />}
            sx={{ borderRadius: 2, flex: 1, fontWeight: 600, py: 1.2 }}
          >
            {editSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 0.5 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '10px',
              bgcolor: (th) => `${th.palette.error.main}1a`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Iconify icon="solar:trash-bin-trash-bold" width={22} sx={{ color: 'error.main' }} />
            </Box>
            <Typography variant="h6" fontWeight={700}>Delete Supplier</Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pb: 1.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete{' '}
            <strong>{deleteRow?.SupplierName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={() => setDeleteDialogOpen(false)}
            sx={{ borderRadius: 2, flex: 1, fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}
            disabled={deleteLoading}
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" width={18} />}
            sx={{ borderRadius: 2, flex: 1, fontWeight: 600 }}
          >
            {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

SupplierGrid.propTypes = {
  onRefreshRef: PropTypes.object,
};

export default SupplierGrid;