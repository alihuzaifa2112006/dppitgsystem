import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm, Controller, useFormContext, useWatch } from 'react-hook-form';
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
  IconButton,
  InputAdornment,
  Table,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { grid } from '@mui/system';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import Scrollbar from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import Iconify from 'src/components/iconify';

import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFUploadBox,
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
import { convertBDTtoUSD } from 'src/utils/BDTtoUSD';

import DetailTableRow from './detail-table-row';
import AddDptDialog from 'src/sections/inv-category/AddDialog';
import InvTypeDialog from 'src/sections/InvType/AddDialog';
import AddSubCategory from 'src/sections/inventoryType/AddDialog';
import AddDialogOrigin from './AddDialogOrigin';
import PricelistDialog from '../quotation/PricelistDialog';
import { de } from 'date-fns/locale';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export default function ProductionBucketEditForm({ currentData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  console.log('currentData', currentData);
  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [allOrigins, setAllOrigins] = useState([]);
  const [allCurrencies, setallCurrencies] = useState([]);
  const [allPrintUnit, setallPrintUnit] = useState([]);
  const [allProcurementUnit, setallProcurementUnit] = useState([]);
  const [allUnitLocations, setAllUnitLocations] = useState([]);
  const [storageLocationsByStore, setStorageLocationsByStore] = useState([]);
  const [itemSubCategory, setItemSubCategory] = useState([]);
  const [allItemUnit, setallItemUnit] = useState([]);
  const [allClassName, setallClassName] = useState([]);
  const [allCategoryData, setallCategoryData] = useState([]);
  const [allInvSpecs, setallInvSpecs] = useState([]);
  const [allColorFamily, setAllColorFamily] = useState([]);
  const [allColors, setallColors] = useState([]);
  const [allCounts, setAllCounts] = useState([]);
  const [allCompositions, setAllCompositions] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [allSpareNames, setAllSpareNames] = useState([]);
  const [allSources, setAllSources] = useState([]);
  const [allMaterialTypes, setAllMaterialTypes] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [allMaterialData, setAllMaterialData] = useState({});
  const [allSourceData, setallSourceData] = useState([]);
  const [allScopeData, setallScopeData] = useState([]);
  const [allVendorData, setallVendorData] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    classes: true,
    categories: true,
    subCategories: true,
    colors: true,
  });

  const [PIID, setPIID] = useState([]);
  const [allItemCode, setallItemCode] = useState([]);
  const [allSuppliers, setallSuppliers] = useState([]);
  const [ProductionBucketDetails, setProductionBucketDetails] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState([]);

  const NewProductionBucketSchema = Yup.object().shape({
    // ClassID
    ClassID: Yup.object().nullable().required('Item Type is required'),
    Inv_Cat_Name: Yup.object().when('ClassID', {
      is: (ClassID) => ClassID?.ClassID !== 6,
      then: () => Yup.object().required('Item Category is required'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    ItemSubCategory: Yup.object().when('ClassID', {
      is: (ClassID) => ClassID?.ClassID !== 6,
      then: () => Yup.object().required('Item Sub Category is required'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    //  MaterialType
    // MaterialType: Yup.object().nullable().required('Material Type is required'),
    // Color
    // ColorFamily: Yup.object().when('ClassID', {
    //   is: (ClassID) => ClassID?.isColorSensitive === true,
    //   then: () =>
    //     Yup.object().required('Color Comment is required when Class is "Color Sensitive"'),
    //   otherwise: () => Yup.mixed().notRequired(),
    // }),
    Color: Yup.object().when('ClassID', {
      is: (ClassID) => ClassID?.isColorSensitive === true,
      then: () => Yup.object().required('Color is required when Class is "Color Sensitive"'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    SpareNameAndNo: Yup.object().when('ClassID', {
      is: (ClassID) => ClassID?.isColorSensitive === false,
      then: () => Yup.object().required('Spare Name and Code is required'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    Yarn_Type_ID: Yup.object().when('ClassID', {
      is: (ClassID) => ClassID?.ClassID === 6,
      then: () => Yup.object().required('Yarn Type is required when Class is "Yarn"'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    Yarn_Count_ID: Yup.object().when('ClassID', {
      is: (ClassID) => ClassID?.ClassID === 6,
      then: () => Yup.object().required('Yarn Count is required when Class is "Yarn"'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    Composition_ID: Yup.object().when('ClassID', {
      is: (ClassID) => ClassID?.ClassID === 6,
      then: () => Yup.object().required('Composition is required when Class is "Yarn"'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    // SafetyStockQty: Yup.number()
    //   .typeError('Safety Stock Qty must be a number')
    //   .required('Safety Stock Qty is required'),

    UOMID: Yup.object()
      .shape({
        UOM_ID: Yup.number().required('Item Unit is required'),
      })
      .nullable()
      .required('Item Unit is required'),

    ReOrderQty: Yup.number()
      .typeError('Reorder Quantity must be a number')
      .required('Reorder Quantity is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewProductionBucketSchema),
    defaultValues: {
      ClassID: null,
      Inv_Cat_Name: null,
      ItemSubCategory: null,
      MaterialType: null,
      ItemDescription: '',
      UOMID: null,
      ColorFamily: null,
      Color: null,
      SafetyStockQty: 0,
      ReOrderQty: 0,
      Yarn_Type_ID: null,
      Yarn_Count_ID: null,
      Composition_ID: null,
      InvSpecs: null,
      SpareNameAndNo: null,
    },
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    resetField,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  // Set individual field values when data is available
  useEffect(() => {
    if (currentData && allClassName.length > 0) {
      const classItem = allClassName.find((type) => type.ClassID === currentData.InvTypesID);
      if (classItem) setValue('ClassID', classItem);
    }
  }, [currentData, allClassName, setValue]);

  useEffect(() => {
    if (currentData && allCategoryData.length > 0) {
      const category = allCategoryData.find((cat) => cat.Inv_Cat_ID === currentData.InvCatID);
      if (category) setValue('Inv_Cat_Name', category);
    }
  }, [currentData, allCategoryData, setValue]);

  useEffect(() => {
    if (currentData && itemSubCategory.length > 0) {
      const subCategory = itemSubCategory.find((sub) => sub.SubCat_ID === currentData.SubCatID);
      if (subCategory) setValue('ItemSubCategory', subCategory);
    }
  }, [currentData, itemSubCategory, setValue]);

  useEffect(() => {
    if (currentData && allMaterialTypes.length > 0) {
      const materialType = allMaterialTypes.find(
        (mat) => mat.MaterialTypeID === currentData.MaterialTypeID
      );
      if (materialType) setValue('MaterialType', materialType);
    }
  }, [currentData, allMaterialTypes, setValue]);

  useEffect(() => {
    if (currentData) {
      setValue('ItemDescription', currentData.ItemDescription || '');
    }
  }, [currentData, setValue]);

  useEffect(() => {
    if (currentData && allItemUnit.length > 0) {
      const uom = allItemUnit.find((u) => u.UOM_ID === currentData.UOMID);
      if (uom) setValue('UOMID', uom);
    }
  }, [currentData, allItemUnit, setValue]);

  useEffect(() => {
    if (currentData && allColorFamily.length > 0) {
      const colorFamily = allColorFamily.find(
        (cf) => cf.ColorFamilyID === currentData.ColorFamilyID
      );
      if (colorFamily) setValue('ColorFamily', colorFamily);
    }
  }, [currentData, allColorFamily, setValue]);

  useEffect(() => {
    if (currentData) {
      setValue('SafetyStockQty', currentData?.SafetyStockQty || 0);
      setValue('ReOrderQty', currentData?.ReOrderQty || 0);
    }
  }, [currentData, setValue]);

  useEffect(() => {
    if (currentData && allTypes.length > 0) {
      const yarnType = allTypes.find((yarn) => yarn.Yarn_Type_ID === currentData.YarnTypeID);
      if (yarnType) setValue('Yarn_Type_ID', yarnType);
    }
  }, [currentData, allTypes, setValue]);

  useEffect(() => {
    if (currentData && allCounts.length > 0) {
      const yarnCount = allCounts.find((count) => count.Yarn_Count_ID === currentData.YarnCountID);
      if (yarnCount) setValue('Yarn_Count_ID', yarnCount);
    }
  }, [currentData, allCounts, setValue]);

  useEffect(() => {
    if (currentData && allCompositions.length > 0) {
      const composition = allCompositions.find(
        (comp) => comp.Composition_ID === currentData.YarnCompositionID
      );
      if (composition) setValue('Composition_ID', composition);
    }
  }, [currentData, allCompositions, setValue]);

  useEffect(() => {
    if (currentData && allInvSpecs.length > 0) {
      const invSpec = allInvSpecs.find(
        (spec) => spec.InvSpecID === currentData.ItemSpecificationID
      );
      if (invSpec) setValue('InvSpecs', invSpec);
    }
  }, [currentData, allInvSpecs, setValue]);

  useEffect(() => {
    if (currentData && allSpareNames.length > 0) {
      const spareName = allSpareNames.find((spare) => spare.SpareId === currentData.SpareID);
      if (spareName) setValue('SpareNameAndNo', spareName);
    }
  }, [currentData, allSpareNames, setValue]);

  const generateProductName = () => {
    const productCode = `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${values?.Yarn_Count_ID?.Yarn_Count_Name || ''
      } -  ${values?.Composition_ID?.Composition_Name || ''}  (${values?.Color?.ColorName || ''} - ${values?.Color?.Color_Code || ''
      })`;
    return productCode;
  };

  const generateItemName = () => {
    const productCode = `${values?.ClassID?.ClassName || ''} - ${values?.Inv_Cat_Name?.Inv_Cat_Name || ''
      } - ${values?.ItemSubCategory?.SubCat_Name || ''}${values?.ClassID?.isColorSensitive
        ? ` (${values?.Color?.ColorName || ''} - ${values?.Color?.Color_Code || ''})`
        : ` ${values?.SpareNameAndNo ? `[${values?.SpareNameAndNo.SpareNameAndNo}]` : ''} ${values?.InvSpecs?.InvSpecsName ? `(${values?.InvSpecs?.InvSpecsName || ''})` : ''
        } `
      }`;
    return productCode;
  };

  // const PostOrigin = async (newOption) => {
  //   if (newOption === '') {
  //     enqueueSnackbar('Please Enter Payment Term', { variant: 'error' });
  //     return;
  //   }
  //   // check after trimming and lowercase
  //   const newOptionTrimmed = newOption.trim().toLowerCase();
  //   // check if the option already exists
  //   if (allOrigins.find((option) => option.Origin_Name.trim().toLowerCase() === newOptionTrimmed)) {
  //     enqueueSnackbar('This Origin already exists', { variant: 'error' });
  //     return;
  //   }

  //   try {
  //     const dataToSend = {
  //       Origin_Name: newOption,
  //       SourceID: values?.Source?.SourceID,
  //       Is_Active: true,
  //       Created_By: userData?.userDetails?.userId,
  //       UpdatedBy: userData?.userDetails?.userId,
  //       Org_ID: userData?.userDetails?.orgId,
  //       Branch_ID: userData?.userDetails?.branchID,
  //     };

  //     await Post('AddOrigin', dataToSend);
  //     fetchOrigin();
  //     enqueueSnackbar('Origin Added Successfully', { variant: 'success' });
  //   } catch (error) {
  //     console.log('Error', error);
  //   }
  // };

  const openingQty = useWatch({ control, name: 'OpeningStockQuantity' });
  const avgPrice = useWatch({ control, name: 'AveragePrice' });

  useEffect(() => {
    const qty = parseFloat(openingQty);
    const price = parseFloat(avgPrice);

    if (!Number.isNaN(qty) && !Number.isNaN(price)) {
      setValue('Value', qty * price);
    } else {
      setValue('Value', '');
    }
  }, [openingQty, avgPrice, setValue]);

  const GetInvSpecs = useCallback(async () => {
    try {
      const response = await Get(
        `GetInvSpecs?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );

      setallInvSpecs(response.data?.Data);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchAllClasses = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllClasses?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setallClassName(response.data?.Data);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    FetchAllClasses();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, FetchAllClasses]);

  const selectedClassId = watch('ClassID');

  const FetchAllCategoryData = useCallback(async () => {
    if (selectedClassId?.ClassID) {
      try {
        const response = await Get(
          `InvCategoryGetByClassId?classId=${selectedClassId?.ClassID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setallCategoryData(response.data || []);
        setValue('Inv_Cat_Name', null);
      } catch (error) {
        console.error(error);
      }
    } else {
      setallCategoryData([]);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    selectedClassId?.ClassID,
    setValue,
  ]);

  useEffect(() => {
    FetchAllCategoryData();
  }, [selectedClassId?.ClassID, FetchAllCategoryData]);

  const selectedCategory = watch('Inv_Cat_Name');

  const fetchSubCategory = useCallback(async () => {
    console.log('S');
    if (selectedCategory?.Inv_Cat_ID || currentData?.InvCatID) {
      try {
        const response = await Get(
          `GetSubCategoriesByCategoryID/${selectedCategory?.Inv_Cat_ID || currentData.InvCatID}`
        );
        setItemSubCategory(response.data.data || []);
        // If we're editing and have current data, try to find the matching subcategory
        if (currentData?.SubCatID && !loadingStates.subCategories) {
          const foundSubCategory = response.data.data.find(
            (sub) => sub.SubCat_ID === currentData.SubCatID
          );
          if (foundSubCategory) {
            setValue('ItemSubCategory', foundSubCategory);
          } else {
            setValue('ItemSubCategory', null);
          }
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setItemSubCategory([]);
    }
    // eslint-disable-next-line
  }, [selectedCategory?.Inv_Cat_ID, currentData, setValue]);

  useEffect(() => {
    fetchSubCategory();
  }, [selectedCategory, fetchSubCategory]);

  // Add this useEffect to handle initial data loading
  useEffect(() => {
    if (currentData?.InvCatID && allCategoryData.length > 0) {
      // Find the category from current data
      const foundCategory = allCategoryData.find((cat) => cat.Inv_Cat_ID === currentData.InvCatID);

      if (foundCategory) {
        setValue('Inv_Cat_Name', foundCategory);
        // Fetch subcategories for this category
        // fetchSubCategory(currentData.InvCatID);
      }
    }
  }, [currentData, allCategoryData, setValue]);

  useEffect(() => {
    const fetchAllUOM = async () => {
      try {
        const response = await Get(
          `GetAllActiveUOM?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setallItemUnit(response.data.Data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllUOM();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const AllSupplierData = async () => {
      try {
        const response = await Get(
          `GetSupplierNames?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );
        setallSuppliers(response.data?.Data);
      } catch (error) {
        console.error(error);
      }
    };

    AllSupplierData();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const FetchAllSources = async () => {
      try {
        const response = await Get(
          `GetAllSources?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setAllSources(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    FetchAllSources();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await Get(`getActiveCurrencies`);
        setallCurrencies(response.data || []);
      } catch (error) {
        setallCurrencies([]);
        console.error(error);
      }
    };

    fetchCurrency();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetCounts = useCallback(async () => {
    try {
      const response = await Get(
        `Activeyarncount?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const split = response.data.Data.map((x) => ({
        ...x,
        Splitted_Yarn_Count_Name: x.Yarn_Count_Name.trim().split('/')[1],
      }));
      const filteredDate = split.filter((x) => x.Splitted_Yarn_Count_Name === '1');
      setAllCounts(filteredDate);
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

  const GetSparePartGetAll = useCallback(async () => {
    try {
      const response = await Get(
        `SparePartGetAll?org_Id=${userData?.userDetails?.orgId}&branch_Id=${userData?.userDetails?.branchID}`
      );
      setAllSpareNames(response.data || []);
    } catch (error) {
      setAllSpareNames([]);
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchMaterialTypes = async () => {
      try {
        const response = await Get(
          `GetAllMaterialTypes?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        if (response.status === 200) {
          setAllMaterialTypes(response?.data || []);
        }
      } catch (error) {
        setAllMaterialTypes([]);
        console.error(error);
      }
    };

    fetchMaterialTypes();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // useEffect(() => {
  //   const fetchColorCode = async () => {
  //     try {
  //       const response = await Get(
  //         `colors/all?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
  //       );
  //       setColorOptions(response.data?.Data);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   fetchColorCode();
  // }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const AllMaterialData = async () => {
      try {
        const response = await Get(
          `GetAllMaterialTypes?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );

        if (response.status === 200) {
          setAllMaterialData(response.data);
        }
      } catch (error) {
        setAllMaterialData([]);
        console.error(error);
      }
    };

    AllMaterialData();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const allSourceFetchData = async () => {
      try {
        const response = await Get(
          `GetAllSources?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );

        if (response.status === 200) {
          setallSourceData(response.data);
        }
      } catch (error) {
        setallSourceData([]);
        console.error(error);
      }
    };

    allSourceFetchData();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchAllSupplierData = async () => {
      try {
        const response = await Get(
          `ViewVendors?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );

        setallVendorData(response.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllSupplierData();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // const selectedOrigin = watch('Source');

  // const fetchOrigin = useCallback(async () => {
  //   if (selectedOrigin?.SourceID) {
  //     try {
  //       const response = await Get(
  //         `GetOriginsBySourceID?sourceID=${selectedOrigin.SourceID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
  //       );
  //       if (response.status === 200) {
  //         setAllOrigins(response.data);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       setAllOrigins([]);
  //     }
  //   } else {
  //     setAllOrigins([]);
  //   }
  // }, [selectedOrigin, userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

  // useEffect(() => {
  //   fetchOrigin();
  // }, [fetchOrigin]);

  useEffect(() => {
    const allScopeFetchData = async () => {
      try {
        const response = await Get(
          `GetAllInvScopes?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );

        if (response.status === 200) {
          setallScopeData(response.data?.data);
        }
      } catch (error) {
        console.error(error);
        setallScopeData([]);
      }
    };

    allScopeFetchData();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const GetAllItemFrmDB = async () => {
      try {
        const response = await Get(
          `GetAllItemFrmDB?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );

        if (response.status === 200) {
          setAllItems(response.data);
        }
      } catch (error) {
        console.error(error);
        setAllItems([]);
      }
    };

    GetAllItemFrmDB();
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

  const selectedColor = watch('Color');

  const GetColors = useCallback(async () => {
    try {
      const response = await Get(
        `colors/all?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const newdata = response.data.Data.filter((x) => x.SL !== '1').map((item) => ({
        ...item,
        ColorNickName: item.ColorNameandCode,
      }));

      // const filteredColorFamily = newdata.filter(
      //   (x) => x?.ColorFamilyID === selectedColorFamily?.ColorFamilyID
      // );
      setallColors(newdata);
      // setLoadingStates((prev) => ({ ...prev, colors: false }));
    } catch (error) {
      console.log('Error fetching colors:', error);
      setallColors([]);
      // setLoadingStates((prev) => ({ ...prev, colors: false }));
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    // selectedColorFamily,
    // loadingStates.colors,
  ]);

  useEffect(() => {
    if (selectedColor) {
      const family = {
        ColorFamilyID: selectedColor.ColorFamilyID,
        ColorFamilyName: selectedColor.ColorFamilyName,
      };
      setValue('ColorFamily', family || null);
    }
  }, [selectedColor, setValue]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          GetColors(),
          APIGetCompositionList(),
          APIGetTypeList(),
          GetCounts(),
          FetchColorFamily().then(() => setLoadingStates((prev) => ({ ...prev, color: false }))),
          GetInvSpecs(),
          GetSparePartGetAll(),
          FetchAllClasses().then(() => setLoadingStates((prev) => ({ ...prev, classes: false }))),
          FetchAllCategoryData().then(() =>
            setLoadingStates((prev) => ({ ...prev, categories: false }))
          ),
          fetchSubCategory().then(() =>
            setLoadingStates((prev) => ({ ...prev, subCategories: false }))
          ),
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    // eslint-disable-next-line
  }, []);

  const generatePrefix = useMemo(() => {
    if (values?.ClassID?.ClassID === 6) {
      const getNEValue = (name) => {
        if (!name) return '';
        if (name.includes('/')) {
          return name.split('/')[0].trim();
        }
        if (name.includes('-')) {
          return name.split('-')[0].trim();
        }
        return name.trim();
      };

      const NEValue = getNEValue(values?.Yarn_Count_ID?.Yarn_Count_Name || '');
      // make NEValue to 2 digits, if it is less than 2 digits, add 0 to the beginning
      let NEValue2Digits = NEValue;
      if (NEValue2Digits.length < 2) {
        NEValue2Digits = `0${NEValue2Digits}`;
      }
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const compositionValues = (() => {
        const name = values?.Composition_ID?.Composition_Name || '';
        const cleaned = name.replace(/\([^)]*\)/g, '');
        const matches = cleaned.match(/\d+%/g) || [];
        return matches.map((v) => v.replace('%', '')).join('');
      })();

      const colorCode = values?.Color?.Color_Code || '';
      const colorType = Number(values?.Color?.TypeID) === 2 ? 'CUS' : 'STD';

      // Format: YEAR-NE/BLEND/ColorCode-ColorType
      return `FG-${NEValue2Digits}${compositionValues}-${colorCode}-${colorType}`;
    }
    return '';
  }, [
    values?.ClassID?.ClassID,
    values?.Yarn_Count_ID?.Yarn_Count_Name,
    values?.Composition_ID?.Composition_Name,
    values?.Color?.Color_Code,
    values?.Color?.TypeID,
  ]);

  const PostClassName = () => {
    setClassDialogOpen(true);
  };

  const PostSubCategory = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Subcategory Name', { variant: 'error' });
      return;
    }
    const newOptionTrimmed = newOption.trim().toLowerCase();
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

  const PostInvSpecs = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Specification', { variant: 'error' });
      return;
    }
    const newOptionTrimmed = newOption.trim().toLowerCase();
    if (
      allInvSpecs.find((option) => option.InvSpecsName.trim().toLowerCase() === newOptionTrimmed)
    ) {
      enqueueSnackbar('This Specification already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        InvSpecsName: newOption,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
        Created_By: userData?.userDetails?.userId,
      };

      await Post('AddInvSpecs', dataToSend);
      GetInvSpecs();
      enqueueSnackbar('Specification Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const onsubmitie = handleSubmit(async (data) => {
    const dataToSend = {
      ItemID: currentData?.ItemID,
      ItemCode: values?.ClassID?.ClassID === 6 ? generatePrefix : currentData?.ItemCode || '',
      InvTypesID: values?.ClassID?.ClassID || 0,
      InvCatID: values?.Inv_Cat_Name?.Inv_Cat_ID ?? 0,
      SubCatID: values?.ItemSubCategory?.SubCat_ID ?? 0,
      MaterialTypeID: values?.MaterialType?.MaterialTypeID ?? 0,
      ItemSpecificationID: values?.InvSpecs?.InvSpecID || 0,
      YarnTypeID: values?.Yarn_Type_ID?.Yarn_Type_ID || 0,
      YarnCountID: values?.Yarn_Count_ID?.Yarn_Count_ID || 0,
      YarnCompositionID: values?.Composition_ID?.Composition_ID || 0,
      LoopID: null,
      UOMID: values?.UOMID?.UOM_ID ?? 0,
      ItemDescription:
        values?.ClassID?.ClassID === 6 ? generateProductName() : generateItemName() || 'N/A',
      ColorFamilyID: values?.ClassID?.isColorSensitive ? values?.ColorFamily?.ColorFamilyID : 0,
      ColorID: values?.ClassID?.isColorSensitive ? values?.Color?.ColorID : 0,
      SafetyStockQty: values?.SafetyStockQty ? Number(values?.SafetyStockQty) : 0,
      ReOrderQty: values?.ReOrderQty !== '' ? Number(values.ReOrderQty) : 0,
      SpareID: values?.SpareNameAndNo?.SpareId || 0,
      Org_Id: userData?.userDetails?.orgId ?? 0,
      Branch_Id: userData?.userDetails?.branchID ?? 0,
      Updated_By: userData?.userDetails?.userId ?? 0,
      Is_Active: true,
    };

    try {
      await Put('InvItemDBUpdate', dataToSend);
      enqueueSnackbar('Updated successfully!', { variant: 'success' });
      router.push(paths.dashboard.Production.Planning.ProductionBucket.root);
    } catch (error) {
      if (error?.response?.data?.Message) {
        enqueueSnackbar(error?.response?.data?.Message, { variant: 'error' });
      } else {
        console.error('Update Error:', error?.response?.data || error.message || error);
        enqueueSnackbar('Something went wrong while updating.', { variant: 'error' });
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

  const resetDetailForm = () => {
    setValue('PIID', null);
    setValue('ItemCode', null);
    setValue('PIQuantity', '');
    setValue('DOQuantity', '');
    setValue('Color', null);
    setValue('LotNo', '');
    setValue('LotLabel', '');
    setValue('Remarks', '');
    setEditingIndex(null);
  };

  // Table
  const table = useTable();

  const notFound = !ProductionBucketDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  //  dialog functions
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    FetchAllCategoryData();
    setDialogOpen(false);
  };

  const [dialogOpenSub, setDialogOpenSub] = useState(false);

  const handleSubCategoryOpen = () => {
    setDialogOpenSub(true);
  };

  const handleSubDialogClose = () => {
    fetchSubCategory();
    setDialogOpenSub(false);
  };

  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const handleClassDialogOpen = () => {
    setClassDialogOpen(true);
  };
  const handleClassDialogClose = () => {
    FetchAllClasses();
    setClassDialogOpen(false);
  };

  // useEffect(() => {
  //   setValue('Color', null);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [values?.ColorFamily]);
  useEffect(() => {
    if (currentData && allColors.length > 0) {
      const color = allColors.find((col) => col.ColorID === currentData.ColorID);
      if (color) setValue('Color', color);
      else setValue('Color', null);
    }
  }, [currentData, allColors, setValue]);

  const DontshowMaterialColorField = selectedClassId?.isColorSensitive;
  // -----------------------------------------------------------

  return isLoading ? (
    renderLoading
  ) : (
    <>
      <FormProvider methods={methods} onSubmit={onsubmitie}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h4" sx={{ mb: 3 }}>
                Edit Item
              </Typography>

              <Box
                rowGap={3}
                columnGap={3}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                }}
              >
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
                        isOptionEqualToValue={(option, value) => option?.ClassID === value?.ClassID}
                        value={values?.ClassID || null}
                      // disabled
                      />
                    </Box>
                    <Tooltip title="Add New Item Type" placement="top">
                      <IconButton color="primary" onClick={() => handleClassDialogOpen()}>
                        <Iconify icon="lets-icons:add-duotone" width={32} height={32} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                {values?.ClassID?.ClassID !== 6 ? (
                  <>
                    <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ flexGrow: 1 }}>
                          <RHFAutocomplete
                            name="Inv_Cat_Name"
                            label="Select Item Category"
                            placeholder="Choose an option"
                            fullWidth
                            options={allCategoryData}
                            getOptionLabel={(option) => option?.Inv_Cat_Name || ''}
                            isOptionEqualToValue={(option, value) =>
                              option.Inv_Cat_ID === value.Inv_Cat_ID
                            }
                            value={values?.Inv_Cat_Name || null}
                          />
                        </Box>

                        <Tooltip title="Add New Item Category" placement="top">
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
                            label="Select Item Sub Category"
                            placeholder="Choose an option"
                            fullWidth
                            options={itemSubCategory}
                            getOptionLabel={(option) => option?.SubCat_Name || ''}
                            isOptionEqualToValue={(option, value) =>
                              option?.SubCat_ID === value?.SubCat_ID
                            }
                            value={values?.ItemSubCategory || null}
                            isAddDisabled={!selectedCategory}
                          />
                        </Box>

                        <Tooltip title="Add New Sub Category" placement="top">
                          <IconButton color="primary" onClick={() => handleSubCategoryOpen()}>
                            <Iconify icon="lets-icons:add-duotone" width={32} height={32} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                    {DontshowMaterialColorField ? (
                      <>
                        <RHFAutocomplete
                          name="Color"
                          label="Color Name & Code"
                          placeholder="Choose an option"
                          fullWidth
                          options={allColors}
                          getOptionLabel={(option) => option?.ColorNameandCode}
                          isOptionEqualToValue={(option, value) =>
                            option.ColorID === value?.ColorID
                          }
                          value={values?.Color || null}
                        />
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
                      </>
                    ) : (
                      <RHFAutocomplete
                        name="SpareNameAndNo"
                        label="Spare Name and Code"
                        placeholder="Choose an option"
                        fullWidth
                        options={allSpareNames}
                        getOptionLabel={(option) => option?.SpareNameAndNo}
                        isOptionEqualToValue={(option, value) => option.SpareId === value?.SpareId}
                        value={values?.SpareNameAndNo || null}
                      />
                    )}

                    <AutocompleteWithAdd
                      name="InvSpecs"
                      label="Item Specification"
                      placeholder="Choose an option"
                      fullWidth
                      options={allInvSpecs}
                      getOptionLabel={(option) => option?.InvSpecsName || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.InvSpecID === value?.InvSpecID
                      }
                      value={values?.InvSpecs || null}
                      onAdd={PostInvSpecs}
                    />

                    <RHFTextField
                      name="ItemDescription"
                      label="Item Name"
                      type="text"
                      variant="outlined"
                      fullWidth
                      disabled
                      sx={{
                        gridColumn: { sm: 'span 2' },
                      }}
                      InputLabelProps={{ shrink: true }}
                      value={generateItemName() || ''}
                    />
                  </>
                ) : (
                  <>
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
                    {DontshowMaterialColorField && (
                      <>
                        <RHFAutocomplete
                          name="Color"
                          label="Color Name & Code"
                          placeholder="Choose an option"
                          fullWidth
                          options={allColors}
                          getOptionLabel={(option) => option?.ColorNameandCode}
                          isOptionEqualToValue={(option, value) =>
                            option.ColorID === value?.ColorID
                          }
                          value={values?.Color || null}
                        />
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
                      </>
                    )}
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
                    <RHFTextField
                      name="ItemCode"
                      label="Item Code"
                      variant="outlined"
                      fullWidth
                      disabled
                      InputLabelProps={{ shrink: true }}
                      value={generatePrefix || ''}
                    />
                  </>
                )}

                <RHFAutocomplete
                  name="UOMID"
                  label="Unit of Measurement"
                  placeholder="Choose an option"
                  fullWidth
                  options={allItemUnit}
                  getOptionLabel={(option) => option?.UOMName || ''}
                  isOptionEqualToValue={(option, value) => option?.UOM_ID === value?.UOM_ID}
                />
                {/* <RHFTextField
                  name="SafetyStockQty"
                  label="Safety Quantity"
                  type="number"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="body2">{values?.UOMID?.UOMName}</Typography>
                      </InputAdornment>
                    ),
                  }}
                /> */}

                <RHFTextField
                  name="ReOrderQty"
                  label="Reorder Quantity"
                  type="number"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="body2">{values?.UOMID?.UOMName}</Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Card>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
              >
                Update
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>
      <AddDptDialog
        uploadOpen={dialogOpen}
        uploadClose={() => handleDialogClose()}
        tableData={allCategoryData}
      />
      <InvTypeDialog
        uploadClose={() => handleClassDialogClose()}
        uploadOpen={classDialogOpen}
        tableData={allClassName}
      />
      <AddSubCategory
        uploadClose={() => handleSubDialogClose()}
        uploadOpen={dialogOpenSub}
        tableData={itemSubCategory}
      />
    </>
  );
}

ProductionBucketEditForm.propTypes = {
  currentData: PropTypes.object.isRequired,
};
