import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import ApprovalEditForm from '../approval-edit';
import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function ApprovalEditView({ urlData }) {
  const [currentApproval, setCurrentApproval] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const settings = useSettingsContext();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await Get(
        `GetDocApprovalSetupById?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}&Doc_ID=${urlData?.id}`
      );

      setCurrentApproval(res.data);
      setLoading(false);
    };
    fetch();
  }, [urlData, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Document Approval"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Document Approval',
            href: paths.dashboard.admin.docApproval.root,
          },
          { name: 'Edit ' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {isLoading ? <LoadingScreen /> : <ApprovalEditForm currentApproval={currentApproval} />}
    </Container>
  );
}

ApprovalEditView.propTypes = {
  urlData: PropTypes.any,
};
