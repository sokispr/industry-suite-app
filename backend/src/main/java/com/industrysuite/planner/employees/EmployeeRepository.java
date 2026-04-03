package com.industrysuite.planner.employees;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @EntityGraph(attributePaths = {"roles"})
    List<Employee> findAllByOrderByLastNameAscFirstNameAsc();

    @EntityGraph(attributePaths = {"roles"})
    @NonNull
    Optional<Employee> findById(@NonNull Long id);
}
