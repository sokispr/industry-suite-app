package com.industrysuite.planner.warehouses;

import com.industrysuite.planner.warehouses.dto.WarehouseResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public WarehouseService(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    @Transactional(readOnly = true)
    public List<WarehouseResponse> getAll() {
        return warehouseRepository.findAll().stream()
                .map(warehouse -> new WarehouseResponse(warehouse.getId(), warehouse.getName()))
                .toList();
    }
}
