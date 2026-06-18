import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Delete, Get, Post } from 'src/api/apibasemethods';
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
} from '@mui/material';
import { Stack, useTheme } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import { fDate } from 'src/utils/format-time';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { fNumber } from 'src/utils/format-number';
import ItemQCRejectDialog from './ItemQCRejectDialog';
import InvoiceAnalytic from './invoice-analytic';
import { sumBy } from 'lodash';

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
  const [searchParams, setSearchParams] = useState({
    GRNNO: '',
    ItemDescription: '',
    Vender: '',
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const convertLbsToKg = (quantity, uomId) => (uomId === 7 ? quantity * 0.453592 : quantity);

  const containerStyle = useMemo(() => ({ width: '100%', height: '500px' }), []);

  // Fetch QC data
  const fetchQCs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetAllReceiveListWithQC?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200) {
        const formattedData = response.data.map((item) => {
          const totalPoQty = convertLbsToKg(item?.Total_PO_Qty, item?.UOMID);
          const totalQty = convertLbsToKg(item?.Total_Receive_Qty, item?.UOMID);
          const passedQty = item?.Passed_Qty ? convertLbsToKg(item?.Passed_Qty, item?.UOMID) : null;
          const rejectQty = item?.Reject_Qty ? convertLbsToKg(item?.Reject_Qty, item?.UOMID) : null;
          return {
            // Map new API fields to existing field names
            Receive_No: item.GRNNO,
            Receive_Date: item.GRNDate,
            SampleQty: item.SampleQty,
            VendorID: item.VendorID,
            PO_No: item.GRNNO, // You might need to adjust this if PO No is different
            PO_Date: item.GRNDate, // You might need to adjust this if PO Date is different
            Material_Code: item.Item_ID.toString(),
            Specification: `Item ${item.Item_ID}`, // You might need to fetch item name separately
            Total_PO_Qty: totalPoQty,
            Total_Receive_Qty: totalQty,
            Passed_Qty: passedQty || 0,
            Reject_Qty: rejectQty || 0,
            Rejected_Qty: rejectQty || totalQty - (passedQty || 0),
            UOMID: item.UOMID,
            UOMName: item.UOMName,
            Vender: item.Vender,
            StoreName: item.StoreName,
            StoreLocationName: item.StoreLocationName,
            Status:
              passedQty === totalQty
                ? 'Approved'
                : passedQty === 0
                  ? 'Rejected'
                  : passedQty > 0
                    ? 'Partially Approved'
                    : 'Pending',
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
            Item_ID: item.Item_ID,
            ItemDescription: item.ItemDescription,
            StoreID: item.StoreID,
            StoreLocationID: item.StoreLocationID,
            isClose: item.isClose,
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
  }, [enqueueSnackbar, userData]);

  useEffect(() => {
    fetchQCs();
  }, [fetchQCs]);

  // Filter data based on search parameters
  const filteredData = useMemo(
    () =>
      rowData.filter(
        (item) =>
          item.GRNNO.toLowerCase().includes(searchParams.GRNNO.toLowerCase()) &&
          item.ItemDescription.toLowerCase().includes(searchParams.ItemDescription.toLowerCase()) &&
          item.Vender.toLowerCase().includes(searchParams.Vender.toLowerCase())
      ),
    [rowData, searchParams]
  );

  const handlePassedQtyChange = useCallback(
    async (params) => {
      try {
        const newPassedQty = parseFloat(params.newValue) || 0;
        const newRejectedQty = params.data.Total_Receive_Qty - newPassedQty;

        const updatedData = {
          ...params.data,
          Passed_Qty: newPassedQty,
          Rejected_Qty: newRejectedQty,
          Status:
            newPassedQty === params.data.Total_Receive_Qty
              ? 'Approved'
              : newPassedQty === 0
                ? 'Rejected'
                : 'Partially Approved',
        };

        // Update local state immediately
        setRowData((prev) =>
          prev.map((item) => (item.GRNDtlID === updatedData.GRNDtlID ? updatedData : item))
        );

        // If fully approved, submit to API
        if (newPassedQty === params.data.Total_Receive_Qty) {
          const currentDate = new Date().toISOString();
          await Post('AddQCWithRejections', {
            GRNDTLID: updatedData.GRNDtlID,
            UOMID: updatedData.UOMID,
            Total_Received: updatedData.Total_Receive_Qty || 0,
            Passed_Qty: updatedData.Passed_Qty || 0,
            SampleQty: params.data.SampleQty,
            isSampleRec: params.data.isSampleRec || 'N',
            Remarks: 'All units passed QC',
            Approval_Status: 'Approved',
            Approval_Level: 1,
            VendorID: params.data.VendorID,
            QC_Date: currentDate,
            Created_By: userData?.userDetails?.userId || 1,
            Rejections: [],
            // Sample: null,
          });
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
        await Post('AddQCWithRejections', {
          GRNDTLID: params.data.GRNDtlID,
          UOMID: params.data.UOMID,
          isSampleRec: 'Y',
          SampleQty: newSampleQty || 0,
          Total_Received: params.data.Total_Receive_Qty,
          Passed_Qty: params?.data?.Passed_Qty || 0,
          Remarks: 'All units passed QC',
          Approval_Status: 'Approved',
          Approval_Level: 1,
          QC_Date: currentDate,
          VendorID: params.data.VendorID,
          Created_By: userData?.userDetails?.userId || 1,
          Rejections: [],
          Sample: {
            SampleQty: newSampleQty,
            UOMID: params.data.UOMID,
            VendorID: params.data.VendorID,
            GRNDTLID: params.data.GRNDtlID,
            ItemID: params.data.Item_ID,
          },
        });
      } catch (error) {
        console.error('Error updating sample quantity:', error);
      }
    },
    [userData?.userDetails?.userId]
  );

  // Similarly update the handleApprove function to use the same API structure
  const handleApprove = useCallback(
    async (item) => {
      try {
        const updatedData = {
          ...item,
          Passed_Qty: item.Total_Receive_Qty,
          Rejected_Qty: 0,
          Status: 'Approved',
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
          setRowData((prev) => prev.map((i) => (i.GRNDtlID === item.GRNDtlID ? updatedData : i)));
          enqueueSnackbar('Item approved and QC data submitted', { variant: 'success' });
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

  // Status renderer
  const statusRenderer = (params) => {
    let bgColor;
    switch (params.value) {
      case 'Approved':
        bgColor = '#4CAF50'; // Green
        break;
      case 'Rejected':
        bgColor = '#F44336'; // Red
        break;
      case 'Partially Approved':
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
        {params.value}
      </div>
    );
  };

  // Action buttons renderer
  const actionButtonsRenderer = (params) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      <Tooltip title="Approve" arrow>
        <IconButton
          onClick={() => handleApprove(params.data)}
          color="success"
          size="small"
          disabled={params.data.Status === 'Approved'}
        >
          <Iconify icon="mdi:check-circle" width={20} />
        </IconButton>
      </Tooltip>
    </div>
  );

  // Column definitions
  const [columnDefs] = useState([
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
    // {
    //   field: 'Passed_Qty',
    //   headerName: 'Passed Qty',
    //   minWidth: 150,
    //   type: 'numericColumn',
    //   filter: 'agNumberColumnFilter',
    //   editable: (params) => params.data.Status !== 'Approved',
    //   cellStyle: (params) => ({
    //     backgroundColor: params.data.Status === 'Approved' ? '#e8f5e9' : '#f5f5f5',
    //     // opacity: params.data.isClose ? 0.6 : 1,
    //   }),
    //   valueFormatter: (params) => {
    //     const value = params.value ? fNumber(params.value) : '0.00';
    //     return params.data.IsConverted && params.value !== null
    //       ? `${value} KG (${fNumber(params.data.Original_SampleQty)} LBS)`
    //       : `${value} ${params.data.UOMName}`;
    //   },
    //   valueSetter: (params) => {
    //     // if (params.data.isClose) return false; // Prevent editing if closed

    //     const newValue = parseFloat(params.newValue) || 0;
    //     const maxValue = params.data.Total_Receive_Qty;

    //     if (newValue <= maxValue) {
    //       // Convert back to LBS if needed for API submission
    //       const originalValue = params.data.IsConverted ? newValue / 0.453592 : newValue;

    //       params.data.Passed_Qty = newValue;
    //       params.data.Original_Passed_Qty = originalValue;
    //       params.data.Rejected_Qty = maxValue - newValue;
    //       params.data.Original_Reject_Qty = params.data.Original_Total_Qty - originalValue;
    //       params.data.Status =
    //         newValue === maxValue
    //           ? 'Approved'
    //           : newValue === 0
    //             ? 'Rejected'
    //             : newValue > 0
    //               ? 'Partially Approved'
    //               : 'Pending';
    //       handlePassedQtyChange(params);
    //       return true;
    //     }
    //     return false;
    //   },
    // },
    // {
    //   field: 'Rejected_Qty',
    //   headerName: 'Rejected Qty',
    //   minWidth: 150,
    //   type: 'numericColumn',
    //   filter: 'agNumberColumnFilter',
    //   cellStyle: (params) => ({
    //     backgroundColor: params.data.Status === 'Rejected' && '#ffebee',
    //     // opacity: params.data.isClose ? 0.6 : 1,
    //   }),
    //   valueFormatter: (params) => {
    //     const value = params.value ? fNumber(params.value) : '0.00';
    //     return params.data.IsConverted && params.value !== null
    //       ? `${value} KG (${fNumber(params.data.Original_Reject_Qty)} LBS)`
    //       : `${value} ${params.data.UOMName}`;
    //   },
    // },
    // {
    //   field: 'Status',
    //   headerName: 'Status',
    //   minWidth: 150,
    //   pinned: 'right',
    //   filter: 'agSetColumnFilter',
    //   cellRenderer: statusRenderer,
    // },
    {
      field: 'SampleQty',
      headerName: 'Sample Qty',
      minWidth: 150,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      editable: true,
      cellStyle: (params) => ({
        backgroundColor: '#f5f5f5',
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

          params.data.SampleQty = newValue;
          params.data.Original_SampleQty = originalValue;
          // params.data.Rejected_Qty = maxValue - newValue;
          // params.data.Original_Reject_Qty = params.data.Original_Total_Qty - originalValue;
          // params.data.Status =
          //   newValue === maxValue
          //     ? 'Approved'
          //     : newValue === 0
          //       ? 'Rejected'
          //       : newValue > 0
          //         ? 'Partially Approved'
          //         : 'Pending';
          handleSampleQtyChange(params);
          return true;
        }
        return false;
      },
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
      field: 'isClose',
      headerName: 'Closed',
      minWidth: 80,
      filter: 'agSetColumnFilter',
      valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
      cellStyle: (params) => ({
        color: params.value ? '#f44336' : '#4caf50',
        fontWeight: 'bold',
      }),
    },
  ]);

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
    </div>
  );
};

export default QCGrid;
