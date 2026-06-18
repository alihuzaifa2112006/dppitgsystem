import * as Yup from 'yup';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
} from 'src/components/hook-form';
import { Get, Post } from 'src/api/apibasemethods';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import {
  Checkbox,
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
} from '@mui/material';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { fNumber } from 'src/utils/format-number';
import { LoadingScreen } from 'src/components/loading-screen';
import { useTable } from 'src/components/table';
import { fDate } from 'src/utils/format-time';

export default function DocRealizationAdd() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [submissionTypes, setSubmissionTypes] = useState([]);
  const [banks, setBanks] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // Define Head Groups
  const HeadGroups = [
    { id: 1, name: "Deduction Head" },
    { id: 2, name: "Distribution Head" },
    { id: 3, name: "Charges Head" },
  ];

  // Initialize realization details with three default rows - one for each head group
  const getDefaultRealizationDetails = () => [
    {
      HeadGroupID: 1,
      HeadDescription: '',
      CalculateOn: '',
      AmountInFC: '',
      AmountInINR: '',
      ConversionRate: '',
      AccountSource: '',
      Remarks: '',
      IsActive: true,
      CreatedBy: userData?.userDetails?.userId || 1,
      isDefault: true // Mark as default row that can't be deleted
    },
    {
      HeadGroupID: 2,
      HeadDescription: '',
      CalculateOn: '',
      AmountInFC: '',
      AmountInINR: '',
      ConversionRate: '',
      AccountSource: '',
      Remarks: '',
      IsActive: true,
      CreatedBy: userData?.userDetails?.userId || 1,
      isDefault: true // Mark as default row that can't be deleted
    },
    {
      HeadGroupID: 3,
      HeadDescription: '',
      CalculateOn: '',
      AmountInFC: '',
      AmountInINR: '',
      ConversionRate: '',
      AccountSource: '',
      Remarks: '',
      IsActive: true,
      CreatedBy: userData?.userDetails?.userId || 1,
      isDefault: true // Mark as default row that can't be deleted
    }
  ];

  // State for realization details
  const [realizationDetails, setRealizationDetails] = useState(getDefaultRealizationDetails());

  // Validation schema
  const DocSubmitSchema = Yup.object().shape({
    // DCRealizationNo: Yup.string().required('DC Realization No is required'),
    Currency: Yup.object().required('Currency is required'),
    DDRate: Yup.number()
      .required('DD Rate is required')
      .min(0, 'DD Rate must be positive'),
    PRCNo: Yup.string().required('PRC No is required'),
    SubmissionDate: Yup.date().required('Submission date is required'),
    SubmissionBank: Yup.object().required('Submission bank is required'),
    FinalPaymentRecvDate: Yup.date().required('Final payment received date is required'),
  });

  // Fetch reference data
  const GetSubmissionTypes = useCallback(async () => {
    try {
      const res = await Get(`CommercialModule/GetSubmissionType?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`);
      setSubmissionTypes(res?.data.Data);
    } catch (error) {
      console.error('Error fetching submission types:', error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetBanks = useCallback(async () => {
    try {
      const res = await Get(
        `CommercialModule/GetBankList?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setBanks(res?.data?.Data);
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  }, [userData]);

  const GetCurrencies = useCallback(async () => {
    try {
      const res = await Get(
        `CommercialModule/GetCurrencies?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setCurrencies(res?.data?.Data);
    } catch (error) {
      console.error('Error fetching currencies:', error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetch = async () => {
      await Promise.all([
        GetSubmissionTypes(),
        GetBanks(),
        GetCurrencies(),
      ]);
      setLoading(false);
    };
    fetch();
  }, [GetSubmissionTypes, GetBanks, GetCurrencies]);

  const defaultValues = useMemo(
    () => ({
      Branch_ID: userData?.userDetails?.branchID || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
      isActive: true,
      CreatedBy: userData?.userDetails?.userId || 1,
      SubmissionDate: new Date(),
      FinalPaymentRecvDate: new Date(),
      DDRate: 0,
      TotalInvoiceValue: 0,
      DCRealizationNo: '',
      PRCNo: '',
    }),
    [userData]
  );

  const methods = useForm({
    resolver: yupResolver(DocSubmitSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    watch,
    control,
    formState: { isSubmitting },
  } = methods;

  const values = watch();
  const [selectedRows, setSelectedRows] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tempSelectedRows, setTempSelectedRows] = useState([]);
  const rowsPerPage = 10;

  function formatDateForAPI(date) {
    if (!date) return null;
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // State for filters
  const [exportInvoiceNoFilter, setExportInvoiceNoFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [open, setOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalRealizeAmount, setTotalRealizeAmount] = useState(0);
  const [totalBalanceAmount, setTotalBalanceAmount] = useState(0);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Filter data based on filters
  useEffect(() => {
    if (dataList.length > 0) {
      let filtered = dataList;

      if (exportInvoiceNoFilter) {
        filtered = filtered.filter((item) =>
          item.ExportInvoiceNo?.toLowerCase().includes(exportInvoiceNoFilter.toLowerCase())
        );
      }

      setFilteredData(filtered);
      setCurrentPage(1);
    } else {
      setFilteredData([]);
    }
  }, [dataList, exportInvoiceNoFilter]);

  // Clear filters function
  const handleClearFilters = () => {
    setExportInvoiceNoFilter('');
  };

  const handleConfirmAddDetails = async () => {
    if (!tempSelectedRows || tempSelectedRows.length === 0) {
      enqueueSnackbar('Please select at least one row.', { variant: 'error' });
      return;
    }

    try {
      const newRows = tempSelectedRows.filter(
        (tempRow) =>
          !selectedRows.some((selectedRow) => getRowId(selectedRow) === getRowId(tempRow))
      );

      if (newRows.length === 0) {
        enqueueSnackbar('All selected items are already added', { variant: 'warning' });
        setConfirmOpen(false);
        return;
      }

      setConfirmOpen(false);
      setSelectedRows((prev) => [...prev, ...newRows]);
      setTempSelectedRows([]);
      setOpen(false);
      setDataList([]);
    } catch (error) {
      console.error('Error in confirm add:', error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  const handleOpenMenu = () => {
    if (tempSelectedRows?.length === 0) {
      enqueueSnackbar('Please select at least one row.', { variant: 'error' });
      return;
    }
    setConfirmOpen(true);
  };

  const handleGetData = async () => {
    setDialogLoading(true);
    try {
      const apiUrl = `CommercialModule/GetPendingInvoices_BankMaturity?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`;
      const response = await Get(apiUrl);
      setDataList(response.data.Data);
    } catch (error) {
      console.error('Error fetching export invoice data:', error);
      setDataList([]);
      enqueueSnackbar('Failed to fetch export invoice data', { variant: 'error' });
    } finally {
      setDialogLoading(false);
    }
  };

  const getRowId = (row) => `${row.ExportInvoiceID}_${row.ExportInvoiceNo}`;

  const handleSelectRow = (row) => {
    const rowId = getRowId(row);
    const isSelectedInTemp = tempSelectedRows.some((selected) => getRowId(selected) === rowId);
    const isSelectedInFinal = selectedRows.some((selected) => getRowId(selected) === rowId);

    if (isSelectedInFinal) {
      enqueueSnackbar('This item is already in your final selection', { variant: 'warning' });
      return;
    }

    let updatedSelectedRows;
    if (isSelectedInTemp) {
      updatedSelectedRows = tempSelectedRows.filter((selected) => getRowId(selected) !== rowId);
    } else {
      updatedSelectedRows = [...tempSelectedRows, row];
    }

    setTempSelectedRows(updatedSelectedRows);
  };

  const handleRemoveRow = (row) => {
    const rowId = getRowId(row);
    const updatedSelectedRows = selectedRows.filter((selected) => getRowId(selected) !== rowId);
    setSelectedRows(updatedSelectedRows);
  };

  // Handle Pagination
  const handlePageChange = (event, value) => setCurrentPage(value);

  useEffect(() => {
    const totals = selectedRows.reduce(
      (acc, row) => {
        acc.totalAmount += parseFloat(row.TotalAmount) || 0;
        acc.totalRealizeAmount += parseFloat(row.RealizeAmount) || 0;
        acc.totalBalanceAmount += parseFloat(row.BalanceAmountFC) || 0;
        return acc;
      },
      { totalAmount: 0, totalRealizeAmount: 0, totalBalanceAmount: 0 }
    );

    setTotalAmount(totals.totalAmount);
    setTotalRealizeAmount(totals.totalRealizeAmount);
    setTotalBalanceAmount(totals.totalBalanceAmount);

    // Set form values
    setValue('TotalInvoiceValue', totals.totalAmount);
  }, [selectedRows, setValue]);

  const handleAddRealizationDetail = () => {
    const newDetail = {
      HeadGroupID: '',
      HeadDescription: '',
      CalculateOn: '',
      AmountInFC: '',
      AmountInINR: '',
      ConversionRate: values.DDRate || '',
      AccountSource: '',
      Remarks: '',
      IsActive: true,
      CreatedBy: userData?.userDetails?.userId || 1,
      isDefault: false // Mark as additional row that can be deleted
    };
    setRealizationDetails([...realizationDetails, newDetail]);
  };

  const handleDeleteRealizationDetail = (index) => {
    // Prevent deletion of default rows (first three rows)
    if (realizationDetails[index]?.isDefault) {
      enqueueSnackbar('Default head group rows cannot be deleted', { variant: 'warning' });
      return;
    }

    const updatedDetails = realizationDetails.filter((_, i) => i !== index);
    setRealizationDetails(updatedDetails);
  };

  // Calculate INR amount when FC amount or conversion rate changes
  useEffect(() => {
    const updatedDetails = realizationDetails.map(detail => {
      const amountFC = parseFloat(detail.AmountInFC) || 0;
      const conversionRate = parseFloat(detail.ConversionRate) || parseFloat(values.DDRate) || 1;
      const amountINR = amountFC * conversionRate;

      return {
        ...detail,
        AmountInINR: amountINR.toFixed(2),
        ConversionRate: conversionRate.toString()
      };
    });
    setRealizationDetails(updatedDetails);
  },
  // eslint-disable-next-line
  [values.DDRate]);

  // Open/Close Dialog
  const handleOpen = () => {
    handleClearFilters();
    setTempSelectedRows(selectedRows);
    setOpen(true);
    handleGetData();
  };

  // Table
  const table = useTable();

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  // Form submission - UPDATED FOR NEW API STRUCTURE
  // Form submission - UPDATED FOR NEW API STRUCTURE
  // Form submission - Using local state for realization details
  // Form submission - Include all default rows
  const onSubmit = handleSubmit(async (data) => {
    try {

      if (!selectedRows || selectedRows.length === 0) {
        enqueueSnackbar('Please select at least one export invoice to proceed.', {
          variant: 'error'
        });
        return;
      }
      const details = realizationDetails.map(detail => ({
        HeadGroupID: detail.HeadGroupID || 0,
        HeadDescription: detail.HeadDescription || '',
        CalculateOn: detail.CalculateOn || '',
        AmountInFC: parseFloat(detail.AmountInFC) || 0,
        AmountInINR: parseFloat(detail.AmountInINR) || 0,
        ConversionRate: parseFloat(detail.ConversionRate) || parseFloat(data.DDRate) || 1,
        AccountSource: detail.AccountSource || '',
        Remarks: detail.Remarks || '',
        Org_ID: userData?.userDetails?.orgId || 1,
        Branch_ID: userData?.userDetails?.branchID || 1
      }));

      console.log('All realization details:', realizationDetails);
      console.log('Processed details:', details);

      // Rest of your payload preparation remains the same...
      const masterData = {
        CurrencyID: data.Currency?.Currency_ID || 0,
        DDRate: parseFloat(data.DDRate) || 0,
        TotalInvoiceValue: parseFloat(totalAmount) || 0,
        FinalPaymentRecvDate: formatDateForAPI(data.FinalPaymentRecvDate),
        SubmissionBankID: data.SubmissionBank?.BankID || 0,
        PRCNo: data.PRCNo,
        SubmissionDate: formatDateForAPI(data.SubmissionDate),
        CreatedBy: userData?.userDetails?.userId || 1,
        Org_ID: userData?.userDetails?.orgId || 1,
        Branch_ID: userData?.userDetails?.branchID || 1
      };

      const invoices = selectedRows.map(row => ({
        ExportInvoiceID: row.ExportInvoiceID,
        InvoiceValueFC: parseFloat(row.TotalAmount) || 0,
        AdvanceReceivedFC: parseFloat(row.AdvanceReceived) || 0,
        NegotiatedAdjFC: parseFloat(row.NegotiatedAmount) || 0,
        RealizeAmountFC: parseFloat(row.RealizeAmount) || 0,
        RealizeAmountINR: (parseFloat(row.RealizeAmount) || 0) * (parseFloat(data.DDRate) || 1),
        BalanceAmountFC: parseFloat(row.BalanceAmountFC) || 0,
        BankRefNo: data.DCRealizationNo,
        Remarks: `Realization for ${row.ExportInvoiceNo}`,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID
      }));

      const payload = {
        Master: masterData,
        Invoices: invoices,
        Details: details
      };

      console.log('Submitting payload:', payload);

      const response = await Post('CommercialModule/InsertExportLCRealization', payload);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Export LC Realization added successfully', { variant: 'success' });
        navigate(paths.dashboard.Commercial.export.DocumentRealization.root);
      } else {
        enqueueSnackbar('Error adding export LC realization', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      enqueueSnackbar('Error adding export LC realization', { variant: 'error' });
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

  // Get head group name by ID
  const getHeadGroupName = (headGroupId) => {
    const headGroup = HeadGroups.find(hg => hg.id === headGroupId);
    return headGroup ? headGroup.name : '';
  };

  return isLoading ? (
    renderLoading
  ) : (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Document Realization Information */}
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
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
              <Typography
                variant="h6"
                sx={{
                  p: 2,
                  my: 0.5,
                  borderBottom: '1px solid #e0e0e0',
                  width: 1,
                  gridColumn: {
                    xs: 'span 1',
                    sm: 'span 2',
                    md: 'span 3',
                  },
                }}
              >
                Document Realization Information
              </Typography>

              {/* <RHFTextField 
                name="DCRealizationNo" 
                label="DC Realization No" 
              /> */}

              <Controller
                control={control}
                name="FinalPaymentRecvDate"
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Final Payment Rec. Date"
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
                name="SubmissionBank"
                label="Submission Bank"
                options={banks}
                getOptionLabel={(option) => option.BankName}
                isOptionEqualToValue={(option, value) =>
                  option.BankID === value.BankID
                }
              />

              <RHFTextField name="PRCNo" label="PRC No." />

              <Controller
                control={control}
                name="SubmissionDate"
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Submission Date"
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

              <RHFTextField
                name="TotalInvoiceValue"
                label="Total Invoice Value"
                type="number"
                disabled
                value={totalAmount || 0}
              />

              <RHFAutocomplete
                name="Currency"
                label="Currency"
                options={currencies}
                getOptionLabel={(option) => option.Currency_Name || option.name || ''}
                isOptionEqualToValue={(option, value) =>
                  option.Currency_ID === value.Currency_ID || option.id === value.id
                }
              />

              <RHFTextField name="DDRate" label="OD Rate" type="number" />

            </Box>
          </Card>
        </Grid>

        {/* Export Invoice Information Section - Keep as is */}
        <Grid xs={12} md={12}>
          <Card sx={{ mt: 3, p: 2 }}>
            <Box>
              <Box display="flex" flexWrap="wrap" justifyContent="space-between">
                <Typography variant="h5" sx={{ mb: 1 }}>
                  Attached Submitted Invoices 
                </Typography>

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
                    onClick={handleOpen}
                  >
                    Add Submitted Invoice Details
                  </Button>
                </Box>
              </Box>

              {/* Popup Dialog */}
              <Dialog open={open} fullWidth maxWidth="lg">
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <DialogTitle sx={{ mt: 2 }}>Select Submitted Invoice Details</DialogTitle>
                  <DialogTitle>
                    <IconButton onClick={() => setOpen(false)}>
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
                          <TextField
                            label="Filter by Export Invoice No"
                            value={exportInvoiceNoFilter}
                            onChange={(e) => setExportInvoiceNoFilter(e.target.value)}
                            sx={{ minWidth: 200 }}
                            placeholder="Enter Export Invoice No"
                          />

                          {/* <TextField
                            label="Filter by Purpose"
                            value={purposeFilter}
                            onChange={(e) => setPurposeFilter(e.target.value)}
                            sx={{ minWidth: 200 }}
                            placeholder="Enter Purpose"
                          /> */}

                          <Button
                            variant="outlined"
                            onClick={handleClearFilters}
                            size="small"
                            sx={{ height: 40 }}
                          >
                            Clear Filters
                          </Button>
                        </Box>
                      </Card>

                      {/* Data Table Inside Dialog */}
                      {filteredData.length > 0 && (
                        <Scrollbar>
                          <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 400 }}>
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ minWidth: 80 }}>Select</TableCell>
                                  <TableCell sx={{ minWidth: 120 }}>Export Invoice No</TableCell>
                                  <TableCell sx={{ minWidth: 120 }}>Total Amount</TableCell>
                                  <TableCell sx={{ minWidth: 120 }}>Advance Received</TableCell>
                                  <TableCell sx={{ minWidth: 120 }}>Negotiated Amount</TableCell>
                                  <TableCell sx={{ minWidth: 120 }}>Realize Amount</TableCell>
                                  <TableCell sx={{ minWidth: 120 }}>Balance Amount</TableCell>
                                  <TableCell sx={{ minWidth: 150 }}>Purpose</TableCell>
                                  <TableCell sx={{ minWidth: 150 }}>Submission Type</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {paginatedData.map((row, index) => {
                                  const rowId = getRowId(row);
                                  return (
                                    <TableRow key={index}>
                                      <TableCell>
                                        <Checkbox
                                          checked={tempSelectedRows.some(
                                            (selected) => getRowId(selected) === rowId
                                          )}
                                          onChange={() => handleSelectRow(row)}
                                        />
                                      </TableCell>
                                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        {row.ExportInvoiceNo}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        {fNumber(row.TotalAmount) || 0}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        {fNumber(row.AdvanceReceived) || 0}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        {fNumber(row.NegotiatedAmount) || 0}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        {fNumber(row.RealizeAmount) || 0}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                        {fNumber(row.BalanceAmountFC) || 0}
                                      </TableCell>
                                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        {row.PurposeName}
                                      </TableCell>
                                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        {row.SubmissionTypeName}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Scrollbar>
                      )}

                      {filteredData.length === 0 && dataList.length === 0 && (
                        <Box sx={{ textAlign: 'center', p: 3 }}>
                          <Typography variant="body1" color="text.secondary">
                            No data found matching your filters.
                          </Typography>
                        </Box>
                      )}

                      {filteredData.length > rowsPerPage && (
                        <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
                          <Pagination
                            count={Math.ceil(filteredData.length / rowsPerPage)}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                          />
                        </Box>
                      )}
                    </DialogContent>
                    <DialogActions>
                      <Button variant="contained" onClick={handleOpenMenu}>
                        Add Details
                      </Button>
                    </DialogActions>
                  </>
                )}
              </Dialog>

              {/* Selected Items Displayed Outside */}
              {selectedRows.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ p: 2 }}>
                    Selected Submitted Invoices
                  </Typography>

                  <Scrollbar>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ minWidth: 125 }}>Export Invoice No</TableCell>
                          <TableCell sx={{ minWidth: 120 }} align="right">Total Amount</TableCell>
                          <TableCell sx={{ minWidth: 120 }} align="right">Advance Received</TableCell>
                          <TableCell sx={{ minWidth: 120 }} align="right">Negotiated Amount</TableCell>
                          <TableCell sx={{ minWidth: 120 }} align="right">Realize Amount</TableCell>
                          <TableCell sx={{ minWidth: 120 }} align="right">Balance Amount</TableCell>
                          <TableCell sx={{ minWidth: 150 }}>Purpose</TableCell>
                          <TableCell sx={{ minWidth: 150 }}>Submission Type</TableCell>
                          <TableCell sx={{ minWidth: 80 }}>Remove</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedRows.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.ExportInvoiceNo}</TableCell>
                            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                              {fNumber(row.TotalAmount) || 0}
                            </TableCell>
                            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                              {fNumber(row.AdvanceReceived) || 0}
                            </TableCell>
                            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                              {fNumber(row.NegotiatedAmount) || 0}
                            </TableCell>
                            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                              {fNumber(row.RealizeAmount) || 0}
                            </TableCell>
                            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                              {fNumber(row.BalanceAmountFC) || 0}
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.PurposeName}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.SubmissionTypeName}</TableCell>
                            <TableCell>
                              <IconButton color="error" onClick={() => handleRemoveRow(row)}>
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Scrollbar>

                  {/* Summary Section */}
                  <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" gutterBottom>
                          <strong>Total Invoices:</strong> {selectedRows.length}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" gutterBottom>
                          <strong>Total Amount:</strong> {fNumber(totalAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" gutterBottom>
                          <strong>Total Realize Amount:</strong> {fNumber(totalRealizeAmount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="subtitle1" gutterBottom>
                          <strong>Total Balance:</strong> {fNumber(totalBalanceAmount)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </TableContainer>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Realization Details Section - UPDATED */}
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
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
              <Typography
                variant="h6"
                sx={{
                  p: 2,
                  my: 0.5,
                  borderBottom: '1px solid #e0e0e0',
                  width: 1,
                  gridColumn: {
                    xs: 'span 1',
                    sm: 'span 2',
                    md: 'span 3',
                  },
                }}
              >
                Realization Details
              </Typography>

              <Box sx={{ gridColumn: { sm: 'span 2', md: 'span 3' } }}>
                <TableContainer component={Paper}>
                  <Scrollbar>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ minWidth: 150 }}>Head Group</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Head Description</TableCell>
                          <TableCell sx={{ minWidth: 150 }}>Calculate On</TableCell>
                          <TableCell sx={{ minWidth: 120 }}>Amount in FC</TableCell>
                          <TableCell sx={{ minWidth: 120 }}>Amount in TK</TableCell>
                          <TableCell sx={{ minWidth: 130 }}>Conversion Rate</TableCell>
                          <TableCell sx={{ minWidth: 150 }}>Account Source</TableCell>
                          <TableCell sx={{ minWidth: 150 }}>Remarks</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {realizationDetails.map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {/* For default rows, show as disabled text field */}
                              {detail.isDefault ? (
                                <RHFTextField
                                  name={`realizationDetails[${index}].HeadGroup`}
                                  label="Head Group"
                                  value={getHeadGroupName(detail.HeadGroupID)}
                                  disabled
                                  InputProps={{
                                    readOnly: true,
                                  }}
                                />
                              ) : (
                                <RHFAutocomplete
                                  name={`realizationDetails[${index}].HeadGroupID`}
                                  label="Head Group"
                                  options={HeadGroups}
                                  getOptionLabel={(option) => option.name || ''}
                                  isOptionEqualToValue={(option, value) => option.id === value.id}
                                  value={HeadGroups.find(hg => hg.id === detail.HeadGroupID) || null}
                                  onChange={(event, newValue) => {
                                    const updatedDetails = [...realizationDetails];
                                    updatedDetails[index].HeadGroupID = newValue?.id;
                                    setRealizationDetails(updatedDetails);
                                    // Update form value
                                    setValue(`realizationDetails[${index}].HeadGroupID`, newValue?.id);
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`realizationDetails[${index}].HeadDescription`}
                                label="Head Description"
                                value={detail.HeadDescription}
                                onChange={(event) => {
                                  const updatedDetails = [...realizationDetails];
                                  updatedDetails[index].HeadDescription = event.target.value;
                                  setRealizationDetails(updatedDetails);
                                  // Update form value
                                  setValue(`realizationDetails[${index}].HeadDescription`, event.target.value);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <RHFAutocomplete
                                name={`realizationDetails[${index}].CalculateOn`}
                                label="Calculate on"
                                options={[
                                  { id: 1, name: "FC" },
                                  { id: 2, name: "LC" },
                                  { id: 3, name: "Rate" }
                                ]}
                                getOptionLabel={(option) => option.name || ''}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={detail.CalculateOn ? { id: 1, name: detail.CalculateOn } : null}
                                onChange={(event, newValue) => {
                                  const updatedDetails = [...realizationDetails];
                                  updatedDetails[index].CalculateOn = newValue?.name;
                                  setRealizationDetails(updatedDetails);
                                  // Update form value
                                  setValue(`realizationDetails[${index}].CalculateOn`, newValue?.name);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`realizationDetails[${index}].AmountInFC`}
                                label="Amount in FC"
                                type="number"
                                value={detail.AmountInFC}
                                onChange={(event) => {
                                  const updatedDetails = [...realizationDetails];
                                  updatedDetails[index].AmountInFC = event.target.value;
                                  // Auto-calculate INR amount
                                  const amountFC = parseFloat(event.target.value) || 0;
                                  const conversionRate = parseFloat(updatedDetails[index].ConversionRate) || parseFloat(values.DDRate) || 1;
                                  updatedDetails[index].AmountInINR = (amountFC * conversionRate).toFixed(2);
                                  setRealizationDetails(updatedDetails);

                                  // Update form values
                                  setValue(`realizationDetails[${index}].AmountInFC`, event.target.value);
                                  setValue(`realizationDetails[${index}].AmountInINR`, updatedDetails[index].AmountInINR);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`realizationDetails[${index}].AmountInINR`}
                                label="Amount in TK"
                                type="number"
                                value={detail.AmountInINR || ''}
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`realizationDetails[${index}].ConversionRate`}
                                label="Conversion Rate"
                                type="number"
                                value={detail.ConversionRate || values.DDRate || ''}
                                onChange={(event) => {
                                  const updatedDetails = [...realizationDetails];
                                  updatedDetails[index].ConversionRate = event.target.value;
                                  // Recalculate INR amount
                                  const amountFC = parseFloat(updatedDetails[index].AmountInFC) || 0;
                                  const conversionRate = parseFloat(event.target.value) || parseFloat(values.DDRate) || 1;
                                  updatedDetails[index].AmountInINR = (amountFC * conversionRate).toFixed(2);
                                  setRealizationDetails(updatedDetails);

                                  // Update form values
                                  setValue(`realizationDetails[${index}].ConversionRate`, event.target.value);
                                  setValue(`realizationDetails[${index}].AmountInINR`, updatedDetails[index].AmountInINR);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`realizationDetails[${index}].AccountSource`}
                                label="Account Source"
                                value={detail.AccountSource}
                                onChange={(event) => {
                                  const updatedDetails = [...realizationDetails];
                                  updatedDetails[index].AccountSource = event.target.value;
                                  setRealizationDetails(updatedDetails);
                                  // Update form value
                                  setValue(`realizationDetails[${index}].AccountSource`, event.target.value);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`realizationDetails[${index}].Remarks`}
                                label="Remarks"
                                value={detail.Remarks}
                                onChange={(event) => {
                                  const updatedDetails = [...realizationDetails];
                                  updatedDetails[index].Remarks = event.target.value;
                                  setRealizationDetails(updatedDetails);
                                  // Update form value
                                  setValue(`realizationDetails[${index}].Remarks`, event.target.value);
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Submit Button */}
        <Grid xs={12} md={12}>
          <Stack spacing={3} alignItems="flex-end">
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}

            >
              Save Export LC Realization
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Add Details</DialogTitle>
        <DialogContent>Are you sure you want to add the selected rows to the master?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleConfirmAddDetails}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}