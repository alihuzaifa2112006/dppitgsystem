import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { paths } from 'src/routes/paths';

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
import { getUserData } from 'src/utils/getUser';
import IconButton from '@mui/material/IconButton';
import { Post } from 'src/api/apibasemethods';
import { decrypt, encrypt } from 'src/api/encryption';
import { APP_API } from 'src/config-global';

export default function UploadExcelDialog({
  uploadOpen,
  uploadClose,
  FetchUpdatedData,
  tableData,
  allTypes
}) {
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dictionaryData, setDictionaryData] = useState();

  const [file, setFile] = useState(null);

  const [filePreview, setFilePreview] = useState(null);

  const decryptObjectKeys = (data) => {
    const decryptedData = data.map((item) => {
      const decryptedItem = {};
      Object.keys(item).forEach((key) => {
        decryptedItem[key] = decrypt(item[key]);
      });
      return decryptedItem;
    });
    return decryptedData;
  };

  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloaded(true);
  };
  // -------------------- Post Dictionary ----------------------

const InsertVendor = useCallback(
  async (fileData) => {
    setIsSubmitting(true);
    try {
      // Create Set of valid Blend_Type_IDs from allTypes
      const validBlendTypeIds = new Set(allTypes.map(type => type.Blend_Type_ID));
      
      // Create mapping of Blend_Type_ID to Blend_Type_Name from tableData
      const blendTypeMap = {};
      tableData.forEach(item => {
        if (!blendTypeMap[item.Blend_Type_ID]) {
          blendTypeMap[item.Blend_Type_ID] = item.Blend_Type_Name;
        }
      });

      // Normalization function
      const normalize = (str) => 
        str?.replace(/[^\w\s®]/g, '')  // Keep letters, numbers, spaces, and ®
            .replace(/\s+/g, ' ')
            .replace(/\r\n/g, '')
            .trim()
            .toLowerCase();

      // Filter data in multiple steps
      const filteredData2 = fileData
        // First, filter out items with invalid Blend_Type_ID
        .filter(item => validBlendTypeIds.has(item.Blend_Type_ID))
        // Then filter out duplicates
        .filter((item) => {
          const blendTypeName = blendTypeMap[item.Blend_Type_ID];
          const newBlendName = normalize(item.Blend_Names);
          const newBlendTypeName = normalize(blendTypeName);
          
          return !tableData.some((existingItem) => {
            const existingBlendName = normalize(existingItem.Blend_Names);
            const existingBlendTypeName = normalize(existingItem.Blend_Type_Name);
            
            return newBlendName === existingBlendName && 
                   newBlendTypeName === existingBlendTypeName;
          });
        });

      // Add extra fields
      const modifiedVendorData = filteredData2.map((X) => ({
        ...X,
        CreatedBy: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
        IsActive: true,
        isDeleted: false,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      }));

      const response = await Post(`AddBulkUploadForBlendNames`, modifiedVendorData);

      if (response.status === 200) {
        enqueueSnackbar('Blend Names added successfully!', { variant: 'success' });
      }
      uploadClose();
      FetchUpdatedData();
    } catch (error) {
      console.log('Upload error:', error);
      enqueueSnackbar('Something Went Wrong!', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  },
  [enqueueSnackbar, uploadClose, FetchUpdatedData, tableData, userData, allTypes]
);

  // -------------------- xxxxxxxxxxxxxxx ----------------------

  const renderLoading = (
    <LoadingScreen
      sx={{
        borderRadius: 1.5,
        bgcolor: 'background.default',
        mb: 3,
      }}
    />
  );

  const DictionaryDataSchema = Yup.object().shape({
    ExcelFile: Yup.mixed().nullable().required('File is required'),
  });

  const methods = useForm({
    resolver: yupResolver(DictionaryDataSchema),
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    // formState: { isSubmitting },
  } = methods;

  const values = watch();

  const handleUpload = useCallback(
    (acceptedFiles) => {
      const file2 = acceptedFiles[0];
      const newFile = Object.assign(file2, {
        preview: URL.createObjectURL(file2),
      });

      if (newFile) {
        setFile(file2);
        setFilePreview(newFile); // Store file preview
        setValue('ExcelFile', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleFileChange = async () => {
    const uploadedFile = file;
    const reader = new FileReader();

    reader.onload = async (m) => {
      const data = new Uint8Array(m.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Define your custom headers
      const customHeaders = ['Blend_Type_ID', 'Blend_Names'];

      // Ensure the number of custom keys matches the number of columns in your Excel sheet
      if (customHeaders.length !== json[0].length) {
        console.error(
          'Number of custom keys does not match the number of columns in the Excel sheet'
        );
        return;
      }

      const jsonData = json.slice(1).map((row) =>
        customHeaders.reduce((acc, header, index) => {
          acc[header] = row[index];
          return acc;
        }, {})
      );

      // Remove objects with any key being undefined
      const filteredData = jsonData.filter(
        (obj) => !Object.values(obj).some((value) => value === undefined)
      );
      // Remove duplicated objects
      const seen = new Set();
      const deduplicatedData = filteredData.filter((obj) => {
        const key = JSON.stringify(obj);
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });

      await InsertVendor(deduplicatedData);
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  // Function to remove the file and reset the state
  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null); // Reset the preview
    setValue('ExcelFile', null, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // await new Promise((resolve) => setTimeout(resolve, 9500));
      // setIsSubmitting(true);
      await handleFileChange();
      reset();
    } catch (error) {
      console.error(error);
    } finally {
      FetchUpdatedData();
      // setIsSubmitting(false);
    }
  });

  return (
    <Dialog open={uploadOpen} onClose={uploadClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontSize: '20px !important' }}>Upload Excel File</DialogTitle>

      {isLoading ? (
        renderLoading
      ) : (
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Grid container>
            <Grid xs={12} md={12}>
              <DialogContent>
                <Typography sx={{ mb: 1, fontSize: '14px' }} variant="body1">
                  Please download the Excel format.
                </Typography>
                <a href={`${APP_API}export/BlendNameDataUpload`} download>
                  <Button
                    endIcon={<Iconify icon="mynaui:cloud-download" />}
                    onClick={handleDownload}
                    color="primary"
                    variant="contained"
                  >
                    Download File
                  </Button>
                </a>

                <br />
                <Typography sx={{ mt: 3, mb: 1, fontSize: '14px' }} variant="body1">
                  If you have already downloaded the file, you can upload it now.
                </Typography>
                <RHFUpload
                  accept={{
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    'application/vnd.ms-excel': ['.xls'],
                  }}
                  name="ExcelFile"
                  title="Excel File"
                  file={dictionaryData}
                  onDrop={handleUpload}
                  maxSize={3145728}
                />

                {/* File Preview */}
                {filePreview && (
                  <Box mt={2} display="flex" justifyContent="space-between">
                    <Typography variant="body2">File: {filePreview.name}</Typography>
                    {/* <Typography variant="body2">Type: {filePreview.type}</Typography> */}
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
  allTypes: PropTypes.array,
};
