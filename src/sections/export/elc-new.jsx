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
import { decrypt, encrypt } from 'src/api/encryption';

import { DesktopDatePicker } from '@mui/x-date-pickers';
import { grid } from '@mui/system';
import PricelistDialog from '../quotation/PricelistDialog';
import { convertBDTtoUSD } from 'src/utils/BDTtoUSD';
import Iconify from 'src/components/iconify';
import OpportunityDialog from '../sample/OpportunityDialog';
import QuotationDialog from '../sample/QuotationDialog';
import PropTypes from 'prop-types';
import AutocompleteWithMultiAdd from 'src/components/AutocompleteWithMultiAdd';
import { fCurrency, fNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import AutocompleteWithDropDown from 'src/components/AutocompleteWithDropDown';

// ----------------------------------------------------------------------

export default function ExportCreateForm() {
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
  const [allNotifyParties, setAllNotifyParties] = useState([]);
  const [consignParties, setConsignParties] = useState([]);
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

  // PINO: Yup.string().required('PI No is required'),
  // LCDate: Yup.date().required('L/C Date is required'),
  // // LCNo: Yup.string().required('L/C No is required'),
  // Buyer: Yup.object().required('Buyer is required'),
  // LcAmount: Yup.number().required('L/C Amount is required').min(0, 'Amount must be positive'),
  // Currency: Yup.object().required('Currency is required'),
  // LienBank: Yup.object().required('Lien Bank is required'),
  // PaymentTerms: Yup.object().required('Payment Term is required'),
  // FileReferenceNo: Yup.string().required('File Reference No is required'),
  const NewPiSchema = Yup.object().shape({
    LCNo: Yup.string().required('L/C No is required'),
    LCDate: Yup.date().required('L/C Date is required'),
    FileReferenceNo: Yup.string().required('File Reference No is required'),
    Customer: Yup.object().required('Customer is required'),
    Beneficiary: Yup.object().required('Beneficiary is required'),
    OpeningBank: Yup.object().required('Opening Bank is required'),
    LienBank: Yup.object().required('Lien Bank is required'),
    LienDate: Yup.date().required('Lien Date is required'),
    recievethrough: Yup.object().required('Receive Through is required'),
    Currency: Yup.object().required('Currency is required'),
    Tolerance: Yup.number()
      .min(0, 'Tolerance must be positive')
      .typeError('Tolerance must be a number')
      .required('Tolerance is required'),
    ShipDate: Yup.date().required('Ship Date is required'),
    LCFor: Yup.object().required('L/C For is required'),
    MaxImportLimitPercent: Yup.number()
      .min(0, 'Max Import Limit must be positive')
      .max(100, 'Max Import Limit cannot exceed 100%')
      .typeError('Max Import Limit must be a number')
      .required('Max Import Limit is required'),
    ExpiryDate: Yup.date().required('Expiry Date is required'),
    LCNature: Yup.object().required('L/C Nature is required'),
    Incoterm: Yup.object().required('Incoterm is required'),
    MasterNo: Yup.string().required('Master No is required'),
    payterm: Yup.object().required('Pay Term is required'),

    Tenor: Yup.string().required('Tenor is required'),
    Consignee: Yup.object().required('Consignee is required'),
    NotifyParty: Yup.object().required('Notify Party is required'),
    FinalDestination: Yup.string().required('Final Destination is required'),
    Portofloading: Yup.object().required('Port of Loading is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewPiSchema),
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
      const defaultIncoTerm = response.data.Data.find((term) => term.IncotermID === 2) || null;
      setValue('Incoterm', defaultIncoTerm);
      return response.data.Data;
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, setValue]);
  // eslint-disable-next-line
  const GetNotifyParties = useCallback(async (wicId = null) => {
    try {
      let url = `CommercialModule/GetNotifyPartyDropdown?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`;
      if (wicId) {
        url += `&WICID=${wicId}`;
      }
      const response = await Get(url);
      setAllNotifyParties(response.data.Data);

      // eslint-disable-next-line
      return response.data.Data;
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // eslint-disable-next-line
  const GetConsignees = useCallback(async (wicId = null) => {
    try {
      let url = `CommercialModule/GetConsigneeDropdown?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`;
      if (wicId) {
        url += `&WICID=${wicId}`;
      }
      const response = await Get(url);
      setConsignParties(response.data.Data);

      // eslint-disable-next-line
      return response.data.Data;
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // eslint-disable-next-line
  const GetLCPurposes = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetLCPurposes?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllLCPurposes(response.data.Data);
      const defaultLCPurpose = response.data.Data.find((purpose) => purpose.PurposeID === 1) || null;
      setValue('LCFor', defaultLCPurpose);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, setValue]);

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
      const defaultPOL = response.data.Data.find((pol) => pol.PortID === 2) || null;
      setValue('Portofloading', defaultPOL);
      return response.data.Data;
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, setValue]);

  // eslint-disable-next-line
  const GetLCNatures = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetLCNatures?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllCINatures(response.data.Data);
      const defaultLCNature = response.data.Data.find((nature) => nature.LCNatureID === 3) || null;
      setValue('LCNature', defaultLCNature);
      return response.data.Data;
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, setValue]);

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

      const response = await Get(`CommercialModule/GetBankDropdown?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`)
      const banks = response.data.Data;
      setAllBanks(banks);

      // find the bank with ID = 1
      const defaultBank = banks.find(bank => bank.BankID === 1) || null;

      // set default value in your form
      setValue('recievethrough', defaultBank);
      setValue('LienBank', defaultBank);

      return response.data.Data;
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, setValue]);

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


  useEffect(() => {
    const fetchCustomerData = async () => {
      if (values.Customer?.WIC_ID) {
        const notifyParties = await GetNotifyParties(values.Customer.WIC_ID);
        if (notifyParties && notifyParties.length > 0) {
          setValue('NotifyParty', notifyParties[0]);
        }

        const consignees = await GetConsignees(values.Customer.WIC_ID);
        if (consignees && consignees.length > 0) {
          setValue('Consignee', consignees[0]);
        }
      }
    };
    fetchCustomerData();
  }, [values.Customer?.WIC_ID, GetNotifyParties, GetConsignees, setValue]);

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
        GetConsignees(),
        GetNotifyParties(),
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
    GetConsignees,
    GetNotifyParties,
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

  const onSubmit = handleSubmit(async (data) => {
    // Prepare Breakdown Details from selectedRows
    const breakdownDetails = selectedRows.map((row) => ({
      PIDtlID: row.PIDtlID || 0,
      PIID: row.PIID || 0,
      PriceList_ID: row.PriceList_ID || 0,
      CompositionID: row.CompositionID || 0,
      YarnTypeID: row.YarnTypeID || 0,
      ColorID: row.ColorID || 0,
      CountID: row.CountID || 0,
      Item_Code: row.Item_Code || '',
      Quantity: parseFloat(row.Quantity) || 0,
      UOMID: row.UOMID || 0,
      UnitPrice: parseFloat(row.UnitPrice) || 0,
      Total_Amount: parseFloat(row.Total_Amount) || 0,
      Description: row.ProductDescription || '',
      Remarks: row.Remarks || '',
      SustainabilityID: row.SustainabilityID || 0,
      FabricTypeID: row.FabricTypeID || 0,
      ItemCodePrefix: row.ItemCodePrefix || '',
      ConesQty: parseFloat(row.ConesQty) || 0,
      DeliveryDueDate: row.DeliveryDueDate ? formatDate(new Date(row.DeliveryDueDate)) : null,
    }));
    if (breakdownDetails.length === 0) {
      enqueueSnackbar('Please add at least one item to export.', { variant: 'error' });
      return;
    }

    const exportLCData = {
      // Basic LC Information
      ExportLCNo: data.LCNo || '',
      FileRef: data.FileReferenceNo || '',
      LCDate: data.LCDate ? formatDate(data.LCDate) : null,
      WIC_ID: data.Customer?.WIC_ID || 0,
      CentralBankReportingNo: data.centralbankingno || '',
      // Bank Information
      BeneficiaryID: data.Beneficiary?.BeneficiaryID || 0,
      OpeningBankID: data.OpeningBank?.BankBranchID || 0,
      LienBankID: data.LienBank?.BankID || 0,
      LienDate: data.LienDate ? formatDate(data.LienDate) : null,
      ReceiveThroughBankID: data.recievethrough?.BankID || 0,

      // LC Details
      ExpiryDate: data.ExpiryDate ? formatDate(data.ExpiryDate) : null,
      LCNatureID: data.LCNature?.LCNatureID || 0,
      IncotermID: data.Incoterm?.IncotermID || 0,
      MasterLC_SCNo: data.MasterNo || '',
      PayTermID: data.payterm?.Payment_term_ID || 0,

      // Financial Information
      CurrencyID: data.Currency?.Currency_ID || 0,
      ExportLCAmount: totalAmount || 0,
      TolerancePercent: parseFloat(data.Tolerance || 0),

      // Shipping Information
      ShipDate: data.ShipDate ? formatDate(data.ShipDate) : null,
      LCPurposeID: data.LCFor?.PurposeID || 0,
      FreightAmount: parseFloat(data.FreightAmt || 0),
      Tenor: data.Tenor || '',
      NotifyPartyID: data.NotifyParty?.NotifyPartyID || '',
      ConsigneeID: data.Consignee?.ConsigneeID || '',
      FinalDestination: data.FinalDestination || '',
      PortID: data.Portofloading.PortID || '',
      MaxImportLimit: parseFloat(data.MaxImportLimitPercent || 0),

      // Additional Information
      Remarks: data.Remarks || '',

      // User and Organization Information
      CreatedBy: userData?.userDetails?.userId,
      Org_ID: userData?.userDetails?.orgId,
      Branch_ID: userData?.userDetails?.branchID,

      // Breakdown Details
      BreakdownDetails: breakdownDetails,
    };
    console.log(exportLCData);


    try {
      const response = await Post('CommercialModule/SaveExportLC', exportLCData);

      if (response.status === 200) {
        enqueueSnackbar(' L/C Tagging Created Successfully!');
        router.push(paths.dashboard.Commercial.export.ExportLC.root);
      } else {
        enqueueSnackbar('Failed to create L/C Tagging!', { variant: 'error' });
      }
    } catch (error) {
      console.error('L/C Tagging Error:', error);

      enqueueSnackbar('Failed to create L/C Tagging!', { variant: 'error' });
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
  const PostNotifyParty = async ({ NotifyPartyName, Address }) => {
    if (!NotifyPartyName || !Address) return;

    const newOptionTrimmed = NotifyPartyName.trim().toLowerCase();

    if (
      allNotifyParties.find((option) => option.NotifyPartyName.trim().toLowerCase() === newOptionTrimmed)
    ) {
      enqueueSnackbar('Notify Party Name Exists', { variant: 'error' });
      return;
    }

    const dataToSend = {
      NotifyPartyName,
      Address,

      CreatedBy: userData?.userDetails?.userId,
      Org_ID: userData?.userDetails?.orgId,
      Branch_ID: userData?.userDetails?.branchID,
    };

    try {
      await Post('CommercialModule/AddNotifyParty', dataToSend);

      const updatedBankList = await GetNotifyParties();

      const newlyAdded = updatedBankList.find(
        (b) => b.NotifyPartyName.trim().toLowerCase() === newOptionTrimmed
      );

      enqueueSnackbar('Notify Party Added Successfully', { variant: 'success' });
      if (newlyAdded) {
        setTypesData((prev) => ({
          ...prev,
          dropData: newlyAdded,
        }));
      }
    } catch (error) {
      enqueueSnackbar('Notify Party not Added Successfully', { variant: 'error' });
      console.error('Error adding Notify Party:', error);
    }
  };

  const PostConsigneeParty = async ({ ConsigneeName, Address }) => {
    if (!ConsigneeName || !Address) return;

    const newOptionTrimmed = ConsigneeName.trim().toLowerCase();

    if (
      consignParties.find((option) => option.ConsigneeName.trim().toLowerCase() === newOptionTrimmed)
    ) {
      enqueueSnackbar('Consignee Name Exists', { variant: 'error' });
      return;
    }

    const dataToSend = {
      ConsigneeName,
      Address,

      CreatedBy: userData?.userDetails?.userId,
      Org_ID: userData?.userDetails?.orgId,
      Branch_ID: userData?.userDetails?.branchID,
    };

    try {
      await Post('CommercialModule/AddConsignee', dataToSend);

      const updatedBankList = await GetConsignees();

      const newlyAdded = updatedBankList.find(
        (b) => b.ConsigneeName.trim().toLowerCase() === newOptionTrimmed
      );

      enqueueSnackbar('Consignee Party Added Successfully', { variant: 'success' });
      if (newlyAdded) {
        setTypesData((prev) => ({
          ...prev,
          dropData: newlyAdded,
        }));
      }
    } catch (error) {
      enqueueSnackbar('Consignee Party not Added Successfully', { variant: 'error' });
      console.error('Error adding Consignee Party:', error);
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
                      format="dd/MM/yyyy"
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

            <Card sx={{ mt: 3, p: 2 }}>
              <Box>
                <Box display="flex" flexWrap="wrap" justifyContent="space-between">
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    PI Specific Information
                  </Typography>

                  {/* Add Item Details Button */}
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
                      disabled={!values.Customer}
                    >
                      Add PI Details
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
                    <DialogTitle sx={{ mt: 2 }}>Select PI Details</DialogTitle>
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
                              // mb: 3,
                              // p: 2,
                              // backgroundColor: 'background.neutral',
                              borderRadius: 1,
                              flexWrap: 'wrap',
                            }}
                          >
                            {/* PINo Filter */}
                            <TextField
                              label="Filter by PINo"
                              value={piNoFilter}
                              onChange={(e) => setPiNoFilter(e.target.value)}
                              sx={{ minWidth: 200 }}
                              placeholder="Enter PINo"
                            />

                            <DesktopDatePicker
                              label="Filter By Date"
                              format="dd/MM/yyyy"
                              value={piDateFilter || null}
                              onChange={(value) => setPiDateFilter(value)}
                            />
                            {/* Clear Filters Button */}
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
                                    <TableCell sx={{ minWidth: 100 }}>PINo</TableCell>
                                    <TableCell sx={{ minWidth: 120 }}>PI Date</TableCell>

                                    <TableCell sx={{ minWidth: 150 }}>WIC Name</TableCell>
                                    <TableCell sx={{ minWidth: 180 }}>
                                      Product Description
                                    </TableCell>
                                    <TableCell sx={{ minWidth: 130 }}>Item Code</TableCell>
                                    <TableCell sx={{ minWidth: 100, textAlign: 'right' }}>
                                      Quantity
                                    </TableCell>
                                    <TableCell sx={{ minWidth: 100, textAlign: 'right' }}>
                                      Unit Price
                                    </TableCell>
                                    <TableCell sx={{ minWidth: 150, textAlign: 'right' }}>
                                      Total Amount
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
                                          {row.PINo}
                                        </TableCell>
                                        <TableCell>{ToUTCISOString(row.PIDate)}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                          {row.WIC_Name}
                                        </TableCell>
                                        <Tooltip title={row.ProductDescription || '-'} arrow>
                                          <TableCell
                                            sx={{
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              maxWidth: 200,
                                            }}
                                          >
                                            <span>{row.ProductDescription}</span>
                                          </TableCell>
                                        </Tooltip>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                          {row.Item_Code}
                                        </TableCell>
                                        <TableCell
                                          sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                        >
                                          {`${fNumber(row.Quantity)} ${row.UOMName}`}
                                        </TableCell>
                                        <TableCell
                                          sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                        >
                                          {fNumber(row.UnitPrice)}
                                        </TableCell>
                                        <TableCell
                                          sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                        >
                                          {fNumber(row.Total_Amount)}
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
                        {filteredData.length === 0 && dataList.length === 0 && (
                          <Box sx={{ textAlign: 'center', p: 3 }}>
                            <Typography variant="body1" color="text.secondary">
                              No data found matching your filters.
                            </Typography>
                          </Box>
                        )}

                        {/* Pagination */}
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
                      Selected Items
                    </Typography>

                    <Scrollbar>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ minWidth: 80 }}>Remove</TableCell>
                            <TableCell sx={{ minWidth: 100 }}>PINo</TableCell>

                            <TableCell sx={{ minWidth: 120 }}>PI Date</TableCell>

                            <TableCell sx={{ minWidth: 150 }}>WIC Name</TableCell>
                            <TableCell sx={{ minWidth: 180 }}>Product Description</TableCell>
                            <TableCell sx={{ minWidth: 120 }}>Item Code</TableCell>
                            <TableCell sx={{ minWidth: 100 }} align='right'>Quantity</TableCell>
                            {/* <TableCell sx={{ minWidth: 80 }}>UOM</TableCell> */}
                            <TableCell sx={{ minWidth: 120 }} align='right'>Unit Price</TableCell>
                            <TableCell sx={{ minWidth: 130 }} align='right'>Total Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedRows.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <IconButton color="error" onClick={() => handleRemoveRow(row)}>
                                  <Iconify icon="solar:trash-bin-trash-bold" />
                                </IconButton>
                              </TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.PINo}</TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{ToUTCISOString(row.PIDate)}</TableCell>

                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.WIC_Name}</TableCell>
                              <Tooltip title={row.ProductDescription || '-'} arrow>
                                <TableCell
                                  sx={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: 200,
                                  }}
                                >
                                  <span>{row.ProductDescription}</span>
                                </TableCell>
                              </Tooltip>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.Item_Code}</TableCell>
                              <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>{`${fNumber(row.Quantity)} ${row.UOMName}`}</TableCell>

                              {/* <TableCell>{row.UOMName}</TableCell> */}
                              <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>{fNumber(row.UnitPrice)}</TableCell>

                              <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>{fNumber(row.Total_Amount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Scrollbar>
                  </TableContainer>
                )}
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


                <RHFAutocomplete
                  name="OpeningBank"
                  label="Opening Bank"
                  fullWidth
                  options={allBanks}
                  getOptionLabel={(option) => option?.BankName || ''}
                  isOptionEqualToValue={(option, value) => option?.BankID === value?.BankID}
                  value={values.OpeningBank || null}



                />

                {/* Line Bank */}
                <RHFAutocomplete
                  name="LienBank"
                  label="Lien Bank"
                  fullWidth
                  options={allBanks}
                  getOptionLabel={(option) => option?.BankName || ''}
                  isOptionEqualToValue={(option, value) => option?.BankID === value?.BankID}
                  value={values.LienBank || null}
                // onAdd={PostBank}
                // fields={[
                //   { name: 'BankName', label: 'Bank Name' },
                //   { name: 'BranchName', label: 'Branch Name' },
                //   { name: 'Address', label: 'Address' },
                // ]}
                />

                <Controller
                  name="LienDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Lien Date"
                      format="dd/MM/yyyy"
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
                  name="recievethrough"
                  label="Recieve through Bank"
                  fullWidth
                  options={allBanks}
                  getOptionLabel={(option) => option?.BankName || ''}
                  isOptionEqualToValue={(option, value) => option?.BankID === value?.BankID}
                  value={values.recievethrough || null}
                // onAdd={PostBank}
                // fields={[
                //   { name: 'BankName', label: 'Bank Name' },
                //   { name: 'BranchName', label: 'Branch Name' },
                //   { name: 'Address', label: 'Address' },
                // ]}
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
                  defaultValue={5}
                />

                {/* Ship Date */}
                <Controller
                  name="ShipDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Ship Date"
                      format="dd/MM/yyyy"
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
                  defaultValue={70}
                />

                <Controller
                  name="ExpiryDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Expiry Date"
                      format="dd/MM/yyyy"
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
                <RHFAutocomplete
                  name="Consignee"
                  label="Consignee"
                  options={consignParties}
                  getOptionLabel={(option) => option?.ConsigneeName || ''}
                  isOptionEqualToValue={(option, value) => option?.ConsigneeID === value?.ConsigneeID}
                  value={values.Consignee || null}

                />

                {/* Notify Party */}
                <RHFAutocomplete
                  name="NotifyParty"
                  label="Notify Party"
                  options={allNotifyParties}
                  getOptionLabel={(option) => option?.NotifyPartyName || ''}
                  isOptionEqualToValue={(option, value) => option?.NotifyPartyID === value?.NotifyPartyID}
                  value={values.NotifyParty || null}

                />

                {/* Final Destination */}
                <RHFTextField
                  name="FinalDestination"
                  label="Final Destination"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  defaultValue="Applicant's Factory"
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