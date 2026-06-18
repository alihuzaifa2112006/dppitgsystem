import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { fCurrency, fNumber } from 'src/utils/format-number';
import { formatDate } from '@fullcalendar/core';


// ----------------------------------------------------------------------

export default function DetailTableRow({ row, selected, onDeleteRow , onEditRow}) {
const {
  
  PODate,
  ClassID,
  ORDate,
  ClassName,
  Store,
  ItemSubCategory,
  Inv_Cat_Name,
  SubCat_Name,
  Specification,
  StoreName,
  RackName,
  Unit,
  POQuantity,
  RecieveQty,
  Remarks,
} = row;
console.log(row)
  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>

<TableCell align="center">{PODate || '-'}</TableCell>
<TableCell align="center">{ORDate || '-'}</TableCell>

<TableCell align="center">{ClassID?.ClassName || '-'}</TableCell>
<TableCell align="center">{Inv_Cat_Name?.Inv_Cat_Name || '-'}</TableCell>
<TableCell align="center">{ItemSubCategory?.SubCat_Name || '-'}</TableCell>
<TableCell align="center">{Specification?.Specification || '-'}</TableCell>
<TableCell align="center">{Store?.StoreName || '-'}</TableCell>
<TableCell align="center">{RackName?.Location_Name || '-'}</TableCell>
<TableCell align="center">{Unit?.UOMName || '-'}</TableCell>

<TableCell align="center">{POQuantity || '-'}</TableCell>
<TableCell align="center">{RecieveQty || '-'}</TableCell>
<TableCell align="center">{Remarks || '-'}</TableCell>
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>

          <IconButton
            onClick={() => {
              onEditRow();
            }}
          >
            <Iconify icon="solar:pen-bold" />
          </IconButton>

          <IconButton
            color="error"
            onClick={() => {
              confirm.onTrue();
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </TableCell>




      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

DetailTableRow.propTypes = {

  row: PropTypes.object,
  selected: PropTypes.bool,
  onDeleteRow: PropTypes.func.isRequired,
  onEditRow: PropTypes.func.isRequired,
};
