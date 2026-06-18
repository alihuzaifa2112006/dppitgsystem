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
  Tooltip,
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

import { Get, Put } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';
import InvTypeDialog from 'src/sections/InvType/AddDialog';

// ----------------------------------------------------------------------

export default function EditDialog({ uploadClose, uploadOpen, row, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [allClassName, setallClassName] = useState([]);
  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewINVCategorySchema = Yup.object().shape({
    inv_name: Yup.string()
      .required(' Category Name is required')
      .min(3, ' Category Name must be at least 3 characters long')
      .max(100, ' Category Name must be less than or equal to 100 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'INVCategory Name must only contain letters and spaces'),
    inv_sym: Yup.string()
      .required(' Category Symbol is required')
      .min(2, ' Category Symbol must be at least 2 characters long')
      .max(100, ' Category Symbol must be less than or equal to 100 characters'),
    // inv_type: Yup.string()
    //   .required(' Material Type is required')
    //   .min(3, ' Material Type must be at least 3 characters long')
    //   .max(100, ' Material Type must be less than or equal to 100 characters'),
  });

  const defaultValues = useMemo(
    () => ({
      inv_name: row?.Inv_Cat_Name || '',
      inv_sym: row?.Symbol || '',
      ClassName: row?.ClassName || '',
      // inv_type: row?.Material_Type || '',
    }),
    [row]
  );

  const methods = useForm({
    resolver: yupResolver(NewINVCategorySchema),
    defaultValues,
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

  useEffect(() => {
    methods.reset(defaultValues);
  }, [defaultValues, methods]);

  const GetAllClasses = useCallback(async () => {
    const res = await Get(
      `GetAllClasses?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setallClassName(res.data?.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([GetAllClasses()]);
    };
    fetchData();
  }, [GetAllClasses]);
  // ------------------------------------

  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const handleClassDialogOpen = () => {
    setClassDialogOpen(true);
  };

  const handleClassDialogClose = () => {
    setClassDialogOpen(false);
  };

  const PutINVCategoryData = async (PutData) => {
    try {
      await Put(`UpdateInvcategory/${row?.Inv_Cat_ID}`, PutData).then(async (res) => {
        enqueueSnackbar(res.data, 'Category Added ');
        uploadClose();
        reset(); // Only reset after successful submission
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data, { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    // For edit mode: Skip the current item being edited when checking for duplicates
    if (
      tableData.some(
        (item) => item.Inv_Cat_Name === data.inv_name && item.Inv_Cat_ID !== row.Inv_Cat_ID // Skip current item in edit mode
      )
    ) {
      enqueueSnackbar('Inventory Category Name already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        Inv_Cat_ID: data.inv_cat_id, // Include ID for edit operations
        Inv_Cat_Name: data.inv_name,
        Symbol: data.inv_sym,
        // Material_Type: data.inv_type,
        Created_By: userData?.userDetails?.userId,
        Is_Active: true,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      };

      // Use a conditional PUT/POST based on whether inv_cat_id exists
      if (data.inv_cat_id) {
        await PutINVCategoryData(dataToSend); // Your edit API call
      } else {
        await PutINVCategoryData(dataToSend); // Your create API call
      }

      uploadClose();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error saving category', { variant: 'error' });
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
  // -----------------------

  return (
    <>
      <Dialog
        open={uploadOpen}
        onClose={() => {
          uploadClose(); // Call the original close function
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontSize: '20px !important' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Edit Category
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
              {/* <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <RHFAutocomplete
                      name="ClassID"
                      label="Item Type"
                      placeholder="Choose an option"
                      fullWidth
                      options={allClassName}
                      getOptionLabel={(option) => option?.ClassName || ''}
                      isOptionEqualToValue={(option, value) => option?.ClassID === value?.ClassID}
                      value={values?.ClassID || null}
                      disabled
                      // onAdd={PostClassName}
                    />
                  </Box>
                  <Tooltip title="Add New Item Type" placement="top">
                    <IconButton color="primary" onClick={() => handleClassDialogOpen()}>
                      <Iconify icon="lets-icons:add-duotone" width={32} height={32} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box> */}
              <RHFTextField name="ClassName" label="Item Type" disabled />
              <RHFTextField name="inv_name" label="Inventory Category Name" />
              {/* <RHFTextField name="inv_sym" label="Symbol" /> */}
              {/* <RHFTextField name="inv_type" label="Material Types" /> */}
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

      <InvTypeDialog
        uploadClose={() => handleClassDialogClose()}
        uploadOpen={classDialogOpen}
        tableData={allClassName}
      />
    </>
  );
}

EditDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  row: PropTypes.object,
  tableData: PropTypes.array,
};
