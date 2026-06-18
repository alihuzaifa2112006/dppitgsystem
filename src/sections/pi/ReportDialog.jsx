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

export default function RptDialog({ uploadClose, uploadOpen, allPI }) {
  const { enqueueSnackbar } = useSnackbar();

  const DateSchema = Yup.object().shape({
    startDate: Yup.date().nullable(),
    endDate: Yup.date()
      .nullable()
      // .required('End Date is required')
      .min(Yup.ref('startDate'), 'End Date cannot be before Start Date'),
  });

  const methods = useForm({
    resolver: yupResolver(DateSchema),
    defaultValues: {
      startDate: null,
      endDate: null,
      PIID: [],
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
  const [allKAMs, setAllKAMs] = useState([]);
  const [allTypes, setAllTypes] = useState([]);

  const [download, setDownload] = useState(null);
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const GetKAMs = useCallback(async () => {
    try {
      const response = await Get(
        `GetAlLRegistereKAM?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllKAMs(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetTypeList = useCallback(async () => {
    try {
      const response = await Get(
        `getActiveyarntype?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllTypes(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([GetKAMs(), APIGetTypeList()]);
      setLoading(false);
    };
    fetchData();
  }, [GetKAMs, APIGetTypeList]);

  const onSubmit = async (data) => {
    try {
      const { startDate, endDate, KAM, Yarn_Type_ID, PIID } = data;
      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // shift to local date
        return d.toISOString().split('T')[0];
      };

      const formattedStart = formatDate(startDate);
      const formattedEnd = formatDate(endDate);
      const Kam = KAM?.UserID;
      const response = await axios.get(
        `${APP_API}export/ProformaInvoiceExcelReport?fromDate=${
          formattedStart || null
        }&toDate=${formattedEnd || null}&KAM=${Kam || null}&YarnTypeID=${
          Yarn_Type_ID?.Yarn_Type_ID || null
        }&piNos=${PIID?.length > 0 ? PIID.map((x) => x.PINo).join(',') : null}`,
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
      link.download = 'ProformaInvoiceReport.xlsx';
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
            Download Excel Report
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
                  label="Start Date"
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
                  label="End Date"
                  format="dd MMM yyyy"
                  value={field.value}
                  onChange={field.onChange}
                  renderInput={(params) => (
                    <TextField {...params} error={!!error} helperText={error?.message} fullWidth />
                  )}
                />
              )}
            />
            <RHFAutocomplete
              name="KAM"
              label="Key Account Manager"
              placeholder="Choose an option"
              fullWidth
              options={allKAMs}
              getOptionLabel={(option) => option?.Username}
              value={values.KAM || null}
            />
            <RHFAutocomplete
              name="Yarn_Type_ID"
              label="Yarn Type"
              placeholder="Choose an option"
              fullWidth
              options={allTypes}
              value={values?.Yarn_Type_ID || null}
              getOptionLabel={(option) => option?.Yarn_Type || ''}
              isOptionEqualToValue={(option, value) => {
                if (!option || !value) return false;
                return option.Yarn_Type_ID === value.Yarn_Type_ID;
              }}
            />
            <RHFAutocomplete
              name="PIID"
              label="Proforma Invoice"
              placeholder="Choose an option"
              fullWidth
              options={allPI || []}
              multiple
              value={values?.PIID || []}
              getOptionLabel={(option) => option?.PINo || ''}
              isOptionEqualToValue={(option, value) => {
                if (!option || !value) return false;
                return option.PINo === value.PINo;
              }}
            />
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

RptDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  allPI: PropTypes.array,
};
