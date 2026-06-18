import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Checkbox,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { Stack } from '@mui/system';
import { Get, Post } from 'src/api/apibasemethods';
import Scrollbar from 'src/components/scrollbar';
import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ImportLCBillPaymentCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Date In SQL format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // State for form fields
  const [banks, setBanks] = useState([]);
  const [bbLCCurrencies, setBBLCCurrencies] = useState([]);

  const [isLoading, setLoading] = useState(true);

  // Pending Import Invoices states
  const [openInvoicesDialog, setOpenInvoicesDialog] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [selectedInvoiceRows, setSelectedInvoiceRows] = useState([]);
  const [tempSelectedInvoiceRows, setTempSelectedInvoiceRows] = useState([]);
  const [invoicesDataList, setInvoicesDataList] = useState([]);
  const [invoiceNoFilter, setInvoiceNoFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [filteredInvoicesData, setFilteredInvoicesData] = useState([]);
  const [currentInvoicesPage, setCurrentInvoicesPage] = useState(1);
  const rowsPerPageInvoices = 10;

  const ImportLCBillPaymentSchema = Yup.object().shape({
    PaymentNo: Yup.string().required('Payment No is required'),
    PaymentDate: Yup.date().required('Payment Date is required'),
    OpeningBank: Yup.object().required('Opening Bank is required'),
    Currency: Yup.object().required('Currency is required'),
    totalInvoiceValue: Yup.number().required('Total Invoice Value is required'),
    invoiceRowData: Yup.array().of(Yup.object().shape({
      BankRefNo: Yup.string().required('Bank Ref. No is required'),
      BankRefDate: Yup.date().required('Bank Ref. Date is required'),
      AcceptanceValue: Yup.number().required('Acceptance Value is required'),
      AdvancedPaid: Yup.number().required('Advanced Paid is required'),
      ConversionRate: Yup.number().required('Conversion Rate is required'),
    })),
  });

  const methods = useForm({
    resolver: yupResolver(ImportLCBillPaymentSchema),
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  // API functions for form fields

  const GetBanks = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetBankList?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (response.data.Success) {
        setBanks(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setBanks([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);


  const GetBBLCCurrencies = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetCurrencies?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (response.data.Success) {
        setBBLCCurrencies(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setBBLCCurrencies([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);


  // Fetch Pending Import Invoices
  const GetPendingImportInvoices = useCallback(async () => {
    setDialogLoading(true);
    try {
      const response = await Get(
        `CommercialModule/GetPendingImportInvoices?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (Array.isArray(response.data)) {
        setInvoicesDataList(response.data || []);
      } else if (response.data?.Success && Array.isArray(response.data.Data)) {
        setInvoicesDataList(response.data.Data || []);
      } else {
        setInvoicesDataList([]);
      }
    } catch (error) {
      console.log(error);
      setInvoicesDataList([]);
      enqueueSnackbar('Failed to fetch Pending Import Invoices', { variant: 'error' });
    } finally {
      setDialogLoading(false);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  // Helper functions for Pending Import Invoices
  const getInvoiceRowId = (row) => row.CommercialInvoiceID;

  const handleSelectInvoiceRow = (row) => {
    const rowId = getInvoiceRowId(row);
    const isSelectedInTemp = tempSelectedInvoiceRows.some((selected) => getInvoiceRowId(selected) === rowId);
    const isSelectedInFinal = selectedInvoiceRows.some((selected) => getInvoiceRowId(selected) === rowId);

    if (isSelectedInFinal) {
      enqueueSnackbar('This invoice is already in your final selection', { variant: 'warning' });
      return;
    }

    let updatedSelectedRows;
    if (isSelectedInTemp) {
      updatedSelectedRows = tempSelectedInvoiceRows.filter((selected) => getInvoiceRowId(selected) !== rowId);
    } else {
      updatedSelectedRows = [...tempSelectedInvoiceRows, row];
    }
    setTempSelectedInvoiceRows(updatedSelectedRows);
  };

  const handleRemoveInvoiceRow = (row) => {
    const rowId = getInvoiceRowId(row);
    const updatedSelectedRows = selectedInvoiceRows.filter((selected) => getInvoiceRowId(selected) !== rowId);
    setSelectedInvoiceRows(updatedSelectedRows);
    // Clear form values for removed row
    setValue(`invoiceRowData.${rowId}.PaymentAmount`, undefined);
  };

  const handleInvoicesPageChange = (event, value) => setCurrentInvoicesPage(value);

  const handleClearInvoiceFilters = () => {
    setInvoiceNoFilter('');
    setSupplierFilter('');
  };

  const handleOpenInvoicesDialog = () => {
    handleClearInvoiceFilters();
    setTempSelectedInvoiceRows(selectedInvoiceRows);
    setOpenInvoicesDialog(true);
    GetPendingImportInvoices();
  };

  const handleAddInvoices = () => {
    if (tempSelectedInvoiceRows?.length === 0) {
      enqueueSnackbar('Please select at least one invoice.', { variant: 'error' });
      return;
    }

    const newRows = tempSelectedInvoiceRows.filter(
      (tempRow) =>
        !selectedInvoiceRows.some((selectedRow) => getInvoiceRowId(selectedRow) === getInvoiceRowId(tempRow))
    );

    if (newRows.length === 0) {
      enqueueSnackbar('All selected invoices are already added', { variant: 'warning' });
      return;
    }

    // Initialize payment amount for new rows in form state
    newRows.forEach((row) => {
      const rowId = getInvoiceRowId(row);
      setValue(`invoiceRowData.${rowId}.PaymentAmount`, row.PayableAmount || '');
    });

    setSelectedInvoiceRows((prev) => [...prev, ...newRows]);
    setTempSelectedInvoiceRows([]);
    setOpenInvoicesDialog(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        GetBanks(),
        GetBBLCCurrencies(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [
    GetBanks,
    GetBBLCCurrencies,
  ]);

  // Filter Pending Import Invoices data based on filters
  useEffect(() => {
    if (invoicesDataList.length > 0) {
      let filtered = invoicesDataList;

      // Filter by Invoice No
      if (invoiceNoFilter) {
        filtered = filtered.filter((item) =>
          item.InvoiceNo?.toLowerCase().includes(invoiceNoFilter.toLowerCase()) ||
          item.CommercialInvoiceNo?.toLowerCase().includes(invoiceNoFilter.toLowerCase())
        );
      }

      // Filter by Supplier Name
      if (supplierFilter) {
        filtered = filtered.filter((item) =>
          item.SupplierName?.toLowerCase().includes(supplierFilter.toLowerCase())
        );
      }

      setFilteredInvoicesData(filtered);
      setCurrentInvoicesPage(1);
    } else {
      setFilteredInvoicesData([]);
    }
  }, [invoicesDataList, invoiceNoFilter, supplierFilter]);


  const SaveImportLCBillPayment = async (dataToSend) => {
    try {
      const response = await Post(
        'CommercialModule/SaveImportPayment',
        dataToSend
      );
      return response;
    } catch (error) {
      console.error('Error saving Import LC Bill Payment:', error);
      throw error;
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    // Validate at least one invoice is selected
    if (selectedInvoiceRows.length === 0) {
      enqueueSnackbar('Please select at least one invoice', { variant: 'warning' });
      return;
    }


    // Build Invoices array from selected invoices
    const invoices = selectedInvoiceRows.map((row) => {
      const rowId = getInvoiceRowId(row);
      const rowData = data.invoiceRowData?.[rowId] || {};

      return {
        CommercialInvoiceID: row.CommercialInvoiceID || 0,
        ImportLCID: row.ImportLCID || 0,
        InvoiceValue: parseFloat(row.InvoiceValue || 0),
        AcceptanceValue: parseFloat(rowData.AcceptanceValue || 0),
        AdvancedPaid: parseFloat(rowData.AdvancedPaid || 0),
        AlreadyPaid: parseFloat(row.AlreadyPaid || 0),
        PayableAmount: parseFloat(row.PayableAmount || 0),
        PaidAmount: parseFloat(rowData.PaidAmount || 0),
        ConversionRate: parseFloat(rowData.ConversionRate || 0),
      };
    });

    // Calculate TotalPaidAmount from all invoices
    const totalPaidAmount = invoices.reduce((sum, invoice) => sum + (invoice.PaidAmount || 0), 0);

    // Log data for debugging
    console.log('Form Data:', data);

    const dataToSend = {
      PaymentNo: data.PaymentNo || '', // Will be generated by backend
      PaymentDate: data.PaymentDate ? formatDate(data.PaymentDate) : null,
      BankID: data.OpeningBank?.BankID || null,
      CurrencyID: data.Currency?.Currency_ID || null,
      ExchangeRate: parseFloat(data.exchangeRate || 0),
      TotalInvoiceValue: parseFloat(data.totalInvoiceValue || 0),
      TotalPaidAmount: totalPaidAmount,
      Remarks: data.remarks || '',
      CreatedBy: userData?.userDetails?.userId || 1,
      // eslint-disable-next-line
      Org_ID: userData?.userDetails?.orgId || 1,
      // eslint-disable-next-line
      Branch_ID: userData?.userDetails?.branchID || 6,
      Invoices: invoices,





    };

    // Log final payload
    console.log('Final Payload to Send:', JSON.stringify(dataToSend, null, 2));

    try {
      const response = await SaveImportLCBillPayment(dataToSend);
      console.log('API Response:', response);

      if (response.data.Success || response.status === 200) {
        enqueueSnackbar('Import LC Bill Payment saved successfully!', { variant: 'success' });
        reset();
        router.push(paths.dashboard.Commercial.import.ImportLCBillPayment?.root || paths.dashboard.root);
      } else {
        enqueueSnackbar(response.data?.Message || 'Failed to save Import LC Bill Payment', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error saving Import LC Bill Payment:', error);
      console.error('Error Response:', error.response);

      if (error.response?.status === 400) {
        enqueueSnackbar(error.response.data?.Message || 'Validation error', { variant: 'error' });
      } else {
        enqueueSnackbar(error.response?.data?.Message || 'Error saving Import LC Bill Payment', { variant: 'error' });
      }
    }
  });
  const renderLoading = (
    <LoadingScreen
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
      }}
    />
  );

  // Paginated Pending Import Invoices data
  const paginatedInvoicesData = useMemo(() => {
    const startIndex = (currentInvoicesPage - 1) * rowsPerPageInvoices;
    return filteredInvoicesData.slice(startIndex, startIndex + rowsPerPageInvoices);
  }, [filteredInvoicesData, currentInvoicesPage, rowsPerPageInvoices]);

  // -----------------------------------------------------------

  return isLoading ? (
    renderLoading
  ) : (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              {/* <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ mb: 1, color: 'red' }}>
                  Please make sure the WIC is created in the system before creating a new quotation.
                </Typography>
              </Box> */}
              <h3>General Information</h3>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                }}
              >





                <RHFTextField name='PaymentNo' label='Payment No' fullWidth />

                <Controller
                  name="PaymentDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Payment Date"
                      format="dd MMM yyyy"
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                        },
                      }}
                    />
                  )}
                />
                <RHFAutocomplete
                  name="OpeningBank"
                  label="Opening Bank"
                  placeholder="Choose an option"
                  fullWidth
                  options={banks}
                  getOptionLabel={(option) => option?.BankName || ''}
                  isOptionEqualToValue={(option, value) => option?.BankID === value?.BankID}
                  loading={isLoading}
                  value={values?.OpeningBank || null}
                />
                <RHFAutocomplete
                  name="Currency"
                  label="Currency"
                  placeholder="Choose an option"
                  fullWidth
                  options={bbLCCurrencies}
                  getOptionLabel={(option) => option?.Currency_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.Currency_ID === value?.Currency_ID}
                  loading={isLoading}
                  value={values?.Currency || null}
                />
                <RHFTextField name='totalInvoiceValue' label='Total Invoice Value' fullWidth />

                <RHFTextField name='remarks' label='Remarks' fullWidth multiline rows={3} sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 3' } }} />
              </Box>

            </Card>

            {/* Pending Import Invoices Section */}
            <Card sx={{ mt: 3, p: 2 }}>
              <Box>
                <Box display="flex" flexWrap="wrap" justifyContent="space-between">
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    Pending Import Invoices
                  </Typography>

                  {/* Add Invoices Button */}
                  <Box
                    rowGap={3}
                    columnGap={2}
                    display="flex"
                    flexWrap="wrap"
                    justifyContent="space-between"
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleOpenInvoicesDialog}
                    >
                      Add Invoices
                    </Button>
                  </Box>
                </Box>

                {/* Popup Dialog */}
                <Dialog open={openInvoicesDialog} fullWidth maxWidth="lg">
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <DialogTitle sx={{ mt: 2 }}>Select Pending Import Invoices</DialogTitle>
                    <DialogTitle>
                      <IconButton onClick={() => setOpenInvoicesDialog(false)}>
                        <Iconify icon="mingcute:close-line" />
                      </IconButton>
                    </DialogTitle>
                  </Box>
                  {dialogLoading ? (
                    <LoadingScreen sx={{ mb: 5 }} />
                  ) : (
                    <>
                      <DialogContent>
                        {/* Filter Toolbar */}
                        <Card sx={{ p: 2 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 2,
                              alignItems: 'center',
                              borderRadius: 1,
                              flexWrap: 'wrap',
                            }}
                          >
                            {/* Invoice No Filter */}
                            <TextField
                              label="Filter by Invoice No"
                              value={invoiceNoFilter}
                              onChange={(e) => setInvoiceNoFilter(e.target.value)}
                              sx={{ minWidth: 200 }}
                              placeholder="Enter Invoice No"
                            />

                            {/* Supplier Filter */}
                            <TextField
                              label="Filter by Supplier"
                              value={supplierFilter}
                              onChange={(e) => setSupplierFilter(e.target.value)}
                              sx={{ minWidth: 200 }}
                              placeholder="Enter Supplier Name"
                            />

                            {/* Clear Filters Button
                            <Button
                              variant="outlined"
                              onClick={handleClearInvoiceFilters}
                              size="small"
                              sx={{ height: 40 }}
                            >
                              Clear Filters
                            </Button> */}
                          </Box>
                        </Card>

                        {/* Data Table Inside Dialog */}
                        {filteredInvoicesData.length > 0 && (
                          <Scrollbar>
                            <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 400 }}>
                              <Table stickyHeader>
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ minWidth: 80 }}>Select</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Commercial Invoice No</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Invoice No</TableCell>
                                    <TableCell sx={{ minWidth: 120 }}>Invoice Date</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Supplier Name</TableCell>
                                    <TableCell sx={{ minWidth: 120 }}>BB/Import LC No</TableCell>
                                    <TableCell sx={{ minWidth: 130, textAlign: 'right' }}>
                                      Invoice Value
                                    </TableCell>
                                    <TableCell sx={{ minWidth: 130, textAlign: 'right' }}>
                                      Already Paid
                                    </TableCell>
                                    <TableCell sx={{ minWidth: 150, textAlign: 'right' }}>
                                      Payable Amount
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {paginatedInvoicesData.map((row, index) => {
                                    const rowId = getInvoiceRowId(row);
                                    return (
                                      <TableRow key={index}>
                                        <TableCell>
                                          <Checkbox
                                            checked={tempSelectedInvoiceRows.some(
                                              (selected) => getInvoiceRowId(selected) === rowId
                                            )}
                                            onChange={() => handleSelectInvoiceRow(row)}
                                          />
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                          {row.CommercialInvoiceNo}
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                          {row.InvoiceNo}
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                          {row.InvoiceDate ? fDate(row.InvoiceDate) : '-'}
                                        </TableCell>
                                        <Tooltip title={row.SupplierName || '-'} arrow>
                                          <TableCell
                                            sx={{
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              maxWidth: 200,
                                            }}
                                          >
                                            {row.SupplierName}
                                          </TableCell>
                                        </Tooltip>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                          {row.BBImportLCNo}
                                        </TableCell>
                                        <TableCell
                                          sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                        >
                                          {fNumber(row.InvoiceValue)}
                                        </TableCell>
                                        <TableCell
                                          sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                        >
                                          {row.AlreadyPaid}
                                        </TableCell>
                                        <TableCell
                                          sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                        >
                                          {fNumber(row.PayableAmount)}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Scrollbar>
                        )}

                        {/* No Data Message */}
                        {filteredInvoicesData.length === 0 && invoicesDataList.length === 0 && (
                          <Box sx={{ textAlign: 'center', p: 3 }}>
                            <Typography variant="body1" color="text.secondary">
                              No pending invoices found.
                            </Typography>
                          </Box>
                        )}

                        {/* Pagination */}
                        {filteredInvoicesData.length > rowsPerPageInvoices && (
                          <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
                            <Pagination
                              count={Math.ceil(filteredInvoicesData.length / rowsPerPageInvoices)}
                              page={currentInvoicesPage}
                              onChange={handleInvoicesPageChange}
                              color="primary"
                            />
                          </Box>
                        )}
                      </DialogContent>
                      <DialogActions>
                        <Button variant="contained" onClick={handleAddInvoices}>
                          Add Invoices
                        </Button>
                      </DialogActions>
                    </>
                  )}
                </Dialog>
                {/* Selected Items Displayed Outside */}
                {selectedInvoiceRows.length > 0 && (
                  <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ p: 2 }}>
                      Selected Invoices
                    </Typography>

                    <Scrollbar>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ minWidth: 80 }}>Remove</TableCell>
                            <TableCell sx={{ minWidth: 150 }}>Commercial Invoice No</TableCell>
                            <TableCell sx={{ minWidth: 150 }}>Invoice No</TableCell>
                            <TableCell sx={{ minWidth: 120 }}>Invoice Date</TableCell>
                            <TableCell sx={{ minWidth: 130 }}>Bank Ref. No</TableCell>
                            <TableCell sx={{ minWidth: 130 }}>Bank Ref. Date</TableCell>
                            <TableCell sx={{ minWidth: 150 }}>Supplier Name</TableCell>
                            <TableCell sx={{ minWidth: 130 }}>BB/Import LC No</TableCell>
                            <TableCell sx={{ minWidth: 130 }} align="right">
                              Invoice Value
                            </TableCell>
                            <TableCell sx={{ minWidth: 160 }} align="right">
                              Acceptance Value
                            </TableCell>
                            <TableCell sx={{ minWidth: 130 }} align="right">
                              Advanced Paid
                            </TableCell>
                            <TableCell sx={{ minWidth: 130 }} align="right">
                              Already Paid
                            </TableCell>
                            <TableCell sx={{ minWidth: 150 }} align="right">
                              Payable Amount
                            </TableCell>
                            <TableCell sx={{ minWidth: 150 }} align="right">
                              Paid Amount
                            </TableCell>
                            <TableCell sx={{ minWidth: 150 }} align="right">
                              Conversion Rate
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedInvoiceRows.map((row, index) => {
                            const rowId = getInvoiceRowId(row);
                            return (
                              <TableRow key={index}>
                                <TableCell>
                                  <IconButton
                                    color="error"
                                    onClick={() => handleRemoveInvoiceRow(row)}
                                  >
                                    <Iconify icon="solar:trash-bin-trash-bold" />
                                  </IconButton>
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  {row.CommercialInvoiceNo}
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  {row.InvoiceNo}
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  {row.InvoiceDate ? fDate(row.InvoiceDate) : '-'}
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  <RHFTextField name={`invoiceRowData.${rowId}.BankRefNo`} fullWidth />
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  <Controller
                                    name={`invoiceRowData.${rowId}.BankRefDate`}

                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                      <DesktopDatePicker
                                        {...field}
                                        format="dd MMM yyyy"
                                        onChange={(newValue) => {
                                          field.onChange(newValue);
                                        }}
                                        slotProps={{
                                          textField: {
                                            fullWidth: true,
                                            error: !!error,
                                            helperText: error?.message,
                                          },
                                        }}
                                      />
                                    )}
                                  />
                                </TableCell>
                                <Tooltip title={row.SupplierName || '-'} arrow>
                                  <TableCell
                                    sx={{
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      maxWidth: 200,
                                    }}
                                  >
                                    {row.SupplierName}
                                  </TableCell>
                                </Tooltip>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  {row.BBImportLCNo}
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                  {fNumber(row.InvoiceValue)}
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                  <RHFTextField name={`invoiceRowData.${rowId}.AcceptanceValue`} fullWidth />
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                  <RHFTextField name={`invoiceRowData.${rowId}.AdvancedPaid`} fullWidth />
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                  {row.AlreadyPaid}
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                  {fNumber(row.PayableAmount)}
                                </TableCell>

                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                  {fNumber(row.InvoiceValue - row.AlreadyPaid)}
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                  <RHFTextField name={`invoiceRowData.${rowId}.ConversionRate`} fullWidth />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Scrollbar>
                  </TableContainer>
                )}
              </Box>
            </Card>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
              >
                Save
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
