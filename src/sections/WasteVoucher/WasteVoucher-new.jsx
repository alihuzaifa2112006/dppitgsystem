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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import LoadingButton from '@mui/lab/LoadingButton';

import { LoadingScreen } from 'src/components/loading-screen';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';

import { Get, Post } from 'src/api/apibasemethods';
import { DesktopDatePicker } from '@mui/x-date-pickers';

// ----------------------------------------------------------------------
const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

// Store to Store: source options for "Transfer From" (multi-select)
const TRANSFER_FROM_OPTIONS = [
  { value: 'GRN', label: 'GRN' },
  { value: 'Transaction', label: 'Transaction' },
  { value: 'Returned', label: 'Returned' },
  { value: 'Produced', label: 'Produced' },
  { value: 'All', label: 'All' },
];

// Max transferable qty based on selected source(s). All = CurrentStock; otherwise sum of selected.
function getMaxAvailableForRow(row) {
  const types = Array.isArray(row?.ItemTransferType) ? row.ItemTransferType : [];
  if (types.length === 0) return 0;
  if (types.includes('All')) return parseFloat(row.CurrentStock) || 0;
  let sum = 0;
  if (types.includes('GRN')) sum += parseFloat(row.TotalGRNQty) || 0;
  if (types.includes('Transaction')) sum += parseFloat(row.OpeningQty) || 0;
  if (types.includes('Returned')) sum += parseFloat(row.TotalReturnQty) || 0;
  if (types.includes('Produced')) sum += parseFloat(row.TotalProducedQty) || 0;
  return sum;
}

