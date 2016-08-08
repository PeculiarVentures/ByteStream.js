//**************************************************************************************
export class ByteStream
{
	//**********************************************************************************
	/**
	 * Constructor for ByteStream class
	 * @param {{[length]: number, [stub]: number, [view]: Uint8Array, [buffer]: ArrayBuffer, [string]: string, [hexstring]: string}}parameters
	 */
	constructor(parameters = {})
	{
		this.clear();
		
		for(const key of Object.keys(parameters))
		{
			switch(key)
			{
				case "length":
					this.length = parameters.length;
					break;
				case "stub":
					{
						for(let i = 0; i < this._view.length; i++)
							this._view[i] = parameters.stub;
					}
					break;
				case "view":
					this.fromUint8Array(parameters.view);
					break;
				case "buffer":
					this.fromArrayBuffer(parameters.buffer);
					break;
				case "string":
					this.fromString(parameters.string);
					break;
				case "hexstring":
					this.fromHexString(parameters.hexstring);
					break;
				default:
			}
		}
	}
	//**********************************************************************************
	/**
	 * Setter for "buffer"
	 * @param {ArrayBuffer} value
	 */
	set buffer(value)
	{
		this._buffer = value.slice(0);
		this._view = new Uint8Array(this._buffer);
	}
	//**********************************************************************************
	/**
	 * Getter for "buffer"
	 * @returns {ArrayBuffer}
	 */
	get buffer()
	{
		return this._buffer;
	}
	//**********************************************************************************
	/**
	 * Setter for "view"
	 * @param {Uint8Array} value
	 */
	set view(value)
	{
		this._buffer = new ArrayBuffer(value.length);
		this._view = new Uint8Array(this._buffer);
		
		this._view.set(value);
	}
	//**********************************************************************************
	/**
	 * Getter for "view"
	 * @returns {Uint8Array}
	 */
	get view()
	{
		return this._view;
	}
	//**********************************************************************************
	/**
	 * Getter for "length"
	 * @returns {number}
	 */
	get length()
	{
		return this._buffer.byteLength;
	}
	//**********************************************************************************
	/**
	 * Setter for "length"
	 * @param {number} value
	 */
	set length(value)
	{
		this._buffer = new ArrayBuffer(value);
		this._view = new Uint8Array(this._buffer);
	}
	//**********************************************************************************
	/**
	 * Clear existing stream
	 */
	clear()
	{
		this._buffer = new ArrayBuffer(0);
		this._view = new Uint8Array(this._buffer);
	}
	//**********************************************************************************
	/**
	 * Initialize "Stream" object from existing "ArrayBuffer"
	 * @param {!ArrayBuffer} array The ArrayBuffer to copy from
	 */
	fromArrayBuffer(array)
	{
		this.buffer = array;
	}
	//**********************************************************************************
	/**
	 * Initialize "Stream" object from existing "Uint8Array"
	 * @param {!Uint8Array} array The Uint8Array to copy from
	 */
	fromUint8Array(array)
	{
		this.view = array;
	}
	//**********************************************************************************
	/**
	 *
	 * @param {string} string The string to initialize from
	 */
	fromString(string)
	{
		const stringLength = string.length;
		
		this.length = stringLength;
		
		for(let i = 0; i < stringLength; i++)
			this.view[i] = string.charCodeAt(i);
	}
	//**********************************************************************************
	/**
	 * Represent "Stream" object content as a string
	 * @param {number} [start] Start position to convert to string
	 * @param {number} [length] Length of array to convert to string
	 * @returns {string}
	 */
	toString(start = 0, length = (this.view.length - start))
	{
		//region Initial variables
		let result = "";
		//endregion
		
		//region Check input parameters
		if((start >= this.view.length) || (start < 0))
			start = 0;
		
		if((length >= this.view.length) || (length < 0))
			length = this.view.length - start;
		//endregion
		
		//region Convert array of bytes to string
		for(let i = start; i < (start + length); i++)
			result = result + String.fromCharCode(this.view[i]);
		//endregion
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Initialize "Stream" object from existing hexdecimal string
	 * @param {string} hexString String to initialize from
	 */
	fromHexString(hexString)
	{
		//region Initial variables
		const stringLength = hexString.length;
		
		this.buffer = new ArrayBuffer(stringLength >> 1);
		this.view = new Uint8Array(this.buffer);
		
		const hexMap = new Map();
		
		hexMap.set("0", 0x00);
		hexMap.set("1", 0x01);
		hexMap.set("2", 0x02);
		hexMap.set("3", 0x03);
		hexMap.set("4", 0x04);
		hexMap.set("5", 0x05);
		hexMap.set("6", 0x06);
		hexMap.set("7", 0x07);
		hexMap.set("8", 0x08);
		hexMap.set("9", 0x09);
		hexMap.set("A", 0x0A);
		hexMap.set("a", 0x0A);
		hexMap.set("B", 0x0B);
		hexMap.set("b", 0x0B);
		hexMap.set("C", 0x0C);
		hexMap.set("c", 0x0C);
		hexMap.set("D", 0x0D);
		hexMap.set("d", 0x0D);
		hexMap.set("E", 0x0E);
		hexMap.set("e", 0x0E);
		hexMap.set("F", 0x0F);
		hexMap.set("f", 0x0F);
		
		let j = 0;
		let temp = 0x00;
		//endregion
		
		//region Convert char-by-char
		for(let i = 0; i < stringLength; i++)
		{
			if(!(i % 2))
				temp = hexMap.get(hexString.charAt(i)) << 4;
			else
			{
				temp |= hexMap.get(hexString.charAt(i));
				
				this.view[j] = temp;
				j++;
			}
		}
		//endregion
	}
	//**********************************************************************************
	/**
	 * Represent "Stream" object content as a hexdecimal string
	 * @param {number} [start=0] Start position to convert to string
	 * @param {number} [length=(this.view.length - start)] Length of array to convert to string
	 * @returns {string}
	 */
	toHexString(start = 0, length = (this.view.length - start))
	{
		//region Initial variables
		let result = "";
		//endregion
		
		//region Check input parameters
		if((start >= this.view.length) || (start < 0))
			start = 0;
		
		if((length >= this.view.length) || (length < 0))
			length = this.view.length - start;
		//endregion

		for(let i = start; i < (start + length); i++)
		{
			const str = this.view[i].toString(16).toUpperCase();
			result = result + ((str.length == 1) ? "0" : "") + str;
		}
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Return copy of existing "ArrayBuffer"
	 * @param {number} [start=0] Start position of the copy
	 * @param {number} [length=this.view.length] Length of the copy
	 * @returns {ByteStream}
	 */
	copy(start = 0, length = (this._buffer.byteLength - start))
	{
		//region Check input parameters
		if((start < 0) || (start > (this._buffer.byteLength - 1)))
			throw new Error(`Wrong start position: ${start}`);
		//endregion
		
		const stream = new ByteStream();
		
		stream._buffer = this._buffer.slice(start, start + length);
		stream._view = new Uint8Array(stream._buffer);
		
		return stream;
	}
	//**********************************************************************************
	/**
	 * Return slice of existing "ArrayBuffer"
	 * @param {number} [start=0] Start position of the slice
	 * @param {number} [end=this._buffer.byteLength] End position of the slice
	 * @returns {ByteStream}
	 */
	slice(start = 0, end = this._buffer.byteLength)
	{
		//region Check input parameters
		if((start < 0) || (start > (this._buffer.byteLength - 1)))
			throw new Error(`Wrong start position: ${start}`);
		//endregion
		
		const stream = new ByteStream();
		
		stream._buffer = this._buffer.slice(start, end);
		stream._view = new Uint8Array(stream._buffer);
		
		return stream;
	}
	//**********************************************************************************
	/**
	 * Change size of existing "Stream"
	 * @param {!number} size Size for new "Stream"
	 */
	realloc(size)
	{
		//region Initial variables
		const buffer = new ArrayBuffer(size);
		const view = new Uint8Array(buffer);
		//endregion
		
		//region Create a new ArrayBuffer content
		if(size > this._view.length)
			view.set(this._view);
		else
			view.set(new Uint8Array(this._buffer, 0, size));
		//endregion
		
		//region Initialize "Stream" with new "ArrayBuffer"
		this._buffer = buffer.slice(0);
		this._view = new Uint8Array(this._buffer);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Append a new "stream" content to the current "stream"
	 * @param {ByteStream} stream A new "stream" to append to current "stream"
	 */
	append(stream)
	{
		//region Initial variables
		const initialSize = this._buffer.byteLength;
		const streamViewLength = stream._buffer.byteLength;
		//endregion
		
		//region Re-allocate current internal buffer
		this.realloc(initialSize + streamViewLength);
		//endregion
		
		//region Copy input stream content to a new place
		this._view.set(stream._view, initialSize);
		//endregion
	}
	//**********************************************************************************
	/**
	 * Insert "stream" content to the current "stream" at specific position
	 * @param {ByteStream} stream A new "stream" to insert to current "stream"
	 * @param {number} [start=0] Start position to insert to
	 * @param {number} [length]
	 * @returns {boolean}
	 */
	insert(stream, start = 0, length = (this._buffer.byteLength - start))
	{
		//region Initial variables
		if(start > (this._buffer.byteLength - 1))
			return false;
		
		if(length > (this._buffer.byteLength - start))
			length = this._buffer.byteLength - start;
		//endregion
		
		//region Check input variables
		if(length > stream._buffer.byteLength)
			length = stream._buffer.byteLength;
		//endregion
		
		//region Update content of the current stream
		this._view.set(stream._view, start);
		//endregion
		
		return true;
	}
	//**********************************************************************************
	/**
	 * Check that two "Stream" objects has equal content
	 * @param {ByteStream} stream Stream to compare with
	 * @returns {boolean}
	 */
	isEqual(stream)
	{
		//region Check length of both buffers
		if(this._buffer.byteLength != stream._buffer.byteLength)
			return false;
		//endregion
		
		//region Compare each byte of both buffers
		for(let i = 0; i < stream._buffer.byteLength; i++)
		{
			if(this.view[i] != stream.view[i])
				return false;
		}
		//endregion
		
		return true;
	}
	//**********************************************************************************
	/**
	 * Check that current "Stream" objects has equal content with input "Uint8Array"
	 * @param {Uint8Array} view View to compare with
	 * @returns {boolean}
	 */
	isEqualView(view)
	{
		//region Check length of both buffers
		if(view.length != this.view.length)
			return false;
		//endregion
		
		//region Compare each byte of both buffers
		for(let i = 0; i < view.length; i++)
		{
			if(this.view[i] != view[i])
				return false;
		}
		//endregion
		
		return true;
	}
	//**********************************************************************************
	/**
	 * Find any byte pattern in "Stream"
	 * @param {ByteStream} pattern Stream having pattern value
	 * @param {number|null} [start] Start position to search from
	 * @param {number|null} [length] Length of byte block to search at
	 * @param {boolean} [backward] Flag to search in backward order
	 * @returns {number}
	 */
	findPattern(pattern, start = null, length = null, backward = false)
	{
		//region Check input variables
		if(typeof backward == "undefined")
			backward = false;
		
		if(start == null)
			start = (backward) ? this.buffer.byteLength : 0;
		
		if(start > this.buffer.byteLength)
			start = this.buffer.byteLength;
		
		if(backward)
		{
			if(length == null)
				length = start;
			
			if(length > start)
				length = start;
		}
		else
		{
			if(length == null)
				length = this.buffer.byteLength - start;
			
			if(length > (this.buffer.byteLength - start))
				length = this.buffer.byteLength - start;
		}
		//endregion
		
		//region Initial variables
		const patternLength = pattern.buffer.byteLength;
		if(patternLength > length)
			return (-1);
		//endregion
		
		//region Make a "pre-read" array for pattern
		const patternArray = [];
		for(let i = 0; i < patternLength; i++)
			patternArray.push(pattern.view[i]);
		//endregion
		
		//region Search for pattern
		for(let i = 0; i <= (length - patternLength); i++)
		{
			let equal = true;
			const equalStart = (backward) ? (start - patternLength - i) : (start + i);
			
			for(let j = 0; j < patternLength; j++)
			{
				if(this.view[j + equalStart] != patternArray[j])
				{
					equal = false;
					break;
				}
			}
			
			if(equal)
				return (backward) ? (start - patternLength - i) : (start + patternLength + i); // Position after the pattern found
		}
		//endregion
		
		return (-1);
	}
	//**********************************************************************************
	/**
	 * Find first position of any pattern from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be found
	 * @param {number|null} [start] Start position to search from
	 * @param {number|null} [length] Length of byte block to search at
	 * @param {boolean} [backward=false] Flag to search in backward order
	 * @returns {{id: number, position: number}}
	 */
	findFirstIn(patterns, start = null, length = null, backward = false)
	{
		//region Initial variables
		if(typeof backward == "undefined")
			backward = false;
		
		if(start == null)
			start = (backward) ? this.buffer.byteLength : 0;
		
		if(start > this.buffer.byteLength)
			start = this.buffer.byteLength;
		
		if(backward)
		{
			if(length == null)
				length = start;
			
			if(length > start)
				length = start;
		}
		else
		{
			if(length == null)
				length = this.buffer.byteLength - start;
			
			if(length > (this.buffer.byteLength - start))
				length = this.buffer.byteLength - start;
		}
		
		const result = {
			id: (-1),
			position: (backward) ? 0 : (start + length)
		};
		//endregion
		
		for(const [i, pattern] of patterns.entries())
		{
			const position = this.findPattern(pattern, start, length, backward);
			if(position != (-1))
			{
				let valid = false;
				
				if(backward)
				{
					if(position >= result.position)
						valid = true;
				}
				else
				{
					if(position <= result.position)
						valid = true;
				}
				
				if(valid)
				{
					result.position = position;
					result.id = i;
				}
			}
		}
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Find all positions of any pattern from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be found
	 * @param {number|null} [start] Start position to search from
	 * @param {number|null} [length] Length of byte block to search at
	 * @returns {Array}
	 */
	findAllIn(patterns, start = 0, length = (this.buffer.byteLength - start))
	{
		//region Initial variables
		const result = [];
		
		if(start == null)
			start = 0;
		
		if(start > (this.buffer.byteLength - 1))
			return result;
		
		if(length == null)
			length = this.buffer.byteLength - start;

		if(length > (this.buffer.byteLength - start))
			length = this.buffer.byteLength - start;
		
		let patternFound = {
			id: (-1),
			position: start
		};
		//endregion
		
		//region Find all accurences of patterns
		do
		{
			const position = patternFound.position;
			
			patternFound = this.findFirstIn(patterns, patternFound.position, length);
			
			if(patternFound.id == (-1))
				break;
			
			length -= (patternFound.position - position);
			
			result.push({
				id: patternFound.id,
				position: patternFound.position
			});
		} while(true);
		//endregion
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Find all positions of a pattern
	 * @param {ByteStream} pattern Stream having pattern value
	 * @param {number|null} [start] Start position to search from
	 * @param {number|null} [length] Length of byte block to search at
	 * @returns {Array|number} Array with all pattern positions or (-1) if failed
	 */
	findAllPatternIn(pattern, start = 0, length = (this.buffer.byteLength - start))
	{
		//region Check input variables
		if(start == null)
			start = 0;
		
		if(start > this.buffer.byteLength)
			start = this.buffer.byteLength;
		
		if(length == null)
			length = this.buffer.byteLength - start;
		
		if(length > (this.buffer.byteLength - start))
			length = this.buffer.byteLength - start;
		//endregion
		
		//region Initial variables
		const result = [];
		
		const patternLength = pattern.buffer.byteLength;
		if(patternLength > length)
			return (-1);
		//endregion
		
		//region Make a "pre-read" array for pattern
		const patternArray = Array.from(pattern.view);
		//endregion
		
		//region Search for pattern
		for(let i = 0; i <= (length - patternLength); i++)
		{
			let equal = true;
			const equalStart = start + i;
			
			for(let j = 0; j < patternLength; j++)
			{
				if(this.view[j + equalStart] != patternArray[j])
				{
					equal = false;
					break;
				}
			}
			
			if(equal)
			{
				result.push(start + patternLength + i); // Position after the pattern found
				i += (patternLength - 1); // On next step of "for" we will have "i++"
			}
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Find first position of data, not included in patterns from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @param {number|null} [start] Start position to search from
	 * @param {number|null} [length] Length of byte block to search at
	 * @param {boolean} [backward=false] Flag to search in backward order
	 * @returns {{left: {id: number, position: *}, right: {id: number, position: number}, value: in_window.org.pkijs.ByteStream}}
	 */
	findFirstNotIn(patterns, start = null, length = null, backward = false)
	{
		//region Initial variables
		if(start == null)
			start = (backward) ? this.buffer.byteLength : 0;
		
		if(start > this.buffer.byteLength)
			start = this.buffer.byteLength;
		
		if(backward)
		{
			if(length == null)
				length = start;
			
			if(length > start)
				length = start;
		}
		else
		{
			if(length == null)
				length = this.buffer.byteLength - start;
			
			if(length > (this.buffer.byteLength - start))
				length = this.buffer.byteLength - start;
		}
		
		let result = {
			left: {
				id: (-1),
				position: start
			},
			right: {
				id: (-1),
				position: 0
			},
			value: new ByteStream()
		};
		
		let currentLength = length;
		//endregion
		
		while(currentLength > 0)
		{
			//region Search for nearest "pattern"
			result.right = this.findFirstIn(patterns,
				(backward) ? (start - length + currentLength) : (start + length - currentLength),
				currentLength,
				backward);
			//endregion
			
			//region No pattern at all
			if(result.right.id == (-1))
			{
				length = currentLength;
				
				if(backward)
					start = start - length;
				else
					start = result.left.position;
				
				result.value = new ByteStream();
				
				result.value._buffer = this._buffer.slice(start, start + length);
				result.value._view = new Uint8Array(result.value._buffer);
				
				break;
			}
			//endregion
			
			//region Check distance between two patterns
			if(result.right.position != ((backward) ? (result.left.position - patterns[result.right.id].buffer.byteLength) : (result.left.position + patterns[result.right.id].buffer.byteLength)))
			{
				if(backward)
				{
					start = result.right.position + patterns[result.right.id].buffer.byteLength;
					length = result.left.position - result.right.position - patterns[result.right.id].buffer.byteLength;
				}
				else
				{
					start = result.left.position;
					length = result.right.position - result.left.position - patterns[result.right.id].buffer.byteLength;
				}
				
				result.value = new ByteStream();
				
				result.value._buffer = this._buffer.slice(start, start + length);
				result.value._view = new Uint8Array(result.value._buffer);
				
				break;
			}
			//endregion
			
			//region Store information about previous pattern
			result.left = result.right;
			//endregion
			
			//region Change current length
			currentLength -= patterns[result.right.id]._buffer.byteLength;
			//endregion
		}
		
		//region Swap "patterns" in case of backward order
		if(backward)
		{
			const temp = result.right;
			result.right = result.left;
			result.left = temp;
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Find all positions of data, not included in patterns from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @param {number|null} [start] Start position to search from
	 * @param {number|null} [length] Length of byte block to search at
	 * @returns {Array}
	 */
	findAllNotIn(patterns, start = null, length = null)
	{
		//region Initial variables
		const result = [];
		
		if(start == null)
			start = 0;
		
		if(start > (this.buffer.byteLength - 1))
			return result;
		
		if(length == null)
			length = this.buffer.byteLength - start;
		
		if(length > (this.buffer.byteLength - start))
			length = this.buffer.byteLength - start;
		
		let patternFound = {
			left: {
				id: (-1),
				position: start
			},
			right: {
				id: (-1),
				position: start
			},
			value: new ByteStream()
		};
		//endregion
		
		//region Find all accurences of patterns
		do
		{
			const position = patternFound.right.position;
			
			patternFound = this.findFirstNotIn(patterns, patternFound.right.position, length);
			
			length -= (patternFound.right.position - position);
			
			result.push({
				left: {
					id: patternFound.left.id,
					position: patternFound.left.position
				},
				right: {
					id: patternFound.right.id,
					position: patternFound.right.position
				},
				value: patternFound.value
			});
		} while(patternFound.right.id != (-1));
		//endregion
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Find position of a sequence of any patterns from input array
	 * @param {Array.<ByteStream>} patterns Array of pattern to look for
	 * @param {number|null} [start] Start position to search from
	 * @param {number|null} [length] Length of byte block to search at
	 * @param {boolean} [backward=false] Flag to search in backward order
	 * @returns {*}
	 */
	findFirstSequence(patterns, start = null, length = null, backward = false)
	{
		//region Initial variables
		if(start == null)
			start = (backward) ? this.buffer.byteLength : 0;
		
		if(start > this.buffer.byteLength)
			start = this.buffer.byteLength;
		
		if(backward)
		{
			if(length == null)
				length = start;
			
			if(length > start)
				length = start;
		}
		else
		{
			if(length == null)
				length = this.buffer.byteLength - start;
			
			if(length > (this.buffer.byteLength - start))
				length = this.buffer.byteLength - start;
		}
		//endregion
		
		//region Find first byte from sequence
		const firstIn = this.skipNotPatterns(patterns, start, length, backward);
		if(firstIn == (-1))
		{
			return {
				position: (-1),
				value: new ByteStream()
			};
		}
		//endregion
		
		//region Find first byte not in sequence
		const firstNotIn = this.skipPatterns(patterns,
			firstIn,
			length - ((backward) ? (start - firstIn) : (firstIn - start)),
			backward);
		//endregion
		
		//region Make output value
		if(backward)
		{
			start = firstNotIn;
			length = (firstIn - firstNotIn);
		}
		else
		{
			start = firstIn;
			length = (firstNotIn - firstIn);
		}
		
		const value = new ByteStream();
		
		value._buffer = this._buffer.slice(start, start + length);
		value._view = new Uint8Array(value._buffer);
		//endregion
		
		return {
			position: firstNotIn,
			value
		};
	}
	//**********************************************************************************
	/**
	 * Find all positions of a sequence of any patterns from input array
	 * @param {Array.<ByteStream>} patterns Array of patterns to search for
	 * @param {number|null} [start] Start position to search from
	 * @param {number|null} [length] Length of byte block to search at
	 * @returns {Array}
	 */
	findAllSequences(patterns, start = null, length = null)
	{
		//region Initial variables
		const result = [];
		
		if(start == null)
			start = 0;
		
		if(start > (this.buffer.byteLength - 1))
			return result;
		
		if(length == null)
			length = this.buffer.byteLength - start;
		
		if(length > (this.buffer.byteLength - start))
			length = this.buffer.byteLength - start;
		
		let patternFound = {
			position: start,
			value: new ByteStream()
		};
		//endregion
		
		//region Find all accurences of patterns
		do
		{
			const position = patternFound.position;
			
			patternFound = this.findFirstSequence(patterns, patternFound.position, length);
			
			if(patternFound.position != (-1))
			{
				length -= (patternFound.position - position);
				
				result.push({
					position: patternFound.position,
					value: patternFound.value
				});
			}
			
		} while(patternFound.position != (-1));
		//endregion
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Find all paired patterns in the stream
	 * @param {ByteStream} leftPattern Left pattern to search for
	 * @param {ByteStream} rightPattern Right pattern to search for
	 * @param {number|null} [start=null] Start position to search from
	 * @param {number|null} [length=null] Length of byte block to search at
	 * @returns {Array}
	 */
	findPairedPatterns(leftPattern, rightPattern, start = null, length = null)
	{
		//region Initial variables
		const result = [];
		
		if(leftPattern.isEqual(rightPattern))
			return result;
		
		if(start == null)
			start = 0;
		
		if(start > (this.buffer.byteLength - 1))
			return result;
		
		if(length == null)
			length = this.buffer.byteLength - start;
		
		if(length > (this.buffer.byteLength - start))
			length = this.buffer.byteLength - start;
		
		let currentPositionLeft = 0;
		//endregion
		
		//region Find all "left patterns" as sorted array
		const leftPatterns = this.findAllPatternIn(leftPattern, start, length);
		if(leftPatterns.length == 0)
			return result;
		//endregion
		
		//region Find all "right patterns" as sorted array
		const rightPatterns = this.findAllPatternIn(rightPattern, start, length);
		if(rightPatterns.length == 0)
			return result;
		//endregion
		
		//region Combine patterns
		while(currentPositionLeft < leftPatterns.length)
		{
			if(rightPatterns.length == 0)
				break;
			
			if(leftPatterns[0] == rightPatterns[0])
			{
				// Possible situation when one pattern is a part of another
				// For example "stream" and "endstream"
				// In case when we have only "endstream" in fact "stream" will be also found at the same position
				// (position of the pattern is an index AFTER the pattern)
				
				result.push({
					left: leftPatterns[0],
					right: rightPatterns[0]
				});
				
				leftPatterns.splice(0, 1);
				rightPatterns.splice(0, 1);
				
				continue;
			}
			
			if(leftPatterns[currentPositionLeft] > rightPatterns[0])
				break;
			
			while(leftPatterns[currentPositionLeft] < rightPatterns[0])
			{
				currentPositionLeft++;
				
				if(currentPositionLeft >= leftPatterns.length)
					break;
			}
			
			result.push({
				left: leftPatterns[currentPositionLeft - 1],
				right: rightPatterns[0]
			});
			
			leftPatterns.splice(currentPositionLeft - 1, 1);
			rightPatterns.splice(0, 1);
			
			currentPositionLeft = 0;
		}
		//endregion
		
		//region Sort result
		result.sort((a, b) => (a.left - b.left));
		//endregion
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Find all paired patterns in the stream
	 * @param {Array.<ByteStream>} inputLeftPatterns Array of left patterns to search for
	 * @param {Array.<ByteStream>} inputRightPatterns Array of right patterns to search for
	 * @param {number|null} [start=null] Start position to search from
	 * @param {number|null} [length=null] Length of byte block to search at
	 * @returns {Array}
	 */
	findPairedArrays(inputLeftPatterns, inputRightPatterns, start = null, length = null)
	{
		//region Initial variables
		const result = [];
		
		if(start == null)
			start = 0;
		
		if(start > (this.buffer.byteLength - 1))
			return result;
		
		if(length == null)
			length = this.buffer.byteLength - start;
		
		if(length > (this.buffer.byteLength - start))
			length = this.buffer.byteLength - start;
		
		let currentPositionLeft = 0;
		//endregion
		
		//region Find all "left patterns" as sorted array
		const leftPatterns = this.findAllIn(inputLeftPatterns, start, length);
		if(leftPatterns.length == 0)
			return result;
		//endregion
		
		//region Find all "right patterns" as sorted array
		const rightPatterns = this.findAllIn(inputRightPatterns, start, length);
		if(rightPatterns.length == 0)
			return result;
		//endregion
		
		//region Combine patterns
		while(currentPositionLeft < leftPatterns.length)
		{
			if(rightPatterns.length == 0)
				break;
			
			if(leftPatterns[0].position == rightPatterns[0].position)
			{
				// Possible situation when one pattern is a part of another
				// For example "stream" and "endstream"
				// In case when we have only "endstream" in fact "stream" will be also found at the same position
				// (position of the pattern is an index AFTER the pattern)
				
				result.push({
					left: leftPatterns[0],
					right: rightPatterns[0]
				});
				
				leftPatterns.splice(0, 1);
				rightPatterns.splice(0, 1);
				
				continue;
			}
			
			if(leftPatterns[currentPositionLeft].position > rightPatterns[0].position)
				break;
			
			while(leftPatterns[currentPositionLeft].position < rightPatterns[0].position)
			{
				currentPositionLeft++;
				
				if(currentPositionLeft >= leftPatterns.length)
					break;
			}
			
			result.push({
				left: leftPatterns[currentPositionLeft - 1],
				right: rightPatterns[0]
			});
			
			leftPatterns.splice(currentPositionLeft - 1, 1);
			rightPatterns.splice(0, 1);
			
			currentPositionLeft = 0;
		}
		//endregion
		
		//region Sort result
		result.sort((a, b) => (a.left.position - b.left.position));
		//endregion
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Replace one patter with other
	 * @param {ByteStream} searchPattern The pattern to search for
	 * @param {ByteStream} replacePattern The pattern to replace initial pattern
	 * @param {number|null} [start=null] Start position to search from
	 * @param {number|null} [length=null] Length of byte block to search at
	 * @param {Array|null} [findAllResult=null] Pre-calculated results of "findAllIn"
	 * @returns {*}
	 */
	replacePattern(searchPattern, replacePattern, start = null, length = null, findAllResult = null)
	{
		//region Initial variables
		let result;
		
		let i = 0;
		const output = {
			status: (-1),
			searchPatternPositions: [],
			replacePatternPositions: []
		};
		
		if(start == null)
			start = 0;
		
		if(start > (this.buffer.byteLength - 1))
			return false;
		
		if(length == null)
			length = this.buffer.byteLength - start;
		
		if(length > (this.buffer.byteLength - start))
			length = this.buffer.byteLength - start;
		//endregion
		
		//region Find a pattern to search for
		if(findAllResult == null)
		{
			result = this.findAllIn([searchPattern], start, length);
			if(result.length == 0)
				return output;
		}
		else
			result = findAllResult;
		
		output.searchPatternPositions.push(...Array.from(result, element => element.position));
		//endregion
		
		//region Variables for new buffer initialization
		const patternDifference = searchPattern.buffer.byteLength - replacePattern.buffer.byteLength;
		
		const changedBuffer = new ArrayBuffer(this.view.length - (result.length * patternDifference));
		const changedView = new Uint8Array(changedBuffer);
		//endregion
		
		//region Copy data from 0 to start
		changedView.set(new Uint8Array(this.buffer, 0, start));
		//endregion
		
		//region Replace pattern
		for(i = 0; i < result.length; i++)
		{
			//region Initial variables
			const currentPosition = (i == 0) ? start : result[i - 1].position;
			//endregion
			
			//region Copy bytes other then search pattern
			changedView.set(new Uint8Array(this.buffer, currentPosition, result[i].position - searchPattern.buffer.byteLength - currentPosition), currentPosition - i * patternDifference);
			//endregion
			
			//region Put replace pattern in a new buffer
			changedView.set(replacePattern.view, result[i].position - searchPattern.buffer.byteLength - i * patternDifference);
			
			output.replacePatternPositions.push(result[i].position - searchPattern.buffer.byteLength - i * patternDifference);
			//endregion
		}
		//endregion
		
		//region Copy data from the end of old buffer
		i--;
		changedView.set(new Uint8Array(this.buffer, result[i].position, this.buffer.byteLength - result[i].position), result[i].position - searchPattern.buffer.byteLength + replacePattern.buffer.byteLength - i * patternDifference);
		//endregion
		
		//region Re-initialize existing buffer
		this.buffer = changedBuffer;
		this.view = new Uint8Array(this.buffer);
		//endregion
		
		output.status = 1;
		
		return output;
	}
	//**********************************************************************************
	/**
	 * Skip any pattern from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @param {number|null} [start=null] Start position to search from
	 * @param {number|null} [length=null] Length of byte block to search at
	 * @param {boolean} [backward=false] Flag to search in backward order
	 * @returns {*}
	 */
	skipPatterns(patterns, start = null, length = null, backward = false)
	{
		//region Initial variables
		if(start == null)
			start = (backward) ? this.buffer.byteLength : 0;
		
		if(start > this.buffer.byteLength)
			start = this.buffer.byteLength;
		
		if(backward)
		{
			if(length == null)
				length = start;
			
			if(length > start)
				length = start;
		}
		else
		{
			if(length == null)
				length = this.buffer.byteLength - start;
			
			if(length > (this.buffer.byteLength - start))
				length = this.buffer.byteLength - start;
		}
		
		let result = start;
		//endregion
		
		//region Search for pattern
		for(let k = 0; k < patterns.length; k++)
		{
			const patternLength = patterns[k].buffer.byteLength;
			const equalStart = (backward) ? (result - patternLength) : (result);
			let equal = true;
			
			for(let j = 0; j < patternLength; j++)
			{
				if(this.view[j + equalStart] != patterns[k].view[j])
				{
					equal = false;
					break;
				}
			}
			
			if(equal)
			{
				k = (-1);
				
				if(backward)
				{
					result = result - patternLength;
					if(result <= 0)
						return result;
				}
				else
				{
					result = result + patternLength;
					if(result >= (start + length))
						return result;
				}
			}
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Skip any pattern not from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should not be ommited
	 * @param start
	 * @param length
	 * @param backward
	 * @returns {number}
	 */
	skipNotPatterns(patterns, start, length, backward)
	{
		//region Initial variables
		if(typeof backward == "undefined")
			backward = false;
		
		if((typeof start == "undefined") || (start == null))
			start = (backward) ? this.buffer.byteLength : 0;
		
		if(start > this.buffer.byteLength)
			start = this.buffer.byteLength;
		
		if(backward)
		{
			if((typeof length == "undefined") || (length == null))
				length = start;
			
			if(length > start)
				length = start;
		}
		else
		{
			if((typeof length == "undefined") || (length == null))
				length = this.buffer.byteLength - start;
			
			if(length > (this.buffer.byteLength - start))
				length = this.buffer.byteLength - start;
		}
		
		let result = (-1);
		//endregion
		
		//region Search for pattern
		for(let i = 0; i < length; i++)
		{
			for(let k = 0; k < patterns.length; k++)
			{
				let patternLength = patterns[k].buffer.byteLength;
				let equalStart = (backward) ? (start - i - patternLength) : (start + i);
				let equal = true;
				
				for(let j = 0; j < patternLength; j++)
				{
					if(this.view[j + equalStart] != patterns[k].view[j])
					{
						equal = false;
						break;
					}
				}
				
				if(equal)
				{
					result = (backward) ? (start - i) : (start + i); // Exact position of pattern found
					break;
				}
			}
			
			if(result != (-1))
				break;
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
}
//**************************************************************************************
export class SeqStream 
{
	//**********************************************************************************
	/**
	 * Constructor for "SeqStream" class
	 * @param {{[stream]: ByteStream, [length]: number, [backward]: boolean, [start]: number, [appendBlock]: number}} parameters
	 */
	constructor(parameters = {})
	{
		/**
		 * Major stream
		 * @type {ByteStream}
		 */
		this.stream = new ByteStream();
		/**
		 * Length of the major stream
		 * @type {number}
		 */
		this.length = 0;
		/**
		 * Flag to search in backward direction
		 * @type {boolean}
		 */
		this.backward = false;
		/**
		 * Start position to search
		 * @type {number}
		 */
		this.start = 0;
		/**
		 * Length of a block when append information to major stream
		 * @type {number}
		 */
		this.appendBlock = 0;
		
		for(const key of Object.keys(parameters))
		{
			switch(key)
			{
				case "stream":
					this.stream = parameters.stream;
					break;
				case "backward":
					this.backward = parameters.backward;
					break;
				case "length":
					this.length = parameters.length;
					break;
				case "start":
					this.start = parameters.start;
					break;
				case "appendBlock":
					this.appendBlock = parameters.appendBlock;
					break;
				default:
			}
		}
	}
	//**********************************************************************************
	/**
	 * Setter for "stream" property
	 * @param {ByteStream} value
	 */
	set stream(value)
	{
		this._stream = value;
		this.length = value._buffer.byteLength;
		this.start = 0;
	}
	//**********************************************************************************
	/**
	 * Getter for "stream" property
	 * @returns {ByteStream}
	 */
	get stream()
	{
		return this._stream;
	}
	//**********************************************************************************
	/**
	 * Setter for "length" property
	 * @param {number} value
	 */
	set length(value)
	{
		this.prevLength = this._length;
		this._length = value;
	}
	//**********************************************************************************
	/**
	 * Getter for "length" property
	 * @returns {number}
	 */
	get length()
	{
		return this._length;
	}
	//**********************************************************************************
	/**
	 * Setter for "start" property
	 * @param {number} value
	 */
	set start(value)
	{
		if(value > this.stream.buffer.byteLength)
			return;
		
		//region Initialization of "prev" internal variables
		this.prevStart = this._start;
		this.prevLength = this._length;
		//endregion

		this._length -= ((this.backward) ? (this._start - value) : (value - this._start));
		this._start = value;
	}
	//**********************************************************************************
	/**
	 * Getter for "start" property
	 * @returns {number}
	 */
	get start()
	{
		return this._start;
	}
	//**********************************************************************************
	resetPosition()
	{
		this._start = this.prevStart;
		this._length = this.prevLength;
	}
	//**********************************************************************************
	/**
	 * Find any byte pattern in "ByteStream"
	 * @param {ByteStream} pattern Stream having pattern value
	 * @param {number|null} [gap] Maximum gap between start position and position of nearest object
	 * @returns {number}
	 */
	findPattern(pattern, gap = null)
	{
		//region Initial variables
		if((gap == null) || (gap > this.length))
			gap = this.length;
		//endregion
		
		//region Find pattern
		const result = this.stream.findPattern(pattern, this.start, this.length, this.backward);
		if(result == (-1))
			return result;
		
		if(this.backward)
		{
			if(result < (this.start - pattern.buffer.byteLength - gap))
				return (-1);
		}
		else
		{
			if(result > (this.start + pattern.buffer.byteLength + gap))
				return (-1);
		}
		//endregion
		
		//region Create new values
		if(this.backward)
			this.length -= (this.start - result);
		else
			this.length -= (result - this.start);
		
		this.start = result;
		//endregion ;
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Find first position of any pattern from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be found
	 * @param {number|null} [gap] Maximum gap between start position and position of nearest object
	 * @returns {{id: number, position: number}}
	 */
	findFirstIn(patterns, gap = null)
	{
		//region Initial variables
		if((gap == null) || (gap > this.length))
			gap = this.length;
		//endregion
		
		//region Search for patterns
		const result = this.stream.findFirstIn(patterns, this.start, this.length, this.backward);
		if(result.id == (-1))
			return result;
		
		if(this.backward)
		{
			if(result.position < (this.start - patterns[result.id].buffer.byteLength - gap))
			{
				return {
					id: (-1),
					position: (this.backward) ? 0 : (this.start + this.length)
				};
			}
		}
		else
		{
			if(result.position > (this.start + patterns[result.id].buffer.byteLength + gap))
			{
				return {
					id: (-1),
					position: (this.backward) ? 0 : (this.start + this.length)
				};
			}
		}
		//endregion
		
		//region Create new values
		if(this.backward)
			this.length -= (this.start - result.position);
		else
			this.length -= (result.position - this.start);
		
		this.start = result.position;
		//endregion ;
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Find all positions of any pattern from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be found
	 * @returns {Array}
	 */
	findAllIn(patterns)
	{
		// In case of "backward order" the start position is at the end on stream.
		// In case of "normal order" the start position is at the begging of the stream.
		// But in fact for search for all patterns we need to have start position in "normal order".
		const start = (this.backward) ? (this.start - this.length) : this.start;
		
		return this.stream.findAllIn(patterns, start, this.length);
	}
	//**********************************************************************************
	/**
	 * Find first position of data, not included in patterns from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @param {number|null} gap Maximum gap between start position and position of nearest object
	 * @returns {*}
	 */
	findFirstNotIn(patterns, gap = null)
	{
		//region Initial variables
		if((gap === null) || (gap > this.length))
			gap = this.length;
		//endregion
		
		//region Search for patterns
		const result = this.stream.findFirstNotIn(patterns, this.start, this.length, this.backward);
		if((result.left.id == (-1)) && (result.right.id == (-1)))
			return result;
		
		if(this.backward)
		{
			if(result.right.id != (-1))
			{
				if(result.right.position < (this.start - patterns[result.right.id].buffer.byteLength - gap))
				{
					return {
						left: {
							id: (-1),
							position: this.start
						},
						right: {
							id: (-1),
							position: 0
						},
						value: new ByteStream()
					};
				}
			}
		}
		else
		{
			if(result.left.id != (-1))
			{
				if(result.left.position > (this.start + patterns[result.left.id].buffer.byteLength + gap))
				{
					return {
						left: {
							id: (-1),
							position: this.start
						},
						right: {
							id: (-1),
							position: 0
						},
						value: new ByteStream()
					};
				}
			}
		}
		//endregion
		
		//region Create new values
		if(this.backward)
		{
			if(result.left.id == (-1))
			{
				this.length = 0;
				this.start = 0;
			}
			else
			{
				this.length -= (this.start - result.left.position);
				this.start = result.left.position;
			}
		}
		else
		{
			if(result.right.id == (-1))
			{
				this.start = (this.start + this.length);
				this.length = 0;
			}
			else
			{
				this.length -= (result.right.position - this.start);
				this.start = result.right.position;
			}
		}
		//endregion ;
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Find all positions of data, not included in patterns from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @returns {Array}
	 */
	findAllNotIn(patterns)
	{
		// In case of "backward order" the start position is at the end on stream.
		// In case of "normal order" the start position is at the begging of the stream.
		// But in fact for search for all patterns we need to have start position in "normal order".
		const start = (this.backward) ? (this.start - this.length) : this.start;
		
		return this.stream.findAllNotIn(patterns, start, this.length);
	}
	//**********************************************************************************
	/**
	 * Find position of a sequence of any patterns from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @param {number|null} [length] Length to search sequence for
	 * @param {number|null} [gap] Maximum gap between start position and position of nearest object
	 * @returns {*}
	 */
	findFirstSequence(patterns, length = null, gap = null)
	{
		//region Initial variables
		if((length === null) || (length > this.length))
			length = this.length;
		
		if((gap === null) || (gap > length))
			gap = length;
		//endregion
		
		//region Search for sequence
		const result = this.stream.findFirstSequence(patterns, this.start, length, this.backward);
		if(result.value.buffer.byteLength == 0)
			return result;
		
		if(this.backward)
		{
			if(result.position < (this.start - result.value.buffer.byteLength - gap))
			{
				return {
					position: (-1),
					value: new ByteStream()
				};
			}
		}
		else
		{
			if(result.position > (this.start + result.value.buffer.byteLength + gap))
			{
				return {
					position: (-1),
					value: new ByteStream()
				};
			}
		}
		//endregion
		
		//region Create new values
		if(this.backward)
			this.length -= (this.start - result.position);
		else
			this.length -= (result.position - this.start);
		
		this.start = result.position;
		//endregion ;
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Find position of a sequence of any patterns from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be found
	 * @returns {Array}
	 */
	findAllSequences(patterns)
	{
		// In case of "backward order" the start position is at the end on stream.
		// In case of "normal order" the start position is at the begging of the stream.
		// But in fact for search for all patterns we need to have start position in "normal order".
		const start = (this.backward) ? (this.start - this.length) : this.start;
		
		return this.stream.findAllSequences(patterns, start, this.length);
	}
	//**********************************************************************************
	/**
	 * Find all paired patterns in the stream
	 * @param {ByteStream} leftPattern Left pattern to search for
	 * @param {ByteStream} rightPattern Right pattern to search for
	 * @param {number|null} [gap] Maximum gap between start position and position of nearest object
	 * @returns {Array}
	 */
	findPairedPatterns(leftPattern, rightPattern, gap = null)
	{
		//region Initial variables
		if((gap === null) || (gap > this.length))
			gap = this.length;
		//endregion
		
		// In case of "backward order" the start position is at the end on stream.
		// In case of "normal order" the start position is at the begging of the stream.
		// But in fact for search for all patterns we need to have start position in "normal order".
		const start = (this.backward) ? (this.start - this.length) : this.start;
		
		//region Search for patterns
		const result = this.stream.findPairedPatterns(leftPattern, rightPattern, start, this.length);
		if(result.length)
		{
			if(this.backward)
			{
				if(result[0].right < (this.start - rightPattern.buffer.byteLength - gap))
					return [];
			}
			else
			{
				if(result[0].left > (this.start + leftPattern.buffer.byteLength + gap))
					return [];
			}
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Find all paired patterns in the stream
	 * @param {Array.<ByteStream>} leftPatterns Array of left patterns to search for
	 * @param {Array.<ByteStream>} rightPatterns Array of right patterns to search for
	 * @param {number|null} [gap] Maximum gap between start position and position of nearest object
	 * @returns {Array}
	 */
	findPairedArrays(leftPatterns, rightPatterns, gap = null)
	{
		//region Initial variables
		if((gap === null) || (gap > this.length))
			gap = this.length;
		//endregion
		
		// In case of "backward order" the start position is at the end on stream.
		// In case of "normal order" the start position is at the begging of the stream.
		// But in fact for search for all patterns we need to have start position in "normal order".
		const start = (this.backward) ? (this.start - this.length) : this.start;
		
		//region Search for patterns
		const result = this.stream.findPairedArrays(leftPatterns, rightPatterns, start, this.length);
		if(result.length)
		{
			if(this.backward)
			{
				if(result[0].right.position < (this.start - rightPatterns[result[0].right.id].buffer.byteLength - gap))
					return [];
			}
			else
			{
				if(result[0].left.position > (this.start + leftPatterns[result[0].left.id].buffer.byteLength + gap))
					return [];
			}
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Replace one patter with other
	 * @param {ByteStream} searchPattern The pattern to search for
	 * @param {ByteStream} replacePattern The pattern to replace initial pattern
	 * @returns {*}
	 */
	replacePattern(searchPattern, replacePattern)
	{
		// In case of "backward order" the start position is at the end on stream.
		// In case of "normal order" the start position is at the begging of the stream.
		// But in fact for search for all patterns we need to have start position in "normal order".
		const start = (this.backward) ? (this.start - this.length) : this.start;
		
		return this.stream.replacePattern(searchPattern, replacePattern, start, this.length);
	}
	//**********************************************************************************
	/**
	 * Skip of any pattern from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @returns {*}
	 */
	skipPatterns(patterns)
	{
		const result = this.stream.skipPatterns(patterns, this.start, this.length, this.backward);
		
		//region Create new values
		if(this.backward)
			this.length -= (this.start - result);
		else
			this.length -= (result - this.start);
		
		this.start = result;
		//endregion ;
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Skip of any pattern from input array
	 * @param {Array.<ByteStream>} patterns Array with patterns which should be ommited
	 * @returns {number}
	 */
	skipNotPatterns(patterns)
	{
		const result = this.stream.skipNotPatterns(patterns, this.start, this.length, this.backward);
		if(result == (-1))
			return (-1);
		
		//region Create new values
		if(this.backward)
			this.length -= (this.start - result);
		else
			this.length -= (result - this.start);
		
		this.start = result;
		//endregion ;
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Append a new "stream" content to the current "stream"
	 * @param {ByteStream} stream A new "stream" to append to current "stream"
	 */
	append(stream)
	{
		if((this.start + stream.buffer.byteLength) > this.stream.buffer.byteLength)
		{
			if(stream.buffer.byteLength > this.appendBlock)
				this.appendBlock = (stream.buffer.byteLength + 1000);
			
			this.stream.realloc(this.stream.buffer.byteLength + this.appendBlock);
		}
		
		this.stream.view.set(stream.view, this.start);
		this.start += stream.buffer.byteLength;
	}
	//**********************************************************************************
	/**
	 * Append a "view" content to the current "stream"
	 * @param {Uint8Array} view A new "view" to append to current "stream"
	 */
	appendView(view)
	{
		if((this.start + view.length) > this.stream.buffer.byteLength)
		{
			if(view.length > this.appendBlock)
				this.appendBlock = (view.length + 1000);
			
			this.stream.realloc(this.stream.buffer.byteLength + this.appendBlock);
		}
		
		this.stream.view.set(view, this.start);
		this.start += view.length;
	}
	//**********************************************************************************
	/**
	 * Append a new char to the current "stream"
	 * @param {number} char A new char to append to current "stream"
	 */
	appendChar(char)
	{
		if((this.start + 1) > this.stream.buffer.byteLength)
			this.stream.realloc(this.stream.buffer.byteLength + this.appendBlock);
		
		this.stream.view[this.start] = char;
		this.start += 1;
	}
	//**********************************************************************************
}
//**************************************************************************************
/**
 * Get parsed values from "byte map"
 * @param {ByteStream} stream Stream to parse data from
 * @param {Object} map Object with information how to parse "byte map"
 * @param {number} elements Number of elements in parsing byte map
 * @param {number|null} [start=null] Start position to parse from
 * @param {number|null} [length=null] Length of byte block to parse from
 * @returns {*}
 */
export function parseByteMap(stream, map, elements, start = null, length = null)
{
	/*
	 Map example:
	 
	 let map = [
	 {
	 type: "string",
	 name: "type",
	 minlength: 1,
	 maxlength: 1,
	 func: function(array)
	 {
	 let result = {
	 status: (-1),
	 length: 1
	 };
	 
	 switch(array[0])
	 {
	 case 0x6E: // "n"
	 result.value = "n";
	 break;
	 case 0x66: // "f"
	 result.value = "f";
	 break;
	 default:
	 return result;
	 }
	 
	 result.status = 1;
	 
	 return result;
	 }
	 },
	 {
	 type: "check",
	 minlength: 1,
	 maxlength: 2,
	 func: function(array)
	 {
	 let position = (-1);
	 
	 if(array[0] == 0x0A)
	 position = 1;
	 if(array[1] == 0x0A)
	 position = 2;
	 
	 return {
	 status: (position > 0) ? 1 : (-1),
	 length: position
	 };
	 }
	 }
	 ];
	 */
	
	//region Initial variables
	if(start === null)
		start = 0;
	
	if(start > (stream.buffer.byteLength - 1))
		return false;
	
	if(length === null)
		length = stream.buffer.byteLength - start;
	
	if(length > (stream.buffer.byteLength - start))
		length = stream.buffer.byteLength - start;
	
	let dataView;
	
	if((start == 0) && (length == stream.buffer.byteLength))
		dataView = stream.view;
	else
		dataView = new Uint8Array(stream.buffer, start, length);
	
	const resultArray = new Array(elements);
	let elementsCount = 0;
	
	let count = 0;
	const mapLength = map.length;
	//endregion
	
	//region Parse all byte, structure by structure
	while(count < length)
	{
		let structureLength = 0;
		
		resultArray[elementsCount] = {};
		
		for(let i = 0; i < mapLength; i++)
		{
			if(map[i].maxlength == 0)
				continue;
			
			const array = new Array(map[i].maxlength);
			
			for(let j = 0; j < map[i].maxlength; j++)
				array[j] = dataView[count++];
			
			const result = (map[i].func)(array);
			if(result.status == (-1))
				return result;
			
			if(map[i].type != "check")
				(resultArray[elementsCount])[map[i].name] = result.value;
			
			count -= (map[i].maxlength - result.length);
			structureLength += result.length;
		}
		
		(resultArray[elementsCount++])["structureLength"] = structureLength;
	}
	//endregion
	
	return resultArray;
}
//**************************************************************************************
//region "Bits-to-string" array
const bitsToStringArray = [
	"00000000", "00000001", "00000010",
	"00000011", "00000100", "00000101",
	"00000110", "00000111", "00001000",
	"00001001", "00001010", "00001011",
	"00001100", "00001101", "00001110",
	"00001111", "00010000", "00010001",
	"00010010", "00010011", "00010100",
	"00010101", "00010110", "00010111",
	"00011000", "00011001", "00011010",
	"00011011", "00011100", "00011101",
	"00011110", "00011111", "00100000",
	"00100001", "00100010", "00100011",
	"00100100", "00100101", "00100110",
	"00100111", "00101000", "00101001",
	"00101010", "00101011", "00101100",
	"00101101", "00101110", "00101111",
	"00110000", "00110001", "00110010",
	"00110011", "00110100", "00110101",
	"00110110", "00110111", "00111000",
	"00111001", "00111010", "00111011",
	"00111100", "00111101", "00111110",
	"00111111", "01000000", "01000001",
	"01000010", "01000011", "01000100",
	"01000101", "01000110", "01000111",
	"01001000", "01001001", "01001010",
	"01001011", "01001100", "01001101",
	"01001110", "01001111", "01010000",
	"01010001", "01010010", "01010011",
	"01010100", "01010101", "01010110",
	"01010111", "01011000", "01011001",
	"01011010", "01011011", "01011100",
	"01011101", "01011110", "01011111",
	"01100000", "01100001", "01100010",
	"01100011", "01100100", "01100101",
	"01100110", "01100111", "01101000",
	"01101001", "01101010", "01101011",
	"01101100", "01101101", "01101110",
	"01101111", "01110000", "01110001",
	"01110010", "01110011", "01110100",
	"01110101", "01110110", "01110111",
	"01111000", "01111001", "01111010",
	"01111011", "01111100", "01111101",
	"01111110", "01111111", "10000000",
	"10000001", "10000010", "10000011",
	"10000100", "10000101", "10000110",
	"10000111", "10001000", "10001001",
	"10001010", "10001011", "10001100",
	"10001101", "10001110", "10001111",
	"10010000", "10010001", "10010010",
	"10010011", "10010100", "10010101",
	"10010110", "10010111", "10011000",
	"10011001", "10011010", "10011011",
	"10011100", "10011101", "10011110",
	"10011111", "10100000", "10100001",
	"10100010", "10100011", "10100100",
	"10100101", "10100110", "10100111",
	"10101000", "10101001", "10101010",
	"10101011", "10101100", "10101101",
	"10101110", "10101111", "10110000",
	"10110001", "10110010", "10110011",
	"10110100", "10110101", "10110110",
	"10110111", "10111000", "10111001",
	"10111010", "10111011", "10111100",
	"10111101", "10111110", "10111111",
	"11000000", "11000001", "11000010",
	"11000011", "11000100", "11000101",
	"11000110", "11000111", "11001000",
	"11001001", "11001010", "11001011",
	"11001100", "11001101", "11001110",
	"11001111", "11010000", "11010001",
	"11010010", "11010011", "11010100",
	"11010101", "11010110", "11010111",
	"11011000", "11011001", "11011010",
	"11011011", "11011100", "11011101",
	"11011110", "11011111", "11100000",
	"11100001", "11100010", "11100011",
	"11100100", "11100101", "11100110",
	"11100111", "11101000", "11101001",
	"11101010", "11101011", "11101100",
	"11101101", "11101110", "11101111",
	"11110000", "11110001", "11110010",
	"11110011", "11110100", "11110101",
	"11110110", "11110111", "11111000",
	"11111001", "11111010", "11111011",
	"11111100", "11111101", "11111110",
	"11111111"
];
//endregion
//**************************************************************************************
export class BitStream
{
	//**********************************************************************************
	/**
	 * Constructor for "BitStream" class
	 * @param {{[byteStream]: ByteStream, [view]: Uint8Array, [buffer]: ArrayBuffer, [string]: string, [bitsCount]: number}} parameters
	 */
	constructor(parameters = {})
	{
		this.buffer = new ArrayBuffer(0);
		this.view = new Uint8Array(this.buffer);
		
		this.bitsCount = 0; // Number of bits stored in current "BitStream"
		
		for(const key of Object.keys(parameters))
		{
			switch(key)
			{
				case "byteStream":
					this.fromByteStream(parameters.byteStream);
					break;
				case "view":
					this.fromUint8Array(parameters.view);
					break;
				case "buffer":
					this.fromArrayBuffer(parameters.buffer);
					break;
				case "string":
					this.fromString(parameters.string);
					break;
				case "bitsCount":
					this.bitsCount = parameters.bitsCount;
					break;
				default:
			}
		}
	}
	//**********************************************************************************
	/**
	 * Clear existing stream
	 */
	clear()
	{
		this.buffer = new ArrayBuffer(0);
		this.view = new Uint8Array(this.buffer);
		
		this.bitsCount = 0;
	}
	//**********************************************************************************
	/**
	 * Initialize "BitStream" by data from existing "ByteStream"
	 * @param {ByteStream} stream
	 */
	fromByteStream(stream)
	{
		this.buffer = stream.buffer.slice();
		this.view = new Uint8Array(this.buffer);
		
		this.bitsCount = this.view.length << 3;
	}
	//**********************************************************************************
	/**
	 * Initialize "BitStream" object from existing "ArrayBuffer"
	 * @param {ArrayBuffer} array The ArrayBuffer to copy from
	 */
	fromArrayBuffer(array)
	{
		this.buffer = array.slice(0);
		this.view = new Uint8Array(this.buffer);
		
		this.bitsCount = this.view.length << 3;
	}
	//**********************************************************************************
	/**
	 * Initialize "BitStream" object from existing "Uint8Array"
	 * @param {Uint8Array} array The Uint8Array to copy from
	 */
	fromUint8Array(array)
	{
		this.buffer = new ArrayBuffer(array.length);
		this.view = new Uint8Array(this.buffer);
		
		this.view.set(array);
		
		this.bitsCount = this.view.length << 3;
	}
	//**********************************************************************************
	/**
	 * Initialize "BitStream" object from existing bit string
	 * @param {string} string The string to initialize from
	 */
	fromString(string)
	{
		//region Initial variables
		const stringLength = string.length;
		
		this.buffer = new ArrayBuffer((stringLength >> 3) + ((stringLength % 8) ? 1 : 0));
		this.view = new Uint8Array(this.buffer);
		
		this.bitsCount = ((stringLength >> 3) + 1) << 3; // In order to handle correct shifting
		
		let byteIndex = 0;
		//endregion
		
		//region Convert from "bit string" to bytes
		for(let i = 0; i < stringLength; i++)
		{
			if(string[i] == "1")
				this.view[byteIndex] |= 1 << (7 - (i % 8));
			
			if(i && (((i + 1) % 8) == 0))
				byteIndex++;
		}
		//endregion
		
		//region Shift "BitStream" into correct position
		if(stringLength % 8)
			this.shiftRight(8 - (stringLength % 8));
		//endregion
		
		//region Change "bitsCount"
		this.bitsCount = stringLength;
		//endregion
	}
	//**********************************************************************************
	/**
	 * Represent "BitStream" object content as a string
	 * @param {number|null} [start=null] Start number to convert to string from
	 * @param {number|null} [length=null] Length of BitStream to convert to string
	 * @returns {string}
	 */
	toString(start = null, length = null)
	{
		//region Check input parameters
		if(start == null)
			start = 0;
		
		if((start >= this.view.length) || (start < 0))
			start = 0;
		
		if(length == null)
			length = this.view.length - start;
		
		if((length >= this.view.length) || (length < 0))
			length = this.view.length - start;
		//endregion
		
		//region Initial variables
		const result = [];
		//endregion
		
		//region Convert from bytes to "bit string"
		for(let i = start; i < (start + length); i++)
			result.push(bitsToStringArray[this.view[i]]);
		//endregion
		
		return result.join("").slice((this.view.length << 3) - this.bitsCount);
	}
	//**********************************************************************************
	/**
	 * Shift entire "BitStream" value right to number of bits
	 * @param {number} shift Number of bits to shift value
	 * @param {boolean} [needShrink=true] Need to shrink result or not
	 */
	shiftRight(shift, needShrink = true)
	{
		//region Check parameters
		if(this.view.length == 0)
			return;
		
		if((shift < 0) || (shift > 8))
			throw new Error("The \"shift\" parameter must be in range 0-8");
		
		if(shift > this.bitsCount)
			throw new Error("The \"shift\" parameter can not be bigger than \"this.bitsCount\"");
		//endregion
		
		//region Initial variables
		const shiftMask = 0xFF >> (8 - shift);
		this.view[this.view.length - 1] >>= shift;
		//endregion
		
		//region Shift value
		for(let i = (this.view.length - 2); i >= 0; i--)
		{
			const shiftedBits = (this.view[i] & shiftMask) << (8 - shift);
			this.view[i + 1] |= shiftedBits;
			this.view[i] >>= shift;
		}
		//endregion
		
		//region Decrease number of bits stored into value
		this.bitsCount -= shift;
		if(this.bitsCount == 0)
			this.clear();
		//endregion
		
		//region Change stream size if needed
		if(needShrink)
			this.shrink();
		//endregion
	}
	//**********************************************************************************
	/**
	 * Shift entire "BitStream" value left to number of bits
	 * @param {number} shift Number of bits to shift value
	 */
	shiftLeft(shift)
	{
		/*
		 NOTE: We do not really shift value because of internal structure of "BitStream":
		 all bytes inside "BitStream" are aligned to right position. So, even if we will
		 really shift value to left after that we will need again shift it right to the
		 same number of bits. Thus all that we do here is hiding of left bits and descresing
		 the "bitsCount" number.
		 */
		
		//region Check parameters
		if(this.view.length == 0)
			return;
		
		if((shift < 0) || (shift > 8))
			throw new Error("The \"shift\" parameter must be in range 0-8");
		
		if(shift > this.bitsCount)
			throw new Error("The \"shift\" parameter can not be bigger than \"this.bitsCount\"");
		//endregion
		
		//region Remove shifted bits
		const bitsOffset = this.bitsCount & 0x07;
		if(bitsOffset > shift)
			this.view[0] &= 0xFF >> (bitsOffset + shift);
		else
		{
			//region Change size of buffer
			const buffer = new ArrayBuffer(this.buffer.byteLength - 1);
			const view = new Uint8Array(buffer);
			
			view.set(new Uint8Array(this.buffer, 1, this.buffer.byteLength - 1));
			//endregion
			
			//region Mask item with index 0
			view[0] &= 0xFF >> (shift - bitsOffset);
			//endregion
			
			//region Store final array into current stream
			this.buffer = buffer.slice();
			this.view = new Uint8Array(this.buffer);
			//endregion
		}
		//endregion
		
		//region Decrease number of bits stored into value
		this.bitsCount -= shift;
		if(this.bitsCount == 0)
			this.clear();
		//endregion
	}
	//**********************************************************************************
	/**
	 * Return slice of existing "BitStream"
	 * @param {number|null} [start=null] Start position of the slice (in bits)
	 * @param {number|null} [end=null] End position of the slice (in bits)
	 * @returns {BitStream}
	 */
	slice(start = null, end = null)
	{
		//region Make ability to pass non-value bits
		let valueShift = 0;
		if(this.bitsCount % 8)
			valueShift = (8 - (this.bitsCount % 8));
		
		start += valueShift;
		end += valueShift;
		//endregion
		
		//region Initial variables
		if(start == null)
			start = 0;
		
		if((start < 0) || (start > ((this.view.length << 3) - 1)))
			return new BitStream(); //("Wrong start position: " + start);
		
		if((typeof end == "undefined") || (end == null))
			end = (this.view.length << 3) - 1;
		
		if((end < 0) || (end > ((this.view.length << 3) - 1)))
			return new BitStream(); //("Wrong end position: " + end);
		
		if((end - start + 1) > this.bitsCount)
			return new BitStream(); //("Maximum length is " + this.bitsCount);
		
		const startIndex = start >> 3;
		const startOffset = start & 0x07;
		
		const endIndex = end >> 3;
		const endOffset = end & 0x07;
		
		const bitsLength = ((endIndex - startIndex) == 0) ? 1 : (endIndex - startIndex + 1);
		
		const result = new BitStream();
		//endregion
		
		//region Store "primary bytes"
		result.buffer = new ArrayBuffer(bitsLength);
		result.view = new Uint8Array(result.buffer);
		result.bitsCount = bitsLength << 3;
		
		result.view.set(new Uint8Array(this.buffer, startIndex, bitsLength));
		//endregion
		
		//region Change "start byte"
		result.view[0] &= (0xFF >> startOffset);
		//endregion
		
		//region Change "end byte"
		result.view[bitsLength] &= (0xFF << (7 - endOffset));
		//endregion
		
		//region Shift result array to right
		if(7 - endOffset)
			result.shiftRight(7 - endOffset, false);
		//endregion
		
		//region Set final number of bits
		result.bitsCount = (end - start + 1);
		//endregion
		
		//region Cut unnecessary bytes from result
		result.shrink();
		//endregion
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Return copy of existing "BitStream"
	 * @param {number|null} [start=null] Start position of the copy (in bits)
	 * @param {number|null} [length=null] Length of the copy (in bits)
	 * @returns {BitStream}
	 */
	copy(start = null, length = null)
	{
		//region Check input parameters
		if((start < 0) || (start > ((this.view.length << 3) - 1)))
			return new BitStream(); //("Wrong start position: " + start);
		
		if(length === null)
			length = (this.view.length << 3) - start - 1;
		
		if(length > this.bitsCount)
			return new BitStream(); //("Maximum length is " + this.bitsCount);
		//endregion
		
		return this.slice(start, start + length - 1);
	}
	//**********************************************************************************
	/**
	 * Shrink unnecessary bytes in current stream accordingly to "bitsCount" value
	 */
	shrink()
	{
		const currentLength = (this.bitsCount >> 3) + ((this.bitsCount % 8) ? 1 : 0);
		if(currentLength < this.buffer.byteLength)
		{
			//region Change size of buffer
			const buffer = new ArrayBuffer(currentLength);
			const view = new Uint8Array(buffer);
			
			view.set(new Uint8Array(this.buffer, this.buffer.byteLength - currentLength, currentLength));
			//endregion
			
			//region Store final array into current stream
			this.buffer = buffer.slice();
			this.view = new Uint8Array(this.buffer);
			//endregion
		}
	}
	//**********************************************************************************
}
//**************************************************************************************
export class SeqBitStream
{
	//**********************************************************************************
	constructor(parameters = {})
	{
		//region Internal variables
		this.stream = new BitStream();
		
		this.start = 0;
		this.length = this.stream.bitsCount;
		
		this.backward = false;
		
		this.appendBlock = 0;
		//endregion
		
		for(const key of Object.keys(parameters))
		{
			switch(key)
			{
				case "stream":
				case "start":
				case "length":
				case "backward":
				case "appendBlock":
					this[key] = parameters[key];
					break;
				default:
			}
		}
	}
	//**********************************************************************************
	set start(value)
	{
		if(value > this.stream.bitsCount)
			return;
		
		this._length -= ((this.backward) ? (this._start - value) : (value - this._start));
		this._start = value;
		
		//region Initialization of "prev" internal variables
		this.prevStart = this._start;
		this.prevLength = this._length;
		//endregion
	}
	//**********************************************************************************
	get start()
	{
		return this._start;
	}
	//**********************************************************************************
	set length(value)
	{
		if(value > this.stream.bitsCount)
			return;

		this.prevLength = this._length;
		this._length = value;
	}
	//**********************************************************************************
	get length()
	{
		return this._length;
	}
	//**********************************************************************************
	/**
	 * Get next "length" bits from the stream
	 * @param {number} length Number of bits to read
	 * @returns {*}
	 */
	getBits(length)
	{
		//region Check input parameters 
		if((this.start + length) > this.stream.bitsCount)
			length = (this.stream.bitsCount - this.start);
		//endregion 
		
		//region Initial variables 
		let result;
		//endregion 
		
		//region Copy necessary length of bits
		if(this.backward)
		{
			result = this.stream.copy(this.start - length, length);
			this.start -= result.bitsCount;
		}
		else
		{
			result = this.stream.copy(this.start, length);
			this.start += result.bitsCount;
		}
		//endregion
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Get string representation for the next "length" bits from the stream
	 * @param {number} length Number of bits to read
	 * @returns {Array}
	 */
	getBitsString(length)
	{
		//region Check input parameters
		if((this.start + length) > this.stream.bitsCount)
			length = (this.stream.bitsCount - this.start);
		//endregion
		
		//region Initial variables
		let result = [];
		
		let start;
		
		if(this.backward)
			start = this.start - length;
		else
			start = this.start;
		
		let end = this.start + length - 1;
		
		//region Make ability to pass non-value bits
		let valueShift = 0;
		if(this.stream.bitsCount % 8)
			valueShift = (8 - (this.stream.bitsCount % 8));
		
		start += valueShift;
		end += valueShift;
		//endregion
		
		const startIndex = start >> 3;
		const startOffset = start & 0x07;
		
		const endIndex = end >> 3;
		const endOffset = end & 0x07;
		
		const bitsLengthIndex = startIndex + (((endIndex - startIndex) == 0) ? 1 : (endIndex - startIndex + 1));
		//endregion
		
		//region Get string representation of bits
		for(let i = startIndex; i < bitsLengthIndex; i++)
		{
			let value = bitsToStringArray[this.stream.view[i]];
			
			if(i == startIndex)
				value = value.slice(startOffset);
			
			if(i == (bitsLengthIndex - 1))
				value = value.slice(0, endOffset - 7 + value.length);
			
			result.push(value);
		}
		
		result = result.join("");
		//endregion
		
		//region Change internal values
		if(this.backward)
			this.start -= result.length;
		else
			this.start += result.length;
		//endregion
		
		return result;
	}
	//**********************************************************************************
	/**
	 * Get number value representation of the next "length" bits from the stream, preliminary reversed
	 * @param {number} length Number of bits to read
	 * @returns {*}
	 */
	getBitsReversedValue(length)
	{
		//region Initial variables 
		const initialValue = this.getBitsString(length);
		const initialValueLength = initialValue.length;
		
		if(initialValueLength > 32)
			return (-1);
		
		let byteIndex;
		
		if(length == 32)
			byteIndex = 3;
		else
			byteIndex = ((initialValueLength - 1) >> 3);
		
		const initialOffset = 8 - (initialValueLength % 8);
		
		const reversedValue = new Array(initialValueLength);
		
		const value = new Uint32Array(1);
		const valueView = new Uint8Array(value.buffer, 0, 4);
		//endregion 
		
		//region Reverse value 
		for(let i = 0; i < initialValueLength; i++)
			reversedValue[initialValueLength - 1 - i] = initialValue[i];
		//endregion 
		
		//region Convert byte array to "Uint32Array" value 
		for(let i = initialOffset; i < (initialOffset + initialValueLength); i++)
		{
			if(reversedValue[i - initialOffset] == '1')
				valueView[byteIndex] |= 0x01 << (7 - (i % 8));
			
			if(i && (((i + 1) % 8) == 0))
				byteIndex--;
		}
		//endregion 
		
		return value[0];
	}
	//**********************************************************************************
	toString()
	{
		const streamToDisplay = this.stream.copy(this.start, this.length);
		return streamToDisplay.toString();
	}
	//**********************************************************************************
}
//**************************************************************************************
