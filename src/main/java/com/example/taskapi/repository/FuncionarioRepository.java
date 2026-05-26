package com.example.taskapi.repository;

import com.example.taskapi.model.Funcionario;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {

    // Filtra por status com ordenação
    List<Funcionario> findByStatus(Funcionario.Status status, Sort sort);

    // Filtra por setor
    List<Funcionario> findBySetorId(Long setorId);
}
