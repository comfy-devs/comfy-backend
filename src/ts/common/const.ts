export const ShowTypeMapping: Record<ShowType, number> = {
    ANIME: 0,
    TV: 1
};

export const AnimeFormatMapping: Record<AnimeFormat, number> = {
    TV: 0,
    SPECIAL: 1,
    OVA: 2,
    MOVIE: 3,
    ONA: 4,
};
export const TVFormatMapping: Record<TVFormat, number> = {
    TV: 0,
    SPECIAL: 1,
    MOVIE: 2,
};

export const ShowStatusMapping: Record<ShowStatus, number> = {
    AIRING: 0,
    FINISHED: 1,
};

export const AnimeGenreMapping: Record<AnimeGenre, number> = {
    ACTION: 1,
    ADVENTURE: 2,
    COMEDY: 4,
    DRAMA: 8,
    ECCHI: 16,
    FANTASY: 32,
    HORROR: 64,
    MAHOU_SHOUJO: 128,
    MECHA: 256,
    MUSIC: 512,
    MYSTERY: 1024,
    PSYCHOLOGICAL: 2048,
    ROMANCE: 4096,
    SCIFI: 8192,
    SLICE_OF_LIFE: 16384,
    SPORTS: 32768,
    SUPERNATURAL: 65536,
    THRILLER: 131072,
};
export const TVGenreMapping: Record<TVGenre, number> = {
    ACTION: 1,
    ADVENTURE: 2,
    ANIMATION: 4,
    AWARDS_SHOW: 8,
    CHILDREN: 16,
    COMEDY: 32,
    CRIME: 64,
    DOCUMENTARY: 128,
    DRAMA: 256,
    FAMILY: 512,
    FANTASY: 1024,
    FOOD: 2048,
    GAME_SHOW: 4096,
    HISTORY: 8192,
    HOME_GARDEN: 16384,
    HORROR: 32768,
    INDIE: 65536,
    MARTIAL_ARTS: 131072,
    MINI_SERIES: 262144,
    MUSICAL: 524288,
    MYSTERY: 1048576,
    NEWS: 2097152,
    PODCAST: 4194304,
    REALITY: 8388608,
    ROMANCE: 16777216,
    SCIENCE_FICTION: 33554432,
    SOAP: 67108864,
    SPORT: 134217728,
    SUSPENSE: 268435456,
    TALK_SHOW: 536870912,
    THRILLER: 1073741824,
    TRAVEL: 2147483648,
    WAR: 4294967296,
    WESTERN: 8589934592,
};

export const ShowTagMapping: Record<ShowTag, number> = {
    SUBBED: 1,
    HARD_SUBBED: 2,
    DUBBED: 4,
};

export const ShowRatingMapping: Record<ShowRating, number> = {
    PG: 0,
    R: 1,
};

export const EpisodeLocationMapping: Record<EpisodeLocation, number> = {
    VAPOREON: 0,
    JOLTEON: 1,
    FLAREON: 2,
};

export const EncodePresetMapping: Record<EncodePreset, number> = {
    X264: 0,
    VP9: 1,
};

export const SegmentTypeMapping: Record<SegmentType, number> = {
    OP: 0,
    EPISODE: 1,
    ED: 2,
};
