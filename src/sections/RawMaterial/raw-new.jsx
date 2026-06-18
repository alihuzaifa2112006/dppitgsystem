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
import { Autocomplete, Button, InputAdornment, Table, TextField, Typography } from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

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
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import AutocompleteWithDropDown from 'src/components/AutocompleteWithDropDown';

// ----------------------------------------------------------------------

export default function ProductCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Date In SQL format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const decryptObjectKeys = (data) => {
    const decryptedData = data.map((item) => {
      const decryptedItem = {};
      Object.keys(item).forEach((key) => {
        decryptedItem[key] = decrypt(item[key]);
      });
      return decryptedItem;
    });
    return decryptedData;
  };

  const [compositions, setCompositions] = useState([]);
  const [counts, setCounts] = useState([]);
  const [types, setTypes] = useState([]);
  const [BlendNames, setBlendNames] = useState([]);
  const [BlendSubtypes, setBlendSubTypes] = useState([]);
  const [colors, setColors] = useState([]);
  const [UOM, setUOM] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [typesData, setTypesData] = useState({});
  const [Location, setLocation] = useState([]);
  const [storage, setStorage] = useState([]);
  const [allStorage, setAllStorage] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [origin, setOrigin] = useState([]);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------
  const KGtoLbs = (kg) => kg * 2.20462;

  const NewProductSchema = Yup.object().shape({
    Blend_Name_ID: Yup.object().required('Raw Material is required'),
    Color_ID: Yup.object().required('Color is required'),
    Quantity: Yup.number().required('Quantity is required'),
    // UOM_ID: Yup.object().required('UOM is required'),
    // Comments: Yup.string().required('Comments is required'),
    // Remarks: Yup.string().required('Remarks is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
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

  const generateProductName = () => {
    const productCode = `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${
      values?.YarnCountID?.Yarn_Count_Name || ''
    } -  ${values?.Composition_ID?.Composition_Name || ''}  (${values?.Color_ID?.ColorName || ''})`;
    return productCode;
  };

  // ------------------------------------

  const ApiGetLocations = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllStorelocations?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setLocation(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const ApiGetCount = useCallback(async () => {
    try {
      const response = await Get(
        `Activeyarncount?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setCounts(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetTypeList = useCallback(async () => {
    try {
      const response = await Get(
        `getActiveyarntype?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setTypes(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetCompositionList = useCallback(async () => {
    try {
      const response = await Get(
        `yarncomposition/GetActiveCompositions?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setCompositions(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetColorList = useCallback(async () => {
    try {
      const response = await Get(
        `colors/active?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setColors(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetUOM = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllActiveUOM?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setUOM(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const ApiGetBlendTypeList = useCallback(async () => {
    try {
      const response = await Get(
        `ApiGetBlendTypeList?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setBlendSubTypes(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetBlend = useCallback(async () => {
    try {
      const response = await Get(
        `blendName?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setBlendNames(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetStorageLocations = useCallback(async () => {
    try {
      const response = await Get(
        `GetStorageLocations?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllStorage(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetOrigin = useCallback(async () => {
    try {
      const response = await Get(
        `blendName?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setOrigin(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetSuppliers = useCallback(async () => {
    try {
      const response = await Get(
        `blendName?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setSupplier(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        ApiGetCount(),
        APIGetTypeList(),
        APIGetCompositionList(),
        APIGetColorList(),
        APIGetUOM(),
        APIGetBlend(),
        ApiGetBlendTypeList(),
        ApiGetLocations(),
        GetStorageLocations(),
        APIGetOrigin(),
        APIGetSuppliers(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [
    ApiGetCount,
    APIGetTypeList,
    APIGetCompositionList,
    APIGetColorList,
    APIGetUOM,
    APIGetBlend,
    ApiGetBlendTypeList,
    ApiGetLocations,
    GetStorageLocations,
    APIGetOrigin,
    APIGetSuppliers,
  ]);

  useEffect(() => {
    if (values?.location?.StoreID !== undefined || values?.location?.StoreID === null) {
      const filteredStorage = allStorage.filter(
        (item) => item.StoreID === values?.location?.StoreID
      );
      setStorage(filteredStorage || []);
    } else {
      setStorage([]);
    }
  }, [values?.location, allStorage]);

  // --------------------------------
  const [dialogValue, setDialogValue] = useState('');
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setDialogValue('');
    setOpen(false);
  };

  const PostBlendNames = async (blendName, blendType) => {
    if (!blendName || !blendType) return;

    const newOptionTrimmed = blendName.trim().toLowerCase();

    if (BlendNames.find((option) => option.Blend_Names.trim().toLowerCase() === newOptionTrimmed)) {
      enqueueSnackbar('Blend Name Exists', { variant: 'error' });
      return;
    }

    const dataToSend = {
      Blend_Names: blendName,
      Blend_Type_ID: blendType.Blend_Type_ID,
      CreatedBy: userData?.userDetails?.userId,
      Org_ID: userData?.userDetails?.orgId,
      Branch_ID: userData?.userDetails?.branchID,
    };

    try {
      await Post('Addblendname', dataToSend);
      const updatedBlendList = await APIGetBlend();
      const newlyAdded = updatedBlendList.find(
        (b) => b.Blend_Names.trim().toLowerCase() === newOptionTrimmed
      );

      if (newlyAdded) {
        setTypesData((prev) => ({
          ...prev,
          dropData: newlyAdded,
        }));
      }

      enqueueSnackbar('Blend Name Added Successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error adding blend name:', error);
    }
  };

  const PostLocation = async (location) => {
    if (!location) return;

    const newOptionTrimmed = location.trim().toLowerCase();

    if (Location.find((option) => option.StoreName.trim().toLowerCase() === newOptionTrimmed)) {
      enqueueSnackbar('Unit Location Exists', { variant: 'error' });
      return;
    }

    const dataToSend = {
      StoreName: location,
      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,
    };

    try {
      await Post('Addlocations', dataToSend);
      const updatedBlendList = await ApiGetLocations();
      const newlyAdded = updatedBlendList.find(
        (b) => b.StoreName.trim().toLowerCase() === newOptionTrimmed
      );

      if (newlyAdded) {
        setTypesData((prev) => ({
          ...prev,
          dropData: newlyAdded,
        }));
      }

      enqueueSnackbar('Unit Location Added Successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error adding Unit Location:', error);
    }
  };

  const PostStorageLocation = async (storageLocation, locationID) => {
    if (!storageLocation || !locationID) return;

    const newOptionTrimmed = storageLocation.trim().toLowerCase();

    if (storage.find((option) => option.Storage_name.trim().toLowerCase() === newOptionTrimmed)) {
      enqueueSnackbar('Storage Location Exists', { variant: 'error' });
      return;
    }

    const dataToSend = {
      StoreID: locationID.StoreID,
      LocationName: storageLocation,
      Branch_ID: userData?.userDetails?.branchID,
      IsActive: true,
      Org_ID: userData?.userDetails?.orgId,
    };

    try {
      await Post('AddStorageLocation', dataToSend);
      const updatedBlendList = await GetStorageLocations();
      const newlyAdded = updatedBlendList.find(
        (b) => b.Storage_name.trim().toLowerCase() === newOptionTrimmed
      );

      if (newlyAdded) {
        setTypesData((prev) => ({
          ...prev,
          dropData: newlyAdded,
        }));
      }

      enqueueSnackbar('Storage Location Added Successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error adding Storage Location:', error);
    } finally {
      reset();
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const dataToSend = {
      Blend_Name_ID: data?.Blend_Name_ID?.Blend_Name_ID,
      RM_Dimension: '40x40',
      RM_Color_ID: data?.Color_ID?.ColorID,
      UOMID: 1,
      RM_OpeningStock: data?.Quantity,
      Comments: data?.Comments || 'N/A',
      Remarks: data?.Remarks || 'N/A',
      CreatedBy: userData?.userDetails?.userId,
      // UpdatedBy: userData?.userDetails?.userId,
      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,
    };

    try {
      const res = await Post('rawmaterials', dataToSend);
      if (res.status === 201 || res.status === 200) {
        enqueueSnackbar('Raw Material Created Successfully', { variant: 'success' });
        router.push(paths.dashboard.InventoryManagement.rawMaterial.root);
      } else {
        enqueueSnackbar('Raw Material Creation Failed', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Something went wrong', { variant: 'error' });
      console.error(error);
    } finally {
      // reset();
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

  return isLoading ? (
    renderLoading
  ) : (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <h3>Add Raw Material</h3>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  // md: 'repeat(3, 1fr)',
                }}
              >
                <AutocompleteWithDropDown
                  name="Blend_Name_ID"
                  label="Raw Material"
                  placeholder="Choose an option"
                  fullWidth
                  options={BlendNames || []}
                  blendTypeOptions={BlendSubtypes || []} // <-- blend type list from API
                  typeData={typesData}
                  setTypesData={setTypesData}
                  getOptionLabel={(option) => option?.Blend_Names || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.Blend_Name_ID === value?.Blend_Name_ID
                  }
                  optionLable2={(option) => option?.Blend_Type_Name}
                  isOptionEqualToValue2={(option, value) =>
                    option?.Blend_Type_ID === value?.Blend_Type_ID
                  }
                  onAdd={PostBlendNames}
                  value={values?.Blend_Name_ID || null}
                />
                <AutocompleteWithAdd
                  name="location"
                  label="Unit Location"
                  fullWidth
                  options={Location || ''}
                  getOptionLabel={(option) => option?.StoreName || ''}
                  isOptionEqualToValue={(option, value) => option?.StoreID === value?.StoreID}
                  onAdd={PostLocation}
                  value={values?.location || null}
                />

                <AutocompleteWithDropDown
                  name="storage"
                  label="Storage Location"
                  placeholder="Choose an option"
                  fullWidth
                  options={storage || []}
                  blendTypeOptions={Location || []} // <-- blend type list from API
                  typeData={typesData}
                  setTypesData={setTypesData}
                  getOptionLabel={(option) => option?.Storage_name || ''}
                  isOptionEqualToValue={(option, value) => option?.Storage_id === value?.Storage_id}
                  optionLable2={(option) => option?.StoreName}
                  isOptionEqualToValue2={(option, value) => option?.StoreID === value?.StoreID}
                  onAdd={PostStorageLocation}
                  value={values?.storage || null}
                />

                <RHFAutocomplete
                  name="origin"
                  label="Origin"
                  placeholder="Choose an option"
                  fullWidth
                  options={origin || ''}
                  getOptionLabel={(option) => option?.ColorName || null}
                  value={values?.Color_ID || null}
                />
                <RHFAutocomplete
                  name="supplier"
                  label="Supplier"
                  placeholder="Choose an option"
                  fullWidth
                  options={supplier || ''}
                  getOptionLabel={(option) => option?.ColorName || null}
                  value={values?.Color_ID || null}
                />
                <RHFAutocomplete
                  name="Color_ID"
                  label="Color"
                  placeholder="Choose an option"
                  fullWidth
                  options={colors || ''}
                  getOptionLabel={(option) => option?.ColorName || null}
                  value={values?.Color_ID || null}
                />

                {/* <RHFAutocomplete
                  name="UOM"
                  label="Dimension"
                  placeholder="Choose an option"
                  fullWidth
                  options={UOM || ''}
                  getOptionLabel={(option) => option?.UOMName || null}
                  value={values?.UOM || null}

                /> */}

                <RHFTextField
                  name="Quantity"
                  label="Quantity in KG"
                  type="number"
                  variant="outlined"
                  fullWidth
                  value={values.Quantity || null}
                  InputProps={{
                    shrink: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="body2">KG</Typography>
                      </InputAdornment>
                    ),
                  }}
                />
                <RHFTextField
                  name="Lbs"
                  label="Quantity in LBs"
                  type="number"
                  variant="outlined"
                  fullWidth
                  disabled
                  value={KGtoLbs(values.Quantity).toFixed(2) || ''}
                  InputProps={{
                    shrink: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography variant="body2">LBs</Typography>
                      </InputAdornment>
                    ),
                  }}
                />

                <RHFTextField
                  sx={{
                    gridColumn: { xs: 'span 1', md: 'span 2' },
                  }}
                  InputProps={{ shrink: true }}
                  name="Comments"
                  label="Comments"
                  fullWidth
                  multiline
                  rows={3}
                />
                <RHFTextField
                  sx={{
                    gridColumn: { xs: 'span 1', md: 'span 2' },
                  }}
                  InputProps={{ shrink: true }}
                  name="Remarks"
                  label="Remarks"
                  fullWidth
                  multiline
                  rows={3}
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
                Save
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
