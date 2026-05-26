package com.example.taskapi.config;

import com.example.taskapi.model.Usuario;
import com.example.taskapi.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    @Bean
    CommandLineRunner initAdmin(UsuarioRepository repo, PasswordEncoder encoder) {
        return args -> {
            if (repo.findByUsername("admin").isEmpty()) {
                repo.save(new Usuario(null, "admin", encoder.encode("admin")));
                System.out.println("[Init] Usuário admin criado no banco com senha hash BCrypt.");
            } else {
                System.out.println("[Init] Usuário admin já existe — nenhuma ação necessária.");
            }
        };
    }
}
