package com.industrysuite.planner.events;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PlannedEventRepository extends JpaRepository<PlannedEvent, Long> {

    @EntityGraph(attributePaths = {"equipmentRegisters", "equipmentRegisters.inventoryItem"})
    List<PlannedEvent> findAllByOrderByStartAtAsc();

    @EntityGraph(attributePaths = {"equipmentRegisters", "equipmentRegisters.inventoryItem"})
    List<PlannedEvent> findByStartAtBetweenOrderByStartAtAsc(LocalDateTime startAt, LocalDateTime endAt);

    @EntityGraph(attributePaths = {"equipmentRegisters", "equipmentRegisters.inventoryItem"})
    @NonNull
    Optional<PlannedEvent> findById(@NonNull Long id);
}
