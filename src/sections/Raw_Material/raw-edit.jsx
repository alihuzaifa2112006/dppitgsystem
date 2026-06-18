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

import { Get, Put } from 'src/api/apibasemethods';
import { decrypt, encrypt } from 'src/api/encryption';
import DetailTableRow from './detail-table-row';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { grid } from '@mui/system';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export default function RMEditForm({ currentProduct }) {
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
  const [Blendtypes, setBlendTypes] = useState([]);
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
 const KGtoLbs = (kg) => {
    console.log('kg', kg);
    return kg * 2.20462;
  };
  const defaultValues = useMemo(
    () => ({
      Commercial_Name: currentProduct?.Commercial_Name || '',
      YarnCountID:
        counts.find((count) => count.Yarn_Count_ID === currentProduct?.Yarn_Count_ID) || '',
      Composition_ID:
        compositions.find(
          (composition) => composition.Composition_ID === currentProduct?.Composition_ID
        ) || '',
      Yarn_Type_ID: types.find((type) => type.Yarn_Type_ID === currentProduct?.Yarn_Type_ID) || '',
      Color_ID: colors.find((color) => color.Color_ID === currentProduct?.Color_ID) || '',
      UOM: UOM.find((uom) => uom.UOM_ID === currentProduct?.UOMID) || '',
      Product_Name: currentProduct?.Product_Name || '',
    }),
    [currentProduct, counts, compositions, types, colors, UOM]
  );

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

  useEffect(() => {
    if (!isLoading) {
      methods.reset(defaultValues);
    }
  }, [isLoading, defaultValues, methods]);

  const generateProductName = () => {
    const productCode = `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${
      values?.YarnCountID?.Yarn_Count_Name || ''
    } -  ${values?.Composition_ID?.Composition_Name || ''}  (${
      values?.Color_ID?.ColorName || ''
    } - ${values?.Color_ID?.Color_Code || ''})`;
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
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        ApiGetCount(),
        APIGetTypeList(),
        APIGetCompositionList(),
        APIGetColorList(),
        APIGetUOM(),
        APIGetBlend()
      ]);
      setLoading(false);
    };
    fetchData();
  }, [ApiGetCount, APIGetTypeList, APIGetCompositionList, APIGetColorList, APIGetUOM,APIGetBlend]);

  const onSubmit = handleSubmit(async (data) => {
    const dataToSend = {
      
      Blend_Name_ID: data.Yarn_Type_ID.Blend_Type_ID,
      RM_Dimension: "40x40",
      RM_Color_ID: data.Color_ID.ColorID,
      UOM_ID: 1,
      RM_OpeningStock: data?.Quantity,
      Comments: data.Comments,
      Remarks: data.Remarks,
      CreatedBy: userData?.userDetails?.userId,
      // UpdatedBy: userData?.userDetails?.userId,
      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,

    };
    console.log('dataToSend', dataToSend);

    try {
      const res = await Put(
        `updateYarnProduct/${currentProduct?.Product_ID}/${userData?.userDetails?.userId}`,
        dataToSend
      );
      if (res.status === 200) {
        enqueueSnackbar('Product Updated Successfully', { variant: 'success' });
        router.push(paths.dashboard.productManagement.product.root);
      }
    } catch (error) {
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

  console.log('values', values);
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
     
     
     
                     <RHFAutocomplete
                       name="Blend_Type_ID"
                       label="Raw Material"
                       placeholder="Choose an option"
                       fullWidth
                       options={Blendtypes || ''}
                       getOptionLabel={(option) => option?.Blend_Names || null}
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
                       label="Dimension"
                       placeholder="Choose an option"
                       fullWidth
                       options={UOM || ''}
                       getOptionLabel={(option) => option?.UOMName || null}
                     />
     
     
                     <RHFTextField
                       name="Quantity"
                       label="Quantity in KG"
                       type="number"
                       variant="outlined"
                       fullWidth
                       value={values.Quantity || ''}
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

RMEditForm.propTypes = {
  currentProduct: PropTypes.object,
};
