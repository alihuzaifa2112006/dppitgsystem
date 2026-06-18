import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFViewer,
    Font,
} from '@react-pdf/renderer';
import numberToWords from 'number-to-words';
import PropTypes from 'prop-types';

const convertAmountToWords = (amount) => {
    const [whole, decimal] = amount.toFixed(2).split('.');
    const wholeWords = numberToWords.toWords(Number(whole)).toUpperCase();
    const decimalWords = numberToWords.toWords(Number(decimal)).toUpperCase();
    return `SAY US DOLLAR: ${wholeWords} DOLLARS AND ${decimalWords} CENTS ONLY`;
};
// Styles
const styles = StyleSheet.create({
    page: {
        paddingTop: 40,
        paddingBottom: 60, // reserve space for footer
        paddingHorizontal: 30,
        fontSize: 10,
        fontFamily: 'Century Gothic',
    },
    title: {
        textDecoration: 'underline',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 10,
        textTransform: 'uppercase',
        fontFamily: 'Roboto-Bold',
    },
    section: {
        marginTop: 10,
        marginBottom: 5,
        gap: 5,
        fontFamily: 'Century Gothic',
        fontSize: 9
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bold: {
        fontFamily: 'Roboto-Bold',
    },
    tableHeader: {
        borderTop: 1,
        flexDirection: 'row',
        backgroundColor: '#eee',
        fontWeight: 'bold',
        fontSize: 7,
        fontFamily: 'Roboto-Bold'
    },
    tableRow: {
        flexDirection: 'row',

    },
    cell: {
        padding: 3,
        fontSize: 9,
        textAlign: 'center',
        borderBottom: 1,
        borderLeft: 1,
        borderColor: '#000',
    },

    fullText: {
        marginTop: 5,
        marginBottom: 5,
        fontFamily: 'Century Gothic',
        fontSize: 9
    },
    signatureBlock: {
        marginTop: 5,
        borderTop: '1px solid black',
        paddingTop: 5,
    },
    pageNumber: {
        position: 'absolute',
        fontSize: 7,
        bottom: -30,
        left: 0,
        right: 0,
        textAlign: 'right',
        color: 'black',
    },
});
const items = [
    {
        sl: '1',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 01',
        shipmentDate: '9/8/2025',
        quantity: '14,130',
        unitPrice: '4.35',
        totalAmount: '61,465.50',
    },
    {
        sl: '2',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 00',
        shipmentDate: '9/8/2025',
        quantity: '18,390',
        unitPrice: '4.35',
        totalAmount: '79,996.50',
    },
    {
        sl: '3',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '4',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '5',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '6',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '7',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '8',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '9',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '10',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '1',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 01',
        shipmentDate: '9/8/2025',
        quantity: '14,130',
        unitPrice: '4.35',
        totalAmount: '61,465.50',
    },
    {
        sl: '2',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 00',
        shipmentDate: '9/8/2025',
        quantity: '18,390',
        unitPrice: '4.35',
        totalAmount: '79,996.50',
    },
    {
        sl: '3',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '4',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '5',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '6',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '7',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '8',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '9',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '10',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '1',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 01',
        shipmentDate: '9/8/2025',
        quantity: '14,130',
        unitPrice: '4.35',
        totalAmount: '61,465.50',
    },
    {
        sl: '2',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 00',
        shipmentDate: '9/8/2025',
        quantity: '18,390',
        unitPrice: '4.35',
        totalAmount: '79,996.50',
    },
    {
        sl: '3',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '4',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '5',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '6',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '7',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '8',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '9',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '10',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '1',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 01',
        shipmentDate: '9/8/2025',
        quantity: '14,130',
        unitPrice: '4.35',
        totalAmount: '61,465.50',
    },
    {
        sl: '2',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 00',
        shipmentDate: '9/8/2025',
        quantity: '18,390',
        unitPrice: '4.35',
        totalAmount: '79,996.50',
    },
    {
        sl: '3',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '4',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '5',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '6',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '7',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '8',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '9',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '10',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '1',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 01',
        shipmentDate: '9/8/2025',
        quantity: '14,130',
        unitPrice: '4.35',
        totalAmount: '61,465.50',
    },
    {
        sl: '2',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 00',
        shipmentDate: '9/8/2025',
        quantity: '18,390',
        unitPrice: '4.35',
        totalAmount: '79,996.50',
    },
    {
        sl: '3',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '4',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '5',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '6',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '7',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '8',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '9',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '10',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '1',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 01',
        shipmentDate: '9/8/2025',
        quantity: '14,130',
        unitPrice: '4.35',
        totalAmount: '61,465.50',
    },
    {
        sl: '2',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 00',
        shipmentDate: '9/8/2025',
        quantity: '18,390',
        unitPrice: '4.35',
        totalAmount: '79,996.50',
    },
    {
        sl: '3',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '4',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '5',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '6',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '7',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '8',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '9',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '10',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '1',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 01',
        shipmentDate: '9/8/2025',
        quantity: '14,130',
        unitPrice: '4.35',
        totalAmount: '61,465.50',
    },
    {
        sl: '2',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 00',
        shipmentDate: '9/8/2025',
        quantity: '18,390',
        unitPrice: '4.35',
        totalAmount: '79,996.50',
    },
    {
        sl: '3',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '4',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '5',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '6',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '7',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '8',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '9',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },
    {
        sl: '10',
        commGarments: ' KNITTED BOYS ',
        poNo: '2077286',
        styleNo: '2077286 02',
        shipmentDate: '9/8/2025',
        quantity: '5,670',
        unitPrice: '4.35',
        totalAmount: '24,664.50',
    },

];
const columnWidths = ['5%', '25%', '10%', '11%', '15%', '12%', '10%', '12%'];

const totalQuantity = items.reduce(
    // eslint-disable-next-line
    (acc, item) => acc + parseInt(item.quantity.replace(/,/g, '')), 0
);
const totalAmount = items.reduce(
    (acc, item) => acc + parseFloat(item.totalAmount.replace(/,/g, '')), 0
);
const TableHeader = ({ HeaderColumnWidths, Headerstyles }) => (
    <View style={Headerstyles.tableHeader} wrap={false}>
        {[
            { label: 'Order ID', fontSize: 9 },
            { label: 'Product', fontSize: 8.5 },
            { label: 'Order Quantity', fontSize: 9 },
            { label: 'KG/LB', fontSize: 9 },
            { label: 'Unit Price', fontSize: 9 },
            { label: 'Amount [U$]', fontSize: 9 },
            // { label: 'UNIT PRICE', fontSize: 9 },
            // { label: 'TOTAL AMOUNT', fontSize: 9 },
        ].map((col, i) => (
            <View
                key={i}
                style={{
                    ...Headerstyles.cell,
                    width: HeaderColumnWidths[i],
                    borderLeft: 1,
                    borderRight: i === 7 ? 1 : 0,
                }}
            >
                <Text
                    style={{
                        textAlign: 'center',
                        fontSize: col.fontSize,
                        fontWeight: 'bold',
                    }}
                >
                    {col.label}
                </Text>
            </View>
        ))}
    </View>
);

TableHeader.propTypes = {
    HeaderColumnWidths: PropTypes.any,
    Headerstyles: PropTypes.object,
};

const firstPageLimit = 25;
const otherPagesLimit = 35;

const splitRows = (ItemData) => {
    const chunks = [];

    if (ItemData.length <= firstPageLimit) {
        chunks.push(ItemData);
    } else {
        chunks.push(ItemData.slice(0, firstPageLimit));
        let remaining = ItemData.slice(firstPageLimit);

        while (remaining.length > 0) {
            chunks.push(remaining.slice(0, otherPagesLimit));
            remaining = remaining.slice(otherPagesLimit);
        }
    }

    return chunks;
};
const chunkedItems = splitRows(items);
// Component
const PiPDF = () => (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
        <Document>
            <Page size="A4" style={styles.page}>
                <View>
                    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                        <Text style={{ fontSize: 15, fontWeight: 'bold', fontFamily: 'book-antiqua-bold' }}>SYNERGIES SOURCING BD. LTD.</Text>
                        <Text style={{ fontFamily: 'Roboto-Bold', marginTop: 3 }}>HOUSE # 122/2, ROAD # 01 (WEST SIDE), DOHS, BARIDHARA, DHAKA-1206</Text>
                        <Text style={{ fontFamily: 'Roboto-Bold' }}>Tel :(+88-02) 8419646, 8410983, 8418774, Fax : (+88-02) 8414211</Text>
                    </View>

                    <Text style={styles.title}>SALES CONTRACT</Text>

                    <View style={{ flexDirection: 'row', gap: 60, marginBottom: 5, fontSize: 9 }}>
                        <View style={{ width: '50%' }}>
                            <Text style={{ fontFamily: 'Roboto-Bold', }}>BENIFICIARY / VENDOR / SUPPLIER: </Text>
                            <Text style={{ fontFamily: 'Century Gothic', }}>T-DESIGN SWEATERS LTD</Text>
                            <Text style={{ fontFamily: 'Century Gothic', }}>JARUN, KONABARI, GAZIPUR</Text>
                        </View>


                        <View style={{ width: '50%' }}>
                            <Text style={{ fontFamily: 'Roboto-Bold', }}>SC #: <Text style={{ fontFamily: 'Century Gothic', }}>SC/TDSL/TAKKO/03/2025</Text></Text>
                            <Text style={{ fontFamily: 'Roboto-Bold', }}>DATE: <Text style={{ fontFamily: 'Century Gothic', }}>15/4/2025</Text></Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 60, marginBottom: 5, fontSize: 9 }}>
                        <View style={{ width: '50%' }}>
                            <Text style={{ fontFamily: 'Roboto-Bold', }}>APPLICANT: </Text>
                            <Text style={{ fontFamily: 'Century Gothic', }}>TAKKO HOLDING GMBH</Text>
                            <Text style={{ fontFamily: 'Century Gothic', }}>MAX-PLANCK-STRAßE 5, 61381 FRIEDRICHSDORF,
                                GERMANY</Text>
                        </View>


                        <View style={{ width: '50%' }}>
                            <Text style={{ fontFamily: 'Roboto-Bold', }}>Applicant Bank </Text>
                            <Text style={{ fontFamily: 'Century Gothic', }}>BRAC BANK LIMITED</Text>
                            <Text style={{ fontFamily: 'Century Gothic', }}>ANIK TOWER ( LEVEL-2 ),220/B TEJGAON GULSHAN LINK
                                ROAD TEJGAON, DHAKA- 1208 , BANGLADESH.
                                BRAKBDDH</Text>
                        </View>
                    </View>

                    <Text style={styles.fullText}>We are pleased to offer the under-mentioned article(s) as per condition and details described below :</Text>


                    {/* <View style={styles.tableHeader}>
                    <View style={{ ...styles.cell, width: columnWidths[0], borderLeft: 1 }}>
                        <Text style={{ textAlign: 'center', fontSize: 9, fontWeight: 'bold', marginVertical: 'auto' }}>Sl#</Text>
                    </View>
                    <View style={{ ...styles.cell, width: columnWidths[1], borderLeft: 1 }}>
                        <Text style={{ textAlign: 'center', fontSize: 8.5, fontWeight: 'bold', marginVertical: 'auto' }}>COMMODITY READY MADE GARMENTS</Text>
                    </View>
                    <View style={{ ...styles.cell, width: columnWidths[2], borderLeft: 1 }}>
                        <Text style={{ textAlign: 'center', fontSize: 9, fontWeight: 'bold', marginVertical: 'auto' }}>PO NO.</Text>
                    </View>
                    <View style={{ ...styles.cell, width: columnWidths[3], borderLeft: 1 }}>
                        <Text style={{ textAlign: 'center', fontSize: 9, fontWeight: 'bold', marginVertical: 'auto' }}>STYLE NO</Text>
                    </View>
                    <View style={{ ...styles.cell, width: columnWidths[4], borderLeft: 1 }}>
                        <Text style={{ textAlign: 'center', fontSize: 9, fontWeight: 'bold', marginVertical: 'auto' }}>SHIPMENT DATE</Text>
                    </View>
                    <View style={{ ...styles.cell, width: columnWidths[5], borderLeft: 1 }}>
                        <Text style={{ textAlign: 'center', fontSize: 9, fontWeight: 'bold', marginVertical: 'auto' }}>QUANTITY / PCS</Text>
                    </View>
                    <View style={{ ...styles.cell, width: columnWidths[6], borderLeft: 1 }}>
                        <Text style={{ textAlign: 'center', fontSize: 9, fontWeight: 'bold' }}>UNIT PRICE</Text>
                    </View>
                    <View style={{ ...styles.cell, width: columnWidths[7], borderLeft: 1, borderRight: 1 }}>
                        <Text style={{ textAlign: 'center', fontSize: 9, fontWeight: 'bold' }}>TOTAL AMOUNT</Text>
                    </View>
                </View> */}
                    <View>
                        {chunkedItems.map((chunk, chunkIndex) => (
                            <View key={chunkIndex} wrap={false}>
                                <TableHeader columnWidths={columnWidths} styles={styles} />

                                {chunk.map((item, idx) => (
                                    <View key={idx} style={styles.tableRow} wrap={false}>
                                        {[
                                            item.sl,
                                            item.commGarments,
                                            item.poNo,
                                            item.styleNo,
                                            item.shipmentDate,
                                            // item.quantity,
                                            // item.unitPrice,
                                            // item.totalAmount,
                                        ].map((val, i) => (
                                            <Text
                                                key={i}
                                                style={{
                                                    ...styles.cell,
                                                    width: columnWidths[i],
                                                    borderLeft: 1,
                                                    borderRight: i === 7 ? 1 : 0,
                                                }}
                                            >
                                                {val}
                                            </Text>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>


                    {/* Total row */}
                    <View style={styles.tableRow}>
                        {[
                            '', '', '', '', 'Total',
                            // eslint-disable-next-line
                            totalQuantity.toLocaleString() + 'PCS', '', '$' + totalAmount.toFixed(2),
                        ].map((val, i) => (
                            <Text
                                key={i}
                                style={{
                                    ...styles.cell,
                                    width: columnWidths[i],
                                    borderLeft: i === 4 || i === 0 || i === 5 || i === 7 || i === 6 ? 1 : 0,
                                    borderRight: i === 7 ? 1 : 0,
                                    fontWeight: i === 4 || i === 5 || i === 7 ? 'bold' : 'normal',
                                }}
                            >
                                {val}
                            </Text>
                        ))}
                    </View>




                    <View style={{ marginTop: 5, flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 8, fontFamily: 'Roboto-Bold' }}>
                            {convertAmountToWords(totalAmount)}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                        {/* Left Column */}
                        <View style={{ width: '48%' }}>
                            <Text><Text style={styles.bold}>EXPIRY :</Text> 24/8/2025</Text>
                            <Text><Text style={styles.bold}>TERMS OF SALES :</Text> FOB BANGLADESH</Text>
                            <Text><Text style={styles.bold}>ADVISE THROUGH :</Text> SOUTHEAST BANK LTD., DHANMONDI BRANCH</Text>
                            <Text><Text style={styles.bold}>SWIFT NO :</Text> SEBDBDDHDHN</Text>
                            <Text><Text style={styles.bold}>ACCOUNT NO :</Text> 0012-11100015437</Text>
                            <Text><Text style={styles.bold}>GOODS ORIGIN :</Text> BANGLADESH</Text>
                            <Text><Text style={styles.bold}>TRANS SHIPMENT :</Text> ALLOWED</Text>
                        </View>

                        {/* Right Column */}
                        <View style={{ width: '48%' }}>
                            <Text><Text style={styles.bold}>CERTIFICATE OF ORIGIN :</Text> WILL BE PROVIDED</Text>
                            <Text><Text style={styles.bold}>TOLERANCE :</Text> 3%</Text>
                            <Text><Text style={styles.bold}>PACKING :</Text> EXPORT STANDARD</Text>
                            <Text><Text style={styles.bold}>SHIPMENT FROM :</Text> ANY PORT OF BANGLADESH</Text>
                            <Text><Text style={styles.bold}>PORT OF DESTINATION :</Text> HAMBURG, GERMANY</Text>
                            <Text><Text style={styles.bold}>PART SHIPMENT :</Text> ALLOWED</Text>
                            <Text><Text style={styles.bold}>PAYMENT :</Text> L/C 90 days</Text>
                        </View>
                    </View>

                    <Text style={{ fontFamily: 'Century Gothic', fontSize: 9, marginTop: 5 }}>INSPECTION CERTIFICATE ISSUED BY SYNERGIES SOURCING BD. LTD</Text>
                    <Text style={styles.fullText}>BL CLAUSE :
                        <Text>CONSIGN TO THE ORDER OF NEGOTIATING BANK
                            IN BANGLADESH AND ENDORSED BY THEM TO THE ORDER OF L/C OPENING BANK.
                            APPLICANT WILL PROVIDE L/C AGAINST THIS SALES CONTRACT ASAP AFTER PROVIDED L/C
                            THIS SALES CONTRACT WILL BE INVALID.</Text>
                    </Text>

                    <View style={styles.signatureBlock}>
                        <Text><Text style={styles.bold}>FOR SYNERGIES SOURCING BD. LTD.</Text></Text>
                        <Text>MUSTAFA KAMAL</Text>
                        <Text>Manager Commercial</Text>
                        <Text>Email: ratan@synergiesbangladesh.com</Text>
                        <Text>M: +880 1714 103 850</Text>
                    </View>

                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                        `${pageNumber} / ${totalPages}`
                    )} fixed />
                    <Text style={[styles.pageNumber, { textAlign: 'center' }]} render={({ pageNumber, totalPages }) => (
                        'Powered by : Interactive Technologies Gateway'
                    )} fixed />
                </View>
            </Page>
        </Document>
    </PDFViewer>
);

Font.register({ family: 'book-antiqua-bold', src: '/fonts/book-antiqua-bold.ttf' });
Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });
Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
Font.register({
    family: 'Century Gothic',
    src: '/fonts/Century Gothic.ttf'
});
export default PiPDF;
