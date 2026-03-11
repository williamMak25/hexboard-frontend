export type UUID = string;

export interface Board {
	id: UUID;
	title: string;
	ownerId: string;
	bgColor: string;
	createdAt: string;
	updatedAt: string;
}

export interface Column {
	id: UUID;
	boardId: UUID;
	title: string;
	colPosition: number;
	cards: Card[];
	createdAt: string;
	updatedAt: string;
}

export interface PaginationResponse<T> {
	items: T[];
	total: number;
	limit: number;
	offset: number;
}

// DTOs (Data Transfer Objects)
export interface CreateBoard {
	title: string;
	ownerId: UUID;
	bgColor: string;
}

export interface CreateColumn {
	boardId: UUID;
	title: string;
}

export interface UpdateColumnPosition {
	boardId: UUID;
	colPosition: number;
}

export interface Card {
	colId: UUID;
	title: string;
	description: string;
	position: number;
	dueDate: string;
	id: UUID;
	createdAt: string;
	updatedAt: string;
}

export interface CreateCard {
	colId: UUID;
	title: string;
	description: string;
	dueDate: string;
}

export interface UpdateCardPosition {
	colId: UUID;
	position: number;
}
