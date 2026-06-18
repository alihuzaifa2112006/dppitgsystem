import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import DispoderEditForm from '../ItemOpen-edit';

// ----------------------------------------------------------------------

export default function ItemOpenEditView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [currentData, setCurrentData] = useState(null);

  const idFromURL = urlData.ItemOpenID.split('&')[0];
  const categoryFromURL = urlData.ItemOpenID.split('&')[1];

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        const response = await Get(
          `InvItemOpeningGetByItemId?ItemID=${idFromURL}&Org_Id=${userData?.userDetails?.orgId}&Branch_Id=${userData?.userDetails?.branchID}`
        );

        const formatedData = {
          ...response?.data,
          Inv_Types_ID: response?.data?.Inv_Types_ID || null,
          Inv_Cat_ID: response?.data?.Inv_Cat_ID || null,
          SaftyQuantity: response?.data?.SaftyQuantity || null,
          ReorderQuantity: response?.data?.ReorderQuantity || null,
          ColorID: response?.data?.ColorID || null,
          UOMID: response?.data?.UOMID || null,
          Details: response?.data?.Details.map(x => ({
            ...x,
            StorageLocation: {
              StorageName: response?.data?.LocationName,
              StorageID: response?.data?.LocationID
            },
            UOM: {
              UOMName: response?.data?.UOMName,
              UOMID: response?.data?.UOMID
            },
          })) || [],
        };
        setCurrentData(formatedData || null);
        // Reset form with the fetched data
      } catch (error) {
        console.error('Error fetching item data:', error);
        // enqueueSnackbar('Failed to load item data', { variant: 'error' });
      }
    };

    if (idFromURL) {
      fetchItemData();
    }
  }, [idFromURL, userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Item Transaction"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Item Transaction',
            href: paths.dashboard.InventoryManagement.ItemOpen.root,
          },
          { name: 'Edit' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <DispoderEditForm currentData={currentData} />}
    </Container>
  );
}

ItemOpenEditView.propTypes = {
  urlData: PropTypes.any,
};
