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
import { APP_API } from 'src/config-global';

const generateProductName = ({ yarnCode, yarnCount, composition, color }) => {
  if (
    yarnCode === undefined ||
    yarnCount === undefined ||
    composition === undefined ||
    color === undefined
  ) {
    return '';
  }

  const productCode = `${yarnCode?.Yarn_Code || ''} - ${yarnCount?.Yarn_Count_Name || ''} -  ${
    composition?.Composition_Name || ''
  }  (${color?.ColorName || ''})`;
  return productCode;
};

export default function UploadExcelDialog({
  uploadOpen,
  uploadClose,
  FetchUpdatedData,
  tableData,
}) {
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const { enqueueSnackbar } = useSnackbar();

  const [compositions, setCompositions] = useState([]);
  const [counts, setCounts] = useState([]);
  const [types, setTypes] = useState([]);
  const [colors, setColors] = useState([]);
  const [UOM, setUOM] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dictionaryData, setDictionaryData] = useState();

  const [file, setFile] = useState(null);

  const [filePreview, setFilePreview] = useState(null);

  const [downloaded, setDownloaded] = useState(false);

  const ApiGetCount = useCallback(async () => {
    try {
      const response = await Get(
        `Activeyarncount?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setCounts(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetTypeList = useCallback(async () => {
    try {
      const response = await Get(
        `getActiveyarntype?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setTypes(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetCompositionList = useCallback(async () => {
    try {
      const response = await Get(
        `yarncomposition/GetActiveCompositions?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setCompositions(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetColorList = useCallback(async () => {
    try {
      const response = await Get(
        `colors/active?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setColors(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetUOM = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllActiveUOM?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setUOM(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        ApiGetCount(),
        APIGetTypeList(),
        APIGetCompositionList(),
        APIGetColorList(),
        APIGetUOM(),
      ]);
      setIsLoading(false);
    };
    fetchData();
  }, [ApiGetCount, APIGetTypeList, APIGetCompositionList, APIGetColorList, APIGetUOM]);
  const handleDownload = () => {
    setDownloaded(true);
  };
  // -------------------- Post Dictionary ----------------------

  const InsertVendor = useCallback(
    async (fileData) => {
      setIsSubmitting(true);
      try {
        // Add extra fields to each object in fileData
        const modifiedVendorData = fileData.map((X) => ({
          ...X,
          Product_Name:
            generateProductName({
              yarnCode: types.find((type) => type.Yarn_Type_ID === X.Yarn_Type_ID),
              yarnCount: counts.find((count) => count.Yarn_Count_ID === X.Yarn_Count_ID),
              composition: compositions.find(
                (composition) => composition.Composition_ID === X.Composition_ID
              ),
              color: colors.find((color) => color.ColorID === X.ColorID),
            }) || '',
          Yarn_Code: types.find((type) => type.Yarn_Type_ID === X.Yarn_Type_ID)?.Yarn_Code || null,
          UOM_ID: X.UOMID,
          Color_ID: X.ColorID,
          YarnCountID: X.Yarn_Count_ID,
          Commercial_Name: '',
          CreatedBy: userData?.userDetails?.userId,
          UpdatedBy: userData?.userDetails?.userId,
          IsActive: true,
          Branch_ID: userData?.userDetails?.branchID,
          Org_ID: userData?.userDetails?.orgId,
        }));

        const ProductsWithName =
          modifiedVendorData.filter((dataa) => dataa.Product_Name !== '') || [];

        const filteredData2 = ProductsWithName.filter(
          (item) =>
            !tableData.some(
              (existingItem) =>
                existingItem?.Product_Name.replace(/\s+/g, ' ').trim().toLowerCase() ===
                item?.Product_Name.replace(/\s+/g, ' ').trim().toLowerCase()
            )
        );

        if (filteredData2.length > 0) {
          const response = await Post(`MultipleComposedPrdt`, filteredData2);

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
      const customHeaders = ['Yarn_Count_ID', 'ColorID', 'Yarn_Type_ID', 'Composition_ID', 'UOMID'];

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
                  href={`${APP_API}export/UnitLocationBulkUpload`}
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
