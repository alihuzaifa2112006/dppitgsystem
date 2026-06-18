import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { Post } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export default function CountryDialog({ uploadClose, uploadOpen, tableData, onSuccess }) {
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // ✅ Validation Schema
  const NewCountrySchema = Yup.object().shape({
    ExtraChargesName: Yup.string()
      .required('Charges Type is required')
      .min(2, 'Charges Type must be at least 2 characters long')
      .max(100, 'Charges Type must be less than or equal to 100 characters'),
  });

  // ✅ Default Values
  const defaultValues = useMemo(
    () => ({
      ExtraChargesName: '',
    }),
    []
  );

  // ✅ Form Setup
  const methods = useForm({
    resolver: yupResolver(NewCountrySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // ✅ Post API Function (like your working screen)
  const PostMachineName = async (PostData) => {
    try {
      await Post('AddExtraCharges', PostData).then(async (res) => {
        enqueueSnackbar('Charges Type Added Successfully', { variant: 'success' });

        // Close Dialog
        uploadClose();

        // Reset Form
        reset();

        // Refresh Parent Table
        if (onSuccess) {
          onSuccess();
        }
      });
    } catch (error) {
      console.log('API Error:', error?.response?.data || error);
      enqueueSnackbar(error?.response?.data?.Message || 'Failed to add Charges Type', {
        variant: 'error',
      });
    }
  };

  // ✅ Submit Handler
  const onDptSubmit = handleSubmit(async (data) => {
    // Duplicate Check
    if (
      tableData &&
      tableData.some(
        (item) => item.ExtraChargesName?.toLowerCase() === data.ExtraChargesName?.toLowerCase()
      )
    ) {
      enqueueSnackbar('Charges Type already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = [
        {
          ExtraChargesName: data.ExtraChargesName,
          Org_Id: userData?.userDetails?.orgId,
          Branch_Id: userData?.userDetails?.branchID,
          Created_By: userData?.userDetails?.userId,
          IsActive: true,
        },
      ];

      await PostMachineName(dataToSend);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error while submitting Charge Type', { variant: 'error' });
    }
  });

  // ✅ Render Dialog
  return (
    <Dialog
      open={uploadOpen}
      onClose={() => {
        uploadClose();
        reset(defaultValues);
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ fontSize: '20px !important' }}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Add Charges Type
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
            <RHFTextField name="ExtraChargesName" label="Charges Type" />
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
  );
}

CountryDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
  onSuccess: PropTypes.func,
};
