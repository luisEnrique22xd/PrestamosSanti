// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// import ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver'; // Necesitarás instalar file-saver también

// export const exportToExcel = async (stats: any, grafica: any[] = []) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet('Reporte Detallado SAPPE');

//   // 1. CONFIGURACIÓN DE COLUMNAS
//   worksheet.columns = [
//     { header: 'CONCEPTO / PERIODO', key: 'col1', width: 30 },
//     { header: 'CAPITAL', key: 'col2', width: 20 },
//     { header: 'INTERÉS', key: 'col3', width: 20 },
//     { header: 'TOTAL', key: 'col4', width: 20 },
//     { header: 'CLIENTES / DETALLE', key: 'col5', width: 50 },
//   ];

//   worksheet.views = [{ showGridLines: false }];

//   // 2. INSERCIÓN DEL LOGO
//   try {
//     const response = await fetch('/images/logo.png');
//     if (response.ok) {
//       const buffer = await response.arrayBuffer();
//       const logoId = workbook.addImage({ buffer, extension: 'png' });
//       worksheet.addImage(logoId, {
//         tl: { col: 0.1, row: 0.1 },
//         ext: { width: 85, height: 85 }
//       });
//     }
//   } catch (e) { console.error("Logo no cargado"); }

//   // Espaciado inicial para el encabezado
//   for (let i = 0; i < 6; i++) worksheet.addRow([]);

//   const titleRow = worksheet.addRow(["REPORTE FINANCIERO PROFESIONAL - SAPPE"]);
//   worksheet.mergeCells(`A7:E7`);
//   titleRow.font = { name: 'Arial Black', size: 16, italic: true, color: { argb: '0047AB' } };
//   titleRow.alignment = { horizontal: 'center' };

//   worksheet.addRow([`Generado el: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`]);
//   if (stats.info_periodo || stats.info) {
//     worksheet.addRow([`Periodo: ${stats.info_periodo || stats.info}`]);
//   }
//   worksheet.addRow([]);

//   // --- SECCIÓN 1: RANGOS DE INVERSIÓN ---
//   const rangeTitle = worksheet.addRow(["DESGLOSE POR RANGOS DE INVERSIÓN"]);
//   rangeTitle.font = { bold: true, size: 12 };
  
//   const headerRangos = worksheet.addRow(["Rangos", "Capital Inicial", "Interés Devengado", "Total Cobrado", "Clientes"]);
//   headerRangos.eachCell(c => {
//     c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0047AB' } };
//     c.font = { bold: true, color: { argb: 'FFFFFF' } };
//     c.alignment = { horizontal: 'center' };
//   });

//   let tCapR = 0, tIntR = 0, tTotR = 0, tCantR = 0;

//   if (stats.rangos) {
//     stats.rangos.forEach((r: any) => {
//       const cap = Number(r.capital || 0);
//       const inte = Number(r.interes || 0);
//       const tot = Number(r.total || (cap + inte));
      
//       tCapR += cap; tIntR += inte; tTotR += tot; tCantR += (r.cant || 0);

//       const row = worksheet.addRow([
//         r.rango || r.label, 
//         cap, 
//         inte, 
//         tot, 
//         r.clientes || `${r.cant || 0} préstamos`
//       ]);

//       [2, 3, 4].forEach(col => {
//         row.getCell(col).numFmt = '"$"#,##0.00';
//         row.getCell(col).alignment = { horizontal: 'right' };
//       });
//       row.getCell(5).alignment = { wrapText: true }; // Ajuste de texto para nombres
//     });

//     // FILA DE TOTALES POR RANGO
//     const footR = worksheet.addRow(["TOTALES POR RANGO", tCapR, tIntR, tTotR, `Total Clientes: ${tCantR}`]);
//     footR.font = { bold: true };
//     footR.eachCell(c => {
//       c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
//       if ([2, 3, 4].includes(Number(c.col))) c.numFmt = '"$"#,##0.00';
//     });
//   }

//   worksheet.addRow([]);
//   worksheet.addRow([]);

//   // --- SECCIÓN 2: HISTORIAL DE COBRANZA ---
//   const histTitle = worksheet.addRow(["HISTORIAL DE COBRANZA (DESGLOSE)"]);
//   histTitle.font = { bold: true, size: 12 };

