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

export default function EditDialog({ uploadClose, uploadOpen, row }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [countries, setCountries] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewAgentSchema = Yup.object().shape({
    Agent_Name: Yup.string()
      .required('Agency Name is required')
      .min(3, 'Agency Name must be at least 3 characters long')
      .max(100, 'Agency Name must be less than or equal to 100 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'Agency Name must only contain letters and spaces'),
    Agent_CountryID: Yup.object().required('Country is required'),
    Agent_CityID: Yup.object().required('City is required'),
  });

  const GetCountries = useCallback(async () => {
    const res = await Get('getallcountries');
    setCountries(res?.data.Data || []);
  }, []);

  const GetCities = useCallback(async () => {
    const res = await Get('city/active');
    setAllCities(res.data?.Data || []);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([GetCountries(), GetCities()]);
      setLoading(false);
    };
    fetchData();
  }, [GetCountries, GetCities]);

  const defaultValues = useMemo(
    () => ({
      Agent_Name: row?.Agent_Name_Org || '',
      Agent_CountryID: null, // Initialize as null
      Agent_CityID: null, // Initialize as null
    }),
    [row]
  );

  const methods = useForm({
    resolver: yupResolver(NewAgentSchema),
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
    if (!loading && countries.length > 0 && allCities.length > 0) {
      const country = countries.find((c) => c.Country_ID === row?.Agent_CountryID);
      const city = allCities.find((c) => c.City_ID === row?.Agent_CityID);

      reset({
        Agent_Name: row?.Agent_Name_Org || '',
        Agent_CountryID: country || null,
        Agent_CityID: city || null,
      });
    }
  }, [loading, countries, allCities, row, reset]);

  useEffect(() => {
    if (values?.Agent_CountryID?.Country_ID) {
      const filteredCities = allCities.filter(
        (city) => city.Country_ID === values?.Agent_CountryID?.Country_ID
      );
      setCities(filteredCities);

      // Reset city if country changes and current city doesn't belong to new country
      if (
        values.Agent_CityID &&
        !filteredCities.some((c) => c.City_ID === values.Agent_CityID.City_ID)
      ) {
        setValue('Agent_CityID', null);
      }
    } else {
      setCities([]);
    }
  }, [values?.Agent_CountryID?.Country_ID, allCities, setValue, values.Agent_CityID]);
  // ------------------------------------

  const PutAgentData = async (PutData) => {
    try {
      await Put(`agent/update/${row?.AgentID}`, PutData).then(async (res) => {
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
        Agent_Name: data.Agent_Name,
        Agent_CountryID: data.Agent_CountryID.Country_ID,
        Agent_CityID: data.Agent_CityID.City_ID,
        CreatedBy: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
      };
      await PutAgentData(dataToSend);
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
              Edit Agency
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
              <RHFTextField name="Agent_Name" label="Agency Name" />
              <RHFAutocomplete
                name="Agent_CountryID"
                label="Country"
                type="country"
                placeholder="Choose an option"
                fullWidth
                options={countries}
                getOptionLabel={(option) => option?.Country_Name}
                // value={countries?.find(
                //   (option) => option?.Country_ID === values?.Agent_CountryID?.Country_ID
                // )}
              />
              <RHFAutocomplete
                name="Agent_CityID"
                label="City"
                placeholder="Choose an option"
                fullWidth
                options={cities || ''}
                getOptionLabel={(option) => option?.City_Name || null}
                // value={cities?.find((option) => option?.City_ID === values?.Agent_CityID?.City_ID)}
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
};
