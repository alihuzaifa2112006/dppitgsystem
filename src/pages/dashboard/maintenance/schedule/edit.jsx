import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import CalendarView from 'src/sections/maintenance/schedule-calender/view/calendar-view';

// ----------------------------------------------------------------------

export default function MaintenanceScheduleEditPage() {
  const { scheduleID } = useParams();

  return (
    <>
      <Helmet>
        <title>Maintenance Schedule Edit</title>
      </Helmet>

      <CalendarView initialScheduleId={scheduleID || null} />
    </>
  );
}
