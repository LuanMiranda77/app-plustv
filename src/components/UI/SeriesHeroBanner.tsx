import { ChevronDown, RefreshCcwDotIcon } from 'lucide-react';
import type { Episode, Season, Series } from '../../types';
import { TrailerModal } from '../Player/TrilerModal';
import { ButtonBack } from './ButtonBack';
import ButtonFavorite from './ButtonFavorite';
import { ButtonIcon } from './ButtonIcon';
import PlayButton from './ButtonPlay';
import { ButtonTrailer } from './ButtonTrailer';
import GenreBadges from './GenreBadges';
import MetaText from './MetaText';
import PlotText from './PlotText';
import Poster from './Poster';

interface SeriesHeroBannerProps {
  series: Series;
  seasons: Season[];
  total: number;
  percent: number;
  nextEpisode: Episode | null;
  currentEpisodeId?: string;
  onBack: () => void;
  onPlayNext: () => void;
  onToggleFavorite?: (series: Series) => void;
  onScrollToEpisodes: () => void;
  focusedButton?: number; // 0=Assistir, 1=Trailer, 2=Favorito, 3=Episódios
  showTrailer: boolean;
  onSetShowTrailer: (params: boolean) => void;
  onLoadDetail: (series: Series, isForceRefresh: boolean) => void;
  isFav?: boolean;
}

export const SeriesHeroBanner = ({
  series,
  seasons,
  total,
  percent,
  nextEpisode,
  currentEpisodeId,
  onBack,
  onPlayNext,
  onToggleFavorite,
  onScrollToEpisodes,
  focusedButton = 0,
  showTrailer = false,
  onSetShowTrailer,
  onLoadDetail,
  isFav
}: SeriesHeroBannerProps) => {
  return (
    <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${series.poster})`,
          animation: 'heroFade 0.8s ease both'
        }}
      />

      {/* Gradientes */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

      {/* Botão voltar */}
      <ButtonBack
        className="absolute top-6 left-6 z-10"
        onClick={onBack}
        isFocused={focusedButton === 0}
      />
      <TrailerModal
        youtubeId={series.youtube_trailer ?? ''}
        open={showTrailer}
        onClose={() => onSetShowTrailer(false)}
      />

      {/* Conteúdo hero */}
      <div className="absolute inset-0 flex items-end pb-10 px-8 md:px-14">
        <div className="flex gap-8 items-end  w-full">
          {/* Poster */}
          <Poster poster={series.poster} name={series.name}  width={"300px"}/>

          {/* Info */}
          <div className="flex-1 min-w-0" style={{ animation: 'fadeSlideIn 0.6s ease 0.2s both' }}>
            <GenreBadges genre={series.genre ?? ''} max={5} />

            {/* Título */}
            <h1
              className="text-6xl max-sm:text-xl font-bold leading-tight mb-3 text-white drop-shadow-lg text-left"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              {series.name}
            </h1>
            <MetaText
              year={series.year}
              rating={series.rating ? Number(series.rating) : 0}
              seasonsCount={seasons.length}
              total={total}
              percent={percent}
            />
            <PlotText plot={series.plot ?? ''} />

            {/* Ações */}
            <div className="flex items-center gap-3 flex-wrap">
              <PlayButton
                isFocused={focusedButton === 1}
                disabled={!nextEpisode}
                streamId={currentEpisodeId}
                onClick={onPlayNext}
                nextEpisode={nextEpisode ?? undefined}
              />
              <ButtonTrailer
                isFocused={focusedButton === 2}
                disabled={Boolean(series.youtube_trailer) == false}
                onClick={() => onSetShowTrailer(true)}
              />
              <ButtonIcon
                label={'Episódios'}
                onClick={onScrollToEpisodes}
                icon={<ChevronDown className="w-8 h-8 max-sm:w-5 max-sm:h-5" />}
                isFocused={focusedButton === 3}
              />
              <ButtonIcon
                label={'Atualizar lista'}
                onClick={() => onLoadDetail(series, true)}
                icon={<RefreshCcwDotIcon className="w-8 h-8 max-sm:w-5 max-sm:h-5" />}
                isFocused={focusedButton === 4}
              />
              {onToggleFavorite && (
                <ButtonFavorite
                  onClick={() => onToggleFavorite(series)}
                  isFocused={focusedButton === 5}
                  isFav={isFav}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesHeroBanner;
