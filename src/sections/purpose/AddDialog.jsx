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

export default function CountryDialog({ uploadClose, uploadOpen, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewCountrySchema = Yup.object().shape({
    Purpose: Yup.string()
      .required('Purpose is required')
      .min(3, 'Purpose must be at least 3 characters long')
      .max(100, 'Country Name must be less than or equal to 100 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'Country Name must only contain letters and spaces'),
  });

  const methods = useForm({
    resolver: yupResolver(NewCountrySchema),
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


  // addPurpose 
  // ------------------------------------
const PostPurposeName = async (PostData) => {
  try {
    await Post('addPurpose', PostData).then((res) => {
      enqueueSnackbar(res.data.Message || "Purpose Added", { variant: 'success' });
      uploadClose();
      reset(); // Resets the form after successful submit
    });
  } catch (error) {
    console.log(error);
    enqueueSnackbar(error?.response?.data?.Message || 'Failed to add purpose', { variant: 'error' });
  }
};
const onDptSubmit = handleSubmit(async (data) => {
  if (tableData.some((item) => item.Purposes === data.Purpose)) {
  enqueueSnackbar('Purpose already exists', { variant: 'error' });
  return;
}

  try {
    const dataToSend = {
      Purposes: data.Purpose, 
  CreatedBy: userData?.userDetails?.userId,
  Org_ID: userData?.userDetails?.orgId,
  Branch_ID: userData?.userDetails?.branchID,
    };

    await PostPurposeName(dataToSend);
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
          uploadClose(); 
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontSize: '20px !important' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Add Purpose
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

             
              <RHFTextField name="Purpose" label="Purpose" />
            </Box>
            <Stack alignItems="flex-end" >
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

CountryDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
};
