import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    PDFViewer,
    Font,
    Image,
} from '@react-pdf/renderer';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
        position: 'relative',
    },
    border: {
        position: 'absolute',
        top: 15,
        left: 15,
        right: 15,
        bottom: 15,
        border: '1.5pt solid black',
        borderRadius: 4,
        zIndex: 0,
    },
    container: {
        position: 'relative',
        zIndex: 1,
    },
    header: {
        marginBottom: 20,
    },
    companyName: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 6,
        color: 'black',
        textTransform: 'uppercase',
    },
    companyAddress: {
        fontSize: 9,
        lineHeight: 1.2,
        color: 'black',
        marginBottom: 2,
    },
    drawnUnderSection: {
        marginTop: 15,
        marginBottom: 10,
        fontStyle: 'italic',
        fontSize: 9,
    },
    billTitle: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginVertical: 20,
        color: 'black',
        textDecoration: 'underline',
        textTransform: 'uppercase',
    },
    billInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    billNumber: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: 'black',
    },
    billDate: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: 'black',
    },
    exchangeFor: {
        fontSize: 10,
        fontStyle: 'italic',
        marginBottom: 20,
        fontFamily: 'Helvetica-Oblique',
    },
    mainContent: {
        fontSize: 10,
        lineHeight: 1.5,
        marginBottom: 10,
        textAlign: 'justify',
    },
    boldText: {
        fontFamily: 'Helvetica-Bold',
    },
    signatureSection: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    toSection: {
        fontSize: 10,
        flex: 1,
    },
    forSection: {
        fontSize: 10,
        textAlign: 'right',
        flex: 1,
    },
    companyNameBottom: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        marginTop: 5,
    },
    factoryInfo: {
        fontSize: 8,
        marginTop: 30,
        lineHeight: 1.2,
        textAlign: 'center',
    },
    pageNumber: {
        position: 'absolute',
        bottom: 40,
        right: 50,
        fontSize: 9,
        color: '#666',
    },
    watermark: {
        position: 'absolute',
        top: '45%',
        left: '15%',
        transform: 'translate(-50%, -50%) rotate(-30deg)',
        fontSize: 55,
        color: 'rgba(44, 62, 80, 0.05)',
        fontFamily: 'Helvetica-Bold',
        zIndex: 0,
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 40,
        right: 40,
        fontSize: 8,
        flexDirection: "row",
        justifyContent: 'space-between'
    },
});

