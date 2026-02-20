package com.citycare.dto;

import lombok.Data;

@Data
public class IssueRequest {
    // Це ті самі поля, які користувач заповнюватиме на сайті
    private String category;
    private String description;
    private Double latitude;
    private Double longitude;
    private String photoBase64;
}