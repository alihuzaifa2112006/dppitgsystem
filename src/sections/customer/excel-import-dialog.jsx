import React, { useState, useCallback, useEffect, useRef } from 'react';
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

export default function UploadExcelDialog({ uploadOpen, uploadClose, FetchUpdatedData }) {
  const userID = getUserData() ? getUserData()?.userDetails?.userId : 86;

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

  const InsertVendorDetail = async (body) => {
    const encryptedVendorDetail = body.map((X) =>
      Object.assign(
        {},
        ...Object.keys(X).map((key) => ({
          [key]: encrypt(X[key]),
        }))
      )
    );
    console.log(encryptedVendorDetail);
    const res = await Post(`InserVendorDetail`, encryptedVendorDetail);
    if (res.data.ResponseCode === '100') {
      // enqueueSnackbar('Vendor Detail Inserted Successfully', { variant: 'success' });
      FetchUpdatedData();
      console.log('Vendor Detail Inserted Successfully', res.data);
    } else if (res.data.ResponseCode === '-2') {
      // enqueueSnackbar('Vendor Detail Inserted Successfully', { variant: 'error' });
      console.log('Vendor Detail Inserted Failed', res.data);
    }
  };

  const InsertVendor = useCallback(
    async (fileData) => {
      setIsSubmitting(true);
      let hasError = false; // Track if any errors occur

      try {
        // Add extra fields to each object in fileData
        const modifiedVendorData = fileData.map((X) => ({
          ...X,
          ShortName: '',
          VenderCode: '',
          Address2: '',
          ZipCode: '',
          FaxNo: '',
          PhoneNumber: '',
          Website: '',
          UserID: userID || 1,
          Province: '',
          MainExportMarketId: '',
          ProductGroupid: '',
          ProductPortfolioID: '',
          ProductCategoriesID: '',
          IndustryTypeID: '2',
          NoOfEmployeesID: '',
          PercentageOfExportBusinessID: '',
          ExperienceInBusinessTypeID: '',
          ShippingTermsID: '',
          BusinessTypeID: '',
          YearsInBusinessID: '',
          YearsInEuropeanBusinessID: '',
          BusinessPercentageInEuropeanID: '',
          AssortmentRangeID: '',
          AssortmentStrategyID: '',
        }));
        // Encrypt all values in modifiedVendorData
        const encryptedVendorData = modifiedVendorData.map((X) =>
          Object.assign(
            {},
            ...Object.keys(X).map((key) => ({
              [key]: encrypt(X[key]),
            }))
          )
        );
        console.log('encryptedVendorData', encryptedVendorData);
        // Post the encrypted data to the server using Promise.all

        const types = [
          { type: 'Customer', ids: ['18'] },
          { type: 'Supplier Type', ids: ['1'] },
        ];

        // Function to handle vendor processing
        async function processVendorData(encryptedVendorData1) {
          hasError = false;

          const insertVendorPromises = encryptedVendorData1.map(async (vendorData, index) => {
            try {
              const res = await Post(`InsertVender`, vendorData);
              if (res.data.ResponseCode === '100') {
                const vendorLibraryID = decrypt(res.data.ServiceRes[0].VenderLibraryID);
                console.log(`Vendor ${index + 1}:`, vendorLibraryID);

                // Create batch requests for InsertVendorDetail
                const detailRequests = types.flatMap(({ type, ids }) =>
                  ids.map((id) => {
                    const body = [{ VenderID: vendorLibraryID, ID: id, Type: type }];
                    return InsertVendorDetail(body);
                  })
                );

                // Wait for all InsertVendorDetail requests in parallel
                await Promise.all(detailRequests);
              } else {
                console.log(`Something went wrong for vendor ${index + 1}`, res.data);
                hasError = true;
              }
            } catch (error) {
              console.error(`Error processing vendor ${index + 1}`, error);
              hasError = true;
            }
          });

          // Wait for all vendor insertions to complete
          await Promise.all(insertVendorPromises);
        }

        // Call the function
        await processVendorData(encryptedVendorData);
        console.log('hasError:', hasError);
        // Show success message only if no errors occurred
        if (!hasError) {
          enqueueSnackbar('Suppliers Added!', { variant: 'success' });
        } else {
          enqueueSnackbar('Some suppliers failed to add.', { variant: 'error' });
        }
        uploadClose();
        FetchUpdatedData();
      } catch (error) {
        console.log(error);
        enqueueSnackbar('Something Went Wrong!', { variant: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enqueueSnackbar, uploadClose, FetchUpdatedData, userID]
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
      const customHeaders = [
        'VenderName',
        // 'ShortName',
        'Address1',
        'CountryID',
        'City',
        'OnBoardingEmail',
      ];

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

      console.log(filteredData);

      await InsertVendor(filteredData);
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
                <a href="/assets/file/preonboardsupplerlist.xlsx" download>
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
};
