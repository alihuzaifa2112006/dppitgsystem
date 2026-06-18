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
import { TableEmptyRows, TableHeadCustom, TableNoData } from 'src/components/table';
import Scrollbar from 'src/components/scrollbar';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import AddinvCategoryDialog from 'src/sections/inv-category/AddDialog';
import AddSubCategory from 'src/sections/inventoryType/AddDialog';
import BudgetProgressBar from './BudgetProgressBar';

export default function PrCreateForm() {
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
  const [scopeOfWork, setScopeOfWork] = useState([]);
  const [allProductionOrderMaster, setAllProductionOrderMaster] = useState([]);
  const [allProdItem, setAllProdItem] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpenSub, setDialogOpenSub] = useState(false);
  const [mrpOptions, setMrpOptions] = useState([]);
  const [mrpDetails, setMrpDetails] = useState([]);

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
    ItemOpen: Yup.object().required('Item is required'),
    ScopeofWork: Yup.object().required('Scope of Work is required'),
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
    defaultValues: {
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

  // setMrpOptions

  const FecthMrp = useCallback(async () => {
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

  // MRP
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
      setValue('ProductionOrderItem', null);
    }
  }, [selectedMrp?.MRPID, GetMrpDetails, setValue]);

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

  const GetCounts = useCallback(async () => {
    try {
      const response = await Get(
        `Activeyarncount?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllCounts(response.data.Data);
    } catch (error) {
      setAllCounts([]);
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
      setAllCompositions([]);
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
      setAllTypes([]);
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchColorFamily = useCallback(async () => {
    try {
      const response = await Get(
        `GetColorFamilies?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setAllColorFamily(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

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
        FecthMrp(),
        GetAllPurchaseTypes(),
        AllClassNameData(),
        fetchAllUOM(),
        fetchAllCurrencies(),
        GetBudgetAmount(),
        GetCounts(),
        APIGetCompositionList(),
        APIGetTypeList(),
        // fetchColorCode(),
        FetchDepartment(),
        // GetColors(),
        FetchColorFamily(),
        GetScopeOfWork(),
        GetProductionOrderMasterList(),
      ]);
      setLoading(false);
      // setValue('PRCurrencyID', {
      //   Currency_ID: 8,
      //   Currency_Name: 'Bangladeshi Taka',
      //   Currency_Code: 'BDT',
      //   Symbol: '$',
      //   CreatedBy: 0,
      //   CreatedDate: '0001-01-01T00:00:00',
      //   UpdatedBy: null,
      //   UpdatedDate: null,
      //   IsActive: true,
      //   Branch_ID: 0,
      //   Org_ID: 0,
      // });
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
    GetCounts,
    APIGetCompositionList,
    APIGetTypeList,
    // GetColors,
    FetchColorFamily,
    FetchDepartment,
    GetScopeOfWork,
    GetProductionOrderMasterList,
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
    // GetMonths();
    // FetchAllSpareByClassID();
    setValue('BudgetMonth', null);
    setValue('Category', null);
    setValue('Vendor');
    setValue('InvSpare', null);
  }, [selectedClassId?.ClassID, FetchAllCategoryandVendors, setValue]);

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

  const selectedProductionOrder = watch('ProductionOrderID');

  const fetchProductionOrderItem = useCallback(async () => {
    if (selectedProductionOrder?.ProductionOrderID) {
      try {
        const response = await Get(
          `Production/GetProductionOrderDetails?ProductionOrderID=${selectedProductionOrder.ProductionOrderID}`
        );
        const formatedData = response.data.Data.map((x) => ({
          ...x,
          CodeAndDescription: `[${x?.Item_Code}]  ${x?.Description}`,
        }));
        setAllProdItem(formatedData);
      } catch (error) {
        console.error(error);
      }
    } else {
      setAllProdItem([]);
    }
  }, [selectedProductionOrder]);

  useEffect(() => {
    fetchProductionOrderItem();
    setValue('ProductionOrderItem', null);
    // eslint-disable-next-line
  }, [selectedProductionOrder, fetchProductionOrderItem]);

  const selectedProductItem = watch('ProductionOrderItem');

  useEffect(() => {
    console.log(
      'selectedProductItem',
      allItemUnit.find((x) => x.UOMName === selectedProductItem?.Unit)
    );
    setValue('PRItemDescription', selectedProductItem?.Description || '');
    setValue('PRUOMID', allItemUnit.find((x) => x.UOMName === selectedProductItem?.Unit) || null);
    setValue('NetRequiredQty', selectedProductItem?.NetRequiredQty || 0);
    // eslint-disable-next-line
  }, [selectedProductItem]);

  const selectedCategory = watch('Category');

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

  const selectedColor = watch('Color');

  const selectedSpare = watch('InvSpare');
  const selectedSubCategory = watch('ItemSubCategory');

  //  setColorOptions
  // const fetchColorCode = useCallback(async () => {
  //   try {
  //     const response = await Get(
  //       `colors/all?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
  //     );
  //     // console.log('Color Codes:', response.data?.Data);
  //     setColorOptions(response.data?.Data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

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
    // selectedClassId?.isColorSensitive,
  ]);

  useEffect(() => {
    // fetchItemsBySubCategory();
    if (selectedSubCategory?.SubCat_ID && selectedClassId?.isColorSensitive === true) {
      GetColors();
    } else {
      FetchAllSpareByClassID();
    }
    if (editingIndex === null) {
      // setValue('ItemOpen', null);
      setValue('Color', null);
      setValue('InvSpare', null);
    }
    // eslint-disable-next-line
  }, [selectedSubCategory, FetchAllSpareByClassID, GetColors, editingIndex, selectedClassId]);

  const fetchItemsBySubCategory = useCallback(async () => {
    if (selectedSpare?.SpareID && selectedClassId?.isColorSensitive === false) {
      try {
        const response = await Get(
          `GetItemsBySpareID?spareId=${selectedSpare?.SpareID}&subCatID=${selectedSubCategory?.SubCat_ID}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
        );

        const updatedData = response?.data?.map((item) => ({
          ...item,
          ClassID: item?.invTypesID,
          CodeAndDescription: `[${item?.ItemCode}]  ${item?.ItemDescription}`,
          UOM: { UOMName: item?.UOMName || item?.UOMNAME, UOM_ID: item?.UOMID },
        }));
        setItemOpen(updatedData);
      } catch (error) {
        console.error(error);
        setItemOpen([]);
        setallColors([]);
      }
    } else if (selectedSubCategory?.SubCat_ID && selectedClassId?.isColorSensitive === true) {
      try {
        const response = await Get(
          `GetItemsByColor?colorId=${selectedColor?.ColorID}&subCatID=${selectedSubCategory?.SubCat_ID}`
        );
        const updatedData = response?.data?.map((item) => ({
          ...item,
          ClassID: item?.invTypesID,
          CodeAndDescription: `[${item?.ItemCode}]  ${item?.ItemDescription}`,
          UOM: { UOMName: item?.UOMName || item?.UOMNAME, UOM_ID: item?.UOMID },
        }));
        setItemOpen(updatedData);
      } catch (error) {
        console.error(error);
        setItemOpen([]);
        setallColors([]);
      }
    } else {
      setItemOpen([]);
      setallColors([]);
    }
    // setValue('ItemOpen', null);
  }, [
    selectedSubCategory,
    selectedColor,
    selectedClassId?.isColorSensitive,
    selectedSpare,
    userData?.userDetails,
  ]);

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
    setValue('ProductionOrderID', null);
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
    setEditingIndex(index);

    if (values?.PurchaseType?.PurchaseTypeID === 2) {
      // Handle MRP/Production Order flow
      if (detail?.MRP) {
        setValue('MRP', detail.MRP);
      } else if (detail?.MRP?.MRPID) {
        const mrp = mrpOptions.find((x) => x.MRPID === detail.MRP.MRPID);
        if (mrp) setValue('MRP', mrp);
      }

      setTimeout(() => {
        if (detail?.ProductionOrderItem) {
          setValue('ProductionOrderItem', detail.ProductionOrderItem);
        }
        if (detail?.PRItemDescription) {
          setValue('PRItemDescription', detail.PRItemDescription);
        }
      }, 600);
    } else {
      // Handle regular item flow
      // Set ClassID - use the object directly if available, otherwise find it
      const classIdObj = detail?.PRINVTypeID;
      if (classIdObj && typeof classIdObj === 'object' && classIdObj.ClassID) {
        // Already an object, use it or find the matching one
        const found = allClassName.find((x) => x.ClassID === classIdObj.ClassID);
        setValue('ClassID', found || classIdObj);
      } else if (classIdObj && typeof classIdObj === 'number') {
        // It's just an ID, find the object
        const found = allClassName.find((x) => x.ClassID === classIdObj);
        if (found) setValue('ClassID', found);
      }

      // Wait for category data to be available
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Set Category
      const categoryObj = detail?.PRCategoryID;
      if (categoryObj && typeof categoryObj === 'object' && categoryObj.Inv_Cat_ID) {
        const found = allCategoryData.find((x) => x.Inv_Cat_ID === categoryObj.Inv_Cat_ID);
        setValue('Category', found || categoryObj);
      } else if (categoryObj && typeof categoryObj === 'number') {
        const found = allCategoryData.find((x) => x.Inv_Cat_ID === categoryObj);
        if (found) setValue('Category', found);
      }

      // Fetch subcategories manually to ensure they're loaded
      let categoryId;
      if (categoryObj && typeof categoryObj === 'object' && categoryObj.Inv_Cat_ID) {
        categoryId = categoryObj.Inv_Cat_ID;
      } else if (categoryObj && typeof categoryObj === 'number') {
        categoryId = categoryObj;
      }

      if (categoryId) {
        try {
          const subCatResponse = await Get(`GetSubCategoriesByCategoryID/${categoryId}`);
          const subCategories = subCatResponse.data.data || [];
          setItemSubCategory(subCategories);
          await new Promise((resolve) => setTimeout(resolve, 200));

          // Set ItemSubCategory
          const subCatObj = detail?.PRSubCatID;
          let subCatId;
          if (subCatObj && typeof subCatObj === 'object' && subCatObj.SubCat_ID) {
            subCatId = subCatObj.SubCat_ID;
            const found = subCategories.find((x) => x.SubCat_ID === subCatId);
            setValue('ItemSubCategory', found || subCatObj);
          } else if (subCatObj && typeof subCatObj === 'number') {
            subCatId = subCatObj;
            const found = subCategories.find((x) => x.SubCat_ID === subCatId);
            if (found) setValue('ItemSubCategory', found);
          }

          // Get class object to check if color sensitive
          let classObj = classIdObj;
          if (classIdObj && typeof classIdObj === 'object' && classIdObj.ClassID) {
            classObj = allClassName.find((x) => x.ClassID === classIdObj.ClassID) || classIdObj;
          } else if (classIdObj && typeof classIdObj === 'number') {
            classObj = allClassName.find((x) => x.ClassID === classIdObj);
          }

          // Fetch colors if color sensitive
          if (classObj?.isColorSensitive === true && subCatId) {
            try {
              const colorsResponse = await Get(
                `GetColorsBySubCatFromItemDB?subCatId=${subCatId}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
              );
              const colorsData = colorsResponse.data.data || [];
              setallColors(colorsData);
              await new Promise((resolve) => setTimeout(resolve, 200));

              // Set Color after fetching colors
              const colorObj = detail?.Color;
              if (colorObj && typeof colorObj === 'object' && colorObj.ColorID) {
                const found = colorsData.find((x) => x.ColorID === colorObj.ColorID);
                setValue('Color', found || colorObj);
              } else if (colorObj && typeof colorObj === 'number') {
                const found = colorsData.find((x) => x.ColorID === colorObj);
                if (found) setValue('Color', found);
              }
            } catch (error) {
              console.error('Error fetching colors:', error);
              if (detail?.Color) {
                setValue('Color', detail.Color);
              }
            }
          }

          // Fetch and set InvSpare if not color sensitive
          if (classObj?.isColorSensitive === false && subCatId) {
            try {
              const spareResponse = await Get(
                `GetSpareBySubcateID?SubcatID=${subCatId}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
              );
              const spareData = spareResponse.data || [];
              setallInvSpare(spareData);
              await new Promise((resolve) => setTimeout(resolve, 200));

              // Set InvSpare
              const spareObj = detail?.InvSpare;
              if (spareObj && typeof spareObj === 'object' && spareObj.SpareID) {
                const found = spareData.find((x) => x.SpareID === spareObj.SpareID);
                setValue('InvSpare', found || spareObj);
              } else if (spareObj && typeof spareObj === 'number') {
                const found = spareData.find((x) => x.SpareID === spareObj);
                if (found) setValue('InvSpare', found);
              }
            } catch (error) {
              console.error('Error fetching spare:', error);
              if (detail?.InvSpare) {
                setValue('InvSpare', detail.InvSpare);
              }
            }
          }

          // Fetch items based on conditions
          if (subCatId) {
            try {
              let itemsData = [];

              if (classObj?.isColorSensitive === true) {
                // Need color ID to fetch items
                let colorId;
                if (detail?.Color?.ColorID) {
                  colorId = detail.Color.ColorID;
                } else if (typeof detail?.Color === 'number') {
                  colorId = detail.Color;
                }

                if (colorId) {
                  const itemsResponse = await Get(
                    `GetItemsByColor?colorId=${colorId}&subCatID=${subCatId}`
                  );
                  itemsData =
                    itemsResponse?.data?.map((item) => ({
                      ...item,
                      ClassID: item?.invTypesID,
                      CodeAndDescription: `[${item?.ItemCode}]  ${item?.ItemDescription}`,
                      UOM: { UOMName: item?.UOMName || item?.UOMNAME, UOM_ID: item?.UOMID },
                    })) || [];
                }
              } else {
                // Not color sensitive, need spare ID
                let spareId;
                if (detail?.InvSpare?.SpareID) {
                  spareId = detail.InvSpare.SpareID;
                } else if (typeof detail?.InvSpare === 'number') {
                  spareId = detail.InvSpare;
                }

                if (spareId) {
                  const itemsResponse = await Get(
                    `GetItemsBySpareID?spareId=${spareId}&subCatID=${subCatId}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
                  );
                  itemsData =
                    itemsResponse?.data?.map((item) => ({
                      ...item,
                      ClassID: item?.invTypesID,
                      CodeAndDescription: `[${item?.ItemCode}]  ${item?.ItemDescription}`,
                      UOM: { UOMName: item?.UOMName || item?.UOMNAME, UOM_ID: item?.UOMID },
                    })) || [];
                }
              }

              setItemOpen(itemsData);
              await new Promise((resolve) => setTimeout(resolve, 200));

              // Set ItemOpen
              const itemObj = detail?.ItemOpen;
              if (itemObj && typeof itemObj === 'object' && itemObj.ItemID) {
                const found = itemsData.find((x) => x.ItemID === itemObj.ItemID);
                setValue('ItemOpen', found || itemObj);
              } else if (itemObj && typeof itemObj === 'number') {
                const found = itemsData.find((x) => x.ItemID === itemObj);
                if (found) setValue('ItemOpen', found);
              }

              // Set Item Description
              if (detail?.PRItemDescription) {
                setValue('PRItemDescription', detail.PRItemDescription);
              }
            } catch (error) {
              console.error('Error fetching items:', error);
              if (detail?.ItemOpen) {
                setValue('ItemOpen', detail.ItemOpen);
              }
              if (detail?.PRItemDescription) {
                setValue('PRItemDescription', detail.PRItemDescription);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching subcategories:', error);
          // Still try to set values from detail if available
          if (detail?.PRSubCatID) {
            setValue('ItemSubCategory', detail.PRSubCatID);
          }
        }
      }
    }

    // Set Scope of Work
    const scopeObj = detail?.ScopeofWork;
    if (scopeObj && typeof scopeObj === 'object' && scopeObj.ScopeID) {
      const found = scopeOfWork.find((x) => x.ScopeID === scopeObj.ScopeID);
      setValue('ScopeofWork', found || scopeObj);
    } else if (scopeObj && typeof scopeObj === 'number') {
      const found = scopeOfWork.find((x) => x.ScopeID === scopeObj);
      if (found) setValue('ScopeofWork', found);
    }

    // Set other fields
    if (detail?.PRQty !== undefined) {
      setValue('PRQty', detail.PRQty);
    }

    // Set UOM
    const uomObj = detail?.PRUOMID;
    if (uomObj && typeof uomObj === 'object' && uomObj.UOM_ID) {
      const found = allItemUnit.find((x) => x.UOM_ID === uomObj.UOM_ID);
      setValue('PRUOMID', found || uomObj);
    } else if (uomObj && typeof uomObj === 'number') {
      const found = allItemUnit.find((x) => x.UOM_ID === uomObj);
      if (found) setValue('PRUOMID', found);
    }

    if (detail?.PRUnitPrice !== undefined) {
      setValue('PRUnitPrice', detail.PRUnitPrice);
    }

    // Set Currency
    const currencyObj = detail?.PRCurrencyID;
    if (currencyObj && typeof currencyObj === 'object' && currencyObj.Currency_ID) {
      const found = allCurrencies.find((x) => x.Currency_ID === currencyObj.Currency_ID);
      setValue('PRCurrencyID', found || currencyObj);
    } else if (currencyObj && typeof currencyObj === 'number') {
      const found = allCurrencies.find((x) => x.Currency_ID === currencyObj);
      if (found) setValue('PRCurrencyID', found);
    }

    if (detail?.Remarks !== undefined) {
      setValue('Remarks', detail.Remarks);
    }
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
      // if (values?.PurchaseType?.PurchaseTypeID === 2 && !values.ProductionOrderID)
      //   throw new Error('Production Order is required');

      if (values?.PurchaseType?.PurchaseTypeID === 2 && !values?.MRP)
        throw new Error('MRP is required');
      // if (values?.PurchaseType?.PurchaseTypeID === 2 && !values?.MRPItem)
      //   throw new Error('Production Order No. is required');

      if (values?.PurchaseType?.PurchaseTypeID === 2 && !values.ProductionOrderItem)
        throw new Error('Item is required');
      if (!values.ScopeofWork) throw new Error('Scope of Work is required');
      // if (!values.PRItemDescription) throw new Error('Item Description is required');
      // if (!values.Vendor) throw new Error('Vendor is required');
      if (!values.PRQty || values.PRQty <= 0) throw new Error('Valid Quantity is required');
      // if (!values.PRUOMID) throw new Error('UOM is required');
      if (!values.PRUnitPrice || values.PRUnitPrice <= 0)
        throw new Error('Valid Unit Price is required');
      if (!values.PRCurrencyID) throw new Error('Currency is required');
      // if (!values.NeededByDate) throw new Error('Needed By Date is required');

      const detail = {
        MRP: values?.MRP || null,
        MRPItem: values?.MRPItem?.ProductionOrderItem || null,
        ProductionOrderNo: values?.MRPItem?.ProductionOrderNo || null,
        PRINVTypeID: values?.ClassID || null,
        PRCategoryID: values?.Category || null,
        PRSubCatID: values?.ItemSubCategory || null,
        Color: values?.Color || null,
        ItemOpen: values?.ItemOpen || null,
        ProductionOrderID: values?.ProductionOrderID || null,
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

    try {
      const dataToSend = {
        PRpurchaseTypeID: data?.PurchaseType?.PurchaseTypeID,
        PriorityID: data?.Priority?.PRPriorityID,
        PRRequestDate: formatDate(new Date(data.PRRequestDate)),
        BudgetMonth: data?.BudgetMonth?.month || 0,
        DptID: data?.Dpt_ID?.Dpt_ID,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
        CreatedBy: userData?.userDetails?.userId,
        DetailList: detailList.map((detail) => ({
          VendorID: detail?.Vendor?.VendorID || 0,
          PRINVTypeID: data?.PurchaseType?.PurchaseTypeID !== 2 ? detail?.PRINVTypeID?.ClassID : 0,
          PRCategoryID:
            data?.PurchaseType?.PurchaseTypeID !== 2 ? detail?.PRCategoryID?.Inv_Cat_ID : 0,
          ColorID: data?.PurchaseType?.PurchaseTypeID !== 2 ? detail?.Color?.ColorID : 0,
          PRSubCatID: data?.PurchaseType?.PurchaseTypeID !== 2 ? detail?.PRSubCatID?.SubCat_ID : 0,
          SpareId: data?.PurchaseType?.PurchaseTypeID !== 2 ? detail?.SpareID?.SpareID : 0,
          Item_ID: data?.PurchaseType?.PurchaseTypeID !== 2 ? detail?.ItemOpen?.ItemID : 0,
          PDOID: detail?.MRP?.MRPID || 0, // MRPID instead of ProductionOrderID
          PDOItemID: detail?.ProductionOrderItem?.ItemID || 0,
          ScopeID: detail?.ScopeofWork?.ScopeID,
          PRItemDescription: detail?.PRItemDescription || 'N/A',
          PRQty: detail.PRQty,
          PRUnitPrice: detail.PRUnitPrice,
          PRCurrencyID: detail.PRCurrencyID?.Currency_ID,
          PRUOMID: detail.PRUOMID?.UOM_ID,
          NeededByDate: formatDate(new Date()),
          Remarks: detail.Remarks,
          IsActive: true,
          IsDeleted: false,
          Org_ID: userData?.userDetails?.orgId,
          Branch_ID: userData?.userDetails?.branchID,
          CreatedBy: userData?.userDetails?.userId,
        })),
      };

      const response = await Post(`AddPRRequest`, dataToSend);
      if (response.status === 200) {
        enqueueSnackbar('Purchase Request created successfully!', { variant: 'success' });
        reset();
        setDetailList([]);
        router.push(paths.dashboard.procurement.pr.root);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to create Purchase Request', { variant: 'error' });
    }
  });

  const DetailsTableHead =
    values?.PurchaseType?.PurchaseTypeID === 2
      ? [
          { id: 'MRP', label: 'MRP No.', minWidth: 200 },
          // { id: 'ProductionOrderNo', label: 'Production Order No.', minWidth: 200 },
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
                  value={values?.Dpt_ID}
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
                  disabled={detailList.length > 0}
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
                /> */}
                {/* <RHFAutocomplete
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
                    {/* <RHFAutocomplete
                      name="MRPItem"
                      label="Production Order No."
                      placeholder="Choose an option"
                      fullWidth
                      options={mrpDetails}
                      getOptionLabel={(option) => option?.ProductionOrderNo || ''}
                      isOptionEqualToValue={(option, value) => option?.ProductionOrderID === value?.ProductionOrderID}
                    /> */}

                    {/* <RHFAutocomplete
                      name="ProductionOrderID"
                      label="Production Order"
                      placeholder="Choose an option"
                      fullWidth
                      options={allProductionOrderMaster}
                      getOptionLabel={(option) => option?.ProductionOrderNo || ''}
                      isOptionEqualToValue={(option, value) =>
                        option.ProductionOrderID === value.ProductionOrderID
                      }
                      value={values?.ProductionOrderID || null}
                    /> */}
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
                    <RHFTextField
                      name="NetRequiredQty"
                      label="Net Required Quantity"
                      disabled
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="body2">
                              {values?.PRUOMID?.UOMName || ''}
                            </Typography>
                          </InputAdornment>
                        ),
                      }}
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
                      getOptionLabel={(option) => option?.Color_and_Code}
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
                    {/*  total value and total qty */}
                    <Box sx={{ p: 2, textAlign: 'right', backgroundColor: 'background.neutral' }}>
                      <Typography variant="caption">
                        Total Quantity:{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          {fNumber(detailList.reduce((sum, item) => sum + item.PRQty, 0))}{' '}
                          {detailList[0]?.PRUOMID?.UOMName || ''}
                        </span>
                      </Typography>
                      <Typography variant="caption" sx={{ ml: 3 }}>
                        Total Value:{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          {detailList[0]?.PRCurrencyID?.Currency_ID === 8 ? '৳' : '$' || ''}
                          {fNumber(
                            detailList.reduce((sum, item) => sum + item.PRQty * item.PRUnitPrice, 0)
                          )}
                        </span>
                      </Typography>
                    </Box>
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
