import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// MUI Components
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import IconButton from '@mui/material/IconButton';
import { alpha, Tab, Tabs } from '@mui/material';

// Custom Components
import { LoadingScreen } from 'src/components/loading-screen';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Label from 'src/components/label';
import Image from 'src/components/image';
import { ConfirmDialog } from 'src/components/custom-dialog';
import QASignDialog from 'src/components/QASignDialog';

// Table Components
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

// Hooks and Utilities
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useBoolean } from 'src/hooks/use-boolean';
import { Delete, Get, Post } from 'src/api/apibasemethods';
import { decrypt, encrypt } from 'src/api/encryption';
import { APP_API_STORAGE } from 'src/config-global';

// Components
import ApprovalTableToolbar from '../approval-toolbar';
import ApprovalTableFiltersResult from '../approval-filters-result';
import ApprovalSigantureTableRow from '../approval-signature-table-row';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Quotation', label: 'Quotation' },
  { value: 'Performa Invoice (P.I)', label: 'Performa Invoice (P.I)' },
  { value: 'Opportunity', label: 'Opportunity' },
  { value: 'Sample Request', label: 'Sample Request' },
];

const TABLE_HEAD = [
  {
    id: 'ApproverNickName',
    label: 'Approver Name',
    minWidth: 140,
  },
  {
    id: 'EsignaturePath',
    label: 'Signature',
    minWidth: 120,
    align: 'center',
  },
  {
    id: 'actions',
    label: 'Actions',
    width: 120,
    align: 'center',
  },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Quotation':
      return 'primary';
    case 'Performa Invoice (P.I)':
      return 'error';
    case 'Opportunity':
      return 'warning';
    case 'Sample Request':
      return 'info';
    default:
      return 'default';
  }
};

export default function ApprovalSignatureView() {
  const navigate = useNavigate();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const tableComponentRef = useRef();
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const confirm = useBoolean();

  // State
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [signPadOpen, setSignPadOpen] = useState(false);
  const [signPadData, setSignPadData] = useState(null);
  const [currentApprover, setCurrentApprover] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const table = useTable();

  // Fetch approver signatures
  const FetchApprovalData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetApproverEsignatureSetup?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );

      const formattedData = response.data.map((item) => ({
        ...item,
        ApproverNickName: item?.Username || '-',
        hasSignature: !!item.EsignaturePath,
      }));

      setTableData(formattedData);
    } catch (error) {
      console.error('Error fetching approval data:', error);
      enqueueSnackbar('Failed to fetch approval data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  useEffect(() => {
    FetchApprovalData();
  }, [FetchApprovalData]);

  // Filter and pagination logic
  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  // Handlers
  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleSignPadOpen = (approver) => {
    setCurrentApprover(approver);
    setSignPadOpen(true);
  };

  const handleSignPadClose = () => {
    setSignPadOpen(false);
    setCurrentApprover(null);
    setSignPadData(null);
  };

  const handleClearSignature = () => {
    if (signPadData) {
      signPadData.clear();
    }
  };

  const handleSaveSignature = async () => {
    if (!signPadData || !currentApprover) return;
    try {
      setIsUploading(true);

      // Convert canvas to blob
      const dataUrl = signPadData.getTrimmedCanvas().toDataURL('image/png');
      const fileBlob = dataUrlToBlob(dataUrl);

      // Prepare form data
      const formData = new FormData();
      formData.append('ApproverID', currentApprover.ApproverID);
      formData.append('OrgID', userData?.userDetails?.orgId);
      formData.append('BranchID', userData?.userDetails?.branchID);
      formData.append('SignatureFile', fileBlob, `signature_${currentApprover.ApproverID}.png`);

      // Upload signature
      const response = await Post('UploadEsignature', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        enqueueSnackbar('Signature saved successfully', { variant: 'success' });
        FetchApprovalData();
        handleSignPadClose();
      } else {
        throw new Error(response?.data || 'Failed to save signature');
      }
    } catch (error) {
      console.error('Error saving signature:', error);
      enqueueSnackbar('Failed to save signature', { variant: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSignature = async (approverId) => {
    try {
      const response = await Delete(`DeleteApproverSignature?ApproverID=${approverId}`);

      if (response.success) {
        enqueueSnackbar('Signature deleted successfully', { variant: 'success' });
        FetchApprovalData();
      } else {
        throw new Error(response.message || 'Failed to delete signature');
      }
    } catch (error) {
      console.error('Error deleting signature:', error);
      enqueueSnackbar(error.message || 'Failed to delete signature', { variant: 'error' });
    }
  };

  // Utility functions
  const dataUrlToBlob = (dataUrl) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    // eslint-disable-next-line
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  };

  const renderLoading = (
    <LoadingScreen
      sx={{
        borderRadius: 1.5,
        bgcolor: 'background.default',
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
            heading="Signature Management"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              {
                name: 'Document Approval',
                href: paths.dashboard.admin.docApproval.root,
              },
              { name: 'Signature Management' },
            ]}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card>
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <TableSelectedAction dense={table.dense} rowCount={dataFiltered.length} />

              <Scrollbar>
                <Table
                  ref={tableComponentRef}
                  size={table.dense ? 'small' : 'medium'}
                  sx={{ minWidth: 560 }}
                >
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={dataFiltered.length}
                    onSort={table.onSort}
                  />

                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <ApprovalSigantureTableRow
                          key={row?.ApproverID}
                          row={row}
                          selected={table.selected.includes(row?.ApproverID)}
                          onEditRow={() => handleSignPadOpen(row)}
                          onDeleteRow={() => handleDeleteSignature(row?.ApproverID)}
                        />
                      ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={dataFiltered.length}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </Card>
        </Container>
      )}

      <QASignDialog
        open={signPadOpen}
        onClose={handleSignPadClose}
        onSave={handleSaveSignature}
        Ref={(data) => setSignPadData(data)}
        onClear={handleClearSignature}
        title={`Signature for ${currentApprover?.ApproverNickName || 'Approver'}`}
        isUploading={isUploading}
        hasExistingSignature={!!currentApprover?.EsignaturePath}
        existingSignatureUrl={
          currentApprover?.EsignaturePath
            ? `${APP_API_STORAGE}${currentApprover.EsignaturePath}`
            : null
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (document) =>
        document?.Doc_Name?.toLowerCase().includes(name.toLowerCase()) ||
        document?.ApproverNickName?.toLowerCase().includes(name.toLowerCase()) ||
        document?.Designation?.toLowerCase().includes(name.toLowerCase()) ||
        document?.SectionName?.toLowerCase().includes(name.toLowerCase()) ||
        document?.Dpt_Name?.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.Doc_Name === status);
  }

  if (role.length) {
    inputData = inputData.filter((document) => role.includes(document?.Approval_LvlID));
  }

  return inputData;
}

// ----------------------------------------------------------------------
