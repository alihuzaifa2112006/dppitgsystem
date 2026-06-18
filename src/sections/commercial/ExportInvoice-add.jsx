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

export default function ExportInvoiceForm({ currentData }) {
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
  const [selectedLCData, setSelectedLCData] = useState(null);
  const [allHSCode, setAllHSCode] = useState([]);
  const [allEndBuyers, setAllEndBuyers] = useState([]);
  const [allModes, setAllModes] = useState([]);
  const [LCNO, setLCNO] = useState([]);
  const [ForwardingAgents, setForwardingAgents] = useState([]);
  const [TransportAgents, setTransportAgents] = useState([]);
  const [ForeignAgents, setForeignAgents] = useState([]);
  const [CommissionAgents, setCommissionAgents] = useState([]);
  const [EntryPorts, setEntryPorts] = useState([]);
  const [DischargePorts, setDischargePorts] = useState([]);

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
  const [challans, setChallans] = useState([]);
  const [lineItemsDialogOpen, setLineItemsDialogOpen] = useState(false);
  const [lineItemsData, setLineItemsData] = useState([]);
  const [selectedLineItems, setSelectedLineItems] = useState([]);
  const [shipmentLineItems, setShipmentLineItems] = useState([]);

  const BasicInfoSchema = Yup.object().shape({
    LCNo: Yup.object().required('L/C No is required'),
    LCType: Yup.object().required('L/C Type is required'),
    LCDate: Yup.date().required('L/C Date is required'),
    Buyer: Yup.object().required('Buyer is required'),
    LcAmount: Yup.number().required('L/C Amount is required').min(0, 'Amount must be positive'),
    Currency: Yup.object().required('Currency is required'),
    LienBank: Yup.object().required('Lien Bank is required'),
    PaymentTerms: Yup.object().required('Payment Term is required'),
    // FileReferenceNo is Optional according to Excel
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
      is: (LCType) => LCType?.type === 'Foreign', // This should work if LCType has a 'type' property
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
    NumberOfTrucks: Yup.number().when('LCType', {
      is: (LCType) => LCType?.type === 'Local',
      then: (schema) => schema.required('No of Trucks is required for Local LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    ExpNumber: Yup.string().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('Exp Number is required for Foreign LC'),
      otherwise: (schema) => schema.notRequired(),
    }),
    ExpDate: Yup.string().when('LCType', {
      is: (LCType) => LCType?.type === 'Foreign',
      then: (schema) => schema.required('Exp Date is required for Foreign LC'),
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
    PortOfLoading: Yup.object().required('Port of Loading is required'),
    PortOfDischarge: Yup.string().required('Port of Discharge is required'),
    CountryOfOrigin: Yup.object().required('Country of Origin is required'),
    Consignee: Yup.string().required('Consignee is required'),
    NotifyingParty: Yup.string().required('Notifying Party is required'),
    HSCode: Yup.object().required('HS Code is required'),
    // Other fields are optional
  });

  const ShipmentInfoSchema = Yup.object().shape({
    // Custom validation for shipment line items
    shipmentLineItems: Yup.mixed().test(
      'shipment-line-items-validation',
      'Shipment line items validation failed',
      function () {
        // eslint-disable-next-line
        const { shipmentLineItems } = this.options.context || {};

        // Check if at least one line item is added
        if (!shipmentLineItems || shipmentLineItems.length === 0) {
          // eslint-disable-next-line
          return this.createError({
            path: 'shipmentLineItems',
            message: 'Please add at least one line item',
          });
        }

        // Check maximum 5 line items
        if (shipmentLineItems.length > 5) {
          // eslint-disable-next-line
          return this.createError({
            path: 'shipmentLineItems',
            message: 'Maximum 5 line items allowed',
          });
        }

        // Check if all line items have delivery quantity
        const invalidLineItems = shipmentLineItems.some(
          (item) => !item.DeliveryQty || item.DeliveryQty <= 0
        );

        if (invalidLineItems) {
          // eslint-disable-next-line
          return this.createError({
            path: 'shipmentLineItems',
            message: 'Please enter delivery quantity for all line items',
          });
        }

        return true;
      }
    ),
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

  const methods = useForm({
    resolver: yupResolver(getCurrentSchema()),
    mode: 'onChange',
    context: { shipmentLineItems },
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
  useEffect(() => {
    methods.trigger(); // Re-validate with new schema
  }, [activeStep, methods]);

  // Re-validate when shipmentLineItems changes (for step 2)
  useEffect(() => {
    if (activeStep === 2) {
      methods.trigger();
    }
  }, [shipmentLineItems, activeStep, methods]);

  const defaultValues = useMemo(
    () =>
    // eslint-disable-next-line
    {
      // Find the default HS Code with ID=1


      return {
        LCDate: LCData?.LCDate ? new Date(LCData.LCDate) : new Date(),
        LcAmount: LCData?.ExportLCAmount || 0,
        FileReferenceNo: LCData?.FileRef || '',
        // Export Invoice fields
        ExportInvoiceDate: new Date(),
        ExportRegDate: new Date(2011, 0, 19),
        InvoicePurpose: null,

        Commission: null,
        AdjustmentAmount: null,
        // ExportInvoiceValue: LCData?.ExportLCAmount || 0,
        ExchangeRate: null,
        // InvoiceValueInTk: 0,
        InvoiceQuantity: LCData?.PIQty || 0,
        InvoiceUOM: LCData?.UOMName || null,
        DocumentSentToMarketingDate: null,
        IncoTerm: null,
        DocumentSentForBuyerAcceptanceDate: null,
        Freight: null,
        FreightCollection: false,
        ModeOfShipment: null,
        ExFactoryDate: null,
        OnboardDate: null,
        BuyerAcceptanceReceiveDate: null,
        MaturityDate: null,
        LCPurpose: allLCPurposes[0] || null,
        CINature: null,

      };
    },
    [LCData, allLCPurposes] // Add allHSCode dependency here
  );

  // Fixed useEffect for form reset
  useEffect(() => {
    if (!isLoading && Object.keys(defaultValues).length > 0) {
      methods.reset(defaultValues);
    }
  }, [isLoading, defaultValues, methods]);


  console.log(allHSCode, 'allHSCode');
  console.log(defaultValues, 'defaultValues');
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
  const GetCINatures = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetCINatures?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllCINatures(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);

  const GetLCDetailData = useCallback(async (exportLCID) => {
    try {
      if (!exportLCID) return;
      const response = await Get(
        `CommercialModule/GetExportLCDetailsByID?ExportLCID=${exportLCID}`
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
      setAllEndBuyers(response.data.Data);
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
      setCurrencies([response.data.Data]);
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
      setAllBanks([response.data.Data]);
      // eslint-disable-next-line
      return [response.data.Data];
    } catch (error) {
      console.log(error);
    }
  },
    // eslint-disable-next-line
    []);
  // eslint-disable-next-line
  const GetHSCode = useCallback(async () => {
    try {
      const response = await Get(`CommercialModule/GetHSCodes`);
      setAllHSCode(response.data.Data);
      // eslint-disable-next-line
      setValue('HSCode', response.data.Data[0], { shouldValidate: false });
      console.log(response.data.Data.find((hs) => hs.HSCodeID === "1"), "heloo")
      return response.data.Data;
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line
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
      setAllPaymentTerms(response.data.Data);
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
          // methods.setValue('PortOfLoading', allPorts.find((port) => port.PortID === lcData.PortID));
          methods.setValue('PortOfDischarge', lcData.FinalDestination);

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
          setSelectedLCData(lcData);

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
  useEffect(
    () => {
      if (selectedLCData && allPorts.length > 0) {
        const port = allPorts.find((portss) => portss.PortID === selectedLCData.PortID);
        methods.setValue('PortOfLoading', port || null);
      }
    },
    // eslint-disable-next-line
    [selectedLCData, allPorts]
  );

  useEffect(() => {
    if (activeStep === 1) {
      GetHSCode();
      console.log(activeStep, 'activeStep');
    }
  }, [GetHSCode, activeStep]);

  // useEffect(() => {
  //   // Wait until allHSCode is loaded (not just isLoading false)
  //   if (allHSCode.length > 0 && Object.keys(defaultValues).length > 0) {
  //     console.log('Resetting form with default values including HS Code');
  //     methods.reset(defaultValues);
  //   }
  // }, [defaultValues, methods, allHSCode]); // Add allHSCode dependency // Removed values.HSCode from dependencies
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

  // Reset challans when LC Type changes
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

  // Fetch line items when dialog opens
  useEffect(() => {
    const fetchLineItems = async () => {
      if (lineItemsDialogOpen && values.LCNo?.ExportLCID) {
        try {
          const response = await Get(
            `CommercialModule/GetExportLCLineItemsByID?ExportLCID=${values.LCNo.ExportLCID}`
          );
          if (response.data && Array.isArray(response.data)) {
            setLineItemsData(response.data);
          }
        } catch (error) {
          console.error('Error fetching line items:', error);
          enqueueSnackbar('Failed to load line items', { variant: 'error' });
        }
      }
    };
    fetchLineItems();
  }, [lineItemsDialogOpen, values.LCNo, enqueueSnackbar]);

  console.log(LCNO, 'LCNO');
  const onSubmit = handleSubmit(async (data) => {
    console.log('Form data:', data);

    // Convert challans array to ChallanDetails
    const challanDetails = (challans || []).map(challan => ({
      ChallanNo: challan.ChallanNo || '',
      ChallanDate: challan.ChallanDate ? formatDate(challan.ChallanDate) : null
    }));

    // Convert shipment line items to PIBreakdowns
    const piBreakdowns = shipmentLineItems.map(item => ({
      BreakdownID: item.BreakdownID || 0,
      PIQuantity: parseFloat(item.PIQuantity) || 0,
      DeliveryQty: parseFloat(item.DeliveryQty) || 0,
      UOMName: item.UOMName || '',
      NetWeight: parseFloat(item.NetWeight) || 0,
      TotalInvoiceQty: parseFloat(item.PIQuantity) || 0, // TotalInvoiceQty = PIQuantity
      TotalShippedQty: parseFloat(item.DeliveryQty) || 0, // TotalShippedQty = DeliveryQty
    }));

    const exportInvoiceData = {
      // Basic Information
      InvoiceTypeID: data.LCType?.id || 0, // Assuming 1=Foreign, 2=Local
      ExportInvoiceNo: data.ExportInvoiceNo || '',
      ExportInvoiceDate: data.ExportInvoiceDate ? formatDate(data.ExportInvoiceDate) : null,
      InvoicePurposeID: data.InvoicePurpose?.InvoicePurposeID || 0,
      ExportLCID: data.LCNo?.ExportLCID || 0,

      // Export Registration Info
      ExportRegistrationNo: data.ExportRegNO || '',
      ExportRegistrationDate: data.ExportRegDate ? formatDate(data.ExportRegDate) : null,

      // Financial Values
      GoodsValue: parseFloat(data.GoodsValue) || 0,
      Commission: parseFloat(data.Commission) || 0,
      AdjustmentAmount: parseFloat(data.AdjustmentAmount) || 0,
      ExportInvoiceValue: parseFloat(data.ExportInvoiceValue) || 0,
      ExchangeRate: parseFloat(data.ExchangeRate) || 0,
      InvoiceValueInTK: parseFloat(data.InvoiceValueInTk) || 0,
      InvoiceQty: parseFloat(data.InvoiceQuantity) || 0,
      UOMID: LCData?.UOMID || 0,

      // Terms and Conditions
      IncotermID: data.IncoTerm?.IncotermID || 0,
      ShipmentModeID: data.ModeOfShipment?.ShipmentModeID || 0,
      PurposeID: data.LCPurpose?.PurposeID || 0,
      CINatureID: data.CINature?.CINatureID || 0,

      // Dates
      DocSentForBuyerAcceptance: data.DocumentSentForBuyerAcceptanceDate ? formatDate(data.DocumentSentForBuyerAcceptanceDate) : null,
      BuyerAcceptanceDate: data.BuyerAcceptanceReceiveDate ? formatDate(data.BuyerAcceptanceReceiveDate) : null,
      MaturityDate: data.MaturityDate ? formatDate(data.MaturityDate) : null,
      ExFactoryDate: data.ExFactoryDate ? formatDate(data.ExFactoryDate) : null,
      OnBoardDate: data.OnboardDate ? formatDate(data.OnboardDate) : null,
      DocSenttomarketingdate: data.DocumentSentToMarketingDate ? formatDate(data.DocumentSentToMarketingDate) : null,
      DateSubmittedToBank: data.DateSubmittedToBank ? formatDate(data.DateSubmittedToBank) : null,

      // Financial - Shipping
      Freight: parseFloat(data.Freight) || 0,
      IsCollection: Boolean(data.FreightCollection) || false,
      IsForced: Boolean(data.IsForced) || false,

      // System and Remarks
      Remarks: data.Remarks || 'Export invoice created',

      // Additional Information - Shipping Details
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
      DocSubmittedToBank: data.DocSubmittedToBank || '',
      PortOfEntryID: data.PortOfEntry?.PortEntryID || 0,
      ForwardingAgentID: data.ForwardingAgent?.ForwardingAgentID || 0,
      DocHODate: data.DocHODate ? formatDate(data.DocHODate) : null,

      // Product Details
      CountryOfOriginID: data.CountryOfOrigin?.Country_ID || 0,
      Consignee_Additional: data.Consignee || '',
      NotifyingParty: data.NotifyingParty || '',
      NoOfContainers: parseInt(data.NoOfContainers, 10) || 0,
      ContainerNos: data.ContainerNos || '',
      ContainerSealNos: data.ContainerSealNos || '',
      ContractNo: data.ContractNo || '',
      HSCodeID: data.HSCode?.HSCodeID || '',
      Description: data.Description || '',
      FlightDetails: data.FlightDetails || '',
      Reference: data.Reference || '',
      TruckNumber: data.NumberOfTrucks || '',
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

      // PI Breakdowns - Line Items from Shipment Section
      PIBreakdowns: piBreakdowns,

      // Challan Details
      ChallanDetails: challanDetails,

      // User and Organization Info
      CreatedBy: userData?.userDetails?.userId || 0,
      Org_ID: userData?.userDetails?.orgId || 0,
      Branch_ID: userData?.userDetails?.branchID || 0,
    };

    console.log('Submitting Export Invoice Data:', exportInvoiceData);

    try {
      const response = await Post('CommercialModule/SaveExportInvoice', exportInvoiceData);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Export Invoice Created Successfully!', { variant: 'success' });
        router.push(paths.dashboard.Commercial.export.ExportInvoice.root);
      } else {
        throw new Error('Failed to create export invoice');
      }
    } catch (error) {
      console.error('Export Invoice Error:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to create export invoice!', {
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
        // Use schema validation with context
        try {
          await ShipmentInfoSchema.validate(
            { shipmentLineItems },
            {
              context: { shipmentLineItems },
              abortEarly: true // Show first error only for clarity
            }
          );
          return true;
        } catch (error) {
          // Show validation error in snackbar
          if (error.message) {
            enqueueSnackbar(error.message, { variant: 'error' });
          } else if (error.errors && error.errors.length > 0) {
            enqueueSnackbar(error.errors[0], { variant: 'error' });
          } else {
            enqueueSnackbar('Validation failed', { variant: 'error' });
          }
          return false;
        }
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
      // For step 2, specific error is already shown in validateStep
      // Only show generic message for other steps
      // eslint-disable-next-line 
      if (activeStep !== 2) {
        enqueueSnackbar('Please fill all required fields', { variant: 'error' });
      }
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
  // eslint-disable-next-line
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
                  onChange={(event, newValue) => {
                    // FIRST set the LCNo value in the form
                    methods.setValue('LCNo', newValue);

                    // THEN fetch and populate dependent data
                    if (newValue?.ExportLCID) {
                      handleLCNoChange(newValue);
                    }
                  }}
                />
                <RHFAutocomplete
                  name="LCType"
                  label="L/C Type"
                  fullWidth
                  options={[
                    { id: 1, type: 'Local' },
                    { id: 2, type: 'Foreign' },
                  ]}
                  getOptionLabel={(option) => option?.type || ''}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  value={values.LCType || null}
                />
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

                <RHFAutocomplete
                  name="Buyer"
                  label="Buyer"
                  fullWidth
                  disabled
                  options={allEndBuyers}
                  getOptionLabel={(option) => option?.WIC_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.WIC_ID === value?.WIC_ID}
                  value={values.Buyer || null}
                />

                <RHFTextField
                  name="LcAmount"
                  label="L/C Amount"
                  type="number"
                  variant="outlined"
                  disabled
                  fullWidth
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
                  disabled
                  getOptionLabel={(option) => option?.Currency_Name || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.Currency_ID === value?.Currency_ID
                  }
                  value={values.Currency || null}
                />

                <RHFAutocomplete
                  name="LienBank"
                  label="Lien Bank"
                  fullWidth
                  disabled
                  options={allBanks}
                  getOptionLabel={(option) => option?.BankName || ''}
                  isOptionEqualToValue={(option, value) => option?.LienBankID === value?.LienBankID}
                  value={values.LienBank || null}
                />

                <RHFAutocomplete
                  name="PaymentTerms"
                  label="Payment Terms"
                  disabled
                  fullWidth
                  options={allPaymentTerms}
                  getOptionLabel={(option) => option?.Payment_Term || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.Payment_term_ID === value?.Payment_term_ID
                  }
                  value={values.PaymentTerms || null}
                />

                <RHFTextField
                  name="FileReferenceNo"
                  label="File Reference No"
                  variant="outlined"
                  fullWidth
                  value={values.FileReferenceNo || ''}
                />
                <RHFTextField name="ExportRegNO" label="Export Registration No" value="260326210185819" disabled />

                <Controller
                  name="ExportRegDate"
                  control={control}

                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Export Registration Date"
                      format="dd MMM yyyy"
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}

                      disabled
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
                    {values?.LCType?.type === 'Foreign' ? (
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
                    {values?.LCType?.type === 'Foreign' ? (
                      <RHFTextField name="BLNo" label="BL No" variant="outlined" fullWidth />
                    ) : null}

                    {/* BL  */}
                    {values?.LCType?.type === 'Foreign' ? (
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
                    {values?.LCType?.type === 'Foreign' ? (
                      <RHFTextField
                        name="FeederVessel"
                        label="Feeder Vessel"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : null}

                    {/* Mother Vessel */}
                    {values?.LCType?.type === 'Foreign' ? (
                      <RHFTextField
                        name="MotherVessel"
                        label="Mother Vessel"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : null}

                    {/* ETD (POL) */}

                    {values?.LCType?.type === 'Foreign' ? (
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
                    {values?.LCType?.type === 'Foreign' ? (
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
                      disabled
                      value={values.PortOfLoading || null}
                    />

                    {/* Port of Discharge */}
                    <RHFTextField
                      name="PortOfDischarge"
                      label="Port of Discharge"
                      fullWidth
                      disabled
                    // options={DischargePorts}
                    // getOptionLabel={(option) => option?.PortDischargeName || ''}
                    // isOptionEqualToValue={(option, value) =>
                    //   option?.PortDischargeID === value?.PortDischargeID
                    // }
                    // value={values.PortOfDischarge || null}
                    />

                    {/* Commission Agent */}
                    {values?.LCType?.type === 'Foreign' ? (
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
                    {values?.LCType?.type === 'Foreign' ? (
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
                    {values?.LCType?.type === 'Foreign' ? (
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



                    {/* Flight Details */}
                    {values?.LCType?.type === 'Foreign' ? (
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
                    {values?.LCType?.type === 'Local' ? (
                      <RHFTextField
                        name="NumberOfTrucks"
                        label="Truck Number"
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
                    {values?.LCType?.type === 'Foreign' ? (
                      <RHFTextField
                        name="ExpNumber"
                        label="Exp Number"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : null}

                    {/* Exp Date */}
                    {values?.LCType?.type === 'Foreign' ? (
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
                    {values?.LCType?.type === 'Foreign' ? (
                      <RHFTextField
                        name="ShippingBillNo"
                        label="Shipping Bill No"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : null}

                    {/* Shipping Bill Date */}
                    {values?.LCType?.type === 'Foreign' ? (
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
                    {values?.LCType?.type === 'Foreign' ? (
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
                    {values?.LCType?.type === 'Foreign' ? (
                      <RHFTextField
                        name="CommissionPercentage"
                        label="Commission (%)"
                        type="number"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : null}

                    {values?.LCType?.type === 'Foreign' ? (
                      <RHFTextField
                        name="CMPercentage"
                        label="CM (%)"
                        type="number"
                        variant="outlined"
                        fullWidth
                      />
                    ) : null}

                    {/* Carton Qty */}
                    {values?.LCType?.type === 'Foreign' ? (
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
                    {values?.LCType?.type === 'Foreign' ? (
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <h3>Export Invoice Shipment Information:</h3>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setLineItemsDialogOpen(true)}
                    >
                      Line Items
                    </Button>
                  </Box>

                  {shipmentLineItems.length > 0 ? (
                    <TableContainer component={Box}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>PI No</TableCell>
                            <TableCell>Item Code</TableCell>
                            <TableCell sx={{ minWidth: 170 }}>WIC Name</TableCell>
                            <TableCell sx={{ minWidth: 170 }}>Product Description</TableCell>
                            <TableCell sx={{ minWidth: 100 }}>Color</TableCell>
                            <TableCell>Delivery Qty</TableCell>
                            <TableCell>Bag Qty</TableCell>
                            <TableCell>Gross Weight</TableCell>
                            <TableCell>Net Weight</TableCell>
                            <TableCell>UOM</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {shipmentLineItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.PINo}</TableCell>
                              <TableCell>{item.Item_Code}</TableCell>
                              <TableCell>{item.WIC_Name}</TableCell>
                              <TableCell>{item.ProductDescription}</TableCell>
                              <TableCell>{item.Color_and_Code}</TableCell>
                              <TableCell>
                                <TextField
                                  type="number"
                                  value={item.DeliveryQty || ''}
                                  onChange={(e) => {
                                    const newItems = [...shipmentLineItems];
                                    const deliveryQty = parseFloat(e.target.value) || 0;
                                    newItems[index].DeliveryQty = deliveryQty;
                                    // Calculate Bag Qty
                                    newItems[index].BagQty = (deliveryQty / 45.36).toFixed(2);
                                    // Calculate Gross Weight
                                    newItems[index].GrossWeight = (newItems[index].BagQty * 46.46).toFixed(2);
                                    // Net Weight equals Delivery Qty
                                    newItems[index].NetWeight = deliveryQty;
                                    setShipmentLineItems(newItems);
                                  }}
                                  size="small"
                                  sx={{ width: 120 }}
                                />
                              </TableCell>
                              <TableCell>{item.BagQty}</TableCell>
                              <TableCell>{item.GrossWeight}</TableCell>
                              <TableCell>{item.NetWeight}</TableCell>
                              <TableCell>{item.UOMName}</TableCell>
                              <TableCell align="right">
                                <IconButton
                                  color="error"
                                  onClick={() => {
                                    const newItems = shipmentLineItems.filter((_, i) => i !== index);
                                    setShipmentLineItems(newItems);
                                  }}
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
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        No line items added. Click Line Items button to add items.
                      </Typography>
                    </Box>
                  )}
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
                    onClick={async () => {
                      if (activeStep === 2) {
                        // Validate before submitting
                        const isValid = await validateStep(2);
                        if (isValid) {
                          handleSubmit(onSubmit)();
                        }
                        // Error message is already shown in validateStep
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

      {/* Line Items Dialog */}
      <Dialog
        open={lineItemsDialogOpen}
        onClose={() => setLineItemsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Select Line Items
          </Typography>

          {lineItemsData.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedLineItems.length === lineItemsData.length && lineItemsData.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLineItems(lineItemsData.map(item => item.BreakdownID));
                            } else {
                              setSelectedLineItems([]);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>PI No</TableCell>
                      <TableCell>WIC Name</TableCell>
                      <TableCell>Item Code</TableCell>
                      <TableCell>Product Description</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell>PI Quantity</TableCell>
                      <TableCell>UOM</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lineItemsData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedLineItems.includes(item.BreakdownID)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLineItems([...selectedLineItems, item.BreakdownID]);
                              } else {
                                setSelectedLineItems(selectedLineItems.filter(id => id !== item.BreakdownID));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>{item.PINo}</TableCell>
                        <TableCell>{item.WIC_Name}</TableCell>
                        <TableCell>{item.Item_Code}</TableCell>
                        <TableCell>{item.ProductDescription}</TableCell>
                        <TableCell>{item.Color_and_Code}</TableCell>
                        <TableCell>{item.PIQuantity}</TableCell>
                        <TableCell>{item.UOMName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button onClick={() => setLineItemsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    // Validate minimum 1 item
                    if (selectedLineItems.length === 0) {
                      enqueueSnackbar('Please select at least one line item', { variant: 'error' });
                      return;
                    }
                    // Validate maximum 5 items
                    if (selectedLineItems.length > 5) {
                      enqueueSnackbar('Maximum 5 line items allowed', { variant: 'error' });
                      return;
                    }
                    const selectedItems = selectedLineItems.map(breakdownId => {
                      const item = lineItemsData.find(i => i.BreakdownID === breakdownId);
                      if (!item) return null;
                      return {
                        ...item,
                        DeliveryQty: item.DeliveryQty || 0,
                        BagQty: ((item.DeliveryQty || 0) / 45.36).toFixed(2),
                        GrossWeight: (((item.DeliveryQty || 0) / 45.36) * 46.46).toFixed(2),
                        NetWeight: item.DeliveryQty || 0,
                      };
                    }).filter(item => item !== null);
                    setShipmentLineItems(selectedItems);
                    setLineItemsDialogOpen(false);
                    // Clear selections after confirming
                    setSelectedLineItems([]);
                  }}
                  disabled={selectedLineItems.length === 0}
                >
                  Confirm
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Loading line items...
              </Typography>
            </Box>
          )}
        </Box>
      </Dialog>
    </>
  );
}

ExportInvoiceForm.propTypes = {
  currentData: PropTypes.any,
  isReapproval: PropTypes.bool,
};
