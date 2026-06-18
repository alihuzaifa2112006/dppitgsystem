import { useState, useEffect, useMemo, useCallback } from 'react'; // useMemo और useCallback import करें
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Divider,
} from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get } from 'src/api/apibasemethods';
import { fDate, fDateTime } from 'src/utils/format-time';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-community';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import { fNumber } from 'src/utils/format-number';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

// History Dialog Component with AG Grid
const DialogHistory = ({ open, onClose, piId, currentPi }) => {
  const [historyData, setHistoryData] = useState(null);
  const settings = useSettingsContext();
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  console.log('currentPi', currentPi);

  // Detail grid column definitions for history
  const historyDetailColumnDefs = useMemo(
    () => [
      {
        field: 'ItemID',
        headerName: 'Item Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Description',
        headerName: 'Description',
        minWidth: 300,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Qty',
        headerName: 'Quantity',
        minWidth: 100,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => `${fNumber(params.value)} ${params.data.UOMName} ` || '-',
      },
      {
        field: 'UnitPrice',
        headerName: 'Unit Price',
        minWidth: 120,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? `$${fNumber(params.value)}` : '-'),
      },
      {
        field: 'TotalAmount',
        headerName: 'Total Amount',
        minWidth: 140,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? `$${fNumber(params.value)}` : '-'),
      },
      {
        field: 'ColorRefCode',
        headerName: 'Color Ref Code',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ConesQty',
        headerName: 'Cones Qty',
        minWidth: 100,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? fNumber(params.value) : '-'),
      },
      {
        field: 'DeliveryDate',
        headerName: 'Delivery Date',
        minWidth: 120,
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
    ],
    []
  );

  // Detail grid column definitions for current PI
  const currentPIDetailColumnDefs = useMemo(
    () => [
      {
        field: 'Item_Code',
        headerName: 'Item Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Description',
        headerName: 'Description',
        minWidth: 300,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Quantity',
        headerName: 'Quantity',
        minWidth: 100,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) =>
          `${fNumber(params.value)} ${params.data.UOMNAME || params.data.UOMName || ''} ` || '-',
      },
      {
        field: 'UnitPrice',
        headerName: 'Unit Price',
        minWidth: 120,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? `$${fNumber(params.value)}` : '-'),
      },
      {
        field: 'Total_Amount',
        headerName: 'Total Amount',
        minWidth: 140,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? `$${fNumber(params.value)}` : '-'),
      },
      {
        field: 'Color_Ref_Code',
        headerName: 'Color Ref Code',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        valueGetter: (params) => params.data?.Color_Ref_Code || params.data?.ColorRefCode || '',
      },
      {
        field: 'Cones_Qty',
        headerName: 'Cones Qty',
        minWidth: 100,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? fNumber(params.value) : '-'),
        valueGetter: (params) => params.data?.Cones_Qty || params.data?.ConesQty || 0,
      },
      {
        field: 'Delivery_Date',
        headerName: 'Delivery Date',
        minWidth: 120,
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
        valueGetter: (params) => params.data?.Delivery_Date || params.data?.DeliveryDate || '',
      },
    ],
    []
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

  const fetchHistory = useCallback(async () => {
    if (!piId) return;

    try {
      setLoading(true);
      const response = await Get(`GetReOpenProformaInvoiceHistory?PIID=${piId}`);

      if (response.status === 200 && response.data) {
        setHistoryData(response.data);
      } else {
        enqueueSnackbar('Failed to load history data', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      enqueueSnackbar('Error loading history data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [piId, enqueueSnackbar]);

  // Fetch data when dialog opens
  useEffect(() => {
    if (open && piId) {
      fetchHistory();
    }
  }, [open, piId, fetchHistory]);

  // Format master data for AG Grid - handle array response
  const historyMasterRowData = useMemo(() => {
    if (!historyData || !Array.isArray(historyData)) return [];
    return historyData.map((item) => {
      const details = item.Details || [];
      const firstDetail = details[0] || {};

      return {
        ...item.Master,
        // Prefer the first detail's reapproved date if available
        ReapprovedDate: firstDetail.ReapprovedDate || item.Master?.ReapprovedDate || null,
        // Store the Details array in the row data for easy access
        _details: details,
      };
    });
  }, [historyData]);

  // Format current PI data for AG Grid
  const currentPIRowData = useMemo(() => {
    if (!currentPi) return [];

    const details = currentPi.ProformaDtl || currentPi._details || [];
    return [
      {
        ...currentPi,
        _details: details,
      },
    ];
  }, [currentPi]);

  // Configure master-detail relationship for history
  const historyDetailCellRendererParams = useMemo(
    () => ({
      detailGridOptions: {
        columnDefs: historyDetailColumnDefs,
        defaultColDef,
      },
      getDetailRowData: (params) => {
        // Get Details from the row data
        const details = params.data?._details;
        if (details && Array.isArray(details)) {
          params.successCallback(details);
        }
      },
    }),
    [historyDetailColumnDefs, defaultColDef]
  );

  // Configure master-detail relationship for current PI
  const currentPIDetailCellRendererParams = useMemo(
    () => ({
      detailGridOptions: {
        columnDefs: currentPIDetailColumnDefs,
        defaultColDef,
      },
      getDetailRowData: (params) => {
        // Get Details from the row data
        const details = params.data?._details;
        if (details && Array.isArray(details)) {
          params.successCallback(details);
        }
      },
    }),
    [currentPIDetailColumnDefs, defaultColDef]
  );

  // Master column definitions for history grid
  const historyMasterColumnDefs = useMemo(
    () => [
      {
        field: 'expand',
        headerName: '',
        minWidth: 35,
        maxWidth: 50,
        filter: false,
        autosize: true,
        sortable: false,
        resizable: false,
        lockPosition: 'left',
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
          innerRenderer: (params) => (params.value ? params.value : ''),
        },
        cellStyle: { marginTop: '2px' },
      },
      {
        field: 'PINO',
        headerName: 'PI Number',
        minWidth: 150,
      },
      {
        field: 'ReapprovedDate',
        headerName: 'Reapproved Date & Time',
        minWidth: 150,
        valueFormatter: (params) => (params.value ? fDateTime(new Date(params.value)) : '-'),
      },
      {
        field: 'PIDate',
        headerName: 'PI Date',
        minWidth: 120,
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
      },
      {
        field: 'CreatedDate',
        headerName: 'Created Date',
        minWidth: 150,
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'ValidFrom',
        headerName: 'Valid From',
        minWidth: 120,
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'ValidUntil',
        headerName: 'Valid Until',
        minWidth: 120,
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'KAMName',
        headerName: 'KAM Name',
        minWidth: 150,
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'EndCustomerName',
        headerName: 'End Customer',
        minWidth: 150,
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'WICName',
        headerName: 'WIC Name',
        minWidth: 150,
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'AgentName',
        headerName: 'Agent',
        minWidth: 120,
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'PaymentTerm',
        headerName: 'Payment Term',
        minWidth: 120,
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'CurrencyCode',
        headerName: 'Currency',
        minWidth: 80,
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Remarks',
        headerName: 'Remarks',
        minWidth: 200,
        valueFormatter: (params) => params.value || '-',
      },
    ],
    []
  );

  // Master column definitions for current PI grid
  const currentPIMasterColumnDefs = useMemo(
    () => [
      {
        field: 'expand',
        headerName: '',
        minWidth: 35,
        maxWidth: 50,
        filter: false,
        autosize: true,
        sortable: false,
        resizable: false,
        lockPosition: 'left',
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
          innerRenderer: (params) => (params.value ? params.value : ''),
        },
        cellStyle: { marginTop: '2px' },
      },
      {
        field: 'PINo',
        headerName: 'PI Number',
        minWidth: 150,
        valueGetter: (params) => params.data?.PINo || params.data?.PINO || '',
      },
      {
        field: 'PIDate',
        headerName: 'PI Date',
        minWidth: 120,
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
      },
      {
        field: 'CreatedOn',
        headerName: 'Created Date',
        minWidth: 150,
        valueFormatter: (params) => {
          const value = params.data?.CreatedOn || params.data?.CreatedDate || params.value;
          return value ? fDate(new Date(value)) : '-';
        },
      },
      {
        field: 'Valid_From',
        headerName: 'Valid From',
        minWidth: 120,
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
        valueGetter: (params) => params.data?.Valid_From || params.data?.ValidFrom || '',
      },
      {
        field: 'Valid_Until',
        headerName: 'Valid Until',
        minWidth: 120,
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
        valueGetter: (params) => params.data?.Valid_Until || params.data?.ValidUntil || '',
      },
      {
        field: 'KAM_UserName',
        headerName: 'KAM Name',
        minWidth: 150,
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'End_Cust_Name',
        headerName: 'End Customer',
        minWidth: 150,
        valueFormatter: (params) => params.value || '-',
        valueGetter: (params) => params.data?.End_Cust_Name || params.data?.EndCustomerName || '',
      },
      {
        field: 'WIC_Name',
        headerName: 'WIC Name',
        minWidth: 150,
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Agent_Name',
        headerName: 'Agent',
        minWidth: 120,
        valueFormatter: (params) => params.value || '-',
        valueGetter: (params) => params.data?.Agent_Name || params.data?.AgentName || '',
      },
      {
        field: 'Payment_Term',
        headerName: 'Payment Term',
        minWidth: 120,
        valueFormatter: (params) => params.value || '-',
        valueGetter: (params) => params.data?.Payment_Term || params.data?.PaymentTerm || '',
      },
      {
        field: 'Currency_Name',
        headerName: 'Currency',
        minWidth: 80,
        valueFormatter: (params) => params.value || '-',
        valueGetter: (params) =>
          params.data?.Currency_Code ||
          params.data?.CurrencyCode ||
          params.data?.Currency_Name ||
          '',
      },
      {
        field: 'Remarks',
        headerName: 'Remarks',
        minWidth: 200,
        valueFormatter: (params) => params.value || '-',
      },
    ],
    []
  );

  return (
    <Dialog
      open={open}
      // fullScreen
      onClose={onClose}
      // maxWidth="xl"
      fullWidth
      sx={{ '& .MuiDialog-paper': { width: '98%', maxWidth: '1600px', height: '90vh' } }}
    >
      <DialogTitle>
        PI Comparison - Current vs History -{' '}
        {currentPi?.PINo || currentPi?.PINO || `PI ID: ${piId}`}
        {Array.isArray(historyData) &&
          historyData.length > 0 &&
          ` (${historyData.length} history entries)`}
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {loading ? (
          <LoadingScreen />
        ) : (
          <Grid container spacing={2} sx={{ height: 'calc(90vh - 120px)' }}>
            {/* Left Side - Current PI */}
            <Grid item xs={12} lg={6}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                  Current PI
                </Typography>
                <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                  {currentPIRowData.length > 0 ? (
                    <Scrollbar sx={{ maxHeight: 'calc(90vh - 200px)' }}>
                      <AgGridReact
                        className="ag-theme-material"
                        theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
                        rowData={currentPIRowData}
                        columnDefs={currentPIMasterColumnDefs}
                        defaultColDef={defaultColDef}
                        masterDetail
                        detailCellRendererParams={currentPIDetailCellRendererParams}
                        domLayout="autoHeight"
                        suppressRowClickSelection
                      />
                    </Scrollbar>
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography color="text.secondary">Current PI data unavailable</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Divider */}
            {/* <Grid item xs={12} lg={0.5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Divider orientation="vertical" flexItem />
            </Grid> */}

            {/* Right Side - History */}
            <Grid item xs={12} lg={6}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', color: 'default.main' }}>
                  Reopen History
                </Typography>
                <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                  {historyData && Array.isArray(historyData) && historyData.length > 0 ? (
                    <Scrollbar sx={{ maxHeight: 'calc(90vh - 200px)' }}>
                      <AgGridReact
                        className="ag-theme-material"
                        theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
                        rowData={historyMasterRowData}
                        columnDefs={historyMasterColumnDefs}
                        defaultColDef={defaultColDef}
                        masterDetail
                        detailCellRendererParams={historyDetailCellRendererParams}
                        domLayout="autoHeight"
                        suppressRowClickSelection
                      />
                    </Scrollbar>
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography color="text.secondary">No history data available</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DialogHistory.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  piId: PropTypes.number,
  currentPi: PropTypes.object,
};

export default DialogHistory;
