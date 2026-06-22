import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { Typography, Box, Card, CardContent, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

import { useSettingsContext } from 'src/components/settings';

// ─── Colour tokens ────────────────────────────────────────────────────────────
const CLR = {
  blue: '#378ADD',
  blueLight: '#B5D4F4',
  bluePale: '#E6F1FB',
  green: '#1D9E75',
  greenL: '#9FE1CB',
  amber: '#EF9F27',
  red: '#D85A30',
  gray: '#B4B2A9',
};

// ─── Static dummy data ────────────────────────────────────────────────────────
const TREND_DATA = [
  { month: 'Jan', Published: 280, Drafted: 180 },
  { month: 'Feb', Published: 340, Drafted: 220 },
  { month: 'Mar', Published: 390, Drafted: 310 },
  { month: 'Apr', Published: 510, Drafted: 380 },
  { month: 'May', Published: 680, Drafted: 420 },
  { month: 'Jun', Published: 924, Drafted: 378 },
];

const STATUS_DATA = [
  { name: 'Published', value: 1924, color: CLR.green },
  { name: 'Under Review', value: 318, color: CLR.amber },
  { name: 'Draft', value: 378, color: CLR.blue },
  { name: 'Validation Failed', value: 227, color: CLR.red },
];

const QUALITY_DATA = [
  { name: 'Tensile Strength', Passed: 76, Failed: 12 },
  { name: 'Composition', Passed: 85, Failed: 8 },
  { name: 'Color Fastness', Passed: 64, Failed: 14 },
  { name: 'Chemical Trace', Passed: 91, Failed: 3 },
  { name: 'Yarn Quality', Passed: 58, Failed: 11 },
];

const READINESS_DOMAINS = [
  { label: 'Product identity', value: 100, color: CLR.blue },
  { label: 'Composition', value: 95, color: CLR.blue },
  { label: 'Certificates', value: 90, color: CLR.green },
  { label: 'Traceability', value: 82, color: CLR.green },
  { label: 'Chemical compliance', value: 74, color: CLR.amber },
  { label: 'Environmental data', value: 68, color: CLR.amber },
  { label: 'Circularity', value: 51, color: CLR.red },
];

const COUNTRIES = [
  { flag: '🇩🇪', name: 'Germany', count: 412 },
  { flag: '🇫🇷', name: 'France', count: 367 },
  { flag: '🇬🇧', name: 'United Kingdom', count: 298 },
  { flag: '🇮🇹', name: 'Italy', count: 241 },
  { flag: '🇳🇱', name: 'Netherlands', count: 189 },
  { flag: '🇪🇸', name: 'Spain', count: 156 },
  { flag: '🇧🇪', name: 'Belgium', count: 98 },
];

const SUPPLIER_DATA = [
  { tier: 'Tier 1 — Garment', Submitted: 94, Pending: 6 },
  { tier: 'Tier 2 — Fabric', Submitted: 78, Pending: 22 },
  { tier: 'Tier 3 — Yarn', Submitted: 61, Pending: 39 },
  { tier: 'Tier 4 — Fibre', Submitted: 43, Pending: 57 },
];

const CERTIFICATES = [
  { name: 'GOTS Organic — Mill A', days: 7, status: 'Critical' },
  { name: 'OEKO-TEX 100 — Supplier B', days: 18, status: 'Warning' },
  { name: 'ISO 14001 — Factory C', days: 24, status: 'Warning' },
  { name: 'Fair Trade — Supplier D', days: 45, status: 'OK' },
  { name: 'Bluesign — Mill E', days: 62, status: 'OK' },
];

const ENV_DATA = [
  { category: 'Womenswear', Carbon: 82, Water: 74, Energy: 61 },
  { category: 'Menswear', Carbon: 79, Water: 68, Energy: 55 },
  { category: 'Kidswear', Carbon: 71, Water: 63, Energy: 50 },
  { category: 'Accessories', Carbon: 65, Water: 52, Energy: 41 },
  { category: 'Footwear', Carbon: 58, Water: 44, Energy: 37 },
];

const RADAR_DATA = [
  { subject: 'Material data', Current: 92, Target: 100 },
  { subject: 'Chemical safety', Current: 74, Target: 100 },
  { subject: 'Traceability', Current: 82, Target: 100 },
  { subject: 'Carbon footprint', Current: 68, Target: 100 },
  { subject: 'Circularity', Current: 51, Target: 100 },
  { subject: 'Packaging', Current: 79, Target: 100 },
];

// ─── Cert badge colours ───────────────────────────────────────────────────────
const CERT_COLORS = {
  Critical: { bg: '#FCEBEB', color: '#A32D2D' },
  Warning: { bg: '#FAEEDA', color: '#854F0B' },
  OK: { bg: '#EAF3DE', color: '#3B6D11' },
};

const STATUS_CHIP_STYLES = {
  'Published': { bg: '#EAF3DE', label: '#3B6D11', val: '#27500A' },
  'Under Review': { bg: '#FAEEDA', label: '#854F0B', val: '#633806' },
  'Draft': { bg: '#E6F1FB', label: '#185FA5', val: '#0C447C' },
  'Validation Failed': { bg: '#FCEBEB', label: '#A32D2D', val: '#791F1F' },
};

// ─── Small reusable components ────────────────────────────────────────────────

function KpiCard({ label, value, sub, subColor }) {
  return (
    <Card
      elevation={0}
      sx={{ border: '0.5px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={500}>{value}</Typography>
        {sub && (
          <Typography variant="caption" sx={{ color: subColor || 'text.secondary' }}>
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  sub: PropTypes.string,
  subColor: PropTypes.string,
};
KpiCard.defaultProps = { sub: '', subColor: '' };

// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({ title, subheader, children, sx }) {
  return (
    <Card
      elevation={0}
      sx={{ border: '0.5px solid', borderColor: 'divider', borderRadius: 2, height: '100%', ...sx }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {title && <Typography variant="subtitle2" fontWeight={500} mb={0.25}>{title}</Typography>}
        {subheader && (
          <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
            {subheader}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
SectionCard.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  children: PropTypes.node.isRequired,
  sx: PropTypes.object,
};
SectionCard.defaultProps = { title: '', subheader: '', sx: {} };

// ─────────────────────────────────────────────────────────────────────────────

function ChartLegend({ items }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
      {items.map((item) => (
        <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <Box sx={{ width: 9, height: 9, borderRadius: '2px', background: item.color, flexShrink: 0 }} />
          <Typography variant="caption" color="text.secondary">{item.label}</Typography>
        </Box>
      ))}
    </Box>
  );
}
ChartLegend.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, color: PropTypes.string })
  ).isRequired,
};

// ─────────────────────────────────────────────────────────────────────────────

function CertRow({ name, days, status }) {
  const { bg, color } = CERT_COLORS[status] || CERT_COLORS.OK;
  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, py: 1,
        borderBottom: '0.5px solid', borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box
        sx={{
          width: 28, height: 28, borderRadius: '50%', background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 14,
        }}
      >
        📋
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" fontWeight={500} display="block" noWrap>{name}</Typography>
        <Typography variant="caption" color="text.secondary">Expires in {days} days</Typography>
      </Box>
      <Box sx={{ px: 1, py: 0.25, borderRadius: 1, background: bg, flexShrink: 0 }}>
        <Typography variant="caption" sx={{ color, fontWeight: 500 }}>{status}</Typography>
      </Box>
    </Box>
  );
}
CertRow.propTypes = {
  name: PropTypes.string.isRequired,
  days: PropTypes.number.isRequired,
  status: PropTypes.oneOf(['Critical', 'Warning', 'OK']).isRequired,
};

// ─────────────────────────────────────────────────────────────────────────────

function StatusChip({ name, value }) {
  const s = STATUS_CHIP_STYLES[name] || {};
  return (
    <Box
      sx={{
        p: '8px 12px', borderRadius: 1.5, background: s.bg,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}
    >
      <Typography variant="caption" sx={{ color: s.label }}>{name}</Typography>
      <Typography variant="subtitle2" sx={{ color: s.val }}>{value.toLocaleString()}</Typography>
    </Box>
  );
}
StatusChip.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
};

// ─── Custom Recharts tooltip ──────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <Box
      sx={{
        background: 'background.paper', border: '0.5px solid', borderColor: 'divider',
        borderRadius: 1.5, p: 1.5, fontSize: 12,
      }}
    >
      <Typography variant="caption" fontWeight={500} display="block" mb={0.5}>{label}</Typography>
      {payload.map((p) => (
        <Box key={p.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '1px', background: p.color }} />
          <Typography variant="caption" color="text.secondary">{p.name}:</Typography>
          <Typography variant="caption" fontWeight={500}>{p.value}{p.unit || ''}</Typography>
        </Box>
      ))}
    </Box>
  );
}
CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
};
CustomTooltip.defaultProps = { active: false, payload: [], label: '' };

