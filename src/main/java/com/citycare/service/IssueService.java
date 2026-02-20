package com.citycare.service;

import com.citycare.dto.IssueRequest;
import com.citycare.model.Issue;
import com.citycare.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository repository;

    // Метод для отримання всіх проблем (щоб показати їх усі на карті)
    public List<Issue> getAllIssues() {
        return repository.findAll();
    }

    // Метод для створення нової проблеми
    public Issue createIssue(IssueRequest request) {
        Issue issue = new Issue();
        issue.setCategory(request.getCategory());
        issue.setDescription(request.getDescription());
        issue.setLatitude(request.getLatitude());
        issue.setLongitude(request.getLongitude());
        issue.setPhotoBase64(request.getPhotoBase64());
        
        // Зберігаємо і повертаємо результат
        return repository.save(issue);
    }
    // Метод для видалення проблеми за її ID
    public void deleteIssue(Long id) {
        repository.deleteById(id);
    }
}