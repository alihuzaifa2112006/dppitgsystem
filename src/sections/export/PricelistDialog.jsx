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

  // Group data by PriceListName
  const groupedData = useMemo(
    () =>
      tableData.reduce((acc, item) => {
        const key = item.PriceListName;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {}),
    [tableData]
  );

  const NewDepartmentSchema = Yup.object().shape({
    // Validation schema if needed
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

  const onDptSubmit = handleSubmit(async (data) => {
    uploadClose();
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
          uploadClose();
        }}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle sx={{ fontSize: '20px !important' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Pricelists of products with same color and yarn count (FYI):
            </Typography>
            <IconButton onClick={uploadClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <FormProvider methods={methods} onSubmit={onDptSubmit}>
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              {/* <FormLabel component="legend">Select a Product</FormLabel> */}
              <RadioGroup
                value={selectedProduct?.PriceListID}
                onChange={(e) =>
                  setSelectedProduct(
                    tableData.find((item) => item.PriceListID === Number(e.target.value))
                  )
                }
              >
                {Object.entries(groupedData).map(([priceListName, items]) => (
                  <Box key={priceListName} sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Pricelist: {priceListName}
                    </Typography>
                    <TableContainer sx={{ minWidth: 800 }}>
                      <Scrollbar>
                        <Table>
                          <TableHead>
                            <TableRow>
                              {/* <TableCell>Select</TableCell> */}
                              <TableCell sx={{ minWidth: 120 }}>Product</TableCell>
                              <TableCell>Product Cost</TableCell>
                              <TableCell>Price Range</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {items.map((item) => {
                              const price = item?.Product_Price ?? 0;
                              const priceFrom = item?.Price_Range_Frm ?? 0;
                              const priceTo = item?.Price_Range_To ?? 0;
                              const unit = item?.UOMName ?? '';
                              const symbol = item?.CurrencyID === 2 ? '৳' : '$';
                              return (
                                <TableRow key={item.PriceListID}>
                                  {/* <TableCell>
                                    <FormControlLabel
                                      value={item.PriceListID}
                                      control={<Radio />}
                                      label=""
                                    />
                                  </TableCell> */}
                                  <TableCell>{item.Product_Name}</TableCell>
                                  <TableCell>{`${symbol}${price?.toFixed(2)} / ${unit}`}</TableCell>
                                  <TableCell>
                                    {`${symbol}${priceFrom?.toFixed(
                                      2
                                    )} - ${symbol}${priceTo?.toFixed(2)} / ${unit}`}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </Scrollbar>
                    </TableContainer>
                  </Box>
                ))}
              </RadioGroup>
            </FormControl>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                // disabled={!selectedProduct}
              >
                Close
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
  selectedProduct: PropTypes.object,
  setSelectedProduct: PropTypes.func,
};
