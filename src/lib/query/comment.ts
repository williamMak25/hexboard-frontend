import type { CardComment, CreateCardComment } from '$lib/types/comment';
import type { QueryFunctionContext } from '@tanstack/svelte-query';
import axiosInstance from './axiosInstance';

export const createCardComment = async (data: CreateCardComment) => {
	return (await axiosInstance.post(`/card-comments`, data)).data as CardComment;
};

export const getCardComment = async (args: QueryFunctionContext) => {
	return (await axiosInstance.get(`/card-comments/${args.queryKey[1]}`)).data as CardComment;
};

export const getCommentByCardId = async (args: QueryFunctionContext) => {
	return (await axiosInstance.get(`/card-comments/by-card/${args.queryKey[1]}`))
		.data as CardComment[];
};
