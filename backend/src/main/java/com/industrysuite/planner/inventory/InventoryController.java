package com.industrysuite.planner.inventory;

import com.industrysuite.planner.inventory.dto.InventoryResponse;
import com.industrysuite.planner.inventory.dto.InventoryUpsertRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<InventoryResponse> listInventory() {
        return inventoryService.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InventoryResponse createItem(
            @Valid @RequestBody InventoryUpsertRequest request,
            @RequestHeader(value = "X-User-Role", defaultValue = "VIEWER") String userRole) {
        requireAdmin(userRole);
        return inventoryService.create(request);
    }

    @PutMapping("/{id}")
    public InventoryResponse updateItem(
            @PathVariable Long id,
            @Valid @RequestBody InventoryUpsertRequest request,
            @RequestHeader(value = "X-User-Role", defaultValue = "VIEWER") String userRole) {
        requireAdmin(userRole);
        return inventoryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", defaultValue = "VIEWER") String userRole) {
        requireAdmin(userRole);
        inventoryService.delete(id);
    }

    private void requireAdmin(String userRole) {
        if (!"ADMIN".equalsIgnoreCase(userRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only ADMIN can modify inventory");
        }
    }
}
