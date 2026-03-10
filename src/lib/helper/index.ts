export function capitalizeFirstWord(str: string) {
	if (!str) return '';
	const words = str.split(' ');
	words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
	return words.join(' ');
}


export const dateFormat = (date: string) => {
	return `${new Date(date).getDate()}-${new Date(date).getMonth() + 1}-${new Date(date).getFullYear()}`;
};

export const timeAgo = (createdAt: string) => {
	const now = new Date();
	const postTime = new Date(createdAt);
	const diff = Number(now) - Number(postTime);

	const minutes = Math.floor(diff / (1000 * 60));
	const hours = Math.floor(diff / (1000 * 60 * 60));
	// const days = Math.floor(diff / (1000 * 60 * 60 * 24));

	if (minutes < 1) return 'just now';
	if (minutes < 60) return `${minutes} minutes ago`;
	if (hours < 24) return `${hours} hours ago`;
	return dateFormat(createdAt); // Show full date if > 24 hours
};

export const logout = () => {
	localStorage.removeItem('token');
	location.replace('/');
};

export function isTokenExpired(token: string): boolean {
	try {
		const payloadBase64 = token.split('.')[1];
		const decodedPayload = JSON.parse(atob(payloadBase64));
		const currentTime = Math.floor(Date.now() / 1000); // in seconds

		return decodedPayload.exp < currentTime;
	} catch (error) {
		console.error('Invalid token:', error);
		return true; // assume expired if there's an error
	}
}

export function isImageUrl(url: string) {
	const imageExtensions = ['jpg', 'jpeg', 'png'];
	const fileExtension = url?.split('.').pop()?.toLowerCase();
	const isImage = fileExtension ? imageExtensions.includes(fileExtension) : false;

	return isImage;
}
