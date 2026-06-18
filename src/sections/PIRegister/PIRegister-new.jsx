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
  Table,
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
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
} from 'src/components/table';

import { Get, Post } from 'src/api/apibasemethods';
import { decrypt, encrypt } from 'src/api/encryption';
import DetailTableRow from './detail-table-row';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { grid } from '@mui/system';
import PricelistDialog from './PricelistDialog';
import { convertBDTtoUSD } from 'src/utils/BDTtoUSD';
import { fCurrency, fNumber } from 'src/utils/format-number';
import OpportunityDialog from '../sample/OpportunityDialog';
import Iconify from 'src/components/iconify';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import { APP_API } from 'src/config-global';

// ----------------------------------------------------------------------

export default function PIRegisterCreateForm() {
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

  const [allProducts, setAllProducts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [allPriceList, setAllPriceList] = useState([]);
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [allClauses, setAllClauses] = useState([]);
  const [allPaymentTerms, setAllPaymentTerms] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [allColors, setAllColors] = useState([]);
  const [allCounts, setAllCounts] = useState([]);
  const [allCompositions, setAllCompositions] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [allUOM, setAllUOM] = useState([]);
  const [allKAMs, setAllKAMs] = useState([]);
  const [opportunityData, setOpportunityData] = useState([]);

  // New state variables for PI Register fields
  const [endCustomers, setEndCustomers] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [currenciesList, setCurrenciesList] = useState([]);
  const [paymentTermsList, setPaymentTermsList] = useState([]);
  const [isIND, setIsIND] = useState(true); // Default to checked
  const [isPO, setIsPO] = useState(false);
  
  // State for Supplier and related fields
  const [suppliers, setSuppliers] = useState([]);
  const [supplierPOs, setSupplierPOs] = useState([]);
  const [tradeTerms, setTradeTerms] = useState([]);
  const [shipmentModes, setShipmentModes] = useState([]);

  // New state variables for Quotation Products fields
  const [itemCategories, setItemCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [itemNames, setItemNames] = useState([]);
  const [itemDescriptions, setItemDescriptions] = useState([]);
  const [uomList, setUomList] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);

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

  const [piRegisterDetails, setPIRegisterDetails] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const NewPIRegisterSchema = Yup.object().shape({
    PINO: Yup.string().required('PI NO is required'),
    PIDate: Yup.date().required('PI Date is required'),
    Supplier: Yup.object().required('Supplier is required'),
    Purchase: Yup.object().required('Purchase is required'),
    StyleNo: Yup.string(),
    Purpose: Yup.object().required('Purpose is required'),
    PIExpiryDate: Yup.date().required('PI Expiry Date is required'),
    // SuppliersPo: Yup.object().required('Suppliers Po is required'),
    Buyer: Yup.object().required('Buyer is required'),
    Currency: Yup.object().required('Currency is required'),
    CurrencyRate: Yup.number().required('Currency Rate is required').min(0, 'Currency Rate must be positive'),
    ItemsValue: Yup.number().required('Items Value is required').min(0, 'Items Value must be positive'),
    ServiceCharge: Yup.number().min(0, 'Service Charge must be positive'),
    AdditionalCharge: Yup.number().min(0, 'Additional Charge must be positive'),
    DeductionAmount: Yup.number().min(0, 'Deduction Amount must be positive'),
    PIValue: Yup.number().required('PI Value is required').min(0, 'PI Value must be positive'),
    TradeTerm: Yup.object().required('Trade Term is required'),
    PayTerm: Yup.object().required('Pay Term is required'),
    ShipmentMode: Yup.object().required('Shipment Mode is required'),
    ShipmentDate: Yup.date().required('Shipment Date is required'),
    ETA: Yup.date().required('ETA is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewPIRegisterSchema),
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

  const generateProductName = () => {
    const productCode = `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${values?.Yarn_Count_ID?.Yarn_Count_Name || ''
      } -  ${values?.Composition_ID?.Composition_Name || ''}  (${values?.Color?.ColorName || ''} - ${values?.Color?.Color_Code || ''
      })`;
    return productCode;
  };

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

  const GetAllPaymentTerms = useCallback(async () => {
    try {
      const response = await Get(
        `getPaymentTermList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setAllPaymentTerms(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetApprovedOpportunities = useCallback(async () => {
    try {
      const response = await Get(
        `GetApprovedOpportunities?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&RoleID=${userData?.userDetails?.roles[0]}&UserID=${userData?.userDetails?.userId}`
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

  // API functions for new PI Register fields
  const GetEndCustomers = useCallback(async () => {
    try {
      const response = await axios.get(`${APP_API}CommercialModule/GetEndCustomer`);
      if (response.data.Success) {
        setEndCustomers(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setEndCustomers([]);
    }
  }, []);

  const GetLCPurposes = useCallback(async () => {
    try {
      const response = await axios.get(
        `${APP_API}CommercialModule/GetLCPurposes?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      if (response.data.Success) {
        setPurposes(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setPurposes([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetCurrenciesList = useCallback(async () => {
    try {
      const response = await axios.get(
        `${APP_API}CommercialModule/GetCurrencies?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      if (response.data.Success) {
        setCurrenciesList(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setCurrenciesList([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetPaymentTermsList = useCallback(async () => {
    try {
      const response = await axios.get(
        `${APP_API}CommercialModule/GetPaymentTerms?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      if (response.data.Success) {
        setPaymentTermsList(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setPaymentTermsList([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // API functions for Supplier and related fields
  const GetSuppliers = useCallback(async () => {
    try {
      const response = await axios.get(
        `${APP_API}Production/GetVendors?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (response.data.Success) {
        setSuppliers(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setSuppliers([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetSupplierPOs = useCallback(async (vendorID) => {
    if (!vendorID) {
      setSupplierPOs([]);
      return;
    }
    try {
      const response = await axios.get(
        `${APP_API}CommercialModule/GetVendorPOs?VendorID=${vendorID}`
      );
      if (Array.isArray(response.data)) {
        setSupplierPOs(response.data || []);
      } else if (response.data.Success) {
        setSupplierPOs(response.data.Data || []);
      } else {
        setSupplierPOs([]);
      }
    } catch (error) {
      console.log(error);
      setSupplierPOs([]);
    }
  }, []);

  const GetPODetails = useCallback(async (poID) => {
    if (!poID) {
      return [];
    }
    try {
      const response = await axios.get(
        `${APP_API}CommercialModule/GetPODetailsByPOID?POID=${poID}`
      );
      if (response.data.Success) {
        return response.data.Data || [];
      } 
      // eslint-disable-next-line
      else if (Array.isArray(response.data)) {
        return response.data || [];
      }
      return [];
    } catch (error) {
      console.log(error);
      return [];
    }
  }, []);

  const GetTradeTerms = useCallback(async () => {
    try {
      const response = await axios.get(
        `${APP_API}CommercialModule/GetTradeTerms?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
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

  const GetShipmentModes = useCallback(async () => {
    try {
      const response = await axios.get(
        `${APP_API}CommercialModule/GetShipmentModes?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (response.data.Success) {
        setShipmentModes(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setShipmentModes([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // API functions for Quotation Products fields
  const GetItemCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        `${APP_API}CommercialModule/GetInvCategories?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (response.data.Success) {
        setItemCategories(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setItemCategories([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetSubCategories = useCallback(async (invCatId) => {
    if (!invCatId) {
      setSubCategories([]);
      return;
    }
    try {
      const response = await axios.get(
        `${APP_API}CommercialModule/GetSubCategories?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}&Inv_Cat_ID=${invCatId}`
      );
      if (response.data.Success) {
        setSubCategories(response.data.Data || []);
      } else {
        setSubCategories([]);
      }
    } catch (error) {
      console.log(error);
      setSubCategories([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetItemNames = useCallback(async (invCatId, subCatId) => {
    if (!invCatId || !subCatId) {
      setItemNames([]);
      setItemDescriptions([]);
      return;
    }
    try {
      const response = await axios.get(
        `${APP_API}CommercialModule/GetItemSpecifications?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}&InvCatID=${invCatId}&SubCat_ID=${subCatId}`
      );
      if (response.data.Success) {
        // Map response to include ItemSpec_ID for compatibility
        const mappedData = (response.data.Data || []).map(item => ({
          ...item,
          ItemSpec_ID: item.ItemID,
          ItemSpec_Name: item.ItemCode || item.ItemDescription,
          ItemName: item.ItemCode || item.ItemDescription,
        }));
        setItemNames(mappedData);
        setItemDescriptions(mappedData);
      } else {
        setItemNames([]);
        setItemDescriptions([]);
      }
    } catch (error) {
      console.log(error);
      setItemNames([]);
      setItemDescriptions([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetUOMList = useCallback(async () => {
    try {
      const response = await axios.get(
        `${APP_API}CommercialModule/GetUOM`
      );
      if (response.data.Success) {
        setUomList(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setUomList([]);
    }
  }, []);

  const GetCurrencyList = useCallback(async () => {
    try {
      const response = await axios.get(
        `${APP_API}Production/GetSubCategories?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );
      if (response.data.Success) {
        setCurrencyList(response.data.Data || []);
      }
    } catch (error) {
      console.log(error);
      setCurrencyList([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        GetCustomersData(),
        getpriceList(),
        GetApprovedOpportunities(),
        GetAllClauses(),
        GetCurrencies(),
        GetAllPaymentTerms(),
        GetColors(),
        GetCounts(),
        APIGetTypeList(),
        APIGetCompositionList(),
        GetAllActiveUOM(),
        GetKAMs(),
        GetEndCustomers(),
        GetLCPurposes(),
        GetCurrenciesList(),
        GetPaymentTermsList(),
        GetSuppliers(),
        GetTradeTerms(),
        GetShipmentModes(),
        GetItemCategories(),
        GetUOMList(),
        GetCurrencyList(),
      ]);
      setLoading(false);
      fetchExchangeRate();
    };
    fetchData();
  }, [
    GetCustomersData,
    getpriceList,
    GetApprovedOpportunities,
    GetAllClauses,
    GetCurrencies,
    fetchExchangeRate,
    GetAllPaymentTerms,
    GetColors,
    GetCounts,
    APIGetTypeList,
    APIGetCompositionList,
    GetAllActiveUOM,
    GetKAMs,
    GetEndCustomers,
    GetLCPurposes,
    GetCurrenciesList,
    GetPaymentTermsList,
    GetSuppliers,
    GetTradeTerms,
    GetShipmentModes,
    GetItemCategories,
    GetUOMList,
    GetCurrencyList,
  ]);

  // useEffect(() => {
  //   const fetch = async () => {
  //     try {
  //       const response = await Get(`GetPriceListById/${values?.PriceListID?.PriceListID}`);
  //       setAllProducts(
  //         response.data.Details.map((item) => ({
  //           ...item,
  //           Currency_ID: response.data.Master?.CurrencyID,
  //         }))
  //       );
  //     } catch (error) {
  //       setAllProducts([]);
  //     }
  //   };
  //   if (values?.PriceListID) {
  //     setValue('Product', null);
  //     setSelectedProduct(null);
  //     fetch();
  //   }
  // }, [values?.PriceListID, setSelectedProduct, setValue]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await Get(
          `GetProductsFrmPLBycountAndColorID?Yarncount=${values?.Yarn_Count_ID?.Yarn_Count_ID}&ColorID=${values?.Color?.ColorID}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );
        setAllProducts(response.data.Data);
        if (
          response.data.Data?.find(
            (product) => product.Product_ID === piRegisterDetails[editingIndex]?.Product?.Product_ID
          )
        ) {
          setSelectedProduct(
            response.data.Data?.find(
              (product) =>
                product.Product_ID === piRegisterDetails[editingIndex]?.Product?.Product_ID
            )
          );
        } else {
          setSelectedProduct(null);
        }
      } catch (error) {
        setAllProducts([]);
      }
    };
    if (values?.Color && values?.Yarn_Count_ID) {
      // setValue('Product', null);
      // setSelectedProduct(null);
      fetch();
    }
  }, [
    values?.Color,
    values?.Yarn_Count_ID,
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    editingIndex,
    piRegisterDetails,
    setSelectedProduct,
    setValue,
  ]);

  const TotalAmount = piRegisterDetails.reduce((total, detail) => {
    const amount = parseFloat(detail.Amount) || 0;
    return total + amount;
  }, 0);

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

  useEffect(() => {
    const fetchOpportunityData = async (opportunityID) => {
      try {
        const response = await Get(`GetOpportunityById/${opportunityID}`);
        setTableData(response.data.OppProduct);
      } catch (error) {
        console.log(error);
        setTableData([]);
      }
    };

    if (values?.Opportunity) {
      setValue(
        'Customer',
        customers?.find((customer) => customer.WIC_ID === values?.Opportunity?.WICID) || null
      );

      fetchOpportunityData(values?.Opportunity?.OpportunityID);
    } else {
      setTableData([]);
      setValue('Customer', null);
    }
  }, [values?.Opportunity, customers, setValue]);

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
      GetAllPaymentTerms();
      enqueueSnackbar('Payment Term Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const PostDetailData = async (detail) => {
    try {
      await Post(`AddQuotationDetails`, detail);
    } catch (error) {
      console.log('Detail', error);
    }
  };

  const PostQuotationMasterData = async (opData) => {
    try {
      await Post('AddQuotation', opData).then(async (res) => {
        if (res?.status === 200) {
          const detailWithMstID = piRegisterDetails?.map((detail) => ({
            QuotationID: res.data.MasterID,
            PriceList_ID: detail?.PriceListID?.PriceListID || 0,
            Product_ID: detail?.Product?.Product_ID || 0,
            ColorID: detail?.Color?.ColorID,
            YarnCountID: detail?.Yarn_Count_ID?.Yarn_Count_ID,
            YarnTypeID: detail?.Yarn_Type_ID?.Yarn_Type_ID,
            CompositionID: detail?.Composition_ID?.Composition_ID,
            UOMID: detail.UOM?.UOM_ID,
            UnitPrice: parseInt(detail?.Unit_Price, 10),
            // Requirement: detail?.Requirement,
            Description: detail?.Description || 'N/A',
            Quantity: parseInt(detail?.Quantity, 10),
            Total_Amount: TotalAmount,
            Revision_No: 0,
            Remarks: detail?.Remarks || 'N/A',
            IsActive: true,
            IsDeleted: false,
            CreatedBy: userData?.userDetails?.userId,
            Branch_ID: userData?.userDetails?.branchID,
            Org_ID: userData?.userDetails?.orgId,
          }));

          await PostDetailData(detailWithMstID);
          enqueueSnackbar('Created Successfully!');
          reset();
          router.push(paths.dashboard.Commercial.import.ImportPIRegister.root);
        }
      });
    } catch (error) {
      console.log(error);
      if (error.response.status === 400) {
        enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
      } else enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
    }
  };

  const SavePIRegister = async (dataToSend) => {
    try {
      const response = await axios.post(
        `${APP_API}CommercialModule/SaveImportPIRegister`,
        dataToSend
      );
      return response;
    } catch (error) {
      console.error('Error saving PI Register:', error);
      throw error;
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (piRegisterDetails.length === 0) {
      enqueueSnackbar('Please add at least one PIRegister product', { variant: 'error' });
      return;
    }

    // Map form data to API structure
    const details = piRegisterDetails.map((detail) => {
      // Use POQty when PO is checked, PIQty when IND is checked
      const quantity = isPO ? (detail.POQty || 0) : (detail.PIQty || 0);
      
      const detailData = {
        InvCatID: detail.ItemCategory?.Inv_Cat_ID || null,
        SubCatID: detail.SubCategory?.SubCat_ID || null,
        ItemID: detail.ItemName?.ItemID || detail.ItemName?.ItemSpec_ID || null,
        UOMID: detail.UOM?.UOMID || null,
        PODtlID: detail.PODtlID || null, // Will be set if from PO
        PIQty: quantity, // API expects PIQty, but we send POQty value when PO mode
        Rate: detail.Rate || 0,
        Amount: detail.Amount || 0,
      };
      return detailData;
    });

    const dataToSend = {
      PINo: data.PINO || '',
      PIDate: data.PIDate ? formatDate(data.PIDate) : formatDate(new Date()),
      IsIndent: isIND,
      SupplierID: data.Supplier?.VendorID || null,
      PurchaserID: data.Purchase?.WIC_ID || null,
      PurposeID: data.Purpose?.PurposeID || null,
      PIExpiryDate: data.PIExpiryDate ? formatDate(data.PIExpiryDate) : null,
      POID: data.SuppliersPo?.POID || null,
      BuyerID: data.Buyer?.WIC_ID || null,
      CurrencyID: data.Currency?.Currency_ID || null,
      CurrencyRate: data.CurrencyRate || 0,
      ItemsValue: data.ItemsValue || 0,
      ServiceCharge: data.ServiceCharge || 0,
      AdditionalCharge: data.AdditionalCharge || 0,
      DeductionAmount: data.DeductionAmount || 0,
      PIValue: data.PIValue || 0,
      TradeTermID: data.TradeTerm?.TradeTermID || null,
      PayTermID: data.PayTerm?.Payment_term_ID || null,
      ShipModeID: data.ShipmentMode?.ShipmentModeID || null,
      ShipDate: data.ShipmentDate ? formatDate(data.ShipmentDate) : null,
      ETA: data.ETA ? formatDate(data.ETA) : null,
      TermsConditions: data.TermsConditions || '',
      CreatedBy: userData?.userDetails?.userId || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
      Branch_ID: userData?.userDetails?.branchID || 6,
      Details: details,
    };

    try {
      const response = await SavePIRegister(dataToSend);
      if (response.data.Success || response.status === 200) {
        enqueueSnackbar('PI Register saved successfully!', { variant: 'success' });
        reset();
        setPIRegisterDetails([]);
        router.push(paths.dashboard.Commercial.import.ImportPIRegister.root);
      } else {
        enqueueSnackbar(response.data?.Message || 'Failed to save PI Register', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error saving PI Register:', error);
      if (error.response?.status === 400) {
        enqueueSnackbar(error.response.data?.Message || 'Validation error', { variant: 'error' });
      } else {
        enqueueSnackbar(error.response?.data?.Message || 'Error saving PI Register', { variant: 'error' });
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

  const fetchOpportunityData = useCallback(async () => {
    try {
      const response = await Get(`GetOpportunityById/${values?.Opportunity?.OpportunityID}`);
      setOpportunityData(response.data.OppProduct);
      setValue('KAM', allKAMs.find((kam) => kam.UserID === response.data.KAM) || null);
      const newDetails = response.data.OppProduct.map((item) => ({
        ...item,
        Description: item.Requirement,
        Remarks: item.Description,
        PriceListID: {
          PriceListID: item.PriceListID,
          PriceListName: item.PriceListName,
        },
        Product: {
          Product_ID: item.Product_ID,
          ProductName: item.ProductName,
        },
        Color: allColors.find((color) => color.ColorID === item.ColorID) || null,
        Yarn_Count_ID: {
          Yarn_Count_ID: item.Yarn_Count_ID,
          Yarn_Count_Name: item.Yarn_Count_Name,
        },
        Yarn_Type_ID: allTypes.find((type) => type.Yarn_Type_ID === item.Yarn_Type_ID) || null,
        Composition_ID: {
          Composition_ID: item.Composition_ID,
          Composition_Name: item.Composition_Name,
        },
        UOM: {
          UOMID: item?.UOMID || 1,
          UOMName: item?.UOMName || 'KG',
        },
      }));
      setPIRegisterDetails(newDetails);
    } catch (error) {
      console.log(error);
      setOpportunityData([]);
      setPIRegisterDetails([]);
    }
  }, [values?.Opportunity?.OpportunityID, allKAMs, allTypes, allColors, setValue]);

  useEffect(() => {
    fetchOpportunityData();
  }, [values?.Opportunity?.OpportunityID, fetchOpportunityData]);

  // Auto-calculate Amount
  useEffect(() => {
    const poQty = parseFloat(values.POQty) || 0;
    const piQty = parseFloat(values.PIQty) || 0;
    const rate = parseFloat(values.Rate) || 0;

    let amount = 0;

    if (isPO) {
      // When PO is checked: Amount = PO Qty * Rate
      amount = poQty * rate;
    } else if (isIND) {
      // When IND is checked: Amount = PI Qty * Rate
      amount = piQty * rate;
    }

    setValue('Amount', amount);
  }, [values.POQty, values.PIQty, values.Rate, isPO, isIND, setValue]);

  // Cascading: Fetch Supplier POs when Supplier is selected
  useEffect(() => {
    if (values?.Supplier?.VendorID) {
      GetSupplierPOs(values.Supplier.VendorID);
      setValue('SuppliersPo', null); // Reset Supplier Po when Supplier changes
    } else {
      setSupplierPOs([]);
    }
  }, [values?.Supplier, GetSupplierPOs, setValue]);

  // Cascading: Fetch Sub Categories when Item Category is selected
  useEffect(() => {
    if (values?.ItemCategory?.Inv_Cat_ID) {
      GetSubCategories(values.ItemCategory.Inv_Cat_ID);
      setValue('SubCategory', null); // Reset Sub Category when Item Category changes
      setValue('ItemName', null); // Reset Item Name when Item Category changes
      setValue('ItemDescription', ''); // Reset Item Description when Item Category changes
    } else {
      setSubCategories([]);
    }
  }, [values?.ItemCategory, GetSubCategories, setValue]);

  // Cascading: Fetch Item Names/Descriptions when Sub Category is selected
  useEffect(() => {
    if (values?.ItemCategory?.Inv_Cat_ID && values?.SubCategory?.SubCat_ID) {
      GetItemNames(values.ItemCategory.Inv_Cat_ID, values.SubCategory.SubCat_ID);
      setValue('ItemName', null); // Reset Item Name when Sub Category changes
      setValue('ItemDescription', ''); // Reset Item Description when Sub Category changes
    } else {
      setItemNames([]);
      setItemDescriptions([]);
    }
  }, [values?.ItemCategory?.Inv_Cat_ID, values?.SubCategory, GetItemNames, setValue]);

  // Auto-populate Item Description when Item Name is selected
  useEffect(() => {
    if (values?.ItemName) {
      const selectedItem = itemNames.find(item => 
        item.ItemSpec_ID === values.ItemName.ItemSpec_ID || 
        item.ItemID === values.ItemName.ItemID ||
        item.ItemID === values.ItemName.ItemSpec_ID
      );
      if (selectedItem && selectedItem.ItemDescription) {
        setValue('ItemDescription', selectedItem.ItemDescription);
      }
    }
  }, [values?.ItemName, itemNames, setValue]);

  // Track previous PO state to detect when switching modes
  const prevIsPO = useRef(isPO);
  const prevSuppliersPoID = useRef(values?.SuppliersPo?.POID);

  // Fetch PO Details and populate Quotation Products when PO is checked and SuppliersPo is selected
  useEffect(() => {
    // Only fetch when PO is checked and SuppliersPo is selected
    if (!isPO || !values?.SuppliersPo?.POID) {
      // Clear details only when switching from PO to IND
      if (prevIsPO.current && !isPO) {
        setPIRegisterDetails([]);
      }
      prevIsPO.current = isPO;
      return;
    }

    // Only fetch if SuppliersPo actually changed, not on every render
    if (prevSuppliersPoID.current === values.SuppliersPo.POID) {
      prevIsPO.current = isPO;
      return;
    }

    const fetchPODetails = async () => {
      try {
        const poDetails = await GetPODetails(values.SuppliersPo.POID);
        if (poDetails && poDetails.length > 0) {
          // Map PO details to PI Register details format
          const mappedDetails = poDetails.map((item) => {
            // Find matching Item Category, Sub Category, UOM from existing lists
            const itemCategory = itemCategories.find(cat => cat.Inv_Cat_ID === item.Inv_Cat_ID);
            const subCategory = subCategories.find(sub => sub.SubCat_ID === item.SubCat_ID);
            const uom = uomList.find(u => u.UOMID === item.UOMID);

            // Create item name directly from API response data (don't depend on itemNames list)
            const itemName = item.ItemID ? {
              ItemID: item.ItemID,
              ItemSpec_ID: item.ItemID, // Use ItemID as ItemSpec_ID for compatibility
              ItemSpec_Name: item.ItemCode || item.ItemDescription || 'N/A',
              ItemName: item.ItemCode || item.ItemDescription || 'N/A',
              ItemCode: item.ItemCode,
              ItemDescription: item.ItemDescription,
            } : null;

            // Create placeholder objects if not found (to preserve data)
            const poQty = item.POQty || item.Quantity || 0;
            const rate = item.POUnitPrice || item.Rate || item.UnitPrice || 0;
            const amount = item.POTotalAmount || (poQty * rate);

            return {
              ItemCategory: itemCategory || (item.Inv_Cat_ID ? { Inv_Cat_ID: item.Inv_Cat_ID, Inv_Cat_Name: item.Inv_Cat_Name || 'N/A' } : null),
              SubCategory: subCategory || (item.SubCat_ID ? { SubCat_ID: item.SubCat_ID, SubCat_Name: item.SubCat_Name || 'N/A' } : null),
              ItemName: itemName,
              ItemDescription: item.ItemDescription || item.Description || '',
              UOM: uom || (item.UOMID ? { UOMID: item.UOMID, UOMName: item.UOMName || 'N/A' } : null),
              POQty: poQty,
              PIQty: 0, // Will be filled by user
              PODtlID: item.PODTLID || item.PODtlID || null, // Store PO Detail ID if from PO
              Rate: rate,
              Amount: amount,
            };
          });
          setPIRegisterDetails(mappedDetails);
        }
      } catch (error) {
        console.error('Error fetching PO details:', error);
      }
    };

    fetchPODetails();
    prevSuppliersPoID.current = values.SuppliersPo.POID;
    prevIsPO.current = isPO;
  }, [isPO, values?.SuppliersPo?.POID, GetPODetails, itemCategories, subCategories, uomList]);

  const [oppDialogOpen, setOppDialogOpen] = useState(false);
  const handleOppDialogOpen = () => {
    setOppDialogOpen(true);
  };
  const handleOppDialogClose = () => {
    setOppDialogOpen(false);
  };

  // Get available products (not already added to details)
  const availableProducts = useMemo(() => {
    const addedProductIds = piRegisterDetails.map((detail) => detail.Product?.Product_ID);
    return allProducts.filter((product) => !addedProductIds.includes(product.Product_ID));
  }, [piRegisterDetails, allProducts]);

  // useEffect(() => {
  //   setQuotationDetails([]);
  // }, [values.PriceListID?.PriceListID]);

  const handleAddDetail = () => {
    // Validation for new fields
    if (!values.ItemCategory) {
      enqueueSnackbar('Item Category is required', { variant: 'error' });
      return;
    }
    if (!values.SubCategory) {
      enqueueSnackbar('Sub Category is required', { variant: 'error' });
      return;
    }
    if (!values.ItemName) {
      enqueueSnackbar('Item Name is required', { variant: 'error' });
      return;
    }
    if (!values.UOM) {
      enqueueSnackbar('UOM is required', { variant: 'error' });
      return;
    }
    if (isPO && !values.POQty) {
      enqueueSnackbar('PO Qty is required', { variant: 'error' });
      return;
    }
    if (isIND && !values.PIQty) {
      enqueueSnackbar('PI Qty is required', { variant: 'error' });
      return;
    }
    if (!values.Rate) {
      enqueueSnackbar('Rate is required', { variant: 'error' });
      return;
    }

    // Check if item already exists (based on Item Name)
    const existingItem = piRegisterDetails.find(
      (detail) => {
        const detailId = detail.ItemName?.ItemSpec_ID || detail.ItemName?.ItemID;
        const valueId = values.ItemName?.ItemSpec_ID || values.ItemName?.ItemID;
        return detailId && valueId && detailId === valueId;
      }
    );
    
    if (existingItem && editingIndex === null) {
      enqueueSnackbar('Item already added', { variant: 'error' });
      return;
    }

    // Calculate Amount based on checkbox state
    const poQty = parseFloat(values.POQty) || 0;
    const piQty = parseFloat(values.PIQty) || 0;
    const rate = parseFloat(values.Rate) || 0;

    let amount = 0;

    if (isPO) {
      // When PO is checked: Amount = PO Qty * Rate
      amount = poQty * rate;
    } else if (isIND) {
      // When IND is checked: Amount = PI Qty * Rate
      amount = piQty * rate;
    }

    if (editingIndex !== null) {
      // Update existing detail
      const updatedDetails = [...piRegisterDetails];
      updatedDetails[editingIndex] = {
        ItemCategory: values.ItemCategory,
        SubCategory: values.SubCategory,
        ItemName: values.ItemName,
        ItemDescription: values.ItemDescription || '',
        UOM: values.UOM,
        POQty: values.POQty || 0,
        PIQty: values.PIQty || 0,
        Rate: values.Rate,
        Amount: amount,
      };
      setPIRegisterDetails(updatedDetails);
    } else {
      // Add new detail
      setPIRegisterDetails((prev) => [
        ...prev,
        {
          ItemCategory: values.ItemCategory,
          SubCategory: values.SubCategory,
          ItemName: values.ItemName,
          ItemDescription: values.ItemDescription || '',
          UOM: values.UOM,
          POQty: values.POQty || 0,
          PIQty: values.PIQty || 0,
          Rate: values.Rate,
          Amount: amount,
        },
      ]);
    }

    // Always reset the form fields and editing state
    resetDetailForm();
  };

  const resetDetailForm = () => {
    setValue('ItemCategory', null);
    setValue('SubCategory', null);
    setValue('ItemName', null);
    setValue('ItemDescription', '');
    setValue('UOM', null);
    setValue('POQty', 0);
    setValue('PIQty', 0);
    setValue('Rate', 0);
    setValue('Amount', null);
    setEditingIndex(null);
  };
  const handleEditDetail = (index) => {
    const detail = piRegisterDetails[index];
    setValue('ItemCategory', detail.ItemCategory);
    setValue('SubCategory', detail.SubCategory);
    setValue('ItemName', detail.ItemName);
    setValue('ItemDescription', detail.ItemDescription || '');
    setValue('UOM', detail.UOM);
    setValue('POQty', detail.POQty);
    setValue('PIQty', detail.PIQty);
    setValue('Rate', detail.Rate);
    setValue('Amount', detail.Amount);
    setEditingIndex(index);
  };

  // Table Heads
  const DetailsTableHead = [
    { id: 'ItemCategory', label: 'Item Category', minWidth: 120 },
    { id: 'SubCategory', label: 'Sub Category', minWidth: 120 },
    { id: 'ItemCode', label: 'Item Name', minWidth: 120 },
    { id: 'ItemDescription', label: 'Item Description', minWidth: 200 },
    { id: 'UOM', label: 'UOM', align: 'center', minWidth: 80 },
    ...(isPO
      ? [{ id: 'POQty', label: 'PO Qty', align: 'center', minWidth: 80 }]
      : [{ id: 'PIQty', label: 'PI Qty', align: 'center', minWidth: 80 }]),
    { id: 'POUnitPrice', label: 'Rate', align: 'center', minWidth: 100 },
    { id: 'Amount', label: 'Amount', align: 'center', minWidth: 120 },
    { id: 'Actions', label: 'Actions', align: 'right', width: 88 },
  ];

  // Table
  const table = useTable();

  const notFound = !piRegisterDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = piRegisterDetails.filter((row) => row !== rowToDelete);
    setPIRegisterDetails(updatedDetails);

    // If we're deleting the row being edited, reset the form
    if (editingIndex !== null && piRegisterDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);
      setValue('Product', null);
      setValue('Quantity', null);
      setValue('Unit_Price', null);
    }
  };

  // -----------------------------------------------------------

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    // FetchDepartment();
    setDialogOpen(false);
  };

  const price = selectedProduct?.Product_Price ?? 0;
  const priceFrom = selectedProduct?.Price_Range_Frm ?? 0;
  const priceTo = selectedProduct?.Price_Range_To ?? 0;
  const unit = values?.UOM?.UOM_ID === 2 ? 'LBS' : 'KG';

  useEffect(() => {
    if (selectedProduct?.Currency_ID === 2) {
      setCurrencySymbol('৳');
    } else {
      setCurrencySymbol('$');
    }
  }, [selectedProduct]);

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
              <h3>PI Register:</h3>
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
                {/* 1. PINO */}
                <RHFTextField name="PINO" label="PI No." fullWidth />

                {/* 2. PI Date with checkboxes */}
                <Box>
                  <Controller
                    name="PIDate"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <DesktopDatePicker
                        {...field}
                        label="PI Date"
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
                          checked={isIND}
                          onChange={(e) => {
                            setIsIND(e.target.checked);
                            if (e.target.checked) {
                              setIsPO(false);
                              setValue('Supplier', null);
                              setValue('SuppliersPo', null);
                            }
                          }}
                        />
                      }
                      label="IND"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isPO}
                          onChange={(e) => {
                            setIsPO(e.target.checked);
                            if (e.target.checked) {
                              setIsIND(false);
                            }
                          }}
                        />
                      }
                      label="PO"
                    />
                  </Box>
                </Box>

                {/* 3. Supplier */}
                <RHFAutocomplete
                  name="Supplier"
                  label="Supplier"
                  placeholder="Choose an option"
                  fullWidth
                  options={suppliers}
                  getOptionLabel={(option) => option?.VendorName || ''}
                  isOptionEqualToValue={(option, value) => option?.VendorID === value?.VendorID}
                  loading={isLoading}
                  value={values?.Supplier || null}
                
                />
                {/* 8. Suppliers Po */}
                <RHFAutocomplete
                  name="SuppliersPo"
                  label="PO Number"
                  placeholder="Choose an option"
                  fullWidth
                  options={supplierPOs}
                  getOptionLabel={(option) => option?.POCode || ''}
                  isOptionEqualToValue={(option, value) => option?.POID === value?.POID}
                  loading={isLoading}
                  value={values?.SuppliersPo || null}
                  disabled={isIND}
                />
                {/* 4. Purchase */}
                <RHFAutocomplete
                  name="Purchase"
                  label="Purchaser"
                  placeholder="Choose an option"
                  fullWidth
                  options={[{id:1, name:'Simco Spinning and Textile Ltd.'  }]}
                  getOptionLabel={(option) => option?.name || ''}
                  isOptionEqualToValue={(option, value) => option?.id === value?.id}
                  loading={isLoading}
                  value={values?.Purchase || null}
                />

                {/* 5. Style No
                <RHFTextField name="StyleNo" label="Style No" fullWidth /> */}

                {/* 6. Purpose */}
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

                {/* 7. PI Expiry Date */}
                <Controller
                  name="PIExpiryDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="PI Expiry Date"
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



                {/* 9. Buyer */}
                <RHFAutocomplete
                  name="Buyer"
                  label="Buyer"
                  placeholder="Choose an option"
                  fullWidth
                  options={endCustomers}
                  getOptionLabel={(option) => option?.WIC_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.WIC_ID === value?.WIC_ID}
                  loading={isLoading}
                  value={values?.Buyer || null}
                />

                {/* 10. Currency */}
                <RHFAutocomplete
                  name="Currency"
                  label="Currency"
                  placeholder="Choose an option"
                  fullWidth
                  options={currenciesList}
                  getOptionLabel={(option) => option?.Currency_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.Currency_ID === value?.Currency_ID}
                  loading={isLoading}
                  value={values?.Currency || null}
                />

                {/* 11. Currency Rate */}
                <RHFTextField
                  name="CurrencyRate"
                  label="Currency Rate"
                  type="number"
                  fullWidth
                />

                {/* 12. Items Value */}
                <RHFTextField
                  name="ItemsValue"
                  label="Items Value"
                  type="number"
                  fullWidth
                />

                {/* 13. Service Charge */}
                <RHFTextField
                  name="ServiceCharge"
                  label="Service Charge"
                  type="number"
                  fullWidth
                />

                {/* 14. Additional Charge */}
                <RHFTextField
                  name="AdditionalCharge"
                  label="Additional Charge"
                  type="number"
                  fullWidth
                />

                {/* 15. Deduction Amount */}
                <RHFTextField
                  name="DeductionAmount"
                  label="Deduction Amount"
                  type="number"
                  fullWidth
                />

                {/* 16. PI Value */}
                <RHFTextField
                  name="PIValue"
                  label="PI Value"
                  type="number"
                  fullWidth
                />

                {/* 17. Trade Term */}
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

                {/* 18. Pay Term */}
                <RHFAutocomplete
                  name="PayTerm"
                  label="Pay Term"
                  placeholder="Choose an option"
                  fullWidth
                  options={paymentTermsList}
                  getOptionLabel={(option) => option?.Payment_Term || ''}
                  isOptionEqualToValue={(option, value) => option?.Payment_term_ID === value?.Payment_term_ID}
                  loading={isLoading}
                  value={values?.PayTerm || null}
                />

                {/* 19. Shipment Mode */}
                <RHFAutocomplete
                  name="ShipmentMode"
                  label="Shipment Mode"
                  placeholder="Choose an option"
                  fullWidth
                  options={shipmentModes}
                  getOptionLabel={(option) => option?.ModeName || ''}
                  isOptionEqualToValue={(option, value) => option?.ShipmentModeID === value?.ShipmentModeID}
                  loading={isLoading}
                  value={values?.ShipmentMode || null}
                />

                {/* 20. Shipment Date */}
                <Controller
                  name="ShipmentDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Shipment Date"
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

                {/* 21. ETA */}
                <Controller
                  name="ETA"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="ETA"
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

              {/* {tableData.length > 0 && (
                <TableContainer sx={{ mt: 2 }}>
                  <Scrollbar>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Opportunity Products
                    </Typography>
                    <Table sx={{ minWidth: 720 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align="center">Quantity</TableCell>
                          <TableCell align="center">Unit Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tableData?.map((row, index) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.Requirement}</TableCell>
                            <TableCell>{row.Description}</TableCell>
                            <TableCell align="center">{`${fNumber(row.Quantity)} KG`}</TableCell>
                            <TableCell align="center">{`${fCurrency(row.Unit_Price)}`}</TableCell>
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
                {/* <h3>Other Information: </h3> */}
                {opportunityData.length === 0 && (
                  <>
                    <Box
                      rowGap={3}
                      columnGap={2}
                      display="grid"
                      gridTemplateColumns={{
                        xs: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                      }}
                    >
                      {/* 1. Item Category */}
                      <RHFAutocomplete
                        name="ItemCategory"
                        label="Item Category"
                        placeholder="Choose an option"
                        fullWidth
                        options={itemCategories}
                        value={values?.ItemCategory || null}
                        getOptionLabel={(option) => option?.Inv_Cat_Name || ''}
                        isOptionEqualToValue={(option, value) => {
                          if (!option || !value) return false;
                          return option.Inv_Cat_ID === value.Inv_Cat_ID;
                        }}
                        disabled={!isIND}
                      />

                      {/* 2. Sub Category */}
                      <RHFAutocomplete
                        name="SubCategory"
                        label="Sub Category"
                        placeholder="Choose an option"
                        fullWidth
                        options={subCategories}
                        value={values?.SubCategory || null}
                        getOptionLabel={(option) => option?.SubCat_Name || ''}
                        isOptionEqualToValue={(option, value) => {
                          if (!option || !value) return false;
                          return option.SubCat_ID === value.SubCat_ID;
                        }}
                        disabled={!isIND}
                      />

                      {/* 3. Item Name */}
                      <RHFAutocomplete
                        name="ItemName"
                        label="Item Name"
                        placeholder="Choose an option"
                        fullWidth
                        options={itemNames}
                        value={values?.ItemName || null}
                        getOptionLabel={(option) => option?.ItemCode || option?.ItemSpec_Name || option?.ItemName || option?.ItemDescription || ''}
                        isOptionEqualToValue={(option, value) => {
                          if (!option || !value) return false;
                          return option.ItemSpec_ID === value.ItemSpec_ID || option.ItemID === value.ItemID;
                        }}
                        disabled={!isIND}
                      />

                      {/* 4. Item Description */}
                      <RHFTextField
                        sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                        name="ItemDescription"
                        label="Item Description"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        disabled={!isIND}
                      />

                      {/* 5. UOM */}
                      <RHFAutocomplete
                        name="UOM"
                        label="UOM"
                        placeholder="Choose an option"
                        fullWidth
                        options={uomList}
                        value={values?.UOM || null}
                        getOptionLabel={(option) => option?.UOMName || ''}
                        isOptionEqualToValue={(option, value) => {
                          if (!option || !value) return false;
                          return option.UOMID === value.UOMID;
                        }}
                        disabled={!isIND}
                      />

                      {/* 6. PO Qty - Show only when PO is checked */}
                      {isPO && (
                        <RHFTextField
                          name="POQty"
                          label="PO Qty"
                          type="number"
                          variant="outlined"
                          fullWidth
                        />
                      )}

                      {/* 7. PI Qty - Show only when IND is checked */}
                      {isIND && (
                        <RHFTextField
                          name="PIQty"
                          label="PI Qty"
                          type="number"
                          variant="outlined"
                          fullWidth
                        />
                      )}

                      {/* 8. Rate */}
                      <RHFTextField
                        name="Rate"
                        label="Rate"
                        type="number"
                        variant="outlined"
                        fullWidth
                        disabled={!isIND}
                      />

                      {/* 9. Amount */}
                      <RHFTextField
                        name="Amount"
                        label="Amount"
                        type="number"
                        variant="outlined"
                        fullWidth
                        disabled={isIND}
                      />
                    </Box>
                    <Stack alignItems="flex-end" direction="row-reverse" sx={{ mt: 3, gap: 2 }}>
                      <Button color="primary" onClick={handleAddDetail} variant="contained" disabled={!isIND}>
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
                )}

                {piRegisterDetails.length > 0 && (
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
                        {piRegisterDetails.map((row, index) => (
                          <DetailTableRow
                            key={index}
                            row={row}
                            isPO={isPO}
                            onDeleteRow={() => DeleteDetailTableRow(row)}
                            onEditRow={() => handleEditDetail(index)}
                          />
                        ))}

                        <TableEmptyRows
                          height={denseHeight}
                          emptyRows={emptyRows(
                            table.page,
                            table.rowsPerPage,
                            piRegisterDetails.length
                          )}
                        />

                        <TableNoData notFound={notFound} />
                      </TableBody>
                    </Table>
                    <Typography variant="body2" color="green" sx={{ p: 2 }}>
                      {/* eslint-disable-next-line */}
                      {'Total Amount: $' + TotalAmount.toFixed(2)}
                    </Typography>
                  </Scrollbar>
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
      <OpportunityDialog
        uploadClose={handleOppDialogClose}
        uploadOpen={oppDialogOpen}
        tableData={opportunityData}
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
