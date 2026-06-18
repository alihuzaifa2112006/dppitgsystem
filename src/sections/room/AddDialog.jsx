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

// ----------------------------------------------------------------------

export default function AddDptDialog({ uploadClose, uploadOpen, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewRoomSchema = Yup.object().shape({
    Storage_name: Yup.string()
      .required('Storage Location Name is required')
      .min(3, 'Storage Location Name must be at least 3 characters long')
      .max(100, 'Storage Location Name must be less than or equal to 100 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'Storage Location Name must only contain letters and spaces'),
  });

  const methods = useForm({
    resolver: yupResolver(NewRoomSchema),
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

  // ------------------------------------

  const PostRoomData = async (PostData) => {
    try {
      await Post('AddStorageLocation', PostData).then(async (res) => {
        enqueueSnackbar(res.data.message, 'Storage Location Added ');
        uploadClose();
        reset(); // Only reset after successful submission
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.message, { variant: 'error' });
    }
  };

  const onDptSubmit = handleSubmit(async (data) => {
    if (tableData.some((item) => item.Storage_name === data.Storage_name)) {
      enqueueSnackbar('Storage Location Name already exists', { variant: 'error' });
      return;
    }
    try {
      const dataToSend = {
        StoreID: data.location.StoreID,
        LocationName: data.Storage_name,
        Branch_ID: userData?.userDetails?.branchID,
        IsActive: true,
        Org_ID: userData?.userDetails?.orgId,
      };
      await PostRoomData(dataToSend);
      uploadClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      uploadClose();
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
  const [Locations, setLocation] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const ApiGetLocations = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllStorelocations?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setLocation(response.data);
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
          uploadClose(); // Call the original close function
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontSize: '20px !important' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Add Storage Location
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
              <RHFAutocomplete
                name="location"
                label="Location"
                placeholder="Choose an option"
                fullWidth
                options={Locations || ''}
                getOptionLabel={(option) => option?.StoreName || null}
                value={values?.location || null}
              />
              <RHFTextField name="Storage_name" label="Storage Location Name" />
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

AddDptDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
};
