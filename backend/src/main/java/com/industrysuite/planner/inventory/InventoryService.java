package com.industrysuite.planner.inventory;

import com.industrysuite.planner.inventory.dto.InventoryResponse;
import com.industrysuite.planner.inventory.dto.InventoryUpsertRequest;
import com.industrysuite.planner.inventory.dto.InventoryCategoryResponse;
import com.industrysuite.planner.warehouses.Warehouse;
import com.industrysuite.planner.warehouses.WarehouseRepository;
import com.industrysuite.planner.warehouses.dto.WarehouseResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
@SuppressWarnings("null")
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryCategoryRepository categoryRepository;
    private final WarehouseRepository warehouseRepository;

    public InventoryService(InventoryRepository inventoryRepository, InventoryCategoryRepository categoryRepository, WarehouseRepository warehouseRepository) {
        this.inventoryRepository = inventoryRepository;
        this.categoryRepository = categoryRepository;
        this.warehouseRepository = warehouseRepository;
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getAll() {
        return inventoryRepository.findAll()
                .stream()
                .sorted(Comparator
                        .comparing(
                                (InventoryItem item) -> item.getCategory() != null ? item.getCategory().getName() : "")
                        .thenComparing(InventoryItem::getName))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public InventoryResponse create(InventoryUpsertRequest request) {
        validateQuantities(request.quantityTotal(), request.quantityReserved());

        String sku = request.sku().trim().toUpperCase();
        if (inventoryRepository.existsBySkuIgnoreCase(sku)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists");
        }

        InventoryItem item = new InventoryItem();
        applyRequest(item, request);
        return toResponse(inventoryRepository.save(item));
    }

    @Transactional
    public InventoryResponse update(Long id, InventoryUpsertRequest request) {
        validateQuantities(request.quantityTotal(), request.quantityReserved());

        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventory item not found"));

        String sku = request.sku().trim().toUpperCase();
        inventoryRepository.findAll().stream()
                .filter(existing -> existing.getSku().equalsIgnoreCase(sku))
                .filter(existing -> !existing.getId().equals(id))
                .findAny()
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists");
                });

        applyRequest(item, request);
        return toResponse(inventoryRepository.save(item));
    }

    @Transactional
    public void delete(Long id) {
        InventoryItem item = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventory item not found"));
        inventoryRepository.delete(item);
    }

    private void applyRequest(InventoryItem item, InventoryUpsertRequest request) {
        item.setSku(request.sku().trim().toUpperCase());
        item.setName(request.name().trim());
        if (request.categoryId() != null) {
            InventoryCategory category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid category ID"));
            item.setCategory(category);
        } else {
            item.setCategory(null);
        }

        Warehouse warehouse = warehouseRepository.findById(request.warehouseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid warehouse ID"));
        item.setWarehouse(warehouse);

        item.setQuantityTotal(request.quantityTotal());
        item.setQuantityReserved(request.quantityReserved());
        item.setStatus(request.status());
    }

    private void validateQuantities(int quantityTotal, int quantityReserved) {
        if (quantityReserved > quantityTotal) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "quantityReserved cannot exceed quantityTotal");
        }
    }

    private InventoryResponse toResponse(InventoryItem item) {
        InventoryCategoryResponse categoryDto = null;
        if (item.getCategory() != null) {
            categoryDto = new InventoryCategoryResponse(item.getCategory().getId(), item.getCategory().getName());
        }

        return new InventoryResponse(
                item.getId(),
                item.getSku(),
                item.getName(),
                categoryDto,
                new WarehouseResponse(item.getWarehouse().getId(), item.getWarehouse().getName()),
                item.getQuantityTotal(),
                item.getQuantityReserved(),
                item.getQuantityTotal() - item.getQuantityReserved(),
                item.getStatus());
    }
}
