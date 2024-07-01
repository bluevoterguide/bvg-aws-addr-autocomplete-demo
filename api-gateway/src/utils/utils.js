
export const response = (result) => {
    return {
        statusCode: 200,
        body: JSON.stringify(result)
    }
};