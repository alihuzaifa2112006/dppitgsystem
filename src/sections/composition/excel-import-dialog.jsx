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
import { Get, Post } from 'src/api/apibasemethods';
import { decrypt, encrypt } from 'src/api/encryption';
import { fPercent } from 'src/utils/format-number';
import { APP_API } from 'src/config-global';

const generateCompositionName = (
  primaryratio,
  primaryName,
  secondaryratio,
  secondaryName,
  additionalRatio,
  additionalName
) => {
  const parts = [];

  if (primaryratio != null && primaryName != null) {
    parts.push(`${primaryratio} ${primaryName}`);
  }

  if (secondaryratio != null && secondaryName != null) {
    parts.push(`${secondaryratio} ${secondaryName}`);
  }

  if (additionalRatio != null && additionalName != null) {
    parts.push(`${additionalRatio} ${additionalName}`);
  }

  return parts.join(' ');
};

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
  const [dictionaryData, setDictionaryData] = useState();
  const [blendName, setBlendName] = useState({});

  const [file, setFile] = useState(null);

  const [filePreview, setFilePreview] = useState(null);

  const [downloaded, setDownloaded] = useState(false);

  const FetchBlendNames = useCallback(async () => {
    try {
      const res1 = await Get(`blend/bytypeID/1`);
      const res2 = await Get(`blend/bytypeID/3`);
      const res3 = await Get(`blend/bytypeID/4`);
      // eslint-disable-next-line
      setBlendName([...res1?.data?.Data, ...res2?.data?.Data, ...res3?.data?.Data]);
    } catch (error) {
      console.error(error);
    }
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchBlendNames()]);
    };
    fetchData();
  }, [FetchBlendNames]);

  const handleDownload = () => {
    setDownloaded(true);
  };
  // -------------------- Post Dictionary ----------------------
  const InsertVendor = useCallback(
    async (fileData) => {
      setIsSubmitting(true);

      try {
        // check if the ColorName and Yarn_Code exists in the table, if yes then exclude them from the fileData

        // Add extra fields to each object in fileData

        const modifiedVendorData = fileData.map((X) => ({
          Sustainability_Certification: X?.Sustainability_Certification || 0,
          Composition_Name: generateCompositionName(
            fPercent(X.Primary_Blend_RATIO),
            blendName.find((x) => x.Blend_Name_ID === X.Primary_Blend)?.Blend_Names,
            fPercent(X.Secondary_Blend_RATIO),
            blendName.find((x) => x.Blend_Name_ID === X.Secondary_Blend)?.Blend_Names,
            fPercent(X.Additional_Blend_RATIO),
            blendName.find((x) => x.Blend_Name_ID === X.Additional_Blend)?.Blend_Names
          ),
          CreatedBy: userData?.userDetails?.userId,
          UpdatedBy: userData?.userDetails?.userId,
          IsActive: true,
          Branch_ID: userData?.userDetails?.branchID,
          Org_ID: userData?.userDetails?.orgId,
          Total_Blend_Ratio: X.Total_Blend_Ratio,
          Details: [
            {
              Blend_Type_ID: 1,
              Blend_Name_ID: X.Primary_Blend,
              Blend_Ratio_Percentage: X.Primary_Blend_RATIO,
              CreatedBy: userData?.userDetails?.userId,
              UpdatedBy: userData?.userDetails?.userId,
              IsActive: true,
              Branch_ID: userData?.userDetails?.branchID,
              Org_ID: userData?.userDetails?.orgId,
            },
            {
              Blend_Type_ID: 3,
              Blend_Name_ID: X.Secondary_Blend,
              Blend_Ratio_Percentage: X.Secondary_Blend_RATIO,
              CreatedBy: userData?.userDetails?.userId,
              UpdatedBy: userData?.userDetails?.userId,
              IsActive: true,
              Branch_ID: userData?.userDetails?.branchID,
              Org_ID: userData?.userDetails?.orgId,
            },
            {
              Blend_Type_ID: 4,
              Blend_Name_ID: X.Additional_Blend,
              Blend_Ratio_Percentage: X.Additional_Blend_RATIO,
              CreatedBy: userData?.userDetails?.userId,
              UpdatedBy: userData?.userDetails?.userId,
              IsActive: true,
              Branch_ID: userData?.userDetails?.branchID,
              Org_ID: userData?.userDetails?.orgId,
            },
          ],
        }));

        const CompositionsWithName =
          modifiedVendorData.filter(
            // eslint-disable-next-line
            (dataa) => dataa.Composition_Name !== '' && dataa.Total_Blend_Ratio == 100
          ) || [];

        const filteredData2 = CompositionsWithName.filter(
          (item) =>
            !tableData.some(
              (existingItem) =>
                existingItem.Composition_Name.replace(/\s+/g, ' ').trim().toLowerCase() ===
                item.Composition_Name.replace(/\s+/g, ' ').trim().toLowerCase()
            )
        );
        if (filteredData2.length > 0) {
          const response = await Post(`yarncompositionBulkUpload`, filteredData2);

          if (response.status === 200) {
            enqueueSnackbar('Colors added successfully!', { variant: 'success' });
          }
          uploadClose();
          FetchUpdatedData();
        } else {
          enqueueSnackbar('No data to insert, it may already exists', {
            variant: 'warning',
          });
        }
      } catch (error) {
        console.log(error);
        enqueueSnackbar('Something Went Wrong!', { variant: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enqueueSnackbar, uploadClose, FetchUpdatedData]
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
        'Primary_Blend',
        'Primary_Blend_RATIO',
        'Secondary_Blend',
        'Secondary_Blend_RATIO',
        'Additional_Blend',
        'Additional_Blend_RATIO',
        'Total_Blend_Ratio',
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
                <a
                  href={`${APP_API}export/YarnCompositionDataUpload`}
                  download
                >
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
};
