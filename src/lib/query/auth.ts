import { env } from '$env/dynamic/public';
import type { UserProfile } from '$lib/types/user';
import axios from 'axios';
import axiosInstance from './axiosInstance';
import type { PaginationResponse } from '$lib/types/board';
import type { QueryFunctionContext } from '@tanstack/svelte-query';

export const login = async (data: { username: string; password: string }) => {
	const params = new URLSearchParams();
	params.append('username', data.username);
	params.append('password', data.password);
	params.append('loginType', 'agent');

	return axios.post<
		undefined,
		{
			data: {
				access_token: string;
				token_type: string;
				refresh_token: string | null;
				expires_in: number;
			};
		}
	>(`${env.PUBLIC_API_URL}/access/login`, params, {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	});
};

export const userMe = async () => {
	return (await axiosInstance.get(`/me`)).data as UserProfile;
};

export const getUserList = async (args: QueryFunctionContext) => {
	return (
		await axiosInstance.get(
			`/users?searchIgnoreCase=false&currentPage=${args.queryKey[1]}&pageSize=25&orderBy=created_at&sortOrder=desc`
		)
	).data as PaginationResponse<UserProfile>;
};
