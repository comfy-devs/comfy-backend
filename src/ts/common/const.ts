export const AnimeTypeMapping: Record<AnimeType, number> = {
    TV: 0,
    SPECIAL : 1,
    OVA: 2,
    MOVIE: 3,
    ONA: 4
}

export const AnimeStatusMapping: Record<AnimeStatus, number> = {
    AIRING: 0,
    FINISHED : 1
}

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
    THRILLER: 131072
}

export const AnimeTagMapping: Record<AnimeTag, number> = {
    SUBBED: 1,
    HARD_SUBBED: 2,
    DUBBED: 4
}

export const AnimeRatingMapping: Record<AnimeRating, number> = {
    PG: 0,
    R: 1
}

export const EpisodeLocationMapping: Record<EpisodeLocation, number> = {
    AKAGI: 0,
    KAGA: 1
}

export const SegmentTypeMapping: Record<SegmentType, number> = {
    OP: 0,
    EPISODE: 1,
    ED: 2
}