import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { OpportunityListView } from 'src/sections/opportunity/view';
import MaintenanceScheduleGridView from 'src/sections/maintenance/schedule-calender/view/maintenance-schedule-grid-view';

// ----------------------------------------------------------------------

export default function MaintenanceScheduleListPage() {
  return (
    <>
      <Helmet>
        <title> Maintenance Schedule View</title>
      </Helmet>

      {/* <OpportunityListView /> */}
      <MaintenanceScheduleGridView />
    </>
  );
}
