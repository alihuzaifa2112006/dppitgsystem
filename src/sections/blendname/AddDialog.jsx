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

import { Get, Post } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export default function AddDialog({ uploadClose, uploadOpen, tableData, allTypes }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewBlendnameSchema = Yup.object().shape({
    Blend_Names: Yup.string()
      .required('Blend Name is required')
      .min(3, 'Blend Name must be at least 3 characters long')
      .max(100, 'Blend Name must be less than or equal to 100 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'Blendname Name must only contain letters and spaces'),
    BlendType: Yup.object().required('Blend Type is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewBlendnameSchema),
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

  // ------------------------------------

  const PostBlendnameData = async (PostData) => {
    try {
      await Post('Addblendname', PostData).then(async (res) => {
        if (res.status === 201) {
          enqueueSnackbar('Blend Name Created Successfully', {
            variant: 'success',
          });
          reset();
          uploadClose();
        } else {
          enqueueSnackbar(res.data.Message, { variant: 'error' });
        }
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message, { variant: 'error' });
    }
  };

  const onDptSubmit = handleSubmit(async (data) => {
    const existingBlendname = tableData.find(
      (item) =>
        item.Blend_Names === data.Blend_Names && item.Blend_Type_ID === data.BlendType.Blend_Type_ID
    );
    if (existingBlendname) {
      enqueueSnackbar('Blend Name already exists', { variant: 'error' });
      return;
    }
    try {
      const dataToSend = {
        Blend_Names: data.Blend_Names,
        Blend_Type_ID: data.BlendType.Blend_Type_ID,
        CreatedBy: userData?.userDetails?.userId,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      };
      await PostBlendnameData(dataToSend);
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
              Blend Name
            </Typography>

            <IconButton onClick={uploadClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <FormProvider methods={methods} onSubmit={onDptSubmit}>
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
                options={allTypes}
                getOptionLabel={(option) => option?.Blend_Type_Name}
                isOptionEqualToValue={(option, value) =>
                  option?.Blend_Type_ID === value?.Blend_Type_ID
                }
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

AddDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
  allTypes: PropTypes.array,
};
