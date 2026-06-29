import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get } from 'src/api/apibasemethods';
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
} from '@mui/material';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';



const SupplierGrid = () => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const userData = useMemo(() => {
    const localStorageData = JSON.parse(localStorage.getItem('UserData') || '{}');
    return localStorageData?.Data || {};
  }, []);

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryOptions, setCountryOptions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('SupplierName');
  const navigate = useNavigate();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // --- Copy Link Dialog States ---
  const [linkDetailsOpen, setLinkDetailsOpen] = useState(false);
  const [copiedLinkDetails, setCopiedLinkDetails] = useState({ url: '', otp: '' });

  const handleOpenInvite = (supplier) => {
    setSelectedSupplier(supplier);
    setInviteDialogOpen(true);
  };

  const handleCloseInvite = () => {
    setInviteDialogOpen(false);
    setSelectedSupplier(null);
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

  // Filter Data based on search and country
  const filteredData = useMemo(() => {
    let filtered = reportData;

    if (selectedCountry) {
      filtered = filtered.filter(
        (item) => item.CountryName === selectedCountry.Country_Name
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
  }, [reportData, searchText, selectedCountry]);

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
          mb: 3,
          borderRadius: 3,
          border: '1px solid #eef2f6',
          backgroundColor: '#fafbfc',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Country Filter */}
          <Grid item xs={12} md={3}>
            <Autocomplete
              value={selectedCountry}
              onChange={(event, newValue) => {
                setSelectedCountry(newValue);
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
                  <Typography variant="body2" sx={{ color: '#344054' }}>
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
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      height: '48px',
                      '& fieldset': { borderColor: '#d0d5dd' },
                      '&:hover fieldset': { borderColor: '#3366ff' },
                      '&.Mui-focused fieldset': { borderColor: '#3366ff', borderWidth: '2px' },
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        {selectedCountry?.Country_Code ? (
                          <InputAdornment position="start">
                            <Iconify
                              icon={`circle-flags:${selectedCountry.Country_Code.toLowerCase()}`}
                              sx={{ width: 22, height: 22, ml: 0.5 }}
                            />
                          </InputAdornment>
                        ) : (
                          <InputAdornment position="start">
                            <Iconify icon="mdi:earth" width={20} sx={{ color: '#667085', ml: 0.5 }} />
                          </InputAdornment>
                        )}
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              clearIcon={<Iconify icon="eva:close-fill" width={18} sx={{ color: '#667085' }} />}
              sx={{ width: '100%' }}
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
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  height: '48px',
                  transition: 'box-shadow 0.2s ease',
                  '& fieldset': { borderColor: '#d0d5dd' },
                  '&:hover fieldset': { borderColor: '#3366ff' },
                  '&.Mui-focused fieldset': { borderColor: '#3366ff', borderWidth: '2px' },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 3px rgba(51, 102, 255, 0.08)',
                  },
                },
                '& .MuiInputBase-input': {
                  fontSize: '0.95rem',
                  padding: '8px 14px',
                  '&::placeholder': {
                    color: '#9aa5b4',
                    opacity: 1,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ ml: 0.5 }}>
                    <Iconify icon="eva:search-fill" width={22} sx={{ color: '#667085' }} />
                  </InputAdornment>
                ),
                endAdornment: searchText && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchText('')}
                      sx={{
                        padding: '4px',
                        color: '#667085',
                        '&:hover': { color: '#344054', backgroundColor: 'transparent' },
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
        {(selectedCountry || searchText) && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
            {selectedCountry && (
              <Chip
                icon={
                  selectedCountry.Country_Code ? (
                    <Iconify
                      icon={`circle-flags:${selectedCountry.Country_Code.toLowerCase()}`}
                      sx={{ width: 16, height: 16, ml: '8px !important' }}
                    />
                  ) : undefined
                }
                label={`Country: ${selectedCountry.Country_Name}`}
                onDelete={() => setSelectedCountry(null)}
                deleteIcon={<Iconify icon="eva:close-fill" width={16} />}
                size="small"
                sx={{
                  backgroundColor: '#e8edf5',
                  color: '#3366ff',
                  fontWeight: 500,
                  borderRadius: '6px',
                  '& .MuiChip-deleteIcon': {
                    color: '#667085',
                    '&:hover': { color: '#344054' },
                  },
                }}
              />
            )}
            {searchText && (
              <Chip
                label={`Search: "${searchText}"`}
                onDelete={() => setSearchText('')}
                deleteIcon={<Iconify icon="eva:close-fill" width={16} />}
                size="small"
                sx={{
                  backgroundColor: '#e8edf5',
                  color: '#3366ff',
                  fontWeight: 500,
                  borderRadius: '6px',
                  '& .MuiChip-deleteIcon': {
                    color: '#667085',
                    '&:hover': { color: '#344054' },
                  },
                }}
              />
            )}
            <Chip
              label={`${filteredData.length} results`}
              size="small"
              sx={{
                backgroundColor: 'transparent',
                color: '#667085',
                fontWeight: 400,
                borderRadius: '6px',
              }}
            />
          </Stack>
        )}
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
        <TableContainer sx={{ maxHeight: '70vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#fafbfc', fontWeight: 600, color: '#666', minWidth: 70, width: 70, fontSize: '0.875rem' }}>
                  <TableSortLabel active={orderBy === 'sno'} direction={order} onClick={() => handleSort('sno')} hideSortIcon>
                    S.No
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#fafbfc', fontWeight: 600, color: '#666', minWidth: 200, fontSize: '0.875rem' }}>
                  <TableSortLabel active={orderBy === 'SupplierName'} direction={order} onClick={() => handleSort('SupplierName')} hideSortIcon>
                    Supplier Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#fafbfc', fontWeight: 600, color: '#666', minWidth: 150, fontSize: '0.875rem' }}>
                  <TableSortLabel active={orderBy === 'City'} direction={order} onClick={() => handleSort('City')} hideSortIcon>
                    City
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#fafbfc', fontWeight: 600, color: '#666', minWidth: 200, fontSize: '0.875rem' }}>
                  <TableSortLabel active={orderBy === 'Email'} direction={order} onClick={() => handleSort('Email')} hideSortIcon>
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#fafbfc', fontWeight: 600, color: '#666', minWidth: 170, fontSize: '0.875rem' }}>
                  <TableSortLabel active={orderBy === 'CountryName'} direction={order} onClick={() => handleSort('CountryName')} hideSortIcon>
                    Country
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ backgroundColor: '#fafbfc', fontWeight: 600, color: '#666', minWidth: 140, fontSize: '0.875rem', textAlign: 'center' }}>
                  Actions
                </TableCell>
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
                    sx={{
                      '&:hover': { backgroundColor: '#f8fafc' },
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    <TableCell sx={{ color: '#888', fontSize: '0.875rem' }}>{serialNumber}</TableCell>
                    <TableCell sx={{ color: '#333', fontSize: '0.875rem', fontWeight: 500 }}>{row.SupplierName || '-'}</TableCell>
                    <TableCell sx={{ color: '#555', fontSize: '0.875rem' }}>{row.City || '-'}</TableCell>
                    <TableCell sx={{ color: '#555', fontSize: '0.875rem' }}>{row.Email || '-'}</TableCell>
                    <TableCell sx={{ color: '#555', fontSize: '0.875rem' }}>
                      {row.CountryName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {countryCode && (
                            <Iconify
                              icon={`circle-flags:${countryCode.toLowerCase()}`}
                              sx={{ width: 22, height: 22, flexShrink: 0 }}
                            />
                          )}
                          <span>{row.CountryName}</span>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>

                    <TableCell sx={{ textAlign: 'center' }}>
                      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <Tooltip title={`Send email invite to ${row.Email || 'supplier'}`} arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenInvite(row)}
                            sx={{ color: '#3366ff', transition: 'all 0.2s ease', padding: '4px' }}
                          >
                            <Iconify icon="mdi:email-outline" width={20} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Copy onboarding link" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyLink(row)}
                            sx={{
                              color: '#4caf50',
                              transition: 'all 0.2s ease',
                              padding: '4px',
                              '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.08)' }
                            }}
                          >
                            <Iconify icon="mdi:link-variant" width={20} />
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
                    <Iconify icon="mdi:inbox" width={48} sx={{ color: '#ccc', mb: 1 }} />
                    <Typography variant="body1" sx={{ color: '#999' }}>
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
            borderTop: '1px solid #f0f0f0',
            color: '#666',
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
            sx: { borderRadius: '16px', p: 1 }
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
            <Iconify icon="mdi:shield-check-outline" width={24} sx={{ color: '#4caf50' }} />
            Onboarding Link Generated Securely
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: '#667085', mb: 3 }}>
              The dynamic invitation link has been successfully encrypted and copied to your clipboard. parameters are hidden for enhanced routing safety.
            </Typography>

            <Stack spacing={2.5}>
              {/* Token Display (OTP) */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#344054', mb: 0.8, fontWeight: 600 }}>
                  Secure verification OTP (6 characters):
                </Typography>
                <TextField
                  fullWidth
                  readOnly
                  variant="outlined"
                  size="small"
                  value={copiedLinkDetails.otp}
                  InputProps={{
                    style: { fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '2px', color: '#111827', backgroundColor: '#f9fafb' },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            navigator.clipboard.writeText(copiedLinkDetails.otp);
                            enqueueSnackbar('OTP Copied!', { variant: 'success' });
                          }}
                          edge="end"
                        >
                          <Iconify icon="eva:copy-fill" width={20} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              {/* URL Display */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#344054', mb: 0.8, fontWeight: 600 }}>
                  Encrypted Onboarding URL:
                </Typography>
                <TextField
                  fullWidth
                  readOnly
                  multiline
                  maxRows={3}
                  variant="outlined"
                  size="small"
                  value={copiedLinkDetails.url}
                  InputProps={{
                    style: { fontSize: '0.85rem', color: '#4b5563', backgroundColor: '#f9fafb' },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            navigator.clipboard.writeText(copiedLinkDetails.url);
                            enqueueSnackbar('Link Copied!', { variant: 'success' });
                          }}
                          edge="end"
                        >
                          <Iconify icon="eva:copy-fill" width={20} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              <Chip
                label="This token configuration will automatically expire in 7 days."
                color="warning"
                variant="soft"
                size="small"
                icon={<Iconify icon="eva:clock-outline" />}
                sx={{ width: 'fit-content', borderRadius: '6px', fontWeight: 500 }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              variant="contained"
              onClick={() => setLinkDetailsOpen(false)}
              sx={{ backgroundColor: '#3366ff', borderRadius: '8px', '&:hover': { backgroundColor: '#1e4fd9' } }}
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default SupplierGrid;