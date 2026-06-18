import PropTypes from 'prop-types';
import { useMemo } from 'react';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button, Tooltip, Table, TableHead, TableBody } from '@mui/material';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { fDate } from 'src/utils/format-time';
import Label from 'src/components/label';

export default function PriceListTableRow({ row, selected, onEditRow, onNewVersion, onDeleteRow }) {
  const {
    PriceListName,
    PriceListDescription,
    PriceListVer,
    Valid_From,
    Valid_Until,
    IsActive,
    children = [],
  } = row;

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const confirm = useBoolean();
  const collapse = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>{PriceListName}</TableCell>
        <TableCell>
          <Label variant="soft" color="info" sx={{ textTransform: 'none' }}>
            {PriceListVer}
          </Label>
        </TableCell>
        <TableCell>{PriceListDescription}</TableCell>
        <TableCell sx={{ textAlign: 'center' }}>{fDate(Valid_From)}</TableCell>
        <TableCell sx={{ textAlign: 'center' }}>{fDate(Valid_Until)}</TableCell>
        <TableCell sx={{ textAlign: 'center' }}>
          <Label variant="soft" color={IsActive ? 'success' : 'error'}>
            {IsActive ? 'Active' : 'InActive'}
          </Label>
        </TableCell>

        <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Create new version" placement="top">
            <IconButton onClick={() => onNewVersion()}>
              <Iconify icon="ic:twotone-new-label"  />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit current version" placement="top">
            <IconButton onClick={() => onEditRow()}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={collapse.onToggle}>
            <Iconify
              icon={collapse.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
            />
          </IconButton>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell sx={{ p: 0, border: 'none', backgroundColor: '#f5f5f5' }} colSpan={7}>
          <Collapse in={collapse.value} timeout="auto" unmountOnExit>
            <Stack component={Paper} sx={{ m: 1.5 }}>
              <Typography variant="h6" sx={{ p: 1 }}>
                Previous Versions
              </Typography>
              {children.length > 0 ? (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Version</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="center">Valid From</TableCell>
                      <TableCell align="center">Valid Until</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {children.map((child) => (
                      <TableRow key={child.PriceListID}>
                        <TableCell>{child.PriceListName}</TableCell>
                        <TableCell>
                          <Label variant="soft" color="default" sx={{ textTransform: 'none' }}>
                            {child.PriceListVer}
                          </Label>
                        </TableCell>
                        <TableCell>{child.PriceListDescription}</TableCell>
                        <TableCell align="center">{fDate(child.Valid_From)}</TableCell>
                        <TableCell align="center">{fDate(child.Valid_Until)}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Label variant="soft" color={child.IsActive ? 'success' : 'error'}>
                            {child.IsActive ? 'Active' : 'InActive'}
                          </Label>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View" placement="top">
                            <IconButton onClick={() => onEditRow(child.PriceListID)}>
                              <Iconify icon="solar:eye-bold" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" sx={{ px: 2, py: 1 }}>
                  No previous versions available.
                </Typography>
              )}
            </Stack>
          </Collapse>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete?"
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

PriceListTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onNewVersion: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
