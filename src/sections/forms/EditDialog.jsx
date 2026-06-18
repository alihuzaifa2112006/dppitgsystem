// import * as Yup from 'yup';
// import { useCallback, useMemo, useState, useEffect } from 'react';
// import { Controller, useForm, useWatch } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';

// import Box from '@mui/material/Box';
// import Card from '@mui/material/Card';
// import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';
// import Grid from '@mui/material/Unstable_Grid2';
// import Typography from '@mui/material/Typography';
// import LoadingButton from '@mui/lab/LoadingButton';

// import { fData } from 'src/utils/format-number';

// import { useSnackbar } from 'src/components/snackbar';
// import FormProvider, {
//   RHFSwitch,
//   RHFTextField,
//   RHFUploadAvatar,
//   RHFAutocomplete,
//   RHFUpload,
// } from 'src/components/hook-form';
// import { decrypt } from 'src/api/encryption';
// import { UploadBox } from 'src/components/upload';
// import {
//   Checkbox,
//   Chip,
//   IconButton,
//   Link,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
// } from '@mui/material';
// import Iconify from 'src/components/iconify';
// import Scrollbar from 'src/components/scrollbar';
// import { decryptObjectKeys } from 'src/utils/getDecryption';
// import axios from 'axios';
// import { DesktopDatePicker } from '@mui/x-date-pickers';
// import { fDate } from 'src/utils/format-time';
// import { Get, Post } from 'src/api/apibasemethods';
// import { useNavigate } from 'react-router';
// import { paths } from 'src/routes/paths';
// import PropTypes from 'prop-types';
// // ----------------------------------------------------------------------

// function formatDate(dateString) {
//   const date = new Date(dateString);
//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
//   const year = date.getFullYear();

//   return `${month}-${day}-${year}`;
// }

// export default function EditForm({ currentData }) {
//   const { enqueueSnackbar } = useSnackbar();

//   const navigate = useNavigate();

//   const userData = JSON.parse(localStorage.getItem('UserData'));







//   const [contacts, setContacts] = useState([
//     {
//       Contact_Type_ID: null,
//       Contact_Person_Name: '',
//       Contact_Person_Email: '',
//       Contact_Person_Mobile: '',
//       Contact_Person_Job_Title: '',
//       Create_User_ID: userData?.userDetails?.userId || 1,
//       CreatedBy: userData?.userDetails?.userId || 1,
//       Branch_ID: userData?.userDetails?.branchID || 1,
//       Org_ID: userData?.userDetails?.orgId || 1,
//     },
//   ]);

//   // State for Business Percentage by Country
//   const [businessPercentageByCountry, setBusinessPercentageByCountry] = useState([
//     {
//       Business_Country_ID: null,
//       Business_Percentage: null,
//       Brand_Name: '',
//       CreatedBy: userData?.userDetails?.userId || 1,
//       Branch_ID: userData?.userDetails?.branchID || 1,
//       Org_ID: userData?.userDetails?.orgId || 1,
//     },
//   ]);

//   // Add this to your existing state declarations
//   const [bankDetails, setBankDetails] = useState(currentData?.BankDetails || [
//     {
//       Supp_Acc_Bank: '',
//       Supp_Acc_Branch: '',
//       Supp_Acc_Title: '',
//       Supp_Acc_No: '',
//       Supp_Acc_IBAN: '',
//       CreatedBy: userData?.userDetails?.userId || 1,
//       Branch_ID: userData?.userDetails?.branchID || 1,
//       Org_ID: userData?.userDetails?.orgId || 1,
//     },
//   ]);
//   const [Options, setOptions] = useState([
//     {
//       Inventory_Type_ID: '',
//       IsActive: true,
//       CreatedBy: userData?.userDetails?.userId || 1,
//       UpdatedBy: userData?.userDetails?.userId || 1,
//     },
//   ]);
//   const [contactTypes, setContactTypes] = useState([]);

//   const [certificates, setCertificates] = useState([]);
//   const [currentCertificateFile, setCurrentCertificateFile] = useState(null);

