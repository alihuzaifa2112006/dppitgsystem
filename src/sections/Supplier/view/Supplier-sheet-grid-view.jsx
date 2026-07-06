import { useEffect, useState, useRef, useCallback } from 'react';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, IconButton, Typography, CircularProgress } from '@mui/material';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Box } from '@mui/system';
import { useSnackbar } from 'src/components/snackbar';
import { Get, Post } from 'src/api/apibasemethods';
import SupplierGrid from '../Supplier-sheet-grid';

// ----------------------------------------------------------------------

export default function SupplierGridView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const gridRefreshRef = useRef(null);

  // --- Bulk Upload Dialog ---
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [templateDownloading, setTemplateDownloading] = useState(false);

  const handleDownloadTemplate = useCallback(async () => {
    try {
      setTemplateDownloading(true);
      const response = await Get('Supplier/BulkTemplate', { responseType: 'blob' });

      // Create download link
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Supplier_Bulk_Template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar('Template downloaded successfully!', { variant: 'success' });
    } catch (err) {
      console.error('Template download error:', err);
      enqueueSnackbar('Failed to download template', { variant: 'error' });
    } finally {
      setTemplateDownloading(false);
    }
  }, [enqueueSnackbar]);

  const handleBulkUpload = useCallback(async () => {
    if (!bulkFile) {
      enqueueSnackbar('Please select an Excel file first', { variant: 'warning' });
      return;
    }
    try {
      setBulkUploading(true);
      const formData = new FormData();
      formData.append('file', bulkFile);

      const response = await Post('Supplier/BulkUpload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response?.data?.Success) {
        enqueueSnackbar(response.data.Message || 'Bulk upload successful!', { variant: 'success' });
        setBulkDialogOpen(false);
        setBulkFile(null);
        // Refresh grid
        if (gridRefreshRef.current) {
          gridRefreshRef.current();
        }
      } else {
        enqueueSnackbar(response?.data?.Message || 'Upload failed', { variant: 'error' });
      }
    } catch (err) {
      console.error('Bulk upload error:', err);
      enqueueSnackbar(err?.response?.data?.Message || 'Bulk upload failed', { variant: 'error' });
    } finally {
      setBulkUploading(false);
    }
  }, [bulkFile, enqueueSnackbar]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading=" Supply Chain Network Onboard List"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          { name: 'Supply Chain Network Onboard List' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
        action={
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Iconify icon="mdi:file-upload-outline" />}
              color="primary"
              onClick={() => setBulkDialogOpen(true)}
            >
              Bulk Upload
            </Button>

            <Button
              component={RouterLink}
              href={paths.dashboard.Onboarding.Supplier.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              color="primary"
            >
              Add Supplier
            </Button>

          </Box>
        }
      />

      <SupplierGrid onRefreshRef={gridRefreshRef} />

      {/* ── Bulk Upload Dialog ── */}
      <Dialog open={bulkDialogOpen} onClose={() => { setBulkDialogOpen(false); setBulkFile(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
              <Iconify icon="mdi:file-upload-outline" width={22} sx={{ color: 'primary.main' }} />
              <Typography variant="h6">Bulk Upload Suppliers</Typography>
            </Stack>
            <IconButton onClick={() => { setBulkDialogOpen(false); setBulkFile(null); }}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Step 1: Download Template */}
            <Box
              sx={{
                p: 2, borderRadius: 2, border: '1px dashed', borderColor: 'divider',
                bgcolor: 'background.neutral',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 40, height: 40, borderRadius: '10px', bgcolor: 'primary.lighter',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <Iconify icon="mdi:file-download-outline" width={22} sx={{ color: 'primary.main' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Step 1: Download Template</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Download the Excel template, fill in your supplier data
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={templateDownloading ? <CircularProgress size={14} /> : <Iconify icon="mdi:download" width={16} />}
                  onClick={handleDownloadTemplate}
                  disabled={templateDownloading}
                  sx={{ flexShrink: 0 }}
                >
                  {templateDownloading ? 'Downloading...' : 'Download'}
                </Button>
              </Stack>
            </Box>

            {/* Step 2: Upload File */}
            <Box
              sx={{
                p: 2, borderRadius: 2, border: '1px dashed', borderColor: bulkFile ? 'primary.main' : 'divider',
                bgcolor: bulkFile ? 'primary.lighter' : 'background.neutral',
                transition: 'all 0.2s',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 40, height: 40, borderRadius: '10px', bgcolor: bulkFile ? 'primary.main' : 'primary.lighter',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <Iconify icon="mdi:file-excel-outline" width={22} sx={{ color: bulkFile ? '#fff' : 'primary.main' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Step 2: Upload Filled Template</Typography>
                  {bulkFile ? (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 500 }}>
                        {bulkFile.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({(bulkFile.size / 1024).toFixed(1)} KB)
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Select your filled Excel file (.xlsx, .xls)
                    </Typography>
                  )}
                </Box>
                <Button
                  variant={bulkFile ? 'text' : 'outlined'}
                  size="small"
                  component="label"
                  startIcon={<Iconify icon={bulkFile ? 'mdi:swap-horizontal' : 'mdi:upload'} width={16} />}
                  sx={{ flexShrink: 0 }}
                >
                  {bulkFile ? 'Change' : 'Browse'}
                  <input
                    type="file"
                    hidden
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setBulkFile(e.target.files[0]);
                    }}
                  />
                </Button>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setBulkDialogOpen(false); setBulkFile(null); }} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleBulkUpload}
            variant="contained"
            disabled={!bulkFile || bulkUploading}
            startIcon={bulkUploading ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="mdi:cloud-upload" width={18} />}
          >
            {bulkUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
