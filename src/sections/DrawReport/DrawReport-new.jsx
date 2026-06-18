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
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';

import { Get, Post } from 'src/api/apibasemethods';
import {
  DesktopDatePicker,
  DesktopDateTimePicker,
  DesktopTimePicker,
  MobileTimePicker,
} from '@mui/x-date-pickers';
import Scrollbar from 'src/components/scrollbar';
import {
  TableEmptyRows,
  useTable,
  emptyRows,
  TableHeadCustom,
  TableNoData,
} from 'src/components/table';



export default function DrawReportCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [allLineNumbers, setAllLineNumbers] = useState([]);
  const [allMaterialName, setAllMaterialName] = useState([]);
  const [allDrawingTypes, setAllDrawingTypes] = useState([]);
  const [DrawReportRows, setDrawReportRows] = useState([{ id: 1 }]);
  const [allCardNo, setAllCardNo] = useState([]);


  const table = useTable();


  const denseHeight = table.dense ? 56 : 56 + 20;

  
  const [lineTotals, setLineTotals] = useState({});


  const [isLoading, setLoading] = useState(false);
  


  const NewDrawReportSchema = Yup.object().shape({

    PRDate: Yup.date().required('Date is required').typeError('Please enter a valid date'),
    DepartmentSection: Yup.object()
      .nullable()
      .required('Please select a Department/Section'),
    LineNo: Yup.object()
      .nullable()
      .required('Please select a Line No'),
    DrawReportRows: Yup.array()
      .of(
        Yup.object().shape({
          DrawingType: Yup.object()
            .nullable()
            .required('Drawing Type is required'),
          Material: Yup.object()
            .nullable()
            .required('Material is required'),
          Speed: Yup.number()
            .required('Speed is required')
            .typeError('Speed must be a number')
            .min(0, 'Speed must be greater than or equal to 0'),
          Gran: Yup.number()
            .required('Grain/Yard is required')
            .typeError('Grain/Yard must be a number')
            .min(0, 'Grain/Yard must be greater than or equal to 0'),
          AInput1: Yup.number()
            .required('A - Total  is required')
            .typeError('A - Total  must be a number')
            .min(0, 'A - Total  must be greater than or equal to 0'),
          AInput2: Yup.number()
            .required('A - EFF % is required')
            .typeError('A - EFF % must be a number')
            .min(0, 'A - EFF % must be greater than or equal to 0'),
          BInput1: Yup.number()
            .required('B - Total  is required')
            .typeError('B - Total  must be a number')
            .min(0, 'B - Total  must be greater than or equal to 0'),
          BInput2: Yup.number()
            .required('B - EFF % is required')
            .typeError('B - EFF % must be a number')
            .min(0, 'B - EFF % must be greater than or equal to 0'),
          CInput1: Yup.number()
            .required('C - Total  is required')
            .typeError('C - Total  must be a number')
            .min(0, 'C - Total  must be greater than or equal to 0'),
          CInput2: Yup.number()
            .required('C - EFF % is required')
            .typeError('C - EFF % must be a number')
            .min(0, 'C - EFF % must be greater than or equal to 0'),
          Remarks: Yup.string().nullable(),
        })
      )
      .min(1, 'At least one row is required'),
    
  });

  const methods = useForm({
    resolver: yupResolver(NewDrawReportSchema),
    defaultValues: {
      PRDate: new Date(),
      SectionID: null,
      LineNo: null,
      SortedClassID: null,
      SortedCategory: null,
      SortedSubCategory: null,
      SortedColor: null,
      SortedInvSpare: null,
      SortedItemOpen: null,
      DrawReportRows: [{ 
        DrawingType: null, 
        Material: null, 
        Speed: '', 
        Gran: '', 
        AInput1: '', 
        AInput2: '', 
        BInput1: '', 
        BInput2: '', 
        CInput1: '', 
        CInput2: '', 
        Remarks: '' 
      }],
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

  useEffect(()=>{
    const fetchCardNo = async () => {
      try {
        const response = await Get(`GetCardNo?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`);
        setAllCardNo(response.data || []);
      } catch (error) {
        console.error('Error fetching card no:', error);
      }
    };
    fetchCardNo();
  })


  useEffect(() => {
    const fetchAllLineNumbers = async () => {
      const sectionId = userData?.userDetails?.SectionID;

      if (sectionId) {
        try {
          const response = await Get(
            `GetAllLineNo?org=${userData?.userDetails?.orgId}&branch=${userData?.userDetails?.branchID}&sectionId=${sectionId}`
          );
          // console.log('Line Numbers API Response:', response);

          const lineData = response.data.data || [];
          setAllLineNumbers(lineData);
        } catch (error) {
          // console.error('Error fetching line numbers:', error);
        }
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetchAllLineNumbers();
    }
  }, [userData]);


  useEffect(() => {
    const fetchDrawingTypes = async () => {
      try {
        const response = await Get(
          `GetCardTypes?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );
        setAllDrawingTypes(response.data || []);
      } catch (error) {
        // console.error('Error fetching drawing types:', error);
        setAllDrawingTypes([]);
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetchDrawingTypes();
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await Get(
          `GetMaterials?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );
        setAllMaterialName(response.data || []);
      } catch (error) {
        // console.error('Error fetching materials:', error);
        setAllMaterialName([]);
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetchMaterials();
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

 
  const onSubmit = handleSubmit(async () => {
    if (DrawReportRows.length === 0) {
      enqueueSnackbar('Please add at least one production detail', { variant: 'error' });
      return;
    }

    const dataToSend = {

      Deptid: userData?.userDetails?.DepId || 1,
   
      Line_No: '0' || 'Later Line no is removed',
      Org_ID: userData.userDetails.orgId,
      Branch_ID: userData.userDetails.branchID,
      Bale: lineTotals.overall?.bale || 0,
      Production: lineTotals.overall?.weight || 0,
      Total_MC_Running: lineTotals.overall?.mc || 0,
      Total_Production_HR: lineTotals.overall?.hr || 0,
     

      Details: DrawReportRows.map((detail) => ({
        ShiftID: detail.ShiftName?.ShiftId || 0,
        Total_MC_Running: detail.MCRunning || 0,
        Total_Production_HR: detail.ProductionHR || 0,

        ChallanNo: 0 || 'Later Challan no is removed',

        Line_No: parseInt(detail.Line, 10) || 0,
        TotalBale: parseFloat(detail.TBale) || 0,
        TotalWeight: parseFloat(detail.TotalWeight) || 0,
        DustWeight: parseFloat(detail.DustWeight) || 0,
        DustPercent: values.DustPercent?.DustPercent || 0,
        InvTypeID: detail.SortedClassID?.ClassID || 0,
        CatID: detail.SortedCategory?.Inv_Cat_ID || 0,
        SubCatID: detail.SortedSubCategory?.SubCat_ID || 0,
        ColorID: detail.SortedColor?.ColorID || 0,
        SpAreaID: detail.SortedInvSpare?.SpareID || 0,
        SFGItemID: detail.SortedItemOpen?.ItemID || 0,

      })),
    };

    console.log('Final data being sent:', dataToSend);

    try {
      await Post(`AddBlowRoomReport?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`, dataToSend).then(async (res) => {
        if (res.status !== 200) {
          enqueueSnackbar(res.data.message, { variant: 'error' });
        } else {
          enqueueSnackbar('Card & Efficiency Report Created Successfully!');
          router.push(paths.dashboard.Production.DrawReport.root);
          reset();
          // setRequestDetails([]);
        }
      });
    } catch (error) {
      // console.error(error);
      enqueueSnackbar('Error creating rag tearing report', { variant: 'error' });
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

  return isLoading ? (
    renderLoading
  ) : (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 2 }}>
            <h3>Drawing Production Report</h3>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <Controller
                name="PRDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Report Date"
                    format="dd/MM/yyyy"
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
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
              <TextField
                fullWidth
                name="DepartmentSection"
                label="Department/Section"
                value="Production/Drawing"
                InputLabelProps={{ shrink: true }}
                InputProps={{ readOnly: true }}
                disabled
              />
              <RHFAutocomplete
                name="lineNo"
                label="Select Line No"
                placeholder="Choose an option"
                fullWidth
                options={allLineNumbers}
                getOptionLabel={(option) => `${option?.LineNo || ''}`}
                isOptionEqualToValue={(option, value) => option?.LineNo === value?.LineNo}
                
              />
              <RHFAutocomplete
                name="cardNo"
                label="Select Card No"
                placeholder="Choose an option"
                fullWidth
                options={allCardNo}
                getOptionLabel={(option) => `${option?.CardNo || ''}`}
                isOptionEqualToValue={(option, value) => option?.CardNo === value?.CardNo}
              />



            </Box>
          </Card>




          <Card sx={{ p: 2, mt: 2 }}>
           
            <TableContainer>
              <Scrollbar sx={{ maxHeight: '600px' }}>
                <Table
                  size={table.dense ? 'small' : 'medium'}
                  sx={{
                    minWidth: 1400,
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
                      { id: 'DrawingType', label: 'Drawing Type', minWidth: 240, align: 'center' },
                      { id: 'Material', label: 'Material Name', minWidth: 280, align: 'center' },
                      { id: 'Speed', label: 'Speed M/Min', minWidth: 120, align: 'center' },
                      { id: 'Gran', label: 'Grain/Yard', minWidth: 120, align: 'center' },

                      { id: 'AInput1', label: 'A - Total ', minWidth: 150, align: 'center' },
                      { id: 'AInput2', label: 'A - EFF % ', minWidth: 150, align: 'center' },
                 
                      { id: 'BInput1', label: 'B - Total ', minWidth: 150, align: 'center' },
                      { id: 'BInput2', label: 'B - EFF % ', minWidth: 150, align: 'center' },
                     
                      { id: 'CInput1', label: 'C - Total ', minWidth: 150, align: 'center' },
                      { id: 'CInput2', label: 'C - EFF % ', minWidth: 150, align: 'center' },
                      { id: 'Remarks', label: 'Remarks', minWidth: 200, align: 'center' },
                      { id: 'Actions', label: 'Actions', minWidth: 100, align: 'center' },
                    ]}
                  />

                  <TableBody>
                    {DrawReportRows.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell align="center">
                          <RHFAutocomplete
                            name={`DrawReportRows[${index}].DrawingType`}
                            label=""
                            placeholder="Select Drawing Type"
                            fullWidth
                            size="small"
                            options={allDrawingTypes}
                            getOptionLabel={(option) => option?.DrawTypeName || option?.Name || ''}
                            isOptionEqualToValue={(option, value) => option?.DrawTypeID === value?.DrawTypeID || option?.ID === value?.ID}
                            value={values?.DrawReportRows?.[index]?.DrawingType || null}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <RHFAutocomplete
                            name={`DrawReportRows[${index}].Material`}
                            label=""
                            placeholder="Select Material"
                            fullWidth
                            size="small"
                            options={allMaterialName}
                            getOptionLabel={(option) => option?.MaterialName || option?.Name || ''}
                            isOptionEqualToValue={(option, value) => option?.MaterialID === value?.MaterialID || option?.ID === value?.ID}
                            value={values?.DrawReportRows?.[index]?.Material || null}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <RHFTextField
                            name={`DrawReportRows[${index}].Speed`}
                            label=""
                            placeholder="Speed M/Min"
                            type="number"
                            fullWidth
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <RHFTextField
                            name={`DrawReportRows[${index}].Gran`}
                            label=""
                            placeholder="Grain/Yard"
                            type="number"
                            fullWidth
                            size="small"
                          />
                        </TableCell>
                     
                        <TableCell align="center">
                          <RHFTextField
                            name={`DrawReportRows[${index}].AInput1`}
                            label=""
                            placeholder="Total "
                            type="number"
                            fullWidth
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <RHFTextField
                            name={`DrawReportRows[${index}].AInput2`}
                            label=""
                            placeholder="EFF %"
                            type="number"
                            fullWidth
                            size="small"
                          />
                        </TableCell>
                      
                        <TableCell align="center">
                          <RHFTextField
                            name={`DrawReportRows[${index}].BInput1`}
                            label=""
                            placeholder="Total "
                            type="number"
                            fullWidth
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <RHFTextField
                            name={`DrawReportRows[${index}].BInput2`}
                            label=""
                            placeholder="EFF %"
                            type="number"
                            fullWidth
                            size="small"
                          />
                        </TableCell>
                   
                        <TableCell align="center">
                          <RHFTextField
                            name={`DrawReportRows[${index}].CInput1`}
                            label=""
                            placeholder="Total "
                            type="number"
                            fullWidth
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <RHFTextField
                            name={`DrawReportRows[${index}].CInput2`}
                            label=""
                            placeholder="EFF %"
                            type="number"
                            fullWidth
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <RHFTextField
                            name={`DrawReportRows[${index}].Remarks`}
                            label=""
                            placeholder="Remarks"
                            fullWidth
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => {
                              if (DrawReportRows.length > 1) {
                                const filteredRows = DrawReportRows.filter((r) => r.id !== row.id);
                                setDrawReportRows(filteredRows);
                                
                                // Update form values to remove the deleted row
                                const currentRows = values?.DrawReportRows || [];
                                const updatedRows = currentRows.filter((_, i) => i !== index);
                                setValue('DrawReportRows', updatedRows);
                              }
                            }}
                            disabled={DrawReportRows.length === 1}
                            size="small"
                            sx={{
                              color: 'black', // normal text color
                              backgroundColor: 'transparent', // optional, if you want no background
                              '&:hover': {
                                backgroundColor: 'error.lighter', // light red background on hover
                                color: 'error.main', // red text on hover
                              },
                              '&:active': {
                                color: 'error.main', // red text when clicked
                              },
                            }}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, DrawReportRows.length)}
                    />
                    <TableNoData notFound={DrawReportRows.length === 0} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
            <Stack alignItems="flex-end" sx={{ mt: 2 }}>
            <Button
  variant="contained"
  startIcon={<Iconify icon="mingcute:add-line" />}
  sx={{
    backgroundColor: 'black', // button background
    color: 'white',           // text and icon color
    '&:hover': {
      backgroundColor: 'black', // keep same on hover
    },
    '&:active': {
      backgroundColor: 'black', // keep same on click
    },
  }}
  onClick={() => {
    const newId = Math.max(...DrawReportRows.map((r) => r.id), 0) + 1;
    const newRow = { id: newId };
    setDrawReportRows([...DrawReportRows, newRow]);

    // Update form values to include the new row
    const currentRows = values?.DrawReportRows || [];
    setValue('DrawReportRows', [
      ...currentRows,
      { 
        DrawingType: null, 
        Material: null, 
        Speed: '', 
        Gran: '', 
        AInput1: '', 
        AInput2: '', 
        BInput1: '', 
        BInput2: '', 
        CInput1: '', 
        CInput2: '', 
        Remarks: '' 
      }
    ]);
  }}
>
  Add Row
</Button>

            </Stack>
          </Card>

         
        
        <Card sx={{ p: 3, mt: 2 }}>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
             
           
              <RHFTextField
                name="Remarks"
                label="Remarks"
                placeholder="Enter remarks here"
                sx={{
                  gridColumn: {
                    xs: '1 / -1',
                    sm: 'span 4',
                  },
                  width: '100%',
                }}
                multiline
                rows={3}
                fullWidth
              />

            </Box>
          </Card>

    


          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              Save
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}