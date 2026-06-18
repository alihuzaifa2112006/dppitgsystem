import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { getMonth, getYear } from 'date-fns';
import { convertBDTtoUSD, convertUSDtoBDT } from 'src/utils/BDTtoUSD';

// ----------------------------------------------------------------------

export default function CountryDialog({ uploadClose, uploadOpen, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [allPriorities, setAllPriorities] = useState([]);
  const [allInventoryTypeData, setallInventoryTypeData] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [BDTtoUSD, setBDTtoUSD] = useState(0);
  const [USDtoBDT, setUSDtoBDT] = useState(0);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewCountrySchema = Yup.object().shape({
    BudgetDate: Yup.date().required('Budget Date is required'),
    InventoryType: Yup.object().required('Item Type is required'),
    Currency: Yup.object().required('Currency is required'),
    BudgetAmount: Yup.number('Should be a valid integer').required('Budget is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewCountrySchema),
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

  useEffect(() => {
    if (values?.Currency?.Currency_ID === 8) {
      setCurrencySymbol('৳');
    } else {
      setCurrencySymbol('$');
    }
  }, [values?.Currency?.Currency_ID]);

  const FetchAllInventoryTypeData = useCallback(async () => {
    try {
      const response = await Get(`GetAllClasses?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`);
      setallInventoryTypeData(response.data?.Data || []);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetCurrencies = useCallback(async () => {
    const res = await Get('getActiveCurrencies');
    setCurrencies(res.data || []);
  }, []);

  const fetchExchangeRate = useCallback(async () => {
    const rate = await convertBDTtoUSD(1);
    const rate2 = await convertUSDtoBDT(1);
    if (rate) {
      setBDTtoUSD(rate); // This is the multiplier, not rate for 1 BDT
    }
    if (rate2) {
      setUSDtoBDT(rate2); // This is the multiplier, not rate for 1 BDT
    }
  }, []);

  useEffect(() => {
    const fetch = async () => {
      await Promise.all([FetchAllInventoryTypeData(), GetCurrencies()]);
    };
    fetchExchangeRate();
    fetch();
  }, [FetchAllInventoryTypeData, GetCurrencies, fetchExchangeRate]);

  // addBudget
  // ------------------------------------
  const PostBudget = async (PostData) => {
    try {
      await Post('addPRBudget', [PostData]).then((res) => {
        enqueueSnackbar(res.data.Message || 'Budget Added', { variant: 'success' });
        uploadClose();
        reset(); // Resets the form after successful submit
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message || 'Failed to add budget', {
        variant: 'error',
      });
    }
  };
  const onDptSubmit = handleSubmit(async (data) => {
    if (
      tableData.some(
        (item) =>
          item.FYear === getYear(data?.BudgetDate) &&
          item.Month === getMonth(data?.BudgetDate) + 1 &&
          item.PRINVTypeID === data?.InventoryType?.ClassID
      )
    ) {
      enqueueSnackbar('Budget already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        FYear: getYear(data?.BudgetDate),
        Month: getMonth(data?.BudgetDate) + 1,
        PRINVTypeID: data?.InventoryType?.ClassID,
        Currency_ID: data?.Currency?.Currency_ID,
        BudgetAmtinBDT:
          data?.Currency?.Currency_ID === 8 ? data.BudgetAmount : data.BudgetAmount * USDtoBDT,
        BudgetAmtinUSD:
          data?.Currency?.Currency_ID === 8 ? data.BudgetAmount / USDtoBDT : data.BudgetAmount,
        Remarks: data?.Remarks || 'N/A',
        CreatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await PostBudget(dataToSend);
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
  // -----------------

  const [isLoading, setLoading] = useState(true);

  return (
    <>
      <Dialog
        open={uploadOpen}
        onClose={() => {
          reset();
          uploadClose();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontSize: '20px !important' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Set Budget
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
              {/* // year only  */}
              <Controller
                name="BudgetDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    // defaultValue={new Date()}
                    label="Date (MM-YYYY)"
                    views={['month', 'year']}
                    format="MM-yyyy"
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
              {/* <RHFAutocomplete
                name="PRPriority"
                label="Priority"
                fullWidth
                options={allPriorities}
                getOptionLabel={(option) => option?.PRPriorities || ''}
                isOptionEqualToValue={(option, value) =>
                  option?.PRPriorityID === value?.PRPriorityID
                }
              /> */}
              <RHFAutocomplete
                name="InventoryType"
                label="Item Type"
                fullWidth
                options={allInventoryTypeData}
                getOptionLabel={(option) => option?.ClassName || ''}
                isOptionEqualToValue={(option, value) => option.ClassID === value.ClassID}
                value={values?.InventoryType || null}
              />
              <RHFAutocomplete
                name="Currency"
                label="Currency"
                fullWidth
                options={currencies}
                getOptionLabel={(option) => option?.Currency_Name}
              />
              <RHFTextField
                name="BudgetAmount"
                label="Budget Amount"
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="body2">{currencySymbol}</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Stack alignItems="flex-end">
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
