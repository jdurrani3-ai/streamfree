export type LiveChannel = {
  name: string;
  handle: string;
  short: string;
  category: string;
  url: string;
  thumbnail?: string;
};

export const LIVE_CHANNELS: LiveChannel[] = [
  { name: 'ESL Counter-Strike', handle: 'ESLCS', short: 'ESL', category: 'Gaming', url: 'https://www.youtube.com/@ESLCS/live', thumbnail: 'https://yt3.ggpht.com/0B4FwJgBAM3cotFdPkKrUIXCY2h-LrDfPhxn_7L-OY15RaHnkJu-de0qgLs5fnN334wEZu_xyQ=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'VALORANT Esports', handle: 'VALORANTesports', short: 'VCT', category: 'Gaming', url: 'https://www.youtube.com/@VALORANTesports/live', thumbnail: 'https://yt3.ggpht.com/qg3C4Bgjk5gclZdpX59zEBqwpygBM9uxgLwqJviZJVECyBBPp67y4cJzzfdw9uwsR1zbVlFKJw=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'Riot Games', handle: 'riotgames', short: 'RIOT', category: 'Gaming', url: 'https://www.youtube.com/@riotgames/live', thumbnail: 'https://yt3.ggpht.com/uQeiZ5G40rI7rrEG4urj11sQRHq84y46DDtETkk-m3b8aum9_dZhzrFBTkfLaz3VRceia5eG3Q=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'Nintendo', handle: 'Nintendo', short: 'NIN', category: 'Gaming', url: 'https://www.youtube.com/@Nintendo/live', thumbnail: 'https://yt3.ggpht.com/P-O3JrDilSaBfkexjAOCklwHhrrn7D-x6u0BYilVm3VsPCihOEJCJsIqDDaHOo4i2N0_-hvBato=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'Xbox', handle: 'Xbox', short: 'XBX', category: 'Gaming', url: 'https://www.youtube.com/@Xbox/live', thumbnail: 'https://yt3.ggpht.com/ndlP2Gt5UMeNinaydK6ohRYuKXESEWfH9V6JP8F5uZKIRxfAUDM_xFV7S7gbgeThBEpfeJ1R0w=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'PlayStation', handle: 'PlayStation', short: 'PS', category: 'Gaming', url: 'https://www.youtube.com/@PlayStation/live', thumbnail: 'https://yt3.ggpht.com/uiQh9JC7wAmCl63jhNilJvAcqNbwnMmUf5FUCQBecipe6yGmUWpPvAMVixALEt6xpPOVbsouzw=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'Typical Gamer', handle: 'TypicalGamer', short: 'TG', category: 'Gaming', url: 'https://www.youtube.com/@TypicalGamer/live', thumbnail: 'https://yt3.ggpht.com/PSMZ1Ddds0G-Lg-haNIYE83alFeL-LAFWeaPs36WsM1X3B6gW_89gfG4ONfCh53lvCcejNuQPw=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'Shroud', handle: 'shroud', short: 'SHR', category: 'Gaming', url: 'https://www.youtube.com/@shroud/live', thumbnail: 'https://yt3.ggpht.com/1JP91m1bN52qiUOGFIfHOHFSR62_Ll0FpYF4-UM2zFXv3V_azvHY3PT1sgfggzjNKxwqbulr=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'MrBeast Gaming', handle: 'MrBeastGaming', short: 'MRB', category: 'Gaming', url: 'https://www.youtube.com/@MrBeastGaming/live', thumbnail: 'https://yt3.ggpht.com/ytc/AIdro_lMiSL6eHqg2dVxvll6mVMeXo1qVak4TZ4_7mEWdobRRCk=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'PGL Esports', handle: 'PGLesports', short: 'PGL', category: 'Gaming', url: 'https://www.youtube.com/@PGLesports/live', thumbnail: 'https://yt3.ggpht.com/2lFnr0UcjgjiWrTWGGCVA7mSNbikuo11uUp85Xzx6vyxzWOK59CNDDaer0r5lWsae-lhXAQR8q8=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'River Monsters', handle: 'rivermonsters', short: 'RM', category: 'Nature & Wildlife', url: 'https://www.youtube.com/@rivermonsters/live', thumbnail: 'https://yt3.ggpht.com/D0C-PmCvuRZawBDvT6hQK-7SQpz_joA-pgOE5ApeRy1cvN-DKHgkDfEObuHgdmZq-RrUPxXcLQ=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'National Geographic', handle: 'NatGeo', short: 'NG', category: 'Nature & Wildlife', url: 'https://www.youtube.com/@NatGeo/live', thumbnail: 'https://yt3.ggpht.com/-FOFg8o1y4dAHDB2MvhORHnLMOaaOKnaNUNsrU-U57Eac6gjB5VO8sYJQC1KkULGQvKP2XpArA=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'Nat Geo Animals', handle: 'NatGeoAnimals', short: 'NGA', category: 'Nature & Wildlife', url: 'https://www.youtube.com/@NatGeoAnimals/live', thumbnail: 'https://yt3.ggpht.com/5mg7UqgDqCz6lKvMtVMRkAsv5krHFZvp9AM2_xN_07PtLPPuWgvff5x6tYXxL_wWQdtusf26Ag=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'Animal Planet', handle: 'animalplanet', short: 'AP', category: 'Nature & Wildlife', url: 'https://www.youtube.com/@animalplanet/live', thumbnail: 'https://yt3.ggpht.com/mgv0mC1bviOylGyuUOLveaJhWI1uGCaJ7gpLNAuIFtjcK_H13OsrKDIieTXYPnu7qpovt_peBA=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'Top Gear Classic', handle: 'TopGearClassic', short: 'TGC', category: 'Racing & Motors', url: 'https://www.youtube.com/@TopGearClassic/live', thumbnail: 'https://yt3.ggpht.com/Zbm4mW4V96K6krQPWdxwG875RuemWiZBSIllWXriYWVSru4IR6yVKAok0iOxdObeZfecXxUU=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'FloRacing', handle: 'floracing', short: 'FLO', category: 'Racing & Motors', url: 'https://www.youtube.com/@floracing/live', thumbnail: 'https://yt3.ggpht.com/O1Z4Onhuo5Cpawan_MWhQ-ypa8qAKMzWWjJhqsBD1Gfs_n0kkFJGnORL3m__AeJtMgSfHDm7-A=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'Speed — Harvick & Buxton', handle: 'SPEEDonFOX', short: 'SPD', category: 'Racing & Motors', url: 'https://www.youtube.com/@SPEEDonFOX/live', thumbnail: 'https://yt3.ggpht.com/6t_uL0YYYkUthmdxa7iAbiDH982uEVcitYJ69x-kVw9_THca9gGxNY-FxTQigciei5jghYgqxrw=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'H1 Unlimited', handle: 'H1Unlimited', short: 'H1', category: 'Racing & Motors', url: 'https://www.youtube.com/@H1Unlimited/live', thumbnail: 'https://yt3.ggpht.com/SGe6WKxt0WStV4qwyHWXr_2maEpy61EAVRIAwZgj3KFau4xdDtaJfRh1dS0MGlhRZ48DMr9ngHM=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'Travel Channel', handle: 'TravelChannel', short: 'TC', category: 'Travel', url: 'https://www.youtube.com/@TravelChannel/live', thumbnail: 'https://yt3.ggpht.com/ytc/AIdro_lMVV0eWXgxcwZUjjsc_HpTsLZugJaSPELWMBa47rzAaEGJ=s800-c-k-c0x00ffffff-no-rj' },
  { name: 'Interstellar News Hub', handle: 'InterstellarNewsHub', short: 'INH', category: 'Science & Space', url: 'https://www.youtube.com/@InterstellarNewsHub/live', thumbnail: 'https://yt3.ggpht.com/jnHcQ2Dq7sea7FwPZAlGKLW0eD7toE7YLGD2vLEARnLWepX4Edo83bqC1Et9zGW5c7AE_63O=s800-c-k-c0x00ffffff-no-rj' },
];

export const CATEGORIES = [
  { key: 'Gaming', emoji: '🎮' },
  { key: 'Nature & Wildlife', emoji: '🦁' },
  { key: 'Racing & Motors', emoji: '🏎️' },
  { key: 'Travel', emoji: '✈️' },
  { key: 'Science & Space', emoji: '🔭' },
];
