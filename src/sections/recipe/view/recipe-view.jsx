import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

// import AccountGeneral from '../agency-edit';
import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Get } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';
import RecipeEdit from '../recipe-edit';

// ----------------------------------------------------------------------

export default function RecipeView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [isLoading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState();

  useEffect(() => {
    const fetch = async () => {
      const res = await Get(`Production/GetRecipeByID?RecipeID=${urlData?.recipeID}`);
      if (res.status === 200) {
        const data = {
          ...res.data,
          RevisionNo: parseInt(res.data.RevisionNo, 10),
          buyer: {
            End_Cust_ID: res.data.BuyerID,
            End_Cust_Name: res.data.BuyerName,
          },
          colorFamily: {
            ColorFamilyID: res.data.ColorFamilyID,
            ColorFamilyName: res.data.ColorFamilyName,
          },
          Composition: {
            Composition_ID: res.data.CompositionID,
            Composition_Name: res.data.Composition_Name,
          },
          CreationDate: new Date(res.data.CreationDate),
          RevisionDate: new Date(res.data.RevisionDate),
          customer: {
            WIC_ID: res.data?.CustomerID,
            WIC_Name: res.data?.Cust_Name,
          },
          goalcolor: {
            ColorID: res.data?.FinalGoalColorID,
            Color_and_Code: res.data?.FinalGoalColorName,
          },
          sample: {
            Sample_Request_ID: res.data?.SampleID,
            Sample_Code: res.data?.Sample_Code,
          },
          LabTechnician: {
            UserId: res.data?.TechUserID,
            UserName: res.data?.TechUserName,
          },
          yarnCount: {
            Yarn_Count_ID: res.data?.YarnCountID,
            Yarn_Count_Name: res.data?.Yarn_Count_Name,
          },
          yarnType: {
            Yarn_Type_ID: res.data?.YarnTypeID,
            Yarn_Type: res.data?.Yarn_Type,
          },
          Details: res.data?.Details.map((detail) => ({
            ...detail,
            colorPicture: detail?.ColorPictureURL,
            remarks: detail?.Remarks,
            class: {
              ClassID: detail?.InvTypeID,
              ClassName: detail?.ClassName,
            },
            category: {
              Inv_Cat_ID: detail?.CategoryID,
              Inv_Cat_Name: detail?.CategoryName,
            },
            subCategory: {
              SubCat_ID: detail?.SubCategoryID,
              SubCat_Name: detail?.SubCategoryName,
            },
            color: {
              ColorID: detail?.ColorID,
              Color_and_Code: detail?.ColorName,
            },
            item: {
              ItemID: detail?.ItemID,
              ItemDescription: detail?.ItemDescription,
              ItemCode: detail?.ItemCode,
            },
            hex: detail?.RmLotNo,
            percentage: detail?.RequiredPercentage,
          })),
        };
        setCurrentData(data);

        // console.log(data, 'data');
      }
      setLoading(false);
    };
    fetch();
  }, [urlData?.recipeID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Recipe"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Recipe', href: paths.dashboard.rdLab.recipe.root },
          { name: 'Edit' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {isLoading ? (
        <LoadingScreen
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
          }}
        />
      ) : (
        <RecipeEdit currentData={currentData} />
      )}
    </Container>
  );
}

RecipeView.propTypes = {
  urlData: PropTypes.any,
};
