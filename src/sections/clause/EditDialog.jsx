import * as Yup from 'yup';
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Input,
  InputAdornment,
  Typography,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFUpload,
  RHFUploadBox,
} from 'src/components/hook-form';

import { Get, Post, Put } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';

// ----------------------------------------------------------------------

export default function EditDialog({
  uploadClose,
  uploadOpen,
  row,
  tableData,
  allDocuments,
  allCategorys,
  allPaymentTerms,
  PostClauseCategorys,
}) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // ---------------------- XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ------------------------

  const NewClauseSchema = Yup.object().shape({
    Clause: Yup.string()
      .required('Clause Name is required')
      .min(3, 'Clause Name must be at least 3 characters long')
      .max(1000, 'Clause Name must be less than or equal to 1000 characters'),
    // .matches(/^[a-zA-Z\s]+$/, 'Clause Name must only contain letters and spaces'),
    Document: Yup.object().required('Document is required'),
    ClauseCategory: Yup.object().required('Clause Category is required'),
    PaymentTerms: Yup.object().when('ClauseCategory', {
      is: (ClauseCategory) => ClauseCategory?.ClausesCatID === 1,
      then: () =>
        Yup.object().required('Payment Terms is required when Clause Category is "Payment Term"'),
      otherwise: () => Yup.mixed().notRequired(),
    }),
  });

  const defaultValues = useMemo(
    () => ({
      Clause: row?.Clause || '',
      Document: allDocuments.find((docs) => docs.Doc_ID === row?.Document_TypeID) || null,
      ClauseCategory: allCategorys.find((cat) => cat.ClausesCatID === row?.ClausesCatID) || null,
      PaymentTerms:
        allPaymentTerms.find((term) => term.Payment_term_ID === row?.Payment_term_ID) || null,
    }),
    [row, allDocuments, allCategorys, allPaymentTerms]
  );

  const methods = useForm({
    resolver: yupResolver(NewClauseSchema),
    defaultValues,
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
    methods.reset(defaultValues);
  }, [defaultValues, methods]);

  // ------------------------------------

  const PutClauseData = async (PutData) => {
    try {
      await Post(`clause/update`, PutData).then(async (res) => {
        enqueueSnackbar(res.data.Message);
        uploadClose();
        reset(); // Only reset after successful submission
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message, { variant: 'error' });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    // check if the Clause of the same Document_TypeID already exists in the tableData array

    // const existingClause = tableData.find(
    //   (item) => item.Clause === data.Clause && item.Document_TypeID === data.Document.Doc_ID
    // );
    // if (existingClause) {
    //   enqueueSnackbar('Clause already exists', { variant: 'error' });
    //   return;
    // }
    try {
      const dataToSend = {
        Clause_ID: row?.Clause_ID,
        Clause: data.Clause,
        Document_TypeID: data.Document.Doc_ID,
        ClauseCatID: data?.ClauseCategory?.ClausesCatID,
        PaymentTermID: data?.PaymentTerms?.Payment_term_ID,
        isActive: true,
        UpdatedBy: userData?.userDetails?.userId,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      };
      await PutClauseData(dataToSend);
    } catch (error) {
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

  return (
    <>
      <Dialog
        open={uploadOpen}
        onClose={() => {
          uploadClose(); // Call the original close function
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontSize: '20px !important' }}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              Edit Terms & Condition / Clause
            </Typography>

            <IconButton onClick={uploadClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              paddingY={3}
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
              }}
            >
              <RHFAutocomplete
                name="Document"
                label="For Document Type"
                placeholder="Choose an option"
                fullWidth
                options={allDocuments}
                getOptionLabel={(option) => option?.Doc_Name}
                isOptionEqualToValue={(option, value) => option?.Doc_ID === value?.Doc_ID}
              />
              <AutocompleteWithAdd
                name="ClauseCategory"
                label="Clause Category"
                options={allCategorys}
                getOptionLabel={(option) => option?.ClausesCategory}
                isOptionEqualToValue={(option, value) =>
                  option?.ClausesCatID === value?.ClausesCatID
                }
                value={values?.ClauseCategory || null}
                onAdd={PostClauseCategorys}
              />
              {/* {values?.ClauseCategory?.ClausesCatID === 1 && ( */}
              <RHFAutocomplete
                name="PaymentTerms"
                label="Payment Terms"
                options={allPaymentTerms}
                getOptionLabel={(option) => option?.Payment_Term}
                isOptionEqualToValue={(option, value) =>
                  option?.Payment_term_ID === value?.Payment_term_ID
                }
                value={values?.PaymentTerms || null}
              />
              {/* )} */}
              <RHFTextField name="Clause" label="Terms & Condition / Clause" multiline rows={5} />
            </Box>
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
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

EditDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  row: PropTypes.object,
  tableData: PropTypes.array,
  allDocuments: PropTypes.array,
  allCategorys: PropTypes.array,
  allPaymentTerms: PropTypes.array,
  PostClauseCategorys: PropTypes.func,
};
