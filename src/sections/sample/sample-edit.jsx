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
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
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
  RHFCreatableAutocomplete,
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
import { convertBDTtoUSD, convertUSDtoBDT } from 'src/utils/BDTtoUSD';
import Iconify from 'src/components/iconify';
import OpportunityDialog from './OpportunityDialog';
import QuotationDialog from './QuotationDialog';
import PropTypes from 'prop-types';
import { fDate } from 'src/utils/format-time';
import { APP_URL } from 'src/config-global';
import { fCurrency, fNumber } from 'src/utils/format-number';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';

const KGtoLbs = (kg) => kg * 2.20462;
// ----------------------------------------------------------------------

export default function SampleEditForm({ currentData }) {
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
  const [dialogValue, setDialogValue] = useState('');
  const [open, setOpen] = useState(false);

  const [allProducts, setAllProducts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [allPriceList, setAllPriceList] = useState([]);
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [allClauses, setAllClauses] = useState([]);
  const [allQuotations, setAllQuotations] = useState([]);
  const [allEndBuyers, setAllEndBuyers] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [isApproving, setIsApproving] = useState(false);
  const [allKAMs, setAllKAMs] = useState([]);

  // const [UOM, setAllUOM] = useState([]);
  // const [currencySymbol, setCurrencySymbol] = useState('$');

  // const allPriorities = [
  //   {
  //     value: 'High',
  //     label: 'High',
  //   },
  //   {
  //     value: 'Medium',
  //     label: 'Medium',
  //   },
  //   {
  //     value: 'Low',
  //     label: 'Low',
  //   },
  // ];

  const [sampleDetails, setSampleDetails] = useState([]);
  const [originalDetails, setOriginalDetails] = useState([]); // Track original details for update
  const [editingIndex, setEditingIndex] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [opportunityData, setOpportunityData] = useState([]);
  const [quotationData, setQuotationData] = useState([]);
  const [piData, setPiData] = useState([]);
  const [allSampleTypes, setAllSampleTypes] = useState([]);
  const [allFabricTypes, setAllFabricTypes] = useState([]);
  const [allColors, setAllColors] = useState([]);
  const [allCounts, setAllCounts] = useState([]);
  const [allCompositions, setAllCompositions] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [allUOM, setAllUOM] = useState([]);
  const [allPriorities, setAllPriorities] = useState([]);
  const [USDtoBDTRate, setUSDtoBDTRate] = useState(null);
  const [allPaymentTerms, setAllPaymentTerms] = useState([]);
  const [contactDetails, setContactDetails] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [canApprove, setCanApprove] = useState(false);

  const NewSampleSchema = Yup.object().shape({
    // Sample_Name: Yup.string().required('Company Name is required'),
    // Sample_Request_Date: Yup.date()
    //   .required('Sample Request Date is required')
    //   .test('is-future-or-today', 'Sample Request Date must be today or later', (value) => {
    //     if (!value) return false;
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);
    //     const inputDate = new Date(value);
    //     inputDate.setHours(0, 0, 0, 0);
    //     return inputDate >= today;
    //   }),
    // Delivery_Date: Yup.date()
    //   .required('Delivery Date is required')
    //   .min(
    //     Yup.ref('Sample_Request_Date'),
    //     'Delivery Date must be greater than or equal to Sample Request Date'
    //   ),
    IsNewProduct: Yup.string().required('Select an option'),
    // For mixed fields (like autocomplete), use Yup.object() or Yup.mixed() with proper type checking
    // Customer: Yup.mixed().when('IsNewProduct', {
    //   is: 'R',
    //   then: () =>
    //     Yup.mixed()
    //       .test('is-object', 'Customer is required', (value) => value && typeof value === 'object')
    //       .required(),
    //   otherwise: () => Yup.mixed().notRequired(),
    // }),

    // Opportunity: Yup.mixed().when(['IsNewProduct', 'Customer'], {
    //   is: (IsNewProduct, Customer) => !IsNewProduct && Customer,
    //   then: Yup.mixed().test(
    //     'is-object',
    //     'Opportunity is required',
    //     (value) => value && typeof value === 'object'
    //   ),
    //   otherwise: Yup.mixed().notRequired(),
    // }),
    // Quotation: Yup.mixed().when(['IsNewProduct', 'Opportunity'], {
    //   is: (IsNewProduct, Opportunity) => !IsNewProduct && Opportunity,
    //   then: Yup.mixed().test(
    //     'is-object',
    //     'Quotation is required',
    //     (value) => value && typeof value === 'object'
    //   ),
    //   otherwise: Yup.mixed().notRequired(),
    // }),
    // Payment_Term: Yup.mixed().when('IsNewProduct', {
    //   is: false,
    //   then: Yup.mixed().test(
    //     'is-object',
    //     'Payment Terms is required',
    //     (value) => value && typeof value === 'object'
    //   ),
    //   otherwise: Yup.mixed().notRequired(),
    // }),
    End_Customer: Yup.mixed().when('IsNewProduct', {
      is: 'Q',
      then: () =>
        Yup.mixed()
          .test(
            'is-object',
            'Main Buyer is required',
            (value) => value && typeof value === 'object'
          )
          .required(),
      otherwise: () => Yup.mixed().notRequired(),
    }),

    // Buyer_Name: Yup.string().when('IsNewProduct', {
    //   is: false,
    //   then: Yup.string().required('Buyer is required'),
    //   otherwise: Yup.string().notRequired(),
    // }),
  });

  const methods = useForm({
    resolver: yupResolver(NewSampleSchema),
    defaultValues: {
      IsNewProduct: 'R',
      Sample_Name: '',
      Sample_Request_Date: new Date(),
      Delivery_Date: null,
      Customer: null,
      // Concern_Person: null,
      ConcernPersonName: '',
      Contact_Number: '',
      Courier_Address: '',
      Email_Address: '',
      Opportunity: null,
      Quotation: null,
      Payment_Term: null,
      End_Customer: null,
      Buyer_Name: '',
    },
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

  const defaultValues = useMemo(
    () => ({
      IsNewProduct: currentData?.isRND || 'R',
      Sample_Code: currentData?.Sample_Code || 'N/A',
      Sample_Name: currentData?.Sample_Name || 'N/A',
      Sample_Request_Date: new Date(currentData?.Sample_Request_Date) || new Date(),
      Delivery_Date: new Date(currentData?.Delivery_Date) || null,
      Customer: customers?.find((customer) => customer.WIC_ID === currentData?.WIC_ID) || null,
      Opportunity:
        allOpportunities?.find(
          (opportunity) => opportunity.OpportunityID === currentData?.Opportunity_ID
        ) || null,
      Quotation:
        allQuotations?.find((quotation) => quotation.QuotationID === currentData?.Quotation_ID) ||
        null,
      PI: piData?.find((pi) => pi.PIID === currentData?.PI_ID) || null,
      Payment_Term:
        allPaymentTerms?.find(
          (paymentTerm) => paymentTerm.Payment_term_ID === currentData?.Payment_TermID
        ) || null,
      Agent: allAgents?.find((agent) => agent.AgentID === currentData?.AgentID) || null,
      End_Customer:
        allEndBuyers?.find((endBuyer) => endBuyer.End_Cust_ID === currentData?.End_CustomerID) ||
        null,
      Buyer_Name: currentData?.Buyer_Name || 'N/A',
      UOM: allUOM?.find((uom) => uom.UOM_ID === currentData?.Details[0]?.UOMID) || null,
      KAM: allKAMs?.find((kam) => kam.UserID === currentData?.KAM) || null,
      // Concern_Person: currentData?.Concern_Person_ID
      //   ? {
      //     Contact_ID: currentData?.Concern_Person_ID,
      //     Contact_Person_Name: currentData?.Concern_Person_Name,
      //     Contact_Person_Mobile: currentData?.Contact_Number,
      //     BranchAddress: currentData?.Courier_Address,
      //     Contact_Person_Email: currentData?.Email_Address,
      //   }
      //   : null,
      ConcernPersonName: currentData?.ConcernPersonName || '',
      Contact_Number: currentData?.Contact_Number || '',
      Courier_Address: currentData?.Courier_Address || '',
      Email_Address: currentData?.Email_Address || '',
    }),
    [
      currentData,
      customers,
      allAgents,
      piData,
      allUOM,
      allPaymentTerms,
      allOpportunities,
      allQuotations,
      allEndBuyers,
      allKAMs,
    ]
  );

  //           Sample_Req_ID: res?.data?.SampleMstID,
  //           Composition_ID: detail?.Composition_ID?.Composition_ID,
  //           YarnCountID: detail?.Yarn_Count_ID?.Yarn_Count_ID,
  //           ColorID: detail?.ColorID?.ColorID,
  //           Sample_Type_ID: detail?.Sample_Type.Sample_TypeID,
  //           Priority_CategoryID: detail.Priority?.Priority_CategoryID,
  //           Quantity: detail?.Quantity || 0,
  //           UOMID: 1,
  //           Price: detail?.Price || 0,
  //           DiscountPrice: detail?.DiscountPrice || 0,
  //           CurrencyID: 1,
  //           DiscountPriceInPercent: detail?.DiscountPriceInPercent || 0,
  //           Cost: detail?.Cost || 0,
  //           TotalAmount: TOTALAmount || 0,
  //           TotalAmountinBDT: detail?.TotalAmountinBDT || 0,
  //           ConversionRate: values?.ConversionRate || USDtoBDTRate || 0,
  //           Remarks: detail?.Remarks || 'N/A',
  //           IsActive: true,
  //           IsDeleted: false,
  //           CreatedBy: userData?.userDetails?.userId,
  //           Branch_ID: userData?.userDetails?.branchID,
  //           Org_ID: userData?.userDetails?.orgId,

  const fetchProductName = (yarnTypeID, countName, compositionName, colorName, colorCode) => {
    const productName = `${allTypes?.find((x) => x.Yarn_Type_ID === yarnTypeID)?.Yarn_Code
      } - ${countName} - ${compositionName} (${colorName} - ${colorCode})`;
    return productName;
  };

  useEffect(() => {
    if (!isLoading && currentData) {
      methods.reset(defaultValues);
      const mappedDetails = currentData?.Details.map((item) => ({
        Sample_Req_Dtl_ID: item?.Sample_Req_Dtl_ID || null, // Keep original ID for updates
        ProductName: fetchProductName(
          item.Yarn_TypeID,
          item.Yarn_Count_Name,
          item.Composition_Name,
          item.ColorName,
          item.Color_Code
        ),
        NoOfCones: item?.ConeQty || null,
        DtlDeliveryDate: item?.EstimatedDeliveryDate || null,
        EstimatedDeliveryDate: item?.EstimatedDeliveryDate ? new Date(item.EstimatedDeliveryDate) : null,
        CustomerFBDate: item?.CustomerFBDate ? new Date(item.CustomerFBDate) : null,
        Sample_Req_ID: item?.Sample_Req_ID || null,
        Composition_ID:
          allCompositions?.find((x) => x.Composition_ID === item.Composition_ID) || null,
        Yarn_Count_ID: allCounts?.find((x) => x.Yarn_Count_ID === item.YarnCountID) || null,
        ColorID: allColors?.find((x) => x.ColorID === item.ColorID) || null,
        Yarn_Type_ID: allTypes?.find((x) => x.Yarn_Type_ID === item.Yarn_TypeID) || null,
        Fabric_Type: allFabricTypes?.find((x) => x.Fabric_TypeID === item.Fabric_TypeID) || null,
        Sample_Type: allSampleTypes?.find((x) => Number(x.Sample_TypeID) === Number(item.Sample_TypeID)) || null,
        Priority: allPriorities?.find((x) => Number(x.Priority_CatID) === Number(item.Priority_CategoryID)) || null,
        Priority_CategoryID:
          allPriorities?.find((x) => Number(x.Priority_CategoryID) === Number(item.Priority_CategoryID)) || null,
        Quantity: item.Quantity || 0,
        UOM: allUOM?.find((x) => x.UOM_ID === item.UOMID) || null,
        Price: item.Price || 0,
        DiscountPrice: item.DiscountPrice || 0,
        CurrencyID: currencies.find((x) => x.CurrencyID === item.CurrencyID) || 1,
        DiscountPriceInPercent: item.DiscountPriceInPercent || 0,
        Cost: item.Cost || 0,
        TotalAmount: item.TotalAmount || 0,
        TotalAmountinBDT: item.TotalAmountinBDT || 0,
        ConversionRate: item.ConversionRate || 0,
        Remarks: item.Remarks || 'N/A',
        NewItemCode: item?.NewItemCode || null,
        KAM: allKAMs?.find((x) => x.UserID === item.KAM) || null,
      }));
      setSampleDetails(mappedDetails);
      setOriginalDetails(mappedDetails); // Store original for comparison
    }
    // eslint-disable-next-line
  }, [
    isLoading,
    defaultValues,
    methods,
    currentData,
    allAgents,
    piData,
    allCompositions,
    allCounts,
    allColors,
    allUOM,
    allSampleTypes,
    allPriorities,
    currencies,
    allTypes,
    allKAMs,
    allFabricTypes,
  ]);
  const GetCustomersData = useCallback(async () => {
    try {
      const response = await Get(
        `getAllWICList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setCustomers(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetAllClauses = useCallback(async () => {
    try {
      const response = await Get(`getAllClausesbyDocTypeID?Document_TypeID=1`);

      setAllClauses(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const GetAllActiveinactiveOpportunities = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllActiveinactiveOpportunities?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&RoleID=${userData?.userDetails?.roles[0]}&UserID=${userData?.userDetails?.userId}`
      );

      setAllOpportunities(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    userData?.userDetails?.roles,
    userData?.userDetails?.userId,
  ]);

  const GetQuotationActiveinActiveList = useCallback(async () => {
    try {
      const response = await Get(
        `GetQuotationActiveinActiveList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&RoleID=${userData?.userDetails?.roles[0]}&UserID=${userData?.userDetails?.userId}`
      );
      const simplifiedData = response.data.Data.map((item) => item?.QuotationMst);
      setAllQuotations(simplifiedData);
    } catch (error) {
      console.log(error);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    userData?.userDetails?.roles,
    userData?.userDetails?.userId,
  ]);

  const getpriceList = useCallback(async () => {
    try {
      const response = await Get(
        `getpriceList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setAllPriceList(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const fetchExchangeRate = useCallback(async () => {
    const rate = await convertBDTtoUSD(1);
    if (rate) {
      setBDTtoUSD(rate); // This is the multiplier, not rate for 1 BDT
    }
  }, []);

  const GetCurrencies = useCallback(async () => {
    const res = await Get('getActiveCurrencies');
    setCurrencies(res.data || []);
  }, []);

  const GetColors = useCallback(async () => {
    try {
      const response = await Get(
        `colors/all?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const newdata = response.data.Data.map((item) => ({
        ...item,
        ColorNickName: `${item.ColorName} - ${item.Color_Code}`,
      }));
      setAllColors(newdata);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetCounts = useCallback(async () => {
    try {
      const response = await Get(
        `Activeyarncount?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllCounts(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetTypeList = useCallback(async () => {
    try {
      const response = await Get(
        `getActiveyarntype?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllTypes(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetAllActiveUOM = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllActiveUOM?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllUOM(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetCompositionList = useCallback(async () => {
    try {
      const response = await Get(
        `yarncomposition/GetActiveCompositions?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllCompositions(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetSampleTypes = useCallback(async () => {
    try {
      const response = await Get(
        `GetSampleTypes?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllSampleTypes(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetFabricTypes = useCallback(async () => {
    try {
      const response = await Get(
        `GetFabricTypes?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllFabricTypes(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const getActiveendcustomer = useCallback(async () => {
    try {
      const response = await Get(
        `getActiveendcustomer?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllEndBuyers(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);
  const getAllActiveAgents = useCallback(async () => {
    try {
      const response = await Get(
        `getAllActiveAgents?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllAgents(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetPriorityCategoryList = useCallback(async () => {
    try {
      const response = await Get(
        `getPriorityCategoryList?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllPriorities(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const getPaymentTermList = useCallback(async () => {
    try {
      const response = await Get(
        `getPaymentTermList?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllPaymentTerms(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetKAMs = useCallback(async () => {
    try {
      const response = await Get(
        `GetAlLRegistereKAM?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllKAMs(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const fetchExchangeRateForBDT = useCallback(async () => {
    const rate = await convertUSDtoBDT(1);
    if (rate) {
      setUSDtoBDTRate(rate.toFixed(4)); // This is the multiplier, not rate for 1 BDT
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        GetCustomersData(),
        GetQuotationActiveinActiveList(),
        getpriceList(),
        GetAllActiveinactiveOpportunities(),
        GetAllClauses(),
        GetSampleTypes(),
        GetFabricTypes(),
        GetCurrencies(),
        GetColors(),
        GetCounts(),
        GetAllActiveUOM(),
        GetPriorityCategoryList(),
        getActiveendcustomer(),
        APIGetTypeList(),
        APIGetCompositionList(),
        getPaymentTermList(),
        getAllActiveAgents(),
        GetKAMs(),
      ]);
      setLoading(false);
      fetchExchangeRate();
      fetchExchangeRateForBDT();
    };
    fetchData();
    setValue('Sample_Request_Date', new Date());
    // eslint-disable-next-line
  }, [
    GetQuotationActiveinActiveList,
    GetCustomersData,
    getpriceList,
    GetAllActiveinactiveOpportunities,
    GetAllClauses,
    GetCurrencies,
    fetchExchangeRate,
    GetColors,
    GetCounts,
    GetAllActiveUOM,
    getActiveendcustomer,
    GetPriorityCategoryList,
    APIGetTypeList,
    APIGetCompositionList,
    fetchExchangeRateForBDT,
    getPaymentTermList,
    GetSampleTypes,
    GetFabricTypes,
    getAllActiveAgents,
    GetKAMs,
  ]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await Get(
          `GetProductsFrmPLBycountAndColorID?Yarncount=${values?.Yarn_Count_ID?.Yarn_Count_ID}&ColorID=${values?.ColorID?.ColorID}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );
        setAllProducts(response.data.Data);
      } catch (error) {
        setAllProducts([]);
      }
    };
    if (values?.ColorID && values?.Yarn_Count_ID) {
      setValue('Product', null);
      setSelectedProduct(null);
      fetch();
    }
  }, [
    values?.ColorID,
    values?.Yarn_Count_ID,
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    setSelectedProduct,
    setValue,
  ]);

  const GetPIByCustomerID = useCallback(async () => {
    try {
      const response = await Get(`GETPIAgainstCustomerID?WIC_ID=${values?.Customer?.WIC_ID}`);
      setPiData(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [values?.Customer?.WIC_ID]);

  useEffect(() => {
    GetPIByCustomerID();
  }, [values?.Customer?.WIC_ID, GetPIByCustomerID]);

  // const GetCustomerContacts = useCallback(async () => {
  //   if (!values?.Customer?.WIC_ID) {
  //     setContactDetails([]);
  //     setValue('Concern_Person', null);
  //     return;
  //   }
  //   try {
  //     const response = await Get(`getcustomerbyIDWithMergedContacts/${values?.Customer?.WIC_ID}`);
  //     setContactDetails(response.data?.ContactDetails || []);
  //   } catch (error) {
  //     console.log(error);
  //     setContactDetails([]);
  //   }
  // }, [values?.Customer?.WIC_ID, setValue]);

  // useEffect(() => {
  //   GetCustomerContacts();
  // }, [values?.Customer?.WIC_ID, GetCustomerContacts]);

  const selectedPI = watch('PI');

  useEffect(() => {
    const fetchPi = async () => {
      if (selectedPI?.PIID) {
        try {
          const response = await Get(
            `getProformaInvoicesAndDetails?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&PIID=${selectedPI?.PIID}`
          );
          const formatedData = response.data.Data[0]?.Details.map((item) => ({
            ...item,
            Price: item?.UnitPrice,
            CurrencyID: item?.Currency_ID,
            ProductName: item?.Description,
            NoOfCones: item?.ConesQty || null,
            TotalAmount: item?.Total_Amount,
            TotalAmountinBDT:
              // eslint-disable-next-line
              item?.Total_Amount * values?.ConversionRate ||
              // eslint-disable-next-line
              item?.Total_Amount * USDtoBDTRate ||
              // eslint-disable-next-line
              0,
            EstimatedDeliveryDate: item?.DeliveryDueDate ? new Date(item?.DeliveryDueDate) : null,
            CustomerFBDate: item?.FeedbackDueDate ? new Date(item?.FeedbackDueDate) : null,
            Yarn_Type_ID: { Yarn_Type_ID: item?.YarnTypeID, Yarn_Type: item?.Yarn_Type },
            // Priority_Category
            Priority: {
              Priority_CatID: item?.Priority_CategoryID,
              Priority_Category: item?.Priority_Category,
            },
            // Composition_ID: detail?.Composition_ID?.Composition_ID,
            // YarnCountID: detail?.Yarn_Count_ID?.Yarn_Count_ID,
            // ColorID: detail?.ColorID?.ColorID,
            Composition_ID: {
              Composition_ID: item?.CountID,
              Composition: item?.Yarn_Count_Name,
            },
            Yarn_Count_ID: {
              Yarn_Count_ID: item?.CountID,
              YarnCount: item?.Yarn_Count_Name,
            },
            ColorID: {
              ColorID: item?.ColorID,
              Color: item?.ColorName,
              Color_Code: item?.Color_Code,
            },
            Fabric_Type: {
              Fabric_TypeID: item?.Fabric_TypeID,
              Fabric_Type: item?.Fabric_Types,
            },
            UOM: {
              UOM_ID: item?.UOMID,
              UOMName: item?.UOMName,
            },
          }));
          // console.log(
          //   'details',
          //   response.data.Data[0]?.Details.map((item) => ({
          //     ...item,
          //     Price: item?.UnitPrice,
          //     CurrencyID: item?.Currency_ID,
          //     ProductName: item?.Description,
          //     NoOfCones: item?.ConesQty || null,
          //     TotalAmount: item?.Total_Amount,
          //     TotalAmountinBDT:
          //       // eslint-disable-next-line
          //       item?.Total_Amount * values?.ConversionRate ||
          //       // eslint-disable-next-line
          //       item?.Total_Amount * USDtoBDTRate ||
          //       // eslint-disable-next-line
          //       0,
          //     EstimatedDeliveryDate: item?.DeliveryDueDate ? new Date(item?.DeliveryDueDate) : null,
          //   }))
          // );
          setSampleDetails(formatedData);
          setValue('UOM', formatedData[0]?.UOM);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchPi();
    // eslint-disable-next-line
  }, [
    selectedPI,
    userData?.userDetails?.branchID,
    userData?.userDetails?.orgId,
    values?.ConversionRate,
  ]);

  const handleClose = () => {
    setDialogValue('');
    setOpen(false);
  };

  let OverAllTotalAmount = sampleDetails.reduce((total, detail) => {
    const quantity = parseFloat(detail.Quantity);
    const unitPrice = parseFloat(detail.Price);
    const currencyID = detail?.PriceListID?.CurrencyID;

    const price = currencyID === 8 ? unitPrice * BDTtoUSD : unitPrice;

    return total + quantity * price;
  }, 0);

  const KGtoLBs = (kg) => kg * 2.20462;
  const OverAllTotalQunatityInLbs = sampleDetails.reduce((total, detail) => {
    const quantity = parseFloat(detail.Quantity);
    // const q = uom === 7 ? quantity : KGtoLBs(quantity);
    return total + quantity;
  }, 0);

  const generateProductName = () => {
    const productCode = `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${values?.Yarn_Count_ID?.Yarn_Count_Name || ''
      } -  ${values?.Composition_ID?.Composition_Name || ''}  (${values?.ColorID?.ColorName || ''
      } - ${values?.ColorID?.Color_Code || ''})`;
    return productCode;
  };

  const generatePrefix = useMemo(
    () => {
      const yarnTypeCode = values?.Yarn_Type_ID?.Yarn_Code;
      const countName = values?.Yarn_Count_ID?.Yarn_Count_Name?.split('/').join('');
      const compositionValues = (() => {
        const name = values?.Composition_ID?.Composition_Name || '';
        const matches = name.match(/\d+%/g) || []; // Match all percentages
        const first = matches[0]?.replace('%', '').padStart(3, '0') || '000';
        const second = matches[1]?.replace('%', '').padStart(2, '0') || '00';
        return `${first}${second}`; // e.g., '06030', '10000'
      })();

      const itemCode = `SKU-${yarnTypeCode}-${countName}${compositionValues}-${values?.ColorID?.Color_Code}`;
      return itemCode;
    },
    [
      values?.Yarn_Type_ID,
      values?.Yarn_Count_ID,
      values?.Composition_ID?.Composition_Name,
      values?.ColorID?.Color_Code,
    ]
  );

  useEffect(() => {
    if (values?.Priority?.value === 'High') {
      // set ednDate to 3 days from today
      const today = new Date();
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);
      setValue('EndDate', threeDaysLater);
    } else if (values?.Priority?.value === 'Medium') {
      // set ednDate to 7 days from today
      const today = new Date();
      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(today.getDate() + 7);
      setValue('EndDate', sevenDaysLater);
    } else if (values?.Priority?.value === 'Low') {
      // set ednDate to 15 days from today
      const today = new Date();
      const fifteenDays = new Date(today);
      fifteenDays.setDate(today.getDate() + 15);
      setValue('EndDate', fifteenDays);
    }
  }, [values?.Priority?.value, setValue]);

  // useEffect(() => {
  //   const fetchOpportunityData = async (opportunityID) => {
  //     try {
  //       const response = await Get(`GetOpportunityById/${opportunityID}`);
  //       setTableData(response.data.OppProduct);
  //     } catch (error) {
  //       console.log(error);
  //       setTableData([]);
  //     }
  //   };

  //   if (values?.Opportunity) {
  //     setValue(
  //       'Customer',
  //       customers?.find((customer) => customer.WIC_ID === values?.Opportunity?.WICID) || null
  //     );

  //     fetchOpportunityData(values?.Opportunity?.OpportunityID);
  //   } else {
  //     setTableData([]);
  //     setValue('Customer', null);
  //   }
  // }, [values?.Opportunity, customers, setValue]);

  const filteredOpportunities = useMemo(
    () =>
      values?.Customer
        ? allOpportunities.filter((opportunity) => opportunity.WICID === values.Customer.WIC_ID)
        : [],
    [allOpportunities, values?.Customer]
  );

  const filteredQuotations = useMemo(
    () =>
      values?.Opportunity
        ? allQuotations.filter(
          (quotation) => quotation?.OpportunityID === values?.Opportunity?.OpportunityID
        )
        : [],
    [allQuotations, values?.Opportunity]
  );

  const TOTALAmount = useMemo(
    // eslint-disable-next-line
    () => (values?.Price && values?.Quantity ? values?.Price * values?.Quantity : 0),
    [values?.Price, values?.Quantity]
  );

  const fetchOpportunityData = useCallback(async () => {
    try {
      const response = await Get(`GetOpportunityById/${values?.Opportunity?.OpportunityID}`);
      setOpportunityData(response.data.OppProduct);
    } catch (error) {
      console.log(error);
      setOpportunityData([]);
    }
  }, [values?.Opportunity?.OpportunityID]);

  useEffect(() => {
    fetchOpportunityData();
  }, [values?.Opportunity?.OpportunityID, fetchOpportunityData]);

  const fetchQuotationData = useCallback(async () => {
    try {
      const response = await Get(`GetQuotationByID?quotationId=${values?.Quotation?.QuotationID}`);
      setQuotationData(response.data?.QuotationDtl);
    } catch (error) {
      console.log(error);
      setQuotationData([]);
    }
  }, [values?.Quotation?.QuotationID]);

  useEffect(() => {
    fetchQuotationData();
  }, [values?.Quotation?.QuotationID, fetchQuotationData]);

  const PostSampleTypes = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Sample Type', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (
      allSampleTypes.find((option) => option.Sample_Name.trim().toLowerCase() === newOptionTrimmed)
    ) {
      enqueueSnackbar('Sample Type Already Exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = [
        {
          Sample_Name: newOption,
          isActive: true,
          isDeleted: false,
          CreatedBy: userData?.userDetails?.userId,
          Org_ID: userData?.userDetails?.orgId,
          Branch_ID: userData?.userDetails?.branchID,
        },
      ];
      await Post('AddSampleType', dataToSend);
      GetSampleTypes();
      enqueueSnackbar('Sample Type Added Successfully', { variant: 'success' });
      handleClose();
    } catch (error) {
      console.log('Error', error);
    }
  };

  const PostFabricTypes = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Fabric Type', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (
      allFabricTypes.find((option) => option.Fabric_Types.trim().toLowerCase() === newOptionTrimmed)
    ) {
      enqueueSnackbar('Fabric Type Already Exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        Fabric_Types: newOption,
        isActive: true,
        isDeleted: false,
        CreatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddFabricType', dataToSend);
      GetFabricTypes();
      enqueueSnackbar('Fabric Type Added Successfully', { variant: 'success' });
      handleClose();
    } catch (error) {
      console.log('Error', error);
    }
  };

  const PostDetailData = async (detail) => {
    try {
      await Post(`AddsampleReqProducts`, detail);
    } catch (error) {
      console.log('Detail', error);
    }
  };

  const PostSampleMasterData = async (opData) => {
    try {
      await Post('CreateSample', opData).then(async (res) => {
        if (res?.status === 200) {
          const detailWithMstID = sampleDetails?.map((detail) => ({
            Sample_Req_ID: res?.data?.SampleMstID,
            Composition_ID: detail?.Composition_ID?.Composition_ID,
            YarnCountID: detail?.Yarn_Count_ID?.Yarn_Count_ID,
            ColorID: detail?.ColorID?.ColorID,
            Fabric_TypeID: detail?.Fabric_Type?.Fabric_TypeID || 0,
            Sample_TypeID: detail?.Sample_Type?.Sample_TypeID || 0,
            Priority_CategoryID: detail.Priority?.Priority_CatID,
            Product_Composed_Name: detail?.ProductName || 'N/A',
            Quantity: detail?.Quantity || 0,
            ConeQty: detail?.NoOfCones || 0,
            EstimatedDeliveryDate: detail?.EstimatedDeliveryDate
              ? formatDate(detail?.EstimatedDeliveryDate)
              : null,
            CustomerFBDate: detail?.CustomerFBDate ? formatDate(detail?.CustomerFBDate) : null,
            CustomerFB: '-',
            QtyInLBS: KGtoLbs(detail?.Quantity) || 0,
            UOMID: detail?.UOM?.UOM_ID || 0,
            Price: detail?.Price || 0,
            Yarn_TypeID: detail?.Yarn_Type_ID?.Yarn_Type_ID,
            DiscountPrice: detail?.DiscountPrice || 0,
            CurrencyID: 1,
            DiscountPriceInPercent: detail?.DiscountPriceInPercent || 0,
            Cost: detail?.Cost || 0,
            TotalAmount: detail?.TotalAmount || 0,
            TotalAmountinBDT: detail?.TotalAmountinBDT || 0,
            ConversionRate: values?.ConversionRate || USDtoBDTRate || 0,
            Remarks: detail?.Remarks || 'N/A',
            isActive: true,
            isDeleted: false,
            CreatedBy: userData?.userDetails?.userId,
            Branch_ID: userData?.userDetails?.branchID,
            Org_ID: userData?.userDetails?.orgId,
          }));

          await PostDetailData(detailWithMstID);
          enqueueSnackbar('Created Successfully!');
          reset();
          router.push(paths.dashboard.transaction.sample.root);
        }
      });
    } catch (error) {
      console.log(error);
      // if (error.response.status === 400) {
      // enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
      // } else enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
    }
  };

  // Update Sample Request API
  const UpdateSampleRequest = async (updateData) => {
    try {
      const response = await Post('updateSampleRequest', updateData);
      if (response?.status === 200) {
        enqueueSnackbar('Updated Successfully!', { variant: 'success' });
        router.push(paths.dashboard.transaction.sample.root);
      } else {
        enqueueSnackbar(response?.data?.Message || 'Failed to update', { variant: 'error' });
      }
    } catch (error) {
      console.error('Update error:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Failed to update sample request', {
        variant: 'error',
      });
    }
  };

  const PostPaymentterms = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Payment Term', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (
      allPaymentTerms.find(
        (option) => option.Payment_Term.trim().toLowerCase() === newOptionTrimmed
      )
    ) {
      enqueueSnackbar('This Payment Term already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        Payment_term: newOption,
        isActive: true,
        CreatedBy: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddPaymentTerm', dataToSend);
      getPaymentTermList();
      enqueueSnackbar('Payment Term Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (sampleDetails.length === 0) {
      enqueueSnackbar('Please add at least one sample product', { variant: 'error' });
      return;
    }

    // Check if we're in edit mode
    if (currentData?.Sample_Request_ID) {
      // Update mode
      const originalDetailIds = originalDetails.map((d) => d.Sample_Req_Dtl_ID).filter(Boolean);
      const currentDetailIds = sampleDetails.map((d) => d.Sample_Req_Dtl_ID).filter(Boolean);

      // Find deleted details (in original but not in current)
      const deletedDetailIds = originalDetailIds.filter((id) => !currentDetailIds.includes(id));

      // Prepare Details array
      const detailsArray = [];

      // Add new and updated details
      sampleDetails.forEach((detail) => {
        const isNewDetail = !detail.Sample_Req_Dtl_ID;
        const detailData = {
          Sample_Req_Dtl_ID: detail.Sample_Req_Dtl_ID || 0, // 0 for new items
          Sample_Name: data?.Sample_Name || 'N/A',
          Sample_Req_ID: currentData?.Sample_Request_ID,
          Product_Composed_Name: detail?.ProductName || generateProductName(),
          Sample_TypeID: detail?.Sample_Type?.Sample_TypeID || 0,
          Priority_CategoryID: detail?.Priority?.Priority_CatID || 0,
          Process_Status: 'Pending',
          Quantity: detail?.Quantity || 0,
          QtyInLBS: KGtoLbs(detail?.Quantity) || 0,
          ColorID: detail?.ColorID?.ColorID || 0,
          Yarn_TypeID: detail?.Yarn_Type_ID?.Yarn_Type_ID || 0,
          UOMID: detail?.UOM?.UOM_ID || 0,
          ConversionRate: detail?.ConversionRate || values?.ConversionRate || USDtoBDTRate || 0,
          Price: detail?.Price || 0,
          YarnCountID: detail?.Yarn_Count_ID?.Yarn_Count_ID || 0,
          DiscountPrice: detail?.DiscountPrice || 0,
          CurrencyID: typeof detail?.CurrencyID === 'object'
            ? (detail?.CurrencyID?.CurrencyID || 1)
            : (detail?.CurrencyID || 1),
          DiscountPriceInPercent: detail?.DiscountPriceInPercent || 0,
          Cost: detail?.Cost || 0,
          TotalAmount: detail?.TotalAmount || ((detail?.Price || 0) * (detail?.Quantity || 0)) || 0,
          TotalAmountinBDT: detail?.TotalAmountinBDT || (((detail?.Price || 0) * (detail?.Quantity || 0)) * (values?.ConversionRate || USDtoBDTRate || 0)) || 0,
          Fabric_TypeID: detail?.Fabric_Type?.Fabric_TypeID || 0,
          Composition_ID: detail?.Composition_ID?.Composition_ID || 0,
          ConeQty: detail?.NoOfCones || 0,
          EstimatedDeliveryDate: detail?.EstimatedDeliveryDate
            ? new Date(detail.EstimatedDeliveryDate).toISOString()
            : null,
          ApprovalStatus: 'P',
          ApprovedBy: null,
          Reason: '',
          CustomerFBDate: detail?.CustomerFBDate
            ? new Date(detail.CustomerFBDate).toISOString()
            : null,
          Remarks: detail?.Remarks || 'N/A',
          IsDeleted: false,
        };
        detailsArray.push(detailData);
      });

      // Add deleted details
      deletedDetailIds.forEach((id) => {
        detailsArray.push({
          Sample_Req_Dtl_ID: id,
          Sample_Name: data?.Sample_Name || 'N/A',
          Sample_Req_ID: currentData?.Sample_Request_ID,
          IsDeleted: true,
        });
      });

      const updateData = {
        Sample_Request_ID: currentData?.Sample_Request_ID,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
        Sample_Name: data?.Sample_Name || 'N/A',
        Sample_Code: currentData?.Sample_Code || 'N/A',
        PI_ID: data?.PI?.PIID || 0,
        WIC_ID: data.Customer?.WIC_ID || 0,
        Concern_Person_ID: data?.Concern_Person?.Contact_ID || 0,
        ConcernPersonName: data?.ConcernPersonName || '',
        Contact_Number: data?.Contact_Number || '',
        Courier_Address: data?.Courier_Address || '',
        Email_Address: data?.Email_Address || '',
        Propose_Date: currentData?.Propose_Date
          ? (currentData.Propose_Date instanceof Date
            ? currentData.Propose_Date.toISOString()
            : new Date(currentData.Propose_Date).toISOString())
          : null,
        Total_Propose_Sample: currentData?.Total_Propose_Sample || null,
        End_CustomerID: data?.End_Customer?.End_Cust_ID || 0,
        Agency_ID: data?.Agent?.AgentID || 0,
        Payment_TermID: data.Payment_Term?.Payment_term_ID || 0,
        Opportunity_ID: data?.Opportunity?.OpportunityID || 0,
        Quotation_ID: data?.Quotation?.QuotationID || 0,
        isRND: data?.IsNewProduct || 'R',
        Sample_Request_Date: data?.Sample_Request_Date
          ? new Date(data.Sample_Request_Date).toISOString()
          : null,
        Delivery_Date: data?.Delivery_Date ? new Date(data?.Delivery_Date).toISOString() : null,
        Remarks: data?.RemarksMaster || 'N/A',
        Status: currentData?.Status || 'Pending',
        ADM_Approve: currentData?.ADM_Approve || false,
        KAM: data?.KAM?.UserID || currentData?.KAM || 0,
        Details: detailsArray,
      };

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await UpdateSampleRequest(updateData);
      } catch (error) {
        console.error(error);
      }
    } else {
      // Create mode
      const dataToSend = {
        Buyer_Name: data?.Buyer_Name || 'N/A',
        KAM: data?.KAM?.UserID,
        Sample_Type_ID: data.Sample_Type?.Sample_TypeID,
        End_CustomerID: data?.End_Customer?.End_Cust_ID,
        Payment_TermID: data.Payment_Term?.Payment_term_ID,
        WIC_ID: data.Customer?.WIC_ID,
        Concern_Person_ID: data?.Concern_Person?.Contact_ID || 0,
        ConcernPersonName: data?.ConcernPersonName || '',
        Contact_Number: data?.Contact_Number || '',
        Courier_Address: data?.Courier_Address || '',
        Email_Address: data?.Email_Address || '',
        Opportunity_ID: data?.Opportunity?.OpportunityID || 0,
        Quotation_ID: data?.Quotation?.QuotationID || 0,
        PI_ID: data?.PI?.PIID || 0,
        isRND: data?.IsNewProduct || 'R',
        Sample_Request_Date: data?.Sample_Request_Date ? formatDate(data?.Sample_Request_Date) : null,
        Delivery_Date: data?.Delivery_Date ? formatDate(data?.Delivery_Date) : null,
        Remarks: data?.RemarksMaster || 'N/A',
        IsActive: true,
        CreatedBy: userData?.userDetails?.userId,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      };
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await PostSampleMasterData(dataToSend);
      } catch (error) {
        console.error(error);
      }
    }
  });

  const SendApproval = async (yesORno) => {
    if (!values?.Total_Propose_Sample) {
      enqueueSnackbar('Please add Total Propose Sample', { variant: 'error' });
      return;
    }
    if (!values?.Propose_Date) {
      enqueueSnackbar('Please add Propose Date', { variant: 'error' });
      return;
    }

    try {
      const respones = await Get(
        `UpdateApprovalStatus?RecordId=${currentData?.Sample_Request_ID
        }&ADM_Approve=${yesORno}&ADM_Approved_ID=${userData?.userDetails?.userId
        }&ADM_Approved_Remarks=${values?.ADM_Approved_Remarks || 'N/A'}&Propose_Date=${formatDate(
          new Date(values?.Propose_Date)
        )}&Total_Propose_Sample=${values?.Total_Propose_Sample}`
      );
      if (respones?.status === 200) {
        enqueueSnackbar('Sample Approved Successfully', { variant: 'success' });
        const generatedLink = `${APP_URL}${paths.dashboard.transaction.sample.pdf(
          currentData?.Sample_Request_ID
        )}`;
        const emailData = {
          ProformaNo: currentData?.Sample_Code,
          EmailTo: currentData?.EmailAddress,
          Subject: 'Sample Request Approved',
          Body: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .details { background: #f9f9f9; padding: 15px; border-left: 4px solid #5e8a36; margin: 20px 0; }
        .footer { margin-top: 20px; font-size: 12px; color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="container">
        <h2 class="header">Sample Request Approved</h2>
        
        <p>Dear ${currentData?.KAMName},</p>
        
        <p>The following sample request has been approved and is ready for processing:</p>
        
        <div class="details">
            <p><strong>Sample Request Code:</strong> ${currentData?.Sample_Code}</p>
            <p><strong>Approved By:</strong> ${userData?.userDetails?.userName}</p>
            <p><strong>Approval Date:</strong> ${fDate(new Date())}</p>
        </div>
        
        <p>You can view the details of the approved sample request below:</p>
        
        <table cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
            <tr>
                <td align="center" width="200" height="40" bgcolor="#5e8a36" style="-webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px; color: #ffffff; display: block;">
                    <a href="${generatedLink}" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; line-height: 40px; width: 100%; display: inline-block;">View Sample Details</a>
                </td>
            </tr>
        </table>
        
        <p>Please proceed with the next steps in the process.</p>
        
        <div class="footer">
            <p>Best regards,<br>${userData?.userDetails?.userName} </p>
        </div>
    </div>
</body>
</html>`,

          EmailBy: userData?.userDetails?.userId,
          BranchID: userData?.userDetails?.branchID,
          OrgID: userData?.userDetails?.orgId,
        };

        Post('ProformaInvoice/send', emailData);
        router.push(paths.dashboard.transaction.sample.root);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

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

  // Get available products (not already added to details)
  const availableProducts = useMemo(() => {
    const addedProductIds = sampleDetails.map((detail) => detail.Product?.Product_ID);
    return allProducts.filter((product) => !addedProductIds.includes(product.Product_ID));
  }, [sampleDetails, allProducts]);

  // useEffect(() => {
  //   setSampleDetails([]);
  // }, [values.PriceListID?.PriceListID]);

  const handleAddDetail = () => {
    // if (!selectedProduct) {
    //   enqueueSnackbar('Please select a product from pricelist', { variant: 'error' });
    //   return;
    // }
    // if (
    //   selectedProduct?.Product_ID.find(
    //     (detail) => detail?.Product_ID?.toLowerCase() === selectedProduct?.Product_ID?.toLowerCase()
    //   )
    // ) {
    //   enqueueSnackbar('Product already added', { variant: 'error' });
    //   return;
    // }
    if (!values.UOM) {
      enqueueSnackbar('Unit of Measure is required', { variant: 'error' });
      return;
    }
    if (!values.Sample_Type) {
      enqueueSnackbar('Sample Type is required', { variant: 'error' });
      return;
    }
    if (!values.Fabric_Type) {
      enqueueSnackbar('Fabric Type is required', { variant: 'error' });
      return;
    }
    if (!values.ColorID) {
      enqueueSnackbar('Color is required', { variant: 'error' });
      return;
    }

    if (!values.Yarn_Count_ID) {
      enqueueSnackbar('Yarn Count is required', { variant: 'error' });
      return;
    }
    if (!values.Composition_ID) {
      enqueueSnackbar('Yarn Composition is required', { variant: 'error' });
      return;
    }
    if (!values.Yarn_Type_ID) {
      enqueueSnackbar('Yarn Type is required', { variant: 'error' });
      return;
    }
    if (!values.Priority) {
      enqueueSnackbar('Priority is required', { variant: 'error' });
      return;
    }
    if (!values.Cost) {
      enqueueSnackbar('Production Cost is required', { variant: 'error' });
      return;
    }
    if (!values.Quantity) {
      enqueueSnackbar('Quantity is required', { variant: 'error' });
      return;
    }
    if (!values.EstimatedDeliveryDate) {
      enqueueSnackbar('Est. Delivery Date is required', { variant: 'error' });
      return;
    }
    if (!values.CustomerFBDate) {
      enqueueSnackbar('Feedback Date is required', { variant: 'error' });
      return;
    }
    // if (!values.NoOfCones) {
    //   enqueueSnackbar('No of Cones is required', { variant: 'error' });
    //   return;
    // }
    // if (!values.Price) {
    //   enqueueSnackbar('Unit Price is required', { variant: 'error' });
    //   return;
    // }
    // if (values.Price < selectedProduct?.Product_Price) {
    //   enqueueSnackbar('Unit Price should be greater than or equal to Product Price', {
    //     variant: 'error',
    //   });
    //   return;
    // }

    if (editingIndex !== null) {
      // Update existing detail
      const updatedDetails = [...sampleDetails];
      const existingDetail = updatedDetails[editingIndex];
      updatedDetails[editingIndex] = {
        ...existingDetail, // Preserve existing fields like Sample_Req_Dtl_ID
        NewItemCode: generatePrefix,
        Cost: values.Cost,
        ColorID: values.ColorID,
        Composition_ID: values.Composition_ID,
        ProductName: generateProductName(),
        Yarn_Count_ID: values.Yarn_Count_ID,
        Yarn_Type_ID: values.Yarn_Type_ID,
        Fabric_Type: values?.Fabric_Type,
        Sample_Type: values?.Sample_Type,
        // eslint-disable-next-line
        DiscountPrice: TOTALAmount * values?.ConversionRate || 0,
        Priority: values.Priority,
        PriceInUSD: values.PriceInUSD,
        NoOfCones: values?.NoOfCones,
        Quantity: values.Quantity,
        EstimatedDeliveryDate: values?.EstimatedDeliveryDate,
        CustomerFBDate: values?.CustomerFBDate,
        TotalAmount: TOTALAmount,
        TotalAmountinBDT:
          // eslint-disable-next-line
          TOTALAmount * values?.ConversionRate ||
          // eslint-disable-next-line
          TOTALAmount * USDtoBDTRate ||
          // eslint-disable-next-line
          0,
        Price: values.Price,
        // eslint-disable-next-line
        UOM: values.UOM,
        Product: values.Product,
        ConversionRate: values?.ConversionRate || USDtoBDTRate || 0,
        DiscountPriceInPercent: values?.DiscountPriceInPercent || 0,
        Remarks: values?.Remarks || 'N/A',
      };
      setSampleDetails(updatedDetails);
    } else {
      // Add new detail Compositio CreateSample
      setSampleDetails((prev) => [
        ...prev,
        {
          NewItemCode: generatePrefix,
          ProductName: generateProductName(),
          Cost: values.Cost,
          ColorID: values.ColorID,
          Composition_ID: values.Composition_ID,
          Yarn_Count_ID: values.Yarn_Count_ID,
          Yarn_Type_ID: values.Yarn_Type_ID,
          Fabric_Type: values?.Fabric_Type,
          Sample_Type: values?.Sample_Type,
          // eslint-disable-next-line
          DiscountPrice: TOTALAmount * values?.ConversionRate || 0,
          Priority: values.Priority,
          PriceInUSD: values.PriceInUSD,
          NoOfCones: values?.NoOfCones,
          Quantity: values.Quantity,
          EstimatedDeliveryDate: values?.EstimatedDeliveryDate,
          CustomerFBDate: values?.CustomerFBDate,
          TotalAmount: TOTALAmount,
          TotalAmountinBDT:
            // eslint-disable-next-line
            TOTALAmount * values?.ConversionRate ||
            // eslint-disable-next-line
            TOTALAmount * USDtoBDTRate ||
            // eslint-disable-next-line
            0,
          Price: values.Price,
          // eslint-disable-next-line
          DiscountPriceInPercent: values?.DiscountPriceInPercent,
          UOM: values.UOM,
        },
      ]);
    }

    // Always reset the form fields and editing state
    resetDetailForm();
  };

  const resetDetailForm = () => {
    setValue('Description', '');
    setValue('PriceListID', null);
    setValue('Product', null);
    setValue('ColorID', null);
    setValue('Yarn_Type_ID', null);
    setValue('Fabric_Type', null);
    setValue('Sample_Type', null);
    setValue('Priority', null);
    setValue('Yarn_Count_ID', null);
    setValue('Composition_ID', null);
    setValue('Remarks', '');
    setValue('Quantity', null);
    setValue('NoOfCones', null);
    setValue('EstimatedDeliveryDate', null);
    setValue('CustomerFBDate', null);
    setValue('Price', null);
    setValue('Cost', null);
    setValue('DiscountPrice', null);
    // setValue('ConversionRate', null);
    setEditingIndex(null);
    setSelectedProduct(null);
    OverAllTotalAmount = 0;
  };
  const handleEditDetail = (index) => {
    const detail = sampleDetails[index];
    if (!detail) return;

    // Set Product if it exists
    if (detail.Product) {
      setValue('Product', detail.Product);
    }

    // Set ColorID - already an object from allColors
    setValue('ColorID', detail.ColorID || null);

    // Set Yarn_Type_ID - already an object from allTypes
    setValue('Yarn_Type_ID', detail.Yarn_Type_ID || null);

    // Set Fabric_Type - already an object from allFabricTypes
    setValue('Fabric_Type', detail.Fabric_Type || null);

    // Set Sample_Type - already an object from allSampleTypes
    setValue('Sample_Type', detail.Sample_Type || null);

    // Set Yarn_Count_ID - already an object from allCounts
    setValue('Yarn_Count_ID', detail.Yarn_Count_ID || null);

    // Set Composition_ID - already an object from allCompositions
    setValue('Composition_ID', detail.Composition_ID || null);

    // Set Priority - already an object from allPriorities
    setValue('Priority', detail.Priority || null);

    // Set other fields
    setValue('Quantity', detail.Quantity || 0);
    setValue('NoOfCones', detail?.NoOfCones || null);
    setValue('EstimatedDeliveryDate', detail?.EstimatedDeliveryDate || null);
    setValue('CustomerFBDate', detail?.CustomerFBDate || null);
    setValue('Price', detail?.Price || 0);
    setValue('Cost', detail?.Cost || 0);
    setValue('Remarks', detail?.Remarks || '');

    // Set editing index
    setEditingIndex(index);

    // Scroll to the form section
    setTimeout(() => {
      const formSection = document.querySelector('[data-form-section]');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };
  // Table Heads
  const DetailsTableHead = [
    { id: 'Description', label: 'Product Composition', minWidth: 240 },
    { id: 'Sample_Type', label: 'Sample Type', minWidth: 120, align: 'center' },
    { id: 'Fabric_Type', label: 'Fabric Type', minWidth: 120, align: 'center' },
    { id: 'ColorID', label: 'Color', minWidth: 150, align: 'center' },
    { id: 'Yarn_Type_ID', label: 'Yarn Type', minWidth: 120, align: 'center' },
    { id: 'Yarn_Count_ID', label: 'Yarn Count', minWidth: 120, align: 'center' },
    { id: 'Composition_ID', label: 'Composition', minWidth: 200, align: 'center' },
    { id: 'Priority', label: 'Priority', minWidth: 100, align: 'center' },
    { id: 'Quantity', label: 'Quantity', minWidth: 120, align: 'center' },
    { id: 'NoOfCones', label: 'No of Cones', minWidth: 100, align: 'center' },
    { id: 'Cost', label: 'Cost', minWidth: 100, align: 'center' },
    { id: 'Product_Name', label: 'Unit Price', minWidth: 120, align: 'center' },
    { id: 'TotalInUSD', label: 'Total in USD', align: 'center', minWidth: 120 },
    { id: 'Price', label: 'Total in BDT', align: 'center', minWidth: 120 },
    { id: 'EstimatedDeliveryDate', label: 'Est. Delivery Date', align: 'center', minWidth: 120 },
    { id: 'CustomerFBDate', label: 'Est. Feedback Date', align: 'center', minWidth: 120 },
    { id: 'Remarks', label: 'Remarks', minWidth: 200 },
    { id: 'Actions', label: 'Actions', width: 88 },
  ];

  // Table
  const table = useTable();

  const notFound = !sampleDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = sampleDetails.filter((row) => row !== rowToDelete);
    setSampleDetails(updatedDetails);

    // If we're deleting the row being edited, reset the form
    if (editingIndex !== null && sampleDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);
      setValue('Product', null);
      setValue('Quantity', null);
      setValue('Price', null);
      setValue('NoOfCones', null);
      setValue('EstimatedDeliveryDate', null);
      setValue('CustomerFBDate', null);
    }
  };

  // -----------------------------------------------------------

  const [dialogOpen, setDialogOpen] = useState(false);
  const [oppDialogOpen, setOppDialogOpen] = useState(false);
  const [quoDialogOpen, setQuoDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };
  const handleOppDialogOpen = () => {
    setOppDialogOpen(true);
  };
  const handleQuoDialogOpen = () => {
    setQuoDialogOpen(true);
  };

  const handleDialogClose = () => {
    // FetchDepartment();
    setDialogOpen(false);
  };
  const handleOppDialogClose = () => {
    // FetchDepartment();
    setOppDialogOpen(false);
  };
  const handleQuoDialogClose = () => {
    // FetchDepartment();
    setQuoDialogOpen(false);
  };

  const price = selectedProduct?.Product_Price ?? 0;
  const priceFrom = selectedProduct?.Price_Range_Frm ?? 0;
  const priceTo = selectedProduct?.Price_Range_To ?? 0;
  const unit = selectedProduct?.UOMName ?? '';
  const symbol = selectedProduct?.currencyID === 8 ? '৳' : '$';

  const discountCalc = (totalPrice, discountPercentage) => {
    const discountAmount = (totalPrice * discountPercentage) / 100;
    const discountedPrice = totalPrice - discountAmount;

    // Check if the result is NaN and return null in that case
    return Number.isNaN(discountedPrice) ? null : discountedPrice;
  };

  useEffect(() => {
    if (selectedProduct?.Product_Price) {
      setValue('Cost', selectedProduct?.Product_Price);
    } else {
      setValue('Cost', '');
    }
  }, [selectedProduct, setValue]);

  // useEffect(() => {
  //   setSampleDetails([]);
  //   setEditingIndex(null);
  //   resetDetailForm();
  //   // eslint-disable-next-line
  // }, [values?.IsNewProduct]);

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
                  Please make sure the WIC is created in the system before creating a new sample.
                </Typography>
              </Box> */}
              <h3>Sample Details:</h3>
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
                <Box
                  sx={{
                    gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 3' },
                    display: 'flex',
                    alignItems: 'end',
                    gap: 1,
                  }}
                >
                  <RHFRadioGroup
                    name="IsNewProduct"
                    row
                    label="This Sample is"

                    defaultValue="R"
                    options={[
                      { value: 'R', label: 'RnD', disabled: true },
                      { value: 'I', label: 'Independent', disabled: true },
                      { value: 'Q', label: 'from Quotation', disabled: true },
                      { value: 'P', label: 'from PI', disabled: true },
                    ]}
                  />
                </Box>

                {/* <RHFTextField name="Sample_Code" label="Sample Ref. No." disabled /> */}
                {/* <RHFTextField name="Sample_Name" label="Sample Name" disabled /> */}
                {/* <RHFCreatableAutocomplete
                  name="Sample_Name"
                  label="Sample Name"
                  fullWidth
                  placeholder="Select or Type to create a new sample name"
                  options={allSamples}
                  // getOptionLabel={(option) => option?.Sample_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.Sample_ID === value?.Sample_ID}
                  onAddOption={PostSampleTypes}
                /> */}

                {values?.IsNewProduct !== 'R' && (
                  <>
                    <RHFAutocomplete
                      name="Customer"
                      label="Customer"
                      fullWidth
                      options={customers}
                      getOptionLabel={(option) => option?.WIC_Name || ''}
                      isOptionEqualToValue={(option, value) => option?.WIC_ID === value?.WIC_ID}
                    />

                    {/* <RHFAutocomplete
                      name="Concern_Person"
                      label="Concern Person"
                      fullWidth
                      options={contactDetails}
                      getOptionLabel={(option) => option?.Contact_Person_Name || ''}
                      isOptionEqualToValue={(option, value) => option?.Contact_ID === value?.Contact_ID}
                      disabled={!values?.Customer}
                    /> */}
                    <RHFTextField
                      name="ConcernPersonName"
                      label="Concern Person"
                      fullWidth
                    />

                    <RHFTextField
                      name="Contact_Number"
                      label="Contact Number"
                      fullWidth
                    />

                    <RHFTextField
                      name="Courier_Address"
                      label="Courier Address"
                      fullWidth
                      multiline
                    />

                    <RHFTextField
                      name="Email_Address"
                      label="Email Address"
                      fullWidth
                    />

                    {values?.IsNewProduct === 'Q' && (
                      <>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <RHFAutocomplete
                            name="Opportunity"
                            label="Opportunity"
                            fullWidth
                            options={filteredOpportunities}
                            getOptionLabel={(option) => option?.OpportunityName}
                            loading={isLoading}
                            value={values?.Opportunity || null}
                            disabled={!values?.Customer}
                          />
                          <Tooltip title="View Opportunity" placement="top">
                            <IconButton
                              sx={{ width: 40, height: 40 }}
                              color="primary"
                              onClick={handleOppDialogOpen}
                              disabled={!values?.Opportunity}
                            >
                              <Iconify icon="ph:eye-duotone" />
                            </IconButton>
                          </Tooltip>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <RHFAutocomplete
                            name="Quotation"
                            label="Quotation"
                            fullWidth
                            options={filteredQuotations}
                            getOptionLabel={(option) => option?.QuotationNo}
                            loading={isLoading}
                            value={values?.Quotation || null}
                            disabled={!values?.Opportunity}
                          />
                          <Tooltip title="View Quotation" placement="top">
                            <IconButton
                              sx={{ width: 40, height: 40 }}
                              color="primary"
                              onClick={handleQuoDialogOpen}
                              disabled={!values?.Quotation}
                            >
                              <Iconify icon="ph:eye-duotone" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </>
                    )}

                    {values?.IsNewProduct === 'P' && (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <RHFAutocomplete
                          name="PI"
                          label="PI"
                          fullWidth
                          options={piData}
                          getOptionLabel={(option) => option?.PINO}
                          loading={isLoading}
                          value={values?.PI || null}
                          disabled={!values?.Customer}
                        />
                      </Box>
                    )}

                    <RHFAutocomplete
                      name="End_Customer"
                      label="Main Buyer"
                      fullWidth
                      options={allEndBuyers}
                      getOptionLabel={(option) => option?.End_Cust_Name || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.End_Cust_ID === value?.End_Cust_ID
                      }
                    />
                    <RHFAutocomplete
                      name="Agent"
                      label="Agent"
                      fullWidth
                      options={allAgents}
                      getOptionLabel={(option) => option?.Agent_Name || ''}
                      isOptionEqualToValue={(option, value) => option?.AgentID === value?.AgentID}
                    />

                    <AutocompleteWithAdd
                      name="Payment_Term"
                      label="Payment Terms"
                      fullWidth
                      options={allPaymentTerms}
                      getOptionLabel={(option) => option?.Payment_Term || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.Payment_term_ID === value?.Payment_term_ID
                      }
                      onAdd={PostPaymentterms}
                      value={values?.Payment_Term || null}
                    />
                    {/* <RHFTextField name="Buyer_Name" label="Buyer / Third Party" fullWidth /> */}
                  </>
                )}

                {/* <Box /> */}
                {/* <RHFTextField name="ConsigneeName" label="Consignee Name" fullWidth />
                <RHFTextField name="ConsigneeCompany" label="Consignee Company" fullWidth />
                <RHFTextField name="ConsigneeAddress" label="Consignee Address" fullWidth /> */}

                <Controller
                  name="Sample_Request_Date"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      disabled
                      label="Request Date"
                      format="dd MMM yyyy"
                      defaultValue={new Date()}
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
                {/* <Controller
                  name="Delivery_Date"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      disabled
                      label="Delivery Date"
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
                /> */}
                <RHFAutocomplete
                  name="KAM"
                  label="Key Account Manager"
                  placeholder="Choose an option"
                  fullWidth
                  disabled
                  options={allKAMs}
                  getOptionLabel={(option) => option?.Username}
                  value={values?.KAM || null}
                />
                <RHFAutocomplete
                  name="UOM"
                  label="Unit of Measure"
                  placeholder="Choose an option"
                  fullWidth
                  disabled={sampleDetails?.length > 0}
                  options={allUOM}
                  value={values.UOM || null}
                  getOptionLabel={(option) => option?.UOMName || ''}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.UOM_ID === value.UOM_ID;
                  }}
                />
              </Box>

              {/* {tableData.length > 0 && (
                <TableContainer sx={{ mt: 2 }}>
                  <Scrollbar>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Opportunity Products
                    </Typography>
                    <Table sx={{ minWidth: 720 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Prcielist Name</TableCell>
                          <TableCell>Product</TableCell>
                          <TableCell align="center">Quantity</TableCell>
                          <TableCell align="center">Unit Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tableData?.map((row, index) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.PriceListName}</TableCell>
                            <TableCell>{row.Product_Name}</TableCell>
                            <TableCell align="center">{row.Quantity}</TableCell>
                            <TableCell align="center">{row.Price}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
              )} */}
            </Card>

            <Card sx={{ p: 3, mt: 2 }}>
              <Box sx={{ width: '100%' }}>
                <h3>Sample Products: </h3>
                <>
                  <Box
                    data-form-section
                    rowGap={3}
                    columnGap={2}
                    display="grid"
                    gridTemplateColumns={{
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(2, 1fr)',
                    }}
                  >
                    {/* <RHFTextField
                    name="Sample_Type"
                    label="Sample Type"
                    variant="outlined"
                    fullWidth
                    value={values?.Sample_Type || ''}
                  /> */}
                    <AutocompleteWithAdd
                      name="Sample_Type"
                      label="Sample Type"
                      options={allSampleTypes}
                      getOptionLabel={(option) => option?.Sample_Name || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.Sample_TypeID === value?.Sample_TypeID
                      }
                      onAdd={PostSampleTypes}
                      value={values?.Sample_Type || null}
                    />

                    <AutocompleteWithAdd
                      name="Fabric_Type"
                      label="Fabric Type"
                      options={allFabricTypes}
                      getOptionLabel={(option) => option?.Fabric_Types || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.Fabric_TypeID === value?.Fabric_TypeID
                      }
                      onAdd={PostFabricTypes}
                      value={values?.Fabric_Type || null}
                    />

                    <RHFAutocomplete
                      // sx={{ gridColumn: { xs: 'span 2' } }}
                      key={values?.ColorID?.ColorID || 'new'}
                      name="ColorID"
                      label="Color"
                      placeholder="Choose an option"
                      fullWidth
                      options={allColors}
                      value={values?.ColorID || null}
                      getOptionLabel={(option) => option?.ColorNameandCode || ''}
                      isOptionEqualToValue={(option, value) => {
                        if (!option || !value) return false;
                        return option.ColorID === value.ColorID;
                      }}
                    />
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: 'repeat(3, 1fr)',
                          // sm: 'repeat(2, 1fr)',
                          // md: 'repeat(3, 1fr)',
                        },
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                      }}
                    >
                      {/* <RHFAutocomplete
                      sx={{ gridColumn: { xs: 'span 2' } }}
                      name="PriceListID"
                      label="Active Pricelist"
                      placeholder="Choose an option"
                      fullWidth
                      options={allPriceList}
                      getOptionLabel={(option) => option?.PriceListName}
                    /> */}

                      <RHFAutocomplete
                        sx={{ gridColumn: { xs: 'span 2' } }}
                        name="Yarn_Count_ID"
                        label="Yarn Count"
                        placeholder="Choose an option"
                        fullWidth
                        options={allCounts}
                        value={values.Yarn_Count_ID || null}
                        getOptionLabel={(option) => option?.Yarn_Count_Name || ''}
                        isOptionEqualToValue={(option, value) => {
                          if (!option || !value) return false;
                          return option.Yarn_Count_ID === value.Yarn_Count_ID;
                        }}
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          disabled={
                            !values.Yarn_Count_ID?.Yarn_Count_ID || !values.ColorID?.ColorID
                          }
                          onClick={handleDialogOpen}
                        >
                          Check Price
                        </Button>
                      </Box>
                    </Box>

                    <RHFAutocomplete
                      name="Composition_ID"
                      label="Composition"
                      placeholder="Choose an option"
                      fullWidth
                      options={allCompositions}
                      value={values?.Composition_ID || null}
                      getOptionLabel={(option) => option?.Composition_Name || ''}
                      isOptionEqualToValue={(option, value) => {
                        if (!option || !value) return false;
                        return option.Composition_ID === value.Composition_ID;
                      }}
                    />
                    <RHFAutocomplete
                      name="Yarn_Type_ID"
                      label="Yarn Type"
                      placeholder="Choose an option"
                      fullWidth
                      options={allTypes}
                      value={values?.Yarn_Type_ID || null}
                      getOptionLabel={(option) => option?.Yarn_Type || ''}
                      isOptionEqualToValue={(option, value) => {
                        if (!option || !value) return false;
                        return option.Yarn_Type_ID === value.Yarn_Type_ID;
                      }}
                    />

                    <RHFTextField
                      sx={{ gridColumn: { sm: 'span 2' } }}
                      InputProps={{ shrink: true }}
                      disabled
                      name="Product_Name"
                      label="Product Composed Name"
                      fullWidth
                      value={generateProductName()}
                    />

                    <RHFTextField
                      sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                      name="Remarks"
                      label="Remarks (Optional)"
                      type="number"
                      multiline
                      rows={4}
                      variant="outlined"
                      fullWidth
                      value={values?.Remarks || ''}
                    />

                    <RHFAutocomplete
                      name="Priority"
                      label="Priority Category"
                      placeholder="Choose an option"
                      fullWidth
                      options={allPriorities}
                      value={values?.Priority || null}
                      getOptionLabel={(option) => option?.Priority_Category || ''}
                      isOptionEqualToValue={(option, value) => {
                        if (!option || !value) return false;
                        return option.Priority_CatID === value.Priority_CatID;
                      }}
                    />

                    <RHFTextField
                      name="Cost"
                      label="Production Cost"
                      type="number"
                      variant="outlined"
                      fullWidth
                      value={values?.Cost || ''}
                      // defaultValue={price || ''}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="body2">/ {values?.UOM?.UOMName}</Typography>
                          </InputAdornment>
                        ),
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography variant="body2">$</Typography>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <RHFTextField
                      name="Quantity"
                      label="Quantity"
                      type="number"
                      variant="outlined"
                      fullWidth
                      value={values.Quantity || ''}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="body2">{values?.UOM?.UOMName}</Typography>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <RHFTextField
                      name="NoOfCones"
                      label="No of Cones"
                      type="number"
                      variant="outlined"
                      fullWidth
                      value={values.NoOfCones || ''}
                    // InputProps={{
                    //   endAdornment: (
                    //     <InputAdornment position="end">
                    //       <Typography variant="body2">PCs</Typography>
                    //     </InputAdornment>
                    //   ),
                    // }}
                    />

                    <RHFTextField
                      name="Price"
                      label="Product Price"
                      type="number"
                      variant="outlined"
                      fullWidth
                      value={values?.Price || ''}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="body2">/ {values?.UOM?.UOMName}</Typography>
                          </InputAdornment>
                        ),
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography variant="body2">$</Typography>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <RHFTextField
                      name="TotalAmount"
                      label="Total Amount in $"
                      type="number"
                      variant="outlined"
                      fullWidth
                      disabled
                      // eslint-disable-next-line
                      value={values?.Price * values?.Quantity || ''}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography variant="body2">$</Typography>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Controller
                      name="EstimatedDeliveryDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DesktopDatePicker
                          {...field}
                          label="Est. Delivery Date"
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
                      name="CustomerFBDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DesktopDatePicker
                          {...field}
                          label="Est. Feedback Date"
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

                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Total Amount in BDT:{' '}
                    <span style={{ color: 'green' }}>
                      {(() => {
                        // Calculate the discounted price
                        // const discountedPrice = discountCalc(
                        //   // eslint-disable-next-line
                        //   values?.Price * values?.Quantity,
                        //   // eslint-disable-next-line
                        //   values?.DiscountPriceInPercent || 0
                        // );

                        // Calculate the final amount with exchange rate
                        const finalAmount =
                          // eslint-disable-next-line
                          TOTALAmount * values?.ConversionRate ||
                          // eslint-disable-next-line
                          TOTALAmount * USDtoBDTRate ||
                          // eslint-disable-next-line
                          0;

                        // Return formatted string if not NaN, otherwise return empty string
                        return !Number.isNaN(finalAmount) ? `৳ ${finalAmount}` : '';
                      })()}
                    </span>
                  </Typography>

                  <Stack alignItems="flex-end" direction="row-reverse" sx={{ mt: 3, gap: 2 }}>
                    <Button color="primary" onClick={handleAddDetail} variant="contained">
                      {editingIndex !== null ? 'Update' : 'Add'}
                    </Button>
                    {editingIndex !== null && (
                      <Button
                        color="error"
                        onClick={resetDetailForm}
                        variant="outlined"
                        sx={{ mt: 1 }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Stack>
                </>

                {(values?.IsNewProduct === 'Q' || values?.IsNewProduct === 'P') &&
                  sampleDetails.length === 0 && (
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, color: 'text.secondary', textAlign: 'center' }}
                    >
                      Please select a {values?.IsNewProduct === 'Q' ? 'Quotation' : 'PI'} to load
                      products.
                    </Typography>
                  )}
                {sampleDetails.length > 0 && (
                  <Scrollbar>
                    <Table
                      size={table.dense ? 'small' : 'medium'}
                      sx={{
                        minWidth: 460,
                        mt: 4,
                        border: 1,
                        borderColor: '#f4f6f8',
                        borderStyle: 'dotted',
                      }}
                    >
                      <TableHeadCustom
                        order={table.order}
                        orderBy={table.orderBy}
                        headLabel={DetailsTableHead}
                      />

                      <TableBody>
                        {sampleDetails.map((row, index) => (
                          <DetailTableRow
                            key={index}
                            row={row}
                            currentData={null}
                            onDeleteRow={() => DeleteDetailTableRow(row)}
                            onEditRow={() => handleEditDetail(index)}
                          />
                        ))}

                        <TableEmptyRows
                          height={denseHeight}
                          emptyRows={emptyRows(table.page, table.rowsPerPage, sampleDetails.length)}
                        />

                        <TableNoData notFound={notFound} />
                      </TableBody>
                    </Table>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="green">
                        {/* eslint-disable-next-line */}
                        {`Total Quantity: ${fNumber(OverAllTotalQunatityInLbs)} ${values?.UOM?.UOMName || 'KG'
                          }`}
                      </Typography>
                      <Typography variant="body2" color="green">
                        {/* eslint-disable-next-line */}
                        {'Total Amount: ' + fCurrency(OverAllTotalAmount)}
                      </Typography>
                    </Box>
                  </Scrollbar>
                )}
              </Box>
            </Card>

            <Box display="flex" justifyContent="end" alignItems="flex-end" gap={2} sx={{ mt: 3 }}>
              {canApprove && currentData?.ADM_Approve === 'P' && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <LoadingButton
                    variant="outlined"
                    onClick={() => SendApproval('R')}
                    color="error"
                    loading={isApproving}
                  >
                    Reject
                  </LoadingButton>
                  <LoadingButton
                    onClick={() => SendApproval('A')}
                    variant="contained"
                    color="primary"
                    loading={isApproving}
                  >
                    Approve
                  </LoadingButton>
                </Box>
              )}
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
              >
                Save
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>
      </FormProvider>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Sample Type</DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter the name for the new sample type</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="new-sample-type"
            value={dialogValue}
            onChange={(event) => setDialogValue(event.target.value)}
            label="Sample Type Name"
            type="text"
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={() => PostSampleTypes(dialogValue)}
            variant="contained"
            color="primary"
            disabled={!dialogValue}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <OpportunityDialog
        uploadClose={handleOppDialogClose}
        uploadOpen={oppDialogOpen}
        tableData={opportunityData}
      // selectedProduct={selectedProduct}
      // setSelectedProduct={setSelectedProduct}
      />
      <QuotationDialog
        uploadClose={handleQuoDialogClose}
        uploadOpen={quoDialogOpen}
        tableData={quotationData}
      // selectedProduct={selectedProduct}
      // setSelectedProduct={setSelectedProduct}
      />
      <PricelistDialog
        uploadClose={handleDialogClose}
        uploadOpen={dialogOpen}
        tableData={allProducts}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
      />
    </>
  );
}

SampleEditForm.propTypes = {
  currentData: PropTypes.any,
};
