import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Paper,
  Checkbox,
  Chip,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFCreatableAutocomplete,
} from 'src/components/hook-form';

import { Get, Post } from 'src/api/apibasemethods';
import { decrypt, encrypt } from 'src/api/encryption';
import { getMonth, getYear } from 'date-fns';
import { convertBDTtoUSD, convertUSDtoBDT } from 'src/utils/BDTtoUSD';
import { fNumber } from 'src/utils/format-number';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import DetailTableRow from './detail-table-row';
import {
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TableSelectedAction,
  useTable,
} from 'src/components/table';
import Scrollbar from 'src/components/scrollbar';
import Label from 'src/components/label';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import { char } from 'stylis';
import AddDptDialog from './AddDialog';
import AutocompleteWithMultiAdd from 'src/components/AutocompleteWithMultiAdd';

export default function PoCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Date In SQL format
  const formatDate = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const [allPR, setAllPR] = useState([]);
  const [allVendorData, setallVendorData] = useState([]);
  const [allPaymentTerms, setAllPaymentTerms] = useState([]);
  const [allIncoTerms, setAllIncoTerms] = useState([]);
  const [allStoreData, setallStoreData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const [allPriorities, setAllPriorities] = useState([]);
  const [allPurchaseTypes, setAllPurchaseTypes] = useState([]);
  const [allClassName, setallClassName] = useState([]);
  const [allCategoryData, setallCategoryData] = useState([]);
  const [itemSubCategory, setItemSubCategory] = useState([]);
  const [allItemUnit, setallItemUnit] = useState([]);
  const [allCurrencies, setallCurrencies] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [budgetAmount, setBudgetAmount] = useState({
    BudgetAmtinBDT: 0,
    BudgetAmtinUSD: 0,
    ConsumedAmt: 0,
  });
  const [isLoading, setLoading] = useState(true);
  const [BDTtoUSD, setBDTtoUSD] = useState(0);
  const [USDtoBDT, setUSDtoBDT] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [detailList, setDetailList] = useState([]);
  const [allMeansOfTransport, setallMeansOfTransport] = useState([]);
  const [source, setSource] = useState([]);
  const [poPurchaseTypes, setPoPurchaseTypes] = useState([]);
  const [scopeOfWork, setScopeOfWork] = useState([]);
  // const [ChargesTypes, setChargesTypes] = useState([ ])
  const [dialogOpen, setDialogOpen] = useState(false);
  const [allCharges, setAllCharges] = useState([]);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    GetAllChargesTypeData();
    setDialogOpen(false);
  };

  // const [products, setProducts] = useState([
  //   {
  //     Product_id: null,
  //     Product_ID: null,
  //     PriceListID: null,
  //     Price_Range_Frm: null,
  //     Price_Range_To: null,
  //     EOQ_Range_Frm: null,
  //     EOQ_Range_To: null,
  //     MOQ_Ball_Price: null,
  //     MOQ_Final_Price: null,
  //     EOQ_Ball_Price: null,
  //     EOQ_Final_Price: null,
  //     CurrencyID: null,
  //     CreatedBy: userData?.userDetails?.userId,
  //     IsActive: true,
  //     Branch_ID: userData?.userDetails?.branchID,
  //     Org_ID: userData?.userDetails?.orgId,
  //   },
  // ]);

  const ChargesTypes = [
    { Yarn_Type_ID: 1, Yarn_Type: 'Transport Charges' },
    { Yarn_Type_ID: 2, Yarn_Type: 'Loading Charges' },
    { Yarn_Type_ID: 3, Yarn_Type: 'Custom Duty' },
  ];

  const [products, setProducts] = useState([{ ChargesType: null, Amount: '' }]);

  const NewYarnSetupSchema = Yup.object().shape({
    PRRequestID: Yup.array().required('Please select PR Request'),
    VendorName: Yup.object().required('Vendor Name is required'),
    Source: Yup.object().required('Source is required'),
    Store: Yup.object().required('Delivery Point is required'),
    MeansOfTransport: Yup.object().required('Means of Transport is required'),
    PaymentTerms: Yup.object().required('Payment Terms is required'),
    PODate: Yup.date().required('PO Date is required'),
    // products: Yup.array().of(
    //   Yup.object().shape({
    //     ChargesType: Yup.object().required('Charges Type is required'),
    //     Amount: Yup.number().required('Amount is required'),
    //   })
    // ),
    // AdditionalQty: Yup.number().required("Additional Charges is required"),
    // LandedQty: Yup.number().required("Landed Charges is required"),
    // DeductionQty: Yup.number().required("Deduction is required"),
  });

  const DetailSchema = Yup.object().shape({
    PRINVTypeID: Yup.number().required('Item Type is required'),
    PRCategoryID: Yup.number().required('Category is required'),
    PRSubCatID: Yup.number().required('Sub Category is required'),
    ItemID: Yup.number().required('Item is required'),
    PRItemDescription: Yup.string().required('Item Description is required'),
    PRQty: Yup.number()
      .required('Quantity is required')
      .min(0.01, 'Quantity must be greater than 0'),
    RemainingQty: Yup.number()
      .required('Remaining Quantity is required')
      .min(0.01, 'Remaining Quantity must be greater than 0'),
    PRUOMID: Yup.number().required('UOM is required'),
    PRUnitPrice: Yup.number()
      .required('Unit Price is required')
      .min(0.01, 'Price must be greater than 0'),
    PRCurrencyID: Yup.number().required('Currency is required'),
    NeededByDate: Yup.date().required('Needed By Date is required'),
  });
  const table = useTable();
  const tableComponentRef = useRef();
  const methods = useForm({
    resolver: yupResolver(NewYarnSetupSchema),
    defaultValues: {
      PRRequestID: [],
      Priority: null,
      PurchaseType: null,
      PRRequestDate: new Date(),
      DetailList: [],
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

  const selectedVendor = watch('VendorName');

  // const handleAdd = () => {
  //   const newProduct = {
  //    ChargesType: null,
  //     Quantity: null,

  //     // CreatedBy: userData?.userDetails?.userId,
  //     // IsActive: true,
  //     // Branch_ID: userData?.userDetails?.branchID,
  //     // Org_ID: userData?.userDetails?.orgId,
  //   };
  //   setProducts([...products, newProduct]);
  //   setValue('products', [...values.products, newProduct]);
  // };
  const handleAdd = () => {
    setProducts((prev) => [...prev, { ChargesType: null, Amount: '' }]);
  };
  const handleProductDelete = (productToDelete) => {
    setProducts((prev) => prev.filter((p) => p !== productToDelete));
  };

  // const handleProductDelete = (rowToDelete) => {
  //     const updatedDetails = values.products.filter((row) => row !== rowToDelete);
  //     setValue('products', updatedDetails);
  //   };

  const GetPurchaseRequestDetails = useCallback(async () => {
    try {
      const response = await Get(
        `GetPRRemaining?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setAllPR(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // const GetPurchaseRequestDetails = useCallback(async () => {
  //   if (selectedVendor?.VendorID) {
  //     try {
  //       const response = await Get(`GetPRByVendorID?VendorID=${selectedVendor?.VendorID}`);
  //       setAllPR(response.data);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // }, [selectedVendor?.VendorID]);

  const GetVendors = useCallback(async () => {
    try {
      const response = await Get(
        `ViewVendors?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setallVendorData(response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetPaymentTermData = useCallback(async () => {
    try {
      const response = await Get(
        `getPaymentTermList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setAllPaymentTerms(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetIncotermsData = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetIncoterms?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );

      setAllIncoTerms(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetAllStorelocations = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllStorelocations?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setallStoreData(response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetAllPriorities = useCallback(async () => {
    try {
      const response = await Get(
        `getallpriorities?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setAllPriorities(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);
  const GetAllPurchaseTypes = useCallback(async () => {
    try {
      const response = await Get(
        `getallPurchasetypes?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setAllPurchaseTypes(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const AllClassNameData = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllClasses?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const updatedClass = response.data?.Data.filter((x) => x.isProcureable === true);
      setallClassName(updatedClass);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const fetchAllUOM = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllActiveUOM?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setallItemUnit(response.data.Data || []);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetMeansOfTransport = useCallback(async () => {
    try {
      const response = await Get(
        `GetMeansOfTransport?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setallMeansOfTransport(response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetSource = useCallback(async () => {
    try {
      const response = await Get(
        `GetPoPurposes?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setSource(response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetPOPurchaseTypes = useCallback(async () => {
    try {
      const response = await Get(
        `GetPOPurchaseTypes?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setPoPurchaseTypes(response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetScopeOfWork = useCallback(async () => {
    try {
      const response = await Get(
        `getallscope?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setScopeOfWork(response.data.Data || []);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const fetchAllCurrencies = useCallback(async () => {
    try {
      const response = await Get(`getActiveCurrencies`);
      setallCurrencies(response.data || []);
    } catch (error) {
      setallCurrencies([]);
      console.error(error);
    }
  }, []);

  const fetchExchangeRate = useCallback(async () => {
    const rate = await convertBDTtoUSD(1);
    const rate2 = await convertUSDtoBDT(1);
    if (rate) {
      setBDTtoUSD(rate);
    }
    if (rate2) {
      setUSDtoBDT(rate2);
    }
  }, []);

  const GetAllChargesTypeData = useCallback(async () => {
    try {
      // Use the new API endpoint and required parameters
      const response = await Get(
        `GetAllExtraCharges?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      // Assuming the API returns the array directly (response.data)
      // If the API nests the array (e.g., response.data.Data), adjust the line below:
      setAllCharges(response.data || []);

      console.log('Fetched Extra Charges:', response.data);
    } catch (error) {
      console.error('Error fetching extra charges:', error);
      setAllCharges([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // --- Fetch Data on Mount ---
  useEffect(() => {
    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      GetAllChargesTypeData();
    }
  }, [GetAllChargesTypeData, userData]);

  const selectedClassId = watch('ClassID');
  const GetBudgetAmount = useCallback(async () => {
    if (selectedClassId?.ClassID) {
      try {
        const response = await Get(
          `GetBudgetAmount?pRINVTypeID=${selectedClassId?.ClassID}&month=${getMonth(new Date()) + 1
          }&fyear=${getYear(new Date())}&IsActive=1&IsDeleted=0&OrgID=${userData?.userDetails?.orgId
          }&BranchID=${userData?.userDetails?.branchID}`
        );
        setBudgetAmount(
          response.data || {
            BudgetAmtinBDT: 0,
            BudgetAmtinUSD: 0,
            ConsumedAmt: 0,
          }
        );
      } catch (error) {
        console.error(error);
        setBudgetAmount({
          BudgetAmtinBDT: 0,
          BudgetAmtinUSD: 0,
          ConsumedAmt: 0,
        });
      }
    } else {
      setBudgetAmount({
        BudgetAmtinBDT: 0,
        BudgetAmtinUSD: 0,
        ConsumedAmt: 0,
      });
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, selectedClassId?.ClassID]);

  useEffect(() => {
    const fetchData = async () => {
      fetchExchangeRate();
      await Promise.all([
        GetVendors(),
        GetPurchaseRequestDetails(),
        GetAllPriorities(),
        GetAllPurchaseTypes(),
        AllClassNameData(),
        fetchAllUOM(),
        fetchAllCurrencies(),
        GetBudgetAmount(),
        GetPaymentTermData(),
        GetIncotermsData(),
        GetAllStorelocations(),
        GetMeansOfTransport(),
        GetSource(),
        GetPOPurchaseTypes(),
        // GetScopeOfWork(),
      ]);
      setLoading(false);
      setValue('PRCurrencyID', {
        Currency_ID: 8,
        Currency_Name: 'Bangladeshi Taka',
        Currency_Code: 'BDT',
        Symbol: '$',
        CreatedBy: 0,
        CreatedDate: '0001-01-01T00:00:00',
        UpdatedBy: null,
        UpdatedDate: null,
        IsActive: true,
        Branch_ID: 0,
        Org_ID: 0,
      });
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetchExchangeRate,
    GetPurchaseRequestDetails,
    GetAllPriorities,
    GetAllPurchaseTypes,
    AllClassNameData,
    fetchAllUOM,
    fetchAllCurrencies,
    GetBudgetAmount,
    GetVendors,
    GetPaymentTermData,
    GetIncotermsData,
    GetAllStorelocations,
    GetMeansOfTransport,
    GetSource,
    GetPOPurchaseTypes,
    // GetScopeOfWork,
  ]);

  const FetchAllCategoryData = useCallback(async () => {
    if (selectedClassId?.ClassID) {
      try {
        const response = await Get(
          `InvCategoryGetByClassId?classId=${selectedClassId?.ClassID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        const updatedData = response.data.filter((x) => x.Inv_Cat_ID !== 4);
        setallCategoryData(updatedData || []);
      } catch (error) {
        console.error(error);
      }
    } else {
      setallCategoryData([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, selectedClassId?.ClassID]);

  useEffect(() => {
    FetchAllCategoryData();
    setValue('Category', null);
  }, [selectedClassId?.ClassID, FetchAllCategoryData, setValue]);

  const selectedCategory = watch('Category');

  useEffect(() => {
    const fetchSubCategory = async () => {
      if (selectedCategory?.Inv_Cat_ID) {
        try {
          const response = await Get(`GetSubCategoriesByCategoryID/${selectedCategory.Inv_Cat_ID}`);
          setItemSubCategory(response.data.data);
        } catch (error) {
          console.error(error);
        }
      } else {
        setItemSubCategory([]);
      }
    };

    fetchSubCategory();
    setValue('ItemSubCategory', null);
  }, [selectedCategory, setValue]);

  const selectedSubCategory = watch('ItemSubCategory');

  const fetchItemsBySubCategory = useCallback(async () => {
    if (selectedSubCategory?.Inv_Cat_ID) {
      try {
        const response = await Get(`GetItemsBySubCatID?subCatID=${selectedSubCategory.SubCat_ID}`);
        setAllItems(response.data || []);
      } catch (error) {
        console.error(error);
      }
    } else {
      setAllItems([]);
    }
  }, [selectedSubCategory]);

  useEffect(() => {
    fetchItemsBySubCategory();
  }, [selectedSubCategory, fetchItemsBySubCategory]);

  const resetDetailForm = () => {
    setValue('ClassID', null);
    setValue('Category', null);
    setValue('ItemSubCategory', null);
    setValue('ItemID', null);
    setValue('PRQty', '');
    setValue('RemainingQty', '');
    // setValue('PRUOMID', null);
    setValue('PRUnitPrice', '');
    // setValue('PRCurrencyID', null);
    setValue('NeededByDate', null);
    setValue('Remarks', '');
    setBudgetAmount({
      BudgetAmtinBDT: 0,
      BudgetAmtinUSD: 0,
      ConsumedAmt: 0,
    });
    setEditingIndex(null);
  };

  const DeleteDetailTableRow = (index) => {
    const updatedDetails = [...detailList];
    updatedDetails.splice(index, 1);
    setDetailList(updatedDetails);

    if (editingIndex !== null && editingIndex === index) {
      resetDetailForm();
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleEditDetail = (detail) => {
    setEditingIndex(detail.PRDetailID);
    setValue(
      'ClassID',
      allClassName.find((x) => x.ClassID === detail.PRINVTypeID?.ClassID)
    );
    setValue(
      'Category',
      allCategoryData.find((x) => x.Inv_Cat_ID === detail.PRCategoryID?.Inv_Cat_ID)
    );
    setValue(
      'ItemSubCategory',
      itemSubCategory.find((x) => x.SubCat_ID === detail.PRSubCatID?.SubCat_ID)
    );
    setValue(
      'ItemID',
      allItems.find((x) => x.ItemID === detail.ItemID?.ItemID)
    );
    setValue('PRQty', detail.PRQty);
    setValue('RemainingQty', detail.RemainingQty);
    setValue('POQty', detail.POQty || 0);
    setValue('POPurchaseType', detail.POPurchaseType || null);
    setValue('ScopeOfWork', detail.ScopeOfWork || null);
    setValue(
      'PRUOMID',
      allItemUnit.find((x) => x.UOM_ID === detail.PRUOMID?.UOM_ID)
    );
    setValue('PRUnitPrice', detail.PRUnitPrice);
    setValue('POUnitPrice', detail.POUnitPrice || detail.PRUnitPrice);
    setValue(
      'PRCurrencyID',
      allCurrencies.find((x) => x.Currency_ID === detail.PRCurrencyID?.Currency_ID)
    );
    setValue('NeededByDate', new Date(detail.NeededByDate));
    setValue('Remarks', detail.Remarks);
    setValue('PODeliveryDate', new Date(detail.PODeliveryDate || detail.NeededByDate));

    const updatedSelected = selectedRows.map((item) =>
      item.PRDetailID === detail.PRDetailID ? detail : item
    );
    // Update state
    setDetailList((prev) =>
      prev.map((item) => (item.PRDetailID === detail.PRDetailID ? detail : item))
    );

    setSelectedRows((prev) =>
      prev.some((item) => item.PRDetailID === detail.PRDetailID)
        ? prev.map((item) => (item.PRDetailID === detail.PRDetailID ? detail : item))
        : prev
    );
    setSelectedRows(updatedSelected);
  };

  const onSelectRow = (row) => {
    if (!row?.PODeliveryDate) {
      enqueueSnackbar('PO Delivery Date is required', { variant: 'error' });
      return;
    }
    if (!row?.POPurchaseType) {
      enqueueSnackbar('PO Purchase Type is required', { variant: 'error' });
      return;
    }
    // if (!row?.ScopeOfWork) {
    //   enqueueSnackbar('PO Scope of Work is required', { variant: 'error' });
    //   return;
    // }
    if (row?.POQty === 0) {
      enqueueSnackbar('PO Qty is required', { variant: 'error' });
      return;
    }
    // if (row?.POUnitPrice === 0) {
    //   enqueueSnackbar('PO Unit Price is required', { variant: 'error' });
    //   return;
    // }

    const selected = selectedRows.some((r) => r.PRDetailID === row.PRDetailID)
      ? selectedRows.filter((r) => r.PRDetailID !== row.PRDetailID)
      : [...selectedRows, row];

    setSelectedRows(selected);
  };

  const handleAddDetail = () => {
    try {
      // Validate required fields
      if (!values.ClassID) throw new Error('Item Type is required');
      if (!values.Category) throw new Error('Category is required');
      if (!values.ItemSubCategory) throw new Error('Sub Category is required');
      if (!values.ItemID) throw new Error('Item is required');
      // if (!values.PRItemDescription) throw new Error('Item Description is required');
      if (!values.PRQty || values.PRQty <= 0) throw new Error('Valid Quantity is required');
      if (!values.PRUOMID) throw new Error('UOM is required');
      if (!values.PRUnitPrice || values.PRUnitPrice <= 0)
        throw new Error('Valid Unit Price is required');
      if (!values.PRCurrencyID) throw new Error('Currency is required');
      if (!values.NeededByDate) throw new Error('Needed By Date is required');
      if (!values.RemainingQty || values.RemainingQty <= 0)
        throw new Error('Valid Remaining Quantity is required');

      const detail = {
        PRINVTypeID: values.ClassID,
        PRCategoryID: values.Category,
        PRSubCatID: values.ItemSubCategory,
        ItemID: values?.ItemID || 0,
        PRItemDescription: values.PRItemDescription || 'N/A',
        PRQty: Number(values.PRQty),
        RemainingQty: Number(values.RemainingQty),
        PRUOMID: values.PRUOMID,
        PRUnitPrice: Number(values.PRUnitPrice),
        PRCurrencyID: values.PRCurrencyID,
        CurrConsumedAmt: 0,
        Remarks: values.Remarks || '',
        IsActive: true,
        IsDeleted: false,
        CreatedBy: userData?.userDetails?.userId,
        NeededByDate: formatDate(new Date(values.NeededByDate)),
        CreatedDate: formatDate(new Date()),
        UpdatedBy: null,
        UpdatedDate: null,
      };

      if (editingIndex !== null) {
        const updatedDetails = [...detailList];
        updatedDetails[editingIndex] = detail;
        setDetailList(updatedDetails);
      } else {
        setDetailList([...detailList, detail]);
      }

      resetDetailForm();
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const calculateTotalAmount = () =>
    detailList.reduce((total, item) => {
      // const itemTotal = item.PRQty * item.PRUnitPrice;
      const itemTotal = item.RemainingQty * item.PRUnitPrice;
      return total + (item.PRCurrencyID === 8 ? itemTotal : itemTotal * USDtoBDT);
    }, 0);

  const TotalConsumed = budgetAmount.ConsumedAmt + calculateTotalAmount();

  const selectedPR = watch('PRRequestID');
  const selectedPRRequestIDs = useMemo(() => selectedPR.map((x) => x.PRRequestID), [selectedPR]);
  useEffect(() => {
    const fetch = async () => {
      const res = await Get(`GetItemByPRIDs?prIds=${selectedPRRequestIDs}`);
      console.log(res);
      setDetailList(
        res?.data?.map((x) => ({
          ...x,
          PRINVTypeID: {
            ClassID: x.ClassID,
            ClassName: x.ClassName,
          },
          PRCategoryID: {
            Inv_Cat_ID: x.Inv_Cat_ID,
            Inv_Cat_Name: x.Inv_Cat_Name,
          },
          PRSubCatID: {
            SubCat_ID: x.SubCat_ID,
            SubCat_Name: x.SubCat_Name,
          },
          ItemID: {
            ItemID: x?.ItemID,
            ItemCode: x?.Itemcode,
          },
          PRQty: x.PRQTY,
          RemainingQty: x.RemainingQty,
          PRUOMID: { UOM_ID: x.UOMID, UOMName: x.UOMName },
          PRCurrencyID: { Currency_ID: x?.Currency_ID, Currency_Name: x.Currency_Name },
          PODeliveryDate: x.PODeliveryDate,
          POTotalAmount: x.POTotalAmount,
        }))
      );
    };
    if (selectedPRRequestIDs.length > 0) {
      fetch();
    } else {
      setDetailList([]);
    }
    setSelectedRows([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPRRequestIDs]);

  const PostMeansOfTransport = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Means of Transport', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (
      allMeansOfTransport.find(
        (option) => option.MeansOfTransports.trim().toLowerCase() === newOptionTrimmed
      )
    ) {
      enqueueSnackbar('This Means of Transport already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        MeansOfTransports: newOption,
        isActive: true,
        isDeleted: false,
        CreatedBy: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddMeansOfTransport', dataToSend);
      GetMeansOfTransport();
      enqueueSnackbar('Means of Transport Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };
  const PostPOPurchaseType = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Purchase Type', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (
      poPurchaseTypes.find(
        (option) => option.POPurchaseTypes.trim().toLowerCase() === newOptionTrimmed
      )
    ) {
      enqueueSnackbar('This Purchase Type already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        POPurchaseTypes: newOption,
        isActive: true,
        CreatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddPOPurchaseType', dataToSend);
      GetPOPurchaseTypes();
      enqueueSnackbar('Purchase Type Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const PostScopeOfWork = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Scope of Work', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (scopeOfWork.find((option) => option.ScopeName.trim().toLowerCase() === newOptionTrimmed)) {
      enqueueSnackbar('This Scope of Work already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        ScopeName: newOption,
        isActive: true,
        CreatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddScopeOfWork', dataToSend);
      GetScopeOfWork();
      enqueueSnackbar('Scope of Work Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const PostVendor = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Vendor Name', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (
      allVendorData.find((option) => option.VendorName.trim().toLowerCase() === newOptionTrimmed)
    ) {
      enqueueSnackbar('This Vendor Name already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        InventoryTypeID: 0,
        VendorTypeID: 0,
        VendorName: newOption,
        ShortName: '',
        ContactPerson: '',
        OfficeAddress: '',
        FactoryAddress: '',
        GeoLocation: '',
        PhoneNo: '',
        Email: '',
        // VendorNo: data?.vendorNo,
        CreatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddVendor', dataToSend);
      GetVendors();
      enqueueSnackbar('Vendor Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const PostSource = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Source', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (source.find((option) => option.PoPurposes.trim().toLowerCase() === newOptionTrimmed)) {
      enqueueSnackbar('This Source already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        PoPurposes: newOption,
        isActive: true,
        isDeleted: false,
        CreatedBy: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddPoPurpose', dataToSend);
      GetSource();
      enqueueSnackbar('Source Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const extraChargesToSend = products
    .filter((product) => product.ChargesType && product.Amount)
    .map((product) => {
      const chargeAmount = parseFloat(product.Amount) || 0;

      return {
        ExtraChargesID: product.ChargesType.ExtraChargesID,
        Amount: chargeAmount,
        Remarks: product.ChargesType.ExtraChargesName || 'PO Charge',
        IsActive: true,
        Org_Id: userData?.userDetails?.orgId,
        Branch_Id: userData?.userDetails?.branchID,
      };
    });

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

      const updatedBankList = await GetIncotermsData();

      // const newlyAdded = updatedBankList.find(
      //   (b) => b.IncotermCode.trim().toLowerCase() === newOptionTrimmed
      // );

      enqueueSnackbar('Inco Terms Added Successfully', { variant: 'success' });
      // if (newlyAdded) {
      //   setAllIncoTerms((prev) => [...prev, newlyAdded]);
      // }
    } catch (error) {
      enqueueSnackbar('Inco Terms not Added Successfully', { variant: 'error' });
      console.error('Error adding Inco Terms:', error);
    }
  };

  // In po-new.jsx, update the onSubmit function:
  const onSubmit = handleSubmit(async (data) => {
    if (selectedRows.length === 0) {
      enqueueSnackbar('Please select at least one item', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        PRID: 1,
        PODate: formatDate(new Date(data.PODate)),
        VendorID: data.VendorName?.VendorID || 0,
        LocationID: data?.Store?.StoreID || 0,
        SourceID: data?.Source?.POpurposeID || 0,
        PaymentTermID: data?.PaymentTerms?.Payment_term_ID || 0,
        incotermID: data?.Incoterm?.IncotermID || 0,
        MOTID: data?.MeansOfTransport?.MOTID || 0,
        Remarks: data?.Remarks || '',
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
        CreatedBy: userData?.userDetails?.userId,
        ExtraCharges: extraChargesToSend,
        Details: selectedRows.map((detail) => {
          const poQty = detail.POQty || detail.PRQty;
          const poUnitPrice = detail.POUnitPrice || detail.PRUnitPrice;
          const itemTotal =
            values.PRCurrencyID?.Currency_ID === 8
              ? poQty * poUnitPrice
              : poQty * poUnitPrice * USDtoBDT || 0;
          return {
            PRID: detail.PR_ID || 0,
            PRDTLID: detail.PRDetailID || 0,
            POInvTypeID: detail.PRINVTypeID?.ClassID,
            POCategoryID: detail.PRCategoryID?.Inv_Cat_ID,
            POSubCategoryID: detail.PRSubCatID?.SubCat_ID,
            ItemID: detail.ItemID?.ItemID,
            Specification: detail.ItemID?.Specification || detail.PRItemDescription || 'N/A',
            POQty: poQty,
            POPurchaseTypeID: detail.POPurchaseType?.POPurchaseTypeID || null,
            // ScopeID: detail.ScopeOfWork?.ScopeID || null,
            // RemainingQty: detail.RemainingQty,
            POUOMID: detail.PRUOMID?.UOM_ID,
            POUnitPrice: poUnitPrice,
            POCurrencyID: detail.PRCurrencyID?.Currency_ID,
            POTotalAmount: itemTotal,
            PODeliveryDate: formatDate(new Date(detail.PODeliveryDate || detail.NeededByDate)),
            Remarks: detail.Remarks || '',
          };
        }),
      };
      console.log('dataToSend', dataToSend);

      const response = await Post(`AddPurchaseOrder`, dataToSend);
      if (response.status === 200) {
        enqueueSnackbar('Purchase Order created successfully!', { variant: 'success' });
        console.log('Purchase Order Response:', dataToSend);
        reset();
        setDetailList([]);
        router.push(paths.dashboard.procurement.po.root);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to create Purchase Order', { variant: 'error' });
    }
  });
  const DetailsTableHead = [
    { id: 'Select', label: 'Select', minWidth: 10 },
    { id: 'DeliveryDate', label: 'Expected Delivery Date', minWidth: 200, align: 'center' },
    { id: 'Item', label: 'Item Code', minWidth: 200 },
    { id: 'PRItemDescription', label: 'Item Description', minWidth: 200 },
    { id: 'InventoryType', label: 'Inv. Type', minWidth: 120 },
    { id: 'Category', label: 'Category', minWidth: 150 },
    { id: 'SubCategory', label: 'Sub Category', minWidth: 150 },
    { id: 'POPurchaseType', label: 'PO Purchase Type', minWidth: 220, align: 'center' },
    // { id: 'ScopeOfWork', label: 'Scope of Work', minWidth: 220, align: 'center' },
    { id: 'PRQty', label: 'PR Qty', minWidth: 100, align: 'right' },
    { id: 'RemainingQty', label: 'Remaining Qty', minWidth: 130, align: 'right' },
    { id: 'POQty', label: 'PO Qty', minWidth: 140, align: 'right' },
    { id: 'PRUnitPrice', label: 'PR Unit Price', minWidth: 120, align: 'right' },
    { id: 'POUnitPrice', label: 'PO Unit Price', minWidth: 140, align: 'right' },
    { id: 'TotalAmount', label: 'Total Amount', minWidth: 150, align: 'right' },
    // { id: 'Actions', label: 'Actions', minWidth: 120, align: 'center' },
  ];
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

  return isLoading ? (
    renderLoading
  ) : (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Typography>Priority</Typography>
                <Label color="error">Emergency</Label>
              </Box>
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
                {/* <RHFAutocomplete
                name="PRRequestID"
                label="PR Request"
                fullWidth
                options={allPR}
                getOptionLabel={(option) => option?.PRCode || ''}
                isOptionEqualToValue={(option, value) => option?.PRRequestID === value?.PRRequestID}
              /> */}

                <RHFAutocomplete // perfected multiselect autocomplete
                  name="PRRequestID"
                  label="PR Request"
                  fullWidth
                  multiple
                  limitTags={2}
                  options={allPR}
                  getOptionLabel={(option) => option?.PRCode}
                  isOptionEqualToValue={(option, value) => option.PRRequestID === value.PRRequestID}
                  renderOption={(props, option) => {
                    const isChecked = values.PRRequestID?.some(
                      (selected) => selected.PRRequestID === option.PRRequestID
                    );
                    return (
                      <li {...props} key={option.PRRequestID}>
                        <Checkbox size="small" disableRipple checked={isChecked} />
                        {option.PRCode}
                      </li>
                    );
                  }}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.PRRequestID}
                        label={option.PRCode}
                        size="small"
                        variant="soft"
                        color="primary"
                      />
                    ))
                  }
                />
                <AutocompleteWithAdd
                  name="VendorName"
                  label="Vendor Name"
                  placeholder="Choose an option"
                  fullWidth
                  options={allVendorData}
                  getOptionLabel={(option) => option?.VendorName || ''}
                  isOptionEqualToValue={(option, value) => option?.VendorID === value?.VendorID}
                  value={values?.VendorName || null}
                  onAdd={PostVendor}
                />
                <AutocompleteWithAdd
                  name="Source"
                  label="Source"
                  fullWidth
                  options={source}
                  getOptionLabel={(option) => option?.PoPurposes || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.POpurposeID === value?.POpurposeID
                  }
                  value={values?.Source || null}
                  onAdd={PostSource}
                />

                <Controller
                  name="PODate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="PO Date"
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

                <RHFAutocomplete
                  name="Store"
                  label="Delivery Point"
                  placeholder="Store"
                  fullWidth
                  options={allStoreData}
                  getOptionLabel={(option) => option?.StoreName || ''}
                  isOptionEqualToValue={(option, value) => option?.StoreID === value?.StoreID}
                  value={values?.Store || null}
                />

                <AutocompleteWithAdd
                  name="MeansOfTransport"
                  label="Means Of Transport"
                  fullWidth
                  options={allMeansOfTransport}
                  getOptionLabel={(option) => option?.MeansOfTransports || ''}
                  isOptionEqualToValue={(option, value) => option?.MOTID === value?.MOTID}
                  value={values?.MeansOfTransport || null}
                  onAdd={PostMeansOfTransport}
                />

                <RHFAutocomplete
                  name="PaymentTerms"
                  label="Payment Terms"
                  options={allPaymentTerms}
                  getOptionLabel={(option) => option?.Payment_Term}
                  isOptionEqualToValue={(option, value) =>
                    option?.Payment_term_ID === value?.Payment_term_ID
                  }
                  value={values?.PaymentTerms || null}
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

                {/* <RHFTextField
                name="AdditionalQty"
                label="Additional Charges"
                type="number"
              /> */}
                {/* <RHFTextField
                name="LandedQty"
                label="Landed Charges"
                type="number"
              /> */}
                {/* Deduction  */}
                {/* <RHFTextField
                name="DeductionQty"
                label="Deduction"
                type="number"
              /> */}
                {/* OtherCharges  */}
                {/* <RHFTextField
                name="OtherCharges"
                label="Other Charges (Optional)"
                type="number"
                    sx={{ gridColumn: { sm: ' span 1', md: 'span 2' } }}
              /> */}

                <RHFTextField
                  name="Remarks"
                  label="Remarks"
                  sx={{ gridColumn: { sm: ' span 1', md: 'span 3' } }}
                />
              </Box>
            </Card>

            {/* Add Charges Tables */}

            <Grid xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <h3>Charges</h3>

                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(2, 1fr)',
                  }}
                >
                  <Box sx={{ gridColumn: { sm: 'span 2', md: 'span 3' } }}>
                    <TableContainer component={Paper}>
                      <Scrollbar>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ minWidth: 220 }}>Charges Type</TableCell>
                              <TableCell sx={{ minWidth: 180 }}>Amount</TableCell>
                              <TableCell sx={{ minWidth: 100 }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {products.map((product, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Box sx={{ flexGrow: 1 }}>
                                        <RHFAutocomplete
                                          size="small"
                                          name={`products[${index}].ChargesType`}
                                          label="Charges Type"
                                          placeholder="Choose an option"
                                          fullWidth
                                          options={allCharges}
                                          value={product.ChargesType}
                                          onChange={(e, newValue) => {
                                            const updated = [...products];
                                            updated[index].ChargesType = newValue;
                                            setProducts(updated);
                                          }}
                                          // FIX 1: Keeping this block for the 'typeof option === string' check, as it requires multiple statements.
                                          getOptionLabel={(option) => {
                                            // Handle case where option is a string (e.g., empty string or typed value)
                                            if (typeof option === 'string') {
                                              return option;
                                            }
                                            // Return the ExtraChargesName property
                                            return option?.ExtraChargesName || '';
                                          }}
                                          // FIX 2: Resolved ESLint error by removing curly braces and the 'return' keyword.
                                          // This uses the concise arrow function body style.
                                          isOptionEqualToValue={(option, value) =>
                                            option?.ExtraChargesID === value?.ExtraChargesID
                                          }
                                        />
                                      </Box>
                                      <Tooltip title="Add New Item Category" placement="top">
                                        <IconButton
                                          color="primary"
                                          onClick={() => handleDialogOpen()}
                                        >
                                          <Iconify
                                            icon="lets-icons:add-duotone"
                                            width={32}
                                            height={32}
                                          />
                                        </IconButton>
                                      </Tooltip>
                                    </Stack>
                                  </Box>
                                </TableCell>

                                <TableCell>
                                  <RHFTextField
                                    name={`products[${index}].Amount`}
                                    label="Amount"
                                    size="small"
                                    value={product.Amount}
                                    onChange={(e) => {
                                      const updated = [...products];
                                      updated[index].Amount = e.target.value;
                                      setProducts(updated);
                                    }}
                                  />
                                </TableCell>

                                <TableCell>
                                  <IconButton
                                    onClick={() => handleProductDelete(product)}
                                    color="error"
                                  >
                                    <Iconify icon="solar:trash-bin-trash-bold" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Scrollbar>
                    </TableContainer>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button variant="contained" color="primary" onClick={handleAdd}>
                    Add More
                  </Button>
                </Box>
              </Card>
            </Grid>

            {detailList.length > 0 && (
              <Card sx={{ p: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Items List
                  </Typography>
                  <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                    {/* <TableSelectedAction
                    dense={table.dense}
                    numSelected={table.selected.length}
                    rowCount={detailList.length}
                    onSelectAllRows={(checked) =>
                      table.onSelectAllRows(
                        checked,
                        detailList.map((row, index) => row?.PRDetailID)
                      )
                    }
                    // action={
                    //   <Tooltip title="Delete">
                    //     <IconButton color="primary" onClick={confirm.onTrue}>
                    //       <Iconify icon="solar:trash-bin-trash-bold" />
                    //     </IconButton>
                    //   </Tooltip>
                    // }
                  /> */}
                    <Scrollbar>
                      <Table
                        tableComponentRef={tableComponentRef}
                        size="small"
                        sx={{
                          minWidth: 800,
                          border: 1,
                          borderColor: '#f4f6f8',
                          borderStyle: 'dotted',
                        }}
                      >
                        <TableHeadCustom
                          // numSelected={table.selected.length}
                          onSort={table.onSort}
                          orderBy={table.orderBy}
                          // onSelectAllRows={(checked) =>
                          //   table.onSelectAllRows(
                          //     checked,
                          //     detailList.map((row, index) => row?.PRDetailID)
                          //   )
                          // }
                          headLabel={DetailsTableHead}
                        />
                        <TableBody>
                          {detailList.map((row, index) => (
                            <DetailTableRow
                              key={row.PRDetailID}
                              index={row?.PRDetailID}
                              row={row}
                              selected={selectedRows.some(
                                (selectedRow) => selectedRow.PRDetailID === row.PRDetailID
                              )}
                              onSelectRow={() => onSelectRow(row)}
                              onDeleteRow={() => DeleteDetailTableRow(index)}
                              onEditRow={handleEditDetail}
                              poPurchaseTypes={poPurchaseTypes}
                              PostPOPurchaseType={PostPOPurchaseType}
                              scopeOfWork={scopeOfWork}
                              PostScopeOfWork={PostScopeOfWork}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </Scrollbar>
                  </TableContainer>
                </Box>
              </Card>
            )}

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
              >
                Submit Purchase Order
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>
      <AddDptDialog
        uploadOpen={dialogOpen}
        uploadClose={() => handleDialogClose()}
        tableData={allCategoryData}
        onSuccess={GetAllChargesTypeData}
      />
    </>
  );
}
