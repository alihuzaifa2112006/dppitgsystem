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
import { Autocomplete, Button, Table, TextField } from '@mui/material';

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

// ----------------------------------------------------------------------

export default function CustomerCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Date In SQL format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const decryptObjectKeys = (data) => {
    const decryptedData = data.map((item) => {
      const decryptedItem = {};
      Object.keys(item).forEach((key) => {
        decryptedItem[key] = decrypt(item[key]);
      });
      return decryptedItem;
    });
    return decryptedData;
  };

  const [currentUserArray, setCurrentUserArray] = useState([]);

  const [customerModel, setCustomerModel] = useState({
    ContractNo: generateCode(currentUserArray),
    UserID: userData?.userDetails?.userId,
    VendorLibraryID: '1',
  });
  const [customerDetails, setCustomerDetails] = useState([]);
  const [yarnDetail, setYarnDetail] = useState({
    YarnDatabaseID: '',
    YarnCount: null,
    UnitID: '',
    Unit: null,
    Quantity: '',
    UnitPrice: '',
    CurrencyID: '',
    Currency: {
      CurrencyID: '',
      CurrencyName: '',
    },
    Remarks: '',
  });

  const [yarnCounts, setYarnCounts] = useState([]);
  const [mainYarnCounts, setMainYarnCounts] = useState([]);
  const [currency, setCurrency] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [units, setUnits] = useState([]);
  const [isLoading, setLoading] = useState(true);

  function generateCode(userArray) {
    const prefix = 'YC'; // Constant prefix
    const year = new Date().getFullYear().toString().slice(-2); // Current year (last two digits)

    // If userArray has entries, find the highest ContractNo and increment it
    if (userArray.length > 0) {
      // Extract the highest serial number
      const lastContractNo = userArray[userArray.length - 1].ContractNo; // Assuming the last item has the latest ContractNo
      const lastSerial = parseInt(lastContractNo.split('-')[2], 10); // Extract the serial number (e.g., 002 -> 2)
      const nextSerial = lastSerial + 1; // Increment serial number
      const formattedSerial = nextSerial.toString().padStart(3, '0'); // Ensure at least 3 digits

      return `${prefix}-${year}-${formattedSerial}`;
    }

    // If userArray is empty, start with 001
    return `${prefix}-${year}-001`;
  }

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewCustomerSchema = Yup.object().shape({
    PaymentTerm: Yup.object().required('Payment Term is required'),
    // ContractNo: Yup.string().required('Contract Number is required'),
    ContractDate: Yup.mixed().required('Contract Date is required'),
    Supplier: Yup.object().required('Supplier is required'),
    Description: Yup.string().required('Description is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewCustomerSchema),
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

  const GetPaymentTermData = useCallback(async () => {
    try {
      const response = await Get(`GetAccountsPaymentTerm`);
      const decryptedData = decryptObjectKeys(response.data.ServiceRes);

      setPaymentTerms(decryptedData);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const GetYarnCountsData = useCallback(async () => {
    try {
      const response = await Get(`GetYarnCount_YarnDatabase`);
      const decryptedData = decryptObjectKeys(response.data.ServiceRes);

      const existingIds = new Set(customerDetails.map((item) => item.YarnDatabaseID));
      const newDocumentData = decryptedData?.filter(
        (item) => !existingIds.has(item.YarnDatabaseID)
      );
      setYarnCounts(newDocumentData);
      setMainYarnCounts(decryptedData);
      setYarnDetail({
        ...yarnDetail,
        UnitID: '',
        Unit: null,
      });
    } catch (error) {
      console.log(error);
      setYarnDetail({
        YarnDatabaseID: '',
        YarnCount: null,
        UnitID: '',
        Unit: null,
        Quantity: '',
        UnitPrice: '',
        CurrencyID: '',
        Currency: {
          CurrencyID: '',
          CurrencyName: '',
        },
        Remarks: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const GetSuppliersData = useCallback(async () => {
    try {
      const response = await Get(`GetSuppliers`);
      const decryptedData = decryptObjectKeys(response.data.ServiceRes);

      setSuppliers(decryptedData);
    } catch (error) {
      console.log(error);
    }
  }, []);

  // const GetUnitsData = useCallback(async () => {
  //   try {
  //     const response = await Get(`GetUnit?VendorLibraryID=1`);
  //     const decryptedData = decryptObjectKeys(response.data.ServiceRes);
  //     setUnits(decryptedData);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, []);

  const GetLastContractNo = useCallback(async () => {
    try {
      const response = await Get(`GetLastContractNo`);
      const decryptedData = decryptObjectKeys(response.data.ServiceRes);
      setCurrentUserArray(decryptedData);
      setCustomerModel((prevModel) => ({
        ...prevModel,
        ContractNo: generateCode(decryptedData),
      }));
    } catch (error) {
      console.log(error);
    }
  }, [setCurrentUserArray]);

  const GetYarnDatabaseUnit = useCallback(async () => {
    try {
      const response = await Get(
        `GetYarnDatabaseUnit?YarnDatabaseID=${yarnDetail?.YarnDatabaseID}`
      );
      const decryptedData = decryptObjectKeys(response.data.ServiceRes);
      setYarnDetail({
        ...yarnDetail,
        UnitID: decryptedData[0]?.UnitID || '',
        Unit: units.find((u) => u.UnitID === decryptedData[0]?.UnitID),
      });
      setUnits(decryptedData);
    } catch (error) {
      console.log(error);
      setYarnDetail({
        ...yarnDetail,
        UnitID: '',
        Unit: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yarnDetail?.YarnDatabaseID]);

  const GetCurrencyList = useCallback(async () => {
    try {
      const response = await Get(`GetCurrencyList`);
      const decryptedData = decryptObjectKeys(response.data.ServiceRes);
      setCurrency(decryptedData);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const existingIds = new Set(customerDetails.map((item) => item.YarnDatabaseID));
    const newDocumentData = mainYarnCounts?.filter((item) => !existingIds.has(item.YarnDatabaseID));
    setYarnCounts(newDocumentData);
  }, [customerDetails, mainYarnCounts]);

  useEffect(() => {
    GetYarnDatabaseUnit();
  }, [yarnDetail?.YarnDatabaseID, GetYarnDatabaseUnit]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        GetLastContractNo(),
        GetCurrencyList(),
        GetPaymentTermData(),
        GetYarnCountsData(),
        GetSuppliersData(),
        // GetUnitsData(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [
    GetLastContractNo,
    GetPaymentTermData,
    GetYarnCountsData,
    GetSuppliersData,
    // GetUnitsData,
    GetCurrencyList,
  ]);

  const PostDetailData = async (detail) => {
    try {
      const encryptedData = detail.map((X) =>
        Object.assign(
          {},
          ...Object.keys(X).map((key) => ({
            [key]: encrypt(X[key]),
          }))
        )
      );

      // Post the encrypted data to the server
      await Post(`InsertCustomerDetail`, encryptedData);
    } catch (error) {
      console.log('Detail', error);
    }
  };

  const PostCustomerMasterData = async () => {
    if (customerDetails.length === 0) {
      enqueueSnackbar('Please add at least one contract detail', { variant: 'error' });
      return;
    }

    try {
      const encryptedData = Object.assign(
        {},
        ...Object.keys(customerModel).map((key) => ({
          [key]: encrypt(customerModel[key]),
        }))
      );
      await Post('InsertCustomerMaster', encryptedData).then(async (res) => {
        if (res.data.ResponseCode === '100') {
          const detailWithMstID = customerDetails?.map((detail) => ({
            CustomerMasterID: decrypt(res.data.ServiceRes[0]?.CustomerMasterID),
            YarnDatabaseID: detail?.YarnDatabaseID,
            UnitID: detail?.UnitID,
            Quantity: detail?.Quantity,
            UnitPrice: detail?.UnitPrice,
            CurrencyID: detail?.CurrencyID,
            Remarks: detail?.Remarks,
          }));

          await PostDetailData(detailWithMstID);
          enqueueSnackbar('Created Successfully!');
          router.push(paths.dashboard.yarnModule.customer.root);
        }
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Something Went Wrong!', { variant: 'error' });
    } finally {
      reset();
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // await new Promise((resolve) => setTimeout(resolve, 500));
      await PostCustomerMasterData();
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

  // Details Section
  const handleAddDetail = () => {
    if (yarnDetail.YarnDatabaseID === '') {
      enqueueSnackbar('Yarn Count is required', { variant: 'error' });
      return;
    }
    if (yarnDetail.UnitID === '') {
      enqueueSnackbar('Unit is required', { variant: 'error' });
      return;
    }
    if (yarnDetail.Quantity === '') {
      enqueueSnackbar('Quantity is required', { variant: 'error' });
      return;
    }
    if (yarnDetail.UnitPrice === '') {
      enqueueSnackbar('Unit Price is required', { variant: 'error' });
      return;
    }
    if (yarnDetail.CurrencyID === '') {
      enqueueSnackbar('Currency is required', { variant: 'error' });
      return;
    }
    setCustomerDetails((prev) => [...prev, yarnDetail]);
    setYarnDetail({
      YarnDatabaseID: '',
      YarnCount: null,
      UnitID: '',
      Unit: null,
      Quantity: '',
      UnitPrice: '',
      Remarks: '',
      CurrencyID: '',
      Currency: {
        CurrencyID: '',
        CurrencyName: '',
      },
    });
  };

  // Table Heads
  const DetailsTableHead = [
    { id: 'YarnCount', label: 'Yarn Count', minWidth: 200 },
    { id: 'Quantity', label: 'Quantity', align: 'center' },
    { id: 'Unit', label: 'Unit', align: 'center' },
    { id: 'UnitPrice', label: 'Unit Price', align: 'center' },
    { id: 'Currency', label: 'Currency' },
    { id: 'Remarks', label: 'Remarks' },
    { id: 'Actions', label: 'Actions', width: 88 },
  ];

  // Table
  const table = useTable();

  const notFound = !customerDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = customerDetails.filter((row) => row !== rowToDelete);

    setCustomerDetails(updatedDetails);
  };

  return isLoading ? (
    renderLoading
  ) : (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <h3>Customer Detail</h3>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  // md: 'repeat(3, 1fr)',
                }}
              >
                <RHFTextField
                  name="WIC_Name"
                  label="Name"
                  // onchange={(e) =>
                  //   setCustomerModel({ ...customerModel, Description: e.target.value })
                  // }
                />

                <RHFAutocomplete
                  name="WIC_Country_ID"
                  label="Country"
                  type="country"
                  placeholder="Choose an option"
                  fullWidth
                  options={suppliers}
                  getOptionLabel={(option) => option?.SupplierName}
                  // onchange={(value) =>
                  //   setCustomerModel({
                  //     ...customerModel,
                  //     SupplierID: value?.SupplierDatabaseID,
                  //   })
                  // }
                />
                <RHFAutocomplete
                  name="WIC_City_ID"
                  type="Supplier"
                  label="City"
                  placeholder="Choose an option"
                  fullWidth
                  options={suppliers}
                  getOptionLabel={(option) => option?.SupplierName}
                  // onchange={(value) =>
                  //   setCustomerModel({
                  //     ...customerModel,
                  //     SupplierID: value?.SupplierDatabaseID,
                  //   })
                  // }
                />

                <RHFTextField
                  name="WIC_BusinessType"
                  label="Business Type"
                  // onchange={(e) =>
                  //   setCustomerModel({ ...customerModel, Description: e.target.value })
                  // }
                />

                {/* <Controller
                  name="ContractDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Contract Date"
                      format="dd MMM yyyy"
                      onChange={(newValue) => {
                        field.onChange(newValue);
                        setCustomerModel({
                          ...customerModel,
                          ContractDate: formatDate(newValue),
                        });
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
                /> */}

                <RHFAutocomplete
                  name="BranchID"
                  type="BranchID"
                  label="Branch"
                  placeholder="Choose an option"
                  fullWidth
                  options={paymentTerms}
                  getOptionLabel={(option) => option?.PaymentTerm}
                />
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
