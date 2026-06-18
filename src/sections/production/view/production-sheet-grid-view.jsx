import { useState, useEffect } from 'react';
import { LoadingScreen } from 'src/components/loading-screen';
import { useSearchParams } from 'react-router-dom';

import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';

import { Container, Box } from '@mui/system';

import PropTypes from 'prop-types';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductionOpenGrid from '../production-sheet-grid';
import ProductionOpenGridPDO from '../production-sheet-grid-pdo';
import ProductionOpenGridMRP from '../production-sheet-grid-mrp';
import { Tabs, Tab, alpha, Button } from '@mui/material';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import RptDialog from '../ReportDialog';

const ProductionOpenGridView = () => {
  const settings = useSettingsContext();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get activeTab from URL params, default to 0
  const tabFromUrl = parseInt(searchParams.get('tab') || '0', 10);
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  
  const [productionDataLength, setProductionDataLength] = useState(0);
  const [pdoDataLength, setPdoDataLength] = useState(0);
  const [mrpDataLength, setMrpDataLength] = useState(0);
  
  // Sync activeTab with URL params
  useEffect(() => {
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, tabFromUrl, activeTab]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Update URL params
    setSearchParams({ tab: newValue.toString() });
  };
  
  // Callback to navigate to next tab after save
  const handleSaveSuccess = () => {
    const nextTab = Math.min(activeTab + 1, 2); // Max tab is 2 (MRP)
    setActiveTab(nextTab);
    setSearchParams({ tab: nextTab.toString() });
  };
  // Upload Dialog Functions
  const [dialogRptOpen, setDialogRptOpen] = useState(false);

  const handleRptDialogOpen = () => {
    setDialogRptOpen(true);
  };

  const handleRptDialogClose = () => {
    setDialogRptOpen(false);
  };
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Production Planning"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Production Planning', href: paths.dashboard.Production.Planning.production.root },
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
              onClick={handleRptDialogOpen}
            >
              Generate MRP Report
            </Button>
          </Box>
        }
      />
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="production grid tabs"
        sx={{
          mb: 4,
          boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
        }}
      >
        <Tab
          value={0}
          label="Confirmed PI"
          iconPosition="start"
          icon={
            <Label variant={activeTab === 0 ? 'filled' : 'soft'} color="default">
              {productionDataLength}
            </Label>
          }
        />
        <Tab
          value={1}
          label="PDO"
          iconPosition="start"
          icon={
            <Label variant={activeTab === 1 ? 'filled' : 'soft'} color="warning">
              {pdoDataLength}
            </Label>
          }
        />
        <Tab
          value={2}
          label="MRP"
          iconPosition="start"
          icon={
            <Label variant={activeTab === 2 ? 'filled' : 'soft'} color="primary">
              {mrpDataLength}
            </Label>
          }
        />
      </Tabs>
      {activeTab === 0 && <ProductionOpenGrid setProductionDataLength={setProductionDataLength} onSaveSuccess={handleSaveSuccess} />}
      {activeTab === 1 && <ProductionOpenGridPDO setPdoDataLength={setPdoDataLength} onSaveSuccess={handleSaveSuccess} />}
      {activeTab === 2 && <ProductionOpenGridMRP setMrpDataLength={setMrpDataLength} onSaveSuccess={handleSaveSuccess} />}
      <RptDialog uploadClose={handleRptDialogClose} uploadOpen={dialogRptOpen} />
    </Container>
  );
};

export default ProductionOpenGridView;
