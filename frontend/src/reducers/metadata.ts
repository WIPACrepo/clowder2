import {
	DELETE_DATASET_METADATA,
	DELETE_FILE_METADATA,
	DELETE_METADATA_DEFINITION,
	POST_DATASET_METADATA,
	POST_FILE_METADATA,
	RECEIVE_DATASET_METADATA,
	RECEIVE_FILE_METADATA,
	RECEIVE_METADATA_DEFINITION,
	RECEIVE_METADATA_DEFINITIONS,
	SAVE_METADATA_DEFINITIONS,
	SEARCH_METADATA_DEFINITIONS,
	UPDATE_DATASET_METADATA,
	UPDATE_FILE_METADATA,
} from "../actions/metadata";
import { DataAction } from "../types/action";
import { MetadataState } from "../types/data";
import { MetadataDefinitionOut } from "../openapi/v2/";

const defaultState: MetadataState = {
	datasetMetadataList: [],
	fileMetadataList: [],
	metadataDefinitionList: [],
	metadataDefinition: <MetadataDefinitionOut>{},
};

const metadata = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_METADATA_DEFINITIONS:
			return Object.assign({}, state, {
				metadataDefinitionList: action.metadataDefinitionList,
			});
		case RECEIVE_METADATA_DEFINITION:
			return Object.assign({}, state, {
				metadataDefinition: action.metadataDefinition,
			});
		case SEARCH_METADATA_DEFINITIONS:
			return Object.assign({}, state, {
				metadataDefinitionList: action.metadataDefinitionList,
			});
		case DELETE_METADATA_DEFINITION:
			return Object.assign({}, state, {
				metadataDefinitionList: state.metadataDefinitionList.filter(
					(metadataDefinition) =>
						metadataDefinition.id !== action.metadataDefinition.id
				),
			});
		case SAVE_METADATA_DEFINITIONS:
			return Object.assign({}, state, {
				metadataDefinitionList: [
					action.metadataDefinitionList,
					...state.metadataDefinitionList,
				],
			});
		case RECEIVE_DATASET_METADATA:
			return Object.assign({}, state, {
				datasetMetadataList: action.metadataList,
			});
		case RECEIVE_FILE_METADATA:
			return Object.assign({}, state, {
				fileMetadataList: action.metadataList,
			});
		case UPDATE_DATASET_METADATA:
			return Object.assign({}, state, {
				datasetMetadataList: state.datasetMetadataList.map((dm) => {
					if (dm.id === action.metadata.id) {
						return action.metadata;
					}
					return dm;
				}),
			});
		case DELETE_DATASET_METADATA:
			return Object.assign({}, state, {
				datasetMetadataList: state.datasetMetadataList.filter(
					(metadata) => metadata.id !== action.metadata.id
				),
			});
		case DELETE_FILE_METADATA:
			return Object.assign({}, state, {
				fileMetadataList: state.fileMetadataList.filter(
					(metadata) => metadata.id !== action.metadata.id
				),
			});
		case UPDATE_FILE_METADATA:
			return Object.assign({}, state, {
				fileMetadataList: state.fileMetadataList.map((fm) => {
					if (fm.id === action.metadata.id) {
						return action.metadata;
					}
					return fm;
				}),
			});
		case POST_DATASET_METADATA:
			return Object.assign({}, state, {
				datasetMetadataList: [...state.datasetMetadataList, action.metadata],
			});
		case POST_FILE_METADATA:
			return Object.assign({}, state, {
				fileMetadataList: [...state.fileMetadataList, action.metadata],
			});
		default:
			return state;
	}
};

export default metadata;
