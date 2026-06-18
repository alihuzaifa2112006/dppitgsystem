import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AgGridReact } from 'ag-grid-react';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { Button, Tooltip, IconButton, Typography } from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';
import Iconify from 'src/components/iconify';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';

import { Get, Put } from 'src/api/apibasemethods';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import PropTypes from 'prop-types';
import ItemDialog from './ItemDialog';
import MRPDialog from './MRPDialog';
import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------
const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

export default function ProductRequestEditForm({ currentData }) {
  console.log('currentData in edit form', currentData);
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  // States
  const [isLoading, setLoading] = useState(true);
  const [allDepartmentsName, setallDepartmentsName] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [allLineNumbers, setAllLineNumbers] = useState([]);
  const [RequestDetails, setRequestDetails] = useState([]);
  const [toRequestdata, settoRequestdata] = useState([]);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [allClassName, setallClassName] = useState([]);
  const [itemSubCategory, setItemSubCategory] = useState([]);
  const [allItemUnit, setallItemUnit] = useState([]);
  const [allColors, setallColors] = useState([]);
  const [allInvSpare, setallInvSpare] = useState([]);
  const [ItemOpen, setItemOpen] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [allCategoryData, setallCategoryData] = useState([]);
  const [allMRPData, setAllMRPData] = useState([]);
  const [allPurchaseTypes, setAllPurchaseTypes] = useState([]);
  const [mrpDialogOpen, setMrpDialogOpen] = useState(false);
  const [mrpItems, setMrpItems] = useState([]);

  const NewProductRequestSchema = Yup.object().shape({
    PRDate: Yup.date().required('PR Date is required').nullable(),
    Section: Yup.object(),
    Department: Yup.object(),
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
      PRDate: currentData?.ReqDate ? new Date(currentData.ReqDate) : new Date(),
      Section: null,
      Department: null,
      LineNo: null,
      Request: null,
      ClassID: null,
      Inv_Cat_Name: null,
      ItemSubCategory: null,
      Color: null,
      InvSpare: null,
      ItemOpen: null,
      UOMID: null,
      RequestType: null,
      MRP: null,
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
  const selectedDepartment = watch('Department');
  const selectedSection = watch('Section');
  const selectedClassId = watch('ClassID');
  const selectedCategory = watch('Inv_Cat_Name');
  const selectedSubCategory = watch('ItemSubCategory');
  const selectedColor = watch('Color');
  const selectedSpare = watch('InvSpare');
  const selectedItem = watch('ItemOpen');

  // Date In SQL format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleItemOpen = () => {
    setOpenItemDialog(true);
  };

  const handleItemClose = () => {
    setOpenItemDialog(false);
    // Reset item selection fields when dialog closes
    setValue('ClassID', null);
    setValue('Inv_Cat_Name', null);
    setValue('ItemSubCategory', null);
    setValue('Color', null);
    setValue('InvSpare', null);
    setValue('ItemOpen', null);
    setItemData([]);
    setSelectedRows([]);
  };

  const handleAddDetail = (rows) => {
    setRequestDetails((prev) => {
      const merged = [...prev, ...rows];
      const unique = merged.filter(
        (row, index, self) => index === self.findIndex((r) => r.key === row.key)
      );
      return unique;
    });

    setOpenItemDialog(false);
    setSelectedRows([]);
  };

  const DeleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = RequestDetails.filter((row) => row !== rowToDelete);
    setRequestDetails(updatedDetails);
  };

  // Fetch all departments
  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        const response = await Get(
          `GetAllActiveInactiveDpt?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setallDepartmentsName(response.data.Departments || []);
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Error fetching departments', { variant: 'error' });
      }
    };
    fetchDepartmentData();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  // Fetch sections based on selected department
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

  useEffect(() => {
    if (selectedDepartment?.DepId || selectedDepartment?.Dpt_ID) {
      const deptId = selectedDepartment?.DepId || selectedDepartment?.Dpt_ID;
      fetchSectionsByDepartment(deptId);
    } else {
      setAllSections([]);
    }
  }, [selectedDepartment, fetchSectionsByDepartment]);

  // Fetch all line numbers
  const fetchAllLineNumbers = useCallback(async () => {
    const sectionId = selectedSection?.SectionID;

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
  }, [userData?.userDetails, selectedSection?.SectionID]);

  useEffect(() => {
    fetchAllLineNumbers();
  }, [fetchAllLineNumbers]);

  // Fetch store locations
  useEffect(() => {
    const fetchRequestedData = async () => {
      try {
        const response = await Get(
          `GetAllStorelocations?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        settoRequestdata(response.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRequestedData();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // Fetch MRP dropdown
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

  // Fetch Purchase Types
  useEffect(() => {
    const fetchPurchaseTypes = async () => {
      try {
        const response = await Get(
          `getallPurchasetypes?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        const data = response.data || [];
        setAllPurchaseTypes(data);
      } catch (error) {
        console.error(error);
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetchPurchaseTypes();
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // Fetch all UOM
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

  // Fetch all classes
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

  // Fetch categories based on selected class
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
    setValue('Inv_Cat_Name', null);
    setValue('ItemSubCategory', null);
    setValue('ItemCode', null);
    setValue('ItemName', null);
    setValue('Color', null);
    setValue('InvSpare', null);
    setallInvSpare([]);
    setallColors([]);
    setItemData([]);
    setItemOpen([]);
  }, [selectedClassId?.ClassID, FetchAllCategoryData, setValue]);

  // Fetch sub categories based on selected category
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
    setValue('ItemSubCategory', null);
    setItemData([]);
    setItemOpen([]);
  }, [selectedCategory, fetchSubCategory, setValue]);

  // Fetch colors or spares based on sub category
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
    if (selectedSubCategory?.SubCat_ID && selectedClassId?.isColorSensitive === true) {
      GetColors();
    } else {
      FetchAllSpareByClassID();
    }
    setValue('ItemOpen', null);
    setValue('Color', null);
    setValue('InvSpare', null);
    setItemOpen([]);
    setItemData([]);
  }, [selectedSubCategory, FetchAllSpareByClassID, GetColors, selectedClassId, setValue]);

  // Fetch items based on sub category, color/spare
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

  useEffect(() => {
    if (selectedColor?.ColorID || selectedSpare?.SpareID) {
      fetchItemsBySubCategory();
      setValue('ItemOpen', null);
    }
  }, [selectedColor, selectedSpare, fetchItemsBySubCategory, setValue]);

  // Set UOM when item is selected
  useEffect(() => {
    if (selectedItem) {
      setValue('UOMID', selectedItem.UOM);
    }
  }, [selectedItem, setValue]);

  // Clear MRP when RequestType changes to Independent
  const selectedRequestType = watch('RequestType');
  useEffect(() => {
    if (selectedRequestType?.PurposeTypes === 'Independent' || selectedRequestType?.PurchaseTypeID === 1) {
      setValue('MRP', null);
    }
  }, [selectedRequestType, setValue]);

  // Handle MRP Open
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

  // Load current data into form
  useEffect(() => {
    if (currentData && allDepartmentsName.length > 0) {
      // Set date
      if (currentData.ReqDate) {
        setValue('PRDate', new Date(currentData.ReqDate));
      }

      // Set Department
      if (currentData.DeptID) {
        const dept = allDepartmentsName.find(
          (d) => d.DepId === currentData.DeptID || d.Dpt_ID === currentData.DeptID
        );
        if (dept) {
          setValue('Department', dept);
        }
      }

      // Set Request To
      if (currentData.RequestTo && toRequestdata.length > 0) {
        const requestTo = toRequestdata.find((r) => r.StoreID === currentData.RequestTo);
        if (requestTo) {
          setValue('Request', requestTo);
        }
      }

      // Set Request To
      if (currentData.RequestTo && toRequestdata.length > 0) {
        const requestTo = toRequestdata.find((r) => r.StoreID === currentData.RequestTo);
        if (requestTo) {
          setValue('Request', requestTo);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData, allDepartmentsName.length, toRequestdata.length]);

  // Set Request Type after purchase types are loaded
  useEffect(() => {
    // Use PurchaseTypeID from API response (matches ProductRequest-new.jsx)
    const requestTypeId = currentData?.PurchaseTypeID || currentData?.RequesttypeID || currentData?.RequestTypeID || currentData?.RequesttypeId;
    if (requestTypeId && allPurchaseTypes.length > 0) {
      const requestType = allPurchaseTypes.find(
        (r) => Number(r.PurchaseTypeID) === Number(requestTypeId)
      );
      if (requestType && !values.RequestType) {
        console.log('Setting RequestType:', requestType, 'from PurchaseTypeID:', requestTypeId);
        setValue('RequestType', requestType, { shouldValidate: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData?.PurchaseTypeID, currentData?.RequesttypeID, currentData?.RequestTypeID, allPurchaseTypes.length]);

  // Set MRP after MRP data is loaded
  useEffect(() => {
    if (currentData?.MRPID && allMRPData.length > 0 && values?.RequestType?.PurchaseTypeID !== 1) {
      const mrp = allMRPData.find((m) => m.MRPID === currentData.MRPID || m.MRPID === Number(currentData.MRPID));
      if (mrp && !values.MRP) {
        console.log('Setting MRP:', mrp);
        setValue('MRP', mrp, { shouldValidate: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData?.MRPID, allMRPData.length, values?.RequestType?.PurchaseTypeID]);

  // Set Section after sections are loaded
  useEffect(() => {
    if (currentData?.SectionID && allSections.length > 0 && selectedDepartment) {
      const section = allSections.find((s) => s.SectionID === currentData.SectionID);
      if (section && !values.Section) {
        setValue('Section', section);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData?.SectionID, allSections.length, selectedDepartment]);

  // Set LineNo after line numbers are loaded
  useEffect(() => {
    if (currentData?.LineID && allLineNumbers.length > 0 && selectedSection) {
      const lineNo = allLineNumbers.find((l) => l.LineID === currentData.LineID);
      if (lineNo && !values.LineNo) {
        setValue('LineNo', lineNo);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData?.LineID, allLineNumbers.length, selectedSection]);

  // Load Details from currentData
  useEffect(() => {
    if (currentData?.Details && Array.isArray(currentData.Details) && currentData.Details.length > 0) {
      const mappedDetails = currentData.Details.map((detail) => ({
        key: `detail_${detail.ReqDtlID}`,
        ReqDtlID: detail.ReqDtlID,
        SourceType: detail.SourceType || '',
        TrackingID: detail.TrackingID || null,
        ItemCode: detail.itemCode || detail.ItemCode || '',
        ItemDescription: detail.ItemDescription || '',
        GRNNo: detail.GRNNo || detail.GRNNO || null,
        GRNDate: detail.GRNDate || detail.GRNDATE || null,
        ChallanNo: detail.ChallanNo || detail.CHALLANNO || null,
        ChallanDate: detail.ChallanDate || null,
        VendorName: detail.VendorName || '',
        issueRemainingQty: detail.RemainingQty || 0,
        TotalBale: detail.TotalBale || 0,
        RequestQty: detail.TotalRequestedQty || 0,
        StoreName: detail.StoreName || '',
        LocationName: detail.LocationName || '',
        UOMName: detail.UOMName || '',
        InvTypeID: detail.InvTypeID || 0,
        CategoryID: detail.CategoryID || 0,
        SubCatID: detail.SubCatID || 0,
        ItemID: detail.ItemID || 0,
        UOMID: detail.UOMID || 0,
        GRNID: detail.GRNID || 0,
        GRNDtlID: detail.GRNDtlID || detail.GRNDTLID || 0,
        ItemOpenID: detail.ItemOpenID || detail.ITEMOPENID || 0,
        ItemOpenDtlID: detail.ItemOpenDtlID || detail.ITEMOPENDTLID || 0,
        VendorID: detail.VendorID || 0,
        StoreID: detail.StoreID || 0,
        LocationID: detail.LocationID || 0,
        ColorID: detail.ColorID || 0,
        Remarks: detail.Remarks || '',
      }));

      setRequestDetails(mappedDetails);
    }
  }, [currentData]);

  // Initialize loading state
  useEffect(() => {
    setLoading(false);
  }, []);

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
              if (Number.isNaN(newValue)) return false;
              params.data.TotalBale = newValue;
              return true;
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

              if (Number.isNaN(newValue)) return false;

              if (newValue > remaining) {
                params.data.RequestQty = remaining;
              } else {
                params.data.RequestQty = newValue;
              }
              return true;
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

              if (Number.isNaN(newValue)) return false;

              if (newValue > remaining) {
                params.data.RequestQty = remaining;
              } else {
                params.data.RequestQty = newValue;
              }
              return true;
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
        ];

  // Default column definitions
  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    resizable: true,
    filter: true,
    sortable: true,
  };

  // Handle cell value changed
  const handleCellValueChanged = useCallback((params) => {
    // Get all row data from the grid
    const allRowData = [];
    params.api.forEachNode((node) => {
      allRowData.push(node.data);
    });
    // Update the RequestDetails state with the updated grid data
    setRequestDetails(allRowData);
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (RequestDetails.length === 0) {
        enqueueSnackbar('Please add at least one request detail', { variant: 'error' });
        return;
      }

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
        ReqID: currentData?.ReqID || 0,
        ReqDate: formatDate(data?.PRDate),
        DeptID: data?.Department?.DepId || data?.Department?.Dpt_ID || 0,
        SectionID: data?.Section?.SectionID || 0,
        RequestTo: data?.Request?.StoreID || 0,
        LineID: data?.LineNo?.LineID || 0,
        PurchaseTypeID: values?.RequestType?.PurchaseTypeID || 0,
        MRPID: values?.RequestType?.PurchaseTypeID !== 1 ? values?.MRP?.MRPID : 0,
        CreatedBy: userData.userDetails.userId,
        Org_Id: userData.userDetails.orgId,
        Branch_Id: userData.userDetails.branchID,
        Details: RequestDetails.map((detail) => ({
          ReqDtlID: detail.ReqDtlID || 0,
          InvTypeID: detail.InvTypeID,
          CategoryID: detail.CategoryID,
          SubCatID: detail.SubCatID,
          ItemID: detail.ItemID,
          UOMID: detail.UOMID,
          TotalQty: Number(detail?.issueRemainingQty || 0),
          TotalRequestedQty: Number(detail.RequestQty),
          RemainingQty: Number(detail.issueRemainingQty || 0),
          ColorID: detail.ColorID || detail.Color?.ColorID || 0,
          VendorID: detail.VendorID || 0,
          StoreID: detail.StoreID || 0,
          LocationID: detail.LocationID || 0,
          TrackingID: detail.TrackingID || null,
          SourceType: detail.SourceType,
        })),
      };

      console.log('Update Request Data:', requestData);

      const response = await Put(`UpdateReq`, requestData);

      if (response.status === 200 || response?.data?.Success) {
        enqueueSnackbar('Request updated successfully!', { variant: 'success' });
        router.push(paths.dashboard.Production.ProductRequest.root);
        reset();
        setRequestDetails([]);
      } else {
        enqueueSnackbar(response.data.Message || 'Failed to update request', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error details:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Failed to update request', {
        variant: 'error',
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
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <h3>Edit Departmental Request</h3>
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
                defaultValue={currentData?.ReqDate ? new Date(currentData.ReqDate) : new Date()}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Request Date"
                    format="dd/MM/yyyy"
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
                value={values?.Department?.DepartmentName || values?.Department?.Dpt_Name || ''}
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
                  placeholder="Choose a line number"
                  fullWidth
                  options={allLineNumbers}
                  getOptionLabel={(option) => option?.LineNo || ''}
                  value={values?.LineNo}
                />
              )}

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
              {(values?.RequestType?.PurposeTypes !== 'Independent' &&
                values?.RequestType?.PurchaseTypeID !== 1) && (
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

          <Card sx={{ p: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Inventory Information</h3>
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
            </Box>

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
                getRowId={(params) => params.data.key || params.data.ReqDtlID}
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
              Update Request
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

ProductRequestEditForm.propTypes = {
  currentData: PropTypes.any,
};
