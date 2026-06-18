import { View, Text, Page, Font, Document, PDFViewer, StyleSheet } from '@react-pdf/renderer'
import React from 'react'
import PropTypes from 'prop-types';
import numberToWords from 'number-to-words';

const TableHeader = ({ columnWidths, styles }) => (
    <View style={styles.tableHeader} wrap={false}>
        {[
            { label: 'SL#', fontSize: 11 },
            { label: 'GTIN', fontSize: 11 },
            { label: 'Description', fontSize: 11 },
            { label: 'Qty', fontSize: 11 },
            { label: 'UOM', fontSize: 11 },
            { label: 'Net Unit Price', fontSize: 11 },
            { label: 'Net Line Amount', fontSize: 11 },
            { label: 'VAT %', fontSize: 11 },

        ].map((col, i) => (
            <View
                key={col.label}
                style={{
                    ...styles.cell,
                    width: columnWidths[i],
                    borderLeft: 1,
                    borderRight: i === 7 ? 1 : 0,
                }}
            >
                <Text
                    style={{
                        textAlign: 'center',
                        fontSize: col.fontSize,
                        fontWeight: 'bold',
                        marginVertical: 'auto',
                    }}
                >
                    {col.label}
                </Text>
            </View>
        ))}
    </View>
);
const M5invoice = () => {
    const styles = StyleSheet.create({
        page: {
            paddingTop: 20,
            paddingBottom: 10, // reserve space for footer
            paddingHorizontal: 30,
            fontSize: 10,
            fontFamily: 'Century Gothic',
        },

        title: {
            textDecoration: 'underline',
            fontSize: 15,
            textAlign: 'center',
            marginBottom: 10,
            textTransform: 'uppercase',
            fontFamily: 'Roboto-Bold',
        },
        tableHeader: {
            borderTop: 1,
            flexDirection: 'row',
            backgroundColor: '#eee',
            fontWeight: 'bold',
            fontSize: 7,
            fontFamily: 'Roboto-Bold',
        },
        tableRow: {
            flexDirection: 'row',
        },
        cell: {
            padding: 3,
            fontSize: 11,
            textAlign: 'center',
            borderBottom: 1,
            borderLeft: 1,
            borderColor: '#000',
        },
        pageNumber: {
            position: 'absolute',
            fontSize: 8,
            bottom: -50,
            left: 0,
            right: 0,
            textAlign: 'right',
            color: 'black',
        },
    });

    const columnWidths = ['10%', '13%', '24%', '10%', '11%', '11%', '11%', '10%'];



    const items = [
        {
            sl: '1',
            gtin: '1234567890123',
            description: 'KNITTED BOYS',
            qty: '14,130',
            uom: 'PCS',
            netUnitPrice: '4.35',
            netLineAmount: '61,465.50',
            vatPercent: '0%'
        },
        {
            sl: '2',
            gtin: '1234567890123',
            description: 'KNITTED BOYS',
            qty: '14,130',
            uom: 'PCS',
            netUnitPrice: '4.35',
            netLineAmount: '61,465.50',
            vatPercent: '0%'
        },
        {
            sl: '3',
            gtin: '1234567890123',
            description: 'KNITTED BOYS',
            qty: '14,130',
            uom: 'PCS',
            netUnitPrice: '4.35',
            netLineAmount: '61,465.50',
            vatPercent: '0%'
        }
    ];

    const firstPageLimit = 25;
    const otherPagesLimit = 35;

    const splitRows = (rows) => {
        const chunks = [];

        if (rows.length <= firstPageLimit) {
            chunks.push(rows);
        } else {
            chunks.push(rows.slice(0, firstPageLimit));
            let remaining = rows.slice(firstPageLimit);

            while (remaining.length > 0) {
                chunks.push(remaining.slice(0, otherPagesLimit));
                remaining = remaining.slice(otherPagesLimit);
            }
        }

        return chunks;
    };

    const chunkedItems = splitRows(items);

    // const totalQuantity = items.reduce(
    //     (acc, item) => acc + parseInt(item.pcsQty.replace(/,/g, ''), 10),
    //     0,
    // );
    // const totalAmount = items.reduce(
    //     (acc, item) => acc + parseFloat(item.totalAmountAed.replace(/,/g, '')),
    //     0,
    // );

    // const convertAmountToWords = (amount) => {
    //     const [whole, decimal] = amount.toFixed(2).split('.');
    //     const wholeWords = numberToWords.toWords(Number(whole)).toUpperCase();
    //     const decimalWords = numberToWords.toWords(Number(decimal)).toUpperCase();
    //     return `IN WORDS AED: ${wholeWords} DOLLARS AND ${decimalWords} CENTS ONLY`;
    // };

    return (
        <PDFViewer style={{ width: '100%', height: '800px' }}>
            <Document>
                <Page size="A3" orientation='landscape' style={styles.page}>
                    <View>


                        <Text style={styles.title}>COMMERCIAL  INVOICE</Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', gap: 40, fontSize: 11, border: 1, borderRadius: 5, padding: 5, marginBottom: 5 }}>
                            <View style={{ width: '33%' }}>
                                <Text style={{ fontFamily: 'Roboto-Bold', }}>INVOICE NO :  <Text style={{ fontFamily: 'Century Gothic', }}>CTL-141/1150/2024</Text></Text>
                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Invoice Date :  <Text style={{ fontFamily: 'Century Gothic', }}>09.04.2025</Text></Text>
                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Due Date :  <Text style={{ fontFamily: 'Century Gothic', }}>16.04.2025</Text></Text>
                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Currency Code :  <Text style={{ fontFamily: 'Century Gothic', }}>USD</Text></Text>
                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Payment Reference :  <Text style={{ fontFamily: 'Century Gothic', }}>123456789</Text></Text>
                                {/* <Text style={{ fontFamily: 'Roboto-Bold', }}>TRANSFERRING BANK'S REFERENCE NO :  <Text style={{ fontFamily: 'Century Gothic', }}>091IEUT243660501</Text></Text> */}
                            </View>


                            <View style={{ width: '37%' }}>

                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Supplier(Sender):</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>ABC Tech</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>VAT Reg. No  :  <Text style={{ fontFamily: 'Century Gothic', }}>NO123456789MVA</Text></Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>Oculas GLN    :  <Text style={{ fontFamily: 'Century Gothic', }}>7000000000001</Text></Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>33 TS 000000 SAN PO KONG, KOWLOON, HONG KONG</Text>
                            </View>

                            <View style={{ width: '30%' }}>
                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Invoice Contact Details</Text>
                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Contact Name :  <Text style={{ fontFamily: 'Century Gothic', }}>Jasmine Bailey</Text></Text>
                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Email :  <Text style={{ fontFamily: 'Century Gothic', }}>invoice@oculasglobal.com</Text></Text>
                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Mailbox Address :  <Text style={{ fontFamily: 'Century Gothic', }}>ABC Mailbox 123</Text></Text>

                            </View>
                        </View>


                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', gap: 40, fontSize: 11, border: 1, borderRadius: 5, padding: 5, marginBottom: 5 }}>
                            <View style={{ width: '33%' }}>

                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Agency</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>Oculas</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>VAT Reg. No  :  <Text style={{ fontFamily: 'Century Gothic', }}>NO123456789MVA</Text></Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>Oculas GLN    :  <Text style={{ fontFamily: 'Century Gothic', }}>7000000000001</Text></Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>33 TS 000000 SAN PO KONG, KOWLOON, HONG KONG</Text>
                            </View>


                            <View style={{ width: '37%' }}>

                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Buyer :</Text>

                                <Text style={{ fontFamily: 'Century Gothic', }}>Coop Norge SA</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>Org No     :  <Text style={{ fontFamily: 'Century Gothic', }}>7000000000001</Text></Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>Buyer GLN   :  <Text style={{ fontFamily: 'Century Gothic', }}>7000000000001</Text></Text>

                            </View>

                            <View style={{ width: '37%' }}>

                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Delivery Address:</Text>

                                <Text style={{ fontFamily: 'Century Gothic', }}>Coop Warehouse, Langhus</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>Torgarden, TRONDHEIM, NO</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>Warehouse GLN   :  <Text style={{ fontFamily: 'Century Gothic', }}>7000000000001</Text></Text>

                            </View>

                            <View style={{ width: '30%' }}>

                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Invoice Totals</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>Sum Net Item Lines Amount</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>VAT Basis Amount</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>VAT Amount (25%)</Text>
                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Invoice Total (Incl. VAT)</Text>
                            </View>
                            <View style={{ width: '30%' }}>

                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Amount (USD)</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>4500</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>V4500</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>4500</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>4500</Text>
                            </View>

                        </View>



                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', gap: 40, fontSize: 11, border: 1, borderRadius: 5, padding: 5, marginBottom: 5 }}>
                            <View style={{ width: '33%' }}>

                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Order References</Text>

                            </View>


                            <View style={{ width: '37%' }}>

                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Buyer PO Number</Text>

                                <Text style={{ fontFamily: 'Century Gothic', }}>PO-45678</Text>


                            </View>

                            <View style={{ width: '37%' }}>

                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Vendor Order Number</Text>

                                <Text style={{ fontFamily: 'Century Gothic', }}>ORD-ITG-9876</Text>


                            </View>
                            <View style={{ width: '30%' }}>

                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Buyer Reference</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>John Doe, Coop</Text>

                            </View>
                            <View style={{ width: '30%' }}>

                                {/* <Text style={{ fontFamily: 'Roboto-Bold', }}>Invoice Totals</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>Sum Net Item Lines Amount</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>VAT Basis Amount</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>VAT Amount (25%)</Text>
                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Invoice Total (Incl. VAT)</Text> */}
                            </View>


                        </View>




                        <View>
                            {chunkedItems.map((chunk, chunkIndex) => (
                                <View key={chunkIndex} wrap={false}>
                                    <TableHeader columnWidths={columnWidths} styles={styles} />

                                    {chunk.map((item, idx) => (
                                        <View key={idx} style={styles.tableRow} wrap={false}>
                                            {[
                                                item.sl,
                                                item.gtin,
                                                item.description,
                                                item.qty,
                                                item.uom,
                                                item.netUnitPrice,
                                                item.netLineAmount,
                                                item.vatPercent
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

                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', gap: 40, fontSize: 11, border: 1, borderRadius: 5, padding: 5, marginBottom: 5, marginTop: 10 }}>
                            <View style={{ width: '33%' }}>

                                <Text style={{ fontFamily: 'Roboto-Bold', }}>VAT Breakdown</Text>

                            </View>


                            <View style={{ width: '37%' }}>

                                <Text style={{ fontFamily: 'Roboto-Bold', }}>VAT %</Text>

                                <Text style={{ fontFamily: 'Century Gothic', }}>25%</Text>


                            </View>

                            <View style={{ width: '37%' }}>

                                <Text style={{ fontFamily: 'Roboto-Bold', }}>VAT Base Amount</Text>

                                <Text style={{ fontFamily: 'Century Gothic', }}>4500</Text>


                            </View>
                            <View style={{ width: '30%' }}>

                                <Text style={{ fontFamily: 'Roboto-Bold', }}>VAT Amount</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>1125</Text>

                            </View>
                            <View style={{ width: '30%' }}>

                                {/* <Text style={{ fontFamily: 'Roboto-Bold', }}>Invoice Totals</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>Sum Net Item Lines Amount</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>VAT Basis Amount</Text>
                                <Text style={{ fontFamily: 'Century Gothic', }}>VAT Amount (25%)</Text>
                                <Text style={{ fontFamily: 'Roboto-Bold', }}>Invoice Total (Incl. VAT)</Text> */}
                            </View>


                        </View>



                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, marginBottom: 10 }}>
                            <View
                                style={{
                                    border: 1,
                                    borderRight: 0,
                                    borderColor: '#000',
                                    fontSize: 10,
                                    width: '50%',
                                }}
                            >


                                {/* Data Rows */}
                                {[
                                    ['Bank Information'],

                                ].map(([label], idx) => (
                                    <View
                                        key={idx}
                                        style={{
                                            flexDirection: 'row',
                                            fontSize: 14,
                                            borderColor: '#000',
                                            marginVertical: 'auto'
                                        }}
                                    >
                                        <Text style={{ flex: 1.5, padding: 2, marginVertical: 'auto', textAlign: 'center' }}>{label}</Text>

                                    </View>
                                ))}
                            </View>


                            <View
                                style={{
                                    border: 1,
                                    borderColor: '#000',
                                    fontSize: 10,
                                    width: '50%',
                                }}
                            >
                                {/* Header Row */}
                                <View style={{ flexDirection: 'row', borderBottom: 1, borderColor: '#000' }}>
                                    <Text style={{ flex: 1, textAlign: 'center', fontFamily: 'Roboto-Bold', padding: 2 }}>
                                        Supplier
                                    </Text>
                                </View>

                                {/* Data Rows */}
                                {[
                                    ['Field', 'Details'],
                                    ['Account Name', 'ABC Tech'],
                                    ['Account No.', 'NO9386011117947'],
                                    ['Bank Name', 'XYZ'],
                                    ['Bank Address', 'XYZ'],
                                    ['Bank Swift Code ', 'XYZ'],
                                    ['IBAN Number', 'XYZ'],
                                ].map(([label, value], idx) => (
                                    <View
                                        key={idx}
                                        style={{
                                            flexDirection: 'row',
                                            borderTop: 1,
                                            borderColor: '#000',
                                        }}
                                    >
                                        <Text style={{ flex: 1.5, padding: 2 }}>{label}</Text>
                                        <Text style={{ flex: 1, padding: 2, textAlign: 'right' }}>{value}</Text>

                                    </View>
                                ))}
                            </View>

                            <View
                                style={{
                                    border: 1,
                                    borderLeft: 0,
                                    borderColor: '#000',
                                    fontSize: 10,
                                    width: '50%',
                                }}
                            >
                                {/* Header Row */}
                                <View style={{ flexDirection: 'row', borderBottom: 1, borderColor: '#000' }}>
                                    <Text style={{ flex: 1, textAlign: 'center', fontFamily: 'Roboto-Bold', padding: 2 }}>
                                        Agency
                                    </Text>
                                </View>

                                {/* Data Rows */}
                                {[
                                    ['Field', 'Details'],
                                    ['Account Name', 'ABC Tech'],
                                    ['Account No.', 'NO9386011117947'],
                                    ['Bank Name', 'XYZ'],
                                    ['Bank Address', 'XYZ'],
                                    ['Bank Swift Code ', 'XYZ'],
                                    ['IBAN Number', 'XYZ'],
                                ].map(([label, value], idx) => (
                                    <View
                                        key={idx}
                                        style={{
                                            flexDirection: 'row',
                                            borderTop: 1,
                                            borderColor: '#000',
                                        }}
                                    >
                                        <Text style={{ flex: 1.5, padding: 2 }}>{label}</Text>
                                        <Text style={{ flex: 1, padding: 2, textAlign: 'right' }}>{value}</Text>

                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', gap: 40, fontSize: 11, border: 1, borderRadius: 5, padding: 5, marginBottom: 5 }}>

                            <Text>All prices are in USD.  Buyer and delivery address must be identical as per Coops requirement. If this invoice is related to the warehouse at Langhus: GLN 7080000000494</Text>
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
    )
}

Font.register({ family: 'book-antiqua-bold', src: '/fonts/book-antiqua-bold.ttf' });
Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });
Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
Font.register({
    family: 'Century Gothic',
    src: '/fonts/Century Gothic.ttf'
});

export default M5invoice
TableHeader.propTypes = {
    columnWidths: PropTypes.arrayOf(PropTypes.string).isRequired,
    styles: PropTypes.object.isRequired,
};