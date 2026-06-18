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
  Chip,
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

export default function ReqMiddlewareAddDialog({ uploadClose, uploadOpen, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [allClassName, setallClassName] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [Category, setCategory] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allSections, setAllSections] = useState([]);
  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewInvTypeSchema = Yup.object().shape({
    User: Yup.object().required('User is required'),
    // Department: Yup.object().required('Department is required'),
    ClassID: Yup.array().required('Class is required'),
    Category: Yup.array().required('Category is required'),
    // Symbol: Yup.string().required('Symbol is required'),
    // .matches(/^[a-zA-Z\s]+$/, 'InvType Name must only contain letters and spaces'),
  });

  const methods = useForm({
    resolver: yupResolver(NewInvTypeSchema),
    defaultValues: {
      // User: null,
      Department: null,
      Section: null,
      ClassID: [],
      Category: [],
    },
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

  const GetAllClasses = useCallback(async () => {
    const res = await Get(
      `GetAllClasses?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setallClassName(res.data?.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetAllUsers = useCallback(async () => {
    const res = await Get(
      `GetHrRegisteredUsers?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setAllUsers(res.data?.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetAllDepartments = useCallback(async () => {
    const res = await Get(
      `GetAllActiveInactiveDpt?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setAllDepartments(res.data?.Departments || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([GetAllClasses(), GetAllDepartments(), GetAllUsers()]);
    };
    fetchData();
  }, [GetAllClasses, GetAllDepartments, GetAllUsers]);

  const selectedClassId = watch('ClassID');

  const FetchAllCategoryData = useCallback(async () => {
    if (selectedClassId && selectedClassId.length > 0) {
      try {
        const response = await Get(
          `InvcategoryGetByClassids?ids=${selectedClassId
            .map((item) => item.ClassID)
            .join(',')}&Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${
            userData?.userDetails?.branchID
          }`
        );
        // console.log('Category Response:', response.data);
        setCategory(response.data || []);
      } catch (error) {
        console.error(error);
      }
    } else {
      setCategory([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, selectedClassId]);

  useEffect(() => {
    FetchAllCategoryData();
    setValue('Category', null);
  }, [selectedClassId, FetchAllCategoryData, setValue]);

  // const selectedDepartment = watch('Department');

  // const FetchAllSectionsData = useCallback(async () => {
  //   if (selectedDepartment?.Dpt_ID) {
  //     try {
  //       const response = await Get(
  //         `GetSectionsByDept?deptId=${selectedDepartment?.Dpt_ID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
  //       );
  //       // console.log('Category Response:', response.data);
  //       setAllSections(response.data || []);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   } else {
  //     setAllSections([]);
  //   }
  // }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, selectedDepartment]);

  // useEffect(() => {
  //   FetchAllSectionsData();
  //   setValue('Section', null);
  // }, [selectedDepartment, FetchAllSectionsData, setValue]);

  // useEffect(() => {
  //   setValue('Department', values?.User?.DepartmentName || '');
  //   setValue('Section', values?.User?.SectionName || '');
  // }, [values?.User, setValue]);

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
      await Post('AddReqmiddleware', PostData).then(async (res) => {
        enqueueSnackbar('Request Middleware Added Successfully', { variant: 'success' });
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
    try {
      const dataToSend = data.Category.map((item) => ({
        DeptID: data?.User?.DepartmentID || 6,
        SectionID: data?.User?.SectionID || 5,
        InvTypeID: item.ClassID,
        CategoryID: item.Inv_Cat_ID || 0,
        UserID: data?.User?.UserId || 0,
        CreatedBy: userData?.userDetails?.userId,
        Branch_Id: userData?.userDetails?.branchID,
        Org_Id: userData?.userDetails?.orgId,
      }));
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
              Request Middleware
            </Typography>

            <IconButton onClick={uploadClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <FormProvider methods={methods} onSubmit={onDptSubmit}>
            <Box
              rowGap={2}
              columnGap={2}
              display="grid"
              paddingY={2}
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
              }}
            >
              <RHFAutocomplete
                name="User"
                label="User"
                placeholder="Choose an option"
                fullWidth
                options={allUsers}
                getOptionLabel={(option) => option?.UserName || ''}
                isOptionEqualToValue={(option, value) => option?.UserId === value?.UserId}
                value={values?.User || null}
                // onAdd={PostClassName}
              />
              {/* <RHFAutocomplete
                name="Department"
                label="Department"
                placeholder="Choose an option"
                fullWidth
                options={allDepartments}
                getOptionLabel={(option) => option?.Dpt_Name || ''}
                isOptionEqualToValue={(option, value) => option?.Dpt_ID === value?.Dpt_ID}
                value={values?.Department || null}
                // onAdd={PostClassName}
              /> */}
              <RHFTextField
                name="Department"
                label="Department "
                value={values?.User?.DepartmentName || ''}
                InputLabelProps={{ shrink: true }}
                disabled
              />
              {/* <RHFAutocomplete
                name="Section"
                label="Section"
                placeholder="Choose an option"
                fullWidth
                options={allSections}
                getOptionLabel={(option) => option?.SectionName || ''}
                isOptionEqualToValue={(option, value) => option?.SectionID === value?.SectionID}
                value={values?.Section || null}
                // onAdd={PostClassName}
              /> */}
              <RHFTextField
                name="Section"
                label="Section"
                value={values?.User?.SectionName || ''}
                InputLabelProps={{ shrink: true }}
                disabled
              />
              <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <RHFAutocomplete // perfected multiselect autocomplete
                      name="ClassID"
                      label="Inventory Type"
                      fullWidth
                      multiple
                      limitTags={2}
                      options={allClassName}
                      getOptionLabel={(option) => option?.ClassName}
                      isOptionEqualToValue={(option, value) => option.ClassID === value.ClassID}
                      value={values.ClassID || []}
                      renderOption={(props, option) => {
                        const isChecked = values.ClassID?.some(
                          (selected) => selected.ClassID === option.ClassID
                        );
                        return (
                          <li {...props} key={option.ClassID}>
                            <Checkbox size="small" disableRipple checked={isChecked} />
                            {option.ClassName}
                          </li>
                        );
                      }}
                      renderTags={(selected, getTagProps) =>
                        selected.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option.ClassID}
                            label={option.ClassName}
                            size="small"
                            variant="soft"
                            color="primary"
                          />
                        ))
                      }
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
                    <RHFAutocomplete // perfected multiselect autocomplete
                      name="Category"
                      label="Category"
                      fullWidth
                      multiple
                      limitTags={2}
                      options={Category}
                      getOptionLabel={(option) => option?.Inv_Cat_Name}
                      isOptionEqualToValue={(option, value) =>
                        option.Inv_Cat_ID === value.Inv_Cat_ID
                      }
                      value={values.Category || []}
                      renderOption={(props, option) => {
                        const isChecked = values.Category?.some(
                          (selected) => selected.Inv_Cat_ID === option.Inv_Cat_ID
                        );
                        return (
                          <li {...props} key={option.Inv_Cat_ID}>
                            <Checkbox size="small" disableRipple checked={isChecked} />
                            {option.Inv_Cat_Name}
                          </li>
                        );
                      }}
                      renderTags={(selected, getTagProps) =>
                        selected.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option.Inv_Cat_ID}
                            label={option.Inv_Cat_Name}
                            size="small"
                            variant="soft"
                            color="primary"
                          />
                        ))
                      }
                    />
                  </Box>

                  <Tooltip title="Add New Item Category" placement="top">
                    <IconButton color="primary" onClick={() => handleDialogOpen()}>
                      <Iconify icon="lets-icons:add-duotone" width={32} height={32} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
              {/* <RHFTextField name="inv_name" label="Sub Category Name" /> */}
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

ReqMiddlewareAddDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
};
