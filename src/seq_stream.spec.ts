import { describe, it, assert } from "vitest";
import { ByteStream } from "./byte_stream";
import { SeqStream } from "./seq_stream";

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

describe("SeqStream class", () => {
  describe("numbers", () => {
    [
      // uint16
      { value: 65535, hex: "ffff", type: "uint16" },
      { value: 32768, hex: "8000", type: "uint16" },
      { value: 32767, hex: "7fff", type: "uint16" },
      { value: 1, hex: "0001", type: "uint16" },
      // int16
      { value: -1, hex: "ffff", type: "int16" },
      { value: -32768, hex: "8000", type: "int16" },
      { value: 32767, hex: "7fff", type: "int16" },
      { value: 1, hex: "0001", type: "int16" },
      // uint32
      { value: 4294967295, hex: "ffffffff", type: "uint32" },
      { value: 2147483648, hex: "80000000", type: "uint32" },
      { value: 2147483647, hex: "7fffffff", type: "uint32" },
      { value: 1, hex: "00000001", type: "uint32" },
      // int32
      { value: -1, hex: "ffffffff", type: "int32" },
      { value: -2147483648, hex: "80000000", type: "int32" },
      { value: 2147483647, hex: "7fffffff", type: "int32" },
      { value: 1, hex: "00000001", type: "int32" },
      // uint24
      // uint32
      { value: 16777215, hex: "ffffff", type: "uint24" },
      { value: 8388608, hex: "800000", type: "uint24" },
      { value: 8388607, hex: "7fffff", type: "uint24" },
      { value: 1, hex: "000001", type: "uint24" },
    ].forEach((vector) => {
      it(`${vector.type} ${vector.value}`, () => {
        const seq = new SeqStream({ hexstring: vector.hex });
        let num = 0;
        switch (vector.type) {
          case "int16":
            num = seq.getInt16();
            break;
          case "uint16":
            num = seq.getUint16();
            break;
          case "uint32":
            num = seq.getUint32();
            break;
          case "int32":
            num = seq.getInt32();
            break;
          case "uint24":
            num = seq.getUint24();
            break;
          default:
            throw new Error("Unknown type of the test vector");
        }

        assert.strictEqual(num, vector.value, "Incorrect decoded number");
      });
    });
  });

  it("tests", () => {
    const seqStreamStream = new SeqStream({
      stream: new ByteStream({ view: data }),
      backward: true,
      appendBlock: 1000,
    });
    compareWithData(seqStreamStream.stream, "seqStreamStream.stream");
    assert.strictEqual(seqStreamStream.backward, true, "Incorrect backward initialization");
    assert.strictEqual(seqStreamStream.length, 10, "Incorrect length initialization");
    assert.strictEqual(seqStreamStream.start, 10, "Incorrect start initialization");
    assert.strictEqual(seqStreamStream.appendBlock, 1000, "Incorrect appendBlock initialization");

    const seqStreamUpdateSeq = new SeqStream();

    seqStreamUpdateSeq.appendUint24(123);
    /*
					seqStreamUpdateSeq.start = 1;
					seqStreamUpdateSeq.length = 3;
					const uint24 = seqStreamUpdateSeq.getUint24();
			*/

    const seqStreamUpdate = new SeqStream();

    seqStreamUpdate.appendUint16(123);
    seqStreamUpdate.start = 0;
    seqStreamUpdate.length = 2;
    assert.strictEqual(seqStreamUpdate.getUint16(), 123, "Incorrect data on getUint16");

    seqStreamUpdate.stream.clear();
    seqStreamUpdate.start = 0;
    seqStreamUpdate.length = 0;

    seqStreamUpdate.appendUint32(123);
    seqStreamUpdate.start = 0;
    seqStreamUpdate.length = 4;
    assert.strictEqual(seqStreamUpdate.getUint32(), 123, "Incorrect data on getUint32");

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

    const seqStreamData = new SeqStream({ stream: dataStream });

    let result: any = seqStreamData.findPattern(new ByteStream({ view: new Uint8Array([0x21]) }));

    assert.strictEqual(result, 3, "Incorrect result after SeqStream findPattern #1");
    assert.strictEqual(
      seqStreamData.start,
      3,
      "Incorrect start value after SeqStream findPattern #1",
    );
    assert.strictEqual(
      seqStreamData.length,
      3,
      "Incorrect length value after SeqStream findPattern #1",
    );

    result = seqStreamData.findFirstNotIn([separatorStream2, separatorStream3]);

    assert.strictEqual(
      result.value.toHexString(),
      "22",
      "Incorrect result after SeqStream findFirstNotIn #1",
    );
    assert.strictEqual(
      seqStreamData.start,
      5,
      "Incorrect start value after SeqStream findPattern #1",
    );
    assert.strictEqual(
      seqStreamData.length,
      1,
      "Incorrect length value after SeqStream findPattern #1",
    );

    seqStreamData.start = 0;
    seqStreamData.length = dataStream.length;

    result = dataStream.findFirstNotIn([separatorStream, separatorStream2]);
    assert.strictEqual(
      result.value.toHexString(),
      "2122",
      "Incorrect result for SeqStream findFirstNotIn #1",
    );

    seqStreamData.start = 0;
    seqStreamData.length = dataStream.length;

    result = dataStream.findFirstNotIn([separatorStream]);
    assert.strictEqual(
      result.value.toHexString(),
      "21222325",
      "Incorrect result for SeqStream findFirstNotIn #2",
    );

    seqStreamData.start = 0;
    seqStreamData.length = dataStream.length;

    result = dataStream.findFirstIn([separatorStream, separatorStream2]);
    assert.strictEqual(result.position, 1, "Incorrect result for SeqStream findFirstIn #1");

    seqStreamData.start = 0;
    seqStreamData.length = dataStream.length;

    result = dataStream.findPattern(separatorStream);
    assert.strictEqual(result, 1, "Incorrect result for SeqStream findPattern #1");

    seqStreamData.start = 0;
    seqStreamData.length = dataStream.length;

    result = dataStream.findPattern(separatorStream4);
    assert.strictEqual(result, 5, "Incorrect result for SeqStream findPattern #2");

    seqStreamData.start = 0;
    seqStreamData.length = dataStream.length;

    result = dataStream.findFirstIn([separatorStream, separatorStream2]);
    assert.strictEqual(result.position, 1, "Incorrect result for SeqStream findFirstIn #2");

    seqStreamData.start = 0;
    seqStreamData.length = dataStream.length;

    result = dataStream.findFirstNotIn([separatorStream, separatorStream2, separatorStream3]);
    assert.strictEqual(
      result.value.toHexString(),
      "2122",
      "Incorrect result for SeqStream findFirstNotIn #2",
    );

    const string =
      "startxref123a\n\
1908\n\
%%EOF";

    const bufferStream = new ByteStream({
      string,
    });

    const seqStreamBuffer = new SeqStream({ stream: bufferStream });

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

    result = seqStreamBuffer.skipNotPatterns([
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

    result = seqStreamBuffer.findFirstSequence([
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
      result.value.toHexString(),
      "313233",
      "Incorrect value for findFirstSequence #1",
    );

    seqStreamBuffer.start = 0;
    seqStreamBuffer.length = bufferStream.length;

    result = seqStreamBuffer.findAllSequences([
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

    seqStreamBuffer.start = 0;
    seqStreamBuffer.length = bufferStream.length;

    result = seqStreamBuffer.findAllIn([
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
    assert.strictEqual(
      result[0].position,
      10,
      "Incorrect position[0] for result of findAllIn #1",
    );
    assert.strictEqual(result[1].id, 2, "Incorrect id[1] for result of findAllIn #1");
    assert.strictEqual(
      result[1].position,
      11,
      "Incorrect position[1] for result of findAllIn #1",
    );
    assert.strictEqual(result[2].id, 3, "Incorrect id[2] for result of findAllIn #1");
    assert.strictEqual(
      result[2].position,
      12,
      "Incorrect position[2] for result of findAllIn #1",
    );
    assert.strictEqual(result[3].id, 1, "Incorrect id[3] for result of findAllIn #1");
    assert.strictEqual(
      result[3].position,
      15,
      "Incorrect position[3] for result of findAllIn #1",
    );
    assert.strictEqual(result[4].id, 9, "Incorrect id[4] for result of findAllIn #1");
    assert.strictEqual(
      result[4].position,
      16,
      "Incorrect position[4] for result of findAllIn #1",
    );
    assert.strictEqual(result[5].id, 0, "Incorrect id[5] for result of findAllIn #1");
    assert.strictEqual(
      result[5].position,
      17,
      "Incorrect position[5] for result of findAllIn #1",
    );
    assert.strictEqual(result[6].id, 8, "Incorrect id[6] for result of findAllIn #1");
    assert.strictEqual(
      result[6].position,
      18,
      "Incorrect position[6] for result of findAllIn #1",
    );

    seqStreamBuffer.start = 0;
    seqStreamBuffer.length = bufferStream.length;

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
  });
});

describe("SeqStream", () => {
  describe("findPattern", () => {
    it("exists", () => {
      const seqStream = new SeqStream({
        view: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 0]),
      });

      const pattern = new ByteStream({ view: new Uint8Array([7]) });
      const res = seqStream.findPattern(pattern);
      assert.strictEqual(res, 7);
    });

    it("not found", () => {
      const seqStream = new SeqStream({
        view: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 0]),
      });

      const pattern = new ByteStream({ view: new Uint8Array([10]) });
      const res = seqStream.findPattern(pattern);
      assert.strictEqual(res, -1);
    });

    it("gap", () => {
      const seqStream = new SeqStream({
        view: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 0]),
      });

      const pattern = new ByteStream({ view: new Uint8Array([7]) });
      const res = seqStream.findPattern(pattern, 5);
      assert.strictEqual(res, -1);
    });

    it("gap + backward", () => {
      const seqStream = new SeqStream({
        view: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 0]),
        backward: true,
      });

      const pattern = new ByteStream({ view: new Uint8Array([2]) });
      const res = seqStream.findPattern(pattern, 5);
      assert.strictEqual(res, -1);
    });
  });

  describe("findFirstIn", () => {
    it("exists", () => {
      const seqStream = new SeqStream({
        view: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 0]),
      });

      const res = seqStream.findFirstIn([
        new ByteStream({ view: new Uint8Array([7]) }),
        new ByteStream({ view: new Uint8Array([3]) }),
      ]);
      assert.strictEqual(res.id, 1);
      assert.strictEqual(res.position, 3);
    });

    it("not found", () => {
      const seqStream = new SeqStream({
        view: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 0]),
      });

      const res = seqStream.findFirstIn([
        new ByteStream({ view: new Uint8Array([10]) }),
        new ByteStream({ view: new Uint8Array([11]) }),
      ]);
      assert.strictEqual(res.id, -1);
    });

    it("gap", () => {
      const seqStream = new SeqStream({
        view: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 0]),
      });

      const res = seqStream.findFirstIn(
        [
          new ByteStream({ view: new Uint8Array([7]) }),
          new ByteStream({ view: new Uint8Array([3]) }),
        ],
        1,
      );
      assert.strictEqual(res.id, -1);
    });

    it("gap + backward", () => {
      const seqStream = new SeqStream({
        view: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 0]),
        backward: true,
      });

      const res = seqStream.findFirstIn(
        [
          new ByteStream({ view: new Uint8Array([5]) }),
          new ByteStream({ view: new Uint8Array([3]) }),
        ],
        3,
      );
      assert.strictEqual(res.id, -1);
    });
  });

  describe("findFirstNotIn", () => {
    it("right", () => {
      const seqStream = new SeqStream({
        view: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 0]),
      });

      const res = seqStream.findFirstNotIn([
        new ByteStream({ view: new Uint8Array([1]) }),
        new ByteStream({ view: new Uint8Array([2]) }),
        new ByteStream({ view: new Uint8Array([3]) }),
      ]);
      assert.deepStrictEqual(res.right, {
        id: -1,
        length: 0,
        position: 9,
      });
      assert.deepStrictEqual(res.left, {
        id: 2,
        length: 1,
        position: 3,
      });
      assert.strictEqual(res.value.toHexString(), "040506070800");
    });

    it("not found", () => {
      const seqStream = new SeqStream({
        view: new Uint8Array([1, 2, 3]),
      });

      const res = seqStream.findFirstNotIn([
        new ByteStream({ view: new Uint8Array([1]) }),
        new ByteStream({ view: new Uint8Array([2]) }),
        new ByteStream({ view: new Uint8Array([3]) }),
      ]);
      assert.deepStrictEqual(res.right, {
        id: 2,
        length: 1,
        position: 3,
      });
      assert.deepStrictEqual(res.left, {
        id: 2,
        length: 1,
        position: 3,
      });
      assert.strictEqual(res.value.toHexString(), "");
    });

    it("gap", () => {
      const seqStream = new SeqStream({
        view: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 0]),
      });

      const res = seqStream.findFirstNotIn(
        [
          new ByteStream({ view: new Uint8Array([1]) }),
          new ByteStream({ view: new Uint8Array([2]) }),
          new ByteStream({ view: new Uint8Array([3]) }),
        ],
        5,
      );
      assert.deepStrictEqual(res.right, {
        id: -1,
        length: 0,
        position: 9,
      });
      assert.deepStrictEqual(res.left, {
        id: 2,
        length: 1,
        position: 3,
      });
      assert.strictEqual(res.value.toHexString(), "040506070800");
    });

    it("gap + backward", () => {
      const seqStream = new SeqStream({
        view: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 0]),
        backward: true,
      });

      const res = seqStream.findFirstNotIn(
        [
          new ByteStream({ view: new Uint8Array([5]) }),
          new ByteStream({ view: new Uint8Array([3]) }),
        ],
        10,
      );
      assert.deepStrictEqual(res.right, {
        id: -1,
        // TODO 'length' does not present
        position: 9,
      });
      assert.deepStrictEqual(res.left, {
        id: 0,
        length: 1,
        position: 4,
      });
      assert.strictEqual(res.value.toHexString(), "06070800");
    });
  });

  it("appendUint16", () => {
    const stream = new SeqStream();
    stream.appendUint16(800);
    assert.strictEqual(stream.length, 2);

    stream.appendUint16(800);
    assert.strictEqual(stream.buffer.byteLength, 4);
  });
});
