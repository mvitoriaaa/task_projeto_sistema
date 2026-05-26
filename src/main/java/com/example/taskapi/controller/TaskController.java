package com.example.taskapi.controller;

import com.example.taskapi.model.Task;
import com.example.taskapi.repository.TaskRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskRepository repository;

    public TaskController(TaskRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Task> getAll() {
        return repository.findAll();
    }

    @GetMapping(params = "id")
    public Task getByIdQuery(@RequestParam Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task não encontrada"));
    }

    @PostMapping
    public Task create(@RequestBody Task task) {
        return repository.save(task);
    }

    @GetMapping("/{id}")
    public Task getById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task não encontrada"));
    }

    @PutMapping("/{id}")
    public Task update(@PathVariable Long id, @RequestBody Task newTask) {

    return repository.findById(id)
            .map(task -> {
                task.setTitle(newTask.getTitle());
                return repository.save(task);
            })
        .orElseThrow(() -> new RuntimeException("Task não encontrada"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}