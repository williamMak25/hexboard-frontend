import type {
	Board,
	Card,
	Column,
	CreateBoard,
	CreateCard,
	CreateColumn,
	FileType,
	PaginationResponse
} from '$lib/types/board';
import type { QueryFunctionContext } from '@tanstack/svelte-query';
import axiosInstance from './axiosInstance';

// Board APIs
export const createBoard = async (data: CreateBoard) => {
	return (await axiosInstance.post(`/boards/create`, data)).data as Board;
};

export const updateBoard = async (data: { boarId: string; data: CreateBoard }) => {
	return await axiosInstance.patch(`/boards/${data.boarId}`, data.data);
};

export const deleteBoard = async (boardId: string) => {
	return (await axiosInstance.delete(`/boards/${boardId}`)).data;
};
export const boardList = async () => {
	return (await axiosInstance.get(`/boards`)).data as PaginationResponse<Board>;
};

// Board Column APIs
export const getBoardColums = async (args: QueryFunctionContext) => {
	return (await axiosInstance.get(`/columns/${args.queryKey[1]}`)).data as Column[];
};

export const moveColumn = async (data: {
	columnId: string;
	data: {
		boardId: string;
		colPosition: number;
	};
}) => {
	return (await axiosInstance.patch(`/columns/col-position/${data.columnId}`, data.data))
		.data as null;
};

export const createColumn = async (data: CreateColumn) => {
	return (await axiosInstance.post(`/columns/create`, data)).data as Column;
};

// Column Card APIs

export const getColumnCards = async (args: QueryFunctionContext) => {
	return (await axiosInstance.get(`/cards/column-cards/${args.queryKey[1]}`)).data as Card[];
};

export const moveCard = async (data: {
	cardId: string;
	data: {
		colId: string;
		position: number;
	};
}) => {
	return (await axiosInstance.patch(`/cards/card-position/${data.cardId}`, data.data)).data as null;
};

export const createCard = async (data: CreateCard) => {
	return (await axiosInstance.post(`/cards/create`, data)).data as Card;
};

export const viewCard = async (args: QueryFunctionContext) => {
	return (await axiosInstance.get(`/cards/detail/${args.queryKey[1]}`)).data as Card;
};

// Upload

export const uploadFile = async (data: FormData) => {
	return (
		await axiosInstance.post(`/file-upload`, data, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
	).data as FileType[];
};