//   const tableHeader = worksheet.addRow(["Periodo", "Capital Inicial", "Interés Devengado", "Total Cobrado"]);
//   tableHeader.eachCell(cell => {
//     cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '050533' } };
//     cell.font = { bold: true, color: { argb: 'FFFFFF' } };
//     cell.alignment = { horizontal: 'center' };
//   });

//   const datosHistorial = stats.historial || grafica;
//   let tCapH = 0, tIntH = 0, tTotH = 0;

//   if (datosHistorial && datosHistorial.length > 0) {
//     datosHistorial.forEach((g: any) => {
//       const c = Number(g.capital || 0);
//       const i = Number(g.interes || 0);
//       const t = Number(g.total || (c + i));

//       tCapH += c; tIntH += i; tTotH += t;

//       const row = worksheet.addRow([g.name || g.fecha, c, i, t]);

//       [2, 3, 4].forEach(colIdx => {
//         const cell = row.getCell(colIdx);
//         cell.numFmt = '"$"#,##0.00';
//         cell.alignment = { horizontal: 'right' };
//       });
//     });

//     // FILA DE GRAN TOTAL COBRADO
//     const footH = worksheet.addRow(["GRAN TOTAL COBRADO", tCapH, tIntH, tTotH]);
//     footH.font = { bold: true, color: { argb: 'FFFFFF' } };
//     footH.eachCell(c => {
//       c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0047AB' } };
//       if ([2, 3, 4].includes(Number(c.col))) c.numFmt = '"$"#,##0.00';
//     });
//   }

//   // 7. GENERAR DESCARGA
//   const buffer = await workbook.xlsx.writeBuffer();
//   const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//   saveAs(blob, `Reporte_SAPPE_${new Date().getTime()}.xlsx`);
// };

// export const exportToPDF = (stats: any, grafica: any[]) => {
//   const doc = new jsPDF();
  
//   // Encabezado
//   doc.setFontSize(18);
//   doc.setTextColor(0, 71, 171); // Azul Rey
//   doc.text("PRÉSTAMOS EXPRESS", 14, 20);
  
//   doc.setFontSize(10);
//   doc.setTextColor(100);
//   doc.text("REPORTE FINANCIERO DE CARTERA", 14, 28);
//   doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 34);

//   // 1. Tabla de Totales
//   autoTable(doc, {
//     startY: 40,
//     head: [['Métrica', 'Valor Actual']],
//     body: [
//       ['Capital Vigente en Calle', stats.capital_en_calle],
//       ['Contratos Activos', stats.prestamos_activos.toString()],
//       ['Recuperación Total (Abonos)', stats.total_recuperado],
//       ['Interés Proyectado', `$${(stats.total_interes_generado || 0).toLocaleString()}`]
//     ],
//     headStyles: { fillColor: [5, 5, 51] }, // Azul muy oscuro
//     theme: 'striped'
//   });

//   // OBTENEMOS LA POSICIÓN FINAL DE FORMA SEGURA
//   // @ts-ignore
//   const finalY = (doc as any).lastAutoTable.finalY || 70;

//   // 2. Tabla de Rangos
//   doc.setFontSize(12);
//   doc.setTextColor(0);
//   doc.text("Distribución por Rangos", 14, finalY + 15);

//   autoTable(doc, {
//     startY: finalY + 20,
//     head: [['Rango de Crédito', 'Monto Acumulado', 'Clientes']],
//     body: (stats.rangos || []).map((r: any) => [r.label, r.total, r.cant]),
//     headStyles: { fillColor: [0, 71, 171] },
//     theme: 'grid'
//   });

//   // Guardar
//   doc.save(`Reporte_Financiero_Express_${new Date().toLocaleDateString()}.pdf`);
// };
// import ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';

// export const exportToExcel = async (stats: any, grafica: any[] = []) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet('Reporte Detallado SAPPE');

