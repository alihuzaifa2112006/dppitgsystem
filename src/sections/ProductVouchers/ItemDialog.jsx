import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Input,
  InputAdornment,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFUpload,
  RHFUploadBox,
} from 'src/components/hook-form';

import { Get, Post } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';

// AG Grid imports
import { AgGridReact } from 'ag-grid-react';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { fDate } from 'src/utils/format-time';
import { minWidth } from '@mui/system';
import { fNumber } from 'src/utils/format-number';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

// ----------------------------------------------------------------------

export default function ProductVoucherItemDialog({
  uploadClose,
  uploadOpen,
  selectedRows,
  setSelectedRows,
  onSelectSubmit,
  allClassName,
  allCategoryData,
  allSubCategory,
  allColors,
  selectedClassId,
  selectedItem,
  values,
  ItemOpen
}) {
  const router = useRouter();
  const settings = useSettingsContext();

  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [itemData, setItemData] = useState([]);

  // AG Grid column definitions
  const columnDefs = [
    {
      // field: 'select',
      // headerName: 'Select',
      minWidth: 40,
      maxWidth: 40,
      cellRenderer: (params) => (
        <Checkbox
          sx={{ p: 0 }}
          size="small"
          disabled={params.data.RemainingQty <= 0}
          checked={selectedRows.some((row) => row.key === params.data.key)}
          onChange={(e) => handleRowSelection(e.target.checked, params.data)}
        />
      ),
      // sortable: false,
      filter: false,
      resizable: false,
    },
    {
      field: 'SourceType',
      headerName: 'Source Type',
      width: 120,
      filter: true,
      sortable: true,
    },
    {
      field: 'TrackingID',
      headerName: 'Tracking ID',
      width: 120,
      filter: true,
      sortable: true,
      valueFormatter: (params) => params?.value || '-',
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
    },
    {
      field: 'GRNDate',
      headerName: 'GRN Date',
      width: 120,
      filter: true,
      sortable: true,
      valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
    },
    {
      field: 'ChallanNo',
      headerName: 'Challan No.',
      width: 120,
      filter: true,
      sortable: true,
      valueFormatter: (params) => params?.value || '-',
    },
    {
      field: 'ChallanDate',
      headerName: 'Challan Date',
      width: 120,
      filter: true,
      sortable: true,
      valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
    },
    {
      field: 'VendorName',
      headerName: 'Vendor Name',
      width: 120,
      filter: true,
      sortable: true,
    },
    {
      field: 'ReceiveQty',
      headerName: 'Receive Qty',
      width: 130,
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
      field: 'OpenStockQty',
      headerName: 'Open Stock Qty',
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
      field: 'RemainingQty',
      headerName: 'Remaining Qty',
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
  ];

  // Default column definitions
  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
    filter: true,
    sortable: true,
  };

  // Handle row selection
  const handleRowSelection = (isSelected, rowData) => {
    if (isSelected) {
      setSelectedRows((prev) => [...prev, rowData]);
    } else {
      setSelectedRows((prev) => prev.filter((row) => row.key !== rowData.key));
    }
  };

  // Handle select all
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const filteredItems = itemData.filter((item) => item.RemainingQty > 0);
      setSelectedRows([...filteredItems]);
    } else {
      setSelectedRows([]);
    }
  };

  const fetchAllItemData = useCallback(async () => {
    if (selectedItem?.ItemID) {
      const response = await Get(
        `GetAllItemTransandGRN?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}&itemId=${selectedItem?.ItemID}`
      );
      if (response?.status === 200) {
        const dataWithKey = response?.data?.Data.map((item, index) => ({
          ...item,
          key: `${selectedItem?.ItemID}-${index}`,
        }));
        setItemData(dataWithKey);
      } else {
        setItemData([]);
      }
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, selectedItem?.ItemID]);

  useEffect(() => {
    fetchAllItemData();
  }, [fetchAllItemData]);

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

  return (
    <>
      <Dialog
        open={uploadOpen}
        onClose={() => {
          uploadClose(); // Call the original close function
        }}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle sx={{ fontSize: '20px !important' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Please select a Items you want to request.
            </Typography>

            <IconButton onClick={uploadClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box
            rowGap={3}
            my={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            }}
          >
            <RHFAutocomplete
              size="small"
              name="ClassID"
              label="Inventory Type"
              placeholder="Choose an option"
              fullWidth
              options={allClassName}
              getOptionLabel={(option) => option?.ClassName || ''}
              isOptionEqualToValue={(option, value) => option?.ClassID === value?.ClassID}
              value={values?.ClassID || null}
            />
            <RHFAutocomplete
              size="small"
              name="Inv_Cat_Name"
              label="Select Item Category"
              placeholder="Choose an option"
              fullWidth
              options={allCategoryData}
              getOptionLabel={(option) => option?.Inv_Cat_Name || ''}
              isOptionEqualToValue={(option, value) => option.Inv_Cat_ID === value.Inv_Cat_ID}
              value={values?.Inv_Cat_Name || null}
            />
            <RHFAutocomplete
              size="small"
              name="ItemSubCategory"
              label="Select Item Sub Category"
              placeholder="Choose an option"
              fullWidth
              options={allSubCategory}
              getOptionLabel={(option) => option?.SubCat_Name || ''}
              isOptionEqualToValue={(option, value) => option?.SubCat_ID === value?.SubCat_ID}
              value={values?.ItemSubCategory || null}
            />
            {selectedClassId?.isColorSensitive && (
              <RHFAutocomplete
                size="small"
                name="Color"
                label="Color Name & Code"
                placeholder="Choose an option"
                fullWidth
                options={allColors}
                getOptionLabel={(option) => option?.Color_and_Code}
                isOptionEqualToValue={(option, value) => option.ColorID === value?.ColorID}
                value={values?.Color || null}
              />
            )}

            <Box sx={{ gridColumn: { sm: 'span 1', md: 'span 2' } }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ flexGrow: 1 }}>
                  <RHFAutocomplete
                    size="small"
                    name="ItemOpen"
                    label="Item"
                    placeholder="Choose an option"
                    fullWidth
                    options={ItemOpen}
                    getOptionLabel={(option) => option?.CodeAndDescription || ''}
                    isOptionEqualToValue={(option, value) => option.ItemID === value.ItemID}
                    value={values?.ItemOpen || null}
                  />
                </Box>
              </Stack>
            </Box>
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
              rowData={itemData}
              defaultColDef={defaultColDef}
              rowSelection="multiple"
              suppressRowClickSelection
              suppressCellFocus
              enableCellTextSelection
              ensureDomOrder
              pagination
              paginationPageSize={20}
              rowHeight={30}
              overlayNoRowsTemplate="No data available"
              onGridReady={(params) => {
                params.api.sizeColumnsToFit();
              }}
              onFirstDataRendered={(params) => {
                params.api.sizeColumnsToFit();
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => handleSelectAll(true)}
              startIcon={<Iconify icon="material-symbols:select-all" />}
            >
              Select All
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleSelectAll(false)}
              startIcon={<Iconify icon="material-symbols:deselect" />}
            >
              Deselect All
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" onClick={uploadClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setItemData([]);
                onSelectSubmit();
              }}
              disabled={selectedRows.length === 0}
            >
              Add Selected ({selectedRows.length})
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}

ProductVoucherItemDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  selectedRows: PropTypes.array,
  setSelectedRows: PropTypes.func,
  allClassName: PropTypes.array,
  selectedClassId: PropTypes.any,
  selectedItem: PropTypes.object,
  allCategoryData: PropTypes.array,
  allSubCategory: PropTypes.array,
  allColors: PropTypes.array,
  ItemOpen: PropTypes.array,
  values: PropTypes.object,
  onSelectSubmit: PropTypes.func,
};
