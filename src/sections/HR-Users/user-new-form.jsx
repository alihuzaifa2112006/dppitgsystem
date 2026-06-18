import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm, Controller, useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Autocomplete,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
  Divider,
} from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';

import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFUploadBox,
} from 'src/components/hook-form';

import { Get, Post } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';


// ----------------------------------------------------------------------

const steps = [
  'Employee Information System',
  'Address Information',
  'Emergency Contact & Identification',
  'Organizational Profile',
  'Nominee Details'
];

export default function UserCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [activeStep, setActiveStep] = useState(0);

  // State for dropdown data
  const [maritalStatusOptions, setMaritalStatusOptions] = useState([]);
  const [genderOptions, setGenderOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [bloodGroupOptions, setBloodGroupOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [jobLocationOptions, setJobLocationOptions] = useState([]);

  const [staffCategoryOptions, setStaffCategoryOptions] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [paymentTypeOptions, setPaymentTypeOptions] = useState([]);
  const [statusOptions] = useState([
    { id: 1, name: 'Active' },
    { id: 2, name: 'InActive' }
  ]);
  const [isLoading, setLoading] = useState(true);
  const MartialStatus = [
    { id: 1, name: 'Single' },
    { id: 2, name: 'Married' },
    { id: 3, name: 'Widow' },
  ]
  const Gender = [
    { id: 1, name: 'Male' },
    { id: 2, name: 'Female' },

  ]
  const employeeCategoryOptions = [
    { id: 1, name: 'Permanent' },
    { id: 2, name: 'Probation' },

  ]

  const EmployeeSchema = Yup.object().shape({
    // Step 1 - Employee Information
    machineCode: Yup.string().required('Machine Code is required'),
    fullName: Yup.string().required('Full Name is required'),
    fathersName: Yup.string().required("Father's Name is required"),
    mothersName: Yup.string().required("Mother's Name is required"),
    religion: Yup.string().required('Religion is required'),
    nationality: Yup.string().required('Nationality is required'),
    dateOfBirth: Yup.date().required('Date of Birth is required').nullable(),
    maritalStatus: Yup.object().required('Marital Status is required'),
    gender: Yup.object().required('Gender is required'),
    department: Yup.object().required('Department is required'),
    section: Yup.object().required('Section is required'),
    designation: Yup.object().required('Designation is required'),
    placeOfBirth: Yup.string().required('Place of Birth is required').nullable(),
    email: Yup.string().email('Invalid email').required('Email is required'),
    contactNo: Yup.string().required('Contact No is required'),
    bloodGroup: Yup.object().required('Blood Group is required'),
    gradeNo: Yup.object().required('Grade No is required'),
    jobLocation: Yup.object().required('Job Location is required'),
    photo: Yup.mixed().nullable(),

    // Step 2 - Address Information
    presentAddress: Yup.string().required('Present Address is required'),
    permanentAddress: Yup.string().required('Permanent Address is required'),
    presentState: Yup.string().required('Present State is required'),
    permanentState: Yup.string().required('Permanent State is required'),
    presentZipCode: Yup.string().required('Present ZipCode is required'),
    permanentZipCode: Yup.string().required('Permanent ZipCode is required'),
    presentDistrict: Yup.string().required('Present District is required'),
    permanentDistrict: Yup.string().required('Permanent District is required'),

    // Step 3 - Emergency Contact & Identification
    emergencyContactPerson: Yup.string().required('Emergency Contact Person is required'),
    emergencyContactNo: Yup.string().required('Emergency Contact No is required'),
    relation: Yup.string().required('Relation is required'),
    nextToKin: Yup.string().required('Next to Kin is required'),
    nid: Yup.string().required('NID is required'),
    nidExpiryDate: Yup.date().required('NID Expiry Date is required').nullable(),
    insurancePolicy: Yup.string().required('Insurance Policy is required'),
    ntnNo: Yup.string().required('NTN No is required'),

    // Step 4 - Organizational Profile
    dateOfAppointment: Yup.date().required('Date of Appointment is required').nullable(),
    employeeCategory: Yup.object().required('Employee Category is required'),
    staffCategory: Yup.object().required('Staff Category is required'),
    // shift: Yup.object().required('Shift is required'),
    accountNo: Yup.string().required('Account No is required'),
    bankBranch: Yup.string().required('Bank / Branch is required'),
    paymentType: Yup.object().required('Payment Type is required'),
    status: Yup.object().required('Status is required'),

    // Step 5 - Nominee Details
    nomineeName: Yup.string().required('Nominee Name is required'),
    nomineeDob: Yup.date().required('Nominee DOB is required').nullable(),
    nomineeNid: Yup.string().required('Nominee NID is required'),
    nomineeRelationship: Yup.string().required('Relationship is required'),
    nomineeAddress: Yup.string().required('Address is required'),
    nomineeMobileNo: Yup.string().required('Mobile No is required'),
  });

  const methods = useForm({
    resolver: yupResolver(EmployeeSchema),
    defaultValues: {
      // Step 1
      machineCode: '',
      fullName: '',
      fathersName: '',
      mothersName: '',
      religion: '',
      nationality: '',
      dateOfBirth: null,
      maritalStatus: null,
      gender: null,
      department: null,
      section: null,
      designation: null,
      placeOfBirth: null,
      email: '',
      contactNo: '',
      bloodGroup: null,
      gradeNo: null,
      jobLocation: null,
      photo: null,

      // Step 2
      presentAddress: '',
      permanentAddress: '',
      presentState: '',
      permanentState: '',
      presentZipCode: '',
      permanentZipCode: '',
      presentDistrict: '',
      permanentDistrict: '',

      // Step 3
      emergencyContactPerson: null,
      emergencyContactNo: '',
      relation: '',
      nextToKin: '',
      nid: '',
      nidExpiryDate: null,
      insurancePolicy: '',
      ntnNo: '',

      // Step 4
      dateOfAppointment: null,
      employeeCategory: null,
      staffCategory: null,
      shift: null,
      accountNo: '',
      bankBranch: '',
      paymentType: null,
      status: null,

      // Step 5
      nomineeName: '',
      nomineeDob: null,
      nomineeNid: '',
      nomineeRelationship: '',
      nomineeAddress: '',
      nomineeMobileNo: '',
    },
    mode: 'onChange', // Validate on change to enable step validation
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    trigger,
    formState: { isSubmitting, errors, isValid },
  } = methods;

  const values = watch();

  // Format date for API
  const formatDateForAPI = (date) => {
    if (!date) return null;
    const formattedDate = new Date(date);
    return formattedDate.toISOString();
  };

  // Separate API call functions
  const FetchDepartmentOptions = useCallback(async () => {
    try {
      const response = await Get(`HRModule/GetDepartment?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`);
      setDepartmentOptions(response.data?.Data);
    } catch (error) {
      console.error('Error fetching department options:', error);
      setDepartmentOptions([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchSectionOptions = useCallback(async () => {
    try {
      if (!values.department?.DepId) return;

      const response = await Get(`HRModule/GetSection?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&DepId=${values?.department?.DepId || 0}`);
      setSectionOptions(response.data?.Data);
    } catch (error) {
      console.error('Error fetching section options:', error);
      setSectionOptions([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, values?.department?.DepId]);

  const FetchDesignationOptions = useCallback(async () => {
    try {
      const response = await Get(`HRModule/GetDesignation?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`);
      setDesignationOptions(response.data?.Data);
    } catch (error) {
      console.error('Error fetching designation options:', error);
      setDesignationOptions([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchBloodGroupOptions = useCallback(async () => {
    try {
      const response = await Get('HRModule/GetBloodGroup');
      setBloodGroupOptions(response.data?.Data || []);
    } catch (error) {
      console.error('Error fetching blood group options:', error);
      setBloodGroupOptions([]);
    }
  }, []);

  const FetchGradeOptions = useCallback(async () => {
    try {
      const response = await Get('HRModule/GetGradeNo');
      setGradeOptions(response.data?.Data || []);
    } catch (error) {
      console.error('Error fetching grade options:', error);
      setGradeOptions([]);
    }
  }, []);

  const FetchJobLocationOptions = useCallback(async () => {
    try {
      const response = await Get(`HRModule/GetJobLocationInfo?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`);
      setJobLocationOptions(response.data?.Data || []);
    } catch (error) {
      console.error('Error fetching job location options:', error);
      setJobLocationOptions([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchStaffCategoryOptions = useCallback(async () => {
    try {
      const response = await Get(`HRModule/GetStaffCategory?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`);
      setStaffCategoryOptions(response.data?.Data || []);
    } catch (error) {
      console.error('Error fetching staff category options:', error);
      setStaffCategoryOptions([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchShiftOptions = useCallback(async () => {
    try {
      const response = await Get(`HRModule/GetShift?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`);
      setShiftOptions(response.data?.Data || response.data || []);
    } catch (error) {
      console.error('Error fetching shift options:', error);
      setShiftOptions([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchPaymentTypeOptions = useCallback(async () => {
    try {
      const response = await Get(`HRModule/GetEmployeePaymentType?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`);
      setPaymentTypeOptions(response.data?.Data || []);
    } catch (error) {
      console.error('Error fetching payment type options:', error);
      setPaymentTypeOptions([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // Fetch all dropdown data using separate API calls
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          FetchDepartmentOptions(),
          FetchSectionOptions(),
          FetchDesignationOptions(),
          FetchBloodGroupOptions(),
          FetchGradeOptions(),
          FetchJobLocationOptions(),
          FetchStaffCategoryOptions(),
          FetchShiftOptions(),
          FetchPaymentTypeOptions(),
        ]);
      } catch (error) {
        console.error('Error fetching form data:', error);
        enqueueSnackbar('Error loading form data', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    FetchDepartmentOptions,
    FetchSectionOptions,
    FetchDesignationOptions,
    FetchBloodGroupOptions,
    FetchGradeOptions,
    FetchJobLocationOptions,
    FetchStaffCategoryOptions,
    FetchShiftOptions,
    FetchPaymentTypeOptions,
    enqueueSnackbar,
  ]);

  const handleNext = async () => {
    const currentStepFields = getStepFields(activeStep);

    // Trigger validation for current step fields only
    const isStepValid = await trigger(currentStepFields);

    if (isStepValid) {
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      enqueueSnackbar('Please fill all required fields in the current step', { variant: 'error' });
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getStepFields = (step) => {
    switch (step) {
      case 0:
        return [
          'machineCode', 'fullName', 'fathersName', 'mothersName', 'religion',
          'nationality', 'dateOfBirth', 'maritalStatus', 'gender', 'department',
          'section', 'designation', 'placeOfBirth', 'email', 'contactNo',
          'bloodGroup', 'gradeNo', 'jobLocation'
        ];
      case 1:
        return [
          'presentAddress', 'permanentAddress', 'presentState', 'permanentState',
          'presentZipCode', 'permanentZipCode', 'presentDistrict', 'permanentDistrict'
        ];
      case 2:
        return [
          'emergencyContactPerson', 'emergencyContactNo', 'relation', 'nextToKin',
          'nid', 'nidExpiryDate', 'insurancePolicy', 'ntnNo'
        ];
      case 3:
        return [
          'dateOfAppointment', 'employeeCategory', 'staffCategory', 'shift',
          'accountNo', 'bankBranch', 'paymentType', 'status'
        ];
      case 4:
        return [
          'nomineeName', 'nomineeDob', 'nomineeNid', 'nomineeRelationship',
          'nomineeAddress', 'nomineeMobileNo'
        ];
      default:
        return [];
    }
  };

  // Check if current step is valid
  const isStepValid = async (step) => {
    const stepFields = getStepFields(step);
    const result = await trigger(stepFields);
    return result;
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });

        setValue('photo', newFile, { shouldValidate: true }); // match `name` in RHFUploadBox
      }
    },
    [setValue]
  );
  const onSubmit = handleSubmit(async (data) => {
    try {
      // Prepare employee data according to API structure
      const employeeData = {
        EISNo: `EIS${Date.now()}`,
        EmployeeMachineCode: data.machineCode,
        EmployeeName: data.fullName,
        FatherName: data.fathersName,
        MotherName: data.mothersName,
        Religion: data.religion,
        Nationality: data.nationality,
        DateofBirth: formatDateForAPI(data.dateOfBirth),
        MaritalStatusID: data.maritalStatus?.id,
        GenderID: data.gender?.id,
        DepId: data.department?.DepId,
        SectionID: data.section?.SectionID,
        DesigId: data.designation?.DesigId,
        PlaceofBirth: data.placeOfBirth,
        Email: data.email,
        CellNo: data.contactNo,
        BloodGroupID: data.bloodGroup?.BloodGroupID,
        Grade_ID: data.gradeNo?.Grade_ID,
        JobLocationInfoID: data.jobLocation?.JobLocationInfoID,
        EmergencyContactPerson: data.emergencyContactPerson,
        Relation: data.relation,
        EmergencyContactNo: data.emergencyContactNo,
        NextToKin: data.nextToKin,
        PresentAddress: data.presentAddress,
        PermanentAddress: data.permanentAddress,
        PresentState: data.presentState,
        PermanentState: data.permanentState,
        PresentZipCode: data.presentZipCode,
        PermanentZipCode: data.permanentZipCode,
        PresentDistrict: data.presentDistrict,
        PermanentDistrict: data.permanentDistrict,
        CNIC: data.nid,
        CNICExpiryDate: formatDateForAPI(data.nidExpiryDate),
        InsurancePolicy: data.insurancePolicy,
        NTNNo: data.ntnNo,
        AppointmentDate: formatDateForAPI(data.dateOfAppointment),
        BankBranchName: data.bankBranch,
        AccountNo: data.accountNo,
        EmployeePaymentTypeID: data.paymentType?.EmployeePaymentTypeID,
        EmployeeCategoryID: data.employeeCategory?.id,
        StaffCategoryID: data.staffCategory?.StaffCategoryID,
        ShiftId: data.shift?.id,
        IsActive: data.status?.id === 1,
        CreatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
        NomineeName: data.nomineeName,
        NomineeDOB: formatDateForAPI(data.nomineeDob),
        NomineeNIDNo: data.nomineeNid,
        NomineeRelationship: data.nomineeRelationship,
        NomineeAddress: data.nomineeAddress,
        NomineeMobileNo: data.nomineeMobileNo,
        DepartmentName: data.department?.DepartmentName,
        DesignationName: data.designation?.DesignationName,
        Photo: data.photo?.name || 'default.jpg'
      };

      console.log('Submitting employee data:', employeeData);

      // Create FormData object as required by API
      const formData = new FormData();
      formData.append('employee', JSON.stringify(employeeData));

      // If photo is uploaded, add it to formData
      if (data.photo && data.photo instanceof File) {
        formData.append('photo', data.photo);
      }
      console.log(formData, 'formData')
      // Call the API with FormData
      const response = await Post('HRModule/CreateEmployeeProfile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Employee created successfully!', { variant: 'success' });
        router.push(paths.dashboard.HR_Module.HR_Users.root);
      } else {
        throw new Error('Failed to create employee');
      }
    } catch (error) {
      console.error('Save Error:', error);
      enqueueSnackbar(
        error.response?.data?.message || error.message || 'Error creating employee',
        { variant: 'error' }
      );
    }
  });

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderEmployeeInformation();
      case 1:
        return renderAddressInformation();
      case 2:
        return renderEmergencyContactIdentification();
      case 3:
        return renderOrganizationalProfile();
      case 4:
        return renderNomineeDetails();
      default:
        return null;
    }
  };

  const renderEmployeeInformation = () => (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Employee Information System
      </Typography>

      <Box
        rowGap={3}
        columnGap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
        sx={{ mt: 2 }}
      >
        <RHFTextField name="machineCode" label="Machine Code" fullWidth key='1' />
        <RHFTextField name="fullName" label="Full Name" fullWidth key='2' />
        <RHFTextField name="fathersName" label="Father's Name" fullWidth key='3' />
        <RHFTextField name="mothersName" label="Mother's Name" fullWidth key='4' />
        <RHFTextField name="religion" label="Religion" fullWidth key='5' />
        <RHFTextField name="nationality" label="Nationality" fullWidth key='6' />

        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <DesktopDatePicker
              label="Date of Birth"
              value={field.value}
              onChange={field.onChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          )}
        />

        <RHFAutocomplete
          name="maritalStatus"
          label="Marital Status"
          options={MartialStatus}
          getOptionLabel={(option) => option?.name || ''}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          value={values?.maritalStatus || null}
        />

        <RHFAutocomplete
          name="gender"
          label="Gender"
          options={Gender}
          getOptionLabel={(option) => option?.name || ''}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
          value={values?.gender || null}
        />

        <RHFAutocomplete
          name="department"
          label="Department"
          options={departmentOptions}
          getOptionLabel={(option) => option?.DepartmentName || ''}
          isOptionEqualToValue={(option, value) => option?.DepId === value?.DepId}
          value={values?.department || null}
        />

        <RHFAutocomplete
          name="section"
          label="Section"
          options={sectionOptions}
          getOptionLabel={(option) => option?.SectionName || ''}
          isOptionEqualToValue={(option, value) => option?.SectionID === value?.SectionID}
          value={values?.section || null}
        />

        <RHFAutocomplete
          name="designation"
          label="Designation"
          options={designationOptions}
          getOptionLabel={(option) => option?.DesignationName || ''}
          isOptionEqualToValue={(option, value) => option?.DesigId === value?.DesigId}
          value={values?.designation || null}
        />

        <RHFTextField
          name="placeOfBirth"
          label="Place of Birth"
        />

        <RHFTextField name="email" label="Email" fullWidth type="email" />
        <RHFTextField name="contactNo" label="Contact No" fullWidth />

        <RHFAutocomplete
          name="bloodGroup"
          label="Blood Group"
          options={bloodGroupOptions}
          getOptionLabel={(option) => option?.BloodGroup || ''}
          isOptionEqualToValue={(option, value) => option?.BloodGroupID === value?.BloodGroupID}
          value={values?.bloodGroup || null}
        />

        <RHFAutocomplete
          name="gradeNo"
          label="Grade No"
          options={gradeOptions}
          getOptionLabel={(option) => option?.Grade_No || ''}
          isOptionEqualToValue={(option, value) => option?.Grade_ID === value?.Grade_ID}
          value={values?.gradeNo || null}
        />

        <RHFAutocomplete
          name="jobLocation"
          label="Job Location"
          options={jobLocationOptions}
          getOptionLabel={(option) => option?.JobLocationInfo || ''}
          isOptionEqualToValue={(option, value) => option?.JobLocationInfoID === value?.JobLocationInfoID}
          value={values?.jobLocation || null}
        />

        <Box sx={{ gridColumn: { xs: '1 / -1' } }}>
          <RHFUploadBox
            name="photo"
            label="Upload Photo"
            accept={{ 'image/*': ['.jpg', '.png', '.jpeg'] }}
            onDrop={handleDrop}
          />
        </Box>
      </Box>
    </Card>
  );

  const renderAddressInformation = () => (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Address Information
      </Typography>

      <Box
        rowGap={3}
        columnGap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
        }}
        sx={{ mt: 2 }}
      >
        <Box sx={{ gridColumn: { xs: '1 / -1' } }}>
          <RHFTextField
            name="presentAddress"
            label="Present Address"
            fullWidth
            multiline
            rows={3}
          />
        </Box>

        <Box sx={{ gridColumn: { xs: '1 / -1' } }}>
          <RHFTextField
            name="permanentAddress"
            label="Permanent Address"
            fullWidth
            multiline
            rows={3}
          />
        </Box>

        <RHFTextField name="presentState" label="Present State" fullWidth key='7' />
        <RHFTextField name="permanentState" label="Permanent State" fullWidth key='8' />
        <RHFTextField name="presentZipCode" label="Present ZipCode" fullWidth key='9' />
        <RHFTextField name="permanentZipCode" label="Permanent ZipCode" fullWidth key='10' />
        <RHFTextField name="presentDistrict" label="Present District" fullWidth key='11' />
        <RHFTextField name="permanentDistrict" label="Permanent District" fullWidth key='12' />
      </Box>
    </Card>
  );

  const renderEmergencyContactIdentification = () => (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Emergency Contact Information and Key Identification
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" gutterBottom color="primary">
          Emergency Contact
        </Typography>
        <Box
          rowGap={3}
          columnGap={3}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
          sx={{ mb: 4 }}
        >
          <RHFTextField name="emergencyContactPerson" label="Emergency Contact Person" fullWidth key='15' />
          <RHFTextField name="emergencyContactNo" label="Emergency Contact No" fullWidth />
          <RHFTextField name="relation" label="Relation" fullWidth />
          <RHFTextField name="nextToKin" label="Next to Kin" fullWidth />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom color="primary">
          Identification
        </Typography>
        <Box
          rowGap={3}
          columnGap={3}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
          }}
        >
          <RHFTextField name="nid" label="NID" fullWidth />
          <Controller
            name="nidExpiryDate"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <DesktopDatePicker
                label="NID Expiry Date"
                value={field.value}
                onChange={field.onChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            )}
          />
          <RHFTextField name="insurancePolicy" label="Insurance Policy" fullWidth />
          <RHFTextField name="ntnNo" label="NTN No" fullWidth />
        </Box>
      </Box>
    </Card>
  );

  const renderOrganizationalProfile = () => (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Organizational Profile
      </Typography>

      <Box
        rowGap={3}
        columnGap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
        }}
        sx={{ mt: 2 }}
      >
        <Controller
          name="dateOfAppointment"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <DesktopDatePicker
              label="Date of Appointment"
              value={field.value}
              onChange={field.onChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          )}
        />

        <RHFAutocomplete
          name="employeeCategory"
          label="Employee Category"
          options={employeeCategoryOptions}
          getOptionLabel={(option) => option?.name || ''}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
        />

        <RHFAutocomplete
          name="staffCategory"
          label="Staff Category"
          options={staffCategoryOptions}
          getOptionLabel={(option) => option?.CategoryName || ''}
          isOptionEqualToValue={(option, value) => option?.StaffCategoryID === value?.StaffCategoryID}
        />

        <RHFAutocomplete
          name="shift"
          label="Shift"
          options={shiftOptions}
          getOptionLabel={(option) => option?.name || option?.shiftName || ''}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
        />

        <RHFTextField name="accountNo" label="Account No" fullWidth />
        <RHFTextField name="bankBranch" label="Bank / Branch" fullWidth />

        <RHFAutocomplete
          name="paymentType"
          label="Payment Type"
          options={paymentTypeOptions}
          getOptionLabel={(option) => option?.EmployeePaymentTypeName || ''}
          isOptionEqualToValue={(option, value) => option?.EmployeePaymentTypeID === value?.EmployeePaymentTypeID}
        />

        <RHFAutocomplete
          name="status"
          label="Status"
          options={statusOptions}
          getOptionLabel={(option) => option?.name || ''}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
        />
      </Box>
    </Card>
  );

  const renderNomineeDetails = () => (
    <Card sx={{ p: 3, mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Nominee Details
      </Typography>

      <Box
        rowGap={3}
        columnGap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
        }}
        sx={{ mt: 2 }}
      >
        <RHFTextField name="nomineeName" label="Nominee Name" fullWidth />

        <Controller
          name="nomineeDob"
          control={control}
          render={({ field, fieldState: { error } }) => (
            <DesktopDatePicker
              label="DOB"
              value={field.value}
              onChange={field.onChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          )}
        />

        <RHFTextField name="nomineeNid" label="NID NO" fullWidth />
        <RHFTextField name="nomineeRelationship" label="Relationship" fullWidth />

        <Box sx={{ gridColumn: { xs: '1 / -1' } }}>
          <RHFTextField
            name="nomineeAddress"
            label="Address"
            fullWidth
            multiline
            rows={3}
          />
        </Box>

        <RHFTextField name="nomineeMobileNo" label="Mobile No" fullWidth />
      </Box>
    </Card>
  );

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
          {/* Stepper */}
          <Card sx={{ p: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    error={Object.keys(errors).some(field =>
                      getStepFields(index).includes(field)
                    )}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Card>

          {/* Step Content */}
          {renderStepContent(activeStep)}

          {/* Navigation Buttons */}
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>

            <Box>
              {activeStep === steps.length - 1 ? (
                <LoadingButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  loading={isSubmitting}
                >
                  Save Employee
                </LoadingButton>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}