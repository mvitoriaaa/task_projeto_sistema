package com.example.taskapi.controller;

import com.example.taskapi.model.TipoFabrica;
import com.example.taskapi.repository.TipoFabricaRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/tipos-fabrica")
public class TipoFabricaController {

    private final TipoFabricaRepository repository;

    public TipoFabricaController(TipoFabricaRepository repository) {
        this.repository = repository;
    }

    // GET /tipos-fabrica — lista todos os tipos de fábrica
    @GetMapping
    public List<TipoFabrica> listar() {
        return repository.findAll(Sort.by("id"));
    }

    // GET /tipos-fabrica/{id} — busca um tipo pelo id
    @GetMapping("/{id}")
    public TipoFabrica buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tipo de fábrica não encontrado"));
    }

    // POST /tipos-fabrica — cria um novo tipo de fábrica
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TipoFabrica criar(@RequestBody TipoFabrica tipoFabrica) {
        return repository.save(tipoFabrica);
    }

    // PUT /tipos-fabrica/{id} — atualiza um tipo pelo id
    @PutMapping("/{id}")
    public TipoFabrica atualizar(@PathVariable Long id, @RequestBody TipoFabrica updated) {
        return repository.findById(id)
                .map(tipo -> {
                    tipo.setNome(updated.getNome());
                    tipo.setDescricao(updated.getDescricao());
                    return repository.save(tipo);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tipo de fábrica não encontrado"));
    }

    // DELETE /tipos-fabrica/{id} — deleta um tipo pelo id
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
