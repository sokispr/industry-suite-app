package com.industrysuite.planner.roles;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleCategoryRepository extends JpaRepository<RoleCategory, Long> {
    boolean existsByNameIgnoreCase(String name);
    Optional<RoleCategory> findByNameIgnoreCase(String name);
}
