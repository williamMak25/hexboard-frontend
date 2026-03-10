export interface Team {
	teamId: string;
	teamName: string;
	isOwner: boolean;
	role: 'ADMIN' | 'USER' | string; // Adjusted to include common roles
}

export interface Role {
	roleId: string;
	roleSlug: string;
	roleName: string;
	assignedAt: string; // Or Date if you plan to instantiate it
}

export interface OAuthAccount {
	id: string;
	oauthName: string;
	accountId: string;
	accountEmail: string;
}

export interface UserProfile {
	id: string;
	email: string;
	name: string;
	username: string;
	phone: string;
	isSuperuser: boolean;
	isActive: boolean;
	isVerified: boolean;
	isTwoFactorEnabled: boolean;
	hasPassword: boolean;
	teams: Team[];
	roles: Role[];
	oauthAccounts: OAuthAccount[];
	avatarUrl: string;
}
