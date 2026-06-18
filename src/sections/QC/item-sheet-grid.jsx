import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Delete, Get, Post, Put } from 'src/api/apibasemethods';
import {
  colorSchemeDarkBlue,
  themeAlpine,
  themeBalham,
  themeMaterial,
  themeQuartz,
} from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { useNavigate } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import {
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Divider,
  Card,
  Typography,
  Tab,
  Tabs,
  Box,
} from '@mui/material';
import { Stack, useTheme } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import { fDate } from 'src/utils/format-time';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { fNumber } from 'src/utils/format-number';
import ItemQCRejectDialog from './ItemQCRejectDialog';
import ItemQCEntryDialog from './ItemQCEntryDialog';
import InvoiceAnalytic from './invoice-analytic';
import { sumBy } from 'lodash';
import UploadExcelDialog from './excel-import-dialog';
import { APP_API_STORAGE } from 'src/config-global';
import Label from 'src/components/label';

const QCGrid = () => {
  const settings = useSettingsContext();
  const theme = useTheme();
  const themeDark = themeBalham.withPart(colorSchemeDarkBlue);
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const confirm = useBoolean();
  const [selectedItem, setSelectedItem] = useState(null);

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [gradingOptions, setGradingOptions] = useState([]);
  const [searchParams, setSearchParams] = useState({
    GRNNO: '',
    ItemDescription: '',
    Vender: '',
  });

  // New state for filter tabs
  const [filterTab, setFilterTab] = useState('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [qcEntryDialogOpen, setQcEntryDialogOpen] = useState(false);
  const [selectedQC, setSelectedQC] = useState(null);
  const [selectedQCEntry, setSelectedQCEntry] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [gradingUsers, setGradingUsers] = useState([]);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleUploadDialogOpen = (qc) => {
    setSelectedQC(qc);
    setUploadDialogOpen(true);
  };

  const handleUploadDialogClose = () => {
    setSelectedQC(null);
    setUploadDialogOpen(false);
  };

  const convertLbsToKg = (quantity, uomId) => (uomId === 7 ? quantity * 0.453592 : quantity);

  const containerStyle = useMemo(() => ({ width: '100%', height: '500px' }), []);

  // Fetch QC data
  const fetchQCs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetAllListWithQCForGrading?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const grResponse = await Get(
        `GetQCGradings?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const graders = await Get(
        `GetDocApprovalSetupById?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&Doc_ID=7`
      );
      setGradingUsers(graders.data);

      if (grResponse.status === 200) {
        setGradingOptions(grResponse.data.data);
      } else {
        enqueueSnackbar('Failed to load grading options', { variant: 'error' });
      }
      if (response.status === 200 && grResponse.status === 200) {
        const formattedData = response.data.map((item) => {
          const totalPoQty = convertLbsToKg(item?.Total_PO_Qty, item?.UOMID);
          const totalQty = convertLbsToKg(item?.Total_Receive_Qty, item?.UOMID);
          const passedQty = item?.Passed_Qty ? convertLbsToKg(item?.Passed_Qty, item?.UOMID) : null;
          const rejectQty = item?.Reject_Qty ? convertLbsToKg(item?.Reject_Qty, item?.UOMID) : null;
          return {
            // Map new API fields to existing field names
            QC_ID: item.QC_ID,
            AttachmentPath: item.AttachmentPath ? `${APP_API_STORAGE}${item.AttachmentPath}` : null,
            Receive_No: item.GRNNO,
            Status: item.GradingBy
              ? 'Completed'
              : item.Approval_Status === 'QC Completed'
                ? 'QC Completed'
                : item.Approval_Status || 'No Sample Collected',
            // Approval_Status: item.Approval_Status,
            Receive_Date: item.GRNDate,
            SampleQty: item.SampleQty,
            VendorID: item.VendorID,
            PO_No: item.POCode || item.GRNNO, // Use POCode from API
            PO_Date: item.GRNDate, // You might need to adjust this if PO Date is different
            POCode: item.POCode, // Store POCode separately
            Material_Code: item.Item_ID.toString(),
            Specification: `Item ${item.Item_ID}`, // You might need to fetch item name separately
            Total_PO_Qty: totalPoQty,
            QCSampleID: item.QCSampleID,
            Total_Receive_Qty: totalQty,
            Passed_Qty: passedQty || 0,
            Reject_Qty: rejectQty || 0,
            CollectionDate: item.CollectionDate,
            CollectedByName: item.CollectedByName,
            Rejected_Qty: rejectQty || totalQty - (passedQty || 0),
            UOMID: item.UOMID,
            UOMName: item.UOMName,
            Vender: item.Vender,
            StoreName: item.StoreName,
            StoreLocationName: item.StoreLocationName,
            // Status:
            //   passedQty === totalQty
            //     ? 'Approved'
            //     : passedQty === 0
            //       ? 'Rejected'
            //       : passedQty > 0
            //         ? 'Partially Approved'
            //         : 'Pending',
            // Add original values for reference
            Original_PO_Qty: item.Total_PO_Qty,
            Original_Total_Qty: item.Total_Receive_Qty,
            Original_Passed_Qty: item.Passed_Qty,
            Original_Reject_Qty: item.Reject_Qty,
            IsConverted: item.UOMID === 7,
            // Include new fields from API
            GRNDtlID: item.GRNDtlID,
            GRNID: item.GRNID,
            GRNNO: item.GRNNO,
            GRNDate: item.GRNDate,
            ChallanNo: item.ChallanNo,
            ChallanDate: item.ChallanDate,
            Grading:
              grResponse.data.data.find((g) => g.GradeID === item.GRADINGResultID)?.GradeName || '',
            GradingBy: item.GradingBy,
            GradingDate: item.GradingDate,
            GradingByName: item.GradingByName,
            Item_ID: item.Item_ID,
            ItemDescription: item.ItemDescription,
            StoreID: item.StoreID,
            StoreLocationID: item.StoreLocationID,
            isClose: item.isClose,
            Inspector_Name: item.Inspector_Name,
            QC_Date: item.QC_Date,
            Approval_Status: item.Approval_Status,
          };
        });
        setRowData(formattedData);
      } else {
        setRowData([]);
        enqueueSnackbar('No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load QC data', { variant: 'error' });
      setRowData([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [enqueueSnackbar, userData]);

  useEffect(() => {
    fetchQCs();
  }, [fetchQCs]);

  // Get counts for each tab
  const tabCounts = useMemo(() => {
    const allCount = rowData.length;
    const completedCount = rowData.filter((item) => item.Status === 'Completed').length;
    const sampleCollectedCount = rowData.filter(
      (item) => item.Status === 'Sample Collected'
    ).length;
    const noSampleCount = rowData.filter((item) => item.Status === 'No Sample Collected').length;

    return {
      all: allCount,
      completed: completedCount,
      sampleCollected: sampleCollectedCount,
      noSample: noSampleCount,
    };
  }, [rowData]);

  // Filter data based on search parameters and status tab
  const filteredData = useMemo(() => {
    let data = rowData.filter(
      (item) =>
        item.GRNNO.toLowerCase().includes(searchParams.GRNNO.toLowerCase()) &&
        item.ItemDescription.toLowerCase().includes(searchParams.ItemDescription.toLowerCase()) &&
        item.Vender.toLowerCase().includes(searchParams.Vender.toLowerCase())
    );

    // Apply status filter based on selected tab
    if (filterTab === 'completed') {
      data = data.filter((item) => item.Status === 'Completed');
    } else if (filterTab === 'sampleCollected') {
      data = data.filter((item) => item.Status === 'Sample Collected');
    } else if (filterTab === 'noSample') {
      data = data.filter((item) => item.Status === 'No Sample Collected');
    }
    // 'all' tab shows all data

    return data;
  }, [rowData, searchParams, filterTab]);

  const handlePassedQtyChange = useCallback(
    async (params) => {
      try {
        const newPassedQty = parseFloat(params.newValue) || 0;
        const newRejectedQty = params.data.Total_Receive_Qty - newPassedQty;

        const updatedData = {
          ...params.data,
          Passed_Qty: newPassedQty,
          Rejected_Qty: newRejectedQty,
          Status: params.data.Status || 'No Sample Collected',
        };

        // Update local state immediately
        setRowData((prev) =>
          prev.map((item) => (item.GRNDtlID === updatedData.GRNDtlID ? updatedData : item))
        );

        // If fully approved, submit to API
        if (newPassedQty === params.data.Total_Receive_Qty) {
          const currentDate = new Date().toISOString();
          const res = await Post('AddQCWithRejections', {
            GRNDTLID: updatedData.GRNDtlID,
            UOMID: updatedData.UOMID,
            Total_Received: updatedData.Total_Receive_Qty || 0,
            Passed_Qty: updatedData.Passed_Qty || 0,
            SampleQty: params.data.SampleQty,
            isSampleRec: params.data.isSampleRec || 'N',
            Remarks: 'All units passed QC',
            Approval_Status: 'No Sample Collected',
            Approval_Level: 1,
            VendorID: params.data.VendorID,
            QC_Date: currentDate,
            Created_By: userData?.userDetails?.userId || 1,
            Rejections: [],
            // Sample: null,
          });
          setRowData((prev) =>
            prev.map((item) =>
              item.GRNDtlID === updatedData.GRNDtlID
                ? { ...updatedData, QC_ID: res?.data?.QC_ID }
                : item
            )
          );
          // enqueueSnackbar('Item fully approved', { variant: 'success' });
        }
        // If rejected or partially approved, open dialog
        else if (newRejectedQty > 0) {
          setSelectedItem({
            ...updatedData,
            UOMName: params.data.UOMName, // Include UOM for display
          });
          setDialogOpen(true);
        }
      } catch (error) {
        console.error('Error updating QC data:', error);
        enqueueSnackbar('Error updating QC data', { variant: 'error' });
      }
    },
    [enqueueSnackbar, userData]
  );

  const handleSampleQtyChange = useCallback(
    async (params) => {
      const newSampleQty = parseFloat(params.newValue) || 0;

      try {
        const currentDate = new Date().toISOString();
        const res = await Post('AddQCWithRejections', {
          GRNDTLID: params.data.GRNDtlID,
          UOMID: params.data.UOMID,
          isSampleRec: 'Y',
          SampleQty: newSampleQty || 0,
          Total_Received: params.data.Total_Receive_Qty,
          Passed_Qty: params?.data?.Passed_Qty || 0,
          Remarks: 'All units passed QC',
          Approval_Status: 'Sample Collected',
          Approval_Level: 1,
          QC_Date: currentDate,
          VendorID: params.data.VendorID,
          Created_By: userData?.userDetails?.userId || 1,
          Rejections: [],
          Sample: {
            SampleQty: newSampleQty,
            UOMID: params.data.UOMID,
            CollectionDate: currentDate,
            CollectedBy: userData?.userDetails?.userId || 1,
            VendorID: params.data.VendorID,
            GRNDTLID: params.data.GRNDtlID,
            ItemID: params.data.Item_ID,
            ORG_ID: userData?.userDetails?.orgId || 1,
            BRANCH_ID: userData?.userDetails?.branchID || 1,
          },
        });
        setRowData((prev) =>
          prev.map((i) =>
            i.GRNDtlID === params.data.GRNDtlID
              ? {
                  ...params.data,
                  QCSampleID: res?.data?.QCSampleID,
                  QC_ID: res?.data?.QC_ID,
                  SampleQty: newSampleQty,
                  CollectedByName: userData?.userDetails?.userName || '',
                  CollectionDate: new Date(),
                  Status: 'Sample Collected',
                }
              : i
          )
        );
      } catch (error) {
        console.error('Error updating sample quantity:', error);
      }
    },
    [
      userData?.userDetails?.userId,
      userData?.userDetails?.orgId,
      userData?.userDetails?.branchID,
      userData?.userDetails?.userName,
    ]
  );

  // Similarly update the handleApprove function to use the same API structure
  const handleApprove = useCallback(
    async (item) => {
      try {
        const updatedData = {
          ...item,
          Passed_Qty: item.Total_Receive_Qty,
          Rejected_Qty: 0,
          Status: item.Status || 'No Sample Collected',
        };

        const currentDate = new Date().toISOString();

        const response = await Post('AddQCWithRejections', {
          GRNDtlID: item.GRNDtlID,
          UOMID: item.UOMID,
          Total_Received: item.Total_Receive_Qty || 0,
          Passed_Qty: item.Total_Receive_Qty || 0,
          Remarks: 'All units passed QC',
          Approval_Status: 'Pending',
          Approval_Level: 1,
          QC_Date: currentDate,
          Created_By: userData?.userDetails?.userId || 1,
          Rejections: [],
        });

        if (response.status === 200) {
          setRowData((prev) =>
            prev.map((i) =>
              i.GRNDtlID === item.GRNDtlID ? { ...updatedData, QC_ID: response?.data?.QC_ID } : i
            )
          );
          enqueueSnackbar('QC data submitted', { variant: 'success' });
        } else {
          enqueueSnackbar('Failed to approve item', { variant: 'error' });
        }
      } catch (error) {
        console.error('Error approving item:', error);
        enqueueSnackbar('Error approving item', { variant: 'error' });
      }
    },
    [enqueueSnackbar, userData]
  );

  // Update the handleReject function to match the API structure
  const handleReject = useCallback(
    async (item) => {
      try {
        const updatedData = {
          ...item,
          Passed_Qty: 0,
          Rejected_Qty: item.Total_Receive_Qty,
          Status: 'Rejected',
        };

        const currentDate = new Date().toISOString();

        const response = await Post('AddQCWithRejections', {
          GRNDTLID: item.GRNDtlID,
          UOMID: item.UOMID,
          Total_Received: item.Total_Receive_Qty,
          Passed_Qty: 0,
          Remarks: 'All units rejected',
          Approval_Status: 'Pending',
          Approval_Level: 1,
          QC_Date: currentDate,
          Created_By: userData?.userDetails?.userId || 1,
          Rejections: [],
        });

        if (response.status === 200) {
          setRowData((prev) => prev.map((i) => (i.GRNDtlID === item.GRNDtlID ? updatedData : i)));
          enqueueSnackbar('Item rejected and QC data submitted', { variant: 'success' });
        } else {
          enqueueSnackbar('Failed to reject item', { variant: 'error' });
        }
      } catch (error) {
        console.error('Error rejecting item:', error);
        enqueueSnackbar('Error rejecting item', { variant: 'error' });
      }
    },
    [enqueueSnackbar, userData]
  );

  const handleGradingChange = useCallback(
    async (params) => {
      try {
        if (!params.data.QCSampleID) {
          enqueueSnackbar('No Sample Qty found!', { variant: 'error' });
          return false;
        }

        const selectedGrading = gradingOptions.find((g) => g.GradeName === params.newValue);
        if (!selectedGrading) {
          enqueueSnackbar('Invalid grading selected', { variant: 'error' });
          return false;
        }
        const response = await Put(
          `UpdateQCSample?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`,
          {
            QcSampleID: params.data.QCSampleID,
            GradingResultID: selectedGrading.GradeID,
            GradingBy: userData?.userDetails?.userId || 1,
          }
        );
        if (response.status === 200) {
          setRowData((prev) =>
            prev.map((i) =>
              i.QCSampleID === params.data.QCSampleID
                ? {
                    ...params.data,
                    Status: 'Completed',
                    Grading: selectedGrading.GradeName,
                    GradingByName: userData?.userDetails?.userName || '',
                    GradingDate: new Date(),
                  }
                : i
            )
          );
          enqueueSnackbar(`"${params.data.GRNNO}" Graded successfully`, { variant: 'success' });

          return true;
          // eslint-disable-next-line
        } else {
          enqueueSnackbar('Failed to update grading', { variant: 'error' });
          return false;
        }
      } catch (error) {
        console.error('Error updating grading:', error);
        enqueueSnackbar('Error updating grading', { variant: 'error' });
        return false;
      }
    },
    [enqueueSnackbar, gradingOptions, userData]
  );

  const handleTabChange = (event, newValue) => {
    setFilterTab(newValue);
  };

  // Status renderer
  const statusRenderer = (params) => {
    let bgColor;
    switch (params.value) {
      case 'Completed':
        bgColor = '#4CAF50'; // Green
        break;
      case 'QC Completed':
        bgColor = '#4CAF50'; // Green
        break;
      case 'Sample Collected':
        bgColor = '#FFC107'; // Amber
        break;
      case 'No Sample Collected':
        bgColor = '#F44336'; // Red
        break;
      // case 'Partially Approved':
      //   bgColor = '#FFC107'; // Amber
      //   break;
      default:
        bgColor = '#9E9E9E'; // Grey
    }

    return (
      <div
        style={{
          // padding: '4px 8px',
          borderRadius: '4px',
          // backgroundColor: `${bgColor}20`,
          color: bgColor,
          textAlign: 'left',
          fontWeight: 'bold',
        }}
      >
        {params.value || 'Sample Not Collected'}
      </div>
    );
  };
  // Grading renderer
  const gradingRenderer = (params) => {
    let bgColor;
    switch (params.value) {
      case 'Grade A':
        bgColor = '#4CAF50'; // Green
        break;
      case 'Grade C':
        bgColor = '#F44336'; // Red
        break;
      case 'Grade B':
        bgColor = '#FFC107'; // Amber
        break;
      default:
        bgColor = '#9E9E9E'; // Grey
    }

    return (
      <div
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: `${bgColor}20`,
          color: bgColor,
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        {params.value || 'Not Graded yet'}
      </div>
    );
  };
  const gradingRenderer2 = (params) => {
    let bgColor;
    switch (params.value) {
      case 'Grade A':
        bgColor = '#4CAF50'; // Green
        break;
      case 'Grade C':
        bgColor = '#F44336'; // Red
        break;
      case 'Grade B':
        bgColor = '#FFC107'; // Amber
        break;
      default:
        bgColor = '#9E9E9E'; // Grey
    }

    return (
      <div
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          // backgroundColor: `${bgColor}20`,
          color: bgColor,
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        {params.value || 'Not Graded yet'}
      </div>
    );
  };

  // QC Submit/Edit buttons renderer
  const qcActionButtonsRenderer = (params) => (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {params.data.QC_ID &&
      (params.data.Approval_Status === 'QC Completed' || params.data.Status === 'QC Completed') ? (
        <Tooltip title="Edit QC" arrow>
          <IconButton
            onClick={() => {
              setSelectedQCEntry(params.data);
              setIsEditMode(true);
              setQcEntryDialogOpen(true);
            }}
            // color="primary"
            size="small"
          >
            <Iconify icon="solar:pen-bold" width={20} />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Submit QC" arrow>
          <IconButton
            onClick={() => {
              setSelectedQCEntry(params.data);
              setIsEditMode(false);
              setQcEntryDialogOpen(true);
            }}
            // color="success"
            size="small"
            disabled={params.data.Status === 'Completed'}
          >
            <Iconify icon="mdi:content-save" width={20} />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );

  const attachmentRenderer = useCallback((params) => {
    // If QC_ID is 0, show disabled state
    if (params.data.QC_ID === 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.5 }}>
          {/* eslint-disable-next-line */}
          <img
            src="/assets/images/no-image.jpg"
            alt="no attachment available"
            style={{
              width: 24,
              height: 24,
              objectFit: 'cover',
              border: '1px solid #ccc',
              cursor: 'not-allowed',
            }}
          />
          <Typography variant="caption" color="textDisabled">
            N/A
          </Typography>
        </Box>
      );
    }

    if (!params.value || params.value.trim() === '') {
      // No file → show placeholder image (enabled)
      return (
        // eslint-disable-next-line
        <img
          src="/assets/images/no-image.jpg"
          alt="no attachment"
          style={{
            width: 24,
            height: 24,
            objectFit: 'cover',
            border: '1px solid #ccc',
            cursor: 'pointer',
          }}
          onClick={() => handleUploadDialogOpen(params.data)}
        />
      );
    }

    const fileUrl = params.value;
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);

    if (isImage) {
      // Render image thumbnail (enabled)
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/*  eslint-disable-next-line */}
          <img
            src={fileUrl}
            alt="attachment"
            style={{
              marginLeft: 4,
              width: 24,
              height: 24,
              objectFit: 'cover',
              cursor: 'pointer',
              border: '1px solid #ccc',
            }}
            onClick={() => handleUploadDialogOpen(params.data)}
          />
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <Typography variant="caption">View</Typography>
          </a>
        </Box>
      );
    }

    // Render file icon with link for non-image files (enabled)
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={() => handleUploadDialogOpen(params.data)}
          color="primary"
          size="small"
        >
          <Iconify icon="vscode-icons:file-type-pdf2" />
        </IconButton>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <Typography variant="caption">View</Typography>
        </a>
      </Box>
    );
  }, []);
  // Column definitions

  const columnDefs = useMemo(
    () =>
      gradingUsers.length > 0 &&
      gradingUsers.some((grader) => grader.ApproverID === userData?.userDetails?.userId)
        ? [
            {
              field: 'Vender',
              headerName: 'Vendor',
              minWidth: 200,
              filter: 'agTextColumnFilter',
            },
            {
              field: 'GRNNO',
              headerName: 'GRN No',
              minWidth: 120,
              filter: 'agTextColumnFilter',
            },
            {
              field: 'GRNDate',
              headerName: 'GRN Date',
              minWidth: 120,
              filter: 'agDateColumnFilter',
              valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
            },
            {
              field: 'POCode',
              headerName: 'PO Number',
              minWidth: 120,
              filter: 'agTextColumnFilter',
              valueFormatter: (params) => params.value || '-',
            },
            {
              field: 'ChallanNo',
              headerName: 'Challan No',
              minWidth: 120,
              filter: 'agTextColumnFilter',
            },
            {
              field: 'ChallanDate',
              headerName: 'Challan Date',
              minWidth: 120,
              filter: 'agDateColumnFilter',
              valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
            },
            {
              field: 'ItemDescription',
              headerName: 'Item Description',
              minWidth: 150,
              filter: 'agTextColumnFilter',
            },
            {
              field: 'Total_PO_Qty',
              headerName: 'PO Qty',
              minWidth: 100,
              type: 'numericColumn',
              filter: 'agNumberColumnFilter',
              valueFormatter: (params) => {
                const value = params.value ? fNumber(params.value) : '0.00';
                return params.data.IsConverted
                  ? `${value} KG (${fNumber(params.data.Original_PO_Qty)} LBS)`
                  : `${value} ${params.data.UOMName}`;
              },
            },
            {
              field: 'Total_Receive_Qty',
              headerName: 'Receive Qty',
              minWidth: 150,
              type: 'numericColumn',
              filter: 'agNumberColumnFilter',
              valueFormatter: (params) => {
                const value = params.value ? fNumber(params.value) : '0.00';
                return params.data.IsConverted
                  ? `${value} KG (${fNumber(params.data.Original_Total_Qty)} LBS)`
                  : `${value} ${params.data.UOMName}`;
              },
            },
            {
              field: 'Passed_Qty',
              headerName: 'Passed Qty',
              minWidth: 150,
              type: 'numericColumn',
              filter: 'agNumberColumnFilter',
              // editable: (params) => params.data.Status !== 'Completed',
              // cellStyle: (params) => ({
              //   backgroundColor: params.data.Status === 'Completed' ? '#4CAF5020' : '#63913a20',
              //   // opacity: params.data.isClose ? 0.6 : 1,
              // }),
              valueFormatter: (params) => {
                const value = params.value ? fNumber(params.value) : '0.00';
                return params.data.IsConverted && params.value !== null
                  ? `${value} KG (${fNumber(params.data.Original_SampleQty)} LBS)`
                  : `${value} ${params.data.UOMName}`;
              },
              valueSetter: (params) => {
                // if (params.data.isClose) return false; // Prevent editing if closed

                const newValue = parseFloat(params.newValue) || 0;
                const maxValue = params.data.Total_Receive_Qty;

                if (newValue <= maxValue) {
                  // Convert back to LBS if needed for API submission
                  const originalValue = params.data.IsConverted ? newValue / 0.453592 : newValue;

                  params.data.Passed_Qty = newValue;
                  params.data.Original_Passed_Qty = originalValue;
                  params.data.Rejected_Qty = maxValue - newValue;
                  params.data.Original_Reject_Qty = params.data.Original_Total_Qty - originalValue;
                  // params.data.Status =
                  //   newValue === maxValue
                  //     ? 'Completed'
                  //     : newValue === 0
                  //       ? 'No Sample Collected'
                  //       : newValue > 0
                  //         ? 'Partially Approved'
                  //         : 'Pending';
                  handlePassedQtyChange(params);
                  return true;
                  // eslint-disable-next-line
                } else {
                  enqueueSnackbar(`Passed Qty cannot exceed Receive Qty (${maxValue})`, {
                    variant: 'error',
                  });
                }
                return false;
              },
            },
            {
              field: 'Rejected_Qty',
              headerName: 'Rejected Qty',
              minWidth: 150,
              type: 'numericColumn',
              filter: 'agNumberColumnFilter',
              cellStyle: (params) => ({
                backgroundColor: params.data.Status === 'Rejected' && '#ffebee20',
                // opacity: params.data.isClose ? 0.6 : 1,
              }),
              valueFormatter: (params) => {
                const value = params.value ? fNumber(params.value) : '0.00';
                return params.data.IsConverted && params.value !== null
                  ? `${value} KG (${fNumber(params.data.Original_Reject_Qty)} LBS)`
                  : `${value} ${params.data.UOMName}`;
              },
            },
            {
              field: 'AttachmentPath',
              headerName: 'Attachment',
              minWidth: 100,
              cellRenderer: attachmentRenderer,
              cellStyle: (params) => ({
                border: params.data.QC_ID !== 0 && '1px solid #63913a40',
              }),
              filter: false,
              sortable: false,
            },
            {
              field: 'SampleQty',
              headerName: 'Sample Qty',
              minWidth: 150,
              type: 'numericColumn',
              filter: 'agNumberColumnFilter',
              editable: true,
              cellStyle: (params) => ({
                backgroundColor: '#63913a20',
                border: '1px solid #63913a40',
              }),
              valueFormatter: (params) => {
                const value = params.value ? fNumber(params.value) : '0.00';
                return params.data.IsConverted && params.value !== null
                  ? `${value} KG (${fNumber(params.data.Original_SampleQty)} LBS)`
                  : `${value} ${params.data.UOMName}`;
              },
              valueSetter: (params) => {
                // if (params.data.isClose) return false; // Prevent editing if closed

                const newValue = parseFloat(params.newValue) || 0;
                const maxValue = params.data.Passed_Qty;

                if (newValue <= maxValue) {
                  // Convert back to LBS if needed for API submission
                  const originalValue = params.data.IsConverted ? newValue / 0.453592 : newValue;

                  params.data.SampleQty = newValue;
                  params.data.Original_SampleQty = originalValue;
                  // params.data.Rejected_Qty = maxValue - newValue;
                  // params.data.Original_Reject_Qty = params.data.Original_Total_Qty - originalValue;
                  params.data.Status = 'Sample Collected';
                  handleSampleQtyChange(params);
                  return true;
                  // eslint-disable-next-line
                } else {
                  enqueueSnackbar(`Sample Qty cannot exceed Passed Qty (${maxValue})`, {
                    variant: 'error',
                  });
                }
                return false;
              },
            },
            {
              field: 'CollectionDate',
              headerName: 'Sample Collection Date',
              minWidth: 150,
              filter: 'agDateColumnFilter',
              valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
            },
            {
              field: 'CollectedByName',
              headerName: 'Collected By',
              minWidth: 150,
              filter: 'agTextColumnFilter',
              valueFormatter: (params) => params.value || '-',
            },
            {
              field: 'StoreName',
              headerName: 'Store',
              minWidth: 120,
              filter: 'agTextColumnFilter',
            },
            {
              field: 'StoreLocationName',
              headerName: 'Location',
              minWidth: 150,
              filter: 'agTextColumnFilter',
            },
            {
              field: 'QC_Actions',
              headerName: '',
              minWidth: 60,
              pinned: 'right',
              filter: false,
              sortable: false,
              cellRenderer: qcActionButtonsRenderer,
            },
            {
              field: 'Status',
              headerName: 'QC Status',
              minWidth: 150,
              // pinned: 'right',
              filter: 'agTextColumnFilter',
              cellRenderer: statusRenderer,
            },

            // {
            //   field: 'isClose',
            //   headerName: 'Closed',
            //   minWidth: 80,
            //   filter: 'agSetColumnFilter',
            //   valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
            //   cellStyle: (params) => ({
            //     color: params.value ? '#f44336' : '#4caf50',
            //     fontWeight: 'bold',
            //   }),
            // },
            {
              field: 'GradingDate',
              headerName: 'Grading Collection Date',
              minWidth: 150,
              filter: 'agDateColumnFilter',
              valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
            },
            {
              field: 'GradingByName',
              headerName: 'Graded By',
              minWidth: 150,
              filter: 'agTextColumnFilter',
              valueFormatter: (params) => params.value || '-',
            },
            {
              field: 'Grading',
              headerName: 'Grading',
              minWidth: 150,
              pinned: 'left',
              filter: 'agSetColumnFilter',
              editable: true,
              disabled: (params) => !params.data.QCSampleID,
              type: 'singleSelect',
              cellEditor: 'agSelectCellEditor',
              cellEditorParams: {
                values: gradingOptions.map((option) => option.GradeName),
              },
              cellRenderer: gradingRenderer,
              // valueFormatter: (params) => params.value || 'Please select a grading',
              valueSetter: async (params) => {
                if (params.newValue === params.oldValue) return false;
                const success = await handleGradingChange(params);
                return success;
              },
            },
          ]
        : [
            {
              field: 'Vender',
              headerName: 'Vendor',
              minWidth: 200,
              filter: 'agTextColumnFilter',
            },
            {
              field: 'GRNNO',
              headerName: 'GRN No',
              minWidth: 120,
              filter: 'agTextColumnFilter',
            },
            {
              field: 'GRNDate',
              headerName: 'GRN Date',
              minWidth: 120,
              filter: 'agDateColumnFilter',
              valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
            },
            {
              field: 'POCode',
              headerName: 'PO Number',
              minWidth: 120,
              filter: 'agTextColumnFilter',
              valueFormatter: (params) => params.value || '-',
            },
            {
              field: 'ChallanNo',
              headerName: 'Challan No',
              minWidth: 120,
              filter: 'agTextColumnFilter',
            },
            {
              field: 'ChallanDate',
              headerName: 'Challan Date',
              minWidth: 120,
              filter: 'agDateColumnFilter',
              valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
            },
            {
              field: 'ItemDescription',
              headerName: 'Item Description',
              minWidth: 150,
              filter: 'agTextColumnFilter',
            },
            {
              field: 'Total_PO_Qty',
              headerName: 'PO Qty',
              minWidth: 100,
              type: 'numericColumn',
              filter: 'agNumberColumnFilter',
              valueFormatter: (params) => {
                const value = params.value ? fNumber(params.value) : '0.00';
                return params.data.IsConverted
                  ? `${value} KG (${fNumber(params.data.Original_PO_Qty)} LBS)`
                  : `${value} ${params.data.UOMName}`;
              },
            },
            {
              field: 'Total_Receive_Qty',
              headerName: 'Receive Qty',
              minWidth: 150,
              type: 'numericColumn',
              filter: 'agNumberColumnFilter',
              valueFormatter: (params) => {
                const value = params.value ? fNumber(params.value) : '0.00';
                return params.data.IsConverted
                  ? `${value} KG (${fNumber(params.data.Original_Total_Qty)} LBS)`
                  : `${value} ${params.data.UOMName}`;
              },
            },
            {
              field: 'Passed_Qty',
              headerName: 'Passed Qty',
              minWidth: 150,
              type: 'numericColumn',
              filter: 'agNumberColumnFilter',
              // editable: (params) => params.data.Status !== 'Completed',
              cellStyle: (params) => ({
                // backgroundColor: params.data.Status === 'Completed' ? '#e8f5e920' : '#63913a20',
                // opacity: params.data.isClose ? 0.6 : 1,
              }),
              valueFormatter: (params) => {
                const value = params.value ? fNumber(params.value) : '0.00';
                return params.data.IsConverted && params.value !== null
                  ? `${value} KG (${fNumber(params.data.Original_SampleQty)} LBS)`
                  : `${value} ${params.data.UOMName}`;
              },
              valueSetter: (params) => {
                // if (params.data.isClose) return false; // Prevent editing if closed

                const newValue = parseFloat(params.newValue) || 0;
                const maxValue = params.data.Total_Receive_Qty;

                if (newValue <= maxValue) {
                  // Convert back to LBS if needed for API submission
                  const originalValue = params.data.IsConverted ? newValue / 0.453592 : newValue;

                  params.data.Passed_Qty = newValue;
                  params.data.Original_Passed_Qty = originalValue;
                  params.data.Rejected_Qty = maxValue - newValue;
                  params.data.Original_Reject_Qty = params.data.Original_Total_Qty - originalValue;
                  // params.data.Status =
                  //   newValue === maxValue
                  //     ? 'Approved'
                  //     : newValue === 0
                  //       ? 'Rejected'
                  //       : newValue > 0
                  //         ? 'Partially Approved'
                  //         : 'Pending';
                  handlePassedQtyChange(params);
                  return true;
                  // eslint-disable-next-line
                } else {
                  enqueueSnackbar(`Passed Qty cannot exceed Receive Qty (${maxValue})`, {
                    variant: 'error',
                  });
                }
                return false;
              },
            },
            {
              field: 'Rejected_Qty',
              headerName: 'Rejected Qty',
              minWidth: 150,
              type: 'numericColumn',
              filter: 'agNumberColumnFilter',
              cellStyle: (params) => ({
                backgroundColor: params.data.Status === 'Rejected' && '#ffebee20',
                // opacity: params.data.isClose ? 0.6 : 1,
              }),
              valueFormatter: (params) => {
                const value = params.value ? fNumber(params.value) : '0.00';
                return params.data.IsConverted && params.value !== null
                  ? `${value} KG (${fNumber(params.data.Original_Reject_Qty)} LBS)`
                  : `${value} ${params.data.UOMName}`;
              },
            },
            {
              field: 'AttachmentPath',
              headerName: 'Attachment',
              minWidth: 100,
              cellRenderer: attachmentRenderer,
              cellStyle: (params) => ({
                border: params.data.QC_ID !== 0 && '1px solid #63913a40',
              }),
              filter: false,
              sortable: false,
            },
            {
              field: 'SampleQty',
              headerName: 'Sample Qty',
              minWidth: 150,
              type: 'numericColumn',
              filter: 'agNumberColumnFilter',
              editable: true,
              cellStyle: (params) => ({
                backgroundColor: '#63913a20',
                border: '1px solid #63913a40',
              }),
              valueFormatter: (params) => {
                const value = params.value ? fNumber(params.value) : '0.00';
                return params.data.IsConverted && params.value !== null
                  ? `${value} KG (${fNumber(params.data.Original_SampleQty)} LBS)`
                  : `${value} ${params.data.UOMName}`;
              },
              valueSetter: (params) => {
                // if (params.data.isClose) return false; // Prevent editing if closed

                const newValue = parseFloat(params.newValue) || 0;
                const maxValue = params.data.Passed_Qty;

                if (newValue <= maxValue) {
                  // Convert back to LBS if needed for API submission
                  const originalValue = params.data.IsConverted ? newValue / 0.453592 : newValue;

                  params.data.SampleQty = newValue;
                  params.data.Original_SampleQty = originalValue;
                  // params.data.Rejected_Qty = maxValue - newValue;
                  // params.data.Original_Reject_Qty = params.data.Original_Total_Qty - originalValue;
                  params.data.Status = 'Sample Collected';

                  handleSampleQtyChange(params);
                  return true;
                  // eslint-disable-next-line
                } else {
                  enqueueSnackbar(`Sample Qty cannot exceed Passed Qty (${maxValue})`, {
                    variant: 'error',
                  });
                }
                return false;
              },
            },
            {
              field: 'CollectionDate',
              headerName: 'Sample Collection Date',
              minWidth: 150,
              filter: 'agDateColumnFilter',
              valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
            },
            {
              field: 'CollectedByName',
              headerName: 'Collected By',
              minWidth: 150,
              filter: 'agTextColumnFilter',
              valueFormatter: (params) => params.value || '-',
            },
            {
              field: 'StoreName',
              headerName: 'Store',
              minWidth: 120,
              filter: 'agTextColumnFilter',
            },
            {
              field: 'StoreLocationName',
              headerName: 'Location',
              minWidth: 150,
              filter: 'agTextColumnFilter',
            },
            {
              field: 'Status',
              headerName: 'QC Status',
              minWidth: 150,
              // pinned: 'right',
              filter: 'agTextColumnFilter',
              cellRenderer: statusRenderer,
            },
            {
              field: 'QC_Actions',
              headerName: '',
              minWidth: 60,
              pinned: 'right',
              filter: false,
              sortable: false,
              cellRenderer: qcActionButtonsRenderer,
            },

            // {
            //   field: 'isClose',
            //   headerName: 'Closed',
            //   minWidth: 80,
            //   filter: 'agSetColumnFilter',
            //   valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
            //   cellStyle: (params) => ({
            //     color: params.value ? '#f44336' : '#4caf50',
            //     fontWeight: 'bold',
            //   }),
            // },
            {
              field: 'GradingDate',
              headerName: 'Grading Collection Date',
              minWidth: 150,
              filter: 'agDateColumnFilter',
              valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
            },
            {
              field: 'GradingByName',
              headerName: 'Graded By',
              minWidth: 150,
              filter: 'agTextColumnFilter',
              valueFormatter: (params) => params.value || '-',
            },
            {
              field: 'Grading',
              headerName: 'Grading',
              minWidth: 150,
              pinned: 'left',
              filter: 'agTextColumnFilter',
              // cellEditorParams: {
              //   values: gradingOptions.map((option) => option.GradeName),
              // },
              cellRenderer: gradingRenderer2,
              // valueFormatter: (params) => params.value || 'Please select a grading',
              // valueSetter: async (params) => {
              //   if (params.newValue === params.oldValue) return false;
              //   const success = await handleGradingChange(params);
              //   return success;
              // },
            },
          ],
    [
      gradingOptions,
      handleSampleQtyChange,
      handleGradingChange,
      userData,
      handlePassedQtyChange,
      enqueueSnackbar,
      attachmentRenderer,
      gradingUsers,
    ]
  );

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleSearchChange = (field) => (event) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={containerStyle}>
      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={filterTab} onChange={handleTabChange} aria-label="status filter tabs">
          <Tab
            value="all"
            label="All"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant={filterTab === 'all' ? 'filled' : 'soft'} color="default">
                {tabCounts.all}
              </Label>
            }
          />
          <Tab
            value="completed"
            label="Completed"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant={filterTab === 'completed' ? 'filled' : 'soft'} color="primary">
                {tabCounts.completed}
              </Label>
            }
          />
          <Tab
            value="sampleCollected"
            label="Sample Collected"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant={filterTab === 'sampleCollected' ? 'filled' : 'soft'} color="warning">
                {tabCounts.sampleCollected}
              </Label>
            }
          />
          <Tab
            value="noSample"
            label="No Sample"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant={filterTab === 'noSample' ? 'filled' : 'soft'} color="error">
                {tabCounts.noSample}
              </Label>
            }
          />
        </Tabs>
      </Box>

      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Search GRN No"
            variant="outlined"
            size="small"
            value={searchParams.GRNNO}
            onChange={handleSearchChange('GRNNO')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Search Item "
            variant="outlined"
            size="small"
            value={searchParams.ItemDescription}
            onChange={handleSearchChange('ItemDescription')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Search Vendor"
            variant="outlined"
            size="small"
            value={searchParams.Vender}
            onChange={handleSearchChange('Vender')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Zoom in" arrow placement="top">
            <IconButton
              color="primary"
              sx={{ border: '1px solid #eee' }}
              onClick={() => setZoomLevel((prev) => prev + 0.1)}
            >
              <Iconify icon="si:zoom-in-duotone" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom out" arrow placement="top">
            <IconButton
              color="primary"
              sx={{ border: '1px solid #eee' }}
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.1))}
            >
              <Iconify icon="si:zoom-out-duotone" width={20} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <div
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left',
          width: `${100 / zoomLevel}%`,
          height: `${100 / zoomLevel}%`,
          overflow: 'hidden',
        }}
      >
        <Scrollbar>
          <AgGridReact
            className="ag-theme-material"
            theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
            rowData={filteredData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={35}
            headerHeight={40}
            animateRows
            pagination
            paginationPageSize={20}
            domLayout="autoHeight"
            suppressRowClickSelection
            onFirstDataRendered={onFirstDataRendered}
          />
        </Scrollbar>

        <ConfirmDialog
          open={confirm.value}
          onClose={() => {
            confirm.onFalse();
            setSelectedItem(null);
          }}
          title="Reject Item"
          content={`Are you sure you want to reject ${selectedItem?.Material_Code || 'this item'}?`}
          action={
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                if (selectedItem) {
                  handleReject(selectedItem);
                }
                confirm.onFalse();
              }}
            >
              Confirm Reject
            </Button>
          }
        />
      </div>
      <ItemQCRejectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        rejectedQty={selectedItem?.Rejected_Qty || 0}
        selectedItem={selectedItem}
      />
      <UploadExcelDialog
        uploadOpen={uploadDialogOpen}
        uploadClose={handleUploadDialogClose}
        FetchUpdatedData={fetchQCs}
        image={selectedQC?.AttachmentPath}
        QC_ID={selectedQC?.QC_ID}
      />
      <ItemQCEntryDialog
        open={qcEntryDialogOpen}
        onClose={() => {
          setQcEntryDialogOpen(false);
          setSelectedQCEntry(null);
          setIsEditMode(false);
        }}
        selectedItem={selectedQCEntry}
        isEditMode={isEditMode}
        onSuccess={() => {
          fetchQCs();
        }}
      />
    </div>
  );
};

export default QCGrid;
