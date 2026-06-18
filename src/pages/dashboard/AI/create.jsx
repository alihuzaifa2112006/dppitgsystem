import { Box, Container } from '@mui/system';
import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
// import { ItemIssueGridView } from 'src/sections/ItemIssue/view';

// ----------------------------------------------------------------------

export default function AIPlaning() {
  const settings = useSettingsContext();
  return (
    <>
      <Helmet>
        <title>AI Planing</title>
      </Helmet>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="AI Planing"
          links={[
            {
              name: 'Home',
              href: paths.dashboard.root,
            },
            {
              name: 'AI Planing',
              href: paths.dashboard.AIPlans.root,
            },
            { name: 'Create' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Box
          sx={{
            width: '100%',
            height: '100vh',
          }}
        >
          <iframe
            src="https://cyclo-ai-planner-itg.streamlit.app?embedded=true"
            title="Streamlit App"
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            style={{ borderRadius: '12px' }}
          />
        </Box>
      </Container>
    </>
  );
}
