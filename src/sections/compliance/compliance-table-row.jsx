import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { decrypt } from 'src/api/encryption';
import Label from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { Stack } from '@mui/system';
import { getCountries } from 'src/utils/Countries';
import { LinearProgress } from '@mui/material';
import EmailFormDialog from './compliance-email';
import { enqueueSnackbar } from 'notistack';
import { APP_URL } from 'src/config-global';
import { encryptLink } from 'src/utils/LinkEncryption';

// ----------------------------------------------------------------------

const getStatusColor = (stID) => {
  switch (stID) {
    case '0':
      return 'success';
    case '1':
      return 'info';
    case '2':
      return 'warning';
    case '3':
      return 'warning';
    default:
      return 'error';
  }
};

export default function ComplianceTableRow({ row, selected, onEditRow, FetchData }) {
  const { Cust_Name, Country_Name, ExpiryDate, Status, Reminder, Cust_ID, Document_Type } = row;

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const statusDays = Status.split(' ')[0];

  const countries = getCountries();

  const [dialogOpen, setDialogOpen] = useState(false);

  const getFlagByCountryCode = (countryName) => {
    const country = countries?.find((c) => c.label.toLowerCase() === countryName?.toLowerCase());
    return country ? `flagpack:${country?.code?.toLowerCase()}` : '';
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  const encryptedVID = encryptLink(Cust_ID.toString());
  const linkToCopy = `${APP_URL}/customer-certificate/${encryptedVID}`; // Your specific link

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
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{Cust_Name}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack direction="row" alignItems="center">
            <Iconify
              icon={getFlagByCountryCode(Country_Name)}
              sx={{ borderRadius: 0.65, border: '1px gray ', width: 28, mr: 1 }}
            />
            {Country_Name}
          </Stack>
        </TableCell>
        <TableCell >{Document_Type}</TableCell>

        <TableCell>{fDate(ExpiryDate)}</TableCell>
        <TableCell>
          <Stack sx={{ typography: 'caption', color: 'text.secondary' }}>
            <LinearProgress
              value={statusDays > 90 || statusDays === 0 ? 100 : (statusDays / 90) * 100} // Assuming a year-based progress
              variant="determinate"
              color={
                // eslint-disable-next-line
                statusDays === 'Expired'
                  ? 'error'
                  : // eslint-disable-next-line
                    statusDays === 'Not'
                    ? 'error'
                    : // eslint-disable-next-line
                      statusDays < 60
                      ? 'warning'
                      : 'success'
              }
              sx={{ mb: 1, height: 6, maxWidth: 80 }}
            />
            {Status}
          </Stack>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <Label color={getStatusColor(Reminder)}>
            {/* eslint-disable-next-line */}
            {Reminder === '0' ? 'No Reminder' : `${Reminder} Reminder`}
          </Label>
        </TableCell>
        {/* <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
        {Unit?.UnitName || UnitName}
      </TableCell> */}
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
          FetchData();
        }}
      />
    </>
  );
}

ComplianceTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  FetchData: PropTypes.func,
};
