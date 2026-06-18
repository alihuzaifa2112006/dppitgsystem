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
  Paper,
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

import { Get, Post, Put } from 'src/api/apibasemethods';
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
import PropTypes from 'prop-types';
// ----------------------------------------------------------------------

export default function DispoderEditForm({ currentData }) {
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
  const [allPrintUnit, setallPrintUnit] = useState([]);
  const [allProcurementUnit, setallProcurementUnit] = useState([]);
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

  const [PIID, setPIID] = useState([]);
  const [allColorFamily, setAllColorFamily] = useState([]);
  const [allColors, setallColors] = useState([]);
  const [allCounts, setAllCounts] = useState([]);
  const [allCompositions, setAllCompositions] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [allItemCode, setallItemCode] = useState([]);
  const [ItemOpenDetails, setItemOpenDetails] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [allSuppliers, setallSuppliers] = useState([]);
  const [allVendorData, setallVendorData] = useState([]);
  const [BDTtoUSD, setBDTtoUSD] = useState(0);
  const [USDtoBDT, setUSDtoBDT] = useState(0);
  const [isLoadingStorageLocations, setIsLoadingStorageLocations] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const NewItemOpenSchema = Yup.object().shape({
    // ClassID

    // ClassID: Yup.object()
    //   .shape({
    //     ClassID: Yup.number().required('Item Type is required'),
    //   })
    //   .nullable()
    //   .required('Item Type is required'),

    // Inv_Cat_Name: Yup.object()
    //   .shape({
    //     Inv_Cat_ID: Yup.number().required('Item Category is required'),
    //   })
    //   .nullable()
    //   .required('Item Category is required'),

    // ItemSubCategory: Yup.object()
    //   .shape({
    //     SubCat_ID: Yup.number().required('Item Sub Category is required'),
    //   })
    //   .nullable()
    //   .required('Item Sub Category is required'),

    // //  MaterialType
    // // MaterialType: Yup.object()
    // //   .shape({
    // //     MaterialTypeID: Yup.number().required('Material Type is required'),
    // //   })
    // //   .nullable()
    // //   .required('Material Type is required'),

    // // Specification
    // ItemDescription: Yup.string().nullable().required('Specification / Dimensions is required'),

    // // Origin

    // Origin: Yup.object()
    //   .shape({
    //     Origin_ID: Yup.number().required('Origin is required'),
    //   })
    //   .nullable()
    //   .required('Origin is required'),
    // Color

  });
  const defaultValues = useMemo(() => {
    const matchedSource = allSources?.find((src) => src.SourceID === currentData.SourceID) || null;

    // Then find matching origin (only if source matches)
    const matchedOrigin =
      (matchedSource && allOrigins?.find((org) => org.Origin_ID === currentData.Origin_ID)) || null;
    // Return empty defaults if no currentData or required data isn't loaded
    console.log('currentData', currentData);
    if (!currentData || !allClassName || !allCategoryData) {
      // Find matching source first
      return {
        ClassID: null,
        Inv_Cat_Name: null,
        ItemSubCategory: null,
        MaterialType: null,
        ItemDescription: '',
        Source: null,
        Origin: null,
        UOMID: null,
        Color: null,
        OpeningStockQuantity: 0,
        AveragePrice: 0,
        Currency: null,
        Value: 0,
        SafetyQuantity: 0,
        ReorderQuantity: 0,
        Scope: null,
        ItemID: null,
        Material_Code: '',
        Org_ID: userData?.userDetails?.orgId || 1,
        Branch_ID: userData?.userDetails?.branchID || 1,
        Created_By: userData?.userDetails?.userId || 1,
        Is_Active: true,
      };
    }
    return {
      // Direct mappings for read-only fields
      ClassName: currentData?.ClassName || '',
      Inv_Cat_Name: currentData?.Inv_Cat_Name || '',
      SubCat_Name: currentData?.SubCat_Name || '',
      ItemCode: currentData?.ItemCode || '',
      InvSpecsName: currentData?.InvSpecsName || '',
      ItemDescription: currentData?.ItemDescription || '',

      // Keep ID mappings if needed for logic or hidden fields
      ClassID: currentData?.ClassID || null,
      Inv_Cat_ID: currentData?.Inv_Cat_ID || null,

      Yarn_Type_ID: allTypes?.find((yarn) => yarn.Yarn_Type_ID === currentData.Yarn_Type_ID) || null,
      Yarn_Count_ID: allCounts?.find((yarn) => yarn.Yarn_Count_ID === currentData.Yarn_Count_ID) || null,
      Composition_ID: allCompositions?.find((comp) => comp.Composition_ID === currentData.Composition_ID) || null,

      ColorFamily: allColorFamily?.find(c => c.ColorFamilyID === currentData.ColorFamilyID) || null,
      Color: allColors?.find((col) => col.ColorID === currentData.ColorID) || null,

      UOMID: allItemUnit?.find((uom) => uom.UOM_ID === currentData.UOMID) || null,
      Currency: allCurrencies?.find((curr) => curr.Currency_ID === currentData.CurrencyID) || null,

      // Stock Information
      OpeningStockQuantity: 0,
      AveragePrice: 0,
      Value: 0,

      // Hidden/System
      ItemID: currentData.ItemID || null,
      Org_ID: userData?.userDetails?.orgId || currentData.Org_ID || 1,
      Branch_ID: userData?.userDetails?.branchID || currentData.Branch_ID || 1,
      Created_By: userData?.userDetails?.userId || currentData.Created_By || 1,
      Is_Active: currentData.Is_Active ?? true,
    };
    // eslint-disable-next-line
  }, [
    currentData,
    allTypes, // Needed?
    allCounts,
    allCompositions,
    allColors,
    allColorFamily,
    allItemUnit,
    allCurrencies,
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
  ]);

  // Set Details from currentData
  useEffect(() => {
    if (currentData?.Details) {
      const details = currentData.Details.map(detail => ({
        ...detail,
        OpeningStockQuantity: detail.OpenStockQty, // Map open stock qty
        VendorName: { VendorID: detail.VendorID, VendorName: detail.VendorName },
        StoreID: { StoreID: detail.StorageID, StoreName: detail.StoreName || '' },
        StorageLocation: { StorageID: detail.LocationID, StorageName: detail.LocationName || '' },
      }));
      setItemOpenDetails(details);
    }
  }, [currentData]);
  const methods = useForm({
    resolver: yupResolver(NewItemOpenSchema),
    defaultValues, // Initialize form with empty/default values
  });

  useEffect(() => {
    // Only reset when all required data is loaded and currentData exists
    if (currentData) {
      methods.reset(defaultValues);
    }
  }, [currentData, defaultValues, methods]);

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

  // const values = watch(); // Already defined or watched

  const selectedClassId = values?.ClassID;
  const selectedCategory = values?.Inv_Cat_ID;

  const ShowMaterialColorField =
    selectedClassId === 3 ||
    (selectedClassId !== 3 && selectedCategory === 5);

  // const currencySymbol = values?.Currency?.Currency_Symbol || values?.Currency?.Symbol || '';
  // Wait, original logic was: values?.Inv_Cat_Name?.ClassID !== 3 && values?.Inv_Cat_Name?.Inv_Cat_ID === 5
  // But Inv_Cat_Name is now a string. So we probably rely on Inv_Cat_ID.
  // Let's rely on data values:
  // ClassID 3 = Fabric? 
  // Inv_Cat_ID 5 = ?
  // I will use currentData logic or values logic if they are populated numbers now.

  // Re-deriving ShowMaterialColorField using numeric IDs set in defaultValues
  // const ShowMaterialColorField = values.ClassID === 3 || (values.ClassID !== 3 && values.Inv_Cat_ID === 5);

  // Actually, let's keep it simple. If we don't have the complex object, we use ID checks.

  // const [ItemOpen, setItemOpen] = useState([]); // Removed as Item dropdown is replaced by Text field

  // const generateProductName = () => {
  //   // ... logic relying on objects might break if we only have IDs/Strings. 
  //   // But we are disabling the description field anyway.
  //   return '';
  // };

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
    const FetchAllUnitLocations = async () => {
      try {
        const response = await Get(
          `GetAllStorelocations?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setAllUnitLocations(response.data);
      } catch (error) {
        console.error('Error fetching Unit locations:', error);
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
        try {
          const response = await Get(
            `GetStorageLocationsByUnitLocation?StoreID=${unitLocation.StoreID}&Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
          );
          // filter using StoreID
          // const filteredStorageLocations = response.data.filter(
          //   (location) => location.StoreID === unitLocation.StoreID
          // );
          setStorageLocationsByStore(response.data);
        } catch (error) {
          console.error('API Error:', error);
          setStorageLocationsByStore([]);
        }
      } else {
        setStorageLocationsByStore([]);
      }
    };

    fetchStorageLocations();
  }, [unitLocation, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // const selectedCategory = watch('Inv_Cat_Name'); // Use values.Inv_Cat_Name instead



  useEffect(() => {
    const fetchAllUOM = async () => {
      try {
        const response = await Get(
          `GetAllActiveUOM?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        // console.log('UOM Response', response.data.Data);
        setallItemUnit(response.data.Data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllUOM();
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
    fetchExchangeRate();
  }, [fetchExchangeRate]);

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
    const FetchAllSources = async () => {
      try {
        const response = await Get(
          `GetAllSources?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        // console.log('Sources:', response.data);
        setAllSources(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    FetchAllSources();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  //  setallClassName

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await Get(`getActiveCurrencies`);
        // console.log('Currency', response.data.Data);
        setallCurrencies(response.data || []);
      } catch (error) {
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

  useEffect(() => {
    const fetchMaterialTypes = async () => {
      try {
        const response = await Get(
          `GetAllMaterialTypes?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        // console.log('Material Types:', response.data);
        setAllMaterialTypes(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMaterialTypes();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  //  setColorOptions

  useEffect(() => {
    const fetchColorCode = async () => {
      try {
        const response = await Get(
          `colors/all?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        // console.log('Color Codes:', response.data?.Data);
        setColorOptions(response.data?.Data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchColorCode();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const AllMaterialData = async () => {
      try {
        const response = await Get(
          `GetAllMaterialTypes?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );

        setAllMaterialData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    AllMaterialData();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // setallSourceData

  useEffect(() => {
    const allSourceFetchData = async () => {
      try {
        const response = await Get(
          `GetAllSources?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );

        setallSourceData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    allSourceFetchData();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // Origin Drop down on the basis of the source

  const selectedSource = watch('Source');

  // 3. Fetch origins when source changes
  const fetchOrigin = useCallback(async () => {
    if (selectedSource?.SourceID) {
      try {
        const response = await Get(
          `GetOriginsBySourceID?sourceID=${selectedSource.SourceID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setAllOrigins(response.data || []);
      } catch (error) {
        console.error(error);
        setAllOrigins([]);
      }
    } else {
      setAllOrigins([]);
    }
  }, [selectedSource?.SourceID, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    if (selectedSource?.SourceID) fetchOrigin();
  }, [fetchOrigin, selectedSource?.SourceID]);

  // setallScopeData

  useEffect(() => {
    const allScopeFetchData = async () => {
      try {
        const response = await Get(
          `GetAllInvScopes?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );

        setallScopeData(response.data?.data);
      } catch (error) {
        console.error(error);
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
      const newdata = response.data.Data.map((item) => ({
        ...item,
        ColorNickName: `${item.ColorName} - ${item.Color_Code}`,
      }));

      const filteredData = newdata.filter(
        (item) => item.ColorFamilyID === values?.ColorFamily?.ColorFamilyID
      );
      setallColors(filteredData);
    } catch (error) {
      console.log(error);
      setallColors([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, values?.ColorFamily]);

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
    fetchData();
  }, [GetColors, APIGetCompositionList, APIGetTypeList, GetCounts, FetchColorFamily]);

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
      // fetchSubCategory();
      enqueueSnackbar('Subcategory Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };
  console.log("ItemOpenDetails", ItemOpenDetails);

  const onsubmitie = handleSubmit(async (data) => {
    if (ItemOpenDetails.length === 0) {
      enqueueSnackbar('Please add at least one stock detail', { variant: 'error' });
      return;
    }
    const dataToSend = {
      ItemOpenID: currentData?.ItemOpenID, // Verify if this is the correct ID field
      UOMID: data?.UOMID?.UOM_ID ?? 0,
      CurrencyID: data?.Currency?.Currency_ID ?? 0,
      Updated_By: userData?.userDetails?.userId ?? 0,
      Org_Id: userData?.userDetails?.orgId ?? 0,
      Branch_Id: userData?.userDetails?.branchID ?? 0,
      Details: ItemOpenDetails.map((item) => ({
        ItemOpenDtlID: item?.ItemOpenDtlID ?? 0,
        ItemID: values?.ItemOpen?.ItemID || currentData?.ItemID,
        OpenStockQty: Number(item?.OpeningStockQuantity),
        VendorID: item?.VendorName?.VendorID ?? 0,
        StorageID: item?.StoreID?.StoreID ?? 0,
        LocationID: item?.StorageLocation?.StorageID ?? 0,
        AveragePrice: Number(item?.AveragePrice),
        TotalPriceinBDT: Number(item?.TotalPriceinBDT),
        TotalPriceinUSD: Number(item?.TotalPriceinUSD)
      })),
    };
    console.log(dataToSend);
    try {
      await Put('InvItemOpeningUpdate', dataToSend);
      enqueueSnackbar('Item Transaction updated successfully!', { variant: 'success' });
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

  const OverAllTotalAmount = ItemOpenDetails.reduce((total, detail) => {
    const quantity = parseFloat(detail.OpeningStockQuantity);
    const unitPrice = parseFloat(detail.AveragePrice);
    return total + quantity * unitPrice;
  }, 0);

  const KGtoLBs = (kg) => kg * 2.20462;

  const OverAllTotalQunatityInLbs = ItemOpenDetails.reduce((total, detail) => {
    const quantity = parseFloat(detail.OpeningStockQuantity);
    // const uom = detail?.UOM?.UOM_ID;
    // const q = uom === values?.UOMID?.UOM_ID ? quantity : KGtoLBs(quantity);
    return total + quantity;
  }, 0);

  const handleAddDetail = () => {
    // Validation checks
    if (!values?.Currency) {
      enqueueSnackbar('Please select Currency first', { variant: 'error' });
      return;
    }

    if (!values?.Source) { // VendorName is probably optional if Source is chosen? 
      // In ItemOpen-new, VendorName is checked. 
      // In ItemOpen-edit, we have Source/Origin/Vendor?
      // User asked to take ItemOpen-new as reference.
      // ItemOpen-new uses VendorName. ItemOpen-edit has Source/Origin and VendorName?
      // Wait, ItemOpen-edit (original) had Source & Origin. ItemOpen-new has VendorName.
      // New API response has VendorName & VendorID.
      // So I should probably use VendorName in the form instead of Source/Origin?
      // Or map Source to Vendor?
      // I will assume I need to add VendorName field if it's missing.
    }

    // In ItemOpen-new: VendorName from allVendorData.
    // In ItemOpen-edit: Source/Origin.
    // I need to check if I should replace Source/Origin with VendorName or keep both?
    // The GET response has VendorName.
    // I will use VendorName as per ItemOpen-new reference.

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
      UOM: values?.UOMID || null,
      // Currency: values?.Currency || null,
      OpeningStockQuantity: values?.OpeningStockQuantity || 0,
      AveragePrice: values?.AveragePrice || 0,
      TotalPriceinUSD:
        values?.Currency?.Currency_ID === 8
          ? (values.OpeningStockQuantity * values.AveragePrice) / USDtoBDT // USDtoBDT needs to be defined/state
          : values.OpeningStockQuantity * values.AveragePrice,
      TotalPriceinBDT:
        values?.Currency?.Currency_ID === 8
          ? values.OpeningStockQuantity * values.AveragePrice
          : values.OpeningStockQuantity * values.AveragePrice * USDtoBDT,
    };

    if (editingIndex !== null) {
      const updatedDetails = [...ItemOpenDetails];
      // Preserve ID from existing item
      updatedDetails[editingIndex] = {
        ...detail,
        ItemOpenDtlID: updatedDetails[editingIndex]?.ItemOpenDtlID
      };

      setItemOpenDetails(updatedDetails);
    } else {
      setItemOpenDetails((prev) => [...prev, detail]);
    }

    resetDetailForm();
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

  const resetDetailForm = () => {
    setValue('VendorName', null);
    setValue('StoreID', null);
    setValue('StorageLocation', null);
    setValue('OpeningStockQuantity', '');
    setValue('AveragePrice', '');
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

  // const unit = values?.UOM?.UOMName;
  const currencySymbol = currentData?.Symbol;

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

  // const resetDetailForm = () => {
  //   // setValue('Customer', null);
  //   // setValue('doDate', null);
  //   setValue('PIID', null);
  //   setValue('ItemCode', null);
  //   setValue('PIQuantity', '');
  //   setValue('DOQuantity', '');
  //   setValue('Color', null);
  //   setValue('LotNo', '');
  //   setValue('LotLabel', '');
  //   setValue('Remarks', '');
  //   setEditingIndex(null);
  // };

  // Table
  const table = useTable();

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
    // FetchAllCategoryData();
    setDialogOpen(false);
  };
  // -----------------------------------------------------------

  // console.log(storageLocationsByStore);

  const unit = values?.UOM?.UOMName;
  // const watchedCat = watch('ItemCategory');
  // console.log('watchedCat', watchedCat);

  const DontshowMaterialColorField =
    selectedClassId?.ClassID === 3 ||
    (selectedCategory?.ClassID !== 3 && selectedCategory?.Inv_Cat_ID === 5);

  // -----------------------------------------------------------
  useEffect(() => {
    setValue('Color', null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.ColorFamily]);

  useEffect(() => {
    setValue('StorageLocation', null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.StoreID]);
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
                      <RHFTextField
                        name="ClassName"
                        label="Item Type"
                        fullWidth
                        disabled
                      />
                    </Box>
                  </Stack>
                </Box>

                <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ flexGrow: 1 }}>
                      <RHFTextField
                        name="Inv_Cat_Name"
                        label="Item Category"
                        fullWidth
                        disabled
                      />
                    </Box>
                  </Stack>
                </Box>
                <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ flexGrow: 1 }}>
                      <RHFTextField
                        name="SubCat_Name"
                        label="Item Sub Category"
                        fullWidth
                        disabled
                      />
                    </Box>
                  </Stack>
                </Box>

                <RHFTextField
                  name="ItemCode"
                  label="Item"
                  fullWidth
                  disabled
                />


                {selectedClassId === 6 && (
                  <>
                    <RHFAutocomplete
                      name="Yarn_Type_ID"
                      label="Yarn Type"
                      placeholder="Choose an option"
                      fullWidth
                      disabled
                      options={allTypes}
                      getOptionLabel={(option) => option?.Yarn_Type || ''}
                      isOptionEqualToValue={(option, value) => {
                        if (!option || !value) return false;
                        return option.Yarn_Type_ID === value.Yarn_Type_ID;
                      }}
                      value={values?.Yarn_Type_ID || null}
                    />
                    <RHFAutocomplete
                      name="Yarn_Count_ID"
                      label="Yarn Count"
                      placeholder="Choose an option"
                      fullWidth
                      options={allCounts}
                      disabled
                      getOptionLabel={(option) => option?.Yarn_Count_Name || ''}
                      isOptionEqualToValue={(option, value) => {
                        if (!option || !value) return false;
                        return option.Yarn_Count_ID === value.Yarn_Count_ID;
                      }}
                      value={values?.Yarn_Count_ID || null}
                    />
                    <RHFAutocomplete
                      name="Composition_ID"
                      label="Composition"
                      placeholder="Choose an option"
                      fullWidth
                      disabled
                      options={allCompositions}
                      getOptionLabel={(option) => option?.Composition_Name || ''}
                      isOptionEqualToValue={(option, value) => {
                        if (!option || !value) return false;
                        return option.Composition_ID === value.Composition_ID;
                      }}
                      value={values?.Composition_ID || null}
                    />
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
                  variant="outlined"
                  fullWidth
                  disabled
                />
                <RHFTextField
                  name="ItemDescription"
                  label="Item Description"
                  sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                  variant="outlined"
                  fullWidth
                  disabled
                />

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
                  disabled
                />
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
                  isOptionEqualToValue={(option, value) => option?.StorageID === value?.StorageID}
                  value={values?.StorageLocation || null}
                // disabled={!values.StoreID} // Optional: disable if store not selected
                />
                <RHFTextField
                  name="OpeningStockQuantity"
                  label="Opening Quantity"
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
                {/* Reorder/Safety Qty were here but maybe not needed in list if they are per item vs per stock location? */}
                {/* ItemOpen-new has them in main card, not stock card. ItemOpen-edit had them in stock card. */}
                {/* I will only keep what is in ItemOpen-new Stock Card for consistency. */}
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
                <TableContainer component={Paper}>
                  <Scrollbar>
                    <Table
                      size='small' // table.dense is not available unless I bring useTable
                      sx={{
                        minWidth: 460,
                        mt: 4,
                        border: 1,
                        borderColor: '#f4f6f8',
                        borderStyle: 'dotted',
                      }}
                    >
                      <TableHeadCustom
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

                        {/* TableEmptyRows and TableNoData if needed */}
                      </TableBody>
                    </Table>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="green">
                        {`Total Quantity: ${fNumber(OverAllTotalQunatityInLbs)} ${unit || ''
                          }`}
                      </Typography>
                      <Typography variant="body2" color="green">
                        {`Total Amount: ${currencySymbol}${fNumber(
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
      {/* <AddDialogOrigin
      uploadOpen={dialogOpenOrigin}
      /> */}
    </>
  );
}
DispoderEditForm.propTypes = {
  currentData: PropTypes.any,
};
