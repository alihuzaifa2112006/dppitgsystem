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

  const handleDownload = () => {
    setDownloaded(true);
  };
  // -------------------- Post Dictionary ----------------------

  const InsertVendor = useCallback(
    async (fileData) => {
      setIsSubmitting(true);

      try {
        // Process and format the data according to the new API structure
        const items = fileData.map((item) => ({
          InvTypeID: 2 || 0,
          BlendTypeID: item.BlendTypeID || 0,
          InvCatID: item.InvCatID || 0,
          InvSubCatID: item.InvSubCatID || 0,
          ColorFamilyID: item.ColorFamilyID || 0,
          OriginID: item.OriginID || 0,
          Price: parseFloat(item.Price) || 0,
          isActive: item.isActive !== undefined ? item.isActive : true,
          CreatedBy: userData?.userDetails?.userId || 0,
          Org_id: userData?.userDetails?.orgId || 0,
          Branch_id: userData?.userDetails?.branchID || 0,
        }));

        // Wrap items in the required structure
        const requestData = {
          Items: items,
        };
        console.log(items, 'item here');
        console.log(fileData, 'response here');

        const response = await Post(`AICosting/BulkUpload`, requestData);

        if (response.status === 200) {
          enqueueSnackbar('Material Price items added successfully!', { variant: 'success' });
        }
        uploadClose();
        FetchUpdatedData();
      } catch (error) {
        console.error(error);
        // enqueueSnackbar(error?.response?.data?.message || 'Something Went Wrong!', { variant: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uploadClose, FetchUpdatedData, userData]
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

  const { reset, setValue, handleSubmit } = methods;

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

      // ✔ Read Excel with header row
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      console.log('RAW EXCEL:', json);

      // ✔ Remove empty or invalid rows
      const filteredData = json.filter(
        (row) =>
          row.Class !== '' &&
          row.FiberCategory !== '' &&
          row.FiberSubCategory !== '' &&
          row.ColorFamily !== '' &&
          row.Origin !== '' &&
          row.Price !== ''
      );

      // ✔ Convert Price to number
      const cleanedData = filteredData.map((row) => ({
        InvTypeID: Number(row.Class) || 0,
        BlendTypeID: Number(row.Class) || 0,
        InvCatID: Number(row.FiberCategory) || 0,
        InvSubCatID: Number(row.FiberSubCategory) || 0,
        ColorFamilyID: Number(row.ColorFamily) || 0,
        OriginID: Number(row.Origin) || 0,
        Price: Number(row.Price) || 0,
      }));

      console.log('FINAL CLEANED DATA:', cleanedData);

      await InsertVendor(cleanedData);
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
      <DialogTitle sx={{ fontSize: '20px !important' }}>
        Upload Material Price Excel File
      </DialogTitle>

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
                  href={`${APP_API}export/FiberCostingExcel?Org_id=${userData?.userDetails?.orgId}&branch_id=${userData?.userDetails?.branchID}`}
                  download="CostingPlanBulk.xlsx"
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
