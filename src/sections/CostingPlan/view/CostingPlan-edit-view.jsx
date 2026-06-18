import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import CostingPlanEditForm from '../CostingPlan-edit';
import { useEffect, useState } from 'react';
import { Get } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function CostingPlanEditView({ urlData }) {
  const settings = useSettingsContext();
console.log(urlData);
  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const response = await Get(`CostingPlan/GetById/${urlData?.CostingPlanID}`);
  
      const d = response.data;
     
  
      const formattedData = {
        CostingPlanID: d.CostingPlanID,
        BlendTypeID: d.Blend_Type_ID,
        BlendTypeName: d.Blend_Type_Name,
  
        ClassID: d.ClassID,
        ClassName: d.ClassName,

        ColorFamilyID: d.ColorFamilyID,
        ColorFamilyName: d.ColorFamilyName,
  
        InvCatID: d.Inv_Cat_ID,
        InvCatName: d.Inv_Cat_Name,
  
        InvSubCatID: d.SubCat_ID,
        InvSubCatName: d.SubCat_Name,
  
        OriginID: d.Origin_ID,
        OriginName: d.Origin_Name,
  
        Price: d.price,
      };
      console.log(formattedData);
  
      setCurrentData(formattedData);
    };
  
  
    if (urlData?.CostingPlanID) fetch();
  }, [urlData]);
  


  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Material Price Edit"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'CostingPlan',
            href: paths.dashboard.AIPlans.CostingPlan.root,
          },
          { name: 'Update' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {/* {currentData && <CostingPlanEditForm currentData={currentData} />} */}
      <CostingPlanEditForm currentData={currentData}/>
    </Container>
  );
}

CostingPlanEditView.propTypes = {
  urlData: PropTypes.any,
};
