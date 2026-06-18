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

export default function AddinvCategoryDialog({ uploadClose, uploadOpen, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [allClasses, setAllClasses] = useState([]);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewINVCategorySchema = Yup.object().shape({
    inv_type: Yup.object().required('Item Type is required'),

    inv_name: Yup.string()
      .required(' Category Name is required')
      .min(3, ' Category Name must be at least 3 characters long')
      .max(100, ' Category Name must be less than or equal to 100 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'INVCategory Name must only contain letters and spaces'),
    // inv_sym: Yup.string()
    //   .required(' Category Symbol is required')
    //   .min(2, ' Category Symbol must be at least 2 characters long')
    //   .max(100, ' Category Symbol must be less than or equal to 100 characters'),
    // inv_type: Yup.string()
    //   .required(' Material Type is required')
    //   .min(3, ' Material Type must be at least 3 characters long')
    //   .max(100, ' Material Type must be less than or equal to 100 characters'),
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

  const GetAllClasses = useCallback(async () => {
    const res = await Get(
      `GetAllClasses?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setAllClasses(res?.data?.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // ------------------------------------

  const PostINVCategoryData = async (PostData) => {
    try {
      await Post('Addinvcategory', PostData).then(async (res) => {
        enqueueSnackbar(res.data, 'Category Added ');
        uploadClose();
        reset(); // Only reset after successful submission
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message, { variant: 'error' });
    }
  };

  const onDptSubmit = handleSubmit(async (data) => {
    if (
      tableData.some(
        (item) => item.Inv_Cat_Name === data.inv_name && item.ClassID === data?.inv_type?.ClassID
      )
    ) {
      enqueueSnackbar('Inventory Category Name already exists', { variant: 'error' });
      return;
    }
    try {
      const dataToSend = {
        Inv_Cat_Name: data.inv_name,
        ClassID: data?.inv_type?.ClassID,
        Symbol: data?.inv_sym || '',
        // Material_Type: data.inv_type,
        Created_By: userData?.userDetails?.userId,
        Is_Active: true,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      };
      await PostINVCategoryData(dataToSend);
      uploadClose();
    } catch (error) {
      console.error(error);
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
      await Promise.all([APIGetUOM(), GetAllClasses()]);
      setLoading(false);
    };
    fetchData();
  }, [APIGetUOM, GetAllClasses]);
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
                name="inv_type"
                label="Item Type"
                options={allClasses || []}
                getOptionLabel={(option) => option?.ClassName}
              />
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
    </>
  );
}

AddinvCategoryDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
};
