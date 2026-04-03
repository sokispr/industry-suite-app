package com.industrysuite.planner.events;

import com.industrysuite.planner.events.dto.EventEquipmentRegisterRequest;
import com.industrysuite.planner.events.dto.EventEquipmentRegisterResponse;
import com.industrysuite.planner.events.dto.EventResponse;
import com.industrysuite.planner.events.dto.EventUpsertRequest;
import com.industrysuite.planner.inventory.InventoryItem;
import com.industrysuite.planner.inventory.InventoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

@Service
@SuppressWarnings("null")
public class EventService {

    private final PlannedEventRepository plannedEventRepository;
    private final InventoryRepository inventoryRepository;

    public EventService(
            PlannedEventRepository plannedEventRepository,
            InventoryRepository inventoryRepository) {
        this.plannedEventRepository = plannedEventRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getAll(LocalDateTime from, LocalDateTime to) {
        List<PlannedEvent> events;
        if (from != null && to != null) {
            events = plannedEventRepository.findByStartAtBetweenOrderByStartAtAsc(from, to);
        } else {
            events = plannedEventRepository.findAllByOrderByStartAtAsc();
        }

        return events.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getById(Long id) {
        PlannedEvent event = plannedEventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        return toResponse(event);
    }

    @Transactional
    public EventResponse create(EventUpsertRequest request) {
        PlannedEvent event = new PlannedEvent();
        applyRequest(event, request);
        return toResponse(plannedEventRepository.save(event));
    }

    @Transactional
    public EventResponse update(Long id, EventUpsertRequest request) {
        PlannedEvent event = plannedEventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        applyRequest(event, request);
        return toResponse(plannedEventRepository.save(event));
    }

    @Transactional
    public void delete(Long id) {
        PlannedEvent existing = plannedEventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        plannedEventRepository.delete(existing);
    }

    private void applyRequest(PlannedEvent event, EventUpsertRequest request) {
        validateTimeWindow(request.startAt(), request.endAt());

        EventStatus status = request.status() == null ? EventStatus.PLANNED : request.status();

        event.setTitle(request.title().trim());
        event.setDescription(trimToNull(request.description()));
        event.setLocation(trimToNull(request.location()));
        event.setEventType(request.eventType() != null ? request.eventType() : EventType.EXTERNAL);
        event.setStatus(status);
        event.setStartAt(request.startAt());
        event.setEndAt(request.endAt());
        event.setColorHex(request.colorHex() == null || request.colorHex().isBlank()
                ? status.getDefaultColor()
                : request.colorHex());

        event.replaceEquipmentRegisters(resolveEquipmentRegisters(request.equipmentRegisters(), event));
    }

    private List<EventEquipmentRegister> resolveEquipmentRegisters(
            List<EventEquipmentRegisterRequest> equipmentRegisters,
            PlannedEvent currentEvent) {
        if (equipmentRegisters == null || equipmentRegisters.isEmpty()) {
            return List.of();
        }

        LinkedHashSet<Long> uniqueInventoryIds = new LinkedHashSet<>();
        List<EventEquipmentRegister> mapped = new ArrayList<>();

        for (EventEquipmentRegisterRequest equipmentRequest : equipmentRegisters) {
            InventoryItem inventoryItem = inventoryRepository.findById(equipmentRequest.inventoryItemId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Invalid inventoryItemId: " + equipmentRequest.inventoryItemId()));

            if (!uniqueInventoryIds.add(inventoryItem.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate equipment item detected");
            }

            int quantityReserved = equipmentRequest.quantityReserved() == null ? 0 : equipmentRequest.quantityReserved();
            if (quantityReserved <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Equipment quantity must be greater than 0");
            }

            // Correctly calculate availability during an update.
            // First, find how much this specific event was reserving *before* this update.
            int previouslyReservedByThisEvent = 0;
            if (currentEvent != null && currentEvent.getId() != null) { // This is an update of an existing event
                previouslyReservedByThisEvent = currentEvent.getEquipmentRegisters().stream()
                        .filter(reg -> reg.getInventoryItem().getId().equals(inventoryItem.getId()))
                        .mapToInt(EventEquipmentRegister::getQuantityReserved)
                        .sum();
            }
            // The true available stock is the current DB available stock PLUS what this event is about to release.
            int availableQuantity = (inventoryItem.getQuantityTotal() - inventoryItem.getQuantityReserved())
                    + previouslyReservedByThisEvent;

            if (quantityReserved > availableQuantity) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Not enough available quantity for inventory item: " + inventoryItem.getSku());
            }

            EventEquipmentRegister equipmentRegister = new EventEquipmentRegister();
            equipmentRegister.setInventoryItem(inventoryItem);
            equipmentRegister.setQuantityReserved(quantityReserved);
            equipmentRegister.setNotes(trimToNull(equipmentRequest.notes()));
            mapped.add(equipmentRegister);
        }

        return mapped;
    }

    private EventResponse toResponse(PlannedEvent event) {
        List<EventEquipmentRegisterResponse> equipmentRegisters = event.getEquipmentRegisters().stream()
                .map(equipmentRegister -> new EventEquipmentRegisterResponse(
                        equipmentRegister.getId(),
                        equipmentRegister.getInventoryItem().getId(),
                        equipmentRegister.getInventoryItem().getSku(),
                        equipmentRegister.getInventoryItem().getName(),
                        equipmentRegister.getQuantityReserved(),
                        equipmentRegister.getNotes()))
                .toList();

        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getLocation(),
                event.getEventType(),
                event.getStatus(),
                event.getStartAt(),
                event.getEndAt(),
                event.getColorHex(),
                equipmentRegisters);
    }

    private void validateTimeWindow(LocalDateTime startAt, LocalDateTime endAt) {
        if (endAt.isEqual(startAt) || endAt.isBefore(startAt)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endAt must be after startAt");
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
