import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import Iconify from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { Get, Post } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import { Box } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Label from 'src/components/label';

export default function ItemQCRejectDialog({ open, onClose, rejectedQty, selectedItem }) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [itemSubCategory, setItemSubCategory] = useState([]);
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const validationSchema = Yup.object().shape({
    Items: Yup.array()
      .of(
        Yup.object().shape({
          Rejection_Qty: Yup.number()
            .required('Quantity is required')
            // .min(1, 'Quantity must be at least 1')
            .max(
              Yup.ref('$rejectedQty'),
              ({ max }) => `Cannot exceed total rejected quantity of ${max}`
            )
            .typeError('Must be a valid number'),
          Reason_Detail: Yup.string()
            .required('Reason is required')
            .min(5, 'Reason must be at least 5 characters'),
          // Rejection_Type_ID: Yup.object().nullable().required('Category is required'),
        })
      )
      .min(1, 'At least one rejection item is required'),
  });

  const methods = useForm({
    resolver: yupResolver(validationSchema),
    context: { rejectedQty },
    defaultValues: {
      Items: [
        {
          Rejection_Qty: '',
          Reason_Detail: '',
          Rejection_Type_ID: null,
        },
      ],
    },
  });

  const {
    reset,
    setValue,
    watch,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = methods;
  const values = watch();

  const GetItemSubCategory = useCallback(async () => {
    try {
      const response = await Get(`GetSubCategoriesByCategoryID/5`);
      setItemSubCategory(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    GetItemSubCategory();
  }, [GetItemSubCategory]);

  const handleAdd = () => {
    const newProduct = {
      Rejection_Qty: '',
      Reason_Detail: '',
      Rejection_Type_ID: null,
    };
    setValue('Items', [...values.Items, newProduct]);
  };

  const handleProductDelete = (rowToDelete) => {
    const updatedDetails = values.Items.filter((row) => row !== rowToDelete);
    setValue('Items', updatedDetails);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const currentDate = new Date().toISOString();

      await Post('AddQCWithRejections', {
        GRNDTLID: selectedItem.GRNDtlID,
        UOMID: selectedItem.UOMID,
        Total_Received: selectedItem.Total_Receive_Qty,
        Passed_Qty: selectedItem.Passed_Qty,
        VendorID: selectedItem.VendorID,
        SampleQty: selectedItem.SampleQty || 0,
        isSampleRec: selectedItem.isSampleRec || 'N',
        Remarks: `Rejected ${rejectedQty} ${selectedItem?.UOMName || 'units'}`,
        Approval_Status:
          selectedItem?.Total_Receive_Qty === rejectedQty ? 'Rejected' : 'Partially Approved',
        Approval_Level: 1,
        QC_Date: currentDate,
        Created_By: userData?.userDetails?.userId || 1,
        Rejections: values.Items.map((item) => ({
          UOMID: selectedItem.UOMID,
          Rejection_Qty: item.Rejection_Qty,
          Reason_Detail: item.Reason_Detail,
          Rejection_Type_ID: item?.Rejection_Type_ID?.SubCat_ID || 0,
        })),
        Sample: null,
      });
      reset();
      onClose();
      enqueueSnackbar('Rejection details submitted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error submitting rejection:', error);
      enqueueSnackbar('Failed to submit rejection details', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const total_rejected_qty = values?.Items?.reduce(
    (total, item) => total + (Number(item.Rejection_Qty) || 0),
    0
  );
  const isTotalRejectedQtyValid = total_rejected_qty === rejectedQty;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Rejection Details</Typography>
          <Label color="error" sx={{ fontWeight: 'bold' }}>{`Total Rejected: ${rejectedQty} ${selectedItem?.UOMName || 'units'
            }`}</Label>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Scrollbar>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {/* <TableCell sx={{ minWidth: 200 }}>Waste Category</TableCell> */}
                        <TableCell sx={{ minWidth: 150 }}>Rejected Quantity</TableCell>
                        <TableCell sx={{ minWidth: 300 }}>Detail</TableCell>
                        <TableCell sx={{ width: 80 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {values?.Items?.map((product, index) => (
                        <TableRow key={index}>
                          {/* <TableCell>
                            <RHFAutocomplete
                              name={`Items[${index}].Rejection_Type_ID`}
                              options={itemSubCategory}
                              getOptionLabel={(option) => option?.SubCat_Name || ''}
                              isOptionEqualToValue={(option, value) =>
                                option?.SubCat_ID === value?.SubCat_ID
                              }
                              fullWidth
                              size="small"
                              required
                            />
                          </TableCell> */}
                          <TableCell>
                            <RHFTextField
                              name={`Items[${index}].Rejection_Qty`}
                              type="number"
                              size="small"
                              fullWidth
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <Typography variant="caption">
                                      {selectedItem?.UOMName}
                                    </Typography>
                                  </InputAdornment>
                                ),
                              }}
                              error={!!errors.Items?.[index]?.Rejection_Qty}
                              helperText={errors.Items?.[index]?.Rejection_Qty?.message}
                            />
                          </TableCell>
                          <TableCell>
                            <RHFTextField
                              name={`Items[${index}].Reason_Detail`}
                              size="small"
                              fullWidth
                              error={!!errors.Items?.[index]?.Reason_Detail}
                              helperText={errors.Items?.[index]?.Reason_Detail?.message}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleProductDelete(product)}
                              color="error"
                              disabled={values.Items.length <= 1}
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
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                onClick={handleAdd}
                startIcon={<Iconify icon="eva:plus-fill" />}
              >
                Add More
              </Button>
            </Grid>
          </Grid>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 3 }}>
            <Box>
              {!isTotalRejectedQtyValid && (
                <Typography color="error" variant="caption">
                  The sum of rejected quantities must equal {rejectedQty} (Current total:{' '}
                  {total_rejected_qty})
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => {
                  reset();
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!isTotalRejectedQtyValid || isSubmitting || loading}
              >
                {isSubmitting || loading ? 'Submitting...' : 'Submit'}
              </Button>
            </Stack>
          </Stack>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

ItemQCRejectDialog.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  rejectedQty: PropTypes.number,
  selectedItem: PropTypes.object,
};
