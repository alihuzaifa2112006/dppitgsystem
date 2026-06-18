import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
} from 'src/components/hook-form';

import { Get, Post, Put } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export default function CountryEditDialog({ uploadClose, uploadOpen, row, tableData }) {
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [allBranches, setAllBranches] = useState([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [addBranchDialogOpen, setAddBranchDialogOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  // ---------------------- Validation Schema ------------------------

  const EditBankSchema = Yup.object().shape({
    BankName: Yup.string()
      .required('Bank Name is required')
      .min(2, 'Bank Name must be at least 2 characters long')
      .max(200, 'Bank Name must be less than or equal to 200 characters'),
    Branch: Yup.object()
      .nullable()
      .required('Branch is required'),
    Address: Yup.string()
      .required('Address is required')
      .min(5, 'Address must be at least 5 characters long')
      .max(500, 'Address must be less than or equal to 500 characters'),
  });

  // Set default values from row data
  const defaultValues = useMemo(() => {
    if (!row) {
      return {
        BankName: '',
        Branch: null,
        Address: '',
      };
    }

    // Find the matching branch from allBranches
    const matchingBranch = allBranches.find(
      (branch) => branch.BankBranchID === row.BankBranchID && branch.BankID === row.BankID
    );

    return {
      BankName: row?.BankName || '',
      Branch: matchingBranch || null,
      Address: row?.DisplayText || row?.Address || '',
    };
  }, [row, allBranches]);

  const methods = useForm({
    resolver: yupResolver(EditBankSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  // ------------------------------------
  // Fetch Branches from GetBankDropdown API and Bank Details for Address

  const GetBranches = useCallback(async () => {
    try {
      setIsLoadingBranches(true);
      const orgId = userData?.userDetails?.orgId;
      const branchID = userData?.userDetails?.branchID;
      
      // Fetch branches for dropdown
      const branchesResponse = await Get(
        `CommercialModule/GetBankDropdown?Org_ID=${orgId}&Branch_ID=${branchID}`
      );
      const branches = branchesResponse.data?.Data || [];
      setAllBranches(branches);

      // Set the matching branch and Address from DisplayText
      if (row?.BankID) {
        const matchingBranch = branches.find(
          (branch) => branch.BankBranchID === row.BankBranchID && branch.BankID === row.BankID
        );

        // Reset form with all data including Address from DisplayText
        reset({
          BankName: row?.BankName || '',
          Branch: matchingBranch || null,
          Address: row?.DisplayText || row?.Address || '',
        });

        if (matchingBranch) {
          setValue('Branch', matchingBranch);
        }
      } else {
        // Set the matching branch after branches are loaded
        // eslint-disable-next-line
        if (row) {
          const matchingBranch = branches.find(
            (branch) => branch.BankBranchID === row.BankBranchID && branch.BankID === row.BankID
          );
          // eslint-disable-next-line
          if (matchingBranch) {
            setValue('Branch', matchingBranch);
          }
        }
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Error fetching branches', { variant: 'error' });
    } finally {
      setIsLoadingBranches(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar, row, setValue, reset ]);

  useEffect(() => {
    if (uploadOpen && row) {
      GetBranches();
    }
  }, [uploadOpen, GetBranches, row]);

  // ------------------------------------
  // Add New Branch Dialog Handler

  const handleAddBranchDialogOpen = () => {
    setAddBranchDialogOpen(true);
    setNewBranchName('');
  };

  const handleAddBranchDialogClose = () => {
    setAddBranchDialogOpen(false);
    setNewBranchName('');
  };

  const handleAddBranch = async () => {
    if (!newBranchName.trim()) {
      enqueueSnackbar('Branch Name is required', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        BankName: values.BankName?.trim() || row?.BankName || '',
        BranchName: newBranchName.trim(),
        Address: values.Address?.trim() || row?.DisplayText || '',
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
        CreatedBy: userData?.userDetails?.userId,
      };

      await Post('CommercialModule/AddBranch', dataToSend);
      enqueueSnackbar('Branch added successfully', { variant: 'success' });
      
      // Refresh branches list
      await GetBranches();
      
      // Try to find and select the newly added branch
      const orgId = userData?.userDetails?.orgId;
      const branchID = userData?.userDetails?.branchID;
      const updatedResponse = await Get(
        `CommercialModule/GetBankDropdown?Org_ID=${orgId}&Branch_ID=${branchID}`
      );
      const updatedBranches = updatedResponse.data?.Data || [];
      const newlyAdded = updatedBranches.find(
        (b) =>
          (b.BankName?.trim().toLowerCase() === (values.BankName?.trim().toLowerCase() || row?.BankName?.trim().toLowerCase())) &&
          b.BranchName?.trim().toLowerCase() === newBranchName.trim().toLowerCase()
      );
      
      if (newlyAdded) {
        setValue('Branch', newlyAdded);
      }
      
      handleAddBranchDialogClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar(error?.response?.data?.Message || 'Error adding branch', { variant: 'error' });
    }
  };

  // ------------------------------------
  // Update Bank Data

  const PutBankData = async (PutData) => {
    try {
      await Put('CommercialModule/UpdateBank', PutData).then(async (res) => {
        enqueueSnackbar(res.data?.Message || 'Bank updated successfully', { variant: 'success' });
        uploadClose();
        reset();
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message || 'Error updating bank', { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    // Check if bank name and branch combination already exists (excluding current row)
    if (
      tableData?.some(
        (item) =>
          item.BankName?.trim().toLowerCase() === data.BankName?.trim().toLowerCase() &&
          item.BankBranchID === data.Branch?.BankBranchID &&
          item.BankID !== row?.BankID
      )
    ) {
      enqueueSnackbar('This bank and branch combination already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        BankID: row?.BankID,
        BankName: data.BankName.trim(),
        BankBranchID: data.Branch?.BankBranchID,
        Address: data.Address.trim(),
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await PutBankData(dataToSend);
    } catch (error) {
      console.error(error);
    }
  });

  // ------------------------------------

  return (
    <>
      <Dialog
        open={uploadOpen}
        onClose={() => {
          uploadClose();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontSize: '20px !important' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Edit Bank
            </Typography>

            <IconButton onClick={uploadClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              paddingY={3}
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
              }}
            >
              <RHFTextField name="BankName" label="Bank Name" />

              <Box>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Box sx={{ flexGrow: 1 }}>
                    <RHFAutocomplete
                      name="Branch"
                      label="Branch"
                      placeholder="Select a branch"
                      fullWidth
                      options={allBranches}
                      getOptionLabel={(option) => option?.BranchName || option?.DisplayText || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.BankBranchID === value?.BankBranchID
                      }
                      loading={isLoadingBranches}
                    />
                  </Box>
                  <Tooltip title="Add New Branch" placement="top">
                    <IconButton
                      color="primary"
                      onClick={handleAddBranchDialogOpen}
                      sx={{ mt: 0.5 }}
                    >
                      <Iconify icon="mingcute:add-line" width={24} height={24} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              <RHFTextField name="Address" label="Address" multiline rows={3} />
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
              >
                Save
              </LoadingButton>
            </Stack>
          </FormProvider>
        </DialogContent>
      </Dialog>

      {/* Add Branch Dialog */}
      <Dialog
        open={addBranchDialogOpen}
        onClose={handleAddBranchDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center">
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Add New Branch
            </Typography>
            <IconButton onClick={handleAddBranchDialogClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Add a new branch for: <strong>{values.BankName || row?.BankName || 'Bank'}</strong>
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Branch Name"
            fullWidth
            variant="outlined"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddBranchDialogClose}>Cancel</Button>
          <Button
            onClick={handleAddBranch}
            variant="contained"
            color="primary"
            disabled={!newBranchName.trim()}
          >
            Add Branch
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

CountryEditDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  row: PropTypes.object,
  tableData: PropTypes.array,
};
