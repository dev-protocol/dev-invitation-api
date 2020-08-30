/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import bent from 'bent'

export const airTable = (apiKey: string, endpoint: string) =>
	bent(endpoint, 'POST', 'json', {
		authorization: `Bearer ${apiKey}`,
		'content-type': 'application/json',
	})

export const createAirTableFetcher = (
	fetcher: bent.RequestFunction<bent.ValidResponse>
) => async (records: AirTableRecord): Promise<AirTableResponse | Error> =>
	fetcher('', records)
		.then((res) => (res as unknown) as AirTableResponse)
		.catch((err: Error) => err)

export const createData = async (
	apiKey: string,
	endpoint: string,
	fields: AirTableField
): Promise<boolean> => {
	const airTableFetcher = createAirTableFetcher(airTable(apiKey, endpoint))
	const res = await airTableFetcher({
		records: [{ fields: fields }],
	})
	return res instanceof Error ? false : true
}

export type AirTableField = {
	readonly message: string
	readonly signature: string
	readonly market: string
	readonly asset: string
	readonly email: string
	readonly discord: string
	readonly address: string
}

export type AirTableRecord = {
	readonly records: ReadonlyArray<{
		readonly fields: AirTableField
	}>
}

export type AirTableResponse = {
	readonly records: {
		readonly id: string
		readonly fields: AirTableField
		readonly createdTime: string
	}
}
