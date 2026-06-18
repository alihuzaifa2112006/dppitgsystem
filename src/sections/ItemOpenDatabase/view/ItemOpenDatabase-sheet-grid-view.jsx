import { useCallback, useEffect, useMemo, useState } from 'react';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Button } from '@mui/material';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import ItemOpenDatabaseListView from '../ItemOpenDatabase-sheet-grid';
import { Box } from '@mui/system';
import UploadExcelDialog from '../excel-import-dialog';
import { Get } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function ItemOpenDatabaseGridView() {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [isSuperSearchEnabled, setIsSuperSearchEnabled] = useState(
    () => JSON.parse(localStorage.getItem('isSuperSearchEnabled')) || true
  );

  const [allSubCategories, setAllSubCategories] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allInvSpecs, setAllInvSpecs] = useState([]);
  const [allColorFamily, setAllColorFamily] = useState([]);
  const [allColors, setAllColors] = useState([]);
  const [allCounts, setAllCounts] = useState([]);
  const [allCompositions, setAllCompositions] = useState([]);
  const [allTypes, setAllTypes] = useState([]);
  const [allSpareNames, setAllSpareNames] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Upload Dialog Functions
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleUploadDialogOpen = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
  };

  const FetchAllClasses = useCallback(async () => {
    try {
      const response = await Get(`GetAllClasses?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`);
      setAllClasses(response.data?.Data);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetCategory = useCallback(async () => {
    const res = await Get(
      `GetAllinvcategory?branchID=${userData?.userDetails?.branchID}&orgID=${userData?.userDetails?.orgId}`
    );
    setAllCategories(res.data || []);
  }, [userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

  const GetSubCategory = useCallback(async () => {
    const res = await Get(
      `inventory/subcategory/getall?branchID=${userData?.userDetails?.branchID}&orgID=${userData?.userDetails?.orgId}`
    );
    setAllSubCategories(res.data.Data || []);
  }, [userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

  const GetColors = useCallback(async () => {
    try {
      const response = await Get(
        `colors/all?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const newdata = response.data.Data.map((item) => ({
        ...item,
        ColorNickName: `${item.ColorName} - ${item.Color_Code}`,
      }));

      setAllColors(newdata);
    } catch (error) {
      console.log(error);
      setAllColors([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchColorFamily = useCallback(async () => {
    try {
      const response = await Get(
        `GetColorFamilies?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setAllColorFamily(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetCounts = useCallback(async () => {
    try {
      const response = await Get(
        `Activeyarncount?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllCounts(response.data.Data);
    } catch (error) {
      setAllCounts([]);
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetCompositionList = useCallback(async () => {
    try {
      const response = await Get(
        `yarncomposition/GetActiveCompositions?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllCompositions(response.data.Data);
    } catch (error) {
      setAllCompositions([]);
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const APIGetTypeList = useCallback(async () => {
    try {
      const response = await Get(
        `getActiveyarntype?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setAllTypes(response.data.Data);
    } catch (error) {
      setAllTypes([]);
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetInvSpecs = useCallback(async () => {
    try {
      const response = await Get(
        `GetInvSpecs?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );

      setAllInvSpecs(response.data?.Data);
    } catch (error) {
      console.error(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetSparePartGetAll = useCallback(async () => {
    try {
      const response = await Get(
        `SparePartGetAll?org_Id=${userData?.userDetails?.orgId}&branch_Id=${userData?.userDetails?.branchID}`
      );
      setAllSpareNames(response.data || []);
    } catch (error) {
      setAllSpareNames([]);
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        FetchAllClasses(),
        GetCategory(),
        GetSubCategory(),
        GetColors(),
        APIGetCompositionList(),
        APIGetTypeList(),
        GetCounts(),
        FetchColorFamily(),
        GetInvSpecs(),
        GetSparePartGetAll(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [
    GetColors,
    APIGetCompositionList,
    APIGetTypeList,
    GetCounts,
    FetchColorFamily,
    GetInvSpecs,
    FetchAllClasses,
    GetCategory,
    GetSubCategory,
    GetSparePartGetAll,
  ]);

  const data = useMemo(
    () => ({
      classes: allClasses,
      categories: allCategories,
      subCategories: allSubCategories,
      colorFamilies: allColorFamily,
      colors: allColors,
      count: allCounts,
      compositions: allCompositions,
      types: allTypes,
      invSpecs: allInvSpecs,
      spareNames: allSpareNames,
    }),
    [
      allClasses,
      allCategories,
      allSubCategories,
      allColors,
      allCompositions,
      allTypes,
      allInvSpecs,
      allColorFamily,
      allCounts,
      allSpareNames,
    ]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Item Open"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          { name: 'Item Open' },
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
              startIcon={<Iconify icon="mingcute:file-import-line" />}
              color="primary"
              onClick={handleUploadDialogOpen}
              disabled={loading}
            >
              Import Excel
            </Button>
            <Button
              component={RouterLink}
              href={paths.dashboard.InventoryManagement.ItemOpenDatabase.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              color="primary"
            >
              Open Item
            </Button>
          </Box>
        }
      />

      <ItemOpenDatabaseListView
        superSearch={isSuperSearchEnabled}
        uploadOpen={uploadDialogOpen}
        uploadClose={handleUploadDialogClose}
        data={data}
      />
    </Container>
  );
}
