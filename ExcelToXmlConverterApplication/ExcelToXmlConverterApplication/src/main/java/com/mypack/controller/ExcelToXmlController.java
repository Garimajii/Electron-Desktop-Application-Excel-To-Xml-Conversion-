package com.mypack.controller;

import com.mypack.service.ExcelToXmlService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/convert")
@CrossOrigin(origins = "http://localhost:5173")
public class ExcelToXmlController {

    @Autowired
    private ExcelToXmlService excelToXmlService;

    @PostMapping("/excel-to-xml")
    public ResponseEntity<byte[]> convertExcelToXml(@RequestParam("file") MultipartFile file) {
        try {
            String xmlContent = excelToXmlService.convert(file);
            byte[] xmlBytes = xmlContent.getBytes(StandardCharsets.UTF_8);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_XML);
            headers.setContentDispositionFormData("attachment", "converted.xml");

            return new ResponseEntity<>(xmlBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            String errorMessage = "Conversion failed: " + e.getMessage();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);

            return new ResponseEntity<>(errorMessage.getBytes(StandardCharsets.UTF_8), headers, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    private boolean isServerReachable(String host, int port) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 5000);
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    @PostMapping("/upload-xml")
    public ResponseEntity<String> uploadXmlToServer(@RequestBody String xmlContent) {
        System.out.println("Received XML content: " + xmlContent);

        String targetUrl = "http://10.101.0.51:8000";

        if (!isServerReachable("10.101.0.51", 8000)) {
            System.out.println("Target server is not reachable.");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("The target server is not reachable.");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_XML);
            headers.add("SOAPAction", "http://tempuri.org/IClaimIntimation/ClaimIntimation");

            HttpEntity<String> request = new HttpEntity<>(xmlContent, headers);
            RestTemplate restTemplate = new RestTemplate();

            ResponseEntity<String> response = restTemplate.postForEntity(targetUrl, request, String.class);
            System.out.println("Response from target server: " + response.getBody());
            return ResponseEntity.status(response.getStatusCode())
                    .body("Upload successful:\n" + response.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Upload failed: " + e.getMessage());
        }
    }

}
