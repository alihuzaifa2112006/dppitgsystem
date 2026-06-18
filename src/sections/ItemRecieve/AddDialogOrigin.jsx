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

import { Get, Post } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export default function AddDialogOrigin({ uploadClose, uploadOpen, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [allClassName, setallClassName] = useState([]);
  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewINVCategorySchema = Yup.object().shape({
  inv_name: Yup.string()
    .required('Inventory Category Name is required')
    .min(2, 'Inventory Category Name must be at least 2 characters long')
    .max(100, 'Inventory Category Name must be less than or equal to 100 characters'),

  inv_sym: Yup.string()
    .required('Symbol is required')
    .min(3, 'Symbol must be at least 3 characters long')
    .max(100, 'Symbol must be less than or equal to 100 characters'),
});

  const methods = useForm({
    resolver: yupResolver(NewINVCategorySchema),
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

  // ------------------------------------

  const PostINVCategoryData = async (PostData) => {
    try {
      const res = await Post('Addinvcategory', PostData);
      enqueueSnackbar('Category Added Successfully', { variant: 'success' });
      reset();
      uploadClose();
      return true;
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message || 'Something went wrong', {
        variant: 'error',
      });
      return false;
    }
  };

  useEffect(() => {
    const AllClassNameData = async () => {
      try {
        const response = await Get(`GetAllClasses?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`);
        // console.log('Class Names', response.data?.Data);
        setallClassName(response.data?.Data);
      } catch (error) {
        console.error(error);
      }
    };

    AllClassNameData();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const onDptSubmit = handleSubmit(async (data) => {
    if (tableData.some((item) => item.Inv_Cat_Name.toLowerCase() === data.inv_name.toLowerCase())) {
      enqueueSnackbar('Inventory Category Name already exists', { variant: 'error' });
      return;
    }

    // const dataToSend = {
    //   ClassID: data.ClassID?.ClassID || '',

    //   Inv_Cat_Name: data.inv_name.trim(),
    //   Symbol: data.inv_sym.trim(),
    //   // Material_Type: data.inv_type.trim(),
    //   Created_By: userData?.userDetails?.userId,
    //   Is_Active: true,
    //   Branch_Id: userData?.userDetails?.branchID,
    //   Org_Id: userData?.userDetails?.orgId,
    // };
   const dataToSend = {
  ClassID: data.ClassID?.ClassID || '',
  Inv_Cat_Name: data.inv_name.trim(),
  Symbol: data.inv_sym.trim(),
  Created_By: userData?.userDetails?.userId,
  Is_Active: true,
  Branch_Id: userData?.userDetails?.branchID,
  Org_Id: userData?.userDetails?.orgId,
};

    await PostINVCategoryData(dataToSend);
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
  // -----------------
  const [UOMs, setUOM] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const APIGetUOM = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllActiveUOM?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setUOM(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([APIGetUOM()]);
      setLoading(false);
    };
    fetchData();
  }, [APIGetUOM]);
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
              Inventory Category
            </Typography>

            <IconButton onClick={uploadClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <FormProvider methods={methods} onSubmit={onDptSubmit}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              paddingY={3}
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
              }}
            >
              <RHFAutocomplete
                name="ClassID"
                label="Item Class"
                placeholder="Choose an option"
                fullWidth
                options={allClassName}
                getOptionLabel={(option) => option?.ClassName || ''}
                isOptionEqualToValue={(option, value) => option?.ClassID === value?.ClassID}
              />
              <RHFTextField name="inv_name" label="Inventory Category Name" />
              <RHFTextField name="inv_sym" label="Symbol" />
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
    </>
  );
}

AddDialogOrigin.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
};
