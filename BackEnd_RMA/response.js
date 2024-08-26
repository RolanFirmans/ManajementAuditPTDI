const response = (statusCode, data, message, responseMessage) => {
    responseMessage.status(statusCode).json({
        payload: {
            message: message,
            status: statusCode,
            data: data,
        }
    })
}

module.exports = response;

  // Mengirimkan respons JSON dengan data yang diambil dari database dalam payload
 