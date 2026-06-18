import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

export default function ItemIssueEntryDialog({
  open,
  onClose,
  selectedRow,
  onSave,
  isEdit = false,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const confirmSave = useBoolean();
  const confirmClear = useBoolean();

  const [totalPrevIssueQty, setTotalPrevIssueQty] = useState(0);
  const [currentIssueQty, setCurrentIssueQty] = useState(0);

  const hasHistory = selectedRow?.IssueHistory?.length > 0;
  console.log('selectedRow', selectedRow);

  useEffect(() => {
    if (hasHistory) {
      if (isEdit) {
        // When editing: exclude the latest history record (highest HistoryID)
        // If length is 1 or 0, set to 0
        if (selectedRow?.IssueHistory?.length <= 1) {
          setTotalPrevIssueQty(0);
        } else {
          // Find the latest HistoryID (highest ID)
          const latestHistoryID = Math.max(...selectedRow.IssueHistory.map((h) => h.HistoryID));
          // Sum all IssueQty except the one with latestHistoryID
          const total = selectedRow.IssueHistory.reduce((acc, curr) => {
            if (curr.HistoryID !== latestHistoryID) {
              return acc + (curr.IssueQty || 0);
            }
            return acc;
          }, 0);
          setTotalPrevIssueQty(total);
          setCurrentIssueQty(selectedRow?.latestHistoryIssuedQty || 0);
        }
      } else {
        // When creating new issue: sum all IssueQty
        setTotalPrevIssueQty(
          selectedRow?.IssueHistory?.reduce((acc, curr) => acc + (curr.IssueQty || 0), 0)
        );
      }
    } else {
      setTotalPrevIssueQty(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRow, hasHistory, isEdit]);

  const NewIssueSchema = Yup.object().shape({
    IssueQty: Yup.number()
      .required('Issue Quantity is required')
      .min(0.0001, 'Quantity must be greater than 0')
      .test('max-remaining-qty', `Quantity cannot exceed remaining quantity`, (value) => {
        if (!selectedRow) return true;
        const remainingQty = parseFloat(selectedRow.RemainingQty) || 0;

        // When editing, RemainingQty already excludes the current issue quantity
        // So we need to add it back to get the maximum allowed
        if (isEdit) {
          const currentRemainingQty = parseFloat(selectedRow.latestHistoryRemainingQty) || 0;
          return value <= currentRemainingQty;
        }

        return value <= remainingQty;
      }),
    Remarks: Yup.string(),
    IssueDate: Yup.date().required('Issue Date is required'),
    DriverName: Yup.string(),
    VehNO: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      IssueQty: currentIssueQty || 0,
      Remarks: selectedRow?.IssueRemarks || '',
      IssueDate: selectedRow?.IssueDate ? new Date(selectedRow.IssueDate) : new Date(),
      IssueBaleQty: selectedRow?.IssueBaleQty || 0,
      DriverName: selectedRow?.DriverName || '',
      VehNO: selectedRow?.VehNO || '',
    }),
    [selectedRow, currentIssueQty]
  );

  const methods = useForm({
    resolver: yupResolver(NewIssueSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (selectedRow) {
      reset({
        IssueQty: isEdit ? selectedRow.latestHistoryIssuedQty : 0, // 0 for new issue, existing for edit
        Remarks: selectedRow.IssueRemarks || '',
        IssueDate: selectedRow.IssueDate ? new Date(selectedRow.IssueDate) : new Date(),
        IssueBaleQty: selectedRow.IssueBaleQty || 0, // Assuming simple logic for now
        DriverName: selectedRow.DriverName || '',
        VehNO: selectedRow.VehNO || '',
      });
    }
  }, [selectedRow, reset, isEdit]);

  const handleClear = () => {
    confirmClear.onTrue();
  };

  const handleConfirmClearAction = () => {
    reset({
      IssueQty: 0,
      Remarks: '',
      IssueDate: new Date(),
      IssueBaleQty: 0,
      DriverName: '',
      VehNO: '',
    });
    confirmClear.onFalse();
    enqueueSnackbar('Form cleared', { variant: 'info' });
  };

  const onSubmit = async (data) => {
    confirmSave.onTrue();
  };

  const handleConfirmSaveAction = async () => {
    confirmSave.onFalse();
    const data = watch();
    onSave({
      ...selectedRow,
      ...data,
      IssueQty: parseFloat(data.IssueQty),
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Issue' : 'Issue Item'}</DialogTitle>

        <DialogContent>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={12}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ mb: 2, p: 1, bgcolor: 'background.neutral', borderRadius: 1 }}
                >
                  <Stack>
                    <Typography variant="caption" color="text.secondary">
                      Item
                    </Typography>
                    <Typography variant="body2">{selectedRow?.ItemDescription || '-'}</Typography>
                  </Stack>
                  {/* show Requested Qty */}
                  <Stack>
                    <Typography variant="caption" color="text.secondary">
                      Requested Qty
                    </Typography>
                    <Typography variant="subtitle2" color="primary">
                      {selectedRow?.TotalRequestedQty} {selectedRow?.UOMName}
                    </Typography>
                  </Stack>
                  {/* Show Total Previously Issued Qty when creating new issue and has history */}
                  <Stack>
                    <Typography variant="caption" color="text.secondary">
                      Total Previously Issued
                    </Typography>
                    <Typography variant="subtitle2" color="info.main">
                      {totalPrevIssueQty} {selectedRow?.UOMName}
                    </Typography>
                  </Stack>
                  <Stack>
                    <Typography variant="caption" color="text.secondary">
                      Remaining Qty
                    </Typography>
                    {/* If editing, show what was available before this issue + what is in this issue */}
                    <Typography variant="subtitle2" color={isEdit ? (parseFloat(selectedRow?.latestHistoryRemainingQty) || 0) > 0 ? 'primary' : 'error' : (parseFloat(selectedRow?.RemainingQty) || 0) > 0 ? 'primary' : 'error'}>
                      {isEdit ? (parseFloat(selectedRow?.latestHistoryRemainingQty) || 0) : (parseFloat(selectedRow?.RemainingQty) || 0)}
                      {selectedRow?.UOMName}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Issue Date"
                  value={watch('IssueDate')}
                  onChange={(newValue) => setValue('IssueDate', newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="IssueQty"
                  label="Issue Quantity"
                  type="number"
                  InputProps={{
                    endAdornment: <Typography variant="caption">{selectedRow?.UOMName}</Typography>,
                  }}
                />
              </Grid>

              {/* Optional: Bale Qty if applicable */}
              {selectedRow?.TotalBale > 0 && (
                <Grid item xs={12} md={6}>
                  <RHFTextField name="IssueBaleQty" label="Issue Bale Qty" type="number" />
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <RHFTextField name="DriverName" label="Driver Name" />
              </Grid>

              <Grid item xs={12} md={6}>
                <RHFTextField name="VehNO" label="Vehicle No" />
              </Grid>

              <Grid item xs={12}>
                <RHFTextField name="Remarks" label="Remarks" multiline rows={3} />
              </Grid>
            </Grid>

            {/* Note: Buttons are usually in DialogActions, but we need form submission. 
                We can put them here or use external submit button trigger. 
                Putting in DialogActions and using form id is cleaner if supported, 
                but here we'll just keep inside FormProvider for simplicity or use a hidden submit.
            */}
          </FormProvider>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="error" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={onClose}>Cancel</Button>
          <LoadingButton
            variant="contained"
            width="150px"
            color="primary"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmSave.value}
        onClose={confirmSave.onFalse}
        title="Confirm Issue"
        content="Are you sure you want to submit this Issue information?"
        action={
          <Button variant="contained" color="primary" onClick={handleConfirmSaveAction}>
            Yes, Submit
          </Button>
        }
      />

      <ConfirmDialog
        open={confirmClear.value}
        onClose={confirmClear.onFalse}
        title="Clear Entry"
        content="Are you sure you want to clear all entered data? This action cannot be undone."
        action={
          <Button variant="contained" color="error" onClick={handleConfirmClearAction}>
            Yes, Clear
          </Button>
        }
      />
    </>
  );
}

ItemIssueEntryDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  selectedRow: PropTypes.object,
  onSave: PropTypes.func,
  isEdit: PropTypes.bool,
};
