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
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Input,
  InputAdornment,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function PricelistDialog({
  uploadClose,
  uploadOpen,
  tableData,
  selectedProduct,
  setSelectedProduct,
}) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Handle radio change
  //   const handleProductChange = (event) => {
  //     setSelectedProduct(Number(event.target.value));
  //   };
  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewDepartmentSchema = Yup.object().shape({
    // Dpt_Name: Yup.string()
    //   .required('Department Name is required')
    //   .min(3, 'Department Name must be at least 3 characters long')
    //   .max(100, 'Department Name must be less than or equal to 100 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'Department Name must only contain letters and spaces'),
  });

  const methods = useForm({
    resolver: yupResolver(NewDepartmentSchema),
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

  //   const PostDepartmentData = async (PostData) => {
  //     try {
  //       await Post('AddDPT', PostData).then(async (res) => {
  //         enqueueSnackbar(res.data.Message);
  //         uploadClose();
  //         reset(); // Only reset after successful submission
  //       });
  //     } catch (error) {
  //       console.log(error);
  //       enqueueSnackbar(error?.response?.data?.Message, { variant: 'error' });
  //     }
  //   };

  const onDptSubmit = handleSubmit(async (data) => {
    uploadClose();
    // if (tableData.some((item) => item.Dpt_Name === data.Dpt_Name)) {
    //   enqueueSnackbar('Department Name already exists', { variant: 'error' });
    //   return;
    // }
    // try {
    //   const dataToSend = {
    //     Dpt_Name: data.Dpt_Name,
    //     Branch_ID: userData?.userDetails?.branchID,
    //     Org_ID: userData?.userDetails?.orgId,
    //   };
    //   //   await PostDepartmentData(dataToSend);
    // } catch (error) {
    //   console.error(error);
    // }
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

  return (
    <>
      <Dialog
        open={uploadOpen}
        onClose={() => {
          uploadClose(); // Call the original close function
        }}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle sx={{ fontSize: '20px !important' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Please select a product similar to the customer&apos;s requirments.
            </Typography>

            <IconButton onClick={uploadClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <FormProvider methods={methods} onSubmit={onDptSubmit}>
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <FormLabel component="legend">Select a Product</FormLabel>
              <RadioGroup
                value={selectedProduct?.Product_ID}
                onChange={(e) =>
                  setSelectedProduct(
                    tableData.find((item) => item.Product_ID === Number(e.target.value))
                  )
                }
              >
                <TableContainer sx={{ minWidth: 800 }}>
                  <Scrollbar>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Select</TableCell>
                          <TableCell sx={{ minWidth: 120 }}>Product Name</TableCell>
                          <TableCell>Product Price</TableCell>
                          <TableCell>Price Range</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tableData.map((item) => {
                          const price = item?.Product_Price ?? 0;
                          const priceFrom = item?.Price_Range_Frm ?? 0;
                          const priceTo = item?.Price_Range_To ?? 0;
                          const unit = item?.UOMName ?? '';
                          const symbol = item?.Currency_ID === 2 ? '৳' : '$';

                          const generateProductName = () => {
                            console.log('generateProductName called');
                            const productCode = `${item?.Yarn_Code || ''} - ${
                              item?.Yarn_Count_Name || ''
                            } -  ${item?.Composition_Name || ''}  (${item?.ColorName || ''} - ${
                              item?.Color_Code || ''
                            })`;
                            return productCode;
                          };
                          return (
                            <TableRow key={item.Product_ID}>
                              <TableCell>
                                <FormControlLabel
                                  value={item.Product_ID}
                                  control={<Radio />}
                                  label=""
                                />
                              </TableCell>
                              <TableCell>{generateProductName()}</TableCell>
                              <TableCell>{`${symbol}${price?.toFixed(2)} / ${unit}`}</TableCell>
                              <TableCell>
                                {`${symbol}${priceFrom?.toFixed(2)} - ${symbol}${priceTo?.toFixed(
                                  2
                                )} / ${unit}`}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
              </RadioGroup>
            </FormControl>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                // loading={isSubmitting}
                disabled={!selectedProduct}
              >
                Select and Close
              </LoadingButton>
            </Stack>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

PricelistDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
  selectedProduct: PropTypes.number,
  setSelectedProduct: PropTypes.func,
};
