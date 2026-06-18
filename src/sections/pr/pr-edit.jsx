import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  IconButton,
  InputAdornment,
  Paper,
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

import { enqueueSnackbar, useSnackbar } from 'src/components/snackbar';
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
import { TableEmptyRows, TableHeadCustom, TableNoData } from 'src/components/table';
import Scrollbar from 'src/components/scrollbar';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import AddinvCategoryDialog from 'src/sections/inv-category/AddDialog';
import AddSubCategory from 'src/sections/inventoryType/AddDialog';
import BudgetProgressBar from './BudgetProgressBar';
import PropTypes from 'prop-types';

export default function PrEditForm({ currentData }) {
  const router = useRouter();
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

  const [allPriorities, setAllPriorities] = useState([]);
  const [allPurchaseTypes, setAllPurchaseTypes] = useState([]);
  const [allClassName, setallClassName] = useState([]);
  const [allCategoryData, setallCategoryData] = useState([]);
  const [allVendorsbyTypeID, setAllVendorsbyTypeID] = useState([]);
  const [itemSubCategory, setItemSubCategory] = useState([]);
  const [allItemUnit, setallItemUnit] = useState([]);
  const [allCurrencies, setallCurrencies] = useState([]);
  const [allInvSpare, setallInvSpare] = useState([]);
  const [allColorFamily, setAllColorFamily] = useState([]);
  const [allColors, setallColors] = useState([]);
  const [allCounts, setAllCounts] = useState([]);
  const [allCompositions, setAllCompositions] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [ItemOpen, setItemOpen] = useState([]);
  const [scopeOfWork, setScopeOfWork] = useState([]);
  const [allProductionOrderMaster, setAllProductionOrderMaster] = useState([]);
  const [allProdItem, setAllProdItem] = useState([]);
  const [mrpOptions, setMrpOptions] = useState([]);

  const [allBdgMonths, setAllBdgMonths] = useState([]);
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
  const [allDepartments, setAllDepartments] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpenSub, setDialogOpenSub] = useState(false);

  const NewYarnSetupSchema = Yup.object().shape({
    Priority: Yup.object().required('Priority is required'),
    PurchaseType: Yup.object().required('Purchase Type is required'),
    PRRequestDate: Yup.date().required('Request Date is required'),
    // PRUOMID: Yup.object().required('Unit Of Measure is required'),
  });

  const DetailSchema = Yup.object().shape({
    PRINVTypeID: Yup.number().required('Item Type is required'),
    PRCategoryID: Yup.number().required('Category is required'),
    PRSubCatID: Yup.number().required('Sub Category is required'),
    ItemOpen: Yup.number().required('Item is required'),
    PRItemDescription: Yup.string().required('Item Description is required'),
    // Vendor: Yup.object().required('Vendor is required'),
    PRQty: Yup.number()
      .required('Quantity is required')
      .min(0.01, 'Quantity must be greater than 0'),
    PRUOMID: Yup.number().required('UOM is required'),
    PRUnitPrice: Yup.number()
      .required('Unit Price is required')
      .min(0.01, 'Price must be greater than 0'),
    PRCurrencyID: Yup.number().required('Currency is required'),
    NeededByDate: Yup.date().required('Needed By Date is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewYarnSetupSchema),
    // defaultValues: {
    //   Priority: null,
    //   PurchaseType: null,
    //   PRRequestDate: new Date(),
    //   DetailList: [],
    // },
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

  const FetchMrp = useCallback(async () => {
    try {
      const response = await Get(
        `Production/GetMRPDropdown?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setMrpOptions(response.data?.Data || []);
    } catch (error) {
      console.log(error);
      setMrpOptions([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // MRP Details
  const selectedMrp = watch('MRP');
  const GetMrpDetails = useCallback(async () => {
    try {
      const response = await Get(`Production/GetMRPDetails?MRPID=${selectedMrp?.MRPID}`);
      const data = response.data?.Data.map((x) => ({
        ...x,
        CodeAndDescription: `[${x?.Item_Code}]  ${x?.Description}`,
      }));
      setAllProdItem(data || []);
    } catch (error) {
      console.log(error);
    }
  }, [selectedMrp?.MRPID]);

  useEffect(() => {
    if (selectedMrp?.MRPID) {
      GetMrpDetails();
    }
  }, [selectedMrp?.MRPID, GetMrpDetails]);

  const defaultValues = useMemo(
    () => ({
      ClassID: allClassName.find((x) => x.ClassID === currentData?.PRINVTypeID?.ClassID),
      PRCurrencyID: allCurrencies.find(
        (x) => x.Currency_ID === currentData?.PRCurrencyID?.Currency_ID
      ),
      Priority: allPriorities.find((x) => x.PRPriorityID === currentData?.PriorityID),
      PurchaseType: allPurchaseTypes.find((x) => x.PurchaseTypeID === currentData?.PurchaseTypeID),
      Dpt_ID: allDepartments.find((x) => x.Dpt_ID === currentData?.DptID),
      PRRequestDate: new Date(currentData?.PRRequestDate),
      // BudgetMonth: allBdgMonths.find((x) => x.BudgetMonth),
      // DetailList: currentData?.Details || [],
    }),
    [currentData, allPriorities, allClassName, allCurrencies, allPurchaseTypes, allDepartments]
  );

  useEffect(() => {
    if (!isLoading && currentData && Object.keys(defaultValues).length > 0) {
      methods.reset(defaultValues);

      // Transform details to include MRP properly
      const transformedDetails = (currentData?.Details || []).map((detail) => ({
        ...detail,
        MRP: detail.MRPID ? { MRPID: detail.MRPID, MRPNo: detail.MRPNo } : null,
        ProductionOrderItem: detail.PDOItemID ? { ItemID: detail.PDOItemID } : null,
        PRINVTypeID: detail.ClassID
          ? { ClassID: detail.ClassID, ClassName: detail.ClassName }
          : null,
        PRCategoryID: detail.Inv_Cat_ID
          ? { Inv_Cat_ID: detail.Inv_Cat_ID, Inv_Cat_Name: detail.Inv_Cat_Name }
          : null,
        PRSubCatID: detail.SubCat_ID
          ? { SubCat_ID: detail.SubCat_ID, SubCat_Name: detail.SubCat_Name }
          : null,
        ItemOpen: detail.ItemID ? { ItemID: detail.ItemID, ItemCode: detail.Itemcode } : null,
        Color: detail.ColorID
          ? { ColorID: detail.ColorID, Color_and_Code: detail.Color_and_Code }
          : null,
        ScopeofWork: detail.ScopeID
          ? { ScopeID: detail.ScopeID, ScopeName: detail.ScopeName }
          : null,
        PRUOMID: detail.UOMID ? { UOM_ID: detail.UOMID, UOMName: detail.UOMName } : null,
        PRCurrencyID: detail.Currency_ID
          ? { Currency_ID: detail.Currency_ID, Currency_Name: detail.Currency_Name }
          : null,
        PRQty: detail.PRQTY,
      }));

      setDetailList(transformedDetails);
    }
  }, [isLoading, defaultValues, methods, currentData]);

  useEffect(() => {
    if (
      !isLoading &&
      currentData &&
      Object.keys(defaultValues).length > 0 &&
      allBdgMonths.length > 0
    ) {
      setValue(
        'BudgetMonth',
        // eslint-disable-next-line
        allBdgMonths.find((x) => x.month == currentData?.BudgetMonth) || null
      );
    }
  }, [currentData, allBdgMonths, isLoading, defaultValues, methods, setValue]);

  const generateProductName = () => {
    const productCode = `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${
      values?.Yarn_Count_ID?.Yarn_Count_Name || ''
    } -  ${values?.Composition_ID?.Composition_Name || ''}  (${values?.Color?.ColorName || ''} - ${
      values?.Color?.Color_Code || ''
    })`;
    return productCode;
  };

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

  // convert month from Number to text
  const convertMonthNumToText = (number) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[number - 1];
  };

  const GetMonths = useCallback(async () => {
    try {
      const response = await Get(`getBudgetedMonthByTypeID?InvTypeID=${selectedClassId?.ClassID}`);
      const updatedData = response.data.map((x, index) => ({
        monthID: index + 1,
        month: x.Month,
        monthLabel: convertMonthNumToText(x.Month),
      }));
      setAllBdgMonths(updatedData);
    } catch (error) {
      setAllBdgMonths([]);
      console.log(error);
    }
  }, [selectedClassId?.ClassID]);

  const selectedBudgetMonth = watch('BudgetMonth');
  const GetBudgetAmount = useCallback(async () => {
    if (selectedClassId?.ClassID) {
      try {
        const response = await Get(
          `GetBudgetAmount?pRINVTypeID=${selectedClassId?.ClassID}&month=${
            selectedBudgetMonth?.month
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
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    selectedClassId?.ClassID,
    selectedBudgetMonth?.month,
  ]);

  const DontshowMaterialColorField = selectedClassId?.isColorSensitive;

  const selectedCategory = watch('Category');
  const selectedColor = watch('Color');
  const selectedSpare = watch('InvSpare');
  const selectedSubCategory = watch('ItemSubCategory');

  const FetchDepartment = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllActiveInactiveDpt?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const decryptedData = response.data.Departments.map((item) => ({
        ...item,
        isActive: item?.isActive === true ? 'Active' : 'Inactive',
      }));

      setAllDepartments(decryptedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetScopeOfWork = useCallback(async () => {
    try {
      const response = await Get(
        `getallscope?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setScopeOfWork(response.data.Data || []);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetColors = useCallback(async () => {
    try {
      const response = await Get(
        `GetColorsBySubCatFromItemDB?subCatId=${selectedSubCategory?.SubCat_ID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setallColors(response.data.data);
    } catch (error) {
      console.log(error);
      setallColors([]);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    selectedSubCategory?.SubCat_ID,
  ]);

  const FetchAllSpareByClassID = useCallback(async () => {
    if (selectedSubCategory?.SubCat_ID) {
      try {
        const response = await Get(
          `GetSpareBySubcateID?SubcatID=${selectedSubCategory?.SubCat_ID}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
        );
        setallInvSpare(response.data || []);
      } catch (error) {
        console.error(error);
        setallInvSpare([]);
      }
    } else {
      setallInvSpare([]);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    selectedSubCategory?.SubCat_ID,
  ]);

  const GetProductionOrderMasterList = useCallback(async () => {
    try {
      const response = await Get(
        `Production/GetProductionOrderMasterList?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setAllProductionOrderMaster(response.data.Data || []);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);
  useEffect(() => {
    const fetchData = async () => {
      fetchExchangeRate();
      await Promise.all([
        GetAllPriorities(),
        GetAllPurchaseTypes(),
        AllClassNameData(),
        fetchAllUOM(),
        fetchAllCurrencies(),
        GetBudgetAmount(),
        FetchDepartment(),
        GetScopeOfWork(),
        GetProductionOrderMasterList(),
        FetchMrp(),
      ]);
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetchExchangeRate,
    GetAllPriorities,
    GetAllPurchaseTypes,
    AllClassNameData,
    fetchAllUOM,
    fetchAllCurrencies,
    GetBudgetAmount,
    GetScopeOfWork,
    GetProductionOrderMasterList,
    FetchDepartment,
    FetchMrp,
  ]);

  const FetchAllCategoryandVendors = useCallback(async () => {
    if (selectedClassId?.ClassID) {
      try {
        const response = await Get(
          `InvCategoryGetByClassId?classId=${selectedClassId?.ClassID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        // console.log('Category Response:', response.data);
        setallCategoryData(response.data || []);
        // const res = await Get(`getVendorsByTypeID?InvTypeID=${selectedClassId?.ClassID}`);
        // // console.log('Category Response:', response.data);
        // setAllVendorsbyTypeID(res.data || []);
      } catch (error) {
        console.error(error);
        setallCategoryData([]);
        setAllVendorsbyTypeID([]);
      }
    } else {
      setallCategoryData([]);
      setAllVendorsbyTypeID([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, selectedClassId?.ClassID]);

  useEffect(() => {
    FetchAllCategoryandVendors();
    GetMonths();
    setValue('BudgetMonth', null);
    setValue('Category', null);
    setValue('Vendor');
    setValue('InvSpare', null);
  }, [selectedClassId?.ClassID, GetMonths, FetchAllCategoryandVendors, setValue]);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    FetchAllCategoryandVendors();
    setDialogOpen(false);
  };

  //  dailog function

  const handleSubCategoryOpen = () => {
    setDialogOpenSub(true);
  };

  const handleSubDialogClose = () => {
    fetchSubCategory();
    setDialogOpenSub(false);
  };

  const selectedProductItem = watch('ProductionOrderItem');

  useEffect(() => {
    if (selectedProductItem) {
      console.log(
        'selectedProductItem',
        allItemUnit.find((x) => x.UOMName === selectedProductItem?.Unit)
      );
      setValue('PRItemDescription', selectedProductItem?.Description || '');
      setValue('PRUOMID', allItemUnit.find((x) => x.UOMName === selectedProductItem?.Unit) || null);
    }
    // eslint-disable-next-line
  }, [selectedProductItem]);

  const fetchSubCategory = useCallback(async () => {
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
  }, [selectedCategory]);

  useEffect(() => {
    fetchSubCategory();
    setValue('ItemSubCategory', null);
    setValue('InvSpare', null);
    setValue('Color', null);
    // eslint-disable-next-line
  }, [selectedCategory, fetchSubCategory]);

  useEffect(() => {
    // fetchItemsBySubCategory();
    if (selectedSubCategory?.SubCat_ID && selectedClassId?.isColorSensitive === true) {
      GetColors();
    } else {
      FetchAllSpareByClassID();
    }
    if (editingIndex === null) {
      setValue('ItemOpen', null);
      setValue('Color', null);
      setValue('InvSpare', null);
    }
    // eslint-disable-next-line
  }, [selectedSubCategory, FetchAllSpareByClassID, GetColors, editingIndex, selectedClassId]);

  const fetchItemsBySubCategory = useCallback(async () => {
    console.log('Fetching items with:', {
      selectedSubCategory: selectedSubCategory?.SubCat_ID,
      selectedColor: selectedColor?.ColorID,
      selectedSpare: selectedSpare?.SpareID,
      isColorSensitive: selectedClassId?.isColorSensitive,
    });

    if (!selectedSubCategory?.SubCat_ID) {
      setItemOpen([]);
      return;
    }

    try {
      let response;

      if (selectedClassId?.isColorSensitive === true && selectedColor?.ColorID) {
        response = await Get(
          `GetItemsByColor?colorId=${selectedColor?.ColorID}&subCatID=${selectedSubCategory?.SubCat_ID}`
        );
      } else if (selectedClassId?.isColorSensitive === false && selectedSpare?.SpareID) {
        response = await Get(
          `GetItemsBySpareID?spareId=${selectedSpare?.SpareID}&subCatID=${selectedSubCategory?.SubCat_ID}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
        );
      } else {
        setItemOpen([]);
        return;
      }

      const updatedData = response?.data?.map((item) => ({
        ...item,
        ClassID: item?.invTypesID,
        CodeAndDescription: `[${item?.ItemCode}]  ${item?.ItemDescription}`,
        UOM: { UOMName: item?.UOMName || item?.UOMNAME, UOM_ID: item?.UOMID },
      }));

      console.log('Fetched items:', updatedData);
      setItemOpen(updatedData || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItemOpen([]);
    }
  }, [selectedSubCategory, selectedColor, selectedSpare, selectedClassId, userData?.userDetails]);

  useEffect(() => {
    fetchItemsBySubCategory();
    // eslint-disable-next-line
  }, [fetchItemsBySubCategory, selectedColor, selectedSpare]);

  const selectedItem = watch('ItemOpen');

  useEffect(() => {
    setValue('PRUOMID', selectedItem?.UOM || null);
    //   setValue('ItemDescription', selectedItem?.ItemDescription || '');
    //   setValue(
    //     'ColorFamily',
    //     allColorFamily.find((item) => item.ColorFamilyID === selectedItem?.ColorFamilyID) || null
    //   );
    //   setValue('Color', allColors.find((item) => item.ColorID === selectedItem?.ColorID) || null);
    //   setValue('SafetyQuantity', selectedItem?.SafetyStockQty || 0);
    //   setValue('ReorderQuantity', selectedItem?.ReOrderQty || 0);

    //   if (selectedItem?.ClassID === 6) {
    //     setValue(
    //       'Yarn_Type_ID',
    //       allTypes.find((x) => x.Yarn_Type_ID === selectedItem?.YarnTypeID) || null
    //     );
    //     setValue(
    //       'Yarn_Count_ID',
    //       allCounts.find((x) => x.Yarn_Count_ID === selectedItem?.YarnCountID) || null
    //     );
    //     setValue(
    //       'Composition_ID',
    //       allCompositions.find((x) => x.Composition_ID === selectedItem?.YarnCompositionID) || null
    //     );
    //   } else {
    //     setValue('Yarn_Type_ID', null);
    //     setValue('Yarn_Count_ID', null);
    //     setValue('Composition_ID', null);
    //   }
    setValue('PRItemDescription', selectedItem?.ItemDescription || '');
  }, [selectedItem, setValue]);

  const resetDetailForm = () => {
    // setValue('ClassID', null);
    setValue('Category', null);
    setValue('MRP', null);
    setValue('ItemSubCategory', null);
    setValue('Color', null);
    setValue('ItemOpen', null);
    setValue('MRP', null);
    setValue('ProductionOrderItem', null);
    setValue('ScopeofWork', null);
    setValue('PRQty', '');
    setValue('Vendor', null);
    setValue('InvSpare', null);
    setValue('PRUnitPrice', '');
    // setValue('PRCurrencyID', null);
    // setValue('NeededByDate', null);
    setValue('Remarks', '');
    // setBudgetAmount({
    //   BudgetAmtinBDT: 0,
    //   BudgetAmtinUSD: 0,
    //   ConsumedAmt: 0,
    // });
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

  const handleEditDetail = async (index) => {
    const detail = detailList[index];

    // Reset form first
    resetDetailForm();
    setEditingIndex(index);

    // Short delay to ensure reset completes
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (values?.PurchaseType?.PurchaseTypeID === 2) {
      // Handle MRP/Production Order flow for Referenced purchase type

      // Set MRP if it exists
      if (detail?.MRP?.MRPID) {
        const mrp = mrpOptions.find((x) => x.MRPID === detail.MRP.MRPID);
        if (mrp) {
          setValue('MRP', mrp);

          // Fetch MRP details and wait for them to load
          try {
            const response = await Get(`Production/GetMRPDetails?MRPID=${detail.MRP.MRPID}`);
            const data = response.data?.Data.map((x) => ({
              ...x,
              CodeAndDescription: `[${x?.Item_Code}]  ${x?.Description}`,
            }));
            setAllProdItem(data || []);

            // Wait for data to be set
            await new Promise((resolve) => setTimeout(resolve, 200));

            // Set ProductionOrderItem after data is loaded
            if (detail?.ProductionOrderItem?.ItemID) {
              const prodItem = data.find((x) => x.ItemID === detail.ProductionOrderItem.ItemID);
              if (prodItem) {
                console.log('Setting ProductionOrderItem:', prodItem);
                setValue('ProductionOrderItem', prodItem);
              } else if (detail.ProductionOrderItem) {
                // Fallback to the original object
                setValue('ProductionOrderItem', detail.ProductionOrderItem);
              }
            }
          } catch (error) {
            console.error('Error fetching MRP details:', error);
          }
        }
      }

      // Set other fields
      if (detail?.PRItemDescription) {
        setValue('PRItemDescription', detail.PRItemDescription);
      }
    } else {
      // Handle regular item flow
      console.log('Editing regular item');

      // Set ClassID
      if (detail?.PRINVTypeID?.ClassID) {
        const classObj = allClassName.find((x) => x.ClassID === detail.PRINVTypeID.ClassID);
        if (classObj) {
          console.log('Setting ClassID:', classObj);
          setValue('ClassID', classObj);

          // Fetch categories for this class
          await FetchAllCategoryandVendors();
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      // Set Category
      if (detail?.PRCategoryID?.Inv_Cat_ID) {
        const category = allCategoryData.find(
          (x) => x.Inv_Cat_ID === detail.PRCategoryID.Inv_Cat_ID
        );
        if (category) {
          console.log('Setting Category:', category);
          setValue('Category', category);

          // Fetch subcategories
          try {
            const response = await Get(
              `GetSubCategoriesByCategoryID/${detail.PRCategoryID.Inv_Cat_ID}`
            );
            setItemSubCategory(response.data.data || []);
            await new Promise((resolve) => setTimeout(resolve, 200));
          } catch (error) {
            console.error('Error fetching subcategories:', error);
          }
        }
      }

      // Set SubCategory
      if (detail?.PRSubCatID?.SubCat_ID) {
        const subCat = itemSubCategory.find((x) => x.SubCat_ID === detail.PRSubCatID.SubCat_ID);
        if (subCat) {
          console.log('Setting SubCategory:', subCat);
          setValue('ItemSubCategory', subCat);

          // Fetch colors or spare based on class type
          const isColorSensitive =
            detail?.PRINVTypeID?.isColorSensitive || values?.ClassID?.isColorSensitive;

          if (isColorSensitive === true) {
            try {
              const colorsResponse = await Get(
                `GetColorsBySubCatFromItemDB?subCatId=${detail.PRSubCatID.SubCat_ID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
              );
              setallColors(colorsResponse.data.data || []);
              await new Promise((resolve) => setTimeout(resolve, 200));
            } catch (error) {
              console.error('Error fetching colors:', error);
            }
          } else {
            try {
              const spareResponse = await Get(
                `GetSpareBySubcateID?SubcatID=${detail.PRSubCatID.SubCat_ID}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
              );
              setallInvSpare(spareResponse.data || []);
              await new Promise((resolve) => setTimeout(resolve, 200));
            } catch (error) {
              console.error('Error fetching spare:', error);
            }
          }
        }
      }

      // Set Color or InvSpare
      if (detail?.Color?.ColorID) {
        const color = allColors.find((x) => x.ColorID === detail.Color.ColorID);
        if (color) {
          console.log('Setting Color:', color);
          setValue('Color', color);
        }
      } else if (detail?.InvSpare?.SpareID) {
        const spare = allInvSpare.find((x) => x.SpareID === detail.InvSpare.SpareID);
        if (spare) {
          console.log('Setting InvSpare:', spare);
          setValue('InvSpare', spare);
        }
      }

      // Fetch and set items
      await fetchItemsBySubCategory();
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Set Item
      if (detail?.ItemOpen?.ItemID) {
        const item = ItemOpen.find((x) => x.ItemID === detail.ItemOpen.ItemID);
        if (item) {
          console.log('Setting ItemOpen:', item);
          setValue('ItemOpen', item);
        }
      }

      // Set Item Description
      if (detail?.PRItemDescription) {
        setValue('PRItemDescription', detail.PRItemDescription);
      }
    }

    // Set common fields for both purchase types

    // Set Scope of Work
    if (detail?.ScopeofWork?.ScopeID) {
      const scope = scopeOfWork.find((x) => x.ScopeID === detail.ScopeofWork.ScopeID);
      if (scope) {
        setValue('ScopeofWork', scope);
      }
    }

    // Set Quantity
    if (detail?.PRQty !== undefined) {
      setValue('PRQty', detail.PRQty);
    }

    // Set UOM
    if (detail?.PRUOMID?.UOM_ID) {
      const uom = allItemUnit.find((x) => x.UOM_ID === detail.PRUOMID.UOM_ID);
      if (uom) {
        setValue('PRUOMID', uom);
      }
    }

    // Set Unit Price
    if (detail?.PRUnitPrice !== undefined) {
      setValue('PRUnitPrice', detail.PRUnitPrice);
    }

    // Set Currency
    if (detail?.PRCurrencyID?.Currency_ID) {
      const currency = allCurrencies.find((x) => x.Currency_ID === detail.PRCurrencyID.Currency_ID);
      if (currency) {
        setValue('PRCurrencyID', currency);
      }
    }

    // Set Remarks
    if (detail?.Remarks !== undefined) {
      setValue('Remarks', detail.Remarks);
    }

    console.log('Edit form values after setting:', methods.getValues());
  };

  const itemTotal =
    values.PRCurrencyID?.Currency_ID === 8
      ? values.PRQty * values.PRUnitPrice
      : values.PRQty * values.PRUnitPrice * USDtoBDT || 0;

  const TotalConsumed = itemTotal ? budgetAmount.ConsumedAmt + itemTotal : budgetAmount.ConsumedAmt;

  const handleAddDetail = () => {
    // if (TotalConsumed > budgetAmount.BudgetAmtinBDT) {
    //   enqueueSnackbar('Total Consumed Amount exceeds Budget Amount', { variant: 'error' });
    //   return;
    // }
    try {
      // Validate required fields
      if (!values?.PurchaseType?.PurchaseTypeID) throw new Error('Purchase Type is required');
      if (values?.PurchaseType?.PurchaseTypeID !== 2 && !values.ClassID)
        throw new Error('Item Type is required');
      if (values?.ClassID?.isColorSensitive === true) {
        if (values?.PurchaseType?.PurchaseTypeID !== 2 && !values.Category)
          throw new Error('Category is required');
        if (values?.PurchaseType?.PurchaseTypeID !== 2 && !values.ItemSubCategory)
          throw new Error('Sub Category is required');
        if (values?.PurchaseType?.PurchaseTypeID !== 2 && !values.Color)
          throw new Error('Color is required');
      }
      if (values?.ClassID?.isColorSensitive === false && !values?.InvSpare) {
        throw new Error('Spare Name & Code is required');
      }
      if (values?.PurchaseType?.PurchaseTypeID !== 2 && !values.ItemOpen)
        throw new Error('Item is required');
      if (values?.PurchaseType?.PurchaseTypeID === 2 && !values?.MRP)
        throw new Error('MRP is required');
      if (values?.PurchaseType?.PurchaseTypeID === 2 && !values.ProductionOrderItem)
        throw new Error('Item is required');
      if (!values.ScopeofWork) throw new Error('Scope of Work is required');
      if (!values.PRQty || values.PRQty <= 0) throw new Error('Valid Quantity is required');
      // if (!values.PRUOMID) throw new Error('UOM is required');
      if (!values.PRUnitPrice || values.PRUnitPrice <= 0)
        throw new Error('Valid Unit Price is required');
      if (!values.PRCurrencyID) throw new Error('Currency is required');
      // if (!values.NeededByDate) throw new Error('Needed By Date is required');

      const detail = {
        MRP: values?.MRP || null,
        PRINVTypeID: values?.ClassID || null,
        PRCategoryID: values?.Category || null,
        PRSubCatID: values?.ItemSubCategory || null,
        Color: values?.Color || null,
        InvSpare: values?.InvSpare || null,
        ItemOpen: values?.ItemOpen || null,
        ProductionOrderItem: values?.ProductionOrderItem || null,
        ScopeofWork: values?.ScopeofWork,
        PRItemDescription: values.PRItemDescription || 'N/A',
        Vendor: values?.Vendor || null,
        PRQty: Number(values.PRQty),
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

  const handleAddPurchaseType = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Purchase Type', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (
      allPurchaseTypes.find(
        (option) => option.PurposeTypes.trim().toLowerCase() === newOptionTrimmed
      )
    ) {
      enqueueSnackbar('This Purchase Type already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        PurposeTypes: newOption,
        isActive: true,
        IsActive1: true,
        CreatedBy: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('addPurchasetype', dataToSend);
      GetAllPurchaseTypes();
      enqueueSnackbar('Purchase Type Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const PostSubCategory = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Subcategory Name', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (
      itemSubCategory.find((option) => option.SubCat_Name.trim().toLowerCase() === newOptionTrimmed)
    ) {
      enqueueSnackbar('This Subcategory already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        Inv_Cat_ID: values?.Inv_Cat_Name?.Inv_Cat_ID,
        SubCat_Name: newOption,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
        Created_By: userData?.userDetails?.userId,
        Is_Active: true,
        Is_Cancelled: false,
        Cancel_By: null,
        Cancel_On: null,
      };

      await Post('AddInvSubCategory', dataToSend);
      fetchSubCategory();
      enqueueSnackbar('Subcategory Added Successfully', { variant: 'success' });
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

      await Post('Addscope', dataToSend);
      GetScopeOfWork();
      enqueueSnackbar('Scope of Work Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (detailList.length === 0) {
      enqueueSnackbar('Please add at least one item', { variant: 'error' });
      return;
    }

    // if (TotalConsumed > budgetAmount.BudgetAmtinBDT) {
    //   enqueueSnackbar('Consumed Amount cannot exceed Budget Amount', { variant: 'error' });
    //   return;
    // }
    // BudgetMonth

    try {
      const dataToSend = {
        PRRequestID: currentData?.PRRequestID,
        PRCode: currentData?.PRCode,
        PurchaseTypeID: data?.PurchaseType?.PurchaseTypeID,
        PriorityID: data?.Priority?.PRPriorityID,
        PRRequestDate: formatDate(new Date(data.PRRequestDate)),
        BudgetMonth: data?.BudgetMonth?.month || 0,
        DptID: data?.Dpt_ID?.Dpt_ID,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
        UpdatedBy: userData?.userDetails?.userId,
        CreatedBy: currentData?.CreatedBy,
        CreatedDate: currentData?.CreatedDate,
        Level1_Approve: currentData?.Level1_Approve,
        Level2_Approve: currentData?.Level2_Approve,
        Level1_Approved_On: currentData?.Level1_Approved_On,
        Level2_Approved_On: currentData?.Level2_Approved_On,
        Level1_Approved_ID: currentData?.Level1_Approved_ID,
        Level2_Approved_ID: currentData?.Level2_Approved_ID,
        Level1_Approved_Remarks: currentData?.Level1_Approved_Remarks,
        Level2_Approved_Remarks: currentData?.Level2_Approved_Remarks,
        DetailList: detailList.map((detail) => ({
          PRDetailID: detail?.PRDetailID || 0,
          PRINVTypeID: data?.PurchaseType?.PurchaseTypeID !== 2 ? detail?.PRINVTypeID?.ClassID : 0,
          PRCategoryID:
            data?.PurchaseType?.PurchaseTypeID !== 2 ? detail?.PRCategoryID?.Inv_Cat_ID : 0,
          ColorID: data?.PurchaseType?.PurchaseTypeID !== 2 ? detail?.Color?.ColorID : 0,
          PRSubCatID: data?.PurchaseType?.PurchaseTypeID !== 2 ? detail?.PRSubCatID?.SubCat_ID : 0,
          SpareId: data?.PurchaseType?.PurchaseTypeID !== 2 ? detail?.InvSpare?.SpareID : 0,
          Item_ID: data?.PurchaseType?.PurchaseTypeID !== 2 ? detail?.ItemOpen?.ItemID : 0,
          PDOID: detail?.MRP?.MRPID || 0,
          PDOItemID: detail?.ProductionOrderItem?.ItemID || 0,
          ScopeID: detail?.ScopeofWork?.ScopeID,
          PRItemDescription: detail?.PRItemDescription || 'N/A',
          PRQTY: detail.PRQty,
          PRUnitPrice: detail.PRUnitPrice,
          UOMID: detail.PRUOMID?.UOM_ID,
          Currency_ID: detail.PRCurrencyID?.Currency_ID,
          CurrConsumedAmt: detail.CurrConsumedAmt,
          VendorID: detail.Vendor?.VendorID || 0,
          UpdatedBy: userData?.userDetails?.userId,
          // Remarks: detail.Remarks,
          // IsActive: true,
          // IsDeleted: false,
          // Org_ID: userData?.userDetails?.orgId,
          // Branch_ID: userData?.userDetails?.branchID,
          // CreatedBy: userData?.userDetails?.userId,
        })),
      };
      // console.log('Data to send: dekho', dataToSend);

      const response = await Put(`UpdatePurchaseRequest`, dataToSend);
      if (response.status === 200) {
        enqueueSnackbar('Purchase Request Updated successfully!', { variant: 'success' });
        reset();
        setDetailList([]);
        router.push(paths.dashboard.procurement.pr.root);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to Updated Purchase Request', { variant: 'error' });
    }
  });

  const DetailsTableHead =
    values?.PurchaseType?.PurchaseTypeID === 2
      ? [
          { id: 'MRP', label: 'MRP No.', minWidth: 200 },
          { id: 'ProductionOrderItem', label: 'Item Code', minWidth: 200 },
          { id: 'PRItemDescription', label: 'Item Description', minWidth: 200 },
          // { id: 'Vendor', label: 'Vendor', minWidth: 150 },
          { id: 'Quantity', label: 'Quantity', minWidth: 100, align: 'right' },
          // { id: 'UOM', label: 'UOM', minWidth: 100, align: 'center' },
          { id: 'UnitPrice', label: 'Unit Price', minWidth: 120, align: 'right' },
          // { id: 'Currency', label: 'Currency', minWidth: 100, align: 'center' },
          { id: 'TotalAmount', label: 'Total Amount', minWidth: 150, align: 'right' },
          // { id: 'NeededByDate', label: 'Needed By', minWidth: 150, align: 'center' },
          { id: 'Remarks', label: 'Remarks', minWidth: 200 },
          { id: 'Actions', label: 'Actions', minWidth: 120, align: 'center' },
        ]
      : [
          { id: 'InventoryType', label: 'Inv. Type', minWidth: 150 },
          { id: 'Category', label: 'Category', minWidth: 150 },
          { id: 'SubCategory', label: 'Sub Category', minWidth: 150 },
          { id: 'ItemOpen', label: 'Item Code', minWidth: 200 },
          { id: 'PRItemDescription', label: 'Item Description', minWidth: 200 },
          // { id: 'Vendor', label: 'Vendor', minWidth: 150 },
          { id: 'Quantity', label: 'Quantity', minWidth: 100, align: 'right' },
          // { id: 'UOM', label: 'UOM', minWidth: 100, align: 'center' },
          { id: 'UnitPrice', label: 'Unit Price', minWidth: 120, align: 'right' },
          // { id: 'Currency', label: 'Currency', minWidth: 100, align: 'center' },
          { id: 'TotalAmount', label: 'Total Amount', minWidth: 150, align: 'right' },
          // { id: 'NeededByDate', label: 'Needed By', minWidth: 150, align: 'center' },
          { id: 'Remarks', label: 'Remarks', minWidth: 200 },
          { id: 'Actions', label: 'Actions', minWidth: 120, align: 'center' },
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
                  name="Dpt_ID"
                  label="Requested Department"
                  placeholder="Choose an option"
                  fullWidth
                  options={allDepartments}
                  getOptionLabel={(option) => option?.Dpt_Name}
                  isOptionEqualToValue={(option, value) => option.Dpt_ID === value?.Dpt_ID}
                  value={values?.Dpt_ID || null}
                />
                <RHFAutocomplete
                  name="PRCurrencyID"
                  label="Currency"
                  options={allCurrencies}
                  getOptionLabel={(option) => option?.Currency_Code || ''}
                  isOptionEqualToValue={(option, value) =>
                    option.Currency_ID === value?.Currency_ID
                  }
                  value={values?.PRCurrencyID || null}
                  disabled
                />
                <Box />
                {/* <RHFAutocomplete
                  name="ClassID"
                  label="Budget Item Type"
                  placeholder="Choose an option"
                  fullWidth
                  options={allClassName}
                  getOptionLabel={(option) => option?.ClassName || ''}
                  isOptionEqualToValue={(option, value) => option?.ClassID === value?.ClassID}
                  value={values?.ClassID || null}
                  disabled={detailList.length > 0}
                />
                <RHFAutocomplete
                  name="BudgetMonth"
                  label="PR for Month of"
                  placeholder="Choose an option"
                  fullWidth
                  options={allBdgMonths}
                  getOptionLabel={(option) => option?.monthLabel || ''}
                  isOptionEqualToValue={(option, value) => option?.month === value?.month}
                  value={values?.BudgetMonth || null}
                  disabled={detailList.length > 0}
                />
                <BudgetProgressBar
                  budgetAmount={budgetAmount}
                  selectedCurrency={values?.PRCurrencyID?.Currency_Name}
                  TotalConsumed={TotalConsumed}
                /> */}

                <RHFAutocomplete
                  name="Priority"
                  label="Priority"
                  fullWidth
                  options={allPriorities}
                  getOptionLabel={(option) => option?.PRPriorities || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.PRPriorityID === value?.PRPriorityID
                  }
                  value={values?.Priority || null}
                />
                <AutocompleteWithAdd
                  name="PurchaseType"
                  label="Purchase Type"
                  fullWidth
                  options={allPurchaseTypes}
                  getOptionLabel={(option) => option?.PurposeTypes || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.PurchaseTypeID === value?.PurchaseTypeID
                  }
                  onAdd={handleAddPurchaseType}
                  disabled={detailList.length > 0}
                  // isAddDisabled={detailList.length > 0}
                  value={values?.PurchaseType || null}
                />
                <Controller
                  name="PRRequestDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Request Date"
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
                {/* <RHFAutocomplete
                  name="PRUOMID"
                  label="Unit of Measurement"
                  options={allItemUnit}
                  getOptionLabel={(option) => option?.UOMName || ''}
                  isOptionEqualToValue={(option, value) => option?.UOM_ID === value?.UOM_ID}
                  value={values?.PRUOMID || null}
                  disabled={detailList.length > 0}
                /> */}
              </Box>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Add Items
              </Typography>
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
                {values?.PurchaseType?.PurchaseTypeID === 2 ? (
                  <>
                    <RHFAutocomplete
                      name="MRP"
                      label="MRP No."
                      placeholder="Choose an option"
                      fullWidth
                      options={mrpOptions}
                      getOptionLabel={(option) => option?.MRPNo || ''}
                      isOptionEqualToValue={(option, value) => option?.MRPID === value?.MRPID}
                      value={values?.MRP || null}
                    />
                    <RHFAutocomplete
                      name="ProductionOrderItem"
                      label="Item"
                      placeholder="Choose an option"
                      fullWidth
                      sx={{ gridColumn: { sm: 'span 2', md: 'span 2' } }}
                      options={allProdItem}
                      getOptionLabel={(option) => option?.CodeAndDescription || ''}
                      isOptionEqualToValue={(option, value) => option.ItemID === value.ItemID}
                      value={values?.ProductionOrderItem || null}
                    />
                  </>
                ) : (
                  <>
                    <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ flexGrow: 1 }}>
                          <RHFAutocomplete
                            name="ClassID"
                            label="Item Type"
                            placeholder="Choose an option"
                            fullWidth
                            options={allClassName}
                            getOptionLabel={(option) => option?.ClassName || ''}
                            isOptionEqualToValue={(option, value) =>
                              option?.ClassID === value?.ClassID
                            }
                            value={values?.ClassID || null}
                            disabled={detailList.length > 0}
                          />
                        </Box>
                      </Stack>
                    </Box>

                    <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ flexGrow: 1 }}>
                          <RHFAutocomplete
                            name="Category"
                            label="Item Category"
                            placeholder="Choose an option"
                            fullWidth
                            options={allCategoryData}
                            getOptionLabel={(option) => option?.Inv_Cat_Name || ''}
                            isOptionEqualToValue={(option, value) =>
                              option.Inv_Cat_ID === value.Inv_Cat_ID
                            }
                            value={values?.Category || null}
                          />
                        </Box>

                        <Tooltip title="Add New Inventory Category" placement="top">
                          <IconButton color="primary" onClick={() => handleDialogOpen()}>
                            <Iconify icon="lets-icons:add-duotone" width={32} height={32} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                    <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ flexGrow: 1 }}>
                          <RHFAutocomplete
                            name="ItemSubCategory"
                            label="Item Sub Category"
                            placeholder="Choose an option"
                            fullWidth
                            options={itemSubCategory}
                            getOptionLabel={(option) => option?.SubCat_Name || ''}
                            isOptionEqualToValue={(option, value) =>
                              option?.SubCat_ID === value?.SubCat_ID
                            }
                            value={values?.ItemSubCategory || null}
                            isAddDisabled={!selectedCategory}
                            // onAdd={PostSubCategory}
                          />
                        </Box>

                        <Tooltip title="Add New Sub Category" placement="top">
                          <IconButton color="primary" onClick={() => handleSubCategoryOpen()}>
                            <Iconify icon="lets-icons:add-duotone" width={32} height={32} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                    {values?.ClassID?.isColorSensitive === true ? (
                      <>
                        <RHFAutocomplete
                          name="Color"
                          label="Color Name & Code"
                          placeholder="Choose an option"
                          fullWidth
                          options={allColors}
                          getOptionLabel={(option) => option?.Color_and_Code}
                          isOptionEqualToValue={(option, value) =>
                            option.ColorID === value?.ColorID
                          }
                          value={values?.Color || null}
                        />
                      </>
                    ) : (
                      <>
                        <RHFAutocomplete
                          name="InvSpare"
                          label="Spare Name and Code"
                          placeholder="Choose an option"
                          fullWidth
                          options={allInvSpare}
                          getOptionLabel={(option) => option?.SpareNameAndNo || ''}
                          isOptionEqualToValue={(option, value) =>
                            option?.SpareID === value?.SpareID
                          }
                          value={values?.InvSpare || null}
                        />
                      </>
                    )}
                    <RHFAutocomplete
                      name="ItemOpen"
                      sx={{ gridColumn: { sm: 'span 2', md: 'span 2' } }}
                      label="Item"
                      placeholder="Choose an option"
                      fullWidth
                      options={ItemOpen}
                      getOptionLabel={(option) => option?.CodeAndDescription || ''}
                      isOptionEqualToValue={(option, value) => option.ItemID === value.ItemID}
                      value={values?.ItemOpen || null}
                    />
                  </>
                )}
                <RHFTextField
                  name="PRItemDescription"
                  label="Item Description"
                  sx={{ gridColumn: { sm: 'span 2', md: 'span 3' } }}
                  disabled
                />
                <AutocompleteWithAdd
                  name="ScopeofWork"
                  label="Scope of Work"
                  placeholder="Choose an option"
                  fullWidth
                  options={scopeOfWork}
                  getOptionLabel={(option) => option?.ScopeName || ''}
                  isOptionEqualToValue={(option, value) => option.ScopeID === value.ScopeID}
                  value={values?.ScopeofWork || null}
                  onAdd={PostScopeOfWork}
                />
                {/* </>
                )} */}

                {/* {values?.ClassID?.ClassID === 6 && (
                  <>
                    <RHFAutocomplete
                      name="ColorFamily"
                      label="Color Comment"
                      options={allColorFamily}
                      getOptionLabel={(option) => option?.ColorFamilyName || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.ColorFamilyID === value?.ColorFamilyID
                      }
                      value={values?.ColorFamily || null}
                    />
                    <RHFAutocomplete
                      name="Color"
                      label="Color Name & Code"
                      placeholder="Choose an option"
                      fullWidth
                      options={allColors}
                      getOptionLabel={(option) => option?.ColorNameandCode}
                      isOptionEqualToValue={(option, value) => option.ColorID === value?.ColorID}
                      value={values?.Color || null}
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
                    <RHFAutocomplete
                      // sx={{ gridColumn: { xs: 'span 2' } }}
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
                      sx={{ gridColumn: { sm: 'span 2' } }}
                      name="Description"
                      label="Product Name"
                      variant="outlined"
                      fullWidth
                      disabled
                      InputLabelProps={{ shrink: true }}
                      value={generateProductName() || ''}
                    />
                 
                  </>
                )} */}
                {/* <RHFAutocomplete
                  name="Vendor"
                  label="Vendor"
                  placeholder="Choose an option"
                  fullWidth
                  options={allVendorsbyTypeID}
                  getOptionLabel={(option) => option?.VendorName || ''}
                  isOptionEqualToValue={(option, value) => option.VendorID === value.VendorID}
                  value={values?.Vendor || null}
                /> */}
                <RHFTextField
                  name="PRQty"
                  label="Quantity"
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="body2">{values?.PRUOMID?.UOMName || ''}</Typography>
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                <RHFTextField
                  name="PRUnitPrice"
                  label="Unit Price"
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography variant="body2">
                          {values?.PRCurrencyID?.Currency_ID === 8 ? '৳' : '$'}
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />
                {/* <Controller
                  name="NeededByDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Needed By Date"
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
                <RHFTextField name="Remarks" label="Remarks" />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Stack direction="row" spacing={2}>
                  {editingIndex !== null && (
                    <Button color="error" onClick={resetDetailForm} variant="outlined">
                      Cancel
                    </Button>
                  )}
                  <Button color="primary" onClick={handleAddDetail} variant="contained">
                    {editingIndex !== null ? 'Update Item' : 'Add Item'}
                  </Button>
                </Stack>
              </Box>

              {/* <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Budget Summary
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.neutral',
                  }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Total Budget (BDT)
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        ৳ {budgetAmount?.BudgetAmtinBDT?.toLocaleString() || '0.00'}
                      </Typography>
                    </Stack>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Consumed Amount
                      </Typography>
                      <Typography variant="h6" color="error.main">
                        ৳ {TotalConsumed.toLocaleString() || '0.00'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Box> */}

              {detailList.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Items List
                  </Typography>
                  <TableContainer component={Paper}>
                    <Scrollbar>
                      <Table
                        size="small"
                        sx={{
                          minWidth: 800,
                        }}
                      >
                        <TableHeadCustom headLabel={DetailsTableHead} />
                        <TableBody>
                          {detailList.map((row, index) => (
                            <DetailTableRow
                              key={index}
                              index={index}
                              row={row}
                              onDeleteRow={() => DeleteDetailTableRow(index)}
                              onEditRow={() => handleEditDetail(index)}
                              isPDO={values?.PurchaseType?.PurchaseTypeID === 2}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </Scrollbar>
                  </TableContainer>
                </Box>
              )}
            </Card>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
              >
                Submit Purchase Request
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>

      <AddinvCategoryDialog
        uploadOpen={dialogOpen}
        uploadClose={() => handleDialogClose()}
        tableData={allCategoryData}
      />
      <AddSubCategory
        uploadClose={() => handleSubDialogClose()}
        uploadOpen={dialogOpenSub}
        tableData={itemSubCategory}
      />
    </>
  );
}

PrEditForm.propTypes = {
  currentData: PropTypes.object,
};
