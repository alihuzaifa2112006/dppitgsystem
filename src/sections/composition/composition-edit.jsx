import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  IconButton,
  InputAdornment,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';

import { Get, Post, Put } from 'src/api/apibasemethods';
import Scrollbar from 'src/components/scrollbar';
import { set } from 'lodash';
import { id } from 'date-fns/locale';

// ----------------------------------------------------------------------

export default function CompositionEditForm({ currentComposition }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [isLoading, setLoading] = useState(false);
  const [totalRatio, setTotalRatio] = useState(0);
  const [blendType, setBlendType] = useState([]);
  const [blendName, setBlendName] = useState([]);
  const [detailRow, setDetailRow] = useState(currentComposition?.Details || []);
  const [compositionName, setCompositionName] = useState([]);

  const [editingRowId, setEditingRowId] = useState(null);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewCompositionSchema = Yup.object().shape({
    // Sustainability_Certification: Yup.string().required('Sustainability Certification is required'),
  });

  const defaultValues = useMemo(
    () => ({
      Sustainability_Certification: currentComposition?.Sustainability_Certification || 'N/A',
    }),
    [currentComposition]
  );
  const methods = useForm({
    resolver: yupResolver(NewCompositionSchema),
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
    if (currentComposition === undefined || currentComposition === null) {
      setLoading(true);
    } else {
      setLoading(false);
    }
    if (currentComposition) {
      setDetailRow(currentComposition?.Details);
    }
    if (!isLoading) {
      methods.reset(defaultValues);
    }
  }, [isLoading, defaultValues, methods, currentComposition]);

  useEffect(() => {
    const fetch = async () => {
      const res = await Get(
        `ApiGetBlendTypeList?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      if (res.status === 200) {
        setBlendType(res.data?.Data);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ApiGetBlendNamesByID = async () => {
      try {
        const res = await Get(`blend/bytypeID/${values.BlendType.Blend_Type_ID}`);
        setBlendName(res.data?.Data);
      } catch (error) {
        console.error(error);
      }
    };
    ApiGetBlendNamesByID();
  }, [values?.BlendType, setValue]);

  useEffect(() => {
    const generateTotalRatio = () => {
      const ratio = detailRow?.map((row) => parseInt(row?.Ratio, 10));
      const total = ratio?.reduce((a, b) => a + b, 0);
      setTotalRatio(total);
    };
    // if (values.CompositionName && values.Composition_Code) {
    generateTotalRatio();
    // }
  }, [detailRow]);

  function generateCompositionName(detailRw) {
    return detailRw
      ?.sort((a, b) => b.Ratio - a.Ratio) // Sort by Ratio in descending order
      ?.map((item) => `${item.Ratio}% ${item.BlendName.Blend_Names.trim()}`) // Format each blend
      ?.join(' '); // Join them into a single string
  }
  useEffect(() => {
    const gnName = generateCompositionName(detailRow);

    setCompositionName(gnName);
  }, [detailRow]);

  const handleEditRow = (row) => {
    setValue('BlendType', row?.BlendType);
    setValue('BlendName', row?.BlendName);
    setValue('Ratio', row?.Ratio);
    setEditingRowId(row?.id); // Set row ID to track which row is being edited
  };

  const handleAddOrUpdateRow = () => {
    if (!values.BlendType || !values.BlendName || !values.Ratio) {
      enqueueSnackbar('All fields are required', { variant: 'error' });
      return;
    }

    if (editingRowId !== null) {
      // Update existing row
      const updatedRows = detailRow.map((row) =>
        row.id === editingRowId
          ? {
              ...row,
              BlendType: values.BlendType,
              BlendName: values.BlendName,
              Ratio: values.Ratio,
            }
          : row
      );
      setDetailRow(updatedRows);
      setEditingRowId(null); // Reset edit mode
    } else {
      // Add new row
      if (detailRow.some((row) => row.BlendName.Blend_Name_ID === values.BlendName.Blend_Name_ID)) {
        enqueueSnackbar('Blend Name already exists', { variant: 'error' });
        return;
      }
      const newRow = {
        id: Date.now().toString(),
        BlendType: values.BlendType,
        BlendName: values.BlendName,
        Ratio: values.Ratio,
      };
      setDetailRow([...detailRow, newRow]);
    }

    // Reset input fields
    setValue('BlendType', '');
    setValue('BlendName', '');
    setValue('Ratio', '');
  };

  const handleCancelEdit = () => {
    // Reset form values
    setValue('BlendType', '');
    setValue('BlendName', '');
    setValue('Ratio', '');
    setEditingRowId(null); // Exit edit mode
  };

  const handleDeleteRow = (idx) => {
    const newRows = detailRow?.filter((row) => row?.id !== idx);
    setDetailRow(newRows);
  };
  // ------------------------------------

  const onSubmit = handleSubmit(async (data) => {
    if (totalRatio !== 100) {
      enqueueSnackbar('Total Ratio must be 100%', { variant: 'error' });
      return;
    }
    if (detailRow?.length === 0) {
      enqueueSnackbar('Please add at least one row', { variant: 'error' });
      return;
    }

    const UpdateData = {
      Composition_ID: currentComposition?.Composition_ID,
      Composition_Name: compositionName || '',
      Sustainability_Certification: data?.Sustainability_Certification || 'N/A',
      UpdatedBy: userData?.userDetails?.userId,
      IsActive: true,
      Details: detailRow?.map((row) => ({
        CompositionDtlID: row?.CompositionDtlID || 0,
        Blend_Type_ID: row?.BlendType?.Blend_Type_ID || 0,
        Blend_Name_ID: row?.BlendName?.Blend_Name_ID || 0,
        Blend_Ratio_Percentage: parseInt(row?.Ratio, 10) || 0,
        IsActive: true,
        UpdatedBy: userData?.userDetails?.userId,
      })),
    };

    try {
      const res = await Put(
        `yarncomposition/UpdateCompositionWithDetails/${currentComposition?.Composition_ID}`,
        UpdateData
      );
      if (res?.status === 409) {
        console.log('409');
        enqueueSnackbar('Composition Already Exists', { variant: 'error' });
        return;
      }
      if (res.status === 200) {
        enqueueSnackbar('Created Successfully!');
        router.push(paths.dashboard.productManagement.composition.root);
        reset();
      }
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('409 Conflict Error');
        enqueueSnackbar('Composition Already Exists', { variant: 'error' });
        return;
      }
      enqueueSnackbar('Something went wrong!', { variant: 'error' });
    }
  });

  const renderLoading = (
    <LoadingScreen
      sx={{
        borderRadius: 1.5,
        bgcomposition: 'background.default',
      }}
    />
  );

  return isLoading ? (
    renderLoading
  ) : (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <h3>Composition Details:</h3>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(3, 1fr)',
              }}
            >
              {/* <RHFTextField
                name="Sustainability_Certification"
                label="Sustainablity Certification"
                placeholder="GOTS, GBB, B Corp, etc."
                value={values?.Sustainability_Certification}
              /> */}
              {/* <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
              <Box sx={{ display: { xs: 'none', sm: 'block' } }} /> */}
              <RHFAutocomplete
                name="BlendType"
                label="Blend Type"
                placeholder="Please Select "
                options={blendType}
                getOptionLabel={(option) => option?.Blend_Type_Name}
                value={
                  blendType?.find(
                    (item) => item?.Blend_Type_ID === values?.BlendType?.Blend_Type_ID
                  ) || null
                }
              />
              <RHFAutocomplete
                name="BlendName"
                label="Blend Name"
                placeholder="Please Select "
                options={blendName}
                getOptionLabel={(option) => option?.Blend_Names}
                value={
                  blendName?.find(
                    (item) => item?.Blend_Name_ID === values?.BlendName?.Blend_Name_ID
                  ) || null
                }
              />
              <RHFTextField
                name="Ratio"
                label="Ratio in %"
                type="number"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'end', my: 2 }}>
              {editingRowId ? (
                <>
                  <Button variant="text" color="inherit" onClick={handleCancelEdit} sx={{ mr: 1 }}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleAddOrUpdateRow}>
                    Update
                  </Button>
                </>
              ) : (
                <Button variant="contained" color="primary" onClick={handleAddOrUpdateRow}>
                  Add
                </Button>
              )}
            </Box>
            {detailRow?.length > 0 && (
              <TableContainer>
                <Scrollbar>
                  <Table sx={{ minWidth: 700 }} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 200 }}> Blend Type</TableCell>
                        <TableCell sx={{ width: 120 }}> Blend Name</TableCell>
                        <TableCell sx={{ width: 120, textAlign: 'center' }}> Ratio</TableCell>
                        <TableCell sx={{ width: 120, textAlign: 'center' }}> Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detailRow?.map((row) => (
                        <TableRow key={row?.id}>
                          <TableCell sx={{ width: 200 }}>
                            {row?.BlendType?.Value || row?.BlendType?.Blend_Type_Name}
                          </TableCell>
                          <TableCell sx={{ width: 120 }}>{row?.BlendName?.Blend_Names}</TableCell>
                          <TableCell sx={{ width: 120, textAlign: 'center' }}>
                            {row?.Ratio}
                          </TableCell>
                          <TableCell sx={{ width: 120, textAlign: 'center' }}>
                            <IconButton onClick={() => handleEditRow(row)} sx={{ ml: 1 }}>
                              <Iconify icon="solar:pen-bold" />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDeleteRow(row?.id)}>
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Scrollbar>
                {detailRow?.length > 0 && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'end', my: 2 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ mr: 2 }}>
                        Total Ratio:
                        <span
                          style={{ color: totalRatio === 100 ? 'green' : 'red', marginLeft: 5 }}
                        >
                          {totalRatio} %
                        </span>
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700} sx={{ mt: 2 }}>
                      Composition Name:
                      <span style={{ marginLeft: 5, fontWeight: 500 }}>{compositionName}</span>
                    </Typography>
                  </>
                )}
              </TableContainer>
            )}
          </Card>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              disabled={totalRatio !== 100}
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
CompositionEditForm.propTypes = {
  currentComposition: PropTypes.any,
};
