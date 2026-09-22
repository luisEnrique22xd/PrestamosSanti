import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Helper para formato de moneda mexicano
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

export const exportCashFlowToExcel = (flujo: any) => {
  const wb = XLSX.utils.book_new();
  
  // Estructura de datos para el Excel
  const data = [
    ["SISTEMA DE GESTIÓN FINANCIERA - PRÉSTAMOS EXPRESS"],
    ["REPORTE DE CORTE DE CAJA Y FLUJO DE EFECTIVO"],
    [""],
    ["PERIODO:", flujo?.periodo?.toUpperCase()],
    ["FECHA DE GENERACIÓN:", new Date().toLocaleDateString('es-MX')],
    [""],
    ["CONCEPTO", "MONTO"],
    ["(+) INGRESOS (Cobranza Total)", flujo?.recuperacion_total],
    ["(-) EGRESOS (Colocación de Capital)", flujo?.colocacion_capital],
    [""],
    ["(=) BALANCE NETO", flujo?.balance_neto],
    [""],
    ["ESTADO DEL FLUJO:", flujo?.balance_neto >= 0 ? "SUPERÁVIT" : "DÉFICIT / INYECCIÓN"]
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Ajuste de anchos de columna básico
  ws['!cols'] = [{ wch: 35 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(wb, ws, "Corte de Caja");
  XLSX.writeFile(wb, `Corte_Caja_${flujo?.periodo}_${new Date().getTime()}.xlsx`);
};

export const exportCashFlowToPDF = (flujo: any) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const fechaReloj = new Date().toLocaleString('es-MX');

  // --- ENCABEZADO ---
  doc.setFillColor(5, 5, 51); // Azul oscuro como tu Dashboard
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("PRÉSTAMOS EXPRESS", 15, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`CORTE DE CAJA: ${flujo?.periodo?.toUpperCase()}`, 15, 30);
  doc.text(fechaReloj, pageWidth - 15, 30, { align: 'right' });

  // --- CUERPO DEL REPORTE ---
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.text("Resumen de Movimientos de Capital", 15, 55);

  autoTable(doc, {
    startY: 60,
    head: [['CONCEPTO', 'DESCRIPCIÓN', 'MONTO']],
    body: [
      ['INGRESOS', 'Recuperación de cartera, intereses y multas', formatCurrency(flujo?.recuperacion_total || 0)],
      ['EGRESOS', 'Capital colocado en nuevos préstamos', formatCurrency(flujo?.colocacion_capital || 0)],
    ],
    headStyles: { fillColor: [0, 71, 171], halign: 'center' },
    columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
    theme: 'grid'
  });

  // --- BALANCE FINAL ---
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFillColor(flujo?.balance_neto >= 0 ? 240 : 255, flujo?.balance_neto >= 0 ? 253 : 241, flujo?.balance_neto >= 0 ? 244 : 242); 
  doc.rect(15, finalY, pageWidth - 30, 20, 'F');

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(flujo?.balance_neto >= 0 ? 16 : 153, flujo?.balance_neto >= 0 ? 185 : 27, flujo?.balance_neto >= 0 ? 129 : 27);
  doc.text("BALANCE NETO:", 25, finalY + 13);
  doc.text(formatCurrency(flujo?.balance_neto || 0), pageWidth - 25, finalY + 13, { align: 'right' });

  // --- PIE DE PÁGINA ---
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Este documento es un reporte generado automáticamente por el sistema de gestión interna.", pageWidth / 2, 285, { align: 'center' });

  doc.save(`Reporte_Flujo_${flujo?.periodo}.pdf`);
};