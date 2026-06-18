import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { LoadingScreen } from 'src/components/loading-screen';
import { Get, Post } from 'src/api/apibasemethods';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';

import { decrypt, encrypt } from 'src/api/encryption';
import ComplaintSuccessDialog from './complaint-success-dialog';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import Scrollbar from 'src/components/scrollbar';

// import UserTableRow from './user-table-row';

// ----------------------------------------------------------------------

export default function ComplaintRegistrationForm({ urlData }) {
  const settings = useSettingsContext();

  // Date In SQL format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const { enqueueSnackbar } = useSnackbar();

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [complaintMasterData, setComplaintMasterData] = useState({});
  const [detailList, setDetailList] = useState([]);

  const [piNumbers, setPINumbers] = useState([]);
  const [doNumbers, setDONumbers] = useState([]);
  const [items, setItems] = useState([]);
  const [lotNos, setLotNos] = useState([]);
  const [claimReasons, setClaimReasons] = useState([]);

  const [complaintAutoNo, setComplaintAutoNo] = useState();
  // --------------------------------------------------------

  // ---------------------- Fetching PI Numbers ------------------------
  const GetPINumbers = useCallback(async () => {
    try {
      const res = await Get(
        `GetPIByWIC?OrgID=1&BranchID=6&WIC_ID=${decrypt(urlData?.urlData?.id)}`
      );
      setPINumbers(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [urlData]);
  // ******************************************************************

  // ---------------------- Fetching Claim Reasons ------------------------
  const GetClaimReasons = useCallback(async () => {
    try {
      const res = await Get(`GetClaimReasons`);
      setClaimReasons(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, []);
  // ******************************************************************

  // --------------------- Is All Data Fetched -------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([GetPINumbers(), GetClaimReasons()]);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [GetPINumbers, GetClaimReasons]);
  //   ***************************************************

  const ComplaintSchema = Yup.object()
    .shape({
      PINumber: Yup.object().required('PI Number is required'),
      DONumber: Yup.object().required('DO Number is required'),
      Item: Yup.object().required('Item is required'),
      LotNo: Yup.object().required('Lot No is required'),
      LotLabel: Yup.string(),
      Color: Yup.string(),
      DOQty: Yup.number(),
      RemarksDD: Yup.object().nullable(),
      Remarks: Yup.string(),
    })
    .test('at-least-one-remarks', 'Reason is required', (value) => {
      const { RemarksDD, Remarks } = value || {};
      const remarksDDValid = RemarksDD && Object.keys(RemarksDD).length > 0;
      const remarksValid = Remarks && Remarks.trim().length > 0;

      return remarksDDValid || remarksValid;
    });

  const methods = useForm({
    resolver: yupResolver(ComplaintSchema),
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const values = watch();

  const handleAddDetail = () => {
    setDetailList((prev) => [
      ...prev,
      {
        DOID: values?.DONumber?.DOID,
        PIID: values?.PINumber?.PIID,
        PIDtlID: values?.Item?.PIDtlID,
        DODetailID: values?.LotNo?.DODetailID,
        ComplaintQty: values?.DOQty,
        ClaimReasonID: values?.RemarksDD?.ClaimReasonID || '',
        ClaimReason: values?.RemarksDD?.ClaimReason || '',
        IsReasonChosen: values?.RemarksDD !== null,
        ComplaintRemarks: values?.Remarks || '',
        DONumber: values?.DONumber?.DONumber,
        PINumber: values?.PINumber?.PINo,
        Item: values?.Item?.YarnDescription,
        LotNumber: values?.LotNo?.LotNo,
        LotLabel: values?.LotLabel,
        Color: values?.Color,
        DOQty: values?.DOQty,
      },
    ]);
  };

  useEffect(() => {
    setValue('DONumber', null);
    setValue('Item', null);
    setValue('LotNo', null);
    setValue('LotLabel', '');
    setValue('Color', '');
    setValue('DOQty', '');
    setValue('RemarksDD', null);
    setValue('Remarks', '');

    setDONumbers([]);
    setItems([]);
    setLotNos([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.PINumber]);

  useEffect(() => {
    setValue('Item', null);
    setValue('LotNo', null);
    setValue('LotLabel', '');
    setValue('Color', '');
    setValue('DOQty', '');
    setValue('RemarksDD', null);
    setValue('Remarks', '');

    setItems([]);
    setLotNos([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.DONumber]);

  useEffect(() => {
    setValue('LotNo', null);
    setValue('LotLabel', '');
    setValue('Color', '');
    setValue('DOQty', '');
    setValue('RemarksDD', null);
    setValue('Remarks', '');

    setLotNos([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.Item]);

  useEffect(() => {
    setValue('LotLabel', '');
    setValue('Color', '');
    setValue('DOQty', '');
    setValue('RemarksDD', null);
    setValue('Remarks', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.LotNo]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      handleAddDetail();
      reset();
    } catch (error) {
      console.error(error);
    }
  });

  // ---------------------- Fetching DO Numbers Data ------------------------
  const GetDONumbers = useCallback(async () => {
    try {
      const res = await Get(
        `GetDONoDropdownByPI?OrgID=1&BranchID=6&PIID=${values?.PINumber?.PIID}`
      );
      setDONumbers(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [values?.PINumber?.PIID]);

  useEffect(() => {
    if (values?.PINumber?.PIID) {
      GetDONumbers();
    }
  }, [GetDONumbers, values?.PINumber?.PIID]);
  // ******************************************************************

  // ---------------------- Fetching Items Data ------------------------
  const GetItems = useCallback(async () => {
    try {
      const res = await Get(
        `GetItemsByPIAndDO?PIID=${values?.PINumber?.PIID}&DOID=${values?.DONumber?.DOID}`
      );
      setItems(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [values?.DONumber?.DOID, values?.PINumber?.PIID]);

  useEffect(() => {
    if (values?.DONumber?.DOID && values?.PINumber?.PIID) {
      GetItems();
    }
  }, [GetItems, values?.DONumber?.DOID, values?.PINumber?.PIID]);
  // ******************************************************************

  // ---------------------- Fetching Lot Numbers Data ------------------------
  const GetLotNumbers = useCallback(async () => {
    try {
      const res = await Get(`GetLotNumbersByPIDtlID?PIDtlID=${values?.Item?.PIDtlID}`);
      setLotNos(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [values?.Item?.PIDtlID]);

  useEffect(() => {
    if (values?.Item?.PIDtlID) {
      GetLotNumbers();
    }
  }, [GetLotNumbers, values?.Item?.PIDtlID]);
  // ******************************************************************

  // ---------------------- Fetching Dispatch Data ------------------------
  const GetDispatchDetails = useCallback(async () => {
    try {
      const res = await Get(`GetDispatchDetailsByLot?DODetailID=${values?.LotNo?.DODetailID}`);
      setValue('DOQty', Number(res.data.Data.Quantity));
      setValue('LotLabel', res.data.Data.LotLabel);
      setValue('Color', res.data.Data.ColorName);
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.LotNo?.DODetailID]);

  useEffect(() => {
    if (values?.LotNo?.DODetailID) {
      GetDispatchDetails();
    }
  }, [GetDispatchDetails, values?.LotNo?.DODetailID]);
  // ******************************************************************

  const renderLoading = (
    <LoadingScreen
      sx={{
        borderRadius: 1.5,
        bgcolor: 'background.default',
      }}
    />
  );

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    window.location.reload();
  };

  const PostComplaintData = async () => {
    setSaving(true);
    try {
      const dataToSend = {
        ComplaintDate: formatDate(new Date()),
        ComplaintName: complaintMasterData?.ComplainantName,
        ComplaintEmail: complaintMasterData?.ComplainantEmail,
        ComplaintContactNo: complaintMasterData?.ComplainantNo,
        Remarks: '',
        WIC_ID: decrypt(urlData?.urlData?.id),
        Org_ID: 1,
        Branch_ID: 6,
        CreatedBy: 1,
        Details: detailList,
      };
      if (!complaintMasterData?.ComplainantName) {
        enqueueSnackbar('Please enter complainant name.', { variant: 'error' });
        return;
      }
      if (
        !complaintMasterData?.ComplainantEmail ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(complaintMasterData.ComplainantEmail)
      ) {
        enqueueSnackbar('Please enter a valid email address.', { variant: 'error' });
        return;
      }
      if (!complaintMasterData?.ComplainantNo) {
        enqueueSnackbar('Please enter complainant contact number.', { variant: 'error' });
        return;
      }
      if (detailList.length === 0) {
        enqueueSnackbar('Please enter complaint details.', { variant: 'error' });
        return;
      }

      await Post('CreateComplaint', dataToSend).then(async (res) => {
        if (res?.status === 200) {
          const complaintNo = res.data.ComplaintAutoNo;
          setComplaintAutoNo(complaintNo);
          enqueueSnackbar('Complaint Registered Successfully!');
          reset();
          handleDialogOpen();
        }
      });
    } catch (error) {
      console.log(error);
      if (error.response.status === 400) {
        enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
      } else enqueueSnackbar(error.response.data?.Message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return isLoading ? (
    renderLoading
  ) : (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Card
        sx={{
          mb: 3,
          p: 3,
          boxShadow: 'none',
          backgroundColor: settings.themeMode === 'dark' ? '#202933' : '#FBFBFC',
        }}
      >
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(1, 1fr)',
                  md: 'repeat(3, 1fr)',
                }}
              >
                <RHFTextField
                  name="ComplaintName"
                  label="Complainant Name"
                  onchange={(e) =>
                    setComplaintMasterData({
                      ...complaintMasterData,
                      ComplainantName: e.target.value,
                    })
                  }
                  fullWidth
                />

                <RHFTextField
                  name="ComplaintEmail"
                  label="Buyer/CYCLO KAM Email"
                  onchange={(e) =>
                    setComplaintMasterData({
                      ...complaintMasterData,
                      ComplainantEmail: e.target.value,
                    })
                  }
                  fullWidth
                />

                <RHFTextField
                  name="ComplaintNo"
                  label="Complainant Contact Number"
                  onchange={(e) =>
                    setComplaintMasterData({
                      ...complaintMasterData,
                      ComplainantNo: e.target.value,
                    })
                  }
                  fullWidth
                />
              </Box>
            </Card>

            <Card sx={{ p: 3, mt: 3 }}>
              <Typography variant="h4" sx={{ textAlign: 'center' }}>
                Complaint Details
              </Typography>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                }}
                sx={{
                  mt: 3,
                }}
              >
                <RHFAutocomplete
                  name="PINumber"
                  label="PI Number"
                  options={piNumbers}
                  getOptionLabel={(option) => option?.PINo}
                  value={values?.PINumber || null}
                />

                <RHFAutocomplete
                  name="DONumber"
                  label="DO Number"
                  options={doNumbers}
                  getOptionLabel={(option) => option?.DONumber}
                  value={values?.DONumber || null}
                />

                <RHFAutocomplete
                  name="Item"
                  label="Item"
                  options={items}
                  getOptionLabel={(option) => option?.YarnDescription}
                  value={values?.Item || null}
                />

                <RHFAutocomplete
                  name="LotNo"
                  label="Lot Number"
                  options={lotNos}
                  getOptionLabel={(option) => option?.LotNo}
                  value={values?.LotNo || null}
                />

                <RHFTextField
                  name="LotLabel"
                  label="Lot Label"
                  value={values?.LotLabel || ''}
                  disabled
                />

                <RHFTextField name="Color" label="Color" value={values?.Color || ''} disabled />

                <RHFTextField
                  name="DOQty"
                  label="Total Delivery Quantity"
                  value={values?.DOQty || ''}
                  disabled
                />

                <RHFAutocomplete
                  name="RemarksDD"
                  label="Reason"
                  fullWidth
                  options={claimReasons}
                  getOptionLabel={(option) => option?.ClaimReason}
                  value={values?.RemarksDD || null}
                />

                <Box
                  sx={{
                    gridColumn: {
                      xs: '1 / span 1',
                      sm: '1 / span 2',
                      md: '1 / span 3',
                    },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                    or
                  </Typography>

                  <Box flex={1}>
                    <RHFTextField
                      name="Remarks"
                      placeholder="Write Reason"
                      value={values?.Remarks || ''}
                    />
                  </Box>
                </Box>

                <Stack
                  sx={{
                    gridColumn: {
                      xs: '1 / span 1',
                      sm: '2 / span 1',
                      md: '4 / span 1',
                    },
                  }}
                  alignItems="flex-end"
                  justifyContent="center"
                >
                  <LoadingButton
                    sx={{ height: '42px' }}
                    size="large"
                    type="submit"
                    variant="contained"
                    color="primary"
                    loading={isSubmitting}
                  >
                    Add Detail
                  </LoadingButton>
                </Stack>
              </Box>
              {errors?.['']?.message && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ mt: 2, textAlign: 'center', fontStyle: 'italic' }}
                >
                  {errors[''].message}
                </Typography>
              )}
            </Card>

            {detailList.length > 0 && (
              <Card sx={{ p: 3, mt: 3 }}>
                <Scrollbar>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ py: 1 }}>PI No.</TableCell>
                        <TableCell sx={{ py: 1 }}>DO No.</TableCell>
                        <TableCell sx={{ py: 1 }}>Item</TableCell>
                        <TableCell sx={{ py: 1 }}>Lot No.</TableCell>
                        <TableCell sx={{ py: 1 }}>Lot Label</TableCell>
                        <TableCell sx={{ py: 1 }}>Color</TableCell>
                        <TableCell sx={{ py: 1 }}>Total Delivery Qty</TableCell>
                        <TableCell sx={{ py: 1 }}>Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detailList?.map((x, i) => (
                        <TableRow>
                          <TableCell sx={{ py: 1, minWidth: '200px' }}>{x.PINumber}</TableCell>
                          <TableCell sx={{ py: 1, minWidth: '180px' }}>{x.DONumber}</TableCell>
                          <TableCell sx={{ py: 1, minWidth: '300px' }}>{x.Item}</TableCell>
                          <TableCell sx={{ py: 1, minWidth: '100px' }}>{x.LotNumber}</TableCell>
                          <TableCell sx={{ py: 1, minWidth: '150px' }}>{x.LotLabel}</TableCell>
                          <TableCell sx={{ py: 1, minWidth: '100px' }}>{x.Color}</TableCell>
                          <TableCell sx={{ py: 1 }}>{x.DOQty}</TableCell>
                          <TableCell sx={{ py: 1 }}>
                            {x.ClaimReason || x.ComplaintRemarks}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </Card>
            )}

            <Stack alignItems="center" sx={{ mt: 3 }}>
              <LoadingButton
                size="large"
                variant="contained"
                color="primary"
                loading={saving}
                onClick={() => PostComplaintData()}
              >
                Submit Complaint
              </LoadingButton>
            </Stack>

            {/* Success Dialog */}
            <ComplaintSuccessDialog
              openSuccess={dialogOpen}
              closeSuccess={handleDialogClose}
              TrackingID={complaintAutoNo}
            />
          </Grid>
        </Grid>
      </Card>
    </FormProvider>
  );
}

ComplaintRegistrationForm.propTypes = {
  urlData: PropTypes.any,
};