//   worksheet.columns = [
//     { header: 'CONCEPTO / PERIODO', key: 'col1', width: 30 },
//     { header: 'CAPITAL PROGRAMADO', key: 'col2', width: 22 },
//     { header: 'INTERÉS PROGRAMADO', key: 'col3', width: 22 },
//     { header: 'TOTAL PROGRAMADO', key: 'col4', width: 22 },
//     { header: 'CLIENTES / DETALLE', key: 'col5', width: 55 },
//   ];

//   worksheet.views = [{ showGridLines: false }];

//   try {
//     const response = await fetch('/images/logo.png');
//     if (response.ok) {
//       const buffer = await response.arrayBuffer();
//       const logoId = workbook.addImage({ buffer, extension: 'png' });
//       worksheet.addImage(logoId, {
//         tl: { col: 0.1, row: 0.1 },
//         ext: { width: 85, height: 85 }
//       });
//     }
//   } catch (e) { console.error("Logo no cargado"); }

//   for (let i = 0; i < 6; i++) worksheet.addRow([]);

//   const titleRow = worksheet.addRow(["REPORTE FINANCIERO PROFESIONAL - SAPPE"]);
//   worksheet.mergeCells(`A7:E7`);
//   titleRow.font = { name: 'Arial Black', size: 16, italic: true, color: { argb: '0047AB' } };
//   titleRow.alignment = { horizontal: 'center' };

//   worksheet.addRow([`Generado el: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`]);
//   if (stats.info_periodo || stats.info) {
//     worksheet.addRow([`Periodo: ${stats.info_periodo || stats.info}`]);
//   }
//   worksheet.addRow([]);

//   // --- SECCIÓN 1: RANGOS DE INVERSIÓN ---
//   const rangeTitle = worksheet.addRow(["DESGLOSE POR RANGOS DE INVERSIÓN"]);
//   rangeTitle.font = { bold: true, size: 12 };
  
//   const headerRangos = worksheet.addRow(["Rangos", "Capital Programado", "Interés Programado", "Total Programado", "Clientes"]);
//   headerRangos.eachCell(c => {
//     c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0047AB' } };
//     c.font = { bold: true, color: { argb: 'FFFFFF' } };
//     c.alignment = { horizontal: 'center' };
//   });

//   let tCapR = 0, tIntR = 0, tTotR = 0, tCantR = 0;

//   if (stats.rangos) {
//     stats.rangos.forEach((r: any) => {
//       const cap = Number(r.capital || 0);
//       const inte = Number(r.interes || 0);
//       const tot = Number(r.total || (cap + inte));
      
//       tCapR += cap; tIntR += inte; tTotR += tot; tCantR += (r.cant || 0);

//       const row = worksheet.addRow([
//         r.rango || r.label, 
//         cap, 
//         inte, 
//         tot, 
//         r.clientes || `${r.cant || 0} préstamos`
//       ]);

//       [2, 3, 4].forEach(col => {
//         row.getCell(col).numFmt = '"$"#,##0.00';
//         row.getCell(col).alignment = { horizontal: 'right' };
//       });
//       row.getCell(5).alignment = { wrapText: true };
//     });

//     const footR = worksheet.addRow(["TOTALES POR RANGO", tCapR, tIntR, tTotR, `Total Préstamos: ${tCantR}`]);
//     footR.font = { bold: true };
//     footR.eachCell(c => {
//       c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
//       if ([2, 3, 4].includes(Number(c.col))) c.numFmt = '"$"#,##0.00';
//     });
//   }

//   worksheet.addRow([]);
//   worksheet.addRow([]);

//   // --- SECCIÓN 2: HISTORIAL SEMANAL ---
//   const histTitle = worksheet.addRow(["HISTORIAL DE COBRANZA SEMANAL (DESGLOSE)"]);
//   histTitle.font = { bold: true, size: 12 };

//   const tableHeader = worksheet.addRow(["Semana", "Capital Programado", "Interés Programado", "Total Programado"]);
//   tableHeader.eachCell(cell => {
//     cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '050533' } };
//     cell.font = { bold: true, color: { argb: 'FFFFFF' } };
//     cell.alignment = { horizontal: 'center' };
//   });

//   const datosHistorial = stats.historial || grafica;
//   let tCapH = 0, tIntH = 0, tTotH = 0;

