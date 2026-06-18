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
  Avatar,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
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
  RHFUploadAvatar,
  RHFUpload,
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
import DetailTableRow from './detail-table-row';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { grid } from '@mui/system';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import AutocompleteWithDropDown from 'src/components/AutocompleteWithDropDown';
import { fData } from 'src/utils/format-number';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function RMCreateForm() {
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
  const [Blendtypes, setBlendTypes] = useState([]);
  const [BlendSubtypes, setBlendSubTypes] = useState([]);
  const [colors, setColors] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [origin, setOrigin] = useState([]);
  const [Location, setLocation] = useState([]);
  const [UOM, setUOM] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [subLocation, setsubLocation] = useState([]);
  const [storage, setStorage] = useState([]);
  const [SubStorage, setSubStorage] = useState([]);
  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------
  const KGtoLbs = (kg) => {
    console.log('kg', kg);
    return kg * 2.20462;
  };
  const NewProductSchema = Yup.object().shape({
    // Commercial_Name: Yup.string().required('Product Name is required'),
    // YarnCountID: Yup.object().required('Yarn Count is required'),
    // Composition_ID: Yup.object().required('Composition is required'),
    // Yarn_Type_ID: Yup.object().required('Yarn Type is required'),
    // Color_ID: Yup.object().required('Color is required'),
    // UOM: Yup.object().required('Unit Of Measure is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues: {
      products: [
        {
          CurrencyID: null,
          CreatedBy: userData?.userDetails?.userId,
          IsActive: true,
          Branch_ID: userData?.userDetails?.branchID,
          Org_ID: userData?.userDetails?.orgId,
        },
      ],
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

  const generateProductName = () => {
    const productCode = `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${
      values?.YarnCountID?.Yarn_Count_Name || ''
    } -  ${values?.Composition_ID?.Composition_Name || ''}  (${values?.Color_ID?.ColorName || ''})`;
    return productCode;
  };

  // ------------------------------------

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

  const APIGetBlend = useCallback(async () => {
    try {
      const response = await Get(
        `blendName?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setBlendTypes(response.data.Data);
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

  const ApiGetLocations = useCallback(async () => {
    try {
      const response = await Get(
        `GetAlllocations?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setLocation(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetStorageLocations = useCallback(async () => {
    try {
      const response = await Get(
        `GetStorageLocations?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setStorage(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetSuppliers = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllRMSuppliers?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setSupplier(response.data);
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
        APIGetSuppliers(),
        APIGetOrigin(),
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
    APIGetSuppliers,
    APIGetOrigin,
  ]);
  // --------------------------------
  const [dialogValue, setDialogValue] = useState('');
  const [typesData, setTypesData] = useState({});
  const [storageData, setstorageData] = useState({});
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setDialogValue('');
    setOpen(false);
  };
  const PostBlendNames = async (blendName, blendType) => {
    if (!blendName || !blendType) return;

    const newOptionTrimmed = blendName.trim().toLowerCase();

    if (Blendtypes.find((option) => option.Blend_Names.trim().toLowerCase() === newOptionTrimmed)) {
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
      const updatedBlendList = await ApiGetBlendTypeList();
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
      IsActive: true,
      Branch_ID: userData?.userDetails?.branchID,
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

  const PostLocation = async (location) => {
    if (!location) return;

    const newOptionTrimmed = location.trim().toLowerCase();

    if (
      subLocation.find(
        (option) => option.Unit_Location_name.trim().toLowerCase() === newOptionTrimmed
      )
    ) {
      enqueueSnackbar('Location  Exists', { variant: 'error' });
      return;
    }

    const dataToSend = {
      Unit_Location_name: location,

      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,
    };

    try {
      await Post('Addlocations', dataToSend);
      const updatedBlendList = await ApiGetLocations();
      const newlyAdded = updatedBlendList.find(
        (b) => b.Unit_Location_name.trim().toLowerCase() === newOptionTrimmed
      );

      if (newlyAdded) {
        setTypesData((prev) => ({
          ...prev,
          dropData: newlyAdded,
        }));
      }

      enqueueSnackbar('Location Added Successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error adding Location:', error);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const dataToSend = {
      Blend_Name_ID: data?.Blend_Type_ID?.Blend_Type_ID,
      RM_Dimension: '40x40',
      RM_Color_ID: data?.Color_ID?.ColorID,
      Storage_id: data?.storage.Storage_id,
      Unit_Location_id: data?.location.Unit_Location_id,
      Specification: data?.specification,
      UOMID: 1,
      RM_OpeningStock: data?.Quantity,
      Comments: data?.Comments,
      Remarks: data?.Remarks,
      CreatedBy: userData?.userDetails?.userId,
      // UpdatedBy: userData?.userDetails?.userId,
      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,
    };
    console.log('dataToSend', dataToSend);

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

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });

        setValue('ItemImage', newFile, { shouldValidate: true }); // match `name` in RHFUploadBox
      }
    },
    [setValue]
  );

  const categoryOptions = [
    {
      label: 'Circular Knitting',
      value: 'category1',
    },
    {
      label: 'Cotton',
      value: 'category2',
    },
    {
      label: 'Woven',
      value: 'category3',
    },
    {
      label: 'Towel',
      value: 'category4',
    },
    {
      label: 'Weaving',
      value: 'category5',
    },
    {
      label: 'Socks',
      value: 'category6',
    },
    {
      label: 'Denim',
      value: 'category7',
    },
  ];

  const [products, setProducts] = useState([
    {
      Product_id: null,
      PriceListID: null,
      Price_Range_Frm: null,
      Price_Range_To: null,
      MOQ_Range_Frm: null,
      MOQ_Range_To: null,
      EOQ_Range_Frm: null,
      EOQ_Range_To: null,
      MOQ_Ball_Price: null,
      MOQ_Final_Price: null,
      EOQ_Ball_Price: null,
      EOQ_Final_Price: null,
      CurrencyID: null,
      CreatedBy: userData?.userDetails?.userId,
      IsActive: true,
      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,
    },
  ]);

  const handleAdd = () => {
    const newProduct = {
      CurrencyID: null,
      CreatedBy: userData?.userDetails?.userId,
      IsActive: true,
      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,
    };
    setProducts([...products, newProduct]);
    setValue('products', [...values.products, newProduct]);
  };

  // Handle delete product
  const handleProductDelete = (rowToDelete) => {
    const updatedDetails = values.products.filter((row) => row !== rowToDelete);
    setValue('products', updatedDetails);
  };
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
                  md: 'repeat(3, 1fr)',
                }}
              >
                <Box
                  rowGap={2}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{ sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)' }}
                  sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 2' } }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      // alignItems: 'center',
                      justifyContent: 'start',
                      gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 1' },
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Select Category:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      component={Paper}
                      // variant="outlined"
                      // alignItems="center"
                      // justifyContent="center"
                      // sx={{ p: 5, borderStyle: 'dashed' }}
                    >
                      {categoryOptions?.map((option) => (
                        <Chip
                          key={option.value}
                          label={option.label}
                          variant={option.value === values.Category ? 'filled' : 'outlined'}
                          color="primary"
                          onClick={() => setValue('Category', option.value)}
                          clickable
                          // icon={
                          //   option.value === values.Category ? (
                          //     <Iconify width={24} icon="eva:checkmark-fill" />
                          //   ) : null
                          // }
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Box>

                <Box sx={{ display: { xs: 'none', md: 'block' } }} />

                {/* <RHFAutocomplete
                    name="Category"
                    label="Category"
                    placeholder="Choose an option"
                    fullWidth
                    options={origin || ''}
                    getOptionLabel={(option) => option?.ColorName || null}
                    value={values?.Color_ID || null}

                  /> */}

                <RHFTextField name="ItemName" label="Item Name" />

                <RHFAutocomplete
                  name="Color_ID"
                  label="Color"
                  placeholder="Choose an option"
                  fullWidth
                  options={colors || ''}
                  getOptionLabel={(option) => option?.ColorName || null}
                  value={values?.Color_ID || null}
                />

                <RHFAutocomplete
                  name="UOM"
                  label="Unit"
                  placeholder="Choose an option"
                  fullWidth
                  options={UOM || ''}
                  getOptionLabel={(option) => option?.UOMName || null}
                  value={values?.UOM || null}
                />

                <RHFTextField
                  name="specification"
                  label="Specification"
                  multiline
                  sx={{
                    gridColumn: { xs: 'span 1', md: 'span 2' },
                  }}
                  InputProps={{ shrink: true }}
                  rows={3}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  mt: 2,
                  // border: '1px dotted #ccc',
                  // borderRadius: 1.5,
                }}
              >
                <Tooltip title="Upload Material Photo">
                  <Box>
                    <RHFUploadBox
                      name="ItemImage"
                      accept={{ 'image/*': ['.jpg', '.png', '.jpeg'] }}
                      onDrop={handleDrop}
                    />
                  </Box>
                </Tooltip>
                {values?.ItemImage && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {values?.ItemImage?.name}
                    </Typography>
                    <IconButton onClick={() => setValue('ItemImage', null)}>
                      <Iconify icon="eva:close-fill" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Product Prices */}
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <h3>Item Details</h3>
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
                <Box sx={{ gridColumn: { sm: 'span 2', md: 'span 3' } }}>
                  <TableContainer component={Paper}>
                    <Scrollbar>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ minWidth: 280 }}>Unit Location</TableCell>
                            {/* <TableCell sx={{ minWidth: 180 }}>Currency</TableCell> */}
                            <TableCell sx={{ minWidth: 280 }}>Storage Location</TableCell>
                            <TableCell sx={{ minWidth: 200 }}>Opening Quantity</TableCell>

                            <TableCell sx={{ minWidth: 150 }}>Unit Price</TableCell>

                            {/* <TableCell align="center" sx={{ minWidth: 280 }}>
                                      MOQ Price
                                    </TableCell>
                                    <TableCell align="center" sx={{ minWidth: 280 }}>
                                      Economic Order Quanitity (EOQ)
                                    </TableCell>
                                    <TableCell align="center" sx={{ minWidth: 280 }}>
                                      EOQ Price
                                    </TableCell> */}
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {values.products?.map((product, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <RHFAutocomplete
                                  name={`products[${index}].Product`}
                                  label="Unit Location"
                                  placeholder="Choose an option"
                                  fullWidth
                                  options={Location || null}
                                  getOptionLabel={(option) => option?.Unit_Location_name}
                                />
                              </TableCell>
                              <TableCell>
                                <RHFAutocomplete
                                  name={`products[${index}].storageLoc`}
                                  label="Storage Location"
                                  placeholder="Choose an option"
                                  fullWidth
                                  options={subLocation}
                                  getOptionLabel={(option) => option?.Product_Name}
                                />
                              </TableCell>
                              <TableCell>
                                <RHFTextField
                                  name={`products[${index}].Quantity`}
                                  label="Opening Quantity"
                                  type="number"
                                />
                              </TableCell>
                              <TableCell>
                                <RHFTextField
                                  name={`products[${index}].Product_Price`}
                                  label="Unit Price"
                                  type="number"
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <Typography variant="body2">
                                          {values?.Currency?.Currency_ID === 2 ? '৳' : '$'}
                                        </Typography>
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </TableCell>

                              {/* <TableCell align="center">
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                          <RHFTextField
                                            name={`products[${index}].MOQ_Range_Frm`}
                                            label="From"
                                            type="number"
                                          />
                                          <RHFTextField
                                            name={`products[${index}].MOQ_Range_To`}
                                            label="To"
                                            type="number"
                                          />
                                        </Box>
                                      </TableCell> */}

                              {/* <TableCell align="center">
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                          <RHFTextField
                                            name={`products[${index}].MOQ_Ball_Price`}
                                            label="Ball Price"
                                            type="number"
                                          />
                                          <RHFTextField
                                            name={`products[${index}].MOQ_Final_Price`}
                                            label="Final Price"
                                            type="number"
                                          />
                                        </Box>
                                      </TableCell>
          
                                      <TableCell align="center">
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                          <RHFTextField
                                            name={`products[${index}].EOQ_Range_Frm`}
                                            label="From"
                                            type="number"
                                          />
                                          <RHFTextField
                                            name={`products[${index}].EOQ_Range_To`}
                                            label="To"
                                            type="number"
                                          />
                                        </Box>
                                      </TableCell>
                                      <TableCell align="center">
                                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                          <RHFTextField
                                            name={`products[${index}].EOQ_Ball_Price`}
                                            label="Ball Price"
                                            type="number"
                                          />
                                          <RHFTextField
                                            name={`products[${index}].EOQ_Final_Price`}
                                            label="Final Price"
                                            type="number"
                                          />
                                        </Box>
                                      </TableCell> */}

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
        </Grid>
        <Stack alignItems="flex-end" sx={{ mt: 3 }}>
          <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
            Save
          </LoadingButton>
        </Stack>
      </FormProvider>
    </>
  );
}
