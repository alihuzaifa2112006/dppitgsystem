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

  const [roles, setRoles] = useState([]);
  const [forms, setForms] = useState([]);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewFormRoleSchema = Yup.object().shape({
    Form: Yup.object().required('Form is required'),
    Role: Yup.object().required('Role is required'),
  });

  const GetRole = useCallback(async () => {
    const res = await Get(
      `getActiveRoles?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
    );
    const updatedData = res.data?.Data?.map((item) => ({
      ...item,
      CombinedName : `${item.Name} (${item.Dpt_Name})`,
    }))
    setRoles(updatedData || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetAllActiveInactiveForm = useCallback(async () => {
    const res = await Get(
      `GetAllActiveInactiveForm?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
    );
    setForms(res.data?.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([GetRole(), GetAllActiveInactiveForm()]);
    };
    fetchData();
  }, [GetRole, GetAllActiveInactiveForm]);

  const defaultValues = useMemo(
    () => ({
      Form: forms.find((item) => item.FormId === row?.FormID) || null,
      Role: roles.find((item) => item.RoleId === row?.RoleID) || null,
      TextToDisplay: row?.TextToDisplay || '',
    }),
    [row, forms, roles]
  );

  const methods = useForm({
    resolver: yupResolver(NewFormRoleSchema),
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
    if (forms.length > 0 && roles.length > 0) {
      methods.reset(defaultValues);
    }
  }, [defaultValues, methods, forms, roles]);

  // ------------------------------------

  const PutFormRoleData = async (PutData) => {
    
    try {
      await Put(`UpdateFormRole`, PutData).then(async (res) => {
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
      tableData.some((item) => item.FormID === data.Form.FormId && item.RoleID === data.Role.RoleId)
    ) {
      enqueueSnackbar('UX Journey already exists', { variant: 'error' });
      return;
    }
    try {
      const dataToSend = {
        FormRoleId: row?.FormRoleId,
        TextToDisplay: `${data.Form.Name} ${data.Role.Name}` || '',
        Sequence: row.Sequence,
        FormID: data?.Form.FormId || null,
        RoleID: data?.Role.RoleId || null,
        IsActive: true,
        IsDeleted: false,
        UpdatedBy: userData?.userDetails?.userId,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      };
      await PutFormRoleData(dataToSend);
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
              Edit UX Journey
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
              <RHFAutocomplete
                name="Role"
                label="Role"
                placeholder="Choose an option"
                fullWidth
                options={roles}
                getOptionLabel={(option) => option?.CombinedName}
              />
              <RHFAutocomplete
                name="Form"
                label="Form"
                placeholder="Choose an option"
                fullWidth
                options={forms || []}
                getOptionLabel={(option) => option?.Name || ''}
                disabled
              />
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
