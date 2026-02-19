interface VideoMatchAndExtract {
  parseUrl(string: string): string | null;
}

export class VimeoVideoMatchAndExtract implements VideoMatchAndExtract {
  regex = /(http|https)?:\/\/(www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|)(\d+)(?:|\/\?)/i;
  urlCreate = (videoId: string) => `https://player.vimeo.com/video/${videoId}`;

  parseUrl(url: string): string | null {
    const match = url?.match(this.regex);
    if (match && match[4]) {
      return this.urlCreate(match[4]);
    }

    return null;
  }
}

export class YouTubeVideoMatchAndExtract implements VideoMatchAndExtract {
  regex =
    /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube(?:-nocookie)?\.com\/(?:.*?[?&]v=|embed\/|v\/|e\/|shorts\/|live\/|.*\/)|youtu\.be\/(?:.*\/)?)?([a-zA-Z0-9_-]{11})/i;
  urlCreate = (videoId: string) => `https://www.youtube.com/embed/${videoId}`;

  parseUrl(url: string): string | null {
    const match = url?.match(this.regex);
    if (match && match[1]) {
      return this.urlCreate(match[1]);
    }

    return null;
  }
}
