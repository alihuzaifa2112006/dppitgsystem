import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { fCurrency, fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function AppNewInspections({ title, subheader, tableData, tableLabels, ...other }) {
  const router = useRouter();

  const moveToView = () => {
    router.push(paths.dashboard.jobs.assignments.inspections.list);
  };

  return (
    <Card sx={{ height: '100%' }} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 680 }} size="small">
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody>
              {tableData.map((row) => (
                <AppNewInspectionsRow key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      {/* <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
          onClick={moveToView}
        >
          View All
        </Button>
      </Box> */}
    </Card>
  );
}

AppNewInspections.propTypes = {
  subheader: PropTypes.string,
  tableData: PropTypes.array,
  tableLabels: PropTypes.array,
  title: PropTypes.string,
};

// ----------------------------------------------------------------------

function AppNewInspectionsRow({ row }) {
  const year = new Date(row.SalesYear).getFullYear().toString();

  return (
    <>
      <TableRow>
        <TableCell>{year}</TableCell>

        {/* <TableCell>{row.KeySalesPerson}</TableCell> */}
        <TableCell sx={{ whiteSpace: 'no-wrap' }} align='right'>{fNumber(row.AvgUnitPrice_KG)} KG</TableCell>
        <TableCell sx={{ whiteSpace: 'no-wrap' }} align='right'>{fNumber(row.TotalOrderQty_KG)} KG</TableCell>
        <TableCell sx={{ whiteSpace: 'no-wrap' }} align='right'>{fCurrency(row.TotalOrderValue_USD_KG)}</TableCell>
        <TableCell sx={{ whiteSpace: 'no-wrap' }} align='right'>{fNumber(row.TotalDeliveredQty)} KG</TableCell>
        <TableCell sx={{ whiteSpace: 'no-wrap' }} align='right'>{fCurrency(row.TotalDeliveredValue)} </TableCell>

        {/* <TableCell>
          <Label
            variant="soft"
            color={
              (row.status === 'Progress' && 'warning') ||
              (row.status === 'Pending' && 'error') ||
              'success'
            }
          >
            {row.status}
          </Label>
        </TableCell> */}
      </TableRow>
    </>
  );
}

AppNewInspectionsRow.propTypes = {
  row: PropTypes.object,
};
