import type { UserProfile } from './user';

export type UUID = string;

export enum PriorityEnum {
	LOW = 'low',
	MEDIUM = 'medium',
	HIGH = 'high'
}
export interface Board {
	id: UUID;
	title: string;
	ownerId: string;
	members:UserProfile[]
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
	memberIds:string[]
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

	attachements: string[];
	priority: PriorityEnum;
	reporter_id: UUID;
	reporter: UserProfile;
	assignees: UserProfile[];

	id: UUID;
	createdAt: string;
	updatedAt: string;
}

export interface CreateCard {
	colId: UUID;
	title: string;
	description: string;
	dueDate: string;
	priority: PriorityEnum;
	reporterId: UUID;
	assigneeIds: string[];
	attachements: string[] | null;
}

export interface UpdateCardPosition {
	colId: UUID;
	position: number;
}

//  Files

export interface FileType {
	fileName: string;
	filePath: string;
	size: number;
	fileType: string;

	id: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateFile {
	fileName: string;
	filePath: string;
	size: number;
	fileType: string;
}