export default function WasteVoucherCreateForm() {
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const gridRef = useRef(null);

  // Tab: 0 = Standard, 1 = Store to Store
  const [tabValue, setTabValue] = useState(0);

  // Define default form values
  const defaultValues = {
    WasteDate: new Date() || null,
    ShiftId: null,
    Department: userData?.userDetails?.DepartmentName || '',
    Section: userData?.userDetails?.SectionName || '',
    TransferToDepartment: null,
    TransferToSection: null,
    Location: null,
    ProductionNo: null,
    ItemType: null,
    // Store to Store
    FromStore: null,
    ToStore: null,
  };

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
        ShiftId: Yup.number(),
        ShiftName: Yup.string(),
      })
      .nullable(),
    TransferToDepartment: Yup.object().nullable(),
    TransferToSection: Yup.object().nullable(),
    Location: Yup.object().nullable(),
    ProductionNo: Yup.object().nullable(),
    ItemType: Yup.string().nullable(),
    FromStore: Yup.object().nullable(),
    ToStore: Yup.object().nullable(),
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
  const [isLoading, setLoading] = useState(false);
  const [isDtlLoading, setDtlLoading] = useState(false);
  const [allDepartments, setAllDepartments] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [allStoreLocations, setAllStoreLocations] = useState([]);
  const [allProductionOrders, setAllProductionOrders] = useState([]);
  const [productionOrderItems, setProductionOrderItems] = useState([]);
  const [transferItems, setTransferItems] = useState([]);
  const [selectedTransferItems, setSelectedTransferItems] = useState([]);
  // Store to Store
  const [stsStoreLocations, setStsStoreLocations] = useState([]);
  const [stsStoreItemsLoading, setStsStoreItemsLoading] = useState(false);

  // Watchers
  const selectedProductionNo = watch('ProductionNo');
  const selectedItemType = watch('ItemType');
  const selectedTransferToDepartment = watch('TransferToDepartment');
  const selectedTransferToSection = watch('TransferToSection');
  const selectedFromStore = watch('FromStore');

  // Item Type options: unique Type values from fetched production order items
  const itemTypeOptions = useMemo(() => {
    const types = [...new Set(productionOrderItems.map((item) => item.Type).filter(Boolean))];
    return types.sort();
  }, [productionOrderItems]);

  // AG Grid column definitions (Type column hidden for Store to Store)
  const columnDefs = useMemo(
    () => [
      {
        field: 'checkbox',
        headerName: '',
        pinned: 'left',
        maxWidth: 50,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        sortable: false,
        filter: false,
        resizable: false,
        lockPosition: 'left',
      },
      ...(tabValue === 0
        ? [
          {
            field: 'Type',
            headerName: 'Type',
            minWidth: 100,
            filter: 'agTextColumnFilter',
            cellStyle: (params) => {
              if (params.value === 'Waste') return { color: '#c62828' };
              if (params.value === 'Output') return { color: '#2e7d32' };
              if (params.value === 'Input') return { color: '#1565c0' };
              return null;
            },
          },
        ]
        : []),
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
      ...(tabValue === 1
        ? [
          { field: 'OpeningQty', headerName: 'Transection Qty (Opening Qty)', minWidth: 110, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: (p) => (parseFloat(p.value) ?? 0).toFixed(2), cellStyle: { textAlign: 'right' } },
          { field: 'TotalGRNQty', headerName: 'Total GRN Qty', minWidth: 120, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: (p) => (parseFloat(p.value) ?? 0).toFixed(2), cellStyle: { textAlign: 'right' } },
          { field: 'TotalIssueQty', headerName: 'Total Issue Qty', minWidth: 120, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: (p) => (parseFloat(p.value) ?? 0).toFixed(2), cellStyle: { textAlign: 'right' } },
          { field: 'TotalReturnQty', headerName: 'Total Return Qty', minWidth: 130, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: (p) => (parseFloat(p.value) ?? 0).toFixed(2), cellStyle: { textAlign: 'right' } },
          { field: 'TotalProducedQty', headerName: 'Total Produced Qty', minWidth: 140, type: 'numericColumn', filter: 'agNumberColumnFilter', valueFormatter: (p) => (parseFloat(p.value) ?? 0).toFixed(2), cellStyle: { textAlign: 'right' } },
        ]
        : []),
      {
        field: 'RemainingQty',
        headerName: 'Remaining Qty',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => parseFloat(params.value).toFixed(2),
        cellStyle: { textAlign: 'right' },
      },
      ...(tabValue === 1
        ? [
          {
            field: 'ItemTransferType',
            headerName: 'Transfer From',
            minWidth: 180,
            cellRenderer: (params) => {
              const value = Array.isArray(params.value) ? params.value : [];
              const allValues = TRANSFER_FROM_OPTIONS.map((o) => o.value);
              const handleChange = (e) => {
                const selected = e.target.value;
                let next = typeof selected === 'string' ? selected.split(',') : selected;
                if (next.includes('All')) next = [...allValues];
                params.data.ItemTransferType = next;
                const maxAvail = getMaxAvailableForRow({ ...params.data, ItemTransferType: next });
                const currentQty = parseFloat(params.data.TransferQty) || 0;
                if (currentQty > maxAvail) {
                  params.data.TransferQty = maxAvail.toFixed(2);
                }
                params.api.refreshCells({ rowNodes: [params.node], force: true });
                setTransferItems((prev) =>
                  prev.map((it) => {
                    if (it.ItemID !== params.data.ItemID) return it;
                    const capped = parseFloat(it.TransferQty) > maxAvail ? maxAvail.toFixed(2) : it.TransferQty;
                    return { ...it, ItemTransferType: next, TransferQty: capped };
                  })
                );
              };
              return (
                <FormControl size="small" fullWidth sx={{ minWidth: 140 }}>
                  <Select
                    multiple
                    value={value}
                    onChange={handleChange}
                    renderValue={(v) => (Array.isArray(v) ? v.join(', ') : v)}
                    displayEmpty
                    sx={{ height: 32, fontSize: '0.875rem' }}
                  >
                    {TRANSFER_FROM_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        <Checkbox checked={value.indexOf(opt.value) > -1} />
                        <ListItemText primary={opt.label} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            },
          },
        ]
        : []),
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
          const value = parseFloat(params.value) || 0;
          return value.toFixed(2);
        },
        valueSetter: (params) => {
          const newValue = parseFloat(params.newValue) || 0;
          const maxQty =
            tabValue === 1 ? getMaxAvailableForRow(params.data) : parseFloat(params.data.RemainingQty) || 0;

          if (newValue > maxQty) {
            enqueueSnackbar(
              `Cannot exceed available quantity for selected source(s): ${maxQty.toFixed(2)}`,
              { variant: 'warning', anchorOrigin: { vertical: 'top', horizontal: 'right' } }
            );
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
          const value = parseFloat(params.value) || 0;
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
    [enqueueSnackbar, tabValue]
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

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
    setValue('TransferToSection', null);
    setValue('Location', null);
  }, [selectedTransferToDepartment, FetchAllSectionsData, setValue]);

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
    setValue('Location', null);
  }, [GetAllStorelocations, setValue]);

  // Fetch production orders based on selected department and section
  const GetPDONOByDeptAndSection = useCallback(async () => {
    try {
      const response = await Get(`GetPDONOByDeptAndSection?DeptId=${userData?.userDetails?.DepId}&SectionId=${userData?.userDetails?.SectionID}`);
      setAllProductionOrders(response.data?.Data || []);
    } catch (error) {
      console.error(error);
      setAllProductionOrders([]);
    }
  }, [userData?.userDetails?.DepId, userData?.userDetails?.SectionID]);

  useEffect(() => {
    GetPDONOByDeptAndSection();
    setValue('ProductionNo', null);
  }, [GetPDONOByDeptAndSection, selectedTransferToDepartment, selectedTransferToSection, setValue]);

  // Store to Store: fetch stores by Dept and Section (SectionID 20 for STS)
  const STS_SECTION_ID = 20;
  const STS_DEPT_ID = 2;
  const FetchStsStoreLocations = useCallback(async () => {
    const deptId = userData?.userDetails?.DepId;
    if (!deptId) return;
    try {
      const response = await Get(
        `GetAllStoreLocationsByDeptIDandSecID?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&DeptID=${STS_DEPT_ID}&SectionID=${STS_SECTION_ID}`
      );
      setStsStoreLocations(response.data || []);
    } catch (error) {
      console.error(error);
      setStsStoreLocations([]);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    userData?.userDetails?.DepId,
  ]);

  useEffect(() => {
    if (tabValue === 1) {
      FetchStsStoreLocations();
      setValue('FromStore', null);
      setValue('ToStore', null);
    } else {
      setValue('FromStore', null);
      setValue('ToStore', null);
    }
  }, [tabValue, FetchStsStoreLocations, setValue]);

  // Store to Store: when From Store changes, clear To Store and items
  useEffect(() => {
    if (tabValue === 1) setValue('ToStore', null);
  }, [tabValue, selectedFromStore?.StoreID, setValue]);

  // Store to Store: fetch items for selected From Store
  useEffect(() => {
    const fetchStoreItems = async () => {
      if (tabValue !== 1 || !selectedFromStore?.StoreID) {
        setTransferItems([]);
        setSelectedTransferItems([]);
        return;
      }
      try {
        setStsStoreItemsLoading(true);
        const response = await Get(
          `GetStoreItemsWithStock?StoreID=${selectedFromStore.StoreID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        const items = response?.data?.Items || response?.Items || [];
        const itemsWithTransferQty = items.map((item) => ({
          ItemID: item.ItemID,
          ItemCode: item.ItemCode,
          ItemName: item.ItemDescription,
          ItemDescription: item.ItemDescription,
          RemainingQty: item.CurrentStock ?? 0,
          CurrentStock: item.CurrentStock ?? 0,
          OpeningQty: item.OpeningQty ?? 0,
          TotalGRNQty: item.TotalGRNQty ?? 0,
          TotalIssueQty: item.TotalIssueQty ?? 0,
          TotalReturnQty: item.TotalReturnQty ?? 0,
          TotalProducedQty: item.TotalProducedQty ?? 0,
          UOMID: item.UOMID,
          UOMName: item.UOMName || item.UOM?.UOMName,
          TransferQty: '0',
          ItemTransferType: [],
        }));
        setTransferItems(itemsWithTransferQty);
        setSelectedTransferItems([]);
        setTimeout(() => {
          if (gridRef.current?.api) {
            gridRef.current.api.deselectAll();
          }
        }, 100);
      } catch (error) {
        console.error('Error fetching store items:', error);
        setTransferItems([]);
        setSelectedTransferItems([]);
        enqueueSnackbar('Failed to load store items', {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      } finally {
        setStsStoreItemsLoading(false);
      }
    };
    fetchStoreItems();
  }, [
    tabValue,
    selectedFromStore?.StoreID,
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    enqueueSnackbar,
  ]);

  // To Store options: all STS stores except selected From Store
  const toStoreOptions = useMemo(() => {
    if (!selectedFromStore?.StoreID) return stsStoreLocations;
    return stsStoreLocations.filter((s) => s.StoreID !== selectedFromStore.StoreID);
  }, [stsStoreLocations, selectedFromStore?.StoreID]);

  // Clear ItemType when ProductionNo changes
  useEffect(() => {
    if (tabValue === 0) setValue('ItemType', null);
  }, [tabValue, selectedProductionNo?.ReportID, setValue]);

  // Fetch items when ProductionNo is selected (Standard tab only); store in productionOrderItems
  useEffect(() => {
    const fetchTransferItems = async () => {
      if (tabValue !== 0) {
        setProductionOrderItems([]);
        setTransferItems([]);
        setSelectedTransferItems([]);
        return;
      }
      if (selectedProductionNo?.ReportID) {
        try {
          setDtlLoading(true);
          const response = await Get(
            `GetSortingReportDetails?DeptId=${userData?.userDetails?.DepId}&SectionId=${userData?.userDetails?.SectionID}&ReportID=${selectedProductionNo.ReportID}`
          );

          const items = Array.isArray(response.data) ? response.data : [];

          // Add TransferQty field for editable transfer quantities
          const itemsWithTransferQty = items.map((item) => ({
            ...item,
            TransferQty: '0',
          }));

          setProductionOrderItems(itemsWithTransferQty);
          setTransferItems([]);
          setSelectedTransferItems([]);
        } catch (error) {
          console.error(
            `Error fetching transfer items for ReportID ${selectedProductionNo.ReportID}:`,
            error
          );
          setProductionOrderItems([]);
          setTransferItems([]);
          setSelectedTransferItems([]);
          enqueueSnackbar('Failed to load transfer items', {
            variant: 'error',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
        } finally {
          setDtlLoading(false);
        }
      } else {
        setProductionOrderItems([]);
        setTransferItems([]);
        setSelectedTransferItems([]);
      }
    };

    fetchTransferItems();
  }, [tabValue, selectedProductionNo, enqueueSnackbar, userData?.userDetails?.DepId, userData?.userDetails?.SectionID]);

  // Filter grid by Item Type (Standard tab): only show items matching selected type
  useEffect(() => {
    if (tabValue !== 0) return;
    if (!selectedItemType) {
      setTransferItems([]);
      setSelectedTransferItems([]);
      setTimeout(() => {
        if (gridRef.current?.api) gridRef.current.api.deselectAll();
      }, 100);
      return;
    }
    const filtered = productionOrderItems.filter((item) => item.Type === selectedItemType);
    setTransferItems(filtered);
    setSelectedTransferItems([]);
    setTimeout(() => {
      if (gridRef.current?.api) {
        gridRef.current.api.deselectAll();
        gridRef.current.api.selectAll();
        const selectedRows = gridRef.current.api.getSelectedRows();
        setSelectedTransferItems(selectedRows.map((row) => row.ItemID));
      }
    }, 100);
  }, [tabValue, selectedItemType, productionOrderItems]);

  // Handle row selection in AG Grid
  const onSelectionChanged = useCallback((params) => {
    const selectedRows = params.api.getSelectedRows();
    setSelectedTransferItems(selectedRows.map((row) => row.ItemID));
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const isStoreToStore = tabValue === 1;

      if (isStoreToStore) {
        if (!data.FromStore?.StoreID || !data.ToStore?.StoreID) {
          enqueueSnackbar('Please select From Store and To Store', {
            variant: 'error',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
          return;
        }
        // eslint-disable-next-line
      } else {
        // eslint-disable-next-line
        if (!data.ProductionNo) {
          enqueueSnackbar('Please select a Production No', {
            variant: 'error',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
          return;
        }
        if (!data.ItemType) {
          enqueueSnackbar('Please select an Item Type (Input, Output, or Waste)', {
            variant: 'error',
            anchorOrigin: { vertical: 'top', horizontal: 'right' },
          });
          return;
        }
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

      // Validate transfer quantities (and for STS: source selection + per-source limit)
      let invalidItems = [];
      if (tabValue === 1) {
        invalidItems = selectedItems.filter((item) => {
          const transferQty = parseFloat(item.TransferQty) || 0;
          const types = Array.isArray(item.ItemTransferType) ? item.ItemTransferType : [];
          const maxAvail = getMaxAvailableForRow(item);
          if (types.length === 0) return true;
          return transferQty <= 0 || transferQty > maxAvail;
        });
        if (invalidItems.length > 0) {
          enqueueSnackbar(
            'For each selected item: choose at least one source (Transfer From) and ensure quantity does not exceed available for that source.',
            { variant: 'error', anchorOrigin: { vertical: 'top', horizontal: 'right' } }
          );
          return;
        }
      } else {
        invalidItems = selectedItems.filter((item) => {
          const transferQty = parseFloat(item.TransferQty) || 0;
          const remainingQty = parseFloat(item.RemainingQty) || 0;
          return transferQty <= 0 || transferQty > remainingQty;
        });
        if (invalidItems.length > 0) {
          enqueueSnackbar(
            'Please enter valid transfer quantities (greater than 0 and not exceeding remaining quantity)',
            { variant: 'error', anchorOrigin: { vertical: 'top', horizontal: 'right' } }
          );
          return;
        }
      }

      const formattedDate = formatDate(new Date(data.WasteDate));
      const deptId = userData?.userDetails?.DepId || 0;
      const secId = userData?.userDetails?.SectionID || 0;

      // Build details array from selected transfer items
      const details = selectedItems.map((item) => {
        const types = Array.isArray(item.ItemTransferType) ? item.ItemTransferType : [];
        const itemTransferTypeStr = types.length > 0 ? types.join(',') : '';
        const detail = {
          ItemID: parseInt(item.ItemID, 10) || 0,
          TransferQty: parseFloat(item.TransferQty) || 0,
          RemainingQty: parseFloat(item.RemainingQty) || 0,
          UOMID: parseInt(item.UOMID, 10) || 1,
          ORGID: userData?.userDetails?.orgId || 0,
          BRNCHID: userData?.userDetails?.branchID || 0,
          CreatedBy: userData?.userDetails?.userId || 0,
          Types: item.Type || 'Stock',
        };  
        if (tabValue === 1) detail.ItemTransferType = itemTransferTypeStr || 'All';
        return detail;
      });

      const totalQty = selectedItems.reduce(
        (sum, item) => sum + (parseFloat(item.TransferQty) || 0),
        0
      );
      const uomId = selectedItems.length > 0 ? parseInt(selectedItems[0].UOMID, 10) || 1 : 1;

      let requestData;
      if (isStoreToStore) {
        requestData = {
          VoucherDate: formattedDate,
          DeptID: deptId,
          TransferDeptID: deptId,
          SECID: secId,
          TransferSecID: secId,
          LoctionID: data.ToStore.StoreID,
          ReportID: 0,
          SHIFID: 0,
          TotalQty: totalQty,
          UOMID: uomId,
          ORGID: userData?.userDetails?.orgId || 0,
          BRNCHID: userData?.userDetails?.branchID || 0,
          CreatedBy: userData?.userDetails?.userId || 0,
          FromLocationID: data.FromStore.StoreID,
          isSTS: 1,
          Details: details,
        };
      } else {
        const shiftId = data.ShiftId?.ShiftId || 0;
        const transferDeptId = data.TransferToDepartment?.Dpt_ID || 0;
        const transferSecId = data.TransferToSection?.SectionID || 0;
        const storeID = data.Location?.StoreID || 0;
        const reportId = data.ProductionNo?.ReportID || 0;
        requestData = {
          VoucherDate: formattedDate,
          DeptID: deptId,
          TransferDeptID: transferDeptId,
          SECID: secId,
          TransferSecID: transferSecId,
          LoctionID: storeID,
          ReportID: reportId,
          SHIFID: shiftId,
          TotalQty: totalQty,
          UOMID: uomId,
          ORGID: userData?.userDetails?.orgId || 0,
          BRNCHID: userData?.userDetails?.branchID || 0,
          CreatedBy: userData?.userDetails?.userId || 0,
          FromLocationID: 0,
          isSTS: 0,
          Details: details,
        };
      }

      console.log('Request Data:', requestData);

      const response = await Post(`ItemVoucher/SaveItemVoucher`, requestData);

      if (response?.data?.Success || response?.data?.success || response?.status === 200) {
        enqueueSnackbar('Transfer voucher saved successfully!', {
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        reset();
        setTransferItems([]);
        setSelectedTransferItems([]);
        setTimeout(() => {
          router.push(paths.dashboard.Production.WasteVoucher.root);
        }, 500);
      } else {
        const errorMsg =
          response?.data?.Message || response?.data?.message || 'Failed to save transfer voucher';
        enqueueSnackbar(errorMsg, {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    } catch (error) {
      console.error('Submission Error:', error);
      let errorMessage = 'Failed to create transfer voucher';
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
            <h3>Transfer Voucher</h3>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
              <Tab
                value={0}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#4CAF50',
                      }}
                    />
                    Standard
                  </Box>
                }
              />
              <Tab
                value={1}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: '#fcba03',
                      }}
                    />
                    Store to Store
                  </Box>
                }
              />
            </Tabs>
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
                    defaultValue={new Date()}
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
              {tabValue === 0 && (
                <>
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
                  <RHFAutocomplete
                    name="ItemType"
                    label="Item Type"
                    placeholder="Choose type from production order"
                    fullWidth
                    options={itemTypeOptions}
                    getOptionLabel={(option) => option || ''}
                    isOptionEqualToValue={(option, value) => option === value}
                    disabled={!selectedProductionNo}
                    renderOption={(props, option) => (
                      <li {...props} key={option}>
                        {option}
                      </li>
                    )}
                  />
                </>
              )}
              {tabValue === 1 && (
                <>
                  <RHFAutocomplete
                    name="FromStore"
                    label="From Store"
                    placeholder="Choose source store"
                    fullWidth
                    options={stsStoreLocations}
                    getOptionLabel={(option) => option?.StoreName || ''}
                    isOptionEqualToValue={(option, value) => option?.StoreID === value?.StoreID}
                    renderOption={(props, option) => (
                      <li {...props} key={option.StoreID}>
                        {option.StoreName}
                      </li>
                    )}
                  />
                  <RHFAutocomplete
                    name="ToStore"
                    label="To Store"
                    placeholder="Choose destination store"
                    fullWidth
                    options={toStoreOptions}
                    getOptionLabel={(option) => option?.StoreName || ''}
                    isOptionEqualToValue={(option, value) => option?.StoreID === value?.StoreID}
                    disabled={!selectedFromStore}
                    renderOption={(props, option) => (
                      <li {...props} key={option.StoreID}>
                        {option.StoreName}
                      </li>
                    )}
                  />
                </>
              )}
            </Box>
          </Card>

          {/* Transfer Items Grid */}
          {((tabValue === 0 && selectedProductionNo && selectedItemType) || (tabValue === 1 && selectedFromStore)) && (
            <Card sx={{ p: 3, mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <h3>
                  {tabValue === 1
                    ? 'Store Items – select and enter transfer quantity'
                    : `Transfer Items (${selectedItemType || 'filter by Item Type'})`}
                </h3>
              </Box>

              {(tabValue === 0 ? isDtlLoading : stsStoreItemsLoading) ? (
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
                      suppressRowClickSelection
                      pagination
                      paginationPageSize={20}
                      headerHeight={40}
                      rowHeight={38}
                      domLayout="normal"
                      getRowId={(params) => params.data.ItemID}
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
              Save Transfer Voucher ({selectedTransferItems.length})
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
