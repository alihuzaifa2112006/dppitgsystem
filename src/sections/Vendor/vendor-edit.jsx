import * as Yup from 'yup';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TableBody from '@mui/material/TableBody';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import { Autocomplete, Button, InputAdornment, Table, TextField, Typography } from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
} from 'src/components/table';

import { Get, Post, Put } from 'src/api/apibasemethods';
import { decrypt, encrypt } from 'src/api/encryption';
import DetailTableRow from './detail-table-row';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { grid } from '@mui/system';
import PropTypes from 'prop-types';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import { Source } from 'react-map-gl';
// import { cu } from 'dist/assets/index-0Aa_z_Pv';

// ----------------------------------------------------------------------

export default function ProductEditForm({ currentProduct }) {
  console.log('currentProduct in form', currentProduct);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Date In SQL format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const decryptObjectKeys = (data) => {
    const decryptedData = data.map((item) => {
      const decryptedItem = {};
      Object.keys(item).forEach((key) => {
        decryptedItem[key] = decrypt(item[key]);
      });
      return decryptedItem;
    });
    return decryptedData;
  };

  const [vendorType, setvendorType] = useState([]);
  const [subvendorType, setSubvendorType] = useState([]);
  const [allSources, setAllSources] = useState([]);
  const [allOrigins, setAllOrigins] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [isLoading, setLoading] = useState(true);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------
  const KGtoLbs = (kg) => {
    console.log('kg', kg);
    return kg * 2.20462;
  };
  const NewVendorSchema = Yup.object().shape({
    InvType: Yup.object().required('Item Type is required'),
    VendorType: Yup.object().required('Vendor Type is required'),
    vendorName: Yup.string().required('Vendor Name is required'),
    shortName: Yup.string().required('Short Name is required'),
    contactPerson: Yup.string().required('Contact Person is required'),
    adress: Yup.string().required('Office Address is required'),
    factoryAddress: Yup.string().required('Factory Address is required'),
    location: Yup.string().required('Geo Location is required'),
    // .matches(/^-?\d{1,3}\.\d+,-?\d{1,3}\.\d+$/, 'Invalid geo location format (should be "latitude,longitude")'),
    phoneNo: Yup.string()
      .required('Phone Number is required')
      .matches(/^\+?[\d\s-]+$/, 'Invalid phone number format'),
    email: Yup.string().required('Email is required').email('Invalid email address'),
    Source: Yup.object().nullable().required('Source is required'),
    Origin: Yup.object().nullable().required('Origin is required'),
    // vendorNo: Yup.string().required('Vendor Number is required'),
  });
  const defaultValues = useMemo(
    () => ({
      InvType: inventory.find((type) => type.ClassID === currentProduct?.InventoryTypeID) || null,
      VendorType:
        vendorType.find((type) => type.VendorTypeID === currentProduct?.VendorTypeID) || null,
      vendorName: currentProduct?.VendorName || '',
      shortName: currentProduct?.ShortName || '',
      contactPerson: currentProduct?.ContactPerson || '',
      adress: currentProduct?.OfficeAddress || '',
      factoryAddress: currentProduct?.FactoryAddress || '',
      location: currentProduct?.GeoLocation || '',
      phoneNo: currentProduct?.PhoneNo || '',
      email: currentProduct?.Email || '',

      Source: allSources.find((source) => source.SourceID === currentProduct?.SourceID) || null,
      // Origin: allOrigins.find((origin) => origin.Origin_ID === currentProduct?.OriginID) || null,

      // vendorNo: currentProduct?.VendorNo || '',
    }),
    [currentProduct, inventory, vendorType, allSources]
  );
  const methods = useForm({
    resolver: yupResolver(NewVendorSchema),
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
  useEffect(() => {
    if (!isLoading) {
      methods.reset(defaultValues);
    }
  }, [isLoading, defaultValues, methods]);
  console.log('defaultValues', defaultValues);

  useEffect(() => {
    if (values?.Source && allOrigins.length > 0 && currentProduct?.Origin_ID) {
      setValue(
        'Origin',
        allOrigins.find((origin) => origin.Origin_ID === currentProduct?.Origin_ID) || null
      );
    }
  }, [values?.Source, allOrigins, currentProduct, setValue]);

  // const generateProductName = () => {
  //   const productCode = `${values?.Yarn_Type_ID?.Yarn_Code || ''} - ${values?.YarnCountID?.Yarn_Count_Name || ''
  //     } -  ${values?.Composition_ID?.Composition_Name || ''}  (${values?.Color_ID?.ColorName || ''
  //     })`;
  //   return productCode;
  // };

  // ------------------------------------
  useEffect(() => {
    const FetchAllSources = async () => {
      try {
        const response = await Get(
          `GetAllSources?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        // console.log('Sources:', response.data);
        setAllSources(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    FetchAllSources();
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const selectedSource = watch('Source');

  // 3. Fetch origins when source changes
  const fetchOrigin = useCallback(async () => {
    if (selectedSource?.SourceID) {
      try {
        const response = await Get(
          `GetOriginsBySourceID?sourceID=${selectedSource.SourceID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setAllOrigins(response.data || []);
      } catch (error) {
        console.error(error);
        setAllOrigins([]);
      }
    } else {
      setAllOrigins([]);
    }
  }, [selectedSource?.SourceID, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    if (selectedSource?.SourceID) fetchOrigin();
  }, [fetchOrigin, selectedSource?.SourceID]);

  const ApiGetVendorType = useCallback(async () => {
    try {
      const response = await Get(
        `getallvendortypes?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setvendorType(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const ApiGetInventoryType = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllClasses?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setInventory(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([ApiGetVendorType(), ApiGetInventoryType()]);
      setLoading(false);
    };
    fetchData();
  }, [ApiGetVendorType, ApiGetInventoryType]);

  // --------------------------------
  const [dialogValue, setDialogValue] = useState('');
  const [typesData, setTypesData] = useState({});
  const [storageData, setstorageData] = useState({});
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setDialogValue('');
    setOpen(false);
  };

  const PostOrigin = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Payment Term', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (allOrigins.find((option) => option.Origin_Name.trim().toLowerCase() === newOptionTrimmed)) {
      enqueueSnackbar('This Origin already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        Origin_Name: newOption,
        SourceID: values?.Source?.SourceID,
        Is_Active: true,
        Created_By: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddOrigin', dataToSend);
      fetchOrigin();
      enqueueSnackbar('Origin Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const PostVendor = async (vendor) => {
    if (!vendor) return;

    const newOptionTrimmed = vendor.trim().toLowerCase();

    if (
      subvendorType.find((option) => option.VendorType.trim().toLowerCase() === newOptionTrimmed)
    ) {
      enqueueSnackbar('Vendor Type  Exists', { variant: 'error' });
      return;
    }

    const dataToSend = {
      VendorType: vendor,
      CreatedBy: userData?.userDetails?.userId,
      Branch_ID: userData?.userDetails?.branchID,
      Org_ID: userData?.userDetails?.orgId,
    };

    try {
      await Post('AddVendorType', dataToSend);
      const updatedBlendList = await ApiGetVendorType();
      const newlyAdded = updatedBlendList.find(
        (b) => b.VendorType.trim().toLowerCase() === newOptionTrimmed
      );

      if (newlyAdded) {
        setTypesData((prev) => ({
          ...prev,
          dropData: newlyAdded,
        }));
      }

      enqueueSnackbar('Vendor Type  Added Successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error adding Vendor Type :', error);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    // console.log(data);
    const dataToSend = {
      InventoryTypeID: data?.InvType?.ClassID, // Assuming InvType has ClassID
      VendorTypeID: data?.VendorType?.VendorTypeID,
      VendorName: data?.vendorName,
      ShortName: data?.shortName,
      ContactPerson: data?.contactPerson,
      OfficeAddress: data?.adress,
      FactoryAddress: data?.factoryAddress,
      GeoLocation: data?.location,
      PhoneNo: data?.phoneNo,
      Email: data?.email,
      SourceID: data?.Source?.SourceID || 0,
      Origin_ID: data?.Origin?.Origin_ID || 0,
      // VendorNo: data?.vendorNo,

      CreatedBy: userData?.userDetails?.userId,
      Org_ID: userData?.userDetails?.orgId,
      Branch_ID: userData?.userDetails?.branchID,
    };
    console.log('dataToSend', dataToSend);

    try {
      const res = await Put(`updatevendor/${currentProduct?.VendorID}`, dataToSend); // Changed endpoint to 'AddVendor'
      if (res.status === 201 || res.status === 200) {
        enqueueSnackbar('Vendor Updated Successfully', { variant: 'success' });
        router.push(paths.dashboard.admin.vendor.root); // Adjust the path as needed
      } else {
        enqueueSnackbar('Vendor Update Failed', { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar('Something went wrong', { variant: 'error' });
      console.error(error);
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
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <h3>Add Raw Material</h3>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  // md: 'repeat(3, 1fr)',
                }}
              >
                <RHFAutocomplete
                  name="InvType"
                  label="Item Type"
                  placeholder="Choose an option"
                  fullWidth
                  options={inventory || ''}
                  getOptionLabel={(option) => option?.ClassName || null}
                  value={values?.InvType || null}
                />

                <AutocompleteWithAdd
                  name="VendorType"
                  label="Vendor Type"
                  fullWidth
                  options={vendorType || ''}
                  getOptionLabel={(option) => option?.VendorType || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.VendorTypeID === value?.VendorTypeID
                  }
                  onAdd={PostVendor}
                  value={values?.VendorType || null}
                />

                <RHFTextField InputProps={{ shrink: true }} name="vendorName" label="Vendor Name" />
                <RHFAutocomplete
                  name="Source"
                  label="Source"
                  placeholder="Choose an option"
                  fullWidth
                  options={allSources}
                  getOptionLabel={(option) => option?.SourceName || ''}
                  isOptionEqualToValue={(option, value) => option?.SourceID === value?.SourceID}
                  value={values?.Source || null}
                />

                <AutocompleteWithAdd
                  name="Origin"
                  label="Origin"
                  placeholder="Choose an option"
                  fullWidth
                  options={allOrigins}
                  getOptionLabel={(option) => option?.Origin_Name || ''}
                  isOptionEqualToValue={(option, value) => option?.Origin_ID === value?.Origin_ID}
                  isAddDisabled={values?.Source?.SourceID === 1}
                  // value={allOrigins.find(x => x.Origin_ID === values?.Origin?.Origin_ID) || null}
                  value={values?.Origin || null}
                  onAdd={PostOrigin}
                />
                <RHFTextField InputProps={{ shrink: true }} name="shortName" label="Short Name" />
                <RHFTextField
                  InputProps={{ shrink: true }}
                  name="contactPerson"
                  label="Contact Person"
                />
                <RHFTextField InputProps={{ shrink: true }} name="adress" label="Office Address" />
                <RHFTextField
                  InputProps={{ shrink: true }}
                  name="factoryAddress"
                  label="Factory Address"
                />
                <RHFTextField InputProps={{ shrink: true }} name="location" label="Geo Location" />
                <RHFTextField InputProps={{ shrink: true }} name="phoneNo" label="Phone NO." />
                <RHFTextField InputProps={{ shrink: true }} name="email" label="Email" />
                {/* <RHFTextField InputProps={{ shrink: true }} name="vendorNo" label="Vendor NO." /> */}
              </Box>
            </Card>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
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
    </>
  );
}
ProductEditForm.propTypes = {
  currentProduct: PropTypes.object,
};
