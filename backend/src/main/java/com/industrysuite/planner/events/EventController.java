package com.industrysuite.planner.events;

import com.industrysuite.planner.events.dto.EventResponse;
import com.industrysuite.planner.events.dto.EventUpsertRequest;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<EventResponse> listEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return eventService.getAll(from, to);
    }

    @GetMapping("/{id}")
    public EventResponse getEvent(@PathVariable Long id) {
        return eventService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse createEvent(
            @Valid @RequestBody EventUpsertRequest request,
            @RequestHeader(value = "X-User-Role", defaultValue = "VIEWER") String userRole) {
        requireAdmin(userRole);
        return eventService.create(request);
    }

    @PutMapping("/{id}")
    public EventResponse updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventUpsertRequest request,
            @RequestHeader(value = "X-User-Role", defaultValue = "VIEWER") String userRole) {
        requireAdmin(userRole);
        return eventService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", defaultValue = "VIEWER") String userRole) {
        requireAdmin(userRole);
        eventService.delete(id);
    }

    private void requireAdmin(String userRole) {
        if (!"ADMIN".equalsIgnoreCase(userRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only ADMIN can modify events");
        }
    }
}
