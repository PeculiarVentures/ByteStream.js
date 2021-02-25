import * as assert from "assert";
import { BitStream, ByteStream, SeqStream } from "../src";

const data = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A]);
context("Functional testing", () => {
	//#region Aux function
	function compareWithData(variable: ByteStream, name: string, testData = data, length = 10) {
		assert.strictEqual(variable.length, length, `${name}: Incorrect byteLength for _buffer value`);
		for (let i = 0; i < length; i++) {
			assert.strictEqual(variable.view[i], testData[i], `${name}: Incorrect value at index ${i} for view`);
		}
	}
	//#endregion

	it("ByteStream class tests", () => {
		const byteStreamClear = new ByteStream({});

		const byteStreamCopyEmpty = byteStreamClear.copy();
		compareWithData(byteStreamCopyEmpty, "byteStreamCopyEmpty", byteStreamClear.view, byteStreamClear.view.length);

		assert.throws(() => byteStreamClear.copy(1, 1), Error, "Incorrect copy parameters must rise an Error");

		const byteStreamSliceEmpty = byteStreamClear.slice();
		compareWithData(byteStreamSliceEmpty, "byteStreamSliceEmpty", byteStreamClear.view, byteStreamClear.view.length);

		assert.throws(() => byteStreamClear.slice(1, 1), Error, "Incorrect slice parameters must rise an Error");

		const byteStreamLength = new ByteStream({ length: 10 });
		compareWithData(byteStreamLength, "byteStreamLength", new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), 10);

		const byteStreamStub = new ByteStream({ length: 10, stub: 0xFF });
		compareWithData(byteStreamStub, "byteStreamStub", new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]), 10);

		const byteStreamView = new ByteStream({ view: data });
		compareWithData(byteStreamView, "byteStreamView");

		const byteStreamBuffer = new ByteStream({ buffer: data.buffer });
		compareWithData(byteStreamBuffer, "byteStreamBuffer");

		assert.strictEqual(byteStreamBuffer.isEqual(byteStreamView), true, "Incorrect comparison in isEqual");
		assert.strictEqual(byteStreamBuffer.isEqualView(byteStreamView.view), true, "Incorrect comparison in isEqual");

		const byteStreamString = new ByteStream({ string: "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A" });
		compareWithData(byteStreamString, "byteStreamString");
		assert.strictEqual(byteStreamString.toString(), "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A", "byteStreamString: Incorrect value for toString result #1");
		assert.strictEqual(byteStreamString.toString(-1), "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A", "byteStreamString: Incorrect value for toString result #2");
		assert.strictEqual(byteStreamString.toString(0, 20), "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A", "byteStreamString: Incorrect value for toString result #3");
		assert.strictEqual(byteStreamString.toString(0, -1), "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A", "byteStreamString: Incorrect value for toString result #4");
		assert.strictEqual(byteStreamString.toString(0, 3), "\x01\x02\x03", "byteStreamString: Incorrect value for toString result #5");

		const byteStreamCopy = byteStreamString.copy();
		compareWithData(byteStreamCopy, "byteStreamCopy", byteStreamString.view, byteStreamString.view.length);

		const byteStreamSlice = byteStreamString.copy();
		compareWithData(byteStreamSlice, "byteStreamSlice", byteStreamString.view, byteStreamString.view.length);

		const byteStreamCopyParameters = byteStreamString.copy(1, 3);
		assert.strictEqual(byteStreamCopyParameters.toHexString(), "020304", "byteStreamCopyParameters: Incorrect value after copy");

		assert.strictEqual(byteStreamBuffer.isEqual(byteStreamCopyParameters), false, "Incorrect comparison in isEqual");
		assert.strictEqual(byteStreamBuffer.isEqualView(byteStreamCopyParameters.view), false, "Incorrect comparison in isEqual");
		assert.strictEqual(byteStreamBuffer.isEqual(new ByteStream({ view: new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0C]) })), false, "Incorrect comparison in isEqual");
		assert.strictEqual(byteStreamBuffer.isEqualView(new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0C])), false, "Incorrect comparison in isEqual");

		const byteStreamSliceParameters = byteStreamString.slice(1, 4);
		assert.strictEqual(byteStreamSliceParameters.toHexString(), "020304", "byteStreamSliceParameters: Incorrect value after slice");

		byteStreamString.realloc(11);
		compareWithData(byteStreamString, "byteStreamString", new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x00]), 11);

		byteStreamString.realloc(3);
		compareWithData(byteStreamString, "byteStreamString", new Uint8Array([0x01, 0x02, 0x03]), 3);

		byteStreamString.append(byteStreamString);
		compareWithData(byteStreamString, "byteStreamString", new Uint8Array([0x01, 0x02, 0x03, 0x01, 0x02, 0x03]), 6);

		const byteStreamHexString = new ByteStream({ hexstring: "0102030405060708090AFF" });
		compareWithData(byteStreamHexString, "byteStreamHexString", new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0xFF]), 11);
		assert.strictEqual(byteStreamHexString.toHexString(), "0102030405060708090AFF", "byteStreamHexString: Incorrect value for toHexString result #1");
		assert.strictEqual(byteStreamHexString.toHexString(-1), "0102030405060708090AFF", "byteStreamHexString: Incorrect value for toHexString result #2");
		assert.strictEqual(byteStreamHexString.toHexString(0, 20), "0102030405060708090AFF", "byteStreamHexString: Incorrect value for toHexString result #3");
		assert.strictEqual(byteStreamHexString.toHexString(0, -1), "0102030405060708090AFF", "byteStreamHexString: Incorrect value for toHexString result #4");
		assert.strictEqual(byteStreamHexString.toHexString(0, 3), "010203", "byteStreamHexString: Incorrect value for toHexString result #5");

		byteStreamString.realloc(3);
		assert.strictEqual(byteStreamString.insert(new ByteStream({ view: new Uint8Array([0xFF, 0xFF, 0xFF]) }), 1, 2), true, "Incorrect result from insert method");
		assert.strictEqual(byteStreamString.toHexString(), "01FFFF", "byteStreamString: Incorrect value after insert method #1");
		assert.strictEqual(byteStreamString.insert(new ByteStream({ view: new Uint8Array([0xFF, 0xFF, 0xFF]) }), 4, 2), false, "Incorrect result from insert method");
		assert.strictEqual(byteStreamString.insert(new ByteStream({ view: new Uint8Array([0xFF, 0xFF]) }), 0, 4), true, "Incorrect result from insert method");
		assert.strictEqual(byteStreamString.insert(new ByteStream({ view: new Uint8Array([0xFF, 0xFF]) })), true, "Incorrect result from insert method");

		const dataStream = new ByteStream({
			view: new Uint8Array([
				0x20,
				0x20,
				0x21,
				0x22,
				0x23,
				0x25
			])
		});

		const separatorStream = new ByteStream({
			view: new Uint8Array([
				0x20
			])
		});

		const separatorStream2 = new ByteStream({
			view: new Uint8Array([
				0x23
			])
		});

		const separatorStream3 = new ByteStream({
			view: new Uint8Array([
				0x25
			])
		});

		const separatorStream4 = new ByteStream({
			view: new Uint8Array([
				0x21,
				0x22,
				0x23
			])
		});

		let result;

		result = dataStream.findFirstNotIn([separatorStream, separatorStream2]);
		assert.strictEqual(result.value.toHexString(), "2122", "Incorrect result for findFirstNotIn #1");
		result = dataStream.findFirstNotIn([separatorStream]);
		assert.strictEqual(result.value.toHexString(), "21222325", "Incorrect result for findFirstNotIn #2");
		result = dataStream.findFirstIn([separatorStream, separatorStream2]);
		assert.strictEqual(result.position, 1, "Incorrect result for findFirstIn #1");
		result = dataStream.findPattern(separatorStream);
		assert.strictEqual(result, 1, "Incorrect result for findPattern #1");
		result = dataStream.findPattern(separatorStream4);
		assert.strictEqual(result, 5, "Incorrect result for findPattern #2");
		result = dataStream.findFirstIn([separatorStream, separatorStream2]);
		assert.strictEqual(result.position, 1, "Incorrect result for findFirstIn #2");
		result = dataStream.findFirstNotIn([separatorStream, separatorStream2, separatorStream3]);
		assert.strictEqual(result.value.toHexString(), "2122", "Incorrect result for findFirstNotIn #2");

		const string = "startxref123a\n\
1908\n\
%%EOF";

		const bufferStream = new ByteStream({
			string
		});

		const digits_0_stream = new ByteStream({
			view: new Uint8Array([
				0x30
			])
		});

		const digits_1_stream = new ByteStream({
			view: new Uint8Array([
				0x31
			])
		});

		const digits_2_stream = new ByteStream({
			view: new Uint8Array([
				0x32
			])
		});

		const digits_3_stream = new ByteStream({
			view: new Uint8Array([
				0x33
			])
		});

		const digits_4_stream = new ByteStream({
			view: new Uint8Array([
				0x34
			])
		});

		const digits_5_stream = new ByteStream({
			view: new Uint8Array([
				0x35
			])
		});

		const digits_6_stream = new ByteStream({
			view: new Uint8Array([
				0x36
			])
		});

		const digits_7_stream = new ByteStream({
			view: new Uint8Array([
				0x37
			])
		});

		const digits_8_stream = new ByteStream({
			view: new Uint8Array([
				0x38
			])
		});

		const digits_9_stream = new ByteStream({
			view: new Uint8Array([
				0x39
			])
		});

		result = bufferStream.skipNotPatterns([
			digits_0_stream,
			digits_1_stream,
			digits_2_stream,
			digits_3_stream,
			digits_4_stream,
			digits_5_stream,
			digits_6_stream,
			digits_7_stream,
			digits_8_stream,
			digits_9_stream
		], null, null, true);

		result = bufferStream.findFirstSequence([
			digits_0_stream,
			digits_1_stream,
			digits_2_stream,
			digits_3_stream,
			digits_4_stream,
			digits_5_stream,
			digits_6_stream,
			digits_7_stream,
			digits_8_stream,
			digits_9_stream
		], null, null, true);

		assert.strictEqual(result.value.toHexString(), "31393038", "Incorrect value for findFirstSequence #1");

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
			digits_9_stream
		]);

		assert.strictEqual(result.length, 2, "Incorrect length for result of findAllSequences #1");
		assert.strictEqual(result[0].value.toHexString(), "313233", "Incorrect value[0] for result of findAllSequences #1");
		assert.strictEqual(result[1].value.toHexString(), "31393038", "Incorrect value[1] for result of findAllSequences #1");

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
			digits_9_stream
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
			digits_9_stream
		]);

		assert.strictEqual(result[0].value.toHexString(), "737461727478726566", "Incorrect value[0] for result of findAllNotIn #1");
		assert.strictEqual(result[1].value.toHexString(), "610A", "Incorrect value[1] for result of findAllNotIn #1");
		assert.strictEqual(result[2].value.toHexString(), "0A2525454F46", "Incorrect value[2] for result of findAllNotIn #1");

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
					0x2B // "+"
				])
			}),
			new ByteStream({
				view: new Uint8Array([
					0x2D // "-"
				])
			})
		];

		const xref = "xref\n\
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
			string: xref
		});

		result = xrefStream.findFirstIn([
			new ByteStream({
				string: "xref"
			})
		]);

		result = xrefStream.findFirstSequence(digits, result.position);

		assert.strictEqual(parseInt(result.value.toString(), 10), 0, "Incorrect value #1 in parsing XRef");

		result = xrefStream.findFirstSequence(digits, result.position);

		assert.strictEqual(parseInt(result.value.toString(), 10), -19, "Incorrect value #2 in parsing XRef");

		result = xrefStream.findFirstSequence(digits, result.position);

		assert.strictEqual(parseInt(result.value.toString(), 10), 0, "Incorrect value #3 in parsing XRef");

		result = xrefStream.findFirstSequence(digits, result.position);

		assert.strictEqual(parseInt(result.value.toString(), 10), 65535, "Incorrect value #4 in parsing XRef");

		result = xrefStream.findFirstSequence(digits, result.position);
		result = xrefStream.findFirstSequence(digits, result.position);

		result = xrefStream.findFirstSequence(digits, result.position);

		assert.strictEqual(parseInt(result.value.toString(), 10), 1461, "Incorrect value #5 in parsing XRef");

		const pairedStream = new ByteStream({
			string: "<<[1[1][1]]>>"
		});

		result = pairedStream.findPairedPatterns(new ByteStream({
			string: "["
		}), new ByteStream({
			string: "]"
		}));

		assert.strictEqual(result.length, 3, "Incorrect length for findPairedPatterns #1");
		assert.strictEqual(result[0].left, 3, "Incorrect left[0] for findPairedPatterns #1");
		assert.strictEqual(result[0].right, 11, "Incorrect right[0] for findPairedPatterns #1");
		assert.strictEqual(result[1].left, 5, "Incorrect left[1] for findPairedPatterns #1");
		assert.strictEqual(result[1].right, 7, "Incorrect right[1] for findPairedPatterns #1");
		assert.strictEqual(result[2].left, 8, "Incorrect left[2] for findPairedPatterns #1");
		assert.strictEqual(result[2].right, 10, "Incorrect right[2] for findPairedPatterns #1");

		result = pairedStream.findPairedArrays(
			[
				new ByteStream({ string: "[" }),
				new ByteStream({ string: "<<" })
			],
			[
				new ByteStream({ string: "]" }),
				new ByteStream({ string: ">>" })
			]);

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

		assert(!(typeof result === "number"), "Incorrect result type for findAllPatternIn #1. Result must be number array");
		assert.strictEqual(result.length, 3, "Incorrect length for findAllPatternIn #1");
		assert.strictEqual(result[0], 3, "Incorrect value[0] for findAllPatternIn #1");
		assert.strictEqual(result[1], 5, "Incorrect value[1] for findAllPatternIn #1");
		assert.strictEqual(result[2], 8, "Incorrect value[2] for findAllPatternIn #1");

		result = pairedStream.replacePattern(new ByteStream({ string: "<<[" }), new ByteStream({ string: "<" }));
		result = pairedStream.replacePattern(new ByteStream({ string: "]>>" }), new ByteStream({ string: ">" }));

		assert.strictEqual(pairedStream.toString(), "<1[1][1]>", "Incorrect value after replacePattern");
	});

	it("SeqStream class tests", () => {
		const seqStreamStream = new SeqStream({ stream: new ByteStream({ view: data }), backward: true, appendBlock: 1000 });
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
			view: new Uint8Array([
				0x20,
				0x20,
				0x21,
				0x22,
				0x23,
				0x25
			])
		});

		const separatorStream = new ByteStream({
			view: new Uint8Array([
				0x20
			])
		});

		const separatorStream2 = new ByteStream({
			view: new Uint8Array([
				0x23
			])
		});

		const separatorStream3 = new ByteStream({
			view: new Uint8Array([
				0x25
			])
		});

		const separatorStream4 = new ByteStream({
			view: new Uint8Array([
				0x21,
				0x22,
				0x23
			])
		});

		const seqStreamData = new SeqStream({ stream: dataStream });

		let result: any = seqStreamData.findPattern(new ByteStream({ view: new Uint8Array([0x21]) }));

		assert.strictEqual(result, 3, "Incorrect result after SeqStream findPattern #1");
		assert.strictEqual(seqStreamData.start, 3, "Incorrect start value after SeqStream findPattern #1");
		assert.strictEqual(seqStreamData.length, 3, "Incorrect length value after SeqStream findPattern #1");

		result = seqStreamData.findFirstNotIn([separatorStream2, separatorStream3]);

		assert.strictEqual(result.value.toHexString(), "22", "Incorrect result after SeqStream findFirstNotIn #1");
		assert.strictEqual(seqStreamData.start, 5, "Incorrect start value after SeqStream findPattern #1");
		assert.strictEqual(seqStreamData.length, 1, "Incorrect length value after SeqStream findPattern #1");

		seqStreamData.start = 0;
		seqStreamData.length = dataStream.length;

		result = dataStream.findFirstNotIn([separatorStream, separatorStream2]);
		assert.strictEqual(result.value.toHexString(), "2122", "Incorrect result for SeqStream findFirstNotIn #1");

		seqStreamData.start = 0;
		seqStreamData.length = dataStream.length;

		result = dataStream.findFirstNotIn([separatorStream]);
		assert.strictEqual(result.value.toHexString(), "21222325", "Incorrect result for SeqStream findFirstNotIn #2");

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
		assert.strictEqual(result.value.toHexString(), "2122", "Incorrect result for SeqStream findFirstNotIn #2");

		const string = "startxref123a\n\
1908\n\
%%EOF";

		const bufferStream = new ByteStream({
			string
		});

		const seqStreamBuffer = new SeqStream({ stream: bufferStream });

		const digits_0_stream = new ByteStream({
			view: new Uint8Array([
				0x30
			])
		});

		const digits_1_stream = new ByteStream({
			view: new Uint8Array([
				0x31
			])
		});

		const digits_2_stream = new ByteStream({
			view: new Uint8Array([
				0x32
			])
		});

		const digits_3_stream = new ByteStream({
			view: new Uint8Array([
				0x33
			])
		});

		const digits_4_stream = new ByteStream({
			view: new Uint8Array([
				0x34
			])
		});

		const digits_5_stream = new ByteStream({
			view: new Uint8Array([
				0x35
			])
		});

		const digits_6_stream = new ByteStream({
			view: new Uint8Array([
				0x36
			])
		});

		const digits_7_stream = new ByteStream({
			view: new Uint8Array([
				0x37
			])
		});

		const digits_8_stream = new ByteStream({
			view: new Uint8Array([
				0x38
			])
		});

		const digits_9_stream = new ByteStream({
			view: new Uint8Array([
				0x39
			])
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
			digits_9_stream
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
			digits_9_stream
		]);

		assert.strictEqual(result.value.toHexString(), "313233", "Incorrect value for findFirstSequence #1");

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
			digits_9_stream
		]);

		assert.strictEqual(result.length, 2, "Incorrect length for result of findAllSequences #1");
		assert.strictEqual(result[0].value.toHexString(), "313233", "Incorrect value[0] for result of findAllSequences #1");
		assert.strictEqual(result[1].value.toHexString(), "31393038", "Incorrect value[1] for result of findAllSequences #1");

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
			digits_9_stream
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
			digits_9_stream
		]);

		assert.strictEqual(result[0].value.toHexString(), "737461727478726566", "Incorrect value[0] for result of findAllNotIn #1");
		assert.strictEqual(result[1].value.toHexString(), "610A", "Incorrect value[1] for result of findAllNotIn #1");
		assert.strictEqual(result[2].value.toHexString(), "0A2525454F46", "Incorrect value[2] for result of findAllNotIn #1");
	});

	context("BitStream class tests", () => {

		context("constructor", () => {

			it("empty", () => {
				const bitStream = new BitStream();

				assert.strictEqual(bitStream.bitsCount, 0);
				assert.strictEqual(bitStream.buffer.byteLength, 0);
			});

			it("view", () => {
				const bitStream = new BitStream({ view: new Uint8Array([1, 2, 3, 4, 5]) });

				assert.strictEqual(bitStream.bitsCount, 40);
				assert.strictEqual(bitStream.buffer.byteLength, 5);
			});

			it("view with bitsCount", () => {
				const bitStream = new BitStream({
					view: new Uint8Array([1, 2, 3, 4, 5]),
					bitsCount: 35
				});

				assert.strictEqual(bitStream.bitsCount, 35);
				assert.strictEqual(bitStream.buffer.byteLength, 5);
			});

			it("buffer", () => {
				const bitStream = new BitStream({ buffer: new Uint8Array([1, 2, 3, 4, 5]).buffer });

				assert.strictEqual(bitStream.bitsCount, 40);
				assert.strictEqual(bitStream.buffer.byteLength, 5);
			});

			it("byteStream", () => {
				const bitStream = new BitStream({ byteStream: new ByteStream({ length: 5 }) });

				assert.strictEqual(bitStream.bitsCount, 40);
				assert.strictEqual(bitStream.buffer.byteLength, 5);
			});

			it("string", () => {
				const bitStream = new BitStream({ string: "1000000000001" });

				assert.strictEqual(bitStream.bitsCount, 13);
				assert.strictEqual(bitStream.buffer.byteLength, 2);
			});

			it("uint32", () => {
				const bitStream = new BitStream({ uint32: 300 });

				assert.strictEqual(bitStream.bitsCount, 32);
				assert.strictEqual(bitStream.buffer.byteLength, 4);
			});

		});

		it("clear", () => {
			const bitStream = new BitStream({ string: "1000000000001" });
			bitStream.clear();

			assert.strictEqual(bitStream.bitsCount, 0);
			assert.strictEqual(bitStream.buffer.byteLength, 0);
		});

		context("toString", () => {
			const bitStream = new BitStream({ string: "10000000000010000010" });

			it("default", () => {
				const bitString = bitStream.toString();
				assert.strictEqual(bitString, "10000000000010000010");
			});

			it("start: 1, length: default", () => {
				const bitString = bitStream.toString(1);
				assert.strictEqual(bitString, "000010000010");
			});

		});

		it("shrink", () => {
			const bitStream = new BitStream({
				uint32: 123456,
				bitsCount: 12,
			});

			bitStream.shrink();

			assert.strictEqual(bitStream.bitsCount, 12);
			assert.strictEqual(bitStream.buffer.byteLength, 2);
		});

		context("shiftRight", () => {
			const bits = "10101010 10101010 10101"
				.replace(/ /g, ""); // remove spaces

			it("shrink: true", () => {
				const bitStream = new BitStream({ string: bits });
				bitStream.shiftRight(7);
				assert.strictEqual(bitStream.bitsCount, 14);
				assert.strictEqual(bitStream.buffer.byteLength, 2);
				assert.strictEqual(bitStream.toString(), "10101010101010");
			});

			it("shrink: false", () => {
				const bitStream = new BitStream({ string: bits });
				bitStream.shiftRight(7, false);
				assert.strictEqual(bitStream.bitsCount, 14);
				assert.strictEqual(bitStream.buffer.byteLength, 3);
				assert.strictEqual(bitStream.toString(), "10101010101010");
			});

			it("empty view", () => {
				const bitStream = new BitStream({ view: new Uint8Array() });
				bitStream.shiftRight(7);
				assert.strictEqual(bitStream.toString(), "");
			});

			it("shift value is out of range", () => {
				const bitStream = new BitStream({ view: new Uint8Array(1) });
				assert.throws(() => {
					bitStream.shiftRight(10);
				}, Error);
			});

			it("shift value more than bitsCount", () => {
				const bitStream = new BitStream({ view: new Uint8Array(1), bitsCount: 1 });
				assert.throws(() => {
					bitStream.shiftRight(2);
				}, Error);
			});

		});

		context("shiftLeft", () => {
			const bits = "10101010 10101010 10101"
				.replace(/ /g, ""); // remove spaces

			it("correct", () => {
				const bitStream = new BitStream({ string: bits });
				bitStream.shiftLeft(7);
				assert.strictEqual(bitStream.bitsCount, 14);
				assert.strictEqual(bitStream.buffer.byteLength, 2);
				assert.strictEqual(bitStream.toString(), "01010101010101");
			});

			it("empty view", () => {
				const bitStream = new BitStream({ view: new Uint8Array() });
				bitStream.shiftRight(7);
				assert.strictEqual(bitStream.toString(), "");
			});

			it("shift value is out of range", () => {
				const bitStream = new BitStream({ view: new Uint8Array(1) });
				assert.throws(() => {
					bitStream.shiftRight(10);
				}, Error);
			});

			it("shift value more than bitsCount", () => {
				const bitStream = new BitStream({ view: new Uint8Array(1), bitsCount: 1 });
				assert.throws(() => {
					bitStream.shiftRight(2);
				}, Error);
			});

		});

		context("slice", () => {
			const bits = "10101010 10101010 10101"
				.replace(/ /g, ""); // remove spaces

			it("default", () => {
				const bitStream = new BitStream({ string: bits });
				const slicedStream = bitStream.slice();
				assert.strictEqual(slicedStream.toString(), "1");
				// TODO Should it return the same bits from the source stream?
				// assert.strictEqual(slicedStream.toString(), bits);
			});

			it("start: 1, end: default", () => {
				const bitStream = new BitStream({ string: bits });
				const slicedStream = bitStream.slice(1);
				assert.strictEqual(slicedStream.toString(), ""); // TODO The same result in JS version
				// assert.strictEqual(slicedStream.toString(), "01010101010101010101");
			});

			it("start: 1, end: 10", () => {
				const bitStream = new BitStream({ string: bits });
				const slicedStream = bitStream.slice(1, 10);
				assert.strictEqual(slicedStream.toString(), "0101010101");
			});
		});

		context("copy", () => {
			const bits = "10101010 10101010 10101"
				.replace(/ /g, ""); // remove spaces

			it("default", () => {
				const bitStream = new BitStream({ string: bits });
				const copyStream = bitStream.copy();
				assert.strictEqual(copyStream.toString(), ""); // TODO The same result in JS version
				// assert.strictEqual(slicedStream.toString(), bits);
			});

			it("start: 1, end: default", () => {
				const bitStream = new BitStream({ string: bits });
				const copyStream = bitStream.slice(1);
				assert.strictEqual(copyStream.toString(), ""); // TODO The same result in JS version
				// assert.strictEqual(slicedStream.toString(), "01010101010101010101");
			});

			it("start: 1, end: 10", () => {
				const bitStream = new BitStream({ string: bits });
				const copyStream = bitStream.slice(1, 10);
				assert.strictEqual(copyStream.toString(), "0101010101");
			});
		});

		it("reversBytes", () => {
			const bits = "10101101 11011110 11111"
				.replace(/ /g, ""); // remove spaces

			const bitStream = new BitStream({ string: bits });
			bitStream.reverseBytes();
			assert.strictEqual(bitStream.toString(), "101011101110111111011"); // TODO Result from JS version
			// TODO Should it be like the next line?
			// assert.strictEqual(bitStream.toString(), "10110101 01111011 11111");
		});

		it("reversValue", () => {
			const bits = "10101101 11011110 11111"
				.replace(/ /g, ""); // remove spaces

			const bitStream = new BitStream({ string: bits });
			bitStream.reverseValue();
			assert.strictEqual(bitStream.toString(), "111110111101110110101");
		});

		context("getNumberValue", () => {

			it("4 bytes", () => {
				const bitStream = new BitStream({ uint32: 1234567890 });
				assert.strictEqual(bitStream.getNumberValue(), 1234567890);
			});

			it("length of the buffer is 0", () => {
				const bitStream = new BitStream();
				assert.strictEqual(bitStream.getNumberValue(), 0);
			});

			it("length of the buffer is gritter than 4", () => {
				const bitStream = new BitStream({ view: new Uint8Array(5) });
				assert.strictEqual(bitStream.getNumberValue(), -1);
			});

		});

		context("findPattern", () => {
			const bits = "10101101 11011110 11111"
				.replace(/ /g, ""); // remove spaces

			it("default", () => {
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findPattern(new BitStream({ string: "111" }));
				assert.strictEqual(res, 10);
			});

			it("start: 8", () => {
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findPattern(new BitStream({ string: "111" }), 10);
				assert.strictEqual(res, 14);
			});

			it("start: 8, length: 3", () => {
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findPattern(new BitStream({ string: "111" }), 10, 3);
				assert.strictEqual(res, -1);
			});

			it("backward", () => {
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findPattern(new BitStream({ string: "111" }), null, null, true);
				assert.strictEqual(res, 18);
			});

		});

		context("findFirstIn", () => {
			const bits = "10101101 11011110 11111"
				.replace(/ /g, ""); // remove spaces
			const patterns = [
				new BitStream({ string: "11" }),
				new BitStream({ string: "111" }),
			];

			it("default", () => {
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findFirstIn(patterns);
				assert.deepStrictEqual(res, {
					id: 0,
					length: 2,
					position: 6,
				});
			});
			it("backward", () => {
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findFirstIn(patterns.reverse(), null, null, true);
				assert.deepStrictEqual(res, {
					id: 1,
					length: 2,
					position: 19,
				});
			});

		});

		context("findAllIn", () => {
			const bits = "10101101 11011110 11111"
				.replace(/ /g, ""); // remove spaces
			const patterns = [
				new BitStream({ string: "11" }),
				new BitStream({ string: "111" }),
			];

			it("default", () => {
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findAllIn(patterns);
				assert.deepStrictEqual(res, [
					{
						id: 0,
						position: 6
					},
					{
						id: 1,
						position: 10
					},
					{
						id: 1,
						position: 14
					},
					{
						id: 1,
						position: 19
					},
					{
						id: 0,
						position: 21
					}
				]);
			});
			it("start + length", () => {
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findAllIn(patterns, 3, 6);
				assert.deepStrictEqual(res, [
					{
						id: 0,
						position: 6
					},
					{
						id: 0,
						position: 9
					}
				]);
			});
			it("not found", () => {
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findAllIn(patterns, 3, 1);
				assert.deepStrictEqual(res, []);
			});
		});

		context("findAllPatternIn", () => {
			const bits = "10101101 11011110 11111"
				.replace(/ /g, ""); // remove spaces
			const pattern = new BitStream({ string: "111" });

			it("default", () => {
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findAllPatternIn(pattern);
				assert.deepStrictEqual(res, [10, 14, 19]);
			});

			it("start + length", () => {
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findAllPatternIn(pattern, 5, 6);
				assert.deepStrictEqual(res, [10]);
			});

			it("not found", () => {
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findAllPatternIn(pattern, 5, 1);
				assert.deepStrictEqual(res, -1);
			});

		});

		context("findFirstNotIn", () => {
			const bits = "10101101 11011110 01111"
				.replace(/ /g, ""); // remove spaces

			it("default", () => {
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findFirstNotIn([
					new BitStream({ string: "101" }),
					new BitStream({ string: "00" }),
				]);
				assert.deepStrictEqual(res.left, {
					id: 0,
					length: 3,
					position: 3
				});
				assert.deepStrictEqual(res.right, {
					id: 0,
					length: 3,
					position: 8
				});
				assert.deepStrictEqual(res.value.toString(), "01");
			});

			it("start + length", () => {
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findFirstNotIn([
					new BitStream({ string: "01110" }),
					new BitStream({ string: "00" }),
				], 6, 14);
				assert.deepStrictEqual(res.left, {
					id: 0,
					length: 5,
					position: 11
				});
				assert.deepStrictEqual(res.right, {
					id: 1,
					length: 2,
					position: 17
				});
				assert.deepStrictEqual(res.value.toString(), "1111");
			});

			it("not found", () => {
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findFirstNotIn([
					new BitStream({ string: "000" }),
					new BitStream({ string: "00100" }),
				], 6, 14);
				assert.deepStrictEqual(res.left, {
					id: -1,
					position: 6
				});
				assert.deepStrictEqual(res.right, {
					id: -1,
					length: 0,
					position: 20
				});
				assert.deepStrictEqual(res.value.toString(), "01110111100111");
			});

		});

		context("findFirstSequence", () => {

			it("default", () => {
				const bits = "00000111 1100".replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });

				const res = bitStream.findFirstSequence([
					new BitStream({ string: "1" }),
				]);

				assert.strictEqual(res.position, 10);
				assert.strictEqual(res.value.toString(), "11111");
			});

			it("backward", () => {
				const bits = "00001110 1100".replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });

				const res = bitStream.findFirstSequence([
					new BitStream({ string: "1" }),
				], null, null, true);

				assert.strictEqual(res.position, 8);
				assert.strictEqual(res.value.toString(), "11");
			});

			it("start + length", () => {
				const bits = "01100001 1100".replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });

				const res = bitStream.findFirstSequence([
					new BitStream({ string: "1" }),
				], 4, 7);

				assert.strictEqual(res.position, 10);
				assert.strictEqual(res.value.toString(), "111");
			});

			it("not found", () => {
				const bits = "01100001 1100".replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });

				const res = bitStream.findFirstSequence([
					new BitStream({ string: "1" }),
				], 3, 4);

				assert.strictEqual(res.position, -1);
				assert.strictEqual(res.value.toString(), "");
			});

		});

		context("findAllSequences", () => {
			const bits = "010110111 011110"
				.replace(/ /g, "");
			const bitStream = new BitStream({
				string: bits,
			});

			it("default", () => {
				const res = bitStream.findAllSequences([
					new BitStream({ string: "10" }),
					new BitStream({ string: "01" }),
				])
					.map(o => { return { position: o.position, value: o.value.toString() }; });
				assert.deepStrictEqual(res, [
					{ position: 6, value: "010110" },
					{ position: 10, value: "10" },
					{ position: 15, value: "10" }
				]);
			});

			it("start + length", () => {
				const res = bitStream.findAllSequences([
					new BitStream({ string: "10" }),
					new BitStream({ string: "01" }),
				], 2, 6)
					.map(o => { return { position: o.position, value: o.value.toString() }; });
				assert.deepStrictEqual(res, [
					{ position: 6, value: "0110" },
				]);
			});

			it("not found", () => {
				const res = bitStream.findAllSequences([
					new BitStream({ string: "000" }),
					new BitStream({ string: "00" }),
				], 2, 6)
					.map(o => { return { position: o.position, value: o.value.toString() }; });
				assert.deepStrictEqual(res, []);
			});

		});

		context("findPairedPatterns", () => {

			it("default", () => {
				const bits = "00010000 00110000 0110"
					.replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findPairedPatterns(
					new BitStream({ string: "01" }),
					new BitStream({ string: "11" }),
				);

				// TODO Double check result
				// Should it be '010000 0011' only?
				assert.deepStrictEqual(res, [
					{ left: 11, right: 12 },
					{ left: 18, right: 19 }
				]);
			});

			it("start + length", () => {
				const bits = "00010000 00110000 0110"
					.replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findPairedPatterns(
					new BitStream({ string: "01" }),
					new BitStream({ string: "11" }),
					11, 8);

				assert.deepStrictEqual(res, [
					{ left: 18, right: 19 },
				]);
			});

			it("not found", () => {
				const bits = "000000"
					.replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findPairedPatterns(
					new BitStream({ string: "01" }),
					new BitStream({ string: "11" }),
				);

				assert.deepStrictEqual(res, []);
			});

		});

		context("findPairedArrays", () => {

			it("default", () => {
				const bits = "00110000 001010"
					.replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findPairedArrays(
					[
						new BitStream({ string: "111" }),
						new BitStream({ string: "11" }),
					],
					[
						new BitStream({ string: "1001" }),
						new BitStream({ string: "101" }),
					],
				);

				assert.deepStrictEqual(res, [
					{
						left: {
							id: 1,
							position: 4
						},
						right: {
							id: 1,
							position: 13
						}
					}
				]);
			});

			it("start + length", () => {
				const bits = "00110000 00101000 00110000 00101000 0011"
					.replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findPairedArrays(
					[
						new BitStream({ string: "111" }),
						new BitStream({ string: "11" }),
					],
					[
						new BitStream({ string: "1001" }),
						new BitStream({ string: "101" }),
					],
					16, 16);

				assert.deepStrictEqual(res, [
					{
						left: {
							id: 1,
							position: 20
						},
						right: {
							id: 1,
							position: 29
						}
					}
				]);
			});

			it("not found", () => {
				const bits = "00110000 001010"
					.replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.findPairedArrays(
					[
						new BitStream({ string: "1111" }),
						new BitStream({ string: "111" }),
					],
					[
						new BitStream({ string: "1001" }),
						new BitStream({ string: "10001" }),
					],
				);

				assert.deepStrictEqual(res, []);
			});

		});

		context("replacePattern", () => {
			it("default", () => {
				const bits = "00110000 00110"
					.replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.replacePattern(new BitStream({ string: "11" }), new BitStream({ string: "00" }));

				assert.strictEqual(res, true);
				assert.strictEqual(bitStream.toString(), "00000000 00000".replace(/ /g, ""));
			});

			it("start + length", () => {
				const bits = "00110000 00110"
					.replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.replacePattern(new BitStream({ string: "11" }), new BitStream({ string: "00" }), 4, 8);

				assert.strictEqual(res, true);
				assert.strictEqual(bitStream.toString(), "00110000 00000".replace(/ /g, ""));
			});

			it("not found", () => {
				const bits = "00110000 00110"
					.replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.replacePattern(new BitStream({ string: "111" }), new BitStream({ string: "000" }));

				assert.strictEqual(res, true);
				// TODO Check out test result
				// assert.strictEqual(res, false);
				assert.strictEqual(bitStream.toString(), "00110000 00110".replace(/ /g, ""));
			});

		});

		context("skipPatterns", () => {

			it("default", () => {
				const bits = "010100000 01010"
					.replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.skipPatterns([
					new BitStream({ string: "01" }),
					new BitStream({ string: "0" }),
				]);

				assert.strictEqual(res, 14);
			});

			it("backward", () => {
				const bits = "110100000 01010"
					.replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.skipPatterns([
					new BitStream({ string: "01" }),
					new BitStream({ string: "0" }),
				], null, null, true);

				assert.strictEqual(res, 2);
			});

			it("start + length", () => {
				const bits = "010100000 011100110 010101"
					.replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.skipPatterns([
					new BitStream({ string: "01" }),
					new BitStream({ string: "0" }),
				], 13, 5);

				assert.strictEqual(res, 16);
			});

		});

		context("skipNotPatterns", () => {

			it("default", () => {
				const bits = "010111000 01010"
					.replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.skipNotPatterns([
					new BitStream({ string: "00" }),
				]);

				assert.strictEqual(res, 6);
			});

			it("backward", () => {
				const bits = "110100000 01010"
					.replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.skipNotPatterns([
					new BitStream({ string: "00" }),
				], null, null, true);

				assert.strictEqual(res, 10);
			});

			it("start + length", () => {
				const bits = "011100000 011100110 010101"
					.replace(/ /g, "");
				const bitStream = new BitStream({ string: bits });
				const res = bitStream.skipNotPatterns([
					new BitStream({ string: "11" }),
				], 4, 10);

				assert.strictEqual(res, 10);
			});

		});

		it("append", () => {
			const bitStream = new BitStream({ string: "11001110 110".replace(/ /g, "") });
			bitStream.append(new BitStream({string: "111"}));

			assert.strictEqual(bitStream.toString(), "11001110 110111".replace(/ /g, ""));
			assert.strictEqual(bitStream.bitsCount, 14);
		});

	});

	it("SeqBitStream class tests", () => {
		// const seqBitStreamClear = new SeqBitStream();
		// TODO write test
	});

	it("parseByteMap tests", () => {
		// TODO write test
	});
});
