import Calendar from '@fullcalendar/react'; // => request placed at the top
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import { useState, useEffect, useCallback, useMemo } from 'react';
import interactionPlugin from '@fullcalendar/interaction';
import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { alpha, darken, lighten, useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { isAfter, isBetween } from 'src/utils/format-time';

import { CALENDAR_COLOR_OPTIONS } from 'src/_mock/_calendar';
import { updateEvent, useGetEvents } from 'src/api/calendar';
import { Get } from 'src/api/apibasemethods';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

import { StyledCalendar } from '../styles';
import CalendarForm from '../calendar-form';
import { useEvent, useCalendar } from '../hooks';
import CalendarToolbar from '../calendar-toolbar';
import CalendarFilters from '../calendar-filters';
import CalendarFiltersResult from '../calendar-filters-result';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSearchParams } from 'src/routes/hooks';
import { info, error, primary, success, warning, secondary } from 'src/theme/palette';

// ----------------------------------------------------------------------

const defaultFilters = {
  colors: [],
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function CalendarView({ initialScheduleId = null } = {}) {
  const theme = useTheme();

  const settings = useSettingsContext();

  const smUp = useResponsive('up', 'sm');

  const openFilters = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);

  const { events, eventsLoading } = useGetEvents();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const searchParams = useSearchParams();
  const scheduleMstIDParam = searchParams.get('scheduleMstID');
  const effectiveScheduleId = initialScheduleId || scheduleMstIDParam;

  // Department, Section, Line states
  const [allDepartments, setAllDepartments] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [allLineNos, setAllLineNos] = useState([]);
  const [selectedDep, setSelectedDep] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [machines, setMachines] = useState([]);
  const [scheduleEvents, setScheduleEvents] = useState([]);
  const [pendingSelection, setPendingSelection] = useState(null);
  const dateError = isAfter(filters.startDate, filters.endDate);

  const handleSchedulesUpdate = useCallback((scheduleResponse) => {
    if (!scheduleResponse) {
      return;
    }

    const scheduleId = scheduleResponse?.ScheduleMst_ID;
    const schedules = scheduleResponse?.Schedules || [];

    const nextEvents = schedules.map((detail) => {
      const displayName = detail?.MachineName
        ? `${detail.MachineName}${detail?.MachineCode ? ` (${detail.MachineCode})` : ''}`
        : detail?.MachineCode || 'Machine';
      const eventColor = detail?.Color || CALENDAR_COLOR_OPTIONS[0];

      // Use alpha() instead of lighten() to avoid HSL conversion that can introduce color tints
      // The ::before pseudo-element will apply opacity 0.18 on top of this, so we use a higher alpha
      const backgroundColor = lighten(eventColor, 0.7);

      return {
        id: String(detail?.ScheduleDtl_ID || `${scheduleId}-${detail?.MachineID}`),
        scheduleMstId: scheduleId || null,
        ScheduleMst_ID: scheduleId || null,
        ScheduleDtl_ID: detail?.ScheduleDtl_ID || null,
        MachineID: detail?.MachineID || null,
        MachineName: detail?.MachineName || '',
        MachineCode: detail?.MachineCode || '',
        Machine: detail?.MachineID
          ? {
              MachineID: detail.MachineID,
              NameandCode: displayName,
            }
          : null,
        title: displayName,
        allDay: Boolean(detail?.AllDay),
        color: eventColor,
        backgroundColor,
        borderColor: eventColor,
        textColor: darken(eventColor, 0.2) || '#212B36',
        start: detail?.Start,
        end: detail?.End,
        Comments: detail?.Comments || '',
        Remarks: detail?.Remarks || '',
        DeptID: scheduleResponse?.DeptID || null,
        SectionID: scheduleResponse?.SectionID || null,
        LineID: scheduleResponse?.LineID || null,
      };
    });

    setScheduleEvents((prev) => {
      const filtered = scheduleId
        ? prev.filter((event) => event.scheduleMstId !== scheduleId)
        : prev;
      return schedules.length ? [...filtered, ...nextEvents] : filtered;
    });

    setPendingSelection({
      DeptID: scheduleResponse?.DeptID || null,
      SectionID: scheduleResponse?.SectionID || null,
      LineID: scheduleResponse?.LineID || null,
    });
  }, []);

  const {
    calendarRef,
    //
    view,
    date,
    //
    onDatePrev,
    onDateNext,
    onDateToday,
    onDropEvent,
    onChangeView,
    onSelectRange,
    onClickEvent,
    onResizeEvent,
    onInitialView,
    //
    openForm,
    onOpenForm,
    onCloseForm,
    //
    selectEventId,
    selectedRange,
    //
    onClickEventInFilters,
  } = useCalendar();

  useEffect(() => {
    onInitialView();
  }, [onInitialView]);

  // Fetch all departments
  const GetAllDepartments = useCallback(async () => {
    try {
      const res = await Get(
        `GetAllActiveInactiveDpt?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setAllDepartments(res.data?.Departments || []);
    } catch (r) {
      console.error(r);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    GetAllDepartments();
  }, [GetAllDepartments]);

  // Fetch sections based on selected department
  const FetchAllSectionsData = useCallback(async () => {
    if (selectedDep?.Dpt_ID) {
      try {
        const response = await Get(
          `GetSectionsByDept?deptId=${selectedDep?.Dpt_ID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setAllSections(response.data || []);
      } catch (e) {
        console.error(e);
      }
    } else {
      setAllSections([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, selectedDep]);

  useEffect(() => {
    FetchAllSectionsData();
    setSelectedSection(null);
    setSelectedLine(null);
  }, [selectedDep, FetchAllSectionsData]);

  // Fetch lines based on selected section
  const FetchAllLineNosData = useCallback(async () => {
    if (selectedSection?.SectionID) {
      try {
        const response = await Get(
          `GetAllLineNo?org=${userData?.userDetails?.orgId}&branch=${userData?.userDetails?.branchID}&sectionId=${selectedSection?.SectionID}`
        );
        setAllLineNos(response.data?.data || []);
      } catch (err) {
        console.error(err);
      }
    } else {
      setAllLineNos([]);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, selectedSection]);

  useEffect(() => {
    FetchAllLineNosData();
    setSelectedLine(null);
  }, [selectedSection, FetchAllLineNosData]);

  const selectedData = useMemo(
    () => ({
      DeptID: selectedDep?.Dpt_ID || null,
      SectionID: selectedSection?.SectionID || null,
      LineID: selectedLine?.LineID || null,
    }),
    [selectedDep, selectedSection, selectedLine]
  );

  const FetchMachines = useCallback(async () => {
    if (selectedData?.DeptID && selectedData?.SectionID && selectedData?.LineID) {
      try {
        const response = await Get(
          `GetAllMachinesByDeptSecID?deptId=${selectedData?.DeptID}&sectionId=${selectedData?.SectionID}&lineId=${selectedData?.LineID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );
        setMachines(response.data?.data || []);
      } catch (er) {
        console.error(er);
        setMachines([]);
      }
    } else {
      setMachines([]);
    }
  }, [
    selectedData?.DeptID,
    selectedData?.SectionID,
    selectedData?.LineID,
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
  ]);

  useEffect(() => {
    FetchMachines();
  }, [FetchMachines]);

  const fetchScheduleById = useCallback(
    async (scheduleId) => {
      if (!scheduleId || !userData?.userDetails?.orgId || !userData?.userDetails?.branchID) {
        return;
      }

      try {
        const response = await Get(
          `GetMachineScheduleByID?scheduleMstID=${scheduleId}&orgId=${userData.userDetails.orgId}&branchId=${userData.userDetails.branchID}`
        );
        const scheduleData = response?.data?.data;
        if (scheduleData) {
          handleSchedulesUpdate(scheduleData);
        }
      } catch (errr) {
        console.error(errr);
      }
    },
    [handleSchedulesUpdate, userData?.userDetails?.branchID, userData?.userDetails?.orgId]
  );

  useEffect(() => {
    if (effectiveScheduleId) {
      fetchScheduleById(effectiveScheduleId);
    }
  }, [fetchScheduleById, effectiveScheduleId]);

  useEffect(() => {
    if (!pendingSelection?.DeptID || !allDepartments.length) {
      return;
    }
    const match = allDepartments.find((dept) => dept?.Dpt_ID === pendingSelection.DeptID);
    if (match && selectedDep?.Dpt_ID !== match.Dpt_ID) {
      setSelectedDep(match);
    }
  }, [pendingSelection?.DeptID, allDepartments, selectedDep?.Dpt_ID]);

  useEffect(() => {
    if (!pendingSelection?.SectionID || !allSections.length) {
      return;
    }
    const match = allSections.find((section) => section?.SectionID === pendingSelection.SectionID);
    if (match && selectedSection?.SectionID !== match.SectionID) {
      setSelectedSection(match);
    }
  }, [pendingSelection?.SectionID, allSections, selectedSection?.SectionID]);

  useEffect(() => {
    if (!pendingSelection?.LineID || !allLineNos.length) {
      return;
    }
    const match = allLineNos.find((line) => line?.LineID === pendingSelection.LineID);
    if (match && selectedLine?.LineID !== match.LineID) {
      setSelectedLine(match);
    }
  }, [pendingSelection?.LineID, allLineNos, selectedLine?.LineID]);

  const combinedEvents = useMemo(() => [...events, ...scheduleEvents], [events, scheduleEvents]);

  const currentEvent = useEvent(combinedEvents, selectEventId, selectedRange, openForm);
  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const canReset = !!filters.colors.length || (!!filters.startDate && !!filters.endDate);

  const dataFiltered = applyFilter({
    inputData: combinedEvents,
    filters,
    dateError,
  });


  const renderResults = (
    <CalendarFiltersResult
      filters={filters}
      onFilters={handleFilters}
      //
      canReset={canReset}
      onResetFilters={handleResetFilters}
      //
      results={dataFiltered.length}
      sx={{ mb: { xs: 3, md: 5 } }}
    />
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        {/* <Typography variant="h4">Maintenance Schedule Calendar</Typography> */}
        <CustomBreadcrumbs
          heading="Maintenance Schedule Calendar"
          links={[
            {
              name: 'Home',
              href: paths.dashboard.root,
            },
            {
              name: 'Maintenance Schedule',
              href: paths.dashboard.Production.maintenance.schedule.root,
            },
            { name: 'Maintenance Schedule Calendar' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={onOpenForm}
              color="primary"
            >
              New Schedule
            </Button>
          }
        />
        {/* </Stack> */}

        {canReset && renderResults}

        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid xs={12} sm={4}>
              <Autocomplete
                fullWidth
                options={allDepartments}
                getOptionLabel={(option) => option?.Dpt_Name || ''}
                isOptionEqualToValue={(option, value) => option?.Dpt_ID === value?.Dpt_ID}
                value={selectedDep}
                onChange={(event, newValue) => {
                  setSelectedDep(newValue);
                }}
                renderInput={(params) => <TextField {...params} label="Department" />}
              />
            </Grid>
            <Grid xs={12} sm={4}>
              <Autocomplete
                fullWidth
                options={allSections}
                getOptionLabel={(option) => option?.SectionName || ''}
                isOptionEqualToValue={(option, value) => option?.SectionID === value?.SectionID}
                value={selectedSection}
                onChange={(event, newValue) => {
                  setSelectedSection(newValue);
                }}
                disabled={!selectedDep?.Dpt_ID}
                renderInput={(params) => <TextField {...params} label="Section" />}
              />
            </Grid>
            <Grid xs={12} sm={4}>
              <Autocomplete
                fullWidth
                options={allLineNos}
                getOptionLabel={(option) => option?.LineNo || ''}
                isOptionEqualToValue={(option, value) => option?.LineID === value?.LineID}
                value={selectedLine}
                onChange={(event, newValue) => {
                  setSelectedLine(newValue);
                }}
                disabled={!selectedSection?.SectionID}
                renderInput={(params) => <TextField {...params} label="Line No" />}
              />
            </Grid>
          </Grid>
        </Card>

        <Card>
          <StyledCalendar>
            <CalendarToolbar
              date={date}
              view={view}
              loading={eventsLoading}
              onNextDate={onDateNext}
              onPrevDate={onDatePrev}
              onToday={onDateToday}
              onChangeView={onChangeView}
              onOpenFilters={openFilters.onTrue}
            />

            <Calendar
              // weekends
              editable={false}
              droppable={false}
              selectable
              rerenderDelay={10}
              allDayMaintainDuration
              eventResizableFromStart={false}
              ref={calendarRef}
              initialDate={date}
              initialView={view}
              dayMaxEventRows={3}
              eventDisplay="block"
              events={dataFiltered}
              headerToolbar={false}
              select={onSelectRange}
              eventClick={onClickEvent}
              height={smUp ? 720 : 'auto'}
              // eventDrop={(arg) => {
              //   onDropEvent(arg, updateEvent);
              // }}
              // eventResize={(arg) => {
              //   onResizeEvent(arg, updateEvent);
              // }}
              plugins={[
                listPlugin,
                dayGridPlugin,
                timelinePlugin,
                timeGridPlugin,
                interactionPlugin,
              ]}
            />
          </StyledCalendar>
        </Card>
      </Container>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={openForm}
        onClose={onCloseForm}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
      >
        <DialogTitle sx={{ minHeight: 76 }}>
          {openForm && <> {currentEvent?.id ? 'Edit Event' : 'Add Event'}</>}
        </DialogTitle>

        <CalendarForm
          currentEvent={currentEvent}
          colorOptions={CALENDAR_COLOR_OPTIONS}
          onClose={onCloseForm}
          machines={machines}
          selectedData={selectedData}
          onSchedulesUpdate={handleSchedulesUpdate}
          date={date}
          effectiveScheduleId={effectiveScheduleId}
        />
      </Dialog>

      <CalendarFilters
        open={openFilters.value}
        onClose={openFilters.onFalse}
        //
        filters={filters}
        onFilters={handleFilters}
        //
        canReset={canReset}
        onResetFilters={handleResetFilters}
        //
        dateError={dateError}
        //
        events={events}
        colorOptions={CALENDAR_COLOR_OPTIONS}
        onClickEvent={onClickEventInFilters}
      />
    </>
  );
}

CalendarView.propTypes = {
  initialScheduleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// ----------------------------------------------------------------------

function applyFilter({ inputData, filters, dateError }) {
  const { colors, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  inputData = stabilizedThis.map((el) => el[0]);

  if (colors.length) {
    inputData = inputData.filter((event) => colors.includes(event.color));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((event) => isBetween(event.start, startDate, endDate));
    }
  }

  return inputData;
}
