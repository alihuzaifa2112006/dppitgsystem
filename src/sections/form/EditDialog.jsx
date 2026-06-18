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
import { useNavData } from 'src/layouts/dashboard/config-navigation';

// ----------------------------------------------------------------------

export default function EditDialog({ uploadClose, uploadOpen, row }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [FormNames, setFormNames] = useState([]);

  const navData = useNavData();
  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewFormSchema = Yup.object().shape({
    FormNames: Yup.object().required('Please select a Form Name'),
    Description: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      FormNames: { title: row?.Name, path: row?.Link } || '',
      Description: row?.Description || '',
    }),
    [row]
  );

  const methods = useForm({
    resolver: yupResolver(NewFormSchema),
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

  function extractNavItems(data) {
    const updatedNavData = [];

    data.forEach((section) => {
      const items = section.item || section.items || [];

      items.forEach(({ title, path, children }) => {
        if (Array.isArray(children) && children.length > 0) {
          // If there are children, only include them
          children.forEach((child) => {
            if (child.title && child.path) {
              updatedNavData.push({ title: child.title, path: child.path });
            }
          });
        } else if (title && path) {
          // Include parent only if it has no children
          updatedNavData.push({ title, path });
        }
      });
    });

    setFormNames(updatedNavData); // Your state updater
    return updatedNavData;
  }

  useEffect(() => {
    extractNavItems(navData);
  }, [navData]);

  useEffect(() => {
    methods.reset(defaultValues);
  }, [defaultValues, methods]);

  // ------------------------------------

  const PutFormData = async (PutData) => {
    try {
      await Put(`UpdateForm`, PutData).then(async (res) => {
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
    try {
      const dataToSend = {
        FormId: row?.FormId,
        Instrument_ID: row.Instrument_ID || 0,
        Name: data.FormNames?.title,
        Description: data.Description,
        Link: data.FormNames?.path,
        isActive: true,
        UpdatedBy: userData?.userDetails?.userId,
        BranchID: userData?.userDetails?.branchID,
        OrgID: userData?.userDetails?.orgId,
      };
      await PutFormData(dataToSend);
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
              Edit Form
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
                name="FormNames"
                label="Form Name"
                placeholder="Choose an option"
                fullWidth
                options={FormNames || []}
                disabled
                getOptionLabel={(option) => option?.title || ''}
              />
              {/* <RHFTextField name="Name" label="Form Name" /> */}
              {/* <RHFTextField name="Link" label="Link" /> */}
              <RHFTextField name="Description" label="Description" multiline rows={3} />
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
};
