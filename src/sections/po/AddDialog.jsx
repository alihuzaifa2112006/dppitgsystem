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
import FormProvider, {
  RHFTextField,
} from 'src/components/hook-form';

import { Post } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';

export default function AddinvCategoryDialog({ uploadClose, uploadOpen, tableData , onSuccess}) { 
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const NewExtraChargeSchema = Yup.object().shape({
    ExtraChargesName: Yup.string()
      .required('Charges Type is required')
      .min(3, 'Charges Type must be at least 3 characters long')
      .max(100, 'Charges Type must be less than or equal to 100 characters'),
  });

  const defaultValues = useMemo(
    () => ({
      ExtraChargesName: '',
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(NewExtraChargeSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // const PostExtraChargeData = async (PostData) => {
  //   try {
  //     await Post('AddExtraCharges', PostData).then(async (res) => {
  //       enqueueSnackbar('Extra Charge Added Successfully', { variant: 'success' }); 
  //       uploadClose();
  //       reset(); 
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     enqueueSnackbar(error?.response?.data?.Message || 'Failed to add Extra Charge', { variant: 'error' });
  //   }
  // };
const PostExtraChargeData = async (PostData) => {
  try {
    await Post('AddExtraCharges', PostData).then(async (res) => {
      // 1. Show success notification
      enqueueSnackbar('Extra Charge Added Successfully', { variant: 'success' }); 
      
      // 2. Close the dialog
      uploadClose();
      
      // 3. Reset the form fields
      reset(); 
      
      // ðŸŒŸ 4. Call the refresh function passed from the parent component ðŸŒŸ
      if (onSuccess) {
          onSuccess();
      }
    });
  } catch (error) {
    console.log(error);
    enqueueSnackbar(error?.response?.data?.Message || 'Failed to add Extra Charge', { variant: 'error' });
  }
};
  const onDptSubmit = handleSubmit(async (data) => {
    
    if (
      tableData && tableData.some(
        (item) => item.ExtraChargesName === data.ExtraChargesName
      )
    ) {
      enqueueSnackbar('Extra Charge Type Name already exists', { variant: 'error' });
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
        }
      ];
      
      await PostExtraChargeData(dataToSend);
      
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <>
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
    </>
  );
}

AddinvCategoryDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array, 
  onSuccess: PropTypes.func,
};