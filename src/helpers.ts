import { ByteStream } from "./byte_stream";

/**
 * Get parsed values from "byte map"
 * @param stream Stream to parse data from
 * @param map Object with information how to parse "byte map"
 * @param elements Number of elements in parsing byte map
 * @param start Start position to parse from
 * @param length Length of byte block to parse from
 * @returns
 */
export function parseByteMap(stream: ByteStream, map: Record<string, any>, elements: number, start: null | number = null, length: null | number = null) {
	/**
	 * Map example:
	 *
	 * let map = [
	 * {
	 * type: "string",
	 * name: "type",
	 * minlength: 1,
	 * maxlength: 1,
	 * func: function(array)
	 * {
	 * let result = {
	 * status: (-1),
	 * length: 1
	 * };
   *
	 * switch(array[0])
	 * {
	 * case 0x6E: // "n"
	 * result.value = "n";
	 * break;
	 * case 0x66: // "f"
	 * result.value = "f";
	 * break;
	 * default:
	 * return result;
	 * }
   *
	 * result.status = 1;
   *
	 * return result;
	 * }
	 * },
	 * {
	 * type: "check",
	 * minlength: 1,
	 * maxlength: 2,
	 * func: function(array)
	 * {
	 * let position = (-1);
   *
	 * if(array[0] == 0x0A)
	 * position = 1;
	 * if(array[1] == 0x0A)
	 * position = 2;
   *
	 * return {
	 * status: (position > 0) ? 1 : (-1),
	 * length: position
	 * };
	 * }
	 * }
	 * ];
	 */

	//#region Initial variables
	if (start === null) {
		start = 0;
	}

	if (start > (stream.buffer.byteLength - 1))
		return false;

	if (length === null) {
		length = stream.buffer.byteLength - start;
	}

	if (length > (stream.buffer.byteLength - start)) {
		length = stream.buffer.byteLength - start;
	}

	let dataView;

	if ((start == 0) && (length == stream.buffer.byteLength))
		dataView = stream.view;
	else
		dataView = new Uint8Array(stream.buffer, start, length);

	const resultArray = new Array(elements);
	let elementsCount = 0;

	let count = 0;
	const mapLength = map.length;
	//#endregion

	//#region Parse all byte, structure by structure
	while (count < length) {
		let structureLength = 0;

		resultArray[elementsCount] = {};

		for (let i = 0; i < mapLength; i++) {
			if (map[i].maxlength == 0) {
				if ("defaultValue" in map[i])
					(resultArray[elementsCount])[map[i].name] = map[i].defaultValue;

				continue;
			}

			const array = new Array(map[i].maxlength);

			for (let j = 0; j < map[i].maxlength; j++) {
				array[j] = dataView[count++];
			}

			const result = (map[i].func)(array);
			if (result.status == (-1)) {
				if (resultArray.length == 1)
					return [];

				return resultArray.slice(0, resultArray.length - 1);
			}

			if (map[i].type != "check")
				(resultArray[elementsCount])[map[i].name] = result.value;

			count -= (map[i].maxlength - result.length);
			structureLength += result.length;
		}

		(resultArray[elementsCount++]).structureLength = structureLength;
	}
	//#endregion

	return resultArray;
}
