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

export default function CityEditDialog({ uploadClose, uploadOpen, row, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
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

  const defaultValues = useMemo(
    () => ({
      City: row?.City_Name || '',
      countries: { Country_ID: row?.Country_ID, Country_Name: row?.Country_Name } || '',
      IsActive: row?.is_Active || false,
    }),
    [row]
  );

  const methods = useForm({
    resolver: yupResolver(NewCitySchema),
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

  const PutCityData = async (PutData) => {
    try {
      await Put(`city/${row?.City_ID}`, PutData).then(async (res) => {
        enqueueSnackbar(res.data.Message);
        uploadClose();
        reset(); // Only reset after successful submission
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message, { variant: 'error' });
    }
  };

  const onDptSubmit = handleSubmit(async (data) => {
    // if (tableData.some((item) => item.Storage_name === data.Storage_name)) {
    //   enqueueSnackbar('City Name already exists', { variant: 'error' });
    //   return;
    // }
    try {
      const dataToSend = {
        City_ID: row?.City_ID,
        City_Name: data.City,
        Country_ID: data.countries.Country_ID,
        CreatedBy: userData?.userDetails?.userId,
        CreatedDate: new Date().toISOString(),
        UpdatedBy: userData?.userDetails?.userId,
        UpdatedDate: new Date().toISOString(),
        is_Active: values?.IsActive,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      };
      await PutCityData(dataToSend);
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
  // -----------------------
  const [countries, setCountry] = useState([]);
  const [isLoading, setLoading] = useState(true);
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
              Edit City
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
                options={countries || ''}
                getOptionLabel={(option) => option?.Country_Name || null}
                value={values?.countries || null}
              />
              <RHFTextField name="City" label="City Name" />
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mt: 3, userSelect: 'none' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 1 }}>
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
              </Box>
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

CityEditDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  row: PropTypes.object,
  tableData: PropTypes.array,
};
