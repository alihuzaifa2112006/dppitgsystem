import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { Get } from 'src/api/apibasemethods';
import DispoderEditForm from '../ProductionBucket-edit';
import { formatDate } from '@fullcalendar/core';

// ----------------------------------------------------------------------

export default function ProductionBucketEditView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [currentData, setCurrentData] = useState(null);

  const idFromURL = urlData?.ProductionBucketID;
  const fetchItemData = useCallback(async () => {
    try {
      const response = await Get(
        `InvItemDBGetById?ItemID=${idFromURL}&Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );

      const formatedData = {
        ...response?.data,
        Inv_Types_ID: response?.data?.InvTypesID || null,
        Inv_Cat_ID: response?.data?.InvCatID || null,
        SaftyQuantity: response?.data?.SafetyStockQty || null,
        ReorderQuantity: response?.data?.ReOrderQty || null,
        ColorID: response?.data?.ColorID || null,
        UOMID: response?.data?.UOMID || null,
        // All Field From APis
        ItemID: response?.data?.ItemID,
        ItemDescription: response?.data?.ItemDescription,
        ItemSpecificationID: response?.data?.ItemSpecificationID,
        SpecificationName: response?.data?.SpecificationName,
        InvTypeName: response?.data?.InvTypeName,
        CategoryName: response?.data?.CategoryName,
        SubCatID: response?.data?.SubCatID,
        SubCategoryName: response?.data?.SubCategoryName,
        MaterialTypeID: response?.data?.MaterialTypeID,
        MaterialTypeName: response?.data?.MaterialTypeName,
        ColorFamilyID: response?.data?.ColorFamilyID,
        ColorFamily: response?.data?.ColorFamily,
        Color: response?.data?.Color,
        LoopID: response?.data?.LoopID,
        UOM: response?.data?.UOM,
        Org_Id: response?.data?.Org_Id,
        Branch_Id: response?.data?.Branch_Id,
        Created_By: response?.data?.Created_By,
        Created_On: response?.data?.Created_On,
        Updated_By: response?.data?.Updated_By,
        Updated_On: response?.data?.Updated_On,
        Is_Active: response?.data?.Is_Active,
        IsDeleted: response?.data?.IsDeleted,
        ReOrderQty: response?.data?.ReOrderQty,
        SafetyStockQty: response?.data?.SafetyStockQty,
        YarnTypeID: response?.data?.YarnTypeID,
        YarnCountID: response?.data?.YarnCountID,
        YarnCompositionID: response?.data?.YarnCompositionID,
      };

      setCurrentData(formatedData || null);
    } catch (error) {
      console.error('Error fetching item data:', error);
    }
  }, [idFromURL, userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

  useEffect(() => {
    if (idFromURL) {
      fetchItemData();
    }
  }, [idFromURL, fetchItemData]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="AI Bucket"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'AI Bucket',
            href: paths.dashboard.Production.Planning.ProductionBucket.root,
          },
          { name: 'Edit' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <DispoderEditForm currentData={currentData} />}
    </Container>
  );
}

ProductionBucketEditView.propTypes = {
  urlData: PropTypes.any,
};
