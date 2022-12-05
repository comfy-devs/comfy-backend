type User = {
    id: string;
    timestamp: number;
    username: string;
    password?: string;
    pushEnabled: boolean;
    favourites: string[];
};