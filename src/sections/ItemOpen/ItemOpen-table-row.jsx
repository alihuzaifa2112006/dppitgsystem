import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { decrypt } from 'src/api/encryption';
import { fDate } from 'src/utils/format-time';
import Label from 'src/components/label';
import { Avatar, ListItemText, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import { fNumber } from 'src/utils/format-number';

export default function ItemOpenTableRow({ row, selected, onEditRow }) {
  const {
    Material_Code,
    ClassName,
    CategoryName,
    SubCategoryName,
    Origin_Name,
    Average_Price,
    OpeningStockQuantity,
    Specification,
    CurrencyName,
    SourceName,

    ReorderQuantity,
    SaftyQuantity,
    AveragePrice,
    SafetyQuantity,
    Color_and_Code,
    Action,
    UOM,
    Value,
    MaterialTypeName,
  } = row;

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  return (
    <TableRow hover selected={selected}>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{Material_Code || ''}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{ClassName}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{CategoryName}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{SubCategoryName}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{MaterialTypeName}</TableCell>
      <TableCell>{Specification}</TableCell>
      <TableCell>{SourceName}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{Origin_Name}</TableCell>
      <TableCell>{Color_and_Code}</TableCell>

      <TableCell>{UOM}</TableCell>
      <TableCell align="right">{fNumber(OpeningStockQuantity)}</TableCell>


      <TableCell align="right">{fNumber(ReorderQuantity)}</TableCell>
      <TableCell align="right">{fNumber(Average_Price)}</TableCell>
      {/* <TableCell align="right">{fNumber(SaftyQuantity)}</TableCell> */}

      <TableCell align="right">{fNumber(Value)}</TableCell>
      <TableCell>{CurrencyName}</TableCell>

      {/* <TableCell align="center">{Action}</TableCell> */}

      {/* <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Tooltip title="Edit" align="center">
          <IconButton onClick={() => onEditRow()}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>
      </TableCell> */}
    </TableRow>
  );
}

ItemOpenTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
