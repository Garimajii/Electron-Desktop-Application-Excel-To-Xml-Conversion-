package com.mypack.service;

import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelToXmlService {

    public String convert(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            StringWriter xmlWriter = new StringWriter();


            xmlWriter.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
            xmlWriter.write("<soapenv:Envelope " +
                    "xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" " +
                    "xmlns:tem=\"http://example.com/tem\">\n");
            xmlWriter.write("<soapenv:Header/>\n");
            xmlWriter.write("<soapenv:Body>\n");
            xmlWriter.write("<v:ClaimIntimation>\n");
            xmlWriter.write("<tem:v_sinput><![CDATA[\n");
            xmlWriter.write("<INPUT>\n");




            Sheet sheet = workbook.getSheetAt(0);


            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new IllegalArgumentException("Excel file must have a header row");
            }

            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) {
                headers.add(escapeXml(cell.getStringCellValue().trim()));
            }


            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                xmlWriter.write("<RECORD>\n");

                for (int j = 0; j < headers.size(); j++) {
                    Cell cell = row.getCell(j);
                    String value = (cell != null) ? getCellValue(cell) : "";
                    xmlWriter.write("<" + headers.get(j) + ">" + escapeXml(value) + "</" + headers.get(j) + ">\n");
                }

                xmlWriter.write("</RECORD>\n");
            }


            xmlWriter.write("    </INPUT>\n");
            xmlWriter.write("      ]]>\n</tem:v_sinput>\n");
            xmlWriter.write("<v_sUserId>Garima</v_sUserId>\n");
            xmlWriter.write("<v_sPassword>xyz</v_sPassword>\n");
            xmlWriter.write("</v:ClaimIntimation>\n");
            xmlWriter.write("</soapenv:Body>\n");
            xmlWriter.write("</soapenv:Envelope>\n");


            return xmlWriter.toString();
        }
    }

    private String getCellValue(Cell cell) {
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    double num = cell.getNumericCellValue();

                    return (num == Math.floor(num)) ? String.valueOf((long) num) : String.valueOf(num);
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            case BLANK:
            default:
                return "";
        }
    }

    private String escapeXml(String str) {
        if (str == null) return "";
        return str.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
