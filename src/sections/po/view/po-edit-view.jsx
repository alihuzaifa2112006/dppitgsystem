import * as Yup from 'yup';
import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import PoEditForm from '../po-edit';
import { useLocation } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function PoEditView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const location = useLocation();
  const [currentData, setCurrentData] = useState(null);
  // eslint-disable-next-line
  const isReapproval = urlData?.POID.split('&')[1]?.length === 10 ? true : false;

  useEffect(() => {
    const fetch = async () => {
      const response = await Get(
        `purchaseorder/GetByPOID?POID=${urlData?.POID}&Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );

      const responseData = response.data.Data;

      const formattedData = {
        ...responseData,
        PRRequestID: responseData.Details.map((item) => item.PRID),
        PRCode: responseData.PRCode,
        VendorName: {
          VendorID: responseData.VendorID,
          VendorName: responseData.VendorName,
        },
        Incoterm: {
          IncotermID: responseData.incotermID,
          IncotermCode: responseData.IncotermCode,
        },
        Source: {
          POpurposeID: responseData.SourceID,
          PoPurposes: responseData.SourceName,
        },
        PODate: new Date(responseData.PODate),
        Store: {
          StoreID: responseData.LocationID,
          StoreName: responseData.LocationName,
        },
        MeansOfTransport: {
          MeansOfTransportID: responseData.MOTID,
          MeansOfTransportName: responseData.MeansOfTransports,
        },
        PaymentTerms: {
          Payment_term_ID: responseData.PaymentTermID,
          Payment_Term: responseData.Payment_Term,
        },
        Remarks: responseData?.Remarks || '',

        Details: responseData.Details?.map((item) => ({
          PODTLID: item.PODTLID,
          POID: item.POID,
          PRID: item.PRID,
          PRDTLID: item.PRDTLID,
          POPurchaseTypeID: item.POPurchaseTypeID,
          POInvTypeID: item.POInvTypeID,
          POCategoryID: item.POCategoryID,
          POCurrencyID: item.POCurrencyID,
          POSubCategoryID: item.POSubCategoryID,
          ItemID: item.ItemID,
          Specification: item.Specification,
          POQty: item.POQty,
          UnitPrice: item.POUnitPrice,
          TotalAmount: item.POTotalAmount,
          DeliveryDate: item.PODeliveryDate,
          Remarks: item.Remarks,

          UOM: {
            UOMID: item.POUOMID,
            UOMName: item.UOMName,
          },
          Currency: {
            CurrencyID: item.POCurrencyID,
            CurrencyName: item.CurrencyName,
          },
          Category: {
            CategoryID: item.POCategoryID,
            CategoryName: item.CategoryName,
          },
          SubCategory: {
            SubCatID: item.POSubCategoryID,
            SubCatName: item.SubCatName,
          },
          InvType: {
            InvTypeID: item.POInvTypeID,
            InvTypeName: item.InvTypeName,
          },
          Item: {
            ItemID: item.ItemID,
            ItemDescription: item.ItemDescription,
          },

          IsActive: item.IsActive,
          CreatedBy: item.CreatedBy,
          CreatedDate: item.CreatedDate,
        })),
      };

      setCurrentData(formattedData);
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
            ? `Re-open Purchase Order #${currentData?.POCode || ''}`
            : `Edit Purchase Order #${currentData?.POCode || ''}`
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
          { name: isReapproval ? 'Re-open' : 'Edit' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <PoEditForm currentData={currentData} isReapproval={isReapproval} />}
    </Container>
  );
}

PoEditView.propTypes = {
  urlData: PropTypes.any,
};
