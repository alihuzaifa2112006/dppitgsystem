import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

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
  Table,
  TableBody,
  TableContainer,
  Typography,
  Skeleton,
  Tooltip,
  TextField,
  TableFooter,
  TableCell,
  TableRow,
  Paper,
  Checkbox,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { fNumber } from 'src/utils/format-number';
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
import ProductionReportTableRow from './ProductionReport-table-row';
import { number } from 'prop-types';
import ConfirmationDialog from './TransferingDialog';

import ProductionReportSecondTable from './ProductionReport-table-row-Second';
import { fDate } from 'src/utils/format-time';

export default function ProductionReportCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [RequestDetails, setRequestDetails] = useState([]);
  const [allSuperVisiorName, setallSuperVisiorName] = useState([]);
  const [allShiftName, setallShiftName] = useState([]);
  const [hrUsers, setHrUsers] = useState([]);
  const [selectedUOMID, setSelectedUOMID] = useState(null);
  const [allChallanNo, setallChallanNo] = useState([]);
  const [grnData, setGrnData] = useState(null);
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedRowDataArray, setSelectedRowDataArray] = useState([]);
  const [isGrnLoading, setIsGrnLoading] = useState(false);
  const [itemSubCategory, setItemSubCategory] = useState([]);
  const [ItemOpen, setItemOpen] = useState([]);
  const [newRequestedDetail, setnewRequestedDetail] = useState([]);
  // State for sorted item selection
  const [allSortedClassName, setAllSortedClassName] = useState([]);
  const [allSortedCategoryData, setAllSortedCategoryData] = useState([]);
  const [allSortedSubCategory, setAllSortedSubCategory] = useState([]);
  const [allSortedColors, setAllSortedColors] = useState([]);
  const [allSortedInvSpare, setAllSortedInvSpare] = useState([]);
  const [SortedItemOpen, setSortedItemOpen] = useState([]);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };


  const ChallanDetailsTableHead = [
    { id: 'Checkbox', label: 'Select', minWidth: 80, align: 'left' },
    { id: 'ItemName', label: 'Item Name', minWidth: 220, align: 'left' },
    // { id: 'CategoryName', label: 'Category Name', minWidth: 200, align: 'center' },
    // { id: 'SubCatName', label: 'Sub Category', minWidth: 200, align: 'center' },
    // { id: 'InvTypeName', label: 'Inventory Type', minWidth: 180, align: 'center' },
    { id: 'StoreName', label: 'Store Name', minWidth: 160, align: 'center' },
    { id: 'LocationName', label: 'Location', minWidth: 120, align: 'center' },
    { id: 'TotalRequestedQty', label: 'Requested Qty', minWidth: 140, align: 'right' },
    { id: 'TotalIssueQty', label: 'Issued Qty', minWidth: 140, align: 'right' },
    // { id: 'RemainingQty', label: 'Remaining Qty', minWidth: 140, align: 'right' },
    // { id: 'Remarks', label: 'Remarks', minWidth: 200, align: 'left' },
  ];
  const WasteTable = [
    { id: 'ItemSubCategory', label: 'Waste Type', minWidth: 200, align: 'center' },
    { id: 'ItemOpen', label: 'Item Name', minWidth: 200, align: 'center' },
    { id: 'Quantity', label: 'Quantity', minWidth: 200, align: 'right' },
    { id: 'Actions', label: 'Actions', minWidth: 200, align: 'center' },
  ];

  const handleCheckboxChange = (row) => {
    const issueDtlID = row.IssueDtlID;
    const isSelected = selectedValues.includes(issueDtlID);

    if (isSelected) {
      // Remove from selection
      setSelectedValues((prev) => prev.filter((id) => id !== issueDtlID));
      setSelectedRowDataArray((prev) => prev.filter((item) => item.IssueDtlID !== issueDtlID));
    } else {
      // Add to selection
      setSelectedValues((prev) => [...prev, issueDtlID]);
      setSelectedRowDataArray((prev) => [...prev, row]);
    }
    console.log('Selected Row Data:', isSelected ? 'Removed' : 'Added', row);
  };

  const table = useTable();

  const notFound = !RequestDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  const [isLoading, setLoading] = useState(false);


  const fetchSubCategory = useCallback(async () => {
    try {
      const response = await Get(`GetSubCategoriesByCategoryID/11`);
      setItemSubCategory(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const totalQuantitySum = newRequestedDetail.reduce((sum, currentItem) => {
    const qty = currentItem.RejectedQty;

    const numericQty = parseFloat(qty);

    if (!Number.isNaN(numericQty)) {
      return sum + numericQty;
    }

    return sum;
  }, 0);






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

      fetchSubCategory();
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, fetchSubCategory]);

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = RequestDetails.filter((row) => row !== rowToDelete);
    setRequestDetails(updatedDetails);

    if (editingIndex !== null && RequestDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);

      setValue('EmployeeName', null);
      setValue('BagDetails', '');
      setValue('TotalBags', '');
    }
  };

  const DeleteDetailTableRowForSecond = (rowToDelete) => {
    const updatedDetails = newRequestedDetail.filter((row) => row !== rowToDelete);
    setnewRequestedDetail(updatedDetails);

    if (editingIndex !== null && newRequestedDetail[editingIndex] === rowToDelete) {
      setEditingIndex(null);

      setValue('ItemSubCategory', null);
      setValue('ItemOpen', '');
      setValue('Quantity', '');
    }
  };

  useEffect(() => {
    const fetchAllShiftNames = async () => {
      try {
        const response = await Get(
          `GetAllShifts?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );

        console.log('ShitName API Response:', response);

        const shiftData = response.data.data || [];
        setallShiftName(shiftData);
        // console.log("here is shift data", allShiftName)
      } catch (error) {
        console.error('Error fetching shift:', error);
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetchAllShiftNames();
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchChallanNumbers = async () => {
      try {
        const res = await Get(
          `GetConfirmReqNumDptID?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}&deptId=9&sectionID=26`
        );
        console.log('Requested No Response:', res.data);

        const challans = res.data || [];
        const ReqNumWithDate = challans.map((item) => ({
          ...item,

          ReqCodeWithDate: `${item.ReqCode} | ${fDate(item.CreatedDate)}`,
        }));
        console.log('Challan with date:', ReqNumWithDate);

        setallChallanNo(ReqNumWithDate);
      } catch (err) {
        console.error('Error fetching challans:', err);
      }
    };

    fetchChallanNumbers();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const NewProductionReportSchema = Yup.object().shape({
    SortedQty: Yup.number()
      .required('Sorted Quantity is required')
      .typeError('Must be a number')
      .positive('Must be a positive number')
      .test(
        'is-less-than-issue-qty',
        'Sorted Quantity cannot exceed the total Issued Quantity of selected items.',
        (value) => {
          if (selectedRowDataArray.length === 0) return true;

          const totalIssuedQty = selectedRowDataArray.reduce(
            (sum, item) => sum + (parseFloat(item?.TotalIssueQty) || 0),
            0
          );
          const sortedQty = parseFloat(value) || 0;

          return sortedQty <= totalIssuedQty;
        }
      ),
    UserId: Yup.object()
      .shape({
        UserId: Yup.number().required('UserId is required'),
        EmployeeName: Yup.string().required('EmployeeName is required'),
      })
      .required('Supervisor is required'),
    ShiftName: Yup.object()
      .shape({
        ShiftName: Yup.string().required('ShiftName is required'),
      })
      .required('Shift is required'),
    PRDate: Yup.date().required('Date is required').typeError('Please enter a valid date'),

    // TotalWorker: Yup.number()
    //   .required('Total Worker Qauntity is required')
    //   .positive('Total Worker must be a positive number'),

    // PresentDuty: Yup.number()
    //   .required('On Duty Worder Qty is required')
    //   .positive('Must be positive number')
    //   .integer('Must be whole number')
    //   .typeError('Must be a whole number'),
    ReqCode: Yup.array()
      .of(
        Yup.object().shape({
          ReqCode: Yup.string().required(),
          ReqID: Yup.number(),
          ReqCodeWithDate: Yup.string(),
        })
      )
      .min(1, 'At least one Requisition No is required')
      .required('Req No is required'),

    Reason: Yup.string()
      .required('Reason is required')
      .max(500, 'Reason cannot exceed 500 characters'),
    SortedClassID: Yup.object().required('Sorted Class is required'),
    SortedCategory: Yup.object().required('Sorted Category is required'),
    SortedSubCategory: Yup.object().required('Sorted Sub Category is required'),
    // SortedColor: Yup.object().required('Sorted Color is required'),
    // SortedInvSpare: Yup.object().required('Sorted Inv Spare is required'),
    // SortedItemOpen: Yup.object().required('Sorted Item Open is required'),
    // SortedQty: Yup.number().required('Sorted Quantity is required'),
    // SortedRemQty: Yup.number().required('Sorted Remaining Quantity is required'),
    // ReasonOfRejec: Yup.string().required('Reason of Rejection is required'),
    // Remarks: Yup.string().required('Remarks is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewProductionReportSchema),
    defaultValues: {
      PRDate: new Date(),

      JMS: '0.00',
      UOM: '',
      UOMID: null,
      SortedClassID: null,
      SortedCategory: null,
      SortedSubCategory: null,
      SortedColor: null,
      SortedInvSpare: null,
      SortedItemOpen: null,
      ReqCode: [],
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

  const values = watch();

  const selectedChallan = values.ReqCode;

  useEffect(() => {
    const selectedRequisitions = Array.isArray(selectedChallan) ? selectedChallan : (selectedChallan ? [selectedChallan] : []);

    if (selectedRequisitions.length > 0) {
      const fetchGRN = async () => {
        try {
          setIsGrnLoading(true);

          // Fetch data for all selected requisitions
          const fetchPromises = selectedRequisitions.map((challan) =>
            Get(
              `GetConfReceiveByReqCode?reqCode=${challan.ReqCode}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
            )
          );

          const responses = await Promise.all(fetchPromises);

          // Combine all Details arrays from all responses, preserving ReqID
          const combinedDetails = responses.flatMap((res, index) => {
            const reqId = selectedRequisitions[index]?.ReqID;
            const details = res.data?.Details || [];
            return details.map((detail) => ({
              ...detail,
              ReqID: reqId || detail.ReqID || null,
            }));
          });

          // Create combined GRN data structure
          const combinedGrnData = {
            ...responses[0]?.data,
            Details: combinedDetails,
          };

          console.log('Combined GRN API Response:', combinedGrnData);
          setGrnData(combinedGrnData);
        } catch (err) {
          console.error('Error fetching GRN:', err);
          setGrnData(null);
        } finally {
          setIsGrnLoading(false);
        }
      };

      fetchGRN();
    } else {
      setGrnData(null);
    }
  }, [selectedChallan, userData]);

  const selectedSubCategory = watch(`ItemSubCategory`);
  const fetchItemsBySubCategory = useCallback(async () => {
    if (selectedSubCategory?.SubCat_ID) {
      try {
        const response = await Get(`itemsgetBySubCatId/${selectedSubCategory?.SubCat_ID}`);
        const updatedData = response?.data?.Data.map((item) => ({
          ...item,
          ClassID: item?.InvTypesID,
          UOM: { UOMName: item?.UOMName, UOM_ID: item?.UOMID },
        }));
        setItemOpen(updatedData);
      } catch (error) {
        console.error(error);
        setItemOpen([]);
      }
    } else {
      setItemOpen([]);
    }
  }, [selectedSubCategory]);

  useEffect(() => {
    if (selectedSubCategory?.SubCat_ID) {
      fetchItemsBySubCategory();
    } else {
      setItemOpen([]);
    }
  }, [selectedSubCategory, fetchItemsBySubCategory]);

  const sortedQuantityInput = useWatch({ control, name: 'SortedQty' });

  // Calculate total issued quantity from all selected items
  const totalIssuedQuantity = selectedRowDataArray.reduce(
    (sum, item) => sum + (parseFloat(item?.TotalIssueQty) || 0),
    0
  );

  useEffect(() => {
    const getNumericValue = (val) => {
      const num = parseFloat(val);

      return Number.isNaN(num) || num === null || num === undefined ? 0 : num;
    };

    const currentSortedQuantity = getNumericValue(sortedQuantityInput);
    const currentIssuedQuantity = getNumericValue(totalIssuedQuantity);

    const remaining = currentIssuedQuantity - currentSortedQuantity;

    const finalRemaining = remaining >= 0 ? remaining : 0;

    setValue('RemainingQty', finalRemaining.toFixed(2), { shouldValidate: false });
  }, [sortedQuantityInput, totalIssuedQuantity, setValue]);

  useEffect(() => {
    if (grnData && grnData.Details && grnData.Details.length > 0) {
      const uomName = grnData.Details[0].UOMName;
      const uomId = grnData.Details[0].UOMID;

      setValue('UOM', uomName, { shouldValidate: true });

      setSelectedUOMID(uomId);
    } else {
      setValue('UOM', '');

      setSelectedUOMID(null);
    }
  }, [grnData, setValue]);
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
        // console.error('Error fetching suppliers:', error);
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetchSupervisorData();
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // Fetch classes for sorted item selection
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
          `GetAllItemsFromDBByColorAndSubCat?subCatID=${selectedSortedSubCategory?.SubCat_ID}&colorId=${selectedSortedColor?.ColorID || 0
          }&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
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
        // console.error(error);
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

  useEffect(() => {
    fetchSortedItemsBySubCategory();
  }, [fetchSortedItemsBySubCategory]);



  // On Submit Ka Function
  const handleFormSubmit = (data) => {
    handleOpenDialog();
  };



  // POST bODY
  const onSubmit = handleSubmit(async (selectedOption) => {



    if (selectedRowDataArray.length === 0) {
      enqueueSnackbar('Please select at least one item from the requisition table', {
        variant: 'error',
      });
      return;
    }

    if (newRequestedDetail.length === 0) {
      enqueueSnackbar('Please add at least Waste Qty', { variant: 'error' });
      return;
    }

    const remainingQty = Number(values?.RemainingQty);
    const totalRejectionQty = Number(totalQuantitySum);

    if (totalRejectionQty > remainingQty) {
      enqueueSnackbar(
        `Total rejected quantity (${totalRejectionQty}) cannot exceed the remaining quantity (${remainingQty}).`,
        { variant: 'error' }
      );
      return;
    }

    try {
      // Format date to YYYY-MM-DD
      const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Create Details array from selected items
      const details = selectedRowDataArray.map((item) => ({
        ReqId: item.ReqID || null,
        IssueDtlID: item.IssueDtlID || null,
        IssueConfQty: parseFloat(item.TotalIssueQty) || 0,
        UOMID: item.UOMID || selectedUOMID || null,
      }));

      const dataToSend = {
        ReportDate: formatDate(values.PRDate),
        SupervisorID: values.UserId?.UserId || null,
        WorkerShiftID: values.ShiftName?.ShiftId || null,
        UOMID: selectedUOMID || null,
        TotalWorker: 0,
        OnDuty: 0,
        SortedQty: parseFloat(values.SortedQty) || 0,
        SortedRemQty: parseFloat(values.RemainingQty) || 0,
        ReasonOfRejec: values.Reason || '',
        Remarks: values.Remarks || '',
        IsApproved: false,
        ApprovedBy: null,
        ApprovalDate: null,
        TransferTo: 0,
        InvType: values.SortedClassID?.ClassID || null,
        InvCat: values.SortedCategory?.Inv_Cat_ID || null,
        InvSubCat: values.SortedSubCategory?.SubCat_ID || null,
        ColorID: values.SortedColor?.ColorID || null,
        SpareID: values.SortedInvSpare?.SpareID || null,
        SortedItemID: values.SortedItemOpen?.ItemID || null,
        CreatedBy: userData.userDetails.userId,
        Branch_ID: userData.userDetails.branchID,
        Org_ID: userData.userDetails.orgId,
        Details: details,
        WasteRejections: newRequestedDetail.map((detail) => ({
          SubcatID: detail.ItemSubCategory?.SubCat_ID || null,
          ItemID: detail.ItemOpen?.ItemID || null,
          WasteQty: parseFloat(detail.RejectedQty) || 0,
        })),
      };
      console.log(dataToSend, 'dataToSend');

      await Post(`AddSortingReport`, dataToSend).then(async (res) => {
        if (res.data.Success === false) {
          enqueueSnackbar(res.data.Message, { variant: 'error' });
        } else {
          enqueueSnackbar('Sorting Delay Report Created Successfully!');
          router.push(paths.dashboard.Production.ProductionReport.root);
          reset();
          setRequestDetails([]);
          setnewRequestedDetail([]);
        }
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error creating sorting delay report', { variant: 'error' });
    }
  })






  const AddRejecttionQty = () => {
    if (!values?.ItemSubCategory) {
      enqueueSnackbar('Waste Type are required', { variant: 'error' });
      return;
    }
    if (!values?.ItemOpen) {
      enqueueSnackbar('Item Name are required', { variant: 'error' });
      return;
    }
    if (!values?.Quantity || values.Quantity <= 0) {
      enqueueSnackbar('Quantity is required and must be a positive number', { variant: 'error' });
      return;
    }

    const remaining = parseFloat(values.RemainingQty) || 0;

    const enteredQuantity = parseFloat(values.Quantity);

    if (enteredQuantity > remaining) {
      enqueueSnackbar(
        `Quantity (${enteredQuantity}) cannot exceed the Remaining Quantity (${remaining}).`,
        { variant: 'error' }
      );
      return;
    }

    const secondDetail = {
      WasteType: values?.ItemSubCategory?.SubCat_Name,
      ItemSubCategory: values?.ItemSubCategory,

      ItemOpen: values?.ItemOpen,
      RejectedQty: values?.Quantity,
    };

    if (editingIndex !== null) {
      const updatedDetails = [...newRequestedDetail];
      updatedDetails[editingIndex] = secondDetail;
      setnewRequestedDetail(updatedDetails);
    } else {
      setnewRequestedDetail((prev) => [...prev, secondDetail]);
    }

    secondResetDetailForm();

  };

  const secondResetDetailForm = () => {
    setValue('ItemSubCategory', null);
    setValue('ItemOpen', '');
    setValue('Quantity', '');
    setEditingIndex(null);
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

  return isLoading ? (
    renderLoading
  ) : (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={2}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 2 }}>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(3, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              <Controller
                name="PRDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Report Date"
                    format="dd/MM/yyyy"
                    value={field.value || new Date()}
                    onChange={(newValue) => field.onChange(newValue)}
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
                name="UserId"
                label="Supervisior Name"
                placeholder="Choose a color"
                fullWidth
                options={allSuperVisiorName}
                getOptionLabel={(option) => option?.EmployeeName || ''}
                renderOption={(props, option) => (
                  <li {...props} key={option.UserId}>
                    {option.EmployeeName}
                  </li>
                )}
                value={values?.UserId || null}
              />

              <RHFAutocomplete
                name="ShiftName"
                label="Select Shift"
                placeholder="Choose a shift"
                fullWidth
                options={allShiftName}
                getOptionLabel={(option) => option?.ShiftName || ''}
                isOptionEqualToValue={(option, value) => option?.ShiftID === value?.ShiftID}
                renderOption={(props, option) => (
                  <li {...props} key={option.ShiftID}>
                    {option.ShiftName}
                  </li>
                )}
              />


            </Box>
          </Card>

          <Card sx={{ p: 2, mt: 1 }}>
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
                value={Array.isArray(values?.ReqCode) ? values.ReqCode : (values?.ReqCode ? [values.ReqCode] : [])}
                renderOption={(props, option, { selected }) => (
                  <li {...props} key={option.ReqCode}>
                    <Checkbox
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option?.ReqCodeWithDate || ''}
                  </li>
                )}
                renderTags={(value, getTagProps) => {
                  const limit = 2;
                  const customGreenStyle = {
                    backgroundColor: '#4F782B',
                    color: 'white',
                  };

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
                        <Chip
                          label={`+${value.length - limit} more`}
                          size="small"
                          sx={customGreenStyle}
                        />
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
              // </Card>
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
                        {fNumber(totalIssuedQuantity)}{' '}
                        {selectedRowDataArray.length > 0 && selectedRowDataArray[0]?.UOMName}
                      </Typography>
                    </Box>
                  )}
                  <TableContainer sx={{ mt: 2 }}>
                    <Scrollbar sx={{ maxHeight: '400px' }}>
                      <Table
                        size={table.dense ? 'small' : 'medium'}
                        component={Paper}
                        sx={{
                          minWidth: 460,
                          // border: 1,
                          // borderColor: '#f4f6f8',
                          // borderStyle: 'dotted',
                        }}
                      >
                        <TableHeadCustom
                          order={table.order}
                          orderBy={table.orderBy}
                          headLabel={ChallanDetailsTableHead}
                        />

                        <TableBody>
                          {grnData.Details.map((row, index) => (
                            <tr key={index}>
                              <td style={{ textAlign: 'center' }}>
                                <Checkbox
                                  checked={selectedValues.includes(row.IssueDtlID)}
                                  disabled={selectedRowDataArray.some(item => item.ItemID !== row.ItemID)}
                                  onChange={() => handleCheckboxChange(row)}
                                  color="primary"
                                />
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
                              {/* </Tooltip> */}
                              {/* <td style={{ textAlign: 'center' }}>{row.CategoryName}</td> */}
                              {/* <td style={{ textAlign: 'center' }}>{row.SubCatName}</td> */}
                              {/* <td style={{ textAlign: 'center' }}>{row.InvTypeName}</td> */}
                              <td style={{ textAlign: 'center' }}>{row.StoreName}</td>
                              <td style={{ textAlign: 'center' }}>{row.LocationName}</td>

                              <td style={{ textAlign: 'right' }}>{`${fNumber(
                                row.TotalRequestedQty
                              )} ${row.UOMName}`}</td>
                              <td style={{ textAlign: 'right' }}>{`${fNumber(row.TotalIssueQty)} ${row.UOMName
                                }`}</td>
                              {/* <td style={{ textAlign: 'right' }}>{`${fNumber(row.RemainingQty)} ${row.UOMName
                              }`}</td> */}

                              {/* <td style={{ textAlign: 'center' }}>{row.Remarks || '-'}</td> */}
                            </tr>
                          ))}

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


          <Card sx={{ p: 2, mt: 4 }}>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(4, 1fr)',
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

              <TextField
                label="Total Issued Quantity"
                value={`${fNumber(totalIssuedQuantity || 0)}`}
                disabled
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      {selectedRowDataArray.length > 0
                        ? (selectedRowDataArray[0]?.UOMName || 'Unit')
                        : 'Unit'}
                      {selectedRowDataArray.length > 1 && ` (${selectedRowDataArray.length} items)`}
                    </InputAdornment>
                  ),
                }}
                helperText={
                  selectedRowDataArray.length > 0
                    ? `${selectedRowDataArray.length} item(s) selected`
                    : 'Please select item(s) from the requisition table'
                }
              />

              <RHFTextField
                name="SortedQty"
                label="Sorted Quantity"
                type="number"
                disabled={selectedRowDataArray.length === 0}
                placeholder={selectedRowDataArray.length === 0 ? 'Please select item(s) first' : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {selectedRowDataArray.length > 0
                        ? (selectedRowDataArray[0]?.UOMName || 'Unit')
                        : 'Unit'}
                    </InputAdornment>
                  ),
                }}
                helperText={
                  selectedRowDataArray.length === 0
                    ? 'First Select item(s) from the requisition table to enable this field'
                    : `Total issued: ${fNumber(totalIssuedQuantity)}`
                }
                onBlur={(e) => {
                  const sortedQty = parseFloat(e.target.value);

                  if (sortedQty > totalIssuedQuantity) {
                    enqueueSnackbar(
                      `Sorted Quantity cannot exceed the total Issued Quantity (${fNumber(totalIssuedQuantity)})`,
                      {
                        variant: 'error',
                      }
                    );
                    setValue('SortedQty', totalIssuedQuantity || 0);
                  }
                }}
              />

              <TextField
                label="Remaining Quantity"
                value={fNumber(values.RemainingQty) || '0.00'}
                disabled
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      {selectedRowDataArray.length > 0
                        ? (selectedRowDataArray[0]?.UOMName || 'Unit')
                        : 'Unit'}
                    </InputAdornment>
                  ),
                }}
              />

              <RHFTextField name="Reason" label="Reasons For Rejection" />
              <RHFTextField name="Remarks" label="Enter Remarks (Optional)" />
            </Box>
          </Card>

          <Card sx={{ p: 2, mt: 2 }}>
            <h3>Waste</h3>

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
                name="ItemSubCategory"
                label="Select Waste Type"
                placeholder="Choose an option"
                fullWidth
                options={itemSubCategory}
                getOptionLabel={(option) => option?.SubCat_Name || ''}
                value={values?.ItemSubCategory || null}
              />
              <RHFAutocomplete
                name="ItemOpen"
                label="Item Name"
                placeholder="Choose an option"
                fullWidth
                options={ItemOpen}
                getOptionLabel={(option) => option?.ItemDescription || ''}
                isOptionEqualToValue={(option, value) => option.ItemID === value.ItemID}
                value={values?.ItemOpen || null}
              />

              <RHFTextField
                name="Quantity"
                label="Quantity"
                type="number"
                InputProps={
                  values?.ItemOpen?.UOMName
                    ? {
                      endAdornment: (
                        <InputAdornment position="end">
                          {values?.ItemOpen?.UOMName}
                        </InputAdornment>
                      ),
                    }
                    : {}
                }
              />
            </Box>
            <Stack alignItems="flex-end" direction="row-reverse" sx={{ my: 3, gap: 2 }}>
              <Button color="primary" onClick={AddRejecttionQty} variant="contained">
                {editingIndex !== null ? 'Update' : 'Add'}
              </Button>
              {editingIndex !== null && (
                <Button color="error" onClick={secondResetDetailForm} variant="outlined" sx={{ mt: 1 }}>
                  Cancel
                </Button>
              )}
            </Stack>

            {newRequestedDetail.length > 0 && (
              <TableContainer>
                <Scrollbar sx={{ maxHeight: '400px' }}>
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
                      headLabel={WasteTable}
                    />

                    <TableBody>
                      {newRequestedDetail.map((row, index) => (
                        <ProductionReportSecondTable
                          key={index}
                          row={row}
                          onDeleteRow={() => DeleteDetailTableRowForSecond(row)}
                        />
                      ))}

                      <TableEmptyRows
                        height={denseHeight}
                        emptyRows={emptyRows(
                          table.page,
                          table.rowsPerPage,
                          newRequestedDetail.length
                        )}
                      />
                    </TableBody>
                  </Table>
                </Scrollbar>
                <TableFooter>
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      align="left"
                      sx={{
                        fontWeight: 'normal',
                        color: '#637381',
                        fontSize: '14px',
                      }}
                    >
                      {/* Total Remaining Quantity : {fNumber(values?.RemainingQty)}{' '} */}
                      {/* {selectedRowDataArray.length > 0 ? selectedRowDataArray[0]?.UOMName : ''} */}
                      <br />
                      Total Quantity :{' '}
                      <span
                        style={{
                          color: totalQuantitySum > values?.RemainingQty ? '#FF4842' : 'inherit',

                          fontWeight: totalQuantitySum > values?.RemainingQty ? 'bold' : 'normal',
                        }}
                      >
                        {fNumber(totalQuantitySum)}
                      </span>{' '}
                      {selectedRowDataArray.length > 0 ? selectedRowDataArray[0]?.UOMName : ''}
                    </TableCell>
                  </TableRow>
                </TableFooter>
                <TableRow>
                  {totalQuantitySum > values?.RemainingQty && (
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{
                        color: '#FF1A38',

                        fontWeight: 'bold',
                        py: 1.5,
                      }}
                    >
                      Alert : Total Rejection Qty Cannot exceed the Remaining Quantity of Item!
                    </TableCell>
                  )}
                </TableRow>
              </TableContainer>
            )}
          </Card>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton
              type='submit'
              variant="contained"
              color="primary"
              loading={isSubmitting}
            >
              Save
            </LoadingButton>
          </Stack>
          <ConfirmationDialog open={dialogOpen} onClose={handleCloseDialog} onConfirm={onSubmit} />
        </Grid>
      </Grid>
    </FormProvider>
  );
}
