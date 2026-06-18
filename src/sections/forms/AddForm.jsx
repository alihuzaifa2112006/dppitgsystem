import * as Yup from 'yup';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box, Card, Stack, Button, Grid, Typography,
  IconButton, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { Get, Post } from 'src/api/apibasemethods';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import LoadingButton from '@mui/lab/LoadingButton';

export default function AddForm() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('UserData'));

  const [Category, setCategory] = useState([]);
  const [subCategory, setsubCategory] = useState([]);
  const [fields, setFields] = useState([]);
  const [formAttributes, setFormAttributes] = useState([]);
  const [currentAttribute, setCurrentAttribute] = useState({
    Display_Name: '',
    Field_ID: null,
    dropdownValues: []
  });
  const [dropdownValues, setDropdownValues] = useState([{ value: '' }]);

  // Form validation schema
  const FormSchema = Yup.object().shape({
    form: Yup.string().required('Form name is required'),
    Category: Yup.object().required('Category is required'),
    subCategory: Yup.object().required('Sub category is required'),
    desc: Yup.string().required('Description is required'),
  });

  // Fetch data functions
  const GetCategory = useCallback(async () => {
    const res = await Get(
      `GetAllinvcategory?branchID=${userData?.userDetails?.branchID}&orgID=${userData?.userDetails?.orgId}`
    );
    setCategory(res.data || []);
  },[userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

  const GetSubCategory = useCallback(async () => {
    const res = await Get(
      `inventory/subcategory/getall?branchID=${userData?.userDetails?.branchID}&orgID=${userData?.userDetails?.orgId}`
    );
    setsubCategory(res.data.Data || []);
  },[userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

  const GetFields = useCallback(async () => {
    const res = await Get(
      `GetAllFieldNames?branchID=${userData?.userDetails?.branchID}&orgID=${userData?.userDetails?.orgId}`
    );
    setFields(res.data.Data || []);
  }, [userData?.userDetails?.branchID,userData?.userDetails?.orgId]);

  useEffect(() => {
    GetCategory();
    GetSubCategory();
    GetFields();
  }, [GetCategory, GetSubCategory, GetFields]);

  const methods = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues: {
      form: '',
      Category: null,
      subCategory: null,
      desc: '',
      Branch_ID: userData?.userDetails?.branchID || 1,
      Org_ID: userData?.userDetails?.orgId || 1,
    }
  });

  const {
    setValue,
    handleSubmit,
    watch,
    control,
    formState: { isSubmitting },
  } = methods;

  const values = watch();
  const selectedFieldType = useWatch({ control, name: 'Field_ID' });

  // Handle adding a new form attribute
  const handleAddAttribute = () => {
    if (!currentAttribute.Display_Name || !currentAttribute.Field_ID) {
      enqueueSnackbar('Display Name and Field Type are required', { variant: 'error' });
      return;
    }

    const newAttribute = {
      ...currentAttribute,
      dropdownValues: currentAttribute.Field_ID?.Field_Type === 'Dropdown' ?
        dropdownValues.filter(v => v.value.trim() !== '') : []
    };

    setFormAttributes([...formAttributes, newAttribute]);
    setCurrentAttribute({
      Display_Name: '',
      Field_ID: null,
      dropdownValues: []
    });
    setDropdownValues([{ value: '' }]);
  };

  // Handle removing a form attribute
  const handleRemoveAttribute = (index) => {
    const updatedAttributes = [...formAttributes];
    updatedAttributes.splice(index, 1);
    setFormAttributes(updatedAttributes);
  };

  // Handle dropdown value changes
  const handleAddDropdownValue = () => {
    setDropdownValues([...dropdownValues, { value: '' }]);
  };

  const handleRemoveDropdownValue = (index) => {
    const newValues = [...dropdownValues];
    newValues.splice(index, 1);
    setDropdownValues(newValues);
  };

  const handleDropdownValueChange = (index, value) => {
    const newValues = [...dropdownValues];
    newValues[index].value = value;
    setDropdownValues(newValues);
  };

  // Reset dropdown values when field type changes
  useEffect(() => {
    if (currentAttribute.Field_ID?.Field_Type === 'Dropdown') {
      setDropdownValues([{ value: '' }]);
    } else {
      setDropdownValues([]);
    }
  }, [currentAttribute.Field_ID]);

  // Form submission
  const onSubmit = handleSubmit(async (data) => {
    try {
      // 1. Create form master record
      const masterPayload = {
        FormName: data.form,
        Description: data.desc,
        Inv_Cat_ID: data.Category?.Inv_Cat_ID,
        SubCat_ID: data.subCategory?.SubCat_ID,
        Org_Id: userData?.userDetails?.orgId,
        Branch_Id: userData?.userDetails?.branchID,
        Created_By: userData?.userDetails?.userId,
        Is_Active: true,
        Is_Cancelled: false,
        Cancel_By: null,
        Cancel_On: null
      };

      const masterResponse = await Post('AddInvForm', masterPayload);
      const formId = masterResponse.data.FormID;

      // 2. Save form attributes
      const detailsPayload = formAttributes.map((attr) => ({
        FormID: formId, // From master response
        Field_ID: attr.Field_ID.Field_ID,
        Display_Name: attr.Display_Name,
        DropdownValues: attr.Field_ID.Field_Type === 'Dropdown' ?
          attr.dropdownValues.map(v => v.value) : [],
        Org_Id: userData?.userDetails?.orgId,
        Branch_Id: userData?.userDetails?.branchID,
        Created_By: userData?.userDetails?.userId,
        Is_Active: true,
        Is_Cancelled: false,
        IsDeleted: false
      }));

      await Post('SaveFormAttributes', detailsPayload);

      enqueueSnackbar('Form created successfully!', { variant: 'success' });
      navigate(paths.dashboard.admin.forms.root);
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to create form', { variant: 'error' });
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {/* Form Information */}
        <Grid xs={12} md={12} mb={3}>
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
              <Typography variant="h6" sx={{ gridColumn: 'span 3' }}>
                Form Details
              </Typography>
              <RHFTextField name="form" label="Form Name" />
              <RHFAutocomplete
                name="Category"
                label="Category"
                options={Category}
                getOptionLabel={(option) => option?.Inv_Cat_Name}
              />
              <RHFAutocomplete
                name="subCategory"
                label="Sub Category"
                options={subCategory}
                getOptionLabel={(option) => option?.SubCat_Name}
              />
              <RHFTextField
                name="desc"
                label="Description"
                multiline
                rows={3}
                sx={{ gridColumn: 'span 3' }}
              />
            </Box>
          </Card>
        </Grid>

        {/* Form Attributes */}
        <Grid xs={12} md={12} >
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add Form Attributes
            </Typography>

            <Box mb={3}>
              <Box display="grid" gridTemplateColumns={{ xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" }} gap={3}>
                <TextField
                  label="Display Name"
                  value={currentAttribute.Display_Name}
                  onChange={(e) => setCurrentAttribute({
                    ...currentAttribute,
                    Display_Name: e.target.value
                  })}
                  fullWidth
                />

                <RHFAutocomplete
                  name="Field_ID"
                  label="Field Type"
                  options={fields}
                  getOptionLabel={(option) => option?.Field_Type}
                  value={currentAttribute.Field_ID}
                  onChange={(_, newValue) => setCurrentAttribute({
                    ...currentAttribute,
                    Field_ID: newValue
                  })}
                  isOptionEqualToValue={(option, value) => option.Field_ID === value.Field_ID}
                />
              </Box>


              <Box display="grid" gridTemplateColumns={{ xs: "repeat(1, 1fr)", sm: "repeat(2, 1fr)" }} gap={3} my={3}>
                {currentAttribute.Field_ID?.Field_Type === 'Dropdown' && (
                  <>
                    <Box sx={{
                      gridColumn: {
                        xs: 'span 1',
                        sm: 'span 2',
                        // md: 'span 3',
                      },
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                        <Typography variant="subtitle1" gutterBottom>
                          Dropdown Values
                        </Typography>

                        <Button
                          variant="outlined"
                          onClick={handleAddDropdownValue}
                          color="primary"
                          startIcon={<Iconify icon="eva:plus-fill" />}
                        >
                          Add Dropdown Value
                        </Button>
                      </Box>
                    </Box>
                    {dropdownValues.map((item, index) => (
                      <Box key={index} display="flex" gap={2} mb={2}>
                        <TextField
                          fullWidth
                          value={item.value}
                          onChange={(e) => handleDropdownValueChange(index, e.target.value)}
                          label={`Value ${index + 1}`}
                        />
                        <IconButton onClick={() => handleRemoveDropdownValue(index)}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </Box>
                    ))}

                  </>
                )}
              </Box>

              <Stack spacing={3} alignItems="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddAttribute}
                  startIcon={<Iconify icon="eva:plus-fill" />}

                >
                  Add Attribute
                </Button>
              </Stack>
            </Box>

            {/* Dropdown Values Section */}

            {/* Attributes Table */}
            {formAttributes.length > 0 && (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Display Name</TableCell>
                      <TableCell>Field Type</TableCell>
                      <TableCell>Values</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formAttributes.map((attr, index) => (
                      <TableRow key={index}>
                        <TableCell>{attr.Display_Name}</TableCell>
                        <TableCell>{attr.Field_ID?.Field_Type}</TableCell>
                        <TableCell>
                          {attr.Field_ID?.Field_Type === 'Dropdown' && attr.dropdownValues.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {attr.dropdownValues.map((val, i) => (
                                <Chip key={i} label={val.value} size="small" />
                              ))}
                            </Box>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleRemoveAttribute(index)}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>

        {/* Submit Button */}
        <Grid xs={12} md={12}>
          <Stack spacing={3} alignItems="flex-end">
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
              disabled={formAttributes.length === 0}
            >
              Save
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider >
  );
}