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
  FormControlLabel,
  FormGroup,
  IconButton,
  Input,
  InputAdornment,
  Switch,
  Tooltip,
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
  RHFSwitch,
  RHFCheckbox,
} from 'src/components/hook-form';

import { Get, Post, Put } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export default function CountryEditDialog({ uploadClose, uploadOpen, row, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewCountrySchema = Yup.object().shape({
    ClassName: Yup.string()
      .required('Item Type is required')
      .min(3, 'Item Type must be at least 3 characters long')
      .max(100, 'Item Type must be less than or equal to 100 characters'),
  });

  const defaultValues = useMemo(
    () => ({
      ClassName: row?.InvType_Name || '',
      ClassID: row?.InvTypeID || '',
      // IsActive: row?.IsActive === 'Active' ? true : false,
      // IsActive: row?.IsActive === 'Active',
      isProducrable: row?.isProducrable,
      isProcureable: row?.isProcureable,
      isColorSensitive: row?.isColorSensitive,
      isRepairable: row?.isRepairable,
      isSubContracting: row?.isSubContracting,
    }),
    [row]
  );

  const methods = useForm({
    resolver: yupResolver(NewCountrySchema),
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

  const PutInvTypeData = async (putData) => {
    try {
      const res = await Post(`UpdateClass`, putData);
      if (res?.data?.Success || res?.status === 200) {
        enqueueSnackbar(res.data.Message || 'Updated successfully', { variant: 'success' });
        uploadClose();
        reset();
      } else {
        throw new Error(res.data?.Message || 'Something went wrong');
      }
    } catch (error) {
      console.error('PUT Error:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Update failed', { variant: 'error' });
    }
  };
  const onSubmit = handleSubmit(async (data) => {
    // if (
    //   tableData.some(
    //     (item) => item.InvTypes === data.InvTypeName && row?.InvTypes !== data.InvTypeName
    //   )
    // ) {
    //   enqueueSnackbar('InvType already exists', { variant: 'error' });
    //   return;
    // }

    const dataToSend = {
      ClassID: data?.ClassID,
      ClassName: data.ClassName,
      isProcureable: data.isProcureable,
      isProducrable: data.isProducrable,
      isColorSensitive: data.isColorSensitive,
      isRepairable: data.isRepairable,
      isSubContracting: data.isSubContracting,
      Updated_By: userData?.userDetails?.userId,
      Is_Active: data.IsActive ? 1 : 0,
    };

    await PutInvTypeData(dataToSend);
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
  // -----------------------

  const [Locations, setLocation] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const ApiGetLocations = useCallback(async () => {
    try {
      const response = await Get(
        `ApiGetBlendTypeList?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setLocation(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([ApiGetLocations()]);
      setLoading(false);
    };
    fetchData();
  }, [ApiGetLocations]);
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
              Edit InvType
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
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mt: 3, userSelect: 'none' }}
            >
              {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 1 }}>
                <Typography variant="body2">Status</Typography>
                <Tooltip title="Update Status">
                  <RHFSwitch
                    name="IsActive"
                    checked={values.IsActive === true}
                    color="success"
                    onClick={() => {
                      setValue('IsActive', !values.IsActive);
                    }}
                    // disabled={isUpdating}
                  />
                </Tooltip>
              </Box> */}
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
              >
                Save
              </LoadingButton>
            </Box>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

CountryEditDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  row: PropTypes.object,
  tableData: PropTypes.array,
};
