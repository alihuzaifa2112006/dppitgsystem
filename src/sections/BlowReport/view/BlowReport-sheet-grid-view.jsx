import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, IconButton, Typography } from '@mui/material';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
// import RptDialog from '../ReportDialog';
import { Box } from '@mui/system';
import BlowReportGrid from '../BlowReport-sheet-grid';
import RptDialog from '../ReportDialog';
import RptDialogTransfer from '../BlowExcel';
import ItemReportDialog from '../ItemReportDialog';
// import BlowReportGrid from '../BlowReport-sheet-grid';


// ----------------------------------------------------------------------

export default function BlowReportGridView() {
  const settings = useSettingsContext();

  const [isSuperSearchEnabled, setIsSuperSearchEnabled] = useState(
    () => JSON.parse(localStorage.getItem('isSuperSearchEnabled')) || true
  );

  // Handle toggle change
  const handleToggleChange = (event) => {
    const newValue = event.target.checked;
    setIsSuperSearchEnabled(newValue);
    localStorage.setItem('isSuperSearchEnabled', JSON.stringify(newValue));
  };

  useEffect(() => {
    // Sync state with localStorage on mount
    const storedValue = JSON.parse(localStorage.getItem('isSuperSearchEnabled'));
    if (storedValue !== null) {
      setIsSuperSearchEnabled(storedValue);
    }
  }, []);

  //  Dialog Functions
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // Transfer Stock Excel Dialog Functions
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  const handleTransferDialogOpen = () => {
    setTransferDialogOpen(true);
  };

  const handleTransferDialogClose = () => {
    setTransferDialogOpen(false);
  };

  // Download Excel Options Dialog Functions
  const [downloadOptionsDialogOpen, setDownloadOptionsDialogOpen] = useState(false);

  const handleDownloadOptionsDialogOpen = () => {
    setDownloadOptionsDialogOpen(true);
  };

  const handleDownloadOptionsDialogClose = () => {
    setDownloadOptionsDialogOpen(false);
  };

  const handleStockReportClick = () => {
    handleDownloadOptionsDialogClose();
    handleDialogOpen();
  };

  const handleMargasaTransferReportClick = () => {
    handleDownloadOptionsDialogClose();
    handleTransferDialogOpen();
  };

  // Item Report Dialog Functions (Summary Report)
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  const handleItemDialogOpen = () => {
    setItemDialogOpen(true);
  };

  const handleItemDialogClose = () => {
    setItemDialogOpen(false);
  };

  const handleSummaryReportClick = () => {
    handleDownloadOptionsDialogClose();
    handleItemDialogOpen();
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading=" Daily Production Report Blowroom"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          { name: 'Daily Production Report Blowroom' },
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
              variant="contained"
              startIcon={<Iconify icon="uiw:file-excel" />}
              color="primary"
              onClick={handleDownloadOptionsDialogOpen}
            >
              Download Excel
            </Button>

            <Button
              component={RouterLink}
              href={paths.dashboard.Production.BlowReport.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              color="primary"
            >
              New Report
            </Button>

          </Box>
        }
      />

      <BlowReportGrid />
      {/* <RptDialog uploadClose={handleDialogClose} uploadOpen={dialogOpen} /> */}
      <RptDialog uploadClose={handleDialogClose} uploadOpen={dialogOpen} />
      <RptDialogTransfer uploadClose={handleTransferDialogClose} uploadOpen={transferDialogOpen} />
      <ItemReportDialog uploadClose={handleItemDialogClose} uploadOpen={itemDialogOpen} />

      {/* Download Options Dialog */}
      <Dialog open={downloadOptionsDialogOpen} onClose={handleDownloadOptionsDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center">
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Select Report Type
            </Typography>
            <IconButton onClick={handleDownloadOptionsDialogClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Iconify icon="uiw:file-excel" />}
              onClick={handleStockReportClick}
              sx={{ py: 1.5, justifyContent: 'flex-start' }}
            >
              Stock Report
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Iconify icon="uiw:file-excel" />}
              onClick={handleMargasaTransferReportClick}
              sx={{ py: 1.5, justifyContent: 'flex-start' }}
            >
              Margasa Transfer Report
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Iconify icon="uiw:file-excel" />}
              onClick={handleSummaryReportClick}
              sx={{ py: 1.5, justifyContent: 'flex-start' }}
            >
              Summary Report
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDownloadOptionsDialogClose} variant="outlined">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// superSearch={isSuperSearchEnabled} 