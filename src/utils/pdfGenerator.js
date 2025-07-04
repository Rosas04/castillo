
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generarPDF = (prestamo, cliente, cronograma) => {
  const doc = new jsPDF();
  
  // Configuración de colores
  const primaryColor = [59, 130, 246]; // Blue-500
  const secondaryColor = [107, 114, 128]; // Gray-500
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTRATO DE PRÉSTAMO', 105, 20, { align: 'center' });
  
  // Información del préstamo
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  let yPosition = 45;
  
  // Datos del cliente
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL CLIENTE:', 20, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  if (cliente.tipoPersona === 'natural') {
    doc.text(`Nombre: ${cliente.nombres} ${cliente.apellidos}`, 20, yPosition);
    yPosition += 7;
    doc.text(`DNI: ${cliente.numeroDocumento}`, 20, yPosition);
  } else {
    doc.text(`Razón Social: ${cliente.razonSocial}`, 20, yPosition);
    yPosition += 7;
    doc.text(`RUC: ${cliente.numeroDocumento}`, 20, yPosition);
  }
  
  yPosition += 7;
  if (cliente.telefono) {
    doc.text(`Teléfono: ${cliente.telefono}`, 20, yPosition);
    yPosition += 7;
  }
  if (cliente.direccion) {
    doc.text(`Dirección: ${cliente.direccion}`, 20, yPosition);
    yPosition += 7;
  }
  
  yPosition += 10;
  
  // Datos del préstamo
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL PRÉSTAMO:', 20, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Monto: S/ ${prestamo.monto?.toLocaleString()}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Tasa de Interés: ${prestamo.tasaInteres}% anual`, 20, yPosition);
  yPosition += 7;
  doc.text(`Plazo: ${prestamo.plazo} meses`, 20, yPosition);
  yPosition += 7;
  doc.text(`Fecha de Inicio: ${new Date(prestamo.fechaInicio).toLocaleDateString()}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Tipo de Interés: ${prestamo.tipoInteres === 'simple' ? 'Simple' : 'Compuesto'}`, 20, yPosition);
  
  yPosition += 15;
  
  // Cronograma de pagos
  doc.setFont('helvetica', 'bold');
  doc.text('CRONOGRAMA DE PAGOS:', 20, yPosition);
  yPosition += 10;
  
  // Tabla del cronograma
  const tableData = cronograma.map(cuota => [
    cuota.numeroCuota.toString(),
    new Date(cuota.fechaVencimiento).toLocaleDateString(),
    `S/ ${cuota.capital?.toFixed(2)}`,
    `S/ ${cuota.interes?.toFixed(2)}`,
    `S/ ${cuota.cuota?.toFixed(2)}`
  ]);
  
  doc.autoTable({
    startY: yPosition,
    head: [['Cuota', 'Fecha Venc.', 'Capital', 'Interés', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    bodyStyles: {
      textColor: [0, 0, 0]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });
  
  // Totales
  const finalY = doc.lastAutoTable.finalY + 15;
  const totalCapital = cronograma.reduce((sum, cuota) => sum + (cuota.capital || 0), 0);
  const totalInteres = cronograma.reduce((sum, cuota) => sum + (cuota.interes || 0), 0);
  const totalGeneral = cronograma.reduce((sum, cuota) => sum + (cuota.cuota || 0), 0);
  
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN:', 20, finalY);
  doc.text(`Total Capital: S/ ${totalCapital.toFixed(2)}`, 20, finalY + 10);
  doc.text(`Total Intereses: S/ ${totalInteres.toFixed(2)}`, 20, finalY + 20);
  doc.text(`TOTAL A PAGAR: S/ ${totalGeneral.toFixed(2)}`, 20, finalY + 30);
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...secondaryColor);
  doc.text('Documento generado por PréstamosPro', 105, pageHeight - 20, { align: 'center' });
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 105, pageHeight - 10, { align: 'center' });
  
  // Descargar el PDF
  const fileName = `prestamo_${prestamo.id}_${cliente.tipoPersona === 'natural' ? 
    `${cliente.nombres}_${cliente.apellidos}` : 
    cliente.razonSocial.replace(/\s+/g, '_')}.pdf`;
  
  doc.save(fileName);
};
