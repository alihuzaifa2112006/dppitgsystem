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
} from 'src/components/hook-form';

import { Get, Put } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export default function CountryEditDialog({ uploadClose, uploadOpen, row, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewCountrySchema = Yup.object().shape({
    MachineName: Yup.string()
      .required('Machine Name is required')
      .min(3, 'Machine Name must be at least 3 characters long')
      .max(100, 'Machine Name must be less than or equal to 100 characters'),
  });

  const defaultValues = useMemo(() => ({
    MachineName: row?.Machine_Name || '',
    // IsActive: row?.IsActive === 'Active' ? true : false,
    IsActive: row?.IsActive === 'Active',
  }), [row]);

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

  const PutMachineData = async (putData) => {
  try {
    const res = await Put(`UpdateMachine`, putData);
    if (res?.data?.Success || res?.status === 200) {
      enqueueSnackbar(res.data.Message || 'Updated successfully', { variant: 'success' });
      uploadClose();
      reset();
    } else {
      throw new Error(res.data?.Message || 'Something went wrong');
    }
  } catch (error) {
    console.error("PUT Error:", error);
    enqueueSnackbar(error?.response?.data?.Message || 'Update failed', { variant: 'error' });
  }
};
  console.log("row", row);
  const onSubmit = handleSubmit(async (data) => {
    if (
      tableData.some(
        (item) =>
          item.Machines === data.MachineName &&
          row?.Machines !== data.MachineName
      )
    ) {
      enqueueSnackbar('Machine already exists', { variant: 'error' });
      return;
    }


    const dataToSend = {
      // MachineID: row?.MachineID || row?.MachineID,
      MachineID: row?.MachineID,
      // Machines: data.MachineName,
      Machines: data.MachineName.trim(),
      IsActive: data.IsActive,
      UpdatedBy: userData?.userDetails?.userId,
      Org_ID: userData?.userDetails?.orgId,
      Branch_ID: userData?.userDetails?.branchID,
    };
    console.log("Sending to API:", dataToSend);

    await PutMachineData(dataToSend);
  });

  console.log(row)

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
              Edit Machine
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
              <RHFTextField name="MachineName" label="Machine Name" />
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
