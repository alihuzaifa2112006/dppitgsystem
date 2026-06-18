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

export default function CityDialog({ uploadClose, uploadOpen, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [countries, setCountry] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewCitySchema = Yup.object().shape({
    countries: Yup.object().required('Country is required'),
    City: Yup.string()
      .required('City Name is required')
      .min(3, 'City Name must be at least 3 characters long')
      .max(100, 'City Name must be less than or equal to 100 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'City Name must only contain letters and spaces'),
  });

  const methods = useForm({
    resolver: yupResolver(NewCitySchema),
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

  const PostCity = async (PostData) => {
    try {
      await Post('city', PostData).then(async (res) => {
        enqueueSnackbar(res.data.Message, 'City Added ');
        uploadClose();
        reset(); // Only reset after successful submission
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message, { variant: 'error' });
    }
  };

  const onDptSubmit = handleSubmit(async (data) => {
    if (tableData.some((item) => item.City_Name === data.City)) {
      enqueueSnackbar('City Name already exists', { variant: 'error' });
      return;
    }
    try {
      const dataToSend = {
        City_Name: data.City,
        Country_ID: data.countries.Country_ID,
        CreatedBy: userData?.userDetails?.userId,
        CreatedDate: new Date().toISOString(),
        UpdatedBy: userData?.userDetails?.userId,
        UpdatedDate: new Date().toISOString(),
        is_Active: true,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      };
      await PostCity(dataToSend);
      uploadClose();
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
  // -----------------
  const ApiGetCountry = useCallback(async () => {
    try {
      const response = await Get(`getallcountries`);
      setCountry(response?.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([ApiGetCountry()]);
      setLoading(false);
    };
    fetchData();
  }, [ApiGetCountry]);
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
              Add City
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
                name="countries"
                label="Country"
                type="country"
                placeholder="Choose an option"
                fullWidth
                options={countries || []}
                getOptionLabel={(option) => option?.Country_Name || ''}
                value={values?.countries || null}
              />
              <RHFTextField name="City" label="City Name" />
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

CityDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
};
