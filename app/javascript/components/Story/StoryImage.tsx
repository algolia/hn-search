import * as React from "react";

import { Hit } from "../../providers/Search.types";
import useIntersectionObserver from "../../utils/useIntersectionObserver";

interface StoryImageProps {
  objectID: Hit["objectID"];
}

const supportsLazyLoading = ((): boolean => {
  return "loading" in HTMLImageElement.prototype;
})();

const StoryImage: React.FC<StoryImageProps> = ({ objectID }) => {
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [imageSource, setImageSource] = React.useState<string>(null);

  const DEFAULT_PROPS: React.ImgHTMLAttributes<HTMLImageElement> = {
    // @ts-ignore
    loading: "lazy",
    alt: `Image thumbnail for result - ${objectID}`,
    src: `https://drcs9k8uelb9s.cloudfront.net/${objectID}.png`,
  };

  if (supportsLazyLoading) {
    return (
      <div className="Story_image">
        <img {...DEFAULT_PROPS} />
      </div>
    );
  }

  const isIntersecting = useIntersectionObserver(imageRef, {
    rootMargin: "60px",
    threshold: [0, 1],
  });

  React.useEffect(() => {
    if (!isIntersecting) return;
    setImageSource(`https://drcs9k8uelb9s.cloudfront.net/${objectID}.png`);
  }, [isIntersecting]);

  return (
    <div className="Story_image">
      {imageSource ? (
        <img
          ref={imageRef}
          src={imageSource}
          alt={`Image thumbnail for result - ${objectID}`}
        />
      ) : (
        <div ref={imageRef} />
      )}
    </div>
  );
};

export default StoryImage;
