import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Input,
  InputAdornment,
  Typography,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFUpload,
  RHFUploadBox,
} from 'src/components/hook-form';

import { Get, Post } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function AddDptDialog({ uploadClose, uploadOpen, emailData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewPiemailSchema = Yup.object().shape({
    Dpt_Name: Yup.string()
      .required('Piemail Name is required')
      .min(3, 'Piemail Name must be at least 3 characters long')
      .max(100, 'Piemail Name must be less than or equal to 100 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'Piemail Name must only contain letters and spaces'),
  });

  const methods = useForm({
    resolver: yupResolver(NewPiemailSchema),
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  // ------------------------------------

  const PostPiemailData = async (PostData) => {
    try {
      await Post('AddDPT', PostData).then(async (res) => {
        enqueueSnackbar(res.data.Message);
        uploadClose();
        reset(); // Only reset after successful submission
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message, { variant: 'error' });
    }
  };

  const onDptSubmit = handleSubmit(async (data) => {
    if (emailData.some((item) => item.Dpt_Name === data.Dpt_Name)) {
      enqueueSnackbar('Piemail Name already exists', { variant: 'error' });
      return;
    }
    try {
      const dataToSend = {
        Dpt_Name: data.Dpt_Name,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      };
      await PostPiemailData(dataToSend);
    } catch (error) {
      console.error(error);
    }
  });

  const renderLoading = (
    <LoadingScreen
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
      }}
    />
  );

  return (
    <>
      <Dialog
        open={uploadOpen}
        onClose={() => {
          uploadClose(); // Call the original close function
        }}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle sx={{ fontSize: '20px !important' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Email Details
            </Typography>

            <IconButton onClick={uploadClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {emailData ? (
            // <Card key={emailData.PIEmailHistoryID} sx={{ my: 3, p: 3 }}>
            <>
              <Box sx={{ mb: 2 }}>
                <strong>Proforma No:</strong> {emailData.ProformaNo}
              </Box>
              <Box sx={{ mb: 2 }}>
                <strong>Email To:</strong> {emailData.EmailTo}
              </Box>
              <Box sx={{ mb: 2 }}>
                <strong>Email Date:</strong> {fDate(emailData.EmailDate)}
              </Box>
              {/* <Box sx={{ mb: 2 }}>
                <strong>Is Reminder:</strong> {emailData.IsReminder ? 'Yes' : 'No'}
              </Box> */}
              <Box sx={{ mb: 2 }}>
                <strong>Email Body:</strong>
                <Box
                  sx={{ mt: 1, border: '1px solid #ccc', p: 2 }}
                  dangerouslySetInnerHTML={{ __html: emailData.EmailBody }}
                />
              </Box>
              </>
            // </Card>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No email history found for the selected PI No.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

AddDptDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  emailData: PropTypes.array,
};
