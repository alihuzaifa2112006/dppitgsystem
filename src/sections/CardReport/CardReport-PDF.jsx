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
const CardReportPDF = ({ currentData }) => {
  console.log(currentData)
  const Master = currentData;
  const Details = currentData?.Details || [];

  // ----------- Font Registration -----------
  Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });
  Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
  Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
  Font.register({ family: 'Roboto-Regular', src: '/fonts/Roboto-Regular.ttf' });

  // ----------- Calculate Totals -----------
  const totalBale = Master.Total_Bale;
  const totalWeight = Master.Total_Weight;
  const totalMCRunning = Master.Total_MC_Running || 0;
  const totalProductionHR = Master.Total_Production_HR || 0;

  // ----------- Calculate Totals from Details (Frontend Sum) -----------


  const uom = Details[0]?.UOMName || 'KG';

  // ----------- Organize Shift Efficiencies by Shift Name -----------
  const shiftEfficiencyMap = {};
  Master.ShiftEfficiencies?.forEach((shift) => {
    shiftEfficiencyMap[shift.ShiftName] = {
      TotalWeight: shift.TotalWeight,
      Efficiency: shift.Efficiency,
      UOMName: shift.UOMName,
    };
  });

  // ----------- Group Details by Line_No -----------
  const groupedByLine = Details.reduce((acc, detail) => {
    const lineNo = detail.Line_No || 'Unknown';
    if (!acc[lineNo]) {
      acc[lineNo] = [];
    }
    acc[lineNo].push(detail);
    return acc;
  }, {});

  // ----------- Calculate Line-wise Totals -----------
  const lineTotals = {};
  Object.keys(groupedByLine).forEach(lineNo => {
    const lineDetails = groupedByLine[lineNo];
    lineTotals[lineNo] = {
      TotalBale: lineDetails.reduce((sum, d) => sum + (Number(d.TotalBale) || 0), 0),
      TotalWeight: lineDetails.reduce((sum, d) => sum + (Number(d.TotalWeight) || 0), 0),
      DustWeight: lineDetails.reduce((sum, d) => sum + (Number(d.DustWeight) || 0), 0),
      Total_MC_Running: lineDetails.reduce((sum, d) => sum + (Number(d.Total_MC_Running) || 0), 0),
      Total_Production_HR: lineDetails.reduce((sum, d) => sum + (Number(d.Total_Production_HR) || 0), 0),
    };
  });

  // ----------- Styles -----------
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
      border: 1,
      borderColor: '#000000',
      paddingBottom: 10,
      paddingHorizontal: 10,
      paddingTop: 10,
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
    lineBoxContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    lineBox: {
      width: '48%',
      border: 1,
      borderColor: '#000000',
      borderRadius: 3,
      marginBottom: 10,
      padding: 8,
    },
    lineBoxHeader: {
      borderBottom: 1,
      borderColor: '#000000',
      paddingBottom: 5,
      marginBottom: 8,
    },
    lineBoxTitle: {
      fontFamily: 'Roboto-Bold',
      fontSize: 11,
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    lineTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 2,
      borderBottom: 1,
      borderColor: '#f0f0f0',
    },
    lineTotalLabel: {
      fontFamily: 'Roboto-Medium',
      fontSize: 9,
    },
    lineTotalValue: {
      fontFamily: 'Roboto-Bold',
      fontSize: 9,
      textAlign: 'right',
    },
    infoContent: {
      border: 1,
      borderColor: '#000000',
      borderRadius: 3,
      minHeight: 140,
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
  });


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


  const LineBox = ({ lineNo, totals }) => (
    <View style={styles.lineBox}>
      <View style={styles.lineBoxHeader}>
        <Text style={styles.lineBoxTitle}>Line {lineNo}</Text>
      </View>

      {[
        ['Total Bale', totals.TotalBale, ''],
        ['Total Weight', totals.TotalWeight, uom],
        ['Dust Weight', totals.DustWeight, uom],
        ['MC Running', totals.Total_MC_Running, ''],
        ['Production/HR', totals.Total_Production_HR, ''],
      ].map(([label, value, unit], i) => (
        <View key={i} style={styles.lineTotalRow}>
          <Text style={styles.lineTotalLabel}>{label}:</Text>
          <Text style={styles.lineTotalValue}>
            {fNumber(value || 0)} {unit}
          </Text>
        </View>
      ))}
    </View>
  );
  // ==================== ADDED LineBox PROPTYPES HERE (FIX for no-undef) ====================
  LineBox.propTypes = {
    lineNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    totals: PropTypes.shape({
      TotalBale: PropTypes.number,
      TotalWeight: PropTypes.number,
      DustWeight: PropTypes.number,
      Total_MC_Running: PropTypes.number,
      Total_Production_HR: PropTypes.number,
    }).isRequired,
  };


  // ==================== RETURN ====================
  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document title={`PRODUCTION REPORT - ${Master.Line_No}`}>
        <Page size='A3' style={styles.page}>

          <Header />


          <View style={styles.topRow}>
            {/* <View style={styles.grnInfo}>
              <Text
                style={{
                  fontFamily: 'Roboto-Bold',
                  fontSize: 10,
                  marginTop: 5,
                  textAlign: 'left',
                  textTransform: 'uppercase',
                }}
              >
                Department/Section: {Master.DepartmentName || 'CARDING'} {Master.SectionName || 'Production'}
              </Text>
            </View> */}
            <View style={styles.centerTitle}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: 'Roboto-Bold',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  // marginBottom: 5,
                }}
              >
                DAILY CARD PRODUCTION and EFFICIENCY % REPORT
              </Text>
              {/* <Text
                style={{
                  fontSize: 10,
                  fontFamily: 'Roboto-Regular',
                  textAlign: 'center',
                  marginTop: 5,
                }}
              >
             Date: {fDate(Master.CreatedOn)}
              </Text> */}
            </View>
            {/* <View style={styles.dateInfo}>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: 'Roboto-Bold',
                  marginTop: 3,
                  textAlign: 'right',
                }}
              >
                ISO/CARDING/01
              </Text>
            </View> */}
          </View>


          <View style={{ border: 1, borderColor: '#000', borderRadius: 3, width: '100%', marginBottom: 5 }}>
            {/* Single Row with all fields */}
            <View style={{ flexDirection: 'row' }}>
              {/* Department/Section */}
              <View style={{ width: '40%', borderRight: 1, borderColor: '#000', padding: 8 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Roboto-Bold', marginRight: 8 }}>
                    Department/Section:
                  </Text>
                  <Text style={{ fontSize: 11, fontFamily: 'Roboto-Regular' }}>
                    {Master.DepartmentName || '-'} / {Master.SectionName || '-'}
                  </Text>
                </View>
              </View>
              {/* Line No */}
              <View style={{ width: '20%', borderRight: 1, borderColor: '#000', padding: 8 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold', marginRight: 8 }}>
                    Line No:
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                    {Master.Line_No || '-'}
                  </Text>
                </View>
              </View>
              {/* Date */}
              <View style={{ width: '20%', borderRight: 1, borderColor: '#000', padding: 8 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold', marginRight: 8 }}>
                    Date:
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                    {fDate(Master.CreatedOn) || '-'}
                  </Text>
                </View>
              </View>
              {/* ISO/CARDING */}
              <View style={{ width: '20%', padding: 8 }}>
                <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Bold', marginRight: 8 }}>
                    Blw Rpt No.:
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                 {Master.PDONO || '-'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ border: 1, borderColor: '#000', marginTop: 2 }} wrap>
            {/* Header Row 1 */}
            <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0', borderBottom: 1, borderColor: '#000' }}>
              {/* Card Details Columns */}
              <Text style={{ width: '5%', padding: 6, fontFamily: 'Roboto-Bold', fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'center' }}>
                CARD NO
              </Text>
              <Text style={{ width: '12%', padding: 6, fontFamily: 'Roboto-Bold', fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'center' }}>
                CARD TYPE
              </Text>
              <Text style={{ width: '18%', padding: 6, fontFamily: 'Roboto-Bold', fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'center' }}>
                MATERIAL
              </Text>
              <Text style={{ width: '10%', padding: 6, fontFamily: 'Roboto-Bold', fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'center' }}>
                SPEED M/MIN
              </Text>
              <Text style={{ width: '10%', padding: 6, fontFamily: 'Roboto-Bold', fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'center' }}>
                GRAIN/YARD
              </Text>
              
              {/* Shift Columns A, B, C - First Row */}
              {['A', 'B', 'C'].map((shiftName) => (
                <Text key={shiftName} style={{ width: '11%', padding: 6, fontFamily: 'Roboto-Bold', fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'center' }}>
                  {shiftName}
                </Text>
              ))}
              
              {/* Remarks Column */}
              <Text style={{ width: '14%', padding: 6, fontFamily: 'Roboto-Bold', fontSize: 9, textAlign: 'center' }}>
                REMARKS
              </Text>
            </View>
            
            {/* Header Row 2 - Shift Sub-headers */}
            <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0', borderBottom: 1, borderColor: '#000' }}>
              {/* Empty spaces for Card Details Columns */}
              <Text style={{ width: '5%', padding: 6, borderRight: 1, borderColor: '#000' }} />
              <Text style={{ width: '12%', padding: 6, borderRight: 1, borderColor: '#000' }} />
              <Text style={{ width: '18%', padding: 6, borderRight: 1, borderColor: '#000' }} />
              <Text style={{ width: '10%', padding: 6, borderRight: 1, borderColor: '#000' }} />
              <Text style={{ width: '10%', padding: 6, borderRight: 1, borderColor: '#000' }} />
              
              {/* Shift Sub-headers for A, B, C */}
              {['A', 'B', 'C'].map((shiftName) => (
                <View key={shiftName} style={{ width: '11%', flexDirection: 'row', borderRight: 1, borderColor: '#000' }}>
                  <Text style={{ width: '50%', padding: 4, fontFamily: 'Roboto-Bold', fontSize: 8, borderRight: 1, borderColor: '#000', textAlign: 'center' }}>
                    TOTAL (KGS)
                  </Text>
                  <Text style={{ width: '50%', padding: 4, fontFamily: 'Roboto-Bold', fontSize: 8, textAlign: 'center' }}>
                    EFF %
                  </Text>
                </View>
              ))}
              
            
              <Text style={{ width: '14%', padding: 6 }} />
            </View>

            {/* Data Rows */}
            {Details.map((detail, idx) => {
              const shiftA = shiftEfficiencyMap.A || {};
              const shiftB = shiftEfficiencyMap.B || {};
              const shiftC = shiftEfficiencyMap.C || {};
              
              return (
                <View key={idx} style={{ flexDirection: 'row', borderTop: 1, borderColor: '#000' }}>
                  {/* Card Details */}
                  <Text style={{ width: '5%', padding: 6, fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'center' }}>
                    {idx + 1}
                  </Text>
                  <Text style={{ width: '12%', padding: 6, fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'center' }}>
                    {detail.CardTypeName || '-'}
                  </Text>
                  <Text style={{ width: '18%', padding: 6, fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'left' }}>
                    {detail.ItemDescription || '-'}
                  </Text>
                  <Text style={{ width: '10%', padding: 6, fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'right' }}>
                    {fNumber(detail.SpeedDateTime)}
                  </Text>
                  <Text style={{ width: '10%', padding: 6, fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'right' }}>
                    {fNumber(detail.GrandYard)}
                  </Text>
                  
                  {/* Shift A */}
                  <View style={{ width: '11%', borderRight: 1, borderColor: '#000', flexDirection: 'row' }}>
                    <Text style={{ width: '50%', padding: 6, fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'right' }}>
                      {fNumber(shiftA.TotalWeight || 0)}
                    </Text>
                    <Text style={{ width: '50%', padding: 6, fontSize: 9, textAlign: 'right' }}>
                      {fNumber(shiftA.Efficiency || 0)}%
                    </Text>
                  </View>
                  
                  {/* Shift B */}
                  <View style={{ width: '11%', borderRight: 1, borderColor: '#000', flexDirection: 'row' }}>
                    <Text style={{ width: '50%', padding: 6, fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'right' }}>
                      {fNumber(shiftB.TotalWeight || 0)}
                    </Text>
                    <Text style={{ width: '50%', padding: 6, fontSize: 9, textAlign: 'right' }}>
                      {fNumber(shiftB.Efficiency || 0)}%
                    </Text>
                  </View>
                  
                  {/* Shift C */}
                  <View style={{ width: '11%', borderRight: 1, borderColor: '#000', flexDirection: 'row' }}>
                    <Text style={{ width: '50%', padding: 6, fontSize: 9, borderRight: 1, borderColor: '#000', textAlign: 'right' }}>
                      {fNumber(shiftC.TotalWeight || 0)}
                    </Text>
                    <Text style={{ width: '50%', padding: 6, fontSize: 9, textAlign: 'right' }}>
                      {fNumber(shiftC.Efficiency || 0)}%
                    </Text>
                  </View>
                  
                  {/* Remarks */}
                  <Text style={{ width: '14%', padding: 6, fontSize: 9, textAlign: 'left' }}>
                    {detail.Remarks || '-'}
                  </Text>
                </View>
              );
            })}
          </View>


          {Master?.Remarks && (
            <View style={{ border: 1, borderColor: '#000', borderRadius: 3, width: '100%', marginTop: 10, marginBottom: 15 }}>
              <View style={{ flexDirection: 'row', padding: 8 }}>
                <Text style={{ fontSize: 11, fontFamily: 'Roboto-Bold', marginRight: 8 }}>
                  Remarks:
                </Text>
                <Text style={{ fontSize: 11, fontFamily: 'Roboto-Regular' }}>
                  {Details[0].Remarks}
                </Text>
              </View>
            </View>
          )}


          <View style={styles.footer} fixed>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>Powered by : ITG Technology Company | </Text>
                <Link src="https://www.itgllc.ae/" style={{ textDecoration: 'none' }}>
                  <Text>Visit www.itgllc.ae</Text>
                </Link>
              </View>
              <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

// ==================== PROPTYPES ====================
CardReportPDF.propTypes = {
  currentData: PropTypes.object.isRequired,
};

export default CardReportPDF;