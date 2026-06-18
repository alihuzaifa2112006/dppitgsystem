import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { APP_URL } from 'src/config-global';
import { encryptLink } from 'src/utils/LinkEncryption';
import EmailFormDialog from './WIC-email';
import { enqueueSnackbar } from 'notistack';
import { fDate } from 'src/utils/format-time';
import Label from 'src/components/label';
import { getCountries } from 'src/utils/Countries';
import { Stack } from '@mui/system';

// ----------------------------------------------------------------------

export default function WICInviteTableRow({ row, selected, onEditRow, FetchWICInviteData }) {
  const {
    Matured_Before_Date,
    Country_Name,
    BusinessType_Name,
    City_Name,
    WIC_Name,
    WIC_ID,
    Email_Status,
  } = row;

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [dialogOpen, setDialogOpen] = useState(false);

  const getStatusColor = (stID) => {
    switch (stID) {
      case 'Invited':
        return 'info';
      case 'Not-Invited':
        return 'warning';
      // case 'On Hold':
      //   return 'error';
      case 'Responded':
        return 'success';
      default:
        return 'default';
    }
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  const countries = getCountries();

  const getFlagByCountryCode = (countryName) => {
    const country = countries?.find((c) => c.label.toLowerCase() === countryName?.toLowerCase());
    return country ? `flagpack:${country?.code?.toLowerCase()}` : '';
  };

  const encryptedVID = encryptLink(WIC_ID.toString());
  const linkToCopy = `${APP_URL}/customer-onboarding/${encryptedVID}`; // Your specific link

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(linkToCopy)
      .then(() => {
        enqueueSnackbar(
          'Link copied to clipboard',
          {
            variant: 'success',
          },
          {
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          }
        );
      })
      .catch((err) => {
        console.error('Failed to copy link: ', err);
      });
  };

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}></TableCell> */}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{WIC_Name}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack direction="row" alignItems="center">
            <Iconify
              icon={getFlagByCountryCode(Country_Name)}
              sx={{ borderRadius: 0.65, border: '1px gray ', width: 28, mr: 1 }}
            />
            {Country_Name}
          </Stack>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{City_Name}</TableCell>
        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{BusinessType_Name}</TableCell> */}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(Matured_Before_Date)}</TableCell>
        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
          <Label color={getStatusColor(Email_Status)}>{Email_Status}</Label>
        </TableCell>
        <TableCell align="center">
          <IconButton onClick={() => handleCopyLink()}>
            <Iconify icon="mdi:link-variant" />
          </IconButton>
        </TableCell>

        <TableCell align="center">
          <IconButton onClick={handleDialogOpen}>
            <Iconify icon="mdi:email-edit-outline" />
          </IconButton>
        </TableCell>
      </TableRow>
      <EmailFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        supplierData={row}
        linkToCopy={linkToCopy}
        FetchNewData={() => {
          FetchWICInviteData();
        }}
      />
    </>
  );
}

WICInviteTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  FetchWICInviteData: PropTypes.func,
};
