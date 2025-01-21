import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { StaffUtilization, LaborMetrics, ShiftCoverage } from '@/types/analytics';

export async function exportToExcel(data: any, type: string): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(type);

  switch (type) {
    case 'staffUtilization':
      setupStaffUtilizationSheet(worksheet, data as StaffUtilization[]);
      break;
    case 'laborMetrics':
      setupLaborMetricsSheet(worksheet, data as LaborMetrics);
      break;
    case 'shiftCoverage':
      setupShiftCoverageSheet(worksheet, data as ShiftCoverage);
      break;
  }

  return await workbook.xlsx.writeBuffer();
}

export async function exportToPDF(data: any, type: string): Promise<Buffer> {
  const doc = new jsPDF();

  switch (type) {
    case 'staffUtilization':
      generateStaffUtilizationPDF(doc, data as StaffUtilization[]);
      break;
    case 'laborMetrics':
      generateLaborMetricsPDF(doc, data as LaborMetrics);
      break;
    case 'shiftCoverage':
      generateShiftCoveragePDF(doc, data as ShiftCoverage);
      break;
  }

  return Buffer.from(doc.output('arraybuffer'));
}

function setupStaffUtilizationSheet(worksheet: ExcelJS.Worksheet, data: StaffUtilization[]) {
  worksheet.columns = [
    { header: 'Staff Name', key: 'staffName', width: 20 },
    { header: 'Hours Scheduled', key: 'totalHoursScheduled', width: 15 },
    { header: 'Hours Worked', key: 'totalHoursWorked', width: 15 },
    { header: 'Utilization Rate', key: 'utilizationRate', width: 15 },
    { header: 'Overtime Hours', key: 'overtimeHours', width: 15 },
    { header: 'Total Cost', key: 'totalCost', width: 15 }
  ];

  worksheet.addRows(data);
  
  // Add formatting
  worksheet.getRow(1).font = { bold: true };
  worksheet.getColumn('totalCost').numFmt = '"$"#,##0.00';
  worksheet.getColumn('utilizationRate').numFmt = '0.00"%"';
}

function generateStaffUtilizationPDF(doc: jsPDF, data: StaffUtilization[]) {
  doc.setFontSize(20);
  doc.text('Staff Utilization Report', 14, 22);

  doc.autoTable({
    head: [['Staff Name', 'Hours Scheduled', 'Hours Worked', 'Utilization Rate', 'Overtime', 'Total Cost']],
    body: data.map(item => [
      item.staffName,
      item.totalHoursScheduled.toFixed(1),
      item.totalHoursWorked.toFixed(1),
      `${item.utilizationRate.toFixed(1)}%`,
      item.overtimeHours.toFixed(1),
      `$${item.totalCost.toFixed(2)}`
    ]),
    startY: 30
  });
}
