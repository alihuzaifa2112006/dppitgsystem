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
import { Autocomplete, Button, Table, TextField } from '@mui/material';

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
  const [colors, setColors] = useState([]);
  const [UOM, setUOM] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewProductSchema = Yup.object().shape({
    // Commercial_Name: Yup.string().required('Product Name is required'),
    YarnCountID: Yup.object().required('Yarn Count is required'),
    Composition_ID: Yup.object().required('Composition is required'),
    Yarn_Type_ID: Yup.object().required('Yarn Type is required'),
    Color_ID: Yup.object().required('Color is required'),
    UOM: Yup.object().required('Unit Of Measure is required'),
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
    } -  ${values?.Composition_ID?.Composition_Name || ''}  (${
      values?.Color_ID?.ColorName || ''
    })`;
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
      const response = await Get(`yarncomposition/GetActiveCompositions?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`);
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

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        ApiGetCount(),
        APIGetTypeList(),
        APIGetCompositionList(),
        APIGetColorList(),
        APIGetUOM(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [ApiGetCount, APIGetTypeList, APIGetCompositionList, APIGetColorList, APIGetUOM]);

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    const dataToSend = {
      Commercial_Name: data?.Commercial_Name || '',
      Product_Name: generateProductName() || '',
      Yarn_Code: data.Yarn_Type_ID?.Yarn_Code || '',
      Composition_ID: data.Composition_ID.Composition_ID,
      Yarn_Type_ID: data.Yarn_Type_ID.Yarn_Type_ID,
      YarnCountID: data.YarnCountID.Yarn_Count_ID,
      Color_ID: data.Color_ID.ColorID,
      UOM_ID: data.UOM.UOM_ID,
      CreatedBy: userData?.userDetails?.userId,
      UpdatedBy: userData?.userDetails?.userId,
      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,
      IsActive: true,
    };

    try {
      const res = await Post('ComposedPrdt/Create', dataToSend);
      if (res.status === 201) {
        enqueueSnackbar('Product Created Successfully', { variant: 'success' });
        router.push(paths.dashboard.productManagement.product.root);
      } else {
        enqueueSnackbar('Product Creation Failed', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Something went wrong', { variant: 'error' });
      console.error(error);
    } finally {
      reset();
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
              <h3>Create Product</h3>
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
                {/* <RHFTextField name="Commercial_Name" label="Product Name" fullWidth /> */}
                <RHFAutocomplete
                  name="YarnCountID"
                  label="Yarn Count"
                  placeholder="Choose an option"
                  fullWidth
                  options={counts || ''}
                  getOptionLabel={(option) => option?.Yarn_Count_Name || null}
                />
                <RHFAutocomplete
                  name="Composition_ID"
                  label="Composition"
                  placeholder="Choose an option"
                  fullWidth
                  options={compositions || ''}
                  getOptionLabel={(option) => option?.Composition_Name || null}
                />
                <RHFAutocomplete
                  name="Yarn_Type_ID"
                  label="Yarn Type"
                  placeholder="Choose an option"
                  fullWidth
                  options={types || ''}
                  getOptionLabel={(option) => option?.Yarn_Type || null}
                />
                <RHFAutocomplete
                  name="Color_ID"
                  label="Color"
                  placeholder="Choose an option"
                  fullWidth
                  options={colors || ''}
                  getOptionLabel={(option) => option?.ColorName || null}
                />
                <RHFAutocomplete
                  name="UOM"
                  label="Unit of Measure"
                  placeholder="Choose an option"
                  fullWidth
                  options={UOM || ''}
                  getOptionLabel={(option) => option?.UOMName || null}
                />
                <RHFTextField
                  sx={{ gridColumn: { sm: 'span 2' } }}
                  InputProps={{ shrink: true }}
                  disabled
                  name="Product_Name"
                  label="Product Composed Name"
                  fullWidth
                  value={generateProductName()}
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
