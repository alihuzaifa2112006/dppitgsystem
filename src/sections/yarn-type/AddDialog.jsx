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

export default function AddDialog({ uploadClose, uploadOpen, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewTypeSchema = Yup.object().shape({
    Yarn_Code: Yup.string().required('Yarn Code is required'),
    Yarn_Type: Yup.string().required('Yarn Type is required'),
    // .min(3, 'Yarn Type must be at least 3 characters long')
    // .max(100, 'Yarn Type must be less than or equal to 100 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'Yarn Type Name must only contain letters and spaces'),
  });

  const methods = useForm({
    resolver: yupResolver(NewTypeSchema),
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

  const PostTypeData = async (PostData) => {
    try {
      await Post('yarntype/add', PostData).then(async (res) => {
        if (res.status === 200) {
          enqueueSnackbar('Yarn Type Added Successfully', { variant: 'success' });
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
    // Check if Yarn Type already exists by triming and converting to lowercase first
    const trimmedYarnType = data.Yarn_Type.trim().toLowerCase();
    const existingType = tableData.find(
      (item) => item.Yarn_Type.trim().toLowerCase() === trimmedYarnType
    );
    // Check if Yarn Code already exists by triming and converting to lowercase first
    const trimmedYarnCode = data.Yarn_Code.trim().toLowerCase();
    const existingCode = tableData.find(
      (item) => item.Yarn_Code.trim().toLowerCase() === trimmedYarnCode
    );
    if (existingType) {
      enqueueSnackbar('Yarn Type already exists', { variant: 'error' });
      return;
    }
    if (existingCode) {
      enqueueSnackbar('Yarn Code already exists', { variant: 'error' });
      return;
    }
    try {
      const dataToSend = {
        Yarn_Type: data.Yarn_Type,
        Yarn_Code: data.Yarn_Code,
        IsActive: true,
        CreatedBy: userData?.userDetails?.userId,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      };
      await PostTypeData(dataToSend);
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
              Add Yarn Type
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
              <RHFTextField name="Yarn_Code" label="Yarn Code" />
              <RHFTextField name="Yarn_Type" label="Yarn Type" />
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
};
