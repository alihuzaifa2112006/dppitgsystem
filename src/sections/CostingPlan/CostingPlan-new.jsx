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
  TextField,
  Tooltip,
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
import { fNumber } from 'src/utils/format-number';
import {
  TableEmptyRows,
  useTable,
  emptyRows,
  TableHeadCustom,
  TableNoData,
} from 'src/components/table';
import CostingPlanTableRow from './CostingPlan-table-row';

// ----------------------------------------------------------------------

export default function CostingPlanCreateForm() {
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Define default form values
  const defaultValues = {
    WasteDate: new Date() || null,
    WCID: null,
    WasteTypeName: null,
    ShiftId: null,
    Department: userData?.userDetails?.DepartmentName || '',
    Section: userData?.userDetails?.SectionName || '',
    MachineID: null,
    ItemID: null,
    Qty: '',
    Remarks: '',
    // Add fields for detail form
    Inv_Cat_ID: null,
    SubCat_ID: null,
    InvSpecID: null,
    LineID: null,
    UOMID: null, // UOM will be set here based on ItemOpen
    FiberClass: null, // Disabled field for Fiber Class (ClassID 2)
    PPK: '', // Price Per KG
  };
  const CostingPlanSchema = Yup.object().shape({
    ClassID: Yup.object()
      .shape({
        Blend_Type_ID: Yup.number().required('Blend Type ID is required'),
        Blend_Type_Name: Yup.string().required('Blend Type Name is required'),
      })
      .nullable()
      .required('Fiber Class is required'),
    Inv_Cat_Name: Yup.object()
      .shape({
        Inv_Cat_ID: Yup.number().required('Category ID is required'),
        Inv_Cat_Name: Yup.string().required('Category Name is required'),
      })
      .nullable()
      .required('Fiber Category is required'),
    ItemSubCategory: Yup.object()
      .shape({
        SubCat_ID: Yup.number().required('Sub Category ID is required'),
        SubCat_Name: Yup.string().required('Sub Category Name is required'),
      })
      .nullable()
      .required('Fiber Sub Category is required'),
    Color: Yup.object()
      .shape({
        ColorFamilyID: Yup.number().required('Color Family ID is required'),
      })
      .nullable()
      .required('Color Family is required'),
    Origin: Yup.object()
      .shape({
        Origin_ID: Yup.number().required('Origin ID is required'),
      })
      .nullable()
      .required('Origin is required'),
    PPK: Yup.number()
      .required('Price Per KG is required')
      .min(0, 'Price must be greater than or equal to 0'),
  });

  const methods = useForm({
    resolver: yupResolver(CostingPlanSchema),
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
  const { enqueueSnackbar } = useSnackbar();

  const table = useTable();

  const DetailsTableHead = [
    { id: 'ClassName', label: 'Item Type', minWidth: 150, align: 'center' },
    { id: 'Inv_Cat_Name', label: 'Item Category', minWidth: 150, align: 'center' },
    { id: 'ItemSubCategory', label: 'Item Sub Category', minWidth: 150, align: 'center' },
    { id: 'ItemOpen', label: 'Item Name', minWidth: 150, align: 'center' },
    { id: 'LineNo', label: 'Line No', minWidth: 100, align: 'center' },
    { id: 'Qty', label: 'Quantity', minWidth: 100, align: 'center' },
    { id: 'UOMName', label: 'UOM', minWidth: 100, align: 'center' },
    { id: 'Remarks', label: 'Remarks', minWidth: 150, align: 'center' },
    { id: 'Actions', label: 'Actions', minWidth: 100, align: 'center' },
  ];

  // States
  const [allShiftData, setallShiftData] = useState([]);
  const [allItemUnit, setallItemUnit] = useState([]); // Keep state but may not be used for selection
  const [AllLineName, setAllLineName] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [VoucherDetails, setVoucherDetails] = useState([]);
  const [allCategoryData, setallCategoryData] = useState([]);
  const [itemSubCategory, setItemSubCategory] = useState([]);
  const [ItemOpen, setItemOpen] = useState([]);
  const [allInvSpecs, setallInvSpecs] = useState([]);
  const [allColors, setallColors] = useState([]);
  const [detailList, setDetailList] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpenSub, setDialogOpenSub] = useState(false);
  const [AllOrigins, setAllOrigins] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [allBlendTypes, setAllBlendTypes] = useState([]);
  const [ppkFocused, setPpkFocused] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    // FetchAllCategoryandVendors();
    setDialogOpen(false);
  };

  //  dailog function

  const handleSubCategoryOpen = () => {
    setDialogOpenSub(true);
  };

  const handleSubDialogClose = () => {
    fetchSubCategory();
    setDialogOpenSub(false);
  };

  const handleEditDetail = (index) => {
    const detail = VoucherDetails[index];

    setValue('ClassID', { ClassID: detail.ClassID, ClassName: detail.ClassName });
    setValue('Inv_Cat_Name', { Inv_Cat_ID: detail.Inv_Cat_ID, Inv_Cat_Name: detail.Inv_Cat_Name });
    setValue('ItemSubCategory', {
      SubCat_ID: detail.SubCat_ID,
      SubCat_Name: detail.ItemSubCategory,
    });
    setValue('ItemOpen', {
      ItemID: detail.ItemID,
      ItemName: detail.ItemOpen,
      UOM: { UOM_ID: detail.UOMID, UOMName: detail.UOMName },
    }); // Pass UOM data to ItemOpen object for consistency
    setValue('LineID', { LineID: detail.LineID, LineNo: detail.LineNo });
    setValue('Qty', detail.Qty?.toString() || '');
    setValue('UOMID', { UOM_ID: detail.UOMID, UOMName: detail.UOMName }); // Set UOMID for display in disabled field
    setValue('Remarks', detail.Remarks || '');
    setEditingIndex(index);
  };

  const DeleteDetailTableRow = (index) => {
    const updatedDetails = VoucherDetails.filter((_, i) => i !== index);
    setVoucherDetails(updatedDetails);
  };

  const notFound = !VoucherDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  // Watchers
  const selectedSubCategory = watch('ItemSubCategory');
  const selectedItem = watch('ItemOpen');
  const selectedClassId = watch('ClassID');
  const selectedCategory = watch('Inv_Cat_Name');
  const selectedColor = watch('Color');
  const selectedSpecs = watch('InvSpecs');

  // **New Effect:** Auto-set UOM when an Item is selected
  useEffect(() => {
    if (selectedItem?.UOM) {
      // Set the UOMID field from the selected item's UOM data
      setValue('UOMID', selectedItem.UOM);
    } else {
      // Reset UOMID if no item is selected
      setValue('UOMID', null);
    }
    // eslint-disable-next-line
  }, [selectedItem, setValue]);

  const fetchOrigins = useCallback(async () => {
    try {
      const response = await Get('GetAllInvOrigins');
      setAllOrigins(response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchOrigins();
  }, [fetchOrigins]);

  // Fetch Blend Types (Fiber Classes)
  const fetchBlendTypes = useCallback(async () => {
    try {
      const response = await Get(
        `ApiGetBlendTypeList?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllBlendTypes(response.data?.Data || []);
    } catch (error) {
      console.error('Error fetching blend types:', error);
      setAllBlendTypes([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    fetchBlendTypes();
  }, [fetchBlendTypes]);

  // Fetch all classes
  useEffect(() => {
    const fetchAllClasses = async () => {
      try {
        const response = await Get(
          `GetAllClasses?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        const classesData = response?.data?.Data || response?.data?.data || [];
        setAllClasses(classesData);

        // Auto-set Fiber Class (ClassID 2) when data loads
        const fiberClass = classesData.find((cls) => cls.ClassID === 2);
        if (fiberClass) {
          setValue('FiberClass', {
            ClassID: fiberClass.ClassID,
            ClassName: fiberClass.ClassName,
            isColorSensitive: fiberClass.isColorSensitive,
          });
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        setAllClasses([]);
      }
    };
    fetchAllClasses();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, setValue]);

  const fetchItemsBySubCategory = useCallback(async () => {
    if (selectedSpecs?.InvSpecID && selectedClassId?.isColorSensitive === false) {
      try {
        const response = await Get(
          `GetItemsBySpecification?itemSpecId=${selectedSpecs?.InvSpecID}&subCatID=${selectedSubCategory?.SubCat_ID}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
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
      }
    } else if (selectedSubCategory?.SubCat_ID && selectedClassId?.isColorSensitive === true) {
      try {
        const response = await Get(
          `GetItemsByColor?colorId=${selectedColor?.ColorFamilyID}&subCatID=${selectedSubCategory?.SubCat_ID}`
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
      }
    } else {
      setItemOpen([]);
    }
    setValue('ItemOpen', null);
  }, [
    selectedSubCategory,
    selectedColor,
    selectedClassId?.isColorSensitive,
    selectedSpecs,
    userData?.userDetails,
    setValue,
  ]);

  useEffect(() => {
    fetchItemsBySubCategory();
    // eslint-disable-next-line
  }, [fetchItemsBySubCategory, selectedColor, selectedSpecs]);

  const GetColorFamilies = useCallback(async () => {
    if (!userData?.userDetails?.orgId || !userData?.userDetails?.branchID) {
      setallColors([]);
      return;
    }

    try {
      const response = await Get(
        `getcolorfamilies?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      // Handle response structure: response.data.data or response.data
      const colorsData = response?.data?.data || response?.data || [];

      if (!Array.isArray(colorsData)) {
        setallColors([]);
        return;
      }

      // Map the response to the format needed for the autocomplete
      const colorFamilies = colorsData
        .filter((color) => color && color.ColorFamilyID && color.ColorFamilyName && color.IsActive)
        .map((color) => ({
          ColorFamilyID: color.ColorFamilyID,
          ColorFamilyName: color.ColorFamilyName,
        }));

      setallColors(colorFamilies);
    } catch (error) {
      console.error('Error fetching color families:', error);
      setallColors([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchAllSpecsByClassID = useCallback(async () => {
    if (selectedSubCategory?.SubCat_ID && selectedClassId?.isColorSensitive === true) {
      try {
        const response = await Get(
          `GetSpecsBySubcateID?SubcatID=${selectedSubCategory?.SubCat_ID}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
        );
        setallInvSpecs(response.data || []);
      } catch (error) {
        console.error(error);
        setallInvSpecs([]);
      }
    } else {
      setallInvSpecs([]);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    selectedSubCategory?.SubCat_ID,
    selectedClassId?.isColorSensitive,
  ]);

  useEffect(() => {
    // Fetch Color Families independently on component mount or when orgId/branchID changes
    GetColorFamilies();
    // eslint-disable-next-line
  }, [GetColorFamilies]);

  useEffect(() => {
    // fetchItemsBySubCategory();
    if (selectedSubCategory?.SubCat_ID) {
      // Fetch specs only if not color sensitive
      if (selectedClassId?.isColorSensitive === false) {
        FetchAllSpecsByClassID();
      }
    } else {
      setallInvSpecs([]);
    }
    // if (editingIndex === null) {
    //   setValue('ItemOpen', null);
    //   setValue('Color', null);
    //   setValue('InvSpecs', null);
    // }
    // eslint-disable-next-line
  }, [selectedSubCategory, FetchAllSpecsByClassID, selectedClassId]);

  const FetchAllCategoryData = useCallback(async () => {
    try {
      const response = await Get(
        `InvCategoryGetByClassId?classId=2&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setallCategoryData(response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    FetchAllCategoryData();
    setValue('Inv_Cat_Name', null);
  }, [selectedClassId?.ClassID, FetchAllCategoryData, setValue]);

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
  }, [selectedCategory]);

  useEffect(() => {
    fetchSubCategory();
    setValue('ItemSubCategory', null);
    // eslint-disable-next-line
  }, [selectedCategory, fetchSubCategory]);

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

  const handleAddDetail = () => {
    // Field validation

    if (!values?.Inv_Cat_Name) {
      enqueueSnackbar('Item Category is required', { variant: 'error' });
      return;
    }
    if (!values?.ItemSubCategory) {
      enqueueSnackbar('Item Sub Category is required', { variant: 'error' });
      return;
    }

    if (!values?.PPK) {
      enqueueSnackbar('Quantity is required', { variant: 'error' });
      return;
    }
    // UOM is automatically populated based on ItemOpen, so we check if it was set.

    const newDetail = {
      ClassID: values.ClassID?.ClassID || null,
      ClassName: values.ClassID?.ClassName || '',
      Inv_Cat_Name: values.Inv_Cat_Name?.Inv_Cat_Name || '',
      Inv_Cat_ID: values.Inv_Cat_Name?.Inv_Cat_ID || null,
      SubCat_ID: values.ItemSubCategory?.SubCat_ID || null,
    };

    console.log(newDetail, 'add ka data');

    if (editingIndex !== null) {
      const updatedDetails = [...VoucherDetails];
      updatedDetails[editingIndex] = newDetail;
      setVoucherDetails(updatedDetails);
    } else {
      setVoucherDetails((prev) => [...prev, newDetail]);
    }

    // Reset the form for the next entry
    console.log('Before Reset:', VoucherDetails);
    resetDetailForm();
  };

  const resetDetailForm = () => {
    setValue('ClassID', null);
    setValue('Inv_Cat_Name', null);
    setValue('ItemSubCategory', null);
    setValue('ItemOpen', null);
    setValue('LineID', null);
    setValue('Qty', '');
    setValue('UOMID', null); // Reset the UOM field as well
    setValue('Remarks', '');
    setEditingIndex(null);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Validation for required fields
      if (!data.ClassID?.Blend_Type_ID) {
        enqueueSnackbar('Fiber Class is required', {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        return;
      }

      if (!data.Inv_Cat_Name?.Inv_Cat_ID) {
        enqueueSnackbar('Fiber Category is required', {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        return;
      }

      if (!data.ItemSubCategory?.SubCat_ID) {
        enqueueSnackbar('Fiber Sub Category is required', {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        return;
      }

      if (!data.Color?.ColorFamilyID) {
        enqueueSnackbar('Color Family is required', {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        return;
      }

      if (!data.Origin?.Origin_ID) {
        enqueueSnackbar('Origin is required', {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        return;
      }

      if (!data.PPK || data.PPK === '') {
        enqueueSnackbar('Price Per KG is required', {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        return;
      }

      const requestData = {
        BlendTypeID: data.ClassID?.Blend_Type_ID || 0,
        InvCatID: data.Inv_Cat_Name?.Inv_Cat_ID || 0,
        InvSubCatID: data.ItemSubCategory?.SubCat_ID || 0,
        ColorFamilyID: data.Color?.ColorFamilyID || 0,
        OriginID: data.Origin?.Origin_ID || 0,
        Price: parseFloat(data.PPK) || 0,
        InvTypeID: 2,
        isActive: 1,
        CreatedBy: userData?.userDetails?.userId || 0,
        Branch_ID: userData?.userDetails?.branchID || 0,
        Org_ID: userData?.userDetails?.orgId || 0,
      };

      console.log('Request Data:', requestData);

      const response = await Post(`AICosting/Add`, requestData);

      if (response?.data?.Success || response?.data?.success || response?.status === 200) {
        enqueueSnackbar('Costing Plan saved successfully!', {
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        reset();
        setTimeout(() => {
          router.push(paths.dashboard.InventoryManagement.CostingPlan.root);
        }, 500);
      } else {
        const errorMsg =
          response?.data?.Message || response?.data?.message || 'Failed to save costing plan';
        enqueueSnackbar(errorMsg, {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    } catch (error) {
      console.error('Submission Error:', error);
      let errorMessage = 'Failed to create costing plan';
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
          <Card sx={{ p: 3, mt: 2 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              {/* <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <RHFAutocomplete
                      name="FiberClass"
                      label="Class"
                      placeholder="Choose an option"
                      fullWidth
                      options={allClasses.filter((cls) => cls.ClassID === 2)}
                      getOptionLabel={(option) => option?.ClassName || ''}
                      isOptionEqualToValue={(option, value) => option?.ClassID === value?.ClassID}
                      value={values?.FiberClass || null}
                      disabled
                    />
                  </Box>
                </Stack>
              </Box> */}

              <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <RHFAutocomplete
                      name="ClassID"
                      label="Fiber Class"
                      placeholder="Choose an option"
                      fullWidth
                      options={allBlendTypes}
                      getOptionLabel={(option) => option?.Blend_Type_Name || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.Blend_Type_ID === value?.Blend_Type_ID
                      }
                      value={values?.ClassID || null}
                      disabled={detailList.length > 0}
                    />
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <RHFAutocomplete
                      name="Inv_Cat_Name"
                      label="Fiber Category"
                      placeholder="Choose an option"
                      fullWidth
                      options={allCategoryData}
                      getOptionLabel={(option) => option?.Inv_Cat_Name || ''}
                      isOptionEqualToValue={(option, value) =>
                        option.Inv_Cat_ID === value.Inv_Cat_ID
                      }
                      value={values?.Inv_Cat_Name || null}
                    />
                  </Box>

                  {/* <Tooltip title="Add New Inventory Category" placement="top">
                    <IconButton color="primary" onClick={() => handleDialogOpen()}>
                      <Iconify icon="lets-icons:add-duotone" width={32} height={32} />
                    </IconButton>
                  </Tooltip> */}
                </Stack>
              </Box>
              <Box sx={{ gridColumn: { sm: 'span 1' } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <RHFAutocomplete
                      name="ItemSubCategory"
                      label="Fiber Sub Category"
                      placeholder="Choose an option"
                      fullWidth
                      options={itemSubCategory}
                      getOptionLabel={(option) => option?.SubCat_Name || ''}
                      isOptionEqualToValue={(option, value) =>
                        option?.SubCat_ID === value?.SubCat_ID
                      }
                      value={values?.ItemSubCategory || null}
                      isAddDisabled={!selectedCategory}
                    // onAdd={PostSubCategory}
                    />
                  </Box>

                  {/* <Tooltip title="Add New Sub Category" placement="top">
                    <IconButton color="primary" onClick={() => handleSubCategoryOpen()}>
                      <Iconify icon="lets-icons:add-duotone" width={32} height={32} />
                    </IconButton>
                  </Tooltip> */}
                </Stack>
              </Box>

              <>
                <RHFAutocomplete
                  name="Color"
                  label="Color Family"
                  placeholder="Choose an option"
                  fullWidth
                  options={allColors || []}
                  getOptionLabel={(option) => option?.ColorFamilyName || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.ColorFamilyID === value?.ColorFamilyID
                  }
                  value={values?.Color || null}
                />
              </>

              <RHFAutocomplete
                name="Origin"
                label="Origin"
                placeholder="Choose an option"
                fullWidth
                options={AllOrigins}
                getOptionLabel={(option) => option?.Origin_Name || ''}
                isOptionEqualToValue={(option, value) => option.Origin_ID === value?.Origin_ID}
                value={values?.Origin || null}
              />


              <RHFTextField
                label="Price Per KG"
                name="PPK"
                fullWidth
                value={values?.PPK || ''}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />

            </Box>

            {/* <Stack alignItems="flex-end" direction="row-reverse" sx={{ gap: 4 }}>
              <Button color="primary" onClick={handleAddDetail} variant="contained">
                {editingIndex !== null ? 'Update' : 'Add'}
              </Button>
              {editingIndex !== null && (
                <Button color="error" onClick={resetDetailForm} variant="outlined" sx={{ mt: 1 }}>
                  Cancel
                </Button>
              )}
            </Stack> */}
          </Card>

          {/* {VoucherDetails.length > 0 && (
            <TableContainer>
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
                    {VoucherDetails.map((row, index) => (
                      <CostingPlanTableRow
                        key={index}
                        row={{
                          ...row,
                        }}
                        onDeleteRow={() => DeleteDetailTableRow(index)}
                        onEditRow={() => handleEditDetail(index)}
                      />
                    ))}
                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, VoucherDetails.length)}
                    />
                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          )} */}

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
            // disabled={VoucherDetails.length === 0}
            >
              Create Costing Plan
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
