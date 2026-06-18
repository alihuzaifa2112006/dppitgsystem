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
import ItemDialog from './ItemDialog';
import MRPDialog from './MRPDialog';
import { AgGridReact } from 'ag-grid-react';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';
import { maxWidth } from '@mui/system';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

// ----------------------------------------------------------------------

export default function ProductRequestCreateForm() {
  const router = useRouter();
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  // console.log(userData);

  const [allParticularsData, setallParticularsData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [RequestDetails, setRequestDetails] = useState([]);
  const [allCategoryData, setallCategoryData] = useState([]);

  const [itemSubCategory, setItemSubCategory] = useState([]);
  const [allItemUnit, setallItemUnit] = useState([]);
  const [allColors, setallColors] = useState([]);
  const [allInvSpare, setallInvSpare] = useState([]);

  const [allClassName, setallClassName] = useState([]);
  const [ItemOpen, setItemOpen] = useState([]);
  const [allMRPData, setAllMRPData] = useState([]);
  const [allPurchaseTypes, setAllPurchaseTypes] = useState([]);

  const [toRequestdata, settoRequestdata] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [allSections, setAllSections] = useState([]);
  const [allLineNumbers, setAllLineNumbers] = useState([]);

  const [selectedRows, setSelectedRows] = useState([]);

  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [itemData, setItemData] = useState([]);

  const [mrpDialogOpen, setMrpDialogOpen] = useState(false);
  const [mrpItems, setMrpItems] = useState([]);
  const [mrpDetailsLoading, setMrpDetailsLoading] = useState(false);

  const handleItemOpen = () => {
    setOpenItemDialog(true);
  };

  const handleItemClose = () => {
    setOpenItemDialog(false);
  };

  const NewProductRequestSchema = Yup.object().shape({
    PRDate: Yup.date().required('PR Date is required').nullable(),
    Section: Yup.object(),
    Department: Yup.object(),
    Request: Yup.object().required('Request is required'),
    LineNo: Yup.object().when('Section', {
      is: (value) => value?.SectionID === 24 || value?.SectionID === 29 || value?.SectionID === 35,
      then: () => Yup.object().required('Line No is required'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
    RequestType: Yup.object().required('Request Type is required'),
    MRP: Yup.object().when('RequestType', {
      is: (value) => value?.PurchaseTypeID !== 1,
      then: () => Yup.object().required('MRP is required'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
  });

  const methods = useForm({
    resolver: yupResolver(NewProductRequestSchema),
    defaultValues: {
      PRDate: new Date(),
      Section: null,
      Department: null,
      LineNo: null,
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

  // Table Heads
  const DetailsTableHead = [
    { id: 'ClassID', label: 'Inventory Type', minWidth: 150, align: 'center' },
    { id: 'Inv_Cat_Name', label: 'Item Category', minWidth: 150, align: 'center' },
    { id: 'ItemSubCategory', label: 'Item Sub Category', minWidth: 150, align: 'center' },
    { id: 'Color', label: 'Color', minWidth: 150, align: 'center' },
    { id: 'ItemOpen', label: 'Item', minWidth: 250, align: 'center' },
    { id: 'RQ', label: 'Required Qty', minWidth: 100, align: 'center' },
    { id: 'UOMID', label: 'Unit', minWidth: 100, align: 'center' },
    { id: 'Remarks', label: 'Remarks', minWidth: 200, align: 'center' },
    { id: 'Actions', label: 'Actions', minWidth: 100, align: 'center' },
  ];

  // Table
  const table = useTable();

  const notFound = !RequestDetails.length;
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

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = RequestDetails.filter((row) => row !== rowToDelete);
    setRequestDetails(updatedDetails);

    if (editingIndex !== null && RequestDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);
      setValue('VendorID', null);
      setValue('ChallanNo', '');
      setValue('TotalBags', '');
      setValue('RQ', '');
      setValue('IQ', '');
      setValue('Remarks', '');
    }
  };

  const fetchSectionsByDepartment = useCallback(
    async (deptId) => {
      if (deptId) {
        try {
          const response = await Get(
            `GetSectionsByDept?deptId=${deptId}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
          );
          setAllSections(response.data || []);
        } catch (error) {
          console.error('Error fetching sections:', error);
          setAllSections([]);
        }
      } else {
        setAllSections([]);
      }
    },
    [userData?.userDetails?.orgId, userData?.userDetails?.branchID]
  );

  const fetchAllLineNumbers = useCallback(async () => {
    const sectionId = userData?.userDetails?.SectionID;

    if (sectionId) {
      try {
        const response = await Get(
          `GetAllLineNo?org=${userData?.userDetails?.orgId}&branch=${userData?.userDetails?.branchID}&sectionId=${sectionId}`
        );

        const lineData = response.data.data || [];
        setAllLineNumbers(lineData);
      } catch (error) {
        console.error('Error fetching line numbers:', error);
      }
    }
  }, [userData?.userDetails]);

  useEffect(() => {
    if (userData?.userDetails) {
      const department = {
        DepId: userData.userDetails.DepId,
        DepartmentName: userData.userDetails.DepartmentName,
      };
      const sections = {
        SectionID: userData.userDetails.SectionID,
        SectionName: userData.userDetails.SectionName,
      };
      setValue('Department', department);
      setValue('Section', sections);

      fetchSectionsByDepartment(userData.userDetails.DepId);
      fetchAllLineNumbers();
    }
  }, [userData, setValue, fetchSectionsByDepartment, fetchAllLineNumbers]);

  const selectedDepartment = watch('Department');

  useEffect(() => {
    if (selectedDepartment?.DepId) {
      fetchSectionsByDepartment(selectedDepartment.DepId);
    } else {
      setAllSections([]);
    }
  }, [selectedDepartment, fetchSectionsByDepartment]);

  const handleEditDetail = (index) => {
    setIsEditing(true);
    const detail = RequestDetails[index];

    setValue('ClassID', detail?.ClassID || null);
    setValue('Inv_Cat_Name', detail?.Inv_Cat_Name || null);
    setValue('ItemSubCategory', detail?.ItemSubCategory || null);
    setValue('Color', detail?.Color || null);
    setValue('ItemOpen', detail?.ItemOpen || null);
    setValue('UOMID', detail?.UOMID || null);
    setValue('RQ', detail?.RQ || '');
    setValue('Remarks', detail?.Remarks || '');

    setEditingIndex(index);
    setTimeout(() => setIsEditing(false), 100);
  };

  useEffect(() => {
    const fetchRequestedData = async () => {
      try {
        const response = await Get(
          `GetAllStorelocations?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        settoRequestdata(response.data || []);
        setValue('Request', response.data[0], { shouldValidate: true });
      } catch (error) {
        console.error(error);
      }
    };

    fetchRequestedData();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, setValue]);

  useEffect(() => {
    const fetchMRPDropdown = async () => {
      try {
        const response = await Get(
          `Production/GetMRPDropdown?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setAllMRPData(response.data.Data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMRPDropdown();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchPurchaseTypes = async () => {
      try {
        const response = await Get(
          `getallPurchasetypes?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        const data = response.data || [];
        setAllPurchaseTypes(data);

        // Set default value to "Independent"
        const independentType = data.find((item) => item.PurposeTypes === 'Independent');
        if (independentType) {
          setValue('RequestType', independentType);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetchPurchaseTypes();
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, setValue]);

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
    const AllClassNameData = async () => {
      try {
        const response = await Get(
          `GetClassesByuserid?UserID=${userData?.userDetails?.userId}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setallClassName(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    AllClassNameData();
  }, [userData?.userDetails]);

  const selectedClassId = watch('ClassID');

  const FetchAllCategoryData = useCallback(async () => {
    if (selectedClassId?.ClassID) {
      try {
        const response = await Get(
          `GetCategoriesByUserIDFrmMiddleware?userID=${userData?.userDetails?.userId}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        const updatedData = response.data
          .filter((item) => item.ClassID === selectedClassId?.ClassID)
          .map((item) => ({
            ...item,
            Inv_Cat_Name: item?.CategoryName,
            Inv_Cat_ID: item?.CategoryID,
          }));
        setallCategoryData(updatedData || []);
      } catch (error) {
        console.error(error);
      }
    } else {
      setallCategoryData([]);
    }
  }, [userData?.userDetails, selectedClassId?.ClassID]);

  useEffect(() => {
    FetchAllCategoryData();
    // if (!isEditing) {
    setValue('Inv_Cat_Name', null);
    setValue('ItemSubCategory', null);
    setValue('ItemCode', null);
    setValue('ItemName', null);
    setValue('Color', null);
    setValue('InvSpare', null);
    setallInvSpare([]);
    setallColors([]);
    setItemData([]);
    // }
  }, [selectedClassId?.ClassID, FetchAllCategoryData, setValue, isEditing]);

  const selectedCategory = watch('Inv_Cat_Name');

  const fetchSubCategory = useCallback(async () => {
    if (selectedCategory?.Inv_Cat_ID) {
      try {
        const response = await Get(`GetSubCategoriesByCategoryID/${selectedCategory.Inv_Cat_ID}`);
        setItemSubCategory(response.data.data);
      } catch (error) {
        console.error(error);
      }
    } else {
      setItemSubCategory([]);
    }
  }, [selectedCategory?.Inv_Cat_ID]);

  useEffect(() => {
    fetchSubCategory();
    if (!isEditing) {
      setValue('ItemSubCategory', null);
      setItemData([]);
    }
  }, [selectedCategory, fetchSubCategory, setValue, isEditing]);

  const selectedSubCategory = watch('ItemSubCategory');
  const selectedColor = watch('Color');
  const selectedSpare = watch('InvSpare');

  const fetchItemsBySubCategory = useCallback(async () => {
    if (selectedSpare?.SpareID && selectedClassId?.isColorSensitive === false) {
      try {
        const response = await Get(
          `GetItemsBySpareID?spareId=${selectedSpare?.SpareID}&subCatID=${selectedSubCategory?.SubCat_ID}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
        );

        const updatedData = response?.data?.map((item) => ({
          ...item,
          ClassID: item?.invTypesID,
          CodeAndDescription: `[${item?.ItemCode}]  ${item?.ItemDescription}`,
          UOM: { UOMName: item?.UOMName || item?.UOMNAME, UOM_ID: item?.UOMID },
        }));
        setItemOpen(updatedData);
      } catch (error) {
        console.error(error);
        setItemOpen([]);
        setallColors([]);
        setItemData([]);
      }
    } else if (selectedSubCategory?.SubCat_ID && selectedClassId?.isColorSensitive === true) {
      try {
        const response = await Get(
          `GetAllItemsFromDBByColorAndSubCat?subCatID=${selectedSubCategory?.SubCat_ID}&colorId=${
            selectedColor?.ColorID || 0
          }&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        const updatedData = response?.data?.map((item) => ({
          ...item,
          // ClassID: item?.invTypesID,
          CodeAndDescription: `[${item?.ItemCode}]  ${item?.ItemDescription}`,
          UOM: {
            UOM_ID: item?.UOMID,
            UOMName: item?.UOMNAME,
          },
        }));
        setItemOpen(updatedData);
      } catch (error) {
        console.error(error);
        setItemOpen([]);
      }
      setValue('ItemOpen', null);
      setItemData([]);
    } else {
      setItemOpen([]);
      setItemData([]);
    }
  }, [
    selectedSubCategory,
    selectedColor,
    userData?.userDetails,
    selectedSpare,
    selectedClassId?.isColorSensitive,
    setValue,
  ]);

  const GetColors = useCallback(async () => {
    try {
      const response = await Get(
        `GetColorsBySubCatFromItemDB?subCatId=${selectedSubCategory?.SubCat_ID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setallColors(response.data.data);
    } catch (error) {
      console.log(error);
      setallColors([]);
      setItemData([]);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    selectedSubCategory?.SubCat_ID,
  ]);

  const FetchAllSpareByClassID = useCallback(async () => {
    if (selectedSubCategory?.SubCat_ID) {
      try {
        const response = await Get(
          `GetSpareBySubcateID?SubcatID=${selectedSubCategory?.SubCat_ID}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
        );
        setallInvSpare(response.data || []);
      } catch (error) {
        console.error(error);
        setallInvSpare([]);
      }
    } else {
      setallInvSpare([]);
      setItemData([]);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    selectedSubCategory?.SubCat_ID,
  ]);

  useEffect(() => {
    // fetchItemsBySubCategory();
    if (selectedSubCategory?.SubCat_ID && selectedClassId?.isColorSensitive === true) {
      GetColors();
    } else {
      FetchAllSpareByClassID();
    }
    if (editingIndex === null) {
      setValue('ItemOpen', null);
      setValue('Color', null);
      setValue('InvSpare', null);
    }
    // eslint-disable-next-line
  }, [selectedSubCategory, FetchAllSpareByClassID, GetColors, editingIndex, selectedClassId]);

  useEffect(() => {
    if (selectedColor?.ColorID || selectedSpare?.SpareID) {
      fetchItemsBySubCategory();
      if (editingIndex === null) {
        setValue('ItemOpen', null);
      }
    }
  }, [selectedColor, selectedSpare, fetchItemsBySubCategory, setValue, editingIndex]);

  const selectedItem = watch('ItemOpen');
  useEffect(() => {
    if (selectedItem) {
      setValue('UOMID', selectedItem.UOM);
    }
  }, [selectedItem, setValue]);

  useEffect(() => {
    const generateProductRequestNickName = () => {
      const nickname = `${values?.ProductRequestName || ''} ${values?.ProductRequest_Code || ''}`;
      setValue('ProductRequestNickName', nickname || '');
    };
    generateProductRequestNickName();
  }, [values.ProductRequestName, values.ProductRequest_Code, setValue]);

  const handleMRPOpen = async () => {
    if (values?.MRP?.MRPID) {
      try {
        const response = await Get(`yarn-production/mrp-data/${values.MRP.MRPID}`);
        if (response.data.Success) {
          setMrpItems(response.data.Data);
          setMrpDialogOpen(true);
        } else {
          enqueueSnackbar('Failed to fetch MRP data', { variant: 'error' });
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Error fetching MRP data', { variant: 'error' });
      }
    }
  };

  // When PurchaseTypeID === 2 and MRP is selected: fetch MRP items, then GRN/Transaction by itemIds, populate grid
  useEffect(() => {
    const purchaseTypeId = values?.RequestType?.PurchaseTypeID;
    const mrpId = values?.MRP?.MRPID;
    const requestToStore = values?.Request;

    if (purchaseTypeId !== 2) return;

    if (!mrpId) {
      setRequestDetails([]);
      return;
    }

    if (!requestToStore?.StoreID) {
      setRequestDetails([]);
      return;
    }

    const selectedStoreID = requestToStore.StoreID;
    let cancelled = false;
    setMrpDetailsLoading(true);

    const loadMrpDetails = async () => {
      try {
        const mrpRes = await Get(`yarn-production/mrp-data/${mrpId}`);
        if (cancelled || !mrpRes?.data?.Success) return;
        const mrpData = mrpRes.data.Data || [];
        const itemIds = [...new Set(mrpData.map((d) => d.ItemID).filter(Boolean))];
        if (itemIds.length === 0) {
          setRequestDetails([]);
          return;
        }
        const orgId = userData?.userDetails?.orgId;
        const branchId = userData?.userDetails?.branchID;
        const grnRes = await Get(
          `GetAllItemTransandGRNMultiple?orgId=${orgId}&branchId=${branchId}&itemIds=${itemIds.join(',')}`
        );
        if (cancelled) return;
        const grnDataRaw = grnRes?.data?.Data || [];
        // Filter by selected "Request To" store (e.g. Simco or Pacific) so only rows from that store are shown
        const grnData = grnDataRaw.filter((row) => Number(row.StoreID) === Number(selectedStoreID));

        // Show all GRN/Transaction rows; user can delete or edit as needed
        const rows = grnData.map((row, index) => ({
          ...row,
          key: `mrp-${mrpId}-${row.GRNDtlID ?? row.ItemOpenDtlID}-${row.ItemID}-${row.StoreID ?? ''}-${row.LocationID ?? ''}-${index}`,
          RequestQty: 0,
          TotalBale: row.TotalBale ?? 0,
        }));

        // Pre-fill RequestQty on one row per MRP item when that row has remaining >= required
        const assignedRowKeys = new Set();
        mrpData.forEach((mrpRow) => {
          const requiredQty = Number(mrpRow.BalanceQtyKG ?? mrpRow.RequiredQtyKG) || 0;
          if (requiredQty <= 0) return;
          const candidate = rows.find(
            (r) =>
              r.ItemID === mrpRow.ItemID &&
              (Number(r.issueRemainingQty) || 0) >= requiredQty &&
              !assignedRowKeys.has(r.key)
          );
          if (candidate) {
            const remaining = Number(candidate.issueRemainingQty) || 0;
            candidate.RequestQty = Math.min(requiredQty, remaining);
            assignedRowKeys.add(candidate.key);
          }
        });

        setRequestDetails(rows);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          enqueueSnackbar('Failed to load MRP items for request', { variant: 'error' });
          setRequestDetails([]);
        }
      } finally {
        if (!cancelled) setMrpDetailsLoading(false);
      }
    };

    loadMrpDetails();
    // eslint-disable-next-line
    return () => {
      cancelled = true;
    };
  }, [values?.RequestType?.PurchaseTypeID, values?.MRP?.MRPID, values?.Request, userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    try {
      if (RequestDetails.length === 0) {
        enqueueSnackbar('Please add at least one request detail', { variant: 'error' });
        return;
      }
      // all the RequestDetails.RequestQty should be greater than 0
      const hasZeroQty = RequestDetails.some(
        (detail) => !detail.RequestQty || detail.RequestQty === 0
      );
      if (hasZeroQty) {
        enqueueSnackbar('Please enter a request quantity greater than 0 for all items', {
          variant: 'error',
        });
        return;
      }

      const requestData = {
        ReqDate: fDate(data?.PRDate, 'yyyy-MM-dd'),
        DeptID: data?.Department?.DepId,
        SectionID: data?.Section?.SectionID,
        LineID: data?.LineNo?.LineID || 0,
        RequestTo: data?.Request?.StoreID || 0,
        CreatedBy: userData.userDetails.userId,
        Org_Id: userData.userDetails.orgId,
        Branch_Id: userData.userDetails.branchID,
        MRPID: values?.RequestType?.PurchaseTypeID !== 1 ? values?.MRP?.MRPID : 0,
        RequesttypeID: values?.RequestType?.PurchaseTypeID || 0,
        Details: RequestDetails.map((detail) => ({
          InvTypeID: detail.InvTypeID,
          CategoryID: detail.Inv_Cat_ID,
          SubCatID: detail.SubCat_ID,
          ItemID: detail.ItemID,
          UOMID: detail.UOMID,
          Remarks: detail.Remarks || '',
          GRNID: detail.GRNID || 0,
          GRNDtlID: detail.GRNDtlID || 0,
          ItemOpenID: detail.ItemOpenID || 0,
          TotalBale: detail?.TotalBale || 0,
          ItemOpenDtlID: detail.ItemOpenDtlID || 0,
          TotalQty: Number(detail?.ReceiveQty || detail?.OpenStockQty),
          TotalRequestedQty: Number(detail.RequestQty),
          RemainingQty: Number(detail.RemainingQty),
          VendorID: detail.VendorID || 0,
          StoreID: detail.StoreID || 0,
          LocationID: detail.LocationID || 0,
          TrackingID: detail.TrackingID || null,
          CreatedBy: userData.userDetails.userId,
          Org_Id: userData.userDetails.orgId,
          Branch_Id: userData.userDetails.branchID,
          SourceType: detail.SourceType,
        })),
      };
      // console.log('requestData', requestData);

      const response = await Post(`AddReq`, requestData);

      if (response.status !== 200) {
        enqueueSnackbar(response.data.Message || 'Failed to create request', { variant: 'error' });
      } else {
        enqueueSnackbar('Request created successfully!', { variant: 'success' });
        router.push(paths.dashboard.Production.ProductRequest.root);
        reset();
        setRequestDetails([]);
      }
    } catch (error) {
      console.error('Error details:', error);
    }
  });

  // const handleAddDetail = () => {
  //   if (!values?.ClassID) {
  //     enqueueSnackbar('Inventory Type is required', { variant: 'error' });
  //     return;
  //   }
  //   if (!values?.Inv_Cat_Name) {
  //     enqueueSnackbar('Item Category is required', { variant: 'error' });
  //     return;
  //   }
  //   if (!values?.ItemSubCategory) {
  //     enqueueSnackbar('Item Sub Category is required', { variant: 'error' });
  //     return;
  //   }
  //   if (selectedClassId?.isColorSensitive && !values?.Color) {
  //     enqueueSnackbar('Color is required', { variant: 'error' });
  //     return;
  //   }
  //   if (!values?.ItemOpen) {
  //     enqueueSnackbar('Item is required', { variant: 'error' });
  //     return;
  //   }
  //   if (!values?.RQ) {
  //     enqueueSnackbar('Quantity is required', { variant: 'error' });
  //     return;
  //   }
  //   // if (!values?.Remarks) {
  //   //   enqueueSnackbar('Remarks are required', { variant: 'error' });
  //   //   return;
  //   // }

  //   const newDetail = {
  //     ClassID: values.ClassID,
  //     Inv_Cat_Name: values.Inv_Cat_Name,
  //     Color: values?.Color || null,
  //     ItemSubCategory: values.ItemSubCategory,
  //     ItemOpen: values.ItemOpen,
  //     UOMID: values.UOMID,
  //     RQ: values.RQ,
  //     Remarks: values.Remarks,
  //   };

  //   if (editingIndex !== null) {
  //     const updatedDetails = [...RequestDetails];
  //     updatedDetails[editingIndex] = newDetail;
  //     setRequestDetails(updatedDetails);
  //     console.log('Updated existing detail');
  //   } else {
  //     setRequestDetails((prev) => [...prev, newDetail]);
  //     console.log('Added new detail');
  //   }

  //   resetDetailForm();
  // };

  const handleAddDetail = (rows) => {
    setRequestDetails((prev) => {
      const merged = [...prev, ...rows];
      const unique = merged.filter(
        (row, index, self) => index === self.findIndex((r) => r.key === row.key) // change key to your unique field
      );
      return unique;
    });

    setOpenItemDialog(false);
    setSelectedRows([]);
  };

  const handleCellValueChanged = useCallback((params) => {
    // Get all row data from the grid
    const allRowData = [];
    params.api.forEachNode((node) => {
      allRowData.push(node.data);
    });
    // Update the RequestDetails state with the updated grid data
    setRequestDetails(allRowData);
  }, []);

  const resetDetailForm = () => {
    setValue('ClassID', null);
    setValue('Inv_Cat_Name', null);
    setValue('ItemSubCategory', null);
    setValue('ItemOpen', null);
    setValue('UOMID', null);
    setValue('Color', null);
    setValue('RQ', '');
    setValue('Remarks', '');

    setEditingIndex(null);
    setIsEditing(false);
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
  // AG Grid column definitions
  const columnDefs =
    values?.Section?.SectionID === 24 ||
    values?.Section?.SectionID === 29 ||
    values?.Section?.SectionID === 35
      ? [
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
            field: 'issueRemainingQty',
            headerName: 'Remaining Stock Qty',
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
            field: 'TotalBale',
            headerName: 'Total Bale',
            width: 150,
            filter: true,
            editable: true,
            sortable: true,
            type: 'numericColumn',
            cellStyle: {
              backgroundColor: 'rgba(99, 145, 58, 0.05)',
              textAlign: 'right',
            },
            valueSetter: (params) => {
              const newValue = Number(params.newValue);
              // If user input is not a number, reject
              if (Number.isNaN(newValue)) return false;
              params.data.TotalBale = newValue;
              return true; // tells ag-grid to update
            },
            valueFormatter: (params) => fNumber(params.value, 0) || '0',
          },
          {
            field: 'RequestQty',
            headerName: 'Request Qty',
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
              const remaining = Number(params.data.issueRemainingQty);

              // If user input is not a number, reject
              if (Number.isNaN(newValue)) return false;

              // Enforce max condition
              if (newValue > remaining) {
                params.data.RequestQty = remaining; // cap at issueRemainingQty
              } else {
                params.data.RequestQty = newValue;
              }
              return true; // tells ag-grid to update
            },
            valueFormatter: (params) => {
              const unit = params.data?.UOMName || '';
              return `${fNumber(params.value) || '0'} ${unit}`;
            },
          },
          {
            field: 'StoreName',
            headerName: 'Store',
            minWidth: 100,
            filter: 'agTextColumnFilter',
            valueFormatter: (params) => params.value || '-',
          },
          {
            field: 'LocationName',
            headerName: 'Storage Location',
            minWidth: 100,
            filter: 'agTextColumnFilter',
            valueFormatter: (params) => params.value || '-',
          },
          {
            field: 'action',
            headerName: 'Action',
            width: 80,
            sortable: false,
            filter: false,
            cellRenderer: (params) => (
              <IconButton
                size="small"
                onClick={() => DeleteDetailTableRow(params.data)}
                sx={{ color: 'error.main' }}
              >
                <Iconify icon="mingcute:delete-2-line" />
              </IconButton>
            ),
          },
        ]
      : [
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
            field: 'issueRemainingQty',
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

          {
            field: 'RequestQty',
            headerName: 'Request Qty',
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
              const remaining = Number(params.data.issueRemainingQty);

              // If user input is not a number, reject
              if (Number.isNaN(newValue)) return false;

              // Enforce max condition
              if (newValue > remaining) {
                params.data.RequestQty = remaining; // cap at issueRemainingQty
              } else {
                params.data.RequestQty = newValue;
              }
              return true; // tells ag-grid to update
            },
            valueFormatter: (params) => {
              const unit = params.data?.UOMName || '';
              return `${fNumber(params.value) || '0'} ${unit}`;
            },
          },
          {
            field: 'StoreName',
            headerName: 'Store',
            minWidth: 100,
            filter: 'agTextColumnFilter',
            valueFormatter: (params) => params.value || '-',
          },
          {
            field: 'LocationName',
            headerName: 'Storage Location',
            minWidth: 100,
            filter: 'agTextColumnFilter',
            valueFormatter: (params) => params.value || '-',
          },
          {
            field: 'action',
            headerName: '',
            maxWidth: 60,
            pinned: 'right',
            sortable: false,
            filter: false,
            cellRenderer: (params) => (
              <IconButton
                size="small"
                onClick={() => DeleteDetailTableRow(params.data)}
                sx={{ color: 'error.main' }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={16} height={16} />
              </IconButton>
            ),
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
            <h3>Material Requisition</h3>
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
                name="PRDate"
                control={control}
                defaultValue={new Date()}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Request Date"
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

              <RHFTextField
                name="Department"
                label="Department"
                fullWidth
                value={values?.Department?.DepartmentName || ''}
                disabled
              />
              <RHFTextField
                name="Section"
                label="Section"
                fullWidth
                value={values?.Section?.SectionName || ''}
                disabled
              />

              {(values?.Section?.SectionID === 24 ||
                values?.Section?.SectionID === 29 ||
                values?.Section?.SectionID === 35) && (
                <RHFAutocomplete
                  name="LineNo"
                  label="Line No"
                  placeholder="Choose a section"
                  fullWidth
                  options={allLineNumbers}
                  getOptionLabel={(option) => option?.LineNo || ''}
                  value={values?.LineNo}
                />
              )}
              {/* <RHFAutocomplete
                name="Section"
                label="Section"
                placeholder="Choose a section"
                fullWidth
                options={allSections}
                getOptionLabel={(option) => option?.SectionName || ''}
                isOptionEqualToValue={(option, value) => option.SectionID === value.SectionID}
                renderOption={(props, option) => (
                  <li {...props} key={option.SectionID}>
                    {option.SectionName}
                  </li>
                )}
              /> */}

              <RHFAutocomplete
                name="Request"
                label="Request To"
                placeholder="Choose an option"
                fullWidth
                options={toRequestdata}
                getOptionLabel={(option) => option?.StoreName || ''}
                isOptionEqualToValue={(option, value) => option.StoreID === value.StoreID}
                value={values?.Request}
                disabled={RequestDetails.length > 0}
              />

              <RHFAutocomplete
                name="RequestType"
                label="Request Type"
                placeholder="Choose an option"
                fullWidth
                options={allPurchaseTypes}
                getOptionLabel={(option) => option?.PurposeTypes || ''}
                isOptionEqualToValue={(option, value) =>
                  option.PurchaseTypeID === value.PurchaseTypeID
                }
                value={values?.RequestType || null}
                disabled={RequestDetails.length > 0}
              />
              {values?.RequestType?.PurposeTypes !== 'Independent' && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <RHFAutocomplete
                    name="MRP"
                    label="MRP"
                    placeholder="Choose an option"
                    fullWidth
                    options={allMRPData}
                    getOptionLabel={(option) => option?.MRPNo || ''}
                    isOptionEqualToValue={(option, value) => option.MRPID === value.MRPID}
                    value={values?.MRP || null}
                    disabled={RequestDetails.length > 0}
                  />
                  <Tooltip title="View MRP" placement="top">
                    <IconButton
                      sx={{ width: 40, height: 40 }}
                      color="primary"
                      onClick={() => handleMRPOpen()}
                      disabled={!values?.MRP}
                    >
                      <Iconify icon="ph:eye-duotone" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          </Card>

          {/* Rest of your form remains the same */}
          <Card sx={{ p: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Inventory Information</h3>
              {values?.RequestType?.PurchaseTypeID !== 2 && (
                <Tooltip title="Select Items" placement="top">
                  <Button
                    onClick={() => handleItemOpen()}
                    variant="contained"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    disabled={!values?.Request}
                    color="primary"
                  >
                    Add Items
                  </Button>
                </Tooltip>
              )}
            </Box>
            {/* <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              }}
            >
              <RHFAutocomplete
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
                name="ItemSubCategory"
                label="Select Item Sub Category"
                placeholder="Choose an option"
                fullWidth
                options={itemSubCategory}
                getOptionLabel={(option) => option?.SubCat_Name || ''}
                isOptionEqualToValue={(option, value) => option?.SubCat_ID === value?.SubCat_ID}
                value={values?.ItemSubCategory || null}
              />
              {selectedClassId?.isColorSensitive && (
                <RHFAutocomplete
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

              <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <RHFAutocomplete
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

                   <Tooltip title="Recieve Qu" placement="top">
                    <IconButton color="primary" onClick={() => handleItemOpen()}>
                      <Iconify icon="lets-icons:eye-duotone" width={24} height={24} />
                    </IconButton>
                  </Tooltip> 
                </Stack>
              </Box>
              <RHFTextField type="number" name="RQ" label="Quantity" />
              {/* <RHFAutocomplete
                name="UOMID"
                label="Unit of Measurement"
                placeholder="Choose an option"
                fullWidth
                options={allItemUnit}
                getOptionLabel={(option) => option?.UOMName || ''}
                isOptionEqualToValue={(option, value) => option?.UOM_ID === value?.UOM_ID}
                value={values?.UOMID || null}
              /> 
              <RHFTextField
                name="Remarks"
                label="Remarks"
                sx={{ gridColumn: { sm: 'span 2', md: 'span 2' } }}
              />
            </Box> */}
            {/* <Stack alignItems="flex-end" direction="row-reverse" sx={{ my: 3, gap: 2 }}>
              <Button color="primary" onClick={handleAddDetail} variant="contained">
                {editingIndex !== null ? 'Update' : 'Add'}
              </Button>
              {editingIndex !== null && (
                <Button color="error" onClick={resetDetailForm} variant="outlined" sx={{ mt: 1 }}>
                  Cancel
                </Button>
              )}
            </Stack> */}

            {/* AG Grid Container */}
            {values?.RequestType?.PurchaseTypeID === 2 && mrpDetailsLoading && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading MRP items…
              </Typography>
            )}
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
                onCellValueChanged={handleCellValueChanged}
                onGridReady={(params) => {
                  params.api.sizeColumnsToFit();
                }}
                onFirstDataRendered={(params) => {
                  params.api.sizeColumnsToFit();
                }}
              />
            </Box>

            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
              <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" justifyContent="space-between">
                <Box display="flex" gap={2}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, ml: 2 }}>
                    Total Remaining Qty:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {fNumber(
                      RequestDetails.reduce(
                        (sum, item) => sum + (Number(item.issueRemainingQty) || 0),
                        0
                      )
                    )}
                  </Typography>
                </Box>
                {(values?.Section?.SectionID === 24 ||
                  values?.Section?.SectionID === 29 ||
                  values?.Section?.SectionID === 35) && (
                  <Box display="flex" gap={2}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, ml: 2 }}>
                      Total Bale:
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {fNumber(
                        RequestDetails.reduce(
                          (sum, item) => sum + (Number(item.TotalBale) || 0),
                          0
                        ),
                        0
                      )}
                    </Typography>
                  </Box>
                )}
                <Box display="flex" gap={2}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Total Request Qty:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {fNumber(
                      RequestDetails.reduce((sum, item) => sum + (Number(item.RequestQty) || 0), 0)
                    )}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Card>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              Save
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
      <ItemDialog
        uploadOpen={openItemDialog}
        uploadClose={() => setOpenItemDialog(false)}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        onSelectSubmit={() => handleAddDetail(selectedRows)}
        allClassName={allClassName}
        selectedClassId={selectedClassId}
        allInvSpare={allInvSpare}
        selectedItem={selectedItem}
        allCategoryData={allCategoryData}
        allSubCategory={itemSubCategory}
        allColors={allColors}
        ItemOpen={ItemOpen}
        values={values}
        itemData={itemData}
        setItemData={setItemData}
      />
      <MRPDialog
        uploadClose={() => setMrpDialogOpen(false)}
        uploadOpen={mrpDialogOpen}
        tableData={mrpItems}
        selectedProduct={values?.MRP}
      />
    </FormProvider>
  );
}
