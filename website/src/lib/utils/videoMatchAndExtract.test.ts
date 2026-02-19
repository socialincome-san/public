import { VimeoVideoMatchAndExtract, YouTubeVideoMatchAndExtract } from './UrlVideoParser';

const YOUTUBE_TEST_CASES: { url: string; expectedId: string }[] = [
  { url: 'https://youtube.com/live/eLlxrBmD3H4', expectedId: 'eLlxrBmD3H4' },
  { url: 'https://www.youtube.com/live/eLlxrBmD3H4', expectedId: 'eLlxrBmD3H4' },
  { url: 'https://youtu.be/live/eLlxrBmD3H4', expectedId: 'eLlxrBmD3H4' },
  { url: 'https://youtube.com/shorts/FnURdCtTvTU?feature=share', expectedId: 'FnURdCtTvTU' },
  { url: 'http://www.youtube.com/watch?v=0zM4nApSvMg&feature=feedrec_grec_index', expectedId: '0zM4nApSvMg' },
  { url: 'http://www.youtube.com/user/SomeUser#p/a/u/1/QDK8U-VIH_o', expectedId: 'QDK8U-VIH_o' },
  { url: 'http://www.youtube.com/v/0zM4nApSvMg?fs=1&amp;hl=en_US&amp;rel=0', expectedId: '0zM4nApSvMg' },
  { url: 'http://www.youtube.com/watch?v=0zM4nApSvMg#t=0m10s', expectedId: '0zM4nApSvMg' },
  { url: 'http://www.youtube.com/embed/0zM4nApSvMg?rel=0', expectedId: '0zM4nApSvMg' },
  { url: 'http://www.youtube.com/watch?v=0zM4nApSvMg', expectedId: '0zM4nApSvMg' },
  { url: 'http://youtu.be/0zM4nApSvMg', expectedId: '0zM4nApSvMg' },
  { url: 'https://www.youtube.com/watch?v=nBuae6ilH24', expectedId: 'nBuae6ilH24' },
  { url: 'https://www.youtube.com/watch?v=pJegNopBLL8', expectedId: 'pJegNopBLL8' },
  { url: 'https://www.youtube.com/watch?v=_5BTo2oZ0SE', expectedId: '_5BTo2oZ0SE' },
  { url: 'https://m.youtube.com/watch?v=_5BTo2oZ0SE', expectedId: '_5BTo2oZ0SE' },
  { url: 'https://www.youtube.com/watch?v=DFYRQ_zQ-gk', expectedId: 'DFYRQ_zQ-gk' },
  { url: 'https://youtube.com/embed/DFYRQ_zQ-gk', expectedId: 'DFYRQ_zQ-gk' },
  { url: 'https://youtu.be/DFYRQ_zQ-gk', expectedId: 'DFYRQ_zQ-gk' },
  { url: 'https://www.youtube.com/HamdiKickProduction?v=DFYRQ_zQ-gk', expectedId: 'DFYRQ_zQ-gk' },
  { url: 'http://www.youtube.com/watch?v=dQw4w9WgXcQ', expectedId: 'dQw4w9WgXcQ' },
  { url: 'https://www.youtube.com/watch?v=EL-UCUAt8DQ', expectedId: 'EL-UCUAt8DQ' },
  { url: 'https://www.youtube-nocookie.com/embed/xHkq1edcbk4?rel=0', expectedId: 'xHkq1edcbk4' },
  { url: 'http://www.youtube.com/e/dQw4w9WgXcQ', expectedId: 'dQw4w9WgXcQ' },
  { url: 'http://www.youtube.com/v/dQw4w9WgXcQ', expectedId: 'dQw4w9WgXcQ' },
  { url: 'http://youtu.be/dQw4w9WgXcQ', expectedId: 'dQw4w9WgXcQ' },
];

describe('YouTube Video ID Extraction', () => {
  const matcher = new YouTubeVideoMatchAndExtract();
  YOUTUBE_TEST_CASES.forEach(({ url, expectedId }) => {
    test(`Extracts ID "${expectedId}" from "${url}"`, () => {
      const match = matcher.parseUrl(url);
      expect(match).toBe(matcher.urlCreate(expectedId));
    });
  });
});

const VIMEO_TEST_CASES: { url: string; expectedId: string | null }[] = [
  { url: 'https://vimeo.com/62092214', expectedId: '62092214' },
  { url: 'http://vimeo.com/62092214', expectedId: '62092214' },
  { url: 'https://www.vimeo.com/62092214', expectedId: '62092214' },
  { url: 'http://vimeo/62092214', expectedId: null },
  { url: 'http://vimeo.com/foo', expectedId: null },
  { url: 'https://vimeo.com/channels/documentaryfilm/128373915', expectedId: '128373915' },
  { url: 'https://vimeo.com/channels/foo-barr/documentaryfilm/128373915', expectedId: null },
  { url: 'https://vimeo.com/groups/musicvideo/videos/126199390', expectedId: '126199390' },
  { url: 'http://vimeo.com/groups/musicvideo/vid/126199390', expectedId: null },
  { url: 'https://vimeo.com/62092214?query=foo', expectedId: '62092214' },
  { url: 'https://vimeo.com.omomom/62092214?query=foo', expectedId: null },
];

describe('Vimeo Video ID Extraction', () => {
  const matcher = new VimeoVideoMatchAndExtract();
  VIMEO_TEST_CASES.forEach(({ url, expectedId }) => {
    test(`Extracts ID "${expectedId}" from "${url}"`, () => {
      const match = matcher.parseUrl(url);
      expect(match).toBe(expectedId == null ? null : matcher.urlCreate(expectedId));
    });
  });
});
