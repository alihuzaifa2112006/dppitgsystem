import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import FormProvider, { RHFTextField, RHFAutocomplete, RHFSwitch } from 'src/components/hook-form';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { Get, Post, Put } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fDate } from 'src/utils/format-time';

export default function FactoryForm({ currentData }) {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Sub-lists states
  const [contacts, setContacts] = useState([]);
  const [socialCertificates, setSocialCertificates] = useState([]);
  const [oekotexCertificates, setOekotexCertificates] = useState([]);

  // Option states
  const [suppliers, setSuppliers] = useState([]);
  const [continents, setContinents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [appendixes, setAppendixes] = useState([]);
  const [classTypes, setClassTypes] = useState([]);

  // Editing indices
  const [editingContactIndex, setEditingContactIndex] = useState(null);
  const [editingSocialIndex, setEditingSocialIndex] = useState(null);
  const [editingOekoIndex, setEditingOekoIndex] = useState(null);

  // Validation errors for temp fields
  const [contactErrors, setContactErrors] = useState({});
  const [socialErrors, setSocialErrors] = useState({});
  const [oekoErrors, setOekoErrors] = useState({});

  // Validation Schema
  const FactorySchema = Yup.object().shape({
    FactoryName: Yup.string().required('Factory Name is required'),
    Supplier: Yup.object().nullable().required('Linked Supplier is required'),
    ContactPerson: Yup.string().nullable(),
    Phone: Yup.string().nullable(),
    Fax: Yup.string().nullable(),
    Website: Yup.string().nullable(),
    AddressLine1: Yup.string().required('Address Line 1 is required'),
    AddressLine2: Yup.string().nullable(),
    Continent: Yup.object().nullable().required('Continent is required'),
    Country: Yup.object().nullable().required('Country is required'),
    City: Yup.object().nullable().required('City is required'),
    ZipCode: Yup.string().required('Zip Code is required'),

    // Production Setup
    ProductsCategories: Yup.string().nullable(),
    ProcessActivity: Yup.string().nullable(),
    NoOfEmployees: Yup.number().typeError('Must be a number').nullable(),
    CapacityMonth: Yup.string().nullable(),
    WeeklyOffDay: Yup.string().nullable(),
    NoOfShifts: Yup.number().typeError('Must be a number').nullable(),
    ShiftTime: Yup.string().nullable(),

    IsActive: Yup.boolean(),

    // Sub-form temp fields
    TempContactType: Yup.string().nullable(),
    TempContactName: Yup.string().nullable(),
    TempContactDesignation: Yup.string().nullable(),
    TempContactCellNo: Yup.string().nullable(),
    TempContactEmail: Yup.string().nullable(),

    TempCertType: Yup.string().nullable(),
    TempAuditInstitute: Yup.string().nullable(),
    TempCertificateNo: Yup.string().nullable(),
    TempValidFrom: Yup.string().nullable(),
    TempValidTo: Yup.string().nullable(),
    TempRating: Yup.string().nullable(),

    TempOekoTestInstitute: Yup.string().nullable(),
    TempOekoCertificateNo: Yup.string().nullable(),
    TempOekoValidFrom: Yup.string().nullable(),
    TempOekoValidTo: Yup.string().nullable(),
    TempOekoAppendix: Yup.string().nullable(),
    TempOekoClassType: Yup.string().nullable(),
  });

  const defaultValues = useMemo(
    () => ({
      FactoryName: currentData?.FactoryName || '',
      Supplier: null,
      ContactPerson: currentData?.ContactPerson || '',
      Phone: currentData?.Phone || '',
      Fax: currentData?.Fax || '',
      Website: currentData?.Website || '',
      AddressLine1: currentData?.AddressLine1 || '',
      AddressLine2: currentData?.AddressLine2 || '',
      Continent: null,
      Country: null,
      City: null,
      ZipCode: currentData?.ZipCode || currentData?.PostalCode || '',

      ProductsCategories: currentData?.ProductsCategories || '',
      ProcessActivity: currentData?.ProcessActivity || '',
      NoOfEmployees: currentData?.NoOfEmployees || null,
      CapacityMonth: currentData?.CapacityPerMonth || currentData?.CapacityMonth || '',
      WeeklyOffDay: currentData?.WeeklyOffDay || null,
      NoOfShifts: currentData?.NoOfShifts || null,
      ShiftTime: currentData?.ShiftTime || '',

      IsActive: currentData?.IsActive !== undefined ? currentData.IsActive : true,

      TempContactType: '',
      TempContactName: '',
      TempContactDesignation: '',
      TempContactCellNo: '',
      TempContactEmail: '',

      TempCertType: '',
      TempAuditInstitute: '',
      TempCertificateNo: '',
      TempValidFrom: null,
      TempValidTo: null,
      TempRating: null,

      TempOekoTestInstitute: '',
      TempOekoCertificateNo: '',
      TempOekoValidFrom: null,
      TempOekoValidTo: null,
      TempOekoAppendix: null,
      TempOekoClassType: null,
    }),
    [currentData]
  );

  const methods = useForm({
    resolver: yupResolver(FactorySchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    getValues,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const watchedValues = watch();

  // Load dropdown lists
  const fetchSuppliers = async () => {
    try {
      const res = await Get('Supplier/GetAll');
      if (res.status === 200) {
        setSuppliers(res?.data?.Data || res?.data || []);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const fetchContinents = async () => {
    try {
      const res = await Get('Continent/GetAll');
      if (res.status === 200) {
        setContinents(res?.data?.Data || res?.data || []);
      }
    } catch (err) {
      console.error('Error fetching continents:', err);
    }
  };

  const fetchWeekDays = async () => {
    try {
      const res = await Get('WeekDay/GetAll');
      if (res.status === 200) {
        const data = res?.data?.Data || res?.data || [];
        setWeekDays(data.map(d => d.Name));
      }
    } catch (err) {
      console.error('Error fetching week days:', err);
    }
  };

  const fetchRatings = async () => {
    try {
      const res = await Get('Rating/GetAll');
      if (res.status === 200) {
        const data = res?.data?.Data || res?.data || [];
        setRatings(data.map(d => d.Name));
      }
    } catch (err) {
      console.error('Error fetching ratings:', err);
    }
  };

  const fetchAppendixes = async () => {
    try {
      const res = await Get('Appendix/GetAll');
      if (res.status === 200) {
        const data = res?.data?.Data || res?.data || [];
        setAppendixes(data.map(d => d.Name));
      }
    } catch (err) {
      console.error('Error fetching appendixes:', err);
    }
  };

  const fetchClassTypes = async () => {
    try {
      const res = await Get('ClassType/GetAll');
      if (res.status === 200) {
        const data = res?.data?.Data || res?.data || [];
        setClassTypes(data.map(d => d.Name));
      }
    } catch (err) {
      console.error('Error fetching class types:', err);
    }
  };

  const getCountries = useCallback(async (continentId) => {
    try {
      const response = await Get(`Country/GetByContinent?continentId=${continentId}`);
      if (response.status === 200) {
        setCountries(response?.data?.Data || response?.data || []);
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
    }
  }, []);

  const getCities = useCallback(async (countryId) => {
    try {
      const response = await Get(`City/GetByCountry?countryId=${countryId}`);
      if (response.status === 200) {
        setCities(response?.data?.Data || response?.data || []);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
    fetchContinents();
    fetchWeekDays();
    fetchRatings();
    fetchAppendixes();
    fetchClassTypes();
  }, []);

  // Reset values when currentData changes
  useEffect(() => {
    if (currentData) {
      reset(defaultValues);
      setContacts(currentData.Contacts || []);
      setSocialCertificates(currentData.SocialCertificates || []);
      setOekotexCertificates(currentData.OekotexCertificates || []);
    }
  }, [currentData, reset, defaultValues]);

  // Bind Supplier in edit mode
  useEffect(() => {
    if (currentData?.LinkedSupplierId && suppliers.length > 0) {
      const matched = suppliers.find(
        (s) => (s.InvitationId || s.VendorID || s.Id) === currentData.LinkedSupplierId
      );
      if (matched) {
        setValue('Supplier', matched);
      }
    }
  }, [currentData, suppliers, setValue]);

  // Bind Continent in edit mode
  useEffect(() => {
    if (currentData?.ContinentId && continents.length > 0) {
      const matched = continents.find((c) => c.ContinentId === currentData.ContinentId);
      if (matched) {
        setValue('Continent', matched);
        getCountries(matched.ContinentId);
      }
    }
  }, [currentData, continents, getCountries, setValue]);

  // Bind Country in edit mode
  useEffect(() => {
    if (currentData?.CountryID && countries.length > 0) {
      const matched = countries.find((c) => (c.Country_ID || c.CountryId) === currentData.CountryID);
      if (matched) {
        setValue('Country', matched);
        getCities(matched.Country_ID || matched.CountryId);
      }
    }
  }, [currentData, countries, getCities, setValue]);

  // Bind City in edit mode
  useEffect(() => {
    if (currentData?.CityId && cities.length > 0) {
      const matched = cities.find((c) => (c.City_ID || c.CityId) === currentData.CityId);
      if (matched) {
        setValue('City', matched);
      }
    }
  }, [currentData, cities, setValue]);

  // Sub-forms handlers
  const handleSaveContact = () => {
    const type = getValues('TempContactType');
    const name = getValues('TempContactName');
    const designation = getValues('TempContactDesignation');
    const cellNo = getValues('TempContactCellNo');
    const email = getValues('TempContactEmail');

    const errors = {};
    if (!type?.trim()) errors.type = 'Contact Type is required';
    if (!name?.trim()) errors.name = 'Contact Name is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address';

    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      enqueueSnackbar('Please fill required contact fields correctly', { variant: 'error' });
      return;
    }
    setContactErrors({});

    const contactData = { ContactType: type, ContactName: name, Designation: designation, CellNo: cellNo, Email: email, id: Date.now() };

    if (editingContactIndex !== null) {
      const updated = [...contacts];
      updated[editingContactIndex] = contactData;
      setContacts(updated);
      setEditingContactIndex(null);
      enqueueSnackbar('Contact updated', { variant: 'info' });
    } else {
      setContacts([...contacts, contactData]);
      enqueueSnackbar('Contact added', { variant: 'success' });
    }

    setValue('TempContactType', '');
    setValue('TempContactName', '');
    setValue('TempContactDesignation', '');
    setValue('TempContactCellNo', '');
    setValue('TempContactEmail', '');
  };

  const handleEditContact = (index) => {
    const contact = contacts[index];
    setValue('TempContactType', contact.ContactType || '');
    setValue('TempContactName', contact.ContactName || '');
    setValue('TempContactDesignation', contact.Designation || '');
    setValue('TempContactCellNo', contact.CellNo || '');
    setValue('TempContactEmail', contact.Email || '');
    setEditingContactIndex(index);
    setContactErrors({});
  };

  const handleSaveSocialCert = () => {
    const certType = getValues('TempCertType');
    const institute = getValues('TempAuditInstitute');
    const certNo = getValues('TempCertificateNo');
    const validFromVal = getValues('TempValidFrom');
    const validToVal = getValues('TempValidTo');
    const validFrom = validFromVal ? fDate(validFromVal, 'yyyy-MM-dd') : '';
    const validTo = validToVal ? fDate(validToVal, 'yyyy-MM-dd') : '';
    const rating = getValues('TempRating');

    const errors = {};
    if (!certType?.trim()) errors.certType = 'Cert Type is required';
    if (!institute?.trim()) errors.institute = 'Audit Institute is required';
    if (!certNo?.trim()) errors.certNo = 'Certificate No is required';
    if (!validFrom) errors.validFrom = 'Valid From date is required';
    if (!validTo) errors.validTo = 'Valid To date is required';
    if (!rating) errors.rating = 'Rating is required';

    if (Object.keys(errors).length > 0) {
      setSocialErrors(errors);
      enqueueSnackbar('Please fill all required certificate fields', { variant: 'error' });
      return;
    }
    setSocialErrors({});

    const certData = { CertType: certType, AuditInstitute: institute, CertificateNo: certNo, ValidFrom: validFrom, ValidTo: validTo, Rating: rating, id: Date.now() };

    if (editingSocialIndex !== null) {
      const updated = [...socialCertificates];
      updated[editingSocialIndex] = certData;
      setSocialCertificates(updated);
      setEditingSocialIndex(null);
      enqueueSnackbar('Certificate updated', { variant: 'info' });
    } else {
      setSocialCertificates([...socialCertificates, certData]);
      enqueueSnackbar('Certificate added', { variant: 'success' });
    }

    setValue('TempCertType', '');
    setValue('TempAuditInstitute', '');
    setValue('TempCertificateNo', '');
    setValue('TempValidFrom', null);
    setValue('TempValidTo', null);
    setValue('TempRating', null);
  };

  const handleEditSocialCert = (index) => {
    const cert = socialCertificates[index];
    setValue('TempCertType', cert.CertType || '');
    setValue('TempAuditInstitute', cert.AuditInstitute || '');
    setValue('TempCertificateNo', cert.CertificateNo || '');
    setValue('TempValidFrom', cert.ValidFrom ? new Date(cert.ValidFrom) : null);
    setValue('TempValidTo', cert.ValidTo ? new Date(cert.ValidTo) : null);
    setValue('TempRating', cert.Rating || null);
    setEditingSocialIndex(index);
    setSocialErrors({});
  };

  const handleSaveOekotex = () => {
    const institute = getValues('TempOekoTestInstitute');
    const certNo = getValues('TempOekoCertificateNo');
    const validFromVal = getValues('TempOekoValidFrom');
    const validToVal = getValues('TempOekoValidTo');
    const validFrom = validFromVal ? fDate(validFromVal, 'yyyy-MM-dd') : '';
    const validTo = validToVal ? fDate(validToVal, 'yyyy-MM-dd') : '';
    const appendix = getValues('TempOekoAppendix');
    const classType = getValues('TempOekoClassType');

    const errors = {};
    if (!institute?.trim()) errors.institute = 'Test Institute is required';
    if (!certNo?.trim()) errors.certNo = 'Certificate No is required';
    if (!validFrom) errors.validFrom = 'Valid From date is required';
    if (!validTo) errors.validTo = 'Valid To date is required';
    if (!appendix) errors.appendix = 'Appendix is required';
    if (!classType) errors.classType = 'Class Type is required';

    if (Object.keys(errors).length > 0) {
      setOekoErrors(errors);
      enqueueSnackbar('Please fill all required Oekotex fields', { variant: 'error' });
      return;
    }
    setOekoErrors({});

    const oekoData = { TestInstitute: institute, CertificateNo: certNo, ValidFrom: validFrom, ValidTo: validTo, Appendix: appendix, ClassType: classType, id: Date.now() };

    if (editingOekoIndex !== null) {
      const updated = [...oekotexCertificates];
      updated[editingOekoIndex] = oekoData;
      setOekotexCertificates(updated);
      setEditingOekoIndex(null);
      enqueueSnackbar('Oekotex certificate updated', { variant: 'info' });
    } else {
      setOekotexCertificates([...oekotexCertificates, oekoData]);
      enqueueSnackbar('Oekotex certificate added', { variant: 'success' });
    }

    setValue('TempOekoTestInstitute', '');
    setValue('TempOekoCertificateNo', '');
    setValue('TempOekoValidFrom', null);
    setValue('TempOekoValidTo', null);
    setValue('TempOekoAppendix', null);
    setValue('TempOekoClassType', null);
  };

  const handleEditOekotex = (index) => {
    const oeko = oekotexCertificates[index];
    setValue('TempOekoTestInstitute', oeko.TestInstitute || '');
    setValue('TempOekoCertificateNo', oeko.CertificateNo || '');
    setValue('TempOekoValidFrom', oeko.ValidFrom ? new Date(oeko.ValidFrom) : null);
    setValue('TempOekoValidTo', oeko.ValidTo ? new Date(oeko.ValidTo) : null);
    setValue('TempOekoAppendix', oeko.Appendix || null);
    setValue('TempOekoClassType', oeko.ClassType || null);
    setEditingOekoIndex(index);
    setOekoErrors({});
  };

  // Submit Handler
  const onSubmit = handleSubmit(
    async (data) => {
      try {
        const payload = {
          FactoryName: data.FactoryName,
          LinkedSupplierId: data.Supplier?.InvitationId || data.Supplier?.VendorID || data.Supplier?.Id || 0,
          ContactPerson: data.ContactPerson || '',
          Phone: data.Phone || '',
          Fax: data.Fax || '',
          Website: data.Website || '',
          AddressLine1: data.AddressLine1,
          AddressLine2: data.AddressLine2 || '',
          ContinentId: data.Continent?.ContinentId || 0,
          CountryID: data.Country?.Country_ID || data.Country?.CountryId || 0,
          CityId: data.City?.City_ID || data.City?.CityId || 0,
          ZipCode: data.ZipCode,

          // Production Setup
          ProductsCategories: data.ProductsCategories || '',
          ProcessActivity: data.ProcessActivity || '',
          NoOfEmployees: data.NoOfEmployees ? data.NoOfEmployees.toString() : "0",
          CapacityPerMonth: data.CapacityMonth || '',
          WeeklyOffDay: data.WeeklyOffDay || '',
          NoOfShifts: data.NoOfShifts ? data.NoOfShifts.toString() : "0",
          ShiftTime: data.ShiftTime || '',

          IsWPF: currentData?.IsWPF || false,
          IsGlobalFactory: currentData?.IsGlobalFactory || false,
          IsActive: !!data.IsActive,

          // Nested lists
          Contacts: contacts.map(c => ({
            ContactType: c.ContactType,
            ContactName: c.ContactName,
            Designation: c.Designation || '',
            CellNo: c.CellNo || '',
            Email: c.Email || '',
          })),
          SocialCertificates: socialCertificates.map(s => ({
            CertType: s.CertType,
            AuditInstitute: s.AuditInstitute || '',
            CertificateNo: s.CertificateNo || '',
            ValidFrom: s.ValidFrom || '',
            ValidTo: s.ValidTo || '',
            Rating: s.Rating || '',
          })),
          OekotexCertificates: oekotexCertificates.map(o => ({
            TestInstitute: o.TestInstitute,
            CertificateNo: o.CertificateNo,
            ValidFrom: o.ValidFrom || '',
            ValidTo: o.ValidTo || '',
            Appendix: o.Appendix || '',
            ClassType: o.ClassType || '',
          }))
        };

        let response;
        if (currentData) {
          payload.FactoryId = currentData?.FactoryId || currentData?.Id || 0;
          response = await Put('Factory/Update', payload);
        } else {
          response = await Post('Factory/Create', payload);
        }

        if (response.status === 200 || response.status === 201) {
          enqueueSnackbar(currentData ? 'Factory updated successfully!' : 'Factory created successfully!', { variant: 'success' });
          navigate(paths.dashboard.Powertool.Factory.root);
        } else {
          enqueueSnackbar(response?.data?.Message || 'Something went wrong', { variant: 'error' });
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(error?.response?.data?.Message || 'Error saving Factory', { variant: 'error' });
      }
    },
    (errors) => {
      const errorMessages = Object.values(errors).map((err) => err.message);
      if (errorMessages.length > 0) {
        enqueueSnackbar(errorMessages[0], { variant: 'error' });
      }
    }
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={currentData ? 'Edit Factory' : 'Create a new Factory'}
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Factories List', href: paths.dashboard.Powertool.Factory.root },
          { name: currentData ? 'Edit Factory' : 'New Factory' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {/* Form Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:home-smile-angle-bold" width={24} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {watchedValues?.FactoryName || 'New Factory'}
              </Typography>

            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              Factory Status:
            </Typography>
            <RadioGroup
              row
              value={watchedValues?.IsActive ? 'true' : 'false'}
              onChange={(e) => setValue('IsActive', e.target.value === 'true')}
            >
              <FormControlLabel value="true" control={<Radio color="primary" />} label="Active" />
              <FormControlLabel value="false" control={<Radio color="error" />} label="Inactive" />
            </RadioGroup>
          </Stack>
        </Stack>

        <Stack spacing={4}>
          {/* Card 1: Factory Information */}
          <Card sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
              <Iconify icon="solar:home-smile-angle-bold" width={24} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Factory Information
              </Typography>
            </Stack>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <RHFTextField name="FactoryName" label="FACTORY NAME *" placeholder="Agami Apparels Limited" />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFAutocomplete
                  name="Supplier"
                  label="LINKED SUPPLIER  *"
                  placeholder="Select linked supplier"
                  options={suppliers}
                  getOptionLabel={(option) => option?.SupplierName || ''}
                  isOptionEqualToValue={(option, value) =>
                    (option?.InvitationId || option?.VendorID || option?.Id) === (value?.InvitationId || value?.VendorID || value?.Id)
                  }
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFTextField name="ContactPerson" label="CONTACT PERSON" placeholder="Enter contact person" />
              </Grid>

              <Grid item xs={12} md={4}>
                <RHFTextField name="Phone" label="PHONE" placeholder="Enter phone number" />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFTextField name="Fax" label="FAX" placeholder="Enter fax" />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFTextField name="Website" label="WEBSITE" placeholder="e.g. www.agami.com" />
              </Grid>

              <Grid item xs={12} md={6}>
                <RHFTextField name="AddressLine1" label="ADDRESS LINE 1 *" placeholder="Street address" />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="AddressLine2" label="ADDRESS LINE 2" placeholder="Suite, unit, building" />
              </Grid>

              <Grid item xs={12} md={3}>
                <RHFAutocomplete
                  name="Continent"
                  label="CONTINENT *"
                  placeholder="Select Continent"
                  options={continents}
                  getOptionLabel={(option) => option?.Name || ''}
                  isOptionEqualToValue={(option, value) => option?.ContinentId === value?.ContinentId}
                  onchange={(newValue) => {
                    setValue('Country', null);
                    setValue('City', null);
                    setCities([]);
                    if (newValue) {
                      getCountries(newValue.ContinentId);
                    } else {
                      setCountries([]);
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <RHFAutocomplete
                  name="Country"
                  label="COUNTRY *"
                  placeholder="Select Country"
                  options={countries}
                  getOptionLabel={(option) => option?.Country_Name || ''}
                  isOptionEqualToValue={(option, value) => (option?.Country_ID || option?.CountryId) === (value?.Country_ID || value?.CountryId)}
                  onchange={(newValue) => {
                    setValue('City', null);
                    if (newValue) {
                      getCities(newValue.Country_ID || newValue.CountryId);
                    } else {
                      setCities([]);
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <RHFAutocomplete
                  name="City"
                  label="CITY *"
                  placeholder="Select City"
                  options={cities}
                  getOptionLabel={(option) => option?.Name || option?.City_Name || ''}
                  isOptionEqualToValue={(option, value) => (option?.City_ID || option?.CityId) === (value?.City_ID || value?.CityId)}
                  disabled={!watchedValues.Country}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <RHFTextField name="ZipCode" label="ZIP CODE *" placeholder="Zip code" />
              </Grid>
            </Grid>
          </Card>

          {/* Card 2: Production Setup */}
          <Card sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
              <Iconify icon="solar:settings-bold-duotone" width={24} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Production Setup
              </Typography>
            </Stack>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <RHFTextField name="ProductsCategories" label="PRODUCTS / CATEGORIES" placeholder="e.g. Woven shirts" />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="ProcessActivity" label="PROCESS & ACTIVITY" placeholder="e.g. Cutting, sewing" />
              </Grid>

              <Grid item xs={12} md={3}>
                <RHFTextField name="NoOfEmployees" label="NO. OF EMPLOYEES" type="number" placeholder="e.g. 350" />
              </Grid>
              <Grid item xs={12} md={3}>
                <RHFTextField name="CapacityMonth" label="CAPACITY / MONTH" placeholder="e.g. 50000 pcs" />
              </Grid>
              <Grid item xs={12} md={3}>
                <RHFAutocomplete
                  name="WeeklyOffDay"
                  label="WEEKLY OFF DAY"
                  placeholder="Select day"
                  options={weekDays}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <RHFTextField name="NoOfShifts" label="NO. OF SHIFTS" type="number" placeholder="e.g. 2" />
              </Grid>

              <Grid item xs={12} md={6}>
                <RHFTextField name="ShiftTime" label="SHIFT TIME" placeholder="e.g. 08:00 AM - 05:00 PM" />
              </Grid>
            </Grid>
          </Card>

          {/* Card 3: Personnel / Contacts */}
          <Card sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
              <Iconify icon="solar:users-group-two-rounded-bold" width={24} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Personnel / Contacts
              </Typography>
            </Stack>

            {/* Always visible form fields (directly on Card body) */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} md={2.4}>
                <RHFTextField
                  name="TempContactType"
                  label="CONTACT TYPE *"
                  placeholder="e.g. Production"
                  error={!!contactErrors.type}
                  helperText={contactErrors.type}
                />
              </Grid>
              <Grid item xs={12} md={2.4}>
                <RHFTextField
                  name="TempContactName"
                  label="CONTACT NAME *"
                  placeholder="Enter name"
                  error={!!contactErrors.name}
                  helperText={contactErrors.name}
                />
              </Grid>
              <Grid item xs={12} md={2.4}>
                <RHFTextField name="TempContactDesignation" label="DESIGNATION" placeholder="Enter designation" />
              </Grid>
              <Grid item xs={12} md={2.4}>
                <RHFTextField name="TempContactCellNo" label="CELL NO" placeholder="Enter cell no" />
              </Grid>
              <Grid item xs={12} md={2.4}>
                <RHFTextField
                  name="TempContactEmail"
                  label="EMAIL"
                  placeholder="Enter email"
                  error={!!contactErrors.email}
                  helperText={contactErrors.email}
                />
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mb: 3 }}>
              {editingContactIndex !== null && (
                <Button size="small" variant="text" color="inherit" onClick={() => {
                  setEditingContactIndex(null);
                  setValue('TempContactType', '');
                  setValue('TempContactName', '');
                  setValue('TempContactDesignation', '');
                  setValue('TempContactCellNo', '');
                  setValue('TempContactEmail', '');
                  setContactErrors({});
                }}>
                  Cancel Edit
                </Button>
              )}
              <Button size="small" variant="contained" color="primary" onClick={handleSaveContact}>
                {editingContactIndex !== null ? 'Update Contact' : 'Add Contact'}
              </Button>
            </Stack>

            {/* ONLY render table if there is data */}
            {contacts.length > 0 && (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'background.neutral' }}>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Designation</TableCell>
                      <TableCell>Cell No</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contacts.map((row, index) => (
                      <TableRow key={row.id || index} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{row.ContactType || '-'}</TableCell>
                        <TableCell>{row.ContactName || '-'}</TableCell>
                        <TableCell>{row.Designation || '-'}</TableCell>
                        <TableCell>{row.CellNo || '-'}</TableCell>
                        <TableCell>{row.Email || '-'}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Edit">
                              <IconButton size="small" color="primary" onClick={() => handleEditContact(index)}>
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => {
                                setContacts(contacts.filter((_, i) => i !== index));
                                if (editingContactIndex === index) {
                                  setEditingContactIndex(null);
                                  setValue('TempContactType', '');
                                  setValue('TempContactName', '');
                                  setValue('TempContactDesignation', '');
                                  setValue('TempContactCellNo', '');
                                  setValue('TempContactEmail', '');
                                }
                              }}>
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>

          {/* Card 4: Social Compliance Certificates */}
          <Card sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
              <Iconify icon="solar:shield-check-bold" width={24} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Social Compliance Certificates
              </Typography>
            </Stack>

            {/* Always visible form fields (directly on Card body) */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} md={2}>
                <RHFTextField
                  name="TempCertType"
                  label="CERT TYPE *"
                  placeholder="e.g. BSCI"
                  error={!!socialErrors.certType}
                  helperText={socialErrors.certType}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <RHFTextField
                  name="TempAuditInstitute"
                  label="AUDIT INSTITUTE *"
                  placeholder="Enter institute"
                  error={!!socialErrors.institute}
                  helperText={socialErrors.institute}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <RHFTextField
                  name="TempCertificateNo"
                  label="CERTIFICATE NO *"
                  placeholder="Enter cert number"
                  error={!!socialErrors.certNo}
                  helperText={socialErrors.certNo}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Controller
                  name="TempValidFrom"
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="VALID FROM *"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!socialErrors.validFrom,
                          helperText: socialErrors.validFrom,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Controller
                  name="TempValidTo"
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="VALID TO *"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!socialErrors.validTo,
                          helperText: socialErrors.validTo,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <RHFAutocomplete
                  name="TempRating"
                  label="RATING *"
                  placeholder="Select rating"
                  options={ratings}
                  error={!!socialErrors.rating}
                  helperText={socialErrors.rating}
                />
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mb: 3 }}>
              {editingSocialIndex !== null && (
                <Button size="small" variant="text" color="inherit" onClick={() => {
                  setEditingSocialIndex(null);
                  setValue('TempCertType', '');
                  setValue('TempAuditInstitute', '');
                  setValue('TempCertificateNo', '');
                  setValue('TempValidFrom', '');
                  setValue('TempValidTo', '');
                  setValue('TempRating', null);
                  setSocialErrors({});
                }}>
                  Cancel Edit
                </Button>
              )}
              <Button size="small" variant="contained" color="primary" onClick={handleSaveSocialCert}>
                {editingSocialIndex !== null ? 'Update Certificate' : 'Add Certificate'}
              </Button>
            </Stack>

            {/* ONLY render table if there is data */}
            {socialCertificates.length > 0 && (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'background.neutral' }}>
                    <TableRow>
                      <TableCell>Cert Type</TableCell>
                      <TableCell>Audit Institute</TableCell>
                      <TableCell>Certificate No</TableCell>
                      <TableCell>Validity</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {socialCertificates.map((row, index) => (
                      <TableRow key={row.id || index} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{row.CertType || '-'}</TableCell>
                        <TableCell>{row.AuditInstitute || '-'}</TableCell>
                        <TableCell>{row.CertificateNo || '-'}</TableCell>
                        <TableCell>{row.ValidFrom && row.ValidTo ? `${row.ValidFrom} ➔ ${row.ValidTo}` : '-'}</TableCell>
                        <TableCell>{row.Rating ? `Rating: ${row.Rating}` : '-'}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Edit">
                              <IconButton size="small" color="primary" onClick={() => handleEditSocialCert(index)}>
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => {
                                setSocialCertificates(socialCertificates.filter((_, i) => i !== index));
                                if (editingSocialIndex === index) {
                                  setEditingSocialIndex(null);
                                  setValue('TempCertType', '');
                                  setValue('TempAuditInstitute', '');
                                  setValue('TempCertificateNo', '');
                                  setValue('TempValidFrom', '');
                                  setValue('TempValidTo', '');
                                  setValue('TempRating', null);
                                }
                              }}>
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>

          {/* Card 5: Oekotex Certificate */}
          <Card sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
              <Iconify icon="solar:medal-bold" width={24} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Oekotex Certificate
              </Typography>
            </Stack>

            {/* Always visible form fields (directly on Card body) */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid item xs={12} md={2}>
                <RHFTextField
                  name="TempOekoTestInstitute"
                  label="TEST INSTITUTE *"
                  placeholder="Enter institute"
                  error={!!oekoErrors.institute}
                  helperText={oekoErrors.institute}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <RHFTextField
                  name="TempOekoCertificateNo"
                  label="CERTIFICATE NO *"
                  placeholder="Enter cert number"
                  error={!!oekoErrors.certNo}
                  helperText={oekoErrors.certNo}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Controller
                  name="TempOekoValidFrom"
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="VALID FROM *"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!oekoErrors.validFrom,
                          helperText: oekoErrors.validFrom,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Controller
                  name="TempOekoValidTo"
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="VALID TO *"
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!oekoErrors.validTo,
                          helperText: oekoErrors.validTo,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <RHFAutocomplete
                  name="TempOekoAppendix"
                  label="APPENDIX *"
                  placeholder="Select appendix"
                  options={appendixes}
                  error={!!oekoErrors.appendix}
                  helperText={oekoErrors.appendix}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <RHFAutocomplete
                  name="TempOekoClassType"
                  label="CLASS TYPE *"
                  placeholder="Select class type"
                  options={classTypes}
                  error={!!oekoErrors.classType}
                  helperText={oekoErrors.classType}
                />
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mb: 3 }}>
              {editingOekoIndex !== null && (
                <Button size="small" variant="text" color="inherit" onClick={() => {
                  setEditingOekoIndex(null);
                  setValue('TempOekoTestInstitute', '');
                  setValue('TempOekoCertificateNo', '');
                  setValue('TempOekoValidFrom', '');
                  setValue('TempOekoValidTo', '');
                  setValue('TempOekoAppendix', null);
                  setValue('TempOekoClassType', null);
                  setOekoErrors({});
                }}>
                  Cancel Edit
                </Button>
              )}
              <Button size="small" variant="contained" color="primary" onClick={handleSaveOekotex}>
                {editingOekoIndex !== null ? 'Update Certificate' : 'Add Certificate'}
              </Button>
            </Stack>

            {/* ONLY render table if there is data */}
            {oekotexCertificates.length > 0 && (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'background.neutral' }}>
                    <TableRow>
                      <TableCell>Test Institute</TableCell>
                      <TableCell>Certificate No</TableCell>
                      <TableCell>Validity</TableCell>
                      <TableCell>Appendix</TableCell>
                      <TableCell>Class Type</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {oekotexCertificates.map((row, index) => (
                      <TableRow key={row.id || index} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{row.TestInstitute || '-'}</TableCell>
                        <TableCell>{row.CertificateNo || '-'}</TableCell>
                        <TableCell>{row.ValidFrom && row.ValidTo ? `${row.ValidFrom} ➔ ${row.ValidTo}` : '-'}</TableCell>
                        <TableCell>{row.Appendix || '-'}</TableCell>
                        <TableCell>{row.ClassType || '-'}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Edit">
                              <IconButton size="small" color="primary" onClick={() => handleEditOekotex(index)}>
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => {
                                setOekotexCertificates(oekotexCertificates.filter((_, i) => i !== index));
                                if (editingOekoIndex === index) {
                                  setEditingOekoIndex(null);
                                  setValue('TempOekoTestInstitute', '');
                                  setValue('TempOekoCertificateNo', '');
                                  setValue('TempOekoValidFrom', '');
                                  setValue('TempOekoValidTo', '');
                                  setValue('TempOekoAppendix', null);
                                  setValue('TempOekoClassType', null);
                                }
                              }}>
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>

          {/* Bottom helper text and actions */}
          <Stack spacing={3}>


            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ pt: 2 }}>
              <Button variant="outlined" color="inherit" onClick={() => navigate(paths.dashboard.Powertool.Factory.root)}>
                Cancel
              </Button>
              <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
                {currentData ? 'Save Changes' : 'Save'}
              </LoadingButton>
            </Stack>
          </Stack>
        </Stack>
      </FormProvider>
    </Container>
  );
}

FactoryForm.propTypes = {
  currentData: PropTypes.object,
};