function BillOfExchangePDF({ currentData }) {
    const defaultData = {
        billNumber: '',
        date: '',
        totalAmount: '0.00',
        amountInWords: '',
        invoiceNumber: '',
        invoiceDate: '',
        quantity: '0.00',
        truckChallanNo: '',
        companyName: 'Simco Spinning and Textiles Limited',
        companyAddress: 'House: #2/B (2nd Floor), Road: 04, Block: B, Banani, Dhaka-1213, Bangladesh.',
        companyContact: 'T: +88 02 55033401, +88 02 55033402. E: info@simcobangladesh.com',
        buyerName: '',
        buyerAddress: '',
        buyerIRC: '',
        buyerBIN: '',
        bankName: '',
        bankBranch: '',
        bankAddress: '',
        lcNumber: '',
        lcDate: '',
        amendments: [],
        InvNo: '',
        InvDate: '',
        totalQuantity: '',
        Description: '',
        factoryInfo: 'Factory: Mouza: Dhamshur Union Mollikbari P O: Hajir Bazar P S: Bhaluka Dist: Myrnensingh Bangladesh Web: www cyclofibers com',
        payeeBankName: '',
        payeeBankBranch: '',
        payeeBankAddress: '',
        isFirstCopy: true,
    };

    // Merge currentData (from pi-pdf-view.jsx) with defaultData
    const billData = { ...defaultData, ...(currentData || {}) };

    // Ensure amendments is always an array
    if (!Array.isArray(billData.amendments)) {
        billData.amendments = [];
    }
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
    const BillDocument = () => (
        <Document title={`Bill of Exchange - ${billData.billNumber}`}>
            {/* First Copy */}
            <Page size="B4" style={styles.page}>
                {/* Border */}
                <View style={styles.border} />

                {/* Watermark */}
                <Text style={styles.watermark}>BILL OF EXCHANGE</Text>


                <View style={styles.container}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>  <Image source="/logo/Simco(CMYK).png" style={{ height: 40, width: 120 }} /></View>


                    </View>
                    <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderBottom: 1, paddingBottom: 5 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Roboto-Bold' }}>SIMCO Spinning & Textiles LTD.</Text>
                        <Text style={{ fontFamily: 'Century Gothic', marginTop: 3 }}>House: #2/B (2nd Floor), Road: 04, Block: B, Banani, Dhaka-1213, Bangladesh.</Text>
                        <Text style={{ fontFamily: 'Century Gothic', marginTop: 3 }}>Telephone:<Text> +88 02 55033401,+88 02 55033401, +88 02 55033402.</Text>Email:<Text>  info@simcobangladesh.com</Text></Text>

                    </View>

                    {/* Drawn Under Section */}
                    <View style={[styles.drawnUnderSection, { textAlign: 'center' }]}>
                        <Text>DRAWN UNDER {billData.issuingBank || ''}{billData.bankBranch || ''}</Text>
                        <Text>{billData.bankAddress || ''}.. CREDIT NO. {billData.lcNumber || ''} DATED. {billData.lcDate || ''}{billData.LcDetails.AmendmentDetails && billData.LcDetails.AmendmentDetails.length > 0 ? ` AND Amendment No.: ${billData.amendments.map(a => a.number || '').join(', ')}` : ''}</Text>
                        {billData.LcDetails.AmendmentDetails && billData.LcDetails.AmendmentDetails.length > 0 && (
                            <Text>Date: {billData.LcDetails.AmendmentDetails.map(a => a.date || '').join(', ')} EXPORT LC / CONTRACT NO. {billData.ContractNo || ''} DATED.{billData.InvDate || ''},</Text>
                        )}
                        {/* {(!billData.amendments || billData.amendments.length === 0) && (
                            <Text>EXPORT LC / CONTRACT NO. {billData.ContractNo || ''} DATED.{billData.InvDate || ''},</Text>
                        )} */}
                        <Text>GARMENTS QUANTITY : {billData.totalQuantity || ''} {billData.Description || ''}.</Text>
                    </View>

                    {/* Bill of Exchange Title */}
                    <Text style={styles.billTitle}>BILL OF EXCHANGE</Text>

                    {/* Bill Number and Date */}
                    <View style={styles.billInfo}>
                        <Text style={styles.billNumber}>No.: {billData.InvNo}</Text>
                        <Text style={styles.billDate}>Date: {billData.InvDate}</Text>
                    </View>

                    {/* Exchange For */}
                    <Text style={styles.exchangeFor}>Exchange for US$ {billData.totalAmount}</Text>

                    {/* Main Content */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.mainContent}>
                            At 90 Days from the date of acceptance of this FIRST of Exchange (Second of the same tenor and date being unpaid)
                        </Text>
                        <Text style={styles.mainContent}>
                            pay to {billData.NegotiatingBank}{billData.bankBranch},
                        </Text>
                        <Text style={styles.mainContent}>
                            {billData.NegotiatingbankAddress}, the sum of USD {billData.totalAmount} (SAY: {billData.amountInWords}) ONLY.
                        </Text>

                    </View>

                    {/* Value Received Section */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.mainContent}>
                            Value received against Invoice No.{billData.InvNo} Date: {billData.InvDate}, QTY:
                        </Text>
                        <Text style={styles.mainContent}>
                            {billData.totalQuantity} lbs, Vide Truck Challan No. {billData.ChallanNo} Date:{billData.ChallanDate}. Account of {billData.buyerName},
                        </Text>
                        <Text style={styles.mainContent}>
                            {billData.accountRisk}. IRC NUMBER : {billData.buyerIRC}, BIN NO. {billData.buyerBIN}.
                        </Text>
                    </View>

                    {/* Drawn Under Section */}
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.mainContent}>
                            Drawn under {billData.issuingBank || ''}{billData.bankBranch || ''},
                        </Text>
                        <Text style={styles.mainContent}>
                            {billData.bankAddress || ''}., Against Local Export L/C No. {billData.InvNo || ''}
                        </Text>
                        <Text style={styles.mainContent}>
                            DATED: {billData.lcDate || ''}{billData.LcDetails.AmendmentDetails && billData.LcDetails.AmendmentDetails.length > 0 ? ` Amendment No.: ${billData.LcDetails.AmendmentDetails.map(a => a.AmendmentNo || '').join(', ')} Date: ${billData.LcDetails.AmendmentDetails.map(a => a.AmendmentDate || '').join(', ')} AND` : ''}
                        </Text>
                        <Text style={styles.mainContent}>
                            EXPORT LC / CONTRACT NO. {billData.LcDetails.LcNo || ''} DATED.{billData.LcDetails.LcDate || ''},
                        </Text>
                        <Text style={styles.mainContent}>
                            GARMENTS QUANTITY : {billData.totalQuantity || ''} {billData.Description || ''}.
                        </Text>
                    </View>

                    {/* Signature Section */}
                    <View style={styles.signatureSection}>
                        <View style={styles.toSection}>
                            <Text style={styles.boldText}>TO</Text>
                            <Text>{billData.issuingBank}.</Text>
                            <Text>{billData.bankBranch},</Text>
                            <Text>{billData.bankAddress}.</Text>
                        </View>

                        <View style={styles.forSection}>
                            <Text style={styles.boldText}>FOR</Text>
                            <Text style={styles.companyNameBottom}>{billData.companyName}</Text>
                        </View>
                    </View>

                    {/* Factory Info */}
                    {/* <View style={styles.factoryInfo}>
                        <Text>{billData.factoryInfo}</Text>
                    </View> */}
                </View>
                <Footer />
            </Page>


        </Document>
    );

    return (
        <PDFViewer style={{ height: '100vh', width: '100%' }}>
            <BillDocument />
        </PDFViewer>
    );
}

BillOfExchangePDF.propTypes = {
    currentData: PropTypes.object,
};
// Font registrations
Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });
Font.register({ family: 'Helvetica-Bold', src: '/fonts/Helvetica-Bold.ttf' });
Font.register({ family: 'Helvetica-Oblique', src: '/fonts/Helvetica-Oblique.ttf' });

export default BillOfExchangePDF;