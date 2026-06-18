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

import { Get, Post } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';

// ----------------------------------------------------------------------

export default function AddDptDialog({
  uploadClose,
  uploadOpen,
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
      .required('Clause is required')
      .min(3, 'Clause must be at least 3 characters long')
      .max(1000, 'Clause must be less than or equal to 1000 characters'),
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

  const methods = useForm({
    resolver: yupResolver(NewClauseSchema),
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

  // ------------------------------------


  const PostClauseData = async (PostData) => {
    try {
      await Post('clause/create', [PostData]).then(async (res) => {
        if (res.status === 200) {
          enqueueSnackbar('Terms & Condition / Clause Created Successfully', {
            variant: 'success',
          });
          reset();
          uploadClose();
        } else {
          enqueueSnackbar(res.data.Message, { variant: 'error' });
        }
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error?.response?.data?.Message, { variant: 'error' });
    }
  };

  const onDptSubmit = handleSubmit(async (data) => {
    // const existingClause = tableData.find(
    //   (item) => item.Clause === data.Clause && item.Document_TypeID === data.Document.Doc_ID
    // );
    // if (existingClause) {
    //   enqueueSnackbar('Clause already exists', { variant: 'error' });
    //   return;
    // }
    try {
      const dataToSend = {
        Clause: data.Clause,
        ClauseCatID: data?.ClauseCategory?.ClausesCatID,
        PaymentTermID: data?.PaymentTerms?.Payment_term_ID,
        Document_TypeID: data.Document.Doc_ID,
        CreatedBy: userData?.userDetails?.userId,
        Branch_ID: userData?.userDetails?.branchID,
        Org_ID: userData?.userDetails?.orgId,
      };
      await PostClauseData(dataToSend);
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
              Add Terms & Condition / Clause
            </Typography>

            <IconButton onClick={uploadClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <FormProvider methods={methods} onSubmit={onDptSubmit}>
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

AddDptDialog.propTypes = {
  uploadClose: PropTypes.func,
  uploadOpen: PropTypes.bool,
  tableData: PropTypes.array,
  allDocuments: PropTypes.array,
  allCategorys: PropTypes.array,
  allPaymentTerms: PropTypes.array,
  PostClauseCategorys: PropTypes.func,
};
