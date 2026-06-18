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
import PropTypes from 'prop-types';
import { fDate } from 'src/utils/format-time';

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
        textAlign: 'center',
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
        textAlign: 'center',
        marginBottom: 2,
        lineHeight: 1.2,
        color: 'black',
    },
    refDateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
        paddingHorizontal: 10,
    },
    refNumber: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: 'black',
    },
    date: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: 'black',
    },
    certificateTitle: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 25,
        color: 'black',
        textDecoration: 'underline',
        textTransform: 'uppercase',
    },
    detailsContainer: {
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingHorizontal: 10,
    },
    detailLabel: {
        width: '30%',
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: 'black',
    },
    detailValue: {
        width: '70%',
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: 'black',
    },
    descriptionBox: {
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    descriptionLabel: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 5,
        color: 'black',
    },
    descriptionText: {
        fontSize: 9,
        fontFamily: 'Helvetica',
        lineHeight: 1.3,
        color: 'black',
        textAlign: 'justify',
    },
    exportLcSection: {
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    exportLcText: {
        fontSize: 9,
        fontFamily: 'Helvetica',
        lineHeight: 1.3,
        color: 'black',
        marginBottom: 3,
    },
    certificationSection: {
        marginTop: 25,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    certificationText: {
        fontSize: 10,
        fontFamily: 'Helvetica',
        lineHeight: 1.4,
        color: 'black',
        textAlign: 'justify',
        marginBottom: 8,
    },
    boldText: {
        fontFamily: 'Helvetica-Bold',
    },
    uppercase: {
        textTransform: 'uppercase',
    },
    footer: {
        marginTop: 30,
        textAlign: 'center',
    },
    thankingText: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: 'black',
        marginBottom: 5,
    },
    signatureArea: {
        marginTop: 40,
        paddingHorizontal: 10,
    },
    signatureLine: {
        borderTop: '1pt solid black',
        width: '60%',
        marginTop: 30,
        marginLeft: '20%',
    },
    signatureText: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginTop: 5,
        color: 'black',
    },
    watermark: {
        position: 'absolute',
        top: '45%',
        left: '30%',
        transform: 'translate(-50%, -50%) rotate(-30deg)',
        fontSize: 55,
        color: 'rgba(44, 62, 80, 0.08)',
        fontFamily: 'Helvetica-Bold',
        zIndex: 0,
        letterSpacing: 4,
        textTransform: 'uppercase',
    }
});

function InspectionCertificate({ currentData }) {
    function formatDate(dateString) {
        if (!dateString) return '23-08-2025';
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch {
            return '23-08-2025';
        }
    }

    const InspectionDocument = () => (
        <Document title="Inspection Certificate">
            <Page size="B4" style={styles.page}>
                {/* Border */}
                <View style={styles.border} />

                {/* Watermark */}
                <Text style={styles.watermark}>INSPECTION</Text>

                <View style={styles.container}>
                    {/* Header with Company Info */}
                    <View style={styles.header}>
                        <Text style={styles.companyName}>Simco Spinning and Textiles Limited</Text>
                        <Text style={styles.companyAddress}>
                            House: #2/B (2nd Floor), Road: 04, Block: B, Banani, Dhaka-1213, Bangladesh.
                        </Text>
                        <Text style={styles.companyAddress}>
                            T: +88 02 55033401, +88 02 55033402. E: info@simcobangladesh.com
                        </Text>
                    </View>

                    {/* Reference Number and Date */}
                    <View style={styles.refDateContainer}>
                        <Text style={styles.refNumber}>Ref: SSTL/YFSL/2025/0287</Text>
                        <Text style={styles.date}>Date: {formatDate(currentData?.date)}</Text>
                    </View>

                    {/* Certificate Title */}
                    <Text style={styles.certificateTitle}>INSPECTION CERTIFICATE</Text>

                    {/* LC Details */}
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>B. B. L/C No :</Text>
                            <Text style={styles.detailValue}>{currentData?.LcDetails.LcNo}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Dated :</Text>
                            <Text style={styles.detailValue}>{currentData?.LcDetails.LcDate}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Amendment No. :</Text>
                            <Text style={styles.lcDetails}>
                                {currentData?.LcDetails.AmendmentDetails
                                    ?.map(
                                        (amendment) =>
                                            ` ${amendment.AmendmentNo || "N/A"} `
                                    )
                                    .join(', ')}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Amendment Date. :</Text>
                            <Text style={styles.lcDetails}>
                                {currentData?.LcDetails.AmendmentDetails
                                    ?.map(
                                        (amendment) =>
                                            `${amendment.AmendmentDate || "N/A"} `
                                    )
                                    .join(', ')}
                            </Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>L/C Value :</Text>
                            <Text style={styles.detailValue}>{currentData?.LcDetails.LcValue}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Invoice Value :</Text>
                            <Text style={styles.detailValue}>US$ 3,438.00</Text>
                        </View>
                    </View>

                    {/* Description of Goods */}
                    <View style={styles.descriptionBox}>
                        <Text style={styles.descriptionLabel}>Description of Goods :</Text>
                        <Text style={styles.descriptionText}>
                            Twisted Yarn CYCLO Recycle Cotton Blended Yarn 30/2 50%
                            Cyclo Recycled Cotton 50% Recycled Polyester OE Light Grey
                            C48, Twisted Yarn CYCLO Recycle Cotton Blended Yarn 30/2
                            50% Cyclo Recycled Cotton 50% Recycled Polyester OE Tan C35
                        </Text>
                    </View>

                    {/* Quantity */}
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Quantity :</Text>
                        <Text style={styles.detailValue}>1,910.00 Weightlb.</Text>
                    </View>

                    {/* Export LC Section */}
                    <View style={styles.exportLcSection}>
                        <Text style={styles.exportLcText}>
                            <Text style={styles.boldText}>Export LC / Contract No.</Text> : YFL00098 DATED.05-05-2025, GARMENTS QUANTITY : 99,450 PCS
                        </Text>
                        <Text style={styles.exportLcText}>
                            (+/- 5 PCT.) MENS CARDIGAN AND KNITTED PONCHO
                        </Text>
                    </View>

                    {/* Certification Statement */}
                    <View style={styles.certificationSection}>
                        <Text style={styles.certificationText}>
                            We are certifying that the Unit Price, Quantity, Quality of the above goods supplied to{' '}
                            <Text style={styles.boldText}>YOUR FASHOIN SWEATER LTD</Text>, . Factory :{' '}
                            <Text style={styles.boldText}>PLOT NO. 126, 1230, 1276 GILARCHALA, MASTERBARI, SRIPUR, GAZIPUR-1740, BANGLADESH</Text>.{' '}
                            IRC NUMBER : <Text style={styles.boldText}>260326120171820</Text>, BIN NO.{' '}
                            <Text style={styles.boldText}>000270725-0103</Text>, are as per Letter of Credit.
                        </Text>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.thankingText}>Thanking You.</Text>
                    </View>

                    {/* Signature Area */}
                    <View style={styles.signatureArea}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureText}>Authorized Signature</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );

    return (
        <PDFViewer style={{ height: '100vh', width: '100%' }}>
            <InspectionDocument />
        </PDFViewer>
    );
}

InspectionCertificate.propTypes = {
    currentData: PropTypes.object,
};

// Font registrations
Font.register({ family: 'Helvetica', src: '/fonts/Helvetica.ttf' });
Font.register({ family: 'Helvetica-Bold', src: '/fonts/Helvetica-Bold.ttf' });
Font.register({ family: 'Helvetica-Oblique', src: '/fonts/Helvetica-Oblique.ttf' });

export default InspectionCertificate;