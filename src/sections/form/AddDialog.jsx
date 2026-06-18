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
import { useNavData } from 'src/layouts/dashboard/config-navigation';

// ----------------------------------------------------------------------

export default function AddDialog({ uploadClose, uploadOpen, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [FormNames, setFormNames] = useState([]);

  const navData = useNavData();
console.log('navData', navData);
  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewFormSchema = Yup.object().shape({
    FormNames: Yup.object().required('Please select a Form Name'),
    Description: Yup.string(),
  });

  const methods = useForm({
    resolver: yupResolver(NewFormSchema),
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

    //  filter out the titles that are already in the table
    const filteredData = updatedNavData.filter(
      (item) => !tableData.some((tableItem) => tableItem.Name === item.title)
    );
    setFormNames(filteredData); // Your state updater
    return filteredData;
  }

  useEffect(() => {
    extractNavItems(navData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navData, tableData]);

  // ------------------------------------

  const PostFormData = async (PostData) => {
    try {
      await Post('AddForm', PostData).then(async (res) => {
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
    if (tableData.find((item) => item.Link === data.FormNames?.path)) {
      enqueueSnackbar('Form Name already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        Instrument_ID: data.Instrument_ID || 0,
        Name: data.FormNames?.title,
        Description: data.Description,
        Link: data.FormNames?.path,
        isActive: true,
        CreatedBy: userData?.userDetails?.userId,
        BranchID: userData?.userDetails?.branchID,
        OrgID: userData?.userDetails?.orgId,
      };
      await PostFormData(dataToSend);
      reset();
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
              Add Form
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
                getOptionLabel={(option) => option?.title}
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

AddDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
};