//   const defaultValues = useMemo(
//     () => ({
//       Supp_Name: currentData?.Master.Supplier_Name || '',
//       Supp_Abb: currentData?.Master.Short_Name || '',
//       Supp_Address: currentData?.Master.Address || '',

//       Supp_Landline_No: currentData?.Master.Phone || '',
//       Supp_Onboarding_Email: currentData?.Master.Email || 'N/A',


//       Inv_type: [],
//       bankDetails: (currentData?.BankDetails || []).map((item) => ({
//         Supp_Acc_Bank: item.Sup_Bank_Name,
//         Supp_Acc_Branch: item.Sup_Acc_Branch,
//         Supp_Acc_Title: item.Sup_Acc_title,
//         Supp_Acc_No: item.Sup_Acc_No,
//         Supp_Acc_IBAN: item.Sup_Acc_IBAN,
//       })),

//       Branch_ID: userData?.userDetails?.branchID || 1,
//       Org_ID: userData?.userDetails?.orgId || 1,
//     }),
//     [
//       userData?.userDetails?.branchID,
//       userData?.userDetails.orgId,
//       currentData,





//     ]
//   );



//   const CustomerSchema = Yup.object().shape({
//     // Customer Information
//     Supp_Name: Yup.string()
//       .required('Name is required')
//       .min(3, 'Name must be at least 3 characters')
//       .max(100, 'Name must not exceed 100 characters'),
//     Supp_Abb: Yup.string()
//       .required('Short name is required')
//       .max(20, 'Short name must not exceed 20 characters'),
//     Supp_Onboarding_Email: Yup.string()
//       .required('Email is required')
//       .email('Must be a valid email'),
//     Supp_Address: Yup.string().required('Factory Address is required'),

//     Supp_Country_ID: Yup.object().required('Country is required'),

//     Supp_Landline_No: Yup.string()
//       .required('Company Contact No. is required')
//       .matches(/^[0-9]+$/, 'Must be only digits'),
//     // Cust_ZipCode: Yup.string()
//     //   .required('Zip code is required')
//     //   .matches(/^[0-9]+$/, 'Must be only digits'),

//     Inv_type: Yup.array()
//       .min(1, 'Please select at least one type')
//       .required('Type selection is required'),



//     // // Bank Details (array validation)
//     bankDetails: Yup.array().of(
//       Yup.object().shape({
//         Supp_Acc_Bank: Yup.string().required('Bank name is required'),
//         Supp_Acc_Branch: Yup.string().required('Branch name is required'),
//         Supp_Acc_Title: Yup.string().required('Account title is required'),
//         Supp_Acc_No: Yup.string().required('Account number is required'),
//         Supp_Acc_IBAN: Yup.string().required('IBAN is required'),
//       })
//     ),
//   });



//   const [Category, setCategory] = useState([]);
//   const [subCategory, setsubCategory] = useState([]);

//   const GetCategory = useCallback(async () => {
//     const res = await Get(
//       `GetAllinvcategory?branchID=${userData?.userDetails?.branchID}&orgID=${userData?.userDetails?.orgId}`
//     );
//     setCategory(res.data || []);
//   }, [userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

//   const GetSubCategory = useCallback(async () => {
//     const res = await Get(
//       `inventory/subcategory/getall?branchID=${userData?.userDetails?.branchID}&orgID=${userData?.userDetails?.orgId}`
//     );
//     setsubCategory(res.data.Data || []);
//   }, [userData?.userDetails?.branchID, userData?.userDetails?.orgId]);


//   useEffect(() => {
//     const fetchData = async () => {
//       await Promise.all([
//         GetCategory(),
//         GetSubCategory(),
//       ]);

//     };
//     fetchData();
//   }, [GetCategory, GetSubCategory]);

//   // const defaultValues = useMemo(
//   //   () => ({
//   //     Branch_ID: userData?.userDetails?.branchID || 1,
//   //     Org_ID: userData?.userDetails?.orgId || 1,
//   //   }),
//   //   [userData]
//   // );

//   const methods = useForm({
//     resolver: yupResolver(CustomerSchema),
//     defaultValues
//     // defaultValues: {

