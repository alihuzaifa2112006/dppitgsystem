import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm, Controller, useFormContext, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TableBody from '@mui/material/TableBody';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { format } from 'date-fns';
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Table,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { grid } from '@mui/system';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import Scrollbar from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import Iconify from 'src/components/iconify';

import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFUploadBox,
  RHFRadioGroup,
} from 'src/components/hook-form';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
} from 'src/components/table';

import { Get, Post } from 'src/api/apibasemethods';
import { decrypt, encrypt } from 'src/api/encryption';
import { convertBDTtoUSD } from 'src/utils/BDTtoUSD';
import { fNumber } from 'src/utils/format-number';

import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import DetailTableRow from './detail-table-row';
// ----------------------------------------------------------------------

export default function ItemOpenCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [allItemUnit, setallItemUnit] = useState([]);
  const [allPO, setAllPO] = useState([]);
  const [approvers, setApprovers] = useState([]);

  // const [allClassName, setallClassName] = useState([]);
  // const [allCategoryData, setallCategoryData] = useState([]);
  // const [itemSubCategory, setItemSubCategory] = useState([]);
  const [allItemName, setallItemName] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [allVendorData, setallVendorData] = useState([]);
  // const [customers, setCustomers] = useState([]);

  const [allStoreData, setallStoreData] = useState([]);
  const [allRackData, setallRackData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [itemRecieveDetails, setitemRecieveDetails] = useState([]);

  const [selectedRows, setSelectedRows] = useState([]);

  // Validation function for selectedRows
  const validateSelectedRows = (slctRow) => {
    if (!slctRow || slctRow.length === 0) {
      return 'At least one item must be selected';
    }

    // eslint-disable-next-line
    for (let i = 0; i < slctRow.length; i++) {
      const row = slctRow[i];

      if (!row.RackName || !row.RackName.StorageID) {
        return `Row ${i + 1}: Storage Location is required`;
      }
      if (!row.ChallanQty || row.ChallanQty <= 0) {
        return `Row ${i + 1}: Challan Quantity must be greater than 0`;
      }

      if (!row.ReceiveQty || row.ReceiveQty <= 0) {
        return `Row ${i + 1}: Received Quantity must be greater than 0`;
      }

      if (row.ReceiveQty > row.RemainingQty + row.RemainingQty * 0.05) {
        return `Row ${i + 1}: Received Quantity exceeds the allowed tolerance`;
      }
    }

    return true;
  };

  const NewItemOpenSchema = Yup.object().shape({
    ChallanNo: Yup.string().required('Challan No is required'),
    VendorName: Yup.object().required('Vendor Name is required'),
    GRNDate: Yup.date()
      .nullable()
      .typeError('GRN Date is required')
      .required('GRN Date is required'),
    ChallanDate: Yup.date()
      .nullable()
      .typeError('Challan Date is required')
      .required('Challan Date is required'),
    CheckedBy: Yup.object().required('Checked By is required'),
    ApprovedBy: Yup.object().required('Approved By is required'),
    POID: Yup.array().required('POID is required'),
    selectedRows: Yup.array()
      .min(1, 'At least one item must be selected')
      .test('selectedRows-validation', 'Invalid row data', validateSelectedRows),
  });

  const resetDetailForm = () => {
    setValue('ClassID', null);
    setValue('Inv_Cat_Name', null);
    setValue('ItemSubCategory', null);
    setValue('ItemName', null);
    setValue('POID', []);
    setValue('Store', null);
    setValue('RackName', null);
    setValue('Unit', null);

    setValue('POQuantity', '');
    setValue('ReceiveQty', '');
    setValue('ChallanQty', '');
    setValue('Remarks', '');
    setEditingIndex(null);
  };

  const methods = useForm({
    resolver: yupResolver(NewItemOpenSchema),
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    resetField,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const DetailsTableHead = [
    // { id: 'PODate', label: 'PO Date', minWidth: 120, align: 'center' },

    { id: '', label: 'Select', minWidth: 50, align: 'center' },

    { id: 'POID', label: 'Purchase Order', minWidth: 150, align: 'center' },
    { id: 'ClassName', label: 'Item Type', minWidth: 150, align: 'center' },
    { id: 'Inv_Cat_Name', label: 'Category', minWidth: 150, align: 'center' },
    { id: 'SubCat_Name', label: 'Sub Category', minWidth: 150, align: 'center' },
    { id: 'ItemName', label: 'Item Name', minWidth: 240 },
    { id: 'Store', label: 'Store', minWidth: 170, align: 'center' },
    { id: 'RackName', label: 'Storage Location', minWidth: 200 },
    // { id: 'Unit', label: 'Unit', minWidth: 100, align: 'center' },
    { id: 'POQuantity', label: 'Order Qty', minWidth: 130, align: 'right' },
    { id: 'PreviousQty', label: 'Previously Received Qty', minWidth: 140, align: 'right' },
    { id: 'RemainingQty', label: 'Remaining Qty', minWidth: 140, align: 'right' },
    { id: 'ChallanQty', label: 'Challan Qty', minWidth: 140, align: 'right' },
    { id: 'ReceiveQty', label: 'Received Qty', minWidth: 140, align: 'right' },
    { id: 'POUnitPrice', label: 'PO Unit Price', minWidth: 140, align: 'right' },
    { id: 'ReceiveValue', label: 'Received Value', minWidth: 140, align: 'right' },
    { id: 'Remarks', label: 'Remarks', minWidth: 200 },
    { id: 'isClosed', label: 'Is Closed', minWidth: 100, align: 'center' },

    // { id: 'Actions', label: 'Actions', minWidth: 88, align: 'center' },
  ];

  useEffect(() => {
    const fetchAllUOM = async () => {
      try {
        const response = await Get(
          `GetAllActiveUOM?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        // console.log('UOM Response', response.data.Data);
        setallItemUnit(response.data.Data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllUOM();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const fetchAllSupplierData = useCallback(async () => {
    try {
      const response = await Get(
        `ViewVendors?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setallVendorData(response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const selectedVendor = watch('VendorName');

  const fetchAllPO = useCallback(async () => {
    if (selectedVendor?.VendorID) {
      try {
        const response = await Get(`GetPOByVendor?vendorID=${selectedVendor?.VendorID}`);
        const data = response?.data.Data || [];
        setAllPO(data);
      } catch (error) {
        console.error(error);
      }
    } else {
      setAllPO([]);
    }
  }, [selectedVendor]);

  useEffect(() => {
    fetchAllPO();
    setValue('POID', []);
  }, [fetchAllPO, setValue]);

  const selectedPOID = watch('POID');
  const fetchAllItem = useCallback(async () => {
    if (selectedPOID.length > 0) {
      try {
        setLoadingItems(true);
        const response = await Get(
          `GetItemsByPOIDs?poIds=${selectedPOID.map((item) => item.POID)}`
        );
        // Group items by PODtlID
        const groupedByPODtlID = {};
        response?.data.PODtl.forEach((item) => {
          const podtlId = item.PODtlID;

          if (!groupedByPODtlID[podtlId]) {
            // First time seeing this PODtlID, initialize the group
            groupedByPODtlID[podtlId] = {
              items: [],
              totalPreviousQty: 0,
              totalRemainingQty: 0,
            };
          }

          // Add item to the group
          groupedByPODtlID[podtlId].items.push(item);

          // Sum up the quantities
          groupedByPODtlID[podtlId].totalPreviousQty += parseFloat(item.PreviousQty) || 0;
          groupedByPODtlID[podtlId].totalRemainingQty += parseFloat(item.RemainingQty) || 0;
        });

        // Create the combined data array
        const combinedData = [];

        Object.keys(groupedByPODtlID).forEach((podtlId) => {
          const group = groupedByPODtlID[podtlId];

          // Use the first item as the base for all properties
          const baseItem = group.items[0];

          // Create the combined item with updated quantities
          const combinedItem = {
            ...baseItem,
            PreviousQty: group.totalPreviousQty, // TotalPreviousQty
            RemainingQty: group.totalRemainingQty, // POQty - totalRemainingQty
            ChallanQty: 0,
            ReceiveQty: 0,
            Remarks: '',
            isClose: false,
          };

          combinedData.push(combinedItem);
        });

        // Map to the final format
        const data =
          combinedData.map((item) => ({
            ...item,
            // PODtlID: item?.PODtlID,
            // eslint-disable-next-line
            isClosed: item?.isClose === 'True' ? true : false,
            Store: {
              StoreID: item?.StoreID,
              StoreName: item?.StoreName,
            },
            POID: allPO.find((po) => po.POID === item?.POID),
            ClassID: {
              ClassID: item?.ClassID,
              ClassName: item?.ClassName,
            },
            Inv_Cat_Name: {
              Inv_Cat_ID: item?.Inv_Cat_ID,
              Inv_Cat_Name: item?.Inv_Cat_Name,
            },
            Currency: {
              CurrencyID: item?.Currency_ID,
              CurrencyName: item?.Currency_Name,
            },
            ItemName: {
              ItemCode: item?.ItemCode,
              ItemDescription: item?.ItemDescription,
              ItemID: item?.ItemID,
            },
            ItemSubCategory: {
              SubCat_ID: item?.SubCat_ID,
              SubCat_Name: item?.SubCat_Name,
            },
            POQuantity: item?.POQty,
            Inv_Cat_ID: { Inv_Cat_ID: item?.Inv_Cat_ID, Inv_Cat_Name: item?.Inv_Cat_Name },
            Unit: { UOM_ID: item?.UOMID, UOMName: item?.UOMName },
          })) || [];
        setallItemName(data);
        setSelectedRows([]);
        setLoadingItems(false);
      } catch (error) {
        console.error(error);
      }
    } else {
      setallItemName([]);
      setSelectedRows([]);
      setLoadingItems(false);
    }
  }, [selectedPOID, allPO]);

  useEffect(() => {
    fetchAllItem();
  }, [fetchAllItem]);

  const selectedItem = watch('ItemName');

  useEffect(() => {
    setValue(
      'Unit',
      allItemUnit.find((item) => item.UOM_ID === selectedItem?.UOMID)
    );
    setValue('POQuantity', selectedItem?.POQTY);
  }, [selectedItem, allItemUnit, setValue]);

  useEffect(() => {
    const fetchAllStoreData = async () => {
      try {
        const response = await Get(
          `GetAllStorelocations?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );

        setallStoreData(response.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllStoreData();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const selectedStoreLocation = watch('Store');

  useEffect(() => {
    const fetchRackData = async () => {
      if (selectedStoreLocation?.StoreID) {
        try {
          const response = await Get(
            `GetStorageLocationsByUnitLocation?StoreID=${selectedStoreLocation?.StoreID}&Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
          );
          setallRackData(response.data);
          console.log('Rack Data:');

          setValue('Rack', null);
        } catch (error) {
          console.error('Failed to fetch racks:', error);
          setallRackData([]);
        }
      } else {
        setallRackData([]);
        setValue('Rack', null);
      }
    };

    fetchRackData();
  }, [
    selectedStoreLocation?.StoreID,
    setValue,
    userData.userDetails.branchID,
    userData.userDetails.orgId,
  ]);

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = itemRecieveDetails.filter((row) => row !== rowToDelete);
    setitemRecieveDetails(updatedDetails);

    // If we're deleting the row being edited, reset the form
    if (editingIndex !== null && itemRecieveDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);
    }
  };

  const fecthApprovers = useCallback(async () => {
    const res = await Get(
      `GetHrUsersForStore?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
    );
    if (res.status === 200) {
      const data = res.data.Data;
      setApprovers(data);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchAllSupplierData(), fecthApprovers()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchAllSupplierData, fecthApprovers]);

  const onsubmitie = handleSubmit(async (data) => {
    // Manual validation for selectedRows
    const selectedRowsValidation = validateSelectedRows(selectedRows);
    if (selectedRowsValidation !== true) {
      enqueueSnackbar(selectedRowsValidation, { variant: 'error' });
      return;
    }

    const dataToSend = {
      GRNDate: data?.GRNDate ?? null,
      VendorID: data?.VendorName?.VendorID || data?.VendorName?.WIC_ID || 0,
      ChallanNo: data?.ChallanNo || '',
      ChallanDate: data?.ChallanDate ?? null,
      VehicleNo: data?.VehicleNo || '',
      DriverName: data?.DriverName || '',
      StoreID: data?.Store?.StoreID ?? 0,
      StoreLocationID: 0,
      InvTypeID: data?.VendorName?.InventoryTypeID ?? 0,
      Org_ID: userData?.userDetails?.orgId ?? 0,
      Branch_ID: userData?.userDetails?.branchID ?? 0,
      CreatedBy: userData?.userDetails?.userId ?? 0,
      CheckedBy: data?.CheckedBy?.UserId ?? 0,
      ApprovedBy: data?.ApprovedBy?.UserId ?? 0,
      ReceiveDetails: selectedRows.map((x) => ({
        // Inv_Cat_ID: x?.Inv_Cat_Name?.Inv_Cat_ID,
        PODtlID: x?.PODtlID,
        POID: x?.POID?.POID || 0,
        ItemID: x?.ItemName?.ItemID ?? 0,
        StoreID: x?.Store?.StoreID ?? 0,
        StoreLocationID: x?.RackName?.StorageID ?? 0,
        UOMID: x?.Unit?.UOM_ID ?? 0,
        InvTypeID: x?.ClassID?.ClassID || 0,
        CategoryID: x?.Inv_Cat_Name?.Inv_Cat_ID || 0,
        SubCatID: x?.ItemSubCategory?.SubCat_ID || 0,
        POQty: x?.POQuantity ? parseFloat(x?.POQuantity) : 0,
        PrevRecQty: x?.PreviousQty ? parseFloat(x?.PreviousQty) : 0,
        RemainingQty: x?.RemainingQty ? parseFloat(x?.RemainingQty) : 0,
        ReceiveQty: x?.ReceiveQty ? parseFloat(x?.ReceiveQty) : 0,
        ChallanQty: x?.ChallanQty ? parseFloat(x?.ChallanQty) : 0,
        Remarks: x?.Remarks || 'N/A',
        isClose: x?.isClosed || false,
      })),
    };
    try {
      await Post('AddItemtReceiving', dataToSend);
      enqueueSnackbar('Saved successfully!', { variant: 'success' });
      router.push(paths.dashboard.InventoryManagement.ItemRecieve.root);
    } catch (error) {
      console.error('Save Error:', error?.response?.data || error.message || error);
      enqueueSnackbar('Something went wrong while saving.', { variant: 'error' });
    }
  });

  const handleEditDetail = (detail) => {
    setEditingIndex(detail.PODtlID);
    setValue('RackName', detail?.RackName || null);
    setallItemName((prev) => prev.map((item) => (item.PODtlID === detail.PODtlID ? detail : item)));
    setEditingIndex(detail.PODtlID);
    const updatedSelected = selectedRows.map((item) =>
      item.PODtlID === detail.PODtlID ? detail : item
    );
    setSelectedRows(updatedSelected);
  };

  const onSelectRow = (row) => {
    const selected = selectedRows.some((r) => r.PODtlID === row.PODtlID)
      ? selectedRows.filter((r) => r.PODtlID !== row.PODtlID)
      : [...selectedRows, row];

    setSelectedRows(selected);
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

  // Table
  const table = useTable();

  const notFound = !allItemName.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  const subtotals = useMemo(() => {
    const challan = allItemName.reduce((sum, r) => sum + (Number(r.ChallanQty) || 0), 0);
    const received = allItemName.reduce((sum, r) => sum + (Number(r.ReceiveQty) || 0), 0);
    const value = allItemName.reduce(
      (sum, r) => sum + (Number(r.ReceiveQty) || 0) * (Number(r.POUnitPrice) || 0),
      0
    );
    return { challan, received, value };
  }, [allItemName]);

  //  dailog function
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpenOrigin, setDialogOpenOrigin] = useState(false);

  const handleOriginDialogOpen = () => {
    setDialogOpenOrigin(true);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  return isLoading ? (
    renderLoading
  ) : (
    <>
      <FormProvider methods={methods} onSubmit={onsubmitie}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <h3>Purchase Order Receive Entry</h3>

              <Box
                rowGap={3}
                columnGap={3}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                }}
              >
                <Controller
                  name="GRNDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="GRN Date"
                      format="dd MMM yyyy"
                      disableFuture
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
                  name="VendorName"
                  label="Vendor Name"
                  placeholder="Choose an option"
                  fullWidth
                  options={allVendorData}
                  getOptionLabel={(option) => option?.VendorName || ''}
                  isOptionEqualToValue={(option, value) => option?.VendorID === value?.VendorID}
                  value={values?.VendorName || null}
                />
                <RHFTextField name="ChallanNo" label="Challan No" variant="outlined" fullWidth />
                <Controller
                  name="ChallanDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DesktopDatePicker
                      {...field}
                      label="Challan Date"
                      format="dd MMM yyyy"
                      disableFuture
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
                <RHFTextField name="VehicleNo" label="Vehicle No" variant="outlined" fullWidth />
                <RHFTextField name="DriverName" label="Driver Name" variant="outlined" fullWidth />

                <RHFAutocomplete // perfected multiselect autocomplete
                  name="POID"
                  label="Purchase Order"
                  fullWidth
                  multiple
                  limitTags={2}
                  options={allPO}
                  getOptionLabel={(option) => option?.POCODE}
                  isOptionEqualToValue={(option, value) => option.POID === value.POID}
                  renderOption={(props, option) => {
                    const isChecked = values.POID?.some(
                      (selected) => selected.POID === option.POID
                    );
                    return (
                      <li {...props} key={option.POID}>
                        <Checkbox size="small" disableRipple checked={isChecked} />
                        {option.POCODE}
                      </li>
                    );
                  }}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.POID}
                        label={option.POCODE}
                        size="small"
                        variant="soft"
                        color="primary"
                      />
                    ))
                  }
                />
                <RHFAutocomplete
                  name="Store"
                  label="Delivery Point"
                  placeholder="Store"
                  fullWidth
                  options={allStoreData}
                  getOptionLabel={(option) => option?.StoreName || ''}
                  isOptionEqualToValue={(option, value) => option?.StoreID === value?.StoreID}
                  value={values?.Store || null}
                />
              </Box>
            </Card>
            <Card sx={{ p: 3, mt: 3 }}>
              <Box
                rowGap={3}
                columnGap={3}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFAutocomplete
                  name="CheckedBy"
                  label="Checked By"
                  placeholder="Choose an option"
                  fullWidth
                  options={approvers}
                  getOptionLabel={(option) => option?.EmployeeName || ''}
                  isOptionEqualToValue={(option, value) => option?.UserId === value?.UserId}
                  value={values?.CheckedBy || null}
                />
                <RHFAutocomplete
                  name="ApprovedBy"
                  label="Approved By"
                  placeholder="Choose an option"
                  fullWidth
                  options={approvers}
                  getOptionLabel={(option) => option?.EmployeeName || ''}
                  isOptionEqualToValue={(option, value) => option?.UserId === value?.UserId}
                  value={values?.ApprovedBy || null}
                />
              </Box>
            </Card>

            {/* Display selected rows validation error */}
            {errors.selectedRows && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#fff5f5', borderRadius: 1 }}>
                <Typography color="error" variant="body2">
                  {errors.selectedRows.message}
                </Typography>
              </Box>
            )}

            {loadingItems && (
              <LoadingScreen
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              />
            )}
            {allItemName.length > 0 && (
              <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
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
                      {allItemName.map((row, index) => (
                        <DetailTableRow
                          key={index}
                          row={row}
                          onDeleteRow={() => DeleteDetailTableRow(row)}
                          onEditRow={handleEditDetail}
                          onSelectRow={() => onSelectRow(row)}
                          selected={selectedRows.some(
                            (selectedRow) => selectedRow.PODtlID === row.PODtlID
                          )}
                          userData={userData}
                          allStoreData={allStoreData}
                          allRackData={allRackData}
                          Store={selectedStoreLocation}
                        />
                      ))}

                      <TableEmptyRows
                        height={denseHeight}
                        emptyRows={emptyRows(table.page, table.rowsPerPage, allItemName.length)}
                      />

                      <TableNoData notFound={notFound} />

                      {allItemName.length > 0 && (
                        <TableRow sx={{ bgcolor: 'background.neutral', fontWeight: 600 }}>
                          <TableCell colSpan={11} align="right">
                            Subtotal
                          </TableCell>
                          <TableCell align="right">{fNumber(subtotals.challan)}</TableCell>
                          <TableCell align="right">{fNumber(subtotals.received)}</TableCell>
                          <TableCell align="right" />
                          <TableCell align="right">
                            {allItemName[0]?.Symbol
                              ? `${allItemName[0].Symbol} ${fNumber(subtotals.value)}`
                              : fNumber(subtotals.value)}
                          </TableCell>
                          <TableCell colSpan={2} />
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
            )}

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
              >
                Save
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
