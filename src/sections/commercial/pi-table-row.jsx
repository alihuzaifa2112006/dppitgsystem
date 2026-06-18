import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';

import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Divider, List, ListItemButton, ListItemText, Tooltip } from '@mui/material';



// ----------------------------------------------------------------------

const getColors = (priority) => {
  switch (priority) {
    case 'High':
      return 'error';
    case 'HIGH':
      return 'error';
    case 'Medium':
      return 'info';
    case 'Low':
      return 'success';
    default:
      return 'default';
  }
};

export default function PiTableRow({ row, selected, onEditRow, onPDFView }) {
  const {
    ExportInvoiceNo,
    ExportInvoiceDate,
    CustomerName,
    ExportLCNo,
    LCDate,
    ExportLCAmount,
    GoodsValue,
    InvoiceQty,
    Commission,
    AdjustmentAmount,
    ExportInvoiceValue,
    ExchangeRate,
    InvoiceValueInTK,
  } = row;

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
  // PDF dialog state
  const [openPDFList, setOpenPDFList] = useState(false);

  const [selectedPDFs, setSelectedPDFs] = useState([]);

  const handleOpenPDFList = () => setOpenPDFList(true);
  const handleClosePDFList = () => setOpenPDFList(false);

  // 🔹 These are the PDF types you want to show in the dialog
  const availablePDFs = [
    { label: 'Commercial Invoice PDF', type: 'commercial' },
    { label: 'Packing List PDF', type: 'packing' },
    { label: 'Truck Challan PDF', type: 'TC' },
    { label: 'Delievery Challan PDF', type: 'DC' },
    { label: 'Inspection Certificate PDF', type: 'IC' },
    { label: 'Certificate of Origin PDF', type: 'CO' },
    { label: 'Bill of Exchange PDF', type: 'BOE' },
    // Add more if needed, e.g.
    // { label: 'Packing List PDF', type: 'packing' },
  ];

  const handleTogglePDF = (type) => {
    setSelectedPDFs((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // ✅ When user confirms selection
  const handleViewSelectedPDFs = () => {
    if (selectedPDFs.length === 0) return;
    handleClosePDFList();

    // Join all types in a single query param
    const pdfParam = selectedPDFs.join(',');

    // navigate to viewer
    onPDFView({
      ExportInvoiceID: row.ExportInvoiceID,
      pdfType: pdfParam,
    });
  };


  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ExportInvoiceNo || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(ExportInvoiceDate)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{CustomerName || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ExportLCNo || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(LCDate)}</TableCell>
        <TableCell align="right">{ExportLCAmount}</TableCell>
        <TableCell align="right">{GoodsValue}</TableCell>
        <TableCell align="right">{InvoiceQty}</TableCell>
        <TableCell align="right">{Commission}</TableCell>
        <TableCell align="right">{AdjustmentAmount}</TableCell>
        <TableCell align="right">{ExportInvoiceValue}</TableCell>
        <TableCell align="right">{ExchangeRate}</TableCell>
        <TableCell align="right">{InvoiceValueInTK}</TableCell>


        {/* Actions */}
        <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Edit">
            <IconButton onClick={() => onEditRow()}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          {/* Single icon opens list of available PDFs */}
          <Tooltip title="View PDF Options">
            <IconButton onClick={handleOpenPDFList} color="error">
              <Iconify icon="flowbite:file-pdf-solid" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      {/* Dialog listing available PDFs */}
      <Dialog open={openPDFList} onClose={handleClosePDFList} maxWidth="xs" fullWidth>
        <DialogTitle>Select PDF(s) to View</DialogTitle>
        <DialogContent dividers>
          <List>
            {availablePDFs.map((pdf) => (
              <div key={pdf.type}>
                <ListItemButton onClick={() => handleTogglePDF(pdf.type)}>
                  <Checkbox checked={selectedPDFs.includes(pdf.type)} />
                  <ListItemText primary={pdf.label} />
                </ListItemButton>
                <Divider />
              </div>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePDFList}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleViewSelectedPDFs}
            disabled={selectedPDFs.length === 0}
          >
            View Selected PDFs
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
}

PiTableRow.propTypes = {
  onEditRow: PropTypes.func,
  onPDFView: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
