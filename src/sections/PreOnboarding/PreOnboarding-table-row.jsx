import { useMemo } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Stack } from '@mui/system';
import { useRouter } from 'src/routes/hooks';
import { getCountries } from 'src/utils/Countries';

// ----------------------------------------------------------------------

export default function PreOnboardingTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
}) {
  const { VenderName, City, CountryName, OnboardingEmail, VenderLibraryID } = row;

  const countries = getCountries();
  const router = useRouter();

  // const selectedCountry = country?.find((c) => c.Country_id === CountryID);

  const getFlagByCountryCode = (countryName) => {
    const country = countries?.find((c) => c.label.toLowerCase() === countryName?.toLowerCase());
    return country ? `flagpack:${country?.code?.toLowerCase()}` : '';
  };
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell> */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{VenderName}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{City}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack direction="row" alignItems="center">
            <Iconify
              icon={getFlagByCountryCode(CountryName)}
              sx={{ borderRadius: 0.65, border: '1px gray ', width: 28, mr: 1 }}
            />{' '}
            {CountryName}
          </Stack>
        </TableCell>{' '}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{OnboardingEmail}</TableCell>
        {/* {userData?.userDetails?.RoleId === '1' ? (
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </TableCell>
        ) : (
          <TableCell />
        )} */}
        <TableCell>
          <IconButton>
            <Iconify
              icon="solar:pen-bold"
              onClick={() => {
                router.push(`/dashboard/Onboarding/pre-onboarding/${VenderLibraryID}`);
              }}
            />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

PreOnboardingTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
