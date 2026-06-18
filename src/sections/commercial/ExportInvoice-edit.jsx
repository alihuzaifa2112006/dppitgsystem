import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
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
  FormControlLabel,
  IconButton,
  InputAdornment,
  Step,
  StepLabel,
  Stepper,
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
import DetailTableRow from './detail-table-row';
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

// ----------------------------------------------------------------------

export default function ExportInvoiceEditForm({ currentData }) {
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

  const [allPorts, setAllPorts] = useState([]);
  const [allCountries, setAllCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const [allPaymentTerms, setAllPaymentTerms] = useState([]);

  const [allEndBuyers, setAllEndBuyers] = useState([]);
  const [allModes, setAllModes] = useState([]);
  const [LCNO, setLCNO] = useState([]);
  const [ForwardingAgents, setForwardingAgents] = useState([]);
  const [TransportAgents, setTransportAgents] = useState([]);
  const [ForeignAgents, setForeignAgents] = useState([]);
  const [CommissionAgents, setCommissionAgents] = useState([]);
  const [EntryPorts, setEntryPorts] = useState([]);
  const [DischargePorts, setDischargePorts] = useState([]);
  const [isFetchingLC, setIsFetchingLC] = useState(false);
  const previousLCNo = useRef(null);

  const [shippingLine, setShippingLine] = useState([]);
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
  const [activeStep, setActiveStep] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [allUOM, setAllUOM] = useState([]);
  // Add loading state for LC data
  const [isLCLoading, setLCLoading] = useState(false);
  const [SelectedLC, setSelectedLC] = useState(null);
  const [allInvoicePurposes, setAllInvoicePurposes] = useState([]);
  const [allIncoTerms, setAllIncoTerms] = useState([]);
  const [allLCPurposes, setAllLCPurposes] = useState([]);
  const [allCINatures, setAllCINatures] = useState([]);
  const [exportInvoiceNo, setExportInvoiceNo] = useState('');
  const [piData, setPiData] = useState(null);
  const [LCData, setLCData] = useState(null);
  const [allHSCode, setAllHSCode] = useState([]);
  const [challans, setChallans] = useState([]);


  const BasicInfoSchema = Yup.object().shape({
    // LCNo: Yup.object().required('L/C No is required'),
    // LCType: Yup.object().required('L/C Type is required'),
    // LCDate: Yup.date().required('L/C Date is required'),
    // Buyer: Yup.object().required('Buyer is required'),
    // LcAmount: Yup.number().required('L/C Amount is required').min(0, 'Amount must be positive'),
    // Currency: Yup.object().required('Currency is required'),
    // LienBank: Yup.object().required('Lien Bank is required'),
    // PaymentTerms: Yup.object().required('Payment Term is required'),
    // // FileReferenceNo is Optional according to Excel
    ExportInvoiceNo: Yup.string().required('Export Invoice No is required'),
    ExportInvoiceDate: Yup.date().required('Export Invoice Date is required'),
    InvoicePurpose: Yup.object().required('Invoice Purpose is required'),
    GoodsValue: Yup.number().required('Goods Value is required'),
    // Commission is Optional (only for Foreign)
    // AdjustmentAmount is Optional (only for Foreign)
    ExportInvoiceValue: Yup.number()
      .required('Export Invoice Value is required')
      .min(0, 'Export Invoice Value must be positive'),
    ExchangeRate: Yup.number()
      .required('Exchange Rate is required')
      .min(0, 'Exchange Rate must be positive'),
    InvoiceValueInTk: Yup.number()
      .required('Invoice Value in Tk is required')
      .min(0, 'Invoice Value must be positive'),
    InvoiceQuantity: Yup.number()
      .required('Invoice Quantity is required')
      .min(0, 'Quantity must be positive'),
    // DocumentSentToMarketingDate is Optional
    IncoTerm: Yup.object().required('Inco Term is required'),
    // DocumentSentForBuyerAcceptanceDate is Optional (required later)
    // Freight is Optional (only for Foreign)
    Freight: Yup.number().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) =>
        schema.required('Freight is required for Foreign LC').min(0, 'Freight must be positive'),
      otherwise: (schema) => schema.notRequired(),
    }),

    // FreightCollection is Optional
    ModeOfShipment: Yup.object().required('Mode of Shipment is required'),
    // ExFactoryDate is Optional (only for Foreign)
    ExFactoryDate: Yup.date().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('Ex-Factory Date is required for Foreign LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    // OnboardDate is Optional (only for Foreign)
    OnboardDate: Yup.date().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('Onboard Date is required for Foreign LC'),
      otherwise: (schema) => schema.notRequired(),
    }),

    // BuyerAcceptanceReceiveDate is Optional (required later)
    // MaturityDate is Optional (required later)
    LCPurpose: Yup.object().required('L/C Purpose is required'),
    // CINature is Optional
  });

  // Step 1 has no validation (all fields optional)
  const AdditionalInfoSchema = Yup.object().shape({
    // All fields in Additional Information are Optional except:
    // ChallanNo and ChallanDate are required for Local LC
    ShippingLine: Yup.object().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('Shipping Line is required for Foreign LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    BLNo: Yup.string().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('BL No is required for Foreign LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    BLDate: Yup.string().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('BL Date is required for Foreign LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    FeederVessel: Yup.string().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('Feeder Vessel is required for Foreign LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    MotherVessel: Yup.string().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('Mother Vessel is required for Foreign LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    ETD: Yup.string().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('ETD is required for Foreign LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    ETA: Yup.string().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('ETA is required for Foreign LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    NoOfContainers: Yup.number().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('No of Containers is required for Foreign LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    ContainerNos: Yup.string().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('Container No. is required for Foreign LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    ContainerSealNos: Yup.string().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('Container Seal No. is required for Foreign LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    NoOfTrucks: Yup.number().when('LCType', {
      is: (LCType) => LCType?.type === 'Local',
      then: (schema) => schema.required('No of Trucks is required for Local LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    ExpNumber: Yup.string().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('Exp Number is required for Local LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    ExpDate: Yup.string().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('Exp Date is required for Local LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    ShippingBillNo: Yup.string().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('Shipping Bill No is required for Foreign LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    ShippingBillDate: Yup.string().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('Shipping Bill Date is required for Foreign LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    ChallanNo: Yup.string().when('LCType', {
      is: (LCType) => LCType?.type === 'Local',
      then: (schema) => schema.required('Challan No is required for Local LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    PortOfLoading: Yup.object().required('Port of Loading is required'),
    // PortOfDischarge: Yup.string().required('Port of Discharge is required'),
    CountryOfOrigin: Yup.object().required('Country of Origin is required'),
    Consignee: Yup.string().required('Consignee is required'),
    NotifyingParty: Yup.string().required('Notifying Party is required'),
    HSCode: Yup.object().required('HS Code is required'),
    GrossWeight: Yup.number().required('Gross Weight is required'),
    NetWeight: Yup.number().required('Net Weight is required'),
    DelieveryQuantity: Yup.number().required('Delivery Quantity is required'),
    BagQuantity: Yup.number().required('Bag Quantity is required'),
    ChallanDate: Yup.date().when('LCType', {
      is: (LCType) => LCType?.type === 'Local',
      then: (schema) => schema.required('Challan Date is required for Local LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    // Other fields are optional
  });

  const ShipmentInfoSchema = Yup.object().shape({
    ShippedQuantity: Yup.number()
      .required('Shipped Quantity is required')
      .min(0, 'Quantity must be positive'),
  });

  // Get the appropriate schema based on active step
  const getCurrentSchema = () => {
    switch (activeStep) {
      case 0:
        return BasicInfoSchema;
      case 1:
        return AdditionalInfoSchema;
      case 2:
        return ShipmentInfoSchema;
      default:
        return BasicInfoSchema;
    }
  };

  console.log(currentData, 'test');
  const defaultValues = useMemo(
    () => ({
      // Basic LC Information
      LCNo: LCNO?.find((option) => option?.ExportLCID === currentData?.ExportLCID) || null,
      LCType: currentData?.InvoiceTypeID
        ? {
          id: Number(currentData.InvoiceTypeID),
          type: Number(currentData.InvoiceTypeID) === 2 ? 'Foreign' : 'Local',
        }
        : null,
      LCDate: currentData?.LCDate ? new Date(currentData.LCDate) : null,
      // Buyer: allEndBuyers?.find((option) => option?.WIC_ID === currentData?.Customer?.WIC_ID) || null,
      LcAmount: parseFloat(currentData?.GoodsValue) || 0,
      Currency:
        currencies?.find((option) => option?.Currency_ID === currentData?.Currency?.CurrencyID) ||
        null,
      LienBank:
        allBanks?.find((option) => option?.LienBankID === currentData?.LienBank?.LienBankID) ||
        null,
      PaymentTerms:
        allPaymentTerms?.find(
          (option) => option?.Payment_term_ID === currentData?.PayTerm?.PayTermID
        ) || null,
      FileReferenceNo: currentData?.FileRef || '',

      // Export Invoice Basic Information
      ExportInvoiceNo: currentData?.ExportInvoiceNo || '',
      ExportInvoiceDate: currentData?.ExportInvoiceDate
        ? new Date(currentData.ExportInvoiceDate)
        : new Date(),
      InvoicePurpose:
        allInvoicePurposes?.find(
          (option) => option?.InvoicePurposeID === currentData?.InvoicePurposeID
        ) || null,
      GoodsValue: parseFloat(currentData?.GoodsValue) || 0,
      Commission: parseFloat(currentData?.Commission) || 0,
      AdjustmentAmount: parseFloat(currentData?.AdjustmentAmount) || 0,
      ExportInvoiceValue: parseFloat(currentData?.ExportInvoiceValue) || 0,
      ExchangeRate: parseFloat(currentData?.ExchangeRate) || 0,
      InvoiceValueInTk: parseFloat(currentData?.InvoiceValueInTK) || 0,
      InvoiceQuantity: parseFloat(currentData?.InvoiceQty) || 0,
      DocumentSentToMarketingDate: currentData?.DocSenttomarketingdate
        ? new Date(currentData.DocSenttomarketingdate)
        : null,
      IncoTerm:
        allIncoTerms?.find((option) => option?.IncotermID === currentData?.IncotermID) || null,
      DocumentSentForBuyerAcceptanceDate: currentData?.DocSentForBuyerAcceptance
        ? new Date(currentData.DocSentForBuyerAcceptance)
        : null,
      Freight: parseFloat(currentData?.Freight) || 0,
      FreightCollection: currentData?.IsCollection,
      ModeOfShipment:
        allModes?.find((option) => option?.ShipmentModeID === currentData?.ShipmentModeID) || null,
      IsForced: currentData?.IsForced,
      ExFactoryDate: currentData?.ExFactoryDate ? new Date(currentData.ExFactoryDate) : null,
      OnboardDate: currentData?.OnBoardDate ? new Date(currentData.OnBoardDate) : null,
      BuyerAcceptanceReceiveDate: currentData?.BuyerAcceptanceDate
        ? new Date(currentData.BuyerAcceptanceDate)
        : null,
      MaturityDate: currentData?.MaturityDate ? new Date(currentData.MaturityDate) : null,
      LCPurpose:
        allLCPurposes?.find((option) => option?.PurposeID === currentData?.PurposeID) || null,
      CINature:
        allCINatures?.find((option) => option?.CINatureID === currentData?.CINatureID) || null,

      // Additional Information
      ShippingLine:
        shippingLine?.find((option) => option?.ShippingLineID === currentData?.ShippingLineID) ||
        null,
      BLNo: currentData?.BLNo || '',
      BLDate: currentData?.BLDate ? new Date(currentData.BLDate) : null,
      FeederVessel: currentData?.FeederVessel || '',
      MotherVessel: currentData?.MotherVessel || '',
      ETD: currentData?.ETD_POL ? new Date(currentData.ETD_POL) : null,
      ETA: currentData?.ETA_POD ? new Date(currentData.ETA_POD) : null,
      DestinationCountry:
        allCountries?.find((option) => option?.Country_ID === currentData?.DistributionCountryID) ||
        null,
      PortOfLoading:
        allPorts?.find((option) => option?.PortID === currentData?.PortOfLoadingID) || null,
      PortOfDischarge: currentData?.PortOfDischarge || '',
      CommissionAgent:
        CommissionAgents?.find(
          (option) => option?.CommissionAgentID === currentData?.CommissionAgentID
        ) || null,
      MemorandumNo: currentData?.MemorandumNo || '',
      ChallanNo: currentData?.ChallanNo || '',
      ChallanDate: currentData?.ChallanDate ? new Date(currentData.ChallanDate) : null,
      DocSubmittedToBank: currentData?.DocSubmittedToBank || '',
      PortOfEntry:
        EntryPorts?.find((option) => option?.PortEntryID === currentData?.PortOfEntryID) || null,
      ForwardingAgent:
        ForwardingAgents?.find(
          (option) => option?.ForwardingAgentID === currentData?.ForwardingAgentID
        ) || null,
      DocHODate: currentData?.DocHODate ? new Date(currentData.DocHODate) : null,
      CountryOfOrigin:
        allCountries?.find((option) => option?.Country_ID === currentData?.CountryOfOriginID) ||
        null,
      Consignee: currentData?.Consignee_Additional || '',
      NotifyingParty: currentData?.NotifyingParty || '',
      NumberOfContainers: parseInt(currentData?.NoOfContainers, 10) || 0,
      ContainerNos: currentData?.ContainerNos || '',
      ContainerSealNos: currentData?.ContainerSealNos || '',
      ContractNo: currentData?.ContractNo || '',
      HSCode: allHSCode?.find((hs) => hs.HSCodeID === currentData?.HSCode?.HSCodeID) || null,
      GrossWeight: parseFloat(currentData?.GrossWeight) || 0,
      NetWeight: parseFloat(currentData?.NetWeight) || 0,
      FlightDetails: currentData?.FlightDetails || '',
      Reference: currentData?.Reference || '',
      NumberOfTrucks: parseInt(currentData?.NoOfTrucks, 10) || 0,
      TransportAgent:
        TransportAgents?.find(
          (option) => option?.TransportAgentID === currentData?.TransportAgentID
        ) || null,
      FCRNo: currentData?.FCRNumber || '',
      ExpNumber: currentData?.ExpNumber || '',
      ExpDate: currentData?.ExpDate ? new Date(currentData.ExpDate) : null,
      ShippingBillNo: currentData?.ShippingBillNo || '',
      ShippingBillDate: currentData?.ShippingBillDate
        ? new Date(currentData.ShippingBillDate)
        : null,
      ForeignAgent:
        ForeignAgents?.find((option) => option?.ForeignAgentID === currentData?.ForeignAgentID) ||
        null,
      CommissionPercentage: parseFloat(currentData?.CommissionPercent) || 0,
      CMPercentage: parseFloat(currentData?.CMPercent) || 0,
      CartonQty: parseInt(currentData?.CartonQty, 10) || 0,
      FCRDate: currentData?.FCRDate ? new Date(currentData.FCRDate) : null,
      PaymentDueDate: currentData?.PaymentDueDate ? new Date(currentData.PaymentDueDate) : null,
      Description: currentData?.Description || '',

      // Shipment Information
      ShippedQuantity: parseFloat(currentData?.TotalShippedQty) || 0,
      DelieveryQuantity: parseFloat(currentData?.DeliveryQty) || 0,
      BagQuantity: parseFloat(currentData?.BagQty) || 0,

      // Remarks
      Remarks: currentData?.Remarks || '',
    }),
    // eslint-disable-next-line
    [
      currentData,
      LCNO,
      allEndBuyers,
      currencies,
      allBanks,
      allPaymentTerms,
      allInvoicePurposes,
      allIncoTerms,
      allModes,
      allLCPurposes,
      allCINatures,
      shippingLine,
      allCountries,
      allPorts,
      DischargePorts,
      CommissionAgents,
      EntryPorts,
      ForwardingAgents,
      TransportAgents,
      ForeignAgents,
    ]
  );
  console.log(defaultValues, 'defaultValues');
  const methods = useForm({
    resolver: yupResolver(getCurrentSchema()),
    defaultValues,
    mode: 'onChange',
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

  // Reset form when currentData and dependencies are loaded
  useEffect(() => {
    if (currentData && !isLoading) {
      methods.reset(defaultValues);
    }
  }, [currentData, isLoading, methods, defaultValues]);

  // Re-validate when step changes
  useEffect(() => {
    methods.trigger();
  }, [activeStep, methods]);

  const GetInvoicePurposes = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetInvoicePurposes?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllInvoicePurposes(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);

  const GetModes = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetShipmentModes?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllModes(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);
  const GetIncoTerms = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetIncoterms?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllIncoTerms(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);

  const GetLCPurposes = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetLCPurposes?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllLCPurposes(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);
  const GetLCDetails = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetExportLCNumbers?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setLCNO(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);
  const GetCINatures = useCallback(
    async () => {
      try {
        const response = await Get(
          `CommercialModule/GetCINatures?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
        );
        setAllCINatures(response.data.Data);
      } catch (error) {
        console.log(error);
      }
    },
    // eslint-disable-next-line
    [userData]
  );

  // eslint-disable-next-line
  const GetLCDetailData = useCallback(async (ExportLCID) => {
    // eslint-disable-next-line
    try {
      //   if (!currentData?.ExportLCID) return;
      const response = await Get(
        `CommercialModule/GetExportLCDetailsByID?ExportLCID=${ExportLCID}`
      );
      setLCData(response.data.Data);
      // eslint-disable-next-line
      return response.data.Data;
      // Set as object, not array
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
  }, [userData]);

  const GetBuyers = useCallback(async (exportLCID) => {
    try {
      if (!exportLCID) return;
      const response = await Get(
        `CommercialModule/GetCustomerByExportLCID?ExportLCID=${exportLCID}`
      );
      // setAllEndBuyers(response.data.Data);
      // eslint-disable-next-line
      return response.data.Data; // Return buyers for further use
    } catch (error) {
      console.log(error);
    }
  }, []);

  const GetCurrencies = useCallback(async (exportLCID) => {
    try {
      if (!exportLCID) return;
      const response = await Get(
        `CommercialModule/GetCurrencyByExportLCID?ExportLCID=${exportLCID}`
      );
      // setCurrencies([response.data.Data]);
      // eslint-disable-next-line
      return [response.data.Data];
    } catch (error) {
      console.log(error);
    }
  }, []);

  const GetBanks = useCallback(async (exportLCID) => {
    try {
      if (!exportLCID) return;
      const response = await Get(
        `CommercialModule/GetLienBankByExportLCID?ExportLCID=${exportLCID}`
      );
      // setAllBanks([response.data.Data]);
      // eslint-disable-next-line
      return [response.data.Data];
    } catch (error) {
      console.log(error);
    }
  }, []);
  const GetCountries = useCallback(async (exportLCID) => {
    try {
      const response = await Get(`CommercialModule/GetCountries`);
      setAllCountries(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, []);
  const GetPaymentTerms = useCallback(async (exportLCID) => {
    try {
      if (!exportLCID) return;
      const response = await Get(
        `CommercialModule/GetPaymentTermsByExportLCID?ExportLCID=${exportLCID}`
      );
      // setAllPaymentTerms(response.data.Data);
      // eslint-disable-next-line
      return response.data.Data;
    } catch (error) {
      console.log(error);
    }
  }, []);

  const GetForwardingAgents = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetForwardingAgents?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setForwardingAgents(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);
  const GetTransportingAgents = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetTransportAgents?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setTransportAgents(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);

  const GetCommissionAgents = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetCommissionAgent?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setCommissionAgents(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);

  const GetForeignAgents = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetForeignAgents?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setForeignAgents(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);

  const GetEntryPorts = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetPortOfEntry?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setEntryPorts(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);

  const GetPOL = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetPortOfLoading?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllPorts(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);

  const GetDischargePorts = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetPortOfDischarge?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setDischargePorts(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);

  const GetShippingLine = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetShippingLine?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setShippingLine(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);
  // eslint-disable-next-line
  const GetHSCode = useCallback(async () => {
    try {
      const response = await Get(`CommercialModule/GetHSCodes`);
      setAllHSCode(response.data.Data);
      setValue('HSCode', response.data.Data[0], { shouldValidate: false });
      console.log(response.data.Data.find((hs) => hs.HSCodeID === "1"), "heloo")
      return response.data.Data;
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line
  }, []);

  // Fix the handleLCNoChange function
  const handleLCNoChange = useCallback(
    async (selectedLC) => {
      if (!selectedLC?.ExportLCID) return;

      setLCLoading(true);
      setSelectedLC(selectedLC);

      try {
        const [lcData, buyers, currenciesData, banksData, paymentTermsData] = await Promise.all([
          GetLCDetailData(selectedLC.ExportLCID),
          GetBuyers(selectedLC.ExportLCID),
          GetCurrencies(selectedLC.ExportLCID),
          GetBanks(selectedLC.ExportLCID),
          GetPaymentTerms(selectedLC.ExportLCID),
        ]);

        // Use setTimeout to ensure React has updated the state
        setTimeout(() => {
          methods.setValue('LCNo', selectedLC);
          methods.setValue('LCDate', lcData?.LCDate ? new Date(lcData.LCDate) : new Date());
          methods.setValue('LcAmount', lcData?.ExportLCAmount || 0);
          methods.setValue('FileReferenceNo', lcData?.FileRef || '');
          methods.setValue('GoodsValue', lcData?.ExportLCAmount || 0);
          methods.setValue('ExportInvoiceValue', lcData?.ExportLCAmount || 0);
          methods.setValue('InvoiceQuantity', lcData?.PIQty || 0);
          methods.setValue('ShippedQuantity', lcData?.PIQty || 0);

          if (buyers && buyers.length === 1) {
            methods.setValue('Buyer', buyers[0]);
          }
          if (currenciesData && currenciesData.length > 0) {
            methods.setValue('Currency', currenciesData[0]);
          }
          if (banksData && banksData.length > 0) {
            methods.setValue('LienBank', banksData[0]);
          }
          if (paymentTermsData && paymentTermsData.length === 1) {
            methods.setValue('PaymentTerms', paymentTermsData[0]);
          }

          setLCLoading(false);
        }, 100);
      } catch (error) {
        console.error('Error fetching LC data:', error);
        enqueueSnackbar('Failed to load LC details', { variant: 'error' });
        setLCLoading(false);
      }
    },
    [GetLCDetailData, GetBuyers, GetCurrencies, GetBanks, GetPaymentTerms, enqueueSnackbar, methods]
  );
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        GetInvoicePurposes(),
        GetIncoTerms(),
        GetLCPurposes(),
        GetCINatures(),
        GetCountries(),
        GetExportInvoiceNo(),
        GetForwardingAgents(),
        GetTransportingAgents(),
        GetModes(),
        GetLCDetails(),
        GetCommissionAgents(),
        GetForeignAgents(),
        GetEntryPorts(),
        GetDischargePorts(),
        GetShippingLine(),
        GetPOL(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [
    GetModes,
    GetForeignAgents,
    GetInvoicePurposes,
    GetIncoTerms,
    GetLCPurposes,
    GetTransportingAgents,
    GetCINatures,
    GetCountries,
    GetForwardingAgents,
    GetCommissionAgents,
    GetExportInvoiceNo,
    GetLCDetails,
    GetEntryPorts,
    GetDischargePorts,
    GetShippingLine,
    GetPOL,
  ]);
  const didLoadLCDetails = useRef(false);

  useEffect(
    () => {
      const lcId = values?.LCNo?.ExportLCID;
      if (!lcId) return;

      const load = async () => {
        const [lcData, buyers, currenciesData, banksData, paymentTermsData] = await Promise.all([
          GetLCDetailData(lcId),
          GetBuyers(lcId),
          GetCurrencies(lcId),
          GetBanks(lcId),
          GetPaymentTerms(lcId),
        ]);

        methods.setValue('LCDate', lcData?.LCDate ? new Date(lcData.LCDate) : new Date());
        methods.setValue('LcAmount', lcData?.ExportLCAmount || 0);
        methods.setValue('FileReferenceNo', lcData?.FileRef || '');
        methods.setValue('GoodsValue', lcData?.ExportLCAmount || 0);
        methods.setValue('ExportInvoiceValue', lcData?.ExportLCAmount || 0);
        methods.setValue('InvoiceQuantity', lcData?.PIQty || 0);
        methods.setValue('ShippedQuantity', lcData?.PIQty || 0);

        if (buyers?.length === 1) {
          // setAllEndBuyers(buyers);
          methods.setValue('Buyer', buyers[0]);
        }
        if (currenciesData?.length > 0) {
          methods.setValue('Currency', currenciesData[0]);
        }
        if (banksData?.length > 0) {
          methods.setValue('LienBank', banksData[0]);
        }
        if (paymentTermsData?.length === 1) {
          methods.setValue('PaymentTerms', paymentTermsData[0]);
        }
      };

      load();
    },
    // eslint-disable-next-line
    [values?.LCNo]
  );
  useEffect(() => {
    if (activeStep === 1) {
      GetHSCode();
      console.log(activeStep, 'activeStep');
    }
  }, [GetHSCode, activeStep]);
  // Effect to watch LCNo changes and trigger data fetching
  // useEffect(() => {
  //   if (values.LCNo?.ExportLCID) {
  //     handleLCNoChange(values.LCNo);
  //   }
  // }, [values.LCNo, handleLCNoChange]);

  // // Effect to update form fields when LCData changes
  // useEffect(() => {
  //   if (LCData) {
  //     // Update LC-related fields
  //     setValue('LcAmount', LCData.ExportLCAmount || 0);
  //     setValue('GoodsValue', LCData.ExportLCAmount || 0);
  //     setValue('ExportInvoiceValue', LCData.ExportLCAmount || 0);

  //     // Update LCDate if available
  //     if (LCData.LCDate) {
  //       setValue('LCDate', new Date(LCData.LCDate));
  //     }

  //     // Update other fields from LCData as needed
  //     if (LCData.PIQty) {
  //       setValue('InvoiceQuantity', LCData.PIQty);
  //     }
  //   }
  // }, [LCData, setValue]);

  // Initial data loading

  useEffect(() => {
    if (values.GoodsValue && values.ExchangeRate) {
      const invoiceValueInTk = parseFloat(values.GoodsValue) * parseFloat(values.ExchangeRate);
      setValue('InvoiceValueInTk', invoiceValueInTk.toFixed(2));
    }
  }, [values.GoodsValue, values.ExchangeRate, setValue]);

  useEffect(() => {
    if (values.GoodsValue) {
      setValue('ExportInvoiceValue', values.GoodsValue);
    }
  }, [values.GoodsValue, setValue]);

  const KGtoLBs = (kg) => kg * 2.20462;

  // Add this useEffect to pre-populate Consignee and Notifying Party
  useEffect(() => {
    if (values.Buyer?.WIC_Name) {
      setValue('Consignee', values.Buyer.WIC_Name);
      setValue('NotifyingParty', values.Buyer.WIC_Name);
    }
  }, [values.Buyer, setValue]);

  // Auto-calculate Bag Quantity based on Delivery Quantity
  // Formula: If delivery quantity is in LBS, divide by 100. If in KG, divide by 45.36
  // Since we're using KG by default, we divide by 45.36
  useEffect(() => {
    if (values.DelieveryQuantity) {
      const deliveryQty = parseFloat(values.DelieveryQuantity);
      if (!Number.isNaN(deliveryQty) && deliveryQty > 0) {
        // Using KG as default UOM, so divide by 45.36
        const bagQty = deliveryQty / 45.36;
        setValue('BagQuantity', bagQty.toFixed(2));
      }
    } else {
      setValue('BagQuantity', 0);
    }
  }, [values.DelieveryQuantity, setValue]);

  // Auto-calculate Gross Weight based on Bag Quantity
  // Formula: Gross Weight (KG) = Total Bag Qty × 46.46
  // If weight is in LBS: Gross Weight (Kg) = Total Bag Qty × 102.42508
  useEffect(() => {
    if (values.BagQuantity) {
      const bagQty = parseFloat(values.BagQuantity);
      if (!Number.isNaN(bagQty) && bagQty > 0) {
        // Using KG as default UOM, so multiply by 46.46
        const grossWeight = bagQty * 46.46;
        setValue('GrossWeight', grossWeight.toFixed(2));
      }
    } else {
      setValue('GrossWeight', 0);
    }
  }, [values.BagQuantity, setValue]);

  // Auto-calculate Net Weight based on Bag Quantity
  // Formula: Net Weight (KG) = Total Bag Qty × 46.46
  useEffect(() => {
    if (values.BagQuantity) {
      const bagQty = parseFloat(values.BagQuantity);
      if (!Number.isNaN(bagQty) && bagQty > 0) {
        // Using KG as default UOM, so multiply by 46.46
        const netWeight = bagQty * 46.46;
        setValue('NetWeight', netWeight.toFixed(2));
      }
    } else {
      setValue('NetWeight', 0);
    }
  }, [values.BagQuantity, setValue]);

  // Reset challans when LC Type changes
  useEffect(() => {
    if (currentData && !isLoading) {
      methods.reset(defaultValues);

      // Initialize challans from currentData if available
      if (currentData.Challans && Array.isArray(currentData.Challans)) {
        const formattedChallans = currentData.Challans.map(challan => ({
          DetailID: challan.DetailID,
          ChallanNo: challan.ChallanNo || '',
          ChallanDate: challan.ChallanDate ? new Date(challan.ChallanDate) : null
        }));
        setChallans(formattedChallans);
      } else if (values.LCType?.type === 'Local' && challans.length === 0) {
        // For Local LC, initialize with one empty challan if none exist
        setChallans([{ ChallanNo: '', ChallanDate: null }]);
      }
    }
    // eslint-disable-next-line
  }, [currentData, isLoading, methods, defaultValues, values.LCType?.type]);
  useEffect(() => {
    if (values.LCType?.type === 'Local') {
      // Initialize with one empty challan for Local LC if empty
      if (challans.length === 0) {
        setChallans([{ ChallanNo: '', ChallanDate: null }]);
      }
    } else if (values.LCType?.type === 'Foreign') {
      // Clear challans for Foreign LC
      setChallans([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.LCType?.type]);

  // Handle adding a new challan
  const handleAddChallan = () => {
    setChallans([...challans, { ChallanNo: '', ChallanDate: null }]);
  };

  // Handle removing a challan
  const handleRemoveChallan = (index) => {
    const updatedChallans = challans.filter((_, i) => i !== index);
    setChallans(updatedChallans);
  };

  // Handle challan number change
  const handleChallanNoChange = (index, value) => {
    const updatedChallans = [...challans];
    updatedChallans[index] = { ...updatedChallans[index], ChallanNo: value };
    setChallans(updatedChallans);
  };

  // Handle challan date change
  const handleChallanDateChange = (index, value) => {
    const updatedChallans = [...challans];
    updatedChallans[index] = { ...updatedChallans[index], ChallanDate: value };
    setChallans(updatedChallans);
  };
  const PostHSCode = async ({ HSCode, Description }) => {
    if (!HSCode || !Description) return;

    const newOptionTrimmed = HSCode.trim().toLowerCase();

    // Check if HS Code already exists in current list
    if (allHSCode.find((option) => option.HSCode.trim().toLowerCase() === newOptionTrimmed)) {
      enqueueSnackbar('HS Code Exists', { variant: 'error' });
      return;
    }

    const dataToSend = {
      HSCode,
      Description,
      CreatedBy: userData?.userDetails?.userId,
      OrgID: userData?.userDetails?.orgId,
      BranchID: userData?.userDetails?.branchID,
    };

    try {
      // Make the POST request
      const response = await Post('CommercialModule/AddHSCode', dataToSend);

      // Check if the POST was successful
      if (response.status === 200 || response.status === 201) {
        // Refresh the HS Code list
        await GetHSCode(); // Now this returns the data
        enqueueSnackbar('HS Code Added Successfully', { variant: 'success' });

      } else {
        throw new Error('Failed to add HS Code');
      }
    } catch (error) {
      console.error('Error adding HS Code:', error);
      enqueueSnackbar(error.response?.data?.message || 'HS Code not Added Successfully', {
        variant: 'error'
      });
    }
  };

  console.log(LCNO, 'LCNO');
  const onSubmit = handleSubmit(async (data) => {
    console.log('Form data:', data);

    // Format challans for API
    const challanDetails = challans.map((challan, index) => ({
      ChallanDetailID: challan.DetailID || 0, // Use DetailID if exists, otherwise 0 for new
      ChallanNo: challan.ChallanNo || '',
      ChallanDate: challan.ChallanDate ? formatDate(challan.ChallanDate) : null,
    }));

    const exportInvoiceData = {
      // Basic Information
      ExportInvoiceID: currentData?.ExportInvoiceID || 0,
      InvoiceTypeID: data.LCType?.id || 0,
      ExportInvoiceNo: data.ExportInvoiceNo,
      ExportInvoiceDate: data.ExportInvoiceDate ? formatDate(data.ExportInvoiceDate) : null,
      InvoicePurposeID: data.InvoicePurpose?.InvoicePurposeID || 0,
      ExportLCID: data.LCNo?.ExportLCID || 0,

      // New fields from API
      ExportRegistrationNo: currentData?.ExportRegistrationNo || '',
      ExportRegistrationDate: currentData?.ExportRegistrationDate
        ? formatDate(currentData.ExportRegistrationDate)
        : null,

      GoodsValue: parseFloat(data.GoodsValue) || 0,
      Commission: parseFloat(data.Commission) || 0,
      AdjustmentAmount: parseFloat(data.AdjustmentAmount) || 0,
      ExportInvoiceValue: parseFloat(data.ExportInvoiceValue) || 0,
      ExchangeRate: parseFloat(data.ExchangeRate) || 0,
      InvoiceValueInTK: parseFloat(data.InvoiceValueInTk) || 0,
      InvoiceQty: parseFloat(data.InvoiceQuantity) || 0,
      UOMID: LCData?.UOMID || 0,
      IncotermID: data.IncoTerm?.IncotermID || 0,
      ShipmentModeID: data.ModeOfShipment?.ShipmentModeID || 0,
      PurposeID: data.LCPurpose?.PurposeID || 0,
      CINatureID: data.CINature?.CINatureID || 0,

      // Dates
      DocSentForBuyerAcceptance: data.DocumentSentForBuyerAcceptanceDate
        ? formatDate(data.DocumentSentForBuyerAcceptanceDate)
        : null,
      BuyerAcceptanceDate: data.BuyerAcceptanceReceiveDate
        ? formatDate(data.BuyerAcceptanceReceiveDate)
        : null,
      MaturityDate: data.MaturityDate ? formatDate(data.MaturityDate) : null,
      ExFactoryDate: data.ExFactoryDate ? formatDate(data.ExFactoryDate) : null,
      OnBoardDate: data.OnboardDate ? formatDate(data.OnboardDate) : null,
      DocSenttomarketingdate: data.DocumentSentToMarketingDate
        ? formatDate(data.DocumentSentToMarketingDate)
        : null,

      // Financial
      Freight: parseFloat(data.Freight) || 0,
      IsCollection: Boolean(data.FreightCollection) || false,
      IsForced: Boolean(data.IsForced) || false,

      // Additional Information
      ShippingLineID: data.ShippingLine?.ShippingLineID || 0,
      BLNo: data.BLNo || '',
      BLDate: data.BLDate ? formatDate(data.BLDate) : null,
      FeederVessel: data.FeederVessel || '',
      MotherVessel: data.MotherVessel || '',
      ETD_POL: data.ETD ? formatDate(data.ETD) : null,
      ETA_POD: data.ETA ? formatDate(data.ETA) : null,
      DistributionCountryID: data.DestinationCountry?.Country_ID || 0,
      PortOfLoadingID: data.PortOfLoading?.PortID || 0,
      PortOfDischarge: data.PortOfDischarge || '',
      CommissionAgentID: data.CommissionAgent?.CommissionAgentID || 0,
      MemorandumNo: data.MemorandumNo || '',

      // Challan info - single entry (keeping for backward compatibility)
      ChallanNo: challans.length > 0 ? challans[0].ChallanNo : data.ChallanNo || '',
      ChallanDate: challans.length > 0 && challans[0].ChallanDate
        ? formatDate(challans[0].ChallanDate)
        : (data.ChallanDate ? formatDate(data.ChallanDate) : null),

      DocSubmittedToBank: data.DocSubmittedToBank || '',

      // New date field from API
      DateSubmittedToBank: data.DocSubmittedToBankDate
        ? formatDate(data.DocSubmittedToBankDate)
        : null,

      PortOfEntryID: data.PortOfEntry?.PortEntryID || 0,
      ForwardingAgentID: data.ForwardingAgent?.ForwardingAgentID || 0,
      DocHODate: data.DocHODate ? formatDate(data.DocHODate) : null,
      CountryOfOriginID: data.CountryOfOrigin?.Country_ID || 0,
      Consignee_Additional: data.Consignee || '',
      NotifyingParty: data.NotifyingParty || '',
      NoOfContainers: parseInt(data.NumberOfContainers, 10) || 0,
      ContainerNos: data.ContainerNos || '',
      ContainerSealNos: data.ContainerSealNos || '',
      ContractNo: data.ContractNo || '',

      // HSCode - need to handle both string and object
      HSCodeID: data.HSCode?.HSCodeID || data.HSCode || '',
      Description: data.Description || '',

      GrossWeight: parseFloat(data.GrossWeight) || 0,
      NetWeight: parseFloat(data.NetWeight) || 0,
      FlightDetails: data.FlightDetails || '',
      Reference: data.Reference || '',
      NoOfTrucks: parseInt(data.NumberOfTrucks, 10) || 0,
      TransportAgentID: data.TransportAgent?.TransportAgentID || 0,
      FCRNumber: data.FCRNo || '',
      ExpNumber: data.ExpNumber || '',
      ExpDate: data.ExpDate ? formatDate(data.ExpDate) : null,
      ShippingBillNo: data.ShippingBillNo || '',
      ShippingBillDate: data.ShippingBillDate ? formatDate(data.ShippingBillDate) : null,
      UDEPNumber: data.UDEPNumber || '',
      UDEPDate: data.UDEPDate ? formatDate(data.UDEPDate) : null,
      ForeignAgentID: data.ForeignAgent?.ForeignAgentID || 0,
      CommissionPercent: parseFloat(data.CommissionPercentage) || 0,
      CMPercent: parseFloat(data.CMPercentage) || 0,
      CartonQty: parseInt(data.CartonQty, 10) || 0,
      FCRDate: data.FCRDate ? formatDate(data.FCRDate) : null,
      PaymentDueDate: data.PaymentDueDate ? formatDate(data.PaymentDueDate) : null,

      // Shipment Information
      TotalInvoiceQty: parseFloat(data.InvoiceQuantity) || 0,
      TotalShippedQty: parseFloat(data.ShippedQuantity) || 0,
      DeliveryQty: parseFloat(data.DelieveryQuantity) || 0,
      BagQty: parseFloat(data.BagQuantity) || 0,

      // Challan Details array
      ChallanDetails: challanDetails,

      // System fields
      Remarks: data.Remarks || 'Export invoice updated',
      CreatedBy: userData?.userDetails?.userId || 0,
      Org_ID: userData?.userDetails?.orgId || 0,
      Branch_ID: userData?.userDetails?.branchID || 0,
    };

    console.log('Submitting Export Invoice Data:', exportInvoiceData);

    try {
      const response = await Put('CommercialModule/UpdateExportInvoice', exportInvoiceData);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Export Invoice Updated Successfully!', { variant: 'success' });
        router.push(paths.dashboard.Commercial.export.ExportInvoice.root);
      } else {
        throw new Error('Failed to update export invoice');
      }
    } catch (error) {
      console.error('Export Invoice Update Error:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to update export invoice!', {
        variant: 'error',
      });
    }
  });
  console.log(values, 'values');
  console.log(LCData, 'LCData');
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

  // Table Heads
  const DetailsTableHead = [
    { id: 'Item_Code', label: 'Item Code', minWidth: 120 },
    { id: 'Description', label: 'Product Description', minWidth: 240 },
    { id: 'Remarks', label: 'Remarks', minWidth: 80 },
    { id: 'DeliveryDueDate', label: 'Delivery Date ', align: 'center', minWidth: 140 },
    { id: 'Quantity', label: 'Quantity', align: 'center' },
    { id: 'ConesQty', label: 'No. Of Cones', align: 'center', minWidth: 120 },
    { id: 'Unit_Price', label: 'Unit Price', align: 'center', minWidth: 120 },
    { id: 'totalValue', label: 'Total ', align: 'center', minWidth: 120 },
    // { id: 'Actions', label: 'Actions', width: 88 },
  ];

  // Table
  const table = useTable();

  const denseHeight = table.dense ? 56 : 56 + 20;
  // Step validation functions
  // Step validation functions
  const validateStep = async (step) => {
    let fieldsToValidate = [];

    switch (step) {
      case 0: // Basic Information - Required fields
        fieldsToValidate = [
          'LCNo',
          'LCType',
          'LCDate',
          'Buyer',
          'LcAmount',
          'Currency',
          'LienBank',
          'PaymentTerms',
          'ExportInvoiceNo',
          'ExportInvoiceDate',
          'InvoicePurpose',
          'GoodsValue',
          'ExportInvoiceValue',
          'ExchangeRate',
          'InvoiceValueInTk',
          'InvoiceQuantity',
          'IncoTerm',
          'ModeOfShipment',
          'LCPurpose',
        ];

        // Add conditional fields for Foreign LC
        if (values.LCType?.type === 'Foreign') {
          fieldsToValidate.push('Freight', 'ExFactoryDate', 'OnboardDate');
        }
        break;
      case 1: // Additional Information - Conditional validation
        // Always required fields
        fieldsToValidate = [
          'PortOfLoading',
          'PortOfDischarge',
          'CountryOfOrigin',
          'Consignee',
          'NotifyingParty',
          'HSCode',
          'GrossWeight',
          'NetWeight',
        ];

        // Conditional fields based on LCType
        if (values.LCType?.type === 'Foreign') {
          fieldsToValidate.push(
            'ShippingLine',
            'BLNo',
            'BLDate',
            'FeederVessel',
            'MotherVessel',
            'ETD',
            'ETA',
            'NoOfContainers', // Schema field name - form should use this name
            'ContainerNos',
            'ContainerSealNos',
            'ExpNumber',
            'ExpDate',
            'ShippingBillNo',
            'ShippingBillDate'
          );
        } else if (values.LCType?.type === 'Local') {
          fieldsToValidate.push('NumberOfTrucks'); // Schema field name - form should use this name

          // Validate Challan fields for Local LC
          if (!challans || challans.length === 0) {
            enqueueSnackbar('At least one Challan No and Challan Date is required for Local LC', {
              variant: 'error',
            });
            return false;
          }
          // Validate each challan has both number and date
          const invalidChallans = challans.some(
            (challan) => !challan.ChallanNo || !challan.ChallanDate
          );
          if (invalidChallans) {
            enqueueSnackbar('Please fill all Challan No and Challan Date fields', {
              variant: 'error',
            });
            return false;
          }
        }
        break;
      case 2: // Shipment Information
        fieldsToValidate = ['ShippedQuantity', 'DelieveryQuantity', 'BagQuantity'];
        break;
      default:
        return true;
    }

    const result = await methods.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isStepValid = await validateStep(activeStep);

    if (isStepValid) {
      setActiveStep((prev) => prev + 1);

      // Change validation schema based on step
      if (activeStep === 0) {
        methods.trigger(); // Re-validate with new schema
      }
    } else {
      enqueueSnackbar('Please fill all required fields', { variant: 'error' });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Update form validation when step changes
  useEffect(() => {
    if (activeStep === 2) {
      // For shipment info step
      methods.trigger('ShippedQuantity');
    }
  }, [activeStep, methods]);
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
              <h3>Export Invoice:</h3>
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
                <RHFAutocomplete
                  name="LCNo"
                  label="L/C No"
                  variant="outlined"
                  fullWidth
                  options={LCNO}
                  getOptionLabel={(option) => option?.ExportLCNo || ''}
                  isOptionEqualToValue={(option, value) => option?.ExportLCID === value?.ExportLCID}
                  disabled
                // onChange={(event, newValue) => {
                //     // FIRST set the LCNo value in the form
                //     methods.setValue('LCNo', newValue);

                //     // THEN fetch and populate dependent data
                //     if (newValue?.ExportLCID) {
                //         handleLCNoChange(newValue);
                //     }
                // }}
                />
                <RHFAutocomplete
                  name="LCType"
                  label="L/C Type"
                  fullWidth
                  options={[
                    { id: 1, type: 'Local' },
                    { id: 2, type: 'Foreign' },
                  ]}
                  disabled
                  getOptionLabel={(option) => option?.type || ''}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  value={values.LCType || null}
                />
                <Controller
                  name="LCDate"
                  control={control}
                  disabled
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

                <RHFAutocomplete
                  name="Buyer"
                  label="Buyer"
                  fullWidth
                  options={allEndBuyers}
                  getOptionLabel={(option) => option?.WIC_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.WIC_ID === value?.WIC_ID}
                  value={values.Buyer || null}
                  disabled
                />

                <RHFTextField
                  name="LcAmount"
                  label="L/C Amount"
                  type="number"
                  variant="outlined"
                  fullWidth
                  disabled
                // value={piData.map((item) => item.TotalAmount.toFixed(2)) || 0}
                // InputProps={{
                //   startAdornment: (
                //     <InputAdornment position="start">
                //       <Typography variant="body2">$</Typography>
                //     </InputAdornment>
                //   ),
                // }}
                />

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
                  disabled
                />

                <RHFAutocomplete
                  name="LienBank"
                  label="Lien Bank"
                  fullWidth
                  options={allBanks}
                  getOptionLabel={(option) => option?.BankName || ''}
                  isOptionEqualToValue={(option, value) => option?.LienBankID === value?.LienBankID}
                  value={values.LienBank || null}
                  disabled
                />

                <RHFAutocomplete
                  name="PaymentTerms"
                  label="Payment Terms"
                  fullWidth
                  options={allPaymentTerms}
                  getOptionLabel={(option) => option?.Payment_Term || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.Payment_term_ID === value?.Payment_term_ID
                  }
                  value={values.PaymentTerms || null}
                  disabled
                />

                <RHFTextField
                  name="FileReferenceNo"
                  label="File Reference No"
                  variant="outlined"
                  fullWidth
                  value={values.FileReferenceNo || ''}
                  disabled
                />
              </Box>
            </Card>
            <Card sx={{ p: 3, my: 3 }}>
              <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                <Step>
                  <StepLabel>Basic Information</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Additional Information</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Shipment Information</StepLabel>
                </Step>
              </Stepper>

              {activeStep === 0 && (
                <Box>
                  <h3>Export Invoice Basic Information:</h3>
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
                    {/* Export Invoice NO */}
                    <RHFTextField
                      name="ExportInvoiceNo"
                      label="Export Invoice No."
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                    {/* Export Invoice Date */}
                    <Controller
                      name="ExportInvoiceDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DesktopDatePicker
                          {...field}
                          label="Export Invoice Date"
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

                    {/* Invoice for */}
                    <RHFAutocomplete
                      name="InvoicePurpose"
                      label="Invoice for"
                      fullWidth
                      options={allInvoicePurposes}
                      getOptionLabel={(option) => option?.PurposeName || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.InvoicePurposeID === value?.InvoicePurposeID
                      }
                      value={values.InvoicePurpose || null}
                    />

                    {/* Goods Value */}
                    <RHFTextField
                      name="GoodsValue"
                      label="Goods Value"
                      type="number"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />

                    {/* Commission */}
                    {values.LCType?.type === 'Foreign' ? (
                      <RHFTextField
                        name="Commission"
                        label="Commission"
                        type="number"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : null}

                    {/* Adjustment Amount */}
                    {values.LCType?.type === 'Foreign' ? (
                      <RHFTextField
                        name="AdjustmentAmount"
                        label="Adjustment Amount"
                        type="number"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : null}

                    {/* Export Invoice Value */}
                    <RHFTextField
                      name="ExportInvoiceValue"
                      label="Export Invoice Value"
                      type="number"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />

                    {/* Exchange Rate */}
                    <RHFTextField
                      name="ExchangeRate"
                      label="Exchange Rate"
                      type="number"
                      variant="outlined"
                      fullWidth
                    />

                    {/* Invoice Value in Tk */}
                    <RHFTextField
                      name="InvoiceValueInTk"
                      label="Invoice Value in Tk"
                      type="number"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography variant="body2">৳</Typography>
                          </InputAdornment>
                        ),
                        readOnly: true,
                      }}
                    />

                    {/* Invoice Quantity */}
                    <RHFTextField
                      name="InvoiceQuantity"
                      label="Invoice Quantity"
                      type="number"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="body2">{LCData?.UOMName}</Typography>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Document sent to Marketing */}
                    <Controller
                      name="DocumentSentToMarketingDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DesktopDatePicker
                          {...field}
                          label="Document sent to Marketing"
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

                    {/* Inco Term */}
                    <RHFAutocomplete
                      name="IncoTerm"
                      label="Inco Term"
                      fullWidth
                      options={allIncoTerms}
                      getOptionLabel={(option) => option?.IncotermCode || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.IncotermID === value?.IncotermID
                      }
                      value={values.IncoTerm || null}
                    />

                    {/* Document sent for buyer acceptance */}
                    <Controller
                      name="DocumentSentForBuyerAcceptanceDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DesktopDatePicker
                          {...field}
                          label="Document sent for buyer acceptance"
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

                    {/* Freight with Collection checkbox */}
                    <Box>
                      {values.LCType?.type === 'Foreign' ? (
                        <>
                          <RHFTextField
                            name="Freight"
                            label="Freight"
                            type="number"
                            variant="outlined"
                            fullWidth
                          />

                          <Controller
                            name="FreightCollection"
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={<Checkbox {...field} checked={!!field.value} />}
                                label="Collection"
                              />
                            )}
                          />
                        </>
                      ) : null}
                    </Box>

                    {/* Mode of shipment */}
                    <Box>
                      <RHFAutocomplete
                        name="ModeOfShipment"
                        label="Mode of shipment"
                        control={control}
                        fullWidth
                        options={allModes}
                        getOptionLabel={(option) => option?.ModeName || ''}
                        isOptionEqualToValue={(option, value) =>
                          option?.ShipmentModeID === value?.ShipmentModeID
                        }
                        value={values.ModeOfShipment || null}
                      />

                      <Controller
                        name="IsForced"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Checkbox {...field} checked={field.value || false} />}
                            label="Forced"
                          />
                        )}
                      />
                    </Box>

                    {/* Ex factory date */}
                    {values.LCType?.type === 'Foreign' ? (
                      <Controller
                        name="ExFactoryDate"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <DesktopDatePicker
                            {...field}
                            label="Ex factory date"
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
                    ) : null}

                    {/* Onboard date */}
                    {values.LCType?.type === 'Foreign' ? (
                      <Controller
                        name="OnboardDate"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <DesktopDatePicker
                            {...field}
                            label="Onboard date"
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
                    ) : null}

                    {/* Buyer acceptance receive date */}
                    <Controller
                      name="BuyerAcceptanceReceiveDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DesktopDatePicker
                          {...field}
                          label="Buyer acceptance receive date"
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

                    {/* Maturity date */}
                    <Controller
                      name="MaturityDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DesktopDatePicker
                          {...field}
                          label="Maturity date"
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

                    {/* L/C for */}
                    <RHFAutocomplete
                      name="LCPurpose"
                      label="L/C for"
                      fullWidth
                      options={allLCPurposes}
                      getOptionLabel={(option) => option?.PurposeName || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.PurposeID === value?.PurposeID
                      }
                      value={values.LCPurpose || null}
                    />

                    {/* CI Nature */}
                    <RHFAutocomplete
                      name="CINature"
                      label="CI Nature"
                      fullWidth
                      options={allCINatures}
                      getOptionLabel={(option) => option?.NatureName || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.CINatureID === value?.CINatureID
                      }
                      value={values.CINature || null}
                    />
                  </Box>
                </Box>
              )}

              {activeStep === 1 && (
                <Box>
                  <h3>Export Invoice Additional Information:</h3>
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
                    {/* Shipping Line */}
                    {values.LCType.type === 'Foreign' ? (
                      <RHFAutocomplete
                        name="ShippingLine"
                        label="Shipping Line"
                        variant="outlined"
                        fullWidth
                        options={shippingLine || []}
                        getOptionLabel={(option) => option?.ShippingLineName || ''}
                        isOptionEqualToValue={(option, value) =>
                          option?.ShippingLineID === value?.ShippingLineID
                        }
                      />
                    ) : null}

                    {/* BL No */}
                    {values.LCType.type === 'Foreign' ? (
                      <RHFTextField name="BLNo" label="BL No" variant="outlined" fullWidth />
                    ) : null}

                    {/* BL  */}
                    {values.LCType.type === 'Foreign' ? (
                      <Controller
                        name="BLDate"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <DesktopDatePicker
                            {...field}
                            label="BL Date"
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
                    ) : null}

                    {/* Feeder Vessel */}
                    {values.LCType.type === 'Foreign' ? (
                      <RHFTextField
                        name="FeederVessel"
                        label="Feeder Vessel"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : null}

                    {/* Mother Vessel */}
                    {values.LCType.type === 'Foreign' ? (
                      <RHFTextField
                        name="MotherVessel"
                        label="Mother Vessel"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : null}

                    {/* ETD (POL) */}

                    {values.LCType.type === 'Foreign' ? (
                      <Controller
                        name="ETD"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <DesktopDatePicker
                            {...field}
                            label="ETD (POL)"
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
                    ) : null}

                    {/* ETA (POD) */}
                    {values.LCType.type === 'Foreign' ? (
                      <Controller
                        name="ETA"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <DesktopDatePicker
                            {...field}
                            label="ETA (POD)"
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
                    ) : null}

                    {/* Destination County */}
                    <RHFAutocomplete
                      name="DestinationCountry"
                      label="Destination County"
                      type="country"
                      fullWidth
                      options={allCountries || []}
                      getOptionLabel={(option) => option?.Country_Name || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.Country_ID === value?.Country_ID
                      }
                    />

                    {/* Port of Loading */}
                    <RHFAutocomplete
                      name="PortOfLoading"
                      label="Port of Loading"
                      fullWidth
                      options={allPorts || []}
                      getOptionLabel={(option) => option?.PortName || ''}
                      isOptionEqualToValue={(option, value) => option?.PortID === value?.PortID}
                      value={values.PortOfLoading || null}
                    />

                    {/* Port of Discharge */}
                    <RHFTextField
                      name="PortOfDischarge"
                      label="Port of Discharge"
                    // fullWidth
                    // options={DischargePorts}
                    // getOptionLabel={(option) => option?.PortDischargeName || ''}
                    // isOptionEqualToValue={(option, value) =>
                    //     option?.PortDischargeID === value?.PortDischargeID
                    // }
                    // value={values.PortOfDischarge || null}
                    />

                    {/* Commission Agent */}
                    {values.LCType.type === 'Foreign' ? (
                      <RHFAutocomplete
                        name="CommissionAgent"
                        label="Commission Agent"
                        fullWidth
                        options={CommissionAgents}
                        getOptionLabel={(option) => option?.CommissionAgentName || ''}
                        isOptionEqualToValue={(option, value) =>
                          option?.CommissionAgentID === value?.CommissionAgentID
                        }
                      />
                    ) : null}

                    {/* Memorandum No */}
                    <RHFTextField
                      name="MemorandumNo"
                      label="Memorandum No"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />

                    {/* Sales Report Date */}
                    {/* <Controller
                      name="SalesReportDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DesktopDatePicker
                          {...field}
                          label="Sales Report Date"
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
                    /> */}


                    {/* Doc Submitted To Bank */}
                    <RHFTextField
                      name="DocSubmittedToBank"
                      label="Doc Submitted To Bank"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />

                    {/* Document Charge */}
                    {/* <RHFTextField
                      name="DocumentCharge"
                      label="Document Charge"
                      type="number"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    /> */}

                    {/* PRC Amount */}
                    {/* <RHFTextField
                      name="PRCAmount"
                      label="PRC Amount"
                      type="number"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    /> */}

                    {/* Port of Entry */}
                    {values.LCType.type === 'Foreign' ? (
                      <RHFAutocomplete
                        name="PortOfEntry"
                        label="Port of Entry"
                        fullWidth
                        options={EntryPorts}
                        getOptionLabel={(option) => option?.PortEntryName || ''}
                        isOptionEqualToValue={(option, value) =>
                          option?.PortEntryID === value?.PortEntryID
                        }
                      />
                    ) : null}

                    {/* Forwarding Agent */}
                    {values.LCType.type === 'Foreign' ? (
                      <RHFAutocomplete
                        name="ForwardingAgent"
                        label="Forwarding Agent"
                        fullWidth
                        options={ForwardingAgents || []}
                        getOptionLabel={(option) => option?.ForwardingAgentName || ''}
                        isOptionEqualToValue={(option, value) =>
                          option?.ForwardingAgentID === value?.ForwardingAgentID
                        }
                      />
                    ) : null}

                    {/* Doc H/O Date */}
                    <Controller
                      name="DocHODate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DesktopDatePicker
                          {...field}
                          label="Doc H/O Date"
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

                    {/* Docsent to Buyer */}
                    {/* <Controller
                      name="DocsentToBuyerDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DesktopDatePicker
                          {...field}
                          label="Docsent to Buyer"
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
                    /> */}

                    {/* Docsent to Broker */}
                    {/* <Controller
                      name="DocsentToBrokerDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DesktopDatePicker
                          {...field}
                          label="Docsent to Broker"
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
                    /> */}

                    {/* Country Of Origin */}
                    <RHFAutocomplete
                      name="CountryOfOrigin"
                      label="Country Of Origin"
                      fullWidth
                      type="country"
                      options={allCountries || []}
                      getOptionLabel={(option) => option?.Country_Name || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.Country_ID === value?.Country_ID
                      }
                    />
                    {/* Consigned(s) */}
                    <RHFTextField
                      name="Consignee"
                      label="Consignee(s)"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    // value={values.Buyer?.WIC_Name || ''}
                    />
                    {/* Notifying Party (ies) */}
                    <RHFTextField
                      name="NotifyingParty"
                      label="Notifying Party(ies)"
                      variant="outlined"
                      fullWidth
                    // value={values.Buyer?.WIC_Name || ''}
                    />
                    {/* No of Container(s) */}
                    <RHFTextField
                      name="NoOfContainers"
                      label="No of Container(s)"
                      type="number"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                    {/* Container Nos. */}
                    <RHFTextField
                      name="ContainerNos"
                      label="Container No."
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />

                    {/* Container Seal Nos. */}
                    <RHFTextField
                      name="ContainerSealNos"
                      label="Container Seal No."
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />

                    {/* Contract No */}
                    <RHFTextField
                      name="ContractNo"
                      label="Contract No"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                    {/* H.S Code */}
                    <AutocompleteWithMultiAdd
                      name="HSCode"
                      label="HS Code"
                      key={78787}
                      fullWidth
                      options={allHSCode}
                      // defaultValue={allHSCode.find((hs) => hs.HSCodeID === "1") || null}
                      getOptionLabel={(option) => option?.HSCode || ''}
                      isOptionEqualToValue={(option, value) => option?.HSCodeID === value?.HSCodeID}
                      value={values.HSCode || null}
                      onAdd={PostHSCode}
                      fields={[
                        { name: 'HSCode', label: 'HS Code' },
                        { name: 'Description', label: 'Description' },
                      ]}
                    />

                    {/* Delivery Quantity */}
                    <RHFTextField
                      name="DelieveryQuantity"
                      label="Delivery Quantity"
                      type="number"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="body2">KG</Typography>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Bag Quantity - Auto calculated */}
                    <RHFTextField
                      name="BagQuantity"
                      label="Bag Quantity"
                      type="number"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        readOnly: true,
                      }}
                    />

                    {/* Gross Weight */}
                    <RHFTextField
                      name="GrossWeight"
                      label="Gross Weight"
                      type="number"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                    {/* Net Weight */}
                    <RHFTextField
                      name="NetWeight"
                      label="Net Weight"
                      type="number"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        readOnly: true,
                      }}
                    />

                    {/* Flight Details */}
                    {values.LCType.type === 'Foreign' ? (
                      <RHFTextField
                        name="FlightDetails"
                        label="Flight Details"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                      />
                    ) : null}

                    {/* Rolls */}
                    {/* <RHFTextField
                      name="Rolls"
                      label="Rolls"
                      type="number"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={3}
                      InputLabelProps={{ shrink: true }}
                    /> */}

                    {/* Reference */}
                    <RHFTextField
                      name="Reference"
                      label="Reference"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={3}
                    />

                    {/* No of Truck(s) */}
                    {values.LCType.type === 'Local' ? (
                      <RHFTextField
                        name="NumberOfTrucks"
                        label="No of Truck(s)"
                        type="number"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : null}

                    {/* Transport Agent */}
                    <RHFAutocomplete
                      name="TransportAgent"
                      label="Transport Agent"
                      fullWidth
                      options={TransportAgents}
                      getOptionLabel={(option) => option?.TransportAgentName || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.TransportAgentID === value?.TransportAgentID
                      }
                    />

                    {/* FCR No. */}
                    <RHFTextField
                      name="FCRNo"
                      label="FCR No."
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />

                    {/* Exp Number */}
                    {values.LCType.type === 'Foreign' ? (
                      <RHFTextField
                        name="ExpNumber"
                        label="Exp Number"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : null}

                    {/* Exp Date */}
                    {values.LCType.type === 'Foreign' ? (
                      <Controller
                        name="ExpDate"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <DesktopDatePicker
                            {...field}
                            label="Exp Date"
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
                    ) : null}

                    {/* Shipping Bill No */}
                    {values.LCType.type === 'Foreign' ? (
                      <RHFTextField
                        name="ShippingBillNo"
                        label="Shipping Bill No"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : null}

                    {/* Shipping Bill Date */}
                    {values.LCType.type === 'Foreign' ? (
                      <Controller
                        name="ShippingBillDate"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <DesktopDatePicker
                            {...field}
                            label="Shipping Bill Date"
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
                    ) : null}

                    {/* UD/EP Number */}
                    {/* <RHFTextField
                      name="UDEPNumber"
                      label="UD/EP Number"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    /> */}

                    {/* UD/EP Date */}
                    {/* <Controller
                      name="UDEPDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DesktopDatePicker
                          {...field}
                          label="UD/EP Date"
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
                    /> */}

                    {/* Foreign Agent */}
                    {values.LCType.type === 'Foreign' ? (
                      <RHFAutocomplete
                        name="ForeignAgent"
                        label="Foreign Agent"
                        fullWidth
                        options={ForeignAgents}
                        getOptionLabel={(option) => option?.ForeignAgentName || ''}
                        isOptionEqualToValue={(option, value) =>
                          option?.ForeignAgentID === value?.ForeignAgentID
                        }
                      />
                    ) : null}

                    {/* Commission (%) */}
                    {values.LCType.type === 'Foreign' ? (
                      <RHFTextField
                        name="CommissionPercentage"
                        label="Commission (%)"
                        type="number"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : null}

                    {values.LCType.type === 'Foreign' ? (
                      <RHFTextField
                        name="CMPercentage"
                        label="CM (%)"
                        type="number"
                        variant="outlined"
                        fullWidth
                      />
                    ) : null}

                    {/* Carton Qty */}
                    {values.LCType.type === 'Foreign' ? (
                      <RHFTextField
                        name="CartonQty"
                        label="Carton Qty"
                        type="number"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : null}

                    {/* FCR Date */}
                    {values.LCType.type === 'Foreign' ? (
                      <Controller
                        name="FCRDate"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <DesktopDatePicker
                            {...field}
                            label="FCR Date"
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
                    ) : null}

                    {/* Payment Due Date */}
                    <Controller
                      name="PaymentDueDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DesktopDatePicker
                          {...field}
                          label="Payment Due Date"
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

                    <RHFTextField name="Description" label="Description" multiline rows={3} />
                  </Box>
                  {/* Multiple Challans Section */}
                  {values.LCType?.type === 'Local' ? (
                    <Box
                      columnGap={2}

                      sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Challan Information</Typography>
                        <Button
                          variant="outlined"
                          startIcon={<Iconify icon="mingcute:add-line" />}
                          onClick={handleAddChallan}
                        >
                          Add Challan
                        </Button>
                      </Box>
                      {challans.length > 0 ? (
                        <TableContainer component={Box}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ minWidth: 220 }}>Challan No</TableCell>
                                <TableCell>Challan Date</TableCell>
                                <TableCell align="right">Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {challans.map((challan, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <TextField
                                      fullWidth
                                      sx={{ minWidth: 300 }}
                                      label="Challan No"
                                      value={challan.ChallanNo || ''}
                                      onChange={(e) => handleChallanNoChange(index, e.target.value)}
                                      variant="outlined"
                                      InputLabelProps={{ shrink: true }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <DesktopDatePicker
                                      label="Challan Date"
                                      sx={{ minWidth: 280 }}
                                      format="dd MMM yyyy"
                                      value={challan.ChallanDate || null}
                                      onChange={(newValue) => handleChallanDateChange(index, newValue)}
                                      slotProps={{
                                        textField: {
                                          fullWidth: true,

                                          variant: 'outlined',
                                        },
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <IconButton
                                      color="error"
                                      onClick={() => handleRemoveChallan(index)}
                                      aria-label="delete"
                                    >
                                      <Iconify icon="solar:trash-bin-trash-bold" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Box
                          sx={{
                            p: 3,
                            textAlign: 'center',
                            border: '1px dashed',
                            // eslint-disable-next-line
                            borderColor: 'divider',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No challans added. Click Add Challan to add one.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ) : null}
                </Box>
              )}

              {activeStep === 2 && (
                <Box>
                  <h3>Export Invoice Shipment Information:</h3>
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
                    {/* Invoice Quantity */}
                    <RHFTextField
                      name="InvoiceQuantity"
                      label="Invoice Quantity"
                      type="number"
                      variant="outlined"
                      fullWidth
                      disabled
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="body2">{LCData?.UOMName}</Typography>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {/* Shipped Quantity */}
                    <RHFTextField
                      name="ShippedQuantity"
                      label="Shipped Quantity"
                      type="number"
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Box>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                  <LoadingButton
                    type="button"
                    variant="contained"
                    color="primary"
                    loading={isSubmitting}
                    onClick={() => {
                      if (activeStep === 2) {
                        handleSubmit(onSubmit)();
                      } else {
                        handleNext();
                      }
                    }}
                  >
                    {activeStep === 2 ? 'Save' : 'Next'}
                  </LoadingButton>
                </Stack>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}

ExportInvoiceEditForm.propTypes = {
  currentData: PropTypes.any,
  isReapproval: PropTypes.bool,
};
