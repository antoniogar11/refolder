import { describe, it, expect } from "vitest";
import { estimateSchema } from "@/lib/validations/estimate";
import { clientSchema } from "@/lib/validations/client";
import { projectSchema } from "@/lib/validations/project";

describe("estimateSchema", () => {
  const validEstimate = {
    name: "Presupuesto reforma baño",
    total_amount: "1500.50",
    status: "draft",
    description: "",
    valid_until: "",
  };

  it("accepts valid data", () => {
    const result = estimateSchema.safeParse(validEstimate);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Presupuesto reforma baño");
      expect(result.data.total_amount).toBe(1500.50);
      expect(result.data.status).toBe("draft");
    }
  });

  it("rejects empty name", () => {
    const result = estimateSchema.safeParse({ ...validEstimate, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = estimateSchema.safeParse({
      ...validEstimate,
      total_amount: "-100",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = estimateSchema.safeParse({
      ...validEstimate,
      status: "invalid_status",
    });
    expect(result.success).toBe(false);
  });

  it("transforms empty description to null", () => {
    const result = estimateSchema.safeParse(validEstimate);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
    }
  });

  it("accepts all valid statuses", () => {
    for (const status of ["draft", "sent", "accepted", "rejected"]) {
      const result = estimateSchema.safeParse({ ...validEstimate, status });
      expect(result.success).toBe(true);
    }
  });
});

describe("clientSchema", () => {
  const validClient = {
    name: "Juan Pérez",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    tax_id: "",
    notes: "",
  };

  it("accepts valid data with only name", () => {
    const result = clientSchema.safeParse(validClient);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Juan Pérez");
      expect(result.data.email).toBeNull();
    }
  });

  it("rejects empty name", () => {
    const result = clientSchema.safeParse({ ...validClient, name: "" });
    expect(result.success).toBe(false);
  });

  it("accepts valid email", () => {
    const result = clientSchema.safeParse({
      ...validClient,
      email: "juan@example.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("juan@example.com");
    }
  });

  it("rejects invalid email", () => {
    const result = clientSchema.safeParse({
      ...validClient,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid 5-digit postal code", () => {
    const result = clientSchema.safeParse({
      ...validClient,
      postal_code: "28001",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.postal_code).toBe("28001");
    }
  });

  it("rejects invalid postal code", () => {
    const result = clientSchema.safeParse({
      ...validClient,
      postal_code: "123",
    });
    expect(result.success).toBe(false);
  });

  it("transforms empty fields to null", () => {
    const result = clientSchema.safeParse(validClient);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeNull();
      expect(result.data.address).toBeNull();
      expect(result.data.notes).toBeNull();
    }
  });
});

describe("projectSchema", () => {
  const validProject = {
    name: "Reforma integral piso",
    client_id: "client-123",
    description: "",
    address: "Calle Mayor 5, Madrid",
    status: "planning",
    start_date: "",
    estimated_end_date: "",
    total_budget: "",
  };

  it("accepts valid data", () => {
    const result = projectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Reforma integral piso");
      expect(result.data.client_id).toBe("client-123");
      expect(result.data.status).toBe("planning");
    }
  });

  it("rejects empty name", () => {
    const result = projectSchema.safeParse({ ...validProject, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty client_id", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      client_id: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty address", () => {
    const result = projectSchema.safeParse({ ...validProject, address: "" });
    expect(result.success).toBe(false);
  });

  it("accepts valid budget", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      total_budget: "50000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.total_budget).toBe(50000);
    }
  });

  it("rejects negative budget", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      total_budget: "-1000",
    });
    expect(result.success).toBe(false);
  });

  it("transforms empty budget to null", () => {
    const result = projectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.total_budget).toBeNull();
    }
  });

  it("accepts all valid statuses", () => {
    for (const status of ["planning", "in_progress", "paused", "completed", "cancelled"]) {
      const result = projectSchema.safeParse({ ...validProject, status });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    const result = projectSchema.safeParse({
      ...validProject,
      status: "invalid",
    });
    expect(result.success).toBe(false);
  });
});
