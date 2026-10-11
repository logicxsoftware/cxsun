import assert from "node:assert/strict";
import test from "node:test";
import type { LiveEnquiryOptions, LiveEnquiryRecord } from "./enquiry.read-source.js";
import { remoteViewJob, remoteViewRecord } from "./enquiry.view-model.js";

const record = {
  name: "ENQ27",
  title: "Service call",
  details: "Service call",
  customer: null,
  mobile: "9994885548",
  date: "2026-10-01",
  dueDate: null,
  group: null,
  creator: "Vijay",
  assignee: "Karthik",
  priority: "Normal",
  status: "Open",
  statusDetails: null,
  createdAt: "2026-10-11 23:30:00",
  modifiedAt: "2026-10-12 00:30:00"
} satisfies LiveEnquiryRecord;

test("Frappe timestamps use India time instead of the API server time zone", () => {
  const view = remoteViewRecord(record);
  assert.equal(view.createdAt, "2026-10-11T18:00:00.000Z");
  assert.equal(view.updatedAt, "2026-10-11T19:00:00.000Z");
});

test("overnight job uses its own creation date instead of the enquiry date", () => {
  const options: LiveEnquiryOptions = {
    groups: [],
    statuses: [],
    employees: [{ code: "HR-EMP-00011", name: "Karthik" }],
    customers: [],
    suppliers: []
  };
  const view = remoteViewJob(
    {
      name: "JOB-1",
      createdAt: "2026-10-11 23:30:00",
      employee: "HR-EMP-00011",
      startTime: "23:30:00",
      stopTime: "00:30:00",
      status: "Completed",
      hours: 1,
      totalCost: 100,
      ratePerHour: 100
    },
    record,
    options
  );
  assert.equal(view.startAt, "2026-10-11T18:00:00.000Z");
  assert.equal(view.stopAt, "2026-10-11T19:00:00.000Z");
  assert.equal(view.durationSeconds, 3600);
});
