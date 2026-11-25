package com.stitchflow.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class GmailMailConfig {

    @Bean
    public JavaMailSender gmailMailSender(
            @Value("${GMAIL_ADDRESS:}") String gmailAddress,
            @Value("${GMAIL_APP_PASSWORD:}") String gmailAppPassword) {

        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost("smtp.gmail.com");
        sender.setPort(587);
        sender.setProtocol("smtp");
        sender.setUsername(gmailAddress.trim());
        // Google sometimes displays the app password as four groups of four characters.
        sender.setPassword(gmailAppPassword.replaceAll("\\s+", ""));

        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");

        return sender;
    }
}
