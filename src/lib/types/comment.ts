import type { UserProfile } from './user';

export interface CreateCardComment {
	userId: string;
	message: string;
	cardId: string;
}

export interface CardComment {
	id: string;
	createdAt: string;
	updatedAt: string;
	commentUser: UserProfile;
	userId: string;
	message: string;
	cardId: string;
}
