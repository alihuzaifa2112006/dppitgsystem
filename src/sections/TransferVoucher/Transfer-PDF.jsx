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
import { fDate } from 'src/utils/format-time'; // Assuming these functions are available
import { fNumber } from 'src/utils/format-number'; // Assuming this function is available

// --- 1. FONT REGISTRATION (Kept as is) ---
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

// --- 2. STYLES (Kept as is) ---
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
    fontSize: 18,
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
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Roboto-Bold',
    marginVertical: 8,
    paddingBottom: 3,
    borderBottom: 1,
    borderColor: '#000000',
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
  voucherInfo: {
    flex: 1,
    textAlign: 'left',
  },
  dateInfo: {
    flex: 1,
    textAlign: 'right',
  },
  voucherBox: {
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
    minHeight: 120,
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
});

// --- 3. FIX: Header Component moved outside to prevent unstable-nested-components error ---
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


// --- 4. MAIN COMPONENT (With updated data access) ---
const TransferVoucherPDFOrg = ({ currentData }) => {
  // FIX: Safely access Data property, or use currentData directly.
  const Data = currentData?.Data || currentData;
  console.log("current data ", currentData)

  const { Details = [] } = Data || {};

  // console.log('Rendering Transfer Voucher PDF with Data:', Data); // Cleaned up for production

  const totalQuantity = Details.reduce((sum, item) => sum + (item.VoucherQty || 0), 0);
  const uom = Details.length > 0 ? Details[0].UOMName : '';

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document title={`TRANSFER VOUCHER - ${Data?.TransferNo || 'N/A'}`}>
        <Page size={[865, 1000]} style={styles.page}>

          <Header />

          <View style={styles.topRow}>

            <View style={styles.centerTitle}>
              <Text style={{ ...styles.title, fontFamily: 'Roboto-Bold' }}>
                Item Transfer Voucher Report
              </Text>
            </View>
          </View>

          {/* Information Boxes */}
          <View style={styles.infoContainer}>
            {/* Voucher Information Box */}
            <View style={styles.infoSection}>
              <View style={styles.infoContent}>
                <View style={styles.infoHeader}>
                  <Text style={styles.infoHeaderText}>Voucher Information</Text>
                </View>
                {[
                  ['Transfer No', Data?.TransferNo],
                  ['Transfer Date', Data?.TransferDate ? fDate(Data.TransferDate) : 'N/A'],
                  ['To Department', Data?.ToDeptName],

                ].map(([label, value], idx) => (
                  <View key={idx} style={styles.infoRowInner}>
                    <Text style={styles.infoLabelInner}>{label}:</Text>
                    <Text style={styles.infoValueInner}>{value || 'N/A'}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Additional Information Box */}
            <View style={styles.infoSection}>
              <View style={styles.infoContent}>
                <View style={styles.infoHeader}>
                  <Text style={styles.infoHeaderText}>Additional Information</Text>
                </View>
                {[
                  ['Section', Data?.SectionName || 'N/A'],
                  // ['Unit Of Measurement', uom],
                  ['To Location', Data?.ToLocationName],
                  // ['Total Items', Details.length],
                ].map(([label, value], idx) => (
                  <View key={idx} style={styles.infoRowInner}>
                    <Text style={styles.infoLabelInner}>{label}:</Text>
                    <Text style={styles.infoValueInner}>{value !== undefined ? value : 'N/A'}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Item Details Table */}
          <Text style={styles.sectionTitle}>Transfer Details</Text>
          <View style={{ border: 1, borderColor: '#000', marginTop: 10 }} wrap>
            {/* Table Header */}
            <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
              {[
                'Line No',
                'Item Code',
                'Item Description',
                'Quantity',
                'UOM',
                'Created By'
              ].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    width: ['10%', '15%', '40%', '15%', '10%', '20%'][i],
                    padding: 4,
                    fontFamily: 'Roboto-Bold',
                    fontSize: 8,
                    borderRight: i < 5 ? 1 : 0,
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
                    fontSize: 8,
                    borderRight: 1,
                    borderColor: '#000',
                    textAlign: 'center',
                  }}
                >
                  {idx + 1}
                </Text>
                <Text
                  style={{
                    width: '15%',
                    padding: 4,
                    fontSize: 8,
                    borderRight: 1,
                    borderColor: '#000',
                  }}
                >
                  {item.ItemCode || '-'}
                </Text>
                <Text
                  style={{
                    width: '40%',
                    padding: 4,
                    fontSize: 8,
                    borderRight: 1,
                    borderColor: '#000',
                  }}
                >
                  {item.ItemDescription || '-'}
                </Text>
                <Text
                  style={{
                    width: '15%',
                    padding: 4,
                    fontSize: 8,
                    borderRight: 1,
                    borderColor: '#000',
                    textAlign: 'right',
                  }}
                >
                  {fNumber(item.VoucherQty) || 0}
                </Text>
                <Text
                  style={{
                    width: '10%',
                    padding: 4,
                    fontSize: 8,
                    borderRight: 1,
                    borderColor: '#000',
                    textAlign: 'center',
                  }}
                >
                  {item.UOMName || '-'}
                </Text>
                <Text
                  style={{
                    width: '20%',
                    padding: 4,
                    fontSize: 8
                  }}
                >
                  {item.DetailCreatedByName || '-'}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals Box */}
          <View style={styles.totalBox}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}
            >
              <Text style={styles.totalText}>Total Quantity:</Text>
              <Text style={{ ...styles.totalText, textAlign: 'right' }}>
                {fNumber(totalQuantity) || 0} {uom}
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}
            >
              <Text style={styles.totalText}>Total Items:</Text>
              <Text style={{ ...styles.totalText, textAlign: 'right' }}>
                {Details.length}
              </Text>
            </View>
          </View>

          {/* Approval Signatures Placeholder */}
          {/* <View style={styles.approvalContainer}>
                        <View style={styles.approvalRow}>
                            <View style={styles.approvalColumn}>
                            
                                <Text style={styles.underline} /> 
                                <Text style={styles.approvalTitle}>Prepared By</Text>
                            </View>
                            <View style={styles.approvalColumn}>
                            
                                <Text style={styles.underline} />
                                <Text style={styles.approvalTitle}>Checked By</Text>
                            </View>
                            <View style={styles.approvalColumn}>
                              
                                <Text style={styles.underline} /> 
                                <Text style={styles.approvalTitle}>Approved By</Text>
                            </View>
                        </View>
                    </View> */}

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

// --- 5. PROP TYPES FIX ---
// The structure of the main object fields
const MasterDataShape = PropTypes.shape({
  TransferID: PropTypes.number,
  TransferNo: PropTypes.string,
  TransferDate: PropTypes.string,
  ToDeptID: PropTypes.number,
  ToDeptName: PropTypes.string,
  ToSecID: PropTypes.number,
  SectionName: PropTypes.string,
  ToLocationID: PropTypes.number,
  ToLocationName: PropTypes.string,
  TransferModeID: PropTypes.number,
  CreatedBy: PropTypes.number,
  CreatedByName: PropTypes.string,
  Details: PropTypes.arrayOf(
    PropTypes.shape({
      TransferID: PropTypes.number,
      PDODTLID: PropTypes.number,
      VID: PropTypes.number,
      VODtlID: PropTypes.number,
      VoucherQty: PropTypes.number,
      ItemCode: PropTypes.string,
      ItemDescription: PropTypes.string,
      CreatedBy: PropTypes.number,
      UOMID: PropTypes.number,
      UOMName: PropTypes.string,
      DetailCreatedByName: PropTypes.string,
    })
  ),
});

// FIX: Allow currentData to be either the MasterDataShape OR an object that contains it under the 'Data' key.
TransferVoucherPDFOrg.propTypes = {
  currentData: PropTypes.oneOfType([
    MasterDataShape.isRequired,
    PropTypes.shape({
      status: PropTypes.string,
      Data: MasterDataShape.isRequired, // This satisfies the 'currentData.Data' validation
    }),
  ]).isRequired,
};

export default TransferVoucherPDFOrg;