import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get, Post, Put } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Button,
  Divider,
  Card,
  Autocomplete,
  Tab,
  Tabs,
  alpha,
} from '@mui/material';
import { Stack } from '@mui/system';
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import _, { sumBy } from 'lodash'; // or use structuredClone
import { fNumber, fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import InvoiceAnalytic from './invoice-analytic';
import { useTheme } from '@emotion/react';
import { ConfirmDialog } from 'src/components/custom-dialog';
import RptDialog from './ReportDialog';
import { DatePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

// const getLeadTimeInDays = (start, end) => {
//   const startDate = new Date(start);
//   const endDate = new Date(end);

//   if (Number.isNaN(startDate) || Number.isNaN(endDate)) return ''; // Handle invalid dates

//   const diffTime = endDate - startDate;
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   return diffDays;
// };

const KgtoLbs = (kg) => {
  const lbs = kg * 2.20462;
  return lbs.toFixed(2);
};

// shoule alway be greater than 0 else return 0
const getLeadTimeInDays = (start, end) => {
  const diff = new Date(end) - new Date(start);
  if (diff > 0) {
    return Math.ceil(diff / 86400000);
  }
  return 0;
};

const SampleRequestGrid = () => {
  const settings = useSettingsContext();
  const theme = useTheme();
  const router = useRouter();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const gridRef = useRef();

  const { enqueueSnackbar } = useSnackbar();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setfetchLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [originalData, setOriginalData] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [detailedData, setDetailedData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [changedRows, setChangedRows] = useState([]);
  const [operationStatusOptions, setOperationStatusOptions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Total Samples');

  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    type: null, // 'master' or 'detail'
    id: null, // ID of record to delete
  });
  const statusValues = ['P', 'A', 'R']; // Pending, Approved, Rejected
  const statusDisplayMap = {
    P: 'Pending',
    A: 'Approved',
    R: 'Rejected',
  };
  const statusStyleMap = {
    P: { color: '#ff9800', fontWeight: 'bold' },
    A: { color: '#4caf50', fontWeight: 'bold' },
    R: { color: '#f44336', fontWeight: 'bold' },
  };

  // Filter options
  const filterOptions = [
    { label: 'Total', value: 'total' },
    { label: 'Current Year', value: 'currentYear' },
    { label: 'Current Month', value: 'currentMonth' },
    { label: 'Custom Date Range', value: 'custom' },
  ];
  const filterTypeOptions = [
    { label: 'All Types', value: 'all' },
    { label: 'RnD', value: 'R' },
    { label: 'Independent', value: 'I' },
    { label: 'From Quotation', value: 'Q' },
    { label: 'From PI', value: 'P' },
  ];

  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
  const [selectedSampleType, setSelectedSampleType] = useState(filterTypeOptions[0]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedOPStatus, setSelectedOPStatus] = useState('all');

  // OPStatus filter options
  const opStatusOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Status' }];
    operationStatusOptions.forEach((opt) => {
      options.push({ value: opt.OPStatus, label: opt.OPStatus });
    });
    return options;
  }, [operationStatusOptions]);

  // Filter data based on selected filter options
  const filterData = useCallback(
    (data, filterType, sampleType, fromDateVal, toDateVal, opStatus) => {
      let filteredData = [...data];

      // Filter by date range
      if (filterType === 'custom') {
        filteredData = filteredData.filter((item) => {
          const createdDate = new Date(item.CreatedDate);

          // Case 1: Both dates provided
          if (fromDateVal && toDateVal) {
            return createdDate >= fromDateVal && createdDate <= toDateVal;
          }
          // Case 2: Only from date provided
          // eslint-disable-next-line
          else if (fromDateVal) {
            return createdDate >= fromDateVal;
          }
          // Case 3: Only to date provided
          // eslint-disable-next-line
          else if (toDateVal) {
            return createdDate <= toDateVal;
          }
          // Case 4: No dates provided - return all data
          return true;
        });
        // eslint-disable-next-line
      } else if (filterType === 'currentYear') {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), 0, 1);
        const endDate = new Date(now.getFullYear(), 11, 31);
        filteredData = filteredData.filter((item) => {
          const createdDate = new Date(item.CreatedDate);
          return createdDate >= startDate && createdDate <= endDate;
        });
        // eslint-disable-next-line
      } else if (filterType === 'currentMonth') {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        filteredData = filteredData.filter((item) => {
          const createdDate = new Date(item.CreatedDate);
          return createdDate >= startDate && createdDate <= endDate;
        });
      }

      // Filter by sample type
      if (sampleType !== 'all') {
        filteredData = filteredData.filter((item) => item.isRND === sampleType);
      }

      // Filter by operations status
      if (opStatus && opStatus !== 'all') {
        filteredData = filteredData.filter((item) => item.OPStatus === opStatus);
      }

      return filteredData;
    },
    []
  );

  // Fetch sample request details
  const fetchSampleRequests = useCallback(async () => {
    if (selectedFilter.value === 'custom' && (!fromDate || !toDate)) {
      return;
    }
    try {
      setfetchLoading(true);
      const operationStatusResponse = await Get(`OperationsStatus/GetAll`);
      if (operationStatusResponse.status === 200) {
        setOperationStatusOptions(operationStatusResponse.data);
      }

      // Fetch new API data (flat structure with Mst_ and Dtl_ prefixes)
      const response = await Get(
        `GetSampleAgGridRequests?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200) {
        const approverResponse = await Get(
          `getDocumentApproverByID?&ApproverID=${userData?.userDetails?.userId}&DocID=3`
        );

        let approverData = approverResponse?.data || [];
        if (approverResponse?.data?.Data) {
          approverData = approverResponse?.data?.Data || [];
        }

        if (approverData.length > 0) {
          setCanEdit(true);
        }

        // Transform flat data into combined rows (master + detail in single row)
        const kamApprMap = new Map(); // Track KAM approval per master

        // First pass: track KAM approval
        response.data.forEach((row) => {
          const masterId = row.Mst_Sample_Request_ID;
          const kamAppr = userData?.userDetails?.userId === row.Mst_KAM;

          if (!kamApprMap.has(masterId)) {
            kamApprMap.set(masterId, kamAppr);
          }
        });

        // Second pass: create flat rows combining master and detail data
        const flatRows = response.data.map((row) => {
          const masterId = row.Mst_Sample_Request_ID;
          const kamAppr = kamApprMap.get(masterId) || false;

          // lead time will be the difference between delivery date and sample request date
          const leadTime = getLeadTimeInDays(row.Mst_Sample_Request_Date, row.Mst_Delivery_Date);
          // console.log("LeadTime", LeadTime);
          return {
            // Master fields
            Sample_Request_ID: row.Mst_Sample_Request_ID,
            Sample_Code: row.Mst_Sample_Code,
            Sample_Name: row.Mst_Sample_Name,
            PINO: row.Mst_PINO,
            PI_ID: row.Mst_PI_ID,
            WIC_ID: row.Mst_WIC_ID,
            WIC_Name: row.Mst_WIC_Name,
            WIC_Address: row.Mst_WIC_Address,
            Propose_Date: row.Mst_Propose_Date,
            Total_Propose_Sample: row.Mst_Total_Propose_Sample,
            End_CustomerID: row.Mst_End_CustomerID,
            End_Cust_Name: row.Mst_End_Cust_Name,
            Agent_Name: row.Mst_Agent_Name,
            Cust_Name: row.Mst_Cust_Name,
            Cust_Address1: row.Mst_Cust_Address1,
            Cust_Address2: row.Mst_Cust_Address2,
            Cust_Landline_No: row.Mst_Cust_Landline_No,
            Payment_TermID: row.Mst_Payment_TermID,
            Payment_Term: row.Mst_Payment_Term,
            Opportunity_ID: row.Mst_Opportunity_ID,
            Quotation_ID: row.Mst_Quotation_ID,
            isRND: row.Mst_isRND,
            Sample_Request_Date: row.Mst_Sample_Request_Date,
            Delivery_Date: row.Mst_Delivery_Date,
            LeadTime: leadTime,
            Remarks: row.Mst_Remarks,
            Status: row.Mst_Status,
            isActive: row.Mst_isActive,
            isDeleted: row.Mst_isDeleted,
            ADM_Approve: row.Mst_ADM_Approve,
            CreatedBy: row.Mst_CreatedBy,
            CreatedDate: new Date(row.Mst_CreatedDate),
            UpdatedBy: row.Mst_UpdatedBy,
            UpdatedDate: row.Mst_UpdatedDate,
            Branch_ID: row.Mst_Branch_ID,
            Org_ID: row.Mst_Org_ID,
            KAM: row.Mst_KAM,
            KAMName: row.Mst_KAMName,
            EmailAddress: row.Mst_KAMEmail,

            // Detail fields
            RecipePictureURL: row.RecipePictureURL,
            Sample_Req_Dtl_ID: row.Dtl_Sample_Req_Dtl_ID,
            Sample_Req_ID: row.Dtl_Sample_Req_ID,
            ItemCode: row.Dtl_ItemCode,
            Product_Composed_Name: row.Dtl_Product_Composed_Name,
            ConversionRate: row.Dtl_ConversionRate,
            Sample_Type_ID: row.Dtl_Sample_TypeID,
            Priority_CategoryID: row.Dtl_Priority_CategoryID,
            Priority_Category: row.Dtl_Priority_Category,
            Process_Status: row.Dtl_Process_Status,
            Quantity: row.Dtl_Quantity,
            QtyInLBS: row.Dtl_QtyInLBS,
            ColorID: row.Dtl_ColorID,
            ColorName: row.Dtl_ColorName,
            Color_Code: row.Dtl_Color_Code,
            Yarn_TypeID: row.Dtl_Yarn_TypeID,
            Yarn_Type: row.Dtl_Yarn_Type,
            UOMID: row.Dtl_UOMID,
            UOMName: row.Dtl_UOMName,
            Price: row.Dtl_Price,
            YarnCountID: row.Dtl_YarnCountID,
            Yarn_Count_Name: row.Dtl_Yarn_Count_Name,
            DiscountPrice: row.Dtl_DiscountPrice,
            DiscountPriceInPercent: row.Dtl_DiscountPriceInPercent,
            CurrencyID: row.Dtl_CurrencyID,
            Currency_Name: row.Dtl_Currency_Name,
            Cost: row.Dtl_Cost,
            TotalAmount: row.Dtl_TotalAmount,
            TotalAmountinBDT: row.Dtl_TotalAmountinBDT,
            DetailRemarks: row.Dtl_DetailRemarks,
            Fabric_TypeID: row.Dtl_Fabric_TypeID,
            Fabric_Types: row.Dtl_Fabric_Types,
            Composition_ID: row.Dtl_Composition_ID,
            Composition_Name: row.Dtl_Composition_Name,
            ConeQty: row.Dtl_ConeQty,
            EstimatedDeliveryDate: row.Dtl_EstimatedDeliveryDate,
            ApprovalStatus: row.Dtl_ApprovalStatus,
            ApprovedBy: row.Dtl_ApprovedBy,
            ApprovedOn: row.Dtl_ApprovedOn,
            Reason: row.Dtl_Reason,
            KAMApprovalStatus: row.Dtl_KAMApprovalStatus,
            KAMReason: row.Dtl_KAMReason,
            KAMApprovedBy: row.Dtl_KAMApprovedBy,
            KAMApproveOn: row.Dtl_KAMApproveOn,
            CustomerFB: row.Dtl_CustomerFB,
            CustomerFeedBackOn: row.Dtl_CustomerFeedBackOn,
            OPStatusID: row.Dtl_OPStatusID,
            OPStatus: row.Dtl_OPStatusName,
            OPStatusDate: row.Dtl_OPStatusDate,
            OPStatusUpdateByName: row.OPstatusbyName,

            kamEdit: kamAppr,
          };
        });

        // Calculate status for each master group (group by Sample_Request_ID)
        const statusMap = new Map();
        flatRows.forEach((row) => {
          const masterId = row.Sample_Request_ID;
          if (!statusMap.has(masterId)) {
            statusMap.set(masterId, []);
          }
          statusMap.get(masterId).push(row.ApprovalStatus);
        });

        // Update status for all rows in each master group
        const dataWithStatus = flatRows.map((row) => {
          const masterId = row.Sample_Request_ID;
          const detailStatuses = statusMap.get(masterId) || [];
          const allApproved = detailStatuses.every((status) => status === 'A');
          const allRejected = detailStatuses.every((status) => status === 'R');

          let masterStatus = 'Pending';
          if (allApproved) {
            masterStatus = 'Approved';
          } else if (allRejected) {
            masterStatus = 'Rejected';
          } else if (detailStatuses.some((status) => status === 'A')) {
            masterStatus = 'Partially Approved';
          }

          return {
            ...row,
            Status: masterStatus,
          };
        });

        // Also prepare data for detailed report
        const updatedData = dataWithStatus.map((item) => ({
          Sample_Name: item.Sample_Name,
          Sample_Reference_No: item.Sample_Code,
          WIC_ID: item.WIC_ID,
          Customer_Name: item.WIC_Name,
          Main_Buyer: item.End_Cust_Name,
          Agent_Name: item.Agent_Name,
          Yarn_Type: item.Yarn_Type,
          Yarn_Count: item.Yarn_Count_Name,
          Color: item.ColorName,
          Color_Code: item.Color_Code,
          CreatedDate: item.CreatedDate,
          Product_Description: item.Product_Composed_Name,
          Unit: item.UOMName,
          Cost_Per_Unit_KG: item.Cost,
          Cost_Per_Unit_LBs: KgtoLbs(item.Cost),
          Sample_Quantity_KG: item.Quantity,
          Sample_Quantity_LBs: item.QtyInLBS,
          Total_Sample_Cost: item.TotalAmount,
          isFG: item.isRND === 'R',
          Sample_Type: item.Priority_Category,
          Customer_Requested_Delivery_Date: item.Sample_Request_Date,
          Fabric_Type: item.Fabric_Types,
          Comments_From_Sales_Team: item.Remarks,
          Sample_Comments_From_PD_Team: item.DetailRemarks,
          Delivery_Status: item.Process_Status,
          Sample_Delivery_Date: item.Delivery_Date,
          // Sample_Development_Lead_time: `${getLeadTimeInDays(
          //   item.Sample_Request_Date,
          //   item.Delivery_Date
          // )} Days`,
          KAMApprovalStatus:
            item.KAMApprovalStatus === 'A'
              ? 'Approved'
              : item?.KAMApprovalStatus === 'R'
                ? 'Rejected'
                : 'Pending',
          ApprovalStatus:
            item.ApprovalStatus === 'A'
              ? 'Approved'
              : item?.ApprovalStatus === 'R'
                ? 'Rejected'
                : 'Pending',
          Approval_Remarks: item?.Reason,
          ApprovedOn: item?.ApprovedOn,
          CustomerFB: item?.CustomerFB || '',
          LeadTime: item?.LeadTime,
        }));

        const filteredDetailData = filterData(
          updatedData,
          selectedFilter.value,
          selectedSampleType.value,
          fromDate,
          toDate,
          selectedOPStatus
        );
        setDetailedData(filteredDetailData);

        const filteredData = filterData(
          dataWithStatus,
          selectedFilter.value,
          selectedSampleType.value,
          fromDate,
          toDate,
          selectedOPStatus
        );
        setRowData(filteredData);
        const clonedData = _.cloneDeep(dataWithStatus);
        console.log(
          'Setting originalData - First 3 rows OPStatus values:',
          clonedData.slice(0, 3).map((row) => ({
            Sample_Req_Dtl_ID: row.Sample_Req_Dtl_ID,
            OPStatus: row.OPStatus,
            OPStatusID: row.OPStatusID,
            OPStatusDate: row.OPStatusDate,
            OPStatusUpdateByName: row.OPStatusUpdateByName,
          }))
        );
        setOriginalData(clonedData);
      } else {
        setRowData([]);
        setOriginalData([]);
        enqueueSnackbar(response.data.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load sample requests', { variant: 'error' });
      setRowData([]);
      setOriginalData([]);
    } finally {
      setfetchLoading(false);
    }

    // eslint-disable-next-line
  }, [
    enqueueSnackbar,
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    userData?.userDetails?.userId,
    selectedFilter.value,
    selectedSampleType.value,
    fromDate,
    toDate,
    filterData,
  ]);

  useEffect(() => {
    fetchSampleRequests();
  }, [fetchSampleRequests]);

  // Update filtered data when filter changes
  useEffect(() => {
    if (originalData.length > 0) {
      const filteredData = filterData(
        originalData,
        selectedFilter.value,
        selectedSampleType.value,
        fromDate,
        toDate,
        selectedOPStatus
      );
      setRowData(filteredData);
    }
  }, [
    selectedFilter.value,
    selectedSampleType.value,
    fromDate,
    toDate,
    selectedOPStatus,
    originalData,
    filterData,
  ]);

  // Calculate data for tab counts (filtered by everything except OPStatus)
  const dataForTabCounts = useMemo(() => {
    if (originalData.length === 0) return [];

    let data = originalData;

    // Apply master status filter
    if (selectedStatus !== 'Total Samples') {
      if (selectedStatus === 'Approved') {
        data = data.filter((item) => item.ApprovalStatus === 'A');
      } else if (selectedStatus === 'Rejected') {
        data = data.filter((item) => item.ApprovalStatus === 'R');
      } else if (selectedStatus === 'Pending') {
        data = data.filter((item) => item.ApprovalStatus !== 'A' && item.ApprovalStatus !== 'R');
      }
    }

    return filterData(
      data,
      selectedFilter.value,
      selectedSampleType.value,
      fromDate,
      toDate,
      'all' // Don't filter by OPStatus for counts
    );
  }, [originalData, selectedFilter.value, selectedSampleType.value, fromDate, toDate, filterData, selectedStatus]);

  // Reset date pickers when filter changes from custom
  useEffect(() => {
    if (selectedFilter.value !== 'custom') {
      setFromDate(null);
      setToDate(null);
    }
  }, [selectedFilter.value]);

  // Reset changed rows when data is refreshed
  useEffect(() => {
    setChangedRows([]);
  }, [originalData]);

  // Handler for OPStatus tab change
  const handleOPStatusFilter = useCallback((event, newValue) => {
    setSelectedOPStatus(newValue);
  }, []);

  // Get color for OPStatus
  const getOPStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'warning'; // Orange
      case 'Packing':
        return 'info'; // Blue
      case 'Hand over to Store':
        return 'success'; // Green
      case 'Delivered':
        return 'success'; // Green
      default:
        return 'default';
    }
  };

  const updateCustomerFeedback = async (sampleReqDtlId, customerFeedback) => {
    try {
      const response = await Put(`UpdateCustomerFeedback`, {
        CustomerFB: customerFeedback,
        UpdatedBy: userData?.userDetails?.userId,
        Sample_Req_Dtl_ID: sampleReqDtlId,
      });

      if (response.status === 200) {
        enqueueSnackbar('Customer feedback updated successfully', { variant: 'success' });
        return true;
      }

      enqueueSnackbar(response.data?.Message || 'Failed to update customer feedback', {
        variant: 'error',
      });
      return false;
    } catch (error) {
      console.error('Error updating customer feedback:', error);
      enqueueSnackbar(error.message || 'Failed to update customer feedback', { variant: 'error' });
      return false;
    }
  };

  const onCustomerFeedbackChange = useCallback(async (params) => {
    if (params.oldValue !== params.newValue) {
      try {
        await updateCustomerFeedback(params.data.Sample_Req_Dtl_ID, params.newValue);

        // Update the local state to reflect the change (flat data structure)
        setRowData((prevData) =>
          prevData.map((row) => {
            if (row.Sample_Req_Dtl_ID === params.data.Sample_Req_Dtl_ID) {
              return { ...row, CustomerFB: params.newValue };
            }
            return row;
          })
        );
      } catch (error) {
        // Revert the cell value if the API call fails
        // params.node.setDataValue(params.colDef.field, params.oldValue);
      }
    }
    // eslint-disable-next-line
  }, []);

  // Handle cell value changes for flat grid
  const handleCellValueChanged = useCallback(
    (params) => {
      if (params.colDef.field === 'CustomerFB') {
        onCustomerFeedbackChange(params);
        return;
      }

      // If OPStatus changed, also update OPStatusID
      if (params.colDef.field === 'OPStatus') {
        console.log('OPStatus changed in grid:', {
          oldValue: params.oldValue,
          newValue: params.newValue,
          Sample_Req_Dtl_ID: params.data.Sample_Req_Dtl_ID,
          availableOptions: operationStatusOptions,
        });

        if (params.newValue) {
          const slctdStatus = operationStatusOptions.find(
            (opt) => opt.OPStatus === params.newValue
          );
          console.log('Found selectedStatus:', slctdStatus);

          if (slctdStatus) {
            params.node.setDataValue('OPStatusID', slctdStatus.OPStatusID);
            console.log('Set OPStatusID to:', slctdStatus.OPStatusID);
          } else {
            console.warn('No matching status found for:', params.newValue);
          }
        }
      }

      // Track changes for save functionality
      setChangedRows((prev) => {
        const existingIndex = prev.findIndex(
          (row) => row.Sample_Req_Dtl_ID === params.data.Sample_Req_Dtl_ID
        );

        // Create a deep copy with the change metadata
        const updatedRow = { ...params.data };

        // If this is an OPStatus change, store the original values for comparison
        if (params.colDef.field === 'OPStatus') {
          updatedRow._originalOPStatus = params.oldValue;
          updatedRow._originalOPStatusID = originalData.find(
            (r) => r.Sample_Req_Dtl_ID === params.data.Sample_Req_Dtl_ID
          )?.OPStatusID;
          updatedRow._opStatusChanged = true;
        }

        if (existingIndex >= 0) {
          const updated = [...prev];
          // Preserve the original OPStatus metadata if it exists
          if (updated[existingIndex]._opStatusChanged) {
            updatedRow._originalOPStatus = updated[existingIndex]._originalOPStatus;
            updatedRow._originalOPStatusID = updated[existingIndex]._originalOPStatusID;
            updatedRow._opStatusChanged = true;
          }
          updated[existingIndex] = updatedRow;
          return updated;
        }
        return [...prev, updatedRow];
      });
    },
    [onCustomerFeedbackChange, operationStatusOptions, originalData]
  );

  // Master delete API function
  const deleteMasterRecord = async (sampleRequestId) => {
    try {
      const response = await Put(`DeleteSampleRequest`, {
        isDeleted: 1,
        UpdatedBy: userData?.userDetails?.userId, // Assuming you have userData
        Sample_Request_ID: sampleRequestId,
      });
      return response;
    } catch (error) {
      console.error('Error deleting master record:', error);
      throw error;
    }
  };

  // Detail delete API function
  const deleteDetailRecord = async (sampleReqDtlId) => {
    try {
      const response = await Put(`DeleteSampleReqDtl`, {
        isDeleted: 1,
        UpdatedBy: userData?.userDetails?.userId,
        Sample_Req_Dtl_ID: sampleReqDtlId,
      });
      return response;
    } catch (error) {
      console.error('Error deleting detail record:', error);
      throw error;
    }
  };

  const handleMasterDelete = (sampleRequestId) => {
    setDeleteConfirm({
      open: true,
      type: 'master',
      id: sampleRequestId,
    });
  };
  const handleMasterPDF = (sampleRequestId) => {
    router.push(paths.dashboard.transaction.sample.pdf(sampleRequestId));
  };

  const handleMasterEdit = (sampleRequestId) => {
    router.push(paths.dashboard.transaction.sample.edit(sampleRequestId));
  };

  const handleDetailDelete = (sampleReqDtlId) => {
    setDeleteConfirm({
      open: true,
      type: 'detail',
      id: sampleReqDtlId,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);

      if (deleteConfirm.type === 'master') {
        await deleteMasterRecord(deleteConfirm.id);
        enqueueSnackbar('Sample request deleted successfully', { variant: 'success' });
      } else {
        await deleteDetailRecord(deleteConfirm.id);
        enqueueSnackbar('Sample item deleted successfully', { variant: 'success' });
      }

      fetchSampleRequests(); // Refresh data
    } catch (error) {
      enqueueSnackbar(
        `Failed to delete ${deleteConfirm.type === 'master' ? 'sample request' : 'sample item'}`,
        {
          variant: 'error',
        }
      );
    } finally {
      setLoading(false);
      setDeleteConfirm({ open: false, type: null, id: null });
    }
  };

  // Get changed data function
  const getChangedData = (orgData, currentData) => {
    const changedDetails = [];

    currentData.forEach((master) => {
      const originalMaster = orgData.find((o) => o.Sample_Request_ID === master.Sample_Request_ID);

      if (!originalMaster) {
        // New master with all details
        changedDetails.push(...master.Details);
        return;
      }

      master.Details.forEach((detail) => {
        const originalDetail = originalMaster.Details.find(
          (od) => od.Sample_Req_Dtl_ID === detail.Sample_Req_Dtl_ID
        );

        if (!originalDetail) {
          // New detail
          changedDetails.push(detail);
        } else {
          // Check if any editable field has changed
          const editableFields = [
            'EstimatedDeliveryDate',
            'Delivery_Date',
            'KAMApprovalStatus',
            'KAMReason',
            'ApprovalStatus',
            'Reason',
          ];

          const hasChanges = editableFields.some((field) => {
            const currentValue = detail[field];
            const originalValue = originalDetail[field];

            // Handle date comparison
            if (field === 'EstimatedDeliveryDate' || field === 'Delivery_Date') {
              return (
                new Date(currentValue || '').getTime() !== new Date(originalValue || '').getTime()
              );
            }

            return currentValue !== originalValue;
          });

          if (hasChanges) {
            changedDetails.push(detail);
          }
        }
      });
    });

    return changedDetails;
  };

  // Image renderer for recipe pictures (supports images and PDFs)
  const imageRenderer = (params) => {
    if (!params.value) {
      return (
        <img
          src='/assets/images/no-image.jpg.jpg'
          alt="Recipe"
          loading='lazy'
          style={{
            width: '30px',
            height: '30px',
            objectFit: 'cover',
            borderRadius: '4px',
            cursor: 'pointer',
            border: '1px solid #ddd',
          }}
        />
      );
    }

    // Check if the URL is a PDF
    const isPdf = params.value.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      return (
        <Tooltip title="View PDF" arrow>
          {/* eslint-disable-next-line */}
          <div
            style={{
              width: '30px',
              height: '30px',
              backgroundColor: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              cursor: 'pointer',
              border: '1px solid #ddd',
            }}
            onClick={() => window.open(params.value, '_blank')}
          >
            <Iconify icon="mdi:file-pdf-box" width={24} style={{ color: '#d32f2f' }} />
          </div>
        </Tooltip>
      );
    }

    return (
      <Tooltip title="View Image" arrow>
        {/* eslint-disable-next-line */}
        <img
          src={params.value}
          alt="Recipe"
          style={{
            width: '30px',
            height: '30px',
            objectFit: 'cover',
            borderRadius: '4px',
            cursor: 'pointer',
            border: '1px solid #ddd',
          }}
          onClick={() => window.open(params.value, '_blank')}
        />
      </Tooltip>
    );
  };


  // Submit changes to the API
  const handleSubmitChanges = useCallback(async () => {
    if (changedRows.length === 0) {
      enqueueSnackbar('No changes to save', { variant: 'info' });
      return;
    }

    try {
      setLoading(true);
      console.log('Changed rows to save:', changedRows);

      const promises = changedRows.map(async (rw) => {
        const estimatedDeliveryDate = rw.EstimatedDeliveryDate
          ? new Date(rw.EstimatedDeliveryDate)
            .toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
            })
            .toUpperCase()
            .replace(/,/g, '')
          : '';
        const SampleReadyDate = rw.Delivery_Date
          ? new Date(rw.Delivery_Date)
            .toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
            })
            .toUpperCase()
            .replace(/,/g, '')
          : '';
        const approvalStatus = rw?.ApprovalStatus || 'P';

        // Check if OPStatus has changed using the stored metadata
        const opStatusChanged = rw._opStatusChanged || false;
        const newStatus = rw.OPStatus;

        console.log('OPStatus Check:', {
          sampleReqDtlId: rw.Sample_Req_Dtl_ID,
          originalStatus: rw._originalOPStatus,
          newStatus: rw.OPStatus,
          originalStatusID: rw._originalOPStatusID,
          newStatusID: rw.OPStatusID,
          opStatusChanged,
          opStatusChangedFlag: rw._opStatusChanged,
          conditionResult: opStatusChanged && newStatus,
        });

        // Track whether we need to make KAM/Sample approval calls
        let approvalResponse = null;

        // If OPStatus changed, call UpdateTracking API
        if (opStatusChanged && newStatus) {
          console.log('Condition passed! Looking for selectedStatus...');
          const selctedStatus = operationStatusOptions.find((opt) => opt.OPStatus === rw.OPStatus);
          console.log('Calling UpdateTracking API:', {
            selctedStatus,
            OPStatus: rw.OPStatus,
            availableOptions: operationStatusOptions,
          });

          if (selctedStatus) {
            const currentDate = new Date()
              .toLocaleDateString('en-CA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
              .replace(/\//g, '-');

            await Get(
              `UpdateTracking?sampleReqDtlId=${rw?.Sample_Req_Dtl_ID}&OPStatusID=${selctedStatus.OPStatusID}&OPStatusDate=${currentDate}&OPStatusBy=${userData?.userDetails?.userId}`
            );
            console.log('UpdateTracking API called successfully');
          }
        }

        // Make KAM/Sample approval calls based on conditions
        if (rw?.kamEdit && canEdit) {
          await Get(
            `UpdateKAMApproval?sampleReqDtlId=${rw?.Sample_Req_Dtl_ID}&KAMApprovalStatus=${rw?.KAMApprovalStatus || 'P'
            }&KAMReason=${rw?.KAMReason || '-'}&KAMApprovedBy=${userData?.userDetails?.userId
            }&EstimatedDeliveryDate=${estimatedDeliveryDate || null}&SampleReadyDate=${SampleReadyDate || null}`
          );
          approvalResponse = await Post(
            `ApproveSampleDetail?sampleReqDtlId=${rw?.Sample_Req_Dtl_ID}&estimatedDeliveryDate=${estimatedDeliveryDate || null
            }&SampleReadyDate=${SampleReadyDate || null}&approvalStatus=${approvalStatus || 'P'}&approvedBy=${userData?.userDetails?.userId
            }&reason=${rw.Reason || '-'}`
          );
        } else if (rw?.kamEdit && !canEdit) {
          approvalResponse = await Get(
            `UpdateKAMApproval?sampleReqDtlId=${rw?.Sample_Req_Dtl_ID}&KAMApprovalStatus=${rw?.KAMApprovalStatus || 'P'
            }&KAMReason=${rw?.KAMReason || '-'}&KAMApprovedBy=${userData?.userDetails?.userId
            }&EstimatedDeliveryDate=${estimatedDeliveryDate || null}&SampleReadyDate=${SampleReadyDate || null}`
          );
        } else {
          approvalResponse = await Post(
            `ApproveSampleDetail?sampleReqDtlId=${rw?.Sample_Req_Dtl_ID}&estimatedDeliveryDate=${estimatedDeliveryDate || null
            }&SampleReadyDate=${SampleReadyDate || null}&approvalStatus=${approvalStatus || 'P'}&approvedBy=${userData?.userDetails?.userId
            }&reason=${rw.Reason || ''}`
          );
        }

        return approvalResponse;
      });

      const results = await Promise.all(promises);
      const allSuccess = results.every((res) => res && res.status === 200);

      if (allSuccess) {
        enqueueSnackbar(`Successfully saved ${changedRows.length} changes`, { variant: 'success' });
        setChangedRows([]); // Clear changed rows after successful save
        fetchSampleRequests(); // Refresh data
      } else {
        throw new Error('Some updates failed');
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to save some changes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [
    changedRows,
    enqueueSnackbar,
    fetchSampleRequests,
    userData?.userDetails?.userId,
    canEdit,
    operationStatusOptions,
  ]);

  // Column Definitions - Flat Grid (Master + Detail combined)

  const getSampleType = (isRND) => {
    if (isRND === 'R') return 'RnD';
    if (isRND === 'I') return 'Independent';
    if (isRND === 'Q') return 'From Quotation';
    if (isRND === 'P') return 'From PI';
    return '-';
  };
  const masterColumnDefs = useMemo(
    () => [
      {
        field: 'RecipePictureURL',
        headerName: ' Recipe Card',
        minWidth: 80,
        // maxWidth: 80,
        cellRenderer: imageRenderer,
        filter: false,
      },
      {
        field: 'isRND',
        headerName: 'Sample Type',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => getSampleType(params.value),
        cellStyle: (params) => {
          if (params.value === 'R') return { color: '#f44336' };
          if (params.value === 'I') return { color: '#2196f3' };
          if (params.value === 'Q') return { color: '#ff9800' };
          if (params.value === 'P') return { color: '#4caf50' };
          return null;
        },
      },
      {
        field: 'Sample_Code',
        headerName: 'Sample Code',
        minWidth: 180,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ItemCode',
        headerName: 'Sample ID No.',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Sample_Request_Date',
        headerName: 'Request Date',
        minWidth: 150,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => fDate(new Date(params.value)) || '-',
      },
      {
        field: 'WIC_Name',
        headerName: 'Customer Name',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },

      {
        field: 'KAMName',
        headerName: 'KAM',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Status',
        headerName: 'Master Status',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        cellStyle: (params) => {
          if (params.value === 'Pending') return { color: '#ff9800', fontWeight: 'bold' };
          if (params.value === 'Approved') return { color: '#4caf50', fontWeight: 'bold' };
          if (params.value === 'Rejected') return { color: '#f44336', fontWeight: 'bold' };
          if (params.value === 'Partially Approved')
            return { color: '#2196f3', fontWeight: 'bold' };
          return null;
        },
        hide: true,
      },

      {
        field: 'Product_Composed_Name',
        headerName: 'Product',
        minWidth: 300,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Priority_Category',
        headerName: 'Priority',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        cellStyle: (params) => {
          if (params.value === 'High') return { color: '#f44336', fontWeight: 'bold' };
          if (params.value === 'Medium') return { color: '#ff9800', fontWeight: 'bold' };
          return null;
        },
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Yarn_Type',
        headerName: 'Yarn Type',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        hide: true,
      },
      {
        field: 'Yarn_Count_Name',
        headerName: 'Yarn Count',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        hide: true,
      },
      {
        field: 'Composition_Name',
        headerName: 'Composition',
        minWidth: 250,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        hide: true,
      },
      {
        field: 'Fabric_Types',
        headerName: 'Fabric Type',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        hide: true,
      },
      {
        field: 'ColorName',
        headerName: 'Color',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => {
          const row = params.data;
          return row?.ColorName && row?.Color_Code
            ? `${row.ColorName} - ${row.Color_Code}`
            : row?.ColorName || '-';
        },
        hide: true,
      },
      {
        field: 'Quantity',
        headerName: 'Quantity',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => {
          const row = params.data;
          return `${fNumber(params.value)} ${row?.UOMName || ''}` || '0.00';
        },
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'ConeQty',
        headerName: 'No of Cones',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '0',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'Price',
        headerName: 'Unit Price',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => {
          const row = params.data;
          return `${fCurrency(params.value)} / ${row?.UOMName || ''}` || '$0.00';
        },
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'TotalAmount',
        headerName: 'Total (USD)',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fCurrency(params.value) || '$0.00',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'TotalAmountinBDT',
        headerName: 'Total (BDT)',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => `৳${fNumber(params.value) || '0.00'}`,
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'Delivery_Date',
        headerName: 'Sample Ready Date',
        minWidth: 150,
        filter: 'agDateColumnFilter',
        editable: (params) => canEdit || params?.data?.kamEdit,
        cellStyle: (params) =>
          params?.data?.kamEdit || canEdit
            ? {
                backgroundColor: 'rgba(99, 145, 58, 0.05)',
              }
            : null,
        cellEditor: 'agDateCellEditor',
        cellEditorParams: {
          min: new Date(2000, 0, 1),
          max: new Date(2050, 11, 31),
          value: (params) => (params.value ? new Date(params.value) : null),
        },
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
        valueParser: (params) => {
          if (!params.newValue) {
            return params.oldValue;
          }
          const newDate = new Date(params.newValue);
          return Number.isNaN(newDate.getTime()) ? params.oldValue : newDate.toISOString();
        },
      },
      {
        field: 'EstimatedDeliveryDate',
        headerName: 'Est. Delivery',
        minWidth: 180,
        filter: 'agDateColumnFilter',
        editable: (params) => canEdit || params?.data?.kamEdit,
        cellStyle: (params) =>
          params?.data?.kamEdit || canEdit
            ? {
              backgroundColor: 'rgba(99, 145, 58, 0.05)',
            }
            : null,
        cellEditor: 'agDateCellEditor',
        cellEditorParams: {
          min: new Date(2000, 0, 1),
          max: new Date(2050, 11, 31),
          value: (params) => (params.value ? new Date(params.value) : null),
        },
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
        valueParser: (params) => {
          if (!params.newValue) {
            return params.oldValue;
          }
          const newDate = new Date(params.newValue);
          return Number.isNaN(newDate.getTime()) ? params.oldValue : newDate.toISOString();
        },
      },
      {
        field: 'LeadTime',
        headerName: 'Lead Time (Days)',
        minWidth: 120,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => params.value > 0 ? `${fNumber(params.value, 0)} Days` : 'N/A',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'DetailRemarks',
        headerName: 'Remarks',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'KAMApprovalStatus',
        headerName: 'KAM Approval Status',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        editable: (params) => params.data.kamEdit,
        cellStyle: (params) =>
          params?.data?.kamEdit
            ? {
              backgroundColor: 'rgba(99, 145, 58, 0.05)',
              ...(statusStyleMap[params.value] || {}),
            }
            : { ...(statusStyleMap[params.value] || {}) },
        valueFormatter: (params) => statusDisplayMap[params.value] || params.value,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: statusValues,
        },
      },
      {
        field: 'KAMApproveOn',
        headerName: 'KAM Approval Date',
        minWidth: 180,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        field: 'KAMReason',
        headerName: 'KAM Approval Reason',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        editable: (params) => params.data.kamEdit,
        cellStyle: (params) =>
          params?.data?.kamEdit
            ? {
              backgroundColor: 'rgba(99, 145, 58, 0.05)',
            }
            : null,
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ApprovalStatus',
        headerName: 'Approval Status',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        editable: canEdit,
        cellStyle: (params) =>
          canEdit
            ? {
              backgroundColor: 'rgba(99, 145, 58, 0.05)',
              ...(statusStyleMap[params.value] || {}),
            }
            : { ...(statusStyleMap[params.value] || {}) },
        valueFormatter: (params) => statusDisplayMap[params.value] || params.value,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: statusValues,
        },
      },
      {
        field: 'ApprovedOn',
        headerName: 'Approval Date',
        minWidth: 180,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        field: 'Reason',
        headerName: 'Approval Reason',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        editable: canEdit,
        cellStyle: (params) => (canEdit ? { backgroundColor: 'rgba(99, 145, 58, 0.05)' } : null),
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'CustomerFeedBackOn',
        headerName: 'Cust. Feedback Date',
        minWidth: 180,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        field: 'CustomerFB',
        headerName: 'Cust. Feedback',
        minWidth: 250,
        filter: 'agTextColumnFilter',
        editable: canEdit,
        cellEditor: 'agTextCellEditor',
        cellEditorParams: {
          maxLength: 1000,
        },
        valueFormatter: (params) => params.value || '-',
        cellStyle: (params) => (canEdit ? { backgroundColor: 'rgba(99, 145, 58, 0.05)' } : null),
      },
      {
        field: 'OPStatus',
        headerName: 'Operations Status',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        // eslint-disable-next-line
        editable: (params) => (params?.data?.ApprovalStatus === 'A' ? true : false),
        cellStyle: (params) => {
          const baseStyle =
            params?.data?.ApprovalStatus === 'A'
              ? { backgroundColor: 'rgba(99, 145, 58, 0.05)' }
              : null;

          if (params.value === 'Processing') {
            return { ...baseStyle, color: '#ff9800', fontWeight: 'bold' }; // Orange
          }
          if (params.value === 'Packing') {
            return { ...baseStyle, color: '#2196f3', fontWeight: 'bold' }; // Blue
          }
          if (params.value === 'Hand over to Store') {
            return { ...baseStyle, color: '#63913a', fontWeight: 'bold' }; // Purple
          }
          if (params.value === 'Delivered') {
            return { ...baseStyle, color: '#4caf50', fontWeight: 'bold' }; // Green
          }

          return baseStyle;
        },
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: operationStatusOptions.map((opt) => opt.OPStatus),
        },
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'OPStatusDate',
        headerName: 'OP Status Date',
        minWidth: 180,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'OPStatusUpdateByName',
        headerName: 'OP Status Updated By',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },

      // Actions column
      {
        field: 'delete',
        headerName: '',
        maxWidth: 120,
        minWidth: 60,
        filter: false,
        sortable: false,
        resizable: false,
        lockPosition: 'right',
        pinned: 'right',
        cellRenderer: (params) => (
          <>
            <IconButton
              disabled={params.data.Status === 'Approved'}
              onClick={() => handleMasterEdit(params.data.Sample_Request_ID)}
              size="small"
            >
              <Iconify icon="solar:pen-bold" width="20" height="20" />
            </IconButton>

            <IconButton onClick={() => handleMasterPDF(params.data.Sample_Request_ID)} size="small">
              <Iconify icon="mdi:file-pdf-box" width="20" height="20" />
            </IconButton>
            {/* <IconButton
              color="error"
              onClick={() => handleDetailDelete(params.data.Sample_Req_Dtl_ID)}
              size="small"
            >
              <Iconify icon="solar:trash-bin-trash-bold" width="20" height="20" />
            </IconButton> */}
          </>
        ),
        cellStyle: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 0,
        },
      },
    ],
    // eslint-disable-next-line
    [canEdit]
  );

  // Default column definitions
  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  // Filter data based on search text
  // Filter data based on search text and selectedStatus
  const filteredData = useMemo(() => {
    let data = rowData;

    if (selectedStatus !== 'Total Samples') {
      if (selectedStatus === 'Approved') {
        data = data.filter((item) => item.ApprovalStatus === 'A');
      } else if (selectedStatus === 'Rejected') {
        data = data.filter((item) => item.ApprovalStatus === 'R');
      } else if (selectedStatus === 'Pending') {
        data = data.filter((item) => item.ApprovalStatus !== 'A' && item.ApprovalStatus !== 'R');
      }
    }

    if (!searchText) return data;

    const lowerSearch = searchText.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some(
        (val) =>
          val &&
          (typeof val === 'string' || typeof val === 'number') &&
          val.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }, [rowData, searchText, selectedStatus]);

  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleExportCSV = () => {
    if (!detailedData || !detailedData.length) return;

    const formatValue = (value) => {
      if (value === null || value === undefined) return '';

      if (typeof value === 'string' && value.includes('T')) {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          return date.toLocaleDateString('en-CA');
        }
      }

      return String(value).replace(/"/g, '""');
    };

    const headers = Object.keys(detailedData[0]);
    const headerRow = headers.map((key) => `"${key}"`);

    const rows = detailedData.map((row) => headers.map((key) => `"${formatValue(row[key])}"`));

    const csvContent = [headerRow, ...rows].map((line) => line.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cyclo_samples.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to count items by status
  const getStatusCount = useCallback(
    (status) => detailedData.filter((item) => item.ApprovalStatus === status).length,
    [detailedData]
  );

  // Function to calculate percentage by status
  const getPercentByStatus = (status) => {
    const count = getStatusCount(status);
    return detailedData.length > 0 ? (count / detailedData.length) * 100 : 0;
  };

  // Function to calculate total quantity by status
  const getTotalQtyByStatus = (status) => {
    const filteredItems = detailedData.filter((item) => item.ApprovalStatus === status);
    return sumBy(filteredItems, 'Sample_Quantity_KG'); // or 'Sample_Quantity_LBs' depending on your needs
  };

  // Function to calculate total received quantity (assuming you have a Total_Receive_Qty field)
  const getTotalReceivedQty = () => sumBy(detailedData, 'Sample_Quantity_KG'); // or 'Total_Receive_Qty' if that field exists

  const getTotalAmount = () => sumBy(detailedData, 'Total_Sample_Cost');

  const getTotalAmountInUSDByStatus = (status) => {
    const filteredItems = detailedData.filter((item) =>
      status ? item.ApprovalStatus === status : true
    );
    return sumBy(filteredItems, 'Total_Sample_Cost');
  };

  // const getTotalAmountInBDTByStatus = (status) => {
  //   const filteredItems = detailedData.filter((item) =>
  //     status ? item.ApprovalStatus === status : true
  //   );
  //   return sumBy(filteredItems, 'AmountinBDT');
  // };

  if (fetchLoading) {
    return <LoadingScreen />;
  }

  //  Dialog Functions

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%', height: '80vh', p: 2 }}>
        {/* Filter Section */}
        <Box
          display="grid"
          rowGap={3}
          columnGap={2}
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          }}
          spacing={2}
          sx={{ py: 2 }}
        >
          <Autocomplete
            options={filterOptions}
            getOptionLabel={(option) => option.label}
            value={selectedFilter}
            onChange={(event, newValue) => {
              setSelectedFilter(newValue || filterOptions[0]);
            }}
            sx={{ width: '100%' }}
            renderInput={(params) => (
              <TextField {...params} label="Date Filter" variant="outlined" size="small" />
            )}
          />

          <Autocomplete
            options={filterTypeOptions}
            getOptionLabel={(option) => option.label}
            value={selectedSampleType}
            onChange={(event, newValue) => {
              setSelectedSampleType(newValue || filterTypeOptions[0]);
            }}
            sx={{ width: '100%' }}
            renderInput={(params) => (
              <TextField {...params} label="Sample Type" variant="outlined" size="small" />
            )}
          />

          {selectedFilter.value === 'custom' && (
            <>
              <DatePicker
                label="From Date"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                slotProps={{
                  textField: {
                    // fullWidth: true,
                    size: 'small',
                  },
                }}
                renderInput={(params) => (
                  <TextField {...params} size="small" sx={{ width: { xs: '100%', sm: 150 } }} />
                )}
              />
              <DatePicker
                label="To Date"
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                slotProps={{
                  textField: {
                    // fullWidth: true,
                    size: 'small',
                  },
                }}
                renderInput={(params) => (
                  <TextField {...params} size="small" sx={{ width: { xs: '100%', sm: 150 } }} />
                )}
              />
            </>
          )}
        </Box>

        <Card sx={{ mb: { xs: 3, md: 5 } }}>
          <Scrollbar>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ justifyContent: 'space-evenly' }}
            >
              <Box
                onClick={() => setSelectedStatus('Total Samples')}
                sx={{
                  cursor: 'pointer',
                  border:
                    selectedStatus === 'Total Samples'
                      ? `2px solid ${theme.palette.info.main}15`
                      : 'none',
                  borderRadius: '16px 0px 0px 16px',
                  p: 1,
                  width: "100%",
                  ...(selectedStatus === 'Total Samples' && {
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                  }),
                }}>
                <InvoiceAnalytic
                  title="Total Samples"
                  total={detailedData.length}
                  percent={100}
                  price={getTotalAmount()}
                  icon="solar:box-bold-duotone"
                  color={theme.palette.info.main}

                />
              </Box>
              <Box
                onClick={() => setSelectedStatus('Approved')}
                sx={{
                  cursor: 'pointer',
                  border:
                    selectedStatus === 'Approved'
                      ? `2px solid ${theme.palette.success.main}15`
                      : 'none',

                  p: 1,
                  width: "100%",
                  ...(selectedStatus === 'Approved' && {
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                  }),
                }}>
                <InvoiceAnalytic
                  title="Approved"
                  total={getStatusCount('Approved')}
                  percent={getPercentByStatus('Approved')}
                  price={getTotalAmountInUSDByStatus('Approved')}
                  icon="solar:file-check-bold-duotone"
                  color={theme.palette.success.main}

                />
              </Box>
              <Box
                onClick={() => setSelectedStatus('Rejected')}
                sx={{
                  cursor: 'pointer',
                  border:
                    selectedStatus === 'Rejected'
                      ? `2px solid ${theme.palette.error.main}15`
                      : 'none',
                  p: 1,
                  width: "100%",
                  ...(selectedStatus === 'Rejected' && {
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                  }),
                }}>
                <InvoiceAnalytic
                  title="Rejected"
                  total={getStatusCount('Rejected')}
                  percent={getPercentByStatus('Rejected')}
                  price={getTotalAmountInUSDByStatus('Rejected')}
                  icon="solar:file-bold-duotone"
                  color={theme.palette.error.main}

                />
              </Box>
              <Box
                onClick={() => setSelectedStatus('Pending')}
                sx={{
                  cursor: 'pointer',
                  border:
                    selectedStatus === 'Pending'
                      ? `2px solid ${theme.palette.warning.main}15`
                      : 'none',
                  borderRadius: '0px 16px 16px 0px',
                  p: 1,
                  width: "100%",
                  ...(selectedStatus === 'Pending' && {
                    bgcolor: alpha(theme.palette.warning.main, 0.05),
                  }),
                }}>

                <InvoiceAnalytic
                  title="Pending"
                  total={getStatusCount('Pending')}
                  percent={getPercentByStatus('Pending')}
                  price={getTotalAmountInUSDByStatus('Pending')}
                  icon="solar:clock-circle-bold-duotone"
                  color={theme.palette.warning.main}

                />
              </Box>
            </Stack>
          </Scrollbar>
        </Card>
        {/* OPStatus Filter Tabs */}
        <Tabs
          value={selectedOPStatus}
          onChange={handleOPStatusFilter}
          sx={{
            px: 2.5,
            mb: 2,
            boxShadow: (th) => `inset 0 -2px 0 0 ${alpha(th.palette.grey[500], 0.08)}`,
          }}
        >
          {opStatusOptions.map((tab) => (
            <Tab
              key={tab.value}
              iconPosition="end"
              value={tab.value}
              label={tab.label}
              icon={
                <Label
                  variant={
                    ((tab.value === selectedOPStatus || tab.value === 'all') && 'filled') || 'soft'
                  }
                  color={tab.value === 'all' ? 'primary' : getOPStatusColor(tab.value)}
                >
                  {tab.value === 'all'
                    ? dataForTabCounts.length
                    : dataForTabCounts.filter((item) => item.OPStatus === tab.value).length}
                </Label>
              }
            />
          ))}
        </Tabs>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ mb: 2 }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <TextField
              label="Search..."
              variant="outlined"
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" width={20} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
            width={{ xs: '100%', sm: 'auto' }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitChanges}
              disabled={changedRows.length === 0 || loading}
              startIcon={<Iconify icon="eva:save-fill" width={20} />}
            >
              {loading ? 'Saving...' : `Save Changes (${changedRows.length})`}
            </Button>
            <Button
              variant="contained"
              startIcon={<Iconify icon="uiw:file-excel" />}
              color="primary"
              onClick={handleDialogOpen}
              sx={{ height: '38px' }}
            >
              Export Excel
            </Button>

            <Tooltip title="Zoom Out">
              <IconButton
                onClick={handleZoomOut}
                color="primary"
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <Iconify icon="si:zoom-out-duotone" width={20} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Zoom In">
              <IconButton
                onClick={handleZoomIn}
                color="primary"
                sx={{ border: '1px solid', borderColor: 'divider' }}
              >
                <Iconify icon="si:zoom-in-duotone" width={20} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Box
          sx={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            width: `${100 / zoomLevel}%`,
            height: `${100 / zoomLevel}%`,
          }}
        >
          {/* <Scrollbar> */}
            <div style={{ width: '100%', height: '70vh' }}>
              <AgGridReact
                ref={gridRef}
                className="ag-theme-material"
                theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
                rowData={filteredData}
                columnDefs={masterColumnDefs}
                defaultColDef={defaultColDef}
                rowHeight={35}
                headerHeight={40}
                animateRows
                pagination
                paginationPageSize={20}
                suppressRowClickSelection
                domLayout="autoHeight"
                onCellValueChanged={handleCellValueChanged}
                singleClickEdit
              />
            </div>
          {/* </Scrollbar> */}
        </Box>
        <ConfirmDialog
          open={deleteConfirm.open}
          onClose={() => setDeleteConfirm({ open: false, type: null, id: null })}
          title="Delete"
          content={
            deleteConfirm.type === 'master'
              ? 'Are you sure you want to delete this entire sample request and all its items?'
              : 'Are you sure you want to delete this sample item?'
          }
          action={
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          }
        />

        <RptDialog uploadClose={handleDialogClose} uploadOpen={dialogOpen} />
      </Box>
    </LocalizationProvider>
  );
};

export default SampleRequestGrid;
