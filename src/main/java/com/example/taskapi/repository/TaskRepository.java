package com.example.taskapi.repository;

import com.example.taskapi.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
}


