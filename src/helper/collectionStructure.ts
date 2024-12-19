export enum CollectibleAssembly {
  Dictionary = 'dictionary',
  Date = 'date',
  Unstructured = 'unstructured',
};

export enum CollectiblePathComponent {
  Section = 'section',
  InitialLetter = 'initialLetter',
  Artist = 'artist',
  Author = 'author',
  Title = 'title',
  Year = 'year',
  Month = 'month',
  Date = 'date',
};

export interface TagMapping {
  varName: string;
  tagTemplate: string;
};

export interface Collectible {
  section: string;
  assembly: CollectibleAssembly;
  pathComponents: string[];
  checkMediaRegex?: RegExp;
  importToOneFolder?: boolean;
  requiredVars: string[];
};

export interface CollectionStructure {
  folders: string[];
  albumFolders: string;
  tagMappings: TagMapping[];
  collectibles: Collectible[];
};

export const defaultCollectionStructure: CollectionStructure = {
  folders: ['incoming', 'collection'],
  albumFolders: '_ABCDEFGHIJKLMNOPQRSTUVWXYZ国',
  tagMappings: [ // tags from exiftool, tempate for liquidjs
    { varName: 'artist', tagTemplate: '{{ AlbumArtist | or: Band | or: Artist }}' },
    { varName: 'album', tagTemplate: '{{ Album }}' },
    { varName: 'year', tagTemplate: '{{ ContentCreateDate | or: Year }}' }, // M4A | MP3
    { varName: 'timestamp', tagTemplate: '{{ DateTimeOriginal | or: ProfileDateTime | or: AdjustmentTimestamp | or: MediaCreateDate | or: TrackCreateDate | or: FileModifyDate }}' },
  ],
  collectibles: [
    {
      section: 'album',
      assembly: CollectibleAssembly.Dictionary, // A/(Album)Artist/1999 - Album/
      pathComponents: ['{{ artist | initial }}', '{{ artist }}', '{{ year }} - {{ album }}'],
      checkMediaRegex: /\.(mp3|m4a)$/i,
      importToOneFolder: true,
      requiredVars: ['artist', 'year', 'album'],
    },
    {
      section: 'audiobook',
      assembly: CollectibleAssembly.Dictionary, // A/Author/1999 - Title/
      pathComponents: ['{{ artist | initial }}', '{{ artist }}', '{{ year }} - {{ album }}'],
      checkMediaRegex: /\.(mp3|m4a)$/i,
      importToOneFolder: true,
      requiredVars: ['artist', 'year', 'album'],
    },
    {
      section: 'book',
      assembly: CollectibleAssembly.Unstructured,
      pathComponents: ['{{ "now" | date: "%Y-%m-%d %H:%M" }} - import'],
      checkMediaRegex: undefined,
      importToOneFolder: true,
      requiredVars: [],
    },
    {
      section: 'literature',
      assembly: CollectibleAssembly.Dictionary, // A/Author/1999 - Title/
      pathComponents: ['{{ author | initial }}', '{{ author }}', '{{ yearPublished }} - {{ title }}'],
      checkMediaRegex: undefined,
      importToOneFolder: true,
      requiredVars: ['author', 'yearPublished', 'title'],
    },
    {
      section: 'picture',
      assembly: CollectibleAssembly.Date, // 2011/01/2011-01-01 - Location/
      pathComponents: ['{{ timestamp | date: "%Y" }}', '{{ timestamp | date: "%m" }}', '{{ timestamp | date: "%Y-%m-%d" }} - {{ location }}'],
      checkMediaRegex: /.*/i,
      importToOneFolder: false,
      requiredVars: ['timestamp', 'location'],
    },
    {
      section: 'various',
      assembly: CollectibleAssembly.Dictionary, // A/1999 - Album/
      pathComponents: ['{{ album | initial }}', '{{ year }} - {{ album }}'],
      checkMediaRegex: /\.(mp3|m4a)$/i,
      importToOneFolder: true,
      requiredVars: ['year', 'album'],
    },
  ],
};

export const getCollectible = (section: string) => {
  const collectible = defaultCollectionStructure.collectibles.find((collectible) => collectible.section === section);
  return collectible;
};

export const getCollectibleAssembly = (section: string) => {
  const collectible = getCollectible(section);
  return collectible?.assembly;
};

export const getTagTemplate = (varName: string) => {
  const tagMapping = defaultCollectionStructure.tagMappings.find((tagMapping) => tagMapping.varName === varName);
  return tagMapping?.tagTemplate;
}
