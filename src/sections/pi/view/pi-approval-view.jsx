import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import PiApprovalForm from '../pi-approval';
import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function PiApprovalView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const response = await Get(
        `getProformaInvoicesAndDetails?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&PIID=${urlData?.piID}`
      );
      const formatedData = {
        ...response.data.Data[0],
        PINo: response.data.Data[0]?.ApplyForReapproval
          ? `${response.data.Data[0]?.PINo}-R${response.data.Data[0]?.HistoryCount}`
          : response.data.Data[0]?.PINo,
        PIDate: new Date(response.data.Data[0]?.PIDate),
        ValidFrom: new Date(response.data.Data[0]?.ValidFrom),
        ValidUntil: new Date(response.data.Data[0]?.ValidUntil),
        Customer: {
          WIC_ID: response.data.Data[0].WIC_ID,
          WIC_Name: response.data.Data[0].WIC_Name,
        },
        UOM: {
          UOMID: response.data.Data[0]?.Details[0]?.UOMID,
          UOMName: response.data.Data[0]?.Details[0]?.UOMName,
        },
        // Clauses: response.data.Clauses.map((clause) => ({
        //   ...clause,
        //   Clause_ID: clause.ClauseID,
        // })),
        Details: response.data.Data[0].Details.map((item) => ({
          ...item,
          Unit_Price: item.UnitPrice,
          PriceListID: {
            PriceListID: item.PriceList_ID,
            PriceListName: item.PriceListName,
          },
          Yarn_Type_ID: {
            Yarn_Type_ID: item?.YarnTypeID,
            Yarn_Type_Name: item?.Yarn_Type,
          },
          Yarn_Count_ID: {
            Yarn_Count_ID: item?.CountID,
            Yarn_Count_Name: item?.Yarn_Count_Name,
          },
          Color: {
            ColorID: item?.ColorID,
            ColorName: item?.ColorName,
          },
          Composition_ID: {
            Composition_ID: item?.CompositionID,
            Composition_Name: item?.Composition_Name,
          },
          UOM: {
            UOMID: item?.UOMID,
            UOMName: item?.UOMName,
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
            PriceListID: item.PriceList_ID,
            Product_Name: item?.Product_Name,
            UOMName: item?.UOMName,
            UOMID: item?.UOMID,
            Price_Range_Frm: item?.Price_Range_Frm,
            Price_Range_To: item?.Price_Range_To,
            Product_Price: item?.Product_Price,
            CurrencyID: item?.Currency_ID || 1,
          },
        })),
      };
      setCurrentData(formatedData);
    };

    if (urlData) {
      fetch();
    }
  }, [urlData, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={`Approve PI #${currentData?.PINo}`}
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Proforma Invoice',
            href: paths.dashboard.transaction.pi.root,
          },
          { name: 'Approval' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <PiApprovalForm currentData={currentData} />}
    </Container>
  );
}

PiApprovalView.propTypes = {
  urlData: PropTypes.any,
};