// ─────────────────────────────────────────────────────────────────────────────

function PctTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <Box
      sx={{
        background: 'background.paper', border: '0.5px solid', borderColor: 'divider',
        borderRadius: 1.5, p: 1.5, fontSize: 12,
      }}
    >
      <Typography variant="caption" fontWeight={500} display="block" mb={0.5}>{label}</Typography>
      {payload.map((p) => (
        <Box key={p.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '1px', background: p.color }} />
          <Typography variant="caption" color="text.secondary">{p.name}:</Typography>
          <Typography variant="caption" fontWeight={500}>{p.value}%</Typography>
        </Box>
      ))}
    </Box>
  );
}
PctTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
};
PctTooltip.defaultProps = { active: false, payload: [], label: '' };

// ─── Main view ────────────────────────────────────────────────────────────────

export default function OverviewAppView() {
  const settings = useSettingsContext();
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const maxCountry = COUNTRIES[0].count;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={2.5}>

        {/* ── KPI cards ── */}
        <Grid xs={12} sm={6} md={3}>
          <KpiCard label="Total passports" value="2,847" sub="↑ 12% this month" subColor={CLR.green} />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <KpiCard label="Published" value="1,924" sub="↑ 8% vs last month" subColor={CLR.green} />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <KpiCard label="Avg readiness" value="87%" sub="↑ 3 pts this quarter" subColor={CLR.green} />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <KpiCard label="Pending approval" value="318" sub="↑ 24 from last week" subColor={CLR.red} />
        </Grid>

        {/* ── Trend line ── */}
        <Grid xs={12} md={7}>
          <SectionCard title="Passport publication trend" subheader="Monthly published vs drafted passports">
            <ChartLegend items={[
              { label: 'Published', color: CLR.blue },
              { label: 'Drafted', color: CLR.green },
            ]} />
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Published" stroke={CLR.blue} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Drafted" stroke={CLR.green} strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </SectionCard>
        </Grid>

        {/* ── Status donut ── */}
        <Grid xs={12} md={5}>
          <SectionCard title="Passport status breakdown" subheader="Current distribution across lifecycle states">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <ResponsiveContainer width={170} height={170}>
                <PieChart>
                  <Pie
                    data={STATUS_DATA}
                    cx="50%" cy="50%"
                    innerRadius={52} outerRadius={78}
                    dataKey="value" strokeWidth={0}
                  >
                    {STATUS_DATA.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => v.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, flex: 1, minWidth: 180 }}>
                {STATUS_DATA.map((s) => (
                  <StatusChip key={s.name} name={s.name} value={s.value} />
                ))}
              </Box>
            </Box>
          </SectionCard>
        </Grid>

        {/* ── Quality bar ── */}
        <Grid xs={12} md={6}>
          <SectionCard title="Quality checkpoints analysis" subheader="Pass vs fail on physical compliance checks">
            <ChartLegend items={[
              { label: 'Passed', color: CLR.green },
              { label: 'Failed', color: CLR.red },
            ]} />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={QUALITY_DATA} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                  axisLine={false} tickLine={false} domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Passed" fill={CLR.green} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Failed" fill={CLR.red} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </Grid>

        {/* ── Readiness progress ── */}
        <Grid xs={12} md={6}>
          <SectionCard title="Data readiness by domain" subheader="Completion across key DPP data areas">
            <Box mt={1}>
              {READINESS_DOMAINS.map(({ label, value, color }) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.25 }}>
                  <Typography
                    variant="caption" color="text.secondary"
                    sx={{ width: 145, flexShrink: 0 }}
                  >
                    {label}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={value}
                    sx={{
                      flex: 1, height: 7, borderRadius: 4,
                      backgroundColor: theme.palette.action.hover,
                      '& .MuiLinearProgress-bar': { backgroundColor: color, borderRadius: 4 },
                    }}
                  />
                  <Typography
                    variant="caption" fontWeight={500}
                    sx={{ width: 34, textAlign: 'right', color: 'text.primary' }}
                  >
                    {value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </SectionCard>
        </Grid>

        {/* ── Countries ── */}
        <Grid xs={12} md={4}>
          <SectionCard title="Global passport distribution" subheader="Products by market country">
            <Box mt={0.5}>
              {COUNTRIES.map(({ flag, name, count }) => (
                <Box key={name} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                  <Typography fontSize={18} lineHeight={1} width={24}>{flag}</Typography>
                  <Typography variant="caption" sx={{ flex: 1 }}>{name}</Typography>
                  <Typography
                    variant="caption" fontWeight={500} color="text.secondary"
                    sx={{ width: 28, textAlign: 'right' }}
                  >
                    {count}
                  </Typography>
                  <Box sx={{ width: 56, height: 5, borderRadius: 3, background: theme.palette.action.hover, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${(count / maxCountry) * 100}%`,
                        height: '100%', background: CLR.blue, borderRadius: 3,
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </SectionCard>
        </Grid>

        {/* ── Supplier bar ── */}
        <Grid xs={12} md={4}>
          <SectionCard title="Supplier response rate" subheader="Data submission completion by tier">
            <ChartLegend items={[
              { label: 'Submitted', color: CLR.blue },
              { label: 'Pending', color: CLR.blueLight },
            ]} />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={SUPPLIER_DATA} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                <XAxis
                  type="number" domain={[0, 100]}
                  tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category" dataKey="tier" width={115}
                  tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<PctTooltip />} />
                <Bar dataKey="Submitted" stackId="a" fill={CLR.blue} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Pending" stackId="a" fill={CLR.blueLight} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </Grid>

        {/* ── Certificate tracker ── */}
        <Grid xs={12} md={4}>
          <SectionCard title="Certificate expiry tracker" subheader="Upcoming certificate renewals">
            <Box mt={0.5}>
              {CERTIFICATES.map((cert) => (
                <CertRow key={cert.name} {...cert} />
              ))}
            </Box>
          </SectionCard>
        </Grid>

        {/* ── Environmental coverage ── */}
        <Grid xs={12} md={7}>
          <SectionCard
            title="Environmental footprint coverage"
            subheader="Carbon, water & energy data availability across product portfolio"
          >
            <ChartLegend items={[
              { label: 'Carbon data', color: CLR.blue },
              { label: 'Water data', color: CLR.green },
              { label: 'Energy data', color: CLR.amber },
            ]} />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ENV_DATA} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                  axisLine={false} tickLine={false} domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<PctTooltip />} />
                <Bar dataKey="Carbon" fill={CLR.blue} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Water" fill={CLR.green} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Energy" fill={CLR.amber} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </Grid>

        {/* ── Radar ── */}
        <Grid xs={12} md={5}>
          <SectionCard
            title="Regulatory compliance by region"
            subheader="ESPR readiness score across EU dimensions"
          >
            <ChartLegend items={[
              { label: 'Current readiness', color: CLR.blue },
              { label: 'Target', color: CLR.gray },
            ]} />
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke={theme.palette.divider} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                />
                <PolarRadiusAxis
                  angle={30} domain={[0, 100]}
                  tick={{ fontSize: 9, fill: theme.palette.text.secondary }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Radar
                  name="Current readiness" dataKey="Current"
                  stroke={CLR.blue} fill={CLR.blue} fillOpacity={0.12}
                  strokeWidth={2} dot={{ r: 3 }}
                />
                <Radar
                  name="Target" dataKey="Target"
                  stroke={CLR.gray} fill={CLR.gray} fillOpacity={0.04}
                  strokeWidth={1} strokeDasharray="4 3"
                />
                <Tooltip formatter={(v) => `${v}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </SectionCard>
        </Grid>

        {/* ── Footer ── */}
        <Grid xs={12} sx={{ textAlign: 'center', mt: 2, mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Copyright © {currentYear} Interactive Technologies Gateway. All Rights Reserved.
          </Typography>
        </Grid>

      </Grid>
    </Container>
  );
}