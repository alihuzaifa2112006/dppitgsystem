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
  FormGroup,
  FormControlLabel,
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
  RHFCheckbox,
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
    ClassName: Yup.string()
      .required('Class Name is required')
      .min(3, ' Class Name must be at least 3 characters long')
      .max(100, ' Class Name must be less than or equal to 100 characters'),
    isProcureable: Yup.boolean(),
    isProducrable: Yup.boolean(),
    isColorSensitive: Yup.boolean(),
    isRepairable: Yup.boolean(),
    isSubContracting: Yup.boolean(),
  });

  const methods = useForm({
    resolver: yupResolver(NewCountrySchema),
    defaultValues: {
      ClassName: '',
      isProcureable: false,
      isProducrable: false,
      isColorSensitive: false,
      isRepairable: false,
      isSubContracting: false,
    },
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

  // addInvType -> AddClass
  // ------------------------------------
  const PostClassName = async (PostData) => {
    try {
      await Post('AddClass', PostData).then((res) => {
        enqueueSnackbar(res.data.Message || 'Class Added', { variant: 'success' });
        uploadClose();
        reset(); // Resets the form after successful submit
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message || 'Failed to add class', {
        variant: 'error',
      });
    }
  };

  const onDptSubmit = handleSubmit(async (data) => {
    // Duplicate check
    if (tableData.some((item) => item.ClassName?.toLowerCase() === data.ClassName?.toLowerCase())) {
      enqueueSnackbar('Class already exists', { variant: 'error' });
      return;
    }

    try {
      // The `data` object from the form already contains boolean values for the checkboxes
      const dataToSend = {
        ClassName: data.ClassName,
        isProcureable: data.isProcureable,
        isProducrable: data.isProducrable,
        isColorSensitive: data.isColorSensitive,
        isRepairable: data.isRepairable,
        isSubContracting: data.isSubContracting,
        Created_By: userData?.userDetails?.userId,
        OrgID: userData?.userDetails?.orgId,
        BranchID: userData?.userDetails?.branchID,
      };

      await PostClassName(dataToSend);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error while submitting class', { variant: 'error' });
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
              Add Item Type
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
              <RHFTextField name="ClassName" label="Item Type" />

              {/* The fixed component with reduced padding and proper alignment */}
              <Box sx={{ pl: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Item Characteristics
                </Typography>
                <FormGroup sx={{ '& .MuiFormControlLabel-root': { ml: -0.5, mr: 0 } }}>
                  <FormControlLabel
                    control={<RHFCheckbox name="isProcureable" />}
                    label="Is Procureable"
                  />
                  <FormControlLabel
                    control={<RHFCheckbox name="isProducrable" />}
                    label="Is Manufacturable"
                  />
                  <FormControlLabel
                    control={<RHFCheckbox name="isColorSensitive" />}
                    label="Is Color Sensitive"
                  />
                  <FormControlLabel
                    control={<RHFCheckbox name="isRepairable" />}
                    label="Is Repairable"
                  />
                  <FormControlLabel
                    control={<RHFCheckbox name="isSubContracting" />}
                    label="Is Sub-Contracting"
                  />
                </FormGroup>
              </Box>
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

CountryDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
};
