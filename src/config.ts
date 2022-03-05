require('dotenv').config();

type SubConfiguration = {
    readonly PORT: number;
    readonly ImageURL : string;
    readonly AzureConnectionString: string;
    readonly ImageContainerName: string;
    readonly AuthMiddlewareOn: boolean;
}

type Configuration = {
    [index: string]: SubConfiguration;
}

const BackendConfiguration: Configuration = {
    development: {
        PORT: 3000,
        ImageURL: 'https://umifeedsimages.blob.core.windows.net',
        ImageContainerName: 'image-container',
        AzureConnectionString: process.env.CONNECTION_STRING_AZURE,
        AuthMiddlewareOn: false,
    },
    staging: {
        PORT: 3000,
        ImageURL: '',
        AzureConnectionString: '',
        ImageContainerName: '',
        AuthMiddlewareOn: true
    }
};

export default BackendConfiguration;
