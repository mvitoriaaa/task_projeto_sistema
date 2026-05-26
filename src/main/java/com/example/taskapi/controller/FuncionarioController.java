package com.example.taskapi.controller;

import com.example.taskapi.model.Funcionario;
import com.example.taskapi.repository.FuncionarioRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/funcionarios")
public class FuncionarioController {

    private final FuncionarioRepository repository;

    public FuncionarioController(FuncionarioRepository repository) {
        this.repository = repository;
    }

    // GET /funcionarios — lista todos
    // GET /funcionarios?status=ADMITIDO — filtra por status
    // GET /funcionarios?status=DEMITIDO — filtra por status
    
    @GetMapping
    public List<Funcionario> listar(@RequestParam(required = false) Funcionario.Status status) {
        Sort ordem = Sort.by("id");
        if (status != null) {
            return repository.findByStatus(status, ordem);
        }
        return repository.findAll(ordem);
    }

    // GET /funcionarios/{id} — busca um funcionário pelo id
    @GetMapping("/{id}")
    public Funcionario buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Funcionário não encontrado"));
    }

    // GET /funcionarios/setor/{setorId} — lista funcionários de um setor
    @GetMapping("/setor/{setorId}")
    public List<Funcionario> listarPorSetor(@PathVariable Long setorId) {
        return repository.findBySetorId(setorId);
    }

    // POST /funcionarios — admite um novo funcionário
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Funcionario criar(@RequestBody Funcionario funcionario) {
        return repository.save(funcionario);
    }

    // PUT /funcionarios/{id} — atualiza dados do funcionário
    @PutMapping("/{id}")
    public Funcionario atualizar(@PathVariable Long id, @RequestBody Funcionario updated) {
        return repository.findById(id)
                .map(func -> {
                    func.setNome(updated.getNome());
                    func.setCargo(updated.getCargo());
                    func.setStatus(updated.getStatus());
                    func.setDataAdmissao(updated.getDataAdmissao());
                    func.setDataDemissao(updated.getDataDemissao());
                    func.setSetor(updated.getSetor());
                    return repository.save(func);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Funcionário não encontrado"));
    }

    // DELETE /funcionarios/{id} — remove um funcionário
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
