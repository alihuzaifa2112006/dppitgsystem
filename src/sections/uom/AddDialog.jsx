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

export default function UomDialog({ uploadClose, uploadOpen, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewUomSchema = Yup.object().shape({
    UOMName: Yup.string()
      .required('Unit Of Measure is required')
      .min(1, 'Unit Of Measure must be at least 1 characters long')
      .max(5, 'Unit Of Measure must be less than or equal to 5 characters'),
    // UOMSymbol: Yup.string()
    //   .required('Unit Of Measure Symbol is required')
    //   .min(1, 'Unit Of Measure Symbol must be at least 1 characters long')
    //   .max(3, 'Unit Of Measure Symbol must be less than or equal to 3 characters'),
  });

  const methods = useForm({
    resolver: yupResolver(NewUomSchema),
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

  const PostUomData = async (PostData) => {
    try {
      await Post('addUOM', PostData).then(async (res) => {
        enqueueSnackbar(res?.data?.message || 'Unit Of Measure  Added ', { variant: 'success' });
        uploadClose();
        reset(); // Only reset after successful submission
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
    }
  };

  const onDptSubmit = handleSubmit(async (data) => {
    if (
      tableData.some(
        (item) =>
          item.UOMName.trim().toLowerCase() === data.UOMName.trim().toLowerCase() &&
          item.UOMSymbol.trim().toLowerCase() === data.UOMSymbol.trim().toLowerCase()
      )
    ) {
      enqueueSnackbar('Unit Of Measure already exists', { variant: 'error' });
      return;
    }
    try {
      const dataToSend = {
        UOMName: data.UOMName,
        UOMSymbol: data?.UOMSymbol || '',
        Description: data?.Description || 'N/A',
        CreatedBy: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      };
      await PostUomData(dataToSend);
      uploadClose();
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
  // -----------------

  const [isLoading, setLoading] = useState(true);

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
              Add Unit Of Measure
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
              <RHFTextField name="UOMName" label="Unit Of Measure" />
              {/* <RHFTextField name="UOMSymbol" label="Unit Of Measure Symbol" /> */}
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

UomDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
};
