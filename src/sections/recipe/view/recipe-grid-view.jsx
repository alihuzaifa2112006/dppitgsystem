import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import RecipeGrid from '../recipe-grid';
import { Box } from '@mui/system';
import { Button } from '@mui/material';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export default function RecipeGridView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Recipe"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Recipe', href: paths.dashboard.rdLab.recipe.root },
          //   { name: 'Add' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
        action={
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {/* <Button
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:file-import-line" />}
                  color="primary"
                  onClick={handleUploadDialogOpen}
                >
                  Import Excel
                </Button> */}
            <Button
              component={RouterLink}
              href={paths.dashboard.rdLab.recipe.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              color="primary"
            >
              Add Recipe
            </Button>
          </Box>
        }
      />

      <RecipeGrid />
    </Container>
  );
}
