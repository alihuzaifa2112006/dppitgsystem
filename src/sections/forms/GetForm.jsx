import * as Yup from 'yup';
import { useState, useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DesktopDatePicker } from '@mui/x-date-pickers';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { Get, Post } from 'src/api/apibasemethods';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import PropTypes from 'prop-types';

export default function DynamicFormRenderer({currentData}) {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('UserData'));

    const [availableForms, setAvailableForms] = useState([]);
    const [selectedForm, setSelectedForm] = useState(currentData||null);
    const [isLoading, setIsLoading] = useState(false);

    // Create dynamic validation schema
    const validationSchema = useMemo(() => {
        const schema = {};

        if (currentData?.Fields) {
            currentData.Fields.forEach((field) => {
                const fieldName = `field_${field.FormAttID}`; // Using FormAttID for uniqueness

                if (field.Is_Required) {
                    schema[fieldName] = Yup.string()
                        .required(`${field.Custom_Display_Name || field.Display_Name} is required`);
                }
            });
        }

        return Yup.object().shape(schema);
    }, [currentData]);

    const methods = useForm({
        resolver: yupResolver(validationSchema),
    });

    const {
        handleSubmit,
        control,
        reset,
        formState: { isSubmitting },
    } = methods;

    // Fetch available forms
    useEffect(() => {
        const fetchForms = async () => {
            try {
                const response = await Get('GetAllFormNames');
                if (response.data?.Success) {
                    setAvailableForms(response.data.Data || []);
                }
            } catch (error) {
                enqueueSnackbar('Failed to load forms', { variant: 'error' });
                console.error('Error fetching forms:', error);
            }
        };

        fetchForms();
    }, [enqueueSnackbar]);

    // Load form details
    const loadFormDetails = async (formId) => {
        setIsLoading(true);
        try {
            const response = await Get(`GetByFormDetailsID/${formId}?branchID=${userData?.userDetails?.branchID}&orgID=${userData?.userDetails?.orgId}`);
            if (response.data?.Success) {
                setSelectedForm(response.data.Data);
                // Initialize form values
                const defaultValues = {};
                response.data.Data.Fields.forEach(field => {
                    defaultValues[`field_${field.FormAttID}`] = '';
                });
                reset(defaultValues);
            }
        } catch (error) {
            enqueueSnackbar('Failed to load form details', { variant: 'error' });
            console.error('Error fetching form details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Render appropriate form field
    const renderFormField = (field) => {
        const fieldName = `field_${field.FormAttID}`;
        const label = field.Custom_Display_Name || field.Display_Name;
        const required = field.Is_Required;

        switch (field.Field_Type.toLowerCase()) {
            case 'textbox':
                return (
                    <RHFTextField
                        key={field.FormAttID}
                        name={fieldName}
                        label={label}
                        fullWidth
                    />
                );

            case 'dropdown':
                return (
                    <Controller
                        key={field.FormAttID}
                        name={fieldName}
                        control={control}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <FormControl fullWidth error={!!error}>
                                <InputLabel>{label}</InputLabel>
                                <Select
                                    value={value || ''}
                                    label={label}
                                    onChange={onChange}
                                >
                                    {field.DropdownValues?.map((option) => (
                                        <MenuItem key={option.Value_ID} value={option.ValueText}>
                                            {option.ValueText}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    />
                );

            case 'datepicker':
                return (
                    <Controller
                        key={field.FormAttID}
                        name={fieldName}
                        control={control}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <DesktopDatePicker
                                label={label}
                                value={value || null}
                                onChange={onChange}
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
                );

            default:
                return (
                    <RHFTextField
                        key={field.FormAttID}
                        name={fieldName}
                        label={label}
                        fullWidth
                        required={required}
                    />
                );
        }
    };
console.log(selectedForm)
   const onSubmit = handleSubmit(async (data) => {
  try {
   
    // Prepare the payload according to API requirements
    const payload = {
      FormID: selectedForm?.FormID,
      Submitted_By: userData?.userDetails?.userId || 1,
      Org_Id: userData?.userDetails?.orgId || 1,
      Branch_Id: userData?.userDetails?.branchID || 6,
      FieldValues: selectedForm?.Fields.map(field => {
        const fieldValue = data[`field_${field.FormAttID}`];
        
        return {
          Field_ID: field?.Field_ID, // Using Field_ID from the field definition
          ValueText: fieldValue,
          Field_Type: field?.Field_Type
        };
      })
    };

    console.log('Submitting payload:', payload); // For debugging

    const response = await Post('Save/FormData', payload);
    
    if (response.data?.Success) {
      enqueueSnackbar('Form submitted successfully!', { 
        variant: 'success',
        
      });
      navigate(paths.dashboard.admin.forms.root); // Redirect after success
    } else {
       enqueueSnackbar('Form submission failed',{variant:'error'});
    }
  } catch (error) {
    console.error('Submission error:', error);
    enqueueSnackbar(error.message || 'Failed to submit form', { 
      variant: 'error',
     
    });
  } 
});
    return (
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <Grid container spacing={3}>
               

                {/* Dynamic Form Fields */}
                {currentData && (
                    <Grid xs={12} md={12}>
                        <Card sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3 }}>
                                {currentData.FormName}
                            </Typography>
                            

                            <Box
                                display="grid"
                                gridTemplateColumns={{
                                    xs: 'repeat(1, 1fr)',
                                    sm: 'repeat(2, 1fr)',
                                }}
                                gap={3}
                            >
                                {currentData.Fields.map((field) => renderFormField(field))}
                            </Box>

                            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                               

                                <LoadingButton
                                    type="submit"
                                    variant="contained"
                                    loading={isSubmitting || isLoading}
                                >
                                    Submit Form
                                </LoadingButton>
                            </Stack>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </FormProvider>
    );
}

DynamicFormRenderer.propTypes = {
  currentData: PropTypes.object,
};