// components/Cyclo.js
import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFViewer,
    Image,
    Font,
} from '@react-pdf/renderer';
import PropTypes from 'prop-types';
import { fDate } from 'src/utils/format-time';

const styles = StyleSheet.create({
    page: {
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 30,
        fontSize: 10,
        fontFamily: 'Roboto-Regular',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    companyInfo: {
        fontSize: 9,
        lineHeight: 1.3,
    },
    title: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 10,
        textTransform: 'uppercase',
        fontFamily: 'Roboto-Bold',
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 11,
        fontFamily: 'Roboto-Bold',
        marginBottom: 5,
        textDecoration: 'underline',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    label: {
        fontFamily: 'Roboto-Bold',
        width: '50%',
    },
    value: {
        width: '70%',
    },
    table: {
        marginTop: 10,
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderTop: 1,
        borderBottom: 1,
        borderLeft: 1,
        borderRight: 1,
        fontFamily: 'Roboto-Bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: 1,
        borderLeft: 1,
        borderRight: 1,
    },
    tableCell: {
        padding: 5,
        borderRight: 1,
        fontSize: 9,
    },

    signature: {


        fontFamily: 'Roboto-Regular',
    },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 40,
        right: 40,
        fontSize: 8,
        flexDirection: "row",
justifyContent:'space-between'
    },

});

