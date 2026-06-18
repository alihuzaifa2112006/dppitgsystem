import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TableBody from '@mui/material/TableBody';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { Autocomplete, Button, InputAdornment, Table, TextField, Typography } from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
} from 'src/components/table';

import { Get, Post } from 'src/api/apibasemethods';
import { decrypt, encrypt } from 'src/api/encryption';
import DetailTableRow from './detail-table-row';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { grid } from '@mui/system';

import { convertBDTtoUSD } from 'src/utils/BDTtoUSD';
import PricelistDialog from '../quotation/PricelistDialog';
import { de } from 'date-fns/locale';

// ----------------------------------------------------------------------

export default function AssignCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [allColors, setallColors] = useState([]);

  const [fieldsDisabled, setFieldsDisabled] = useState(false);
  const [AssignDetails, setAssignDetails] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [allformName, setallformName] = useState([]);
  const [allentityName, setallentityName] = useState([]);
const [allowedFieldType, setAllowedFieldType] = useState(null);

  const NewAssignSchema = Yup.object().shape({
 
  });

  const methods = useForm({
    resolver: yupResolver(NewAssignSchema),
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    getValues,
    resetField,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const GetFormNameData = useCallback(async () => {
    try {
      const response = await Get(`GetAllFormNames`);

      setallformName(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const selectedFormName = watch('FormName');
  useEffect(() => {
    const fetchEntityData = async () => {
      if (selectedFormName?.FormID) {
        try {
          const response = await Get(
            `GetByFormAttributes/${selectedFormName.FormID}?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
          );
          setallentityName(response.data.data); // Set options here
        } catch (error) {
          console.error(error);
        }
      } else {
        setallentityName([]);
      }
    };
    fetchEntityData();
  }, [selectedFormName, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // const GetFormNameData = useCallback(async () => {
  //   try {
  //     const response = await Get(
  //       `getAllWICList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
  //     );

  //     const allCustomers = response.data;

  //     const piRequests = allCustomers.map((customer) =>
  //       Get(
  //         `GetPIDropdownByWIC?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}&WIC_ID=${customer.WIC_ID}`
  //       )
  //     );

  //     const piResponses = await Promise.all(piRequests);

  //     const filteredCustomers = allCustomers.filter((customer, index) => {
  //       const piResponse = piResponses[index];
  //       return piResponse.data?.Data?.length > 0;
  //     });

  //     setCustomers(filteredCustomers);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetColors = useCallback(async () => {
    try {
      const response = await Get(
        `colors/all?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const newdata = response.data.Data.map((item) => ({
        ...item,
        ColorNickName: `${item.ColorName} - ${item.Color_Code}`,
      }));
      setallColors(newdata);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([GetFormNameData(), GetColors()]);
      setLoading(false);
    };
    fetchData();
  }, [GetFormNameData, GetColors]);

  const onSubmit = handleSubmit(async (data) => {

     if (AssignDetails.length === 0) {
    enqueueSnackbar('At least 1 column must be added', { variant: 'error' });
    return;
  }


  const dataToSend = {
    ColumnNo: AssignDetails[0]?.ColNo || 1,
    HeaderName: AssignDetails[0]?.ColHeadName || '',
    CreatedBy: userData?.userDetails?.userId,
    OrgID: userData?.userDetails?.orgId,
    BranchID: userData?.userDetails?.branchID,
    Details: AssignDetails.map((detail) => ({
      FormID: detail?.FormName?.FormID || 0,
      Field_ID: detail?.entity?.Field_ID || 0,
      FieldName: detail?.entity?.Display_Name || '',
      FieldType: detail?.entity?.Field_Type || '',
      OrgID: userData?.userDetails?.orgId,
      BranchID: userData?.userDetails?.branchID,
      IsDeleted: false,
      IsActive: true,
    })),
  };
    
  console.log('Data being sent:', dataToSend);

  try {
    const response = await Post('FormViewSavewithFields', dataToSend);
    if (response.status === 200) {
      enqueueSnackbar('Form view saved successfully!', { variant: 'success' });
      router.push(paths.dashboard.InventoryManagement.Assign.root);
    } else {
      enqueueSnackbar(response.data?.message || 'Failed to save form view', { variant: 'error' });
    }
  } catch (error) {
    console.error('API Error:', error);
    enqueueSnackbar(error.response?.data?.message || 'An error occurred', { variant: 'error' });
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

  // const handleAddDetail = () => {
  //   //  ColNo

  //   if (!values?.ColNo) {
  //     enqueueSnackbar('Column Number is required', { variant: 'error' });
  //     return;
  //   }

  //   if (!values?.ColHeadName) {
  //     enqueueSnackbar('Column Header Name is required', { variant: 'error' });
  //     return;
  //   }

  //   if (!values?.FormName) {
  //     enqueueSnackbar('Form Name  is required', { variant: 'error' });
  //     return;
  //   }

  //   if (!values?.entity) {
  //     enqueueSnackbar('Entity is required', { variant: 'error' });
  //     return;
  //   }

  //   // --- Validations End ---

  //   // --- Add or Update Detail ---
  //   if (editingIndex !== null) {
  //     const updatedDetails = [...AssignDetails];
  //     updatedDetails[editingIndex] = {
  //       ColNo: values?.ColNo,
  //       ColHeadName: values?.ColHeadName,
  //       FormName: values?.FormName || '',
  //        entity: values?.entity || '',
  //     };
  //     setAssignDetails(updatedDetails);
  //   } else {
  //     setAssignDetails((prev) => [
  //       ...prev,
  //       {
  //         ColNo: values?.ColNo,
  //         ColHeadName: values?.ColHeadName,
  //         FormName: values?.FormName || '',
  //          entity: values?.entity || '',
  //       },
  //     ]);
  //   }

  //   resetDetailForm();
  // };

  //   const resetDetailForm = () => {

  // resetField('ColNo');
  //   resetField('ColHeadName');
  //   resetField('FormName');
  //   resetField('entity');
  //   setEditingIndex(null);

  //     //  resetField('ColNo');
  //     // resetField('ColHeadName');
  //     // resetField('FormName');
  //     // resetField('entity');
  //     // setEditingIndex(null);
  //     // setEditingIndex(null);
  //   };

  useEffect(() => {
    if (!values.ColNo && !values.ColHeadName && !values.FormName && !values.entity) {
      setEditingIndex(null);
    }
  }, [values]);

  // const handleAddDetail = () => {
  //   // Validations
  //   if (!values?.ColNo) {
  //     enqueueSnackbar('Column Number is required', { variant: 'error' });
  //     return;
  //   }

  //   if (!values?.ColHeadName) {
  //     enqueueSnackbar('Column Header Name is required', { variant: 'error' });
  //     return;
  //   }

  //   if (!values?.FormName) {
  //     enqueueSnackbar('Form Name is required', { variant: 'error' });
  //     return;
  //   }

  //   if (!values?.entity) {
  //     enqueueSnackbar('Entity is required', { variant: 'error' });
  //     return;
  //   }

  //   // Create the new detail object
  //   const newDetail = {
  //     ColNo: values?.ColNo,
  //     ColHeadName: values?.ColHeadName,
  //     FormName: values?.FormName,
  //     entity: values?.entity,
  //   };

  //   // Add or update the detail
  //   if (editingIndex !== null) {
  //     // Update existing row
  //     const updatedDetails = [...AssignDetails];
  //     updatedDetails[editingIndex] = newDetail;
  //     setAssignDetails(updatedDetails);
  //   } else {
  //     // Add new row
  //     setAssignDetails((prev) => [...prev, newDetail]);
  //   }

  //   // Reset the form
  //   resetDetailForm();
  // };

  // const resetDetailForm = () => {
  //   // Reset all form fields
  //   methods.reset({
  //     ...values, // keep other values
  //     ColNo: '',
  //     ColHeadName: '',
  //     FormName: null, // important for dropdowns
  //     entity: null, // important for dropdowns
  //   });
  //   setEditingIndex(null);
  // };

  const handleAddDetail = () => {
    // Validations
    if (!values?.ColNo) {
      enqueueSnackbar('Column Number is required', { variant: 'error' });
      return;
    }

    if (!values?.ColHeadName) {
      enqueueSnackbar('Column Header Name is required', { variant: 'error' });
      return;
    }

    if (!values?.FormName) {
      enqueueSnackbar('Form Name is required', { variant: 'error' });
      return;
    }

    if (!values?.entity) {
      enqueueSnackbar('Entity is required', { variant: 'error' });
      return;
    }

    
    const currentFieldType = values?.entity?.Field_Type;
  if (AssignDetails.length > 0 && currentFieldType !== allowedFieldType) {
    enqueueSnackbar(`All fields must be same of type: ${allowedFieldType}`, { variant: 'error' });
    return;
  }


    // Create the new detail object
    const newDetail = {
      ColNo: values?.ColNo,
      ColHeadName: values?.ColHeadName,
      FormName: values?.FormName,
      entity: values?.entity,
       Field_Type: values?.entity?.Field_Type || ''
    };

    // Add or update the detail
    if (editingIndex !== null) {
      // Update existing row
      const updatedDetails = [...AssignDetails];
      updatedDetails[editingIndex] = newDetail;
      setAssignDetails(updatedDetails);
    } else {
      // Add new row
      setAssignDetails((prev) => [...prev, newDetail]);
      if (AssignDetails.length === 0) {
        setFieldsDisabled(true);
        setAllowedFieldType(currentFieldType);
      }
    }

    // Reset the form
    resetDetailForm();
  };


  const resetDetailForm = () => {

 setValue('FormName', null);
  setValue('entity', null);
  setEditingIndex(null);

  // setValue('FormName', null);
  // setValue('entity', null);
  // setEditingIndex(null);
};
 
  // const resetDetailForm = () => {
  //   // Reset all form fields
  //   methods.reset({
  //     ...values,

  //     FormName: null,
  //     entity: null,
  //   });
  //   setEditingIndex(null);
  // };
  const handleEditDetail = (index) => {
    const detail = AssignDetails[index];

    // setValue('ColNo', detail?.ColNo || '');
    // setValue('ColHeadName', detail?.ColHeadName || '');
    // setValue('FormName', detail?.FormName || null);
    // setValue('entity', detail?.entity || null);
    
  setValue('ColNo', detail?.ColNo || '');
  setValue('ColHeadName', detail?.ColHeadName || '');
  setValue('FormName', detail?.FormName || null);
  setValue('entity', detail?.entity || null);

    setEditingIndex(index);


  };

  // Table Heads
  const DetailsTableHead = [
    { id: 'ColNo', label: 'Column No', minWidth: 100, align: 'center' },
    { id: 'ColHeadName', label: 'Column Header Name', minWidth: 150, align: 'center' },
    { id: 'FormName', label: 'Form Name', minWidth: 150, align: 'center' },
    { id: 'entity', label: 'Entity', minWidth: 150, align: 'center' },
    { id: 'Field_Type', label: 'Field Type', minWidth: 150, align: 'center' },
    
    { id: 'Actions', label: 'Actions', width: 88 },
  ];

  // Table
  const table = useTable();

  const notFound = !AssignDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = AssignDetails.filter((row) => row !== rowToDelete);
    setAssignDetails(updatedDetails);

    // If we're deleting the row being edited, reset the form
    if (editingIndex !== null && AssignDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);
      setValue('PIID', null);
      setValue('ItemCode', null);
      setValue('PIQuantity', null);
      setValue('DOQuantity', null);
      setValue('Color', null);
      setValue('LotNo', null);
      setValue('LotLabel', null);
      setValue('Remarks', null);
    }
  };

  // -----------------------------------------------------------

  console.log(values);
  console.log(AssignDetails);

  const unit = values?.UOM?.UOMName;
  // -----------------------------------------------------------

  return isLoading ? (
    renderLoading
  ) : (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <h3>Assign View</h3>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(2, 1fr)',
                }}
              >
                {/* First Row  */}
                <RHFTextField
                  name="ColNo"
                  label="Column No"
                  disabled={fieldsDisabled && editingIndex === null}
                  type="number"
                  variant="outlined"
                  fullWidth
                />
                <RHFTextField
                  name="ColHeadName"
                  label="Column Header Name"
                  disabled={fieldsDisabled && editingIndex === null}
                  type="text"
                  variant="outlined"
                  fullWidth
                  onKeyDown={(e) => {
                    // Allow letters, space, backspace, delete, arrow keys
                    if (
                      !/^[a-zA-Z\s]$/.test(e.key) &&
                      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
                />

                {/* Second Row  */}
                <RHFAutocomplete
                  name="FormName"
                  label="Select Form Name"
                  placeholder="Choose an option"
                  fullWidth
                  options={allformName}
                  value={values.FormName || null}
                  // getOptionLabel={(option) => option?.FormName}

                  getOptionLabel={(option) => option?.FormName || ''}
                  isOptionEqualToValue={(option, value) => option.FormID === value.FormID}
                />

                <RHFAutocomplete
                  name="entity"
                  label="Select Entity"
                  value={values.entity || null}
                  placeholder="Choose an option"
                  fullWidth
                  type="text"
                  options={allentityName}
                  
                  
                  
                  getOptionLabel={(option) => option?.Display_Name || ''}
                />

                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gridColumn: '1 / -1',
                  }}
                >
                  <Stack direction="row" spacing={2}>
                    <Button color="primary" onClick={handleAddDetail} variant="contained">
                      {editingIndex !== null ? 'Update' : 'Add'}
                    </Button>
                    {editingIndex !== null && (
                      <Button color="error" onClick={resetDetailForm} variant="outlined">
                        Cancel
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Box>
            </Card>

            {AssignDetails.length > 0 && (
              <Scrollbar>
                <Table
                  size={table.dense ? 'small' : 'medium'}
                  sx={{
                    minWidth: 460,
                    mt: 4,
                    border: 1,
                    borderColor: '#f4f6f8',
                    borderStyle: 'dotted',
                  }}
                >
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={DetailsTableHead}
                  />

                  <TableBody>
                    {AssignDetails.map((row, index) => (
                      <DetailTableRow
                        key={index}
                        row={row}
                        onDeleteRow={() => DeleteDetailTableRow(row)}
                        onEditRow={() => handleEditDetail(index)}
                      />
                    ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, AssignDetails.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>

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
              </Scrollbar>
            )}
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
