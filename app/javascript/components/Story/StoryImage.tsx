import * as React from "react";

import { Hit } from "../../providers/Search.types";
import useIntersectionObserver from "../../utils/useIntersectionObserver";

interface StoryImageProps {
  objectID: Hit["objectID"];
}

const StoryImage: React.FunctionComponent<StoryImageProps> = ({ objectID }) => {
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [imageSource, setImageSource] = React.useState<string>(null);

  const isIntersecting = useIntersectionObserver(imageRef, {
    rootMargin: "60px",
    threshold: [0, 1]
  });

  React.useEffect(() => {
    if (!isIntersecting) return;
    setImageSource(`https://drcs9k8uelb9s.cloudfront.net/${objectID}.png`);
  }, [isIntersecting]);

  return (
    <div className="Story_image">
      {imageSource ? (
        <img ref={imageRef} src={imageSource} alt="" />
      ) : (
        <div ref={imageRef} />
      )}
    </div>
  );
};

export default StoryImage;
