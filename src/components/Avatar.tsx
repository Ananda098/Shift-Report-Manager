import React, { useState } from 'react';
import { Person } from '../types/report';

interface AvatarProps {
  person: Person;
  /** Size, background/ring, and text-size classes — the caller owns sizing since this is used at several scales. */
  className: string;
}

export function Avatar({ person, className }: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(person.avatarUrl) && !imgFailed;

  return (
    <span className={`flex items-center justify-center overflow-hidden rounded-full font-medium text-muted ${className}`}>
      {showImage ?
      <img
        src={person.avatarUrl}
        alt=""
        className="h-full w-full object-cover"
        onError={() => setImgFailed(true)} /> :


      person.initials}
    </span>);

}
