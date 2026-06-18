import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Button,
  TableFooter,
  Typography,
  FormHelperText,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { RHFAutocomplete, RHFTextField, RHFUploadBox } from 'src/components/hook-form';
import { Get } from 'src/api/apibasemethods';
import { useSnackbar } from 'src/components/snackbar';
import { useWatch } from 'react-hook-form';
import PropTypes from 'prop-types';

const RecipeItemsTable = ({ control, setValue, formValues, errors, trigger }) => {
  const { enqueueSnackbar } = useSnackbar();
  const userData = JSON.parse(localStorage.getItem('UserData'));

  // State for dropdown options
  const [subCategories, setSubCategories] = useState([]);
  const [materialTypes, setMaterialTypes] = useState([]);
  const [items, setItems] = useState([]);
  const [colorFamilies, setColorFamilies] = useState([]);
  const [colors, setColors] = useState([]);

  // Use form values directly instead of local state
  const watchedItems = useWatch({
    control,
    name: 'recipeItems',
    defaultValue: formValues.recipeItems || [
      {
        subCategory: null,
        materialType: null,
        item: null,
        colorFamily: null,
        color: null,
        dataColor: '',
        hex: '',
        percentage: '',
        colorPicture: null,
      },
    ],
  });

  // Ensure recipeItems always exists in form values
  useEffect(() => {
    if (!formValues.recipeItems || formValues.recipeItems.length === 0) {
      setValue('recipeItems', [
        {
          subCategory: null,
          materialType: null,
          item: null,
          colorFamily: null,
          color: null,
          dataColor: '',
          hex: '',
          percentage: '',
          colorPicture: null,
        },
      ]);
    }
  }, [formValues.recipeItems, setValue]);

  // API calls
  const fetchSubCategories = useCallback(async () => {
    try {
      const response = await Get(
        `Production/GetSubCategories?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setSubCategories(response.data?.Data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      enqueueSnackbar('Failed to load subcategories', { variant: 'error' });
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  const fetchMaterialTypes = useCallback(
    async (subCatId) => {
      try {
        if (!subCatId) {
          setMaterialTypes([]);
          setItems([]);
          return;
        }
        const response = await Get(
          `Production/GetMaterialTypes?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&SubCat_ID=${subCatId}`
        );
        setMaterialTypes(response.data?.Data || []);
        setItems([]);
      } catch (error) {
        console.error('Error fetching material types:', error);
        enqueueSnackbar('Failed to load material types', { variant: 'error' });
      }
    },
    [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]
  );

  const fetchItems = useCallback(
    async (subCatId, materialTypeId) => {
      try {
        if (!subCatId || !materialTypeId) {
          setItems([]);
          return;
        }
        const response = await Get(
          `Production/GetItemSpecifications?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&SubCat_ID=${subCatId}&MaterialTypeID=${materialTypeId}`
        );
        setItems(response.data?.Data || []);
      } catch (error) {
        console.error('Error fetching items:', error);
        enqueueSnackbar('Failed to load items', { variant: 'error' });
      }
    },
    [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]
  );

  const fetchColorFamilies = useCallback(async () => {
    try {
      const response = await Get(
        `Production/GetColorFamilies?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setColorFamilies(response.data?.Data || []);
    } catch (error) {
      console.error('Error fetching color families:', error);
      enqueueSnackbar('Failed to load color families', { variant: 'error' });
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  const fetchColors = useCallback(
    async (colorFamilyId) => {
      try {
        if (!colorFamilyId) {
          setColors([]);
          return;
        }
        const response = await Get(
          `Production/GetColors?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&ColorFamilyID=${colorFamilyId}`
        );
        setColors(response.data?.Data || []);
      } catch (error) {
        console.error('Error fetching colors:', error);
        enqueueSnackbar('Failed to load colors', { variant: 'error' });
      }
    },
    [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]
  );

  // Initialize data
  useEffect(() => {
    fetchSubCategories();
    fetchColorFamilies();
  }, [fetchSubCategories, fetchColorFamilies]);

  const hasDuplicateColors = useMemo(() => {
    const colorIds = watchedItems.map((item) => item?.color?.ColorID).filter(Boolean); // Remove null/undefined

    return new Set(colorIds).size !== colorIds.length;
  }, [watchedItems]);

  // Validate before adding new item
  const validateBeforeAdd = () => {
    if (hasDuplicateColors) {
      enqueueSnackbar('Duplicate colors are not allowed', { variant: 'error' });
      return false;
    }
    return true;
  };

  const handleAddRecipeItem = async () => {
    if (!validateBeforeAdd()) return;

    const newItem = {
      subCategory: null,
      materialType: null,
      item: null,
      colorFamily: null,
      color: null,
      dataColor: '',
      hex: '',
      percentage: '',
      colorPicture: null,
    };

    // Update form values directly
    const currentItems = formValues.recipeItems || [];
    setValue('recipeItems', [...currentItems, newItem]);

    // Trigger validation after adding
    setTimeout(() => trigger('recipeItems'), 100);
  };

  const handleDeleteRecipeItem = async (index) => {
    const currentItems = formValues.recipeItems || [];
    if (currentItems.length > 1) {
      const updatedItems = currentItems.filter((_, i) => i !== index);
      setValue('recipeItems', updatedItems);

      // Trigger validation after deletion
      setTimeout(() => trigger('recipeItems'), 100);
    }
  };

  const handleFileUpload = (index, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const currentItems = [...(formValues.recipeItems || [])];
      currentItems[index] = {
        ...currentItems[index],
        colorPicture: {
          file,
          preview: reader.result,
          name: file.name,
          type: file.type,
        },
      };
      setValue(`recipeItems[${index}].colorPicture`, currentItems[index].colorPicture);
    };
    reader.onerror = () => {
      console.error('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  // Handle field changes that trigger API calls
  const handleSubCategoryChange = async (index, value) => {
    const currentItems = [...(formValues.recipeItems || [])];
    currentItems[index] = {
      ...currentItems[index],
      subCategory: value,
      materialType: null,
      item: null,
    };

    setValue(`recipeItems[${index}].subCategory`, value);
    setValue(`recipeItems[${index}].materialType`, null);
    setValue(`recipeItems[${index}].item`, null);

    if (value?.SubCat_ID) {
      fetchMaterialTypes(value.SubCat_ID);
    }

    // Trigger validation after change
    setTimeout(() => trigger(`recipeItems[${index}].subCategory`), 100);
  };

  const handleMaterialTypeChange = async (index, value) => {
    const currentItems = [...(formValues.recipeItems || [])];
    currentItems[index] = {
      ...currentItems[index],
      materialType: value,
      item: null,
    };

    setValue(`recipeItems[${index}].materialType`, value);
    setValue(`recipeItems[${index}].item`, null);

    if (value?.MaterialTypeID && currentItems[index]?.subCategory?.SubCat_ID) {
      fetchItems(currentItems[index].subCategory.SubCat_ID, value.MaterialTypeID);
    }

    // Trigger validation after change
    setTimeout(() => trigger(`recipeItems[${index}].materialType`), 100);
  };

  const handleColorFamilyChange = async (index, value) => {
    const currentItems = [...(formValues.recipeItems || [])];
    currentItems[index] = {
      ...currentItems[index],
      colorFamily: value,
      color: null,
    };

    setValue(`recipeItems[${index}].colorFamily`, value);
    setValue(`recipeItems[${index}].color`, null);

    if (value?.ColorFamilyID) {
      fetchColors(value.ColorFamilyID);
    }

    // Trigger validation after change
    setTimeout(() => trigger(`recipeItems[${index}].colorFamily`), 100);
  };

  const totalPercentage = useMemo(
    () =>
      (watchedItems || []).reduce((total, item) => {
        const percentage = parseFloat(item?.percentage) || 0;
        return total + percentage;
      }, 0),
    [watchedItems]
  );

  const handlePercentageChange = async (index, value) => {
    // Handle empty string (when clearing the input)
    if (value === '') {
      setValue(`recipeItems[${index}].percentage`, '');
      return;
    }

    // Parse the value
    const numValue = parseFloat(value);

    // If not a number, don't update
    if (Number.isNaN(numValue)) return;

    // Ensure percentage is between 0 and 100
    const clampedValue = Math.min(100, Math.max(0, numValue));
    setValue(`recipeItems[${index}].percentage`, clampedValue);

    // Trigger validation after change
    setTimeout(() => trigger('recipeItems'), 100);
  };

  // Get the current recipe items from form values
  const currentRecipeItems = formValues.recipeItems || [];

  // Get error messages
  const recipeItemsError = errors?.recipeItems;
  const isArrayError = Array.isArray(recipeItemsError);

  return (
    <>
      <TableContainer component={Paper}>
        <Scrollbar>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 180 }}>Sub Category</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Material Type</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Item</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Color Family</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Color</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Data Color</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Hex</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Percentage</TableCell>
                <TableCell sx={{ minWidth: 150, minHeight: 100 }}>Color Picture</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentRecipeItems.map((item, index) => {
                const rowErrors = isArrayError ? recipeItemsError[index] : null;

                return (
                  <TableRow key={index}>
                    <TableCell>
                      <RHFAutocomplete
                        name={`recipeItems[${index}].subCategory`}
                        label="Sub Category"
                        options={subCategories}
                        getOptionLabel={(option) => option.SubCat_Name}
                        isOptionEqualToValue={(option, value) =>
                          option.SubCat_ID === value?.SubCat_ID
                        }
                        onChange={(_, value) => handleSubCategoryChange(index, value)}
                        value={item.subCategory}
                        error={!!rowErrors?.subCategory}
                      />
                      {/* {rowErrors?.subCategory && (
                                                <FormHelperText error>
                                                    {rowErrors.subCategory.message}
                                                </FormHelperText>
                                            )} */}
                    </TableCell>
                    <TableCell>
                      <RHFAutocomplete
                        name={`recipeItems[${index}].materialType`}
                        label="Material Types"
                        options={materialTypes}
                        getOptionLabel={(option) => option.MaterialTypeName}
                        isOptionEqualToValue={(option, value) =>
                          option.MaterialTypeID === value?.MaterialTypeID
                        }
                        onChange={(_, value) => handleMaterialTypeChange(index, value)}
                        value={item.materialType}
                        error={!!rowErrors?.materialType}
                      />
                      {/* {rowErrors?.materialType && (
                                                <FormHelperText error>
                                                    {rowErrors.materialType.message}
                                                </FormHelperText>
                                            )} */}
                    </TableCell>
                    <TableCell>
                      <RHFAutocomplete
                        name={`recipeItems[${index}].item`}
                        label="Item Specification"
                        options={items}
                        getOptionLabel={(option) => option.Specification}
                        isOptionEqualToValue={(option, value) => option.ItemID === value?.ItemID}
                        value={item.item}
                        onChange={(_, newValue) => {
                          setValue(`recipeItems[${index}].item`, newValue);
                          setTimeout(() => trigger(`recipeItems[${index}].item`), 100);
                        }}
                        error={!!rowErrors?.item}
                      />
                      {/* {rowErrors?.item && (
                                                <FormHelperText error>
                                                    {rowErrors.item.message}
                                                </FormHelperText>
                                            )} */}
                    </TableCell>
                    <TableCell>
                      <RHFAutocomplete
                        name={`recipeItems[${index}].colorFamily`}
                        label="Color Family"
                        options={colorFamilies}
                        getOptionLabel={(option) => option.ColorFamilyName}
                        isOptionEqualToValue={(option, value) =>
                          option.ColorFamilyID === value?.ColorFamilyID
                        }
                        onChange={(_, value) => handleColorFamilyChange(index, value)}
                        value={item.colorFamily}
                        error={!!rowErrors?.colorFamily}
                      />
                      {/* {rowErrors?.colorFamily && (
                                            <FormHelperText error>
                                                {rowErrors.colorFamily.message}
                                            </FormHelperText>
                                        )} */}
                    </TableCell>
                    <TableCell>
                      <RHFAutocomplete
                        name={`recipeItems[${index}].color`}
                        label="Color"
                        options={colors}
                        getOptionLabel={(option) => option.Color_and_Code}
                        isOptionEqualToValue={(option, value) => option.ColorID === value?.ColorID}
                        value={item.color}
                        onChange={(_, newValue) => {
                          setValue(`recipeItems[${index}].color`, newValue);
                          setTimeout(() => trigger(`recipeItems[${index}].color`), 100);
                        }}
                        error={!!rowErrors?.color}
                      />
                      {/* {rowErrors?.color && (
                                            <FormHelperText error>
                                                {rowErrors.color.message}
                                            </FormHelperText>
                                        )} */}
                    </TableCell>
                    <TableCell>
                      <RHFTextField
                        name={`recipeItems[${index}].dataColor`}
                        label="Data Color"
                        fullWidth
                        error={!!rowErrors?.dataColor}
                      />
                    </TableCell>
                    <TableCell>
                      <RHFTextField
                        name={`recipeItems[${index}].hex`}
                        label="#HEX"
                        fullWidth
                        error={!!rowErrors?.hex}
                      />
                    </TableCell>
                    <TableCell>
                      <RHFTextField
                        name={`recipeItems[${index}].percentage`}
                        label="%"
                        type="number"
                        fullWidth
                        onChange={(e) => handlePercentageChange(index, e.target.value)}
                        inputProps={{
                          min: 0,
                          max: 100,
                        }}
                        error={!!rowErrors?.percentage}
                        // helperText={rowErrors?.percentage?.message}
                      />
                    </TableCell>
                    <TableCell sx={{ width: 100, height: 50, position: 'relative' }}>
                      <Tooltip title="Upload Color Picture">
                        <Box
                          sx={{
                            width: '100%',
                            height: '50px',
                            position: 'relative',
                            margin: '0px !important',
                          }}
                        >
                          {item?.colorPicture?.preview ? (
                            <Box
                              component="img"
                              src={item.colorPicture.preview}
                              alt="Color preview"
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                position: 'absolute',
                                margin: '0px !important',
                              }}
                            />
                          ) : (
                            <RHFUploadBox
                              name={`recipeItems[${index}].colorPicture`}
                              accept={{ 'image/*': ['.jpg', '.png', '.jpeg'] }}
                              onDrop={(acceptedFiles) => handleFileUpload(index, acceptedFiles[0])}
                              sx={{ width: '100%', height: '100%', margin: '0px !important' }}
                            />
                          )}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleDeleteRecipeItem(index)}
                        color="error"
                        disabled={currentRecipeItems.length <= 1}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              {recipeItemsError && !Array.isArray(recipeItemsError) && (
                <TableRow>
                  <TableCell colSpan={12} sx={{ color: 'error.main', textAlign: 'center' }}>
                    {recipeItemsError.message}
                  </TableCell>
                </TableRow>
              )}
              {/* {hasDuplicateColors && (
                                <TableRow>
                                    <TableCell colSpan={12} sx={{ color: 'error.main', textAlign: 'center' }}>
                                        Error: Duplicate colors detected
                                    </TableCell>
                                </TableRow>
                            )} */}
            </TableFooter>
          </Table>
        </Scrollbar>
        {/* <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', p: 1 }}>
                    Total :
                    <Typography variant='body2'
                        sx={{
                            fontWeight: 'bold',
                            color: Math.abs(totalPercentage - 100) < 0.01 ? 'success.main' : 'error.main',
                            ml: 1
                        }}>
                        {totalPercentage.toFixed(2)}%
                    </Typography>
                    {Math.abs(totalPercentage - 100) >= 0.01 && (
                        <FormHelperText error sx={{ ml: 1 }}>
                            Total must equal exactly 100%
                        </FormHelperText>
                    )}
                </Typography> */}
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button variant="contained" color="primary" onClick={handleAddRecipeItem}>
          Add Recipe Items
        </Button>
      </Box>
    </>
  );
};

RecipeItemsTable.propTypes = {
  formValues: PropTypes.object.isRequired,
  control: PropTypes.object.isRequired,
  setValue: PropTypes.func.isRequired,
  errors: PropTypes.object,
  trigger: PropTypes.func.isRequired,
};

export default RecipeItemsTable;
