package com.industrysuite.planner.events;

import com.industrysuite.planner.employees.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_assignments")
public class EventAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private PlannedEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "duty_role", length = 120)
    private String dutyRole;

    @Column(length = 255)
    private String notes;

    @Column(name = "shift_start_at")
    private LocalDateTime shiftStartAt;

    @Column(name = "shift_end_at")
    private LocalDateTime shiftEndAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PlannedEvent getEvent() {
        return event;
    }

    public void setEvent(PlannedEvent event) {
        this.event = event;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public String getDutyRole() {
        return dutyRole;
    }

    public void setDutyRole(String dutyRole) {
        this.dutyRole = dutyRole;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getShiftStartAt() {
        return shiftStartAt;
    }

    public void setShiftStartAt(LocalDateTime shiftStartAt) {
        this.shiftStartAt = shiftStartAt;
    }

    public LocalDateTime getShiftEndAt() {
        return shiftEndAt;
    }

    public void setShiftEndAt(LocalDateTime shiftEndAt) {
        this.shiftEndAt = shiftEndAt;
    }
}
