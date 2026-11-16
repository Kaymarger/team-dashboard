import assert from "node:assert/strict";
import test from "node:test";
import { previewDashboard } from "./preview-dashboard";

test("preview data stays off unless a local flag is set", () => {
  const previous = process.env.DASHBOARD_PREVIEW;
  delete process.env.DASHBOARD_PREVIEW;
  assert.equal(previewDashboard(), null);
  if (previous === undefined) delete process.env.DASHBOARD_PREVIEW;
  else process.env.DASHBOARD_PREVIEW = previous;
});

test("preview data is never returned in production", () => {
  const env = process.env as Record<string, string | undefined>;
  const previousNode = env.NODE_ENV;
  const previousFlag = env.DASHBOARD_PREVIEW;
  env.NODE_ENV = "production";
  env.DASHBOARD_PREVIEW = "1";
  assert.equal(previewDashboard(), null);
  env.NODE_ENV = previousNode;
  if (previousFlag === undefined) delete env.DASHBOARD_PREVIEW;
  else env.DASHBOARD_PREVIEW = previousFlag;
});
