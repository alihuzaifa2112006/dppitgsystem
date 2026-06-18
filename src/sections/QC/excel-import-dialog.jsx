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
import Image from 'src/components/image';

export default function UploadExcelDialog({
  uploadOpen,
  uploadClose,
  image,
  FetchUpdatedData,
  QC_ID,
}) {
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dictionaryData, setDictionaryData] = useState();

  const [file, setFile] = useState(image || null);

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
        // check if the ColorName and Yarn_Code exists in the table, if yes then exclude them from the fileData

        const data = new FormData();
        data.append('QC_ID', QC_ID);
        data.append('file', fileData);
        const response = await Post(`UploadQCAttachment`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 200) {
          enqueueSnackbar('Inventory Categories added successfully!', { variant: 'success' });
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
      console.log(file2.type);
      if (file2.type === 'application/pdf') {
        setFile(file2);
        // setFilePreview(newFile); // Store file preview
        setValue('ExcelFile', file2, { shouldValidate: true });
      } else {
        const newFile = Object.assign(file2, {
          preview: URL.createObjectURL(file2),
        });
        setFile(newFile);
        // setFilePreview(newFile); // Store file preview
        setValue('ExcelFile', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );
  //   const handleCertficateFileUpload = (acceptedFiles) => {
  //   const file2 = acceptedFiles[0];
  //   if (file2) {
  //       setFile(file2);
  //            setValue('ExcelFile', newFile, { shouldValidate: true });

  //   }
  // };

  const handleFileChange = async () => {
    const uploadedFile = file;
    // console.log('uploadedFile', uploadedFile);
    await InsertVendor(uploadedFile);
    // };

    // reader.readAsArrayBuffer(uploadedFile);
  };

  // Function to remove the file and reset the state
  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null); // Reset the preview
    setValue('ExcelFile', null, { shouldValidate: true });
  };
  // console.log('filePreview', filePreview);
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
      <DialogTitle sx={{ fontSize: '20px !important' }}>Upload Attachments</DialogTitle>

      {isLoading ? (
        renderLoading
      ) : (
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Grid container>
            <Grid xs={12} md={12}>
              <DialogContent>
                {/* <Typography sx={{ mb: 1, fontSize: '14px' }} variant="body1">
                  Please download the Excel format.
                </Typography>
                <a href="${APP_API}export/InvSubCategory" download>
                  <Button
                    endIcon={<Iconify icon="mynaui:cloud-download" />}
                    onClick={handleDownload}
                    color="primary"
                    variant="contained"
                  >
                    Download File
                  </Button>
                </a>

                <br /> */}
                {/* <Typography sx={{ mt: 3, mb: 1, fontSize: '14px' }} variant="body1">
                  If you have already downloaded the file, you can upload it now.
                </Typography> */}
                <RHFUpload
                  accept={{
                    // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    // 'application/vnd.ms-excel': ['.xls'],
                    'image/*': ['.png', '.jpg', '.jpeg'],
                    'application/pdf': ['.pdf'],
                  }}
                  name="ExcelFile"
                  // multiple
                  title="Upload File"
                  file={file}
                  onDrop={handleUpload}
                  maxSize={3145728}
                  onDelete={() => setFile(null)}
                />

                {/* File Preview */}
                {filePreview && (
                  <Box mt={2} display="flex" justifyContent="space-between">
                    {/* <Image src={filePreview.preview} alt="File Preview" /> */}
                    <Typography variant="body2">Type: {filePreview.type}</Typography>
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
  image: PropTypes.any,
  FetchUpdatedData: PropTypes.any,
  QC_ID: PropTypes.any,
};
