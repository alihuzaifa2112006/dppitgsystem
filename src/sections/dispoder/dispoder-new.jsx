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

export default function DispoderCreateForm() {
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


  const [PIID, setPIID] = useState([]);
  const [allColors, setallColors] = useState([]);
  const [allItemCode, setallItemCode] = useState([]);
  const [allPIQuantity, setallPIQuantity] = useState([]);
  const [dispoderDetails, setDispoderDetails] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const NewDispoderSchema = Yup.object().shape({
    doDate: Yup.date().required('Dispatch Date is required'),
    Customer: Yup.object().required('Customer is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewDispoderSchema),
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    resetField,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  //  Customer 

  const GetCustomerData = useCallback(async () => {
    console.log("sds");

    try {
      const response = await Get(
        `GetWalkInCustomers_PI?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );

      setCustomers(response.data);
    } catch (error) {
      console.log(error);
    }
    //  GetCustomerData()

  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

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
      await GetCustomerData();
      await GetColors();
      setLoading(false);
    };
    fetchData();
  }, [GetCustomerData, GetColors]);

  useEffect(() => {
    const FetchPIData = async () => {
      if (values.Customer) {
        const fetchPi = await Get(
          `GetPIDropdownByWIC?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}&WIC_ID=${values.Customer?.WIC_ID}`
        );
        setPIID(fetchPi.data.Data);
      }
    };
    FetchPIData();
  }, [values.Customer, userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

  const resetOnPI = () => {
    setValue('ItemCode', null);
    setValue('Color', null);
    setValue('PIQuantity', '');
    setValue('DOQuantity', '');
    // setValue('LotNo', '');
    setValue('LotLabel', '');
    setValue('Remarks', '');
  };
  // Fetching Item Code

  useEffect(() => {
    const FetchItemCodeData = async () => {
      if (values.PIID) {
        const fetchItemCodes = await Get(`GetItemByPIID?PIID=${values.PIID.PIID}`);

        setallItemCode(fetchItemCodes.data.Data);
      }
    };
    FetchItemCodeData();
  }, [values.PIID, userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

  //  Here We Fetch the  Color Data

  useEffect(() => {
    const FetchColorData = async () => {
      if (values.ItemCode) {
        try {
          const colorResponse = await Get(`GetColorByPIDtlID?PIDtlID=${values.ItemCode.PIDtlID}`);
          if (colorResponse.data.Data) {
            setValue(
              'Color',
              allColors.find((x) => x.ColorID === colorResponse.data.Data[0]?.ColorID)
            );
          }
        } catch (error) {
          console.error('Error fetching color:', error);
        }
      }
    };

    FetchColorData();
  }, [values.ItemCode, allColors, setValue]);



  useEffect(() => {
    const FetchPIQuantity = async () => {
      if (values.ItemCode) {
        try {
          const PIQuantityResponse = await Get(
            `GetPIQuantityByPIDtlID?PIDtlID=${values.ItemCode.PIDtlID}`
          );

          if (PIQuantityResponse?.data?.PIQuantity !== undefined) {
            const totalAddedQuantityForThisPI = dispoderDetails.reduce((total, item) => {
              if (
                item.PIID?.PIID === values?.PIID?.PIID &&
                item.ItemCode?.PIDtlID === values?.ItemCode?.PIDtlID
              ) {
                return total + Number(item.DOQuantity || 0);
              }
              return total;
            }, 0);

            const remainingQuantity =
              Number(PIQuantityResponse.data.PIQuantity) - totalAddedQuantityForThisPI;

            setValue('PIQuantity', remainingQuantity > 0 ? remainingQuantity : 0);
          }
        } catch (error) {
          console.error('Error fetching PIQuantity:', error);
        }
      }
    };

    FetchPIQuantity();
  }, [values.ItemCode, values.PIID, dispoderDetails, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    if (dispoderDetails.length === 0) {
      enqueueSnackbar('Please add at least one dispoder product', { variant: 'error' });
      return;
    }



   const dataToSend = {
  DODate: data.doDate ? formatDate(data.doDate) : null,
  Remarks: data.Remarks || '',
  CreatedBy: userData?.userDetails?.userId,
  Branch_ID: userData?.userDetails?.branchID,
  Org_ID: userData?.userDetails?.orgId,
  WIC_ID: data.Customer?.WIC_ID, // ✅ This is the fix
  Details: dispoderDetails.map((detail) => ({
    PIID: detail?.PIID?.PIID,
    PIDtlID: detail?.ItemCode?.PIDtlID,
    ColorID: detail?.Color?.ColorID,
    LotLabel: detail?.LotLabel,
    Quantity: detail?.DOQuantity,
    Remarks: detail?.Remarks,
    DODate: detail?.DoDate || data.doDate
  })),
};



    // console.log('dataToSend:', dataToSend)
    // console.log(dataToSend.Details.map(x => x.DODate));
    // try {
    //   await Post('AddDispoder', dataToSend);

    //   router.push(paths.dashboard.customerClaim.dispoder.root);
    // } catch (error) {
    //   console.error(error);
    // }

    try {
      await Post('CreateDispatchOrder', dataToSend);
      enqueueSnackbar('Dispatch Order saved successfully!', { variant: 'success' });
      router.push(paths.dashboard.customerClaim.dispoder.root);
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


  const handleAddDetail = () => {
    // --- Validations Start ---
    if (!values?.Customer) {
      enqueueSnackbar('Customer is required', { variant: 'error' });
      return;
    }

    if (!values?.doDate) {
      enqueueSnackbar('Dispatch Date is required', { variant: 'error' });
      return;
    }

    if (!values?.PIID) {
      enqueueSnackbar('PI field is required', { variant: 'error' });
      return;
    }

    if (!values?.ItemCode) {
      enqueueSnackbar('Item is required', { variant: 'error' });
      return;
    }

    if (!values?.DOQuantity) {
      enqueueSnackbar('Dispatch Order Quantity is required', { variant: 'error' });
      return;
    }

    if (Number(values.DOQuantity) <= 0) {
      enqueueSnackbar('Dispatch Order Quantity must be greater than 0', { variant: 'error' });
      return;
    }

    if (Number(values.DOQuantity) > Number(values.PIQuantity)) {
      enqueueSnackbar(`You can only add maximum ${values.PIQuantity} quantity for this PI.`, {
        variant: 'error',
      });
      return;
    }
    // --- PI Quantity Validation ---
    const totalAddedQuantityForThisPI = dispoderDetails.reduce((total, item) => {
      if (
        item.PIID?.PIID === values?.PIID?.PIID &&
        item.ItemCode?.PIDtlID === values?.ItemCode?.PIDtlID
      ) {
        return total + Number(item.DOQuantity || 0);
      }
      return total;
    }, 0);

    const remainingQuantity = Number(values.PIQuantity) - totalAddedQuantityForThisPI;



    // if (!values?.LotNo) {
    //   enqueueSnackbar('LOT Number is required', { variant: 'error' });
    //   return;
    // }

    if (!values?.LotLabel) {
      enqueueSnackbar('LOT Label is required', { variant: 'error' });
      return;
    }
    // --- Validations End ---

    // --- Add or Update Detail ---
    if (editingIndex !== null) {
      const updatedDetails = [...dispoderDetails];
      updatedDetails[editingIndex] = {
        PIID: values?.PIID,
        ItemCode: values?.ItemCode,
        PIQuantity: values?.PIQuantity || '',
        DOQuantity: values?.DOQuantity || 0,
        Color: values?.Color || '',
        // LotNo: values?.LotNo || '',
        LotLabel: values?.LotLabel || '',
        Remarks: values?.Remarks || '',
        DODate: values?.doDate ? formatDate(values?.doDate) : null,
      };
      setDispoderDetails(updatedDetails);
    } else {
      setDispoderDetails((prev) => [
        ...prev,
        {
          PIID: values?.PIID,
          ItemCode: values?.ItemCode,
          PIQuantity: values?.PIQuantity || '',
          DOQuantity: values?.DOQuantity,
          Color: values?.Color || '',
          // LotNo: values?.LotNo || '',
          LotLabel: values?.LotLabel || '',
          Remarks: values?.Remarks || '',
          DODate: values?.doDate ? formatDate(new Date(values.doDate)) : null,
        },
      ]);
    }

    // --- Reset Form ---
    resetDetailForm();
  };

  const resetDetailForm = () => {
    //     setValue('Customer', null);
    // setValue('doDate', null);
    setValue('PIID', null);
    setValue('ItemCode', null);
    setValue('PIQuantity', '');
    setValue('DOQuantity', '');
    setValue('Color', null);
    // setValue('LotNo', '');
    setValue('LotLabel', '');
    setValue('Remarks', '');
    setEditingIndex(null);
  };
  const handleEditDetail = (index) => {
    const detail = dispoderDetails[index];
    setValue('PIID', detail?.PIID);
    setValue('ItemCode', detail?.ItemCode);
    setValue('Color', detail?.Color);
    setValue('PIQuantity', detail?.PIQuantity);
    setValue('DOQuantity', detail?.DOQuantity);
    // setValue('LotNo', detail?.LotNo);
    // setValue('LotLabel', detail?.LotLabel);
    setValue('LotLabel', detail?.LotLabel || '');
    setValue('Remarks', detail?.Remarks);
    setEditingIndex(index); // <-- add this
  };

  // Table Heads
  const DetailsTableHead = [
    { id: 'PIID', label: 'PI Number', minWidth: 240, align: 'center' },
    { id: 'ItemCode', label: 'Item ', minWidth: 240, align: 'center' },
    { id: 'Color', label: 'Color', minWidth: 240, align: 'center' },
    { id: 'PIQuantity', label: 'PI Quantity', align: 'center' },
    { id: 'DOQuantity', label: 'DO Quantity', align: 'center' },
    // { id: 'LotNo', label: 'Lot Number', align: 'center' },
    { id: 'LotLabel', label: 'Lot Label', align: 'center' },
    { id: 'Remarks', label: 'Remarks', align: 'center' },
    { id: 'Actions', label: 'Actions', width: 88 },
  ];

  // Table
  const table = useTable();

  const notFound = !dispoderDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = dispoderDetails.filter((row) => row !== rowToDelete);
    setDispoderDetails(updatedDetails);

    // If we're deleting the row being edited, reset the form
    if (editingIndex !== null && dispoderDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);
      setValue('PIID', null);
      setValue('ItemCode', null);
      setValue('PIQuantity', null);
      setValue('DOQuantity', null);
      setValue('Color', null);
      // setValue('LotNo', null);
      setValue('LotLabel', null);
      setValue('Remarks', null);
    }
  };

  // -----------------------------------------------------------

  console.log(values);

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
              <h3>Dispatch Order:</h3>
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

                <RHFAutocomplete
                  name="Customer"
                  label="Customer"
                  placeholder="Choose an option"
                  fullWidth
                  options={customers}
                  getOptionLabel={(option) => option?.WIC_Name}
                />

                <Controller
                  name="doDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Dispatch Date"
                      format="dd MMM yyyy"
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
              </Box>
            </Card>

            <Card sx={{ p: 3, mt: 2 }}>
              <Box sx={{ width: '100%' }}>
                <h3>Dispatch Order Item </h3>
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  }}
                >
                  <RHFAutocomplete
                    // sx={{ gridColumn: { xs: 'span 2' } }}

                    name="PIID"
                    label="Performa Invoice Id"
                    placeholder="Choose an option"
                    fullWidth
                    onchange={resetOnPI}
                    options={PIID}
                    value={values?.PIID || null}
                    getOptionLabel={(option) => option?.PINo || ''}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return option.PIID === value.PIID;
                    }}
                  />

                  <RHFAutocomplete
                    sx={{ gridColumn: { xs: 'span 1' } }}
                    name="ItemCode"
                    label="Item"
                    placeholder="Choose an option"
                    fullWidth
                    options={allItemCode}
                    value={values.ItemCode || null}
                    getOptionLabel={(option) => option?.YarnDescription || ''}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return option.PIDtlID === value.PIDtlID;
                    }}
                  />

                  <RHFAutocomplete
                    key={values?.Color?.ColorID || 'new'}
                    name="Color"
                    label="Color"
                    placeholder="Choose an option"
                    fullWidth
                    options={allColors}
                    value={values?.Color || null}
                    getOptionLabel={(option) => option?.ColorNameandCode || ''}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return option.ColorID === value.ColorID;
                    }}
                    disabled
                  />

                  <RHFTextField
                    disabled
                    name="PIQuantity"
                    label="Proforma Invoice Quantity"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={values.PIQuantity || ''}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2">{unit}</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <RHFTextField
                    name="DOQuantity"
                    label="Dispatch Order Quantity"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={values.DOQuantity || ''}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2">{unit}</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />


                  <RHFTextField
                    name="LotLabel"
                    label="Lot label"
                    type="text"
                    variant="outlined"
                    fullWidth
                  // value={values.DOQuantity || ''}
                  // InputProps={{
                  //   endAdornment: (
                  //     <InputAdornment position="end">
                  //       <Typography variant="body2">{unit}</Typography>
                  //     </InputAdornment>
                  //   ),
                  // }}
                  />

                  {/* HERE REMARK OPTIONS */}
                  <RHFTextField
                    name="Remarks"
                    label="Remarks (Optional)"
                    type="text"
                    variant="outlined"
                    fullWidth
                    sx={{
                      gridColumn: { xs: 'span 1', sm: 'span 2' }, // xs pe 1 column, sm pe full width (2 column)
                    }}
                  // value={values.DOQuantity || ''}
                  // InputProps={{
                  //   endAdornment: (
                  //     <InputAdornment position="end">
                  //       <Typography variant="body2">{unit}</Typography>
                  //     </InputAdornment>
                  //   ),
                  // }}
                  />
                </Box>
                <Stack alignItems="flex-end" direction="row-reverse" sx={{ my: 3, gap: 2 }}>
                  <Button color="primary" onClick={handleAddDetail} variant="contained">
                    {editingIndex !== null ? 'Update' : 'Add'}
                  </Button>
                  {editingIndex !== null && (
                    <Button
                      color="error"
                      onClick={resetDetailForm}
                      variant="outlined"
                      sx={{ mt: 1 }}
                    >
                      Cancel
                    </Button>
                  )}
                </Stack>

                {dispoderDetails.length > 0 && (
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
                        {dispoderDetails.map((row, index) => (
                          <DetailTableRow
                            key={index}
                            row={row}
                            onDeleteRow={() => DeleteDetailTableRow(row)}
                            onEditRow={() => handleEditDetail(index)}
                          />
                        ))}

                        <TableEmptyRows
                          height={denseHeight}
                          emptyRows={emptyRows(
                            table.page,
                            table.rowsPerPage,
                            dispoderDetails.length
                          )}
                        />

                        <TableNoData notFound={notFound} />
                      </TableBody>
                    </Table>
                  </Scrollbar>
                )}
              </Box>
            </Card>

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
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
