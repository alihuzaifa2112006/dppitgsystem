import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Radio,
  Table,
  TableBody,
  TableContainer,
  Typography,
  Skeleton,
  Tooltip,
  TextField,
  TableFooter,
  TableCell,
  TableRow,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { fNumber } from 'src/utils/format-number';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';

import { Get, Post } from 'src/api/apibasemethods';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import Scrollbar from 'src/components/scrollbar';
import {
  TableEmptyRows,
  useTable,
  emptyRows,
  TableHeadCustom,
  TableNoData,
} from 'src/components/table';
import MCheckListReportTableRow from './MCheckList-table-row';
import { number } from 'prop-types';
// import ConfirmationDialog from './TransferingDialog'; // Removed as we handle validation internally

import MCheckListReportSecondTable from './MCheckList-table-row-Second';
import { fDate } from 'src/utils/format-time';

export default function MCheckListCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  // const [dialogOpen, setDialogOpen] = useState(false); // No longer needed for validation
  const [editingIndex, setEditingIndex] = useState(null);
  const [RequestDetails, setRequestDetails] = useState([]);
  const [grnData, setGrnData] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [isGrnLoading, setIsGrnLoading] = useState(false);
  const [newRequestedDetail, setnewRequestedDetail] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [allLineNos, setAllLineNos] = useState([]);
  const [allMachines, setAllMachines] = useState([]);
  const [machineParts, setMachineParts] = useState([]);


  const handleStatusChange = (index, status) => {
    setMachineParts((prev) =>
      prev.map((part, i) => (i === index ? { ...part, Status: status } : part))
    );
  };

  // const handleCloseDialog = () => { // No longer needed
  //   setDialogOpen(false);
  // };





  const table = useTable();

  const notFound = !RequestDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  const [isLoading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);



  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = RequestDetails.filter((row) => row !== rowToDelete);
    setRequestDetails(updatedDetails);

    if (editingIndex !== null && RequestDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);

      setValue('EmployeeName', null);
      setValue('BagDetails', '');
      setValue('TotalBags', '');
    }
  };



  // useEffect(() => {
  //   const fetchChallanNumbers = async () => {
  //     try {
  //       const res = await Get(
  //         `GetConfirmReqNum?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
  //       );
  //       console.log('Requested No Response:', res.data);

  //       const challans = res.data || [];
  //       const ReqNumWithDate = challans.map((item) => ({
  //         ...item,

  //         ReqCodeWithDate: `${item.ReqCode} | ${fDate(item.CreatedDate)}`,
  //       }));
  //       console.log('Challan with date:', ReqNumWithDate);

  //       setallChallanNo(ReqNumWithDate);
  //     } catch (err) {
  //       console.error('Error fetching challans:', err);
  //     }
  //   };

  //   fetchChallanNumbers();
  // }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const NewMCheckListReportSchema = Yup.object().shape({

    PRDate: Yup.date().required('Date is required').typeError('Please enter a valid date'),
    Department: Yup.object()
      .nullable()
      .required('Please select a Department'),

    Section: Yup.object()
      .nullable()
      .required('Please select a Section'),

    LineNo: Yup.object()
      .nullable()
      .required('Please select a Line No'),

    Machine: Yup.object()
      .nullable()
      .required('Please select a Machine'),


  });

  const methods = useForm({
    resolver: yupResolver(NewMCheckListReportSchema),
    defaultValues: {
      PRDate: new Date(),

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



  const selectedDepartment = watch('Department');
  const selectedSection = watch('Section');
  const selectedLine = watch('LineNo');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await Get(
          `GetAllActiveInactiveDpt?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setAllDepartments(res.data?.Departments || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDepartments();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // setallMachine 

  useEffect(() => {
    const fetchMachines = async () => {
      // Ensure all required selections exist
      if (selectedDepartment?.Dpt_ID && selectedSection?.SectionID && selectedLine?.LineID) {
        try {
          const res = await Get(
            `GetAllMachinesByDeptSecID?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&DeptID=${selectedDepartment.Dpt_ID}&SectionID=${selectedSection.SectionID}&LineID=${selectedLine.LineID}`
          );
          setAllMachines(res.data?.data || []);
        } catch (error) {
          console.error('Failed to fetch machines', error);
          setAllMachines([]);
        }
      } else {
        setAllMachines([]);
      }

      // Reset Machine selection if any dependency changes
      setValue('Machine', null);
    };

    fetchMachines();
  }, [selectedDepartment, selectedSection, selectedLine, userData?.userDetails?.orgId, userData?.userDetails?.branchID, setValue]);


  useEffect(() => {
    const fetchSections = async () => {
      if (selectedDepartment?.Dpt_ID) {
        try {
          const res = await Get(
            `GetSectionsByDept?deptId=${selectedDepartment?.Dpt_ID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
          );
          setAllSections(res.data || []);
        } catch (error) {
          console.error('Failed to fetch sections', error);
          setAllSections([]);
        }
      } else {
        setAllSections([]);
      }

      setValue('Section', null);
      setValue('LineNo', null);
    };

    fetchSections();
  }, [selectedDepartment, userData?.userDetails?.orgId, userData?.userDetails?.branchID, setValue]);

  useEffect(() => {
    const fetchLineNos = async () => {
      if (selectedSection?.SectionID) {
        try {
          const res = await Get(
            `GetAllLineNo?org=${userData?.userDetails?.orgId}&branch=${userData?.userDetails?.branchID}&sectionId=${selectedSection?.SectionID}`
          );
          setAllLineNos(res.data?.data || []);
        } catch (error) {
          console.error('Failed to fetch line numbers', error);
          setAllLineNos([]);
        }
      } else {
        setAllLineNos([]);
      }

      setValue('LineNo', null);
    };

    fetchLineNos();
  }, [selectedSection, userData?.userDetails?.orgId, userData?.userDetails?.branchID, setValue]);

  useEffect(() => {
    const fetchMachineParts = async () => {
      const selectedMachine = values?.Machine;

      if (selectedMachine?.MachineID) {
        setIsGrnLoading(true);
        try {
          const res = await Get(
            `GetPartsByMachineID?machineID=${selectedMachine.MachineID}&orgID=${userData?.userDetails?.orgId}&branchID=${userData?.userDetails?.branchID}`
          );

          if (res?.data?.Status === 'Success' && Array.isArray(res.data.Parts)) {

            const initializedParts = res.data.Parts.map((part) => ({
              ...part,
              Status: '', // Initialize status to empty
              WorkToBeCarriedOut: '', // Initialize work to empty
            }));
            setMachineParts(initializedParts);
          } else {
            setMachineParts([]);
          }
        } catch (error) {
          console.error('Error fetching machine parts:', error);
          setMachineParts([]);
        } finally {
          setIsGrnLoading(false);
        }
      } else {
        setMachineParts([]);
      }
    };

    fetchMachineParts();
  }, [values?.Machine, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);




  const handleConfirmDialog = async (data) => {
    // 1. Validate form fields (Date, Dept, Section, Line, Machine) -> Handled by yupResolver on handleSubmit

    if (machineParts.length === 0) {
      enqueueSnackbar('No machine parts found. Please select a machine first to load parts.', { variant: 'error' });
      return;
    }

    // 2. Custom validation for the machineParts state array (The "Scheme" you requested)
    const partsWithErrors = machineParts.filter(
      (part) =>
        !part.Status || part.Status.trim() === '' || // Check if Status is empty
        !part.WorkToBeCarriedOut || part.WorkToBeCarriedOut.trim() === '' // Check if WorkToBeCarriedOut is empty
    );

    if (partsWithErrors.length > 0) {
      enqueueSnackbar(
        'Please ensure every machine part has a Status (G/B/C/NA) selected and a description in "Work To Be Carried Out".',
        { variant: 'error' }
      );
      // Optional: Scroll to the parts table to show the user where the error is
      document.getElementById('machine-parts-card')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // --- If all validation passes, proceed with the API call ---
    try {
      const dataToSend = {
        MachineID: data.Machine?.MachineID || null,
        LineID: data.LineNo?.LineID || null,
        DeptID: data.Department?.Dpt_ID || null,
        SectionID: data.Section?.SectionID || null,
        OrgID: userData.userDetails.orgId,
        BranchID: userData.userDetails.branchID,
        Checklist_Date: data.PRDate ? new Date(data.PRDate).toISOString() : null,
        Remarks: data.Remark || '',
        Created_By: userData.userDetails.userId,
        Last_Updated_By: userData.userDetails.userId,
        PartsList: machineParts.map((part) => ({
          PartID: part.PartID,
          Status: part.Status || '',
          WorkToBeCarriedOut: part.WorkToBeCarriedOut || '',
        })),
      };

      console.log('✅ Sending Body:', dataToSend);

      const res = await Post('AddMachinePartsChecklist', dataToSend);
      if (res.data?.Success === false) {
        enqueueSnackbar(res.data.Message || 'Something went wrong', { variant: 'error' });
      } else {
        enqueueSnackbar('Machine Parts Checklist Saved Successfully!', { variant: 'success' });
        reset();
        setMachineParts([]);
        router.push(paths.dashboard.Production.maintenance.MCheckList.root);
      }
    } catch (error) {
      console.error('Error saving checklist:', error);
      enqueueSnackbar('Error saving machine parts checklist', { variant: 'error' });
    }
  };


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

  return isLoading ? (
    renderLoading
  ) : (
    <FormProvider methods={methods}>
      <Grid container spacing={2}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 2 }}>
            <h3>Maintenance Checklist </h3>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(3, 1fr)',
                sm: 'repeat(4, 1fr)',
              }}
            >
              <Controller
                name="PRDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Date"
                    format="dd MMM yyyy"
                    value={field.value || new Date()}
                    onChange={(newValue) => field.onChange(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />


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
                getOptionLabel={(option) => (option && option.LineNo ? String(option.LineNo) : '')}
                isOptionEqualToValue={(option, value) => option?.LineID === value?.LineID}
                value={values?.LineNo || null}
                disabled={!selectedSection?.SectionID}
              />
              <RHFAutocomplete
                name="Machine"
                label="Select Machine"
                placeholder="Choose a Machine"
                fullWidth
                options={allMachines}
                // getOptionLabel={(option) => option?.MachineName || ''}
                getOptionLabel={(option) => (option && option.MachineName ? String(option.MachineName) : '')}
                isOptionEqualToValue={(option, value) => option?.MachineID === value?.MachineID}
                value={values?.Machine || null}
              />


            </Box>
          </Card>

          {isGrnLoading ? (
            <Card sx={{ p: 4, mt: 2 }}>
              <h3>Machine Parts</h3>
              <Stack spacing={1}>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={40} />
                ))}
              </Stack>
            </Card>
          ) : (
            machineParts.length > 0 && (
              <Card sx={{ p: 4, mt: 2 }} id="machine-parts-card"> {/* Added ID for optional scrolling */}
                <h3>Machine Parts</h3>
                <TableContainer>
                  <Scrollbar sx={{ maxHeight: '400px' }}>
                    <Table
                      size={table.dense ? 'small' : 'medium'}
                      sx={{
                        minWidth: 460,
                        mt: 2,
                        border: 1,
                        borderColor: '#f4f6f8',
                        borderStyle: 'dotted',
                      }}
                    >
                      <TableHeadCustom
                        order={table.order}
                        orderBy={table.orderBy}
                        headLabel={[
                          { id: 'MachineName', label: 'Machine Name', align: 'center' },
                          { id: 'PartDetails', label: 'Part Name & Code', align: 'center' },
                          { id: 'MachineCode', label: 'Machine Code', align: 'center' },
                          { id: 'WorkToBeCarriedOut', label: 'Work To Be Carried Out', align: 'center' },
                          { id: 'G', label: 'G', align: 'center' },
                          { id: 'B', label: 'B', align: 'center' },
                          { id: 'C', label: 'C', align: 'center' },
                          { id: 'NA', label: 'N.A.', align: 'center' },

                        ]}
                      />

                      <TableBody>
                        {machineParts.map((part, index) => (
                          <TableRow key={part.PartID}>
                            <TableCell align="center">{part.MachineName || '-'}</TableCell>
                            <TableCell align="center">
                                   {part.PartName && part.PartCode
                                ? `${part.PartName} - ${part.PartCode}`
                                : part.PartName || part.PartCode || '-'}

                              
                            </TableCell>
                            <TableCell align="center">{part.MachineCode || '-'}</TableCell>
                            <TableCell align="center">
                              <TextField
                                size="small"
                                placeholder="Work details"
                                // **Added error highlighting based on Status/WorkToBeCarriedOut**
                                error={
                                  (!part.Status || part.Status.trim() === '') || 
                                  (!part.WorkToBeCarriedOut || part.WorkToBeCarriedOut.trim() === '')
                                }
                                helperText={
                                  (!part.Status || part.Status.trim() === '') && (!part.WorkToBeCarriedOut || part.WorkToBeCarriedOut.trim() === '')
                                    ? 'Required'
                                    : ''
                                }
                                value={part.WorkToBeCarriedOut || ''}
                                onChange={(e) =>
                                  setMachineParts((prev) =>
                                    prev.map((p, i) =>
                                      i === index ? { ...p, WorkToBeCarriedOut: e.target.value } : p
                                    )
                                  )
                                }
                              />
                            </TableCell>

                      
                            {['G', 'B', 'C', 'NA'].map((status) => (
                              <TableCell align="center" key={status}>
                                <Radio
                                  checked={part.Status === status}
                                  onChange={() => handleStatusChange(index, status)}
                                  // **Added error highlighting for Radio group**
                                  color={!part.Status || part.Status.trim() === '' ? 'error' : 'primary'}
                                />
                              </TableCell>
                            ))}

                     

                          </TableRow>
                        ))}

                        <TableEmptyRows
                          height={denseHeight}
                          emptyRows={emptyRows(table.page, table.rowsPerPage, machineParts.length)}
                        />
                        <TableNoData notFound={machineParts.length === 0} />
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
              </Card>
            )
          )}





          <Card sx={{ p: 4, mt: 2 }}>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >

              <RHFTextField name='Remark' label="Remarks (Optional)" sx={{
                gridColumn: {
                  xs: '1 / -1',
                  sm: 'span 4',
                },
                width: '100%',
              }} />

            </Box>




          </Card>
          <Box mt={1} display="flex" flexDirection="column" rowGap={0.5} sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 1 }}>
            <Typography variant="body2" color="textSecondary">N.A. = Not Applicable</Typography>
            <Typography variant="body2" color="textSecondary">G = Good</Typography>
            <Typography variant="body2" color="textSecondary">B = Broken</Typography>
            <Typography variant="body2" color="textSecondary">C = Changed</Typography>
          </Box>






          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton
            
              onClick={handleSubmit(handleConfirmDialog)} 
              variant="contained"
              color="primary"
              loading={isSubmitting}
            >
              Save
            </LoadingButton>
          </Stack>
       
        </Grid>
      </Grid>
    </FormProvider>
  );
}