import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useEffect, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import PIRegisterApprovalForm from '../PIRegister-approval';

// ----------------------------------------------------------------------

export default function PIRegisterApprovalView({ urlData }) {
  const settings = useSettingsContext();

  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const response = await Get(`GetPIRegisterByID?piRegisterId=${urlData?.piRegisterID}`);
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
          Clause_ID: clause.ClauseID,
        })),
        PIDtl: response.data.PIDtl.map((item) => ({
          ...item,
          Unit_Price: item.UnitPrice,
          PriceListID: {
            PriceListID: item.PIPriceList_ID,
            PriceListName: item.PriceListName,
          },
          Product: {
            Product_ID: item.Product_ID,
            Product_Name: item?.Product_Name,
            UOMNAME: item?.UOMName,
            CurrencyID: response?.QuotationMst?.Currency_ID || 1,
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
            ColorNameandCode: `${item?.ColorName} - ${item?.Color_Code}`,
            Color_Code: item?.Color_Code,
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
        heading="Approval of Import PI Register"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Import PI Register',
            href: paths.dashboard.Commercial.import.ImportPIRegister.root,
          },
          { name: 'Approval' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <PIRegisterApprovalForm currentData={currentData} />}
    </Container>
  );
}

PIRegisterApprovalView.propTypes = {
  urlData: PropTypes.any,
};
