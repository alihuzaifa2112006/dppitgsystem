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
import axios from 'axios';
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
  Tooltip,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { fNumber } from 'src/utils/format-number';
import { LoadingScreen } from 'src/components/loading-screen';
import { useTable } from 'src/components/table';
import { fDate } from 'src/utils/format-time';

export default function DocSubmitAdd() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [submissionTypes, setSubmissionTypes] = useState([]);
  const [banks, setBanks] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setLoading] = useState(true);
  // State for contacts
  const [contacts, setContacts] = useState([
    {
      Contact_Name: '',
      Contact_Number: '',
      Email_Address: '',
      Comments: '',
      Remarks: '',
      IsActive: true,
      CreatedBy: userData?.userDetails?.userId || 1,
    },
  ]);

  // Validation schema
  const DocSubmitSchema = Yup.object().shape({
    Submission_Type: Yup.object().required('Submission type is required'),
    Submission_Date: Yup.date().required('Submission date is required'),
    Submission_Bank: Yup.object().required('Submission bank is required'),
    Bank_Reference_No: Yup.string().required('Bank reference number is required'),
    Bank_Reference_Date: Yup.date().required('Bank reference date is required'),
    Negotiation_Date: Yup.date().required('Negotiation date is required'),
    Total_Invoice_Value: Yup.number()
      .required('Total invoice value is required')
      .min(0, 'Total invoice value must be positive'),
    Currency: Yup.object().required('Currency is required'),
    Currency_Rate: Yup.number()
      .required('Currency rate is required')
      .min(0, 'Currency rate must be positive'),
    Bank_Maturity_Received_Date: Yup.date().required('Bank maturity received date is required'),
    Bank_Maturity_Date: Yup.date().required('Bank maturity date is required'),
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
      Branch_ID: userData?.userDetails?.branchID || 5,
      Org_ID: userData?.userDetails?.orgId || 1,
      isActive: true,
      CreatedBy: userData?.userDetails?.userId || 1,
      Submission_Date: new Date(),
      Bank_Reference_Date: new Date(),
      Negotiation_Date: new Date(),
      Bank_Maturity_Received_Date: new Date(),
      Bank_Maturity_Date: new Date(),
      Total_Invoice_Value: 0,
      Currency_Rate: 1,
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
    reset,
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

  function ToUTCISOString(date) {
    if (!date) return null;
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  // State for filters
  const [exportInvoiceNoFilter, setExportInvoiceNoFilter] = useState('');
  const [exportInvoiceDateFilter, setExportInvoiceDateFilter] = useState(null);
  const [customerNameFilter, setCustomerNameFilter] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [open, setOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
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

      if (customerNameFilter) {
        filtered = filtered.filter((item) =>
          item.CustomerName?.toLowerCase().includes(customerNameFilter.toLowerCase())
        );
      }

      const isValidDate = (date) => !Number.isNaN(Date.parse(date));

      if (exportInvoiceDateFilter && isValidDate(exportInvoiceDateFilter)) {
        const formattedDate = fDate(exportInvoiceDateFilter);
        filtered = filtered.filter((item) => fDate(item?.ExportInvoiceDate) === formattedDate);
      }

      setFilteredData(filtered);
      setCurrentPage(1);
    } else {
      setFilteredData([]);
    }
  }, [dataList, exportInvoiceNoFilter, exportInvoiceDateFilter, customerNameFilter]);

  // Clear filters function
  const handleClearFilters = () => {
    setExportInvoiceNoFilter('');
    setExportInvoiceDateFilter('');
    setCustomerNameFilter('');
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
      const apiUrl = `CommercialModule/GetPendingInvoices?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`;
      const response = await Get(apiUrl);
      const updatedData = response.data.Data.map((x) => ({
        ...x,
        ExportInvoiceDate: x?.ExportInvoiceDate ? new Date(x?.ExportInvoiceDate) : null,
      }));
      setDataList(updatedData);
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
    const totalAmountcalc = selectedRows.reduce(
      (sum, row) => sum + (parseFloat(row.ExportLCAmount) || 0),
      0
    );
    setTotalAmount(totalAmountcalc.toFixed(2));
    setValue('Total_Invoice_Value', totalAmountcalc);
  }, [selectedRows, setValue]);

  // Open/Close Dialog
  const handleOpen = () => {
    handleClearFilters();
    setTempSelectedRows(selectedRows);
    setOpen(true);
    handleGetData();
    setDataList([]);
  };

  // Table
  const table = useTable();

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  // Form submission - UPDATED FOR NEW API
  const onSubmit = handleSubmit(async (data) => {
    try {
      // Prepare invoices array from selected rows
      const invoices = selectedRows.map(row => ({
        ExportInvoiceID: row.ExportInvoiceID,
        LCID: row.LCID || row.ExportLCID, // Adjust based on your data structure
        InvoiceValue: parseFloat(row.ExportLCAmount) || 0,
        LCValue: parseFloat(row.ExportLCAmount) || 0 // Using same value, adjust if different
      }));

      const payload = {
        SubmissionDate: formatDateForAPI(data.Submission_Date),
        SubmissionTypeID: data.Submission_Type.SubmissionTypeID || 0,
        SubmissionBankID: data.Submission_Bank.BankID || 0,
        NegotiationDate: formatDateForAPI(data.Negotiation_Date),
        TillInvValue: parseFloat(data.Total_Invoice_Value) || 0,
        BankRefNo: data.Bank_Reference_No||"",
        BankRefDate: formatDateForAPI(data.Bank_Reference_Date),
        CurrencyID: data.Currency.Currency_ID || 0,
        CurrencyRate: parseFloat(data.Currency_Rate) || 0,
        BankMaturityReceivedDate: formatDateForAPI(data.Bank_Maturity_Received_Date),
        BankMaturityDate: formatDateForAPI(data.Bank_Maturity_Date),
        NotYetFinal: false,
        OutOfBalanceFC: 0,
        CreatedBy: userData?.userDetails?.userId || 1,
        Org_ID: userData?.userDetails?.orgId || 1,
        Branch_ID: userData?.userDetails?.branchID || 5,
        Invoices: invoices
      };

      console.log('Submitting payload:', payload);

      const response = await Post('CommercialModule/SaveExportDocumentSubmission', payload);

      if (response.status === 200) {
        enqueueSnackbar('Document submission added successfully', { variant: 'success' });
        navigate(paths.dashboard.Commercial.export.DocumentSubmission.root);
      } else {
        enqueueSnackbar('Error adding document submission', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      enqueueSnackbar('Error adding document submission', { variant: 'error' });
    }
  });
  console.log(values,'value')
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
  return isLoading ? (
    renderLoading
  ) : (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Document Submission Information */}
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
                Document Submission Information
              </Typography>

              <RHFAutocomplete
                name="Submission_Type"
                label="Submission Type"
                options={submissionTypes}
                getOptionLabel={(option) => option.SubmissionTypeName || ''}
                isOptionEqualToValue={(option, value) =>
                  option.SubmissionTypeID === value.SubmissionTypeID
                }
              />

              <Controller
                control={control}
                name="Submission_Date"
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

              <RHFAutocomplete
                name="Submission_Bank"
                label="Submission Bank"
                options={banks}
                getOptionLabel={(option) => option.BankName}
                isOptionEqualToValue={(option, value) =>
                  option.BankID === value.BankID
                }
                value={values.Submission_Bank||null}
              />

              <RHFTextField name="Bank_Reference_No" label="Bank Reference No" />

              <Controller
                control={control}
                name="Bank_Reference_Date"
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Bank Reference Date"
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

              <Controller
                control={control}
                name="Negotiation_Date"
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Negotiation Date"
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
                name="Total_Invoice_Value"
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

              <RHFTextField name="Currency_Rate" label="Currency Rate" type="number" />

              <Controller
                control={control}
                name="Bank_Maturity_Received_Date"
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Bank Maturity Received Date"
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

              <Controller
                control={control}
                name="Bank_Maturity_Date"
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Bank Maturity Date"
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
            </Box>
          </Card>
        </Grid>

        <Grid xs={12} md={12}>
          <Card sx={{ mt: 3, p: 2 }}>
            <Box>
              <Box display="flex" flexWrap="wrap" justifyContent="space-between">
                <Typography variant="h5" sx={{ mb: 1 }}>
                  Export Invoice Information
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
                    Add Export Invoice Details
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
                  <DialogTitle sx={{ mt: 2 }}>Select Export Invoice Details</DialogTitle>
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

                          <TextField
                            label="Filter by Buyer Name"
                            value={customerNameFilter}
                            onChange={(e) => setCustomerNameFilter(e.target.value)}
                            sx={{ minWidth: 200 }}
                            placeholder="Enter Buyer Name"
                          />

                          <DesktopDatePicker
                            label="Filter By Export Invoice Date"
                            format="dd MMM yyyy"
                            value={exportInvoiceDateFilter || null}
                            onChange={(value) => setExportInvoiceDateFilter(value)}
                          />

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
                                  <TableCell sx={{ minWidth: 120 }}>Export Invoice Date</TableCell>
                                  <TableCell sx={{ minWidth: 150 }}>Buyer Name</TableCell>
                                  <TableCell sx={{ minWidth: 120 }}>Export LC No</TableCell>
                                  <TableCell sx={{ minWidth: 120, textAlign: 'right' }}>
                                    Export Invoice Value
                                  </TableCell>
                                  <TableCell sx={{ minWidth: 120, textAlign: 'right' }}>
                                    LC For
                                  </TableCell>
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
                                      <TableCell>{ToUTCISOString(row.ExportInvoiceDate)}</TableCell>
                                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        {row.BuyerName}
                                      </TableCell>
                                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        {row.ExportLCNo}
                                      </TableCell>
                                      <TableCell
                                        sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                      >
                                        {fNumber(row.ExportLCAmount)}
                                      </TableCell>
                                      <TableCell
                                        sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                      >
                                        {row.PurposeName}
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
                    Selected Export Invoices
                  </Typography>

                  <Scrollbar>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ minWidth: 125 }}>Export Invoice No</TableCell>
                          <TableCell sx={{ minWidth: 120 }}>Export Invoice Date</TableCell>
                          <TableCell sx={{ minWidth: 150 }}>Buyer Name</TableCell>
                          <TableCell sx={{ minWidth: 120 }}>Export LC No</TableCell>
                          <TableCell sx={{ minWidth: 120 }} align='right'>Export Invoice Value</TableCell>
                          <TableCell sx={{ minWidth: 120 }} align='right'>LC for</TableCell>
                          <TableCell sx={{ minWidth: 80 }}>Remove</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedRows.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.ExportInvoiceNo}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{ToUTCISOString(row.ExportInvoiceDate)}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.BuyerName}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.ExportLCNo}</TableCell>
                            <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>{fNumber(row.ExportLCAmount)}</TableCell>
                            <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>{row.PurposeName}</TableCell>
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
                </TableContainer>
              )}
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
              disabled={selectedRows.length === 0}
            >
              Save Changes
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