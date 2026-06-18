import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  Checkbox,
  Box,
  Typography,
  Autocomplete,
  Card,
  Stack,
  DialogContentText,
  FormControlLabel,
  MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';
import Scrollbar from 'src/components/scrollbar';
import { decrypt } from 'src/api/encryption';
import Iconify from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import { RHFAutocomplete } from 'src/components/hook-form';
import { Get } from 'src/api/apibasemethods';
import { useForm } from 'react-hook-form';
import { APP_API } from 'src/config-global';

const ProductSpecificInfo = ({
  setTotalAmount,
  totalAmount,
  totalQuantity,
  setTotalQuantity,
  cancelQuantity,
  setCancelQuantity,
  selectedRows,
  setSelectedRows,
  totalMark,
  setTotalMark,
  isGroup,
  setIsGroup,
  isPI,
  setIsPI,
}) => {
  const [open, setOpen] = useState(false);
  const [styleNo, setStyleNo] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAddStyleForm, setShowAddStyleForm] = useState(false);
  const [sizeRangeData, setSizeRangeData] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  const decryptObjectKeys = (data) => {
    const decryptedData = data.map((item) => {
      const decryptedItem = {};
      Object.keys(item).forEach((key) => {
        decryptedItem[key] = decrypt(item[key]);
      });
      return decryptedItem;
    });
    return decryptedData;
  };

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedPI, setSelectedPI] = useState('');

  const [newStyle, setNewStyle] = useState({
    styleNo: '',
    itemDescription: '',
    article: '',
    colorway: '',
    size: '',
    itemPrice: '',
    breakupType: '',
    styleFabrication: '',
  });

  const rowsPerPage = 10;

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setShowAddStyleForm(false);
    setDataList([]);
  };

  const handleStyleNoChange = (e) => setStyleNo(e.target.value);

  const handleCancelQuantityChange = (event) => {
    let value = parseInt(event.target.value, 10) || 0;
    if (value > totalQuantity) {
      enqueueSnackbar('values not be greater than total quantity!', { variant: 'error' });
      value = totalQuantity;
    }
    setCancelQuantity(value);
  };

  const [deleteIndex, setDeleteIndex] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const handleDeleteClick = (index) => {
    setDeleteIndex(index);
    setOpenConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deleteIndex !== null) {
      const updatedRows = [...selectedRows];
      updatedRows.splice(deleteIndex, 1);
      setSelectedRows(updatedRows);
      setDeleteIndex(null);
      setOpenConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteIndex(null);
    setOpenConfirm(false);
  };

  // Fetch Data (All or Specific)
  const handleGetData = async () => {
    setOpen(true);
    setLoading(true);
    try {
      let response;
      let data;

      if (isGroup && values?.group?.Inv_Cat_ID) {
        // Fetch items by category
        const apiUrl = `${APP_API}GetApprovedOrFGItemsByCategory?invCatId=${values.group.Inv_Cat_ID}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`;
        response = await axios.get(apiUrl);
        data = response.data;

        // Transform the data to match expected format
        const simplifiedData = data.map((item) => ({
          ItemID: item.ItemID,
          Color_ID: item.Color_ID,
          Composition_ID: item.Composition_ID,
          YarnCountID: item.YarnCountID,
          Remarks: item.Remarks,
          Material_Code: item.Material_Code,
          Specification: item.Specification,
          Composition_Name: item.Composition_Name,
          Color_and_Code: item.Color_and_Code,
          Yarn_Count_Name: item.Yarn_Count_Name,
          PIID: item.PIID,
          Party_Name: item.WIC_Name,
          PINo: item.PINo,
          UOMName: item.UOMName,
          Origin_Name: item.Origin_Name,
          Total_Passed_Qty: item.Total_Passed_Qty,
          PO_No: item.PO_No,

          Inv_Cat_Name: item.Inv_Cat_Name,
        }));

        setDataList(simplifiedData);
      } else if (isPI && values?.pi?.PIID) {
        // Fetch PI details
        console.log('this is form');
        const apiUrl = `${APP_API}GetApprovedOrFGItemsByCategory?invCatId=4&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`;
        response = await Get(apiUrl);
        data = response.data;
        console.log(data);
        const simplifiedData = data.map((item) => ({
          ItemID: item.ItemID,
          Color_ID: item.Color_ID,
          Composition_ID: item.Composition_ID,
          YarnCountID: item.YarnCountID,
          Remarks: item.Remarks,
          Material_Code: item.Material_Code,
          Specification: item.Specification,
          Composition_Name: item.Composition_Name,
          Color_and_Code: item.Color_and_Code,
          Yarn_Count_Name: item.Yarn_Count_Name,
          PIID: item.PIID,
          Party_Name: item.WIC_Name,
          PINo: item.PINo,
          UOMName: item.UOMName,
          Origin_Name: item.Origin_Name,
          Total_Passed_Qty: item.Total_Passed_Qty,
          PO_No: item.PO_No,

          Inv_Cat_Name: item.Inv_Cat_Name,
        }));
        setDataList(simplifiedData);
        console.log(simplifiedData);
      }

      console.log(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setDataList([]);
      enqueueSnackbar('Failed to fetch data', { variant: 'error' });
    }
    setLoading(false);
  };

  const getRowId = (row) =>
    [
      row.ItemID,
      row.Material_Code,
      row.PIID || '', // Include PIID if it exists
      row.Inv_Cat_ID || '', // Include category ID if it exists
    ].join('-');

  const handleSelectRow = (row) => {
    const rowId = getRowId(row);
    const isSelected = selectedRows.some((selected) => getRowId(selected) === rowId);

    if (isSelected) {
      setSelectedRows(selectedRows.filter((selected) => getRowId(selected) !== rowId));
    } else if (isGroup) {
      // For group items, transform the data to match the expected format
      setSelectedRows([
        ...selectedRows,
        {
          ...row,
          uniqueId: rowId,
          styleNo: row.PO_No || row.PINo || 'N/A',
          itemDescription: row.Specification,
          article: row.Material_Code,
          colorway: row.Inv_Cat_Name,
          size: row.UOMName,
          itemPrice: 0, // You might want to set a default price
          poQuantity: row.Total_Passed_Qty || 0,
          UOMName: row.UOMName,
        },
      ]);
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  const handlePageChange = (event, value) => setCurrentPage(value);

  useEffect(() => {
    axios
      .get('https://ssblapi.m5groupe.online:6449/api/SizeRange')
      .then((response) => {
        const decryptedData = decryptObjectKeys(response.data);
        setSizeRangeData(decryptedData);
      })
      .catch((error) => console.error('Error fetching sizes:', error));
  }, []);

  useEffect(() => {
    const updatedRows = selectedRows.map((row) => ({
      ...row,
      markupPerPc: row.itemPrice
        ? Number(row.itemPrice) - Number(row.vendorPrice || row.itemPrice)
        : 0,
      contractValue: row.poQuantity ? Number(row.poQuantity) * Number(row.itemPrice || 0) : 0,
    }));

    setSelectedRows((prevRows) => {
      const isSame = JSON.stringify(prevRows) === JSON.stringify(updatedRows);
      return isSame ? prevRows : updatedRows;
    });
  }, [selectedRows, setSelectedRows]);

  useEffect(() => {
    const totalQty = selectedRows.reduce(
      (sum, row) => sum + (row.Total_Passed_Qty || row.quantity || 0),
      0
    );
    const totalVal = selectedRows
      .reduce((sum, row) => sum + (row.contractValue || 0), 0)
      .toFixed(2);

    setTotalQuantity(totalQty);
    setTotalAmount(totalVal);
  }, [selectedRows, setTotalAmount, setTotalQuantity]);

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...selectedRows];
    updatedRows[index][field] = Number(value);

    if (field === 'vendorPrice') {
      updatedRows[index].markupPerPc =
        (updatedRows[index].itemPrice || 0) - updatedRows[index].vendorPrice;
    }

    if (field === 'poQuantity') {
      updatedRows[index].contractValue =
        Number(updatedRows[index].poQuantity || 0) * Number(updatedRows[index].itemPrice || 0);
    }

    setSelectedRows(updatedRows);
  };

  const methods = useForm();
  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();
  const [piDetails, setPiDetails] = useState(null);
  const [allPriceList, setAllPriceList] = useState([]);
  const [groupss, setGroups] = useState([]);

  const getpi = useCallback(async () => {
    try {
      const response = await Get(
        `${APP_API}GetApprovedOrFGItemsByCategory?invCatId=4&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const uniquePIs = response.data.reduce((acc, item) => {
        const existing = acc.find((i) => i.PIID === item.PIID);
        if (!existing) {
          acc.push({
            PIID: item.PIID,
            PINo: item.PINo,
          });
        }
        return acc;
      }, []);

      setAllPriceList(uniquePIs);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const getCategory = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllinvcategory?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const filteredCategories = response.data.filter((category) => category.Inv_Cat_ID !== 4);
      setPiDetails(filteredCategories);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const getPIbyID = useCallback(
    async (piId) => {
      try {
        const response = await Get(
          `getProformaInvoicesAndDetails?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&PIID=${piId}`
        );
        setGroups(response.data);
      } catch (error) {
        console.log(error);
      }
    },
    [userData?.userDetails?.orgId, userData?.userDetails?.branchID]
  );

  useEffect(() => {
    const fetchData = async () => {
      const promises = [getpi(), getCategory()];
      if (values?.pi?.PIID) {
        promises.push(getPIbyID(values.pi.PIID));
      }
      await Promise.all(promises);
    };
    fetchData();
  }, [getCategory, getPIbyID, getpi, values?.pi?.PIID]);
  const handleCheckboxChange = (type) => (e) => {
    // Reset states when switching between Group and PI
    setDataList([]);
    setSelectedRows([]);
    setValue(type === 'group' ? 'pi' : 'group', null); // Reset the other field

    if (type === 'group') {
      setIsGroup(e.target.checked);
      if (e.target.checked) setIsPI(false);
    } else {
      setIsPI(e.target.checked);
      if (e.target.checked) setIsGroup(false);
    }
  };

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" justifyContent="space-between">
        <Typography variant="h5" sx={{ mb: 1 }}>
          Purchase Requisition Details:
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControlLabel
            control={<Checkbox checked={isGroup} onChange={handleCheckboxChange('group')} />}
            label="Group"
          />
          <FormControlLabel
            control={<Checkbox checked={isPI} onChange={handleCheckboxChange('pi')} />}
            label="PI"
          />
        </Box>
      </Box>
      <Box
        rowGap={3}
        columnGap={2}
        display="flex"
        flexWrap="wrap"
        justifyContent="space-between"
        sx={{ mb: 2, mt: 2 }}
      >
        <Box width={{ xs: '100%', sm: '35%' }}>
          {isGroup ? (
            <RHFAutocomplete
              name="group"
              label="Select Group"
              options={piDetails}
              getOptionLabel={(option) => option.Inv_Cat_Name}
              isOptionEqualToValue={(option, value) => option.Inv_Cat_ID === value.Inv_Cat_ID}
              fullWidth
              value={values?.group || null}
              onChange={(_, newValue) => {
                setValue('group', newValue);
              }}
              margin="dense"
            />
          ) : (
            <RHFAutocomplete
              name="pi"
              label="Select PI"
              options={allPriceList}
              getOptionLabel={(option) => option.PINo}
              isOptionEqualToValue={(option, value) => option.PIID === value.PIID}
              fullWidth
              value={values?.pi || null}
              onChange={(_, newValue) => {
                setValue('pi', newValue);
              }}
              margin="dense"
            />
          )}
        </Box>
        <Box>
          <Button variant="contained" color="primary" onClick={handleGetData} size="large">
            Add Requisition Details
          </Button>
        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Select Requisition Details
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {dataList && (
            <TableContainer component={Paper} sx={{ my: 3, maxHeight: 400 }}>
              <Scrollbar>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Select</TableCell>
                      {isGroup ? (
                        <>
                          <TableCell>Material Code</TableCell>
                          <TableCell>Specification</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>PO No.</TableCell>
                          <TableCell>UOM</TableCell>
                          <TableCell>Quantity</TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>PI NO.</TableCell>
                          <TableCell>Party Name</TableCell>
                          <TableCell>Composition</TableCell>
                          <TableCell>Color</TableCell>
                          <TableCell>Count</TableCell>
                          <TableCell>Remarks</TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isGroup
                      ? // Render group items
                        Array.isArray(dataList) &&
                        dataList.map((row, index) => {
                          const rowId = getRowId(row);
                          const isSelected = selectedRows.some(
                            (selected) => getRowId(selected) === rowId
                          );

                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => handleSelectRow(row)}
                                />
                              </TableCell>
                              <TableCell>{row.Material_Code}</TableCell>
                              <TableCell>{row.Specification}</TableCell>
                              <TableCell>{row.Inv_Cat_Name}</TableCell>
                              <TableCell>{row.PO_No || 'N/A'}</TableCell>
                              <TableCell>{row.UOMName}</TableCell>
                              <TableCell>{row.Total_Passed_Qty}</TableCell>
                            </TableRow>
                          );
                        })
                      : // Render PI items
                        Array.isArray(dataList) &&
                        dataList.map((row, index) => {
                          const rowId = getRowId(row);
                          const isSelected = selectedRows.some(
                            (selected) => getRowId(selected) === rowId
                          );

                          return (
                            <TableRow key={rowId}>
                              <TableCell>
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => handleSelectRow(row)}
                                />
                              </TableCell>
                              <TableCell>{row.PINo}</TableCell>
                              <TableCell>{row.Party_Name || 'N/A'}</TableCell>

                              <TableCell>{row.Composition_Name || 'N/A'}</TableCell>
                              <TableCell>{row.Color_and_Code}</TableCell>
                              <TableCell>{row.Yarn_Count_Name}</TableCell>
                              <TableCell>{row.Remarks}</TableCell>
                              {/* <TableCell>{detail.Composition}</TableCell>
                                                            <TableCell>{detail.Color}</TableCell>
                                                            <TableCell>{detail.Count}</TableCell> */}
                              {/* <TableCell>{dataList.master.Remarks}</TableCell> */}
                            </TableRow>
                          );
                        })}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          )}

          {dataList.length > rowsPerPage && (
            <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
              <Pagination
                count={Math.ceil(dataList.length / rowsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {selectedRows.length > 0 && (
        <TableContainer component={Paper} sx={{ my: 3 }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Selected Items
          </Typography>
          <Table sx={{ minWidth: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 120 }}>{isGroup ? 'PO No.' : 'PI NO.'}</TableCell>
                <TableCell sx={{ minWidth: 180 }}>{isGroup ? 'Category' : 'Party Name'}</TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  {isGroup ? 'Item Name' : 'Composition'}
                </TableCell>
                <TableCell sx={{ minWidth: 130 }}>
                  {isGroup ? 'Item Code' : 'Supplier Name'}
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>{isGroup ? 'Supplier Name' : 'Count'}</TableCell>
                <TableCell sx={{ minWidth: 100 }}>{isGroup ? 'Origin' : 'Origin'}</TableCell>
                <TableCell sx={{ minWidth: 100 }}>{isGroup ? 'Color' : 'Color'}</TableCell>

                <TableCell sx={{ minWidth: 100 }}>{isGroup ? 'UOM' : 'UOM'}</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Receiving Quantity</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Request Quantity</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Remarks</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Remove</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedRows.map((row, index) => (
                <TableRow key={row.uniqueId || index}>
                  <TableCell>{row.PO_No || row?.PINo || row.styleNo || 'N/A'}</TableCell>
                  <TableCell>{isGroup ? row.Inv_Cat_Name : row.Party_Name || 'N/A'}</TableCell>
                  <TableCell>
                    {isGroup ? row.Specification : row.Composition_Name || 'N/A'}
                  </TableCell>
                  <TableCell>{isGroup ? row.Material_Code : row.vendorname || 'N/A'}</TableCell>

                  <TableCell>
                    {isGroup ? row.vendorname || 'N/A' : row.Yarn_Count_Name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {isGroup ? row.Origin_Name || 'N/A' : row.Origin_Name || 'N/A'}
                  </TableCell>

                  <TableCell>
                    {isGroup ? row.Color_and_Code || 'N/A' : row.Color_and_Code || 'N/A'}
                  </TableCell>
                  <TableCell>{row.UOMName || row.UOMName}</TableCell>
                  <TableCell>{row.Total_Passed_Qty || row.Total_Passed_Qty}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={row.Quantity || 0}
                      onChange={(e) => {
                        const enteredValue = Number(e.target.value);
                        const maxQuantity = row.Total_Passed_Qty || row.poQuantity || 0;

                        // Validate the entered value
                        if (enteredValue <= maxQuantity) {
                          handleInputChange(index, 'Quantity', enteredValue);
                        } else {
                          // Show error message and keep the previous valid value
                          enqueueSnackbar(`Quantity cannot exceed ${maxQuantity}`, {
                            variant: 'error',
                          });
                        }
                      }}
                      inputProps={{
                        min: 0,
                        max: row.Total_Passed_Qty || row.poQuantity || 0,
                      }}
                      fullWidth
                      size="small"
                      sx={{ minWidth: 120 }}
                      error={row.Quantity > (row.Total_Passed_Qty || row.poQuantity || 0)}
                      helperText={
                        row.Quantity > (row.Total_Passed_Qty || row.poQuantity || 0)
                          ? `Max allowed: ${row.Total_Passed_Qty || row.poQuantity || 0}`
                          : ''
                      }
                    />
                  </TableCell>
                  <TableCell>{row.Remarks || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeleteClick(index)} color="error">
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* <Stack alignItems="flex-end">
                        <Box width={{ xs: '100%', sm: '35%' }} sx={{ mt: 2, p: 2 }}>
                            <TextField
                                label="Total Quantity"
                                type="number"
                                value={totalQuantity}
                                size="small"
                                fullWidth
                                disabled
                            />
                        </Box>
                    </Stack> */}
          <Dialog open={openConfirm} onClose={handleCancelDelete}>
            <DialogTitle>Confirm Remove</DialogTitle>
            <DialogContent>
              <DialogContentText>Are you sure you want to remove this ?</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDelete}>Cancel</Button>
              <Button onClick={handleConfirmDelete} color="error">
                Remove
              </Button>
            </DialogActions>
          </Dialog>
        </TableContainer>
      )}
    </Box>
  );
};

ProductSpecificInfo.propTypes = {
  setTotalAmount: PropTypes.func,
  totalAmount: PropTypes.number,
  totalQuantity: PropTypes.number,
  setTotalQuantity: PropTypes.func,
  cancelQuantity: PropTypes.number,
  setCancelQuantity: PropTypes.func,
  selectedRows: PropTypes.array,
  setSelectedRows: PropTypes.func,
  totalMark: PropTypes.number,
  setTotalMark: PropTypes.func,
  isGroup: PropTypes.bool.isRequired,
  setIsGroup: PropTypes.func.isRequired,
  isPI: PropTypes.bool.isRequired,
  setIsPI: PropTypes.func.isRequired,
};

export default ProductSpecificInfo;