//     //   Branch_ID: userData?.userDetails?.branchID || 1,
//     //   Org_ID: userData?.userDetails?.orgId || 1,

//     //   bankDetails: [
//     //     {
//     //       Supp_Acc_Bank: '',
//     //       Supp_Acc_Branch: '',
//     //       Supp_Acc_Title: '',
//     //       Supp_Acc_No: '',
//     //       Supp_Acc_IBAN: '',
//     //       CreatedBy: userData?.userDetails?.userId || 1,
//     //       Branch_ID: userData?.userDetails?.branchID || 1,
//     //       Org_ID: userData?.userDetails?.orgId || 1,
//     //     },
//     //   ],
//     //   Options: [
//     //     {
//     //       Inventory_Type_ID: '',
//     //       IsActive: true,
//     //       CreatedBy: userData?.userDetails?.userId || 1,
//     //       UpdatedBy: userData?.userDetails?.userId || 1,
//     //     },
//     //   ],

//     // },
//   });

//   const {
//     setValue,
//     handleSubmit,
//     reset,
//     watch,
//     control,
//     formState: { isSubmitting },
//   } = methods;

//   const values = watch();

//   const selectedAgents = useWatch({ control, name: 'Agent_ID' }); // Get current value
//   const selectedEndCustomer = useWatch({
//     control,
//     name: 'Inv_type',
//   });

//   useEffect(() => {
//     const filteredCities =
//       allCities.filter((city) => city.Country_ID === values?.Supp_Country_ID?.Country_ID) || [];
//     setCities(filteredCities);
//   }, [allCities, values?.Supp_Country_ID?.Country_ID]);

//   useEffect(() => {
//     const filteredCities =
//       allCities.filter((city) => city.Country_ID === values?.Shipping_Country?.Country_ID) || [];
//     setCitiesShipping(filteredCities);
//   }, [allCities, values?.Shipping_Country?.Country_ID]);

//   const handleCheckboxChange = (id) => {
//     setSelectedOptionIds((prevSelected) =>
//       prevSelected.includes(id)
//         ? prevSelected.filter((item) => item !== id)
//         : [...prevSelected, id]
//     );
//   };

//   // Add these handler functions
//   const handleAddBankDetail = () => {
//     const newBankDetail = {
//       Supp_Acc_Bank: '',
//       Supp_Acc_Branch: '',
//       Supp_Acc_Title: '',
//       Supp_Acc_No: '',
//       Supp_Acc_IBAN: '',
//       CreatedBy: userData?.userDetails?.userId || 1,
//       Branch_ID: userData?.userDetails?.branchID || 1,
//       Org_ID: userData?.userDetails?.orgId || 1,
//     };
//     setBankDetails([...bankDetails, newBankDetail]);
//     setValue('bankDetails', [...values.bankDetails, newBankDetail]);
//   };

//   const handleDeleteBankDetail = (index) => {
//     const updatedBankDetails = bankDetails.filter((_, i) => i !== index);
//     setBankDetails(updatedBankDetails);
//     setValue('bankDetails', updatedBankDetails);
//   };

//   const InsertBankDetails = async (bankDetailsArray) => {
//     try {
//       const res = await Post(`MultipleBankUploads`, bankDetailsArray);
//       console.log('Bank Details response', res);
//     } catch (error) {
//       console.error('Error adding Bank Details:', error);
//     }
//   };



//   const onSubmit = handleSubmit(async (data) => {
//     const isEditMode = !!currentData?.Master?.Supplier_ID;

