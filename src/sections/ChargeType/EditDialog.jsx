import * as Yup from 'yup';
import { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Box,
  Stack,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import PropTypes from 'prop-types';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { Put } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function ChargesEditDialog({ uploadClose, uploadOpen, row, tableData, onSuccess }) {
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // ✅ Validation Schema
  const Schema = Yup.object().shape({
    ExtraChargesName: Yup.string()
      .required('Charges Type is required')
      .min(2, 'Charges Type must be at least 2 characters long')
      .max(100, 'Charges Type must be less than or equal to 100 characters'),
  });

  // ✅ Default Values
  const defaultValues = useMemo(
    () => ({
      ExtraChargesName: row?.ExtraChargesName || '',
      IsActive: row?.IsActive === 'Active' || row?.IsActive === true,
    }),
    [row]
  );

  // ✅ Form Setup
  const methods = useForm({
    resolver: yupResolver(Schema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // ✅ Reset form when row changes
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // ✅ PUT API Function
  const updateExtraCharges = async (dataToSend) => {
    try {
      const res = await Put('UpdateExtraCharges', dataToSend);

      if (res?.status === 200 || res?.data?.Success) {
        enqueueSnackbar('Charges Type updated successfully', { variant: 'success' });
        uploadClose();
        if (onSuccess) onSuccess(); // Refresh parent table
      } else {
        throw new Error(res?.data?.Message || 'Something went wrong');
      }
    } catch (error) {
      console.error('PUT Error:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Update failed', { variant: 'error' });
    }
  };

  // ✅ Submit Handler
  const onSubmit = handleSubmit(async (data) => {
    // 🧩 Duplicate check
    const duplicate = tableData?.some(
      (item) =>
        item.ExtraChargesName?.trim()?.toLowerCase() ===
          data.ExtraChargesName?.trim()?.toLowerCase() &&
        item.ExtraChargesID !== row?.ExtraChargesID
    );

    if (duplicate) {
      enqueueSnackbar('This Charges Type already exists!', { variant: 'error' });
      return;
    }

    // ✅ Prepare payload as per your API
    const dataToSend = {
      ExtraChargesID: row?.ExtraChargesID,
      ExtraChargesName: data.ExtraChargesName.trim(),
      IsActive: data.IsActive,
      Org_Id: userData?.userDetails?.orgId,
      Branch_Id: userData?.userDetails?.branchID,
      Last_Updated_By: userData?.userDetails?.userId,
    };

    console.log('Update Payload:', dataToSend);
    await updateExtraCharges(dataToSend);
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
            Edit Charges Type
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
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)' }}
          >
            <RHFTextField name="ExtraChargesName" label="Charges Type" />
          </Box>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              Save
            </LoadingButton>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

// ✅ Props Validation
ChargesEditDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  row: PropTypes.object,
  tableData: PropTypes.array,
  onSuccess: PropTypes.func,
};
