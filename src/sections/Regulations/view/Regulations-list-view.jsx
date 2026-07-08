import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import Container from '@mui/material/Container';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Skeleton,
  alpha,
  Divider,
  Button,
  Collapse,
  IconButton,
  Tooltip,
  Alert,
  InputAdornment,
  TextField,
  Grid,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import { getRegulations } from 'src/api/lia-api';

// ----------------------------------------------------------------------

// Status color mapping
const STATUS_COLORS = {
  Effective: 'success',
  Pending: 'warning',
  Draft: 'info',
  Proposed: 'secondary',
};

// Type color mapping
const TYPE_COLORS = {
  ESPR: { bg: '#E8F5E9', color: '#2E7D32', border: '#A5D6A7' },
  PPWR: { bg: '#E3F2FD', color: '#1565C0', border: '#90CAF9' },
  EPR: { bg: '#FFF3E0', color: '#E65100', border: '#FFCC80' },
  DPP: { bg: '#F3E5F5', color: '#7B1FA2', border: '#CE93D8' },
  REACH: { bg: '#FCE4EC', color: '#C62828', border: '#EF9A9A' },
  'Brand-specific DPP requirements': { bg: '#FCE4EC', color: '#C62828', border: '#EF9A9A' },
};

const DEFAULT_TYPE_COLOR = { bg: '#F5F5F5', color: '#616161', border: '#E0E0E0' };

const INDUSTRIES_OPTIONS = ['Textile', 'Footwear', 'Fashion'];

// Topic icons mapping
const TOPIC_ICONS = {
  Recycling: 'mdi:recycle',
  'Digital Product Passport (DPP)': 'mdi:qrcode',
  'Product Durability': 'mdi:shield-check',
  'Circular Economy': 'mdi:autorenew',
  'Waste Management': 'mdi:delete-outline',
  Labelling: 'mdi:label-outline',
  'Whistleblower Protection': 'mdi:account-voice',
};

// ----------------------------------------------------------------------

