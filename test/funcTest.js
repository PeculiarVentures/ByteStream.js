/* eslint-disable no-undef,no-unused-vars */
import { ByteStream, SeqStream, BitStream, SeqBitStream, parseByteMap } from "../src/bytestream";

// noinspection JSUnresolvedFunction
const assert = require("assert");

const data = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A]);
//*********************************************************************************
// noinspection JSUnresolvedFunction
context("Functional testing", () =>
{
	//region Aux function
	function compareWithData(variable, name, testData = data, length = 10)
	{
		assert.equal(variable.length, length, `${name}: Incorrect byteLength for _buffer value`);
		for(let i = 0; i < length; i++)
			assert.equal(variable._view[i], testData[i], `${name}: Incorrect value at index ${i} for _view`);
	}
	//endregion

	// noinspection JSUnresolvedFunction
	it("ByteStream class tests", () =>
	{
		// noinspection JSUnusedLocalSymbols
		const byteStreamClear = new ByteStream({ fiction: 1 });
		
		const byteStreamCopyEmpty = byteStreamClear.copy();
		compareWithData(byteStreamCopyEmpty, "byteStreamCopyEmpty", byteStreamClear._view, byteStreamClear._view.length);
		
		assert.throws(() => byteStreamClear.copy(1, 1), Error, "Incorrect copy parameters must rise an Error");
		
		const byteStreamSliceEmpty = byteStreamClear.slice();
		compareWithData(byteStreamSliceEmpty, "byteStreamSliceEmpty", byteStreamClear._view, byteStreamClear._view.length);
		
		assert.throws(() => byteStreamClear.slice(1, 1), Error, "Incorrect slice parameters must rise an Error");

		const byteStreamLength = new ByteStream({ length: 10 });
		compareWithData(byteStreamLength, "byteStreamLength", [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], 10);
		
		const byteStreamStub = new ByteStream({ length: 10, stub: 0xFF });
		compareWithData(byteStreamStub, "byteStreamStub", [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF], 10);
		
		const byteStreamView = new ByteStream({ view: data });
		compareWithData(byteStreamView, "byteStreamView");
		
		const byteStreamBuffer = new ByteStream({ buffer: data.buffer });
		compareWithData(byteStreamBuffer, "byteStreamBuffer");
		
		assert.equal(byteStreamBuffer.isEqual(byteStreamView), true, "Incorrect comparition in isEqual");
		assert.equal(byteStreamBuffer.isEqualView(byteStreamView._view), true, "Incorrect comparition in isEqual");
		
		const byteStreamString = new ByteStream({ string: "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A" });
		compareWithData(byteStreamString, "byteStreamString");
		assert.equal(byteStreamString.toString(), "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A", "byteStreamString: Incorrect value for toString result #1");
		assert.equal(byteStreamString.toString(-1), "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A", "byteStreamString: Incorrect value for toString result #2");
		assert.equal(byteStreamString.toString(0, 20), "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A", "byteStreamString: Incorrect value for toString result #3");
		assert.equal(byteStreamString.toString(0, -1), "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A", "byteStreamString: Incorrect value for toString result #4");
		assert.equal(byteStreamString.toString(0, 3), "\x01\x02\x03", "byteStreamString: Incorrect value for toString result #5");
		
		const byteStreamCopy = byteStreamString.copy();
		compareWithData(byteStreamCopy, "byteStreamCopy", byteStreamString._view, byteStreamString._view.length);
		
		const byteStreamSlice = byteStreamString.copy();
		compareWithData(byteStreamSlice, "byteStreamSlice", byteStreamString._view, byteStreamString._view.length);

		const byteStreamCopyParameters = byteStreamString.copy(1, 3);
		assert.equal(byteStreamCopyParameters.toHexString(), "020304", "byteStreamCopyParameters: Incorrect value after copy");
		
		assert.equal(byteStreamBuffer.isEqual(byteStreamCopyParameters), false, "Incorrect comparition in isEqual");
		assert.equal(byteStreamBuffer.isEqualView(byteStreamCopyParameters._view), false, "Incorrect comparition in isEqual");
		assert.equal(byteStreamBuffer.isEqual(new ByteStream({ view: new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0C]) })), false, "Incorrect comparition in isEqual");
		assert.equal(byteStreamBuffer.isEqualView(new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0C])), false, "Incorrect comparition in isEqual");

		const byteStreamSliceParameters = byteStreamString.slice(1, 4);
		assert.equal(byteStreamSliceParameters.toHexString(), "020304", "byteStreamSliceParameters: Incorrect value after slice");
		
		byteStreamString.realloc(11);
		compareWithData(byteStreamString, "byteStreamString", [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x00], 11);
		
		byteStreamString.realloc(3);
		compareWithData(byteStreamString, "byteStreamString", [0x01, 0x02, 0x03], 3);
		
		byteStreamString.append(byteStreamString);
		compareWithData(byteStreamString, "byteStreamString", [0x01, 0x02, 0x03, 0x01, 0x02, 0x03], 6);
		
		const byteStreamHexString = new ByteStream({ hexstring: "0102030405060708090AFF" });
		compareWithData(byteStreamHexString, "byteStreamHexString", [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0xFF], 11);
		assert.equal(byteStreamHexString.toHexString(), "0102030405060708090AFF", "byteStreamHexString: Incorrect value for toHexString result #1");
		assert.equal(byteStreamHexString.toHexString(-1), "0102030405060708090AFF", "byteStreamHexString: Incorrect value for toHexString result #2");
		assert.equal(byteStreamHexString.toHexString(0, 20), "0102030405060708090AFF", "byteStreamHexString: Incorrect value for toHexString result #3");
		assert.equal(byteStreamHexString.toHexString(0, -1), "0102030405060708090AFF", "byteStreamHexString: Incorrect value for toHexString result #4");
		assert.equal(byteStreamHexString.toHexString(0, 3), "010203", "byteStreamHexString: Incorrect value for toHexString result #5");
		
		byteStreamString.realloc(3);
		assert.equal(byteStreamString.insert(new ByteStream({ view: new Uint8Array([0xFF, 0xFF, 0xFF]) }), 1, 2), true, "Incorrect result from insert method");
		assert.equal(byteStreamString.toHexString(), "01FFFF", "byteStreamString: Incorrect value after inser method #1");
		assert.equal(byteStreamString.insert(new ByteStream({ view: new Uint8Array([0xFF, 0xFF, 0xFF]) }), 4, 2), false, "Incorrect result from insert method");
		assert.equal(byteStreamString.insert(new ByteStream({ view: new Uint8Array([0xFF, 0xFF]) }), 0, 4), true, "Incorrect result from insert method");
		assert.equal(byteStreamString.insert(new ByteStream({ view: new Uint8Array([0xFF, 0xFF]) })), true, "Incorrect result from insert method");
	});
	
	// noinspection JSUnresolvedFunction
	it("SeqStream class tests", () =>
	{
		// noinspection JSUnusedLocalSymbols
		const seqStreamClear = new SeqStream();
		
		const seqStreamStream = new SeqStream({ stream: new ByteStream({ view: data }), backward: true, appendBlock: 1000 });
		compareWithData(seqStreamStream.stream, "seqStreamStream.stream");
		assert.equal(seqStreamStream.backward, true, "Incorrect backward initialization");
		assert.equal(seqStreamStream.length, 10, "Incorrect length initialization");
		assert.equal(seqStreamStream.start, 10, "Incorrect start initialization");
		assert.equal(seqStreamStream.appendBlock, 1000, "Incorrect appendBlock initialization");
	});
	
	// noinspection JSUnresolvedFunction
	it("BitStream class tests", () =>
	{
		// noinspection JSUnusedLocalSymbols
		const bitStreamClear = new BitStream();
	});
	
	// noinspection JSUnresolvedFunction
	it("SeqBitStream class tests", () =>
	{
		// noinspection JSUnusedLocalSymbols
		const seqBitStreamClear = new SeqBitStream();
	});
	
	// noinspection JSUnresolvedFunction
	it("parseByteMap tests", () =>
	{
	});
});
//*********************************************************************************
