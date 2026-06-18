// components/DepartmentalRequestPDF.js
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
  Link,
} from '@react-pdf/renderer';

import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  page: {
    paddingTop: 10,
    paddingBottom: 50,
    paddingHorizontal: 30,
    fontSize: 10,
    fontFamily: 'Century Gothic',
    color: '#000000',
  },
  header: {
    marginBottom: 15,
    borderBottom: 1,
    borderColor: '#000000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
    textTransform: 'uppercase',
    fontFamily: 'Roboto-Bold',
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    fontFamily: 'Roboto-Bold',
    borderTop: 1,
    borderLeft: 1,
    borderRight: 1,
    borderColor: '#000000',
  },
  cell: {
    padding: 5,
    fontSize: 9,
    borderBottom: 1,
    borderColor: '#000000',
  },
  headerCell: {
    padding: 5,
    fontSize: 9,
    textAlign: 'center',
    borderBottom: 1,
    borderRight: 1,
    borderColor: '#000000',
    fontFamily: 'Roboto-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 9,
    paddingTop: 10,
    borderTop: '1 solid #000000',
    marginHorizontal: 30,
  },
  totalBox: {
    border: 1,
    borderColor: '#000000',
    padding: 5,
    marginTop: 10,
    marginBottom: 15,
    width: '38%',
    alignSelf: 'flex-end',
  },
  totalText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottom: 1,
    borderColor: '#000000',
    paddingBottom: 10,
  },
  prInfo: {
    flex: 1,
    textAlign: 'left',
  },
  dateInfo: {
    flex: 1,
    textAlign: 'right',
  },
  dateBox: {
    padding: 5,
  },
  centerTitle: {
    flex: 2,
    textAlign: 'center',
  },
  infoContent: {
    border: 1,
    borderColor: '#000000',
    borderRadius: 3,
    padding: 0,
    marginBottom: 15,
  },
  infoHeader: {
    flexDirection: 'row',
    borderBottom: 1,
    borderColor: '#000000',
    padding: 5,
    backgroundColor: '#f0f0f0',
  },
  infoHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Roboto-Bold',
    fontSize: 11,
  },
  infoRowInner: {
    flexDirection: 'row',
    borderBottom: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  infoLabelInner: {
    flex: 1,
    fontFamily: 'Roboto-Medium',
  },
  infoValueInner: {
    flex: 1,
    textAlign: 'left',
  },
  approvalContainer: {
    marginTop: 40,
  },
  approvalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  approvalColumn: {
    width: '30%',
    textAlign: 'center',
  },
  approvalBox: {
    paddingTop: 10,
  },
  approvalTitle: {
    fontSize: 11,
    fontFamily: 'Roboto-Medium',
    marginTop: 5,
  },
  underline: {
    borderBottom: 1,
    borderColor: '#000000',
    marginTop: 5,
    width: '100%',
  },
  approvalName: {
    fontFamily: 'Roboto-Bold',
    fontSize: 12,
  },
});

