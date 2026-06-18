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
  data,
}) {
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dictionaryData, setDictionaryData] = useState();

  const [file, setFile] = useState(null);

  const [filePreview, setFilePreview] = useState(null);

  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloaded(true);
  };

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

  const generateProductName = (row) => {
    // console.log('prdRow', row);
    const productCode = `${
      // eslint-disable-next-line
      data?.types?.find((x) => x.Yarn_Type_ID == row?.YarnTypeID)?.Yarn_Code || ''
      } - ${
      // eslint-disable-next-line
      data?.count?.find((x) => x.Yarn_Count_ID == row?.YarnCountID)?.Yarn_Count_Name || ''
      } -  ${
      // eslint-disable-next-line
      data?.compositions?.find((x) => x.Composition_ID == row?.YarnCompositionID)
        ?.Composition_Name || ''
      // eslint-disable-next-line
      }  (${data?.colors?.find((x) => x.ColorID == row?.ColorID)?.ColorName || ''} - ${
      // eslint-disable-next-line
      data?.colors?.find((x) => x.ColorID == row?.ColorID)?.Color_Code || ''
      })`;
    return productCode;
  };
  const generateItemName = (row) => {
    // console.log('ItmRow', row);

    const productCode = `${
      // eslint-disable-next-line
      data?.classes?.find((x) => x.ClassID == row?.InvTypesID)?.ClassName || ''
      // eslint-disable-next-line
      }-${data?.categories.find((x) => x.Inv_Cat_ID == row?.InvCatID)?.Inv_Cat_Name || ''}-${
      // eslint-disable-next-line
      data?.subCategories.find((x) => x.SubCat_ID == row?.SubCatID)?.SubCat_Name || ''
      }${
      // eslint-disable-next-line
      data?.classes?.find((x) => x.ClassID == row?.InvTypesID)?.isColorSensitive
        ? // eslint-disable-next-line
        ` (${data?.colors?.find((x) => x.ColorID == row?.ColorID)?.ColorName || ''}-${
        // eslint-disable-next-line
        data?.colors?.find((x) => x.ColorID == row?.ColorID)?.Color_Code || ''
        })`
        // eslint-disable-next-line
        : ` ${row?.SparePartID ? `[${data?.spareNames?.find((x) => x.SpareId == row?.SparePartID)?.SpareNameAndNo || ''}]` : ''} ${row?.ItemSpecificationID ? `${data?.invSpecs?.find((x) => x.InvSpecID == row?.ItemSpecificationID)?.InvSpecsName || ''}` : ''
        }`
      // eslint-disable-next-line
      }`;
    return productCode;
  };
  const generatePrefix = (row) => {
    // eslint-disable-next-line
    const yarnTypeCode = data?.types?.find((x) => x.Yarn_Type_ID == row?.YarnTypeID)?.Yarn_Code;
    const countName = data?.count
      // eslint-disable-next-line
      ?.find((x) => x.Yarn_Count_ID == row?.YarnCountID)
      ?.Yarn_Count_Name?.split('/')
      .join('');
    const compositionValues = (() => {
      const name =
        // eslint-disable-next-line
        data?.compositions?.find((x) => x?.Composition_ID == row?.YarnCompositionID)
          ?.Composition_Name || '';
      const matches = name.match(/\d+%/g) || []; // Match all percentages
      const first = matches[0]?.replace('%', '').padStart(3, '0') || '000';
      const second = matches[1]?.replace('%', '').padStart(2, '0') || '00';
      return `${first}${second}`; // e.g., '06030', '10000'
    })();

    const itemCode = `FG${yarnTypeCode}-${countName}${compositionValues}-${
      // eslint-disable-next-line
      data?.colors?.find((x) => x?.ColorID == row?.ColorID)?.Color_Code
      }`;
    return itemCode;
  };

  // -------------------- Post Dictionary ----------------------

  const InsertVendor = useCallback(
    async (fileData) => {
      setIsSubmitting(true);
      // console.log('fileData', fileData);

      try {
        const filteredData2 = fileData.filter(
          (item) =>
            !tableData.some(
              (existingItem) =>
                existingItem.ItemDescription.toLowerCase().trim() ===
                item.ItemDescription.toLowerCase().trim()
            )
        );

        // Add extra fields to each object in fileData (including the new columns)
        const modifiedVendorData = filteredData2.map((X) => ({
          ...X,
          // eslint-disable-next-line
          ItemCode: X?.InvTypesID === 6 ? X.ItemCode : null,
          MaterialTypeID: 0,
          SafetyStockQty: X?.SafetyStockQty || 0,
          // ReOrderQty: X?.ReOrderQty || 0,
          // eslint-disable-next-line
          isFG: X?.InvTypesID === 6 ? true : false,
          Created_By: userData?.userDetails?.userId,
          Branch_Id: userData?.userDetails?.branchID,
          Org_Id: userData?.userDetails?.orgId,
          Is_Active: true,
        }));
        // console.log('Modified', modifiedVendorData);

        const response = await Post(`AddBulkItemDB`, modifiedVendorData);

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
    [enqueueSnackbar, uploadClose, FetchUpdatedData, tableData, userData]
  );
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
      const dataA = new Uint8Array(m.target.result);
      const workbook = XLSX.read(dataA, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Define your custom headers
      const customHeaders = [
        // 'SparePartID',
        'ItemSpecificationID',
        'InvTypesID',
        'InvCatID',
        'SubCatID',
        'ColorFamilyID',
        'ColorID',
        'ReOrderQty',
        'SafetyStockQty',
        'YarnTypeID',
        'YarnCountID',
        'YarnCompositionID',
        'UOMID',
        'ItemCode', // Add this
        'ItemDescription', // Add this
      ];

      // Ensure the number of custom keys matches the number of columns in your Excel sheet
      if (customHeaders.length - 2 !== json[0].length) {
        enqueueSnackbar('Invalid Excel File!', { variant: 'error' });

        console.error(
          'Number of custom keys does not match the number of columns in the Excel sheet'
        );
        return;
      }

      const jsonData = json.slice(1).map((row) => {
        const obj = customHeaders.reduce((acc, header, index) => {
          acc[header] = row[index];
          return acc;
        }, {});

        // Generate ItemCode and ItemDescription based on business logic
        if (obj.InvTypesID === 6) {
          // For ClassID 6, use ProductName logic
          obj.ItemDescription = generateProductName(obj);
        } else {
          // For other classes, use regular ItemDescription logic
          obj.ItemDescription = generateItemName(obj);
        }

        // Generate ItemCode
        obj.ItemCode = generatePrefix(obj);
        return obj;
      });

      // Remove objects with any key being undefined (excluding the new columns)
      const filteredData = jsonData.filter(
        (obj) =>
          !Object.keys(obj).some(
            (key) => key !== 'ItemCode' && key !== 'ItemDescription' && obj[key] === undefined
          )
      );

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

  const onSubmit = handleSubmit(async (dta) => {
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
                <a href={`${APP_API}DownloadInventoryExcel`} download>
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
  data: PropTypes.shape({
    classes: PropTypes.array,
    categories: PropTypes.array,
    subCategories: PropTypes.array,
    colors: PropTypes.array,
    compositions: PropTypes.array,
    types: PropTypes.array,
    invSpecs: PropTypes.array,
    colorFamilies: PropTypes.array,
    count: PropTypes.array,
    spareNames: PropTypes.array,
  }),
};
