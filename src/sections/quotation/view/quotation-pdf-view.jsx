import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import QuotationEditForm from '../quotation-edit';
import { useEffect, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import QuotationPDF from '../QuotationPDF';
import QuotationReport from '../QuotationReport';
import useGetAllClausesByDocTypeID from 'src/utils/getClauses';
import { APP_API } from 'src/config-global';

// ----------------------------------------------------------------------

export default function QuotationPDFView({ urlData }) {
  const settings = useSettingsContext();

  const [currentData, setCurrentData] = useState(null);
  const getAllClauses = useGetAllClausesByDocTypeID();
  const [clauses, setClauses] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      const clauseData = await getAllClauses(1);
      setClauses(clauseData);
      const response = await Get(`GetQuotationByID?quotationId=${urlData?.quotationID}`);
      const res = await fetch(
        `${APP_API}GetSignatureImageByApprover?approverId=${response.data?.Level2_Approved_ID}`
      );

      if (!res.ok) throw new Error('Image not found');

      const arrayBuffer = await res.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const imageUrl = `data:image/png;base64,${base64}`;
      const data = {
        ...response.data,
        SupplierSignature: imageUrl || null,
      };
      const formatedData = {
        ...data,
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
  }, [urlData, getAllClauses]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View PDF"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Quotation',
            href: paths.dashboard.transaction.quotation.root,
          },
          { name: 'PDF' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <QuotationReport currentData={currentData} clauses={clauses} />}
    </Container>
  );
}

QuotationPDFView.propTypes = {
  urlData: PropTypes.any,
};
