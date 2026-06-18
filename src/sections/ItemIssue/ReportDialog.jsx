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

export default function RptDialog({ uploadClose, uploadOpen }) {
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [loading, setLoading] = useState(false);

  const [download, setDownload] = useState(null);
  const [allDept, setAllDept] = useState([]);
  const [allSections, setAllSections] = useState([]);

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
    setValue,
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;
  const values = watch();

  useEffect(() => {
    const FetchAllDpt = async () => {
      try {
        const response = await Get(
          `HRModule/GetDepartmentList?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
        );
        // console.log('Dept:', response.data);
        setAllDept(response.data.Data);
      } catch (error) {
        console.error(error);
      }
    };

    FetchAllDpt();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const selectedDept = watch('Department');

  // 3. Fetch sections when source changes
  const fetchSection = useCallback(async () => {
    if (selectedDept?.DepId) {
      try {
        const response = await Get(
          `GetSectionsByDept?deptId=${selectedDept?.DepId}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setAllSections(response.data || []);
      } catch (error) {
        console.error(error);
        setAllSections([]);
      }
    } else {
      setAllSections([]);
    }
  }, [selectedDept?.DepId, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    if (selectedDept?.DepId) fetchSection();
  }, [fetchSection, selectedDept?.DepId]);

  const selectedSection = watch('Section');

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

      const response = await axios.get(
        `${APP_API}exportIssueReport?Org_Id=${
          userData?.userDetails?.orgId
        }&Branch_Id=${userData?.userDetails?.branchID}&Dept_Id=${selectedDept?.DepId}&Section_Id=${
          selectedSection?.SectionID
        }&fromDate=${formattedStart || null}&toDate=${formattedEnd || null}`,
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
      link.download = 'PsfIssueReport.xlsx';
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
            PSF Issue Report
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
              name="Department"
              label="Department"
              placeholder="Choose an option"
              fullWidth
              options={allDept}
              getOptionLabel={(option) => option?.DepartmentName || ''}
              isOptionEqualToValue={(option, value) => option?.DepId === value?.DepId}
              value={values?.Department || null}
            />

            <RHFAutocomplete
              name="Section"
              label="Section"
              placeholder="Choose an option"
              fullWidth
              options={allSections}
              getOptionLabel={(option) => option?.SectionName || ''}
              isOptionEqualToValue={(option, value) => option?.SectionID === value?.SectionID}
              value={values?.Section || null}
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
};
