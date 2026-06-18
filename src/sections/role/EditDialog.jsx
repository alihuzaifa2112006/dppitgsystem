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

import { Get, Put } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export default function EditDialog({ uploadClose, uploadOpen, row, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [department, setDepartment] = useState([]);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewRoleSchema = Yup.object().shape({
    Name: Yup.string()
      .required('Role Name is required')
      .min(3, 'Role Name must be at least 3 characters long')
      .max(100, 'Role Name must be less than or equal to 100 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'Role Name must only contain letters and spaces'),
    Dpt_ID: Yup.object().required('Department is required'),
    Description: Yup.string().max(100, 'Description must be less than or equal to 100 characters'),
  });

  const GetDPT = useCallback(async () => {
    const res = await Get(
      `GetAllActiveInactiveDpt?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
    );
    setDepartment(res.data?.Departments || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([GetDPT()]);
    };
    fetchData();
  }, [GetDPT]);

  const defaultValues = useMemo(
    () => ({
      Name: row?.Name || '',
      Dpt_ID: department?.find((item) => item?.Dpt_ID === row?.DPT_ID) || null,
      Description: row?.Description || '',
    }),
    [row, department]
  );

  const methods = useForm({
    resolver: yupResolver(NewRoleSchema),
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
    if (department.length > 0) {
      methods.reset(defaultValues);
    }
  }, [defaultValues, methods, department]);

  // ------------------------------------

  const PutRoleData = async (PutData) => { 
    try {
      await Put(`UpdateRole`, PutData).then(async (res) => {
        enqueueSnackbar(res.data.Message);
        uploadClose();
        reset(); // Only reset after successful submission
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message, { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (
      tableData.some(
        (item) =>
          item.Name.toLowerCase() === data.Name.toLowerCase() 
      )
    ) {
      enqueueSnackbar('This Role already exists', { variant: 'error' });
      return;
    }
    try {
      const dataToSend = {
        RoleID: row?.RoleId,
        DPT_ID: data?.Dpt_ID?.Dpt_ID || 1,
        Name: data.Name,
        Description: data.Description || '',
        IsActive: true,
        UpdatedBy: userData?.userDetails?.userId,
      };
      await PutRoleData(dataToSend);
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
              Edit Role
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
              <RHFTextField name="Name" label="Role Name" />
              <RHFAutocomplete
                name="Dpt_ID"
                label="Department"
                placeholder="Choose an option"
                fullWidth
                options={department}
                getOptionLabel={(option) => option?.Dpt_Name}
              />
              <RHFTextField name="Description" label="Description" />
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

EditDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  row: PropTypes.object,
  tableData: PropTypes.array,
};
