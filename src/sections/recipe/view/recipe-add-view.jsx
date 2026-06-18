import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import AccountGeneralAdd from '../recipe-add'

// ----------------------------------------------------------------------

export default function RecipeAddView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Recipe"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Recipe', href: paths.dashboard.rdLab.recipe.root },
          { name: 'Add' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <AccountGeneralAdd />
    </Container>
  );
}
