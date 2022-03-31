import 'dotenv/config'

import type { UploadFile } from '@romain-faust/upload-file'
import { deleteApp, type FirebaseApp, initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'

import { buildUploadFile } from './upload-file'

const FILE_PATH = 'tests/file'
const FILE_DATA = new TextEncoder().encode('data://file-content')
const STORAGE_BUCKET = process.env.TEST_STORAGE_BUCKET

describe('uploadFile()', () => {
	let app: FirebaseApp
	let uploadFile: UploadFile

	beforeAll(() => {
		app = initializeApp({
			storageBucket: STORAGE_BUCKET,
		})
		uploadFile = buildUploadFile(getStorage(app))
	})

	afterAll(() => {
		deleteApp(app)
	})

	it('should include the progress in each emissions', (done) => {
		const nextSpy = jest.fn()

		uploadFile(FILE_PATH, FILE_DATA).subscribe({
			next: nextSpy,
			error: (error) => {
				done(error)
			},
			complete: () => {
				expect(nextSpy).toHaveBeenNthCalledWith(
					1,
					expect.objectContaining({
						bytesTransferred: 0,
						totalBytes: 19,
					}),
				)
				expect(nextSpy).toHaveBeenNthCalledWith(
					2,
					expect.objectContaining({
						bytesTransferred: 19,
						totalBytes: 19,
					}),
				)

				done()
			},
		})
	})

	it('should include the download URL in the last emission', (done) => {
		const nextSpy = jest.fn()

		uploadFile(FILE_PATH, FILE_DATA).subscribe({
			next: nextSpy,
			error: (error) => {
				done(error)
			},
			complete: () => {
				expect(nextSpy).toHaveBeenLastCalledWith(
					expect.objectContaining({
						bytesTransferred: 19,
						downloadURL: expect.stringMatching(/^https:\/\//),
						totalBytes: 19,
					}),
				)

				done()
			},
		})
	})
})
