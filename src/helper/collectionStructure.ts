
export enum CollectibleAssembly {
    Album = 'Album',
    Year = 'Year',
    Unstructured = 'Unstructured',
};

export interface CollectionStructure {
    folders: string[];
    albumFolders: string;
    collectibles: {
        section: string;
        assembly: CollectibleAssembly;
    }[];
};

export const defaultCollectionStructure: CollectionStructure = {
    folders: ['incoming', 'collection'],
    albumFolders: '_ABCDEFGHIJKLMNOPQRSTUVWXYZ国',
    collectibles: [
        {
            section: 'album',
            assembly: CollectibleAssembly.Album,
        },
        {
            section: 'audiobook',
            assembly: CollectibleAssembly.Album,
        },
        {
            section: 'book',
            assembly: CollectibleAssembly.Unstructured,
        },
        {
            section: 'literature',
            assembly: CollectibleAssembly.Album,
        },
        {
            section: 'picture',
            assembly: CollectibleAssembly.Year,
        },
        {
            section: 'various',
            assembly: CollectibleAssembly.Album,
        },
    ],
};
