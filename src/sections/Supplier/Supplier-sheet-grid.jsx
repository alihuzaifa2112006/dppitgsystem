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
} from '@mui/material';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';

// Flag helper using flagcdn CDN
const getCountryFlag = (countryCode) => {
  if (!countryCode) return '';
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
};

const SupplierGrid = () => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData') || '{}'), []);
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

  const handleOpenInvite = (supplier) => {
    setSelectedSupplier(supplier);
    setInviteDialogOpen(true);
  };

  const handleCloseInvite = () => {
    setInviteDialogOpen(false);
    setSelectedSupplier(null);
  };

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

      console.log('Supplier Data Response:', response);

      if (response.status === 200 && response.data?.Success) {
        const suppliers = response.data?.Data || [];
        setReportData(suppliers);
        console.log('Suppliers loaded:', suppliers.length);
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

  // Handle Sort
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
                    <Box
                      component="img"
                      src={getCountryFlag(option.Country_Code)}
                      alt={option.Country_Name}
                      sx={{
                        width: 22,
                        height: 15,
                        objectFit: 'cover',
                        borderRadius: '2px',
                        flexShrink: 0,
                        boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }}
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
                        {/* Show selected flag inside the input */}
                        {selectedCountry?.Country_Code ? (
                          <InputAdornment position="start">
                            <Box
                              component="img"
                              src={getCountryFlag(selectedCountry.Country_Code)}
                              alt={selectedCountry.Country_Name}
                              sx={{
                                width: 22,
                                height: 15,
                                objectFit: 'cover',
                                borderRadius: '2px',
                                ml: 0.5,
                                boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
                              }}
                              onError={(e) => { e.target.style.display = 'none'; }}
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
                    <Box
                      component="img"
                      src={getCountryFlag(selectedCountry.Country_Code)}
                      alt=""
                      sx={{
                        width: 16,
                        height: 11,
                        objectFit: 'cover',
                        borderRadius: '2px',
                        ml: '8px !important',
                        boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }}
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
                <TableCell
                  sx={{
                    backgroundColor: '#fafbfc',
                    fontWeight: 600,
                    color: '#666',
                    minWidth: 70,
                    width: 70,
                    fontSize: '0.875rem',
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'sno'}
                    direction={order}
                    onClick={() => handleSort('sno')}
                    hideSortIcon
                  >
                    S.No
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#fafbfc',
                    fontWeight: 600,
                    color: '#666',
                    minWidth: 200,
                    fontSize: '0.875rem',
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'SupplierName'}
                    direction={order}
                    onClick={() => handleSort('SupplierName')}
                    hideSortIcon
                  >
                    Supplier Name
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#fafbfc',
                    fontWeight: 600,
                    color: '#666',
                    minWidth: 150,
                    fontSize: '0.875rem',
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'City'}
                    direction={order}
                    onClick={() => handleSort('City')}
                    hideSortIcon
                  >
                    City
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#fafbfc',
                    fontWeight: 600,
                    color: '#666',
                    minWidth: 200,
                    fontSize: '0.875rem',
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'Email'}
                    direction={order}
                    onClick={() => handleSort('Email')}
                    hideSortIcon
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#fafbfc',
                    fontWeight: 600,
                    color: '#666',
                    minWidth: 170,
                    fontSize: '0.875rem',
                  }}
                >
                  <TableSortLabel
                    active={orderBy === 'CountryName'}
                    direction={order}
                    onClick={() => handleSort('CountryName')}
                    hideSortIcon
                  >
                    Country
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: '#fafbfc',
                    fontWeight: 600,
                    color: '#666',
                    minWidth: 120,
                    fontSize: '0.875rem',
                    textAlign: 'center',
                  }}
                >
                  Send Invite
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => {
                const serialNumber = page * rowsPerPage + index + 1;
                // Resolve Country_Code from countryCodeMap using CountryName from supplier row
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
                    <TableCell sx={{ color: '#888', fontSize: '0.875rem' }}>
                      {serialNumber}
                    </TableCell>
                    <TableCell sx={{ color: '#333', fontSize: '0.875rem', fontWeight: 500 }}>
                      {row.SupplierName || '-'}
                    </TableCell>
                    <TableCell sx={{ color: '#555', fontSize: '0.875rem' }}>
                      {row.City || '-'}
                    </TableCell>
                    <TableCell sx={{ color: '#555', fontSize: '0.875rem' }}>
                      {row.Email || '-'}
                    </TableCell>
                    <TableCell sx={{ color: '#555', fontSize: '0.875rem' }}>
                      {row.CountryName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {countryCode && (
                            <Box
                              component="img"
                              src={getCountryFlag(countryCode)}
                              alt={row.CountryName}
                              sx={{
                                width: 22,
                                height: 15,
                                objectFit: 'cover',
                                borderRadius: '3px',
                                flexShrink: 0,
                                boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
                              }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <span>{row.CountryName}</span>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Tooltip title={`Send invite to ${row.Email || 'supplier'}`} arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenInvite(row)}
                          sx={{
                            color: '#3366ff',
                            '&:hover': {
                              backgroundColor: '#3366ff',
                              color: '#fff',
                            },
                            transition: 'all 0.2s ease',
                            padding: '4px',
                          }}
                        >
                          <Iconify icon="mdi:email-outline" width={20} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}

              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
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
        <SendInviteDialog
          open={inviteDialogOpen}
          onClose={handleCloseInvite}
          supplier={selectedSupplier}
        />
      </Paper>
    </Box>

  );
};

export default SupplierGrid;