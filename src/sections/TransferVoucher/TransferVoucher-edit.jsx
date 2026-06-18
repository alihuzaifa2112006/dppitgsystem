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
import { Checkbox, Chip } from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';

import { Get, Post, Put } from 'src/api/apibasemethods';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import Scrollbar from 'src/components/scrollbar';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------
const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

export default function TransferVoucherEditForm({ currentData }) {
  console.log('currentData in edit form', currentData);
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const gridRef = useRef(null);
  const prevDeptSecRef = useRef({ deptID: null, secID: null });

  // Define default form values
  const defaultValues = useMemo(
    () => ({
      SelectedWTN: [],
      WasteDate: currentData?.VoucherDate ? new Date(currentData.VoucherDate) : currentData?.TransferDate ? new Date(currentData.TransferDate) : new Date(),
      Department: null,
      Section: null,
      TNote: null,
      Location: null,
    }),
    [currentData]
  );

  const TransferVoucherSchema = Yup.object().shape({
    SelectedWTN: Yup.array()
      .min(1, 'At least one Transfer Voucher No. is required')
      .required('Transfer Voucher No. is required'),
    WasteDate: Yup.mixed()
      .required('Transfer Voucher Date is required')
      .test(
        'is-valid-date',
        'Please enter a valid date',
        (value) => value instanceof Date && !Number.isNaN(value.getTime())
      ),
    Department: Yup.object().nullable().required('Department is required'),
    Section: Yup.object().nullable().required('Section is required'),
    TNote: Yup.object().nullable().required('Transfer Mode is required'),
    Location: Yup.object().nullable().required('Location is required'),
  });

  const methods = useForm({
    resolver: yupResolver(TransferVoucherSchema),
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
  const [isLoading, setLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [allDepartmentsName, setallDepartmentsName] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [allTransferModeData, setallTransferModeData] = useState([]);
  const [allWTNno, setallWTNno] = useState([]);
  const [gridRowData, setGridRowData] = useState([]);
  const [allStoreLocations, setAllStoreLocations] = useState([]);

  // Watchers
  const selectedDepartment = watch('Department');
  const selectedTransferToDepartment = watch('Department');
  const selectedTransferToSection = watch('Section');

  // AG Grid column definitions
  const columnDefs = useMemo(
    () => [
      {
        field: 'Types',
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
        field: 'ItemName',
        headerName: 'Item Name',
        minWidth: 150,
        flex: 1,
      },
      {
        field: 'VoucherNo',
        headerName: 'Voucher No.',
        minWidth: 150,
        flex: 1,
      },
      {
        field: 'TransferModeName',
        headerName: 'Transfer Mode',
        minWidth: 150,
        flex: 1,
      },
      {
        field: 'StoreName',
        headerName: 'Store Name',
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'RemainingQty',
        headerName: 'Item Qty',
        minWidth: 100,
        flex: 1,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => parseFloat(params.value || 0).toFixed(2),
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'Qty',
        headerName: 'Transfer Qty',
        minWidth: 100,
        flex: 1,
        editable: true,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        cellStyle: (params) => ({
          textAlign: 'right',
          backgroundColor: '#e8f5e944',
          border: '1px solid #c8e6c999',
          borderRadius: '4px',
        }),
        valueSetter: (params) => {
          const newValue = parseFloat(params.newValue) || 0;
          const maxQty = parseFloat(params.data.RemainingQty || 0);

          if (newValue > maxQty) {
            enqueueSnackbar(`Cannot exceed remaining quantity: ${maxQty}`, {
              variant: 'warning',
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
            });
            params.data.Qty = maxQty.toFixed(2);
            return false;
          }

          if (newValue < 0) {
            enqueueSnackbar('Transfer quantity cannot be negative', {
              variant: 'warning',
              anchorOrigin: { vertical: 'top', horizontal: 'right' },
            });
            params.data.Qty = '0.00';
            return false;
          }

          params.data.Qty = newValue.toFixed(2);
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
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'Remarks',
        headerName: 'Remarks',
        minWidth: 100,
        flex: 1,
      },
    ],
    [enqueueSnackbar]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );


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
  const FetchAllSectionsData = useCallback(async () => {
    if (selectedDepartment?.Dpt_ID) {
      try {
        const response = await Get(
          `GetSectionsByDept?deptId=${selectedDepartment?.Dpt_ID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setAllSections(response.data || []);
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Error fetching sections', { variant: 'error' });
        setAllSections([]);
      }
    } else {
      setAllSections([]);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    selectedDepartment,
    enqueueSnackbar,
  ]);

  useEffect(() => {
    FetchAllSectionsData();

    // Don't clear Section during initial load from currentData
    if (currentData) {
      const currentDeptID = currentData.TransferDeptID || currentData.ToDeptID;
      const currentSecID = currentData.TransferSecID || currentData.ToSecID;

      // If current department matches currentData, don't clear (it's initial load)
      if (selectedDepartment?.Dpt_ID === currentDeptID) {
        // Also check if section matches currentData - if so, definitely don't clear
        if (values.Section?.SectionID === currentSecID) {
          return;
        }
        // Department matches but section might not be set yet - don't clear during initial load
        return;
      }
    }

    // Clear Section when department changes (user-initiated change)
    // But only if section doesn't match currentData
    if (currentData) {
      const currentSecID = currentData.TransferSecID || currentData.ToSecID;
      if (values.Section?.SectionID === currentSecID) {
        // Section matches currentData, don't clear
        return;
      }
    }

    setValue('Section', null);
  }, [selectedDepartment, FetchAllSectionsData, setValue, currentData, values.Section]);

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
  }, [GetAllStorelocations]);

  // Separate effect to handle clearing Location and SelectedWTN only on user changes
  useEffect(() => {
    const currentDeptID = selectedTransferToDepartment?.Dpt_ID;
    const currentSecID = selectedTransferToSection?.SectionID;

    // Skip if we don't have both department and section selected
    if (!currentDeptID || !currentSecID) {
      // Only update ref if we're going from having values to not having them
      if (prevDeptSecRef.current.deptID || prevDeptSecRef.current.secID) {
        prevDeptSecRef.current = { deptID: currentDeptID, secID: currentSecID };
      }
      return;
    }

    // Check if this is the same as previous (no actual change)
    if (
      prevDeptSecRef.current.deptID === currentDeptID &&
      prevDeptSecRef.current.secID === currentSecID
    ) {
      // No change, don't clear
      return;
    }

    // Check if this matches currentData (initial load or still matching)
    if (currentData) {
      const dataDeptID = currentData.TransferDeptID || currentData.ToDeptID;
      const dataSecID = currentData.TransferSecID || currentData.ToSecID;

      if (currentDeptID === dataDeptID && currentSecID === dataSecID) {
        // This matches currentData, so it's initial load or still valid - don't clear
        prevDeptSecRef.current = { deptID: currentDeptID, secID: currentSecID };
        return;
      }
    }

    // Additional check: if we have Location or SelectedWTN that match currentData, don't clear
    if (currentData) {
      const dataLocationID = currentData.StoreID || currentData.ToLocationID;
      const dataVID = currentData.VID;

      const hasMatchingLocation = dataLocationID && values.Location?.StoreID === dataLocationID;
      const hasMatchingWTN = dataVID && values.SelectedWTN?.some(wtn => wtn.VID === dataVID);

      // If we have matching values from currentData, don't clear (they're still valid)
      if (hasMatchingLocation || hasMatchingWTN) {
        prevDeptSecRef.current = { deptID: currentDeptID, secID: currentSecID };
        return;
      }
    }

    // This is a user-initiated change to a different dept/sec, clear the dependent fields
    setValue('Location', null);
    setValue('SelectedWTN', []);

    // Update the ref
    prevDeptSecRef.current = { deptID: currentDeptID, secID: currentSecID };
  }, [selectedTransferToDepartment?.Dpt_ID, selectedTransferToSection?.SectionID, setValue, currentData, values.Location, values.SelectedWTN]);

  // Fetch Transfer Mode Data
  const fetchTransferModeData = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllTransferMode?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      if (response.data && response.data.status === 'Success') {
        setallTransferModeData(response.data.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    fetchTransferModeData();
  }, [fetchTransferModeData]);

  // Fetch WTN Data
  useEffect(() => {
    const fetchWTNData = async () => {
      if (!selectedTransferToDepartment?.Dpt_ID || !selectedTransferToSection?.SectionID) {
        setallWTNno([]);
        return;
      }

      try {
        const res = await Get(
          `GetItemVoucherNo?TransferDeptID=${selectedTransferToDepartment.Dpt_ID}&TransferSecID=${selectedTransferToSection.SectionID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );

        if (res.data?.Success) {
          setallWTNno(res.data?.Data || []);
        } else {
          throw new Error('API returned unsuccessful status');
        }
      } catch (err) {
        console.error('Error fetching WTN NO', err);
        enqueueSnackbar('Error fetching WTN numbers', { variant: 'error' });
      }
    };

    fetchWTNData();
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    enqueueSnackbar,
    selectedTransferToDepartment,
    selectedTransferToSection,
  ]);

  // Load existing data when currentData is available
  useEffect(() => {
    if (currentData && !isLoading && allDepartmentsName.length > 0) {
      // Set form values from currentData - handle both API response structures
      const transferDate = currentData.VoucherDate || currentData.TransferDate;
      if (transferDate) {
        setValue('WasteDate', new Date(transferDate));
      }

      // Set Transfer To Department - handle both field names
      const deptID = currentData.TransferDeptID || currentData.ToDeptID;
      if (deptID) {
        const dept = allDepartmentsName.find((d) => d.Dpt_ID === deptID);
        if (dept) {
          setValue('Department', dept);
        }
      }

      // Set Transfer Mode
      if (currentData.TransferModeID && allTransferModeData.length > 0) {
        const transferMode = allTransferModeData.find((tm) => tm.TransferModeID === currentData.TransferModeID);
        if (transferMode) {
          setValue('TNote', transferMode);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData, isLoading, allDepartmentsName.length, allTransferModeData.length]);

  // Set Transfer To Section after sections are loaded
  useEffect(() => {
    const secID = currentData?.TransferSecID || currentData?.ToSecID;
    if (secID && allSections.length > 0 && selectedDepartment) {
      const section = allSections.find((s) => s.SectionID === secID);
      if (section && !values.Section) {
        setValue('Section', section);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData?.TransferSecID, currentData?.ToSecID, allSections.length, selectedDepartment?.Dpt_ID]);

  // Set Location after store locations are loaded
  useEffect(() => {
    const locationID = currentData?.StoreID || currentData?.ToLocationID;
    if (locationID && allStoreLocations.length > 0 && selectedTransferToSection) {
      const location = allStoreLocations.find((l) => l.StoreID === locationID);
      if (location && !values.Location) {
        setValue('Location', location);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData?.StoreID, currentData?.ToLocationID, allStoreLocations.length, selectedTransferToSection?.SectionID]);

  // Load SelectedWTN from currentData (only once on initial load)
  useEffect(() => {
    const loadInitialWTN = async () => {
      // Check if VID and VoucherNo are directly in currentData (new API structure)
      if (currentData?.VID && currentData?.VoucherNo) {
        // Direct voucher info available in currentData
        const voucher = {
          VID: currentData.VID,
          VoucherNo: currentData.VoucherNo,
        };
        setValue('SelectedWTN', [voucher]);
        return;
      }

      // Fallback: Extract unique VIDs from Details (old structure)
      if (!currentData?.Details || !Array.isArray(currentData.Details) || currentData.Details.length === 0) {
        setValue('SelectedWTN', []);
        return;
      }

      try {
        // Extract unique VIDs from Details
        const uniqueVIDs = [...new Set(currentData.Details.map((detail) => detail.VID).filter(Boolean))];

        if (uniqueVIDs.length === 0) {
          setValue('SelectedWTN', []);
          return;
        }

        // Fetch voucher information for all VIDs
        const voucherPromises = uniqueVIDs.map((vid) =>
          Get(
            `ItemVoucher/GetByID?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&VID=${vid}`
          )
            .then((res) => {
              const voucherData = res.data?.Data?.[0] || res.data?.Data || res.data;
              return voucherData ? { VID: vid, VoucherNo: voucherData.VoucherNo || `VID-${vid}` } : null;
            })
            .catch((err) => {
              console.error(`Error fetching voucher ${vid}:`, err);
              return { VID: vid, VoucherNo: `VID-${vid}` };
            })
        );

        const voucherResults = await Promise.all(voucherPromises);
        const validVouchers = voucherResults.filter((v) => v !== null);

        // Set SelectedWTN only if not already set
        if (validVouchers.length > 0) {
          setValue('SelectedWTN', validVouchers);
        }
      } catch (error) {
        console.error('Error loading initial WTN:', error);
      }
    };

    if (currentData && (!values.SelectedWTN || values.SelectedWTN.length === 0)) {
      loadInitialWTN();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData]);

  // Fetch voucher details when Transfer Voucher No.s are selected - Same logic as new form
  useEffect(() => {
    const fetchVoucherDetailsForSelected = async () => {
      // If no vouchers selected or no transfer mode, try to load from currentData.Details first
      if (!values.SelectedWTN || values.SelectedWTN.length === 0 || !values.TNote) {
        // If we have currentData.Details, load them directly (for edit mode)
        if (currentData?.Details && Array.isArray(currentData.Details) && currentData.Details.length > 0) {
          const vid = currentData.VID;
          const voucherNo = currentData.VoucherNo || `VID-${vid}`;

          const gridData = currentData.Details.map((detail) => ({
            ItemName: detail.ItemDescription || detail.ItemCode || '-',
            ItemCode: detail.ItemCode || '-',
            TransferModeName: values.TNote?.TransferModeName || currentData.TransferModeName || '-',
            StoreName: values.Location?.StoreName || currentData.StoreName || '-',
            RemainingQty: detail.RemainingQty || 0,
            Qty: detail.TransferQty || detail.VoucherQty || 0,
            UOMName: detail.UOMName || '-',
            Remarks: detail.Remarks || '',
            VoucherNo: voucherNo,
            Voucher_ID: vid,
            Detail_ID: detail.VOUDTLID || detail.VODtlID || 0,
            UOMID: detail.UOMID,
            VID: vid,
            ItemID: detail.ItemID,
            ItemDescription: detail.ItemDescription,
            TransferQty: detail.TransferQty || detail.VoucherQty || 0,
            VOUDTLID: detail.VOUDTLID || detail.VODtlID,
            VODtlID: detail.VODtlID || detail.VOUDTLID,
            PDODTLID: detail.PDODTLID || detail.PDODtlID || 0,
            Types: detail.Types || '',
          }));

          setGridRowData(gridData);
          return;
        }

        setGridRowData([]);
        return;
      }

      try {
        setIsDetailLoading(true);

        // Create a map of existing details for preserving Qty values and PDODTLID during edit
        const existingDetailsMap = new Map();
        if (currentData?.Details && Array.isArray(currentData.Details)) {
          currentData.Details.forEach((detail) => {
            // Use VID from detail or fallback to currentData.VID
            const vid = detail.VID || currentData.VID;
            const key = `${vid}_${detail.ItemCode || detail.ItemID}`;
            // Use TransferQty or VoucherQty from detail
            const qty = detail.TransferQty || detail.VoucherQty || 0;
            existingDetailsMap.set(key, {
              qty,
              PDODTLID: detail.PDODTLID || detail.PDODtlID || 0,
              VODtlID: detail.VODtlID || detail.VOUDTLID,
            });
          });
        }

        // Fetch details for all selected vouchers in parallel
        const voucherPromises = values.SelectedWTN.map((voucher) =>
          Get(
            `GetItemVoucherDetails?VID=${voucher.VID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
          )
            .then((res) => {
              if (res.data?.Success) {
                const details = res.data?.Data || [];

                // Map details to grid format using new API response structure
                return details.map((detail) => {
                  const key = `${voucher.VID}_${detail.ItemCode || detail.ItemID}`;
                  const existingData = existingDetailsMap.get(key);
                  const existingQty = existingData?.qty;

                  return {
                    ItemName: detail.ItemDescription || detail.ItemCode || '-',
                    ItemCode: detail.ItemCode || '-',
                    TransferModeName: values.TNote?.TransferModeName || '-',
                    StoreName: values.Location?.StoreName || '-',
                    RemainingQty: detail.RemainingQty || 0,
                    Qty: existingQty !== undefined ? existingQty : (detail.TransferQty || 0),
                    UOMName: detail.UOMName || '-',
                    Remarks: '',
                    VoucherNo: voucher.VoucherNo,
                    Voucher_ID: voucher.VID,
                    Detail_ID: detail.VODtlID || 0,
                    UOMID: detail.UOMID,
                    VID: voucher.VID,
                    ItemID: detail.ItemID,
                    ItemDescription: detail.ItemDescription,
                    TransferQty: existingQty !== undefined ? existingQty : (detail.TransferQty || 0),
                    VOUDTLID: detail.VODtlID,
                    VODtlID: detail.VODtlID || existingData?.VODtlID,
                    PDODTLID: existingData?.PDODTLID || 0,
                    Types: detail.Types || '',
                  };
                });
              }
              console.warn(`API returned unsuccessful for voucher ${voucher.VoucherNo}`);
              return [];
            })
            .catch((err) => {
              console.error(`Error fetching details for voucher ${voucher.VoucherNo}:`, err);
              return [];
            })
        );

        // Wait for all promises to settle (even if some fail)
        const results = await Promise.allSettled(voucherPromises);

        // Flatten all details from successful responses
        const allDetails = results.reduce((acc, result) => {
          if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            return [...acc, ...result.value];
          }
          return acc;
        }, []);

        setGridRowData(allDetails);
      } catch (err) {
        console.error('Error fetching voucher details', err);
        enqueueSnackbar('Error fetching voucher details', { variant: 'error' });
        setGridRowData([]);
      } finally {
        setIsDetailLoading(false);
      }
    };

    fetchVoucherDetailsForSelected();
  }, [
    values.SelectedWTN,
    values.TNote,
    values.Location,
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    enqueueSnackbar,
    currentData,
  ]);

  // Initialize loading state
  useEffect(() => {
    setLoading(false);
  }, []);

  const PostTransferMode = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Transfer Mode', { variant: 'error' });
      return;
    }

    const newOptionTrimmed = newOption.trim().toLowerCase();

    if (
      allTransferModeData.find(
        (option) => option?.TransferModeName?.trim()?.toLowerCase() === newOptionTrimmed
      )
    ) {
      enqueueSnackbar('This Transfer Mode already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        TransferModeName: newOption,
        IsActive: true,
        CreatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddTransferMode', dataToSend);
      fetchTransferModeData();
      enqueueSnackbar('Transfer Mode Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (gridRowData.length === 0) {
        enqueueSnackbar('No details found for selected vouchers', { variant: 'error' });
        return;
      }

      const formattedDate = new Date(data.WasteDate);
      if (Number.isNaN(formattedDate.getTime())) {
        enqueueSnackbar('Invalid Transfer Voucher Date', { variant: 'error' });
        return;
      }
      const sqlDate = formattedDate.toISOString().split('T')[0];

      // Prepare the main payload - matching exact API structure
      const requestData = {
        TransferID: currentData?.TransferID || currentData?.ReportID || 0,
        TransferDate: sqlDate,
        ToDeptID: data.Department?.Dpt_ID || null,
        ToSecID: data.Section?.SectionID || null,
        ToLocationID: data.Location?.StoreID || null,
        TransferModeID: data.TNote?.TransferModeID || null,
        UpdatedBy: userData?.userDetails?.userId || 0,
        OrgID: userData?.userDetails?.orgId || 0,
        BranchID: userData?.userDetails?.branchID || 0,
        Details: gridRowData.map((detail) => ({
          PDODTLID: detail.PDODTLID || 0,
          VID: detail.VID,
          VODtlID: detail.VODtlID || detail.VOUDTLID || detail.Detail_ID || 0,
          VoucherQty: parseFloat(detail.Qty) || 0,
          Types: detail.Types || '',
        })),
      };

      console.log('Update Request Data:', requestData);

      const response = await Put(
        `ItemTransfer/Update?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`,
        requestData
      );

      if (response?.data?.Success || response?.data?.success || response?.status === 200) {
        enqueueSnackbar('Transfer voucher updated successfully!', {
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        setTimeout(() => {
          router.push(paths.dashboard.Production.TransferVoucher.root);
        }, 500);
      } else {
        const errorMsg =
          response?.data?.Message ||
          response?.data?.message ||
          'Failed to update transfer voucher';
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
              <RHFAutocomplete
                name="Department"
                label="Transfer To Department"
                fullWidth
                options={allDepartmentsName}
                getOptionLabel={(option) => option?.Dpt_Name || ''}
                isOptionEqualToValue={(option, value) => option?.Dpt_ID === value?.Dpt_ID}
              />

              <RHFAutocomplete
                name="Section"
                label="Transfer To Section"
                fullWidth
                options={allSections}
                getOptionLabel={(option) => option?.SectionName || ''}
                isOptionEqualToValue={(option, value) => option?.SectionID === value?.SectionID}
                disabled={!selectedDepartment?.Dpt_ID}
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
                value={values.Location || null}
              />

              <RHFAutocomplete
                name="SelectedWTN"
                label="Transfer Voucher No."
                fullWidth
                multiple
                limitTags={2}
                options={allWTNno}
                getOptionLabel={(option) => option?.VoucherNo || ''}
                isOptionEqualToValue={(option, value) => option.VID === value.VID}
                value={values.SelectedWTN || []}
                renderOption={(props, option) => {
                  const isChecked = values.SelectedWTN?.some(
                    (selected) => selected.VID === option.VID
                  );
                  return (
                    <li {...props} key={option.VID}>
                      <Checkbox size="small" disableRipple checked={isChecked} />
                      {option.VoucherNo}
                    </li>
                  );
                }}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.VID}
                      label={option.VoucherNo}
                      size="small"
                      variant="soft"
                      color="primary"
                    />
                  ))
                }
              />

              <Controller
                name="WasteDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Transfer Voucher Date"
                    format="dd MMM yyyy"
                    onChange={(newValue) => {
                      field.onChange(newValue);
                    }}
                    slotProps={{
                      textField: {
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />

              <AutocompleteWithAdd
                name="TNote"
                label="Transfer Mode"
                fullWidth
                options={allTransferModeData}
                getOptionLabel={(option) => option?.TransferModeName || ''}
                isOptionEqualToValue={(option, value) =>
                  option.TransferModeID === value?.TransferModeID
                }
                value={values?.TNote || null}
                onAdd={PostTransferMode}
              />
            </Box>
          </Card>

          {values.TNote && gridRowData.length > 0 && (
            <Card sx={{ p: 3, my: 2 }}>
              <h3>Transfer Details</h3>
              <Scrollbar>
                <div style={{ width: '100%', height: '70vh' }}>
                  <AgGridReact
                    className="ag-theme-material"
                    theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
                    ref={gridRef}
                    rowData={gridRowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowHeight={35}
                    headerHeight={40}
                    animateRows
                    pagination
                    paginationPageSize={20}
                    loading={isDetailLoading}
                  />
                </div>
              </Scrollbar>
            </Card>
          )}

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              Update Transfer Voucher
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

TransferVoucherEditForm.propTypes = {
  currentData: PropTypes.any,
};
