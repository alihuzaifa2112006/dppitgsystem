import {
  View,
  Text,
  Page,
  Font,
  Document,
  PDFViewer,
  StyleSheet,
  Image,
  Link,
} from '@react-pdf/renderer';
import React from 'react';
import PropTypes from 'prop-types';
import { fDate, fDateTime } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

const GRNPdf = ({ currentData }) => {
  const { Master, Details } = currentData;

  Font.register({
    family: 'Century Gothic',
    src: '/fonts/Century Gothic.ttf',
  });
  Font.register({
    family: 'Roboto-Bold',
    src: '/fonts/Roboto-Bold.ttf',
  });
  Font.register({
    family: 'Roboto-Medium',
    src: '/fonts/Roboto-Medium.ttf',
  });
  Font.register({
    family: 'Roboto-Regular',
    src: '/fonts/Roboto-Regular.ttf',
  });

  const styles = StyleSheet.create({
    grnBox: {
      // borderWidth: 1,
      // borderColor: '#000000',
      padding: 5,
    },
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
    subtitle: {
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 15,
      fontFamily: 'Roboto-Medium',
    },
    tableHeader: {
      flexDirection: 'row',
      fontFamily: 'Roboto-Bold',
      borderTop: 1,
      borderLeft: 1,
      borderRight: 1,
      borderColor: '#000000',
    },
    tableRow: {
      flexDirection: 'row',
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
    pageNumber: {
      position: 'absolute',
      fontSize: 9,
      bottom: 20,
      left: 0,
      right: 0,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 12,
      fontFamily: 'Roboto-Bold',
      marginVertical: 8,
      paddingBottom: 3,
      borderBottom: 1,
      borderColor: '#000000',
    },
    infoBox: {
      border: 1,
      borderColor: '#000000',
      borderRadius: 0,
      fontSize: 10,
      width: '100%',
      marginBottom: 15,
      overflow: 'hidden',
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
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
      alignItems: 'center',
      borderBottom: 1,
      borderColor: '#e0e0e0',
    },
    infoLabel: {
      flex: 1.5,
      padding: 3,
      paddingLeft: 10,
      fontFamily: 'Roboto-Medium',
    },
    infoValue: {
      flex: 1,
      padding: 3,
      textAlign: 'left',
      paddingRight: 10,
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
    statusBadge: {
      padding: 2,
      borderRadius: 3,
      fontSize: 8,
      textAlign: 'center',
      fontFamily: 'Roboto-Bold',
      width: 50,
    },
    closedStatus: {
      backgroundColor: '#cccccc',
    },
    openStatus: {
      backgroundColor: '#e0e0e0',
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
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    halfWidth: {
      width: '49%',
      minHeight: 140,
    },
    fullWidth: {
      width: '100%',
    },
    flexbox: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    column: {
      width: '49%',
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
    grnInfo: {
      flex: 1,
      textAlign: 'left',
    },
    dateInfo: {
      flex: 1,
      textAlign: 'right',
    },
    dateBox: {
      // borderWidth: 1,
      // borderColor: '#000000',
      padding: 5,
    },
    centerTitle: {
      flex: 2,
      textAlign: 'center',
    },
    infoContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    infoSection: {
      width: '49%',
      marginBottom: 15,
    },
    infoContent: {
      border: 1,
      borderColor: '#000000',
      borderRadius: 3,
      padding: 0,
      minHeight: 140,
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
      // marginBottom: 10,
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

  const totalPOQty = Details.reduce((sum, item) => sum + (item.POQty || 0), 0);
  const totalReceiveQty = Details.reduce((sum, item) => sum + (item.ReceiveQty || 0), 0);
  const totalBalancedQty = totalPOQty - totalReceiveQty;
  const uom = Details.length > 0 ? Details[0].UOMName : '';

  // Header Component
  const Header = () => (
    <View style={styles.header} fixed>
      {/* Logo Section */}
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
      <Document title={`GRN REPORT - ${Master.GRNNo}`}>
        {/* Single Page */}
        <Page size={[842]} style={styles.page}>
          {/* Header */}
          <Header />

          <View style={styles.topRow}>
            <View style={styles.grnInfo}>
              <View style={styles.grnBox}>
                <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 10, textAlign: 'center' }}>
                  GRN No: {Master.GRNNo}
                </Text>
              </View>
            </View>
            <View style={styles.centerTitle}>
              <View style={styles.titleBox}>
                <Text style={{ ...styles.title, fontFamily: 'Roboto-Bold' }}>
                  Goods Reciept Note (GRN)
                </Text>
              </View>
            </View>
            <View style={styles.dateInfo}>
              <View style={styles.dateBox}>
                <Text style={{ fontSize: 10, textAlign: 'center', fontFamily: 'Roboto-Bold' }}>
                  GRN Date: {fDate(Master.GRNDate)}
                </Text>
              </View>
            </View>
          </View>

          {/* Information Boxes */}
          <View style={styles.infoContainer}>
            {/* GRN Information Box */}
            <View style={styles.infoSection}>
              <View style={styles.infoContent}>
                <View style={styles.infoHeader}>
                  <Text style={styles.infoHeaderText}>GRN</Text>
                </View>
                {/* StoreName */}

                {[
                  ['Vendor', Master.VendorName],
                  ['Created By', Master.CreatedByName],
                  ['Created Date', fDateTime(Master.CreatedDate)],
                  // ['Warehouse For', Details[0]?.StoreName || '-'],
                ].map(([label, value], idx) => (
                  <View key={idx} style={styles.infoRowInner}>
                    <Text style={styles.infoLabelInner}>{label}:</Text>
                    <Text style={styles.infoValueInner}>{value || '-'}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Delivery Information Box */}
            <View style={styles.infoSection}>
              <View style={styles.infoContent}>
                <View style={styles.infoHeader}>
                  <Text style={styles.infoHeaderText}>Delivery</Text>
                </View>
                {[
                  ['Challan No', Master.ChallanNo],
                  ['Challan Date', fDate(Master.ChallanDate)],
                  ['Vehicle No', Master.VehicleNo],
                  ['Driver Name', Master.DriverName],
                ].map(([label, value], idx) => (
                  <View key={idx} style={styles.infoRowInner}>
                    <Text style={styles.infoLabelInner}>{label}:</Text>
                    <Text style={styles.infoValueInner}>{value || '-'}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Item Details Table */}
          <Text style={styles.sectionTitle}>Item Details</Text>
          {/* Item Details Table */}
          <View style={{ border: 1, borderColor: '#000', marginTop: 10 }} wrap>
            {/* Table Header */}
            <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
              {[
                'PO No',
                'Item',
                'Store',
                'PO Qty',
                'Prev RecQty',
                'Challan Qty',
                'Received Qty',
                'Status',
                'Remarks',
              ].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    width: ['10%', '30%', '12%', '10%', '10%', '10%', '12%', '8%', '18%'][i],
                    padding: 4,
                    fontFamily: 'Roboto-Bold',
                    fontSize: 9,
                    borderRight: i !== 8 ? 1 : 0,
                    borderColor: '#000',
                    textAlign: 'center',
                  }}
                >
                  {col}
                </Text>
              ))}
            </View>

            {/* Table Rows */}
            {Details.map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', borderTop: 1, borderColor: '#000' }}>
                <Text
                  style={{
                    width: '10%',
                    padding: 4,
                    fontSize: 9,
                    borderRight: 1,
                    borderColor: '#000',
                  }}
                >
                  {item.POCODE || '-'}
                </Text>
                <Text
                  style={{
                    width: '30%',
                    padding: 4,
                    fontSize: 9,
                    borderRight: 1,
                    borderColor: '#000',
                  }}
                >
                  {item.ItemName || '-'}
                </Text>
                <Text
                  style={{
                    width: '12%',
                    padding: 4,
                    fontSize: 9,
                    borderRight: 1,
                    borderColor: '#000',
                    textAlign: 'center',
                  }}
                >
                  {item.StoreName || '-'}
                </Text>
                <Text
                  style={{
                    width: '10%',
                    padding: 4,
                    fontSize: 9,
                    borderRight: 1,
                    borderColor: '#000',
                    textAlign: 'right',
                  }}
                >
                  {item.POQty != null
                    ? `${fNumber(item.POQty) || 0} ${item.UOMName}`
                    : `0 ${item.UOMName}`}
                </Text>
                <Text
                  style={{
                    width: '10%',
                    padding: 4,
                    fontSize: 9,
                    borderRight: 1,
                    borderColor: '#000',
                    textAlign: 'right',
                  }}
                >
                  {item.PrevRecQty != null
                    ? `${fNumber(item.PrevRecQty) || 0} ${item.UOMName}`
                    : `0 ${item.UOMName}`}
                </Text>
                <Text
                  style={{
                    width: '10%',
                    padding: 4,
                    fontSize: 9,
                    borderRight: 1,
                    borderColor: '#000',
                    textAlign: 'right',
                  }}
                >
                  {item.ChallanQty != null
                    ? `${fNumber(item.ChallanQty) || 0} ${item.UOMName}`
                    : `0 ${item.UOMName}`}
                </Text>
                <Text
                  style={{
                    width: '12%',
                    padding: 4,
                    fontSize: 9,
                    borderRight: 1,
                    borderColor: '#000',
                    textAlign: 'right',
                  }}
                >
                  {item.ReceiveQty != null
                    ? `${fNumber(item.ReceiveQty) || 0} ${item.UOMName}`
                    : `0 ${item.UOMName}`}
                </Text>
                <Text
                  style={{
                    width: '8%',
                    padding: 4,
                    fontSize: 9,
                    borderRight: 1,
                    borderColor: '#000',
                    textAlign: 'center',
                  }}
                >
                  {item.isClose ? 'Closed' : 'Open'}
                </Text>
                <Text style={{ width: '18%', padding: 4, fontSize: 9 }}>{item.Remarks || '-'}</Text>
              </View>
            ))}
          </View>
          {/* Totals Box */}
          <View style={styles.totalBox}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}
            >
              <Text style={styles.totalText}>Total PO Qty:</Text>
              <Text style={{ ...styles.totalText, textAlign: 'right' }}>
                {fNumber(totalPOQty) || 0} {uom}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}
            >
              <Text style={styles.totalText}>Total Received Qty:</Text>
              <Text style={{ ...styles.totalText, textAlign: 'right' }}>
                {fNumber(totalReceiveQty) || 0} {uom}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}
            >
              <Text style={styles.totalText}>Total Balance Qty:</Text>
              <Text
                style={{
                  ...styles.totalText,
                  textAlign: 'right',
                  color: '#555555', // light grayish black color
                }}
              >
                {fNumber(totalBalancedQty) || 0} {uom}
              </Text>
            </View>
          </View>

          {/* Approval Signatures */}
          <View style={styles.approvalContainer}>
            <View style={styles.approvalRow}>
              {/* Prepared By */}
              <View style={styles.approvalColumn}>
                <View style={styles.approvalBox}>
                  <Text style={styles.approvalName}>{Master.CreatedByName || '-'}</Text>
                  <View style={styles.underline} />
                  <Text style={styles.approvalTitle}>Prepared By</Text>
                </View>
              </View>

              {/* Checked By */}
              <View style={styles.approvalColumn}>
                <View style={styles.approvalBox}>
                  <Text style={styles.approvalName}>{Master.CheckedByName || '-'}</Text>
                  <View style={styles.underline} />
                  <Text style={styles.approvalTitle}>Checked By</Text>
                </View>
              </View>

              {/* Approved By */}
              <View style={styles.approvalColumn}>
                <View style={styles.approvalBox}>
                  <Text style={styles.approvalName}>{Master.ApprovedByName || '-'}</Text>
                  <View style={styles.underline} />
                  <Text style={styles.approvalTitle}>Approved By</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer */}
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

GRNPdf.propTypes = {
  currentData: PropTypes.shape({
    Master: PropTypes.object.isRequired,
    Details: PropTypes.array.isRequired,
  }).isRequired,
};

export default GRNPdf;
