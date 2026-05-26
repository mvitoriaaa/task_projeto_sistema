package com.example.taskapi.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String cargo;

    // ADMITIDO ou DEMITIDO
    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDate dataAdmissao;

    // Preenchido apenas quando demitido
    private LocalDate dataDemissao;

    // Setor ao qual o funcionário pertence
    @ManyToOne
    @JoinColumn(name = "setor_id")
    private Setor setor;

    public enum Status {
        ADMITIDO, DEMITIDO
    }
}
