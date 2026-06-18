import * as Yup from 'yup';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
} from 'src/components/hook-form';
import axios from 'axios';
import { Get, Post } from 'src/api/apibasemethods';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

export default function AgencyAdd() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem('UserData'));
  const [countries, setCountries] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [cities, setCities] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);

  // State for contacts
  const [contacts, setContacts] = useState([
    {
      Contact_Name: '',
      Contact_Number: '',
      Email_Address: '',
      Comments: '',
      Remarks: '',
      IsActive: true,
      CreatedBy: userData?.userDetails?.userId || 1,
    },
  ]);

  // Validation schema
  const AgentSchema = Yup.object().shape({
    Agent_Name: Yup.string()
      .required('Agent name is required')
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name must not exceed 100 characters'),
    Agent_Email: Yup.string()
      .required('Email is required')
      .email('Must be a valid email'),
    Agent_Phone: Yup.string()
      .required('Phone is required')
      .matches(/^[0-9]+$/, 'Must be only digits'),
    Agent_Address: Yup.string().required('Address is required'),
    Type_of_Business: Yup.object().required('Business type is required'),
    Payment_Term_ID: Yup.object().required('Payment term is required'),
    Agent_CountryID: Yup.object().required('Country is required'),
    Agent_CityID: Yup.object().required('City is required'),
    Credit_Limits: Yup.number()
      .required('Credit limit is required')
      .min(0, 'Credit limit must be positive'),
    Year_of_Establishment: Yup.string().required('Year is required'),

    // Contacts validation
    contacts: Yup.array().of(
      Yup.object().shape({
        Contact_Name: Yup.string().required('Contact name is required'),
        Contact_Number: Yup.string().required('Contact number is required'),
        Email_Address: Yup.string()
          .email('Must be a valid email')
          .required('Email is required'),
      })
    ),
  });

  // Fetch reference data
  const GetCountries = useCallback(async () => {
    const res = await Get('getallcountries');
    setCountries(res?.data.Data || []);
  }, []);

  const GetCities = useCallback(async () => {
    const res = await Get('city/active');
    setAllCities(res.data?.Data || []);
  }, []);
 const GetBusinessType = useCallback(async () => {
     const res = await Get('APIGetCustBusinessType/GetAllCustBussinessType');
     setBusinessTypes(res.data?.Data || []);
   }, []);

  const GetPaymentTermData = useCallback(async () => {
    
        try {
          const response = await Get(
            `getPaymentTermList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
          );
    
          setPaymentTerms(response.data.Data);
        } catch (error) {
          console.log(error);
        }
      }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);
 useEffect(() => {
    const fetch = async () => {
      Promise.all([
        GetCountries(),
        GetBusinessType(),
       GetCities(),
        GetPaymentTermData(),
      ]);
    };
    fetch();
  }, [GetCountries, GetBusinessType,GetPaymentTermData,GetCities]);


  const defaultValues = useMemo(
    () => ({
      Branch_ID: userData?.userDetails?.branchID || 5,
      Org_ID: userData?.userDetails?.orgId || 1,
      isActive: true,
      CreatedBy: userData?.userDetails?.userId || 1,
      contacts: [
        {
          Contact_Name: '',
          Contact_Number: '',
          Email_Address: '',
          Comments: '',
          Remarks: '',
          IsActive: true,
          CreatedBy: userData?.userDetails?.userId || 1,
        },
      ],
    }),
    [userData]
  );

  const methods = useForm({
    resolver: yupResolver(AgentSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  // Handle contacts
  const handleAddContact = () => {
    const newContact = {
      Contact_Name: '',
      Contact_Number: '',
      Email_Address: '',
      Comments: '',
      Remarks: '',
      IsActive: true,
      CreatedBy: userData?.userDetails?.userId || 1,
    };
    setContacts([...contacts, newContact]);
    setValue('contacts', [...values.contacts, newContact]);
  };

  const handleDeleteContact = (index) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    setContacts(updatedContacts);
    setValue('contacts', updatedContacts);
  };

  // Handle city filtering based on country
  useEffect(() => {
    const filteredCities = allCities.filter(
      (city) => city.Country_ID === values?.Agent_CountryID?.Country_ID
    );
    setCities(filteredCities);
  }, [allCities, values?.Agent_CountryID?.Country_ID]);

  // Form submission
  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        ...data,
        Type_of_Business: data.Type_of_Business.CustBusinessType_ID,
        Payment_Term_ID: data.Payment_Term_ID.Payment_term_ID,
        Agent_CountryID: data.Agent_CountryID.Country_ID,
        Agent_CityID: data.Agent_CityID.City_ID,
        CreatedDate: new Date().toISOString(),
        contacts: data.contacts.map(contact => ({
          ...contact,
          CreatedDate: new Date().toISOString(),
        })),
      };

      const response = await Post('CreateAgent', payload);

      if (response.status === 200) {
        enqueueSnackbar('Agent added successfully', { variant: 'success' });
        navigate(paths.dashboard.customer.agency.root);
      } else {
        enqueueSnackbar('Error adding agent', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Error adding agent', { variant: 'error' });
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Agent Information */}
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  p: 2,
                  my: 0.5,
                  borderBottom: '1px solid #e0e0e0',
                  width: 1,
                  gridColumn: {
                    xs: 'span 1',
                    sm: 'span 2',
                    md: 'span 3',
                  },
                }}
              >
                Agent Information
              </Typography>

              <RHFTextField name="Agent_Name" label="Agent Name" />
              <RHFTextField name="Agent_Email" label="Email" />
              <RHFTextField name="Agent_Phone" label="Phone" />

              <RHFTextField name="Agent_Address" label="Address" />
              <RHFTextField name="Credit_Limits" label="Credit Limit" type="number" />
              <RHFTextField name="Year_of_Establishment" label="Year Established" />

              <RHFAutocomplete
                name="Type_of_Business"
                label="Business Type"
                options={businessTypes}
                getOptionLabel={(option) => option.BusinessType_Name}
                isOptionEqualToValue={(option, value) =>
                  option.CustBusinessType_ID === value.CustBusinessType_ID
                }
              />

              <RHFAutocomplete
                name="Payment_Term_ID"
                label="Payment Term"
                options={paymentTerms}
                getOptionLabel={(option) => option.Payment_Term}
                isOptionEqualToValue={(option, value) =>
                  option.Payment_term_ID === value.Payment_term_ID
                }
              />

              <RHFAutocomplete
                name="Agent_CountryID"
                label="Country"
                type="country"
                options={countries}
                getOptionLabel={(option) => option.Country_Name}
                isOptionEqualToValue={(option, value) =>
                  option.Country_ID === value.Country_ID
                }
              />

              <RHFAutocomplete
                name="Agent_CityID"
                label="City"
                options={cities}
                getOptionLabel={(option) => option.City_Name}
                isOptionEqualToValue={(option, value) =>
                  option.City_ID === value.City_ID
                }
                disabled={!values.Agent_CountryID}
              />
            </Box>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  p: 2,
                  my: 0.5,
                  borderBottom: '1px solid #e0e0e0',
                  width: 1,
                  gridColumn: {
                    xs: 'span 1',
                    sm: 'span 2',
                    md: 'span 3',
                  },
                }}
              >
                Contact Information
              </Typography>

              <Box sx={{ gridColumn: { sm: 'span 2', md: 'span 3' } }}>
                <TableContainer component={Paper}>
                  <Scrollbar>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ minWidth: 200 }}>Contact Name</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Contact Number</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Email</TableCell>
                          
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {contacts.map((contact, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <RHFTextField
                                name={`contacts[${index}].Contact_Name`}
                                label="Name"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`contacts[${index}].Contact_Number`}
                                label="Number"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`contacts[${index}].Email_Address`}
                                label="Email"
                              />
                            </TableCell>
                           
                           
                            <TableCell>
                              <IconButton
                                onClick={() => handleDeleteContact(index)}
                                color="error"
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
              </Box>
            </Box>
            {methods.formState.errors.contacts && (
              <Typography color="error" variant="caption">
                {methods.formState.errors.contacts.message}
              </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleAddContact}>
                {contacts.length > 0 ? 'Add Another Contact' : 'Add Contact'}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Submit Button */}
        <Grid xs={12} md={12}>
          <Stack spacing={3} alignItems="flex-end">
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
            >
              Save Changes
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}