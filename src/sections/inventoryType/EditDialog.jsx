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

// ----------------------------------------------------------------------

export default function EditDialog({ uploadClose, uploadOpen, row, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [allClassName, setallClassName] = useState([]);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewInvTypeSchema = Yup.object().shape({
    SubCat_Name: Yup.string()
      .required('Item Type Name is required')
      .min(3, 'Item Type Name must be at least 3 characters long')
      .max(100, 'Item Type Name must be less than or equal to 100 characters'),
    Category: Yup.object().required('Please select category'),
    // .matches(/^[a-zA-Z\s]+$/, 'InvType Name must only contain letters and spaces'),
  });

  const defaultValues = useMemo(
    () => ({
      SubCat_Name: row?.SubCat_Name || '',
      Category: row?.Category || null,
      ClassID: row?.ClassID || null,
      Symbol: row?.Symbol || '',
    }),
    [row]
  );

  const methods = useForm({
    resolver: yupResolver(NewInvTypeSchema),
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

  // ------------------------------------
  const [Category, setCategory] = useState([]);

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

  const selectedClassId = watch('ClassID');

  const FetchAllCategoryData = useCallback(async () => {
    if (selectedClassId?.ClassID) {
      try {
        const response = await Get(
          `InvCategoryGetByClassId?classId=${selectedClassId?.ClassID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        // console.log('Category Response:', response.data);
        setCategory(response.data || []);
        setValue(
          'Category',
          response.data.find((x) => x.Inv_Cat_ID === row?.Category.Inv_Cat_ID)
        );
      } catch (error) {
        console.error(error);
      }
    } else {
      setCategory([]);
    }
    // eslint-disable-next-line
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, selectedClassId?.ClassID]);

  useEffect(() => {
    FetchAllCategoryData();
    setValue('Category', null);
  }, [selectedClassId?.ClassID, FetchAllCategoryData, setValue]);

  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const handleClassDialogOpen = () => {
    setClassDialogOpen(true);
  };
  const handleClassDialogClose = () => {
    GetAllClasses();
    setClassDialogOpen(false);
  };

  //  dailog function
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const PutInvTypeData = async (PutData) => {
    try {
      await Put(`update/inventory/subcategory`, PutData).then(async (res) => {
        enqueueSnackbar(res.data.Message);
        uploadClose();
        reset(); // Only reset after successful submission
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message, { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (
      tableData
        .filter((item) => item.SubCat_ID !== row?.SubCat_ID)
        .some((item) => item.SubCat_Name === data.SubCat_Name)
    ) {
      enqueueSnackbar('Sub Category already exists', { variant: 'error' });
      return;
    }
    try {
      const dataToSend = {
        SubCat_ID: row?.SubCat_ID,
        Inv_Cat_ID: data?.Category?.Inv_Cat_ID,
        SubCat_Name: data.SubCat_Name,
        Symbol: data?.Symbol || '',
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
        Is_Active: true,
        Updated_By: userData?.userDetails?.userId,
        Is_Cancelled: false,
        Cancel_By: null,
        Cancel_On: null,
      };
      await PutInvTypeData(dataToSend);
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
  // -----------------------

  const [Locations, setLocation] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const ApiGetLocations = useCallback(async () => {
    try {
      const response = await Get(
        `ApiGetBlendTypeList?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setLocation(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([ApiGetLocations()]);
      setLoading(false);
    };
    fetchData();
  }, [ApiGetLocations]);
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
              Edit Sub Category
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
              <Box sx={{ gridColumn: { sm: 'span 1' } }}>
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
              </Box>
              <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <RHFAutocomplete
                      name="Category"
                      label="Category"
                      placeholder="Choose an option"
                      options={Category}
                      getOptionLabel={(option) => option?.Inv_Cat_Name}
                    />
                  </Box>

                  <Tooltip title="Add New Item Category" placement="top">
                    <IconButton color="primary" onClick={() => handleDialogOpen()}>
                      <Iconify icon="lets-icons:add-duotone" width={32} height={32} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
              <RHFTextField name="SubCat_Name" label="Sub Category Name" />
              {/* <RHFTextField name="Symbol" label="Symbol" /> */}
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

EditDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  row: PropTypes.object,
  tableData: PropTypes.array,
};
