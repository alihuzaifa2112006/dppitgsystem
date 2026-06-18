import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Checkbox,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';

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
import RTReportTableRow from './RTReport-table-row';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { fNumber } from 'src/utils/format-number';
import Textfield from '../_examples/mui/textfield-view/textfield';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function RTReportCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [allItemUnit, setallItemUnit] = useState([]);
  const [allSupplierData, setallSupplierData] = useState([]);

  const [allSuperVisiorName, setallSuperVisiorName] = useState([]);
  const [allShiftName, setallShiftName] = useState([]);
  const [isGrnLoading, setIsGrnLoading] = useState(false);
  const [hrUsers, setHrUsers] = useState([]);
  const [allLineNumbers, setAllLineNumbers] = useState([]);
  const [allChallanNo, setallChallanNo] = useState([]);
  const [alltransferNumbers, setAlltransferNumbers] = useState([]);
  const [grnData, setGrnData] = useState(null);
  const [selectedUOMID, setSelectedUOMID] = useState(null);
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedRowDataArray, setSelectedRowDataArray] = useState([]);

  // State for sorted item selection
  const [allSortedClassName, setAllSortedClassName] = useState([]);
  const [allSortedCategoryData, setAllSortedCategoryData] = useState([]);
  const [allSortedSubCategory, setAllSortedSubCategory] = useState([]);
  const [allSortedColors, setAllSortedColors] = useState([]);
  const [allSortedInvSpare, setAllSortedInvSpare] = useState([]);
  const [SortedItemOpen, setSortedItemOpen] = useState([]);

  // Waste Details State
  const [wasteDetails, setWasteDetails] = useState([]);
  const [allWasteSubCategory, setAllWasteSubCategory] = useState([]);
  const [allWasteItems, setAllWasteItems] = useState([]);

  const ChallanDetailsTableHead = [
    { id: 'Checkbox', label: 'Select', minWidth: 80, align: 'left' },
    { id: 'ReqCode', label: 'Req No/Transfer No', minWidth: 220, align: 'center' },
    { id: 'ItemName', label: 'Item Name', minWidth: 220, align: 'left' },
    // { id: 'CategoryName', label: 'Category Name', minWidth: 200, align: 'center' },
    // { id: 'SubCatName', label: 'Sub Category', minWidth: 200, align: 'center' },
    // { id: 'InvTypeName', label: 'Inventory Type', minWidth: 180, align: 'center' },
    { id: 'TotalRequestedQty', label: 'Requested Qty', minWidth: 140, align: 'right' },
    { id: 'TotalIssueQty', label: 'Received Qty', minWidth: 140, align: 'right' },
    // { id: 'UOMName', label: 'UOM', minWidth: 140, align: 'cenre' },
    { id: 'StoreName', label: 'Store Name', minWidth: 160, align: 'center' },
    { id: 'LocationName', label: 'Location', minWidth: 160, align: 'center' },
    // { id: 'Remarks', label: 'Remarks', minWidth: 200, align: 'left' },
  ];

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
  const [tableData, setTableData] = useState([]);

  // --- Form Hooks Setup ---
  const NewRTReportSchema = Yup.object().shape({
    ReqCode: Yup.array()
      .nullable()
      .test(
        'at-least-one',
        'Please select at least one Requisition or Transfer Number',
        (value, context) => {
          const arr = Array.isArray(value) ? value : value ? [value] : [];
          const transferArr = Array.isArray(context.parent.TransferNumber) ? context.parent.TransferNumber : context.parent.TransferNumber ? [context.parent.TransferNumber] : [];
          return arr.length > 0 || transferArr.length > 0;
        }
      ),
    line1StartTime: Yup.date()
      .required('Start time is required')
      .typeError('Please select a valid time'),





  });


  const methods = useForm({
    resolver: yupResolver(NewRTReportSchema),
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
    const key = row._uniqueKey;
    const isSelected = selectedValues.includes(key);
    if (isSelected) {
      setSelectedValues((prev) => prev.filter((k) => k !== key));
      setSelectedRowDataArray((prev) => prev.filter((item) => item._uniqueKey !== key));
    } else {
      setSelectedValues((prev) => [...prev, key]);
      setSelectedRowDataArray((prev) => [...prev, row]);
    }
  };

  // 💥 FIX APPLIED HERE
  // 'values' must be defined before it is used.
  const values = watch();

  // Variables dependent on 'values' must be defined after 'values'.
  const selectedChallan = Array.isArray(values.ReqCode) ? values.ReqCode : values.ReqCode ? [values.ReqCode] : [];
  const totalWeight = parseFloat(watch('TotalWeight')) || 0;

  // Calculate Totals and Remaining Qty (from selected rows)
  const totalIssueQty = useMemo(() => selectedRowDataArray.reduce(
    (sum, item) => sum + (parseFloat(item?.TotalIssueQty) || 0),
    0
  ), [selectedRowDataArray]);

  const totalWasteQty = useMemo(
    () => wasteDetails.reduce((acc, item) => acc + (parseFloat(item.WasteQty) || 0), 0),
    [wasteDetails]
  );

  const remainingQty = useMemo(
    () => Math.max(0, totalIssueQty - totalWeight),
    [totalIssueQty, totalWeight]
  );
  // 💥 END OF FIX

  // --- Effects using 'values' or its dependents ---

  // Watch ReqCode (array) and TransferNumber from form values
  const selectedReqCodes = useWatch({ control, name: 'ReqCode' });
  const selectedTransferNumbers = useWatch({ control, name: 'TransferNumber' });
  const selectedRequisitions = useMemo(() => Array.isArray(selectedReqCodes)
    ? selectedReqCodes
    : selectedReqCodes
      ? [selectedReqCodes]
      : []
    , [selectedReqCodes]);
  const selectedTransfers = useMemo(() => Array.isArray(selectedTransferNumbers)
    ? selectedTransferNumbers
    : selectedTransferNumbers
      ? [selectedTransferNumbers]
      : []
    , [selectedTransferNumbers]);

  useEffect(() => {
    if (selectedRequisitions.length === 0 && selectedTransfers.length === 0) {
      setGrnData(null);
      setSelectedValues([]);
      setSelectedRowDataArray([]);
      return;
    }

    const fetchAllData = async () => {
      try {
        setIsGrnLoading(true);
        const allDetails = [];

        // Fetch data for each selected requisition
        if (selectedRequisitions.length > 0) {
          const fetchPromises = selectedRequisitions.map((challan) =>
            Get(
              `GetConfReceiveByReqCode?reqCode=${challan.ReqCode}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
            )
          );

          const responses = await Promise.all(fetchPromises);

          responses.forEach((res, index) => {
            const reqId = selectedRequisitions[index]?.ReqID;
            const reqCode = selectedRequisitions[index]?.ReqCode;
            const details = res.data?.Details || [];

            details.forEach((detail) => {
              const row = {
                ...detail,
                ReqCode: reqCode,
                ReqID: reqId || detail.ReqID || 0,
                SourceType: 'ReqCode',
              };
              row._uniqueKey = `ReqCode_${reqCode}_${row.IssueDtlID}`;
              allDetails.push(row);
            });
          });
        }

        // Fetch data for each selected transfer number
        if (selectedTransfers.length > 0) {
          const transferPromises = selectedTransfers.map((transfer) =>
            Get(`GetTransferItemsByID?TransferID=${transfer.TransferID}`)
          );

          const transferResponses = await Promise.all(transferPromises);

          transferResponses.forEach((res, index) => {
            const currentTransfer = selectedTransfers[index];
            const transferItems = Array.isArray(res.data)
              ? res.data
              : res.data?.data || res.data || [];

            transferItems.forEach((item) => {
              const transferID = item.TransferID || currentTransfer.TransferID;
              const issueDtlID = item.ItemID || item.VID || 0;
              allDetails.push({
                TransferID: transferID,
                TransferNo: currentTransfer.TransferNo,
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
                IssueDtlID: issueDtlID,
                ReqID: null,
                SourceType: 'Transfer',
                _uniqueKey: `Transfer_${currentTransfer.TransferNo}_${issueDtlID}`,
              });
            });
          });
        }

        setGrnData({ Details: allDetails });

        // Preserve existing selections that still exist in the new data
        const newUniqueKeys = new Set(allDetails.map((d) => d._uniqueKey));
        setSelectedValues((prev) => prev.filter((key) => newUniqueKeys.has(key)));
        setSelectedRowDataArray((prev) => {
          const kept = prev.filter((item) => newUniqueKeys.has(item._uniqueKey));
          return kept.map((item) => {
            const updated = allDetails.find((d) => d._uniqueKey === item._uniqueKey);
            return updated || item;
          });
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setGrnData(null);
      } finally {
        setIsGrnLoading(false);
      }
    };

    fetchAllData();
  }, [
    selectedRequisitions,
    selectedTransfers,
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID
  ]);

  // --- Data Fetching Effects ---

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
          `GetConfirmReqNumDptID?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}&deptId=9&sectionID=29`
        );
        console.log('Requested No Response:', res.data);

        const challans = res.data || [];
        const ReqNumWithDate = challans.map((item) => ({
          ...item,

          ReqCodeWithDate: `${item.ReqCode} | ${fDate(item.CreatedDate)}`,
        }));

        setallChallanNo(ReqNumWithDate);
      } catch (err) {
        console.error('Error fetching challans:', err);
      }
    };

    fetchChallanNumbers();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // Fetch transfer numbers
  useEffect(() => {
    const fetchAlltransferNumbers = async () => {
      try {
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
        `GetColorsBySubCatFromItemDB?subCatId=${selectedSortedSubCategory?.SubCat_ID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
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
  // WASTE DETAILS FLOW
  // ============================================

  // Fetch waste subcategories (ClassID: 11 as per reference)
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
    const enteredWasteQty = parseFloat(values.WasteQty);
    if (!values?.WasteQty || values?.WasteQty === '' || enteredWasteQty <= 0) {
      enqueueSnackbar('Valid Waste Quantity is required', { variant: 'error' });
      return;
    }

    if (enteredWasteQty > remainingQty - totalWasteQty) {
      enqueueSnackbar(
        `Cannot add waste. Exceeds remaining quantity available (${fNumber(
          remainingQty - totalWasteQty
        )})`,
        { variant: 'error' }
      );
      return;
    }

    const newWasteDetail = {
      WasteCategoryID: 12, // Default or derived
      WasteSubCatID: values.WasteSubCategory?.SubCat_ID || 0,
      WasteItemID: values.WasteItem?.ItemID || 0,
      WasteQty: enteredWasteQty,
      WastePercent: 0, // Logic if needed
      WasteSubCategory: values.WasteSubCategory,
      WasteItem: values.WasteItem,
    };

    setWasteDetails((prev) => [...prev, newWasteDetail]);

    // Reset waste form fields
    setValue('WasteSubCategory', null);
    setValue('WasteItem', null);
    setValue('WasteQty', '');
  };

  const handleRemoveWasteDetail = (index) => {
    setWasteDetails((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Handlers ---

  const onSubmit = handleSubmit(async () => {
    if (selectedRowDataArray.length === 0) {
      enqueueSnackbar('Please select at least one item from the requisition/transfer table', {
        variant: 'error',
      });
      return;
    }

    if (totalWasteQty > remainingQty) {
      enqueueSnackbar(
        `Total Waste (${fNumber(totalWasteQty)}) cannot exceed Remaining Qty (${fNumber(
          remainingQty
        )})`,
        { variant: 'error' }
      );
      return;
    }

    if (parseFloat(values.TotalWeight) > totalIssueQty) {
      enqueueSnackbar(
        `Total Weight (${fNumber(values.TotalWeight)}) cannot exceed Total Issue Qty (${fNumber(
          totalIssueQty
        )})`,
        { variant: 'error' }
      );
      return;
    }

    const allWasteDetails = wasteDetails.map((waste) => ({
      WasteDtlID: 0,
      WasteCategoryID: waste.WasteCategoryID || 12,
      WasteCategoryName: waste.WasteSubCategory?.SubCat_Name || '',
      WasteSubCatID: waste.WasteSubCatID || 0,
      WasteSubCatName: waste.WasteSubCategory?.SubCat_Name || '',
      WasteItemID: waste.WasteItemID || 0,
      WasteItemName: waste.WasteItem?.ItemDescription || waste.WasteItem?.CodeAndDescription || '',
      WasteQty: parseFloat(waste.WasteQty) || 0,
      WastePercent: 0,
      CreatedBy: userData?.userDetails?.userId || 0,
    }));

    const bale = parseFloat(values.TBale) || 0;
    const totalWeight1 = parseFloat(values.TotalWeight) || 0;
    const mcRunning = parseFloat(values.MCRunning) || 0;
    const productionHR = parseFloat(values.ProductionHR) || 0;

    const Details = selectedRowDataArray.map((row) => ({
      ReqID: row.SourceType === 'ReqCode' ? row.ReqID : null,
      TransID: row.SourceType === 'Transfer' ? row.TransferID : null,
      SortedItemID: row.IssueDtlID || row.ItemID || 0,
      ChallanNo: row.SourceType === 'Transfer' ? row.TransferNo : row.ReqCode || '',
      TotalBale: bale,
      TotalWeight: totalWeight1,
      DustWeight: 0,
      DustPercent: 0,
      Total_MC_Running: mcRunning,
      Total_Production_HR: productionHR,
    }));

    const dataToSend = {
      Org_ID: userData?.userDetails?.orgId ?? 1,
      Branch_ID: userData?.userDetails?.branchID ?? 6,
      Deptid: userData?.userDetails?.DepId ?? 9,
      ShiftID: values.ShiftName?.ShiftId ?? 0,
      RptDate: values.PRDate ? new Date(values.PRDate).toISOString() : new Date().toISOString(),
      Line_No: values.Line?.LineNo ?? '',
      Bale: bale,
      Production: totalWeight1,
      Total_MC_Running: mcRunning,
      Total_Production_HR: productionHR,
      Total_Bale: bale,
      Total_Weight: totalWeight1,
      Total_Time: values.line1StartTime
        ? dayjs(values.line1StartTime).toISOString()
        : dayjs().toISOString(),
      Remarks: values.Remarks || '',
      InvTypeID: values.SortedClassID?.ClassID ?? 0,
      CatID: values.SortedCategory?.Inv_Cat_ID ?? 0,
      SubCatID: values.SortedSubCategory?.SubCat_ID ?? 0,
      SpAreaID: values.SortedInvSpare?.SpareID ?? 0,
      ColorID: values.SortedColor?.ColorID ?? 0,
      UOMID: selectedRowDataArray[0]?.UOMID ?? 0,
      SFGItemID: values.SortedItemOpen?.ItemID ?? 0,
      CreatedBy: userData?.userDetails?.userId ?? 0,
      Details,
      WasteDetails: allWasteDetails,
    };

    try {
      const res = await Post('AddRagTearingReport', dataToSend);
      if (res.data?.Success === false) {
        enqueueSnackbar(res.data?.Message || res.data?.message || 'Failed to create report', {
          variant: 'error',
        });
      } else {
        enqueueSnackbar('Rag Tearing Report Created Successfully!');
        router.push(paths.dashboard.Production.RTReport.root);
        reset();
        setWasteDetails([]);
        setSelectedValues([]);
        setSelectedRowDataArray([]);
      }
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
            <h3>Rag Tearing Production Report</h3>
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
            </Box>
          </Card>
          <Card sx={{ p: 3, mt: 1 }}>
            <Box
              rowGap={2}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(3, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <h3>Select Requisition No.</h3>
              <br />

              <RHFAutocomplete
                name="ReqCode"
                label="Requisition No"
                placeholder="Choose requisitions"
                fullWidth
                multiple
                options={allChallanNo}
                getOptionLabel={(option) => option?.ReqCodeWithDate || ''}
                isOptionEqualToValue={(option, value) => option?.ReqCode === value?.ReqCode}
                value={Array.isArray(values?.ReqCode) ? values.ReqCode : values?.ReqCode ? [values.ReqCode] : []}
                renderOption={(props, option, { selected }) => (
                  <li {...props} key={option.ReqCode}>
                    <Checkbox style={{ marginRight: 8 }} checked={selected} />
                    {option?.ReqCodeWithDate || ''}
                  </li>
                )}
                renderTags={(value, getTagProps) => {
                  const limit = 2;
                  const customGreenStyle = { backgroundColor: '#4F782B', color: 'white' };
                  return (
                    <>
                      {value.slice(0, limit).map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option.ReqCode}
                          label={option.ReqCodeWithDate}
                          size="small"
                          sx={customGreenStyle}
                        />
                      ))}
                      {value.length > limit && (
                        <Chip label={`+${value.length - limit} more`} size="small" sx={customGreenStyle} />
                      )}
                    </>
                  );
                }}
              />

              <RHFAutocomplete
                name="TransferNumber"
                label="Transfer Number"
                placeholder="Choose transfer numbers"
                fullWidth
                multiple
                options={alltransferNumbers || []}
                getOptionLabel={(option) => option?.TransferNoWithDate || option?.TransferNo || ''}
                isOptionEqualToValue={(option, value) => option?.TransferNo === value?.TransferNo}
                value={Array.isArray(values?.TransferNumber) ? values.TransferNumber : values?.TransferNumber ? [values.TransferNumber] : []}
                noOptionsText="No transfer numbers available"
                renderOption={(props, option, { selected }) => (
                  <li {...props} key={option.TransferNo}>
                    <Checkbox style={{ marginRight: 8 }} checked={selected} />
                    {option?.TransferNoWithDate || ''}
                  </li>
                )}
                renderTags={(value, getTagProps) => {
                  const limit = 2;
                  const customGreenStyle = { backgroundColor: '#4F782B', color: 'white' };
                  return (
                    <>
                      {value.slice(0, limit).map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option.TransferNo}
                          label={option.TransferNoWithDate}
                          size="small"
                          sx={customGreenStyle}
                        />
                      ))}
                      {value.length > limit && (
                        <Chip label={`+${value.length - limit} more`} size="small" sx={customGreenStyle} />
                      )}
                    </>
                  );
                }}
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
                <>
                  {selectedRowDataArray.length > 0 && (
                    <Box
                      sx={{
                        mt: 2,
                        mb: 1,
                        p: 1.5,
                        backgroundColor: '#4caf5020',
                        borderRadius: 1,
                        border: '1px solid #4caf50',
                      }}
                    >
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        ✓ {selectedRowDataArray.length} item(s) selected | Total Issued Qty:{' '}
                        {fNumber(totalIssueQty)} {selectedRowDataArray[0]?.UOMName}
                      </Typography>
                    </Box>
                  )}
                  <TableContainer sx={{ mt: 2 }}>
                    <Scrollbar sx={{ maxHeight: '400px' }}>
                      <Table
                        size={table.dense ? 'small' : 'medium'}
                        component={Paper}
                        sx={{ minWidth: 460 }}
                      >
                        <TableHeadCustom
                          order={table.order}
                          orderBy={table.orderBy}
                          headLabel={ChallanDetailsTableHead}
                        />
                        <TableBody>
                          {grnData.Details.map((row, index) => {
                            const identifier =
                              row.SourceType === 'Transfer' ? row.TransferNo : row.ReqCode;
                            const uniqueKey = `${identifier}_${row.IssueDtlID}_${index}`;
                            return (
                              <tr key={uniqueKey}>
                                <td style={{ textAlign: 'center' }}>
                                  <Checkbox
                                    checked={selectedValues.includes(row._uniqueKey)}
                                    disabled={selectedRowDataArray.length > 0 && selectedRowDataArray.some(item => item.ItemID !== row.ItemID)}
                                    onChange={() => handleCheckboxChange(row)}
                                    color="primary"
                                  />
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 'medium' }}>
                                  {row.SourceType === 'Transfer'
                                    ? row.TransferNo || '-'
                                    : row.ReqCode || '-'}
                                </td>
                                <td
                                  style={{
                                    textAlign: 'center',
                                    whiteSpace: 'nowrap',
                                    maxWidth: 420,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {row.ItemName}
                                </td>
                                <td style={{ textAlign: 'right' }}>{`${fNumber(
                                  row.TotalRequestedQty
                                )} ${row.UOMName}`}</td>
                                <td style={{ textAlign: 'right' }}>{`${fNumber(row.TotalIssueQty)} ${row.UOMName
                                  }`}</td>
                                <td style={{ textAlign: 'center' }}>{row.StoreName}</td>
                                <td style={{ textAlign: 'center' }}>{row.LocationName}</td>
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
                  </TableContainer>
                </>
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
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              <RHFAutocomplete
                name="Line"
                label="Select Line No"
                placeholder="Choose a line number"
                fullWidth
                options={allLineNumbers}
                getOptionLabel={(option) => option?.LineNo || ''}
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

              {/* Item Selection Flow Dropdowns */}
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
                  endAdornment: (
                    <InputAdornment position="end">
                      {selectedRowDataArray[0]?.UOMName || 'Unit'}
                    </InputAdornment>
                  ),
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
                    fullWidth
                    error={
                      !!error || (totalIssueQty > 0 && parseFloat(field.value) > totalIssueQty)
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {selectedRowDataArray[0]?.UOMName || 'Unit'}
                        </InputAdornment>
                      ),
                    }}
                    helperText={
                      error?.message ||
                      (totalIssueQty > 0 && parseFloat(field.value) > totalIssueQty
                        ? `Max allowed: ${fNumber(totalIssueQty)} ${selectedRowDataArray[0]?.UOMName || ''}`
                        : '')
                    }
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
                      {selectedRowDataArray[0]?.UOMName || 'Unit'}
                    </InputAdornment>
                  ),
                }}
              />

              <Controller
                name="line1StartTime"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <MobileTimePicker
                    label="Pick Time"
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
                fullWidth
              />
            </Box>
          </Card>

          <Card sx={{ p: 2, mt: 2 }}>
            <h3>Waste Details</h3>
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
                      {selectedRowDataArray[0]?.UOMName || 'Unit'}
                    </InputAdornment>
                  ),
                }}
                helperText={
                  selectedRowDataArray.length > 0 && remainingQty >= 0
                    ? `Max: ${fNumber(remainingQty - totalWasteQty)} (Remaining: ${fNumber(
                      remainingQty
                    )})`
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
                      { id: 'SubCategory', label: 'Waste Type', minWidth: 150 },
                      { id: 'Item', label: 'Item', minWidth: 200 },
                      { id: 'Qty', label: 'Quantity', minWidth: 120, align: 'right' },
                      { id: 'Actions', label: 'Actions', minWidth: 100, align: 'center' },
                    ]}
                  />
                  <TableBody>
                    {wasteDetails.map((waste, index) => (
                      <TableRow key={index} hover>
                        <TableCell align="left">
                          {waste.WasteSubCategory?.SubCat_Name || '-'}
                        </TableCell>
                        <TableCell align="left">
                          {waste.WasteItem?.CodeAndDescription ||
                            waste.WasteItem?.ItemDescription ||
                            '-'}
                        </TableCell>
                        <TableCell align="right">
                          {fNumber(waste.WasteQty) || 0} {selectedRowDataArray[0]?.UOMName || ''}
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
                        {fNumber(totalWasteQty)} {selectedRowDataArray[0]?.UOMName || ''}
                      </TableCell>
                      <TableCell align="center" />
                    </TableRow>
                    {/* Remaining Qty Row */}
                    {selectedRowDataArray.length > 0 && (
                      <TableRow sx={{ backgroundColor: '#ffffff' }}>
                        <TableCell colSpan={2} align="right">
                          Remaining Qty Available:
                        </TableCell>
                        <TableCell align="right">
                          {fNumber(remainingQty - totalWasteQty)} {selectedRowDataArray[0]?.UOMName || ''}
                          {totalWasteQty > remainingQty && (
                            <Box
                              component="span"
                              sx={{ color: 'error.main', ml: 1, fontSize: '0.75rem' }}
                            >
                              (Exceeds by {fNumber(totalWasteQty - remainingQty) || 0})
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
