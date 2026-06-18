import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableContainer,
  Tooltip,
  Typography,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';

import { Get, Post } from 'src/api/apibasemethods';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import Scrollbar from 'src/components/scrollbar';
import {
  TableEmptyRows,
  useTable,
  emptyRows,
  TableHeadCustom,
  TableNoData,
} from 'src/components/table';
import GoodsRecievedConfirmationTableRow from './GoodsRecievedConfirmation-table-row';
import ItemDialog from './ItemDialog';
import { AgGridReact } from 'ag-grid-react';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

// ----------------------------------------------------------------------

export default function GoodsRecievedConfirmationCreateForm() {
  const router = useRouter();
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [RequestDetails, setRequestDetails] = useState([]);

  const [allIssues, setAllIssues] = useState([]);

  const [selectedRows, setSelectedRows] = useState([]);

  const NewGoodsRecievedConfirmationSchema = Yup.object().shape({
    ReceivedDate: Yup.date().required('Received Date is required'),
    IssueCode: Yup.object().required('Issue Code is required'),
    // Request: Yup.object()
    //   .shape({
    //     StoreID: Yup.number().required('Store ID is required'),
    //     StoreName: Yup.string().required('Store name is required'),
    //   })
    //   .required('Request To is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewGoodsRecievedConfirmationSchema),
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

  // Table
  const [isLoading, setLoading] = useState(false);

  const fetchIssues = useCallback(async () => {
    try {
      const response = await Get(
        `GetActiveIssues?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllIssues(response.data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      setAllIssues([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await fetchIssues();
      setLoading(false);
    };
    fetch();
  }, [fetchIssues]);

  const selectedIssue = watch('IssueCode');

  const FetchItemsFromIssueCode = useCallback(async () => {
    try {
      const response = await Get(
        `GetIssueDetailsByIssue?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}&issueId=${selectedIssue?.IssueID}`
      );
      setRequestDetails(response.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      setRequestDetails([]);
    }
  }, [selectedIssue?.IssueID, userData?.userDetails]);

  useEffect(() => {
    if (!selectedIssue?.IssueID) return;
    FetchItemsFromIssueCode();
  }, [selectedIssue?.IssueID, FetchItemsFromIssueCode]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (RequestDetails.length === 0) {
        enqueueSnackbar('Please add at least one item detail', { variant: 'error' });
        return;
      }
      //  if all       RequestDetails  has no AcceptedQty then return a message
      // if (RequestDetails.reduce((dtl) => !dtl.AcceptedQty)) {
      //   enqueueSnackbar('No Changes were made!', { variant: 'warning' });
      //   return;
      // }

      const requestData = RequestDetails.map((detail) => ({
        ReturnQty: detail?.ReturnedQty,
        Prv_Acceptd_Qty: detail?.Prv_Acceptd_Qty,
        AcceptedQty: detail?.AcceptedQty,
        IssueID: detail?.IssueID,
        IssueDtlID: detail.IssueDtlID,
        UOMID: detail.UOMID,
        IssueQty: detail?.IssueQty,
        TotalRequestedQty: detail.TotalRequestedQty || '',
        ReceiveDate: data?.ReceivedDate,
        // eslint-disable-next-line
        isClosed: detail?.IssueQty === detail?.TotalRequestedQty ? true : false,
        Remarks: detail?.Remarks || '-',
        GRNID: detail?.GRNID,
        GRNDtlID: detail?.GRNDtlID,
        ItemOpenDtlID: detail?.ItemOpenDtlID,
        ItemOpenID: detail?.ItemOpenID,
        UpdateBy: userData.userDetails.userId,
        UpdatedDate: new Date(),
        CreatedBy: userData.userDetails.userId,
        CreatedDate: new Date(),
        BranchID: userData?.userDetails?.branchID,
        OrgID: userData?.userDetails?.orgId,
      }));

      // console.log('requestData', requestData);

      const response = await Post(`InvReceiveConfirmation/AddMultiple`, requestData);

      if (response.status !== 200) {
        enqueueSnackbar(response.data.Message || 'Failed to create request', { variant: 'error' });
      } else {
        enqueueSnackbar('Request created successfully!', { variant: 'success' });
        router.push(paths.dashboard.Production.GoodsRecievedConfirmation.root);
        reset();
        setRequestDetails([]);
      }
    } catch (error) {
      console.error('Error details:', error);
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
  // AG Grid column definitions
  const columnDefs = [
    {
      field: 'SourceType',
      headerName: 'Source Type',
      width: 120,
      filter: true,
      sortable: true,
    },
    {
      field: 'TrackingID',
      headerName: 'Lot No.',
      width: 120,
      filter: true,
      sortable: true,
      valueFormatter: (params) => params?.value || '-',
      hide: true,
    },
    {
      field: 'IssueCode',
      headerName: 'Issue Code',
      width: 120,
      filter: true,
      sortable: true,
      valueFormatter: (params) => params?.value || '-',
    },
    {
      field: 'IssueDate',
      headerName: 'Issue Date',
      width: 120,
      filter: true,
      sortable: true,
      valueFormatter: (params) => fDate(params?.value) || '-',
    },
    {
      field: 'ItemCode',
      headerName: 'Item Code',
      width: 120,
      filter: true,
      sortable: true,
    },
    {
      field: 'ItemDescription',
      headerName: 'Item Description',
      width: 200,
      filter: true,
      sortable: true,
      tooltipField: 'ItemDescription',
    },
    {
      field: 'GRNNo',
      headerName: 'GRN No.',
      width: 120,
      filter: true,
      sortable: true,
      valueFormatter: (params) => params?.value || '-',
      hide: true,
    },
    {
      field: 'GRNDate',
      headerName: 'GRN Date',
      width: 120,
      filter: true,
      sortable: true,
      valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      hide: true,
    },
    {
      field: 'ChallanNo',
      headerName: 'Challan No.',
      width: 120,
      filter: true,
      sortable: true,
      valueFormatter: (params) => params?.value || '-',
      hide: true,
    },
    {
      field: 'ChallanDate',
      headerName: 'Challan Date',
      width: 120,
      filter: true,
      sortable: true,
      valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      hide: true,
    },
    {
      field: 'VendorName',
      headerName: 'Vendor Name',
      width: 120,
      filter: true,
      sortable: true,
    },
    // {
    //   field: 'ReceiveQty',
    //   headerName: 'Receive Qty',
    //   width: 130,
    //   filter: true,
    //   sortable: true,
    //   valueFormatter: (params) => {
    //     const unit = params.data?.UOMName || '';
    //     return `${fNumber(params.value) || '0'} ${unit}`;
    //   },
    // },
    // {
    //   field: 'OpenStockQty',
    //   headerName: 'Open Stock Qty',
    //   width: 150,
    //   filter: true,
    //   sortable: true,
    //   valueFormatter: (params) => {
    //     const unit = params.data?.UOMName || '';
    //     return `${fNumber(params.value) || '0'} ${unit}`;
    //   },
    // },
    {
      field: 'TotalRequestedQty',
      headerName: 'Requested Qty',
      width: 150,
      filter: true,
      sortable: true,
      type: 'numericColumn',
      cellStyle: {
        textAlign: 'right',
      },
      valueFormatter: (params) => {
        const unit = params.data?.UOMName || '';
        return `${fNumber(params.value) || '0'} ${unit}`;
      },
    },
    {
      field: 'IssueQty',
      headerName: 'Issued Qty',
      width: 150,
      filter: true,
      sortable: true,
      type: 'numericColumn',
      cellStyle: {
        textAlign: 'right',
      },
      valueFormatter: (params) => {
        const unit = params.data?.UOMName || '';
        return `${fNumber(params.value) || '0'} ${unit}`;
      },
    },
    {
      field: 'Prv_Acceptd_Qty',
      headerName: 'Previous Accepted Qty',
      width: 150,
      filter: true,
      sortable: true,
      type: 'numericColumn',
      cellStyle: {
        textAlign: 'right',
      },
      valueFormatter: (params) => {
        const unit = params.data?.UOMName || '';
        return `${fNumber(params.value) || '0'} ${unit}`;
      },
    },
    {
      field: 'AcceptedQty',
      headerName: 'Accepted Qty',
      width: 150,
      filter: true,
      editable: true,
      sortable: true,
      type: 'numericColumn',
      cellStyle: {
        backgroundColor: 'rgba(99, 145, 58, 0.15)',
        border: '1px solid rgba(99, 145, 58, 0.25)',
        textAlign: 'right',
      },
      valueSetter: (params) => {
        const newValue = Number(params.newValue);
        const issueQty = Number(params.data.IssueQty);
        const prvAcceptedQty = Number(params.data.Prv_Acceptd_Qty || 0);
        const remainingQty = issueQty - prvAcceptedQty;

        // If user input is not a number, reject
        if (Number.isNaN(newValue)) return false;

        // Determine the maximum allowable quantity
        const maxQty = Math.max(0, remainingQty);

        // Enforce max condition
        if (newValue > maxQty) {
          params.data.AcceptedQty = maxQty; // cap at maxQty
          params.data.ReturnedQty = issueQty - maxQty;
        } else if (newValue < 0) {
          params.data.AcceptedQty = 0; // cannot accept negative quantity
          params.data.ReturnedQty = issueQty; // all issued quantity is returned
        } else {
          params.data.AcceptedQty = newValue;
          params.data.ReturnedQty = issueQty - newValue;
        }
        return true; // tells ag-grid to update
      },
      valueFormatter: (params) => {
        const unit = params.data?.UOMName || '';
        return `${fNumber(params.value) || '0'} ${unit}`;
      },
    },
    // {
    //   field: 'ReturnedQty',
    //   headerName: 'Returned Qty',
    //   width: 150,
    //   filter: true,
    //   sortable: true,
    //   type: 'numericColumn',
    //   cellStyle: {
    //     textAlign: 'right',
    //   },
    //   valueFormatter: (params) => {
    //     const unit = params.data?.UOMName || '';
    //     return `${fNumber(params.value) || '0'} ${unit}`;
    //   },
    //   // Make ReturnedQty non-editable since it's calculated
    //   editable: false,
    // },
    {
      field: 'Remarks',
      headerName: 'Remarks',
      width: 250,
      filter: true,
      editable: true,
      sortable: true,
      type: 'agTextColumnFilter',
      cellStyle: {
        backgroundColor: 'rgba(99, 145, 58, 0.15)',
        border: '1px solid rgba(99, 145, 58, 0.25)',
        // textAlign: 'right',
      },
    },
    {
      field: 'StoreName',
      headerName: 'Store',
      minWidth: 100,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
      hide: true,
    },
    {
      field: 'LocationName',
      headerName: 'Storage Location',
      minWidth: 100,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
      hide: true,
    },
  ];

  // Default column definitions
  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
    filter: true,
    sortable: true,
  };

  return isLoading ? (
    renderLoading
  ) : (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            {/* <h3>Material Requisition</h3> */}
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
              <Controller
                name="ReceivedDate"
                control={control}
                defaultValue={new Date()}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Received Date"
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
                name="IssueCode"
                label="Request Code"
                placeholder="Choose an issue code"
                fullWidth
                options={allIssues}
                getOptionLabel={(option) => option?.ReqCode || ''}
                isOptionEqualToValue={(option, value) => option.IssueCode === value.IssueCode}
                renderOption={(props, option) => (
                  <li {...props} key={option.ReqCode}>
                    {option.ReqCode}
                  </li>
                )}
              />
            </Box>
          </Card>

          {/* Rest of your form remains the same */}
          <Card sx={{ p: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Item Information</h3>
              {/* <Tooltip title="Select Items" placement="top">
                <Button
                  onClick={() => {}}
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  color="primary"
                >
                  Add Items
                </Button>
              </Tooltip> */}
            </Box>

            {/* AG Grid Container */}
            <Box
              sx={{
                height: 400,
                width: '100%',
                mt: 2,
              }}
            >
              <AgGridReact
                columnDefs={columnDefs}
                className="ag-theme-material"
                theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
                rowData={RequestDetails}
                defaultColDef={defaultColDef}
                rowSelection="multiple"
                suppressRowClickSelection
                suppressCellFocus
                enableCellTextSelection
                ensureDomOrder
                pagination
                paginationPageSize={20}
                rowHeight={30}
                overlayNoRowsTemplate="Please add an item"
                stopEditingWhenCellsLoseFocus
                singleClickEdit
                onGridReady={(params) => {
                  params.api.sizeColumnsToFit();
                }}
                onFirstDataRendered={(params) => {
                  params.api.sizeColumnsToFit();
                }}
              />
            </Box>

            {/* <Box>
              <Typography variant="caption">
                Total: {fNumber(RequestDetails.reduce((a, b) => a + b.AcceptedQty, 0))}
              </Typography>
            </Box> */}
          </Card>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              Save
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
