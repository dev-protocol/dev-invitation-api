import test from 'ava'
import { HttpRequest, Context } from '@azure/functions'
import { stub } from 'sinon'
import invite from './index'
import * as airTable from '../lib/airtable'
import * as recover from '../lib/recover'

const random = (): string => Math.random().toString()
const fakeRecover = (message: string, signature: string): string | undefined =>
	`${message}-${signature}`

const createContext = (): Context =>
	(({
		res: {},
	} as unknown) as Context)

const createReq = (
	message?: string,
	signature?: string,
	market?: string,
	asset?: string,
	email?: string,
	discord?: string,
	name?: string,
	url?: string,
	ask?: string,
	useCase?: string,
	role?: string,
	newsletter?: boolean
): HttpRequest =>
	(({
		body: {
			message,
			signature,
			market,
			asset,
			email,
			discord,
			name,
			url,
			ask,
			useCase,
			role,
			newsletter,
		},
	} as unknown) as HttpRequest)

const context = createContext()
const message = random()
const signature = random()
const market = random()
const asset = random()
const email = random()
const discord = random()
const name = random()
const url = random()
const ask = random()
const useCase = random()
const role = random()
const address = fakeRecover(message, signature) as string
const newsletter = Math.random() < 0.5

test.serial('Returns a success response', async (t) => {
	const stubs = [
		stub(recover, 'recover').callsFake(fakeRecover),
		stub(airTable, 'createAirTableFetcher').callsFake(() => async (): Promise<
			airTable.AirTableResponse | Error
		> => {
			const res: airTable.AirTableResponse = {
				records: {
					id: random(),
					fields: {
						market,
						asset,
						email,
						discord,
						address,
						name,
						role,
						url,
						useCase,
						ask,
						'Subscribe Newsletter': newsletter === true ? 'Yes' : '',
					},
					createdTime: new Date().toString(),
				},
			}
			return res
		}),
	]
	const res = await invite(
		context,
		createReq(
			message,
			signature,
			market,
			asset,
			email,
			discord,
			name,
			url,
			ask,
			useCase,
			role,
			newsletter
		)
	)
	stubs.map((s) => s.restore())
	t.is(res?.status, 200)
	t.is(res?.body?.success, true)
})

test.serial(
	'The response code is 400 when the AirTable API returns Error',
	async (t) => {
		const stubs = [
			stub(recover, 'recover').callsFake(fakeRecover),
			stub(airTable, 'createAirTableFetcher').callsFake(() => async (): Promise<
				airTable.AirTableResponse | Error
			> => {
				const res = new Error('Authentication failed')
				return res
			}),
		]
		const res = await invite(
			context,
			createReq(message, signature, market, asset, email, discord)
		)
		stubs.map((s) => s.restore())
		t.is(res?.status, 400)
		t.is(res?.body?.success, false)
	}
)

test.serial(
	'The response code is 400 when message or signature is empty',
	async (t) => {
		const emptyMessage = ''
		const emptySignature = ''
		const res1 = await invite(
			context,
			createReq(emptyMessage, signature, market, asset, email, discord)
		)
		t.is(res1?.status, 400)
		t.is(res1?.body?.success, false)

		const res2 = await invite(
			context,
			createReq(message, emptySignature, market, asset, email, discord)
		)
		t.is(res2?.status, 400)
		t.is(res2?.body?.success, false)
	}
)
