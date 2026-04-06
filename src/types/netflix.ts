export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isKid?: boolean;
  favoriteGenres: string[];
}

export const PREDEFINED_AVATARS = [
  'https://occ-0-2430-2433.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABfNXUMVXGhnCZwPI1SghnGpmUgqS_J-owMff-jig42xPF7vozQS1ge5xTgPTzH7ttfNYQXnsYs4vrMBaadh4E6RTJMVepojWqOXx.png?r=1d4',
  'https://occ-0-2430-2433.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABdi4L5NLVfWQCF7HOVQ-upJaJRKFVj6P1sJg4bxdCMovieOabtGKICqFL4G-at14yF4l8-3vfkAUUOJQP5w1KjDU0ZQF_w9HrJPn.png?r=a4f',
  'https://occ-0-2430-2433.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABWz4HrM7ZPt1qNv1QtPMgHCIdoGG_DCPpLrF9TKZEG1MWO9pGE8uq_7VXNMKwXjUHMaKPqJQmqZJH6KJ5OdAnASGKdFNuKOCNT4V.png?r=e6e',
  'https://occ-0-2430-2433.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABa2da4eKgOjM1iJjCu9s0hiW6xKyGQoeLNMrOaRoM68eExTsSE8lB-Zr5cPaEI2ByQrYzSa-zDbsQWaDrKr-5GFGc6Uo_FBXyMxc.png?r=bd7'
];