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
const DrawReportPDF = ({ currentData }) => {
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


  const uom = Details[0]?.UOMName || 'KG';

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


  // const LineBox = ({ lineNo, totals }) => (
  //   <View style={styles.lineBox}>
  //     <View style={styles.lineBoxHeader}>
  //       <Text style={styles.lineBoxTitle}>Line {lineNo}</Text>
  //     </View>

  //     {[
  //       ['Total Bale', totals.TotalBale, ''],
  //       ['Total Weight', totals.TotalWeight, uom],
  //       ['Dust Weight', totals.DustWeight, uom],
  //       ['MC Running', totals.Total_MC_Running, ''],
  //       ['Production/HR', totals.Total_Production_HR, ''],
  //     ].map(([label, value, unit], i) => (
  //       <View key={i} style={styles.lineTotalRow}>
  //         <Text style={styles.lineTotalLabel}>{label}:</Text>
  //         <Text style={styles.lineTotalValue}>
  //           {fNumber(value || 0)} {unit}
  //         </Text>
  //       </View>
  //     ))}
  //   </View>
  // );
  
  // LineBox.propTypes = {
  //   lineNo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  //   totals: PropTypes.shape({
  //     TotalBale: PropTypes.number,
  //     TotalWeight: PropTypes.number,
  //     DustWeight: PropTypes.number,
  //     Total_MC_Running: PropTypes.number,
  //     Total_Production_HR: PropTypes.number,
  //   }).isRequired,
  // };


  // ==================== RETURN ====================
  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document title={`PRODUCTION REPORT - ${Master.Line_No}`}>
        <Page size={[842]} style={styles.page}>

          <Header />


          <View style={styles.topRow}>
            <View style={styles.grnInfo}>
              <Text
                style={{
                  fontFamily: 'Roboto-Bold',
                  fontSize: 10,
                  marginTop: 5,
                  textAlign: 'left',
                  textTransform: 'uppercase',
                }}
              >
                Department Name: {Master.DepartmentName || '-'}
              </Text>
            </View>
            <View style={styles.centerTitle}>
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: 'Roboto-Bold',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  marginBottom: 5,
                }}
              >
               Production Report (Blow Room)
              </Text>
            </View>
            <View style={styles.dateInfo}>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: 'Roboto-Bold',
                  marginTop: 3,
                }}
              >
                Report Date: {fDate(Master.RptDate)}
              </Text>
            </View>
          </View>


          <View style={[styles.infoContainer, { width: '100%' }]}>
            <View style={[styles.infoSection, { width: '100%' }]}>
              <View style={[styles.infoContent, { width: '100%' }]}>
                <View style={styles.infoHeader}>
                  <Text style={styles.infoHeaderText}>All Total ({uom})</Text>
                </View>

                {[
                  ['Total Bale', fNumber(totalBale), true],
                  ['Total Weight', fNumber(totalWeight), true],
                  ['Requested code', Master.ReqCode || Details[0]?.ReqCode || '-', false],
                  ['Total Time', Master.Total_Time, false],
                  ['Remarks', Master.Remarks, false],
                ].map(([label, value, showUom], i) => (
                  <View key={i} style={[styles.infoRowInner, { width: '100%' }]}>
                    <Text style={styles.infoLabelInner}>{label}:</Text>
                    <Text style={styles.infoValueInner}>
                      {value ? `${value}${showUom && uom ? ` ${uom}` : ''}` : '-'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>


          <Text style={styles.sectionTitle}>Line-wise Production Summary</Text>

          

          <Text style={styles.sectionTitle}>Production Details</Text>

          <View style={{ border: 1, borderColor: '#000', marginTop: 10 }} wrap>


            <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
              {[
                'Line No',
                'Shift Name',
                'Item Type',
                'Category',
                'Sub Cat',
                'Spare Name',
                'Color Name',
                'Item Description',
                `Total Bale`,
                `Total MC Running`,
                `Total Production (HR)`,
                `Total Weight`,
                `Dust Weight`,
              ].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    width: ['4%', '6%', '7%', '7%', '7%', '7%', '7%', '20%', '7%', '7%', '7%', '7%', '4%'][i],
                    padding: 4,
                    fontFamily: 'Roboto-Bold',
                    fontSize: 8,
                    borderRight: i !== 12 ? 1 : 0,
                    borderColor: '#000',
                    textAlign: 'center',
                  }}
                >
                  {col}
                </Text>
              ))}
            </View>

            {Details.map((detail, idx) => (
              <View key={idx} style={{ flexDirection: 'row', borderTop: 1, borderColor: '#000' }}>
                <Text style={{ width: '4%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'center' }}>
                  {detail.Line_No || '-'}
                </Text>
                <Text style={{ width: '6%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'center' }}>
                  {detail.ShiftName || '-'}
                </Text>
                <Text style={{ width: '7%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'center' }}>
                  {detail.InvTypeName || '-'}
                </Text>
                <Text style={{ width: '7%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'center' }}>
                  {detail.CategoryName || '-'}
                </Text>
                <Text style={{ width: '7%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'center' }}>
                  {detail.SubCategoryName || '-'}
                </Text>
                <Text style={{ width: '7%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'center' }}>
                  {detail.SpAreaName || '-'}
                </Text>
                <Text style={{ width: '7%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'center' }}>
                  {detail.ColorName || '-'}
                </Text>
                <Text style={{ width: '20%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'center' }}>
                  {detail.SFGItemDescription || '-'}
                </Text>
                <Text style={{ width: '7%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'right' }}>
                  {fNumber(detail.TotalBale)}
                </Text>
                <Text style={{ width: '7%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'right' }}>
                  {fNumber(detail.Total_MC_Running)}
                </Text>
                <Text style={{ width: '7%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'right' }}>
                  {fNumber(detail.Total_Production_HR)}
                </Text>
                <Text style={{ width: '7%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'right' }}>
                  {fNumber(detail.TotalWeight)}
                </Text>
                <Text style={{ width: '4%', padding: 4, fontSize: 8, textAlign: 'right' }}>
                  {fNumber(detail.DustWeight)}
                </Text>
              </View>
            ))}
          </View>



          {Master.Remarks && (
            <View style={{ marginTop: 10, marginBottom: 15 }}>
              <Text style={styles.sectionTitle}>Remarks</Text>
              <View style={{ border: 1, borderColor: '#000', padding: 10, minHeight: 40 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                  {Master.Remarks}
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
DrawReportPDF.propTypes = {
  currentData: PropTypes.object.isRequired,
};

export default DrawReportPDF;