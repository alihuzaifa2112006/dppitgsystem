import * as Yup from 'yup';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { Get, Post, Put } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import Scrollbar from 'src/components/scrollbar';
import Label from 'src/components/label';

export default function ItemQCEntryDialog({ open, onClose, selectedItem, isEditMode, onSuccess }) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [useAutoDate, setUseAutoDate] = useState(true);
  const [itemSubCategory, setItemSubCategory] = useState([]);
  const confirmSave = useBoolean();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const totalReceiveQty = selectedItem?.Total_Receive_Qty || 0;

  // Create validation schema - we'll validate rejections manually in onSubmit
  const validationSchema = Yup.object().shape({
    Inspector_Name: Yup.string().nullable(),
    QC_Date: Yup.date().nullable().required('QC Date is required'),
    Passed_Qty: Yup.number()
      .required('Passed Quantity is required')
      .min(0, 'Passed Quantity cannot be negative')
      .max(
        totalReceiveQty,
        `Passed Quantity cannot exceed total received quantity of ${totalReceiveQty}`
      )
      .typeError('Must be a valid number'),
    Rejections: Yup.array().of(
      Yup.object().shape({
        Rejection_Qty: Yup.number()
          .required('Quantity is required')
          .min(0, 'Quantity cannot be negative')
          .typeError('Must be a valid number'),
        Reason_Detail: Yup.string()
          .required('Reason is required')
          .min(5, 'Reason must be at least 5 characters'),
      })
    ),
  });

  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      Inspector_Name: '',
      QC_Date: new Date(),
      Passed_Qty: selectedItem?.Passed_Qty || selectedItem?.Total_Receive_Qty || 0,
      Rejections: [],
    },
  });

  const {
    reset,
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();
  const rejectedQty = (selectedItem?.Total_Receive_Qty || 0) - (values.Passed_Qty || 0);
  const hasRejections = rejectedQty > 0;

  // Get rejection categories
  const GetItemSubCategory = useCallback(async () => {
    try {
      const response = await Get(`GetSubCategoriesByCategoryID/5`);
      setItemSubCategory(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    GetItemSubCategory();
  }, [GetItemSubCategory]);

  // Note: Context is set in the useForm hook and doesn't need to be updated dynamically
  // The validation will use the current values from watch() instead

  // Auto-populate rejections when passed qty changes and there are rejections
  useEffect(() => {
    if (hasRejections && (!values.Rejections || values.Rejections.length === 0)) {
      setValue('Rejections', [
        {
          Rejection_Qty: rejectedQty,
          Reason_Detail: '',
        },
      ]);
    } else if (!hasRejections && values.Rejections?.length > 0) {
      setValue('Rejections', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRejections, rejectedQty, setValue]);

  // Load existing data when in edit mode
  useEffect(() => {
    if (open && selectedItem) {
      if (isEditMode && selectedItem.QC_ID) {
        // Load existing QC data
        setValue('Inspector_Name', selectedItem.Inspector_Name || '');
        setValue('QC_Date', selectedItem.QC_Date ? new Date(selectedItem.QC_Date) : new Date());
        setValue('Passed_Qty', selectedItem.Passed_Qty || selectedItem.Total_Receive_Qty || 0);
        setValue('Rejections', selectedItem.Rejections || []);
        setUseAutoDate(false); // In edit mode, use the existing date
      } else {
        // New entry mode
        setValue('Inspector_Name', '');
        setValue('QC_Date', new Date());
        setValue('Passed_Qty', selectedItem?.Passed_Qty || selectedItem?.Total_Receive_Qty || 0);
        setValue('Rejections', []);
        setUseAutoDate(true);
      }
    }
  }, [open, selectedItem, isEditMode, setValue]);

  // Auto-update QC Date when useAutoDate is true
  useEffect(() => {
    if (useAutoDate) {
      setValue('QC_Date', new Date());
    }
  }, [useAutoDate, setValue]);

  const handleClear = () => {
    reset({
      Inspector_Name: '',
      QC_Date: new Date(),
      Passed_Qty: selectedItem?.Total_Receive_Qty || 0,
      Rejections: [],
    });
    setUseAutoDate(true);
  };

  const handleAddRejection = () => {
    const newRejection = {
      Rejection_Qty: '',
      Reason_Detail: '',
    };
    setValue('Rejections', [...(values.Rejections || []), newRejection]);
  };

  const handleDeleteRejection = (index) => {
    const updatedRejections = values.Rejections.filter((_, i) => i !== index);
    setValue('Rejections', updatedRejections);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const qcDate = useAutoDate ? new Date().toISOString() : data.QC_Date.toISOString();
      const rjQty = (selectedItem?.Total_Receive_Qty || 0) - (data.Passed_Qty || 0);

      // Validate rejection quantities sum if there are rejections
      if (hasRejections) {
        if (!data.Rejections || data.Rejections.length === 0) {
          enqueueSnackbar('At least one rejection item is required when there are rejected quantities', {
            variant: 'error',
          });
          setLoading(false);
          confirmSave.onFalse();
          return;
        }

        const totalRejectionQty = data.Rejections.reduce(
          (sum, item) => sum + (parseFloat(item.Rejection_Qty) || 0),
          0
        );
        if (Math.abs(totalRejectionQty - rjQty) > 0.01) {
          enqueueSnackbar(
            `Total rejection quantity (${totalRejectionQty}) must equal rejected quantity (${rjQty})`,
            { variant: 'error' }
          );
          setLoading(false);
          confirmSave.onFalse();
          return;
        }
      }

      const payload = {
        GRNDTLID: selectedItem.GRNDtlID,
        UOMID: selectedItem.UOMID,
        Total_Received: selectedItem.Total_Receive_Qty || 0,
        Passed_Qty: data.Passed_Qty || 0,
        Remarks: rjQty > 0 ? `QC completed. Rejected: ${rjQty}` : 'QC completed. All units passed',
        Approval_Status: 'QC Completed',
        Approval_Level: 1,
        QC_Date: qcDate,
        Created_By: userData?.userDetails?.userId || 1,
        VendorID: selectedItem.VendorID,
        isSampleRec: selectedItem.isSampleRec || 'N',
        SampleQty: selectedItem.SampleQty || 0,
        Inspector_Name: data.Inspector_Name || null,
        Rejections:
          hasRejections && data.Rejections
            ? data.Rejections.map((item) => ({
                UOMID: selectedItem.UOMID,
                Rejection_Qty: parseFloat(item.Rejection_Qty) || 0,
                Reason_Detail: item.Reason_Detail || '',
                Rejection_Type_ID: item?.Rejection_Type_ID?.SubCat_ID || 0,
              }))
            : [],
        Sample: null,
      };

      let response;
      if (isEditMode && selectedItem.QC_ID) {
        // Update existing QC - include QC_ID in payload
        payload.QC_ID = selectedItem.QC_ID;
        // Try Put first, fallback to Post if Put doesn't exist
        try {
          response = await Put('UpdateQCWithRejections', payload);
        } catch (error) {
          // If Update endpoint doesn't exist, use Post with QC_ID
          response = await Post('AddQCWithRejections', payload);
        }
      } else {
        // Create new QC
        response = await Post('AddQCWithRejections', payload);
      }

      if (response.status === 200) {
        enqueueSnackbar(
          isEditMode ? 'QC information updated successfully' : 'QC information submitted successfully',
          { variant: 'success' }
        );
        reset();
        onSuccess?.();
        onClose();
      } else {
        enqueueSnackbar('Failed to save QC information', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error saving QC information:', error);
      enqueueSnackbar('Failed to save QC information', { variant: 'error' });
    } finally {
      setLoading(false);
      confirmSave.onFalse();
    }
  };

  const handleSaveClick = () => {
    confirmSave.onTrue();
  };

  const handleConfirmSave = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='md' >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{isEditMode ? 'Edit QC Information' : 'Submit QC Information'}</Typography>
            <Iconify
              icon="eva:close-fill"
              onClick={onClose}
              sx={{ cursor: 'pointer', width: 24, height: 24 }}
            />
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  GRN No: {selectedItem?.GRNNO}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Item: {selectedItem?.ItemDescription}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Received: {selectedItem?.Total_Receive_Qty} {selectedItem?.UOMName}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <RHFTextField
                  name="Inspector_Name"
                  label="Inspector Name"
                  placeholder="Optional"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={useAutoDate}
                      onChange={(e) => setUseAutoDate(e.target.checked)}
                    />
                  }
                  label="Use Current Date (Auto)"
                />
              </Grid>

              <Grid item xs={12}>
                <DatePicker
                  label="QC Date"
                  value={values.QC_Date}
                  onChange={(newValue) => setValue('QC_Date', newValue)}
                  disabled={useAutoDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.QC_Date,
                      helperText: errors.QC_Date?.message,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <RHFTextField
                  name="Passed_Qty"
                  label="Passed Quantity"
                  type="number"
                  fullWidth
                  InputProps={{
                    inputProps: {
                      min: 0,
                      max: selectedItem?.Total_Receive_Qty || 0,
                    },
                  }}
                  helperText={`Max: ${selectedItem?.Total_Receive_Qty || 0} ${selectedItem?.UOMName || ''}`}
                />
              </Grid>

              {hasRejections && (
                <Grid item xs={12}>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Label color="error" sx={{ fontWeight: 'bold' }}>
                        Rejected Quantity: {rejectedQty} {selectedItem?.UOMName || ''}
                      </Label>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleAddRejection}
                        startIcon={<Iconify icon="eva:plus-fill" />}
                      >
                        Add Rejection
                      </Button>
                    </Stack>

                    <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                      <Scrollbar>
                        <Table stickyHeader size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ minWidth: 150 }}>Rejected Quantity</TableCell>
                              <TableCell sx={{ minWidth: 300 }}>Reason Detail</TableCell>
                              <TableCell sx={{ width: 80 }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {values.Rejections?.map((rejection, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <RHFTextField
                                    name={`Rejections[${index}].Rejection_Qty`}
                                    type="number"
                                    size="small"
                                    fullWidth
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <Typography variant="caption">
                                            {selectedItem?.UOMName}
                                          </Typography>
                                        </InputAdornment>
                                      ),
                                    }}
                                    error={!!errors.Rejections?.[index]?.Rejection_Qty}
                                    helperText={errors.Rejections?.[index]?.Rejection_Qty?.message}
                                  />
                                </TableCell>
                                <TableCell>
                                  <RHFTextField
                                    name={`Rejections[${index}].Reason_Detail`}
                                    size="small"
                                    fullWidth
                                    error={!!errors.Rejections?.[index]?.Reason_Detail}
                                    helperText={errors.Rejections?.[index]?.Reason_Detail?.message}
                                  />
                                </TableCell>
                                <TableCell>
                                  <IconButton
                                    onClick={() => handleDeleteRejection(index)}
                                    color="error"
                                    size="small"
                                    disabled={values.Rejections.length <= 1}
                                  >
                                    <Iconify icon="solar:trash-bin-trash-bold" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Scrollbar>
                    </TableContainer>

                    {values.Rejections?.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Total Rejection Qty:{' '}
                        {values.Rejections.reduce(
                          (sum, item) => sum + (parseFloat(item.Rejection_Qty) || 0),
                          0
                        )}{' '}
                        {selectedItem?.UOMName || ''} (Required: {rejectedQty}{' '}
                        {selectedItem?.UOMName || ''})
                      </Typography>
                    )}
                  </Stack>
                </Grid>
              )}
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={handleClear} disabled={isSubmitting || loading}>
                Clear
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveClick}
                disabled={isSubmitting || loading}
              >
                {isSubmitting || loading ? 'Saving...' : 'Save'}
              </Button>
            </Stack>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmSave.value}
        onClose={confirmSave.onFalse}
        title="Confirm Save"
        content="Are you sure you want to submit this QC information?"
        action={
          <Button variant="contained" color="primary" onClick={handleConfirmSave}>
            Yes, Save
          </Button>
        }
      />
    </>
  );
}

ItemQCEntryDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  selectedItem: PropTypes.object,
  isEditMode: PropTypes.bool,
  onSuccess: PropTypes.func,
};

