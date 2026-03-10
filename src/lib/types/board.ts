export type UUID = string;

export interface Board {
	id: UUID;
	title: string;
	created_at: string;
}

export interface Column {
	id: UUID;
	board_id: UUID;
	title: string;
	col_position: number;
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
}

export interface CreateColumn {
	board_id: UUID;
	title: string;
}

export interface UpdateColumnPosition {
	board_id: UUID;
	col_position: number;
}