const DepartmentalRequestPDF = ({ currentData, PRRequestID }) => {
  // Format the date from the API
  const formatDate = (dateString) => {
    if (!dateString || dateString === '0001-01-01T00:00:00') return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  console.log(currentData, "this is data current");

  // Header Component
  const Header = () => (
    <View style={styles.header} fixed>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
          marginTop: 10,
        }}
      >
        <View>
          <Image source="/logo/Simco(CMYK).png" style={{ height: 35, width: 130 }} />
        </View>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Roboto-Bold' }}>
            SIMCO SPINNING & TEXTILES LIMITED
          </Text>
          <Text style={{ fontFamily: 'Roboto-Regular', marginTop: 3 }}>
            Factory Address:{' '}
            <Text style={{ fontSize: 12 }}>
              Dhamshur, Mollikbari, Hajirbazar, Bhaluka Mymensingh, Bangladesh
            </Text>
          </Text>
          <Text style={{ fontFamily: 'Roboto-Regular', marginTop: 3 }}>
            Office Address:{' '}
            <Text style={{ fontSize: 12 }}>
              House#2B, Road#04, Block-B, Banani, Dhaka-1213, Bangladesh.
            </Text>
          </Text>
        </View>
        <View>
          <Image source="/logo/CYCLO(CMYK).png" style={{ height: 40, width: 100 }} />
        </View>
      </View>
    </View>
  );

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document
        title={`Goods Received Confirmation - ${currentData?.ReqCode}`}
        subject="Goods Received Confirmation Report"
        creator="CYCLO® Cloud"
        author="ITG"
      >
        <Page size="A3" style={styles.page}>
          {/* Header */}
          <Header />

          {/* Top Row with Title */}
          <View style={styles.topRow}>
            <View style={styles.centerTitle}>
              <View style={styles.dateBox}>
                <Text style={{ ...styles.title, fontFamily: 'Roboto-Bold' }}>
                  Goods Received Confirmation Report
                </Text>
              </View>
            </View>
          </View>

          {/* Requisition & Issue Information */}
          <View style={styles.infoContent}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoHeaderText}>Requisition & Issue Information</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: '50%' }}>
                {[
                  ['Requisition Code', currentData?.ReqCode || 'N/A'],
                  ['Requisition Date', formatDate(currentData?.ReqDate)],
                  ['Issue Code', currentData?.IssueCode || 'N/A'],
                  ['Issue Date', formatDate(currentData?.IssueDate)],
                ].map(([label, value], idx) => (
                  <View key={idx} style={styles.infoRowInner}>
                    <Text style={styles.infoLabelInner}>{label}:</Text>
                    <Text style={styles.infoValueInner}>{value || '-'}</Text>
                  </View>
                ))}
              </View>
              <View style={{ width: '50%' }}>
                {[
                  ['Receive Date', formatDate(currentData?.ReceiveDate)],
                  ['Status', currentData?.isClosed ? 'Closed' : 'Open'],
                  ['Created Date', formatDate(currentData?.CreatedDate)],
                ].map(([label, value], idx) => (
                  <View key={idx} style={styles.infoRowInner}>
                    <Text style={styles.infoLabelInner}>{label}:</Text>
                    <Text style={styles.infoValueInner}>{value || '-'}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Item Information */}
          <View style={[styles.infoContent, { marginTop: 10 }]}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoHeaderText}>Item Information</Text>
            </View>
            {[
              [
                ['Item Code', currentData?.ItemCode || 'N/A'],
                ['Unit of Measure', currentData?.UOMName || 'N/A'],
              ],
              [
                ['Item Description', currentData?.ItemDescription || 'N/A'],
                ['Source Type', currentData?.SourceType || 'N/A'],
              ],
              [
                ['Vendor Name', currentData?.VendorName || 'N/A'],
                ['Remarks', currentData?.Remarks || '-'],
              ],
            ].map((row, rowIdx) => (
              <View 
                key={rowIdx} 
                style={{ 
                  flexDirection: 'row', 
                  borderBottom: rowIdx === 2 ? 0 : 1, 
                  borderColor: '#000000' 
                }}
              >
                {row.map(([label, value], colIdx) => (
                  <View
                    key={colIdx}
                    style={{
                      width: '50%',
                      borderRight: colIdx === 0 ? 1 : 0,
                      borderColor: '#000000',
                      padding: 8,
                      minHeight: 30,
                      justifyContent: 'center',
                    }}
                  >
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={{ ...styles.infoLabelInner, width: '40%' }}>{label}:</Text>
                      <Text style={{ ...styles.infoValueInner, width: '60%' }}>{value || '-'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* Quantity Information Table */}
          <View style={{ border: 1, borderColor: '#000', marginTop: 10 }}>
            <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
              {['Description', 'Quantity', 'Unit'].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    width: i === 0 ? '50%' : '25%',
                    padding: 8,
                    fontFamily: 'Roboto-Bold',
                    fontSize: 10,
                    borderRight: i !== 2 ? 1 : 0,
                    borderColor: '#000',
                    textAlign: 'center',
                  }}
                >
                  {col}
                </Text>
              ))}
            </View>
            {[
              ['Total Requested Quantity', currentData?.TotalRequestedQty || 0, currentData?.UOMName || ''],
              ['Issued Quantity', currentData?.IssueQty || 0, currentData?.UOMName || ''],
              ['Accepted Quantity', currentData?.AcceptedQty || 0, currentData?.UOMName || ''],
              ['Returned Quantity', currentData?.ReturnQty || 0, currentData?.UOMName || ''],
            ].map(([desc, qty, uom], idx) => (
              <View key={idx} style={{ flexDirection: 'row', borderTop: 1, borderColor: '#000' }}>
                <Text
                  style={{
                    width: '50%',
                    fontSize: 9,
                    fontFamily: 'Roboto-Regular',
                    padding: 8,
                    borderRight: 1,
                    borderColor: '#000',
                    textAlign: 'left',
                  }}
                >
                  {desc}
                </Text>
                <Text
                  style={{
                    width: '25%',
                    fontSize: 9,
                    fontFamily: 'Roboto-Regular',
                    padding: 8,
                    borderRight: 1,
                    borderColor: '#000',
                    textAlign: 'right',
                  }}
                >
                  {typeof qty === 'number' ? qty.toFixed(2) : qty}
                </Text>
                <Text
                  style={{
                    width: '25%',
                    fontSize: 9,
                    fontFamily: 'Roboto-Regular',
                    padding: 8,
                    textAlign: 'center',
                  }}
                >
                  {uom}
                </Text>
              </View>
            ))}
          </View>

          {/* Approval Signatures */}
          <View style={styles.approvalContainer}>
            <View style={[styles.approvalRow, { justifyContent: 'flex-end' }]}>
              {/* <View style={styles.approvalColumn}>
                <View style={styles.approvalBox}>
                  <Text style={styles.approvalName}>-</Text>
                  <View style={styles.underline} />
                  <Text style={styles.approvalTitle}>Received By</Text>
                </View>
              </View> */}

              {/* <View style={styles.approvalColumn}>
                <View style={styles.approvalBox}>
                  <Text style={styles.approvalName}>-</Text>
                  <View style={styles.underline} />
                  <Text style={styles.approvalTitle}>Checked By</Text>
                </View>
              </View> */}

              <View style={styles.approvalColumn}>
                <View style={styles.approvalBox}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Text style={styles.approvalName}>{currentData?.UserName || '-'}</Text>
                   
                  </View>
                  <View style={styles.underline} />
                  <Text style={styles.approvalTitle}>Prepared By</Text>
                </View>
              </View>
            </View>
          </View>


          <View style={styles.footer} fixed>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>Powered by : ITG Technology Company | </Text>
                <Link src="https://www.itgllc.ae/" style={{ textDecoration: 'none' }}>
                  <Text>Visit www.itgllc.ae</Text>
                </Link>
              </View>
              <Text
                render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
              />
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

// Font registrations
Font.register({ family: 'book-antiqua-bold', src: '/fonts/book-antiqua-bold.ttf' });
Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });
Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
Font.register({
  family: 'Roboto-Regular',
  src: '/fonts/Roboto-Regular.ttf',
});

export default DepartmentalRequestPDF;

DepartmentalRequestPDF.propTypes = {
  currentData: PropTypes.object,
  PRRequestID: PropTypes.any,
};