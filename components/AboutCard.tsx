import React from "react";

interface AboutProps {
  genres: string[];
  studios: string[];
  links: string[];
  mediaInfo: string;
}

const AboutCard: React.FC<AboutProps> = ({
  genres,
  studios,
  links,
  mediaInfo,
}) => {
  return (
    <div className="font-mont text-white py-8 px-4 rounded-lg">
      <div className="mb-4">
        <h3 className="text-gray-400 mb-1">Genres</h3>
        <p>{genres.length > 0 ? genres.join(", ") : "Not available"}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-gray-400 mb-1">Studios</h3>
        <p>{studios.length > 0 ? studios.join(", ") : "Not available"}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-gray-400 mb-1">Links</h3>
        {links && links.length > 0 ? (
          <div className="flex space-x-4">
            {links[1] && (
              <a
                href={links[1]}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                IMDB
              </a>
            )}
            {links[0] && (
              <a
                href={links[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                MovieDB
              </a>
            )}
          </div>
        ) : (
          <p>Not available</p>
        )}
      </div>

      <div>
        <h3 className="text-gray-400 mb-1">Media Info</h3>
        <p>{mediaInfo || "Not available"}</p>
      </div>
    </div>
  );
};

export default AboutCard;
