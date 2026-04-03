package com.industrysuite.planner.events;

public enum EventStatus {
    PLANNED("#3b82f6"),
    CONFIRMED("#16a34a"),
    IN_PROGRESS("#f59e0b"),
    COMPLETED("#334155"),
    CANCELED("#ef4444");

    private final String defaultColor;

    EventStatus(String defaultColor) {
        this.defaultColor = defaultColor;
    }

    public String getDefaultColor() {
        return defaultColor;
    }
}
