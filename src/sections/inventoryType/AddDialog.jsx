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
  Checkbox,
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

import { Get, Post } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import InvTypeDialog from 'src/sections/InvType/AddDialog';
import AddinvCategoryDialog from 'src/sections/inv-category/AddDialog';

// ----------------------------------------------------------------------

export default function AddDptDialog({ uploadClose, uploadOpen, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [allClassName, setallClassName] = useState([]);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewInvTypeSchema = Yup.object().shape({
    inv_name: Yup.string()
      .required('Item Type Name is required')
      .min(3, 'Item Type Name must be at least 3 characters long')
      .max(100, 'Item Type Name must be less than or equal to 100 characters'),
    Category: Yup.object().required('Category is required'),
    // Symbol: Yup.string().required('Symbol is required'),
    // .matches(/^[a-zA-Z\s]+$/, 'InvType Name must only contain letters and spaces'),
  });

  const methods = useForm({
    resolver: yupResolver(NewInvTypeSchema),
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
      } catch (error) {
        console.error(error);
      }
    } else {
      setCategory([]);
    }
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

  const PostInvTypeData = async (PostData) => {
    try {
      await Post('AddInvSubCategory', PostData).then(async (res) => {
        enqueueSnackbar(res.data, 'Sub Category Added ');
        uploadClose();
        reset(); // Only reset after successful submission
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data, { variant: 'error' });
    }
  };
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const checkboxOptions = [
    { id: 1, label: 'Color' },
    { id: 2, label: 'Size' },
    { id: 3, label: 'Weight' },
    { id: 4, label: 'Unit' },
    { id: 5, label: 'Length' },
  ];
  const handleCheckboxChange = (id) => {
    setSelectedOptionIds((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((item) => item !== id) : [...prevSelected, id]
    );
  };

  const onDptSubmit = handleSubmit(async (data) => {
    if (
      tableData.some(
        (item) => item.SubCat_Name === data.inv_name && item.Inv_Cat_ID === data.Category.Inv_Cat_ID
      )
    ) {
      enqueueSnackbar('Sub Category Name already exists', { variant: 'error' });
      return;
    }
    try {
      const dataToSend = {
        Inv_Cat_ID: data.Category.Inv_Cat_ID,
        SubCat_Name: data.inv_name,
        Symbol: data?.Symbol || '',
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
        Created_By: userData?.userDetails?.userId,
        Is_Active: true,
        Is_Cancelled: false,
        Cancel_By: null,
        Cancel_On: null,
      };
      await PostInvTypeData(dataToSend);
      uploadClose();
    } catch (error) {
      console.error(error);
    } finally {
      reset();
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
              Sub Category
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
              <RHFTextField name="inv_name" label="Sub Category Name" />
              {/* <RHFTextField name="Symbol" label="Symbol" /> */}

              {/* <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                paddingY={3}
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)'
                }}
              >
                {Option?.map((option) => (
                  <Box key={option.AttributeId} display="flex" alignItems="center">
                    <Checkbox
                      checked={selectedOptionIds.includes(option.AttributeId)}
                      onChange={() => handleCheckboxChange(option.AttributeId)}
                    />
                    <Typography>{option.AttributeName}</Typography>
                  </Box>
                ))}
              </Box> */}
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
      <AddinvCategoryDialog
        uploadOpen={dialogOpen}
        uploadClose={() => handleDialogClose()}
        tableData={Category}
      />
      <InvTypeDialog
        uploadClose={() => handleClassDialogClose()}
        uploadOpen={classDialogOpen}
        tableData={allClassName}
      />
    </>
  );
}

AddDptDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
};
