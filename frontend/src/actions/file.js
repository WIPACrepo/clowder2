import config from "../app.config";
import {dataURItoFile, getHeader} from "../utils/common";
import {V2} from "../openapi";
import {handleErrors} from "./common";

export const FAILED = "FAILED";

export const RECEIVE_FILE_EXTRACTED_METADATA = "RECEIVE_FILE_EXTRACTED_METADATA";
export function fetchFileExtractedMetadata(id){
	const url = `${config.hostname}/files/${id}/extracted_metadata`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
			.then((response) => {
				if (response.status === 200) {
					response.json().then(json =>{
						dispatch({
							type: RECEIVE_FILE_EXTRACTED_METADATA,
							extractedMetadata: json,
							receivedAt: Date.now(),
						});
					});
				}
				else {
					dispatch(handleErrors(response, fetchFileExtractedMetadata(id)));
				}
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchFileExtractedMetadata(id)));
			});
	};
}

export const RECEIVE_FILE_METADATA = "RECEIVE_FILE_METADATA";
export function fetchFileMetadata(id){
	return (dispatch) => {
		return V2.FilesService.getFileSummaryApiV2FilesFileIdSummaryGet(id)
			.then(json => {
				dispatch({
					type: RECEIVE_FILE_METADATA,
					fileMetadata: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchFileMetadata(id)));
			});
	};
}

export const RECEIVE_FILE_METADATA_JSONLD = "RECEIVE_FILE_METADATA_JSONLD";
export function fetchFileMetadataJsonld(id){
	const url = `${config.hostname}/files/${id}/metadata.jsonld`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
			.then((response) => {
				if (response.status === 200) {
					response.json().then(json =>{
						dispatch({
							type: RECEIVE_FILE_METADATA_JSONLD,
							metadataJsonld: json,
							receivedAt: Date.now(),
						});
					});
				}
				else {
					dispatch(handleErrors(response, fetchFileMetadataJsonld(id)));
				}
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchFileMetadataJsonld(id)));
			});
	};
}

export const RECEIVE_PREVIEWS = "RECEIVE_PREVIEWS";
export function fetchFilePreviews(id){
	const url = `${config.hostname}/files/${id}/getPreviews`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
			.then((response) => {
				if (response.status === 200) {
					response.json().then(json =>{
						dispatch({
							type: RECEIVE_PREVIEWS,
							previews: json,
							receivedAt: Date.now(),
						});
					});
				}
				else {
					dispatch(handleErrors(response, fetchFilePreviews(id)));
				}
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchFilePreviews(id)));
			});
	};
}

export const DELETE_FILE = "DELETE_FILE";
export function fileDeleted(fileId){
	return (dispatch) => {
		return V2.FilesService.deleteFileApiV2FilesFileIdDelete(fileId)
			.then(json => {
				dispatch({
					type: DELETE_FILE,
					file: {"id": json["id"]},
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fileDeleted(fileId)));
			});
	};
}

export const CREATE_FILE = "CREATE_FILE";
export function fileCreated(formData, selectedDatasetId){
	return (dispatch) => {
		formData["file"] = dataURItoFile(formData["file"]);
		return V2.DatasetsService.saveFileApiV2DatasetsDatasetIdFilesPost(selectedDatasetId, formData)
			.then(file => {
				dispatch({
					type: CREATE_FILE,
					file: file,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fileCreated(formData, selectedDatasetId)));
			});
	};
}

export const UPDATE_FILE = "UPDATE_FILE";
export function fileUpdated(formData, fileId){
	return (dispatch) => {
		formData["file"] = dataURItoFile(formData["file"]);
		return V2.FilesService.updateFileApiV2FilesFileIdPut(fileId, formData)
			.then(file => {
				dispatch({
					type: UPDATE_FILE,
					file: file,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fileUpdated(formData, fileId)));
			});
	};
}

export const RECEIVE_VERSIONS = "RECEIVE_VERSIONS";
export function fetchFileVersions(fileId){
	return (dispatch) => {
		return V2.FilesService.getFileVersionsApiV2FilesFileIdVersionsGet(fileId)
			.then(json => {
				// sort by decending order
				const version = json.sort((a, b) => new Date(b["created"]) - new Date(a["created"]));
				dispatch({
					type: RECEIVE_VERSIONS,
					fileVersions: version,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchFileVersions(fileId)));
			});
	};
}
