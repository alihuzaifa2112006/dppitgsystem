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
  TableContainer,
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

import { Get, Post } from 'src/api/apibasemethods';
import { decrypt, encrypt } from 'src/api/encryption';
import { convertBDTtoUSD, convertUSDtoBDT } from 'src/utils/BDTtoUSD';

import DetailTableRow from './detail-table-row';
import AddDptDialog from 'src/sections/inv-category/AddDialog';
import AddDialogOrigin from './AddDialogOrigin';
import AddSubCategory from 'src/sections/inventoryType/AddDialog';
import PricelistDialog from '../quotation/PricelistDialog';
import { de } from 'date-fns/locale';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import { fCurrency, fNumber } from 'src/utils/format-number';
// ----------------------------------------------------------------------

export default function ItemOpenCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [allCategoryData, setallCategoryData] = useState([]);
  const [allOrigins, setAllOrigins] = useState([]);
  const [allCurrencies, setallCurrencies] = useState([]);

  const [itemSubCategory, setItemSubCategory] = useState([]);
  const [allItemUnit, setallItemUnit] = useState([]);
  const [allUnitLocations, setAllUnitLocations] = useState([]);
  const [storageLocationsByStore, setStorageLocationsByStore] = useState([]);
  const [allClassName, setallClassName] = useState([]);
  const [allSources, setAllSources] = useState([]);
  const [allMaterialTypes, setAllMaterialTypes] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [allMaterialData, setAllMaterialData] = useState({});
  const [allSourceData, setallSourceData] = useState([]);
  const [allScopeData, setallScopeData] = useState([]);
  const [allVendorData, setallVendorData] = useState([]);
  const [ItemOpen, setItemOpen] = useState([]);
  const [BDTtoUSD, setBDTtoUSD] = useState(0);
  const [USDtoBDT, setUSDtoBDT] = useState(0);
  const [allColorFamily, setAllColorFamily] = useState([]);
  const [allColors, setallColors] = useState([]);
  const [allCounts, setAllCounts] = useState([]);
  const [allCompositions, setAllCompositions] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [allItemCode, setallItemCode] = useState([]);
  const [allSuppliers, setallSuppliers] = useState([]);
  const [ItemOpenDetails, setItemOpenDetails] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isLoadingStorageLocations, setIsLoadingStorageLocations] = useState(false);
  const [isLoading, setLoading] = useState(true);

  const NewItemOpenSchema = Yup.object().shape({
    // ClassID
    ClassID: Yup.object()
      .shape({
        ClassID: Yup.number().required('Item Type is required'),
      })
      .nullable()
      .required('Item Type is required'),
    // Inv_Cat_Name: Yup.object()
    //   .shape({
    //     Inv_Cat_ID: Yup.number().required('Item Category is required'),
    //   })
    //   .nullable()
    //   .required('Item Category is required'),
    
    ItemOpen: Yup.object().required('Please Select Item'),
    // VendorName: Yup.object().nullable().required('Vendor Name is required'),
    UOMID: Yup.object()
      .shape({
        UOM_ID: Yup.number().required('Item Unit is required'),
      })
      .nullable()
      .required('Item Unit is required'),

    Currency: Yup.object()
      .shape({
        Currency_ID: Yup.number().required('Currency is required'),
      })
      .nullable()
      .required('Currency is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewItemOpenSchema),
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

  // const OverAllTotalQunatityInKG = ItemOpenDetails.reduce((total, detail) => {
  //   const quantity = parseFloat(detail.OpeningStockQuantity);
  //   const uom = detail?.UOM?.UOMID;
  //   const q = uom === 7 ? quantity : LBstoKG(quantity);
  //   return total + q;
  // }, 0);

  const generateProductName = () => {
    const productCode = `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${
      values?.Yarn_Count_ID?.Yarn_Count_Name || ''
    } -  ${values?.Composition_ID?.Composition_Name || ''}  (${values?.Color?.ColorName || ''} - ${
      values?.Color?.Color_Code || ''
    })`;
    return productCode;
  };

  const PostOrigin = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Payment Term', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (allOrigins.find((option) => option.Origin_Name.trim().toLowerCase() === newOptionTrimmed)) {
      enqueueSnackbar('This Origin already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        Origin_Name: newOption,
        SourceID: values?.Source?.SourceID,
        Is_Active: true,
        Created_By: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddOrigin', dataToSend);
      fetchOrigin();
      enqueueSnackbar('Origin Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  // console.log('errors', errors)

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

  useEffect(() => {
    const AllClassNameData = async () => {
      try {
        const response = await Get(
          `GetAllClasses?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );

        setallClassName(response.data?.Data);
      } catch (error) {
        console.error(error);
      }
    };

    AllClassNameData();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const selectedClassId = watch('ClassID');

  const FetchAllCategoryData = useCallback(async () => {
    if (selectedClassId?.ClassID) {
      try {
        const response = await Get(
          `InvCategoryGetByClassId?classId=${selectedClassId?.ClassID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        // console.log('Category Response:', response.data);
        setallCategoryData(response.data || []);
      } catch (error) {
        console.error(error);
      }
    } else {
      setallCategoryData([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, selectedClassId?.ClassID]);

  useEffect(() => {
    FetchAllCategoryData();
    setValue('Inv_Cat_Name', null);
  }, [selectedClassId?.ClassID, FetchAllCategoryData, setValue]);

  const values = watch();

  useEffect(() => {
    const FetchAllUnitLocations = async () => {
      try {
        const response = await Get(
          `GetAllStorelocations?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setAllUnitLocations(response.data);
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      FetchAllUnitLocations();
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const unitLocation = watch('StoreID');

  useEffect(() => {
    const fetchStorageLocations = async () => {
      if (unitLocation?.StoreID) {
        setIsLoadingStorageLocations(true);
        // Reset StorageLocation immediately
        setValue('StorageLocation', null);

        try {
          const response = await Get(
            `GetStorageLocationsByUnitLocation?StoreID=${unitLocation?.StoreID}&Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
          );
          setStorageLocationsByStore(response.data);
        } catch (error) {
          console.error('API Error:', error);
          setStorageLocationsByStore([]);
        } finally {
          setIsLoadingStorageLocations(false);
        }
      } else {
        setStorageLocationsByStore([]);
        setValue('StorageLocation', null);
        setIsLoadingStorageLocations(false);
      }
    };

    fetchStorageLocations();
  }, [unitLocation, userData?.userDetails?.orgId, userData?.userDetails?.branchID, setValue]);

  const selectedCategory = watch('Inv_Cat_Name');

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
    // eslint-disable-next-line
  }, [selectedCategory, fetchSubCategory]);

  const selectedSubCategory = watch('ItemSubCategory');

  const fetchItemsBySubCategory = useCallback(async () => {
    if (selectedSubCategory?.SubCat_ID) {
      try {
        const response = await Get(`itemsgetBySubCatId/${selectedSubCategory?.SubCat_ID}`);
        const updatedData = response?.data?.Data.map((item) => ({
          ...item,
          ClassID: item?.InvTypesID,
          UOM: { UOMName: item?.UOMName, UOM_ID: item?.UOMID },
        }));
        setItemOpen(updatedData);
      } catch (error) {
        console.error(error);
        setItemOpen([]);
      }
    } else {
      setItemOpen([]);
    }
  }, [selectedSubCategory]);

  useEffect(() => {
    fetchItemsBySubCategory();
    setValue('ItemOpen', null);
    // eslint-disable-next-line
  }, [selectedSubCategory, fetchItemsBySubCategory]);

  const selectedItem = watch('ItemOpen');

  useEffect(() => {
    setValue('UOMID', selectedItem?.UOM || null);
    setValue('ItemDescription', selectedItem?.ItemDescription || '');
    setValue(
      'ColorFamily',
      allColorFamily.find((item) => item.ColorFamilyID === selectedItem?.ColorFamilyID) || null
    );
    setValue('Color', allColors.find((item) => item.ColorID === selectedItem?.ColorID) || null);
    setValue('SafetyQuantity', selectedItem?.SafetyStockQty || 0);
    setValue('ReorderQuantity', selectedItem?.ReOrderQty || 0);

    if (selectedItem?.ClassID === 6) {
      setValue(
        'Yarn_Type_ID',
        allTypes.find((x) => x.Yarn_Type_ID === selectedItem?.YarnTypeID) || null
      );
      setValue(
        'Yarn_Count_ID',
        allCounts.find((x) => x.Yarn_Count_ID === selectedItem?.YarnCountID) || null
      );
      setValue(
        'Composition_ID',
        allCompositions.find((x) => x.Composition_ID === selectedItem?.YarnCompositionID) || null
      );
    } else {
      setValue('Yarn_Type_ID', null);
      setValue('Yarn_Count_ID', null);
      setValue('Composition_ID', null);
    }
    setValue('Description', selectedItem?.ItemDescription || '');
    setValue('InvSpecsName', selectedItem?.InvSpecsName || '-');
  }, [selectedItem, allColors, allColorFamily, allTypes, allCounts, allCompositions, setValue]);

  const OverAllTotalAmount = ItemOpenDetails.reduce((total, detail) => {
    const quantity = parseFloat(detail.OpeningStockQuantity);
    const unitPrice = parseFloat(detail.AveragePrice);
    // const currencyID = detail?.Currency?.Currency_ID;

    // const price = currencyID === 8 ? unitPrice * BDTtoUSD : unitPrice;

    return total + quantity * unitPrice;
  }, 0);

  const KGtoLBs = (kg) => kg * 2.20462;

  const OverAllTotalQunatityInLbs = ItemOpenDetails.reduce((total, detail) => {
    const quantity = parseFloat(detail.OpeningStockQuantity);
    const uom = detail?.UOM?.UOM_ID;
    const q = uom === selectedItem?.UOMID ? quantity : KGtoLBs(quantity);
    return total + q;
  }, 0);

  useEffect(() => {
    const fetchAllUOM = async () => {
      try {
        const response = await Get(
          `GetAllActiveUOM?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        // console.log('UOM Response', response.data.Data);
        setallItemUnit(response?.data?.Data || []);
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
        // console.log('Supplier', response.data?.Data);
        setallSuppliers(response.data?.Data);
      } catch (error) {
        console.error(error);
      }
    };

    AllSupplierData();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await Get(`getActiveCurrencies`);
        // console.log('Currency', response.data.Data);
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

  // setallSourceData

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

  // Origin Drop down on the basis of the source

  const selectedOrigin = watch('Source');

  const fetchOrigin = useCallback(async () => {
    if (selectedOrigin?.SourceID) {
      try {
        const response = await Get(
          `GetOriginsBySourceID?sourceID=${selectedOrigin.SourceID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        if (response.status === 200) {
          setAllOrigins(response.data);
        }
      } catch (error) {
        console.error(error);
        setAllOrigins([]);
      }
    } else {
      setAllOrigins([]);
    }
  }, [selectedOrigin, userData?.userDetails?.branchID, userData?.userDetails?.orgId]);
  useEffect(() => {
    fetchOrigin();
    setValue('Origin', null);
  }, [setValue, fetchOrigin]);

  // setallScopeData

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

  // this is not data of our

  const GetColors = useCallback(async () => {
    try {
      const response = await Get(
        `colors/all?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const newdata = response.data.Data.filter((x) => x.SL !== '1').map((item) => ({
        ...item,
        ColorNickName: `${item.ColorName} - ${item.Color_Code}`,
      }));

      // const filteredData = newdata.filter(
      //   (item) => item.ColorFamilyID === values?.ColorFamily?.ColorFamilyID
      // );
      setallColors(newdata);
    } catch (error) {
      console.log(error);
      setallColors([]);
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

  const fetchExchangeRate = useCallback(async () => {
    const rate = await convertBDTtoUSD(1);
    const rate2 = await convertUSDtoBDT(1);
    if (rate) {
      setBDTtoUSD(rate); // This is the multiplier, not rate for 1 BDT
    }
    if (rate2) {
      setUSDtoBDT(rate2); // This is the multiplier, not rate for 1 BDT
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        GetColors(),
        APIGetCompositionList(),
        APIGetTypeList(),
        GetCounts(),
        FetchColorFamily(),
      ]);
      setLoading(false);
    };
    fetchExchangeRate();
    fetchData();
  }, [
    GetColors,
    APIGetCompositionList,
    APIGetTypeList,
    GetCounts,
    FetchColorFamily,
    fetchExchangeRate,
  ]);

  const resetOnPI = () => {
    setValue('ItemCode', null);
    setValue('Color', null);
    setValue('PIQuantity', '');
    setValue('DOQuantity', '');
    setValue('LotNo', '');
    setValue('LotLabel', '');
    setValue('Remarks', '');
  };

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

  const onsubmitie = handleSubmit(async (data) => {
    if (ItemOpenDetails.length === 0) {
      enqueueSnackbar('Please add at least one stock detail', { variant: 'error' });
      return;
    }
    const dataToSend = {
      ItemID: data?.ItemOpen?.ItemID,
      UOMID: data?.UOMID?.UOM_ID ?? 0,
      CurrencyID: data?.Currency?.Currency_ID ?? 0,
      Org_Id: userData?.userDetails?.orgId ?? 0,
      Branch_Id: userData?.userDetails?.branchID ?? 0,
      Created_By: userData?.userDetails?.userId ?? 0,
      Is_Active: true,
      Details: ItemOpenDetails.map((item) => ({
        VendorID: item?.VendorName?.VendorID ?? 0,
        LocationID: item?.StoreID?.StoreID ?? 0,
        StorageID: item?.StorageLocation?.StorageID ?? 0,
        OpenStockQty: item?.OpeningStockQuantity,
        AveragePrice: item?.AveragePrice,
        TotalPriceinBDT: item?.TotalPriceinBDT,
        TotalPriceinUSD: item?.TotalPriceinUSD,
        Is_Cancelled: false,
      })),
    };

    try {
      await Post('InvItemOpening', dataToSend);
      enqueueSnackbar('Item Transaction created successfully!', { variant: 'success' });
      router.push(paths.dashboard.InventoryManagement.ItemOpen.root);
    } catch (error) {
      if (error?.response?.data?.Message) {
        enqueueSnackbar(error?.response?.data?.Message, { variant: 'error' });
      } else {
        console.error('Save Error:', error?.response?.data || error.message || error);
        enqueueSnackbar('Something went wrong while saving.', { variant: 'error' });
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

  const handleAddDetail = () => {
    // Validation checks
    if (!values?.ItemOpen) {
      enqueueSnackbar('Please select Item first', { variant: 'error' });
      return;
    }
    if (!values?.Currency) {
      enqueueSnackbar('Please select Currency first', { variant: 'error' });
      return;
    }

    if (!values?.VendorName) {
      enqueueSnackbar('Vendor Name is required', { variant: 'error' });
      return;
    }

    if (!values?.StoreID) {
      enqueueSnackbar('Store is required', { variant: 'error' });
      return;
    }

    if (!values?.StorageLocation) {
      enqueueSnackbar('Storage Location is required', { variant: 'error' });
      return;
    }

    if (!values?.OpeningStockQuantity) {
      enqueueSnackbar('Opening Stock Quantity is required', { variant: 'error' });
      return;
    }

    if (!values?.AveragePrice) {
      enqueueSnackbar('Average Price is required', { variant: 'error' });
      return;
    }

    const detail = {
      VendorName: values.VendorName, // full object
      StoreID: values.StoreID || null,
      StorageLocation: values.StorageLocation || null,
      UOM: values?.ItemOpen?.UOM || null,
      Currency: values?.Currency || null,
      OpeningStockQuantity: values.OpeningStockQuantity, // full object
      AveragePrice: values.AveragePrice, // full object
      TotalPriceinUSD:
        values?.Currency?.Currency_ID === 8
          ? (values.OpeningStockQuantity * values.AveragePrice) / USDtoBDT
          : values.OpeningStockQuantity * values.AveragePrice,
      TotalPriceinBDT:
        values?.Currency?.Currency_ID === 8
          ? values.OpeningStockQuantity * values.AveragePrice
          : values.OpeningStockQuantity * values.AveragePrice * USDtoBDT,
    };

    if (editingIndex !== null) {
      const updatedDetails = [...ItemOpenDetails];
      updatedDetails[editingIndex] = detail;
      setItemOpenDetails(updatedDetails);
    } else {
      setItemOpenDetails((prev) => [...prev, detail]);
    }

    resetDetailForm();
  };

  const resetDetailForm = () => {
    setValue('VendorName', null);
    setValue('StoreID', null);
    setValue('StorageLocation', null);
    setValue('OpeningStockQuantity', '');
    setValue('AveragePrice', '');
    setValue('TotalPriceinUSD', '');
    setValue('TotalPriceinBDT', '');
    setEditingIndex(null);
  };

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = ItemOpenDetails.filter((row) => row !== rowToDelete);
    setItemOpenDetails(updatedDetails);

    // If we're deleting the row being edited, reset the form
    if (editingIndex !== null && ItemOpenDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);
    }
  };

  const handleEditDetail = (index) => {
    const detail = ItemOpenDetails[index];
    setValue('VendorName', detail?.VendorName);
    setValue('StoreID', detail?.StoreID);
    // Set StorageLocation only after a small delay to ensure options are loaded
    setTimeout(() => {
      setValue('StorageLocation', detail?.StorageLocation);
    }, 300);
    setValue('OpeningStockQuantity', detail?.OpeningStockQuantity);
    setValue('AveragePrice', detail?.AveragePrice);
    setValue('TotalPriceinUSD', detail?.TotalPriceinUSD);
    setValue('TotalPriceinBDT', detail?.TotalPriceinBDT);
    setEditingIndex(index);
  };

  // Table
  const table = useTable();

  const DetailsTableHead = [
    { id: 'VendorName', label: 'Vendor Name', minWidth: 220 },
    { id: 'StoreID', label: 'Store', minWidth: 200 },
    { id: 'StorageLocation', label: 'Storage Location', minWidth: 120 },
    { id: 'OpeningStockQuantity', label: 'Opening Stock Quantity', minWidth: 120, align: 'center' },
    { id: 'AveragePrice', label: 'Average Price', minWidth: 120, align: 'center' },
    { id: 'TotalPriceinUSD', label: 'Total Value in USD', minWidth: 120, align: 'center' },
    { id: 'TotalPriceinBDT', label: 'Total Value in BDT', minWidth: 120, align: 'center' },
    { id: '', label: '' },
  ];

  const notFound = !ItemOpenDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  //  dailog function
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpenOrigin, setDialogOpenOrigin] = useState(false);

  const handleOriginDialogOpen = () => {
    setDialogOpenOrigin(true);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    FetchAllCategoryData();
    setDialogOpen(false);
  };
  //  dailog function
  const [dialogOpenSub, setDialogOpenSub] = useState(false);

  const handleSubCategoryOpen = () => {
    setDialogOpenSub(true);
  };

  const handleSubDialogClose = () => {
    fetchSubCategory();
    setDialogOpenSub(false);
  };
  // -----------------------------------------------------------

  // useEffect(() => {
  //   setValue('Color', null);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [values?.ColorFamily]);

  // useEffect(() => {
  //   setValue('StorageLocation', null);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [values?.StoreID]);

  const unit = values?.UOM?.UOMName;
  const currencySymbol = values?.Currency?.Currency_ID === 8 ? '৳' : '$';
  // const watchedCat = watch('ItemCategory');
  // console.log('watchedCat', watchedCat);

  const ShowMaterialColorField = selectedClassId?.isColorSensitive;

  // -----------------------------------------------------------

  return isLoading ? (
    renderLoading
  ) : (
    <>
      <FormProvider methods={methods} onSubmit={onsubmitie}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <h3>Item Transaction</h3>

              <Box
                rowGap={3}
                columnGap={3}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
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
                      />
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ flexGrow: 1 }}>
                      <RHFAutocomplete
                        name="Inv_Cat_Name"
                        label="Item Category"
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

                <RHFAutocomplete
                  name="ItemOpen"
                  label="Item"
                  placeholder="Choose an option"
                  fullWidth
                  options={ItemOpen}
                  getOptionLabel={(option) => option?.ItemCode || ''}
                  isOptionEqualToValue={(option, value) => option.ItemID === value.ItemID}
                  value={values?.ItemOpen || null}
                />
                {selectedClassId?.ClassID === 6 && (
                  <>
                    <RHFAutocomplete
                      name="Yarn_Type_ID"
                      label="Yarn Type"
                      placeholder="Choose an option"
                      fullWidth
                      disabled
                      options={allTypes}
                      value={values?.Yarn_Type_ID || null}
                      getOptionLabel={(option) => option?.Yarn_Type || ''}
                      // isOptionEqualToValue={(option, value) => {
                      //   if (!option || !value) return false;
                      //   return option.Yarn_Type_ID === value.Yarn_Type_ID;
                      // }}
                    />
                    <RHFAutocomplete
                      // sx={{ gridColumn: { xs: 'span 2' } }}
                      name="Yarn_Count_ID"
                      label="Yarn Count"
                      placeholder="Choose an option"
                      fullWidth
                      options={allCounts}
                      disabled
                      value={values.Yarn_Count_ID || null}
                      getOptionLabel={(option) => option?.Yarn_Count_Name || ''}
                      // isOptionEqualToValue={(option, value) => {
                      //   if (!option || !value) return false;
                      //   return option.Yarn_Count_ID === value.Yarn_Count_ID;
                      // }}
                    />
                    <RHFAutocomplete
                      name="Composition_ID"
                      label="Composition"
                      placeholder="Choose an option"
                      fullWidth
                      disabled
                      options={allCompositions}
                      value={values?.Composition_ID || null}
                      getOptionLabel={(option) => option?.Composition_Name || ''}
                      // isOptionEqualToValue={(option, value) => {
                      //   if (!option || !value) return false;
                      //   return option.Composition_ID === value.Composition_ID;
                      // }}
                    />

                    {/* <RHFTextField
                      sx={{ gridColumn: { xs: 'span 2' } }}
                      name="Description"
                      label="Product Description"
                      variant="outlined"
                      fullWidth
                      disabled
                      value={generateProductName() || ''}
                    /> */}
                  </>
                )}
                {ShowMaterialColorField && (
                  <>
                    <RHFAutocomplete
                      name="ColorFamily"
                      label="Color Family"
                      options={allColorFamily}
                      disabled
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
                      disabled
                      options={allColors}
                      getOptionLabel={(option) => option?.ColorNameandCode}
                      isOptionEqualToValue={(option, value) => option.ColorID === value?.ColorID}
                      value={values?.Color || null}
                    />
                  </>
                )}

                <RHFTextField
                  name="InvSpecsName"
                  label="Item Specification"
                  // sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                  variant="outlined"
                  fullWidth
                  disabled
                  // value={values? || ''}
                />
                <RHFTextField
                  name="Description"
                  label="Item Description"
                  sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                  variant="outlined"
                  fullWidth
                  disabled
                  // value={values? || ''}
                />
                {/* <RHFTextField
                  name="SafetyQuantity"
                  label="Safety Quantity"
                  type="number"
                  disabled
                  variant="outlined"
                  fullWidth
                /> */}

                <RHFTextField
                  name="ReorderQuantity"
                  label="Reorder Quantity"
                  type="number"
                  disabled
                  variant="outlined"
                  fullWidth
                />
                <RHFAutocomplete
                  name="UOMID"
                  label="Unit of Measurement"
                  placeholder="Choose an option"
                  fullWidth
                  options={allItemUnit}
                  getOptionLabel={(option) => option?.UOMName || ''}
                  disabled
                  isOptionEqualToValue={(option, value) => option?.UOM_ID === value?.UOM_ID}
                  value={values?.UOMID || null}
                />
                <RHFAutocomplete
                  name="Currency"
                  label="Currency"
                  placeholder="Choose an option"
                  fullWidth
                  options={allCurrencies}
                  getOptionLabel={(option) => option?.Currency_Code}
                  value={values?.Currency || null}
                  disabled={ItemOpenDetails?.length > 0}
                  // isOptionEqualToValue={(option, value) =>
                  //   option.Currency_ID === value?.Currency_ID
                  // }
                />

                {/* {watchedCat?.Cat_Name === 'Package Material' && (
                  <RHFAutocomplete
                    name="Scope"
                    label="Scope"
                    placeholder="Choose an option"
                    fullWidth
                    options={allScopeData}
                    getOptionLabel={(option) => option?.Scope_Name || ''}
                    isOptionEqualToValue={(option, value) => option?.Scope_ID === value?.Scope_ID}
                  />
                )} */}
              </Box>
            </Card>

            <Card sx={{ p: 3, mt: 3 }}>
              <h3>Stock</h3>

              <Box
                rowGap={3}
                columnGap={3}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                }}
              >
                <RHFAutocomplete
                  name="VendorName"
                  label="Vendor Name"
                  placeholder="Choose an option"
                  fullWidth
                  options={allVendorData}
                  getOptionLabel={(option) => option?.VendorName || ''}
                  isOptionEqualToValue={(option, value) => option?.VendorID === value?.VendorID}
                  value={values?.VendorName || null}
                />
                <RHFAutocomplete
                  name="StoreID"
                  label="Store"
                  placeholder="Choose an option"
                  fullWidth
                  options={allUnitLocations}
                  getOptionLabel={(option) => option?.StoreName || ''}
                  isOptionEqualToValue={(option, value) => option?.StoreID === value?.StoreID}
                  value={values?.StoreID || null}
                />
                <RHFAutocomplete
                  name="StorageLocation"
                  label="Storage Location"
                  placeholder="Choose an option"
                  fullWidth
                  options={storageLocationsByStore}
                  getOptionLabel={(option) => option?.StorageName || ''}
                  // isOptionEqualToValue={(option, value) => option?.StorageID === value?.StorageID}
                  value={values?.StorageLocation || null}
                  disabled={isLoadingStorageLocations || !values.StoreID}
                />
                <RHFTextField
                  name="OpeningStockQuantity"
                  label="Openining Quantity"
                  type="number"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="body2">{values?.UOMID?.UOMName || ''}</Typography>
                      </InputAdornment>
                    ),
                  }}
                />
                <RHFTextField
                  name="AveragePrice"
                  label="Average Price"
                  type="text"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography variant="body2">{currencySymbol}</Typography>
                      </InputAdornment>
                    ),
                  }}
                />

                <RHFTextField
                  name="Value"
                  label="Value"
                  type="text"
                  variant="outlined"
                  fullWidth
                  disabled
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography variant="body2">{currencySymbol}</Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Stack alignItems="flex-end" direction="row-reverse" sx={{ gap: 2, mt: 2 }}>
                <Button color="primary" onClick={handleAddDetail} variant="contained">
                  {editingIndex !== null ? 'Update' : 'Add'}
                </Button>
                {editingIndex !== null && (
                  <Button color="error" onClick={resetDetailForm} variant="outlined" sx={{ mt: 1 }}>
                    Cancel
                  </Button>
                )}
              </Stack>

              {ItemOpenDetails.length > 0 && (
                <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
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
                        {ItemOpenDetails.map((row, index) => (
                          <DetailTableRow
                            key={index}
                            row={row}
                            onDeleteRow={() => DeleteDetailTableRow(row)}
                            onEditRow={() => handleEditDetail(index)}
                          />
                        ))}

                        <TableEmptyRows
                          height={denseHeight}
                          emptyRows={emptyRows(
                            table.page,
                            table.rowsPerPage,
                            ItemOpenDetails.length
                          )}
                        />

                        <TableNoData notFound={notFound} />
                      </TableBody>
                    </Table>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="green">
                        {/* eslint-disable-next-line */}
                        {`Total Quantity: ${fNumber(OverAllTotalQunatityInLbs)} ${
                          selectedItem?.UOMName || ''
                        }`}
                      </Typography>
                      <Typography variant="body2" color="green">
                        {/* eslint-disable-next-line */}
                        {`Total Amount: ${values?.Currency?.Currency_ID === 8 ? '৳' : '$'}${fNumber(
                          OverAllTotalAmount
                        )}`}
                      </Typography>
                    </Box>
                  </Scrollbar>
                </TableContainer>
              )}
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
      <AddDptDialog
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
