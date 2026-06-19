import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import Iconify from 'src/components/iconify';

// Hardcoded colors
const PRIMARY = '#103996';
const PRIMARY_LIGHT = '#1a4bb5';
const PRIMARY_DARK = '#0c2a6e';

/* eslint-disable react/no-unescaped-entities */

// ----------------------------------------------------------------------
// Keyframe animations
// ----------------------------------------------------------------------

const floatY = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-14px); }
`;

const floatYSlow = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-22px); }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50% { opacity: 0.75; transform: scale(1.08); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// ----------------------------------------------------------------------
// Reveal-on-scroll wrapper
// ----------------------------------------------------------------------

function Reveal({ children, delay = 0, y = 28, sx = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

Reveal.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  y: PropTypes.number,
  sx: PropTypes.object,
};

Reveal.defaultProps = {
  delay: 0,
  y: 28,
  sx: {},
};

// ----------------------------------------------------------------------

export default function LandingPage() {
  const router = useRouter();

  const handleNavigate = (path) => {
    router.push(path);
  };

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 900) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // -- Data -------------------------------------------------------------

  const navLinks = [
    { label: 'Platform', id: 'platform' },
    { label: 'How it works', id: 'how-it-works' },
    { label: 'Modules', id: 'modules' },
    { label: 'Industries', id: 'industries' },
    { label: 'FAQ', id: 'faq' },
  ];

  const trustStats = [
    { value: '24', label: 'Configurable modules', icon: 'solar:widget-5-bold-duotone' },
    { value: 'Tier 1–4', label: 'Supply-chain depth', icon: 'solar:routing-2-bold-duotone' },
    { value: '100%', label: 'Evidence-linked claims', icon: 'solar:verified-check-bold-duotone' },
    { value: 'ESPR + PPWR', label: 'Regulation packs', icon: 'solar:shield-keyhole-bold-duotone' },
  ];

  const capabilities = [
    {
      icon: 'solar:settings-bold-duotone',
      title: 'Configurable, not hardcoded',
      description:
        'Regulation packs, fields, validation rules and access policies are administrator-configurable. Publish a new schema without rebuilding the platform.',
      color: PRIMARY,
    },
    {
      icon: 'solar:documents-bold-duotone',
      title: 'Evidence-based by design',
      description:
        'Every material, sustainability and compliance claim links to a document, calculation, certificate or verified source — with full provenance.',
      color: '#0288d1',
    },
    {
      icon: 'solar:plug-circle-bold-duotone',
      title: 'Interoperable & open',
      description:
        'Structured APIs, open identifiers and machine-readable output integrate cleanly with your ERP, PLM, ESG and certification systems.',
      color: '#2e7d32',
    },
    {
      icon: 'solar:history-bold-duotone',
      title: 'Immutable & auditable',
      description:
        'Published passports are versioned snapshots. Corrections create a new version — history is never silently overwritten.',
      color: '#ed6c02',
    },
  ];

  const moduleGroups = [
    {
      no: '01',
      icon: 'solar:shield-network-bold-duotone',
      title: 'Platform & Regulatory Foundation',
      description:
        'Versioned regulation packs, economic-operator profiles and policy-based access control that survive changing rules and industries.',
      points: ['Regulatory configuration', 'Organisation & operators', 'Roles & access control'],
      color: PRIMARY,
    },
    {
      no: '02',
      icon: 'solar:box-bold-duotone',
      title: 'Product & Supply-Chain Data',
      description:
        'The traceability backbone — product hierarchy, bills of materials, supplier and facility mapping, and full chain-of-custody events.',
      points: ['SKU & variant master', 'Material & packaging BOM', 'Multi-tier traceability'],
      color: '#0288d1',
    },
    {
      no: '03',
      icon: 'solar:leaf-bold-duotone',
      title: 'Sustainability, Chemicals & Circularity',
      description:
        'Restricted-substance compliance, environmental footprint with full calculation lineage, repair and end-of-life circularity data.',
      points: ['Chemical & substance compliance', 'Environmental footprint', 'Circularity & evidence'],
      color: '#2e7d32',
    },
    {
      no: '04',
      icon: 'solar:checklist-minimalistic-bold-duotone',
      title: 'Data Collection & Compliance Ops',
      description:
        'Supplier collaboration portal, AI document extraction, configurable validation and four-eye approval workflows.',
      points: ['Supplier collaboration', 'AI document extraction', 'Validation & approval'],
      color: '#ed6c02',
    },
    {
      no: '05',
      icon: 'solar:qr-code-bold-duotone',
      title: 'Passport Generation & Publication',
      description:
        'Compose approved data into immutable passports, mint identifiers and data carriers, and publish role-specific stakeholder views.',
      points: ['DPP composer & versioning', 'QR / NFC / RFID carriers', 'Stakeholder views & portal'],
      color: '#d32f2f',
    },
    {
      no: '06',
      icon: 'solar:graph-new-bold-duotone',
      title: 'Integration, Security & Intelligence',
      description:
        'Enterprise APIs, complete audit trail, tenant isolation and management dashboards that turn compliance data into action.',
      points: ['Integration & API management', 'Audit, security & integrity', 'Analytics dashboards'],
      color: '#6f42c1',
    },
  ];

  const flowSteps = [
    { icon: 'solar:document-add-bold-duotone', title: 'Product context', text: 'Brand product, purchase order or tech pack creates the commercial reference.' },
    { icon: 'solar:hierarchy-2-bold-duotone', title: 'Master data', text: 'Establish model, style, SKU, batch and item hierarchy with supplier mapping.' },
    { icon: 'solar:inbox-in-bold-duotone', title: 'Collect & extract', text: 'Suppliers submit data and evidence; AI structures documents for review.' },
    { icon: 'solar:check-read-bold-duotone', title: 'Validate & approve', text: 'Automated regulatory validation, then compliance and economic-operator approval.' },
    { icon: 'solar:qr-code-bold-duotone', title: 'Generate passport', text: 'Create the immutable, human- and machine-readable DPP version.' },
    { icon: 'solar:users-group-rounded-bold-duotone', title: 'Publish & maintain', text: 'Link data carriers, serve stakeholder views, manage registry and lifecycle.' },
  ];

  const dataSources = [
    { icon: 'solar:shop-bold-duotone', label: 'Brands' },
    { icon: 'solar:delivery-bold-duotone', label: 'Suppliers' },
    { icon: 'solar:factory-bold-duotone', label: 'Factories' },
    { icon: 'solar:test-tube-bold-duotone', label: 'Laboratories' },
    { icon: 'solar:diploma-verified-bold-duotone', label: 'Certification bodies' },
    { icon: 'solar:recive-twice-square-bold-duotone', label: 'Recyclers & repairers' },
  ];

  const stakeholderViews = [
    {
      icon: 'solar:user-bold-duotone',
      role: 'Consumer',
      text: 'Identity, materials, origin, care, sustainability and recycling guidance through a mobile-first QR experience.',
      color: PRIMARY,
    },
    {
      icon: 'solar:case-round-bold-duotone',
      role: 'Business partner',
      text: 'Bill of materials, detailed traceability, certificates and permitted technical records.',
      color: '#0288d1',
    },
    {
      icon: 'solar:wrench-bold-duotone',
      role: 'Repairer & recycler',
      text: 'Disassembly, component, chemical-warning and material-separation information.',
      color: '#2e7d32',
    },
    {
      icon: 'solar:scale-bold-duotone',
      role: 'Authority',
      text: 'Economic operator, declarations, compliance dataset, evidence and audit history.',
      color: '#ed6c02',
    },
  ];

  const industries = [
    { icon: 'solar:t-shirt-bold-duotone', label: 'Textile & Apparel', status: 'Available now' },
    { icon: 'solar:slippers-bold-duotone', label: 'Footwear', status: 'On roadmap' },
    { icon: 'solar:cpu-bolt-bold-duotone', label: 'Electronics', status: 'On roadmap' },
    { icon: 'solar:armchair-2-bold-duotone', label: 'Furniture', status: 'On roadmap' },
    { icon: 'solar:battery-charge-bold-duotone', label: 'Batteries', status: 'On roadmap' },
    { icon: 'solar:box-minimalistic-bold-duotone', label: 'Packaging (PPWR)', status: 'Available now' },
  ];

  const phases = [
    {
      tag: 'Phase 1',
      title: 'Foundation & first publication',
      color: PRIMARY,
      items: ['Organisation & operator setup', 'Product, SKU & variant master', 'Material & packaging BOM', 'Supplier collaboration portal', 'DPP composer & QR carriers', 'Audit trail & readiness dashboard'],
    },
    {
      tag: 'Phase 2',
      title: 'Advanced compliance & automation',
      color: '#0288d1',
      items: ['Advanced chemical management', 'Footprint calculations & LCA', 'AI extraction at scale', 'Mass-balance & chain-of-custody', 'Item-level serialisation', 'Supplier scoring & remediation'],
    },
    {
      tag: 'Phase 3',
      title: 'Ecosystem & scale',
      color: '#2e7d32',
      items: ['EU registry adapters', 'Footwear, furniture, electronics packs', 'PPWR & additional markets', 'Repair networks & take-back', 'Benchmarking & intelligence', 'Cross-industry expansion'],
    },
  ];

  const faqs = [
    {
      q: 'What exactly is a Digital Product Passport?',
      a: 'A controlled compliance-data system — not just a QR webpage. It collects data from brands, suppliers, factories, laboratories and certification bodies, validates the evidence, creates an approved passport version, and publishes role-specific views for consumers, partners, repairers, recyclers and authorities.',
    },
    {
      q: 'Do we have to rebuild when regulations change?',
      a: 'No. Regulation packs, fields, validation rules and access policies are configurable. A Super Administrator can publish a new regulation schema without modifying the core application, so the platform survives changing rules and industries.',
    },
    {
      q: 'How do you make sure claims are trustworthy?',
      a: 'Every claim is linked to its evidence — a document, calculation, certificate or verified source. Published passports are immutable, versioned snapshots, and a complete audit trail records who submitted, verified, approved and published each value.',
    },
    {
      q: 'Will AI invent missing data?',
      a: 'Never. Document intelligence only structures information that already exists in an uploaded document. It will not fabricate composition, origin, carbon or compliance data — every extraction shows its source page, confidence score and is human-reviewed.',
    },
    {
      q: 'Does it integrate with our existing systems?',
      a: 'Yes. The platform connects to ERP, PLM, PIM, MES, quality, chemical, LIMS, ESG, LCA, WMS and logistics systems via REST APIs, webhooks, scheduled imports and Excel/CSV/JSON/XML ingestion, with master-data mapping and error monitoring.',
    },
    {
      q: 'Which industry can we start with today?',
      a: 'Textile and apparel is the prepared initial implementation, with packaging (PPWR) support alongside it. The architecture uses industry packs and regulation packs so footwear, electronics, furniture and batteries can be added without rebuilding.',
    },
  ];

  const [openFaq, setOpenFaq] = useState(0);

  // ---------------------------------------------------------------------

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Helmet>
        <title>DPP — Digital Product Passport Platform</title>
        <meta
          name="description"
          content="A configurable compliance, traceability and product-intelligence platform. Gather data from every source, prove every claim, and publish trusted Digital Product Passports."
        />
      </Helmet>

      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#FFFFFF',
          color: '#1a1a1a',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ============================================================ */}
        {/* Ambient light blobs                                          */}
        {/* ============================================================ */}
        <Box
          sx={{
            position: 'absolute',
            width: 620,
            height: 620,
            borderRadius: '50%',
            filter: 'blur(150px)',
            background: `radial-gradient(circle, ${alpha(PRIMARY, 0.16)} 0%, transparent 65%)`,
            top: -240,
            left: '6%',
            zIndex: 0,
            animation: `${pulseGlow} 9s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 720,
            height: 720,
            borderRadius: '50%',
            filter: 'blur(170px)',
            background: `radial-gradient(circle, ${alpha('#0288d1', 0.12)} 0%, transparent 70%)`,
            top: 120,
            right: '-4%',
            zIndex: 0,
            animation: `${pulseGlow} 11s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 560,
            height: 560,
            borderRadius: '50%',
            filter: 'blur(150px)',
            background: `radial-gradient(circle, ${alpha('#2e7d32', 0.10)} 0%, transparent 70%)`,
            bottom: 200,
            left: '-6%',
            zIndex: 0,
            animation: `${pulseGlow} 13s ease-in-out infinite`,
          }}
        />

        {/* ============================================================ */}
        {/* Navigation                                                   */}
        {/* ============================================================ */}
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backgroundColor: '#FFFFFF',
            borderBottom: `1px solid ${alpha('#000', 0.08)}`,
            boxShadow: scrolled
              ? '0 2px 12px rgba(0,0,0,0.08)'
              : '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.3s ease',
          }}
        >
          <Container maxWidth="lg">
            {/* Main nav row */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ py: scrolled ? 1.25 : 1.75 }}
            >
              {/* Logo */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.25}
                sx={{ cursor: 'pointer' }}
                onClick={() => handleNavigate('/')}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_LIGHT})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: `0 4px 12px ${alpha(PRIMARY, 0.3)}`,
                  }}
                >
                  <Iconify icon="solar:qr-code-bold-duotone" width={22} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#1a1a1a' }}
                >
                  DPP
                </Typography>
              </Stack>

              {/* Desktop links */}
              <Stack
                direction="row"
                spacing={3}
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                {navLinks.map((link) => (
                  <Typography
                    key={link.id}
                    variant="body2"
                    onClick={() => scrollToId(link.id)}
                    sx={{
                      cursor: 'pointer',
                      fontWeight: 600,
                      color: '#555555',
                      transition: 'color 0.2s',
                      '&:hover': { color: '#1a1a1a' },
                    }}
                  >
                    {link.label}
                  </Typography>
                ))}
              </Stack>

              {/* Right side: CTA + hamburger */}
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button
                  variant="contained"
                  size="medium"
                  onClick={() => handleNavigate(paths.auth.jwt.login)}
                  sx={{
                    borderRadius: 1.5,
                    px: 2.5,
                    backgroundColor: PRIMARY,
                    boxShadow: `0 4px 14px ${alpha(PRIMARY, 0.25)}`,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: PRIMARY_DARK,
                      boxShadow: `0 6px 20px ${alpha(PRIMARY, 0.35)}`,
                    },
                  }}
                >
                  Get Started
                </Button>

                {/* Hamburger button — mobile only */}
                <Box
                  onClick={() => setMobileOpen((prev) => !prev)}
                  sx={{
                    display: { xs: 'flex', md: 'none' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    border: `1px solid ${alpha('#000', 0.12)}`,
                    cursor: 'pointer',
                    color: '#333333',
                    transition: 'background 0.2s, border-color 0.2s',
                    '&:hover': {
                      backgroundColor: alpha('#000', 0.04),
                      borderColor: alpha('#000', 0.2),
                    },
                  }}
                >
                  <Iconify
                    icon={mobileOpen ? 'solar:close-square-bold' : 'solar:hamburger-menu-bold'}
                    width={22}
                  />
                </Box>
              </Stack>
            </Stack>

            {/* Mobile dropdown menu */}
            <Box
              sx={{
                display: { xs: 'block', md: 'none' },
                maxHeight: mobileOpen ? '420px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <Box
                sx={{
                  borderTop: `1px solid ${alpha('#000', 0.07)}`,
                  pt: 1,
                  pb: 2,
                }}
              >
                {navLinks.map((link) => (
                  <Box
                    key={link.id}
                    onClick={() => {
                      scrollToId(link.id);
                      setMobileOpen(false);
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 1.4,
                      px: 0.5,
                      borderBottom: `1px solid ${alpha('#000', 0.05)}`,
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                      color: '#333333',
                      '&:hover': { color: PRIMARY },
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'inherit' }}>
                      {link.label}
                    </Typography>
                    <Iconify icon="solar:alt-arrow-right-bold" width={16} sx={{ color: alpha('#000', 0.25) }} />
                  </Box>
                ))}

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    handleNavigate(paths.auth.jwt.login);
                    setMobileOpen(false);
                  }}
                  sx={{
                    mt: 2,
                    py: 1.4,
                    borderRadius: 1.5,
                    backgroundColor: PRIMARY,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    boxShadow: `0 6px 16px ${alpha(PRIMARY, 0.3)}`,
                    '&:hover': {
                      backgroundColor: PRIMARY_DARK,
                      boxShadow: `0 8px 22px ${alpha(PRIMARY, 0.4)}`,
                    },
                  }}
                >
                  Get Started →
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    handleNavigate(paths.auth.jwt.login);
                    setMobileOpen(false);
                  }}
                  sx={{
                    mt: 1,
                    py: 1.2,
                    borderRadius: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    borderColor: alpha('#1a1a1a', 0.18),
                    color: '#1a1a1a',
                    '&:hover': {
                      borderColor: '#1a1a1a',
                      backgroundColor: alpha('#1a1a1a', 0.03),
                    },
                  }}
                >
                  Sign in
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* ============================================================ */}
        {/* HERO                                                         */}
        {/* ============================================================ */}
        <Container
          maxWidth="lg"
          sx={{ position: 'relative', zIndex: 1, pt: { xs: 7, md: 12 }, pb: { xs: 8, md: 12 } }}
        >
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6.5}>
              <Reveal>
                <Stack spacing={3.5} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.6rem', sm: '3.5rem', md: '4.1rem' },
                      fontWeight: 800,
                      lineHeight: 1.05,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    Every product,{' '}
                    <Box
                      component="span"
                      sx={{
                        background: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_LIGHT}, ${PRIMARY})`,
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: `${shimmer} 5s linear infinite`,
                      }}
                    >
                      a passport you can trust.
                    </Box>
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: '#666666',
                      fontSize: { xs: '1.1rem', sm: '1.2rem' },
                      maxWidth: 540,
                      mx: { xs: 'auto', md: 0 },
                      lineHeight: 1.6,
                    }}
                  >
                    Gather information from brands, suppliers, factories and laboratories. Validate the evidence behind
                    every claim. Publish controlled Digital Product Passports for consumers, partners and authorities —
                    all from one configurable platform.
                  </Typography>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    justifyContent={{ xs: 'center', md: 'flex-start' }}
                    sx={{ pt: 1 }}
                  >
                    <Button
                      size="large"
                      variant="contained"
                      onClick={() => handleNavigate(paths.auth.jwt.login)}
                      endIcon={<Iconify icon="solar:arrow-right-linear" width={18} />}
                      sx={{
                        borderRadius: 1.5,
                        px: 4,
                        py: 1.6,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        backgroundColor: PRIMARY,
                        boxShadow: `0 12px 28px ${alpha(PRIMARY, 0.3)}`,
                        '&:hover': {
                          backgroundColor: PRIMARY_DARK,
                          boxShadow: `0 16px 36px ${alpha(PRIMARY, 0.4)}`,
                        },
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      size="large"
                      variant="outlined"
                      onClick={() => scrollToId('how-it-works')}
                      sx={{
                        borderRadius: 1.5,
                        px: 4,
                        py: 1.6,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderColor: alpha('#1a1a1a', 0.15),
                        color: '#1a1a1a',
                        '&:hover': {
                          borderColor: '#1a1a1a',
                          backgroundColor: alpha('#1a1a1a', 0.03),
                        },
                      }}
                    >
                      See how it works
                    </Button>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={3}
                    sx={{ pt: 1, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap', rowGap: 1 }}
                  >
                    {['No proprietary lock-in', 'Evidence-linked', 'EU-ready'].map((t) => (
                      <Stack key={t} direction="row" alignItems="center" spacing={0.75}>
                        <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: '#2e7d32' }} />
                        <Typography variant="body2" sx={{ color: '#666666', fontWeight: 500 }}>
                          {t}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Reveal>
            </Grid>

            {/* Hero passport mockup */}
            <Grid item xs={12} md={5.5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Reveal delay={150}>
                <Box sx={{ position: 'relative', width: '100%', minHeight: 480, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {/* floating badge top-left */}
                  <Card
                    sx={{
                      position: 'absolute',
                      top: 6,
                      left: 0,
                      zIndex: 3,
                      p: 1.5,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      boxShadow: `0 14px 30px ${alpha('#000', 0.1)}`,
                      border: `1px solid ${alpha('#e0e0e0', 0.08)}`,
                      animation: `${floatY} 6s ease-in-out infinite`,
                    }}
                  >
                    <Box sx={{ width: 34, height: 34, borderRadius: 1.25, backgroundColor: alpha('#2e7d32', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
                      <Iconify icon="solar:leaf-bold-duotone" width={20} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666666', display: 'block', lineHeight: 1.2 }}>
                        Carbon footprint
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        0.84 kg CO₂e
                      </Typography>
                    </Box>
                  </Card>

                  {/* floating badge bottom-right */}
                  <Card
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      right: -6,
                      zIndex: 3,
                      p: 1.5,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      boxShadow: `0 14px 30px ${alpha('#000', 0.1)}`,
                      border: `1px solid ${alpha('#e0e0e0', 0.08)}`,
                      animation: `${floatYSlow} 7s ease-in-out infinite`,
                    }}
                  >
                    <Box sx={{ width: 34, height: 34, borderRadius: 1.25, backgroundColor: alpha('#0288d1', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0288d1' }}>
                      <Iconify icon="solar:routing-2-bold-duotone" width={20} />
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666666', display: 'block', lineHeight: 1.2 }}>
                        Traceability
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        Tier 1–4 mapped
                      </Typography>
                    </Box>
                  </Card>

                  {/* main passport card */}
                  <Card
                    sx={{
                      width: '94%',
                      maxWidth: 400,
                      borderRadius: 3,
                      p: 3.5,
                      position: 'relative',
                      zIndex: 2,
                      backgroundColor: '#fff',
                      border: `1px solid ${alpha('#e0e0e0', 0.1)}`,
                      boxShadow: `0 30px 70px ${alpha('#000', 0.16)}`,
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1.5,
                            background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_LIGHT})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                          }}
                        >
                          <Iconify icon="solar:qr-code-bold-duotone" width={24} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            DPP · 8942-X
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666666' }}>
                            Organic Cotton Tee
                          </Typography>
                        </Box>
                      </Stack>
                      <Box
                        sx={{
                          px: 1.25,
                          py: 0.5,
                          borderRadius: 5,
                          backgroundColor: alpha('#2e7d32', 0.1),
                          color: '#2e7d32',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Iconify icon="solar:verified-check-bold" width={14} />
                        Published
                      </Box>
                    </Stack>

                    <Stack spacing={1.75} sx={{ mb: 2.5 }}>
                      {[
                        { label: 'Identity', pct: 100, col: '#2e7d32' },
                        { label: 'Composition', pct: 95, col: '#2e7d32' },
                        { label: 'Traceability', pct: 82, col: '#0288d1' },
                        { label: 'Environmental data', pct: 68, col: '#ed6c02' },
                        { label: 'Evidence', pct: 90, col: '#2e7d32' },
                      ].map((row) => (
                        <Box key={row.label}>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#666666', fontWeight: 500 }}>
                              {row.label}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: row.col }}>
                              {row.pct}%
                            </Typography>
                          </Stack>
                          <Box sx={{ height: 6, borderRadius: 3, backgroundColor: alpha('#9e9e9e', 0.12), overflow: 'hidden' }}>
                            <Box
                              sx={{
                                height: '100%',
                                width: `${row.pct}%`,
                                borderRadius: 3,
                                background: `linear-gradient(90deg, ${alpha(row.col, 0.7)}, ${row.col})`,
                              }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Stack>

                    <Box
                      sx={{
                        py: 1.5,
                        borderRadius: 1.5,
                        background: `linear-gradient(90deg, ${alpha(PRIMARY, 0.08)}, ${alpha(PRIMARY_LIGHT, 0.08)})`,
                        border: `1px solid ${alpha(PRIMARY, 0.12)}`,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: PRIMARY }}>
                        87% DPP Ready
                      </Typography>
                    </Box>
                  </Card>
                </Box>
              </Reveal>
            </Grid>
          </Grid>

          {/* trust stats strip */}
          <Reveal delay={250}>
            <Grid container spacing={2} sx={{ mt: { xs: 4, md: 7 } }}>
              {trustStats.map((s) => (
                <Grid item xs={6} md={3} key={s.label}>
                  <Card
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      height: '100%',
                      textAlign: 'center',
                      border: `1px solid ${alpha('#e0e0e0', 0.08)}`,
                      boxShadow: 'none',
                      transition: 'all 0.3s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 14px 30px ${alpha('#000', 0.06)}` },
                    }}
                  >
                    <Iconify icon={s.icon} width={26} sx={{ color: PRIMARY, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                      {s.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666666' }}>
                      {s.label}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Reveal>
        </Container>

        {/* ============================================================ */}
        {/* DATA SOURCES                                                 */}
        {/* ============================================================ */}
        <Box id="platform" sx={{ py: { xs: 8, md: 11 }, position: 'relative', zIndex: 1 }}>
          <Container maxWidth="lg">
            <Reveal>
              <Stack spacing={1.5} sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: 1.5 }}>
                  One source of truth
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Gather data from every link in the chain
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666', maxWidth: 620, mx: 'auto' }}>
                  Companies register on the platform and contribute the data only they hold. A single passport record
                  serves every stakeholder view through access policy — never duplicated datasets.
                </Typography>
              </Stack>
            </Reveal>

            <Reveal delay={120}>
              <Grid container spacing={2.5} justifyContent="center">
                {dataSources.map((src) => (
                  <Grid item xs={6} sm={4} md={2} key={src.label}>
                    <Card
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        textAlign: 'center',
                        height: '100%',
                        border: `1px solid ${alpha('#e0e0e0', 0.08)}`,
                        boxShadow: 'none',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          borderColor: alpha(PRIMARY, 0.3),
                          boxShadow: `0 16px 30px ${alpha('#000', 0.06)}`,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          mx: 'auto',
                          mb: 1.5,
                          borderRadius: 2,
                          backgroundColor: alpha(PRIMARY, 0.08),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: PRIMARY,
                        }}
                      >
                        <Iconify icon={src.icon} width={28} />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {src.label}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Reveal>
          </Container>
        </Box>

        {/* ============================================================ */}
        {/* CORE CAPABILITIES                                            */}
        {/* ============================================================ */}
        <Box sx={{ py: { xs: 9, md: 13 }, position: 'relative', zIndex: 1, backgroundColor: alpha(PRIMARY, 0.02), borderTop: `1px solid ${alpha('#e0e0e0', 0.05)}`, borderBottom: `1px solid ${alpha('#e0e0e0', 0.05)}` }}>
          <Container maxWidth="lg">
            <Reveal>
              <Stack spacing={1.5} sx={{ textAlign: 'center', mb: 7 }}>
                <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: 1.5 }}>
                  Design principles
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  A controlled compliance-data system
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666', maxWidth: 600, mx: 'auto' }}>
                  The passport is the publishing outcome of a broader data, evidence, workflow and integration
                  architecture — built to last beyond any single regulation.
                </Typography>
              </Stack>
            </Reveal>

            <Grid container spacing={3.5}>
              {capabilities.map((cap, i) => (
                <Grid item xs={12} sm={6} md={3} key={cap.title}>
                  <Reveal delay={i * 90}>
                    <Card
                      sx={{
                        height: '100%',
                        p: 3.5,
                        borderRadius: 2.5,
                        border: `1px solid ${alpha('#e0e0e0', 0.08)}`,
                        backgroundColor: '#fff',
                        boxShadow: 'none',
                        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: `0 22px 40px ${alpha('#000', 0.07)}`,
                          borderColor: alpha(cap.color, 0.35),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2,
                          backgroundColor: alpha(cap.color, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: cap.color,
                          mb: 2.5,
                        }}
                      >
                        <Iconify icon={cap.icon} width={28} />
                      </Box>
                      <Typography variant="h6" sx={{ mb: 1.25, fontWeight: 700, letterSpacing: '-0.01em' }}>
                        {cap.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666666', lineHeight: 1.65 }}>
                        {cap.description}
                      </Typography>
                    </Card>
                  </Reveal>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ============================================================ */}
        {/* HOW IT WORKS                                                 */}
        {/* ============================================================ */}
        <Box id="how-it-works" sx={{ py: { xs: 9, md: 13 }, position: 'relative', zIndex: 1 }}>
          <Container maxWidth="lg">
            <Reveal>
              <Stack spacing={1.5} sx={{ textAlign: 'center', mb: 7 }}>
                <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: 1.5 }}>
                  End-to-end operating model
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  From source data to published passport
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666', maxWidth: 600, mx: 'auto' }}>
                  Data moves through a governed pipeline — collected, validated, approved and published — so passports
                  generate consistently across products, regulations and audiences.
                </Typography>
              </Stack>
            </Reveal>

            <Grid container spacing={3}>
              {flowSteps.map((step, i) => (
                <Grid item xs={12} sm={6} md={4} key={step.title}>
                  <Reveal delay={i * 80}>
                    <Card
                      sx={{
                        position: 'relative',
                        height: '100%',
                        p: 3.5,
                        borderRadius: 2.5,
                        border: `1px solid ${alpha('#e0e0e0', 0.08)}`,
                        boxShadow: 'none',
                        overflow: 'hidden',
                        transition: 'all 0.3s',
                        '&:hover': { boxShadow: `0 18px 36px ${alpha('#000', 0.06)}` },
                      }}
                    >
                      <Typography
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 16,
                          fontSize: '3.4rem',
                          fontWeight: 900,
                          lineHeight: 1,
                          color: alpha(PRIMARY, 0.07),
                        }}
                      >
                        {i + 1}
                      </Typography>
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: 2,
                          backgroundColor: alpha(PRIMARY, 0.09),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: PRIMARY,
                          mb: 2,
                        }}
                      >
                        <Iconify icon={step.icon} width={26} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {step.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666666', lineHeight: 1.6 }}>
                        {step.text}
                      </Typography>
                    </Card>
                  </Reveal>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ============================================================ */}
        {/* MODULE GROUPS                                                */}
        {/* ============================================================ */}
        <Box id="modules" sx={{ py: { xs: 9, md: 13 }, position: 'relative', zIndex: 1, backgroundColor: alpha('#0288d1', 0.025), borderTop: `1px solid ${alpha('#e0e0e0', 0.05)}`, borderBottom: `1px solid ${alpha('#e0e0e0', 0.05)}` }}>
          <Container maxWidth="lg">
            <Reveal>
              <Stack spacing={1.5} sx={{ textAlign: 'center', mb: 7 }}>
                <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: 1.5 }}>
                  24 modules · 6 areas
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  A complete modular architecture
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666', maxWidth: 600, mx: 'auto' }}>
                  Everything from regulatory configuration to analytics — organised so you can start small and scale
                  without rebuilding the platform.
                </Typography>
              </Stack>
            </Reveal>

            <Grid container spacing={3.5}>
              {moduleGroups.map((m, i) => (
                <Grid item xs={12} md={6} key={m.title}>
                  <Reveal delay={(i % 2) * 100}>
                    <Card
                      sx={{
                        height: '100%',
                        p: 4,
                        borderRadius: 2.5,
                        border: `1px solid ${alpha('#e0e0e0', 0.08)}`,
                        backgroundColor: '#fff',
                        boxShadow: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: `0 24px 44px ${alpha('#000', 0.08)}`,
                          borderColor: alpha(m.color, 0.3),
                        },
                        '&:hover .mod-bar': { width: 64 },
                      }}
                    >
                      <Stack direction="row" spacing={2.5} alignItems="flex-start">
                        <Box
                          sx={{
                            flexShrink: 0,
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${alpha(m.color, 0.15)}, ${alpha(m.color, 0.05)})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: m.color,
                          }}
                        >
                          <Iconify icon={m.icon} width={30} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: alpha(m.color, 0.9), letterSpacing: 1 }}>
                              {m.no}
                            </Typography>
                            <Box className="mod-bar" sx={{ height: 3, width: 22, borderRadius: 3, backgroundColor: m.color, transition: 'width 0.35s ease' }} />
                          </Stack>
                          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em', mb: 1 }}>
                            {m.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666666', lineHeight: 1.6, mb: 2 }}>
                            {m.description}
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {m.points.map((p) => (
                              <Box
                                key={p}
                                sx={{
                                  px: 1.25,
                                  py: 0.5,
                                  borderRadius: 5,
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: m.color,
                                  backgroundColor: alpha(m.color, 0.08),
                                }}
                              >
                                {p}
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      </Stack>
                    </Card>
                  </Reveal>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ============================================================ */}
        {/* STAKEHOLDER VIEWS                                            */}
        {/* ============================================================ */}
        <Box sx={{ py: { xs: 9, md: 13 }, position: 'relative', zIndex: 1 }}>
          <Container maxWidth="lg">
            <Reveal>
              <Stack spacing={1.5} sx={{ textAlign: 'center', mb: 7 }}>
                <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: 1.5 }}>
                  One record, many views
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  The right information for every audience
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666', maxWidth: 600, mx: 'auto' }}>
                  Field-level access policies present the same controlled dataset differently — commercial details stay
                  protected, while authorities and consumers see exactly what they need.
                </Typography>
              </Stack>
            </Reveal>

            <Grid container spacing={3.5}>
              {stakeholderViews.map((v, i) => (
                <Grid item xs={12} sm={6} md={3} key={v.role}>
                  <Reveal delay={i * 90}>
                    <Card
                      sx={{
                        height: '100%',
                        p: 3.5,
                        borderRadius: 2.5,
                        textAlign: 'center',
                        border: `1px solid ${alpha('#e0e0e0', 0.08)}`,
                        boxShadow: 'none',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: `0 20px 38px ${alpha('#000', 0.07)}`,
                          borderColor: alpha(v.color, 0.3),
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 58,
                          height: 58,
                          mx: 'auto',
                          mb: 2,
                          borderRadius: '50%',
                          backgroundColor: alpha(v.color, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: v.color,
                        }}
                      >
                        <Iconify icon={v.icon} width={30} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {v.role}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666666', lineHeight: 1.6 }}>
                        {v.text}
                      </Typography>
                    </Card>
                  </Reveal>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ============================================================ */}
        {/* INDUSTRIES                                                   */}
        {/* ============================================================ */}
        <Box id="industries" sx={{ py: { xs: 9, md: 13 }, position: 'relative', zIndex: 1, backgroundColor: alpha('#2e7d32', 0.025), borderTop: `1px solid ${alpha('#e0e0e0', 0.05)}`, borderBottom: `1px solid ${alpha('#e0e0e0', 0.05)}` }}>
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={5}>
                <Reveal>
                  <Stack spacing={2}>
                    <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: 1.5 }}>
                      Industry packs
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                      Built for textile first, ready for what's next
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666666', lineHeight: 1.65 }}>
                      Start with a prepared textile and apparel dataset today. Because the core platform uses industry
                      packs and regulation packs, new categories plug in without rebuilding the application.
                    </Typography>
                    <Stack spacing={1.5} sx={{ pt: 1 }}>
                      {['ESPR & PPWR regulation packs', 'Product-specific delegated acts', 'Brand-specific sustainability requirements'].map((t) => (
                        <Stack key={t} direction="row" alignItems="center" spacing={1.25}>
                          <Iconify icon="solar:check-circle-bold" width={20} sx={{ color: '#2e7d32' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {t}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Reveal>
              </Grid>

              <Grid item xs={12} md={7}>
                <Grid container spacing={2.5}>
                  {industries.map((ind, i) => (
                    <Grid item xs={6} sm={4} key={ind.label}>
                      <Reveal delay={i * 70}>
                        <Card
                          sx={{
                            p: 2.75,
                            borderRadius: 2,
                            height: '100%',
                            border: `1px solid ${alpha('#e0e0e0', 0.08)}`,
                            boxShadow: 'none',
                            backgroundColor: '#fff',
                            transition: 'all 0.3s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 16px 30px ${alpha('#000', 0.06)}` },
                          }}
                        >
                          <Box sx={{ width: 46, height: 46, borderRadius: 1.5, backgroundColor: alpha(PRIMARY, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY, mb: 1.5 }}>
                            <Iconify icon={ind.icon} width={26} />
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {ind.label}
                          </Typography>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              px: 1,
                              py: 0.25,
                              borderRadius: 5,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: ind.status === 'Available now' ? '#2e7d32' : '#666666',
                              backgroundColor: ind.status === 'Available now' ? alpha('#2e7d32', 0.1) : alpha('#9e9e9e', 0.1),
                            }}
                          >
                            {ind.status}
                          </Box>
                        </Card>
                      </Reveal>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* ============================================================ */}
        {/* ROADMAP                                                      */}
        {/* ============================================================ */}
        <Box sx={{ py: { xs: 9, md: 13 }, position: 'relative', zIndex: 1 }}>
          <Container maxWidth="lg">
            <Reveal>
              <Stack spacing={1.5} sx={{ textAlign: 'center', mb: 7 }}>
                <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: 1.5 }}>
                  Delivery roadmap
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Start with foundation, grow into ecosystem
                </Typography>
                <Typography variant="body1" sx={{ color: '#666666', maxWidth: 600, mx: 'auto' }}>
                  A practical sequence: get the core information model live and publishing first, then layer on advanced
                  calculation, automation and external registry capabilities.
                </Typography>
              </Stack>
            </Reveal>

            <Grid container spacing={3.5}>
              {phases.map((p, i) => (
                <Grid item xs={12} md={4} key={p.tag}>
                  <Reveal delay={i * 110}>
                    <Card
                      sx={{
                        height: '100%',
                        p: 4,
                        borderRadius: 2.5,
                        border: `1px solid ${alpha('#e0e0e0', 0.08)}`,
                        boxShadow: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s',
                        '&:hover': { boxShadow: `0 22px 42px ${alpha('#000', 0.07)}` },
                      }}
                    >
                      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${p.color}, ${alpha(p.color, 0.3)})` }} />
                      <Box
                        sx={{
                          display: 'inline-flex',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 5,
                          mb: 2,
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          letterSpacing: 0.5,
                          color: p.color,
                          backgroundColor: alpha(p.color, 0.1),
                        }}
                      >
                        {p.tag}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, letterSpacing: '-0.01em' }}>
                        {p.title}
                      </Typography>
                      <Stack spacing={1.25}>
                        {p.items.map((it) => (
                          <Stack key={it} direction="row" alignItems="flex-start" spacing={1.25}>
                            <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: p.color, mt: 0.25, flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ color: '#666666' }}>
                              {it}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Card>
                  </Reveal>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ============================================================ */}
        {/* GOVERNANCE / WHY TRUST                                       */}
        {/* ============================================================ */}
        <Box sx={{ py: { xs: 9, md: 12 }, position: 'relative', zIndex: 1, backgroundColor: alpha(PRIMARY, 0.02), borderTop: `1px solid ${alpha('#e0e0e0', 0.05)}`, borderBottom: `1px solid ${alpha('#e0e0e0', 0.05)}` }}>
          <Container maxWidth="lg">
            <Reveal>
              <Stack spacing={1.5} sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: 1.5 }}>
                  Non-functional foundations
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Enterprise-grade by default
                </Typography>
              </Stack>
            </Reveal>

            <Grid container spacing={3}>
              {[
                { icon: 'solar:settings-minimalistic-bold-duotone', t: 'Configuration over code', d: 'Fields, rules, workflows and access policies are administrator-configurable.' },
                { icon: 'solar:buildings-3-bold-duotone', t: 'Multi-tenancy', d: 'Strong tenant isolation with controlled group-company and supply-chain collaboration.' },
                { icon: 'solar:chart-2-bold-duotone', t: 'Scalability', d: 'Bulk product onboarding and item-level identifiers at high volume.' },
                { icon: 'solar:transfer-horizontal-bold-duotone', t: 'Interoperability', d: 'Versioned APIs and standardised machine-readable export — no proprietary lock-in.' },
                { icon: 'solar:fingerprint-bold-duotone', t: 'Data provenance', d: 'Every value retains source, method, date, owner and verification status.' },
                { icon: 'solar:lock-keyhole-bold-duotone', t: 'Immutability', d: 'Published versions and approval records cannot be silently altered.' },
                { icon: 'solar:eye-closed-bold-duotone', t: 'Privacy & confidentiality', d: 'Only appropriate data is exposed to each role; commercial details stay protected.' },
                { icon: 'solar:translation-2-bold-duotone', t: 'Multilingual & accessible', d: 'Supports EU markets and supplier languages with accessible, mobile-first design.' },
              ].map((g, i) => (
                <Grid item xs={12} sm={6} md={3} key={g.t}>
                  <Reveal delay={(i % 4) * 80}>
                    <Stack spacing={1.5} sx={{ p: 1 }}>
                      <Box sx={{ width: 46, height: 46, borderRadius: 1.5, backgroundColor: alpha(PRIMARY, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', color: PRIMARY }}>
                        <Iconify icon={g.icon} width={26} />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {g.t}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666666', lineHeight: 1.6 }}>
                        {g.d}
                      </Typography>
                    </Stack>
                  </Reveal>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ============================================================ */}
        {/* FAQ                                                          */}
        {/* ============================================================ */}
        <Box id="faq" sx={{ py: { xs: 9, md: 13 }, position: 'relative', zIndex: 1 }}>
          <Container maxWidth="md">
            <Reveal>
              <Stack spacing={1.5} sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="overline" sx={{ color: PRIMARY, fontWeight: 700, letterSpacing: 1.5 }}>
                  Questions
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  Frequently asked
                </Typography>
              </Stack>
            </Reveal>

            <Stack spacing={2}>
              {faqs.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <Reveal delay={i * 60} key={faq.q}>
                    <Card
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: `1px solid ${alpha('#e0e0e0', open ? 0.18 : 0.08)}`,
                        boxShadow: 'none',
                        transition: 'all 0.25s',
                        backgroundColor: open ? alpha(PRIMARY, 0.02) : '#fff',
                        '&:hover': { borderColor: alpha(PRIMARY, 0.25) },
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {faq.q}
                        </Typography>
                        <Box
                          sx={{
                            flexShrink: 0,
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: open ? '#fff' : PRIMARY,
                            backgroundColor: open ? PRIMARY : alpha(PRIMARY, 0.1),
                            transition: 'all 0.3s',
                            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        >
                          <Iconify icon="solar:alt-arrow-down-bold" width={18} />
                        </Box>
                      </Stack>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateRows: open ? '1fr' : '0fr',
                          transition: 'grid-template-rows 0.3s ease',
                        }}
                      >
                        <Box sx={{ overflow: 'hidden' }}>
                          <Typography variant="body2" sx={{ color: '#666666', lineHeight: 1.7, pt: open ? 2 : 0 }}>
                            {faq.a}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Reveal>
                );
              })}
            </Stack>
          </Container>
        </Box>

        {/* ============================================================ */}
        {/* CTA                                                          */}
        {/* ============================================================ */}
        <Box sx={{ pb: { xs: 9, md: 13 }, position: 'relative', zIndex: 1 }}>
          <Container maxWidth="lg">
            <Reveal>
              <Box
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 4,
                  px: { xs: 4, md: 8 },
                  py: { xs: 6, md: 9 },
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_LIGHT})`,
                  boxShadow: `0 30px 70px ${alpha(PRIMARY, 0.35)}`,
                }}
              >
                <Box sx={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: alpha('#fff', 0.12), filter: 'blur(60px)', top: -120, left: -80 }} />
                <Box sx={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: alpha('#fff', 0.1), filter: 'blur(70px)', bottom: -140, right: -100 }} />

                <Stack spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h2" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', fontSize: { xs: '2rem', md: '2.75rem' } }}>
                    Bring your product data to life
                  </Typography>
                  <Typography variant="body1" sx={{ color: alpha('#fff', 0.92), maxWidth: 560, lineHeight: 1.65, fontSize: '1.1rem' }}>
                    Register your organization, connect your supply chain, and start publishing verified Digital Product
                    Passports your customers and regulators can rely on.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                    <Button
                      size="large"
                      variant="contained"
                      onClick={() => handleNavigate(paths.auth.jwt.registerOrg)}
                      endIcon={<Iconify icon="solar:arrow-right-linear" width={18} />}
                      sx={{
                        borderRadius: 1.5,
                        px: 4.5,
                        py: 1.7,
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        backgroundColor: '#fff',
                        color: PRIMARY,
                        '&:hover': { backgroundColor: alpha('#fff', 0.9), boxShadow: `0 14px 30px ${alpha('#000', 0.2)}` },
                      }}
                    >
                      Register your organization
                    </Button>
                    <Button
                      size="large"
                      variant="outlined"
                      onClick={() => handleNavigate(paths.auth.jwt.login)}
                      sx={{
                        borderRadius: 1.5,
                        px: 4.5,
                        py: 1.7,
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        color: '#fff',
                        borderColor: alpha('#fff', 0.5),
                        '&:hover': { borderColor: '#fff', backgroundColor: alpha('#fff', 0.1) },
                      }}
                    >
                      Sign in
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Reveal>
          </Container>
        </Box>

        {/* ============================================================ */}
        {/* FOOTER                                                       */}
        {/* ============================================================ */}
        <Box component="footer" sx={{ py: 6, borderTop: `1px solid ${alpha('#e0e0e0', 0.08)}`, position: 'relative', zIndex: 1 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 1.5,
                      background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_LIGHT})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <Iconify icon="solar:qr-code-bold-duotone" width={20} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                    DPP
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: '#666666', maxWidth: 320, lineHeight: 1.6 }}>
                  A configurable Digital Product Compliance and Traceability Platform. The passport is the trusted
                  publishing layer over your product, supply-chain, sustainability and evidence data.
                </Typography>
              </Grid>

              <Grid item xs={6} md={2.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Platform
                </Typography>
                <Stack spacing={1.25}>
                  {navLinks.map((l) => (
                    <Typography
                      key={l.id}
                      variant="body2"
                      onClick={() => scrollToId(l.id)}
                      sx={{ color: '#666666', cursor: 'pointer', '&:hover': { color: PRIMARY } }}
                    >
                      {l.label}
                    </Typography>
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={6} md={2.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Account
                </Typography>
                <Stack spacing={1.25}>
                  <Typography variant="body2" onClick={() => handleNavigate(paths.auth.jwt.login)} sx={{ color: '#666666', cursor: 'pointer', '&:hover': { color: PRIMARY } }}>
                    Sign in
                  </Typography>
                  <Typography variant="body2" onClick={() => handleNavigate(paths.auth.jwt.registerOrg)} sx={{ color: '#666666', cursor: 'pointer', '&:hover': { color: PRIMARY } }}>
                    Register organization
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                  Compliance ready
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {['ESPR', 'PPWR', 'EU Registry', 'GS1'].map((t) => (
                    <Box key={t} sx={{ px: 1.25, py: 0.5, borderRadius: 5, fontSize: '0.72rem', fontWeight: 600, color: '#666666', backgroundColor: alpha('#9e9e9e', 0.08) }}>
                      {t}
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>

            <Box sx={{ pt: 3, borderTop: `1px solid ${alpha('#e0e0e0', 0.06)}` }}>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#9e9e9e', fontWeight: 500 }}>
                © {new Date().getFullYear()} Digital Product Passport Platform · ITG Technologies. Enterprise technology
                for compliance, traceability and manufacturing intelligence.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
}