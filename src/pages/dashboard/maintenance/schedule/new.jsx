import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import CalendarView from 'src/sections/maintenance/schedule-calender/view/calendar-view';

// ----------------------------------------------------------------------

export default function MaintenanceScheduleNewPage() {
  return (
    <>
      <Helmet>
        <title> Maintenance Schedule Add</title>
      </Helmet>

      <CalendarView />
    </>
  );
}
