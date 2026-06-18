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

// ==================== MAIN COMPONENT ====================
const MCheckListPDF = ({ currentData }) => {
  const Master = currentData;
  const PartsDetails = currentData?.PartsList || [];

  console.log(Master, 'Master Data');
  console.log(PartsDetails, 'Parts List');

  // ----------- Font Registration -----------
  Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });
  Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
  Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
  Font.register({ family: 'Roboto-Regular', src: '/fonts/Roboto-Regular.ttf' });

  // ----------- Styles -----------
  const styles = StyleSheet.create({
    fullWidthSimpleRemarkBox: {
      border: 1,
      borderColor: '#000000',
      borderRadius: 3,
      marginTop: 15,
      marginBottom: 10,
      width: '100%',
    },
    simpleRemarkRow: {
      flexDirection: 'row',
      paddingVertical: 5,
      paddingHorizontal: 10,
      minHeight: 25,
      alignItems: 'center',
    },
    simpleRemarkLabel: {
      width: '15%',
      fontFamily: 'Roboto-Bold',
      fontSize: 10,
      borderRight: 1,
      borderColor: '#000000',
      paddingRight: 10,
    },
    simpleRemarkValue: {
      width: '85%',
      paddingLeft: 10,
      fontSize: 10,
    },
    twoCellInfoBox: {
      border: 1,
      borderColor: '#000000',
      borderRadius: 3,
      marginBottom: 10,
      width: '100%',
      flexDirection: 'row',
    },
    infoCell: {
      width: '50%',
      paddingVertical: 5,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoCellLabel: {
      width: '30%',
      fontFamily: 'Roboto-Bold',
      fontSize: 10,
      paddingRight: 5,
    },
    infoCellValue: {
      width: '70%',
      fontSize: 10,
    },
    infoCellDivider: {
      borderRight: 1,
      borderColor: '#000000',
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
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      borderBottom: 1,
      borderColor: '#000000',
      paddingBottom: 10,
    },
    grnInfo: { flex: 1, textAlign: 'left' },
    centerTitle: { flex: 2, textAlign: 'center' },
    dateInfo: { flex: 1, textAlign: 'right' },
    infoContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    infoSection: { width: '49%', marginBottom: 15 },
    infoContent: {
      border: 1,
      borderColor: '#000000',
      borderRadius: 3,
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
    infoLabelInner: { flex: 1, fontFamily: 'Roboto-Medium' },
    infoValueInner: { flex: 1, textAlign: 'left' },
    totalBox: {
      border: 1,
      borderColor: '#000000',
      padding: 5,
      marginTop: 10,
      marginBottom: 15,
      width: '38%',
      alignSelf: 'flex-end',
    },
    totalText: { fontFamily: 'Roboto-Bold', fontSize: 10 },
    approvalContainer: { marginTop: 40 },
    approvalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    approvalColumn: { width: '30%', textAlign: 'center' },
    approvalBox: { paddingTop: 10 },
    approvalTitle: { fontSize: 11, fontFamily: 'Roboto-Medium', marginTop: 5 },
    underline: { borderBottom: 1, borderColor: '#000000', marginTop: 5, width: '100%' },
    approvalName: { fontFamily: 'Roboto-Bold', fontSize: 12 },
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
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f0f0f0',
      borderBottom: 1,
      borderColor: '#000',
    },
    tableCell: {
      padding: 4,
      fontSize: 9,
      borderRight: 1,
      borderColor: '#000',
      textAlign: 'center',
    },
    tableRow: {
      flexDirection: 'row',
      borderTop: 1,
      borderColor: '#000',
    },
  });

  // ----------- Header Component -----------
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
        <Image source="/logo/Simco(CMYK).png" style={{ height: 35, width: 130 }} />
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 18, fontFamily: 'Roboto-Bold' }}>
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
        <Image source="/logo/CYCLO(CMYK).png" style={{ height: 40, width: 100 }} />
      </View>
    </View>
  );

  // ==================== RETURN ====================
  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document title={`MACHINE CHECKLIST - ${Master.ChecklistID}`} >
        <Page size="A3" style={styles.page} >
          {/* Header */}
          <Header />

          {/* Top Row */}
          <View style={styles.topRow}>
            <View style={styles.grnInfo}>
              {/* Content removed to align with user's current topRow implementation */}
            </View>
            <View style={styles.centerTitle}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: 'Roboto-Bold',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  marginBottom: 5,
                }}
              >
                RAG RECYCLE MAINTENANCE CHECKLIST
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: 'Roboto-Bold',
                  textAlign: 'center',
                  marginTop: 6,
                }}
              >
                ISO/Rag Tearing_Maintenance/05
              </Text>
            </View>
            <View style={styles.dateInfo}>
              {/* Content removed to align with user's current topRow implementation */}
            </View>
          </View>

          {/* INFO BOXES SECTION */}
          <View style={styles.infoContainer}>
            <View style={styles.infoSection}>
              <View style={styles.infoContent}>
                <View style={styles.infoHeader}>
                  <Text style={styles.infoHeaderText}>Machine </Text>
                </View>
                {[
                  ['Date', fDate(Master.Checklist_Date || Master.Created_On)],
                  ['Machine Name', Master.MachineName],
                  ['Machine Code', Master.MachineCode],
                ].map(([label, value], i) => (
                  <View key={i} style={styles.infoRowInner}>
                    <Text style={styles.infoLabelInner}>{label}:</Text>
                    <Text style={styles.infoValueInner}>{value || '-'}</Text>
                  </View>
                ))}

                {/* Filler Row 1 */}
                <View
                  key="filler-loc-1"
                  style={{ ...styles.infoRowInner, borderBottom: 0 }}
                >
                  <Text style={styles.infoLabelInner}> </Text>
                  <Text style={styles.infoValueInner}> </Text>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoContent}>
                <View style={styles.infoHeader}>
                  <Text style={styles.infoHeaderText}>Location</Text>
                </View>
                {[
                  ['Department', Master.DeptName],
                  ['Section', Master.SectionName],
                  ['Line No', Master.LineName],
                ].map(([label, value], i) => (
                  <View key={i}
                    style={{
                      ...styles.infoRowInner,
                      borderBottom: i === 3 ? 0 : 1
                    }}
                  >
                    <Text style={styles.infoLabelInner}>{label}:</Text>
                    <Text style={styles.infoValueInner}>{value || '-'}</Text>
                  </View>
                ))}
                {/* Filler Row 2 */}
                <View
                  key="filler-loc-1"
                  style={{ ...styles.infoRowInner, borderBottom: 0 }}
                >
                  <Text style={styles.infoLabelInner}> </Text>
                  <Text style={styles.infoValueInner}> </Text>
                </View>
              </View>
            </View>
          </View>



          {/* ✅ FIXED: SINGLE PARTS CHECKLIST TABLE ✅ */}
          <Text style={styles.sectionTitle}>Parts Checklist</Text>
          <View style={{ border: 1, borderColor: '#000', marginTop: 10 }} wrap>
            <View style={styles.tableHeader}>
              {[
                'S.No',
                'Part Name',
                'Part No',
                '✓ G',
                '✓ B',
                '✓ C',
                '✓ N.A',
                'Work to be Carried Out',
              ].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    ...styles.tableCell,
                    width: ['5%', '30%', '15%', '5%', '5%', '5%', '5%', '30%'][i],
                    fontFamily: 'Roboto-Bold',
                    borderRight: i !== 7 ? 1 : 0,
                  }}
                >
                  {col}
                </Text>
              ))}
            </View>

            {PartsDetails.length > 0 ? (
              PartsDetails.map((part, idx) => {
                const status = (part.Status || '').toUpperCase();
                console.log(`Part ${idx + 1}:`, part.PartName, 'Status:', status); // Debug log

                return (
                  <View key={idx} style={styles.tableRow}>
                    {/* S.No */}
                    <Text style={{ ...styles.tableCell, width: '5%', borderRight: 1, textAlign: 'center' }}>
                      {idx + 1}
                    </Text>

                    {/* Part Name */}
                    <Text style={{ ...styles.tableCell, width: '30%', borderRight: 1, textAlign: 'left' }}>
                      {part.PartName || `Part ${idx + 1}`}
                    </Text>

                    {/* Part No */}
                    <Text style={{ ...styles.tableCell, width: '15%', borderRight: 1, textAlign: 'center' }}>
                      {part.PartNo || '-'}
                    </Text>
                    {/* "D:\12 Nov 2025\cyclo12-nov-25\public\assets\images\checkbox-checked.png" */}

                    {/* Good Checkmark */}
                    <View style={{
                      ...styles.tableCell,
                      width: '5%',
                      borderRight: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingVertical: 6
                    }}>
                      {status === 'G' ? (
                        <Image
                          source="/assets/images/checkbox-checked.png"
                          style={{ width: 12, height: 12, tintColor: '#388E3C' }}
                        />
                      ) : null}
                    </View>

                    {/* Bad Checkmark */}
                    <View style={{
                      ...styles.tableCell,
                      width: '5%',
                      borderRight: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingVertical: 6
                    }}>
                      {status === 'B' ? (
                        <Image
                          source="/assets/images/checkbox-checked.png"
                          style={{ width: 12, height: 12, tintColor: '#D32F2F' }}
                        />
                      ) : null}
                    </View>

                    {/* Changed Checkmark */}
                    <View style={{
                      ...styles.tableCell,
                      width: '5%',
                      borderRight: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingVertical: 6
                    }}>
                      {status === 'C' ? (
                        <Image
                          source="/assets/images/checkbox-checked.png"
                          style={{ width: 12, height: 12, tintColor: '#FBC02D' }}
                        />
                      ) : null}
                    </View>

                    {/* Not Applicable Checkmark */}
                    <View style={{
                      ...styles.tableCell,
                      width: '5%',
                      borderRight: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingVertical: 6
                    }}>
                      {(status === 'NA' || status === 'N.A') ? (
                        <Image
                          source="/assets/images/checkbox-checked.png"
                          style={{ width: 12, height: 12, tintColor: '#1976D2' }}
                        />
                      ) : null}
                    </View>

                    {/* Work to be Carried Out */}
                    <Text style={{
                      ...styles.tableCell,
                      width: '30%',
                      textAlign: 'left',
                      borderRight: 0,
                      paddingVertical: 8 // Added padding
                    }}>
                      {part.WorkToBeCarriedOut || '-'}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.tableRow}>
                <Text
                  style={{
                    ...styles.tableCell,
                    width: '100%',
                    borderRight: 0,
                    paddingVertical: 8,
                    textAlign: 'center',
                    fontFamily: 'Roboto-Medium',
                  }}
                >
                  No machine parts recorded in the checklist.
                </Text>
              </View>
            )}
          </View>

         <View
  
  style={{
    marginTop: 5,

  }}
>
 
  <View
    style={{
    
      marginTop: 5,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center', 
    }}
  >
    {/* G = Good */}
    <Text
      style={{
        fontSize: 10,
        fontFamily: 'Roboto-Regular',
        marginRight: 15, // Space between entries
      }}
    >
      • G = Good
    </Text>

    {/* B = Bad */}
    <Text
      style={{
        fontSize: 10,
        fontFamily: 'Roboto-Regular',
        marginRight: 15,
      }}
    >
      • B = Bad
    </Text>

    {/* C = Change */}
    <Text
      style={{
        fontSize: 10,
        fontFamily: 'Roboto-Regular',
        marginRight: 15,
      }}
    >
      • C = Change
    </Text>

    {/* N.A = Not Applicable */}
    <Text
      style={{
        fontSize: 10,
        fontFamily: 'Roboto-Regular',
        // No marginRight needed for the last item
      }}
    >
      • N.A = Not Applicable
    </Text>
  </View>
</View>
          {/* ✅ END FIXED PARTS CHECKLIST TABLE ✅ */}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch', marginTop: 15, marginBottom: 10 }}>
            {/* Remarks Box - Takes more space */}
            <View style={{
              border: 1,
              borderColor: '#000000',
              borderRadius: 3,
              width: '70%',
              flexDirection: 'row',
              paddingVertical: 5,
              paddingHorizontal: 10,
              minHeight: 25,
              alignItems: 'center',
            }}>
              <Text style={{ width: '20%', fontFamily: 'Roboto-Bold', fontSize: 10, borderRight: 1, borderColor: '#000000', paddingRight: 10 }}>Remarks:</Text>
              <Text style={{ width: '80%', paddingLeft: 10, fontSize: 10 }}>{Master.Remarks || '-'}</Text>
            </View>

            {/* Prepared By Box */}
            <View style={{
              border: 1,
              borderColor: '#000000',
              borderRadius: 3,
              width: '28%',
              flexDirection: 'row',
              paddingVertical: 5,
              paddingHorizontal: 10,
              minHeight: 25,
              alignItems: 'center',
            }}>
              <Text style={{ width: '40%', fontFamily: 'Roboto-Bold', fontSize: 10, paddingRight: 5 }}>Prepared By:</Text>
              <Text style={{ width: '60%', fontSize: 10 }}>{Master.Created_By_Name || '-'}</Text>
            </View>
          </View>

          {/* HOD/AG Box */}
          <View style={styles.twoCellInfoBox}>
            <View style={{ ...styles.infoCell, ...styles.infoCellDivider }}>
              <Text style={styles.infoCellLabel}>Head Of Department : </Text>
              <Text style={styles.infoCellValue}> </Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoCellLabel}>AGM/GM Operation: </Text>
              <Text style={styles.infoCellValue}> </Text>
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

// ==================== PROPTYPES ====================
MCheckListPDF.propTypes = {
  currentData: PropTypes.object.isRequired,
};

export default MCheckListPDF;