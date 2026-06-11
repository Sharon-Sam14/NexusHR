package com.nexushr.payroll;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.itextpdf.text.pdf.draw.LineSeparator;
import com.nexushr.entity.Payroll;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.Locale;

/*
 * PayslipGenerator
 *
 * Generates a printable, styled PDF payslip for a given Payroll record
 * using the iText 5 library.
 *
 * The PDF includes:
 *   - Company header with NexusHR branding
 *   - Employee information section
 *   - Payroll breakdown table (earnings, deductions, tax, net)
 *   - Footer with signature block
 */
@Component
@Slf4j
public class PayslipGenerator {

    private static final BaseColor BRAND_COLOR = new BaseColor(99, 102, 241);   // Indigo
    private static final BaseColor HEADER_BG   = new BaseColor(238, 242, 255);
    private static final BaseColor ROW_ALT     = new BaseColor(249, 250, 251);

    /*
     * Generates a payslip PDF and returns the bytes.
     *
     * @param payroll The fully-populated Payroll entity
     * @return        PDF document bytes
     */
    public byte[] generate(Payroll payroll) {
        try {
            Document document = new Document(PageSize.A4, 40, 40, 60, 40);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);
            document.open();

            String monthName = Month.of(payroll.getMonth()).getDisplayName(TextStyle.FULL, Locale.ENGLISH);
            String period = monthName + " " + payroll.getYear();
            String employeeName = payroll.getEmployee().getEmployeeName();

            // ── Company Header ──────────────────────────────────────────────
            Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, BRAND_COLOR);
            Font subFont   = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.GRAY);
            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.DARK_GRAY);
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.BLACK);
            Font tableHdr  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
            Font rowFont   = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.DARK_GRAY);
            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, BRAND_COLOR);

            Paragraph title = new Paragraph("NexusHR", brandFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph subtitle = new Paragraph("Enterprise HR & Workforce Management", subFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);

            document.add(new Paragraph(" "));

            // ── Payslip Title ───────────────────────────────────────────────
            Font slipTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BRAND_COLOR);
            Paragraph slipHeader = new Paragraph("SALARY SLIP — " + period.toUpperCase(), slipTitle);
            slipHeader.setAlignment(Element.ALIGN_CENTER);
            document.add(slipHeader);

            LineSeparator ls = new LineSeparator(1, 100, BRAND_COLOR, Element.ALIGN_CENTER, -5);
            document.add(new Chunk(ls));
            document.add(new Paragraph(" "));

            // ── Employee Info Table ──────────────────────────────────────────
            PdfPTable infoTable = new PdfPTable(4);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{2, 3, 2, 3});

            addInfoCell(infoTable, "Employee Name", labelFont, HEADER_BG);
            addInfoCell(infoTable, employeeName, valueFont, HEADER_BG);
            addInfoCell(infoTable, "Department", labelFont, HEADER_BG);
            addInfoCell(infoTable, payroll.getEmployee().getDepartment(), valueFont, HEADER_BG);

            addInfoCell(infoTable, "Designation", labelFont, BaseColor.WHITE);
            addInfoCell(infoTable, payroll.getEmployee().getDesignation(), valueFont, BaseColor.WHITE);
            addInfoCell(infoTable, "Pay Period", labelFont, BaseColor.WHITE);
            addInfoCell(infoTable, period, valueFont, BaseColor.WHITE);

            addInfoCell(infoTable, "Working Days", labelFont, HEADER_BG);
            addInfoCell(infoTable, String.valueOf(payroll.getWorkingDays()), valueFont, HEADER_BG);
            addInfoCell(infoTable, "Days Present", labelFont, HEADER_BG);
            addInfoCell(infoTable, String.valueOf(payroll.getDaysPresent()), valueFont, HEADER_BG);

            document.add(infoTable);
            document.add(new Paragraph(" "));

            // ── Payroll Breakdown Table ──────────────────────────────────────
            PdfPTable payTable = new PdfPTable(3);
            payTable.setWidthPercentage(100);
            payTable.setWidths(new float[]{4, 3, 3});

            // Table Header
            addTableHeader(payTable, "Component", tableHdr, BRAND_COLOR);
            addTableHeader(payTable, "Description", tableHdr, BRAND_COLOR);
            addTableHeader(payTable, "Amount (₹)", tableHdr, BRAND_COLOR);

            // Earnings
            addPayRow(payTable, "Basic Salary", "Monthly base pay", formatAmount(payroll.getBasicSalary()), rowFont, BaseColor.WHITE);
            addPayRow(payTable, "Bonus", "Performance incentive", formatAmount(payroll.getBonus()), rowFont, ROW_ALT);

            if (payroll.getOvertimeHours() != null && payroll.getOvertimeHours() > 0) {
                String overtimeDesc = String.format("Overtime pay (%.1f hrs @ 1.5x)", payroll.getOvertimeHours());
                addPayRow(payTable, "Overtime Payout", overtimeDesc, formatAmount(payroll.getOvertimePay()), rowFont, BaseColor.WHITE);
            }

            // Deductions
            addPayRow(payTable, "Deductions", "Insurance, PF, etc.", "- " + formatAmount(payroll.getDeductions()), rowFont, BaseColor.WHITE);

            String taxLabel = "Tax (" + resolveBracket(payroll.getBasicSalary()) + ")";
            addPayRow(payTable, taxLabel, "Income tax on basic salary", "- " + formatAmount(payroll.getTax()), rowFont, ROW_ALT);

            // Net Salary Row (highlighted)
            PdfPCell netLabelCell = new PdfPCell(new Phrase("NET SALARY", totalFont));
            netLabelCell.setColspan(2);
            netLabelCell.setBorderColor(BRAND_COLOR);
            netLabelCell.setPadding(8);
            payTable.addCell(netLabelCell);

            PdfPCell netValCell = new PdfPCell(new Phrase(formatAmount(payroll.getNetSalary()), totalFont));
            netValCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            netValCell.setBorderColor(BRAND_COLOR);
            netValCell.setPadding(8);
            payTable.addCell(netValCell);

            document.add(payTable);
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // ── Footer ───────────────────────────────────────────────────────
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, BaseColor.GRAY);
            Paragraph footer = new Paragraph(
                    "This is a system-generated payslip from NexusHR. No signature required.\n" +
                    "Generated by NexusHR Enterprise HR System | payroll@nexushr.com", footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            log.info("[PAYSLIP] Generated PDF for {} — Period: {}", employeeName, period);
            return out.toByteArray();

        } catch (Exception e) {
            log.error("[PAYSLIP] PDF generation failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate payslip PDF: " + e.getMessage(), e);
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private void addInfoCell(PdfPTable table, String text, Font font, BaseColor bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(6);
        cell.setBorderColor(BaseColor.LIGHT_GRAY);
        table.addCell(cell);
    }

    private void addTableHeader(PdfPTable table, String text, Font font, BaseColor bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(8);
        table.addCell(cell);
    }

    private void addPayRow(PdfPTable table, String component, String desc, String amount, Font font, BaseColor bg) {
        PdfPCell c1 = new PdfPCell(new Phrase(component, font));
        c1.setBackgroundColor(bg);
        c1.setPadding(7);
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Phrase(desc, font));
        c2.setBackgroundColor(bg);
        c2.setPadding(7);
        table.addCell(c2);

        PdfPCell c3 = new PdfPCell(new Phrase(amount, font));
        c3.setBackgroundColor(bg);
        c3.setHorizontalAlignment(Element.ALIGN_RIGHT);
        c3.setPadding(7);
        table.addCell(c3);
    }

    private String formatAmount(Double amount) {
        if (amount == null) return "₹0.00";
        return String.format("₹%,.2f", amount);
    }

    private String resolveBracket(Double basicSalary) {
        if (basicSalary == null) return "0%";
        if (basicSalary < 50_000) return "12%";
        if (basicSalary < 100_000) return "18%";
        return "25%";
    }
}
