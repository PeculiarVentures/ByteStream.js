import { it, assert } from "vitest";
import { ByteStream } from "./byte_stream";

const data = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a]);

//#region Aux function
function compareWithData(variable: ByteStream, name: string, testData = data, length = 10) {
  assert.strictEqual(variable.length, length, `${name}: Incorrect byteLength for _buffer value`);
  for (let i = 0; i < length; i++) {
    assert.strictEqual(
      variable.view[i],
      testData[i],
      `${name}: Incorrect value at index ${i} for view`,
    );
  }
}
//#endregion

it("ByteStream class tests", () => {
  const byteStreamClear = new ByteStream({});

  const byteStreamCopyEmpty = byteStreamClear.copy();
  compareWithData(
    byteStreamCopyEmpty,
    "byteStreamCopyEmpty",
    byteStreamClear.view,
    byteStreamClear.view.length,
  );

  assert.throws(
    () => byteStreamClear.copy(1, 1),
    Error,
    undefined,
    "Incorrect copy parameters must rise an Error",
  );

  const byteStreamSliceEmpty = byteStreamClear.slice();
  compareWithData(
    byteStreamSliceEmpty,
    "byteStreamSliceEmpty",
    byteStreamClear.view,
    byteStreamClear.view.length,
  );

  assert.throws(
    () => byteStreamClear.slice(1, 1),
    Error,
    undefined,
    "Incorrect slice parameters must rise an Error",
  );

  const byteStreamLength = new ByteStream({ length: 10 });
  compareWithData(
    byteStreamLength,
    "byteStreamLength",
    new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
    10,
  );

  const byteStreamStub = new ByteStream({ length: 10, stub: 0xff });
  compareWithData(
    byteStreamStub,
    "byteStreamStub",
    new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]),
    10,
  );

  const byteStreamView = new ByteStream({ view: data });
  compareWithData(byteStreamView, "byteStreamView");

  const byteStreamBuffer = new ByteStream({ buffer: data.buffer });
  compareWithData(byteStreamBuffer, "byteStreamBuffer");

  assert.strictEqual(
    byteStreamBuffer.isEqual(byteStreamView),
    true,
    "Incorrect comparison in isEqual",
  );
  assert.strictEqual(
    byteStreamBuffer.isEqualView(byteStreamView.view),
    true,
    "Incorrect comparison in isEqual",
  );

  const byteStreamString = new ByteStream({ string: "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A" });
  compareWithData(byteStreamString, "byteStreamString");
  assert.strictEqual(
    byteStreamString.toString(),
    "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A",
    "byteStreamString: Incorrect value for toString result #1",
  );
  assert.strictEqual(
    byteStreamString.toString(-1),
    "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A",
    "byteStreamString: Incorrect value for toString result #2",
  );
  assert.strictEqual(
    // oxlint-disable-next-line oxc/number-arg-out-of-range -- ByteStream#toString(start, length), not Number#toString(radix)
    byteStreamString.toString(0, 20),
    "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A",
    "byteStreamString: Incorrect value for toString result #3",
  );
  assert.strictEqual(
    // oxlint-disable-next-line oxc/number-arg-out-of-range -- ByteStream#toString(start, length), not Number#toString(radix)
    byteStreamString.toString(0, -1),
    "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A",
    "byteStreamString: Incorrect value for toString result #4",
  );
  assert.strictEqual(
    // oxlint-disable-next-line oxc/number-arg-out-of-range -- ByteStream#toString(start, length), not Number#toString(radix)
    byteStreamString.toString(0, 3),
    "\x01\x02\x03",
    "byteStreamString: Incorrect value for toString result #5",
  );

  const byteStreamCopy = byteStreamString.copy();
  compareWithData(
    byteStreamCopy,
    "byteStreamCopy",
    byteStreamString.view,
    byteStreamString.view.length,
  );

  const byteStreamSlice = byteStreamString.copy();
  compareWithData(
    byteStreamSlice,
    "byteStreamSlice",
    byteStreamString.view,
    byteStreamString.view.length,
  );

  const byteStreamCopyParameters = byteStreamString.copy(1, 3);
  assert.strictEqual(
    byteStreamCopyParameters.toHexString(),
    "020304",
    "byteStreamCopyParameters: Incorrect value after copy",
  );

  assert.strictEqual(
    byteStreamBuffer.isEqual(byteStreamCopyParameters),
    false,
    "Incorrect comparison in isEqual",
  );
  assert.strictEqual(
    byteStreamBuffer.isEqualView(byteStreamCopyParameters.view),
    false,
    "Incorrect comparison in isEqual",
  );
  assert.strictEqual(
    byteStreamBuffer.isEqual(
      new ByteStream({
        view: new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0c]),
      }),
    ),
    false,
    "Incorrect comparison in isEqual",
  );
  assert.strictEqual(
    byteStreamBuffer.isEqualView(
      new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0c]),
    ),
    false,
    "Incorrect comparison in isEqual",
  );

  const byteStreamSliceParameters = byteStreamString.slice(1, 4);
  assert.strictEqual(
    byteStreamSliceParameters.toHexString(),
    "020304",
    "byteStreamSliceParameters: Incorrect value after slice",
  );

  byteStreamString.realloc(11);
  compareWithData(
    byteStreamString,
    "byteStreamString",
    new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x00]),
    11,
  );

  byteStreamString.realloc(3);
  compareWithData(byteStreamString, "byteStreamString", new Uint8Array([0x01, 0x02, 0x03]), 3);

  byteStreamString.append(byteStreamString);
  compareWithData(
    byteStreamString,
    "byteStreamString",
    new Uint8Array([0x01, 0x02, 0x03, 0x01, 0x02, 0x03]),
    6,
  );

  const byteStreamHexString = new ByteStream({ hexstring: "0102030405060708090AFF" });
  compareWithData(
    byteStreamHexString,
    "byteStreamHexString",
    new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0xff]),
    11,
  );
  assert.strictEqual(
    byteStreamHexString.toHexString(),
    "0102030405060708090AFF",
    "byteStreamHexString: Incorrect value for toHexString result #1",
  );
  assert.strictEqual(
    byteStreamHexString.toHexString(-1),
    "0102030405060708090AFF",
    "byteStreamHexString: Incorrect value for toHexString result #2",
  );
  assert.strictEqual(
    byteStreamHexString.toHexString(0, 20),
    "0102030405060708090AFF",
    "byteStreamHexString: Incorrect value for toHexString result #3",
  );
  assert.strictEqual(
    byteStreamHexString.toHexString(0, -1),
    "0102030405060708090AFF",
    "byteStreamHexString: Incorrect value for toHexString result #4",
  );
  assert.strictEqual(
    byteStreamHexString.toHexString(0, 3),
    "010203",
    "byteStreamHexString: Incorrect value for toHexString result #5",
  );

  byteStreamString.realloc(3);
  assert.strictEqual(
    byteStreamString.insert(new ByteStream({ view: new Uint8Array([0xff, 0xff, 0xff]) }), 1, 2),
    true,
    "Incorrect result from insert method",
  );
  assert.strictEqual(
    byteStreamString.toHexString(),
    "01FFFF",
    "byteStreamString: Incorrect value after insert method #1",
  );
  assert.strictEqual(
    byteStreamString.insert(new ByteStream({ view: new Uint8Array([0xff, 0xff, 0xff]) }), 4, 2),
    false,
    "Incorrect result from insert method",
  );
  assert.strictEqual(
    byteStreamString.insert(new ByteStream({ view: new Uint8Array([0xff, 0xff]) }), 0, 4),
    true,
    "Incorrect result from insert method",
  );
  assert.strictEqual(
    byteStreamString.insert(new ByteStream({ view: new Uint8Array([0xff, 0xff]) })),
    true,
    "Incorrect result from insert method",
  );

  const dataStream = new ByteStream({
    view: new Uint8Array([0x20, 0x20, 0x21, 0x22, 0x23, 0x25]),
  });

  const separatorStream = new ByteStream({
    view: new Uint8Array([0x20]),
  });

  const separatorStream2 = new ByteStream({
    view: new Uint8Array([0x23]),
  });

  const separatorStream3 = new ByteStream({
    view: new Uint8Array([0x25]),
  });

  const separatorStream4 = new ByteStream({
    view: new Uint8Array([0x21, 0x22, 0x23]),
  });

  let result;

  result = dataStream.findFirstNotIn([separatorStream, separatorStream2]);
  assert.strictEqual(
    result.value.toHexString(),
    "2122",
    "Incorrect result for findFirstNotIn #1",
  );
  result = dataStream.findFirstNotIn([separatorStream]);
  assert.strictEqual(
    result.value.toHexString(),
    "21222325",
    "Incorrect result for findFirstNotIn #2",
  );
  result = dataStream.findFirstIn([separatorStream, separatorStream2]);
  assert.strictEqual(result.position, 1, "Incorrect result for findFirstIn #1");
  result = dataStream.findPattern(separatorStream);
  assert.strictEqual(result, 1, "Incorrect result for findPattern #1");
  result = dataStream.findPattern(separatorStream4);
  assert.strictEqual(result, 5, "Incorrect result for findPattern #2");
  result = dataStream.findFirstIn([separatorStream, separatorStream2]);
  assert.strictEqual(result.position, 1, "Incorrect result for findFirstIn #2");
  result = dataStream.findFirstNotIn([separatorStream, separatorStream2, separatorStream3]);
  assert.strictEqual(
    result.value.toHexString(),
    "2122",
    "Incorrect result for findFirstNotIn #2",
  );

  const string =
    "startxref123a\n\
1908\n\
%%EOF";

  const bufferStream = new ByteStream({
    string,
  });

  const digits_0_stream = new ByteStream({
    view: new Uint8Array([0x30]),
  });

  const digits_1_stream = new ByteStream({
    view: new Uint8Array([0x31]),
  });

  const digits_2_stream = new ByteStream({
    view: new Uint8Array([0x32]),
  });

  const digits_3_stream = new ByteStream({
    view: new Uint8Array([0x33]),
  });

  const digits_4_stream = new ByteStream({
    view: new Uint8Array([0x34]),
  });

  const digits_5_stream = new ByteStream({
    view: new Uint8Array([0x35]),
  });

  const digits_6_stream = new ByteStream({
    view: new Uint8Array([0x36]),
  });

  const digits_7_stream = new ByteStream({
    view: new Uint8Array([0x37]),
  });

  const digits_8_stream = new ByteStream({
    view: new Uint8Array([0x38]),
  });

  const digits_9_stream = new ByteStream({
    view: new Uint8Array([0x39]),
  });

  result = bufferStream.skipNotPatterns(
    [
      digits_0_stream,
      digits_1_stream,
      digits_2_stream,
      digits_3_stream,
      digits_4_stream,
      digits_5_stream,
      digits_6_stream,
      digits_7_stream,
      digits_8_stream,
      digits_9_stream,
    ],
    null,
    null,
    true,
  );

  result = bufferStream.findFirstSequence(
    [
      digits_0_stream,
      digits_1_stream,
      digits_2_stream,
      digits_3_stream,
      digits_4_stream,
      digits_5_stream,
      digits_6_stream,
      digits_7_stream,
      digits_8_stream,
      digits_9_stream,
    ],
    null,
    null,
    true,
  );

  assert.strictEqual(
    result.value.toHexString(),
    "31393038",
    "Incorrect value for findFirstSequence #1",
  );

  result = bufferStream.findAllSequences([
    digits_0_stream,
    digits_1_stream,
    digits_2_stream,
    digits_3_stream,
    digits_4_stream,
    digits_5_stream,
    digits_6_stream,
    digits_7_stream,
    digits_8_stream,
    digits_9_stream,
  ]);

  assert.strictEqual(result.length, 2, "Incorrect length for result of findAllSequences #1");
  assert.strictEqual(
    result[0].value.toHexString(),
    "313233",
    "Incorrect value[0] for result of findAllSequences #1",
  );
  assert.strictEqual(
    result[1].value.toHexString(),
    "31393038",
    "Incorrect value[1] for result of findAllSequences #1",
  );

  result = bufferStream.findAllIn([
    digits_0_stream,
    digits_1_stream,
    digits_2_stream,
    digits_3_stream,
    digits_4_stream,
    digits_5_stream,
    digits_6_stream,
    digits_7_stream,
    digits_8_stream,
    digits_9_stream,
  ]);

  assert.strictEqual(result.length, 7, "Incorrect length for result of findAllIn #1");
  assert.strictEqual(result[0].id, 1, "Incorrect id[0] for result of findAllIn #1");
  assert.strictEqual(result[0].position, 10, "Incorrect position[0] for result of findAllIn #1");
  assert.strictEqual(result[1].id, 2, "Incorrect id[1] for result of findAllIn #1");
  assert.strictEqual(result[1].position, 11, "Incorrect position[1] for result of findAllIn #1");
  assert.strictEqual(result[2].id, 3, "Incorrect id[2] for result of findAllIn #1");
  assert.strictEqual(result[2].position, 12, "Incorrect position[2] for result of findAllIn #1");
  assert.strictEqual(result[3].id, 1, "Incorrect id[3] for result of findAllIn #1");
  assert.strictEqual(result[3].position, 15, "Incorrect position[3] for result of findAllIn #1");
  assert.strictEqual(result[4].id, 9, "Incorrect id[4] for result of findAllIn #1");
  assert.strictEqual(result[4].position, 16, "Incorrect position[4] for result of findAllIn #1");
  assert.strictEqual(result[5].id, 0, "Incorrect id[5] for result of findAllIn #1");
  assert.strictEqual(result[5].position, 17, "Incorrect position[5] for result of findAllIn #1");
  assert.strictEqual(result[6].id, 8, "Incorrect id[6] for result of findAllIn #1");
  assert.strictEqual(result[6].position, 18, "Incorrect position[6] for result of findAllIn #1");

  result = bufferStream.findAllNotIn([
    digits_0_stream,
    digits_1_stream,
    digits_2_stream,
    digits_3_stream,
    digits_4_stream,
    digits_5_stream,
    digits_6_stream,
    digits_7_stream,
    digits_8_stream,
    digits_9_stream,
  ]);

  assert.strictEqual(
    result[0].value.toHexString(),
    "737461727478726566",
    "Incorrect value[0] for result of findAllNotIn #1",
  );
  assert.strictEqual(
    result[1].value.toHexString(),
    "610A",
    "Incorrect value[1] for result of findAllNotIn #1",
  );
  assert.strictEqual(
    result[2].value.toHexString(),
    "0A2525454F46",
    "Incorrect value[2] for result of findAllNotIn #1",
  );

  const digits = [
    digits_0_stream,
    digits_1_stream,
    digits_2_stream,
    digits_3_stream,
    digits_4_stream,
    digits_5_stream,
    digits_6_stream,
    digits_7_stream,
    digits_8_stream,
    digits_9_stream,
    new ByteStream({
      view: new Uint8Array([
        0x2b, // "+"
      ]),
    }),
    new ByteStream({
      view: new Uint8Array([
        0x2d, // "-"
      ]),
    }),
  ];

  const xref =
    "xref\n\
          0 -19\n\
          0000000000 65535 f\n\
          0000000262 00000 n\n\
          0000001461 00000 n\n\
          0000000009 00000 n\n\
          0000000117 00000 n\n\
          0000000319 00000 n\n\
          0000000409 00000 n\n\
          0000000504 00000 n\n\
          0000000602 00000 n\n\
          0000000704 00000 n\n\
          0000000792 00000 n\n\
          0000000886 00000 n\n\
          0000000983 00000 n\n\
          0000001084 00000 n\n\
          0000001177 00000 n\n\
          0000001269 00000 n\n\
          0000001363 00000 n\n\
          0000001685 00000 n\n\
          0000001804 00000 n\n\
          trailer\n\
          ";

  const xrefStream = new ByteStream({
    string: xref,
  });

  result = xrefStream.findFirstIn([
    new ByteStream({
      string: "xref",
    }),
  ]);

  result = xrefStream.findFirstSequence(digits, result.position);

  assert.strictEqual(
    parseInt(result.value.toString(), 10),
    0,
    "Incorrect value #1 in parsing XRef",
  );

  result = xrefStream.findFirstSequence(digits, result.position);

  assert.strictEqual(
    parseInt(result.value.toString(), 10),
    -19,
    "Incorrect value #2 in parsing XRef",
  );

  result = xrefStream.findFirstSequence(digits, result.position);

  assert.strictEqual(
    parseInt(result.value.toString(), 10),
    0,
    "Incorrect value #3 in parsing XRef",
  );

  result = xrefStream.findFirstSequence(digits, result.position);

  assert.strictEqual(
    parseInt(result.value.toString(), 10),
    65535,
    "Incorrect value #4 in parsing XRef",
  );

  result = xrefStream.findFirstSequence(digits, result.position);
  result = xrefStream.findFirstSequence(digits, result.position);

  result = xrefStream.findFirstSequence(digits, result.position);

  assert.strictEqual(
    parseInt(result.value.toString(), 10),
    1461,
    "Incorrect value #5 in parsing XRef",
  );

  const pairedStream = new ByteStream({
    string: "<<[1[1][1]]>>",
  });

  result = pairedStream.findPairedPatterns(
    new ByteStream({
      string: "[",
    }),
    new ByteStream({
      string: "]",
    }),
  );

  assert.strictEqual(result.length, 3, "Incorrect length for findPairedPatterns #1");
  assert.strictEqual(result[0].left, 3, "Incorrect left[0] for findPairedPatterns #1");
  assert.strictEqual(result[0].right, 11, "Incorrect right[0] for findPairedPatterns #1");
  assert.strictEqual(result[1].left, 5, "Incorrect left[1] for findPairedPatterns #1");
  assert.strictEqual(result[1].right, 7, "Incorrect right[1] for findPairedPatterns #1");
  assert.strictEqual(result[2].left, 8, "Incorrect left[2] for findPairedPatterns #1");
  assert.strictEqual(result[2].right, 10, "Incorrect right[2] for findPairedPatterns #1");

  result = pairedStream.findPairedArrays(
    [new ByteStream({ string: "[" }), new ByteStream({ string: "<<" })],
    [new ByteStream({ string: "]" }), new ByteStream({ string: ">>" })],
  );

  assert.strictEqual(result.length, 4, "Incorrect length for findPairedArrays #1");
  assert.strictEqual(result[0].left.id, 1, "Incorrect left.id[0] for findPairedArrays #1");
  assert.strictEqual(result[0].left.position, 2, "Incorrect left[0] for findPairedArrays #1");
  assert.strictEqual(result[0].right.id, 1, "Incorrect right.id[0] for findPairedArrays #1");
  assert.strictEqual(result[0].right.position, 13, "Incorrect right[0] for findPairedArrays #1");
  assert.strictEqual(result[1].left.id, 0, "Incorrect left.id[1] for findPairedArrays #1");
  assert.strictEqual(result[1].left.position, 3, "Incorrect left[1] for findPairedArrays #1");
  assert.strictEqual(result[1].right.id, 0, "Incorrect right.id[1] for findPairedArrays #1");
  assert.strictEqual(result[1].right.position, 11, "Incorrect right[1] for findPairedArrays #1");
  assert.strictEqual(result[2].left.id, 0, "Incorrect left.id[2] for findPairedArrays #1");
  assert.strictEqual(result[2].left.position, 5, "Incorrect left[2] for findPairedArrays #1");
  assert.strictEqual(result[2].right.id, 0, "Incorrect right.id[2] for findPairedArrays #1");
  assert.strictEqual(result[2].right.position, 7, "Incorrect right[2] for findPairedArrays #1");
  assert.strictEqual(result[3].left.id, 0, "Incorrect left.id[3] for findPairedArrays #1");
  assert.strictEqual(result[3].left.position, 8, "Incorrect left[3] for findPairedArrays #1");
  assert.strictEqual(result[3].right.id, 0, "Incorrect right.id[3] for findPairedArrays #1");
  assert.strictEqual(result[3].right.position, 10, "Incorrect right[3] for findPairedArrays #1");

  result = pairedStream.findAllPatternIn(new ByteStream({ string: "[" }));

  assert(
    !(typeof result === "number"),
    "Incorrect result type for findAllPatternIn #1. Result must be number array",
  );
  assert.strictEqual(result.length, 3, "Incorrect length for findAllPatternIn #1");
  assert.strictEqual(result[0], 3, "Incorrect value[0] for findAllPatternIn #1");
  assert.strictEqual(result[1], 5, "Incorrect value[1] for findAllPatternIn #1");
  assert.strictEqual(result[2], 8, "Incorrect value[2] for findAllPatternIn #1");

  result = pairedStream.replacePattern(
    new ByteStream({ string: "<<[" }),
    new ByteStream({ string: "<" }),
  );
  result = pairedStream.replacePattern(
    new ByteStream({ string: "]>>" }),
    new ByteStream({ string: ">" }),
  );

  assert.strictEqual(
    pairedStream.toString(),
    "<1[1][1]>",
    "Incorrect value after replacePattern",
  );
});
