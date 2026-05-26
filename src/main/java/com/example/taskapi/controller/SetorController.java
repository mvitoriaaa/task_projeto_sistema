package com.example.taskapi.controller;

import com.example.taskapi.model.Setor;
import com.example.taskapi.repository.SetorRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/setores")
public class SetorController {

    private final SetorRepository repository;

    public SetorController(SetorRepository repository) {
        this.repository = repository;
    }

    // GET /setores — lista todos os setores
    @GetMapping
    public List<Setor> listar() {
        return repository.findAll(Sort.by("id"));
    }

    // GET /setores/{id} — busca um setor pelo id
    @GetMapping("/{id}")
    public Setor buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Setor não encontrado"));
    }

    // POST /setores — cria um novo setor
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Setor criar(@RequestBody Setor setor) {
        return repository.save(setor);
    }

    // PUT /setores/{id} — atualiza um setor pelo id
    @PutMapping("/{id}")
    public Setor atualizar(@PathVariable Long id, @RequestBody Setor updated) {
        return repository.findById(id)
                .map(setor -> {
                    setor.setNome(updated.getNome());
                    return repository.save(setor);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Setor não encontrado"));
    }

    // DELETE /setores/{id} — deleta um setor pelo id
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
