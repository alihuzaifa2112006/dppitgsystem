import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AgGridReact } from 'ag-grid-react';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { LoadingScreen } from 'src/components/loading-screen';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';

import { Get, Post, Put } from 'src/api/apibasemethods';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------
const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

export default function WasteVoucherEditForm({ currentData }) {
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const gridRef = useRef(null);

  // Define default form values
  const defaultValues = useMemo(
    () => ({
      WasteDate: currentData?.VoucherDate ? new Date(currentData.VoucherDate) : new Date(),
      ShiftId: null,
      Department: userData?.userDetails?.DepartmentName || '',
      Section: userData?.userDetails?.SectionName || '',
      TransferToDepartment: null,
      TransferToSection: null,
      Location: null,
      ProductionNo: null,
    }),
    [currentData, userData]
  );

  const WasteVoucherSchema = Yup.object().shape({
    WasteDate: Yup.mixed()
      .required('Voucher Date is required')
      .test(
        'is-valid-date',
        'Please enter a valid date',
        (value) => value instanceof Date && !Number.isNaN(value.getTime())
      ),
    ShiftId: Yup.object()
      .shape({
        ShiftId: Yup.number().required('Shift ID is required'),
        ShiftName: Yup.string().required('Shift Name is required'),
      })
      .nullable()
      .required('Shift is required'),
    TransferToDepartment: Yup.object().nullable().required('Transfer To Department is required'),
    TransferToSection: Yup.object().nullable().required('Transfer To Section is required'),
    Location: Yup.object().nullable().required('Location is required'),
    ProductionNo: Yup.object().nullable().required('Production No is required'),
  });

  const methods = useForm({
    resolver: yupResolver(WasteVoucherSchema),
    defaultValues,
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

  const router = useRouter();

  // States
  const [allShiftData, setallShiftData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isDtlLoading, setDtlLoading] = useState(false);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [allStoreLocations, setAllStoreLocations] = useState([]);
  const [allProductionOrders, setAllProductionOrders] = useState([]);
  const [transferItems, setTransferItems] = useState([]);
  const [selectedTransferItems, setSelectedTransferItems] = useState([]);
  const [originalDetails, setOriginalDetails] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Watchers
  const selectedProductionNo = watch('ProductionNo');
  const selectedTransferToDepartment = watch('TransferToDepartment');
  const selectedTransferToSection = watch('TransferToSection');

  // AG Grid column definitions
  const columnDefs = useMemo(
    () => [
      {
        field: 'checkbox',
        headerName: '',
        maxWidth: 50,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        sortable: false,
        filter: false,
        resizable: false,
        lockPosition: 'left',
      },
      {
        field: 'Type',
        headerName: 'Type',
        minWidth: 100,
        filter: 'agTextColumnFilter',
        cellStyle: (params) => {
          if (params.value === 'Waste') {
            return { color: '#c62828' };
          }
          if (params.value === 'Output') {
            return { color: '#2e7d32' };
          }
          if (params.value === 'Input') {
            return { color: '#1565c0' };
          }
          return null;
        },
      },
      {
        field: 'ItemCode',
        headerName: 'Item Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ItemName',
        headerName: 'Item Name',
        minWidth: 300,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'RemainingQty',
        headerName: 'Remaining Qty',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => parseFloat(params.value || 0).toFixed(2),
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'TransferQty',
        headerName: 'Transfer Quantity',
        minWidth: 150,
        editable: true,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        cellStyle: (params) => ({
          textAlign: 'right',
          backgroundColor: '#e8f5e944',
          border: '1px solid #c8e6c999',
          borderRadius: '4px',
        }),
        cellRenderer: (params) => {
          const value = parseFloat(params.value || 0);
          return value.toFixed(2);
        },
        valueSetter: (params) => {
          const newValue = parseFloat(params.newValue) || 0;
          const maxQty = parseFloat(params.data.RemainingQty || 0);

          if (newValue > maxQty) {
            enqueueSnackbar(`Cannot exceed remaining quantity: ${maxQty}`, {
              variant: 'warning',
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
            });
            params.data.TransferQty = maxQty.toFixed(2);
            return false;
          }

          if (newValue < 0) {
            enqueueSnackbar('Transfer quantity cannot be negative', {
              variant: 'warning',
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
            });
            params.data.TransferQty = '0.00';
            return false;
          }

          params.data.TransferQty = newValue.toFixed(2);
          return true;
        },
        valueFormatter: (params) => {
          const value = parseFloat(params.value || 0);
          return value.toFixed(2);
        },
      },
      {
        field: 'UOMName',
        headerName: 'UOM',
        minWidth: 80,
        filter: 'agTextColumnFilter',
      },
    ],
    [enqueueSnackbar]
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

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch all shifts
  useEffect(() => {
    const fetchShiftData = async () => {
      try {
        const res = await Get(
          `GetAllShifts?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setallShiftData(res?.data?.data || []);
      } catch (err) {
        console.error('Error fetching Shift:', err);
      }
    };
    fetchShiftData();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // Fetch all departments
  const GetAllDepartments = useCallback(async () => {
    try {
      const res = await Get(
        `GetAllActiveInactiveDpt?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setAllDepartments(res.data?.Departments || []);
    } catch (r) {
      console.error(r);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    GetAllDepartments();
  }, [GetAllDepartments]);

  // Fetch sections based on selected department
  const FetchAllSectionsData = useCallback(async () => {
    if (selectedTransferToDepartment?.Dpt_ID) {
      try {
        const response = await Get(
          `GetSectionsByDept?deptId=${selectedTransferToDepartment?.Dpt_ID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setAllSections(response.data || []);
      } catch (error) {
        console.error(error);
        setAllSections([]);
      }
    } else {
      setAllSections([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, selectedTransferToDepartment]);

  useEffect(() => {
    FetchAllSectionsData();
    if (!selectedTransferToDepartment) {
      setValue('TransferToSection', null);
      setValue('Location', null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTransferToDepartment?.Dpt_ID]);

  // Fetch all store locations based on selected department and section
  const GetAllStorelocations = useCallback(async () => {
    if (selectedTransferToDepartment?.Dpt_ID && selectedTransferToSection?.SectionID) {
      try {
        const response = await Get(
          `GetAllStoreLocationsByDeptIDandSecID?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&DeptID=${selectedTransferToDepartment.Dpt_ID}&SectionID=${selectedTransferToSection.SectionID}`
        );
        setAllStoreLocations(response.data || []);
      } catch (error) {
        console.error(error);
        setAllStoreLocations([]);
      }
    } else {
      setAllStoreLocations([]);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    selectedTransferToDepartment,
    selectedTransferToSection,
  ]);

  useEffect(() => {
    GetAllStorelocations();
    if (!selectedTransferToSection) {
      setValue('Location', null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTransferToDepartment?.Dpt_ID, selectedTransferToSection?.SectionID]);

  // Fetch production orders
  const GetPDONOByDeptAndSection = useCallback(async () => {
    try {
      const response = await Get(`GetPDONOByDeptAndSection?DeptId=9&SectionId=26`);
      setAllProductionOrders(response.data?.Data || []);
    } catch (error) {
      console.error(error);
      setAllProductionOrders([]);
    }
  }, []);

  useEffect(() => {
    GetPDONOByDeptAndSection();
  }, [GetPDONOByDeptAndSection]);

  // Load existing data when currentData is available
  useEffect(() => {
    if (currentData && !isLoading && allDepartments.length > 0 && allShiftData.length > 0 && allProductionOrders.length > 0) {
      // Set form values from currentData
      if (currentData.VoucherDate) {
        setValue('WasteDate', new Date(currentData.VoucherDate));
      }

      // Set Shift
      if (currentData.SHIFID) {
        const shift = allShiftData.find((s) => s.ShiftId === currentData.SHIFID);
        if (shift) {
          setValue('ShiftId', shift);
        }
      }

      // Set Transfer To Department
      if (currentData.TransferDeptID) {
        const dept = allDepartments.find((d) => d.Dpt_ID === currentData.TransferDeptID);
        if (dept) {
          setValue('TransferToDepartment', dept);
        }
      }

      // Set Production No
      if (currentData.ReportID) {
        const prodNo = allProductionOrders.find((p) => p.ReportID === currentData.ReportID);
        if (prodNo) {
          setValue('ProductionNo', prodNo);
        }
      }

      // Load existing details into transfer items
      if (currentData.Details && Array.isArray(currentData.Details)) {
        const mappedDetails = currentData.Details.map((detail) => ({
          VOUDTLID: detail.VOUDTLID || 0,
          ItemID: detail.ItemID || 0,
          ItemCode: detail.ItemCode || '',
          ItemName: detail.ItemName || detail.ItemDescription || '',
          RemainingQty: detail.RemainingQty || 0,
          TransferQty: detail.TransferQty || 0,
          UOMID: detail.UOMID || 1,
          UOMName: detail.UOMName || '',
          Type: detail.Types || '',
        }));

        setTransferItems(mappedDetails);
        setOriginalDetails(mappedDetails);

        // Select all existing items after grid is ready
        setTimeout(() => {
          if (gridRef.current && gridRef.current.api) {
            gridRef.current.api.selectAll();
            const selectedRows = gridRef.current.api.getSelectedRows();
            setSelectedTransferItems(selectedRows.map((row) => row.ItemID));
          }
        }, 300);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData, isLoading, allShiftData.length, allDepartments.length, allProductionOrders.length]);

  // Set Transfer To Section after sections are loaded
  useEffect(() => {
    if (currentData?.TransferSecID && allSections.length > 0 && selectedTransferToDepartment) {
      const section = allSections.find((s) => s.SectionID === currentData.TransferSecID);
      if (section && !values.TransferToSection) {
        setValue('TransferToSection', section);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData?.TransferSecID, allSections.length, selectedTransferToDepartment?.Dpt_ID]);

  // Set Location after store locations are loaded
  useEffect(() => {
    if (currentData?.StoreID && allStoreLocations.length > 0 && selectedTransferToSection) {
      const location = allStoreLocations.find((l) => l.StoreID === currentData.StoreID);
      if (location && !values.Location) {
        setValue('Location', location);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData?.StoreID, allStoreLocations.length, selectedTransferToSection?.SectionID]);

  // Fetch transfer items when ProductionNo is selected (for adding new items)
  useEffect(() => {
    // Skip on initial load if we have currentData
    if (isInitialLoad && currentData) {
      return;
    }

    const fetchTransferItems = async () => {
      // Only fetch if ProductionNo is selected and it's different from current data's ReportID
      if (selectedProductionNo?.ReportID && selectedProductionNo.ReportID !== currentData?.ReportID) {
        try {
          setDtlLoading(true);
          const response = await Get(
            `GetSortingReportDetails?DeptId=9&SectionId=26&ReportID=${selectedProductionNo.ReportID}`
          );

          const items = Array.isArray(response.data) ? response.data : [];
          const itemsWithTransferQty = items.map((item) => ({
            ...item,
            TransferQty: '0',
            VOUDTLID: 0, // New items have 0 ID
          }));

          // Merge with existing items if any, otherwise replace
          if (transferItems.length > 0) {
            // Merge: keep existing items, add new ones that don't exist
            const existingItemIds = transferItems.map((item) => item.ItemID);
            const newItems = itemsWithTransferQty.filter((item) => !existingItemIds.includes(item.ItemID));
            setTransferItems([...transferItems, ...newItems]);
          } else {
            setTransferItems(itemsWithTransferQty);
          }

          setTimeout(() => {
            if (gridRef.current && gridRef.current.api) {
              // Select newly added items
              const newItemIds = itemsWithTransferQty.map((item) => item.ItemID);
              newItemIds.forEach((itemId) => {
                gridRef.current.api.getRowNode(itemId.toString())?.setSelected(true);
              });
              const selectedRows = gridRef.current.api.getSelectedRows();
              setSelectedTransferItems(selectedRows.map((row) => row.ItemID));
            }
          }, 100);
        } catch (error) {
          console.error(`Error fetching transfer items:`, error);
          enqueueSnackbar('Failed to load transfer items', {
            variant: 'error',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        } finally {
          setDtlLoading(false);
        }
      }
    };

    fetchTransferItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductionNo?.ReportID, isInitialLoad]);

  // Mark initial load as complete after data is loaded
  useEffect(() => {
    if (currentData && transferItems.length > 0) {
      setIsInitialLoad(false);
    }
  }, [currentData, transferItems.length]);

  // Handle row selection in AG Grid
  const onSelectionChanged = useCallback((params) => {
    const selectedRows = params.api.getSelectedRows();
    setSelectedTransferItems(selectedRows.map((row) => row.ItemID));
  }, []);

  // Initialize loading state
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        GetAllDepartments(),
        GetPDONOByDeptAndSection(),
      ]);
      setLoading(false);
    };
    initializeData();
  }, [GetAllDepartments, GetPDONOByDeptAndSection]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!data.ProductionNo) {
        enqueueSnackbar('Please select a Production No', {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        return;
      }

      if (selectedTransferItems.length === 0) {
        enqueueSnackbar('Please select at least one item to transfer', {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        return;
      }

      // Filter selected transfer items and validate quantities
      const selectedItems = transferItems.filter((item) =>
        selectedTransferItems.includes(item.ItemID)
      );

      // Validate transfer quantities
      const invalidItems = selectedItems.filter((item) => {
        const transferQty = parseFloat(item.TransferQty) || 0;
        const remainingQty = parseFloat(item.RemainingQty) || 0;
        return transferQty <= 0 || transferQty > remainingQty;
      });

      if (invalidItems.length > 0) {
        enqueueSnackbar(
          'Please enter valid transfer quantities (greater than 0 and not exceeding remaining quantity)',
          {
            variant: 'error',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          }
        );
        return;
      }

      const formattedDate = formatDate(new Date(data.WasteDate));
      const shiftId = data.ShiftId?.ShiftId || 0;
      const transferDeptId = data.TransferToDepartment?.Dpt_ID || 0;
      const transferSecId = data.TransferToSection?.SectionID || 0;
      const storeID = data.Location?.StoreID || 0;
      const reportId = data.ProductionNo?.ReportID || 0;

      // Build details array from selected transfer items
      const details = selectedItems.map((item) => ({
        VOUDTLID: item.VOUDTLID || 0, // 0 for new items, existing ID for updates
        ItemID: parseInt(item.ItemID, 10) || 0,
        TransferQty: parseFloat(item.TransferQty) || 0,
        RemainingQty: parseFloat(item.RemainingQty) || 0,
        Type: item.Type || '',
        UOMID: parseInt(item.UOMID, 10) || 1,
      }));

      // Calculate total quantity
      const totalQty = selectedItems.reduce(
        (sum, item) => sum + (parseFloat(item.TransferQty) || 0),
        0
      );

      // Get UOMID from first item or default to 1
      const uomId = selectedItems.length > 0 ? parseInt(selectedItems[0].UOMID, 10) || 1 : 1;

      const requestData = {
        VID: currentData?.VID || 0,
        VoucherDate: formattedDate,
        DeptID: userData?.userDetails?.DepId || 0,
        TransferDeptID: transferDeptId,
        SECID: userData?.userDetails?.SectionID || 0,
        TransferSecID: transferSecId,
        StoreID: storeID,
        ReportID: reportId,
        SHIFID: shiftId,
        TotalQty: totalQty,
        UOMID: uomId,
        OrgID: userData?.userDetails?.orgId || 0,
        BranchID: userData?.userDetails?.branchID || 0,
        UpdatedBy: userData?.userDetails?.userId || 0,
        Details: details,
      };


      // Use Post for update with query parameters
      const response = await Put(
        `ItemVoucher/Update?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`,
        requestData
      );

      if (response?.data?.Success || response?.data?.success || response?.status === 200) {
        enqueueSnackbar('Transfer voucher updated successfully!', {
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        setTimeout(() => {
          router.push(paths.dashboard.Production.WasteVoucher.root);
        }, 500);
      } else {
        const errorMsg =
          response?.data?.Message || response?.data?.message || 'Failed to update transfer voucher';
        enqueueSnackbar(errorMsg, {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    } catch (error) {
      console.error('Update Error:', error);
      let errorMessage = 'Failed to update transfer voucher';
      if (error.response) {
        errorMessage =
          error.response.data?.Message ||
          error.response.data?.message ||
          error.message ||
          errorMessage;
      } else if (error.request) {
        errorMessage = 'No response received from server';
      }
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      });
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

  return isLoading ? (
    renderLoading
  ) : (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={4}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3, mb: 3 }}>
            <h3>Edit Transfer Voucher</h3>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              <Controller
                name="WasteDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Voucher Date"
                    format="dd MMM yyyy"
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    value={values?.WasteDate || null}
                    slotProps={{
                      textField: {
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />
              <RHFTextField
                name="Department"
                label="Department"
                fullWidth
                disabled
                value={userData?.userDetails?.DepartmentName || 'N/A'}
              />
              <RHFTextField
                name="Section"
                label="Section"
                fullWidth
                disabled
                value={userData?.userDetails?.SectionName || 'N/A'}
              />
              <RHFAutocomplete
                name="ShiftId"
                label="Shift Name"
                placeholder="Choose a shift"
                fullWidth
                options={allShiftData}
                getOptionLabel={(option) => option?.ShiftName || ''}
                isOptionEqualToValue={(option, value) => option.ShiftId === value.ShiftId}
                renderOption={(props, option) => (
                  <li {...props} key={option.ShiftId}>
                    {option.ShiftName}
                  </li>
                )}
              />
              <RHFAutocomplete
                name="TransferToDepartment"
                label="Transfer To Department"
                placeholder="Choose a department"
                fullWidth
                options={allDepartments}
                getOptionLabel={(option) => option?.Dpt_Name || ''}
                isOptionEqualToValue={(option, value) => option?.Dpt_ID === value?.Dpt_ID}
                renderOption={(props, option) => (
                  <li {...props} key={option.Dpt_ID}>
                    {option.Dpt_Name}
                  </li>
                )}
              />
              <RHFAutocomplete
                name="TransferToSection"
                label="Transfer To Section"
                placeholder="Choose a section"
                fullWidth
                options={allSections}
                getOptionLabel={(option) => option?.SectionName || ''}
                isOptionEqualToValue={(option, value) => option?.SectionID === value?.SectionID}
                disabled={!selectedTransferToDepartment}
                renderOption={(props, option) => (
                  <li {...props} key={option.SectionID}>
                    {option.SectionName}
                  </li>
                )}
              />
              <RHFAutocomplete
                name="Location"
                label="Location"
                placeholder="Choose a location"
                fullWidth
                options={allStoreLocations}
                getOptionLabel={(option) => option?.StoreName || ''}
                isOptionEqualToValue={(option, value) => option?.StoreID === value?.StoreID}
                disabled={!selectedTransferToDepartment || !selectedTransferToSection}
                renderOption={(props, option) => (
                  <li {...props} key={option.StoreID}>
                    {option.StoreName}
                  </li>
                )}
              />
              <RHFAutocomplete
                name="ProductionNo"
                label="Production No"
                placeholder="Choose a production order"
                fullWidth
                options={allProductionOrders}
                getOptionLabel={(option) => option?.PDONO || ''}
                isOptionEqualToValue={(option, value) => option?.ReportID === value?.ReportID}
                renderOption={(props, option) => (
                  <li {...props} key={option.ReportID}>
                    {option.PDONO}
                  </li>
                )}
              />
            </Box>
          </Card>

          {/* Transfer Items Grid */}
          {(selectedProductionNo || (currentData && transferItems.length > 0)) && (
            <Card sx={{ p: 3, mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <h3>Transfer Items (All Types: Waste, Output, Input)</h3>
              </Box>

              {isDtlLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <LoadingScreen />
                </Box>
              ) : (
                <>
                  <div style={{ height: 400, width: '100%' }}>
                    <AgGridReact
                      ref={gridRef}
                      className="ag-theme-material"
                      theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
                      rowData={transferItems}
                      columnDefs={columnDefs}
                      defaultColDef={defaultColDef}
                      rowSelection="multiple"
                      onSelectionChanged={onSelectionChanged}
                      suppressRowClickSelection={false}
                      pagination
                      paginationPageSize={20}
                      domLayout="normal"
                      getRowId={(params) => {
                        // Use ItemID as primary key, fallback to VOUDTLID for existing items
                        if (params.data.ItemID) {
                          return String(params.data.ItemID);
                        }
                        if (params.data.VOUDTLID && params.data.VOUDTLID > 0) {
                          return `detail_${params.data.VOUDTLID}`;
                        }
                        return `new_${Math.random()}`;
                      }}
                      onCellValueChanged={(params) => {
                        if (params.colDef.field === 'TransferQty') {
                          setTransferItems((prevItems) =>
                            prevItems.map((item) =>
                              item.ItemID === params.data.ItemID
                                ? { ...item, TransferQty: params.data.TransferQty }
                                : item
                            )
                          );
                        }
                      }}

                      onGridReady={(params) => {
                        // Ensure grid is ready and select existing items if not already selected
                        if (transferItems.length > 0) {
                          setTimeout(() => {
                            // Only select if nothing is selected yet
                            const currentSelection = params.api.getSelectedRows();
                            if (currentSelection.length === 0) {
                              params.api.selectAll();
                              const selectedRows = params.api.getSelectedRows();
                              setSelectedTransferItems(selectedRows.map((row) => row.ItemID));
                            }
                          }, 200);
                        }
                      }}
                    />
                  </div>

                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <strong>Selected Items:</strong> {selectedTransferItems.length} item(s)
                    </Box>
                    <Box>
                      <strong>Total Transfer Quantity:</strong>{' '}
                      {transferItems
                        .filter((item) => selectedTransferItems.includes(item.ItemID))
                        .reduce((sum, item) => sum + (parseFloat(item.TransferQty) || 0), 0)
                        .toFixed(2)}
                    </Box>
                  </Box>
                </>
              )}
            </Card>
          )}

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
              disabled={selectedTransferItems.length === 0}
            >
              Update Transfer Voucher ({selectedTransferItems.length})
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

WasteVoucherEditForm.propTypes = {
  currentData: PropTypes.any,
};
