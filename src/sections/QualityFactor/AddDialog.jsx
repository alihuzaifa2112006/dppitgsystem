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
  const [allGrades, setAllGrades] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpenSub, setDialogOpenSub] = useState(false);
  const [detailList, setDetailList] = useState([]);
  const [editingDetailIndex, setEditingDetailIndex] = useState(null);
  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewCountrySchema = Yup.object().shape({
  
  });

  const methods = useForm({
    resolver: yupResolver(NewCountrySchema),
    defaultValues: {
      Inv_Cat_Name: null,
      ItemSubCategory: null,
      Priority: null,
      Grade: null,
      Percentage: '',
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

  // Auto-add minus sign for Grade C
  useEffect(() => {
    const selectedGrade = values?.Grade;
    const percentage = values?.Percentage;

    if (
      selectedGrade?.OFGradeName?.toLowerCase().includes('grade c') &&
      percentage &&
      percentage !== '' &&
      !percentage.toString().startsWith('-')
    ) {
      // Automatically add minus sign for Grade C
      const numericValue = parseFloat(percentage);
      if (!Number.isNaN(numericValue) && numericValue > 0) {
        setValue('Percentage', `-${numericValue}`);
      }
    }
  }, [values?.Grade, values?.Percentage, setValue]);

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

  const fetchGrades = useCallback(async () => {
    try {
      const response = await Get('GetAllQualityFactorGrades');
      setAllGrades(response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);






 





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

  // Detail List Management (Grade + Percentage combinations)
  const handleAddDetail = () => {
    if (!values?.Grade) {
      enqueueSnackbar('Grade is required', { variant: 'error' });
      return;
    }
    if (!values?.Percentage || values?.Percentage === '') {
      enqueueSnackbar('Percentage is required', { variant: 'error' });
      return;
    }

    // Ensure Grade C has negative percentage
    let percentageValue = parseFloat(values.Percentage) || 0;
    const isGradeC = values.Grade?.OFGradeName?.toLowerCase().includes('grade c');
    if (isGradeC && percentageValue > 0) {
      percentageValue = -Math.abs(percentageValue);
    }

    const newDetail = {
      QFGradeID: values.Grade?.QFGradeID,
      OFGradeName: values.Grade?.OFGradeName,
      Percentage: percentageValue,
    };

    if (editingDetailIndex !== null) {
      // Update existing detail
      const updatedDetails = [...detailList];
      updatedDetails[editingDetailIndex] = newDetail;
      setDetailList(updatedDetails);
      setEditingDetailIndex(null);
    } else {
      // Check for duplicate grade
      const gradeExists = detailList.some(
        (item) => item.QFGradeID === newDetail.QFGradeID
      );
      if (gradeExists) {
        enqueueSnackbar('This Grade is already added. Each grade can only be selected once.', {
          variant: 'error',
        });
        return;
      }
      // Add new detail
      setDetailList([...detailList, newDetail]);
    }

    // Reset form fields
    setValue('Grade', null);
    setValue('Percentage', '');
  };

  const handleEditDetail = (index) => {
    const detail = detailList[index];
    setValue('Grade', {
      QFGradeID: detail.QFGradeID,
      OFGradeName: detail.OFGradeName,
    });
    setValue('Percentage', detail.Percentage?.toString() || '');
    setEditingDetailIndex(index);
  };

  const handleDeleteDetail = (index) => {
    const updatedDetails = detailList.filter((_, i) => i !== index);
    setDetailList(updatedDetails);
    if (editingDetailIndex === index) {
      setEditingDetailIndex(null);
      setValue('Grade', null);
      setValue('Percentage', '');
    } else if (editingDetailIndex !== null && editingDetailIndex > index) {
      setEditingDetailIndex(editingDetailIndex - 1);
    }
  };

  const handleCancelEdit = () => {
    setEditingDetailIndex(null);
    setValue('Grade', null);
    setValue('Percentage', '');
  };

  // Parts Management
  

  

  const onDptSubmit = handleSubmit(async (data) => {
    if (detailList.length === 0) {
      enqueueSnackbar('Please add at least one Grade and Percentage combination', {
        variant: 'error',
      });
      return;
    }

    try {
      // Map detailList to Items array for the API
      const items = detailList.map((detail) => ({
        FiberCatID: data?.Inv_Cat_Name?.Inv_Cat_ID || 0,
        GradeID: detail.QFGradeID || 0,
        Grade: parseFloat(detail.Percentage) || 0,
        Org_ID: userData?.userDetails?.orgId || 0,
        Branch_ID: userData?.userDetails?.branchID || 0,
        CreatedBy: userData?.userDetails?.userId || 0,
      }));

      const dataToSend = {
        Items: items,
      };
        console.log(dataToSend);

      await Post('AddQualityFactorMultiple', dataToSend);
      enqueueSnackbar('Quality Factors Added Successfully', { variant: 'success' });
      uploadClose();
      reset();
      setDetailList([]);
      setEditingDetailIndex(null);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error while submitting Quality Factor', { variant: 'error' });
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
              Add  Quality Factor
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
              <RHFAutocomplete
                name="Grade"
                label="Grade"
                placeholder="Choose an option"
                fullWidth
                options={allGrades.filter((grade) => {
                  // If editing, show all grades (validation will prevent duplicates)
                  if (editingDetailIndex !== null) {
                    return true;
                  }
                  // If not editing, exclude grades already in the list
                  return !detailList.some((detail) => detail.QFGradeID === grade.QFGradeID);
                })}
                getOptionLabel={(option) => option?.OFGradeName || ''}
                isOptionEqualToValue={(option, value) => option?.QFGradeID === value?.QFGradeID}
                value={values?.Grade || null}
              />
              <RHFTextField name="Percentage" label="Percentage" type="number" />
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
                          <TableCell>Grade</TableCell>
                          <TableCell align="right">Percentage</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailList.map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell>{detail?.OFGradeName || '-'}</TableCell>
                            <TableCell align="right">{detail?.Percentage || '-'}%</TableCell>
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
