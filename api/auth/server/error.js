class AuthenticationError extends Error {
    constructor(message)
    {
        super(message);
        this.name = 'AuthenticationError';
    }
}

class UserInputError extends Error {
    constructor(message)
    {
        super(message);
        this.name = 'UserInputError';
    }
}

module.exports = { AuthenticationError, UserInputError };