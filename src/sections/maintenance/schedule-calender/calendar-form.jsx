import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { Typography } from '@mui/material';

import { mutate } from 'swr';

import { isAfter, fTimestamp } from 'src/utils/format-time';

import { deleteEvent } from 'src/api/calendar';
import { Get, Post } from 'src/api/apibasemethods';
import { endpoints } from 'src/utils/axios';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { ColorPicker } from 'src/components/color-utils';
import FormProvider, { RHFAutocomplete, RHFSwitch } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function CalendarForm({
  currentEvent,
  colorOptions,
  machines,
  onClose,
  selectedData,
  onSchedulesUpdate,
  date,
  effectiveScheduleId,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const isEdit = Boolean(currentEvent?.id);
  const [scheduleMstID, setScheduleMstID] = useState(null);
  const EventSchema = Yup.object().shape({
    // title: Yup.string().max(255).required('Title is required'),
    Machine: Yup.object().required('Machine is required'),
    // description: Yup.string().max(5000, 'Description must be at most 5000 characters'),
    // not required
    color: Yup.string(),
    allDay: Yup.boolean(),
    start: Yup.mixed(),
    end: Yup.mixed(),
  });

  const mergedColorOptions = useMemo(() => {
    const base = Array.isArray(colorOptions) ? colorOptions : [];
    const currentColor = currentEvent?.color;
    if (currentColor && !base.includes(currentColor)) {
      return [...base, currentColor];
    }
    return base;
  }, [colorOptions, currentEvent?.color]);

  const methods = useForm({
    resolver: yupResolver(EventSchema),
    defaultValues: currentEvent,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const dateError = isAfter(values.start, values.end);

  useEffect(() => {
    reset(currentEvent);
  }, [currentEvent, reset]);

  useEffect(() => {
    if (currentEvent?.ScheduleMst_ID || currentEvent?.scheduleMstId) {
      setScheduleMstID(currentEvent?.ScheduleMst_ID || currentEvent?.scheduleMstId);
    }
  }, [currentEvent?.ScheduleMst_ID, currentEvent?.scheduleMstId]);

  useEffect(() => {
    if (currentEvent?.MachineID && machines.length) {
      const matchedMachine = machines.find((item) => item?.MachineID === currentEvent?.MachineID);
      if (matchedMachine) {
        setValue('Machine', matchedMachine, { shouldValidate: true });
      }
    }
  }, [currentEvent?.MachineID, machines, setValue]);

  const fetchScheduleDetails = useCallback(
    async (scheduleId) => {
      if (!scheduleId) {
        return;
      }

      try {
        const response = await Get(
          `GetMachineScheduleByID?scheduleMstID=${scheduleId}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );
        const scheduleData = response?.data?.data;
        if (scheduleData) {
          onSchedulesUpdate?.(scheduleData);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [onSchedulesUpdate, userData?.userDetails?.branchID, userData?.userDetails?.orgId]
  );
  console.log('month', date.getMonth() + 1);
  console.log('year', date.getFullYear());

  const onSubmit = handleSubmit(async (data) => {
    if (!selectedData?.DeptID || !selectedData?.SectionID || !selectedData?.LineID) {
      enqueueSnackbar('Please select Department, Section and Line before saving.', {
        variant: 'warning',
      });
      return;
    }

    const payload = {
      ScheduleMst_ID: currentEvent?.ScheduleMst_ID || scheduleMstID || effectiveScheduleId || 0,
      DeptID: selectedData?.DeptID,
      SectionID: selectedData?.SectionID,
      LineID: selectedData?.LineID,
      CreatedBy: userData?.userDetails?.userId || '',
      OrgId: userData?.userDetails?.orgId || '',
      BranchId: userData?.userDetails?.branchID || '',
      Month: date.getMonth() + 1,
      Year: date.getFullYear(),
      Comments: '',
      Remarks: '',
      Schedules: [
        {
          ScheduleDtl_ID: currentEvent?.ScheduleDtl_ID || 0,
          MachineID: data?.Machine?.MachineID || null,
          AllDay: data?.allDay || false,
          Color: data?.color || '',
          Start: data?.start ? new Date(data.start).toISOString() : null,
          End: data?.end ? new Date(data.end).toISOString() : null,
          Comments: '',
          Remarks: '',
        },
      ],
    };

    try {
      if (!dateError) {
        const response = await Post('AddOrUpdateMachineSchedule', payload);
        enqueueSnackbar(
          isEdit ? 'Schedule updated successfully!' : 'Schedule created successfully!',
          {
            variant: 'success',
          }
        );
        const scheduleData = response?.data?.data;
        const savedScheduleId =
          scheduleData?.ScheduleMst_ID ||
          response?.data?.ScheduleMst_ID ||
          scheduleMstID ||
          currentEvent?.ScheduleMst_ID ||
          currentEvent?.scheduleMstId ||
          null;

        if (savedScheduleId) {
          setScheduleMstID(savedScheduleId);
          if (scheduleData?.Schedules?.length) {
            onSchedulesUpdate?.(scheduleData);
          } else {
            await fetchScheduleDetails(savedScheduleId);
          }
        }

        mutate(endpoints.calendar.list);
        onClose();
        reset();
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to save schedule.', { variant: 'error' });
    }
  });

  const onDelete = useCallback(async () => {
    try {
      await deleteEvent(`${currentEvent?.id}`);
      enqueueSnackbar('Delete success!');
      onClose();
    } catch (error) {
      console.error(error);
    }
  }, [currentEvent?.id, enqueueSnackbar, onClose]);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3} sx={{ px: 3 }}>
        {machines.length === 0 && (
          <Typography variant="caption" color="error">
            No machines found in this department, section and line.
          </Typography>
        )}
        {/* <RHFTextField name="title" label="Title" /> */}
        <RHFAutocomplete
          name="Machine"
          label="Machine"
          options={machines}
          getOptionLabel={(option) => option?.NameandCode || ''}
          isOptionEqualToValue={(option, value) => option?.MachineID === value?.MachineID}
        />

        {/* <RHFTextField name="description" label="Description" multiline rows={3} /> */}
        <RHFSwitch name="allDay" label="All day" />
        <Controller
          name="start"
          control={control}
          render={({ field }) => (
            <MobileDateTimePicker
              {...field}
              value={new Date(field.value)}
              onChange={(newValue) => {
                if (newValue) {
                  field.onChange(fTimestamp(newValue));
                }
              }}
              label="Start date"
              format="dd/MM/yyyy hh:mm a"
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          )}
        />
        <Controller
          name="end"
          control={control}
          render={({ field }) => (
            <MobileDateTimePicker
              {...field}
              value={new Date(field.value)}
              onChange={(newValue) => {
                if (newValue) {
                  field.onChange(fTimestamp(newValue));
                }
              }}
              label="End date"
              format="dd/MM/yyyy hh:mm a"
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: dateError,
                  helperText: dateError && 'End date must be later than start date',
                },
              }}
            />
          )}
        />
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <ColorPicker
              selected={field.value}
              onSelectColor={field.onChange}
              colors={mergedColorOptions}
              // limit={5}
              sx={{ mx: 0 }}
            />
          )}
        />
      </Stack>

      <DialogActions>
        {!!currentEvent?.id && (
          <Tooltip title="Delete Event">
            <IconButton onClick={onDelete}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={dateError}
          color="primary"
        >
          Save Changes
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}

CalendarForm.propTypes = {
  colorOptions: PropTypes.arrayOf(PropTypes.string),
  currentEvent: PropTypes.object,
  onClose: PropTypes.func,
  machines: PropTypes.array,
  selectedData: PropTypes.object,
  onSchedulesUpdate: PropTypes.func,
  date: PropTypes.instanceOf(Date),
  effectiveScheduleId: PropTypes.number,
};
