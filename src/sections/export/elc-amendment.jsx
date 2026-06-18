import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TableBody from '@mui/material/TableBody';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Pagination,
  Paper,
  Table,
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
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFRadioGroup,
} from 'src/components/hook-form';

import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
} from 'src/components/table';

import { Get, Post, Put } from 'src/api/apibasemethods';

import { DesktopDatePicker } from '@mui/x-date-pickers';


import Iconify from 'src/components/iconify';

import PropTypes from 'prop-types';
import AutocompleteWithMultiAdd from 'src/components/AutocompleteWithMultiAdd';
import { fCurrency, fNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import AutocompleteWithDropDown from 'src/components/AutocompleteWithDropDown';


// ----------------------------------------------------------------------

export default function ExportAmendmentForm({ currentData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [BDTtoUSD, setBDTtoUSD] = useState(1);

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Date In SQL format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const [currencies, setCurrencies] = useState([]);

  const [allPaymentTerms, setAllPaymentTerms] = useState([]);

  const [LCNO, setLCNO] = useState([]);
  const [allBeneficary, setallBeneficary] = useState([]);
  const [dialogValue, setDialogValue] = useState('');
  const [open, setOpen] = useState(false);

  const [allBanks, setAllBanks] = useState([]);

  const allPriorities = [
    {
      value: 'High',
      label: 'High',
    },
    {
      value: 'Medium',
      label: 'Medium',
    },
    {
      value: 'Low',
      label: 'Low',
    },
  ];

  const [editingIndex, setEditingIndex] = useState(null);
  const [typesData, setTypesData] = useState({});
  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [allInvoicePurposes, setAllInvoicePurposes] = useState([]);
  const [allIncoTerms, setAllIncoTerms] = useState([]);
  const [allLCPurposes, setAllLCPurposes] = useState([]);
  const [allPOL, setAllPOL] = useState([]);
  const [allCINatures, setAllCINatures] = useState([]);
  const [exportInvoiceNo, setExportInvoiceNo] = useState('');
  const [piData, setPiData] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [dialogLoading, setDialogLoading] = useState(false);


  const NewPiSchema = Yup.object().shape({
    // LCNo: Yup.string().required('L/C No is required'),
    // LCDate: Yup.date().required('L/C Date is required'),
    // FileReferenceNo: Yup.string().required('File Reference No is required'),
    // Customer: Yup.object().required('Customer is required'),
    // Beneficiary: Yup.object().required('Beneficiary is required'),
    // OpeningBank: Yup.object().required('Opening Bank is required'),
    // LienBank: Yup.object().required('Lien Bank is required'),
    // LienDate: Yup.date().required('Lien Date is required'),
    // recievethrough: Yup.object().required('Receive Through is required'),
    // Currency: Yup.object().required('Currency is required'),
    // Tolerance: Yup.number()
    //   .min(0, 'Tolerance must be positive')
    //   .typeError('Tolerance must be a number')
    //   .required('Tolerance is required'),
    // ShipDate: Yup.date().required('Ship Date is required'),
    // LCFor: Yup.object().required('L/C For is required'),
    // MaxImportLimitPercent: Yup.number()
    //   .min(0, 'Max Import Limit must be positive')
    //   .max(100, 'Max Import Limit cannot exceed 100%')
    //   .typeError('Max Import Limit must be a number')
    //   .required('Max Import Limit is required'),
    // ExpiryDate: Yup.date().required('Expiry Date is required'),
    // LCNature: Yup.object().required('L/C Nature is required'),
    // Incoterm: Yup.object().required('Incoterm is required'),
    // MasterNo: Yup.string().required('Master No is required'),
    // payterm: Yup.object().required('Pay Term is required'),

    // Tenor: Yup.string().required('Tenor is required'),
    // Consignee: Yup.string().required('Consignee is required'),
    // NotifyParty: Yup.string().required('Notify Party is required'),
    // FinalDestination: Yup.string().required('Final Destination is required'),
    // Portofloading: Yup.object().required('Port of Loading is required'),
  });
  const defaultValues = useMemo(() => ({
    // Basic LC Information
    LCNo: currentData?.LCHeader?.ExportLCNo || '',
    FileReferenceNo: currentData?.LCHeader?.FileRef || '',
    LCDate: currentData?.LCHeader?.LCDate ? new Date(currentData.LCHeader.LCDate) : null,
    centralbankingno: currentData?.LCHeader?.CentralBankReportingNo || '',

    // Customer
    Customer: customers?.find((option) => option?.WIC_ID === currentData?.LCHeader?.WIC_ID) || null,

    // Bank Information
    Beneficiary: allBeneficary?.find((option) => option?.BeneficiaryID === currentData?.LCHeader?.BeneficiaryID) || null,
    OpeningBank: allBanks?.find((option) => option?.BankID === currentData?.LCHeader?.OpeningBankID) || null,
    LienBank: allBanks?.find((option) => option?.BankID === currentData?.LCHeader?.LienBankID) || null,
    LienDate: currentData?.LCHeader?.LienDate ? new Date(currentData.LCHeader.LienDate) : null,
    recievethrough: allBanks?.find((option) => option?.BankID === currentData?.LCHeader?.ReceiveThroughBankID) || null,

    // LC Details
    ExpiryDate: currentData?.LCHeader?.ExpiryDate ? new Date(currentData.LCHeader.ExpiryDate) : null,
    ExpiryDate2: currentData?.LCHeader?.LCDate ? new Date(currentData.LCHeader.LCDate) : null,
    LCNature: allCINatures?.find((option) => option?.LCNatureID === currentData?.LCHeader?.LCNatureID) || null,
    Incoterm: allIncoTerms?.find((option) => option?.IncotermID === currentData?.LCHeader?.IncotermID) || null,
    MasterNo: currentData?.LCHeader?.MasterLC_SCNo || '',
    payterm: allPaymentTerms?.find((option) => option?.Payment_term_ID === currentData?.LCHeader?.PayTermID) || null,

    // Financial Information
    Currency: currencies?.find((option) => option?.Currency_ID === currentData?.LCHeader?.CurrencyID) || null,
    Tolerance: currentData?.LCHeader?.TolerancePercent || 0,

    // Shipping Information
    ShipDate: currentData?.LCHeader?.ShipDate ? new Date(currentData.LCHeader.ShipDate) : null,
    ShipDate2: currentData?.LCHeader?.ShipDate ? new Date(currentData.LCHeader.ShipDate) : null,
    LCFor: allLCPurposes?.find((option) => option?.PurposeID === currentData?.LCHeader?.LCPurposeID) || null,
    FreightAmt: currentData?.LCHeader?.FreightAmount || 0,
    Tenor: currentData?.LCHeader?.Tenor || '',
    Consignee: currentData?.LCHeader?.Consignee || '',
    NotifyParty: currentData?.LCHeader?.NotifyParty || '',
    FinalDestination: currentData?.LCHeader?.FinalDestination || '',
    Portofloading: allPOL?.find((option) => option?.PortID === currentData?.LCHeader?.PortID) || null,
    MaxImportLimitPercent: currentData?.LCHeader?.MaxImportLimit || 0,

    // Additional Information
    Remarks: currentData?.LCHeader?.Remarks || '',

    // Amendment fields
    AmendmentDate: null,
    AmendmentAmount: '',
    RevisedLCAmount: '',
  }), [
    currentData,
    customers,
    allBeneficary,
    allBanks,
    allCINatures,
    allIncoTerms,
    allPaymentTerms,
    currencies,
    allLCPurposes,
    allPOL
  ]);
  const methods = useForm({
    resolver: yupResolver(NewPiSchema),
    defaultValues,
  });
  // Set selected rows from currentData
  useEffect(() => {
    if (currentData?.PIDetails) {
      setSelectedRows(currentData.PIDetails);
    }
  }, [currentData]);

  // Set total amount from currentData
  useEffect(() => {
    if (currentData?.LCHeader?.ExportLCAmount) {
      setTotalAmount(currentData.LCHeader.ExportLCAmount);
    }
  }, [currentData]);

  useEffect(() => {
    if (currentData && !isLoading) {
      methods.reset(defaultValues);
    }
  }, [currentData, isLoading, methods, defaultValues]);



  // Set amendments from currentData
  useEffect(() => {
    if (currentData?.LCHeader?.Amendments) {
      setAmendments(currentData.LCHeader.Amendments);
    }
  }, [currentData]);
  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();
  console.log(defaultValues);
  const GetBeneficary = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetBeneficiaries?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setallBeneficary(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetInvoicePurposes = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetInvoicePurposes?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllInvoicePurposes(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);
  // eslint-disable-next-line
  const GetIncoTerms = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetIncoterms?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllIncoTerms(response.data.Data);
      return response.data.Data;
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetLCPurposes = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetLCPurposes?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllLCPurposes(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetCountries = useCallback(async () => {
    const res = await Get('getallcountries');
    setCountries(res?.data.Data || []);
  }, []);
  // eslint-disable-next-line
  const GetPOL = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetPortOfLoading?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllPOL(response.data.Data);
      return response.data.Data;
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // eslint-disable-next-line
  const GetLCNatures = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetLCNatures?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllCINatures(response.data.Data);
      return response.data.Data;
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetFactories = useCallback(async () => {
    try {
      const response = await Get(`CommercialModule/GetEndCustomer`);
      setCustomers(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const GetExportInvoiceNo = useCallback(async () => {
    try {
      const currentYear = new Date().getFullYear();
      const response = await Get(
        `CommercialModule/GenerateExportInvoiceNo?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&Year=${currentYear}`
      );
      setExportInvoiceNo(response.data.ExportInvoiceNo);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetCurrencies = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetCurrencies?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setCurrencies(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // eslint-disable-next-line
  const GetBanks = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetBankList?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllBanks(response.data.Data);
      return response.data.Data;
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetPaymentTerms = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetPaymentTerms?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllPaymentTerms(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // Fix the main useEffect - use async function properly
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        GetCurrencies(),
        GetBanks(),
        GetPaymentTerms(),
        GetInvoicePurposes(),
        GetIncoTerms(),
        GetLCPurposes(),
        GetLCNatures(),
        GetPOL(),
        GetExportInvoiceNo(),
        GetCountries(),
        GetBeneficary(),
        GetFactories(),
      ]);

      setLoading(false);
    };
    fetchData();
  }, [
    GetCurrencies,
    GetBanks,
    GetPaymentTerms,
    GetInvoicePurposes,
    GetIncoTerms,
    GetLCPurposes,
    GetLCNatures,
    GetPOL,
    GetExportInvoiceNo,
    GetCountries,
    GetBeneficary,
    GetFactories,
  ]);

  const KGtoLBs = (kg) => kg * 2.20462;
  function ToUTCISOString(date) {
    if (!date) return null;

    const dateObj = new Date(date);

    // Format as YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`; // e.g., "2023-05-10"
  }
  // Add these to your existing state declarations
  // Add to your state declarations
  const [amendments, setAmendments] = useState([]);
  const [isSubmittingAmendment, setIsSubmittingAmendment] = useState(false);

  // Add this function to handle adding amendments
  const handleAddAmendment = async () => {
    const amendmentData = methods.getValues();

    // Validate required fields
    if (!amendmentData.AmendmentDate) {
      enqueueSnackbar('Amendment Date is required', { variant: 'error' });
      return;
    }

    if (!amendmentData.AmendmentAmount || parseFloat(amendmentData.AmendmentAmount) <= 0) {
      enqueueSnackbar('Valid Amendment Amount is required', { variant: 'error' });
      return;
    }

    if (!amendmentData.RevisedLCAmount || parseFloat(amendmentData.RevisedLCAmount) <= 0) {
      enqueueSnackbar('Valid Revised L/C Amount is required', { variant: 'error' });
      return;
    }

    setIsSubmittingAmendment(true);

    try {
      const amendmentToSave = {
        ExportLCID: 0, // Will be set when we have the main LC ID
        AmendmentDate: amendmentData.AmendmentDate ? formatDate(new Date(amendmentData.AmendmentDate)) : null,
        AmendmentAmount: parseFloat(amendmentData.AmendmentAmount) || 0,
        RevisedLCAmount: parseFloat(amendmentData.RevisedLCAmount) || 0,
        CreatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      // If you want to save immediately to API:
      // const response = await Post('CommercialModule/SaveExportLCAmendment', amendmentToSave);

      // For now, just add to local state
      setAmendments(prev => [...prev, amendmentToSave]);

      // Clear the form fields
      methods.setValue('AmendmentDate', null);
      methods.setValue('AmendmentAmount', '');
      methods.setValue('RevisedLCAmount', '');

      enqueueSnackbar('Amendment added successfully!');

    } catch (error) {
      console.error('Error adding amendment:', error);
      enqueueSnackbar('Failed to add amendment', { variant: 'error' });
    } finally {
      setIsSubmittingAmendment(false);
    }
  };


  const onSubmit = handleSubmit(async (data) => {
    const amendmentData = methods.getValues();

    // Validate required fields
    if (!amendmentData.AmendmentDate) {
      enqueueSnackbar('Amendment Date is required', { variant: 'error' });
      return;
    }

    // condition removed by hasham , requested by zahoor

    //  now AmendmentAmount can also be negative or positive but only a number
    if (!amendmentData?.AmendmentAmount || Number.isNaN(parseFloat(amendmentData?.AmendmentAmount))) {
      enqueueSnackbar('Valid Amendment Amount is required', { variant: 'error' });
      return;
    }
    

    if (!amendmentData.RevisedLCAmount || parseFloat(amendmentData.RevisedLCAmount) <= 0) {
      enqueueSnackbar('Valid Revised L/C Amount is required', { variant: 'error' });
      return;
    }

    setIsSubmittingAmendment(true);


    const amendmentToSave = {
      ExportLCID: currentData?.LCHeader?.ExportLCID || 0, // Will be set when we have the main LC ID
      AmendmentDate: amendmentData.AmendmentDate ? formatDate(new Date(amendmentData.AmendmentDate)) : null,
      ShipDate: amendmentData.ShipDate2 ? formatDate(new Date(amendmentData.ShipDate2)) : null,
      ExpiryDate: amendmentData.ExpiryDate2 ? formatDate(new Date(amendmentData.ExpiryDate2)) : null,
      AmendmentAmount: parseFloat(amendmentData.AmendmentAmount) || 0,
      RevisedLCAmount: parseFloat(amendmentData.RevisedLCAmount) || 0,
      CreatedBy: userData?.userDetails?.userId,
      Org_ID: userData?.userDetails?.orgId,
      Branch_ID: userData?.userDetails?.branchID,
    };


    try {
      const response = await Post(`CommercialModule/SaveExportLCAmendment`, amendmentToSave);

      if (response.status === 200) {
        enqueueSnackbar('Amendment Details Added Successfully!');
        router.push(paths.dashboard.Commercial.export.ExportLC.root);
      } else {
        enqueueSnackbar('Failed to Add', { variant: 'error' });
      }
    } catch (error) {
      console.error('Failed to Add:', error);

      enqueueSnackbar('Failed to Add!', { variant: 'error' });
    }
  });

  const [selectedRows, setSelectedRows] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [styleNo, setStyleNo] = useState(null);
  const [PONO, setPONO] = useState('');
  const [dataList, setDataList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [tempSelectedRows, setTempSelectedRows] = useState([]);
  const rowsPerPage = 10;

  const handleConfirmAddDetails = async () => {
    if (!tempSelectedRows || tempSelectedRows.length === 0) {
      enqueueSnackbar('Please select at least one row.', { variant: 'error' });
      return;
    }

    try {
      // Filter out any rows that might already be in selectedRows
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

      // Finally commit the selected rows
      setSelectedRows((prev) => [...prev, ...newRows]);
      setTempSelectedRows([]);
      setOpen(false);
      setPONO('');
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

    setConfirmOpen(true); // ✅ Open the confirmation dialog
  };
  useEffect(() => {
    const addLCValues = () => {
      const lcAmount = parseFloat(values?.AmendmentAmount) || 0;
      const revisedAmount = parseFloat(totalAmount) || 0;

      const totalLCAmount = lcAmount + revisedAmount;
      console.log("totalLCAmount", totalLCAmount)
      // setValue('AmendmentAmount', totalLCAmount.toFixed(2));
      setValue('RevisedLCAmount', totalLCAmount.toFixed(2));
    }
    addLCValues()
  }, [totalAmount, values?.AmendmentAmount, setValue])


  const handleGetData = async () => {
    if (!values?.Customer?.WIC_ID) {
      enqueueSnackbar('Please select Customer ', { variant: 'warning' });
      return;
    }

    setDialogLoading(true);

    try {
      const customerId = values?.Customer?.WIC_ID;

      const apiUrl = `CommercialModule/GetPIDetailsByCustomer?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&WIC_ID=${customerId}`;

      const response = await Get(apiUrl);

      const updatedData = response.data.Data.map((x) => ({
        ...x,
        PIDate: x?.PIDate ? new Date(x?.PIDate) : null,
      }));
      setDataList(updatedData);
    } catch (error) {
      console.error('Error fetching PI data:', error);
      setDataList([]);
      enqueueSnackbar('Failed to fetch PI data', { variant: 'error' });
    } finally {
      setDialogLoading(false);
    }
  };

  const getRowId = (row) => `${row.PIID}_${row.PINo}_${row.PIDtlID}_${row.CompositionID}`;

  const handleSelectRow = (row) => {
    const rowId = getRowId(row);

    // Check if already selected in either temporary or final selection
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
      (sum, row) => sum + (parseFloat(row.Total_Amount) || 0),
      0
    );
    setTotalAmount(totalAmountcalc.toFixed(2));
  }, [selectedRows]);


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
  // State for filters
  const [piNoFilter, setPiNoFilter] = useState('');
  const [piDateFilter, setPiDateFilter] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  // Filter data based on filters
  useEffect(() => {
    if (dataList.length > 0) {
      let filtered = dataList;

      // Filter by PINo
      if (piNoFilter) {
        filtered = filtered.filter((item) =>
          item.PINo?.toLowerCase().includes(piNoFilter.toLowerCase())
        );
      }

      // Filter by PI Date
      // if piDateFilter is a valide date
      const isValidDate = (date) => !Number.isNaN(Date.parse(date));

      if (piDateFilter && isValidDate(piDateFilter)) {
        const formattedDate = fDate(piDateFilter);
        filtered = filtered.filter((item) => fDate(item?.PIDate) === formattedDate);
      }

      setFilteredData(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    } else {
      setFilteredData([]);
    }
  }, [dataList, piNoFilter, piDateFilter]);

  // Clear filters function
  const handleClearFilters = () => {
    setPiNoFilter('');
    setPiDateFilter('');
  };

  const PostLCNature = async ({ LCNatureName }) => {
    if (!LCNatureName) return;

    const newOptionTrimmed = LCNatureName.trim().toLowerCase();

    if (
      allCINatures.find(
        (option) => option?.LCNatureName?.trim()?.toLowerCase() === newOptionTrimmed
      )
    ) {
      enqueueSnackbar('This LCNature already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        LCNatureName,

        CreatedBy: userData?.userDetails?.userId,

        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('commercial/AddLCNature', dataToSend);
      const updatedlcnatures = await GetLCNatures();

      const newlyAdded = updatedlcnatures.find(
        (b) => b.LCNatureName.trim().toLowerCase() === newOptionTrimmed
      );

      enqueueSnackbar('LC Nature Added Successfully', { variant: 'success' });
      if (newlyAdded) {
        setTypesData((prev) => ({
          ...prev,
          dropData: newlyAdded,
        }));
      }
    } catch (error) {
      enqueueSnackbar('LC Nature Name Exists', { variant: 'error' });
      console.log('Error', error);
    }
  };

  const PostBank = async ({ BankName, BranchName, Address }) => {
    if (!BankName || !BranchName || !Address) return;

    const newOptionTrimmed = BankName.trim().toLowerCase();

    if (allBanks.find((option) => option.BankName.trim().toLowerCase() === newOptionTrimmed)) {
      enqueueSnackbar('Bank Name Exists', { variant: 'error' });
      return;
    }

    const dataToSend = {
      BankName,
      BranchName,
      Address,
      CreatedBy: userData?.userDetails?.userId,
      Org_ID: userData?.userDetails?.orgId,
      Branch_ID: userData?.userDetails?.branchID,
    };

    try {
      await Post('CommercialModule/AddBank', dataToSend);

      const updatedBankList = await GetBanks();

      const newlyAdded = updatedBankList.find(
        (b) => b.BankName.trim().toLowerCase() === newOptionTrimmed
      );
      console.log(newlyAdded);

      enqueueSnackbar('Bank Added Successfully', { variant: 'success' });
      if (newlyAdded) {
        setTypesData((prev) => ({
          ...prev,
          dropData: newlyAdded,
        }));
      }
    } catch (error) {
      enqueueSnackbar('Bank not Added Successfully', { variant: 'error' });
      console.error('Error adding bank:', error);
    }
  };

  const PostIncoterm = async ({ IncotermCode, Description }) => {
    if (!IncotermCode || !Description) return;

    const newOptionTrimmed = IncotermCode.trim().toLowerCase();

    if (
      allIncoTerms.find((option) => option.IncotermCode.trim().toLowerCase() === newOptionTrimmed)
    ) {
      enqueueSnackbar('Incoterm Code Exists', { variant: 'error' });
      return;
    }

    const dataToSend = {
      IncotermCode,
      Description,

      CreatedBy: userData?.userDetails?.userId,
      Org_ID: userData?.userDetails?.orgId,
      Branch_ID: userData?.userDetails?.branchID,
    };

    try {
      await Post('CommercialModule/AddIncoterm', dataToSend);

      const updatedBankList = await GetIncoTerms();

      const newlyAdded = updatedBankList.find(
        (b) => b.IncotermCode.trim().toLowerCase() === newOptionTrimmed
      );

      enqueueSnackbar('Inco Terms Added Successfully', { variant: 'success' });
      if (newlyAdded) {
        setTypesData((prev) => ({
          ...prev,
          dropData: newlyAdded,
        }));
      }
    } catch (error) {
      enqueueSnackbar('Inco Terms not Added Successfully', { variant: 'error' });
      console.error('Error adding Inco Terms:', error);
    }
  };

  const PostPOL = async (pol, country) => {
    if (!pol || !country) return;

    const newOptionTrimmed = pol.trim().toLowerCase();

    if (allPOL.find((option) => option.PortName.trim().toLowerCase() === newOptionTrimmed)) {
      enqueueSnackbar('Port Name Exists', { variant: 'error' });
      return;
    }

    const dataToSend = {
      PortName: pol,
      Country_ID: country.Country_ID,
      CreatedBy: userData?.userDetails?.userId,
      Org_ID: userData?.userDetails?.orgId,
      Branch_ID: userData?.userDetails?.branchID,
    };

    try {
      await Post('commercial/AddPortOfLoading', dataToSend);
      const updatedBlendList = await GetPOL();
      const newlyAdded = updatedBlendList.find(
        (b) => b.PortName.trim().toLowerCase() === newOptionTrimmed
      );

      if (newlyAdded) {
        setTypesData((prev) => ({
          ...prev,
          dropData: newlyAdded,
        }));
      }

      enqueueSnackbar('PortName Added Successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error adding Port Name:', error);
    }
  };

  // Open/Close Dialog
  const handleOpen = () => {
    handleClearFilters();
    setTempSelectedRows(selectedRows); // pre-populate with selected
    setOpen(true);
    handleGetData();
    setDataList([]);
  };

  // Table
  const table = useTable();

  const denseHeight = table.dense ? 56 : 56 + 20;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);
  // const DeleteDetailTableRow = (rowToDelete) => {
  //   const updatedDetails = piDetails.filter((row) => row !== rowToDelete);
  //   setPiDetails(updatedDetails);
  // };

  return isLoading ? (
    renderLoading
  ) : (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <h3>L/C Tagging Information:</h3>
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
                <RHFTextField name="LCNo" label="L/C No" variant="outlined" fullWidth />
                <Controller
                  name="LCDate"
                  control={control}
                  // value={piData.map((item) => item.PIDate ? new Date(item.PIDate) : new Date())}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="L/C Date"
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
                  name="FileReferenceNo"
                  label="File Reference No"
                  variant="outlined"
                  fullWidth
                />

                <RHFTextField
                  name="centralbankingno"
                  label="Central Banking Reporting NO."
                  variant="outlined"
                  fullWidth
                />
                <RHFAutocomplete
                  name="Customer"
                  label="Customer"
                  fullWidth
                  options={customers}
                  getOptionLabel={(option) => option?.WIC_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.WIC_ID === value?.WIC_ID}
                  onchange={(newVal) => {
                    setValue('Customer', newVal);
                    setValue('Consignee', newVal?.WIC_Name || '');
                    setValue('NotifyParty', newVal?.WIC_Name || '');
                  }}
                  value={values.Customer || null}
                />
              </Box>
            </Card>



            <Card sx={{ p: 3, my: 3 }}>
              <h3>L/C Tagging General Information:</h3>
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
                {/* Beneficiary */}
                <RHFAutocomplete
                  name="Beneficiary"
                  label="Beneficiary"
                  fullWidth
                  options={allBeneficary}
                  getOptionLabel={(option) => option?.BeneficiaryName || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.BeneficiaryID === value?.BeneficiaryID
                  }
                  value={values.Beneficiary || null}
                />
                {/* Opening Bank
                <RHFAutocomplete
                  name="OpeningBank"
                  label="Opening Bank"
                  fullWidth
                  options={allBanks}
                  getOptionLabel={(option) => option?.BankName || ''}
                  isOptionEqualToValue={(option, value) => option?.BankID === value?.BankID}
                  value={values.OpeningBank || null}
                /> */}

                <AutocompleteWithMultiAdd
                  name="OpeningBank"
                  label="Opening Bank"
                  options={allBanks}
                  getOptionLabel={(option) => option?.BankName || ''}
                  isOptionEqualToValue={(option, value) => option?.BankID === value?.BankID}
                  value={values.OpeningBank || null}
                  onAdd={PostBank}
                  fields={[
                    { name: 'BankName', label: 'Bank Name' },
                    { name: 'BranchName', label: 'Branch Name' },
                    { name: 'Address', label: 'Address' },
                  ]}
                />

                {/* Line Bank */}
                <AutocompleteWithMultiAdd
                  name="LienBank"
                  label="Lien Bank"
                  fullWidth
                  options={allBanks}
                  getOptionLabel={(option) => option?.BankName || ''}
                  isOptionEqualToValue={(option, value) => option?.BankID === value?.BankID}
                  value={values.LienBank || null}
                  onAdd={PostBank}
                  fields={[
                    { name: 'BankName', label: 'Bank Name' },
                    { name: 'BranchName', label: 'Branch Name' },
                    { name: 'Address', label: 'Address' },
                  ]}
                />

                <Controller
                  name="LienDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Lien Date"
                      format="dd MMM yyyy"
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

                <AutocompleteWithMultiAdd
                  name="recievethrough"
                  label="Recieve through Bank"
                  fullWidth
                  options={allBanks}
                  getOptionLabel={(option) => option?.BankName || ''}
                  isOptionEqualToValue={(option, value) => option?.BankID === value?.BankID}
                  value={values.recievethrough || null}
                  onAdd={PostBank}
                  fields={[
                    { name: 'BankName', label: 'Bank Name' },
                    { name: 'BranchName', label: 'Branch Name' },
                    { name: 'Address', label: 'Address' },
                  ]}
                />
                {/* Currency */}
                <RHFAutocomplete
                  name="Currency"
                  label="Currency"
                  fullWidth
                  options={currencies}
                  getOptionLabel={(option) => option?.Currency_Name || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.Currency_ID === value?.Currency_ID
                  }
                  value={values.Currency || null}
                />

                {/* Export LLC Amt */}
                <RHFTextField
                  name="ExportLCAmt"
                  label="Export L/C Amt"
                  value={totalAmount || 0}
                  onChange={(e) => {
                    setTotalAmount(e.target.value);
                    setValue('ExportLCAmt', e.target.value);
                  }}
                  fullWidth
                  type="number"
                  InputLabelProps={{ shrink: true }}
                />
                <RHFTextField
                  name="Tolerance"
                  label="Tolerance"
                  type="number"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                {/* Ship Date */}
                <Controller
                  name="ShipDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Ship Date"
                      format="dd MMM yyyy"
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
                  name="LCFor"
                  label="L/C For"
                  fullWidth
                  options={allLCPurposes}
                  getOptionLabel={(option) => option?.PurposeName || ''}
                  isOptionEqualToValue={(option, value) => option?.PurposeID === value?.PurposeID}
                  value={values.LCFor || null}
                />

                {/* MacImportLimit %} */}
                <RHFTextField
                  name="MaxImportLimitPercent"
                  label="Max. Import Limit %"
                  type="number"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <Controller
                  name="ExpiryDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Expiry Date"
                      format="dd MMM yyyy"
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

                <AutocompleteWithMultiAdd
                  name="LCNature"
                  label="L/C Nature"
                  fullWidth
                  options={allCINatures}
                  getOptionLabel={(option) => option?.LCNatureName || ''}
                  isOptionEqualToValue={(option, value) => option?.LCNatureID === value?.LCNatureID}
                  value={values.LCNature || null}
                  onAdd={PostLCNature}
                  fields={[{ name: 'LCNatureName', label: 'L/C Nature Name' }]}
                />
                <AutocompleteWithMultiAdd
                  name="Incoterm"
                  label="Incoterm"
                  options={allIncoTerms}
                  getOptionLabel={(option) => option?.IncotermCode || ''}
                  isOptionEqualToValue={(option, value) => option?.IncotermID === value?.IncotermID}
                  value={values.Incoterm || null}
                  onAdd={PostIncoterm}
                  fields={[
                    { name: 'IncotermCode', label: 'Incoterm Code' },
                    { name: 'Description', label: 'Description' },
                  ]}
                />

                {/* Master/CRC No */}
                <RHFTextField
                  name="MasterNo"
                  label="Master LC/SC No."
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <RHFAutocomplete
                  name="payterm"
                  label="Payment terms"
                  fullWidth
                  options={allPaymentTerms}
                  getOptionLabel={(option) => option?.Payment_Term || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.Payment_term_ID === value?.Payment_term_ID
                  }
                  value={values.payterm || null}
                />

                {/* Freight Amt */}
                <RHFTextField
                  name="FreightAmt"
                  label="Freight Amt"
                  type="number"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                {/* Tutor */}
                <RHFTextField
                  name="Tenor"
                  label="Tenor"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                {/* Consignee */}
                <RHFTextField
                  name="Consignee"
                  label="Consignee"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={values?.Consignee || ''}
                  onchange={(newVal) => setValue('Consignee', newVal.target.value)}
                />

                {/* Notify Party */}
                <RHFTextField
                  name="NotifyParty"
                  label="Notify Party"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={values?.NotifyParty || ''}
                  onchange={(newVal) => setValue('NotifyParty', newVal.target.value)}
                />

                {/* Final Destination */}
                <RHFTextField
                  name="FinalDestination"
                  label="Final Destination"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <AutocompleteWithDropDown
                  name="Portofloading"
                  label="Port of loading"
                  placeholder="Choose an option"
                  fullWidth
                  options={allPOL || []}
                  blendTypeOptions={countries || []} // <-- blend type list from API
                  typeData={typesData}
                  type1="country"
                  setTypesData={setTypesData}
                  getOptionLabel={(option) => option?.PortName || ''}
                  isOptionEqualToValue={(option, value) => option?.PortName === value?.PortName}
                  optionLable2={(option) => option?.Country_Name}
                  isOptionEqualToValue2={(option, value) =>
                    option?.Country_ID === value?.Country_ID
                  }
                  dropdownLabel="Select Country"
                  onAdd={PostPOL}
                  value={values?.Portofloading || null}
                />
              </Box>
            </Card>
            {/* Updated Amendment Section with state management */}
            <Card sx={{ p: 3, my: 3 }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Amendment
              </Typography>

              {/* Amendment Input Fields */}
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                }}
                sx={{ mb: 3 }}
              >
                <Controller
                  name="AmendmentDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Amendment Date"
                      format="dd MMM yyyy"
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
                  name="ShipDate2"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Shipped Date"
                      format="dd MMM yyyy"
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
                  name="ExpiryDate2"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Expiry Date"
                      format="dd MMM yyyy"
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
                  name="AmendmentAmount"
                  label="Amendment Amount"
                  type="number"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <RHFTextField
                  name="RevisedLCAmount"
                  label="Revised L/C Amount"
                  type="number"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}

                />


              </Box>
              {/* <Stack sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <LoadingButton
                  variant="contained"
                  color="primary"
                  onClick={handleAddAmendment}
                  loading={isSubmitting}
                  size='medium'
                >
                  Add Amendment
                </LoadingButton>
              </Stack> */}
              {/* Amendments Table */}
              {amendments.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ p: 2 }}>
                    Amendment History
                  </Typography>

                  <Scrollbar>
                    <Table>
                      <TableHead>
                        <TableRow>
                            <TableCell sx={{ minWidth: 10 }}>Amendment Number</TableCell>
                          <TableCell sx={{ minWidth: 10 }}>Amendment Date</TableCell>
                            <TableCell sx={{ minWidth: 180,  }}>Shipped Date</TableCell>
                          <TableCell sx={{ minWidth: 180,  }}>Expiry Date</TableCell>
                          <TableCell sx={{ minWidth: 80, textAlign: 'right' }}>Amendment Amount</TableCell>
                          <TableCell sx={{ minWidth: 180, textAlign: 'right' }}>Revised L/C Amount</TableCell>
                        
                          {/* <TableCell sx={{ minWidth: 100 }}>Actions</TableCell> */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {amendments.map((amendment, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}> {amendment.AmendmentNo  ||'-'}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              {amendment.AmendmentDate ? fDate(amendment.AmendmentDate) : '-'}
                            </TableCell>
                             <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              {amendment.ShipDate ? fDate(amendment.ShipDate) : '-'}
                            </TableCell>
                             <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              {amendment.ExpiryDate ? fDate(amendment.ExpiryDate) : '-'}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              {currencies.find((item) => item.Currency_ID === values?.Currency?.Currency_ID)?.Currency_Name === "Bangladeshi Taka" ? "৳" : "$"} {amendment.AmendmentAmount}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              {currencies.find((item) => item.Currency_ID === values?.Currency?.Currency_ID)?.Currency_Name === "Bangladeshi Taka" ? "৳" : "$"} {amendment.RevisedLCAmount}
                            </TableCell>
                            {/* <TableCell>
                              <IconButton
                                color="error"
                                onClick={() => handleRemoveAmendment(index)}
                                size="small"
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </TableCell> */}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
              )}
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
    </>
  );
}

ExportAmendmentForm.propTypes = {
  urlData: PropTypes.any,
  currentData: PropTypes.any,
};