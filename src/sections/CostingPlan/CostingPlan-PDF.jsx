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

const ItemVoucherPDFOrg = ({ currentData }) => {
  const { Data } = currentData;
  const { Details = [] } = Data || {};

  console.log('Rendering Item Voucher PDF with Data:', currentData);

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

  const totalQuantity = Details.reduce((sum, item) => sum + (item.Quantity || 0), 0);
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
      <Document title={`ITEM VOUCHER - ${Data?.VoucherNo || 'N/A'}`}>
        <Page size={[865, 1000]} style={styles.page}>
          <Header />

          <View style={styles.topRow}>
            <View style={styles.voucherInfo}>
              <View style={styles.voucherBox}>
                <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 12, textAlign: 'center' }}>
                  Voucher No: {Data?.VoucherNo || 'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.centerTitle}>
              <View style={styles.titleBox}>
                <Text style={{ ...styles.title, fontFamily: 'Roboto-Bold' }}>
                  Item Voucher Report
                </Text>
              </View>
            </View>
            <View style={styles.dateInfo}>
              <View style={styles.voucherBox}>
                <Text style={{ fontSize: 12, textAlign: 'center', fontFamily: 'Roboto-Bold' }}>
                  Voucher Date: {fDate(Data?.VoucherDate)}
                </Text>
              </View>
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
                  ['Department', Data?.DepartmentName],
                  ['Section', Data?.SectionName],
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
                  ['Shift', Data?.ShiftName],
                  // ['Created Date', fDateTime(Data?.CreatedDate)],
                  ['Unit Of Measurement', uom],
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
          <Text style={styles.sectionTitle}>Item Details</Text>
          <View style={{ border: 1, borderColor: '#000', marginTop: 10 }} wrap>
            {/* Table Header */}
            <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
              {[
                'Line No',
                'Item Code',
                'Item Description',
                'Class',
                'Category',
                'Sub Category',
                'Quantity',
                'UOM',
                'Remarks',
              ].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    width: ['8%', '12%', '25%', '10%', '12%', '12%', '10%', '8%', '13%'][i],
                    padding: 4,
                    fontFamily: 'Roboto-Bold',
                    fontSize: 8,
                    borderRight: 1,
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
                    width: '8%',
                    padding: 4,
                    fontSize: 8,
                    borderRight: 1,
                    borderColor: '#000',
                    textAlign: 'center',
                  }}
                >
                  {item.Line_No || '-'}
                </Text>
                <Text
                  style={{
                    width: '12%',
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
                    width: '25%',
                    padding: 4,
                    fontSize: 8,
                    borderRight: 1,
                    borderColor: '#000',
                  }}
                >
                  {item.SpecificationName || '-'}
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
                  {item.ClassName || '-'}
                </Text>
                <Text
                  style={{
                    width: '12%',
                    padding: 4,
                    fontSize: 8,
                    borderRight: 1,
                    borderColor: '#000',
                    textAlign: 'center',
                  }}
                >
                  {item.CategoryName || '-'}
                </Text>
                <Text
                  style={{
                    width: '12%',
                    padding: 4,
                    fontSize: 8,
                    borderRight: 1,
                    borderColor: '#000',
                    textAlign: 'center',
                  }}
                >
                  {item.SubCategoryName || '-'}
                </Text>
                <Text
                  style={{
                    width: '10%',
                    padding: 4,
                    fontSize: 8,
                    borderRight: 1,
                    borderColor: '#000',
                    textAlign: 'right',
                  }}
                >
                  {fNumber(item.Quantity) || 0}
                </Text>
                <Text
                  style={{
                    width: '8%',
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
                    width: '13%',
                    padding: 4,
                    fontSize: 8,
                  }}
                >
                  {item.Remarks || '-'}
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
          </View>

          {/* Approval Signatures */}
          {/* <View style={styles.approvalContainer}>
            <View style={styles.approvalRow}>
            
              <View style={styles.approvalColumn}>
                <View style={styles.approvalBox}>
                  <Text style={styles.approvalName}>Prepared By</Text>
                  <View style={styles.underline} />
                  <Text style={styles.approvalTitle}>Signature</Text>
                </View>
              </View>

             
              <View style={styles.approvalColumn}>
                <View style={styles.approvalBox}>
                  <Text style={styles.approvalName}>Checked By</Text>
                  <View style={styles.underline} />
                  <Text style={styles.approvalTitle}>Signature</Text>
                </View>
              </View>

              
              <View style={styles.approvalColumn}>
                <View style={styles.approvalBox}>
                  <Text style={styles.approvalName}>Approved By</Text>
                  <View style={styles.underline} />
                  <Text style={styles.approvalTitle}>Signature</Text>
                </View>
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

ItemVoucherPDFOrg.propTypes = {
  currentData: PropTypes.shape({
    status: PropTypes.string,
    Data: PropTypes.shape({
      Voucher_ID: PropTypes.number,
      VoucherNo: PropTypes.string,
      VoucherDate: PropTypes.string,
      ShiftID: PropTypes.number,
      ShiftName: PropTypes.string,
      DepartmentID: PropTypes.number,
      DepartmentName: PropTypes.string,
      SectionID: PropTypes.number,
      SectionName: PropTypes.string,
      MachineID: PropTypes.number,
      CreatedBy: PropTypes.number,
      CreatedDate: PropTypes.string,
      UpdatedBy: PropTypes.number,
      UpdatedDate: PropTypes.string,
      IsActive: PropTypes.bool,
      Branch_ID: PropTypes.number,
      Org_ID: PropTypes.number,
      Details: PropTypes.arrayOf(
        PropTypes.shape({
          Detail_ID: PropTypes.number,
          InvTypeID: PropTypes.number,
          ClassName: PropTypes.string,
          CatID: PropTypes.number,
          CategoryName: PropTypes.string,
          WasteTypeID: PropTypes.number,
          SubCategoryName: PropTypes.string,
          ITEM_ID: PropTypes.number,
          ItemCode: PropTypes.string,
          SpecificationName: PropTypes.string,
          Line_No: PropTypes.number,
          Quantity: PropTypes.number,
          UOMID: PropTypes.number,
          UOMName: PropTypes.string,
          OperatorID: PropTypes.number,
          Remarks: PropTypes.string,
        })
      ),
    }),
  }).isRequired,
};

export default ItemVoucherPDFOrg;
