import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Input,
  InputAdornment,
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
  RHFUpload,
  RHFUploadBox,
} from 'src/components/hook-form';

import { Get, Post, Put } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export default function EditDialog({ uploadClose, uploadOpen, row, tableData, allTypes }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewBlend_NamesSchema = Yup.object().shape({
    Blend_Names: Yup.string()
      .required('Blend_Names Name is required')
      .min(3, 'Blend_Names Name must be at least 3 characters long')
      .max(100, 'Blend_Names Name must be less than or equal to 100 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'Blend_Names Name must only contain letters and spaces'),
    BlendType: Yup.object().required('Blend Type is required'),
  });

  const defaultValues = useMemo(
    () => ({
      BlendType: allTypes.find((docs) => docs.Blend_Type_ID === row?.Blend_Type_ID) || null,
      Blend_Names: row?.Blend_Names || '',
    }),
    [row, allTypes]
  );

  const methods = useForm({
    resolver: yupResolver(NewBlend_NamesSchema),
    defaultValues,
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
    methods.reset(defaultValues);
  }, [defaultValues, methods]);

  // ------------------------------------

  const PutBlend_NamesData = async (PutData) => {
    try {
      await Put(`blendname/${row.Blend_Name_ID}`, PutData).then(async (res) => {
        enqueueSnackbar(res.data.Message);
        uploadClose();
        reset(); // Only reset after successful submission
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message, { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    // check if the Blend_Names of the same Blend_Type_ID already exists in the tableData array

    const existingBlend_Names = tableData.find(
      (item) => item.Blend_Names === data.Blend_Names && item.Blend_Type_ID === data.BlendType.Blend_Type_ID
    );
    if (existingBlend_Names) {
      enqueueSnackbar('Blend_Names already exists', { variant: 'error' });
      return;
    }
    try {
      const dataToSend = {
        Blend_Names: data.Blend_Names,
        isActive: true,
        UpdatedBy: userData?.userDetails?.userId,
        UpdatedDate: new Date().toISOString(),
      };
      await PutBlend_NamesData(dataToSend);
    } catch (error) {
      console.error(error);
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

  return (
    <>
      <Dialog
        open={uploadOpen}
        onClose={() => {
          uploadClose(); // Call the original close function
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontSize: '20px !important' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Update Blend Name
            </Typography>

            <IconButton onClick={uploadClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              paddingY={3}
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
              }}
            >
              <RHFAutocomplete
                name="BlendType"
                label="Blend Type"
                placeholder="Choose an option"
                fullWidth
                disabled
                options={allTypes}
                getOptionLabel={(option) => option?.Blend_Type_Name}
                isOptionEqualToValue={(option, value) => option?.Blend_Type_ID === value?.Blend_Type_ID}
              />
              <RHFTextField name="Blend_Names" label="Blend Name" />
            </Box>
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
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

EditDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  row: PropTypes.object,
  tableData: PropTypes.array,
  allTypes: PropTypes.array,
};
