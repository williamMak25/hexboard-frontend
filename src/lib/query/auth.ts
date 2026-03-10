import { env } from "$env/dynamic/public";
import type { UserProfile } from "$lib/types/user";
import axios from "axios";
import axiosInstance from "./axiosInstance";

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
	return (await axiosInstance.get(`${env.PUBLIC_API_URL}/me`)).data as UserProfile
}