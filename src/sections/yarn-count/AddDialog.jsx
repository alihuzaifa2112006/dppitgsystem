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

  const NewClauseSchema = Yup.object().shape({
    Yarn_Count_Name: Yup.string().required('Yarn Count is required'),
    // .min(3, 'Yarn Count must be at least 3 characters long')
    // .max(100, 'Yarn Count must be less than or equal to 100 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'Yarn Count Name must only contain letters and spaces'),
  });

  const methods = useForm({
    resolver: yupResolver(NewClauseSchema),
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

  const PostClauseData = async (PostData) => {
    try {
      await Post('yarncount/add', PostData).then(async (res) => {
        if (res.status === 200) {
          enqueueSnackbar('Yarn Count Added Successfully', { variant: 'success' });
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
  const getNEValue = (name) => {
    if (!name) return '';

    if (name.includes('/')) {
      return name.split('/')[0].trim();
    }

    if (name.includes('-')) {
      return name.split('-')[0].trim();
    }

    return name.trim(); // fallback
  };

  const onDptSubmit = handleSubmit(async (data) => {
    // check for existing Yarn_Count_Name
    const existingYarnCount = tableData.find(
      (item) =>
        item.Yarn_Count_Name.toLowerCase().trim() === data.Yarn_Count_Name.toLowerCase().trim()
    );

    if (existingYarnCount) {
      enqueueSnackbar('Yarn Count already exists', { variant: 'error' });
      return;
    }

    const NEValue = getNEValue(data.Yarn_Count_Name);
    try {
      const dataToSend = {
        Yarn_Count_Name: data.Yarn_Count_Name,
        NE: NEValue,
        IsActive: true,
        CreatedBy: userData?.userDetails?.userId,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      };
      await PostClauseData(dataToSend);
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
              Add Yarn Count
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
              <RHFTextField name="Yarn_Count_Name" label="Yarn Count" />
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
