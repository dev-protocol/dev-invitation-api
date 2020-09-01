import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { config } from 'dotenv'
import { recover } from '../lib/recover'
import { createData, AirTableField } from '../lib/airtable'

// eslint-disable-next-line functional/no-expression-statement
config()

const invite: AzureFunction = async (
	_: Context,
	req: HttpRequest
): Promise<ReturnTypeOfAzureFunctions> => {
	const {
		message = '',
		signature = '',
		market = '',
		asset = '',
		email = '',
		discord = '',
	} = req.body
	// eslint-disable-next-line functional/no-conditional-statement
	if (message === '' || signature === '') {
		return {
			status: 400,
			body: {
				success: false,
			},
		}
	}
	const recoverAccount = recover(message, signature)
	const address = recoverAccount ? recoverAccount : ''
	const fields: AirTableField = {
		market,
		asset,
		email,
		discord,
		address,
	}

	const apiKey = process.env.AIRTABLE_API_KEY || ''
	const endpoint = process.env.AIRTABLE_ENDPOINT || ''
	const success = await createData(apiKey, endpoint, fields)
	const status = success ? 200 : 400
	return {
		status,
		body: {
			success: success,
		},
	}
}

export default invite
