import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { Get } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import { APP_API } from 'src/config-global';

export default function ItemReceiveDialog({ uploadClose, uploadOpen }) {
  const { enqueueSnackbar } = useSnackbar();

  const DateSchema = Yup.object().shape({
    startDate: Yup.date().nullable(),
    endDate: Yup.date()
      .nullable()
      .min(Yup.ref('startDate'), 'End Date cannot be before Start Date'),
  });

  const methods = useForm({
    resolver: yupResolver(DateSchema),
    defaultValues: {
      startDate: null,
      endDate: null,
    },
  });

  const {
    reset,
    watch,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;
  const values = watch();
  const [loading, setLoading] = useState(false);

  const [download, setDownload] = useState(null);
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const onSubmit = async (data) => {
    try {
      const { startDate, endDate } = data;

      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // shift to local date
        return d.toISOString().split('T')[0];
      };

      const formattedStart = formatDate(startDate);
      const formattedEnd = formatDate(endDate);

      // ${APP_API}/exportReceiveReport?Org_Id=1&Branch_Id=6

      const response = await axios.get(
        `${APP_API}exportReceiveReport?Org_Id=${
          userData?.userDetails?.orgId
        }&Branch_Id=${userData?.userDetails?.branchID}&fromDate=${formattedStart || null}&toDate=${
          formattedEnd || null
        }`,
        { responseType: 'blob' }
      );
      // Verify the Blob
      if (!(response.data instanceof Blob)) {
        throw new Error('Response is not a Blob');
      }

      // Create download link
      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], {
          type:
            response.headers['content-type'] ||
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
      );

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'ItemReceiveReport.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      enqueueSnackbar('Download successful!', { variant: 'success' });
    } catch (error) {
      console.error('Download failed:', error);
      enqueueSnackbar('Download failed. Please try again.', { variant: 'error' });
    }
  };

  return (
    <Dialog open={uploadOpen} onClose={uploadClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontSize: '20px !important' }}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Export Item Receive Report
          </Typography>
          <IconButton onClick={uploadClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Controller
              name="startDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DesktopDatePicker
                  label="From"
                  format="dd MMM yyyy"
                  value={field.value}
                  onChange={field.onChange}
                  renderInput={(params) => (
                    <TextField {...params} error={!!error} helperText={error?.message} fullWidth />
                  )}
                />
              )}
            />
            <Controller
              name="endDate"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DesktopDatePicker
                  label="To"
                  format="dd MMM yyyy"
                  value={field.value}
                  onChange={field.onChange}
                  renderInput={(params) => (
                    <TextField {...params} error={!!error} helperText={error?.message} fullWidth />
                  )}
                />
              )}
            />
            {/* <RHFAutocomplete
              name="KAM"
              label="Key Account Manager"
              placeholder="Choose an option"
              fullWidth
 
              options={allKAMs}
              getOptionLabel={(option) => option?.Username}
              value={values.KAM || null}
            /> */}
          </Stack>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
            <Button variant="outlined" onClick={uploadClose} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Iconify icon="mdi:download" />}
              disabled={isSubmitting}
              color="primary"
            >
              {isSubmitting ? 'Downloading...' : 'Download'}
            </Button>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

ItemReceiveDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
};
