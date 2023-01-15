type ShowType = "ANIME" | "TV";
type AnimeFormat = "TV" | "SPECIAL" | "OVA" | "MOVIE" | "ONA";
type TVFormat = "TV" | "SPECIAL" | "MOVIE";
type ShowStatus = "AIRING" | "FINISHED";
type AnimeGenre =
    | "ACTION"
    | "ADVENTURE"
    | "COMEDY"
    | "DRAMA"
    | "ECCHI"
    | "FANTASY"
    | "HORROR"
    | "MAHOU_SHOUJO"
    | "MECHA"
    | "MUSIC"
    | "MYSTERY"
    | "PSYCHOLOGICAL"
    | "ROMANCE"
    | "SCIFI"
    | "SLICE_OF_LIFE"
    | "SPORTS"
    | "SUPERNATURAL"
    | "THRILLER";
type TVGenre =
    | "ACTION"
    | "ADVENTURE"
    | "ANIMATION"
    | "AWARDS_SHOW"
    | "CHILDREN"
    | "COMEDY"
    | "CRIME"
    | "DOCUMENTARY"
    | "DRAMA"
    | "FAMILY"
    | "FANTASY"
    | "FOOD"
    | "GAME_SHOW"
    | "HISTORY"
    | "HOME_GARDEN"
    | "HORROR"
    | "INDIE"
    | "MARTIAL_ARTS"
    | "MINI_SERIES"
    | "MUSICAL"
    | "MYSTERY"
    | "NEWS"
    | "PODCAST"
    | "REALITY"
    | "ROMANCE"
    | "SCIENCE_FICTION"
    | "SOAP"
    | "SPORT"
    | "SUSPENSE"
    | "TALK_SHOW"
    | "THRILLER"
    | "TRAVEL"
    | "WAR"
    | "WESTERN";
type ShowTag = "SUBBED" | "HARD_SUBBED" | "DUBBED";
type ShowRating = "PG" | "R";
type Show = {
    id: string;
    type: number;
    format: number;
    group: string | null;
    season: number | null;

    title: string;
    altTitles: string[];
    synopsis: string | null;
    episodes: number;
    favourites: number;

    status: number;
    genres: number;
    tags: number;
    rating: number;
    location: number;
    timestamp: number | null;
    magnet: string | null;
    version: number;
};

type Group = {
    id: string;
    title: string;
};

type EpisodeLocation = "VAPOREON" | "JOLTEON" | "FLAREON";
type Episode = {
    id: string;
    pos: number;
    show: string;
    title: string;
    duration: number;
    views: number;
    subtitles: string[];
    audio: string[];
};

type EncodePreset = "X264" | "VP9";
type Encode = {
    id: string;
    episode: string;
    preset: number;
    videoBitrate: number;
    audioBitrate: number;
    size: number;
    vmaf: number | null;
};

type SegmentType = "OP" | "EPISODE" | "ED";
type Segment = {
    id: string;
    pos: number;
    episode: string;

    type: number;
    length: number;
};

type Stats = {
    id: string;
    files: number;
    size: number;
    torrents: number;
};
