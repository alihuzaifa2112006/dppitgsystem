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

import { Get, Post } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export default function CountryDialog({ uploadClose, uploadOpen, tableData }) {
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [allBranches, setAllBranches] = useState([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [addBranchDialogOpen, setAddBranchDialogOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  // ---------------------- Validation Schema ------------------------

  const NewBankSchema = Yup.object().shape({
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

  const methods = useForm({
    resolver: yupResolver(NewBankSchema),
    defaultValues: {
      BankName: '',
      Branch: null,
      Address: '',
    },
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
  // Fetch Branches from GetBankDropdown API

  const GetBranches = useCallback(async () => {
    try {
      setIsLoadingBranches(true);
      const orgId = userData?.userDetails?.orgId;
      const branchID = userData?.userDetails?.branchID;
      const response = await Get(
        `CommercialModule/GetBankDropdown?Org_ID=${orgId}&Branch_ID=${branchID}`
      );
      setAllBranches(response.data?.Data || []);
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Error fetching branches', { variant: 'error' });
    } finally {
      setIsLoadingBranches(false);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  useEffect(() => {
    if (uploadOpen) {
      GetBranches();
      reset();
    }
  }, [uploadOpen, GetBranches, reset]);

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
    
    if (allBranches.some((branch) => branch.BranchName?.trim().toLowerCase() === newBranchName.trim().toLowerCase())) {
      enqueueSnackbar('This branch name already exists', { variant: 'error' });
      return;
    }
    if (!newBranchName.trim()) {
      enqueueSnackbar('Branch Name is required', { variant: 'error' });
      return;
    }

    if (!values.BankName?.trim()) {
      enqueueSnackbar('Please enter Bank Name first', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        BankName: values.BankName.trim(),
        BranchName: newBranchName.trim(),
        Address: values.Address?.trim() || '',
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
        CreatedBy: userData?.userDetails?.userId,
      };

      await Post('CommercialModule/AddBranch', dataToSend);
      enqueueSnackbar('Branch added successfully', { variant: 'success' });
      
      // Refresh branches list
      await GetBranches();
      
      // Try to find and select the newly added branch
      const updatedResponse = await Get(
        `CommercialModule/GetBankDropdown?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      const updatedBranches = updatedResponse.data?.Data || [];
      const newlyAdded = updatedBranches.find(
        (b) =>
          b.BankName?.trim().toLowerCase() === values.BankName?.trim().toLowerCase() &&
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
  // Submit Bank Data

  const PostBankData = async (PostData) => {
    try {
      await Post('CommercialModule/AddBank', PostData).then(async (res) => {
        enqueueSnackbar(res.data?.Message || 'Bank added successfully', { variant: 'success' });
        uploadClose();
        reset();
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message || 'Error adding bank', { variant: 'error' });
    }
  };

  const onBankSubmit = handleSubmit(async (data) => {
    // Check if bank name already exists (optional validation)
    if (tableData?.some((item) => 
      item.BankName?.trim().toLowerCase() === data.BankName?.trim().toLowerCase() &&
      item.BankBranchID === data.Branch?.BankBranchID
    )) {
      enqueueSnackbar('This bank and branch combination already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        BankName: data.BankName.trim(),
        BankBranchID: data.Branch?.BankBranchID,
        Address: data.Address.trim(),
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
        CreatedBy: userData?.userDetails?.userId,
      };

      await PostBankData(dataToSend);
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
              Add Bank
            </Typography>

            <IconButton onClick={uploadClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <FormProvider methods={methods} onSubmit={onBankSubmit}>
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
                      // disabled={!values.BankName?.trim()}
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
            Add a new branch for: <strong>{values.BankName || 'Bank'}</strong>
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

CountryDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
};
