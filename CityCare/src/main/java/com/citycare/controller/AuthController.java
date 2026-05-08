package com.citycare.controller;

import com.citycare.dto.RegisterRequest;
import com.citycare.model.User;
import com.citycare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return "Помилка: Користувач з таким логіном вже існує!";
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Перший акаунт стає адміном
        if (userRepository.count() == 0) {
            user.setRole("ROLE_ADMIN");
        } else {
            user.setRole("ROLE_USER");
        }

        userRepository.save(user);
        return "Успіх";
    }

    // Метод, щоб сайт розумів, хто зараз онлайн
    @GetMapping("/me")
    public Map<String, String> getCurrentUser(Authentication auth) {
        Map<String, String> response = new HashMap<>();
        if (auth != null && auth.isAuthenticated()) {
            response.put("username", auth.getName());
            response.put("role", auth.getAuthorities().iterator().next().getAuthority());
        } else {
            response.put("username", "guest");
            response.put("role", "ROLE_GUEST");
        }
        return response;
    }
}