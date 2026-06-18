import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Chip,
  InputAdornment,
  Table,
  TableBody,
  TableContainer,
  Typography,
  Skeleton,
  TextField,
  TableFooter,
  TableCell,
  TableRow,
  Paper,
  Checkbox,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { fNumber } from 'src/utils/format-number';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { Get, Put } from 'src/api/apibasemethods';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import Scrollbar from 'src/components/scrollbar';
import {
  TableEmptyRows,
  useTable,
  emptyRows,
  TableHeadCustom,
  TableNoData,
} from 'src/components/table';

import ProductionReportTableRow from './ProductionReport-table-row';
import ProductionReportSecondTable from './ProductionReport-table-row-Second';
// import ConfirmationDialog from './TransferingDialog';
import { fDate } from 'src/utils/format-time';

export default function ProductionReportEditForm({ currentData }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // State declarations
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [requestDetails, setRequestDetails] = useState([]);
  const [allSuperVisiorName, setAllSuperVisiorName] = useState([]);
  const [allShiftName, setAllShiftName] = useState([]);
  const [hrUsers, setHrUsers] = useState([]);
  const [selectedUOMID, setSelectedUOMID] = useState(null);
  const [allChallanNo, setAllChallanNo] = useState([]);
  const [grnData, setGrnData] = useState(null);
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedRowDataArray, setSelectedRowDataArray] = useState([]);
  const [isGrnLoading, setIsGrnLoading] = useState(false);
  const [itemSubCategory, setItemSubCategory] = useState([]);
  const [ItemOpen, setItemOpen] = useState([]);
  const [newRequestedDetail, setnewRequestedDetail] = useState([]);
  const [allSortedClassName, setAllSortedClassName] = useState([]);
  const [allSortedCategoryData, setAllSortedCategoryData] = useState([]);
  const [allSortedSubCategory, setAllSortedSubCategory] = useState([]);
  const [allSortedColors, setAllSortedColors] = useState([]);
  const [allSortedInvSpare, setAllSortedInvSpare] = useState([]);
  const [SortedItemOpen, setSortedItemOpen] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const table = useTable();
  const notFound = !requestDetails.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

  // Table Headers
  const DetailsTableHead = [
    { id: 'EmployeeName', label: 'Worker Name', minWidth: 200, align: 'center' },
    { id: 'TotalBags', label: 'Total Bags', minWidth: 200, align: 'center' },
    { id: 'BagDetails', label: 'Bag Details', minWidth: 200, align: 'center' },
    { id: 'Actions', label: 'Actions', minWidth: 200, align: 'center' },
  ];

  const ChallanDetailsTableHead = [
    { id: 'Checkbox', label: 'Select', minWidth: 80, align: 'left' },
    { id: 'ItemName', label: 'Item Name', minWidth: 220, align: 'left' },
    // { id: 'CategoryName', label: 'Category Name', minWidth: 200, align: 'center' },
    // { id: 'SubCatName', label: 'Sub Category', minWidth: 200, align: 'center' },
    // { id: 'InvTypeName', label: 'Inventory Type', minWidth: 180, align: 'center' },
    { id: 'StoreName', label: 'Store Name', minWidth: 160, align: 'center' },
    { id: 'LocationName', label: 'Location', minWidth: 120, align: 'center' },
    { id: 'TotalRequestedQty', label: 'Requested Qty', minWidth: 140, align: 'right' },
    { id: 'TotalIssueQty', label: 'Issued Qty', minWidth: 140, align: 'right' },
    // { id: 'RemainingQty', label: 'Remaining Qty', minWidth: 140, align: 'right' },
    // { id: 'Remarks', label: 'Remarks', minWidth: 200, align: 'left' },
  ];

  const WasteTable = [
    { id: 'ItemSubCategory', label: 'Waste Type', minWidth: 200, align: 'center' },
    { id: 'ItemOpen', label: 'Item Name', minWidth: 200, align: 'center' },
    { id: 'Quantity', label: 'Quantity', minWidth: 200, align: 'right' },
    { id: 'Actions', label: 'Actions', minWidth: 200, align: 'center' },
  ];

  // Dialog handlers
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  // Checkbox change handler for multiple selection
  const handleCheckboxChange = (row) => {
    const issueDtlID = row.IssueDtlID;
    const isSelected = selectedValues.includes(issueDtlID);

    if (isSelected) {
      // Remove from selection
      setSelectedValues((prev) => prev.filter((id) => id !== issueDtlID));
      setSelectedRowDataArray((prev) => prev.filter((item) => item.IssueDtlID !== issueDtlID));
    } else {
      // Add to selection
      setSelectedValues((prev) => [...prev, issueDtlID]);
      setSelectedRowDataArray((prev) => [...prev, row]);
    }
    console.log('Selected Row Data:', isSelected ? 'Removed' : 'Added', row);
  };

  // Validation Schema
  const NewProductionReportSchema = Yup.object().shape({
    SortedQty: Yup.number()
      .required('Sorted Quantity is required')
      .typeError('Must be a number')
      .positive('Must be a positive number')
      .test(
        'is-less-than-issue-qty',
        'Sorted Quantity cannot exceed the total Issued Quantity of selected items.',
        (value) => {
          if (selectedRowDataArray.length === 0) return true;

          const totalIssuedQty = selectedRowDataArray.reduce(
            (sum, item) => sum + (parseFloat(item?.TotalIssueQty) || 0),
            0
          );
          const sortedQty = parseFloat(value) || 0;

          return sortedQty <= totalIssuedQty;
        }
      ),
    UserId: Yup.object()
      .shape({
        UserId: Yup.number().required('UserId is required'),
        EmployeeName: Yup.string().required('EmployeeName is required'),
      })
      .required('Supervisor is required'),
    ShiftName: Yup.object()
      .shape({
        ShiftName: Yup.string().required('ShiftName is required'),
      })
      .required('Shift is required'),
    PRDate: Yup.date().required('Date is required').typeError('Please enter a valid date'),
    // TotalWorker: Yup.number()
    //   .required('Total Worker Qauntity is required')
    //   .positive('Total Worker must be a positive number'),
    // PresentDuty: Yup.number()
    //   .required('On Duty Worder Qty is required')
    //   .positive('Must be positive number')
    //   .integer('Must be whole number')
    //   .typeError('Must be a whole number'),
    ReqCode: Yup.array()
      .of(
        Yup.object().shape({
          ReqCode: Yup.string().required(),
          ReqID: Yup.number(),
          ReqCodeWithDate: Yup.string(),
        })
      )
      .min(1, 'At least one Requisition No is required')
      .required('Req No is required'),
    Reason: Yup.string()
      .required('Reason is required')
      .max(500, 'Reason cannot exceed 500 characters'),
    SortedClassID: Yup.object().required('Sorted Class is required'),
    SortedCategory: Yup.object().required('Sorted Category is required'),
    SortedSubCategory: Yup.object().required('Sorted Sub Category is required'),
  });

  // Form methods
  const methods = useForm({
    resolver: yupResolver(NewProductionReportSchema),
    defaultValues: {
      PRDate: currentData?.ReportDate ? new Date(currentData.ReportDate) : new Date(),
      JMS: '0.00',
      UOM: '',
      UOMID: null,
      SortedClassID: null,
      SortedCategory: null,
      SortedSubCategory: null,
      SortedColor: null,
      SortedInvSpare: null,
      SortedItemOpen: null,
      ReqCode: [],
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
  const selectedSortedClassId = watch('SortedClassID');
  const selectedSortedCategory = watch('SortedCategory');
  const selectedSortedSubCategory = watch('SortedSubCategory');
  const selectedSortedColor = watch('SortedColor');
  const selectedSortedSpare = watch('SortedInvSpare');

  const totalQuantitySum = newRequestedDetail.reduce((sum, currentItem) => {
    const qty = currentItem.RejectedQty;

    const numericQty = parseFloat(qty);

    if (!Number.isNaN(numericQty)) {
      return sum + numericQty;
    }

    return sum;
  }, 0);

  // Validate workers count
  const validateWorkersCount = useCallback(() => {
    const allWorkers = requestDetails.flatMap((detail) => detail.Workers || []);
    const uniqueWorkerIds = new Set(allWorkers.map((worker) => worker.UserId || worker.WorkerID));
    return uniqueWorkerIds.size;
  }, [requestDetails]);


  // Initial data loading effect
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load HR users
        const hrResponse = await Get(
          `GetHrUsers?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );
        setHrUsers(hrResponse.data.Data || []);
        setAllSuperVisiorName(hrResponse.data.Data || []);

        // Load shifts
        const shiftResponse = await Get(
          `GetAllShifts?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setAllShiftName(shiftResponse.data.data || []);

        // Load requisition numbers
        const challanResponse = await Get(
          `GetConfirmReqNumDptID?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}&deptId=9&sectionID=26`
        );
        const challans = challanResponse.data || [];
        const ReqNumWithDate = challans.map((item) => ({
          ...item,
          ReqCodeWithDate: `${item.ReqCode} | ${fDate(item.CreatedDate)}`,
          // Ensure we have both ReqID and ReqId for compatibility
          ReqID: item.ReqID || item.ReqId,
          ReqId: item.ReqId || item.ReqID,
        }));
        console.log('Loaded allChallanNo:', ReqNumWithDate); // Debug log
        setAllChallanNo(ReqNumWithDate);

        // Load subcategories
        const subCatResponse = await Get(`GetSubCategoriesByCategoryID/11`);
        setItemSubCategory(subCatResponse.data.data || []);

        // Load sorted classes
        const classResponse = await Get(
          `GetClassesByuserid?UserID=${userData?.userDetails?.userId}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setAllSortedClassName(classResponse.data || []);

        setLoading(false);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setLoading(false);
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      loadInitialData();
    }
  }, [userData]);

  // Load current data into form - Improved version
  useEffect(() => {
    if (currentData && !isLoading) {
      // Set basic fields
      if (currentData.ReportDate) {
        setValue('PRDate', new Date(currentData.ReportDate));
      }

      // Set Supervisor
      if (currentData.SupervisorID && allSuperVisiorName.length > 0) {
        const supervisor = allSuperVisiorName.find((s) => s.UserId === currentData.SupervisorID);
        if (supervisor) {
          setValue('UserId', supervisor);
        }
      }

      // Set worker counts
      if (currentData.TotalWorker) {
        setValue('TotalWorker', currentData.TotalWorker);
      }
      if (currentData.OnDuty) {
        setValue('PresentDuty', currentData.OnDuty);
      }

      // Set sorted quantities
      if (currentData.SortedQty) {
        setValue('SortedQty', currentData.SortedQty);
      }
      if (currentData.SortedRemQty) {
        setValue('RemainingQty', currentData.SortedRemQty);
      }
      if (currentData.ReasonOfRejec) {
        setValue('Reason', currentData.ReasonOfRejec);
      }
      if (currentData.Remarks) {
        setValue('Remarks', currentData.Remarks);
      }

      // Set UOM
      if (currentData.UOMID) {
        setSelectedUOMID(currentData.UOMID);
      }
      if (currentData.UOMName) {
        setValue('UOM', currentData.UOMName);
      }

      // Set Sorted Class - Use SortedItemInvTypeClassID from the new API response
      const invTypeId = currentData.SortedItemInvTypeClassID || currentData.InvType;
      if (invTypeId && allSortedClassName.length > 0) {
        console.log('Attempting to set SortedClassID. InvTypeId:', invTypeId, 'Available classes:', allSortedClassName);
        const sortedClass = allSortedClassName.find((c) => c.ClassID === invTypeId);
        if (sortedClass) {
          console.log('Found and setting SortedClassID:', sortedClass);
          setValue('SortedClassID', sortedClass);
        } else {
          console.warn('Could not find matching class for InvTypeId:', invTypeId);
        }
      }
    }
  }, [currentData, allSuperVisiorName, allSortedClassName, setValue, isLoading]);

  // Load sorted item hierarchy from SortedItemID
  useEffect(() => {
    const loadItemHierarchy = async () => {
      // Load the full hierarchy whenever we have a SortedItemID
      const sortedItemId = currentData?.SorteditemID || currentData?.sorteditemID || currentData?.SortedItemID;
      if (sortedItemId && allSortedClassName.length > 0 && !isLoading) {
        try {
          console.log('Fetching item hierarchy for SortedItemID:', sortedItemId);

          // Search through all classes to find the item using array methods
          const searchResults = await Promise.all(
            allSortedClassName.map(async (classItem) => {
              try {
                // Fetch categories for this class
                const catResponse = await Get(
                  `GetCategoriesByUserIDFrmMiddleware?userID=${userData?.userDetails?.userId}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
                );
                const categories = catResponse.data
                  .filter((item) => item.ClassID === classItem.ClassID)
                  .map((item) => ({
                    ...item,
                    Inv_Cat_Name: item?.CategoryName,
                    Inv_Cat_ID: item?.CategoryID,
                  }));

                // Search through categories
                const categoryResults = await Promise.all(
                  categories.map(async (category) => {
                    try {
                      // Fetch subcategories
                      const subCatResponse = await Get(
                        `GetSubCategoriesByCategoryID/${category.Inv_Cat_ID}`
                      );
                      const subCategories = subCatResponse.data.data || [];

                      // Search through subcategories
                      const subCatResults = await Promise.all(
                        subCategories.map(async (subCat) => {
                          try {
                            // Try to fetch items by color (if color sensitive)
                            if (classItem.isColorSensitive === true) {
                              // Fetch colors first
                              const colorsResponse = await Get(
                                `GetColorsBySubCatFromItemDB?subCatId=${subCat.SubCat_ID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
                              );
                              const colors = colorsResponse.data.data || [];

                              // Search through colors
                              const colorResults = await Promise.all(
                                colors.map(async (color) => {
                                  try {
                                    const itemsResponse = await Get(
                                      `GetAllItemsFromDBByColorAndSubCat?subCatID=${subCat.SubCat_ID}&colorId=${color.ColorID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
                                    );
                                    const items = itemsResponse.data || [];
                                    const foundItem = items.find((item) => item.ItemID === sortedItemId);

                                    if (foundItem) {
                                      return {
                                        found: true,
                                        class: classItem,
                                        category,
                                        subCategory: subCat,
                                        color,
                                        spare: null,
                                        item: foundItem,
                                      };
                                    }
                                    return { found: false };
                                  } catch (err) {
                                    return { found: false };
                                  }
                                })
                              );

                              const found = colorResults.find((r) => r.found);
                              if (found) return found;
                            } else {
                              // Not color sensitive, try by spare
                              try {
                                const spareResponse = await Get(
                                  `GetSpareBySubcateID?SubcatID=${subCat.SubCat_ID}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
                                );
                                const spares = spareResponse.data || [];

                                // Search through spares
                                const spareResults = await Promise.all(
                                  spares.map(async (spare) => {
                                    try {
                                      const itemsResponse = await Get(
                                        `GetItemsBySpareID?spareId=${spare.SpareID}&subCatID=${subCat.SubCat_ID}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
                                      );
                                      const items = itemsResponse.data || [];
                                      const foundItem = items.find((item) => item.ItemID === sortedItemId);

                                      if (foundItem) {
                                        return {
                                          found: true,
                                          class: classItem,
                                          category,
                                          subCategory: subCat,
                                          color: null,
                                          spare,
                                          item: foundItem,
                                        };
                                      }
                                      return { found: false };
                                    } catch (err) {
                                      return { found: false };
                                    }
                                  })
                                );

                                const found = spareResults.find((r) => r.found);
                                if (found) return found;
                              } catch (err) {
                                // Continue searching
                              }
                            }
                            return { found: false };
                          } catch (err) {
                            return { found: false };
                          }
                        })
                      );

                      const found = subCatResults.find((r) => r.found);
                      if (found) return found;
                      return { found: false };
                    } catch (err) {
                      return { found: false };
                    }
                  })
                );

                const found = categoryResults.find((r) => r.found);
                if (found) return found;
                return { found: false };
              } catch (err) {
                return { found: false };
              }
            })
          );

          const result = searchResults.find((r) => r.found);
          if (result && result.found) {
            console.log('Found item! Setting hierarchy:', result);

            // Set hierarchy in order with delays
            setValue('SortedClassID', result.class);
            await new Promise((resolve) => setTimeout(resolve, 300));

            setValue('SortedCategory', result.category);
            await new Promise((resolve) => setTimeout(resolve, 300));

            setValue('SortedSubCategory', result.subCategory);
            await new Promise((resolve) => setTimeout(resolve, 300));

            if (result.color) {
              setValue('SortedColor', result.color);
              await new Promise((resolve) => setTimeout(resolve, 300));
            } else if (result.spare) {
              setValue('SortedInvSpare', result.spare);
              await new Promise((resolve) => setTimeout(resolve, 300));
            }

            const formattedItem = {
              ...result.item,
              ClassID: result.item?.invTypesID,
              CodeAndDescription: `[${result.item?.ItemCode}]  ${result.item?.ItemDescription}`,
              UOM: {
                UOM_ID: result.item?.UOMID,
                UOMName: result.item?.UOMNAME || result.item?.UOMName,
              },
            };
            setValue('SortedItemOpen', formattedItem);
          }
        } catch (error) {
          console.error('Error loading item hierarchy:', error);
        }
      }
    };

    loadItemHierarchy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData?.SorteditemID, currentData?.SortedItemID, currentData?.sorteditemID, currentData?.SortedItemInvTypeClassID, currentData?.InvType, allSortedClassName.length, isLoading]);

  // Set Sorted Category after categories are loaded
  useEffect(() => {
    // Use SortedItemInvCatID from the new API response
    const invCatId = currentData?.SortedItemInvCatID || currentData?.InvCat;
    if (invCatId && allSortedCategoryData.length > 0 && selectedSortedClassId) {
      console.log('Attempting to set SortedCategory. InvCatId:', invCatId, 'Available categories:', allSortedCategoryData);
      const category = allSortedCategoryData.find((c) => c.Inv_Cat_ID === invCatId);
      if (category && !values.SortedCategory) {
        console.log('Found and setting SortedCategory:', category);
        setValue('SortedCategory', category);
      } else if (!category) {
        console.warn('Could not find matching category for InvCatId:', invCatId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData?.SortedItemInvCatID, currentData?.InvCat, allSortedCategoryData.length, selectedSortedClassId]);

  // Set Sorted SubCategory after subcategories are loaded
  useEffect(() => {
    // Use SortedItemInvSubCatID from the new API response
    const invSubCatId = currentData?.SortedItemInvSubCatID || currentData?.InvSubCat;
    if (invSubCatId && allSortedSubCategory.length > 0 && selectedSortedCategory) {
      console.log('Attempting to set SortedSubCategory. InvSubCatId:', invSubCatId, 'Available subcategories:', allSortedSubCategory);
      const subCategory = allSortedSubCategory.find((sc) => sc.SubCat_ID === invSubCatId);
      if (subCategory && !values.SortedSubCategory) {
        console.log('Found and setting SortedSubCategory:', subCategory);
        setValue('SortedSubCategory', subCategory);
      } else if (!subCategory) {
        console.warn('Could not find matching subcategory for InvSubCatId:', invSubCatId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData?.SortedItemInvSubCatID, currentData?.InvSubCat, allSortedSubCategory.length, selectedSortedCategory]);

  // Set Sorted Color after colors are loaded
  useEffect(() => {
    if (currentData?.ColorID && allSortedColors.length > 0 && selectedSortedSubCategory && selectedSortedClassId?.isColorSensitive) {
      const color = allSortedColors.find((c) => c.ColorID === currentData.ColorID);
      if (color && !values.SortedColor) {
        setValue('SortedColor', color);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData?.ColorID, allSortedColors.length, selectedSortedSubCategory, selectedSortedClassId]);

  // Set Sorted Spare after spares are loaded
  useEffect(() => {
    if (currentData?.SpareID && allSortedInvSpare.length > 0 && selectedSortedSubCategory && selectedSortedClassId?.isColorSensitive === false) {
      const spare = allSortedInvSpare.find((s) => s.SpareID === currentData.SpareID);
      if (spare && !values.SortedInvSpare) {
        setValue('SortedInvSpare', spare);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData?.SpareID, allSortedInvSpare.length, selectedSortedSubCategory, selectedSortedClassId]);


  useEffect(() => {

    const sortedItemId = currentData?.SorteditemID || currentData?.sorteditemID || currentData?.SortedItemID;
    if (sortedItemId && SortedItemOpen.length > 0) {
      console.log('Attempting to set SortedItemOpen. ItemId:', sortedItemId, 'Available items:', SortedItemOpen);
      const item = SortedItemOpen.find((i) => i.ItemID === sortedItemId);
      if (item && !values.SortedItemOpen) {
        console.log('Found and setting SortedItemOpen:', item);
        setValue('SortedItemOpen', item);
      } else if (!item) {
        console.warn('Could not find matching item for ItemId:', sortedItemId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData?.SorteditemID, currentData?.SortedItemID, currentData?.sorteditemID, SortedItemOpen.length]);


  useEffect(() => {
    if (currentData?.WorkerShiftID && allShiftName.length > 0) {
      const shift = allShiftName.find((s) => {
        const shiftId = s.ShiftID || s.ShiftId || s.shiftID || s.shiftId;
        return Number(shiftId) === Number(currentData.WorkerShiftID);
      });

      if (shift) {
        console.log('Found and setting shift:', shift);
        setValue('ShiftName', shift, { shouldValidate: false });
      }
    }
  }, [currentData?.WorkerShiftID, allShiftName, setValue]);

  // Set Requisition Code - Handle multiple requisitions from Details array
  useEffect(() => {
    if (currentData?.Details && Array.isArray(currentData.Details) && currentData.Details.length > 0 && allChallanNo.length > 0) {
      console.log('Loading ReqCodes from Details array:', currentData.Details);

      // Extract unique ReqCodes from Details array
      const uniqueReqCodes = new Map();
      currentData.Details.forEach((detail) => {
        if (detail.ReqCode && !uniqueReqCodes.has(detail.ReqCode)) {
          uniqueReqCodes.set(detail.ReqCode, {
            ReqCode: detail.ReqCode,
            ReqID: detail.ReqId || detail.ReqID,
            ReqId: detail.ReqId || detail.ReqID,
          });
        }
      });

      // Find matching requisitions from allChallanNo
      const matchedReqCodes = Array.from(uniqueReqCodes.values())
        .map((req) => {
          // Try to find in allChallanNo
          const found = allChallanNo.find((r) => {
            const rCode = (r.ReqCode || '').toString().trim().toUpperCase();
            const reqCode = (req.ReqCode || '').toString().trim().toUpperCase();
            return rCode === reqCode;
          });

          if (found) {
            return found;
          }

          // If not found, create temp object
          return {
            ReqCode: req.ReqCode,
            ReqCodeWithDate: `${req.ReqCode} | ${fDate(currentData.ReportDate || new Date())}`,
            ReqID: req.ReqID || req.ReqId,
            ReqId: req.ReqId || req.ReqID,
          };
        })
        .filter(Boolean);

      if (matchedReqCodes.length > 0) {
        console.log('Setting ReqCodes:', matchedReqCodes);
        setValue('ReqCode', matchedReqCodes, { shouldValidate: false });
      }
    } else if (currentData?.ReqCode && allChallanNo.length > 0) {
      // Fallback to single ReqCode if Details array is not available
      const reqCode = allChallanNo.find((r) => {
        const rCode = (r.ReqCode || '').toString().trim().toUpperCase();
        const currentCode = (currentData.ReqCode || '').toString().trim().toUpperCase();
        return rCode === currentCode;
      });

      if (reqCode) {
        setValue('ReqCode', [reqCode], { shouldValidate: false });
      } else {
        const tempReqCode = {
          ReqCode: currentData.ReqCode,
          ReqCodeWithDate: `${currentData.ReqCode} | ${fDate(currentData.ReportDate || new Date())}`,
          ReqID: currentData.ReqId,
          ReqId: currentData.ReqId
        };
        setValue('ReqCode', [tempReqCode], { shouldValidate: false });
      }
    }
  }, [currentData?.Details, currentData?.ReqCode, currentData?.ReqId, currentData?.ReportDate, allChallanNo, setValue]);

  // Load Workers from currentData
  useEffect(() => {
    if (currentData?.Workers && Array.isArray(currentData.Workers) && currentData.Workers.length > 0) {
      const workersByBox = {};
      currentData.Workers.forEach((worker) => {
        if (!workersByBox[worker.BoxNo]) {
          workersByBox[worker.BoxNo] = {
            Workers: [],
            BagDetails: '',
            TotalBags: 0,
          };
        }
        workersByBox[worker.BoxNo].Workers.push({
          UserId: worker.WorkerID,
          EmployeeName: worker.WorkerName,
        });
        workersByBox[worker.BoxNo].BagDetails = worker.BagDetails || '';
        workersByBox[worker.BoxNo].TotalBags = worker.TotalBag || 0;
      });

      const mappedWorkers = Object.values(workersByBox).map((group) => ({
        EmployeeName: group.Workers.map((w) => w.EmployeeName).join(', '),
        Workers: group.Workers,
        BagDetails: group.BagDetails,
        TotalBags: group.TotalBags,
      }));

      setRequestDetails(mappedWorkers);
    }
  }, [currentData]);

  // Load Waste Rejections
  useEffect(() => {
    if (currentData?.WasteRejections && Array.isArray(currentData.WasteRejections)) {
      const loadWasteRejections = async () => {
        try {
          const wasteDetails = await Promise.all(
            currentData.WasteRejections.map(async (waste) => {
              try {
                // Fetch subcategory - use category ID 11 for waste types
                let subCat = null;
                try {
                  const subCatResponse = await Get(`GetSubCategoriesByCategoryID/11`);
                  subCat = subCatResponse.data.data?.find((sc) => sc.SubCat_ID === waste.SubcatID);
                } catch (err) {
                  console.warn('Error fetching subcategory:', err);
                }

                // Fetch item by subcategory
                let item = null;
                if (waste.SubcatID) {
                  try {
                    const itemResponse = await Get(`itemsgetBySubCatId/${waste.SubcatID}`);
                    item = itemResponse.data.Data?.find((i) => i.ItemID === waste.ItemID);
                  } catch (err) {
                    console.warn('Error fetching item:', err);
                  }
                }

                return {
                  SWID: waste.SWID ?? 0,
                  WasteType: waste.CategoryName || subCat?.SubCat_Name || '',
                  ItemSubCategory: subCat || null,
                  ItemOpen: item
                    ? {
                      ...item,
                      ClassID: item?.InvTypesID,
                      UOM: {
                        UOMName: item?.UOMName || waste.WasteItemUOMName || '',
                        UOM_ID: item?.UOMID || waste.WasteItemUOMID || 0
                      },
                    }
                    : {
                      ItemID: waste.ItemID || 0,
                      ItemDescription: waste.ItemDescription || waste.ItemName || '-',
                      ItemName: waste.ItemName || '-',
                      ItemCode: waste.ItemCode || '',
                      UOM: {
                        UOMName: waste.WasteItemUOMName || '',
                        UOM_ID: waste.WasteItemUOMID || 0
                      },
                    },
                  RejectedQty: waste.WasteQty || 0,
                };
              } catch (error) {
                console.error('Error loading waste rejection:', error);
                return null;
              }
            })
          );

          const validWasteDetails = wasteDetails.filter((w) => w !== null);
          console.log('Loaded waste rejections:', validWasteDetails);
          setnewRequestedDetail(validWasteDetails);
        } catch (error) {
          console.error('Error loading waste rejections:', error);
        }
      };

      loadWasteRejections();
    }
  }, [currentData]);


  // Load selected items from Details array
  useEffect(() => {
    if (currentData?.Details && Array.isArray(currentData.Details) && currentData.Details.length > 0 && grnData?.Details) {
      // Get all IssueDtlIDs from currentData.Details
      const issueDtlIDs = currentData.Details.map((d) => d.IssueDtlID).filter(Boolean);

      // Find matching items in grnData.Details
      const matchedItems = grnData.Details.filter((detail) =>
        issueDtlIDs.includes(detail.IssueDtlID)
      );

      if (matchedItems.length > 0) {
        console.log('Setting selected items from Details:', matchedItems);
        setSelectedValues(issueDtlIDs);
        setSelectedRowDataArray(matchedItems);
      }
    } else if (currentData?.IssueDtlID && grnData?.Details) {
      // Fallback for single item selection
      const issueDetail = grnData.Details.find((d) => d.IssueDtlID === currentData.IssueDtlID);
      if (issueDetail) {
        setSelectedValues([currentData.IssueDtlID]);
        setSelectedRowDataArray([issueDetail]);
      }
    }
  }, [currentData?.Details, currentData?.IssueDtlID, grnData]);

  // Reset workers when on-duty count changes
  // useEffect(() => {
  //   const onDutyCount = Number(values.PresentDuty) || 0;
  //   const currentWorkersCount = validateWorkersCount();

  //   if (onDutyCount < currentWorkersCount) {
  //     setRequestDetails([]);
  //     setValue('EmployeeName', null);
  //     enqueueSnackbar(`On Duty count decreased. Cleared existing workers.`, { variant: 'info' });
  //   }
  // }, [values.PresentDuty, validateWorkersCount, setValue, enqueueSnackbar]);

  // Fetch categories for sorted item selection
  const FetchAllSortedCategoryData = useCallback(async () => {
    if (selectedSortedClassId?.ClassID) {
      try {
        const response = await Get(
          `GetCategoriesByUserIDFrmMiddleware?userID=${userData?.userDetails?.userId}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        const updatedData = response.data
          .filter((item) => item.ClassID === selectedSortedClassId?.ClassID)
          .map((item) => ({
            ...item,
            Inv_Cat_Name: item?.CategoryName,
            Inv_Cat_ID: item?.CategoryID,
          }));
        setAllSortedCategoryData(updatedData || []);
      } catch (error) {
        console.error(error);
        setAllSortedCategoryData([]);
      }
    } else {
      setAllSortedCategoryData([]);
    }
  }, [userData?.userDetails, selectedSortedClassId?.ClassID]);

  useEffect(() => {
    FetchAllSortedCategoryData();
    // Only clear fields if we're NOT in edit mode (i.e., currentData doesn't exist)
    // This prevents clearing fields that were just populated from currentData
    if (!currentData) {
      setValue('SortedCategory', null);
      setValue('SortedSubCategory', null);
      setValue('SortedColor', null);
      setValue('SortedInvSpare', null);
      setValue('SortedItemOpen', null);
    }
  }, [selectedSortedClassId, FetchAllSortedCategoryData, setValue, currentData]);

  // Fetch subcategories for sorted item selection
  const fetchSortedSubCategory = useCallback(async () => {
    if (selectedSortedCategory?.Inv_Cat_ID) {
      try {
        const response = await Get(
          `GetSubCategoriesByCategoryID/${selectedSortedCategory.Inv_Cat_ID}`
        );
        setAllSortedSubCategory(response.data.data);
      } catch (error) {
        console.error(error);
        setAllSortedSubCategory([]);
      }
    } else {
      setAllSortedSubCategory([]);
    }
  }, [selectedSortedCategory?.Inv_Cat_ID]);

  useEffect(() => {
    fetchSortedSubCategory();
    if (!currentData) {
      setValue('SortedSubCategory', null);
      setValue('SortedColor', null);
      setValue('SortedInvSpare', null);
      setValue('SortedItemOpen', null);
    }
  }, [selectedSortedCategory, fetchSortedSubCategory, setValue, currentData]);

  // Fetch colors for sorted item selection
  const GetSortedColors = useCallback(async () => {
    try {
      const response = await Get(
        `GetColorsBySubCatFromItemDB?subCatId=${selectedSortedSubCategory?.SubCat_ID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setAllSortedColors(response.data.data);
    } catch (error) {
      console.log(error);
      setAllSortedColors([]);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    selectedSortedSubCategory?.SubCat_ID,
  ]);

  // Fetch spares for sorted item selection
  const FetchAllSortedSpareByClassID = useCallback(async () => {
    if (selectedSortedSubCategory?.SubCat_ID) {
      try {
        const response = await Get(
          `GetSpareBySubcateID?SubcatID=${selectedSortedSubCategory?.SubCat_ID}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
        );
        setAllSortedInvSpare(response.data || []);
      } catch (error) {
        console.error(error);
        setAllSortedInvSpare([]);
      }
    } else {
      setAllSortedInvSpare([]);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    selectedSortedSubCategory?.SubCat_ID,
  ]);

  useEffect(() => {
    if (selectedSortedSubCategory?.SubCat_ID && selectedSortedClassId?.isColorSensitive === true) {
      GetSortedColors();
    } else {
      setAllSortedColors([]);
    }
    if (!currentData) {
      setValue('SortedItemOpen', null);
    }
  }, [
    selectedSortedSubCategory,
    selectedSortedClassId?.isColorSensitive,
    GetSortedColors,
    setValue,
    currentData,
  ]);

  useEffect(() => {
    if (selectedSortedSubCategory?.SubCat_ID && selectedSortedClassId?.isColorSensitive === false) {
      FetchAllSortedSpareByClassID();
    } else {
      setAllSortedInvSpare([]);
    }
    if (!currentData) {
      setValue('SortedItemOpen', null);
    }
  }, [
    selectedSortedSubCategory,
    selectedSortedClassId?.isColorSensitive,
    FetchAllSortedSpareByClassID,
    setValue,
    currentData,
  ]);

  // Fetch items for sorted item selection
  const fetchSortedItemsBySubCategory = useCallback(async () => {
    if (selectedSortedSpare?.SpareID && selectedSortedClassId?.isColorSensitive === false) {
      try {
        const response = await Get(
          `GetItemsBySpareID?spareId=${selectedSortedSpare?.SpareID}&subCatID=${selectedSortedSubCategory?.SubCat_ID}&branchId=${userData?.userDetails?.branchID}&orgId=${userData?.userDetails?.orgId}`
        );

        const updatedData = response?.data?.map((item) => ({
          ...item,
          ClassID: item?.invTypesID,
          CodeAndDescription: `[${item?.ItemCode}]  ${item?.ItemDescription}`,
          UOM: { UOMName: item?.UOMName || item?.UOMNAME, UOM_ID: item?.UOMID },
        }));
        setSortedItemOpen(updatedData);
        // In edit mode, re-set Item Name from new options so it stays visible
        const sortedItemId = currentData?.SorteditemID || currentData?.SortedItemID || currentData?.sorteditemID;
        if (sortedItemId && updatedData?.length) {
          const foundItem = updatedData.find((i) => i.ItemID === sortedItemId);
          if (foundItem) {
            const formattedItem = {
              ...foundItem,
              ClassID: foundItem?.invTypesID,
              CodeAndDescription: `[${foundItem?.ItemCode}]  ${foundItem?.ItemDescription}`,
              UOM: { UOMName: foundItem?.UOMName || foundItem?.UOMNAME, UOM_ID: foundItem?.UOMID },
            };
            setValue('SortedItemOpen', formattedItem);
          }
        }
      } catch (error) {
        console.error(error);
        setSortedItemOpen([]);
        setAllSortedColors([]);
      }
    } else if (
      selectedSortedSubCategory?.SubCat_ID &&
      selectedSortedClassId?.isColorSensitive === true
    ) {
      try {
        const response = await Get(
          `GetAllItemsFromDBByColorAndSubCat?subCatID=${selectedSortedSubCategory?.SubCat_ID}&colorId=${selectedSortedColor?.ColorID || 0
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
        setSortedItemOpen(updatedData);
        // In edit mode, re-set Item Name from new options so it stays visible (don't clear)
        const sortedItemId = currentData?.SorteditemID || currentData?.SortedItemID || currentData?.sorteditemID;
        if (sortedItemId && updatedData?.length) {
          const foundItem = updatedData.find((i) => i.ItemID === sortedItemId);
          if (foundItem) {
            const formattedItem = {
              ...foundItem,
              CodeAndDescription: `[${foundItem?.ItemCode}]  ${foundItem?.ItemDescription}`,
              UOM: {
                UOM_ID: foundItem?.UOMID,
                UOMName: foundItem?.UOMNAME,
              },
            };
            setValue('SortedItemOpen', formattedItem);
          }
        } else if (!currentData) {
          setValue('SortedItemOpen', null);
        }
      } catch (error) {
        console.error(error);
        setSortedItemOpen([]);
      }
      if (!currentData) {
        setValue('SortedItemOpen', null);
      }
    } else {
      setSortedItemOpen([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- currentData used for edit-mode item restore only
  }, [
    selectedSortedSubCategory,
    selectedSortedColor,
    userData?.userDetails,
    selectedSortedSpare,
    selectedSortedClassId?.isColorSensitive,
    setValue,
    currentData,
  ]);


  // code 

  useEffect(() => {
    if (!currentData) {
      setValue('SortedItemOpen', null);
    }
  }, [selectedSortedColor, setValue, currentData]);

  useEffect(() => {
    if (!currentData) {
      setValue('SortedItemOpen', null);
    }
  }, [selectedSortedSpare, setValue, currentData]);

  useEffect(() => {
    fetchSortedItemsBySubCategory();
  }, [fetchSortedItemsBySubCategory]);

  // Fetch GRN data when requisition is selected
  const selectedChallan = values.ReqCode;
  useEffect(() => {
    const selectedRequisitions = Array.isArray(selectedChallan) ? selectedChallan : (selectedChallan ? [selectedChallan] : []);

    if (selectedRequisitions.length > 0) {
      const fetchGRN = async () => {
        try {
          setIsGrnLoading(true);

          const fetchPromises = selectedRequisitions.map((challan) =>
            Get(
              `GetConfReceiveByReqCode?reqCode=${challan.ReqCode}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
            )
          );

          const responses = await Promise.all(fetchPromises);

          const combinedDetails = responses.flatMap((res, index) => {
            const reqId = selectedRequisitions[index]?.ReqID;
            const details = res.data?.Details || [];
            return details.map((detail) => ({
              ...detail,
              ReqID: reqId || detail.ReqID || null,
            }));
          });

          const combinedGrnData = {
            ...responses[0]?.data,
            Details: combinedDetails,
          };

          console.log('Combined GRN API Response:', combinedGrnData);
          setGrnData(combinedGrnData);
        } catch (err) {
          console.error('Error fetching GRN:', err);
          setGrnData(null);
        } finally {
          setIsGrnLoading(false);
        }
      };

      fetchGRN();
    } else {
      setGrnData(null);
    }
  }, [selectedChallan, userData]);

  const selectedSubCategory = watch(`ItemSubCategory`);
  const fetchItemsBySubCategory = useCallback(async () => {
    if (selectedSubCategory?.SubCat_ID) {
      try {
        const response = await Get(`itemsgetBySubCatId/${selectedSubCategory?.SubCat_ID}`);
        const updatedData = response?.data?.Data.map((item) => ({
          ...item,
          ClassID: item?.InvTypesID,
          UOM: { UOMName: item?.UOMName, UOM_ID: item?.UOMID },
        }));
        setItemOpen(updatedData);
      } catch (error) {
        console.error(error);
        setItemOpen([]);
      }
    } else {
      setItemOpen([]);
    }
  }, [selectedSubCategory]);

  useEffect(() => {
    if (selectedSubCategory?.SubCat_ID) {
      fetchItemsBySubCategory();
    } else {
      setItemOpen([]);
    }
  }, [selectedSubCategory, fetchItemsBySubCategory]);

  const sortedQuantityInput = useWatch({ control, name: 'SortedQty' });

  // Calculate total issued quantity from all selected items
  const totalIssuedQuantity = selectedRowDataArray.reduce(
    (sum, item) => sum + (parseFloat(item?.TotalIssueQty) || 0),
    0
  );

  useEffect(() => {
    const getNumericValue = (val) => {
      const num = parseFloat(val);

      return Number.isNaN(num) || num === null || num === undefined ? 0 : num;
    };

    const currentSortedQuantity = getNumericValue(sortedQuantityInput);
    const currentIssuedQuantity = getNumericValue(totalIssuedQuantity);

    const remaining = currentIssuedQuantity - currentSortedQuantity;

    const finalRemaining = remaining >= 0 ? remaining : 0;

    setValue('RemainingQty', finalRemaining.toFixed(2), { shouldValidate: false });
  }, [sortedQuantityInput, totalIssuedQuantity, setValue]);

  useEffect(() => {
    if (grnData && grnData.Details && grnData.Details.length > 0) {
      const uomName = grnData.Details[0].UOMName;
      const uomId = grnData.Details[0].UOMID;

      setValue('UOM', uomName, { shouldValidate: true });

      setSelectedUOMID(uomId);
    } else {
      setValue('UOM', '');

      setSelectedUOMID(null);
    }
  }, [grnData, setValue]);

  // Handlers for worker details
  const deleteDetailTableRow = (rowToDelete) => {
    const updatedDetails = requestDetails.filter((row) => row !== rowToDelete);
    setRequestDetails(updatedDetails);

    if (editingIndex !== null && requestDetails[editingIndex] === rowToDelete) {
      setEditingIndex(null);
      setValue('EmployeeName', null);
      setValue('BagDetails', '');
      setValue('TotalBags', '');
    }
  };

  const handleEditDetail = (index) => {
    const detail = requestDetails[index];
    const selectedEmployees = detail?.Workers
      ? allSuperVisiorName.filter((emp) =>
        detail.Workers.some((worker) => worker.WorkerID === emp.UserId || worker.UserId === emp.UserId)
      )
      : [];

    setValue('EmployeeName', selectedEmployees);
    setValue('BagDetails', detail?.BagDetails || '');
    setValue('TotalBags', detail?.TotalBags || '');
    setEditingIndex(index);
  };

  const handleAddDetail = () => {
    const onDutyCount = Number(values.PresentDuty) || 0;
    const currentUniqueWorkersCount = validateWorkersCount();

    // Check if we're trying to add more workers than on-duty count
    if (currentUniqueWorkersCount >= onDutyCount && editingIndex === null) {
      enqueueSnackbar(`You cannot add more than ${onDutyCount} workers (On Duty count)`, {
        variant: 'error',
      });
      return;
    }

    if (!values?.EmployeeName || values?.EmployeeName.length === 0) {
      enqueueSnackbar('Worker Name is required', { variant: 'error' });
      return;
    }

    if (!values?.BagDetails) {
      enqueueSnackbar('Bag Details are required', { variant: 'error' });
      return;
    }

    if (!values?.TotalBags) {
      enqueueSnackbar('Total Bags are required', { variant: 'error' });
      return;
    }

    // Calculate how many new unique workers we're trying to add
    const newWorkerIds = values.EmployeeName.map((emp) => emp.UserId);
    const existingWorkerIds = requestDetails.flatMap((detail) =>
      detail.Workers ? detail.Workers.map((worker) => worker.UserId) : []
    );

    const uniqueExistingWorkerIds = [...new Set(existingWorkerIds)];
    const actuallyNewWorkers = newWorkerIds.filter((id) => !uniqueExistingWorkerIds.includes(id));

    // Check if adding new workers would exceed on-duty count
    if (
      editingIndex === null &&
      uniqueExistingWorkerIds.length + actuallyNewWorkers.length > onDutyCount
    ) {
      enqueueSnackbar(
        `Cannot add more than ${onDutyCount} workers. Currently have ${uniqueExistingWorkerIds.length}, trying to add ${actuallyNewWorkers.length} more.`,
        { variant: 'error' }
      );
      return;
    }

    const employeeNames = values.EmployeeName.map((emp) => emp.EmployeeName).join(', ');

    const newDetail = {
      Workers: values.EmployeeName,
      EmployeeName: employeeNames,
      BagDetails: values?.BagDetails,
      TotalBags: values?.TotalBags,
    };

    if (editingIndex !== null) {
      const updatedDetails = [...requestDetails];
      updatedDetails[editingIndex] = newDetail;
      setRequestDetails(updatedDetails);
    } else {
      setRequestDetails((prev) => [...prev, newDetail]);
    }

    resetDetailForm();
  };

  const resetDetailForm = () => {
    setValue('EmployeeName', null);
    setValue('BagDetails', '');
    setValue('TotalBags', '');
    setEditingIndex(null);
  };

  // Handlers for waste rejection details
  const DeleteDetailTableRowForSecond = (rowToDelete) => {
    const updatedDetails = newRequestedDetail.filter((row) => row !== rowToDelete);
    setnewRequestedDetail(updatedDetails);

    if (editingIndex !== null && newRequestedDetail[editingIndex] === rowToDelete) {
      setEditingIndex(null);

      setValue('ItemSubCategory', null);
      setValue('ItemOpen', '');
      setValue('Quantity', '');
    }
  };

  const AddRejecttionQty = () => {
    if (!values?.ItemSubCategory) {
      enqueueSnackbar('Waste Type are required', { variant: 'error' });
      return;
    }
    if (!values?.ItemOpen) {
      enqueueSnackbar('Item Name are required', { variant: 'error' });
      return;
    }
    if (!values?.Quantity || values.Quantity <= 0) {
      enqueueSnackbar('Quantity is required and must be a positive number', { variant: 'error' });
      return;
    }

    const remaining = parseFloat(values.RemainingQty) || 0;
    const enteredQuantity = parseFloat(values.Quantity);

    if (enteredQuantity > remaining) {
      enqueueSnackbar(
        `Quantity (${enteredQuantity}) cannot exceed the Remaining Quantity (${remaining}).`,
        { variant: 'error' }
      );
      return;
    }

    const secondDetail = {
      SWID: 0,
      WasteType: values?.ItemSubCategory?.SubCat_Name,
      ItemSubCategory: values?.ItemSubCategory,
      ItemOpen: values?.ItemOpen,
      RejectedQty: values?.Quantity,
    };

    if (editingIndex !== null) {
      const updatedDetails = [...newRequestedDetail];
      updatedDetails[editingIndex] = secondDetail;
      setnewRequestedDetail(updatedDetails);
    } else {
      setnewRequestedDetail((prev) => [...prev, secondDetail]);
    }

    secondResetDetailForm();

  };

  const secondResetDetailForm = () => {
    setValue('ItemSubCategory', null);
    setValue('ItemOpen', '');
    setValue('Quantity', '');
    setEditingIndex(null);
  };

  // Validate PresentDuty doesn't exceed TotalWorker
  const totalWorker = useWatch({ control, name: 'TotalWorker' });
  const presentDuty = useWatch({ control, name: 'PresentDuty' });

  useEffect(() => {
    if (Number(presentDuty) > Number(totalWorker)) {
      setValue('PresentDuty', totalWorker || '');
    }
  }, [totalWorker, presentDuty, setValue]);

  // Calculate total bags sum
  const calculateTotalBagsSum = useCallback(
    () => requestDetails.reduce((sum, detail) => sum + (Number(detail.TotalBags) || 0), 0),
    [requestDetails]
  );

  // Save handler: runs on form submit (FormProvider uses methods.handleSubmit so no page reload)
  const onSubmit = async (formData) => {

    if (selectedRowDataArray.length === 0) {
      enqueueSnackbar('Please select at least one item from the requisition table', {
        variant: 'error',
      });
      return;
    }

    if (newRequestedDetail.length === 0) {
      enqueueSnackbar('Please add at least Waste Qty', { variant: 'error' });
      return;
    }

    const remainingQty = Number(values?.RemainingQty);
    const totalRejectionQty = Number(totalQuantitySum);

    if (totalRejectionQty > remainingQty) {
      enqueueSnackbar(
        `Total rejected quantity (${totalRejectionQty}) cannot exceed the remaining quantity (${remainingQty}).`,
        { variant: 'error' }
      );
      return;
    }

    try {
      // Format date to ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
      const formatReportDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toISOString ? d.toISOString() : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T00:00:00.000Z`;
      };

      // Create Details array from selected items (required by UpdateSortingReport)
      const details = selectedRowDataArray.map((item) => ({
        ReqId: item.ReqID || null,
        IssueDtlID: item.IssueDtlID || null,
        IssueConfQty: parseFloat(item.TotalIssueQty) || 0,
        UOMID: item.UOMID || selectedUOMID || null,
      }));

      // Create WasteRejections with SWID (0 for new, existing SWID for edit)
      const wasteRejections = newRequestedDetail.map((detail) => ({
        SWID: detail.SWID ?? 0,
        SubcatID: detail.ItemSubCategory?.SubCat_ID || null,
        ItemID: detail.ItemOpen?.ItemID || null,
        WasteQty: parseFloat(detail.RejectedQty) || 0,
      }));

      const dataToSend = {
        ReportID: currentData?.ReportID || 0,
        PDONO: currentData?.PDONO || currentData?.PDONo || currentData?.ReportCode || '',
        ReportDate: formatReportDate(values.PRDate),
        SupervisorID: values.UserId?.UserId || null,
        WorkerShiftID: values.ShiftName?.ShiftId || null,
        UOMID: selectedUOMID || null,
        TotalWorker: Number(values.TotalWorker) || 0,
        OnDuty: Number(values.PresentDuty) || 0,
        SortedQty: parseFloat(values.SortedQty) || 0,
        SortedRemQty: parseFloat(values.RemainingQty) || 0,
        ReasonOfRejec: values.Reason || '',
        Remarks: values.Remarks || '',
        TransferTo: formData?.TransferTo ?? currentData?.TransferTo ?? 0,
        ColorID: values.SortedColor?.ColorID || null,
        SorteditemID: values.SortedItemOpen?.ItemID || null,
        IsApproved: currentData?.IsApproved ?? false,
        ApprovedBy: currentData?.ApprovedBy ?? null,
        ApprovalDate: currentData?.ApprovalDate ?? null,
        CreatedBy: currentData?.CreatedBy ?? userData?.userDetails?.userId ?? null,
        Org_ID: userData?.userDetails?.orgId ?? null,
        Branch_ID: userData?.userDetails?.branchID ?? null,
        Details: details,
        WasteRejections: wasteRejections,
      };

      const res = await Put(`UpdateSortingReport`, dataToSend);

      if (res?.data?.Success === false) {
        enqueueSnackbar(res?.data?.Message || 'Update failed', { variant: 'error' });
        return;
      }

      enqueueSnackbar('Sorting Production Report Updated Successfully!');
      router.push(paths.dashboard.Production.ProductionReport.root);
      reset();
      setRequestDetails([]);
      setnewRequestedDetail([]);
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.Message || error?.message || 'Error updating sorting report';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  // Wire form submit: prevents default (no page reload) and runs onSubmit
  const handleFormSubmit = methods.handleSubmit(onSubmit);

  // Render loading screen
  if (isLoading) {
    return (
      <LoadingScreen
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70vh',
        }}
      />
    );
  }

  return (
    <FormProvider methods={methods} onSubmit={handleFormSubmit}>
      <Grid container spacing={2}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 2 }}>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(3, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              <Controller
                name="PRDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Report Date"
                    format="dd/MM/yyyy"
                    value={field.value || new Date()}
                    onChange={(newValue) => field.onChange(newValue)}
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
                name="UserId"
                label="Supervisior Name"
                placeholder="Choose a color"
                fullWidth
                options={allSuperVisiorName}
                getOptionLabel={(option) => option?.EmployeeName || ''}
                renderOption={(props, option) => (
                  <li {...props} key={option.UserId}>
                    {option.EmployeeName}
                  </li>
                )}
                value={values?.UserId || null}
              />

              <RHFAutocomplete
                name="ShiftName"
                label="Select Shift"
                placeholder="Choose a shift"
                fullWidth
                options={allShiftName}
                getOptionLabel={(option) => option?.ShiftName || ''}
                isOptionEqualToValue={(option, value) => option?.ShiftID === value?.ShiftID}
                renderOption={(props, option) => (
                  <li {...props} key={option.ShiftID}>
                    {option.ShiftName}
                  </li>
                )}
              />


            </Box>
          </Card>

          <Card sx={{ p: 2, mt: 1 }}>
            <Box
              rowGap={2}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(3, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <h3>Select Requisition No.</h3>
              <br />

              <RHFAutocomplete
                name="ReqCode"
                label="Requisition No"
                placeholder="Choose requisitions"
                fullWidth
                multiple
                options={allChallanNo}
                getOptionLabel={(option) => option?.ReqCodeWithDate || option?.ReqCode || ''}
                isOptionEqualToValue={(option, value) => {
                  if (!option || !value) return false;
                  const optionCode = (option.ReqCode || '').toString().trim().toUpperCase();
                  const valueCode = (value.ReqCode || '').toString().trim().toUpperCase();
                  return optionCode === valueCode;
                }}
                value={Array.isArray(values?.ReqCode) ? values.ReqCode : (values?.ReqCode ? [values.ReqCode] : [])}
                renderOption={(props, option, { selected }) => (
                  <li {...props} key={option.ReqCode}>
                    <Checkbox
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option?.ReqCodeWithDate || option?.ReqCode || ''}
                  </li>
                )}
                renderTags={(value, getTagProps) => {
                  const limit = 2;
                  const customGreenStyle = {
                    backgroundColor: '#4F782B',
                    color: 'white',
                  };

                  return (
                    <>
                      {value.slice(0, limit).map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option.ReqCode}
                          label={option.ReqCodeWithDate || option.ReqCode}
                          size="small"
                          sx={customGreenStyle}
                        />
                      ))}
                      {value.length > limit && (
                        <Chip
                          label={`+${value.length - limit} more`}
                          size="small"
                          sx={customGreenStyle}
                        />
                      )}
                    </>
                  );
                }}
              />
            </Box>
            {/* </Card> */}

            {isGrnLoading ? (
              // <Card sx={{ p: 4, mt: 2 }}>
              // <h3>Requested Item Details</h3>
              <Stack spacing={1}>
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
              </Stack>
              // </Card>
            ) : (
              grnData?.Details?.length > 0 && (
                // <Card sx={{ p: 4, mt: 2 }}>
                // <h3>Requested Item Details</h3>
                <>
                  {selectedRowDataArray.length > 0 && (
                    <Box
                      sx={{
                        mt: 2,
                        mb: 1,
                        p: 1.5,
                        backgroundColor: '#4caf5020',
                        borderRadius: 1,
                        border: '1px solid #4caf50',
                      }}
                    >
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        ✓ {selectedRowDataArray.length} item(s) selected | Total Issued Qty:{' '}
                        {fNumber(totalIssuedQuantity)}{' '}
                        {selectedRowDataArray.length > 0 && selectedRowDataArray[0]?.UOMName}
                      </Typography>
                    </Box>
                  )}
                  <TableContainer sx={{ mt: 2 }}>
                    <Scrollbar sx={{ maxHeight: '400px' }}>
                      <Table
                        size={table.dense ? 'small' : 'medium'}
                        component={Paper}
                        sx={{
                          minWidth: 460,
                          // border: 1,
                          // borderColor: '#f4f6f8',
                          // borderStyle: 'dotted',
                        }}
                      >
                        <TableHeadCustom
                          order={table.order}
                          orderBy={table.orderBy}
                          headLabel={ChallanDetailsTableHead}
                        />

                        <TableBody>
                          {grnData.Details.map((row, index) => (
                            <tr key={index}>
                              <td style={{ textAlign: 'center' }}>
                                <Checkbox
                                  checked={selectedValues.includes(row.IssueDtlID)}
                                  onChange={() => handleCheckboxChange(row)}
                                  color="primary"
                                />
                              </td>

                              <td
                                style={{
                                  textAlign: 'left',
                                  whiteSpace: 'nowrap',
                                  maxWidth: 420,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {row.ItemName}
                              </td>
                              {/* <td style={{ textAlign: 'center' }}>{row.CategoryName}</td> */}
                              {/* <td style={{ textAlign: 'center' }}>{row.SubCatName}</td> */}
                              {/* <td style={{ textAlign: 'center' }}>{row.InvTypeName}</td> */}
                              <td style={{ textAlign: 'center' }}>{row.StoreName}</td>
                              <td style={{ textAlign: 'center' }}>{row.LocationName}</td>

                              <td style={{ textAlign: 'right' }}>{`${fNumber(
                                row.TotalRequestedQty
                              )} ${row.UOMName}`}</td>
                              <td style={{ textAlign: 'right' }}>{`${fNumber(row.TotalIssueQty)} ${row.UOMName
                                }`}</td>
                              {/* <td style={{ textAlign: 'right' }}>{`${fNumber(row.RemainingQty)} ${
                              row.UOMName
                            }`}</td> */}

                              {/* <td style={{ textAlign: 'center' }}>{row.Remarks || '-'}</td> */}
                            </tr>
                          ))}

                          <TableEmptyRows
                            height={denseHeight}
                            emptyRows={emptyRows(
                              table.page,
                              table.rowsPerPage,
                              grnData.Details.length
                            )}
                          />

                          <TableNoData notFound={grnData.Details.length === 0} />
                        </TableBody>
                      </Table>
                    </Scrollbar>
                  </TableContainer>
                </>
              )
            )}
          </Card>

          {/*           {/* <Card sx={{ p: 2, mt: 2 }}>
            <h3>Worker Report</h3>
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
                name="EmployeeName"
                label="Worker Name"
                placeholder="Select workers"
                fullWidth
                multiple
                options={allSuperVisiorName}
                getOptionLabel={(option) => option?.EmployeeName || ''}
                isOptionEqualToValue={(option, value) => option.UserId === value.UserId}
                renderOption={(props, option) => (
                  <li {...props} key={option.UserId}>
                    {option.EmployeeName}
                  </li>
                )}
                renderTags={(value, getTagProps) => {
                  const limit = 2;

                  const customGreenStyle = {
                    backgroundColor: '#4F782B',
                    color: 'white',
                  };

                  return (
                    <>
                      {value.slice(0, limit).map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option.UserId}
                          label={option.EmployeeName}
                          size="small"
                          sx={customGreenStyle}
                        />
                      ))}

                      {value.length > limit && (
                        <Chip
                          label={`+${value.length - limit} more`}
                          size="small"
                          sx={customGreenStyle}
                        />
                      )}
                    </>
                  );
                }}
                value={values?.EmployeeName || []}
              />

              <RHFTextField
                name="TotalBags"
                label="Total Bags"
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">PCS</InputAdornment>,
                }}
              />
              <RHFTextField name="BagDetails" label="Bags Details" />
            </Box>
            <Stack alignItems="flex-end" direction="row-reverse" sx={{ mt: 2, gap: 2 }}>
              <Button color="primary" onClick={handleAddDetail} variant="contained">
                {editingIndex !== null ? 'Update' : 'Add'}
              </Button>
              {editingIndex !== null && (
                <Button color="error" onClick={resetDetailForm} variant="outlined">
                  Cancel
                </Button>
              )}
            </Stack>

            {requestDetails.length > 0 && (
              <>
                <TableContainer>
                  <Scrollbar sx={{ maxHeight: '400px' }}>
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
                        {requestDetails.map((row, index) => (
                          <ProductionReportTableRow
                            key={index}
                            row={row}
                            onDeleteRow={() => deleteDetailTableRow(row)}
                            onEditRow={() => handleEditDetail(index)}
                          />
                        ))}

                        <TableEmptyRows
                          height={denseHeight}
                          emptyRows={emptyRows(
                            table.page,
                            table.rowsPerPage,
                            requestDetails.length
                          )}
                        />

                        <TableNoData notFound={notFound} />
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell
                            colSpan={2}
                            align="left"
                            sx={{
                              fontWeight: 'normal',
                              color: '#4f782b',
                              borderTop: '4px solid black',
                              fontSize: '14px',
                            }}
                          >
                            Total Bags Qty : {calculateTotalBagsSum()}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </Scrollbar>
                </TableContainer>
                <WorkerCountDisplay />
              </>
            )}
          </Card> */}

          <Card sx={{ p: 2, mt: 4 }}>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(4, 1fr)',
              }}
            >

              <RHFAutocomplete
                name="SortedClassID"
                label="Inventory Type"
                placeholder="Choose an option"
                fullWidth
                options={allSortedClassName}
                getOptionLabel={(option) => option?.ClassName || ''}
                isOptionEqualToValue={(option, value) => option?.ClassID === value?.ClassID}
                value={values?.SortedClassID || null}
              />

              <RHFAutocomplete
                name="SortedCategory"
                label="Select Item Category"
                placeholder="Choose an option"
                fullWidth
                options={allSortedCategoryData}
                getOptionLabel={(option) => option?.Inv_Cat_Name || ''}
                isOptionEqualToValue={(option, value) => option.Inv_Cat_ID === value.Inv_Cat_ID}
                value={values?.SortedCategory || null}
              />

              <RHFAutocomplete
                name="SortedSubCategory"
                label="Select Item Sub Category"
                placeholder="Choose an option"
                fullWidth
                options={allSortedSubCategory}
                getOptionLabel={(option) => option?.SubCat_Name || ''}
                isOptionEqualToValue={(option, value) => option?.SubCat_ID === value?.SubCat_ID}
                value={values?.SortedSubCategory || null}
              />

              {selectedSortedClassId?.isColorSensitive ? (
                <RHFAutocomplete
                  name="SortedColor"
                  label="Color Name & Code"
                  placeholder="Choose an option"
                  fullWidth
                  options={allSortedColors}
                  getOptionLabel={(option) => option?.Color_and_Code || ''}
                  isOptionEqualToValue={(option, value) => option.ColorID === value?.ColorID}
                  value={values?.SortedColor || null}
                />
              ) : (
                <RHFAutocomplete
                  name="SortedInvSpare"
                  label="Spare Name & Code"
                  placeholder="Choose an option"
                  fullWidth
                  options={allSortedInvSpare}
                  getOptionLabel={(option) => option?.SpareNameAndNo || ''}
                  isOptionEqualToValue={(option, value) => option?.SpareID === value?.SpareID}
                  value={values?.SortedInvSpare || null}
                />
              )}

              <RHFAutocomplete
                name="SortedItemOpen"
                label="Item Name"
                placeholder="Choose an option"
                fullWidth
                options={SortedItemOpen}
                getOptionLabel={(option) =>
                  option?.ItemDescription || option?.CodeAndDescription || ''
                }
                isOptionEqualToValue={(option, value) => option.ItemID === value.ItemID}
                value={values?.SortedItemOpen || null}
              />

              <TextField
                label="Total Issued Quantity"
                value={`${fNumber(totalIssuedQuantity || 0)}`}
                disabled
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      {selectedRowDataArray.length > 0
                        ? (selectedRowDataArray[0]?.UOMName || 'Unit')
                        : 'Unit'}
                      {selectedRowDataArray.length > 1 && ` (${selectedRowDataArray.length} items)`}
                    </InputAdornment>
                  ),
                }}
                helperText={
                  selectedRowDataArray.length > 0
                    ? `${selectedRowDataArray.length} item(s) selected`
                    : 'Please select item(s) from the requisition table'
                }
              />

              <RHFTextField
                name="SortedQty"
                label="Sorted Quantity"
                type="number"
                disabled={selectedRowDataArray.length === 0}
                placeholder={selectedRowDataArray.length === 0 ? 'Please select item(s) first' : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {selectedRowDataArray.length > 0
                        ? (selectedRowDataArray[0]?.UOMName || 'Unit')
                        : 'Unit'}
                    </InputAdornment>
                  ),
                }}
                helperText={
                  selectedRowDataArray.length === 0
                    ? 'First Select item(s) from the requisition table to enable this field'
                    : `Total issued: ${fNumber(totalIssuedQuantity)}`
                }
                onBlur={(e) => {
                  const sortedQty = parseFloat(e.target.value);

                  if (sortedQty > totalIssuedQuantity) {
                    enqueueSnackbar(
                      `Sorted Quantity cannot exceed the total Issued Quantity (${fNumber(totalIssuedQuantity)})`,
                      {
                        variant: 'error',
                      }
                    );
                    setValue('SortedQty', totalIssuedQuantity || 0);
                  }
                }}
              />

              <TextField
                label="Remaining Quantity"
                value={fNumber(values.RemainingQty) || '0.00'}
                disabled
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      {selectedRowDataArray.length > 0
                        ? (selectedRowDataArray[0]?.UOMName || 'Unit')
                        : 'Unit'}
                    </InputAdornment>
                  ),
                }}
              />

              <RHFTextField name="Reason" label="Reasons For Rejection" />
              <RHFTextField name="Remarks" label="Enter Remarks (Optional)" />
            </Box>
          </Card>

          <Card sx={{ p: 2, mt: 2 }}>
            <h3>Waste</h3>

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
                name="ItemSubCategory"
                label="Select Waste Type"
                placeholder="Choose an option"
                fullWidth
                options={itemSubCategory}
                getOptionLabel={(option) => option?.SubCat_Name || ''}
                value={values?.ItemSubCategory || null}
              />
              <RHFAutocomplete
                name="ItemOpen"
                label="Item Name"
                placeholder="Choose an option"
                fullWidth
                options={ItemOpen}
                getOptionLabel={(option) => option?.ItemDescription || ''}
                isOptionEqualToValue={(option, value) => option.ItemID === value.ItemID}
                value={values?.ItemOpen || null}
              />

              <RHFTextField
                name="Quantity"
                label="Quantity"
                type="number"
                InputProps={
                  values?.ItemOpen?.UOMName
                    ? {
                      endAdornment: (
                        <InputAdornment position="end">
                          {values?.ItemOpen?.UOMName}
                        </InputAdornment>
                      ),
                    }
                    : {}
                }
              />
            </Box>
            <Stack alignItems="flex-end" direction="row-reverse" sx={{ my: 3, gap: 2 }}>
              <Button color="primary" onClick={AddRejecttionQty} variant="contained">
                {editingIndex !== null ? 'Update' : 'Add'}
              </Button>
              {editingIndex !== null && (
                <Button color="error" onClick={secondResetDetailForm} variant="outlined" sx={{ mt: 1 }}>
                  Cancel
                </Button>
              )}
            </Stack>

            {newRequestedDetail.length > 0 && (
              <TableContainer>
                <Scrollbar sx={{ maxHeight: '400px' }}>
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
                      headLabel={WasteTable}
                    />

                    <TableBody>
                      {newRequestedDetail.map((row, index) => (
                        <ProductionReportSecondTable
                          key={index}
                          row={row}
                          onDeleteRow={() => DeleteDetailTableRowForSecond(row)}
                        />
                      ))}

                      <TableEmptyRows
                        height={denseHeight}
                        emptyRows={emptyRows(
                          table.page,
                          table.rowsPerPage,
                          newRequestedDetail.length
                        )}
                      />
                    </TableBody>
                  </Table>
                </Scrollbar>
                <TableFooter>
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      align="left"
                      sx={{
                        fontWeight: 'normal',
                        color: '#637381',
                        fontSize: '14px',
                      }}
                    >
                      <br />
                      Total Quantity :{' '}
                      <span
                        style={{
                          color: totalQuantitySum > values?.RemainingQty ? '#FF4842' : 'inherit',
                          fontWeight: totalQuantitySum > values?.RemainingQty ? 'bold' : 'normal',
                        }}
                      >
                        {fNumber(totalQuantitySum)}
                      </span>{' '}
                      {selectedRowDataArray.length > 0 ? selectedRowDataArray[0]?.UOMName : ''}
                    </TableCell>
                  </TableRow>
                </TableFooter>
                <TableRow>
                  {totalQuantitySum > values?.RemainingQty && (
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{
                        color: '#FF1A38',
                        fontWeight: 'bold',
                        py: 1.5,
                      }}
                    >
                      Alert : Total Rejection Qty Cannot exceed the Remaining Quantity of Item!
                    </TableCell>
                  )}
                </TableRow>
              </TableContainer>
            )}
          </Card>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton
              type='submit'
              variant="contained"
              color="primary"
              loading={isSubmitting}
            >
              Save
            </LoadingButton>
          </Stack>
       
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ProductionReportEditForm.propTypes = {
  currentData: PropTypes.any,
};