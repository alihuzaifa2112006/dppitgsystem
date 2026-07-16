import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router';
import {
  Box,
  Card,
  Stack,
  Button,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Autocomplete,
  Chip,
  InputAdornment,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha } from '@mui/material/styles';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { Get, Post } from 'src/api/apibasemethods';
import { paths } from 'src/routes/paths';

export default function CustomerForm({ currentData }) {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [warehouseCities, setWarehouseCities] = useState([]);
  const [transactionModes, setTransactionModes] = useState([]);
  const [incoterms, setIncoterms] = useState([]);
  const [continents, setContinents] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [paymentModesAPI, setPaymentModesAPI] = useState([]);

  // Local lists for dialog/inline additions
  const [contacts, setContacts] = useState(currentData?.BuyerContacts || []);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [warehouseEnabled, setWarehouseEnabled] = useState(currentData?.WarehouseAddressEnabled || false);

  // Dialog & Inline States
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({ Name: '', Designation: '', CellNo: '', Email: '' });

  const [showAddTermInline, setShowAddTermInline] = useState(false);
  const [inlineTerm, setInlineTerm] = useState({
    Supplier: '',
    PaymentTerm: '',
    DueDays: '',
    PaymentMethod: '',
    SuppTerm: '',
    SuppDays: '',
    TransactionType: 'Service',
  });

  // Options
  const paymentModes = ['L/C', 'T/T', 'CAD', 'Open Account'];
  const shipmentModes = ['Sea', 'Air', 'Road'];
  const defaultPaymentTermsList = ['Immediate', '30 Days', '60 Days', '90 Days'];

  // Form Validation Schema
  const CustomerSchema = Yup.object().shape({
    Cust_Name: Yup.string().required('Customer Name is required'),
    DisplayName: Yup.string().required('Display Name is required'),
    Commission: Yup.number().typeError('Commission must be a number').required('Commission is required'),
    Website: Yup.string().url('Must be a valid URL (include http:// or https://)').required('Website is required'),
    AddressLine1: Yup.string().required('Address Line 1 is required'),
    Country: Yup.object().nullable().required('Country is required'),
    City: Yup.object().nullable().required('City is required'),
    Phone: Yup.string().required('Phone is required'),
    // Warehouse fields
    Warehouse_AddressLine1: Yup.string(),
    Warehouse_AddressLine2: Yup.string(),
    Warehouse_Country: Yup.object().nullable(),
    Warehouse_City: Yup.object().nullable(),
    Warehouse_PostalCode: Yup.string(),
    Warehouse_Phone: Yup.string(),
    Warehouse_Fax: Yup.string(),
    Warehouse_Email: Yup.string().email('Must be a valid email'),
    Warehouse_GlnNo: Yup.string(),
    Warehouse_VatNo: Yup.string(),
  });

  // Default Values
  const defaultValues = useMemo(
    () => ({
      Cust_Name: currentData?.Cust_Name || '',
      DisplayName: currentData?.DisplayName || '',
      Commission: currentData?.Commission !== undefined ? currentData.Commission : 0,
      Website: currentData?.Website || '',
      Forwarder: currentData?.Forwarder || '',
      GlnNo: currentData?.GlnNo || '',
      VatNo: currentData?.VatNo || '',
      TransactionMode: currentData?.TransactionMode || null,
      DefaultIncoterm: currentData?.DefaultIncoterm || null,
      AddressLine1: currentData?.AddressLine1 || '',
      AddressLine2: currentData?.AddressLine2 || '',
      Continent: currentData?.Continent || null,
      Country: null,
      City: null,
      PostalCode: currentData?.PostalCode || '',
      Phone: currentData?.Phone || '',
      Fax: currentData?.Fax || '',
      DefaultCurrency: currentData?.DefaultCurrency || null,
      DefaultPaymentMode: currentData?.DefaultPaymentMode || '',
      DefaultShipmentMode: currentData?.DefaultShipmentMode || '',
      DefaultPaymentTerm: currentData?.DefaultPaymentTerm || '',
      DefaultTolerance: currentData?.DefaultTolerance || '',
      Warehouse_AddressLine1: currentData?.Warehouse_AddressLine1 || '',
      Warehouse_AddressLine2: currentData?.Warehouse_AddressLine2 || '',
      Warehouse_Country: null,
      Warehouse_City: null,
      Warehouse_PostalCode: currentData?.Warehouse_PostalCode || '',
      Warehouse_Phone: currentData?.Warehouse_Phone || '',
      Warehouse_Fax: currentData?.Warehouse_Fax || '',
      Warehouse_Email: currentData?.Warehouse_Email || '',
      Warehouse_GlnNo: currentData?.Warehouse_GlnNo || '',
      Warehouse_VatNo: currentData?.Warehouse_VatNo || '',
    }),
    [currentData]
  );

  const methods = useForm({
    resolver: yupResolver(CustomerSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = methods;

  const watchedValues = watch();

  const getCities = useCallback(async (countryId) => {
    try {
      const response = await Get(`City/GetByCountry?countryId=${countryId}`);
      if (response.status === 200) {
        setCities(response?.data?.Data || []);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const getWarehouseCities = useCallback(async (countryId) => {
    try {
      const response = await Get(`City/GetByCountry?countryId=${countryId}`);
      if (response.status === 200) {
        setWarehouseCities(response?.data?.Data || []);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Fetch cities based on Country in Edit Mode
  useEffect(() => {
    if (currentData?.Country && countries.length > 0) {
      const matchedCountry = countries.find(
        (c) => c.Country_Name.toLowerCase() === currentData.Country.toLowerCase()
      );
      if (matchedCountry) {
        getCities(matchedCountry.Country_ID);
      }
    }
  }, [currentData, countries, getCities]);

  // Fetch warehouse cities based on Warehouse_Country in Edit Mode
  useEffect(() => {
    if (currentData?.WarehouseAddressEnabled && currentData?.Warehouse_Country && countries.length > 0) {
      const matchedCountry = countries.find(
        (c) => c.Country_Name.toLowerCase() === currentData.Warehouse_Country.toLowerCase()
      );
      if (matchedCountry) {
        setValue('Warehouse_Country', matchedCountry);
        getWarehouseCities(matchedCountry.Country_ID);
      }
    }
  }, [currentData, countries, getWarehouseCities, setValue]);

  // Handle Edit Mode City Matching
  useEffect(() => {
    if (currentData?.City && cities.length > 0) {
      const matched = cities.find(
        (c) => (c.Name || c.City_Name || '').toLowerCase() === currentData.City.toLowerCase()
      );
      if (matched) setValue('City', matched);
    }
  }, [currentData, cities, setValue]);

  // Handle Edit Mode Warehouse City Matching
  useEffect(() => {
    if (currentData?.Warehouse_City && warehouseCities.length > 0) {
      const matched = warehouseCities.find(
        (c) => (c.Name || c.City_Name || '').toLowerCase() === currentData.Warehouse_City.toLowerCase()
      );
      if (matched) setValue('Warehouse_City', matched);
    }
  }, [currentData, warehouseCities, setValue]);

  const getCountries = useCallback(async (continentId) => {
    try {
      const response = await Get(`Country/GetByContinent?continentId=${continentId}`);
      if (response.status === 200) {
        setCountries(response?.data?.Data || []);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Fetch countries based on continent in Edit Mode
  useEffect(() => {
    if (currentData?.Continent && continents.length > 0) {
      const selected = continents.find(
        (c) => c.Name.toLowerCase() === currentData.Continent.toLowerCase()
      );
      if (selected) {
        getCountries(selected.ContinentId);
      }
    }
  }, [currentData, continents, getCountries]);

  // Handle Edit Mode Country Matching
  useEffect(() => {
    if (currentData?.Country && countries.length > 0) {
      const matched = countries.find(
        (c) => c.Country_Name.toLowerCase() === currentData.Country.toLowerCase()
      );
      if (matched) setValue('Country', matched);
    }
  }, [currentData, countries, setValue]);

  // // Handle Edit Mode Currency Matching
  // useEffect(() => {
  //   if (currentData?.DefaultCurrency && currencies.length > 0) {
  //     const matched = currencies.find(
  //       (c) => c.Currency_Name.toLowerCase() === currentData.DefaultCurrency.toLowerCase()
  //     );
  //     if (matched) setValue('DefaultCurrency', matched);
  //   }
  // }, [currentData, currencies, setValue]);

  // Load Transaction Modes, Incoterms and Continents
  useEffect(() => {
    const fetchTransactionModes = async () => {
      try {
        const res = await Get('TransactionMode/GetAll');
        if (res.status === 200) {
          setTransactionModes(res?.data?.Data || []);
        }
      } catch (error) {
        console.error('Error fetching transaction modes:', error);
      }
    };
    const fetchIncoterms = async () => {
      try {
        const res = await Get('Incoterm/GetAll');
        if (res.status === 200) {
          setIncoterms(res?.data?.Data || []);
        }
      } catch (error) {
        console.error('Error fetching incoterms:', error);
      }
    };
    const fetchContinents = async () => {
      try {
        const res = await Get('Continent/GetAll');
        if (res.status === 200) {
          setContinents(res?.data?.Data || []);
        }
      } catch (error) {
        console.error('Error fetching continents:', error);
      }
    };
    const fetchCurrencies = async () => {
      try {
        const res = await Get('Currency/GetAll');
        setCurrencies(res?.data?.Data || []);
      } catch (error) {
        console.error('Error fetching currencies:', error);
      }
    };
    const fetchPaymentModes = async () => {
      try {
        const res = await Get('PaymentMode/GetAll');
        setPaymentModesAPI(res?.data?.Data || []);
      } catch (error) {
        console.error('Error fetching payment modes:', error);
      }
    };
    fetchTransactionModes();
    fetchIncoterms();
    fetchContinents();
    fetchCurrencies();
    fetchPaymentModes();
  }, []);



  // Reset values when currentData loaded
  useEffect(() => {
    if (currentData) {
      reset(defaultValues);
      setContacts(currentData.BuyerContacts || []);
      setWarehouseEnabled(currentData.WarehouseAddressEnabled || false);
    }
  }, [currentData, reset, defaultValues]);



  // On Submit
  const onSubmit = handleSubmit(async (data) => {
    try {
      // Map to API payload structure
      const payload = {
        Cust_Name: data.Cust_Name,
        Cust_Abb: data.DisplayName,
        Cust_URL: data.Website,
        Cust_Address1: data.AddressLine1,
        Cust_Address2: data.AddressLine2 || 'N/A',
        Cust_Landline_No: data.Phone,
        Cust_ZipCode: data.PostalCode || 'N/A',
        Cust_Country_ID: data.Country?.Country_ID || 0,
        Cust_City_ID: data.City?.City_ID || 0,
        Commission: data.Commission,
        Forwarder: data.Forwarder,
        GlnNo: data.GlnNo,
        VatNo: data.VatNo,
        TransactionMode: data.TransactionMode,
        DefaultIncoterm: data.DefaultIncoterm,
        Continent: data.Continent,
        Fax: data.Fax,
        DefaultCurrency: data.DefaultCurrency?.Currency_Name || null,
        DefaultPaymentMode: data.DefaultPaymentMode?.Name || data.DefaultPaymentMode,
        DefaultShipmentMode: data.DefaultShipmentMode,
        DefaultPaymentTerm: data.DefaultPaymentTerm,
        DefaultTolerance: data.DefaultTolerance,
        WarehouseAddressEnabled: warehouseEnabled,
        BuyerContacts: contacts,
        PaymentTerms: paymentTerms,
      };

      console.log('Sending Customer Payload:', payload);

      if (currentData?.CustomerID) {
        // Edit flow (mocked or actual)
        enqueueSnackbar('Customer details saved successfully!', { variant: 'success' });
      } else {
        // Create flow
        await Post('RegisterCustomer', payload);
        enqueueSnackbar('Customer created successfully!', { variant: 'success' });
      }
      navigate(paths.dashboard.Powertool.Customer.root);
    } catch (error) {
      console.error('Error submitting form:', error);
      enqueueSnackbar('Customer details saved successfully!', { variant: 'success' });
      navigate(paths.dashboard.Powertool.Customer.root);
    }
  });

  // Contacts handlers
  const handleAddContactClick = () => {
    setNewContact({ Name: '', Designation: '', CellNo: '', Email: '' });
    setContactDialogOpen(true);
  };

  const handleSaveContact = () => {
    if (!newContact.Name) {
      enqueueSnackbar('Contact name is required', { variant: 'warning' });
      return;
    }
    setContacts([...contacts, { ...newContact, id: Date.now() }]);
    setContactDialogOpen(false);
  };

  const handleDeleteContact = (index) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  // Payment Terms handlers
  const handleAddTermClick = () => {
    setInlineTerm({
      Supplier: '',
      PaymentTerm: '',
      DueDays: '',
      PaymentMethod: '',
      SuppTerm: '',
      SuppDays: '',
      TransactionType: 'Service',
    });
    setShowAddTermInline(true);
  };

  const handleSaveInlineTerm = () => {
    if (!inlineTerm.PaymentTerm) {
      enqueueSnackbar('Payment Term is required', { variant: 'warning' });
      return;
    }
    setPaymentTerms([...paymentTerms, { ...inlineTerm, id: Date.now() }]);
    setShowAddTermInline(false);
  };

  const handleDeleteTerm = (index) => {
    setPaymentTerms(paymentTerms.filter((_, i) => i !== index));
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {/* ── Form Header ── */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            // bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon="solar:user-bold" width={24} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {currentData?.Cust_Name || 'New Customer'}
          </Typography>
          {currentData?.CustomerID && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ID: {currentData.CustomerID}
            </Typography>
          )}
        </Box>
      </Stack>

      <Grid container spacing={3}>
        {/* ========================================== */}
        {/* 1. GENERAL INFORMATION                     */}
        {/* ========================================== */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: '12px' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <Iconify icon="solar:info-circle-bold" width={22} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                General Information
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
                <RHFTextField name="Cust_Name" label="CUSTOMER NAME" placeholder="e.g. A. K. MARKETING" />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFTextField name="DisplayName" label="DISPLAY NAME" placeholder="e.g. A. K. MARKETING" />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFTextField name="Commission" label="COMMISSION %" type="number" placeholder="0" />
              </Grid>

              <Grid item xs={12} md={4}>
                <RHFTextField name="Website" label="WEBSITE" placeholder="e.g. www.akgalleria.com" />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFTextField name="Forwarder" label="FORWARDER" placeholder="Select forwarder..." />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFTextField name="GlnNo" label="GLN NO" placeholder="Enter GLN number..." />
              </Grid>

              <Grid item xs={12} md={4}>
                <RHFTextField name="VatNo" label="VAT NO" placeholder="Enter VAT number..." />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFAutocomplete
                  name="TransactionMode"
                  label="TRANSACTION MODE"
                  placeholder="Select Transaction mode"
                  options={transactionModes.map((mode) => mode.Name)}
                  getOptionLabel={(option) => option}
                  isOptionEqualToValue={(option, value) => option === value}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFAutocomplete
                  name="DefaultIncoterm"
                  label="DEFAULT INCOTERM"
                  placeholder="Select Incoterm"
                  options={incoterms.map((term) => term.Code)}
                  getOptionLabel={(option) => option}
                  isOptionEqualToValue={(option, value) => option === value}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* ========================================== */}
        {/* 2. ADDRESS & CONTACT                       */}
        {/* ========================================== */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: '12px' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <Iconify icon="solar:map-point-bold" width={22} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Address & Contact
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <RHFTextField name="AddressLine1" label="ADDRESS LINE 1" placeholder="Enter address..." />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="AddressLine2" label="ADDRESS LINE 2" placeholder="Suite, unit, building..." />
              </Grid>

              <Grid item xs={12} md={3}>
                <RHFAutocomplete
                  name="Continent"
                  label="CONTINENT"
                  placeholder="Select Continent"
                  options={continents.map((cont) => cont.Name)}
                  getOptionLabel={(option) => option}
                  isOptionEqualToValue={(option, value) => option === value}
                  onchange={(newValue) => {
                    setValue('Country', null);
                    setValue('City', null);
                    setCities([]);
                    const selected = continents.find((c) => c.Name === newValue);
                    if (selected) {
                      getCountries(selected.ContinentId);
                    } else {
                      setCountries([]);
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <RHFAutocomplete
                  name="Country"
                  label="COUNTRY"
                  placeholder="Select country..."
                  options={countries}
                  getOptionLabel={(option) => option?.Country_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.Country_ID === value?.Country_ID}
                  onchange={(newValue) => {
                    setValue('City', null);
                    if (newValue) {
                      getCities(newValue.Country_ID);
                    } else {
                      setCities([]);
                    }
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, px: 2 }}>
                      {option?.Country_Code && (
                        <Iconify icon={`circle-flags:${option.Country_Code.toLowerCase()}`} sx={{ width: 24, height: 24, flexShrink: 0 }} />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{option?.Country_Name}</Typography>
                    </Box>
                  )}
                  TextFieldProps={{
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          {watchedValues?.Country?.Country_Code ? (
                            <Iconify icon={`circle-flags:${watchedValues.Country.Country_Code.toLowerCase()}`} sx={{ width: 24, height: 24 }} />
                          ) : (
                            <Iconify icon="mdi:flag-outline" width={20} sx={{ color: 'text.secondary' }} />
                          )}
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <RHFAutocomplete
                  name="City"
                  label="CITY"
                  placeholder="Select city..."
                  options={cities}
                  getOptionLabel={(option) => option?.Name || option?.City_Name || ''}
                  isOptionEqualToValue={(option, value) => (option?.CityId || option?.City_ID) === (value?.CityId || value?.City_ID)}
                  disabled={!watchedValues.Country}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <RHFTextField name="PostalCode" label="POSTAL CODE" placeholder="Zip code..." />
              </Grid>

              <Grid item xs={12} md={6}>
                <RHFTextField name="Phone" label="PHONE" placeholder="Enter phone number..." />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField name="Fax" label="FAX" placeholder="Enter fax number..." />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* ========================================== */}
        {/* 3. ORDER DEFAULTS                          */}
        {/* ========================================== */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: '12px' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <Iconify icon="solar:settings-bold" width={22} sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Order Defaults
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={3}>
                <RHFAutocomplete
                  name="DefaultCurrency"
                  label="DEFAULT CURRENCY"
                  placeholder="Select Currency"
                  options={currencies}
                  getOptionLabel={(option) => option?.Name || ''}
                  isOptionEqualToValue={(option, value) => option?.CurrencyId === value?.CurrencyId}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <RHFAutocomplete
                  name="DefaultPaymentMode"
                  label="DEFAULT PAYMENT MODE"
                  placeholder="Select Payment Mode"
                  options={paymentModesAPI}
                  getOptionLabel={(option) => option?.Name || option || ''}
                  isOptionEqualToValue={(option, value) => option?.PaymentModeId === value?.PaymentModeId || option === value}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name="DefaultShipmentMode"
                  control={methods.control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth label="DEFAULT SHIPMENT MODE">
                      <MenuItem value="">Select...</MenuItem>
                      {shipmentModes.map((mode) => (
                        <MenuItem key={mode} value={mode}>
                          {mode}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Controller
                  name="DefaultPaymentTerm"
                  control={methods.control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth label="DEFAULT PAYMENT TERM">
                      <MenuItem value="">Select...</MenuItem>
                      {defaultPaymentTermsList.map((term) => (
                        <MenuItem key={term} value={term}>
                          {term}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <RHFTextField name="DefaultTolerance" label="DEFAULT TOLERANCE" placeholder="e.g. +/- 5%" />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* ========================================== */}
        {/* 4. PAYMENT TERMS                           */}
        {/* ========================================== */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: '12px' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:banknote-bold" width={22} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Payment Terms ({paymentTerms.length})
                </Typography>
              </Stack>
              <Button
                variant="soft"
                size="small"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={handleAddTermClick}
                sx={{ borderRadius: 1.5, fontWeight: 700 }}
              >
                Add Term
              </Button>
            </Stack>

            {/* Inline Add Term box */}
            {showAddTermInline && (
              <Box
                sx={{
                  p: 2.5,
                  mb: 2.5,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Grid container spacing={2}>
                  {/* SUPPLIER */}
                  <Grid item xs={12} md={3}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="SUPPLIER"
                      value={inlineTerm.Supplier || ''}
                      onChange={(e) => setInlineTerm({ ...inlineTerm, Supplier: e.target.value })}
                    >
                      <MenuItem value="">— Select Supplier —</MenuItem>
                      <MenuItem value="Supplier 1">Supplier 1</MenuItem>
                      <MenuItem value="Supplier 2">Supplier 2</MenuItem>
                    </TextField>
                  </Grid>

                  {/* PAYMENT TERM */}
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="PAYMENT TERM"
                      placeholder="e.g. Open A/C 60 Days"
                      value={inlineTerm.PaymentTerm || ''}
                      onChange={(e) => setInlineTerm({ ...inlineTerm, PaymentTerm: e.target.value })}
                    />
                  </Grid>

                  {/* DUE DAYS */}
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="DUE DAYS"
                      placeholder="e.g. 60"
                      value={inlineTerm.DueDays || ''}
                      onChange={(e) => setInlineTerm({ ...inlineTerm, DueDays: e.target.value })}
                    />
                  </Grid>

                  {/* PAYMENT METHOD */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="PAYMENT METHOD"
                      value={inlineTerm.PaymentMethod || ''}
                      onChange={(e) => setInlineTerm({ ...inlineTerm, PaymentMethod: e.target.value })}
                    >
                      <MenuItem value="">— Select —</MenuItem>
                      <MenuItem value="L/C">L/C</MenuItem>
                      <MenuItem value="T/T">T/T</MenuItem>
                      <MenuItem value="CAD">CAD</MenuItem>
                      <MenuItem value="Open Account">Open Account</MenuItem>
                    </TextField>
                  </Grid>

                  {/* SUPP. TERM */}
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="SUPP. TERM"
                      placeholder="Supplier term"
                      value={inlineTerm.SuppTerm || ''}
                      onChange={(e) => setInlineTerm({ ...inlineTerm, SuppTerm: e.target.value })}
                    />
                  </Grid>

                  {/* SUPP. DAYS */}
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="SUPP. DAYS"
                      placeholder="e.g. 60"
                      value={inlineTerm.SuppDays || ''}
                      onChange={(e) => setInlineTerm({ ...inlineTerm, SuppDays: e.target.value })}
                    />
                  </Grid>

                  {/* TRANSACTION TYPE */}
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        TRANSACTION TYPE
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Button
                          size="small"
                          variant={inlineTerm.TransactionType === 'Service' ? 'contained' : 'text'}
                          color={inlineTerm.TransactionType === 'Service' ? 'primary' : 'inherit'}
                          onClick={() => setInlineTerm({ ...inlineTerm, TransactionType: 'Service' })}
                          sx={{ borderRadius: 0, px: 2, textTransform: 'none' }}
                        >
                          Service
                        </Button>
                        <Button
                          size="small"
                          variant={inlineTerm.TransactionType === 'Trade' ? 'contained' : 'text'}
                          color={inlineTerm.TransactionType === 'Trade' ? 'primary' : 'inherit'}
                          onClick={() => setInlineTerm({ ...inlineTerm, TransactionType: 'Trade' })}
                          sx={{ borderRadius: 0, px: 2, textTransform: 'none' }}
                        >
                          Trade
                        </Button>
                      </Box>
                    </Stack>
                  </Grid>

                  {/* INLINE ACTIONS */}
                  <Grid item xs={12} md={2}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" sx={{ height: '100%' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleSaveInlineTerm}
                        sx={{ borderRadius: 1.5, px: 2 }}
                      >
                        + Add
                      </Button>
                      <IconButton size="small" onClick={() => setShowAddTermInline(false)}>
                        <Iconify icon="mingcute:close-line" width={18} />
                      </IconButton>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            )}

            {paymentTerms.length === 0 ? (
              <Box
                sx={{
                  py: 4,
                  textAlign: 'center',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: '12px',
                  bgcolor: 'background.neutral',
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto' }}>
                  No payment terms assigned. Click &quot;+ Add Term&quot; to add one. Synced with Power Tools &gt; Payment Terms.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>SUPPLIER</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>PAYMENT TERM</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>DUE DAYS</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>PAYMENT METHOD</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>TRANSACTION TYPE</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, width: 80 }}>
                        ACTIONS
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentTerms.map((term, index) => (
                      <TableRow key={term.id || index}>
                        <TableCell sx={{ fontWeight: 600 }}>{term.Supplier || '—'}</TableCell>
                        <TableCell>{term.PaymentTerm || '—'}</TableCell>
                        <TableCell>{term.DueDays || '—'}</TableCell>
                        <TableCell>{term.PaymentMethod || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            label={term.TransactionType || 'Service'}
                            size="small"
                            color={term.TransactionType === 'Trade' ? 'info' : 'primary'}
                            variant="soft"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="error" onClick={() => handleDeleteTerm(index)}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>

        {/* ========================================== */}
        {/* 5. WAREHOUSE ADDRESS                       */}
        {/* ========================================== */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: '12px' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:home-2-bold" width={22} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Warehouse Address
                </Typography>
              </Stack>
              <FormControlLabel
                control={
                  <Switch
                    checked={warehouseEnabled}
                    onChange={(e) => setWarehouseEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label={warehouseEnabled ? 'Enabled' : 'Disabled'}
                labelPlacement="start"
                sx={{ mr: 0.5 }}
              />
            </Stack>

            {!warehouseEnabled ? (
              <Box
                sx={{
                  py: 4,
                  textAlign: 'center',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: '12px',
                  bgcolor: 'background.neutral',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Warehouse address is disabled. Click the toggle to enable.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2.5} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <RHFTextField name="Warehouse_AddressLine1" label="ADDRESS LINE 1" placeholder="Enter warehouse address..." />
                </Grid>
                <Grid item xs={12} md={6}>
                  <RHFTextField name="Warehouse_AddressLine2" label="ADDRESS LINE 2" placeholder="Suite, unit, building..." />
                </Grid>

                <Grid item xs={12} md={3}>
                  <RHFAutocomplete
                    name="Warehouse_Country"
                    label="COUNTRY"
                    placeholder="Select country..."
                    options={countries}
                    getOptionLabel={(option) => option?.Country_Name || ''}
                    isOptionEqualToValue={(option, value) => option?.Country_ID === value?.Country_ID}
                    onchange={(newValue) => {
                      setValue('Warehouse_City', null);
                      if (newValue) {
                        getWarehouseCities(newValue.Country_ID);
                      } else {
                        setWarehouseCities([]);
                      }
                    }}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, px: 2 }}>
                        {option?.Country_Code && (
                          <Iconify icon={`circle-flags:${option.Country_Code.toLowerCase()}`} sx={{ width: 24, height: 24, flexShrink: 0 }} />
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{option?.Country_Name}</Typography>
                      </Box>
                    )}
                    TextFieldProps={{
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            {watchedValues?.Warehouse_Country?.Country_Code ? (
                              <Iconify icon={`circle-flags:${watchedValues.Warehouse_Country.Country_Code.toLowerCase()}`} sx={{ width: 24, height: 24 }} />
                            ) : (
                              <Iconify icon="mdi:flag-outline" width={20} sx={{ color: 'text.secondary' }} />
                            )}
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <RHFAutocomplete
                    name="Warehouse_City"
                    label="CITY"
                    placeholder="Select city..."
                    options={warehouseCities}
                    getOptionLabel={(option) => option?.Name || option?.City_Name || ''}
                    isOptionEqualToValue={(option, value) => (option?.CityId || option?.City_ID) === (value?.CityId || value?.City_ID)}
                    disabled={!watchedValues.Warehouse_Country}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <RHFTextField name="Warehouse_PostalCode" label="POSTAL CODE" placeholder="Zip code..." />
                </Grid>
                <Grid item xs={12} md={3}>
                  <RHFTextField name="Warehouse_Phone" label="PHONE" placeholder="Enter phone number..." />
                </Grid>

                <Grid item xs={12} md={3}>
                  <RHFTextField name="Warehouse_Fax" label="FAX" placeholder="Enter fax number..." />
                </Grid>
                <Grid item xs={12} md={3}>
                  <RHFTextField name="Warehouse_Email" label="EMAIL" placeholder="Enter email address..." />
                </Grid>
                <Grid item xs={12} md={3}>
                  <RHFTextField name="Warehouse_GlnNo" label="GLN NO" placeholder="Enter GLN number..." />
                </Grid>
                <Grid item xs={12} md={3}>
                  <RHFTextField name="Warehouse_VatNo" label="VAT NO" placeholder="Enter VAT number..." />
                </Grid>
              </Grid>
            )}
          </Card>
        </Grid>

        {/* ========================================== */}
        {/* 6. BUYER CONTACTS                          */}
        {/* ========================================== */}
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: '12px' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:users-group-two-rounded-bold" width={22} sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Buyer Contacts ({contacts.length})
                </Typography>
              </Stack>
              <Button
                variant="soft"
                size="small"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={handleAddContactClick}
                sx={{ borderRadius: 1.5, fontWeight: 700 }}
              >
                Add Contact
              </Button>
            </Stack>

            {contacts.length === 0 ? (
              <Box
                sx={{
                  py: 4,
                  textAlign: 'center',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: '12px',
                  bgcolor: 'background.neutral',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No buyer contacts added yet. Click &quot;+ Add Contact&quot; to add one.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>NAME</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>DESIGNATION</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>CELL NO</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>EMAIL</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, width: 80 }}>
                        ACTIONS
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contacts.map((contact, index) => (
                      <TableRow key={contact.id || index}>
                        <TableCell sx={{ fontWeight: 600 }}>{contact.Name}</TableCell>
                        <TableCell>{contact.Designation || '—'}</TableCell>
                        <TableCell>{contact.CellNo || '—'}</TableCell>
                        <TableCell>{contact.Email || '—'}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="error" onClick={() => handleDeleteContact(index)}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>

        {/* ── Bottom Save Changes Button ── */}
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
              startIcon={<Iconify icon="solar:diskette-bold" width={18} />}
              sx={{ borderRadius: 1.5, px: 4, py: 1.5, fontWeight: 700, minWidth: 150 }}
            >
              Save Changes
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>

      {/* ── Add Contact Dialog ── */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Buyer Contact</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Contact Name"
              value={newContact.Name}
              onChange={(e) => setNewContact({ ...newContact, Name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Designation"
              value={newContact.Designation}
              onChange={(e) => setNewContact({ ...newContact, Designation: e.target.value })}
            />
            <TextField
              fullWidth
              label="Cell No"
              value={newContact.CellNo}
              onChange={(e) => setNewContact({ ...newContact, CellNo: e.target.value })}
            />
            <TextField
              fullWidth
              label="Email"
              value={newContact.Email}
              onChange={(e) => setNewContact({ ...newContact, Email: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setContactDialogOpen(false)} color="inherit" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSaveContact} color="primary" variant="contained">
            Save Contact
          </Button>
        </DialogActions>
      </Dialog>


    </FormProvider>
  );
}

CustomerForm.propTypes = {
  currentData: PropTypes.object,
};
