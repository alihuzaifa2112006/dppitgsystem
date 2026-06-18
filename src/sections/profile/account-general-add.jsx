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
import { Get, Post, Delete } from 'src/api/apibasemethods';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
// ----------------------------------------------------------------------

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
}

export default function AccountGeneralAdd() {
  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem('UserData'));
  const [currencies, setCurrencies] = useState([]);
  const [CAPUNIT, setCAPUNIT] = useState([]);
  const [countries, setCountries] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [cities, setCities] = useState([]);
  const [citiesShipping, setCitiesShipping] = useState([]);
  const [BusinessLicenseNumberFile, setBusinessLicenseNumberFile] = useState(null);
  const [BusinessLogoByID, setBusinessLogoByID] = useState([]);
  const [activeAgents, setActiveAgents] = useState([]);
  const [allPaymentTerms, setAllPaymentTerms] = useState([]);
  const [allTypes, setAllTypes] = useState([]);

  const [noOfEmp, setNoOfEmp] = useState([]);
  const [businessPercentage, setBusinessPercentage] = useState([]);
  const [yearsInBusiness, setYearsInBusiness] = useState([]);
  const [businessType, setBusinessType] = useState([]);
  const [businessEndType, setBusinessEndType] = useState([]);
  const [allEndCustomers, setAllEndCustomers] = useState([]);
  const [allFPF, setAllFPF] = useState([]);
  const [allCreditLimit, setCreditLimit] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [currencyList, setCurrencyList] = useState([]);

  const [contacts, setContacts] = useState([
    {
      Contact_Type_ID: null,
      Contact_Person_Name: '',
      Contact_Person_Email: '',
      Contact_Person_Mobile: '',
      Contact_Person_Job_Title: '',
      Create_User_ID: userData?.userDetails?.userId || 1,
      CreatedBy: userData?.userDetails?.userId || 1,
      Branch_ID: userData?.userDetails?.branchID || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
    },
  ]);

  // State for Business Percentage by Country
  const [businessPercentageByCountry, setBusinessPercentageByCountry] = useState([
    {
      Business_Country_ID: null,
      Business_Percentage: null,
      Brand_Name: '',
      CreatedBy: userData?.userDetails?.userId || 1,
      Branch_ID: userData?.userDetails?.branchID || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
    },
  ]);

  // State for Company Branch
  const [companyBranches, setCompanyBranches] = useState([
    {
      BranchName: '',
      Address: '',
      Phone_No: '',
      CreatedBy: userData?.userDetails?.userId || 1,
      Branch_ID: userData?.userDetails?.branchID || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
    },
  ]);

  // Add this to your existing state declarations
  const [bankDetails, setBankDetails] = useState([
    {
      Cust_Acc_Bank: '',
      Cust_Acc_Branch: '',
      Cust_Acc_Title: '',
      Cust_Acc_No: '',
      Cust_Acc_IBAN: '',
      CreatedBy: userData?.userDetails?.userId || 1,
      Branch_ID: userData?.userDetails?.branchID || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
    },
  ]);

  const [contactTypes, setContactTypes] = useState([]);

  // State for consignees (Walk-In Customer)
  const [consignees, setConsignees] = useState([
    {
      CONName: '',
      CONAddress: '',
      CONContactNo: '',
      CONEmail: '',
    },
  ]);

  // State for notify parties (Walk-In Customer)
  const [notifyParties, setNotifyParties] = useState([
    {
      NPName: '',
      NPAddress: '',
      NPContactNo: '',
      NPEmail: '',
    },
  ]);

  const [certificates, setCertificates] = useState([]);
  const [currentCertificateFile, setCurrentCertificateFile] = useState(null);

  const CustomerSchema = Yup.object().shape({
    // Customer Information
    Cust_Name: Yup.string()
      .required('Name is required')
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name must not exceed 100 characters'),
    Cust_Abb: Yup.string()
      .required('Short name is required')
      .max(20, 'Short name must not exceed 20 characters'),
    Cust_Onboarding_Email: Yup.string()
      .required('Email is required')
      .email('Must be a valid email'),
    Cust_Address1: Yup.string().required('Factory Address is required'),
    Cust_Address2: Yup.string(),
    Cust_Country_ID: Yup.object().required('Country is required'),
    Cust_City_ID: Yup.object().required('City is required'),
    Cust_Landline_No: Yup.string()
      .required('Company Contact No. is required')
      .matches(/^[0-9]+$/, 'Must be only digits'),
    // Cust_ZipCode: Yup.string()
    //   .required('Zip code is required')
    //   .matches(/^[0-9]+$/, 'Must be only digits'),
    Cust_URL: Yup.string().required('URL is required'),
    Agent_ID: Yup.array()
      .min(1, 'Please select at least one agent')
      .required('Agents selection is required'),
    End_Customer_Name_ID: Yup.array()
      .min(1, 'Please select at least one buyer')
      .required('Buyers selection is required'),

    // Business Details
    Capacity_per_Month: Yup.number()
      .required('Production Capacity is required')
      .positive('Must be positive'),
    Cust_Prod_Cap_Unit_ID: Yup.object().required('Unit is required'),
    Cust_TurnoverPY: Yup.number().required('Turnover is required').positive('Must be positive'),
    Cust_Turnover_CurrencyID: Yup.object().required('Currency is required'),
    Business_License_No: Yup.string().required('License number is required'),
    IRC: Yup.string(),
    BIN: Yup.string(),
    TIN: Yup.string(),
    // .matches(/^[0-9]+$/, 'Must be digits')
    // .min(8, 'Must be at least 8 digits'),
    // .max(15, 'Cannot exceed 15 digits'),

    // .matches(/^[0-9]+$/, 'Must be digits')
    // .min(6, 'Must be at least 6 digits'),
    Remarks: Yup.string().required('Remarks are required'),

    // Business Numbers
    No_Of_Employees_ID: Yup.object().required('Employee count is required'),
    No_Of_Mach_ID: Yup.object().required('No. Of Machine is required'),
    Fabric_Facility_ID: Yup.object().required('Fabric Processing Facility is required'),
    Per_of_Bus_In_Europe: Yup.object().required('% of Business in Europe is required'),
    Years_In_Bus_ID: Yup.object().required('Years in Business is required'),
    Per_Of_Bus_In_USA: Yup.object().required('% of Business in USA is required'),

    businessPercentageByCountry: Yup.array().of(
      Yup.object().shape({
        Business_Country_ID: Yup.object().required('Country is required'),
        // must be between 0 and 100
        Business_Percentage: Yup.number()
          .required('Percentage is required')
          .positive('Must be positive')
          .max(100, 'Must be less than or equal to 100'),
        Brand_Name: Yup.string().required('Brand name is required'),
      })
    ),

    // Contacts (array validation)
    contacts: Yup.array().of(
      Yup.object().shape({
        Contact_Type_ID: Yup.object().required('Contact type is required'),
        Contact_Person_Name: Yup.string().required('Name is required'),
        Contact_Person_Email: Yup.string()
          .required('Email is required')
          .email('Must be a valid email'),
        Contact_Person_Mobile: Yup.string()
          .required('Mobile is required')
          .matches(/^[0-9]+$/, 'Must be only digits'),
        Contact_Person_Job_Title: Yup.string().required('Job title is required'),
      })
    ),

    // Company Branch (array validation)
    // companyBranches: Yup.array().of(
    //   Yup.object().shape({
    //     BranchName: Yup.string(),
    //     Address: Yup.string(),
    //     Phone_No: Yup.string()
    //     // .matches(/^[0-9]+$/, 'Must be only digits'),
    //   })
    // ),

    // // Bank Details (array validation)
    bankDetails: Yup.array().of(
      Yup.object().shape({
        Cust_Acc_Bank: Yup.string().required('Bank name is required'),
        Cust_Acc_Branch: Yup.string().required('Branch name is required'),
        Cust_Acc_Title: Yup.string().required('Account title is required'),
        Cust_Acc_No: Yup.string().required('Account number is required'),
        Cust_Acc_IBAN: Yup.string().required('IBAN is required'),
      })
    ),

    // Consignees (optional, for Walk-In Customer)
    consignees: Yup.array()
      .of(
        Yup.object().shape({
          CONName: Yup.string(),
          CONAddress: Yup.string(),
          CONContactNo: Yup.string(),
          CONEmail: Yup.string().email('Must be a valid email'),
        })
      )
      .optional(),

    // Notify Parties (optional, for Walk-In Customer)
    notifyParties: Yup.array()
      .of(
        Yup.object().shape({
          NPName: Yup.string(),
          NPAddress: Yup.string(),
          NPContactNo: Yup.string(),
          NPEmail: Yup.string().email('Must be a valid email'),
        })
      )
      .optional(),
  });

  const GetCountries = useCallback(async () => {
    const res = await Get('getallcountries');
    setCountries(res?.data.Data || []);
  }, []);

  const GetCities = useCallback(async () => {
    const res = await Get('city/active');
    setAllCities(res.data?.Data || []);
  }, []);

  const GetCurrencies = useCallback(async () => {
    const res = await Get('getActiveCurrencies');
    setCurrencies(res.data || []);
  }, []);

  const GetAllActiveCAPUNIT = useCallback(async () => {
    const res = await Get(
      `getCapacityUnits?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
    );
    setCAPUNIT(res.data?.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetActiveAgents = useCallback(async () => {
    const res = await Get(
      `getAllActiveAgents?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
    );
    setActiveAgents(res.data?.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetBusinessPercentage = useCallback(async () => {
    const res = await Get(
      `GetPercOfBusinessnEurope?branchID=${userData?.userDetails?.branchID}&orgID=${userData?.userDetails?.orgId}`
    );
    setBusinessPercentage(res.data?.Data || []);
  }, [userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

  const GetTotalNOE = useCallback(async () => {
    const res = await Get(
      `GetTotalNOE?branchID=${userData?.userDetails?.branchID}&orgID=${userData?.userDetails?.orgId}`
    );
    setNoOfEmp(res.data?.Data || []);
  }, [userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

  const GetYearsInBusiness = useCallback(async () => {
    const res = await Get(
      `GetAllCustomerYearinBusiness?branchID=${userData?.userDetails?.branchID}&orgID=${userData?.userDetails?.orgId}`
    );
    setYearsInBusiness(res.data?.Data || []);
  }, [userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

  const GetBusinessType = useCallback(async () => {
    const res = await Get('APIGetCustBusinessType/GetAllCustBussinessType');
    setBusinessType(res.data?.Data || []);
  }, []);

  const GetBusinessEndType = useCallback(async () => {
    const res = await Get('ApiGetEndCustBuinessType');
    setBusinessEndType(res.data?.Data || []);
  }, []);

  const GetAllContact = useCallback(async () => {
    const res = await Get(
      `GetAllActiveContactType?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setContactTypes(res.data?.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetAllDocumentTypes = useCallback(async () => {
    const res = await Get(
      `DocumentTypes?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setDocumentTypes(res.data?.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetAllEndCustomer = useCallback(async () => {
    const res = await Get(
      `getAllendcustomer?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setAllEndCustomers(res.data?.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetFPF = useCallback(async () => {
    const res = await Get(
      `GetFPF?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setAllFPF(res.data.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const getCreditLimit = useCallback(async () => {
    const res = await Get(
      `getCreditLimit?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setCreditLimit(res.data.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetActiveCurrencies = useCallback(async () => {
    try {
      const response = await Get(`getActiveCurrencies`);
      setCurrencyList(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const GetAllPaymentTerms = useCallback(async () => {
    try {
      const response = await Get(
        `getPaymentTermList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setAllPaymentTerms(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetTypeList = useCallback(async () => {
    try {
      const response = await Get(
        `getActiveyarntype?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllTypes(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetch = async () => {
      Promise.all([
        GetCities(),
        GetCountries(),
        GetCurrencies(),
        GetAllActiveCAPUNIT(),
        GetActiveAgents(),
        GetAllContact(),
        GetAllPaymentTerms(),
        APIGetTypeList(),

        GetTotalNOE(),
        GetBusinessPercentage(),
        GetYearsInBusiness(),
        GetBusinessType(),
        // GetBusinessEndType(),
        GetAllEndCustomer(),
        GetFPF(),
        getCreditLimit(),

        GetAllDocumentTypes(),

        GetActiveCurrencies(),
      ]);
    };
    fetch();
  }, [
    GetCities,
    GetCountries,
    GetCurrencies,
    GetAllActiveCAPUNIT,
    GetActiveAgents,
    GetAllContact,
    GetAllPaymentTerms,
    APIGetTypeList,

    GetTotalNOE,
    GetBusinessPercentage,
    GetYearsInBusiness,
    GetBusinessType,
    // GetBusinessEndType,
    GetAllEndCustomer,
    GetFPF,
    getCreditLimit,

    GetAllDocumentTypes,
    GetActiveCurrencies,
  ]);

  const PostCustBusinessType = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Business Type', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (
      businessType.find(
        (option) => option?.BusinessType_Name?.trim()?.toLowerCase() === newOptionTrimmed
      )
    ) {
      enqueueSnackbar('This Business Type already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        BusinessType_Name: newOption,
        Description: 'N/A',
        isActive: true,
        CreatedBy: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddBusinessType', dataToSend);
      GetBusinessType();
      enqueueSnackbar('Business Type Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const defaultValues = useMemo(
    () => ({
      Branch_ID: userData?.userDetails?.branchID || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
    }),
    [userData]
  );

  const methods = useForm({
    resolver: yupResolver(CustomerSchema),
    defaultValues: {
      Branch_ID: userData?.userDetails?.branchID || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
      contacts: [
        {
          Contact_Type_ID: null,
          Contact_Person_Name: '',
          Contact_Person_Email: '',
          Contact_Person_Mobile: '',
          Contact_Person_Job_Title: '',
          Create_User_ID: userData?.userDetails?.userId || 1,
          CreatedBy: userData?.userDetails?.userId || 1,
          Branch_ID: userData?.userDetails?.branchID || 1,
          Org_ID: userData?.userDetails?.orgId || 1,
        },
      ],
      bankDetails: [
        {
          Cust_Acc_Bank: '',
          Cust_Acc_Branch: '',
          Cust_Acc_Title: '',
          Cust_Acc_No: '',
          Cust_Acc_IBAN: '',
          CreatedBy: userData?.userDetails?.userId || 1,
          Branch_ID: userData?.userDetails?.branchID || 1,
          Org_ID: userData?.userDetails?.orgId || 1,
        },
      ],
      businessPercentageByCountry: [
        {
          Business_Country_ID: null,
          Business_Percentage: null,
          Brand_Name: '',
          CreatedBy: userData?.userDetails?.userId || 1,
          Branch_ID: userData?.userDetails?.branchID || 1,
          Org_ID: userData?.userDetails?.orgId || 1,
        },
      ],
      companyBranches: [
        {
          BranchName: '',
          Address: '',
          Phone_No: '',
          CreatedBy: userData?.userDetails?.userId || 1,
          Branch_ID: userData?.userDetails?.branchID || 1,
          Org_ID: userData?.userDetails?.orgId || 1,
        },
      ],
      consignees: [
        {
          CONName: '',
          CONAddress: '',
          CONContactNo: '',
          CONEmail: '',
        },
      ],
      notifyParties: [
        {
          NPName: '',
          NPAddress: '',
          NPContactNo: '',
          NPEmail: '',
        },
      ],
    },
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
    name: 'End_Customer_Name_ID',
  });

  useEffect(() => {
    const filteredCities =
      allCities.filter((city) => city.Country_ID === values?.Cust_Country_ID?.Country_ID) || [];
    setCities(filteredCities);
  }, [allCities, values?.Cust_Country_ID?.Country_ID]);

  useEffect(() => {
    const filteredCities =
      allCities.filter((city) => city.Country_ID === values?.Shipping_Country?.Country_ID) || [];
    setCitiesShipping(filteredCities);
  }, [allCities, values?.Shipping_Country?.Country_ID]);

  const handleBusinessFile = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setBusinessLicenseNumberFile(file); // Store the uploaded file in state
    setValue('Business_License_File', file); // Update the file value in the form
  };
  const DeleteBusinessLogoByID = async (id) => {
    try {
      // const response = await Delete(`DeleteBusinessLogoByVenderID?VenderID=${id}`);
      // if (response.data.ResponseCode === '100') {
      //   enqueueSnackbar('Business Logo deleted successfully', { variant: 'success' });
      //   setBusinessLicenseNumberFile(null);
      //   setBusinessLogoByID([]);
      // } else {
      //   enqueueSnackbar('Business Logo deleted successfully', { variant: 'error' });
      // }
    } catch (error) {
      console.error('Error deleting Business Logo:', error);
    }
  };

  const PostPaymentterms = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Payment Term', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (
      allPaymentTerms.find(
        (option) => option.Payment_Term.trim().toLowerCase() === newOptionTrimmed
      )
    ) {
      enqueueSnackbar('This Payment Term already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        Payment_term: newOption,
        isActive: true,
        CreatedBy: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddPaymentTerm', dataToSend);
      GetAllPaymentTerms();
      enqueueSnackbar('Payment Term Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const handleAddContact = () => {
    const newContact = {
      Contact_Type_ID: null,
      Contact_Person_Name: '',
      Contact_Person_Email: '',
      Contact_Person_Mobile: '',
      Contact_Person_Job_Title: '',
      Create_User_ID: userData?.userDetails?.userId || 1,
      CreatedBy: userData?.userDetails?.userId || 1,
      Branch_ID: userData?.userDetails?.branchID || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
    };
    setContacts([...contacts, newContact]);
    setValue('contacts', [...values.contacts, newContact]);
  };
  // Handle contact deletion
  const handleContactDelete = async (index) => {
    const contactToDelete = contacts[index];
    if (contactToDelete?.CustomerDetailID) {
      try {
        // const response = await Delete(
        //   `DeleteCustomerDetail?CustomerDetailID=${contactToDelete.CustomerDetailID}`
        // );
        // if (response.data.ResponseCode === '100') {
        const updatedContacts = contacts.filter((_, i) => i !== index);
        setContacts(updatedContacts);
        setValue('contacts', updatedContacts);
        //   enqueueSnackbar('Contact deleted successfully', { variant: 'success' });
        // } else {
        //   enqueueSnackbar('Failed to delete contact', { variant: 'error' });
        // }
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    } else {
      const updatedContacts = contacts.filter((_, i) => i !== index);
      setContacts(updatedContacts);
      setValue('contacts', updatedContacts);
    }
  };

  const handleAddCompanyBranch = () => {
    const newBranch = {
      BranchName: '',
      Address: '',
      Phone_No: '',
      CreatedBy: userData?.userDetails?.userId || 1,
      Branch_ID: userData?.userDetails?.branchID || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
    };
    setCompanyBranches([...companyBranches, newBranch]);
    setValue('companyBranches', [...values.companyBranches, newBranch]);
  };

  const handleDeleteCompanyBranch = (index) => {
    const updatedBranches = companyBranches.filter((_, i) => i !== index);
    setCompanyBranches(updatedBranches);
    setValue('companyBranches', updatedBranches);
  };


  const handleAddBusinessPercentageByCountry = () => {
    const newItem = {
      Business_Country_ID: null,
      Business_Percentage: null,
      Brand_Name: '',
      CreatedBy: userData?.userDetails?.userId || 1,
      Branch_ID: userData?.userDetails?.branchID || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
    };

    setBusinessPercentageByCountry((prev) => [...prev, newItem]);
    setValue('businessPercentageByCountry', [...values.businessPercentageByCountry, newItem]);
  };
  // Handle delete business percentage by country
  const handleDeleteBusinessPercentageByCountry = (index) => {
    const updatedBusinessPercentageByCountry = businessPercentageByCountry.filter(
      (_, i) => i !== index
    );
    setBusinessPercentageByCountry(updatedBusinessPercentageByCountry);
    setValue('businessPercentageByCountry', updatedBusinessPercentageByCountry);
  };

  // Add these handler functions
  const handleAddBankDetail = () => {
    const newBankDetail = {
      Cust_Acc_Bank: '',
      Cust_Acc_Branch: '',
      Cust_Acc_Title: '',
      Cust_Acc_No: '',
      Cust_Acc_IBAN: '',
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

  // Consignees (Walk-In Customer)
  const handleAddConsignee = () => {
    const newConsignee = {
      CONName: '',
      CONAddress: '',
      CONContactNo: '',
      CONEmail: '',
    };
    setConsignees([...consignees, newConsignee]);
    setValue('consignees', [...(values.consignees || []), newConsignee]);
  };

  const handleDeleteConsignee = (index) => {
    const updatedConsignees = consignees.filter((_, i) => i !== index);
    setConsignees(updatedConsignees);
    setValue('consignees', updatedConsignees);
  };

  // Notify Parties (Walk-In Customer)
  const handleAddNotifyParty = () => {
    const newNotifyParty = {
      NPName: '',
      NPAddress: '',
      NPContactNo: '',
      NPEmail: '',
    };
    setNotifyParties([...notifyParties, newNotifyParty]);
    setValue('notifyParties', [...(values.notifyParties || []), newNotifyParty]);
  };

  const handleDeleteNotifyParty = (index) => {
    const updatedNotifyParties = notifyParties.filter((_, i) => i !== index);
    setNotifyParties(updatedNotifyParties);
    setValue('notifyParties', updatedNotifyParties);
  };

  // Handle file upload
  const handleCertficateFileUpload = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setCurrentCertificateFile(file);
      setValue(`certificates.${values.certificates.length}.CertificateFile`, file, {
        shouldValidate: true,
      });
    }
  };

  // Handle delete certificate
  const handleDeleteCertificate = (index) => {
    setCertificates((prevCertificates) => prevCertificates.filter((_, i) => i !== index));
    setValue(
      'certificates',
      values.certificates.filter((_, i) => i !== index)
    );
  };

  const filteredDocumentTypes = useMemo(() => {
    const usedDocumentTypeIds = certificates.map(
      (cert) => cert?.CertificatePatentType?.Document_Type_ID
    );

    const selectedTypeId = values?.certificateData?.CertificatePatentType?.Document_Type_ID;

    if (selectedTypeId) {
      usedDocumentTypeIds.push(selectedTypeId);
    }

    return documentTypes.filter((type) => !usedDocumentTypeIds.includes(type.Document_Type_ID));
  }, [documentTypes, certificates, values?.certificateData?.CertificatePatentType]);

  // Handle add certificate
  const handleAddCertificate = () => {
    if (!values?.certificateData?.CertificatePatentType) {
      enqueueSnackbar('Please select Certificate Patent Type', { variant: 'error' });
      return;
    }
    if (!values?.certificateData?.CertificatePatentNumber) {
      enqueueSnackbar('Please enter Certificate Patent Number', { variant: 'error' });
      return;
    }
    if (!values?.certificateData?.IssuingAuthority) {
      enqueueSnackbar('Please enter Issuing Authority', { variant: 'error' });
      return;
    }

    if (!values?.certificateData?.IssueDate) {
      enqueueSnackbar('Please enter Issue Date', { variant: 'error' });
      return;
    }
    if (!values?.certificateData?.ExpiryDate) {
      enqueueSnackbar('Please enter Expiry Date', { variant: 'error' });
      return;
    }
    if (values?.certificateData?.ExpiryDate < values?.certificateData?.IssueDate) {
      enqueueSnackbar('Expiry Date should be greater than Issue Date', { variant: 'error' });
      return;
    }
    if (!currentCertificateFile) {
      enqueueSnackbar('Please upload certificate file', { variant: 'error' });
      return;
    }

    const newCertificate = {
      Document_Type_ID: values?.certificateData?.CertificatePatentType,
      CertificatePatentType: values?.certificateData?.CertificatePatentType,
      CertificatePatentNumber: values?.certificateData?.CertificatePatentNumber,
      IssuingAuthority: values?.certificateData?.IssuingAuthority,
      Description: values?.certificateData?.Description,
      IssueDate: values?.certificateData?.IssueDate,
      ExpiryDate: values?.certificateData?.ExpiryDate,
      CertificateFile: currentCertificateFile || null,
      CreatedBy: userData?.userDetails?.userId || 1,
      Is_Active: true,
      Branch_ID: userData?.userDetails?.branchID || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
    };
    setCertificates((prevCertificates) => [...prevCertificates, newCertificate]);
    setValue('certificateData.CertificatePatentNumber', '');
    setValue('certificateData.CertificatePatentType', null);
    setValue('certificateData.Description', '');
    setValue('certificateData.ExpiryDate', null);
    setValue('certificateData.IssueDate', null);
    setValue('certificateData.IssuingAuthority', '');
    setCurrentCertificateFile(null); // Reset file input
  };

  const InsertCustomerContacts = async (customerContactDataArray) => {
    console.log('customerContactDataArray', customerContactDataArray);
    try {
      const res = await Post(`AddCustomerContact`, customerContactDataArray);
      console.log('Contact response', res);
    } catch (error) {
      console.error('Error adding Customer Contacts:', error);
    }
  };

  const InsertBusinessPercentageByCountry = async (businessPercentageByCountryArray) => {
    console.log('businessPercentageByCountryArray', businessPercentageByCountryArray);
    try {
      const res = await Post(`InsertMultipleBusiness`, businessPercentageByCountryArray);
      console.log('Business Percentage by Country response', res);
    } catch (error) {
      console.error('Error adding Business Percentage by Country:', error);
    }
  };

  const InsertBussinessNumbers = async (bussinessNumbersData) => {
    console.log('bussinessNumbersData', bussinessNumbersData);
    try {
      const res = await Post(`createBusinessNo`, bussinessNumbersData);
      console.log('Business Numbers response', res);
    } catch (error) {
      console.error('Error adding Business Numbers:', error);
    }
  };

  const InsertBussinessNumbersDtl = async (bussinessNumbersDtlData) => {
    try {
      const formData = new FormData();
      formData.append('Capacity_per_Month', bussinessNumbersDtlData?.Capacity_per_Month);
      formData.append('Customer_ID', bussinessNumbersDtlData?.Customer_ID);
      formData.append('UOM_ID', bussinessNumbersDtlData?.UOM_ID);
      formData.append('Trun_Over_Per_Year', bussinessNumbersDtlData?.Trun_Over_Per_Year);
      formData.append('Currency_ID', bussinessNumbersDtlData?.Currency_ID);
      // formData.append('Main_Export_Mrkt_Country_ID', bussinessNumbersDtlData?.Per_Of_Bus_In_USA);
      formData.append('Business_License_No', bussinessNumbersDtlData?.Business_License_No);
      formData.append('IRC', bussinessNumbersDtlData?.IRC || '');
      formData.append('BIN', bussinessNumbersDtlData?.BIN || '');
      formData.append('TIN', bussinessNumbersDtlData?.TIN || '');
      formData.append('Remarks', bussinessNumbersDtlData?.Remarks);
      formData.append('CreatedBy', bussinessNumbersDtlData?.CreatedBy);
      formData.append('UpdatedBy', bussinessNumbersDtlData?.UpdatedBy);
      formData.append('Branch_ID', bussinessNumbersDtlData?.Branch_ID);
      formData.append('Org_ID', bussinessNumbersDtlData?.Org_ID);
      formData.append(
        'Business_License_File',
        bussinessNumbersDtlData?.Business_License_File || null
      );
      formData.append('isActive', bussinessNumbersDtlData?.isActive || 1);

      const response = await Post('CreateCustomerBusiness', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Business Numbers Dtl response', response);
    } catch (error) {
      enqueueSnackbar('Error inserting customer', { variant: 'error' });
      console.error(error);
    }
  };

  const InsertCertificates = async (certificatesArray) => {
    console.log('certificatesArray', certificatesArray);
    certificatesArray.forEach(async (certificate) => {
      const formData = new FormData();
      formData.append('Document_Type_ID', certificate.Document_Type_ID);
      // formData.append('CertificatePatentType', certificate.CertificatePatentType);
      formData.append('CertificatePatentNumber', certificate.CertificatePatentNumber);
      formData.append('IssuingAuthority', certificate.IssuingAuthority);
      formData.append('Description', certificate.Description);
      formData.append('IssueDate', certificate.IssueDate);
      formData.append('ExpiryDate', certificate.ExpiryDate);
      formData.append('CreatedBy', userData?.userDetails?.userId || 1);
      formData.append('Is_Active', true);
      formData.append('Branch_ID', userData?.userDetails?.branchID || 1);
      formData.append('Org_ID', userData?.userDetails?.orgId || 1);
      formData.append('CustomerID', certificate.CustomerID);
      formData.append('CertificateFile', certificate.CertificateFile);

      try {
        const response = await Post(`UploadPdfCertificate`, formData);
        console.log('Certificate response', response);
      } catch (error) {
        console.error('Error adding Certificate:', error);
      }
    });
  };

  const InsertBankDetails = async (bankDetailsArray) => {
    try {
      const res = await Post(`MultipleBankUploads`, bankDetailsArray);
      console.log('Bank Details response', res);
    } catch (error) {
      console.error('Error adding Bank Details:', error);
    }
  };
  const InsertMasterData = async (data) => {
    const agentIDsString = data?.Agent_ID?.map((agent) => agent.AgentID).join(',');
    const endCustIDsString = data?.End_Customer_Name_ID?.map((agent) => agent.End_Cust_ID).join(
      ','
    );

    try {
      const formData = new FormData();

      formData.append('Cust_Name', data?.Cust_Name);
      formData.append('Agent_ID', agentIDsString);
      formData.append('Cust_Abb', data?.Cust_Abb);
      formData.append('Cust_Address1', data?.Cust_Address1);
      formData.append('Cust_Address2', data?.Cust_Address2 || 'N/A');
      formData.append('Cust_Landline_No', data?.Cust_Landline_No);
      formData.append('Cust_ZipCode', data?.Cust_ZipCode || 'N/A');
      formData.append('Cust_Onboarding_Email', data?.Cust_Onboarding_Email || 'N/A');
      formData.append('Cust_URL', data?.Cust_URL);
      formData.append('Cust_Country_ID', data?.Cust_Country_ID?.Country_ID);
      formData.append('Cust_City_ID', data?.Cust_City_ID?.City_ID);
      formData.append('End_Customer_Name_ID', endCustIDsString);
      formData.append('WIC_ID', data?.WIC_ID || 0);
      formData.append('CreatedBy', userData?.userDetails?.userId || 1);
      formData.append('Branch_ID', data?.Branch_ID);
      formData.append('Org_ID', data?.Org_ID);

      // Convert formData to an object
      const obj = {};
      formData.forEach((value, key) => {
        obj[key] = value;
      });

      console.log('Mst formData', obj);

      const response = await Post('RegisterCustomer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Mst response', response);
      if (response.status === 200) {
        console.log('Customer Master Data inserted successfully');

        const customerContactData = contacts.map((contact, index) => ({
          Cust_ID: response?.data?.Data,
          Contact_Type_ID: values?.contacts
            ? values?.contacts[index]?.Contact_Type_ID?.Contact_Type_ID
            : 0,
          Contact_Person_Name: values?.contacts ? values?.contacts[index]?.Contact_Person_Name : '',
          Contact_Person_Email: values?.contacts
            ? values?.contacts[index]?.Contact_Person_Email
            : '',
          Contact_Person_Mobile: values?.contacts
            ? values?.contacts[index]?.Contact_Person_Mobile
            : '',
          Contact_Person_Job_Title: values?.contacts
            ? values?.contacts[index]?.Contact_Person_Job_Title
            : '',
          CustomerBranchID: 0,
          Create_User_ID: userData?.userDetails?.userId,
          CreatedBy: userData?.userDetails?.userId,
          UpdatedBy: userData?.userDetails?.userId,
          IsActive: true,
          Branch_ID: userData?.userDetails?.branchID || 1,
          Org_ID: userData?.userDetails?.orgId || 1,
        }));

        const businessPercentageByCountryData = businessPercentageByCountry?.map(
          (busPerc, index) => ({
            Cust_ID: response?.data?.Data,
            Country_ID: values?.businessPercentageByCountry
              ? values?.businessPercentageByCountry[index]?.Business_Country_ID?.Country_ID
              : 0,
            BusinessPercentage: values?.businessPercentageByCountry
              ? values?.businessPercentageByCountry[index]?.Business_Percentage
              : 0,
            Brand_Name: values?.businessPercentageByCountry
              ? values?.businessPercentageByCountry[index]?.Brand_Name
              : '',
            CreatedBy: userData?.userDetails?.userId || 1,
            UpdatedBy: userData?.userDetails?.userId || 1,
            IsActive: true,
            Org_ID: userData?.userDetails?.orgId,
            Branch_ID: userData?.userDetails?.branchID,
          })
        );

        const certificatesData = certificates.map((certificate) => ({
          Document_Type_ID: certificate?.CertificatePatentType?.Document_Type_ID,
          // CertificatePatentType: certificate?.CertificatePatentType?.Document_Type,
          CertificatePatentNumber: certificate.CertificatePatentNumber,
          IssuingAuthority: certificate.IssuingAuthority,
          Description: certificate.Description,
          IssueDate: formatDate(certificate.IssueDate),
          ExpiryDate: formatDate(certificate.ExpiryDate),
          CustomerID: response?.data?.Data,
          CertificateFile: certificate?.CertificateFile,
        }));

        // const accountData = {
        //   Account_Name: data?.Account_Name,
        //   Cust_Acc_No: data?.Cust_Acc_No,
        //   NTN_NO: data?.NTN_NO,
        //   Billing_Address: data?.Billing_Address,
        //   Billing_Email: data?.Billing_Email,
        //   Billing_Phone_No: data?.Billing_Phone_No,
        //   Shipping_Address: data?.Shipping_Address,
        //   Shipping_Country: data?.Shipping_Country?.Country_ID,
        //   Shipping_City: data?.Shipping_City?.City_ID,
        //   Shipping_PostalCode: data?.Shipping_PostalCode,
        //   Shipping_Phone_No: data?.Shipping_Phone_No,
        //   isActive: true,
        //   CreatedBy: userData?.userDetails?.userId || 1,
        //   UpdatedBy: userData?.userDetails?.userId || 1,
        //   Org_ID: userData?.userDetails?.orgId,
        //   Branch_ID: userData?.userDetails?.branchID,
        // };

        const bussinessNumbersData = {
          Customer_ID: response?.data?.Data,
          No_Of_Employees_ID: data?.No_Of_Employees_ID?.NO_Of_Emp_ID,
          Per_Export_Bus_ID: 1,
          Per_of_Bus_In_Europe: data?.Per_of_Bus_In_Europe?.PerOfBusinessInEroupID,
          Years_In_Bus_ID: data?.Years_In_Bus_ID?.Cust_YearinBusinessID,
          Per_Of_Bus_In_USA: data?.Per_Of_Bus_In_USA.PerOfBusinessInEroupID,
          No_Of_Mach_ID: data?.No_Of_Mach_ID?.NO_Of_Emp_ID,
          Fabric_Facility_ID: data?.Fabric_Facility_ID?.FPF_ID,
          isActive: true,
          CreatedBy: userData?.userDetails?.userId || 1,
          UpdatedBy: userData?.userDetails?.userId || 1,
          Org_ID: userData?.userDetails?.orgId,
          Branch_ID: userData?.userDetails?.branchID,
        };

        const bussinessNumbersDtlData = {
          Customer_ID: response?.data?.Data,
          Capacity_per_Month: data?.Capacity_per_Month,
          UOM_ID: data?.Cust_Prod_Cap_Unit_ID?.Unit_ID,
          Trun_Over_Per_Year: data?.Cust_TurnoverPY,
          Currency_ID: data?.Cust_Turnover_CurrencyID?.Currency_ID,
          Per_Of_Bus_In_USA: data?.Per_Of_Bus_In_USA.PerOfBusinessInEroupID,
          Business_License_No: data?.Business_License_No,
          IRC: data?.IRC || '',
          BIN: data?.BIN || '',
          TIN: data?.TIN || '',
          Remarks: data?.Remarks,
          Business_License_File: data?.Business_License_File,
          isActive: true,
          CreatedBy: userData?.userDetails?.userId || 1,
          UpdatedBy: userData?.userDetails?.userId || 1,
          Org_ID: userData?.userDetails?.orgId,
          Branch_ID: userData?.userDetails?.branchID,
        };

        const bankDetailsData = bankDetails.map((bank, index) => ({
          Cust_ID: response?.data?.Data,
          Cust_Acc_Bank: values?.bankDetails[index]?.Cust_Acc_Bank,
          Cust_Acc_Branch: values?.bankDetails[index]?.Cust_Acc_Branch,
          Cust_Acc_Title: values?.bankDetails[index]?.Cust_Acc_Title,
          Cust_Acc_No: values?.bankDetails[index]?.Cust_Acc_No,
          Cust_Acc_IBAN: values?.bankDetails[index]?.Cust_Acc_IBAN,
          Currency_ID: values?.BankCurrency?.Currency_ID || 1,
          Credit_Limit_ID: values?.Credit_Limit_ID?.Credt_Limit_ID || 1,
          CreatedBy: userData?.userDetails?.userId || 1,
          UpdatedBy: userData?.userDetails?.userId || 1,
          IsActive: true,
          Org_ID: userData?.userDetails?.orgId,
          Branch_ID: userData?.userDetails?.branchID,
        }));

        await InsertCustomerContacts(customerContactData);
        await InsertCertificates(certificatesData);
        await InsertBusinessPercentageByCountry(businessPercentageByCountryData);
        await InsertBussinessNumbers(bussinessNumbersData);
        await InsertBussinessNumbersDtl(bussinessNumbersDtlData);
        await InsertBankDetails(bankDetailsData);

        // if (companyBranches.length > 0 && companyBranches?.BranchName) {
        //   const companyBranchesData = companyBranches.map((branch) => ({
        //     BranchName: branch.BranchName,
        //     Address: branch.Address,
        //     Phone: branch.Phone_No,
        //     Custumer_ID: response?.data?.Data,
        //     CreatedBy: userData?.userDetails?.userId || 1,
        //     Org_ID: userData?.userDetails?.orgId || 1,
        //     Branch_ID: userData?.userDetails?.branchID || 1,
        //   }));
        //   await InsertCompanyBranches(companyBranchesData);
        // }
        // // Reset the form fields
        // reset();
        // // Reset the form fields
        // setContacts([]);
        // setCertificates([]);
        // setCurrentCertificateFile(null);
        // setBusinessPercentageByCountry([]);
      }
    } catch (error) {
      enqueueSnackbar('Error inserting customer', { variant: 'error' });
      console.error(error);
    }
  };


  const InsertCompanyBranches = async (branchesData) => {
    console.log('branchesData', branchesData);
    try {
      // Loop through each branch and send a POST request
      const promises = branchesData.map((branch) =>
        Post('CustomerBranch/Create', {
          BranchName: branch.BranchName,
          Address: branch.Address,
          Phone: branch.Phone,
          Customer_ID: branch.Customer_ID,
          CreatedBy: branch.CreatedBy,
          IsActive: true,
          IsDeleted: false,
          OrgID: branch.Org_ID,
          BranchID: branch.Branch_ID,
        })
      );

      const responses = await Promise.all(promises);
      console.log('Company Branches response', responses);
    } catch (error) {
      console.error('Error adding Company Branches:', error);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Validate all array fields have at least one entry

      if (businessPercentageByCountry?.length === 0) {
        enqueueSnackbar('At least one business percentage by country is required', {
          variant: 'error',
        });
        return;
      }
      if (contacts?.length === 0) {
        enqueueSnackbar('At least one contact is required', { variant: 'error' });
        return;
      }
      if (certificates?.length === 0) {
        enqueueSnackbar('At least one certificate is required', { variant: 'error' });
        return;
      }
      if (bankDetails?.length === 0) {
        enqueueSnackbar('At least one bank detail is required', { variant: 'error' });
        return;
      }

      // AddWalkInCustomer: map Customer fields to WIC payload
      const walkInPayload = {
        WIC_Name: data.Cust_Name,
        WIC_Phone: data.Cust_Landline_No,
        WIC_Emial: data.Cust_Onboarding_Email,
        WIC_Address: data.Cust_Address1,
        WIC_Country_ID: data.Cust_Country_ID?.Country_ID ?? 0,
        WIC_City_ID: data.Cust_City_ID?.City_ID ?? 0,
        WIC_Business_Type_ID: data.Cust_Business_Type_ID?.CustBusinessType_ID ?? 0,
        Payment_Term_ID: data.Payment_Term_ID?.Payment_term_ID ?? allPaymentTerms?.[0]?.Payment_term_ID ?? 1,
        Credit_Limits: Number(data.Credit_Limit_ID?.Credt_Limit) || 0,
        Year_of_Establishment: data.Year_of_Establishment ?? '',
        Is_Walkin: 'Y',
        IsActive: true,
        CreatedBy: userData?.userDetails?.userId || 1,
        UpdatedBy: userData?.userDetails?.userId || 1,
        Branch_ID: userData?.userDetails?.branchID || 1,
        Org_ID: userData?.userDetails?.orgId || 1,
        contacts: (data.contacts || []).map((contact) => ({
          Contact_Name: contact.Contact_Person_Name,
          Contact_Number: contact.Contact_Person_Mobile,
          Email_Address: contact.Contact_Person_Email,
          IsActive: true,
          CreatedBy: userData?.userDetails?.userId || 1,
          UpdatedBy: userData?.userDetails?.userId || 1,
        })),
      };

      const wicResponse = await Post('AddWalkInCustomer', walkInPayload);
      let wicId = null;
      if (wicResponse?.status === 200) {
        wicId = wicResponse.data?.Data?.WIC_ID ?? wicResponse.data?.WIC_ID ?? null;
      }

      if (wicId && data.consignees?.length > 0) {
        const validConsignees = data.consignees.filter(
          (c) =>
            c.CONName?.trim() ||
            c.CONAddress?.trim() ||
            c.CONContactNo?.trim() ||
            c.CONEmail?.trim()
        );
        if (validConsignees.length > 0) {
          try {
            await Post('consignee/save', {
              WICID: wicId,
              Org_ID: userData?.userDetails?.orgId || 1,
              Branch_ID: userData?.userDetails?.branchID || 1,
              Consignees: validConsignees.map((c) => ({
                CONID: 0,
                CONName: c.CONName,
                CONAddress: c.CONAddress,
                CONContactNo: c.CONContactNo,
                CONEmail: c.CONEmail,
              })),
            });
          } catch (err) {
            console.error('Error saving consignees:', err);
            enqueueSnackbar('Customer saved but consignees failed to save', { variant: 'warning' });
          }
        }
      }

      if (wicId && data.notifyParties?.length > 0) {
        const validNotifyParties = data.notifyParties.filter(
          (n) =>
            n.NPName?.trim() ||
            n.NPAddress?.trim() ||
            n.NPContactNo?.trim() ||
            n.NPEmail?.trim()
        );
        if (validNotifyParties.length > 0) {
          try {
            await Post('notify-party/save', {
              WICID: wicId,
              Org_ID: userData?.userDetails?.orgId || 1,
              Branch_ID: userData?.userDetails?.branchID || 1,
              NotifyParties: validNotifyParties.map((n) => ({
                NPID: 0,
                NPName: n.NPName,
                NPAddress: n.NPAddress,
                NPContactNo: n.NPContactNo,
                NPEmail: n.NPEmail,
              })),
            });
          } catch (err) {
            console.error('Error saving notify parties:', err);
            enqueueSnackbar('Customer saved but notify parties failed to save', {
              variant: 'warning',
            });
          }
        }
      }

      // Register customer with WIC_ID so it stays linked
      await InsertMasterData({ ...data, WIC_ID: wicId ?? 0 });
      enqueueSnackbar('Customer created successfully', { variant: 'success' });
      navigate(paths.dashboard.customer.profile.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error creating customer', { variant: 'error' });
    }
  });

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
                Customer Information
              </Typography>
              <RHFTextField name="Cust_Name" label="Company Name" inputProps={{ maxLength: 100 }} />
              <RHFTextField name="Cust_Abb" label="Short Name" />
              <RHFTextField name="Cust_Onboarding_Email" label="Email Address" />
              <RHFTextField name="Cust_Address1" label="Factory Address" />
              <RHFTextField name="Cust_Address2" label="Office Address" />
              <RHFAutocomplete
                name="Cust_Country_ID"
                label="Country"
                type="country"
                placeholder="Choose an option"
                fullWidth
                options={countries}
                getOptionLabel={(option) => option?.Country_Name}
              />
              <RHFAutocomplete
                name="Cust_City_ID"
                label="City"
                placeholder="Choose an option"
                fullWidth
                options={cities}
                getOptionLabel={(option) => option?.City_Name}
              />
              {/* <RHFAutocomplete
                name="Cust_Business_Type_ID"
                label="Customer Business Type"
                placeholder="Choose an option"
                fullWidth
                options={businessType}
                getOptionLabel={(option) => option?.BusinessType_Name}
              /> */}
              <AutocompleteWithAdd
                name="Cust_Business_Type_ID"
                label="Buyer Business Type"
                options={businessType}
                getOptionLabel={(option) => option?.BusinessType_Name}
                isOptionEqualToValue={(option, value) =>
                  option?.CustBusinessType_ID === value?.CustBusinessType_ID
                }
                value={values?.Cust_Business_Type_ID || null}
                onAdd={PostCustBusinessType}
              />
              <RHFTextField name="Cust_Landline_No" label="Company Contact No." />
              {/* <RHFTextField name="Cust_ZipCode" label="Zip Code" type="number" /> */}
              <RHFTextField name="Cust_URL" label="Web URL" />
              <RHFAutocomplete
                name="Agent_ID"
                label="Agency"
                // placeholder="Choose an option"
                fullWidth
                multiple
                limitTags={2}
                options={activeAgents}
                value={selectedAgents} // CONTROLLED VALUE
                getOptionLabel={(option) => option?.Agent_Name}
                isOptionEqualToValue={(option, value) => option.AgentID === value.AgentID}
                renderOption={(props, option) => {
                  const isChecked = selectedAgents?.some(
                    (selected) => selected.AgentID === option.AgentID
                  );

                  return (
                    <li {...props} key={option.AgentID}>
                      <Checkbox size="small" disableRipple checked={isChecked} />
                      {option.Agent_Name}
                    </li>
                  );
                }}
                renderTags={(selected, getTagProps) =>
                  selectedAgents.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.AgentID}
                      label={option.Agent_Name}
                      size="small"
                      variant="soft"
                      color="primary"
                    />
                  ))
                }
                onChange={(event, newValue) => {
                  const hasDirect = newValue.some((agent) => agent.AgentID === 1);
                  let updatedValue = newValue;

                  if (hasDirect && newValue.length > 1) {
                    updatedValue = newValue.filter((agent) => agent.AgentID === 1);
                  }

                  setValue('Agent_ID', updatedValue);
                  console.log('Selected Agents:', updatedValue);
                }}
              />
              <RHFAutocomplete
                name="End_Customer_Name_ID"
                label="Main Buyer"
                fullWidth
                multiple
                limitTags={2}
                options={allEndCustomers}
                value={selectedEndCustomer}
                getOptionLabel={(option) => option?.End_Cust_Name}
                isOptionEqualToValue={(option, value) => option.End_Cust_ID === value.End_Cust_ID}
                renderOption={(props, option) => {
                  const isChecked = selectedEndCustomer?.some(
                    (selected) => selected.End_Cust_ID === option.End_Cust_ID
                  );
                  return (
                    <li {...props} key={option.End_Cust_ID}>
                      <Checkbox size="small" disableRipple checked={isChecked} />
                      {option.End_Cust_Name}
                    </li>
                  );
                }}
                renderTags={(selected, getTagProps) =>
                  selectedEndCustomer.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.End_Cust_ID}
                      label={option.End_Cust_Name}
                      size="small"
                      variant="soft"
                      color="primary"
                    />
                  ))
                }
                onChange={(event, newValue) => {
                  const hasDirect = newValue.some((buyer) => buyer.End_Cust_ID === 1);
                  let updatedValue = newValue;

                  if (hasDirect && newValue.length > 1) {
                    updatedValue = newValue.filter((buyer) => buyer.End_Cust_ID === 1);
                  }
                  setValue('End_Customer_Name_ID', updatedValue, { shouldValidate: true });
                }}
              />
              <RHFAutocomplete
                name="Yarn_Type_ID"
                label="Usually Perchased Yarn Type"
                placeholder="Choose an option"
                fullWidth
                disabled
                options={allTypes}
                // value={values?.Yarn_Type_ID || null}
                value={{
                  Yarn_Type_ID: 2,
                  Yarn_Type: 'Sweater',
                  Yarn_Code: 'SW',
                  IsActive: true,
                  CreatedBy: 1,
                  CreatedDate: '2025-02-06T02:36:34.2',
                  UpdatedBy: 0,
                  UpdatedDate: '2025-05-14T01:31:44.98',
                  Branch_ID: 6,
                  Org_ID: 1,
                }}
                getOptionLabel={(option) => option?.Yarn_Type || ''}
                isOptionEqualToValue={(option, value) => {
                  if (!option || !value) return false;
                  return option.Yarn_Type_ID === value.Yarn_Type_ID;
                }}
              />
              {/* <AutocompleteWithAdd
                name="End_Cust_Business_Type_ID"
                label="Buyer Business Type"
                options={businessType}
                getOptionLabel={(option) => option?.BusinessType_Name}
                isOptionEqualToValue={(option, value) =>
                  option?.CustBusinessType_ID === value?.CustBusinessType_ID
                }
                value={values?.End_Cust_Business_Type_ID || null}
                onAdd={PostCustBusinessType}
              /> */}
            </Box>
          </Card>
        </Grid>

        {/* business details */}
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
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
                    // md: 'span 3',
                  },
                }}
              >
                Business Details
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={8}>
                  <RHFTextField
                    name="Capacity_per_Month"
                    label="Production Capacity per Month "
                    type="number"
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <RHFAutocomplete
                    name="Cust_Prod_Cap_Unit_ID"
                    label="Units"
                    placeholder="Choose an option"
                    fullWidth
                    options={CAPUNIT}
                    getOptionLabel={(option) => option?.Unit_Name}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={1}>
                <Grid item xs={8}>
                  <RHFTextField name="Cust_TurnoverPY" label="Turnover last year" type="number" />
                </Grid>
                <Grid item xs={4}>
                  <RHFAutocomplete
                    name="Cust_Turnover_CurrencyID"
                    label="Currency"
                    placeholder="Choose an option"
                    fullWidth
                    options={currencies}
                    getOptionLabel={(option) => option?.Currency_Name}
                  />
                </Grid>
              </Grid>

              <RHFTextField
                name="Business_License_No"
                label="Business Registeration / License Number"
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxHeight: 50 }}>
                {/* <Grid item xs={8}> */}
                <UploadBox
                  name="BusinessLicenseNumberFile"
                  file={BusinessLicenseNumberFile}
                  accept={{
                    'application/pdf': ['.pdf'],
                  }}
                  onDrop={handleBusinessFile}
                  multiple
                />
                {/* </Grid> */}

                {/* <Grid item xs={4}> */}
                {BusinessLicenseNumberFile ? (
                  <Typography variant="caption" color="text.secondary">
                    {BusinessLicenseNumberFile?.name}
                  </Typography>
                ) : (
                  <Link
                    href={BusinessLogoByID[BusinessLogoByID.length - 1]?.FileUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Typography variant="caption" color="text.secondary">
                      {BusinessLogoByID[BusinessLogoByID.length - 1]?.FileName}
                    </Typography>
                  </Link>
                )}

                {BusinessLicenseNumberFile || BusinessLogoByID.length > 0 ? (
                  <Button
                    onClick={() => {
                      setBusinessLicenseNumberFile(null);
                      DeleteBusinessLogoByID(
                        BusinessLogoByID[BusinessLogoByID.length - 1]?.VenderID
                      );
                    }}
                    size="small"
                    sx={{ fontSize: 12 }}
                    variant="text"
                    color="error"
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </Button>
                ) : null}
                {/* </Grid> */}
              </Box>
              <RHFTextField
                name="IRC"
                label="IRC - Income Registration Certificate"
                placeholder="XXXXXXX"
              />
              <RHFTextField
                name="BIN"
                label="BIN - Business Identification Number"
                // type="number"
                placeholder="0012345678901"
              />
              <RHFTextField
                name="TIN"
                label="TIN - Taxpayer Identification Number"
                // type="number"
                placeholder="0012345678"
              />
              <Box
                sx={{
                  gridColumn: {
                    xs: 'span 1',
                    sm: 'span 2',
                  },
                }}
              >
                <Typography variant="subtitle2" color="#637381" sx={{ mb: 1 }}>
                  As a Key Account Manager / Customer Responsible Member, input your better
                  understanding about this customer below. So that management can review.
                </Typography>
                <RHFTextField name="Remarks" multiline minRows={3} />
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* business numbers */}
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
                Business Numbers
              </Typography>

              <RHFAutocomplete
                name="No_Of_Employees_ID"
                label="No. of Employees"
                placeholder="Choose an option"
                fullWidth
                options={noOfEmp}
                getOptionLabel={(option) => option?.Total_No_Of_Employees}
              />
              <RHFAutocomplete
                name="No_Of_Mach_ID"
                label="No. of Machine"
                placeholder="Choose an option"
                fullWidth
                options={noOfEmp}
                getOptionLabel={(option) => option?.Total_No_Of_Employees}
              />
              <RHFAutocomplete
                name="Fabric_Facility_ID"
                label="Fabric Processing Facility"
                placeholder="Choose an option"
                fullWidth
                options={allFPF}
                getOptionLabel={(option) => option?.FPF_Percentage}
              />

              <RHFAutocomplete
                name="Years_In_Bus_ID"
                label="Years in Business"
                placeholder="Choose an option"
                fullWidth
                options={yearsInBusiness}
                getOptionLabel={(option) => option?.Cust_YearInBusiness}
              />

              <RHFAutocomplete
                name="Per_Of_Bus_In_USA"
                label="% of Business in USA"
                placeholder="Choose an option"
                fullWidth
                options={businessPercentage}
                getOptionLabel={(option) => option?.Percentage}
              />
              <RHFAutocomplete
                name="Per_of_Bus_In_Europe"
                label="% of Business in Europe"
                placeholder="Choose an option"
                fullWidth
                options={businessPercentage}
                getOptionLabel={(option) => option?.Percentage}
              />
            </Box>
            {/* </Card>
        </Grid>
        Business Percentage by Country
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}> */}
            <Box
              mt={3}
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
                  px: 2,
                  my: 0.5,
                  // borderBottom: '1px solid #e0e0e0',
                  width: 1,
                  gridColumn: {
                    xs: 'span 1',
                    sm: 'span 2',
                    md: 'span 3',
                  },
                }}
              >
                Overall Business Volume Share by Main Buyer (in %)
              </Typography>

              <Box sx={{ gridColumn: { sm: 'span 2', md: 'span 3' } }}>
                <TableContainer component={Paper}>
                  <Scrollbar>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ minWidth: 200 }}>Country</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Main Buyer</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Percentage</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {businessPercentageByCountry.map((bp, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <RHFAutocomplete
                                name={`businessPercentageByCountry[${index}].Business_Country_ID`}
                                label="Country"
                                type="country"
                                placeholder="Choose an option"
                                fullWidth
                                options={countries}
                                getOptionLabel={(option) => option?.Country_Name}
                              />
                            </TableCell>

                            <TableCell>
                              <RHFTextField
                                name={`businessPercentageByCountry[${index}].Brand_Name`}
                                label="Main Buyer"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`businessPercentageByCountry[${index}].Business_Percentage`}
                                label="Percentage"
                                type="number"
                              />
                            </TableCell>

                            <TableCell>
                              <IconButton
                                onClick={() => handleDeleteBusinessPercentageByCountry(index)}
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddBusinessPercentageByCountry}
              >
                {businessPercentageByCountry.length > 0 ? 'Add More' : 'Add'}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Company Branch
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
                Company Branch
              </Typography>

              <Box sx={{ gridColumn: { sm: 'span 2', md: 'span 3' } }}>
                <TableContainer component={Paper}>
                  <Scrollbar>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ minWidth: 200 }}>Branch Name</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Address</TableCell>
                          <TableCell sx={{ minWidth: 180 }}>Phone No.</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {companyBranches.map((branch, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <RHFTextField
                                name={`companyBranches[${index}].BranchName`}
                                label="Branch Name"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`companyBranches[${index}].Address`}
                                label="Address"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`companyBranches[${index}].Phone_No`}
                                label="Phone No."
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => handleDeleteCompanyBranch(index)}
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleAddCompanyBranch}>
                {companyBranches.length > 0 ? 'Add More' : 'Add'}
              </Button>
            </Box>
            {methods.formState.errors.companyBranches && (
              <Typography color="error" variant="caption">
                {methods.formState.errors.companyBranches.message}
              </Typography>
            )}
          </Card>
        </Grid> */}

        {/* Contacts */}
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
                Company Key Persons&apos; Contact Detail
              </Typography>

              <Box sx={{ gridColumn: { sm: 'span 2', md: 'span 3' } }}>
                <TableContainer component={Paper}>
                  <Scrollbar>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ minWidth: 200 }}>Contact Type</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Contact Name</TableCell>
                          <TableCell sx={{ minWidth: 180 }}>Job Title</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Email</TableCell>
                          <TableCell sx={{ minWidth: 180 }}>Mobile Number</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {contacts.map((contact, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <RHFAutocomplete
                                name={`contacts[${index}].Contact_Type_ID`}
                                label="Contact Type"
                                placeholder="Choose an option"
                                fullWidth
                                options={contactTypes}
                                getOptionLabel={(option) => option?.Contact_Type_Name}
                              />
                            </TableCell>

                            <TableCell>
                              <RHFTextField
                                name={`contacts[${index}].Contact_Person_Name`}
                                label="Name"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`contacts[${index}].Contact_Person_Job_Title`}
                                // value={contact.Contact_Person_Job_Title}
                                label="Job Title"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`contacts[${index}].Contact_Person_Email`}
                                label="Email"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`contacts[${index}].Contact_Person_Mobile`}
                                // value={contact.Contact_Person_Mobile}
                                label="Phone No."
                              />
                            </TableCell>

                            <TableCell>
                              <IconButton onClick={() => handleContactDelete(index)} color="error">
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleAddContact}>
                {contacts.length > 0 ? 'Add More' : 'Add'}
              </Button>
            </Box>
            {methods.formState.errors.contacts && (
              <Typography color="error" variant="caption">
                {methods.formState.errors.contacts.message}
              </Typography>
            )}
          </Card>
        </Grid>

        {/* Certificates */}
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
                Certificates and Patents
              </Typography>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{ sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
                sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 2' } }}
              >
                <RHFAutocomplete
                  name="certificateData.CertificatePatentType"
                  label="Certificate Type"
                  placeholder="Choose an option"
                  fullWidth
                  options={filteredDocumentTypes || []}
                  getOptionLabel={(option) => option?.Document_Type || ''}
                  value={values?.certificateData?.CertificatePatentType || null}
                />

                <RHFTextField
                  name="certificateData.CertificatePatentNumber"
                  label="Certificate Number"
                />
                <RHFTextField name="certificateData.IssuingAuthority" label="Issuing Authority" />
                <RHFTextField name="certificateData.Description" label="Description" />
                <Controller
                  name="certificateData.IssueDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      label="Issue Date"
                      format="dd MMM yyyy"
                      value={field.value}
                      onChange={field.onChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!error}
                          helperText={error?.message}
                          fullWidth
                        />
                      )}
                    />
                  )}
                />
                <Controller
                  name="certificateData.ExpiryDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      label="Expiry Date"
                      format="dd MMM yyyy"
                      value={field.value}
                      onChange={(newValue) => field.onChange(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!error}
                          helperText={error?.message}
                          fullWidth
                        />
                      )}
                    />
                  )}
                />
              </Box>

              <Box>
                <RHFUpload
                  title="Certificate File"
                  name="CertificateFile"
                  file={currentCertificateFile}
                  accept={{ 'application/pdf': ['.pdf'] }}
                  onDrop={handleCertficateFileUpload}
                  onDelete={() => setCurrentCertificateFile(null)}
                />
              </Box>

              <Box
                sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 3' }, overflowX: 'auto' }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2.5, pb: 1.5 }}>
                  <Button variant="contained" color="primary" onClick={handleAddCertificate}>
                    {certificates.length > 0 ? 'Add More' : 'Add Certificate'}
                  </Button>
                </Box>
                {certificates?.length > 0 && (
                  <TableContainer component={Paper}>
                    <Scrollbar>
                      <Table sx={{ minWidth: 600 }}>
                        {/* Ensure table has a minimum width */}
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ minWidth: 180 }}>File</TableCell>
                            <TableCell sx={{ minWidth: 200 }}>Type</TableCell>
                            <TableCell sx={{ minWidth: 200 }}>Certificate No.</TableCell>
                            <TableCell sx={{ minWidth: 200 }}>Issuing Authority</TableCell>
                            <TableCell sx={{ minWidth: 200 }}>Description</TableCell>
                            <TableCell sx={{ minWidth: 180 }}>Validity from</TableCell>
                            <TableCell sx={{ minWidth: 180 }}>To</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {certificates.map((certificate, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {certificate?.CertificateFile && (
                                  <Link
                                    href={certificate?.CertificateFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View File
                                  </Link>
                                )}
                              </TableCell>
                              <TableCell>
                                {certificate?.CertificatePatentType?.Document_Type || ''}
                              </TableCell>
                              <TableCell>{certificate?.CertificatePatentNumber || ''}</TableCell>
                              <TableCell>{certificate?.IssuingAuthority || ''}</TableCell>
                              <TableCell>{certificate?.Description}</TableCell>
                              <TableCell>{fDate(certificate?.IssueDate)}</TableCell>
                              <TableCell>{fDate(certificate?.ExpiryDate)}</TableCell>
                              <TableCell>
                                <IconButton
                                  onClick={() => handleDeleteCertificate(index)}
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
                )}
              </Box>
            </Box>
            {methods.formState.errors.certificates && (
              <Typography color="error" variant="caption">
                {methods.formState.errors.certificates.message}
              </Typography>
            )}
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
                Customer Financial Information
              </Typography>

              <RHFAutocomplete
                name="BankCurrency"
                label="Currency"
                placeholder="Choose an option"
                fullWidth
                disabled
                options={currencyList}
                getOptionLabel={(option) => option?.Currency_Name}
                value={currencyList?.find((option) => option?.Currency_ID === 1) || null}
              />
              <RHFAutocomplete
                name="Credit_Limit_ID"
                label="Credit Limit"
                placeholder="Choose an option"
                fullWidth
                options={allCreditLimit}
                getOptionLabel={(option) => option?.Credit_Limit}
              />
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
                                name={`bankDetails[${index}].Cust_Acc_Bank`}
                                label="Bank Name"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`bankDetails[${index}].Cust_Acc_Branch`}
                                label="Branch Name"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`bankDetails[${index}].Cust_Acc_Title`}
                                label="Account Title"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`bankDetails[${index}].Cust_Acc_No`}
                                label="Account Number"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`bankDetails[${index}].Cust_Acc_IBAN`}
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

        {/* Consignee Information */}
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
                Consignee Information
              </Typography>

              <Box sx={{ gridColumn: { sm: 'span 2', md: 'span 3' } }}>
                <TableContainer component={Paper}>
                  <Scrollbar>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ minWidth: 200 }}>Consignee Name</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Address</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Contact Number</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Email</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {consignees.map((consignee, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <RHFTextField name={`consignees[${index}].CONName`} label="Name" />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`consignees[${index}].CONAddress`}
                                label="Address"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`consignees[${index}].CONContactNo`}
                                label="Contact Number"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`consignees[${index}].CONEmail`}
                                label="Email"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton onClick={() => handleDeleteConsignee(index)} color="error">
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleAddConsignee}>
                {consignees.length > 0 ? 'Add Another Consignee' : 'Add Consignee'}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Notify Party Information */}
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
                Notify Party Information
              </Typography>

              <Box sx={{ gridColumn: { sm: 'span 2', md: 'span 3' } }}>
                <TableContainer component={Paper}>
                  <Scrollbar>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ minWidth: 200 }}>Notify Party Name</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Address</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Contact Number</TableCell>
                          <TableCell sx={{ minWidth: 200 }}>Email</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {notifyParties.map((notifyParty, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <RHFTextField name={`notifyParties[${index}].NPName`} label="Name" />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`notifyParties[${index}].NPAddress`}
                                label="Address"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`notifyParties[${index}].NPContactNo`}
                                label="Contact Number"
                              />
                            </TableCell>
                            <TableCell>
                              <RHFTextField
                                name={`notifyParties[${index}].NPEmail`}
                                label="Email"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => handleDeleteNotifyParty(index)}
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleAddNotifyParty}>
                {notifyParties.length > 0 ? 'Add Another Notify Party' : 'Add Notify Party'}
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
