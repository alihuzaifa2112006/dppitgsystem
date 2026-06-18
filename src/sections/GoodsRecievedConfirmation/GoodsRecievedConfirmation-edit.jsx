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

import { Get, Post, Put } from 'src/api/apibasemethods';
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
import PropTypes from 'prop-types';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

// ----------------------------------------------------------------------

export default function GoodsRecievedConfirmationEditForm({ currentData }) {
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
    // Don't fetch items if we're in edit mode with currentData (data is already loaded)
    if (currentData) return;
    if (!selectedIssue?.IssueID) return;
    FetchItemsFromIssueCode();
  }, [selectedIssue?.IssueID, FetchItemsFromIssueCode, currentData]);

  // Load existing data when currentData is available (edit mode)
  useEffect(() => {
    if (!currentData) return;

    // Populate form fields
    if (currentData.ReceiveDate) {
      setValue('ReceivedDate', new Date(currentData.ReceiveDate));
    }

    // Find and set the issue code from allIssues using ReqID (wait for allIssues to load)
    if (currentData.ReqID && allIssues.length > 0) {
      const matchingIssue = allIssues.find((issue) => issue.ReqID === currentData.ReqID);
      if (matchingIssue) {
        console.log(matchingIssue, "matchingIssue");
        setValue('IssueCode', matchingIssue);
      } else {
        console.log(currentData, "currentData");
        // If no match found, create a minimal object for display
        setValue('IssueCode', {
          IssueCode: currentData?.IssueCode,
          ReqCode: currentData?.ReqCode || currentData?.IssueCode,
          IssueID: currentData?.IssueID,
          ReqID: currentData?.ReqID,
        });
      }
    }

    // Transform currentData to match the grid structure
    const transformedData = {
      ...currentData,
      IssueDtlID: currentData.IssueDtlID,
      IssueID: currentData.IssueID,
      ReturnedQty: currentData.ReturnQty || 0,
      AcceptedQty: currentData.AcceptedQty || 0,
      IssueQty: currentData.IssueQty || 0,
      TotalRequestedQty: currentData.TotalRequestedQty || 0,
      Prv_Acceptd_Qty: currentData.Prv_Acceptd_Qty || 0,
      Remarks: currentData.Remarks || '',
      UOMID: currentData.UOMID,
      UOMName: currentData.UOMName,
      ItemCode: currentData.ItemCode,
      ItemDescription: currentData.ItemDescription,
      IssueCode: currentData.IssueCode,
      IssueDate: currentData.IssueDate,
      Inv_Rec_ConfirmID: currentData.Inv_Rec_ConfirmID,
    };

    // Set as single item array for the grid
    setRequestDetails([transformedData]);
  }, [currentData, allIssues, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (RequestDetails.length === 0) {
        enqueueSnackbar('Please add at least one item detail', { variant: 'error' });
        return;
      }

      // Get the first (and only) detail for edit mode
      const detail = RequestDetails[0];

      // Prepare update payload according to API specification
      const updateData = {
        Inv_Rec_ConfirmID: detail.Inv_Rec_ConfirmID || currentData?.Inv_Rec_ConfirmID,
        ReturnQty: detail?.ReturnedQty || detail?.ReturnQty || 0,
        AcceptedQty: detail?.AcceptedQty || 0,
        IssueQty: detail?.IssueQty || 0,
        TotalRequestedQty: detail?.TotalRequestedQty || 0,
        UOMID: detail?.UOMID || currentData?.UOMID,
        ReceiveDate: data?.ReceivedDate ? new Date(data.ReceivedDate).toISOString() : null,
        Remarks: detail?.Remarks || '',
        // eslint-disable-next-line
        isClosed: detail?.IssueQty === detail?.TotalRequestedQty ? true : false,
        UpdateBy: userData.userDetails.userId,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      };

      const response = await Put(`InvReceiveConfirmationandReturn/Update`, updateData);

      if (response.status !== 200) {
        enqueueSnackbar(response.data?.Message || 'Failed to update record', { variant: 'error' });
      } else {
        enqueueSnackbar('Record updated successfully!', { variant: 'success' });
        router.push(paths.dashboard.Production.GoodsRecievedConfirmation.root);
        reset();
        setRequestDetails([]);
      }
    } catch (error) {
      console.error('Error details:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Error updating record', { variant: 'error' });
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
                disabled={!!currentData}
                options={allIssues}
                getOptionLabel={(option) => option?.ReqCode || ''}
                isOptionEqualToValue={(option, value) => option.ReqCode === value.ReqCode}
                renderOption={(props, option) => (
                  <li {...props} key={option.ReqCode}>
                    {option.ReqCode}
                  </li>
                )}
                value={values?.IssueCode || null}
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

GoodsRecievedConfirmationEditForm.propTypes = {
  currentData: PropTypes.object,
};
