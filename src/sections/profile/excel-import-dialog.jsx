import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import * as XLSX from 'xlsx';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import FormProvider, { RHFUpload } from 'src/components/hook-form';
import IconButton from '@mui/material/IconButton';
import { Post } from 'src/api/apibasemethods';
import { APP_API } from 'src/config-global';

export default function UploadExcelDialog({
  uploadOpen,
  uploadClose,
  FetchUpdatedData,
  tableData,
}) {
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [downloaded, setDownloaded] = useState(false);

  const DictionaryDataSchema = Yup.object().shape({
    ExcelFile: Yup.mixed().nullable().required('File is required'),
  });

  const methods = useForm({
    resolver: yupResolver(DictionaryDataSchema),
  });

  const { reset, watch, setValue, handleSubmit } = methods;
  const values = watch();

  const handleDownload = () => {
    setDownloaded(true);
  };

  const handleUpload = useCallback(
    (acceptedFiles) => {
      const file2 = acceptedFiles[0];
      const newFile = Object.assign(file2, {
        preview: URL.createObjectURL(file2),
      });

      if (newFile) {
        setFile(file2);
        setFilePreview(newFile);
        setValue('ExcelFile', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const processExcelData = (workbook) => {
    // Process only the UploadTemplate sheet
    // eslint-disable-next-line
    const templateSheet = workbook.Sheets['UploadTemplate'];
    const templateJson = XLSX.utils.sheet_to_json(templateSheet, { header: 1 });

    const templateHeaders = [
      'Cust_Name', 'Cust_Abb', 'Cust_Address1', 'Cust_Address2',
      'Cust_Landline_No', 'Cust_Onboarding_Email', 'Cust_URL',
      'CreatedDate', 'UpdatedDate', 'Is_Active', 'isMature',
      'Cust_Country_ID', 'Cust_City_ID', 'WIC_ID',
      'CreatedBy', 'UpdatedBy', 'Branch_ID', 'Org_ID'
    ];

    const customerData = templateJson.slice(1).map((row) =>
      templateHeaders.reduce((acc, header, index) => {
        acc[header] = row[index];
        return acc;
      }, {})
    ).filter(obj => obj.Cust_Name);

    // Format the data to match API requirements
    return customerData.map(customer => ({
      Cust_Name: customer.Cust_Name,
      Cust_Abb: customer.Cust_Abb,
      Cust_Address1: customer.Cust_Address1,
      Cust_Address2: customer.Cust_Address2 || '',
      Cust_Landline_No: customer.Cust_Landline_No,
      Cust_Onboarding_Email: customer.Cust_Onboarding_Email || '',
      Cust_URL: customer.Cust_URL || '',
      Cust_Country_ID: customer.Cust_Country_ID,
      Cust_City_ID: customer.Cust_City_ID,
      WIC_ID: customer.WIC_ID || 0,
      CreatedDate: new Date().toISOString(),
      UpdatedDate:  new Date().toISOString(),
      Is_Active: true,
      isMature: true,
      CreatedBy: userData?.userDetails?.userId || customer.CreatedBy || 1,
      UpdatedBy: userData?.userDetails?.userId || customer.UpdatedBy || 1,
      Branch_ID: userData?.userDetails?.branchID || customer.Branch_ID || 1,
      Org_ID: userData?.userDetails?.orgId || customer.Org_ID || 1,

    }));
  };

  const handleFileChange = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setIsLoading(true);
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Check if required sheet exists
        // eslint-disable-next-line
        if (!workbook.SheetNames.includes('UploadTemplate')) {
          throw new Error('Excel file must contain an UploadTemplate sheet');
        }

        const payload = processExcelData(workbook);

        // Filter out existing customers if needed
        const filteredPayload = payload.filter(
          item => !tableData.some(
            existingItem => existingItem.Cust_Name.toLowerCase().trim() ===
              item.Cust_Name.toLowerCase().trim()
          )
        );

        if (filteredPayload.length === 0) {
          enqueueSnackbar('All customers in the file already exist', { variant: 'info' });
          return;
        }

        // Send to API
        const response = await Post(`BulkInsertCustomers`, filteredPayload);

        if (response.status === 200) {
          enqueueSnackbar(`${filteredPayload.length} customers added successfully!`, {
            variant: 'success'
          });
          FetchUpdatedData();
          uploadClose();
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(error.message || 'Error processing Excel file', { variant: 'error' });
      } finally {
        setIsLoading(false);
        setIsSubmitting(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    setValue('ExcelFile', null, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async () => {
    setIsSubmitting(true);
    await handleFileChange();
  });

  const renderLoading = (
    <LoadingScreen
      sx={{
        borderRadius: 1.5,
        bgcolor: 'background.default',
        mb: 3,
      }}
    />
  );

  return (
    <Dialog open={uploadOpen} onClose={uploadClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontSize: '20px !important' }}>Upload Customer Excel File</DialogTitle>

      {isLoading ? (
        renderLoading
      ) : (
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Grid container>
            <Grid xs={12} md={12}>
              <DialogContent>
                <Typography sx={{ mb: 1, fontSize: '14px' }} variant="body1">
                  Please download the Excel format with the UploadTemplate sheet.
                </Typography>
                <a
                  href={`${APP_API}DownloadCustomerExcelTemplate`}
                  download="CustomerBulkUploadTemplate.xlsx"
                >
                  <Button
                    endIcon={<Iconify icon="mynaui:cloud-download" />}
                    onClick={handleDownload}
                    color="primary"
                    variant="contained"
                  >
                    Download Template
                  </Button>
                </a>

                <Typography sx={{ mt: 3, mb: 1, fontSize: '14px' }} variant="body1">
                  Upload your completed Excel file:
                </Typography>
                <RHFUpload
                  accept={{
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    'application/vnd.ms-excel': ['.xls'],
                  }}
                  name="ExcelFile"
                  title="Excel File"
                  onDrop={handleUpload}
                  maxSize={3145728}
                />

                {filePreview && (
                  <Box mt={2} display="flex" justifyContent="space-between">
                    <Typography variant="body2">File: {filePreview.name}</Typography>
                    <IconButton onClick={handleRemoveFile}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Box>
                )}
              </DialogContent>

              <DialogActions>
                <Button onClick={uploadClose} variant="outlined" color="inherit">
                  Cancel
                </Button>
                <LoadingButton
                  color="primary"
                  endIcon={<Iconify icon="mynaui:cloud-upload" />}
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  disabled={!file}
                >
                  Upload
                </LoadingButton>
              </DialogActions>
            </Grid>
          </Grid>
        </FormProvider>
      )}
    </Dialog>
  );
}

UploadExcelDialog.propTypes = {
  uploadOpen: PropTypes.any,
  uploadClose: PropTypes.any,
  FetchUpdatedData: PropTypes.func,
  tableData: PropTypes.array,
};