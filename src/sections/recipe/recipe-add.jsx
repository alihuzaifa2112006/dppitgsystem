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
  IconButton,
  Link,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { borderBottom, borderColor } from '@mui/system';
import RecipeItemsTable from './RecipeItemsTable';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { fData } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

const TABS = [
  {
    value: 'standard',
    label: 'Standard Recipe',
  },
  {
    value: 'customer',
    label: 'Customer Recipe',
  },
];

export default function RecipeAdd() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('UserData'));

  // State for dropdown options
  const [currentTab, setCurrentTab] = useState('standard');
  const [subCategories, setSubCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [colorFamilies, setColorFamilies] = useState([]);
  const [colors, setColors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [blends, setBlends] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allSamples, setAllSamples] = useState([]);
  const [YarnType, setYarnType] = useState([]);
  const [yarnCount, setYarnCount] = useState([]);
  const [allComposition, setAllComposition] = useState([]);
  const [allEndBuyers, setAllEndBuyers] = useState([]);
  const [itemsbySample, setItemsbySample] = useState([]);
  const [sampleRequestMaster, setSampleRequestMaster] = useState(null);
  const [lotNames, setLotNames] = useState([]);

  const RecipeSchema = Yup.object().shape({
    Recipe_Name: Yup.string().required('Recipe name is required'),

    // Common fields for both recipe types
    colorfamily: Yup.object().when('$currentTab', {
      is: 'standard',
      then: () => Yup.object().required('Color family is required for standard recipes'),
      otherwise: () => Yup.object().notRequired(),
    }),
    goalcolor: Yup.object().required('Final goal color is required'),
    recipe_pic: Yup.mixed().required('Recipe picture is required'),
    // final_color_pic: Yup.mixed().required('Final color picture is required'),
    customer_swatch_pic: Yup.mixed().nullable(),
    RecipePicture: Yup.mixed().nullable(),
    swatch_pic_with_cyclo_yarn: Yup.mixed().nullable(),
    data_color_score_card: Yup.mixed().nullable(),
    // Conditional fields based on recipe type
    customer: Yup.mixed().when('$currentTab', {
      is: 'customer',
      then: () => Yup.object().required('Customer is required for customer recipes'),
      otherwise: () => Yup.mixed().notRequired(),
    }),

    buyer: Yup.mixed().when('$currentTab', {
      is: 'customer',
      then: () => Yup.object().required('Buyer is required for customer recipes'),
      otherwise: () => Yup.mixed().notRequired(),
    }),

    sample_serial_no: Yup.mixed().when('$currentTab', {
      is: 'customer',
      then: () => Yup.object().required('Sample serial no is required for customer recipes'),
      otherwise: () => Yup.object().notRequired(),
    }),

    LabTechnician: Yup.mixed().when('$currentTab', {
      is: 'customer',
      then: () => Yup.object().required('Lab Technician is required for customer recipes'),
      otherwise: () => Yup.mixed().notRequired(),
    }),

    // RevisionNo: Yup.string().when('$currentTab', {
    //   is: 'customer',
    //   then: () => Yup.string().required('Revision No is required for customer recipes'),
    //   otherwise: () => Yup.string().notRequired(),
    // }),

    RecipeCreationDate: Yup.date().required('Recipe Creation Date is required '),

    Composition: Yup.object().required('Composition is required'),

    yarntype: Yup.object().required('Yarn type is required'),

    yarnCount: Yup.object().required('Yarn count is required'),

    // Recipe items validation (common for both)
    // recipeItems: Yup.array()
    //   .of(
    //     Yup.object().shape({
    //       class: Yup.object().required('Item type is required'),
    //       category: Yup.object().required('Item category is required'),
    //       subCategory: Yup.object().required('Sub category is required'),
    //       item: Yup.object().required('Item is required'),
    //       colorFamily: Yup.object().required('Color family is required'),
    //       color: Yup.object().required('Color is required'),
    //       hex: Yup.string().required('RM Lot# is required'),
    //       percentage: Yup.number()
    //         .required('Blend % is required')
    //         .min(0, 'Blend % must be positive')
    //         .max(100, 'Blend % cannot exceed 100'),
    //     })
    //   )
    //   .test('total-percentage', (itms, context) => {
    //     if (!itms || itms.length === 0) {
    //       return context.createError({ message: 'No recipe items added' });
    //     }
    //     const total = itms.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0);
    //     if (Math.round(total) !== 100) {
    //       return context.createError({
    //         message: `Total percentage is ${total.toFixed(2)}% (must equal exactly 100%)`,
    //       });
    //     }
    //     return true;
    //   })
    //   .test('unique-colors', (itms, context) => {
    //     if (!itms) return false;
    //     const colorIds = itms.map((item) => item.color?.ColorID).filter(Boolean);
    //     const uniqueColors = new Set(colorIds);

    //     if (uniqueColors.size !== colorIds.length) {
    //       const duplicates = colorIds.filter((id, index) => colorIds.indexOf(id) !== index);
    //       const duplicateColors = itms
    //         .filter((item) => duplicates.includes(item.color?.ColorID))
    //         .map((item) => item.color?.Color_and_Code || 'Unknown color');

    //       return context.createError({
    //         message: `Duplicate colors found: ${[...new Set(duplicateColors)].join(', ')}`,
    //       });
    //     }
    //     return true;
    //   }),
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
    resolver: yupResolver(RecipeSchema),
    context: {
      currentTab, // Add currentTab to form context for schema validation
    },
    defaultValues: {
      version: 'v0',
      RecipeCreationDate: new Date(),
    },
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

  const FetchYarnTypeData = useCallback(async () => {
    try {
      const response = await Get(
        `getAllyarntype?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const newdata = response.data.Data.map((item) => ({
        ...item,
        YarnTypeNickName: `${item.YarnTypeName} ${item.YarnType_Code}`,
      }));
      setYarnType(newdata);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchCompositionData = useCallback(async () => {
    try {
      const response = await Get(
        `yarncomposition/GetActiveCompositions?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const newdata = response.data.Data.map((item) => ({
        ...item,
        CompositionNickName: `${item.CompositionName} ${item.Composition_Code}`,
      }));
      setAllComposition(newdata);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // Separate API call functions
  const fetchSubCategories = useCallback(async () => {
    try {
      const response = await Get(
        `Production/GetSubCategories?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setSubCategories(response.data?.Data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchYarnCountData = useCallback(async () => {
    try {
      const response = await Get(
        `yarncount?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setYarnCount(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetAllUsers = useCallback(async () => {
    const res = await Get(
      `GetHrRegisteredUsers?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setAllUsers(res.data?.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const getsamplereqList = useCallback(async () => {
    try {
      const response = await Get(
        `getAllApproveSample?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&wicID=${values?.customer?.WIC_ID}`
      );
      if (response?.data?.Data) {
        setAllSamples(response.data.Data);
      } else {
        setAllSamples([]);
      }
    } catch (error) {
      console.log(error);
      setAllSamples([]);
    } finally {
      setValue('sample_serial_no', null);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    values?.customer?.WIC_ID,
    setValue,
  ]);

  const getItemsBySample = useCallback(async () => {
    try {
      if (!values?.sample_serial_no?.Sample_Request_ID) {
        setItemsbySample([]);
        setSampleRequestMaster(null);
        setValue('item', null);
        return;
      }

      const response = await Get(
        `GetSampleRequestsAndDetailsByID?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&SampleRequestID=${values.sample_serial_no.Sample_Request_ID}`
      );

      // Extract Details array from response
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        // Response is an array, get Details from first item
        const masterData = response.data[0];
        const details = masterData?.Details || [];
        setItemsbySample(details);
        // Store master data for accessing End_CustomerID
        setSampleRequestMaster(masterData);
      } else if (response?.data?.Details) {
        // Handle case where Details is directly in data
        setItemsbySample(response.data.Details);
        setSampleRequestMaster(response.data);
      } else {
        setItemsbySample([]);
        setSampleRequestMaster(null);
      }
    } catch (error) {
      console.error('Error fetching items by sample:', error);
      enqueueSnackbar('Failed to load items', { variant: 'error' });
      setItemsbySample([]);
      setSampleRequestMaster(null);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    values?.sample_serial_no?.Sample_Request_ID,
    setValue,
    enqueueSnackbar,
  ]);

  const GetAllEndCustomer = useCallback(async () => {
    const res = await Get(
      `getAllendcustomer?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );
    setAllEndBuyers(res.data?.Data || []);
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // const fetchMaterialTypes = useCallback(async () => {
  //   try {
  //     // First check if subcategory exists and has SubCat_ID
  //     if (!values?.recipeItems.subCategory?.SubCat_ID) {
  //       setMaterialTypes([]); // Clear material types if no SubCat_ID
  //       return;
  //     }

  //     const response = await Get(
  //       `Production/GetMaterialTypes?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&SubCat_ID=${values.recipeItems.subcategory.SubCat_ID}`
  //     );
  //     setMaterialTypes(response.data?.Data || []);

  //   } catch (error) {
  //     console.error('Error fetching material types:', error);
  //     enqueueSnackbar('Failed to load material types', { variant: 'error' });
  //     throw error;
  //   }
  // }, [
  //   userData?.userDetails?.orgId,
  //   userData?.userDetails?.branchID,
  //   values?.recipeItems.subcategory?.SubCat_ID, // Add this to dependencies
  //   enqueueSnackbar // Add this if using enqueueSnackbar
  // ]);

  const fetchItems = useCallback(async () => {
    try {
      // First check if required IDs exist
      if (!values?.subcategory?.SubCat_ID) {
        setItems([]); // Clear items if missing required IDs
        return;
      }

      const response = await Get(
        `Production/GetItemSpecifications?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&SubCat_ID=${values.subcategory.SubCat_ID}&MaterialTypeID=0`
      );
      setItems(response.data?.Data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      enqueueSnackbar('Failed to load items', { variant: 'error' });
      throw error;
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    values?.subcategory?.SubCat_ID, // Add to dependencies
    enqueueSnackbar,
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

  const fetchColors = useCallback(async () => {
    try {
      // First check if colorfamily exists and has ColorFamilyID
      if (!values?.colorfamily?.ColorFamilyID) {
        setColors([]); // Clear colors if no ColorFamilyID
        return;
      }

      const response = await Get(
        `Production/GetColors?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&ColorFamilyID=${values.colorfamily.ColorFamilyID}`
      );
      setColors(response.data?.Data || []);
    } catch (error) {
      console.error('Error fetching colors:', error);
      enqueueSnackbar('Failed to load colors', { variant: 'error' });
      throw error;
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    values?.colorfamily?.ColorFamilyID, // Add this to dependencies
    enqueueSnackbar, // Add this if using enqueueSnackbar
  ]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllWICList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const fetchBlends = useCallback(async () => {
    try {
      const response = await Get(
        `Production/GetBlendNames?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setBlends(response.data?.Data || []);
    } catch (error) {
      console.error('Error fetching blends:', error);
      enqueueSnackbar('Failed to load blends', { variant: 'error' });
      throw error;
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,

    enqueueSnackbar, // Add this if using enqueueSnackbar
  ]);

  const fetchLotNames = useCallback(async () => {
    try {
      const response = await Get(
        `Production/GetAllLotNo?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      // Handle different response structures
      const lotData = response.data?.Data || response.data || [];
      // Transform API response to match dropdown structure (LotNo -> LotName)
      const transformedData = Array.isArray(lotData)
        ? lotData.map((item) => ({
          LotName: item.LotNo || item.LotName,
          LotNo: item.LotNo || item.LotName,
        }))
        : [];
      setLotNames(transformedData);
    } catch (error) {
      console.error('Error fetching lot names:', error);
      enqueueSnackbar('Failed to load lot names', { variant: 'error' });
      setLotNames([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  // Data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchSubCategories(),
          FetchYarnTypeData(),
          FetchCompositionData(),
          FetchYarnCountData(),
          // getsamplereqList(),
          GetAllUsers(),
          GetAllEndCustomer(),
          // fetchMaterialTypes(),
          fetchItems(),
          fetchColorFamilies(),
          fetchColors(),
          fetchCustomers(),
          fetchBlends(),
          fetchLotNames(),
        ]);
      } catch (error) {
        enqueueSnackbar('Error loading dropdown data', { variant: 'error' });
        console.error('Error in fetchData:', error);
      }
    };

    fetchData();
  }, [
    fetchSubCategories,
    FetchYarnTypeData,
    FetchCompositionData,
    FetchYarnCountData,
    // getsamplereqList,
    GetAllUsers,
    GetAllEndCustomer,
    // fetchMaterialTypes,
    fetchItems,
    fetchColorFamilies,
    fetchColors,
    fetchCustomers,
    fetchBlends,
    fetchLotNames,

    enqueueSnackbar,
  ]);

  useEffect(() => {
    getsamplereqList();
  }, [getsamplereqList]);

  useEffect(() => {
    getItemsBySample();
  }, [getItemsBySample]);

  // Auto-populate fields when item is selected (only for customer recipe)
  useEffect(() => {
    if (values?.item && currentTab === 'customer') {
      const selectedItem = values.item;

      // Set Yarn Type
      if (selectedItem.Yarn_TypeID) {
        const yarnType = YarnType.find((type) => type.Yarn_Type_ID === selectedItem.Yarn_TypeID);
        if (yarnType) {
          setValue('yarntype', yarnType);
        }
      }

      // Set Yarn Count
      if (selectedItem.YarnCountID) {
        const yarnCountItem = yarnCount.find(
          (count) => count.Yarn_Count_ID === selectedItem.YarnCountID
        );
        if (yarnCountItem) {
          setValue('yarnCount', yarnCountItem);
        }
      }

      // Set Composition
      if (selectedItem.Composition_ID) {
        const composition = allComposition.find(
          (comp) => comp.Composition_ID === selectedItem.Composition_ID
        );
        if (composition) {
          setValue('Composition', composition);
        }
      }

      // Set Color (Yarn Pantone)
      // First try to find color in current colors array
      if (selectedItem.ColorID) {
        const color = colors.find((col) => col.ColorID === selectedItem.ColorID);
        console.log(selectedItem);
        // If color not found in current colors, fetch all colors to find it
        if (!color) {
          const fetchColorById = async () => {
            try {
              const response = await Get(
                `colors/all?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
              );
              const allColorsData = response.data?.Data || [];
              setColors(allColorsData);
              const foundColor = allColorsData.find((col) => col.ColorID === selectedItem.ColorID);
              console.log('foundColor', foundColor);
              if (foundColor) {
                // Find the colorfamily for this color and set it first
                // const colorFamily = colorFamilies.find(
                //   (cf) => cf.ColorFamilyID === foundColor.ColorFamilyID
                // );
                // if (colorFamily) {
                //   setValue('colorfamily', colorFamily);
                //   // Fetch colors for this colorfamily
                //   const colorResponse = await Get(
                //     `Production/GetColors?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&ColorFamilyID=${foundColor.ColorFamilyID}`
                //   );
                //   const familyColors = colorResponse.data?.Data || [];
                //   // Update colors state so dropdown has the correct colors
                //   setColors(familyColors);
                //   const colorInFamily = familyColors.find((col) => col.ColorID === selectedItem.ColorID);
                //   if (colorInFamily) {
                setValue('goalcolor', foundColor);
                //   }
                // }
              }
            } catch (error) {
              console.error('Error fetching color:', error);
            }
          };
          fetchColorById();
        } else {
          setValue('goalcolor', color);
        }
      }

      // Set Buyer from sample request master data
      if (sampleRequestMaster?.End_CustomerID) {
        const buyer = allEndBuyers.find(
          (endBuyer) => endBuyer.End_Cust_ID === sampleRequestMaster.End_CustomerID
        );
        if (buyer) {
          setValue('buyer', buyer);
        }
      }
    }
  }, [
    values?.item,
    currentTab,
    YarnType,
    yarnCount,
    allComposition,
    colors,
    colorFamilies,
    sampleRequestMaster,
    allEndBuyers,
    setValue,
    setColors,
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
  ]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });

        setValue('recipe_pic', newFile, { shouldValidate: true }); // match `name` in RHFUploadBox
      }
    },
    [setValue]
  );
  const handleDrops = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });

        setValue('final_color_pic', newFile, { shouldValidate: true }); // match `name` in RHFUploadBox
      }
    },
    [setValue]
  );

  const handleDropsSwatchPicWithCycloYarn = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });

        setValue('swatch_pic_with_cyclo_yarn', newFile, { shouldValidate: true }); // match `name` in RHFUploadBox
      }
    },
    [setValue]
  );
  const handleDropsCustomerSwatch = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });

        setValue('customer_swatch_pic', newFile, { shouldValidate: true }); // match `name` in RHFUploadBox
      }
    },
    [setValue]
  );
  const handleDropsDataColorScoreCard = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        setValue('data_color_score_card', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const generatedStandardRecipeName = useMemo(
    () =>
      `${values?.goalcolor?.Color_and_Code || ''} - ${values?.version || ''} - ${values?.Composition?.Composition_Name || ''
      } - ${values?.yarnCount?.Yarn_Count_Name || ''}`,
    [values?.goalcolor, values?.version, values?.Composition, values?.yarnCount]
  );
  const generatedCustomerRecipeName = useMemo(
    () =>
      `${values?.sample_serial_no?.Sample_Code || ''} - ${values?.goalcolor?.Color_Code || ''} - ${values?.version || ''} - ${values?.Composition?.Composition_Name || ''
      } - ${values?.yarnCount?.Yarn_Count_Name || ''}`,
    [values?.sample_serial_no, values?.goalcolor, values?.version, values?.Composition, values?.yarnCount]
  );

  useEffect(() => {
    if (currentTab === 'standard') {
      setValue('Recipe_Name', generatedStandardRecipeName);
    } else if (currentTab === 'customer') {
      setValue('Recipe_Name', generatedCustomerRecipeName);
    }
  }, [currentTab, generatedStandardRecipeName, generatedCustomerRecipeName, setValue]);

  // Helper function to get file URL for viewing
  const getFileUrl = useCallback((file) => {
    if (!file) return null;
    if (typeof file === 'string') {
      return file; // URL string from database
    }
    if (file instanceof File) {
      return file.preview || URL.createObjectURL(file); // File object with preview
    }
    if (file.preview) {
      return file.preview; // File object with preview property
    }
    return null;
  }, []);

  // Form submission
  const onSubmit = handleSubmit(async (data) => {
    try {
      // Manual validation based on currentTab
      // if (currentTab === 'customer') {
      //   if (!data.customer) throw new Error('Customer is required for customer recipes');
      //   if (!data.buyer) throw new Error('Buyer is required for customer recipes');
      //   if (!data.LabTechnician)
      //     throw new Error('Lab Technician is required for customer recipes');
      //   if (!data.RevisionNo) throw new Error('Revision No is required for customer recipes');
      //   if (!data.RecipeCreationDate)
      //     throw new Error('Recipe Creation Date is required for customer recipes');
      // }

      // if (currentTab === 'standard' || currentTab === 'customer') {
      //   if (!data.Composition) throw new Error('Composition is required for standard recipes');
      //   if (!data.yarntype) throw new Error('Yarn type is required for standard recipes');
      //   if (!data.yarnCount) throw new Error('Yarn count is required for standard recipes');
      // }

      await RecipeSchema.validate(data, { abortEarly: false });
      const formData = new FormData();

      // Add master data fields according to new API structure
      formData.append('RecipeName', data.Recipe_Name);
      formData.append('CustomerID', data.customer?.WIC_ID || '');
      formData.append('BlendID', data.Composition?.Composition_ID || ''); // Changed from Blend to Composition
      formData.append('ApprovedSwatchColor', ''); // Empty string as specified
      formData.append('FinalGoalColorID', data.goalcolor?.ColorID || '');
      formData.append('CreatedBy', userData?.userDetails?.userId || 1);
      formData.append('Org_ID', userData?.userDetails?.orgId || 1);
      formData.append('Branch_ID', userData?.userDetails?.branchID || 1);
      formData.append('RecipeType', currentTab); // Added RecipeType
      formData.append('BuyerID', data.buyer?.End_Cust_ID || ''); // Added BuyerID
      formData.append('SampleID', data.sample_serial_no?.Sample_Request_ID || ''); // Added SampleID
      formData.append('Remarks', data.Remarks || ''); // Added Remarks
      formData.append('YarnTypeID', data.yarntype?.Yarn_Type_ID || ''); // Added YarnTypeID
      formData.append('YarnCountID', data.yarnCount?.Yarn_Count_ID || ''); // Added YarnCountID
      formData.append('CompositionID', data.Composition?.Composition_ID || ''); // Added CompositionID
      formData.append('ColorFamilyID', data.colorfamily?.ColorFamilyID || ''); // Added ColorFamilyID
      formData.append('TechUserID', data.LabTechnician?.UserId || ''); // Added TechUserID
      formData.append('RevisionNo', data.RevisionNo || 0); // Added RevisionNo
      formData.append('RecipeCreationDate', fDate(data.RecipeCreationDate, 'yyyy-MM-dd') || ''); // Added RecipeCreationDate
      formData.append('LastModifiedDate', fDate(data.LastModifiedDate, 'yyyy-MM-dd') || ''); // Added RecipeCreationTime
      formData.append('RevisionDate', fDate(data.RecipeCreationDate, 'yyyy-MM-dd') || ''); // Added RevisionDate
      formData.append('DetailCount', data.recipeItems?.length || 0);

      // Add master images if they exist
      if (data.recipe_pic) {
        const recipeFile = data.recipe_pic instanceof File ? data.recipe_pic : data.recipe_pic.file;
        formData.append('RecipePicture', recipeFile);
      }

      if (data.swatch_pic_with_cyclo_yarn) {
        const finalColorFile = // iska issue h
          data.swatch_pic_with_cyclo_yarn instanceof File
            ? data.swatch_pic_with_cyclo_yarn
            : data.swatch_pic_with_cyclo_yarn.file;
        formData.append('SwatchColorPicture', finalColorFile);
      }

      if (data.customer_swatch_pic) {
        const customerSwatchFile =
          data.customer_swatch_pic instanceof File
            ? data.customer_swatch_pic
            : data.customer_swatch_pic.file;
        formData.append('CustomerSwatchPicture', customerSwatchFile);
      }

      // if (data.swatch_pic_with_cyclo_yarn) {
      //   const swatchWithYarnFile =
      //     data.swatch_pic_with_cyclo_yarn instanceof File
      //       ? data.swatch_pic_with_cyclo_yarn
      //       : data.swatch_pic_with_cyclo_yarn.file;
      //   formData.append('SwatchWithCycloYarnPicture', swatchWithYarnFile);
      // }

      if (data.data_color_score_card) {
        const dataColorFile =
          data.data_color_score_card instanceof File
            ? data.data_color_score_card
            : data.data_color_score_card.file;
        formData.append('DataColorScoreCard', dataColorFile);
      }

      // Add details array with new field structure
      data.recipeItems.forEach((item, index) => {
        formData.append(`Details[${index}][InvTypeID]`, 1); // Hardcoded as 1
        formData.append(`Details[${index}][CategoryID]`, item.category?.Inv_Cat_ID || ''); // Assuming category has Cat_ID
        formData.append(`Details[${index}][SubCategoryID]`, item.subCategory?.SubCat_ID || '');
        formData.append(`Details[${index}][MaterialTypeID]`, item?.invSpecs?.InvSpecID || 0); // SpecID as 0
        formData.append(`Details[${index}][ColorFamilyID]`, 0); // Hardcoded as 0
        formData.append(`Details[${index}][ColorID]`, item.color?.ColorID || '');
        formData.append(`Details[${index}][DataColor]`, item.remarks || ''); // Using remarks as DataColor
        formData.append(`Details[${index}][HexCode]`, item.hex || '');
        formData.append(`Details[${index}][ItemID]`, item.item?.ItemID || '');
        formData.append(`Details[${index}][RequiredPercentage]`, item.percentage || 0);
        formData.append(`Details[${index}][RmLotNo]`, item.lotName?.LotName || 0);

        // Add detail image if it exists
        if (item.colorPicture?.file) {
          formData.append(`Details[${index}][ColorPicture]`, item.colorPicture.file);
        }
      });
      console.log('formData', formData);

      // Submit the form data
      const response = await Post('Production/SaveRecipe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        enqueueSnackbar('Recipe saved successfully', { variant: 'success' });
        // reset();
        // navigate(paths.dashboard.rdLab.recipe.root);
      } else {
        enqueueSnackbar('Error saving recipe', { variant: 'error' });
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        error.inner.forEach((validationError) => {
          enqueueSnackbar(validationError.message, {
            variant: 'error',
            autoHideDuration: 5000,
          });
        });
      } else {
        console.log('error', error);
        enqueueSnackbar(error?.response?.data?.Message || 'Error submitting form', {
          variant: 'error',
          autoHideDuration: 5000,
        });
      }
    }
  });

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Recipe Information */}
        <Grid xs={12} md={12}>
          <Tabs value={currentTab} onChange={handleChangeTab}>
            {TABS.slice(0, 3).map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: tab.value === 'standard' ? '#4CAF50' : '#fcba03',
                      }}
                    />
                    {tab.label}
                  </Box>
                }
              />
            ))}
          </Tabs>
          <Card sx={{ p: 3, mt: 2 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                // md: 'repeat(2, 1fr)',
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

              <RHFTextField name="Recipe_Name" label="Recipe Name" disabled />
              <RHFTextField name="version" label="Version" disabled />

              {currentTab === 'customer' && (
                <>
                  <RHFAutocomplete
                    name="customer"
                    label="Customer"
                    options={customers}
                    getOptionLabel={(option) => option.WIC_Name}
                    isOptionEqualToValue={(option, value) => option.WIC_ID === value.WIC_ID}
                    value={values?.customer || null}
                  />
                  <RHFAutocomplete
                    name="buyer"
                    label="Buyer"
                    options={allEndBuyers}
                    getOptionLabel={(option) => option?.End_Cust_Name}
                    value={values?.buyer || null}
                  />
                  <RHFAutocomplete
                    name="sample_serial_no"
                    label="Sample Serial No."
                    options={allSamples}
                    getOptionLabel={(option) => option?.Sample_Code}
                    isOptionEqualToValue={(option, value) =>
                      option?.Sample_Request_ID === value?.Sample_Request_ID
                    }
                    value={values?.sample_serial_no || null}
                  />

                  <RHFAutocomplete
                    name="item"
                    label="Item"
                    options={itemsbySample}
                    getOptionLabel={(option) => option?.Product_Composed_Name || ''}
                    isOptionEqualToValue={(option, value) =>
                      option?.Sample_Req_Dtl_ID === value?.Sample_Req_Dtl_ID
                    }
                    value={values?.item || null}
                  />

                  <RHFAutocomplete
                    name="LabTechnician"
                    label="Lab Technician / Creator"
                    options={allUsers}
                    getOptionLabel={(option) => option?.UserName || ''}
                    isOptionEqualToValue={(option, value) => option?.UserId === value?.UserId}
                    value={values?.LabTechnician || null}
                  />
                </>
              )}
              {/* <RHFAutocomplete
                name="blendType"
                label="Blend Type"
                options={blendsType}
                getOptionLabel={(option) => option.Blend_Type_Name}
                isOptionEqualToValue={(option, value) =>
                  option.Blend_Type_ID === value.Blend_Type_ID
                }
              /> */}
              <Controller
                name="RecipeCreationDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Recipe Creation Date"
                    format="dd MMM yyyy"
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
              {/* <Controller
                name="LastModifiedDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DesktopDatePicker
                    {...field}
                    label="Last Modified Date"
                    format="dd MMM yyyy"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              /> */}

              <RHFAutocomplete
                name="yarntype"
                label="Yarn Type"
                options={YarnType}
                getOptionLabel={(option) => option.Yarn_Type}
                isOptionEqualToValue={(option, value) => option.Yarn_Type_ID === value.Yarn_Type_ID}
                value={values.yarntype || null}
              />
              <RHFAutocomplete
                name="yarnCount"
                label="Yarn Count"
                options={yarnCount}
                value={values.yarnCount || null}
                getOptionLabel={(option) => option?.Yarn_Count_Name || ''}
                isOptionEqualToValue={(option, value) =>
                  option.Yarn_Count_ID === value.Yarn_Count_ID
                }
              />
              <RHFAutocomplete
                name="Composition"
                label="Composition"
                options={allComposition}
                getOptionLabel={(option) => option.Composition_Name}
                isOptionEqualToValue={(option, value) =>
                  option.Composition_ID === value.Composition_ID
                }
                value={values.Composition || null}
              />

              {/* <RHFTextField name="swatch_color" label="Swatch Color" />/ */}

              {currentTab === 'standard' && (
                <RHFAutocomplete
                  name="colorfamily"
                  label="Color Family"
                  options={colorFamilies}
                  getOptionLabel={(option) => option.ColorFamilyName}
                  isOptionEqualToValue={(option, value) =>
                    option.ColorFamilyID === value.ColorFamilyID
                  }
                />
              )}

              <RHFAutocomplete
                name="goalcolor"
                label={currentTab === 'customer' ? 'Yarn Color Pantone [TCX]' : 'Color Name & Code'}
                options={colors}
                getOptionLabel={(option) => option?.Color_and_Code || option?.ColorNameandCode}
                isOptionEqualToValue={(option, value) => option.ColorID === value.ColorID}
                value={values?.goalcolor || null}
              />

              {/* 
                  <RHFAutocomplete
                      name='LotName'
                      label='Lot No'
                      options={lotNames}
                      getOptionLabel={(option) => option?.LotName}
                      isOptionEqualToValue={(option, value) => option?.LotName === value?.LotName}
                      value={values?.LotName || null}
                    /> */}

              {currentTab === 'customer' && (
                <RHFTextField
                  name="Remarks"
                  label="Remarks"
                  sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
                />
              )}

              <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
                <Box
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                    md: currentTab === 'customer' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
                    // md: 'repeat(2, 1fr)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                      mt: 2,
                      // border: '1px dotted #ccc',
                      // borderRadius: 1.5,
                    }}
                  >
                    <Tooltip title="Upload Recipe Picture">
                      <Box>
                        <RHFUploadBox
                          name="recipe_pic"
                          accept={{
                            'image/*': ['.jpg', '.png', '.jpeg'],
                            'application/pdf': ['.pdf'],
                          }}
                          onDrop={handleDrop}
                        />
                      </Box>
                    </Tooltip>
                    <Stack>
                      <Box>
                        <Typography>CYCLO Recipe Card</Typography>
                      </Box>
                      {values?.recipe_pic ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {values?.recipe_pic?.name?.toLowerCase().endsWith('.pdf') && (
                            <Iconify icon="mdi:file-pdf-box" width={20} color="error.main" />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              maxWidth: '100px',
                            }}
                          >
                            {values?.recipe_pic?.name}
                          </Typography>
                          {getFileUrl(values?.recipe_pic) && (
                            <Link
                              href={getFileUrl(values?.recipe_pic)}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ display: 'flex', alignItems: 'center' }}
                            >
                              <Tooltip title="View">
                                <IconButton size="small">
                                  <Iconify icon="eva:eye-fill" width={18} />
                                </IconButton>
                              </Tooltip>
                            </Link>
                          )}
                          <Tooltip title="Delete">
                            <IconButton onClick={() => setValue('recipe_pic', null)}>
                              <Iconify icon="eva:close-fill" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          -
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                  {currentTab === 'customer' && (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'center',
                        mt: 2,
                        // border: '1px dotted #ccc',
                        // borderRadius: 1.5,
                      }}
                    >
                      <Tooltip title="Customer Swatch Picture">
                        <Box>
                          <RHFUploadBox
                            name="customer_swatch_pic"
                            accept={{
                              'image/*': ['.jpg', '.png', '.jpeg'],
                              'application/pdf': ['.pdf'],
                            }}
                            onDrop={handleDropsCustomerSwatch}
                          />
                        </Box>
                      </Tooltip>
                      <Stack>
                        <Box>
                          <Typography>Customer Swatch Picture</Typography>
                        </Box>
                        {values?.customer_swatch_pic ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {values?.customer_swatch_pic?.name?.toLowerCase().endsWith('.pdf') && (
                              <Iconify icon="mdi:file-pdf-box" width={20} color="error.main" />
                            )}
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                maxWidth: '100px',
                              }}
                            >
                              {values?.customer_swatch_pic?.name}
                            </Typography>
                            {getFileUrl(values?.customer_swatch_pic) && (
                              <Link
                                href={getFileUrl(values?.customer_swatch_pic)}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                <Tooltip title="View">
                                  <IconButton size="small">
                                    <Iconify icon="eva:eye-fill" width={18} />
                                  </IconButton>
                                </Tooltip>
                              </Link>
                            )}
                            <Tooltip title="Delete">
                              <IconButton onClick={() => setValue('customer_swatch_pic', null)}>
                                <Iconify icon="eva:close-fill" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            -
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  )}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                      mt: 2,
                      // border: '1px dotted #ccc',
                      // borderRadius: 1.5,
                    }}
                  >
                    <Tooltip title="Swatch Picture With CYCLO Yarn">
                      <Box>
                        <RHFUploadBox
                          name="swatch_pic_with_cyclo_yarn"
                          accept={{
                            'image/*': ['.jpg', '.png', '.jpeg'],
                            'application/pdf': ['.pdf'],
                          }}
                          onDrop={handleDropsSwatchPicWithCycloYarn}
                        />
                      </Box>
                    </Tooltip>
                    <Stack>
                      <Box>
                        <Typography>Swatch Picture With CYCLO Yarn</Typography>
                      </Box>
                      {values?.swatch_pic_with_cyclo_yarn ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {values?.swatch_pic_with_cyclo_yarn?.name
                            ?.toLowerCase()
                            .endsWith('.pdf') && (
                              <Iconify icon="mdi:file-pdf-box" width={20} color="error.main" />
                            )}
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              maxWidth: '100px',
                            }}
                          >
                            {values?.swatch_pic_with_cyclo_yarn?.name}
                          </Typography>
                          {getFileUrl(values?.swatch_pic_with_cyclo_yarn) && (
                            <Link
                              href={getFileUrl(values?.swatch_pic_with_cyclo_yarn)}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ display: 'flex', alignItems: 'center' }}
                            >
                              <Tooltip title="View">
                                <IconButton size="small">
                                  <Iconify icon="eva:eye-fill" width={18} />
                                </IconButton>
                              </Tooltip>
                            </Link>
                          )}
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => setValue('swatch_pic_with_cyclo_yarn', null)}
                            >
                              <Iconify icon="eva:close-fill" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          -
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                      mt: 2,
                      // border: '1px dotted #ccc',
                      // borderRadius: 1.5,
                    }}
                  >
                    <Tooltip title="Data Color Score Card ">
                      <Box>
                        <RHFUploadBox
                          name="data_color_score_card"
                          accept={{
                            'image/*': ['.jpg', '.png', '.jpeg'],
                            'application/pdf': ['.pdf'],
                          }}
                          onDrop={handleDropsDataColorScoreCard}
                        />
                      </Box>
                    </Tooltip>
                    <Stack>
                      <Box>
                        <Typography>Data Color Score Card [PDF]</Typography>
                      </Box>
                      {values?.data_color_score_card ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {values?.data_color_score_card?.name?.toLowerCase().endsWith('.pdf') && (
                            <Iconify icon="mdi:file-pdf-box" width={20} color="error.main" />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              maxWidth: '100px',
                            }}
                          >
                            {values?.data_color_score_card?.name}
                          </Typography>
                          {getFileUrl(values?.data_color_score_card) && (
                            <Link
                              href={getFileUrl(values?.data_color_score_card)}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ display: 'flex', alignItems: 'center' }}
                            >
                              <Tooltip title="View">
                                <IconButton size="small">
                                  <Iconify icon="eva:eye-fill" width={18} />
                                </IconButton>
                              </Tooltip>
                            </Link>
                          )}
                          <Tooltip title="Delete">
                            <IconButton onClick={() => setValue('data_color_score_card', null)}>
                              <Iconify icon="eva:close-fill" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          -
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Recipe Items */}
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
              <Typography
                variant="h6"
                sx={{
                  p: 2,
                  my: 0.5,
                  borderBottom: '1px solid #e0e0e0',
                  width: 1,
                  gridColumn: {
                    xs: 'span 1',
                    sm: 'span 2',
                    md: 'span 3',
                  },
                }}
              >
                Recipe Color Components
              </Typography>
            </Box>

            <RecipeItemsTable
              watch={watch}
              control={control}
              setValue={setValue}
              formValues={values}
              errors={errors}
              trigger={trigger}
              lotNames={lotNames}
            />
            {/* </Box> */}
            {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" color="primary" onClick={handleAddRecipeItem}>
                Add Component
              </Button>
            </Box> */}
          </Card>
        </Grid>

        {/* Submit Button */}
        <Grid xs={12} md={12}>
          <Stack spacing={3} alignItems="flex-end">
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              Save Recipe
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
