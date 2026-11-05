import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import { InvoiceStatus } from "@/backend";

import InvoiceStatusPill from "../InvoiceStatusPill.vue";

vi.mock("fluent-vue", () => ({ useFluent: () => ({ $t: (key: string) => key }) }));

describe("InvoiceStatusPill", () => {
  it.each([
    [InvoiceStatus.Open, "group-detail-invoice-open"],
    [InvoiceStatus.Settled, "group-detail-invoice-settled"],
  ])("shows the text of %s", (status, key) => {
    expect(mount(InvoiceStatusPill, { props: { status } }).text()).toBe(key);
  });
});