const TruckChallan = ({ currentData }) => {
    // Default data structure based on your PDF
    const defaultData = {
        truckChallanNo: '16079',
        date: '23-08-2025',
        truckNo: 'DHAKA METRO TA 13-8186',
        orderOf: 'MUTUAL TRUST BANK LIMITED.\nMTB INTERNATIONAL TRADE SERVICES, MOTIJHEEL\nSUB CENTRE, WW TOWER (5TH FLOOR), 68,\nMOTIJHEEL CIA, DHAKA-1000, BANGLADESH.',
        notifyTo: 'YOUR FASHION SWEATER LTD\nPLOT NO. 126, 1230, 1276 GILARCHALA, MASTERBARI,\nSRIPUR, GAZIPUR-1740, BANGLADESH.\nIRC NUMBER : 260326120171820, BIN NO: 000270725-0103',
        from: 'Simco Spinning and Textiles Limited\nDhamshur, Mollikbari, Hajir Bazar, Bhaluka,\nMymensingh, Bangladesh.\nBIN No.: 000482758-0103',
        to: 'YOUR FASHION SWEATER LTD\nPLOT NO. 126, 1230, 1276\nGILARCHALA, MASTERBARI, SRIPUR,\nGAZIPUR-1740, BANGLADESH.\nIRC NUMBER : 260326120171820, BIN NO.\n000270725-0103',
        lcNo: '0002228250403885',
        lcDate: '12-05-2025',
        amendmentDetails: 'Amendment No. 01, 02',
        exportLcContractNo: 'YFL00098 DATED.05-05-2025, GARMENTS QUANTITY : 99,450 PCS (+/- 5 PCT.) MENS CARDIGAN AND KNITTED PONCHO',
        shipmentDate: '23-08-2025',
        items: [
            {
                sl: '1',
                description: 'Twisted Yam CYCLO Recycle Cotton Blended Yam 30/2 50% Cyclo Recycled Cotton 50% Recycled Polyester OE Light Grey C48',
                quantity: '940.00',
                remarks: ''
            },
            {
                sl: '2',
                description: 'Twisted Yam CYCLO Recycle Cotton Blended Yam 30/2 50% Cyclo Recycled Cotton 50% Recycled Polyester OE Tan C35',
                quantity: '970.00',
                remarks: ''
            }
        ],
        totalQuantity: '1,910.00',
        proformaInvoices: 'SSTL/PI/2025/HO00015-R, SSTL/PI/2025/HO002340, SSTL/PI/2025/HO002400 DATED. 28-04-2025, 15-06-2025, 20-07-2025',
        hsCode: '5205.11.00'
    };

    const data = { ...defaultData, ...currentData };
    const Footer = () => (
        <View style={styles.footer} fixed>
            {/* Left side */}
            <Text >Factory: Mouza: Dhamshur, Union: Mollikbari, P.O: Hajir Bazar, P.S: Bhaluka, Dist.: Mymensingh, Bangladesh. Web: www.cyclofibers.com</Text>

            {/* Center (Page X of Y) */}
            <Text

                render={({ pageNumber, totalPages }) =>
                    `Page ${pageNumber} of ${totalPages}`
                }
            />


        </View>
    );
    return (
        <PDFViewer style={{ width: '100%', height: '80vh',marginTop:5 }}>
            <Document title='Truck Challan'>
                <Page size="B4" style={styles.page}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>  <Image source="/logo/Simco(CMYK).png" style={{ height: 40, width: 120 }} /></View>


                    </View>
                    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderBottom: 1, paddingBottom: 5 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Roboto-Bold' }}>SIMCO Spinning & Textiles LTD.</Text>
                        <Text style={{ fontFamily: 'Century Gothic', marginTop: 3 }}>House: #2/B (2nd Floor), Road: 04, Block: B, Banani, Dhaka-1213, Bangladesh.</Text>
                        <Text style={{ fontFamily: 'Century Gothic', marginTop: 3 }}>Telephone:<Text> +88 02 55033401,+88 02 55033401, +88 02 55033402.</Text>Email:<Text>  info@simcobangladesh.com</Text></Text>

                    </View>

                    {/* Title */}
                    <Text style={styles.title}>TRUCK CHALLAN</Text>

                    {/* Challan Details */}
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Text style={styles.label}>TRUCK CHALLAN NO.:{currentData.ChallanNo}</Text>
                           
                            <Text style={{ ...styles.label, marginLeft: 20 }}>Date:<Text style={{}}>{currentData.ChallanDate}</Text></Text>

                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>TRUCK NO.:<Text >{data.truckNo}</Text></Text>

                        </View>
                    </View>

                    {/* Order of and Notify to */}
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <View style={{ width: '50%' }}>
                                <Text style={styles.sectionTitle}>To the Order of :</Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.3 }}>{currentData.issuingBank}</Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.3 }}>{currentData.bankAddress}</Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <Text style={styles.sectionTitle}>Notify to:</Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.3 }}>{currentData.NotifyName}</Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.3 }}>{currentData.notifyParty}</Text>
                            </View>
                        </View>
                    </View>

                    {/* From and To */}
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <View style={{ width: '50%' }}>
                                <Text style={styles.sectionTitle}>From:</Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.3, fontFamily: 'Roboto-Bold' }}>Supplier Factory :</Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.3 }}>{data.from}</Text>
                            </View>
                            <View style={{ width: '50%' }}>
                                <Text style={styles.sectionTitle}>To:</Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.3, fontFamily: 'Roboto-Bold' }}>Openers Factory:</Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.3 }}>{currentData.NotifyName}</Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.3 }}>{currentData.notifyParty}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Freight and Shipment */}
                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Text style={{ ...styles.label, fontFamily: 'Roboto-Bold' }}>{currentData.Collection}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={{ ...styles.label, fontFamily: 'Roboto-Bold' }}>SHIPMENT DATE : {currentData.ShippingBillDate}</Text>
                        </View>
                    </View>

                    {/* LC Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>LC Details:</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>L/C No.</Text>
                            <Text style={styles.value}>{currentData.LcDetails.LcNo} || {currentData.LcDetails.LcDate}</Text>
                        </View>

                        {
                            currentData.LcDetails.AmendmentDetails && currentData.LcDetails.AmendmentDetails.length > 0 && (
                                currentData.LcDetails.AmendmentDetails.map((amendment, index) => (
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Amendment Details:</Text>
                                        <Text style={styles.value}>{amendment.AmendmentNo||'-'}  || Dated : {amendment.AmendmentDate||'-'}</Text>
                                    </View>
                                ))
                            )
                        }

                        <View style={styles.row}>
                            <Text style={styles.label}>Export LC/Contract No:</Text>
                            <Text style={styles.value}>{currentData.LcDetails.LcNo}</Text>
                        </View>
                    </View>

                    {/* Items Table */}
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={{ ...styles.tableCell, width: '10%', textAlign: 'center' }}>SL</Text>
                            <Text style={{ ...styles.tableCell, width: '60%', textAlign: 'center' }}>DESCRIPTION OF GOODS</Text>
                            <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'center' }}>QUANTITY</Text>
                            <Text style={{ ...styles.tableCell, width: '10%', textAlign: 'center', borderRight: 0 }}>REMARKS</Text>
                        </View>

                       <View style={styles.tableRow}>
                            <Text style={{ ...styles.tableCell, width: '100%', textAlign: 'center', borderRight: 0, fontFamily: 'Roboto-Bold' }}>
                               {currentData.Description||"N/A"}
                            </Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={{ ...styles.tableCell, width: '100%', textAlign: 'center', borderRight: 0, fontSize: 8 }}>
                               HS Code : {currentData.HSCode}
                            </Text>
                        </View>

                        {currentData.items.map((item, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={{ ...styles.tableCell, width: '10%', textAlign: 'center' }}>{index + 1}</Text>
                                <Text style={{ ...styles.tableCell, width: '60%' }} >{item.Desc?.split(/\r?\n/).map((line, idx) => (
                                    <Text key={idx}>{line.trim()}</Text>
                                ))}</Text>
                                <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'center' }}>
                                    {// eslint-disable-next-line 
                                        item.Quantity + " " + item.UOMSymbol}</Text>
                                <Text style={{ ...styles.tableCell, width: '10%', textAlign: 'center', borderRight: 0 }}>{item.remarks}</Text>
                            </View>
                        ))}

                        {/* Proforma Invoice Details */}
                        <View style={styles.tableRow}>
                            <Text style={{ ...styles.tableCell, width: '100%', borderRight: 0, fontSize: 8, textAlign: 'center' }}>
                                ( OPEN END YARN ) AS PER PROFORMA INVOICE NO. {currentData.PIDetails.map(pi => ` ${pi.PI_NO} Dated: ${fDate(pi.PI_Date)}`).join(', ')}
                            </Text>
                        </View>

                        {/* Total Row */}
                        <View style={styles.tableRow}>
                            <Text style={{ ...styles.tableCell, width: '70%', textAlign: 'center', fontFamily: 'Roboto-Bold' }}>TOTAL</Text>
                            <Text style={{ ...styles.tableCell, width: '20%', textAlign: 'center', fontFamily: 'Roboto-Bold' }}>{currentData?.totalQuantity.toLocaleString()} {currentData.items[0].UOMSymbol}</Text>
                            <Text style={{ ...styles.tableCell, width: '10%', textAlign: 'center', borderRight: 0, fontFamily: 'Roboto-Bold' }} />
                        </View>
                    </View>

                    {/* Certification */}
                    <View style={styles.section}>
                        <Text style={{ fontSize: 9, fontFamily: 'Roboto-Bold', textAlign: 'center', marginBottom: 10 }}>
                            WE CERTIFY THAT THE MERCHANDISE ARE OF BANGLADESH ORIGIN.
                        </Text>
                    </View>

                    {/* Signature */}
                    <View style={styles.signature}>
                        <Text>For</Text>
                        <Text>Simco Spinning and Textiles Limited</Text>
                        <Text>Dhamshur, Mollikbari, Hajir Bazar,</Text>
                        <Text>Bhaluka, Mymensingh, Bangladesh.</Text>
                        <Text>BIN No.: 000482758-0103</Text>
                    </View>

                    <Footer />
                </Page>
            </Document>
        </PDFViewer>
    );
};

// Font registrations
Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
Font.register({ family: 'Roboto-Regular', src: '/fonts/Roboto-Regular.ttf' });
Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });

TruckChallan.propTypes = {
    currentData: PropTypes.object,
};

TruckChallan.defaultProps = {
    currentData: {},
};

export default TruckChallan;