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
import { APP_API_STORAGE } from 'src/config-global';

// ----------------------------------------------------------------------

export default function EditDialog({ uploadClose, uploadOpen, row }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [countries, setCountries] = useState([]);
  const [logo, setLogo] = useState(null);

  const [loading, setLoading] = useState(true);
  console.log('row', row);
  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewEndCustomerSchema = Yup.object().shape({
    End_Cust_Name: Yup.string()
      .required('Main Buyer Name is required')
      .min(3, 'Main Buyer Name must be at least 3 characters long')
      .max(100, 'Main Buyer Name must be less than or equal to 100 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'Main Buyer Name must only contain letters and spaces'),
    End_Cust_CountryID: Yup.object().required('Country is required'),
    // Logo: Yup.mixed()
    //   .required('Logo is required')
    //   .test('fileType', 'Only image files [jpeg, jpg and png] are accepted', (value) => {
    //     if (!value) return false;
    //     return value.type.startsWith('image/');
    //   }),
  });
  const GetCountries = useCallback(async () => {
    const res = await Get('getallcountries');
    setCountries(res?.data.Data || []);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([GetCountries()]);
      setLoading(false);
    };
    fetchData();
  }, [GetCountries]);

  const defaultValues = useMemo(
    () => ({
      End_Cust_Name: row?.End_Cust_Name_Org || '',
      End_Cust_CountryID:
        countries?.find((country) => country.Country_Name === row?.Country_Name) || {},
      Logo: row?.End_CustLogoPath || null,
    }),
    [row, countries]
  );

  const methods = useForm({
    resolver: yupResolver(NewEndCustomerSchema),
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
    if (!loading && row) {
      reset({
        End_Cust_Name: row?.End_Cust_Name_Org || '',
        End_Cust_CountryID:
          countries?.find((country) => country.Country_Name === row?.Country_Name) || null,
        Logo: null, // Form value will still get file on change
      });

      // Set logo preview if logo path exists
      if (row?.End_CustLogoPath) {
        const fullLogoPath = `${APP_API_STORAGE}${row?.End_CustLogoPath}`;
        setLogo({
          preview: fullLogoPath,
          name: row?.End_CustLogoName,
          type: 'image/png', // You can try to detect actual type if needed
        });
      } else{
        setLogo(null); // Reset logo if no path exists
      }
    }
  }, [loading, row, countries, reset]);

  const handleLogo = (acceptedFiles) => {
    const newFile = acceptedFiles[0];
    if (newFile) {
      newFile.preview = URL.createObjectURL(newFile);
      setLogo(newFile);
      setValue('Logo', newFile, { shouldValidate: true }); // Update form value and trigger validation
    }
  };

  // ------------------------------------

  const PutEndCustomerData = async (PutData) => {
    try {
      const formData = new FormData();
      formData.append('End_Cust_Name', PutData.End_Cust_Name);
      formData.append('End_Cust_CountryID', PutData.End_Cust_CountryID);
      formData.append('CreatedBy', PutData.CreatedBy);
      formData.append('Branch_ID', PutData.Branch_ID);
      formData.append('Org_ID', PutData.Org_ID);
      formData.append('Logo', PutData.Logo); // Use the logo from form data

      await Put(`endcustomer/update/${row?.End_Cust_ID}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(async (res) => {
        enqueueSnackbar(res.data.Message);
        uploadClose();
        reset();
        setLogo(null); // Reset the preview state
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message, { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const dataToSend = {
        End_Cust_Name: data.End_Cust_Name,
        End_Cust_CountryID: data.End_Cust_CountryID.Country_ID,
        UpdatedBy: userData?.userDetails?.userId,
        Logo: data.Logo, // Use the form value instead of separate state
      };
      await PutEndCustomerData(dataToSend);
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
          reset(); // Reset the form when closing the dialog
          setLogo(null); // Reset the logo preview state
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontSize: '20px !important' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Edit Main Buyer
            </Typography>

            <IconButton onClick={uploadClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {loading ? (
            <LoadingScreen />
          ) : (
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
                <RHFTextField name="End_Cust_Name" label="Main Buyer Name*" />
                <RHFAutocomplete
                  name="End_Cust_CountryID"
                  label="Country"
                  type="country"
                  placeholder="Choose an option"
                  fullWidth
                  options={countries}
                  getOptionLabel={(option) => option?.Country_Name}
                  // value={countries?.find(
                  //   (option) => option?.Country_ID === values?.End_Cust_CountryID?.Country_ID
                  // )}
                />
                <RHFUpload
                  title="Logo"
                  name="Logo"
                  file={logo}
                  accept={{ 'image/*': ['.jpg', '.jpeg', '.png'] }}
                  onDrop={handleLogo}
                  onDelete={() => {
                    setLogo(null);
                    setValue('Logo', null, { shouldValidate: true });
                  }}
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
          )}
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
