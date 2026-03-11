import type { Board, Card, Column, CreateBoard, PaginationResponse } from '$lib/types/board';
import type { QueryFunctionContext } from '@tanstack/svelte-query';
import axiosInstance from './axiosInstance';


// Board APIs
export const createBoard = async (data: CreateBoard) => {
	return (await axiosInstance.post(`/boards/create`, data)).data as Board;
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

// Column Card APIs

export const getColumnCards = async (args: QueryFunctionContext) => {
	return (await axiosInstance.get(`/cards/column-cards/${args.queryKey[1]}`)).data as Card[];
}

export const moveCard = async (data: {
	cardId: string;
	data: {
		colId: string;
		position: number;
	};
}) => {
	return (await axiosInstance.patch(`/cards/card-position/${data.cardId}`, data.data)).data as null;
};