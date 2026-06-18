import * as Yup from 'yup';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFUpload,
  RHFUploadBox,
} from 'src/components/hook-form';
import { Get, Post } from 'src/api/apibasemethods';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import {
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { borderBottom, borderColor } from '@mui/system';
import RecipeItemsTable from './RecipeItemsTable';
import { DatePicker } from '@mui/x-date-pickers';
import Image from 'src/components/image';
import EmptyContent from 'src/components/empty-content';
import { fNumber } from 'src/utils/format-number';

export default function ProductionAdd() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('UserData'));

  // State for dropdown options
  const [colorFamilies, setColorFamilies] = useState([]);
  const [businessYear, setbusinessYear] = useState([]);
  const [months, setMonths] = useState([]);
  const [Color, setColor] = useState([]);
  const [YarnCount, setYarnCount] = useState([]);
  const [YarnType, setYarnType] = useState([]);
  const [Composition, setComposition] = useState([]);
  const [Recipe, setRecipe] = useState([]);
  const [open, setOpen] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [detail, setDetail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recipesByCustomer, setRecipesByCustomer] = useState({});
  const [recipesDetailsCache, setRecipesDetailsCache] = useState({});
  const [recipeDetailsByIndex, setRecipeDetailsByIndex] = useState({});

  const ProductionOrderSchema = Yup.object().shape({
    Date: Yup.date().required('Date is required'),
    BusinessYear: Yup.object().required('Business Year is required'),
    month: Yup.object().required('Month is required'),
    color: Yup.object().required('Color is required'),
    yarncount: Yup.object().required('Yarn Count is required'),
    yarntype: Yup.object().required('Yarn Type is required'),
    composition: Yup.object().required('Composition is required'),
    dataList: Yup.array()
      .of(
        Yup.object().shape({
          RecipeID: Yup.object().required('Recipe is required'),
          RequiredDate: Yup.date().required('Required Date is required'),
        })
      )
      .min(1, 'At least one production item is required'),
  });

  // const defaultValues = useMemo(() => ({
  //   Recipe_Name: '',
  //   customer: null,
  //   Blend: null,
  //   swatch_color: '',
  //   colorfamily: null,
  //   goalcolor: null,
  //   recipeItems: [...recipeItems],
  //   CreatedBy: userData?.userDetails?.userId || 1,
  // }), [recipeItems, userData]);

  const methods = useForm({
    resolver: yupResolver(ProductionOrderSchema),
    // defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { isSubmitting, errors },
    trigger,
  } = methods;

  const values = watch();

  // Separate API call functions
  const fetchBusinessYears = useCallback(async () => {
    try {
      const response = await Get(
        `Production/GetBusinessYears?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      const updatedyears =
        response.data?.Data.map((item, index) => ({
          BusinessYear: item.BusinessYear,
          id: item.BusinessYear,
        })) || [];
      setbusinessYear(updatedyears);
      // setValue("BusinessYear", null);
    } catch (error) {
      console.error('Error fetching Year:', error);
      throw error;
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const fetchBusinessMonths = useCallback(async () => {
    try {
      if (values?.BusinessYear) {
        const response = await Get(
          `Production/GetBusinessMonths?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&BusinessYear=${values?.BusinessYear?.BusinessYear}`
        );
        setMonths(response.data?.Data || []);
      }
    } catch (error) {
      console.error('Error fetching Months:', error);
      throw error;
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, values?.BusinessYear]);

  const fetchColors = useCallback(async () => {
    try {
      if (values?.BusinessYear && values?.month) {
        const response = await Get(
          `Production/GetColors?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&Year=${values?.BusinessYear?.BusinessYear}&Month=${values?.month?.BusinessMonth}`
        );
        const newdata = response?.data?.Data || [];

        setColor(newdata);
        // setValue("color", null);
      }
    } catch (error) {
      console.error('Error fetching Colors:', error);
      throw error;
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    values?.month,
    values?.BusinessYear,
  ]);

  const fetchYarnCount = useCallback(async () => {
    try {
      if (values?.BusinessYear && values?.month && values?.color) {
        const response = await Get(
          `Production/GetYarnCounts?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&Year=${values?.BusinessYear?.BusinessYear}&Month=${values?.month?.BusinessMonth}&ColorID=${values?.color?.ColorID}`
        );
        setYarnCount(response.data?.Data || []);
      }
    } catch (error) {
      console.error('Error fetching Yarn Count:', error);
      throw error;
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    values?.month,
    values?.BusinessYear,
    values?.color,
  ]);

  const fetchYarnType = useCallback(async () => {
    try {
      if (values?.BusinessYear && values?.month && values?.color && values?.yarncount) {
        const response = await Get(
          `Production/GetYarnTypes?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&Year=${values?.BusinessYear?.BusinessYear}&Month=${values?.month?.BusinessMonth}&ColorID=${values?.color?.ColorID}&CountID=${values?.yarncount?.Yarn_Count_ID}`
        );
        setYarnType(response.data?.Data || []);
      }
    } catch (error) {
      console.error('Error fetching Months:', error);
      throw error;
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    values?.month,
    values?.BusinessYear,
    values?.color,
    values?.yarncount,
  ]);

  const fetchComposition = useCallback(async () => {
    try {
      if (
        values?.BusinessYear &&
        values?.month &&
        values?.color &&
        values?.yarncount &&
        values?.yarntype
      ) {
        const response = await Get(
          `Production/GetCompositions?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&Year=${values?.BusinessYear?.BusinessYear}&Month=${values?.month?.BusinessMonth}&ColorID=${values?.color?.ColorID}&CountID=${values?.yarncount?.Yarn_Count_ID}&YarnTypeID=${values?.yarntype?.Yarn_Type_ID}`
        );
        setComposition(response.data?.Data || []);
      }
    } catch (error) {
      console.error('Error fetching Months:', error);
      throw error;
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    values?.month,
    values?.BusinessYear,
    values?.color,
    values?.yarncount,
    values?.yarntype,
  ]);

  const fetchPIdetails = useCallback(async () => {
    try {
      if (
        values?.BusinessYear &&
        values?.month &&
        values?.color &&
        values?.yarncount &&
        values?.yarntype &&
        values?.composition
      ) {
        const response = await Get(
          `Production/GetPIDetailsByComposition?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&Year=${values?.BusinessYear?.BusinessYear}&Month=${values?.month?.BusinessMonth}&ColorID=${values?.color?.ColorID}&CountID=${values?.yarncount?.Yarn_Count_ID}&YarnTypeID=${values?.yarntype?.Yarn_Type_ID}&CompositionID=${values?.composition?.Composition_ID}`
        );
        setDataList(response.data?.Data || []);
      }
    } catch (error) {
      console.error('Error fetching Months:', error);
      throw error;
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    values?.month,
    values?.BusinessYear,
    values?.color,
    values?.yarncount,
    values?.yarntype,
    values?.composition,
  ]);

  const fetchColorFamilies = useCallback(async () => {
    try {
      const response = await Get(
        `Production/GetColorFamilies?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setColorFamilies(response.data?.Data || []);
    } catch (error) {
      console.error('Error fetching color families:', error);
      throw error;
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const fetchRecipes = useCallback(
    async (WIC_ID) => {
      try {
        const response = await Get(
          `Production/GetRecipeByCustomer?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&CustomerID=${WIC_ID}`
        );
        // Update state: add recipes for this WIC_ID
        setRecipesByCustomer((prev) => ({
          ...prev,
          [WIC_ID]: response.data?.Data || [],
        }));
      } catch (error) {
        console.error('Error fetching Recipes:', error);
        throw error;
      }
    },
    [userData?.userDetails?.orgId, userData?.userDetails?.branchID]
  );

  // const fetchRecipesDetails = useCallback(async (RecipeID) => {
  //   // Check if already in cache
  //   if (recipesDetailsCache[RecipeID]) {
  //     setDetail(recipesDetailsCache[RecipeID]);
  //     return recipesDetailsCache[RecipeID];
  //   }

  //   try {
  //     const response = await Get(
  //       `Production/GetRecipeDetailsByRecipeId?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&RecipeID=${RecipeID}`
  //     );

  //     const recipeDetails = response.data?.Data || [];

  //     // Update cache
  //     setRecipesDetailsCache(prev => ({
  //       ...prev,
  //       [RecipeID]: recipeDetails
  //     }));

  //     setDetail(recipeDetails);
  //     return recipeDetails;
  //   } catch (error) {
  //     console.error('Error fetching Recipe Details:', error);
  //     throw error;
  //   }
  // }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, recipesDetailsCache]);

  // Data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchColorFamilies(),
          fetchBusinessYears(),
          fetchBusinessMonths(),
          fetchColors(),
          fetchYarnCount(),
          fetchYarnType(),
          fetchComposition(),
          fetchPIdetails(),
        ]);
      } catch (error) {
        enqueueSnackbar('Error loading dropdown data', { variant: 'error' });
        console.error('Error in fetchData:', error);
      }
    };

    fetchData();
  }, [
    fetchBusinessYears,
    fetchBusinessMonths,
    fetchColorFamilies,
    fetchYarnCount,
    fetchColors,
    fetchYarnType,
    fetchComposition,
    fetchPIdetails,
    enqueueSnackbar,
  ]);
  useEffect(() => {
    if (dataList.length > 0) {
      // Get unique WIC_IDs from dataList
      const uniqueWICIDs = [...new Set(dataList.map((item) => item.WIC_ID))];
      uniqueWICIDs.forEach((WIC_ID) => {
        // Only fetch if not already in state
        if (!recipesByCustomer[WIC_ID]) {
          fetchRecipes(WIC_ID);
        }
      });
    }
  }, [dataList, fetchRecipes, recipesByCustomer]);
  const fetchRecipesDetails = useCallback(
    async (RecipeID, index) => {
      // Check if already in cache
      if (recipesDetailsCache[RecipeID]) {
        // Update details for this specific index
        setRecipeDetailsByIndex((prev) => ({
          ...prev,
          [index]: recipesDetailsCache[RecipeID],
        }));
        return recipesDetailsCache[RecipeID];
      }

      try {
        const response = await Get(
          `Production/GetRecipeDetailsByRecipeId?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&RecipeID=${RecipeID}`
        );

        const recipeDetails = response.data?.Data || [];

        // Update cache
        setRecipesDetailsCache((prev) => ({
          ...prev,
          [RecipeID]: recipeDetails,
        }));

        // Update details for this specific index
        setRecipeDetailsByIndex((prev) => ({
          ...prev,
          [index]: recipeDetails,
        }));

        return recipeDetails;
      } catch (error) {
        console.error('Error fetching Recipe Details:', error);
        throw error;
      }
    },
    [userData?.userDetails?.orgId, userData?.userDetails?.branchID, recipesDetailsCache]
  );

  // NEW: Watch for recipe changes and automatically fetch details
  const watchedDataList = useWatch({ control, name: 'dataList' });

  useEffect(() => {
    if (watchedDataList) {
      watchedDataList.forEach((item, index) => {
        if (item?.RecipeID) {
          const recipeId = item.RecipeID?.RecipeID || item.RecipeID;
          // Only fetch if we don't already have details for this recipe at this index
          if (
            recipeId &&
            (!recipeDetailsByIndex[index] || recipeDetailsByIndex[index][0]?.RecipeID !== recipeId)
          ) {
            fetchRecipesDetails(recipeId, index);
          }
        }
      });
    }
  }, [watchedDataList, fetchRecipesDetails, recipeDetailsByIndex]);

  const handleOpen = async (row, index) => {
    const selectedRecipeID = watch(`dataList[${index}].RecipeID`);

    if (selectedRecipeID) {
      const recipeId = selectedRecipeID.RecipeID || selectedRecipeID;

      // Use the already fetched details if available
      if (recipeDetailsByIndex[index]) {
        const detailWithQty = recipeDetailsByIndex[index].map((d) => ({
          ...d,
          PIQuantity: row.PIQty,
        }));
        setDetail(detailWithQty);
      } else {
        // Otherwise fetch them
        const data = await fetchRecipesDetails(recipeId, index);
        const detailWithQty = data.map((d) => ({
          ...d,
          PIQuantity: row.PIQty,
        }));
        setDetail(detailWithQty);
      }

      setOpen(true);
    }
  };

  const formatDateToUTC = (date) => {
    if (!date) return null;
    const dateObj = new Date(date);
    return dateObj.toISOString();
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      await ProductionOrderSchema.validate(data, { abortEarly: false });

      // Prepare the request body according to your API structure
      const requestBody = {
        ProductionOrderDate: formatDateToUTC(data.Date),
        CreatedBy: userData?.userDetails?.userId || 101,
        Branch_ID: userData?.userDetails?.branchID || 1,
        Org_ID: userData?.userDetails?.orgId || 10,
        Details: data.dataList.map((item, index) => {
          const originalItem = dataList[index];
          const recipeDetails = recipeDetailsByIndex[index] || [];

          return {
            PIID: originalItem.PIID || 5000 + index,
            PIDtlID: originalItem.PIDtlID || 7000 + index,
            RecipeID: item.RecipeID?.RecipeID || item.RecipeID,
            RequiredQty: originalItem.PIQty || 0,
            RequiredDate: formatDateToUTC(item.RequiredDate),
            Remarks: `Production item ${index + 1}`,
            SubDetails: recipeDetails.map((detailItem, detailIndex) => ({
              RecipeDtlID: detailItem.RecipeDtlID || 9000 + detailIndex,
              RequiredQty: (
                ((originalItem.PIQty * detailItem.RequiredPercentage) / 100) *
                1.1
              ).toFixed(2),
            })),
          };
        }),
      };

      console.log('Submitting data:', requestBody);

      // Make the API call
      const response = await Post('Production/SaveProductionOrder', requestBody);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Production order saved successfully', { variant: 'success' });
        navigate(paths.dashboard.Production.Planning.production.root);
        reset();
      } else {
        enqueueSnackbar('Error saving production order', { variant: 'error' });
      }
    } catch (error) {
      console.error('Submission error:', error);

      if (error instanceof Yup.ValidationError) {
        error.inner.forEach((validationError) => {
          enqueueSnackbar(validationError.message, {
            variant: 'error',
            autoHideDuration: 5000,
          });
        });
      } else {
        enqueueSnackbar(error.message || 'Error submitting form', {
          variant: 'error',
          autoHideDuration: 5000,
        });
      }
    }
  });

  useEffect(() => {
    setValue('month', null);
    setValue('color', null);
    setValue('yarncount', null);
    setValue('yarntype', null);
    setValue('composition', null);
    setDataList([]);
    // eslint-disable-next-line
  }, [values?.BusinessYear]);
  useEffect(() => {
    setValue('color', null);
    setValue('yarncount', null);
    setValue('yarntype', null);
    setValue('composition', null);
    setDataList([]);
    // eslint-disable-next-line
  }, [values?.month]);
  useEffect(() => {
    setValue('yarncount', null);
    setValue('yarntype', null);
    setValue('composition', null);
    setDataList([]);
    // eslint-disable-next-line
  }, [values.color]);
  useEffect(() => {
    setValue('yarntype', null);
    setValue('composition', null);
    setDataList([]);
    // eslint-disable-next-line
  }, [values.yarncount]);
  useEffect(() => {
    setValue('composition', null);
    setDataList([]);
    // eslint-disable-next-line
  }, [values.yarntype]);
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Recipe Information */}
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
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
              {/* <Typography
                variant="h6"
                sx={{
                  p: 2,
                  my: 0.5,
                  borderBottom: '1px solid #e0e0e0',
                  width: 1,
                  gridColumn: {
                    xs: 'span 1',
                    sm: 'span 2',
                    md: 'span 1',
                  },
                }}
              >
                Recipe Program
              </Typography> */}

              {/* <RHFTextField name="PONO" label="Production Order No" /> */}
              <Controller
                name="Date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Date"
                    format="dd MMM yyyy"
                    value={field.value}
                    onChange={(newValue) => field.onChange(newValue)}
                    renderInput={(params) => <TextField {...params} />}
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
                name="BusinessYear"
                label="Business Year"
                options={businessYear}
                getOptionLabel={(option) => option.BusinessYear}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={values.BusinessYear || null}
              />

              <RHFAutocomplete
                name="month"
                label="Month"
                options={months}
                getOptionLabel={(option) => option.BusinessMonth}
                isOptionEqualToValue={(option, value) => option.MonthNumber === value.MonthNumber}
                value={values.month || null}
              />

              <RHFAutocomplete
                name="color"
                label="Color"
                options={Color}
                getOptionLabel={(option) => option.Color_and_Code}
                isOptionEqualToValue={(option, value) => option.ColorID === value.ColorID}
                value={values.color || null}
              />

              <RHFAutocomplete
                name="yarncount"
                label="Yarn Count"
                options={YarnCount}
                getOptionLabel={(option) => option.Yarn_Count_Name}
                isOptionEqualToValue={(option, value) =>
                  option.Yarn_Count_ID === value.Yarn_Count_ID
                }
                value={values.yarncount || null}
              />

              <RHFAutocomplete
                name="yarntype"
                label="Yarn Type"
                options={YarnType}
                getOptionLabel={(option) => option.Yarn_Type}
                isOptionEqualToValue={(option, value) => option.Yarn_Type_ID === value.Yarn_Type_ID}
                value={values.yarntype || null}
              />

              <RHFAutocomplete
                name="composition"
                label="Composition"
                options={Composition}
                getOptionLabel={(option) => option.Composition_Name}
                isOptionEqualToValue={(option, value) =>
                  option.Composition_ID === value.Composition_ID
                }
                value={values.composition || null}
              />
            </Box>
          </Card>
        </Grid>

        {/* Recipe Items */}
        <Grid xs={12} md={12}>
          {dataList.length > 0 && (
            <Card sx={{ p: 3 }}>
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
                <Typography
                  variant="h6"
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    width: 1,
                    pb: 1,
                    gridColumn: {
                      xs: 'span 1',
                      sm: 'span 2',
                      md: 'span 3',
                    },
                  }}
                >
                  Production Items
                </Typography>

                <Box sx={{ gridColumn: { sm: 'span 2', md: 'span 3' } }}>
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Scrollbar>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ minWidth: 100 }}>PI No.</TableCell>
                            <TableCell sx={{ minWidth: 150 }}>Customer Name</TableCell>
                            <TableCell sx={{ minWidth: 130 }}>Item Code</TableCell>

                            <TableCell sx={{ minWidth: 200 }}>Product Description</TableCell>
                            <TableCell sx={{ minWidth: 130 }}>PI Quantity</TableCell>
                            <TableCell sx={{ minWidth: 100 }}>Unit</TableCell>
                            <TableCell sx={{ minWidth: 150 }}>Recipe</TableCell>
                            <TableCell align="center" sx={{ minWidth: 120 }}>
                              Details
                            </TableCell>
                            <TableCell sx={{ minWidth: 200 }}>Required Date</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dataList.map((row, index) => {
                            const recipes = recipesByCustomer[row.WIC_ID] || [];
                            return (
                              <TableRow key={index}>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.PINo}</TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.WIC_Name}</TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.Item_Code}</TableCell>
                                <Tooltip title={row.Description || '-'} arrow>
                                  <TableCell
                                    sx={{
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      maxWidth: 200,
                                    }}
                                  >
                                    <span>{row.Description}</span>
                                  </TableCell>
                                </Tooltip>
                                {/* <TableCell sx={{whiteSpace: "nowrap"}}>{row.Description}</TableCell> */}
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>{`${fNumber(row.PIQty)} ${row.Unit
                                  }`}</TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.Unit}</TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                  <RHFAutocomplete
                                    name={`dataList[${index}].RecipeID`}
                                    label="Recipe"
                                    options={recipes}
                                    getOptionLabel={(option) => option.RecipeName || ''}
                                    isOptionEqualToValue={(option, value) =>
                                      option.RecipeID === value.RecipeID
                                    }
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <IconButton
                                    onClick={() => handleOpen(row, index)} // Pass the row and index
                                    disabled={!watch(`dataList[${index}].RecipeID`)} // Disable if no recipe selected
                                  >
                                    <Iconify icon="hugeicons:property-view" />
                                  </IconButton>
                                </TableCell>

                                <TableCell>
                                  <Controller
                                    name={`dataList[${index}].RequiredDate`}
                                    control={control}
                                    render={({ field, fieldState: { error } }) => (
                                      <DatePicker
                                        label="Required Date"
                                        format="dd MMM yyyy"
                                        value={field.value}
                                        onChange={(newValue) => field.onChange(newValue)}
                                        renderInput={(params) => <TextField {...params} />}
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
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </Scrollbar>
                  </TableContainer>
                </Box>
              </Box>
            </Card>
          )}
        </Grid>
        <Dialog open={open} fullWidth maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <DialogTitle>Recipe Items</DialogTitle>
          </Box>
          <DialogContent>
            {/* Data Table Inside Dialog */}

            {detail.length > 0 ? (
              <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 400 }}>
                <Scrollbar>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ minWidth: 100 }}>Sub Category</TableCell>
                        {/* <TableCell sx={{ minWidth: 100 }}>Material Type</TableCell> */}
                        <TableCell sx={{ minWidth: 130 }}>Pantone Code</TableCell>

                        <TableCell sx={{ minWidth: 120 }}>Item</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>Color Name</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>Color Picture</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>%</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>Required Qty (KG +10%)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        // eslint-disable-next-line
                        detail.map((row, index) => {
                          return (
                            <TableRow key={index}>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.SubCat_Name}</TableCell>
                              {/* <TableCell>{row.MaterialTypeName}</TableCell> */}
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.HexCode}</TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {row.ItemDescription}
                              </TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.ColorName}</TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                <Avatar
                                  alt={row.ColorName}
                                  src={row.ColorPictureURL || '/assets/images/no-image.jpg'}
                                  variant="square"
                                  sx={{
                                    width: 56,
                                    height: 56,
                                    '& img': {
                                      objectFit: 'contain',
                                    },
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {row.RequiredPercentage}%
                              </TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {fNumber(((row.PIQuantity * row.RequiredPercentage) / 100) * 1.1)}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      }
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
            ) : (
              <EmptyContent title="No Data" />
            )}
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {/* <Button variant="contained" onClick={() => setOpen(false)} loading={isSubmitting}>
              Save Production
            </Button> */}
          </DialogActions>
        </Dialog>
        {/* Submit Button */}
        <Grid xs={12} md={12}>
          <Stack spacing={3} alignItems="flex-end">
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              Save Production
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
