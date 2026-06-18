import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import ClaimSettlementForm from '../claim-settlement-form';

// ----------------------------------------------------------------------

export default function ClaimSettlementView({ urlData }) {

  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Claim Settlement"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Claim Audit',
            href: paths.dashboard.customerClaim.claimAudits.root,
          },
          { name: 'Claim Settlement' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ClaimSettlementForm urlData={urlData}/>
    </Container>
  );
}

ClaimSettlementView.propTypes = {
  urlData: PropTypes.any,
};
