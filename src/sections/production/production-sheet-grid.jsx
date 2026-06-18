import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Delete, Get, Post } from 'src/api/apibasemethods';
import {
  colorSchemeDarkBlue,
  themeAlpine,
  themeBalham,
  themeMaterial,
  themeQuartz,
} from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { useNavigate } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import {
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Autocomplete,
  DialogActions,
  Card,
  Typography,
} from '@mui/material';
import { Container, Stack, textAlign } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import { APP_API_STORAGE } from 'src/config-global';
import PropTypes from 'prop-types';
import { fDate, fDateTime } from 'src/utils/format-time';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import EmptyContent from 'src/components/empty-content';
import { fNumber } from 'src/utils/format-number';
import { DesktopDatePicker } from '@mui/x-date-pickers';

// Create a file called StatusRenderer.js or add this to your existing file
const StatusRenderer = (params) => {
  // eslint-disable-next-line
  const status = params.value;
  // eslint-disable-next-line
  let backgroundColor, textColor, borderColor;

  switch (status) {
    case 'Approved':
      // backgroundColor = 'rgba(208, 245, 216, 0.5)';
      textColor = '#63913a';
      // borderColor = '#00a854';
      // borderColor = 'rgba(208, 245, 216, 0.5)';
      break;
    case 'Rejected':
      // backgroundColor = 'rgba(255, 204, 204, 0.5)';
      textColor = '#a80000';
      // borderColor = 'rgba(255, 204, 204, 0.5)';
      break;
    case 'Pending':
      // backgroundColor = '#fff7e6';
      textColor = '#cd8f4d';
      // borderColor = '#fa8c16';
      break;
    default:
      // backgroundColor = '#f5f5f5';
      textColor = '#595959';
    // borderColor = '#d9d9d9';
  }

  return (
    <div
      style={{
        display: 'inline-block',
        padding: '0px 6px',
        borderRadius: '8px',
        backgroundColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        // fontSize: '8px',
        textAlign: 'center',
      }}
    >
      {status}
    </div>
  );
};

const ImageNameRender =
  (id) =>
    // eslint-disable-next-line
    ({ data }) => {
      const name = data?.[`Approver${id}_Name`] || '';
      const image = data?.[`Approver${id}_Image`] || '';

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            textAlign: 'left',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            // padding: '0 8px',
          }}
        >
          {image && (
            <img
              src={image}
              alt="Approver"
              style={{ width: '25px', height: '25px', marginRight: '8px', borderRadius: '50%' }}
            />
          )}
          <span style={{ textOverflow: 'ellipsis' }}>{name}</span>
        </div>
      );
    };

