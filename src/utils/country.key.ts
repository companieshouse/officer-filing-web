export const getCountryFromKey = (country: string): string => {
	const countryKeyValueMap: Record<string, string> = {
		'GB-SCT': 'Scotland',
		'GB-WLS': 'Wales',
		'GB-ENG': 'England',
		'GB-NIR': 'Northern Ireland',
		'Channel Island': 'Channel Island',
		'Isle of Man': 'Isle of Man',
	};
	return countryKeyValueMap[country];
}