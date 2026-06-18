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
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogTitle,
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
  Chip,
  Checkbox,
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
import { APP_API_STORAGE } from 'src/config-global';
import { LoadingScreen } from './loading-screen';

// ----------------------------------------------------------------------

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
}

export default function CertificateUploadForm({ currentData }) {
  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem('UserData'));
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [documentTypes, setDocumentTypes] = useState([]);

  const [certificates, setCertificates] = useState(
    currentData?.CertificateDetails.map((x) => ({
      ...x,
      CertificatePatentType:
        documentTypes?.find((option) => option?.Document_Type_ID === x?.Document_Type_ID) || null,
      CertificateFile: `${APP_API_STORAGE}${x?.DocFilePath}`,
    })) || []
  );
  const [currentCertificateFile, setCurrentCertificateFile] = useState(null);

  const GetAllDocumentTypes = useCallback(async () => {
    const res = await Get(
      `DocumentTypes?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setDocumentTypes(res.data?.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetch = async () => {
      await Promise.all([GetAllDocumentTypes()]);
      setLoading(false);
    };
    fetch();
  }, [GetAllDocumentTypes]);

  const CustomerSchema = Yup.object().shape({});

  useEffect(() => {
    setCertificates(
      currentData?.CertificateDetails.map((x) => ({
        ...x,
        CertificatePatentType:
          documentTypes?.find((option) => option?.Document_Type_ID === x?.Document_Type_ID) || null,
        CertificateFile: `${APP_API_STORAGE}${x?.DocFilePath}`,
      })) || []
    );
  }, [documentTypes, currentData?.CertificateDetails]);

  const defaultValues = useMemo(
    () => ({
      certificates:
        currentData?.CertificateDetails.map((x) => ({
          ...x,
          CertificatePatentType:
            documentTypes?.find((option) => option?.Document_Type_ID === x?.Document_Type_ID) ||
            null,
          CertificateFile: `${APP_API_STORAGE}${x?.DocFilePath}`,
        })) || [],
    }),
    [currentData, documentTypes]
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

  useEffect(() => {
    if (!loading && documentTypes?.length > 0) {
      methods.reset(defaultValues);
    }
  }, [loading, defaultValues, methods, documentTypes]);

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

  // Function to handle closing the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
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
  console.log('certificates', certificates);
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

  const InsertCertificates = async (certificatesArray) => {
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

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (certificates?.length === 0) {
        enqueueSnackbar('At least one certificate is required', { variant: 'error' });
        return;
      }
      const certificatesData = certificates.map((certificate) => ({
        Document_Type_ID: certificate?.CertificatePatentType?.Document_Type_ID,
        // CertificatePatentType: certificate?.CertificatePatentType?.Document_Type,
        CertificatePatentNumber: certificate.CertificatePatentNumber,
        IssuingAuthority: certificate.IssuingAuthority,
        Description: certificate.Description,
        IssueDate: formatDate(certificate.IssueDate),
        ExpiryDate: formatDate(certificate.ExpiryDate),
        CustomerID: currentData?.Cust_ID,
        CertificateFile: certificate?.CertificateFile,
      }));
      await InsertCertificates(certificatesData);
      setOpenDialog(true);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error creating customer', { variant: 'error' });
    }
  });

  if (loading) {
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
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
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
                  sx={{
                    gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 3' },
                    overflowX: 'auto',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2.5, pb: 1.5 }}>
                    <Button variant="contained" color="primary" onClick={handleAddCertificate}>
                      Add More
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
          {/* submit button */}
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Submission Successful</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Thank you a lot for your submission. It is safe to close your browser now.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
CertificateUploadForm.propTypes = {
  currentData: PropTypes.object,
};
