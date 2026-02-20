package com.citycare.controller;

import com.citycare.dto.IssueRequest;
import com.citycare.model.Issue;
import com.citycare.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*") // Дозволяємо нашому сайту звертатися до цього сервера
@RequiredArgsConstructor
public class IssueController {

    private final IssueService service;

    // Якщо браузер просить дані (GET) - віддаємо список проблем
    @GetMapping
    public List<Issue> getAll() {
        return service.getAllIssues();
    }

    // Якщо браузер надсилає дані (POST) - створюємо нову проблему
    @PostMapping
    public Issue create(@RequestBody IssueRequest request) {
        return service.createIssue(request);
    }
    // DELETE-запит: видалити проблему за ID
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteIssue(id);
    }
}