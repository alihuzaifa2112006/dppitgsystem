import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  IconButton,
  InputAdornment,
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

import { Get, Put } from 'src/api/apibasemethods';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import Scrollbar from 'src/components/scrollbar';
import {
  TableEmptyRows,
  useTable,
  emptyRows,
  TableHeadCustom,
  TableNoData,
} from 'src/components/table';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

// ----------------------------------------------------------------------

export default function CardReportEditForm({ currentData }) {
  console.log('currentData in edit form', currentData);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  
  const [allLineNumbers, setAllLineNumbers] = useState([]);
  const [allMaterialName, setAllMaterialName] = useState([]);
  const [allCardTypes, setAllCardTypes] = useState([]);
  const [cardReportRows, setCardReportRows] = useState([{ id: 1 }]);
  const [allBlowroomNumbers, setAllBlowroomNumbers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const table = useTable();
  const denseHeight = table.dense ? 56 : 56 + 20;

  // --- Form Hooks Setup ---
  const NewCardReportSchema = Yup.object().shape({
    PRDate: Yup.date().required('Date is required').typeError('Please enter a valid date'),
    lineNo: Yup.object()
      .nullable()
      .required('Please select a Line No'),
    BlowroomNumber: Yup.object()
      .nullable()
      .required('Please select a Blowroom Rpt No.'),
    cardReportRows: Yup.array()
      .of(
        Yup.object().shape({
          CardType: Yup.object()
            .nullable()
            .required('Card Type is required'),
          Material: Yup.object()
            .nullable()
            .required('Material is required'),
          Qty: Yup.number()
            .nullable()
            .typeError('Qty must be a number')
            .min(0, 'Qty must be greater than or equal to 0'),
          Speed: Yup.number()
            .nullable()
            .typeError('Speed must be a number')
            .min(0, 'Speed must be greater than or equal to 0'),
          Gran: Yup.number()
            .nullable()
            .typeError('Grain/Yard must be a number')
            .min(0, 'Grain/Yard must be greater than or equal to 0'),
          AInput1: Yup.number()
            .nullable()
            .typeError('A - Total  must be a number')
            .min(0, 'A - Total  must be greater than or equal to 0'),
          AInput2: Yup.number()
            .nullable()
            .typeError('A - EFF % must be a number')
            .min(0, 'A - EFF % must be greater than or equal to 0'),
          BInput1: Yup.number()
            .nullable()
            .typeError('B - Total  must be a number')
            .min(0, 'B - Total  must be greater than or equal to 0'),
          BInput2: Yup.number()
            .nullable()
            .typeError('B - EFF % must be a number')
            .min(0, 'B - EFF % must be greater than or equal to 0'),
          CInput1: Yup.number()
            .nullable()
            .typeError('C - Total  must be a number')
            .min(0, 'C - Total  must be greater than or equal to 0'),
          CInput2: Yup.number()
            .nullable()
            .typeError('C - EFF % must be a number')
            .min(0, 'C - EFF % must be greater than or equal to 0'),
          Remarks: Yup.string().nullable(),
        })
      )
      .min(1, 'At least one row is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewCardReportSchema),
    defaultValues: {
      PRDate: dayjs(),
      lineNo: null,
      BlowroomNumber: null,
      cardReportRows: [{ 
        CardType: null, 
        Material: null, 
        Qty: '', 
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
      Remarks: '',
    },
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  // Helper function to validate total KGS sum doesn't exceed Qty
  const validateTotalKgsSum = (rowIndex, newValue, fieldName) => {
    const currentRow = values?.cardReportRows?.[rowIndex];
    const qty = parseFloat(currentRow?.Qty) || 0;
    
    if (qty === 0) {
      return { isValid: true, message: '' };
    }

    const aInput1 = fieldName === 'AInput1' ? parseFloat(newValue) || 0 : parseFloat(currentRow?.AInput1) || 0;
    const bInput1 = fieldName === 'BInput1' ? parseFloat(newValue) || 0 : parseFloat(currentRow?.BInput1) || 0;
    const cInput1 = fieldName === 'CInput1' ? parseFloat(newValue) || 0 : parseFloat(currentRow?.CInput1) || 0;
    
    const totalSum = aInput1 + bInput1 + cInput1;
    
    if (totalSum > qty) {
      return {
        isValid: false,
        message: `Total KGS sum (${totalSum.toFixed(2)}) cannot exceed Qty (${qty.toFixed(2)})`
      };
    }
    
    return { isValid: true, message: '' };
  };

  // Fetch initial data
  useEffect(() => {
    const fetchAllBlowroomNumbers = async () => {
      try {
        const response = await Get(`GetBlowRoomPDONO`);
        setAllBlowroomNumbers(response?.data || []);
      } catch (error) {
        console.error('Error fetching blowroom numbers:', error);
      }
    };
    fetchAllBlowroomNumbers();
  }, []);

  useEffect(() => {
    const fetchAllLineNumbers = async () => {
      const sectionId = userData?.userDetails?.SectionID;

      if (sectionId) {
        try {
          const response = await Get(
            `GetAllLineNo?org=${userData?.userDetails?.orgId}&branch=${userData?.userDetails?.branchID}&sectionId=${sectionId}`
          );
          const lineData = response.data.data || [];
          setAllLineNumbers(lineData);
        } catch (error) {
          console.error('Error fetching line numbers:', error);
        }
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetchAllLineNumbers();
    }
  }, [userData]);

  // Fetch Card Types
  useEffect(() => {
    const fetchCardTypes = async () => {
      try {
        const response = await Get(`GetMachineById?machineId=1`);
        setAllCardTypes(response?.data?.data?.Parts || []);
      } catch (error) {
        console.error('Error fetching card types:', error);
        setAllCardTypes([]);
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetchCardTypes();
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // Fetch Blowroom Items when BlowroomNumber is selected (for editing, this should not reset if already loaded)
  useEffect(() => {
    const fetchBlowroomItems = async () => {
      const selectedBlowroom = values.BlowroomNumber;
      const reportID = selectedBlowroom?.ReportID;
      const orgId = userData?.userDetails?.orgId;
      const branchID = userData?.userDetails?.branchID;

      if (reportID && orgId && branchID) {
        try {
          const response = await Get(
            `GetBlowRoomItems?ReportID=${reportID}&OrgID=${orgId}&BranchID=${branchID}`
          );
          
          // Transform API response to match Material format
          const transformedItems = (response?.data || []).map((item) => ({
            MaterialID: item.InItemID,
            ID: item.InItemID,
            MaterialName: item.ItemDescription,
            Name: item.ItemDescription,
            ItemCode: item.ItemCode,
            TotalWeight: item.TotalWeight,
            UOMID: item.UOMID,
            UOMName: item.UOMName,
            ReportID: item.ReportID,
          }));
          
          setAllMaterialName(transformedItems);
        } catch (error) {
          console.error('Error fetching blowroom items:', error);
          setAllMaterialName([]);
        }
      }
    };

    if (values.BlowroomNumber) {
      fetchBlowroomItems();
    }
  }, [values.BlowroomNumber, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // Load currentData into form
  useEffect(() => {
    if (currentData && allLineNumbers.length > 0 && allCardTypes.length > 0 && allBlowroomNumbers.length > 0) {
      try {
        setIsLoadingData(true);
        
        // Set Date
        if (currentData.RptDate) {
          setValue('PRDate', dayjs(currentData.RptDate));
        }

        // Set Line Number
        if (currentData.LineID && allLineNumbers.length > 0) {
          const line = allLineNumbers.find((l) => l.LineID === currentData.LineID);
          if (line) {
            setValue('lineNo', line);
          }
        }

        // Set Blowroom Number - BlwReportID is a string like "BR-0125" that matches PDONO
        if (currentData.BlwReportID && allBlowroomNumbers.length > 0) {
          const blowroom = allBlowroomNumbers.find((b) => 
            String(b.ReportID) === String(currentData.BlwReportID) || 
            b.PDONO === currentData.BlwReportID ||
            String(b.PDONO) === String(currentData.BlwReportID)
          );
          if (blowroom) {
            setValue('BlowroomNumber', blowroom);
          }
        }

        // Map Details to cardReportRows
        if (currentData.Details && Array.isArray(currentData.Details) && currentData.Details.length > 0) {
          const mappedRows = currentData.Details.map((detail, index) => {
            // Find CardType
            const cardType = allCardTypes.find((ct) => ct.PartID === detail.CardTypeID);
            
            // Find ShiftEfficiencies for this detail
            // Since there's no explicit link, we'll match by UOMID and approximate TotalWeight
            // For simplicity, we'll match by index or by UOMID
            const detailShiftEffs = currentData.ShiftEfficiencies?.filter((se) => 
              se.UOMID === detail.UOMID
            ) || [];
            
            const shiftA = detailShiftEffs.find((se) => se.ShiftID === 1);
            const shiftB = detailShiftEffs.find((se) => se.ShiftID === 2);
            const shiftC = detailShiftEffs.find((se) => se.ShiftID === 3);

            return {
              // Store original IDs for update
              CardingDetailID: detail.CardingDetailID,
              ShiftAEfficiencyID: shiftA?.EfficiencyID,
              ShiftBEfficiencyID: shiftB?.EfficiencyID,
              ShiftCEfficiencyID: shiftC?.EfficiencyID,
              CardType: cardType || null,
              Material: {
                MaterialID: detail.InItemID,
                ID: detail.InItemID,
                MaterialName: detail.ItemDescription || '',
                Name: detail.ItemDescription || '',
                UOMID: detail.UOMID,
                UOMName: detail.UOMName || '',
                TotalWeight: detail.TotalWeight,
              },
              Qty: detail.TotalWeight || '',
              Speed: detail.SpeedDateTime || '',
              Gran: detail.GrandYard || '',
              AInput1: shiftA?.TotalWeight || '',
              AInput2: shiftA?.Efficiency || '',
              BInput1: shiftB?.TotalWeight || '',
              BInput2: shiftB?.Efficiency || '',
              CInput1: shiftC?.TotalWeight || '',
              CInput2: shiftC?.Efficiency || '',
              Remarks: detail.Remarks || '',
            };
          });

          setCardReportRows(mappedRows.map((_, index) => ({ id: index + 1 })));
          setValue('cardReportRows', mappedRows);

          // Fetch materials for the blowroom
          // First find the blowroom object to get the ReportID
          if (currentData.BlwReportID && allBlowroomNumbers.length > 0) {
            const blowroom = allBlowroomNumbers.find((b) => 
              String(b.ReportID) === String(currentData.BlwReportID) || 
              b.PDONO === currentData.BlwReportID ||
              String(b.PDONO) === String(currentData.BlwReportID)
            );
            const reportID = blowroom?.ReportID || currentData.BlwReportID;
            
            const fetchMaterials = async () => {
              try {
                const response = await Get(
                  `GetBlowRoomItems?ReportID=${reportID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
                );
                
                const transformedItems = (response?.data || []).map((item) => ({
                  MaterialID: item.InItemID,
                  ID: item.InItemID,
                  MaterialName: item.ItemDescription,
                  Name: item.ItemDescription,
                  ItemCode: item.ItemCode,
                  TotalWeight: item.TotalWeight,
                  UOMID: item.UOMID,
                  UOMName: item.UOMName,
                  ReportID: item.ReportID,
                }));
                
                setAllMaterialName(transformedItems);
              } catch (error) {
                console.error('Error fetching materials:', error);
              }
            };
            fetchMaterials();
          }
        }

        setIsLoadingData(false);
      } catch (error) {
        console.error('Error loading current data:', error);
        setIsLoadingData(false);
      }
    }
  }, [currentData, allLineNumbers, allCardTypes, allBlowroomNumbers, setValue, userData]);

console.log('values', values.BlowroomNumber);

  const onSubmit = handleSubmit(
    async (data) => {
      // Validate that at least one row has required fields
      const validRows = data.cardReportRows?.filter(
        (row) => row.CardType && row.Material
      );

      if (!validRows || validRows.length === 0) {
        enqueueSnackbar('Please add at least one valid production detail with Card Type and Material', { variant: 'error' });
        return;
      }

      // Validate that sum of A, B, C Total KGS doesn't exceed Qty for each row
      for (let i = 0; i < validRows.length; i += 1) {
        const row = validRows[i];
        const qty = parseFloat(row.Qty) || 0;
        
        if (qty > 0) {
          const aInput1 = parseFloat(row.AInput1) || 0;
          const bInput1 = parseFloat(row.BInput1) || 0;
          const cInput1 = parseFloat(row.CInput1) || 0;
          const totalSum = aInput1 + bInput1 + cInput1;
          
          if (totalSum > qty) {
            enqueueSnackbar(
              `Row ${i + 1}: Total KGS sum (${totalSum.toFixed(2)}) cannot exceed Qty (${qty.toFixed(2)})`,
              { variant: 'error' }
            );
            return;
          }
        }
      }
console.log('selectedBlowroom', values.BlowroomNumber);
      const Details = validRows.map((row) => ({
        CardingDetailID: row.CardingDetailID || 0, // Include ID for update
        CardTypeID: row.CardType?.PartID || 0,
        InItemID: row.Material?.MaterialID || row.Material?.ID || 0,
        UOMID: row.Material?.UOMID || 1, 
        SpeedDateTime: row.Speed || '',
        GrandYard: parseFloat(row.Gran) || 0,
        TotalWeight: row.Qty || 0,
        Remarks: row.Remarks || '',
      }));

      const ShiftEfficiencies = [];
      
      validRows.forEach((row) => {
        const uomId = row.Material?.UOMID || 1;
        
        // Shift A (ShiftID: 1)
        if (row.AInput1 && parseFloat(row.AInput1) > 0) {
          ShiftEfficiencies.push({
            EfficiencyID: row.ShiftAEfficiencyID || 0, // Include ID for update
            ShiftID: 1,
            Efficiency: parseFloat(row.AInput2) || 0,
            TotalWeight: parseFloat(row.AInput1) || 0,
            UOMID: uomId,
          });
        }
        
        // Shift B (ShiftID: 2)
        if (row.BInput1 && parseFloat(row.BInput1) > 0) {
          ShiftEfficiencies.push({
            EfficiencyID: row.ShiftBEfficiencyID || 0, // Include ID for update
            ShiftID: 2,
            Efficiency: parseFloat(row.BInput2) || 0,
            TotalWeight: parseFloat(row.BInput1) || 0,
            UOMID: uomId,
          });
        }
        
        // Shift C (ShiftID: 3)
        if (row.CInput1 && parseFloat(row.CInput1) > 0) {
          ShiftEfficiencies.push({
            EfficiencyID: row.ShiftCEfficiencyID || 0, // Include ID for update
            ShiftID: 3,
            Efficiency: parseFloat(row.CInput2) || 0,
            TotalWeight: parseFloat(row.CInput1) || 0,
            UOMID: uomId,
          });
        }
      });

      // Get BlwReportID - it should be the string value (PDONO like "BR-0125"), not ReportID number
      const selectedBlowroom = values.BlowroomNumber;
      const blowroomReportID = selectedBlowroom?.ReportID || currentData?.BlwReportID || '';

      const dataToSend = {
        ReportID: currentData?.ReportID || 0,
        DeptID: currentData?.DeptID || 9,
        SecID: currentData?.SecID || 25,
        LineID: values.lineNo?.LineID || 0,
        BlwReportID: blowroomReportID, // Use string value (PDONO format like "BR-0125")
        OrgID: userData?.userDetails?.orgId || 0,
        BranchID: userData?.userDetails?.branchID || 0,
        CreatedBy: currentData?.CreatedBy || userData?.userDetails?.userId?.toString() || '0',
        Details,
        ShiftEfficiencies,
      };

      console.log('Final data being sent for update:', dataToSend);

      const reportId = currentData?.ReportID || 0;
      try {
        await Put(`UpdateProductionCarding?ReportID=${reportId}`, dataToSend).then(async (res) => {
          if (res.status !== 200) {
            enqueueSnackbar(res.data.message || 'Error updating report', { variant: 'error' });
          } else {
            enqueueSnackbar('Carding Report Updated Successfully!');
            router.push(paths.dashboard.Production.CardReport.root);
            reset();
          }
        });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Error updating carding report', { variant: 'error' });
      }
    },
    (validationErrors) => {
      enqueueSnackbar('Please fill all required fields', { variant: 'error' });
    }
  );

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

  if (isLoadingData) {
    return renderLoading;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 2 }}>
              <h3>Production Daily Report (Carding Report)</h3>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(4, 1fr)',
                }}
              >
                <Controller
                  name="PRDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Report Date"
                      format="DD MMM YYYY"
                      value={field.value ? dayjs(field.value) : null}
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
                  value="Production/Carding"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly: true }}
                  disabled
                />
                <RHFAutocomplete
                  name="lineNo"
                  label="Line No"
                  placeholder="Choose an option"
                  fullWidth
                  disabled
                  options={allLineNumbers}
                  getOptionLabel={(option) => `${option?.LineNo || ''}`}
                  isOptionEqualToValue={(option, value) => option?.LineNo === value?.LineNo}
                />
                <RHFAutocomplete
                  name="BlowroomNumber"
                  label="Blowroom Rpt No."
                  placeholder="Choose an option"
                  fullWidth
                  options={allBlowroomNumbers}
                  disabled
                  getOptionLabel={(option) => `${option?.PDONO || ''}`}
                  isOptionEqualToValue={(option, value) => option?.ReportID === value?.ReportID}
                  value={values.BlowroomNumber}
                />
              </Box>
            </Card>

            {values.BlowroomNumber && (
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
                          { id: 'CardType', label: 'Card Type', minWidth: 200, align: 'center' },
                          { id: 'Material', label: 'Material Name', minWidth: 320, align: 'center' },
                          { id: 'Qty', label: 'Qty', minWidth: 120, align: 'center' },
                          { id: 'Speed', label: 'Speed M/Min', minWidth: 120, align: 'center' },
                          { id: 'Gran', label: 'Grain/Yard', minWidth: 120, align: 'center' },
                          { id: 'AInput1', label: 'A - Total', minWidth: 120, align: 'center' },
                          { id: 'AInput2', label: 'A - EFF % ', minWidth: 120, align: 'center' },
                          { id: 'BInput1', label: 'B - Total', minWidth: 120, align: 'center' },
                          { id: 'BInput2', label: 'B - EFF % ', minWidth: 120, align: 'center' },
                          { id: 'CInput1', label: 'C - Total', minWidth: 120, align: 'center' },
                          { id: 'CInput2', label: 'C - EFF % ', minWidth: 120, align: 'center' },
                          { id: 'Remarks', label: 'Remarks', minWidth: 180, align: 'center' },
                          { id: 'Actions', label: 'Actions', minWidth: 60, align: 'center' },
                        ]}
                      />

                      <TableBody>
                        {cardReportRows.map((row, index) => (
                          <TableRow key={row.id}>
                            <TableCell align="center">
                              <RHFAutocomplete
                                name={`cardReportRows[${index}].CardType`}
                                label=""
                                placeholder="Select Card Type"
                                fullWidth
                                size="small"
                                options={allCardTypes}
                                getOptionLabel={(option) => option?.PartName}
                                isOptionEqualToValue={(option, value) => option?.PartID === value?.PartID}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <RHFAutocomplete
                                name={`cardReportRows[${index}].Material`}
                                label=""
                                placeholder="Select Material"
                                fullWidth
                                size="small"
                                options={allMaterialName}
                                getOptionLabel={(option) => option?.MaterialName || option?.Name || ''}
                                isOptionEqualToValue={(option, value) => option?.MaterialID === value?.MaterialID || option?.ID === value?.ID}
                                value={values?.cardReportRows?.[index]?.Material || null}
                                onchange={(newValue) => {
                                  if (newValue?.TotalWeight !== undefined) {
                                    setValue(`cardReportRows[${index}].Qty`, newValue.TotalWeight);
                                  } else {
                                    setValue(`cardReportRows[${index}].Qty`, '');
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <RHFTextField
                                name={`cardReportRows[${index}].Qty`}
                                label=""
                                placeholder="Qty"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{
                                  readOnly: true,
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Typography variant="body2">{values?.cardReportRows[index]?.Material?.UOMName || ''}</Typography>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <RHFTextField
                                name={`cardReportRows[${index}].Speed`}
                                label=""
                                placeholder="Speed M/Min"
                                type="number"
                                fullWidth
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <RHFTextField
                                name={`cardReportRows[${index}].Gran`}
                                label=""
                                placeholder="Grain/Yard"
                                type="number"
                                fullWidth
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <RHFTextField
                                name={`cardReportRows[${index}].AInput1`}
                                label=""
                                placeholder="Total "
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Typography variant="body2">{values?.cardReportRows[index]?.Material?.UOMName || ''}</Typography>
                                    </InputAdornment>
                                  ),
                                }}
                                onchange={(e) => {
                                  const totalKgs = parseFloat(e.target.value) || 0;
                                  const qty = parseFloat(values?.cardReportRows?.[index]?.Qty) || 0;
                                  
                                  const validation = validateTotalKgsSum(index, e.target.value, 'AInput1');
                                  
                                  if (!validation.isValid) {
                                    enqueueSnackbar(validation.message, { variant: 'error' });
                                    setValue(`cardReportRows[${index}].AInput1`, '');
                                    setValue(`cardReportRows[${index}].AInput2`, '');
                                    return;
                                  }
                                  
                                  if (qty > 0) {
                                    const efficiency = (totalKgs / qty) * 100;
                                    setValue(`cardReportRows[${index}].AInput2`, efficiency.toFixed(2));
                                  } else {
                                    setValue(`cardReportRows[${index}].AInput2`, '');
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <RHFTextField
                                name={`cardReportRows[${index}].AInput2`}
                                label=""
                                placeholder="EFF %"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <RHFTextField
                                name={`cardReportRows[${index}].BInput1`}
                                label=""
                                placeholder="Total "
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Typography variant="body2">{values?.cardReportRows[index]?.Material?.UOMName || ''}</Typography>
                                    </InputAdornment>
                                  ),
                                }}
                                onchange={(e) => {
                                  const totalKgs = parseFloat(e.target.value) || 0;
                                  const qty = parseFloat(values?.cardReportRows?.[index]?.Qty) || 0;
                                  
                                  const validation = validateTotalKgsSum(index, e.target.value, 'BInput1');
                                  
                                  if (!validation.isValid) {
                                    enqueueSnackbar(validation.message, { variant: 'error' });
                                    setValue(`cardReportRows[${index}].BInput1`, '');
                                    setValue(`cardReportRows[${index}].BInput2`, '');
                                    return;
                                  }
                                  
                                  if (qty > 0) {
                                    const efficiency = (totalKgs / qty) * 100;
                                    setValue(`cardReportRows[${index}].BInput2`, efficiency.toFixed(2));
                                  } else {
                                    setValue(`cardReportRows[${index}].BInput2`, '');
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <RHFTextField
                                name={`cardReportRows[${index}].BInput2`}
                                label=""
                                placeholder="EFF %"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <RHFTextField
                                name={`cardReportRows[${index}].CInput1`}
                                label=""
                                placeholder="Total "
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Typography variant="body2">{values?.cardReportRows[index]?.Material?.UOMName || ''}</Typography>
                                    </InputAdornment>
                                  ),
                                }}
                                onchange={(e) => {
                                  const totalKgs = parseFloat(e.target.value) || 0;
                                  const qty = parseFloat(values?.cardReportRows?.[index]?.Qty) || 0;
                                  
                                  const validation = validateTotalKgsSum(index, e.target.value, 'CInput1');
                                  
                                  if (!validation.isValid) {
                                    enqueueSnackbar(validation.message, { variant: 'error' });
                                    setValue(`cardReportRows[${index}].CInput1`, '');
                                    setValue(`cardReportRows[${index}].CInput2`, '');
                                    return;
                                  }
                                  
                                  if (qty > 0) {
                                    const efficiency = (totalKgs / qty) * 100;
                                    setValue(`cardReportRows[${index}].CInput2`, efficiency.toFixed(2));
                                  } else {
                                    setValue(`cardReportRows[${index}].CInput2`, '');
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <RHFTextField
                                name={`cardReportRows[${index}].CInput2`}
                                label=""
                                placeholder="EFF %"
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{
                                  readOnly: true,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <RHFTextField
                                name={`cardReportRows[${index}].Remarks`}
                                label=""
                                placeholder="Remarks"
                                fullWidth
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                onClick={() => {
                                  if (cardReportRows.length > 1) {
                                    const filteredRows = cardReportRows.filter((r) => r.id !== row.id);
                                    setCardReportRows(filteredRows);
                                    
                                    const currentRows = values?.cardReportRows || [];
                                    const updatedRows = currentRows.filter((_, i) => i !== index);
                                    setValue('cardReportRows', updatedRows);
                                  }
                                }}
                                disabled={cardReportRows.length === 1}
                                size="small"
                                sx={{
                                  color: 'error.main',
                                  '&:hover': {
                                    backgroundColor: 'error.lighter',
                                    color: 'error.dark',
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
                          emptyRows={emptyRows(table.page, table.rowsPerPage, cardReportRows.length)}
                        />
                        <TableNoData notFound={cardReportRows.length === 0} />
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
                <Stack alignItems="flex-end" sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      const newId = Math.max(...cardReportRows.map((r) => r.id), 0) + 1;
                      const newRow = { id: newId };
                      setCardReportRows([...cardReportRows, newRow]);
                      
                      const currentRows = values?.cardReportRows || [];
                      setValue('cardReportRows', [
                        ...currentRows,
                        { 
                          CardType: null, 
                          Material: null, 
                          Qty: '', 
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
                    startIcon={<Iconify icon="mingcute:add-line" />}
                  >
                    Add Row
                  </Button>
                </Stack>
              </Card>
            )}

            {/* <Card sx={{ p: 3, mt: 2 }}>
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
            </Card> */}

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
                Update
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>
    </LocalizationProvider>
  );
}

CardReportEditForm.propTypes = {
  currentData: PropTypes.any,
};
