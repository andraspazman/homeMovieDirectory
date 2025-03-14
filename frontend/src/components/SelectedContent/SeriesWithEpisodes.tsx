import React from "react";
import { UnorderedList, ListItem, Box, Text, Heading, Button } from "@chakra-ui/react";
import { SquarePlus, FilePenLine, Trash2 } from "lucide-react";
import { EpisodeDTO } from "../../types/EpisodeDTO";

interface SeasonEntry {
  season: {
    id: string;
    seasonNumber: number;
    releaseYear: number;
    // egyéb szükséges mezők
  };
  episodes: EpisodeDTO[];
}

interface SeriesEpisodesProps {
  seasonsWithEpisodes: SeasonEntry[];
  isLoggedIn: boolean;
  onAddSeason: () => void; // Új prop
  onAddEpisode: (seasonId: string) => void;
  onEditEpisode: (episodeId: string) => void;
  onDeleteEpisode: (episodeId: string) => void;
  onEditSeason: (seasonId: string) => void;
  onDeleteSeason: (seasonId: string) => void;
  onWatchNow: (episodeId?: string) => void;
}

export const SeriesEpisodes: React.FC<SeriesEpisodesProps> = ({
  seasonsWithEpisodes,
  isLoggedIn,
  onAddSeason,
  onAddEpisode,
  onEditEpisode,
  onDeleteEpisode,
  onEditSeason,
  onDeleteSeason,
  onWatchNow,
}) => {
  return (
    <Box>
      <Heading size="md" mb={4}>
        Seasons &amp; Episodes
        {isLoggedIn && (
          <Button size="s" colorScheme="green" ml={2} onClick={onAddSeason}>
            <SquarePlus />
          </Button>
        )}
      </Heading>
      {seasonsWithEpisodes.length > 0 ? (
        <UnorderedList styleType="none" ml={0}>
          {seasonsWithEpisodes.map((entry) => {
            const { season, episodes } = entry;
            return (
              <ListItem key={season.id} border="1px solid #ccc" p={3} mb={4} borderRadius="md">
                <Box mb={2}>
                  <Text fontWeight="bold" display="inline-block" mr={2}>
                    Season {season.seasonNumber} ({season.releaseYear})
                  </Text>
                  {isLoggedIn && (
                    <>
                      <Button size="xs" color="green" mr={1} onClick={() => onAddEpisode(season.id)}>
                        <SquarePlus size={17} />
                      </Button>
                      <Button size="xs" color="orange" mr={2} onClick={() => onEditSeason(season.id)}>
                        <FilePenLine size={17} />
                      </Button>
                      <Button size="xs" color="red" onClick={() => onDeleteSeason(season.id)}>
                        <Trash2 size={17} />
                      </Button>
                    </>
                  )}
                </Box>
                {episodes.length > 0 ? (
                  <UnorderedList styleType="none" ml={4} fontWeight="semibold">
                    {episodes.map((ep) => (
                      <ListItem key={ep.id} mb={2} p={1} >
                        {isLoggedIn && (
                          <>
                            <Button size="xs" color="orange" mr={1} onClick={() => onEditEpisode(ep.id)}>
                              <FilePenLine size={13} />
                            </Button>
                            <Button size="xs" color="red" mr={1} onClick={() => onDeleteEpisode(ep.id)}>
                              <Trash2 size={13} />
                            </Button>
                          </>
                        )}
                        {ep.title}{" "}
                        <Button size="s" colorScheme="blue" p={1} ml={3} onClick={() => onWatchNow(ep.id)}>
                          Watch now
                        </Button>
                      </ListItem>
                    ))}
                  </UnorderedList>
                ) : (
                  <Text mt={2}>No episodes found for this season.</Text>
                )}
              </ListItem>
            );
          })}
        </UnorderedList>
      ) : (
        <Text>No seasons found for this series.</Text>
      )}
    </Box>
  );
};
