import { env } from "$env/dynamic/public";
import axios from "axios";

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
