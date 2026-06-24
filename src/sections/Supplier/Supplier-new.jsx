import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AgGridReact } from 'ag-grid-react';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Checkbox,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';

import { Get, Post } from 'src/api/apibasemethods';
import {
  DesktopDatePicker,
  DesktopDateTimePicker,
  DesktopTimePicker,
  MobileTimePicker,
} from '@mui/x-date-pickers';
import Scrollbar from 'src/components/scrollbar';
import {
  TableEmptyRows,
  useTable,
  emptyRows,
  TableHeadCustom,
  TableNoData,
} from 'src/components/table';
import SupplierTableRow from './Supplier-table-row';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { fNumber } from 'src/utils/format-number';
// import Textfield from '../_examples/mui/textfield-view/textfield';
import { fDate } from 'src/utils/format-time';

// Themeing for AG Grid
const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

// ----------------------------------------------------------------------

export default function SupplierCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const gridRef = useRef();
  const [allItemUnit, setallItemUnit] = useState([]);
  const [allSupplierData, setallSupplierData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [RequestDetails, setRequestDetails] = useState([]);
  const [allSuperVisiorName, setallSuperVisiorName] = useState([]);
  const [allShiftName, setallShiftName] = useState([]);
  const [allSuperWorkerName, setallSuperWorkerName] = useState([]);
  const [isGrnLoading, setIsGrnLoading] = useState(false);
  const [hrUsers, setHrUsers] = useState([]);
  const [allLineNumbers, setAllLineNumbers] = useState([]);
  const [allChallanNo, setallChallanNo] = useState([]);
  const [grnData, setGrnData] = useState(null);
  const [selectedUOMID, setSelectedUOMID] = useState(null);
  const [selectedValues, setSelectedValues] = useState(new Set());
  const [selectedRowData, setSelectedRowData] = useState([]);

  // State for sorted item selection
  const [allSortedClassName, setAllSortedClassName] = useState([]);
  const [allSortedCategoryData, setAllSortedCategoryData] = useState([]);
  const [allSortedSubCategory, setAllSortedSubCategory] = useState([]);
  const [allSortedColors, setAllSortedColors] = useState([]);
  const [allSortedInvSpare, setAllSortedInvSpare] = useState([]);
  const [SortedItemOpen, setSortedItemOpen] = useState([]);

  // State for waste details selection (with ClassID: 5)
  const [allWasteCategoryData, setAllWasteCategoryData] = useState([]);
  const [allWasteSubCategory, setAllWasteSubCategory] = useState([]);
  const [allWasteItems, setAllWasteItems] = useState([]);
  const [wasteDetails, setWasteDetails] = useState([]);

  const [alltransferNumbers, setAlltransferNumbers] = useState([]);

  const ChallanDetailsTableHead = [
    { id: 'Checkbox', label: 'Select', minWidth: 80, align: 'left' },
    { id: 'ReqCode', label: 'Req No/Transfer No', minWidth: 220, align: 'center' },
    { id: 'ItemName', label: 'Item Name', minWidth: 220, align: 'left' },
    { id: 'TotalIssueQty', label: 'Issued Qty', minWidth: 140, align: 'right' },
    { id: 'TotalRequestedQty', label: 'Requested Qty', minWidth: 140, align: 'right' },
    { id: 'StoreName', label: 'Store', minWidth: 140, align: 'center' },
    { id: 'LocationName', label: 'Location', minWidth: 160, align: 'center' },
  ];

  // Table Heads
  const DetailsTableHead = [
    { id: 'Challan', label: 'Requisition No', minWidth: 150, align: 'center' },
    { id: 'ShiftName', label: 'Shift', minWidth: 150, align: 'center' },
    // { id: 'ColorID', label: 'Color', minWidth: 150, align: 'center' },

    { id: 'Line', label: 'Line No', minWidth: 150, align: 'center' },
    { id: 'InventoryType', label: 'Inventory Type', minWidth: 150, align: 'center' },
    { id: 'Category', label: 'Category', minWidth: 150, align: 'center' },
    { id: 'SubCategory', label: 'Sub Category', minWidth: 150, align: 'center' },
    { id: 'ColorOrSpare', label: 'Color/Spare', minWidth: 150, align: 'center' },
    { id: 'ItemName', label: 'Item Name', minWidth: 200, align: 'center' },
    { id: 'TBale', label: 'Total Bale', minWidth: 150, align: 'center' },
    { id: 'TotalWeight', label: 'Total Weight', minWidth: 150, align: 'center' },
    { id: 'MCRunning', label: 'MC Running', minWidth: 150, align: 'center' },
    { id: 'ProductionHR', label: 'Production/HR', minWidth: 150, align: 'center' },
    { id: 'Actions', label: 'Actions', minWidth: 150, align: 'center' },
  ];

  // Table
  const table = useTable();

  const notFound = !RequestDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  // Dynamic line totals based on selected lines
  const [lineTotals, setLineTotals] = useState({});
  const [selectedLines, setSelectedLines] = useState(new Set());

  // Date In SQL format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const [isLoading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);

  // --- Form Hooks Setup ---
  const NewSupplierSchema = Yup.object().shape({
    // Basic Information Fields
    PRDate: Yup.date().required('Report Date is required').typeError('Please select a valid date'),

    Line: Yup.object().required('Line No is required').typeError('Please select a Line number'),

    ShiftName: Yup.object().required('Shift is required').typeError('Please select a Shift'),

    TimePicker: Yup.date()
      .required('Start time is required')
      .typeError('Please select a valid time'),

    ReqCode: Yup.array()
      .min(1, 'Please select at least one Requisition Number')
      .required('Requisition No is required'),

    // Item Selection Fields
    SortedClassID: Yup.object()
      .required('Inventory Type is required')
      .typeError('Please select an Inventory Type'),

    SortedCategory: Yup.object()
      .required('Item Category is required')
      .typeError('Please select an Item Category'),

    SortedSubCategory: Yup.object()
      .required('Item Sub Category is required')
      .typeError('Please select an Item Sub Category'),

    SortedColor: Yup.object()
      .nullable()
      .when('SortedClassID', {
        is: (val) => val && val.isColorSensitive === true,
        then: (schema) =>
          schema.required('Color Name & Code is required').typeError('Please select a Color'),
        otherwise: (schema) => schema.nullable(),
      }),

    SortedInvSpare: Yup.object()
      .nullable()
      .when('SortedClassID', {
        is: (val) => val && val.isColorSensitive === false,
        then: (schema) =>
          schema.required('Spare Name & Code is required').typeError('Please select a Spare'),
        otherwise: (schema) => schema.nullable(),
      }),

    SortedItemOpen: Yup.object()
      .required('Item Name is required')
      .typeError('Please select an Item Name'),

    // Report Fields
    TBale: Yup.number()
      .required('Total Bale is required')
      .typeError('Total Bale must be a number')
      .min(0, 'Total Bale must be greater than or equal to 0')
      .test(
        'not-empty',
        'Total Bale cannot be empty',
        (value) => value !== '' && value !== null && value !== undefined
      ),

    TotalWeight: Yup.number()
      .nullable()
      .typeError('Total Weight must be a number')
      .min(0, 'Total Weight must be greater than or equal to 0'),

    MCRunning: Yup.number()
      .required('M/C Running is required')
      .typeError('M/C Running must be a number')
      .min(0, 'M/C Running must be greater than or equal to 0')
      .test(
        'not-empty',
        'M/C Running cannot be empty',
        (value) => value !== '' && value !== null && value !== undefined
      ),

    ProductionHR: Yup.number()
      .required('Production/HR is required')
      .typeError('Production/HR must be a number')
      .min(0, 'Production/HR must be greater than or equal to 0')
      .test(
        'not-empty',
        'Production/HR cannot be empty',
        (value) => value !== '' && value !== null && value !== undefined
      ),

    Remarks: Yup.string().nullable().max(500, 'Remarks cannot exceed 500 characters'),

    // Waste Details Fields (optional - only required when adding waste)
  });

  const methods = useForm({
    resolver: yupResolver(NewSupplierSchema),
    defaultValues: {
      PRDate: new Date(),
      SectionID: null,
      LineNo: null,
      ReqCode: [],
      TransferNumber: [],
      SortedClassID: null,
      SortedCategory: null,
      SortedSubCategory: null,
      SortedColor: null,
      SortedInvSpare: null,
      SortedItemOpen: null,
      WasteCategory: null,
      WasteSubCategory: null,
      WasteItem: null,
      WasteQty: '',
      WastePercent: '',
    },
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleCheckboxChange = (row) => {
    // Use uniqueKey if available, otherwise fallback to IssueDtlID
    const key = row.uniqueKey || row.IssueDtlID;

    setSelectedValues((prev) => {
      const newSet = new Set(prev);
      let updatedData;
      if (newSet.has(key)) {
        newSet.delete(key);
        updatedData = selectedRowData.filter((item) => {
          const itemKey = item.uniqueKey || item.IssueDtlID;
          return itemKey !== key;
        });
        setSelectedRowData(updatedData);
      } else {
        newSet.add(key);
        updatedData = [...selectedRowData, row];
        setSelectedRowData(updatedData);
      }
      // Console mai show karo selected items
      console.log('Selected Items Array:', updatedData);
      console.log('Selected Items Count:', updatedData.length);
      return newSet;
    });
  };

  // Console mai selected items array ko track karo
  useEffect(() => {
    console.log('Selected Items Array (Updated):', selectedRowData);
    console.log('Total Selected Items:', selectedRowData.length);
    if (selectedRowData.length > 0) {
      console.log(
        'Selected Items Details:',
        selectedRowData.map((item) => ({
          IssueDtlID: item.IssueDtlID,
          ItemName: item.ItemName,
          CategoryName: item.CategoryName,
          SubCatName: item.SubCatName,
          UOMName: item.UOMName,
          RemainingQty: item.RemainingQty,
        }))
      );
    }
  }, [selectedRowData]);

  // 💥 FIX APPLIED HERE
  // 'values' must be defined before it is used.
  const values = watch();

  // Variables dependent on 'values' must be defined after 'values'.
  const totalWeight = watch('TotalWeight');
  const dustWeight = watch('DustWeight');

  // Calculate total issue qty from selected rows
  const totalIssueQty = useMemo(() => {
    if (selectedRowData.length === 0) return 0;
    return selectedRowData.reduce((sum, item) => sum + (parseFloat(item.TotalIssueQty) || 0), 0);
  }, [selectedRowData]);

  // Calculate remaining qty
  const remainingQty = useMemo(() => {
    const weight = parseFloat(totalWeight) || 0;
    return Math.max(0, totalIssueQty - weight);
  }, [totalWeight, totalIssueQty]);

  // Calculate total waste qty
  const totalWasteQty = useMemo(
    () => wasteDetails.reduce((sum, waste) => sum + (parseFloat(waste.WasteQty) || 0), 0),
    [wasteDetails]
  );

  // 💥 END OF FIX

  // AG Grid Column Definitions for Waste Details (Sub-detail)
  const wasteDetailColumnDefs = useMemo(
    () => [
      {
        field: 'WasteType',
        headerName: 'Waste Type',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueGetter: (params) => params.data?.WasteSubCategory?.SubCat_Name || '-',
      },
      {
        field: 'WasteItem',
        headerName: 'Item',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueGetter: (params) =>
          params.data?.WasteItem?.CodeAndDescription ||
          params.data?.WasteItem?.ItemDescription ||
          '-',
      },
      {
        field: 'WasteQty',
        headerName: 'Quantity',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) =>
          params.value
            ? `${fNumber(params.value)} ${values?.SortedItemOpen?.UOM?.UOMName || values?.SortedItemOpen?.UOMName || ''
            }`
            : '-',
        cellStyle: { textAlign: 'right' },
      },
      // {
      //   field: 'WastePercent',
      //   headerName: 'Percent',
      //   minWidth: 100,
      //   type: 'numericColumn',
      //   filter: 'agNumberColumnFilter',
      //   valueFormatter: (params) => (params.value ? `${fNumber(params.value)}%` : '-'),
      //   cellStyle: { textAlign: 'right' },
      // },
    ],
    [values]
  );

  // Detail Cell Renderer for Waste Details
  const WasteDetailCellRenderer = useCallback(
    ({ data }) => {
      const wasteDetailss = data?.WasteDetails || [];
      if (wasteDetailss.length === 0) {
        return (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            No waste details available
          </Box>
        );
      }

      return (
        <Box sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
          <AgGridReact
            className="ag-theme-material"
            theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
            rowData={wasteDetails}
            columnDefs={wasteDetailColumnDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
            domLayout="autoHeight"
            headerHeight={35}
            rowHeight={35}
          />
        </Box>
      );
    },
    [wasteDetailColumnDefs, settings.themeMode, wasteDetails]
  );

  // setAlltransferNumbers
  useEffect(() => {
    const fetchAlltransferNumbers = async () => {
      try {
        // const response = await Get(`GetAllTransferNumbers?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`);
        // GetStockTransfersByDeptSection?Org_Id=1&Branch_Id=6&DeptId=9&SecId=29
        const response = await Get(
          `GetStockTransfersByDeptSection?Org_Id=${userData?.userDetails?.orgId}&Branch_Id=${userData?.userDetails?.branchID}&DeptId=${userData?.userDetails?.DepId}&SecId=${userData?.userDetails?.SectionID}`
        );
        console.log('Transfer Numbers API Response:', response);

        // Try different response paths
        const transfers = response.data?.data || response.data || [];
        console.log('Extracted Transfers:', transfers);

        const transfersWithDate = transfers.map((item) => ({
          ...item,
          TransferNoWithDate: `${item.TransferNo} | ${fDate(item.TransferDate)}`,
        }));
        console.log('Transfers with Date:', transfersWithDate);
        setAlltransferNumbers(transfersWithDate);
      } catch (error) {
        console.error('Error fetching transfer numbers:', error);
        setAlltransferNumbers([]);
      }
    };
    fetchAlltransferNumbers();
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    userData?.userDetails?.DepId,
    userData?.userDetails?.SectionID,
  ]);

  // --- Effects using 'values' or its dependents ---

  // Calculate Dust Percentage and Droppings Percentage from Total Bale
  const tBale = watch('TBale');
  const dustWt = watch('DustWeight');
  const droppingsValue = watch('droppings');

  useEffect(() => {
    if (tBale && dustWt && parseFloat(tBale) > 0) {
      const percentage = (dustWt * 100) / tBale;
      setValue('DustPercentage', percentage.toFixed(2));
    } else {
      setValue('DustPercentage', '');
    }

    if (tBale && droppingsValue && parseFloat(tBale) > 0) {
      const percentage = (droppingsValue * 100) / tBale;
      setValue('DroppingsPercentage', percentage.toFixed(2));
    } else {
      setValue('DroppingsPercentage', '');
    }
  }, [tBale, dustWt, droppingsValue, setValue]);

  // Watch ReqCode from form values
  const selectedReqCodes = useWatch({ control, name: 'ReqCode' });
  const prevReqCodesRef = useRef([]);

  // Watch TransferNumber from form values
  const selectedTransferNumbers = useWatch({ control, name: 'TransferNumber' });
  const prevTransferNumbersRef = useRef([]);

  // Handle removal of selected items when ReqCode is deselected
  useEffect(() => {
    const reqCodes = selectedReqCodes || [];
    const currentReqCodes = reqCodes.map((req) => req?.ReqCode || req);
    const prevReqCodes = prevReqCodesRef.current.map((req) => req?.ReqCode || req);

    // Skip on initial render (when prevReqCodes is empty)
    if (prevReqCodes.length === 0) {
      prevReqCodesRef.current = reqCodes;
      return;
    }

    // Find removed ReqCodes
    const removedReqCodes = prevReqCodes.filter((code) => !currentReqCodes.includes(code));

    // Remove items from deselected ReqCodes only
    if (removedReqCodes.length > 0) {
      setSelectedRowData((prev) => {
        const filtered = prev.filter((item) => {
          // Filter by ReqCode for ReqCode items, keep Transfer items
          if (item.SourceType === 'Transfer') {
            return true; // Keep transfer items
          }
          return !removedReqCodes.includes(item.ReqCode);
        });

        // Update selectedValues to match filtered items
        const keysToKeep = new Set();
        filtered.forEach((item) => {
          const key = item.uniqueKey || item.IssueDtlID;
          keysToKeep.add(key);
        });

        setSelectedValues((prevSet) => {
          const newSet = new Set();
          prevSet.forEach((key) => {
            if (keysToKeep.has(key)) {
              newSet.add(key);
            }
          });
          return newSet;
        });

        return filtered;
      });
    }

    // Update previous ReqCodes ref
    prevReqCodesRef.current = reqCodes;
  }, [selectedReqCodes]);

  // Handle removal of selected items when TransferNumber is deselected
  useEffect(() => {
    const transferNumbers = selectedTransferNumbers || [];
    const currentTransferNos = transferNumbers.map((trans) => trans?.TransferNo || trans);
    const prevTransferNos = prevTransferNumbersRef.current.map(
      (trans) => trans?.TransferNo || trans
    );

    // Skip on initial render (when prevTransferNos is empty)
    if (prevTransferNos.length === 0) {
      prevTransferNumbersRef.current = transferNumbers;
      return;
    }

    // Find removed TransferNumbers
    const removedTransferNos = prevTransferNos.filter((no) => !currentTransferNos.includes(no));

    // Remove items from deselected TransferNumbers only
    if (removedTransferNos.length > 0) {
      setSelectedRowData((prev) => {
        const filtered = prev.filter((item) => {
          // Filter by TransferNo for Transfer items, keep ReqCode items
          if (item.SourceType === 'ReqCode') {
            return true; // Keep ReqCode items
          }
          return !removedTransferNos.includes(item.TransferNo);
        });

        // Update selectedValues to match filtered items
        const keysToKeep = new Set();
        filtered.forEach((item) => {
          const key = item.uniqueKey || item.IssueDtlID;
          keysToKeep.add(key);
        });

        setSelectedValues((prevSet) => {
          const newSet = new Set();
          prevSet.forEach((key) => {
            if (keysToKeep.has(key)) {
              newSet.add(key);
            }
          });
          return newSet;
        });

        return filtered;
      });
    }

    // Update previous TransferNumbers ref
    prevTransferNumbersRef.current = transferNumbers;
  }, [selectedTransferNumbers]);

  // Fetch GRN data for all selected ReqCodes and TransferNumbers
  useEffect(() => {
    const fetchAllData = async () => {
      const reqCodes = selectedReqCodes || [];
      const transferNumbers = selectedTransferNumbers || [];

      // If both are empty, clear data
      if (
        (!reqCodes || reqCodes.length === 0) &&
        (!transferNumbers || transferNumbers.length === 0)
      ) {
        setGrnData(null);
        setSelectedValues(new Set());
        setSelectedRowData([]);
        return;
      }

      try {
        setIsGrnLoading(true);

        const allDetails = [];

        // Fetch ReqCode data if selected
        if (reqCodes && reqCodes.length > 0) {
          const reqCodeArray = reqCodes.map((req) => req.ReqCode || req);

          const reqPromises = reqCodeArray.map((reqCode) =>
            Get(
              `GetConfReceiveByReqCode?reqCode=${reqCode}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
            )
          );

          const reqResponses = await Promise.all(reqPromises);

          reqResponses.forEach((res, index) => {
            const reqCode = reqCodeArray[index];
            const challanObj = allChallanNo.find((ch) => ch.ReqCode === reqCode);

            if (res.data?.Details && Array.isArray(res.data.Details)) {
              res.data.Details.forEach((detail) => {
                allDetails.push({
                  ...detail,
                  ReqCode: reqCode,
                  ReqID: challanObj?.ReqID || detail.ReqID || 0,
                  SourceType: 'ReqCode', // Track source
                });
              });
            }
          });
        }

        // Fetch TransferNumber data if selected
        if (transferNumbers && transferNumbers.length > 0) {
          const transferPromises = transferNumbers.map((transfer) =>
            Get(`GetTransferItemsByID?TransferID=${transfer.TransferID}`)
          );

          const transferResponses = await Promise.all(transferPromises);

          transferResponses.forEach((res, index) => {
            const transfer = transferNumbers[index];
            const transferNo = transfer.TransferNo;

            // API response can be array or object with data property
            const transferItems = Array.isArray(res.data)
              ? res.data
              : res.data?.data || res.data || [];

            transferItems.forEach((item) => {
              // Map transfer item to match table structure
              allDetails.push({
                TransferID: item.TransferID || transfer.TransferID,
                TransferNo: transferNo,
                ItemID: item.ItemID || 0,
                ItemName: item.ItemDescription || item.ItemName || '-',
                ItemCode: item.ItemCode || '-',
                CategoryName: item.CategoryName || '-',
                SubCatName: item.SubCatName || '-',
                InvTypeName: item.InvTypeName || '-',
                StoreName: item.StoreName || '-',
                LocationName: item.LocationName || '-',
                TotalRequestedQty: parseFloat(item.ProducedQty) || 0,
                TotalIssueQty: parseFloat(item.ProducedQty) || 0,
                RemainingQty: parseFloat(item.ProducedQty) || 0,
                UOMName: item.UOMName || item.UOM || '-',
                UOMID: item.UOMID || item.UOM_ID || 0,
                IssueDtlID: item.ItemID || item.VID || 0, // Use ItemID or VID as unique identifier
                ReqID: 0, // Transfer items don't have ReqID
                SourceType: 'Transfer', // Track source
              });
            });
          });
        }

        // Set combined data
        setGrnData({
          Details: allDetails,
        });

        console.log('Combined Data (ReqCode + Transfer):', { Details: allDetails });
      } catch (err) {
        console.error('Error fetching data:', err);
        setGrnData(null);
      } finally {
        setIsGrnLoading(false);
      }
    };

    fetchAllData();
  }, [selectedReqCodes, selectedTransferNumbers, userData, allChallanNo]);

  useEffect(() => {
    const fetchAllUOM = async () => {
      try {
        const response = await Get(
          `GetAllActiveUOM?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setallItemUnit(response.data.Data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllUOM();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchAllLineNumbers = async () => {
      const sectionId = userData?.userDetails?.SectionID;

      if (sectionId) {
        try {
          const response = await Get(
            `GetAllLineNo?org=${userData?.userDetails?.orgId}&branch=${userData?.userDetails?.branchID}&sectionId=${sectionId}`
          );
          console.log('Line Numbers API Response:', response);

          const lineData = response.data.data || [];
          setAllLineNumbers(lineData);
        } catch (error) {
          console.error('Error fetching line numbers:', error);
        }
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetchAllLineNumbers();
    }
  }, [userData]);

  useEffect(() => {
    const fetchChallanNumbers = async () => {
      try {
        const res = await Get(
          `GetConfirmReqNumDptID?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}&deptId=9&sectionID=24`
        );
        console.log('Requested No Response:', res.data);

        const challans = res.data || [];
        const ReqNumWithDate = challans.map((item) => ({
          ...item,

          ReqCodeWithDate: `${item.ReqCode} | ${fDate(item.CreatedDate)}`,
        }));
        console.log('Challan with date:', ReqNumWithDate);

        // Make it An Optional

        setallChallanNo(ReqNumWithDate);
      } catch (err) {
        console.error('Error fetching challans:', err);
      }
    };

    fetchChallanNumbers();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchHrUsers = async () => {
      try {
        const response = await Get(
          `GetHrUsers?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );

        const users = response.data.Data || [];
        setHrUsers(users);
      } catch (error) {
        console.error('Error fetching HR users:', error);
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetchHrUsers();
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchAllShiftNames = async () => {
      try {
        const response = await Get(
          `GetAllShifts?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );

        console.log('ShitName API Response:', response);

        const shiftData = response.data.data || [];
        setallShiftName(shiftData);
      } catch (error) {
        console.error('Error fetching shift:', error);
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetchAllShiftNames();
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await Get(
          `ViewVendors?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
        );

        console.log('Suppliers API Response:', response);
        const suppliersData = response.data || [];
        setallSupplierData(suppliersData);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetchSuppliers();
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchSupervisorData = async () => {
      try {
        const response = await Get(
          `GetHrUsers?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );

        console.log('Suppliers API Response:', response);
        const superVisorData = response.data.Data || [];
        setallSuperVisiorName(superVisorData);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetchSupervisorData();
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // ============================================
  // ITEM SELECTION FLOW - Fetch Inventory Types (Classes)
  // ============================================
  useEffect(() => {
    const AllClassNameData = async () => {
      try {
        const response = await Get(
          `GetClassesByuserid?UserID=${userData?.userDetails?.userId}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setAllSortedClassName(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    if (
      userData?.userDetails?.userId &&
      userData?.userDetails?.orgId &&
      userData?.userDetails?.branchID
    ) {
      AllClassNameData();
    }
  }, [
    userData?.userDetails?.userId,
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
  ]);

  const selectedSortedClassId = watch('SortedClassID');

  // Fetch categories for sorted item selection
  const FetchAllSortedCategoryData = useCallback(async () => {
    if (selectedSortedClassId?.ClassID) {
      try {
        const response = await Get(
          `GetCategoriesByUserIDFrmMiddleware?userID=${userData?.userDetails?.userId}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        const updatedData = response.data
          .filter((item) => item.ClassID === selectedSortedClassId?.ClassID)
          .map((item) => ({
            ...item,
            Inv_Cat_Name: item?.CategoryName,
            Inv_Cat_ID: item?.CategoryID,
          }));
        setAllSortedCategoryData(updatedData || []);
      } catch (error) {
        console.error(error);
        setAllSortedCategoryData([]);
      }
    } else {
      setAllSortedCategoryData([]);
    }
  }, [userData?.userDetails, selectedSortedClassId?.ClassID]);

  useEffect(() => {
    FetchAllSortedCategoryData();
    setValue('SortedCategory', null);
    setValue('SortedSubCategory', null);
    setValue('SortedColor', null);
    setValue('SortedInvSpare', null);
    setValue('SortedItemOpen', null);
  }, [selectedSortedClassId, FetchAllSortedCategoryData, setValue]);

  const selectedSortedCategory = watch('SortedCategory');

  // Fetch subcategories for sorted item selection
  const fetchSortedSubCategory = useCallback(async () => {
    if (selectedSortedCategory?.Inv_Cat_ID) {
      try {
        const response = await Get(
          `GetSubCategoriesByCategoryID/${selectedSortedCategory.Inv_Cat_ID}`
        );
        setAllSortedSubCategory(response.data.data);
      } catch (error) {
        console.error(error);
        setAllSortedSubCategory([]);
      }
    } else {
      setAllSortedSubCategory([]);
    }
  }, [selectedSortedCategory?.Inv_Cat_ID]);

  useEffect(() => {
    fetchSortedSubCategory();
    setValue('SortedSubCategory', null);
    setValue('SortedColor', null);
    setValue('SortedInvSpare', null);
    setValue('SortedItemOpen', null);
  }, [selectedSortedCategory, fetchSortedSubCategory, setValue]);

  const selectedSortedSubCategory = watch('SortedSubCategory');
  const selectedSortedColor = watch('SortedColor');
  const selectedSortedSpare = watch('SortedInvSpare');

  // Fetch colors for sorted item selection
  const GetSortedColors = useCallback(async () => {
    try {
      const response = await Get(
        `GetColorsBySubCat?subCatId=${selectedSortedSubCategory?.SubCat_ID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setAllSortedColors(response.data.data);
    } catch (error) {
      console.log(error);
      setAllSortedColors([]);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    selectedSortedSubCategory?.SubCat_ID,
  ]);

  // Fetch spares for sorted item selection
  const FetchAllSortedSpareByClassID = useCallback(async () => {
    if (selectedSortedSubCategory?.SubCat_ID) {
      try {
        const response = await Get(
          `GetSpareBySubcateID?SubcatID=${selectedSortedSubCategory?.SubCat_ID}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
        );
        setAllSortedInvSpare(response.data || []);
      } catch (error) {
        console.error(error);
        setAllSortedInvSpare([]);
      }
    } else {
      setAllSortedInvSpare([]);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    selectedSortedSubCategory?.SubCat_ID,
  ]);

  useEffect(() => {
    if (selectedSortedSubCategory?.SubCat_ID && selectedSortedClassId?.isColorSensitive === true) {
      GetSortedColors();
    } else {
      setAllSortedColors([]);
    }
    setValue('SortedItemOpen', null);
  }, [
    selectedSortedSubCategory,
    selectedSortedClassId?.isColorSensitive,
    GetSortedColors,
    setValue,
  ]);

  useEffect(() => {
    if (selectedSortedSubCategory?.SubCat_ID && selectedSortedClassId?.isColorSensitive === false) {
      FetchAllSortedSpareByClassID();
    } else {
      setAllSortedInvSpare([]);
    }
    setValue('SortedItemOpen', null);
  }, [
    selectedSortedSubCategory,
    selectedSortedClassId?.isColorSensitive,
    FetchAllSortedSpareByClassID,
    setValue,
  ]);

  useEffect(() => {
    setValue('SortedItemOpen', null);
  }, [selectedSortedColor, setValue]);

  useEffect(() => {
    setValue('SortedItemOpen', null);
  }, [selectedSortedSpare, setValue]);

  // Fetch items for sorted item selection
  const fetchSortedItemsBySubCategory = useCallback(async () => {
    if (selectedSortedSpare?.SpareID && selectedSortedClassId?.isColorSensitive === false) {
      try {
        const response = await Get(
          `GetItemsBySpareID?spareId=${selectedSortedSpare?.SpareID}&subCatID=${selectedSortedSubCategory?.SubCat_ID}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
        );

        const updatedData = response?.data?.map((item) => ({
          ...item,
          ClassID: item?.invTypesID,
          CodeAndDescription: `[${item?.ItemCode}]  ${item?.ItemDescription}`,
          UOM: { UOMName: item?.UOMName || item?.UOMNAME, UOM_ID: item?.UOMID },
        }));
        setSortedItemOpen(updatedData);
      } catch (error) {
        console.error(error);
        setSortedItemOpen([]);
        setAllSortedColors([]);
      }
    } else if (
      selectedSortedSubCategory?.SubCat_ID &&
      selectedSortedClassId?.isColorSensitive === true
    ) {
      try {
        const response = await Get(
          `GetAllItemsFromDBByColorAndSubCat?subCatID=${selectedSortedSubCategory?.SubCat_ID
          }&colorId=${selectedSortedColor?.ColorID || 0}&OrgID=${userData?.userDetails?.orgId
          }&BranchID=${userData?.userDetails?.branchID}`
        );
        const updatedData = response?.data?.map((item) => ({
          ...item,
          CodeAndDescription: `[${item?.ItemCode}]  ${item?.ItemDescription}`,
          UOM: {
            UOM_ID: item?.UOMID,
            UOMName: item?.UOMNAME,
          },
        }));
        setSortedItemOpen(updatedData);
      } catch (error) {
        console.error(error);
        setSortedItemOpen([]);
      }
      setValue('SortedItemOpen', null);
    } else {
      setSortedItemOpen([]);
    }
  }, [
    selectedSortedSubCategory,
    selectedSortedColor,
    userData?.userDetails,
    selectedSortedSpare,
    selectedSortedClassId?.isColorSensitive,
    setValue,
  ]);

  useEffect(() => {
    fetchSortedItemsBySubCategory();
  }, [fetchSortedItemsBySubCategory]);

  // ============================================
  // WASTE DETAILS FLOW - Fetch Waste Categories (ClassID: 5)
  // ============================================

  // Fetch waste subcategories
  const fetchWasteSubCategory = useCallback(async () => {
    try {
      const response = await Get(`GetSubCategoriesByCategoryID/11`);
      setAllWasteSubCategory(response.data.data || []);
    } catch (error) {
      console.error(error);
      setAllWasteSubCategory([]);
    }
  }, []);

  useEffect(() => {
    fetchWasteSubCategory();
    setValue('WasteItem', null);
  }, [fetchWasteSubCategory, setValue]);

  const selectedWasteSubCategory = watch('WasteSubCategory');

  // Fetch waste items
  const fetchWasteItems = useCallback(async () => {
    if (selectedWasteSubCategory?.SubCat_ID) {
      try {
        const response = await Get(`itemsgetBySubCatId/${selectedWasteSubCategory.SubCat_ID}`);
        const updatedData = response?.data?.Data?.map((item) => ({
          ...item,
          CodeAndDescription: `[${item?.ItemCode}]  ${item?.ItemDescription}`,
        }));
        setAllWasteItems(updatedData || []);
      } catch (error) {
        console.error(error);
        setAllWasteItems([]);
      }
    } else {
      setAllWasteItems([]);
    }
  }, [selectedWasteSubCategory?.SubCat_ID]);

  useEffect(() => {
    fetchWasteItems();
    setValue('WasteItem', null);
  }, [selectedWasteSubCategory, fetchWasteItems, setValue]);

  // --- Handlers ---

  // Waste Details Handlers
  const handleAddWasteDetail = () => {
    if (!values?.WasteSubCategory) {
      enqueueSnackbar('Waste Type is required', { variant: 'error' });
      return;
    }
    if (!values?.WasteItem) {
      enqueueSnackbar('Waste Item is required', { variant: 'error' });
      return;
    }
    if (
      !values?.WasteQty ||
      values?.WasteQty === '' ||
      values?.WasteQty === null ||
      values?.WasteQty <= 0
    ) {
      enqueueSnackbar('Waste Quantity is required', { variant: 'error' });
      return;
    }

    const wasteQty = parseFloat(values.WasteQty) || 0;

    // Check if total waste (existing + new) exceeds remaining qty
    const newTotalWaste = totalWasteQty + wasteQty;
    if (newTotalWaste > remainingQty) {
      enqueueSnackbar(
        `Total Waste cannot exceed Remaining Qty (${fNumber(remainingQty)} ${selectedRowData[0]?.UOMName || ''
        })`,
        { variant: 'error' }
      );
      return;
    }

    const totalBale = parseFloat(values.TBale) || 0;
    const wastePercent = totalBale > 0 ? ((wasteQty * 100) / totalBale).toFixed(2) : '0.00';

    const newWasteDetail = {
      WasteCategoryID: 12,
      WasteSubCatID: values.WasteSubCategory?.SubCat_ID || 0,
      WasteItemID: values.WasteItem?.ItemID || 0,
      WasteQty: wasteQty,
      WastePercent: parseFloat(wastePercent),
      WasteSubCategory: values.WasteSubCategory,
      WasteItem: values.WasteItem,
    };

    setWasteDetails((prev) => [...prev, newWasteDetail]);

    // Reset waste form fields
    // setValue('WasteCategory', null);
    setValue('WasteSubCategory', null);
    setValue('WasteItem', null);
    setValue('WasteQty', '');
    setValue('WastePercent', '');
  };

  const handleRemoveWasteDetail = (index) => {
    setWasteDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = handleSubmit(async () => {
    if (!values.ReqCode || values.ReqCode.length === 0) {
      enqueueSnackbar('Please select at least one Requisition Number', { variant: 'error' });
      return;
    }

    if (selectedRowData.length === 0) {
      enqueueSnackbar('Please select at least one item from Requisition No table', {
        variant: 'error',
      });
      return;
    }

    // Validate Total Weight
    if (
      !values.TotalWeight ||
      values.TotalWeight === '' ||
      values.TotalWeight === null ||
      values.TotalWeight === undefined
    ) {
      enqueueSnackbar('Total Weight is required', { variant: 'error' });
      return;
    }

    const weight = parseFloat(values.TotalWeight) || 0;
    if (weight > totalIssueQty) {
      enqueueSnackbar(
        `Total Weight cannot exceed Total Issue Qty (${fNumber(totalIssueQty)} ${selectedRowData[0]?.UOMName || ''
        })`,
        { variant: 'error' }
      );
      return;
    }

    // Validate total waste doesn't exceed remaining qty
    if (totalWasteQty > remainingQty) {
      enqueueSnackbar(
        `Total Waste (${fNumber(totalWasteQty)} ${selectedRowData[0]?.UOMName || ''
        }) cannot exceed Remaining Qty (${fNumber(remainingQty)} ${selectedRowData[0]?.UOMName || ''
        })`,
        { variant: 'error' }
      );
      return;
    }

    // Map wasteDetails to API format
    const allWasteDetails = wasteDetails.map((waste) => ({
      WasteCategoryID: waste.WasteCategoryID || 12,
      WasteSubCatID: waste.WasteSubCatID || 0,
      WasteItemID: waste.WasteItemID || 0,
      WasteQty: parseFloat(waste.WasteQty) || 0,
      WastePercent: parseFloat(waste.WastePercent) || 0,
      CreatedBy: userData?.userDetails?.userId || 0,
    }));

    const dataToSend = {
      // master ka data
      Org_ID: userData.userDetails.orgId,
      Branch_ID: userData.userDetails.branchID,
      Deptid: userData?.userDetails?.DepId || 0,
      RptDate: values.PRDate ? formatDate(new Date(values.PRDate)) : formatDate(new Date()),
      ShiftID: values.ShiftName?.ShiftId || 0,
      Line_No: values.Line?.LineNo,
      Bale: values.TBale || 0,
      Production: lineTotals.overall?.weight || 0,
      Total_Weight: values.TotalWeight || 0,
      Total_MC_Running: values.MCRunning || 0,
      Total_Production_HR: values.ProductionHR || 0,

      Total_Bale: values.TBale || 0,
      Total_Time: values.TimePicker
        ? dayjs(values.TimePicker).format('HH:mm:ss')
        : dayjs().format('HH:mm:ss'),
      Remarks: values.Remarks || '-',
      OutItemID: values.SortedItemOpen?.ItemID || 0,
      //  input ka data
      Details: selectedRowData.map((item) => ({
        ChallanNo: item.ReqCode || '',
        TotalWeight: 0,
        UOMID: item.UOMID || 0,
        ReqID: item.ReqID || 0,
        InItemID: item.ItemID || item.IssueDtlID || 0,
        CreatedBy: userData?.userDetails?.userId || 0,

        TransID: item.TransferID || 0,
      })),

      // waste ki detail
      WasteDetails: allWasteDetails,
    };

    console.log('Final data being sent:', dataToSend);

    try {
      await Post(`AddBlowRoomReport`, dataToSend).then(async (res) => {
        if (res.status !== 200) {
          enqueueSnackbar(res.data.message, { variant: 'error' });
        } else {
          enqueueSnackbar('Rag Tearing Report Created Successfully!');
          router.push(paths.dashboard.Onboarding.Supplier.root);
          reset();
          setRequestDetails([]);
          setSelectedValues(new Set());
          setSelectedRowData([]);
          setGrnData(null);
          setWasteDetails([]);
        }
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error creating rag tearing report', { variant: 'error' });
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
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 2 }}>
            <h3>Produced Item Info</h3>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(4, 1fr)',
              }}
            >
              <Controller
                name="PRDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Report Date"
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
                name="Line"
                label="Select Line No"
                placeholder="Choose a line number"
                fullWidth
                options={allLineNumbers}
                getOptionLabel={(option) => String(option?.LineNo || '')} // ✅ Convert to string
                isOptionEqualToValue={(option, value) => option?.LineID === value?.LineID}
                renderOption={(props, option) => (
                  <li {...props} key={option.LineID}>
                    {option.LineNo}
                  </li>
                )}
                value={values?.Line || null}
              />
              <RHFAutocomplete
                name="ShiftName"
                label="Select Shift"
                placeholder="Choose a shift"
                fullWidth
                options={allShiftName}
                getOptionLabel={(option) => option?.ShiftName || ''}
                isOptionEqualToValue={(option, value) => option?.ShiftId === value?.ShiftId}
                value={values?.ShiftName || null}
              />
              <Controller
                name="TimePicker"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <MobileTimePicker
                    label="Choose Time"
                    value={field.value || null}
                    onChange={(newValue) => field.onChange(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error, // Error show karega
                        helperText: error?.message, // Error message show karega
                      },
                    }}
                  />
                )}
              />
            </Box>
          </Card>
          <Card sx={{ p: 2, mt: 1 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFAutocomplete
                name="ReqCode"
                label="Requisition No"
                placeholder="Choose Requisition Numbers"
                multiple
                limitTags={2}
                options={allChallanNo}
                getOptionLabel={(option) => option?.ReqCodeWithDate || ''}
                isOptionEqualToValue={(option, value) => option?.ReqCode === value?.ReqCode}
                renderOption={(props, option) => {
                  const isChecked = values.ReqCode?.some(
                    (selected) => selected?.ReqCode === option?.ReqCode
                  );
                  return (
                    <li {...props} key={option.ReqCode}>
                      <Checkbox size="small" disableRipple checked={isChecked} />
                      {option.ReqCodeWithDate}
                    </li>
                  );
                }}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.ReqCode}
                      label={option.ReqCodeWithDate}
                      size="small"
                      variant="soft"
                      color="primary"
                    />
                  ))
                }
                value={values?.ReqCode || []}
              />
              <RHFAutocomplete
                name="TransferNumber"
                label="Transfer Number"
                placeholder="Choose Transfer Numbers"
                multiple
                limitTags={2}
                fullWidth
                options={alltransferNumbers || []}
                getOptionLabel={(option) => option?.TransferNoWithDate || option?.TransferNo || ''}
                isOptionEqualToValue={(option, value) => option?.TransferNo === value?.TransferNo}
                renderOption={(props, option) => {
                  const isChecked = values.TransferNumber?.some(
                    (selected) => selected?.TransferNo === option?.TransferNo
                  );
                  return (
                    <li {...props} key={option.TransferNo}>
                      <Checkbox size="small" disableRipple checked={isChecked} />
                      {option.TransferNoWithDate}
                    </li>
                  );
                }}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.TransferNo}
                      label={option.TransferNoWithDate}
                      size="small"
                      variant="soft"
                      color="primary"
                    />
                  ))
                }
                value={values?.TransferNumber || []}
                noOptionsText="No transfer numbers available"
              />
            </Box>

            {isGrnLoading ? (
              <Stack spacing={1}>
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
              </Stack>
            ) : (
              grnData?.Details?.length > 0 && (
                // <h3>Requested Item Details</h3>
                <TableContainer>
                  <Scrollbar sx={{ maxHeight: '400px' }}>
                    <Table
                      size={table.dense ? 'small' : 'medium'}
                      sx={{
                        minWidth: 460,
                        mt: 2,
                        border: 1,
                        borderColor: '#f4f6f8',
                        borderStyle: 'dotted',
                      }}
                    >
                      <TableHeadCustom
                        order={table.order}
                        orderBy={table.orderBy}
                        headLabel={ChallanDetailsTableHead}
                      />

                      <TableBody>
                        {grnData.Details.map((row, index) => {
                          // Create unique key - use ReqCode for ReqCode items, TransferNo for Transfer items
                          const identifier =
                            row.SourceType === 'Transfer' ? row.TransferNo : row.ReqCode;
                          const uniqueKey = `${identifier}_${row.IssueDtlID}_${index}`;
                          const isSelected = selectedValues.has(uniqueKey);
                          return (
                            <tr key={uniqueKey}>
                              <td style={{ textAlign: 'left' }}>
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => handleCheckboxChange({ ...row, uniqueKey })}
                                />
                              </td>

                              <td style={{ textAlign: 'center', fontWeight: 'medium' }}>
                                {row.SourceType === 'Transfer'
                                  ? row.TransferNo || '-'
                                  : row.ReqCode || '-'}
                              </td>

                              <td
                                style={{
                                  textAlign: 'left',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {row.ItemName}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {fNumber(row.TotalIssueQty)} {row.UOMName}
                              </td>
                              <td style={{ textAlign: 'right' }}>{`${fNumber(
                                row.TotalRequestedQty
                              )} ${row.UOMName}`}</td>

                              {/* </Tooltip> */}
                              {/* <td style={{ textAlign: 'center' }}>{row.CategoryName}</td> */}
                              {/* <td style={{ textAlign: 'center' }}>{row.SubCatName}</td> */}
                              {/* <td style={{ textAlign: 'center' }}>{row.InvTypeName}</td> */}
                              <td style={{ textAlign: 'center' }}>{row.StoreName}</td>
                              <td style={{ textAlign: 'center' }}>{row.LocationName}</td>

                              {/* <td style={{ textAlign: 'right' }}>{`${fNumber(row.RemainingQty)} ${row.UOMName
                                }`}</td> */}
                            </tr>
                          );
                        })}

                        <TableEmptyRows
                          height={denseHeight}
                          emptyRows={emptyRows(
                            table.page,
                            table.rowsPerPage,
                            grnData.Details.length
                          )}
                        />

                        <TableNoData notFound={grnData.Details.length === 0} />
                      </TableBody>
                    </Table>
                  </Scrollbar>
                  {/* Total Row for Selected Issue Qty - At the end */}
                  {selectedRowData.length > 0 && (
                    <tr style={{ backgroundColor: '#ffffff' }}>
                      <td colSpan={11} style={{ textAlign: 'left', padding: '8px' }}>
                        Total Selected Qty:{' '}
                        {(() => {
                          const totalSelectedQty = selectedRowData.reduce(
                            (sum, item) => sum + (parseFloat(item.TotalIssueQty) || 0),
                            0
                          );
                          const uomName = selectedRowData[0]?.UOMName || '';
                          return `${fNumber(totalSelectedQty)} ${uomName}`;
                        })()}
                      </td>
                    </tr>
                  )}
                </TableContainer>
              )
            )}
          </Card>

          <Card sx={{ p: 2, mt: 2 }}>
            <h3>Production Details</h3>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(4, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              <RHFAutocomplete
                name="SortedClassID"
                label="Inventory Type"
                placeholder="Choose an option"
                fullWidth
                options={allSortedClassName}
                getOptionLabel={(option) => option?.ClassName || ''}
                isOptionEqualToValue={(option, value) => option?.ClassID === value?.ClassID}
                value={values?.SortedClassID || null}
              />

              <RHFAutocomplete
                name="SortedCategory"
                label="Select Item Category"
                placeholder="Choose an option"
                fullWidth
                options={allSortedCategoryData}
                getOptionLabel={(option) => option?.Inv_Cat_Name || ''}
                isOptionEqualToValue={(option, value) => option.Inv_Cat_ID === value.Inv_Cat_ID}
                value={values?.SortedCategory || null}
              />

              <RHFAutocomplete
                name="SortedSubCategory"
                label="Select Item Sub Category"
                placeholder="Choose an option"
                fullWidth
                options={allSortedSubCategory}
                getOptionLabel={(option) => option?.SubCat_Name || ''}
                isOptionEqualToValue={(option, value) => option?.SubCat_ID === value?.SubCat_ID}
                value={values?.SortedSubCategory || null}
              />

              {selectedSortedClassId?.isColorSensitive ? (
                <RHFAutocomplete
                  name="SortedColor"
                  label="Color Name & Code"
                  placeholder="Choose an option"
                  fullWidth
                  options={allSortedColors}
                  getOptionLabel={(option) => option?.Color_and_Code || ''}
                  isOptionEqualToValue={(option, value) => option.ColorID === value?.ColorID}
                  value={values?.SortedColor || null}
                />
              ) : (
                <RHFAutocomplete
                  name="SortedInvSpare"
                  label="Spare Name & Code"
                  placeholder="Choose an option"
                  fullWidth
                  options={allSortedInvSpare}
                  getOptionLabel={(option) => option?.SpareNameAndNo || ''}
                  isOptionEqualToValue={(option, value) => option?.SpareID === value?.SpareID}
                  value={values?.SortedInvSpare || null}
                />
              )}

              <RHFAutocomplete
                name="SortedItemOpen"
                label="Item Name"
                placeholder="Choose an option"
                fullWidth
                options={SortedItemOpen}
                getOptionLabel={(option) =>
                  option?.CodeAndDescription || option?.ItemDescription || ''
                }
                isOptionEqualToValue={(option, value) => option.ItemID === value.ItemID}
                value={values?.SortedItemOpen || null}
              />

              <RHFTextField
                name="TBale"
                type="number"
                label="Total Bale"
                placeholder="Total Bale"
                InputProps={{
                  endAdornment: <InputAdornment position="end">PCS</InputAdornment>,
                }}
              />

              <Controller
                name="TotalWeight"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Total Weight"
                    type="number"
                    placeholder="Total Weight"
                    disabled={selectedRowData.length === 0}
                    fullWidth
                    error={!!error}
                    inputProps={{
                      max: totalIssueQty > 0 ? totalIssueQty : undefined,
                      min: 0,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {values?.SortedItemOpen?.UOM?.UOMName ||
                            values?.SortedItemOpen?.UOMName ||
                            'Unit'}
                        </InputAdornment>
                      ),
                    }}
                    helperText={
                      error?.message ||
                      (selectedRowData.length === 0
                        ? 'Please select at least one row'
                        : totalIssueQty > 0
                          ? `Max: ${fNumber(totalIssueQty)} ${selectedRowData[0]?.UOMName || ''}`
                          : '')
                    }
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (totalIssueQty > 0 && !Number.isNaN(value) && value > totalIssueQty) {
                        field.onChange(totalIssueQty);
                        enqueueSnackbar(
                          `Total Weight cannot exceed ${fNumber(totalIssueQty)} ${selectedRowData[0]?.UOMName || ''
                          }`,
                          { variant: 'warning' }
                        );
                      } else {
                        field.onChange(e);
                      }
                    }}
                  />
                )}
              />
              <Controller
                name="RemainingQty"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Remaining Qty"
                    type="number"
                    placeholder="Remaining Qty"
                    value={remainingQty}
                    disabled
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {selectedRowData.length > 0
                            ? selectedRowData[0]?.UOMName || 'Unit'
                            : values?.SortedItemOpen?.UOM?.UOMName ||
                            values?.SortedItemOpen?.UOMName ||
                            'Unit'}
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <RHFTextField
                name="MCRunning"
                label="M/C Running"
                placeholder="MC Running"
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">Minute</InputAdornment>,
                }}
              />

              <RHFTextField
                name="ProductionHR"
                label="Production/HR"
                placeholder="Production per Hour"
                type="number"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {values?.SortedItemOpen?.UOM?.UOMName ||
                        values?.SortedItemOpen?.UOMName ||
                        'Unit'}
                    </InputAdornment>
                  ),
                }}
              />

              <RHFTextField
                name="Remarks"
                label="Remarks"
                placeholder="Enter remarks here"
                sx={{
                  gridColumn: {
                    xs: '1 / -1',
                    sm: 'span 3',
                  },
                  width: '100%',
                }}
                multiline
                rows={3}
              />
            </Box>
          </Card>

          <Card sx={{ p: 2, mt: 2 }}>
            {/* <Box sx={{ mt: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}> */}
            <h4>Waste Details</h4>
            <Box
              rowGap={2}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
              sx={{ mb: 2 }}
            >
              <RHFAutocomplete
                name="WasteSubCategory"
                label="Waste Type"
                placeholder="Choose an option"
                fullWidth
                options={allWasteSubCategory}
                getOptionLabel={(option) => option?.SubCat_Name || ''}
                isOptionEqualToValue={(option, value) => option?.SubCat_ID === value?.SubCat_ID}
                value={values?.WasteSubCategory || null}
              />

              <RHFAutocomplete
                name="WasteItem"
                label="Waste Item"
                placeholder="Choose an option"
                fullWidth
                options={allWasteItems}
                getOptionLabel={(option) =>
                  option?.CodeAndDescription || option?.ItemDescription || ''
                }
                isOptionEqualToValue={(option, value) => option.ItemID === value.ItemID}
                value={values?.WasteItem || null}
              />

              <RHFTextField
                name="WasteQty"
                label="Waste Quantity"
                type="number"
                placeholder="Enter waste quantity"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {values?.SortedItemOpen?.UOM?.UOMName ||
                        values?.SortedItemOpen?.UOMName ||
                        'Unit'}
                    </InputAdornment>
                  ),
                }}
                helperText={
                  selectedRowData.length > 0 && remainingQty > 0
                    ? `Max: ${fNumber(remainingQty - totalWasteQty)} ${selectedRowData[0]?.UOMName || ''
                    } (Remaining: ${fNumber(remainingQty)} ${selectedRowData[0]?.UOMName || ''})`
                    : selectedRowData.length === 0
                      ? 'Please select rows first'
                      : 'No remaining qty available'
                }
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                color="primary"
                onClick={handleAddWasteDetail}
                variant="contained"
                sx={{ mb: 2 }}
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Add Waste Detail
              </Button>
            </Box>

            {wasteDetails.length > 0 && (
              <TableContainer>
                <Table size="small" sx={{ border: 1, borderColor: 'divider' }}>
                  <TableHeadCustom
                    headLabel={[
                      // { id: 'Category', label: 'Category', minWidth: 150 },
                      { id: 'SubCategory', label: 'Waste Type', minWidth: 150 },
                      { id: 'Item', label: 'Item', minWidth: 200 },
                      { id: 'Qty', label: 'Quantity', minWidth: 120, align: 'right' },
                      // { id: 'Percent', label: 'Percent', minWidth: 100, align: 'right' },
                      { id: 'Actions', label: 'Actions', minWidth: 100, align: 'center' },
                    ]}
                  />
                  <TableBody>
                    {wasteDetails.map((waste, index) => (
                      <TableRow key={index} hover>
                        {/* <TableCell align="left">
                        {waste.WasteCategory?.Inv_Cat_Name || '-'}
                      </TableCell> */}
                        <TableCell align="left">
                          {waste.WasteSubCategory?.SubCat_Name || '-'}
                        </TableCell>
                        <TableCell align="left">
                          {waste.WasteItem?.CodeAndDescription ||
                            waste.WasteItem?.ItemDescription ||
                            '-'}
                        </TableCell>
                        <TableCell align="right">
                          {fNumber(waste.WasteQty)}{' '}
                          {values?.SortedItemOpen?.UOM?.UOMName ||
                            values?.SortedItemOpen?.UOMName ||
                            ''}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleRemoveWasteDetail(index)}
                            size="small"
                            color="error"
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Total Waste Row */}
                    <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                      <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
                        Total Waste Added:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {fNumber(totalWasteQty)}{' '}
                        {selectedRowData.length > 0
                          ? selectedRowData[0]?.UOMName || ''
                          : values?.SortedItemOpen?.UOM?.UOMName ||
                          values?.SortedItemOpen?.UOMName ||
                          ''}
                      </TableCell>
                      <TableCell align="center" />
                    </TableRow>
                    {/* Remaining Qty Row */}
                    {selectedRowData.length > 0 && (
                      <TableRow sx={{ backgroundColor: '#ffffff' }}>
                        <TableCell colSpan={2} align="right">
                          Remaining Qty Available:
                        </TableCell>
                        <TableCell align="right">
                          {fNumber(remainingQty - totalWasteQty)}{' '}
                          {selectedRowData[0]?.UOMName || ''}
                          {totalWasteQty > remainingQty && (
                            <Box
                              component="span"
                              sx={{ color: 'error.main', ml: 1, fontSize: '0.75rem' }}
                            >
                              (Exceeds by {fNumber(totalWasteQty - remainingQty)})
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="center" />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {/* </Box> */}
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
