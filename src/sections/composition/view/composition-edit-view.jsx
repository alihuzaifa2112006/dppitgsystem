import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import CompositionEditForm from '../composition-edit';
import { useEffect, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function CompositionEditView({ urlData }) {
  const [currentComposition, setCurrentComposition] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const settings = useSettingsContext();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await Get(`yarncomposition/GetCompositionWithDetails/${urlData?.compositionID}`);
      const resData = {
        ...res.data.Data,
        Details: res.data.Data.Details.filter((x) => x.Blend_Ratio_Percentage !== 0).map(
          (item) => ({
            ...item,
            Ratio: item?.Blend_Ratio_Percentage,
            BlendName: {
              Blend_Names: item?.Blend_Names,
              Blend_Name_ID: item?.Blend_Name_ID,
            },
            BlendType: {
              Blend_Type_ID: item?.Blend_Type_ID,
              Value: item?.Blend_Type_Name,
            },
            id: item?.CompositionDtlID,
          })
        ),
      };
      setCurrentComposition(resData);
      setLoading(false);
    };
    fetch();
  }, [urlData]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Yarn Composition"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Yarn Composition',
            href: paths.dashboard.productManagement.composition.root,
          },
          { name: 'Edit ' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <CompositionEditForm currentComposition={currentComposition} />
      )}
    </Container>
  );
}

CompositionEditView.propTypes = {
  urlData: PropTypes.any,
};
