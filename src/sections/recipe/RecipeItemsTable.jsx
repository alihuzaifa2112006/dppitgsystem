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

const RecipeItemsTable = ({
  control,
  setValue,
  watch,
  formValues,
  errors,
  trigger,
  lotNames = [],
  isEdit,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const userData = JSON.parse(localStorage.getItem('UserData'));

  // State for dropdown options
  const [allClassName, setallClassName] = useState([]);
  const [colorFamilies, setColorFamilies] = useState([]);
  const [colors, setColors] = useState([]);
  const [allInvSpecs, setallInvSpecs] = useState([]);

  // Use form values directly instead of local state
  const watchedItems = useWatch({
    control,
    name: 'recipeItems',
    defaultValue: formValues.recipeItems || [
      {
        class: null,
        category: null,
        subCategory: null,
        item: null,
        colorFamily: null,
        color: null,
        invSpecs: null,
        remarks: '',
        lotName: null,
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
          class: null,
          category: null,
          subCategory: null,
          item: null,
          colorFamily: null,
          color: null,
          invSpecs: null,
          remarks: '',
          lotName: null,
          percentage: '',
          colorPicture: null,
        },
      ]);
    }
  }, [formValues.recipeItems, setValue]);

  // API calls for static data
  const AllClassNameData = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllClasses?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setallClassName(response.data?.Data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      enqueueSnackbar('Failed to load classes', { variant: 'error' });
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

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
          return [];
        }
        const response = await Get(
          `Production/GetColors?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&ColorFamilyID=${colorFamilyId}`
        );
        return response.data?.Data || [];
      } catch (error) {
        console.error('Error fetching colors:', error);
        enqueueSnackbar('Failed to load colors', { variant: 'error' });
        return [];
      }
    },
    [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]
  );

  // Row-specific API calls
  const fetchCategoriesByClass = useCallback(
    async (classId) => {
      try {
        if (!classId) {
          return [];
        }
        const response = await Get(
          `InvCategoryGetByClassId?classId=${classId}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        return response.data || [];
      } catch (error) {
        console.error('Error fetching categories:', error);
        enqueueSnackbar('Failed to load categories', { variant: 'error' });
        return [];
      }
    },
    [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]
  );

  const fetchSubCategoriesByCategory = useCallback(
    async (categoryId) => {
      try {
        if (!categoryId) {
          return [];
        }
        const response = await Get(`GetSubCategoriesByCategoryID/${categoryId}`);
        return response.data?.data || [];
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        enqueueSnackbar('Failed to load subcategories', { variant: 'error' });
        return [];
      }
    },
    [enqueueSnackbar]
  );

  // NEW: Fetch specifications by subcategory
  const FetchAllSpecsByClassID = useCallback(
    async (subCategoryId) => {
      if (subCategoryId) {
        try {
          const response = await Get(
            `GetSpecsBySubcateID?SubcatID=${subCategoryId}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
          );
          return response.data || [];
        } catch (error) {
          console.error('Error fetching specifications:', error);
          enqueueSnackbar('Failed to load specifications', { variant: 'error' });
          return [];
        }
      } else {
        return [];
      }
    },
    [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]
  );

  // NEW: Fetch items based on color or specifications
  const fetchItemsBySubCategory = useCallback(
    async (subCategoryId, color, invSpecs, isColorSensitive) => {
      try {
        if (!subCategoryId) {
          return [];
        }

        let response;

        if (isColorSensitive && color?.ColorID) {
          // Fetch items by color and subcategory
          response = await Get(
            // `GetItemsByColorAndSubCat?subCatID=${subCategoryId}&colorId=${color.ColorID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
            `GetItemsByColor?subCatID=${subCategoryId}&colorId=${color.ColorID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
          );
        } else if (!isColorSensitive && invSpecs?.InvSpecID) {
          // Fetch items by specification
          response = await Get(
            `GetItemsBySpecification?itemSpecId=${invSpecs.InvSpecID}&subCatID=${subCategoryId}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
          );
        } else {
          return [];
        }

        const updatedData =
          response?.data?.map((item) => ({
            ...item,
            ClassID: item?.invTypesID,
            CodeAndDescription: `[${item?.ItemCode}]  ${item?.ItemDescription}`,
            UOM: { UOMName: item?.UOMName || item?.UOMNAME, UOM_ID: item?.UOMID },
          })) || [];

        return updatedData;
      } catch (error) {
        console.error('Error fetching items:', error);
        enqueueSnackbar('Failed to load items', { variant: 'error' });
        return [];
      }
    },
    [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]
  );

  // NEW: Get colors by subcategory (for color-sensitive items)
  const GetColors = useCallback(
    async (subCategoryId) => {
      try {
        if (!subCategoryId) {
          return [];
        }
        const response = await Get(
          `GetColorsBySubCatFromItemDB?subCatId=${subCategoryId}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        return response.data?.data || [];
      } catch (error) {
        console.error('Error fetching colors by subcategory:', error);
        enqueueSnackbar('Failed to load colors', { variant: 'error' });
        return [];
      }
    },
    [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]
  );

  // Initialize static data
  useEffect(() => {
    AllClassNameData();
    fetchColorFamilies();
  }, [AllClassNameData, fetchColorFamilies]);

  // Initialize dependent dropdowns when editing
  useEffect(() => {
    const initializeEditData = async () => {
      if (
        !isEdit ||
        !formValues.recipeItems ||
        formValues.recipeItems.length === 0 ||
        allClassName.length === 0
      ) {
        return;
      }

      // Process each recipe item to fetch dependent options
      const items = formValues.recipeItems || [];
      // eslint-disable-next-line
      for (let index = 0; index < items.length; index++) {
        const item = items[index];

        // Match class with allClassName to get full object including isColorSensitive
        let fullClass = item?.class;
        if (item?.class?.ClassID) {
          const matchedClass = allClassName.find((c) => c.ClassID === item.class.ClassID);
          if (matchedClass) {
            fullClass = matchedClass;
            setValue(`recipeItems[${index}].class`, matchedClass);
          }
        }

        // Fetch categories if class exists
        if (fullClass?.ClassID) {
          // eslint-disable-next-line
          const categories = await fetchCategoriesByClass(fullClass.ClassID);
          setValue(`recipeItems[${index}]._categories`, categories);

          // Fetch subcategories if category exists
          if (item?.category?.Inv_Cat_ID) {
            // eslint-disable-next-line
            const subCategories = await fetchSubCategoriesByCategory(item.category.Inv_Cat_ID);
            setValue(`recipeItems[${index}]._subCategories`, subCategories);

            // Check if class is color-sensitive
            const isColorSensitive = fullClass?.isColorSensitive;

            // Fetch colors or specs based on subcategory
            if (item?.subCategory?.SubCat_ID) {
              if (isColorSensitive) {
                // For color-sensitive items, fetch colors
                // eslint-disable-next-line
                const colorsData = await GetColors(item.subCategory.SubCat_ID);
                setValue(`recipeItems[${index}]._colors`, colorsData);
                setValue(`recipeItems[${index}]._invSpecs`, []);

                // Fetch items if color exists
                if (item?.color?.ColorID) {
                  // eslint-disable-next-line
                  const itemsData = await fetchItemsBySubCategory(
                    item.subCategory.SubCat_ID,
                    item.color,
                    null,
                    isColorSensitive
                  );
                  setValue(`recipeItems[${index}]._items`, itemsData);

                  // Ensure item has CodeAndDescription if it exists
                  if (item?.item?.ItemID && itemsData.length > 0) {
                    const matchedItem = itemsData.find((itm) => itm.ItemID === item.item.ItemID);
                    if (matchedItem) {
                      setValue(`recipeItems[${index}].item`, matchedItem);
                    }
                  }
                }
              } else {
                // For non-color-sensitive items, fetch specifications
                // eslint-disable-next-line
                const specsData = await FetchAllSpecsByClassID(item.subCategory.SubCat_ID);
                setValue(`recipeItems[${index}]._invSpecs`, specsData);
                setValue(`recipeItems[${index}]._colors`, []);

                // Handle invSpecs - might come as MaterialTypeID from API
                let invSpecs = item?.invSpecs;
                if (!invSpecs && item?.MaterialTypeID) {
                  // Match MaterialTypeID with specsData to get full invSpecs object
                  invSpecs = specsData.find((spec) => spec.InvSpecID === item.MaterialTypeID);
                  if (invSpecs) {
                    setValue(`recipeItems[${index}].invSpecs`, invSpecs);
                  }
                }

                // Fetch items if invSpecs exists
                if (invSpecs?.InvSpecID) {
                  // eslint-disable-next-line
                  const itemsData = await fetchItemsBySubCategory(
                    item.subCategory.SubCat_ID,
                    null,
                    invSpecs,
                    isColorSensitive
                  );
                  setValue(`recipeItems[${index}]._items`, itemsData);

                  // Ensure item has CodeAndDescription if it exists
                  if (item?.item?.ItemID && itemsData.length > 0) {
                    const matchedItem = itemsData.find((itm) => itm.ItemID === item.item.ItemID);
                    if (matchedItem) {
                      setValue(`recipeItems[${index}].item`, matchedItem);
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    initializeEditData();
  }, [
    isEdit,
    formValues.recipeItems,
    allClassName,
    setValue,
    fetchCategoriesByClass,
    fetchSubCategoriesByCategory,
    GetColors,
    FetchAllSpecsByClassID,
    fetchItemsBySubCategory,
  ]);

  // Handlers for field changes
  const handleClassChange = async (index, value) => {
    const currentItems = [...(formValues.recipeItems || [])];
    currentItems[index] = {
      ...currentItems[index],
      class: value,
      category: null,
      subCategory: null,
      item: null,
      color: null,
      invSpecs: null,
    };

    setValue(`recipeItems[${index}].class`, value);
    setValue(`recipeItems[${index}].category`, null);
    setValue(`recipeItems[${index}].subCategory`, null);
    setValue(`recipeItems[${index}].item`, null);
    setValue(`recipeItems[${index}].color`, null);
    setValue(`recipeItems[${index}].invSpecs`, null);

    if (value?.ClassID) {
      const categories = await fetchCategoriesByClass(value.ClassID);
      setValue(`recipeItems[${index}]._categories`, categories);
    } else {
      setValue(`recipeItems[${index}]._categories`, []);
    }

    setTimeout(() => trigger(`recipeItems[${index}].class`), 100);
  };

  const handleCategoryChange = async (index, value) => {
    const currentItems = [...(formValues.recipeItems || [])];
    currentItems[index] = {
      ...currentItems[index],
      category: value,
      subCategory: null,
      item: null,
      color: null,
      invSpecs: null,
    };

    setValue(`recipeItems[${index}].category`, value);
    setValue(`recipeItems[${index}].subCategory`, null);
    setValue(`recipeItems[${index}].item`, null);
    setValue(`recipeItems[${index}].color`, null);
    setValue(`recipeItems[${index}].invSpecs`, null);

    if (value?.Inv_Cat_ID) {
      const subCategories = await fetchSubCategoriesByCategory(value.Inv_Cat_ID);
      setValue(`recipeItems[${index}]._subCategories`, subCategories);
    } else {
      setValue(`recipeItems[${index}]._subCategories`, []);
    }

    setTimeout(() => trigger(`recipeItems[${index}].category`), 100);
  };

  const handleSubCategoryChange = async (index, value) => {
    const currentItems = [...(formValues.recipeItems || [])];
    const isColorSensitive = currentItems[index]?.class?.isColorSensitive;

    currentItems[index] = {
      ...currentItems[index],
      subCategory: value,
      item: null,
      color: null,
      invSpecs: null,
    };

    setValue(`recipeItems[${index}].subCategory`, value);
    setValue(`recipeItems[${index}].item`, null);
    setValue(`recipeItems[${index}].color`, null);
    setValue(`recipeItems[${index}].invSpecs`, null);

    if (value?.SubCat_ID) {
      if (isColorSensitive) {
        // For color-sensitive items, fetch colors
        const colorsData = await GetColors(value.SubCat_ID);
        setValue(`recipeItems[${index}]._colors`, colorsData);
        setValue(`recipeItems[${index}]._invSpecs`, []);
      } else {
        // For non-color-sensitive items, fetch specifications
        const specsData = await FetchAllSpecsByClassID(value.SubCat_ID);
        setValue(`recipeItems[${index}]._invSpecs`, specsData);
        setValue(`recipeItems[${index}]._colors`, []);
      }
      setValue(`recipeItems[${index}]._items`, []);
    } else {
      setValue(`recipeItems[${index}]._colors`, []);
      setValue(`recipeItems[${index}]._invSpecs`, []);
      setValue(`recipeItems[${index}]._items`, []);
    }

    setTimeout(() => trigger(`recipeItems[${index}].subCategory`), 100);
  };

  const handleColorChange = async (index, value) => {
    const currentItems = [...(formValues.recipeItems || [])];
    const subCategory = currentItems[index]?.subCategory;
    const isColorSensitive = currentItems[index]?.class?.isColorSensitive;

    setValue(`recipeItems[${index}].color`, value);
    setValue(`recipeItems[${index}].item`, null);

    if (value?.ColorID && subCategory?.SubCat_ID && isColorSensitive) {
      const items = await fetchItemsBySubCategory(
        subCategory.SubCat_ID,
        value,
        null,
        isColorSensitive
      );
      setValue(`recipeItems[${index}]._items`, items);
    } else {
      setValue(`recipeItems[${index}]._items`, []);
    }

    setTimeout(() => trigger(`recipeItems[${index}].color`), 100);
  };

  const handleInvSpecsChange = async (index, value) => {
    const currentItems = [...(formValues.recipeItems || [])];
    const subCategory = currentItems[index]?.subCategory;
    const isColorSensitive = currentItems[index]?.class?.isColorSensitive;

    setValue(`recipeItems[${index}].invSpecs`, value);
    setValue(`recipeItems[${index}].item`, null);

    if (value?.InvSpecID && subCategory?.SubCat_ID && !isColorSensitive) {
      const items = await fetchItemsBySubCategory(
        subCategory.SubCat_ID,
        null,
        value,
        isColorSensitive
      );
      setValue(`recipeItems[${index}]._items`, items);
    } else {
      setValue(`recipeItems[${index}]._items`, []);
    }

    setTimeout(() => trigger(`recipeItems[${index}].invSpecs`), 100);
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
      const colorsData = await fetchColors(value.ColorFamilyID);
      setValue(`recipeItems[${index}]._colors`, colorsData);
    } else {
      setValue(`recipeItems[${index}]._colors`, []);
    }

    setTimeout(() => trigger(`recipeItems[${index}].colorFamily`), 100);
  };

  const handleItemChange = (index, value) => {
    setValue(`recipeItems[${index}].item`, value);
    setTimeout(() => trigger(`recipeItems[${index}].item`), 100);
  };

  const handlePercentageChange = async (index, value) => {
    if (value === '') {
      setValue(`recipeItems[${index}].percentage`, '');
      return;
    }

    const numValue = parseFloat(value);
    if (Number.isNaN(numValue)) return;

    const clampedValue = Math.min(100, Math.max(0, numValue));
    setValue(`recipeItems[${index}].percentage`, clampedValue);

    setTimeout(() => trigger('recipeItems'), 100);
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
      enqueueSnackbar('Error reading file', { variant: 'error' });
    };
    reader.readAsDataURL(file);
  };

  const hasDuplicateColors = useMemo(() => {
    // Group items by color ID
    const colorGroups = {};
    watchedItems.forEach((item) => {
      const colorId = item?.color?.ColorID;
      if (colorId) {
        if (!colorGroups[colorId]) {
          colorGroups[colorId] = [];
        }
        colorGroups[colorId].push(item);
      }
    });

    // Check for duplicates: same color with same category AND subcategory
    // eslint-disable-next-line
    for (const colorId in colorGroups) {
      const itemsWithSameColor = colorGroups[colorId];
      if (itemsWithSameColor.length > 1) {
        // Check if any two items have the same category AND subcategory
        // eslint-disable-next-line
        for (let i = 0; i < itemsWithSameColor.length; i++) {
          // eslint-disable-next-line
          for (let j = i + 1; j < itemsWithSameColor.length; j++) {
            const item1 = itemsWithSameColor[i];
            const item2 = itemsWithSameColor[j];
            const sameCategory = item1?.category?.Inv_Cat_ID === item2?.category?.Inv_Cat_ID;
            const sameSubCategory = item1?.subCategory?.SubCat_ID === item2?.subCategory?.SubCat_ID;

            // Duplicate if same color, same category, AND same subcategory
            if (sameCategory && sameSubCategory) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }, [watchedItems]);

  const validateBeforeAdd = () => {
    if (hasDuplicateColors) {
      enqueueSnackbar('Duplicate colors with same category and subcategory are not allowed', {
        variant: 'error',
      });
      return false;
    }
    return true;
  };

  const handleAddRecipeItem = async () => {
    if (!validateBeforeAdd()) return;

    const newItem = {
      class: null,
      category: null,
      subCategory: null,
      item: null,
      colorFamily: null,
      color: null,
      invSpecs: null,
      remarks: '',
      lotName: null,
      percentage: '',
      colorPicture: null,
      _categories: [],
      _subCategories: [],
      _items: [],
      _colors: [],
      _invSpecs: [],
    };

    const currentItems = formValues.recipeItems || [];
    setValue('recipeItems', [...currentItems, newItem]);

    setTimeout(() => trigger('recipeItems'), 100);
  };

  const handleDeleteRecipeItem = async (index) => {
    const currentItems = formValues.recipeItems || [];
    if (currentItems.length > 1) {
      const updatedItems = currentItems.filter((_, i) => i !== index);
      setValue('recipeItems', updatedItems);
      setTimeout(() => trigger('recipeItems'), 100);
    }
  };

  const totalPercentage = useMemo(
    () =>
      (watchedItems || []).reduce((total, item) => {
        const percentage = parseFloat(item?.percentage) || 0;
        return total + percentage;
      }, 0),
    [watchedItems]
  );

  // Get the current recipe items from form values
  const currentRecipeItems = formValues.recipeItems || [];
  const recipeItemsError = errors?.recipeItems;
  const isArrayError = Array.isArray(recipeItemsError);

  return (
    <>
      <TableContainer component={Paper}>
        <Scrollbar>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 200 }}>Item Type</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Item Category</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Sub Category</TableCell>
                {/* <TableCell sx={{ minWidth: 200 }}>Color Family</TableCell> */}
                <TableCell sx={{ minWidth: 180 }}>Color Name & Code</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Specifications</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Item</TableCell>
                <TableCell sx={{ minWidth: 200 }}>Lot No</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Blend %</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Color Picture</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Remarks</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentRecipeItems.map((item, index) => {
                const rowErrors = isArrayError ? recipeItemsError[index] : null;
                const isColorSensitive = item?.class?.isColorSensitive;

                return (
                  <TableRow key={index}>
                    {/* Item Type */}
                    <TableCell>
                      <RHFAutocomplete
                        name={`recipeItems[${index}].class`}
                        placeholder="Item Type"
                        fullWidth
                        options={allClassName}
                        getOptionLabel={(option) => option?.ClassName || ''}
                        isOptionEqualToValue={(option, value) => option?.ClassID === value?.ClassID}
                        onChange={(_, value) => handleClassChange(index, value)}
                        value={item.class}
                        error={!!rowErrors?.class}
                      />
                    </TableCell>

                    {/* Item Category */}
                    <TableCell>
                      <RHFAutocomplete
                        name={`recipeItems[${index}].category`}
                        placeholder="Item Category"
                        fullWidth
                        options={item._categories || []}
                        getOptionLabel={(option) => option?.Inv_Cat_Name || ''}
                        isOptionEqualToValue={(option, value) =>
                          option?.Inv_Cat_ID === value?.Inv_Cat_ID
                        }
                        onChange={(_, value) => handleCategoryChange(index, value)}
                        value={item.category}
                        error={!!rowErrors?.category}
                        disabled={!item.class}
                      />
                    </TableCell>

                    {/* Sub Category */}
                    <TableCell>
                      <RHFAutocomplete
                        name={`recipeItems[${index}].subCategory`}
                        placeholder="Sub Category"
                        options={item._subCategories || []}
                        getOptionLabel={(option) => option?.SubCat_Name || ''}
                        isOptionEqualToValue={(option, value) =>
                          option?.SubCat_ID === value?.SubCat_ID
                        }
                        onChange={(_, value) => handleSubCategoryChange(index, value)}
                        value={item.subCategory}
                        error={!!rowErrors?.subCategory}
                        disabled={!item.category}
                      />
                    </TableCell>

                    {/* Color Family
                    <TableCell>
                      <RHFAutocomplete
                        name={`recipeItems[${index}].colorFamily`}
                        placeholder="Color Family"
                        options={colorFamilies}
                        getOptionLabel={(option) => option?.ColorFamilyName || ''}
                        isOptionEqualToValue={(option, value) =>
                          option?.ColorFamilyID === value?.ColorFamilyID
                        }
                        onChange={(_, value) => handleColorFamilyChange(index, value)}
                        value={item.colorFamily}
                        error={!!rowErrors?.colorFamily}
                      />
                    </TableCell> */}

                    {/* Color (only for color-sensitive items) */}
                    <TableCell>
                      <RHFAutocomplete
                        name={`recipeItems[${index}].color`}
                        placeholder="Color"
                        options={item._colors || []}
                        getOptionLabel={(option) => option?.Color_and_Code || ''}
                        isOptionEqualToValue={(option, value) => option?.ColorID === value?.ColorID}
                        onChange={(_, value) => handleColorChange(index, value)}
                        value={item.color}
                        error={!!rowErrors?.color}
                        disabled={!item.subCategory || !isColorSensitive}
                      />
                    </TableCell>

                    {/* Specifications (only for non-color-sensitive items) */}
                    <TableCell>
                      <RHFAutocomplete
                        name={`recipeItems[${index}].invSpecs`}
                        placeholder="Specifications"
                        options={item._invSpecs || []}
                        getOptionLabel={(option) => option?.InvSpecsName || ''}
                        isOptionEqualToValue={(option, value) =>
                          option?.InvSpecID === value?.InvSpecID
                        }
                        onChange={(_, value) => handleInvSpecsChange(index, value)}
                        value={item.invSpecs}
                        error={!!rowErrors?.invSpecs}
                        disabled={!item.subCategory || isColorSensitive}
                      />
                    </TableCell>

                    {/* Item */}
                    <TableCell>
                      <RHFAutocomplete
                        name={`recipeItems[${index}].item`}
                        placeholder="Item"
                        options={item._items || []}
                        getOptionLabel={(option) =>
                          option?.CodeAndDescription || option?.ItemDescription || ''
                        }
                        isOptionEqualToValue={(option, value) => option?.ItemID === value?.ItemID}
                        onChange={(_, value) => handleItemChange(index, value)}
                        value={item.item}
                        error={!!rowErrors?.item}
                        disabled={
                          !item.subCategory ||
                          (isColorSensitive && !item.color) ||
                          (!isColorSensitive && !item.invSpecs)
                        }
                      />
                    </TableCell>

                    {/* Lot No */}
                    <TableCell>
                      <RHFAutocomplete
                        name={`recipeItems[${index}].lotName`}
                        placeholder="Lot No"
                        options={lotNames}
                        getOptionLabel={(option) => option?.LotName || ''}
                        isOptionEqualToValue={(option, value) => option?.LotName === value?.LotName}
                        value={item.lotName || null}
                        fullWidth
                      />
                    </TableCell>

                    {/* Percentage blend */}
                    <TableCell>
                      <RHFTextField
                        name={`recipeItems[${index}].percentage`}
                        placeholder="%"
                        type="number"
                        fullWidth
                        onChange={(e) => handlePercentageChange(index, e.target.value)}
                        inputProps={{
                          min: 0,
                          max: 100,
                          step: 0.01,
                        }}
                      />
                    </TableCell>

                    {/* Color Picture */}
                    <TableCell sx={{ width: 100, height: 50, position: 'relative' }}>
                      <Tooltip title="Upload Color Picture">
                        <Box
                          sx={{
                            width: '100%',
                            height: '53px',
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

                    {/* Remarks */}
                    <TableCell>
                      <RHFTextField
                        name={`recipeItems[${index}].remarks`}
                        placeholder="Remarks"
                        fullWidth
                      />
                    </TableCell>

                    {/* Actions */}
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
          </Table>
        </Scrollbar>
        <Box>
          {recipeItemsError && !Array.isArray(recipeItemsError) && (
            <Box>
              <Typography colSpan={12} sx={{ color: 'error.main', textAlign: 'center' }}>
                {recipeItemsError.message}
              </Typography>
            </Box>
          )}
        </Box>
      </TableContainer>

      {/* Total Percentage Display */}
      <Box sx={{ mt: 2, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography
          variant="body2"
          sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
        >
          Total Percentage:
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: Math.abs(totalPercentage - 100) < 0.01 ? 'success.main' : 'error.main',
              ml: 1,
            }}
          >
            {totalPercentage.toFixed(2)}%
          </Typography>
        </Typography>
      </Box>

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
  watch: PropTypes.any,
  trigger: PropTypes.func.isRequired,
  lotNames: PropTypes.array,
  isEdit: PropTypes.bool,
};

export default RecipeItemsTable;
