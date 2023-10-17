 import { getCountryFromKey } from "../../src/utils/country.key";

describe('test getCountryFromKey', () => {
	it('should return Scotland for GB-SCT', () => {
		const result = getCountryFromKey('GB-SCT');
		expect(result).toEqual('Scotland');
	});

	it('should return Wales for GB-WLS', () => {
		const result = getCountryFromKey('GB-WLS');
		expect(result).toEqual('Wales');
	});

	it('should return England for GB-ENG', () => {
		const result = getCountryFromKey('GB-ENG');
		expect(result).toEqual('England');
	});

	it('should return Northern Ireland for GB-NIR', () => {
		const result = getCountryFromKey('GB-NIR');
		expect(result).toEqual('Northern Ireland');
	});

	it('should return Channel Island for Channel Island', () => {
		const result = getCountryFromKey('Channel Island');
		expect(result).toEqual('Channel Island');
	});

	it('should return Isle of Man for Isle of Man', () => {
		const result = getCountryFromKey('Isle of Man');
		expect(result).toEqual('Isle of Man');
	});

	it('should return undefined for an unknown country key', () => {
		const result = getCountryFromKey('unknown');
		expect(result).toBeUndefined();
	});
});