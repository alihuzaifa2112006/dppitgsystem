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
    backgroundColor: '#fefefe',
    position: 'relative',
  },
  border: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    border: '1.5pt solid black',
    borderRadius: 8,
    zIndex: 0,
  },
  decorativeBorder: {
    position: 'absolute',
    top: 25,
    left: 25,
    right: 25,
    bottom: 25,
    // border: '1pt solid #3949ab',
    borderRadius: 4,
    zIndex: 0,
  },
  container: {
    position: 'relative',
    zIndex: 1,
  },
  header: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottom: '1pt solid black',
    textAlign: 'center',
  },
  companyName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: 'black',
    // letterSpacing: 1,
  },
  companyAddress: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 3,
    lineHeight: 1.3,
    color: '#333',
  },
  certificateTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    color: 'black',
    textDecoration: 'underline',
    textDecorationColor: 'black',
    textDecorationThickness: 2,
    // letterSpacing: 2,
  },
  certificateNumber: {
    position: 'absolute',
    top: 30,
    right: 40,
    fontSize: 10,
    color: 'black',
    fontFamily: 'Helvetica-Oblique',
  },
  dateContainer: {
    textAlign: 'right',
    marginBottom: 15,
    paddingRight: 10,
  },
  dateLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: 'black',
  },
  dateValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginLeft: 10,
  },
  contentSection: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    border: '1pt solid #e0e0e0',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
    color: 'black',
    borderBottom: '1pt solid black',
    paddingBottom: 5,
  },
  lcDetails: {
    lineHeight: 1.2,
    marginBottom: 8,
  },
  productSection: {
    backgroundColor: '#fff',
    padding: 12,
    border: '1pt solid #e0e0e0',
    borderRadius: 4,
    marginTop: 5,
  },
  productTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    marginBottom: 8,
    color: 'black',
  },
  productDetails: {
    lineHeight: 1.2,
    marginBottom: 5,
    paddingLeft: 10,
  },
  recipientSection: {
    backgroundColor: '#fff',
    padding: 12,
    border: '1pt solid #e0e0e0',
    borderRadius: 4,
    marginTop: 10,
  },
  recipientTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    marginBottom: 8,
    color: 'black',
  },
  recipientDetails: {
    lineHeight: 1.2,
    marginBottom: 5,
    paddingLeft: 10,
  },
  boldText: {
    fontFamily: 'Helvetica-Bold',
    color: '#000',
  },
  underline: {
    textDecoration: 'underline',
  },
  certificationBox: {
    marginTop: 20,
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    border: '2pt solid black',
    borderRadius: 6,
    textAlign: 'center',
  },
  certificationText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: 'black',
    lineHeight: 1.8,
    letterSpacing: 0.5,
  },
  factorySection: {
    marginTop: 10,
    textAlign: 'center',
    paddingTop: 10,
    borderTop: '1pt solid black',
  },
  factoryAddress: {
    fontSize: 11,
    lineHeight: 1.4,
    color: '#333',
    marginBottom: 5,
  },
  website: {
    fontSize: 11,
    color: 'black',
    fontFamily: 'Helvetica-Bold',
    marginTop: 8,
  },
  stampArea: {
    position: 'absolute',
    bottom: 40,
    right: 50,
    width: 120,
    height: 80,
    border: '1pt dashed #666',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'Helvetica-Oblique',
    textAlign: 'center',
  },
  watermark: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 60,
    color: 'rgba(26, 35, 126, 0.1)',
    fontFamily: 'Helvetica-Bold',
    zIndex: 0,
    letterSpacing: 8,
  },
});

