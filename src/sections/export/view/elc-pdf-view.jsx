import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// import PiEditForm from '../pi-revision';
import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import PiReport from '../piReport';
import useGetAllClausesByDocTypeID from 'src/utils/getClauses';
import { Button } from '@mui/material';
import { RouterLink } from 'src/routes/components';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const generateRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
export default function PiPDFView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const getAllClauses = useGetAllClausesByDocTypeID(userData);

  const [currentData, setCurrentData] = useState(null);
  const [clauses, setClauses] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const clauseData = await getAllClauses(2);
      setClauses(clauseData);
      const response = await Get(
        `getProformaInvoicesAndDetails?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&PIID=${urlData?.piID}`
      );
      const formatedData = {
        ...response.data.Data[0],
        PINo: response.data.Data[0]?.ApplyForReapproval ? `${response.data.Data[0]?.PINo}-R` : response.data.Data[0]?.PINo,
        PIDate: new Date(response.data.Data[0]?.PIDate),
        ValidFrom: new Date(response.data.Data[0]?.ValidFrom),
        ValidUntil: new Date(response.data.Data[0]?.ValidUntil),
        Customer: {
          WIC_ID: response.data.Data[0].WIC_ID,
          WIC_Name: response.data.Data[0].WIC_Name,
        },
        // Clauses: response.data.Clauses.map((clause) => ({
        //   ...clause,
        //   Clause_ID: clause.ClauseID,
        // })),
        Remarks:response.data.Data[0].Details.map((item) => ({
         PIDtlID:item?.PIDtlID,
         Remarks:item?.Remarks
        })),
        Details: response.data.Data[0].Details.map((item) => ({
          ...item,
          Unit_Price: item.UnitPrice,
          PriceListID: {
            PriceListID: item.PriceList_ID,
            PriceListName: item.PriceListName,
          },
          Fabric_Type: {
            Fabric_TypeID: item?.Fabric_TypeID,
            Fabric_Type: item?.Fabric_Type,
          },
          Sustainability: {
            Sustainability_ID: item?.Sustainability_ID,
            Sustainability_Name: item?.Sustainability_Name,
          },
          Product: {
            Product_ID: item.Product_ID,
            Product_Name: item?.Product_Name,
            UOMName: item?.UOMName,
            CurrencyID: response?.PiMst?.Currency_ID || 1,
          },
        })),
      };
      console.log('formatedData', formatedData);
      setCurrentData(formatedData);
    };

    if (urlData) {
      fetch();
    }
  }, [urlData, userData?.userDetails?.orgId, userData?.userDetails?.branchID, getAllClauses]);
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
            name: 'Proforma Invoice',
            href: paths.dashboard.transaction.pi.root,
          },
          { name: 'PDF' },
        ]}
        // action={
        //   <Button
        //     component={RouterLink}
        //     href={`${paths.dashboard.transaction.pi.edit(urlData?.piID)}&${generateRandomString(
        //       10
        //     )}`}
        //     variant="contained"
        //     startIcon={<Iconify icon="mingcute:pen-line" />}
        //     color="primary"
        //   >
        //     Re-open
        //   </Button>
        // }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <PiReport currentData={currentData} clauses={clauses} />}
    </Container>
  );
}

PiPDFView.propTypes = {
  urlData: PropTypes.any,
};
