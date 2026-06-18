
import React from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Typography,
    IconButton,
    Box,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { AgGridReact } from 'ag-grid-react';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { fNumber } from 'src/utils/format-number';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

export default function MRPDialog({ uploadClose, uploadOpen, tableData, selectedProduct }) {
    const settings = useSettingsContext();

    const columnDefs = [
        {
            field: 'ItemCode',
            headerName: 'Item Code',
            filter: true,
            sortable: true,
            width: 150,
        },
        {
            field: 'ItemDescription',
            headerName: 'Item Description',
            filter: true,
            sortable: true,
            flex: 1,
        },
        {
            field: 'RequiredQtyKG',
            headerName: 'Required Qty (KG)',
            filter: true,
            sortable: true,
            width: 150,
            valueFormatter: (params) => fNumber(params.value) || 0,
            type: 'numericColumn',
        },
        {
            field: 'ProducedQtyKG',
            headerName: 'Produced Qty (KG)',
            filter: true,
            sortable: true,
            width: 150,
            valueFormatter: (params) => fNumber(params.value) || 0,
            type: 'numericColumn',
        },
        {
            field: 'BalanceQtyKG',
            headerName: 'Balance Qty (KG)',
            filter: true,
            sortable: true,
            width: 150,
            valueFormatter: (params) => fNumber(params.value) || 0,
            type: 'numericColumn',
        },
    ];

    const defaultColDef = {
        flex: 1,
        minWidth: 100,
        resizable: true,
    };

    return (
        <Dialog open={uploadOpen} onClose={uploadClose} fullWidth maxWidth="lg">
            <DialogTitle sx={{ fontSize: '20px !important' }}>
                <Stack direction="row" alignItems="center">
                    <Typography variant="h5" sx={{ flexGrow: 1 }}>
                        MRP Items: {selectedProduct?.MRPNo}
                    </Typography>
                    <IconButton onClick={uploadClose}>
                        <Iconify icon="mingcute:close-line" />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
                <Box sx={{ height: 500, width: '100%', mt: 2 }}>
                    <AgGridReact
                        columnDefs={columnDefs}
                        rowData={tableData}
                        theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
                        defaultColDef={defaultColDef}
                        pagination
                        paginationPageSize={20}
                        rowHeight={35}
                        overlayNoRowsTemplate="No MRP items found"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={uploadClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

MRPDialog.propTypes = {
    uploadClose: PropTypes.func,
    uploadOpen: PropTypes.bool,
    tableData: PropTypes.array,
    selectedProduct: PropTypes.object,
};
