// In-memory store for mock users when DB is offline
const MOCK_USERS = [
    {
        _id: 'admin_123',
        username: 'Admin User',
        email: 'admin@example.com',
        password: 'password123', // Plain text for mock mode
        role: 'admin'
    },
    {
        _id: 'user_restored',
        username: 'sonu22',
        email: 'sonugupta411093@gmail.com',
        password: 'password123',
        role: 'user'
    },
    {
        _id: 'user_new_fix',
        username: 'sonu_new',
        email: 'sonuguptaji14@gmail.com',
        password: 'password123',
        role: 'admin'
    }
];

module.exports = { MOCK_USERS };
