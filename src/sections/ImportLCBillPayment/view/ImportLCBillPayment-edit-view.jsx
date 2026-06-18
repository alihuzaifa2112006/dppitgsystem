import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import ImportLCBillPaymentEditForm from '../ImportLCBillPayment-edit';
import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function ImportLCBillPaymentEditView({ urlData }) {
  const settings = useSettingsContext();

  const [currentData, setCurrentData] = useState(null);
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  useEffect(() => {
    const fetch = async () => {
      const response = await Get(`GetImportLCByID?importLCId=${urlData?.importLCId}`);

      const formatedData = {
        ...response.data,
        PIMst: {
          ...response.data.PIMst,
          PIDate: new Date(response.data.PIMst?.PIDate),
          ValidFrom: new Date(response.data.PIMst?.ValidFrom),
          ValidUntil: new Date(response.data.PIMst?.ValidUntil),
        },
        PIs: response.data.PIs.map((clause) => ({
          ...clause,
          PI_ID: clause.PIID,
        })),
        PIDtl: response.data.PIDtl.map((item) => ({
          ...item,
          Unit_Price: item.UnitPrice,
          PriceListID: {
            PriceListID: item.PriceList_ID,
            PriceListName: item.PriceListName,
          },
          Product: {
            Product_ID: item.Product_ID,
            Product_Name: item?.Product_Name,
            UOMNAME: item?.UOMName,
            CurrencyID: response?.PIMst?.Currency_ID || 1,
          },
          Yarn_Type_ID: {
            Yarn_Type_ID: item?.YARN_TYPE_ID,
            Yarn_Type: item?.YARN_TYPE,
            Yarn_Code: item?.YARN_CODE,
          },
          Yarn_Count_ID: {
            Yarn_Count_ID: item?.Yarn_Count_ID || item?.YARN_COUNTID,
            Yarn_Count_Name: item?.Yarn_Count_Name || item?.YARN_COUNT_NAME,
          },
          Color: {
            ColorID: item?.ColorID,
            ColorName: item?.ColorName,
            ColorNickName: `${item?.ColorName} - ${item?.Color_Code}`,
            Color_Code: item?.Color_Code,
            ColorNameandCode: `${item?.ColorName} - ${item?.Color_Code}`,
          },
          Composition_ID: {
            Composition_ID: item?.Composition_ID,
            Composition_Name: item?.Composition_Name,
          },
          UOM: {
            UOMID: item.UOMID,
            UOMName: item.UOMName,
          },
        })),
      };

      setCurrentData(formatedData);
      console.log(formatedData);
    };

    if (urlData) {
      fetch();
    }
  }, [urlData]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Import LC Bill Payment"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Import LC Bill Payment',
            href: paths.dashboard.Commercial.import.ImportLCBillPayment.root,
          },
          { name: 'Edit' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <ImportLCBillPaymentEditForm currentData={currentData} />}
    </Container>
  );
}

ImportLCBillPaymentEditView.propTypes = {
  urlData: PropTypes.any,
};