//     const payload = {
//       Master: {
//         Supplier_ID: isEditMode ? currentData?.Master?.Supplier_ID : undefined,
//         Supplier_Name: data.Supp_Name,
//         Short_Name: data.Supp_Abb,
//         Phone: data.Supp_Landline_No,
//         Email: data.Supp_Onboarding_Email,
//         Address: data.Supp_Address,
//         Country_ID: data?.Supp_Country_ID?.Country_ID,
//         isActive: true,
//         isDeleted: false,
//         CreatedBy: userData?.userDetails?.userId || 1,
//         UpdatedBy: userData?.userDetails?.userId || 1,
//         Branch_ID: userData?.userDetails?.branchID || 1,
//         Org_ID: userData?.userDetails?.orgId || 1,
//       },
//       BankDetails: (data?.bankDetails || []).map((bank) => ({
//         Sup_Bank_Name: bank.Supp_Acc_Bank,
//         Sup_Acc_Branch: bank.Supp_Acc_Branch,
//         Sup_Acc_Title: bank.Supp_Acc_Title,
//         Sup_Acc_No: bank.Supp_Acc_No,
//         Sup_Acc_IBAN: bank.Supp_Acc_IBAN,
//         IsActive: true,
//         CreatedBy: userData?.userDetails?.userId || 1,
//         UpdatedBy: userData?.userDetails?.userId || 1,
//         Branch_ID: userData?.userDetails?.branchID || 1,
//         Org_ID: userData?.userDetails?.orgId || 1,
//       })),
//       InventoryTypes: (data?.Inv_type || []).map((inv) => ({
//         Inventory_Type_ID: inv?.SKUTypeId,
//         IsActive: true,
//         CreatedBy: userData?.userDetails?.userId || 1,
//         UpdatedBy: userData?.userDetails?.userId || 1,
//       })),
//     };

//     try {
//       const url = isEditMode ? `UpdateRMSupplier` : `AddRMSuppliers`;

//       await Post(url, payload);

//       enqueueSnackbar(`Supplier ${isEditMode ? 'updated' : 'added'} successfully`, {
//         variant: 'success',
//       });
//     } catch (error) {
//       enqueueSnackbar(`Error ${isEditMode ? 'updating' : 'adding'} supplier`, {
//         variant: 'error',
//       });
//       console.error(`Error ${isEditMode ? 'updating' : 'adding'} supplier`, error);
//     }
//   });

//   useEffect(() => {
//     if (currentData?.Master?.Country_ID && countries?.length > 0) {
//       const matchedCountry = countries.find(
//         (option) => option.Country_ID === currentData?.Master.Country_ID
//       );
//       setValue('Supp_Country_ID', matchedCountry || null);
//     }
//   }, [currentData, countries, setValue]);


//   useEffect(() => {
//     if (currentData?.InventoryTypes && Option.length > 0) {
//       // Find matching SKU types from `Option` based on `currentData.InventoryTypes`
//       const defaultInventoryTypes = currentData.InventoryTypes
//         .map((inventory) =>
//           Option.find((opt) => opt.SKUTypeId === inventory.Inventory_Type_ID)
//         )
//         .filter(Boolean); // Remove undefined entries

//       setValue("Inv_type", defaultInventoryTypes, { shouldValidate: true });
//     }
//   }, [currentData, Option, setValue]);

//   console.log(values, 'default')
//   return (
//     <FormProvider methods={methods} onSubmit={onSubmit}>
//       <Grid container spacing={3}>
//         {/* customer information */}
//         <Grid xs={12} md={12}>
//           <Card sx={{ p: 3 }}>
//             <Box
//               rowGap={3}
//               columnGap={2}
//               display="grid"
//               gridTemplateColumns={{
//                 xs: 'repeat(1, 1fr)',
//                 sm: 'repeat(2, 1fr)',
//                 md: 'repeat(3, 1fr)',
//               }}
//             >
//               <Typography
//                 variant="h6"
//                 sx={{
//                   p: 2,
//                   my: 0.5,
//                   borderBottom: '1px solid #e0e0e0',
//                   width: 1,
//                   gridColumn: {
//                     xs: 'span 1',
//                     sm: 'span 2',
//                     md: 'span 3',
//                   },
//                 }}
//               >
//                 Supplier Information
//               </Typography>
//               <RHFTextField name="form" label="Form Name" />
//               <RHFAutocomplete
//                 name="Category"
//                 label="Category"
//                 placeholder="Choose an option"

//                 options={Category}
//                 getOptionLabel={(option) => option?.Inv_Cat_Name}
//               />
//               <RHFAutocomplete
//                 name="subCategory"
//                 label="Sub Category"
//                 placeholder="Choose an option"

