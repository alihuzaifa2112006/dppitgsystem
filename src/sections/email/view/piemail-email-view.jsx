import isEqual from 'lodash/isEqual';
import * as Yup from 'yup';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useBoolean } from 'src/hooks/use-boolean';
import { Delete, Get } from 'src/api/apibasemethods';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { decrypt, encrypt } from 'src/api/encryption';

import PiemailTableRow from '../piemail-table-row';
import PiemailTableToolbar from '../piemail-toolbar';
import PiemailTableFiltersResult from '../piemail-filters-result';
import { alpha, Tab, Tabs, Typography } from '@mui/material';
import Label from 'src/components/label';
import AddDptDialog from '../AddDialog';
import EditDialog from '../EditDialog';
import FormProvider, { RHFAutocomplete } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/system';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

// ------------------------------------------------------------------

export default function PiemailEmailView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [piNos, setPiNos] = useState([]);
  const [emailData, setEmailData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // -------------------------------------
  const NewPiSchema = Yup.object().shape({});

  // -------------------------------------

  const GetProformaNoDropdown = useCallback(async () => {
    try {
      const response = await Get(
        `GetProformaNoDropdown?&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );

      setPiNos(response.data?.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchPiemail = useCallback(
    async (proformaNo) => {
      try {
        const response = await Get(
          `GetEmailHistoryByProformaNo?proformaNo=${proformaNo}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );
        setEmailData(response.data?.Data || []);
      } catch (error) {
        console.log(error);
      }
    },
    [userData?.userDetails?.orgId, userData?.userDetails?.branchID]
  );

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([GetProformaNoDropdown()]);
      setLoading(false);
    };
    fetchData();
  }, [GetProformaNoDropdown]);

  const { enqueueSnackbar } = useSnackbar();

  const table = useTable();

  const settings = useSettingsContext();

  const methods = useForm({
    resolver: yupResolver(NewPiSchema),
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
    if (values.PINo?.ProformaNo) FetchPiemail(values.PINo?.ProformaNo);
  }, [values.PINo, FetchPiemail]);

  const onSubmit = handleSubmit(async (data) => {
    // if (piDetails.length === 0) {
    //   enqueueSnackbar('Please add at least one pi product', { variant: 'error' });
    //   return;
    // }
  });
  // -------------------------------------

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
      {isLoading ? (
        renderLoading
      ) : (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
          <CustomBreadcrumbs
            heading="PI Email History"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Email History', href: paths.dashboard.email.root },
              { name: 'PI' },
            ]}
            // action={
            //   <Button
            //     variant="contained"
            //     startIcon={<Iconify icon="mingcute:add-line" />}
            //     color="primary"
            //     onClick={handleDialogOpen}
            //     sx={{
            //       mb: 1,
            //     }}
            //   >
            //     Add PIemail
            //   </Button>
            // }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card sx={{ mb: 3, p: 2 }}>
            <FormProvider methods={methods} onSubmit={onSubmit}>
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
                <RHFAutocomplete
                  name="PINo"
                  label="PI No."
                  fullWidth
                  options={piNos}
                  getOptionLabel={(option) => option?.ProformaNo || ''}
                  isOptionEqualToValue={(option, value) =>
                    option?.PIEmailHistoryID === value?.PIEmailHistoryID
                  }
                  // onChange={(_, value) => {
                  //   if (value?.ProformaNo) {
                  //   }
                  // }}
                />
              </Box>
            </FormProvider>
          </Card>
          <Card sx={{ p: 3 }}>
            {emailData?.length > 0 ? (
              emailData.map((email) => (
                <Card key={email.PIEmailHistoryID} sx={{ my: 3, p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <strong>Proforma No:</strong> {email.ProformaNo}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <strong>Email To:</strong> {email.EmailTo}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <strong>Email Date:</strong> {fDate(email.EmailDate)}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <strong>Is Reminder:</strong> {email.IsReminder ? 'Yes' : 'No'}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <strong>Email Body:</strong>
                    <Box
                      sx={{ mt: 1, border: '1px solid #ccc', p: 2 }}
                      dangerouslySetInnerHTML={{ __html: email.EmailBody }}
                    />
                  </Box>
                </Card>
              ))
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  No email history found for the selected PI No.
                </Typography>
              </Box>
            )}
          </Card>
        </Container>
      )}
    </>
  );
}

// ----------------------------------------------------------------------
