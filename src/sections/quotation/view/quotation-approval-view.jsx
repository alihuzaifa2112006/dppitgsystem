import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useEffect, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import QuotationApprovalForm from '../quotation-approval';

// ----------------------------------------------------------------------

export default function QuotationApprovalView({ urlData }) {
  const settings = useSettingsContext();

  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const response = await Get(`GetQuotationByID?quotationId=${urlData?.quotationID}`);
      const formatedData = {
        ...response.data,
        QuotationMst: {
          ...response.data.QuotationMst,
          QuotationDate: new Date(response.data.QuotationMst?.QuotationDate),
          ValidFrom: new Date(response.data.QuotationMst?.ValidFrom),
          ValidUntil: new Date(response.data.QuotationMst?.ValidUntil),
        },

        Clauses: response.data.Clauses.map((clause) => ({
          ...clause,
          Clause_ID: clause.ClauseID,
        })),
        QuotationDtl: response.data.QuotationDtl.map((item) => ({
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
        heading="Approval of Quotation"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Quotation',
            href: paths.dashboard.transaction.quotation.root,
          },
          { name: 'Approval' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <QuotationApprovalForm currentData={currentData} />}
    </Container>
  );
}

QuotationApprovalView.propTypes = {
  urlData: PropTypes.any,
};
