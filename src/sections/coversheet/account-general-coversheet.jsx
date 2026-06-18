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
import { LoadingScreen } from 'src/components/loading-screen';
import { APP_API_STORAGE } from 'src/config-global';
import ChartRadarBar from '../_examples/extra/chart-view/chart-radar-bar';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';

// ----------------------------------------------------------------------

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
}

export default function AccountGeneralCoversheet({ currentData, currentScores }) {
  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem('UserData'));
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [CAPUNIT, setCAPUNIT] = useState([]);
  const [countries, setCountries] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [cities, setCities] = useState([]);
  const [citiesShipping, setCitiesShipping] = useState([]);
  const [BusinessLicenseNumberFile, setBusinessLicenseNumberFile] = useState(null);
  const [BusinessLogoByID, setBusinessLogoByID] = useState([]);
  const [activeAgents, setActiveAgents] = useState([]);

  const [noOfEmp, setNoOfEmp] = useState([]);
  const [businessPercentage, setBusinessPercentage] = useState([]);
  const [yearsInBusiness, setYearsInBusiness] = useState([]);
  const [businessType, setBusinessType] = useState([]);
  // const [businessEndType, setBusinessEndType] = useState([]);
  const [allEndCustomers, setAllEndCustomers] = useState([]);
  const [allFPF, setAllFPF] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);

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
      BusinessPercentage: '',
      Brand_Name: '',
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

  const [certificates, setCertificates] = useState(
    currentData?.CertificateDetails?.map((x) => ({
      ...x,
      CertificatePatentType:
        documentTypes?.find((option) => option?.Document_Type_ID === x?.Document_Type_ID) || null,
      CertificateFile: `${APP_API_STORAGE}${x?.DocFilePath}`,
    })) || []
  );
  const [currentCertificateFile, setCurrentCertificateFile] = useState(null);
  const [currencyList, setCurrencyList] = useState([]);
  const [allCreditLimit, setCreditLimit] = useState([]);
  const [coversheetScores, setCoversheetScores] = useState([]);

  const radarData = [
    currentData?.BusinessNo[0]?.Total_Emp_Score,
    currentData?.BusinessNo[0]?.No_Of_Machine_Score,
    currentData?.BusinessNo[0]?.Fabric_Production_Score,
    currentData?.BusinessNo[0]?.Year_in_Business_Score,
    currentData?.BusinessNo[0]?.Total_Europe_Score,
    currentData?.BusinessNo[0]?.Total_USA_Score,
    (currentData?.CertificateDetails || []).length * 5,
  ]?.map(Number); // Convert strings to numbers if necessary
  const totalScore = radarData?.reduce((acc, val) => acc + val, 0);

  const CustomerSchema = Yup.object().shape({
    Cover_Sheet_Answer_ID: Yup.object().required('Cover Sheet Answer is required'),
    Summary: Yup.string().required('Summary is required'),
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

  // const GetBusinessEndType = useCallback(async () => {
  //   const res = await Get('ApiGetEndCustBuinessType');
  //   setBusinessEndType(res.data?.Data || []);
  // }, []);

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

  const GetActiveCurrencies = useCallback(async () => {
    try {
      const response = await Get(`getActiveCurrencies`);
      setCurrencyList(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getCreditLimit = useCallback(async () => {
    const res = await Get(
      `getCreditLimit?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setCreditLimit(res.data.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const getCoverSheetAnswers = useCallback(async () => {
    const res = await Get(
      `getCoverSheetAnswers?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setCoversheetScores(res.data.Data || []);
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
        getCoverSheetAnswers(),
      ]);
      setIsLoading(false);
    };
    fetch();
  }, [
    GetCities,
    GetCountries,
    GetCurrencies,
    GetAllActiveCAPUNIT,
    GetActiveAgents,
    GetAllContact,

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
    getCoverSheetAnswers,
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

  useEffect(() => {
    setCertificates(
      currentData?.CertificateDetails?.map((x) => ({
        ...x,
        CertificatePatentType:
          documentTypes?.find((option) => option?.Document_Type_ID === x?.Document_Type_ID) || null,
        CertificateFile: `${APP_API_STORAGE}${x?.DocFilePath}`,
      })) || []
    );
  }, [documentTypes, currentData?.CertificateDetails]);

  const defaultValues = useMemo(
    () => ({
      Cover_Sheet_Answer_ID:
        coversheetScores.find(
          (x) => x.Cover_Sheet_Answer_ID === currentScores?.Cover_Sheet_Answer_ID
        ) || null,
      Summary: currentScores?.Remarks || '',

      Cust_Name: currentData?.Cust_Name || '',
      Cust_Abb: currentData?.Cust_Abb || '',
      Cust_Address1: currentData?.Cust_Address1 || '',
      Cust_Address2: currentData?.Cust_Address2 || '',
      Cust_Landline_No: currentData?.Cust_Landline_No || '',
      Cust_Onboarding_Email: currentData?.Cust_Onboarding_Email || 'N/A',
      Cust_URL: currentData?.Cust_URL || '',

      Cust_Country_ID:
        countries?.find((option) => option?.Country_ID === currentData?.Cust_Country_ID) || null,
      Cust_City_ID:
        allCities?.find((option) => option?.City_ID === currentData?.Cust_City_ID) || null,

      End_Customer_Name_ID:
        currentData?.End_Customer_Dtl?.map((cust) =>
          allEndCustomers?.find((option) => option.End_Cust_ID === cust.End_Cust_ID)
        )?.filter(Boolean) || [],

      Agent_ID:
        currentData?.Agent_Dtl?.map((agent) =>
          activeAgents?.find((option) => option.AgentID === agent.Customer_Agent_ID)
        )?.filter(Boolean) || [],

      Capacity_per_Month: currentData?.BusinessDetails[0]?.Capacity_per_Month || null,
      Cust_Prod_Cap_Unit_ID:
        CAPUNIT?.find(
          (option) => option?.Unit_ID === currentData?.BusinessDetails[0]?.UOM_ID || null
        ) || null,

      Cust_TurnoverPY: currentData?.BusinessDetails[0]?.Trun_Over_Per_Year || null,
      Business_License_No: currentData?.BusinessDetails[0]?.Business_License_No || '',
      Cust_Turnover_CurrencyID:
        currencies.find((c) => c.Currency_ID === currentData?.BusinessDetails[0]?.Currency_ID) ||
        null,
      Remarks: currentData?.BusinessDetails[0]?.Remarks || '',

      No_Of_Employees_ID:
        noOfEmp.find((x) => x.NO_Of_Emp_ID === currentData?.BusinessNo[0]?.No_Of_Employees_ID) ||
        null,
      Per_of_Bus_In_Europe:
        businessPercentage.find(
          (x) => x.Percentage === currentData?.BusinessNo[0]?.Europe_Percentage
        ) || null,
      Per_Of_Bus_In_USA:
        businessPercentage.find(
          (x) => x.Percentage === currentData?.BusinessNo[0]?.Europe_Percentage
        ) || null,
      Fabric_Facility_ID:
        allFPF.find((x) => x.FPF_ID === currentData?.BusinessNo[0]?.Fabric_Facility_ID) || null,
      No_Of_Mach_ID:
        noOfEmp.find((x) => x.NO_Of_Emp_ID === currentData?.BusinessNo[0]?.No_Of_Mach_ID) || null,
      Years_In_Bus_ID:
        yearsInBusiness.find(
          (x) => x.Cust_YearinBusinessID === currentData?.BusinessNo[0]?.Years_In_Bus_ID
        ) || null,

      businessPercentageByCountry:
        currentData?.CustomerBusperCounWise?.map((x) => ({
          ...x,
          BusinessPercentage: x.BusinessPercentage,
          Business_Country_ID: countries?.find((c) => c.Country_ID === x.Country_ID) || null,
        })) || [],

      contacts:
        currentData?.ContactDetails?.map((x) => ({
          ...x,
          Contact_Type_ID:
            contactTypes?.find((option) => option?.Contact_Type_ID === x.Contact_Type_ID) || null,
        })) || [],
      certificates:
        currentData?.CertificateDetails?.map((x) => ({
          ...x,
          CertificatePatentType:
            documentTypes?.find((option) => option?.Document_Type_ID === x?.Document_Type_ID) ||
            null,
          CertificateFile: `${APP_API_STORAGE}${x?.DocFilePath}`,
        })) || [],
      Credit_Limit_ID:
        allCreditLimit.find(
          (x) => x.Credt_Limit_ID === currentData?.Account_Info[0]?.Credit_Limit_ID
        ) || null,
      bankDetails:
        currentData?.Account_Info?.map((x) => ({
          ...x,
          Cust_Acc_No: x.Cust_Acc_No || '',
        })) || [],
      Branch_ID: userData?.userDetails?.branchID || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
      End_Cust_Business_Type_ID: businessType.find((option) => option?.CustBusinessType_ID === currentData?.CustBusinessType_ID) || null,
    }),
    [
      coversheetScores,
      currentScores,
      userData?.userDetails?.branchID,
      userData?.userDetails.orgId,
      currentData,
      countries,
      activeAgents,
      contactTypes,
      allCities,
      allEndCustomers,
      CAPUNIT,
      currencies,
      documentTypes,
      noOfEmp,
      allFPF,
      businessPercentage,
      yearsInBusiness,
      allCreditLimit,
      businessType,
    ]
  );

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

  const selectedAgents = useWatch({ control, name: 'Agent_ID' }) || []; // Get current value
  const selectedEndCustomer = useWatch({
    control,
    name: 'End_Customer_Name_ID',
  });
  // Watch the selected Cover_Sheet_Answer_ID
  const selectedCoverSheetAnswerID = useWatch({
    control,
    name: 'Cover_Sheet_Answer_ID',
  });

  // Determine background color based on selected value
  const getBackgroundColor = (id) => {
    if (id?.Cover_Sheet_Answer_ID === 1 || id?.Cover_Sheet_Answer_ID === 2)
      return 'rgba(208, 245, 216, 0.5)'; // light green
    if (id?.Cover_Sheet_Answer_ID === 3) return 'rgba(255, 204, 204, 0.5)'; // light red
    return 'white'; // default
  };

  useEffect(() => {
    if (!isLoading) {
      methods.reset(defaultValues);
    }
  }, [isLoading, defaultValues, methods]);

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
        //   console.log('Contact deleted successfully from the server');
        // } else {
        //   console.error('Failed to delete contact from the server', response.data);
        // }
      } catch (error) {
        console.error('Error while deleting contact from the server', error);
      }
    }
    const updatedContacts = contacts.filter((_, i) => i !== index);
    setContacts(updatedContacts);
    setValue('contacts', updatedContacts);
  };

  const handleAddBusinessPercentageByCountry = () => {
    const newItem = {
      Business_Country_ID: null,
      BusinessPercentage: null,
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

    setCurrentCertificateFile(null); // Reset file input
  };

  const InsertMasterData = async (data) => {
    try {
      const dataToSend = {
        Cover_Sheet_Answer_ID: data?.Cover_Sheet_Answer_ID?.Cover_Sheet_Answer_ID || 1,
        Remarks: data?.Summary,
        Customer_ID: currentData?.Cust_ID,
        isActive: true,
        isDeleted: false,
        CreatedBy: userData?.userDetails?.userId || 1,
        BranchID: userData?.userDetails?.branchID || 1,
        OrgID: userData?.userDetails?.orgId || 1,
      };

      const response = await Post('addCoverSheetResult', dataToSend);
      if (response.status === 200) {
        console.log('Score card updated successfully');

        enqueueSnackbar('Response Submitted');

        navigate(paths.dashboard.customer.coversheet.root);
      }
    } catch (error) {
      enqueueSnackbar('Error inserting customer', { variant: 'error' });
      console.error(error);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await InsertMasterData(data);
    } catch (error) {
      console.error(error);
    }
  });

  if (isLoading) {
    return (
      <LoadingScreen
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70vh',
        }}
      />
    );
  }

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
                // md: 'repeat(3, 1fr)',
              }}
            >
              <Box>
                <RHFAutocomplete
                  name="Cover_Sheet_Answer_ID"
                  label="Results"
                  placeholder="Choose an option"
                  fullWidth
                  options={coversheetScores}
                  getOptionLabel={(option) => option?.Cover_Sheet_Answer}
                  sx={{
                    mb: 2,
                    backgroundColor: getBackgroundColor(selectedCoverSheetAnswerID),
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: getBackgroundColor(selectedCoverSheetAnswerID),
                    },
                  }}
                />

                <RHFTextField
                  label="Summary"
                  name="Summary"
                  multiline
                  minRows={4}
                  placeholder="Summary..."
                />
              </Box>
              <Box sx={{ gridColumn: 'span 2' }}>
                <Typography variant="subtitle2" pl={5}>
                  {currentData?.Cust_Name}
                </Typography>
                <ChartRadarBar
                  series={[
                    {
                      name: 'Score',
                      data: radarData,
                    },
                  ]}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', mb: 3, mt: -10 }}>
                  <Typography variant="caption" pl={5}>
                    Total Achieved Score:
                    <span style={totalScore >= 100 ? { color: 'green' } : { color: 'red' }}>
                      {totalScore}
                    </span>
                  </Typography>
                </Box>
              </Box>
            </Box>
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
          </Card>
        </Grid>
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
                isOptionEqualToValue={(option, value) => option.Country_ID === value.Country_ID}
              />

              <RHFAutocomplete
                name="Cust_City_ID"
                label="City"
                placeholder="Choose an option"
                fullWidth
                options={cities}
                getOptionLabel={(option) => option?.City_Name}
                isOptionEqualToValue={(option, value) => option.City_ID === value.City_ID}
              />
              <RHFTextField name="Cust_Landline_No" label="Company Contact No." />
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
                  selectedAgents?.map((option, index) => (
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
                  selectedEndCustomer?.map((option, index) => (
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
              <AutocompleteWithAdd
                name="End_Cust_Business_Type_ID"
                label="Buyer Business Type"
                options={businessType}
                getOptionLabel={(option) => option?.BusinessType_Name}
                isOptionEqualToValue={(option, value) =>
                  option?.CustBusinessType_ID === value?.CustBusinessType_ID
                }
                value={values?.End_Cust_Business_Type_ID || null}
                onAdd={PostCustBusinessType}
              />
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
                    // value={currencies?.find(
                    //   (option) =>
                    //     option?.Currency_ID === values?.Cust_Turnover_CurrencyID?.Currency_ID
                    // )}
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
                    href={
                      `${APP_API_STORAGE}${currentData?.BusinessDetails[0]?.Business_License_Path}` ||
                      '#'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Typography variant="caption" color="text.secondary">
                      [View File]
                    </Typography>
                  </Link>
                )}

                {/* {currentData?.BusinessDetails[0]?.Business_License_Path ||
                BusinessLogoByID.length > 0 ? (
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
                ) : null} */}
                {/* </Grid> */}
              </Box>
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
                          {/* <TableCell>Actions</TableCell> */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {businessPercentageByCountry?.map((bp, index) => (
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
                                name={`businessPercentageByCountry[${index}].BusinessPercentage`}
                                label="Percentage"
                                type="number"
                              />
                            </TableCell>

                            {/* <TableCell>
                              <IconButton
                                onClick={() => handleDeleteBusinessPercentageByCountry(index)}
                                color="error"
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </TableCell> */}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
              </Box>
            </Box>
            {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddBusinessPercentageByCountry}
              >
                Add More
              </Button>
            </Box> */}
          </Card>
        </Grid>

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
                          {/* <TableCell>Actions</TableCell> */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {contacts?.map((contact, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <RHFAutocomplete
                                name={`contacts[${index}].Contact_Type_ID`}
                                label="Contact Type"
                                placeholder="Choose an option"
                                fullWidth
                                options={contactTypes}
                                // value={contactTypes?.find(
                                //   (option) =>
                                //     option?.Contact_Type_ID ===
                                //     values?.contacts[index]?.Contact_Type_ID?.Contact_Type_ID
                                // )}
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

                            {/* <TableCell>
                              <IconButton onClick={() => handleContactDelete(index)} color="error">
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </TableCell> */}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
              </Box>
            </Box>
            {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleAddContact}>
                Add More
              </Button>
              {methods.formState.errors.contacts && (
                <Typography color="error" variant="caption">
                  {methods.formState.errors.contacts.message}
                </Typography>
              )}
            </Box> */}
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
                  options={documentTypes}
                  getOptionLabel={(option) => option?.Document_Type}
                />
                {/* <RHFTextField
                  name="certificateData.CertificatePatentType"
                  label="Certificate Type"
                /> */}
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
                {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2.5, pb: 1.5 }}>
                  <Button variant="contained" color="primary" onClick={handleAddCertificate}>
                    Add More
                  </Button>
                </Box> */}
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
                            {/* <TableCell>Actions</TableCell> */}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {certificates?.map((certificate, index) => (
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
                              {/* <TableCell>
                                                    <IconButton
                                                      onClick={() => handleDeleteCertificate(index)}
                                                      color="error"
                                                    >
                                                      <Iconify icon="solar:trash-bin-trash-bold" />
                                                    </IconButton>
                                                  </TableCell> */}
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
                          {/* <TableCell>Actions</TableCell> */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bankDetails?.map((bank, index) => (
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
                            {/* <TableCell>
                              <IconButton
                                onClick={() => handleDeleteBankDetail(index)}
                                color="error"
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </TableCell> */}
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
            {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleAddBankDetail}>
                Add Bank
              </Button>
            </Box> */}
          </Card>
        </Grid>
        {/* submit button */}
        {/* <Grid xs={12} md={12}>
          <Stack spacing={3} alignItems="flex-end">
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              Save Changes
            </LoadingButton>
          </Stack>
        </Grid> */}
      </Grid>
    </FormProvider>
  );
}
AccountGeneralCoversheet.propTypes = {
  currentData: PropTypes.object,
  currentScores: PropTypes.object,
};
