import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';

import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Button, Link } from '@mui/material';
import { Stack } from '@mui/system';

// ----------------------------------------------------------------------

export default function RecipeTableRow({ row, selected, onEditRow, onDeleteRow }) {
  const {
    RecipeID,
    RecipeAutoNo,
    RecipeName,
    WIC_Name,
    Blend_Names,
    ApprovedSwatchColor,
    ColorFamilyName,
    Color_and_Code,
    RecipePictureURL
  } = row;

  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>{RecipeAutoNo}</TableCell>
        <TableCell>{RecipeName}</TableCell>
        <TableCell>{WIC_Name}</TableCell>
        <TableCell>{Blend_Names}</TableCell>
        <TableCell>{ApprovedSwatchColor}</TableCell>
        <TableCell>{ColorFamilyName}</TableCell>
        <TableCell>{Color_and_Code}</TableCell>
        <TableCell>
          <Link href={RecipePictureURL}  target="_blank"  >
          
            {RecipePictureURL && (
              <Avatar
                alt="Recipe Picture"
                src={RecipePictureURL}
                variant="square"
                sx={{
                  width: 56,
                  height: 56,
                  '& img': {
                    objectFit: 'contain',
                  }
                }}
              />
            )}
          </Link>
        </TableCell>
        {/* <TableCell  align="center">
          <IconButton onClick={() => onEditRow(RecipeID)}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => confirm.onTrue()}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </TableCell> */}
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Recipe"
        content="Are you sure you want to delete this recipe?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow(RecipeID);
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

RecipeTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onDeleteRow: PropTypes.func,
};