function CertificateOfOrigin({ currentData }) {
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
  const CertificateDocument = () => (
    <Document title="Certificate Of Origin" auth>
      <Page size="B4" style={styles.page}>
        {/* Decorative Borders */}
        <View style={styles.border} />
        <View style={styles.decorativeBorder} />

        {/* Watermark */}
        <Text style={styles.watermark}>CERTIFICATE</Text>

        <View style={styles.container}>
          {/* Certificate Number */}
          <Text style={styles.certificateNumber}>Ref: CO-0287</Text>

          {/* Header with Company Info */}
          <View style={styles.header}>
            <Text style={styles.companyName}>SIMCO SPINNING AND TEXTILES LIMITED</Text>
            <Text style={styles.companyAddress}>
              House: #2/B (2nd Floor), Road: 04, Block: B, Banani, Dhaka-1213, Bangladesh
            </Text>
            <Text style={styles.companyAddress}>
              Telephone: +88 02 55033401, +88 02 55033402 • Email: info@simcobangladesh.com
            </Text>
          </View>

          {/* Certificate Title */}
          <Text style={styles.certificateTitle}>CERTIFICATE OF ORIGIN</Text>

          {/* Date */}
          <View style={styles.dateContainer}>
            <Text>
              <Text style={styles.dateLabel}>Date:</Text>
              <Text style={styles.dateValue}> {formatDate(currentData?.date)}</Text>
            </Text>
          </View>

          {/* LC Details Section */}
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>EXPORT LETTER OF CREDIT DETAILS</Text>
            <Text style={styles.lcDetails}>
              EXPORT L/C NO: <Text style={styles.boldText}>{currentData?.LcDetails.LcNo}</Text>,
              DATED: <Text style={styles.boldText}>{currentData?.LcDetails.LcDate}</Text>
            </Text>
            <Text style={styles.lcDetails}>
              {currentData?.LcDetails.AmendmentDetails?.map(
                (amendment) =>
                  `AMENDMENT NO.: ${amendment.AmendmentNo || 'N/A'} , DATE: ${
                    amendment.AmendmentDate || 'N/A'
                  }`
              ).join(', ')}
            </Text>

            <Text style={styles.lcDetails}>
              OPENED AGAINST ULTIMATE EXPORT LC / CONTRACT NO.:{' '}
              <Text style={styles.boldText}>YFL00098</Text> DATED:{' '}
              <Text style={styles.boldText}>05-05-2025</Text>
            </Text>
            <Text style={styles.lcDetails}>
              GARMENTS QUANTITY: <Text style={styles.boldText}>99,450 PCS</Text> (+/- 5%) MENS
              CARDIGAN AND KNITTED PONCHO
            </Text>
          </View>

          {/* Product Details Section */}
          <View style={styles.productSection}>
            <Text style={styles.productTitle}>PRODUCT SUPPLIED</Text>
            <Text style={styles.productDetails}>
              UNDER THE ABOVE MENTIONED L/C WE HAVE SUPPLIED:
            </Text>
            <Text style={styles.productDetails}>
              QUANTITY: <Text style={styles.boldText}>1,910.00 LBS</Text>
            </Text>
            {currentData?.items?.map((item, index) => (
              <Text key={index} style={styles.productDetails}>
                •{' '}
                {item.Desc?.split(/\r?\n/).map((line, idx) => (
                  <Text key={idx}>{line.trim()}</Text>
                ))}
              </Text>
            ))}
          </View>

          {/* Recipient Section */}
          <View style={styles.recipientSection}>
            <Text style={styles.recipientTitle}>CONSIGNEE DETAILS</Text>
            <Text style={styles.recipientDetails}>
              TO: <Text style={styles.boldText}>{currentData.buyer}</Text>
            </Text>
            <Text style={styles.recipientDetails}>
              FACTORY: <Text style={styles.boldText}>{currentData.acccountrisk}</Text>
            </Text>
            <Text style={styles.recipientDetails}>
              IRC NUMBER: <Text style={styles.boldText}>{currentData?.IRCNumber || 'N/A'}</Text> •
              BIN NO: <Text style={styles.boldText}>{currentData?.BINNumber || 'N/A'}</Text>
            </Text>
            <Text style={styles.recipientDetails}>
              MANUFACTURED AT OUR MILLS:{' '}
              <Text style={styles.boldText}>
                DHAMSHUR, MOLLIKBARI, HAJIRBAZAR, BHALUKA, MYMENSINGH, BANGLADESH
              </Text>
            </Text>
          </View>

          {/* Certification Box */}
          <View style={styles.certificationBox}>
            <Text style={styles.certificationText}>WE HEREBY CERTIFY THAT THE MERCHANDISE</Text>
            <Text style={styles.certificationText}>IS OF BANGLADESH ORIGIN</Text>
          </View>

          {/* Factory Information */}
          <View style={styles.factorySection}>
            <Text style={styles.factoryAddress}>
              Factory: Mouza: Dhamshur, Union: Mollikbari, P.O: Hajir Bazar, P.S: Bhaluka, Dist.:
              Mymensingh, Bangladesh
            </Text>
            <Text style={styles.website}>www.cyclofibers.com</Text>
          </View>

          {/* Stamp Area
                    <View style={styles.stampArea}>
                        <Text style={styles.stampText}>Official Stamp & Signature</Text>
                    </View> */}
        </View>
      </Page>
    </Document>
  );

  return (
    <PDFViewer style={{ height: '100vh', width: '100%' }}>
      <CertificateDocument />
    </PDFViewer>
  );
}

CertificateOfOrigin.propTypes = {
  currentData: PropTypes.object,
};

// Font registrations
Font.register({ family: 'Helvetica', src: '/fonts/Helvetica.ttf' });
Font.register({ family: 'Helvetica-Bold', src: '/fonts/Helvetica-Bold.ttf' });
Font.register({ family: 'Helvetica-Oblique', src: '/fonts/Helvetica-Oblique.ttf' });

export default CertificateOfOrigin;
