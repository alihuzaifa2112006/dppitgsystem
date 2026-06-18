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
  IconButton,
  InputAdornment,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
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

import { Delete, Get, Post } from 'src/api/apibasemethods';
import { decrypt, encrypt } from 'src/api/encryption';
import DetailTableRow from './detail-table-row';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { grid } from '@mui/system';
import PricelistDialog from './PricelistDialog';
import { convertBDTtoUSD } from 'src/utils/BDTtoUSD';
import PropTypes from 'prop-types';
import { fCurrency, fNumber } from 'src/utils/format-number';
import Iconify from 'src/components/iconify';
import OpportunityDialog from '../sample/OpportunityDialog';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';

// ----------------------------------------------------------------------

export default function QuotationEditForm({ currentData }) {
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

  const [allProducts, setAllProducts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [allPriceList, setAllPriceList] = useState([]);
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [allClauses, setAllClauses] = useState([]);
  const [allPaymentTerms, setAllPaymentTerms] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [allColors, setAllColors] = useState([]);
  const [allCounts, setAllCounts] = useState([]);
  const [allCompositions, setAllCompositions] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [allUOM, setAllUOM] = useState([]);
  const [allKAMs, setAllKAMs] = useState([]);
  const [opportunityData, setOpportunityData] = useState([]);
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

  const [quotationDetails, setQuotationDetails] = useState(currentData?.QuotationDtl || []);
  const [editingIndex, setEditingIndex] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isFormReady, setIsFormReady] = useState(false);
  const [tableData, setTableData] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const NewQuotationSchema = Yup.object().shape({
    Customer: Yup.object().required('Customer is required'),
    ValidFrom: Yup.date().required('Valid From is required'),
    // .test('is-future-or-today', 'Valid From must be today or later', (value) => {
    //   if (!value) return false;

    //   const today = new Date();
    //   today.setHours(0, 0, 0, 0);

    //   const inputDate = new Date(value);
    //   inputDate.setHours(0, 0, 0, 0);

    //   return inputDate >= today;
    // }),
    ValidUntil: Yup.date()
      .required('Valid Until is required')
      .min(Yup.ref('ValidFrom'), 'Valid Until must be greater than or equal to Valid From'),
    // Clause: Yup.array().required('Clause is required'),
    KAM: Yup.object().required('KAM is required'),
    PaymentTerms: Yup.array().required('Payment Terms is required'),
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

  const generateProductName = () => {
    console.log('generateProductName called');
    const productCode = `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${
      values?.Yarn_Count_ID?.Yarn_Count_Name || ''
    } -  ${values?.Composition_ID?.Composition_Name || ''}  (${values?.Color?.ColorName || ''} - ${
      values?.Color?.Color_Code || ''
    })`;
    return productCode;
  };

  const defaultValues = useMemo(
    () => ({
      Opportunity:
        allOpportunities.find(
          (opportunity) => opportunity.OpportunityID === currentData?.QuotationMst?.OpportunityID
        ) || null,
      Customer:
        customers.find((customer) => customer.WIC_ID === currentData?.QuotationMst?.WIC_ID) || null,
      Clause: currentData?.Clauses || [],
      KAM: allKAMs.find((kam) => kam.UserID === currentData?.QuotationMst?.KAM) || null,
      PaymentTerms:
        allPaymentTerms.find(
          (term) => term.Payment_term_ID === currentData?.QuotationMst?.Payment_TermID
        ) || null,
      ValidFrom: currentData?.QuotationMst?.ValidFrom
        ? new Date(currentData.QuotationMst.ValidFrom)
        : null,
      ValidUntil: currentData?.QuotationMst?.ValidUntil
        ? new Date(currentData.QuotationMst.ValidUntil)
        : null,
    }),
    [currentData, customers, allOpportunities, allPaymentTerms, allKAMs]
  );

  useEffect(() => {
    if (!isLoading && currentData && customers.length > 0 && allOpportunities.length > 0) {
      methods.reset(defaultValues);
      setIsFormReady(true);
    }
  }, [isLoading, defaultValues, methods, currentData, customers, allOpportunities]);

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

  const GetAllClauses = useCallback(async () => {
    try {
      const response = await Get(
        `clause/all?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setAllClauses(response.data);
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

  const GetApprovedOpportunities = useCallback(async () => {
    try {
      const response = await Get(
        `GetApprovedOpportunities?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&RoleID=${userData?.userDetails?.roles[0]}&UserID=${userData?.userDetails?.userId}`
      );

      setAllOpportunities(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    userData?.userDetails?.roles,
    userData?.userDetails?.userId,
  ]);

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

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        GetCustomersData(),
        getpriceList(),
        GetApprovedOpportunities(),
        GetAllClauses(),
        GetCurrencies(),
        GetAllPaymentTerms(),
        GetColors(),
        GetCounts(),
        APIGetTypeList(),
        APIGetCompositionList(),
        GetAllActiveUOM(),
        GetKAMs(),
      ]);
      setLoading(false);
      fetchExchangeRate();
    };
    fetchData();
  }, [
    GetCustomersData,
    getpriceList,
    GetApprovedOpportunities,
    GetAllClauses,
    GetCurrencies,
    fetchExchangeRate,
    GetAllPaymentTerms,
    GetColors,
    GetCounts,
    APIGetTypeList,
    APIGetCompositionList,
    GetAllActiveUOM,
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
            (product) => product.Product_ID === quotationDetails[editingIndex]?.Product?.Product_ID
          )
        ) {
          setSelectedProduct(
            response.data.Data?.find(
              (product) =>
                product.Product_ID === quotationDetails[editingIndex]?.Product?.Product_ID
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
    quotationDetails,
    setSelectedProduct,
    setValue,
  ]);

  const TotalAmount = quotationDetails.reduce((total, detail) => {
    const quantity = parseFloat(detail.Quantity);
    const unitPrice = parseFloat(detail.Unit_Price);
    const currencyID = detail?.PriceListID?.CurrencyID;

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

  useEffect(() => {
    const fetchOpportunityData = async (opportunityID) => {
      try {
        const response = await Get(`GetOpportunityById/${opportunityID}`);
        setTableData(response.data.OppProduct);
      } catch (error) {
        console.log(error);
        setTableData([]);
      }
    };

    if (values?.Opportunity) {
      setValue(
        'Customer',
        customers?.find((customer) => customer.WIC_ID === values?.Opportunity?.WICID) || null
      );

      fetchOpportunityData(values?.Opportunity?.OpportunityID);
    } else {
      setTableData([]);
      setValue('Customer', null);
    }
  }, [values?.Opportunity, customers, setValue]);

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
      await Post(`AddRevisedQuotationDetails`, detail);
    } catch (error) {
      console.log('Detail', error);
    }
  };

  const PostNewDetailData = async (detail) => {
    try {
      await Post(`AddQuotationDetails`, detail);
    } catch (error) {
      console.log('Detail', error);
    }
  };

  const PostQuotationMasterData = async (opData) => {
    try {
      await Post('UpdateQuotationValidityAndClauses', opData).then(async (res) => {
        const detailWithMstID = quotationDetails
          ?.filter((detail) => detail?.QuotationDtlID)
          .map((detail) => ({
            QuotationID: currentData?.QuotationMst?.QuotationID,
            QuotationDtlID: detail?.QuotationDtlID,
            PriceList_ID: detail?.PriceListID?.PriceListID || 0,
            Product_ID: detail?.Product?.Product_ID || 0,
            UOMID: detail?.UOM?.UOMID,
            UnitPrice: detail?.Unit_Price,
            // Requirement: detail?.Requirement,
            Description: detail?.Description || 'N/A',
            Quantity: detail?.Quantity,
            Total_Amount: TotalAmount,
            Revision_No: 0,
            Remarks: detail?.Remarks || 'N/A',
            IsActive: true,
            IsDeleted: false,
            CreatedBy: userData?.userDetails?.userId,
            Branch_ID: userData?.userDetails?.branchID,
            Org_ID: userData?.userDetails?.orgId,
          }));

        const newQuotationDetails = quotationDetails
          ?.filter((detail) => !detail?.QuotationDtlID)
          .map((detail) => ({
            QuotationID: currentData?.QuotationMst?.QuotationID,
            PriceList_ID: detail?.PriceListID?.PriceListID || 0,
            Product_ID: detail?.Product?.Product_ID || 0,
            UOMID: detail?.UOM?.UOMID,
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
        await PostNewDetailData(newQuotationDetails);
        enqueueSnackbar('Created Successfully!');
        reset();
        router.push(paths.dashboard.transaction.quotation.root);
      });
    } catch (error) {
      console.log(error);
      if (error.response.status === 400) {
        enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
      } else enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    if (quotationDetails.length === 0) {
      enqueueSnackbar('Please add at least one quotation product', { variant: 'error' });
      return;
    }

    const dataToSend = {
      QuotationID: currentData?.QuotationMst?.QuotationID || 0,
      ValidFrom: data.ValidFrom ? formatDate(data.ValidFrom) : null,
      ValidUntil: data.ValidUntil ? formatDate(data.ValidUntil) : null,
      KAM: data.KAM?.UserID || null,
      Payment_TermID: data.PaymentTerms?.Payment_term_ID || null,
      ClauseIDs: data.Clause?.map((clause) => clause.Clause_ID) || [],
      UpdatedBy: userData?.userDetails?.userId,
      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,
    };
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await PostQuotationMasterData(dataToSend);
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

  const fetchOpportunityData = useCallback(async () => {
    try {
      const response = await Get(`GetOpportunityById/${values?.Opportunity?.OpportunityID}`);
      setOpportunityData(response.data.OppProduct);
    } catch (error) {
      console.log(error);
      setOpportunityData([]);
    }
  }, [values?.Opportunity?.OpportunityID]);

  useEffect(() => {
    fetchOpportunityData();
  }, [values?.Opportunity?.OpportunityID, fetchOpportunityData]);

  const [oppDialogOpen, setOppDialogOpen] = useState(false);
  const handleOppDialogOpen = () => {
    setOppDialogOpen(true);
  };
  const handleOppDialogClose = () => {
    setOppDialogOpen(false);
  };

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

    if (!values.Color) {
      enqueueSnackbar('Color is required', { variant: 'error' });
      return;
    }
    if (!values.Yarn_Count_ID) {
      enqueueSnackbar('Yarn Count is required', { variant: 'error' });
      return;
    }
    if (!values.Yarn_Type_ID) {
      enqueueSnackbar('Yarn Type is required', { variant: 'error' });
      return;
    }
    if (!values.Composition_ID) {
      enqueueSnackbar('Composition is required', { variant: 'error' });
      return;
    }

    // if (!selectedProduct) {
    //   enqueueSnackbar('Please select a product from pricelist', { variant: 'error' });
    //   return;
    // }
    // if (
    //   quotationDetails.find(
    //     (detail) =>
    //       detail.Description.replace(/\s+/g, ' ').trim().toLowerCase() ===
    //       generateProductName().replace(/\s+/g, ' ').trim().toLowerCase()
    //   )
    // ) {
    //   enqueueSnackbar('Product already added', { variant: 'error' });
    //   return;
    // }
    if (!values.Quantity) {
      enqueueSnackbar('Quantity is required', { variant: 'error' });
      return;
    }
    if (!values.Unit_Price) {
      enqueueSnackbar('Unit Price is required', { variant: 'error' });
      return;
    }
    if (values.Unit_Price < selectedProduct?.Product_Price) {
      enqueueSnackbar('Unit Price should be greater than or equal to Product Price', {
        variant: 'error',
      });
      return;
    }

    if (editingIndex !== null) {
      // Update existing detail
      const updatedDetails = [...quotationDetails];
      updatedDetails[editingIndex] = {
        PriceListID: values.PriceListID,
        Description: values.Description || 'N/A',
        Product: selectedProduct,
        UOM: values.UOM,
        Remarks: values.Remarks || 'N/A',
        Quantity: values.Quantity,
        Unit_Price: values.Unit_Price,
        QuotationDtlID: quotationDetails[editingIndex]?.QuotationDtlID,
        Yarn_Count_ID: values.Yarn_Count_ID,
        Yarn_Type_ID: values.Yarn_Type_ID,
        Composition_ID: values.Composition_ID,
        Color: values.Color,
      };
      setQuotationDetails(updatedDetails);
    } else {
      // Add new detail
      setQuotationDetails((prev) => [
        ...prev,
        {
          // Requirement: values.Requirement,
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
    setValue('UOM', null);
    setSelectedProduct(null);
    setValue('Quantity', null);
    setValue('Unit_Price', null);
    setValue('Yarn_Count_ID', null);
    setValue('Yarn_Type_ID', null);
    setValue('Composition_ID', null);
    setValue('Color', null);
    setEditingIndex(null);
  };

  const handleEditDetail = (index) => {
    console.log('allProducts', allProducts);
    const detail = quotationDetails[index];
    console.log('detail', detail);
    setValue('Description', detail.Description);
    setValue('Quantity', detail.Quantity);
    setValue('Remarks', detail.Remarks);
    setValue('UOM', detail.UOM);
    setValue('Yarn_Count_ID', detail.Yarn_Count_ID);
    setValue('Yarn_Type_ID', detail.Yarn_Type_ID);
    setValue('Composition_ID', detail.Composition_ID);
    setValue('Color', detail.Color);
    setValue(
      'PriceListID',
      allPriceList.find((priceList) => priceList.PriceListID === detail.PriceListID?.PriceListID)
    );
    setValue('Unit_Price', detail.Unit_Price);

    // Set the selectedProduct from the detail's Product
    setSelectedProduct(detail.Product);

    // Also set the Product form value if needed
    setValue('Product', detail.Product);

    setEditingIndex(index);
  };

  // Table Heads
  const DetailsTableHead = [
    { id: 'Description', label: 'Product Requirement', minWidth: 120 },
    { id: 'Remarks', label: 'Product Description', minWidth: 240 },
    // { id: 'Product_Name', label: 'Pricelist Product', minWidth: 200 },
    { id: 'Quantity', label: 'Quantity', align: 'center' },
    { id: 'Unit_Price', label: 'Unit Price', align: 'center', minWidth: 120 },
    // { id: 'Remarks', label: 'Remarks', minWidth: 240 },
    // { id: 'Actions', label: 'Actions', width: 88 },
  ];

  // Table
  const table = useTable();

  const notFound = !quotationDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  const DeleteDetailTableRow = async (rowToDelete) => {
    const updatedDetails = quotationDetails.filter((row) => row !== rowToDelete);
    setQuotationDetails(updatedDetails);

    // If we're deleting the row being edited, reset the form
    if (editingIndex !== null && quotationDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);
      setValue('Product', null);
      setValue('Quantity', null);
      setValue('Unit_Price', null);
    }

    try {
      await Delete(`DelQuotationDetailAndDtlHistory/${rowToDelete?.QuotationDtlID}`);
    } catch (error) {
      console.error('Error deleting detail:', error);
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
  const unit = values.UOM?.UOM_Name ?? '';

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
              {/* <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ mb: 1, color: 'red' }}>
                  Please make sure the WIC is created in the system before creating a new quotation.
                </Typography>
              </Box> */}
              <h3>Quotation:</h3>
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
                {/* <RHFTextField name="QuotationName" label="Quotation Name" fullWidth /> */}

                {/* <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}> */}
                <RHFAutocomplete
                  name="Opportunity"
                  label="Opportunity"
                  fullWidth
                  options={allOpportunities}
                  getOptionLabel={(option) => option?.OpportunityName}
                  loading={isLoading}
                  disabled
                  value={values?.Opportunity || null}
                />
                {/* <Tooltip title="View Opportunity" placement="top">
                    <IconButton
                      sx={{ width: 40, height: 40 }}
                      color="primary"
                      onClick={handleOppDialogOpen}
                      disabled={!values?.Opportunity}
                    >
                      <Iconify icon="ph:eye-duotone" />
                    </IconButton>
                  </Tooltip>
                </Box> */}

                {/* {values?.Opportunity ? (
                  <RHFTextField
                    name="Customer"
                    label="Customer"
                    variant="outlined"
                    fullWidth
                    disabled={!!values?.Opportunity}
                    value={values?.Customer?.WIC_Name || ''}
                  />
                ) : ( */}
                <RHFAutocomplete
                  name="Customer"
                  label="Customer"
                  placeholder="Choose an option"
                  fullWidth
                  disabled
                  options={customers}
                  getOptionLabel={(option) => option?.WIC_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.WIC_ID === value?.WIC_ID}
                  loading={isLoading}
                  value={values?.Customer || null}
                  // disabled={!!values?.Opportunity}
                />
                {/* )} */}
                {/* <RHFAutocomplete
                  name="Currency"
                  label="Currency"
                  placeholder="Choose an option"
                  fullWidth
                  options={currencies}
                  getOptionLabel={(option) => option?.Currency_Name}
                /> */}

                {/* <Controller
                  name="QuotationDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Quotation Date"
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
                /> */}
                <Controller
                  name="ValidFrom"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Valid From"
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
                <Controller
                  name="ValidUntil"
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

                {/* <RHFAutocomplete
                  name="Clause"
                  label="Clause"
                  // placeholder="Choose an option"
                  fullWidth
                  multiple
                  limitTags={1}
                  sx={{
                    // gridColumn: { xs: 'span 1', md: 'span 2' },
                    '& .MuiChip-label': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                      maxWidth: '200px', // Adjust this value as needed
                    },
                  }}
                  options={allClauses}
                  getOptionLabel={(option) => option?.Clause || ''}
                  isOptionEqualToValue={(option, value) => option?.Clause_ID === value?.Clause_ID}
                  value={values?.Clause || []}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.Clause_ID}>
                      <Checkbox
                        key={option.Clause_ID}
                        size="small"
                        disableRipple
                        checked={selected}
                      />
                      <Box
                        component="span"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'block',
                          width: '100%',
                        }}
                      >
                        {option.Clause}
                      </Box>
                    </li>
                  )}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.Clause_ID}
                        label={option.Clause}
                        size="small"
                        variant="soft"
                        color="primary"
                      />
                    ))
                  }
                /> */}

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
                  name="KAM"
                  label="Key Account Manager"
                  placeholder="Choose an option"
                  fullWidth
                  options={allKAMs}
                  getOptionLabel={(option) => option?.Username}
                  isOptionEqualToValue={(option, value) => option?.UserID === value?.UserID}
                  value={values?.KAM || null}
                />
              </Box>

              {/* {tableData.length > 0 && (
                <TableContainer sx={{ mt: 2 }}>
                  <Scrollbar>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Opportunity Products
                    </Typography>
                    <Table sx={{ minWidth: 720 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align="center">Quantity</TableCell>
                          <TableCell align="center">Unit Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tableData?.map((row, index) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.Requirement}</TableCell>
                            <TableCell>{row.Description}</TableCell>
                            <TableCell align="center">{`${fNumber(row.Quantity)} KG`}</TableCell>
                            <TableCell align="center">{`${fCurrency(row.Unit_Price)}`}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
              )} */}
            </Card>

            <Card sx={{ p: 3, mt: 2 }}>
              <Box sx={{ width: '100%' }}>
                <h3>Quotation Products: </h3>
                {/* <Box
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
                    sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                    name="Description"
                    label="Product Description"
                    variant="outlined"
                    disabled
                    fullWidth
                    value={generateProductName() || ''}
                  />
                  <RHFTextField
                    sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                    name="Remarks"
                    label="Product Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={values?.Remarks || ''}
                  />
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
                    name="Unit_Price"
                    label="Unit Price"
                    type="number"
                    variant="outlined"
                    fullWidth
                    value={values.Unit_Price || ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography variant="body2">{currencySymbol}</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                
                </Box>
                <Stack alignItems="flex-end" direction="row-reverse" sx={{ mt: 3, gap: 2 }}>
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
                </Stack> */}

                {quotationDetails.length > 0 && (
                  <Scrollbar>
                    <Table
                      size={table.dense ? 'small' : 'medium'}
                      sx={{
                        minWidth: 460,
                        // mt: 4,
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
                        {quotationDetails.map((row, index) => (
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
                            quotationDetails.length
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
      <OpportunityDialog
        uploadClose={handleOppDialogClose}
        uploadOpen={oppDialogOpen}
        tableData={opportunityData}
        // selectedProduct={selectedProduct}
        // setSelectedProduct={setSelectedProduct}
      />
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

QuotationEditForm.propTypes = {
  currentData: PropTypes.any,
};
