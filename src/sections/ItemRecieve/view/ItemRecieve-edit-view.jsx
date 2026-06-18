import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import ItemOpenEditForm from '../ItemRecieve-edit';
import { useEffect, useState } from 'react';
import { Get } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function ItemOpenEditView({ urlData }) {
  const settings = useSettingsContext();
  const [currentData, setCurrentData] = useState(null);
  const idFromURL = urlData.ItemRecieveID.split('&')[0];
  const categoryFromURL = urlData.ItemRecieveID.split('&')[1];

  useEffect(() => {
    const fetch = async () => {
      // eslint-disable-next-line
      const response = await Get(`GetItemReceivingByGRNID?GRNID=${idFromURL}`);
      const formatedData = {
        Master: {
          ...response.data.Master,
          POID: response.data.Details.map((item) => item.POID),
          GRNDate: new Date(response.data.Master.GRNDate),
          ChallanDate: new Date(response.data.Master.ChallanDate),
        },
        Details: response.data.Details.map((item) => ({
          ...item,
          PODtlID: item.PODTLID,
          POID: {
            POID: item.POID,
            POCODE: item?.POCODE,
          },
          ItemName: {
            ItemID: item?.ItemID,
            ItemDescription: item?.ItemName,
          },
          Store: {
            StoreID: item?.StoreID,
            StoreName: item?.StoreName,
          },
          RackName: {
            StorageID: item?.StoreLocationID,
            StorageName: item?.StoreLocationName,
          },
          ClassID: {
            ClassID: item?.ClassID,
            ClassName: item?.ClassName,
          },
          ItemSubCategory: {
            SubCat_ID: item?.SubCatID,
            SubCat_Name: item?.SubCat_Name,
          },
          Inv_Cat_Name: {
            Inv_Cat_ID: item?.CategoryID,
            Inv_Cat_Name: item?.Inv_Cat_Name,
          },
          UOM: {
            UOMID: item?.UOMID,
            UOMName: item?.UOMName,
          },
        })),
      };
      console.log(formatedData);
      setCurrentData(formatedData);
    };

    if (urlData) {
      fetch();
    }
  }, [urlData, idFromURL, categoryFromURL]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Item Receive"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Item Receive',
            href: paths.dashboard.InventoryManagement.ItemRecieve.root,
          },
          { name: 'Update Received Items' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <ItemOpenEditForm currentData={currentData} />}
    </Container>
  );
}

ItemOpenEditView.propTypes = {
  urlData: PropTypes.any,
};
