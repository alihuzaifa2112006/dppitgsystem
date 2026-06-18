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

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewCountrySchema = Yup.object().shape({
    Department: Yup.object().required('Department is required'),
    Section: Yup.object().required('Section is required'),
    LineNo: Yup.object().required('Line No is required'),
    Machine: Yup.string()
      .required('Machine is required')
      .min(3, 'Machine must be at least 3 characters long')
      .max(100, 'Country Name must be less than or equal to 100 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'Country Name must only contain letters and spaces'),
  });

  const methods = useForm({
    resolver: yupResolver(NewCountrySchema),
    defaultValues: {
      Department: null,
      Section: null,
      LineNo: null,
      PartName: '',
      PartNo: '',
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
  const GetAllDepartments = useCallback(async () => {
    const res = await Get(
      `GetAllActiveInactiveDpt?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setAllDepartments(res.data?.Departments || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    GetAllDepartments();
  }, [GetAllDepartments]);

  const selectedDepartment = watch('Department');

  const FetchAllSectionsData = useCallback(async () => {
    if (selectedDepartment?.Dpt_ID) {
      try {
        const response = await Get(
          `GetSectionsByDept?deptId=${selectedDepartment?.Dpt_ID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        // console.log('Category Response:', response.data);
        setAllSections(response.data || []);
      } catch (error) {
        console.error(error);
      }
    } else {
      setAllSections([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, selectedDepartment]);

  useEffect(() => {
    FetchAllSectionsData();
    setValue('Section', null);
    setValue('LineNo', null);
  }, [selectedDepartment, FetchAllSectionsData, setValue]);

  const selectedSection = watch('Section');

  const FetchAllLineNosData = useCallback(async () => {
    if (selectedSection?.SectionID) {
      try {
        const response = await Get(
          `GetAllLineNo?org=${userData?.userDetails?.orgId}&branch=${userData?.userDetails?.branchID}&sectionId=${selectedSection?.SectionID}`
        );
        setAllLineNos(response.data?.data || []);
      } catch (error) {
        console.error(error);
      }
    } else {
      setAllLineNos([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, selectedSection]);

  useEffect(() => {
    FetchAllLineNosData();
    setValue('LineNo', null);
  }, [selectedSection, FetchAllLineNosData, setValue]);

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

  const handleEditPart = (index) => {
    const part = parts[index];
    setValue('PartName', part.PartName);
    setValue('PartNo', part.PartNo);
    setEditingPartIndex(index);
  };

  const handleDeletePart = (index) => {
    const updatedParts = parts.filter((_, i) => i !== index);
    setParts(updatedParts);
    if (editingPartIndex === index) {
      setEditingPartIndex(null);
      setValue('PartName', '');
      setValue('PartNo', '');
    } else if (editingPartIndex !== null && editingPartIndex > index) {
      setEditingPartIndex(editingPartIndex - 1);
    }
  };

  const handleCancelEdit = () => {
    setEditingPartIndex(null);
    setValue('PartName', '');
    setValue('PartNo', '');
  };

  // addMachine
  // ------------------------------------
  const PostMachineName = async (PostData) => {
    try {
      await Post('addMachine', PostData).then((res) => {
        enqueueSnackbar(res.data.Message || 'Machine Added', { variant: 'success' });
        uploadClose();
        reset(); // Resets the form after successful submit
        setParts([]);
        setEditingPartIndex(null);
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message || 'Failed to add Machine', {
        variant: 'error',
      });
    }
  };
  const onDptSubmit = handleSubmit(async (data) => {
    // Duplicate check
    if (
      tableData.some((item) => item.Machine_Name?.toLowerCase() === data.Machine?.toLowerCase())
    ) {
      enqueueSnackbar('Machine already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        MachineName: data.Machine,
        DeptID: data?.Department?.Dpt_ID || null,
        SectionID: data?.Section?.SectionID || null,
        LineID: data?.LineNo?.LineID || null,
        CreatedBy: userData?.userDetails?.userId,
        OrgID: userData?.userDetails?.orgId,
        BranchID: userData?.userDetails?.branchID,
        Parts: parts.map((part) => ({
          PartName: part.PartName,
          PartNo: part.PartNo,
        })),
      };

      await PostMachineName(dataToSend);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error while submitting machine', { variant: 'error' });
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
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontSize: '20px !important' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Add Machine
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
                name="Department"
                label="Department"
                placeholder="Choose an option"
                fullWidth
                options={allDepartments}
                getOptionLabel={(option) => option?.Dpt_Name || ''}
                isOptionEqualToValue={(option, value) => option?.Dpt_ID === value?.Dpt_ID}
                value={values?.Department || null}
              />
              <RHFAutocomplete
                name="Section"
                label="Section"
                placeholder="Choose an option"
                fullWidth
                options={allSections}
                getOptionLabel={(option) => option?.SectionName || ''}
                isOptionEqualToValue={(option, value) => option?.SectionID === value?.SectionID}
                value={values?.Section || null}
                disabled={!selectedDepartment?.Dpt_ID}
              />
              <RHFAutocomplete
                name="LineNo"
                label="Line No"
                placeholder="Choose an option"
                fullWidth
                options={allLineNos}
                getOptionLabel={(option) => option?.LineNo || ''}
                isOptionEqualToValue={(option, value) => option?.LineID === value?.LineID}
                value={values?.LineNo || null}
                disabled={!selectedSection?.SectionID}
              />
              <RHFTextField name="Machine" label="Machine" />
            </Box>

            {/* Parts Section */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Parts
              </Typography>
              <Box
                rowGap={2}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
                sx={{ mb: 2 }}
              >
                <RHFTextField name="PartName" label="Part Name" />
                <RHFTextField name="PartNo" label="Part No" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  {editingPartIndex !== null && (
                    <Button variant="outlined" color="error" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddPart}
                    startIcon={
                      <Iconify
                        icon={
                          editingPartIndex !== null ? 'mingcute:edit-line' : 'mingcute:add-line'
                        }
                      />
                    }
                  >
                    {editingPartIndex !== null ? 'Update Part' : 'Add Part'}
                  </Button>
                </Stack>
              </Box>

              {parts.length > 0 && (
                <TableContainer component={Paper} variant="outlined">
                  <Scrollbar>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Part Name</TableCell>
                          <TableCell>Part No</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {parts.map((part, index) => (
                          <TableRow key={index}>
                            <TableCell>{part?.PartName || '-'}</TableCell>
                            <TableCell>{part?.PartNo || '-'}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditPart(index)}
                              >
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeletePart(index)}
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
              )}
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

CountryDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
};
