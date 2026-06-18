import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import PoApprovalForm from '../po-approval';

// ----------------------------------------------------------------------

export default function PoApprovalView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [currentData, setCurrentData] = useState(null);
  // eslint-disable-next-line
  const isReapproval = urlData?.prID.split('&')[1]?.length === 10 ? true : false;

  useEffect(() => {
    const fetch = async () => {
      const response = await Get(
        `getProformaInvoicesAndDetails?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&PRID=${urlData?.prID}`
      );
      const formatedData = {
        ...response.data.Data[0],
        PRNo: response.data.Data[0]?.ApplyForReapproval
          ? `${response.data.Data[0]?.PRNo}-R${response.data.Data[0]?.HistoryCount}`
          : response.data.Data[0]?.PRNo,
        PRDate: new Date(response.data.Data[0]?.PRDate),
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
        heading={` ${
          isReapproval
            ? `Re-open Purchase Order #${currentData?.PRNo || ''}`
            : `Approval Purchase Order #${currentData?.PRNo || ''}`
        }`}
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Purchase Order',
            href: paths.dashboard.procurement.po.root,
          },
          { name: isReapproval ? 'Re-open' : 'Approval' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <PoApprovalForm currentData={currentData} isReapproval={isReapproval} />}
    </Container>
  );
}

PoApprovalView.propTypes = {
  urlData: PropTypes.any,
};
