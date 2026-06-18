import * as Yup from 'yup';
import PropTypes from 'prop-types';

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

import { Delete, Get, Post, Put } from 'src/api/apibasemethods';
import { decrypt, encrypt } from 'src/api/encryption';
import DetailTableRow from './detail-table-row';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { minWidth } from '@mui/system';
import { convertBDTtoUSD } from 'src/utils/BDTtoUSD';
import { all } from 'axios';
import { fDate } from 'src/utils/format-time';
import { APP_URL } from 'src/config-global';
import PricelistDialog from './PricelistDialog';

// ----------------------------------------------------------------------

export default function ItemRequisitionApprovalForm({ currentData }) {
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
  const BDTtoUSD = convertBDTtoUSD(1);
  const [allColors, setAllColors] = useState([]);
  const [allCounts, setAllCounts] = useState([]);
  const [allCompositions, setAllCompositions] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [allUOM, setAllUOM] = useState([]);
  const [allKAMs, setAllKAMs] = useState([]);
  const [isApproving, setIsApproving] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [approverData, setApproverData] = useState([]);

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

  const [dispoderDetails, setDispoderDetails] = useState(currentData?.OppProduct || []);
  const [editingIndex, setEditingIndex] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const NewDispoderSchema = Yup.object().shape({
    DispoderName: Yup.string().required('Dispoder Name is required'),
    Customer: Yup.object().required('Customer is required'),
    // DispoderDate: Yup.date().required('Dispoder Date is required'),
    EndDate: Yup.date().required('End Date is required'),
    // PriceListID: Yup.object().required('Pricelist is required'),
  });

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

  const GetDocApprovalSetup = useCallback(async () => {
    try {
      const response = await Get(
        `getDocumentApproverByID?&ApproverID=${userData?.userDetails?.userId}&DocID=4`
      );

      if (response.status === 200 && Array.isArray(response.data?.Data)) {
        const approver = response.data.Data.find(
          (item) => item.ApproverID === userData?.userDetails?.userId
        );

        // if approver[0].Approval_Lvl_ID === 1 and currentData?.QuotationMst?.Level1_Approved_ID is null set true, or
        // if approver[0].Approval_Lvl_ID === 2 and currentData?.QuotationMst?.Level2_Approved_ID is null set true
        if (
          (approver?.Approval_Lvl_ID === 1 && !currentData?.Level1_Approved_ID) ||
          (approver?.Approval_Lvl_ID === 2 && !currentData?.Level2_Approved_ID)
        ) {
          setCanApprove(true);
        } else {
          setCanApprove(false);
        }
        setApproverData(response?.data?.Data || []);
      }
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.userId, currentData]);

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
        GetKAMs(),
        GetDocApprovalSetup(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [
    GetCustomersData,
    getpriceList,
    GetColors,
    GetCounts,
    APIGetTypeList,
    APIGetCompositionList,
    GetAllActiveUOM,
    GetKAMs,
    GetDocApprovalSetup,
  ]);

  const methods = useForm({
    resolver: yupResolver(NewDispoderSchema),
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
    const fetch = async () => {
      try {
        const response = await Get(
          `GetProductsFrmPLBycountAndColorID?Yarncount=${values?.Yarn_Count_ID?.Yarn_Count_ID}&ColorID=${values?.Color?.ColorID}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );
        setAllProducts(response.data.Data);
        if (
          response.data.Data?.find(
            (product) =>
              product.Product_ID === dispoderDetails[editingIndex]?.Product?.Product_ID
          )
        ) {
          setSelectedProduct(
            response.data.Data?.find(
              (product) =>
                product.Product_ID === dispoderDetails[editingIndex]?.Product?.Product_ID
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
    dispoderDetails,
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

  const TotalAmount = dispoderDetails.reduce((total, detail) => {
    const quantity = parseFloat(detail.Quantity);
    const unitPrice = parseFloat(detail.Unit_Price);
    const currencyID = detail?.PriceListID?.CurrencyID;

    const price = currencyID === 8 ? unitPrice * BDTtoUSD : unitPrice;

    return total + quantity * price;
  }, 0);

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

  const waitForLevel1 = approverData[0]?.Approval_Lvl_ID === 2 && !currentData?.Level1_Approved_ID;

  // useEffect(() => {
  //   if (values?.Priority?.value === 'High') {
  //     // set ednDate to 3 days from today
  //     const today = new Date();
  //     const threeDaysLater = new Date(today);
  //     threeDaysLater.setDate(today.getDate() + 3);
  //     setValue('EndDate', threeDaysLater);
  //   } else if (values?.Priority?.value === 'Medium') {
  //     // set ednDate to 7 days from today
  //     const today = new Date();
  //     const sevenDaysLater = new Date(today);
  //     sevenDaysLater.setDate(today.getDate() + 7);
  //     setValue('EndDate', sevenDaysLater);
  //   } else if (values?.Priority?.value === 'Low') {
  //     // set ednDate to 15 days from today
  //     const today = new Date();
  //     const fifteenDays = new Date(today);
  //     fifteenDays.setDate(today.getDate() + 15);
  //     setValue('EndDate', fifteenDays);
  //   }
  // }, [values?.Priority?.value, setValue]);

  const defaultValues = useMemo(
    () => ({
      DispoderName: currentData?.DispoderName || '',
      Customer: customers?.find((customer) => customer?.WIC_ID === currentData?.WICID) || null,
      Priority:
        allPriorities.find((priceList) => priceList.value === currentData?.Priority) || null,
      DispoderDate: currentData?.DispoderDate || null,
      EndDate: currentData?.EndDate || null,
      KAM: allKAMs?.find((kam) => kam.UserID === currentData?.KAM) || null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentData, customers, allKAMs]
  );

  useEffect(() => {
    if (!isLoading && currentData) {
      methods.reset(defaultValues);
    }
  }, [isLoading, defaultValues, methods, currentData]);

  const PostDispoderMasterData = async (opData) => {
    try {
      await Put('UpdateDispoderWithProducts', opData).then(async (res) => {
        if (res.status === 200) {
          // enqueueSnackbar('Created Successfully!');
          // reset();
          // router.push(paths.dashboard.customerClaim.dispoder.root);
        }
      });
    } catch (error) {
      console.log(error);
      if (error.response.status === 400) {
        enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
      } else enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
    }
  };

  const SendApproval = async (yesORno) => {
    // if (!values?.Total_Propose_Quantity) {
    //   enqueueSnackbar('Please add Total Propose Quantity', { variant: 'error' });
    //   return;
    // }
    // if (!values?.Propose_Date) {
    //   enqueueSnackbar('Please add Propose Date', { variant: 'error' });
    //   return;
    // }
    const dataToSend = {
      Dispoder: {
        DispoderID: currentData?.DispoderID,
        DispoderName: values.DispoderName,
        WICID: values.Customer?.WIC_ID,
        Priority: values.Priority?.value,
        KAM: values.KAM?.UserID,
        DispoderDate: formatDate(new Date()),
        EndDate: values.EndDate ? formatDate(values.EndDate) : null,
        UpdatedBy: userData?.userDetails?.userId,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
        IsActive: true,
        // IsDeleted: false,
      },
      Products: dispoderDetails
        ?.filter((detail) => detail?.updated)
        ?.map((detail) => ({
          DispoderProductID: detail?.DispoderProductID || 0,
          DispoderID: currentData?.DispoderID,
          ProductID: detail?.Product?.Product_ID || 0,
          PriceListID: detail?.PriceListID?.PriceListID || 0,
          CompositionID: detail?.Composition_ID?.Composition_ID,
          CountID: detail?.Yarn_Count_ID?.Yarn_Count_ID,
          ColorID: detail?.Color?.ColorID,
          YarnTypeID: detail?.Yarn_Type_ID?.Yarn_Type_ID,
          Quantity: detail?.Quantity,
          Unit_Price: detail?.Unit_Price,
          UOMID: detail?.UOM?.UOM_ID || 0,
          Requirement: detail?.Requirement || null,
          Description: detail?.Description || 'N/A',
          IsActive: true,
          isDeleted: false,
          UpdatedBy: userData?.userDetails?.userId,
          Branch_ID: userData?.userDetails?.branchID,
          Org_ID: userData?.userDetails?.orgId,
        })),
    };

    try {
      await PostDispoderMasterData(dataToSend);

      const respones = await Post(`UpdateDispoderApproval`, {
        DispoderID: currentData?.DispoderID,
        Level: approverData[0]?.Approval_Lvl_ID,
        Approve: yesORno,
        ApprovedOn: fDate(new Date()),
        ApprovedBy: userData?.userDetails?.userId,
        Remarks: values?.ADM_Approved_Remarks || 'N/A',
      });
      if (respones?.status === 200) {
        enqueueSnackbar('Dispoder Approved Successfully', { variant: 'success' });
        const generatedLink = `${APP_URL}${paths.dashboard.InventoryManagement.ItemRequisition.approval(
          currentData?.DispoderID
        )}`;
        const emailData = {
          DispoderID: currentData?.DispoderName,
          EmailTo: 'hasham25525@gmail.com', // or currentData?.EmailAddress
          Subject: 'Dispoder Approved',
          Body: `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .details { background: #f9f9f9; padding: 15px; border-left: 4px solid #5e8a36; margin: 20px 0; }
            .footer { margin-top: 20px; font-size: 12px; color: #7f8c8d; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2 class="header">Dispoder Approved</h2>

            <p>Dear ${currentData?.KAM_Name},</p>

            <p>The following dispoder has been approved and is ready for processing:</p>

            <div class="details">
                <p><strong>Dispoder Name:</strong> ${currentData?.DispoderName}</p>
                <p><strong>Approved By:</strong> ${userData?.userDetails?.userName}</p>
                <p><strong>Approval Date:</strong> ${fDate(new Date())}</p>

            </div>

            <p>You can view the details of the approved dispoder below:</p>

            <table cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                <tr>
                    <td align="center" width="200" height="40" bgcolor="#5e8a36" style="-webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px; color: #ffffff; display: block;">
                        <a href="${generatedLink}" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; line-height: 40px; width: 100%; display: inline-block;">View Dispoder</a>
                    </td>
                </tr>
            </table>

            <p>Please proceed with the next steps in the order process.</p>

            <div class="footer">
                <p>Best regards,<br>${userData?.userDetails?.userName}</p>
            </div>
        </div>
    </body>
    </html>`,
          EmailBy: userData?.userDetails?.userId,
          BranchID: userData?.userDetails?.branchID,
          OrgID: userData?.userDetails?.orgId,
        };
        Post('ProformaInvoice/send', emailData);
        router.push(paths.dashboard.InventoryManagement.ItemRequisition.root);
      }
    } catch (error) {
      console.log('error', error);
    }
  };
  const onSubmit = handleSubmit(async (data) => {
    if (dispoderDetails.length === 0) {
      enqueueSnackbar('Please add at least one dispoder product', { variant: 'error' });
      return;
    }

    const dataToSend = {
      Dispoder: {
        DispoderID: currentData?.DispoderID,
        DispoderName: data.DispoderName,
        WICID: data.Customer?.WIC_ID,
        Priority: data.Priority?.value,
        KAM: data.KAM?.UserID,
        DispoderDate: formatDate(new Date()),
        EndDate: data.EndDate ? formatDate(data.EndDate) : null,
        UpdatedBy: userData?.userDetails?.userId,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
        IsActive: true,
        // IsDeleted: false,
      },
      Products: dispoderDetails?.map((detail) => ({
        DispoderProductID: detail?.DispoderProductID || 0,
        DispoderID: currentData?.DispoderID,
        ProductID: detail?.Product?.Product_ID || 0,
        PriceListID: detail?.PriceListID?.PriceListID || 0,
        CompositionID: detail?.Composition_ID?.Composition_ID,
        CountID: detail?.Yarn_Count_ID?.Yarn_Count_ID,
        ColorID: detail?.Color?.ColorID,
        YarnTypeID: detail?.Yarn_Type_ID?.Yarn_Type_ID,
        Quantity: detail?.Quantity,
        Unit_Price: detail?.Unit_Price,
        Requirement: detail?.Requirement || null,
        Description: detail?.Description || 'N/A',
        IsActive: true,
        isDeleted: false,
        UpdatedBy: userData?.userDetails?.userId,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      })),
    };
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await PostDispoderMasterData(dataToSend);
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
    const addedProductIds = dispoderDetails.map((detail) => detail.Product?.Product_ID);
    return allProducts.filter((product) => !addedProductIds.includes(product.Product_ID));
  }, [dispoderDetails, allProducts]);

  // const getAvailableProducts = () => {
  //   const addedProductIds = dispoderDetails.map((detail) => detail.Product?.Product_ID);
  //   return allProducts.filter((product) => !addedProductIds.includes(product.Product_ID)) || null;
  // };

  const handleAddDetail = () => {
    // if (!values.Requirement) {
    //   enqueueSnackbar('Product Requirement is required', { variant: 'error' });
    //   return;
    // }
    // if (
    //   dispoderDetails.find(
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
    // if (!values?.Yarn_Type_ID) {
    //   enqueueSnackbar('Yarn Type is required', { variant: 'error' });
    //   return;
    // }
    // if (!values?.Yarn_Count_ID) {
    //   enqueueSnackbar('Yarn Type is required', { variant: 'error' });
    //   return;
    // }
    // if (!values?.Color) {
    //   enqueueSnackbar('Yarn Color is required', { variant: 'error' });
    //   return;
    // }
    // if (!values?.Composition_ID) {
    //   enqueueSnackbar('Yarn Compisition is required', { variant: 'error' });
    //   return;
    // }
    // // if (!values?.UOM) {
    // //   enqueueSnackbar('Unit of Measure is required', { variant: 'error' });
    // //   return;
    // // }
    // if (!values.Quantity) {
    //   enqueueSnackbar('Quantity is required', { variant: 'error' });
    //   return;
    // }
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

    if (editingIndex !== null) {
      // Update existing detail
      const updatedDetails = [...dispoderDetails];
      updatedDetails[editingIndex] = {
        Product: values.Product,
        DispoderProductID: updatedDetails[editingIndex]?.DispoderProductID || 0,
        Quantity: values.Quantity,
        Unit_Price: values.Unit_Price,
        PriceListID: values?.PriceListID || 0,
        Requirement: generateProductName() || null,
        Description: values.Description || 'N/A',
        Yarn_Type_ID: values?.Yarn_Type_ID,
        Yarn_Count_ID: values?.Yarn_Count_ID,
        Color: values?.Color,
        Composition_ID: values?.Composition_ID,
        UOM: values?.UOM,
        updated: true,
      };
      setDispoderDetails(updatedDetails);
    } else {
      // Add new detail
      setDispoderDetails((prev) => [
        ...prev,
        {
          DispoderProductID: 0,
          Requirement: generateProductName() || null,
          Description: values.Description || 'N/A',
          Product: selectedProduct,
          Quantity: values.Quantity,
          Unit_Price: values.Unit_Price,
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
    setValue('PriceListID', null);
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
    setValue('UOM', null);
    setEditingIndex(null);
  };
  const handleEditDetail = (index) => {
    const detail = dispoderDetails[index];
    console.log(detail);
    // setValue('Product', detail.Product);
    setValue('Quantity', detail.Quantity);
    setValue('Unit_Price', detail.Unit_Price);
    setValue('Description', detail.Description);

    setValue('PriceListID', detail.PriceListID);
    setValue(
      'Yarn_Type_ID',
      allTypes.find((product) => product.Yarn_Type_ID === detail.Yarn_Type_ID?.Yarn_Type_ID)
    );
    setValue(
      'Yarn_Count_ID',
      allCounts.find((product) => product.Yarn_Count_ID === detail.Yarn_Count_ID?.Yarn_Count_ID)
    );
    setValue(
      'Color',
      allColors.find((product) => product.ColorID === detail.Color?.ColorID)
    );
    setValue(
      'Composition_ID',
      allCompositions.find(
        (product) => product.Composition_ID === detail.Composition_ID?.Composition_ID
      )
    );
    setValue('UOM', detail?.UOM || null);

    setEditingIndex(index);
  };

  // Table Heads
  const DetailsTableHead = approverData[0]?.Approval_Lvl_ID === 2
    ? [
        { id: 'Requirement', label: 'Product Requirment', minWidth: 240 },
        { id: 'Description', label: 'Product Description', minWidth: 240 },
        // { id: 'Product_Name', label: 'Pricelist Product', minWidth: 200 },
        { id: 'Quantity', label: 'Quantity', align: 'center' },
        { id: 'Unit_Price', label: 'Customer Target Price', align: 'center', minWidth: 120 },
        { id: 'Actions', label: 'Actions', width: 88 },
      ]
    : [
        { id: 'Requirement', label: 'Product Requirment', minWidth: 240 },
        { id: 'Description', label: 'Product Description', minWidth: 240 },
        // { id: 'Product_Name', label: 'Pricelist Product', minWidth: 200 },
        { id: 'Quantity', label: 'Quantity', align: 'center' },
        { id: 'Unit_Price', label: 'Customer Target Price', align: 'center', minWidth: 120 },
        // { id: 'Actions', label: 'Actions', width: 88 },
      ];

  // Table
  const table = useTable();

  const notFound = !dispoderDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = dispoderDetails.filter((row) => row !== rowToDelete);
    setDispoderDetails(updatedDetails);

    // If we're deleting the row being edited, reset the form
    if (editingIndex !== null && dispoderDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);
      setValue('Product', null);
      setValue('Quantity', null);
      setValue('Unit_Price', null);
      setValue('PriceListID', null);
      setValue('Yarn_Type_ID', null);
      setValue('Yarn_Count_ID', null);
      setValue('Color', null);
      setValue('UOM', null);
      setValue('Composition_ID', null);
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
  const unit = 'KG';
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
              <h3>Dispoder:</h3>
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
                <RHFTextField name="DispoderName" label="Dispoder Name" fullWidth disabled />

                <RHFAutocomplete
                  name="Customer"
                  label="Customer"
                  placeholder="Choose an option"
                  fullWidth
                  options={customers}
                  getOptionLabel={(option) => option?.WIC_Name}
                  value={values.Customer || null}
                  disabled
                />
                <RHFAutocomplete
                  name="Priority"
                  label="Priority"
                  placeholder="Choose an option"
                  fullWidth
                  options={allPriorities}
                  getOptionLabel={(option) => option?.label}
                  value={values.Priority || null}
                  disabled
                />

                {/* <Controller
                   name="DispoderDate"
                   control={control}
                   render={({ field, fieldState: { error } }) => (
                     <DesktopDatePicker
                       {...field}
                       label="Start Date"
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
                  name="EndDate"
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
            </Card>

            <Card sx={{ p: 3, mt: 2 }}>
              <Box sx={{ width: '100%' }}>
                <h3>Dispoder Products: </h3>
                {editingIndex !== null && (
                  <>
                    <Box
                      rowGap={3}
                      columnGap={2}
                      display="grid"
                      gridTemplateColumns={{
                        xs: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                      }}
                    >
                      {/* <RHFAutocomplete
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
                      /> */}
                      <RHFTextField
                        name="Requirement"
                        label="Product Requirement"
                        variant="outlined"
                        disabled
                        fullWidth
                        value={generateProductName() || ''}
                      />
                      {/* <RHFTextField
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

                      <RHFTextField
                        name="Quantity"
                        label="Quantity"
                        type="number"
                        variant="outlined"
                        fullWidth
                        value={values.Quantity || ''}
                      /> */}
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
                  </>
                )}

                {dispoderDetails.length > 0 && (
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
                        {dispoderDetails.map((row, index) => (
                          <DetailTableRow
                            key={index}
                            row={row}
                            onDeleteRow={() => DeleteDetailTableRow(row)}
                            onEditRow={() => handleEditDetail(index)}
                            currentData={currentData}
                            forApproval={approverData[0]?.Approval_Lvl_ID === 2}
                          />
                        ))}

                        <TableEmptyRows
                          height={denseHeight}
                          emptyRows={emptyRows(
                            table.page,
                            table.rowsPerPage,
                            dispoderDetails.length
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

            {canApprove && (
              <Card sx={{ p: 3, mt: 2 }}>
                <Box sx={{ width: '100%' }}>
                  {/* eslint-disable-next-line */}
                  <>
                    <h3>Dispoder Approval:</h3>
                    <Box
                      rowGap={3}
                      columnGap={2}
                      display="grid"
                      gridTemplateColumns={{
                        xs: 'repeat(1, 1fr)',
                        sm: 'repeat(2, 1fr)',
                      }}
                    >
                      {/* <RHFTextField
                        name="Total_Propose_Quantity"
                        label="Total Propose Quantity (KG)"
                        type="number"
                      />

                      <Controller
                        name="Propose_Date"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <DesktopDatePicker
                            {...field}
                            label="Proposed Date"
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
                      <RHFTextField
                        name="ADM_Approved_Remarks"
                        label="Remarks (Optional)"
                        type="text"
                        multiline
                        rows={4}
                        variant="outlined"
                        fullWidth
                      />
                    </Box>
                  </>
                </Box>
              </Card>
            )}
            {waitForLevel1 && (
              <Typography variant="h6" align="center" sx={{ mt: 2, color: 'gray' }}>
                Please wait for the approval from the Level 1 Approver.
              </Typography>
            )}
            <Box display="flex" justifyContent="end" alignItems="flex-end" gap={2} sx={{ mt: 3 }}>
              {/* eslint-disable-next-line */}
              {canApprove && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <LoadingButton
                    variant="outlined"
                    onClick={() => SendApproval('R')}
                    color="error"
                    disabled={waitForLevel1}
                    loading={isApproving}
                  >
                    Reject
                  </LoadingButton>
                  <LoadingButton
                    onClick={() => SendApproval('A')}
                    variant="contained"
                    color="primary"
                    disabled={waitForLevel1}
                    loading={isApproving}
                  >
                    Approve
                  </LoadingButton>
                </Box>
              )}
              {/* <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
              >
                Save
              </LoadingButton> */}
            </Box>
            {/* <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
              >
                Save
              </LoadingButton>
            </Stack> */}
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

ItemRequisitionApprovalForm.propTypes = {
  currentData: PropTypes.any,
};
