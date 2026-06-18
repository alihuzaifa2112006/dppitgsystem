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

import { Get, Post } from 'src/api/apibasemethods';
import { decrypt, encrypt } from 'src/api/encryption';
import DetailTableRow from './detail-table-row';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { grid } from '@mui/system';
import PricelistDialog from './PricelistDialog';
import { convertBDTtoUSD } from 'src/utils/BDTtoUSD';
import Iconify from 'src/components/iconify';
import OpportunityDialog from '../sample/OpportunityDialog';
import QuotationDialog from '../sample/QuotationDialog';
import PropTypes from 'prop-types';
import { APP_URL } from 'src/config-global';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function PiApprovalForm({ currentData }) {
  console.log('Current Data:', currentData);
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
  const [allFabricTypes, setAllFabricTypes] = useState([]);

  const [allCounts, setAllCounts] = useState([]);
  const [allCompositions, setAllCompositions] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [opportunityData, setOpportunityData] = useState([]);
  const [quotationData, setQuotationData] = useState([]);
  const [allEndBuyers, setAllEndBuyers] = useState([]);
  const [dialogValue, setDialogValue] = useState('');
  const [open, setOpen] = useState(false);
  const [allAgents, setAllAgents] = useState([]);
  const [allKAMs, setAllKAMs] = useState([]);

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

  const [piDetails, setPiDetails] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [allQuotations, setAllQuotations] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [approvers, setApprovers] = useState([]);

  const NewPiSchema = Yup.object().shape({
    // Customer: Yup.object().required('Customer is required'),
    // Opportunity: Yup.object().required('Opportunity is required'),
    // Quotation: Yup.object().required('Quotation is required'),
    // PIDate: Yup.date().required('Pi Date is required'),
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
    // PaymentTerms: Yup.object().required('Payment Term is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewPiSchema),
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

  const defaultValues = useMemo(
    () => ({
      Opportunity:
        allOpportunities.find(
          (opportunity) => opportunity.OpportunityID === currentData?.OpportunityID
        ) || null,
      Quotation:
        allQuotations.find((quotation) => quotation.QuotationID === currentData?.QuotationID) ||
        null,
      PaymentTerms:
        allPaymentTerms.find(
          (paymentTerm) => paymentTerm.Payment_term_ID === currentData?.Payment_TermID
        ) || null,
      End_Customer:
        allEndBuyers.find((endBuyer) => endBuyer.End_Cust_ID === currentData?.End_CustomerID) ||
        null,
      Agent: allAgents.find((agent) => agent.AgentID === currentData?.Agency_ID) || null,
      Customer: customers.find((customer) => customer.WIC_ID === currentData?.WIC_ID) || null,
      PIDate: currentData?.PIDate ? new Date(currentData.PIDate) : new Date(),
      ValidFrom: currentData?.ValidFrom ? new Date(currentData.ValidFrom) : null,
      ValidUntil: currentData?.ValidUntil ? new Date(currentData.ValidUntil) : null,
      KAM: allKAMs.find((kam) => kam.UserID === currentData?.KAM) || null,
    }),
    [
      currentData,
      customers,
      allOpportunities,
      allQuotations,
      allPaymentTerms,
      allEndBuyers,
      allAgents,
      allKAMs,
    ]
  );

  useEffect(() => {
    if (
      !isLoading &&
      currentData &&
      customers?.length > 0 &&
      allOpportunities?.length > 0 &&
      allQuotations?.length > 0 &&
      allPaymentTerms?.length > 0 &&
      allEndBuyers?.length > 0 &&
      allAgents?.length > 0
    ) {
      methods.reset(defaultValues);
    }
  }, [
    isLoading,
    defaultValues,
    methods,
    currentData,
    customers,
    allOpportunities,
    allQuotations,
    allPaymentTerms,
    allEndBuyers,
    allAgents,
  ]);

  const generateProductName = () => {
    const productCode = `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${
      values?.Yarn_Count_ID?.Yarn_Count_Name || ''
    } -  ${values?.Composition_ID?.Composition_Name || ''}  (${values?.Color?.ColorName || ''})`;
    return productCode;
  };

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
      const response = await Get(`getAllClausesbyDocTypeID?Document_TypeID=1`);

      setAllClauses(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const GetQuotationActiveinActiveList = useCallback(async () => {
    try {
      const response = await Get(
        `GetQuotationActiveinActiveList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const simplifiedData = response.data.Data.map((item) => item?.QuotationMst);
      setAllQuotations(simplifiedData);
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

  const fetchExchangeRate = useCallback(async () => {
    const rate = await convertBDTtoUSD(1);
    if (rate) {
      setBDTtoUSD(rate); // This is the multiplier, not rate for 1 BDT
    }
  }, []);

  const getActiveendcustomer = useCallback(async () => {
    try {
      const response = await Get(
        `getActiveendcustomer?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllEndBuyers(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const fecthApprovers = useCallback(async () => {
    const res = await Get(
      `GetAlLRegistereKAM?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
    );
    if (res.status === 200) {
      const data = res.data.Data.map((item) => ({
        ...item,
        fullName: item?.Username,
      }));
      setApprovers(data);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetFabricTypes = useCallback(async () => {
    try {
      const response = await Get(
        `GetFabricTypes?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllFabricTypes(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const getAllActiveAgents = useCallback(async () => {
    try {
      const response = await Get(
        `getAllActiveAgents?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllAgents(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetCurrencies = useCallback(async () => {
    const res = await Get('getActiveCurrencies');
    setCurrencies(res.data || []);
  }, []);

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
        GetAllActiveinactiveOpportunities(),
        GetAllClauses(),
        GetCurrencies(),
        GetAllPaymentTerms(),
        GetColors(),
        GetCounts(),
        APIGetTypeList(),
        GetFabricTypes(),
        APIGetCompositionList(),
        GetQuotationActiveinActiveList(),
        getActiveendcustomer(),
        getAllActiveAgents(),
        fecthApprovers(),
        GetKAMs(),
      ]);
      setLoading(false);
      fetchExchangeRate();
    };
    fetchData();
  }, [
    GetCustomersData,
    getpriceList,
    GetAllActiveinactiveOpportunities,
    GetAllClauses,
    GetCurrencies,
    fetchExchangeRate,
    GetAllPaymentTerms,
    GetColors,
    GetCounts,
    APIGetTypeList,
    APIGetCompositionList,
    GetQuotationActiveinActiveList,
    getActiveendcustomer,
    getAllActiveAgents,
    fecthApprovers,
    GetFabricTypes,
    GetKAMs,
  ]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await Get(`GetPriceListById/${values?.PriceListID?.PriceListID}`);
        setAllProducts(
          response.data.Details.map((item) => ({
            ...item,
            CurrencyID: response.data.Master?.CurrencyID,
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

  const OverAllTotalAmount = piDetails?.reduce((total, detail) => {
    const quantity = parseFloat(detail.Quantity);
    const unitPrice = parseFloat(detail.Unit_Price);
    const currencyID = detail?.CurrencyID || detail?.Product?.CurrencyID;
    const price = currencyID === 8 ? unitPrice * BDTtoUSD : unitPrice;

    return total + quantity * price;
  }, 0);

  const fetchOpportunityData = useCallback(async () => {
    try {
      const response = await Get(`GetOpportunityById/${values?.Opportunity?.OpportunityID}`);
      setOpportunityData(response?.data?.OppProduct);
    } catch (error) {
      console.log(error);
      setOpportunityData([]);
    }
  }, [values?.Opportunity?.OpportunityID]);

  useEffect(() => {
    fetchOpportunityData();
  }, [values?.Opportunity?.OpportunityID, fetchOpportunityData]);

  const fetchQuotationData = useCallback(async () => {
    try {
      const response = await Get(`GetQuotationByID?quotationId=${values?.Quotation?.QuotationID}`);
      setQuotationData(response?.data?.QuotationDtl);
    } catch (error) {
      console.log(error);
      setQuotationData([]);
    }
  }, [values?.Quotation?.QuotationID]);

  useEffect(() => {
    fetchQuotationData();
  }, [values?.Quotation?.QuotationID, fetchQuotationData]);

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
    const fetch = async () => {
      try {
        const response = await Get(
          `GetProductsFrmPLBycountAndColorID?Yarncount=${values?.Yarn_Count_ID?.Yarn_Count_ID}&ColorID=${values?.Color?.ColorID}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );
        setAllProducts(response.data.Data);
        if (
          response.data.Data?.find(
            (product) => product.Product_ID === piDetails[editingIndex]?.Product?.Product_ID
          )
        ) {
          setSelectedProduct(
            response.data.Data?.find(
              (product) => product.Product_ID === piDetails[editingIndex]?.Product?.Product_ID
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
    piDetails,
    setSelectedProduct,
    setValue,
  ]);

  const filteredOpportunities = useMemo(
    () =>
      values?.Customer
        ? allOpportunities.filter((opportunity) => opportunity.WICID === values.Customer.WIC_ID)
        : [],
    [allOpportunities, values?.Customer]
  );

  const filteredQuotations = useMemo(
    () =>
      values?.Opportunity
        ? allQuotations.filter(
            (quotation) => quotation?.OpportunityID === values?.Opportunity?.OpportunityID
          )
        : [],
    [allQuotations, values?.Opportunity]
  );

  const PostDetailData = async (detail) => {
    try {
      await Post(`AddPiDetails`, detail);
    } catch (error) {
      console.log('Detail', error);
    }
  };

  const PostPiMasterData = async (opData) => {
    try {
      await Post('AddPi', opData).then(async (res) => {
        if (res?.status === 200) {
          const detailWithMstID = piDetails?.map((detail) => ({
            PiID: res.data.MasterID,
            PriceList_ID: detail?.PriceListID?.PriceListID,
            Product_ID: detail?.Product?.Product_ID,
            UOMID: detail?.Product?.UOMID,
            UnitPrice: parseInt(detail?.Unit_Price, 10),
            // Requirement: detail?.Requirement,
            Description: detail?.Description || 'N/A',
            Quantity: parseInt(detail?.Quantity, 10),
            // eslint-disable-next-line
            Total_Amount: detail?.Quantity * detail?.Unit_Price || 0,
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
          router.push(paths.dashboard.transaction.pi.root);
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
    if (piDetails.length === 0) {
      enqueueSnackbar('Please add at least one pi product', { variant: 'error' });
      return;
    }
    const filteredRevisedDetails = piDetails.filter(
      (detail) => detail.PIDtlID !== undefined && detail.hasUpdated
    );

    const revisedData = filteredRevisedDetails.map((detail) => ({
      PIDtlID: detail.PIDtlID,
      PIID: currentData?.PIID || 0,
      PriceList_ID: detail.Product?.PriceListID,
      Product_ID: detail.Product?.Product_ID,
      UOMID: detail.Product?.UOMID,
      UnitPrice: parseFloat(detail.Unit_Price, 2),
      Description: detail.Description || 'N/A',
      Quantity: parseFloat(detail.Quantity, 2),
      Total_Amount: detail.Quantity * detail.Unit_Price || 0,
      Remarks: detail.Remarks || 'N/A',
      IsActive: true,
      IsDeleted: false,
      CreatedBy: userData?.userDetails?.userId,
      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,
    }));

    console.log('Revised Data:', revisedData);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await Post('AddRevisedProformaDetails', revisedData);
      reset();
      enqueueSnackbar('Created Successfully!');

      router.push(paths.dashboard.transaction.pi.root);
    } catch (error) {
      console.error(error);
    }
  });

  const SubmitApproval = async (status) => {
    if (!values?.ADM_Approved_Remarks) {
      enqueueSnackbar('Please enter approver remarks', { variant: 'error' });
      return;
    }
    const approvalData = {
      PIID: currentData?.PIID || 0,
      ADM_Approve: status,
      ADM_Approved_ID: userData?.userDetails?.userId,
      ADM_Approved_Remarks: values?.ADM_Approved_Remarks || '',
      PIStatus: status === 'Y' ? 'Approved' : 'Rejected',
    };
    await Post('UpdateProformaApprovalStatus', approvalData);
    enqueueSnackbar('Approval Status Updated Successfully!');

    // <p><strong>Created By:</strong> ${userData?.userDetails?.firstName} ${userData?.userDetails?.lastName}</p>
    const generatedLink = `${APP_URL}${paths.dashboard.transaction.pi.pdf(currentData?.PIID)}`;
    const emailData = {
      ProformaNo: currentData?.PINo,
      EmailTo: 's.engr.bilal88@gmail.com',
      Subject: `Proforma Invoice ${currentData?.PINo} Approved`,
      Body: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .details { background: #f9f9f9; padding: 15px; border-left: 4px solid #5e8a36; margin: 20px 0; }
        .footer { margin-top: 20px; font-size: 12px; color: #7f8c8d; }
        .button { 
            display: inline-block; 
            padding: 10px 20px; 
            background-color: #5e8a36; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px; 
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2 class="header">Proforma Invoice Approved</h2>
        
        <p>Dear Admin Team,</p>
        
        <p>The following Proforma Invoice has been approved and is now ready for processing:</p>
        
        <div class="details">
            <p><strong>PI Number:</strong> ${currentData?.PINo}</p>
            <p><strong>Approved By:</strong> ${userData?.userDetails?.firstName} ${
              userData?.userDetails?.lastName
            }</p>
            <p><strong>Approval Date:</strong> ${fDate(new Date())}</p>
        </div>
        
        <p>You can view the full details of this Proforma Invoice by clicking the button below:</p>
        
        <table cellspacing="0" cellpadding="0">
            <tr>
                <td align="center" width="200" height="40" bgcolor="#5e8a36" style="-webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px; color: #ffffff; display: block;">
                    <a href="${generatedLink}" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; line-height: 40px; width: 100%; display: inline-block;">View Approved PI</a>
                </td>
            </tr>
        </table>
        
        <div class="footer">
            <p>This is an automated notification. Please do not reply to this email.</p>
            <p>Best regards,<br>The CYCLO CLOUD System</p>
        </div>
    </div>
</body>
</html>`,
      EmailBy: userData?.userDetails?.userId,
      BranchID: userData?.userDetails?.branchID,
      OrgID: userData?.userDetails?.orgId,
    };
    // reset();
    Post('ProformaInvoice/send', emailData);
    router.push(paths.dashboard.transaction.pi.root);
  };
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
    const addedProductIds = piDetails.map((detail) => detail.Product?.Product_ID);
    return allProducts.filter((product) => !addedProductIds.includes(product.Product_ID));
  }, [piDetails, allProducts]);

  // useEffect(() => {
  //   setPiDetails([]);
  // }, [values.PriceListID?.PriceListID]);
  const handleAddDetail = () => {
    if (editingIndex === null) {
      if (!values?.Fabric_Type) {
        enqueueSnackbar('Fabric Type is required', { variant: 'error' });
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
    }
    if (!selectedProduct) {
      enqueueSnackbar('Please select a product from pricelist', { variant: 'error' });
      return;
    }
    if (
      piDetails.find(
        (detail) =>
          detail.Product?.Product_Name.replace(/\s+/g, ' ').trim().toLowerCase() ===
            selectedProduct?.Product_Name.replace(/\s+/g, ' ').trim().toLowerCase() &&
          detail.Product.Product_ID !== selectedProduct.Product_ID
      )
    ) {
      enqueueSnackbar('Product already added', { variant: 'error' });
      return;
    }
    if (!values.Description) {
      enqueueSnackbar('Product Description is required', { variant: 'error' });
      return;
    }
    // if (!values.PriceListID) {
    //   enqueueSnackbar('Pricelist is required', { variant: 'error' });
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
      const updatedDetails = [...piDetails];

      const dataHasChanged =
        updatedDetails[editingIndex].Quantity !== values.Quantity ||
        updatedDetails[editingIndex].Unit_Price !== values.Unit_Price ||
        updatedDetails[editingIndex].Remarks.trim().toLowerCase() !==
          values.Remarks.trim().toLowerCase() ||
        updatedDetails[editingIndex].Description.trim().toLowerCase() !==
          values.Description.trim().toLowerCase();

      updatedDetails[editingIndex] = {
        Fabric_Type: values.Fabric_Type,

        PIDtlID: piDetails[editingIndex].PIDtlID, // Keep the existing PIDtlID for updates
        Item_Code: piDetails[editingIndex].Item_Code,
        // eslint-disable-next-line
        hasUpdated: dataHasChanged ? true : false,
        Product: values.Product,
        Quantity: values.Quantity,
        Unit_Price: values.Unit_Price,
        Remarks: values.Remarks || 'N/A',
        Description: values.Description || 'N/A',
        PricelistID: values.PriceListID,
      };
      setPiDetails(updatedDetails);
    } else {
      // Add new detail
      setPiDetails((prev) => [
        ...prev,
        {
          // Requirement: values?.Requirement,
          Fabric_Type: values.Fabric_Type,
          Color: values.Color,
          Yarn_Count_ID: values.Yarn_Count_ID,
          PriceListID: selectedProduct?.PriceListID,
          Description: values.Description || 'N/A',
          Product: selectedProduct,
          // UOMID: values.UOMID,
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
    setValue('Color', null);
    setValue('Fabric_Type', null);
    setValue('Yarn_Count_ID', null);
    setValue('PriceListID', null);
    setValue('Description', '');
    setValue('Product', null);
    setValue('Remarks', '');
    // setValue('UOMID', null);
    setSelectedProduct(null);
    setValue('Quantity', null);
    setValue('Unit_Price', null);
    setEditingIndex(null);
  };

  const handleEditDetail = (index) => {
    const detail = piDetails[index];
    console.log('Editing detail:', detail);

    setValue('Color', detail.Color);
    setValue('Yarn_Count_ID', detail.Yarn_Count_ID);
    setValue('Product', detail.Product);
    setValue('Quantity', detail.Quantity);
    setValue('Unit_Price', detail.Unit_Price);
    setValue('Description', detail.Description);
    // setValue('UOMID', detail.UOMID);
    setValue('Remarks', detail.Remarks);
    setSelectedProduct(detail.Product);

    setEditingIndex(index);
  };

  // Table Heads
  const DetailsTableHead = [
    { id: 'Item_Code', label: 'Item Code', minWidth: 120 },
    { id: 'Product', label: 'Product', minWidth: 120 },
    { id: 'Description', label: 'Product Description', minWidth: 240 },
    { id: 'Remarks', label: 'Remarks', minWidth: 200 },
    { id: 'Quantity', label: 'Quantity', align: 'center' },
    { id: 'Unit_Price', label: 'Unit Price', align: 'center', minWidth: 140 },
    // { id: 'Remarks', label: 'Remarks', minWidth: 240 },
    // { id: 'Actions', label: 'Actions', width: 88 },
  ];

  // Table
  const table = useTable();

  const notFound = !piDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = piDetails.filter((row) => row !== rowToDelete);
    setPiDetails(updatedDetails);

    // If we're deleting the row being edited, reset the form
    if (editingIndex !== null && piDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);
      setValue('Product', null);
      setValue('Quantity', null);
      setValue('Unit_Price', null);
    }
  };

  // -----------------------------------------------------------

  const [dialogOpen, setDialogOpen] = useState(false);
  const [oppDialogOpen, setOppDialogOpen] = useState(false);
  const [quoDialogOpen, setQuoDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };
  const handleOppDialogOpen = () => {
    setOppDialogOpen(true);
  };
  const handleQuoDialogOpen = () => {
    setQuoDialogOpen(true);
  };

  const handleDialogClose = () => {
    // FetchDepartment();
    setDialogOpen(false);
  };
  const handleOppDialogClose = () => {
    // FetchDepartment();
    setOppDialogOpen(false);
  };
  const handleQuoDialogClose = () => {
    // FetchDepartment();
    setQuoDialogOpen(false);
  };


  useEffect(() => {
    if (selectedProduct?.currencyID === 8) {
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
                  Please make sure the WIC is created in the system before creating a new proforma
                  invoice.
                </Typography>
              </Box> */}
              <h3>Proforma Invoice:</h3>
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
                {/* <RHFTextField name="PiName" label="Pi Name" fullWidth /> */}

                <RHFAutocomplete
                  name="Customer"
                  label="Customer"
                  fullWidth
                  options={customers || []}
                  getOptionLabel={(option) => option?.WIC_Name || ''}
                  isLoading={isLoading}
                  isOptionEqualToValue={(option, value) => option?.WIC_ID === value?.WIC_ID}
                  value={values?.Customer || null}
                  disabled
                />

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <RHFAutocomplete
                    name="Opportunity"
                    label="Opportunity"
                    fullWidth
                    options={filteredOpportunities || []}
                    getOptionLabel={(option) => option?.OpportunityName}
                    loading={isLoading}
                    value={values?.Opportunity || null}
                    disabled
                  />
                  <Tooltip title="View Opportunity" placement="top">
                    <IconButton
                      sx={{ width: 40, height: 40 }}
                      color="primary"
                      onClick={handleOppDialogOpen}
                      disabled={!values?.Opportunity}
                    >
                      <Iconify icon="ph:eye-duotone" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <RHFAutocomplete
                    name="Quotation"
                    label="Quotation"
                    fullWidth
                    options={filteredQuotations || []}
                    getOptionLabel={(option) => option?.QuotationNo}
                    loading={isLoading}
                    value={values?.Quotation || null}
                    disabled
                  />
                  <Tooltip title="View Quotation" placement="top">
                    <IconButton
                      sx={{ width: 40, height: 40 }}
                      color="primary"
                      onClick={handleQuoDialogOpen}
                      disabled={!values?.Quotation}
                    >
                      <Iconify icon="ph:eye-duotone" />
                    </IconButton>
                  </Tooltip>
                </Box>
                {/* <RHFAutocomplete
                  name="Currency"
                  label="Currency"
                  placeholder="Choose an option"
                  fullWidth
                  options={currencies}
                  getOptionLabel={(option) => option?.Currency_Name}
                /> */}

                <RHFAutocomplete
                  name="PaymentTerms"
                  label="Payment Terms"
                  placeholder="Choose an option"
                  fullWidth
                  options={allPaymentTerms || []}
                  getOptionLabel={(option) => option?.Payment_Term}
                  isOptionEqualToValue={(option, value) =>
                    option?.Payment_term_ID === value?.Payment_term_ID
                  }
                  value={values?.PaymentTerms || null}
                  disabled
                />
                <RHFAutocomplete
                  name="End_Customer"
                  label="Main Buyer"
                  fullWidth
                  options={allEndBuyers || []}
                  getOptionLabel={(option) => option?.End_Cust_Name || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.End_Cust_ID === value?.End_Cust_ID
                  }
                  value={values?.End_Customer || null}
                  disabled
                />
                <RHFAutocomplete
                  name="Agent"
                  label="Agent"
                  fullWidth
                  multiple
                  options={allAgents || []}
                  getOptionLabel={(option) => option?.Agent_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.AgentID === value?.AgentID}
                  value={values?.Agent || null}
                  disabled
                />

                <Controller
                  name="PIDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="PI Date"
                      format="dd MMM yyyy"
                      disabled
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
                  name="ValidFrom"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Valid From"
                      format="dd MMM yyyy"
                      disabled
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
                      disabled
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
                  name="Approver"
                  label="Approver"
                  fullWidth
                  multiple
                  sx={{
                    '& .MuiChip-label': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                      maxWidth: '200px', // Adjust this value as needed
                    },
                  }}
                  limitTags={1}
                  options={approvers || []}
                  getOptionLabel={(option) => option?.fullName}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.UserId}>
                      <Checkbox key={option.UserId} size="small" disableRipple checked={selected} />
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
                        {option.fullName}
                      </Box>
                    </li>
                  )}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.UserId}
                        label={option.fullName}
                        size="small"
                        variant="soft"
                        color="primary"
                        sx={{
                          maxWidth: '100%',
                          '& .MuiChip-label': {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          },
                        }}
                      />
                    ))
                  }
                /> */}
                {/* <RHFAutocomplete
                  name="Clause"
                  label="Terms & Condition / Clause"
                  fullWidth
                  sx={{
                    gridColumn: { xs: 'span 1', md: 'span 2' },
                    '& .MuiChip-label': {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                      maxWidth: '200px', // Adjust this value as needed
                    },
                  }}
                  multiple
                  limitTags={2}
                  options={allClauses}
                  getOptionLabel={(option) => option?.Clause}
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
                      <Tooltip title={option.Clause} key={option.Clause_ID}>
                        <Chip
                          {...getTagProps({ index })}
                          label={option.Clause}
                          size="small"
                          variant="soft"
                          color="primary"
                          sx={{
                            maxWidth: '100%',
                            '& .MuiChip-label': {
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            },
                          }}
                        />
                      </Tooltip>
                    ))
                  }
                  ListboxProps={{
                    style: {
                      maxHeight: '300px',
                    },
                  }}
                /> */}
                <RHFAutocomplete
                  name="KAM"
                  label="Key Account Manager"
                  placeholder="Choose an option"
                  fullWidth
                  disabled
                  options={allKAMs}
                  getOptionLabel={(option) => option?.Username}
                  value={values.KAM || null}
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
                          <TableCell>Prcielist Name</TableCell>
                          <TableCell>Product</TableCell>
                          <TableCell align="center">Quantity</TableCell>
                          <TableCell align="center">Unit Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tableData?.map((row, index) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.PriceListName}</TableCell>
                            <TableCell>{row.Product_Name}</TableCell>
                            <TableCell align="center">{row.Quantity}</TableCell>
                            <TableCell align="center">{row.Unit_Price}</TableCell>
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
                <h3>Proforma Invoice Products: </h3>
                {/*
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  }}
                >
                 {editingIndex === null && (
                    <>
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
                              !values.Yarn_Count_ID?.Yarn_Count_ID || !values.Color?.ColorID
                            }
                            onClick={handleDialogOpen}
                          >
                            Check Price
                          </Button>
                        </Box>
                      </Box>
                    </>
                  )}
  <AutocompleteWithAdd
                        name="Fabric_Type"
                        label="Fabric Type"
                        options={allFabricTypes}
                        getOptionLabel={(option) => option?.Fabric_Types || ''}
                        isOptionEqualToValue={(option, value) =>
                          option?.Fabric_TypeID === value?.Fabric_TypeID
                        }
                        onAdd={PostFabricTypes}
                      />
                  <RHFTextField
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
                        ? `${currencySymbol}${priceFrom?.toFixed(
                            2
                          )} - ${currencySymbol}${priceTo?.toFixed(2)} / ${unit}`
                        : ''
                    }
                  />
                  <RHFTextField
                    sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                    name="Description"
                    label="Product Description"
                    type="number"
                    multiline
                    rows={4}
                    variant="outlined"
                    fullWidth
                    value={values.Description || ''}
                  /> */}

                {/* <RHFTextField
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
                  <RHFTextField
                    sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                    name="Remarks"
                    label="Remarks (Optional)"
                    variant="outlined"
                    fullWidth
                    value={values.Remarks || ''}
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

                {piDetails.length > 0 && (
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
                        {piDetails.map((row, index) => (
                          <DetailTableRow
                            key={index}
                            row={row}
                            onDeleteRow={() => DeleteDetailTableRow(row)}
                            onEditRow={() => handleEditDetail(index)}
                            currentData={currentData}
                            isApprover
                          />
                        ))}

                        <TableEmptyRows
                          height={denseHeight}
                          emptyRows={emptyRows(table.page, table.rowsPerPage, piDetails.length)}
                        />

                        <TableNoData notFound={notFound} />
                      </TableBody>
                    </Table>
                    <Typography variant="body2" color="green" sx={{ p: 2 }}>
                      {/* eslint-disable-next-line */}
                      {'Total Amount: $' + OverAllTotalAmount.toFixed(2)}
                    </Typography>
                  </Scrollbar>
                )}
              </Box>
            </Card>

            {currentData?.ApproverIDs?.includes(userData?.userDetails?.userId) ? (
              <>
                <Card sx={{ p: 3, mt: 2 }}>
                  <RHFTextField
                    name="ADM_Approved_Remarks"
                    label="Approver Remarks"
                    variant="outlined"
                    fullWidth
                    value={values.ADM_Approved_Remarks || ''}
                  />
                </Card>
                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3, gap: 2, pr: 3 }}>
                  <LoadingButton
                    onClick={() => SubmitApproval('R')}
                    color="error"
                    variant="outlined"
                    loading={isSubmitting}
                  >
                    Reject
                  </LoadingButton>
                  <LoadingButton
                    onClick={() => SubmitApproval('Y')}
                    variant="contained"
                    color="primary"
                    loading={isSubmitting}
                  >
                    Approve
                  </LoadingButton>
                </Stack>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body1" color="textSecondary">
                  You are not authorized to submit this Proforma Invoice.
                </Typography>
              </Box>
            )}
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
      <QuotationDialog
        uploadClose={handleQuoDialogClose}
        uploadOpen={quoDialogOpen}
        tableData={quotationData}
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
PiApprovalForm.propTypes = {
  currentData: PropTypes.any,
};
