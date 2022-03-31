import {
	NotFoundError,
	QuotaError,
	UnauthenticatedError,
	UnauthorizedError,
	UnknownError,
} from '@romain-faust/errors'
import type { UploadFile, UploadFileSnapshot } from '@romain-faust/upload-file'
import {
	type FirebaseStorage,
	getDownloadURL,
	ref,
	uploadBytesResumable,
	type UploadTaskSnapshot,
} from 'firebase/storage'
import { catchError, concat, defer, map, Observable, throwError } from 'rxjs'

export function buildUploadFile(storage: FirebaseStorage): UploadFile {
	return function uploadFile(path, data) {
		return new Observable<UploadFileSnapshot>((subscriber) => {
			const fileRef = ref(storage, path)
			const task = uploadBytesResumable(fileRef, data)

			subscriber.add(() => task.cancel())

			const progress$ = new Observable<UploadTaskSnapshot>(
				(subscriber) => {
					return task.on('state_changed', {
						next: (snapshot) => subscriber.next(snapshot),
						error: (error) => subscriber.error(error),
						complete: () => subscriber.complete(),
					})
				},
			).pipe(
				map((snapshot) => ({
					bytesTransferred: snapshot.bytesTransferred,
					totalBytes: snapshot.totalBytes,
				})),
			)
			const downloadURL$ = defer(() => getDownloadURL(fileRef)).pipe(
				map((downloadURL) => ({
					bytesTransferred: task.snapshot.bytesTransferred,
					downloadURL,
					totalBytes: task.snapshot.totalBytes,
				})),
			)

			return concat(progress$, downloadURL$).subscribe(subscriber)
		}).pipe(
			catchError((error) => {
				switch (error.code) {
					case 'storage/object-not-found':
						return throwError(() => new NotFoundError())
					case 'storage/quota-exceeded':
						return throwError(() => new QuotaError())
					case 'storage/unauthenticated':
						return throwError(() => new UnauthenticatedError())
					case 'storage/unauthorized':
						return throwError(() => new UnauthorizedError())
				}

				return throwError(() => new UnknownError(error))
			}),
		)
	}
}
