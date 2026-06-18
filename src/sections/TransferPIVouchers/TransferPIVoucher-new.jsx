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
  Autocomplete,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

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

import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function TransferPIVoucherCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [selectedRows, setSelectedRows] = useState([]);
  const [piVoucherNumbers, setPiVoucherNumbers] = useState([]);
  const [piVoucherDetails, setPiVoucherDetails] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [itemLocations, setItemLocations] = useState([]);
  const [vendors, setVendors] = useState([]);

  const NewTransferPIRequestSchema = Yup.object().shape({
    TransferDate: Yup.date().required('Transfer Date is required'),
    PIVoucherNumber: Yup.object().required('PI Voucher Number is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewTransferPIRequestSchema),
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
  const table = useTable();

  const denseHeight = table.dense ? 56 : 56 + 20;

  // Date In SQL format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [isLoading, setLoading] = useState(false);

  // Fetch PI Voucher Numbers
  const GetPIVoucherNumbers = useCallback(async () => {
    try {
      const response = await Get(
        `Production/GetProductionPIVoucherNumbers?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setPiVoucherNumbers(response.data?.Data || []);
    } catch (error) {
      console.error(error);
      setPiVoucherNumbers([]);
      enqueueSnackbar('Failed to fetch PI Voucher Numbers', { variant: 'error' });
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  // Fetch PI Voucher Details
  const GetPIVoucherDetails = useCallback(async (prodVoucherID) => {
    if (!prodVoucherID) {
      setPiVoucherDetails([]);
      return;
    }

    setIsLoadingDetails(true);
    try {
      const response = await Get(
        `Production/GetProductionPIVoucherDetails_Transfer?ProdVoucherID=${prodVoucherID}`
      );

      // Map the response data to match our table structure
      const detailsWithSelection = (response.data?.Data || []).map(item => ({
        ProdVoucherDtlID: item.ProdVoucherDtlID,
        PINo: item.PINo,
        PIDate: item.PIDate,
        Color_and_Code: item.Color_and_Code,
        Yarn_Count_Name: item.Yarn_Count_Name,
        Yarn_Type: item.Yarn_Type,
        Composition_Name: item.Composition_Name,
        PlyValue: item.PlyValue,
        IsPly: item.IsPly,
        ProductionQty: item.ProductionQty,
        UOMName: item.UOMName,
        isSelected: false,
        LocationID: null,
        VendorID: null,
      }));

      setPiVoucherDetails(detailsWithSelection);
    } catch (error) {
      console.error(error);
      setPiVoucherDetails([]);
      enqueueSnackbar('Failed to fetch voucher details', { variant: 'error' });
    } finally {
      setIsLoadingDetails(false);
    }
  }, [enqueueSnackbar]);

  // Fetch Item Locations
  const GetItemLocations = useCallback(async () => {
    try {
      const response = await Get(
        `Production/GetItemLocations?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setItemLocations(response.data?.Data || []);
    } catch (error) {
      console.error(error);
      setItemLocations([]);
      enqueueSnackbar('Failed to fetch item locations', { variant: 'error' });
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  // Fetch Vendors
  const GetVendors = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetVendors?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setVendors(response.data?.Data || []);
    } catch (error) {
      console.error(error);
      setVendors([]);
      enqueueSnackbar('Failed to fetch vendors', { variant: 'error' });
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  // Filter locations based on IsPly value
  const getFilteredLocations = useCallback((isPly) => {
    if (isPly === 1) {
      // Exclude "Store" location
      return itemLocations.filter(loc => loc.LocationName !== 'Store');
    } 
    // eslint-disable-next-line
    else {
      // Only show "Store" location
      return itemLocations.filter(loc => loc.LocationName === 'Store');
    }
  }, [itemLocations]);

  // Watch for PI Voucher Number selection
  const watchedPIVoucherNumber = watch('PIVoucherNumber');

  // Fetch voucher details when voucher number is selected
  useEffect(() => {
    if (watchedPIVoucherNumber?.ProdVoucherID) {
      GetPIVoucherDetails(watchedPIVoucherNumber.ProdVoucherID);
      setSelectedRows([]); // Clear selections when voucher changes
    } else {
      setPiVoucherDetails([]);
      setSelectedRows([]);
    }
  }, [watchedPIVoucherNumber, GetPIVoucherDetails]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        GetPIVoucherNumbers(),
        GetItemLocations(),
        GetVendors(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [GetPIVoucherNumbers, GetItemLocations, GetVendors]);

  // Table selection handlers
  const handleSelectAllClick = (checked) => {
    if (checked) {
      const newSelected = piVoucherDetails.map(i => i.ProdVoucherDtlID);
      setSelectedRows(newSelected);
      setPiVoucherDetails(piVoucherDetails.map(i => ({ ...i, isSelected: true })));
    } else {
      setSelectedRows([]);
      setPiVoucherDetails(piVoucherDetails.map(i => ({ 
        ...i, 
        isSelected: false, 
        LocationID: null,
        VendorID: null,
      })));
    }
  };

  const handleClick = (event, id) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    setSelectedRows(newSelected);

    // Update the isSelected flag in piVoucherDetails and reset values when deselected
    const updatedItems = piVoucherDetails.map(item => {
      const isSelected = newSelected.includes(item.ProdVoucherDtlID);
      return {
        ...item,
        isSelected,
        LocationID: isSelected ? item.LocationID : null,
        VendorID: isSelected ? item.VendorID : null,
      };
    });
    setPiVoucherDetails(updatedItems);
  };


  const handleLocationChange = (detailId, location) => {
    const updatedItems = piVoucherDetails.map(item =>
      item.ProdVoucherDtlID === detailId
        ? { ...item, LocationID: location?.LocationID || null }
        : item
    );
    setPiVoucherDetails(updatedItems);
  };

  const handleVendorChange = (detailId, vendor) => {
    const updatedItems = piVoucherDetails.map(item =>
      item.ProdVoucherDtlID === detailId
        ? { ...item, VendorID: vendor?.VendorID || null }
        : item
    );
    setPiVoucherDetails(updatedItems);
  };

  const isSelected = (id) => selectedRows.indexOf(id) !== -1;

  // Check if all selected items have locations and vendors (when IsPly === 1) for submit button state
  const isSubmitDisabled = useMemo(() => {
    if (piVoucherDetails.length === 0 || selectedRows.length === 0) {
      return true;
    }
    
    const allSelectedItems = piVoucherDetails.filter(item => item.isSelected);
    const hasItemsWithoutLocation = allSelectedItems.some(item => !item.LocationID);
    const hasPlyItemsWithoutVendor = allSelectedItems.some(
      item => item.IsPly === 1 && !item.VendorID
    );
    
    return hasItemsWithoutLocation || hasPlyItemsWithoutVendor;
  }, [piVoucherDetails, selectedRows]);


 

  // Table headers
  const TABLE_HEAD = [
    { id: 'piNo', label: 'PI No', align: 'left',minWidth: 120 },
    { id: 'piDate', label: 'PI Date', align: 'left',minWidth: 120 },
    { id: 'colorCode', label: 'Color & Code', align: 'left',minWidth: 120 },
    { id: 'yarnCount', label: 'Yarn Count', align: 'left',minWidth: 120 },
    { id: 'yarnType', label: 'Yarn Type', align: 'left',minWidth: 120 },
    { id: 'composition', label: 'Composition', align: 'left',minWidth: 200 },
    { id: 'productionQty', label: 'Production Qty',minWidth: 150 },
    { id: 'uom', label: 'UOM', align: 'left',minWidth: 80 },
    { id: 'ply', label: 'Ply Value', align: 'center',minWidth: 120 },
    { id: 'location', label: 'Location', align: 'left',minWidth: 120 },
    { id: 'vendor', label: 'Vendor', align: 'left',minWidth: 150 },
  ];

  // Format date for API
  const formatDateForAPI = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Get all selected items
      const allSelectedItems = piVoucherDetails.filter(item => item.isSelected);

      if (allSelectedItems.length === 0) {
        enqueueSnackbar('Please select at least one item', { variant: 'error' });
        return;
      }

      // Check if all selected items have locations
      const itemsWithoutLocation = allSelectedItems.filter(item => !item.LocationID);

      if (itemsWithoutLocation.length > 0) {
        enqueueSnackbar(
          `Please select location for ${itemsWithoutLocation.length} selected item(s). All selected items must have a location selected.`,
          { variant: 'error' }
        );
        return;
      }

      // Check if all items with IsPly === 1 have vendors
      const plyItemsWithoutVendor = allSelectedItems.filter(
        item => item.IsPly === 1 && !item.VendorID
      );

      if (plyItemsWithoutVendor.length > 0) {
        enqueueSnackbar(
          `Please select vendor for ${plyItemsWithoutVendor.length} selected item(s) with Ply Value. All items with Ply Value must have a vendor selected.`,
          { variant: 'error' }
        );
        return;
      }

      // All selected items have locations - proceed with submission
      const selectedItems = allSelectedItems;

      // Prepare request data for Production/SaveTransferVoucher API
      const requestData = {
        ProdVoucherID: data.PIVoucherNumber?.ProdVoucherID,
        TransferDate: formatDateForAPI(data.TransferDate),
        Remarks: data.Remarks || '',
        Org_ID: userData.userDetails.orgId,
        Branch_ID: userData.userDetails.branchID,
        CreatedBy: userData.userDetails.userId,
        Details: selectedItems.map(item => ({
          ProdVoucherDtlID: item.ProdVoucherDtlID,
          TransferQty: item.ProductionQty || 0,
          LocationID: item.LocationID,
          VendorID: item.VendorID || null,
        }))
      };

      console.log('Submitting data:', requestData);

      // Call the Transfer Voucher Save API
      const response = await Post(`Production/SaveTransferVoucher`, requestData);

      if (response.status === 200 || response.data?.Success) {
        enqueueSnackbar('Transfer voucher created successfully!', { variant: 'success' });
        router.push(paths.dashboard.Production.TransferPIVoucher.root);
        reset();
        setPiVoucherDetails([]);
        setSelectedRows([]);
      } else {
        enqueueSnackbar(response.data?.Message || 'Failed to create transfer voucher', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error details:', error);
      enqueueSnackbar(error.response?.data?.Message || 'Error creating transfer voucher', { variant: 'error' });
    }
  });
  return isLoading ? (
    <LoadingScreen />
  ) : (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(2, 1fr)',
              }}
            >
              {/* Transfer Date */}
              <Controller
                name="TransferDate"
                control={control}
                defaultValue={new Date()}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Transfer Date"
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

              {/* PI Voucher Numbers */}
              <RHFAutocomplete
                name="PIVoucherNumber"
                label="PI Voucher Number"
                options={piVoucherNumbers}
                getOptionLabel={(option) => option.VoucherNo || ''}
                isOptionEqualToValue={(option, value) => option.ProdVoucherID === value.ProdVoucherID}
                value={values.PIVoucherNumber || null}
              />

              <RHFTextField
                name="Remarks"
                label="Remarks"
                fullWidth
                multiline
                rows={2}
                sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 3' } }}
              />
            </Box>
          </Card>

          {/* PI Voucher Details Table */}
          {piVoucherDetails.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <Box display="flex" flexDirection="row" justifyContent='space-between'>
                <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
                  Production Voucher Details
                </Typography>

                {/* Total Transfer Qty Display
                {selectedRows.length > 0 && (
                  <Typography variant="subtitle1" color="primary" align="right" sx={{ p: 2, pb: 1 }}>
                    Total Transfer Quantity: {fNumber(totalTransferQty) || 0.00}
                  </Typography>
                )} */}
              </Box>
              {isLoadingDetails ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>Loading details...</Typography>
                </Box>
              ) : (
                <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                  <Scrollbar>
                    <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1200 }}>
                      <TableHeadCustom
                        headLabel={TABLE_HEAD}
                        rowCount={piVoucherDetails.length}
                        numSelected={selectedRows.length}
                        onSelectAllRows={handleSelectAllClick}
                      />

                      <TableBody>
                        {piVoucherDetails.map((row) => {
                          const isItemSelected = isSelected(row.ProdVoucherDtlID);
                          const filteredLocations = getFilteredLocations(row.IsPly);

                          return (
                            <TableRow
                              hover
                              key={row.ProdVoucherDtlID}
                              selected={isItemSelected}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={isItemSelected}
                                  onChange={(event) => handleClick(event, row.ProdVoucherDtlID)}
                                />
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2">{row.PINo}</Typography>
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2">
                                  {fDate(row.PIDate)}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2">{row.Color_and_Code}</Typography>
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2">{row.Yarn_Count_Name}</Typography>
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2">{row.Yarn_Type}</Typography>
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2">{row.Composition_Name}</Typography>
                              </TableCell>

                              <TableCell align="right">
                                <Typography variant="body2">
                                  {fNumber(row.ProductionQty)}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2">{row.UOMName}</Typography>
                              </TableCell>

                              <TableCell align="center">
                                <Typography variant="body2">
                                  {row.IsPly ? row.PlyValue : 'N/A'}
                                </Typography>
                              </TableCell>

                              {/* <TableCell align="right">
                                {isItemSelected ? (
                                  <RHFTextField
                                    name={`TransferQty-${row.ProdVoucherDtlID}`}
                                    type="number"
                                    size="small"
                                    value={row.TransferQty || ''}
                                    onChange={(e) => handleTransferQtyChange(row.ProdVoucherDtlID, e.target.value)}
                                    inputProps={{
                                      min: 0,
                                      step: 0.01,
                                      max: row.ProductionQty,
                                      style: { textAlign: 'right' }
                                    }}
                                    sx={{ width: 120 }}
                                  />
                                ) : (
                                  <Typography variant="body2" color="textSecondary">
                                    -
                                  </Typography>
                                )}
                              </TableCell> */}

                              <TableCell>
                                {isItemSelected ? (
                                  <Autocomplete
                                    options={filteredLocations}
                                    getOptionLabel={(option) => option.LocationName || ''}
                                    isOptionEqualToValue={(option, value) => option.LocationID === value.LocationID}
                                    value={filteredLocations.find(loc => loc.LocationID === row.LocationID) || null}
                                    onChange={(event, newValue) => handleLocationChange(row.ProdVoucherDtlID, newValue)}
                                    size="small"
                                    sx={{ width: 150 }}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        placeholder="Select Location"
                                        required
                                        error={!row.LocationID}
                                        helperText={!row.LocationID ? 'Location required' : ''}
                                      />
                                    )}
                                  />
                                ) : (
                                  <Typography variant="body2" color="textSecondary">
                                    -
                                  </Typography>
                                )}
                              </TableCell>

                              <TableCell>
                                {isItemSelected && row.IsPly === 1 ? (
                                  <Autocomplete
                                    options={vendors}
                                    getOptionLabel={(option) => option.VendorName || ''}
                                    isOptionEqualToValue={(option, value) => option.VendorID === value.VendorID}
                                    value={vendors.find(vendor => vendor.VendorID === row.VendorID) || null}
                                    onChange={(event, newValue) => handleVendorChange(row.ProdVoucherDtlID, newValue)}
                                    size="small"
                                    sx={{ width: 150 }}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        placeholder="Select Vendor"
                                        required
                                        error={!row.VendorID}
                                        helperText={!row.VendorID ? 'Vendor required' : ''}
                                      />
                                    )}
                                  />
                                ) : (
                                  <Typography variant="body2" color="textSecondary">
                                    {row.IsPly === 1 ? '-' : 'N/A'}
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}

                        <TableEmptyRows
                          height={denseHeight}
                          emptyRows={emptyRows(table.page, table.rowsPerPage, piVoucherDetails.length)}
                        />

                        {piVoucherDetails.length === 0 && !isLoadingDetails 
                        // eslint-disable-next-line
                        && ( <TableNoData notFound={true} /> )}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
              )}
            </Card>
          )}

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            {isSubmitDisabled && selectedRows.length > 0 && (
              <Typography variant="caption" color="error" sx={{ mb: 1 }}>
                Please select location for all selected items{piVoucherDetails.some(item => item.isSelected && item.IsPly === 1) ? ' and vendor for items with Ply Value' : ''}
              </Typography>
            )}
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
              disabled={isSubmitDisabled}
            >
              Save Transfer Voucher
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}