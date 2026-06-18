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
    const masterSheet = workbook.Sheets[workbook.SheetNames[0]];
    const detailSheet = workbook.Sheets[workbook.SheetNames[1]];
    const jsonData = XLSX.utils.sheet_to_json(masterSheet, { header: 1 });
    const jsonDetailData = XLSX.utils.sheet_to_json(detailSheet, { header: 1 });

    // Process master data starting from row 2 (index 1) - skip header
    const processedData = jsonData.slice(1).map((row) => ({
      ItemOpenID: row[0] || null, // Column A
      ItemID: row[1] || null, // Column B
      UOMID: row[2] || null, // Column C
      CurrencyID: row[3] || null, // Column D
      // Add additional fields as needed
      Org_Id: userData?.userDetails?.orgId || 1,
      Branch_Id: userData?.userDetails?.branchID || 1,
      Created_By: userData?.userDetails?.userId || 1001,
      Details: [], // Initialize empty details array
    }));

    // Process detail data starting from row 2 (index 1) - skip header
    const processedDetailData = jsonDetailData.slice(1).map((row) => ({
      ItemOpenID: row[0] || null, // Column A
      ItemID: row[1] || null, // Column B
      OpenStockQty: row[2] || 0, // Column C
      VendorID: row[3] || null, // Column D
      LocationID: row[4] || null, // Column E (StoreID/Unit Location)
      StorageID: row[5] || null, // Column F (Storage Location)
      AveragePrice: row[6] || 0, // Column G
      TotalPriceinBDT: row[7] || 0, // Column H
      TotalPriceinUSD: row[8] || 0, // Column I
    }));

    // Group details by ItemOpenID and merge with master data
    const detailsByItemOpenID = {};
    processedDetailData.forEach((detail) => {
      if (detail.ItemOpenID) {
        if (!detailsByItemOpenID[detail.ItemOpenID]) {
          detailsByItemOpenID[detail.ItemOpenID] = [];
        }
        // Remove ItemOpenID from detail since it's not needed in the final detail object
        const { ItemOpenID, ...detailWithoutID } = detail;
        detailsByItemOpenID[detail.ItemOpenID].push(detailWithoutID);
      }
    });

    // Merge details into master data
    const result = processedData.map((master) => {
      // Find details for this ItemOpenID
      const details = detailsByItemOpenID[master.ItemOpenID] || [];

      // Remove ItemOpenID from master since it's not needed in the final structure
      const { ItemOpenID, ...masterWithoutID } = master;

      return {
        ...masterWithoutID,
        Details: details,
      };
    });

    // Alternative: Group by ItemID instead of ItemOpenID if needed
    // If you want to group by ItemID instead (in case ItemOpenID is not reliable)
    const resultByItemID = {};
    processedData.forEach((master) => {
      if (master.ItemID) {
        if (!resultByItemID[master.ItemID]) {
          resultByItemID[master.ItemID] = {
            ItemID: master.ItemID,
            UOMID: master.UOMID,
            CurrencyID: master.CurrencyID,
            Org_Id: master.Org_Id,
            Branch_Id: master.Branch_Id,
            Created_By: master.Created_By,
            Details: [],
          };
        }

        // Add details from this master record
        const details = detailsByItemOpenID[master.ItemOpenID] || [];
        resultByItemID[master.ItemID].Details.push(...details);
      }
    });

    // Convert the grouped result to array
    const finalResult = Object.values(resultByItemID);

    console.log('Processed Excel Data:', finalResult);
    return finalResult;
  };
  const handleFileChange = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setIsLoading(true);
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Check if the masterSheet exists
        if (workbook.SheetNames.length === 0) {
          throw new Error('Excel file must contain at least one masterSheet');
        }

        const payload = processExcelData(workbook);

        if (payload.length === 0) {
          enqueueSnackbar('No valid data found in the Excel file', { variant: 'warning' });
          return;
        }

        // Validate required fields
        // const invalidRows = payload.filter(
        //   (item) =>
        //     !item.Inv_Types_ID || !item.Inv_Cat_ID || !item.SubCat_ID || !item.MaterialTypeID
        // );

        // if (invalidRows.length > 0) {
        //   throw new Error(
        //     `${invalidRows.length} rows are missing required IDs (Item Type, Category, Sub Category, or Material Type)`
        //   );
        // }

        // Send to API
        console.log(payload);
        const response = await Post(`upload/InvItemOpeningBulk`, payload);

        if (response.status === 200) {
          if (response?.data?.Inserted > 0)
            enqueueSnackbar(`${response?.data?.Inserted} items added!`, {
              variant: 'success',
            });
          else {
            enqueueSnackbar(
              `${response?.data?.Skipped} items skipped, because of duplication or invalide data!`,
              {
                variant: 'warning',
              }
            );
          }
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
      <DialogTitle sx={{ fontSize: '20px !important' }}>Upload Agent Excel File</DialogTitle>

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
                  href={`${APP_API}export/InvItemOpeningBulk?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`}
                  download="InvItemTransaction.xlsx"
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
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.masterSheet': [
                      '.xlsx',
                    ],
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
