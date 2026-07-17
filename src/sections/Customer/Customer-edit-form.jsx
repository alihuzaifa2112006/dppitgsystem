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
  Radio,
  RadioGroup,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha } from '@mui/material/styles';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { Get, Post, Put } from 'src/api/apibasemethods';
import { paths } from 'src/routes/paths';

export default function CustomerEditForm({ currentData }) {
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
  const [termPaymentModesAPI, setTermPaymentModesAPI] = useState([]);
  const [warehouseCountries, setWarehouseCountries] = useState([]);
  const [termTransactionModesAPI, setTermTransactionModesAPI] = useState([]);
  const [paymentTermsAPI, setPaymentTermsAPI] = useState([]);
  const [termSuppliersAPI, setTermSuppliersAPI] = useState([]);
  const [shipmentModesAPI, setShipmentModesAPI] = useState([]);

  // Local lists for dialog/inline additions
  const [contacts, setContacts] = useState(currentData?.BuyerContacts || []);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [warehouseEnabled, setWarehouseEnabled] = useState(currentData?.WarehouseAddressEnabled || false);
  const [isActive, setIsActive] = useState(currentData?.IsActive !== undefined ? currentData.IsActive : true);

  // Dialog & Inline States
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const [showAddTermInline, setShowAddTermInline] = useState(false);
  const [inlineTerm, setInlineTerm] = useState({
    Supplier: '',
    PaymentTerm: '',
    DueDays: '',
    PaymentMethod: '',
    SuppTerm: '',
    SuppDays: '',
    TransactionType: '',
  });

  // Options
  const paymentModes = ['L/C', 'T/T', 'CAD', 'Open Account'];
  const shipmentModes = ['Sea', 'Air', 'Road'];
  const defaultPaymentTermsList = ['Immediate', '30 Days', '60 Days', '90 Days'];

  // Form Validation Schema
  const CustomerSchema = Yup.object().shape({
    // General Information
    Cust_Name: Yup.string().required('Customer Name is required'),
    DisplayName: Yup.string().required('Display Name is required'),
    CommissionPercent: Yup.number().typeError('Commission must be a number').required('Commission is required').max(100, 'Commission cannot exceed 100'),
    Website: Yup.string().required('Website is required'),
    Forwarder: Yup.string().required('Forwarder is required'),
    GlnNo: Yup.string().required('GLN NO is required'),
    VatNo: Yup.string().required('VAT NO is required'),
    TransactionMode: Yup.mixed().nullable().required('Transaction Mode is required'),
    DefaultIncoterm: Yup.mixed().nullable().required('Default Incoterm is required'),

    // Address & Contact
    AddressLine1: Yup.string().required('Address Line 1 is required'),
    AddressLine2: Yup.string(),
    Continent: Yup.mixed().nullable().required('Continent is required'),
    Country: Yup.object().nullable().required('Country is required'),
    City: Yup.object().nullable().required('City is required'),
    PostalCode: Yup.string().required('Postal Code is required'),
    Phone: Yup.string().required('Phone is required'),
    Fax: Yup.string().required('Fax is required'),

    // Order Defaults
    DefaultCurrency: Yup.object().nullable().required('Default Currency is required'),
    DefaultPaymentMode: Yup.object().nullable().required('Default Payment Mode is required'),
    DefaultShipmentMode: Yup.object().nullable().required('Default Shipment Mode is required'),
    DefaultPaymentTerm: Yup.object().nullable().required('Default Payment Term is required'),
    DefaultTolerance: Yup.string().required('Default Tolerance is required'),

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
      Cust_Name: currentData?.CustomerName || currentData?.Cust_Name || '',
      DisplayName: currentData?.DisplayName || '',
      CommissionPercent: currentData?.CommissionPercent !== undefined ? currentData.CommissionPercent : (currentData?.Commission !== undefined ? currentData.Commission : 0),
      Website: currentData?.Website || '',
      Forwarder: currentData?.Forwarder || '',
      GlnNo: currentData?.GLNNo || currentData?.GlnNo || '',
      VatNo: currentData?.VatNo || '',
      TransactionMode: currentData?.TransactionModeId ? { TransactionModeId: currentData.TransactionModeId, Name: currentData.TransactionModeName } : (currentData?.TransactionMode || null),
      DefaultIncoterm: currentData?.DefaultIncotermId ? { IncotermId: currentData.DefaultIncotermId, Code: currentData.IncotermCode, Name: currentData.IncotermName } : (currentData?.DefaultIncoterm || null),
      AddressLine1: currentData?.AddressLine1 || '',
      AddressLine2: currentData?.AddressLine2 || '',
      Continent: currentData?.ContinentId ? { ContinentId: currentData.ContinentId, Name: currentData.ContinentName } : (currentData?.Continent || null),
      Country: currentData?.CountryID ? { Country_ID: currentData.CountryID, Country_Name: currentData.CountryName || currentData.Country_Name } : null,
      City: currentData?.CityId ? { CityId: currentData.CityId, Name: currentData.CityName } : null,
      PostalCode: currentData?.PostalCode || '',
      Phone: currentData?.Phone || '',
      Fax: currentData?.Fax || '',
      DefaultCurrency: currentData?.DefaultCurrencyId ? { CurrencyId: currentData.DefaultCurrencyId, Code: currentData.CurrencyCode } : (currentData?.DefaultCurrency || null),
      DefaultPaymentMode: currentData?.DefaultPaymentModeId ? { PaymentModeId: currentData.DefaultPaymentModeId, Name: currentData.PaymentModeName } : (currentData?.DefaultPaymentMode || null),
      DefaultShipmentMode: currentData?.DefaultShipmentModeId ? { ShipmentModeId: currentData.DefaultShipmentModeId, Name: currentData.ShipmentModeName } : (currentData?.DefaultShipmentMode || null),
      DefaultPaymentTerm: currentData?.DefaultPaymentTermId ? { PaymentTermId: currentData.DefaultPaymentTermId, Term: currentData.PaymentTermName } : (currentData?.DefaultPaymentTerm || null),
      DefaultTolerance: currentData?.DefaultTolerance || '',
      Warehouse_AddressLine1: currentData?.WarehouseAddressLine1 || currentData?.Warehouse_AddressLine1 || '',
      Warehouse_AddressLine2: currentData?.WarehouseAddressLine2 || currentData?.Warehouse_AddressLine2 || '',
      Warehouse_Country: currentData?.WarehouseCountryID ? { Country_ID: currentData.WarehouseCountryID, Country_Name: currentData.WarehouseCountryName } : null,
      Warehouse_City: currentData?.WarehouseCityId ? { CityId: currentData.WarehouseCityId, Name: currentData.WarehouseCityName } : null,
      Warehouse_PostalCode: currentData?.WarehousePostalCode || currentData?.Warehouse_PostalCode || '',
      Warehouse_Phone: currentData?.WarehousePhone || currentData?.Warehouse_Phone || '',
      Warehouse_Fax: currentData?.WarehouseFax || currentData?.Warehouse_Fax || '',
      Warehouse_Email: currentData?.WarehouseEmail || currentData?.Warehouse_Email || '',
      Warehouse_GlnNo: currentData?.WarehouseGLNNo || currentData?.Warehouse_GlnNo || '',
      Warehouse_VatNo: currentData?.WarehouseVatNo || currentData?.Warehouse_VatNo || '',
      Contact_Name: '',
      Contact_Designation: '',
      Contact_CellNo: '',
      Contact_Email: '',
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
    getValues,
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

  // Fetch initial dropdown options based on currentData IDs
  useEffect(() => {
    if (currentData?.ContinentId) getCountries(currentData.ContinentId);
    if (currentData?.CountryID) getCities(currentData.CountryID);
    if (currentData?.WarehouseCountryID) getWarehouseCities(currentData.WarehouseCountryID);
  }, [currentData, getCountries, getCities, getWarehouseCities]);

  // Load Transaction Modes, Incoterms and Continents
  useEffect(() => {
    const fetchTransactionModes = async () => {
      try {
        const res = await Get('TransactionMode/GetAll');
        if (res.status === 200) {
          setTransactionModes(res?.data?.Data || []);
          setTermTransactionModesAPI(res?.data?.Data || []);
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
        setTermPaymentModesAPI(res?.data?.Data || []);
      } catch (error) {
        console.error('Error fetching payment modes:', error);
      }
    };
    const fetchWarehouseCountries = async () => {
      try {
        const res = await Get('Country/GetAll');
        setWarehouseCountries(res?.data?.Data || []);
      } catch (error) {
        console.error('Error fetching warehouse countries:', error);
      }
    };
    const fetchPaymentTermsAPI = async () => {
      try {
        const res = await Get('PaymentTerm/GetAll');
        setPaymentTermsAPI(res?.data?.Data || []);
      } catch (error) {
        console.error('Error fetching payment terms:', error);
      }
    };
    const fetchTermSuppliersAPI = async () => {
      try {
        const res = await Get('Supplier/GetAll');
        setTermSuppliersAPI(res?.data?.Data || []);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };
    const fetchShipmentModesAPI = async () => {
      try {
        const res = await Get('ShipmentMode/GetAll');
        setShipmentModesAPI(res?.data?.Data || []);
      } catch (error) {
        console.error('Error fetching shipment modes:', error);
      }
    };
    fetchTransactionModes();
    fetchIncoterms();
    fetchContinents();
    fetchCurrencies();
    fetchPaymentModes();
    fetchWarehouseCountries();
    fetchPaymentTermsAPI();
    fetchTermSuppliersAPI();
    fetchShipmentModesAPI();
  }, []);



  // Reset values when currentData loaded
  useEffect(() => {
    if (currentData) {
      reset(defaultValues);
      setContacts(currentData.Contacts || currentData.BuyerContacts || []);

      if (currentData.PaymentTerms && Array.isArray(currentData.PaymentTerms)) {
        setPaymentTerms(
          currentData.PaymentTerms.map((pt) => ({
            ...pt,
            Supplier: { SupplierId: pt.SupplierId, SupplierName: pt.SupplierName },
            PaymentTerm: pt.Term,
            DueDays: pt.DueDays,
            PaymentMethod: { PaymentModeId: pt.PaymentModeId, Name: pt.PaymentModeName },
            SuppTerm: pt.SuppTerm,
            SuppDays: pt.SuppDays,
            TransactionType: pt.TransactionType,
          }))
        );
      } else {
        setPaymentTerms([]);
      }

      setWarehouseEnabled(currentData.WarehouseEnabled !== undefined ? currentData.WarehouseEnabled : (currentData.WarehouseAddressEnabled || false));
      setIsActive(currentData.IsActive !== undefined ? currentData.IsActive : true);
    }
  }, [currentData, reset, defaultValues]);



  // On Submit
  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        CustomerName: data.Cust_Name || '',
        DisplayName: data.DisplayName || '',
        CommissionPercent: Number(data.CommissionPercent) || 0,
        Website: data.Website || '',
        Forwarder: data.Forwarder || '',
        GLNNo: data.GlnNo || '',
        VatNo: data.VatNo || '',
        TransactionModeId: data.TransactionMode?.TransactionModeId || data.TransactionMode?.Id || 0,
        DefaultIncotermId: data.DefaultIncoterm?.IncotermId || data.DefaultIncoterm?.Id || 0,

        AddressLine1: data.AddressLine1 || '',
        AddressLine2: data.AddressLine2 || 'N/A',
        ContinentId: data.Continent?.ContinentId || 0,
        CountryID: data.Country?.Country_ID || 0,
        CityId: data.City?.CityId || data.City?.City_ID || 0,
        PostalCode: data.PostalCode || 'N/A',
        Phone: data.Phone || '',
        Fax: data.Fax || '',

        DefaultCurrencyId: data.DefaultCurrency?.CurrencyId || 0,
        DefaultPaymentModeId: data.DefaultPaymentMode?.PaymentModeId || data.DefaultPaymentMode?.Id || 0,
        DefaultShipmentModeId: data.DefaultShipmentMode?.ShipmentModeId || data.DefaultShipmentMode?.Id || 0,
        DefaultPaymentTermId: data.DefaultPaymentTerm?.PaymentTermId || data.DefaultPaymentTerm?.Id || 0,
        DefaultTolerance: data.DefaultTolerance || '',

        WarehouseEnabled: warehouseEnabled,
        WarehouseAddressLine1: data.Warehouse_AddressLine1 || '',
        WarehouseAddressLine2: data.Warehouse_AddressLine2 || '',
        WarehouseCityId: data.Warehouse_City?.CityId || data.Warehouse_City?.City_ID || 0,
        WarehouseCountryID: data.Warehouse_Country?.Country_ID || 0,
        WarehousePostalCode: data.Warehouse_PostalCode || '',
        WarehousePhone: data.Warehouse_Phone || '',
        WarehouseFax: data.Warehouse_Fax || '',
        WarehouseEmail: data.Warehouse_Email || '',
        WarehouseGLNNo: data.Warehouse_GlnNo || '',
        WarehouseVatNo: data.Warehouse_VatNo || '',

        IsActive: isActive,

        PaymentTerms: paymentTerms.map(pt => ({
          SupplierId: pt.Supplier?.InvitationId || pt.Supplier?.SupplierId || null,
          Term: pt.PaymentTerm || '',
          DueDays: pt.DueDays ? parseInt(pt.DueDays, 10) : null,
          PaymentModeId: pt.PaymentMethod?.PaymentModeId || pt.PaymentMethod?.Id || 0,
          SuppTerm: pt.SuppTerm || null,
          SuppDays: pt.SuppDays ? parseInt(pt.SuppDays, 10) : null,
          TransactionType: pt.TransactionType || ''
        })),

        Contacts: contacts.map(c => ({
          Name: c.Name,
          Designation: c.Designation,
          CellNo: c.CellNo,
          Email: c.Email
        }))
      };

      console.log('Sending Customer Payload:', payload);

      if (currentData?.CustomerId || currentData?.CustomerID) {
        payload.CustomerId = currentData.CustomerId || currentData.CustomerID;
        const response = await Put('Customer/Update', payload);
        if (response.status === 200 || response.status === 201) {
          enqueueSnackbar('Customer updated successfully!', { variant: 'success' });
          navigate(paths.dashboard.Powertool.Customer.root);
        } else {
          enqueueSnackbar(response?.data?.Message || 'Error updating customer', { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Error: No Customer ID found for update.', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      enqueueSnackbar(error?.response?.data?.Message || error?.message || 'Error submitting form', { variant: 'error' });
    }
  });

  // Contacts handlers
  const handleAddContactClick = () => {
    setValue('Contact_Name', '');
    setValue('Contact_Designation', '');
    setValue('Contact_CellNo', '');
    setValue('Contact_Email', '');
    setContactDialogOpen(true);
  };

  const handleSaveContact = () => {
    const contactName = getValues('Contact_Name');
    const contactDesignation = getValues('Contact_Designation');
    const contactCellNo = getValues('Contact_CellNo');
    const contactEmail = getValues('Contact_Email');

    if (!contactName) {
      enqueueSnackbar('Contact name is required', { variant: 'warning' });
      return;
    }
    setContacts([...contacts, {
      Name: contactName,
      Designation: contactDesignation,
      CellNo: contactCellNo,
      Email: contactEmail,
      id: Date.now()
    }]);
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
      TransactionType: '',
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
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
              {currentData?.CustomerName || currentData?.Cust_Name || 'Edit Customer'}
            </Typography>
            {(currentData?.CustomerId || currentData?.CustomerID) && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                ID: {currentData?.CustomerId || currentData?.CustomerID}
              </Typography>
            )}
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Customer Status:
          </Typography>
          <RadioGroup
            row
            value={isActive ? 'true' : 'false'}
            onChange={(e) => setIsActive(e.target.value === 'true')}
          >
            <FormControlLabel value="true" control={<Radio color="primary" />} label="Active" />
            <FormControlLabel value="false" control={<Radio color="error" />} label="Inactive" />
          </RadioGroup>
        </Stack>
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
                <RHFTextField
                  name="CommissionPercent"
                  label="COMMISSION %"
                  type="number"
                  placeholder="0"
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (Number(val) > 100) val = 100;
                    if (Number(val) < 0) val = 0;
                    methods.setValue('CommissionPercent', val, { shouldValidate: true });
                  }}
                />
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
                  options={transactionModes}
                  getOptionLabel={(option) => option?.Name || option || ''}
                  isOptionEqualToValue={(option, value) => option?.TransactionModeId === value?.TransactionModeId || option === value}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFAutocomplete
                  name="DefaultIncoterm"
                  label="DEFAULT INCOTERM"
                  placeholder="Select Incoterm"
                  options={incoterms}
                  getOptionLabel={(option) => option?.Code || option?.Name || option || ''}
                  isOptionEqualToValue={(option, value) => option?.IncotermId === value?.IncotermId || option === value}
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
                  options={continents}
                  getOptionLabel={(option) => option?.Name || option || ''}
                  isOptionEqualToValue={(option, value) => option?.ContinentId === value?.ContinentId || option === value}
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
                <RHFAutocomplete
                  name="DefaultShipmentMode"
                  label="DEFAULT SHIPMENT MODE"
                  placeholder="Select Shipment Mode"
                  options={shipmentModesAPI}
                  getOptionLabel={(option) => option?.Name || option || ''}
                  isOptionEqualToValue={(option, value) => option?.ShipmentModeId === value?.ShipmentModeId || option === value}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <RHFAutocomplete
                  name="DefaultPaymentTerm"
                  label="DEFAULT PAYMENT TERM"
                  placeholder="Select Payment Term"
                  options={paymentTermsAPI}
                  getOptionLabel={(option) => option?.Name || option || ''}
                  isOptionEqualToValue={(option, value) => option?.PaymentTermId === value?.PaymentTermId || option === value}
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
                    <Autocomplete
                      fullWidth
                      options={termSuppliersAPI}
                      getOptionLabel={(option) => option?.SupplierName || option || ''}
                      isOptionEqualToValue={(option, value) => option?.InvitationId === value?.InvitationId || option === value}
                      value={inlineTerm.Supplier || null}
                      onChange={(event, newValue) => {
                        setInlineTerm({ ...inlineTerm, Supplier: newValue || null });
                      }}
                      renderInput={(params) => <TextField {...params} label="SUPPLIER" placeholder="Select Supplier" />}
                    />
                  </Grid>

                  {/* PAYMENT TERM */}
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
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
                      label="DUE DAYS"
                      placeholder="e.g. 60"
                      value={inlineTerm.DueDays || ''}
                      onChange={(e) => setInlineTerm({ ...inlineTerm, DueDays: e.target.value })}
                    />
                  </Grid>

                  {/* PAYMENT METHOD */}
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      fullWidth
                      options={termPaymentModesAPI}
                      getOptionLabel={(option) => option?.Name || option || ''}
                      value={inlineTerm.PaymentMethod || null}
                      onChange={(event, newValue) => {
                        setInlineTerm({ ...inlineTerm, PaymentMethod: newValue || null });
                      }}
                      renderInput={(params) => <TextField {...params} label="PAYMENT METHOD" placeholder="Select..." />}
                    />
                  </Grid>

                  {/* SUPP. TERM */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SUPP. TERM"
                      placeholder="Supplier term"
                      value={inlineTerm.SuppTerm || ''}
                      onChange={(e) => setInlineTerm({ ...inlineTerm, SuppTerm: e.target.value })}
                    />
                  </Grid>

                  {/* SUPP. DAYS */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SUPP. DAYS"
                      placeholder="e.g. 60"
                      value={inlineTerm.SuppDays || ''}
                      onChange={(e) => setInlineTerm({ ...inlineTerm, SuppDays: e.target.value })}
                    />
                  </Grid>

                  {/* TRANSACTION TYPE */}
                  <Grid item xs={12} md={10}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        TRANSACTION TYPE
                      </Typography>
                      <RadioGroup
                        row
                        value={inlineTerm.TransactionType || ''}
                        onChange={(e) => setInlineTerm({ ...inlineTerm, TransactionType: e.target.value })}
                      >
                        {termTransactionModesAPI.map((mode) => (
                          <FormControlLabel
                            key={mode?.Name || mode}
                            value={mode?.Name || mode}
                            control={<Radio />}
                            label={<Typography variant="body2">{mode?.Name || mode}</Typography>}
                          />
                        ))}
                      </RadioGroup>
                    </Stack>
                  </Grid>

                  {/* INLINE ACTIONS */}
                  <Grid item xs={12} md={2}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end" sx={{ height: '100%' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveInlineTerm}
                        sx={{ borderRadius: 1.5, px: 2 }}
                      >
                        + Add
                      </Button>
                      <IconButton onClick={() => setShowAddTermInline(false)}>
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
                        <TableCell sx={{ fontWeight: 600 }}>{term.Supplier?.SupplierName || term.Supplier || '—'}</TableCell>
                        <TableCell>{term.PaymentTerm || '—'}</TableCell>
                        <TableCell>{term.DueDays || '—'}</TableCell>
                        <TableCell>{term.PaymentMethod?.Name || term.PaymentMethod || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            label={term.TransactionType || '—'}
                            size="small"
                            color="primary"
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
                    options={warehouseCountries}
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
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
              // startIcon={<Iconify icon="solar:diskette-bold" width={18} />}
              sx={{
                borderRadius: '12px', // Smooth rounded corners
                px: 2,
                py: 1,
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'none', // Capital Letters khatam karne ke liye
                minWidth: 140,
                backgroundColor: 'primary.main',
                boxShadow: (theme) => `0 8px 16px -4px ${theme.palette.primary.light}40`, // Soft glow shadow
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'translateY(-2px)', // Hover pe thoda upar uthega
                  boxShadow: (theme) => `0 12px 20px -4px ${theme.palette.primary.light}60`,
                },
                '&:active': {
                  transform: 'translateY(0)', // Click karne pe wapas bounce back
                }
              }}
            >
              Save
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>

      {/* ── Add Contact Dialog ── */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Buyer Contact</DialogTitle>
        <DialogContent sx={{ pt: 1, pb: 3 }}>
          <Grid container spacing={2.5} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <RHFTextField name="Contact_Name" label="CONTACT NAME" placeholder="e.g. John Doe" />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFTextField name="Contact_Designation" label="DESIGNATION" placeholder="e.g. Manager" />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFTextField name="Contact_CellNo" label="CELL NO" placeholder="Enter cell number..." />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFTextField name="Contact_Email" label="EMAIL" placeholder="Enter email address..." />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="outlined" color="inherit" onClick={() => setContactDialogOpen(false)} sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveContact} sx={{ fontWeight: 600 }}>
            Save Contact
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}

CustomerEditForm.propTypes = {
  currentData: PropTypes.object,
};