//                 options={subCategory}
//                 getOptionLabel={(option) => option?.SubCat_Name}
//               />
//               <RHFTextField name="desc" label="Description" multiline minRows={3} />
//             </Box>

//           </Card>
//         </Grid>






//         {/* Bank information */}
//         <Grid xs={12} md={12}>
//           <Card sx={{ p: 3 }}>
//             <Box
//               rowGap={3}
//               columnGap={2}
//               display="grid"
//               gridTemplateColumns={{
//                 xs: 'repeat(1, 1fr)',
//                 sm: 'repeat(2, 1fr)',
//                 md: 'repeat(3, 1fr)',
//               }}
//             >
//               <Typography
//                 variant="h6"
//                 sx={{
//                   p: 2,
//                   my: 0.5,
//                   borderBottom: '1px solid #e0e0e0',
//                   width: 1,
//                   gridColumn: {
//                     xs: 'span 1',
//                     sm: 'span 2',
//                     md: 'span 3',
//                   },
//                 }}
//               >
//                 Supplier Financial Information
//               </Typography>



//               <Box sx={{ gridColumn: { sm: 'span 2', md: 'span 3' } }}>
//                 <TableContainer component={Paper}>
//                   <Scrollbar>
//                     <Table>
//                       <TableHead>
//                         <TableRow>
//                           <TableCell sx={{ minWidth: 200 }}>Bank Name</TableCell>
//                           <TableCell sx={{ minWidth: 200 }}>Branch Name</TableCell>
//                           <TableCell sx={{ minWidth: 200 }}>Account Title</TableCell>
//                           <TableCell sx={{ minWidth: 180 }}>Account Number</TableCell>
//                           <TableCell sx={{ minWidth: 180 }}>IBAN</TableCell>
//                           <TableCell>Actions</TableCell>
//                         </TableRow>
//                       </TableHead>
//                       <TableBody>
//                         {bankDetails.map((bank, index) => (
//                           <TableRow key={index}>
//                             <TableCell>
//                               <RHFTextField
//                                 name={`bankDetails[${index}].Supp_Acc_Bank`}
//                                 label="Bank Name"
//                               />
//                             </TableCell>
//                             <TableCell>
//                               <RHFTextField
//                                 name={`bankDetails[${index}].Supp_Acc_Branch`}
//                                 label="Branch Name"
//                               />
//                             </TableCell>
//                             <TableCell>
//                               <RHFTextField
//                                 name={`bankDetails[${index}].Supp_Acc_Title`}
//                                 label="Account Title"
//                               />
//                             </TableCell>
//                             <TableCell>
//                               <RHFTextField
//                                 name={`bankDetails[${index}].Supp_Acc_No`}
//                                 label="Account Number"
//                               />
//                             </TableCell>
//                             <TableCell>
//                               <RHFTextField
//                                 name={`bankDetails[${index}].Supp_Acc_IBAN`}
//                                 label="IBAN"
//                               />
//                             </TableCell>
//                             <TableCell>
//                               <IconButton
//                                 onClick={() => handleDeleteBankDetail(index)}
//                                 color="error"
//                               >
//                                 <Iconify icon="solar:trash-bin-trash-bold" />
//                               </IconButton>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </Scrollbar>
//                 </TableContainer>
//               </Box>
//             </Box>
//             {methods.formState.errors.bankDetails && (
//               <Typography color="error" variant="caption">
//                 {methods.formState.errors.bankDetails.message}
//               </Typography>
//             )}
//             <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
//               <Button variant="contained" color="primary" onClick={handleAddBankDetail}>
//                 {bankDetails.length > 0 ? 'Add Another Bank' : 'Add Bank'}
//               </Button>
//             </Box>
//           </Card>
//         </Grid>
//         {/* submit button */}
//         <Grid xs={12} md={12}>
//           <Stack spacing={3} alignItems="flex-end">
//             <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
//               Save Changes
//             </LoadingButton>
//           </Stack>
//         </Grid>
//       </Grid>
//     </FormProvider>
//   );
// }

// EditForm.propTypes = {
//   currentData: PropTypes.object,
// };
