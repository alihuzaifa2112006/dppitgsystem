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
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import { fCurrency, fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function PrEditForm({ currentData, isReapproval }) {
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

  const fetchedPriceOfProducts =
    currentData?.Details.map((x) => ({
      PRDtlID: x.PRDtlID,
      UnitPrice: x.UnitPrice,
    })) || [];

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
  const [opportunityData, setOpportunityData] = useState([]);
  const [quotationData, setQuotationData] = useState([]);
  const [allEndBuyers, setAllEndBuyers] = useState([]);
  const [allFabricTypes, setAllFabricTypes] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [dialogValue, setDialogValue] = useState('');
  const [open, setOpen] = useState(false);
  const [allSustainability, setAllSustainability] = useState([]);
  const [allSamples, setAllSamples] = useState([]);
  const [allInitiative, setAllInitiative] = useState([]);

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

  const [prDetails, setPrDetails] = useState(
    currentData?.Details.map((x) => ({
      ...x,
      DeliveryDueDate: x?.DeliveryDueDate ? new Date(x.DeliveryDueDate) : null,
    })) || []
  );
  const [editingIndex, setEditingIndex] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [allUOM, setAllUOM] = useState([]);

  const [allQuotations, setAllQuotations] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [approvers, setApprovers] = useState([]);
  const [allKAMs, setAllKAMs] = useState([]);

  const NewPrSchema = Yup.object().shape({
    // Customer: Yup.object().required('Customer is required'),
    // Opportunity: Yup.object().required('Opportunity is required'),
    // Quotation: Yup.object().required('Quotation is required'),
    // End_Customer: Yup.object().required('End Customer is required'),
    // Agent: Yup.object().required('Agent is required'),
    PRDate: Yup.date().required('PR Date is required'),
    // .test('is-future-or-today', 'PR Date must be today or later', (value) => {
    //   if (!value) return false;
    //   const today = new Date();
    //   today.setHours(0, 0, 0, 0);
    //   const inputDate = new Date(value);
    //   inputDate.setHours(0, 0, 0, 0);
    //   return inputDate >= today;
    // }),
    ValidFrom: Yup.date().required('Valid From is required'),
    // .min(Yup.ref('PRDate'), 'Valid From must be greater than or equal to PR Date'),
    ValidUntil: Yup.date().required('Valid Until is required'),
    // .min(Yup.ref('ValidFrom'), 'Valid Until must be greater than or equal to Valid From'),
    PaymentTerms: Yup.object().required('Payment Term is required'),
    KAM: Yup.object().required('KAM is required'),
    UOM: Yup.object().required('Unit of Measure is required'),

    // Clause: Yup.array().min(1, 'At least one Clause is required'),

    // Sustainability: Yup.object().required('Sustainability is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewPrSchema),
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

  // 1. First, update your defaultValues memo with proper dependencies and structure
  const defaultValues = useMemo(
    () => ({
      PrFor: currentData?.PrFor || 'I',
      Opportunity:
        allOpportunities.find((o) => o.OpportunityID === currentData?.OpportunityID) || null,
      Quotation: allQuotations.find((q) => q.QuotationID === currentData?.QuotationID) || null,
      PaymentTerms:
        allPaymentTerms.find((pt) => pt.Payment_term_ID === currentData?.Payment_TermID) || null,
      End_Customer:
        allEndBuyers.find((ec) => ec.End_Cust_ID === currentData?.End_CustomerID) || null,
      Agent: allAgents.find((a) => a.AgentID === currentData?.Agency_ID) || null,
      KAM: allKAMs.find((k) => k.UserID === currentData?.KAM) || null,
      Customer: customers.find((c) => c.WIC_ID === currentData?.WIC_ID) || null,
      PRDate: currentData?.PRDate ? new Date(currentData.PRDate) : new Date(),
      ValidFrom: currentData?.ValidFrom ? new Date(currentData.ValidFrom) : new Date(),
      ValidUntil: currentData?.ValidUntil ? new Date(currentData.ValidUntil) : new Date(),
      Clause: currentData?.Clauses || [],
      Sustainability:
        allSustainability.find((s) => s.Sustainability_ID === currentData?.Sustainability_ID) ||
        null,
      Initiative: allInitiative.find((i) => i.InitiativeID === currentData?.InitiativeID) || null,
      UOM:
        currentData?.Details.length > 0
          ? allUOM.find((u) => u.UOM_ID === currentData?.Details[0].UOMID)
          : null,
      // Add other fields as needed
    }),
    [
      currentData,
      allOpportunities,
      allQuotations,
      allPaymentTerms,
      allEndBuyers,
      allAgents,
      allKAMs,
      customers,
      allSustainability,
      allInitiative,
      allUOM,
    ]
  );

  // 2. Update your useEffect that resets the form
  useEffect(() => {
    if (!isLoading && currentData && Object.keys(defaultValues).length > 0) {
      methods.reset(defaultValues);
    }
  }, [isLoading, defaultValues, methods, currentData]);

  // const generateProductName = () => {
  //   const productCode = `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${
  //     values?.Yarn_Count_ID?.Yarn_Count_Name || ''
  //   } -  ${values?.Composition_ID?.Composition_Name || ''}  (${values?.Color?.ColorName || ''} - ${
  //     values?.Color?.Color_Code || ''
  //   })`;
  //   setValue('Description', productCode);
  //   return productCode;
  // };

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
      const response = await Get(`getAllClausesbyDocTypeID?Document_TypeID=2`);
      setAllClauses(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

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

  const APRGetTypeList = useCallback(async () => {
    try {
      const response = await Get(
        `getActiveyarntype?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllTypes(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APRGetCompositionList = useCallback(async () => {
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

  const fetchExchangeRate = useCallback(async () => {
    const rate = await convertBDTtoUSD(1);
    if (rate) {
      setBDTtoUSD(rate); // This is the multiplier, not rate for 1 BDT
    }
  }, []);

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

  const GetCurrencies = useCallback(async () => {
    const res = await Get('getActiveCurrencies');
    setCurrencies(res.data || []);
  }, []);

  // const fecthApprovers = useCallback(async () => {
  //   const res = await Get(
  //     `GetAlLRegistereKAM?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
  //   );
  //   if (res.status === 200) {
  //     const data = res.data.Data.map((item) => ({
  //       ...item,
  //       fullName: item.Username,
  //     }));
  //     setApprovers(data);
  //   }
  // }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

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

  const getSustainability = useCallback(async () => {
    try {
      const response = await Get(
        `getSustainability?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllSustainability(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const getsamplereqList = useCallback(async () => {
    try {
      const response = await Get(
        `getsamplereqList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&RoleID=${userData?.userDetails?.roles[0]}&UserID=${userData?.userDetails?.userId}`
      );

      setAllSamples(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    userData?.userDetails?.roles,
    userData?.userDetails?.userId,
  ]);

  const GetActiveIntiative = useCallback(async () => {
    try {
      const response = await Get(
        `GetActiveIntiative?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllInitiative(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        GetCustomersData(),
        getpriceList(),
        GetAllActiveinactiveOpportunities(),
        GetAllClauses(),
        GetCurrencies(),
        GetAllActiveUOM(),
        GetAllPaymentTerms(),
        GetColors(),
        GetCounts(),
        APRGetTypeList(),
        APRGetCompositionList(),
        GetQuotationActiveinActiveList(),
        getActiveendcustomer(),
        getAllActiveAgents(),
        // fecthApprovers(),
        GetFabricTypes(),
        GetKAMs(),
        getSustainability(),
        getsamplereqList(),
        GetActiveIntiative(),
      ]);
      setLoading(false);
      fetchExchangeRate();
    };
    fetchData();
  }, [
    GetCustomersData,
    getpriceList,
    GetAllActiveinactiveOpportunities,
    GetAllClauses,
    GetCurrencies,
    fetchExchangeRate,
    GetAllPaymentTerms,
    GetColors,
    GetCounts,
    APRGetTypeList,
    GetAllActiveUOM,
    APRGetCompositionList,
    GetQuotationActiveinActiveList,
    getActiveendcustomer,
    getAllActiveAgents,
    // fecthApprovers,
    GetFabricTypes,
    GetKAMs,
    getSustainability,
    getsamplereqList,
    GetActiveIntiative,
  ]);

  // useEffect(() => {
  //   const fetch = async () => {
  //     try {
  //       const response = await Get(`GetPriceListById/${values?.PriceListID?.PriceListID}`);
  //       setAllProducts(
  //         response.data.Details.map((item) => ({
  //           ...item,
  //           CurrencyID: response.data.Master?.CurrencyID,
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

  const generateProductName = useMemo(
    () =>
      `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${
        values?.Yarn_Count_ID?.Yarn_Count_Name || ''
      } - ${values?.Composition_ID?.Composition_Name || ''} (${values?.Color?.ColorName || ''} - ${
        values?.Color?.Color_Code || ''
      })`,
    [values.Color, values.Yarn_Count_ID, values.Yarn_Type_ID, values.Composition_ID]
  );

  useEffect(() => {
    setValue('Description', generateProductName);
  }, [generateProductName, setValue]);

  const OverAllTotalAmount = prDetails.reduce((total, detail) => {
    const quantity = parseFloat(detail.Quantity);
    const unitPrice = parseFloat(detail.Unit_Price);
    const currencyID = detail?.PriceListID?.CurrencyID;
    const price = currencyID === 8 ? unitPrice * BDTtoUSD : unitPrice;

    return total + quantity * price;
  }, 0);

  const KGtoLBs = (kg) => kg * 2.20462;
  const OverAllTotalQunatityInLbs = prDetails.reduce((total, detail) => {
    const quantity = parseFloat(detail.Quantity);
    // const uom = detail.UOM.UOMID;
    // const q = uom === 7 ? quantity : KGtoLBs(quantity);
    return total + quantity;
  }, 0);

  const fetchOpportunityData = useCallback(async () => {
    if (values?.Opportunity?.OpportunityID) {
      try {
        const response = await Get(`GetOpportunityById/${values?.Opportunity?.OpportunityID}`);
        setOpportunityData(response.data.OppProduct);
      } catch (error) {
        console.log(error);
        setOpportunityData([]);
      }
    }
  }, [values?.Opportunity?.OpportunityID]);

  useEffect(() => {
    fetchOpportunityData();
  }, [values?.Opportunity?.OpportunityID, fetchOpportunityData]);

  const fetchQuotationData = useCallback(async () => {
    if (values?.Quotation?.QuotationID) {
      try {
        const response = await Get(
          `GetQuotationByID?quotationId=${values?.Quotation?.QuotationID}`
        );
        setQuotationData(response.data?.QuotationDtl);
      } catch (error) {
        console.log(error);
        setQuotationData([]);
      }
    }
  }, [values?.Quotation?.QuotationID]);

  useEffect(() => {
    fetchQuotationData();
  }, [values?.Quotation?.QuotationID, fetchQuotationData]);

  useEffect(() => {
    if (!values?.Priority?.value) return;

    const today = new Date();
    const newDate = new Date(today);

    switch (values.Priority.value) {
      case 'High':
        newDate.setDate(today.getDate() + 3);
        break;
      case 'Medium':
        newDate.setDate(today.getDate() + 7);
        break;
      case 'Low':
        newDate.setDate(today.getDate() + 15);
        break;
      default:
        return;
    }

    // Only update if the date would actually change
    if (!values.EndDate || newDate.getTime() !== new Date(values.EndDate).getTime()) {
      setValue('EndDate', newDate);
    }
  }, [values?.Priority?.value, setValue, values?.EndDate]);

  useEffect(() => {
    if (currentData?.Clauses && allClauses.length > 0) {
      const unmatchedClauses = currentData.Clauses.filter(
        (clause) => !allClauses.some((c) => c.Clause_ID === clause.Clause_ID)
      );
      if (unmatchedClauses.length > 0) {
        console.warn('Unmatched clauses:', unmatchedClauses);
      }
    }
  }, [currentData, allClauses]);

  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     if (!values?.Color?.ColorID || !values?.Yarn_Count_ID?.Yarn_Count_ID) return;

  //     try {
  //       const response = await Get(
  //         `GetProductsFrmPLBycountAndColorID?Yarncount=${values.Yarn_Count_ID.Yarn_Count_ID}&ColorID=${values.Color.ColorID}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
  //       );

  //       const newProducts = response.data.Data || [];
  //       setAllProducts(newProducts);

  //       if (editingIndex !== null && prDetails[editingIndex]?.Product?.Product_ID) {
  //         const productToSelect = newProducts.find(
  //           (product) => product.Product_ID === prDetails[editingIndex].Product.Product_ID
  //         );
  //         if (productToSelect && (!selectedProduct || productToSelect.Product_ID !== selectedProduct.Product_ID)) {
  //           setSelectedProduct(productToSelect);
  //         }
  //       } else if (selectedProduct) {
  //         setSelectedProduct(null);
  //       }
  //     } catch (error) {
  //       setAllProducts([]);
  //       setSelectedProduct(null);
  //     }
  //   };

  //   fetchProducts();
  // }, [
  //   values?.Color?.ColorID,
  //   values?.Yarn_Count_ID?.Yarn_Count_ID,
  //   userData?.userDetails?.orgId,
  //   userData?.userDetails?.branchID,
  //   editingIndex,
  //   prDetails,
  // ]);

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

  const handleClose = () => {
    setDialogValue('');
    setOpen(false);
  };

  const PostInitiative = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Initiative Certificate', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (
      allInitiative.find(
        (option) => option.InitiativeName.trim().toLowerCase() === newOptionTrimmed
      )
    ) {
      enqueueSnackbar('This Initiative already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        InitiativeName: newOption,
        isActive: true,
        CreatedBy: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddInitiative', dataToSend);
      GetActiveIntiative();
      enqueueSnackbar('Initiative Added Successfully', { variant: 'success' });
      handleClose();
    } catch (error) {
      console.log('Error', error);
    }
  };
  const PostSustainability = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Sustainability Certificate', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (
      allSustainability.find(
        (option) => option.Sustainability_Name.trim().toLowerCase() === newOptionTrimmed
      )
    ) {
      enqueueSnackbar('Sustainability Certificate Already Exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        Sustainability_Name: newOption,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('addSustainability', dataToSend);
      getSustainability();
      enqueueSnackbar('Sustainability Certificate Added Successfully', { variant: 'success' });
      handleClose();
    } catch (error) {
      console.log('Error', error);
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
      GetAllPaymentTerms();
      enqueueSnackbar('Payment Term Added Successfully', { variant: 'success' });
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
      await Post(`AddPRDetails`, detail);
    } catch (error) {
      console.log('Detail', error);
    }
  };
  const onSubmit = handleSubmit(async (data) => {
    if (prDetails.length === 0) {
      enqueueSnackbar('Please add at least one pr product', { variant: 'error' });
      return;
    }

    const revisedData = {
      PRID: currentData?.PRID,
      PRNo: currentData?.PRNo,
      Payment_TermID: data?.PaymentTerms?.Payment_term_ID,
      PRDate: data?.ValidFrom ? formatDate(data.PRDate) : null,
      ValidFrom: data?.ValidFrom ? formatDate(data.ValidFrom) : null,
      ValidUntil: data?.ValidUntil ? formatDate(data.ValidUntil) : null,
      WIC_ID: data?.Customer?.WIC_ID || 0,
      Remarks: data?.Remarks,
      // Status: 'Edited',
      Currency_ID: 1,
      InitiativeID: data?.Initiative?.InitiativeID || 0,
      End_CustomerID: data?.End_Customer?.End_Cust_ID || 0,
      PRClauses:
        data?.Clause?.map((clause) => ({
          Clause_ID: clause?.Clause_ID,
        })) || [],
      Agency_ID: data?.Agent?.AgentID || 0,
      ApproverID: 0,
      KAM: data?.KAM?.UserID,
      PRStatus: 'Pending',
      CreatedBy: userData?.userDetails?.userId,
      UpdatedBy: userData?.userDetails?.userId,
      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,
      Details: prDetails.map((detail) => ({
        PRDtlID: detail?.PRDtlID || 0,
        FabricTypeID: detail.Fabric_Type?.Fabric_TypeID,
        SustainabilityID: detail.Sustainability?.Sustainability_ID,
        ItemCodePrefix: detail?.ItemCodePrefix,
        UOMID: data.UOM?.UOM_ID || data.UOM?.UOMID,
        Description: detail?.Description || 'N/A',
        Item_Code: detail?.Item_Code || 'N/A',
        PRID: currentData?.PRID || 0,
        PriceList_ID: detail.Product?.PriceListID || 0,
        UnitPrice: parseFloat(detail.Unit_Price, 2),
        Quantity: parseFloat(detail.Quantity, 2),
        ConesQty: detail?.ConesQty || null,
        DeliveryDueDate: detail?.DeliveryDueDate ? formatDate(detail?.DeliveryDueDate) : null,
        Currency_ID: detail?.Currency?.Currency_ID || 1,
        Total_Amount: detail.Quantity * detail.Unit_Price || 0,
        Remarks: detail.Remarks || 'N/A',
        CompositionID: detail.Composition_ID?.Composition_ID,
        YarnTypeID: detail.Yarn_Type_ID?.Yarn_Type_ID,
        CountID: detail.Yarn_Count_ID?.Yarn_Count_ID,
        ColorID: detail.Color?.ColorID,
        Product_ID: detail.Product?.Product_ID,
        IsActive: true,
        IsDeleted: false,
        CreatedBy: userData?.userDetails?.userId,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      })),
    };

    // check UnitPrice using  PRDtlID and fetchedPriceOfProducts
    const priceOfAnyProductHasChanged = prDetails.some((detail) => {
      const fetchedPrice = fetchedPriceOfProducts.find(
        (product) => product.PRDtlID === detail.PRDtlID
      );
      return fetchedPrice && fetchedPrice.UnitPrice !== detail.Unit_Price;
    });
    try {
      if (isReapproval === true) {
        await Post(
          `ReapprovePR?PRID=${currentData?.PRID}&UserID=${
            userData?.userDetails?.userId
          }&hasPriceChange=${priceOfAnyProductHasChanged ? 1 : 0}`
        );
      }
      await Put('updateProformaInvoice', revisedData);
      reset();
      enqueueSnackbar('Updated Successfully!');

      router.push(paths.dashboard.procurement.pr.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong!', { variant: 'error' });
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

  // Get available products (not already added to details)
  const availableProducts = useMemo(() => {
    const addedProductIds = prDetails.map((detail) => detail.Product?.Product_ID);
    return allProducts.filter((product) => !addedProductIds.includes(product.Product_ID));
  }, [prDetails, allProducts]);

  // useEffect(() => {
  //   setPrDetails([]);
  // }, [values.PriceListID?.PriceListID]);
  const generatePrefix = useMemo(
    (previousCode) => {
      const yarnTypeCode = values?.Yarn_Type_ID?.Yarn_Code;
      const countName = values?.Yarn_Count_ID?.Yarn_Count_Name?.split('/').join('');
      const compositionValues = (() => {
        const name = values?.Composition_ID?.Composition_Name || '';
        const matches = name.match(/\d+%/g) || []; // Match all percentages
        const first = matches[0]?.replace('%', '').padStart(3, '0') || '000';
        const second = matches[1]?.replace('%', '').padStart(2, '0') || '00';
        return `${first}${second}`; // e.g., '06030', '10000'
      })();

      const itemCode = `FG${yarnTypeCode}-${countName}${compositionValues}-${values?.Color?.Color_Code}`;
      return previousCode || itemCode;
    },
    [
      values?.Yarn_Type_ID,
      values?.Yarn_Count_ID,
      values?.Composition_ID?.Composition_Name,
      values?.Color?.Color_Code,
    ]
  );
  const handleAddDetail = () => {
    // First validate all required fields
    if (!values?.Fabric_Type) {
      enqueueSnackbar('Fabric Type is required', { variant: 'error' });
      return;
    }
    if (!values?.Sustainability) {
      enqueueSnackbar('Sustainability is required', { variant: 'error' });
      return;
    }
    if (!values.Color) {
      enqueueSnackbar('Color is required', { variant: 'error' });
      return;
    }
    if (!values.Yarn_Count_ID) {
      enqueueSnackbar('Yarn Count is required', { variant: 'error' });
      return;
    }
    if (!values.Yarn_Type_ID) {
      enqueueSnackbar('Yarn Type is required', { variant: 'error' });
      return;
    }
    if (!values.Composition_ID) {
      enqueueSnackbar('Composition is required', { variant: 'error' });
      return;
    }
    if (!values.UOM) {
      enqueueSnackbar('Unit of Measure is required', { variant: 'error' });
      return;
    }
    if (!values.Quantity) {
      enqueueSnackbar('Quantity is required', { variant: 'error' });
      return;
    }
    if (!values.DeliveryDueDate) {
      enqueueSnackbar('Delivery Due Date is required', { variant: 'error' });
      return;
    }
    // if (!values.ConesQty) {
    //   enqueueSnackbar('ConesQty is required', { variant: 'error' });
    //   return;
    // }
    if (!values.Unit_Price) {
      enqueueSnackbar('Unit Price is required', { variant: 'error' });
      return;
    }

    // Generate the product name once to use in comparisons
    const newProductName = generateProductName.replace(/\s+/g, ' ').trim().toLowerCase();

    // Check for duplicate only when adding new item (not editing)
    if (editingIndex === null) {
      const productExists = prDetails.some(
        (detail) => detail.Description.replace(/\s+/g, ' ').trim().toLowerCase() === newProductName
      );

      if (productExists) {
        enqueueSnackbar('Product already exists', { variant: 'error' });
        return;
      }
    }

    if (editingIndex !== null) {
      // Update existing detail
      const updatedDetails = [...prDetails];

      // const dataHasChanged =
      //   updatedDetails[editingIndex].Quantity !== values.Quantity ||
      //   updatedDetails[editingIndex].Unit_Price !== values.Unit_Price ||
      //   updatedDetails[editingIndex].Remarks.trim().toLowerCase() !==
      //     values.Remarks.trim().toLowerCase() ||
      //   updatedDetails[editingIndex].Description.trim().toLowerCase() !==
      //     values.Description.trim().toLowerCase() ||
      //   updatedDetails[editingIndex].Yarn_Type_ID !== values.Yarn_Type_ID?.Yarn_Type_ID ||
      //   updatedDetails[editingIndex].ColorID !== values.Color?.ColorID ||
      //   updatedDetails[editingIndex].CountID !== values.Yarn_Count_ID?.Yarn_Count_ID ||
      //   updatedDetails[editingIndex].CompositionID !== values.Composition_ID?.Composition_ID ||
      //   updatedDetails[editingIndex].UOMID !== values.UOM?.UOM_ID;

      updatedDetails[editingIndex] = {
        PRDtlID: prDetails[editingIndex].PRDtlID, // Keep the existing PRDtlID for updates
        Item_Code: prDetails[editingIndex].Item_Code,
        ItemCodePrefix: generatePrefix,
        // eslint-disable-next-line
        // hasUpdated: dataHasChanged ? true : false,
        Fabric_Type:
          allFabricTypes.find((fab) => fab.Fabric_TypeID === values.Fabric_Type?.Fabric_TypeID) ||
          null,
        Sustainability:
          allSustainability.find(
            (sust) => sust.Sustainability_ID === values.Sustainability?.Sustainability_ID
          ) || null,
        Quantity: values?.Quantity,
        ConesQty: values?.ConesQty,
        DeliveryDueDate: values?.DeliveryDueDate,
        Yarn_Type_ID:
          allTypes?.find((typs) => typs.Yarn_Type_ID === values?.Yarn_Type_ID?.Yarn_Type_ID) ||
          null,
        Composition_ID:
          allCompositions.find(
            (comp) => comp.Composition_ID === values.Composition_ID?.Composition_ID
          ) || null,
        Color: allColors.find((color) => color.ColorID === values.Color?.ColorID) || null,
        Yarn_Count_ID:
          allCounts.find((count) => count.Yarn_Count_ID === values?.Yarn_Count_ID?.Yarn_Count_ID) ||
          null,
        Unit_Price: values.Unit_Price,
        UOM: allUOM?.find((oum) => oum.UOM_ID === values?.UOM?.UOM_ID) || null,
        Remarks: values.Remarks || 'N/A',
        Description: values.Description || 'N/A',
        PricelistID: values?.PriceListID || 0,
      };
      setPrDetails(updatedDetails);
    } else {
      // Add new detail
      setPrDetails((prev) => [
        ...prev,
        {
          ItemCodePrefix: generatePrefix,
          Fabric_Type: values.Fabric_Type,
          Sustainability: values.Sustainability,
          PRDtlID: 0,
          Item_Code: 'N/A',
          Color: values.Color,
          Yarn_Count_ID: values.Yarn_Count_ID,
          Yarn_Type_ID: values.Yarn_Type_ID,
          Composition_ID: values.Composition_ID,
          PriceListID: selectedProduct?.PriceListID,
          Description: generateProductName || 'N/A',
          Product: selectedProduct,
          UOM: values.UOM,
          Remarks: values.Remarks || 'N/A',
          Quantity: values.Quantity,
          ConesQty: values?.ConesQty,
          DeliveryDueDate: values?.DeliveryDueDate,
          Unit_Price: values.Unit_Price,
        },
      ]);
    }

    // Always reset the form fields and editing state
    resetDetailForm();
  };
  const resetDetailForm = () => {
    // setValue('Requirement', '');
    setValue('Color', null);
    setValue('Fabric_Type', null);
    setValue('Sustainability', null);
    setValue('Yarn_Count_ID', null);
    setValue('PriceListID', null);
    setValue('Yarn_Type_ID', null);
    setValue('Composition_ID', null);
    setValue('Description', '');
    setValue('Product', null);
    setValue('Remarks', '');
    // setValue('UOM', null);
    setSelectedProduct(null);
    setValue('Quantity', null);
    setValue('ConesQty', null);
    setValue('DeliveryDueDate', null);
    setValue('Unit_Price', null);
    setEditingIndex(null);
  };

  const handleEditDetail = (index) => {
    const detail = prDetails[index];
    console.log('Detail:', detail);
    setValue(
      'Fabric_Type',
      allFabricTypes.find((product) => product.Fabric_TypeID === detail.Fabric_Type?.Fabric_TypeID)
    );
    setValue(
      'Sustainability',
      allSustainability.find(
        (sustain) => sustain.Sustainability_ID === detail.Sustainability?.Sustainability_ID
      )
    );
    setValue('Quantity', detail?.Quantity);
    setValue('ConesQty', detail?.ConesQty);
    setValue('DeliveryDueDate', detail?.DeliveryDueDate);
    setValue('Unit_Price', detail.Unit_Price);
    setValue('Description', detail.Description);
    setValue('Remarks', detail.Remarks);
    setSelectedProduct(detail.Product);
    // setValue(
    //   'UOM',
    //   allUOM?.find((uom) => uom.UOM_ID === detail.UOMID) ||
    //     allUOM?.find((uom) => uom.UOM_ID === detail?.UOM?.UOM_ID) ||
    //     null
    // );
    setValue('PriceListID', detail.PriceListID);
    setValue(
      'Yarn_Type_ID',
      allTypes.find((product) => product.Yarn_Type_ID === detail.Yarn_Type_ID?.Yarn_Type_ID)
    );
    setValue(
      'Yarn_Count_ID',
      allCounts.find((product) => product.Yarn_Count_ID === detail.Yarn_Count_ID?.Yarn_Count_ID)
    );
    setValue(
      'Color',
      allColors.find((product) => product.ColorID === detail.Color?.ColorID)
    );
    setValue(
      'Composition_ID',
      allCompositions.find(
        (product) => product.Composition_ID === detail.Composition_ID?.Composition_ID
      )
    );

    setEditingIndex(index);
  };

  // Table Heads
  const DetailsTableHead = [
    { id: 'Item_Code', label: 'Item Code', minWidth: 120 },
    // { id: 'Product', label: 'Product', minWidth: 120 },
    { id: 'Description', label: 'Product Description', minWidth: 240 },
    { id: 'Remarks', label: 'Remarks', minWidth: 200 },
    { id: 'DeliveryDueDate', label: 'Delivery Date ', align: 'center', minWidth: 140 },

    { id: 'Quantity', label: 'Quantity', align: 'center' },
    { id: 'ConesQty', label: 'No. Of Cones', align: 'center', minWidth: 120 },
    { id: 'Unit_Price', label: 'Unit Price', align: 'center', minWidth: 120 },
    { id: 'totalValue', label: 'Total ', align: 'center', minWidth: 120 },
    // { id: 'Remarks', label: 'Remarks', minWidth: 240 },
    { id: 'Actions', label: 'Actions', width: 88 },
  ];

  // Table
  const table = useTable();

  const notFound = !prDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = prDetails.filter((row) => row !== rowToDelete);
    setPrDetails(updatedDetails);

    // If we're deleting the row being edited, reset the form
    if (editingIndex !== null && prDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);
      setValue('Product', null);
      setValue('Quantity', null);
      setValue('ConesQty', null);
      setValue('DeliveryDueDate', null);
      setValue('Unit_Price', null);
      setValue('Description', '');
      setValue('Remarks', '');
      // setValue('UOM', null);
      setSelectedProduct(null);
      setValue('PriceListID', null);
      setValue('Yarn_Type_ID', null);
      setValue('Yarn_Count_ID', null);
      setValue('Color', null);
      setValue('Composition_ID', null);
      setValue('Fabric_Type', null);
      setValue('Sustainability', null);
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


  // useEffect(() => {
  //   if (selectedProduct?.currencyID === 8) {
  //     setCurrencySymbol('৳');
  //   } else {
  //     setCurrencySymbol('$');
  //   }
  // }, [selectedProduct]);

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
                  Please make sure the WIC is created in the system before creating a new proforma
                  invoice.
                </Typography>
              </Box> */}
              <h3>Proforma Invoice:</h3>
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
                    name="PrFor"
                    row
                    value={values.PrFor || ''}
                    label="This PR is for"
                    options={[
                      { value: 'I', label: 'Independent ', disabled: true },
                      { value: 'O', label: 'Opportunity', disabled: true },
                      { value: 'Q', label: 'Quotation', disabled: true },
                      { value: 'S', label: 'Sample', disabled: true },
                    ]}
                  />
                </Box>
                <RHFAutocomplete
                  name="Customer"
                  label="Customer"
                  fullWidth
                  options={customers}
                  getOptionLabel={(option) => option?.WIC_Name || ''}
                  isLoading={isLoading}
                  isOptionEqualToValue={(option, value) => option?.WIC_ID === value?.WIC_ID}
                  value={values?.Customer || null}
                  // disabled
                />

                {/* <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}> */}

                {/* <Tooltip title="View Opportunity" placement="top">
                    <IconButton
                      sx={{ width: 40, height: 40 }}
                      color="primary"
                      onClick={handleOppDialogOpen}
                      disabled={!values?.Opportunity}
                    >
                      <Iconify icon="ph:eye-duotone" />
                    </IconButton>
                  </Tooltip>
                </Box> */}

                {/* <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}> */}
                {values?.PrFor === 'Q' && (
                  <RHFAutocomplete
                    name="Quotation"
                    label="Quotation"
                    fullWidth
                    options={filteredQuotations}
                    getOptionLabel={(option) => option?.QuotationNo}
                    loading={isLoading}
                    value={values?.Quotation || null}
                    disabled
                  />
                )}
                {(values?.PrFor === 'O' || values?.PrFor === 'Q') && (
                  <RHFAutocomplete
                    name="Opportunity"
                    label="Opportunity"
                    fullWidth
                    options={filteredOpportunities}
                    getOptionLabel={(option) => option?.OpportunityName}
                    isOptionEqualToValue={(option, value) =>
                      option?.OpportunityID === value?.OpportunityID
                    }
                    disabled
                    loading={isLoading}
                    value={values?.Opportunity || null}
                  />
                )}
                {/* <Tooltip title="View Quotation" placement="top">
                    <IconButton
                      sx={{ width: 40, height: 40 }}
                      color="primary"
                      onClick={handleQuoDialogOpen}
                      disabled={!values?.Quotation}
                    >
                      <Iconify icon="ph:eye-duotone" />
                    </IconButton>
                  </Tooltip>
                </Box> */}
                {values?.PrFor === 'S' && (
                  <RHFAutocomplete
                    name="Sample"
                    label="Sample Code"
                    fullWidth
                    options={allSamples}
                    getOptionLabel={(option) => option?.Sample_Code}
                    isOptionEqualToValue={(option, value) =>
                      option?.Sample_Request_ID === value?.Sample_Request_ID
                    }
                    // loading={isLoading}
                    value={values?.Sample || null}
                  />
                )}
                {/* <RHFAutocomplete
                  name="Currency"
                  label="Currency"
                  placeholder="Choose an option"
                  fullWidth
                  options={currencies}
                  getOptionLabel={(option) => option?.Currency_Name}
                /> */}

                <AutocompleteWithAdd
                  name="PaymentTerms"
                  label="Payment Terms"
                  options={allPaymentTerms}
                  getOptionLabel={(option) => option?.Payment_Term}
                  isOptionEqualToValue={(option, value) =>
                    option?.Payment_term_ID === value?.Payment_term_ID
                  }
                  value={values?.PaymentTerms || null}
                  onAdd={PostPaymentterms}
                />
                <RHFAutocomplete
                  name="End_Customer"
                  label="Main Buyer"
                  fullWidth
                  options={allEndBuyers}
                  getOptionLabel={(option) => option?.End_Cust_Name || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.End_Cust_ID === value?.End_Cust_ID
                  }
                  value={values?.End_Customer || null}
                  // disabled
                />
                <RHFAutocomplete
                  name="Agent"
                  label="Agent"
                  fullWidth
                  options={allAgents}
                  getOptionLabel={(option) => option?.Agent_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.AgentID === value?.AgentID}
                  value={values?.Agent || null}
                  // disabled
                />

                <Controller
                  name="PRDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="PR Date"
                      format="dd MMM yyyy"
                      // disabled
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
                  name="ValidFrom"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Valid From"
                      format="dd MMM yyyy"
                      // disabled
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
                  name="ValidUntil"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Valid until"
                      format="dd MMM yyyy"
                      // disabled
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

                {/* <RHFAutocomplete
                  name="Approver"
                  label="Key Account Manager"
                  fullWidth
                  multiple
                  sx={{
                    '& .MuiChip-label': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                      maxWidth: '200px', // Adjust this value as needed
                    },
                  }}
                  limitTags={1}
                  options={approvers}
                  getOptionLabel={(option) => option?.fullName}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.UserId}>
                      <Checkbox key={option.UserId} size="small" disableRipple checked={selected} />
                      <Box
                        component="span"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'block',
                          width: '100%',
                        }}
                      >
                        {option.fullName}
                      </Box>
                    </li>
                  )}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.UserId}
                        label={option.fullName}
                        size="small"
                        variant="soft"
                        color="primary"
                        sx={{
                          maxWidth: '100%',
                          '& .MuiChip-label': {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          },
                        }}
                      />
                    ))
                  }
                /> */}
                <RHFAutocomplete
                  name="KAM"
                  label="Key Account Manager"
                  placeholder="Choose an option"
                  fullWidth
                  // disabled
                  options={allKAMs}
                  getOptionLabel={(option) => option?.Username}
                  value={values.KAM || null}
                />
                {/* <RHFAutocomplete
                  name="Initiative"
                  label="Initiative"
                  placeholder="Choose an option"
                  fullWidth
                  options={allInitiative}
                  getOptionLabel={(option) => option?.InitiativeName}
                  value={values.Initiative || null}
                /> */}
                <AutocompleteWithAdd
                  name="Initiative"
                  label="Initiative"
                  options={allInitiative}
                  getOptionLabel={(option) => option?.InitiativeName}
                  isOptionEqualToValue={(option, value) =>
                    option?.InitiativeID === value?.InitiativeID
                  }
                  value={values?.Initiative || null}
                  onAdd={PostInitiative}
                />
                <RHFAutocomplete
                  name="UOM"
                  label="Unit of Measure"
                  placeholder="Choose an option"
                  fullWidth
                  options={allUOM}
                  // disabled={prDetails?.length > 0}
                  value={values.UOM || null}
                  getOptionLabel={(option) => option?.UOMName || ''}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.UOM_ID === value.UOM_ID;
                  }}
                />
                {/* <RHFAutocomplete
                  name="Clause"
                  label="Terms & Condition / Clause"
                  fullWidth
                  // disabled
                  sx={{
                    gridColumn: { xs: 'span 1', md: 'span 2' },
                    '& .MuiChip-label': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                      maxWidth: '200px',
                    },
                  }}
                  multiple
                  limitTags={2}
                  options={allClauses}
                  value={values.Clause || []}
                  getOptionLabel={(option) => option?.Clause || ''}
                  isOptionEqualToValue={(option, value) => option?.Clause_ID === value?.Clause_ID}
                  renderOption={(props, option, { selected }) => {
                    // Find if this option is selected
                    const isSelected = values.Clause?.some(
                      (item) => item?.Clause_ID === option.Clause_ID
                    );
                    return (
                      <li {...props} key={option.Clause_ID}>
                        <Checkbox
                          key={isSelected}
                          size="small"
                          disableRipple
                          checked={isSelected}
                        />
                        <Box
                          component="span"
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block',
                            width: '100%',
                          }}
                        >
                          {option.Clause}
                        </Box>
                      </li>
                    );
                  }}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, index) => (
                      <Tooltip title={option.Clause} key={option.Clause_ID}>
                        <Chip
                          {...getTagProps({ index })}
                          label={option.Clause}
                          size="small"
                          variant="soft"
                          color="primary"
                          sx={{
                            maxWidth: '100%',
                            '& .MuiChip-label': {
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            },
                          }}
                        />
                      </Tooltip>
                    ))
                  }
                  ListboxProps={{
                    style: {
                      maxHeight: '300px',
                    },
                  }}
                /> */}
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
                            <TableCell align="center">{row.Unit_Price}</TableCell>
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
                <h3>Proforma Invoice Products: </h3>
                {/* {editingIndex !== null && ( */}
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
                    <AutocompleteWithAdd
                      name="Fabric_Type"
                      label="Fabric Type"
                      options={allFabricTypes}
                      getOptionLabel={(option) => option?.Fabric_Types || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.Fabric_TypeID === value?.Fabric_TypeID
                      }
                      value={values?.Fabric_Type || null}
                      onAdd={PostFabricTypes}
                    />
                    <AutocompleteWithAdd
                      name="Sustainability"
                      label="Sustainability Certificate"
                      options={allSustainability}
                      getOptionLabel={(option) => option?.Sustainability_Name || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.Sustainability_ID === value?.Sustainability_ID
                      }
                      value={values?.Sustainability || null}
                      onAdd={PostSustainability}
                    />
                    <RHFAutocomplete
                      // sx={{ gridColumn: { xs: 'span 2' } }}
                      key={values?.Color?.ColorID || 'new'}
                      name="Color"
                      label="Color"
                      placeholder="Choose an option"
                      fullWidth
                      options={allColors}
                      value={values?.Color || null}
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
                            allProducts.length === 0 ||
                            !values.Yarn_Count_ID?.Yarn_Count_ID ||
                            !values.Color?.ColorID
                          }
                          onClick={handleDialogOpen}
                        >
                          Check Price
                        </Button>
                      </Box>
                    </Box>

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

                    <RHFTextField
                      name="Description"
                      label="Product Description"
                      variant="outlined"
                      fullWidth
                      disabled
                      value={values?.Description || ''}
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
                            <Typography variant="body2">{values?.UOM?.UOMName || ''}</Typography>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <RHFTextField
                      name="ConesQty"
                      label="No. of Cones"
                      type="number"
                      variant="outlined"
                      fullWidth
                      value={values.ConesQty || ''}
                      // InputProps={{
                      //   endAdornment: (
                      //     <InputAdornment position="end">
                      //       <Typography variant="body2">{values?.UOM?.UOMName || ''}</Typography>
                      //     </InputAdornment>
                      //   ),
                      // }}
                    />

                    <RHFTextField
                      name="Unit_Price"
                      label="Unit Price"
                      type="number"
                      variant="outlined"
                      fullWidth
                      value={values.Unit_Price || ''}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography variant="body2">{currencySymbol}</Typography>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Controller
                      name="DeliveryDueDate"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <DesktopDatePicker
                          {...field}
                          label="Delivery Due Date"
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
                      sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                      name="Remarks"
                      label="Remarks (Optional)"
                      variant="outlined"
                      fullWidth
                      value={values.Remarks || ''}
                    />
                  </Box>
                  <Stack alignItems="flex-end" direction="row-reverse" sx={{ my: 3, gap: 2 }}>
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
                {/* )} */}
                {prDetails.length > 0 && (
                  <Scrollbar>
                    <Table
                      size={table.dense ? 'small' : 'medium'}
                      sx={{
                        minWidth: 460,
                        // mt: 4,
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
                        {prDetails.map((row, index) => (
                          <DetailTableRow
                            key={index}
                            row={row}
                            onDeleteRow={() => DeleteDetailTableRow(row)}
                            onEditRow={() => handleEditDetail(index)}
                            currentData={currentData}
                            UnitOfMeasure={values?.UOM?.UOMName || ''}
                          />
                        ))}

                        <TableEmptyRows
                          height={denseHeight}
                          emptyRows={emptyRows(table.page, table.rowsPerPage, prDetails.length)}
                        />

                        <TableNoData notFound={notFound} />
                      </TableBody>
                    </Table>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="green">
                        {/* eslint-disable-next-line */}
                        {`Total Quantity: ${fNumber(OverAllTotalQunatityInLbs)} ${
                          values?.UOM?.UOMName || ''
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
PrEditForm.propTypes = {
  currentData: PropTypes.any,
  isReapproval: PropTypes.bool,
};