const ProductionOpenGrid = ({ superSearch, setProductionDataLength, onSaveSuccess }) => {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const themeDark = themeBalham.withPart(colorSchemeDarkBlue);
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [recipesByCustomer, setRecipesByCustomer] = useState({});
  const recipesByCustomerRef = useRef({});
  // Cache API response by CustomerID to avoid duplicate GetRecipeByCustomer calls
  const [recipesByCustomerID, setRecipesByCustomerID] = useState({});
  const recipesByCustomerIDRef = useRef(recipesByCustomerID);
  useEffect(() => {
    recipesByCustomerIDRef.current = recipesByCustomerID;
  }, [recipesByCustomerID]);
  const gridApiRef = useRef(null);
  const [recipeUpdateCounter, setRecipeUpdateCounter] = useState(0);
  const [changedRows, setChangedRows] = useState([]);
  const [PDODate, setPDODate] = useState(new Date());
  const [PIDateFrom, setPIDateFrom] = useState(new Date());
  const [PIDateTo, setPIDateTo] = useState(new Date());
  const [ProductionMonth, setProductionMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  ); // next m,

  // Keep ref in sync with state
  useEffect(() => {
    recipesByCustomerRef.current = recipesByCustomer;
  }, [recipesByCustomer]);

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchParams, setSearchParams] = useState({
    PINo: '',
    customer: '',
    QuotationNo: '',
    opportunity: '',
    status: '',
  });
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  // Fetch recipes once per unique CustomerID and cache by CustomerID
  const fetchRecipesForUniqueCustomerIDs = useCallback(
    async (rows, cache) => {
      const rowsWithRecipe = rows.filter(
        (r) => r.TypeID !== undefined && r.TypeID !== null
      );
      const uniqueCustomerIDs = [
        ...new Set(
          rowsWithRecipe.map((r) => (r.TypeID === 2 ? r.Cust_ID : 0))
        ),
      ];
      const missing = uniqueCustomerIDs.filter((id) => !cache[id]);
      if (missing.length === 0) return;

      setRecipeLoading(true);
      try {
        const orgId = userData?.userDetails?.orgId;
        const branchId = userData?.userDetails?.branchID;
        const baseUrl = `Production/GetRecipeByCustomer?Org_ID=${orgId}&Branch_ID=${branchId}`;
        const results = await Promise.all(
          missing.map((CustomerID) =>
            Get(`${baseUrl}&CustomerID=${CustomerID}`).then((res) => ({
              CustomerID,
              data: res.data?.Data || [],
            }))
          )
        );
        setRecipesByCustomerID((prev) => {
          const next = { ...prev };
          results.forEach(({ CustomerID: id, data }) => {
            next[id] = data;
          });
          return next;
        });
      } catch (err) {
        console.error('Error fetching Recipes:', err);
      } finally {
        setRecipeLoading(false);
      }
    },
    [userData?.userDetails?.orgId, userData?.userDetails?.branchID]
  );

  // Row style function to highlight rows with no recipes
  const getRowStyle = useCallback((params) => {
    // Check for MasterApplyForReapproval (existing logic)
    // if (params.data.MasterApplyForReapproval === 'Y') {
    //   return { backgroundColor: 'rgba(99, 145, 58, 0.1)' }; // CYCLO green background
    // }

    // Replicate the exact same logic as RecipeDropdownRenderer to determine if row has recipes
    const hasRecipeType = params.data.TypeID !== undefined && params.data.TypeID !== null;

    // Only check for recipes if the row has a recipe type
    if (hasRecipeType) {
      // Get recipes for this row based on PIFPLISTID - replicate exact logic from RecipeDropdownRenderer (line 260)
      // Check if recipes have been fetched for this row (key exists in state)
      const recipesForRow = recipesByCustomer[params.data.PIFPLISTID];

      // Only check if recipes have been fetched (key exists in recipesByCustomer)
      // This prevents false positives while recipes are still loading
      if (recipesForRow !== undefined) {
        // Apply the exact same logic as RecipeDropdownRenderer (line 260: default to empty array)
        let rowRecipes = recipesForRow || [];

        // Additional client-side filtering - replicate exact logic from RecipeDropdownRenderer (lines 264-269)
        if (params.data.ColorID && params.data.Composition_ID) {
          rowRecipes = rowRecipes.filter(
            (recipe) =>
              recipe.FinalGoalColorID === params.data.ColorID &&
              recipe.CompositionID === params.data.Composition_ID
          );
        }

        // If no recipes found after filtering (same condition as RecipeDropdownRenderer showing "No options")
        // highlight with red tint
        if (rowRecipes.length === 0) {
          return { backgroundColor: 'rgba(255, 0, 0, 0.15)' }; // Red tint background (slightly more visible)
        }
      }
    }

    return null;
  }, [recipesByCustomer]);

  const RecipeDropdownRenderer = useCallback(
    (params) => {
      // eslint-disable-next-line
      const [selectedRecipe, setSelectedRecipe] = useState(params.data.selectedRecipe || null);
      // Use TypeID from API: 2 = Customize, otherwise Standard
      const hasRecipeType = params.data.TypeID !== undefined && params.data.TypeID !== null;

      // Get recipes for this row based on PIFPLISTID - use ref to access latest value without recreating renderer
      // eslint-disable-next-line
      let rowRecipes = recipesByCustomerRef.current[params.data.PIFPLISTID] || [];

      // Additional client-side filtering to ensure recipes match ColorID and Composition_ID
      // This provides an extra layer of filtering in case the API doesn't filter correctly
      if (hasRecipeType && params.data.ColorID && params.data.Composition_ID) {
        rowRecipes = rowRecipes.filter(
          (recipe) =>
            recipe.FinalGoalColorID === params.data.ColorID &&
            recipe.CompositionID === params.data.Composition_ID
        );
      }

      // Sync selectedRecipe when it's cleared from parent (when recipe type changes)
      // eslint-disable-next-line
      useEffect(() => {
        // eslint-disable-next-line
        if (params.data.selectedRecipe === null && selectedRecipe !== null) {
          setSelectedRecipe(null);
        }
        // eslint-disable-next-line
        if (params.data.selectedRecipe && params.data.selectedRecipe !== selectedRecipe) {
          // eslint-disable-next-line
          setSelectedRecipe(params.data.selectedRecipe);
        }
        // eslint-disable-next-line
      }, [params.data.selectedRecipe]);

      // Reset selectedRecipe when TypeID is not set
      // eslint-disable-next-line
      useEffect(() => {
        // eslint-disable-next-line
        if (!hasRecipeType) {
          setSelectedRecipe(null);
          // eslint-disable-next-line
          params.data.selectedRecipe = null;
        }
        // eslint-disable-next-line
      }, [hasRecipeType]);

      // Note: Cell refresh is handled in handleRecipeTypeChange after recipes are fetched
      // The key on Autocomplete will force re-render when recipes change

      const handleRecipeChange = async (event, newValue) => {
        const previousRecipe = selectedRecipe;
        setSelectedRecipe(newValue);

        // Update the cell value
        // eslint-disable-next-line
        params.data.selectedRecipe = newValue;
        // eslint-disable-next-line
        params.api.refreshCells({ rowNodes: [params.node], force: true });

        let recipeDetails = [];

        // Fetch recipe details if a recipe is selected
        if (newValue?.RecipeID) {
          try {
            const response = await Get(
              `Production/GetRecipeDetailsByRecipeId?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&RecipeID=${newValue.RecipeID}`
            );
            recipeDetails = response.data?.Data || [];
          } catch (error) {
            console.error('Error fetching recipe details:', error);
            enqueueSnackbar('Error loading recipe details', { variant: 'error' });
          }
        }

        // Track the change with recipe details
        if (previousRecipe?.RecipeID !== newValue?.RecipeID) {
          // eslint-disable-next-line
          const rowData = params.data;
          const change = {
            PIFPLISTID: rowData.PIFPLISTID,
            PIID: rowData.PIID,
            PIDtlID: rowData.PIDtlID,
            Item_Code: rowData.Item_Code,
            Description: rowData.Description,
            Quantity: rowData.Quantity,
            previousRecipe,
            selectedRecipe: newValue,
            selectedRecipeType: rowData.TypeID === 2 ? 'Customize' : 'Standard',
            recipeDetails,
            timestamp: new Date().toISOString(),
          };

          setChangedRows((prev) => {
            const filtered = prev.filter((row) => row.PIFPLISTID !== rowData.PIFPLISTID);
            return newValue ? [...filtered, change] : filtered;
          });
        }
      };

      // Use the PIFPLISTID, TypeID, and recipe IDs as key to force re-render when recipes change
      const recipeIds = rowRecipes.map((r) => r.RecipeID).join(',');
      const autocompleteKey = `${params.data.PIFPLISTID}-${params.data.TypeID || 'none'}-${rowRecipes.length
        }-${recipeIds}`;

      return (
        <Autocomplete
          key={autocompleteKey} // Force re-render when key changes
          fullWidth
          size="small"
          options={rowRecipes}
          value={selectedRecipe}
          onChange={handleRecipeChange}
          getOptionLabel={(option) => option?.RecipeName || ''}
          isOptionEqualToValue={(option, value) => option?.RecipeID === value?.RecipeID}
          disabled={!hasRecipeType}
          renderInput={(prms) => (
            <TextField
              {...prms}
              variant="standard"
              size="small"
              placeholder={
                hasRecipeType
                  ? recipeLoading
                    ? 'Loading recipes...'
                    : 'Select Recipe'
                  : 'No Type Available'
              }
            />
          )}
        />
      );
    },
    [recipeLoading, userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]
  );

  // Details Icon Cell Renderer
  // History Icon Renderer
  const HistoryIconRenderer = (params) => {
    const [open, setOpen] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const handleOpen = async () => {
      // eslint-disable-next-line
      const pidtlId = params.data?.PIDtlID;

      if (!pidtlId) {
        enqueueSnackbar('PIDtlID not found', { variant: 'warning' });
        return;
      }

      setLoadingHistory(true);
      try {
        const response = await Get(`GetDividedQtyByHistory?PIDtlID=${pidtlId}`);

        if (response.status === 200 && response.data) {
          // Handle both array response and object with Data property
          let data = [];
          if (Array.isArray(response.data)) {
            data = response.data;
            // eslint-disable-next-line
          } else if (response.data.Data && Array.isArray(response.data.Data)) {
            // eslint-disable-next-line
            data = response.data.Data;
            // eslint-disable-next-line
          } else if (Array.isArray(response.data)) {
            // eslint-disable-next-line
            data = response.data;
          }

          // Group data by HistoryDtlID
          const groupedData = {};
          data.forEach((item) => {
            const historyDtlId = item.HistoryDtlID;
            if (!groupedData[historyDtlId]) {
              groupedData[historyDtlId] = [];
            }
            groupedData[historyDtlId].push(item);
          });

          // Convert to array of pairs (each pair is an array of items with same HistoryDtlID)
          const pairs = Object.values(groupedData);
          setHistoryData(pairs);
        } else {
          setHistoryData([]);
        }
        setOpen(true);
      } catch (error) {
        console.error('Error fetching history:', error);
        enqueueSnackbar('Error loading history', { variant: 'error' });
        setHistoryData([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    return (
      <>
        <Tooltip title="View History" arrow>
          <IconButton
            onClick={handleOpen}
            // eslint-disable-next-line
            disabled={params.data.HistoryCount === 0}
            size="small"
            sx={{ padding: '4px' }}
          >
            {loadingHistory ? (
              <Iconify icon="eos-icons:loading" width={18} />
            ) : (
              <Iconify icon="mdi:history" width={18} />
            )}
          </IconButton>
        </Tooltip>

        <Dialog open={open} fullWidth maxWidth="lg" onClose={() => setOpen(false)}>
          <DialogTitle>Quantity Division History</DialogTitle>
          <DialogContent>
            {historyData.length > 0 ? (
              <Stack spacing={3} sx={{ mt: 2 }}>
                {historyData.map((pair, pairIndex) => (
                  <Card key={pairIndex} sx={{ p: 2 }}>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Reapproval Date: {fDateTime(pair[0]?.ReapprovedDate, 'dd MMM yyyy hh:mm:ss a')}
                      </Typography>
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Typography variant="body2">
                          <strong>Original Qty:</strong> {fNumber(pair[0]?.OriginalQTY || 0)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Divided Qty per Row:</strong> {fNumber(pair[0]?.DividedQtyPerRow || 0)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Total Rows:</strong> {pair[0]?.TotalRowsPerHistoryDtlID || 0}
                        </Typography>
                      </Stack>
                    </Stack>
                    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                      <Scrollbar>
                        <Table stickyHeader size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ minWidth: 150 }}>Item Code</TableCell>
                              <TableCell sx={{ minWidth: 200 }}>Description</TableCell>
                              <TableCell sx={{ minWidth: 120 }}>Color Name</TableCell>
                              <TableCell align="right" sx={{ minWidth: 100 }}>
                                Original Qty
                              </TableCell>
                              <TableCell align="right" sx={{ minWidth: 120 }}>
                                Divided Qty per Row
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {pair.map((row, index) => (
                              <TableRow key={index}>
                                <TableCell>{row.Item_Code || '-'}</TableCell>
                                <TableCell>{row.Description || '-'}</TableCell>
                                <TableCell>{row.ColorName || '-'}</TableCell>
                                <TableCell align="right">{fNumber(row.OriginalQTY || 0)}</TableCell>
                                <TableCell align="right">{fNumber(row.DividedQtyPerRow || 0)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Scrollbar>
                    </TableContainer>
                  </Card>
                ))}
              </Stack>
            ) : (
              <EmptyContent title="No History Data" sx={{ py: 8 }} />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  const DetailsIconRenderer = (params) => {
    const [open, setOpen] = useState(false);
    const [detail, setDetail] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const handleOpen = async () => {
      // eslint-disable-next-line
      const selectedRecipe = params.data.selectedRecipe;

      if (!selectedRecipe) {
        enqueueSnackbar('Please select a recipe first', { variant: 'warning' });
        return;
      }

      setLoadingDetails(true);
      try {
        // First, check if we already have the recipe details in changedRows
        // eslint-disable-next-line
        const changedRow = changedRows.find((row) => row.PIFPLISTID === params.data.PIFPLISTID);

        let recipeDetails = [];

        if (changedRow?.recipeDetails) {
          // Use the recipe details from changedRows if available
          recipeDetails = changedRow.recipeDetails;
        } else {
          // Fetch recipe details if not available in changedRows
          const response = await Get(
            `Production/GetRecipeDetailsByRecipeId?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&RecipeID=${selectedRecipe.RecipeID}`
          );
          recipeDetails = response.data?.Data || [];

          // Also update the changedRows with the fetched details for future use
          // if (recipeDetails.length > 0) {
          //   setChangedRows((prev) =>
          //     prev.map((row) =>
          //       row.PIFPLISTID === params.data.PIFPLISTID ? { ...row, recipeDetails } : row
          //     )
          //   );
          // }
        }

        const detailWithQty = recipeDetails.map((d) => ({
          ...d,
          // eslint-disable-next-line
          UOMName: params.data?.UOMNAME,
          // eslint-disable-next-line
          UOMID: params.data?.UOMID,
          Branch_ID: userData?.userDetails?.branchID || 1,
          Org_ID: userData?.userDetails?.orgId || 1,
          // eslint-disable-next-line
          PIQuantity: params.data.SplitQuantity,
        }));

        setDetail(detailWithQty);
        setOpen(true);
      } catch (error) {
        console.error('Error fetching recipe details:', error);
        enqueueSnackbar('Error loading recipe details', { variant: 'error' });
      } finally {
        setLoadingDetails(false);
      }
    };

    return (
      <>
        <Tooltip title="View Recipe Details" arrow>
          <IconButton
            onClick={handleOpen}
            // eslint-disable-next-line
            disabled={!params.data.selectedRecipe || loadingDetails}
            size="small"
            sx={{ padding: '4px' }}
          >
            {loadingDetails ? (
              <Iconify icon="eos-icons:loading" width={18} />
            ) : (
              <Iconify icon="hugeicons:property-view" width={18} />
            )}
          </IconButton>
        </Tooltip>

        {/* Details Dialog - remains the same */}
        <Dialog open={open} fullWidth maxWidth="lg" onClose={() => setOpen(false)}>
          <DialogTitle>Recipe Items</DialogTitle>
          <DialogContent>
            {detail.length > 0 ? (
              <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400 }}>
                <Scrollbar>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ minWidth: 100 }}>Sub Category</TableCell>
                        <TableCell sx={{ minWidth: 130 }}>Lot No</TableCell>
                        <TableCell sx={{ minWidth: 120 }}>Item</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>Color Name</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>Color Picture</TableCell>
                        <TableCell align="right" sx={{ minWidth: 100 }}>
                          Blend %
                        </TableCell>
                        <TableCell align="right" sx={{ minWidth: 100 }}>
                          Required Qty (+10%)
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detail.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{row.SubCat_Name}</TableCell>
                          <TableCell>{row.RmLotNo}</TableCell>
                          <TableCell>{row.ItemDescription}</TableCell>
                          <TableCell>{row.ColorName}</TableCell>
                          <TableCell>
                            <Avatar
                              alt={row.ColorName}
                              src={row.ColorPictureURL || '/assets/images/no-image.jpg'}
                              variant="square"
                              sx={{
                                width: 40,
                                height: 40,
                                '& img': {
                                  objectFit: 'contain',
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">{row.RequiredPercentage}%</TableCell>
                          <TableCell align="right">
                            {`${fNumber(((row.PIQuantity * row.RequiredPercentage) / 100) * 1.1)} ${row?.UOMName || ''
                              }`}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
            ) : (
              <EmptyContent title="No Data" sx={{ py: 8 }} />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  // Navigation function
  const moveToEditForm = (PIID) => {
    navigate(paths.dashboard.transaction.pi.edit(PIID));
  };
  const moveToRevisionForm = (PIID) => {
    navigate(paths.dashboard.transaction.pi.revision(PIID));
  };
  const moveToApproverForm = (PIID) => {
    navigate(paths.dashboard.transaction.pi.approver(PIID));
  };
  const moveToPDFView = (PIID) => {
    navigate(paths.dashboard.transaction.pi.pdf(PIID));
  };

  const deleteProformaInvoice = async () => {
    if (!selectedPIID) {
      enqueueSnackbar('Proforma ID not selected.', { variant: 'error' });
      return;
    }
    try {
      const response = await Delete(`DeleteProformaInvoice?piid=${selectedPIID}`);
      if (response.status === 200) {
        enqueueSnackbar('Proforma invoice deleted successfully', { variant: 'success' });
        fetchPis();
      } else {
        enqueueSnackbar('Failed to delete proforma invoice', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting proforma invoice:', error);
      enqueueSnackbar('Error deleting proforma invoice', { variant: 'error' });
    }
  };

  const confirm = useBoolean();
  const [selectedPIID, setSelectedPIID] = useState(null);

  const containerStyle = useMemo(() => ({ width: '100%', height: '500px' }), []);

  // Fetch pi data - UPDATED FOR NEW RESPONSE STRUCTURE
  const fetchPis = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetAllRevisePIListwithproduction?ORGID=${userData?.userDetails?.orgId}&BRANCHID=${userData?.userDetails?.branchID
        }&RoleID=${70}&UserID=${userData?.userDetails?.userId}&fromDate=${fDate(
          PIDateFrom,
          'yyyy-MM-dd'
        )}&toDate=${fDate(PIDateTo, 'yyyy-MM-dd')}`
      );

      console.log('API Response:', response); // Debug log

      if (response.status === 200 && response.data.Success) {
        // Process the new response structure with only ProformaDtl
        const proformaDtl = response.data.ProformaDtl || [];
        setProductionDataLength(proformaDtl.length);

        console.log('ProformaDtl data:', proformaDtl); // Debug log

        const formattedData = proformaDtl.map((dtl) => {
          // Add recipe selection data
          const rwDta = {
            ...dtl,
            MasterPINo: dtl?.HistoryCount > 0 ? `${dtl?.MasterPINo}-R${dtl?.HistoryCount}` : dtl?.MasterPINo,
            DetailColorAndCode: `${dtl?.DetailColor} - ${dtl?.detailcolorcode}` || '-',
            OrderNo: dtl?.MasterPINo.split('O')[1] || '-',
            selectedRecipe:
              dtl?.RecipeID !== 0
                ? {
                  RecipeName: dtl?.RecipeName || '',
                  RecipeID: dtl?.RecipeID || null,
                }
                : null,
          };

          return rwDta;
        });

        console.log('Formatted data:', formattedData); // Debug log
        setRowData(formattedData);

        if (formattedData.length === 0) {
          enqueueSnackbar('No Confirmed PI found for the selected date range', { variant: 'info' });
        }
      } else {
        setRowData([]);
        enqueueSnackbar(response.data?.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error('Error fetching production data:', error);
      enqueueSnackbar('Failed to load production data', { variant: 'error' });
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar, setProductionDataLength, PIDateFrom, PIDateTo]);
  useEffect(() => {
    fetchPis();
  }, [fetchPis]);

  // Fetch recipes once per unique CustomerID when rowData changes
  useEffect(() => {
    if (rowData.length > 0) {
      fetchRecipesForUniqueCustomerIDs(rowData, recipesByCustomerIDRef.current);
    }
  }, [rowData, fetchRecipesForUniqueCustomerIDs]);

  // Derive recipesByCustomer (per PIFPLISTID) from recipesByCustomerID cache
  useEffect(() => {
    if (rowData.length === 0) return;
    const next = {};
    rowData.forEach((row) => {
      if (row.TypeID === undefined || row.TypeID === null) return;
      const customerID = row.TypeID === 2 ? row.Cust_ID : 0;
      const fullList = recipesByCustomerID[customerID] || [];
      let filtered = fullList;
      if (row.ColorID && row.Composition_ID) {
        filtered = fullList.filter(
          (recipe) =>
            recipe.FinalGoalColorID === row.ColorID &&
            recipe.CompositionID === row.Composition_ID
        );
      }
      next[row.PIFPLISTID] = filtered;
    });
    setRecipesByCustomer(next);
  }, [rowData, recipesByCustomerID]);

  // Refresh row styles when recipes are updated
  useEffect(() => {
    if (gridApiRef.current && Object.keys(recipesByCustomer).length > 0) {
      // Increment counter to force getRowStyle to be re-evaluated
      setRecipeUpdateCounter((c) => c + 1);

      // Force refresh of all visible rows to re-apply row styles when recipes change
      // Using setTimeout to ensure state has fully updated
      setTimeout(() => {
        if (gridApiRef.current) {
          const allNodes = [];
          gridApiRef.current.forEachNode((node) => {
            allNodes.push(node);
          });
          if (allNodes.length > 0) {
            gridApiRef.current.refreshCells({ rowNodes: allNodes, force: true });
          }
        }
      }, 100);
    }
  }, [recipesByCustomer]);

  // Filter data based on search parameters
  const filteredData = useMemo(
    () =>
      rowData.filter(
        (dtl) =>
          dtl.MasterPINo?.trim().toLowerCase().includes(searchParams?.PINo?.trim().toLowerCase()) &&
          dtl?.MasterWIC_Name?.toLowerCase().includes(searchParams?.customer?.toLowerCase()) &&
          dtl?.MasterQuotationNo?.toLowerCase().includes(searchParams?.QuotationNo.toLowerCase()) &&
          (dtl?.MasterOpportunityName || '')
            .toLowerCase()
            .includes(searchParams?.opportunity?.toLowerCase()) &&
          dtl.MasterPIStatus.toLowerCase().includes(searchParams?.status?.toLowerCase())
      ),
    [rowData, searchParams]
  );

  const lbsToKG = (quantity) => quantity / 2.20462;
  console.log('ProductionMonth', fDate(ProductionMonth, 'yyyy-MM'));
  // Add this function to handle submission
  const handleSubmitProduction = async () => {
    if (changedRows.length === 0) {
      enqueueSnackbar('No changes to submit', { variant: 'warning' });
      return;
    }
    if (!PDODate) {
      enqueueSnackbar('Please select Production Order Date', { variant: 'error' });
      return;
    }

    try {
      // Helper function to format date to API format (YYYY-MM-DDTHH:mm:ss)
      const formatDateForAPI = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}T00:00:00`;
      };

      // Get ProductionMonth from PDODate (format: "YYYY-MM")
      // const productionMonth = `${PDODate.getFullYear()}-${String(PDODate.getMonth() + 1).padStart(
      //   2,
      //   '0'
      // )}`;

      // Prepare the request body according to the new API structure
      const requestBody = {
        PDODate: formatDateForAPI(PDODate),
        ProductionMonth: fDate(ProductionMonth, 'yyyy-MM'),
        Org_ID: userData?.userDetails?.orgId || 1,
        Branch_ID: userData?.userDetails?.branchID || 1,
        CreatedBy: userData?.userDetails?.userId || 1,
        Details: await Promise.all(
          changedRows.map(async (changedRow) => {
            // Find the full row data to access all fields
            const fullRowData =
              rowData.find((row) => row.PIFPLISTID === changedRow.PIFPLISTID) || changedRow;
            console.log('fullRowData', fullRowData);

            // Get recipe details - first from changedRow (set when recipe is selected), otherwise fetch
            let recipeDetails = changedRow.recipeDetails || [];

            // If recipe details are not available, fetch them
            if (
              recipeDetails.length === 0 &&
              (changedRow.selectedRecipe?.RecipeID || fullRowData.selectedRecipe?.RecipeID)
            ) {
              try {
                const recipeID =
                  changedRow.selectedRecipe?.RecipeID || fullRowData.selectedRecipe?.RecipeID;
                const response = await Get(
                  `Production/GetRecipeDetailsByRecipeId?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}&RecipeID=${recipeID}`
                );
                recipeDetails = response.data?.Data || [];

                // Update the changedRows with the fetched details
                setChangedRows((prev) =>
                  prev.map((prevRow) =>
                    prevRow.PIFPLISTID === changedRow.PIFPLISTID ? { ...prevRow, recipeDetails } : prevRow
                  )
                );
              } catch (error) {
                console.error('Error fetching recipe details for submission:', error);
                enqueueSnackbar(
                  `Error loading recipe details for ${changedRow.Item_Code || fullRowData.Item_Code
                  }`,
                  {
                    variant: 'error',
                  }
                );
              }
            }

            // Convert quantity to KG if needed (assuming quantity is in lbs, convert to KG)
            const quantityInKG =
              fullRowData.UOMNAME?.toLowerCase() === 'lbs'
                ? lbsToKG(fullRowData.SplitQuantity || 0)
                : fullRowData.SplitQuantity || 0;

            // Format dates
            const orderDate = formatDateForAPI(
              fullRowData.MasterOrderDate || fullRowData.OrderDate || new Date()
            );

            const deliveryDate = formatDateForAPI(
              fullRowData.DeliveryDate || fullRowData.RequiredDate || new Date()
            );

            // Format SubDetails from recipe details
            const selectedRecipeID =
              changedRow.selectedRecipe?.RecipeID || fullRowData.selectedRecipe?.RecipeID || null;
            const subDetails = recipeDetails.map((detail) => {
              const actualRequiredQty = (quantityInKG * (detail.RequiredPercentage || 0)) / 100;
              // Calculate required quantity with 10% buffer
              const requiredQty = ((quantityInKG * (detail.RequiredPercentage || 0)) / 100) * 1.1;

              return {
                RecipeID: selectedRecipeID,
                RecipeDtlID: detail.RecipeDtlID || null,
                RequiredQty: parseFloat(requiredQty.toFixed(2)),
                ActualReqQty: parseFloat(actualRequiredQty.toFixed(2)),
                ItemID: detail.ItemID || null,
                UOMID: detail.UOMID || fullRowData.UOMID || 1,
              };
            });

            return {
              PIID: changedRow.PIID || fullRowData.PIID,
              PIRFPLISTID: changedRow.PIFPLISTID,
              PIDtlID: changedRow.PIDtlID,
              ItemID: fullRowData.ItemID || fullRowData.Item_ID || null,
              InitiativeID: fullRowData.InitiativeID || null,
              Sustainability_ID: fullRowData.Sustainability_ID || null,
              CustomerID: fullRowData.MasterWIC_ID || null,
              MainBuyerID: fullRowData.MasterEnd_CustomerID || null,
              OrderDate: orderDate,
              UOMID: fullRowData.UOMID || 1,
              RequiredKG: quantityInKG,
              DeliveryDate: deliveryDate,
              ColorReference: fullRowData.ColorRefCode || '',
              RecipeType: changedRow.selectedRecipeType || fullRowData.selectedRecipeType || '',
              RecipeID:
                changedRow.selectedRecipe?.RecipeID || fullRowData.selectedRecipe?.RecipeID || null,
              SubDetails: subDetails,
            };
          })
        ),
      };

      console.log('Submitting production data:', requestBody);

      // Make the API call
      const response = await Post('Production/SaveProductionOrder', requestBody);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Production order saved successfully', { variant: 'success' });
        setChangedRows([]); // Clear changed rows after successful submission

        // Optional: Refresh the grid data
        fetchPis();

        // Navigate to next tab if callback provided
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      } else {
        enqueueSnackbar('Error saving production order', { variant: 'error' });
      }
    } catch (error) {
      console.error('Submission error:', error);
      enqueueSnackbar(error.message || 'Error submitting production order', {
        variant: 'error',
        autoHideDuration: 5000,
      });
    }
  };

  // Helper function to format date (add this near your other helper functions)
  const formatDateToUTC = (date) => new Date(date).toISOString().split('T')[0];

  // UPDATED columnDefs for single grid (no master-detail)
  const columnDefs = useMemo(
    () => [
      {
        field: 'Description',
        headerName: 'Product Description',
        minWidth: 300,
        filter: 'agTextColumnFilter',
        enableCellDrag: false,
      },
      {
        field: 'OrderNo',
        headerName: 'PI No. (Short)',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        enableCellDrag: false,
      },
      {
        field: 'InitiativeName',
        headerName: 'Initiative',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        enableCellDrag: false,
      },
      {
        field: 'Sustainability_Name',
        headerName: 'Sustainability',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        enableCellDrag: false,
      },
      {
        field: 'MasterPINo',
        headerName: 'PI No',
        minWidth: 170,
        filter: 'agTextColumnFilter',
        hide: true,
        enableCellDrag: false,
      },
      {
        field: 'MasterWIC_Name',
        headerName: 'Customer',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        enableCellDrag: false,
      },
      {
        field: 'MasterEnd_Cust_Name',
        headerName: 'Main Buyer',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        enableCellDrag: false,
      },
      {
        field: 'Item_Code',
        headerName: 'Item Code',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        enableCellDrag: false,
      },
      {
        field: 'ColorRefCode',
        headerName: 'Color Ref Code',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
        enableCellDrag: false,
      },
      {
        field: 'MasterPIDate',
        headerName: 'PI Date',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => fDate(params.value) || '-',
        enableCellDrag: false,
      },
      {
        field: 'MasterValidFrom',
        headerName: 'PI Valid From',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => fDate(params.value) || '-',
        enableCellDrag: false,
      },
      {
        field: 'MasterValidUntil',
        headerName: 'PI Valid Until',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => fDate(params.value) || '-',
        enableCellDrag: false,
      },
      {
        field: 'DeliveryDueDate',
        headerName: 'Delivery Due Date',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => fDate(params.value) || '-',
        enableCellDrag: false,
      },
      {
        field: 'Quantity',
        headerName: 'Required Qty',
        minWidth: 100,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => {
          if (params.value === undefined || params.value === null) return '';
          return `${fNumber(params.data.SplitQuantity || params.value)} ${params.data?.UOMNAME || ''}`;
        },
      },
      {
        field: 'Color_and_Code',
        headerName: 'Color and Code',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        enableCellDrag: false,
      },
      {
        field: 'DetailColorAndCode',
        headerName: 'Detail Color and Code',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        enableCellDrag: false,
        valueFormatter: (params) => params?.value || '-',
      },

      {
        field: 'TypeName',
        headerName: 'Recipe Type',
        minWidth: 120,
        editable: false,
        enableCellDrag: false,
        filter: 'agTextColumnFilter',
        cellRenderer: (params) => {
          const typeName = params.value || '-';
          const isCustomize = params.data.TypeID === 2;
          return (
            <div
              style={{
                fontSize: '14px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: isCustomize ? 'rgba(99, 145, 58, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                color: isCustomize ? '#63913a' : '#1976d2',
                display: 'inline-block',
              }}
            >
              {typeName}
            </div>
          );
        },
      },
      {
        field: 'selectedRecipe',
        headerName: 'Recipe',
        minWidth: 200,
        cellRenderer: RecipeDropdownRenderer,
        editable: false,
        enableCellDrag: false,
      },
      {
        field: 'details',
        headerName: 'BOM',
        minWidth: 80,
        cellRenderer: DetailsIconRenderer,
        filter: false,
        sortable: false,
        resizable: false,
        cellStyle: { textAlign: 'center' },
        enableCellDrag: false,
      },
      {
        field: 'history',
        headerName: 'History',
        minWidth: 80,
        cellRenderer: HistoryIconRenderer,
        filter: false,
        sortable: false,
        resizable: false,
        cellStyle: { textAlign: 'center' },
        enableCellDrag: false,
      },
      // {
      //   field: 'MasterPIStatus',
      //   headerName: 'Status',
      //   minWidth: 120,
      //   filter: 'agSetColumnFilter',
      //   cellRenderer: StatusRenderer,
      //   enableCellDrag: false,
      // },
    ],
    // eslint-disable-next-line
    []
  );

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
      enableCellDrag: false, // Disable cell dragging by default for all columns
    }),
    []
  );

  const onGridReady = useCallback((params) => {
    gridApiRef.current = params.api;
    params.api.sizeColumnsToFit();
  }, []);

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleSearchChange = (field) => (event) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={containerStyle}>
      <Stack
        spacing={2}
        justifyContent="space-between"
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ mb: 2 }}
      >
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
          <DesktopDatePicker
            label="Production Order Date"
            variant="outlined"
            value={PDODate}
            format="dd MMM yyyy"
            onChange={(newValue) => setPDODate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            slotProps={{
              textField: {
                size: 'small',
              },
            }}
          />
          <DesktopDatePicker
            label="Production Month"
            variant="outlined"
            value={ProductionMonth}
            views={['month', 'year']}
            format="MMM yyyy"
            onChange={(newValue) => setProductionMonth(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            slotProps={{
              textField: {
                size: 'small',
              },
            }}
          />

          {/* Submit Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitProduction}
            disabled={changedRows.length === 0}
            startIcon={<Iconify icon="mdi:check" />}
          >
            Submit Production ({changedRows.length})
          </Button>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="end">
          <Tooltip title="Zoom out" arrow placement="top">
            <IconButton
              color="primary"
              sx={{ border: '1px solid #eee' }}
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.1))}
            >
              <Iconify icon="si:zoom-out-duotone" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom">
            <Button
              onClick={() => setZoomLevel(1)}
              variant="outlined"
              size="small"
              sx={{ minWidth: 40 }}
            >
              {Math.round(zoomLevel * 100)}%
            </Button>
          </Tooltip>
          <Tooltip title="Zoom in" arrow placement="top">
            <IconButton
              color="primary"
              sx={{ border: '1px solid #eee' }}
              onClick={() => setZoomLevel((prev) => prev + 0.1)}
            >
              <Iconify icon="si:zoom-in-duotone" width={20} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Card sx={{ p: 2 }}>
        <Typography
          variant="body2"
          sx={{
            mb: 2,
            color: 'text.secondary',
            fontStyle: 'italic',
          }}
        >
          This grid shows the Confirmed PI.
        </Typography>
        <Tooltip title="Filter by PI Date Range" arrow placement="top-start">
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} mb={2}>
            {/* <Typography variant="h6">PI Date Range</Typography> */}
            <DesktopDatePicker
              label="PI Date From"
              variant="outlined"
              value={PIDateFrom}
              format="dd MMM yyyy"
              onChange={(newValue) => setPIDateFrom(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />

            <DesktopDatePicker
              label="PI Date To"
              variant="outlined"
              value={PIDateTo}
              format="dd MMM yyyy"
              onChange={(newValue) => setPIDateTo(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
          </Stack>
        </Tooltip>
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            width: `${100 / zoomLevel}%`,
            height: `${160 / zoomLevel}%`,
            overflow: 'hidden',
          }}
        >
          <Scrollbar>
            <AgGridReact
              className="ag-theme-material"
              theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowHeight={35}
              headerHeight={40}
              getRowStyle={getRowStyle}
              animateRows
              pagination
              paginationPageSize={20}
              domLayout="autoHeight"
              suppressRowClickSelection
              onGridReady={onGridReady}
              overlayNoRowsTemplate={
                '<span class="ag-overlay-no-rows-center" style="font-size: 16px; color: #919EAB;">No Confirmed PI found for the selected date range.</span>'
              }
              // Fill Handle Configuration - UPDATED
              // enableFillHandle
              // enableRangeSelection
              // fillHandleDirection="xy"
              // Editing Configuration - UPDATED
              // stopEditingWhenCellsLoseFocus
              // enterMovesDownAfterEdit
              // singleClickEdit={false}
              // FIX: Prevent text selection during operations
              // suppressDragLeaveHidesColumns
              // suppressMakeColumnVisibleAfterUnGroup
              // onFirstDataRendered={onFirstDataRendered}
              // onCellValueChanged={(params) => {
              //   // Log any cell value changes for debugging
              //   console.log('Cell value changed:', params.column.getColId(), params.newValue);
              // }}
              // // FIX: Enhanced fill end handling (no longer needed for recipe type)
              // onFillEnd={(params) => {
              //   console.log('Fill operation ended:', params);
              // }}
              // FIX: Handle cell editing started to prevent text selection
              // onCellEditingStarted={(params) => {
              //   // Add class to prevent text selection during editing
              //   params.eGridCell.classList.add('no-select');
              // }}
              // // FIX: Handle cell editing stopped
              // onCellEditingStopped={(params) => {
              //   // Remove class after editing
              //   params.eGridCell.classList.remove('no-select');
              // }}
              // loading={loading}
              // components={{
              //   statusRenderer: StatusRenderer,
              //   recipeDropdownRenderer: RecipeDropdownRenderer,
              //   detailsIconRenderer: DetailsIconRenderer,
              // }}
              // // FIX: Disable text selection for better drag experience
              // enableCellTextSelection={false}
              // ensureDomOrder={false}
              // onFillEnd={handleFillOperation}
              // bottom message about what the grid is about
              noRowsOverlayComponentParams={{
                message: 'This grid shows the production planning for the selected date range.',
              }}


            />
          </Scrollbar>

          <ConfirmDialog
            open={confirm.value}
            onClose={() => {
              confirm.onFalse();
              setSelectedPIID(null);
            }}
            title="Delete"
            content="Are you sure want to delete?"
            action={
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  deleteProformaInvoice();
                  confirm.onFalse();
                }}
              >
                Delete
              </Button>
            }
          />
        </div>
      </Card>
    </div>
  );
};

export default ProductionOpenGrid;

ProductionOpenGrid.propTypes = {
  superSearch: PropTypes.any,
  setProductionDataLength: PropTypes.func,
  onSaveSuccess: PropTypes.func,
};