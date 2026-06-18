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

import { Get, Post } from 'src/api/apibasemethods';
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
import { fDate } from 'src/utils/format-time';
import { APP_URL } from 'src/config-global';
import { fCurrency, fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function PiApprovalForm({ currentData }) {
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
  const [opportunityData, setOpportunityData] = useState([]);
  const [quotationData, setQuotationData] = useState([]);
  const [allEndBuyers, setAllEndBuyers] = useState([]);
  const [allFabricTypes, setAllFabricTypes] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [dialogValue, setDialogValue] = useState('');
  const [open, setOpen] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [approverData, setApproverData] = useState([]);
  const [isApproving, setIsApproving] = useState(false);
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
  const [allInitiative, setAllInitiative] = useState([]);

  const [piDetails, setPiDetails] = useState(
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
  const [allSustainability, setAllSustainability] = useState([]);
  const [allSamples, setAllSamples] = useState([]);
  const [allCostFactors, setAllCostFactors] = useState([]);
  const NewPiSchema = Yup.object().shape({
    // Customer: Yup.object().required('Customer is required'),
    // Opportunity: Yup.object().required('Opportunity is required'),
    // Quotation: Yup.object().required('Quotation is required'),
    // End_Customer: Yup.object().required('End Customer is required'),
    // Agent: Yup.object().required('Agent is required'),
    // PIDate: Yup.date().required('Pi Date is required'),
    // ValidFrom: Yup.date()
    //   .required('Valid From is required')
    //   .test('is-future-or-today', 'Valid From must be today or later', (value) => {
    //     if (!value) return false;
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);
    //     const inputDate = new Date(value);
    //     inputDate.setHours(0, 0, 0, 0);
    //     return inputDate >= today;
    //   }),
    // ValidUntil: Yup.date()
    //   .required('Valid Until is required')
    //   .min(Yup.ref('ValidFrom'), 'Valid Until must be greater than or equal to Valid From'),
    // UOM: Yup.object().required('Unit of Measure is required'),
    // PaymentTerms: Yup.object().required('Payment Term is required'),
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

  // 1. First, update your defaultValues memo with proper dependencies and structure
  const defaultValues = useMemo(
    () => ({
      PiFor: currentData?.PiFor || 'I',
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
      PIDate: currentData?.PIDate ? new Date(currentData.PIDate) : new Date(),
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
      CostFactor: allCostFactors.find((c) => c.CostFactorID === currentData?.CostFactorID) || null,
      CostFactorCharges: currentData?.CostFactorCharges || 0,
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
      allCostFactors,
    ]
  );

  // 2. Update your useEffect that resets the form
  useEffect(() => {
    if (!isLoading && currentData && Object.keys(defaultValues).length > 0) {
      methods.reset(defaultValues);
    }
  }, [isLoading, defaultValues, methods, currentData]);

  const generateProductName = () => {
    const productCode = `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${values?.Yarn_Count_ID?.Yarn_Count_Name || ''
      } -  ${values?.Composition_ID?.Composition_Name || ''}  (${values?.Color?.ColorName || ''} - ${values?.Color?.Color_Code || ''
      })`;
    setValue('Description', productCode);
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
      const response = await Get(`getAllClausesbyDocTypeID?Document_TypeID=2`);
      console.log('Clauses API response:', response.data); // Add this line
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

  const GetDocApprovalSetup = useCallback(async () => {
    try {
      const response = await Get(
        `getDocumentApproverByID?&ApproverID=${userData?.userDetails?.userId}&DocID=2`
      );

      if (response.status === 200 && Array.isArray(response.data?.Data)) {
        const approver = response.data.Data.find(
          (item) => item.ApproverID === userData?.userDetails?.userId
        );
        console.log('approver:', approver); // Debugging line

        // if approver[0].Approval_Lvl_ID === 1 and currentData?.QuotationMst?.Level1_Approved_ID is null set true, or
        // if approver[0].Approval_Lvl_ID === 2 and currentData?.QuotationMst?.Level2_Approved_ID is null set true
        if (
          (approver?.Approval_Lvl_ID === 1 && !currentData?.Level1_Approve !== 'Approved') ||
          (approver?.Approval_Lvl_ID === 2 && !currentData?.Level2_Approve !== 'Approved') ||
          (approver?.Approval_Lvl_ID === 3 && !currentData?.Level3_Approve !== 'Approved')
        ) {
          setCanApprove(true);
        } else {
          setCanApprove(false);
        }
        setApproverData(response?.data?.Data || []);
      }
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.userId, currentData]);

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

  const GetCostFactors = useCallback(async () => {
    try {
      const response = await Get(
        `CostFactor/GetActive?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllCostFactors(response.data);
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
        APIGetTypeList(),
        APIGetCompositionList(),
        GetQuotationActiveinActiveList(),
        getActiveendcustomer(),
        getAllActiveAgents(),
        // fecthApprovers(),
        GetFabricTypes(),
        GetKAMs(),
        GetDocApprovalSetup(),
        getSustainability(),
        getsamplereqList(),
        GetActiveIntiative(),
        GetCostFactors(),
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
    APIGetTypeList,
    GetAllActiveUOM,
    APIGetCompositionList,
    GetQuotationActiveinActiveList,
    getActiveendcustomer,
    getAllActiveAgents,
    // fecthApprovers,
    GetFabricTypes,
    GetKAMs,
    GetDocApprovalSetup,
    getSustainability,
    getsamplereqList,
    GetActiveIntiative,
    GetCostFactors,
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

  const OverAllTotalAmount = piDetails.reduce((total, detail) => {
    const quantity = parseFloat(detail.Quantity);
    const unitPrice = parseFloat(detail.Unit_Price);
    const currencyID = detail?.PriceListID?.CurrencyID;
    const price = currencyID === 8 ? unitPrice * BDTtoUSD : unitPrice;

    return total + quantity * price;
  }, 0);

  const KGtoLBs = (kg) => kg * 2.20462;
  const OverAllTotalQunatityInLbs = piDetails.reduce((total, detail) => {
    const quantity = parseFloat(detail.Quantity);
    // const uom = detail.UOM.UOMID;
    // const q = uom === 7 ? quantity : KGtoLBs(quantity);
    return total + quantity;
  }, 0);

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

  //       if (editingIndex !== null && piDetails[editingIndex]?.Product?.Product_ID) {
  //         const productToSelect = newProducts.find(
  //           (product) => product.Product_ID === piDetails[editingIndex].Product.Product_ID
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
  //   piDetails,
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
      await Post(`AddPIDetails`, detail);
    } catch (error) {
      console.log('Detail', error);
    }
  };

  const SendApproval = async (yesORno) => {
    // if (!values?.Total_Propose_Quantity) {
    //   enqueueSnackbar('Please add Total Propose Quantity', { variant: 'error' });
    //   return;
    // }
    // if (!values?.Propose_Date) {
    //   enqueueSnackbar('Please add Propose Date', { variant: 'error' });
    //   return;
    // }
    const filteredRevisedDetails = piDetails.filter(
      (detail) => detail.PIDtlID !== undefined && detail.hasUpdated
    );

    const revisedData = filteredRevisedDetails.map((detail) => ({
      PIDtlID: detail.PIDtlID,
      PIID: currentData?.PIID || 0,
      Fabric_TypeID: detail.Fabric_Type?.Fabric_TypeID,
      Sustainability_ID: detail.Sustainability?.Sustainability_ID,
      PriceList_ID: detail.Product?.PriceListID || 0,
      Product_ID: detail.Product?.Product_ID,
      // UOMID: detail.Product?.UOMID,
      UnitPrice: detail.Unit_Price,
      CountID: detail.Yarn_Count_ID?.Yarn_Count_ID,
      ColorID: detail.Color?.ColorID,
      YarnTypeID: detail.Yarn_Type_ID?.Yarn_Type_ID,
      UOMID: detail.UOM?.UOM_ID,
      CompositionID: detail.Composition_ID?.Composition_ID,
      Description: detail?.Description || 'N/A',
      Quantity: detail?.Quantity,
      ConesQty: detail?.ConesQty,
      ColorRefCode: detail?.ColorRefCode,
      Total_Amount: detail.Quantity * detail.Unit_Price || 0,
      Remarks: detail.Remarks || 'N/A',
      IsActive: true,
      IsDeleted: false,
      CreatedBy: userData?.userDetails?.userId,
      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,
    }));

    try {
      if (revisedData.length > 0) await Post('AddRevisedProformaDetails', revisedData);

      const respones = await Post(`UpdateProformaApproval`, {
        PIID: currentData?.PIID,
        Level: approverData[0]?.Approval_Lvl_ID,
        Approve: yesORno,
        ApprovedOn: fDate(new Date()),
        ApprovedBy: userData?.userDetails?.userId,
        Remarks: values?.ADM_Approved_Remarks || 'N/A',
      });
      if (respones?.status === 200) {
        enqueueSnackbar('Proforma Approved Successfully', { variant: 'success' });
        const generatedLink = `${APP_URL}${paths.dashboard.transaction.pi.pdf(currentData?.PIID)}`;
        const emailData = {
          ProformaNo: currentData?.PINo,
          EmailTo: currentData?.KAM_EMAILAddress || 'hasham25525@gmail.com', // or currentData?.EmailAddress
          Subject: 'Proforma Approved',
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
              <h2 class="header">Proforma Approved</h2>
  
              <p>Dear ${currentData?.KAM_NAME},</p>
  
              <p>The following Proforma has been approved and is ready for processing:</p>
  
              <div class="details">
                  <p><strong>Invoice ID:</strong> ${currentData?.PINo}</p>
                  <p><strong>Customer Name:</strong> ${currentData?.WIC_Name}</p>
                  <p><strong>Main Buyer:</strong> ${currentData?.End_Cust_Name}</p>
                  <p><strong>Approved By:</strong> ${userData?.userDetails?.userName}</p>
                  <p><strong>Approval Date:</strong> ${fDate(new Date())}</p>
                  <p><strong>Payment Terms:</strong> ${currentData?.Payment_Term}</p>
                  <p><strong>Total Quantity:</strong> ${fNumber(OverAllTotalQunatityInLbs)} ${values?.UOM?.UOMName || ''
            }</p>
                  <p><strong>Total Amount:</strong> ${fCurrency(OverAllTotalAmount)}</p>
  
              </div>
  
              <p>You can view the details of the approved Proforma below:</p>
  
              <table cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                  <tr>
                      <td align="center" width="200" height="40" bgcolor="#5e8a36" style="-webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px; color: #ffffff; display: block;">
                          <a href="${generatedLink}" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; line-height: 40px; width: 100%; display: inline-block;">View Proforma</a>
                      </td>
                  </tr>
              </table>
  
              <p>Please proceed with the next steps in the order process.</p>
  
              <div class="footer">
                  <p>Best regards,<br>${userData?.userDetails?.userName}</p>
              </div>
          </div>
      </body>
      </html>`,
          EmailBy: userData?.userDetails?.userId,
          BranchID: userData?.userDetails?.branchID,
          OrgID: userData?.userDetails?.orgId,
        };
        Post('ProformaInvoice/send', emailData);
        router.push(paths.dashboard.transaction.pi.root);
      }
    } catch (error) {
      console.log('error', error);
      enqueueSnackbar('Error in approving Proforma', { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (piDetails.length === 0) {
      enqueueSnackbar('Please add at least one pi product', { variant: 'error' });
      return;
    }
    const filteredRevisedDetails = piDetails.filter(
      (detail) => detail.PIDtlID !== undefined && detail.hasUpdated
    );

    const revisedData = filteredRevisedDetails.map((detail) => ({
      PIDtlID: detail.PIDtlID,
      PIID: currentData?.PIID || 0,
      FabricTypeID: detail.Fabric_Type?.Fabric_TypeID,
      SustainabilityID: detail.Sustainability?.Sustainability_ID,
      ItemCodePrefix: detail?.ItemCodePrefix,
      PriceList_ID: detail.Product?.PriceListID || 0,
      Product_ID: detail.Product?.Product_ID,
      // UOMID: detail.Product?.UOMID,
      UnitPrice: parseFloat(detail.Unit_Price, 2),
      CountID: detail.Yarn_Count_ID?.Yarn_Count_ID,
      ColorID: detail.Color?.ColorID,
      YarnTypeID: detail.Yarn_Type_ID?.Yarn_Type_ID,
      UOMID: detail.UOM?.UOM_ID,
      CompositionID: detail.Composition_ID?.Composition_ID,
      Description: detail?.Description || 'N/A',
      Quantity: parseFloat(detail?.Quantity, 2),
      ConesQty: detail?.ConesQty || null,
      ColorRefCode: detail?.ColorRefCode || '',
      Total_Amount: detail.Quantity * detail.Unit_Price || 0,
      Remarks: detail.Remarks || 'N/A',
      InitiativeID: data?.Initiative?.InitiativeID || 0,
      IsActive: true,
      IsDeleted: false,
      CreatedBy: userData?.userDetails?.userId,
      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,
    }));

    const newDetails = piDetails.filter((detail) => detail.PIDtlID === undefined);
    const newDetailsData = {
      PIID: currentData?.PIID || 0,
      PIDetails: newDetails.map((detail) => ({
        Revision_No: 0,
        PriceList_ID: 0,
        YarnTypeID: detail.Yarn_Type_ID?.Yarn_Type_ID,
        FabricTypeID: detail.Fabric_Type?.Fabric_TypeID,
        SustainabilityID: detail.Sustainability?.Sustainability_ID,
        ItemCodePrefix: detail.Item_Code_Prefix || '',
        ColorID: detail.Color?.ColorID,
        CountID: detail.Yarn_Count_ID?.Yarn_Count_ID,
        CompositionID: detail.Composition_ID?.Composition_ID,
        Quantity: detail.Quantity,
        ConesQty: detail?.ConesQty,
        ColorRefCode: detail?.ColorRefCode || '',
        UOMID: detail.UOM?.UOM_ID,
        UnitPrice: detail.Unit_Price,
        Total_Amount: detail.Quantity * detail.Unit_Price,
        Description: detail.Description || 'N/A',
        Remarks: detail.Remarks || 'N/A',
        CreatedBy: userData?.userDetails?.userId,
        IsActive: true,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      })),
    };
    try {
      if (revisedData.length > 0) await Post('AddRevisedProformaDetails', revisedData);
      if (newDetails.length > 0) PostDetailData(newDetailsData);
      reset();
      enqueueSnackbar('Updated Successfully!');

      router.push(paths.dashboard.transaction.pi.root);
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
    const addedProductIds = piDetails.map((detail) => detail.Product?.Product_ID);
    return allProducts.filter((product) => !addedProductIds.includes(product.Product_ID));
  }, [piDetails, allProducts]);

  // useEffect(() => {
  //   setPiDetails([]);
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

      const itemCode = `SKU-${yarnTypeCode}-${countName}${compositionValues}-${values?.Color?.Color_Code}`;
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
    // if (!values.Color) {
    //   enqueueSnackbar('Color is required', { variant: 'error' });
    //   return;
    // }
    // if (!values.Yarn_Count_ID) {
    //   enqueueSnackbar('Yarn Count is required', { variant: 'error' });
    //   return;
    // }
    // if (!values.Yarn_Type_ID) {
    //   enqueueSnackbar('Yarn Type is required', { variant: 'error' });
    //   return;
    // }
    // if (!values.Composition_ID) {
    //   enqueueSnackbar('Composition is required', { variant: 'error' });
    //   return;
    // }
    // if (!values.UOM) {
    //   enqueueSnackbar('Unit of Measure is required', { variant: 'error' });
    //   return;
    // }
    // if (!values.Quantity) {
    //   enqueueSnackbar('Quantity is required', { variant: 'error' });
    //   return;
    // }
    // if (!values.Unit_Price) {
    //   enqueueSnackbar('Unit Price is required', { variant: 'error' });
    //   return;
    // }

    // Generate the product name once to use in comparisons
    const newProductName = generateProductName().replace(/\s+/g, ' ').trim().toLowerCase();

    // Check for duplicate only when adding new item (not editing)
    // if (editingIndex === null) {
    //   const productExists = piDetails.some(
    //     (detail) => detail.Description.replace(/\s+/g, ' ').trim().toLowerCase() === newProductName
    //   );

    //   if (productExists) {
    //     enqueueSnackbar('Product already exists', { variant: 'error' });
    //     return;
    //   }
    // }

    if (editingIndex !== null) {
      // Update existing detail
      const updatedDetails = [...piDetails];

      const dataHasChanged =
        updatedDetails[editingIndex].Quantity !== values.Quantity ||
        updatedDetails[editingIndex]?.ConesQty !== values?.ConesQty ||
        updatedDetails[editingIndex].ColorRefCode !== values.ColorRefCode ||
        updatedDetails[editingIndex].Unit_Price !== values.Unit_Price ||
        updatedDetails[editingIndex].Remarks.trim().toLowerCase() !==
        values.Remarks.trim().toLowerCase() ||
        updatedDetails[editingIndex].Description.trim().toLowerCase() !==
        values.Description.trim().toLowerCase() ||
        updatedDetails[editingIndex].Yarn_Type_ID !== values.Yarn_Type_ID?.Yarn_Type_ID ||
        updatedDetails[editingIndex].ColorID !== values.Color?.ColorID ||
        updatedDetails[editingIndex].CountID !== values.Yarn_Count_ID?.Yarn_Count_ID ||
        updatedDetails[editingIndex].CompositionID !== values.Composition_ID?.Composition_ID ||
        updatedDetails[editingIndex].UOMID !== values.UOM?.UOM_ID;

      updatedDetails[editingIndex] = {
        PIDtlID: piDetails[editingIndex].PIDtlID, // Keep the existing PIDtlID for updates
        Item_Code: piDetails[editingIndex].Item_Code,
        ItemCodePrefix: generatePrefix,
        Fabric_Type:
          allFabricTypes.find((fab) => fab.Fabric_TypeID === values.Fabric_Type?.Fabric_TypeID) ||
          null,
        Sustainability:
          allSustainability.find(
            (sust) => sust.Sustainability_ID === values.Sustainability?.Sustainability_ID
          ) || null,
        // eslint-disable-next-line
        hasUpdated: dataHasChanged ? true : false,
        Quantity: values.Quantity,
        ConesQty: values?.ConesQty,
        ColorRefCode: values?.ColorRefCode || '',
        Yarn_Type_ID: values.Yarn_Type_ID,
        Composition_ID: values.Composition_ID,
        Color: values.Color,
        Yarn_Count_ID: values.Yarn_Count_ID,
        Unit_Price: values.Unit_Price,
        UOM: values.UOM,
        Remarks: values?.Remarks || 'N/A',
        Description: generateProductName() || 'N/A',
        PricelistID: values?.PriceListID || 0,
      };
      setPiDetails(updatedDetails);
    } else {
      // Add new detail
      setPiDetails((prev) => [
        ...prev,
        {
          ItemCodePrefix: generatePrefix,
          Fabric_Type: values.Fabric_Type,
          Sustainability: values.Sustainability,
          Color: values.Color,
          Yarn_Count_ID: values.Yarn_Count_ID,
          Yarn_Type_ID: values.Yarn_Type_ID,
          Composition_ID: values.Composition_ID,
          PriceListID: selectedProduct?.PriceListID,
          Description: generateProductName() || 'N/A',
          Product: selectedProduct,
          UOM: values.UOM,
          Remarks: values.Remarks || 'N/A',
          Quantity: values?.Quantity,
          ConesQty: values?.ConesQty,
          Unit_Price: values.Unit_Price,
          ColorRefCode: values?.ColorRefCode || '',
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
    setValue('UOM', null);
    setSelectedProduct(null);
    setValue('Quantity', null);
    setValue('ConesQty', null);
    setValue('Unit_Price', null);
    setValue('ColorRefCode', null);
    setEditingIndex(null);
    generateProductName();
  };

  const handleEditDetail = (index) => {
    const detail = piDetails[index];
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
    setValue(
      'Color',
      allColors?.find((color) => color.ColorID === detail.ColorID) ||
      allColors?.find((color) => color?.ColorID === detail?.Color?.ColorID) ||
      null
    );
    setValue(
      'Yarn_Count_ID',
      allCounts?.find((count) => count.Yarn_Count_ID === detail.CountID) ||
      allCounts?.find((count) => count?.Yarn_Count_ID === detail?.Yarn_Count_ID?.Yarn_Count_ID) ||
      null
    );
    setValue(
      'Yarn_Type_ID',
      allTypes?.find((type) => type.Yarn_Type_ID === detail.YarnTypeID) ||
      allTypes?.find((type) => type?.Yarn_Type_ID === detail?.Yarn_Type_ID?.Yarn_Type_ID) ||
      null
    );
    setValue(
      'Composition_ID',
      allCompositions?.find((comp) => comp.Composition_ID === detail?.CompositionID) ||
      allCompositions?.find(
        (comp) => comp.Composition_ID === detail?.Composition_ID?.Composition_ID
      ) ||
      null
    );
    setValue('PriceListID', detail?.PriceListID);
    // setValue(
    //   'UOM',
    //   allUOM?.find((uom) => uom.UOM_ID === detail.UOMID) ||
    //     allUOM?.find((uom) => uom.UOM_ID === detail?.UOM?.UOM_ID) ||
    //     null
    // );
    setValue('Product', detail.Description);
    setValue('Quantity', detail?.Quantity);
    setValue('ConesQty', detail?.ConesQty);
    setValue('Unit_Price', detail.Unit_Price);
    setValue('Description', detail.Description);

    // setValue('UOMID', detail.UOMID);
    setValue('Remarks', detail.Remarks);
    // setSelectedProduct(detail.Product);

    setEditingIndex(index);
  };

  // Table Heads
  const DetailsTableHead =
    approverData[0]?.Approval_Lvl_ID === 3
      ? [
        { id: 'Item_Code', label: 'Item Code', minWidth: 120 },
        // { id: 'Product', label: 'Product', minWidth: 120 },
        { id: 'Description', label: 'Product Description', minWidth: 240 },
        { id: 'DeliveryDueDate', label: 'Delivery Date ', align: 'center', minWidth: 140 },
        { id: 'ColorRefCode', label: 'Color Ref Code', align: 'center', minWidth: 120 },

        { id: 'Quantity', label: 'Quantity', align: 'center' },
        { id: 'ConesQty', label: 'No. Of Cones', align: 'center', minWidth: 120 },

        { id: 'Unit_Price', label: 'Unit Price', align: 'center', minWidth: 120 },
        { id: 'totalValue', label: 'Total ', align: 'center', minWidth: 120 },
        { id: 'Remarks', label: 'Remarks', minWidth: 200 },
        { id: 'Actions', label: 'Actions', width: 88 },
      ]
      : [
        { id: 'Item_Code', label: 'Item Code', minWidth: 120 },
        // { id: 'Product', label: 'Product', minWidth: 120 },
        { id: 'Description', label: 'Product Description', minWidth: 240 },
        { id: 'DeliveryDueDate', label: 'Delivery Date ', align: 'center', minWidth: 140 },
        { id: 'ColorRefCode', label: 'Color Ref Code', align: 'center', minWidth: 120 },
        { id: 'Quantity', label: 'Quantity', align: 'center' },
        { id: 'ConesQty', label: 'No. Of Cones', align: 'center', minWidth: 120 },

        { id: 'Unit_Price', label: 'Unit Price', align: 'center', minWidth: 120 },
        { id: 'totalValue', label: 'Total ', align: 'center', minWidth: 120 },
        { id: 'Remarks', label: 'Remarks', minWidth: 200 },
        { id: 'Actions', label: 'Actions', width: 88 },
      ];

  // Table
  const table = useTable();

  const notFound = !piDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = piDetails.filter((row) => row !== rowToDelete);
    setPiDetails(updatedDetails);

    // If we're deleting the row being edited, reset the form
    if (editingIndex !== null && piDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);
      setValue('Product', null);
      setValue('Quantity', null);
      setValue('ConesQty', null);
      setValue('ColorRefCode', null);
      setValue('Unit_Price', null);
      setValue('Description', '');
      setValue('Remarks', '');
      setValue('UOM', null);
      setSelectedProduct(null);
      setValue('PriceListID', null);
      setValue('Yarn_Type_ID', null);
      setValue('Yarn_Count_ID', null);
      setValue('Color', null);
      setValue('Composition_ID', null);
      setValue('Fabric_Type', null);
      setValue('Sustainability', null);
      setValue('ColorRefCode', null);
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
  const waitForLevel1 =
    (approverData[0]?.Approval_Lvl_ID === 2 && !currentData?.Level1_Approved_ID) ||
    (approverData[0]?.Approval_Lvl_ID === 3 && !currentData?.Level2_Approved_ID);

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
                    name="PiFor"
                    row
                    value={values.PiFor || ''}
                    label="This PI is for"
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
                  disabled
                />

                {/* {(values?.PiFor === 'O' || values?.PiFor === 'Q') && (
                  <RHFAutocomplete
                    name="Opportunity"
                    label="Opportunity"
                    fullWidth
                    options={filteredOpportunities}
                    getOptionLabel={(option) => option?.OpportunityName}
                    loading={isLoading}
                    value={values?.Opportunity || null}
                    disabled
                  />
                )} */}

                {values?.PiFor === 'Q' && (
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
                {(values?.PiFor === 'O' || values?.PiFor === 'Q') && (
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

                {values?.PiFor === 'S' && (
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
                {/* <RHFAutocomplete
                  name="Currency"
                  label="Currency"
                  placeholder="Choose an option"
                  fullWidth
                  options={currencies}
                  getOptionLabel={(option) => option?.Currency_Name}
                /> */}

                <RHFAutocomplete
                  name="PaymentTerms"
                  label="Payment Terms"
                  placeholder="Choose an option"
                  fullWidth
                  options={allPaymentTerms}
                  getOptionLabel={(option) => option?.Payment_Term}
                  isOptionEqualToValue={(option, value) =>
                    option?.Payment_term_ID === value?.Payment_term_ID
                  }
                  value={values?.PaymentTerms || null}
                  disabled
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
                  disabled
                />
                <RHFAutocomplete
                  name="Agent"
                  label="Agent"
                  fullWidth
                  options={allAgents}
                  getOptionLabel={(option) => option?.Agent_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.AgentID === value?.AgentID}
                  value={values?.Agent || null}
                  disabled
                />

                <Controller
                  name="PIDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="PI Date"
                      format="dd MMM yyyy"
                      disabled
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
                      disabled
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
                      disabled
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
                  disabled
                  options={allKAMs}
                  getOptionLabel={(option) => option?.Username}
                  value={values.KAM || null}
                />
                <RHFAutocomplete
                  name="Initiative"
                  label="Initiative"
                  placeholder="Choose an option"
                  fullWidth
                  disabled
                  options={allInitiative}
                  getOptionLabel={(option) => option?.InitiativeName}
                  value={values.Initiative || null}
                />
                {/* <AutocompleteWithAdd
                  name="Initiative"
                  label="Initiative"
                  options={allInitiative}
                  getOptionLabel={(option) => option?.InitiativeName}
                  isOptionEqualToValue={(option, value) =>
                    option?.InitiativeID === value?.InitiativeID
                  }
                  value={values?.Initiative || null}
                  onAdd={PostInitiative}
                /> */}
                <RHFAutocomplete
                  name="UOM"
                  label="Unit of Measure"
                  placeholder="Choose an option"
                  fullWidth
                  options={allUOM}
                  disabled={piDetails?.length > 0}
                  value={values.UOM || null}
                  getOptionLabel={(option) => option?.UOMName || ''}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.UOM_ID === value.UOM_ID;
                  }}
                />
                <RHFAutocomplete
                  name="CostFactor"
                  label="Additional Amount (If Any)"
                  placeholder="Choose an option"
                  fullWidth
                  disabled
                  options={allCostFactors}
                  value={values.CostFactor || null}
                  getOptionLabel={(option) => option?.CostFactorType || ''}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.CostFactorID === value.CostFactorID;
                  }}
                />

                {values?.CostFactor && (
                  values?.CostFactor?.CostFactorID !== 1 && (
                    <RHFTextField
                      name="CostFactorCharges"
                      label="Additional Amount"
                      type="number"
                      disabled
                      variant="outlined"
                      fullWidth
                      value={values.CostFactorCharges || ''}
                      helperText="Note: Put amount in same currency as of item price."
                    />
                  ))
                }
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
                {editingIndex !== null && (
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
                      {/* <AutocompleteWithAdd
                        name="Fabric_Type"
                        label="Fabric Type"
                        options={allFabricTypes}
                        getOptionLabel={(option) => option?.Fabric_Types || ''}
                        isOptionEqualToValue={(option, value) =>
                          option?.Fabric_TypeID === value?.Fabric_TypeID
                        }
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
                      <Box />
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

                     

                      <RHFAutocomplete
                        name="UOM"
                        label="Unit of Measure"
                        placeholder="Choose an option"
                        fullWidth
                        options={allUOM}
                        value={values.UOM || null}
                        getOptionLabel={(option) => option?.UOMName || ''}
                        isOptionEqualToValue={(option, value) => {
                          if (!option || !value) return false;
                          return option.UOM_ID === value.UOM_ID;
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
                              <Typography variant="body2">{unit}</Typography>
                            </InputAdornment>
                          ),
                        }}
                      /> */}
                      <RHFTextField
                        name="Description"
                        label="Product Description"
                        variant="outlined"
                        fullWidth
                        disabled
                        value={values?.Description || generateProductName() || ''}
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
                      {/* <RHFTextField
                        sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                        name="Remarks"
                        label="Remarks (Optional)"
                        variant="outlined"
                        fullWidth
                        value={values.Remarks || ''}
                      /> */}
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
                )}
                {piDetails.length > 0 && (
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
                        {piDetails.map((row, index) => (
                          <DetailTableRow
                            key={index}
                            row={row}
                            onDeleteRow={() => DeleteDetailTableRow(row)}
                            onEditRow={() => handleEditDetail(index)}
                            currentData={currentData}
                            forApproval={approverData[0]?.Approval_Lvl_ID === 3}
                            UnitOfMeasure={values?.UOM?.UOMName || ''}
                          />
                        ))}

                        <TableEmptyRows
                          height={denseHeight}
                          emptyRows={emptyRows(table.page, table.rowsPerPage, piDetails.length)}
                        />

                        <TableNoData notFound={notFound} />
                      </TableBody>
                    </Table>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="green">
                        {/* eslint-disable-next-line */}
                        {`Total Quantity: ${fNumber(OverAllTotalQunatityInLbs)} ${values?.UOM?.UOMName || ''
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

            {canApprove && (
              <Card sx={{ p: 3, mt: 2 }}>
                <Box sx={{ width: '100%' }}>
                  {/* eslint-disable-next-line */}
                  <>
                    <h3>Proforma Invoice Approval:</h3>
                    <Box
                      rowGap={3}
                      columnGap={2}
                      display="grid"
                      gridTemplateColumns={{
                        xs: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                      }}
                    >
                      {/* <RHFTextField
                                   name="Total_Propose_Quantity"
                                   label="Total Propose Quantity (KG)"
                                   type="number"
                                 /> */}

                      {/* <Controller
                                   name="Propose_Date"
                                   control={control}
                                   render={({ field, fieldState: { error } }) => (
                                     <DesktopDatePicker
                                       {...field}
                                       label="Proposed Date"
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
                      <RHFTextField
                        name="ADM_Approved_Remarks"
                        label="Remarks (Optional)"
                        type="text"
                        multiline
                        rows={4}
                        variant="outlined"
                        fullWidth
                      />
                    </Box>
                  </>
                </Box>
              </Card>
            )}

            {waitForLevel1 && (
              <Typography variant="h6" align="center" sx={{ mt: 2, color: 'gray' }}>
                Please wait for the approval from the Level 1 Approver.
              </Typography>
            )}

            <Box display="flex" justifyContent="end" alignItems="flex-end" gap={2} sx={{ mt: 3 }}>
              {/* eslint-disable-next-line */}
              {canApprove && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <LoadingButton
                    variant="outlined"
                    onClick={() => SendApproval('R')}
                    color="error"
                    disabled={waitForLevel1}
                    loading={isApproving}
                  >
                    Reject
                  </LoadingButton>
                  <LoadingButton
                    onClick={() => SendApproval('A')}
                    variant="contained"
                    color="primary"
                    disabled={waitForLevel1}
                    loading={isApproving}
                  >
                    Approve
                  </LoadingButton>
                </Box>
              )}
              {/* <LoadingButton
                           type="submit"
                           variant="contained"
                           color="primary"
                           loading={isSubmitting}
                         >
                           Save
                         </LoadingButton> */}
            </Box>
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
PiApprovalForm.propTypes = {
  currentData: PropTypes.any,
};
