import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { IconButton, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import Iconify from 'src/components/iconify';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
} from 'src/components/table';

import { useSnackbar } from 'src/components/snackbar';
import Scrollbar from 'src/components/scrollbar';
import { decrypt, encrypt } from 'src/api/encryption';
import { Get, Post } from 'src/api/apibasemethods';

export default function CompositionDialog({
  uploadOpen,
  uploadClose,
  compositions,
  compositionValue,
}) {
  const { enqueueSnackbar } = useSnackbar();

  const [compositionsList, setCompositionsList] = useState(
    compositions?.map((composition) => ({
      ...composition,
      InitiativesID: '',
      CompositionPercentage: 0,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [initiatives, setInitiatives] = useState([]);

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table Heads
  const TableHead = [
    { id: 'Composition', label: 'Composition' },
    { id: 'ShortName', label: 'Short Name', align: 'center' },
    { id: 'Initiatives', label: 'Initiative', align: 'center' },
    { id: 'Percentage', label: 'Percentage', align: 'center', maxWidth: 160, width: 160 },
  ];

  // Table
  const table = useTable();

  const notFound = !compositionsList?.length;
  const denseHeight = table.dense ? 56 : 56 + 20;

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

  const GetInitiativesData = useCallback(async () => {
    try {
      const response = await Get(`GetInitiatives`);
      const decryptedData = decryptObjectKeys(response.data.ServiceRes);
      setInitiatives(decryptedData);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    GetInitiativesData();
  }, [GetInitiativesData]);

  const PostDetailData = async (detail) => {
    try {
      const encryptedData = detail.map((X) =>
        Object.assign(
          {},
          ...Object.keys(X).map((key) => ({
            [key]: encrypt(X[key]),
          }))
        )
      );

      // Post the encrypted data to the server
      await Post(`InsertJO_YarnCompositionDtlData`, encryptedData);
    } catch (error) {
      console.log('Detail', error);
    }
  };

  // Master Save
  const PostMasterData = async (composition) => {
    setSaving(true);
    try {
      const encryptedData = Object.assign(
        {},
        ...Object.keys({ Composition: composition }).map((key) => ({
          [key]: encrypt({ Composition: composition }[key]),
        }))
      );
      await Post('InsertJO_YarnCompositionMstData', encryptedData).then(async (res) => {
        if (res.data.ResponseCode === '100') {
          // Send `compositionSentence` to the parent component
          compositionValue(composition, decrypt(res.data.ServiceRes[0]?.ComponentMstID));

          const detailWithMstID = compositionsList
            .filter(
              (obj) =>
                obj.CompositionPercentage !== 0 &&
                obj.CompositionPercentage !== '' &&
                obj.CompositionPercentage != null
            )
            .map(({ CompositionName, CompositionShortName, ...rest }) => ({
              ...rest,
              ComponentMstID: decrypt(res.data.ServiceRes[0]?.ComponentMstID),
            }));

          await PostDetailData(detailWithMstID);
        }
      });
    } catch (error) {
      console.log(error);
      enqueueSnackbar('Something Went Wrong!', { variant: 'error' });
    } finally {
      setSaving(false);
      // Reset compositionsList after submission
      setCompositionsList(
        compositions?.map((comp) => ({
          ...comp,
          InitiativesID: '',
          CompositionPercentage: 0,
        }))
      );
    }
  };

  const handleInputChange = (index, fieldName, value) => {
    setCompositionsList((prevList) => {
      const updatedList = [...prevList];
      updatedList[index] = {
        ...updatedList[index],
        [fieldName]: value,
      };
      return updatedList;
    });
  };

  // calculat and validate
  const checkPercentSum = async (arr) => {
    // Convert CompositionPercentage values to numbers
    const updatedArray = arr.map((obj) => {
      let percentValue = parseFloat(obj.CompositionPercentage);

      // If conversion results in NaN, set it to 0
      if (Number.isNaN(percentValue)) {
        percentValue = 0;
      }

      // Return updated object with CompositionPercentage as number
      return { ...obj, CompositionPercentage: percentValue };
    });

    // Validate rows: CompositionPercentage > 0 must have InitiativesID
    const validRows = updatedArray.filter(
      (obj) =>
        obj.CompositionPercentage > 0 &&
        obj.InitiativesID !== null &&
        obj.InitiativesID !== undefined &&
        obj.InitiativesID !== ''
    );

    const invalidRows = updatedArray.filter(
      (obj) =>
        obj.CompositionPercentage > 0 &&
        (obj.InitiativesID === null || obj.InitiativesID === undefined || obj.InitiativesID === '')
    );

    // Show error if there are invalid rows
    if (invalidRows.length > 0) {
      enqueueSnackbar('Rows with Percentage must also have a valid Initiative selected.', {
        variant: 'error',
      });
      return; // Stop execution
    }

    // Sum all CompositionPercentage values from valid rows
    let totalPercent = validRows.reduce((sum, obj) => sum + obj.CompositionPercentage, 0);

    // Generate the sentence with CompositionPercentage > 0
    const compositionSentence = validRows
      .filter((obj) => obj.CompositionPercentage > 0 && obj.CompositionName) // Filter for valid rows
      .map(
        (obj) =>
          `${obj.CompositionPercentage}% ${
            obj.InitiativesID === '1'
              ? ''
              : initiatives?.find((initiative) => initiative.InitiativesID === obj.InitiativesID)
                  ?.Initiatives
          } ${obj.CompositionName}`
      )
      .join(' '); // Join them with spaces

    // Check if total is 100
    if (totalPercent === 100) {
      await PostMasterData(compositionSentence);
      uploadClose();
      totalPercent = 0;
    } else {
      enqueueSnackbar('Total % is not equal to 100.', { variant: 'error' });
    }
  };

  return (
    <Dialog
      open={uploadOpen}
      onClose={() => {
        setCompositionsList(
          compositions?.map((composition) => ({
            ...composition,
            CompositionPercentage: 0, // Reset percentage to 0
          }))
        );
        uploadClose(); // Call the original close function
      }}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle sx={{ fontSize: '20px !important' }}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Composition Calculator
          </Typography>

          <IconButton onClick={uploadClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Grid container>
        <Grid item xs={12} md={12}>
          <DialogActions>
            <LoadingButton
              onClick={() => {
                checkPercentSum(compositionsList);
              }}
              loading={saving}
              variant="contained"
              color="primary"
            >
              Add
            </LoadingButton>
          </DialogActions>
          <DialogContent>
            <Scrollbar>
              <Table
                size={table.dense ? 'small' : 'medium'}
                sx={{
                  minWidth: 600,
                  mt: 2,
                  border: 1,
                  borderColor: '#f4f6f8',
                  borderStyle: 'dotted',
                }}
              >
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TableHead}
                />

                <TableBody>
                  {compositions?.map((row, id) => (
                    <TableRow key={id}>
                      <TableCell sx={{ fontSize: '12px' }}>{row?.CompositionName}</TableCell>

                      <TableCell sx={{ fontSize: '12px', textAlign: 'center' }}>
                        {row?.CompositionShortName}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                        <Select
                          sx={{ width: 300 }}
                          placeholder="Select Initiative"
                          size="small"
                          displayEmpty
                          renderValue={(selected) => {
                            if (!selected) {
                              return <span style={{ color: '#aaa' }}>Select Initiative</span>;
                            }
                            return initiatives?.find(
                              (initiative) => initiative.InitiativesID === selected
                            )?.Initiatives;
                          }}
                          onChange={(e) => handleInputChange(id, 'InitiativesID', e.target?.value)}
                        >
                          {/* Add the "Remove Selection" Option */}
                          <MenuItem value="">
                            <em style={{ color: '#d33' }}>Remove Selection</em>
                          </MenuItem>

                          {/* List of Initiatives */}
                          {initiatives?.map((initiative) => (
                            <MenuItem
                              key={initiative.InitiativesID}
                              value={initiative.InitiativesID}
                            >
                              {initiative.Initiatives}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>

                      <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                        <TextField
                          value={row?.CompositionPercentage}
                          fullWidth
                          type="number"
                          size="small"
                          placeholder="0"
                          onChange={(e) => {
                            handleInputChange(id, 'CompositionPercentage', e.target.value);
                          }}
                          sx={{
                            '& .MuiInputBase-input': { fontSize: '12px', textAlign: 'center' },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, compositionsList?.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </DialogContent>
        </Grid>
      </Grid>
    </Dialog>
  );
}

CompositionDialog.propTypes = {
  uploadOpen: PropTypes.any,
  uploadClose: PropTypes.any,
  compositions: PropTypes.any,
  compositionValue: PropTypes.any,
};
