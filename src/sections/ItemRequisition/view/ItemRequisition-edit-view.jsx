import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import ItemRequisitionEditForm from '../ItemRequisition-edit';
import { useEffect, useState } from 'react';
import { Get } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function ItemRequisitionEditView({ urlData }) {
  const settings = useSettingsContext();

  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const response = await Get(`GetItemRequisitionById/${urlData?.ItemRequisitionID}`);
      const formatedData = {
        ...response.data,
        ItemRequisitionDate: new Date(response.data.ItemRequisitionDate),
        EndDate: new Date(response.data.EndDate),

        OppProduct: response.data.OppProduct.map((item) => ({
          ...item,
          Product: {
            ProductID: item.ProductID,
            Product_Name: item?.Product_Name,
          },
          Yarn_Type_ID: {
            Yarn_Type_ID: item?.Yarn_Type_ID,
            Yarn_Type_Name: item?.Yarn_Type_Name,
          },
          Yarn_Count_ID: {
            Yarn_Count_ID: item?.Yarn_Count_ID,
            Yarn_Count_Name: item?.Yarn_Count_Name,
          },
          Color: {
            ColorID: item?.ColorID,
            ColorName: item?.ColorName,
          },
          Composition_ID: {
            Composition_ID: item?.Composition_ID,
            Composition_Name: item?.Composition_Name,
          },
          UOM: {
            UOMID: item?.UOMID,
            UOMName: item?.UOMName,
          },
        })),
      };
      
      setCurrentData(formatedData);
    };

    if (urlData) {
      fetch();
    }
  }, [urlData]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Update Dispatch Order"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'ItemRequisition',
            href: paths.dashboard.InventoryManagement.ItemRequisition.root,
          },
          { name: 'Update' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <ItemRequisitionEditForm currentData={currentData} />}
    </Container>
  );
}

ItemRequisitionEditView.propTypes = {
  urlData: PropTypes.any,
};