//   if (datosHistorial && datosHistorial.length > 0) {
//     datosHistorial.forEach((g: any) => {
//       const c = Number(g.capital || 0);
//       const i = Number(g.interes || 0);
//       const t = Number(g.total || (c + i));

//       tCapH += c; tIntH += i; tTotH += t;

//       const row = worksheet.addRow([g.name || g.fecha, c, i, t]);

//       [2, 3, 4].forEach(colIdx => {
//         const cell = row.getCell(colIdx);
//         cell.numFmt = '"$"#,##0.00';
//         cell.alignment = { horizontal: 'right' };
//       });
//     });

//     const footH = worksheet.addRow(["GRAN TOTAL PROGRAMADO", tCapH, tIntH, tTotH]);
//     footH.font = { bold: true, color: { argb: 'FFFFFF' } };
//     footH.eachCell(c => {
//       c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0047AB' } };
//       if ([2, 3, 4].includes(Number(c.col))) c.numFmt = '"$"#,##0.00';
//     });
//   }

//   const buffer = await workbook.xlsx.writeBuffer();
//   const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//   saveAs(blob, `Reporte_SAPPE_${new Date().getTime()}.xlsx`);
// };
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcel = async (stats: any, grafica: any[] = []) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte Detallado SAPPE');

  // Ajuste de columnas para incluir el Total Programado Ajustado (con Penalizaciones)
  worksheet.columns = [
    { header: 'CONCEPTO / PERIODO', key: 'col1', width: 28 },
    { header: 'CAPITAL PROGRAMADO', key: 'col2', width: 22 },
    { header: 'INTERÉS PROGRAMADO', key: 'col3', width: 22 },
    { header: 'TOTAL PROGRAMADO', key: 'col4', width: 22 },
    { header: 'PENALIZACIÓN COBRADA', key: 'col5', width: 24 },
    { header: 'TOTAL CON PENALIZACIÓN', key: 'col6', width: 26 },
    { header: 'CLIENTES / DETALLE', key: 'col7', width: 30 },
  ];

  worksheet.views = [{ showGridLines: false }];

  try {
    const response = await fetch('/images/logo.png');
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const logoId = workbook.addImage({ buffer, extension: 'png' });
      worksheet.addImage(logoId, {
        tl: { col: 0.1, row: 0.1 },
        ext: { width: 85, height: 85 }
      });
    }
  } catch (e) { console.error("Logo no cargado"); }

  for (let i = 0; i < 6; i++) worksheet.addRow([]);

  const titleRow = worksheet.addRow(["REPORTE FINANCIERO PROFESIONAL - SAPPE"]);
  worksheet.mergeCells(`A7:G7`);
  titleRow.font = { name: 'Arial Black', size: 16, italic: true, color: { argb: '0047AB' } };
  titleRow.alignment = { horizontal: 'center' };

  worksheet.addRow([`Generado el: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`]);
  if (stats.info_periodo || stats.info) {
    worksheet.addRow([`Periodo: ${stats.info_periodo || stats.info}`]);
  }
  worksheet.addRow([]);

  // --- SECCIÓN 1: RANGOS DE INVERSIÓN ---
  const rangeTitle = worksheet.addRow(["DESGLOSE POR RANGOS DE INVERSIÓN"]);
  rangeTitle.font = { bold: true, size: 12 };
  
  const headerRangos = worksheet.addRow([
    "Rangos", 
    "Capital Programado", 
    "Interés Programado", 
    "Total Programado", 
    "Penalización Cobrada",
    "Total con Penalización",
    "Clientes"
  ]);
  
  headerRangos.eachCell(c => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0047AB' } };
    c.font = { bold: true, color: { argb: 'FFFFFF' } };
    c.alignment = { horizontal: 'center' };
  });

  let tCapR = 0, tIntR = 0, tTotR = 0, tPenCobR = 0, tTotConPenR = 0, tCantR = 0;

  if (stats.rangos) {
    stats.rangos.forEach((r: any) => {
      const cap = Number(r.capital || 0);
      const inte = Number(r.interes || 0);
      const tot = Number(r.total || (cap + inte));
      const penCobrada = Number(r.penalizacion_cobrada || 0);
      const totConPen = tot + penCobrada; // Suma solicitada: Total + Penalizaciones Cobradas
      
      tCapR += cap; 
      tIntR += inte; 
      tTotR += tot; 
      tPenCobR += penCobrada;
      tTotConPenR += totConPen;
      tCantR += (r.cant || 0);

      const row = worksheet.addRow([
        r.rango || r.label, 
        cap, 
        inte, 
        tot, 
        penCobrada,
        totConPen,
        r.clientes || `${r.cant || 0} préstamos`
      ]);

      // Formato numérico en moneda para columnas de valores
      [2, 3, 4, 5, 6].forEach(col => {
        row.getCell(col).numFmt = '"$"#,##0.00';
        row.getCell(col).alignment = { horizontal: 'right' };
      });
      row.getCell(7).alignment = { wrapText: true };
    });

    const footR = worksheet.addRow([
      "TOTALES POR RANGO", 
      tCapR, 
      tIntR, 
      tTotR, 
      tPenCobR,
      tTotConPenR,
      `Total Préstamos: ${tCantR}`
    ]);
    footR.font = { bold: true };
    footR.eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
      if ([2, 3, 4, 5, 6].includes(Number(c.col))) c.numFmt = '"$"#,##0.00';
    });
  }

  worksheet.addRow([]);
  worksheet.addRow([]);

  // --- SECCIÓN 2: HISTORIAL SEMANAL ---
  const histTitle = worksheet.addRow(["HISTORIAL DE COBRANZA SEMANAL (DESGLOSE)"]);
  histTitle.font = { bold: true, size: 12 };

  const tableHeader = worksheet.addRow(["Semana", "Capital Programado", "Interés Programado", "Total Programado"]);
  tableHeader.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '050533' } };
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.alignment = { horizontal: 'center' };
  });

  const datosHistorial = stats.historial || grafica;
  let tCapH = 0, tIntH = 0, tTotH = 0;

  if (datosHistorial && datosHistorial.length > 0) {
    datosHistorial.forEach((g: any) => {
      const c = Number(g.capital || 0);
      const i = Number(g.interes || 0);
      const t = Number(g.total || (c + i));

      tCapH += c; tIntH += i; tTotH += t;

      const row = worksheet.addRow([g.name || g.fecha, c, i, t]);

      [2, 3, 4].forEach(colIdx => {
        const cell = row.getCell(colIdx);
        cell.numFmt = '"$"#,##0.00';
        cell.alignment = { horizontal: 'right' };
      });
    });

    const footH = worksheet.addRow(["GRAN TOTAL PROGRAMADO", tCapH, tIntH, tTotH]);
    footH.font = { bold: true, color: { argb: 'FFFFFF' } };
    footH.eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0047AB' } };
      if ([2, 3, 4].includes(Number(c.col))) c.numFmt = '"$"#,##0.00';
    });
  }

  worksheet.addRow([]);
  worksheet.addRow([]);

  // --- SECCIÓN 3: RESUMEN GLOBAL DE INGRESOS ---
  const penTitle = worksheet.addRow(["RESUMEN DE COBRANZA Y RECARGOS (GLOBAL)"]);
  penTitle.font = { bold: true, size: 12 };

  const headerPenalizaciones = worksheet.addRow([
    "Total Interés Programado", 
    "Penalizaciones Cobradas", 
    "Total Programado + Penalizaciones Cobradas"
  ]);

  headerPenalizaciones.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '10B981' } };
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.alignment = { horizontal: 'center' };
  });

  const intGenerado = Number(stats.total_interes_generado || tIntR || 0);
  const penCobradas = Number(stats.penalizaciones_cobradas || tPenCobR || 0);
  const totalProgGeneral = Number(stats.total_esperado || tTotR || 0);
  const totalCombinado = stats.ingresos_intereses_mas_penalizaciones || (totalProgGeneral + penCobradas);

  const rowPen = worksheet.addRow([intGenerado, penCobradas, totalCombinado]);
  rowPen.font = { bold: true };
  [1, 2, 3].forEach(colIdx => {
    const cell = rowPen.getCell(colIdx);
    cell.numFmt = '"$"#,##0.00';
    cell.alignment = { horizontal: 'right' };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Reporte_SAPPE_${new Date().getTime()}.xlsx`);
};