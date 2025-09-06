package com.ssn.faculty;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FacultyProfileManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(FacultyProfileManagementApplication.class, args);
    }
}
