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
  FormControlLabel,
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
import { AgGridReact } from 'ag-grid-react';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

export default function ImportLCCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Date In SQL format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // State for Import LC fields
  const [isApplied, setIsApplied] = useState(false);
  const [transShipment, setTransShipment] = useState(false);
  const [confirmationRequested, setConfirmationRequested] = useState(false);
  const [issuedBy, setIssuedBy] = useState(false);
  const [issuedByTeletransmission, setIssuedByTeletransmission] = useState(false);
  const [partialShipment, setPartialShipment] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
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

  // Static dropdown options
  const companyOptions = [{ id: 1, name: 'Simco Spinning and Textile Ltd.' }];
  const maturityDateFromOptions = [{ id: 1, name: 'Acceptance' }];
  const lcForOptions = [{ id: 1, name: 'Other' }];

  const [isLoading, setLoading] = useState(true);

  // AG Grid states
  const [piMasterData, setPiMasterData] = useState([]);
  const [piDetailData, setPiDetailData] = useState({});
  const [gridLoading, setGridLoading] = useState(false);
  const [selectedPiRows, setSelectedPiRows] = useState([]);

  const ImportLCSchema = Yup.object().shape({
    ApplicationDate: Yup.date().required('Application Date is required'),
    BBImportLCNO: Yup.string().required('BB/Import LC No is required'),
    BBImportLCDate: Yup.date().required('BB/Import LC Date is required'),
    LCType: Yup.object().required('LC Type is required'),
    GroupCode: Yup.string().required('Group Code is required'),
    GroupCurrency: Yup.object().required('Group Currency is required'),
    ConversionRate: Yup.number().min(0, 'Conversion Rate must be positive'),
    ExchangeRate: Yup.number().min(0, 'Exchange Rate must be positive'),
    OpeningBank: Yup.object().required('Opening Bank is required'),
    BBImportLCAmount: Yup.number().min(0, 'BB/Import LC Amount must be positive'),
    BBLCCurrency: Yup.object().required('BBLC Currency is required'),
    CurrencyRate: Yup.number().min(0, 'Currency Rate must be positive'),
    PayTerm: Yup.object().required('Pay Term is required'),
    BankFacility: Yup.object().required('Bank Facility is required'),
    Company: Yup.object().required('Company is required'),
    Purpose: Yup.object().required('Purpose is required'),
    LatestShipDate: Yup.date().required('Latest Ship Date is required'),
    LCExpiryDate: Yup.date().required('LC Expiry Date is required'),
    ExpiryPlace: Yup.object().required('Expiry Place is required'),
    ShippingMark: Yup.string().required('Shipping Mark is required'),
    AdvisingBank: Yup.object().required('Advising Bank is required'),
    Tenor: Yup.string().required('Tenor is required'),
    SupplierName: Yup.object().required('Supplier Name is required'),
    SupplierBank: Yup.object().required('Supplier Bank is required'),
    CoverNoteBook: Yup.string(),
    InsuranceCompany: Yup.object().required('Insurance Company is required'),
    TradeTerm: Yup.object().required('Trade Term is required'),
    Nature: Yup.object().required('Nature is required'),
    MaturityDateFrom: Yup.date().required('Maturity Date is required'),
    PortOfLoading: Yup.object().required('Port of Loading is required'),
    PortOfDischarge: Yup.object().required('Port of Discharge is required'),
    LCFor: Yup.object(),
    TolerancePercent: Yup.number().min(0, 'Tolerance % must be positive').required('Tolerance % is required'),
    DocPresentDays: Yup.number().min(0, 'Doc Present Days must be positive').required('Doc Present Days is required'),
    LCAFNo: Yup.string(),
    HSCode: Yup.object().required('HS Code is required'),
    UDIPNo: Yup.string(),
    UDIPDate: Yup.date().required('UDIP Date is required'),
    Remarks: Yup.string(),
    FileRefNo: Yup.string(),
  });

  const methods = useForm({
    resolver: yupResolver(ImportLCSchema),
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

  // Fetch PI Master Data
  const GetImportPIData = useCallback(async () => {
    try {
      setGridLoading(true);
      const response = await Get(
        `CommercialModule/GetImportPIData?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (Array.isArray(response.data)) {
        setPiMasterData(response.data || []);
      } else if (response.data?.Success && Array.isArray(response.data.Data)) {
        setPiMasterData(response.data.Data || []);
      } else {
        setPiMasterData([]);
      }
    } catch (error) {
      console.log(error);
      setPiMasterData([]);
    } finally {
      setGridLoading(false);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // Fetch PI Detail Data
  const GetImportPIDetails = useCallback(async (piId) => {
    try {
      const response = await Get(
        `CommercialModule/GetImportPIDetails?PIID=${piId}`
      );
      if (response.data?.Success && Array.isArray(response.data.Data)) {
        setPiDetailData((prev) => ({
          ...prev,
          [piId]: response.data.Data || [],
        }));
        return response.data.Data || [];
      }
      return [];
    } catch (error) {
      console.log(error);
      setPiDetailData((prev) => ({
        ...prev,
        [piId]: [],
      }));
      return [];
    }
  }, []);

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
  ]);

  // Fetch PI Master Data on component mount
  useEffect(() => {
    GetImportPIData();
  }, [GetImportPIData]);

  const SaveImportLC = async (dataToSend) => {
    try {
      const response = await Post(
        'Commercial/SaveImportLC',
        dataToSend
      );
      return response;
    } catch (error) {
      console.error('Error saving Import LC:', error);
      throw error;
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    // Validate at least one PI is selected
    if (selectedPiRows.length === 0) {
      enqueueSnackbar('Please select at least one PI from the grid', { variant: 'warning' });
      return;
    }

    // Build AttachedPI array from selected PI rows
    // Build AttachedPI array from selected PI rows
    const attachedPI = selectedPiRows.map((pi) => ({
      PIID: pi.PIID || 0, // Add PIID
      PIAmount: pi.PIValue || 0,
      IsStoreItem: false,
      CreatedBy: userData?.userDetails?.userId || 1,
    }));

    // Build AttachedPIDetails array from selected PI details
    const attachedPIDetails = [];
    // eslint-disable-next-line
    for (const pi of selectedPiRows) {
      // eslint-disable-next-line
      const piId = pi.PIID;
      // eslint-disable-next-line
      if (!piId) continue;

      let details = piDetailData[piId];
      // eslint-disable-next-line
      if (!details || details.length === 0) {
        // eslint-disable-next-line
        details = await GetImportPIDetails(piId);
      }

      if (details && Array.isArray(details) && details.length > 0) {
        // eslint-disable-next-line
        details.forEach((detail) => {
          // Log detail to debug
          console.log('PI Detail:', detail);

          attachedPIDetails.push({
            PIDtlID: detail.PIDtlID || detail.PIDtl_ID || 0,
            PIID: piId,
            InvCatID: detail.InvCatID || detail.Inv_Cat_ID || detail.InvCat_ID || 0,
            SubCatID: detail.SubCatID || detail.SubCat_ID || detail.Sub_Cat_ID || 0,
            ItemID: detail.ItemID || detail.Item_ID || 0,
            UOMID: detail.UOMID || detail.UOM_ID || 0,
            PODtlID: detail.PODtlID || detail.PO_Dtl_ID || null,
            PIQty: parseFloat(detail.PIQty || detail.Quantity || detail.PI_Qty || 0),
            Rate: parseFloat(detail.Rate || detail.UnitPrice || detail.Unit_Price || 0),
            Amount: parseFloat(detail.Amount || detail.Total_Amount || detail.TotalAmount || 0),
            CreatedBy: userData?.userDetails?.userId || 1,
          });
        });
      }
    }

    // Log data for debugging
    console.log('Form Data:', data);
    console.log('Selected PI Rows:', selectedPiRows);
    console.log('Attached PI:', attachedPI);
    console.log('Attached PI Details:', attachedPIDetails);

    const dataToSend = {
      ApplicationDate: data.ApplicationDate ? formatDate(data.ApplicationDate) : null,
      LCTypeID: data.LCType?.LCTypeID || null,
      GroupCode: data.GroupCode || '',
      GroupCurrency: data.GroupCurrency?.Currency_Name || '',
      ConversionRate: data.ConversionRate || 0,
      ExchangeRate: data.ExchangeRate || 0, // Added
      BBImportLCNo: data.BBImportLCNO || '', // Note: Field name difference
      BBImportLCDate: data.BBImportLCDate ? formatDate(data.BBImportLCDate) : null,
      OpeningBankID: data.OpeningBank?.BankID || null,
      Amount: data.BBImportLCAmount || 0, // Note: Field name difference
      CurrencyID: data.BBLCCurrency?.Currency_ID || null,
      CurrencyRate: data.CurrencyRate || 0, // Added
      Payment_term_ID: data.PayTerm?.Payment_term_ID || null,
      BankFacilityID: data.BankFacility?.BankFacilityID || null,
      CompanyID: data.Company?.id || null, // Added
      PurposeID: data.Purpose?.PurposeID || null,
      LastShipmentDate: data.LatestShipDate ? formatDate(data.LatestShipDate) : null,
      LCExpiryDate: data.LCExpiryDate ? formatDate(data.LCExpiryDate) : null,
      ExpiryPlaceID: data.ExpiryPlace?.Country_ID || null,
      ShippingMark: data.ShippingMark || '',
      AdvisingBankID: data.AdvisingBank?.BankID || null,
      SupplierID: data.SupplierName?.VendorID || null,
      SuppliersBankID: data.SupplierBank?.BankID || null,
      CoverNoteNo: data.CoverNoteBook || '',
      InsuranceCompanyID: data.InsuranceCompany?.InsuranceCompanyID || null,
      TradeTermID: data.TradeTerm?.TradeTermID || null,
      NatureID: data.Nature?.LCNatureID || null,
      MaturityDateFrom: data.MaturityDateFrom && typeof data.MaturityDateFrom === 'object'
        ? formatDate(data.MaturityDateFrom)
        : null,
      PortOfLoadingID: data.PortOfLoading?.PortID || null,
      PortOfDischargeID: data.PortOfDischarge?.PortDischargeID || null,
      LCForID: data.LCFor?.PurposeID || null,
      TolerancePercent: data.TolerancePercent || 0,
      DocPresentDays: data.DocPresentDays || 0,
      LC_AF_No: data.LCAFNo || '',
      HSCodeID: data.HSCode?.HSCodeID ? parseInt(data.HSCode.HSCodeID, 10) : null, // Ensure it's a number
      UDIPNo: data.UDIPNo || '',
      UDIPDate: data.UDIPDate ? formatDate(data.UDIPDate) : null,
      TenorDays: data.Tenor ? parseInt(data.Tenor, 10) || 0 : 0,
      IsTransShipment: transShipment,
      AddConfirmationReq: confirmationRequested,
      IssuedByMail: issuedBy,
      PartialShipmentAllowed: partialShipment,
      IssuedByTelex: issuedByTeletransmission,
      IsApplied: isApplied,
      IsOpened: isOpened,
      Remarks: data.Remarks || '',
      FileRefNo: data.FileRefNo || '',
      CreatedBy: userData?.userDetails?.userId || 1,
      // eslint-disable-next-line
      Org_ID: userData?.userDetails?.orgId || 1,
      // eslint-disable-next-line
      Branch_ID: userData?.userDetails?.branchID || 6,
      AttachedPI: attachedPI,
      AttachedPIDetails: attachedPIDetails,





    };

    // Log final payload
    console.log('Final Payload to Send:', JSON.stringify(dataToSend, null, 2));

    try {
      const response = await SaveImportLC(dataToSend);
      console.log('API Response:', response);

      if (response.data.Success || response.status === 200) {
        enqueueSnackbar('Import LC saved successfully!', { variant: 'success' });
        reset();
        router.push(paths.dashboard.Commercial.import.ImportLCInfo.root);
      } else {
        enqueueSnackbar(response.data?.Message || 'Failed to save Import LC', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error saving Import LC:', error);
      console.error('Error Response:', error.response);

      if (error.response?.status === 400) {
        enqueueSnackbar(error.response.data?.Message || 'Validation error', { variant: 'error' });
      } else {
        enqueueSnackbar(error.response?.data?.Message || 'Error saving Import LC', { variant: 'error' });
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

  // Master Grid Column Definitions
  const masterColumnDefs = useMemo(
    () => [
      {
        checkboxSelection: true,
        headerCheckboxSelection: true,
        maxWidth: 50,
        sortable: false,
        filter: false,
        resizable: false,
        lockPosition: 'left',
      },
      {
        field: 'expand',
        headerName: '',
        maxWidth: 50,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
        },
        sortable: false,
        filter: false,
        resizable: false,
        lockPosition: 'left',
      },
      {
        field: 'PINo',
        headerName: 'PI No',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'PIDate',
        headerName: 'PI Date',
        minWidth: 120,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
      },
      {
        field: 'VendorName',
        headerName: 'Vendor Name',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'PurposeName',
        headerName: 'Purpose',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Payment_Term',
        headerName: 'Payment Term',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ShipmentMode',
        headerName: 'Shipment Mode',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'CreatedBy',
        headerName: 'Created By',
        minWidth: 180,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'PIValue',
        headerName: 'PI Value',
        minWidth: 120,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? fNumber(params.value) : ''),
      },
    ],
    []
  );

  // Detail Grid Column Definitions
  const detailColumnDefs = useMemo(
    () => [
      {
        field: 'Inv_Cat_Name',
        headerName: 'Category',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'SubCat_Name',
        headerName: 'Sub Category',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ItemDescription',
        headerName: 'Item Description',
        minWidth: 250,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ItemCode',
        headerName: 'Item Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'UOMName',
        headerName: 'UOM',
        minWidth: 100,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'PIQty',
        headerName: 'Quantity',
        minWidth: 120,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? fNumber(params.value) : ''),
      },
      {
        field: 'Rate',
        headerName: 'Rate',
        minWidth: 120,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? fNumber(params.value) : ''),
      },
      {
        field: 'Amount',
        headerName: 'Amount',
        minWidth: 120,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? fNumber(params.value) : ''),
      },
    ],
    []
  );

  // Detail Grid Options
  const detailGridOptions = useMemo(
    () => ({
      columnDefs: detailColumnDefs,
      defaultColDef: {
        flex: 1,
        sortable: true,
        filter: true,
        resizable: true,
      },
    }),
    // eslint-disable-next-line
    [detailColumnDefs]
  );


  const detailCellRendererParams = useMemo(
    // eslint-disable-next-line
    () => ({
      // eslint-disable-next-line
      detailGridOptions: detailGridOptions,
      getDetailRowData: async (params) => {
        const piId = params.data.PIID;
        // If details not loaded yet, fetch them
        if (!piDetailData[piId]) {
          const details = await GetImportPIDetails(piId);
          params.successCallback(details);
        } else {
          params.successCallback(piDetailData[piId] || []);
        }
      },
    }),
    [detailGridOptions, piDetailData, GetImportPIDetails]
  );

  // Handle row selection
  const onRowSelected = useCallback((event) => {
    if (event.node.isSelected()) {
      setSelectedPiRows((prev) => [...prev, event.data]);
    } else {
      setSelectedPiRows((prev) => prev.filter((row) => row.PIID !== event.data.PIID));
    }
  }, []);

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

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
              <h3>Import LC:</h3>
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
                {/* 1. Application Date with checkboxes */}
                <Box>
                  <Controller
                    name="ApplicationDate"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <DesktopDatePicker
                        {...field}
                        label="Application Date"
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
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isApplied}
                          onChange={(e) => setIsApplied(e.target.checked)}
                        />
                      }
                      label="Applied"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isOpened}
                          onChange={(e) => setIsOpened(e.target.checked)}
                        />
                      }
                      label="Opened"
                    />
                  </Box>
                </Box>

                {/* 2. BB/Import LC NO */}
                <RHFTextField name="BBImportLCNO" label="BB/Import LC NO" fullWidth />

                {/* 3. BB/Import LC Date */}
                <Controller
                  name="BBImportLCDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="BB/Import LC Date"
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

                {/* 4. LC Type */}
                <RHFAutocomplete
                  name="LCType"
                  label="LC Type"
                  placeholder="Choose an option"
                  fullWidth
                  options={lcTypes}
                  getOptionLabel={(option) => option?.LCTypeName || ''}
                  isOptionEqualToValue={(option, value) => option?.LCTypeID === value?.LCTypeID}
                  value={values?.LCType || null}
                />

                {/* 5. Group Code */}
                <RHFTextField
                  name="GroupCode"
                  label="Group Code"
                  fullWidth
                />

                {/* 6. Group Currency */}
                <RHFAutocomplete
                  name="GroupCurrency"
                  label="Group Currency"
                  placeholder="Choose an option"
                  fullWidth
                  options={groupCurrencies}
                  getOptionLabel={(option) => option?.Currency_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.Currency_ID === value?.Currency_ID}
                  loading={isLoading}
                  value={values?.GroupCurrency || null}
                />

                {/* 7. Conversion Rate */}
                <RHFTextField
                  name="ConversionRate"
                  label="Conversion Rate"
                  type="number"
                  fullWidth
                />

                {/* 8. Exchange Rate */}
                <RHFTextField
                  name="ExchangeRate"
                  label="Exchange Rate"
                  type="number"
                  fullWidth
                />

                {/* 9. Opening Bank */}
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

                {/* 10. BB/Import LC Amount */}
                <RHFTextField
                  name="BBImportLCAmount"
                  label="BB/Import LC Amount"
                  type="number"
                  fullWidth
                />

                {/* 11. BBLC Currency */}
                <RHFAutocomplete
                  name="BBLCCurrency"
                  label="BBLC Currency"
                  placeholder="Choose an option"
                  fullWidth
                  options={bbLCCurrencies}
                  getOptionLabel={(option) => option?.Currency_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.Currency_ID === value?.Currency_ID}
                  loading={isLoading}
                  value={values?.BBLCCurrency || null}
                />

                {/* 12. Currency Rate */}
                <RHFTextField
                  name="CurrencyRate"
                  label="Currency Rate"
                  type="number"
                  fullWidth
                />

                {/* 13. Pay Term */}
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

                {/* 14. Bank Facility */}
                <RHFAutocomplete
                  name="BankFacility"
                  label="Bank Facility"
                  placeholder="Choose an option"
                  fullWidth
                  options={facilityBanks}
                  getOptionLabel={(option) => option?.BankFacilityName || ''}
                  isOptionEqualToValue={(option, value) => option?.BankFacilityID === value?.BankFacilityID}
                  loading={isLoading}
                  value={values?.BankFacility || null}
                />

                {/* 15. Company */}
                <RHFAutocomplete
                  name="Company"
                  label="Company"
                  placeholder="Choose an option"
                  fullWidth
                  options={companyOptions}
                  getOptionLabel={(option) => option?.name || ''}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  value={values?.Company || null}
                />

                {/* 16. Purpose */}
                <RHFAutocomplete
                  name="Purpose"
                  label="Purpose"
                  placeholder="Choose an option"
                  fullWidth
                  options={purposes}
                  getOptionLabel={(option) => option?.PurposeName || ''}
                  isOptionEqualToValue={(option, value) => option?.PurposeID === value?.PurposeID}
                  loading={isLoading}
                  value={values?.Purpose || null}
                />

                {/* 17. Latest Ship Date */}
                <Controller
                  name="LatestShipDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Latest Ship Date"
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

                {/* 18. LC Expiry Date */}
                <Controller
                  name="LCExpiryDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="LC Expiry Date"
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

                {/* 19. Expiry Place */}
                <RHFAutocomplete
                  name="ExpiryPlace"
                  label="Expiry Place"
                  placeholder="Choose an option"
                  fullWidth
                  options={countries}
                  getOptionLabel={(option) => option?.Country_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.Country_ID === value?.Country_ID}
                  loading={isLoading}
                  value={values?.ExpiryPlace || null}
                />

                {/* 20. Shipping Mark */}
                <RHFTextField name="ShippingMark" label="Shipping Mark" fullWidth />

                {/* 21. Advising Bank */}
                <RHFAutocomplete
                  name="AdvisingBank"
                  label="Advising Bank"
                  placeholder="Choose an option"
                  fullWidth
                  options={banks}
                  getOptionLabel={(option) => option?.BankName || ''}
                  isOptionEqualToValue={(option, value) => option?.BankID === value?.BankID}
                  loading={isLoading}
                  value={values?.AdvisingBank || null}
                />

                {/* 22. Tenor */}
                <RHFTextField name="Tenor" label="Tenor" fullWidth />

                {/* 23. Supplier Name */}
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

                {/* 24. Supplier Bank */}
                <RHFAutocomplete
                  name="SupplierBank"
                  label="Supplier Bank"
                  placeholder="Choose an option"
                  fullWidth
                  options={banks}
                  getOptionLabel={(option) => option?.BankName || ''}
                  isOptionEqualToValue={(option, value) => option?.BankID === value?.BankID}
                  loading={isLoading}
                  value={values?.SupplierBank || null}
                />

                {/* 25. Cover Note Book */}
                <RHFTextField name="CoverNoteBook" label="Cover Note Book" fullWidth />

                {/* 26. Insurance Company */}
                <RHFAutocomplete
                  name="InsuranceCompany"
                  label="Insurance Company"
                  placeholder="Choose an option"
                  fullWidth
                  options={companies}
                  getOptionLabel={(option) => option?.InsuranceCompanyName || ''}
                  isOptionEqualToValue={(option, value) => option?.InsuranceCompanyID === value?.InsuranceCompanyID}
                  loading={isLoading}
                  value={values?.InsuranceCompany || null}
                />

                {/* 27. Trade Term */}
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

                {/* 28. Nature */}
                <RHFAutocomplete
                  name="Nature"
                  label="Nature"
                  placeholder="Choose an option"
                  fullWidth
                  options={lcNatures}
                  getOptionLabel={(option) => option?.LCNatureName || ''}
                  isOptionEqualToValue={(option, value) => option?.LCNatureID === value?.LCNatureID}
                  loading={isLoading}
                  value={values?.Nature || null}
                />

                {/* 29. Maturity Date from */}
                <Controller
                  name="MaturityDateFrom"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Maturity Date from"
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

                {/* 30. Port of loading */}
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

                {/* 31. Port Of Discharge */}
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
                  name="LCFor"
                  label="LC For"
                  placeholder="Choose an option"
                  fullWidth
                  options={purposes}
                  getOptionLabel={(option) => option?.PurposeName || ''}
                  isOptionEqualToValue={(option, value) => option?.PurposeID === value?.PurposeID}
                  value={values?.LCFor || null}
                />

                {/* 33. Tolerance% */}
                <RHFTextField
                  name="TolerancePercent"
                  label="Tolerance%"
                  type="number"
                  fullWidth
                />

                {/* 34. Doc Present Days */}
                <RHFTextField
                  name="DocPresentDays"
                  label="Doc Present Days"
                  type="number"
                  fullWidth
                />

                {/* 35. LCAF No */}
                <RHFTextField name="LCAFNo" label="LCAF No" fullWidth />

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
                <RHFTextField name="UDIPNo" label="UD / IP no" fullWidth />

                {/* 38. UD / IP Date */}
                <Controller
                  name="UDIPDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="UD / IP Date"
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


                {/* 40. File Ref No. */}
                <RHFTextField name="FileRefNo" label="File Ref No." fullWidth />

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
                      checked={transShipment}
                      onChange={(e) => setTransShipment(e.target.checked)}
                    />
                  }
                  label="Trans Shipment"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={confirmationRequested}
                      onChange={(e) => setConfirmationRequested(e.target.checked)}
                    />
                  }
                  label="Add Confirmation Request"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={issuedBy}
                      onChange={(e) => setIssuedBy(e.target.checked)}
                    />
                  }
                  label="Issued By Air/Mail/Courier"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={issuedByTeletransmission}
                      onChange={(e) => setIssuedByTeletransmission(e.target.checked)}
                    />
                  }
                  label="Issued By Teletransmission"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={partialShipment}
                      onChange={(e) => setPartialShipment(e.target.checked)}
                    />
                  }
                  label="Partial Shipment Allowed"
                />
              </Box>
            </Card>

            {/* PI Master-Detail Grid */}
            <Card sx={{ p: 3, mt: 3 }}>
              <h3>Import PI Data</h3>
              <Scrollbar>
                <div style={{ width: '100%', height: '600px' }}>
                  <AgGridReact
                    className="ag-theme-material"
                    theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
                    rowSelection="multiple"
                    onRowSelected={onRowSelected}
                    suppressRowClickSelection
                    rowData={piMasterData}
                    columnDefs={masterColumnDefs}
                    defaultColDef={defaultColDef}
                    masterDetail
                    detailCellRendererParams={detailCellRendererParams}
                    rowHeight={35}
                    headerHeight={40}
                    animateRows
                    pagination
                    paginationPageSize={20}
                    loading={gridLoading}
                  />
                </div>
              </Scrollbar>
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
