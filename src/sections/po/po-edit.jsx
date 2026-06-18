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
  Checkbox,
  Chip,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableContainer,
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

import { Get, Post, Put } from 'src/api/apibasemethods';
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
import PropTypes from 'prop-types';
import AutocompleteWithMultiAdd from 'src/components/AutocompleteWithMultiAdd';

export default function PoEditForm({ currentData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  console.log('currentData', currentData);
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
  const [updatedFetchedDetails, setUpdatedFetchedDetails] = useState([]);
  const [allMeansOfTransport, setallMeansOfTransport] = useState([]);
  const [source, setSource] = useState([]);
  const [poPurchaseTypes, setPoPurchaseTypes] = useState([]);
  const [scopeOfWork, setScopeOfWork] = useState([]);

  const NewYarnSetupSchema = Yup.object().shape({
    PRRequestID: Yup.array().required('Please select PR Request'),
    VendorName: Yup.object().required('Vendor Name is required'),
    Source: Yup.object().required('Source is required'),
    // Store: Yup.object().required('Delivery Point is required'),
    MeansOfTransport: Yup.object().required('Means of Transport is required'),
    PaymentTerms: Yup.object().required('Payment Terms is required'),
    Incoterm: Yup.object().required('Incoterm is required'),
    PODate: Yup.date().required('PO Date is required'),
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

  const GetPurchaseRequestDetails = useCallback(async () => {
    try {
      const response = await Get(
        `GetActivePurchaseRequest?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setAllPR(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

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

  const selectedClassId = watch('ClassID');
  const GetBudgetAmount = useCallback(async () => {
    if (selectedClassId?.ClassID) {
      try {
        const response = await Get(
          `GetBudgetAmount?pRINVTypeID=${selectedClassId?.ClassID}&month=${
            getMonth(new Date()) + 1
          }&fyear=${getYear(new Date())}&IsActive=1&IsDeleted=0&OrgID=${
            userData?.userDetails?.orgId
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

  // Function to set default values from currentData
  const setDefaultValues = useCallback(() => {
    if (
      currentData &&
      allVendorData.length &&
      allPaymentTerms.length &&
      allStoreData.length &&
      allMeansOfTransport.length &&
      allIncoTerms.length &&
      source.length
    ) {
      // Set PR Request objec
      if (currentData.PRRequestID) {
        // Create a map for faster lookup
        const prMap = {};
        allPR.forEach((item) => {
          prMap[item.PRRequestID] = item;
        });

        // Get PR objects in the same order as currentData.PRRequestID
        const prRequests = currentData.PRRequestID.map((id) => prMap[id]).filter(
          (item) => item !== undefined
        );

        // Remove duplicates by PRRequestID
        const uniquePrRequests = prRequests.filter(
          (request, index, self) =>
            index === self.findIndex((r) => r.PRRequestID === request.PRRequestID)
        );

        setValue('PRRequestID', uniquePrRequests);
      }

      // Set Vendor
      if (currentData.VendorName?.VendorID) {
        const vendor = allVendorData.find((v) => v.VendorID === currentData.VendorName.VendorID);
        setValue('VendorName', vendor || null);
      }

      // Set Source
      if (currentData.Source?.POpurposeID) {
        const sourceItem = source.find((s) => s.POpurposeID === currentData.Source.POpurposeID);
        setValue('Source', sourceItem || null);
      }

      // Set PO Date
      if (currentData.PODate) {
        setValue('PODate', new Date(currentData.PODate));
      }

      // Set Store/Delivery Point - FIXED: Use LocationID from currentData
      if (currentData.Store) {
        const store = allStoreData.find((s) => s.StoreID === currentData.Store.StoreID);
        setValue('Store', store || null);
      }

      // Set Means of Transport - FIXED: Use MOTID from currentData
      if (currentData.MOTID) {
        const transport = allMeansOfTransport.find((m) => m.MOTID === currentData.MOTID);
        setValue('MeansOfTransport', transport || null);
      }

      // Set Payment Terms
      if (currentData.PaymentTerms?.Payment_term_ID) {
        const paymentTerm = allPaymentTerms.find(
          (p) => p.Payment_term_ID === currentData.PaymentTerms.Payment_term_ID
        );
        setValue('PaymentTerms', paymentTerm || null);
      }

      // set Incoterm
      if (currentData.Incoterm) {
        console.log(currentData.Incoterm);
        const incoterm = allIncoTerms.find((i) => i.IncotermID === currentData.Incoterm.IncotermID);
        setValue('Incoterm', incoterm || null);
      }

      // Set Remarks
      setValue('Remarks', currentData.Remarks || '');

      // Transform and set detail list if available
      if (currentData.Details && currentData.Details.length > 0) {
        const transformedDetails = currentData.Details.map((detail) => {
          // Find the purchase type for this detail
          const purchaseType = poPurchaseTypes.find(
            (pt) => pt.POPurchaseTypeID === detail.POPurchaseTypeID
          );

          return {
            PRDetailID: detail.PRDTLID,
            PRDTLID: detail.PRDTLID,
            PR_ID: detail.PRID,
            PRINVTypeID: {
              ClassID: detail.POInvTypeID,
              ClassName: detail.InvType?.InvTypeName || '',
            },
            PRCategoryID: {
              Inv_Cat_ID: detail.POCategoryID,
              Inv_Cat_Name: detail.Category?.CategoryName || '',
            },
            PRSubCatID: {
              SubCat_ID: detail.POSubCategoryID,
              SubCat_Name: detail.SubCategory?.SubCatName || '',
            },
            ItemID: {
              ItemID: detail.ItemID,
              ItemCode: detail.Item?.ItemDescription || '',
              Specification: detail.Specification,
            },
            PRItemDescription: detail.PRItemDescription,
            PRQty: detail.PRQty,
            RemainingQty: detail.POQty,
            PRUOMID: {
              UOM_ID: detail.UOM?.UOMID,
              UOMName: detail.UOM?.UOMName,
            },
            PRUnitPrice: detail.UnitPrice,
            PRCurrencyID: {
              Currency_ID: detail.POCurrencyID,
              Currency_Name: detail.Currency?.CurrencyName || '',
            },
            PODeliveryDate: new Date(detail.DeliveryDate),
            NeededByDate: new Date(detail.DeliveryDate),
            Remarks: detail.Remarks || '',
            POQty: detail.POQty,
            POUnitPrice: detail.UnitPrice,
            POPurchaseType: purchaseType || null,
          };
        });
        // setUpdatedFetchedDetails(transformedDetails);
        // setTimeout(() => {
        //   setDetailList(transformedDetails);
        // setSelectedRows(transformedDetails);
        // }, 400);
      }
    }
  }, [
    currentData,
    allVendorData,
    allPaymentTerms,
    allIncoTerms,
    allStoreData,
    allMeansOfTransport,
    source,
    allPR,
    poPurchaseTypes,
    setValue,
  ]);

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
        GetScopeOfWork(),
      ]);

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

      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, [
    fetchExchangeRate,
    GetPurchaseRequestDetails,
    GetAllPriorities,
    GetAllPurchaseTypes,
    AllClassNameData,
    fetchAllUOM,
    fetchAllCurrencies,
    GetIncotermsData,
    GetBudgetAmount,
    GetVendors,
    GetPaymentTermData,
    GetAllStorelocations,
    GetMeansOfTransport,
    GetSource,
    GetPOPurchaseTypes,
    GetScopeOfWork,
  ]);

  useEffect(() => {
    if (updatedFetchedDetails.length > 0) {
      // setDetailList(updatedFetchedDetails);
      setSelectedRows(updatedFetchedDetails);
    }
  }, [updatedFetchedDetails]);
  // Set default values after data is loaded
  useEffect(() => {
    if (!isLoading) {
      setDefaultValues();
    }
  }, [isLoading, setDefaultValues]);

  // const FetchAllCategoryData = useCallback(async () => {
  //   if (selectedClassId?.ClassID) {
  //     try {
  //       const response = await Get(
  //         `InvCategoryGetByClassId?classId=${selectedClassId?.ClassID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
  //       );
  //       const updatedData = response.data.filter((x) => x.Inv_Cat_ID !== 4);
  //       setallCategoryData(updatedData || []);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   } else {
  //     setallCategoryData([]);
  //   }
  // }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, selectedClassId?.ClassID]);

  // useEffect(() => {
  //   FetchAllCategoryData();
  //   setValue('Category', null);
  // }, [selectedClassId?.ClassID, FetchAllCategoryData, setValue]);

  // const selectedCategory = watch('Category');

  // useEffect(() => {
  //   const fetchSubCategory = async () => {
  //     if (selectedCategory?.Inv_Cat_ID) {
  //       try {
  //         const response = await Get(`GetSubCategoriesByCategoryID/${selectedCategory.Inv_Cat_ID}`);
  //         setItemSubCategory(response.data.data);
  //       } catch (error) {
  //         console.error(error);
  //       }
  //     } else {
  //       setItemSubCategory([]);
  //     }
  //   };

  //   fetchSubCategory();
  //   setValue('ItemSubCategory', null);
  // }, [selectedCategory, setValue]);

  // const selectedSubCategory = watch('ItemSubCategory');

  // const fetchItemsBySubCategory = useCallback(async () => {
  //   if (selectedSubCategory?.Inv_Cat_ID) {
  //     try {
  //       const response = await Get(`GetItemsBySubCatID?subCatID=${selectedSubCategory.SubCat_ID}`);
  //       setAllItems(response.data || []);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   } else {
  //     setAllItems([]);
  //   }
  // }, [selectedSubCategory]);

  // useEffect(() => {
  //   fetchItemsBySubCategory();
  // }, [selectedSubCategory, fetchItemsBySubCategory]);

  const resetDetailForm = () => {
    setValue('ClassID', null);
    setValue('Category', null);
    setValue('ItemSubCategory', null);
    setValue('ItemID', null);
    setValue('PRQty', '');
    setValue('RemainingQty', '');
    setValue('PRUnitPrice', '');
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
    if (row?.POQty === 0) {
      enqueueSnackbar('PO Qty is required', { variant: 'error' });
      return;
    }

    const selected = selectedRows.some((r) => r.PRDetailID === row.PRDetailID)
      ? selectedRows.filter((r) => r.PRDetailID !== row.PRDetailID)
      : [...selectedRows, row];

    setSelectedRows(selected);
  };

  const calculateTotalAmount = () =>
    detailList.reduce((total, item) => {
      const itemTotal = item.RemainingQty * item.PRUnitPrice;
      return total + (item.PRCurrencyID === 8 ? itemTotal : itemTotal * USDtoBDT);
    }, 0);

  const TotalConsumed = budgetAmount.ConsumedAmt + calculateTotalAmount();

  const selectedPR = watch('PRRequestID');
  const selectedPRRequestIDs = useMemo(() => selectedPR.map((x) => x.PRRequestID), [selectedPR]);

  useEffect(() => {
    const fetch = async () => {
      const res = await Get(`GetItemByPRIDs?prIds=${selectedPRRequestIDs}`);

      // Transform the PR items data
      const prItems = res?.data?.map((x) => ({
        PRDetailID: x.PRDetailID,
        PRDTLID: x.PRDetailID, // Assuming PRDetailID from PR is the same as PRDTLID in PO
        PR_ID: x.PR_ID,
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
          ItemID: x.ItemID,
          ItemCode: x.Itemcode,
        },
        PRItemDescription: x.PRItemDescription,
        PRQty: x.PRQTY,
        RemainingQty: x.RemainingQty,
        PRUOMID: { UOM_ID: x.UOMID, UOMName: x.UOMName },
        PRUnitPrice: x.PRUnitPrice,
        PRCurrencyID: { Currency_ID: x.Currency_ID, Currency_Name: x.Currency_Name },
        NeededByDate: x.NeededByDate,
        Remarks: x.Remarks,
        // Default values for PO-specific fields
        POQty: 0,
        POUnitPrice: 0,
        PODeliveryDate: null,
        POPurchaseType: null,
      }));

      // If we're in edit mode, merge with currentData details
      if (currentData && currentData.Details) {
        // Create a map of PO details by PRDTLID for easy lookup
        const poDetailsMap = {};
        currentData.Details.forEach((detail) => {
          poDetailsMap[detail.PRDTLID] = detail;
        });

        // Merge PR items with PO details
        const mergedDetails = prItems.map((prItem) => {
          const poDetail = poDetailsMap[prItem.PRDetailID];
          if (poDetail) {
            // If there's a matching PO detail, update the PO-specific fields
            return {
              ...prItem,
              PODTLID: poDetail.PODTLID, // Preserve the PO Detail ID
              POQty: poDetail.POQty,
              POUnitPrice: poDetail.POUnitPrice,
              PODeliveryDate: new Date(poDetail?.PODeliveryDate || poDetail?.DeliveryDate),
              POPurchaseType:
                poPurchaseTypes.find((pt) => pt.POPurchaseTypeID === poDetail.POPurchaseTypeID) ||
                null,
              // Keep other PO-specific fields if needed
            };
          }
          // If no matching PO detail, return the PR item as-is
          return prItem;
        });
        setDetailList(mergedDetails);

        // Set selected rows to only those that have PO details (were part of the original PO)
        const selectedItems = mergedDetails.filter((item) => poDetailsMap[item.PRDetailID]);
        setSelectedRows(selectedItems);
      } else {
        // If not in edit mode, just set the PR items
        setDetailList(prItems);
        setSelectedRows([]);
      }
    };

    if (selectedPRRequestIDs.length > 0) {
      fetch();
      // eslint-disable-next-line
    } else {
      // Only clear if not in edit mode
      // if (!currentData) {
      setDetailList([]);
      setSelectedRows([]);
      // }
    }
  }, [selectedPRRequestIDs, currentData, poPurchaseTypes]);

  const PostMeansOfTransport = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Means of Transport', { variant: 'error' });
      return;
    }
    const newOptionTrimmed = newOption.trim().toLowerCase();
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
    const newOptionTrimmed = newOption.trim().toLowerCase();
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
    const newOptionTrimmed = newOption.trim().toLowerCase();
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
    const newOptionTrimmed = newOption.trim().toLowerCase();
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
    const newOptionTrimmed = newOption.trim().toLowerCase();
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

  // Update the onSubmit function for editing:
  // const onSubmit = handleSubmit(async (data) => {
  //   if (selectedRows.length === 0) {
  //     enqueueSnackbar('Please select at least one item', { variant: 'error' });
  //     return;
  //   }

  //   try {
  //     const dataToSend = {
  //       POID: currentData?.POID, // Add PO ID for update
  //       PRID: 1,
  //       PODate: formatDate(new Date(data.PODate)),
  //       VendorID: data.VendorName?.VendorID || 0,
  //       LocationID: data?.Store?.StoreID || 0,
  //       SourceID: data?.Source?.POpurposeID || 0,
  //       PaymentTermID: data?.PaymentTerms?.Payment_term_ID || 0,
  //       MOTID: data?.MeansOfTransport?.MOTID || 0,
  //       Remarks: data?.Remarks || '',
  //       Org_ID: userData?.userDetails?.orgId,
  //       Branch_ID: userData?.userDetails?.branchID,
  //       UpdatedBy: userData?.userDetails?.userId, // Use UpdatedBy for edit
  //       Details: selectedRows.map((detail) => {
  //         const poQty = detail.POQty || detail.PRQty;
  //         const poUnitPrice = detail.POUnitPrice || detail.PRUnitPrice;
  //         const itemTotal =
  //           values.PRCurrencyID?.Currency_ID === 8
  //             ? poQty * poUnitPrice
  //             : poQty * poUnitPrice * USDtoBDT || 0;
  //         return {
  //           POID: currentData?.POID, // Add PO ID for update
  //           PRDTLID: detail.PRDTLID, // Use existing detail ID if available
  //           PRID: detail.PR_ID || 0,
  //           POInvTypeID: detail.PRINVTypeID?.ClassID,
  //           POCategoryID: detail.PRCategoryID?.Inv_Cat_ID,
  //           POSubCategoryID: detail.PRSubCatID?.SubCat_ID,
  //           ItemID: detail.ItemID?.ItemID,
  //           Specification: detail.ItemID?.Specification || detail.PRItemDescription || 'N/A',
  //           POQty: poQty,
  //           POPurchaseTypeID: detail.POPurchaseType?.POPurchaseTypeID || null,
  //           POUOMID: detail.PRUOMID?.UOM_ID,
  //           POUnitPrice: poUnitPrice,
  //           POCurrencyID: detail.PRCurrencyID?.Currency_ID,
  //           POTotalAmount: itemTotal,
  //           PODeliveryDate: formatDate(new Date(detail.PODeliveryDate || detail.NeededByDate)),
  //           Remarks: detail.Remarks || '',
  //         };
  //       }),
  //     };

  //     // Use update endpoint instead of create
  //     const response = await Post(`UpdatePurchaseOrder`, dataToSend);
  //     if (response.status === 200) {
  //       enqueueSnackbar('Purchase Order updated successfully!', { variant: 'success' });
  //       reset();
  //       setDetailList([]);
  //       router.push(paths.dashboard.procurement.po.root);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     enqueueSnackbar('Failed to update Purchase Order', { variant: 'error' });
  //   }
  // });
  const onSubmit = handleSubmit(async (data) => {
    if (selectedRows.length === 0) {
      enqueueSnackbar('Please select at least one item', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        POID: currentData?.POID, // Add PO ID for update
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
        UpdatedBy: userData?.userDetails?.userId, // Use UpdatedBy for edit
        Details: selectedRows.map((detail) => {
          const poQty = detail.POQty || detail.PRQty;
          const poUnitPrice = detail.POUnitPrice || detail.PRUnitPrice;
          const itemTotal =
            detail.PRCurrencyID?.Currency_ID === 8
              ? poQty * poUnitPrice
              : poQty * poUnitPrice * USDtoBDT || 0;

          return {
            PODTLID: detail.PODTLID || 0, // Use existing PODTLID if available, otherwise 0 for new items
            POPurchaseTypeID: detail.POPurchaseType?.POPurchaseTypeID || null,
            PRID: detail.PR_ID || 0,
            PRDTLID: detail.PRDTLID, // Use existing detail ID if available
            POInvTypeID: detail.PRINVTypeID?.ClassID,
            POCategoryID: detail.PRCategoryID?.Inv_Cat_ID,
            POSubCategoryID: detail.PRSubCatID?.SubCat_ID,
            POCurrencyID: detail.PRCurrencyID?.Currency_ID,
            ItemID: detail.ItemID?.ItemID,
            Specification: detail.ItemID?.Specification || detail.PRItemDescription || 'N/A',
            POQty: poQty,
            POUOMID: detail.PRUOMID?.UOM_ID,
            POUnitPrice: poUnitPrice,
            POTotalAmount: itemTotal,
            PODeliveryDate: formatDate(new Date(detail.PODeliveryDate || detail.NeededByDate)),
            Remarks: detail.Remarks || '',
          };
        }),
      };
      console.log('dataToSend', dataToSend);
      // Use the new update endpoint
      const response = await Put(`purchaseorder/update`, dataToSend);
      if (response.status === 200) {
        enqueueSnackbar('Purchase Order updated successfully!', { variant: 'success' });
        reset();
        setDetailList([]);
        router.push(paths.dashboard.procurement.po.root);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to update Purchase Order', { variant: 'error' });
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
    { id: 'PRQty', label: 'PR Qty', minWidth: 100, align: 'right' },
    { id: 'RemainingQty', label: 'Remaining Qty', minWidth: 130, align: 'right' },
    { id: 'POQty', label: 'PO Qty', minWidth: 140, align: 'right' },
    { id: 'PRUnitPrice', label: 'PR Unit Price', minWidth: 120, align: 'right' },
    { id: 'POUnitPrice', label: 'PO Unit Price', minWidth: 140, align: 'right' },
    { id: 'TotalAmount', label: 'Total Amount', minWidth: 150, align: 'right' },
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
              <RHFAutocomplete
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
                isOptionEqualToValue={(option, value) => option?.POpurposeID === value?.POpurposeID}
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

              <RHFTextField
                name="Remarks"
                label="Remarks"
                sx={{ gridColumn: { sm: ' span 1', md: 'span 3' } }}
              />
            </Box>
          </Card>
          {detailList.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Items List
                </Typography>
                <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
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
                        onSort={table.onSort}
                        orderBy={table.orderBy}
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
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              Update Purchase Order
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

PoEditForm.propTypes = {
  currentData: PropTypes.object,
};
