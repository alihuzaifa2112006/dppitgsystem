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
  Checkbox,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
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

import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

// ----------------------------------------------------------------------

export default function ProductVoucherCreateForm() {
  const router = useRouter();
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [RequestDetails, setRequestDetails] = useState([]);
  const [allCategoryData, setallCategoryData] = useState([]);
  const [itemSubCategory, setItemSubCategory] = useState([]);
  const [allColors, setallColors] = useState([]);
  const [allClassName, setallClassName] = useState([]);
  const [ItemOpen, setItemOpen] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openItemDialog, setOpenItemDialog] = useState(false);

  // New state variables for the additional fields
  const [shifts, setShifts] = useState([]);
  const [productionColors, setProductionColors] = useState([]);
  const [yarnCounts, setYarnCounts] = useState([]);
  const [yarnTypes, setYarnTypes] = useState([]);
  const [compositions, setCompositions] = useState([]);
  const [piItems, setPiItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [fabricTypes, setFabricTypes] = useState([]);

  const NewProductRequestSchema = Yup.object().shape({
    ProductionDate: Yup.date().required('Production Date is required'),
    Shift: Yup.object().required('Shift is required'),
    Color: Yup.object().required('Color is required'),
    YarnCount: Yup.object().required('Yarn Count is required'),
    YarnType: Yup.object().required('Yarn Type is required'),
    Composition: Yup.object().required('Composition is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewProductRequestSchema),
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

  const selectedSubCategory = watch('ItemSubCategory');
  const selectedColor = watch('Color');

  const fetchItemsBySubCategory = useCallback(async () => {
    if (selectedSubCategory?.SubCat_ID) {
      try {
        const response = await Get(
          `GetItemsByColorAndSubCat?subCatID=${selectedSubCategory?.SubCat_ID}&colorId=${selectedColor?.ColorID || 0
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
    } else {
      setItemOpen([]);
    }
  }, [selectedSubCategory, selectedColor, userData?.userDetails]);

  const GetColors = useCallback(async () => {
    try {
      const response = await Get(
        `GetColorsBySubCat?subCatId=${selectedSubCategory?.SubCat_ID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setallColors(response.data.data);
    } catch (error) {
      console.log(error);
      setallColors([]);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    selectedSubCategory?.SubCat_ID,
  ]);

  // API calls for the new fields
  const GetShifts = useCallback(async () => {
    try {
      const response = await Get(
        `Production/GetShifts?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setShifts(response.data?.Data || []);
    } catch (error) {
      console.error(error);
      setShifts([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetProductionColors = useCallback(async () => {
    try {
      const response = await Get(`Production/GetPIColors`);
      setProductionColors(response.data?.Data || []);
    } catch (error) {
      console.error(error);
      setProductionColors([]);
    }
  }, []);

  const GetYarnCounts = useCallback(async (colorId) => {
    if (!colorId) {
      setYarnCounts([]);
      return;
    }
    try {
      const response = await Get(`Production/GetPICounts?ColorID=${colorId}`);
      setYarnCounts(response.data?.Data || []);
    } catch (error) {
      console.error(error);
      setYarnCounts([]);
    }
  }, []);

  const GetYarnTypes = useCallback(async (colorId, countId) => {
    if (!colorId && !countId) {
      setYarnTypes([]);
      return;
    }
    try {
      const response = await Get(`Production/GetPIYarnTypes?ColorID=${colorId}&CountID=${countId}`);
      setYarnTypes(response.data?.Data || []);
    } catch (error) {
      console.error(error);
      setYarnTypes([]);
    }
  }, []);

  const GetCompositions = useCallback(async (colorId, countId, yarnTypeId) => {
    if (!colorId || !countId || !yarnTypeId) {
      setCompositions([]);
      return;
    }
    try {
      const response = await Get(
        `Production/GetPIComposition?ColorID=${colorId}&CountID=${countId}&YarnTypeID=${yarnTypeId}`
      );
      setCompositions(response.data?.Data || []);
    } catch (error) {
      console.error(error);
      setCompositions([]);
    }
  }, []);

  // Get Fabric Types
  // const GetFabricTypes = useCallback(async () => {
  //   try {
  //     const response = await Get(`Production/GetFabricTypes`);
  //     setFabricTypes(response.data?.Data || []);
  //   } catch (error) {
  //     console.error(error);
  //     setFabricTypes([]);
  //   }
  // }, []);

  // Fetch PI Items
  const GetPIItems = useCallback(async (colorId, countId, yarnTypeId, compositionId) => {
    if (!colorId || !countId || !yarnTypeId || !compositionId) {
      setPiItems([]);
      return;
    }

    setIsLoadingItems(true);
    try {
      const response = await Get(
        `Production/GetPIItems?ColorID=${colorId}&CountID=${countId}&YarnTypeID=${yarnTypeId}&CompositionID=${compositionId}`
      );

      // Map the response data to match our table structure
      const itemsWithSelection = (response.data?.Data || []).map(item => ({
        ItemID: item.PIDtlID, // Using PIDtlID as ItemID since it's unique
        PIDtlID: item.PIDtlID,
        PIID: item.PIID,
        PINo: item.PINo,
        PIDate: item.PIDate,
        ItemCode: item.Item_Code, // Mapping Item_Code to ItemCode
        ItemDescription: item.Item_Code, // Using ItemCode as description since no separate description field
        YarnTypeID: item.YarnTypeID,
        CompositionID: item.CompositionID,
        CountID: item.CountID,
        ColorID: item.ColorID,
        AvailableQty: item.PIQty, // Using PIQty as AvailableQty
        UOMID: item.UOMID,
        UOMName: item.UOMName,
        PlyValue: item.PlyValue,
        IsPly: item.IsPly,
        FabricTypeID: item.FabricTypeID || 0, // Default to 0 if not provided
        isSelected: false,
        ProduceQty: 0 // Changed from requestQty to ProduceQty
      }));

      setPiItems(itemsWithSelection);
    } catch (error) {
      console.error(error);
      setPiItems([]);
      enqueueSnackbar('Failed to fetch items', { variant: 'error' });
    } finally {
      setIsLoadingItems(false);
    }
  }, [enqueueSnackbar]);

  // Watch for changes to trigger dependent API calls
  const watchedColor = watch('Color');
  const watchedYarnCount = watch('YarnCount');
  const watchedYarnType = watch('YarnType');
  const watchedComposition = watch('Composition');

  useEffect(() => {
    if (watchedColor?.ColorID) {
      GetYarnCounts(watchedColor.ColorID);
      // Reset dependent fields
      setValue('YarnCount', null);
      setValue('YarnType', null);
      setValue('Composition', null);
      setPiItems([]); // Clear items when color changes
    }
  }, [watchedColor, GetYarnCounts, setValue]);

  useEffect(() => {
    if (watchedColor?.ColorID && watchedYarnCount?.Yarn_Count_ID) {
      GetYarnTypes(watchedColor.ColorID, watchedYarnCount.Yarn_Count_ID);
      // Reset dependent fields
      setValue('YarnType', null);
      setValue('Composition', null);
      setPiItems([]); // Clear items when yarn count changes
    }
  }, [watchedColor, watchedYarnCount, GetYarnTypes, setValue]);

  useEffect(() => {
    if (watchedColor?.ColorID && watchedYarnCount?.Yarn_Count_ID && watchedYarnType?.Yarn_Type_ID) {
      GetCompositions(watchedColor.ColorID, watchedYarnCount.Yarn_Count_ID, watchedYarnType.Yarn_Type_ID);
      // Reset dependent field
      setValue('Composition', null);
      setPiItems([]); // Clear items when yarn type changes
    }
  }, [watchedColor, watchedYarnCount, watchedYarnType, GetCompositions, setValue]);

  // Fetch PI Items when all dependencies are available
  useEffect(() => {
    if (watchedColor?.ColorID && watchedYarnCount?.Yarn_Count_ID && watchedYarnType?.Yarn_Type_ID && watchedComposition?.Composition_ID) {
      GetPIItems(
        watchedColor.ColorID,
        watchedYarnCount.Yarn_Count_ID,
        watchedYarnType.Yarn_Type_ID,
        watchedComposition.Composition_ID
      );
    }
  }, [watchedColor, watchedYarnCount, watchedYarnType, watchedComposition, GetPIItems]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        GetShifts(),
        GetProductionColors(),
        // GetFabricTypes(),
        // Add other initial API calls here
      ]);
      setLoading(false);
    };
    fetchData();
  }, [GetShifts, GetProductionColors]);

  // Table selection handlers
  const handleSelectAllClick = (checked) => {
    if (checked) {
      const newSelected = piItems.map(i => i.ItemID);
      setSelectedRows(newSelected);
      setPiItems(piItems.map(i => ({ ...i, isSelected: true })));
    } else {
      setSelectedRows([]);
      setPiItems(piItems.map(i => ({ ...i, isSelected: false, ProduceQty: 0 })));
    }
  };

  const handleClick = (event, id) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    setSelectedRows(newSelected);

    // Update the isSelected flag in piItems and reset ProduceQty when deselected
    const updatedItems = piItems.map(item => {
      const isSelected = newSelected.includes(item.ItemID);
      return {
        ...item,
        isSelected,
        ProduceQty: isSelected ? item.ProduceQty : 0 // Reset to 0 when deselected
      };
    });
    setPiItems(updatedItems);
  };

  const handleProduceQtyChange = (itemId, value) => {
    const numericValue = value === '' ? 0 : Number(value);
    const updatedItems = piItems.map(item =>
      item.ItemID === itemId
        ? { ...item, ProduceQty: numericValue }
        : item
    );
    setPiItems(updatedItems);
  };

  const isSelected = (id) => selectedRows.indexOf(id) !== -1;

  // Calculate total produce quantity
  const totalProduceQty = piItems
    .filter(item => item.isSelected)
    .reduce((total, item) => total + (item.ProduceQty || 0), 0);

  // Table headers
  const TABLE_HEAD = [
    // { id: 'select', label: '', align: 'center' },
    { id: 'piNo', label: 'PI No', align: 'left' },
    { id: 'piDate', label: 'PI Date', align: 'left' },
    { id: 'itemCode', label: 'Item Code', align: 'left' },
    { id: 'availableQty', label: 'PI Qty', align: 'right' },
    { id: 'uom', label: 'UOM', align: 'left' },
    { id: 'ply', label: 'Ply', align: 'center' },
    { id: 'produceQty', label: 'Production Qty', align: 'right' },
  ];

  // Format date for API
  const formatDateForAPI = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Get selected items with produce quantities
      const selectedItems = piItems.filter(item => item.isSelected && item.ProduceQty > 0);

      if (selectedItems.length === 0) {
        enqueueSnackbar('Please select at least one item and enter produce quantity', { variant: 'error' });
        return;
      }

      // Prepare request data for Production/SaveProductionPIVoucher API
      const requestData = {
        ProductionDate: formatDateForAPI(data.ProductionDate),
        ShiftID: data.Shift?.ShiftId,
        Remarks: data.Remarks || '',
        CreatedBy: userData.userDetails.userId,
        Branch_ID: userData.userDetails.branchID,
        Org_ID: userData.userDetails.orgId,
        Details: selectedItems.map(item => ({
          PIID: item.PIID, // PI ID
          PIDtlID: item.PIDtlID, // PI Detail ID
          YarnTypeID: item.YarnTypeID,
          CompositionID: item.CompositionID,
          CountID: item.CountID,
          ColorID: item.ColorID,
          FabricTypeID: item.FabricTypeID || 0, // Default to 0 if not available
          IsPly: item.IsPly || false,
          PlyValue: item.PlyValue || 1,
          ProducedQty: Number(item.ProduceQty),
          UOMID: item.UOMID,
          Remarks: data.Remarks || '' // Using main remarks for all items, you can customize per item if needed
        }))
      };

      console.log('Submitting data:', requestData);

      // Call the Production Save API
      const response = await Post(`Production/SaveProductionPIVoucher`, requestData);

      if (response.status === 200) {
        enqueueSnackbar('Production voucher created successfully!', { variant: 'success' });
        router.push(paths.dashboard.Production.ProductVoucher.root);
        reset();
        setPiItems([]);
        setSelectedRows([]);
      } else {
        enqueueSnackbar(response.data.Message || 'Failed to create production voucher', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error details:', error);
      enqueueSnackbar('Error creating production voucher', { variant: 'error' });
    }
  });
console.log(values,'values')
  return isLoading ? (
    <LoadingScreen />
  ) : (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
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
              {/* New Fields */}
              <Controller
                name="ProductionDate"
                control={control}
                defaultValue={new Date()}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Production Date"
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

              <RHFAutocomplete
                name="Shift"
                label="Shift"
                options={shifts}
                getOptionLabel={(option) => option.ShiftName || ''}
                isOptionEqualToValue={(option, value) => option.ShiftId === value.ShiftId}
                value={values.Shift || null}
              />

              <RHFAutocomplete
                name="Color"
                label="Color"
                options={productionColors}
                getOptionLabel={(option) => option.ColorName || ''}
                isOptionEqualToValue={(option, value) => option.ColorID === value.ColorID}
              />

              <RHFAutocomplete
                name="YarnCount"
                label="Yarn Count"
                options={yarnCounts}
                getOptionLabel={(option) => option.Yarn_Count_Name || ''}
                isOptionEqualToValue={(option, value) => option.Yarn_Count_ID === value.Yarn_Count_ID}
                disabled={!watchedColor}
              />

              <RHFAutocomplete
                name="YarnType"
                label="Yarn Type"
                options={yarnTypes}
                getOptionLabel={(option) => option.Yarn_Type || ''}
                isOptionEqualToValue={(option, value) => option.Yarn_Type_ID === value.Yarn_Type_ID}
                disabled={!watchedColor || !watchedYarnCount}
              />

              <RHFAutocomplete
                name="Composition"
                label="Composition"
                options={compositions}
                getOptionLabel={(option) => option.Composition_Name || ''}
                isOptionEqualToValue={(option, value) => option.Composition_ID === value.Composition_ID}
                disabled={!watchedColor || !watchedYarnCount || !watchedYarnType}
              />

              <RHFTextField
                name="Remarks"
                label="Remarks"
                fullWidth
                multiline
                rows={2}
                sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 3' } }}
              />
            </Box>
          </Card>

          {/* PI Items Table */}
          {piItems.length > 0 && (
            <Card sx={{ mt: 3 }}>
              <Box display="flex" flexDirection="row" justifyContent='space-between'>
                <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
                  Available PI Items
                </Typography>

                {/* Total Produce Qty Display */}
                {selectedRows.length > 0 && (
                  <Typography variant="subtitle1" color="primary" align="right" sx={{ p: 2, pb: 1 }}>
                    Total Production Quantity: {fNumber(totalProduceQty) || 0.00}
                  </Typography>
                )}
              </Box>
              {isLoadingItems ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>Loading items...</Typography>
                </Box>
              ) : (
                <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                  <Scrollbar>
                    <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                      <TableHeadCustom
                        headLabel={TABLE_HEAD}
                        rowCount={piItems.length}
                        numSelected={selectedRows.length}
                        onSelectAllRows={handleSelectAllClick}
                      />

                      <TableBody>
                        {piItems.map((row) => {
                          const isItemSelected = isSelected(row.ItemID);

                          return (
                            <TableRow
                              hover
                              key={row.ItemID}
                              selected={isItemSelected}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={isItemSelected}
                                  onChange={(event) => handleClick(event, row.ItemID)}
                                />
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2">{row.PINo}</Typography>
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2">
                                  {fDate(row.PIDate)}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2">{row.ItemCode}</Typography>
                              </TableCell>

                              <TableCell align="right">
                                <Typography variant="body2">
                                  {fNumber(row.AvailableQty)}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2">{row.UOMName}</Typography>
                              </TableCell>

                              <TableCell align="center">
                                <Typography variant="body2">
                                  {row.IsPly ? row.PlyValue : 'N/A'}
                                </Typography>
                              </TableCell>

                              <TableCell align="right">
                                {isItemSelected ? (
                                  <RHFTextField
                                    name={`Production Qty-${row.ItemID}`}
                                    type="number"
                                    size="small"
                                    value={row.ProduceQty || ''}
                                    onChange={(e) => handleProduceQtyChange(row.ItemID, e.target.value)}
                                    inputProps={{
                                      min: 0,
                                      step: 0.01,
                                      style: { textAlign: 'right' }
                                    }}
                                    sx={{ width: 120 }}
                                  />
                                ) : (
                                  <Typography variant="body2" color="textSecondary">
                                    -
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}

                        <TableEmptyRows
                          height={denseHeight}
                          emptyRows={emptyRows(table.page, table.rowsPerPage, piItems.length)}
                        />

                        {piItems.length === 0 && !isLoadingItems 
                        // eslint-disable-next-line
                        && ( <TableNoData notFound={true} /> )}
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </TableContainer>
              )}
            </Card>
          )}

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
              disabled={piItems.length === 0 || selectedRows.length === 0}
            >
              Save Production Voucher
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}