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

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';

import { Get, Post } from 'src/api/apibasemethods';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import Scrollbar from 'src/components/scrollbar';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';

// ----------------------------------------------------------------------
const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

export default function TransferVoucherCreateForm() {
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const gridRef = useRef(null);

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
    defaultValues: {
      SelectedWTN: [],
      WasteDate: new Date(),
      Department: null,
      Section: null,
      TNote: null,
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

  const router = useRouter();

  // States
  const [isLoading, setLoading] = useState(false);
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

  // Column definitions for ag-grid
  const columnDefs = [
    {
      field: 'Types',
      headerName: 'Type',
      minWidth: 100,
      filter: 'agTextColumnFilter',
      cellStyle: (params) => {
        if (params.value === 'Waste') {
          return { color: '#c62828' };
          // eslint-disable-next-line
        } else if (params.value === 'Output') {
          return { color: '#2e7d32' };
          // eslint-disable-next-line
        } else if (params.value === 'Input') {
          return { color: '#1565c0' };
        }
        return null;
      },
    },
    { field: 'ItemName', headerName: 'Item Name', minWidth: 150, flex: 1 },
    { field: 'VoucherNo', headerName: 'Voucher No.', minWidth: 150, flex: 1 },
    { field: 'TransferModeName', headerName: 'Transfer Mode', minWidth: 150, flex: 1 },
    { field: 'StoreName', headerName: 'Store Name', minWidth: 100, flex: 1 },
    // { field: 'ProducedQty', headerName: 'Produced Qty', minWidth: 100, flex: 1 },
    { field: 'RemainingQty', headerName: 'Item Qty', minWidth: 100, flex: 1 },
    { field: 'Qty', headerName: 'Transfer Qty', minWidth: 100, flex: 1 },
    { field: 'UOMName', headerName: 'UOM', minWidth: 100, flex: 1 },
    { field: 'Remarks', headerName: 'Remarks', minWidth: 100, flex: 1 },
  ];

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

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
    setValue('SelectedWTN', []);
  }, [GetAllStorelocations, setValue]);

  // Fetch WTN Data - API CHANGE HERE
  useEffect(() => {
    const fetchWTNData = async () => {
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

    if (selectedTransferToDepartment?.Dpt_ID && selectedTransferToSection?.SectionID) {
      fetchWTNData();
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    enqueueSnackbar,
    selectedTransferToDepartment,
    selectedTransferToSection,
  ]);

  // Fetch Department Data
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

  // Fetch Sections based on Department
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
    setValue('Section', null);
  }, [selectedDepartment, FetchAllSectionsData, setValue]);

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

  // Fetch voucher details when Transfer Voucher No.s are selected - MAJOR API CHANGE HERE
  useEffect(() => {
    const fetchVoucherDetailsForSelected = async () => {
      if (!values.SelectedWTN || values.SelectedWTN.length === 0) {
        setGridRowData([]);
        return;
      }

      try {
        setIsDetailLoading(true);

        // Fetch details for all selected vouchers in parallel
        const voucherPromises = values.SelectedWTN.map((voucher) =>
          Get(
            `GetItemVoucherDetails?VID=${voucher.VID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
          )
            .then((res) => {
              if (res.data?.Success) {
                const details = res.data?.Data || [];

                // Map details to grid format using new API response structure
                return details.map((detail) => ({
                  ItemName: detail.ItemDescription || detail.ItemCode || '-',
                  ItemCode: detail.ItemCode || '-',
                  TransferModeName: values.TNote?.TransferModeName || '-',
                  StoreName: values.Location?.StoreName || '-',
                  RemainingQty: detail.RemainingQty || 0,
                  ProducedQty: 0, // New API doesn't have ProducedQty, setting to 0
                  Qty: detail.TransferQty || 0,
                  UOMName: detail.UOMName || '-',
                  Remarks: '', // New API doesn't have remarks, setting empty
                  VoucherNo: voucher.VoucherNo,
                  Voucher_ID: voucher.Voucher_ID || voucher.VID,
                  // ITEM_ID: detail.ItemID,
                  Detail_ID: 0, // New API doesn't have Detail_ID
                  UOMID: detail.UOMID,
                  VID: voucher.VID,
                  ItemID: detail.ItemID,
                  ItemDescription: detail.ItemDescription,
                  TransferQty: detail.TransferQty,
                  VOUDTLID: detail.VODtlID,
                  Types: detail.Types,
                  // VoucherNo: detail.VoucherNo,

                  // RemainingQty: detail.RemainingQty,
                }));
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
  ]);

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

      // Prepare the main payload
      const requestData = {
        TransferDate: sqlDate,
        ToDeptID: data.Department?.Dpt_ID || null,
        ToSecID: data.Section?.SectionID || null,
        ToLocationID: data.Location?.StoreID || null,
        DriverName: data.DriverName || null,
        VehicleNo: data.VehicleNo || null,
        TransferModeID: data.TNote?.TransferModeID || null,
        CreatedBy: userData?.userDetails?.userId || 0,

        OrgID: userData?.userDetails?.orgId || 0,
        BranchID: userData?.userDetails?.branchID || 0,

        // VoucherIDs: data.SelectedWTN?.map((v) => v.VID || v.Voucher_ID) || [],
        Details: gridRowData.map((detail) => ({
          VID: detail.VID,
          VoucherQty: detail.Qty,
          PDODTLID: 0,
          VODTLID: detail.VOUDTLID,
          // VoucherDtlID: detail.Detail_ID || 0,
          Types: detail.Types,
          ItemID: detail?.ItemID || detail?.ITEM_ID,
          // TransferModeID: data.TNote?.TransferModeID || null,
          // Quantity: parseFloat(detail.Qty) || 0,
          // UOMID: detail.UOMID,
          // Remarks: detail.Remarks || '',
          // VoucherID: detail.VID ,
        })),
      };

      const response = await Post('ItemTransfer/Save', requestData);

      if (response?.status === 200) {
        enqueueSnackbar('Transfer voucher saved successfully!', { variant: 'success' });
        reset();
        setGridRowData([]);
        setTimeout(
          () => router.push(paths.dashboard.Production.TransferVoucher.root),
          800
        );
      } else {
        const errorMsg =
          response?.data?.Message ||
          response?.data?.message ||
          response?.message ||
          'Failed to save transfer voucher';
        enqueueSnackbar(errorMsg, { variant: 'error' });
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
      enqueueSnackbar(errorMessage, { variant: 'error' });
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
          <Card sx={{ p: 3 }}>
            <h3>Transfer Voucher</h3>
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
                // renderOption={(props, option) => (
                //   <li {...props} key={option.StoreID}>
                //     {option.StoreName}
                //   </li>
                // )}
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
              {/* Driver Name */}
              <RHFTextField name="DriverName" label="Driver Name" variant="outlined" fullWidth />
              {/* Vehicle no */}
              <RHFTextField name="VehicleNo" label="Vehicle No" variant="outlined" fullWidth />
            </Box>
          </Card>

          {gridRowData.length > 0 && (
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
              Save
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
