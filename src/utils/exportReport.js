import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

/**
 * Generates and downloads a PDF report.
 */
export const generatePdfReport = (periodLabel, summary, breakdown, totalPatients, totalSessions) => {
  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('DentStory Financial Report', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Reporting Period: ${periodLabel}`, 14, 30);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 36);

    // Summary Table
    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: [
        ['Gross Earnings', `${(summary.totalYearlyEarnings || 0).toLocaleString()} EGP`],
        ['Fixed Salaries', `${(summary.totalFixedSalaries || 0).toLocaleString()} EGP`],
        ['Total Expenses', `${(summary.totalExpenses || 0).toLocaleString()} EGP`],
        ['Net Profit', `${((summary.totalYearlyEarnings || 0) - (summary.totalExpenses || 0)).toLocaleString()} EGP`],
        ['Total Patients', `${totalPatients || 0}`],
        ['Total Sessions', `${totalSessions || 0}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40], textColor: 255 },
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
      margin: { left: 14, right: 100 } // Keep summary table narrow
    });

    // Breakdown Table
    const tableData = breakdown.map(c => [
      c.clinicName || 'Unknown',
      `${(c.earnings || 0).toLocaleString()} EGP`,
      `${(c.fixed_salary || 0).toLocaleString()} EGP`,
      `${(c.expenses || 0).toLocaleString()} EGP`,
      `${((c.earnings || 0) - (c.expenses || 0)).toLocaleString()} EGP`,
      `${c.sessions || 0}`
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Clinic', 'Earnings', 'Fixed Salary', 'Expenses', 'Net Profit', 'Sessions']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [56, 189, 248] }, // Primary color tint
      styles: { fontSize: 10 },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold' },
        5: { halign: 'center' }
      }
    });

    doc.save(`DentStory_Report_${periodLabel.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    toast.success('PDF Report downloaded successfully!');
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    toast.error('Failed to generate PDF report');
  }
};

/**
 * Generates and downloads a CSV report.
 */
export const generateCsvReport = (periodLabel, summary, breakdown, totalPatients, totalSessions) => {
  try {
    let csv = 'DentStory Financial Report\n';
    csv += `Reporting Period,${periodLabel}\n`;
    csv += `Generated On,${new Date().toLocaleDateString()}\n\n`;

    csv += '--- SUMMARY ---\n';
    csv += 'Metric,Value\n';
    csv += `Gross Earnings,${summary.totalYearlyEarnings || 0}\n`;
    csv += `Fixed Salaries,${summary.totalFixedSalaries || 0}\n`;
    csv += `Total Expenses,${summary.totalExpenses || 0}\n`;
    csv += `Net Profit,${(summary.totalYearlyEarnings || 0) - (summary.totalExpenses || 0)}\n`;
    csv += `Total Patients,${totalPatients || 0}\n`;
    csv += `Total Sessions,${totalSessions || 0}\n\n`;

    csv += '--- CLINIC BREAKDOWN ---\n';
    csv += 'Clinic,Earnings,Fixed Salary,Expenses,Net Profit,Sessions\n';
    
    breakdown.forEach(c => {
      const net = (c.earnings || 0) - (c.expenses || 0);
      csv += `"${c.clinicName}",${c.earnings || 0},${c.fixed_salary || 0},${c.expenses || 0},${net},${c.sessions || 0}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `DentStory_Report_${periodLabel.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast.success('CSV Report downloaded successfully!');
  } catch (error) {
    console.error('Failed to generate CSV:', error);
    toast.error('Failed to generate CSV report');
  }
};
