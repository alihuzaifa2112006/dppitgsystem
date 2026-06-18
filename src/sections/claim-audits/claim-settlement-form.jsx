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
import { paths } from 'src/routes/paths';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get, Post } from 'src/api/apibasemethods';
import { useRouter } from 'src/routes/hooks';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { useSettingsContext } from 'src/components/settings';

import { decrypt, encrypt } from 'src/api/encryption';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

// ----------------------------------------------------------------------

export default function ClaimSettlementForm({ urlData }) {
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
const router = useRouter();
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
  const [detailList, setDetailList] = useState([]);

  const [settlementTypes, setSettlementTypes] = useState([]);
  const [adjustmentTypes, setAdjustmentTypes] = useState([]);
  // --------------------------------------------------------

  // ---------------------- Fetching Lot Details ------------------------
  const GetLotDetails = useCallback(async () => {
    try {
      const res = await Get(`/GetAuditedLotDetails?AssignedID=${urlData?.AuditID}`);
      setDetailList(res.data.Data);
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ******************************************************************

  // ---------------------- Fetching Settlements ------------------------
  const GetSettlements = useCallback(async () => {
    try {
      const res = await Get(`/GetSettlementTypes`);
      setSettlementTypes(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, []);
  // ******************************************************************

  // ---------------------- Fetching Adjustments ------------------------
  const GetAdjustments = useCallback(async () => {
    try {
      const res = await Get(`/GetAdjustmentTypes`);
      setAdjustmentTypes(res.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, []);
  // ******************************************************************

  // --------------------- Is All Data Fetched -------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([GetLotDetails(), GetSettlements(), GetAdjustments()]);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [GetLotDetails, GetSettlements, GetAdjustments]);
  //   ***************************************************

  const handleDetailInputChange = (index, fieldName, value) => {
    setDetailList((prevList) => {
      const updatedList = [...prevList];
      updatedList[index] = {
        ...updatedList[index],
        [fieldName]: value,
      };
      return updatedList;
    });
  };

  const renderLoading = (
    <LoadingScreen
      sx={{
        borderRadius: 1.5,
        bgcolor: 'background.default',
      }}
    />
  );

  const PostReplacementData = async (data, id) => {
    try {
      const dataToSend = data.map((x) => ({
        ...x,
        SettlementID: id,
      }));
      await Promise.all(
        dataToSend.map(async (item) => {
          await Post('CreateReplacementYarnSettlement', item);
        })
      );
    } catch (error) {
      console.log(error);
    }
  };

  const PostReturnData = async (data, id) => {
    try {
      const dataToSend = {
        SettlementID: id,
        AssignedID: urlData?.AuditID,
        ReturnDate: formatDate(new Date()),
        CustomerID: urlData?.CustomerID,
        Remarks: '',
        CreatedBy: userData?.userDetails?.userId,
        Details: data.map((x) => ({
          CAOnSiteID: x?.CAOnSiteID,
          DODetailID: x?.DODetailID,
          PIDtlID: x?.PIDtlID,
          ReturnedQty: x.IssueQuantity,
          IssuedQty: x.DeliveredQty,
          UnitID: 1,
          WarehouseID: 0,
          Remarks: '',
        })),
      };
      await Post('CreateReturnNote', dataToSend);
    } catch (error) {
      console.log(error);
    }
  };

  const PostExcessData = async (data, id) => {
    try {
      const dataToSend = data.map((x) => ({
        ...x,
        SettlementID: id,
      }));
      await Promise.all(
        dataToSend.map(async (item) => {
          await Post('CreateExcessYarnSettlement', item);
        })
      );
    } catch (error) {
      console.log(error);
    }
  };

  const PostFinancialAdjustmentData = async (data, id) => {
    try {
      const dataToSend = data.map((x) => ({
        ...x,
        SettlementID: id,
        ClaimAmount: x.TotalAmount,
        Notes: '',
      }));
      await Promise.all(
        dataToSend.map(async (item) => {
          await Post('CreateFinancialAdjustment', item);
        })
      );
    } catch (error) {
      console.log(error);
    }
  };

  const PostSettlementData = async () => {
    setSaving(true);
    try {
      const dataToSend = {
        AssignedID: urlData?.AuditID,
        Remarks: 'Settlement done successfully after inspection',
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
        CreatedBy: userData?.userDetails?.userId,
      };

      const replacementLots = detailList?.filter((x) => x?.SettlementTypeID === 1);
      const excessYarnLots = detailList?.filter((x) => x?.SettlementTypeID === 2);
      const financialLots = detailList?.filter((x) => x?.SettlementTypeID === 3);

      if (detailList.some((item) => !item?.SettlementTypeID)) {
        enqueueSnackbar('Settlement type must be selected for all lots.', { variant: 'error' });
        return;
      }
      if (replacementLots?.length > 0 && replacementLots?.some((item) => !item?.IssueDate)) {
        enqueueSnackbar('Issue Date is required for replacement yarn', { variant: 'error' });
        return;
      }
      if (replacementLots?.length > 0 && replacementLots?.some((item) => !item?.IssueQuantity)) {
        enqueueSnackbar('Issue Quantity is required for replacement yarn', { variant: 'error' });
        return;
      }

      if (excessYarnLots?.length > 0 && excessYarnLots?.some((item) => !item?.IssueDate)) {
        enqueueSnackbar('Issue Date is required for excess yarn', { variant: 'error' });
        return;
      }
      if (excessYarnLots?.length > 0 && excessYarnLots?.some((item) => !item?.ExcessQuantity)) {
        enqueueSnackbar('Excess Quantity is required for excess yarn', { variant: 'error' });
        return;
      }

      if (financialLots?.length > 0 && financialLots?.some((item) => !item?.CreditNoteDate)) {
        enqueueSnackbar('Credit Note Date is required for financial adjustment', {
          variant: 'error',
        });
        return;
      }
      if (financialLots?.length > 0 && financialLots?.some((item) => !item?.AdjustmentTypeID)) {
        enqueueSnackbar('Adjustment Type is required for financial adjustment', {
          variant: 'error',
        });
        return;
      }
      if (financialLots?.length > 0 && financialLots?.some((item) => !item?.Quantity)) {
        enqueueSnackbar('Quantity is required for financial adjustment', { variant: 'error' });
        return;
      }

      await Post('CreateClaimSettlement', dataToSend).then(async (res) => {
        if (res?.status === 200) {
          const settlementId = res.data.SettlementID;
          if (replacementLots.length > 0) {
            await PostReplacementData(replacementLots, settlementId);
            await PostReturnData(replacementLots, settlementId);
          }
          if (excessYarnLots.length > 0) {
            await PostExcessData(excessYarnLots, settlementId);
          }
          if (financialLots.length > 0) {
            await PostFinancialAdjustmentData(financialLots, settlementId);
          }
          enqueueSnackbar('Saved Successfully!');
        //  Here I have to added navigated path
           router.push(paths.dashboard.customerClaim.claimAudits.root);

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
    <Grid container spacing={3}>
      <Grid xs={12} md={12}>
        {detailList?.map((x, i) => (
          <Card sx={{ p: 3, mt: 2 }} key={i}>
            <Typography variant="h5">Lot# {x?.LotNo}</Typography>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
                md: 'repeat(3, 1fr)',
              }}
              sx={{ mt: 2 }}
            >
              <TextField
                InputLabelProps={{ shrink: true }}
                label="Lot Label"
                value={x?.LotLabel}
                disabled
                fullWidth
              />

              <TextField
                InputLabelProps={{ shrink: true }}
                label="Yarn Description"
                value={x?.YarnDescription}
                disabled
                fullWidth
              />

              <TextField
                InputLabelProps={{ shrink: true }}
                label="Problem Found"
                value={x?.ProblemFound}
                disabled
                fullWidth
              />

              <TextField
                InputLabelProps={{ shrink: true }}
                label="Description"
                value={x?.Description}
                disabled
                fullWidth
              />

              <TextField
                InputLabelProps={{ shrink: true }}
                label="Delivered Quantity"
                value={x?.DeliveredQty}
                disabled
                fullWidth
              />

              <TextField
                InputLabelProps={{ shrink: true }}
                label="Unit Price"
                type="number"
                value={x?.UnitPrice}
                disabled
                fullWidth
              />

              <TextField
                InputLabelProps={{ shrink: true }}
                label="Total Amount"
                type="number"
                value={x?.TotalAmount}
                disabled
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel id="label">Settlement Type</InputLabel>
                <Select
                  labelId="label"
                  label="Settlement Type"
                  onChange={(e) => {
                    handleDetailInputChange(i, 'SettlementTypeID', e.target.value);
                    handleDetailInputChange(i, 'IssueQuantity', null);
                    handleDetailInputChange(i, 'IssueDate', null);
                    handleDetailInputChange(i, 'FinancialLoss', null);
                    handleDetailInputChange(i, 'ExcessQuantity', null);
                    handleDetailInputChange(i, 'CreditNoteDate', null);
                    handleDetailInputChange(i, 'AdjustmentTypeID', null);
                    handleDetailInputChange(i, 'Quantity', null);
                    handleDetailInputChange(i, 'SettlementAmount', null);
                  }}
                >
                  {settlementTypes.map((settle) => (
                    <MenuItem key={settle?.SettlementTypeID} value={settle?.SettlementTypeID}>
                      {settle?.SettlementTypeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {x?.SettlementTypeID === 1 && (
                <>
                  <DatePicker
                    label="Issue Date"
                    onChange={(newValue) =>
                      handleDetailInputChange(i, 'IssueDate', formatDate(newValue))
                    }
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />

                  <TextField
                    label="Issue Quantity"
                    type="number"
                    onChange={(e) => {
                      handleDetailInputChange(i, 'IssueQuantity', e.target.value);
                      handleDetailInputChange(
                        i,
                        'FinancialLoss',
                        (e.target.value * (x?.UnitPrice || 0)).toFixed(2)
                      );
                    }}
                    fullWidth
                  />

                  <TextField
                    InputLabelProps={{ shrink: true }}
                    label="Financial Loss"
                    type="number"
                    value={x?.FinancialLoss}
                    disabled
                    fullWidth
                  />
                </>
              )}

              {x?.SettlementTypeID === 2 && (
                <>
                  <DatePicker
                    label="Issue Date"
                    onChange={(newValue) =>
                      handleDetailInputChange(i, 'IssueDate', formatDate(newValue))
                    }
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />

                  <TextField
                    label="Excess Quantity"
                    type="number"
                    onChange={(e) => {
                      handleDetailInputChange(i, 'ExcessQuantity', e.target.value);
                      handleDetailInputChange(
                        i,
                        'FinancialLoss',
                        (e.target.value * (x?.UnitPrice || 0)).toFixed(2)
                      );
                    }}
                    fullWidth
                  />

                  <TextField
                    InputLabelProps={{ shrink: true }}
                    label="Financial Loss"
                    type="number"
                    value={x?.FinancialLoss}
                    disabled
                    fullWidth
                  />
                </>
              )}

              {x?.SettlementTypeID === 3 && (
                <>
                  <DatePicker
                    label="Credit Note Date"
                    onChange={(newValue) =>
                      handleDetailInputChange(i, 'CreditNoteDate', formatDate(newValue))
                    }
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />

                  <FormControl fullWidth>
                    <InputLabel id="type">Adjustment Type</InputLabel>
                    <Select
                      labelId="type"
                      label="Adjustment Type"
                      onChange={(e) =>
                        handleDetailInputChange(i, 'AdjustmentTypeID', e.target.value)
                      }
                    >
                      {adjustmentTypes.map((adj) => (
                        <MenuItem key={adj?.AdjustmentTypeID} value={adj?.AdjustmentTypeID}>
                          {adj?.AdjustmentTypeName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Quantity"
                    type="number"
                    onChange={(e) => {
                      handleDetailInputChange(i, 'Quantity', e.target.value);
                      handleDetailInputChange(
                        i,
                        'FinancialLoss',
                        (e.target.value * (x?.UnitPrice || 0)).toFixed(2)
                      );
                      handleDetailInputChange(
                        i,
                        'SettlementAmount',
                        (e.target.value * (x?.UnitPrice || 0)).toFixed(2)
                      );
                    }}
                    fullWidth
                  />

                  <TextField
                    InputLabelProps={{ shrink: true }}
                    label="Financial Loss"
                    type="number"
                    value={x?.FinancialLoss}
                    disabled
                    fullWidth
                  />
                </>
              )}
            </Box>
          </Card>
        ))}

        <Stack alignItems="center" flexDirection="row" justifyContent="end" sx={{ mt: 3 }}>
          <LoadingButton
            size="large"
            variant="contained"
            color="primary"
            loading={saving}
            onClick={() => PostSettlementData()}
          >
            Save
          </LoadingButton>
        </Stack>
      </Grid>
    </Grid>
  );
}

ClaimSettlementForm.propTypes = {
  urlData: PropTypes.any,
};
