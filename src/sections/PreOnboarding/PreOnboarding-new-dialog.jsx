import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { paths } from 'src/routes/paths';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useSnackbar } from 'src/components/snackbar';

import { LoadingScreen } from 'src/components/loading-screen';
import { decrypt, encrypt } from 'src/api/encryption';
import { Get, Post } from 'src/api/apibasemethods';

import FormProvider, { RHFTextField, RHFInputSelect } from 'src/components/hook-form';

export default function PreOnboardingNewDialog({ open, onClose, FetchUpdatedData }) {
  const { enqueueSnackbar } = useSnackbar();

  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [PreOnboardingData, setPreOnboardingData] = useState({});

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

  // -------------------- Post PreOnboarding ----------------------

  //   const PostPreOnboarding = async () => {
  //     try {
  //       const encryptedData = Object.assign(
  //         {},
  //         ...Object.keys(PreOnboardingData).map((key) => ({
  //           [key]: encrypt(PreOnboardingData[key]),
  //         }))
  //       );
  //       await Post('mapi/InsertPreOnboarding', encryptedData).then((res) => {
  //         enqueueSnackbar('Defect Added!');
  //         FetchUpdatedData();
  //       });
  //     } catch (error) {
  //       console.log(error);
  //       enqueueSnackbar('Something Went Wrong!', { variant: 'error' });
  //     }
  //   };
  // -------------------- xxxxxxxxxxxxxxx ----------------------

  const renderLoading = (
    <LoadingScreen
      sx={{
        borderRadius: 1.5,
        bgcolor: 'background.default',
        mb: 3,
      }}
    />
  );

  const PreOnboardingDataSchema = Yup.object().shape({
    DefectDescription: Yup.string().required('Defect Description is required'),
    DefectGroup: Yup.string().required('Defect Group is required'),
    DefectCode: Yup.string().required('Defect Code is required'),
  });

  const methods = useForm({
    resolver: yupResolver(PreOnboardingDataSchema),
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

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // PostPreOnboarding();
      reset();
      onClose();
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Add Defect</DialogTitle>

      {isLoading ? (
        renderLoading
      ) : (
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Grid container>
            <Grid xs={12} md={12}>
              <DialogContent>
                <Box
                  rowGap={3}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(1, 1fr)',
                    md: 'repeat(1, 1fr)',
                  }}
                  padding={3}
                >
                  <RHFTextField
                    multiline
                    minRows={5}
                    name="DefectDescription"
                    label="Defect Description"
                    onchange={(e) =>
                      setPreOnboardingData({
                        ...PreOnboardingData,
                        DefectDescription: e.target.value,
                      })
                    }
                  />
                  <RHFTextField
                    name="DefectGroup"
                    label="Defect Group"
                    onchange={(e) =>
                      setPreOnboardingData({ ...PreOnboardingData, DefectGroup: e.target.value })
                    }
                  />
                  <RHFTextField
                    name="DefectCode"
                    label="Defect Code"
                    onchange={(e) =>
                      setPreOnboardingData({ ...PreOnboardingData, DefectCode: e.target.value })
                    }
                  />
                </Box>
              </DialogContent>

              <DialogActions>
                <Button onClick={onClose} variant="outlined" color="inherit">
                  Cancel
                </Button>
                <LoadingButton
                  color="primary"
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                >
                  Add
                </LoadingButton>
              </DialogActions>
            </Grid>
          </Grid>
        </FormProvider>
      )}
    </Dialog>
  );
}

PreOnboardingNewDialog.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any,
  FetchUpdatedData: PropTypes.func,
};
