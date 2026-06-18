import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TableBody from '@mui/material/TableBody';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { Autocomplete, Button, Checkbox, Chip, Table, TextField } from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
} from 'src/components/table';

import { Get, Post, Put } from 'src/api/apibasemethods';
import { decrypt, encrypt } from 'src/api/encryption';
import DetailTableRow from './detail-table-row';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function WICInviteCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Date In SQL format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const decryptObjectKeys = (data) => {
    const decryptedData = data.map((item) => {
      const decryptedItem = {};
      Object.keys(item).forEach((key) => {
        decryptedItem[key] = decrypt(item[key]);
      });
      return decryptedItem;
    });
    return decryptedData;
  };

  const [allCities, setAllCities] = useState([]);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewWICSchema = Yup.object().shape({
    WIC_Country_ID: Yup.object().required('Country is required'),
    WIC_City_ID: Yup.object().required('City is required'),
    WIC_ID: Yup.array().min(1, 'Please select atleast one customer'),
  });

  const methods = useForm({
    resolver: yupResolver(NewWICSchema),
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

  const GetCities = useCallback(async () => {
    const res = await Get('city/active');
    setAllCities(res.data?.Data || []);
  }, []);

  const GetCountries = useCallback(async () => {
    try {
      const response = await Get(`getallcountries`);
      setCountries(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getCitywiseWICdd = useCallback(async () => {
    try {
      const response = await Get(
        `getCitywiseWICdd?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}&City_ID=${values?.WIC_City_ID?.City_ID}`
      );
      setCustomers(response.data);
    } catch (error) {
      console.log(error);
      setCustomers([]);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    values?.WIC_City_ID?.City_ID,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([GetCities(), GetCountries()]);
      setLoading(false);
    };
    fetchData();
  }, [GetCities, GetCountries]);

  useEffect(() => {
    const filteredCities =
      allCities.filter((city) => city.Country_ID === values?.WIC_Country_ID?.Country_ID) || [];
    setCities(filteredCities);
  }, [allCities, values?.WIC_Country_ID?.Country_ID]);

  useEffect(() => {
    getCitywiseWICdd();
  }, [getCitywiseWICdd]);

  const onSubmit = handleSubmit(async (data) => {
    const dataToSend = {
      WIC_IDs: data?.WIC_ID?.map((item) => item.WIC_ID),
      Matured_Before_Date: fDate(data?.Matured_Before_Date, 'MM-dd-yyyy'),
      UpdatedBy: userData?.userDetails?.userId,
    };

    try {
      const res = await Put('AddtoInvitationList', dataToSend);
      if (res.status === 200) {
        enqueueSnackbar(res.data.Message, { variant: 'success' });
        router.push(paths.dashboard.customer.inviteWIC.root);
      } else {
        enqueueSnackbar('Something went wrong', { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Something went wrong', { variant: 'error' });
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

  return isLoading ? (
    renderLoading
  ) : (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <h3>Invite Customer</h3>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  // md: 'repeat(3, 1fr)',
                }}
              >
                <RHFAutocomplete
                  name="WIC_Country_ID"
                  label="Country"
                  type="country"
                  fullWidth
                  options={countries}
                  getOptionLabel={(option) => option?.Country_Name}
                />
                <RHFAutocomplete
                  name="WIC_City_ID"
                  label="City"
                  fullWidth
                  options={cities || ''}
                  getOptionLabel={(option) => option?.City_Name || null}
                />
                <RHFAutocomplete
                  name="WIC_ID"
                  label="Customers"
                  fullWidth
                  multiple
                  limitTags={2}
                  options={customers || ''}
                  getOptionLabel={(option) => option?.WIC_Name || null}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.WIC_ID}>
                      <Checkbox key={option.WIC_ID} size="small" disableRipple checked={selected} />
                      {option.WIC_Name}
                    </li>
                  )}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.WIC_ID}
                        label={option.WIC_Name}
                        size="small"
                        variant="soft"
                        color="primary"
                      />
                    ))
                  }
                />

                <Controller
                  name="Matured_Before_Date"
                  control={control}
                  render={({ field }) => (
                    <DesktopDatePicker
                      label="Expiry Date"
                      format="dd MMM yyyy"
                      disablePast
                      value={field.value}
                      onChange={(newValue) => field.onChange(newValue)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  )}
                />
              </Box>
            </Card>

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
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
