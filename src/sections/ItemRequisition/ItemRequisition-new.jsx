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
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  InputAdornment,
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

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
import PricelistDialog from './PricelistDialog';
import { convertBDTtoUSD } from 'src/utils/BDTtoUSD';
import ProductSpecificInfo from './Purchase';
import { APP_API } from 'src/config-global';

// ----------------------------------------------------------------------

export default function ItemRequisitionCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [BDTtoUSD, setBDTtoUSD] = useState(1);

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Date In SQL format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };
  const [stLoc, setStloc] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [allPriceList, setAllPriceList] = useState([]);
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [allClauses, setAllClauses] = useState([]);
  const [allPaymentTerms, setAllPaymentTerms] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState('$');

  const allPriorities = [
    {
      value: 'High',
      label: 'High',
    },
    {
      value: 'Medium',
      label: 'Medium',
    },
    {
      value: 'Low',
      label: 'Low',
    },
  ];

  const [quotationDetails, setQuotationDetails] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const [dept, setDept] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [toggle, setToggle] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [cancelQuantity, setCancelQuantity] = useState('');
  const [totalMark, setTotalMark] = useState(0); // Initialize with 0
  const [selectedRows, setSelectedRows] = useState([]);
  const [isPI, setIsPI] = useState(false);
  const [isGroup, setIsGroup] = useState(false);

  const NewQuotationSchema = Yup.object().shape({
    // Customer: Yup.object().required('Customer is required'),
    // ValidFrom: Yup.date()
    //   .required('Valid From is required')
    //   .test('is-future-or-today', 'Valid From must be today or later', (value) => {
    //     if (!value) return false;
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);
    //     const inputDate = new Date(value);
    //     inputDate.setHours(0, 0, 0, 0);
    //     return inputDate >= today;
    //   }),
    // ValidUntil: Yup.date()
    //   .required('Valid Until is required')
    //   .min(Yup.ref('ValidFrom'), 'Valid Until must be greater than or equal to Valid From'),
    // Clause: Yup.array().required('Clause is required'),
    // PaymentYerm: Yup.object().required('Payment Term is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewQuotationSchema),
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
  const categoryOptions = [
    {
      label: 'Regular',
      value: 'Option1',
    },
    {
      label: 'Important',
      value: 'Option2',
    },
    {
      label: 'Urgent',
      value: 'Option3',
    },
  ];
  const reqOptions = [
    {
      label: 'Indent',
      value: 'option1',
    },
    {
      label: 'Independent',
      value: 'option2',
    },
  ];
  const FetchRoom = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllStorelocations?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const decryptedData = response.data.map((item) => ({
        ...item,
        isActive: item?.isActive === true ? 'Active' : 'Inactive',
      }));

      setStloc(decryptedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchLocation = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllStorelocations?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const decryptedData = response.data.map((item) => ({
        ...item,
        isActive: item?.isActive === true ? 'Active' : 'Inactive',
      }));

      setTableData(decryptedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetCustomersData = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllActiveInactiveDpt?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setDept(response.data.Departments);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetAllPurpose = useCallback(async () => {
    try {
      const response = await Get(`${APP_API}GetAllPurposes`);

      setAllClauses(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const GetAllPaymentTerms = useCallback(async () => {
    try {
      const response = await Get(
        `getPaymentTermList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setAllPaymentTerms(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetAllActiveinactiveOpportunities = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllActiveinactiveOpportunities?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setAllOpportunities(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const getpriceList = useCallback(async () => {
    try {
      const response = await Get(
        `getpriceList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setAllPriceList(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const fetchExchangeRate = useCallback(async () => {
    const rate = await convertBDTtoUSD(1);
    if (rate) {
      setBDTtoUSD(rate); // This is the multiplier, not rate for 1 BDT
    }
  }, []);

  const GetCurrencies = useCallback(async () => {
    const res = await Get('getActiveCurrencies');
    setCurrencies(res.data || []);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        GetCustomersData(),
        getpriceList(),
        GetAllActiveinactiveOpportunities(),
        GetAllPurpose(),
        GetCurrencies(),
        GetAllPaymentTerms(),
        FetchRoom(),
        FetchLocation(),
      ]);
      setLoading(false);
      fetchExchangeRate();
    };
    fetchData();
  }, [
    GetCustomersData,
    getpriceList,
    GetAllActiveinactiveOpportunities,
    GetAllPurpose,
    GetCurrencies,
    fetchExchangeRate,
    GetAllPaymentTerms,
    FetchLocation,
    FetchRoom,
  ]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await Get(`GetPriceListById/${values?.PriceListID?.PriceListID}`);
        setAllProducts(
          response.data.Details.map((item) => ({
            ...item,
            Currency_ID: response.data.Master?.CurrencyID,
          }))
        );
      } catch (error) {
        setAllProducts([]);
      }
    };
    if (values?.PriceListID) {
      setValue('Product', null);
      setSelectedProduct(null);
      fetch();
    }
  }, [values?.PriceListID, setSelectedProduct, setValue]);

  const TotalAmount = quotationDetails.reduce((total, detail) => {
    const quantity = parseFloat(detail.Quantity);
    const unitPrice = parseFloat(detail.Unit_Price);
    const currencyID = detail.PriceListID.CurrencyID;

    const price = currencyID === 8 ? unitPrice * BDTtoUSD : unitPrice;

    return total + quantity * price;
  }, 0);

  useEffect(() => {
    if (values?.Priority?.value === 'High') {
      // set ednDate to 3 days from today
      const today = new Date();
      const threeDaysLater = new Date(today);
      threeDaysLater.setDate(today.getDate() + 3);
      setValue('EndDate', threeDaysLater);
    } else if (values?.Priority?.value === 'Medium') {
      // set ednDate to 7 days from today
      const today = new Date();
      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(today.getDate() + 7);
      setValue('EndDate', sevenDaysLater);
    } else if (values?.Priority?.value === 'Low') {
      // set ednDate to 15 days from today
      const today = new Date();
      const fifteenDays = new Date(today);
      fifteenDays.setDate(today.getDate() + 15);
      setValue('EndDate', fifteenDays);
    }
  }, [values?.Priority?.value, setValue]);

  console.log('values', values);

  const PostDetailData = async (detail) => {
    try {
      await Post(`AddQuotationDetails`, detail);
    } catch (error) {
      console.log('Detail', error);
    }
  };

  const PostQuotationMasterData = async (opData) => {
    try {
      await Post('AddQuotation', opData).then(async (res) => {
        if (res?.status === 200) {
          const detailWithMstID = quotationDetails?.map((detail) => ({
            QuotationID: res.data.MasterID,
            PriceList_ID: detail?.PriceListID?.PriceListID,
            Product_ID: detail?.Product?.Product_ID,
            UOMID: detail?.Product?.UOMID,
            UnitPrice: parseInt(detail?.Unit_Price, 10),
            // Requirement: detail?.Requirement,
            Description: detail?.Description || 'N/A',
            Quantity: parseInt(detail?.Quantity, 10),
            Total_Amount: TotalAmount,
            Revision_No: 0,
            Remarks: detail?.Remarks || 'N/A',
            IsActive: true,
            IsDeleted: false,
            CreatedBy: userData?.userDetails?.userId,
            Branch_ID: userData?.userDetails?.branchID,
            Org_ID: userData?.userDetails?.orgId,
          }));

          await PostDetailData(detailWithMstID);
          enqueueSnackbar('Created Successfully!');
          reset();
          router.push(paths.dashboard.store.purchaseRequisition.root);
        }
      });
    } catch (error) {
      console.log(error);
      if (error.response.status === 400) {
        enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
      } else enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
    }
  };
  const handleSubmitDemand = async () => {
    try {
      // Prepare the base payload with required fields
      const payload = {
        PurposeID: values.RequisitioAgainst || 1,
        StoreID: values.Store?.StoreID || 1,
        DptID: values.dept?.Dpt_ID || 2,
        IsActive: true,
        CreatedBy: userData?.userDetails?.userID || 101,
        Org_ID: userData?.userDetails?.orgId || 1,
        Branch_ID: userData?.userDetails?.branchID || 1,
        LocationID: 5, // Make dynamic if needed
        OriginID: 7, // Make dynamic if needed
        Details: [],
      };

      payload.Details = selectedRows.map((row) => {
        // Common fields for both group and PI items
        const baseDetail = {
          is_FG_items: !isGroup, // PI items are FG items
          PIID: row.PIID || null,
          PINO: row.PO_No || row.PINo || row.styleNo || null,
          Item_ID: row.ItemID || null,
          ReqQty: row.poQuantity || row.Quantity || row.Total_Passed_Qty || 0,
          UOMID: row.UOMID || 1,
          Remarks: row.Remarks || 'N/A',
        };

        if (isGroup) {
          return {
            ...baseDetail,
            WIC_ID: row.WIC_ID || null,
            Composition_ID: row.Composition_ID || null,
            CountID: row.YarnCountID || null,
            ColorID: row.Color_ID || null,
          };
        }

        // Default return for PI items (removed else-if)
        return {
          ...baseDetail,
          Composition_ID: row.Composition_ID || null,
          CountID: row.YarnCountID || null,
          ColorID: row.Color_ID || null,
        };
      });
      // Validate required fields
      if (!payload.PurposeID) {
        enqueueSnackbar('Purpose is required', { variant: 'error' });
        return;
      }

      if (!payload.StoreID) {
        enqueueSnackbar('Store location is required', { variant: 'error' });
        return;
      }

      if (!payload.DptID) {
        enqueueSnackbar('Department is required', { variant: 'error' });
        return;
      }

      if (payload.Details.length === 0) {
        enqueueSnackbar('Please add at least one item', { variant: 'error' });
        return;
      }

      // Make the API call
      const response = await Post('AddDemand', payload);

      if (response.status === 200) {
        enqueueSnackbar('Demand added successfully!', { variant: 'success' });
        setSelectedRows([]);
        reset();
        router.push(paths.dashboard.InventoryManagement.ItemRequisition.root);
      }
    } catch (error) {
      console.error('Error adding demand:', error);
      enqueueSnackbar(error.response?.data?.message || 'An error occurred while adding demand', {
        variant: 'error',
      });
    }
  };

  // Update your onSubmit function in ItemRequisitionCreateForm
  const onSubmit = handleSubmit(async (data) => {
    await handleSubmitDemand();
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

  // Get available products (not already added to details)
  const availableProducts = useMemo(() => {
    const addedProductIds = quotationDetails.map((detail) => detail.Product?.Product_ID);
    return allProducts.filter((product) => !addedProductIds.includes(product.Product_ID));
  }, [quotationDetails, allProducts]);

  // useEffect(() => {
  //   setQuotationDetails([]);
  // }, [values.PriceListID?.PriceListID]);

  const handleAddDetail = () => {
    if (!values.Description) {
      enqueueSnackbar('Product Requirement is required', { variant: 'error' });
      return;
    }
    if (
      quotationDetails.find(
        (detail) => detail.Description?.toLowerCase() === values.Description?.toLowerCase()
      )
    ) {
      enqueueSnackbar('Product already added', { variant: 'error' });
      return;
    }
    // if (!selectedProduct) {
    //   enqueueSnackbar('Please select a product from pricelist', { variant: 'error' });
    //   return;
    // }
    // if (!values.PriceListID) {
    //   enqueueSnackbar('Pricelist is required', { variant: 'error' });
    //   return;
    // }
    // if (!selectedProduct?.Product_Name) {
    //   enqueueSnackbar('Product is required', { variant: 'error' });
    //   return;
    // }
    if (!values.Quantity) {
      enqueueSnackbar('Quantity is required', { variant: 'error' });
      return;
    }
    if (!values.Unit_Price) {
      enqueueSnackbar('Ball Park Price is required', { variant: 'error' });
      return;
    }
    if (values.Unit_Price < selectedProduct?.Product_Price) {
      enqueueSnackbar('Ball Park Price should be greater than or equal to Product Price', {
        variant: 'error',
      });
      return;
    }

    if (editingIndex !== null) {
      // Update existing detail
      const updatedDetails = [...quotationDetails];
      updatedDetails[editingIndex] = {
        Product: values.Product,
        Quantity: values.Quantity,
        Unit_Price: values.Unit_Price,
      };
      setQuotationDetails(updatedDetails);
    } else {
      // Add new detail
      setQuotationDetails((prev) => [
        ...prev,
        {
          // Requirement: values?.Requirement,
          PriceListID: values.PriceListID,
          Description: values.Description || 'N/A',
          Product: selectedProduct,
          UOMID: values.UOMID,
          Remarks: values.Remarks || 'N/A',
          Quantity: values.Quantity,
          Unit_Price: values.Unit_Price,
        },
      ]);
    }

    // Always reset the form fields and editing state
    resetDetailForm();
  };

  const resetDetailForm = () => {
    // setValue('Requirement', '');
    setValue('Description', '');
    setValue('PriceListID', null);
    setValue('Product', null);
    setValue('Remarks', '');
    setValue('UOMID', null);
    setSelectedProduct(null);
    setSelectedProduct(null);
    setValue('Quantity', null);
    setValue('Unit_Price', null);
    setEditingIndex(null);
  };
  const handleEditDetail = (index) => {
    const detail = quotationDetails[index];
    setValue('Product', detail.Product);
    setValue('Quantity', detail.Quantity);
    setValue('Unit_Price', detail.Unit_Price);
    setEditingIndex(index);
  };

  // Table Heads
  const DetailsTableHead = [
    { id: 'Remarks', label: 'Product Requirment', minWidth: 120 },
    { id: 'Description', label: 'Product Description', minWidth: 240 },
    { id: 'Product_Name', label: 'Pricelist Product', minWidth: 200 },
    { id: 'Quantity', label: 'Quantity', align: 'center' },
    { id: 'Unit_Price', label: 'Ball Park Price', align: 'center', minWidth: 120 },
    // { id: 'Remarks', label: 'Remarks', minWidth: 240 },
    { id: 'Actions', label: 'Actions', width: 88 },
  ];

  // Table
  const table = useTable();

  const notFound = !quotationDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = quotationDetails.filter((row) => row !== rowToDelete);
    setQuotationDetails(updatedDetails);

    // If we're deleting the row being edited, reset the form
    if (editingIndex !== null && quotationDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);
      setValue('Product', null);
      setValue('Quantity', null);
      setValue('Unit_Price', null);
    }
  };

  // -----------------------------------------------------------

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    // FetchDepartment();
    setDialogOpen(false);
  };

  const price = selectedProduct?.Product_Price ?? 0;
  const priceFrom = selectedProduct?.Price_Range_Frm ?? 0;
  const priceTo = selectedProduct?.Price_Range_To ?? 0;
  const unit = selectedProduct?.UOMNAME ?? '';

  useEffect(() => {
    if (selectedProduct?.Currency_ID === 2) {
      setCurrencySymbol('৳');
    } else {
      setCurrencySymbol('$');
    }
  }, [selectedProduct]);

  // -----------------------------------------------------------

  return isLoading ? (
    renderLoading
  ) : (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <h3>Requisition:</h3>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                }}
              >
                <RHFAutocomplete
                  name="Store"
                  label="Store Location"
                  placeholder="Choose an option"
                  fullWidth
                  options={stLoc}
                  getOptionLabel={(option) => option?.StoreName}
                />

                <RHFAutocomplete
                  name="dept"
                  label="Department"
                  placeholder="Choose an option"
                  fullWidth
                  options={dept}
                  getOptionLabel={(option) => option?.Dpt_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.Dpt_ID === value?.Dpt_ID}
                  value={values?.dept || null}
                />

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    // alignItems: 'center',
                    justifyContent: 'start',
                    gridColumn: { xs: 'span 3', sm: 'span 2', md: 'span 3' },
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Purpose :
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    component={Paper}
                    // variant="outlined"
                    // alignItems="center"
                    // justifyContent="center"
                    // sx={{ p: 5, borderStyle: 'dashed' }}
                  >
                    {allClauses?.map((option) => (
                      <Chip
                        key={option.PurposeID}
                        label={option.Purposes}
                        variant={
                          option.PurposeID === values.RequisitioAgainst ? 'filled' : 'outlined'
                        }
                        color="primary"
                        onClick={() => setValue('RequisitioAgainst', option.PurposeID)}
                        clickable
                        // icon={
                        //   option.value === values.Category ? (
                        //     <Iconify width={24} icon="eva:checkmark-fill" />
                        //   ) : null
                        // }
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Card>

            <Card sx={{ mt: 3, p: 2 }}>
              <ProductSpecificInfo
                setTotalAmount={setTotalAmount}
                totalAmount={totalAmount}
                totalQuantity={totalQuantity}
                setTotalQuantity={setTotalQuantity}
                cancelQuantity={cancelQuantity}
                setCancelQuantity={setCancelQuantity}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                totalMark={totalMark}
                setTotalMark={setTotalMark}
                isGroup={isGroup}
                setIsGroup={setIsGroup}
                isPI={isPI}
                setIsPI={setIsPI}
              />
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
