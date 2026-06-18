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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import Scrollbar from 'src/components/scrollbar';

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

export default function CountryDialog({ uploadClose, uploadOpen, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [allLineNos, setAllLineNos] = useState([]);
  const [parts, setParts] = useState([]);
  const [editingPartIndex, setEditingPartIndex] = useState(null);
  // State for category and subcategory
  const [allCategoryData, setallCategoryData] = useState([]);
  const [itemSubCategory, setItemSubCategory] = useState([]);
  const [AllOrigins, setAllOrigins] = useState([]);
  const [allPriorities, setAllPriorities] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpenSub, setDialogOpenSub] = useState(false);
  const [detailList, setDetailList] = useState([]);
  const [editingDetailIndex, setEditingDetailIndex] = useState(null);
  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewCountrySchema = Yup.object().shape({
    Inv_Cat_Name: Yup.object()
      .shape({
        Inv_Cat_ID: Yup.number().required('Category ID is required'),
        Inv_Cat_Name: Yup.string().required('Category Name is required'),
      })
      .nullable()
      .required('Fiber Category is required'),
    ItemSubCategory: Yup.object()
      .shape({
        SubCat_ID: Yup.number().required('Sub Category ID is required'),
        SubCat_Name: Yup.string().required('Sub Category Name is required'),
      })
      .nullable()
      .required('Fiber Sub Category is required'),
    // Priority and Origin are optional - only required when adding to detail list
    Priority: Yup.object()
      .shape({
        PriorityID: Yup.number(),
        PriorityName: Yup.string(),
      })
      .nullable(),
    Origin: Yup.object()
      .shape({
        Origin_ID: Yup.number(),
        Origin_Name: Yup.string(),
      })
      .nullable(),
  });

  const methods = useForm({
    resolver: yupResolver(NewCountrySchema),
    defaultValues: {
      Inv_Cat_Name: null,
      ItemSubCategory: null,
      Priority: null,
      Origin: null,
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


  const fetchOrigins = useCallback(async () => {
    try {
      const response = await Get('GetAllInvOrigins');
      setAllOrigins(response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchOrigins();
  }, [fetchOrigins]);

  const fetchPriorities = useCallback(async () => {
    try {
      const response = await Get(`GetOriginPriority?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`);
      setAllPriorities(response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

  useEffect(() => {
    fetchPriorities();
  }, [fetchPriorities]);






 





  // ============================================
  // FIBER CATEGORY AND SUB CATEGORY FLOW
  // ============================================
  const FetchAllCategoryData = useCallback(async () => {
    try {
      const response = await Get(
        `InvCategoryGetByClassId?classId=2&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setallCategoryData(response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    FetchAllCategoryData();
    setValue('Inv_Cat_Name', null);
  }, [FetchAllCategoryData, setValue]);

  const selectedCategory = watch('Inv_Cat_Name');

  const fetchSubCategory = useCallback(async () => {
    if (selectedCategory?.Inv_Cat_ID) {
      try {
        const response = await Get(`GetSubCategoriesByCategoryID/${selectedCategory.Inv_Cat_ID}`);
        setItemSubCategory(response.data.data);
      } catch (error) {
        console.error(error);
      }
    } else {
      setItemSubCategory([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchSubCategory();
    setValue('ItemSubCategory', null);
    // eslint-disable-next-line
  }, [selectedCategory, fetchSubCategory]);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSubCategoryOpen = () => {
    setDialogOpenSub(true);
  };

  const handleSubDialogClose = () => {
    fetchSubCategory();
    setDialogOpenSub(false);
  };

  // Detail List Management (Priority + Origin combinations)
  const handleAddDetail = () => {
    if (!values?.Priority) {
      enqueueSnackbar('Priority is required', { variant: 'error' });
      return;
    }
    if (!values?.Origin) {
      enqueueSnackbar('Origin is required', { variant: 'error' });
      return;
    }

    const newDetail = {
      PriorityID: values.Priority?.PriorityID,
      PriorityName: values.Priority?.PriorityName,
      OriginID: values.Origin?.Origin_ID,
      OriginName: values.Origin?.Origin_Name,
    };

    if (editingDetailIndex !== null) {
      // Update existing detail - check if priority is already used by another item
      const priorityExists = detailList.some(
        (item, index) =>
          item.PriorityID === newDetail.PriorityID && index !== editingDetailIndex
      );
      if (priorityExists) {
        enqueueSnackbar('This Priority is already added. Each priority can only be selected once.', {
          variant: 'error',
        });
        return;
      }
      const updatedDetails = [...detailList];
      updatedDetails[editingDetailIndex] = newDetail;
      setDetailList(updatedDetails);
      setEditingDetailIndex(null);
    } else {
      // Check if this priority already exists in the list (each priority can only be added once)
      const priorityExists = detailList.some(
        (item) => item.PriorityID === newDetail.PriorityID
      );
      if (priorityExists) {
        enqueueSnackbar('This Priority is already added. Each priority can only be selected once.', {
          variant: 'error',
        });
        return;
      }
      // Check for duplicate combination
      const isDuplicate = detailList.some(
        (item) =>
          item.PriorityID === newDetail.PriorityID && item.OriginID === newDetail.OriginID
      );
      if (isDuplicate) {
        enqueueSnackbar('This Priority and Origin combination already exists', { variant: 'error' });
        return;
      }
      // Add new detail
      setDetailList([...detailList, newDetail]);
    }

    // Reset form fields
    setValue('Priority', null);
    setValue('Origin', null);
  };

  const handleEditDetail = (index) => {
    const detail = detailList[index];
    setValue('Priority', {
      PriorityID: detail.PriorityID,
      PriorityName: detail.PriorityName,
    });
    setValue('Origin', {
      Origin_ID: detail.OriginID,
      Origin_Name: detail.OriginName,
    });
    setEditingDetailIndex(index);
  };

  const handleDeleteDetail = (index) => {
    const updatedDetails = detailList.filter((_, i) => i !== index);
    setDetailList(updatedDetails);
    if (editingDetailIndex === index) {
      setEditingDetailIndex(null);
      setValue('Priority', null);
      setValue('Origin', null);
    } else if (editingDetailIndex !== null && editingDetailIndex > index) {
      setEditingDetailIndex(editingDetailIndex - 1);
    }
  };

  const handleCancelEdit = () => {
    setEditingDetailIndex(null);
    setValue('Priority', null);
    setValue('Origin', null);
  };

  // Parts Management
  const handleAddPart = () => {
    const partName = values.PartName?.trim();
    const partNo = values.PartNo?.trim();

    if (!partName) {
      enqueueSnackbar('Part Name is required', { variant: 'error' });
      return;
    }

    if (editingPartIndex !== null) {
      // Update existing part
      const updatedParts = [...parts];
      updatedParts[editingPartIndex] = {
        PartName: partName,
        PartNo: partNo || '',
      };
      setParts(updatedParts);
      setEditingPartIndex(null);
    } else {
      // Add new part
      setParts([...parts, { PartName: partName, PartNo: partNo || '' }]);
    }

    // Reset form fields
    setValue('PartName', '');
    setValue('PartNo', '');
  };

  

  const onDptSubmit = handleSubmit(async (data) => {
    if (detailList.length === 0) {
      enqueueSnackbar('Please add at least one Priority and Origin combination', {
        variant: 'error',
      });
      return;
    }

    try {
      // Map detailList to Items array for the API
      const items = detailList.map((detail) => ({
        FiberCatID: data?.Inv_Cat_Name?.Inv_Cat_ID || 0,
        FiberSubCatID: data?.ItemSubCategory?.SubCat_ID || 0,
        OriginID: detail.OriginID || 0,
        PriorityID: detail.PriorityID || 0,
        CreatedBy: userData?.userDetails?.userId || 0,
        Org_ID: userData?.userDetails?.orgId || 0,
        Branch_ID: userData?.userDetails?.branchID || 0,
      }));

      const dataToSend = {
        Items: items,
      };

      await Post('AddOriginFactorMultiple', dataToSend);
      enqueueSnackbar('Origin Priority Factors Added Successfully', { variant: 'success' });
      uploadClose();
      reset();
      setDetailList([]);
      setEditingDetailIndex(null);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error while submitting Origin Priority Factor', { variant: 'error' });
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
          uploadClose();
          setParts([]);
          setEditingPartIndex(null);
          setDetailList([]);
          setEditingDetailIndex(null);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontSize: '20px !important' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Add Origin Factor
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
                sm: 'repeat(3, 1fr)',
              }}
            >
              <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <RHFAutocomplete
                      name="Inv_Cat_Name"
                      label="Fiber Category"
                      placeholder="Choose an option"
                      fullWidth
                      options={allCategoryData}
                      getOptionLabel={(option) => option?.Inv_Cat_Name || ''}
                      isOptionEqualToValue={(option, value) =>
                        option.Inv_Cat_ID === value.Inv_Cat_ID
                      }
                      value={values?.Inv_Cat_Name || null}
                    />
                  </Box>

                  {/* <Tooltip title="Add New Inventory Category" placement="top">
                    <IconButton color="primary" onClick={() => handleDialogOpen()}>
                      <Iconify icon="lets-icons:add-duotone" width={32} height={32} />
                    </IconButton>
                  </Tooltip> */}
                </Stack>
              </Box>
              <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <RHFAutocomplete
                      name="ItemSubCategory"
                      label="Fiber Sub Category"
                      placeholder="Choose an option"
                      fullWidth
                      options={itemSubCategory}
                      getOptionLabel={(option) => option?.SubCat_Name || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.SubCat_ID === value?.SubCat_ID
                      }
                      value={values?.ItemSubCategory || null}
                      isAddDisabled={!selectedCategory}
                    />
                  </Box>

                  {/* <Tooltip title="Add New Sub Category" placement="top">
                    <IconButton color="primary" onClick={() => handleSubCategoryOpen()}>
                      <Iconify icon="lets-icons:add-duotone" width={32} height={32} />
                    </IconButton>
                  </Tooltip> */}
                </Stack>
              </Box>
              <RHFAutocomplete
                name="Priority"
                label="Priority"
                placeholder="Choose an option"
                fullWidth
                options={allPriorities.filter((priority) => {
                  // If editing, show all priorities (validation will prevent duplicates)
                  if (editingDetailIndex !== null) {
                    return true;
                  }
                  // If not editing, exclude priorities already in the list
                  return !detailList.some((detail) => detail.PriorityID === priority.PriorityID);
                })}
                getOptionLabel={(option) => option?.PriorityName || ''}
                isOptionEqualToValue={(option, value) => option?.PriorityID === value?.PriorityID}
                value={values?.Priority || null}
              />

              <RHFAutocomplete
                name="Origin"
                label="Origin"
                placeholder="Choose an option"
                fullWidth
                options={AllOrigins}
                getOptionLabel={(option) => option?.Origin_Name || ''}
                isOptionEqualToValue={(option, value) => option.Origin_ID === value?.Origin_ID}
                value={values?.Origin || null}
              />
            </Box>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
              {editingDetailIndex !== null && (
                <Button variant="outlined" color="error" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
              <Button variant="contained" color="primary" onClick={handleAddDetail}>
                {editingDetailIndex !== null ? 'Update' : 'Add'}
              </Button>
            </Stack>

            {/* Detail Table */}
            {detailList.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <TableContainer component={Paper} variant="outlined">
                  <Scrollbar>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Priority</TableCell>
                          <TableCell>Origin</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailList.map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell>{detail?.PriorityName || '-'}</TableCell>
                            <TableCell>{detail?.OriginName || '-'}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditDetail(index)}
                              >
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteDetail(index)}
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
              </Box>
            )}

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
                disabled={detailList.length === 0}
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

CountryDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
};
