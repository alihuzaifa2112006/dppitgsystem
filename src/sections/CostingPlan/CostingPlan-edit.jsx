import * as Yup from 'yup';
import PropTypes from 'prop-types';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { Button, IconButton, InputAdornment, TextField, Tooltip } from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';

import { Get, Post, Put } from 'src/api/apibasemethods';
import Iconify from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function CostingPlanEditForm({ currentData }) {
  console.log(currentData);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Define default form valuesH!du
  const defaultValues = {
    FiberClass: null,
    ClassID: null,
    Inv_Cat_Name: null,
    ItemSubCategory: null,
    Color: null,
    Origin: null,
    PPK: '',
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

  // States
  const [isLoading, setLoading] = useState(true);
  const [allCategoryData, setallCategoryData] = useState([]);
  const [itemSubCategory, setItemSubCategory] = useState([]);
  const [allColors, setallColors] = useState([]);
  const [AllOrigins, setAllOrigins] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [allBlendTypes, setAllBlendTypes] = useState([]);
  const [ppkFocused, setPpkFocused] = useState(false);

  // Watchers
  const selectedSubCategory = watch('ItemSubCategory');
  const selectedClassId = watch('ClassID');
  const selectedCategory = watch('Inv_Cat_Name');

  // Fetch Origins
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

  // Fetch Color Families based on Sub Category
  const GetColorFamilies = useCallback(async () => {
    if (!selectedSubCategory?.SubCat_ID) {
      setallColors([]);
      return;
    }

    try {
      const response = await Get(
        `GetColorsBySubCatFromItemDB?subCatId=${selectedSubCategory?.SubCat_ID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      const colorsData = response?.data?.data || response?.data || [];

      if (!Array.isArray(colorsData)) {
        setallColors([]);
        return;
      }

      // Extract unique color families from the colors data
      const colorFamiliesMap = new Map();
      colorsData.forEach((color) => {
        if (color && color.ColorFamilyID && color.ColorFamilyName) {
          if (!colorFamiliesMap.has(color.ColorFamilyID)) {
            colorFamiliesMap.set(color.ColorFamilyID, {
              ColorFamilyID: color.ColorFamilyID,
              ColorFamilyName: color.ColorFamilyName,
            });
          }
        }
      });

      const uniqueColorFamilies = Array.from(colorFamiliesMap.values());
      setallColors(uniqueColorFamilies);
    } catch (error) {
      console.error('Error fetching color families:', error);
      setallColors([]);
    }
  }, [
    selectedSubCategory?.SubCat_ID,
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
  ]);

  useEffect(() => {
    GetColorFamilies();
    setValue('Color', null);
    // eslint-disable-next-line
  }, [GetColorFamilies, setValue, selectedSubCategory]);

  // Fetch Categories based on ClassID
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

  // Fetch Sub Categories based on Category
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

  // Load existing data when currentData is available
  useEffect(() => {
    if (currentData && !isLoading && allClasses.length > 0 && allBlendTypes.length > 0) {
      // Set Fiber Class first
      const fiberClass = allClasses.find((cls) => cls.ClassID === 2);
      if (fiberClass) {
        setValue('FiberClass', {
          ClassID: fiberClass.ClassID,
          ClassName: fiberClass.ClassName,
          isColorSensitive: fiberClass.isColorSensitive,
        });
      }

      // Set Blend Type (Fiber Class)
      if (currentData.BlendTypeID) {
        const blendType = allBlendTypes.find(
          (bt) => bt.Blend_Type_ID === currentData.BlendTypeID
        );
        if (blendType) {
          setValue('ClassID', blendType);
        }
      }

      // Set Category
      if (currentData.InvCatID && allCategoryData.length > 0) {
        const category = allCategoryData.find(
          (cat) => cat.Inv_Cat_ID === currentData.InvCatID
        );
        if (category) {
          setValue('Inv_Cat_Name', category);
        }
      }
    }
  }, [
    currentData,
    isLoading,
    allClasses,
    allBlendTypes,
    allCategoryData,
    setValue,
  ]);

  // Load Sub Category after Category is set
  useEffect(() => {
    if (
      currentData?.InvSubCatID &&
      selectedCategory?.Inv_Cat_ID &&
      itemSubCategory.length > 0
    ) {
      const subCategory = itemSubCategory.find(
        (sub) => sub.SubCat_ID === currentData.InvSubCatID
      );
      if (subCategory) {
        setValue('ItemSubCategory', subCategory);
      }
    }
  }, [currentData, selectedCategory, itemSubCategory, setValue]);

  // Load Color after Sub Category is set
  useEffect(() => {
    if (
      currentData?.ColorFamilyID &&
      selectedSubCategory?.SubCat_ID &&
      allColors.length > 0
    ) {
      const color = allColors.find(
        (colorItem) => colorItem.ColorFamilyID === currentData.ColorFamilyID
      );
      if (color) {
        setValue('Color', color);
      }
    }
  }, [currentData, selectedSubCategory, allColors, setValue]);

  // Load Origin
  useEffect(() => {
    if (currentData?.OriginID && AllOrigins.length > 0) {
      const origin = AllOrigins.find(
        (originItem) => originItem.Origin_ID === currentData.OriginID
      );
      if (origin) {
        setValue('Origin', origin);
      }
    }
  }, [currentData, AllOrigins, setValue]);

  // Load Price
  useEffect(() => {
    if (currentData?.Price) {
      setValue('PPK', currentData.Price);
    }
  }, [currentData, setValue]);

  // Set loading to false after initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        fetchOrigins(),
        fetchBlendTypes(),
        FetchAllCategoryData(),
      ]);
      setLoading(false);
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        CostingPlanID: currentData?.CostingPlanID || currentData?.ID || 0,
        BlendTypeID: data.ClassID?.Blend_Type_ID || 0,
        InvCatID: data.Inv_Cat_Name?.Inv_Cat_ID || 0,
        InvSubCatID: data.ItemSubCategory?.SubCat_ID || 0,
        ColorFamilyID: data.Color?.ColorFamilyID || 0,
        OriginID: data.Origin?.Origin_ID || 0,
        Price: parseFloat(data.PPK) || 0,
        isActive: currentData?.isActive !== undefined ? currentData.isActive : 1,
        UpdatedBy: userData?.userDetails?.userId || 0,
        Branch_ID: userData?.userDetails?.branchID || 0,
        Org_ID: userData?.userDetails?.orgId || 0,
      };

      console.log('Update Request Data:', requestData);

      const response = await Put(`AICosting/Update`, requestData);

      if (response?.data?.Success || response?.data?.success || response?.status === 200) {
        enqueueSnackbar('Material Price updated successfully!', {
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
        setTimeout(() => {
          router.push(paths.dashboard.AIPlans.CostingPlan.root);
        }, 500);
      } else {
        const errorMsg =
          response?.data?.Message ||
          response?.data?.message ||
          'Failed to update material price';
        enqueueSnackbar(errorMsg, {
          variant: 'error',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        });
      }
    } catch (error) {
      console.error('Update Error:', error);
      let errorMessage = 'Failed to update material price';
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
                    />
                  </Box>
                </Stack>
              </Box>

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
                disabled={!selectedSubCategory?.SubCat_ID}
              />

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

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={isSubmitting}
              >
                Update Material Price
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

CostingPlanEditForm.propTypes = {
  currentData: PropTypes.any,
};
