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
  Radio,
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
import { APP_API_STORAGE, APP_URL } from 'src/config-global';
import { decryptLink, encryptLink } from 'src/utils/LinkEncryption';
import { fDate } from 'src/utils/format-time';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import { fCurrency, fNumber } from 'src/utils/format-number';
import AutocompleteWithMultiAdd from 'src/components/AutocompleteWithMultiAdd';

// ----------------------------------------------------------------------

export default function PiCreateForm() {
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
  const [allFabricTypes, setAllFabricTypes] = useState([]);
  const [allUOM, setAllUOM] = useState([]);
  const [opportunityData, setOpportunityData] = useState([]);
  const [quotationData, setQuotationData] = useState([]);
  const [allEndBuyers, setAllEndBuyers] = useState([]);
  const [dialogValue, setDialogValue] = useState('');
  const [open, setOpen] = useState(false);
  const [allAgents, setAllAgents] = useState([]);
  const [allCostFactors, setAllCostFactors] = useState([]);
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

  const [piDetails, setPiDetails] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [allQuotations, setAllQuotations] = useState([]);
  const [allSamples, setAllSamples] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [approvers, setApprovers] = useState([]);
  const [allKAMs, setAllKAMs] = useState([]);
  const [allSustainability, setAllSustainability] = useState([]);
  const [allInitiative, setAllInitiative] = useState([]);

  const NewPiSchema = Yup.object().shape({
    Customer: Yup.object().required('Customer is required'),
    Opportunity: Yup.mixed().when('PiFor', {
      is: (value) => value === 'O' || value === 'Q',
      then: () =>
        Yup.mixed()
          .test(
            'is-object',
            'Opportunity is required',
            (value) => value && typeof value === 'object'
          )
          .required(),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    Quotation: Yup.mixed().when('PiFor', {
      is: 'Q',
      then: () =>
        Yup.mixed()
          .test('is-object', 'Quotation is required', (value) => value && typeof value === 'object')
          .required(),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    Sample: Yup.mixed().when('PiFor', {
      is: 'S',
      then: () =>
        Yup.mixed()
          .test('is-object', 'Sample is required', (value) => value && typeof value === 'object')
          .required(),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    // End_Customer: Yup.object().required('End Customer is required'),
    // Agent: Yup.object().required('Agent is required'),
    PIDate: Yup.date()
      .required('PI Date is required')
      .test('is-future-or-today', 'PI Date must be today or later', (value) => {
        if (!value) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(value);
        inputDate.setHours(0, 0, 0, 0);
        return inputDate >= today;
      }),
    ValidFrom: Yup.date()
      .required('Valid From is required')
      .min(Yup.ref('PIDate'), 'Valid From must be greater than or equal to PI Date'),
    ValidUntil: Yup.date()
      .required('Valid Until is required')
      .min(Yup.ref('ValidFrom'), 'Valid Until must be greater than or equal to Valid From'),

    PaymentTerms: Yup.object().required('Payment Term is required'),
    KAM: Yup.object().required('KAM is required'),
    UOM: Yup.object().required('Unit of Measure is required'),
    // Clause: Yup.array().min(1, 'At least one Clause is required'),
    // Sustainability: Yup.object().required('Sustainability Certificate is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewPiSchema),
    defaultValues: {
      PiFor: 'I',
      PIDate: new Date(),
      ValidFrom: new Date(),
      ValidUntil: new Date(new Date().setDate(new Date().getDate() + 15)),
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

  const filteredPaymentTerms = useMemo(() => {
    if (values?.PiFor === 'C') {
      return allPaymentTerms.filter((item) => item.PaymentTypeID === 1);
    }
    return allPaymentTerms.filter((item) => item.PaymentTypeID === 0);
  }, [allPaymentTerms, values?.PiFor]);

  const generateProductName = () => {
    const productCode = `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${values?.Yarn_Count_ID?.Yarn_Count_Name || ''
      } -  ${values?.Composition_ID?.Composition_Name || ''}  (${values?.Color?.ColorName || ''} - ${values?.Color?.Color_Code || ''
      })`;
    return productCode;
  };

  const fetchProductName = (yarnTypeID, countName, compositionName, colorName, colorCode) => {
    const productName = `${allTypes?.find((x) => x.Yarn_Type_ID === yarnTypeID)?.Yarn_Code
      } - ${countName} - ${compositionName} (${colorName} - ${colorCode})`;
    return productName;
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

      setAllClauses(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const GetAllApproveQuotation = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllRevisedQuotations?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&RoleID=${userData?.userDetails?.roles[0]}&UserID=${userData?.userDetails?.userId}`
      );
      const simplifiedData = response.data.QuotationMst;
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
  //       fullName: item?.Username,
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
      setValue('CostFactor', response.data.find(item => item.CostFactorID === 1));
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, setValue]);

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
        GetFabricTypes(),
        GetAllApproveQuotation(),
        getActiveendcustomer(),
        getAllActiveAgents(),
        // fecthApprovers(),
        GetKAMs(),
        getSustainability(),
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
    GetAllActiveUOM,
    APIGetTypeList,
    GetFabricTypes,
    APIGetCompositionList,
    GetAllApproveQuotation,
    getActiveendcustomer,
    getAllActiveAgents,
    // fecthApprovers,
    GetKAMs,
    getSustainability,
    GetActiveIntiative,
    GetCostFactors,
  ]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await Get(`GetPriceListById/${values?.PriceListID?.PriceListID}`);
        setAllProducts(
          response.data.Details.map((item) => ({
            ...item,
            CurrencyID: response.data.Master?.CurrencyID,
          }))
        );
      } catch (error) {
        setAllProducts([]);
      }
    };
    if (values?.PriceListID) {
      setValue('Product', null);
      setSelectedProduct(null);
      fetch();
    }
  }, [values?.PriceListID, setSelectedProduct, setValue]);

  const getsamplereqList = useCallback(async () => {
    try {
      const response = await Get(
        `getAllApproveSample?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&wicID=${values?.Customer?.WIC_ID}`
      );

      setAllSamples(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, values?.Customer?.WIC_ID]);

  useEffect(() => {
    getsamplereqList();
  }, [values?.Customer?.WIC_ID, getsamplereqList]);

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

  // const fetchQuotationData = useCallback(async () => {
  //   try {
  //     const response = await Get(`GetQuotationByID?quotationId=${values?.Quotation?.QuotationID}`);
  //     setQuotationData(response.data?.QuotationDtl);
  //   } catch (error) {
  //     console.log(error);
  //     setQuotationData([]);
  //   }
  // }, [values?.Quotation?.QuotationID]);

  // useEffect(() => {
  //   fetchQuotationData();
  // }, [values?.Quotation?.QuotationID, fetchQuotationData]);

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
    const fetch = async () => {
      try {
        const response = await Get(
          `GetProductsFrmPLBycountAndColorID?Yarncount=${values?.Yarn_Count_ID?.Yarn_Count_ID}&ColorID=${values?.Color?.ColorID}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );
        setAllProducts(response.data.Data);
        if (
          response.data.Data?.find(
            (product) => product.Product_ID === piDetails[editingIndex]?.Product?.Product_ID
          )
        ) {
          setSelectedProduct(
            response.data.Data?.find(
              (product) => product.Product_ID === piDetails[editingIndex]?.Product?.Product_ID
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
    piDetails,
    setSelectedProduct,
    setValue,
  ]);

  const filteredOpportunities = useMemo(
    () =>
      values?.Customer && values?.PiFor === 'Q'
        ? allOpportunities.filter(
          (opportunity) =>
            opportunity?.OpportunityID === values?.Quotation?.OpportunityID &&
            opportunity?.Level1_Approve !== 'P' &&
            opportunity?.Level2_Approve !== 'P'
        )
        : values?.Customer && values?.PiFor === 'O'
          ? allOpportunities.filter(
            (opportunity) =>
              opportunity?.WICID === values?.Customer?.WIC_ID &&
              opportunity?.Level1_Approve !== 'P' &&
              opportunity?.Level2_Approve !== 'P'
          )
          : [],
    [allOpportunities, values?.Customer, values?.PiFor, values?.Quotation]
  );

  const filteredQuotations = useMemo(
    () =>
      values?.Customer
        ? allQuotations.filter(
          (quotation) =>
            quotation?.WIC_ID === values?.Customer?.WIC_ID &&
            quotation?.Level1_Approve !== 'P' &&
            quotation?.Level2_Approve !== 'P'
        )
        : [],
    [allQuotations, values?.Customer]
  );

  const handleClose = () => {
    setDialogValue('');
    setOpen(false);
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

  const PostPaymentterms = async ({ PaymentTerms, hasBit }) => {
    if (PaymentTerms === '') {
      enqueueSnackbar('Please Enter Payment Term', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const PaymentTypeID = hasBit ? 1 : 0;
    const newOptionTrimmed = PaymentTerms.trim().toLowerCase();
    // check if the option already exists
    if (
      allPaymentTerms.find(
        (option) => option.Payment_Term.trim().toLowerCase() === newOptionTrimmed && option.PaymentTypeID === PaymentTypeID
      )
    ) {
      enqueueSnackbar('This Payment Term already exists', { variant: 'error' });
      return;
    }
    try {
      const dataToSend = {
        Payment_term: PaymentTerms,
        PaymentTypeID,
        isActive: true,
        CreatedBy: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };
      console.log(dataToSend);

      await Post('AddPaymentTerm', dataToSend);
      GetAllPaymentTerms();
      enqueueSnackbar('Payment Term Added Successfully', { variant: 'success' });
      handleClose();
    } catch (error) {
      console.log('Error', error);
    }
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

  const PostDetailData = async (detail) => {
    try {
      await Post(`AddPiDetails`, detail);
    } catch (error) {
      console.log('Detail', error);
    }
  };

  const PostPiMasterData = async (opData) => {
    try {
      await Post('AddPi', opData).then(async (res) => {
        if (res?.status === 200) {
          const detailWithMstID = piDetails?.map((detail) => ({
            PiID: res.data.MasterID,
            PriceList_ID: detail?.PriceListID?.PriceListID,
            Product_ID: detail?.Product?.Product_ID,
            UOMID: detail?.Product?.UOMID,
            UnitPrice: parseInt(detail?.Unit_Price, 10),
            // Requirement: detail?.Requirement,
            Description: detail?.Description || 'N/A',
            Quantity: parseInt(detail?.Quantity, 10),
            ConesQty: parseInt(detail?.ConesQty, 10),
            ColorRefCode: detail?.ColorRefCode,
            DeliveryDueDate: detail.DeliveryDueDate
              ? fDate(detail.DeliveryDueDate, 'yyyy-MM-dd')
              : null,

            // eslint-disable-next-line
            Total_Amount: detail?.Quantity * detail?.Unit_Price || 0,
            Revision_No: 0,
            Remarks: detail?.Remarks || 'N/A',
            IsActive: true,
            IsDeleted: false,
            CreatedBy: userData?.userDetails?.userId,
            Branch_ID: userData?.userDetails?.branchID,
            Org_ID: userData?.userDetails?.orgId,
          }));

          // await PostDetailData(detailWithMstID);
          enqueueSnackbar('Created Successfully!');
          reset();
          router.push(paths.dashboard.transaction.pi.root);
        }
      });
    } catch (error) {
      console.log(error);
      if (error.response.status === 400) {
        enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
      } else enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (piDetails.length === 0) {
      enqueueSnackbar('Please add at least one pi product', { variant: 'error' });
      return;
    }

    const dataToSend = {
      PiFor: data.PiFor,
      QuotationID: data?.PiFor === 'Q' ? data.Quotation?.QuotationID : 0,
      OpportunityID:
        data?.PiFor === 'Q' || data?.PiFor === 'O' ? data.Opportunity?.OpportunityID : 0,
      SampleID: data?.PiFor === 'S' ? data.Sample?.Sample_Request_ID : 0,
      Currency_ID: 1,
      InitiativeID: data?.Initiative?.InitiativeID || 0,
      WIC_ID: data.Customer?.WIC_ID,
      PIDate: data?.PIDate ? fDate(data?.PIDate, 'yyyy-MM-dd') : null,
      ValidFrom: data?.ValidFrom ? fDate(data?.ValidFrom, 'yyyy-MM-dd') : null,
      ValidUntil: data?.ValidUntil ? fDate(data?.ValidUntil, 'yyyy-MM-dd') : null,
      Payment_TermID: data.PaymentTerms?.Payment_term_ID,
      End_CustomerID: data?.End_Customer?.End_Cust_ID || 0,
      Agency_ID: data?.Agent?.AgentID || 0,
      ApproverID: 0,
      KAM: data?.KAM?.UserID,
      CostFactorID: data?.CostFactor?.CostFactorID || 0,
      CostFactorCharges: data?.CostFactorCharges || 0,
      PIStatus: 'Pending',
      CreatedBy: userData?.userDetails?.userId,
      UpdatedBy: userData?.userDetails?.userId,
      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,
      IsActive: true,
      IsDeleted: false,
      PIDetails: piDetails.map((detail) => ({
        PriceList_ID: detail.Product?.PriceListID || 0,
        UnitPrice: parseFloat(detail.Unit_Price, 2),
        ItemCodePrefix: detail?.ItemCodePrefix || '',
        FabricTypeID: detail.Fabric_Type?.Fabric_TypeID,
        SustainabilityID: detail.Sustainability?.Sustainability_ID,
        CountID: detail.Yarn_Count_ID?.Yarn_Count_ID,
        ColorID: detail.Color?.ColorID,
        YarnTypeID: detail.Yarn_Type_ID?.Yarn_Type_ID,
        UOMID: data.UOM?.UOM_ID,
        CompositionID: detail.Composition_ID?.Composition_ID,
        Description: detail.Description || 'N/A',
        Quantity: parseFloat(detail.Quantity, 2),
        ConesQty: parseFloat(detail.ConesQty, 2),
        ColorRefCode: detail?.ColorRefCode || '',
        DeliveryDueDate: detail.DeliveryDueDate
          ? fDate(detail.DeliveryDueDate, 'yyyy-MM-dd')
          : null,
        // eslint-disable-next-line
        Total_Amount: detail.Quantity * detail.Unit_Price || 0,
        Revision_No: 0,
        Remarks: detail.Remarks || 'N/A',
        IsActive: true,
        IsDeleted: false,
        CreatedBy: userData?.userDetails?.userId,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      })),
      PIClauses:
        data?.Clause?.map((clause) => ({
          Clause_ID: clause?.Clause_ID,
        })) || [],
      ApproverIDs: data?.Approver?.map((app) => app?.UserId),
    };
    try {
      const res = await Post('AddPi', dataToSend);
      if (res?.status === 200) {
        const generatedLink = `${APP_URL}${paths.dashboard.transaction.pi.approver(
          res?.data?.PIID
        )}`;
        const emailData = {
          ProformaNo: res?.data?.PINo,
          EmailTo: values?.KAM?.EmailAddress,
          Subject: 'PI Created',
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
        <h2 class="header">PI Approval Request</h2>
        
        <p>Dear ${values?.Approver?.FirstName} ${values?.Approver?.LastName},</p>
        
        <p>A new Proforma Invoice has been created and requires your approval:</p>
        
        <div class="details">
            <p><strong>PI Number:</strong> ${res?.data?.PINo}</p>
            <p><strong>Created By:</strong> ${userData?.userDetails?.firstName} ${userData?.userDetails?.lastName
            }</p>
            <p><strong>Date:</strong> ${fDate(new Date())}</p>
        </div>
        
        <p>Please review and take appropriate action:</p>
        
        <table cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
            <tr>
                <td align="center" width="200" height="40" bgcolor="#5e8a36" style="-webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px; color: #ffffff; display: block;">
                    <a href="${generatedLink}" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; line-height: 40px; width: 100%; display: inline-block;">View PI Details</a>
                </td>
            </tr>
        </table>
        
        
        <div class="footer">
            <p>Best regards,<br>${userData?.userDetails?.firstName} ${userData?.userDetails?.lastName
            }</p>
        </div>
    </div>
</body>
</html>`,
          EmailBy: userData?.userDetails?.userId,
          BranchID: userData?.userDetails?.branchID,
          OrgID: userData?.userDetails?.orgId,
        };
        // reset();
        // Post('ProformaInvoice/send', emailData);
        enqueueSnackbar('Created Successfully!');
        router.push(paths.dashboard.transaction.pi.root);
      }
      // router.push(paths.dashboard.transaction.pi.root);
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
    // if (!values.ConesQty) {
    //   enqueueSnackbar('ConesQty is required', { variant: 'error' });
    //   return;
    // }
    if (!values.DeliveryDueDate) {
      enqueueSnackbar('Delivery Due Date is required', { variant: 'error' });
      return;
    }
    if (!values.Unit_Price) {
      enqueueSnackbar('Unit Price is required', { variant: 'error' });
      return;
    }

    if (editingIndex !== null) {
      // Update existing detail
      const updatedDetails = [...piDetails];
      updatedDetails[editingIndex] = {
        // Product: values.Product,
        ItemCodePrefix: generatePrefix,
        Fabric_Type:
          allFabricTypes.find((fab) => fab.Fabric_TypeID === values.Fabric_Type?.Fabric_TypeID) ||
          null,
        Sustainability:
          allSustainability.find(
            (sust) => sust.Sustainability_ID === values.Sustainability?.Sustainability_ID
          ) || null,
        Quantity: values.Quantity,
        ConesQty: values?.ConesQty || '',
        ColorRefCode: values?.ColorRefCode || '',
        DeliveryDueDate: values?.DeliveryDueDate || '',
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
        // PriceListID: values.Product?.PriceListID,
        // Color: values.Color,
        // Yarn_Count_ID: values.Yarn_Count_ID,
      };
      setPiDetails(updatedDetails);
    } else {
      // Add new detail
      setPiDetails((prev) => [
        ...prev,
        {
          // Requirement: values?.Requirement,
          ItemCodePrefix: generatePrefix,
          Color: values.Color,
          Fabric_Type: values.Fabric_Type,
          Sustainability: values.Sustainability,
          Yarn_Count_ID: values.Yarn_Count_ID,
          Yarn_Type_ID: values.Yarn_Type_ID,
          Composition_ID: values.Composition_ID,
          PriceListID: selectedProduct?.PriceListID,
          Description: generateProductName() || 'N/A',
          Product: selectedProduct,
          UOM: values.UOM,
          Remarks: values.Remarks || 'N/A',
          Quantity: values.Quantity,
          ConesQty: values?.ConesQty || '',
          ColorRefCode: values?.ColorRefCode || '',
          DeliveryDueDate: values?.DeliveryDueDate || '',
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
    setValue('ColorRefCode', null);
    setValue('DeliveryDueDate', null);
    setValue('Unit_Price', null);

    setEditingIndex(null);
    generateProductName();
  };

  const handleEditDetail = (index) => {
    const detail = piDetails[index];
    setValue(
      'Fabric_Type',
      allFabricTypes.find((product) => product.Fabric_TypeID === detail.Fabric_Type?.Fabric_TypeID)
    );
    setValue('Quantity', detail.Quantity);
    setValue('ConesQty', detail?.ConesQty || '');
    setValue('ColorRefCode', detail?.ColorRefCode || '');
    setValue('DeliveryDueDate', detail?.DeliveryDueDate || '');
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
    setValue(
      'Sustainability',
      allSustainability.find(
        (sustain) => sustain.Sustainability_ID === detail.Sustainability?.Sustainability_ID
      )
    );

    setEditingIndex(index);
  };
  // Table Heads
  const DetailsTableHead = [
    { id: 'Description', label: 'Product Description', minWidth: 220 },
    // { id: 'Description', label: 'Product Description', minWidth: 240 },
    { id: 'DeliveryDueDate', label: 'Delivery Date ', align: 'center', minWidth: 120 },
    { id: 'ColorRefCode', label: 'Color Ref Code', align: 'center' },
    { id: 'Quantity', label: 'Quantity', align: 'center' },
    { id: 'ConesQty', label: 'ConesQty', align: 'center' },
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

  useEffect(() => {
    if (selectedProduct?.currencyID === 8) {
      setCurrencySymbol('৳');
    } else {
      setCurrencySymbol('$');
    }
  }, [selectedProduct]);

  const fetchData = useCallback(async () => {
    try {
      if (values?.PiFor === 'Q' && values?.Quotation?.QuotationID) {
        // Fetch and process Quotation data
        const response = await Get(
          `GetQuotationByID?quotationId=${values?.Quotation?.QuotationID}`
        );
        setQuotationData(response.data.QuotationDtl);
        setValue(
          'KAM',
          allKAMs.find((kam) => kam.UserID === response.data?.QuotationMst?.KAM) || null
        );

        const newDetails = response.data.QuotationDtl.map((item) => ({
          ...item,
          Description: item.Remarks,
          Remarks: item.Description,
          Unit_Price: item.UnitPrice,
          PriceListID: {
            PriceListID: item.PriceListID,
            PriceListName: item.PriceListName,
          },
          Product: {
            Product_ID: item.Product_ID,
            ProductName: item.ProductName,
          },
          Color: allColors.find((color) => color.ColorID === item.ColorID) || null,
          Yarn_Count_ID:
            allCounts.find((count) => count.Yarn_Count_ID === item.YARN_COUNTID) || null,
          Yarn_Type_ID: allTypes.find((type) => type.Yarn_Type_ID === item.YARN_TYPE_ID) || null,
          Composition_ID:
            allCompositions.find(
              (composition) => composition.Composition_ID === item.Composition_ID
            ) || null,
          UOM: allUOM.find((uom) => uom.UOM_ID === item.UOMID) || null,
        }));
        setPiDetails(newDetails);
      } else if (values?.PiFor === 'S' && values?.Sample?.Sample_Request_ID) {
        // Fetch and process Sample data
        const sampleResponse = await Get(
          `getSampleRequestsanddtl?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&Sample_Request_ID=${values?.Sample?.Sample_Request_ID}`
        );
        const sampleData = sampleResponse.data?.Data[0].Details || []; // Adjust this based on your actual API response structure
        setValue(
          'KAM',
          allKAMs.find((kam) => kam.UserID === sampleResponse.data?.Data[0]?.KAM) || null
        );
        // Clean and transform sample data to match PI details format
        const cleanedSampleDetails = sampleData.map((item) => ({
          ...item,
          Description:
            item.Description ||
            fetchProductName(
              item?.Yarn_TypeID,
              item?.Yarn_Count_Name,
              item?.Composition_Name,
              item?.ColorName,
              item?.Color_Code
            ) ||
            '',
          Remarks: item.Remarks || '',
          Unit_Price: item.Price || 0,
          PriceListID: {
            PriceListID: item?.PriceListID || null,
            PriceListName: item?.PriceListName || '',
          },
          Product: {
            Product_ID: item.Product_ID || null,
            ProductName: item.ProductName || '',
          },
          Color: allColors.find((color) => color.ColorID === item.ColorID) || null,
          Yarn_Count_ID:
            allCounts.find((count) => count.Yarn_Count_ID === item.YarnCountID) || null,
          Yarn_Type_ID: allTypes.find((type) => type.Yarn_Type_ID === item.Yarn_TypeID) || null,
          Composition_ID:
            allCompositions.find(
              (composition) => composition.Composition_ID === item.Composition_ID
            ) || null,
          UOM: allUOM.find((uom) => uom.UOM_ID === item.UOMID) || null,
        }));

        setPiDetails(cleanedSampleDetails);
      } else if (values?.PiFor === 'O' && values?.Opportunity?.OpportunityID) {
        // Fetch and process opportunity data
        const oppResponse = await Get(`GetOpportunityById/${values?.Opportunity?.OpportunityID}`);
        const oppData = oppResponse.data?.OppProduct || []; // Adjust this based on your actual API response structure

        // Clean and transform opportunity data to match PI details format
        const cleanedopportunityDetails = oppData.map((item) => ({
          ...item,
          Description: item.Requirement || '',
          Remarks: item.Description || '',
          PriceListID: {
            PriceListID: item?.PriceListID || null,
            PriceListName: item?.PriceListName || '',
          },
          Product: {
            Product_ID: item.Product_ID || null,
            ProductName: item.ProductName || '',
          },
          Color: allColors.find((color) => color.ColorID === item.ColorID) || null,
          Yarn_Count_ID:
            allCounts.find((count) => count.Yarn_Count_ID === item.Yarn_Count_ID) || null,
          Yarn_Type_ID: allTypes.find((type) => type.Yarn_Type_ID === item.Yarn_Type_ID) || null,
          Composition_ID:
            allCompositions.find(
              (composition) => composition.Composition_ID === item.Composition_ID
            ) || null,
          UOM: allUOM.find((uom) => uom.UOM_ID === item.UOMID) || null,
        }));
        setValue('KAM', allKAMs.find((kam) => kam.UserID === oppResponse.data?.KAM) || null);
        setPiDetails(cleanedopportunityDetails);
      } else {
        // Clear PI details if no valid condition is met
        setPiDetails([]);
      }
    } catch (error) {
      console.log(error);
      setPiDetails([]);
    }
    // eslint-disable-next-line
  }, [
    values?.PiFor,
    values?.Quotation?.QuotationID,
    values?.Sample?.Sample_Request_ID,
    values?.Opportunity?.OpportunityID,
    allKAMs,
    allTypes,
    allColors,
    allCompositions,
    allUOM,
    allCounts,
    userData?.userDetails?.branchID,
    userData?.userDetails?.orgId,
    setValue,
  ]);

  useEffect(() => {
    fetchData();
  }, [
    values?.PiFor,
    values?.Quotation?.QuotationID,
    values?.Sample?.Sample_Request_ID,
    values?.Opportunity?.OpportunityID,
    fetchData,
  ]);

  useEffect(() => {
    setValue('Opportunity', null);
    setValue('Quotation', null);
    setValue('Sample', null);
  }, [values?.PiFor, values?.Customer?.WIC_ID, setValue]);

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
                    label="This PI is for"
                    defaultValue="I"
                    options={[
                      { value: 'I', label: 'Independent ' },
                      { value: 'O', label: 'Opportunity' },
                      { value: 'Q', label: 'Quotation' },
                      { value: 'S', label: 'Sample' },
                      { value: 'C', label: 'Cash' },
                    ]}
                  />
                </Box>

                <RHFAutocomplete
                  name="Customer"
                  label="Customer"
                  fullWidth
                  options={customers}
                  getOptionLabel={(option) => option?.WIC_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.WIC_ID === value?.WIC_ID}
                />

                {values?.PiFor === 'Q' && (
                  // <Box sx={{ display: 'flex',alignItems: 'center' }}>
                  <RHFAutocomplete
                    name="Quotation"
                    label="Quotation"
                    fullWidth
                    options={filteredQuotations}
                    getOptionLabel={(option) => option?.QuotationNo}
                    isOptionEqualToValue={(option, value) =>
                      option?.QuotationID === value?.QuotationID
                    }
                    loading={isLoading}
                    value={values?.Quotation || null}
                    disabled={!values?.Customer}
                  />
                  //   {/* <Tooltip title="View Quotation" placement="top">
                  //   <IconButton
                  //     sx={{ width: 40, height: 40 }}
                  //     color="primary"
                  //     onClick={handleQuoDialogOpen}
                  //     disabled={!values?.Quotation}
                  //   >
                  //     <Iconify icon="ph:eye-duotone" />
                  //   </IconButton>
                  // </Tooltip> */}
                  // </Box>
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
                    loading={isLoading}
                    value={values?.Opportunity || null}
                    disabled={!values?.Customer && values?.PiFor === 'Q'}
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

                <AutocompleteWithMultiAdd
                  name="PaymentTerms"
                  label="Payment Terms"
                  options={filteredPaymentTerms}
                  getOptionLabel={(option) => option?.Payment_Term}
                  isOptionEqualToValue={(option, value) =>
                    option?.Payment_term_ID === value?.Payment_term_ID
                  }
                  value={values?.PaymentTerms || null}
                  onAdd={PostPaymentterms}

                  fields={[
                    { name: 'PaymentTerms', label: 'Payment Term' },

                  ]}
                  hasBit
                  labelBit="For Bill"
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
                />
                <RHFAutocomplete
                  name="Agent"
                  label="Agent"
                  fullWidth
                  options={allAgents}
                  getOptionLabel={(option) => option?.Agent_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.AgentID === value?.AgentID}
                />

                <Controller
                  name="PIDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      defaultValue={new Date()}
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
                <Controller
                  name="ValidFrom"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Valid From"
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
                <Controller
                  name="ValidUntil"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Valid until"
                      format="dd MMM yyyy"
                      defaultValue={new Date(new Date().setDate(new Date().getDate() + 15))}
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
                  label="Approver"
                  fullWidth
                  options={approvers}
                  getOptionLabel={(option) => option?.fullName || ''}
                  isOptionEqualToValue={(option, value) => option?.UserId === value?.UserId}
                /> */}
                {/* <RHFAutocomplete
                  name="Approver"
                  label="Approver"
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
                  options={allKAMs}
                  getOptionLabel={(option) => option?.Username}
                />
                {/* <RHFAutocomplete
                  name="Initiative"
                  label="Initiative"
                  placeholder="Choose an option"
                  fullWidth
                  options={allInitiative}
                  getOptionLabel={(option) => option?.InitiativeName}
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
                  // disabled={piDetails?.length > 0}
                  options={allUOM}
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

                <RHFAutocomplete
                  name="CostFactor"
                  label="Additional Amount (If Any)"
                  placeholder="Choose an option"
                  fullWidth
                  // disabled={piDetails?.length > 0}
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
                      variant="outlined"
                      fullWidth
                      value={values.CostFactorCharges || ''}
                      helperText="Note: Put amount in same currency as of item price."
                    />
                  ))
                }
              </Box>
            </Card>

            <Card sx={{ p: 3, mt: 2 }}>
              <Box sx={{ width: '100%' }}>
                <h3>Proforma Invoice Products: </h3>
                {/* {!values?.PiFor && ( */}
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
                    {/* <Box /> */}

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
                      value={generateProductName() || ''}
                    />
                    <RHFTextField
                      name="ColorRefCode"
                      label="Color Ref. Code"
                      variant="outlined"
                      fullWidth
                      value={values.ColorRefCode || ''}
                    // InputProps={{
                    //   endAdornment: (
                    //     <InputAdornment position="end">
                    //       <Typography variant="body2">{values?.UOM?.UOMName || ''}</Typography>
                    //     </InputAdornment>
                    //   ),
                    // }}
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
                {piDetails.length === 0 && values?.PiFor !== 'I' && values?.PiFor !== 'C' && (
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: 'text.secondary', textAlign: 'center' }}
                  >
                    Please select a{' '}
                    {values?.PiFor === 'Q'
                      ? 'quotation'
                      : values?.PiFor === 'S'
                        ? 'sample'
                        : values?.PiFor === 'O'
                          ? 'opportunity'
                          : ''}{' '}
                    to load products.
                  </Typography>
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
