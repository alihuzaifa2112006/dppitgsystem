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

import { fData } from 'src/utils/format-number';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
  RHFUpload,
} from 'src/components/hook-form';
import { decrypt } from 'src/api/encryption';
import { UploadBox } from 'src/components/upload';
import {
  Checkbox,
  Chip,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { decryptObjectKeys } from 'src/utils/getDecryption';
import axios from 'axios';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { fDate } from 'src/utils/format-time';
import { Get, Post } from 'src/api/apibasemethods';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import PropTypes from 'prop-types';
import { useRouter } from 'src/routes/hooks';
// ----------------------------------------------------------------------

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
}

export default function AccountGeneral({ currentData }) {
  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();
  const router = useRouter();

  const userData = JSON.parse(localStorage.getItem('UserData'));
 
  const [countries, setCountries] = useState([]);
  
  
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [Option, setOption] = useState([]);
 

  const [allCreditLimit, setCreditLimit] = useState([]);



  // Add this to your existing state declarations
  const [bankDetails, setBankDetails] = useState(
    currentData?.BankDetails || [
      {
        Supp_Acc_Bank: '',
        Supp_Acc_Branch: '',
        Supp_Acc_Title: '',
        Supp_Acc_No: '',
        Supp_Acc_IBAN: '',
        CreatedBy: userData?.userDetails?.userId || 1,
        Branch_ID: userData?.userDetails?.branchID || 1,
        Org_ID: userData?.userDetails?.orgId || 1,
      },
    ]
  );
  const [Options, setOptions] = useState([
    {
      Inventory_Type_ID: '',
      IsActive: true,
      CreatedBy: userData?.userDetails?.userId || 1,
      UpdatedBy: userData?.userDetails?.userId || 1,
    },
  ]);
  

  const defaultValues = useMemo(() => {
    const countryValue = currentData?.Master?.Country_ID
      ? countries.find((c) => c.Country_ID === currentData.Master.Country_ID)
      : null;

    return {
      Supp_Name: currentData?.Master.Supplier_Name || '',
      Supp_Abb: currentData?.Master.Short_Name || '',
      Supp_Address: currentData?.Master.Address || '',

      Supp_Landline_No: currentData?.Master.Phone || '',
      Supp_Onboarding_Email: currentData?.Master.Email || 'N/A',
      // Country_ID: countryValue,
      Inv_type:
        currentData?.InventoryTypes?.map((item) =>
          Option.find((opt) => opt.SKUTypeId === item.Inventory_Type_ID)
        ).filter(Boolean) || [],
      bankDetails: (currentData?.BankDetails || []).map((item) => ({
        BankDetail_ID: item?.BankDetail_ID,
        Supp_Acc_Bank: item.Sup_Bank_Name,
        Supp_Acc_Branch: item.Sup_Acc_Branch,
        Supp_Acc_Title: item.Sup_Acc_title,
        Supp_Acc_No: item.Sup_Acc_No,
        Supp_Acc_IBAN: item.Sup_Acc_IBAN,
      })),

      Branch_ID: userData?.userDetails?.branchID || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
    };
  }, [
    userData?.userDetails?.branchID,
    userData?.userDetails.orgId,
    currentData,
    countries,
    Option,
  ]);

  const CustomerSchema = Yup.object().shape({
    // Customer Information
    Supp_Name: Yup.string()
      .required('Name is required')
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name must not exceed 100 characters'),
    Supp_Abb: Yup.string()
      .required('Short name is required')
      .max(20, 'Short name must not exceed 20 characters'),
    Supp_Onboarding_Email: Yup.string()
      .required('Email is required')
      .email('Must be a valid email'),
    Supp_Address: Yup.string().required('Factory Address is required'),

    Country_ID: Yup.object().required('Country is required'),

    Supp_Landline_No: Yup.string()
      .required('Company Contact No. is required')
      .matches(/^[0-9]+$/, 'Must be only digits'),
    // Cust_ZipCode: Yup.string()
    //   .required('Zip code is required')
    //   .matches(/^[0-9]+$/, 'Must be only digits'),

    Inv_type: Yup.array()
      .min(1, 'Please select at least one type')
      .required('Type selection is required'),

    // // Bank Details (array validation)
    bankDetails: Yup.array().of(
      Yup.object().shape({
        Supp_Acc_Bank: Yup.string().required('Bank name is required'),
        Supp_Acc_Branch: Yup.string().required('Branch name is required'),
        Supp_Acc_Title: Yup.string().required('Account title is required'),
        Supp_Acc_No: Yup.string().required('Account number is required'),
        Supp_Acc_IBAN: Yup.string().required('IBAN is required'),
      })
    ),
  });
 const GetCountries = useCallback(async () => {
    const res = await Get('getallcountries');
    setCountries(res?.data.Data || []);
  }, []);


 

  const ApiGetOptions = useCallback(async () => {
    try {
      const response = await Get(
        `getskutypes?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const options = response?.data?.Data.map((item) => ({
        label: item.SKUTypeName,
        value: item.SKUTypeId,
      }));
      setOption(response?.data?.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

 

  useEffect(() => {
    const fetch = async () => {
      Promise.all([
      
        GetCountries(),
     

        ApiGetOptions(),
      
      ]);
    };
    fetch();
  }, [ GetCountries, ApiGetOptions]);

  // const defaultValues = useMemo(
  //   () => ({
  //     Branch_ID: userData?.userDetails?.branchID || 1,
  //     Org_ID: userData?.userDetails?.orgId || 1,
  //   }),
  //   [userData]
  // );

  const methods = useForm({
    resolver: yupResolver(CustomerSchema),
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

  const selectedAgents = useWatch({ control, name: 'Agent_ID' }); // Get current value
  const selectedEndCustomer = useWatch({
    control,
    name: 'Inv_type',
  });

  // useEffect(() => {
  //   const filteredCities =
  //     allCities.filter((city) => city.Country_ID === values?.Country_ID?.Country_ID) || [];
  //   setCities(filteredCities);
  // }, [allCities, values?.Country_ID?.Country_ID]);

  // useEffect(() => {
  //   const filteredCities =
  //     allCities.filter((city) => city.Country_ID === values?.Shipping_Country?.Country_ID) || [];
  //   setCitiesShipping(filteredCities);
  // }, [allCities, values?.Shipping_Country?.Country_ID]);

  useEffect(() => {
    if (currentData?.InventoryTypes && Option.length > 0) {
      const initialInventoryTypes = currentData.InventoryTypes.map((item) =>
        Option.find((opt) => opt.SKUTypeId === item.Inventory_Type_ID)
      ).filter(Boolean);
      setValue('Inv_type', initialInventoryTypes);
    }
  }, [currentData?.InventoryTypes, Option, setValue]);

  const handleCheckboxChange = (id) => {
    setSelectedOptionIds((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((item) => item !== id) : [...prevSelected, id]
    );
  };

  // Add these handler functions
  const handleAddBankDetail = () => {
    const newBankDetail = {
      Supp_Acc_Bank: '',
      Supp_Acc_Branch: '',
      Supp_Acc_Title: '',
      Supp_Acc_No: '',
      Supp_Acc_IBAN: '',
      CreatedBy: userData?.userDetails?.userId || 1,
      Branch_ID: userData?.userDetails?.branchID || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
    };
    setBankDetails([...bankDetails, newBankDetail]);
    setValue('bankDetails', [...values.bankDetails, newBankDetail]);
  };

  const handleDeleteBankDetail = (index) => {
    const updatedBankDetails = bankDetails.filter((_, i) => i !== index);
    setBankDetails(updatedBankDetails);
    setValue('bankDetails', updatedBankDetails);
  };

  const InsertBankDetails = async (bankDetailsArray) => {
    try {
      const res = await Post(`MultipleBankUploads`, bankDetailsArray);
      console.log('Bank Details response', res);
    } catch (error) {
      console.error('Error adding Bank Details:', error);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const isEditMode = !!currentData?.Master?.Supplier_ID;

    const payload = {
      Master: {
        Supplier_ID: isEditMode ? currentData?.Master?.Supplier_ID : undefined,
        Supplier_Name: data.Supp_Name,
        Short_Name: data.Supp_Abb,
        Phone: data.Supp_Landline_No,
        Email: data.Supp_Onboarding_Email,
        Address: data.Supp_Address,
        Country_ID: data?.Country_ID?.Country_ID,
        isActive: true,
        isDeleted: false,
        CreatedBy: userData?.userDetails?.userId || 1,
        UpdatedBy: userData?.userDetails?.userId || 1,
        Branch_ID: userData?.userDetails?.branchID || 1,
        Org_ID: userData?.userDetails?.orgId || 1,
      },
      BankDetails: (data?.bankDetails || []).map((bank) => ({
        BankDetail_ID: bank?.BankDetail_ID,
        Sup_Bank_Name: bank.Supp_Acc_Bank,
        Sup_Acc_Branch: bank.Supp_Acc_Branch,
        Sup_Acc_Title: bank.Supp_Acc_Title,
        Sup_Acc_No: bank.Supp_Acc_No,
        Sup_Acc_IBAN: bank.Supp_Acc_IBAN,
        IsActive: true,
        CreatedBy: userData?.userDetails?.userId || 1,
        UpdatedBy: userData?.userDetails?.userId || 1,
        Branch_ID: userData?.userDetails?.branchID || 1,
        Org_ID: userData?.userDetails?.orgId || 1,
      })),
      InventoryTypes: (data?.Inv_type || []).map((inv) => ({
        Inventory_Type_ID: inv?.SKUTypeId,
        IsActive: true,
        CreatedBy: userData?.userDetails?.userId || 1,
        UpdatedBy: userData?.userDetails?.userId || 1,
      })),
    };

    try {
      const url = isEditMode ? `UpdateRMSupplier` : `AddRMSuppliers`;

      await Post(url, payload);

      enqueueSnackbar(`Supplier ${isEditMode ? 'updated' : 'added'} successfully`, {
        variant: 'success',
      });
      router.push(paths.dashboard.admin.SupplierProfile.root);
    } catch (error) {
      enqueueSnackbar(`Error ${isEditMode ? 'updating' : 'adding'} supplier`, {
        variant: 'error',
      });
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} supplier`, error);
    }
  });

  useEffect(() => {
    if (currentData?.Master?.Country_ID && countries?.length > 0) {
      const matchedCountry = countries.find(
        (option) => option.Country_ID === currentData?.Master.Country_ID
      );
      setValue('Country_ID', matchedCountry || null);
    }
  }, [currentData, countries, setValue]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* customer information */}
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
                Supplier Information
              </Typography>
              <RHFTextField
                name="Supp_Name"
                label="Supplier Name"
                inputProps={{ maxLength: 100 }}
              />
              <RHFTextField name="Supp_Abb" label="Short Name" />
              <RHFTextField name="Supp_Onboarding_Email" label="Email Address" />

              <RHFTextField name="Supp_Address" label="Supplier Address" />

              <RHFAutocomplete
                name="Country_ID"
                label="Country"
                type="country"
                placeholder="Choose an option"
                fullWidth
                options={countries}
                getOptionLabel={(option) => option?.Country_Name || ''}
                isOptionEqualToValue={(option, value) =>
                  !!option && !!value && option.Country_ID === value.Country_ID
                }
                value={watch('Country_ID') || null} // Ensures controlled behavior
                onChange={(_, newValue) => setValue('Country_ID', newValue)}
              />

              <RHFTextField name="Supp_Landline_No" label="Supplier Contact No." />
              <RHFAutocomplete
                name="Inv_type"
                label="Inventory type"
                fullWidth
                multiple
                limitTags={2}
                options={Option}
                getOptionLabel={(option) => option?.SKUTypeName}
                isOptionEqualToValue={(option, value) => option.SKUTypeId === value.SKUTypeId}
                renderOption={(props, option) => {
                  const isChecked = values.Inv_type?.some(
                    (selected) => selected.SKUTypeId === option.SKUTypeId
                  );
                  return (
                    <li {...props} key={option.SKUTypeId}>
                      <Checkbox size="small" disableRipple checked={isChecked} />
                      {option.SKUTypeName}
                    </li>
                  );
                }}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.SKUTypeId}
                      label={option.SKUTypeName}
                      size="small"
                      variant="soft"
                      color="primary"
                    />
                  ))
                }
              />
            </Box>
          </Card>
        </Grid>

        {/* Bank information */}
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
                Supplier Financial Information
              </Typography>

              <Box sx={{ gridColumn: { sm: 'span 2', md: 'span 3' } }}>
                <TableContainer component={Paper}>
                  <Scrollbar>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ minWidth: 200 }}>Bank Name</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Branch Name</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Account Title</TableCell>
                          <TableCell sx={{ minWidth: 180 }}>Account Number</TableCell>
                          <TableCell sx={{ minWidth: 180 }}>IBAN</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bankDetails.map((bank, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <RHFTextField
                                name={`bankDetails[${index}].Supp_Acc_Bank`}
                                label="Bank Name"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`bankDetails[${index}].Supp_Acc_Branch`}
                                label="Branch Name"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`bankDetails[${index}].Supp_Acc_Title`}
                                label="Account Title"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`bankDetails[${index}].Supp_Acc_No`}
                                label="Account Number"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`bankDetails[${index}].Supp_Acc_IBAN`}
                                label="IBAN"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => handleDeleteBankDetail(index)}
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
            {methods.formState.errors.bankDetails && (
              <Typography color="error" variant="caption">
                {methods.formState.errors.bankDetails.message}
              </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleAddBankDetail}>
                {bankDetails.length > 0 ? 'Add Another Bank' : 'Add Bank'}
              </Button>
            </Box>
          </Card>
        </Grid>
        {/* submit button */}
        <Grid xs={12} md={12}>
          <Stack spacing={3} alignItems="flex-end">
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              Save Changes
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

AccountGeneral.propTypes = {
  currentData: PropTypes.object,
};
