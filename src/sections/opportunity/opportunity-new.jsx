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
// import PricelistDialog from './PricelistDialog';
import { convertBDTtoUSD } from 'src/utils/BDTtoUSD';
import PricelistDialog from '../quotation/PricelistDialog';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';

// ----------------------------------------------------------------------

export default function OpportunityCreateForm() {
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

  const [allProducts, setAllProducts] = useState([]);
  const [allPriceList, setAllPriceList] = useState([]);
  const [BDTtoUSD, setBDTtoUSD] = useState(1);
  const [allColors, setAllColors] = useState([]);
  const [allCounts, setAllCounts] = useState([]);
  const [allCompositions, setAllCompositions] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [allUOM, setAllUOM] = useState([]);

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

  const [opportunityDetails, setOpportunityDetails] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [allKAMs, setAllKAMs] = useState([]);
  const [allPaymentTerms, setAllPaymentTerms] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const NewOpportunitySchema = Yup.object().shape({
    OpportunityName: Yup.string().required('Opportunity Name is required'),
    Customer: Yup.object().required('Customer is required'),
    // OpportunityDate: Yup.date().required('Opportunity Date is required'),
    EndDate: Yup.date().required('End Date is required'),
    // PriceListID: Yup.object().required('Pricelist is required'),
    PaymentTerms: Yup.object().required('Payment Terms is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewOpportunitySchema),
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

  const TotalAmount = opportunityDetails.reduce((total, detail) => {
    const quantity = parseFloat(detail.Quantity);
    const unitPrice = parseFloat(detail.Unit_Price);
    const currencyID = detail.PriceListID.CurrencyID;

    const price = currencyID === 8 ? unitPrice * BDTtoUSD : unitPrice;

    return total + quantity * price;
  }, 0);

  const GetCustomersData = useCallback(async () => {
    try {
      const response = await Get(
        `getAllWICList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setCustomers(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIViewYarnComposePrdt = useCallback(async () => {
    try {
      const response = await Get(
        `APIViewYarnComposePrdt?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setAllProducts(response.data?.Data);
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

  const GetColors = useCallback(async () => {
    try {
      const response = await Get(
        `colors/all?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const newdata = response.data.Data.map((item) => ({
        ...item,
        ColorNickName: `${item.ColorName} - ${item.Color_Code}`,
      }));
      setAllColors(newdata);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetCounts = useCallback(async () => {
    try {
      const response = await Get(
        `Activeyarncount?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllCounts(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetKAMs = useCallback(async () => {
    try {
      const response = await Get(
        `GetAlLRegistereKAM?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllKAMs(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

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

  const APIGetTypeList = useCallback(async () => {
    try {
      const response = await Get(
        `getActiveyarntype?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllTypes(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetAllActiveUOM = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllActiveUOM?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllUOM(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetCompositionList = useCallback(async () => {
    try {
      const response = await Get(
        `yarncomposition/GetActiveCompositions?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllCompositions(response.data.Data);
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

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        GetCustomersData(),
        getpriceList(),
        GetColors(),
        GetCounts(),
        APIGetTypeList(),
        APIGetCompositionList(),
        GetAllActiveUOM(),
        GetAllPaymentTerms(),
        GetKAMs(),
      ]);
      setLoading(false);
      fetchExchangeRate();
    };
    fetchData();
  }, [
    GetCustomersData,
    getpriceList,
    fetchExchangeRate,
    GetColors,
    GetCounts,
    APIGetTypeList,
    APIGetCompositionList,
    GetAllActiveUOM,
    GetAllPaymentTerms,
    GetKAMs,
  ]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await Get(
          `GetProductsFrmPLBycountAndColorID?Yarncount=${values?.Yarn_Count_ID?.Yarn_Count_ID}&ColorID=${values?.Color?.ColorID}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );
        setAllProducts(response.data.Data);
        if (
          response.data.Data?.find(
            (product) =>
              product.Product_ID === opportunityDetails[editingIndex]?.Product?.Product_ID
          )
        ) {
          setSelectedProduct(
            response.data.Data?.find(
              (product) =>
                product.Product_ID === opportunityDetails[editingIndex]?.Product?.Product_ID
            )
          );
        } else {
          setSelectedProduct(null);
        }
      } catch (error) {
        setAllProducts([]);
      }
    };
    if (values?.Color && values?.Yarn_Count_ID) {
      // setValue('Product', null);
      // setSelectedProduct(null);
      fetch();
    }
  }, [
    values?.Color,
    values?.Yarn_Count_ID,
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    editingIndex,
    opportunityDetails,
    setSelectedProduct,
    setValue,
  ]);

  const generateProductName = () => {
    const productCode = `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${
      values?.Yarn_Count_ID?.Yarn_Count_Name || ''
    } -  ${values?.Composition_ID?.Composition_Name || ''}  (${values?.Color?.ColorName || ''} - ${
      values?.Color?.Color_Code || ''
    })`;
    // setValue('Requirement', productCode);
    return productCode;
  };

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

  const PostPaymentterms = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Payment Term', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (
      allPaymentTerms.find(
        (option) => option.Payment_Term.trim().toLowerCase() === newOptionTrimmed
      )
    ) {
      enqueueSnackbar('This Payment Term already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        Payment_term: newOption,
        isActive: true,
        CreatedBy: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddPaymentTerm', dataToSend);
      GetAllPaymentTerms();
      enqueueSnackbar('Payment Term Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const PostDetailData = async (detail) => {
    try {
      await Post(`AddOpportunityProducts`, detail);
    } catch (error) {
      console.log('Detail', error);
    }
  };

  const PostOpportunityMasterData = async (opData) => {
    try {
      await Post('AddOpportunity', opData).then(async (res) => {
        if (res.status === 200) {
          const detailWithMstID = opportunityDetails?.map((detail) => ({
            OpportunityID: res.data.Data.OpportunityID,
            ProductID: detail?.Product?.Product_ID,
            PriceListID: detail?.PriceListID?.PriceListID,
            YarnTypeID: detail?.Yarn_Type_ID?.Yarn_Type_ID,
            CountID: detail?.Yarn_Count_ID?.Yarn_Count_ID,
            CompositionID: detail?.Composition_ID?.Composition_ID,
            ColorID: detail?.Color?.ColorID,
            UOMID: detail?.UOM?.UOM_ID,
            Requirement: detail?.Requirement,
            Description: detail?.Description || 'N/A',
            Quantity: detail?.Quantity,
            Unit_Price: detail?.Unit_Price,
            EstimatedDeliveryDate: detail?.EstimatedDeliveryDate || null,
            CycloUnitPrice: detail?.CycloUnitPrice,
            IsActive: true,
            isDeleted: false,
            CreatedBy: userData?.userDetails?.userId,
            Branch_ID: userData?.userDetails?.branchID,
            Org_ID: userData?.userDetails?.orgId,
          }));

          await PostDetailData(detailWithMstID);
          enqueueSnackbar('Created Successfully!');
          reset();
          router.push(paths.dashboard.transaction.opportunity.root);
        }
      });
    } catch (error) {
      console.log(error);
      if (error.response.status === 400) {
        enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
      } else enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (opportunityDetails.length === 0) {
      enqueueSnackbar('Please add at least one opportunity product', { variant: 'error' });
      return;
    }

    const dataToSend = {
      OpportunityName: data.OpportunityName,
      WICID: data.Customer?.WIC_ID,
      KAM: data?.KAM?.UserID,
      Priority: data.Priority?.value,
      OpportunityDate: formatDate(new Date()),
      EndDate: data.EndDate ? formatDate(data.EndDate) : null,
      PaymentTermID: data?.PaymentTerms?.Payment_term_ID,
      CreatedBy: userData?.userDetails?.userId,
      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,
      IsActive: true,
      IsDeleted: false,
    };
    console.log(dataToSend);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await PostOpportunityMasterData(dataToSend);
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

  // Get available products (not already added to details)
  const availableProducts = useMemo(() => {
    const addedProductIds = opportunityDetails.map((detail) => detail.Product?.Product_ID);
    return allProducts.filter((product) => !addedProductIds.includes(product.Product_ID));
  }, [opportunityDetails, allProducts]);

  // useEffect(() => {
  //   setOpportunityDetails([]);
  // }, [values.PriceListID?.PriceListID]);

  const handleAddDetail = () => {
    // if (!values.Requirement) {
    //   enqueueSnackbar('Product Requirement is required', { variant: 'error' });
    //   return;
    // }
    // if (
    //   opportunityDetails.find(
    //     (detail) => detail.Requirement?.toLowerCase() === values.Requirement?.toLowerCase()
    //   )
    // ) {
    //   enqueueSnackbar('Product already added', { variant: 'error' });
    //   return;
    // }
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
    if (!values?.Yarn_Type_ID) {
      enqueueSnackbar('Yarn Type is required', { variant: 'error' });
      return;
    }
    if (!values?.Yarn_Count_ID) {
      enqueueSnackbar('Yarn Type is required', { variant: 'error' });
      return;
    }
    if (!values?.Color) {
      enqueueSnackbar('Yarn Color is required', { variant: 'error' });
      return;
    }
    if (!values?.Composition_ID) {
      enqueueSnackbar('Yarn Compisition is required', { variant: 'error' });
      return;
    }
    if (!values?.UOM) {
      enqueueSnackbar('Unit of Measure is required', { variant: 'error' });
      return;
    }
    if (!values.Quantity) {
      enqueueSnackbar('Quantity is required', { variant: 'error' });
      return;
    }
    if (!values.CycloUnitPrice) {
      enqueueSnackbar('Cyclo Target Price is required', { variant: 'error' });
      return;
    }
    if (!values.Unit_Price) {
      enqueueSnackbar('Customer Target Price is required', { variant: 'error' });
      return;
    }
    if (values.Unit_Price < selectedProduct?.Product_Price) {
      enqueueSnackbar('Customer Target Price should be greater than or equal to Product Price', {
        variant: 'error',
      });
      return;
    }

    if (!values?.EstimatedDeliveryDate) {
      enqueueSnackbar('Estimated Delivery Date is required', { variant: 'error' });
      return;
    }

    if (editingIndex !== null) {
      // Update existing detail
      const updatedDetails = [...opportunityDetails];
      updatedDetails[editingIndex] = {
        Product: values.Product,
        Quantity: values.Quantity,
        Unit_Price: values.Unit_Price,
        EstimatedDeliveryDate: values.EstimatedDeliveryDate,
        CycloUnitPrice: values.CycloUnitPrice,
        PriceListID: values?.PriceListID || 0,
        Requirement: generateProductName() || null,
        Description: values.Description || 'N/A',
        Yarn_Type_ID: values?.Yarn_Type_ID,
        Yarn_Count_ID: values?.Yarn_Count_ID,
        Color: values?.Color,
        Composition_ID: values?.Composition_ID,
        UOM: values?.UOM,
      };
      setOpportunityDetails(updatedDetails);
    } else {
      // Add new detail
      setOpportunityDetails((prev) => [
        ...prev,
        {
          Requirement: generateProductName() || null,
          Description: values.Description || 'N/A',
          Product: selectedProduct,
          Quantity: values.Quantity,
          Unit_Price: values.Unit_Price,
          CycloUnitPrice: values.CycloUnitPrice,
          EstimatedDeliveryDate: values?.EstimatedDeliveryDate,
          PriceListID: values?.PriceListID || 0,
          Yarn_Type_ID: values?.Yarn_Type_ID,
          Yarn_Count_ID: values?.Yarn_Count_ID,
          Color: values?.Color,
          Composition_ID: values?.Composition_ID,
          UOM: values?.UOM,
        },
      ]);
    }

    // Always reset the form fields and editing state
    resetDetailForm();
  };

  const resetDetailForm = () => {
    setValue('Requirement', '');
    setValue('Description', '');
    setValue('Product', null);
    setValue('PriceListID', null);
    setValue('Yarn_Type_ID', null);
    setValue('Yarn_Count_ID', null);
    setValue('Color', null);
    setValue('Composition_ID', null);
    setSelectedProduct(null);
    setSelectedProduct(null);
    setValue('Quantity', null);
    setValue('Unit_Price', null);
    setValue('CycloUnitPrice', null);
    // setValue('UOM', null);
    setValue('EstimatedDeliveryDate', null);
    setEditingIndex(null);
  };
  const handleEditDetail = (index) => {
    const detail = opportunityDetails[index];
    setValue('Product', detail.Product);
    setValue('Quantity', detail.Quantity);
    setValue('Unit_Price', detail.Unit_Price);
    setValue('CycloUnitPrice', detail.CycloUnitPrice);
    setValue('PriceListID', detail?.PriceListID);
    setValue('Yarn_Type_ID', detail.Yarn_Type_ID);
    setValue('Yarn_Count_ID', detail.Yarn_Count_ID);
    setValue('Color', detail.Color);
    setValue('Composition_ID', detail.Composition_ID);
    // setValue('UOM', detail.UOM);
    setValue('Description', detail.Description);
    setValue('EstimatedDeliveryDate', detail.EstimatedDeliveryDate);
    setEditingIndex(index);
  };

  // Table Heads
  const DetailsTableHead = [
    // { id: 'Yarn_Type_ID', label: 'Yarn Type', minWidth: 120 },
    // { id: 'Yarn_Count_ID', label: 'Yarn Count', minWidth: 120 },
    // { id: 'Color', label: 'Yarn Color', minWidth: 120 },
    // { id: 'Composition_ID', label: 'Yarn Composition', minWidth: 120 },
    { id: 'Description', label: 'Product Requirement', minWidth: 240 },
    { id: 'Description', label: 'Product Description', minWidth: 240 },
    // { id: 'Product_Name', label: 'Pricelist Product', minWidth: 200 },
    { id: 'Quantity', label: 'Quantity', align: 'center' },
    { id: 'Unit_Price', label: 'Customer Target Price', align: 'center', minWidth: 120 },
    { id: 'CycloUnitPrice', label: 'Cyclo Target Price', align: 'center', minWidth: 120 },
    {
      id: 'EstimatedDeliveryDate',
      label: 'Estimated Delivery Date',
      align: 'center',
      minWidth: 120,
    },
    { id: 'Actions', label: 'Actions', width: 88 },
  ];

  // Table
  const table = useTable();

  const notFound = !opportunityDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = opportunityDetails.filter((row) => row !== rowToDelete);
    setOpportunityDetails(updatedDetails);

    // If we're deleting the row being edited, reset the form
    if (editingIndex !== null && opportunityDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);
      setValue('Product', null);
      setValue('Quantity', null);
      setValue('Unit_Price', null);
      setValue('PriceListID', null);
      setValue('Description', null);
      setValue('Yarn_Type_ID', null);
      setValue('Yarn_Count_ID', null);
      setValue('Color', null);
      setValue('Composition_ID', null);
      setValue('EstimatedDeliveryDate', null);
      setValue('CycloUnitPrice', null);
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
  const unit = values?.UOM?.UOMName;
  const symbol = '$';
  // -----------------------------------------------------------

  return isLoading ? (
    renderLoading
  ) : (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ mb: 1, color: 'red' }}>
                  Please make sure the WIC is created in the system before creating a new
                  opportunity.
                </Typography>
              </Box>
              <h3>Opportunity:</h3>
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
                <RHFTextField name="OpportunityName" label="Opportunity Name" fullWidth />

                <RHFAutocomplete
                  name="Customer"
                  label="Customer"
                  placeholder="Choose an option"
                  fullWidth
                  options={customers}
                  getOptionLabel={(option) => option?.WIC_Name}
                />
                <RHFAutocomplete
                  name="Priority"
                  label="Priority"
                  placeholder="Choose an option"
                  fullWidth
                  options={allPriorities}
                  getOptionLabel={(option) => option?.label}
                />

                <Controller
                  name="EndDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Valid until"
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
                <RHFAutocomplete
                  name="KAM"
                  label="Key Account Manager"
                  placeholder="Choose an option"
                  fullWidth
                  options={allKAMs}
                  getOptionLabel={(option) => option?.Username}
                />

                <AutocompleteWithAdd
                  name="PaymentTerms"
                  label="Payment Terms"
                  options={allPaymentTerms}
                  getOptionLabel={(option) => option?.Payment_Term}
                  isOptionEqualToValue={(option, value) =>
                    option?.Payment_term_ID === value?.Payment_term_ID
                  }
                  value={values?.PaymentTerms || null}
                  onAdd={PostPaymentterms}
                />
                <RHFAutocomplete
                  name="UOM"
                  label="Unit of Measure"
                  placeholder="Choose an option"
                  fullWidth
                  options={allUOM}
                  value={values.UOM || null}
                  getOptionLabel={(option) => option?.UOMName || ''}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.UOM_ID === value.UOM_ID;
                  }}
                  disabled={opportunityDetails.length > 0}
                />
              </Box>
            </Card>

            <Card sx={{ p: 3, mt: 2 }}>
              <Box sx={{ width: '100%' }}>
                <h3>Opportunity Products: </h3>
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
                  />
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: 'repeat(3, 1fr)',
                        // sm: 'repeat(2, 1fr)',
                        // md: 'repeat(3, 1fr)',
                      },
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <RHFAutocomplete
                      sx={{ gridColumn: { xs: 'span 2' } }}
                      name="Yarn_Count_ID"
                      label="Yarn Count"
                      placeholder="Choose an option"
                      fullWidth
                      options={allCounts}
                      value={values.Yarn_Count_ID || null}
                      getOptionLabel={(option) => option?.Yarn_Count_Name || ''}
                      isOptionEqualToValue={(option, value) => {
                        if (!option || !value) return false;
                        return option.Yarn_Count_ID === value.Yarn_Count_ID;
                      }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        disabled={
                          allProducts.length === 0 ||
                          !values.Yarn_Count_ID?.Yarn_Count_ID ||
                          !values.Color?.ColorID
                        }
                        onClick={handleDialogOpen}
                      >
                        Check Price
                      </Button>
                    </Box>
                  </Box>

                  <RHFAutocomplete
                    name="Yarn_Type_ID"
                    label="Yarn Type"
                    placeholder="Choose an option"
                    fullWidth
                    options={allTypes}
                    value={values?.Yarn_Type_ID || null}
                    getOptionLabel={(option) => option?.Yarn_Type || ''}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return option.Yarn_Type_ID === value.Yarn_Type_ID;
                    }}
                  />
                  <RHFAutocomplete
                    name="Composition_ID"
                    label="Composition"
                    placeholder="Choose an option"
                    fullWidth
                    options={allCompositions}
                    value={values?.Composition_ID || null}
                    getOptionLabel={(option) => option?.Composition_Name || ''}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      return option.Composition_ID === value.Composition_ID;
                    }}
                  />
                  <RHFTextField
                    name="Requirement"
                    label="Product Requirement"
                    variant="outlined"
                    disabled
                    fullWidth
                    value={generateProductName() || ''}
                  />
                  <RHFTextField
                    sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                    name="Description"
                    label="Product Description (Optional)"
                    type="number"
                    multiline
                    rows={4}
                    variant="outlined"
                    fullWidth
                    value={values.Description || ''}
                  />

                  {/* <RHFAutocomplete
                  key={values.Product?.Product_ID || 'new'} // changes when reset
                  name="Product"
                  label="Product"
                  placeholder="Choose an option"
                  fullWidth
                  disabled
                  options={availableProducts}
                  value={values.Product || null}
                  getOptionLabel={(option) => option?.Product_Name || ''}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.Product_ID === value.Product_ID;
                  }}
                /> */}

                  {/* <RHFTextField
                    name="Product"
                    label="Pricelist Product"
                    variant="outlined"
                    fullWidth
                    disabled
                    value={selectedProduct?.Product_Name || ''}
                  />
                  <RHFTextField
                    name="CompanyPriceRange"
                    label="Company Price Range"
                    variant="outlined"
                    fullWidth
                    disabled
                    value={
                      selectedProduct
                        ? `${symbol} ${priceFrom?.toFixed(2)} - ${symbol} ${priceTo?.toFixed(
                            2
                          )} / ${unit}`
                        : ''
                    }
                  /> */}
                  <RHFTextField
                    name="Quantity"
                    label="Quantity"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={values.Quantity || ''}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2">{unit}</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <RHFTextField
                    name="CycloUnitPrice"
                    label="CYCLO Target Price"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={values.CycloUnitPrice || ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography variant="body2">{symbol}</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <RHFTextField
                    name="Unit_Price"
                    label="Customer Target Price"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={values.Unit_Price || ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography variant="body2">{symbol}</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Controller
                    name="EstimatedDeliveryDate"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <DesktopDatePicker
                        {...field}
                        label="Est. Delivery Date"
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

                {opportunityDetails.length > 0 && (
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
                        {opportunityDetails.map((row, index) => (
                          <DetailTableRow
                            key={index}
                            row={row}
                            onDeleteRow={() => DeleteDetailTableRow(row)}
                            onEditRow={() => handleEditDetail(index)}
                            canDelete
                            forApproval
                          />
                        ))}

                        <TableEmptyRows
                          height={denseHeight}
                          emptyRows={emptyRows(
                            table.page,
                            table.rowsPerPage,
                            opportunityDetails.length
                          )}
                        />

                        <TableNoData notFound={notFound} />
                      </TableBody>
                    </Table>
                    <Typography variant="body2" color="green" sx={{ p: 2 }}>
                      {/* eslint-disable-next-line */}
                      {'Total Amount: $' + TotalAmount.toFixed(2)}
                    </Typography>
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

      <PricelistDialog
        uploadClose={handleDialogClose}
        uploadOpen={dialogOpen}
        tableData={allProducts}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
      />
    </>
  );
}
