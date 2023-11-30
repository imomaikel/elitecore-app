export const getPort = () => {
    let port = process.env.PORT || 3000;
    if (typeof port === 'string') port = parseInt(port);
    return port;
};