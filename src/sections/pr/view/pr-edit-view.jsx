import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import PrEditForm from '../pr-edit';
import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function PrEditView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [currentData, setCurrentData] = useState(null);
  // eslint-disable-next-line
  const isReapproval = urlData?.prID.split('&')[1]?.length === 10 ? true : false;

  useEffect(() => {
    const fetch = async () => {
      const response = await Get(`GetPurchaseRequestDetailsById?PRRequestID=${urlData?.prID}`);
      const formatedData = {
        ...response.data,
        PRCode: response.data.PRCode,
        PRRequestDate: new Date(response.data.PRRequestDate),
        PRINVTypeID: {
          ClassID: response.data.Details[0].ClassID,
          ClassName: response.data.Details[0].ClassName,
        },
        PRPriority: {
          PRPriorityID: response.data.PriorityID,
          PRPriorities: response.data.PRPriorities,
        },
        PRCurrencyID: {
          Currency_ID: response.data.Details[0].Currency_ID,
          // Currency_Code: response.data.Details[0].Currency_Code,
          Currency_Name: response.data.Details[0].Currency_Name,
        },
        Department: {
          Dpt_ID: response.data.DptID,
          Dpt_Name: response.data.DepartmentName,
        },
        PurchaseType: {
          PurchaseTypeID: response.data.PurchaseTypeID,
          PurchaseType: response.data.PurchaseType,
        },
        Details: response.data.Details.map((item) => ({
          ...item,
          PRINVTypeID: {
            ClassID: item.ClassID,
            ClassName: item.ClassName,
          },
          PRCategoryID: {
            Inv_Cat_ID: item.Inv_Cat_ID,
            Inv_Cat_Name: item.Inv_Cat_Name,
          },
          PRSubCatID: {
            SubCat_ID: item.SubCat_ID,
            SubCat_Name: item.SubCat_Name,
          },
          ItemOpen: {
            ItemID: item.ItemID,
            ItemCode: item.Itemcode,
          },
          MRP: {
            MRPID: item.MRPID,
            MRPNo: item.MRPNo,
            MRPName: item.MRPNo,
          },
          CodeAndDescription: `[${item?.PDOItemCode}]  ${item?.PRItemDescription}`,
          ProductionOrderItem: {
            ItemID: item.PDOItemID,
            PDOItemName: item?.PDOItemName,
            Item_Code: item?.PDOItemCode,
            PRItemDescription: item?.PRItemDescription,
            CodeAndDescription: `[${item?.PDOItemCode}]  ${item?.PRItemDescription}`,
          },
          PRQty: item.PRQTY,
          PRCurrencyID: {
            Currency_ID: item.Currency_ID,
            // Currency_Code: response.data.Details[0].Currency_Code,
            Currency_Name: item.Currency_Name,
          },
          PRUOMID: {
            UOM_ID: item?.UOMID,
            UOMName: item?.UOMName,
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
            ? `Re-open PR #${currentData?.PRCode || ''}`
            : `Edit PR #${currentData?.PRCode || ''}`
        }`}
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Proforma Invoice',
            href: paths.dashboard.procurement.pr.root,
          },
          { name: isReapproval ? 'Re-open' : 'Edit' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <PrEditForm currentData={currentData} isReapproval={isReapproval} />}
    </Container>
  );
}

PrEditView.propTypes = {
  urlData: PropTypes.any,
};
