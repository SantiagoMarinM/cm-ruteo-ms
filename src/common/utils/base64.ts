export const decodeBase64 = <T>(buffer: string): T => {
    return JSON.parse(Buffer.from(buffer, 'base64').toString());
};

export const decode = (buffer: string): string => {
    return Buffer.from(buffer, 'base64').toString();
};

export const isValidBase64 = (str: string) => {
    // Expresión regular para validar si es base64
    const base64Regex = /^[A-Za-z0-9+]+=*$/;

    return base64Regex.test(str);
};