export default function RegulationsListView() {
  const settings = useSettingsContext();
  const [regulations, setRegulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegulation, setSelectedRegulation] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('All');
  const [processingId, setProcessingId] = useState(null);

  const fetchRegulations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRegulations();
      setRegulations(response.data?.regulations || []);
    } catch (err) {
      console.error('Failed to fetch regulations:', err);
      setError(err?.response?.data?.message || 'Failed to fetch regulations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegulations();
  }, [fetchRegulations]);

  const handleOpenDetails = (regulation) => {
    setSelectedRegulation(regulation);
    setOpenDialog(true);
  };

  const handleCloseDetails = () => {
    setOpenDialog(false);
    setSelectedRegulation(null);
  };

  const handleDownload = async (docId, url, fileName) => {
    const actionId = `download-${docId}`;
    setProcessingId(actionId);
    try {
      const response = await axios.get(url, {
        headers: {
          'X-API-Key': import.meta.env.VITE_DMS_API_KEY,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download document. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleView = async (docId, url) => {
    const actionId = `view-${docId}`;
    setProcessingId(actionId);
    try {
      const response = await axios.get(url, {
        headers: {
          'X-API-Key': import.meta.env.VITE_DMS_API_KEY,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const viewUrl = window.URL.createObjectURL(blob);
      window.open(viewUrl, '_blank');
    } catch (err) {
      console.error('Preview failed:', err);
      alert('Failed to preview document. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const filteredRegulations = regulations.filter((reg) => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      reg.name?.toLowerCase().includes(q) ||
      reg.type?.toLowerCase().includes(q) ||
      reg.summary?.toLowerCase().includes(q) ||
      reg.topics?.some((t) => t.toLowerCase().includes(q)) ||
      reg.industries?.some((i) => i.toLowerCase().includes(q));

    const matchesIndustry =
      currentTab === 'All'
        ? reg.industries?.some((ind) => INDUSTRIES_OPTIONS.includes(ind) || ind === 'All Sectors')
        : reg.industries?.includes(currentTab) || reg.industries?.includes('All Sectors');

    return matchesSearch && matchesIndustry;
  });

  // Get unique document filenames only (dedup by fileName)
  const getUniqueDocuments = (documents) => {
    if (!documents?.length) return [];
    const seen = new Set();
    return documents.filter((doc) => {
      if (seen.has(doc.fileName)) return false;
      seen.add(doc.fileName);
      return true;
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // ── Loading Skeleton ──
  if (loading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Box sx={{ textAlign: 'center', mt: 4, mb: 5 }}>
          <Skeleton variant="text" width={320} height={48} sx={{ mx: 'auto' }} />
          <Skeleton variant="text" width={500} height={24} sx={{ mx: 'auto', mt: 1 }} />
        </Box>
        <Stack spacing={3}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={220} sx={{ borderRadius: 3 }} />
          ))}
        </Stack>
      </Container>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Box sx={{ textAlign: 'center', mt: 4, mb: 5 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Rules and Regulations
          </Typography>
        </Box>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchRegulations}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {/* ── Header ── */}
      <Box sx={{ textAlign: 'center', mt: 3, mb: 4 }}>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>

          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Rules and Regulations
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
          European Digital Product Passport (DPP) regulations and compliance requirements for sustainable products
        </Typography>
      </Box>

      {/* ── Search Bar ── */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <TextField
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search regulations by name, type, topic, or industry..."
          size="small"
          sx={{
            width: '100%',
            maxWidth: 560,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'background.paper',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="mdi:magnify" width={20} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
            ...(searchQuery && {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <Iconify icon="mdi:close" width={18} />
                  </IconButton>
                </InputAdornment>
              ),
            }),
          }}
        />
      </Box>

      {/* ── Industry Tabs ── */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          {['All', ...INDUSTRIES_OPTIONS].map((tab) => (
            <Tab
              key={tab}
              value={tab}
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: currentTab === tab ? 700 : 500 }}>
                    {tab}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 0.5,
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      color: currentTab === tab ? 'primary.main' : 'text.disabled',
                    }}
                  >
                    ({tab === 'All'
                      ? regulations.filter(r => r.industries?.some(i => INDUSTRIES_OPTIONS.includes(i) || i === 'All Sectors')).length
                      : regulations.filter(r => r.industries?.includes(tab) || r.industries?.includes('All Sectors')).length
                    })
                  </Typography>
                </Stack>
              }
              sx={{
                px: 3,
                minHeight: 48,
                color: 'text.secondary',
                '&.Mui-selected': { color: 'primary.main' },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* ── Regulation Cards ── */}
      {filteredRegulations.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Iconify icon="mdi:file-search-outline" width={64} sx={{ color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No regulations found
          </Typography>
          {searchQuery && (
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              Try adjusting your search query
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ pb: 5 }}>
          {filteredRegulations.map((regulation) => {
            const typeColor = TYPE_COLORS[regulation.type] || DEFAULT_TYPE_COLOR;

            return (
              <Grid item xs={12} sm={6} md={4} key={regulation.slug}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 1, // Square aesthetic
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: (theme) => theme.customShadows?.z8 || '0 8px 16px rgba(0,0,0,0.08)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Top Row */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      {regulation.type ? (
                        <Chip
                          label={regulation.type}
                          size="small"
                          sx={{
                            bgcolor: typeColor.bg,
                            color: typeColor.color,
                            border: `1px solid ${typeColor.border}`,
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            height: 22,
                          }}
                        />
                      ) : <Box />}
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          {regulation.countryFlag} {regulation.country}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Title */}
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: 44,
                      }}
                    >
                      {regulation.name}
                    </Typography>

                    {/* Summary */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        mb: 2,
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flexGrow: 1,
                      }}
                    >
                      {regulation.summary}
                    </Typography>

                    <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                    {/* Footer Info */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Iconify icon="mdi:calendar-check" width={14} sx={{ color: 'success.main' }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {formatDate(regulation.effectiveDate)}
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        onClick={() => handleOpenDetails(regulation)}
                        endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
                        sx={{
                          minWidth: 120,
                          height: 40,
                          px: 2.5,
                          borderRadius: '999px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: '#fff',
                          background: 'linear-gradient(135deg, #0F4D80 0%, #1565A8 100%)',
                          boxShadow: '0 6px 18px rgba(15, 77, 128, 0.25)',
                          transition: 'all .25s ease',

                          '& .MuiButton-endIcon': {
                            marginLeft: 0.8,
                            transition: 'transform .25s ease',
                          },

                          '&:hover': {
                            background: 'linear-gradient(135deg, #0C3E67 0%, #0F4D80 100%)',
                            boxShadow: '0 10px 24px rgba(15, 77, 128, 0.35)',
                            transform: 'translateY(-2px)',

                            '& .MuiButton-endIcon': {
                              transform: 'translateX(3px)',
                            },
                          },

                          '&:active': {
                            transform: 'translateY(0)',
                          },
                        }}
                      >
                        Details
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}


      <Dialog
        open={openDialog}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 1.5, p: 0 }
        }}
      >
        {selectedRegulation && (
          <>
            <DialogTitle sx={{ p: 3, pb: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack spacing={0.5}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Chip
                      label={selectedRegulation.type || 'Regulation'}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main'
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                      ID: {selectedRegulation.slug}
                    </Typography>
                  </Stack>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 1 }}>
                    {selectedRegulation.name}
                  </Typography>
                </Stack>
                <IconButton onClick={handleCloseDetails} sx={{ color: 'text.disabled' }}>
                  <Iconify icon="mdi:close" width={24} />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3, bgcolor: 'background.neutral' }}>
              <Stack spacing={3}>

                <Card variant="outlined" sx={{ p: 2, borderRadius: 1, bgcolor: 'background.paper' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 0.5 }}>STATUS</Typography>
                      <Chip
                        label={selectedRegulation.status}
                        size="small"
                        color={STATUS_COLORS[selectedRegulation.status] || 'default'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 0.5 }}>EFFECTIVE</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{formatDate(selectedRegulation.effectiveDate)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 0.5 }}>ENACTED</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{formatDate(selectedRegulation.enactedDate)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 0.5 }}>REGION</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{selectedRegulation.countryFlag} {selectedRegulation.country}</Typography>
                    </Grid>
                  </Grid>
                </Card>

                {/* Summary Section */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>SUMMARY</Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.primary' }}>
                    {selectedRegulation.summary}
                  </Typography>
                </Box>

                {/* Key Obligations */}
                {selectedRegulation.obligations?.length > 0 && (
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 1,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                      <Iconify icon="mdi:clipboard-check-outline" width={20} />
                      Key Obligations
                    </Typography>
                    <Stack spacing={1.5}>
                      {selectedRegulation.obligations.map((obligation, idx) => (
                        <Typography key={idx} variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                          • {obligation}
                        </Typography>
                      ))}
                    </Stack>
                  </Card>
                )}

                <Grid container spacing={3}>
                  {/* Industries */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>INDUSTRIES</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {selectedRegulation.industries?.map((ind) => (
                        <Chip key={ind} label={ind} size="small" variant="soft" sx={{ fontWeight: 600 }} />
                      ))}
                    </Stack>
                  </Grid>

                  {/* Business Roles */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>BUSINESS ROLES</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {selectedRegulation.businessRoles?.map((role) => (
                        <Chip key={role} label={role} size="small" variant="soft" sx={{ fontWeight: 600 }} />
                      ))}
                    </Stack>
                  </Grid>
                </Grid>

                {/* Documents */}
                {getUniqueDocuments(selectedRegulation.documents).length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}>REFERENCE DOCUMENTS</Typography>
                    <Grid container spacing={2}>
                      {getUniqueDocuments(selectedRegulation.documents).map((doc) => (
                        <Grid item xs={12} sm={6} key={doc.id}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 1.5,
                              borderRadius: 1,
                              bgcolor: 'background.paper',
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover': { borderColor: 'primary.main', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02) },
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
                              <Iconify
                                icon={doc.fileName?.endsWith('.pptx') ? 'mdi:file-powerpoint-box' : 'mdi:file-pdf-box'}
                                width={24}
                                sx={{ color: doc.fileName?.endsWith('.pptx') ? 'warning.main' : 'error.main' }}
                              />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {doc.fileName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>{doc.language} • {doc.category}</Typography>
                              </Box>
                            </Stack>
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Preview PDF">
                                <IconButton
                                  size="small"
                                  disabled={processingId !== null}
                                  onClick={() => handleView(doc.id, doc.downloadUrl)}
                                  sx={{ color: 'text.secondary' }}
                                >
                                  {processingId === `view-${doc.id}` ? (
                                    <CircularProgress size={18} color="inherit" />
                                  ) : (
                                    <Iconify icon="mdi:eye" width={18} />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Download">
                                <IconButton
                                  size="small"
                                  disabled={processingId !== null}
                                  onClick={() => handleDownload(doc.id, doc.downloadUrl, doc.fileName)}
                                  sx={{ color: 'primary.main' }}
                                >
                                  {processingId === `download-${doc.id}` ? (
                                    <CircularProgress size={18} color="primary" />
                                  ) : (
                                    <Iconify icon="mdi:download" width={18} />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2.5 }}>
              <Button variant="outlined" color="inherit" onClick={handleCloseDetails} sx={{ fontWeight: 700 }}>
                Close
              </Button>
              {/* <Button
                variant="contained"
                onClick={() => {
                  const mainDoc = getUniqueDocuments(selectedRegulation.documents)[0];
                  if (mainDoc) handleDownload('main-law', mainDoc.downloadUrl, mainDoc.fileName);
                }}
                disabled={!selectedRegulation.documents?.length || processingId !== null}
                startIcon={processingId === 'download-main-law' && <CircularProgress size={16} color="inherit" />}
                sx={{ fontWeight: 700 }}
              >
                {processingId === 'download-main-law' ? 'Processing...' : 'Download Main Law'}
              </Button> */}
            </DialogActions>
          </>
        )}
      </Dialog>



      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          Regulation data provided by Law Into Action (LIA) •
        </Typography>
      </Box>
    </Container>
  );
}
