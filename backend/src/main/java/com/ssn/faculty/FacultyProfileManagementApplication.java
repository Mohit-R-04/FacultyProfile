package com.ssn.faculty;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class FacultyProfileManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(FacultyProfileManagementApplication.class, args);
    }
}
