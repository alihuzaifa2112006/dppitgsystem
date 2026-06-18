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
  Switch,
  Tooltip,
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
  RHFSwitch,
} from 'src/components/hook-form';

import { Get, Put } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { convertBDTtoUSD, convertUSDtoBDT } from 'src/utils/BDTtoUSD';

// ----------------------------------------------------------------------

export default function CountryEditDialog({ uploadClose, uploadOpen, row, tableData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [allInventoryTypeData, setallInventoryTypeData] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [BDTtoUSD, setBDTtoUSD] = useState(0);
  const [USDtoBDT, setUSDtoBDT] = useState(0);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewCountrySchema = Yup.object().shape({
    BudgetDate: Yup.date().required('Budget Date is required'),
    InventoryType: Yup.object().required('InventoryType is required'),
    Currency: Yup.object().required('Currency is required'),
    BudgetAmount: Yup.number('Should be a valid integer').required('Budget is required'),
  });

  const defaultValues = useMemo(
    () => ({
      BudgetDate: row?.Budget_Date || '',
      InventoryType: row?.PRINVTypeID || '',
      Currency: row?.Currency || '',
      BudgetAmount: row?.Budget_Amount || '',
    }),
    [row]
  );

  const methods = useForm({
    resolver: yupResolver(NewCountrySchema),
    defaultValues,
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
    methods.reset(defaultValues);
  }, [defaultValues, methods]);

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

  // ------------------------------------

  const PutBudgetData = async (putData) => {
    try {
      const res = await Put(`UpdateBudget`, putData);
      if (res?.data?.Success || res?.status === 200) {
        enqueueSnackbar(res.data.Message || 'Updated successfully', { variant: 'success' });
        uploadClose();
        reset();
      } else {
        throw new Error(res.data?.Message || 'Something went wrong');
      }
    } catch (error) {
      console.error('PUT Error:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Update failed', { variant: 'error' });
    }
  };
  console.log('row', row);
  const onSubmit = handleSubmit(async (data) => {
    if (
      tableData.some((item) => item.Budgets === data.BudgetName && row?.Budgets !== data.BudgetName)
    ) {
      enqueueSnackbar('Budget already exists', { variant: 'error' });
      return;
    }

    const dataToSend = {
      // BudgetID: row?.BudgetID || row?.BudgetID,
      BudgetID: row?.BudgetID,
      // Budgets: data.BudgetName,
      Budgets: data.BudgetName.trim(),
      IsActive: data.IsActive,
      UpdatedBy: userData?.userDetails?.userId,
      Org_ID: userData?.userDetails?.orgId,
      Branch_ID: userData?.userDetails?.branchID,
    };

    await PutBudgetData(dataToSend);
  });

  console.log(row);

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
  // -----------------------

  const [Locations, setLocation] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const ApiGetLocations = useCallback(async () => {
    try {
      const response = await Get(
        `ApiGetBlendTypeList?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setLocation(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([ApiGetLocations()]);
      setLoading(false);
    };
    fetchData();
  }, [ApiGetLocations]);
  return (
    <>
      <Dialog
        open={uploadOpen}
        onClose={() => {
          uploadClose();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontSize: '20px !important' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Edit Budget
            </Typography>

            <IconButton onClick={uploadClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <FormProvider methods={methods} onSubmit={onSubmit}>
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

CountryEditDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  row: PropTypes.object,
  tableData: PropTypes.array,
};
