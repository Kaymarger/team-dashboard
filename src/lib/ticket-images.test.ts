import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_ENCODED_CHARS,
  SCREENSHOT_CHUNK_CHARS,
  createTicketId,
  jpegFilename,
  prepareScreenshots,
  screenshotHeaders,
  screenshotRow,
  splitBase64,
} from "./ticket-images";

test("screenshot base64 splits into 45000 character cells", () => {
  const data = "abcd".repeat(20_000);
  const chunks = splitBase64(data);
  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].length, SCREENSHOT_CHUNK_CHARS);
  assert.equal(chunks.join(""), data);
});

test("ticket screenshots use one row and chunk_1 onward", () => {
  const shot = prepareScreenshots([{ filename: "Kitchen Photo.PNG", base64: "aaaa" }])[0];
  const headers = screenshotHeaders(shot.chunks.length);
  assert.deepEqual(headers, [
    "ticket_id",
    "image_index",
    "filename",
    "mime_type",
    "chunk_count",
    "chunk_1",
  ]);
  const row = screenshotRow("T123abc", 1, shot);
  assert.equal(row.filename, "Kitchen Photo.jpg");
  assert.equal(row.mime_type, "image/jpeg");
  assert.equal(row.image_index, "1");
  assert.equal(row.chunk_count, "1");
  assert.equal(row.chunk_1, "aaaa");
});

test("more than about 1.5 MB of encoded screenshots is rejected", () => {
  const base64 = "aaaa".repeat(Math.ceil((MAX_ENCODED_CHARS + 4) / 4));
  assert.throws(
    () => prepareScreenshots([{ filename: "big.jpg", base64 }]),
    /too large to send/,
  );
});

test("ticket ids start with T, the time, and a suffix", () => {
  assert.equal(createTicketId(1700000000000, "ab12cd"), "T1700000000000ab12cd");
});

test("jpeg names stay safe", () => {
  assert.equal(jpegFilename("../../shot.HEIC"), "shot.jpg");
  assert.equal(jpegFilename(""), "screenshot.jpg");
});
