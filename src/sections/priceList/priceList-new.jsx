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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';

import { Get, Post } from 'src/api/apibasemethods';
import Scrollbar from 'src/components/scrollbar';
import { set } from 'lodash';
import { id } from 'date-fns/locale';
import { DesktopDatePicker } from '@mui/x-date-pickers';

// ----------------------------------------------------------------------

export default function PriceListCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [isLoading, setLoading] = useState(false);
  const [composedProducts, setComposedProducts] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);
  const [UOM, setUOM] = useState([]);
  const [allColors, setAllColors] = useState([]);
  const [allCounts, setAllCounts] = useState([]);
  const [allCompositions, setAllCompositions] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [allEndCustomers, setAllEndCustomers] = useState([]);
  // State for product list
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

  const GetComposedProducts = useCallback(async () => {
    try {
      const response = await Get(
        `APIViewYarnComposePrdt?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setComposedProducts(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetActiveCurrencies = useCallback(async () => {
    try {
      const response = await Get(`getActiveCurrencies`);
      setCurrencyList(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);
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

  const GetAllEndCustomer = useCallback(async () => {
    const res = await Get(
      `getAllendcustomer?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setAllEndCustomers(res.data?.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        GetComposedProducts(),
        GetActiveCurrencies(),
        APIGetUOM(),
        GetColors(),
        GetCounts(),
        APIGetTypeList(),
        APIGetCompositionList(),
        GetCustomersData(),
        GetAllEndCustomer(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [
    GetComposedProducts,
    GetActiveCurrencies,
    APIGetUOM,
    GetColors,
    GetCounts,
    APIGetTypeList,
    APIGetCompositionList,
    GetCustomersData,
    GetAllEndCustomer,
  ]);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------
  const NewPriceListSchema = Yup.object().shape({
    // Basic Information
    PriceListName: Yup.string()
      .required('Name is required')
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name must not exceed 100 characters'),

    // PriceListVer: Yup.string()
    //   .required('Version is required')
    //   .matches(/^v\d+\.\d+$/, 'Version must be in format vX.X (e.g., v1.0)'),

    PriceListDescription: Yup.string()
      .required('Description is required')
      // .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must not exceed 500 characters'),

    // Date Validation
    Valid_From: Yup.date()
      .nullable()
      .typeError('Valid From is required')
      .required('Valid From is required')
      .min(new Date(), 'Valid From cannot be in the past or today'),

    Valid_Until: Yup.date()
      .nullable()
      .typeError('Valid Until is required')
      .required('Valid Until is required')
      .min(Yup.ref('Valid_From'), 'Valid Until must be later than Valid From'),

    // Currency: Yup.object().required('Currency is required').nullable(),
    // Products Array Validation
    products: Yup.array()
      .min(1, 'At least one product is required')
      .of(
        Yup.object().shape({
          // Product: Yup.object().required('Product is required').nullable(),
          Color: Yup.object().required('Color is required'),
          Composition_ID: Yup.object().required('Composition is required'),
          Yarn_Type_ID: Yup.object().required('Yarn Type is required'),
          Yarn_Count_ID: Yup.object().required('Yarn Count is required'),

          UOMID: Yup.object().required('UOM is required').nullable(),
          Product_Price: Yup.number()
            .typeError('Must be a number')
            .required('Product Price is required')
            .positive('Must be positive'),

          Price_Range_Frm: Yup.number()
            .typeError('Must be a number')
            .required('Price From is required')
            .positive('Must be positive')
            // .integer('Must be an integer')
            .when(
              'Price_Range_To',
              (Price_Range_To, schema) =>
                Price_Range_To && schema.max(Price_Range_To, 'From must be less than To')
            ),

          Price_Range_To: Yup.number()
            .typeError('Must be a number')
            .required('Price To is required')
            .positive('Must be positive'),
          // .integer('Must be an integer'),

          // MOQ_Range_Frm: Yup.number()
          //   .typeError('Must be a number')
          //   .required('Price From is required')
          //   .positive('Must be positive')
          //   .integer('Must be an integer')
          //   .when(
          //     'MOQ_Range_To',
          //     (MOQ_Range_To, schema) =>
          //       MOQ_Range_To && schema.max(MOQ_Range_To, 'From must be less than To')
          //   ),

          // MOQ_Range_To: Yup.number()
          //   .typeError('Must be a number')
          //   .required('Price To is required')
          //   .positive('Must be positive')
          //   .integer('Must be an integer'),

          // MOQ_Final_Price: Yup.number()
          //   .typeError('Must be a number')
          //   .required('MOQ Final Price is required')
          //   .positive('Must be positive'),

          // MOQ_Ball_Price: Yup.number()
          //   .typeError('Must be a number')
          //   .required('MOQ Ball Price is required')
          //   .positive('Must be positive')
          //   .when(
          //     'MOQ_Final_Price',
          //     (MOQ_Final_Price, schema) =>
          //       MOQ_Final_Price &&
          //       schema.min(
          //         MOQ_Final_Price,
          //         'Ball price must be greater than or equal to final price'
          //       )
          //   ),

          // EOQ_Range_Frm: Yup.number()
          //   .typeError('Must be a number')
          //   .required('EOQ From is required')
          //   .positive('Must be positive')
          //   .integer('Must be an integer')
          //   .when(
          //     'EOQ_Range_To',
          //     (EOQ_Range_To, schema) =>
          //       EOQ_Range_To && schema.max(EOQ_Range_To, 'From must be less than To')
          //   ),

          // EOQ_Range_To: Yup.number()
          //   .typeError('Must be a number')
          //   .required('EOQ To is required')
          //   .positive('Must be positive')
          //   .integer('Must be an integer'),

          // EOQ_Final_Price: Yup.number()
          //   .typeError('Must be a number')
          //   .required('EOQ Final Price is required')
          //   .positive('Must be positive'),

          // EOQ_Ball_Price: Yup.number()
          //   .typeError('Must be a number')
          //   .required('EOQ Ball Price is required')
          //   .positive('Must be positive')
          //   .when(
          //     'EOQ_Final_Price',
          //     (EOQ_Final_Price, schema) =>
          //       EOQ_Final_Price &&
          //       schema.min(
          //         EOQ_Final_Price,
          //         'Ball price must be greater than or equal to final price'
          //       )
          //   ),
        })
      ),
  });

  const methods = useForm({
    resolver: yupResolver(NewPriceListSchema),
    defaultValues: {
      products: [
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

  // Handle add product
  const handleAdd = () => {
    const newProduct = {
      Product_id: null,
      PriceListID: null,
      Yarn_Type_ID: null,
      Yarn_Count_ID: null,
      Color: null,
      Composition_ID: null,
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
    };
    setProducts([...products, newProduct]);
    setValue('products', [...values.products, newProduct]);
  };

  // Handle delete product
  const handleProductDelete = (rowToDelete) => {
    const updatedDetails = values.products.filter((row) => row !== rowToDelete);
    setValue('products', updatedDetails);
  };

  // ------------------------------------

  const InsertProductPrice = async (prdData) => {
    console.log('prdData', prdData);
    try {
      const res = await Post('productpricelist/addProductVolume', prdData);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const mstData = {
      PriceListName: data?.PriceListName,
      PriceListDescription: data?.PriceListDescription,
      Prev_Pricelist_ID: data?.Prev_Pricelist_ID || 0,
      Valid_From: data?.Valid_From,
      Valid_Until: data?.Valid_Until,
      PriceListVer: data?.PriceListVer || 'v1.0',
      CurrencyID: data?.Currency?.Currency_ID || 1,
      OrgID: userData?.userDetails?.orgId,
      BranchID: userData?.userDetails?.branchID,
      CreatedBy: userData?.userDetails?.userId,
    };
    try {
      const res = await Post('priceList/create', mstData);
      if (res?.status === 400) {
        console.log('409 Conflict Error');
        enqueueSnackbar('PriceList with this name already exists!', { variant: 'error' });
        return;
      }
      if (res.status === 200) {
        const priceData = values?.products?.map((product) => ({
          Product_id: product?.Product?.Product_ID || 0,
          PriceListID: res?.data?.PriceListID,
          CompositionID: product?.Composition_ID?.Composition_ID,
          ColorID: product?.Color?.ColorID,
          YarnTypeID: product?.Yarn_Type_ID?.Yarn_Type_ID,
          YarnCountID: product?.Yarn_Count_ID?.Yarn_Count_ID,
          Product_Price: product?.Product_Price,
          Price_Range_Frm: product?.Price_Range_Frm,
          Price_Range_To: product?.Price_Range_To,
          UOMID: product?.UOMID?.UOM_ID,
          CreatedBy: userData?.userDetails?.userId,
          IsActive: true,
          Branch_ID: userData?.userDetails?.branchID,
          Org_ID: userData?.userDetails?.orgId,
        }));

        await InsertProductPrice(priceData);
        enqueueSnackbar('Created Successfully!');
        // router.push(paths.dashboard.transaction.priceList.root);
        // reset();
      }
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('409 Conflict Error');
        enqueueSnackbar('PriceList with this name already exists!', { variant: 'error' });
        return;
      }
      enqueueSnackbar('Something went wrong!', { variant: 'error' });
    }
  });

  const renderLoading = (
    <LoadingScreen
      sx={{
        borderRadius: 1.5,
        bgpricelist: 'background.default',
      }}
    />
  );

  return isLoading ? (
    renderLoading
  ) : (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <h3>Pricelist Details:</h3>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="PriceListName" label="Name" />
              <RHFTextField
                name="PriceListVer"
                label="Version"
                placeholder="v1.0"
                value="v1.0"
                disabled
              />
              <RHFTextField
                sx={{ gridColumn: { sm: 'span 2' } }}
                name="PriceListDescription"
                label="Description"
              />
              <RHFAutocomplete
                name="Currency"
                label="Currency"
                placeholder="Choose an option"
                fullWidth
                disabled
                options={currencyList}
                getOptionLabel={(option) => option?.Currency_Name}
                value={currencyList?.find((option) => option?.Currency_ID === 1)}
              />
              <Box />
              <Controller
                name="Valid_From"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    label="Valid from"
                    format="dd MMM yyyy"
                    value={field.value}
                    onChange={(newValue) => field.onChange(newValue)}
                    slotProps={{ textField: { error: !!error, helperText: error?.message } }}
                  />
                )}
              />
              <Controller
                name="Valid_Until"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    label="Valid until"
                    format="dd MMM yyyy"
                    value={field.value}
                    onChange={(newValue) => field.onChange(newValue)}
                    slotProps={{ textField: { error: !!error, helperText: error?.message } }}
                  />
                )}
              />
            </Box>
          </Card>
        </Grid>

        {/* Product Prices */}
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <h3> Product Pricelist</h3>
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
                          <TableCell sx={{ minWidth: 180 }}>Yarn Type</TableCell>
                          <TableCell sx={{ minWidth: 180 }}>Yarn Count</TableCell>
                          <TableCell sx={{ minWidth: 250 }}>Yarn Color</TableCell>
                          <TableCell sx={{ minWidth: 380 }}>Yarn Composition</TableCell>
                          {/* <TableCell sx={{ minWidth: 180 }}>Currency</TableCell> */}
                          <TableCell sx={{ minWidth: 180 }}>Unit of Measure</TableCell>
                          <TableCell sx={{ minWidth: 180 }}>Final Price</TableCell>
                          <TableCell align="center" sx={{ minWidth: 280 }}>
                            Price Range
                          </TableCell>
                          <TableCell sx={{ minWidth: 180 }}>Customer</TableCell>
                          <TableCell sx={{ minWidth: 180 }}>End Customer</TableCell>
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
                        {values?.products?.map((product, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <RHFAutocomplete
                                size="small"
                                name={`products[${index}].Yarn_Type_ID`}
                                label="Yarn Type"
                                placeholder="Choose an option"
                                fullWidth
                                options={allTypes}
                                // value={values?.Yarn_Type_ID || null}
                                getOptionLabel={(option) => option?.Yarn_Type || ''}
                                isOptionEqualToValue={(option, value) => {
                                  if (!option || !value) return false;
                                  return option.Yarn_Type_ID === value.Yarn_Type_ID;
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <RHFAutocomplete
                                size="small"
                                sx={{ gridColumn: { xs: 'span 2' } }}
                                name={`products[${index}].Yarn_Count_ID`}
                                label="Yarn Count"
                                placeholder="Choose an option"
                                fullWidth
                                options={allCounts}
                                // value={values.Yarn_Count_ID || null}
                                getOptionLabel={(option) => option?.Yarn_Count_Name || ''}
                                isOptionEqualToValue={(option, value) => {
                                  if (!option || !value) return false;
                                  return option.Yarn_Count_ID === value.Yarn_Count_ID;
                                }}
                              />
                            </TableCell>

                            <TableCell>
                              <RHFAutocomplete
                                size="small"
                                // sx={{ gridColumn: { xs: 'span 2' } }}
                                key={values?.Color?.ColorID || 'new'}
                                name={`products[${index}].Color`}
                                label="Color"
                                placeholder="Choose an option"
                                fullWidth
                                options={allColors}
                                // value={values?.Color || null}
                                getOptionLabel={(option) => option?.ColorNameandCode || ''}
                                isOptionEqualToValue={(option, value) => {
                                  if (!option || !value) return false;
                                  return option.ColorID === value.ColorID;
                                }}
                              />
                            </TableCell>

                            <TableCell>
                              <RHFAutocomplete
                                size="small"
                                name={`products[${index}].Composition_ID`}
                                label="Composition"
                                placeholder="Choose an option"
                                fullWidth
                                options={allCompositions}
                                // value={values?.Composition_ID || null}
                                getOptionLabel={(option) => option?.Composition_Name || ''}
                                isOptionEqualToValue={(option, value) => {
                                  if (!option || !value) return false;
                                  return option.Composition_ID === value.Composition_ID;
                                }}
                              />
                            </TableCell>

                            <TableCell>
                              <RHFAutocomplete
                                size="small"
                                name={`products[${index}].UOMID`}
                                label="Unit of Measure"
                                placeholder="Choose an option"
                                fullWidth
                                options={UOM || ''}
                                getOptionLabel={(option) => option?.UOMName || null}
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`products[${index}].Product_Price`}
                                size="small"
                                label="Final Price"
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

                            <TableCell align="center">
                              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                                <RHFTextField
                                  name={`products[${index}].Price_Range_Frm`}
                                  label="From"
                                  type="number"
                                  size="small"
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
                                <RHFTextField
                                  name={`products[${index}].Price_Range_To`}
                                  label="To"
                                  size="small"
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
                              </Box>
                            </TableCell>
                            <TableCell>
                              <RHFAutocomplete
                                size="small"
                                name={`products[${index}].CustomerID`}
                                label="Customer"
                                placeholder="Choose an option"
                                fullWidth
                                options={customers}
                                // value={values?.CustomerID || null}
                                getOptionLabel={(option) => option?.WIC_Name || ''}
                                isOptionEqualToValue={(option, value) => {
                                  if (!option || !value) return false;
                                  return option.WIC_ID === value.WIC_ID;
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <RHFAutocomplete
                                size="small"
                                name={`products[${index}].EndCustomerID`}
                                label="End Customer"
                                placeholder="Choose an option"
                                fullWidth
                                options={allEndCustomers}
                                // value={values?.EndCustomerID || null}
                                getOptionLabel={(option) => option?.End_Cust_Name || ''}
                                isOptionEqualToValue={(option, value) => {
                                  if (!option || !value) return false;
                                  return option.End_Cust_ID === value.End_Cust_ID;
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

        <Grid xs={12} md={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              Save
            </LoadingButton>
          </Box>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
