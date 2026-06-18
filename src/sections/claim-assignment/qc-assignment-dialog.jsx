import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Checkbox, Chip, MenuItem, TextField } from '@mui/material';
import { useSnackbar } from 'src/components/snackbar';

import { decrypt } from 'src/api/encryption';

import { Post, Put } from 'src/api/apibasemethods';

import FormProvider, { RHFAutocomplete, RHFSelect, RHFTextField } from 'src/components/hook-form';
import { DesktopDatePicker } from '@mui/x-date-pickers';

export default function QCAssignmentDialog({
  editOpen,
  onEditClose,
  currentData,
  FetchUpdatedData,
  QCList,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const bankDataSchema = Yup.object().shape({
    QCs: Yup.array().required('QC is required'),
    VisitDate: Yup.date().required('Visit Date is required'),
    Instruction: Yup.string().required('Instructions are required'),
  });

  const methods = useForm({
    resolver: yupResolver(bankDataSchema),
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const PostNotification = async (QCIDs = []) => {
    try {
      const requests = QCIDs.map((id) => {
        const DataToSend = {
          userId: id,
          title: 'New Claim Audit Assigned',
          body: `Claim #${currentData?.ComplaintAutoNo} has been assigned to you for audit. Please review it.`,
        };

        return axios.post('https://cyclohub.scmcloud.online/api/Notifications/send', DataToSend);
      });

      await Promise.all(requests);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  const PostData = async () => {
    try {
      const DataToSend = {
        ComplaintMasterID: currentData?.ComplaintMasterID,
        AssignedBy: userData?.userDetails?.userId,
        Instruction: values?.Instruction,
        VisitDate: values?.VisitDate,
        Status: 'Pending',
        QCRemarks: '',
        QCIDs: values?.QCs?.map((item) => item?.UserID),
      };
      await Post('AssignComplaintToQC', DataToSend).then(async (res) => {
        await PostNotification(values?.QCs?.map((item) => item?.UserID));
        enqueueSnackbar('QC Assigned Successfully!', { variant: 'success' });
        FetchUpdatedData();
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Something Went Wrong!', { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await PostData();
      reset();
      onEditClose();
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    if (!editOpen) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editOpen]);

  console.log(errors);

  return (
    <Dialog open={editOpen} onClose={onEditClose} fullWidth maxWidth="md">
      <DialogTitle>Assign QC</DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container>
          <Grid xs={12} md={12}>
            <DialogContent>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(1, 1fr)',
                  md: 'repeat(1, 1fr)',
                }}
                marginTop={1}
              >
                <RHFAutocomplete
                  name="QCs"
                  label="QC"
                  fullWidth
                  multiple
                  limitTags={2}
                  options={QCList}
                  getOptionLabel={(option) => option?.UserName}
                  renderOption={(props, option) => {
                    const isChecked = values?.QCs?.some(
                      (selected) => selected.UserID === option.UserID
                    );
                    return (
                      <li {...props} key={option.UserID}>
                        <Checkbox size="small" disableRipple checked={isChecked} />
                        {option.UserName}
                      </li>
                    );
                  }}
                  renderTags={(selected, getTagProps) =>
                    values.QCs.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.UserID}
                        label={option.UserName}
                        size="small"
                        variant="soft"
                        color="primary"
                      />
                    ))
                  }
                />
                {/* <Controller
                                    name="VisitDate"
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                        <DesktopDatePicker
                                            label="Visit Date"
                                            format="dd MMM yyyy"
                                            value={field.value}
                                            onChange={field.onChange}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    error={!!error}
                                                    helperText={error?.message}
                                                    fullWidth
                                                />
                                            )}
                                        />
                                    )}
                                /> */}
                <Controller
                  name="VisitDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Visit Date"
                      format="dd MMM yyyy"
                      onChange={(newValue) => {
                        field.onChange(newValue);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error,
                          helperText: error?.message,
                        },
                      }}
                    />
                  )}
                />
                <RHFTextField multiline rows={2} name="Instruction" label="Instructions" />
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={onEditClose} variant="outlined" color="inherit">
                Cancel
              </Button>
              <LoadingButton
                color="primary"
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                Save
              </LoadingButton>
            </DialogActions>
          </Grid>
        </Grid>
      </FormProvider>
    </Dialog>
  );
}

QCAssignmentDialog.propTypes = {
  editOpen: PropTypes.any,
  onEditClose: PropTypes.any,
  currentData: PropTypes.object,
  FetchUpdatedData: PropTypes.func,
  QCList: PropTypes.array,
};
