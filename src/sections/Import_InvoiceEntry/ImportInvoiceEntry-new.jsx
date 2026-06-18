import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Checkbox,
  FormControlLabel,
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
import axios from 'axios';

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

export default function ImportInvoiceEntryCreateForm() {
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

  // State for Import Invoice Entry fields
  const [isFabric, setIsFabric] = useState(false);
  const [isTrims, setIsTrims] = useState(false);
  const [isChemical, setIsChemical] = useState(false);
  const [isOthers, setIsOthers] = useState(false);
  const [isDocReceivedComplete, setIsDocReceivedComplete] = useState(false);
  const [isMaterialReceived, setIsMaterialReceived] = useState(false);
  const [isCIClose, setIsCIClose] = useState(false);
  const [groupCodes, setGroupCodes] = useState([]);
  const [groupCurrencies, setGroupCurrencies] = useState([]);
  const [banks, setBanks] = useState([]);
  const [facilityBanks, setFacilityBanks] = useState([]);
  const [bbLCCurrencies, setBBLCCurrencies] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [countries, setCountries] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [tradeTerms, setTradeTerms] = useState([]);
  const [lcTypes, setLcTypes] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [lcNatures, setLcNatures] = useState([]);
  const [hsCodes, setHsCodes] = useState([]);
  const [portsOfLoading, setPortsOfLoading] = useState([]);
  const [portsOfDischarge, setPortsOfDischarge] = useState([]);
  const [bbLcs, setBbLcs] = useState([]);
  // Static dropdown options
  const companyOptions = [{ id: 1, name: 'Simco Spinning and Textile Ltd.' }];
  const maturityDateFromOptions = [{ id: 1, name: 'Acceptance' }];
  const lcForOptions = [{ id: 1, name: 'Other' }];

  const [isLoading, setLoading] = useState(true);

  // Import LC Details states
  const [openLCDetails, setOpenLCDetails] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [selectedLCDetailsRows, setSelectedLCDetailsRows] = useState([]);
  const [tempSelectedLCDetailsRows, setTempSelectedLCDetailsRows] = useState([]);
  const [lcdetailsDataList, setLcdetailsDataList] = useState([]);
  const [itemCodeFilter, setItemCodeFilter] = useState('');
  const [filteredLCDetailsData, setFilteredLCDetailsData] = useState([]);
  const [currentLCDetailsPage, setCurrentLCDetailsPage] = useState(1);
  const rowsPerPageLCDetails = 10;

  const ImportInvoiceEntrySchema = Yup.object().shape({
    // Invoice Entry Fields
    ImportInvoiceEntryNo: Yup.string().required('Import Invoice  No is required'),
    ImportInvoiceEntryDate: Yup.date().required('Import Invoice Date is required'),
    InvType: Yup.object().required('Invoice Type is required'),


  });

  const methods = useForm({
    resolver: yupResolver(ImportInvoiceEntrySchema),
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
  const prevBBLcRef = useRef(null);

  // API functions for Import LC fields
  const GetGroupCodes = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetCurrencies?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (response.data.Success) {
        setGroupCodes(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setGroupCodes([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetLCTypes = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetLCTypes?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );

      setLcTypes(response.data || []);

    } catch (error) {
      console.log(error);
      setLcTypes([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetCompanies = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetInsuranceCompanies?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      if (response.data) {
        setCompanies(response.data || []);
      }
    } catch (error) {
      console.log(error);
      setCompanies([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetGroupCurrencies = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetCurrencies?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (response.data.Success) {
        setGroupCurrencies(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setGroupCurrencies([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

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

  const GetFacilityBanks = useCallback(async () => {

    try {
      const response = await Get(
        `CommercialModule/GetBankFacilities?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (response.data) {
        setFacilityBanks(response.data || []);
      }
    } catch (error) {
      console.log(error);
      setFacilityBanks([]);
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

  const GetPaymentTerms = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetPaymentTerms?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (response.data.Success) {
        setPaymentTerms(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setPaymentTerms([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetLCPurposes = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetLCPurposes?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (response.data.Success) {
        setPurposes(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setPurposes([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetCountries = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetCountries`
      );
      if (response.data.Success) {
        setCountries(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setCountries([]);
    }
  }, []);

  const GetSuppliers = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetVendors?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (response.data.Success) {
        setSuppliers(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setSuppliers([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetTradeTerms = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetTradeTerms?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (Array.isArray(response.data)) {
        setTradeTerms(response.data || []);
      } else if (response.data.Success) {
        setTradeTerms(response.data.Data || []);
      } else {
        setTradeTerms([]);
      }
    } catch (error) {
      console.log(error);
      setTradeTerms([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetLCNatures = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetLCNatures?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (response.data.Success) {
        setLcNatures(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setLcNatures([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetPortsOfLoading = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetPortOfLoading?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (response.data.Success) {
        setPortsOfLoading(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setPortsOfLoading([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetPortsOfDischarge = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetPortOfDischarge?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (response.data.Success) {
        setPortsOfDischarge(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setPortsOfDischarge([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetHSCodes = useCallback(async () => {

    try {
      const response = await Get(
        `CommercialModule/GetHSCodes`
      );
      if (response.data) {
        setHsCodes(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setHsCodes([]);
    }
  }, []);

  const GetBBLcs = useCallback(async () => {

    try {
      const response = await Get(
        `CommercialModule/GetImportLCList?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );

      if (response.data) {
        setBbLcs(response.data || []);
      }
    } catch (error) {
      console.log(error);
      setBbLcs([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // Fetch Import LC Details
  const GetImportLCDetails = useCallback(async (importLCID) => {
    if (!importLCID) {
      enqueueSnackbar('Please select a BB/Import LC', { variant: 'warning' });
      return;
    }
    setDialogLoading(true);
    try {
      const response = await Get(
        `CommercialModule/GetImportLCDetails?ImportLCID=${importLCID}`
      );
      if (Array.isArray(response.data)) {
        setLcdetailsDataList(response.data || []);
      } else if (response.data?.Success && Array.isArray(response.data.Data)) {
        setLcdetailsDataList(response.data.Data || []);
      } else {
        setLcdetailsDataList([]);
      }
    } catch (error) {
      console.log(error);
      setLcdetailsDataList([]);
      enqueueSnackbar('Failed to fetch Import LC Details', { variant: 'error' });
    } finally {
      setDialogLoading(false);
    }
  }, [enqueueSnackbar]);

  // Helper functions for Import LC Details
  const getLCDetailsRowId = (row) => `${row.AttachedPIDtlID}_${row.ItemID}_${row.InvCatID}_${row.SubCatID}`;

  const handleSelectLCDetailsRow = (row) => {
    const rowId = getLCDetailsRowId(row);
    const isSelectedInTemp = tempSelectedLCDetailsRows.some((selected) => getLCDetailsRowId(selected) === rowId);
    const isSelectedInFinal = selectedLCDetailsRows.some((selected) => getLCDetailsRowId(selected) === rowId);

    if (isSelectedInFinal) {
      enqueueSnackbar('This item is already in your final selection', { variant: 'warning' });
      return;
    }

    let updatedSelectedRows;
    if (isSelectedInTemp) {
      updatedSelectedRows = tempSelectedLCDetailsRows.filter((selected) => getLCDetailsRowId(selected) !== rowId);
    } else {
      updatedSelectedRows = [...tempSelectedLCDetailsRows, row];
    }
    setTempSelectedLCDetailsRows(updatedSelectedRows);
  };

  const handleRemoveLCDetailsRow = (row) => {
    const rowId = getLCDetailsRowId(row);
    const updatedSelectedRows = selectedLCDetailsRows.filter((selected) => getLCDetailsRowId(selected) !== rowId);
    setSelectedLCDetailsRows(updatedSelectedRows);
    // Clear form values for removed row
    setValue(`lcdetailsRowData.${rowId}.RollsOrBale`, undefined);
    setValue(`lcdetailsRowData.${rowId}.QCPassedRoll`, undefined);
    setValue(`lcdetailsRowData.${rowId}.QCFailedRoll`, undefined);
    setValue(`lcdetailsRowData.${rowId}.GRNReceivedRoll`, undefined);
  };

  const handleLCDetailsPageChange = (event, value) => setCurrentLCDetailsPage(value);

  const handleClearLCDetailsFilters = () => {
    setItemCodeFilter('');
  };

  const handleOpenLCDetails = () => {
    if (!values?.BBLc?.ImportLCID) {
      enqueueSnackbar('Please select a BB/Import LC', { variant: 'warning' });
      return;
    }
    handleClearLCDetailsFilters();
    setTempSelectedLCDetailsRows(selectedLCDetailsRows);
    setOpenLCDetails(true);
    GetImportLCDetails(values.BBLc.ImportLCID);
  };

  const handleAddLCDetails = () => {
    if (tempSelectedLCDetailsRows?.length === 0) {
      enqueueSnackbar('Please select at least one row.', { variant: 'error' });
      return;
    }

    const newRows = tempSelectedLCDetailsRows.filter(
      (tempRow) =>
        !selectedLCDetailsRows.some((selectedRow) => getLCDetailsRowId(selectedRow) === getLCDetailsRowId(tempRow))
    );

    if (newRows.length === 0) {
      enqueueSnackbar('All selected items are already added', { variant: 'warning' });
      return;
    }

    // Initialize text field values for new rows in form state
    newRows.forEach((row) => {
      const rowId = getLCDetailsRowId(row);
      setValue(`lcdetailsRowData.${rowId}.RollsOrBale`, '');
      setValue(`lcdetailsRowData.${rowId}.QCPassedRoll`, '');
      setValue(`lcdetailsRowData.${rowId}.QCFailedRoll`, '');
      setValue(`lcdetailsRowData.${rowId}.GRNReceivedRoll`, '');
    });

    setSelectedLCDetailsRows((prev) => [...prev, ...newRows]);
    setTempSelectedLCDetailsRows([]);
    setOpenLCDetails(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        GetGroupCodes(),
        GetGroupCurrencies(),
        GetBanks(),
        GetBBLCCurrencies(),
        GetPaymentTerms(),
        GetLCPurposes(),
        GetCountries(),
        GetSuppliers(),
        GetTradeTerms(),
        GetLCNatures(),
        GetPortsOfLoading(),
        GetPortsOfDischarge(),
        GetLCTypes(),
        GetCompanies(),
        GetFacilityBanks(),
        GetHSCodes(),
        GetBBLcs(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [
    GetGroupCodes,
    GetGroupCurrencies,
    GetBanks,
    GetBBLCCurrencies,
    GetPaymentTerms,
    GetLCPurposes,
    GetCountries,
    GetSuppliers,
    GetTradeTerms,
    GetLCNatures,
    GetPortsOfLoading,
    GetPortsOfDischarge,
    GetLCTypes,
    GetCompanies,
    GetFacilityBanks,
    GetHSCodes,
    GetBBLcs,
  ]);

  // Filter Import LC Details data based on filters
  useEffect(() => {
    if (lcdetailsDataList.length > 0) {
      let filtered = lcdetailsDataList;

      // Filter by ItemCode
      if (itemCodeFilter) {
        filtered = filtered.filter((item) =>
          item.ItemCode?.toLowerCase().includes(itemCodeFilter.toLowerCase())
        );
      }

      setFilteredLCDetailsData(filtered);
      setCurrentLCDetailsPage(1);
    } else {
      setFilteredLCDetailsData([]);
    }
  }, [lcdetailsDataList, itemCodeFilter]);

  // Clear Import LC Details when BBLc changes
  useEffect(() => {
    const currentBBLcId = values.BBLc?.ImportLCID;
    const prevBBLcId = prevBBLcRef.current;

    // Only clear if BBLc actually changed (not on initial mount)
    if (prevBBLcRef.current !== null && currentBBLcId !== prevBBLcId) {
      // Clear all selected fields when BBLc changes
      setSelectedLCDetailsRows([]);
      setTempSelectedLCDetailsRows([]);
      setLcdetailsDataList([]);
      setFilteredLCDetailsData([]);
      setItemCodeFilter('');
      setCurrentLCDetailsPage(1);
      setOpenLCDetails(false);
      // Clear form values for LC details
      const currentValues = values.lcdetailsRowData || {};
      Object.keys(currentValues).forEach((rowId) => {
        setValue(`lcdetailsRowData.${rowId}.RollsOrBale`, undefined);
        setValue(`lcdetailsRowData.${rowId}.QCPassedRoll`, undefined);
        setValue(`lcdetailsRowData.${rowId}.QCFailedRoll`, undefined);
        setValue(`lcdetailsRowData.${rowId}.GRNReceivedRoll`, undefined);
      });
    }

    // Update the ref with the current BBLc ID
    prevBBLcRef.current = currentBBLcId;
  }, [values.BBLc, setValue, values.lcdetailsRowData]);

  const SaveImportInvoiceEntry = async (dataToSend) => {
    try {
      const response = await Post(
        'CommercialModule/SaveImportInvoice',
        dataToSend
      );
      return response;
    } catch (error) {
      console.error('Error saving Import Invoice Entry:', error);
      throw error;
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    // Validate at least one Import LC Detail is selected
    if (selectedLCDetailsRows.length === 0) {
      enqueueSnackbar('Please select at least one Import LC Detail', { variant: 'warning' });
      return;
    }

    // Validate all four text fields are required for each row
    const missingFields = [];
    selectedLCDetailsRows.forEach((row, index) => {
      const rowId = getLCDetailsRowId(row);
      const rowData = data.lcdetailsRowData?.[rowId] || {};

      if (!rowData.RollsOrBale || rowData.RollsOrBale === '') {
        missingFields.push(`Row ${index + 1}: Rolls/Bale is required`);
      }
      if (!rowData.QCPassedRoll || rowData.QCPassedRoll === '') {
        missingFields.push(`Row ${index + 1}: QC Passed Roll is required`);
      }
      if (!rowData.QCFailedRoll || rowData.QCFailedRoll === '') {
        missingFields.push(`Row ${index + 1}: QC Failed Roll is required`);
      }
      if (!rowData.GRNReceivedRoll || rowData.GRNReceivedRoll === '') {
        missingFields.push(`Row ${index + 1}: GRN Received Roll is required`);
      }
    });



    // Build Details array from selected LC Details
    const details = selectedLCDetailsRows.map((row) => {
      const rowId = getLCDetailsRowId(row);
      const rowData = data.lcdetailsRowData?.[rowId] || {};

      return {
        AttachedPIDtlID: row.AttachedPIDtlID || 0,
        InvCatID: row.InvCatID || 0,
        SubCatID: row.SubCatID || 0,
        ItemID: row.ItemID || 0,
        UOMID: row.UOMID || 0,
        CIQty: parseFloat(row.PIQty || 0),
        CIRate: parseFloat(row.Rate || 0),
        CIAmount: parseFloat(row.Amount || 0),
        RollsOrBale: parseFloat(rowData.RollsOrBale || 0),
        QCPassedRoll: parseFloat(rowData.QCPassedRoll || 0),
        QCFailedRoll: parseFloat(rowData.QCFailedRoll || 0),
        GRNReceivedRoll: parseFloat(rowData.GRNReceivedRoll || 0),
      };
    });

    // Log data for debugging
    console.log('Form Data:', data);

    const dataToSend = {
      InvoiceTypeID: data.InvType?.id || null,
      CommercialInvoiceNo: data.ImportInvoiceEntryNo || '',
      InvoiceNo: data.ImportInvoiceEntryNo || '',
      InvoiceDate: data.ImportInvoiceEntryDate ? formatDate(data.ImportInvoiceEntryDate) : null,
      InvoiceValue: parseFloat(data.BBImportLCAmount || 0),
      CompanyID: 1, // Static as per requirement
      CurrencyID: data.Currency?.Currency_ID || null,
      ExchangeRate: parseFloat(data.ExchangeRate || 0),
      SupplierID: data.SupplierName?.VendorID || null,
      TradeTermID: data.TradeTerm?.TradeTermID || null,
      PayTermID: data.PayTerm?.Payment_term_ID || null,
      PayTermDays: parseFloat(data.Days || 0),
      ImportLCID: data.BBLc?.ImportLCID || null,
      PIRefNo: data.PIRefNo || '',
      DocStatusID: data.DocStatus?.id || null,
      BankRefNo: data.bankreferenceno || '',
      BankRefDate: data.BankReferenceDate ? formatDate(data.BankReferenceDate) : null,
      CompanyAcptDate: data.companyacceptancdate ? formatDate(data.companyacceptancdate) : null,
      BankAptDate: data.bankacceptancedate ? formatDate(data.bankacceptancedate) : null,
      BLNo: data.BLNo || '',
      BLDate: data.BLDate ? formatDate(data.BLDate) : null,
      CountryOfOriginID: data.Country?.Country_ID || null,
      VesselName: data.VesselName || '',
      ETAInHouse: data.ETADate ? formatDate(data.ETADate) : null,
      ETAPort: data.ETAPort?.PortID || null,
      ETADestPort: data.ETADestPort?.PortDischargeID || null,
      PortOfLoadingID: data.PortOfLoading?.PortID || null,
      PortOfDischargeID: data.PortOfDischarge?.PortDischargeID || null,
      ClearingAgentID: data.CleaningAgent?.VendorID || null,
      DocReceivedDate: data.DocReceivedDate ? formatDate(data.DocReceivedDate) : null,
      GoodsReceivedDate: data.goodsreceiveddate ? formatDate(data.goodsreceiveddate) : null,
      DocHandoverDate: data.Dochandoverdate ? formatDate(data.Dochandoverdate) : null,
      CustomHSCode: data.HSCode?.HSCode || '',
      DiscountAmount: parseFloat(data.DiscountAmount || 0),
      AdditionalCost: parseFloat(data.additionalcost || 0),
      IsFabric: isFabric,
      IsTrims: isTrims,
      IsChemical: isChemical,
      IsOthers: isOthers,
      IsDocReceivedComplete: isDocReceivedComplete,
      IsMaterialReceived: isMaterialReceived,
      IsCIClose: isCIClose,
      Remarks: data.Remarks || '',
      CreatedBy: userData?.userDetails?.userId || 1,
      // eslint-disable-next-line
      Org_ID: userData?.userDetails?.orgId || 1,
      // eslint-disable-next-line
      Branch_ID: userData?.userDetails?.branchID || 6,
      Details: details,





    };

    // Log final payload
    console.log('Final Payload to Send:', JSON.stringify(dataToSend, null, 2));

    try {
      const response = await SaveImportInvoiceEntry(dataToSend);
      console.log('API Response:', response);

      if (response.data.Success || response.status === 200) {
        enqueueSnackbar('Import Invoice Entry saved successfully!', { variant: 'success' });
        reset();
        router.push(paths.dashboard.Commercial.import.ImportInvoiceEntry.root);
      } else {
        enqueueSnackbar(response.data?.Message || 'Failed to save Import Invoice Entry', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error saving Import Invoice Entry:', error);
      console.error('Error Response:', error.response);

      if (error.response?.status === 400) {
        enqueueSnackbar(error.response.data?.Message || 'Validation error', { variant: 'error' });
      } else {
        enqueueSnackbar(error.response?.data?.Message || 'Error saving Import Invoice Entry', { variant: 'error' });
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

  // Paginated Import LC Details data
  const paginatedLCDetailsData = useMemo(() => {
    const startIndex = (currentLCDetailsPage - 1) * rowsPerPageLCDetails;
    return filteredLCDetailsData.slice(startIndex, startIndex + rowsPerPageLCDetails);
  }, [filteredLCDetailsData, currentLCDetailsPage, rowsPerPageLCDetails]);

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



                <RHFTextField name="ImportInvoiceEntryNo" label="Invoice No." fullWidth />

                <Controller
                  name="ImportInvoiceEntryDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Import Invoice Date"
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
                  name="InvType"
                  label="Invoice Type"
                  placeholder="Choose an option"
                  fullWidth
                  options={[
                    { id: 1, InvoiceTypeName: 'Local' },
                    { id: 2, InvoiceTypeName: 'Foreign' },
                  ]}
                  getOptionLabel={(option) => option?.InvoiceTypeName || ''}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  value={values?.InvType || null}
                />



                <RHFTextField
                  name="BBImportLCAmount"
                  label="BB/Import LC Amount"
                  type="number"
                  fullWidth
                />

                {/* 11. BBLC Currency */}
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

                {/* 12. Currency Rate */}
                <RHFTextField
                  name="ExchangeRate"
                  label="Exchange Rate"
                  type="number"
                  fullWidth
                />
                <RHFAutocomplete
                  name="SupplierName"
                  label="Supplier Name"
                  placeholder="Choose an option"
                  fullWidth
                  options={suppliers}
                  getOptionLabel={(option) => option?.VendorName || ''}
                  isOptionEqualToValue={(option, value) => option?.VendorID === value?.VendorID}
                  loading={isLoading}
                  value={values?.SupplierName || null}
                />

                <RHFAutocomplete
                  name="PayTerm"
                  label="Pay Term"
                  placeholder="Choose an option"
                  fullWidth
                  options={paymentTerms}
                  getOptionLabel={(option) => option?.Payment_Term || ''}
                  isOptionEqualToValue={(option, value) => option?.Payment_term_ID === value?.Payment_term_ID}
                  loading={isLoading}
                  value={values?.PayTerm || null}
                />
                <RHFAutocomplete
                  name="TradeTerm"
                  label="Trade Term"
                  placeholder="Choose an option"
                  fullWidth
                  options={tradeTerms}
                  getOptionLabel={(option) => option?.TradeTermName || ''}
                  isOptionEqualToValue={(option, value) => option?.TradeTermID === value?.TradeTermID}
                  loading={isLoading}
                  value={values?.TradeTerm || null}
                />

                <RHFTextField name="Days" label="Days" fullWidth />


                <RHFTextField name="BondNo" label="Bond No." fullWidth />


                <Controller
                  name="BondDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Bond Date"
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
                  name="BBLc" label="BBLc" fullWidth
                  options={bbLcs}
                  getOptionLabel={(option) => option?.BBImportLCNo || ''}
                  isOptionEqualToValue={(option, value) => option?.ImportLCID === value?.ImportLCID}
                  loading={isLoading}
                  value={values?.BBLc || null}
                />



                {/* 20. Shipping Mark */}
                <RHFTextField name="PIRefNo" label="PI Ref. No." fullWidth />

                {/* 21. Advising Bank */}
                <RHFAutocomplete
                  name="DocStatus"
                  label="Doc Status"
                  placeholder="Choose an option"
                  fullWidth
                  options={[{ id: 2, name: "Approved" }, { id: 1, name: "Pending" }]}
                  getOptionLabel={(option) => option?.name || ''}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  loading={isLoading}
                  value={values?.DocStatus || null}
                />


                <RHFTextField name="BLNo" label="B/L No." fullWidth />
                <Controller
                  name="BLDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="B/L Date"
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

                {/* 24. Supplier Bank */}
                <RHFAutocomplete
                  name="Country"
                  label="Country of Origin"
                  placeholder="Choose an option"
                  fullWidth
                  type="country"
                  options={countries}
                  getOptionLabel={(option) => option?.Country_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.Country_ID === value?.Country_ID}
                  loading={isLoading}
                  value={values?.Country || null}
                />

                {/* 25. Cover Note Book */}
                <RHFTextField name="VesselName" label="Vessel Name" fullWidth />



                <Controller
                  name="ETADate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="ETA in House"
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
                  name="PortOfLoading"
                  label="Port of loading"
                  placeholder="Choose an option"
                  fullWidth
                  options={portsOfLoading}
                  getOptionLabel={(option) => option?.PortName || ''}
                  isOptionEqualToValue={(option, value) => option?.PortID === value?.PortID}
                  loading={isLoading}
                  value={values?.PortOfLoading || null}
                />

                <RHFAutocomplete
                  name="PortOfDischarge"
                  label="Port Of Discharge"
                  placeholder="Choose an option"
                  fullWidth
                  options={portsOfDischarge}
                  getOptionLabel={(option) => option?.PortDischargeName || ''}
                  isOptionEqualToValue={(option, value) => option?.PortDischargeID === value?.PortDischargeID}
                  loading={isLoading}
                  value={values?.PortOfDischarge || null}
                />


                {/* 32. LC For */}
                <RHFAutocomplete
                  name="Localtransportagent"
                  label="Local Transport Agent"
                  placeholder="Choose an option"
                  fullWidth
                  options={suppliers}
                  getOptionLabel={(option) => option?.VendorName || ''}
                  isOptionEqualToValue={(option, value) => option?.VendorID === value?.VendorID}
                  value={values?.Localtransportagent || null}
                />

                {/* 33. Tolerance% */}
                <RHFTextField
                  name="bankreferenceno"
                  label="Bank Reference No."
                  type="number"
                  fullWidth
                />

                <Controller
                  name="BankReferenceDate"
                  control={control}
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
                  name="companyacceptancdate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Company Acceptance Date"
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
                  name="bankacceptancedate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Bank Acceptance Date"
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
                  name="DocReceivedDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Doc Received Date"
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
                  name="goodsreceiveddate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Goods Received Date"
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
                  name="CleaningAgent"
                  label="Cleaning Agent"
                  placeholder="Choose an option"
                  fullWidth
                  options={suppliers}
                  getOptionLabel={(option) => option?.VendorName || ''}
                  isOptionEqualToValue={(option, value) => option?.VendorID === value?.VendorID}
                  value={values?.CleaningAgent || null}
                />

                <Controller
                  name="Dochandoverdate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Doc Handover Date"
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
                  name="ETAPort"
                  label="ETA Port"
                  placeholder="Choose an option"
                  fullWidth
                  options={portsOfLoading}
                  getOptionLabel={(option) => option?.PortName || ''}
                  isOptionEqualToValue={(option, value) => option?.PortID === value?.PortID}
                  loading={isLoading}
                  value={values?.ETAPort || null}
                />

                <RHFAutocomplete
                  name="ETADestPort"
                  label="ETA Destination Port"
                  placeholder="Choose an option"
                  fullWidth
                  options={portsOfDischarge}
                  getOptionLabel={(option) => option?.PortDischargeName || ''}
                  isOptionEqualToValue={(option, value) => option?.PortDischargeID === value?.PortDischargeID}
                  loading={isLoading}
                  value={values?.ETADestPort || null}
                />

                {/* 36. H.S Code */}
                <RHFAutocomplete
                  name="HSCode"
                  label="H.S Code"
                  placeholder="Choose an option"
                  fullWidth
                  options={hsCodes}
                  getOptionLabel={(option) => option?.HSCode || ''}
                  isOptionEqualToValue={(option, value) => option?.HSCodeID === value?.HSCodeID}
                  value={values?.HSCode || null}
                />


                {/* 37. UD / IP no */}
                <RHFTextField name="DiscountAmount" label="Discount Amount" fullWidth />
                <RHFTextField name="additionalcost" label="Additional Cost" fullWidth />

                <RHFTextField
                  name="Remarks"
                  label="Remarks"
                  fullWidth
                  sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 3' } }}
                  multiline
                  rows={3}
                />

              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isFabric}
                      onChange={(e) => setIsFabric(e.target.checked)}
                    />
                  }
                  label="Fabric"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isTrims}
                      onChange={(e) => setIsTrims(e.target.checked)}
                    />
                  }
                  label="Trims"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isChemical}
                      onChange={(e) => setIsChemical(e.target.checked)}
                    />
                  }
                  label="Chemical"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isOthers}
                      onChange={(e) => setIsOthers(e.target.checked)}
                    />
                  }
                  label="Others"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isDocReceivedComplete}
                      onChange={(e) => setIsDocReceivedComplete(e.target.checked)}
                    />
                  }
                  label="Doc Received Complete"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isMaterialReceived}
                      onChange={(e) => setIsMaterialReceived(e.target.checked)}
                    />
                  }
                  label="Material Received"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isCIClose}
                      onChange={(e) => setIsCIClose(e.target.checked)}
                    />
                  }
                  label="CI Close"
                />
              </Box>
            </Card>

            {/* Import LC Details Section */}
            <Card sx={{ mt: 3, p: 2 }}>
              <Box>
                <Box display="flex" flexWrap="wrap" justifyContent="space-between">
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    Import LC Details
                  </Typography>

                  {/* Add Import LC Details Button */}
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
                      onClick={handleOpenLCDetails}
                      disabled={!values.BBLc}
                    >
                      Add Import LC Details
                    </Button>
                  </Box>
                </Box>

                {/* Popup Dialog */}
                <Dialog open={openLCDetails} fullWidth maxWidth="lg">
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <DialogTitle sx={{ mt: 2 }}>Select Import LC Details</DialogTitle>
                    <DialogTitle>
                      <IconButton onClick={() => setOpenLCDetails(false)}>
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
                            {/* ItemCode Filter */}
                            <TextField
                              label="Filter by Item Code"
                              value={itemCodeFilter}
                              onChange={(e) => setItemCodeFilter(e.target.value)}
                              sx={{ minWidth: 200 }}
                              placeholder="Enter Item Code"
                            />

                            {/* Clear Filters Button */}
                            <Button
                              variant="outlined"
                              onClick={handleClearLCDetailsFilters}
                              size="small"
                              sx={{ height: 40 }}
                            >
                              Clear Filters
                            </Button>
                          </Box>
                        </Card>

                        {/* Data Table Inside Dialog */}
                        {filteredLCDetailsData.length > 0 && (
                          <Scrollbar>
                            <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 400 }}>
                              <Table stickyHeader>
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ minWidth: 80 }}>Select</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Category</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Sub Category</TableCell>
                                    <TableCell sx={{ minWidth: 180 }}>Item Description</TableCell>
                                    <TableCell sx={{ minWidth: 130 }}>Item Code</TableCell>
                                    <TableCell sx={{ minWidth: 100 }}>UOM</TableCell>
                                    <TableCell sx={{ minWidth: 100, textAlign: 'right' }}>
                                      Quantity
                                    </TableCell>
                                    <TableCell sx={{ minWidth: 100, textAlign: 'right' }}>
                                      Rate
                                    </TableCell>
                                    <TableCell sx={{ minWidth: 150, textAlign: 'right' }}>
                                      Amount
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {paginatedLCDetailsData.map((row, index) => {
                                    const rowId = getLCDetailsRowId(row);
                                    return (
                                      <TableRow key={index}>
                                        <TableCell>
                                          <Checkbox
                                            checked={tempSelectedLCDetailsRows.some(
                                              (selected) => getLCDetailsRowId(selected) === rowId
                                            )}
                                            onChange={() => handleSelectLCDetailsRow(row)}
                                          />
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                          {row.Inv_Cat_Name}
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                          {row.SubCat_Name}
                                        </TableCell>
                                        <Tooltip title={row.ItemDescription || '-'} arrow>
                                          <TableCell
                                            sx={{
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              maxWidth: 200,
                                            }}
                                          >
                                            <span>{row.ItemDescription}</span>
                                          </TableCell>
                                        </Tooltip>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                          {row.ItemCode}
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                          {row.UOMName}
                                        </TableCell>
                                        <TableCell
                                          sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                        >
                                          {fNumber(row.PIQty)}
                                        </TableCell>
                                        <TableCell
                                          sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                        >
                                          {fNumber(row.Rate)}
                                        </TableCell>
                                        <TableCell
                                          sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                        >
                                          {fNumber(row.Amount)}
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
                        {filteredLCDetailsData.length === 0 && lcdetailsDataList.length === 0 && (
                          <Box sx={{ textAlign: 'center', p: 3 }}>
                            <Typography variant="body1" color="text.secondary">
                              No data found matching your filters.
                            </Typography>
                          </Box>
                        )}

                        {/* Pagination */}
                        {filteredLCDetailsData.length > rowsPerPageLCDetails && (
                          <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
                            <Pagination
                              count={Math.ceil(filteredLCDetailsData.length / rowsPerPageLCDetails)}
                              page={currentLCDetailsPage}
                              onChange={handleLCDetailsPageChange}
                              color="primary"
                            />
                          </Box>
                        )}
                      </DialogContent>
                      <DialogActions>
                        <Button variant="contained" onClick={handleAddLCDetails}>
                          Add Details
                        </Button>
                      </DialogActions>
                    </>
                  )}
                </Dialog>
                {/* Selected Items Displayed Outside */}
                {selectedLCDetailsRows.length > 0 && (
                  <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ p: 2 }}>
                      Selected Import LC Details
                    </Typography>

                    <Scrollbar>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ minWidth: 80 }}>Remove</TableCell>
                            <TableCell sx={{ minWidth: 150 }}>Category</TableCell>
                            <TableCell sx={{ minWidth: 150 }}>Sub Category</TableCell>
                            <TableCell sx={{ minWidth: 180 }}>Item Description</TableCell>
                            <TableCell sx={{ minWidth: 120 }}>Item Code</TableCell>
                            <TableCell sx={{ minWidth: 100 }}>UOM</TableCell>
                            <TableCell sx={{ minWidth: 100 }} align="right">
                              Quantity
                            </TableCell>
                            <TableCell sx={{ minWidth: 120 }} align="right">
                              Rate
                            </TableCell>
                            <TableCell sx={{ minWidth: 130 }} align="right">
                              Amount
                            </TableCell>
                            <TableCell sx={{ minWidth: 120 }}>Rolls</TableCell>
                            <TableCell sx={{ minWidth: 150 }}>QC Passed Roll</TableCell>
                            <TableCell sx={{ minWidth: 150 }}>QC Failed Roll</TableCell>
                            <TableCell sx={{ minWidth: 170 }}>GRN Received Roll</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedLCDetailsRows.map((row, index) => {
                            const rowId = getLCDetailsRowId(row);
                            return (
                              <TableRow key={index}>
                                <TableCell>
                                  <IconButton
                                    color="error"
                                    onClick={() => handleRemoveLCDetailsRow(row)}
                                  >
                                    <Iconify icon="solar:trash-bin-trash-bold" />
                                  </IconButton>
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  {row.Inv_Cat_Name}
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  {row.SubCat_Name}
                                </TableCell>
                                <Tooltip title={row.ItemDescription || '-'} arrow>
                                  <TableCell
                                    sx={{
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      maxWidth: 200,
                                    }}
                                  >
                                    <span>{row.ItemDescription}</span>
                                  </TableCell>
                                </Tooltip>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.ItemCode}</TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.UOMName}</TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                  {fNumber(row.PIQty)}
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                  {fNumber(row.Rate)}
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                  {fNumber(row.Amount)}
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                  <RHFTextField
                                    name={`lcdetailsRowData.${rowId}.RollsOrBale`}
                                    type="number"
                                    size="small"
                                    fullWidth
                                  />
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                  <RHFTextField
                                    name={`lcdetailsRowData.${rowId}.QCPassedRoll`}
                                    type="number"
                                    size="small"
                                    fullWidth

                                  />
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                  <RHFTextField
                                    name={`lcdetailsRowData.${rowId}.QCFailedRoll`}
                                    type="number"
                                    size="small"
                                    fullWidth

                                  />
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                  <RHFTextField
                                    name={`lcdetailsRowData.${rowId}.GRNReceivedRoll`}
                                    type="number"
                                    size="small"
                                    fullWidth

                                  />
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
